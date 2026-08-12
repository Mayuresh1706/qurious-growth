/* Qurious Growth — main.js
   Nav, reveals, count-ups, marquees, accordions, rails, lightbox, logo fallback. */

(function () {
  'use strict';

  /* ---------------------------------------------------------------- nav -- */
  var nav = document.querySelector('.nav');
  var sections = document.querySelectorAll('section[id]');
  var navLinks = document.querySelectorAll('.nav-links a');

  window.addEventListener('scroll', function () {
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 30);
    var cur = '';
    sections.forEach(function (s) { if (window.scrollY >= s.offsetTop - 220) cur = s.id; });
    navLinks.forEach(function (a) {
      a.classList.toggle('active', a.getAttribute('href') === '#' + cur);
    });
  }, { passive: true });

  window.toggleMenu = function () {
    var m = document.getElementById('mobile'), b = document.getElementById('burger');
    var open = m.classList.toggle('open');
    b.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  };
  window.closeMenu = function () {
    document.getElementById('mobile').classList.remove('open');
    document.getElementById('burger').classList.remove('open');
    document.body.style.overflow = '';
  };

  /* ------------------------------------------------------------ reveals -- */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.rv').forEach(function (el) { io.observe(el); });

  /* ----------------------------------------------------------- count-up -- */
  var cio = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      cio.unobserve(e.target);
      var el = e.target, end = parseFloat(el.dataset.count), t0 = performance.now(), dur = 1500;
      (function tick(t) {
        var p = Math.min((t - t0) / dur, 1);
        el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(tick);
      })(t0);
    });
  }, { threshold: 0.6 });
  document.querySelectorAll('[data-count]').forEach(function (el) { cio.observe(el); });

  /* ---------------------------------------------------------- marquees --- */
  document.querySelectorAll('[data-loop]').forEach(function (track) {
    track.innerHTML += track.innerHTML;
  });

  /* -------------------------------------------------- services accordion - */
  window.toggleSvc = function (el) {
    var row = el.closest('.svc');
    var detail = row.querySelector('.svc-detail');
    var wasOpen = row.classList.contains('open');
    document.querySelectorAll('.svc').forEach(function (r) {
      r.classList.remove('open');
      var d = r.querySelector('.svc-detail');
      if (d) d.style.maxHeight = null;
    });
    if (!wasOpen) {
      row.classList.add('open');
      detail.style.maxHeight = detail.scrollHeight + 'px';
    }
  };

  /* ------------------------------------------------------------- rails --- */
  window.railGo = function (id, dir) {
    var r = document.getElementById(id);
    if (!r || !r.firstElementChild) return;
    var w = r.firstElementChild.getBoundingClientRect().width + 18;
    r.scrollBy({ left: dir * w * 2, behavior: 'smooth' });
  };
  document.querySelectorAll('.rail').forEach(function (r) {
    var down = false, sx = 0, sl = 0;
    r.addEventListener('pointerdown', function (e) {
      down = true; sx = e.clientX; sl = r.scrollLeft; r.classList.add('grabbing');
    });
    window.addEventListener('pointerup', function () { down = false; r.classList.remove('grabbing'); });
    r.addEventListener('pointermove', function (e) {
      if (!down) return;
      r.scrollLeft = sl - (e.clientX - sx);
    });
  });

  /* --------------------------------------------------------------- faq --- */
  window.toggleFq = function (btn) {
    var fq = btn.parentElement;
    var a = fq.querySelector('.fq-a');
    var wasOpen = fq.classList.contains('open');
    document.querySelectorAll('.fq').forEach(function (x) {
      x.classList.remove('open');
      x.querySelector('.fq-a').style.maxHeight = null;
    });
    if (!wasOpen) {
      fq.classList.add('open');
      a.style.maxHeight = a.scrollHeight + 'px';
    }
  };

  /* ---------------------------------------------------------- lightbox --- */
  window.lbOpen = function (fig) {
    var img = fig.querySelector('img'), cap = fig.querySelector('figcaption');
    var lbImg = document.getElementById('lbImg');
    lbImg.src = img.currentSrc || img.src;
    lbImg.alt = img.alt;
    document.getElementById('lbCap').textContent = cap ? cap.textContent : '';
    document.getElementById('lb').classList.add('on');
    document.body.style.overflow = 'hidden';
  };
  window.lbClose = function () {
    var lb = document.getElementById('lb');
    if (lb) lb.classList.remove('on');
    document.body.style.overflow = '';
  };
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { window.lbClose(); window.closeMenu(); }
  });
  var lb = document.getElementById('lb');
  if (lb) lb.addEventListener('click', function (e) { if (e.target === lb) window.lbClose(); });

  /* --------------------------------------------------- short-form clips - */
  /* Lazy: poster loads only when the card nears the viewport; the MP4 itself
     is not requested until the visitor presses play. */
  var vio = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      var v = e.target;
      if (v.dataset.poster) { v.poster = v.dataset.poster; delete v.dataset.poster; }
      vio.unobserve(v);
    });
  }, { rootMargin: '300px' });
  document.querySelectorAll('.s-embed video').forEach(function (v) { vio.observe(v); });

  function ensureSrc(v) {
    if (v.dataset.src) { v.src = v.dataset.src; delete v.dataset.src; }
  }

  window.playClip = function (btn) {
    var card = btn.closest('.s-embed');
    var video = card.querySelector('video');
    var mute = card.querySelector('.s-mute');
    document.querySelectorAll('.s-embed video').forEach(function (v) {
      if (v !== video) {
        v.pause();
        var e = v.closest('.s-embed');
        e.querySelector('.s-play').hidden = false;
        e.querySelector('.s-mute').hidden = true;
      }
    });
    ensureSrc(video);
    video.muted = false;
    mute.hidden = false;
    mute.classList.remove('muted');
    var p = video.play();
    if (p && p.catch) p.catch(function () { video.muted = true; mute.classList.add('muted'); video.play(); });
    btn.hidden = true;
  };

  window.muteClip = function (e, btn) {
    e.stopPropagation();
    var video = btn.closest('.s-embed').querySelector('video');
    video.muted = !video.muted;
    btn.classList.toggle('muted', video.muted);
  };

  document.querySelectorAll('.s-embed video').forEach(function (v) {
    v.addEventListener('click', function () {
      var e = v.closest('.s-embed');
      if (v.paused) { ensureSrc(v); v.play(); e.querySelector('.s-play').hidden = true; }
      else { v.pause(); e.querySelector('.s-play').hidden = false; }
    });
  });

  /* ------------------------------------- logo fallback: clearbit → icon -- */
  window.logoFallback = function (img) {
    if (!img.dataset.tried) {
      img.dataset.tried = '1';
      img.src = 'https://www.google.com/s2/favicons?domain=' + img.dataset.domain + '&sz=128';
      return;
    }
    img.style.display = 'none';
    var t = img.nextElementSibling;
    if (t) t.style.display = 'block';
  };
})();
