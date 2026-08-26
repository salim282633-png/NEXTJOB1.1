# Firebase rules rollout for NEXT JOB moderation

This change must be rolled out atomically with the matching application build.

## Target

- Firebase project: `gen-lang-client-0383747817`
- Firestore database: `ai-studio-22228db6-8ffe-450f-801f-19bd5ea8c9f0`
- Rules file: `firestore.rules`
- CLI binding: `firebase.json` + `.firebaserc`

## Why rollout order matters

The new application writes employer jobs with `status = pending_review` and requires admin approval before public visibility. The new rules require the same state. Deploying only one side can temporarily reject new job submissions.

## Verified pre-merge checks

CI starts the Firestore emulator with Firebase CLI and Java 21, which compiles and loads `firestore.rules`. CI also runs security/compliance invariants, TypeScript validation, npm audit and the production build.

## Production activation

Use an authenticated Firebase CLI session or CI service account with permission to update Firestore rules. Deploy the rules for the configured named database, then activate the matching application revision without modifying the rule/database identifiers above.

Do not substitute `(default)` for the named database.
