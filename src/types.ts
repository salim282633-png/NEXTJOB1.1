export interface Job {
  id: string;
  title: string;
  company: string;
  city: string;
  category: string;
  salary: string;
  jobType: 'دوام كامل' | 'دوام جزئي' | 'عمل حر / بالقطعة' | 'عقد مؤقت';
  sponsorshipTransfer: boolean;
  accommodationProvided: boolean;
  transportationProvided: boolean;
  mealsProvided?: boolean;
  overtimeAvailable?: boolean;
  experienceYears: string;
  educationLevel?: string;
  description: string;
  requirements?: string[];
  phone: string;
  whatsapp: string;
  contactPerson?: string;
  userId?: string;
  userEmail?: string;
  createdAt: string;
  updatedAt?: string;
  lastConfirmedAt?: string;
  status: 'active' | 'recently_confirmed' | 'awaiting_confirmation' | 'closed';
  views?: number;
  urgent?: boolean;
  urgentExpiresAt?: string;
  urgentStartDate?: string;
  featured?: boolean;
  sourceType?: 'employer' | 'community';
  sourceSubmissionId?: string;
  approvedBy?: string;
}

export interface Candidate {
  id: string;
  fullName: string;
  profession: string;
  city: string;
  yemeniGovernorate: string; // محافظة الأصل باليمن (صنعاء، تعز، إب، حضرموت، عدن، إلخ)
  iqamaStatus: 'إقامة سارية وقابلة للنقل' | 'تأشيرة زيارة / هوية زائر' | 'إقامة سارية دون نقل' | 'مهن فردية / سائق خاص' | 'أخرى';
  experienceYears: string;
  // Contact fields are used by form/local seed data only. Production Firestore
  // stores them in candidateContacts/{candidateId}, not in the public document.
  phone: string;
  phoneE164?: string;
  phoneVerified: boolean;
  phoneClaimRevokedAt?: string;
  whatsapp: string;
  skills: string[];
  bio: string;
  hasDriverLicense: boolean;
  availableImmediately: boolean;
  availabilityNote?: string;
  educationLevel?: string;
  avatarUrl?: string;
  isHidden: boolean; // إخفاء الملف بالكامل
  allowContact: boolean; // إيقاف استقبال التواصل
  nationality?: string;
  userId?: string;
  userEmail?: string;
  schemaVersion?: 2;
  createdAt: string;
  views?: number;
}

export interface CandidateContact {
  candidateId: string;
  phone: string;
  phoneE164: string;
  whatsapp: string;
  phoneVerified: boolean;
  userId: string | null;
  schemaVersion: 2;
  phoneClaimRevokedAt?: string;
}

export interface JobFilter {
  keyword: string;
  category: string;
  city: string;
  sponsorshipOnly: boolean;
  withAccommodation: boolean;
  withTransportation: boolean;
  withMeals?: boolean;
  withOvertime?: boolean;
  jobType: string;
  salaryRange: string;
  experience?: string;
  freshness?: 'all' | 'today' | '3days' | 'week';
}

export interface CandidateFilter {
  keyword: string;
  profession: string;
  city: string;
  yemeniGovernorate: string;
  iqamaStatus: string;
  hasLicenseOnly: boolean;
  availableOnly: boolean;
  phoneVerifiedOnly?: boolean;
}

export interface GuideArticle {
  id: string;
  title: string;
  category: 'نقل الخدمات وقوى' | 'الإقامة والأنظمة' | 'عقود العمل والحقوق' | 'نصائح التوظيف والمقابلات' | 'تجارب وحرف اليمنيين';
  summary: string;
  content: string[];
  importantNotes?: string[];
  readTime: string;
  iconName: string;
  cluster: string;
  date: string;
  views?: number;
}

export interface CommunityJobSubmission {
  id: string;
  title: string;
  companyOrShop: string;
  city: string;
  category: string;
  contactNumber: string;
  details: string;
  salary?: string;
  submitterName?: string;
  submitterPhone?: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  publishedJobId?: string;
}

export interface FraudReport {
  id: string;
  targetType: 'job' | 'candidate';
  targetId: string;
  targetTitle: string;
  reason: 'طلب مبالغ أو عمولات توظيف' | 'إعلان وهمي / احتيال' | 'بيانات اتصال خاطئة أو مضللة' | 'الوظيفة اكتفت أو غير متاحة' | 'محتوى غير لائق أو مخالف';
  details: string;
  reporterPhone?: string;
  createdAt: string;
  status: 'pending' | 'reviewed' | 'dismissed';
}

export interface SEOKeywordMetric {
  keyword: string;
  cluster: string;
  intent: 'commercial' | 'informational' | 'transactional';
  searchVolumeEst: number;
  competition: 'منخفضة' | 'متوسطة' | 'مرتفعة';
  realJobCount: number;
  indexStatus: 'index' | 'noindex' | 'refresh_needed';
  cannibalizationRisk: 'منخفض' | 'متوسط' | 'مرتفع';
  recommendedAction: 'Create' | 'Improve' | 'Refresh' | 'Job Page' | 'Pillar' | 'Skip';
}

export interface SEODryRunItem {
  day: number;
  slot: 'صباحي' | 'مسائي';
  title: string;
  cluster: string;
  targetKeyword: string;
  realJobSignal: number;
  cannibalizationScore: number;
  qualityGatePassed: boolean;
  status: 'جاهز للنشر' | 'تحديث صفحة موجودة' | 'مستبعد لتشابه المحتوى';
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}