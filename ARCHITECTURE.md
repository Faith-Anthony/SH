# SupportHub - Architecture & Design Decisions

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Users (Web)                              │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                    ┌──────────┴──────────┐
                    │                     │
        ┌───────────▼─────────┐  ┌───────▼──────────┐
        │   React/Vite App    │  │   CSS/Styling    │
        │   (SPA Component)   │  │   Responsive UI  │
        └────────────┬────────┘  └──────────────────┘
                     │
        ┌────────────▼────────────┐
        │   State Management      │
        │   (Zustand Stores)      │
        │                         │
        │ - authStore             │
        │ - creatorStore          │
        │ - subscriptionStore     │
        └────────────┬────────────┘
                     │
        ┌────────────▼────────────┐
        │   Service Layer         │
        │                         │
        │ - accessControl         │
        │ - fileHandler           │
        └────────────┬────────────┘
                     │
        ┌────────────▼────────────────────────────────────┐
        │        Firebase Backend Services                │
        │                                                 │
        │  ┌──────────────┐  ┌──────────────────┐        │
        │  │ Auth Service │  │ Firestore DB    │        │
        │  │ (Users)      │  │ (Collections)   │        │
        │  └──────────────┘  └──────────────────┘        │
        │                                                 │
        │  ┌────────────────────────────────────┐        │
        │  │   Cloud Storage (File Upload)      │        │
        │  │   protected/ directory structure   │        │
        │  └────────────────────────────────────┘        │
        └────────────────────────────────────────────────┘
```

### Component Hierarchy

```
App.jsx (Main Router)
├── Navbar (Navigation)
├── HomePage (Public Landing)
├── AuthPage (Login/Signup)
├── CreatorPage (/creator/{username})
│   ├── CreatorProfile Header
│   ├── TierCard (for each tier)
│   └── PostCard (for each post)
├── CreatorDashboard (Protected)
│   ├── StatsGrid
│   ├── TiersList
│   ├── PostsList
│   ├── SubscribersList
│   ├── CreateTierModal
│   └── CreatePostModal
├── MemberDashboard (Protected)
│   ├── StatsGrid
│   ├── SubscriptionsList
│   └── TabView (Subscriptions/Browse)
└── PostDetailPage (/post/{postId})
    ├── PostHeader
    ├── PostContent (Markdown)
    └── FilesList
```

## State Management Flow

### Authentication Flow
```
App.jsx
├── useAuthStore (Zustand)
│   ├── initAuth() → Firebase onAuthStateChanged
│   ├── signup() → createUserWithEmailAndPassword + userProfile doc
│   ├── signin() → signInWithEmailAndPassword
│   ├── logout() → signOut
│   └── updateProfile() → setDoc merge
└── ProtectedRoutes based on user & userProfile.isCreator
```

### Creator Flow
```
CreatorDashboard
├── useCreatorStore (Zustand)
│   ├── fetchTiers(creatorId) → query membershipTiers
│   ├── createTier() → addDoc + state update
│   ├── fetchPosts(creatorId) → query posts
│   ├── createPost() → addDoc + state update
│   ├── fetchSubscribers() → query subscriptions (status=active)
│   └── calculateRevenue() → sum of active subscription prices
└── Display tiers, posts, subscriber list, MRR
```

### Subscription Flow
```
CreatorPage / SubscribeTierModal
├── User clicks subscribe
├── useSubscriptionStore.subscribe()
│   ├── Check if logged in (redirect if not)
│   ├── Create subscription doc with:
│   │   ├── memberId, creatorId, tierId
│   │   ├── status: 'active'
│   │   ├── startDate: now()
│   │   ├── renewalDate: now() + 1 month
│   └── Add to subscriptions store
└── Redirect to MemberDashboard
```

### Access Control Flow
```
PostDetailPage or file download
├── Call checkPostAccess(userId, postId)
│   ├── Fetch post
│   ├── If public → allow
│   ├── If tier-restricted:
│   │   ├── Check subscriptions where:
│   │   │   ├── memberId = userId
│   │   │   ├── creatorId = post.creatorId
│   │   │   ├── status = 'active'
│   │   │   └── renewalDate > now()
│   │   ├── For each subscription:
│   │   │   └── Check tier.rank >= post.minTierRank
│   │   └── Return hasAccess
│   └── Return reason for UI feedback
└── Render content or lock screen
```

## Data Flow Patterns

### Query Batching (Avoid N+1)

```javascript
// GOOD: Batch query
const subscriptions = await fetchSubscriptions(creatorId);
const tierIds = [...new Set(subscriptions.map(s => s.tierId))];
const tiers = await Promise.all(tierIds.map(id => getTier(id)));

