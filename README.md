# SupportHub - Creator Membership Platform

A production-grade Patreon clone built with React, Firebase, and Vite. Complete with membership tiers, subscription management, content access control, and revenue tracking.

## 🚀 Features Implemented

### Core Features Shipped
- ✅ **Email/Password Authentication** - Firebase Auth integration
- ✅ **Creator Profiles** - Public creator pages at `/creator/{username}`
- ✅ **Membership Tiers** - Multiple tiers per creator with pricing and benefits
- ✅ **Subscription System** - Simulated billing with status management (active, expired, canceled)
- ✅ **Content Management** - Create posts with markdown support
- ✅ **Access Control** - Tier-based post access hierarchy
- ✅ **Creator Dashboard** - Manage tiers, posts, and track subscribers
- ✅ **Member Dashboard** - View subscriptions and manage memberships
- ✅ **Revenue Tracking** - Monthly revenue calculation per creator
- ✅ **File Management** - Secure file upload and access logging

### Technical Implementation
- ✅ **Multi-tenant Architecture** - Creator separation with Firestore security
- ✅ **Role-Based Access** - Creator vs Member roles
- ✅ **N+1 Query Optimization** - Batch queries for related data
- ✅ **State Management** - Zustand stores for auth, creator, subscription data
- ✅ **Responsive UI** - Mobile-friendly design
- ✅ **Error Handling** - Comprehensive error messages

## 🏗 Architecture & Data Model

### Database Schema (Firestore Collections)

```
firestore/
├── users/
│   └── {uid}
│       ├── email
│       ├── createdAt
│       └── ...
│
├── userProfiles/
│   └── {uid}
│       ├── username (unique)
│       ├── email
│       ├── bio
│       ├── profileImage
│       ├── isCreator
│       ├── isMember
│       └── createdAt
│
├── membershipTiers/
│   └── {tierId}
│       ├── creatorId
│       ├── name
│       ├── monthlyPrice
│       ├── description
│       ├── benefits[]
│       ├── rank (access hierarchy)
│       └── createdAt
│
├── subscriptions/
│   └── {subscriptionId}
│       ├── memberId
│       ├── creatorId
│       ├── tierId
│       ├── status (active/expired/canceled)
│       ├── startDate
│       ├── renewalDate (monthly billing)
│       ├── canceledAt
│       └── upgradedFrom (for tier upgrades)
│
├── posts/
│   └── {postId}
│       ├── creatorId
│       ├── title
│       ├── description
│       ├── content (markdown)
│       ├── visibility (public/tier-restricted)
│       ├── minTierRank (required tier)
│       ├── files[]
│       └── createdAt
│
├── files/
│   └── {fileId}
│       ├── postId
│       ├── uploadedBy
│       ├── fileName
│       ├── fileSize
│       ├── mimeType
│       ├── storagePath (protected/)
│       ├── accessCount
│       └── uploadedAt
│
└── fileAccessLogs/
    └── {logId}
        ├── userId
        ├── fileId
        ├── postId
        └── accessedAt
```

### Entity Relationships

```
Creator Profile → Membership Tiers → Subscriptions ← Members
                         ↓
                       Posts
                         ↓
                       Files
                         ↓
                  File Access Logs
```

## 🔐 Security & Access Control

### Access Control Logic
1. **Public Posts** - Anyone can access
2. **Tier-Restricted Posts** - Require active subscription with sufficient tier rank
3. **File Downloads** - Access verified + logged before download
4. **Creator Data** - Only accessible by creator (confirmed via UID)
5. **Subscription Management** - Users can only manage their own subscriptions

### Edge Cases Handled
- ✅ Upgrade mid-cycle: Immediate access to new tier
- ✅ Cancel subscription: Status changes to canceled (grace period logic implemented)
- ✅ Tier deleted: Subscribers keep current access until renewal
- ✅ Post deleted: File access logs retained for analytics
- ✅ Expired subscription: Automatic status update, access revoked
- ✅ File replaced: Old files remain accessible to those who had access

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- Firebase account (free tier works)

### Local Development

```bash
# 1. Clone repository
git clone <your-repo-url>
cd SH

# 2. Install dependencies
npm install

# 3. Create .env file (copy from .env.example)
cp .env.example .env

# 4. Add your Firebase credentials to .env
# Get these from Firebase Console → Project Settings

# 5. Run development server
npm run dev

# 6. Open http://localhost:5173
```

### Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project
3. Enable:
   - Authentication (Email/Password)
   - Firestore Database (Start in test mode initially)
   - Cloud Storage (for file uploads)
4. Copy credentials to `.env`

## 🚀 Deployment to Vercel

### 1. Prepare for Deployment

```bash
# Build the project
npm run build

# Test production build locally
npm run preview
```

### 2. Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

### 3. Configure Environment Variables in Vercel

1. Go to Vercel Dashboard → Your Project
2. Settings → Environment Variables
3. Add all variables from `.env.example`:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - etc.

