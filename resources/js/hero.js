import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// Where the shield sits inside the 246x78 monogram lockup (from its viewBox).
const SHIELD_CENTER_X = 0.5007
const SHIELD_CENTER_Y = 0.2885
const SHIELD_HEIGHT = 0.577

export function initHero() {
    const stage = document.querySelector('[data-hero-stage]')
    if (!stage) return

    const section = document.querySelector('[data-hero]')

    const header = document.querySelector('[data-site-header]')
    const headerLogo = header?.querySelector('[data-header-logo]')
    const sideItems = header?.querySelectorAll('[data-header-side]')
    const logo = stage.querySelector('[data-hero-logo]')
    const headings = stage.querySelector('[data-hero-headings]')

    if (!header || !headerLogo || !logo) return

    // Base state: the travelling shield is centred in the viewport.
    gsap.set(logo, { xPercent: -50, yPercent: -50 })

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

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

    // Intro: after a 0.1s hold, the shield eases in centred over 2s.
    gsap.fromTo(
        logo,
        { opacity: 0 },
        { opacity: 1, duration: 2, ease: 'sine.inOut', delay: 0.1 },
    )

    // Scroll-driven starting states. Set y:0 so GSAP owns the vertical transform
    // outright and does not inherit the CSS translateY(-100%) as an extra offset.
    gsap.set(header, { y: 0, yPercent: -100 })
    gsap.set(sideItems, { opacity: 0 })
    gsap.set(headerLogo, { opacity: 0 })
    gsap.set(headings, { opacity: 0, y: 60 })

    // The shield's docked target, derived from the header logo's size (transform-independent).
    let target = { x: 0, y: 0, scale: 1 }

    const computeTarget = () => {
        const headerH = header.offsetHeight
        const logoW = headerLogo.offsetWidth
        const logoH = headerLogo.offsetHeight
        const targetCenterX = window.innerWidth / 2 + logoW * (SHIELD_CENTER_X - 0.5)
        const targetCenterY = headerH / 2 + logoH * (SHIELD_CENTER_Y - 0.5)
        const targetHeight = logoH * SHIELD_HEIGHT
        const startHeight = logo.offsetHeight

        target = {
            x: targetCenterX - window.innerWidth / 2,
            y: targetCenterY - window.innerHeight / 2,
            scale: targetHeight / startHeight,
        }
    }

    computeTarget()
    ScrollTrigger.addEventListener('refreshInit', computeTarget)

    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: stage,
            start: 'top top',
            end: '+=320%',
            scrub: true,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
        },
    })

    tl.to(header, { yPercent: 0, ease: 'none', duration: 0.5 }, 0)
        .to(
            logo,
            {
                x: () => target.x,
                y: () => target.y,
                scale: () => target.scale,
                ease: 'none',
                duration: 0.85,
            },
            0,
        )
        .to(sideItems, { opacity: 1, ease: 'none', duration: 0.25 }, 0.6)
        .to(headerLogo, { opacity: 1, ease: 'none', duration: 0.15 }, 0.85)
        .to(logo, { opacity: 0, ease: 'none', duration: 0.15 }, 0.85)
        // Hold on the resolved nav (logo in at 1.0) before the heading arrives, so
        // there is a beat of redundant scroll between the two. The heading then rises
        // in from below as the closing beat.
        .to(headings, { opacity: 1, y: 0, ease: 'power2.out', duration: 0.3 }, 1.25)

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
}
