---
name: ApplyForge AI Design System
colors:
  primary: "#0F172A"
  primary-hover: "#1E293B"
  secondary: "#475569"
  muted: "#64748B"
  background: "#FAF9F5"
  surface: "#FFFFFF"
  surface-subtle: "#F4F3EE"
  surface-hover: "#EFECE6"
  border: "#E2E0D8"
  border-subtle: "#EAE8E0"
  accent: "#2563EB"
  accent-hover: "#1D4ED8"
  accent-subtle: "#EFF6FF"
  accent-border: "#BFDBFE"
  success: "#0D9488"
  success-subtle: "#F0FDF4"
  success-border: "#BBF7D0"
  warning: "#D97706"
  warning-subtle: "#FFFBEB"
  warning-border: "#FDE68A"
  danger: "#DC2626"
  danger-subtle: "#FEF2F2"
  danger-border: "#FECACA"
  text-primary: "#0F172A"
  text-secondary: "#475569"
  text-muted: "#94A3B8"
  text-inverse: "#FFFFFF"
typography:
  font-family-body: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
  font-family-heading: "'Outfit', 'Plus Jakarta Sans', Inter, sans-serif"
  font-family-mono: "'JetBrains Mono', 'Fira Code', monospace"
  heading-xl:
    fontSize: "36px"
    fontWeight: 700
    lineHeight: "1.2"
    letterSpacing: "-0.025em"
  heading-lg:
    fontSize: "28px"
    fontWeight: 600
    lineHeight: "1.25"
    letterSpacing: "-0.02em"
  heading-md:
    fontSize: "20px"
    fontWeight: 600
    lineHeight: "1.3"
    letterSpacing: "-0.015em"
  heading-sm:
    fontSize: "16px"
    fontWeight: 600
    lineHeight: "1.4"
  body-lg:
    fontSize: "18px"
    fontWeight: 400
    lineHeight: "1.6"
  body-md:
    fontSize: "15px"
    fontWeight: 400
    lineHeight: "1.55"
  body-sm:
    fontSize: "13px"
    fontWeight: 400
    lineHeight: "1.5"
  caption:
    fontSize: "12px"
    fontWeight: 500
    lineHeight: "1.4"
    letterSpacing: "0.02em"
shapes:
  rounded-xs: "3px"
  rounded-sm: "6px"
  rounded-md: "8px"
  rounded-lg: "12px"
  rounded-xl: "16px"
  rounded-full: "9999px"
shadows:
  subtle: "0 1px 2px 0 rgba(15, 23, 42, 0.05)"
  card: "0 1px 3px 0 rgba(15, 23, 42, 0.06), 0 1px 2px -1px rgba(15, 23, 42, 0.04)"
  dropdown: "0 4px 6px -1px rgba(15, 23, 42, 0.08), 0 2px 4px -2px rgba(15, 23, 42, 0.06)"
  modal: "0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.08)"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.text-inverse}"
    hoverBackground: "{colors.primary-hover}"
    rounded: "{shapes.rounded-md}"
  button-accent:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.text-inverse}"
    hoverBackground: "{colors.accent-hover}"
    rounded: "{shapes.rounded-md}"
  card-default:
    backgroundColor: "{colors.surface}"
    borderColor: "{colors.border}"
    rounded: "{shapes.rounded-lg}"
    shadow: "{shadows.card}"
---

## Overview
ApplyForge AI follows an **editorial minimalism meets modern productivity software** aesthetic. Designed for ambitious professionals, the interface evokes the quiet authority of high-end editorial typography combined with the surgical precision of modern developer tools.

Every element serves a functional purpose. We prioritize clear visual hierarchy, calm ivory/slate surfaces, and purposeful electric-blue accents over gratuitous gradients or neon decorations.

