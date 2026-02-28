import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useSubscriptionStore } from '../store/subscriptionStore';
import { getCreatorProfile, getCreatorPublicPosts } from '../utils/accessControl';

function MemberDashboard() {
  const { user, userProfile } = useAuthStore();
  const { subscriptions, fetchMemberSubscriptions } = useSubscriptionStore();
  const [creators, setCreators] = useState([]);
  const [activeTab, setActiveTab] = useState('subscriptions');

  useEffect(() => {
    if (user) {
      fetchMemberSubscriptions(user.uid);
    }
  }, [user, fetchMemberSubscriptions]);

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
          <p style={{ color: '#999', marginBottom: '30px' }}>
            Explore creators and their membership tiers. Start supporting your favorite creators today!
          </p>
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p style={{ color: '#666', fontSize: '18px' }}>Feature coming soon</p>
            <p style={{ color: '#999' }}>Creator discovery page will be available shortly.</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default MemberDashboard;
