import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, doc, getDoc, limit, onSnapshot, query, where } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { Candidate } from '../types';

export function useOwnedCandidate() {
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(Boolean(auth.currentUser));

  useEffect(() => onAuthStateChanged(auth, current => setUser(current)), []);

  useEffect(() => {
    if (!user) {
      setCandidate(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const q = query(collection(db, 'candidateContacts'), where('userId', '==', user.uid), limit(1));
    const unsubscribe = onSnapshot(
      q,
      async snapshot => {
        const contactDoc = snapshot.docs[0];
        if (!contactDoc) {
          setCandidate(null);
          setLoading(false);
          return;
        }

        try {
          const publicSnap = await getDoc(doc(db, 'candidates', contactDoc.id));
          if (!publicSnap.exists()) {
            setCandidate(null);
          } else {
            setCandidate({
              id: publicSnap.id,
              phone: '',
              whatsapp: '',
              userId: user.uid,
              ...publicSnap.data()
            } as Candidate);
          }
        } finally {
          setLoading(false);
        }
      },
      error => {
        console.warn('Unable to load owned candidate profile:', error);
        setCandidate(null);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user?.uid]);

  return { user, candidate, loading };
}
