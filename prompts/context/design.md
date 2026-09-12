# HireHand Design System

Warm-neutral surfaces, near-black ink, one orange accent. Minimal by intent — one accent
color, one type family (+ mono for metadata), four radii, one shadow pair.

Reference implementation: `HireHand Web.dc.html` → "Design system" tab.

---

## 0. Logo

A map pin with an `H` cut out of it — location plus trade, one shape.

| Variant | File | Use |
|---|---|---|
| Ink + accent | `hirehand-mark-ink.svg` | Default. Light backgrounds; orange crossbar is the only accent. |
| Orange | `hirehand-mark-orange.svg` | Light backgrounds where the mark itself is the accent (favicon, app icon on white). |
| White | `hirehand-mark-white.svg` | Ink `#141210`, photography, orange fills. No crossbar. |

- Lockup: mark + "HireHand" in Manrope 800, tracking −0.03em, 10px gap, optically centered on the pin's body.
- Minimum height: **20px** for the mark, **28px** when paired with the wordmark.
- Clearspace: half the mark's height on all sides.
- Tight crop viewBox `48 22 144 190`. Never add a container, outline, or drop shadow; on a photo use the white variant, not a badge.
- Never recolor the crossbar to anything but `orange-500`, and never use the ink+accent variant on a dark ground.

---

## 1. Color

| Token | Hex | Use |
|---|---|---|
| `orange-500` | `#FF5A36` | Primary action, active accent, links, quote counts |
| `orange-600` | `#E44A28` | Primary hover / pressed |
| `orange-50` | `#FFF1EC` | Accent surface: "Open" status, upsell cards |
| `ink-900` | `#141210` | Body text, dark buttons, dark panels |
| `ink-800` | `#1F1B17` | Card on dark panel |
| `ink-700` | `#3C3833` | Secondary body text |
| `ink-500` | `#6B665F` | Muted / supporting text |
| `ink-400` | `#8A8278` | Meta, placeholders, mono labels |
| `line` | `#E6E3DE` | All 1px borders |
| `line-strong` | `#CFCAC2` | Secondary button border, dashed uploads |
| `surface` | `#F5F3F0` | Filled chips, tinted cards |
| `surface-alt` | `#FAF9F7` | Sidebars, footers, page bands |
| `canvas` | `#FFFFFF` | Page background |
| `dark-line` | `#332D26` | Dividers inside dark panels |
| `success-700` / `success-50` | `#2F6B45` / `#EDF3EE` | "Accepted" status |
| `info-700` / `info-50` | `#3C4A5E` / `#EDEFF3` | "Completed" status |

**Rules**
- Orange is for *one* thing per view: the primary action. Never two orange buttons in the same block.
- Dark panels (`ink-900`) mark contractor-facing / commercial moments. Max two per page.
- Body text is `ink-900` on light, `#D8D3CB` on dark. Never drop text below `ink-500` on white.

---

## 2. Typography

**Manrope** (400/500/600/700/800) for everything. **JetBrains Mono** (400/500) for IDs,
dimensions, token values, step numbers.

| Style | Size / Weight / Tracking | Use |
|---|---|---|
| Display | 62 / 800 / −0.03em | Hero only |
| H1 | 34–38 / 800 / −0.025em | Page title |
| H2 | 26–30 / 800 / −0.02em | Section title |
| H3 | 18–19 / 700 | Card / panel title |
| Body-lg | 15–16 / 400 / 1.6 | Descriptions |
| Body | 13.5–14 / 400 / 1.55 | Card copy |
| Meta | 12.5–13 / 600 | Row metadata, breadcrumbs |
| Label | 11.5 / 700 / 0.08em / uppercase | Field + section labels |
| Mono | 11 / 500 | `JOB-2041`, `840×420`, token values |

---

## 3. Spacing & layout

- Scale: **4 · 8 · 12 · 16 · 24 · 32 · 48 · 80**
- Page canvas 1440px; page padding 48px; card padding 18–32px.
- Section rhythm: 80px between marketing sections, 44px between system sections, 24px between cards in a stack.
- Grids: 2-up job cards (16px gap), 3-up category/step cards (16–20px gap), detail page `1fr / 400px` with 32px gap.
- Contractor browse = 280px filter sidebar + fluid results.

---

## 4. Radius, border, elevation

| Token | Value |
|---|---|
| `radius-sm` | 9px — small buttons, inline controls |
| `radius-md` | 11–13px — inputs, buttons, tiles |
| `radius-lg` | 16–20px — cards, panels, hero |
| `radius-pill` | 999px — chips, status tags, nav, CTA pills |
| `border` | 1px `#E6E3DE` |
| `shadow-card` | `0 12px 30px rgba(20,18,16,0.06)` |
| `shadow-float` | `0 18px 40px rgba(20,18,16,0.14)` |

Shadows only on floating elements (sticky quote panel, hero search bar). Everything else uses a border.

---

## 5. Components

### Buttons
| Variant | Spec |
|---|---|
| Primary | `orange-500` bg, white, 13×22, radius-md, 700 |
| Dark | `ink-900` bg, white, same metrics |
| Secondary | white bg, 1px `line-strong`, 600 |
| Pill primary / pill dark | same fills, radius-pill — marketing & nav only |
| Small | 9×14, radius-sm, 13px/600, 1px `line` |
| Disabled | `#EDEAE5` bg, `#8A8278` text |

### Inputs
14×16 padding, radius-md, 1px `line`. Focus → 1px `ink-900`. Error → 1px `orange-500` with `#C4451F` text. Upload → 1px dashed `line-strong`. Labels sit above in Label style.

