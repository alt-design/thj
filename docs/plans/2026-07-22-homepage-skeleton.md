# Homepage Skeleton Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a static, correctly structured Statamic skeleton of the Tom Hartley Jnr homepage (OPT1), ready for GSAP animation and Livewire interactivity to be added later.

**Architecture:** Fresh Statamic 6 (flat file) on Laravel 13. Antlers templates. The homepage is a `home` entry whose content is a Replicator page builder of six typed blocks (sets), each rendered by one Antlers partial. Car, journal, and testimonial cards come from their own collections. Header and footer are global Antlers parts. Tailwind 4 and GSAP are wired through Vite. Placeholder imagery is exported from the Figma.

**Tech Stack:** Statamic 6, Laravel 13, PHP 8.4, Antlers, Tailwind 4, Vite, GSAP (installed, unused this phase), Livewire (installed, unused this phase), Pest.

**Source of truth:** `docs/spec.md`. Read it before starting. Design is Figma file `bXIuixpAzAQ5KRgv8CKitY`, frame `THJ_Homepage_OPT1` (node `24:348`). Pull exact styles and images from the node IDs given per task using the Figma MCP (`get_design_context`, `get_screenshot`).

**Reference project (read only, do not copy content):** `/Users/lucy/Sites/Grey-Matter-Uk`. Mirror its conventions: Antlers partials in `resources/views/`, page-builder sets in `resources/views/sets/`, Vite input `resources/css/site.css` and `resources/js/site.js`.

---

## File structure

Created or modified across the plan:

- `composer.json`, `package.json`, `vite.config.js` — dependencies and build.
- `resources/css/site.css` — Tailwind 4 entry, `@theme` tokens, `@font-face` for Avenir.
- `resources/js/site.js` — JS entry (GSAP import placeholder, no animation yet).
- `resources/fonts/372EB5_*.woff2` — the four Avenir weights.
- `resources/views/layout.antlers.html` — base HTML shell.
- `resources/views/page.antlers.html` — homepage template, loops the page builder.
- `resources/views/parts/header.antlers.html`, `parts/footer.antlers.html` — global parts.
- `resources/views/sets/hero.antlers.html` and the other five set partials.
- `resources/blueprints/collections/{stock,journal,testimonials,pages}/*.yaml` — content blueprints.
- `resources/fieldsets/*.yaml` — shared field groups if needed.
- `content/collections/**` — collections and placeholder entries.
- `public/assets/placeholders/**` — placeholder imagery from Figma.
- `tests/Feature/HomepageTest.php` — render smoke test.

## Figma node map (for pulling exact styles and images)

Frame `24:348`. Sections top to bottom:

- Header: `24:632` (nav), monogram `24:639`, links `24:657` `24:658` `24:659`.
- Hero: background video rect `24:353`, heading `24:356`.
- Stock grid: label `24:355`, intro `24:376`, view all `24:391`, cards `24:397` `24:400` `24:381`, titles `24:369` `24:372` `24:371`, prices `24:373` `24:375` `24:374`.
- Featured stock: image `24:404`, dark panel `24:352`, label `24:414`, title `24:606`, view `24:418`, dots `24:408`.
- Collage: image cluster `24:605` `24:607` `24:608` `24:609`, monogram `24:610`, statement `24:357`, about us `24:415`.
- Testimonials: background `24:350`, quote mark `24:388`, quote `24:387`, name `24:389`, role `24:390`, dots `24:411`.
- Journal: label `24:358`, view all `24:394`, cards `24:598` `24:421` `24:601` `24:361`, dates `24:384` `24:385` `24:386` `24:359`, titles `24:422` `24:596` `24:597` `24:360`.
- Footer: statement `24:426`, newsletter `24:427`, nav `24:430` `24:432`, contact `24:433`, awards `24:435` `24:436`, THJ wordmark `24:613`, copyright `24:431`.

---

## Task 1: Install Statamic into the project

The working directory already holds `.idea/`, `docs/`, `fonts/`, and `homepage.png`, so `composer create-project` cannot install in place (it needs an empty target). Install into a temporary sibling, then merge in, preserving our existing files.

**Files:**
- Create: the whole Statamic app tree.
- Preserve: `docs/`, `fonts/`, `homepage.png`.

- [ ] **Step 1: Preserve existing files**

```bash
cd /Users/lucy/Sites/thj
mkdir -p _keep
mv docs fonts homepage.png _keep/
```

- [ ] **Step 2: Create the Statamic project in a temp dir**

```bash
composer create-project statamic/statamic /Users/lucy/Sites/thj-install
```

When prompted for a starter kit, choose **No / blank** (standard install). Leave any default pages it generates in place.

- [ ] **Step 3: Move the install into place and restore preserved files**

```bash
cd /Users/lucy/Sites/thj-install
# move everything including dotfiles into the project root
shopt -s dotglob
mv * /Users/lucy/Sites/thj/
shopt -u dotglob
cd /Users/lucy/Sites/thj
rmdir /Users/lucy/Sites/thj-install
mv _keep/docs _keep/fonts _keep/homepage.png .
rmdir _keep
```

