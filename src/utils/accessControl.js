import { getDoc, doc, query, collection, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Check if user has access to a post
 */
export async function checkPostAccess(userId, postId) {
  try {
    // Get the post
    const postRef = doc(db, 'posts', postId);
    const postSnap = await getDoc(postRef);

    if (!postSnap.exists()) {
      return { hasAccess: false, reason: 'Post not found' };
    }

    const post = postSnap.data();

    // Public posts - anyone can access
    if (post.visibility === 'public') {
      return { hasAccess: true };
    }

    // Private/tier-restricted posts - need subscription
    if (post.visibility === 'tier-restricted') {
      // Check if user is the creator
      if (post.creatorId === userId) {
        return { hasAccess: true, reason: 'Creator' };
      }

      // Check subscription
      const q = query(
        collection(db, 'subscriptions'),
        where('memberId', '==', userId),
        where('creatorId', '==', post.creatorId),
        where('status', '==', 'active')
      );

      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        return { hasAccess: false, reason: 'No active subscription' };
      }

      // Check tier rank
      for (const subscriptionDoc of snapshot.docs) {
        const sub = subscriptionDoc.data();
        const tierRef = doc(db, 'membershipTiers', sub.tierId);
        const tierSnap = await getDoc(tierRef);

        if (tierSnap.exists() && tierSnap.data().rank >= post.minTierRank) {
          return { hasAccess: true, reason: 'Valid subscription' };
        }
      }

      return { hasAccess: false, reason: 'Insufficient tier' };
    }

    return { hasAccess: false, reason: 'Unknown visibility' };
  } catch (error) {
    console.error('Access check error:', error);
    return { hasAccess: false, reason: error.message };
  }
}

/**
 * Check if user can download a file
 */
export async function checkFileAccess(userId, fileId, postId) {
  try {
    // First check post access
    const postAccess = await checkPostAccess(userId, postId);
    
    if (!postAccess.hasAccess) {
      return { hasAccess: false, reason: 'No post access' };
    }

    // Log file access
    await logFileAccess(userId, fileId, postId);

    return { hasAccess: true };
  } catch (error) {
    console.error('File access check error:', error);
    return { hasAccess: false, reason: error.message };
  }
}

/**
 * Log file download access
 */
export async function logFileAccess(userId, fileId, postId) {
  try {
    const { addDoc, Timestamp } = await import('firebase/firestore');
    
    await addDoc(collection(db, 'fileAccessLogs'), {
      userId,
      fileId,
      postId,
      accessedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Log access error:', error);
  }
}

/**
 * Get creator's public profile
 */
export async function getCreatorProfile(username) {
  try {
    const q = query(
      collection(db, 'userProfiles'),
      where('username', '==', username),
      where('isCreator', '==', true)
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return null;
    }

    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
  } catch (error) {
    console.error('Get creator profile error:', error);
    return null;
  }
}

/**
 * Get creator's public tiers
 */
export async function getCreatorTiers(creatorId) {
  try {
    const q = query(
      collection(db, 'membershipTiers'),
      where('creatorId', '==', creatorId)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Get creator tiers error:', error);
    return [];
  }
}

/**
 * Get creator's public posts
 */
export async function getCreatorPublicPosts(creatorId) {
  try {
    const q = query(
      collection(db, 'posts'),
      where('creatorId', '==', creatorId),
      where('visibility', '==', 'public')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Get creator posts error:', error);
    return [];
  }
}

/**
 * Verify user role
 */
export async function verifyUserRole(userId, role) {
  try {
    const profileRef = doc(db, 'userProfiles', userId);
    const profileSnap = await getDoc(profileRef);

    if (!profileSnap.exists()) {
      return false;
    }

    const profile = profileSnap.data();
    if (role === 'creator') {
      return profile.isCreator === true;
    }
    if (role === 'member') {
      return profile.isMember === true;
    }

    return false;
  } catch (error) {
    console.error('Verify role error:', error);
    return false;
  }
}
