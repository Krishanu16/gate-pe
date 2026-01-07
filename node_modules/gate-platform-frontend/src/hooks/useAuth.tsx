import { useState, useEffect } from 'react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, User } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import FingerprintJS from '@fingerprintjs/fingerprintjs';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLocked, setIsLocked] = useState(false); // <--- REQUIRED FIX
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);
      if (currentUser) {
        try {
          // 1. GENERATE FINGERPRINT
          const fpPromise = await FingerprintJS.load();
          const fpResult = await fpPromise.get();
          const currentDeviceID = fpResult.visitorId;

          // 2. CHECK DATABASE
          const userRef = doc(db, "users", currentUser.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            const data = userSnap.data();
            setUserProfile(data);
            
            if (!data.primaryDeviceID) {
              await updateDoc(userRef, { primaryDeviceID: currentDeviceID });
              setUser(currentUser);
              setIsLocked(false);
            } else if (data.primaryDeviceID === currentDeviceID) {
              setUser(currentUser);
              setIsLocked(false);
            } else {
              setIsLocked(true); // LOCK IF MISMATCH
            }
          } else {
            await setDoc(userRef, { 
              email: currentUser.email,
              primaryDeviceID: currentDeviceID,
              isPaid: false,
              createdAt: new Date()
            });
            setUser(currentUser);
            setIsLocked(false);
          }
        } catch (error) {
          console.error("Auth Check Error:", error);
        }
      } else {
        setUser(null);
        setUserProfile(null);
        setIsLocked(false);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return true;
    } catch (error: any) {
      console.error("Login Error:", error);
      throw error;
    }
  };

  const logout = async () => {
    await signOut(auth);
    setIsLocked(false);
  };

  return { user, isLocked, loading, userProfile, login, logout };
};