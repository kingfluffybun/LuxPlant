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

<!-- END:nextjs-agent-rules -->
