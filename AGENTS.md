<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

# UI Design Principles (condensed working reference)

A practical checklist for making interfaces look designed without being a designer. This is a rewritten, condensed digest of the ideas from the Refactoring UI material, organized by the question you are asking while building. Use it as a decision guide, not a rulebook.

---

## 0. Project defaults (Jerald's current setup)

- Theme: dark. Background `#121212`, secondary surface `#1b1b1b`.
- Primary color: `#5A9A0A` (green). Hover: a slightly lighter shade.
- Text: main `#eee`, body `#bbb`, muted `#888`.
- Fonts: Montserrat for headings, Roboto for body.
- Prefer plain CSS with variables. Tailwind is optional.
- Writing preference: no em-dashes in any prose.
- Solid primary buttons use dark text (`#121212`). White on `#5A9A0A` fails the 4.5:1 contrast target for normal text.

---

## 1. Process

1. Design one feature at a time, not "the app shell". Navigation and layout decisions get easy after a few real features exist.
2. Work in low fidelity first. Grayscale forces you to use spacing, size, and contrast for hierarchy. Add color last.
3. Do not design everything up front. Design a small version, build it, then fix problems in the real thing.
4. Be pessimistic about scope. Design the smallest useful version so you always have something shippable. Nice-to-haves come later.
5. Pick a personality on purpose. It is mostly set by:
   - Font: serif is classic or elegant, rounded sans is playful, neutral sans is plain.
   - Color: blue is safe, gold feels premium, pink feels fun.
   - Border radius: none is formal, small is neutral, large is playful. Never mix square and rounded corners.
   - Wording: formal language feels official, casual language feels friendly.
6. Limit choices. Define systems in advance (font size, weight, line height, color, spacing, width, shadow, radius, border width, opacity) so you stop agonizing over 12px vs 13px.
7. Pick from a scale by elimination: guess a value, try the neighbors on each side, and keep the middle one if both neighbors look worse.

---

## 2. Hierarchy (the biggest lever)

- Not everything can be important. De-emphasize secondary and tertiary content so the primary content stands out.
- Do not rely on font size alone. Combine size with weight and color.
  - Use 2 or 3 text colors: strong for primary, softer for secondary, softest for tertiary.
  - Use 2 weights: normal (400/500) and bold (600/700). Avoid weights under 400 for small UI text.
  - To de-emphasize, use lighter color or smaller size, not a thinner weight.
- Grey text on colored backgrounds looks washed out. Instead hand-pick a color with the same hue as the background and adjust saturation and lightness. Do not just lower white's opacity.
- To make something pop, try de-emphasizing its competitors (for example, soften inactive nav items instead of boosting the active one).
- Labels are a last resort.
  - Often the format already says what it is (email, phone, price).
  - Merge label and value: "12 left in stock", "3 bedrooms".
  - If a label is needed, make it smaller and lower contrast than the value.
  - On spec-sheet style pages where users scan for the label, flip it: stronger label, softer value.
- Visual hierarchy is separate from HTML hierarchy. An `h1` can be small. Section titles often act like labels and should not steal attention. Choose tags for semantics, style for hierarchy.
- Balance weight and contrast. Heavy elements (bold text, solid icons) should get lower contrast. Low-contrast elements (thin borders) can get more weight (thicker) instead of a harsher color.
- Button hierarchy:
  - Primary: solid, high contrast. Only one per page, ideally.
  - Secondary: outline or low-contrast fill.
  - Tertiary: styled like a link.
  - Destructive actions are not automatically big and red. Use a quiet style by default, and save the bold red treatment for the confirmation step.

---

## 3. Layout and spacing

- Start with too much white space, then remove it. Adding only until it "stops looking bad" gives you cramped results.
- Dense layouts are fine for dashboards, but make that a deliberate choice.
- Use a spacing scale, not arbitrary pixels. No two neighbors in the scale should be closer than about 25%. Suggested px scale:

  `4, 8, 12, 16, 24, 32, 48, 64, 96, 128, 192, 256, 384, 512, 640, 768`

- Use only the width you need. If a form needs 600px, make it 600px. Do not stretch things to match the full-width navbar.
- Design mobile first on a small canvas (~400px), then adapt upward. For wide screens, split narrow content into columns rather than stretching it.
- Grids are a tool, not a religion.
  - Fixed-width elements (like a sidebar) should have a fixed width, with the main area flexing.
  - Use `max-width` on cards and forms instead of percentage columns, and only let them shrink when the screen forces it.
