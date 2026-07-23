import gsap from 'gsap'

// Time each quote holds before advancing (ms) and the cross-fade duration (s).
const INTERVAL = 6000
const FADE = 0.8

export function initTestimonials() {
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
