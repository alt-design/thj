# Tom Hartley Jnr, website spec

Living specification and decision log for the Tom Hartley Jnr website rebuild. Other agents should read this before working on the project and update it whenever a decision changes. Keep it current.

Last updated: 2026-07-24.

## 1. Overview

Tom Hartley Jnr is a dealer at the highest end of the classic and performance car market. This project is a refresh of their existing WordPress site, rebuilt on the Alt studio stack. The first deliverable is a single landing page (the homepage) built from a Figma design.

Design source: Figma file `Tom_Hartley_Jnr_Website_Design_KF`, frame `THJ_Homepage_OPT1` (node `24:348`). A full page PNG export lives at `homepage.png` in the project root. There is blank space below the design in that export that can be ignored.

The Figma contains two directions, `THJ_Homepage_OPT1` and `THJ_Homepage_OPT2`, plus a few working iterations of OPT1. **OPT1 is the confirmed direction.** OPT2 (a different hero, split screen stock blocks, and a fuller newsletter form with address) is not being built. Every frame in the file is 1512px desktop. There are no mobile or tablet frames and no designed open state for the header "menu" trigger.

### Goal for this phase

Build a static, correctly structured skeleton of the homepage. No animation yet, no interactivity wired up, but the markup, content model, and asset pipeline should be shaped so that animation (GSAP) and interactivity (Livewire) drop in cleanly later.

## 2. Stack

| Layer | Choice | Notes |
|-------|--------|-------|
| CMS | Statamic 6 (flat file) | Fresh `statamic/statamic` install |
| Framework | Laravel 13 | Comes with Statamic |
| PHP | 8.4 | Local toolchain confirmed |
| Templating | Antlers | Matches Alt house style. Not Blade. |
| Interactivity | Livewire | Installed for later use. Not used in this phase. |
| Styling | Tailwind 4 | CSS first config via `@theme`, no `tailwind.config.js` |
| Animation | GSAP | Single animation library for the whole site. Deferred to a later phase. |
| Build | Vite | Same pattern as the reference project |

### Alt packages to add

Match the reference project (`Sites/Grey-Matter-Uk`): `alt-design/alt-seo`, `alt-design/alt-sitemap`, `alt-design/alt-cookies`, `alt-design/alt-redirect`.

## 3. Reference project

`Sites/Grey-Matter-Uk` is a completed Alt Statamic build used as a **read only** pattern reference. Do not copy content from it. It demonstrates the conventions we follow: Antlers templates, a page builder made of "sets" where each block maps to one partial in `resources/views/sets/`, collection backed listings, and the Vite plus Tailwind asset setup. Note that the reference uses Tailwind 3 and has no Livewire, so those two areas diverge here.

## 4. Key decisions

Recorded so future agents understand the reasoning, not just the outcome.

1. **Antlers first, Livewire as islands.** The page is a Statamic Antlers template. The homepage is largely static content with heavy scroll animation, which is a frontend (GSAP) concern, not a server reactivity concern. Livewire is installed so interactive islands (starting with the newsletter signup) can be added later without a re-architecture, but nothing uses it in this phase.
2. **Content is editable via a page builder.** The homepage content lives in a `home` entry using a Bard or Replicator field made of typed blocks (sets). Each set maps to one Antlers partial. This matches the reference and lets the client manage the page.
3. **Card data comes from collections, not retyped into blocks.** Cars, journal articles, and testimonials each live in their own collection. The builder sets select from or list those collections. This avoids duplicating data and keeps the blocks light.
4. **Tailwind 4.** Fresh build, so we take the current major and its CSS first config rather than matching the reference's older v3 setup.
5. **GSAP over a dedicated carousel library.** The design has multiple carousels and sliders. Rather than pull in Glide (as the reference does), we will drive them with GSAP so the animation stack stays a single library. Carousel markup is built now, motion is wired later.
6. **Fonts: reuse the existing licensed MyFonts Avenir kit.** See section 7.
7. **Responsive built now at our own judgement.** No mobile design exists, so we build sensible responsive layouts (stacking columns, fluid type) for mobile and tablet during the skeleton phase. The designer refines these once mobile frames are available. Desktop stays faithful to the 1512px design.
8. **Header "menu" is a stub for now.** There is no designed open state, so we build an accessible toggle button (with `aria-expanded`) that does nothing yet. The actual menu (overlay, drawer, or other) is designed and wired in a later phase.
9. **Placeholder imagery pulled from Figma.** Car, journal, and hero stills are exported from the design and used as placeholders so the skeleton reads realistically. Real media, including the hero background video, is supplied by the client later.
10. **Standard Statamic install, default pages kept.** Use the plain `statamic/statamic` install (no third party starter kit) and leave any default starter pages it generates in place.

