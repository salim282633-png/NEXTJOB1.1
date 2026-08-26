import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  browserPopupRedirectResolver,
  signInAnonymously,
  signOut,
  User
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  getDoc,
  getDocFromServer,
  addDoc,
  updateDoc,
  deleteDoc,
  deleteField,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  writeBatch
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { CandidateContact, CandidateOwner } from '../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    signedIn: boolean;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerIds: string[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      signedIn: Boolean(auth.currentUser),
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerIds: auth.currentUser?.providerData?.map(provider => provider.providerId) || []
    },
    operationType,
    path
  };
  console.warn('Firestore Error Context: ', JSON.stringify(errInfo));
  return errInfo;
}

export function getAuthErrorMessage(error: unknown): string {
  if (!error) return 'حدث خطأ غير متوقع أثناء تسجيل الدخول.';

  const err = error as { code?: string; message?: string };
  const code = err.code || '';

  switch (code) {
    case 'auth/popup-blocked':
      return 'قام المتصفح بحظر نافذة تسجيل الدخول المنبثقة. يرجى السماح بالنوافذ المنبثقة أو فتح التطبيق في تبويب مستقل.';
    case 'auth/popup-closed-by-user':
      return 'تم إغلاق نافذة تسجيل الدخول قبل إتمامها. يرجى المحاولة مرة أخرى.';
    case 'auth/cancelled-popup-request':
      return 'تم إلغاء العملية لوجود طلب تسجيل دخول آخر قيد المعالجة.';
    case 'auth/unauthorized-domain':
      return 'نطاق الموقع غير مضاف إلى Authorized domains في Firebase Authentication.';
    case 'auth/network-request-failed':
      return 'تعذر الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت والمحاولة مجدداً.';
    case 'auth/invalid-phone-number':
      return 'رقم الجوال غير صالح. تأكد من كتابة رقم سعودي صحيح.';
    case 'auth/missing-phone-number':
      return 'يرجى إدخال رقم الجوال.';
    case 'auth/invalid-verification-code':
      return 'رمز التحقق غير صحيح. تأكد من الرمز المرسل عبر SMS.';
    case 'auth/code-expired':
      return 'انتهت صلاحية رمز التحقق. اطلب رمزاً جديداً.';
    case 'auth/too-many-requests':
      return 'تم إرسال محاولات كثيرة. انتظر قليلاً ثم حاول مرة أخرى.';
    case 'auth/captcha-check-failed':
      return 'تعذر اجتياز التحقق الأمني reCAPTCHA. أعد المحاولة.';
    case 'auth/invalid-app-credential':
      return 'تعذر التحقق من إعدادات تطبيق Firebase لهذا النطاق. راجع Authorized domains وإعدادات Phone Authentication.';
    case 'auth/invalid-email':
      return 'صيغة البريد الإلكتروني المدخلة غير صحيحة.';
    case 'auth/user-disabled':
      return 'تم تعطيل هذا الحساب مؤقتاً. يرجى التواصل مع الدعم الفني.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'بيانات الدخول غير صحيحة.';
    case 'auth/email-already-in-use':
      return 'هذا البريد الإلكتروني مسجل مسبقاً، يرجى تسجيل الدخول بدلاً من إنشاء حساب جديد.';
    case 'auth/weak-password':
      return 'كلمة المرور ضعيفة. يجب أن تتكون من 6 خانات على الأقل.';
    case 'auth/operation-not-allowed':
      return 'طريقة تسجيل الدخول هذه غير مفعلة في Firebase Authentication.';
    default:
      if (err.message?.includes('popup')) {
        return 'تعذر فتح نافذة تسجيل الدخول. يرجى التحقق من إعدادات النوافذ المنبثقة في متصفحك.';
      }
      return err.message || 'تعذر إتمام تسجيل الدخول في الوقت الحالي، يرجى المحاولة لاحقاً.';
  }
}

