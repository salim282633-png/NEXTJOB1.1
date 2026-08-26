import fs from 'node:fs';

const path = 'firestore.rules';
let s = fs.readFileSync(path, 'utf8');

// Repair the regex text corrupted by replacement-string $' semantics.
s = s.replaceAll("incoming().phoneE164.matches('^\\+9665[0-9]{8}  }\n}\n) &&", "incoming().phoneE164.matches('^\\\\+9665[0-9]{8}$') &&");
s = s.replaceAll("incoming().phoneE164.matches('^\\+9665[0-9]{8}  }\n}\n)) &&", "incoming().phoneE164.matches('^\\\\+9665[0-9]{8}$')) &&");

// Verified holder of the exact Saudi phone may query only matching stale owner
// claims so reclaim can revoke them. This is not a public list permission.
s = s.replace(
  "allow list: if isAdmin() || (isSignedIn() && existing().userId == request.auth.uid);",
  "allow list: if\n        isAdmin() ||\n        (isSignedIn() && existing().userId == request.auth.uid) ||\n        (hasVerifiedSaudiPhone() && existing().phoneE164 == request.auth.token.phone_number);"
);

if (s.includes("[0-9]{8}  }")) throw new Error('Corrupted phone regex still present');
if (!s.includes("incoming().phoneE164.matches('^\\\\+9665[0-9]{8}$')")) throw new Error('Expected create phone regex missing');
if (!s.includes("existing().phoneE164 == request.auth.token.phone_number")) throw new Error('Verified reclaim list guard missing');

fs.writeFileSync(path, s, 'utf8');
fs.rmSync('scripts/fix-privacy-rules-temp.mjs', { force: true });
fs.rmSync('.github/workflows/fix-privacy-rules-temp.yml', { force: true });
console.log('Privacy rule correction applied.');