# E-Mailer App Bible

> **Living reference document.** Updated every time a feature is added, changed, or removed.

---

## 1. What E-mailer.io Is

E-mailer.io is a professional AI-powered email campaign and sales operations platform. It helps users find leads, manage contacts, build and send email campaigns and automated sequences, track replies and engagement, manage deals through a visual pipeline, create proposals and invoices, and monitor domain reputation — all from a single unified interface. The platform features a 4-tier SaaS model (Free → Starter → Professional → Enterprise), custom session-based authentication, and a full-featured admin panel with impersonation and audit logging.

---

## 2. Current Feature Map

### Core Email Marketing
- **Campaigns** — Create, schedule, and send bulk email campaigns with HTML editor (TipTap)
- **Templates** — Reusable email template library with categories and thumbnails
- **Sequences** — Multi-step drip campaigns with conditional branching and delay logic
- **A/B Tests** — Subject/content split testing with variant stats
- **Email Sending** — SMTP/Resend/SendGrid/Mailgun support via configurable SMTP configs
- **Tracked Links** — Click-tracked URLs with UTM parameter support

### Contact & Lead Management
- **Contacts** — Full contact database with sales stages, lead scores, tags, and activity logs
- **Contact Batches** — Hierarchical grouping (e.g., Arizona > Zone 1)
- **Mailing Lists** — Named lists with many-to-many contact memberships
- **Lead Scraper** — AI-powered web scraper for finding business leads
- **CSV Import** — Bulk contact import with column mapping
- **Contact Merge** — Deduplication via merge modal

### CRM / Sales
- **Deals** — Pipeline with 9 stages (lead → closed_won/lost) with value and probability
- **Tasks** — Follow-up task manager with priorities and due dates
- **Replies** — Inbound reply triage with AI classification (positive, objection, angry, etc.)
- **Meetings** — Scheduling, transcripts, and AI-generated meeting notes
- **Proposals** — Document builder with line items, signatures, and public share links
- **Invoices** — Invoice generation tied to proposals and deals
- **Pipeline View** — Visual Kanban board for deals

### AI Features
- **AI Copywriter** — Generate email copy with tone/voice control (Google Generative AI + OpenAI)
- **Reply Classification** — Auto-classify inbound replies by sentiment and buying signals
- **Brand Rules** — Configurable voice, forbidden phrases, product facts for AI accuracy
- **Meeting Notes** — AI-extracted summaries, action items, and objection handling

### Platform & Admin
- **Dashboard** — Real-time stats, activity feed, chart analytics
- **Domain Reputation** — Email deliverability monitoring (bounce/complaint rates)
- **Email Warmup** — Per-sender warmup schedules with health scores
- **Send Policies** — Daily/hourly limits, business hours, warmup mode, bounce protection
- **Automations** — Trigger-action rules (reply → create deal, stage change → send template, etc.)
- **Super Admin** — Full admin panel with user management, tier changes, impersonation, audit log
- **Settings** — SMTP config, sender identities, profile management
- **Analytics/Insights** — Email stats dashboard with time-range filtering
- **Unsubscribes** — Global unsubscribe management with campaign tracking

### Content Calendar & Social
- **Content Calendar** — 30-day social media content planner with AI generation, regeneration, revision, inline editing, field locking, and brand voice settings
- **Brand Voice** — Configurable tone, banned words, default CTA, default hashtags for AI content generation

### Marketing Site
- Landing page, features, pricing, how-it-works, about, careers, changelog, compare, FAQ, blog (with articles), contact, privacy, terms, GDPR, cookies

---

## 3. Route Map

### App Routes (authenticated)

