import { useState } from 'react';
import { useCreatorStore } from '../store/creatorStore';

function CreatePostModal({ creatorId, tiers, onClose, isEdit = false, post = null }) {
  const { createPost, updatePost, loading } = useCreatorStore();
  
  // Safely get post data with defaults
  const getPostValue = (field, defaultValue) => {
    if (!isEdit || !post) return defaultValue;
    return post[field] !== undefined ? post[field] : defaultValue;
  };

  const [formData, setFormData] = useState({
    title: getPostValue('title', ''),
    description: getPostValue('description', ''),
    content: getPostValue('content', ''),
    visibility: getPostValue('visibility', 'public'),
    minTierRank: getPostValue('minTierRank', 0).toString()
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const postData = {
      title: formData.title,
      description: formData.description,
      content: formData.content,
      visibility: formData.visibility,
      minTierRank: parseInt(formData.minTierRank)
    };

    let result;
    if (isEdit) {
      result = await updatePost(post.id, postData);
      if (result.success) {
        alert('Post updated successfully!');
      } else {
        alert('Error: ' + result.error);
      }
    } else {
      result = await createPost(creatorId, postData);
      if (result.success) {
        alert('Post created successfully!');
      } else {
        alert('Error: ' + result.error);
      }
    }

    if (result.success) {
      onClose();
    }
  };

  return (
    <div className="modal active">
      <div className="modal-content" style={{ maxWidth: '600px' }}>
        <h2>{isEdit ? 'Edit Post' : 'Create New Post'}</h2>

        <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Post title"
              required
            />
          </div>

          <div className="form-group">
            <label>Description (short summary)</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Brief description..."
              rows="2"
              required
            />
          </div>

          <div className="form-group">
            <label>Content (markdown supported)</label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="Write your content here... Use markdown for formatting."
              rows="6"
              required
            />
          </div>

          <div className="form-group">
            <label>Visibility</label>
            <select
              name="visibility"
              value={formData.visibility}
              onChange={handleChange}
            >
              <option value="public">Public (everyone can see)</option>
              <option value="tier-restricted">Exclusive (members only)</option>
            </select>
          </div>

          {formData.visibility === 'tier-restricted' && (
            <div className="form-group">
              <label>Minimum Tier Required</label>
              <select
                name="minTierRank"
                value={formData.minTierRank}
                onChange={handleChange}
              >
                <option value="0">All subscribers</option>
                {Array.isArray(tiers) && tiers.map(tier => (
                  <option key={tier.id} value={tier.rank || 0}>
                    {tier.name || 'Unnamed'} (Rank {tier.rank || 0})
                  </option>
                ))}
              </select>
              {formData.minTierRank === '0' && formData.visibility === 'tier-restricted' && (
                <p style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
                  It's recommended to select a specific tier for exclusive content.
                </p>
              )}
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="submit"
              className="primary"
              disabled={loading}
              style={{ flex: 1 }}
            >
              {loading ? (isEdit ? 'Updating...' : 'Creating...') : (isEdit ? 'Update Post' : 'Create Post')}
            </button>
            <button
              type="button"
              className="secondary"
              onClick={onClose}
              disabled={loading}
              style={{ flex: 1 }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreatePostModal;