### Status tags
Pill, 5×12, 11.5px/700 — Draft `surface`/`ink-500` · Open `orange-50`/`#C4451F` · Accepted `success-50`/`success-700` · Completed `info-50`/`info-700` · Cancelled `surface`/`ink-400`.

### Job type tags
Pill, `ink-900` fill, white text — Plumbing · Electrical · Landscaping. Always dark, never colored by trade.

### Job card
Image band 150px (16:9-ish) → type tag top-right, photo note top-left → body 18px padding → title + relative time row → 1-line blurb → footer rule with timeframe, ZIP, and quote count in orange. Hover: border → `ink-900`.

### Quote row (homeowner)
Avatar circle 42px `#F0EDE9` with initials → name + message → price (19/800) + rating → Accept (primary). Rows separated by 1px `#F0EDE9`.

### Panels
Sticky side panel: white, 1px `line`, radius-lg, 24px padding, `shadow-card`, `top: 96px`.
Dark panel: `ink-900`, radius-lg, dividers `dark-line`, muted text `#A9A399`.

---

## 6. Illustration

Two separate image languages. Never mix them in one card.

### A. 3D object renders — the marketing language

Used on landing/marketing surfaces only: trade cards, how-it-works steps, empty states, onboarding.

**Fixed recipe** — every asset is generated with this same set of constraints so the whole library stays coherent:

- **Camera**: isometric, three-quarter view, slight top-down.
- **Style**: clean glossy product render, soft studio lighting, subtle self-shadowing, no harsh speculars.
- **Subject**: 1-3 real objects from the trade, arranged as a small tidy vignette or floating diorama. Objects, never people. Never a whole house.
- **Color**: the object's own honest material color (chrome, copper, brass, green turf, grey plastic) plus `orange-500` `#FF5A36` for any accent detail. **No red, no blue, no secondary hues.** An orange map pin is brand; a red one is a bug.
- **Background**: solid pure white `#FFFFFF`, no backdrop, no gradient, no ground plane, no shadow catcher — subject fully cut out.
- **No baked text**: no letters, numbers, currency symbols or UI labels inside the render. Copy lives in HTML.
- **Output**: square, 2048×2048, PNG.

**Placement**

| Context | Render size | Notes |
|---|---|---|
| Trade card (3-up) | 200×200, centered | Title below, then description, count, pill CTA |
| Step card (3-up) | 170×170, centered | Mono step number above the render |
| Empty state | 140×140, centered | One line of copy below |

**The ground-removal rule.** Every illustration ships with exactly this treatment:

```css
object-fit: contain;
filter: brightness(1.14) contrast(1.05);
mix-blend-mode: multiply;
```

The `brightness`/`contrast` pass clips the render's near-white studio ground up to true white; `multiply` then cancels it against whatever the card's background is. Without the filter, any residual backdrop tint multiplies into a hard grey box — generators reliably return a slightly-off-white ground no matter how the prompt is worded, so the filter is not optional and **must not** be dropped. The subjects are mid-tone and survive the lift.

Check every new asset on **both** a white card and a `surface` `#F5F3F0` card — a tinted card masks the defect.

**Current library**

| Asset | Subject |
|---|---|
| Plumbing | Chrome faucet, copper elbow, graphite wrench with orange grip |
| Electrical | Breaker panel, wall outlet, coil of orange wire |
| Landscaping | Turf diorama with shrub, young tree, push mower |
| Step 01 — Post the job | Phone with blank form, camera icon, photo thumbs |
| Step 02 — Collect quotes | Three blank price-tag cards fanned out |
| Step 03 — Pick your pro | Orange check badge, orange map pin, brass key |

When adding a trade or a step, generate a new asset on the recipe above — don't borrow an existing one or drop in a flat icon.

### B. Iconography — the product language

Inside the app (nav, filters, metadata rows, statuses) use geometric glyphs at text weight: `◍ ◈ ✿ ◷ ⌖ ✓ 🔒`. One weight, one color (`ink-500` or inherited). No illustration, no 3D render, no multicolor icon set in product chrome.

---

## 7. Photography

All photography sits in rounded containers (`radius-lg` for hero/detail, `radius-md` for thumbs).
Placeholders use a 135° stripe (`#E8E5E1` / `#F3F1ED`, 9px) with a mono caption naming the shot and pixel size.
Dark placeholders use `#1B1815` / `#232019`. Hero gets a `rgba(20,18,16,.2 → .85)` bottom gradient so white type clears 4.5:1.

Real job photos are documentary, not staged: plain honest lighting, warm neutral tones, no people, no text, the actual problem in frame. Homeowners upload these — the design must survive an ugly phone photo.

---

## 8. Domain rules the UI must express

- **Browsing is never gated.** Contractors see full job detail and photos with no blur, no overlay, no "upgrade to view".
- **Quote count is the only meter.** Show remaining free quotes as a thin progress bar + `n of 3 free left`, near the quote action — not as an interstitial.
- **Location privacy.** Public job views show city + ZIP only. Exact address/contact render as a dashed lock note until acceptance, phrased as a workflow step, not a paywall.
- **Frozen after acceptance.** Accepted jobs lose Edit/Delete and show a `Locked — view only` control in place of them.
- **Homeowners never see pricing surfaces.** No plan, upsell, or billing UI in homeowner screens.
- **Past due** blocks the quote action only; profile and live quotes stay visually unchanged.

---

## 9. Voice

Plain, short, trade-literal. "Post the job", "Send quote", "Pick your pro". State the free thing before the paid thing.
No exclamation marks, no emoji, no "unlock your potential". Numbers are concrete: `3 quotes`, `$20/month`, `2 of 3 free left`.