- Relative sizing does not scale. Big elements should shrink faster than small ones on small screens. Do not tie heading size to body size with `em` multipliers. Button padding should not scale proportionally with font size either (large buttons get relatively more padding, small ones relatively less).
- Avoid ambiguous spacing. There must be more space around a group than inside it. Examples: space between form groups larger than between a label and its input, more space above a section heading than below it, bullet gaps larger than line gaps within a bullet.

---

## 4. Typography

- Type scale (hand-picked, px or rem only, never nested `em`):

  `12, 14, 16, 18, 20, 24, 30, 36, 48, 60, 72`

- Choosing fonts:
  - Safe default for UI is a neutral sans (or the system font stack).
  - Prefer families with many weights (roughly 5+ weights, 10+ styles incl. italics). More weights usually means more care went into the design.
  - Sort by popularity. Inspect sites you admire.
  - Avoid condensed, short x-height faces for body UI text. Headline faces have tight spacing, text faces have wider spacing.
- Line length: 45 to 75 characters per line, roughly `max-width: 20em` to `35em` (or `65ch`). Limit paragraph width even if the container is wider.
- Align mixed sizes on one line by baseline, not by center.
- Line height is proportional:
  - Narrow text: about 1.5. Wide text: up to 2.
  - Small text needs more line height, large headlines can be about 1 to 1.2.
- Not every link needs link styling. In link-heavy UIs, use weight or a subtle color, or show underline/color only on hover for minor links.
- Alignment:
  - Left-align most text. Center only short headlines or blocks of 2 to 3 lines.
  - Right-align numbers in tables.
  - If you justify text, enable hyphenation.
- Letter-spacing: usually leave it alone. Tighten large headlines in wide-spaced fonts. Loosen ALL CAPS text.

---

## 5. Color

- Use HSL, not hex, when designing palettes. Hue is the angle on the wheel, saturation is vividness, lightness is how close to black or white. (Browsers use HSL, not HSB.)
- You need more colors than a 5-color palette gives you:
  - Greys: 8 to 10 shades. Avoid pure black, start from a very dark grey.
  - Primary: 5 to 10 shades. Light tints for backgrounds, dark ones for text.
  - Accents: several, each with multiple shades. Include semantic ones (red for danger, yellow for warning, green for success) and eye-catching ones for highlights.
- Define shades up front and name them 100 to 900. Pick the base (500) as something that works as a button background. Then pick the lightest (100) and darkest (900) using real use cases (alert background and alert text). Fill in 300 and 700 next, then the rest. Do not generate shades on the fly with lighten/darken helpers.
- Saturation fades visually near 0% and 100% lightness. Increase saturation for very light and very dark shades so they do not look washed out.
- Perceived brightness differs by hue (yellow, cyan, magenta look brighter than red, green, blue at the same lightness). To lighten a color, nudge its hue toward 60/180/300. To darken, nudge toward 0/120/240. Keep rotations under about 20 to 30 degrees.
- Greys can carry temperature. Add a bit of blue for cool, a bit of yellow or orange for warm, and raise saturation slightly at the light and dark ends to keep it consistent.
- Accessibility:
  - Contrast targets: 4.5:1 for normal text, 3:1 for large text.
  - If a colored background has to be too dark to pass with white text, flip it: dark text on a light tint of the color.
  - For colored text on colored backgrounds, rotate the hue toward a brighter hue to gain contrast without going to pure white.
- Do not rely on color alone. Add icons or labels for good/bad states. In charts, vary lightness, not only hue.

---

## 6. Depth

- Light comes from above.
  - Raised element: slightly lighter top edge, small dark shadow below.
  - Inset element (inputs, wells): slightly lighter bottom edge, small dark inner shadow at the top.
  - Choose the highlight color by hand instead of overlaying semi-transparent white.
  - Do not chase photorealism.
- Shadow size means elevation. Small shadow for buttons, medium for dropdowns, large for modals. Define about 5 shadow levels in advance.
- Interaction: add a shadow on drag or hover (feels lifted), shrink or remove it on press (feels pushed in).
- Two-part shadows: one large soft shadow (direct light) plus one small tight shadow (ambient occlusion). The tight shadow fades out at higher elevations.
- Depth without shadows (flat design):
  - Lighter surface reads as closer, darker reads as further. **On dark themes this is the main tool: raise surfaces by making them lighter than `--background`.**
  - Solid shadows with a vertical offset and zero blur.
