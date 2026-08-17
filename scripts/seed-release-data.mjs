/**
 * GS MTR — Seed the release config (appConfig/android) demo data.
 *
 * Writes the demo release document the APK update system reads at startup.
 * Values default to `firebase-seed/release-config.json` and can be overridden
 * per field.
 *
 * Usage:
 *   # 1) Local Firestore emulator (no credentials needed):
 *   firebase emulators:exec "node scripts/seed-release-data.mjs" --only firestore
 *
 *   # 2) Real Firebase project (needs a service account JSON, gitignored):
 *   FIREBASE_SERVICE_ACCOUNT=/path/to/key.json \
 *     node scripts/seed-release-data.mjs --project pabx-mtr
 *
 * Options:
 *   --check              read + print the current appConfig/android (no write)
 *   --version <x.y.z>    override latestVersion + minimumVersion (and by default the apkUrl)
 *   --min-version <x.y.z> override minimumVersion only
 *   --apk-url <url>      override the APK download URL
 *   --version-code <n>   override versionCode
 *   --notes "<text>"     override releaseNotes
 *   --project <id>       Firebase project id (defaults to service account / pabx-mtr)
 */
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// --- Args -------------------------------------------------------------------

const args = process.argv.slice(2);
function flag(name) {
  const i = args.indexOf(name);
  return i !== -1 && i + 1 < args.length ? args[i + 1] : undefined;
}
const opts = {
  check: args.includes('--check'),
  version: flag('--version'),
  minVersion: flag('--min-version'),
  apkUrl: flag('--apk-url'),
  versionCode: flag('--version-code'),
  notes: flag('--notes'),
  project: flag('--project'),
};

// --- Seed values -------------------------------------------------------------

const seed = JSON.parse(fs.readFileSync(path.join(ROOT, 'firebase-seed', 'release-config.json'), 'utf8'));

const data = {
  latestVersion: (opts.version ?? seed.latestVersion).trim(),
  minimumVersion: (opts.minVersion ?? opts.version ?? seed.minimumVersion).trim(),
  apkUrl: (opts.apkUrl ?? seed.apkUrl).trim(),
  releaseNotes: (opts.notes ?? seed.releaseNotes).replace(/\\n/g, '\n'),
};
if (opts.versionCode !== undefined) {
  data.versionCode = Number(opts.versionCode);
} else if (typeof seed.versionCode === 'number') {
  data.versionCode = seed.versionCode;
}

// --- Admin app ----------------------------------------------------------------

const emulatorHost = process.env.FIRESTORE_EMULATOR_HOST;
let projectId = opts.project;
let adminApp;

if (emulatorHost) {
  projectId = projectId || 'pabx-mtr';
  adminApp = initializeApp({ projectId }); // emulators need no credentials
  console.log(`[SEED] Emulator mode -> ${emulatorHost}`);
} else {
  const saPath =
    process.env.FIREBASE_SERVICE_ACCOUNT ||
    fs.readdirSync(ROOT).find((n) => /firebase-adminsdk|service-account|serviceAccount/i.test(n));
  if (!saPath) {
    console.error(
      '[ERROR] No credentials found.\n' +
        '        For the local emulator: firebase emulators:exec "node scripts/seed-release-data.mjs" --only firestore\n' +
        '        For the real project:  set FIREBASE_SERVICE_ACCOUNT=/path/to/key.json (see GS_MTR_RELEASE.md).'
    );
    process.exit(1);
  }
  const account = JSON.parse(fs.readFileSync(path.resolve(ROOT, saPath), 'utf8'));
  adminApp = initializeApp({ projectId: projectId || account.project_id, credential: cert(account) });
  console.log(`[SEED] Real project using service account: ${path.basename(saPath)}`);
}

const db = getFirestore(adminApp);
const ref = db.doc('appConfig/android');

// --- Check mode ----------------------------------------------------------------

if (opts.check) {
  const snap = await ref.get();
  console.log(snap.exists ? JSON.stringify(snap.data(), null, 2) : '[INFO] appConfig/android does not exist yet.');
  await adminApp.delete();
  process.exit(0);
}

// --- Write ---------------------------------------------------------------------

console.log(`\n[SEED] Writing appConfig/android @ ${projectId}:`);
console.log(JSON.stringify(data, null, 2));

await ref.set(data);

const verify = await ref.get();
console.log('\n[VERIFY] Read back from Firestore:');
console.log(JSON.stringify(verify.data(), null, 2));
console.log('\n[OK] Release demo data seeded. The app will now find it on startup (online).');
await adminApp.delete();