| Route | Purpose | Key Components |
|---|---|---|
| `/dashboard` | Main analytics dashboard | `DashboardPage`, `PageWrapper`, `StatsBar` |
| `/campaigns` | Email campaign management | `AuthGuard`, `CampaignSendModal`, `EmailEditor` |
| `/contacts` | Contact database | `ContactSlideOver`, `ContactFilters`, `CsvImportModal`, `MergeContactsModal` |
| `/scraper` | AI lead finder | `LeadSearchAnimation` |
| `/settings` | SMTP config, senders, profile | Settings page |
| `/templates` | Email template library | Templates page (Tools dropdown) |
| `/sequences` | Multi-step drip campaigns | Sequences list + `/sequences/[id]` detail |
| `/ab-tests` | A/B test management | AB Tests page (Tools dropdown) |
| `/automations` | Trigger-action rules | Automations page (Tools dropdown) |
| `/links` | Tracked URL manager | Links page (Tools dropdown) |
| `/brand-rules` | AI voice & tone config | Brand Rules page (Tools dropdown) |
| `/tasks` | Follow-up task manager | Tasks page (Tools dropdown) |
| `/deals` | Deal pipeline Kanban | Deals page |
| `/pipeline` | Pipeline view | Pipeline page |
| `/calls` | Call log | Calls page |
| `/replies` | Inbound reply triage | Replies page |
| `/lists` | Mailing list management | Lists page |
| `/senders` | Sender identity management | Senders page |
| `/reputation` | Domain reputation monitoring | Reputation page |
| `/warmup` | Email warmup schedules | Warmup page |
| `/insights` | Analytics & metrics | Insights page |
| `/accounts` | Account management | Accounts page |
| `/unsubscribes` | Unsubscribe management | Unsubscribes page |
| `/admin` | Super admin panel | Super admin page |
| `/content-calendar` | 30-day social media content planner | `ContentEditModal`, `BrandVoiceModal`, `RevisePromptModal` (Tools dropdown) |

### Marketing Routes (public, `(marketing)` layout group)

| Route | Purpose |
|---|---|
| `/` | Landing page (hero, features, testimonials, CTA) |
| `/features` | Product feature showcase |
| `/pricing` | Tier comparison and pricing |
| `/how-it-works` | Product workflow explanation |
| `/about` | Company information |
| `/blog` | Blog index + `/blog/[slug]` articles |
| `/careers` | Job listings |
| `/changelog` | Product updates |
| `/compare` | Competitor comparison |
| `/faq` | Frequently asked questions |
| `/contact` | Contact form |
| `/privacy`, `/terms`, `/gdpr`, `/cookies` | Legal pages |

### Auth Routes

| Route | Purpose |
|---|---|
| `/login` | User login |
| `/register` | User registration |
| `/unsubscribe` | Public unsubscribe landing |

### API Routes

| Route | Purpose |
|---|---|
| `/api/send-email` | Send single email |
| `/api/send-bulk` | Bulk email sending |
| `/api/generate-copy` | AI copy generation |
| `/api/scrape-leads` | AI lead scraping |
| `/api/classify-reply` | Reply classification |
| `/api/test-smtp` | SMTP configuration test |
| `/api/unsubscribe` | Unsubscribe webhook |
| `/api/r` | Tracked link redirect |
| `/api/generate-content` | AI social content generation (OpenAI GPT-4o) |

---

## 4. Styling & Branding Rules

### Core Color Palette (6 colors — see `DESIGN_SYSTEM.md` + `src/config/theme.ts`)

| Role | Tailwind Token | Hex |
|---|---|---|
| Primary Text | `slate-900` | `#0F172A` |
| Secondary Text | `slate-500` | `#64748B` |
| Muted Text | `slate-400` | `#94A3B8` |
| Accent (Brand) | `cyan-500` | `#06B6D4` |
| Accent CTA | `slate-900` | `#0F172A` |
| Background | `white` / `slate-50` | `#FFFFFF` / `#F8FAFC` |

### Semantic Colors

| Role | Token | Hex |
|---|---|---|
| Success | `emerald-500` | `#10B981` |
| Warning | `amber-500` | `#F59E0B` |
| Error | `red-500` | `#EF4444` |
| Info | `blue-500` | `#3B82F6` |

### Typography

- **Headings**: Space Grotesk (`font-heading`) — weights 600-700, tight letter-spacing
- **Body**: Outfit (`font-sans` / `font-body`) — weights 300-700
- Both loaded via `next/font/google` in `layout.tsx`

### Component Patterns

| Component | Classes |
|---|---|
| **Page shell** | `min-h-screen bg-slate-50 dark:bg-slate-950` |
| **Card** | `bg-white dark:bg-slate-900 rounded-xl border border-slate-200 shadow-sm` |
| **Primary button** | `px-5 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-lg` |
| **Gradient button** | `bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg` |
| **Secondary button** | `px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-lg` |
| **Active nav** | `bg-cyan-50 text-cyan-600` |
| **Input** | `bg-white border border-slate-200 rounded-lg px-4 py-2.5 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20` |
| **Modal** | `fixed inset-0 bg-black/80 backdrop-blur-sm z-50` inner: `bg-white rounded-2xl border border-slate-200 p-6` |

