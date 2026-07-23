import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

// Per-index config, keyed by the data-collage-item value (1..4).
// parallax   = total vertical travel (px) across the scroll pass, applied +half → -half.
// driftX/Y   = ambient translation amplitude (px) on the img.
// driftRot   = ambient rotation amplitude (deg) on the img.
// driftDur   = base loop duration (s) for that image's ambient tween.
// driftDelay = start offset (s) so the four loops never sync up.
const CONFIG = {
    1: { parallax: 240, driftX: 6, driftY: 8, driftRot: 0.6, driftDur: 9,  driftDelay: 0 },
    2: { parallax: 140, driftX: 8, driftY: 5, driftRot: 0.8, driftDur: 11, driftDelay: 1.5 },
    3: { parallax: 200, driftX: 5, driftY: 7, driftRot: 0.5, driftDur: 8,  driftDelay: 0.7 },
    4: { parallax: 170, driftX: 7, driftY: 6, driftRot: 0.7, driftDur: 10, driftDelay: 2.2 },
}

// Static overhang so ambient drift never exposes an edge inside overflow-hidden.
const IMG_SCALE = 1.06

export function initCollage() {
    const container = document.querySelector('[data-collage]')
    if (!container) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return // base CSS already renders the resting layout correctly

    container.querySelectorAll('[data-collage-item]').forEach((wrapper) => {
        const index = parseInt(wrapper.dataset.collageItem, 10)
        const cfg = CONFIG[index]
        if (!cfg) return

        // 1. Scroll parallax on the wrapper (y only).
        gsap.fromTo(
            wrapper,
            { y: cfg.parallax / 2 },
            {
                y: -cfg.parallax / 2,
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

        // 2. Ambient float on the img (x / y / rotation), infinite yoyo.
        const img = wrapper.querySelector('[data-collage-img]')
        if (img) {
            gsap.set(img, { scale: IMG_SCALE, transformOrigin: '50% 50%' })
            gsap.to(img, {
                x: cfg.driftX,
                y: cfg.driftY,
                rotation: cfg.driftRot,
                duration: cfg.driftDur,
                delay: cfg.driftDelay,
                ease: 'sine.inOut',
                repeat: -1,
                yoyo: true,
            })
        }
    })

    // 3. Crown: a faint float for cohesion, no parallax.
    const crown = container.querySelector('[data-collage-crown]')
    if (crown) {
        gsap.to(crown, {
            x: 3,
            y: 4,
            rotation: 0.4,
            duration: 11,
            delay: 1,
            ease: 'sine.inOut',
            repeat: -1,
            yoyo: true,
        })
    }
}
