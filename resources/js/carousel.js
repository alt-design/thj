import gsap from 'gsap'

// Continuous horizontal autoscroll for a card track, seamless looping.
// speed is the drift rate in px per second; kept slow to match the site's
// ambient motion. The loop is built by cloning the card set until the track
// overflows the viewport, then translating by exactly one set width so the
// wrap point is invisible.
const SPEED = 50

export function initCarousel(selector, { speed = SPEED } = {}) {
    const track = document.querySelector(selector)
    if (!track) return

    const viewport = track.parentElement

    // Captured once, before any cloning, so rebuilds always start clean.
    const originals = Array.from(track.children)
    if (!originals.length) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const desktop = window.matchMedia('(min-width: 768px)')

    let tween

    const build = () => {
        tween?.kill()
        gsap.set(track, { x: 0 })
        track.replaceChildren(...originals)

        // Autoscroll is desktop only. On mobile the viewport keeps its native
        // touch scroll, so leave the original card set untouched.
        if (reduce || !desktop.matches) return

        const gap = parseFloat(getComputedStyle(track).columnGap) || 0
        const setWidth = originals.reduce((sum, el) => sum + el.offsetWidth + gap, 0)

        while (track.scrollWidth < viewport.offsetWidth + setWidth) {
            originals.forEach((el) => track.appendChild(el.cloneNode(true)))
        }

        tween = gsap.to(track, {
            x: -setWidth,
            duration: setWidth / speed,
            ease: 'none',
            repeat: -1,
        })
    }

    build()

    // Let people pause to look at a card.
    track.addEventListener('mouseenter', () => tween?.pause())
    track.addEventListener('mouseleave', () => tween?.resume())

    let resizeId
    window.addEventListener('resize', () => {
        clearTimeout(resizeId)
        resizeId = setTimeout(build, 200)
    })
}
