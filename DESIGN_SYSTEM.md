# E-Mailer Design System

> **Single source of truth** for colors, typography, spacing, and component patterns.
> Both marketing pages and app pages MUST use these exact tokens.

---

## Color Palette (6 Core Colors)

| Role | Token | Hex | Where Used |
|---|---|---|---|
| **Primary Text** | `slate-900` | `#0F172A` | Headings, nav labels, table text, bold content |
| **Secondary Text** | `slate-500` | `#64748B` | Body copy, descriptions, subtitle text |
| **Muted Text** | `slate-400` | `#94A3B8` | Placeholder text, timestamps, helper text |
| **Accent (Brand)** | `cyan-500` | `#06B6D4` | Active nav states, stage badges, links, interactive highlights |
| **Accent CTA** | `slate-900` | `#0F172A` | Primary buttons, dark CTAs (white text) |
| **Background** | `white / slate-50` | `#FFFFFF / #F8FAFC` | Page backgrounds, cards, elevated surfaces |

### Supporting Colors (Semantic Only)

| Role | Hex | Usage |
|---|---|---|
| Success | `#10B981` (emerald-500) | Positive metrics, checkmarks, delivered status |
| Warning | `#F59E0B` (amber-500) | Follow-up needed, pending states |
| Error | `#EF4444` (red-500) | Bounced, failed, destructive actions |
| Info | `#3B82F6` (blue-500) | Informational badges, help text |

### What We're Removing

| Old Token | Why |
|---|---|
| `#FF6B4A` (coral) | **Not in marketing pages.** Only existed in old app header. Replaced by `cyan-500` for accents and `slate-900` for CTAs |
| `#1A1D26` | Replaced by `slate-900` (`#0F172A`) for consistency with Tailwind's slate scale |
| `#F8F9FC` | Replaced by `slate-50` (`#F8FAFC`) — nearly identical but uses Tailwind's native scale |
| `#4B5563` (gray-600) | Replaced by `slate-500` (`#64748B`) to match marketing |
| `#9CA3AF` (gray-400) | Replaced by `slate-400` (`#94A3B8`) |
| `#E5E7EB` (gray-200) | Replaced by `slate-200` (`#E2E8F0`) |

---

## Typography

### Fonts (loaded in `layout.tsx`)

| Variable | Font | Role |
|---|---|---|
| `--font-heading` | **Space Grotesk** (600, 700) | All headings (`h1`–`h6`), stats, logo text, stage labels |
| `--font-body` | **Outfit** (300–700) | All body text, buttons, form inputs, nav items, descriptions |

### Usage Rules

| Element | Font | Weight | Tracking | Example |
|---|---|---|---|---|
| Page title `h1` | `font-heading` | 700 / semibold | `-0.04em` | "Contacts", "Dashboard" |
| Section headings `h2` | `font-heading` | 600 | `-0.03em` | "Campaign Performance" |
| Card titles `h3` | `font-heading` | 600 | `-0.02em` | "Reply Rate", "New Lead" |
| Body text | `font-sans` (Outfit) | 400 | normal | Descriptions, table cells |
| Labels / captions | `font-sans` | 500 | `0.01em` | Filter labels, column headers |
| Buttons | `font-sans` | 600 | `-0.01em` | "Add Contact", "Export" |
| Nav items | `font-sans` | 500 | `-0.01em` | "Dashboard", "Campaigns" |
| Stat numbers | `font-heading` | 600 | `-0.04em` | "1,847", "99.1%" |

---

## Component Patterns

### Buttons

| Type | Style | Usage |
|---|---|---|
| **Primary** | `bg-slate-900 text-white rounded-lg` | Main CTAs: "Add Contact", "Create Campaign" |
| **Secondary** | `bg-white border border-slate-200 text-slate-700 rounded-lg` | Secondary actions: "Export", "Import CSV" |
| **Ghost** | `text-slate-500 hover:text-slate-900 hover:bg-slate-50` | Tertiary: "Cancel", "Sign Out" |
| **Accent** | `bg-cyan-500 text-white rounded-lg` | Highlight actions: active filters, badges |

### Cards

```
bg-white rounded-xl border border-slate-200/80 shadow-sm
hover: border-slate-300 shadow-lg
```

### Active Nav State

```
bg-cyan-50 text-cyan-600 (NOT coral #FF6B4A)
```

### Borders & Dividers

| Token | Hex | Usage |
|---|---|---|
| `slate-200` | `#E2E8F0` | Card borders, table dividers, input borders |
| `slate-100` | `#F1F5F9` | Subtle row dividers, section separators |

### Page Background

```
bg-slate-50 (#F8FAFC) — all app pages
bg-white — cards, modals, elevated surfaces
```

---

## Logo

- **Marketing nav**: `<img src="/logo.png" />` at `h-14`
- **App nav**: Same image logo, NOT text-only "Emailer"

---

## Spacing & Radius

| Token | Value | Usage |
|---|---|---|
| `rounded-lg` | 8px | Buttons, inputs, small cards |
| `rounded-xl` | 12px | Cards, modals, panels |
| `rounded-2xl` | 16px | Large modals, hero cards |
| Page max-width | `max-w-7xl` | All pages |
| Page padding | `px-6 lg:px-8` | Consistent horizontal gutters |

---

## Quick Reference: Tailwind Classes

```
/* Page shell */
bg-slate-50 min-h-screen

/* Card */
bg-white rounded-xl border border-slate-200/80 shadow-sm

/* Heading */
font-heading text-slate-900 tracking-[-0.03em] font-semibold

/* Body text */
text-slate-500 text-[15px] leading-relaxed

/* Muted text */
text-slate-400 text-sm

/* Primary button */
px-5 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-lg

/* Secondary button */
px-4 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg

/* Active state */
bg-cyan-50 text-cyan-600

/* Input */
bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900
focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20
```