- Overlap elements across section boundaries or container edges to create layers. For overlapping images, add an "invisible border" in the background color so they do not clash.

---

## 7. Images

- Use good photos (professional or quality stock). Never plan on swapping in better placeholders later.
- Text over images needs consistent contrast. Options: semi-transparent overlay, lower image contrast (and adjust brightness), colorize (reduce contrast, desaturate, multiply with a color), or a large-blur, zero-offset text shadow that acts like a glow.
- Everything has an intended size:
  - Do not scale small icons way up (they look chunky). Put them in a colored shape or circle instead.
  - Do not shrink full screenshots (text becomes unreadable). Use a smaller-screen capture, a partial crop, or a simplified drawing of the UI.
  - Do not shrink detailed logos to favicon size. Redraw a simplified version.
- User-uploaded images: show them in fixed-size containers with `object-fit: cover` (or background-size cover). Prevent background bleed with a subtle inner shadow or a semi-transparent inner border, not a normal border.

---

## 8. Finishing touches

- Supercharge defaults: icon bullets, bigger or colored testimonial quotes, custom link underlines, brand-colored checkboxes and radios.
- Accent borders add color cheaply: top of cards, active nav item, left side of alerts, short bar under a headline, top of the whole layout.
- Decorate backgrounds: change a section's color, use a subtle gradient (hues within about 30 degrees), use a low-contrast repeating pattern, or place simple shapes or illustrations.
- Design empty states. Use an illustration, a clear call to action, and hide filters or tabs that do nothing yet.
- Use fewer borders. Alternatives: box shadow, different background colors, or more spacing.
- Think outside the box. Dropdowns, tables, and radio groups do not have to look default (sectioned dropdowns, tables with combined columns and images, selectable cards instead of radios).

---

## 9. Quick review checklist

Before calling a screen done:

- [ ] Is there one obvious primary action and one obvious primary piece of content?
- [ ] Are secondary and tertiary items visibly quieter (color, size, weight)?
- [ ] Do all spacing, font size, shadow, and color values come from the defined scales?
- [ ] Is there more space between groups than within groups?
- [ ] Is paragraph width within 45 to 75 characters?
- [ ] Do text and key UI colors meet contrast (4.5:1 normal, 3:1 large)?
- [ ] Is anything communicated by color alone?
- [ ] Could any border be replaced by spacing, a shadow, or a background shift?
- [ ] Does the empty state look intentional?
- [ ] Are corners, shadows, and weights consistent with the chosen personality?

---

## 10. Ways to keep improving

- When you see a design you like, ask what decision the designer made that you would not have thought of.
- Rebuild interfaces you admire from scratch without opening dev tools. The differences you notice teach you the tricks.

*Source inspiration: Refactoring UI by Adam Wathan and Steve Schoger. This file is an original condensed summary for personal reference, not a copy of the book.*

## Supabase Integration

The project is connected to **Supabase**, which currently provides:

- **User authentication** out‑of‑the‑box (email/password, OAuth, magic links, etc.).
- Realtime API, storage, and edge functions (available for future use).

At the moment no custom tables have been created. Supabase offers a full backend suite:

- **Authentication** (email/password, OAuth, magic links, phone, etc.)
- **Auto‑generated REST and GraphQL APIs** for any table in the PostgreSQL database
- **Realtime** change subscriptions via websockets
- **Storage** for buckets, public/private files, and CDN edge caching
- **Edge Functions** (serverless) for custom business logic
- **Row Level Security (RLS)** policies to protect data per‑row and per‑user
- **Database**: managed PostgreSQL with extensions (PostGIS, pgvector, etc.)
- **Analytics** and **Logging** dashboards

To store additional user information you can:

1. **Create a public `users` table** containing only the fields you wish to expose (e.g., `id`, `username`, `avatar_url`).
2. Use the `auth.users.id` column from Supabase Auth as a **foreign key** to link each record in the public `users` table to the authenticated user.
3. Keep the public table `SELECT`‑able for any client while the auth table remains private.

Example schema:

