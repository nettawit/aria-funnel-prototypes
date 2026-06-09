# Wix Design System (WDS)

The foundation token system used across Wix's product environments. Ships three themes:

- **Harmony** (`tokens-harmony.css`) — the modern light surface theme. Default for new work.
- **Studio 2.0** (`tokens-studio-2.css`) — dark surface theme used in the OD Editor; inverts surface roles so dark canvases hold light text.
- **Classic** (`tokens-classic.css`) — the legacy WDS theme preserved for older surfaces and compatibility.

> Quick start: link a theme tokens file (`tokens-harmony.css`, `tokens-studio-2.css`, or `tokens-classic.css`) FIRST, then `colors_and_type.css`, in any HTML you build. Reference WDS tokens (e.g. `var(--wds-color-fill-surface-default)`, `var(--wds-font-family-default)`) — never raw hex or px. Theme is selected once per file by which `tokens-*.css` you link.
>
> ```html
> <link rel="stylesheet" href="tokens-harmony.css">
> <link rel="stylesheet" href="colors_and_type.css">
> ```

---

## How tokens are organized

WDS tokens follow a **3-tier model**:

1. **Foundation tokens** — raw, brand-agnostic values: `--wds-color-blue-100`, `--wds-space-400`, `--wds-font-size-500`. Don't reference these directly in product UI.
2. **Semantic tokens** — meaning-bound aliases: `--wds-color-fill-standard-primary`, `--wds-color-text-standard-primary`, `--wds-space-padding-vertical-medium`. **Use these everywhere.**
3. **Component tokens** — scoped to a single component: `--wds-tooltip-background-fill`, `--wds-toggle-switch-knob-size-medium`. Internal — only override when extending a component.

Each token is namespaced `--wds-{category}-{role}-{variant}-{state}`. A button's resting fill is `--wds-color-fill-standard-primary`; on hover, `--wds-color-fill-standard-primary-hover`.

## Surface hierarchy

The Studio 2.0 theme maps surface tokens to a stack of near-black neutrals so cards and modals layer cleanly:

| Semantic token | Foundation alias | Use |
|---|---|---|
| `--wds-color-fill-surface-sunken` | `--wds-color-black-750` | Page background, deepest layer |
| `--wds-color-fill-surface-default` | `--wds-color-white` | Default app surface |
| `--wds-color-fill-surface-raised` | `--wds-color-white` | Cards, panels |
| `--wds-color-fill-surface-modal` | `--wds-color-white` | Modal sheets |
| `--wds-color-fill-surface-overlay` | `--wds-color-white` | Popovers, tooltips |
| `--wds-color-fill-surface-overlay-dark` | `--wds-color-black-100` | Inverted overlay (light on dark) |

The "white"/"black" foundation names are inverted on purpose: in this theme `--wds-color-white` resolves to a near-black surface and `--wds-color-black-100` resolves to white. This lets the same semantic tokens drive both light and dark themes — only the foundation values flip.

---

## Visual Foundations

### Color

**Neutrals** drive 80%+ of the UI. The black ramp (`--wds-color-black-100` → `--wds-color-black-750`) goes from white text down through mid-grays to near-black surfaces. The blue ramp is the **primary brand & focus** color — `--wds-color-blue-100` is the default action color and `--wds-color-blue-300` is the focus ring.

**Semantic intents** map to colors:

- **Standard** — Blue. Primary actions, focus, links.
- **Premium** — Blue (warmer). Upsell, premium features.
- **Destructive** — Red. Delete, irreversible.
- **Success** — Green. Confirmations, healthy states.
- **Warning** — Yellow. Caution, soft alerts.
- **Urgent** — Orange. High-priority alerts.
- **AI** — Iris. AI-generated content and actions.

Use intents through fill / border / text token families, never raw hex.

### Typography

