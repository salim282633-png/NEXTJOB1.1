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
  getDocFromServer,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
  onSnapshot
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

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
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
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

// The new project uses its default Firestore database.
export const db = getFirestore(app);
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
 * Revoke stale candidate claims for a phone only after Firebase Authentication
 * proves that the currently signed-in user owns that exact E.164 number.
 * Firestore rules independently re-check the same ownership token, so this
 * cannot be bypassed by calling the function manually from the browser.
 */
export async function resolvePhoneSquatting(phoneE164: string, excludeUserId: string): Promise<void> {
  const currentUser = auth.currentUser;

  if (!currentUser || currentUser.phoneNumber !== phoneE164 || currentUser.uid !== excludeUserId) {
    throw new Error('Verified Firebase phone ownership is required before reclaiming this number.');
  }

  try {
    // Refresh the ID token so Firestore immediately sees the new phone_number claim.
    await currentUser.getIdToken(true);

    const { where } = await import('firebase/firestore');
    const q = query(collection(db, 'candidates'), where('phoneE164', '==', phoneE164));
    const snapshot = await getDocs(q);
    const revokedAt = new Date().toISOString();

    const updatePromises = snapshot.docs
      // Preserve only an already-verified profile owned by this exact Firebase UID.
      // A forged userId on an unverified profile cannot block a legitimate reclaim.
      .filter(candidateDoc => {
        const data = candidateDoc.data();
        return !(data.userId === excludeUserId && data.phoneVerified === true);
      })
      .map(candidateDoc => updateDoc(doc(db, 'candidates', candidateDoc.id), {
        phone: 'رقم محذوف',
        phoneE164: '',
        phoneVerified: false,
        whatsapp: '',
        allowContact: false,
        phoneClaimRevokedAt: revokedAt
      }));

    await Promise.all(updatePromises);
  } catch (error) {
    console.error('Failed to resolve phone squatting:', error);
    throw error;
  }
}