- [ ] **Step 4: Verify the app boots**

Run:
```bash
cd /Users/lucy/Sites/thj
php please --version
php artisan route:list | head
```
Expected: `php please` prints a Statamic version; routes list without error.

- [ ] **Step 5: Serve and confirm the default site renders**

Run:
```bash
php please serve
```
Visit the printed URL (usually `http://127.0.0.1:8000`). Expected: the default Statamic welcome/home page renders. Stop the server with Ctrl+C.

- [ ] **Step 6: Initialise git and commit the untouched install**

```bash
git init
git add -A
git commit -m "Install Statamic"
```

> Note: `git init` here is authorised by the user ("add to git once the basic skeleton is built"). This first commit gives a clean baseline to diff the skeleton against. Do not push.

---

## Task 2: Add the Alt packages

**Files:**
- Modify: `composer.json` (via composer require).

- [ ] **Step 1: Require the four Alt packages**

```bash
composer require alt-design/alt-seo alt-design/alt-sitemap alt-design/alt-cookies alt-design/alt-redirect
```

- [ ] **Step 2: Publish config or run any package install commands if prompted**

Check each package readme output. If `alt-seo` or `alt-sitemap` provide an install command (for example `php please alt-seo:install`), run it. If none, continue.

- [ ] **Step 3: Verify packages are discovered**

Run:
```bash
php artisan about | grep -i alt || php please --version
```
Expected: no errors booting with the packages installed.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "Add Alt packages"
```

---

## Task 3: Wire up Vite and Tailwind 4

Statamic ships a Vite setup. Replace the default CSS pipeline with Tailwind 4 using the official Vite plugin (no `tailwind.config.js`, config lives in CSS).

**Files:**
- Modify: `package.json`, `vite.config.js`
- Create/Modify: `resources/css/site.css`, `resources/js/site.js`
- Modify: `resources/views/layout.antlers.html` (asset tags, in Task 5)

- [ ] **Step 1: Install front-end dependencies**

```bash
npm install
npm install -D tailwindcss @tailwindcss/vite
npm install gsap
```

- [ ] **Step 2: Configure Vite**

Set `vite.config.js` to:

```js
import { defineConfig } from 'vite'
import laravel from 'laravel-vite-plugin'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
    plugins: [
        laravel({
            input: [
                'resources/css/site.css',
                'resources/js/site.js',
            ],
            refresh: true,
        }),
        tailwindcss(),
    ],
})
```

- [ ] **Step 3: Create the CSS entry**

`resources/css/site.css`:

```css
@import 'tailwindcss';

/* Avenir @font-face and @theme tokens are added in Task 4. */
```

- [ ] **Step 4: Create the JS entry**

`resources/js/site.js`:

```js
// GSAP is installed for later animation work. No animations are wired in this phase.
import gsap from 'gsap'

window.gsap = gsap
```

- [ ] **Step 5: Verify the build compiles**

Run:
```bash
npm run build
```
Expected: Vite builds `site.css` and `site.js` into `public/build` with no errors.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "Set up Vite, Tailwind 4 and GSAP"
```

---

## Task 4: Add the Avenir font pipeline

Move the four `woff2` files into the Vite pipeline, declare one `Avenir` family, and expose it plus a starting palette through Tailwind's `@theme`.

**Files:**
- Create: `resources/fonts/372EB5_0_0.woff2` … `372EB5_3_0.woff2`
- Modify: `resources/css/site.css`

- [ ] **Step 1: Move the fonts into resources**

```bash
mkdir -p resources/fonts
mv fonts/372EB5_*.woff2 resources/fonts/
rmdir fonts 2>/dev/null || true
```

- [ ] **Step 2: Add @font-face and @theme to the CSS entry**

Replace `resources/css/site.css` with:

```css
@import 'tailwindcss';

/* MyFonts counter beacon, kept for licence compliance. Tracking pixel only. */
@import url(//hello.myfonts.net/count/372eb5);

@font-face {
    font-family: 'Avenir';
    src: url('../fonts/372EB5_1_0.woff2') format('woff2');
    font-weight: 400;
    font-style: normal;
    font-display: swap;
}

@font-face {
    font-family: 'Avenir';
    src: url('../fonts/372EB5_2_0.woff2') format('woff2');
    font-weight: 500;
    font-style: normal;
    font-display: swap;
}

@font-face {
    font-family: 'Avenir';
    src: url('../fonts/372EB5_0_0.woff2') format('woff2');
    font-weight: 700;
    font-style: normal;
    font-display: swap;
}

@font-face {
    font-family: 'Avenir';
    src: url('../fonts/372EB5_3_0.woff2') format('woff2');
    font-weight: 900;
    font-style: normal;
    font-display: swap;
}

@theme {
    --font-sans: 'Avenir', ui-sans-serif, system-ui, sans-serif;

    /* Starting palette. Refine exact values from Figma nodes during the section tasks. */
    --color-ink: #000000;
    --color-paper: #ffffff;
    --color-cream: #f5f4ef;
    --color-panel: #1a1a1a;
}
```

