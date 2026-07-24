// Current stock row. The track is a native horizontal scroller (so touch and
// keyboard already work); the arrows in the left column step it one card at a
// time and disable themselves at either end. No autoscroll — this row is driven
// by the visitor.
export function initStock() {
    const viewport = document.querySelector('[data-stock-viewport]')
    const track = viewport?.querySelector('[data-carousel="stock"]')
    if (!viewport || !track) return

    const prev = document.querySelector('[data-stock-prev]')
    const next = document.querySelector('[data-stock-next]')
    if (!prev || !next) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // One step is a card plus the gap between cards, so a card always lands
    // against the left edge of the track.
    const step = () => {
        const card = track.firstElementChild
        if (!card) return viewport.clientWidth
        const gap = parseFloat(getComputedStyle(track).columnGap) || 0
        return card.offsetWidth + gap
    }

    // Sub-pixel scroll positions mean the end of the track never lands exactly on
    // the maximum, so both ends are tested with a pixel of slack.
    const syncArrows = () => {
        const max = viewport.scrollWidth - viewport.clientWidth
        prev.disabled = viewport.scrollLeft <= 1
        next.disabled = viewport.scrollLeft >= max - 1
    }

    const go = (direction) =>
        viewport.scrollBy({ left: direction * step(), behavior: reduce ? 'auto' : 'smooth' })

    prev.addEventListener('click', () => go(-1))
    next.addEventListener('click', () => go(1))

    viewport.addEventListener('scroll', syncArrows, { passive: true })
    window.addEventListener('resize', syncArrows)

    syncArrows()
}