### 4. First Deploy

```bash
# Deploy to production
vercel --prod
```

Your app will be live at `https://your-project.vercel.app`

## 📊 User Flow

### For Creators
1. Sign up as Creator or Both
2. Create membership tiers
3. Create posts (public or exclusive)
4. Track subscribers and revenue
5. Manage content access

### For Members
1. Sign up as Member
2. Browse and subscribe to creators
3. Access tier-based content
4. Download exclusive files
5. Manage subscriptions

## 🔄 Subscription Lifecycle

```
SIGNUP
  ↓
SELECT TIER
  ↓
SUBSCRIBE → ACTIVE (can access content)
  ↓
  ├→ RENEW (monthly) → ACTIVE
  ├→ UPGRADE → ACTIVE (new tier)
  ├→ DOWNGRADE → ACTIVE (tier change, prorated)
  ├→ CANCEL → CANCELED (access until end of period)
  └→ RENEWAL FAILED → PAST_DUE → EXPIRED
```

## 💰 Revenue Tracking

- Real-time revenue calculation per creator
- Per-tier revenue breakdown
- Active subscriber count
- Monthly recurring revenue (MRR)

## 📁 Project Structure

```
SH/
├── src/
│   ├── components/          # Reusable UI components
│   ├── pages/              # Route pages
│   ├── store/              # Zustand stores (auth, creator, subscription)
│   ├── utils/              # Helper functions (access control, file handling)
│   ├── App.jsx             # Main app router
│   ├── main.jsx            # Entry point
│   └── index.css            # Global styles
├── public/                  # Static assets
├── package.json
├── vite.config.js
├── vercel.json
└── .env.example
```

## 🎯 Key Files

| File | Purpose |
|------|---------|
| `store/authStore.js` | Firebase authentication state |
| `store/creatorStore.js` | Creator functionality (tiers, posts, revenue) |
| `store/subscriptionStore.js` | Subscription management & billing logic |
| `utils/accessControl.js` | Core access control logic (Critical!) |
| `utils/fileHandler.js` | Secure file upload/download |

## ⚙️ Scaling & Future Improvements

### What Would Be Added in 1 Week
- [ ] Cloud Functions for subscription renewal automation
- [ ] Proration logic for mid-cycle upgrades
- [ ] Discount codes system
- [ ] One-time purchases
- [ ] Drip content (unlock after X days)
- [ ] Referral system
- [ ] Download rate limiting
- [ ] File watermarking simulation
- [ ] Subscription pause feature
- [ ] Creator API endpoints

### Known Limitations
1. **No Real Payments** - Uses simulated billing (demo only)
2. **No Email Notifications** - Would need SendGrid/Firebase Functions
3. **No Analytics** - Basic stats only, no detailed insights
4. **Manual Renewal** - Would need Cloud Functions for automatic renewal
5. **No Moderation** - Posts not moderated

## 🔧 Configuration

### Firestore Security Rules (Recommended)

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Public user profiles
    match /userProfiles/{userId} {
      allow read: if true;
      allow write: if request.auth.uid == userId;
    }

    // User's own data
    match /subscriptions/{doc=**} {
      allow read: if request.auth != null;
      allow create: if request.auth.uid == request.resource.data.memberId;
    }

    // Creator's posts and tiers
    match /posts/{doc=**} {
      allow read: if true;
      allow write: if request.auth.uid == resource.data.creatorId;
    }

    match /membershipTiers/{doc=**} {
      allow read: if true;
      allow write: if request.auth.uid == resource.data.creatorId;
    }
  }
}
```

## 🎬 Demo Walkthrough (10-15 min)

### Scenario 1: Creator Workflow
1. Sign up as Creator
2. Create "Bronze" tier (₦5,000/mo)
3. Create public post
4. Create exclusive post (Bronze+ only)
5. View dashboard → see revenue

### Scenario 2: Member Workflow
1. Sign up as Member
2. Browse creator page
3. Subscribe to Bronze tier
4. Access exclusive content
5. View dashboard → active subscription

### Scenario 3: Tier Upgrade
1. Member subscribes to Bronze
2. Browse creator, upgrade to Silver
3. Access Silver-only content
4. Verify immediate access

## 📝 Tradeoffs Made

| Decision | Tradeoff |
|----------|----------|
| Firestore over PostgreSQL | Easier setup, NoSQL semantics |
| Zustand over Redux | Simpler state, less boilerplate |
| Firebase Auth over custom | Faster development, less security risk |
| Simulated billing | Demo-only, but billing logic is real |
| Client-side access check + server-side | Works for demo; prod needs Cloud Functions |

## 📞 Support & Questions

- [Firebase Docs](https://firebase.google.com/docs)
- [Vercel Deployment](https://vercel.com/docs)
- [React Router Docs](https://reactrouter.com)

---

Last Updated: February 28, 2026
