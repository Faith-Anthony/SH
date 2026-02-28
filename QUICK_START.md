# SupportHub - Quick Start Guide

## 5-Minute Setup

### Step 1: Install Dependencies
```bash
cd F:\Projects\SH
npm install
```

### Step 2: Get Firebase Credentials
1. Go to https://console.firebase.google.com
2. Click "Create Project" (free tier)
3. Enable these services:
   - Authentication (Email/Password)
   - Firestore Database
   - Cloud Storage

### Step 3: Add Firebase Credentials
1. Copy your credentials from Firebase Console → Settings → General → Web
2. Create `.env` file in project root:
```
VITE_FIREBASE_API_KEY=your_key_here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

### Step 4: Run Locally
```bash
npm run dev
```
Open http://localhost:5173

### Step 5: Deploy to Vercel
```bash
npm install -g vercel
vercel
# Follow prompts
# Add env variables in Vercel dashboard
vercel --prod
```

## Test Users to Create

### Creator Account
- Email: creator@test.com
- Password: password123
- Select: "Creator" or "Both"
- On signup, create some tiers

### Member Account
- Email: member@test.com
- Password: password123
- Select: "Member"

## Quick Testing Flow

1. **Create Creator Account**
   - Go to localhost:5173/auth?type=signup
   - Select "Creator"
   - Fill form and submit

2. **Setup Creator Profile**
   - Go to Creator Dashboard
   - Click "+ Create Tier"
   - Create "Bronze - ₦5000/month" tier
   - Click "+ Create Post"
   - Create a public post

3. **Switch to Member Account (New Incognito Tab)**
   - Go to localhost:5173/auth?type=signup
   - Create member account
   - Search for creator by username
   - Subscribe to Bronze tier

4. **Test Access Control**
   - Create exclusive post (Bronze+ only)
   - View as member (should have access)
   - Create another tier (Silver)
   - Create Silver+ exclusive post
   - Try to access as Bronze subscriber (should be locked)

## Project Structure

```
SH/
├── src/
│   ├── App.jsx                 # Main router
│   ├── main.jsx                # Entry point
│   ├── index.css               # Global styles
│   ├── firebase.js             # Firebase config
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── Loading.jsx
│   │   ├── CreateTierModal.jsx
│   │   ├── CreatePostModal.jsx
│   │   └── SubscribeTierModal.jsx
│   ├── pages/
│   │   ├── HomePage.jsx
│   │   ├── AuthPage.jsx
│   │   ├── CreatorPage.jsx
│   │   ├── CreatorDashboard.jsx
│   │   ├── MemberDashboard.jsx
│   │   └── PostDetailPage.jsx
│   ├── store/
│   │   ├── authStore.js        # Zustand auth
│   │   ├── creatorStore.js     # Zustand creator
│   │   └── subscriptionStore.js # Zustand subscriptions
│   └── utils/
│       ├── accessControl.js    # Access logic
│       └── fileHandler.js      # File upload/download
├── package.json
├── vite.config.js
├── vercel.json
├── index.html
└── README.md
```

## Key Features to Show During Demo

### For Hiring Managers
1. **Authentication** - Working email/password with Firebase
2. **Multi-role System** - Creator and Member roles
3. **Subscription Logic** - Tier-based access control
4. **Revenue Tracking** - MRR calculation
5. **Access Control** - Protecting content
6. **Real-time Data** - Firestore integration
7. **Responsive UI** - Works on mobile
8. **Production Ready** - Deploy to Vercel in minutes

### "Wow" Moments to Highlight
- Create tier in seconds → content protected immediately
- Subscribe as different user → instant access
- Upgrade tier → content updates in real-time
- Revenue dashboard → shows real earnings
- Public creator page → browsable without login

## Common Issues & Fixes

### Issue: "Firebase config not found"
**Fix:** Make sure .env file exists with all VITE_FIREBASE_* variables

### Issue: "Firestore permission denied"
**Fix:** In Firebase Console, set Security Rules to:
```javascript
match /{document=**} {
  allow read, write: if true;
}
```
(Only for development! Production needs proper rules)

### Issue: "File upload fails"
**Fix:** Enable Cloud Storage in Firebase Console

### Issue: "npm install takes too long"
**Fix:** Use `npm install --prefer-offline` or `npm cache clean --force`

## Performance Tips

- Use Incognito mode for testing multiple accounts
- Clear localStorage if getting strange bugs
- Check Browser DevTools Console for Firebase errors
- Network tab shows Firestore requests

## Next Steps After Deploy

1. Setup custom domain
2. Add email verification
3. Setup email notifications
4. Add payment processor (Stripe/Paypal)
5. Build creator discovery page
6. Add analytics

---

**Questions? Check README.md, ARCHITECTURE.md, or ER_DIAGRAM.md**
