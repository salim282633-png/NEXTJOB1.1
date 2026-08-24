/**
 * Saudi Phone Normalization and OTP Verification Engine
 * Canonical format: +9665XXXXXXXX
 */

export interface PhoneNormalizationResult {
  isValid: boolean;
  canonical: string; // "+9665XXXXXXXX"
  displayLocal: string; // "05XXXXXXXX"
  error?: string;
}

/**
 * Normalizes any Saudi phone number format to canonical "+9665XXXXXXXX"
 * Supports inputs like:
 * - "0501234567" -> "+966501234567"
 * - "501234567" -> "+966501234567"
 * - "966501234567" -> "+966501234567"
 * - "+966501234567" -> "+966501234567"
 * - "00966501234567" -> "+966501234567"
 * - " 050 123 4567 " -> "+966501234567"
 */
export function normalizeSaudiPhone(rawInput: string): PhoneNormalizationResult {
  if (!rawInput || typeof rawInput !== 'string') {
    return { isValid: false, canonical: '', displayLocal: '', error: 'رقم الجوال مطلوب' };
  }

  // Remove all non-digits except a leading +
  let cleaned = rawInput.trim().replace(/[\s\-()]/g, '');

  // Strip leading international double zeros "00"
  if (cleaned.startsWith('00')) {
    cleaned = '+' + cleaned.substring(2);
  }

  // Strip leading "+" for uniform processing
  let digitsOnly = cleaned.startsWith('+') ? cleaned.substring(1) : cleaned;

  // Remove country code 966 if present at the start
  if (digitsOnly.startsWith('966')) {
    digitsOnly = digitsOnly.substring(3);
  }

  // Remove leading 0 if present (e.g. 050 -> 50)
  if (digitsOnly.startsWith('0')) {
    digitsOnly = digitsOnly.substring(1);
  }

  // A valid Saudi mobile number must start with 5 and be 9 digits long (e.g. 5XXXXXXXX)
  if (!digitsOnly.startsWith('5')) {
    return {
      isValid: false,
      canonical: '',
      displayLocal: '',
      error: 'يجب أن يبدأ رقم الجوال السعودي بـ 05 أو 5'
    };
  }

  if (digitsOnly.length !== 9 || !/^\d{9}$/.test(digitsOnly)) {
    return {
      isValid: false,
      canonical: '',
      displayLocal: '',
      error: 'رقم الجوال يجب أن يتكون من 9 أرقام بعد مفتاح الدولة (مثال: 0501234567)'
    };
  }

  const canonical = `+966${digitsOnly}`;
  const displayLocal = `0${digitsOnly}`;

  return {
    isValid: true,
    canonical,
    displayLocal
  };
}

export interface OTPChallenge {
  phone: string; // Canonical "+9665XXXXXXXX"
  code: string; // 6 digits
  createdAt: number;
  expiresAt: number; // 180 seconds (3 mins)
  attemptsLeft: number; // Max 3
  isUsed: boolean;
}

export interface StoredUserAccount {
  uid: string;
  phone: string; // Canonical
  phoneVerified: boolean;
  displayName: string;
  createdAt: string;
  phoneNeedsUpdate?: boolean;
}

const STORAGE_USERS_KEY = 'nextjob_registered_phone_users';
const STORAGE_CURRENT_OTP = 'nextjob_active_otp_challenge';

/**
 * Loads registered phone accounts from local storage
 */
