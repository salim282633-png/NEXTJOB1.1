import fs from 'node:fs';

const read = path => fs.readFileSync(path, 'utf8');
const app = read('src/App.tsx');
const navbar = read('src/components/Navbar.tsx');
const jobList = read('src/components/JobList.tsx');
const jobCard = read('src/components/JobCard.tsx');
const jobDetail = read('src/components/JobDetailModal.tsx');
const footer = read('src/components/Footer.tsx');
const complianceMode = read('src/lib/complianceMode.ts');
const googleProduction = read('src/lib/googleProduction.ts');
const firestore = read('firestore-content-hub.rules');
const storage = read('storage.rules');
const externalValidator = read('scripts/validate-external-jobs.mjs');
const externalJobs = JSON.parse(read('public/jobs/external-jobs.json'));
const firebaseJson = JSON.parse(read('firebase.json'));
const firebaseRc = JSON.parse(read('.firebaserc'));
const firebaseConfig = JSON.parse(read('firebase-applet-config.json'));

const failures = [];
const requireText = (text, needle, label) => {
  if (!text.includes(needle)) failures.push(`missing: ${label}`);
};
const forbidText = (text, needle, label) => {
  if (text.includes(needle)) failures.push(`forbidden: ${label}`);
};

// Public product mode must remain content-first and external-source only.
requireText(complianceMode, 'contentHubHomepage: true', 'content-hub homepage mode');
requireText(complianceMode, 'externalJobsOnly: true', 'external-jobs-only mode');
for (const flag of [
  'employerJobPosting: false',
  'internalApplications: false',
  'candidateDirectory: false',
  'candidatePublishing: false',
  'cvServices: false',
  'communityJobSubmissions: false',
  'commercialAds: false'
]) requireText(complianceMode, flag, `disabled feature flag ${flag}`);

// The public app must not depend on Firestore/auth recruitment flows.
requireText(app, "fetch('/jobs/external-jobs.json'", 'external jobs feed fetch');
requireText(app, "sourceType: 'external'", 'external source normalization');
requireText(app, 'sourceUrl', 'source URL normalization');
requireText(app, 'applyUrl', 'external application URL normalization');
for (const forbidden of [
  "from 'firebase/",
  'PostJobModal',
  'PostCandidateModal',
  'CandidatesDirectory',
  'FreeCVGeneratorModal',
  'JobApplicationAction',
  'CommunityJobModal',
  'AuthModal'
]) forbidText(app, forbidden, `public App recruitment feature ${forbidden}`);

forbidText(navbar, 'أعلن عن وظيفة', 'public employer-posting CTA');
forbidText(navbar, 'أنشئ ملفك', 'public candidate-publishing CTA');
requireText(navbar, 'التقديم يتم لدى المصدر الأصلي', 'source-application navbar disclosure');

requireText(jobList, "job.sourceType !== 'external'", 'job list external-only filter');
requireText(jobList, 'job.sourceName', 'job list source requirement');
requireText(jobList, 'job.sourceUrl', 'job list source URL requirement');
requireText(jobList, 'job.applyUrl', 'job list application URL requirement');
forbidText(jobList, 'JobApplicationAction', 'internal application component in jobs list');
forbidText(jobList, 'AdSenseSlot', 'commercial advertising in jobs list');
forbidText(jobList, 'onOpenPostJob', 'employer-posting callback in jobs list');

requireText(jobCard, 'job.applyUrl', 'job card external application link');
requireText(jobCard, 'job.sourceName', 'job card source label');
forbidText(jobCard, 'wa.me', 'direct WhatsApp application in job card');
forbidText(jobCard, 'onQuickWhatsApp', 'direct WhatsApp callback in job card');
requireText(jobDetail, 'التقديم عبر المصدر الأصلي', 'job detail source application CTA');
forbidText(jobDetail, 'wa.me', 'direct WhatsApp application in job detail');
forbidText(jobDetail, 'tel:', 'direct phone application in job detail');
forbidText(jobDetail, 'onOpenAICoverLetterForJob', 'internal application-message generator in job detail');

