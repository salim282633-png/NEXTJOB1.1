/**
 * Saudi phone normalization and local phone-account metadata helpers.
 * OTP generation and verification are intentionally NOT implemented here.
 * Real SMS verification is handled by Firebase Phone Authentication in AuthModal.
 * Canonical format: +9665XXXXXXXX
 */

export interface PhoneNormalizationResult {
  isValid: boolean;
  canonical: string;
  displayLocal: string;
  error?: string;
}

export interface StoredUserAccount {
  uid: string;
  phone: string;
  phoneVerified: boolean;
  displayName: string;
  createdAt: string;
  phoneNeedsUpdate?: boolean;
}

const STORAGE_USERS_KEY = 'nextjob_registered_phone_users';

/**
 * Normalizes common Saudi mobile formats to +9665XXXXXXXX.
 */
export function normalizeSaudiPhone(rawInput: string): PhoneNormalizationResult {
  if (!rawInput || typeof rawInput !== 'string') {
    return { isValid: false, canonical: '', displayLocal: '', error: 'رقم الجوال مطلوب' };
  }

  let cleaned = rawInput.trim().replace(/[\s\-()]/g, '');

  if (cleaned.startsWith('00')) {
    cleaned = `+${cleaned.substring(2)}`;
  }

  let digitsOnly = cleaned.startsWith('+') ? cleaned.substring(1) : cleaned;

  if (digitsOnly.startsWith('966')) {
    digitsOnly = digitsOnly.substring(3);
  }

  if (digitsOnly.startsWith('0')) {
    digitsOnly = digitsOnly.substring(1);
  }

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

  return {
    isValid: true,
    canonical: `+966${digitsOnly}`,
    displayLocal: `0${digitsOnly}`
  };
}

export function getRegisteredPhoneUsers(): StoredUserAccount[] {
  try {
    const raw = localStorage.getItem(STORAGE_USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveRegisteredPhoneUsers(users: StoredUserAccount[]): void {
  try {
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
  } catch (error) {
    console.error('Failed to persist phone users:', error);
  }
}

export function findUserByPhone(canonicalPhone: string): StoredUserAccount | null {
  return getRegisteredPhoneUsers().find(user => user.phone === canonicalPhone) || null;
}

/**
 * Records ownership only AFTER Firebase has successfully verified the SMS code.
 * The Firebase UID is authoritative; no locally generated verified UID is used.
 */
export function handlePhoneClaimWithVerification(
  canonicalPhone: string,
  firebaseUid: string,
  userDisplayName?: string
): StoredUserAccount {
  const users = getRegisteredPhoneUsers();
  const now = new Date().toISOString();

  // Detach any previous unverified/local claimant of this number.
  const cleanedUsers = users.map(user => {
    if (user.phone === canonicalPhone && user.uid !== firebaseUid) {
      return {
        ...user,
        phone: '',
        phoneVerified: false,
        phoneNeedsUpdate: true
      };
    }
    return user;
  });

  const existingFirebaseUserIndex = cleanedUsers.findIndex(user => user.uid === firebaseUid);
  const verifiedAccount: StoredUserAccount = {
    uid: firebaseUid,
    phone: canonicalPhone,
    phoneVerified: true,
    displayName: userDisplayName?.trim() || `مستخدم (${canonicalPhone.slice(-4)})`,
    createdAt:
      existingFirebaseUserIndex >= 0
        ? cleanedUsers[existingFirebaseUserIndex].createdAt
        : now,
    phoneNeedsUpdate: false
  };

  if (existingFirebaseUserIndex >= 0) {
    cleanedUsers[existingFirebaseUserIndex] = {
      ...cleanedUsers[existingFirebaseUserIndex],
      ...verifiedAccount
    };
  } else {
    cleanedUsers.push(verifiedAccount);
  }

  saveRegisteredPhoneUsers(cleanedUsers);
  return verifiedAccount;
}

/**
 * Lets a genuinely new seeker continue without SMS verification.
 * This does not authenticate the phone number and phoneVerified remains false.
 */
export function registerUnverifiedSeeker(
  canonicalPhone: string,
  displayName?: string
): StoredUserAccount {
  const users = getRegisteredPhoneUsers();
  const existing = users.find(user => user.phone === canonicalPhone);

  if (existing) {
    return existing;
  }

  const newUser: StoredUserAccount = {
    uid: `user-unverified-${crypto.randomUUID()}`,
    phone: canonicalPhone,
    phoneVerified: false,
    displayName: displayName?.trim() || `باحث عمل (${canonicalPhone.slice(-4)})`,
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  saveRegisteredPhoneUsers(users);
  return newUser;
}