```sql
create table public.users (
  id uuid primary key references auth.users(id),
  username text,
  avatar_url text,
  created_at timestamp default now()
);
```

This approach lets you store basic profile data without modifying Supabase's internal auth table, and you can expand the schema later (e.g., add `role`, `preferences`, etc.). Remember to set Row Level Security (RLS) policies so only the owner can update their own row while the data can be read publicly if desired.

---
# LuxPlant: Product Information

This document contains everything known about the LuxPlant product line. Use only the facts below. Anything listed under "Not yet decided or unknown" must not be invented; leave it out or mark it as to be confirmed.

## 1. What LuxPlant Is

LuxPlant is a 3D-printed, LED-lit artificial plant. Each leaf is printed in light-diffusing filament and lit from the inside by addressable RGB LEDs, so the plant can glow in any color and run animated light effects. It is sold in two ways: as a fully built unit, or as STL files for people who want to print and assemble it themselves.

The project is made by an independent creator based in the Philippines. The creator describes it as a labor of love: filament and printing time are expensive locally, and support from buyers goes directly into developing the larger LuxPlant Standard.

There are two product versions:

- **LuxPlant Mini**: available now.
- **LuxPlant Standard**: in development, still coming soon.

## 2. LuxPlant Mini (Available Now)

### Size and build
- Height: 20 inches
- Pot diameter: 14 cm
- Every part can be printed on a Bambu Lab A1 Mini.
- A tall-stem version can also be printed on bed slinger printers. Support bridges between the stem sections stop the stem from getting knocked over on the build plate.

### Features
- 16 million colors, with many pre-installed presets and animations to choose from.
- Automatic on/off schedule. The plant turns itself on and off at set times, so no remote or switch is needed. Default schedule: off at 12 midnight, on again at 8 AM. The times can be changed in the settings.
- Color control through an app for iOS and Android.
- Rotatable stem and leaf. Leaves and stem sections can be turned to any angle.
- Fully modular stem (see section 6).

### Lighting hardware
- Controller: ESP32 WROOM-32 (30-pin, USB Type-C)
- LEDs: WS2812 eco addressable RGB strip
- 9 leaves with 14 LEDs each, 126 LEDs in total
- LED data pin: GPIO 16
- Power: 35 mA per LED, so about 4.4 A at full white across 126 LEDs (in practice most animations at peak brightness draw 2 to 3 A). Use a 5V adapter rated at least 6A (30W). WLED maximum PSU current setting: 4000 to 5000 mA.
- The ESP32 must be powered through its 5V or VIN pin. Never use the 3.3V pin.
- LEDs are rated for about 10 years of lifespan (theoretical).
- 30 light presets come pre-installed, plus an "All effects" playlist that cycles through them.

### Wiring (final release)
- 3-pin connectors (the earlier 4-pin connectors were reverted to 3-pin).
- Data lines are separated for each stem. The plant has three stems (A, B, and C), so a controller with three or more data outputs suits it best. A single-output controller can share its data line across the stems.
- Safety: every build needs a fuse (a 2A fuse per stem, or one 5A fuse at the power input). See section 5.
- A wiring diagram and an internal stem wiring diagram are included with the files.

## 3. Buying the Built LuxPlant Mini

| Item | Detail |
|---|---|
| Price | 3,500 pesos for the built LuxPlant Mini |
| Delivery fee | 100 pesos (to be confirmed whether this is a flat fee) |
| Price variation | None. The price is fixed and does not vary by stem configuration. The stem is also fixed. |
| Availability | In stock |
| Order processing | About 1 to 2 days |
| Location | Philippines based |
| Payment methods | Bank transfer, cash on delivery, PayPal, GCash |

### Warranty
- 18 months. If something breaks, it is replaced, no questions asked.
- Free repair even after the warranty has expired.

## 4. STL Files and Memberships

For people who prefer to print the LuxPlant Mini themselves.

### STL Files: $5
- A $5 one-time purchase for the LuxPlant Mini STL files. (Creator believes this is a lifetime purchase; confirm before publishing.)
- Personal use only (see terms below).

### Commercial License: $10 per month
A monthly membership for people who want to sell the physical prints themselves.

