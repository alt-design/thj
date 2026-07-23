import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

// Diamond texture size (px) when the footer first enters view, before it zooms
// out to the resting 40px as you scroll down.
const START_SIZE = 44
const REST_SIZE = 40

export function initFooter() {
    const band = document.querySelector('[data-footer-pattern]')
    if (!band) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return // the 40px inline default already renders the resting texture

    gsap.fromTo(
        band,
        { '--footer-pattern-size': `${START_SIZE}px` },
        {
            '--footer-pattern-size': `${REST_SIZE}px`,
            ease: 'none',
            scrollTrigger: {
                trigger: band,
                start: 'top bottom',
                end: 'bottom bottom',
                scrub: true,
                invalidateOnRefresh: true,
            },
        },
    )
}
