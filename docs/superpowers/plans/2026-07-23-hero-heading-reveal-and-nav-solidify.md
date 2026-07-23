# Hero Heading Reveal and Nav Solidify Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the heading reveal as the final beat of the pinned hero intro, then transition the nav from transparent to solid white as the hero scrolls away and page content rises underneath.

**Architecture:** The existing pinned GSAP timeline in `resources/js/hero.js` gets one more beat (the heading slides up from below and fades in) and a longer pin distance to fit it. The nav background is restructured into two stacked layers (a dark scrim and a solid white bar) that cross-fade, plus the nav text and centre logo colour, all driven by a single CSS variable `--nav-t` (0 = over video, 1 = solid white). A second ScrollTrigger scrubs `--nav-t` from 0 to 1 over the scroll immediately after the pin releases. The header stays `position: fixed` throughout the hero page (no swap to sticky), so the crossover is smooth and reversible.

**Tech Stack:** Statamic (Antlers templates), Tailwind CSS v4, GSAP 3.15 + ScrollTrigger, Vite.

---

## Adaptations for this plan

- **No automated tests.** This is visual, scroll-driven animation work in Antlers templates and GSAP; there is no meaningful unit-test surface. Each task ends with a **manual visual verification** step using the running site and Playwright screenshots, checked against the reference images in `docs/reference/` and the previous-phase behaviour. Treat those checks as the task's "test".
- **Running the site for verification.** In a terminal run Vite (`npm run dev`) and serve the app. This plan assumes `http://thj.test` (Herd/Valet). If that host is not available, run `php artisan serve` and use `http://127.0.0.1:8000`. Drive and screenshot with Playwright (preferred over the browser skill).
- **Commits.** This project is a git repository. Commit at the end of each task with a plain message (no AI attribution, no `Co-Authored-By` trailer), matching the existing history style.

## Prior context

The previous phase (`docs/superpowers/plans/2026-07-23-hero-scroll-intro.md`, spec `docs/superpowers/specs/2026-07-23-hero-scroll-intro-design.md`) already built: the video + overlay hero, the centred travelling shield fading in on load, the pinned header roll-in, and the shield docking into the header centre. This plan builds directly on that. The design for this phase is `docs/superpowers/specs/2026-07-23-hero-heading-reveal-and-nav-solidify-design.md`.

## Reference states

- `docs/reference/hero_start.png` — on load: video + dark overlay, centred shield, no nav.
- `docs/reference/hero_end.png` — after the intro: full header over the video.

## File structure

| File | Change | Responsibility |
| --- | --- | --- |
| `resources/js/hero.js` | Modify | Add the heading reveal beat, lengthen the pin, add the nav-solidify ScrollTrigger, keep the header fixed (drop the sticky swap), extend the reduced-motion end state. |
| `resources/views/parts/header.antlers.html` | Modify | Add the two cross-fading background layers (`[data-header-scrim]`, `[data-header-solid]`) behind the header content. |
| `resources/css/site.css` | Modify | Layer base styles; drive the layers, text and logo colour from `--nav-t` under `has-hero-header`; keep the header fixed. |

No template changes are needed for layout offsets: the header stays `fixed`, the hero is already full-viewport under it, and content after the hero flows normally below (a fixed nav overlapping the top of the page is the intended, standard behaviour).

---

### Task 1: Make the heading reveal the final beat of the pinned intro

Right now the heading is a placeholder that fades in with a tiny 20px rise partway through the timeline. This task turns it into a deliberate slide-up-from-below reveal placed at the very end of the pinned sequence, and lengthens the pin so that beat has room to breathe.

**Files:**
- Modify: `resources/js/hero.js`

- [ ] **Step 1: Give the heading a larger starting offset below its resting position**

In `resources/js/hero.js`, find the scroll-driven starting states block:

```js
    // Scroll-driven starting states. Set y:0 so GSAP owns the vertical transform
    // outright and does not inherit the CSS translateY(-100%) as an extra offset.
    gsap.set(header, { y: 0, yPercent: -100 })
    gsap.set(sideItems, { opacity: 0 })
    gsap.set(headerLogo, { opacity: 0 })
    gsap.set(headings, { opacity: 0, y: 20 })
```

Change the headings starting offset from `20` to `60`:

```js
    // Scroll-driven starting states. Set y:0 so GSAP owns the vertical transform
    // outright and does not inherit the CSS translateY(-100%) as an extra offset.
    gsap.set(header, { y: 0, yPercent: -100 })
    gsap.set(sideItems, { opacity: 0 })
    gsap.set(headerLogo, { opacity: 0 })
    gsap.set(headings, { opacity: 0, y: 60 })
```