### Spacing & Radius

| Token | Value |
|---|---|
| `rounded-lg` | Buttons, inputs |
| `rounded-xl` | Cards, modals, panels |
| `rounded-2xl` | Large modals |
| Page max width | `max-w-6xl` (default) or `max-w-7xl` |
| Page padding | `px-4 sm:px-6 lg:px-8 py-6` |

### Dark Mode
- Enabled via `darkMode: 'class'` in Tailwind config
- All components support `dark:` variants
- Dark backgrounds: `dark:bg-slate-950` (page), `dark:bg-slate-900` (cards)

---

## 5. Data & Entities

> Full schema: `convex/schema.ts` (982 lines, 30+ tables)

### Core Tables

| Table | Key Fields | Purpose |
|---|---|---|
| `users` | email, name, passwordHash, salt | Auth users |
| `sessions` | userId, token, expiresAt, impersonation | Session management |
| `userProfiles` | userId, tier, isAdmin, isSuperAdmin, usage counters | User profiles + tier system |
| `emailVerifications` | email, code, verified | OTP verification |
| `campaigns` | userId, name, subject, htmlContent, status, stats | Email campaigns |
| `contacts` | userId, email, name, company, salesStage, leadScore, tags | CRM contacts |
| `batches` | userId, name, parentBatchId, contactCount | Contact grouping (hierarchical) |
| `lists` | userId, name, contactCount | Mailing lists |
| `listMembers` | listId, contactId | List membership (M:N) |
| `senders` | userId, name, email, isDefault, verified | Sender identities |
| `templates` | userId, name, subject, htmlBody, category | Email templates |
| `sendQueue` | campaignId, contactId, status | Batch send processing |
| `emailEvents` | userId, campaignId, event, email, timestamp | Opens/clicks/bounces |
| `emailStats` | userId, date, sent/delivered/opened/clicked/bounced | Daily reputation stats |

### CRM Tables

| Table | Key Fields | Purpose |
|---|---|---|
| `deals` | userId, contactId, name, value, stage, probability | Sales pipeline |
| `tasks` | userId, contactId, title, dueAt, priority, status | Follow-up tasks |
| `inboundReplies` | userId, contactId, body, classification, sentiment | AI-triaged replies |
| `meetings` | userId, contactId, scheduledAt, status, meetingType | Meeting tracker |
| `meetingNotes` | meetingId, summary, keyPoints, actionItems | AI meeting insights |
| `proposals` | userId, contactId, title, totalValue, status, publicToken | Proposals |
| `proposalItems` | proposalId, name, quantity, unitPrice | Proposal line items |
| `proposalTemplates` | userId, name, defaultItems | Reusable proposal structures |
| `invoices` | userId, contactId, items, totalAmount, status, publicToken | Invoices |

### Automation & Intelligence

| Table | Key Fields | Purpose |
|---|---|---|
| `automationRules` | userId, triggerType, actionType, isActive | Automation rules |
| `automationLogs` | ruleId, contactId, actionTaken, success | Execution log |
| `sequences` | userId, name, status, triggerType | Drip sequences |
| `sequenceSteps` | sequenceId, order, templateId, delayDays, condition | Sequence steps |
| `sequenceEnrollments` | sequenceId, contactId, currentStep, nextSendAt | Contact enrollment |
| `abTests` | userId, templateAId, templateBId, stats | A/B test variants |
| `emailBrandRules` | userId, voiceDescription, forbiddenPhrases | AI brand voice config |
| `sendPolicies` | userId, dailySendLimit, businessHours, warmup | Send rate policies |
| `trackedLinks` | userId, code, destinationUrl, clickCount | Click tracking |
| `smtpConfigs` | userId, host, port, username, password, apiKey | SMTP configurations |
| `contactActivities` | userId, contactId, type, callOutcome | Activity timeline |
| `leadSearches` | userId, prompt, resultsCount | Lead search history |
| `warmupSchedules` | userId, senderId, status, healthScore | Email warmup |
| `aiCopyHistory` | userId, prompt, generatedBody, tone | AI generation history |
| `unsubscribes` | userId, email, reason | Global unsubscribe list |
| `adminAuditLog` | actorId, action, targetEmail, details | Admin audit trail |
| `contentCalendarItems` | userId, date, platforms[], type, concept, caption, hashtags, cta, status, lockedFields | Social content calendar posts |
| `contentBrandVoice` | userId, tone, bannedWords, defaultCta, defaultHashtags, brandDescription | AI brand voice settings |

