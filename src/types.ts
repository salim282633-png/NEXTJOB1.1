import type { Timestamp } from 'firebase/firestore';

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
  createdAt: string;
  createdAtServer?: Timestamp;
  updatedAt?: string;
  updatedAtServer?: Timestamp;
  activityAt?: Timestamp;
  lastConfirmedAt?: string;
  lastConfirmedAtServer?: Timestamp;
  lastBumpedAt?: Timestamp;
  closedAt?: Timestamp;
  reopenedAt?: Timestamp;
  status: 'pending_review' | 'active' | 'recently_confirmed' | 'awaiting_confirmation' | 'closed';
  moderationStatus?: 'pending' | 'approved' | 'rejected';
  reviewedAt?: string;
  reviewedAtServer?: Timestamp;
  reviewedBy?: string;
  complianceAccepted?: boolean;
  complianceAcceptedAt?: Timestamp;
  views?: number;
  urgent?: boolean;
  urgentExpiresAt?: string;
  urgentStartDate?: string;
  featured?: boolean;
  sourceType?: 'external' | 'employer' | 'community';
  sourceName?: string;
  sourceUrl?: string;
  applyUrl?: string;
  sourcePublishedAt?: string;
  sourceVerifiedAt?: string;
  sourceProvider?: 'lever' | 'greenhouse' | 'manual';
  sourceRegistryId?: string;
  sourceLocation?: string;
  sourceSubmissionId?: string;
  approvedBy?: string;
}

export interface Candidate {
  id: string;
  fullName: string;
  profession: string;
  city: string;
  yemeniGovernorate: string;
  iqamaStatus: 'إقامة سارية وقابلة للنقل' | 'إقامة سارية دون نقل' | 'مهن فردية / سائق خاص' | 'أخرى';
  experienceYears: string;
  phone?: string;
  phoneE164?: string;
  phoneVerified: boolean;
  phoneClaimRevokedAt?: string;
  whatsapp?: string;
  skills: string[];
  hobbies?: string[];
  noExperience?: boolean;
  bio: string;
  hasDriverLicense: boolean;
  availableImmediately: boolean;
  availabilityNote?: string;
  educationLevel?: string;
  avatarUrl?: string;
  avatarStoragePath?: string;
  isHidden: boolean;
  allowContact: boolean;
  nationality?: string;
  userId?: string;
  /** Legacy form input only. App.tsx strips this before any public candidate write. */
  userEmail?: string;
  schemaVersion?: 2;
  createdAt: string;
  views?: number;
}

export interface CandidateContact {
  candidateId: string;
  phone: string;
  whatsapp: string;
  phoneVerified: boolean;
  schemaVersion: 3;
  phoneClaimRevokedAt?: string;
}

export interface CandidateOwner {
  candidateId: string;
  userId: string;
  phoneE164: string;
  phoneVerified: boolean;
  schemaVersion: 1;
  phoneClaimRevokedAt?: string;
}

export type ApplicationStatus = 'submitted' | 'viewed' | 'shortlisted' | 'rejected' | 'withdrawn';
export interface Application {
  id: string;
  jobId: string;
  candidateId: string;
  applicantUid: string;
  employerUid: string;
  status: ApplicationStatus;
  createdAt: string;
  createdAtServer?: Timestamp;
  updatedAt?: string;
  updatedAtServer?: Timestamp;
}

export interface JobFilter {
  keyword: string;
  profession?: string;
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
  targetType: 'job' | 'candidate' | 'general';
  targetId: string;
  targetTitle: string;
  reason: 'طلب مبالغ أو عمولات توظيف' | 'إعلان وهمي / احتيال' | 'بيانات اتصال خاطئة أو مضللة' | 'رقم التواصل لا يخص صاحب الملف' | 'الوظيفة اكتفت أو غير متاحة' | 'محتوى غير لائق أو مخالف';
  details: string;
  reporterPhone?: string;
  reporterUid?: string;
  quotaSlot?: string;
  createdAt: string;
  createdAtServer?: Timestamp;
  reviewedAt?: string;
  reviewedBy?: string;
  status: 'pending' | 'reviewed' | 'dismissed';
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}