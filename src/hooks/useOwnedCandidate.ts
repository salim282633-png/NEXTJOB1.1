import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db, migrateOwnedCandidatePrivacy } from '../lib/firebase';
import { migrateOwnedLegacyAvatar } from '../lib/avatarMigration';
import { Candidate } from '../types';

export function useOwnedCandidate() {
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(Boolean(auth.currentUser));

  useEffect(() => onAuthStateChanged(auth, current => setUser(current)), []);

  useEffect(() => {
    let cancelled = false;
    if (!user) {
      setCandidate(null);
      setLoading(false);
      return () => { cancelled = true; };
    }

    setLoading(true);
    void (async () => {
      const candidateId = await migrateOwnedCandidatePrivacy(user);
      if (!candidateId || cancelled) {
        if (!cancelled) { setCandidate(null); setLoading(false); }
        return;
      }

      try {
        await migrateOwnedLegacyAvatar(candidateId);
        const publicSnap = await getDoc(doc(db, 'candidates', candidateId));
        if (!cancelled) {
          setCandidate(publicSnap.exists() ? ({ id: publicSnap.id, ...publicSnap.data() } as Candidate) : null);
        }
      } catch (error) {
        console.warn('Unable to load owned candidate profile:', error);
        if (!cancelled) setCandidate(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [user?.uid]);

  return { user, candidate, loading };
}
