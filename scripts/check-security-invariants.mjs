import fs from 'node:fs';

const firestore = fs.readFileSync('firestore.rules', 'utf8');
const storage = fs.readFileSync('storage.rules', 'utf8');
const app = fs.readFileSync('src/App.tsx', 'utf8');
const types = fs.readFileSync('src/types.ts', 'utf8');
const avatarUploader = fs.readFileSync('src/components/CandidateAvatarUploader.tsx', 'utf8');
const postCandidate = fs.readFileSync('src/components/PostCandidateModal.tsx', 'utf8');
const footer = fs.readFileSync('src/components/Footer.tsx', 'utf8');
const postJob = fs.readFileSync('src/components/PostJobModal.tsx', 'utf8');
const communityJob = fs.readFileSync('src/components/CommunityJobModal.tsx', 'utf8');
const compliancePolicy = fs.readFileSync('public/compliance/index.html', 'utf8');
const firebaseJson = JSON.parse(fs.readFileSync('firebase.json', 'utf8'));
const firebaseRc = JSON.parse(fs.readFileSync('.firebaserc', 'utf8'));
const firebaseConfig = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));

const failures = [];
const requireText = (text, needle, label) => {
  if (!text.includes(needle)) failures.push(`missing: ${label}`);
};
const forbidText = (text, needle, label) => {
  if (text.includes(needle)) failures.push(`forbidden: ${label}`);
};

requireText(firestore, 'match /candidateOwners/{candidateId}', 'private candidateOwners collection rules');
requireText(firestore, 'data.schemaVersion == 3', 'candidate contact schema v3');
requireText(firestore, "!data.keys().hasAny(['userId', 'phoneE164'])", 'public contact sensitive-field deny guard');
requireText(firestore, "!incoming().keys().hasAny(['userEmail'])", 'new job userEmail deny guard');
requireText(firestore, "existing().phoneE164 == request.auth.token.phone_number", 'verified-phone reclaim guard');
requireText(firestore, "data.phoneVerified == candidateData(candidateId).phoneVerified", 'public/contact verification consistency');
forbidText(firestore, '[0-9]{8}  }', 'corrupted Saudi phone regex');

requireText(storage, 'match /candidate-avatars-v2/{candidateId}/{fileName}', 'UID-free avatar storage path');
requireText(storage, 'request.resource.metadata.ownerUid == request.auth.uid', 'avatar owner metadata check');
requireText(storage, 'resource.metadata.ownerUid == request.auth.uid', 'avatar owner read/delete check');

requireText(app, "doc(db, 'candidateOwners', candidateRef.id)", 'candidate ownership stored privately');
requireText(app, 'schemaVersion: 3', 'sanitized candidate contact payload');
requireText(avatarUploader, '`candidate-avatars-v2/${candidateId}/${Date.now()}.webp`', 'new avatar upload path hides UID');
forbidText(avatarUploader, '`candidate-avatars/${user.uid}/', 'new avatar upload path exposing UID');

forbidText(footer, 'منصة توظيف تقنية مرخصة ومطابقة للأنظمة', 'unsupported licensing/compliance claim');
requireText(footer, 'ليست مكتب استقدام أو شركة إسناد عمالي', 'footer platform-scope disclaimer');
requireText(postJob, 'EMPLOYER_COMPLIANCE_ATTESTATION', 'employer compliance attestation');
requireText(postJob, 'findJobComplianceIssue', 'direct job compliance screening');
requireText(communityJob, 'findJobComplianceIssue', 'community job compliance screening');
requireText(compliancePolicy, 'ليست جهة حكومية', 'public compliance policy government disclaimer');
requireText(compliancePolicy, 'بيع أو شراء التأشيرات', 'public policy prohibited visa trading');

requireText(firestore, "incoming().status == 'pending_review'", 'server-side pending review requirement');
requireText(firestore, "incoming().moderationStatus == 'pending'", 'server-side moderation state');
requireText(firestore, 'incoming().complianceAcceptedAt == request.time', 'server-timestamped compliance attestation');
requireText(firestore, 'function blockedJobText(text)', 'server-side prohibited job phrase screening');
requireText(firestore, 'function publicJobReadable(data)', 'pending jobs excluded from public reads');
requireText(app, "status: 'pending_review' as const", 'client submits direct jobs for review');
requireText(app, "where('status', '==', 'pending_review')", 'admin pending jobs queue');
requireText(app, 'onApprovePendingJob={handleApprovePendingJob}', 'admin approval action');
requireText(app, 'onRejectPendingJob={handleRejectPendingJob}', 'admin rejection action');

requireText(firestore, 'function allowedCandidateIqamaStatus(status)', 'server-side candidate residency allowlist');
forbidText(postCandidate, '<option value="تأشيرة زيارة / هوية زائر">', 'visitor residency option in candidate form');
forbidText(types, "| 'تأشيرة زيارة / هوية زائر'", 'visitor residency value in candidate type');
requireText(app, "!== 'تأشيرة زيارة / هوية زائر'", 'legacy visitor profiles hidden from public directory');

const expectedProject = firebaseConfig.projectId;
const expectedDatabase = 'ai-studio-22228db6-8ffe-450f-801f-19bd5ea8c9f0';
const firestoreTargets = Array.isArray(firebaseJson.firestore) ? firebaseJson.firestore : [firebaseJson.firestore];
const namedTarget = firestoreTargets.find(item => item?.database === expectedDatabase && item?.rules === 'firestore.rules');
if (!namedTarget) failures.push('missing: firebase.json named Firestore database -> firestore.rules binding');
if (firebaseRc.projects?.default !== expectedProject) failures.push('mismatch: .firebaserc default project does not match firebase-applet-config.json');
if (firebaseJson.storage?.rules !== 'storage.rules') failures.push('missing: firebase.json storage rules binding');

if (failures.length) {
  console.error('Security/compliance invariant check failed:');
  failures.forEach(item => console.error(`- ${item}`));
  process.exit(1);
}

console.log('Security, moderation, Firebase binding and compliance invariants verified.');
