# Content Posting Feasibility — Social Platform APIs

> **Date:** 2026-02-16  
> **Status:** Research complete

---

## Summary

| Platform | Direct Posting | Feasibility | Notes |
|---|---|---|---|
| **Instagram** | ⚠️ Limited | **Business/Creator accounts only** | Requires Facebook Business account + Graph API. Only supports: single image, carousel, reels, stories (via Content Publishing API). Personal accounts cannot post via API. |
| **X (Twitter)** | ✅ Yes | **Fully feasible** | Twitter API v2 supports creating tweets, threads, and media uploads. Requires OAuth 2.0 with PKCE or OAuth 1.0a. Free tier allows 1,500 tweets/month. |
| **LinkedIn** | ✅ Yes | **Fully feasible** | LinkedIn Marketing API supports posting text, articles, images, and videos to personal profiles and company pages. Requires OAuth 2.0. |
| **TikTok** | ⚠️ Limited | **Content Posting API exists** | TikTok Content Posting API allows uploading videos, but requires app review and approval. Not available for direct publishing of shorts/reels from web apps. Limited to approved developers. |
| **YouTube Shorts** | ✅ Yes | **Feasible via Data API v3** | YouTube Data API v3 supports video uploads. Shorts are just vertical videos ≤60s. Requires OAuth 2.0 consent screen. Quota costs 1600 units per upload (daily default: 10,000). |

---

## Detailed Findings

### Instagram (Graph API)

**What works:**
- Content Publishing API for Business/Creator accounts
- Single images, carousels (up to 10 images), and reels
- Scheduling via `published=false` + scheduled publish time
- Hashtags, mentions, location tags

**What doesn't work:**
- No API for personal accounts
- No story posting via public API (only via Mobile SDK)
- Requires Facebook App Review for production use
- App must be associated with a Facebook Business account

**Required setup:**
1. Facebook Developer Account → Create App → Add Instagram Graph API
2. Facebook Business Manager → Connect Instagram account
3. OAuth tokens via Facebook Login
4. App Review for `instagram_content_publish` permission

**Recommendation for v1:** Provide "Copy caption + open Instagram" flow. Direct posting only after Facebook App Review is complete.

---

### X / Twitter (API v2)

**What works:**
- Create tweets (text, images, videos, polls)
- Thread creation (reply chain)
- Media upload (images up to 5MB, videos up to 512MB with chunked upload)
- Schedule tweets (via API from approved apps)

**Required setup:**
1. Twitter Developer Account → Create Project → Create App
2. OAuth 2.0 with PKCE (user-context auth)
3. API keys: Client ID, Client Secret
4. Elevated access for media uploads

**Quota:** Free tier = 1,500 tweets/month. Basic tier ($100/month) = 3,000 tweets/month.

**Recommendation for v1:** ✅ Implement. X API is the most straightforward integration.

---

### LinkedIn (Marketing API)

**What works:**
- Create posts on personal profiles and company pages
- Text posts, articles, link shares
- Image and video uploads (via `registerUpload` → upload binary → create post)
- Multi-image posts

**Required setup:**
1. LinkedIn Developer Portal → Create App
2. Request `w_member_social` (personal) or `w_organization_social` (company) permissions
3. OAuth 2.0 flow
4. LinkedIn App Review for marketing products

**Recommendation for v1:** ✅ Implement. Well-documented API with good developer support.

---

### TikTok (Content Posting API)

**What works:**
- Upload videos via Content Posting API
- Set privacy level, allow comments/duets/stitch
- Caption text and hashtags

**What doesn't work:**
- Requires TikTok developer app approval (weeks-long process)
- No carousel/photo post support
- No scheduling — only direct publish
- Limited to approved partners for production use

**Required setup:**
1. TikTok Developer Portal → Create App
2. Request `video.upload` scope
3. Pass App Review
4. OAuth flow specific to TikTok Login Kit

**Recommendation for v1:** ❌ Skip direct posting. Provide "Copy + open TikTok" flow instead. Revisit after app approval.

---

### YouTube Shorts (Data API v3)

**What works:**
- Upload any video (Shorts are just ≤60s vertical videos)
- Set title, description, tags, category, privacy
- Schedule via `publishAt` parameter
- Thumbnails

**What doesn't work:**
- You cannot explicitly mark a video as a "Short" via API — YouTube auto-detects based on aspect ratio + duration
- Quota is limited: 1 upload costs ~1,600 units out of 10,000 daily default
- Google OAuth consent screen requires verification for production

**Required setup:**
1. Google Cloud Console → Enable YouTube Data API v3
2. OAuth 2.0 credentials (web client)
3. Consent screen → Submit for Google verification (for >100 users)
4. Redirect URI configuration

**Recommendation for v1:** ⚠️ Feasible but low priority. Complex OAuth + quota limits. Provide "Copy + open YouTube Studio" flow initially.

---

## v1 Implementation Recommendation

| Platform | v1 Action |
|---|---|
| **X** | ✅ Implement OAuth + direct posting |
| **LinkedIn** | ✅ Implement OAuth + direct posting |
| **Instagram** | 📋 Copy caption + "Open Instagram" link |
| **TikTok** | 📋 Copy caption + "Open TikTok" link |
| **YouTube** | 📋 Copy description + "Open YouTube Studio" link |

### Required Environment Variables

```
# X (Twitter)
TWITTER_CLIENT_ID=
TWITTER_CLIENT_SECRET=

# LinkedIn
LINKEDIN_CLIENT_ID=
LINKEDIN_CLIENT_SECRET=

# Instagram (future)
FACEBOOK_APP_ID=
FACEBOOK_APP_SECRET=

# YouTube (future)
GOOGLE_OAUTH_CLIENT_ID=
GOOGLE_OAUTH_CLIENT_SECRET=

# TikTok (future)
TIKTOK_CLIENT_KEY=
TIKTOK_CLIENT_SECRET=
```

### Security Requirements
- All tokens stored server-side (Convex DB, NOT localStorage)
- Token encryption at rest
- Token refresh logic for expired tokens
- Disconnect/revoke functionality per platform
- Secrets in environment variables only