- Be one of the pioneers and early supporters of LuxPlant at a discounted price.
- Grants permission to sell the physical prints of the LuxPlant Mini, valid only while the membership is active.
- Does not allow reselling or redistributing the STL files.
- Discount when the LuxPlant Standard Version is completed.
- Progress updates.
- Exclusive technical support when you run into problems printing the LuxPlant.
- Exclusive group chat for commercial license holders: connect with other commercial creators, share business tips, and discuss industry trends.

### Terms of Use
- STL buyers get lifetime PERSONAL USE of the LuxPlant Mini STL files.
- Selling physical copies without a commercial license is NOT allowed.
- You may print for family and friends, but you must not redistribute the files, sell the files, or sell physical copies to anyone.
- The fully modular stem feature is exclusive to people who purchased the files and supported the project. It is not released anywhere else.

## 5. Bill of Materials (Self-Build LuxPlant Mini)

The BOM below comes from the creator's spreadsheet. It should be shown directly on the website page, not only linked. The original is also available as a Google Sheet:
https://docs.google.com/spreadsheets/d/1j2otkWxiZfMFeW_atJ6IzwAQXcGJfLLF-qtTCmT9uTQ/edit?usp=sharing

The sheet has four tabs: Bill of Materials, Consumables, Printables, and Stem Wiring Length.

### 5.1 Parts and electronics

The sheet does not label the currency. The sources are mostly Amazon US listings, so USD is assumed. "Not listed" means the sheet shows no price (it displays 0.00), so those items are not free, just unpriced.

| # | Item | Qty | Unit price | Line total | Status |
|---|---|---|---|---|---|
| 1 | WS2812B white IP30 addressable LED strip, 100 LEDs/m, 10 mm wide (eco or non-eco) | 2 | 11.99 | 23.98 | Required |
| 2 | ESP32 WROOM-32, 30-pin, Type-C socket | 1 | 8.99 | 8.99 | Required, or use item 3 |
| 3 | Plug-and-play WLED controller (Gledopto, DigQuad, ABC, or BTF Lighting) | n/a | Not listed | Not listed | Alternative to item 2 |
| 4 | 5V 6A (30W) power adapter | 1 | 18.99 | 18.99 | Required |
| 5 | 22 AWG wire, 5 to 10 meters | 1 | 13.99 | 13.99 | Required |
| 6 | Inline fuse, 2A or 5A | 3 | Not listed | Not listed | Required (safety) |
| 7 | Artificial moss 3.5 oz, or artificial foliage 25 cm x 25 cm | 1 | 4.99 | 4.99 | Cosmetic |
| 8 | Female DC jack, 5.5 mm x 2.1 mm | 1 | Not listed | Not listed | Required unless the adapter includes one |
| 9 | Momentary push button | 1 | Not listed | Not listed | Optional |
| 10 | 3-pin JST SM connector, 20 AWG, male | 3 | Not listed | Not listed | Strongly encouraged |
| 11 | 3-pin JST SM connector, 20 AWG, female | 4 | Not listed | Not listed | Strongly encouraged |
| 12 | 220 ohm resistor | Quantity blank in sheet (notes say 3) | Not listed | Not listed | Optional, bare ESP32 only |
| 13 | 16V 1000uF capacitor | 1 | Not listed | Not listed | Optional, bare ESP32 only |

### 5.2 Notes for each item

**LED strip.** Any addressable LED strip that is 10 mm wide works. The creator recommends 100 LEDs per meter. A 144 LEDs per meter strip was tried, but it is 12 mm wide, so the edges had to be cut off to fit inside the 10 mm clearance of the leaves, and its smaller copper pads were much harder to solder. The build uses 2 packs of strips.

**ESP32.** Any ESP32 works, but the printed mount is designed for the WROOM-32 30-pin. Many manufacturers make ESP32 boards with different features, so the creator recommends sticking with this one.

**Plug-and-play WLED controller.** An easier route than a bare ESP32 and the recommended choice for a first WLED build. These controllers have an ESP32 built in, along with fuses, level shifters, and data line resistors. They cost slightly more than a bare ESP32, but once the packs of fuses and resistors are counted, the total cost is almost equal. The plant has three stems, each with its own data line, so a controller with several data outputs, such as the DigQuad (4 outputs), is ideal. A controller with only one output can still be used by sharing the data line across the stems.

