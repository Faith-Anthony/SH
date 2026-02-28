import { useState } from 'react';
import { useCreatorStore } from '../store/creatorStore';

function CreateTierModal({ creatorId, onClose }) {
  const { createTier, loading } = useCreatorStore();
  const [formData, setFormData] = useState({
    name: '',
    monthlyPrice: '',
    description: '',
    benefits: '',
    rank: '1'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const benefits = formData.benefits
      .split('\n')
      .map(b => b.trim())
      .filter(b => b);

    const tierData = {
      name: formData.name,
      monthlyPrice: parseInt(formData.monthlyPrice),
      description: formData.description,
      benefits,
      rank: parseInt(formData.rank)
    };

    const result = await createTier(creatorId, tierData);

    if (result.success) {
      alert('Tier created successfully!');
      onClose();
    } else {
      alert('Error: ' + result.error);
    }
  };

  return (
    <div className="modal active">
      <div className="modal-content">
        <h2>Create Membership Tier</h2>

        <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
          <div className="form-group">
            <label>Tier Name (e.g., Bronze)</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Bronze"
              required
            />
          </div>

          <div className="form-group">
            <label>Monthly Price (₦)</label>
            <input
              type="number"
              name="monthlyPrice"
              value={formData.monthlyPrice}
              onChange={handleChange}
              placeholder="5000"
              min="100"
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe this tier..."
              rows="3"
              required
            />
          </div>

          <div className="form-group">
            <label>Benefits (one per line)</label>
            <textarea
              name="benefits"
              value={formData.benefits}
              onChange={handleChange}
              placeholder="Access to exclusive posts&#10;Monthly bonus content&#10;Direct message support"
              rows="4"
              required
            />
          </div>

          <div className="form-group">
            <label>Tier Rank (for access hierarchy)</label>
            <input
              type="number"
              name="rank"
              value={formData.rank}
              onChange={handleChange}
              min="1"
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="submit"
              className="primary"
              disabled={loading}
              style={{ flex: 1 }}
            >
              {loading ? 'Creating...' : 'Create Tier'}
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

export default CreateTierModal;
