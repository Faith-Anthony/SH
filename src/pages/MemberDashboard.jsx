import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useSubscriptionStore } from '../store/subscriptionStore';
import { getCreatorProfile, getCreatorPublicPosts, getCreatorTiers } from '../utils/accessControl';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import SubscribeTierModal from '../components/SubscribeTierModal';

function MemberDashboard() {
  const { user, userProfile } = useAuthStore();
  const { subscriptions, fetchMemberSubscriptions, checkAndUpdateExpired, subscribe } = useSubscriptionStore();
  const [creators, setCreators] = useState([]);
  const [activeTab, setActiveTab] = useState('subscriptions');
  const [loading, setLoading] = useState(false);
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);
  const [selectedTier, setSelectedTier] = useState(null);
  const [selectedCreator, setSelectedCreator] = useState(null);
  const [creatorsList, setCreatorsList] = useState([]);

  useEffect(() => {
    if (user) {
      // Check and update expired subscriptions first
      checkAndUpdateExpired(user.uid);
      // Then fetch fresh subscriptions
      fetchMemberSubscriptions(user.uid);
    }
  }, [user, fetchMemberSubscriptions, checkAndUpdateExpired]);

  // Get unique creators from subscriptions
  useEffect(() => {
    const loadCreators = async () => {
      const uniqueCreators = new Set(subscriptions.map(s => s.creatorId));
      const creatorData = [];

      for (const creatorId of uniqueCreators) {
        // In a real app, you'd fetch creator details from DB
        creatorData.push({
          id: creatorId,
          name: `Creator ${creatorId.substring(0, 8)}`
        });
      }

      setCreators(creatorData);
    };

    if (subscriptions.length > 0) {
      loadCreators();
    }
  }, [subscriptions]);

  // Load all creators for Browse tab
  useEffect(() => {
    if (activeTab === 'Browse') {
      loadAllCreators();
    }
  }, [activeTab]);

  const loadAllCreators = async () => {
    try {
      setLoading(true);
      // Query all users where isCreator is true
      const q = query(collection(db, 'userProfiles'), where('isCreator', '==', true));
      const snapshot = await getDocs(q);
      
      const creatorsData = [];
      for (const doc of snapshot.docs) {
        const creatorData = doc.data();
        // Get creator's public posts count and tiers
        const [posts, tiers] = await Promise.all([
          getCreatorPublicPosts(doc.id),
          getCreatorTiers(doc.id)
        ]);
        creatorsData.push({
          id: doc.id,
          ...creatorData,
          postCount: posts.length,
          membershipTiers: tiers
        });
      }
      
      setCreatorsList(creatorsData);
    } catch (error) {
      console.error('Load creators error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribeClick = async (creator, tier) => {
    setSelectedCreator(creator);
    setSelectedTier(tier);
    setShowSubscribeModal(true);
  };

  const handleSubscribeSubmit = async () => {
    if (!selectedCreator || !selectedTier) return;
    
    const result = await subscribe(user.uid, selectedCreator.id, selectedTier.id, selectedTier);
    if (result.success) {
      setShowSubscribeModal(false);
      setSelectedTier(null);
      setSelectedCreator(null);
      // Refresh subscriptions
      fetchMemberSubscriptions(user.uid);
    }
  };

  const activeSubscriptions = subscriptions.filter(s => s.status === 'active');
  const expiredSubscriptions = subscriptions.filter(s => s.status === 'expired');

  return (
    <div className="container" style={{ paddingTop: '40px', paddingBottom: '40px' }}>
      <h1>Your Dashboard</h1>
      <p style={{ color: '#666', marginBottom: '30px' }}>Manage your subscriptions and access exclusive content.</p>

      {/* Stats */}
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: '40px' }}>
        <div className="card">
          <h3 style={{ color: '#6366f1' }}>Active Subscriptions</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold' }}>{activeSubscriptions.length}</p>
        </div>

        <div className="card">
          <h3 style={{ color: '#6366f1' }}>Total Spent (Month)</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold' }}>
            ₦{activeSubscriptions.reduce((sum, s) => sum + (s.monthlyPrice || 0), 0).toLocaleString()}
          </p>
        </div>

        <div className="card">
          <h3 style={{ color: '#6366f1' }}>Creators Supported</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold' }}>{creators.length}</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ marginBottom: '20px', borderBottom: '1px solid #e5e7eb', display: 'flex', gap: '20px' }}>
        <button
          onClick={() => setActiveTab('subscriptions')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'subscriptions' ? '3px solid #6366f1' : 'none',
            padding: '10px 0',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: activeTab === 'subscriptions' ? '600' : '400',
            color: activeTab === 'subscriptions' ? '#6366f1' : '#999'
          }}
        >
          My Subscriptions
        </button>
        <button
          onClick={() => setActiveTab('Browse')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'Browse' ? '3px solid #6366f1' : 'none',
            padding: '10px 0',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: activeTab === 'Browse' ? '600' : '400',
            color: activeTab === 'Browse' ? '#6366f1' : '#999'
          }}
        >
          Browse Creators
        </button>
      </div>

      {activeTab === 'subscriptions' && (
        <div className="card">
          {activeSubscriptions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <p style={{ color: '#999', marginBottom: '20px' }}>No active subscriptions yet.</p>
              <p>Subscribe to a creator to access their exclusive content!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {activeSubscriptions.map(sub => (
                <div key={sub.id} style={{ padding: '20px', background: '#f9fafb', borderRadius: '6px', borderLeft: '4px solid #6366f1' }}>
                  <div className="flex-between">
                    <div style={{ flex: 1 }}>
                      <h3>{sub.tierName}</h3>
                      <p style={{ color: '#666', marginTop: '5px' }}>
                        ₦{sub.monthlyPrice} per month
                      </p>
                      <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                        <span className="badge success">Active</span>
                        {sub.renewalDate && (
                          <span style={{ fontSize: '12px', color: '#666' }}>
                            Renews: {new Date(sub.renewalDate.seconds * 1000).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div>
                      <button className="primary">View Content</button>
                      <button className="secondary" style={{ marginTop: '10px' }}>Manage</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {expiredSubscriptions.length > 0 && (
            <div style={{ marginTop: '40px' }}>
              <h3 style={{ marginBottom: '20px', color: '#ef4444' }}>Expired Subscriptions</h3>
              {expiredSubscriptions.map(sub => (
                <div key={sub.id} style={{ padding: '15px', background: '#fef2f2', borderRadius: '6px', marginBottom: '10px' }}>
                  <div className="flex-between">
                    <div>
                      <h4>{sub.tierName}</h4>
                      <p style={{ color: '#666', fontSize: '14px' }}>Expired</p>
                    </div>
                    <button className="primary">Renew Subscription</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'Browse' && (
        <div className="card">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <p style={{ color: '#666' }}>Loading creators...</p>
            </div>
          ) : creatorsList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <p style={{ color: '#666', fontSize: '18px' }}>No creators found yet</p>
              <p style={{ color: '#999' }}>Check back soon for amazing creators to support!</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
              {creatorsList.map(creator => (
                <div key={creator.id} className="card" style={{ border: '1px solid #e5e7eb', padding: '20px' }}>
                  <div style={{ marginBottom: '15px' }}>
                    <div style={{ fontSize: '40px', marginBottom: '10px' }}>
                      {creator.profileImage ? '📸' : '👤'}
                    </div>
                    <h3 style={{ marginBottom: '5px' }}>@{creator.username}</h3>
                    <p style={{ color: '#666', fontSize: '14px', marginBottom: '10px' }}>
                      {creator.bio || 'A talented creator'}
                    </p>
                    <p style={{ color: '#999', fontSize: '12px' }}>
                      {creator.postCount || 0} posts
                    </p>
                  </div>

                  <div style={{ marginTop: '20px' }}>
                    <h4 style={{ marginBottom: '10px', fontSize: '14px', fontWeight: '600' }}>Subscribe to:</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {creator.membershipTiers?.length > 0 ? (
                        creator.membershipTiers.map(tier => (
                          <button
                            key={tier.id}
                            onClick={() => handleSubscribeClick(creator, tier)}
                            style={{
                              padding: '8px 12px',
                              background: '#f3f4f6',
                              border: '1px solid #e5e7eb',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '13px',
                              transition: 'all 0.2s',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#6366f1';
                              e.currentTarget.style.color = 'white';
                              e.currentTarget.style.borderColor = '#6366f1';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = '#f3f4f6';
                              e.currentTarget.style.color = 'inherit';
                              e.currentTarget.style.borderColor = '#e5e7eb';
                            }}
                          >
                            <div style={{ fontWeight: '600' }}>{tier.name}</div>
                            <div style={{ fontSize: '11px', opacity: 0.8 }}>₦{tier.monthlyPrice}/mo</div>
                          </button>
                        ))
                      ) : (
                        <p style={{ fontSize: '12px', color: '#999' }}>No tiers yet</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showSubscribeModal && selectedTier && (
        <SubscribeTierModal
          tier={selectedTier}
          creator={selectedCreator}
          onClose={() => {
            setShowSubscribeModal(false);
            setSelectedTier(null);
            setSelectedCreator(null);
          }}
          onSubscribe={handleSubscribeSubmit}
        />
      )}
    </div>
  );
}

export default MemberDashboard;
