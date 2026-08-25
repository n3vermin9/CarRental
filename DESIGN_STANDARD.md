# CarShare Apple Design Standard

This project uses the `apple-design` rules from [emilkowalski/skills](https://github.com/emilkowalski/skills/tree/main/skills/apple-design) as its default product-design standard.

## Required principles

- Design for purpose, agency, familiarity, flexibility, simplicity, craft, responsibility, and delight.
- Show feedback immediately on press. Interactive targets must be at least 44 × 44 points.
- Use interruptible, critically damped springs for touch-driven movement. Reserve bounce for momentum gestures.
- Preserve spatial consistency: detail views enter and leave along the same path and controls originate near what they affect.
- Use Apple system typography with size-specific tracking and leading. Layout must tolerate larger text.
- Use iOS semantic dark colors, restrained blue accents, grouped surfaces, and translucent material only for floating chrome.
- Keep the primary action visually dominant. Use direct labels and avoid ornamental UI that has no purpose.
- Support `prefers-reduced-motion`, `prefers-reduced-transparency`, and `prefers-contrast` in every new surface.
- Animate compositor-friendly properties only and never block interaction while an animation is running.

## Project tokens

- Background: `#000000`
- Primary surface: `#1C1C1E`
- Raised surface: `#2C2C2E`
- Accent: iOS blue `#0A84FF`
- Success: iOS green `#30D158`
- Destructive: iOS red `#FF453A`
- Corners: 14–24px depending on surface hierarchy
- Default spring: no bounce, 0.3–0.4s response

`app/apple-theme.css` is the authoritative UI layer. New product UI should extend its tokens and conventions rather than introduce a separate visual language.