Note: the exact cream and dark-panel hex values must be sampled from Figma (panel `24:352`, testimonial background `24:350`, footer block `24:425`) during Tasks 10 and 11 and corrected here.

- [ ] **Step 3: Rebuild and verify no CSS errors**

Run:
```bash
npm run build
```
Expected: build succeeds and the `woff2` files are emitted to `public/build/assets`.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "Add Avenir font pipeline and theme tokens"
```

---

## Task 5: Base layout and asset tags

**Files:**
- Modify: `resources/views/layout.antlers.html`

- [ ] **Step 1: Write the base layout**

`resources/views/layout.antlers.html`:

```antlers
<!DOCTYPE html>
<html lang="{{ site:short_locale }}" class="antialiased">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    {{ alt-seo:head }}
    {{ vite src="resources/css/site.css|resources/js/site.js" }}
</head>
<body class="bg-paper font-sans text-ink">
    {{ partial:parts/header }}

    <main>
        {{ template_content }}
    </main>

    {{ partial:parts/footer }}
</body>
</html>
```

If `alt-seo` uses a different tag than `{{ alt-seo:head }}`, check the package readme (in `vendor/alt-design/alt-seo`) and use the correct tag. If unclear, temporarily replace that line with `<title>{{ title ?? site:name }}</title>` and revisit.

- [ ] **Step 2: Verify the layout renders without the partials yet**

Temporarily comment out the two `{{ partial:... }}` lines, then run `php please serve` and load the site. Expected: page renders with the Vite assets loaded (Avenir applied). Restore the partial lines afterwards. They are created in Task 9.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "Add base layout with Vite and SEO head"
```

---

## Task 6: Create collections and blueprints

Three content collections feed the homepage cards. Create each with a blueprint.

**Files:**
- Create: `content/collections/stock.yaml`, `content/collections/journal.yaml`, `content/collections/testimonials.yaml`
- Create: `resources/blueprints/collections/stock/stock.yaml`, `.../journal/journal.yaml`, `.../testimonials/testimonials.yaml`

- [ ] **Step 1: Make the collections**

```bash
php please make:collection stock
php please make:collection journal
php please make:collection testimonials
```

- [ ] **Step 2: Define the stock blueprint**

`resources/blueprints/collections/stock/stock.yaml`:

```yaml
title: Stock
tabs:
  main:
    display: Main
    sections:
      - fields:
          - handle: title
            field:
              type: text
              display: Title
              instructions: 'e.g. 1958 Ferrari 250 GT LWB California Spyder'
              validate: [required]
          - handle: price
            field:
              type: text
              display: Price
              instructions: 'Free text so POA is allowed, e.g. £POA'
          - handle: excerpt
            field:
              type: textarea
              display: Excerpt
          - handle: feature_image
            field:
              type: assets
              display: 'Feature image'
              max_files: 1
              container: assets
          - handle: status_label
            field:
              type: select
              display: Status
              options:
                current: 'Current stock'
                sold: 'Previously sold'
              default: current
```

- [ ] **Step 3: Define the journal blueprint**

`resources/blueprints/collections/journal/journal.yaml`:

```yaml
title: Journal
tabs:
  main:
    display: Main
    sections:
      - fields:
          - handle: title
            field:
              type: text
              display: Title
              validate: [required]
          - handle: date
            field:
              type: date
              display: Date
          - handle: feature_image
            field:
              type: assets
              display: 'Feature image'
              max_files: 1
              container: assets
          - handle: excerpt
            field:
              type: textarea
              display: Excerpt
```

- [ ] **Step 4: Define the testimonials blueprint**

`resources/blueprints/collections/testimonials/testimonials.yaml`:

```yaml
title: Testimonials
tabs:
  main:
    display: Main
    sections:
      - fields:
          - handle: quote
            field:
              type: textarea
              display: Quote
              validate: [required]
          - handle: author_name
            field:
              type: text
              display: 'Author name'
          - handle: author_role
            field:
              type: text
              display: 'Author role'
```

- [ ] **Step 5: Verify the collections appear in the control panel**