- [ ] **Step 2: Lengthen the pin distance**

In the same file, find the timeline's ScrollTrigger config and change `end: '+=150%'` to `end: '+=220%'`:

```js
    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: stage,
            start: 'top top',
            end: '+=220%',
            scrub: true,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onLeave: () => document.body.classList.remove('has-hero-header'),
            onEnterBack: () => document.body.classList.add('has-hero-header'),
        },
    })
```

(The `onLeave`/`onEnterBack` lines are removed in Task 3; leave them for now so the page still works between tasks.)

- [ ] **Step 3: Make the heading reveal the final beat**

Find the last line of the timeline:

```js
        .to(headings, { opacity: 1, y: 0, ease: 'none', duration: 0.2 }, 0.8)
```

Replace it with a slower slide-up eased reveal that starts after the logo hand-off and runs to the end of the timeline:

```js
        .to(headings, { opacity: 1, y: 0, ease: 'power2.out', duration: 0.25 }, 0.75)
```

- [ ] **Step 4: Verify the heading reveal**

With Vite running, load the homepage (`http://thj.test`). With Playwright, scroll slowly through the pinned section.
Expected: the logo still docks and the nav still resolves as before; then, as the last beat, the heading slides up from ~60px below its resting spot and fades in. The pinned section holds longer than before (the pin now spans more scroll). No console errors.

- [ ] **Step 5: Commit**

```bash
git add resources/js/hero.js
git commit -m "Reveal hero heading as the final pinned beat"
```

- [ ] **Step 6: Checkpoint** — the pinned intro now ends on a deliberate heading reveal with room to play.

---

### Task 2: Restructure the header background into two cross-fading layers

The over-hero nav is currently a single dark gradient, which cannot tween into a solid colour. This task adds two stacked background layers behind the header content: a dark scrim (for legibility over the video) and a solid white bar (the resolved nav). No behaviour changes yet — the scrim shows over the hero exactly as the single gradient does now, and non-hero pages are untouched.

**Files:**
- Modify: `resources/views/parts/header.antlers.html`
- Modify: `resources/css/site.css`

- [ ] **Step 1: Add the two background layers to the header markup**

In `resources/views/parts/header.antlers.html`, add the two layer elements as the first children inside `<header>`, immediately before the existing inner `<div>`. Replace this opening:

```antlers
<header data-site-header class="sticky top-0 z-50 bg-paper border-b border-ink/10">
    <div class="relative flex items-center max-w-[1512px] mx-auto px-6 h-20 md:h-28">
```

with:

```antlers
<header data-site-header class="sticky top-0 z-50 bg-paper border-b border-ink/10">
    {{# Cross-fading backgrounds used only over a hero: scrim over the video, solid when resolved. #}}
    <div data-header-scrim aria-hidden="true"></div>
    <div data-header-solid aria-hidden="true"></div>

    <div class="relative flex items-center max-w-[1512px] mx-auto px-6 h-20 md:h-28">
```

Everything else in the file stays the same. The inner `<div>` is already `relative`, so it stacks above the absolutely-positioned layers.

- [ ] **Step 2: Replace the over-hero header CSS with the layered version**

In `resources/css/site.css`, replace the entire existing over-hero block (the comment and the three `body.has-hero-header ...` rules, currently the last rules in the file):

```css
/*
 * When a page opens with a hero, the global header becomes a fixed, transparent,
 * light overlay that starts hidden above the viewport. GSAP drives its entrance;
 * the initial hidden transform here prevents a flash of the paper header on load.
 */
body.has-hero-header [data-site-header] {
    position: fixed;
    inset-inline: 0;
    top: 0;
    background: linear-gradient(to bottom, rgb(0 0 0 / 0.35), transparent);
    border-color: transparent;
    transform: translateY(-100%);
}

body.has-hero-header [data-site-header] a,
body.has-hero-header [data-site-header] button {
    color: var(--color-paper);
}

body.has-hero-header [data-site-header] [data-header-logo] :is(path) {
    fill: var(--color-paper);
}
```

with:

