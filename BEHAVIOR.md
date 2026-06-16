# Aria Home Screen Flow — Behavior Specification

Extracted from the live prototype at https://nettawit.github.io/aria-funnel/ (`index.html` → `round-14.jsx`).

---

## 1. Screens & States

The flow is driven by a single `screen` state variable:

| State | Description |
|---|---|
| `empty` | Initial state. No prompt text or attachments. Placeholder: *"Tell me about your site, or drop a URL to get started…"* |
| `text` | User has typed something or added assets/refs. Placeholder changes to: *"You can add here instructions to Aria…"* |
| `transitioning` | Brief intermediate state after pressing Continue (600ms–3200ms). Shows the prompt + a typewriter "Aria Touch" overlay explaining what Aria will do. |
| `ready` | Post-transition. Shows summarized prompt + headline based on completeness. Button becomes "Generate site". |
| `generating` | After Generate. Skeleton loading UI → screenshot fade-in over 10 seconds. |

### Modal/overlay states (`ov`)

| Value | Modal |
|---|---|
| `null` | No modal |
| `dropdown` | "Add" dropdown menu |
| `assets` | Add photos or files |
| `extract` | Extract content from file |
| `url` | Add a reference site |
| `import-url` | Import site from URL ("Create from URL") |

`Esc` closes any open modal.

---

## 2. Smart Field Detection

As the user types, three detectors run, producing a 3-bit completion key `[name][type][unique]`:

- **detectName** — quoted string (2–40 chars), "called/named/titled" + proper noun, "my business is called X", or a sentence starting with a proper noun + "is a/an/the"
- **detectType** — text contains any of 52 business keywords (store, shop, restaurant, salon, gym, agency, portfolio, course, nonprofit…)
- **detectUnique** — text is ≥ 18 words OR contains one of 39 "uniqueness" keywords (unique, handcrafted, artisan, sustainable, premium, our mission…)

### Headline states by completion key

| Key | Headline (L1) | Body highlights (blue) |
|---|---|---|
| `000` | "Hi! I'm Aria, your friendly design assistant." | name, business, makes it unique |
| `100` | "Got it — nice start." | business, makes it unique |
| `010` | "Got it — nice start." | name, makes it unique |
| `001` | "Got it — nice start." | name, business |
| `110` | "Almost there — one more thing." | makes it unique |
| `101` | "Almost there — one more thing." | business |
| `011` | "Almost there — one more thing." | called |
| `111` | "Perfect, I have everything I need." | "I'll start sketching your site — hit Generate when you're ready." |

The headline updates **1200ms after a keystroke pause** (not on every keystroke). `isTyping` clears after 1500ms of inactivity.

On the ready screen, if the key isn't `111`: headline becomes *"We're still missing a few things."* with the same body hints.

---

## 3. Main Textarea Behaviors

