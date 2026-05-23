/* $AttentionBank — interactions */
(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- footer year ---------- */
  const yr = $('#year');
  if (yr) yr.textContent = new Date().getFullYear();

  /* ---------- sticky nav ---------- */
  const nav = $('#nav');
  const onScroll = () => nav.classList.toggle('is-stuck', window.scrollY > 24);
  onScroll();
  addEventListener('scroll', onScroll, { passive: true });

  /* ---------- mobile menu ---------- */
  const burger = $('.nav__burger');
  if (burger) {
    burger.addEventListener('click', () => {
      const open = nav.classList.toggle('menu-open');
      burger.setAttribute('aria-expanded', String(open));
    });
    $$('.nav__links a').forEach((a) =>
      a.addEventListener('click', () => {
        nav.classList.remove('menu-open');
        burger.setAttribute('aria-expanded', 'false');
      })
    );
  }

  /* ---------- copy contract address ---------- */
  const toast = $('#toast');
  let toastT;
  const showToast = (msg) => {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastT);
    toastT = setTimeout(() => toast.classList.remove('show'), 2200);
  };
  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      const t = document.createElement('textarea');
      t.value = text;
      t.style.position = 'fixed';
      t.style.opacity = '0';
      document.body.appendChild(t);
      t.select();
      let ok = false;
      try { ok = document.execCommand('copy'); } catch {}
      t.remove();
      return ok;
    }
  };
  $$('[data-copy]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const ok = await copy(btn.dataset.copy);
      if (ok) {
        btn.classList.add('copied');
        showToast('Contract address copied');
        setTimeout(() => btn.classList.remove('copied'), 1600);
      } else {
        showToast('Press Ctrl+C to copy');
      }
    });
  });

  /* ---------- scroll reveal (with per-group stagger) ---------- */
  const reveals = $$('.reveal');
  reveals.forEach((el) => {
    const sibs = Array.from(el.parentElement.children).filter((c) => c.classList.contains('reveal'));
    const i = sibs.indexOf(el);
    if (i > 0) el.style.transitionDelay = Math.min(i * 70, 380) + 'ms';
  });
  if (reduced || !('IntersectionObserver' in window)) {
    reveals.forEach((el) => el.classList.add('in'));
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );
    reveals.forEach((el) => io.observe(el));
  }

  /* ---------- count-up stats ---------- */
  const nums = $$('.stat__num[data-count]');
  const runCount = (el) => {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const dur = 1400;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const val = target % 1 === 0 ? Math.round(target * eased) : (target * eased).toFixed(1);
      el.textContent = val + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  if (reduced || !('IntersectionObserver' in window)) {
    nums.forEach((el) => (el.textContent = (el.dataset.count || '') + (el.dataset.suffix || '')));
  } else {
    const cio = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) { runCount(e.target); cio.unobserve(e.target); }
        });
      },
      { threshold: 0.6 }
    );
    nums.forEach((el) => cio.observe(el));
  }

  /* ---------- active nav link ---------- */
  const linkMap = new Map();
  $$('.nav__links a[href^="#"]').forEach((a) => linkMap.set(a.getAttribute('href').slice(1), a));
  const sections = $$('main section[id], section[id]').filter((s) => linkMap.has(s.id));
  if ('IntersectionObserver' in window && sections.length) {
    const sio = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            linkMap.forEach((a) => a.classList.remove('active'));
            linkMap.get(e.target.id)?.classList.add('active');
          }
        });
      },
      { rootMargin: '-45% 0px -50% 0px' }
    );
    sections.forEach((s) => sio.observe(s));
  }

  /* ---------- pointer spotlight + hero parallax ---------- */
  if (!reduced && matchMedia('(pointer:fine)').matches) {
    const heroImg = $('.hero__img');
    const badges = $$('.badge');
    let raf;
    addEventListener('pointermove', (e) => {
      const mx = (e.clientX / innerWidth) * 100;
      const my = (e.clientY / innerHeight) * 100;
      document.documentElement.style.setProperty('--mx', mx + '%');
      document.documentElement.style.setProperty('--my', my + '%');
      if (raf) return;
      raf = requestAnimationFrame(() => {
        const dx = (e.clientX / innerWidth - 0.5) * 2;
        const dy = (e.clientY / innerHeight - 0.5) * 2;
        if (heroImg) heroImg.style.transform = `translateY(-50%) translate(${dx * -14}px,${dy * -14}px)`;
        badges.forEach((b, i) => {
          const d = (i + 1) * 6;
          b.style.transform = `translate(${dx * d}px,${dy * d}px)`;
        });
        raf = null;
      });
    }, { passive: true });
  }

  /* ---------- banknotes: flip on click ---------- */
  $$('.note').forEach((note) => {
    note.addEventListener('click', () => note.classList.toggle('flipped'));
  });
})();
