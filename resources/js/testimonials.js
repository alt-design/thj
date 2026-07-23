import gsap from 'gsap'

// Time each quote holds before advancing (ms) and the cross-fade duration (s).
const INTERVAL = 6000
const FADE = 0.8

export function initTestimonials() {
    const carousel = document.querySelector('[data-carousel="testimonials"]')
    if (!carousel) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return // first slide already renders visible; leave it static

    const slides = carousel.querySelectorAll('[data-testimonial-slide]')
    const dots = carousel.querySelectorAll('[data-testimonial-dot]')
    if (slides.length < 2) return // nothing to rotate

    let current = 0
    let timer = null

    const setActiveDot = (index) => {
        dots.forEach((dot, i) => {
            dot.classList.toggle('bg-paper', i === index)
            dot.classList.toggle('bg-paper/40', i !== index)
        })
    }

    const advance = () => {
        const next = (current + 1) % slides.length
        gsap.to(slides[current], { opacity: 0, duration: FADE, ease: 'sine.inOut' })
        gsap.to(slides[next], { opacity: 1, duration: FADE, ease: 'sine.inOut' })
        setActiveDot(next)
        current = next
    }

    const start = () => {
        if (timer) return
        timer = window.setInterval(advance, INTERVAL)
    }

    const stop = () => {
        window.clearInterval(timer)
        timer = null
    }

    carousel.addEventListener('mouseenter', stop)
    carousel.addEventListener('mouseleave', start)
    carousel.addEventListener('focusin', stop)
    carousel.addEventListener('focusout', start)

    start()
}
