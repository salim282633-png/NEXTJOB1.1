import fs from 'node:fs';

function patchFile(path, transform) {
  const before = fs.readFileSync(path, 'utf8');
  const after = transform(before);
  if (after === before) throw new Error(`No change produced for ${path}`);
  fs.writeFileSync(path, after, 'utf8');
}

patchFile('firestore.rules', s => {
  s = s.replace(
`    function publicCandidateReadable(data) {
      return data.schemaVersion == 2 &&
        data.isHidden == false &&
        !data.keys().hasAny(['phone', 'phoneE164', 'whatsapp', 'userEmail', 'userId']);
    }`,
`    function publicCandidateReadable(data) {
      // schemaVersion 2 public documents are written without contact/ownership
      // fields. Legacy pre-v2 documents remain outside this public query.
      return data.schemaVersion == 2 && data.isHidden == false;
    }`
  );

  s = s.replace(
`        candidateData(candidateId).allowContact == true &&
        data.schemaVersion == 3 &&
        !data.keys().hasAny(['userId', 'phoneE164']);`,
`        candidateData(candidateId).allowContact == true &&
        data.schemaVersion == 3 &&
        data.phoneVerified == candidateData(candidateId).phoneVerified &&
        !data.keys().hasAny(['userId', 'phoneE164']);`
  );

  s = s.replace(
`      allow get: if
        (existing().status != 'closed' && !existing().keys().hasAny(['userEmail'])) ||
        isAdmin() || ownsJob();

      allow list: if
        (existing().status != 'closed' && !existing().keys().hasAny(['userEmail'])) ||
        isAdmin() || ownsJob();`,
`      allow get: if existing().status != 'closed' || isAdmin() || ownsJob();

      // Queries remain compatible with Firestore's "rules are not filters"
      // model. Historical userEmail cleanup is performed by authenticated
      // owners/admins; all new writes reject that field below.
      allow list: if existing().status != 'closed' || isAdmin() || ownsJob();`
  );

  s = s.replace(
`          (ownsCandidate(candidateId) || ownsCandidateAfter(candidateId)) &&
          validContactState(incoming(), candidateId)
        ) ||`,
`          (ownsCandidate(candidateId) || ownsCandidateAfter(candidateId)) &&
          validContactState(incoming(), candidateId) &&
          existsAfter(/databases/$(database)/documents/candidates/$(candidateId)) &&
          getAfter(/databases/$(database)/documents/candidates/$(candidateId)).data.phoneVerified == incoming().phoneVerified &&
          verifiedPublicStateMatchesContact(candidateId, getAfter(/databases/$(database)/documents/candidates/$(candidateId)).data)
        ) ||`
  );

  return s;
});

patchFile('src/lib/firebase.ts', s => {
  const marker = `export async function sanitizeOwnedLegacyJobs(uid: string): Promise<void> {`;
  const idx = s.indexOf(marker);
  if (idx < 0) throw new Error('sanitizeOwnedLegacyJobs marker missing');
  const nextMarker = `\n\nfunction normalizeSaudiPhoneForOwnership`;
  const end = s.indexOf(nextMarker, idx);
  if (end < 0) throw new Error('normalizeSaudiPhoneForOwnership marker missing');
  const existing = s.slice(idx, end);
  const addition = `${existing}\n\nexport async function sanitizeLegacyJobsAsAdmin(): Promise<number> {\n  try {\n    const snapshot = await getDocs(query(collection(db, 'jobs'), limit(100)));\n    const legacy = snapshot.docs.filter(item => Object.prototype.hasOwnProperty.call(item.data(), 'userEmail'));\n    if (!legacy.length) return 0;\n    const batch = writeBatch(db);\n    legacy.forEach(item => batch.update(item.ref, { userEmail: deleteField() }));\n    await batch.commit();\n    return legacy.length;\n  } catch (error) {\n    console.warn('Unable to sanitize legacy job metadata as admin:', error);\n    return 0;\n  }\n}`;
  return s.slice(0, idx) + addition + s.slice(end);
});

patchFile('src/App.tsx', s => {
  s = s.replace(
`  OperationType,
  sanitizeOwnedLegacyJobs
} from './lib/firebase';`,
`  OperationType,
  sanitizeOwnedLegacyJobs,
  sanitizeLegacyJobsAsAdmin
} from './lib/firebase';`
  );

  const marker = `  useEffect(() => {\n    if (!isAdmin) setIsAdminSEOOpen(false);\n  }, [isAdmin]);`;
  const replacement = `${marker}\n\n  useEffect(() => {\n    if (!user || !isAdmin) return;\n    void sanitizeLegacyJobsAsAdmin();\n  }, [user?.uid, isAdmin]);`;
  if (!s.includes(marker)) throw new Error('admin effect marker missing');
  return s.replace(marker, replacement);
});

fs.rmSync('scripts/finalize-privacy-semantics-temp.mjs', { force: true });
fs.rmSync('.github/workflows/finalize-privacy-semantics-temp.yml', { force: true });
console.log('Privacy semantics finalized.');