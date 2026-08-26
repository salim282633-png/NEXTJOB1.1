import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { SAUDI_GUIDE_ARTICLES } from '../src/lib/data.ts';

const ROOT = process.cwd();
const JOBS_FILE = path.join(ROOT, 'public/jobs/external-jobs.json');
const ARTICLES_FILE = path.join(ROOT, 'public/guide/articles.json');
const FIREBASE_CONFIG_FILE = path.join(ROOT, 'firebase-applet-config.json');
const DATABASE_ID = 'ai-studio-22228db6-8ffe-450f-801f-19bd5ea8c9f0';
const MAX_WRITES_PER_COMMIT = 400;

const args = new Set(process.argv.slice(2));
const syncJobs = args.has('--jobs') || args.has('--all') || args.size === 0;
const syncArticles = args.has('--articles') || args.has('--all') || args.size === 0;

interface ServiceAccount {
  client_email: string;
  private_key: string;
  project_id?: string;
  token_uri?: string;
}

interface GeneratedArticleMeta {
  slug: string;
  title: string;
  description: string;
  keyword: string;
  publishedDate: string;
  city?: string | null;
  profession?: string | null;
  [key: string]: unknown;
}

function readJson<T>(file: string, fallback: T): T {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8')) as T;
  } catch {
    return fallback;
  }
}

