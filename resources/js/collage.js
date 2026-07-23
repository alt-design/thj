import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

// Per-index config, keyed by the data-collage-item value (1..4).
// All px values are measured at the reference container width (REF_WIDTH) and
// scaled down proportionally on narrower desktops, so movement never outgrows
// the overscan and peeks past the overflow-hidden edge.
// parallax   = total vertical travel (px) across the scroll pass, applied +half → -half.
// driftX/Y   = ambient translation amplitude (px) each way from rest on the img.
//              Translation only — the images never rotate.
// driftDur   = base loop duration (s) for that image's ambient tween.
// driftDelay = start offset (s) so the four loops never sync up.
const CONFIG = {
    1: { parallax: 900, driftX: 5, driftY: 9, driftDur: 8,   driftDelay: 0 },
    2: { parallax: 560, driftX: 5, driftY: 8, driftDur: 9.5, driftDelay: 1.5 },
    3: { parallax: 780, driftX: 4, driftY: 7, driftDur: 7,   driftDelay: 0.7 },
    4: { parallax: 660, driftX: 5, driftY: 8, driftDur: 8.5, driftDelay: 2.2 },
}

// Width the CONFIG px values are tuned against; movement scales with the real container.
const REF_WIDTH = 1160

// Static overhang so ambient drift never exposes an edge inside overflow-hidden.
const IMG_SCALE = 1.12

export function initCollage() {
    const container = document.querySelector('[data-collage]')
    if (!container) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return // base CSS already renders the resting layout correctly

    // Keep px movement proportional to the rendered width so it stays inside the overscan.
    const scale = Math.min(1, container.clientWidth / REF_WIDTH)

    container.querySelectorAll('[data-collage-item]').forEach((wrapper) => {
        const index = parseInt(wrapper.dataset.collageItem, 10)
        const cfg = CONFIG[index]
        if (!cfg) return

        // 1. Scroll parallax on the wrapper (y only).
        const parallax = (cfg.parallax * scale) / 2
        gsap.fromTo(
            wrapper,
            { y: parallax },
            {
                y: -parallax,
                ease: 'none',
                scrollTrigger: {
                    trigger: container,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: true,
                    invalidateOnRefresh: true,
                },
            },
        )

        // 2. Ambient float on the img (x / y only), centred on rest, infinite yoyo.
        const img = wrapper.querySelector('[data-collage-img]')
        if (img) {
            gsap.set(img, { scale: IMG_SCALE, transformOrigin: '50% 50%' })
            gsap.fromTo(
                img,
                { x: -cfg.driftX * scale, y: -cfg.driftY * scale },
                {
                    x: cfg.driftX * scale,
                    y: cfg.driftY * scale,
                    duration: cfg.driftDur,
                    delay: cfg.driftDelay,
                    ease: 'sine.inOut',
                    repeat: -1,
                    yoyo: true,
                },
            )
        }
    })

    // 3. Crown: a faint float for cohesion, no parallax.
    const crown = container.querySelector('[data-collage-crown]')
    if (crown) {
        gsap.fromTo(
            crown,
            { x: -6 * scale, y: -11 * scale, rotation: -0.9 },
            {
                x: 6 * scale,
                y: 11 * scale,
                rotation: 0.9,
                duration: 9,
                delay: 1,
                ease: 'sine.inOut',
                repeat: -1,
                yoyo: true,
            },
        )
    }
}