// BAD: N+1 query (not implemented)
const subscriptions = await fetchSubscriptions(creatorId);
for (const sub of subscriptions) {
  const tier = await getTier(sub.tierId); // N queries!
}
```

### Firestore Collection References

```javascript
// Usage in stores:
import { collection, doc, query, where, getDocs } from 'firebase/firestore';

// Get creator's tiers
const q = query(
  collection(db, 'membershipTiers'),
  where('creatorId', '==', creatorId)
);
const snapshot = await getDocs(q);
```

## Security Architecture

### Authentication
- Firebase Auth handles email/password
- UID used as primary key in Firestore
- Session managed by Firebase SDK

### Authorization (Access Control)
- Client-side checks in `accessControl.js`
- Firestore Security Rules (recommended deployment)
- File access verified before download

### Data Privacy
- User profiles partially public (username, bio, isCreator flag)
- Subscriptions private (only member & creator can see)
- Posts public if visibility='public', tier-restricted otherwise

## File Upload Architecture

### Upload Flow
```
User selects file
  ↓
uploadFile() validates:
  - File size < 50MB
  - File type in allowed list
  ↓
Upload to Firebase Storage:
  - Path: protected/{postId}/{userId}/{timestamp}-{random}
  - Prevents direct URL access (path depth)
  ↓
Record metadata in Firestore:
  - files collection with storagePath
  - accessCount initialized to 0
  ↓
Return fileId to FE
```

### Download Flow
```
User clicks download
  ↓
checkFileAccess(userId, fileId, postId):
  - Verify post access
  - Log access to fileAccessLogs
  - Check rate limits (placeholder)
  ↓
Generate download token (temp auth)
  ↓
Stream file from Storage
```

## Performance Optimizations

### Implemented
- ✅ Zustand for minimal re-renders
- ✅ Collection-level queries instead of get()
- ✅ Batch related data fetches with Promise.all()
- ✅ Memoization of computed values (revenue)

### For Production (Future)
- [ ] Cloud Functions for subscription renewal
- [ ] Firestore caching
- [ ] CDN for static assets (Vercel handles)
- [ ] Image optimization with Next.js Image
- [ ] Code splitting per route

## Scalability Considerations

### Current Limits
- Firestore: 500M reads/day free tier
- Storage: 1GB free tier
- This app ~10-100 reads per user session

### Scaling Path
1. **Database**: Implement sharding on creatorId for hot creators
2. **Storage**: Move to Google Cloud Storage with CDN
3. **Functions**: Firebase Cloud Functions for automation
4. **Analytics**: Add Google Analytics for insights
5. **API**: REST API layer (add backend)

## Error Handling Strategy

```
Try-Catch Blocks:
├── Auth operations
│   └── Return {success, error}
├── Firestore queries
│   └── Log error, return [] or null
├── File uploads
│   └── Show user message
└── Subscription operations
    └── Detailed error messaging

User Feedback:
├── Success toast
├── Error message with reason
└── Loading states
```

## Testing Strategy (Manual for Demo)

### User Stories to Test

1. **Authentication**
   - Sign up as creator → Check userProfile.isCreator = true
   - Sign up as member → Check userProfile.isCreator = false
   - Login with wrong password → Show error

2. **Creator Workflow**
   - Create tier → Check appears on dashboard
   - Create public post → Check appears on creator page
   - Create exclusive post → Check locked for non-subscribers

3. **Member Workflow**
   - Subscribe to tier → Check appears in dashboard
   - View exclusive post → Check has access
   - Cancel subscription → Check status changes

4. **Access Control**
   - Subscribe to Bronze → Can't access Gold content
   - Upgrade to Gold → Can now access Gold content
   - Downgrade to Bronze → Loses Gold access

5. **File Operations**
   - Upload file to post → Check file appears
   - Download as subscriber → Check file access logged
   - Attempt download as non-subscriber → Check denied

## Deployment Architecture

### Local Development
```
npm run dev
├── Vite dev server (HMR)
├── Hot Module Replacement
└── Localhost:5173
```

### Production (Vercel)
```
Vercel Edge Network
├── Static assets (HTML, CSS, JS)
├── Deploy from Git (auto on push)
├── Environment variables (.env secret)
└── Auto HTTPS + CDN
```

---

**Architecture designed for quick MVP delivery while maintaining scalability principles.**