requireText(footer, 'خدمات إعداد أو بيع السير الذاتية والإعلانات التجارية المدفوعة متوقفة حاليًا', 'CV/paid-ads suspension disclosure');
requireText(footer, 'لا نستقبل طلبات التوظيف نيابة عن أصحاب العمل', 'non-intermediation disclosure');
forbidText(footer, 'صانع السيرة الذاتية', 'public CV service link');
forbidText(footer, 'شارك فرصة رأيتها للمراجعة', 'public community-submission link');

// Paid advertising must not be loadable by environment configuration.
requireText(googleProduction, 'adsEnabled: false', 'hard-disabled commercial ads');
requireText(googleProduction, "adsenseClient: ''", 'empty AdSense client');
forbidText(googleProduction, 'googlesyndication.com', 'AdSense script loader');
forbidText(googleProduction, 'VITE_ADSENSE', 'environment re-enable path for AdSense');

// External jobs must carry auditable source/application metadata.
for (const required of ['sourceName', 'sourceUrl', 'applyUrl', 'sourcePublishedAt']) {
  requireText(externalValidator, `'${required}'`, `external validator field ${required}`);
}
requireText(externalValidator, "parsed.protocol !== 'https:'", 'HTTPS-only external source links');
requireText(externalValidator, "job.sourceType !== 'external'", 'external sourceType validation');
if (!Array.isArray(externalJobs)) failures.push('external jobs feed is not an array');

// Firestore is decommissioned from public recruitment operations. Historic
// records are retained for owner/admin reads and administrative cleanup only.
requireText(firestore, 'match /jobs/{jobId}', 'strict legacy jobs rules');
requireText(firestore, 'allow create: if false; // Direct employer/community publishing is paused.', 'direct job creation deny');
requireText(firestore, 'match /applications/{applicationId}', 'strict applications rules');
requireText(firestore, 'allow create, update, delete: if false;', 'application/client write deny');
requireText(firestore, 'match /candidates/{candidateId}', 'strict candidate rules');
requireText(firestore, 'Candidate publishing and the public candidate directory are paused.', 'candidate directory suspension guard');
requireText(firestore, 'match /candidateContacts/{candidateId}', 'private legacy candidate contacts');
requireText(firestore, 'match /communitySubmissions/{submissionId}', 'community submission rules');
requireText(firestore, 'Community-supplied job leads are paused', 'community publishing suspension guard');
requireText(firestore, 'match /{document=**}', 'default Firestore deny');
requireText(firestore, 'allow read, write: if false;', 'default Firestore deny policy');

// Keep the existing UID-free avatar rule even though candidate publishing is paused.
requireText(storage, 'match /candidate-avatars-v2/{candidateId}/{fileName}', 'UID-free avatar storage path');
requireText(storage, 'request.resource.metadata.ownerUid == request.auth.uid', 'avatar ownership metadata guard');

// Verify Firebase deploy targets the strict ruleset for the actual named DB.
const expectedProject = firebaseConfig.projectId;
const expectedDatabase = 'ai-studio-22228db6-8ffe-450f-801f-19bd5ea8c9f0';
const firestoreTargets = Array.isArray(firebaseJson.firestore) ? firebaseJson.firestore : [firebaseJson.firestore];
const namedTarget = firestoreTargets.find(item => item?.database === expectedDatabase && item?.rules === 'firestore-content-hub.rules');
if (!namedTarget) failures.push('missing: named Firestore database -> firestore-content-hub.rules binding');
if (firebaseRc.projects?.default !== expectedProject) failures.push('mismatch: .firebaserc default project does not match firebase-applet-config.json');
if (firebaseJson.storage?.rules !== 'storage.rules') failures.push('missing: firebase.json storage rules binding');

if (failures.length) {
  console.error('Content-hub security/compliance invariant check failed:');
  failures.forEach(item => console.error(`- ${item}`));
  process.exit(1);
}

console.log('Content-hub, external-source, Firebase binding and no-paid-ads invariants verified.');