// Initialize the configured Firebase project.
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// NEXT JOB is explicitly bound to this named Firestore database.
export const FIRESTORE_DATABASE_ID = 'ai-studio-22228db6-8ffe-450f-801f-19bd5ea8c9f0';
export const db = getFirestore(app, FIRESTORE_DATABASE_ID);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export async function loginWithGoogle(): Promise<User | null> {
  try {
    const result = await signInWithPopup(
      auth,
      googleProvider,
      browserPopupRedirectResolver
    );
    return result.user;
  } catch (error) {
    console.error('Google login error:', error);
    throw error;
  }
}

export async function loginAnonymously(): Promise<User | null> {
  try {
    const result = await signInAnonymously(auth);
    return result.user;
  } catch (error) {
    console.warn('Anonymous login is not enabled in Firebase Authentication.', error);
    throw error;
  }
}

export async function logoutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
}

export async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore offline notice: Local cache / fallback active.');
    }
  }
}

/**
 * Read one candidate's public contact document only. Security Rules expose
 * schema-v3 contacts only when the matching public profile allows contact.
 * Ownership identifiers and canonical phone claims live in candidateOwners.
 */
export async function getCandidateContact(candidateId: string): Promise<CandidateContact | null> {
  if (!candidateId) return null;

  try {
    const contactSnap = await getDoc(doc(db, 'candidateContacts', candidateId));
    if (!contactSnap.exists()) return null;
    const data = contactSnap.data();
    if (data.schemaVersion !== 3) return null;
    return { candidateId, ...data } as CandidateContact;
  } catch (error) {
    console.warn('Candidate contact is not readable for this profile:', error);
    return null;
  }
}

/**
 * Migrate only the signed-in user's legacy contact record. This never lists
 * another user's private owner data. The migration removes userId/phoneE164
 * from candidateContacts and creates candidateOwners atomically.
 */
export async function migrateOwnedCandidatePrivacy(user: User): Promise<string | null> {
  try {
    const ownerSnapshot = await getDocs(query(
      collection(db, 'candidateOwners'),
      where('userId', '==', user.uid),
      limit(1)
    ));
    if (!ownerSnapshot.empty) return ownerSnapshot.docs[0].id;

    const legacySnapshot = await getDocs(query(
      collection(db, 'candidateContacts'),
      where('userId', '==', user.uid),
      limit(1)
    ));
    const legacy = legacySnapshot.docs[0];
    if (!legacy) return null;

    const data = legacy.data();
    const candidateId = legacy.id;
    const canonical = typeof data.phoneE164 === 'string' ? data.phoneE164 : '';
    const verified = Boolean(data.phoneVerified && canonical && user.phoneNumber === canonical);
    const publicRef = doc(db, 'candidates', candidateId);
    const publicSnap = await getDoc(publicRef);
    const batch = writeBatch(db);

    batch.set(doc(db, 'candidateOwners', candidateId), {
      candidateId,
      userId: user.uid,
      phoneE164: canonical,
      phoneVerified: verified,
      schemaVersion: 1
    } satisfies CandidateOwner);

    batch.set(legacy.ref, {
      candidateId,
      phone: typeof data.phone === 'string' ? data.phone : '',
      whatsapp: typeof data.whatsapp === 'string' ? data.whatsapp : '',
      phoneVerified: verified,
      schemaVersion: 3
    } satisfies CandidateContact);

    if (publicSnap.exists()) {
      batch.update(publicRef, {
        phone: deleteField(),
        phoneE164: deleteField(),
        whatsapp: deleteField(),
        userEmail: deleteField(),
        userId: deleteField(),
        schemaVersion: 2,
        phoneVerified: verified
      });
    }

    await batch.commit();
    return candidateId;
  } catch (error) {
    console.warn('Unable to migrate owned candidate privacy schema:', error);
    return null;
  }
}

export async function sanitizeOwnedLegacyJobs(uid: string): Promise<void> {
  if (!uid || auth.currentUser?.uid !== uid) return;
  try {
    const snapshot = await getDocs(query(collection(db, 'jobs'), where('userId', '==', uid), limit(100)));
    const legacy = snapshot.docs.filter(item => Object.prototype.hasOwnProperty.call(item.data(), 'userEmail'));
    if (!legacy.length) return;
    const batch = writeBatch(db);
    legacy.forEach(item => batch.update(item.ref, { userEmail: deleteField() }));
    await batch.commit();
  } catch (error) {
    console.warn('Unable to sanitize owned legacy job metadata:', error);
  }
}

