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
  freshness?: 'all' | 'today' | '3days' | 'week';
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

export interface GuideArticle {
  id: string;
  title: string;
  category: string;
  cluster: string;
  summary: string;
  readTime: string;
  date: string;
  iconName: string;
  content: string[];
  importantNotes?: string[];
}
