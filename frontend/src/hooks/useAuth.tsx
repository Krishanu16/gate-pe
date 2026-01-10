import { useState, useEffect } from 'react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, User } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import FingerprintJS from '@fingerprintjs/fingerprintjs';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLocked, setIsLocked] = useState(false);
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

            // 3. ADMIN BYPASS (Critical for you and CAO)
            if (data.role === 'admin_master' || data.role === 'admin_academic') {
                setUser(currentUser);
                setIsLocked(false);
                setLoading(false);
              return; 
            }
            
            // 4. STUDENT DEVICE LOGIC (Primary + Secondary)
            if (!data.primaryDeviceID) {
              // Claim Primary Slot
              await updateDoc(userRef, { primaryDeviceID: currentDeviceID });
              setUser(currentUser);
              setIsLocked(false);
            } else if (data.primaryDeviceID === currentDeviceID) {
              // Match Primary
              setUser(currentUser);
              setIsLocked(false);
            } else if (!data.secondaryDeviceID) {
              // Claim Secondary Slot
              await updateDoc(userRef, { secondaryDeviceID: currentDeviceID });
              setUser(currentUser);
              setIsLocked(false);
            } else if (data.secondaryDeviceID === currentDeviceID) {
              // Match Secondary
              setUser(currentUser);
              setIsLocked(false);
            } else {
              // Both slots full & no match -> LOCK
              setIsLocked(true); 
            }
          } else {
            // New User Creation
            await setDoc(userRef, { 
              email: currentUser.email,
              primaryDeviceID: currentDeviceID,
              role: 'student', // Default role
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