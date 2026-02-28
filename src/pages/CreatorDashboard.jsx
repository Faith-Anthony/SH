import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useCreatorStore } from '../store/creatorStore';
import CreateTierModal from '../components/CreateTierModal';
import CreatePostModal from '../components/CreatePostModal';

function CreatorDashboard() {
  const { user, userProfile } = useAuthStore();
  const {
    tiers,
    posts,
    subscribers,
    revenue,
    fetchTiers,
    fetchPosts,
    fetchSubscribers,
    calculateRevenue,
    loading
  } = useCreatorStore();

  const [showTierModal, setShowTierModal] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);

  useEffect(() => {
    if (user) {
      fetchTiers(user.uid);
      fetchPosts(user.uid);
      fetchSubscribers(user.uid);
      calculateRevenue(user.uid);
    }
  }, [user, fetchTiers, fetchPosts, fetchSubscribers, calculateRevenue]);

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="container" style={{ paddingTop: '40px', paddingBottom: '40px' }}>
      <h1>Creator Dashboard</h1>
      <p style={{ color: '#666', marginBottom: '30px' }}>Manage your membership tiers, posts, and subscribers.</p>

      {/* Stats Grid */}
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: '40px' }}>
        <div className="card">
          <h3 style={{ color: '#6366f1' }}>Monthly Revenue</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold' }}>₦{revenue.toLocaleString()}</p>
        </div>

        <div className="card">
          <h3 style={{ color: '#6366f1' }}>Active Subscribers</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold' }}>{subscribers.length}</p>
        </div>

        <div className="card">
          <h3 style={{ color: '#6366f1' }}>Membership Tiers</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold' }}>{tiers.length}</p>
        </div>

        <div className="card">
          <h3 style={{ color: '#6366f1' }}>Total Posts</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold' }}>{posts.length}</p>
        </div>
      </div>

      {/* Membership Tiers Section */}
      <div className="card">
        <div className="flex-between" style={{ marginBottom: '20px' }}>
          <h2>Membership Tiers</h2>
          <button className="primary" onClick={() => setShowTierModal(true)}>
            + Create Tier
          </button>
        </div>

        {tiers.length === 0 ? (
          <p style={{ color: '#999' }}>No tiers created yet. Create your first tier!</p>
        ) : (
          <div className="grid">
            {tiers.map(tier => (
              <div key={tier.id} className="card" style={{ background: '#f9fafb' }}>
                <h3>{tier.name}</h3>
                <p style={{ fontSize: '24px', color: '#6366f1', fontWeight: 'bold' }}>
                  ₦{tier.monthlyPrice}/month
                </p>
                <p>{tier.description}</p>
                {tier.benefits && (
                  <div style={{ marginTop: '15px' }}>
                    <strong>Benefits:</strong>
                    <ul style={{ marginTop: '10px', marginLeft: '20px' }}>
                      {tier.benefits.map((benefit, idx) => (
                        <li key={idx}>{benefit}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <p style={{ marginTop: '15px', color: '#666', fontSize: '12px' }}>
                  Rank: {tier.rank}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Posts Section */}
      <div className="card" style={{ marginTop: '40px' }}>
        <div className="flex-between" style={{ marginBottom: '20px' }}>
          <h2>Your Posts</h2>
          <button className="primary" onClick={() => setShowPostModal(true)}>
            + Create Post
          </button>
        </div>

        {posts.length === 0 ? (
          <p style={{ color: '#999' }}>No posts yet. Create your first post!</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {posts.map(post => (
              <div key={post.id} style={{ padding: '15px', background: '#f9fafb', borderRadius: '6px', borderLeft: '4px solid #6366f1' }}>
                <div className="flex-between">
                  <div>
                    <h4>{post.title}</h4>
                    <p style={{ color: '#666', fontSize: '14px', marginTop: '5px' }}>
                      {post.description}
                    </p>
                    <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                      <span className={`badge ${post.visibility === 'public' ? 'info' : 'warning'}`}>
                        {post.visibility}
                      </span>
                      {post.minTierRank > 0 && (
                        <span className="badge success">Tier: {post.minTierRank}+</span>
                      )}
                    </div>
                  </div>
                  <button className="secondary" style={{ height: 'fit-content' }}>
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Subscribers Section */}
      <div className="card" style={{ marginTop: '40px' }}>
        <h2 style={{ marginBottom: '20px' }}>Recent Subscribers</h2>

        {subscribers.length === 0 ? (
          <p style={{ color: '#999' }}>No subscribers yet.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                  <th style={{ textAlign: 'left', padding: '10px' }}>Member</th>
                  <th style={{ textAlign: 'left', padding: '10px' }}>Tier</th>
                  <th style={{ textAlign: 'left', padding: '10px' }}>Price</th>
                  <th style={{ textAlign: 'left', padding: '10px' }}>Status</th>
                  <th style={{ textAlign: 'left', padding: '10px' }}>Renewal</th>
                </tr>
              </thead>
              <tbody>
                {subscribers.slice(0, 10).map(sub => (
                  <tr key={sub.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '10px' }}>{sub.memberEmail || 'Unknown'}</td>
                    <td style={{ padding: '10px' }}>{sub.tierName}</td>
                    <td style={{ padding: '10px' }}>₦{sub.monthlyPrice}</td>
                    <td style={{ padding: '10px' }}>
                      <span className={`badge ${sub.status === 'active' ? 'success' : 'warning'}`}>
                        {sub.status}
                      </span>
                    </td>
                    <td style={{ padding: '10px' }}>
                      {sub.renewalDate && new Date(sub.renewalDate.seconds * 1000).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      {showTierModal && (
        <CreateTierModal creatorId={user.uid} onClose={() => setShowTierModal(false)} />
      )}

      {showPostModal && (
        <CreatePostModal creatorId={user.uid} tiers={tiers} onClose={() => setShowPostModal(false)} />
      )}
    </div>
  );
}

export default CreatorDashboard;