**Power adapter.** Any 5V adapter rated at least 30W (6A) works. In practice, most animations at peak brightness draw only about 2 to 3A. Do not use a 12V wall adapter. A 12V adapter is only acceptable with a buck converter that steps the voltage down to 5V, and then it must supply at least 12V 2.5A.

**22 AWG wire.** The creator also used 24 AWG solid core wire stripped from a CAT6 LAN cable when 22 AWG ran out. It worked but was much harder to solder and join. Warning: thicker wire such as 18 AWG does not fit inside the stem.

**Inline fuse (non-negotiable).** Never skip the fuse. This is a high-current project, and building it incorrectly poses a fire risk. Use a 2A fuse for each stem, or a single 5A fuse at the start of the power input if 2A fuses are not available. Using both is even better. A fuse rated higher than the power supply is useless. If you have an automotive or glass fuse without an inline holder, you can solder the fuse legs directly to each wire.

**Artificial moss.** Cosmetic only. It sits on top of the pot to hide the connectors. The creator plans to make a 3D-printed moss and recommends this realistic artificial moss in the meantime. Pebbles also work.

**Female DC jack.** Adapters bought from BTF Lighting already include a single female DC jack. Otherwise, one is needed.

**Momentary push button (optional).** Switches the plant on and off, cycles through animations, or adjusts brightness without using the app. The top of the pot has a provision for adding a button or switch later.

**3-pin JST SM connectors.** BTF Lighting strips already include 2 pairs of JST connectors, and the build uses 2 packs of strips, so there are 4 pairs in total. With strips from other manufacturers, 3 pairs of connectors may need to be bought. Connectors can be skipped, but they are strongly encouraged because they let the stems detach from the pot for maintenance or disassembly.

**220 ohm resistor (optional, bare ESP32 only).** Any value from 220 to 330 ohms works. It must be 220 ohms, not 22K and not 2.2 ohms. It protects the first LED from voltage spikes and prolongs its life. Resistors are usually sold in packs of 100, so if buying a pack would be needed, it is fine to skip them.

**16V 1000uF capacitor (optional, bare ESP32 only).** Protects the ESP32 and the LED strips from sudden voltage spikes when power is plugged in. Not required, but encouraged with an unbranded power supply.

### 5.3 Consumables

| Item | Status | Notes |
|---|---|---|
| Soldering flux | Recommended | Any type works (paste in a tub or syringe). Cleaning with isopropyl alcohol is required even when using "no-clean" flux. Flux also helps avoid bad solder joints. |
| Solder wire | Recommended | 0.6 to 0.8 mm is recommended for beginners but not required. Thinner solder melts faster, so less time is spent on the small copper pads of the LED strips. |
| Isopropyl alcohol | Required | Cleans flux residue after soldering wires onto the LED strips. 70% or higher purity is enough, higher is better. Leftover residue can cause short circuits, which make the LEDs flicker or glitch. |
| Super glue | Optional | Permanently joins the stems. The connector already locks the stems together, but without glue visible gaps can appear at the joints because PLA and PETG deform over time, especially under constant load. Also used to fix the wires onto the LED strip mount for strain relief. The mount already has canals for the wires to push into, so the glue is an extra measure. |
| Heat shrink tubing | Optional | Insulates joined wires. Simple electrical tape also works. |

### 5.4 Printed parts

Total: 79 printed parts for one LuxPlant Mini.

| Part | Qty |
|---|---|
| Pot | 1 |
| Stem baseplate | 1 |
| Leaf | 9 |
| Straight stem base | 2 |
| Y stem base | 1 |
| Straight | 1 |
| Y stem type 1 | 4 |
| Y stem type 2 | 1 |
| 3% bend | 4 |
| 5% bend | 1 |
| 10% bend | 4 |
| 15% bend | 3 |
| Branch 3 cm | 4 |
| Base connectors | 3 |
| Stem connectors | 22 |
| LED strip connectors | 9 |
| LED strip mount | 9 |

The sheet has empty columns for grams of filament per part and total filament used. These have not been filled in. The sheet also lists one abbreviation: AB1 = Stem A, Branch 1.

### 5.5 Stem wiring lengths

The plant has three stems (Stem A, Stem B, Stem C), with three leaves per stem. The table gives the wire length needed for each section. The sheet does not label the unit.

| Section | Stem A | Stem B | Stem C |
|---|---|---|---|
| Leaf 1 | 14 | 15 | 17 |
| Leaf 1 to Leaf 2 | 35 | 30 | 41 |
| Leaf 2 to Leaf 3 | 25 | 29 | 31 |

