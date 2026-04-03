# Engineering Precision: The Design System Manual

## 1. Overview & Creative North Star
The Creative North Star for this design system is **"The Kinetic Blueprint."** 

Unlike consumer e-commerce which focuses on soft approachability, this system is built for the high-stakes world of CNC machining. It treats the UI as a precision instrument—a digital manifestation of a high-end workshop. We move beyond the "template" look by utilizing **Mechanical Asymmetry**: using the 0px radius constraint not as a limitation, but as a deliberate architectural choice. Elements should feel machined, interlocking like modular engine components. We utilize high-contrast typography scales and overlapping technical layers to convey authority, moving away from flat "web boxes" toward a sophisticated, multi-dimensional CAD environment.

---

## 2. Colors & Surface Logic
The palette is rooted in the industrial reality of tool-grade steel and late-night precision engineering.

### The Palette
- **Core Atmosphere:** `surface` (#131313) and `surface_container_lowest` (#0E0E0E) provide the "Matte Black" depth.
- **The Electric Accents:** `primary` (#ADC7FF) acts as our high-voltage "Electric Blue," while `secondary` (#FFB596) serves as the "Neon Orange" signal for critical actions and mechanical warnings.
- **Tonal Neutrals:** `tertiary` (#C8C6C5) and `outline` (#8B90A0) mimic the appearance of brushed aluminum and gunmetal.

### The "No-Line" Rule
Prohibit the use of 1px solid, high-opacity borders for general sectioning. In this system, boundaries are defined by **Mass and Tone**. 
- To separate a sidebar from a main feed, transition from `surface` to `surface_container_low`. 
- Structural definition comes from the shift in hex value, not a stroke. This ensures the UI feels "carved" rather than "drawn."

### Surface Hierarchy & Nesting
Treat the interface as a physical assembly. 
- **Base Layer:** `surface` (#131313).
- **Sub-Assembly:** `surface_container` (#201F1F) for major content blocks.
- **Component Housing:** `surface_container_high` (#2A2A2A) for nested cards or technical readouts.
- **The "Glass & Gradient" Rule:** For high-end product showcases, use a 40% opacity `surface_bright` with a 20px backdrop-blur. Apply a subtle 45-degree linear gradient from `primary` to `primary_container` on CTA backgrounds to simulate the sheen of anodized metal.

---

## 3. Typography: Technical Authority
We employ a dual-typeface system to balance "Engineering Data" with "Executive Professionalism."

- **The Display Scale (Space Grotesk):** Used for `display-lg` through `headline-sm`. This is our "Technical Sans." Its geometric quirks mirror the precision of CNC toolpaths. Use `display-lg` (3.5rem) sparingly for hero product specs to create an editorial, high-contrast impact.
- **The Functional Scale (Inter):** Used for `title-lg` down to `body-sm`. Inter provides the "Trustworthy" legibility required for complex technical documentation, SKU numbers, and shipping manifests.
- **The Label Scale:** Always `label-md` or `label-sm` in **Space Grotesk**. This is used for data points, "In Stock" status, and micro-copy, reinforcing the high-tech, blueprint aesthetic.

---

## 4. Elevation & Depth: Tonal Layering
Traditional drop shadows are forbidden. We communicate depth through **Material Density.**

- **The Layering Principle:** Instead of a shadow, "lift" a component by placing a `surface_container_highest` (#353534) element atop a `surface_dim` (#131313) background. This mimics the way light hits a machined part.
- **Ambient Glows:** When a "floating" effect is required (e.g., a critical error modal), use a glow rather than a shadow. Use `secondary` (#FFB596) at 5% opacity with a 40px blur to simulate an illuminated status light on a control panel.
- **The "Ghost Border" Fallback:** If a border is required for input field definition, use `outline_variant` (#414754) at **15% opacity**. It should be felt, not seen—a "ghost line" that guides the eye without cluttering the technical grid.

---

## 5. Components

### Buttons (The Actuators)
- **Primary:** Sharp 0px corners. Background: `primary_container`. Text: `on_primary_container`. For "Add to Quote" or "Purchase."
- **Secondary:** Sharp 0px corners. Border: 1px "Ghost Border" of `primary`. Text: `primary`. 
- **Tertiary:** Text only in `label-md` (Space Grotesk). Used for "View Technical Specs."

### Input Fields (The Data Ports)
- **Styling:** `surface_container_lowest` background. 0px radius. 1px bottom-border only using `outline_variant` at 20% opacity. 
- **Focus State:** Bottom border transitions to `primary` (#ADC7FF) 100% opacity.

### Chips (Status Indicators)
- **Selection Chips:** Rectangle only. No rounded ends. 
- **Logic:** Use `on_secondary_container` for "Urgent/Backordered" and `primary_fixed` for "In-Stock."

### Cards & Lists (The Assembly)
- **Rule:** Forbid divider lines between list items. Use a 1.3rem (`spacing.6`) vertical gap. 
- **Hover State:** Entire card background shifts from `surface_container` to `surface_container_highest`.

### Custom Components: "The Technical Spec-Sheet"
A bespoke component for B2B CNC parts: a split-pane view where the left side is a `surface_container_lowest` 3D model viewer and the right is a `surface` editorial spec list using `label-sm` for all technical metadata.

---

## 6. Do’s and Don’ts

### Do:
- **Use "Extreme Spacing":** Utilize `spacing.20` (4.5rem) and `spacing.24` (5.5rem) to create editorial breathing room between large product categories.
- **Embrace the Sharp Edge:** Every corner must be `0px`. No exceptions. This reinforces the "Industrial" tone.
- **Use Technical Overlays:** Layer `label-sm` text (e.g., "PART NO. 882-X") over product images in the top-right corner to simulate a blueprint.

### Don’t:
- **Don't use Grey Shadows:** Never use a generic #000000 shadow. If you must use a shadow, tint it with `primary` or `surface_tint`.
- **Don't use Playful Language:** Avoid "Got it!" or "Oops!" Use "Confirmed" or "System Error: Invalid SKU."
- **Don't break the Grid:** Every element must align to the 1px `spacing.px` baseline. Precision is our primary brand value.