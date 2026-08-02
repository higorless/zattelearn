---
name: ZetteLearn
description: A personal study OS for finishing what you start.
colors:
  canvas: "oklch(0.145 0 0)"
  surface: "oklch(0.205 0 0)"
  surface-raised: "oklch(0.269 0 0)"
  ink: "oklch(0.985 0 0)"
  ink-secondary: "oklch(0.708 0 0)"
  ink-tertiary: "oklch(0.556 0 0)"
  border-subtle: "oklch(1 0 0 / 10%)"
  border-strong: "oklch(1 0 0 / 15%)"
  nav-accent: "oklch(0.488 0.243 264.376)"
  error: "oklch(0.704 0.191 22.216)"
typography:
  display:
    fontFamily: "'Geist Mono Variable', monospace"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.01em"
  title:
    fontFamily: "'Geist Mono Variable', monospace"
    fontSize: "1rem"
    fontWeight: 500
    lineHeight: 1.4
  body:
    fontFamily: "'Geist Mono Variable', monospace"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "'Geist Mono Variable', monospace"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.33
    letterSpacing: "0.02em"
rounded:
  sm: "0.375rem"
  md: "0.5rem"
  lg: "0.625rem"
  xl: "0.875rem"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  2xl: "32px"
components:
  button-default:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.canvas}"
    rounded: "{rounded.lg}"
    padding: "0 10px"
    height: "32px"
  button-default-hover:
    backgroundColor: "oklch(0.922 0 0)"
    textColor: "{colors.canvas}"
    rounded: "{rounded.lg}"
    padding: "0 10px"
    height: "32px"
  button-secondary:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "0 10px"
    height: "32px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "0 10px"
    height: "32px"
  button-ghost-hover:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "0 10px"
    height: "32px"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "0 10px"
    height: "32px"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.xl}"
    padding: "16px"
  badge-secondary:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.ink}"
    rounded: "{rounded.full}"
    padding: "2px 8px"
  badge-outline:
    backgroundColor: "transparent"
    textColor: "{colors.ink-secondary}"
    rounded: "{rounded.full}"
    padding: "2px 8px"
---

# Design System: ZetteLearn

## Overview

**Creative North Star: "The Focused Terminal"**

ZetteLearn's visual language is built on a single principle: the interface should disappear into the work. Inspired by Vercel's monochromatic design system and the precision of a well-configured code editor, the aesthetic is dark-first, achromatic, and resolved. Geist Variable — Vercel's own typeface — ties the two systems together structurally. Every surface, spacing decision, and color choice points the same direction: get out of the way, let the user study.

The palette is pure achromatic. No warm ink, no cool blue-gray — just luminance steps between canvas and sky. Color enters the system only through two named exceptions: the subject accent (a per-subject configurable hex applied to card left-borders and badges) and the navigation active indicator (a precise blue-purple used exclusively on the active sidebar item in dark mode). Everything else is gray-scale. This scarcity is the system's sharpest feature.

The spatial rhythm is generous and task-oriented. The sidebar collapses to icon-only (56px) and expands to label width (224px); the content area takes the remaining viewport. Framer Motion handles transitions — layout animations, page crossfades, nav indicator morphs — but never decoratively. Motion communicates state changes; it doesn't perform.

**Key Characteristics:**
- Dark mode is the primary mode; light mode exists but dark is the designed experience
- Fully achromatic except for subject-color accents and the nav active indicator
- Tonal layering only — no box-shadows at rest; depth is communicated via luminance steps between surface levels
- Geist Variable as the single unified typeface across all roles
- Motion is functional: layout, entry/exit, state transitions — never idle

## Colors

The palette is entirely neutral (zero chroma) in both modes. Depth is expressed as luminance steps between three surfaces.

### Primary

