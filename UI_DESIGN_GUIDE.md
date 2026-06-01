# Crescia — UI & Design Guide
# For reference when prompting Cursor, v0.dev, or any design tool
# Last updated: May 2026

---

## Design Philosophy

Crescia sits at the intersection of three reference points:
- **Monument Valley** — geometric minimalism, satisfying spatial logic, quiet beauty
- **Notion** — clean information hierarchy, generous whitespace, nothing wasted
- **Duolingo** (restrained) — clear progress indicators, rewarding feedback moments, never childish

The result: a product that feels calm and intelligent, not gamified in the Candy Crush sense.
High schoolers should feel like they are using something sophisticated, not something made for kids.
Every screen should be able to answer: "what is the one thing this screen wants me to do?"

---

## shadcn/ui Preset: Luma

Apply the Luma preset during shadcn/ui initialization.
Luma characteristics: softer and more fluid than default shadcn, olive/lime base, Geist font.
Preset code for reference: b5Kc6P0Vc
Preset URL: https://ui.shadcn.com/create?preset=b5Kc6P0Vc

To apply to an existing project:
```
npx shadcn@latest init --preset b5Kc6P0Vc
```

---

## Color Palette (Override Luma Defaults)

Luma's olive/lime base is a strong starting point. Override in globals.css to warm it toward Crescia's botanical identity:

```css
:root {
  /* Backgrounds */
  --background: #FAFAF7;          /* off-white, not pure white — softer on eyes */
  --background-secondary: #F2F0EB; /* slightly darker for card backgrounds */
  --background-garden: #EEF2EC;   /* very light sage — only used on garden tab */

  /* Primary — Sage Green */
  --primary: #6B8F71;             /* main sage green — buttons, active states */
  --primary-foreground: #FFFFFF;

  /* Accent — Warm Gold */
  --accent: #C9A84C;              /* XP gains, achievements, rewards, shard count */
  --accent-foreground: #FFFFFF;

  /* Text */
  --foreground: #2D3436;          /* primary text — dark slate, not pure black */
  --muted-foreground: #6B7280;    /* secondary text, labels, captions */

  /* Borders */
  --border: #E2E0DA;              /* subtle warm border, not cold gray */

  /* Semantic */
  --correct: #4CAF7D;             /* correct answer feedback — medium green */
  --incorrect: #C0716A;           /* wrong answer feedback — muted rose, not harsh red */
  --warning: #D4956A;             /* caution states — warm amber */
  --dormant: #B0ADA8;             /* dormant plants, inactive states */

  /* Chart colors (Recharts) */
  --chart-1: #6B8F71;             /* primary series — sage */
  --chart-2: #C9A84C;             /* secondary series — gold */
  --chart-3: #7C9BB5;             /* tertiary series — muted blue */
  --chart-4: #C0716A;             /* quaternary — muted rose */
}
```

---

## Typography

Font family: **Geist** (comes with Luma preset, included via Next.js font system)
Heading font: inherit from Geist — do not use a separate heading font for MVP

```
Headings (h1):    text-2xl font-semibold tracking-tight
Headings (h2):    text-xl font-semibold
Headings (h3):    text-base font-semibold
Body text:        text-sm text-foreground
Captions/labels:  text-xs text-muted-foreground
Numbers (XP/scores): font-mono tabular-nums  ← prevents layout shift as numbers change
```

