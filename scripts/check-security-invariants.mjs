import fs from 'node:fs';

const firestore = fs.readFileSync('firestore.rules', 'utf8');
const storage = fs.readFileSync('storage.rules', 'utf8');
const app = fs.readFileSync('src/App.tsx', 'utf8');
const avatarUploader = fs.readFileSync('src/components/CandidateAvatarUploader.tsx', 'utf8');
const footer = fs.readFileSync('src/components/Footer.tsx', 'utf8');
const postJob = fs.readFileSync('src/components/PostJobModal.tsx', 'utf8');
const communityJob = fs.readFileSync('src/components/CommunityJobModal.tsx', 'utf8');
const compliancePolicy = fs.readFileSync('public/compliance/index.html', 'utf8');

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

if (failures.length) {
  console.error('Security/compliance invariant check failed:');
  failures.forEach(item => console.error(`- ${item}`));
  process.exit(1);
}

console.log('Security and compliance invariants verified.');
