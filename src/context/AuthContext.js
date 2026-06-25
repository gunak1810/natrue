'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  GoogleAuthProvider, 
  signInWithPopup,
  updateProfile
} from 'firebase/auth';
import { getUserProfile, createUserProfile, updateUserProfile } from '@/lib/firestore';



const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);



  useEffect(() => {

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          let profile = await getUserProfile(firebaseUser.uid);
          
          // Force admin role for the master admin email
          const isAdminAccount = firebaseUser.email === 'admin.craftszone@gmail.com' || firebaseUser.email === 'customersupport@natrue.in';
          if (isAdminAccount && (!profile || profile.role !== 'admin')) {
            const adminData = { role: 'admin', email: firebaseUser.email, name: firebaseUser.displayName || 'Admin' };
            if (!profile) {
              await createUserProfile(firebaseUser.uid, { ...adminData, addresses: [], wishlist: [] });
            } else {
              await updateUserProfile(firebaseUser.uid, { role: 'admin' });
            }
            profile = { ...profile, ...adminData };
          }
          
          setUserProfile(profile);
        } catch (e) {
          console.error('Error getting user profile:', e);
        }
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    const isAdminAccount = email === 'admin.craftszone@gmail.com' || email === 'customersupport@natrue.in';
    
    let profile = await getUserProfile(result.user.uid);
    if (isAdminAccount && (!profile || profile.role !== 'admin')) {
      if (!profile) {
        await createUserProfile(result.user.uid, { role: 'admin', email, name: result.user.displayName || 'Admin', addresses: [], wishlist: [] });
      } else {
        await updateUserProfile(result.user.uid, { role: 'admin' });
      }
      profile = { ...profile, role: 'admin' };
    }
    
    setUserProfile(profile);
    return result;
  };

  const register = async (email, password, name, phone) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const isAdminAccount = email === 'admin.craftszone@gmail.com' || email === 'customersupport@natrue.in';
    
    const profileData = {
      name,
      email,
      phone: phone || '',
      addresses: [],
      wishlist: [],
      role: isAdminAccount ? 'admin' : 'customer'
    };

    // Parallelize updates
    await Promise.all([
      updateProfile(result.user, { displayName: name }),
      createUserProfile(result.user.uid, profileData)
    ]);

    // Skip redundant fetch, set state instantly
    setUserProfile({ id: result.user.uid, ...profileData });
    return result;
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const isAdminAccount = result.user.email === 'admin.craftszone@gmail.com' || result.user.email === 'customersupport@natrue.in';
    
    let profile = await getUserProfile(result.user.uid);
    if (!profile || (isAdminAccount && profile.role !== 'admin')) {
      const profileData = profile ? { role: 'admin' } : {
        name: result.user.displayName || '',
        email: result.user.email || '',
        phone: result.user.phoneNumber || '',
        addresses: [],
        wishlist: [],
        role: isAdminAccount ? 'admin' : 'customer'
      };
      
      if (!profile) {
        await createUserProfile(result.user.uid, profileData);
        profile = { id: result.user.uid, ...profileData };
      } else {
        await updateUserProfile(result.user.uid, { role: 'admin' });
        profile = { ...profile, role: 'admin' };
      }
    }
    
    setUserProfile(profile);
    return result;
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setUserProfile(null);
  };

  const isAdmin = userProfile?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, login, register, loginWithGoogle, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
