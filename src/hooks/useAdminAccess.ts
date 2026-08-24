import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

/**
 * Fail-closed admin authorization for the web UI.
 *
 * An authenticated user is considered an admin only while a matching
 * Firestore document exists at admins/{uid}. Security Rules permit a user to
 * read only their own admin marker; listing or editing admin markers from the
 * client remains forbidden.
 *
 * The marker is observed in real time so deleting admins/{uid} revokes the UI
 * immediately without requiring the user to sign out.
 */
export function useAdminAccess() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);

  useEffect(() => {
    let stopAdminListener: (() => void) | null = null;
    let generation = 0;

    const stopAuthListener = onAuthStateChanged(auth, currentUser => {
      generation += 1;
      const currentGeneration = generation;

      if (stopAdminListener) {
        stopAdminListener();
        stopAdminListener = null;
      }

      setIsAdmin(false);

      if (!currentUser) {
        setIsCheckingAdmin(false);
        return;
      }

      setIsCheckingAdmin(true);
      const adminRef = doc(db, 'admins', currentUser.uid);

      stopAdminListener = onSnapshot(
        adminRef,
        snapshot => {
          if (currentGeneration !== generation) return;
          setIsAdmin(snapshot.exists());
          setIsCheckingAdmin(false);
        },
        error => {
          if (currentGeneration !== generation) return;
          console.warn('Admin authorization check denied or unavailable:', error);
          setIsAdmin(false);
          setIsCheckingAdmin(false);
        }
      );
    });

    return () => {
      generation += 1;
      stopAuthListener();
      if (stopAdminListener) stopAdminListener();
    };
  }, []);

  return { isAdmin, isCheckingAdmin };
}
