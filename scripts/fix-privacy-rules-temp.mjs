import fs from 'node:fs';

const path = 'firestore.rules';
let lines = fs.readFileSync(path, 'utf8').split('\n');

function replaceCorruptedPhoneGuard(startNeedle, correctedLine) {
  const start = lines.findIndex(line => line.includes(startNeedle));
  if (start < 0) throw new Error(`Missing phone guard: ${startNeedle}`);
  const end = lines.findIndex((line, index) => index > start && line.includes('incoming().phoneVerified is bool'));
  if (end < 0) throw new Error(`Missing phoneVerified guard after: ${startNeedle}`);
  lines.splice(start, end - start, correctedLine);
}

replaceCorruptedPhoneGuard(
  "incoming().phoneE164.matches('^\\+9665[0-9]{8}",
  "        incoming().phoneE164.matches('^\\\\+9665[0-9]{8}$') &&"
);
replaceCorruptedPhoneGuard(
  "(incoming().phoneE164 == '' || incoming().phoneE164.matches('^\\+9665[0-9]{8}",
  "          (incoming().phoneE164 == '' || incoming().phoneE164.matches('^\\\\+9665[0-9]{8}$')) &&"
);

let s = lines.join('\n');

// Verified holder of the exact Saudi phone may query only matching stale owner
// claims so reclaim can revoke them. This is not a public list permission.
const oldListRule = "allow list: if isAdmin() || (isSignedIn() && existing().userId == request.auth.uid);";
const newListRule = "allow list: if\n        isAdmin() ||\n        (isSignedIn() && existing().userId == request.auth.uid) ||\n        (hasVerifiedSaudiPhone() && existing().phoneE164 == request.auth.token.phone_number);";
if (!s.includes(oldListRule) && !s.includes('existing().phoneE164 == request.auth.token.phone_number')) {
  throw new Error('candidateOwners list rule not found');
}
s = s.replace(oldListRule, newListRule);

if (s.includes('[0-9]{8}  }')) throw new Error('Corrupted phone regex still present');
if (!s.includes("incoming().phoneE164.matches('^\\\\+9665[0-9]{8}$')")) throw new Error('Expected create phone regex missing');
if (!s.includes("existing().phoneE164 == request.auth.token.phone_number")) throw new Error('Verified reclaim list guard missing');

fs.writeFileSync(path, s, 'utf8');
fs.rmSync('scripts/fix-privacy-rules-temp.mjs', { force: true });
fs.rmSync('.github/workflows/fix-privacy-rules-temp.yml', { force: true });
console.log('Privacy rule correction applied.');