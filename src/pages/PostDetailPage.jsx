import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { useAuthStore } from '../store/authStore';
import { db } from '../firebase';
import { checkPostAccess } from '../utils/accessControl';
import ReactMarkdown from 'react-markdown';

function PostDetailPage() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [post, setPost] = useState(null);
  const [creator, setCreator] = useState(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPost = async () => {
      try {
        const postRef = doc(db, 'posts', postId);
        const postSnap = await getDoc(postRef);

        if (postSnap.exists()) {
          const postData = postSnap.data();
          setPost({ id: postSnap.id, ...postData });

          // Load creator info
          const creatorRef = doc(db, 'userProfiles', postData.creatorId);
          const creatorSnap = await getDoc(creatorRef);
          if (creatorSnap.exists()) {
            setCreator(creatorSnap.data());
          }

          // Check access
          if (user) {
            const access = await checkPostAccess(user.uid, postId);
            setHasAccess(access.hasAccess);
          }
        }
      } catch (error) {
        console.error('Load post error:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [postId, user]);

  if (loading) {
    return <div className="loading">Loading post...</div>;
  }

  if (!post) {
    return (
      <div className="container" style={{ paddingTop: '40px' }}>
        <h1>Post not found</h1>
        <button className="primary" onClick={() => navigate('/')}>
          Go back
        </button>
      </div>
    );
  }

  if (post.visibility === 'tier-restricted' && !hasAccess && user?.uid !== post.creatorId) {
    return (
      <div className="container" style={{ paddingTop: '40px' }}>
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>🔒</div>
          <h1>This content is exclusive</h1>
          <p style={{ color: '#666', marginTop: '15px' }}>
            Subscribe to {creator?.username}'s membership to access this content.
          </p>
          <button
            className="primary"
            style={{ marginTop: '30px' }}
            onClick={() => navigate(`/creator/${creator?.username}`)}
          >
            Subscribe Now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh' }}>
      <article className="container" style={{ paddingTop: '40px', paddingBottom: '40px', maxWidth: '800px' }}>
        <button
          className="secondary"
          onClick={() => navigate(-1)}
          style={{ marginBottom: '30px' }}
        >
          ← Back
        </button>

        <header style={{ marginBottom: '40px' }}>
          <h1 style={{ marginBottom: '15px' }}>{post.title}</h1>
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center', color: '#666', fontSize: '14px' }}>
            {creator && (
              <>
                <span>by @{creator.username}</span>
                <span>•</span>
              </>
            )}
            <span>
              {new Date(post.createdAt?.seconds * 1000 || Date.now()).toLocaleDateString()}
            </span>
            {post.minTierRank > 0 && (
              <>
                <span>•</span>
                <span className="badge warning">
                  Exclusive Content
                </span>
              </>
            )}
          </div>
        </header>

        {post.description && (
          <p style={{ fontSize: '18px', color: '#555', marginBottom: '30px', borderBottom: '1px solid #e5e7eb', paddingBottom: '20px' }}>
            {post.description}
          </p>
        )}

        <div className="card" style={{ background: 'white', padding: '30px' }}>
          <ReactMarkdown>{post.content || 'No content available'}</ReactMarkdown>
        </div>

        {post.files && post.files.length > 0 && (
          <div className="card" style={{ marginTop: '30px' }}>
            <h3>Attached Files</h3>
            <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {post.files.map((file, idx) => (
                <div key={idx} style={{ padding: '15px', background: '#f9fafb', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ fontWeight: '600' }}>📄 {file.name}</p>
                    <p style={{ color: '#666', fontSize: '12px', marginTop: '5px' }}>
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button className="primary">
                    Download
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </article>
    </div>
  );
}

export default PostDetailPage;
