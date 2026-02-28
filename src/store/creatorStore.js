import { create } from 'zustand';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  query,
  where,
  getDocs,
  updateDoc,
  deleteDoc,
  addDoc,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase';

export const useCreatorStore = create((set, get) => ({
  tiers: [],
  posts: [],
  subscribers: [],
  revenue: 0,
  loading: false,

  // Get creator's tiers
  fetchTiers: async (creatorId) => {
    try {
      set({ loading: true });
      const q = query(collection(db, 'membershipTiers'), where('creatorId', '==', creatorId));
      const snapshot = await getDocs(q);
      const tiers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      set({ tiers, loading: false });
      return tiers;
    } catch (error) {
      console.error('Fetch tiers error:', error);
      set({ loading: false });
      return [];
    }
  },

  // Create tier
  createTier: async (creatorId, tierData) => {
    try {
      set({ loading: true });
      const tier = {
        ...tierData,
        creatorId,
        createdAt: Timestamp.now(),
        rank: tierData.rank || 1,
        benefits: tierData.benefits || []
      };

      const docRef = await addDoc(collection(db, 'membershipTiers'), tier);
      
      const newTier = { id: docRef.id, ...tier };
      set(state => ({ tiers: [...state.tiers, newTier], loading: false }));
      
      return { success: true, tier: newTier };
    } catch (error) {
      console.error('Create tier error:', error);
      set({ loading: false });
      return { success: false, error: error.message };
    }
  },

  // Update tier
  updateTier: async (tierId, updates) => {
    try {
      await updateDoc(doc(db, 'membershipTiers', tierId), updates);
      set(state => ({
        tiers: state.tiers.map(t => t.id === tierId ? { ...t, ...updates } : t)
      }));
      return { success: true };
    } catch (error) {
      console.error('Update tier error:', error);
      return { success: false, error: error.message };
    }
  },

  // Delete tier
  deleteTier: async (tierId) => {
    try {
      await deleteDoc(doc(db, 'membershipTiers', tierId));
      set(state => ({
        tiers: state.tiers.filter(t => t.id !== tierId)
      }));
      return { success: true };
    } catch (error) {
      console.error('Delete tier error:', error);
      return { success: false, error: error.message };
    }
  },

  // Create post
  createPost: async (creatorId, postData) => {
    try {
      set({ loading: true });
      const post = {
        ...postData,
        creatorId,
        createdAt: Timestamp.now(),
        visibility: postData.visibility || 'public',
        minTierRank: postData.minTierRank || 0,
        files: postData.files || []
      };

      const docRef = await addDoc(collection(db, 'posts'), post);
      
      const newPost = { id: docRef.id, ...post };
      set(state => ({ posts: [...state.posts, newPost], loading: false }));
      
      return { success: true, post: newPost };
    } catch (error) {
      console.error('Create post error:', error);
      set({ loading: false });
      return { success: false, error: error.message };
    }
  },

  // Fetch creator's posts
  fetchPosts: async (creatorId) => {
    try {
      set({ loading: true });
      const q = query(collection(db, 'posts'), where('creatorId', '==', creatorId));
      const snapshot = await getDocs(q);
      const posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      set({ posts, loading: false });
      return posts;
    } catch (error) {
      console.error('Fetch posts error:', error);
      set({ loading: false });
      return [];
    }
  },

  // Delete post
  deletePost: async (postId) => {
    try {
      await deleteDoc(doc(db, 'posts', postId));
      set(state => ({
        posts: state.posts.filter(p => p.id !== postId)
      }));
      return { success: true };
    } catch (error) {
      console.error('Delete post error:', error);
      return { success: false, error: error.message };
    }
  },

  // Fetch subscribers
  fetchSubscribers: async (creatorId) => {
    try {
      set({ loading: true });
      const q = query(
        collection(db, 'subscriptions'),
        where('creatorId', '==', creatorId),
        where('status', '==', 'active')
      );
      const snapshot = await getDocs(q);
      const subscribers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      set({ subscribers, loading: false });
      return subscribers;
    } catch (error) {
      console.error('Fetch subscribers error:', error);
      set({ loading: false });
      return [];
    }
  },

  // Calculate revenue
  calculateRevenue: async (creatorId) => {
    try {
      const subscribers = await get().fetchSubscribers(creatorId);
      const tiers = await get().fetchTiers(creatorId);
      
      let total = 0;
      subscribers.forEach(sub => {
        const tier = tiers.find(t => t.id === sub.tierId);
        if (tier) {
          total += tier.monthlyPrice;
        }
      });
      
      set({ revenue: total });
      return total;
    } catch (error) {
      console.error('Calculate revenue error:', error);
      return 0;
    }
  }
}));