Rules:
- Never use font-bold on body text. font-semibold is the maximum weight for headings.
- Never use pure black (#000000) for text. Always use --foreground (#2D3436).
- Line height: leading-relaxed for body, leading-tight for headings.
- Letter spacing: tracking-tight for headings only.

---

## Spacing & Layout

- Card padding: p-5 or p-6 — generous, never cramped
- Gap between cards: gap-4 or gap-6
- Page container: max-w-5xl mx-auto px-6 — never full-bleed on desktop
- Section spacing: space-y-8 between major sections
- Never use more than 3 columns in a grid on desktop

---

## Component Rules

### Cards
```
className="rounded-xl border border-border bg-background shadow-sm"
```
- Never use shadow-md or shadow-lg — keep shadows very subtle
- Inner content should have p-5 or p-6
- Use rounded-xl consistently — not rounded-lg, not rounded-2xl

### Buttons
- Primary (CTA): bg-primary text-white rounded-full px-6 — pill shape for main actions
- Secondary: variant="outline" rounded-full — same pill shape
- Ghost: for navigation items and less important actions
- Never use square buttons (no rounded-none) except for keyboard/input components

### Badges (subject tags, difficulty, achievement unlocked)
```
className="rounded-full px-3 py-0.5 text-xs font-medium"
```
- Subject tags: custom color per subject (see Subject Color System below)
- Difficulty: Easy = green tint, Medium = amber tint, Hard = rose tint
- Achievement badges: accent gold background when unlocked, gray with opacity when locked

### Progress Bars (XP, readiness, daily goal)
- Use shadcn/ui Progress component
- Height: h-2 for compact bars (in cards), h-3 for feature bars (readiness score)
- Color: primary (sage) for XP and readiness, accent (gold) for daily goal
- Always show percentage or fraction label beside the bar

### Input / Textarea (FRQ answer entry)
- rounded-xl border border-border
- Focus ring: ring-1 ring-primary
- Textarea for FRQ: min-h-[180px], resize-y allowed

---

## Subject Color System

Each AP subject has a subtle color identity. Used in badges, topic nodes, and heatmap accents.

| Subject | Badge BG | Badge Text | Heatmap Accent |
|---|---|---|---|
| AP Statistics | #E8F0EC | #3D6B4F | #6B8F71 |
| AP Biology | #E8F2E8 | #2E6B3E | #5A9E6B |
| AP Calculus | #EAE8F0 | #4A3D8F | #7B6BC9 |

---

## Animations (Framer Motion)

Use animation sparingly. The rule: animate moments that represent achievement, never for decoration.

Approved animation moments:
- XP number counting up after a correct answer (0.4s ease-out)
- Level-up modal appearing (scale from 0.9 to 1, fade in, 0.3s)
- Badge unlock (scale pop: 0.95 → 1.05 → 1.0, 0.4s)
- Plant advancing a growth stage (fade crossfade between stages, 0.6s)
- Readiness score delta appearing after session summary (slide up + fade in, 0.3s)
- Correct answer feedback (brief green flash on card, 0.2s)

Do NOT animate:
- Page transitions (keep instant — unnecessary delay)
- Navigation items
- Loading states beyond a simple skeleton
- Hover states (use CSS transition-colors instead)

Framer Motion template for XP gain:
```tsx
<motion.span
  key={xp}
  initial={{ opacity: 0, y: 8 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3, ease: "easeOut" }}
>
  +{xpGained} XP
</motion.span>
```

---

## Screen-by-Screen Design Specs

### Dashboard (Home)
Layout: 2-column on desktop (left: study actions, right: stats), 1-column on mobile
Left column:
- Daily goal progress bar (large, prominent)
- Today's 3 challenges (card list)
- Quick subject buttons: "Study AP Stats / AP Bio / AP Calc"
Right column:
- Streak counter (large number, flame icon from Lucide)
- Readiness Score per subject (3 compact score cards)
- Recent session summary (last session's score and delta)

Feel: Notion-like cleanliness. The dashboard should communicate "here is exactly what to do today" without being overwhelming.

### Study Session
Layout: single column, centered, max-w-2xl
Top: subject tag + topic tag + difficulty badge + timer (if timed mode)
Middle: question text (text-lg, generous top/bottom margin)
For MCQ: 4 stacked answer buttons, full width
For FRQ: large textarea with word count indicator
Bottom: "Submit Answer" CTA button (full width, primary pill)
Post-answer: card flips state to show feedback inline (no page navigation)
- Correct: card border turns --correct green, feedback text appears below
- Incorrect: card border turns --incorrect rose, correct answer revealed, explanation shown

Session summary screen (after completing a set):
- Full screen takeover (modal or dedicated page)
- Large score display (e.g., "14 / 20")
- XP earned animation
- Readiness delta ("▲ +4 Readiness")
- Any badges unlocked (shown as unlocked badge cards)
- Two buttons: "Study Again" (primary, larger) and "Go Home" (ghost)

### Garden Tab
Layout: centered garden grid on a --background-garden background
Garden grid: responsive grid of plot tiles (3 columns mobile, 5 columns desktop)
Each plot tile:
- Empty: dashed border, --background-garden fill, small + icon centered
- Planted: plant SVG icon centered, 5-dot growth stage indicator at bottom
- Dormant: desaturated plant SVG, small moon icon overlay (top right)
- Flourishing: subtle golden glow border (1px solid --accent with low opacity box shadow)

Seed Shop (side panel or modal):
- Opens from a "Shop" button in the top right of the garden
- Grid of available seeds: name, rarity badge, Shard cost
- "Plant" CTA per seed if user has empty plots and enough Shards
- Rarity visual hierarchy: Common (gray badge), Uncommon (green), Rare (blue), Legendary (gold)

Shard balance: always visible in the garden header (coin icon + number)
Items (Fertilizer, Revival Potion): shown as inventory badges below the Shard balance

### Profile / Scholar Card
Layout: left = card (avatar placeholder, level, streak, subject readiness scores), right = achievements grid
Scholar Card:
- Clean card with subtle border
- Avatar: initials-based (Clerk provides this), circular
- Level badge: "Lv. 12" in accent gold
- Streak: flame icon + number
- Readiness scores per subject: compact progress bars

Achievements grid:
- 2x5 grid of badge cards
- Unlocked: full color, badge name visible
- Locked: grayscale silhouette, name hidden (shows "???" on hover)
- Badge unlock date shown in small text below unlocked badges

Topic Heatmap:
- Grid of topic nodes per subject (tabs to switch subjects)
- Node states: Not started (empty border), In Progress (partial fill), Mastered (full primary green)
- Node color intensity reflects accuracy: red < 50%, amber 50-75%, green > 75%
- Clicking a node shows a mini popover: accuracy %, attempts, "Study this topic" button

---

## Garden Plant Visual System

For MVP, use SVG icon-based plant representations. No custom illustration required.

Growth stages and recommended icon approach:

| Stage | Icon Source | Visual |
|---|---|---|
| Seed | Lucide: circle-dot | Small dot, brown tint |
| Sprout | Lucide: sprout | Simple two-leaf sprout |
| Budding | Phosphor: flower-lotus | Closed bud shape |
| Flowering | Phosphor: flower | Open flower |
| Flourishing | Phosphor: plant | Full plant with glow |

Apply subject tints to plant icons:
- AP Stats plants: geometric/crystalline feel — use cool blue-gray tints
- AP Bio plants: lush tropical — use deeper greens
- AP Calc plants: fractal/branching — use purple tints

For post-MVP custom illustrations: hire from Contra.com or Fiverr.com.
Budget: ~$150–250 for a set of 20–30 plant illustrations in a consistent botanical style.
Brief to give the illustrator: "Minimal botanical line-art illustrations, clean SVG format, 
each plant in 5 growth stages, flat design with subtle shading, no outlines — 
inspired by scientific botanical illustration meets Monument Valley geometry."

---

## Monument Valley Influence — What to Borrow

Monument Valley's visual DNA to draw from:
- Impossible geometry that still feels logical and satisfying
- Pastel, desaturated colors — nothing neon or harsh
- Generous negative space — content floats rather than fills
- Isometric or slightly angled visual elements where appropriate

How this applies to Crescia specifically:
- The garden grid can use slightly isometric perspective on the plot tiles (CSS transform: rotateX(20deg))
- Achievement badge designs can use geometric, tessellating patterns as backgrounds
- Topic progress map can use connected node-and-path layout (like MV's level select screen)
- Loading states can use simple geometric animation (a rotating hexagon, not a spinning circle)

What NOT to import from Monument Valley:
- The color palette (too purple/pink for Crescia's botanical green identity)
- The surreal/impossible architecture (too complex to implement)
- Any narrative/character elements

---

## Communicating Design to Cursor

### The Best Workflow (in order of quality)

1. **Written spec (fastest, use for most components)**
   Give Cursor a component description following this template:
   ```
   Build a [ComponentName] component.
   Layout: [describe the layout — column/row, alignment, max-width]
   Colors: use CSS variables from globals.css (--primary, --accent, --border, etc.)
   Typography: [which text sizes and weights]
   States: [default, hover, active, disabled states]
   Interactions: [what happens on click, on correct answer, etc.]
   Animations: [any Framer Motion moments — be specific]
   shadcn/ui components to use: [list relevant ones]
   Do NOT add: [anything you want to explicitly exclude]
   ```

2. **Screenshot reference + Cursor (for complex layouts)**
   - Take a screenshot from Dribbble, Mobbin, or Screenlane
   - Attach it to Cursor chat (drag into the chat input)
   - Say: "Build something with this layout but using Crescia's color system and shadcn/ui components"

3. **v0.dev first, then Cursor (for UI-heavy components)**
   - Go to v0.dev, describe the component
   - Iterate until it looks right (free tier allows several generations)
   - Copy the output code into your project
   - Use Cursor to replace colors, fonts, and logic with Crescia's system

4. **Figma (for post-MVP, not needed now)**
   If you decide to use Figma later:
   - Use the shadcncraft plugin (shadcncraft.com) to import your shadcn theme directly
   - This gives you Figma components that match your code 1:1
   - Export frames as specs and paste into Cursor for implementation
   - Not worth setting up for MVP — use v0.dev instead

### What Cursor Does Well (trust it)
- Tailwind utility class composition for layouts
- shadcn/ui component integration
- Responsive grid/flex layouts
- TypeScript props interfaces
- Recharts configuration

### Where to Review Cursor's Output Carefully
- Color choices — it will default to shadcn defaults, not your CSS variables. Always check.
- Animation timing — it tends to over-animate. Pull back durations to 0.2-0.3s.
- Font weights — it tends to use font-bold where you want font-semibold.
- Spacing — it sometimes uses cramped padding. Push to p-5 or p-6 for cards.

---

## Design Resources

### Inspiration & References
- Dribbble.com — search "study app dashboard," "garden game UI," "minimal dashboard"
- Mobbin.com — real app screen recordings, searchable by UI pattern
- Screenlane.com — curated web and mobile UI screenshots
- Layers.to — high quality UI design showcases

### Component Generation
- v0.dev — describe components, get React + Tailwind output instantly
- shadcn/ui docs — ui.shadcn.com/docs — always check here before building custom
- tweakcn.com — visual shadcn theme editor, good for fine-tuning colors

### Icons
- Lucide (already installed) — lucide.dev — use for UI icons
- Phosphor Icons — phosphoricons.com — better botanical/nature set for garden
  Install: npm install @phosphor-icons/react
- Hugeicons — included with Luma preset — hugeicons.com

### Plant Illustrations (MVP placeholders → production assets)
- OpenMoji — openmoji.org — free open source emoji SVGs including all plant types
- Noun Project — thenounproject.com — botanical line art (some free)
- For production: Contra.com or Fiverr.com — commission a botanical illustration set

### Fonts
- Geist: included with Next.js, no setup needed (used by Luma preset)
- Plus Jakarta Sans: warmer alternative if Geist feels too technical
  Add via: npm install @next/font (then import from next/font/google)

### Color Tools
- oklch.com — convert hex to oklch (Tailwind v4 uses oklch)
- coolors.co — generate palette variations from your base green
- shadcn theme generator: ui.shadcn.com/themes

---

## Dark Mode

Implement dark mode in Phase 2, not MVP. shadcn/ui supports it natively via CSS variables.
When you do implement it, the garden tab should use a deep forest-night palette:
- Background: #1A2420 (deep dark green)
- Plot tiles: #243028
- Plants: same SVGs but with slightly increased brightness

---

## What "Not Looking AI" Means for Crescia

The common AI-generated UI mistakes to avoid:
- Gradient hero sections with purple-to-blue — do not use gradients anywhere in MVP
- Glass-morphism cards (backdrop-blur with transparency) — avoid, it reads as lazy
- Excessive use of emoji in UI copy — zero emoji in interface elements
- Cards with too many stats crammed in — one primary number per card
- Generic sans-serif with no personality — Geist is distinctive enough
- Blue as the primary color — your sage green is the differentiator
- Centered, uppercase, letter-spaced section headers — use left-aligned, normal case
- "Here's what makes us different" feature grids with icon + title + two-line description — avoid on the dashboard

What to do instead:
- One thing per card. One action per screen.
- Text-heavy where text earns its place. Silent where it doesn't.
- Let the garden be the visual centerpiece — not the chrome around it.
