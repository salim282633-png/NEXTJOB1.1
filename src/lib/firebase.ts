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
import { CandidateContact } from '../types';

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
 * Read one candidate's contact document only. Security Rules decide whether
 * the caller may see it based on the matching public candidate document.
 * The public app never lists the whole candidateContacts collection.
 */
export async function getCandidateContact(candidateId: string): Promise<CandidateContact | null> {
  if (!candidateId) return null;

  try {
    const contactSnap = await getDoc(doc(db, 'candidateContacts', candidateId));
    if (!contactSnap.exists()) return null;

    return {
      candidateId,
      ...contactSnap.data()
    } as CandidateContact;
  } catch (error) {
    console.warn('Candidate contact is not readable for this profile:', error);
    return null;
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
 * Reclaim a verified phone safely. New records keep contact data in
 * candidateContacts/{candidateId}. Transitional legacy records that already
 * have phoneE164 in candidates are also revoked and stripped. Very old records
 * without a canonical E.164 value stay non-public under schema-v2 rules and
 * require an admin migration instead of weakening the public read policy.
 * Security Rules independently verify request.auth.token.phone_number.
 */
export async function resolvePhoneSquatting(phoneInput: string, excludeUserId: string): Promise<void> {
  const currentUser = auth.currentUser;
  const phoneE164 = normalizeSaudiPhoneForOwnership(phoneInput);

  if (
    !currentUser ||
    !phoneE164 ||
    currentUser.phoneNumber !== phoneE164 ||
    currentUser.uid !== excludeUserId
  ) {
    throw new Error('Verified Firebase phone ownership is required before reclaiming this number.');
  }

  try {
    await currentUser.getIdToken(true);

    // Both queries are constrained by the exact Firebase-verified E.164 phone.
    // This matches the Firestore list rules and prevents arbitrary legacy lookups.
    const [contactSnapshot, legacySnapshot] = await Promise.all([
      getDocs(query(collection(db, 'candidateContacts'), where('phoneE164', '==', phoneE164))),
      getDocs(query(collection(db, 'candidates'), where('phoneE164', '==', phoneE164)))
    ]);

    const staleContacts = contactSnapshot.docs.filter(contactDoc => {
      const data = contactDoc.data();
      return !(data.userId === excludeUserId && data.phoneVerified === true);
    });

    const publicSnapshots = await Promise.all(
      staleContacts.map(contactDoc => getDoc(doc(db, 'candidates', contactDoc.id)))
    );

    const revokedAt = new Date().toISOString();
    const batch = writeBatch(db);

    staleContacts.forEach((contactDoc, index) => {
      batch.update(contactDoc.ref, {
        phone: '',
        phoneE164: '',
        whatsapp: '',
        phoneVerified: false,
        phoneClaimRevokedAt: revokedAt
      });

      const publicSnap = publicSnapshots[index];
      if (publicSnap.exists()) {
        batch.update(publicSnap.ref, {
          phoneVerified: false,
          allowContact: false,
          phoneClaimRevokedAt: revokedAt
        });
      }
    });

    // Transitional legacy documents are stripped and upgraded to schema v2.
    legacySnapshot.docs.forEach(legacyDoc => {
      const data = legacyDoc.data();
      if (
        data.userId === excludeUserId &&
        data.phoneVerified === true &&
        data.phoneE164 === phoneE164
      ) {
        return;
      }

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