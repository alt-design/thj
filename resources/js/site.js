import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import { initHero } from './hero.js'
import { initCollage } from './collage.js'
import { initCarousel } from './carousel.js'
import { initStock } from './stock.js'
import { initTestimonials } from './testimonials.js'
import { initFeatured } from './featured.js'
import { initFooter } from './footer.js'

gsap.registerPlugin(ScrollTrigger)
window.gsap = gsap

initHero()
initCollage()
initStock()
initCarousel('[data-carousel="journal"]')
initTestimonials()
initFeatured()
initFooter()
