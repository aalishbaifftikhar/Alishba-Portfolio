/**
 * Cinematic Portfolio - Interactive Controller
 * Alishba Iftikhar | Full Stack Web Developer
 */

document.addEventListener('DOMContentLoaded', () => {
  // -------------------------------------------------------------------------
  // 1. Video Autoplay Reliability
  // -------------------------------------------------------------------------
  const heroVideo = document.getElementById('heroAvatarVideo');
  if (heroVideo) {
    heroVideo.muted = true;
    heroVideo.defaultMuted = true;

    const attemptPlay = () => {
      const playPromise = heroVideo.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Fallback if browser autoplay policy demands user gesture
          const handleFirstInteraction = () => {
            heroVideo.play();
            window.removeEventListener('click', handleFirstInteraction);
            window.removeEventListener('touchstart', handleFirstInteraction);
          };
          window.addEventListener('click', handleFirstInteraction, { once: true, passive: true });
          window.addEventListener('touchstart', handleFirstInteraction, { once: true, passive: true });
        });
      }
    };

    // The MP4 is attached after first paint so it never competes with the CSS and
    // JS for bandwidth; the poster covers the gap. Save-Data and 2G connections
    // keep the poster only.
    const connection = navigator.connection;
    const keepPosterOnly = connection && (connection.saveData || /(^|slow-)2g$/.test(connection.effectiveType || ''));
    const attachHeroVideo = () => {
      const source = heroVideo.querySelector('source[data-src]');
      if (!source || keepPosterOnly) return;
      source.src = source.dataset.src;
      heroVideo.load();
      attemptPlay();
    };
    requestAnimationFrame(() => setTimeout(attachHeroVideo, 0));

    // Replay guarantee if low-power mode pauses video loop
    heroVideo.addEventListener('ended', () => {
      heroVideo.currentTime = 0;
      heroVideo.play();
    });
  }

  // -------------------------------------------------------------------------
  // 2. Navbar Scroll Dynamic Backdrop
  // -------------------------------------------------------------------------
  const navbar = document.querySelector('.navbar-wrapper');
  const handleScroll = () => {
    if (window.scrollY > 35) {
      navbar?.classList.add('scrolled');
    } else {
      navbar?.classList.remove('scrolled');
    }
  };
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // -------------------------------------------------------------------------
  // 3. Mobile Navigation Drawer (Slides in from the SIDE)
  // -------------------------------------------------------------------------
  const mobileToggle = document.getElementById('mobileToggle');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const drawerClose = document.getElementById('drawerClose');
  const drawerBackdrop = document.getElementById('drawerBackdrop');
  const drawerLinks = document.querySelectorAll('.drawer-link');
  const drawerTalkBtn = document.querySelector('.drawer-talk-btn');

  const lockScroll = () => {
    document.body.classList.add('scroll-locked');
    document.documentElement.classList.add('scroll-locked');
  };

  const unlockScroll = () => {
    // Only unlock if resume modal is not currently open
    const isModalOpen = resumeModal?.classList.contains('active');
    if (!isModalOpen) {
      document.body.classList.remove('scroll-locked');
      document.documentElement.classList.remove('scroll-locked');
    }
  };

  const openDrawer = (e) => {
    if (e) e.preventDefault();
    mobileDrawer?.classList.add('open');
    mobileToggle?.classList.add('active');
    mobileToggle?.setAttribute('aria-expanded', 'true');
    mobileDrawer?.setAttribute('aria-hidden', 'false');
    lockScroll();
  };

  const closeDrawer = (e) => {
    if (e) e.preventDefault();
    mobileDrawer?.classList.remove('open');
    mobileToggle?.classList.remove('active');
    mobileToggle?.setAttribute('aria-expanded', 'false');
    mobileDrawer?.setAttribute('aria-hidden', 'true');
    unlockScroll();
  };

  mobileToggle?.addEventListener('click', (e) => {
    if (mobileDrawer?.classList.contains('open')) {
      closeDrawer(e);
    } else {
      openDrawer(e);
    }
  });

  drawerClose?.addEventListener('click', closeDrawer);
  drawerBackdrop?.addEventListener('click', closeDrawer);

  drawerLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = link.getAttribute('href');
      closeDrawer();
      handleNavClick(target);
    });
  });

  drawerTalkBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    closeDrawer();
    handleContactAction(e);
  });

  // Auto-close drawer on desktop viewport resize
  window.addEventListener('resize', () => {
    if (window.innerWidth > 992 && mobileDrawer?.classList.contains('open')) {
      closeDrawer();
    }
  }, { passive: true });

  // -------------------------------------------------------------------------
  // 4. Toast Notification Manager
  // -------------------------------------------------------------------------
  const toastContainer = document.getElementById('toastContainer');
  const showToast = (message, duration = 3500) => {
    if (!toastContainer) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  };

  // -------------------------------------------------------------------------
  // 5. Navigation Links Controller
  // -------------------------------------------------------------------------
  const handleNavClick = (targetId) => {
    if (!targetId || targetId === '#') return;
    const targetElement = document.querySelector(targetId);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth' });
      if (location.hash !== targetId) history.replaceState(null, '', targetId);
    } else {
      const sectionName = targetId.replace('#', '').toUpperCase();
      showToast(`Section "${sectionName}" will be added in subsequent build steps.`);
    }
  };

  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      handleNavClick(link.getAttribute('href'));
    });
  });

  // -------------------------------------------------------------------------
  // 6. Resume Modal Controls & Actions
  // -------------------------------------------------------------------------
  const downloadResumeBtn = document.getElementById('downloadResumeBtn');
  const resumeModal = document.getElementById('resumeModal');
  const resumeModalClose = document.getElementById('resumeModalClose');
  const resumeModalOverlay = document.getElementById('resumeModalOverlay');

  const openResumeModal = () => {
    resumeModal?.classList.add('active');
    resumeModal?.setAttribute('aria-hidden', 'false');
    lockScroll();
  };

  const closeResumeModal = () => {
    resumeModal?.classList.remove('active');
    resumeModal?.setAttribute('aria-hidden', 'true');
    unlockScroll();
  };

  downloadResumeBtn?.addEventListener('click', openResumeModal);
  resumeModalClose?.addEventListener('click', closeResumeModal);
  resumeModalOverlay?.addEventListener('click', closeResumeModal);

  // -------------------------------------------------------------------------
  // 7. Global Keyboard (Escape Key Closes Drawer & Modal)
  // -------------------------------------------------------------------------
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (mobileDrawer?.classList.contains('open')) {
        closeDrawer();
      }
      if (resumeModal?.classList.contains('active')) {
        closeResumeModal();
      }
    }
  });

  // -------------------------------------------------------------------------
  // 8. CTAs: Explore Work & Let's Talk
  // -------------------------------------------------------------------------
  const exploreWorkBtn = document.getElementById('exploreWorkBtn');
  exploreWorkBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    handleNavClick('#projects');
  });

  const letsTalkBtn = document.getElementById('letsTalkBtn');
  const handleContactAction = (e) => {
    e.preventDefault();
    handleNavClick('#contact');
  };
  letsTalkBtn?.addEventListener('click', handleContactAction);

  // -------------------------------------------------------------------------
  // 9. Role Typing Animation (the CSS reserves the longest role's width, so the line never re-wraps)
  // Phrases: "FULL STACK DEVELOPER", "LARAVEL DEVELOPER", "WEB DEVELOPER"
  // -------------------------------------------------------------------------
  const dynamicRoleEl = document.getElementById('heroDynamicRole');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (dynamicRoleEl && !prefersReducedMotion) {
    const roles = [
      'FULL STACK DEVELOPER',
      'LARAVEL DEVELOPER',
      'WEB DEVELOPER'
    ];

    let roleIndex = 0;
    let charIndex = roles[0].length;
    let isDeleting = false;
    let isPaused = true;

    const TYPE_SPEED = 75;
    const DELETE_SPEED = 45;
    const HOLD_TIME = 2200;
    const PAUSE_BEFORE_TYPE = 350;

    const tick = () => {
      const currentFullText = roles[roleIndex];

      if (isDeleting) {
        charIndex--;
        dynamicRoleEl.textContent = currentFullText.substring(0, charIndex);

        if (charIndex <= 0) {
          isDeleting = false;
          roleIndex = (roleIndex + 1) % roles.length;
          setTimeout(tick, PAUSE_BEFORE_TYPE);
          return;
        }
        setTimeout(tick, DELETE_SPEED);
      } else {
        if (isPaused) {
          isPaused = false;
          setTimeout(() => {
            isDeleting = true;
            tick();
          }, HOLD_TIME);
          return;
        }

        charIndex++;
        dynamicRoleEl.textContent = currentFullText.substring(0, charIndex);

        if (charIndex >= currentFullText.length) {
          isPaused = true;
          setTimeout(() => {
            isDeleting = true;
            tick();
          }, HOLD_TIME);
          return;
        }
        setTimeout(tick, TYPE_SPEED);
      }
    };

    // Begin the first delete/type cycle after an initial reading pause
    setTimeout(() => {
      isDeleting = true;
      tick();
    }, HOLD_TIME);
  }

  // -------------------------------------------------------------------------
  // 10. Subtle Cinematic Spotlight Lighting (Preserves Video Transforms)
  // -------------------------------------------------------------------------
  if (window.matchMedia('(min-width: 993px)').matches) {
    const spotlight = document.querySelector('.spotlight-overhead');

    window.addEventListener('mousemove', (e) => {
      const { clientX, clientY } = e;
      const xPercent = (clientX / window.innerWidth) - 0.5;
      const yPercent = (clientY / window.innerHeight) - 0.5;

      if (spotlight) {
        spotlight.style.transform = `translateX(calc(-50% + ${xPercent * 25}px)) translateY(${yPercent * 15}px)`;
      }
    }, { passive: true });
  }

  // -------------------------------------------------------------------------
  // 11. About Section: Interactive 3D Card Tilt & Dynamic Cursor Glow
  // -------------------------------------------------------------------------
  const portraitCardWrapper = document.getElementById('portraitCardWrapper');
  const portraitCard = document.getElementById('portraitCard');
  const cardCursorGlow = document.getElementById('cardCursorGlow');

  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (portraitCardWrapper && portraitCard && canHover && !isReducedMotion) {
    let bounds = null;
    let isHovering = false;

    const updateBounds = () => {
      bounds = portraitCardWrapper.getBoundingClientRect();
    };

    portraitCardWrapper.addEventListener('mouseenter', () => {
      isHovering = true;
      updateBounds();
      if (cardCursorGlow) cardCursorGlow.style.opacity = '1';
      portraitCard.style.transition = 'transform 0.1s ease-out';
    });

    portraitCardWrapper.addEventListener('mousemove', (e) => {
      if (!isHovering) return;
      if (!bounds) updateBounds();

      const mouseX = e.clientX - bounds.left;
      const mouseY = e.clientY - bounds.top;

      // Calculate tilt (-1 to 1 from card center)
      const xNorm = (mouseX / bounds.width) - 0.5;
      const yNorm = (mouseY / bounds.height) - 0.5;

      const maxTilt = 8.5; // Restrained 8.5deg max for subtle luxury feel
      const tiltX = -yNorm * maxTilt;
      const tiltY = xNorm * maxTilt;

      portraitCard.style.transform = `perspective(1000px) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`;

      if (cardCursorGlow) {
        cardCursorGlow.style.background = `radial-gradient(circle 260px at ${mouseX}px ${mouseY}px, rgba(230, 201, 103, 0.22), transparent 75%)`;
      }
    });

    portraitCardWrapper.addEventListener('mouseleave', () => {
      isHovering = false;
      portraitCard.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
      portraitCard.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      if (cardCursorGlow) {
        cardCursorGlow.style.opacity = '0';
      }
    });

    window.addEventListener('scroll', () => {
      if (isHovering) updateBounds();
    }, { passive: true });
  }

  // -------------------------------------------------------------------------
  // 12. About Section: Staggered Scroll Reveal & Heading Echo
  // -------------------------------------------------------------------------
  const revealElements = document.querySelectorAll('.about-section [data-reveal]');
  if ('IntersectionObserver' in window && !isReducedMotion) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));
  } else {
    revealElements.forEach(el => el.classList.add('is-revealed'));
  }

  // -------------------------------------------------------------------------
  // 13. Statistics Counter Animation (Only numeric targets, respects TEAMWORK)
  // -------------------------------------------------------------------------
  const statsRow = document.getElementById('aboutStatsRow');
  const numericStats = document.querySelectorAll('.stat-number[data-target]');

  if (statsRow && numericStats.length > 0) {
    let hasAnimated = false;

    const runCountUp = () => {
      if (hasAnimated) return;
      hasAnimated = true;

      numericStats.forEach(statEl => {
        const target = parseInt(statEl.getAttribute('data-target'), 10);
        const suffix = statEl.getAttribute('data-suffix') || '';
        const padLen = parseInt(statEl.getAttribute('data-pad') || '0', 10);

        if (isReducedMotion || isNaN(target)) {
          const valStr = padLen > 0 ? String(target).padStart(padLen, '0') : String(target);
          statEl.textContent = valStr + suffix;
          return;
        }

        const duration = 1600;
        const startTime = performance.now();

        const updateCount = (currentTime) => {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const easeOut = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
          const currentVal = Math.round(easeOut * target);

          const formatted = padLen > 0 ? String(currentVal).padStart(padLen, '0') : String(currentVal);
          statEl.textContent = formatted + suffix;

          if (progress < 1) {
            requestAnimationFrame(updateCount);
          } else {
            const finalFormatted = padLen > 0 ? String(target).padStart(padLen, '0') : String(target);
            statEl.textContent = finalFormatted + suffix;
          }
        };

        requestAnimationFrame(updateCount);
      });
    };

    if ('IntersectionObserver' in window && !isReducedMotion) {
      const statsObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            runCountUp();
            observer.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.25
      });
      statsObserver.observe(statsRow);
    } else {
      runCountUp();
    }
  }

  // -------------------------------------------------------------------------
  // 14. Projects Section: Staggered Scroll Reveal
  // -------------------------------------------------------------------------
  const projectRevealElements = document.querySelectorAll('.projects-section [data-reveal]');
  if (projectRevealElements.length > 0) {
    if ('IntersectionObserver' in window && !isReducedMotion) {
      const projectObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            observer.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px'
      });

      projectRevealElements.forEach(el => projectObserver.observe(el));
    } else {
      projectRevealElements.forEach(el => el.classList.add('is-revealed'));
    }
  }

  // -------------------------------------------------------------------------
  // 15. Projects Section: Premium Scroll-Driven Layered Card Stack (Leftward Swap)
  // -------------------------------------------------------------------------
  (function initProjectDeckStack() {
    const container = document.querySelector('.projects-cards-container');
    const stage = document.querySelector('.projects-deck-stage');
    const cards = Array.from(document.querySelectorAll('.project-card'));

    if (!container || !stage || cards.length === 0) return;

    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isReduced) {
      // Accessible fallback: cards stay in natural vertical document flow
      return;
    }

    // Activate sticky deck mode
    container.classList.add('is-deck-active');

    const numCards = cards.length;

    // Timeline (all values in px of page scroll, recomputed in updateMetrics):
    //   per card = [ pan (only if the card is taller than the viewport) + reading dwell ] + [ swap ]
    let dwellRatio = 0.35;      // share of each card interval that is stationary (pan + reading dwell)
    let stickyTopOffset = 116;  // where the stage pins, measured from the viewport top
    let panDist = 0;            // how far a card must travel up so its bottom becomes reachable
    let dwellRead = 0;          // pure reading time after the pan has finished
    let scrollPerCard = 700;
    let startHold = 0;
    let endHold = 350;
    let totalTrackDistance = 0;
    let deckCardW = 0;          // untransformed card width, used to keep the stack peek constant
    let rafId = null;

    function updateMetrics() {
      const vh = window.innerHeight;
      const vw = window.innerWidth;

      // The real navbar is .navbar-wrapper (fixed, height: var(--nav-height))
      const navEl = document.querySelector('.navbar-wrapper');
      const navHeight = navEl ? navEl.offsetHeight : 84;

      const isMobile = vw <= 767;
      const isTablet = vw <= 1023;

      const gapTop = isMobile ? 12 : isTablet ? 20 : 24;     // clearance below the navbar
      const gapBottom = isMobile ? 16 : 24;                   // breathing room at viewport bottom
      const stepVh = isMobile ? 0.85 : isTablet ? 0.88 : 0.9;

      // The stage is a CSS grid whose single cell is as tall as the tallest card,
      // so its measured height is the real card height (no min-height guesswork).
      const stageHeight = stage.offsetHeight;
      deckCardW = cards[0].offsetWidth;

      const minTop = navHeight + gapTop;
      const avail = vh - minTop - gapBottom;

      if (stageHeight <= avail) {
        // Card fits: pin it vertically centred in the space below the navbar
        stickyTopOffset = Math.round(minTop + (avail - stageHeight) / 2);
        panDist = 0;
      } else {
        // Card is taller than the viewport: pin just below the navbar and let the
        // card travel up with the scroll (same as normal scrolling) until its
        // bottom edge and buttons are on screen.
        stickyTopOffset = minTop;
        panDist = Math.ceil(stageHeight - avail);
      }

      const baseStep = Math.round(vh * stepVh);
      const swapDist = Math.round(baseStep * 0.65);
      dwellRead = Math.round(baseStep * 0.35);
      scrollPerCard = panDist + dwellRead + swapDist;
      dwellRatio = (panDist + dwellRead) / scrollPerCard;

      startHold = panDist > 0 ? 0 : Math.round(vh * 0.1);
      endHold = panDist + Math.round(vh * 0.3);

      totalTrackDistance = startHold + (numCards - 1) * scrollPerCard + endHold;

      // Single source of truth for the pin position: CSS sticky top === JS scroll maths
      const topPx = `${stickyTopOffset}px`;
      if (stage.style.top !== topPx) stage.style.top = topPx;

      const containerPx = `${stageHeight + totalTrackDistance}px`;
      if (container.style.height !== containerPx) container.style.height = containerPx;

      onScroll();
    }

    function render(progress, scrolled) {
      const isMobile = window.innerWidth <= 767;
      const isTablet = window.innerWidth <= 1023;

      // Layered deck offsets (visible edges peeking to the right).
      // scale() shrinks a card about its centre, pulling its right edge in by (1 - scale) * width / 2.
      // slotPeek is the distance each buried card's edge should stick out past the active card, and
      // that shrink is added back so the peek stays visible on wide (horizontal) cards too.
      const slotRotate = isMobile ? [1.0, 1.8, 2.4] : [1.4, 2.6, 3.8];
      const slotScale = [0.95, 0.90, 0.85];
      const slotPeek = isTablet ? [18, 34, 48] : [20, 38, 54];
      const slotX = isMobile
        ? [12, 22, 32]
        : slotPeek.map((peek, k) => Math.round(peek + (1 - slotScale[k]) * deckCardW / 2));
      const slotOpacity = [0.94, 0.80, 0.62];

      // Active card index clamped to [0, numCards - 1]
      const activeIdx = Math.min(numCards - 1, Math.floor(progress));
      const stepProgress = activeIdx >= numCards - 1 ? 0 : progress - activeIdx;

      // Vertical pan of the active card (only non-zero when the card is taller than the viewport)
      const localPx = scrolled - startHold - activeIdx * scrollPerCard;
      const panY = panDist > 0 ? -Math.min(panDist, Math.max(0, localPx)) : 0;

      // Cards sit at the top-left of the deck cell (grid-area 1/1), so transforms carry
      // only the horizontal slide/peek and the pan: no vertical -50% offset.
      cards.forEach((card, i) => {
        if (i < activeIdx) {
          // Card has departed to the left
          card.style.transform = `translate3d(-130vw, 0, 0) rotate(-4deg)`;
          card.style.opacity = '0';
          card.style.pointerEvents = 'none';
          card.style.visibility = 'hidden';
          card.setAttribute('aria-hidden', 'true');
          card.removeAttribute('data-active');
        } else if (i === activeIdx) {
          if (activeIdx === numCards - 1 || stepProgress <= dwellRatio) {
            // Active foreground presentation dwell (straight, readable, panning if tall)
            card.style.transform = `translate3d(0, ${panY.toFixed(1)}px, 0) rotate(0deg)`;
            card.style.opacity = '1';
            card.style.pointerEvents = 'auto';
            card.style.visibility = 'visible';
            card.style.zIndex = '10';
            card.removeAttribute('aria-hidden');
            card.setAttribute('data-active', 'true');
          } else {
            // Swap phase: outgoing card slides towards the LEFT (pan already finished)
            const u = (stepProgress - dwellRatio) / (1 - dwellRatio); // 0 -> 1
            const slideLeft = -u * 125; // percentage of card width to the left
            const tilt = -u * 3.5;
            const currentScale = 1.0 - u * 0.04;
            const opacity = u < 0.45 ? 1 : Math.max(0, 1 - (u - 0.45) / 0.55);

            card.style.transform = `translate3d(${slideLeft.toFixed(1)}%, ${(-panDist).toFixed(1)}px, 0) scale(${currentScale.toFixed(4)}) rotate(${tilt.toFixed(2)}deg)`;
            card.style.opacity = opacity.toFixed(3);
            card.style.pointerEvents = u < 0.15 ? 'auto' : 'none';
            card.style.visibility = 'visible';
            card.style.zIndex = '10';
            card.removeAttribute('aria-hidden');
            if (u < 0.15) {
              card.setAttribute('data-active', 'true');
            } else {
              card.removeAttribute('data-active');
            }
          }
        } else if (i === activeIdx + 1) {
          // Incoming card advancing from Slot 1 in deck into active foreground
          if (stepProgress <= dwellRatio) {
            // Resting in Slot 1 of the deck
            card.style.transform = `translate3d(${slotX[0]}px, 0, 0) scale(${slotScale[0]}) rotate(${slotRotate[0]}deg)`;
            card.style.opacity = slotOpacity[0].toFixed(3);
            card.style.pointerEvents = 'none';
            card.style.visibility = 'visible';
            card.style.zIndex = '9';
            card.removeAttribute('aria-hidden');
            card.removeAttribute('data-active');
          } else {
            // Smoothly stepping from Slot 1 into foreground
            const u = (stepProgress - dwellRatio) / (1 - dwellRatio); // 0 -> 1
            const x = (1 - u) * slotX[0];
            const rot = (1 - u) * slotRotate[0];
            const s = slotScale[0] + u * (1.0 - slotScale[0]);
            const op = slotOpacity[0] + u * (1.0 - slotOpacity[0]);

            card.style.transform = `translate3d(${x.toFixed(1)}px, 0, 0) scale(${s.toFixed(4)}) rotate(${rot.toFixed(2)}deg)`;
            card.style.opacity = op.toFixed(3);
            card.style.pointerEvents = u > 0.85 ? 'auto' : 'none';
            card.style.visibility = 'visible';
            card.style.zIndex = '9';
            card.removeAttribute('aria-hidden');
            if (u > 0.85) {
              card.setAttribute('data-active', 'true');
            } else {
              card.removeAttribute('data-active');
            }
          }
        } else {
          // Deeper cards in the deck
          const slotOffset = i - activeIdx - 1;
          const fromSlot = Math.min(slotOffset, slotX.length - 1);
          const toSlot = Math.max(0, fromSlot - 1);

          if (stepProgress <= dwellRatio) {
            card.style.transform = `translate3d(${slotX[fromSlot]}px, 0, 0) scale(${slotScale[fromSlot]}) rotate(${slotRotate[fromSlot]}deg)`;
            card.style.opacity = slotOpacity[fromSlot].toFixed(3);
            card.style.pointerEvents = 'none';
            card.style.visibility = 'visible';
            card.style.zIndex = `${Math.max(1, 8 - fromSlot)}`;
            card.removeAttribute('aria-hidden');
            card.removeAttribute('data-active');
          } else {
            const u = (stepProgress - dwellRatio) / (1 - dwellRatio); // 0 -> 1
            const x = slotX[fromSlot] + u * (slotX[toSlot] - slotX[fromSlot]);
            const rot = slotRotate[fromSlot] + u * (slotRotate[toSlot] - slotRotate[fromSlot]);
            const s = slotScale[fromSlot] + u * (slotScale[toSlot] - slotScale[fromSlot]);
            const op = slotOpacity[fromSlot] + u * (slotOpacity[toSlot] - slotOpacity[fromSlot]);

            card.style.transform = `translate3d(${x.toFixed(1)}px, 0, 0) scale(${s.toFixed(4)}) rotate(${rot.toFixed(2)}deg)`;
            card.style.opacity = op.toFixed(3);
            card.style.pointerEvents = 'none';
            card.style.visibility = 'visible';
            card.style.zIndex = `${Math.max(1, 8 - toSlot)}`;
            card.removeAttribute('aria-hidden');
            card.removeAttribute('data-active');
          }
        }
      });
    }

    function onScroll() {
      const rect = container.getBoundingClientRect();
      const scrolled = stickyTopOffset - rect.top;

      let progress = 0;
      if (scrolled <= startHold) {
        progress = 0;
      } else if (scrolled >= startHold + (numCards - 1) * scrollPerCard) {
        progress = numCards - 1;
      } else {
        progress = (scrolled - startHold) / scrollPerCard;
      }

      render(progress, scrolled);
    }

    function scheduleScroll() {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        onScroll();
      });
    }

    let metricsRaf = null;
    function scheduleMetrics() {
      if (metricsRaf) return;
      metricsRaf = requestAnimationFrame(() => {
        metricsRaf = null;
        updateMetrics();
      });
    }

    // Keyboard Tab accessibility: bring focused card to foreground (after its pan, mid-dwell)
    cards.forEach((card, index) => {
      card.addEventListener('focusin', () => {
        const rect = container.getBoundingClientRect();
        const currentScrollY = window.scrollY || window.pageYOffset;
        const targetScrolled = startHold + index * scrollPerCard + panDist + dwellRead * 0.5;
        const targetScrollY = currentScrollY + rect.top - stickyTopOffset + targetScrolled;
        window.scrollTo({
          top: targetScrollY,
          behavior: 'smooth'
        });
      });
    });

    // Event listeners
    window.addEventListener('scroll', scheduleScroll, { passive: true });
    window.addEventListener('resize', scheduleMetrics, { passive: true });
    window.addEventListener('orientationchange', () => {
      setTimeout(updateMetrics, 150);
    });

    // The stage height is derived from the cards, so observing it catches font loads,
    // text reflow and breakpoint changes. updateMetrics never changes the stage size,
    // so this cannot feed back into itself.
    if ('ResizeObserver' in window) {
      const ro = new ResizeObserver(scheduleMetrics);
      ro.observe(stage);
    }

    // Initial calculation
    updateMetrics();
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(updateMetrics);
    }
    window.addEventListener('load', updateMetrics);
  })();

  // -------------------------------------------------------------------------
  // 14. Skills Section: entrance reveal + gold pointer spotlight
  // -------------------------------------------------------------------------
  (() => {
    const section = document.getElementById('skills');
    if (!section) return;

    // Entrance: hairlines draw, tiles arrive in sequence. The section only hides
    // itself once JS is running, so content is never lost if scripts fail.
    const revealTargets = section.querySelectorAll('[data-reveal]');

    // The "6 tools" label counts up from zero when its row arrives.
    const countUp = (row) => {
      const el = row.querySelector('.sx-count');
      const end = el ? parseInt(el.dataset.count, 10) : 0;
      if (!el || !end) return;
      const start = performance.now() + 350;
      el.textContent = '0';
      const step = (now) => {
        const p = Math.min(Math.max((now - start) / 900, 0), 1);
        el.textContent = String(Math.round(end * (1 - Math.pow(1 - p, 3))));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    if ('IntersectionObserver' in window && !isReducedMotion) {
      section.classList.add('sx-armed');
      const io = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            if (entry.target.classList.contains('sx-row')) countUp(entry.target);
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
      revealTargets.forEach(el => io.observe(el));
    } else {
      revealTargets.forEach(el => el.classList.add('is-revealed'));
    }

    // Spotlight: only on devices with a real pointer.
    const stage = section.querySelector('.sx-stage');
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (!stage || !finePointer || isReducedMotion) return;

    const tools = Array.from(stage.querySelectorAll('.sx-tool'));
    let pointerX = 0;
    let pointerY = 0;
    let frame = 0;

    const paint = () => {
      frame = 0;
      tools.forEach(tool => {
        const rect = tool.getBoundingClientRect();
        tool.style.setProperty('--x', (pointerX - rect.left) + 'px');
        tool.style.setProperty('--y', (pointerY - rect.top) + 'px');
      });
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(paint); };

    stage.addEventListener('pointermove', (e) => {
      pointerX = e.clientX;
      pointerY = e.clientY;
      stage.classList.add('is-lit');
      schedule();
    });
    stage.addEventListener('pointerleave', () => stage.classList.remove('is-lit'));
    window.addEventListener('scroll', () => {
      if (stage.classList.contains('is-lit')) schedule();
    }, { passive: true });

    // Soft 3D tilt. Measured on the still <li> and eased every frame,
    // so it glides toward the pointer instead of stepping.
    const tilts = tools.map(el => ({ el, rx: 0, ry: 0, tx: 0, ty: 0 }));
    let tiltFrame = 0;
    const tiltTick = () => {
      let busy = false;
      tilts.forEach(t => {
        const dx = t.tx - t.rx;
        const dy = t.ty - t.ry;
        if (Math.abs(dx) < 0.01 && Math.abs(dy) < 0.01) {
          if (t.rx === t.tx && t.ry === t.ty) return;
          t.rx = t.tx;
          t.ry = t.ty;
        } else {
          t.rx += dx * 0.12;
          t.ry += dy * 0.12;
          busy = true;
        }
        t.el.style.setProperty('--rx', t.rx.toFixed(3) + 'deg');
        t.el.style.setProperty('--ry', t.ry.toFixed(3) + 'deg');
      });
      tiltFrame = busy ? requestAnimationFrame(tiltTick) : 0;
    };
    const wakeTilt = () => { if (!tiltFrame) tiltFrame = requestAnimationFrame(tiltTick); };

    tilts.forEach(t => {
      t.el.addEventListener('pointermove', (e) => {
        const r = t.el.getBoundingClientRect();
        t.tx = -((e.clientY - r.top) / r.height - 0.5) * 12;
        t.ty = ((e.clientX - r.left) / r.width - 0.5) * 12;
        wakeTilt();
      });
      t.el.addEventListener('pointerleave', () => {
        t.tx = 0;
        t.ty = 0;
        wakeTilt();
      });
    });
  })();

  // -------------------------------------------------------------------------
  // 15. Button text roll: wraps every button label so it can roll on hover
  // -------------------------------------------------------------------------
  (() => {
    if (isReducedMotion) return;

    const buttonSelector = [
      '.btn-talk',
      '.btn-primary-gold',
      '.btn-secondary-outline',
      '.btn-project-primary',
      '.btn-project-secondary',
      '.profile-open-pdf-link'
    ].join(',');

    document.querySelectorAll(buttonSelector).forEach(button => {
      // Only plain text labels: skip arrows, icons and the glow layer.
      const labels = Array.from(button.children).filter(el =>
        el.tagName === 'SPAN' &&
        el.children.length === 0 &&
        el.textContent.trim() !== '' &&
        !el.matches('.arrow-icon, .btn-arrow, .btn-glow-layer')
      );
      if (!labels.length) return;

      labels.forEach(label => {
        const text = label.textContent.trim();
        const current = document.createElement('span');
        current.className = 'roll-line';
        current.textContent = text;

        const incoming = document.createElement('span');
        incoming.className = 'roll-line roll-line--in';
        incoming.setAttribute('aria-hidden', 'true');
        incoming.textContent = text;

        label.textContent = '';
        label.classList.add('roll');
        label.append(current, incoming);
      });

      button.classList.add('has-roll');
    });
  })();

  // -------------------------------------------------------------------------
  // 16. Education Section: entrance reveal, scroll-lit timeline, card tilt
  // -------------------------------------------------------------------------
  (() => {
    const section = document.getElementById('education');
    if (!section) return;

    // Mouse-move tilt + cursor glow on every card: the same motion as the About portrait.
    // Listeners sit on the still <li>; only the card inside moves, so hover never flickers.
    if (canHover && !isReducedMotion) {
      section.querySelectorAll('.ed-item').forEach(item => {
        const card = item.querySelector('.ed-card');
        const glow = item.querySelector('.ed-glow');
        if (!card) return;
        let hovering = false;

        item.addEventListener('mouseenter', () => {
          hovering = true;
          item.classList.add('is-tilting');
          if (glow) glow.style.opacity = '1';
        });

        item.addEventListener('mousemove', (e) => {
          if (!hovering) return;
          const bounds = item.getBoundingClientRect();
          const mouseX = Math.min(Math.max(e.clientX - bounds.left, 0), bounds.width);
          const mouseY = Math.min(Math.max(e.clientY - bounds.top, 0), bounds.height);
          const xNorm = mouseX / bounds.width - 0.5;
          const yNorm = mouseY / bounds.height - 0.5;
          const maxTilt = 8.5;

          card.style.transform = `perspective(1000px) rotateX(${(-yNorm * maxTilt).toFixed(2)}deg) rotateY(${(xNorm * maxTilt).toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`;
          if (glow) {
            glow.style.background = `radial-gradient(circle 260px at ${mouseX}px ${mouseY}px, rgba(230, 201, 103, 0.22), transparent 75%)`;
          }
        });

        item.addEventListener('mouseleave', () => {
          hovering = false;
          item.classList.remove('is-tilting');
          card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
          if (glow) glow.style.opacity = '0';
        });
      });
    }

    const items = Array.from(section.querySelectorAll('.ed-item'));
    const revealTargets = section.querySelectorAll('[data-reveal]');

    if (!('IntersectionObserver' in window) || isReducedMotion) {
      // Everything simply shows, fully lit, with no motion.
      revealTargets.forEach(el => el.classList.add('is-revealed'));
      items.forEach(item => item.classList.add('is-lit'));
      return;
    }

    // Arm the section only once JS is running, so content never stays hidden if scripts fail.
    section.classList.add('ed-armed');

    const io = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -40px 0px' });
    revealTargets.forEach(el => io.observe(el));

    // Scroll-lit spine: the gold line fills down to the point 62% of the way down the viewport.
    const nodeCentre = (item) => {
      const rect = item.querySelector('.ed-node').getBoundingClientRect();
      return rect.top + rect.height / 2;
    };

    let frame = 0;
    const paint = () => {
      frame = 0;
      const anchor = window.innerHeight * 0.62;
      const centres = items.map(nodeCentre);
      items.forEach((item, i) => {
        item.classList.toggle('is-lit', centres[i] <= anchor);
        if (i < items.length - 1) {
          const span = centres[i + 1] - centres[i];
          const filled = span > 0 ? Math.min(Math.max((anchor - centres[i]) / span, 0), 1) : 0;
          item.style.setProperty('--seg', filled.toFixed(3));
        }
      });
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(paint); };

    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    window.addEventListener('load', schedule);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(schedule);
    schedule();
  })();

  // -------------------------------------------------------------------------
  // 18. Services Section: entrance reveal + cursor glow inside each card
  // -------------------------------------------------------------------------
  (() => {
    const section = document.getElementById('services');
    if (!section) return;

    const targets = section.querySelectorAll('[data-sv]');
    if ('IntersectionObserver' in window && !isReducedMotion) {
      // Armed only once JS runs, so content never stays hidden if scripts fail.
      section.classList.add('sv-armed');
      const io = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
      targets.forEach(el => io.observe(el));
    } else {
      targets.forEach(el => el.classList.add('is-revealed'));
    }

    // Cursor glow: measured on the still <li>, so it never jitters while the card lifts.
    if (canHover && !isReducedMotion) {
      section.querySelectorAll('.sv-item').forEach(item => {
        item.addEventListener('mousemove', (e) => {
          const rect = item.getBoundingClientRect();
          item.style.setProperty('--mx', (e.clientX - rect.left) + 'px');
          item.style.setProperty('--my', (e.clientY - rect.top) + 'px');
        });
      });
    }
  })();

  // -------------------------------------------------------------------------
  // 19. Achievements Section: entrance reveal, scroll-lit timeline, card tilt
  // -------------------------------------------------------------------------
  (() => {
    const section = document.getElementById('achievements');
    if (!section) return;

    // Mouse-move tilt + cursor glow on every card: the same motion as the About portrait.
    // Listeners sit on the still <li>; only the card inside moves, so hover never flickers.
    if (canHover && !isReducedMotion) {
      section.querySelectorAll('.ac-item').forEach(item => {
        const card = item.querySelector('.ac-card');
        const glow = item.querySelector('.ac-glow');
        if (!card) return;
        let hovering = false;

        item.addEventListener('mouseenter', () => {
          hovering = true;
          item.classList.add('is-tilting');
          if (glow) glow.style.opacity = '1';
        });

        item.addEventListener('mousemove', (e) => {
          if (!hovering) return;
          const bounds = item.getBoundingClientRect();
          const mouseX = Math.min(Math.max(e.clientX - bounds.left, 0), bounds.width);
          const mouseY = Math.min(Math.max(e.clientY - bounds.top, 0), bounds.height);
          const xNorm = mouseX / bounds.width - 0.5;
          const yNorm = mouseY / bounds.height - 0.5;
          const maxTilt = 8.5;

          card.style.transform = `perspective(1000px) rotateX(${(-yNorm * maxTilt).toFixed(2)}deg) rotateY(${(xNorm * maxTilt).toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`;
          if (glow) {
            glow.style.background = `radial-gradient(circle 260px at ${mouseX}px ${mouseY}px, rgba(230, 201, 103, 0.22), transparent 75%)`;
          }
        });

        item.addEventListener('mouseleave', () => {
          hovering = false;
          item.classList.remove('is-tilting');
          card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
          if (glow) glow.style.opacity = '0';
        });
      });
    }

    const items = Array.from(section.querySelectorAll('.ac-item'));
    const revealTargets = section.querySelectorAll('[data-reveal]');

    if (!('IntersectionObserver' in window) || isReducedMotion) {
      // Everything simply shows, fully lit, with no motion.
      revealTargets.forEach(el => el.classList.add('is-revealed'));
      items.forEach(item => item.classList.add('is-lit'));
      return;
    }

    // Arm the section only once JS is running, so content never stays hidden if scripts fail.
    section.classList.add('ac-armed');

    const io = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -40px 0px' });
    revealTargets.forEach(el => io.observe(el));

    // Scroll-lit spine: the gold line fills down to the point 62% of the way down the viewport.
    const nodeCentre = (item) => {
      const rect = item.querySelector('.ac-node').getBoundingClientRect();
      return rect.top + rect.height / 2;
    };

    let frame = 0;
    const paint = () => {
      frame = 0;
      const anchor = window.innerHeight * 0.62;
      const centres = items.map(nodeCentre);
      items.forEach((item, i) => {
        item.classList.toggle('is-lit', centres[i] <= anchor);
        if (i < items.length - 1) {
          const span = centres[i + 1] - centres[i];
          const filled = span > 0 ? Math.min(Math.max((anchor - centres[i]) / span, 0), 1) : 0;
          item.style.setProperty('--seg', filled.toFixed(3));
        }
      });
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(paint); };

    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    window.addEventListener('load', schedule);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(schedule);
    schedule();
  })();

  // -------------------------------------------------------------------------
  // 20. About stat cards: mouse tilt + cursor glow (same motion as the portrait)
  // -------------------------------------------------------------------------
  (() => {
    if (!canHover || isReducedMotion) return;

    document.querySelectorAll('.about-stats-row .stat-card').forEach(card => {
      const face = card.querySelector('.stat-face');
      if (!face) return;
      let hovering = false;

      card.addEventListener('mouseenter', () => {
        hovering = true;
        card.classList.add('is-tilting');
      });

      card.addEventListener('mousemove', (e) => {
        if (!hovering) return;
        // Measured on the still wrapper, so the lifting card never makes the numbers jitter.
        const bounds = card.getBoundingClientRect();
        const mouseX = Math.min(Math.max(e.clientX - bounds.left, 0), bounds.width);
        const mouseY = Math.min(Math.max(e.clientY - bounds.top, 0), bounds.height);
        const xNorm = mouseX / bounds.width - 0.5;
        const yNorm = mouseY / bounds.height - 0.5;
        const maxTilt = 8.5;

        face.style.transform = `perspective(1000px) rotateX(${(-yNorm * maxTilt).toFixed(2)}deg) rotateY(${(xNorm * maxTilt).toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`;
        card.style.setProperty('--mx', mouseX + 'px');
        card.style.setProperty('--my', mouseY + 'px');
      });

      card.addEventListener('mouseleave', () => {
        hovering = false;
        card.classList.remove('is-tilting');
        face.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      });
    });
  })();

  // -------------------------------------------------------------------------
  // 21. Contact Section: tilt cards, field-by-field liquid unlock, EmailJS send
  // -------------------------------------------------------------------------
  (() => {
    const section = document.getElementById('contact');
    if (!section) return;

    // ---------------------------------------------------------------------
    // EmailJS configuration (single place to edit)
    //
    // serviceId / templateId : your existing "Contact Us" template and service.
    // publicKey              : EmailJS dashboard > Account > General > Public Key.
    //                          It is meant to live in frontend code. NEVER put the
    //                          Private Key (access token) here.
    // params                 : left = what this form sends, right = the variable
    //                          name used in your EmailJS template. These are the
    //                          names of EmailJS's pre-built "Contact Us" template
    //                          ({{name}} {{email}} {{title}} {{message}} {{time}}).
    //                          If your template uses other names, change ONLY the
    //                          right-hand side.
    // ---------------------------------------------------------------------
    const EMAILJS = {
      endpoint: 'https://api.emailjs.com/api/v1.0/email/send',
      serviceId: 'service_tnltrcm',
      templateId: 'template_6yx2h0o',
      publicKey: 'MHnYua4kmwBN4CWZD',
      params: {
        name: 'name',
        email: 'email',
        subject: 'title',
        message: 'message',
        time: 'time'
      },
      timeoutMs: 20000
    };

    const MSG_SUCCESS = 'Your message has been sent successfully! I\u2019ll get back to you soon.';
    const MSG_ERROR = 'Something went wrong. Please try again later.';

    // ---------------------------------------------------------------------
    // Tilt (same motion as the Achievements cards) and cursor glow
    // ---------------------------------------------------------------------
    if (canHover && !isReducedMotion) {
      section.querySelectorAll('.ct-item').forEach(item => {
        const card = item.querySelector('.ct-card');
        const glow = item.querySelector('.ct-glow');
        if (!card) return;
        let hovering = false;

        item.addEventListener('mouseenter', () => {
          hovering = true;
          item.classList.add('is-tilting');
          if (glow) glow.style.opacity = '1';
        });

        item.addEventListener('mousemove', (e) => {
          if (!hovering) return;
          const bounds = item.getBoundingClientRect();
          const mouseX = Math.min(Math.max(e.clientX - bounds.left, 0), bounds.width);
          const mouseY = Math.min(Math.max(e.clientY - bounds.top, 0), bounds.height);
          const xNorm = mouseX / bounds.width - 0.5;
          const yNorm = mouseY / bounds.height - 0.5;
          const maxTilt = 13; // these cards are wide and short, so they need a bigger angle to read clearly

          card.style.transform = `perspective(900px) rotateX(${(-yNorm * maxTilt).toFixed(2)}deg) rotateY(${(xNorm * maxTilt).toFixed(2)}deg) scale3d(1.03, 1.03, 1.03)`;
          if (glow) {
            glow.style.background = `radial-gradient(circle 260px at ${mouseX}px ${mouseY}px, rgba(230, 201, 103, 0.22), transparent 75%)`;
          }
        });

        item.addEventListener('mouseleave', () => {
          hovering = false;
          item.classList.remove('is-tilting');
          card.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
          if (glow) glow.style.opacity = '0';
        });
      });

      // Form panel: the same tilt, scale and cursor glow as the three cards above.
      const panel = document.getElementById('ctPanel');
      const panelGlow = panel && panel.querySelector('.ct-glow');
      if (panel && panelGlow) {
        panel.addEventListener('mouseenter', () => {
          panel.classList.add('is-tilting');
          panelGlow.style.opacity = '1';
        });

        panel.addEventListener('mousemove', (e) => {
          const bounds = panel.getBoundingClientRect();
          const mouseX = Math.min(Math.max(e.clientX - bounds.left, 0), bounds.width);
          const mouseY = Math.min(Math.max(e.clientY - bounds.top, 0), bounds.height);
          const xNorm = mouseX / bounds.width - 0.5;
          const yNorm = mouseY / bounds.height - 0.5;
          const maxTilt = 8.5; // same angle as the About portrait and the other large cards

          panel.style.transform = `perspective(1000px) rotateX(${(-yNorm * maxTilt).toFixed(2)}deg) rotateY(${(xNorm * maxTilt).toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`;
          panelGlow.style.background = `radial-gradient(circle 300px at ${mouseX}px ${mouseY}px, rgba(230, 201, 103, 0.18), transparent 75%)`;
        });

        panel.addEventListener('mouseleave', () => {
          panel.classList.remove('is-tilting');
          panel.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
          panelGlow.style.opacity = '0';
        });
      }
    }

    // ---------------------------------------------------------------------
    // Entrance reveal. Armed only once JS is running, so nothing stays hidden if scripts fail.
    // ---------------------------------------------------------------------
    const revealTargets = section.querySelectorAll('.ct-rv');
    if ('IntersectionObserver' in window && !isReducedMotion) {
      section.classList.add('ct-armed');
      const io = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
      revealTargets.forEach(el => io.observe(el));
    } else {
      revealTargets.forEach(el => el.classList.add('is-revealed'));
    }

    // ---------------------------------------------------------------------
    // Form
    // ---------------------------------------------------------------------
    const form = document.getElementById('contactForm');
    if (!form) return;

    const submitWrap = document.getElementById('ctSubmitWrap');
    const submitBtn = document.getElementById('ctSubmit');
    const liquidPath = document.getElementById('ctLiquid');
    const hint = document.getElementById('ctHint');
    const statusBox = document.getElementById('ctStatus');
    const progress = document.getElementById('ctProgress');
    const spine = form.querySelector('.ct-spine');
    const countEl = document.getElementById('ctCount');
    const labelTexts = submitBtn.querySelectorAll('.ct-label-t');

    const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    const REQUIRED_MSG = 'This field is required.';
    const RULES = {
      name:    { test: v => v.length >= 2,  msg: 'Please enter your full name (at least 2 characters).' },
      email:   { test: v => v.length <= 254 && EMAIL_RE.test(v), msg: 'Please enter a valid email address.' },
      subject: { test: v => v.length >= 3,  msg: 'Please add a subject (at least 3 characters).' },
      message: { test: v => v.length >= 10, msg: 'Please write a message (at least 10 characters).' }
    };

    const fields = Array.from(form.querySelectorAll('[data-ct-field]')).map(el => ({
      key: el.dataset.ctField,
      el,
      input: el.querySelector('.ct-input'),
      node: el.querySelector('.ct-node'),
      err: el.querySelector('.ct-error'),
      valid: false,     // the current value passes validation
      credited: false,  // its bead has landed, so it counts towards the fill
      pending: false,   // a bead is currently falling
      touched: false    // the visitor has left the field at least once
    }));
    const TOTAL = fields.length;
    let sending = false;

    const validate = (f) => {
      const value = f.input.value.trim();
      if (!value) return { ok: false, msg: REQUIRED_MSG };
      const rule = RULES[f.key];
      return rule.test(value) ? { ok: true, msg: '' } : { ok: false, msg: rule.msg };
    };

    const showError = (f) => {
      const res = validate(f);
      f.err.textContent = res.ok ? '' : res.msg;
      f.el.classList.toggle('has-error', !res.ok);
      f.input.setAttribute('aria-invalid', res.ok ? 'false' : 'true');
    };

    const clearError = (f) => {
      f.err.textContent = '';
      f.el.classList.remove('has-error');
      f.input.removeAttribute('aria-invalid');
    };

    // ---- status box -------------------------------------------------------
    const ICON_OK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';
    const ICON_ERR = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 8v5"/><path d="M12 16.5v.01"/></svg>';

    const STATUS_MS = { success: 6000, error: 8000 }; // how long each message stays before it fades away
    let statusTimer = 0;
    let statusFadeTimer = 0;

    const hideStatus = () => {
      clearTimeout(statusTimer);
      clearTimeout(statusFadeTimer);
      statusBox.hidden = true;
      statusBox.classList.remove('is-leaving');
      statusBox.textContent = '';
    };

    const showStatus = (type) => {
      hideStatus();
      statusBox.className = 'ct-status ct-status--' + type;
      statusBox.innerHTML = (type === 'success' ? ICON_OK : ICON_ERR) + '<span></span>';
      statusBox.lastChild.textContent = type === 'success' ? MSG_SUCCESS : MSG_ERROR;
      statusBox.hidden = false;

      // Fade out, then remove, after a few seconds
      statusTimer = setTimeout(() => {
        statusBox.classList.add('is-leaving');
        statusFadeTimer = setTimeout(hideStatus, 450);
      }, STATUS_MS[type]);
    };

    // ---- liquid fill ------------------------------------------------------
    // The gold is an SVG path whose right edge is a gentle wave. `current` chases `target`;
    // the wave slosh dies down once it arrives. rAF only runs while something is moving.
    const liquid = { current: 0, target: 0, raf: 0, last: 0, phase: 0, amp: 0 };
    const WAVE_POINTS = 28;
    const BULGE_PX = 7;  // rounded "meniscus" at the front of the gold
    const WAVE_PX = 6;   // extra slosh while the gold is moving
    let btnWidth = 600;  // cached; updated whenever the form is resized

    const paintLiquid = () => {
      const c = liquid.current;

      if (c <= 0) {
        liquidPath.setAttribute('d', 'M0 0H-1V100H0Z');
        submitBtn.style.setProperty('--ct-clip', '100%');
        return;
      }
      if (c >= 1) {
        liquidPath.setAttribute('d', 'M0 0H101V100H0Z');
        submitBtn.style.setProperty('--ct-clip', '0%');
        return;
      }

      // The wave is sized in real pixels, then converted to the SVG's 0-100 units
      const unit = 100 / Math.max(btnWidth, 1);
      const bulge = BULGE_PX * unit;
      const wave = WAVE_PX * unit * liquid.amp;
      const edge = -(bulge + wave) + c * (100 + bulge + 2 * wave);

      const xAt = (y) => edge + bulge * Math.sin(Math.PI * y / 100) + wave * Math.sin(y * 0.062 + liquid.phase);

      let d = 'M0 0';
      for (let i = 0; i <= WAVE_POINTS; i++) {
        const y = (i / WAVE_POINTS) * 100;
        d += ' L' + xAt(y).toFixed(2) + ' ' + y.toFixed(1);
      }
      d += ' L0 100 Z';
      liquidPath.setAttribute('d', d);

      // Dark label is revealed exactly where the gold edge is at the vertical middle of the button
      const pct = Math.min(Math.max(xAt(50), 0), 100);
      submitBtn.style.setProperty('--ct-clip', (100 - pct).toFixed(2) + '%');
    };

    const stepLiquid = (ts) => {
      const dt = Math.min((ts - liquid.last) / 1000 || 0.016, 0.05);
      liquid.last = ts;

      const diff = liquid.target - liquid.current;
      liquid.current += diff * (1 - Math.exp(-dt * 5.5));
      if (Math.abs(liquid.target - liquid.current) < 0.0015) liquid.current = liquid.target;

      const moving = liquid.current !== liquid.target;
      liquid.phase += dt * 7;
      liquid.amp += ((moving ? 1 : 0) - liquid.amp) * (1 - Math.exp(-dt * 4));

      paintLiquid();

      if (moving || liquid.amp > 0.02) {
        liquid.raf = requestAnimationFrame(stepLiquid);
      } else {
        liquid.raf = 0;
        liquid.amp = 0;
        paintLiquid();
        refreshState();
      }
    };

    const setFillTarget = (snap = false) => {
      liquid.target = fields.filter(f => f.credited).length / TOTAL;
      if (isReducedMotion || snap) {
        liquid.current = liquid.target;
        paintLiquid();
        refreshState();
        return;
      }
      if (!liquid.raf) {
        liquid.last = performance.now();
        liquid.raf = requestAnimationFrame(stepLiquid);
      }
    };

    // ---- button / hint state ---------------------------------------------
    const setLabel = (text) => labelTexts.forEach(el => {
      const lines = el.querySelectorAll('.roll-line');
      if (lines.length) lines.forEach(line => { line.textContent = text; });
      else el.textContent = text;
    });

    function refreshState() {
      const validCount = fields.filter(f => f.valid).length;
      const allValid = validCount === TOTAL;
      const filled = fields.every(f => f.credited) && liquid.current >= 0.999;
      const ready = allValid && filled && !sending;

      submitBtn.disabled = !ready;
      submitBtn.classList.toggle('is-ready', ready);
      submitWrap.classList.toggle('is-ready', ready);
      submitBtn.classList.toggle('is-loading', sending);
      submitBtn.setAttribute('aria-busy', sending ? 'true' : 'false');

      progress.innerHTML = '<b>' + String(validCount).padStart(2, '0') + '</b> / ' + String(TOTAL).padStart(2, '0');

      let text;
      if (sending) text = 'Sending your message\u2026';
      else if (ready) text = 'All set. You can send your message now.';
      else if (allValid) text = 'Almost there\u2026';
      else if (validCount === 0) text = 'Fill in all ' + TOTAL + ' fields to unlock the button.';
      else text = validCount + ' of ' + TOTAL + ' complete. ' + (TOTAL - validCount) + ' to go.';
      hint.textContent = text;
      hint.classList.toggle('is-ready', ready);
    }

    // ---- the falling bead -------------------------------------------------
    // Positions come from layout offsets (not screen rects), so they stay exact while the panel is tilted.
    const posIn = (el) => {
      let x = 0;
      let y = 0;
      for (let n = el; n && n !== form; n = n.offsetParent) {
        x += n.offsetLeft;
        y += n.offsetTop;
      }
      return { x, y };
    };

    const spawnDrop = (f) => new Promise((resolve) => {
      const np = posIn(f.node);
      const x = np.x + f.node.offsetWidth / 2;
      const y0 = np.y + f.node.offsetHeight / 2;
      const y1 = posIn(submitBtn).y + 14; // lands just inside the top edge of the button

      const drop = document.createElement('span');
      drop.className = 'ct-drop';
      drop.setAttribute('aria-hidden', 'true');
      drop.innerHTML = '<i></i>';
      drop.style.left = x + 'px';
      drop.style.top = y0 + 'px';
      form.appendChild(drop);

      const done = () => {
        drop.remove();
        resolve({ x, y: y1 });
      };

      if (typeof drop.animate !== 'function') { done(); return; }

      const body = drop.firstElementChild;
      const dist = Math.max(y1 - y0, 24);
      const fall = Math.min(380 + dist * 1.1, 1100);

      // 1) the bead pinches off the node, 2) gravity takes over and it stretches as it falls
      drop.animate(
        [{ transform: 'translateY(0) scale(0.15)', opacity: 0 }, { transform: 'translateY(7px) scale(1)', opacity: 1 }],
        { duration: 200, easing: 'cubic-bezier(0.2, 0.8, 0.3, 1)', fill: 'forwards' }
      ).finished.then(() => {
        body.animate(
          [{ transform: 'scale(1, 1)' }, { transform: 'scale(0.8, 1.55)' }],
          { duration: fall, easing: 'ease-in', fill: 'forwards' }
        );
        return drop.animate(
          [{ transform: 'translateY(7px) scale(1)' }, { transform: 'translateY(' + dist + 'px) scale(1)' }],
          { duration: fall, easing: 'cubic-bezier(0.55, 0, 0.9, 0.45)', fill: 'forwards' }
        ).finished;
      }).then(done, done);
    });

    const splash = (pos) => {
      const ring = document.createElement('span');
      ring.className = 'ct-splash';
      ring.setAttribute('aria-hidden', 'true');
      ring.style.left = pos.x + 'px';
      ring.style.top = pos.y + 'px';
      form.appendChild(ring);
      ring.addEventListener('animationend', () => ring.remove(), { once: true });

      submitBtn.classList.remove('is-bumped');
      void submitBtn.offsetWidth;
      submitBtn.classList.add('is-bumped');
      submitBtn.addEventListener('animationend', () => submitBtn.classList.remove('is-bumped'), { once: true });
    };

    // ---- field becomes valid / invalid -----------------------------------
    const credit = (f, snap = false) => {
      if (f.credited) return;
      f.credited = true;
      setFillTarget(snap);
    };

    const becomeValid = (f, animate) => {
      f.node.classList.add('is-done');
      if (!animate || isReducedMotion) { credit(f, !animate); return; }
      if (f.pending) return;
      f.pending = true;
      spawnDrop(f).then((pos) => {
        f.pending = false;
        // It may have been cleared again while the bead was in the air
        if (!f.valid) return;
        splash(pos);
        credit(f);
      });
    };

    const becomeInvalid = (f) => {
      f.node.classList.remove('is-done');
      if (f.credited) {
        f.credited = false;
        setFillTarget(); // the gold drains back
      }
      refreshState();
    };

    const syncField = (f, animate) => {
      const res = validate(f);
      const was = f.valid;
      f.valid = res.ok;
      if (res.ok && !was) becomeValid(f, animate);
      else if (!res.ok && was) becomeInvalid(f);
      return res;
    };

    // Typing, paste, and browser autofill / suggestion picks all play the same falling-bead animation
    const onInput = (f, ev) => {
      if (sending) return;
      if (!statusBox.hidden) hideStatus();
      const res = syncField(f, true);
      if (f.touched) {
        if (res.ok) clearError(f); else showError(f);
      } else if (res.ok) {
        clearError(f);
      }
      if (f.key === 'message' && countEl) countEl.textContent = f.input.value.length + ' / ' + f.input.maxLength;
      refreshState();
    };

    fields.forEach(f => {
      f.input.addEventListener('input', (ev) => onInput(f, ev));
      f.input.addEventListener('change', (ev) => onInput(f, ev)); // browser autofill
      f.input.addEventListener('blur', () => {
        f.touched = true;
        showError(f);
      });
    });

    // ---- spine (the rail the beads fall along) ----------------------------
    const layoutSpine = () => {
      btnWidth = submitBtn.clientWidth || btnWidth;
      if (!spine) return;
      const first = posIn(fields[0].node);
      const top = first.y + fields[0].node.offsetHeight / 2;
      spine.style.top = top + 'px';
      spine.style.height = Math.max(posIn(submitBtn).y - top + 14, 0) + 'px';
    };
    if ('ResizeObserver' in window) new ResizeObserver(layoutSpine).observe(form);
    window.addEventListener('resize', layoutSpine, { passive: true });
    window.addEventListener('load', layoutSpine);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(layoutSpine);
    layoutSpine();

    // ---- locked button: soft light follows the cursor (like the reference video) ----
    if (canHover && !isReducedMotion) {
      submitWrap.addEventListener('mousemove', (e) => {
        const b = submitWrap.getBoundingClientRect();
        submitWrap.style.setProperty('--mx', (e.clientX - b.left) + 'px');
        submitWrap.style.setProperty('--my', (e.clientY - b.top) + 'px');
      });
    }

    // ---- clicking the locked button: show what is missing -----------------
    submitWrap.addEventListener('click', () => {
      if (!submitBtn.disabled || sending) return;
      const missing = fields.find(f => !f.valid);
      if (missing) {
        missing.touched = true;
        showError(missing);
        missing.input.focus();
      }
      submitWrap.classList.remove('is-nudged');
      void submitWrap.offsetWidth;
      submitWrap.classList.add('is-nudged');
      submitWrap.addEventListener('animationend', () => submitWrap.classList.remove('is-nudged'), { once: true });
    });

    // ---- submit -----------------------------------------------------------
    const setSending = (on) => {
      sending = on;
      fields.forEach(f => { f.input.readOnly = on; });
      setLabel(on ? 'SENDING\u2026' : 'SEND MESSAGE \u2197');
      refreshState();
    };

    const resetForm = () => {
      form.reset();
      fields.forEach(f => {
        f.valid = false;
        f.touched = false;
        f.pending = false;
        clearError(f);
        f.node.classList.remove('is-done');
        f.credited = false;
      });
      if (countEl) countEl.textContent = '0 / ' + fields.find(f => f.key === 'message').input.maxLength;
      setFillTarget();
      refreshState();
    };

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (sending) return; // no double submissions while a request is in flight

      // Re-validate everything: never trust the button state alone
      const invalid = fields.filter(f => !syncField(f, false).ok);
      if (invalid.length) {
        invalid.forEach(f => { f.touched = true; showError(f); });
        invalid[0].input.focus();
        refreshState();
        return;
      }

      hideStatus();

      if (!EMAILJS.publicKey) {
        console.error('[Contact] EmailJS public key is not set. Add it to EMAILJS.publicKey in js/main.js (section 21). Nothing was sent.');
        showStatus('error');
        return;
      }

      const P = EMAILJS.params;
      const val = (key) => fields.find(f => f.key === key).input.value.trim();
      const templateParams = {};
      templateParams[P.name] = val('name');
      templateParams[P.email] = val('email');
      templateParams[P.subject] = val('subject');
      templateParams[P.message] = val('message');
      templateParams[P.time] = new Date().toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' });

      setSending(true);

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), EMAILJS.timeoutMs);

      try {
        const res = await fetch(EMAILJS.endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            service_id: EMAILJS.serviceId,
            template_id: EMAILJS.templateId,
            user_id: EMAILJS.publicKey,
            template_params: templateParams
          }),
          signal: controller.signal
        });

        if (!res.ok) {
          const detail = await res.text().catch(() => '');
          throw new Error('EmailJS responded with ' + res.status + (detail ? ': ' + detail : ''));
        }

        // Only now has EmailJS confirmed the send
        setSending(false);
        resetForm();
        showStatus('success');
      } catch (err) {
        console.error('[Contact] Sending failed:', err);
        setSending(false);
        showStatus('error'); // the form keeps what the visitor typed
      } finally {
        clearTimeout(timer);
      }
    });

    // ---- initial sync (browser form restore / autofill, no animation) ------
    const initialSync = () => {
      fields.forEach(f => { if (f.input.value) { syncField(f, false); } });
      if (countEl) countEl.textContent = fields.find(f => f.key === 'message').input.value.length + ' / ' + fields.find(f => f.key === 'message').input.maxLength;
      refreshState();
    };
    initialSync();
    window.addEventListener('pageshow', (ev) => { if (ev.persisted) initialSync(); });

    paintLiquid();
    refreshState();
  })();

  // -------------------------------------------------------------------------
  // 22. Footer: entrance reveal, smooth links, resume link, back-to-top ring, name spotlight
  // -------------------------------------------------------------------------
  (() => {
    const footer = document.getElementById('footer');
    if (!footer) return;

    // Current year, so the copyright line never goes stale
    const yearEl = footer.querySelector('[data-ft-year]');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // Section links use the same smooth scrolling as the navbar
    footer.querySelectorAll('[data-ft-nav]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        handleNavClick(link.getAttribute('href'));
      });
    });

    // Back to top, with a ring that fills as you scroll down the page
    const topButton = footer.querySelector('#ftTop');
    if (topButton) {
      topButton.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        if (location.hash) history.replaceState(null, '', location.pathname + location.search);
      });

      let frame = 0;
      const paintRing = () => {
        frame = 0;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const share = max > 0 ? Math.min(Math.max(window.scrollY / max, 0), 1) : 0;
        topButton.style.setProperty('--p', share.toFixed(3));
      };
      const scheduleRing = () => { if (!frame) frame = requestAnimationFrame(paintRing); };
      window.addEventListener('scroll', scheduleRing, { passive: true });
      window.addEventListener('resize', scheduleRing, { passive: true });
      paintRing();
    }

    // Entrance: armed only once JS runs, so the footer is never left invisible if scripts fail
    if ('IntersectionObserver' in window && !isReducedMotion) {
      footer.classList.add('ft-armed');
      const io = new IntersectionObserver((entries, observer) => {
        if (entries.some(entry => entry.isIntersecting)) {
          footer.classList.add('is-revealed');
          observer.disconnect();
        }
      }, { threshold: 0.12 });
      io.observe(footer);
    } else {
      footer.classList.add('is-revealed');
    }

    // A gold light follows the cursor across the large outlined name
    const wordmark = footer.querySelector('.ft-wordmark');
    if (wordmark && canHover && !isReducedMotion) {
      wordmark.style.pointerEvents = 'auto';
      wordmark.addEventListener('mouseenter', () => wordmark.classList.add('is-lit'));
      wordmark.addEventListener('mousemove', (e) => {
        const rect = wordmark.getBoundingClientRect();
        wordmark.style.setProperty('--mx', (e.clientX - rect.left) + 'px');
        wordmark.style.setProperty('--my', (e.clientY - rect.top) + 'px');
      });
      wordmark.addEventListener('mouseleave', () => wordmark.classList.remove('is-lit'));
    }
  })();
});