Run `php please serve`, log into `/cp` (create a super user first with `php please make:user` if needed). Expected: Stock, Journal, and Testimonials collections are listed and each blueprint shows its fields.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "Add stock, journal and testimonials collections"
```

---

## Task 7: Pull placeholder imagery from Figma and seed content

Populate each collection with enough entries to fill the homepage, using stills exported from the Figma.

**Files:**
- Create: `public/assets/placeholders/**` (exported images)
- Create: entries under `content/collections/stock/`, `content/collections/journal/`, `content/collections/testimonials/`

- [ ] **Step 1: Export the images from Figma**

Using the Figma MCP `get_design_context` (which returns image download URLs) on the card image nodes, download stills. Save them under `public/assets/placeholders/`. Target images and their nodes:

- Stock cards: `24:399`, `24:402`, `24:383` (three car photos). Save as `stock-1.jpg`, `stock-2.jpg`, `stock-3.jpg`.
- Featured stock: `24:406` (the red car). Save as `stock-featured.jpg`.
- Collage: `24:605`, `24:608`, `24:609` (collage photos). Save as `collage-1.jpg`, `collage-2.jpg`, `collage-3.jpg`.
- Testimonial background: `24:350`. Save as `testimonial-bg.jpg`.
- Journal cards: `24:600`, `24:421`, `24:602`, `24:362`. Save as `journal-1.jpg` … `journal-4.jpg`.
- Hero still (stands in for the video): `24:353` via `get_screenshot`. Save as `hero-still.jpg`.

If a node has no fetchable fill, use a neutral grey placeholder of the same dimensions instead and note it.

- [ ] **Step 2: Register the assets container**

Confirm an `assets` container exists (`content/assets/assets.yaml` or via `php please make:asset-container assets`) pointing at `public/assets`. If missing, create it:

```bash
php please make:asset-container assets
```
Set its disk to `public` so the placeholder folder is browsable in the CP.

- [ ] **Step 3: Seed stock entries**

Create three stock entries with the extracted copy. Example `content/collections/stock/1958-ferrari-250-gt.md`:

```yaml
---
title: '1958 Ferrari 250 GT LWB California Spyder'
price: '£POA'
excerpt: "One of just 50 LWB California Spyders ever produced and Ferrari 'Red Book' Classiche certified."
feature_image: placeholders/stock-1.jpg
status_label: current
---
```

Create two more (`1965-ferrari-275-gtb-alloy.md` with title "1965 Ferrari 275 GTB Alloy" and its excerpt "Finished in its very attractive original colour combination & Ferrari Classiche Certified", and a third using `stock-3.jpg`). Add one `status_label: sold` entry using `stock-featured.jpg` for the featured section.

- [ ] **Step 4: Seed journal entries**

Create four journal entries. Titles and dates from the design:

- `a-new-chapter-for-tom-hartley-jnr.md` — date `2026-07-06`, image `placeholders/journal-1.jpg`.
- `a-remarkable-season-of-recognition-for-tom-hartley-jnr.md` — date `2025-12-14`, image `placeholders/journal-4.jpg`.
- `introducing-private-storage-at-our-new-cotswolds-headquarters.md` — date `2026-03-19`, image `placeholders/journal-3.jpg`.
- A fourth entry, date `2026-07-06`, image `placeholders/journal-2.jpg`.

Example front matter:

```yaml
---
title: 'A New Chapter for Tom Hartley Jnr'
date: 2026-07-06
feature_image: placeholders/journal-1.jpg
excerpt: ''
---
```

- [ ] **Step 5: Seed one testimonial**

`content/collections/testimonials/dominic-shorthouse.md`:

```yaml
---
quote: 'I have bought many cars from many people over the years but since I bought my first car from Tom around 1999, I have never wanted to go anywhere else. He is clear, knowledgeable, honest, and responsive. What else do you want?'
author_name: 'Dominic Shorthouse'
author_role: 'Private Investor'
---
```

- [ ] **Step 6: Verify entries list in the control panel and images resolve**

Run `php please serve`, open each collection in `/cp`. Expected: entries show, feature images preview.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "Add placeholder imagery and seed content"
```

---

## Task 8: Build the home page builder and entry

Add a Replicator page builder to the `pages` blueprint with the six sets, then create the `home` entry.

**Files:**
- Modify: `resources/blueprints/collections/pages/page.yaml`
- Create/Modify: `content/collections/pages/home.md`
- Modify: `content/collections/pages.yaml` (route and template if needed)

- [ ] **Step 1: Add the builder field to the pages blueprint**

In `resources/blueprints/collections/pages/page.yaml`, add a `blocks` Replicator field. Each set matches the spec. Field group:

```yaml
- handle: blocks
  field:
    type: replicator
    display: 'Page builder'
    sets:
      hero:
        display: Hero
        fields:
          - handle: heading_one
            field: { type: text, display: 'Heading line 1' }
          - handle: heading_two
            field: { type: text, display: 'Heading line 2' }
          - handle: background
            field: { type: assets, display: 'Background video or image', max_files: 1, container: assets }
      stock_grid:
        display: 'Stock grid'
        fields:
          - handle: title
            field: { type: text, display: Title }
          - handle: intro
            field: { type: textarea, display: Intro }
          - handle: link
            field: { type: link, display: 'View all link' }
          - handle: source
            field:
              type: select
              display: Source
              options: { recent: 'Show all (recent first)', selected: 'Select stock' }
              default: recent
          - handle: entries
            field: { type: entries, display: 'Selected stock', collections: [stock], if: { source: 'equals selected' } }
      featured_stock:
        display: 'Featured stock'
        fields:
          - handle: entries
            field: { type: entries, display: 'Featured stock', collections: [stock] }
      collage:
        display: Collage
        fields:
          - handle: statement
            field: { type: textarea, display: Statement }
          - handle: images
            field: { type: assets, display: Images, container: assets }
          - handle: link
            field: { type: link, display: 'About us link' }
      testimonials:
        display: Testimonials
        fields:
          - handle: entries
            field: { type: entries, display: Testimonials, collections: [testimonials] }
          - handle: background
            field: { type: assets, display: 'Background image', max_files: 1, container: assets }
      journal_carousel:
        display: 'Journal carousel'
        fields:
          - handle: title
            field: { type: text, display: Title }
          - handle: source
            field:
              type: select
              display: Source
              options: { recent: 'Show all (recent first)', selected: 'Select entries' }
              default: recent
          - handle: entries
            field: { type: entries, display: 'Selected entries', collections: [journal], if: { source: 'equals selected' } }
```

- [ ] **Step 2: Set the home entry to use the page template**

Edit `content/collections/pages/home.md` front matter so it renders through our template and holds the six blocks in order:

```yaml
---
title: 'Tom Hartley Jnr'
template: page
blocks:
  - type: hero
    heading_one: 'The Art of Collecting'
    heading_two: 'Extraordinary Cars'
    background: placeholders/hero-still.jpg
  - type: stock_grid
    title: 'Current Stock'
    intro: 'We stock only the finest, hand-selected sports, classic and luxury cars.'
    source: recent
  - type: featured_stock
    entries:
      - 1958-ferrari-250-gt.md
  - type: collage
    statement: 'Over 25 years of experience dealing at the very highest end of the classic & performance car market.'
    images:
      - placeholders/collage-1.jpg
      - placeholders/collage-2.jpg
      - placeholders/collage-3.jpg
  - type: testimonials
    entries:
      - dominic-shorthouse.md
    background: placeholders/testimonial-bg.jpg
  - type: journal_carousel
    title: Journal
    source: recent
---
```

Confirm `home` is the site's root page (`content/collections/pages.yaml` route `{{ slug }}` with `home` as the mount/index, which is the Statamic default).

- [ ] **Step 3: Verify the entry saves and the builder shows in the CP**

Run `php please serve`, edit the Home entry in `/cp`. Expected: the page builder shows six blocks in order with their fields populated.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "Add homepage page builder and home entry"
```

---

## Task 9: Global parts, header and footer

Build the header (with the menu stub) and footer as Antlers parts. These are referenced by the layout from Task 5.

**Files:**
- Create: `resources/views/parts/header.antlers.html`
- Create: `resources/views/parts/footer.antlers.html`
- Create: `resources/views/parts/monogram.antlers.html` (inline SVG TH monogram)

Pull the exact monogram SVG from Figma node `24:639` (`get_design_context`) and save it in `parts/monogram.antlers.html`. Pull exact header spacing from `24:632`.

- [ ] **Step 1: Save the monogram SVG**

Export node `24:639` as SVG via the Figma MCP and place the raw `<svg>...</svg>` in `resources/views/parts/monogram.antlers.html`. Give it `class="h-16 w-auto"` and `aria-hidden="true"`.

- [ ] **Step 2: Build the header**

`resources/views/parts/header.antlers.html`:

```antlers
<header class="fixed inset-x-0 top-0 z-50 bg-paper/90 backdrop-blur">
    <div class="mx-auto flex h-28 max-w-[1512px] items-center justify-between px-6">
        <nav class="flex items-center gap-8 text-sm font-black uppercase tracking-wide">
            <a href="/current-stock">Current Stock</a>
            <a href="/previously-sold">Previously Sold</a>
        </nav>

        <a href="/" class="absolute left-1/2 -translate-x-1/2" aria-label="Tom Hartley Jnr home">
            {{ partial:parts/monogram }}
        </a>

        <button
            type="button"
            class="text-sm font-black uppercase tracking-wide"
            aria-expanded="false"
            aria-controls="site-menu"
            data-menu-toggle
        >
            Menu
        </button>
    </div>
</header>
```

The `data-menu-toggle` button is an accessible stub. No panel is wired in this phase (see spec section 9). Do not add a menu overlay.

- [ ] **Step 3: Build the footer**

`resources/views/parts/footer.antlers.html`. Include the big statement, the newsletter signup (static markup, not a working form yet), two nav columns, contact, awards, and copyright. Use the exact copy from the design:

```antlers
<footer class="bg-ink text-paper">
    <div class="mx-auto max-w-[1512px] px-6 py-20">
        <p class="max-w-2xl text-3xl font-black uppercase leading-tight">
            The best decision you&rsquo;ll ever make.
        </p>

        <div class="mt-16 grid gap-12 md:grid-cols-[1fr_auto_auto_auto]">
            <div>
                <p class="text-sm font-black uppercase tracking-wide">Sign up for our newsletter</p>
                {{# Static placeholder. Becomes a Livewire component later (spec section 9). #}}
                <div class="mt-4 flex max-w-md items-center gap-3 border-b border-paper/40 pb-2">
                    <input type="email" placeholder="Email address" class="w-full bg-transparent text-sm outline-none placeholder:text-paper/50" disabled>
                    <span aria-hidden="true">&rarr;</span>
                </div>
            </div>

            <nav class="flex flex-col gap-2 text-sm">
                <a href="#">About Us</a>
                <a href="#">Sales</a>
                <a href="#">About Tom Hartley Jnr</a>
                <a href="#">Testimonials</a>
                <a href="#">News &amp; Events</a>
                <a href="#">Tom Talks</a>
                <a href="#">Videos</a>
            </nav>

            <nav class="flex flex-col gap-2 text-sm">
                <a href="#">Selling Your Car</a>
                <a href="#">Our Services</a>
                <a href="#">Expert Advice</a>
                <a href="#">Finance</a>
                <a href="#">Private Storage Facility</a>
                <a href="#">Join the Team</a>
            </nav>

            <div class="text-sm">
                <a href="tel:+441608532500">+44 (0)1608 532500</a><br>
                <a href="mailto:info@tomhartleyjnr.com">info@tomhartleyjnr.com</a>
            </div>
        </div>

        <p class="mt-16 text-xs text-paper/60">
            &copy; Tom Hartley Jnr 2026. All rights reserved. Privacy Notice. Terms. Modern Slavery Statement. Youtube Video Disclaimer. Site by Alt.
        </p>
    </div>
</footer>
```

Pull the queens award and secondary award logos from Figma nodes `24:436` and `24:435` and add them above the copyright as `<img>` placeholders.

- [ ] **Step 4: Verify header and footer render**

Restore the two `{{ partial:... }}` lines in the layout if still commented. Run `php please serve` and load the site. Expected: header fixed at top with monogram centred, footer at the bottom with all copy.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "Add header and footer parts"
```

---

## Task 10: Section partials, hero, stock grid, featured stock

Build the first three set partials as static markup. For each, pull exact spacing, type sizes, and colours from the Figma nodes listed in the node map. Carousels are built as a track wrapping slides but do not move.

**Files:**
- Create: `resources/views/sets/hero.antlers.html`
- Create: `resources/views/sets/stock_grid.antlers.html`
- Create: `resources/views/sets/featured_stock.antlers.html`

- [ ] **Step 1: Hero partial**

`resources/views/sets/hero.antlers.html` (Figma `24:356`, background `24:353`):

```antlers
<section class="relative flex h-screen items-center justify-center overflow-hidden">
    {{ background }}
        <img src="{{ url }}" alt="" class="absolute inset-0 h-full w-full object-cover">
    {{ /background }}
    <div class="absolute inset-0 bg-ink/30"></div>

    <h1 class="relative z-10 text-center uppercase text-paper">
        <span class="block text-3xl font-normal">{{ heading_one }}</span>
        <span class="block text-5xl font-black">{{ heading_two }}</span>
    </h1>
</section>
```

The `background` asset is a still now. When the client supplies the video, this becomes a `<video autoplay muted loop playsinline>`. Leave a comment noting that.

- [ ] **Step 2: Stock grid partial**

`resources/views/sets/stock_grid.antlers.html` (Figma label `24:355`, cards `24:397`). Resolve entries from either recent or selected:

```antlers
<section class="mx-auto max-w-[1512px] px-6 py-24">
    <div class="grid gap-8 md:grid-cols-[200px_1fr]">
        <div>
            <h2 class="text-3xl font-black uppercase leading-none">{{ title }}</h2>
            <p class="mt-4 text-sm">{{ intro }}</p>
            {{ link }}<a href="{{ url }}" class="mt-4 inline-block border-b border-ink text-xs font-black uppercase">View all</a>{{ /link }}
        </div>

        {{# Carousel track. Static now, GSAP autoscroll added later. #}}
        <div class="overflow-hidden">
            <div class="flex gap-6" data-carousel="stock">
                {{ if source == 'selected' }}
                    {{ entries }}
                        {{ partial:parts/stock_card }}
                    {{ /entries }}
                {{ else }}
                    {{ collection:stock sort="date:desc" limit="6" }}
                        {{ partial:parts/stock_card }}
                    {{ /collection:stock }}
                {{ /if }}
            </div>
        </div>
    </div>
</section>
```

- [ ] **Step 3: Shared stock card partial**

Create `resources/views/parts/stock_card.antlers.html` so the grid and featured sets reuse card markup (DRY):

```antlers
<article class="w-[380px] shrink-0">
    <div class="aspect-[4/3] overflow-hidden bg-cream">
        {{ feature_image }}<img src="{{ url }}" alt="{{ title }}" class="h-full w-full object-cover">{{ /feature_image }}
    </div>
    <h3 class="mt-4 text-lg font-black uppercase leading-tight">{{ title }}</h3>
    <p class="mt-2 text-xs">{{ excerpt }}</p>
    <p class="mt-2 text-sm font-medium">{{ price }}</p>
</article>
```

- [ ] **Step 4: Featured stock partial**

`resources/views/sets/featured_stock.antlers.html` (Figma image `24:404`, panel `24:352`):

```antlers
<section class="mx-auto grid max-w-[1512px] md:grid-cols-[1fr_552px]">
    {{ entries limit="1" }}
        <div class="aspect-[3/2] overflow-hidden">
            {{ feature_image }}<img src="{{ url }}" alt="{{ title }}" class="h-full w-full object-cover">{{ /feature_image }}
        </div>
        <div class="flex flex-col justify-center bg-panel p-12 text-paper">
            <p class="text-xs font-medium uppercase tracking-wide text-paper/60">Previously sold</p>
            <h2 class="mt-4 text-2xl font-black uppercase leading-tight">{{ title }}</h2>
            <p class="mt-4 text-sm text-paper/80">{{ excerpt }}</p>
            <a href="{{ url }}" class="mt-6 inline-block border-b border-paper text-xs font-black uppercase">View</a>
        </div>
    {{ /entries }}
</section>
```

- [ ] **Step 5: Verify the three sections render**

Run `php please serve`, load the site. Expected: hero fills the viewport with the still and heading; stock grid shows three cards in a row; featured section shows the red car with the dark panel. Cross-check against Figma `get_screenshot` of `24:348`.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "Add hero, stock grid and featured stock sections"
```

---

## Task 11: Section partials, collage, testimonials, journal

**Files:**
- Create: `resources/views/sets/collage.antlers.html`
- Create: `resources/views/sets/testimonials.antlers.html`
- Create: `resources/views/sets/journal_carousel.antlers.html`
- Create: `resources/views/parts/journal_card.antlers.html`

- [ ] **Step 1: Collage partial**

`resources/views/sets/collage.antlers.html` (Figma cluster `24:605`, monogram `24:610`, statement `24:357`):

```antlers
<section class="mx-auto max-w-[1512px] px-6 py-24 text-center">
    <div class="relative mx-auto flex max-w-4xl items-center justify-center gap-6">
        {{ images }}
            <img src="{{ url }}" alt="" class="w-1/3 object-cover">
        {{ /images }}
        {{ partial:parts/monogram }}
    </div>

    <p class="mx-auto mt-16 max-w-3xl text-xl font-black uppercase leading-snug">{{ statement }}</p>
    {{ link }}<a href="{{ url }}" class="mt-6 inline-block border-b border-ink text-xs font-black uppercase">About us</a>{{ /link }}
</section>
```

The monogram overlaps the images in the design. Exact positioning is refined from `24:610` during this step. Image animation is deferred (spec section 9).

- [ ] **Step 2: Testimonials partial**

`resources/views/sets/testimonials.antlers.html` (Figma background `24:350`, quote `24:387`):

```antlers
<section class="relative overflow-hidden py-32 text-center text-paper">
    {{ background }}<img src="{{ url }}" alt="" class="absolute inset-0 h-full w-full object-cover">{{ /background }}
    <div class="absolute inset-0 bg-ink/60"></div>

    {{# Slider track. Static now, one slide shown. #}}
    <div class="relative z-10 mx-auto max-w-3xl px-6" data-carousel="testimonials">
        {{ entries limit="1" }}
            <blockquote class="text-2xl font-medium leading-relaxed">{{ quote }}</blockquote>
            <p class="mt-8 text-sm font-medium">{{ author_name }}</p>
            <p class="text-xs text-paper/70">{{ author_role }}</p>
        {{ /entries }}
    </div>
</section>
```

- [ ] **Step 3: Journal card partial**

`resources/views/parts/journal_card.antlers.html`:

```antlers
<article class="w-[358px] shrink-0">
    <div class="aspect-[3/4] overflow-hidden bg-cream">
        {{ feature_image }}<img src="{{ url }}" alt="{{ title }}" class="h-full w-full object-cover">{{ /feature_image }}
    </div>
    <p class="mt-4 text-xs text-ink/60">{{ date format="d.m.y" }}</p>
    <h3 class="mt-1 text-lg font-black uppercase leading-tight">{{ title }}</h3>
</article>
```

- [ ] **Step 4: Journal carousel partial**

`resources/views/sets/journal_carousel.antlers.html` (Figma label `24:358`, cards `24:598`):

```antlers
<section class="mx-auto max-w-[1512px] px-6 py-24">
    <div class="flex items-end justify-between">
        <h2 class="text-3xl font-black uppercase leading-none">{{ title }}</h2>
        <a href="/journal" class="border-b border-ink text-xs font-black uppercase">View all</a>
    </div>

    {{# Carousel track. Static now, GSAP autoscroll added later. #}}
    <div class="mt-10 overflow-hidden">
        <div class="flex gap-6" data-carousel="journal">
            {{ if source == 'selected' }}
                {{ entries }}
                    {{ partial:parts/journal_card }}
                {{ /entries }}
            {{ else }}
                {{ collection:journal sort="date:desc" limit="4" }}
                    {{ partial:parts/journal_card }}
                {{ /collection:journal }}
            {{ /if }}
        </div>
    </div>
</section>
```

- [ ] **Step 5: Verify all six sections now render in order**

Run `php please serve`, load the site. Expected: collage with monogram and statement, testimonial over a darkened background, journal row of four cards. Compare the full page against `get_screenshot` of `24:348`.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "Add collage, testimonials and journal sections"
```

---

## Task 12: Wire the page template to the builder

Loop the `blocks` field and render each set. This is what ties Tasks 10 and 11 to the entry.

**Files:**
- Create: `resources/views/page.antlers.html`

- [ ] **Step 1: Write the page template**

`resources/views/page.antlers.html`:

```antlers
{{ blocks }}
    {{ partial src="sets/{type}" }}
{{ /blocks }}
```

- [ ] **Step 2: Verify the homepage renders end to end from the builder**

Run `php please serve`, load `/`. Expected: all six sections render in the order defined on the Home entry, driven by the page builder (not hardcoded).

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "Wire page template to the page builder"
```

---

## Task 13: Responsive pass

Desktop is faithful to the 1512px design. Add sensible mobile and tablet behaviour at our own judgement (spec decision 7). No mobile design exists to match, so aim for clean stacking and readable type.

**Files:**
- Modify: each `resources/views/sets/*.antlers.html`, `parts/header.antlers.html`, `parts/footer.antlers.html`

- [ ] **Step 1: Header**

Below `md`, hide the left nav links and rely on the menu button. Keep the centred monogram. Reduce header height to `h-20`.

- [ ] **Step 2: Hero**

Reduce heading sizes below `md` (`text-2xl` line one, `text-4xl` line two). Keep full-height.

- [ ] **Step 3: Stock grid and journal carousel**

Below `md`, stack the intro above the track and let the track scroll horizontally with touch (`overflow-x-auto` with `snap-x`). Cards keep fixed widths.

- [ ] **Step 4: Featured stock**

Below `md`, stack image over panel (single column). Remove the fixed `552px` panel width.

- [ ] **Step 5: Collage and footer**

Collage: stack images vertically below `md`, monogram above. Footer: the four column grid collapses to one column below `md`.

- [ ] **Step 6: Verify at three widths**

Load the site and check at 375px, 768px, and 1512px. Expected: no horizontal overflow at 375px, readable type, nothing overlapping. Use browser dev tools or Playwright.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "Add responsive layouts for mobile and tablet"
```

---

## Task 14: Homepage render test

A single Pest feature test guards that the homepage boots and the builder renders the key content. This is the one place with logic worth an automated check.

**Files:**
- Create: `tests/Feature/HomepageTest.php`
- Modify: `composer.json` (add Pest if not present)

- [ ] **Step 1: Ensure Pest is installed**

```bash
composer require pestphp/pest pestphp/pest-plugin-laravel --dev --with-all-dependencies
php artisan pest:install
```
If the install prompts about overwriting `tests/`, decline overwriting existing Statamic test files.

- [ ] **Step 2: Write the failing test**

`tests/Feature/HomepageTest.php`:

```php
<?php

it('renders the homepage', function () {
    $response = $this->get('/');

    $response->assertOk();
});

it('renders the hero heading from the page builder', function () {
    $this->get('/')->assertSee('Extraordinary Cars');
});

it('renders section content from collections', function () {
    $this->get('/')
        ->assertSee('Current Stock')
        ->assertSee('Journal')
        ->assertSee('Dominic Shorthouse');
});
```

- [ ] **Step 3: Run the test and watch it pass**

Run:
```bash
./vendor/bin/pest --filter=HomepageTest
```
Expected: three tests pass. If any fail, the failure points at the section that is not rendering. Fix the relevant partial, then rerun.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "Add homepage render test"
```

---

## Task 15: Final build and skeleton commit

**Files:**
- Modify: `public/build/**` (production assets)

- [ ] **Step 1: Production build**

```bash
npm run build
```
Expected: clean build, no warnings that block output.

- [ ] **Step 2: Full smoke check**

Run `php please serve`, load `/`, scroll the full page, and compare top to bottom against `get_screenshot` of Figma `24:348`. Confirm: fonts are Avenir, all six sections present and in order, header and footer correct, no console errors.

- [ ] **Step 3: Tag the skeleton commit**

```bash
git add -A
git commit -m "Complete homepage skeleton"
```

The skeleton is now in git as requested. Do not push unless asked.

---

## Self-review notes

- Spec section 6 (six sets), section 5 (three collections), section 7 (fonts), section 9 (scope: static, responsive, menu stub, placeholders, default pages kept) are each covered by a task.
- Carousels are built as tracks with `data-carousel` hooks but no motion, matching the "static now, GSAP later" decision.
- Livewire is present from the Statamic base plus deferred; the newsletter is static markup with a comment marking the future component, matching spec section 9.
- Exact colours, spacing, monogram SVG, award logos, and card images are pulled from named Figma nodes during the relevant tasks rather than invented.