- **Pale Ink** (`oklch(0.985 0 0)`, ≈ #fafafa): Primary text on dark surfaces. Used for headings, body copy, and interactive foregrounds in dark mode.
- **Quiet Ash** (`oklch(0.922 0 0)`, ≈ #eaeaea): Light-mode primary interactive (buttons, active states). Also appears as the light-mode sidebar and card-on-card foreground.

### Neutral

- **Terminal Black** (`oklch(0.145 0 0)`, ≈ #181818): The canvas — the deepest surface. Page background in dark mode.
- **Graphite** (`oklch(0.205 0 0)`, ≈ #242424): The card and sidebar surface in dark mode. One luminance step above the canvas.
- **Studio Gray** (`oklch(0.269 0 0)`, ≈ #2e2e2e): Muted and secondary surface backgrounds. The raised layer — used for column headers, muted backgrounds, and secondary button fills.
- **Chalk** (`oklch(0.708 0 0)`, ≈ #a3a3a3): Muted foreground text. Descriptions, subtitles, placeholder states.
- **Low Signal** (`oklch(0.556 0 0)`, ≈ #737373): Third-level text. Timestamps, helper text, very quiet meta labels.
- **Ghost Wire** (`oklch(1 0 0 / 10%)`): Hairline borders and dividers in dark mode. White at 10% opacity — renders as a luminance edge without color.
- **Ghost Wire Strong** (`oklch(1 0 0 / 15%)`): Input and form field stroke in dark mode.

### Tertiary

- **Nav Indigo** (`oklch(0.488 0.243 264.376)`, ≈ #5865d4): The only hued color used in the system (dark mode only). Applied exclusively to the active navigation item's sidebar primary. Its rarity signals selection with clarity no neutral can match.

### Named Rules

**The Subject Accent Rule.** Subject colors are user-configured hex values assigned per-course. They appear as a 3px left border on kanban cards and calendar entries, and as badge border/text color. They are always inline-styled — never part of the design token system. Don't introduce a fixed subject-color palette; the user owns those values.

**The One Chromatic Rule.** Aside from subject accents, only one hued token exists: `nav-accent` (Nav Indigo). It lives exclusively on the sidebar active indicator in dark mode. Any new use of color must first justify why it cannot be expressed as a neutral.

## Typography

**Display / Body Font:** Geist Mono Variable (with monospace fallback)

**Character:** Geist Mono Variable is the monospace sibling of Geist — same Vercel foundry, same geometric DNA, but every character at fixed width. The switch from proportional to monospace commits fully to the "Focused Terminal" north star: the interface now reads like a precision instrument, not a document. At variable weight the full hierarchy axis is preserved. The uniform character width benefits tabular data (dates, counts, session times) and reinforces the developer tool identity without a costume — this is a developer's study OS.

### Hierarchy

- **Display** (600 weight, 1.5rem/24px, line-height 1.25, -0.01em tracking): Section headings — one per page, paired with a Lucide icon at 20px. Appears in the page title row of each feature.
- **Title** (500 weight, 1rem/16px, line-height 1.4): Card titles, column headers, list item primaries. The main readable label.
- **Body** (400 weight, 0.875rem/14px, line-height 1.5): Descriptions, note content, card secondary text. Line-clamped at 2–4 lines in list views.
- **Label** (500 weight, 0.75rem/12px, line-height 1.33, +0.02em tracking): Badges, metadata chips, section caps, helper text. Frequently uppercased (`tracking-wide uppercase`) for categorical labels.

### Named Rules

**The Single Family Rule.** Geist Mono Variable is the only typeface in the system. Do not introduce a serif, a display face, or a proportional sans alongside it. Weight variation (400/500/600) and size variation carry all hierarchy.

## Layout

The app shell is a full-height flex row: a collapsible sidebar on the left, a main content area on the right. The sidebar collapses to icon-only (56px, `w-14`) and expands to label width (224px, `w-56`); width transitions over 200ms ease-in-out via Framer Motion. The content area is always `flex-1 overflow-hidden`.

Within each feature page, the internal layout follows: a top row containing a display heading and optional controls (`flex items-center justify-between`), then a full-flex content zone. Horizontal overflow is handled per-surface: kanban uses `overflow-x-auto`, calendar uses `overflow-hidden` with internal flex.

The 4px unit is the base spatial atom. Common increments: 4 (xs), 8 (sm), 12 (md), 16 (lg), 24 (xl). Page padding is 24px (`p-6`). Column gutters are 12–16px. Card internal padding is 12–16px depending on density (standard `p-3`/`p-4`).

Kanban columns are 288px wide (`w-72`), fixed, scrollable horizontally. Calendar days are `flex-1`, equal-width, overflow-hidden vertically. Subjects and Zettelkasten use responsive CSS grid: 1 column → 2 (`sm:grid-cols-2`) → 3 (`lg:grid-cols-3`).

## Elevation & Depth

This system is **shadow-free by design**. Depth is communicated through three tonal layers:

1. **Canvas** (`oklch(0.145 0 0)`) — the page background; lowest level
2. **Surface** (`oklch(0.205 0 0)`) — cards, sidebar, modals; one luminance step up
3. **Surface Raised** (`oklch(0.269 0 0)`) — column headers, muted zones, secondary fills; the highest passive layer

The only exception: dragging. When a kanban card or calendar card is actively being dragged, it receives `shadow-2xl` and a `ring-2 ring-primary/30` outline to communicate that it has left the plane. This is a functional state signal, not a decorative shadow. Shadow is absent at rest, present only at elevation.

**The Tonal Stack Rule.** Do not use `box-shadow` on elements at rest. If a surface needs to feel elevated, promote it one step up the luminance scale (`surface` → `surface-raised`) or add a `ring-1 ring-foreground/10` outline. Shadows are reserved for drag state only.

## Shapes

The system uses a unified, gently curved corner language derived from a 10px base radius (`--radius: 0.625rem`). All radius values are multiples of this base:

- **Buttons, column headers, drop zones** — `rounded-lg` (10px): The default interactive shape. Approachable but not pill-like.
- **Cards** — `rounded-xl` (14px): Slightly softer than buttons; cards are containers, not actions.
- **Badges and chips** — `rounded-full` (9999px): Pill shape signals categorization.
- **Smaller variant buttons (xs, sm)** — `rounded-md` (8px): Tightened in compact contexts.

No sharp (0px) corners appear anywhere in the system. No custom clip-paths or skewed geometry. The form language is calm and regular — consistent enough to be invisible, soft enough to feel considered.

Cards carry a `ring-1 ring-foreground/10` outline (Ghost Wire) instead of a border — a luminance trace rather than a drawn line.

## Components

### Buttons

Precise and flat. No shadows, no gradients. State expressed through background luminance shift only.

- **Shape:** Rounded corners (10px, `rounded-lg`); smaller sizes step down to 8px
- **Default (Primary):** Near-white fill (`oklch(0.985 0 0)`) on canvas, near-black text. Hover: background dims to `oklch(0.922 0 0)`. Height 32px, padding `0 10px`.
- **Secondary:** Studio Gray fill (`oklch(0.269 0 0)`), Pale Ink text. Hover: slight lighten via `color-mix(in oklch, secondary, foreground 5%)`.
- **Ghost:** Transparent background; Pale Ink text. Hover: Studio Gray background. Used throughout nav and inline controls.
- **Outline:** Transparent background with Ghost Wire border; Pale Ink text. Hover: Graphite background. Used for navigation controls (calendar week navigation).
- **Destructive:** Error red at 10–20% opacity fill; error red text. No filled red buttons.
- **Focus:** `ring-3 ring-ring/50` with border shift to `ring` color — a luminance halo, never a colored glow.
- **Disabled:** 50% opacity, pointer-events-none.

### Cards / Containers

- **Corner Style:** Gently curved (14px, `rounded-xl`)
- **Background:** Graphite (`oklch(0.205 0 0)`) in dark mode; white in light
- **Border:** `ring-1 ring-foreground/10` — a trace outline, not a drawn border
- **Shadow:** None at rest. `shadow-2xl + ring-2 ring-primary/30` during drag only.
- **Internal Padding:** 12–16px (`p-3`/`p-4`); 8–12px in compact calendar card context
- **Hover:** `transition-shadow hover:shadow-md` on subject cards — an exception to the no-shadow rule for affordance on clickable cards in non-drag contexts

### Badges / Chips

- **Secondary variant:** Studio Gray fill, Pale Ink text, pill shape. Used for card counts in kanban column headers, topic labels.
- **Outline variant:** Transparent fill, Ghost Wire border, Chalk or subject-accent text. Used for subject tags and status indicators on objectives.
- **Subject-accent variant:** Outline with `borderColor` and `color` set inline to the subject's hex. The only badge that carries a hue.

### Navigation (Sidebar)

- **Shell:** Graphite background (`oklch(0.205 0 0)`), Ghost Wire border-right. Collapses to 56px / expands to 224px.
- **Nav item (default):** Ghost button — transparent fill, Pale Ink icon and label text.
- **Nav item (active):** Secondary button with `layoutId="nav-active"` Framer Motion overlay — the active background morphs between nav items as a shared layout animation. In dark mode, the sidebar primary token (`nav-accent`, Nav Indigo) colors this indicator.
- **Label visibility:** Labels animate in/out (`opacity`, `x`) on sidebar expand/collapse. Icons always visible.

### Kanban Card (Signature Component)

The kanban card is the system's most distinctive component. It is a Card container with a 3px colored left border (subject accent), a grip handle (GripVertical icon at 16px), a title line, optional description (line-clamped at 2), and subject/topic badge row.

- **Left border:** `border-l-[3px]` in the subject's configured color — the primary visual entry point for the subject-accent system.
- **Drag state:** `shadow-2xl + rotate-2 + ring-2 ring-primary/40` on the drag overlay; the original card drops to 40% opacity.
- **Session trigger:** A ghost-style "Iniciar sessão" button (Clock icon + label) hidden by default, revealed on card hover via `opacity-0 group-hover:opacity-100`.

## Do's and Don'ts

### Do:
- **Do** use three tonal layers (canvas → surface → surface-raised) to express depth without shadow.
- **Do** use `ring-1 ring-foreground/10` on cards instead of a hard border.
- **Do** reserve `shadow-2xl` for drag states only — it must always signal active elevation, never decoration.
- **Do** apply the subject accent color exclusively via inline style (`borderColor`, `color`) — never through a CSS token or Tailwind class.
- **Do** use Framer Motion `layoutId` for the nav active indicator so it morphs smoothly between items.
- **Do** let badge pills (`rounded-full`) carry categorical data (subjects, topics, status, counts); body text carries descriptive content.
- **Do** keep label text at `0.75rem / 500 / +0.02em tracking` — never use bold labels; use tracking and weight, not size, for small-scale hierarchy.

### Don't:
- **Don't** introduce a second typeface — not for code, headings, or display use.
- **Don't** add a hued color to the token system without routing through The One Chromatic Rule. Subject accents are user data, not tokens.
- **Don't** use `box-shadow` on elements at rest. The system communicates depth through luminance, not shadow.
- **Don't** add decorative or idle animations. Motion in this system is functional — it maps to state transitions. Looping animations, loading spinners beyond the skeleton, or ambient motion violate the Terminal aesthetic.
- **Don't** use the `nav-accent` (Nav Indigo) for anything other than the sidebar active indicator. Its singularity is its signal.
- **Don't** introduce warm neutrals, sepia tones, or off-white backgrounds. The neutrals are achromatic — zero chroma on all non-accent tokens.
