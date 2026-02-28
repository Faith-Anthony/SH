import { create } from 'zustand';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../firebase';

export const useAuthStore = create((set, get) => ({
  user: null,
  userProfile: null,
  loading: true,
  error: null,

  // Initialize auth state
  initAuth: () => {
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          // Fetch user profile
          const profileRef = doc(db, 'userProfiles', firebaseUser.uid);
          const profileSnap = await getDoc(profileRef);
          
          set({
            user: firebaseUser,
            userProfile: profileSnap.exists() ? profileSnap.data() : null,
            loading: false,
            error: null
          });
        } else {
          set({
            user: null,
            userProfile: null,
            loading: false,
            error: null
          });
        }
        resolve();
      });
      
      return unsubscribe;
    });
  },

  // Sign up
  signup: async (email, password, username, userType = 'member') => {
    try {
      set({ loading: true, error: null });
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      // Create user profile
      const profileData = {
        uid,
        email,
        username,
        userType, // 'creator' or 'member' or 'both'
        createdAt: new Date(),
        bio: '',
        profileImage: null,
        isCreator: userType === 'creator' || userType === 'both',
        isMember: true
      };

      await setDoc(doc(db, 'userProfiles', uid), profileData);

      set({
        user: userCredential.user,
        userProfile: profileData,
        loading: false,
        error: null
      });

      return { success: true, user: userCredential.user };
    } catch (error) {
      const errorMessage = error.message || 'Signup failed';
      set({ error: errorMessage, loading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Sign in
  signin: async (email, password) => {
    try {
      set({ loading: true, error: null });
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const profileRef = doc(db, 'userProfiles', userCredential.user.uid);
      const profileSnap = await getDoc(profileRef);

      set({
        user: userCredential.user,
        userProfile: profileSnap.exists() ? profileSnap.data() : null,
        loading: false,
        error: null
      });

      return { success: true, user: userCredential.user };
    } catch (error) {
      const errorMessage = error.message || 'Login failed';
      set({ error: errorMessage, loading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Sign out
  logout: async () => {
    try {
      set({ loading: true });
      await signOut(auth);
      set({
        user: null,
        userProfile: null,
        loading: false,
        error: null
      });
      return { success: true };
    } catch (error) {
      const errorMessage = error.message || 'Logout failed';
      set({ error: errorMessage, loading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Update user profile
  updateProfile: async (updates) => {
    try {
      const { user } = get();
      if (!user) throw new Error('No user logged in');

      const profileRef = doc(db, 'userProfiles', user.uid);
      await setDoc(profileRef, updates, { merge: true });

      set(state => ({
        userProfile: { ...state.userProfile, ...updates }
      }));

      return { success: true };
    } catch (error) {
      const errorMessage = error.message || 'Update failed';
      set({ error: errorMessage });
      return { success: false, error: errorMessage };
    }
  }
}));