```css
/*
 * The header's two background layers. They are inert (invisible) on normal pages,
 * where the header shows its own paper background. Over a hero they cross-fade,
 * driven by --nav-t (0 = over the video, 1 = solid white).
 */
[data-site-header] [data-header-scrim],
[data-site-header] [data-header-solid] {
    position: absolute;
    inset: 0;
    z-index: 0;
    opacity: 0;
    pointer-events: none;
}

[data-site-header] [data-header-scrim] {
    background: linear-gradient(to bottom, rgb(0 0 0 / 0.55), transparent);
}

[data-site-header] [data-header-solid] {
    background: var(--color-paper);
    border-bottom: 1px solid rgb(0 0 0 / 0.1);
}

/*
 * When a page opens with a hero, the global header becomes a fixed, transparent
 * overlay that starts hidden above the viewport. GSAP drives its entrance; the
 * initial hidden transform here prevents a flash of the paper header on load.
 * --nav-t starts at 0: scrim fully shown, solid hidden, text and logo in paper.
 */
body.has-hero-header [data-site-header] {
    --nav-t: 0;
    position: fixed;
    inset-inline: 0;
    top: 0;
    background: transparent;
    border-color: transparent;
    transform: translateY(-100%);
}

body.has-hero-header [data-site-header] [data-header-scrim] {
    opacity: calc(1 - var(--nav-t));
}

body.has-hero-header [data-site-header] [data-header-solid] {
    opacity: var(--nav-t);
}

body.has-hero-header [data-site-header] a,
body.has-hero-header [data-site-header] button {
    color: color-mix(in srgb, var(--color-paper), var(--color-ink) calc(var(--nav-t) * 100%));
}

body.has-hero-header [data-site-header] [data-header-logo] :is(path) {
    fill: color-mix(in srgb, var(--color-paper), var(--color-ink) calc(var(--nav-t) * 100%));
}
```

- [ ] **Step 3: Verify no visual change over the hero, and non-hero pages untouched**

Reload the homepage. Scroll through the pinned intro with Playwright.
Expected: identical to before this task. Over the video the nav reads with the dark scrim at the top and paper-white text/logo (because `--nav-t` is 0). The heading reveal from Task 1 still plays.
Now load a non-hero page (e.g. `/current-stock`).
Expected: the normal sticky **paper** header renders exactly as before (dark text on paper, hairline border). The two new layers are invisible there.

- [ ] **Step 4: Commit**

```bash
git add resources/views/parts/header.antlers.html resources/css/site.css
git commit -m "Split the over-hero header background into cross-fading layers"
```

- [ ] **Step 5: Checkpoint** — the header now has scrim and solid layers ready to cross-fade, with no behaviour change yet.

---

### Task 3: Solidify the nav on scroll after the pin

This adds the second ScrollTrigger that scrubs `--nav-t` from 0 to 1 as the hero scrolls away, cross-fading the layers and flipping the text and logo colour. It also drops the old instant class swap so the header stays fixed and the crossover is smooth and reversible.

**Files:**
- Modify: `resources/js/hero.js`

- [ ] **Step 1: Remove the instant class swap from the pinned timeline**

In `resources/js/hero.js`, remove the two callbacks from the pinned timeline's ScrollTrigger so the header stays fixed and `has-hero-header` remains on the body. Change:

```js
    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: stage,
            start: 'top top',
            end: '+=220%',
            scrub: true,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onLeave: () => document.body.classList.remove('has-hero-header'),
            onEnterBack: () => document.body.classList.add('has-hero-header'),
        },
    })
```

to:

```js
    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: stage,
            start: 'top top',
            end: '+=220%',
            scrub: true,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
        },
    })
```

- [ ] **Step 2: Add the nav-solidify ScrollTrigger**

The hero section wrapper is `[data-hero]` (the outer `<section>` in `resources/views/sets/hero.antlers.html`); the pin spacer extends its bottom to where the pinned sequence finishes, so anchoring to its bottom starts the crossover exactly as the hero begins to leave.

In `resources/js/hero.js`, grab the section near the top of `initHero()`, next to the other element lookups. Change:

```js
    const stage = document.querySelector('[data-hero-stage]')
    if (!stage) return
```

to:

```js
    const stage = document.querySelector('[data-hero-stage]')
    if (!stage) return

    const section = document.querySelector('[data-hero]')
```

