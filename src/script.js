import './style.css'
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

window.addEventListener('load', () => {
  const preloader = document.getElementById('preloader');
  if (preloader) {
    const tl = gsap.timeline({
      onComplete: () => {
        preloader.style.display = 'none';
        // Refresh ScrollTrigger since hiding preloader might affect layout
        ScrollTrigger.refresh();
      }
    });
    
    tl.to(preloader.querySelectorAll('.animate-bounce'), {
      opacity: 0,
      scale: 0,
      duration: 0.6,
      stagger: 0.1,
      ease: "back.in(2)"
    })
    .to(preloader, {
      opacity: 0,
      duration: 1,
      ease: "power4.inOut"
    }, "-=0.3");
  }
});

const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  orientation: 'vertical',
  smoothWheel: true,
})

lenis.on('scroll', ScrollTrigger.update)

gsap.ticker.add((time) => {
  lenis.raf(time * 1000)
})
gsap.ticker.lagSmoothing(0)

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', (e) => {
    const href = anchor.getAttribute('href')
    if (href === '#' || href === '#!') return
    const el = document.querySelector(href)
    if (el) {
      e.preventDefault()
      lenis.scrollTo(el, { offset: -80, duration: 1.2 })
    }
  })
})

const scrollToggle = 'play reverse play reverse'

const header = document.querySelector('header')
if (header) {
  const showAnim = gsap.from(header, { 
    yPercent: -100,
    paused: true,
    duration: 0.3,
    ease: "power2.out"
  }).progress(1);

  ScrollTrigger.create({
    start: "top top",
    end: "max",
    onUpdate: (self) => {
      if (self.direction === -1 || self.scrollY === 0) {
        showAnim.play();
      } else {
        showAnim.reverse();
      }
    }
  });
}

document.querySelectorAll('section').forEach((section) => {
  // Select a wide range of content elements to animate
  let elements = Array.from(section.querySelectorAll(`
    h1, h2, h3, h4,
    [class*="text-[3rem]"], 
    [class*="text-[2.4rem]"],
    [class*="text-[4rem]"],
    [class*="text-[5rem]"],
    p, 
    .service-box, 
    .js-faq-card, 
    .btn-primary,
    ul.list-disc, 
    .flex.items-center.gap-5.mt-8,
    .flex.items-center.flex-col.lg\\:flex-row,
    .grid.grid-cols-1.sm\\:grid-cols-2
  `));

  // Filter out elements that are inside other selected elements to prevent double-animation
  elements = elements.filter(el => {
    return !elements.some(parent => parent !== el && parent.contains(el));
  });

  if (elements.length > 0) {
    gsap.from(elements, {
      scrollTrigger: {
        trigger: section,
        start: 'top 85%',
        end: 'bottom top',
        toggleActions: scrollToggle,
      },
      opacity: 0,
      y: 50,
      duration: 1,
      stagger: 0.1,
      ease: 'power3.out'
    });
  }

  // Add subtle parallax to floating shapes within sections
  const shapes = section.querySelectorAll('img[src*="vector"], img[src*="shape"]');
  shapes.forEach(shape => {
    gsap.to(shape, {
      y: -80,
      ease: "none",
      scrollTrigger: {
        trigger: section,
        start: "top bottom",
        end: "bottom top",
        scrub: 1
      }
    });
  });
});

document.querySelectorAll('.js-counter').forEach((counter) => {
  const text = counter.textContent.trim();
  const numMatches = text.match(/\d+/);
  if (!numMatches) return;
  
  const targetNum = parseInt(numMatches[0], 10);
  const prefix = text.substring(0, text.indexOf(numMatches[0]));
  const suffix = text.substring(text.indexOf(numMatches[0]) + numMatches[0].length);

  counter.textContent = prefix + "0" + suffix;
  const obj = { val: 0 };

  gsap.to(obj, {
    val: targetNum,
    duration: 2.5,
    ease: "power3.out",
    scrollTrigger: {
      trigger: counter,
      start: 'top 85%',
      end: 'bottom top',
      toggleActions: scrollToggle,
    },
    onUpdate: () => {
      counter.textContent = prefix + Math.ceil(obj.val) + suffix;
    }
  });
});

document.querySelectorAll('.js-faq-accordion-trigger').forEach((trigger) => {
  const card = trigger.closest('.js-faq-card')
  const panel = card?.querySelector('.faq-accordion__panel')
  const svg = trigger.querySelector('.faq-chevron svg')
  if (!panel || !svg) return

  trigger.addEventListener('click', () => {
    const expanded = panel.classList.toggle('is-expanded')
    trigger.setAttribute('aria-expanded', String(expanded))
    svg.classList.toggle('rotate-180', expanded)
  })
})

// Magnetic Button Effect
document.querySelectorAll('.btn-primary').forEach((btn) => {
  btn.addEventListener('mousemove', (e) => {
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    gsap.to(btn, {
      x: x * 0.3,
      y: y * 0.3,
      duration: 0.3,
      ease: "power2.out"
    });
  });
  btn.addEventListener('mouseleave', () => {
    gsap.to(btn, {
      x: 0,
      y: 0,
      duration: 0.5,
      ease: "elastic.out(1, 0.3)"
    });
  });
});
