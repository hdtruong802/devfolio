/**
 * ============================================================
 *  COSMIC TECH PORTFOLIO — Interactive Effects
 * ============================================================
 */

(function () {
  'use strict';

  /* ----------------------------------------------------------
   * 1. STARFIELD — Canvas-based particle constellation
   * ---------------------------------------------------------- */
  const canvas = document.getElementById('starfield');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let stars = [];
    let shootingStars = [];
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const getStarCount = () => {
      if (prefersReducedMotion) return 60;
      if (window.innerWidth < 480) return 80;
      if (window.innerWidth < 768) return 120;
      if (window.innerWidth < 1200) return 170;
      return 220;
    };
    let STAR_COUNT = getStarCount();
    const CONNECTION_DISTANCE = prefersReducedMotion ? 80 : 120;
    let mouse = { x: -1000, y: -1000 };
    let animationId;
    let isPageVisible = true;

    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    class Star {
      constructor() {
        this.reset();
      }
      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 1.8 + 0.3;
        this.speedX = (Math.random() - 0.5) * 0.15;
        this.speedY = (Math.random() - 0.5) * 0.15;
        this.opacity = Math.random() * 0.7 + 0.3;
        this.twinkleSpeed = Math.random() * 0.02 + 0.005;
        this.twinkleOffset = Math.random() * Math.PI * 2;
        // Color: mix of white, cyan, purple
        const colors = [
          '255, 255, 255',
          '139, 92, 246',
          '6, 182, 212',
          '236, 72, 153',
          '200, 200, 255'
        ];
        this.color = colors[Math.floor(Math.random() * colors.length)];
      }
      update(time) {
        this.x += this.speedX;
        this.y += this.speedY;

        // Mouse repulsion (subtle)
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          const force = (150 - dist) / 150 * 0.3;
          this.x += dx / dist * force;
          this.y += dy / dist * force;
        }

        // Wrap around edges
        if (this.x < -10) this.x = canvas.width + 10;
        if (this.x > canvas.width + 10) this.x = -10;
        if (this.y < -10) this.y = canvas.height + 10;
        if (this.y > canvas.height + 10) this.y = -10;

        // Twinkle
        this.currentOpacity = this.opacity * (0.6 + 0.4 * Math.sin(time * this.twinkleSpeed + this.twinkleOffset));
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.color}, ${this.currentOpacity})`;
        ctx.fill();

        // Glow for larger stars
        if (this.size > 1.2) {
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${this.color}, ${this.currentOpacity * 0.1})`;
          ctx.fill();
        }
      }
    }

    class ShootingStar {
      constructor() {
        this.reset();
      }
      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height * 0.5;
        this.length = Math.random() * 80 + 40;
        this.speed = Math.random() * 8 + 4;
        this.angle = Math.PI / 4 + (Math.random() - 0.5) * 0.3;
        this.opacity = 1;
        this.life = 1;
        this.decay = Math.random() * 0.015 + 0.008;
        this.active = false;
        this.timer = Math.random() * 600 + 200;
      }
      update() {
        if (!this.active) {
          this.timer--;
          if (this.timer <= 0) {
            this.active = true;
          }
          return;
        }
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;
        this.life -= this.decay;
        this.opacity = this.life;
        if (this.life <= 0 || this.x > canvas.width + 50 || this.y > canvas.height + 50) {
          this.reset();
        }
      }
      draw() {
        if (!this.active || this.opacity <= 0) return;
        const tailX = this.x - Math.cos(this.angle) * this.length;
        const tailY = this.y - Math.sin(this.angle) * this.length;
        const gradient = ctx.createLinearGradient(tailX, tailY, this.x, this.y);
        gradient.addColorStop(0, `rgba(255, 255, 255, 0)`);
        gradient.addColorStop(1, `rgba(255, 255, 255, ${this.opacity * 0.8})`);
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(this.x, this.y);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Bright head
        ctx.beginPath();
        ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.fill();
      }
    }

    function init() {
      resizeCanvas();
      stars = [];
      for (let i = 0; i < STAR_COUNT; i++) {
        stars.push(new Star());
      }
      shootingStars = [];
      for (let i = 0; i < 3; i++) {
        shootingStars.push(new ShootingStar());
      }
    }

    function drawConnections() {
      for (let i = 0; i < stars.length; i++) {
        for (let j = i + 1; j < stars.length; j++) {
          const dx = stars[i].x - stars[j].x;
          const dy = stars[i].y - stars[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECTION_DISTANCE) {
            const opacity = (1 - dist / CONNECTION_DISTANCE) * 0.12;
            ctx.beginPath();
            ctx.moveTo(stars[i].x, stars[i].y);
            ctx.lineTo(stars[j].x, stars[j].y);
            ctx.strokeStyle = `rgba(139, 92, 246, ${opacity})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
    }

    function animate(time) {
      if (!isPageVisible) {
        animationId = null;
        return;
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      stars.forEach(star => {
        star.update(time);
        star.draw();
      });

      drawConnections();

      shootingStars.forEach(ss => {
        ss.update();
        ss.draw();
      });

      animationId = requestAnimationFrame(animate);
    }

    // Events
    window.addEventListener('resize', () => {
      resizeCanvas();
      const newCount = getStarCount();
      if (newCount !== STAR_COUNT) {
        STAR_COUNT = newCount;
        init();
      }
    });

    document.addEventListener('visibilitychange', () => {
      isPageVisible = !document.hidden;
      if (isPageVisible && !animationId) {
        animate(performance.now());
      }
    });

    document.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });

    document.addEventListener('mouseleave', () => {
      mouse.x = -1000;
      mouse.y = -1000;
    });

    init();
    if (!prefersReducedMotion) {
      animate(0);
    } else {
      // Static single frame for reduced motion
      stars.forEach(star => { star.draw(); });
    }
  }

  /* ----------------------------------------------------------
   * 2. MOUSE GLOW — Radial glow following cursor
   * ---------------------------------------------------------- */
  const glow = document.getElementById('mouse-glow');
  if (glow) {
    let glowX = 0, glowY = 0;
    let targetX = 0, targetY = 0;

    document.addEventListener('mousemove', (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
    });

    function updateGlow() {
      glowX += (targetX - glowX) * 0.08;
      glowY += (targetY - glowY) * 0.08;
      glow.style.left = glowX + 'px';
      glow.style.top = glowY + 'px';
      requestAnimationFrame(updateGlow);
    }
    updateGlow();
  }

  /* ----------------------------------------------------------
   * 3. SCROLL REVEAL — IntersectionObserver animations
   * ---------------------------------------------------------- */
  const animateElements = document.querySelectorAll('[data-animate]');
  if (animateElements.length > 0) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target); // Only animate once
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px'
      }
    );

    animateElements.forEach((el) => observer.observe(el));
  }

  /* ----------------------------------------------------------
   * 4. NAVBAR GLASS EFFECT — Enhanced on scroll
   * ---------------------------------------------------------- */
  const navbar = document.querySelector('.navbar.is-fixed-top');
  if (navbar) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        navbar.style.background = 'rgba(5, 5, 26, 0.85)';
        navbar.style.borderBottomColor = 'rgba(139, 92, 246, 0.15)';
      } else {
        navbar.style.background = 'rgba(5, 5, 26, 0.6)';
        navbar.style.borderBottomColor = 'rgba(255, 255, 255, 0.08)';
      }
    });
  }

  /* ----------------------------------------------------------
   * 5. SMOOTH PARALLAX — Subtle depth for hero
   * ---------------------------------------------------------- */
  const heroSection = document.getElementById('hero-section');
  if (heroSection) {
    window.addEventListener('scroll', () => {
      const scrolled = window.scrollY;
      const heroContent = heroSection.querySelector('.hero-body');
      if (heroContent && scrolled < window.innerHeight) {
        heroContent.style.transform = `translateY(${scrolled * 0.15}px)`;
        heroContent.style.opacity = Math.max(0, 1 - scrolled / (window.innerHeight * 0.8));
      }
    });
  }

  /* ----------------------------------------------------------
   * 6. TILT EFFECT — Cards & Achievement cards tilt on mousemove
   * ---------------------------------------------------------- */
  const allTiltables = document.querySelectorAll('.card, .achievement-card');
  const tiltReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!tiltReducedMotion) {
  allTiltables.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -3;
      const rotateY = ((x - centerX) / centerX) * 3;

      card.style.transform = `translateY(-6px) perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'translateY(0) perspective(1000px) rotateX(0deg) rotateY(0deg)';
    });
  });
  }

  /* ----------------------------------------------------------
   * 7. TYPED SUBTITLE — Typewriter effect for hero subtitle
   * ---------------------------------------------------------- */
  const subtitleEl = document.getElementById('hero-subtitle');
  if (subtitleEl) {
    const originalHTML = subtitleEl.innerHTML;
    // Only run typing effect if not reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!prefersReducedMotion) {
      const textContent = subtitleEl.textContent.trim();
      subtitleEl.innerHTML = '';
      subtitleEl.style.visibility = 'visible';

      // Create cursor element
      const cursor = document.createElement('span');
      cursor.className = 'typing-cursor';
      subtitleEl.appendChild(cursor);

      let charIndex = 0;
      const typeSpeed = 35;

      function typeChar() {
        if (charIndex < textContent.length) {
          // Insert character before cursor
          const charNode = document.createTextNode(textContent[charIndex]);
          subtitleEl.insertBefore(charNode, cursor);
          charIndex++;
          setTimeout(typeChar, typeSpeed);
        } else {
          // Typing done — restore original HTML with links after a brief pause
          setTimeout(() => {
            subtitleEl.innerHTML = originalHTML;
          }, 800);
        }
      }

      // Start typing after a delay
      setTimeout(typeChar, 1200);
    }
  }

  /* ----------------------------------------------------------
   * 8. MODAL TRIGGERS — Support div.modal-trigger clicks
   * ---------------------------------------------------------- */
  document.querySelectorAll('.modal-trigger').forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const targetId = trigger.getAttribute('data-target');
      if (targetId) {
        const modal = document.getElementById(targetId);
        if (modal) {
          modal.classList.add('is-active');
        }
      }
    });
  });

  // Close modals
  document.querySelectorAll('.modal-background, .modal-card-head .delete, .modal-card-foot .button').forEach((closer) => {
    closer.addEventListener('click', () => {
      closer.closest('.modal').classList.remove('is-active');
    });
  });

  /* ----------------------------------------------------------
   * 9. CAROUSEL NAVIGATION
   * ---------------------------------------------------------- */
  window.nextCarouselSlide = function (btn) {
    const wrapper = btn.closest('.carousel-wrapper');
    const imgs = Array.from(wrapper.querySelectorAll('.carousel-img'));
    let activeIndex = imgs.findIndex(img => img.classList.contains('active'));
    imgs[activeIndex].classList.remove('active');
    activeIndex = (activeIndex + 1) % imgs.length;
    imgs[activeIndex].classList.add('active');
  };

  window.prevCarouselSlide = function (btn) {
    const wrapper = btn.closest('.carousel-wrapper');
    const imgs = Array.from(wrapper.querySelectorAll('.carousel-img'));
    let activeIndex = imgs.findIndex(img => img.classList.contains('active'));
    imgs[activeIndex].classList.remove('active');
    activeIndex = (activeIndex - 1 + imgs.length) % imgs.length;
    imgs[activeIndex].classList.add('active');
  };

  /* ----------------------------------------------------------
   * 10. NAVBAR BURGER + SMOOTH SCROLL
   * ---------------------------------------------------------- */
  const burger = document.querySelector('.navbar-burger');
  const navMenu = document.getElementById('navMenu');
  if (burger && navMenu) {
    burger.addEventListener('click', () => {
      burger.classList.toggle('is-active');
      navMenu.classList.toggle('is-active');
      burger.setAttribute('aria-expanded', burger.classList.contains('is-active'));
    });
    navMenu.querySelectorAll('.nav-link').forEach((link) => {
      link.addEventListener('click', () => {
        burger.classList.remove('is-active');
        navMenu.classList.remove('is-active');
        burger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const id = anchor.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  /* ----------------------------------------------------------
   * 11. SCROLLSPY — highlight active nav link
   * ---------------------------------------------------------- */
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = Array.from(navLinks)
    .map((link) => {
      const id = link.getAttribute('href');
      const el = id ? document.querySelector(id) : null;
      return el ? { link, el } : null;
    })
    .filter(Boolean);

  if (sections.length > 0) {
    const spyObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const match = sections.find((s) => s.el === entry.target);
            if (match) {
              navLinks.forEach((l) => {
                l.classList.remove('is-active');
                l.removeAttribute('aria-current');
              });
              match.link.classList.add('is-active');
              match.link.setAttribute('aria-current', 'page');
            }
          }
        });
      },
      { rootMargin: '-40% 0px -50% 0px', threshold: 0 }
    );
    sections.forEach(({ el }) => spyObserver.observe(el));
  }

  /* ----------------------------------------------------------
   * 12. SCROLL PROGRESS + BACK TO TOP + SCROLL CUE
   * ---------------------------------------------------------- */
  const scrollProgress = document.getElementById('scroll-progress');
  const backToTop = document.getElementById('back-to-top');
  const scrollCue = document.querySelector('.hero-scroll-cue');

  function onScroll() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    if (scrollProgress) scrollProgress.style.width = progress + '%';

    if (backToTop) {
      if (scrollTop > window.innerHeight * 0.6) {
        backToTop.hidden = false;
        backToTop.classList.add('is-visible');
      } else {
        backToTop.classList.remove('is-visible');
        backToTop.hidden = true;
      }
    }

    if (scrollCue) {
      scrollCue.classList.toggle('is-hidden', scrollTop > 80);
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ----------------------------------------------------------
   * 13. HERO MANDALA PARALLAX + PAUSE ON HIDDEN TAB
   * ---------------------------------------------------------- */
  const drumPattern = document.getElementById('hero-drum-pattern');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (drumPattern && !reducedMotion) {
    drumPattern.classList.add('is-parallax');

    document.addEventListener('mousemove', (e) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      const drumRY = ((e.clientX - cx) / cx) * 5;
      const drumRX = ((e.clientY - cy) / cy) * -5;
      drumPattern.style.transform =
        `perspective(900px) rotateX(${drumRX}deg) rotateY(${drumRY}deg)`;
    });

    document.addEventListener('mouseleave', () => {
      drumPattern.style.transform = '';
    });
  }

  if (drumPattern) {
    document.addEventListener('visibilitychange', () => {
      drumPattern.classList.toggle('is-paused', document.hidden);
    });
  }

  /* ----------------------------------------------------------
   * 14. HERO TITLE DECRYPT EFFECT
   * ---------------------------------------------------------- */
  const heroTitle = document.getElementById('hero-title');
  if (heroTitle && !reducedMotion) {
    const finalText = heroTitle.textContent.trim();
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&';
    let frame = 0;
    const maxFrames = 28;

    function decryptTick() {
      if (frame >= maxFrames) {
        heroTitle.textContent = finalText;
        return;
      }
      const progress = frame / maxFrames;
      heroTitle.textContent = finalText
        .split('')
        .map((ch, i) => {
          if (ch === ' ' || ch === '-') return ch;
          if (i < Math.floor(progress * finalText.length)) return ch;
          return chars[Math.floor(Math.random() * chars.length)];
        })
        .join('');
      frame++;
      requestAnimationFrame(decryptTick);
    }
    setTimeout(decryptTick, 400);
  }

  /* ----------------------------------------------------------
   * 15. MAGNETIC SOCIAL BUTTONS
   * ---------------------------------------------------------- */
  document.querySelectorAll('.hero-social-link').forEach((btn) => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
    btn.addEventListener('click', (e) => {
      const ripple = document.createElement('span');
      ripple.className = 'ripple';
      const size = Math.max(btn.offsetWidth, btn.offsetHeight);
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = (e.offsetX - size / 2) + 'px';
      ripple.style.top = (e.offsetY - size / 2) + 'px';
      btn.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove());
    });
  });

  /* ----------------------------------------------------------
   * 16. LAZY IMAGE FADE-IN
   * ---------------------------------------------------------- */
  document.querySelectorAll('img[loading="lazy"]').forEach((img) => {
    if (img.complete) {
      img.classList.add('is-loaded');
    } else {
      img.addEventListener('load', () => img.classList.add('is-loaded'));
    }
  });

  /* ----------------------------------------------------------
   * 17. MODAL — ESC CLOSE + FOCUS TRAP
   * ---------------------------------------------------------- */
  let lastFocusedBeforeModal = null;

  document.querySelectorAll('.modal-trigger').forEach((trigger) => {
    trigger.setAttribute('tabindex', '0');
    trigger.setAttribute('role', 'button');
    trigger.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        trigger.click();
      }
    });
  });

  function getFocusable(modal) {
    return modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
  }

  document.querySelectorAll('.modal').forEach((modal) => {
    const observer = new MutationObserver(() => {
      if (modal.classList.contains('is-active')) {
        lastFocusedBeforeModal = document.activeElement;
        const focusable = getFocusable(modal);
        if (focusable.length) focusable[0].focus();
      } else if (lastFocusedBeforeModal) {
        lastFocusedBeforeModal.focus();
        lastFocusedBeforeModal = null;
      }
    });
    observer.observe(modal, { attributes: true, attributeFilter: ['class'] });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const activeModal = document.querySelector('.modal.is-active');
    if (activeModal) activeModal.classList.remove('is-active');
  });

  /* ----------------------------------------------------------
   * 18. STAGGER REVEAL FOR GRID CARDS
   * ---------------------------------------------------------- */
  document.querySelectorAll('.ref-grid').forEach((grid) => {
    grid.querySelectorAll('.ref-card').forEach((card, i) => {
      if (!card.hasAttribute('data-animate')) {
        card.setAttribute('data-animate', 'fade-up');
        card.setAttribute('data-animate-delay', String(Math.min(i + 1, 4)));
      }
    });
  });

  // Re-run observer for dynamically tagged cards
  const newAnimateEls = document.querySelectorAll('.ref-grid [data-animate]:not(.is-visible)');
  if (newAnimateEls.length > 0) {
    const staggerObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            staggerObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    newAnimateEls.forEach((el) => staggerObserver.observe(el));
  }

  /* Pause drum spin when tab hidden */
  const drumPauseStyle = document.createElement('style');
  drumPauseStyle.textContent = `
    .hero-drum-pattern.is-paused::before { animation-play-state: paused !important; }
  `;
  document.head.appendChild(drumPauseStyle);

})();
