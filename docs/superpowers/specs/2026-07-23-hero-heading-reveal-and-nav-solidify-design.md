# Hero heading reveal and nav solidify — design

## Goal

Extend the homepage hero scroll intro with two new beats that follow the existing
logo dock:

1. After the nav has resolved, the heading reveals by sliding up from below and fading in.
2. Once the heading has fully arrived, the pinned section releases and normal scrolling
   resumes. As the hero scrolls away and page content rises underneath, the nav crosses
   from its transparent over-video state to a solid white bar.

This continues the phase described in `2026-07-23-hero-scroll-intro-design.md`, whose logo
dock and nav roll in are already built. The heading in that phase was a placeholder; this
phase gives it its real reveal and adds the nav colour transition that phase deferred.

## Scope

In scope:

1. Heading reveal as the final beat of the pinned timeline (slide up from below plus fade).
2. Release of the pin once the heading reveal completes.
3. Nav transition from transparent to white, driven by scroll, over the first stretch of
   scrolling after the pin releases (the "solidify on scroll" option chosen during design).
4. Reduced motion fallback extended to cover the new end state.

Out of scope:

1. Any hero animation beyond the heading (the section is considered finished once it has
   scrolled away and the nav is white).
2. Restyling the heading copy or type scale beyond what is needed to reveal it.
3. The menu panel behind the "Menu" toggle (still a stub from the previous phase).

## The full sequence

The intro is one continuous scroll story in two stages.

### Stage A: pinned intro

The hero stage stays pinned while a scrubbed timeline plays:

1. Header rolls down from the top; the travelling shield moves up and scales into the nav
   centre. (Already built.)
2. Nav side items and the centre lockup resolve; the travelling shield fades out.
   (Already built.)
3. The heading reveals: it starts offset below its resting position (roughly 40 to 60px)
   at zero opacity, then slides up to rest and fades in. This is the last beat of the
   pinned timeline.

The pin releases once the heading reveal has completed.

### Stage B: nav solidify on scroll

When the pin releases, the hero (heading included) scrolls up and out of view while the
first page section rises underneath. Over the first stretch of that real scrolling, a
second scroll trigger scrubs the nav from transparent to white:

- The solid white background layer fades in.
- The dark scrim layer fades out.
- The nav text and the centre shield flip colour from paper to ink.
- A hairline bottom border fades in.

Scrolling back up reverses the crossover cleanly, returning the nav to its transparent
over-video state.

## Nav structure change

The current over-hero nav is a single dark gradient (a scrim for legibility over the
video). A gradient cannot tween smoothly into a solid colour, so the nav background is
restructured into two stacked layers that cross-fade:

- A scrim layer: the dark top gradient, visible over the video.
- A solid layer: the white bar, revealed as the page solidifies.

The nav content (links, centre lockup, menu toggle) sits above both layers. Its colour is
driven from a single scroll progress value so text and shield flip together with the
background, never leaving dark text on the dark video or light text on the white bar.

## Animation approach

Continue with GSAP and ScrollTrigger, matching the existing `resources/js/hero.js`.

- Stage A stays a single pinned, scrubbed timeline. The heading beat is appended after the
  existing dock and reveal beats. The pin distance (`end`) is lengthened from the current
  `+=150%` to give the heading beat room; the exact value is tuned during the build.
- Stage B is a separate scroll trigger, scrubbed over the first stretch of scrolling after
  the hero. It drives one progress value (0 transparent, 1 white) that controls the two
  background layers' opacity, the text and shield colour, and the border.
- The instant removal of the `has-hero-header` class (which currently snaps the nav to
  white and also flips it from fixed to sticky in one jump) is replaced by this scrubbed
  crossover. The header stays fixed through the handover, and the first content section is
  offset so it is not hidden behind the fixed nav as it rises.

## Reduced motion

Extend the existing fallback. With reduced motion requested, render the end state directly:
nav white with ink text and the centre lockup shown, the heading visible in its resting
position, and the video still playing. No pinning and no scrubbed crossover.

## Testing and acceptance

This is visual, scroll-driven work with no meaningful unit-test surface. Each step is
verified by running the site and comparing against the reference states with Playwright
screenshots.

- Scrolling through the pin holds the section in place while, in order, the logo docks, the
  nav resolves, and then the heading slides up from below and fades in.
- The pin releases only after the heading has fully revealed.
- As the hero scrolls away, the nav crosses from transparent to white over the first stretch
  of scrolling: solid layer in, scrim out, text and shield flipping to ink, border fading in.
- Scrolling back up reverses both the heading reveal and the nav crossover without jumps.
- No content is hidden behind the nav during the fixed-to-white handover.
- With reduced motion enabled, the end state renders directly (white nav, heading shown,
  video playing) with no pinning.
- Non-hero pages are unaffected: the normal sticky paper header still renders.