- **Auto URL extraction** — typing a URL followed by a space extracts it into a reference chip and trims it from the prompt. Same on paste.
- **State auto-transition** — first character typed moves `empty → text`; clearing all content (and no attachments) reverts `text → empty`.
- **Enter** (without Shift, no modal open) triggers Continue.
- **Focus while `ready`** — the "Aria Touch" text is merged back into the editable prompt, cursor placed at end (user can edit Aria's interpretation).
- **Placeholder crossfade** — 320ms fade when placeholder text changes.

URL regexes recognized: `https?://…`, `www.…`, and bare domains ending in `.com/.io/.co/.net/.org/.dev/.app/.shop/.ly` followed by space.

---

## 4. Continue / Generate Button

- **Label:** "Continue with Aria" (text state) → "Generate site" (ready state)
- **Disabled** when no prompt, no asset, no refs, no import — hover shows tooltip *"Start typing to give Aria a starting point"*
- **On click sequence:**
  1. `continuing = true` (button locked)
  2. Wait **600ms**
  3. Compute completion key, build "Aria Touch" text
  4. `screen = 'transitioning'` — overlay with typewriter
  5. Wait **3200ms** (with Aria Touch) or **1800ms** (without)
  6. `screen = 'ready'`, button unlocked

### Aria Touch text (built dynamically)

- With files: *"Based on your [N files], I'll extract your brand colors, imagery and key visuals."*
- With reference sites: *"From the reference site(s) I'll borrow the visual style, layout language and editorial feel."*
- With imported site: *"I'll import your existing content, products and structure from your current site."*
- Missing-fields hint: *"my site name is…, it's a … business, what makes it unique is…"*

---

## 5. Attachments

### Add dropdown
- **"Add photos or files"** → AssetsModal
- **"Add a reference site"** → UrlModal

### Drag & drop (whole input card)
- On drag-over: card bg `#F0F4FF`, border `2px dashed #2F5DFF`, overlay *"Drop files or URLs here"*
- Files filtered by allowed extensions: **PNG, JPG, JPEG, PDF, SVG, ZIP**; max **25 MB**
- Invalid file → error toast (*"{filename} — exceeds 25 MB limit"* / *"unsupported format"*)
- Dropped URLs become reference chips
- Drop in empty state auto-transitions to `text`

### Attachment chips
- Types: image thumbnail (48×48), file (icon color-coded: PDF red, MP4 purple, DOC blue), URL (green globe + domain), folder chip ("+N more", expandable)
- Hover reveals × remove button
- **Remove → undo toast** with 4-second timer; Undo restores the item

---

## 6. Example Prompt Chips

- 6 chips per set, 3 sets (18 total), cycled by **"↻ More ideas"** (`ideasSet % 3`)
- Hidden during `ready`/`transitioning`
- Click → fills prompt with the full example text, moves to `text` state

| Set 0 | Set 1 | Set 2 |
|---|---|---|
| Fashion store | Photography studio | Event planner |
| Online course | Coffee shop | Tech startup |
| Wellness service | Law firm | Bakery |
| Consulting website | Fitness coach | Real estate |
| Community hub | Interior design | Kids education |
| Creative portfolio | Music school | Therapist |

---

## 7. Templates Section

- **Search input** — underline style, filters template pool by name, × clear button when non-empty
- **Grid** — 3 columns, 9 templates initially; **"Show more templates"** reveals the rest
- **Card hover** — white scrim (55% opacity), "Edit" (dark) + "View" (outline) buttons appear, border turns blue (180ms)
- "Wix Inspirations" link: *"Browse curated sites by style & category"*

---

## 8. URL Flows

### Import site ("Create from URL" — `import-url`)
1. URL input, placeholder *"Paste any address or URL"* — validated by `/^(https?:\/\/)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/`
2. **Scan** → progress bar, **1600ms**
3. Results: site screenshot preview + platform badge (e.g. "Shopify") + two option cards:
   - **"Content & design"** — keep style, content and product data (default selected)
   - **"Design only"** — visual style only
4. **Add** → `imported = true`, returns to `text` state
5. Legal banner: *"Only use URLs where you have rights to the content."*
6. Error: *"Couldn't reach this site. Check the URL and try again."*

### Reference site (`url`)
1. Same URL input + **Get** button
2. Scanning 1600ms → preview + green chip *"Reference site added"*
3. **"Add reference →"** pushes URL to `refs`

---

## 9. Generating Screen

After Generate:
- Skeleton sections appear staggered at: **300, 700, 1300, 2100, 3100, 4300, 5700, 7200 ms**
- Each section: fade + slide-up (`translateY(6px) → 0`, 0.5s ease)
- Skeleton shimmer: `1.8s ease-in-out infinite` gradient sweep
- At **10,000ms**: screenshot fades in (0.9s), skeleton fades out

---

## 10. Animation Reference

| Animation | Timing |
|---|---|
| Title typewriter | 20ms/char, 500ms think delay, blinking cursor (0.7s step-end) |
| Body typewriter | 14ms/char, delayed until title finishes |
| Inline typewriter | 16ms/char |
| Card enter | 420ms ease-out (fade + slide up) |
| Placeholder crossfade | 320ms |
| Border pulse (typing) | 1.8s ease-in-out infinite |
| Spinner | 0.8s linear infinite |
| Aria avatar float | 3.8s ease-in-out infinite (±5px Y) |
| Dropdown menu | 140ms ease-out |
| Modal backdrop fade | 150ms ease-out |
| Template shimmer | 1.4s linear infinite |
| Button hover/active | 120–150ms, brightness filters + scale(0.98–0.99) |

---

## 11. Flow Map

```
Intro screens (0–3)
   ↓
empty ──(type / drop / chip click)──→ text
   ↑                                    │
   └──(clear all content)───────────────┤
                                        ↓ Continue (600ms)
                                  transitioning (1800–3200ms, Aria Touch typewriter)
                                        ↓
                                      ready ──(focus textarea)──→ back to editing
                                        ↓ Generate site
                                   generating (10s skeleton → screenshot)

Branches (modals, from any input state):
  Add ▸ photos/files  → AssetsModal → chips added
  Add ▸ reference site → UrlModal → scan 1600ms → refs added
  Create from URL      → ImportFlow → scan 1600ms → Content&design / Design only → imported=true
```

---

## 12. State Variables

| Variable | Type | Initial | Purpose |
|---|---|---|---|
| `screen` | string | `'empty'` | Primary UI state |
| `prompt` | string | `''` | User input text |
| `asset` / `assetFiles` | bool / array | `false` / `[]` | Uploaded files |
| `refs` | array | `[]` | Reference site URLs |
| `imported` | bool | `false` | Site imported from URL |
| `ov` | string | `null` | Active modal |
| `stateKey` | string | `'000'` | Live field-completion key |
| `readyKey` | string | `'111'` | Completion key frozen at Continue |
| `isTyping` | bool | `false` | Keystroke-pause detection |
| `dragOver` | bool | `false` | Drag in progress |
| `undoItem` | object | `null` | Undo toast payload |
| `continuing` | bool | `false` | Continue button lock |
| `ariaTouch` | string | `''` | Aria's typewriter explanation |
| `tplSearch` / `showMore` | string / bool | `''` / `false` | Template browsing |
| `ideasSet` | number | `0` | Example chips set (0–2) |
