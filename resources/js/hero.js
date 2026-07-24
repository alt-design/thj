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

    // The stage starts on a black background with the video hidden. Fade the
    // video in once it has buffered enough to play, so the load reads as an
    // intentional black hold rather than an empty frame while it downloads.
    const video = stage.querySelector('[data-hero-video]')

    if (video) {
        const revealVideo = () =>
            gsap.to(video, { opacity: 1, duration: 1, ease: 'sine.inOut' })

        if (video.readyState >= 3) {
            revealVideo()
        } else {
            video.addEventListener('canplay', revealVideo, { once: true })
        }
    }

    const section = document.querySelector('[data-hero]')

    const header = document.querySelector('[data-site-header]')
    const headerLogo = header?.querySelector('[data-header-logo]')
    const headerShield = header?.querySelector('[data-header-shield]')
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
        gsap.set(headerShield, { opacity: 1 })
        gsap.set(headings, { opacity: 1, y: 0 })
        gsap.set(logo, { opacity: 0 })
        return
    }

    // Starting states. The header sits in place from load; its bar is transparent
    // over the video, so only the nav links and monogram show as they fade in. Set
    // y:0 so GSAP owns the vertical transform outright and does not inherit the CSS
    // translateY(-100%) as an extra offset.
    gsap.set(header, { y: 0, yPercent: 0 })
    gsap.set(sideItems, { opacity: 0 })
    gsap.set(headerLogo, { opacity: 0 })
    gsap.set(headerShield, { opacity: 0 })
    gsap.set(headings, { opacity: 0, y: 60 })

    // Intro: after a 0.1s hold, the centre shield and the header nav (links plus
    // wordmark) ease in together over 2s.
    const introFade = () => ({ opacity: 1, duration: 2, ease: 'sine.inOut', delay: 0.1 })
    gsap.fromTo(logo, { opacity: 0 }, introFade())
    gsap.fromTo([...sideItems, headerLogo], { opacity: 0 }, introFade())

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

    // Pin budget, in viewport heights. The shield travels and docks across
    // PIN_TRAVEL; PIN_TAIL is the short pinned run after the dock that lets the
    // heading beat play and hold before the hero unpins. Only the travel is
    // scrubbed, so a trailing spacer of length PIN_TAIL holds the timeline open for
    // the tail. PIN_TRAVEL is how much scroll the shield takes to reach the header:
    // shorten it to bring the icon in sooner, at the cost of the drawn-out travel.
    const PIN_TRAVEL = 0.45
    const PIN_TAIL = 0.35
    const TL_END = PIN_TRAVEL + PIN_TAIL

    // The headings rise a beat after the dock, leaving the rest of the tail as a
    // brief hold before the pin releases.
    const HEADINGS_START = PIN_TRAVEL + 0.15

    // The dock cross-fade and heading rise are fired once, forward-only, from the
    // scroll progress instead of being tweened by the scrubbed timeline. As one-shot
    // tweens they cannot play backwards, so they stay settled when scrolling back up.
    let docked = false
    let headingsIn = false

    const dock = () => {
        if (docked) return
        docked = true
        // The travelling shield fades out as the header's own shield (the full
        // lockup overlaid on the wordmark) fades in, so it reads as settling in.
        gsap.to(logo, { opacity: 0, duration: 0.25, ease: 'sine.out', overwrite: 'auto' })
        gsap.to(headerShield, { opacity: 1, duration: 0.25, ease: 'sine.out' })
    }

    const raiseHeadings = () => {
        if (headingsIn) return
        headingsIn = true
        gsap.to(headings, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' })
    }

    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: stage,
            start: 'top top',
            end: `+=${TL_END * 100}%`,
            scrub: true,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
                if (self.progress >= PIN_TRAVEL / TL_END) dock()
                if (self.progress >= HEADINGS_START / TL_END) raiseHeadings()
            },
        },
    })

    tl.to(
        logo,
        {
            x: () => target.x,
            y: () => target.y,
            scale: () => target.scale,
            ease: 'none',
            duration: PIN_TRAVEL,
        },
        0,
    ).to({}, { duration: PIN_TAIL }, PIN_TRAVEL)

    // Stage B: the nav stays transparent for as long as the video is on screen and
    // only resolves to the solid white strip as the last of it passes under the
    // header. One value, --nav-t, drives both background layers plus the text and
    // logo colour (see site.css). Scrubbed, so it reverses on scroll up.
    //
    // The fade is timed off the video's bottom edge rather than the viewport: it
    // runs over NAV_FADE px and finishes NAV_CLEARANCE px before that edge reaches
    // the underside of the header, so the nav is never white text on white page.
    const NAV_FADE = 300
    const NAV_CLEARANCE = 40

    const navHeight = () =>
        parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 0

    const nav = { t: 0 }

    gsap.to(nav, {
        t: 1,
        ease: 'none',
        scrollTrigger: {
            trigger: section,
            start: () => `bottom top+=${navHeight() + NAV_CLEARANCE + NAV_FADE}`,
            end: () => `bottom top+=${navHeight() + NAV_CLEARANCE}`,
            scrub: true,
            invalidateOnRefresh: true,
        },
        onUpdate: () => header.style.setProperty('--nav-t', nav.t),
    })
}
