import fs from 'node:fs';

const path = 'src/App.tsx';
let s = fs.readFileSync(path, 'utf8');

const staticImports = `import { JobDetailModal } from './components/JobDetailModal';
import { PostJobModal } from './components/PostJobModal';
import { CandidatesDirectory } from './components/CandidatesDirectory';
import { PostCandidateModal } from './components/PostCandidateModal';
import { SaudiResidentGuide } from './components/SaudiResidentGuide';
import { SavedJobsView } from './components/SavedJobsView';
import { AICoverLetterModal } from './components/AICoverLetterModal';
import { WageCalculatorModal } from './components/WageCalculatorModal';
import { FreeCVGeneratorModal } from './components/FreeCVGeneratorModal';
import { CommunityJobModal } from './components/CommunityJobModal';
import { ReportFraudModal } from './components/ReportFraudModal';
import { AdminAndSEOEngineModal } from './components/AdminAndSEOEngineModal';
import { PrivacyAndTermsModal } from './components/PrivacyAndTermsModal';`;

const lazyImports = `const JobDetailModal = React.lazy(() => import('./components/JobDetailModal').then(module => ({ default: module.JobDetailModal })));
const PostJobModal = React.lazy(() => import('./components/PostJobModal').then(module => ({ default: module.PostJobModal })));
const CandidatesDirectory = React.lazy(() => import('./components/CandidatesDirectory').then(module => ({ default: module.CandidatesDirectory })));
const PostCandidateModal = React.lazy(() => import('./components/PostCandidateModal').then(module => ({ default: module.PostCandidateModal })));
const SaudiResidentGuide = React.lazy(() => import('./components/SaudiResidentGuide').then(module => ({ default: module.SaudiResidentGuide })));
const SavedJobsView = React.lazy(() => import('./components/SavedJobsView').then(module => ({ default: module.SavedJobsView })));
const AICoverLetterModal = React.lazy(() => import('./components/AICoverLetterModal').then(module => ({ default: module.AICoverLetterModal })));
const WageCalculatorModal = React.lazy(() => import('./components/WageCalculatorModal').then(module => ({ default: module.WageCalculatorModal })));
const FreeCVGeneratorModal = React.lazy(() => import('./components/FreeCVGeneratorModal').then(module => ({ default: module.FreeCVGeneratorModal })));
const CommunityJobModal = React.lazy(() => import('./components/CommunityJobModal').then(module => ({ default: module.CommunityJobModal })));
const ReportFraudModal = React.lazy(() => import('./components/ReportFraudModal').then(module => ({ default: module.ReportFraudModal })));
const AdminAndSEOEngineModal = React.lazy(() => import('./components/AdminAndSEOEngineModal').then(module => ({ default: module.AdminAndSEOEngineModal })));
const PrivacyAndTermsModal = React.lazy(() => import('./components/PrivacyAndTermsModal').then(module => ({ default: module.PrivacyAndTermsModal })));`;

if (!s.includes(staticImports)) throw new Error('Expected static import block not found');
s = s.replace(staticImports, lazyImports);

const mainOpen = `      <main className="flex-1">`;
const mainClose = `      </main>\n\n      {selectedJob && (`;
if (!s.includes(mainOpen) || !s.includes(mainClose)) throw new Error('Main boundary markers missing');
s = s.replace(mainOpen, `      <React.Suspense fallback={<div className="flex-1 py-20 text-center text-sm font-semibold text-slate-500">جارٍ تحميل القسم...</div>}>\n        <main className="flex-1">`);
s = s.replace(mainClose, `        </main>\n      </React.Suspense>\n\n      <React.Suspense fallback={null}>\n      {selectedJob && (`);

const modalEnd = `      {isPrivacyOpen && <PrivacyAndTermsModal isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} />}\n\n      <CookieConsentBanner`;
if (!s.includes(modalEnd)) throw new Error('Modal boundary end marker missing');
s = s.replace(modalEnd, `      {isPrivacyOpen && <PrivacyAndTermsModal isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} />}\n      </React.Suspense>\n\n      <CookieConsentBanner`);

fs.writeFileSync(path, s, 'utf8');
fs.rmSync('scripts/apply-lazy-loading-temp.mjs', { force: true });
fs.rmSync('.github/workflows/apply-lazy-loading-temp.yml', { force: true });
console.log('Lazy loading patch applied.');