---

## 6. Auth, Roles & Permissions

### Auth Model
- **Custom session-based auth** (not using `@convex-dev/auth`)
- Session tokens stored in `localStorage` (key: `claimory_session_token`)
- Backend validates via `customAuth.getSession` query
- Passwords hashed with salt in `users` table
- OTP email verification via `emailVerifications` table

### Auth Flow
1. User registers → `customAuth.register` → creates user + session → stores token
2. User logs in → `customAuth.login` → validates password → creates session → stores token
3. Every authenticated query/mutation receives `sessionToken` via `useAuthQuery` / `useAuthMutation` hooks
4. Session validated server-side on every request

### Roles & Tiers
| Tier | Rank | Features |
|---|---|---|
| `free` | 0 | Basic campaigns, contacts, scraper (limited credits) |
| `starter` | 1 | + Sequences, A/B Testing |
| `professional` | 2 | + CRM, Advanced Analytics |
| `enterprise` | 3 | + Custom AI Training, API Access |

### Admin Levels
- `isAdmin` — Standard admin (user management basics)
- `isSuperAdmin` — Full admin (tier changes, impersonation, audit log, data deletion)
- Admin actions logged to `adminAuditLog` table

### Key Auth Files
- `src/contexts/AuthContext.tsx` — Auth provider with login/register/logout
- `src/hooks/useAuthConvex.ts` — `useAuthQuery` / `useAuthMutation` wrappers
- `src/hooks/useFeatureGate.ts` — Tier-based feature gating
- `src/components/AuthGuard.tsx` — Auth guard wrapper + `AppHeader` component
- `convex/customAuth.ts` — Backend auth logic

---

## 7. Technical Architecture

### Stack
| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (App Router, Turbopack dev) |
| Backend | Convex (real-time serverless DB + functions) |
| Styling | Tailwind CSS 3 (class-based dark mode) |
| Fonts | Space Grotesk + Outfit (Google Fonts) |
| Rich Text | TipTap (email editor) |
| Animation | Framer Motion |
| AI | Google Generative AI + OpenAI SDK |
| Email | Nodemailer + Resend SDK |
| Scraping | Cheerio (HTML parsing) |
| UI Primitives | Radix UI (Dialog, Select, Tabs, Toast, Label) |
| Utility | clsx, tailwind-merge, class-variance-authority |

### File Structure
```
emailer/
├── convex/                    # Backend (Convex functions + schema)
│   ├── schema.ts              # Full data model (982 lines, 30+ tables)
│   ├── customAuth.ts          # Auth logic
│   ├── campaigns.ts           # Campaign CRUD
│   ├── contacts.ts            # Contact CRUD
│   ├── sequences.ts           # Sequence logic
│   ├── automations.ts         # Automation rules + engine
│   ├── deals.ts               # Deal pipeline
│   ├── replies.ts             # Reply triage
│   ├── tasks.ts               # Task management
│   ├── analytics.ts           # Analytics queries
│   ├── warmup.ts              # Warmup schedules
│   ├── superAdmin.ts          # Admin panel logic
│   └── ...                    # (31 backend files total)
├── src/
│   ├── app/                   # Next.js App Router pages
│   │   ├── (marketing)/       # Public marketing pages (14 routes)
│   │   ├── api/               # API routes (8 endpoints)
│   │   ├── dashboard/         # Dashboard page
│   │   ├── campaigns/         # Campaigns page
│   │   ├── contacts/          # Contacts page
│   │   ├── sequences/         # Sequences + [id] detail
│   │   └── ...                # (30+ authenticated app routes)
│   ├── components/            # Shared components
│   │   ├── AuthGuard.tsx      # Auth wrapper + AppHeader (449 lines)
│   │   ├── PageWrapper.tsx    # Standard page layout shell
│   │   ├── PageHeader.tsx     # Page title + subtitle + action
│   │   ├── StatsBar.tsx       # Stat cards grid
│   │   ├── FormModal.tsx      # Standard form modal
│   │   ├── PageEmptyState.tsx # Empty state display
│   │   ├── GradientButton.tsx # Gradient CTA button
│   │   ├── EmailEditor.tsx    # TipTap rich text editor
│   │   └── ...
│   ├── contexts/AuthContext.tsx  # Auth provider
│   ├── hooks/                    # Custom hooks
│   │   ├── useAuthConvex.ts     # Auth-aware query/mutation wrappers
│   │   └── useFeatureGate.ts    # Tier-based feature gating
│   ├── config/theme.ts          # Design token constants
│   └── lib/scraper/             # Lead scraper utilities
├── DESIGN_SYSTEM.md             # Design system documentation
├── tailwind.config.ts           # Tailwind configuration
└── package.json                 # Dependencies
```

