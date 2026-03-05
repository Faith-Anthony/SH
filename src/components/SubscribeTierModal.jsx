import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useSubscriptionStore } from '../store/subscriptionStore';
import { useNavigate } from 'react-router-dom';

function SubscribeTierModal({ creator, tier, onClose }) {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { subscribe } = useSubscriptionStore();
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  const handleSubscribe = async () => {
    if (!user) {
      navigate('/auth?type=signup');
      return;
    }

    setLoading(true);
    const result = await subscribe(user.uid, creator.id, tier.id, tier);

    if (result.success) {
      setNotification({ type: 'success', message: `Successfully subscribed to ${tier.name}!` });
      setTimeout(() => {
        onClose();
        navigate('/dashboard');
      }, 1500);
    } else {
      setNotification({ type: 'error', message: 'Subscription failed: ' + result.error });
    }

    setLoading(false);
  };

  return (
    <div className="modal active">
      <div className="modal-content">
        <h2>Subscribe to {tier.name}</h2>

        <div style={{ margin: '20px 0', padding: '20px', background: '#f9fafb', borderRadius: '6px' }}>
          <p style={{ color: '#666', marginBottom: '15px' }}>
            Creator: <strong>@{creator.username}</strong>
          </p>
          <p style={{ fontSize: '24px', color: '#6366f1', fontWeight: 'bold', marginBottom: '15px' }}>
            ₦{tier.monthlyPrice}/month
          </p>
          <p style={{ color: '#666' }}>
            {tier.description}
          </p>

          {tier.benefits && tier.benefits.length > 0 && (
            <div style={{ marginTop: '20px' }}>
              <strong style={{ display: 'block', marginBottom: '10px' }}>You'll get:</strong>
              <ul style={{ marginLeft: '20px' }}>
                {tier.benefits.map((benefit, idx) => (
                  <li key={idx} style={{ marginBottom: '5px' }}>
                    ✓ {benefit}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div style={{ background: '#f0f9ff', padding: '15px', borderRadius: '6px', marginBottom: '20px' }}>
          <p style={{ fontSize: '12px', color: '#333' }}>
            <strong>Note:</strong> This is a demo. No real payment will be processed. Your subscription will be active immediately and renew monthly.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            className="primary"
            onClick={handleSubscribe}
            disabled={loading}
            style={{ flex: 1 }}
          >
            {loading ? 'Processing...' : 'Subscribe'}
          </button>
          <button
            className="secondary"
            onClick={onClose}
            disabled={loading}
            style={{ flex: 1 }}
          >
            Cancel
          </button>
        </div>

        {notification && (
          <div style={{
            marginTop: '15px',
            padding: '12px 16px',
            background: notification.type === 'success' ? '#d1fae5' : '#fee2e2',
            border: `1px solid ${notification.type === 'success' ? '#6ee7b7' : '#fca5a5'}`,
            color: notification.type === 'success' ? '#065f46' : '#991b1b',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            {notification.message}
          </div>
        )}
      </div>
    </div>
  );
}

export default SubscribeTierModal;
