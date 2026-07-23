import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import { initHero } from './hero.js'
import { initCollage } from './collage.js'
import { initCarousel } from './carousel.js'

gsap.registerPlugin(ScrollTrigger)
window.gsap = gsap

initHero()
initCollage()
initCarousel('[data-carousel="stock"]')
initCarousel('[data-carousel="journal"]')
