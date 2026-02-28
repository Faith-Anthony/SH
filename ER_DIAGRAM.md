# SupportHub - ER Diagram

```
USER PROFILES
├── uid (PK)
├── email
├── username
├── bio
├── profileImage
├── isCreator
├── isMember
└── createdAt

MEMBERSHIP TIERS
├── tierId (PK)
├── creatorId (FK) → USER PROFILES
├── name
├── monthlyPrice
├── description
├── benefits[]
├── rank
└── createdAt

SUBSCRIPTIONS
├── subscriptionId (PK)
├── memberId (FK) → USER PROFILES
├── creatorId (FK) → USER PROFILES
├── tierId (FK) → MEMBERSHIP TIERS
├── status (active/expired/canceled)
├── startDate
├── renewalDate
├── canceledAt
└── upgradedFrom

POSTS
├── postId (PK)
├── creatorId (FK) → USER PROFILES
├── title
├── description
├── content (markdown)
├── visibility (public/tier-restricted)
├── minTierRank
├── files[]
└── createdAt

FILES
├── fileId (PK)
├── postId (FK) → POSTS
├── uploadedBy (FK) → USER PROFILES
├── fileName
├── fileSize
├── mimeType
├── storagePath
├── accessCount
└── uploadedAt

FILE ACCESS LOGS
├── logId (PK)
├── userId (FK) → USER PROFILES
├── fileId (FK) → FILES
├── postId (FK) → POSTS
└── accessedAt
```

## Relationships

```
USER PROFILES
    ├── 1 to Many → MEMBERSHIP TIERS (creator side)
    ├── 1 to Many → SUBSCRIPTIONS (member side)
    ├── 1 to Many → SUBSCRIPTIONS (creator side)
    ├── 1 to Many → POSTS
    ├── 1 to Many → FILES
    └── 1 to Many → FILE ACCESS LOGS

MEMBERSHIP TIERS
    ├── 1 to Many → SUBSCRIPTIONS
    └── Many to 1 → USER PROFILES (creator)

SUBSCRIPTIONS
    ├── Many to 1 → MEMBERSHIP TIERS
    ├── Many to 1 → USER PROFILES (member)
    └── Many to 1 → USER PROFILES (creator)

POSTS
    ├── 1 to Many → FILES
    ├── Many to 1 → USER PROFILES (creator)
    └── 1 to Many → FILE ACCESS LOGS

FILES
    ├── Many to 1 → POSTS
    ├── Many to 1 → USER PROFILES (uploader)
    └── 1 to Many → FILE ACCESS LOGS

FILE ACCESS LOGS
    ├── Many to 1 → USER PROFILES
    ├── Many to 1 → FILES
    └── Many to 1 → POSTS
```

## Key Indices

For performance optimization:

```
MEMBERSHIP TIERS
- Index on (creatorId, rank)

SUBSCRIPTIONS
- Index on (memberId, status)
- Index on (creatorId, status)
- Index on (tierId)

POSTS
- Index on (creatorId, visibility)
- Index on (creatorId, createdAt)

FILE ACCESS LOGS
- Index on (userId, accessedAt)
- Index on (postId, accessedAt)
```

## Access Control Query Pattern

```
// Check if user can access post
SELECT subscriptions WHERE (
  memberId = {userId}
  AND creatorId = {post.creatorId}
  AND status = 'active'
  AND renewalDate > NOW()
)
THEN Check (subscription.tierRank >= post.minTierRank)
```
