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
  Timestamp,
  addDoc
} from 'firebase/firestore';
import { db } from '../firebase';

export const useSubscriptionStore = create((set, get) => ({
  subscriptions: [],
  loading: false,

  // Subscribe to tier
  subscribe: async (memberId, creatorId, tierId, tierData) => {
    try {
      set({ loading: true });
      
      const now = new Date();
      const renewDate = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());

      const subscription = {
        memberId,
        creatorId,
        tierId,
        tierName: tierData.name,
        monthlyPrice: tierData.monthlyPrice,
        status: 'active',
        startDate: Timestamp.now(),
        renewalDate: Timestamp.fromDate(renewDate),
        createdAt: Timestamp.now(),
        canceledAt: null,
        upgradedFrom: null
      };

      const docRef = await addDoc(collection(db, 'subscriptions'), subscription);
      
      const newSub = { id: docRef.id, ...subscription };
      set(state => ({ subscriptions: [...state.subscriptions, newSub], loading: false }));
      
      return { success: true, subscription: newSub };
    } catch (error) {
      console.error('Subscribe error:', error);
      set({ loading: false });
      return { success: false, error: error.message };
    }
  },

  // Get member subscriptions
  fetchMemberSubscriptions: async (memberId) => {
    try {
      set({ loading: true });
      const q = query(collection(db, 'subscriptions'), where('memberId', '==', memberId));
      const snapshot = await getDocs(q);
      const subscriptions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      set({ subscriptions, loading: false });
      return subscriptions;
    } catch (error) {
      console.error('Fetch subscriptions error:', error);
      set({ loading: false });
      return [];
    }
  },

  // Check if has active subscription to creator tier
  hasAccess: async (memberId, creatorId, requiredTierRank) => {
    try {
      const q = query(
        collection(db, 'subscriptions'),
        where('memberId', '==', memberId),
        where('creatorId', '==', creatorId),
        where('status', '==', 'active')
      );
      
      const snapshot = await getDocs(q);
      if (snapshot.empty) return false;

      // Check if subscription tier rank >= required tier rank
      for (const subscriptionDoc of snapshot.docs) {
        const sub = subscriptionDoc.data();
        const tierRef = doc(db, 'membershipTiers', sub.tierId);
        const tierSnap = await getDoc(tierRef);
        
        if (tierSnap.exists() && tierSnap.data().rank >= requiredTierRank) {
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Has access check error:', error);
      return false;
    }
  },

  // Upgrade subscription
  upgradeTier: async (subscriptionId, newTierId, newTierData) => {
    try {
      set({ loading: true });

      const subRef = doc(db, 'subscriptions', subscriptionId);
      const subSnap = await getDoc(subRef);
      const oldSub = subSnap.data();

      // Create new subscription for upgrade
      const upgradedSub = {
        ...oldSub,
        tierId: newTierId,
        tierName: newTierData.name,
        monthlyPrice: newTierData.monthlyPrice,
        upgradedFrom: subscriptionId,
        startDate: Timestamp.now()
      };

      await updateDoc(subRef, { status: 'upgraded' });
      const docRef = await addDoc(collection(db, 'subscriptions'), upgradedSub);
      
      const newSub = { id: docRef.id, ...upgradedSub };
      set(state => ({
        subscriptions: [
          ...state.subscriptions.filter(s => s.id !== subscriptionId),
          newSub
        ],
        loading: false
      }));
      
      return { success: true, subscription: newSub };
    } catch (error) {
      console.error('Upgrade error:', error);
      set({ loading: false });
      return { success: false, error: error.message };
    }
  },

  // Cancel subscription
  cancelSubscription: async (subscriptionId) => {
    try {
      set({ loading: true });
      
      await updateDoc(doc(db, 'subscriptions', subscriptionId), {
        status: 'canceled',
        canceledAt: Timestamp.now()
      });

      set(state => ({
        subscriptions: state.subscriptions.map(s =>
          s.id === subscriptionId ? { ...s, status: 'canceled', canceledAt: new Date() } : s
        ),
        loading: false
      }));

      return { success: true };
    } catch (error) {
      console.error('Cancel error:', error);
      set({ loading: false });
      return { success: false, error: error.message };
    }
  },

  // Check subscription expiry and update statuses
  checkAndUpdateExpired: async (memberId) => {
    try {
      const subs = await get().fetchMemberSubscriptions(memberId);
      const now = new Date();

      for (const sub of subs) {
        if (sub.status === 'active' && sub.renewalDate) {
          const renewalDate = sub.renewalDate.toDate?.() || new Date(sub.renewalDate);
          if (now > renewalDate) {
            await updateDoc(doc(db, 'subscriptions', sub.id), {
              status: 'expired'
            });
          }
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Update expired error:', error);
      return { success: false, error: error.message };
    }
  }
}));
