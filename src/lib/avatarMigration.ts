import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { auth, db } from './firebase';
import { storage } from './storage';

function isLegacyAvatarUrl(url: string): boolean {
  return url.includes('candidate-avatars%2F') || url.includes('/candidate-avatars/');
}

function legacyUrlBelongsToUser(url: string, uid: string): boolean {
  const encoded = `candidate-avatars%2F${encodeURIComponent(uid)}%2F`;
  const plain = `/candidate-avatars/${uid}/`;
  return url.includes(encoded) || url.includes(plain);
}

function extensionFor(contentType: string): string {
  if (contentType === 'image/png') return 'png';
  if (contentType === 'image/jpeg') return 'jpg';
  return 'webp';
}

/**
 * One-time owner migration for historical public avatar URLs whose Storage path
 * included the raw Firebase UID. New uploads already use candidate-avatars-v2.
 */
export async function migrateOwnedLegacyAvatar(candidateId: string): Promise<string | null> {
  const user = auth.currentUser;
  if (!user || !candidateId) return null;

  const candidateRef = doc(db, 'candidates', candidateId);
  const candidateSnap = await getDoc(candidateRef);
  if (!candidateSnap.exists()) return null;

  const avatarUrl = String(candidateSnap.data().avatarUrl || '');
  if (!avatarUrl || !isLegacyAvatarUrl(avatarUrl)) return avatarUrl || null;
  if (!legacyUrlBelongsToUser(avatarUrl, user.uid)) {
    console.warn('Legacy avatar path does not match the signed-in owner; migration skipped.');
    return avatarUrl;
  }

  try {
    const response = await fetch(avatarUrl, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Legacy avatar fetch failed (${response.status})`);
    const blob = await response.blob();
    const contentType = ['image/webp', 'image/jpeg', 'image/png'].includes(blob.type) ? blob.type : 'image/webp';
    if (blob.size >= 600 * 1024) throw new Error('Legacy avatar exceeds the permitted migration size.');

    const newPath = `candidate-avatars-v2/${candidateId}/${Date.now()}.${extensionFor(contentType)}`;
    const newRef = ref(storage, newPath);
    await uploadBytes(newRef, blob, {
      contentType,
      cacheControl: 'public,max-age=604800',
      customMetadata: { ownerUid: user.uid, candidateId }
    });
    const newUrl = await getDownloadURL(newRef);
    await updateDoc(candidateRef, { avatarUrl: newUrl, updatedAt: new Date().toISOString() });

    try {
      await deleteObject(ref(storage, avatarUrl));
    } catch (cleanupError) {
      console.warn('Legacy avatar migrated but old object cleanup failed:', cleanupError);
    }

    return newUrl;
  } catch (error) {
    console.warn('Unable to migrate legacy avatar path:', error);
    return avatarUrl;
  }
}