## 5. Content model

### Collections

Blueprints to be finalised during the build. Initial shape:

- **`stock`** (the cars). Fields: title (e.g. "1958 Ferrari 250 GT LWB California Spyder"), price (text, supports "£POA"), short description, hero image, gallery, status (current stock or previously sold), slug. Used by the `stock_grid` and `featured_stock` sets.
- **`journal`** (news and articles). Fields: title, date, excerpt, feature image, body, slug. Used by the `journal_carousel` set.
- **`testimonials`**. Fields: quote, author name, author role (e.g. "Private Investor"). Used by the `testimonials` set.

### Globals

- The **TH monogram** logo lives as a global asset or partial so it can be referenced from the header and the `collage` set without duplication.

## 6. Page structure

Two pieces frame every page and are global Antlers parts, not builder sets.

- **Header.** Sticky bar. Centred TH monogram. Left links (Current Stock, Previously Sold). Right "menu" trigger.
- **Footer.** Dark block containing the large "the best decision you'll EVER MAKE." statement, the newsletter signup (the first future Livewire island), the navigation columns, phone and email, award logos, and the "Site by Alt" copyright.

### Page builder sets

Top to bottom on the homepage. Each maps to `resources/views/sets/<handle>.antlers.html`.

| # | Handle | Description | Editable fields | Collection | Behaviour (later phase) |
|---|--------|-------------|-----------------|------------|-------------------------|
| 1 | `hero` | Full bleed background video (design uses a 3840x2160 clip) with a centred display heading in two lines | heading 1, heading 2, background video or image | none | Video background |
| 2 | `stock_grid` | "Current Stock" title, intro line, "view all" link, and a row of car cards (image, title, price, blurb, link) | title, intro, link, source toggle (select specific stock, or show all recent first) | `stock` | Carousel, autoscroll, images fade in |
| 3 | `featured_stock` | Large image on the left, dark detail panel on the right ("Previously Sold" label, title, description, "view" link) | select from stock (current and previously sold) | `stock` | Slider, no autoscroll, image fades in |
| 4 | `collage` | Image collage with the large TH monogram (global) and the "over 25 years of experience..." brand statement plus an "about us" link | text, images, link | none | Image animation |
| 5 | `testimonials` | Large quote over a full bleed background image, with author name and role | select testimonials, background image | `testimonials` | Slider |
| 6 | `journal_carousel` | "Journal" title, "view all" link, and a row of four latest journal cards (image, date, title) | title, source toggle (select entries, or show all recent first) | `journal` | Carousel, autoscroll |

## 7. Fonts

The whole design is set in **Avenir** (weights 400, 500, 700, 900). This is a licensed self hosted **MyFonts (Monotype) webfont kit**, kit id `372eb5`. The licence is held and confirmed as usable for this site.

Files are in the project `fonts/` folder (`woff2` only, which is sufficient for all modern browsers):

The filenames give no clue to their weight, so each was mapped from the font's own internal name (`name` table), not from the file order:

| File | Face | `font-weight` | Role |
|------|------|---------------|------|
| `372EB5_2_0.woff2` | AvenirLTStd-Book | 400 | body copy |
| `372EB5_1_0.woff2` | AvenirLTStd-Medium | 500 | medium (quotes, labels) |
| `372EB5_0_0.woff2` | AvenirLTStd-Heavy | 700 | bold |
| `372EB5_3_0.woff2` | AvenirLTStd-Black | 900 | hero and display headings |

Setup plan:

1. Move the `woff2` files into the Vite asset pipeline (final location decided at build time, likely `resources/fonts/`).
2. Write a modern `@font-face` block (one `Avenir` family, four weights, `font-display: swap`). Drop the legacy `.eot`, `.svg`, `.ttf`, and `.woff` formats from the old CSS.
3. Expose Avenir through the Tailwind 4 `@theme` so `font-sans` resolves to it.
4. Keep the MyFonts counter beacon (`@import url(//hello.myfonts.net/count/372eb5);`) for licence compliance. It is a tracking pixel, not a font source.

These four files are the complete kit (MyFonts only ships these weights), so nothing further is needed. Sampling the design, the visible weights are Roman (400) for body, Medium (500) for quotes, and Heavy (the top weight) for headings, labels, and nav.

