import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// Time each quote holds before advancing (ms) and the cross-fade duration (s).
const INTERVAL = 6000
const FADE = 0.8

// How far the background drifts, as a share of its own height, while the panel
// enters. The image is 135% of the panel height; keeping the shift just under
// that 35% slack means the blurred backdrop always covers the panel edge to edge.
const PARALLAX_SHIFT = 25

// The blurred backdrop drifts up more slowly than the page while the panel is
// scrolling into view, then holds still once the panel pins beneath the nav. The
// tween is scrubbed to scroll position, so it plays in reverse on the way back up.
function initTestimonialsParallax() {
    const panel = document.querySelector('[data-testimonials-panel]')
    const background = panel?.querySelector('[data-testimonials-bg]')
    if (!background) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const navHeight = getComputedStyle(document.documentElement).getPropertyValue('--nav-h').trim() || '0px'

    gsap.fromTo(
        background,
        { yPercent: -PARALLAX_SHIFT },
        {
            yPercent: 0,
            ease: 'none',
            scrollTrigger: {
                trigger: panel,
                start: 'top bottom',
                end: `top top+=${navHeight}`,
                scrub: true,
                invalidateOnRefresh: true,
            },
        },
    )
}

export function initTestimonials() {
    initTestimonialsParallax()

    const carousel = document.querySelector('[data-carousel="testimonials"]')
    if (!carousel) return

    const slides = carousel.querySelectorAll('[data-testimonial-slide]')
    if (slides.length < 2) return // nothing to rotate

    const prevButton = carousel.querySelector('[data-testimonial-prev]')
    const nextButton = carousel.querySelector('[data-testimonial-next]')

    // Under reduced motion we skip both the auto-rotate and the cross-fade,
    // but the arrows still let the visitor step through the quotes.
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let current = 0
    let timer = null

    const goTo = (index) => {
        if (index === current) return

        if (reduce) {
            slides[current].style.opacity = 0
            slides[index].style.opacity = 1
        } else {
            gsap.to(slides[current], { opacity: 0, duration: FADE, ease: 'sine.inOut' })
            gsap.to(slides[index], { opacity: 1, duration: FADE, ease: 'sine.inOut' })
        }

        current = index
    }

    const step = (delta) => goTo((current + delta + slides.length) % slides.length)

    const start = () => {
        if (timer || reduce) return
        timer = window.setInterval(() => step(1), INTERVAL)
    }

    const stop = () => {
        window.clearInterval(timer)
        timer = null
    }

    // A manual click moves the slide and restarts the hold timer, so the quote
    // the visitor lands on gets the full interval before it advances again.
    const navigate = (delta) => {
        stop()
        step(delta)
        start()
    }

    prevButton?.addEventListener('click', () => navigate(-1))
    nextButton?.addEventListener('click', () => navigate(1))

    carousel.addEventListener('mouseenter', stop)
    carousel.addEventListener('mouseleave', start)
    carousel.addEventListener('focusin', stop)
    carousel.addEventListener('focusout', start)

    start()
}