function loadServiceAccount(): ServiceAccount | null {
  const inline = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim();
  if (inline) {
    try {
      return JSON.parse(inline) as ServiceAccount;
    } catch (error) {
      throw new Error(`FIREBASE_SERVICE_ACCOUNT_JSON is not valid JSON: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS?.trim();
  if (credentialsPath && fs.existsSync(credentialsPath)) {
    return readJson<ServiceAccount | null>(credentialsPath, null);
  }

  return null;
}

function base64Url(value: string | Buffer): string {
  return Buffer.from(value).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

async function createAccessToken(serviceAccount: ServiceAccount): Promise<string> {
  if (!serviceAccount.client_email || !serviceAccount.private_key) {
    throw new Error('Service account must contain client_email and private_key.');
  }

  const now = Math.floor(Date.now() / 1000);
  const tokenUri = serviceAccount.token_uri || 'https://oauth2.googleapis.com/token';
  const header = base64Url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const payload = base64Url(JSON.stringify({
    iss: serviceAccount.client_email,
    scope: 'https://www.googleapis.com/auth/datastore',
    aud: tokenUri,
    iat: now,
    exp: now + 3600
  }));
  const unsigned = `${header}.${payload}`;
  const signature = crypto.sign('RSA-SHA256', Buffer.from(unsigned), serviceAccount.private_key);
  const assertion = `${unsigned}.${base64Url(signature)}`;

  const response = await fetch(tokenUri, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion
    })
  });

  if (!response.ok) {
    throw new Error(`OAuth token exchange failed: HTTP ${response.status} ${await response.text()}`);
  }

  const json = await response.json() as { access_token?: string };
  if (!json.access_token) throw new Error('OAuth token response did not contain access_token.');
  return json.access_token;
}

function firestoreValue(value: unknown): Record<string, unknown> {
  if (value === null) return { nullValue: null };
  if (typeof value === 'string') return { stringValue: value };
  if (typeof value === 'boolean') return { booleanValue: value };
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) return { nullValue: null };
    return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
  }
  if (Array.isArray(value)) {
    return { arrayValue: { values: value.map(item => firestoreValue(item)) } };
  }
  if (typeof value === 'object' && value) {
    const fields: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
      if (item === undefined) continue;
      fields[key] = firestoreValue(item);
    }
    return { mapValue: { fields } };
  }
  return { nullValue: null };
}

function firestoreFields(value: Record<string, unknown>): Record<string, unknown> {
  const fields: Record<string, unknown> = {};
  for (const [key, item] of Object.entries(value)) {
    if (item === undefined) continue;
    fields[key] = firestoreValue(item);
  }
  return fields;
}

function cleanDocumentId(value: unknown): string {
  return String(value || '').trim().replace(/\//g, '-').slice(0, 500);
}

function projectDocumentName(projectId: string, collectionName: string, documentId: string): string {
  return `projects/${projectId}/databases/${DATABASE_ID}/documents/${collectionName}/${cleanDocumentId(documentId)}`;
}

async function firestoreRequest(token: string, url: string, init: RequestInit = {}): Promise<Response> {
  const response = await fetch(url, {
    ...init,
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
      ...(init.headers || {})
    }
  });
  return response;
}

async function listDocumentIds(token: string, projectId: string, collectionName: string): Promise<Set<string>> {
  const ids = new Set<string>();
  let pageToken = '';
  do {
    const params = new URLSearchParams({ pageSize: '300', mask: 'name' });
    if (pageToken) params.set('pageToken', pageToken);
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${DATABASE_ID}/documents/${collectionName}?${params}`;
    const response = await firestoreRequest(token, url, { method: 'GET' });
    if (response.status === 404) return ids;
    if (!response.ok) throw new Error(`Unable to list ${collectionName}: HTTP ${response.status} ${await response.text()}`);
    const json = await response.json() as { documents?: Array<{ name?: string }>; nextPageToken?: string };
    for (const document of json.documents || []) {
      const id = document.name?.split('/').pop();
      if (id) ids.add(id);
    }
    pageToken = json.nextPageToken || '';
  } while (pageToken);
  return ids;
}

async function commitWrites(token: string, projectId: string, writes: Array<Record<string, unknown>>): Promise<void> {
  for (let index = 0; index < writes.length; index += MAX_WRITES_PER_COMMIT) {
    const chunk = writes.slice(index, index + MAX_WRITES_PER_COMMIT);
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${DATABASE_ID}/documents:commit`;
    const response = await firestoreRequest(token, url, {
      method: 'POST',
      body: JSON.stringify({ writes: chunk })
    });
    if (!response.ok) throw new Error(`Firestore commit failed: HTTP ${response.status} ${await response.text()}`);
  }
}

async function mirrorCollection(
  token: string,
  projectId: string,
  collectionName: string,
  documents: Array<{ id: string; data: Record<string, unknown> }>
): Promise<{ upserts: number; deletes: number }> {
  const currentIds = await listDocumentIds(token, projectId, collectionName);
  const nextIds = new Set(documents.map(document => cleanDocumentId(document.id)).filter(Boolean));
  const writes: Array<Record<string, unknown>> = [];

  for (const document of documents) {
    const id = cleanDocumentId(document.id);
    if (!id) continue;
    writes.push({
      update: {
        name: projectDocumentName(projectId, collectionName, id),
        fields: firestoreFields(document.data)
      }
    });
  }

  let deletes = 0;
  for (const id of currentIds) {
    if (nextIds.has(id)) continue;
    writes.push({ delete: projectDocumentName(projectId, collectionName, id) });
    deletes += 1;
  }

  if (writes.length) await commitWrites(token, projectId, writes);
  return { upserts: documents.length, deletes };
}

function loadPublicJobs(): Array<{ id: string; data: Record<string, unknown> }> {
  const jobs = readJson<unknown[]>(JOBS_FILE, []);
  const syncedAt = new Date().toISOString();
  return jobs
    .filter((job): job is Record<string, unknown> => Boolean(job && typeof job === 'object' && !Array.isArray(job)))
    .map(job => ({
      id: cleanDocumentId(job.id),
      data: {
        ...job,
        status: 'active',
        sourceType: 'external',
        storageVersion: 1,
        persistedAt: syncedAt
      }
    }))
    .filter(document => Boolean(document.id));
}

function loadPublishedArticles(): Array<{ id: string; data: Record<string, unknown> }> {
  const syncedAt = new Date().toISOString();
  const documents: Array<{ id: string; data: Record<string, unknown> }> = [];

  for (const article of SAUDI_GUIDE_ARTICLES) {
    documents.push({
      id: article.id,
      data: {
        ...article,
        articleType: 'core-guide',
        status: 'published',
        canonicalPath: '/?view=guide',
        storageVersion: 1,
        persistedAt: syncedAt
      }
    });
  }

  const generated = readJson<GeneratedArticleMeta[]>(ARTICLES_FILE, []);
  for (const article of generated) {
    if (!article?.slug) continue;
    const htmlFile = path.join(ROOT, 'public/guide', article.slug, 'index.html');
    const bodyHtml = fs.existsSync(htmlFile) ? fs.readFileSync(htmlFile, 'utf8') : '';
    documents.push({
      id: article.slug,
      data: {
        ...article,
        id: article.slug,
        articleType: 'generated-seo',
        status: 'published',
        canonicalPath: `/guide/${article.slug}/`,
        contentFormat: 'html',
        bodyHtml,
        storageVersion: 1,
        persistedAt: syncedAt
      }
    });
  }

  return documents;
}

async function main() {
  const serviceAccount = loadServiceAccount();
  if (!serviceAccount) {
    console.log('Firestore content sync skipped: configure FIREBASE_SERVICE_ACCOUNT_JSON or GOOGLE_APPLICATION_CREDENTIALS.');
    return;
  }

  const firebaseConfig = readJson<{ projectId?: string }>(FIREBASE_CONFIG_FILE, {});
  const projectId = serviceAccount.project_id || firebaseConfig.projectId;
  if (!projectId) throw new Error('Firebase projectId is missing.');
  if (firebaseConfig.projectId && serviceAccount.project_id && firebaseConfig.projectId !== serviceAccount.project_id) {
    throw new Error(`Service account project ${serviceAccount.project_id} does not match configured Firebase project ${firebaseConfig.projectId}.`);
  }

  const token = await createAccessToken(serviceAccount);

  if (syncJobs) {
    const jobs = loadPublicJobs();
    const result = await mirrorCollection(token, projectId, 'publicJobs', jobs);
    console.log(`Firestore publicJobs synchronized: ${result.upserts} active job(s), ${result.deletes} stale document(s) removed.`);
  }

  if (syncArticles) {
    const articles = loadPublishedArticles();
    const result = await mirrorCollection(token, projectId, 'articles', articles);
    console.log(`Firestore articles synchronized: ${result.upserts} published article(s), ${result.deletes} stale document(s) removed.`);
  }
}

main().catch(error => {
  console.error('Firestore content sync failed:', error);
  process.exit(1);
});