## 6. Modular Stem

The Final Release stem is fully modular and rotatable. Builders choose the number of leaves and design their own stem configuration. The earlier beta design was scrapped to give builders full freedom to shape the plant.

- A sample stem configuration is provided, along with a ready-made file called STEM AND BRANCH (COMBINED).3mf for anyone who does not want to design their own.
- Builders can add more stem sections and leaves, and rotate leaves and stems however they like.
- Builders could technically assemble the Standard layout from the modular parts, but the 12 mm stem snaps easily under heavy load. The creator recommends waiting for the larger Standard, which will have thicker stems with different diameters for the branches.

## 7. Printing Guide (for self-printers)

### Recommended filaments
These are the filaments the creator tested. Equivalents work, but results vary with batch, ambient temperature, drying, nozzle wear, printer age, and humidity.

| Part | Filament |
|---|---|
| Leaf | eSUN PLA+ White (plain White only, not Cold White or Bone White) |
| Pot | Polymaker Panchroma PLA Matte White |
| Stem | Bambu Lab PLA Matte Dark Green, or Polymaker PLA Matte Army Dark Green |
| Connectors | PETG in any brand and color (PETG is encouraged) |
| Other parts | PETG preferred, PLA also works |

Notes on the leaf filament:
- Normal (non-matte) filament diffuses light best. eSUN PLA+ White stood out because it is semi-transparent compared with other white filaments such as Polymaker PLA Matte.
- Avoid matte, translucent, or transparent filaments for leaves. They show layer lines and do not diffuse light properly.
- Bambu Lab PETG Basic is a possible alternative for leaves with higher temperature resistance, but flawless overhangs are difficult in PETG. A PETG leaf profile will be posted once testing produces strong, clean leaves.
- A community member tried Elegoo PLA Matte Mint green leaves for a look similar to Fluora. Green leaves block some colors, especially purple, and turn white light green. Any non-matte light green filament works if a green leaf is preferred.
- With the LEDs on, the leaf does not look white, even during the day, so white leaves are recommended.

### Leaf print settings (important)
Confirm these in the slicer preview before printing, especially when using your own profile:
- Supports: off
- Bottom shell layers: 0
- Infill: none

If the bottom of the leaf is blocked or has infill, the LED strip cannot be inserted. On an enclosed printer, keep the top lid or door open. Trapped heat makes overhangs look bad and can fuse supports to the leaf.

### Stem filament calibration
- The included 3MF file already contains calibrated filament settings, but these may not suit every printer.
- For Bambu Lab and Polymaker PLA Matte Dark Green, flow ratio was raised from 0.98 to 1.10 (deliberate over-extrusion for strength), and bed temperature was raised to 60 C for better adhesion.
- With a different filament, run a flow ratio test to find the right balance. Too much over-extrusion changes tolerances.
- If the stem snaps easily when bent with considerable force, adjust the filament settings.

## 8. Assembly Resources
- An assembly video exists, but it is outdated. Since it was recorded, a new wiring method was introduced, 4-pin connectors were reverted to 3-pin, and data lines were separated per stem.
- A new assembly video will be released with the final release. Until then the old video is for reference only.

## 9. LuxPlant Standard (Coming Soon)
- Planned to have 21 leaves.
- Planned to have thicker stems with different diameters for the branches.
- Commercial license members get a discount when it is completed.
- No release date or price has been announced.

## 10. Brand Voice Notes
- Product-focused and polished.
- The creator's personal story about filament costs can be used sparingly as background, not as the main message.

## 11. Not Yet Decided or Unknown
- Standard release date and price
- Whether the delivery fee is flat and whether delivery covers all of the Philippines
- Whether the $5 STL purchase is definitively lifetime
- Print and assembly time for self-builders
- BOM details: currency of the prices, prices for the fuses, DC jack, push button, JST connectors, resistor, capacitor, and plug-and-play controller, the resistor quantity (the sheet's note says "3 for each data line" and the quantity cell is blank), filament grams per printed part, and the unit of the stem wiring lengths
- Product photos and demo video (a short demo video exists but is not included here)
- Pages and site structure (to be decided by the site owner)

<!-- END:nextjs-agent-rules -->