## Colors
- **Warm Ivory Background (`#FAF9F5`):** A warm, calm base that reduces eye strain compared to harsh `#FFFFFF` while retaining an editorial publication feel.
- **Pure Surface (`#FFFFFF`):** High-contrast crisp paper white for content cards, inputs, and resume paper canvases.
- **Subtle Surface (`#F4F3EE`):** Slightly deeper parchment tint for secondary toolbars, callouts, and disabled states.
- **Deep Slate/Ink (`#0F172A`):** The primary text and header color. Deep, assertive, and highly readable.
- **Muted Slate (`#475569` / `#64748B`):** Supporting body copy, metadata, timestamps, and secondary controls.
- **Cobalt Accent (`#2563EB`):** Restrained, deliberate accent color used for primary CTAs, active step indicators, and keyword match highlights.
- **Confidence Indicators:**
  - **Match / Confirmed (`#0D9488` Teal):** Indicates verified skills and matching qualifications without loud neon greens.
  - **Gap / Clarification (`#D97706` Warm Amber):** Contextual clarification opportunities and missing requirements.
  - **Critical (`#DC2626` Crimson):** Validation errors and parsing alerts.

## Typography
- **Headings (`Outfit`, `Plus Jakarta Sans`):** Clean geometric letterforms with tight tracking (`-0.025em`) giving the application an authoritative, modern tone.
- **Body (`Inter`):** Industry standard for data density, legibility across resolutions, and micro-copy clarity.
- **Monospace (`JetBrains Mono`):** Used for ATS keyword tags, file names, status codes, and model inference statistics.

## Layout
- **Container Structure:** Standard max-width `1280px` centered canvas with `16px` / `24px` gutter padding.
- **Grid Cadence:** Strict 4px/8px spatial cadence (4, 8, 12, 16, 20, 24, 32, 48, 64px).
- **Workspace Navigation:** Non-distracting top navigation bar with application branding, current job badge, local AI health indicator, and step navigation tabs.
- **Step-by-Step Focus:** Progressive disclosure workflow:
  1. Job Setup (Resume & JD Input)
  2. Analysis & Gap Clarification
  3. Tailored Resume Studio
  4. Company Research & Interview Prep
  5. Preparation Checklist & Progress

## Elevation & Depth
- **Zero Glassmorphism:** No artificial frosted blurs or low-contrast translucent overlays.
- **Tactile Paper Surfaces:** Flat surfaces defined by 1px solid hairline borders (`#E2E0D8`) and subtle ambient shadows (`rgba(15, 23, 42, 0.05)`).
- **Resume Canvas:** Rendered on an authentic virtual 8.5" x 11" white paper container with subtle elevation to simulate a real printed ATS-optimized document.

## Shapes
- **Refined Corner Radii:**
  - `rounded-sm` (`6px`): Badges, tooltips, tags, inline code snippets.
  - `rounded-md` (`8px`): Buttons, input fields, dropdown menus.
  - `rounded-lg` (`12px`): Workspace cards, dialog panels, question accordion boxes.
  - `rounded-full` (`9999px`): Progress pills, status chips, avatar badges.

## Components
- **Wordmark & Logo:** A geometric forge emblem (anvil-inspired clean polygon) paired with `ApplyForge` in semibold Outfit and a subtle pill badge `AI (Local)`.
- **Local AI Status Indicator:** A persistent pill in the navigation header displaying model readiness (`gemma3:4b (Local) · Ready`), active inference spinner, or setup instructions if offline.
- **Contextual Clarification Box:** Editorial callout with warm amber left border, explaining *why* answering this question improves ATS alignment.
- **ATS Resume Editor:** Split-screen or synchronized view with editable section controls on the left and live ATS-formatted preview on the right, with keyword match highlights and instant download buttons (PDF Print & Markdown/DOCX).
- **Interview Question Accordion:** Clean question list with categorized tags (Technical, JD-Specific, Behavioral, Company Research), structured STAR answers, and copy buttons.
- **Readiness Checklist Item:** Checkbox with priority badge (`High`, `Medium`, `Low`), reason it matters, concrete study task, and progress meter.

## Do's and Don'ts
- ✅ **DO** respect local privacy: prominently reassure the candidate that their resume never leaves their machine.
- ✅ **DO** provide immediate editable fallbacks if the local LLM produces imperfect text.
- ✅ **DO** provide clean print stylesheets (`@media print`) so users can export directly to crisp vector PDF using browser print.
- ❌ **DON'T** use dark mode with bright neon text; keep the warm editorial aesthetic clean and comfortable.
- ❌ **DON'T** invent candidate experience, metrics, or credentials not present in the original resume.
- ❌ **DON'T** display fake customer testimonials or fake statistics.