### Page Pattern (standard)
Every authenticated page follows this pattern:
```tsx
"use client";
import { AuthGuard, AppHeader } from "@/components/AuthGuard";
import { PageWrapper } from "@/components/PageWrapper";
import { useAuthQuery, useAuthMutation } from "@/hooks/useAuthConvex";
import { api } from "@/../convex/_generated/api";

function MyPage() {
    const data = useAuthQuery(api.module.query);
    const doAction = useAuthMutation(api.module.mutation);
    // ... render with PageWrapper, PageHeader, StatsBar, etc.
}

export default function MyPageWrapper() {
    return (
        <AuthGuard>
            <MyPage />
        </AuthGuard>
    );
}
```

---

## 8. How to Run Locally

### Prerequisites
- Node.js 18+
- A Convex account and project

### Setup
```bash
cd emailer
npm install
```

### Environment Variables

#### `.env.local` (Next.js)
```
NEXT_PUBLIC_CONVEX_URL=<your-convex-deployment-url>
OPENAI_API_KEY=<your-openai-api-key>  # Required for Content Calendar AI generation
```

#### Convex Dashboard Environment Variables
```
SMTP_HOST=mail.privateemail.com
SMTP_PORT=465
SMTP_USER=<your-email>
SMTP_PASS=<your-smtp-password>
SMTP_SSL=true
API_KEY=<your-secure-api-key>
UNSUB_SECRET=<your-unsubscribe-signing-secret>
PUBLIC_BASE_URL=https://yourdomain.com
FROM_NAME=<Your Company>
FROM_EMAIL=<your-email>
PHYSICAL_ADDRESS=<your-address>
MAX_PER_HOUR=100
MAX_PER_DAY=1000
```

### Run
```bash
npm run dev
# Starts both Next.js (Turbopack) and Convex dev server concurrently
```

### Build
```bash
npm run build  # or: npx next build
```

---

## 9. Known Gaps / TODOs

- **Social Posting Integrations** — X and LinkedIn feasible for v1 (see `docs/audit/CONTENT_POSTING_FEASIBILITY.md`); Instagram/TikTok/YouTube require app review or use copy+redirect flow
- **Dark Mode Consistency** — Some components may still have hardcoded hex values needing normalization
- **Token Storage** — Session tokens stored in localStorage (key still named `claimory_session_token`)

---

## 10. Changelog

| Date | Change | Files | Notes |
|---|---|---|---|
| 2026-02-16 | Created App Bible | `docs/audit/EMAILER_APP_BIBLE.md` | Initial comprehensive audit |
| 2026-02-16 | Added Content Calendar | `convex/schema.ts`, `convex/contentCalendar.ts`, `convex/contentBrandVoice.ts`, `src/app/api/generate-content/route.ts`, `src/app/content-calendar/page.tsx`, `src/components/content-calendar/*` | Full content calendar with AI generation, editing, brand voice |
| 2026-02-16 | Social Posting Feasibility | `docs/audit/CONTENT_POSTING_FEASIBILITY.md` | Analyzed 5 platforms; X + LinkedIn feasible for v1 |
| 2026-02-16 | Social Posting Integrations | `convex/schema.ts`, `convex/socialConnections.ts`, `src/app/api/social/**`, `src/components/content-calendar/SocialConnectionsModal.tsx`, `PostToSocialModal.tsx` | X + LinkedIn OAuth connect/post, social connections management |
| 2026-02-16 | Social Analytics Widget | `convex/contentCalendar.ts`, `src/components/content-calendar/SocialAnalyticsWidget.tsx` | Post tracking, platform breakdown, recent activity feed |
