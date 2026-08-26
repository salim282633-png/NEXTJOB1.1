import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from './firebase';

let installed = false;

function requestPath(input: RequestInfo | URL): string {
  try {
    const raw = typeof input === 'string'
      ? input
      : input instanceof URL
        ? input.toString()
        : input.url;
    return new URL(raw, window.location.origin).pathname.replace(/\/+$/, '') || '/';
  } catch {
    return '';
  }
}

function jsonResponse(value: unknown): Response {
  return new Response(JSON.stringify(value), {
    status: 200,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store'
    }
  });
}

async function loadJobsFromFirestore(): Promise<Response> {
  const snapshot = await getDocs(query(
    collection(db, 'publicJobs'),
    where('status', '==', 'active'),
    where('sourceType', '==', 'external')
  ));

  const jobs = snapshot.docs.map(document => ({ id: document.id, ...document.data() }));
  return jsonResponse(jobs);
}

async function loadArticleIndexFromFirestore(): Promise<Response | null> {
  const snapshot = await getDocs(query(
    collection(db, 'articles'),
    where('status', '==', 'published')
  ));

  if (snapshot.empty) return null;

  const generated = snapshot.docs
    .map(document => ({ id: document.id, ...document.data() }) as Record<string, unknown>)
    .filter(article => article.articleType === 'generated-seo' && typeof article.slug === 'string')
    .map(article => ({
      slug: String(article.slug),
      title: String(article.title || ''),
      description: String(article.description || ''),
      keyword: String(article.keyword || ''),
      publishedDate: String(article.publishedDate || ''),
      city: typeof article.city === 'string' ? article.city : null,
      profession: typeof article.profession === 'string' ? article.profession : null
    }))
    .sort((a, b) => b.publishedDate.localeCompare(a.publishedDate));

  return jsonResponse(generated);
}

/**
 * Transitional compatibility bridge:
 * existing UI code keeps requesting the static content URLs, while this layer
 * serves the same JSON shape from Firestore first. If Firestore is unavailable
 * or its rules have not been deployed yet, the original static JSON remains a
 * safe read-only fallback for continuity and SEO deployments.
 */
export function installFirestoreContentBridge(): void {
  if (installed || typeof window === 'undefined') return;
  installed = true;

  const nativeFetch = window.fetch.bind(window);
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const method = input instanceof Request ? input.method : init?.method || 'GET';
    if (method.toUpperCase() !== 'GET') return nativeFetch(input, init);

    const path = requestPath(input);

    if (path === '/jobs/external-jobs.json') {
      try {
        return await loadJobsFromFirestore();
      } catch (error) {
        console.warn('Firestore publicJobs unavailable; using static jobs cache.', error);
        return nativeFetch(input, init);
      }
    }

    if (path === '/guide/articles.json') {
      try {
        const response = await loadArticleIndexFromFirestore();
        if (response) return response;
      } catch (error) {
        console.warn('Firestore articles unavailable; using static article index.', error);
      }
      return nativeFetch(input, init);
    }

    return nativeFetch(input, init);
  };
}
