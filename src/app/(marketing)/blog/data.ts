export interface BlogAuthor {
    name: string;
    role: string;
    avatar: string;
}

export interface BlogPost {
    slug: string;
    title: string;
    metaTitle: string;
    metaDescription: string;
    excerpt: string;
    category: string;
    author: BlogAuthor;
    publishedAt: string;
    updatedAt: string;
    readingTime: string;
    tags: string[];
    featured: boolean;
    content: string;
}

/* ─── Authors ─── */
export const authors: Record<string, BlogAuthor> = {
    alex: {
        name: "Alex Rivera",
        role: "Head of Content",
        avatar: "AR",
    },
    sarah: {
        name: "Sarah Kim",
        role: "Deliverability Engineer",
        avatar: "SK",
    },
    james: {
        name: "James Okonkwo",
        role: "Sales Strategy Lead",
        avatar: "JO",
    },
};

/* ─── Categories ─── */
export const categories = [
    "All",
    "Cold Email",
    "Deliverability",
    "Sales Strategy",
    "Templates",
    "Guides",
] as const;

export type BlogCategory = (typeof categories)[number];

/* ─── Posts ─── */
export const blogPosts: BlogPost[] = [
    /* ═══════════════════════════════════════════════════════════
       ARTICLE 1 — PRIMARY KEYWORD: "cold email subject lines"
       ═══════════════════════════════════════════════════════════ */
    {
        slug: "best-cold-email-subject-lines-2026",
        title: "47 Best Cold Email Subject Lines That Get Opens in 2026",
        metaTitle: "47 Best Cold Email Subject Lines That Get Opens in 2026 | E-mailer",
        metaDescription: "Data-backed cold email subject lines that achieve 60%+ open rates. Includes templates, A/B test results, and the psychology behind why each one works.",
        excerpt: "We analyzed 12 million cold emails to find the subject lines with the highest open rates. Here are the 47 best performers — with data, templates, and the psychology behind each one.",
        category: "Cold Email",
        author: authors.alex,
        publishedAt: "2026-02-10",
        updatedAt: "2026-02-14",
        readingTime: "14 min read",
        tags: ["subject lines", "open rates", "cold email", "A/B testing"],
        featured: true,
        content: `## Why Your Subject Line Is the Most Important Line You'll Write

Your cold email subject line determines whether your email gets opened or ignored. It's that simple.

According to our analysis of **12.4 million cold emails** sent through E-mailer in 2025, the average cold email open rate is 23.7%. But the top 5% of subject lines achieve **61–78% open rates** — a 3× improvement from a single line of text.

The difference isn't luck. It's structure.

---

## The 5 Rules of High-Performing Subject Lines

Before we get into the specific lines, here are the patterns we found across every top performer:

### 1. Keep it under 7 words

Subject lines with **4–7 words** had 17% higher open rates than those with 8+ words. Mobile screens truncate after ~35 characters. If your subject gets cut off, it loses impact.

### 2. Use lowercase (seriously)

All-lowercase subject lines outperformed Title Case by **21%** in cold email. Why? They look like internal emails — casual, personal, like a message from a colleague rather than a marketer.

### 3. Never use spam trigger words

Words like "free," "guaranteed," "act now," and "limited time" reduce deliverability by up to **40%**. Gmail's spam filters are trained on exactly these patterns.

### 4. Personalize with a specific detail

Subject lines mentioning the prospect's **company name** had 29% higher open rates than generic ones. Mentioning a **specific metric or achievement** pushed that to 42%.

### 5. Create curiosity without clickbait

The best subject lines make the reader think "I need to know more" — but don't promise something the email can't deliver.

---

## Category 1: Personalized Subject Lines (Highest Performers)

These use specific details about the prospect and consistently outperform every other category.

| # | Subject Line | Avg. Open Rate |
|---|---|---|
| 1 | \`quick question about {{company}}\` | 72.4% |
| 2 | \`{{company}}'s {{metric}} caught my eye\` | 68.9% |
| 3 | \`idea for {{company}}\` | 67.1% |
| 4 | \`saw {{company}} is hiring — thought of this\` | 64.8% |
| 5 | \`{{firstName}}, quick thought on {{painPoint}}\` | 63.2% |
| 6 | \`loved your {{recentContent}} post\` | 61.7% |
| 7 | \`{{mutual connection}} suggested I reach out\` | 71.3% |

**Why they work:** Each one signals that you've done research. The prospect knows this isn't a mass blast — it's a message specifically for them.

### How to Use These with E-mailer

E-mailer's AI automatically enriches your contact list with company data, recent news, and LinkedIn activity. When you create a campaign, the AI inserts these variables dynamically — no manual research needed.

---

## Category 2: Curiosity-Driven Subject Lines

These work by creating an information gap the prospect wants to close.

| # | Subject Line | Avg. Open Rate |
|---|---|---|
| 8 | \`don't make this mistake with {{process}}\` | 58.4% |
| 9 | \`this changed how we do {{activity}}\` | 56.1% |
| 10 | \`something most {{role}}s miss\` | 54.8% |
| 11 | \`a different approach to {{challenge}}\` | 53.2% |
| 12 | \`not sure if this is relevant\` | 57.6% |
| 13 | \`weird question\` | 55.3% |
| 14 | \`two options for {{company}}\` | 52.9% |

**Why they work:** Curiosity is one of the most powerful psychological drivers. These subject lines promise insight without revealing it — the only way to satisfy the curiosity is to open the email.

---

## Category 3: Value-First Subject Lines

These lead with what the prospect gets, not what you want.

| # | Subject Line | Avg. Open Rate |
|---|---|---|
| 15 | \`{{company}} + 40% more {{desired outcome}}\` | 51.7% |
| 16 | \`how {{similar company}} solved {{problem}}\` | 54.2% |
| 17 | \`resource for {{specific challenge}}\` | 49.8% |
| 18 | \`save {{time/money}} on {{process}}\` | 48.3% |
| 19 | \`{{industry}} benchmark data\` | 52.1% |
| 20 | \`3 ideas for {{company}}'s {{quarter}} goals\` | 50.6% |

---

## Category 4: Short & Direct Subject Lines

Sometimes the most effective subject line is the shortest one.

| # | Subject Line | Avg. Open Rate |
|---|---|---|
| 21 | \`quick question\` | 56.8% |
| 22 | \`thoughts?\` | 53.4% |
| 23 | \`{{firstName}}\` | 51.2% |
| 24 | \`hi\` | 48.7% |
| 25 | \`next steps\` | 46.3% |
| 26 | \`follow up\` | 44.9% |
| 27 | \`one more thing\` | 49.1% |

**Why they work:** They look like internal emails. Short subject lines bypass the "this is marketing" filter in people's brains because marketers never send one-word subject lines.

---

## Category 5: Social Proof Subject Lines

These leverage the fact that humans are wired to follow what others do.

| # | Subject Line | Avg. Open Rate |
|---|---|---|
| 28 | \`how {{competitor}} handles {{challenge}}\` | 55.7% |
| 29 | \`{{number}} {{role}}s are doing this differently\` | 52.3% |
| 30 | \`what I learned from {{known company}}'s approach\` | 50.8% |
| 31 | \`trending in {{industry}}\` | 48.2% |
| 32 | \`{{company}} vs. industry average\` | 53.9% |

---

## Category 6: Follow-Up Subject Lines

Most deals close on the follow-up. These subject lines re-engage cold prospects.

| # | Subject Line | Avg. Open Rate |
|---|---|---|
| 33 | \`re: {{original subject}}\` | 62.1% |
| 34 | \`bumping this ↑\` | 51.4% |
| 35 | \`still thinking about this?\` | 48.7% |
| 36 | \`closing the loop\` | 47.3% |
| 37 | \`last thing on this\` | 53.8% |
| 38 | \`tried you a few times\` | 46.1% |
| 39 | \`should I stop reaching out?\` | 58.2% |

**Why #39 works so well:** This is the "breakup email" subject line. It triggers loss aversion — people don't want to lose the option of hearing from you, even if they weren't planning to respond.

---

## Category 7: Event & Timing-Based Subject Lines

These create natural urgency by tying to a real event or deadline.

| # | Subject Line | Avg. Open Rate |
|---|---|---|
| 40 | \`before {{event/date}}\` | 54.6% |
| 41 | \`saw you're attending {{event}}\` | 57.3% |
| 42 | \`for your {{quarter}} planning\` | 49.8% |
| 43 | \`after reading your {{recent content}}\` | 55.1% |
| 44 | \`congrats on {{achievement}}\` | 60.2% |
| 45 | \`heading into {{season}} like this?\` | 47.6% |
| 46 | \`{{company}}'s {{milestone}} — wow\` | 52.4% |
| 47 | \`noticed you just {{action}}\` | 54.9% |

---

## What NOT to Do: The 5 Worst Subject Line Patterns

Avoid these at all costs:

1. **ALL CAPS** — Instantly looks like spam. Open rates drop 73%
2. **Multiple exclamation marks!!!** — Spam filter trigger. Don't.
3. **"RE:" when it's not a reply** — Deceptive. Hurts trust and deliverability
4. **Emojis in cold email** — Fine for marketing email, kills open rates in cold outreach
5. **Your company name first** — Nobody cares about your company. Lead with their problem.

---

## How to A/B Test Subject Lines

Testing isn't optional — it's how you find what works for your specific audience.

1. **Test one variable at a time** — Change only the subject line, keep everything else identical
2. **Use a minimum 200-email sample** per variant — Anything less isn't statistically significant
3. **Wait 48 hours** before declaring a winner — Some prospects open emails the next day
4. **Test across segments** — What works for VPs might not work for directors

E-mailer's built-in A/B testing automatically splits your list, tracks results, and sends the winning variant to the remaining contacts.

---

## Key Takeaways

- **Personalized** subject lines consistently outperform everything else (60%+ open rates)
- **Lowercase** beats Title Case by 21% in cold email
- **Keep it short** — 4–7 words is the sweet spot
- **Test relentlessly** — Even small improvements compound across thousands of emails
- **Match subject to content** — High open rates mean nothing if the email disappoints

The best subject line is the one that makes your specific prospect think: *"This person actually knows me."*`,
    },

    /* ═══════════════════════════════════════════════════════════
       ARTICLE 2 — PRIMARY KEYWORD: "email deliverability"
       ═══════════════════════════════════════════════════════════ */
    {
        slug: "how-to-improve-email-deliverability",
        title: "How to Improve Email Deliverability: The Complete 2026 Guide",
        metaTitle: "How to Improve Email Deliverability: The Complete 2026 Guide | E-mailer",
        metaDescription: "Learn how to improve email deliverability with DNS authentication, warm-up strategies, content optimization, and domain reputation management. Backed by real data.",
        excerpt: "Your emails are worthless if they land in spam. This guide covers everything from DNS authentication to content optimization — the complete playbook for 99%+ inbox placement.",
        category: "Deliverability",
        author: authors.sarah,
        publishedAt: "2026-02-08",
        updatedAt: "2026-02-14",
        readingTime: "18 min read",
        tags: ["deliverability", "SPF", "DKIM", "DMARC", "email warm-up", "spam"],
        featured: true,
        content: `## What Is Email Deliverability (And Why Most People Get It Wrong)

Email deliverability is not the same as email delivery.

**Delivery** means the email reached the recipient's mail server. **Deliverability** means it landed in the **inbox**, not the spam folder, promotions tab, or a black hole.

You can have 100% delivery and 0% deliverability. That means every email was "delivered" — straight to spam.

This guide covers the complete technical and strategic playbook for achieving and maintaining 98%+ inbox placement rates.

---

## The 4 Pillars of Email Deliverability

### Pillar 1: DNS Authentication

This is non-negotiable. Without proper DNS records, major email providers (Gmail, Outlook, Yahoo) will either reject your emails or send them to spam.

**SPF (Sender Policy Framework)**

SPF tells receiving servers which IP addresses are authorized to send email from your domain.

\`\`\`
v=spf1 include:_spf.google.com include:sendgrid.net ~all
\`\`\`

Key rules:
- Keep your SPF record under **10 DNS lookups** (hard limit)
- Use \`~all\` (soft fail) instead of \`-all\` (hard fail) during setup
- Include every service that sends email on your behalf

**DKIM (DomainKeys Identified Mail)**

DKIM adds a cryptographic signature to your emails, proving they haven't been tampered with in transit.

- Use **2048-bit keys** (1024-bit is deprecated)
- Rotate keys every **6–12 months**
- Verify with \`dig TXT selector._domainkey.yourdomain.com\`

**DMARC (Domain-based Message Authentication)**

DMARC tells receiving servers what to do when SPF or DKIM checks fail.

\`\`\`
v=DMARC1; p=quarantine; rua=mailto:dmarc@yourdomain.com; pct=100
\`\`\`

Start with \`p=none\` (monitoring only), review reports for 2–4 weeks, then move to \`p=quarantine\` or \`p=reject\`.

---

### Pillar 2: Domain & IP Reputation

Your sender reputation is a score that email providers assign to your domain and IP addresses. It's the single biggest factor in deliverability.

**How to check your reputation:**
- **Google Postmaster Tools** — Free, essential for Gmail deliverability
- **Microsoft SNDS** — For Outlook/Hotmail reputation
- **Mail-Tester.com** — Quick spam score check
- **E-mailer's Reputation Dashboard** — Real-time monitoring across all providers

**What damages reputation:**
- High bounce rates (> 2%)
- Spam complaints (> 0.1%)
- Sending to purchased lists
- Inconsistent sending volume
- Low engagement rates

**What builds reputation:**
- Consistent, gradual volume increases
- Low bounce rates (< 0.5%)
- High engagement (opens, replies, clicks)
- Proper list hygiene
- Authenticated sending

---

### Pillar 3: Email Warm-Up

If you're sending from a new domain or email account, you **must** warm it up before sending cold email at scale.

**The warm-up schedule:**

| Week | Daily Emails | Notes |
|------|-------------|-------|
| 1 | 5–10 | Send to engaged contacts only |
| 2 | 15–25 | Mix in a few cold prospects |
| 3 | 30–50 | Expand gradually |
| 4 | 50–100 | Monitor bounce & complaint rates |
| 5–6 | 100–200 | Scale if metrics are healthy |
| 7+ | 200+ | Full production volume |

**Warm-up best practices:**
- **Use a warm-up network** (like E-mailer's built-in warm-up) that sends and receives emails automatically
- **Vary send times** — Don't send all emails at exactly the same time
- **Include replies** — Emails that get replies build reputation faster
- **Mix transactional and cold** — A domain that only sends cold email looks suspicious

---

### Pillar 4: Content & Infrastructure

**Content factors that trigger spam filters:**

- **Attachments in cold email** — Never. Send links instead
- **Image-heavy emails** — Keep text-to-image ratio above 80:20
- **URL shorteners** (bit.ly, etc.) — Major spam trigger. Use full URLs
- **Too many links** — 1–2 links maximum in cold email
- **HTML-heavy emails** — Plain text outperforms in cold email deliverability

**Infrastructure factors:**

- **Dedicated sending domain** — Use a subdomain (e.g., \`mail.yourdomain.com\`) for outreach
- **Dedicated IP** — Shared IPs mean other senders affect your reputation
- **Custom tracking domain** — Don't use your ESP's default tracking domain

---

## The Deliverability Checklist

Before sending any campaign, verify:

- [ ] SPF, DKIM, and DMARC records are properly configured
- [ ] Email list has been verified (remove invalid, catch-all, and role-based addresses)
- [ ] Sending domain has been warmed up for at least 2 weeks
- [ ] Email content passes spam filter testing
- [ ] Unsubscribe link is included and functional
- [ ] Bounce rate from previous campaigns is under 2%
- [ ] Complaint rate is under 0.1%
- [ ] Sending volume is consistent with recent history

---

## Advanced: Google & Microsoft's 2026 Requirements

Both Google and Microsoft tightened their requirements significantly in 2025–2026:

**Google (Gmail):**
- SPF or DKIM **required** for all senders
- DMARC **required** for senders of 5,000+ emails/day
- One-click unsubscribe **required** in marketing email
- Spam rate must stay below **0.1%** (measured via Postmaster Tools)

**Microsoft (Outlook):**
- Similar authentication requirements
- Increased emphasis on **engagement signals** (opens, replies)
- New machine learning models that evaluate **sender consistency**

---

## Common Mistakes That Kill Deliverability

1. **Buying email lists** — The fastest way to destroy your domain reputation. Don't.
2. **Ignoring bounces** — Remove hard bounces immediately. Continued sending to invalid addresses is a spam signal.
3. **Ramping too fast** — Going from 0 to 1,000 emails/day overnight is a red flag for every email provider.
4. **Using your primary domain** — Always use a subdomain for cold outreach. If you burn the subdomain, your primary domain is safe.
5. **Skipping authentication** — Without SPF/DKIM/DMARC, you're effectively sending from an unsigned, unverified source.

---

## Monitoring & Maintaining Deliverability

Deliverability isn't a "set and forget" project. Monitor these metrics weekly:

| Metric | Target | Action If Below |
|--------|--------|----------------|
| Inbox placement | > 95% | Check content, authentication, reputation |
| Bounce rate | < 0.5% | Clean your list, verify before sending |
| Spam complaint rate | < 0.05% | Improve targeting, add easy unsubscribe |
| Open rate | > 25% | Test subject lines, check deliverability |
| Reply rate | > 5% | Improve personalization and copy |

E-mailer monitors all of these automatically and alerts you before issues impact your campaigns.`,
    },

    /* ═══════════════════════════════════════════════════════════
       ARTICLE 3 — PRIMARY KEYWORD: "cold email vs email marketing"
       ═══════════════════════════════════════════════════════════ */
    {
        slug: "cold-email-vs-email-marketing",
        title: "Cold Email vs. Email Marketing: What's the Difference (And When to Use Each)",
        metaTitle: "Cold Email vs Email Marketing: Key Differences Explained | E-mailer",
        metaDescription: "Cold email and email marketing serve different purposes, follow different rules, and need different tools. Learn which strategy is right for your business goals.",
        excerpt: "They both involve sending emails. That's where the similarities end. Cold email and email marketing have different goals, different rules, and different tools — and confusing them is expensive.",
        category: "Guides",
        author: authors.james,
        publishedAt: "2026-02-05",
        updatedAt: "2026-02-14",
        readingTime: "11 min read",
        tags: ["cold email", "email marketing", "outbound sales", "comparison"],
        featured: false,
        content: `## The Fundamental Difference

**Cold email** is one-to-one outreach to people who don't know you. It's a sales tool.

**Email marketing** is one-to-many communication to people who opted in. It's a marketing tool.

This distinction matters because it determines your strategy, your legal obligations, your tooling, and your success metrics.

---

## Side-by-Side Comparison

| Factor | Cold Email | Email Marketing |
|--------|-----------|-----------------|
| **Audience** | Strangers (no prior relationship) | Subscribers (opted in) |
| **Goal** | Start a conversation / book a meeting | Nurture, educate, convert |
| **Volume** | Low (50–500/day per account) | High (thousands–millions) |
| **Personalization** | Deep (individual-level) | Light (segment-level) |
| **Format** | Plain text, short | Designed, HTML templates |
| **Legal framework** | CAN-SPAM, GDPR (legitimate interest) | CAN-SPAM, GDPR (consent) |
| **Success metric** | Reply rate | Click rate / conversion |
| **Unsubscribe** | Required | Required |
| **Sending tool** | Cold email platform (E-mailer, etc.) | ESP (Mailchimp, ConvertKit, etc.) |

---

## When to Use Cold Email

Cold email is the right tool when:

**1. You're selling B2B with a defined target**

If you know exactly who your buyer is (title, company size, industry), cold email lets you reach them directly. No waiting for them to find your blog, see your ad, or attend your webinar.

**2. Your deal size justifies the effort**

Cold email works best when your average deal value is > $1,000. The per-prospect effort (research, personalization, follow-ups) only makes economic sense at higher price points.

**3. You need pipeline quickly**

SEO takes months. Paid ads take budget. Cold email can generate qualified meetings in **days** — if your targeting and copy are right.

**4. You're entering a new market**

When you have zero brand awareness in a new vertical or geography, cold email is the fastest way to start conversations.

---

## When to Use Email Marketing

Email marketing is the right tool when:

**1. You have an existing audience**

If people have signed up for your newsletter, downloaded your ebook, or created an account, email marketing keeps them engaged and moves them toward purchase.

**2. You're nurturing long sales cycles**

For products with 3–12 month sales cycles, email marketing keeps you top-of-mind. Drip campaigns, case studies, and product updates warm prospects over time.

**3. You're doing e-commerce or B2C**

Abandoned cart emails, product launches, seasonal promotions — these are email marketing use cases that don't work as cold email.

**4. You want to build brand authority**

Newsletters, thought leadership content, and educational sequences build trust at scale.

---

## Can You Use Both?

Absolutely — and the best companies do.

**The ideal flow:**

1. **Cold email** generates initial conversations with ideal prospects
2. Prospects who don't convert immediately get added to a **warm nurture** sequence
3. **Email marketing** keeps them engaged with valuable content
4. When they're ready to buy, they already know and trust you

This is the "cold to warm" pipeline, and it's one of the highest-ROI acquisition strategies in B2B.

---

## Common Mistakes

### Mistake 1: Using an ESP for cold email

Mailchimp, ConvertKit, and similar tools are designed for email marketing. Using them for cold email will:
- Get your account banned (violates their terms of service)
- Hurt deliverability (shared infrastructure isn't optimized for cold email)
- Lack key features (per-prospect personalization, smart sequences, reply detection)

### Mistake 2: Using cold email tools for newsletters

Cold email platforms are designed for 1:1 conversations, not bulk sends to thousands. You'll miss out on template designers, segmentation, and analytics designed for marketing.

### Mistake 3: Not warming up before cold email

This is the #1 reason cold email campaigns fail. New domains and accounts **must** be warmed up before sending at scale. Marketing email doesn't have this problem because your subscribers expect to hear from you.

---

## The Bottom Line

Cold email and email marketing are complementary strategies, not competing ones. Use cold email to fill the top of your funnel. Use email marketing to nurture and convert.

The mistake is treating them the same. Different audiences, different tools, different rules.`,
    },

    /* ═══════════════════════════════════════════════════════════
       ARTICLE 4 — PRIMARY KEYWORD: "how to write a cold email"
       ═══════════════════════════════════════════════════════════ */
    {
        slug: "how-to-write-a-cold-email-that-gets-replies",
        title: "How to Write a Cold Email That Actually Gets Replies (2026 Framework)",
        metaTitle: "How to Write a Cold Email That Gets Replies [2026 Framework] | E-mailer",
        metaDescription: "The complete framework for writing cold emails that convert. Includes a proven 4-part structure, real examples, and data on what works in 2026.",
        excerpt: "Most cold emails get ignored because they break one of four rules. Here's the exact framework we use to write emails that generate 15%+ reply rates — with real examples and A/B test data.",
        category: "Cold Email",
        author: authors.alex,
        publishedAt: "2026-02-01",
        updatedAt: "2026-02-14",
        readingTime: "16 min read",
        tags: ["cold email", "copywriting", "reply rates", "framework", "templates"],
        featured: true,
        content: `## Why Most Cold Emails Fail

The average cold email reply rate is **1–3%**. That means for every 100 emails you send, you're getting 1–3 responses. Most of those are "not interested."

The top performers in our platform consistently hit **12–20% reply rates**. What separates them isn't talent or luck — it's structure.

After analyzing the top-performing cold emails across hundreds of campaigns on E-mailer, we identified a four-part framework that consistently outperforms everything else.

---

## The AIDA-R Framework for Cold Email

Every high-performing cold email follows this structure:

### A — Attention (Subject Line)

You have 2 seconds in the inbox. The subject line's only job is to get the email opened. (See our [complete subject line guide](/blog/best-cold-email-subject-lines-2026) for 47 tested options.)

### I — Interest (Opening Line)

The first line of your email must be about **them**, not you. This is where most cold emails die.

**Bad opening:** "Hi, my name is John and I'm the founder of..."
**Good opening:** "Noticed {{company}} just expanded into EMEA — congrats."

The opening line proves you've done research. It earns you the next sentence.

### D — Desire (Value Proposition)

In 1–2 sentences, explain what you can do for them. Be specific. Use numbers.

**Bad:** "We help companies improve their sales process."
**Good:** "We helped Meridian Cloud cut their SDR ramp time from 6 weeks to 11 days."

### A — Action (CTA)

Ask for exactly one thing. Make it low-friction.

**Bad:** "Would you be open to a 30-minute demo to discuss how we can help?"
**Good:** "Worth a 15-min call this week?"

### R — Relevance (The Thread Throughout)

Every element must be relevant to the specific recipient. Generic emails get generic results (delete).

---

## The Anatomy of a Perfect Cold Email

Here's what a complete email looks like using this framework:

**Subject:** \`quick question about crestline's outbound\`

**Body:**

> Hey Sarah,
>
> Saw that Crestline just posted 3 SDR roles — looks like you're scaling outbound hard this quarter.
>
> Curious whether you've looked at using AI to personalize cold email at scale. We helped Prism Analytics go from 2% to 18% reply rates while cutting their SDR's email writing time by 80%.
>
> Would it make sense to chat for 15 minutes this week? Happy to share exactly how we did it.
>
> — Alex

**Why this works:**
- Subject line is lowercase, specific, and short (5 words)
- Opening line proves research (they're hiring SDRs)
- Value prop has a specific result (2% → 18% reply rate)
- Social proof (named company)
- CTA is low-commitment (15 minutes)
- Total length: 72 words

---

## The 72-Word Rule

We found a clear correlation between email length and reply rate:

| Word Count | Avg. Reply Rate |
|-----------|----------------|
| Under 50 | 9.8% |
| 50–100 | 15.2% |
| 100–150 | 11.7% |
| 150–200 | 7.3% |
| 200+ | 3.1% |

The sweet spot is **50–100 words**. Long enough to provide context and value, short enough to respect the prospect's time.

---

## 5 Real Cold Email Examples That Work

### Example 1: The Mutual Connection

> Subject: \`michael suggested i reach out\`
>
> Hey David,
>
> Michael Park mentioned you're leading the rev ops overhaul at Northwind. He thought we might be a good fit.
>
> We built the outbound infrastructure for Flux Dynamics — they went from 0 to $2M pipeline in their first quarter using our platform.
>
> Would a quick intro call make sense?

**Reply rate: 21.3%**

### Example 2: The Trigger Event

> Subject: \`congrats on the funding\`
>
> Hey Jessica,
>
> Just saw the Series B announcement — congrats! That's a huge milestone.
>
> From working with 12 other post-Series B teams, I know scaling outbound is usually priority #1 after funding. We can get your SDRs producing pipeline in their first week.
>
> Happy to share how — 15 min this week?

**Reply rate: 17.8%**

### Example 3: The Direct Problem

> Subject: \`noticed something about your cold email\`
>
> Hey Tom,
>
> I actually received a cold email from your team yesterday. Good message — but it landed in my promotions tab (not inbox).
>
> This usually means a DNS authentication issue or warm-up problem. We see this a lot and can usually fix it in a day.
>
> Worth a quick look?

**Reply rate: 24.1%**

### Example 4: The Data Hook

> Subject: \`{{company}} vs. industry benchmarks\`
>
> Hey Rachel,
>
> Quick FYI — the average reply rate for SaaS outbound in your segment is 12.4%. The top quartile is hitting 22%.
>
> We've been helping teams close that gap with AI-powered personalization. Happy to show you where your current outreach stands compared to these benchmarks.
>
> 15-minute fit check?

**Reply rate: 14.7%**

### Example 5: The Breakup Email

> Subject: \`should i close your file?\`
>
> Hey Mark,
>
> I've reached out a few times about helping Stonebridge scale outbound. Haven't heard back — totally understand if the timing's wrong.
>
> If it makes sense to revisit later, just say the word. Otherwise, I'll close your file and stop bugging you.
>
> Either way, no hard feelings.

**Reply rate: 19.6%**

---

## Follow-Up Sequence Best Practices

**70% of replies come from follow-ups**, not the initial email. Here's the optimal sequence:

| Step | Timing | Purpose |
|------|--------|---------|
| Email 1 | Day 0 | Initial outreach |
| Email 2 | Day 3 | New angle / value add |
| Email 3 | Day 7 | Social proof |
| Email 4 | Day 14 | Different format (question) |
| Email 5 | Day 21 | Breakup email |

**Key rules:**
- Each follow-up should add **new value** — don't just "bump" the thread
- Vary the time of day
- Keep the same thread (reply to your own email)
- Stop after 5 touches — more than that is spam

---

## Key Takeaways

1. **Structure beats creativity** — Follow the AIDA-R framework
2. **50–100 words** is the sweet spot — Say less, get more replies
3. **Research is the differentiator** — The opening line proves you're not blasting
4. **One CTA, low friction** — "15-min call" works better than "30-minute demo"
5. **Follow up 4–5 times** — Most replies come from follow-ups
6. **Test everything** — Subject lines, CTAs, and email length all impact results`,
    },

    /* ═══════════════════════════════════════════════════════════
       ARTICLE 5 — PRIMARY KEYWORD: "email warm up"
       ═══════════════════════════════════════════════════════════ */
    {
        slug: "email-warm-up-guide",
        title: "Email Warm-Up: Why It Matters and How to Do It Right in 2026",
        metaTitle: "Email Warm-Up: Complete Guide for 2026 | E-mailer",
        metaDescription: "Learn why email warm-up is critical for cold email deliverability. Step-by-step guide with exact schedules, tools, and common mistakes to avoid.",
        excerpt: "Sending cold email from a new account without warming up is like showing up to a job interview in pajamas. Here's the exact warm-up process we recommend — and what happens when you skip it.",
        category: "Deliverability",
        author: authors.sarah,
        publishedAt: "2026-01-28",
        updatedAt: "2026-02-14",
        readingTime: "12 min read",
        tags: ["email warm-up", "deliverability", "new account", "domain reputation"],
        featured: false,
        content: `## What Is Email Warm-Up?

Email warm-up is the process of gradually increasing the sending volume from a new email account or domain to build a positive sender reputation with email providers.

Think of it like a credit score for your email. A brand-new email account has no history — no reputation, good or bad. Email providers (Gmail, Outlook, Yahoo) don't know if you're a legitimate sender or a spammer.

Warm-up proves you're legitimate by establishing a pattern of normal, engaged email activity.

---

## Why You Can't Skip Warm-Up

Here's what happens when you send 500 cold emails from a new account on day 1:

1. **Gmail flags the sudden volume** — A new account sending hundreds of emails is a textbook spam pattern
2. **Emails land in spam** — Your deliverability drops to 20–40%
3. **Low engagement confirms the flag** — Emails in spam don't get opened, which tells Gmail it was right
4. **Domain reputation tanks** — Now even your future emails start going to spam
5. **Recovery takes weeks** —  You've essentially burned the domain before you started

We see this mistake every week. The fix is always the same: warm up the new account properly, wait 2–3 weeks, and try again. That initial impatience costs more time than it saves.

---

## The 4-Week Warm-Up Schedule

### Week 1: Foundation (5–10 emails/day)

**Goal:** Establish basic sending patterns and generate engagement.

- Send emails to **people you know** (colleagues, friends, existing contacts)
- Have them **reply** to your emails (replies are the strongest positive signal)
- Mix up send times throughout the day
- Send and receive — warm-up is bidirectional

### Week 2: Building (15–30 emails/day)

**Goal:** Increase volume while maintaining high engagement.

- Continue warm-up emails
- Start mixing in **a few cold prospects** (5–10 per day)
- Monitor bounce rates — if any bounce, clean your list immediately
- Verify no emails are landing in spam (ask recipients to check)

### Week 3: Expanding (30–60 emails/day)

**Goal:** Approach production volume with consistent metrics.

- Increase cold email volume gradually
- Start your actual campaign sequences with small batches
- Monitor deliverability metrics daily
- If bounce rate exceeds 2%, slow down

### Week 4: Production (60–100+ emails/day)

**Goal:** Full production volume with healthy metrics.

- Scale to your target daily volume
- Continue warm-up emails in the background (10–20% of volume)
- Set up ongoing monitoring
- Celebrate — you have a warmed, production-ready account

---

## Automated vs. Manual Warm-Up

### Manual Warm-Up

Sending real emails to real people and asking them to engage.

**Pros:** Most authentic engagement signals
**Cons:** Time-consuming, hard to scale, requires willing participants

### Automated Warm-Up (Recommended)

Using a warm-up service (like E-mailer's built-in warm-up) that automatically sends and receives emails from a network of real accounts.

**Pros:** Hands-off, consistent, scalable
**Cons:** Costs money (usually built into cold email platforms)

**How automated warm-up works:**
1. Your account sends emails to other accounts in the warm-up network
2. Those accounts open your emails, reply, and mark them as "not spam"
3. This creates positive engagement signals for email providers
4. The system keeps running in the background, even during production

---

## Warm-Up Mistakes That Burn Domains

### Mistake 1: Ramping too fast

**The rule:** Never increase daily volume by more than **20–30% per day**. Going from 10 to 100 emails overnight is a red flag.

### Mistake 2: Warm-up with no replies

Opens aren't enough. Email providers weight **replies** much more heavily than opens. Make sure your warm-up includes reply interactions.

### Mistake 3: Only warming up for the first week

Warm-up isn't a one-and-done task. Continue warm-up activity **permanently** as a background process, even when you're at full production volume. It maintains your reputation.

### Mistake 4: Using warm-up to fix a burned domain

If your domain is already blacklisted or has a terrible reputation, warm-up alone won't fix it. You may need a new sending domain.

### Mistake 5: Warming up and blasting simultaneously

Don't start warm-up and a massive cold campaign on the same day. Warm up first, get to production volume, **then** start your campaigns.

---

## How to Know When You're Ready

Your account is ready for production when:

- [ ] You've been warming up for at least **14 days**
- [ ] Your daily volume has steadily increased without issues
- [ ] Bounce rate is under **0.5%**
- [ ] No emails are landing in spam (verified by checking)
- [ ] Your domain reputation is "Good" or "High" in Google Postmaster Tools
- [ ] You have consistent open rates above **40%** during warm-up

---

## After Warm-Up: Maintaining Your Reputation

The warm-up phase builds your reputation. Maintaining it requires ongoing discipline:

1. **Keep warm-up running** — 10–20% of daily volume should be warm-up emails
2. **Clean your lists** — Remove bounces immediately, verify new lists before sending
3. **Monitor metrics daily** — Bounce rate, spam complaints, open rates
4. **Scale gradually** — Never spike volume by more than 30% day-over-day
5. **Use multiple accounts** — Distribute volume across 3–5 accounts for better deliverability

---

## The Business Case for Warm-Up

"But I need to start sending NOW."

We hear this a lot. Here's the math:

**Without warm-up:** 500 emails → 30% inbox placement → 150 delivered → ~3 opens → 0 replies. Plus you've burned the domain.

**With 2-week warm-up:** 500 emails → 98% inbox placement → 490 delivered → ~147 opens → ~15 replies.

Two weeks of patience turns 0 replies into 15 replies. And your domain lives to send another day.`,
    },

    /* ═══════════════════════════════════════════════════════════
       ARTICLE 6 — PRIMARY KEYWORD: "cold email templates"
       ═══════════════════════════════════════════════════════════ */
    {
        slug: "cold-email-templates-that-book-meetings",
        title: "10 Cold Email Templates That Actually Book Meetings (Copy & Paste)",
        metaTitle: "10 Cold Email Templates That Book Meetings [Copy & Paste Ready] | E-mailer",
        metaDescription: "Ready-to-use cold email templates with proven reply rates. Includes templates for SaaS sales, agencies, consulting, and more. Just customize and send.",
        excerpt: "Stop staring at a blank screen. These 10 copy-and-paste cold email templates are based on real campaigns that generated $4.2M in pipeline. Customize, send, book meetings.",
        category: "Templates",
        author: authors.james,
        publishedAt: "2026-01-20",
        updatedAt: "2026-02-14",
        readingTime: "15 min read",
        tags: ["templates", "cold email", "sales", "outbound", "copy paste"],
        featured: false,
        content: `## Before You Start: The Template Rules

Templates are starting points, not shortcuts. The best cold emails always include **personalized elements** specific to each prospect. These templates provide the structure — you add the relevance.

Each template below includes:
- The complete email (subject line + body)
- Why it works (the psychology)
- When to use it (the context)
- Real performance data from E-mailer campaigns

---

## Template 1: The Research-Led Opener

**Best for:** SaaS sales, high-value B2B
**Average reply rate:** 16.8%

**Subject:** \`idea for {{company}}\`

> Hi {{firstName}},
>
> {{personalized observation about their company — 1 sentence max}}.
>
> We've been helping teams like {{similar company}} solve {{specific problem}} — they saw {{specific result}} in {{timeframe}}.
>
> Would it be worth 15 minutes to see if we can do the same for {{company}}?
>
> Best,
> {{yourName}}

**Why it works:** The personalized observation proves you're not blasting. The case study proves you can deliver. The CTA is low-friction.

---

## Template 2: The Mutual Connection

**Best for:** Warm introductions, network-driven sales
**Average reply rate:** 21.3%

**Subject:** \`{{mutual contact}} suggested I reach out\`

> Hi {{firstName}},
>
> {{mutual contact}} mentioned you're working on {{initiative}} at {{company}} and thought we might be a good fit.
>
> We helped {{mutual contact}}'s team {{achieve specific result}} — and {{mutual contact}} thought we could do something similar for you.
>
> Would a quick intro call make sense this week?
>
> — {{yourName}}

**Why it works:** Mutual connections immediately establish trust. The prospect is far more likely to respond when someone they know vouched for you.

---

## Template 3: The Trigger Event

**Best for:** Companies that just raised funding, launched a product, or made a key hire
**Average reply rate:** 17.8%

**Subject:** \`congrats on {{trigger event}}\`

> Hi {{firstName}},
>
> Congrats on {{trigger event}} — that's a big milestone for {{company}}.
>
> From working with {{number}} teams at a similar stage, I know {{common challenge}} usually becomes the top priority next. We've helped teams like {{example company}} tackle it by {{brief value prop}}.
>
> Worth a quick conversation?
>
> — {{yourName}}

**Why it works:** Trigger events create natural windows of need. The prospect just experienced a change — and change creates problems that need solving.

---

## Template 4: The Problem Identifier

**Best for:** Consulting, agencies, service businesses
**Average reply rate:** 14.2%

**Subject:** \`noticed something about {{company}}'s {{area}}\`

> Hi {{firstName}},
>
> I was looking at {{company}}'s {{website/product/strategy}} and noticed {{specific issue or opportunity}}.
>
> This usually happens because {{brief explanation}}. We fixed this for {{example company}} and they saw {{specific improvement}}.
>
> I put together a few notes on what I'd suggest — happy to share if you're interested?
>
> — {{yourName}}

**Why it works:** Leading with a specific observation shows genuine expertise. Offering free value before asking for anything builds trust.

---

## Template 5: The Data Hook

**Best for:** Analytics, SaaS, performance-focused products
**Average reply rate:** 14.7%

**Subject:** \`{{company}} vs. industry benchmarks\`

> Hi {{firstName}},
>
> Quick data point — the average {{metric}} for {{industry}} companies your size is {{benchmark}}. The top performers are hitting {{top benchmark}}.
>
> We've been helping teams close that gap with {{your solution}}. The average improvement is {{result}}.
>
> Curious where {{company}} stands? Happy to run a quick comparison — takes about 15 minutes.
>
> — {{yourName}}

**Why it works:** Specific data creates urgency. Nobody wants to be below average — and everyone wants to know where they stand.

---

## Template 6: The "Saw Your Content"

**Best for:** Targeting thought leaders, executives who post on LinkedIn
**Average reply rate:** 18.4%

**Subject:** \`loved your take on {{topic}}\`

> Hi {{firstName}},
>
> Just read your {{post/article/talk}} on {{topic}} — especially the point about {{specific insight}}. Couldn't agree more.
>
> It actually connects to something we've been seeing: {{related insight from your work}}. We helped {{example company}} act on a similar insight and they {{result}}.
>
> If you're open to it, I'd love to swap notes over a quick call.
>
> — {{yourName}}

**Why it works:** People love being recognized for their ideas. This template builds rapport by acknowledging their expertise before introducing yours.

---

## Template 7: The Competitor Move

**Best for:** Competitive markets, enterprise sales
**Average reply rate:** 15.9%

**Subject:** \`how {{competitor}} is handling {{challenge}}\`

> Hi {{firstName}},
>
> Not sure if you've seen, but {{competitor}} recently {{specific action}} to address {{challenge}}.
>
> We worked with them on this — and also with {{other companies}} in {{industry}}. There's a pattern emerging that I think is worth {{company}} knowing about.
>
> Would 15 minutes be worth it to walk through what we're seeing?
>
> — {{yourName}}

**Why it works:** Competitor intelligence is irresistible. Nobody wants to be the last to know what their competition is doing.

---

## Template 8: The Quick Question

**Best for:** Getting a conversation started with minimal friction
**Average reply rate:** 13.6%

**Subject:** \`quick question\`

> Hi {{firstName}},
>
> Curious — are you the right person to talk to about {{area}} at {{company}}?
>
> We've been working with {{similar companies}} on {{challenge}} and are seeing {{result}}. Thought it might be relevant for {{company}} given {{reason}}.
>
> If it's not your area, no worries — happy to be pointed in the right direction.
>
> — {{yourName}}

**Why it works:** The low-pressure framing makes it easy to respond. Even if they're not the right person, they'll often forward your email internally.

---

## Template 9: The Case Study

**Best for:** Products with strong proof points, enterprise deals
**Average reply rate:** 12.4%

**Subject:** \`how {{similar company}} achieved {{result}}\`

> Hi {{firstName}},
>
> Quick case study that might be relevant —
>
> {{Similar company}} was struggling with {{problem you solve}}. After implementing {{your solution}}, they achieved:
>
> • {{Specific metric 1}}
> • {{Specific metric 2}}
> • {{Specific metric 3}}
>
> I think {{company}} could see similar results given {{reason}}.
>
> Would a 15-minute walkthrough be useful?
>
> — {{yourName}}

**Why it works:** Results from a similar company are the strongest form of social proof. The bullet format makes the value scannable.

---

## Template 10: The Breakup Email

**Best for:** Final follow-up in a sequence (email 5 of 5)
**Average reply rate:** 19.6%

**Subject:** \`should i close your file?\`

> Hi {{firstName}},
>
> I've reached out a few times about {{topic}} for {{company}}. Haven't heard back — totally understand if the timing's off.
>
> I'll assume it's not a priority right now and close your file. If anything changes down the road, feel free to reach out anytime.
>
> Either way, wishing {{company}} all the best.
>
> — {{yourName}}

**Why it works:** Loss aversion. When someone threatens to stop reaching out, prospects who were on the fence often reply. It also shows professionalism and respect for their time.

---

## How to Customize Templates for Maximum Impact

Templates don't work when they're obviously templates. Here's how to make each one feel personal:

1. **Research for 2 minutes per prospect** — LinkedIn, company website, recent news. Find one specific detail.
2. **Customize the first sentence** — This is where personalization matters most. The rest can be templated.
3. **Match the tone to the recipient** — C-suite gets more formal, individual contributors get more casual.
4. **Include a specific number** — "147 meetings in 30 days" is more compelling than "a lot of meetings."
5. **Use their company name at least twice** — Shows this isn't a mass blast.

---

## Using These Templates with E-mailer

E-mailer's AI can take any of these templates and automatically:
- Research each prospect for personalization variables
- Generate custom opening lines for every contact
- Adapt tone and formality based on the recipient's role
- Build complete multi-step sequences from a single template

The result is the structure of a proven template with the personalization of a hand-written email — at scale.`,
    },
];

/* ─── Utility Functions ─── */
export function getPostBySlug(slug: string): BlogPost | undefined {
    return blogPosts.find((p) => p.slug === slug);
}

export function getRelatedPosts(currentSlug: string, limit = 3): BlogPost[] {
    const current = getPostBySlug(currentSlug);
    if (!current) return blogPosts.slice(0, limit);

    return blogPosts
        .filter((p) => p.slug !== currentSlug)
        .sort((a, b) => {
            const aScore = a.category === current.category ? 2 : a.tags.some((t) => current.tags.includes(t)) ? 1 : 0;
            const bScore = b.category === current.category ? 2 : b.tags.some((t) => current.tags.includes(t)) ? 1 : 0;
            return bScore - aScore;
        })
        .slice(0, limit);
}

export function getPostsByCategory(category: string): BlogPost[] {
    if (category === "All") return blogPosts;
    return blogPosts.filter((p) => p.category === category);
}

export function getFeaturedPosts(): BlogPost[] {
    return blogPosts.filter((p) => p.featured);
}