The system runs on **Madefor** (Wix's proprietary family). The default family is `Madefor`; the display family is `Madefor Display`, exposed through:

- `--wds-font-family-display` for `heading-1`, `heading-2`
- `--wds-font-family-default` for body, labels, smaller headings

Four named weights are exposed as tokens: `--wds-font-weight-regular` (400), `--wds-font-weight-medium` (500), `--wds-font-weight-semi-bold` (600), `--wds-font-weight-bold` (600). Web fallback chain: Helvetica Neue → Helvetica → Arial → CJK fallbacks → system sans.

**Heading scale** uses six semantic sizes, but only four distinct values — weight is the differentiator on overlapping rungs:

| Token | Resolved size | Weight |
|---|---|---|
| `--wds-font-size-heading-1` | `--wds-font-size-900` (32) | regular |
| `--wds-font-size-heading-2` | `--wds-font-size-800` (24) | medium |
| `--wds-font-size-heading-3` | `--wds-font-size-500` (16) | bold |
| `--wds-font-size-heading-4` | `--wds-font-size-500` (16) | bold |
| `--wds-font-size-heading-5` | `--wds-font-size-100` (10) | bold |
| `--wds-font-size-heading-6` | `--wds-font-size-200` (12) | regular |

**Body scale**: `--wds-font-size-body-medium` (16), `-small` (14), `-tiny` (12), `-extra-tiny` (10).

Headings 1–3 use a tight `--wds-font-letter-spacing-heading-1/2/3` track; small uppercase headings (5–6) use the wider `--wds-font-letter-spacing-heading-5/6`.

**Typography utility classes** (in `typography.css`, auto-imported by `colors_and_type.css`) cover every body / heading / caption combo without re-binding tokens by hand:

- **Body** — `.text-{extra-tiny|tiny|small|medium}-{thin|normal|bold}`. `thin` = regular (400), `normal` = medium (500), `bold` = bold (600). Use these for any product copy that isn't an `<h1>`–`<h6>`.
- **Headings, numbered** — `.heading-h1` … `.heading-h6`. Same sizes/weights as the `h1`–`h6` element styles, but applicable to any element.
- **Headings, tee-shirt** — `.heading-{xl|l|m|s|t|xt}`. Alternate ramp aliasing the same six heading rungs — reach for it when the semantic name (`heading-l` for a section title) reads better than the numbered name.
- **Caption** — `.caption-1` (extra-tiny + bold) for legal-style micro-copy.

All values resolve from WDS semantic tokens; link a `tokens-*.css` theme file before `colors_and_type.css`.

### Space

Exposed as `--wds-space-*` tokens. Notable rungs include `--wds-space-0`, `-100`, `-200`, `-300`, `-400`, `-500`, `-600`, with role-named padding tokens (`--wds-space-padding-vertical-medium`, `--wds-space-padding-horizontal-small`, etc.) that components should prefer over the raw scale. Top of the scale is `--wds-space-2400`.

### Radius

Foundation scale: `--wds-border-radius-0` (0) → `-100` (2) → `-200` (4) → `-300` (6) → `-400` (8) → `-500` (10) → `-600` (12) → `-1200` (24) → `-full` (1000, pill). Surface defaults: cards/raised/modal use `--wds-border-radius-surface-default` (= `-600`), overlays use `--wds-border-radius-surface-overlay` (= `-400`).

### Shadow

Four elevation levels (`--wds-shadow-100` through `--wds-shadow-400`), plus surface-specific shadows for raised, overlay, and modal. In Studio 2.0 these use **white-with-low-opacity** foundations (`--wds-color-white-transparent-*`) instead of Harmony's black drop shadows — because shadow on dark must come from rim-light, not depth.

There's also a complete **inner-shadow** family (`--wds-inner-shadow-*`) for inset/pressed states and beveled controls.

### Border

Three widths: `--wds-border-width-100` (1px, default), `--wds-border-width-150` (1.5px), `--wds-border-width-200` (2px). Border colors follow the same semantic system as fills (`--wds-color-border-standard-primary`, `--wds-color-border-destructive-secondary`, etc.). On Studio 2.0's dark surfaces, default borders resolve through the dark border family backed by mid-gray foundations on the black ramp.

---

## Iconography

WDS uses a custom in-house icon set, **not** an external library. Icons ship as SVGs in **two sizes**:

- **Default** — 24×24 (toolbar/general use), unsuffixed file names (e.g. `Add.svg`)
- **Small** — 18×18, `*Small.svg` suffix (e.g. `AddSmall.svg`)

Stroke icons stay monochrome and inherit `currentColor`. Filled glyphs are reserved for status indicators (success / warning / urgent / destructive). Always pair an icon with a text label or `aria-label` — icon-only buttons need accessible names.

Icons default to `--wds-color-text-standard-primary` (which resolves correctly in every theme). Subtle/secondary icons step down to `--wds-color-text-standard-secondary`. Disabled icons drop to `--wds-color-text-disabled`.

---

## Files in this system

- `tokens-harmony.css`, `tokens-studio-2.css`, `tokens-classic.css` — per-theme WDS token sets. Each file defines the full token surface (colors, spacing, type, radii, shadows) for one theme. Link exactly ONE in each HTML file. Drop additional `tokens-<name>.css` files into the kit root to add more themes — the skill auto-detects them.
- `tokens.css` — backward-compat alias (resolves to Studio 2.0) so existing previews keep working. Don't link in new work — pick a theme tokens file directly.
- `colors_and_type.css` — minimal foundation: loads Madefor, sets base `body` styling, exposes type utility classes. Does NOT import a tokens file — link a theme before it.
- `WDS-UI-Kit.html` — interactive showcase of the system: buttons, inputs, cards, modals, toggles, tabs, badges, tooltips, banners.
- `Type.html`, `Colors.html`, `Spacing.html`, `Components.html` — design-system review cards (one per foundation/category).
- `SKILL.md` — instructions Claude reads when designing with this system.
