import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from './firebase';
import { ChatuUser } from '../types';
import { handleFirestoreError, OperationType } from './error-handler';

interface AuthContextType {
  user: User | null;
  chatuUser: ChatuUser | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, chatuUser: null, loading: true });

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [chatuUser, setChatuUser] = useState<ChatuUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
          // Initialize user if not exists
          const newUser: ChatuUser = {
            uid: firebaseUser.uid,
            displayName: firebaseUser.displayName || 'Anon Chatu',
            level: 1,
            xp: 0,
            chatus: 5,
            avatarParts: ['basic_body', 'basic_head'],
            badges: ['Newcomer'],
            debt: 0,
            claimedRewards: [],
          };
          try {
            await setDoc(userDocRef, newUser);
            setChatuUser(newUser);
          } catch (e) {
            handleFirestoreError(e, OperationType.CREATE, `users/${firebaseUser.uid}`);
          }
        }

        // Listen for real-time updates to user stats (Chatus, XP)
        const unsubUser = onSnapshot(userDocRef, (doc) => {
          if (doc.exists()) {
            setChatuUser(doc.data() as ChatuUser);
          }
        }, (error) => {
          handleFirestoreError(error, OperationType.GET, `users/${firebaseUser.uid}`);
        });

        setLoading(false);
        return () => unsubUser();
      } else {
        setChatuUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, chatuUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