The old **icomoon** icon font is **not** carried over. Fresh build uses inline SVG for icons instead (lighter, sharper, easier to animate).

## 8. Design tokens

No formal token set was provided. Colours, spacing, and type scale are taken from the Figma as the build proceeds and seeded into the Tailwind 4 `@theme`. Confirmed type sizes so far: hero display around 47px (line 2) and 34px (line 1), body and quotes around 26px.

## 9. Scope

### In scope for this phase (the skeleton)

- Fresh Statamic install with the Alt packages, Vite, Tailwind 4, and Livewire present.
- Avenir font pipeline wired up.
- The `home` entry and page builder with all six sets, rendering static markup that matches the design.
- The `stock`, `journal`, and `testimonials` collections with initial blueprints and enough placeholder entries to populate the homepage.
- Header and footer parts. The header "menu" is an accessible toggle stub with no panel yet.
- Carousels and sliders built as correct markup (a track wrapping slides) but not yet moving.
- Sensible responsive layouts for mobile and tablet, built at our own judgement.
- Placeholder imagery exported from the Figma, with a still standing in for the hero video.
- Default Statamic starter pages left in place.

### Deferred to later phases

- All animation (GSAP): hero video behaviour, fade ins, the carousel and slider motion, collage image animation.
- The newsletter signup as a working Livewire component.
- The header "menu" open state (overlay, drawer, or other), once designed.
- Real content and media (the hero background video, car imagery, journal articles) supplied by the client.
- Refinement of the responsive layouts once the designer supplies mobile and tablet frames.

## 10. Resolved questions

Recorded so the reasoning is not relitigated.

- **Design direction:** OPT1 (the linked frame). OPT2 is not being built.
- **Responsive:** built now at our own judgement, refined later from designer mobile frames.
- **Header menu:** stubbed as an accessible toggle for now, designed later.
- **Placeholders:** stills exported from the Figma, hero video stands in as a still.
- **Statamic install:** standard `statamic/statamic`, default pages kept.
- **Fonts:** complete Avenir kit is in hand, nothing further needed.

## 11. Still needed from the client or designer

Not blockers for the skeleton, but required before launch.

- Mobile and tablet designs, to refine the responsive layouts.
- The header "menu" open state design.
- Real media: the hero background video, car imagery, and journal content.
- Confirmation the MyFonts licence covers the new site and domain (see section 7).

## 12. Build notes and decisions taken during the skeleton

Recorded during the homepage skeleton build (2026-07-22). These resolve points where the plan or spec did not match the Figma, or where a judgement call was needed.

### Deviations from the plan or spec, made to match the Figma

