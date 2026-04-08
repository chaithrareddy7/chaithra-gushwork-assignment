/**
 * MANGALAM HDPE PIPES - Interactive Features
 * Vanilla JavaScript — no frameworks or libraries
 *
 * Features:
 *  1. Sticky header (show on scroll down, hide on scroll up)
 *  2. Image carousel with thumbnails
 *  3. Image zoom on hover (lens + preview panel)
 *  4. FAQ accordion
 *  5. Process tabs
 *  6. Mobile menu toggle
 */

document.addEventListener('DOMContentLoaded', () => {

  /* ===========================================
     1. STICKY HEADER
     Shows when scrolling down past the hero,
     hides when scrolling back up.
     =========================================== */
  const stickyHeader = document.getElementById('stickyHeader');
  const mainNav = document.getElementById('mainNav');
  let lastScrollY = 0;
  let ticking = false;

  // Threshold: sticky header appears after scrolling past the navbar
  const getThreshold = () => mainNav.offsetTop + mainNav.offsetHeight + 200;

  function handleScroll() {
    const currentScrollY = window.scrollY;
    const threshold = getThreshold();

    if (currentScrollY > threshold && currentScrollY > lastScrollY) {
      // Scrolling DOWN past threshold — show sticky header
      stickyHeader.classList.add('visible');
    } else if (currentScrollY < lastScrollY || currentScrollY <= threshold) {
      // Scrolling UP or above threshold — hide sticky header
      stickyHeader.classList.remove('visible');
    }

    lastScrollY = currentScrollY;
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(handleScroll);
      ticking = true;
    }
  }, { passive: true });


  /* ===========================================
     2. IMAGE CAROUSEL
     Click arrows or thumbnails to change the
     main product image.
     =========================================== */
  const images = [
    { full: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&h=600&fit=crop',
      thumb: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=160&h=120&fit=crop' },
    { full: 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?w=800&h=600&fit=crop',
      thumb: 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?w=160&h=120&fit=crop' },
    { full: 'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=800&h=600&fit=crop',
      thumb: 'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=160&h=120&fit=crop' },
    { full: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800&h=600&fit=crop',
      thumb: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=160&h=120&fit=crop' },
    { full: 'https://images.unsplash.com/photo-1590496793929-36417d3117de?w=800&h=600&fit=crop',
      thumb: 'https://images.unsplash.com/photo-1590496793929-36417d3117de?w=160&h=120&fit=crop' }
  ];

  let currentIndex = 0;
  const mainImage = document.getElementById('mainImage');
  const thumbs = document.querySelectorAll('.thumb');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');

  function setActiveImage(index) {
    // Clamp index
    if (index < 0) index = images.length - 1;
    if (index >= images.length) index = 0;

    currentIndex = index;
    mainImage.src = images[index].full;

    // Update active thumbnail
    thumbs.forEach((t, i) => {
      t.classList.toggle('active', i === index);
    });
  }

  // Arrow buttons
  prevBtn.addEventListener('click', () => setActiveImage(currentIndex - 1));
  nextBtn.addEventListener('click', () => setActiveImage(currentIndex + 1));

  // Thumbnail clicks
  thumbs.forEach(thumb => {
    thumb.addEventListener('click', () => {
      const idx = parseInt(thumb.dataset.index, 10);
      setActiveImage(idx);
    });
  });

  // Keyboard navigation for carousel
  document.addEventListener('keydown', (e) => {
    // Only if gallery is in viewport
    const galleryRect = document.querySelector('.product-gallery')?.getBoundingClientRect();
    if (!galleryRect) return;
    if (galleryRect.bottom < 0 || galleryRect.top > window.innerHeight) return;

    if (e.key === 'ArrowLeft') setActiveImage(currentIndex - 1);
    if (e.key === 'ArrowRight') setActiveImage(currentIndex + 1);
  });


  /* ===========================================
     3. IMAGE ZOOM ON HOVER
     Shows a lens on the main image and a zoomed
     preview panel to the right of the gallery.
     The preview is outside __main (to avoid
     overflow:hidden clipping), so we toggle a
     .zooming class on .product-gallery.
     =========================================== */
  const mainImageWrap = document.getElementById('mainImageWrap');
  const zoomLens = document.getElementById('zoomLens');
  const zoomPreview = document.getElementById('zoomPreview');
  const gallery = document.querySelector('.product-gallery');

  // Only enable zoom on desktop (screen > 768px)
  function isZoomEnabled() {
    return window.innerWidth > 768;
  }

  // Preload the high-res version for smooth zoom
  function preloadImage(src) {
    const img = new Image();
    img.src = src;
  }

  mainImageWrap.addEventListener('mouseenter', () => {
    if (!isZoomEnabled()) return;
    gallery.classList.add('zooming');
    zoomPreview.style.backgroundImage = `url(${mainImage.src})`;
    preloadImage(mainImage.src);
  });

  mainImageWrap.addEventListener('mousemove', (e) => {
    if (!isZoomEnabled()) return;

    const rect = mainImageWrap.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // ---- Position the lens centered on cursor ----
    const lensW = zoomLens.offsetWidth;
    const lensH = zoomLens.offsetHeight;
    let lensX = x - lensW / 2;
    let lensY = y - lensH / 2;

    // Clamp so the lens never leaves the image
    lensX = Math.max(0, Math.min(lensX, rect.width - lensW));
    lensY = Math.max(0, Math.min(lensY, rect.height - lensH));

    zoomLens.style.left = lensX + 'px';
    zoomLens.style.top = lensY + 'px';

    // ---- Update the zoom preview ----
    // background-size in CSS is 400% → 4× magnification.
    // Map cursor % to background-position so the hovered
    // region appears in the center of the preview box.
    const bgX = (x / rect.width) * 100;
    const bgY = (y / rect.height) * 100;

    zoomPreview.style.backgroundImage = `url(${mainImage.src})`;
    zoomPreview.style.backgroundPosition = `${bgX}% ${bgY}%`;
  });

  mainImageWrap.addEventListener('mouseleave', () => {
    gallery.classList.remove('zooming');
  });

  // Update zoom preview image when carousel changes
  const origSetActiveImage = setActiveImage;
  setActiveImage = function(index) {
    origSetActiveImage(index);
    // If currently zooming, update the preview bg
    if (gallery.classList.contains('zooming')) {
      zoomPreview.style.backgroundImage = `url(${mainImage.src})`;
    }
  };


  /* ===========================================
     4. FAQ ACCORDION
     Toggle individual FAQ items open/closed.
     =========================================== */
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-item__question');

    questionBtn.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      // Close all items first (single-open mode)
      faqItems.forEach(i => i.classList.remove('open'));

      // Toggle the clicked item
      if (!isOpen) {
        item.classList.add('open');
        questionBtn.setAttribute('aria-expanded', 'true');
      } else {
        questionBtn.setAttribute('aria-expanded', 'false');
      }
    });
  });


  /* ===========================================
     5. PROCESS TABS
     Switch between manufacturing process steps.
     =========================================== */
  const processTabs = document.querySelectorAll('.process-tab');
  const processPanels = document.querySelectorAll('.process-panel');
  const processStepBadge = document.getElementById('processStepBadge');
  const tabNames = ['Raw Material', 'Extrusion', 'Cooling', 'Sizing', 'Quality Control', 'Marking', 'Cutting', 'Packaging'];
  let currentProcessStep = 0;

  function updateProcessStep(index) {
    currentProcessStep = index;
    processTabs.forEach(t => t.classList.remove('active'));
    processTabs[index].classList.add('active');
    processPanels.forEach(panel => {
      panel.classList.toggle('active', panel.dataset.panel === String(index));
    });
    if (processStepBadge) {
      processStepBadge.querySelector('span').textContent = 'Step ' + (index + 1) + '/' + tabNames.length + ': ' + tabNames[index];
    }
  }

  processTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      updateProcessStep(Number(tab.dataset.tab));
    });
  });

  // Mobile prev/next navigation
  const processPrev = document.getElementById('processPrev');
  const processNext = document.getElementById('processNext');
  if (processPrev) {
    processPrev.addEventListener('click', () => {
      const prev = currentProcessStep > 0 ? currentProcessStep - 1 : tabNames.length - 1;
      updateProcessStep(prev);
    });
  }
  if (processNext) {
    processNext.addEventListener('click', () => {
      const next = currentProcessStep < tabNames.length - 1 ? currentProcessStep + 1 : 0;
      updateProcessStep(next);
    });
  }

  /* ===========================================
     5b. PROCESS IMAGE GALLERY
     Each panel has multiple slides; arrows cycle
     through them with a fade transition.
     =========================================== */
  document.querySelectorAll('.process-panel__img-wrap').forEach(wrap => {
    const slides = wrap.querySelectorAll('.process-gallery__slide');
    if (slides.length <= 1) return;

    const prevBtn = wrap.querySelector('.process-img-arrow--left');
    const nextBtn = wrap.querySelector('.process-img-arrow--right');
    let idx = 0;

    function showSlide(newIdx) {
      slides[idx].classList.remove('active');
      idx = (newIdx + slides.length) % slides.length;
      slides[idx].classList.add('active');
    }

    prevBtn.addEventListener('click', () => showSlide(idx - 1));
    nextBtn.addEventListener('click', () => showSlide(idx + 1));
  });


  /* ===========================================
     6. APPLICATIONS CAROUSEL (infinite loop)
     Clones cards to create a seamless infinite
     scroll effect. Arrows shift by one card.
     =========================================== */
  const appTrack = document.getElementById('appTrack');
  const appPrev = document.getElementById('appPrev');
  const appNext = document.getElementById('appNext');

  // Clone all cards and append for seamless looping
  const appCards = Array.from(appTrack.children);
  const totalCards = appCards.length;
  // Clone set at end
  appCards.forEach(card => {
    appTrack.appendChild(card.cloneNode(true));
  });

  let appIndex = 0;
  let isAppTransitioning = false;

  function getAppStep() {
    const card = appTrack.querySelector('.application-card');
    return card ? card.offsetWidth + 32 : 452; // card (420) + gap (32)
  }

  function moveAppCarousel(animate) {
    if (animate) {
      appTrack.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.1, 0.25, 1)';
    } else {
      appTrack.style.transition = 'none';
    }
    appTrack.style.transform = `translateX(-${appIndex * getAppStep()}px)`;
  }

  appNext.addEventListener('click', () => {
    if (isAppTransitioning) return;
    isAppTransitioning = true;
    appIndex++;
    moveAppCarousel(true);
  });

  appPrev.addEventListener('click', () => {
    if (isAppTransitioning) return;
    if (appIndex === 0) {
      // Jump to clone set instantly, then animate back
      appIndex = totalCards;
      moveAppCarousel(false);
      // Force reflow
      void appTrack.offsetHeight;
      appIndex--;
      isAppTransitioning = true;
      moveAppCarousel(true);
      return;
    }
    isAppTransitioning = true;
    appIndex--;
    moveAppCarousel(true);
  });

  // When transition ends, reset to real cards if we've scrolled into clones
  appTrack.addEventListener('transitionend', () => {
    isAppTransitioning = false;
    if (appIndex >= totalCards) {
      appIndex = appIndex - totalCards;
      moveAppCarousel(false);
    }
  });


  /* ===========================================
     6b. TESTIMONIALS — clone cards for infinite loop
     =========================================== */
  const testimonialsTrack = document.getElementById('testimonialsTrack');
  if (testimonialsTrack) {
    // Clone all cards and append for seamless CSS animation loop
    const testimonialCards = Array.from(testimonialsTrack.children);
    testimonialCards.forEach(card => {
      testimonialsTrack.appendChild(card.cloneNode(true));
    });
  }


  /* ===========================================
     7. MOBILE MENU TOGGLE
     Hamburger menu for mobile navigation.
     =========================================== */
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    mobileMenu.classList.toggle('open');
  });

  // Close mobile menu on link click
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      mobileMenu.classList.remove('open');
    });
  });


  /* ===========================================
     7. SMOOTH SCROLL FOR ANCHOR LINKS
     =========================================== */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ── View Technical Specs → opens Brochure Modal ──
  const openSpecsBrochure = document.getElementById('openSpecsBrochure');
  if (openSpecsBrochure) {
    openSpecsBrochure.addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById('brochureModal').classList.add('open');
    });
  }

  // ── Callback / Quote Modal ──
  const callbackModal = document.getElementById('callbackModal');
  const closeCallbackBtn = document.getElementById('closeCallbackModal');

  if (callbackModal) {
    document.querySelectorAll('[data-open-callback]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        callbackModal.classList.add('open');
      });
    });

    closeCallbackBtn.addEventListener('click', () => {
      callbackModal.classList.remove('open');
    });

    callbackModal.addEventListener('click', (e) => {
      if (e.target === callbackModal) {
        callbackModal.classList.remove('open');
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && callbackModal.classList.contains('open')) {
        callbackModal.classList.remove('open');
      }
    });
  }

  // ── Brochure Download Modal ──
  const brochureModal = document.getElementById('brochureModal');
  const openBtn = document.getElementById('openBrochureModal');
  const closeBtn = document.getElementById('closeBrochureModal');

  if (openBtn && brochureModal) {
    openBtn.addEventListener('click', (e) => {
      e.preventDefault();
      brochureModal.classList.add('open');
    });

    closeBtn.addEventListener('click', () => {
      brochureModal.classList.remove('open');
    });

    brochureModal.addEventListener('click', (e) => {
      if (e.target === brochureModal) {
        brochureModal.classList.remove('open');
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && brochureModal.classList.contains('open')) {
        brochureModal.classList.remove('open');
      }
    });
  }

});