export async function sanitizeLegacyJobsAsAdmin(): Promise<number> {
  try {
    const snapshot = await getDocs(query(collection(db, 'jobs'), limit(100)));
    const legacy = snapshot.docs.filter(item => Object.prototype.hasOwnProperty.call(item.data(), 'userEmail'));
    if (!legacy.length) return 0;
    const batch = writeBatch(db);
    legacy.forEach(item => batch.update(item.ref, { userEmail: deleteField() }));
    await batch.commit();
    return legacy.length;
  } catch (error) {
    console.warn('Unable to sanitize legacy job metadata as admin:', error);
    return 0;
  }
}

function normalizeSaudiPhoneForOwnership(value: string): string {
  let digits = value.trim().replace(/\D/g, '');

  if (digits.startsWith('966')) {
    digits = digits.slice(3);
  }
  if (digits.startsWith('0')) {
    digits = digits.slice(1);
  }

  return /^5\d{8}$/.test(digits) ? `+966${digits}` : '';
}

/**
 * Reclaim a verified phone safely from private owner claims. Public contact
 * documents never need to expose UID or canonical E.164 ownership data.
 */
export async function resolvePhoneSquatting(phoneInput: string, excludeUserId: string): Promise<void> {
  const currentUser = auth.currentUser;
  const phoneE164 = normalizeSaudiPhoneForOwnership(phoneInput);

  if (!currentUser || !phoneE164 || currentUser.phoneNumber !== phoneE164 || currentUser.uid !== excludeUserId) {
    throw new Error('Verified Firebase phone ownership is required before reclaiming this number.');
  }

  try {
    await currentUser.getIdToken(true);

    const [ownerSnapshot, legacySnapshot] = await Promise.all([
      getDocs(query(collection(db, 'candidateOwners'), where('phoneE164', '==', phoneE164))),
      getDocs(query(collection(db, 'candidates'), where('phoneE164', '==', phoneE164)))
    ]);

    const staleOwners = ownerSnapshot.docs.filter(ownerDoc => {
      const data = ownerDoc.data();
      return !(data.userId === excludeUserId && data.phoneVerified === true);
    });

    const related = await Promise.all(staleOwners.map(async ownerDoc => ({
      ownerDoc,
      contactSnap: await getDoc(doc(db, 'candidateContacts', ownerDoc.id)),
      publicSnap: await getDoc(doc(db, 'candidates', ownerDoc.id))
    })));

    const revokedAt = new Date().toISOString();
    const batch = writeBatch(db);

    related.forEach(({ ownerDoc, contactSnap, publicSnap }) => {
      batch.update(ownerDoc.ref, { phoneE164: '', phoneVerified: false, phoneClaimRevokedAt: revokedAt });
      if (contactSnap.exists()) {
        batch.set(contactSnap.ref, {
          candidateId: ownerDoc.id,
          phone: '',
          whatsapp: '',
          phoneVerified: false,
          schemaVersion: 3,
          phoneClaimRevokedAt: revokedAt
        });
      }
      if (publicSnap.exists()) {
        batch.update(publicSnap.ref, {
          phoneVerified: false,
          allowContact: false,
          phoneClaimRevokedAt: revokedAt
        });
      }
    });

    // Transitional public documents that still contain canonical contact fields
    // are stripped. Rules restrict this query to the Firebase-verified phone.
    legacySnapshot.docs.forEach(legacyDoc => {
      const data = legacyDoc.data();
      if (data.userId === excludeUserId && data.phoneVerified === true && data.phoneE164 === phoneE164) return;
      batch.update(legacyDoc.ref, {
        phone: deleteField(),
        phoneE164: deleteField(),
        whatsapp: deleteField(),
        userEmail: deleteField(),
        userId: deleteField(),
        schemaVersion: 2,
        phoneVerified: false,
        allowContact: false,
        phoneClaimRevokedAt: revokedAt
      });
    });

    await batch.commit();
  } catch (error) {
    console.error('Failed to resolve phone squatting:', error);
    throw error;
  }
}