export function getRegisteredPhoneUsers(): StoredUserAccount[] {
  try {
    const raw = localStorage.getItem(STORAGE_USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Saves registered phone accounts
 */
export function saveRegisteredPhoneUsers(users: StoredUserAccount[]): void {
  try {
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('Failed to persist phone users:', e);
  }
}

/**
 * Checks if a canonical phone number is already registered
 */
export function findUserByPhone(canonicalPhone: string): StoredUserAccount | null {
  const users = getRegisteredPhoneUsers();
  return users.find(u => u.phone === canonicalPhone) || null;
}

/**
 * Generates an OTP challenge for a canonical phone
 */
export function createOTPChallenge(canonicalPhone: string): OTPChallenge {
  // Generate random 6-digit code
  const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
  const now = Date.now();
  const challenge: OTPChallenge = {
    phone: canonicalPhone,
    code: randomCode,
    createdAt: now,
    expiresAt: now + 180 * 1000, // 3 minutes
    attemptsLeft: 3,
    isUsed: false
  };

  try {
    sessionStorage.setItem(STORAGE_CURRENT_OTP, JSON.stringify(challenge));
  } catch (e) {
    console.error(e);
  }

  return challenge;
}

/**
 * Gets active OTP challenge
 */
export function getActiveOTPChallenge(): OTPChallenge | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_CURRENT_OTP);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Verifies an OTP code
 */
export function verifyOTPChallenge(inputCode: string): {
  success: boolean;
  message: string;
  challenge?: OTPChallenge;
} {
  const challenge = getActiveOTPChallenge();
  if (!challenge) {
    return { success: false, message: 'لا يوجد رمز تحقق نشط، يرجى طلب رمز جديد.' };
  }

  const now = Date.now();
  if (now > challenge.expiresAt) {
    sessionStorage.removeItem(STORAGE_CURRENT_OTP);
    return { success: false, message: 'انتهت صلاحية رمز التحقق (3 دقائق). يرجى طلب رمز جديد.' };
  }

  if (challenge.isUsed) {
    return { success: false, message: 'تم استخدام رمز التحقق مسبقاً.' };
  }

  if (challenge.attemptsLeft <= 0) {
    sessionStorage.removeItem(STORAGE_CURRENT_OTP);
    return { success: false, message: 'تم استنفاد عدد محاولات إدخال الرمز (3 محاولات). يرجى طلب رمز جديد.' };
  }

  // Check code (or universal demo code 123456 for fallback convenience)
  if (inputCode.trim() === challenge.code || inputCode.trim() === '123456') {
    challenge.isUsed = true;
    sessionStorage.setItem(STORAGE_CURRENT_OTP, JSON.stringify(challenge));
    return { success: true, message: 'تم التحقق بنجاح!', challenge };
  }

  // Decrement attempts
  challenge.attemptsLeft -= 1;
  sessionStorage.setItem(STORAGE_CURRENT_OTP, JSON.stringify(challenge));

  if (challenge.attemptsLeft === 0) {
    return { success: false, message: 'رمز التحقق غير صحيح. تم استنفاد المحاولات، يرجى طلب رمز جديد.' };
  }

  return {
    success: false,
    message: `رمز التحقق غير صحيح. متبقي لديك ${challenge.attemptsLeft} محاولات.`
  };
}

/**
 * Handles Phone Squatting and Account Linking:
 * - If User B proves ownership via OTP for a number that was previously unverified (phoneVerified: false)
 *   by User A, User B claims the number with phoneVerified: true.
 * - User A's link is cleared with phoneNeedsUpdate: true without deleting User A's profile.
 */
export function handlePhoneClaimWithVerification(
  canonicalPhone: string,
  userDisplayName?: string
): StoredUserAccount {
  const users = getRegisteredPhoneUsers();
  const existingIndex = users.findIndex(u => u.phone === canonicalPhone);

  if (existingIndex >= 0) {
    const existing = users[existingIndex];
    if (existing.phoneVerified) {
      // Existing verified user re-logging in
      return existing;
    } else {
      // Squatting resolved: Previous unverified user gets detached
      users[existingIndex] = {
        ...existing,
        phone: '',
        phoneNeedsUpdate: true,
        phoneVerified: false
      };
    }
  }

  // Create new verified account for caller
  const newUser: StoredUserAccount = {
    uid: `user-phone-${Date.now()}`,
    phone: canonicalPhone,
    phoneVerified: true,
    displayName: userDisplayName || `مستخدم (${canonicalPhone.slice(-4)})`,
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  saveRegisteredPhoneUsers(users);
  return newUser;
}

/**
 * Registers a new seeker without OTP (phoneVerified: false)
 */
export function registerUnverifiedSeeker(
  canonicalPhone: string,
  displayName?: string
): StoredUserAccount {
  const users = getRegisteredPhoneUsers();
  const existing = users.find(u => u.phone === canonicalPhone);

  if (existing) {
    return existing;
  }

  const newUser: StoredUserAccount = {
    uid: `user-phone-${Date.now()}`,
    phone: canonicalPhone,
    phoneVerified: false,
    displayName: displayName || `باحث عمل (${canonicalPhone.slice(-4)})`,
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  saveRegisteredPhoneUsers(users);
  return newUser;
}
