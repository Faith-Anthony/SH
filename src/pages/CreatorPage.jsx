import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useSubscriptionStore } from '../store/subscriptionStore';
import { getCreatorProfile, getCreatorTiers, getCreatorPublicPosts, checkPostAccess } from '../utils/accessControl';
import SubscribeTierModal from '../components/SubscribeTierModal';

function CreatorPage() {
  const { username } = useParams();
  const { user } = useAuthStore();
  const { subscribe } = useSubscriptionStore();

  const [creator, setCreator] = useState(null);
  const [tiers, setTiers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);
  const [selectedTier, setSelectedTier] = useState(null);

  useEffect(() => {
    const loadCreator = async () => {
      try {
        const creatorData = await getCreatorProfile(username);
        if (creatorData) {
          setCreator(creatorData);

          const [tiersData, postsData] = await Promise.all([
            getCreatorTiers(creatorData.id),
            getCreatorPublicPosts(creatorData.id)
          ]);

          setTiers(tiersData.sort((a, b) => a.rank - b.rank));
          setPosts(postsData);
        }
      } catch (error) {
        console.error('Load creator error:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCreator();
  }, [username]);

  if (loading) {
    return <div className="loading">Loading creator profile...</div>;
  }

  if (!creator) {
    return (
      <div className="container" style={{ paddingTop: '40px', textAlign: 'center' }}>
        <h1>Creator not found</h1>
        <p>The creator you're looking for doesn't exist.</p>
      </div>
    );
  }

  const handleSubscribe = (tier) => {
    if (!user) {
      window.location.href = '/auth?type=signup';
      return;
    }
    setSelectedTier(tier);
    setShowSubscribeModal(true);
  };

  return (
    <div>
      {/* Creator Header */}
      <div className="creator-header">
        <div className="container">
          <div className="creator-profile">
            <div className="creator-avatar">
              {creator.profileImage ? (
                <img src={creator.profileImage} alt={creator.username} />
              ) : (
                creator.username[0].toUpperCase()
              )}
            </div>
            <div className="creator-info">
              <h1>@{creator.username}</h1>
              <p>{creator.bio || 'A talented creator'}</p>
              <div className="flex" style={{ marginTop: '15px' }}>
                <button className="primary">
                  Follow
                </button>
                <button className="secondary">
                  Share
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: '40px', paddingBottom: '40px' }}>
        {/* Membership Tiers */}
        <section style={{ marginBottom: '60px' }}>
          <h2 style={{ marginBottom: '30px' }}>Membership Tiers</h2>
          {tiers.length === 0 ? (
            <p style={{ color: '#999' }}>No membership tiers available.</p>
          ) : (
            <div className="grid">
              {tiers.map(tier => (
                <div key={tier.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                  <h3>{tier.name}</h3>
                  <p style={{ fontSize: '28px', color: '#6366f1', fontWeight: 'bold', margin: '15px 0' }}>
                    ₦{tier.monthlyPrice}
                    <span style={{ fontSize: '14px', color: '#999', fontWeight: 'normal' }}>/month</span>
                  </p>
                  <p style={{ color: '#666', marginBottom: '15px', flex: 1 }}>
                    {tier.description}
                  </p>

                  {tier.benefits && tier.benefits.length > 0 && (
                    <div style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #e5e7eb' }}>
                      <strong style={{ display: 'block', marginBottom: '10px' }}>What's included:</strong>
                      <ul style={{ marginLeft: '20px' }}>
                        {tier.benefits.map((benefit, idx) => (
                          <li key={idx} style={{ marginBottom: '5px' }}>
                            ✓ {benefit}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <button
                    className="primary"
                    style={{ width: '100%' }}
                    onClick={() => handleSubscribe(tier)}
                  >
                    {user ? 'Subscribe' : 'Sign Up & Subscribe'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Posts */}
        <section>
          <h2 style={{ marginBottom: '30px' }}>Recent Posts</h2>
          {posts.length === 0 ? (
            <p style={{ color: '#999' }}>No posts yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {posts.map(post => (
                <div key={post.id} className="card" style={{ borderLeft: '4px solid #6366f1' }}>
                  <h3>{post.title}</h3>
                  <p style={{ color: '#666', marginTop: '10px' }}>
                    {post.description}
                  </p>
                  <div style={{ marginTop: '15px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                    {post.minTierRank > 0 && (
                      <span className="badge warning">
                        Exclusive: Tier {post.minTierRank}+
                      </span>
                    )}
                    <button className="secondary">Read More</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {showSubscribeModal && selectedTier && (
        <SubscribeTierModal
          creator={creator}
          tier={selectedTier}
          onClose={() => setShowSubscribeModal(false)}
        />
      )}
    </div>
  );
}

export default CreatorPage;