- **Footer is a white card, not a dark block.** Section 6 described the footer as a "dark block". The Figma actually shows a dark patterned band carrying the white "Tom Hartley Jnr" logo, with a white rounded card below holding all the footer content in black text. Built to match the Figma. The faint diamond/argyle texture on the dark band was not reproduced (a solid `#1f1f1f` band stands in); it can be added later as a background pattern.
- **Hero heading weights.** Both hero lines are Avenir Roman (weight 400), not heavy. Line 1 is 34px/43, line 2 is 47px/56, both uppercase white, sitting in the lower-centre of the hero. (The plan had guessed line 2 was heavy.)
- **Header is a solid white sticky bar**, not a transparent overlay. It sits above the hero in the document flow (the hero is not tucked behind it). Nav is uppercase and letter-spaced ("CURRENT STOCK", "PREVIOUSLY SOLD", "MENU" + hamburger).
- **Featured stock references the "previously sold" entry.** The plan wired the featured block to a current-stock car, but the design's panel is labelled "Previously Sold", so it points at the sold entry (with the red car image) instead.
- **MyFonts beacon loads as a `<link>` in the head**, not a CSS `@import` (Tailwind's import expansion made the CSS import position invalid, so browsers ignored it and the licence pixel never fired).
- **SEO head tag is `{{ alt_seo:meta }}`** (the tag the installed alt-seo package actually exposes), not the `{{ alt-seo:head }}` the plan assumed.
- **Collage** reproduces the Figma's overlapping cluster (node `23:7`, "Group 201" in the confirmed OPT1 frame): four images absolutely positioned to overlap at `md`+ with the large TH crown layered on top, collapsing to a simple grid on mobile. Positions, sizes, and stacking are measured from that group rather than approximated: a 1159x821 content box, with each image's `left`/`top`/`width`/`aspect-ratio` and an explicit `z-index` reproducing the design's paint order (building, man, showroom, silver car, crown, bottom to top), so the silver car correctly overlaps the man. The file also holds older OPT1 iterations (`19:280`, `21:304`) whose collage is a full-width five-image variant (adding a supercar on the far right, with a smaller crown low over the man). That variant was reviewed and **not** chosen; the confirmed four-image cluster is the built version. Reference crops for both are in `docs/reference/collage-analysis/`.

### Placeholder copy and content (replace with real content)

- **Stock card titles repeat** ("1958 Ferrari 250 GT LWB California Spyder" appears on two grid cards and the featured panel). This mirrors the Figma mockup, which reuses the same title. Real distinct stock should replace them.
- **Journal**: two entries share the title "A New Chapter for Tom Hartley Jnr" (again mirroring the Figma). Journal excerpts were left blank (the design shows none on the cards).
- **All imagery is exported from the Figma** as placeholders (`public/assets/placeholders/`). Two car stills (stock card 3, journal card 4) were reconstructed from the raw source images because their Figma frames clipped at the canvas edge. The hero uses a still standing in for the client's background video.
- **Footer "Tom Talks" and "Videos"** were split into two links; the Figma layer grouped them ambiguously as one line.
- **Award logos**: the Figma's two footer awards are the Queen's Award emblem (SVG) and "The Chartered Institute of Logistics and Transport" (raster).
- **Dead links**: header/footer navigation (`/current-stock`, `/previously-sold`, `/journal`, `/about-us`, and the footer columns) point at pages that are out of scope for this phase and will 404 until those pages are built.

### Known simplifications (deferred, per scope section 9)

- Carousels/sliders are static tracks with `data-carousel` hooks; no GSAP motion yet.
- The header "menu" is an accessible stub button with no panel.
- The newsletter signup is static markup (disabled input); it becomes a Livewire island later.

### Changes from the second feedback round (2026-07-24)

- **Avenir weights were mapped by filename order, which was wrong.** `372EB5_1_0` is Medium and `372EB5_2_0` is Book, so the kit was serving Medium as body copy and Book (the lightest face) wherever the design asks for Medium — the testimonial quote most visibly. Faces are now mapped from each font's internal name (see section 7). Body copy is a shade lighter as a result, which is the design's Roman/Book.
- **Row heights come from the Figma, not the viewport.** The featured stock ("Previously Sold") row is the design's 640px band and the testimonials panel its 778px band, rather than `100dvh`. Both ballooned on tall screens when tied to the viewport. The testimonials value is a `min-height` so a long quote grows the panel instead of clipping.
- **Current stock keeps its autoscroll.** It was briefly replaced with a track stepped by arrows in the left column, then reverted the same day at the client's request: the continuous drift is the wanted behaviour. Both stock and journal autoscroll via `initCarousel`.
- **The nav strip resolves off the video's bottom edge.** The transparent-to-white cross-fade is timed to finish just as the last of the hero video passes under the header, rather than part way up the viewport. Nav text and logo cross to ink ahead of the panel (`--nav-ink`) so they stay legible mid-fade.
- **The hero shield docks in half the scroll distance** (`PIN_TRAVEL` 0.9 → 0.45).

### Known issues, not addressed in this round

- The footer overflows horizontally below about 400px wide (page `scrollWidth` 475 against a 375 viewport), which shows a horizontal scrollbar on a phone. Pre-existing, and mobile layouts are due a pass anyway once the designer supplies mobile frames.

## 13. Animation phases

Animation (spec decision 5: GSAP is the single library) is layered onto the static skeleton in discrete phases. Each phase has its own design note and implementation plan under `docs/superpowers/`. This index records the sequence and current state so it is easy to find.

| Phase | State | Design note | Plan |
|-------|-------|-------------|------|
| Hero scroll intro (pinned video, nav roll in, shield dock) | Built | `specs/2026-07-23-hero-scroll-intro-design.md` | `plans/2026-07-23-hero-scroll-intro.md` |
| Hero heading reveal and nav solidify | Built | `specs/2026-07-23-hero-heading-reveal-and-nav-solidify-design.md` | `plans/2026-07-23-hero-heading-reveal-and-nav-solidify.md` |
| Collage layered parallax and ambient float | Designed, ready to build | `specs/2026-07-23-collage-parallax-design.md` | `plans/2026-07-23-collage-parallax.md` |

New scroll effects follow the pattern set by the hero: a small ES module under `resources/js/` exporting an `init*` function, imported and called from `resources/js/site.js`, selecting elements via `data-*` hooks, and guarding on `prefers-reduced-motion` (skip the motion, render the resting state).
