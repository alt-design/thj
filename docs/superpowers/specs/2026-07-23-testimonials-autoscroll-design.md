# Auto-rotating testimonials — design

## Goal

Make the testimonials section cycle through its quotes on its own. Today the section
renders a single quote (`limit="1"`) with three static pagination dots and a comment noting
that a GSAP slider is wired later. This phase wires that slider as a gentle auto-advancing
cross-fade.

## Scope

In scope:

1. Render all testimonial entries, stacked in the same box, with the first one visible.
2. Auto-advance to the next quote every ~6 seconds with a cross-fade.
3. Pause while the visitor hovers or keyboard-focuses the quote, resume when they leave.
4. Render one pagination dot per entry and keep the active dot in sync with the current quote.
5. Respect `prefers-reduced-motion`: no rotation, just the first quote shown statically.

Out of scope: clickable dots / manual navigation, the journal carousel, drag/swipe support.

## Template — `resources/views/sets/testimonials.antlers.html`

- Loop over all `entries` (drop `limit="1"`). Each quote becomes a `data-testimonial-slide`.
- Slides are absolutely positioned so they overlap in one box. The first slide renders at
  full opacity; the rest at opacity 0. The track carries a `relative` position and a
  `min-height` so the stacked (absolute) quotes do not collapse the layout, since quote
  length varies.
- Replace the three hardcoded dots with one `data-testimonial-dot` per entry, the first
  marked active. Dots stay decorative (`aria-hidden`), non-interactive.

## JS — new `resources/js/testimonials.js`, initialised from `resources/js/site.js`

- Follow the existing GSAP module pattern (`initHero`, `initCollage`).
- Bail out early if `prefers-reduced-motion: reduce` is set (leave the first slide showing),
  or if there are fewer than two slides (nothing to rotate).
- A timer advances the index every ~6s: GSAP tween the outgoing slide opacity to 0 and the
  incoming to 1, then update which dot is active.
- Pause on `mouseenter` / `focusin`; resume on `mouseleave` / `focusout`.

## Accessibility

All quotes render in the DOM (good for screen readers and SEO); rotation is visual only via
opacity. Decorative dots keep their existing `aria-hidden`.
