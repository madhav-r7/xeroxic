---
name: Editorial Linen & Ink
colors:
  surface: '#f9f9f7'
  surface-dim: '#dadad8'
  surface-bright: '#f9f9f7'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f4f2'
  surface-container: '#eeeeec'
  surface-container-high: '#e8e8e6'
  surface-container-highest: '#e2e3e1'
  on-surface: '#1a1c1b'
  on-surface-variant: '#4b454c'
  inverse-surface: '#2f3130'
  inverse-on-surface: '#f1f1ef'
  outline: '#7d747d'
  outline-variant: '#cec3cc'
  surface-tint: '#6f5578'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#281231'
  on-primary-container: '#977a9f'
  inverse-primary: '#dcbce4'
  secondary: '#675c58'
  on-secondary: '#ffffff'
  secondary-container: '#efdfda'
  on-secondary-container: '#6d625e'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#211827'
  on-tertiary-container: '#8c7f92'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#f8d8ff'
  primary-fixed-dim: '#dcbce4'
  on-primary-fixed: '#281231'
  on-primary-fixed-variant: '#563e5f'
  secondary-fixed: '#efdfda'
  secondary-fixed-dim: '#d2c3be'
  on-secondary-fixed: '#221a17'
  on-secondary-fixed-variant: '#4f4541'
  tertiary-fixed: '#edddf2'
  tertiary-fixed-dim: '#d0c2d6'
  on-tertiary-fixed: '#211827'
  on-tertiary-fixed-variant: '#4d4354'
  background: '#f9f9f7'
  on-background: '#1a1c1b'
  surface-variant: '#e2e3e1'
  aubergine-ink: '#1b0624'
  espresso: '#160f0c'
  warm-ash: '#766a7c'
  graphite: '#444444'
  stone: '#898683'
  paper-white: '#ffffff'
  linen: '#f7f7f5'
  bone: '#edece7'
  status-queued: '#d83b01'
  status-printing: '#0078d4'
  status-ready: '#107c41'
  status-completed: '#605e5c'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 44px
    fontWeight: '600'
    lineHeight: 52px
    letterSpacing: -0.03em
  headline-xl-mobile:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 38px
    letterSpacing: -0.025em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '500'
    lineHeight: 38px
    letterSpacing: -0.025em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '500'
    lineHeight: 26px
    letterSpacing: -0.015em
  subhead-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '500'
    lineHeight: 26px
  subhead-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '500'
    lineHeight: 22px
  body-lg:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
  label-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.04em
  code-md:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

# Xeroxic — Campus Digital Xerox & Print Management System
> Editorial precision, warm linen tactile paper aesthetic, and effortless print workflow.

**Theme:** light

Xeroxic brings the warmth and high craft of an editorial paper studio to the modern university printing experience. Drawing inspiration from Duna's quiet, monochromatic editorial canvas, Xeroxic utilizes a warm linen background (#F7F7F5), paper-white elevated surfaces (#FFFFFF), deep aubergine-black ink typography (#1B0624), espresso tactile CTA buttons (#160F0C) with 999px full pill curvature, hairline 1px borders (#E5E5E0), and intentional, restrained status indicators (amber for queued, sapphire for printing, emerald for ready-for-pickup).

## Tokens — Colors

| Name | Value | Token | Role |
|------|-------|-------|------|
| Aubergine Ink | `#1b0624` | `--color-aubergine-ink` | Primary text, heading typography, brand character |
| Espresso | `#160f0c` | `--color-espresso` | Primary action fills, primary CTAs, active selection states |
| Warm Ash | `#766a7c` | `--color-warm-ash` | Muted secondary text, quiet metadata, subtle icons |
| Graphite | `#444444` | `--color-graphite` | Body text variant, input borders, standard iconography |
| Stone | `#898683` | `--color-stone` | Tertiary labels, dividers, inactive states |
| Paper White | `#ffffff` | `--color-paper-white` | Primary card surfaces, container backgrounds, modals |
| Linen Canvas | `#f7f7f5` | `--color-linen` | Warm paper-like canvas background |
| Bone Panel | `#edece7` | `--color-bone` | Elevated secondary panels, table headers, hover tints |
| Status Queued | `#d83b01` | `--status-queued` | Warm amber/orange badge for submitted/waiting print jobs |
| Status Printing | `#0078d4` | `--status-printing` | Crisp royal blue for active printing on press |
| Status Ready | `#107c41` | `--status-ready` | Forest emerald green for orders waiting at Counter 1 or 2 |
| Status Completed | `#605e5c` | `--status-completed` | Neutral graphite gray for completed/archived jobs |

## Tokens — Typography

- **Primary Font Family:** `Inter`, `GT America`, system-ui, -apple-system, sans-serif
- **Display Heading:** `32px - 44px`, weight `500` / `600`, line-height `1.15`, letter-spacing `-0.03em`
- **Section Heading:** `20px - 24px`, weight `500`, line-height `1.3`, letter-spacing `-0.02em`
- **Card Title / Subhead:** `16px - 18px`, weight `500`, line-height `1.4`
- **Body Regular:** `14px - 15px`, weight `400`, line-height `1.55`
- **Metadata / Micro:** `12px - 13px`, weight `500`, uppercase or tabular figures
- **Monospace Tokens:** `13px - 14px`, `Consolas`, `Monaco`, monospace for Token IDs (e.g. `XER-2026-8841`)

## Tokens — Spacing & Shapes

- **Corner Radii:** Cards: `20px`, Badges & Buttons: `999px` (pill-shaped), Inputs: `12px`
- **Elevation / Shadow:** `rgba(0, 0, 0, 0.05) 0px 0px 0px 1px inset` (hairline crisp border)
- **Primary CTA Buttons:** `#160f0c` background, white text, `999px` full pill radius, soft hover transition.
