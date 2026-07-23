import gsap from 'gsap'

// Matches the testimonials row: how long each car holds before advancing (ms)
// and the cross-fade duration (s).
const INTERVAL = 6000
const FADE = 0.8

export function initFeatured() {
    const carousel = document.querySelector('[data-carousel="featured"]')
    if (!carousel) return

    const images = carousel.querySelectorAll('[data-featured-image]')
    const texts = carousel.querySelectorAll('[data-featured-text]')
    const links = carousel.querySelectorAll('[data-featured-link]')
    if (images.length < 2) return // nothing to rotate

    const prevButtons = carousel.querySelectorAll('[data-featured-prev]')
    const nextButtons = carousel.querySelectorAll('[data-featured-next]')

    // Under reduced motion we skip the auto-rotate and the cross-fade, but the
    // arrows still let the visitor step through the cars.
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let current = 0
    let timer = null

    const goTo = (index) => {
        if (index === current) return

        // Only the active View link should receive clicks.
        links[current].classList.add('pointer-events-none')
        links[index].classList.remove('pointer-events-none')

        if (reduce) {
            images[current].style.opacity = 0
            images[index].style.opacity = 1
            texts[current].style.opacity = 0
            texts[index].style.opacity = 1
            links[current].style.opacity = 0
            links[index].style.opacity = 1
            current = index
            return
        }

        // Image: fade the incoming shot in on top of the outgoing one, which is
        // held solid beneath it, so the white page behind never shows through.
        gsap.set(images[index], { zIndex: 1 })
        gsap.set(images[current], { zIndex: 0 })
        const outgoing = images[current]
        gsap.fromTo(
            images[index],
            { opacity: 0 },
            {
                opacity: 1,
                duration: FADE,
                ease: 'sine.inOut',
                onComplete: () => { outgoing.style.opacity = 0 },
            },
        )

        // Panel text and link sit over solid black, so a straight cross-fade is
        // safe here.
        gsap.to([texts[current], links[current]], { opacity: 0, duration: FADE, ease: 'sine.inOut' })
        gsap.to([texts[index], links[index]], { opacity: 1, duration: FADE, ease: 'sine.inOut' })

        current = index
    }

    const step = (delta) => goTo((current + delta + images.length) % images.length)

    const start = () => {
        if (timer || reduce) return
        timer = window.setInterval(() => step(1), INTERVAL)
    }

    const stop = () => {
        window.clearInterval(timer)
        timer = null
    }

    // A manual click moves the slide and restarts the hold timer, so the car the
    // visitor lands on gets the full interval before it advances again.
    const navigate = (delta) => {
        stop()
        step(delta)
        start()
    }

    prevButtons.forEach((button) => button.addEventListener('click', () => navigate(-1)))
    nextButtons.forEach((button) => button.addEventListener('click', () => navigate(1)))

    carousel.addEventListener('mouseenter', stop)
    carousel.addEventListener('mouseleave', start)
    carousel.addEventListener('focusin', stop)
    carousel.addEventListener('focusout', start)

    start()
}
