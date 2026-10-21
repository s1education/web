/* =====================================================================
   育華國小 三年甲班｜班級教學網站
   script.js  —  互動效果
   1. 導覽列：捲動收合 + 選單開關
   2. 目前日期顯示
   3. 捲動進場動畫 (IntersectionObserver)
   4. 數字統計動畫
   5. 導覽列目前區塊高亮
   6. 返回頂端
   7. QR Code 放大燈箱
   ===================================================================== */

(function () {
  'use strict';

  const $  = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));

  /* ---------- 1. 導覽列 ---------- */
  const header   = $('#siteHeader');
  const navMenu  = $('#navMenu');
  const navToggle = $('#navToggle');

  const onScroll = () => {
    if (!header) return;
    header.classList.toggle('is-stuck', window.scrollY > 12);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      const open = navMenu.classList.toggle('is-open');
      navToggle.classList.toggle('is-open', open);
      navToggle.setAttribute('aria-expanded', String(open));
      navToggle.setAttribute('aria-label', open ? '關閉選單' : '開啟選單');
    });

    // 點選連結後自動收起行動版選單
    $$('.nav__link', navMenu).forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('is-open');
        navToggle.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });

    document.addEventListener('click', (e) => {
      if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
        navMenu.classList.remove('is-open');
        navToggle.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---------- 2. 今天日期 ---------- */
  const todayEl = $('#todayDate');
  if (todayEl) {
    const week = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    const now = new Date();
    todayEl.textContent =
      now.getFullYear() + ' / ' +
      String(now.getMonth() + 1).padStart(2, '0') + ' / ' +
      String(now.getDate()).padStart(2, '0') + '　' + week[now.getDay()];
  }

  /* ---------- 3. 捲動進場動畫 ---------- */
  const revealEls = $$('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          const delay = (Number(entry.target.dataset.delay) || i % 6) * 70;
          setTimeout(() => entry.target.classList.add('is-visible'), delay);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('is-visible'));
  }

  /* ---------- 4. 數字統計動畫 ---------- */
  const counters = $$('[data-count]');
  if (counters.length) {
    const countUp = (el) => {
      const target = Number(el.dataset.count) || 0;
      const duration = 1200;
      const start = performance.now();
      const tick = (now) => {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased);
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    if ('IntersectionObserver' in window) {
      const co = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            countUp(entry.target);
            co.unobserve(entry.target);
          }
        });
      }, { threshold: 0.5 });
      counters.forEach(el => co.observe(el));
    } else {
      counters.forEach(countUp);
    }
  }

  /* ---------- 5. 導覽列目前區塊高亮 ---------- */
  const sections = $$('main section[id]');
  const navLinks = $$('.nav__link');
  if (sections.length && navLinks.length && 'IntersectionObserver' in window) {
    const navMap = new Map();
    navLinks.forEach(l => {
      const id = l.getAttribute('href');
      if (id && id.startsWith('#')) navMap.set(id.slice(1), l);
    });

    const so = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        navLinks.forEach(l => l.classList.remove('is-active'));
        const active = navMap.get(entry.target.id);
        if (active) active.classList.add('is-active');
      });
    }, { threshold: 0.25, rootMargin: '-100px 0px -55% 0px' });

    sections.forEach(s => {
      if (navMap.has(s.id)) so.observe(s);
    });
  }

  /* ---------- 6. 返回頂端 ---------- */
  const toTop = $('#toTop');
  if (toTop) {
    window.addEventListener('scroll', () => {
      toTop.classList.toggle('is-visible', window.scrollY > 420);
    }, { passive: true });
    toTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---------- 7. QR Code 放大燈箱 ---------- */
  const lightbox = $('#lightbox');
  const qrBtn   = $('#qrZoomBtn');
  const lbClose = $('#lightboxClose');

  const openLightbox = () => {
    if (!lightbox) return;
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
    if (lbClose) lbClose.focus();
  };
  const closeLightbox = () => {
    if (!lightbox) return;
    lightbox.hidden = true;
    document.body.style.overflow = '';
    if (qrBtn) qrBtn.focus();
  };

  if (qrBtn) qrBtn.addEventListener('click', openLightbox);
  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox || e.target.closest('.lightbox__close')) closeLightbox();
    });
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox && !lightbox.hidden) closeLightbox();
  });

})();
