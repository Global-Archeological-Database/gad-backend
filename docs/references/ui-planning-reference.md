# GAD — Advanced UI Planning Reference

> **Purpose**: Single-source reference for prompting Claude/Claude Code to design an advanced, pixel-perfect UI overhaul for GAD. Copy-paste this entire document into your prompt.
> **Last Updated**: 2026-06-10

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack & Styling Context](#2-tech-stack--styling-context)
3. [Current Color Palette & Theme](#3-current-color-palette--theme)
4. [Current UI Patterns & Components](#4-current-ui-patterns--components)
5. [All Pages & Routes](#5-all-pages--routes)
6. [Current UX Patterns](#6-current-ux-patterns)
7. [How Roo Code (Orchestrator) Works](#7-how-roo-code-orchestrator-works)
8. [How to Prompt the Orchestrator Best](#8-how-to-prompt-the-orchestrator-best)
9. [What Info to Include in Your Prompt](#9-what-info-to-include-in-your-prompt)
10. [UI/UX Enhancement Prompt Blueprint (10+ Prompts)](#10-uiux-enhancement-prompt-blueprint-10-prompts)
11. [Key Design Constraints](#11-key-design-constraints)
12. [Appendix: Current Component Tree](#12-appendix-current-component-tree)

---

## 1. Project Overview

**GAD (Global Archaeological Database)** is a full-stack web application for browsing, submitting, and analyzing archaeological artifacts. It serves as a global crowdsourced archaeological catalog with AI-powered features.

### Core Features
- **Map Explorer** — Full-viewport interactive Google Map with artifact markers, InfoWindows, and a sliding detail panel
- **Artifact Gallery** — Responsive grid with filters (country, condition, type), TanStack Query data fetching, skeleton loading
- **Artifact Detail Page** — SSR with `generateMetadata`, JSON-LD structured data, static map, condition badges, tags
- **Artifact Submission Form** — 3-step sheet form (Location → Details → Media) with map location picker, drag-and-drop file upload with progress bars
- **AI Chatbot** — Floating widget (bottom-right), Sheet-based UI, message history, typing indicator, public access
- **AI Artifact Analysis** — Gemini-powered analysis of individual artifacts
- **AI Find Similar** — Semantic similarity search across artifacts
- **User Dashboard** — User's submitted artifacts with Edit/Delete, profile settings, account stats
- **Admin Panel** — User management (role assignment), artifact moderation (delete any artifact)
- **Authentication** — Firebase Auth (Email/Password), role-based access (user/admin), AuthGuard route protection

### Live URLs
- **Frontend**: https://the-gad.org
- **Backend API**: https://api.the-gad.org

---

## 2. Tech Stack & Styling Context

### Frontend Stack
| Technology | Version | Purpose |
|---|---|---|
| **Next.js** | 16 (App Router) | React framework with SSR, RSC, App Router |
| **React** | 19 | UI library |
| **Tailwind CSS** | v3 | Utility-first CSS framework |
| **shadcn/ui** | latest (base-ui based) | Component primitives (Button, Sheet, Dialog, Tabs, Input, Label, Switch, AlertDialog, Select) |
| **TanStack Query** | v5 | Server state management, caching, mutations |
| **Zustand** | v4 | Client state management (auth, ui, map stores) |
| **React Hook Form** | latest | Form state management |
| **Zod** | v4 | Schema validation |
| **Framer Motion** | latest | Animations (detail panel slide-in, typing indicator) |
| **@vis.gl/react-google-maps** | latest | Google Maps React wrapper |
| **sonner** | latest | Toast notifications |
| **Firebase Auth** | v11+ | Client-side authentication |

### Backend Stack
| Technology | Purpose |
|---|---|
| **Express.js** (v5) | API server on Cloud Run |
| **Firebase Admin SDK** | Firestore, Auth, Storage |
| **Gemini AI** (`@google/generative-ai`) | Chatbot, analysis, similarity search |
| **Google Cloud Storage** | Artifact file storage (images, 3D models) |
| **express-rate-limit** | Rate limiting (general, AI, upload) |

### Styling Approach
- **Tailwind CSS v3** with utility classes throughout
- **shadcn/ui** components customized with `@base-ui/react` primitives
- Warm, earthy color palette (archaeological theme)
- Custom map style via Google Maps `MapId` (desaturated, warm landscape tones)
- Framer Motion for animations (slide-in panels, typing indicators)
- Responsive design (mobile-first with breakpoints: sm/md/lg/xl)
- Dark mode is **not currently implemented** — all styling is light/warm-toned

---

## 3. Current Color Palette & Theme

### Primary Colors
| Token | Hex | Usage |
|---|---|---|
| `--background` | `#FDFAF5` | Page background — warm off-white |
| `--foreground` | `#1A1A2E` | Primary text — deep dark blue-black |
| `--primary` | `#B8860B` | Dark Goldenrod — GAD branding, primary buttons, links |
| `--primary-foreground` | `#FFFFFF` | Text on primary backgrounds |
| `--secondary` | `#D4C5A9` | Warm beige — borders, secondary elements, card backgrounds |
| `--secondary-foreground` | `#5C4A2E` | Text on secondary backgrounds |
| `--muted` | `#F0EBE0` | Muted backgrounds, hover states |
| `--muted-foreground` | `#8B7D6B` | Muted text, placeholders |
| `--accent` | `#8B4513` | Saddle Brown — accent elements, hover states |
| `--accent-foreground` | `#FFFFFF` | Text on accent backgrounds |
| `--destructive` | `#DC2626` | Destructive actions (delete, error) |
| `--ring` | `#B8860B` | Focus ring color |

### Artifact Age-Based Marker Colors (Map)
| Age Range | Hex | Color Name |
|---|---|---|
| Before 500 CE | `#B8860B` | Dark Goldenrod |
| 500–1500 CE | `#722F37` | Wine/Burgundy |
| 1500–1900 CE | `#2D5A27` | Forest Green |
| After 1900 CE | `#4A6FA5` | Steel Blue |
| Unknown | `#888780` | Warm Gray |

### Map Style
- Desaturation: 20%
- Water: `#a0c4d8` (soft blue)
- Landscape: `#f5f0e8` (warm parchment)
- Roads: simplified, minimal detail
- POIs: hidden

### Typography
- **Font**: System font stack (Tailwind default sans-serif)
- **Headings**: Bold, larger sizes (text-2xl, text-3xl, etc.)
- **Body**: Regular weight, comfortable line-height
- **Small text**: Muted foreground for secondary info

### Spacing & Layout
- **Max content width**: `max-w-7xl` (80rem / 1280px) for page layouts
- **Card padding**: `p-4` to `p-6`
- **Gap**: `gap-4` to `gap-6` for grid layouts
- **Border radius**: `rounded-lg` (8px) for cards, `rounded-md` (6px) for inputs, `rounded-full` for pills/badges
- **Shadows**: `shadow-sm` for cards, `shadow-lg` for modals/sheets, `shadow-xl` for elevated elements

---

## 4. Current UI Patterns & Components

### Shared Components (shadcn/ui style)
- **Button** — `variant: "default" | "secondary" | "destructive" | "ghost" | "link" | "outline"`, `size: "default" | "sm" | "lg" | "icon"`
- **Input** — Standard text input with label, error state, focus ring
- **Label** — Form label component
- **Sheet** — Slide-in panel from right (used for submit form, chatbot, detail panel)
- **Dialog** — Modal dialog (used for AlertDialog confirmations)
- **AlertDialog** — Confirmation dialog with title, description, cancel/confirm buttons
- **Tabs** — Tab navigation (admin panel: Users / All Artifacts)
- **Switch** — Toggle switch (profile settings)
- **Select** — Dropdown select (condition filter, role assignment)
- **Badge** — Condition badges (excellent/good/fair/poor), 3D badge
- **Card** — Artifact cards with image, title, metadata, hover effects

### Custom Components
- **ArtifactCard** — Aspect-square image, 3D/condition badges, hover scale effect, Link to detail page
- **ArtifactGrid** — Responsive grid (1/2/3/4 cols), skeleton loading (12 cards), empty state
- **ArtifactMarker** — Google Maps AdvancedMarker with age-based color coding
- **ArtifactInfoWindow** — InfoWindow with thumbnail, title, summary, action buttons
- **ArtifactDetailPanel** — Framer Motion slide-in (480px), full metadata, AI sections, static map
- **StaticMap** — Client component wrapping `<img>` with `onError` fallback
- **MapExplorer** — Full-viewport map, search bar (pill-shaped, elevated), FAB button, detail panel
- **TagInput** — Chip input with warm palette colors, Enter/comma to add, X to remove, maxTags
- **LocationPicker** — Google Maps click-to-locate with reverse geocoding, debounced coordinate inputs
- **ImageUploader** — Drag-and-drop zone, file validation (50MB, image/model), XHR upload with progress bar
- **ArtifactSubmitForm** — 3-step sheet (Location → Details → Media), Zod validation, create→upload→update flow
- **ChatbotWidget** — Floating FAB (bottom-right), Sheet-based UI, message history, typing indicator
- **ChatMessage** — Individual message bubble (user vs AI styling)
- **AuthProvider** — Firebase `onAuthStateChanged` → Zustand store sync
- **LoginForm** — React Hook Form + Zod, Firebase `signInWithEmailAndPassword`
- **RegisterForm** — React Hook Form + Zod, password validation, Firebase `createUserWithEmailAndPassword`
- **AuthGuard** — Route guard, loading spinner, redirect logic, admin check
- **LoadingSpinner** — Centered spinner for loading states

### Animation Patterns
- **Detail panel**: Framer Motion `slideInFromRight` — 300ms ease-out
- **Typing indicator**: Framer Motion animated dots (bouncing)
- **Card hover**: `hover:scale-[1.02]` with `transition-transform`
- **Sheet open/close**: Native shadcn Sheet animation (slide from right)
- **FAB**: Fixed positioning, `z-50`, hover scale effect
- **Skeleton loading**: Tailwind `animate-pulse` on placeholder elements

---

## 5. All Pages & Routes

| Route | Page | Type | Auth Required |
|---|---|---|---|
| `/` | Map Explorer (home) | Client component | No |
| `/artifacts` | Artifact Gallery | Client component | No |
| `/artifacts/[id]` | Artifact Detail | Server component (SSR) | No |
| `/submit` | Artifact Submission Form | Client component | Yes (AuthGuard) |
| `/login` | Login | Client component | No (redirect if logged in) |
| `/register` | Register | Client component | No (redirect if logged in) |
| `/dashboard` | User Dashboard | Client component | Yes (AuthGuard) |
| `/admin` | Admin Panel | Client component | Yes (AuthGuard + admin) |

### Layout Structure
- **Root layout** (`app/layout.tsx`): HTML, body, fonts, `<Toaster>` (sonner), `<AuthProvider>`, `<Header>`, `<ChatbotWidget>`, `<main>` with children
- **Header**: Logo/branding, navigation links (Map, Artifacts), Submit Artifact button, Login/Register or User dropdown (Dashboard, Admin if admin, Logout)
- **ChatbotWidget**: Fixed bottom-right, rendered in root layout, visible on all pages

---

## 6. Current UX Patterns

### Loading States
- **Skeleton loading**: ArtifactGrid shows 12 skeleton cards with `animate-pulse`
- **Detail page skeleton**: Matching layout structure with pulse placeholders
- **Submit button spinner**: Loading spinner replaces button text during async operations
- **AuthGuard spinner**: Full-page centered spinner while auth state initializes
- **Map loading**: Google Maps API loading handled by `@vis.gl/react-google-maps` APIProvider

### Empty States
- **No artifacts**: "No artifacts found" message with illustration suggestion
- **No search results**: "No artifacts match your search" with clear filter suggestion
- **No user artifacts**: "You haven't submitted any artifacts yet" with link to submit

### Error States
- **Form validation**: Field-level error messages below inputs (red text)
- **API errors**: Toast notifications via sonner (destructive variant)
- **Auth errors**: Inline error messages on login/register forms
- **404**: Next.js default 404 page
- **Image load failure**: `onError` fallback to placeholder image

### Feedback Patterns
- **Toast notifications**: Success/error toasts via sonner (top-right)
- **Form submission**: Loading state → success toast → redirect or stay
- **Delete confirmation**: AlertDialog with "Are you sure?" before destructive actions
- **Role change**: Immediate UI update via TanStack Query invalidation
- **Search**: Debounced input (300ms) with loading indicator

### Responsive Behavior
- **Map**: Full viewport on all sizes
- **Artifact grid**: 1 col (mobile) → 2 col (sm) → 3 col (md) → 4 col (lg)
- **Detail page**: Single column (mobile) → two-column (md+)
- **Sheet**: Full width on mobile, 400px on desktop (chatbot), wider for submit form
- **Header**: Collapsed hamburger menu on mobile (not yet implemented — currently shows all links)

---

## 7. How Roo Code (Orchestrator) Works

Roo Code is an AI coding assistant that operates in **modes**. Each mode has a specialized role:

### Available Modes

| Mode | Role | Can Do |
|---|---|---|
| **🪃 Orchestrator** | Project manager, coordinator | Delegates subtasks, synthesizes results, updates docs. **Does NOT write code or plan architecture.** |
| **💻 Code** | Implementer | Writes, modifies, refactors code. Follows existing patterns. |
| **🏗️ Architect** | Designer, planner | Creates technical specifications, designs architecture, plans implementations. **Does NOT write code.** |
| **❓ Ask** | Explainer | Answers questions, explains concepts, analyzes code. |
| **🪲 Debug** | Troubleshooter | Investigates errors, adds logging, finds root causes. |

### How Orchestrator Delegates

1. You give the Orchestrator a high-level task
2. Orchestrator breaks it into subtasks
3. Orchestrator delegates each subtask to the appropriate mode (Code, Architect, Ask, Debug)
4. Each mode completes its subtask and reports back
5. Orchestrator synthesizes results and updates project documentation

### Key Orchestrator Behaviors
- **Cannot read or write files directly** — must delegate to Code mode
- **Cannot plan architecture** — must delegate to Architect mode
- **Always checks docs first** before planning
- **Updates PROJECT_STATE.md** after each session
- **Logs decisions as ADRs** in `docs/decisions/`
- **Logs errors** in `docs/errors/error-catalog.md`
- **Logs daily work** in `docs/sprints/YYYY-MM-DD.md`

---

## 8. How to Prompt the Orchestrator Best

### DOs

✅ **Be specific about what you want changed.** Instead of "make the UI better", say "redesign the artifact card component with hover elevation, a subtle border glow, and a smoother image reveal on load".

✅ **Reference existing components by name.** The Orchestrator knows the codebase — use component names like `ArtifactCard`, `MapExplorer`, `ArtifactDetailPanel`, `ChatbotWidget`, `TagInput`, `ImageUploader`, `ArtifactSubmitForm`.

✅ **Provide visual references.** If you have a design inspiration (Dribbble, Behance, a specific website), describe it or share a screenshot. The Orchestrator can use vision capabilities.

✅ **Prioritize your requests.** Number them by importance. The Orchestrator will tackle P0 first, then P1, etc.

✅ **Group related changes.** Instead of 20 separate prompts, group related UI changes (e.g., "all card components" or "all form components") into one prompt.

✅ **Specify the "feel" you want.** Words like "warm", "earthy", "scholarly", "museum-like", "modern", "minimal", "playful" help the Orchestrator understand the aesthetic direction.

✅ **Include acceptance criteria.** Tell the Orchestrator what "done" looks like for each task.

### DON'Ts

❌ **Don't ask the Orchestrator to write code.** It can't. It will delegate to Code mode.

❌ **Don't ask the Orchestrator to design architecture.** It can't. It will delegate to Architect mode.

❌ **Don't be vague.** "Make it look better" is not actionable. Be specific about what "better" means.

❌ **Don't skip the context.** Always include the project overview and tech stack (this document has it all).

---

## 9. What Info to Include in Your Prompt

When prompting Claude/Claude Code for UI work, include:

### Required
1. **Project context** — What is GAD? (copy from Section 1)
2. **Tech stack** — What frameworks/libs are used? (copy from Section 2)
3. **Current styling** — What colors, fonts, patterns exist? (copy from Sections 3-4)
4. **Specific components/pages** — What exactly do you want changed? (copy from Sections 4-5)
5. **Acceptance criteria** — What does "done" look like?

### Optional but Helpful
6. **Visual references** — URLs to designs, screenshots, or detailed descriptions
7. **Priority** — P0/P1/P2 so the AI knows what to focus on
8. **Constraints** — Performance targets, bundle size limits, accessibility requirements
9. **Inspiration** — "I want it to feel like the British Museum website" or "like Airbnb's map experience"

---

## 10. UI/UX Enhancement Prompt Blueprint (10+ Prompts)

Below are 12 ready-to-use prompts. Copy-paste the ones you want into your Claude conversation. Each prompt includes the necessary context reference so Claude knows what to work on.

---

### Prompt 1: Global Design System & Theme Refinement

> **Context**: GAD (Global Archaeological Database) — see project overview, tech stack, and current color palette in the reference document.
>
> **Task**: Refine the global design system. The current palette is warm/earthy but feels flat. I want:
>
> 1. **A defined design token system** — Create a comprehensive Tailwind config extension with semantic tokens for:
>    - `brand` (primary GAD identity — dark goldenrod `#B8860B` and its shades)
>    - `surface` (backgrounds, cards, sheets, dialogs)
>    - `text` (primary, secondary, muted, inverse)
>    - `border` (subtle, default, strong)
>    - `status` (success, warning, error, info)
>    - `age` (the 5 age-based marker colors)
> 2. **A subtle noise/grain texture** on the page background (`#FDFAF5`) to give it a parchment/paper feel — use a CSS `::before` pseudo-element with an SVG filter or a tiny base64-encoded noise pattern
> 3. **A refined shadow system** — Define 5 shadow levels (xs, sm, md, lg, xl) with warm-toned shadows (using `rgba(#8B4513, opacity)` instead of gray/black)
> 4. **Border radius scale** — Define `radius: { sm: '4px', md: '6px', lg: '8px', xl: '12px', '2xl': '16px', full: '9999px' }`
> 5. **Transition tokens** — Define `transition: { fast: '150ms ease-out', normal: '200ms ease-out', slow: '300ms ease-out' }`
>
> **Files to modify**: `tailwind.config.ts`, `app/globals.css`
> **Acceptance criteria**: All existing components continue to work. New tokens are documented in a comment block at the top of `tailwind.config.ts`.

---

### Prompt 2: Typography System Overhaul

> **Context**: GAD — see tech stack (Next.js 16, Tailwind v3) and current typography (system font stack).
>
> **Task**: Implement a scholarly yet modern typography system.
>
> 1. **Choose and integrate a serif font for headings** — Use `Playfair Display` (Google Fonts) for all `h1`-`h4` elements. Import via `next/font/google` in the root layout.
> 2. **Keep a clean sans-serif for body text** — Use `Inter` (Google Fonts) for body, buttons, inputs, and UI elements.
> 3. **Define a type scale** in Tailwind config:
>    - `h1`: `text-4xl md:text-5xl`, `font-bold`, `tracking-tight`, serif
>    - `h2`: `text-3xl md:text-4xl`, `font-semibold`, serif
>    - `h3`: `text-2xl md:text-3xl`, `font-semibold`, serif
>    - `h4`: `text-xl md:text-2xl`, `font-medium`, serif
>    - `body`: `text-base`, `leading-relaxed`, sans-serif
>    - `small`: `text-sm`, `text-muted-foreground`, sans-serif
>    - `caption`: `text-xs`, `text-muted-foreground`, uppercase, `tracking-wider`
> 4. **Add `letter-spacing` and `line-height` refinements** — Headings should have tighter line-height (`leading-tight`), body should have comfortable `leading-relaxed` or `leading-7`.
> 5. **Create reusable prose styles** for artifact descriptions and AI analysis text — well-spaced, readable, with proper paragraph margins.
>
> **Files to modify**: `app/layout.tsx`, `tailwind.config.ts`, `app/globals.css`
> **Acceptance criteria**: All pages use the new typography. Headings are serif, body is sans-serif. No visual regressions.

---

### Prompt 3: Header & Navigation Redesign

> **Context**: GAD — see current header (logo, nav links, auth buttons/dropdown). Currently all links are always visible.
>
> **Task**: Redesign the header for a more polished, museum-like feel.
>
> 1. **Sticky header** with a subtle backdrop blur (`bg-background/80 backdrop-blur-md`) — the header should feel slightly translucent when scrolled
> 2. **Logo redesign** — Use a simple archaeological icon (amphora, column, or pickaxe emoji or SVG) + "GAD" text in `Playfair Display` serif, with a subtle tagline "Global Archaeological Database" in small muted text below or as a tooltip
> 3. **Navigation links** — Map, Artifacts, Submit (if authenticated). Use `text-sm font-medium` with an underline or pill-shaped active indicator. Add a subtle hover effect (underline slide-in or background tint).
> 4. **Mobile responsive** — On mobile (< md), collapse navigation into a hamburger menu with a slide-in drawer (Sheet component) showing all links vertically with icons
> 5. **Auth section** — When logged out: "Sign In" (outline button) and "Register" (primary button). When logged in: user avatar circle (first letter of display_name) with a dropdown menu (Dashboard, Admin if admin, Logout with divider)
> 6. **Add a subtle bottom border** to the header (`border-b border-border/50`) that becomes more opaque on scroll
> 7. **Micro-animation**: Logo should have a subtle fade-in on page load. Nav links should have a staggered entrance animation.
>
> **Files to modify**: `components/layout/Header.tsx`, `app/layout.tsx`
> **Acceptance criteria**: Header works on all breakpoints. Mobile hamburger menu works. Auth state syncs correctly. All existing links function.

---

### Prompt 4: Map Explorer — Visual Overhaul

> **Context**: GAD Map Explorer — see `MapExplorer.tsx`, `ArtifactMarker.tsx`, `ArtifactInfoWindow.tsx`, `ArtifactDetailPanel.tsx`. Full-viewport Google Map with markers, InfoWindow, sliding detail panel, search bar, FAB.
>
> **Task**: Elevate the map explorer to feel like a premium geospatial experience.
>
> 1. **Custom map style** — Create a more distinctive map style using Google Maps `MapId` styling:
>    - All labels in a warm serif font style (if possible via MapId)
>    - Land: warm parchment `#f5f0e8` with subtle elevation shading
>    - Water: deeper `#8ab4c8` with slight gradient
>    - Parks/greenspace: muted olive `#d4d9c8`
>    - Roads: very subtle, light `#e0d8cc`, minimal labels
>    - Transit: hidden
> 2. **Search bar redesign** — Make it a floating pill at the top-center, wider on desktop (max-w-lg), with:
>    - A search icon on the left (magnifying glass)
>    - Input placeholder: "Search artifacts, sites, or civilizations..."
>    - A clear button (X) when text is entered
>    - Dropdown suggestions below (from Google Places + local artifact search)
>    - Elevated shadow: `shadow-lg shadow-black/10`
>    - Backdrop blur on the input background
> 3. **Marker enhancements** — Instead of simple colored pins:
>    - Use custom SVG markers with the age color as a circular dot inside a white ring
>    - Add a subtle pulsing animation on the selected marker
>    - Cluster markers at low zoom levels (use `@googlemaps/markerclusterer` or `useMapsLibrary('marker')`)
> 4. **InfoWindow redesign** — Custom-styled InfoWindow (or use the detail panel instead):
>    - Clean white card with rounded corners
>    - Small thumbnail (80x80, rounded)
>    - Title in serif, age/condition as small badges
>    - "View Details" link
>    - Close button (X) in top-right
> 5. **Detail panel animation** — Smoother Framer Motion slide-in:
>    - Slide from right with a slight fade
>    - Content fades in after the panel slides (staggered)
>    - A thin vertical accent bar on the left edge in the artifact's age color
> 6. **FAB button** — Redesign as a circular button with a "+" icon, with:
>    - A subtle glow/shadow effect
>    - Hover scale + slight rotation of the "+" icon
>    - Tooltip "Submit Artifact" on hover
>    - If unauthenticated, show a brief tooltip "Sign in to submit artifacts"
>
> **Files to modify**: `components/map/MapExplorer.tsx`, `components/map/ArtifactMarker.tsx`, `components/map/ArtifactInfoWindow.tsx`, `components/artifacts/ArtifactDetailPanel.tsx`
> **Acceptance criteria**: Map loads correctly. All interactions work. No Google Maps API errors. Performance is smooth.

---

### Prompt 5: Artifact Gallery — Grid & Filter Redesign

> **Context**: GAD Artifact Gallery — see `ArtifactCard.tsx`, `ArtifactGrid.tsx`, `app/artifacts/page.tsx`. Responsive grid with filter bar (country text, condition select, type toggle).
>
> **Task**: Transform the gallery into a visually stunning browsing experience.
>
> 1. **Card redesign** — Each artifact card should feel like a museum exhibit card:
>    - Aspect-square image with `object-cover` and a subtle dark gradient overlay at the bottom for text readability
>    - Title overlaid on the image (bottom-left, white text with text-shadow or gradient background)
>    - Age/condition badges in the top-right corner of the image
>    - On hover: image scales up slightly (1.05x) with a smooth transition, and a "View Details" label appears centered
>    - Card has a warm white background, subtle border, and `shadow-sm` that elevates to `shadow-md` on hover
>    - Border color changes subtly based on artifact age (matching the marker color system)
> 2. **Filter bar redesign** — Make it a sticky horizontal bar below the header:
>    - Clean, minimal design with rounded input fields
>    - Search input with magnifying glass icon, debounced
>    - Condition dropdown styled as a pill select
>    - Type toggle as a segmented control (All / 3D Models / Photos)
>    - "Clear filters" link that appears when any filter is active
>    - Result count: "Showing 24 of 156 artifacts"
> 3. **Grid layout** — Add a "view mode" toggle:
>    - Grid view (current, default)
>    - List view (horizontal cards with larger text, no images or small thumbnails)
> 4. **Loading state** — Skeleton cards should match the new card design exactly (image placeholder + text lines with pulse)
> 5. **Empty state** — A beautiful empty state illustration (use an SVG of an empty display case or magnifying glass) with "No artifacts found" and a "Clear filters" button
> 6. **Pagination** — Add "Load more" button at the bottom (cursor-based pagination via TanStack Query's `fetchNextPage`)
>
> **Files to modify**: `components/artifacts/ArtifactCard.tsx`, `components/artifacts/ArtifactGrid.tsx`, `app/artifacts/page.tsx`
> **Acceptance criteria**: All cards render correctly. Filters work. Loading/empty states look polished. Responsive at all breakpoints.

---

### Prompt 6: Artifact Detail Page — Immersive Redesign

> **Context**: GAD Artifact Detail — see `app/artifacts/[id]/page.tsx` (SSR), `app/artifacts/[id]/loading.tsx`. Two-column layout with image, metadata, static map, AI analysis, tags, condition badges.
>
> **Task**: Make the detail page feel like a museum exhibit display.
>
> 1. **Hero section** — Full-width image at the top (max-h-96) with:
>    - A dark gradient overlay at the bottom for the title/age text
>    - Title in large serif (`text-4xl md:text-5xl font-bold font-serif`) overlaid on the image
>    - Age and condition badges below the title
>    - A "back to gallery" link in the top-left corner
>    - If no image, show a stylized placeholder with the artifact's first letter in the age color
> 2. **Metadata section** — Below the hero, a two-column (single on mobile) layout:
>    - Left column: Description (prose-styled), materials (as tags), cultural origin, tags
>    - Right column: A "Details" card with icon-labeled rows:
>      - 📍 Location (country, coordinates with a small static map)
>      - 🏺 Period/Age
>      - 🏛️ Cultural Origin
>      - 🔬 Condition (with colored badge)
>      - 👤 Submitted by (uploader name)
>      - 👁️ View count
> 3. **AI Analysis section** — A visually distinct card with:
>    - A subtle AI icon/sparkle in the header
>    - The analysis text in prose styling
>    - "Powered by Gemini AI" small text at the bottom
>    - If not yet analyzed, a "Analyze with AI" button
> 4. **Find Similar section** — Below analysis:
>    - "Similar Artifacts" heading
>    - A horizontal scrollable row of 4-6 small artifact cards
>    - Loading skeleton while fetching
> 5. **Static map** — Replace with an interactive mini-map (Google Maps with a single marker, disabled interactions) instead of the static image
> 6. **JSON-LD structured data** — Already implemented, ensure it's complete
> 7. **Page transitions** — Add a subtle fade-in animation when the page loads
>
> **Files to modify**: `app/artifacts/[id]/page.tsx`, `app/artifacts/[id]/loading.tsx`, `components/artifacts/StaticMap.tsx`
> **Acceptance criteria**: SSR still works. Metadata is correct. All sections render. Responsive layout. No hydration errors.

---

### Prompt 7: Artifact Submission Form — UX Polish

> **Context**: GAD Submission Form — see `ArtifactSubmitForm.tsx`, `LocationPicker.tsx`, `ImageUploader.tsx`, `TagInput.tsx`. 3-step sheet (Location → Details → Media).
>
> **Task**: Polish the submission flow to feel delightful and intuitive.
>
> 1. **Step indicator redesign** — Replace the current step indicator with a more visual one:
>    - Horizontal stepper with numbered circles connected by a line
>    - Completed steps show a checkmark in the circle (green)
>    - Current step has a pulsing ring animation
>    - Future steps are muted
>    - Step labels below each circle: "Location", "Details", "Media"
>    - Animated progress line between steps (Framer Motion layout animation)
> 2. **Step 1: Location** — Map picker enhancements:
>    - Larger map area (take more vertical space)
>    - A centered crosshair/drop-pin icon that stays fixed while the map moves
>    - Reverse geocoded address shown in a pill above the map
>    - Manual coordinate inputs below the map (read-only until map is clicked, then editable)
>    - Country auto-filled from reverse geocoding
> 3. **Step 2: Details** — Form field enhancements:
>    - Title input with character count (1-200)
>    - Description textarea with character count (1-5000) and auto-resize
>    - Age input with a dropdown of common periods (Paleolithic, Neolithic, Bronze Age, Iron Age, Classical, Medieval, Modern, Other) plus custom text input
>    - Materials TagInput with suggested tags that appear as clickable chips below the input
>    - Condition as a visual 5-star or 5-circle rating (Excellent → Poor) instead of a dropdown
>    - Cultural origin with autocomplete suggestions from common civilizations
> 4. **Step 3: Media** — Upload enhancements:
>    - Drag-and-drop zone with a dashed border that becomes solid on drag-over
>    - File type icons (image icon for photos, 3D cube icon for models)
>    - Upload progress with a circular progress indicator instead of a linear bar
>    - After upload, show a thumbnail preview with a remove button (X overlay)
>    - Max file size shown: "Max 50MB per file"
> 5. **Navigation** — "Back" and "Next" buttons with smooth slide transitions between steps
> 6. **Review step** — Before final submit, show a summary of all entered data with edit buttons for each section
> 7. **Success state** — After submission, show a beautiful success animation (checkmark drawing itself) with "Artifact Submitted!" and links to view the artifact or submit another
>
> **Files to modify**: `components/artifacts/ArtifactSubmitForm.tsx`, `components/shared/LocationPicker.tsx`, `components/shared/ImageUploader.tsx`, `components/shared/TagInput.tsx`
> **Acceptance criteria**: All 3 steps work. Validation is correct. Upload progress shows. Success animation plays. Form is responsive.

---

### Prompt 8: AI Chatbot — UI Enhancement

> **Context**: GAD AI Chatbot — see `ChatbotWidget.tsx`, `ChatMessage.tsx`. Floating FAB (bottom-right), Sheet-based UI, message history, typing indicator.
>
> **Task**: Make the chatbot feel like a premium AI assistant.
>
> 1. **Trigger button redesign** — The floating FAB should be:
>    - A circular button with a chat/sparkle icon
>    - A subtle gradient background (warm gold to brown)
>    - A gentle pulsing glow animation (to draw attention but not be distracting)
>    - A small notification dot if there's a welcome message to show
> 2. **Sheet header** — "Archaeological Assistant" with:
>    - A small AI/sparkle icon next to the title
>    - Subtitle: "Ask me anything about archaeology" in muted text
>    - A "Clear chat" button (trash icon) that shows a confirmation
>    - Close button (X)
> 3. **Message bubbles** — Redesign for clarity:
>    - User messages: right-aligned, primary color (`#B8860B`) background, white text, rounded-2xl with `rounded-br-sm`
>    - AI messages: left-aligned, muted background (`#F0EBE0`), dark text, rounded-2xl with `rounded-bl-sm`
>    - AI avatar/icon next to AI messages (small circle with "AI" or a sparkle icon)
>    - Timestamps on hover (small, muted)
>    - Code blocks or artifact references formatted nicely
> 4. **Typing indicator** — Three bouncing dots with a subtle fade animation
> 5. **Input area** — Fixed at the bottom of the sheet:
>    - Rounded input field with a send button
>    - Send button disabled when input is empty
>    - Character count (max 2000) shown near the send button when approaching limit
>    - Enter to send, Shift+Enter for newline
> 6. **Welcome message** — On first open, show a welcome message from the AI:
>    - "Welcome to the GAD Archaeological Assistant! I can help you learn about artifacts, ancient civilizations, and archaeological methods. Try asking me about [suggested topic]."
> 7. **Quick action chips** — Below the welcome message, show 3-4 clickable suggestion chips:
>    - "What is this site about?"
>    - "Tell me about the Bronze Age"
>    - "How to identify pottery types?"
>    - "Explain carbon dating"
>
> **Files to modify**: `components/ai/ChatbotWidget.tsx`, `components/ai/ChatMessage.tsx`
> **Acceptance criteria**: Chatbot opens/closes smoothly. Messages render correctly. Typing indicator works. Quick actions are clickable and send the message. Works for both auth and anonymous users.

---

### Prompt 9: Auth Pages — Visual Redesign

> **Context**: GAD Auth — see `app/login/page.tsx`, `app/register/page.tsx`, `LoginForm.tsx`, `RegisterForm.tsx`. Centered card layout with warm off-white background, dark goldenrod branding.
>
> **Task**: Make the auth pages feel welcoming and polished.
>
> 1. **Background** — Add a subtle pattern or illustration:
>    - A very faint archaeological pattern (amphora outlines, column lines) as a background SVG
>    - Or a warm gradient background (`from-[#FDFAF5] via-[#F5EDE0] to-[#EDE0CC]`)
> 2. **Card redesign** — The auth card should:
>    - Have a warm white background with a subtle border
>    - `shadow-lg` with warm-toned shadow
>    - `rounded-xl` corners
>    - A decorative top border or accent bar in `#B8860B` (dark goldenrod)
>    - Max-width: `max-w-md`
> 3. **Branding** — At the top of the card:
>    - A larger GAD logo/branding (icon + "GAD" in serif)
>    - Tagline: "Global Archaeological Database"
>    - A warm divider below
> 4. **Form fields** — Enhanced styling:
>    - Labels in `text-sm font-medium text-foreground`
>    - Inputs with focus ring in `ring-[#B8860B]`
>    - Error messages with a small warning icon
>    - Submit button: full-width, primary color, with loading spinner
> 5. **Micro-interactions**:
>    - Input fields should have a subtle border color transition on focus
>    - Submit button should have a slight scale animation on press
>    - Success redirect should have a brief fade-out
> 6. **Links** — "Don't have an account? Register" and "Forgot password?" styled as muted links with hover underline effect
> 7. **Password validation** (register) — Show real-time password requirements checklist:
>    - ✓ At least 8 characters
>    - ✓ Contains uppercase letter
>    - ✓ Contains a number
>    - Each requirement turns green when satisfied
>
> **Files to modify**: `app/login/page.tsx`, `app/register/page.tsx`, `components/auth/LoginForm.tsx`, `components/auth/RegisterForm.tsx`
> **Acceptance criteria**: Both pages render correctly. Forms validate. Auth flow works. Responsive on mobile.

---

### Prompt 10: Dashboard & Admin Panel — UI Overhaul

> **Context**: GAD Dashboard & Admin — see `app/dashboard/page.tsx`, `app/admin/page.tsx`. Dashboard shows user's artifacts with Edit/Delete, profile settings, account stats. Admin panel has Users and All Artifacts tabs.
>
> **Task**: Make the dashboard and admin panel feel like professional tools.
>
> 1. **Dashboard layout** — Restructure with clear sections:
>    - **Welcome header**: "Welcome back, [name]" with avatar circle and join date
>    - **Stats cards row**: 3 cards in a row (Total Artifacts, With AI Analysis, Pending Analysis) with icons and subtle background colors
>    - **My Artifacts section**: ArtifactGrid filtered to user's artifacts, with Edit/Delete overlay buttons on hover
>    - **Profile Settings section**: Expandable/collapsible section with form fields
> 2. **Artifact cards in dashboard** — Same card design as gallery (Prompt 5) but with:
>    - Edit button (pencil icon) in top-left overlay on hover
>    - Delete button (trash icon) in top-right overlay on hover
>    - Edit opens the ArtifactSubmitForm in edit mode (pre-filled)
>    - Delete shows AlertDialog with artifact title in the confirmation
> 3. **Profile settings** — Clean form design:
>    - Display name input with save button
>    - "Show name publicly" toggle with description text
>    - Save button with loading state and success toast
> 4. **Admin panel** — Professional data management interface:
>    - **Users tab**: Table with sticky header, alternating row colors, sortable columns (click header to sort)
>    - Role dropdown with color-coded badges (admin = gold, user = blue)
>    - Search/filter input for users
>    - **All Artifacts tab**: Same grid as dashboard but for all artifacts
>    - Delete button visible on all artifacts (admin privilege)
>    - Total count badge: "156 artifacts total"
> 5. **Responsive** — Dashboard goes single-column on mobile. Admin table becomes a card list on mobile.
>
> **Files to modify**: `app/dashboard/page.tsx`, `app/admin/page.tsx`
> **Acceptance criteria**: All data loads correctly. Edit/Delete work. Profile settings save. Admin role management works. Responsive.

---

### Prompt 11: Micro-Animations & Interaction Details

> **Context**: GAD — all pages and components. Currently has basic Framer Motion for detail panel and typing indicator.
>
> **Task**: Add delightful micro-animations throughout the app to make it feel polished and alive.
>
> 1. **Page transitions** — Add a subtle fade-in + slide-up animation when navigating between pages (use Framer Motion's `AnimatePresence` in the root layout)
> 2. **Card entrance animations** — When the artifact grid loads, cards should stagger in (each card fades in and slides up slightly, with a 50ms delay between each)
> 3. **Hover effects** — Consistent hover patterns:
>    - Buttons: slight scale (1.02) + brighter background
>    - Cards: elevate shadow + scale (1.02) + subtle border color change
>    - Links: underline slide-in from left
>    - Interactive elements: cursor pointer, transition all 200ms ease
> 4. **Loading skeletons** — Replace `animate-pulse` with a custom shimmer animation:
>    - A gradient that sweeps across the skeleton from left to right
>    - Use a `linear-gradient` with `translateX` animation
>    - More visually interesting than the default pulse
> 5. **Toast notifications** — Enhance sonner toasts:
>    - Slide in from top-right with a bounce
>    - Success toasts with a green accent and checkmark icon
>    - Error toasts with a red accent and X icon
>    - Auto-dismiss after 4 seconds
> 6. **Button press feedback** — All buttons should have:
>    - `active:scale-95` on click (slight press effect)
>    - `transition-transform duration-150`
> 7. **Number counters** — Stats on dashboard should animate counting up from 0 to their final value
> 8. **Image loading** — Images should fade in as they load (not snap in):
>    - Use a blur-up technique (show a blurred 20px version first, then transition to full resolution)
>    - Or use a simple opacity transition: `opacity-0` → `opacity-100` on load
>
> **Files to modify**: `app/layout.tsx`, `components/artifacts/ArtifactGrid.tsx`, `components/artifacts/ArtifactCard.tsx`, `app/globals.css`
> **Acceptance criteria**: Animations are subtle (not distracting). Performance is smooth (no jank). All animations respect `prefers-reduced-motion`.

---

### Prompt 12: Accessibility & Responsive Polish

> **Context**: GAD — all pages. Currently responsive but not fully audited for accessibility.
>
> **Task**: Ensure the app is accessible and responsive at all breakpoints.
>
> 1. **Keyboard navigation** — Ensure all interactive elements are:
>    - Focusable with visible focus rings (use the `--ring` color `#B8860B`)
>    - Navigable via Tab in logical order
>    - Activateable with Enter/Space
>    - Skip-to-content link at the top of the page (visually hidden, visible on focus)
> 2. **Screen reader support**:
>    - All images have meaningful `alt` text
>    - Icon buttons have `aria-label`
>    - Form fields have associated labels
>    - Dynamic content changes are announced (use `aria-live` regions)
>    - Sheet/Dialog has `aria-labelledby` and `aria-describedby`
> 3. **Color contrast** — Verify all text meets WCAG AA standards:
>    - Normal text: 4.5:1 contrast ratio minimum
>    - Large text: 3:1 minimum
>    - Use the current palette and adjust if needed
> 4. **Reduced motion** — All animations should respect `prefers-reduced-motion`:
>    - Wrap Framer Motion animations in a check for `window.matchMedia('(prefers-reduced-motion: reduce)')`
>    - Or use Tailwind's `motion-safe:` and `motion-reduce:` modifiers
> 5. **Responsive breakpoints** — Audit all pages:
>    - Mobile: 320px–639px (single column, hamburger menu, full-width sheets)
>    - Tablet: 640px–1023px (2 columns, visible nav)
>    - Desktop: 1024px+ (full layout, 3-4 columns)
>    - Test that no content overflows or gets cut off
> 6. **Touch targets** — Ensure all interactive elements are at least 44x44px (WCAG guideline)
> 7. **Loading states** — All data-fetching states have:
>    - Loading skeleton or spinner
>    - Error state with retry button
>    - Empty state with helpful message
>
> **Files to modify**: `app/layout.tsx`, `app/globals.css`, and individual components as needed
> **Acceptance criteria**: Lighthouse accessibility score > 90. All pages responsive at 320px, 768px, 1024px, 1440px. No keyboard traps.

---

## 11. Key Design Constraints

### Performance
- **Bundle size**: Keep it lean. shadcn/ui components are tree-shakeable. Avoid heavy animation libraries beyond Framer Motion.
- **Images**: Use Next.js `<Image>` component with lazy loading. Thumbnails should be served at appropriate sizes.
- **Map**: Google Maps API loads on demand. Only one map instance at a time.
- **SSR**: Detail page is SSR with `revalidate: 120`. Gallery and map are client-side rendered.
- **Fonts**: If adding Google Fonts, use `next/font/google` with `display: 'swap'` and subset for Latin.

### Accessibility
- All interactive elements must be keyboard accessible
- Color contrast must meet WCAG AA (4.5:1 for normal text)
- All form inputs must have associated labels
- Animations must respect `prefers-reduced-motion`
- Touch targets minimum 44x44px

### Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge — last 2 versions)
- No IE11 support
- Mobile Safari and Chrome on iOS/Android

### Theming
- Currently **light mode only** — no dark mode
- If dark mode is added later, use Tailwind's `dark:` variant and CSS custom properties
- All colors should be defined as CSS custom properties in `globals.css` for easy theming

---

## 12. Appendix: Current Component Tree

```
RootLayout (app/layout.tsx)
├── AuthProvider (components/auth/AuthProvider.tsx)
│   └── Firebase onAuthStateChanged → Zustand sync
├── Toaster (sonner)
├── Header (components/layout/Header.tsx)
│   ├── Logo/Branding
│   ├── Nav Links (Map, Artifacts)
│   ├── Submit Artifact Button (if authenticated)
│   ├── Login/Register Buttons (if unauthenticated)
│   └── User Dropdown (if authenticated)
│       ├── Dashboard
│       ├── Admin (if admin)
│       └── Logout
├── ChatbotWidget (components/ai/ChatbotWidget.tsx)
│   ├── FAB Trigger Button
│   └── Sheet
│       ├── Header (Archaeological Assistant)
│       ├── Message List
│       │   └── ChatMessage (components/ai/ChatMessage.tsx)
│       ├── Typing Indicator
│       └── Input Area
├── Main Content (children)
│   ├── Page: Home (/) → MapExplorer
│   │   ├── MapExplorer (components/map/MapExplorer.tsx)
│   │   │   ├── Search Bar
│   │   │   ├── Google Map (APIProvider)
│   │   │   │   └── ArtifactMarker[] (components/map/ArtifactMarker.tsx)
│   │   │   │       └── ArtifactInfoWindow (components/map/ArtifactInfoWindow.tsx)
│   │   │   ├── ArtifactDetailPanel (components/artifacts/ArtifactDetailPanel.tsx)
│   │   │   │   ├── StaticMap (components/artifacts/StaticMap.tsx)
│   │   │   │   ├── AI Analysis Section
│   │   │   │   └── Find Similar Section
│   │   │   └── FAB Button
│   │   └── ArtifactSubmitForm (components/artifacts/ArtifactSubmitForm.tsx) [Sheet]
│   │       ├── Step 1: LocationPicker (components/shared/LocationPicker.tsx)
│   │       ├── Step 2: Details Form
│   │       │   └── TagInput (components/shared/TagInput.tsx)
│   │       └── Step 3: ImageUploader (components/shared/ImageUploader.tsx)
│   ├── Page: /artifacts → Artifact Gallery
│   │   ├── Filter Bar
│   │   └── ArtifactGrid (components/artifacts/ArtifactGrid.tsx)
│   │       └── ArtifactCard[] (components/artifacts/ArtifactCard.tsx)
│   ├── Page: /artifacts/[id] → Artifact Detail (SSR)
│   │   ├── Hero Image
│   │   ├── Metadata Section
│   │   ├── AI Analysis Card
│   │   ├── Find Similar Row
│   │   └── StaticMap
│   ├── Page: /submit → AuthGuard → ArtifactSubmitForm
│   ├── Page: /login → LoginForm
│   ├── Page: /register → RegisterForm
│   ├── Page: /dashboard → AuthGuard → Dashboard
│   │   ├── Welcome Header
│   │   ├── Stats Cards
│   │   ├── My Artifacts (ArtifactGrid with Edit/Delete)
│   │   └── Profile Settings
│   └── Page: /admin → AuthGuard (admin) → Admin Panel
│       ├── Users Tab (Table)
│       └── All Artifacts Tab (Grid with Delete)
└── Footer (if any)
```