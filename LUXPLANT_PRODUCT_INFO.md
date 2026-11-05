# LuxPlant: Product Information

This document contains known information about LuxPlant and its website. Anything still unknown or not implemented is marked accordingly.

## 1. What LuxPlant Is

LuxPlant is a 3D-printed, LED-lit artificial plant. Each leaf is printed in light-diffusing filament and lit from the inside by addressable RGB LEDs, so the plant can glow in any color and run animated light effects. LuxPlant is focused on selling fully built units and no longer sells STL files.

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

## 4. No Longer Offered: STL Files and Memberships

LuxPlant no longer sells STL files or commercial licenses/memberships. The current focus is on selling fully built LuxPlant products.

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
- No release date or price has been announced.

## 10. Brand Voice Notes

- Product-focused and polished.
- The creator's personal story about filament costs can be used sparingly as background, not as the main message.

## 11. Website and Ordering Notes

### Current storefront flow

The website's intended purchase flow is product page → cart drawer → checkout → payment or order confirmation.

- Customers can add LuxPlant Mini to the cart, adjust quantity, and proceed to checkout.
- Customers can check out while signed in or as a guest. Signed-in customers have their contact details prefilled.
- Checkout offers cash on delivery, bank transfer, PayPal, and GCash.
- Bank transfer is made to the creator's MariBank account. Customers can transfer from other Philippine banks through InstaPay.
- For COD, the intended flow asks the customer for a phone number and OTP before confirming the order.
- For bank transfer, PayPal, and GCash, the intended flow displays the appropriate QR and asks the customer to upload payment proof for review.

### Implementation status

The following are current website implementation details, not statements that these actions are operational:

- Cart and checkout screens are present, but checkout does not yet create or submit a real order.
- The COD phone and OTP fields on `/pay?method=cash-on-delivery` are UI only. SMS delivery and OTP verification are not connected.
- QR images are displayed for MariBank bank transfer, PayPal, and GCash. Payment proof upload and review are not connected.
- `/pay` and `/pay/complete` currently use example order information. The payment-complete page is not connected to a submitted order or a real verification result.

## 12. Not Yet Decided or Unknown

- LuxPlant Standard release date and price
- Whether the delivery fee is flat and whether delivery covers all of the Philippines
- Print and assembly time for self-builders
- BOM details: currency of the prices, prices for the fuses, DC jack, push button, JST connectors, resistor, capacitor, and plug-and-play controller, the resistor quantity (the sheet's note says "3 for each data line" and the quantity cell is blank), filament grams per printed part, and the unit of the stem wiring lengths
- Exact setup and go-live date for SMS OTP and payment verification