Then, at the very end of `initHero()` (after the pinned timeline's `.to(...)` chain), append the solidify trigger:

```js
    // Stage B: as the hero scrolls away, cross-fade the nav from transparent to
    // solid white. One value, --nav-t, drives both background layers plus the
    // text and logo colour (see site.css). Scrubbed, so it reverses on scroll up.
    const nav = { t: 0 }

    gsap.to(nav, {
        t: 1,
        ease: 'none',
        scrollTrigger: {
            trigger: section,
            start: 'bottom bottom',
            end: 'bottom 30%',
            scrub: true,
            invalidateOnRefresh: true,
        },
        onUpdate: () => header.style.setProperty('--nav-t', nav.t),
    })
```

- [ ] **Step 3: Verify the crossover scrubs and reverses**

Reload the homepage with Vite running. With Playwright:
1. Scroll through the pinned intro. Expected: unchanged (logo docks, nav resolves, heading reveals), nav still transparent over the video.
2. Keep scrolling past the pin into the first content section. Expected: over that stretch the nav cross-fades to solid white, the dark scrim fades out, and the links, "Menu", and centre logo flip from paper to ink; a hairline bottom border appears. Screenshot at the end. Expected: a solid white nav with dark text over the page content.
3. Scroll back up. Expected: the crossover reverses cleanly back to transparent/paper, then the pinned intro reverses. No jump when passing the pin boundary (the header no longer swaps fixed/sticky).
4. Confirm the first content section is readable below the white nav (a fixed nav overlapping only the top of the viewport is expected).

Expected: no console errors. If the crossover feels too long or too short, adjust the solidify `end` (e.g. `'bottom 50%'` for a shorter crossover); if it starts too early or late, adjust `start`.

- [ ] **Step 4: Commit**

```bash
git add resources/js/hero.js
git commit -m "Solidify the hero nav to white on scroll"
```

- [ ] **Step 5: Checkpoint** — the nav now crosses from transparent to white as the hero leaves, and reverses.

---

### Task 4: Reduced motion and acceptance pass

**Files:**
- Modify: `resources/js/hero.js` (reduced-motion block only)

- [ ] **Step 1: Extend the reduced-motion end state to include the white nav**

In `resources/js/hero.js`, find the reduced-motion block:

```js
    if (reduce) {
        // Skip the scroll choreography: render the end state directly.
        // Zero the transform outright so the CSS translateY(-100%) can't keep the header hidden.
        gsap.set(header, { y: 0, yPercent: 0 })
        gsap.set(sideItems, { opacity: 1 })
        gsap.set(headerLogo, { opacity: 1 })
        gsap.set(headings, { opacity: 1, y: 0 })
        gsap.set(logo, { opacity: 0 })
        return
    }
```

Add a line that sets the nav fully solid, so reduced-motion users get the white nav end state:

```js
    if (reduce) {
        // Skip the scroll choreography: render the end state directly.
        // Zero the transform outright so the CSS translateY(-100%) can't keep the header hidden.
        gsap.set(header, { y: 0, yPercent: 0 })
        header.style.setProperty('--nav-t', 1)
        gsap.set(sideItems, { opacity: 1 })
        gsap.set(headerLogo, { opacity: 1 })
        gsap.set(headings, { opacity: 1, y: 0 })
        gsap.set(logo, { opacity: 0 })
        return
    }
```

- [ ] **Step 2: Verify reduced motion**

In Playwright set `page.emulateMedia({ reducedMotion: 'reduce' })`, then reload the homepage.
Expected: no pinning and no scroll hijack; the header shows immediately as a **solid white** bar with dark text and the centre logo, the heading is visible in its resting position, and the video still plays behind. The travelling shield is hidden.

- [ ] **Step 3: Verify docking alignment is unaffected**

With normal motion, at desktop widths (1440px and 1024px) scroll to the end of the pin and screenshot. Expected: the travelling shield still lands on the header's shield with no visible jump at the cross-fade (unchanged from the previous phase). Resize mid-page and confirm no drift (the triggers use `invalidateOnRefresh`).

- [ ] **Step 4: Verify no regression on non-hero pages**

Load `/current-stock` (or any page not starting with a hero). Expected: normal sticky paper header, dark text, hairline border, no pinned behaviour, no console errors.

- [ ] **Step 5: Commit**

```bash
git add resources/js/hero.js
git commit -m "Render the white nav end state under reduced motion"
```

- [ ] **Step 6: Checkpoint** — feature complete for this phase: heading reveal finale, scroll-driven nav solidify, reduced-motion safe, non-hero pages unaffected.

---

## Self-review notes

- **Spec coverage:** heading reveal as the final pinned beat (Task 1); pin release after the reveal is implicit in the pinned timeline ending on the heading beat with the lengthened `end` (Task 1); nav restructured into two cross-fading layers (Task 2); scroll-driven transparent-to-white crossover with text/logo colour flip and border, replacing the instant swap (Task 3); reduced-motion end state including the white nav (Task 4); non-hero pages unaffected (verified in Tasks 2 and 4). All spec sections map to tasks.
- **Type/name consistency:** the hooks `[data-hero]`, `[data-hero-stage]`, `[data-site-header]`, `[data-header-side]`, `[data-header-logo]`, `[data-header-scrim]`, `[data-header-solid]` and the CSS variable `--nav-t` are used identically across the template, CSS, and JS. The solidify proxy object `nav` and its `t` field are local to `initHero()` and only read in that trigger's `onUpdate`.
- **Deferred (future phases):** any hero animation beyond the heading, and the menu panel behind the "Menu" toggle.
