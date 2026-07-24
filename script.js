(function(){
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasFinePointer = window.matchMedia('(pointer:fine)').matches;

  /* ============================================================
     NAV: scrolled state + burger menu
     ============================================================ */
  var nav = document.getElementById('nav');
  var burger = document.getElementById('navBurger');
  var mobileMenu = document.getElementById('mobileMenu');

  function onScrollNav(){
    if(window.scrollY > 40){ nav.classList.add('scrolled'); }
    else{ nav.classList.remove('scrolled'); }
  }
  onScrollNav();
  window.addEventListener('scroll', onScrollNav, {passive:true});

  if(burger){
    burger.addEventListener('click', function(){
      burger.classList.toggle('open');
      mobileMenu.classList.toggle('open');
    });
  }
  document.querySelectorAll('#mobileMenu a').forEach(function(a){
    a.addEventListener('click', function(){
      burger.classList.remove('open');
      mobileMenu.classList.remove('open');
    });
  });

  /* ============================================================
     SMOOTH SCROLL with nav-height offset
     ============================================================ */
  var NAV_OFFSET = 76;
  document.querySelectorAll('[data-scroll]').forEach(function(link){
    link.addEventListener('click', function(e){
      var href = link.getAttribute('href');
      if(!href || href.charAt(0) !== '#') return;
      var target = document.querySelector(href);
      if(!target) return;
      e.preventDefault();
      var top = target.getBoundingClientRect().top + window.pageYOffset - NAV_OFFSET + 1;
      window.scrollTo({top: top, behavior: reduceMotion ? 'auto' : 'smooth'});
    });
  });

  /* ============================================================
     SCROLL PROGRESS BAR
     ============================================================ */
  var progressBar = document.getElementById('progressBar');
  function onProgress(){
    var h = document.documentElement;
    var scrollTop = h.scrollTop || document.body.scrollTop;
    var scrollHeight = (h.scrollHeight || document.body.scrollHeight) - h.clientHeight;
    var pct = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
    progressBar.style.width = pct + '%';
  }
  onProgress();
  window.addEventListener('scroll', onProgress, {passive:true});

  /* ============================================================
     GLOBAL MOUSE TRACKING (single source, rAF-throttled)
     ============================================================ */
  var mouseX = window.innerWidth / 2;
  var mouseY = window.innerHeight / 2;
  var mouseKnown = false;
  window.addEventListener('mousemove', function(e){
    mouseX = e.clientX;
    mouseY = e.clientY;
    mouseKnown = true;
  }, {passive:true});

  /* ============================================================
     CURSOR: glow + ring + dot
     ============================================================ */
  var glow = document.getElementById('cursorGlow');
  var ring = document.getElementById('cursorRing');
  var dot = document.getElementById('cursorDot');
  var ringX = mouseX, ringY = mouseY;

  if(hasFinePointer && glow && ring && dot){
    window.addEventListener('mousemove', function(e){
      glow.style.opacity = '1';
      glow.style.transform = 'translate(' + e.clientX + 'px,' + e.clientY + 'px) translate(-50%,-50%)';
      dot.style.left = e.clientX + 'px';
      dot.style.top = e.clientY + 'px';
      dot.classList.add('on');
      ring.classList.add('on');
    }, {passive:true});
    window.addEventListener('mouseleave', function(){
      glow.style.opacity = '0';
      dot.classList.remove('on');
      ring.classList.remove('on');
    });

    var HOVER_SELECTOR = 'a, button, .btn, .contact-card, .project-card, .bento-card, .skill-tile, .tl-card, .side-stat, .chip, .ach-row';
    document.addEventListener('mouseover', function(e){
      if(e.target.closest && e.target.closest(HOVER_SELECTOR)){
        ring.classList.add('hover');
      }
    });
    document.addEventListener('mouseout', function(e){
      if(e.target.closest && e.target.closest(HOVER_SELECTOR)){
        ring.classList.remove('hover');
      }
    });

    (function ringLoop(){
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      ring.style.left = ringX + 'px';
      ring.style.top = ringY + 'px';
      requestAnimationFrame(ringLoop);
    })();
  }

  /* ============================================================
     MAGNETIC ELEMENTS
     ============================================================ */
  if(hasFinePointer && !reduceMotion){
    var magnetSelector = '.btn, .nav-cta, .nav-logo .logo-mark';
    document.querySelectorAll(magnetSelector).forEach(function(el){
      var strength = 0.35;
      el.addEventListener('mousemove', function(e){
        var r = el.getBoundingClientRect();
        var relX = e.clientX - (r.left + r.width/2);
        var relY = e.clientY - (r.top + r.height/2);
        el.style.transform = 'translate(' + (relX*strength).toFixed(1) + 'px,' + (relY*strength).toFixed(1) + 'px)';
      });
      el.addEventListener('mouseleave', function(){
        el.style.transform = '';
      });
    });
  }

  /* ============================================================
     ACTIVE NAV LINK + SLIDING PILL (morphs to active section)
     ============================================================ */
  var sections = document.querySelectorAll('section[id]');
  var navLinksWrap = document.getElementById('navLinks');
  var navPill = document.getElementById('navPill');
  var navLinks = document.querySelectorAll('.nav-links a[data-section]');
  var navHovering = false;

  function placePill(linkEl){
    if(!linkEl || !navPill || !navLinksWrap) return;
    var wrapRect = navLinksWrap.getBoundingClientRect();
    var linkRect = linkEl.getBoundingClientRect();
    if(linkRect.width === 0){ return; }
    var offsetX = linkRect.left - wrapRect.left;
    navPill.style.width = linkRect.width + 'px';
    navPill.style.transform = 'translateX(' + offsetX + 'px)';
    navPill.classList.add('on');
  }

  function placePillAtActive(){
    var active = document.querySelector('.nav-links a.active');
    if(active){ placePill(active); }
    else if(navPill){ navPill.classList.remove('on'); }
  }

  navLinks.forEach(function(link){
    link.addEventListener('mouseenter', function(){
      navHovering = true;
      placePill(link);
    });
  });
  if(navLinksWrap){
    navLinksWrap.addEventListener('mouseleave', function(){
      navHovering = false;
      placePillAtActive();
    });
  }
  window.addEventListener('resize', function(){
    if(navHovering) return;
    placePillAtActive();
  });

  if('IntersectionObserver' in window && sections.length){
    var navObserver = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          var id = entry.target.getAttribute('id');
          navLinks.forEach(function(l){
            l.classList.toggle('active', l.getAttribute('data-section') === id);
          });
          if(!navHovering){ placePillAtActive(); }
        }
      });
    }, {rootMargin: '-45% 0px -50% 0px', threshold: 0});
    sections.forEach(function(s){ navObserver.observe(s); });
  }

  /* ============================================================
     TEXT SPLIT — wrap words for stagger reveal
     (preserves the exact same words/content, only adds spans)
     ============================================================ */
  function splitWords(el){
    var ci = 0;
    Array.prototype.slice.call(el.childNodes).forEach(function(node){
      if(node.nodeType === 3){
        var text = node.textContent;
        if(!text.trim()) return;
        var words = text.trim().split(/\s+/);
        var frag = document.createDocumentFragment();
        words.forEach(function(w, idx){
          var span = document.createElement('span');
          span.className = 'split-word';
          span.style.setProperty('--ci', ci++);
          span.textContent = w;
          frag.appendChild(span);
          if(idx < words.length - 1){ frag.appendChild(document.createTextNode(' ')); }
        });
        el.replaceChild(frag, node);
      } else if(node.nodeType === 1 && node.tagName === 'SPAN'){
        node.classList.add('split-word');
        node.style.setProperty('--ci', ci++);
      }
    });
  }
  document.querySelectorAll('.hero-title, .section-heading').forEach(splitWords);

  // trigger hero title entrance shortly after first paint
  requestAnimationFrame(function(){
    requestAnimationFrame(function(){
      document.body.classList.add('page-loaded');
    });
  });

  /* ============================================================
     SCROLL REVEAL (runs after splitWords so spans exist)
     ============================================================ */
  var revealEls = document.querySelectorAll('.reveal');
  if('IntersectionObserver' in window && revealEls.length){
    var revealObserver = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        entry.target.classList.toggle('in-view', entry.isIntersecting);
      });
    }, {threshold: 0.15});
    revealEls.forEach(function(el){ revealObserver.observe(el); });
  } else {
    revealEls.forEach(function(el){ el.classList.add('in-view'); });
  }

  /* ============================================================
     TIMELINE LINE FILL ON SCROLL (organic growth)
     ============================================================ */
  var timeline = document.querySelector('.timeline');
  var timelineFill = document.querySelector('.timeline-line-fill');
  if(timeline && timelineFill){
    function updateTimelineFill(){
      var rect = timeline.getBoundingClientRect();
      var vh = window.innerHeight;
      var total = rect.height;
      var visible = Math.min(vh * 0.75, vh - rect.top);
      var pct = 0;
      if(rect.top < vh){
        pct = Math.max(0, Math.min(1, visible / total));
      }
      timelineFill.style.height = (pct * 100) + '%';
    }
    updateTimelineFill();
    window.addEventListener('scroll', updateTimelineFill, {passive:true});
    window.addEventListener('resize', updateTimelineFill);
  }

  /* ============================================================
     SKILL RINGS — animate stroke-dashoffset when in view
     ============================================================ */
  var skillRings = document.querySelectorAll('.skill-ring-fill');
  if('IntersectionObserver' in window && skillRings.length){
    var skillObserver = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        entry.target.classList.toggle('animate', entry.isIntersecting);
      });
    }, {threshold: 0.4});
    skillRings.forEach(function(ring2){ skillObserver.observe(ring2); });
  }

  /* ============================================================
     BUTTON RIPPLE EFFECT
     ============================================================ */
  document.querySelectorAll('.ripple').forEach(function(btn){
    btn.addEventListener('click', function(e){
      var rect = btn.getBoundingClientRect();
      var size = Math.max(rect.width, rect.height);
      var span = document.createElement('span');
      span.className = 'ripple-fx';
      span.style.width = span.style.height = size + 'px';
      span.style.left = (e.clientX - rect.left - size/2) + 'px';
      span.style.top = (e.clientY - rect.top - size/2) + 'px';
      btn.appendChild(span);
      setTimeout(function(){ span.remove(); }, 650);
    });
  });

  /* ============================================================
     CARD SYSTEM: 3D tilt + spotlight highlight
     (drives the --mx/--my custom properties already styled
     into side-stat, skill-tile, bento-card, project-card,
     contact-card and tl-card)
     ============================================================ */
  if(hasFinePointer && !reduceMotion){
    var tiltEls = document.querySelectorAll(
      '.side-stat, .skill-tile, .bento-card, .project-card, .contact-card, .tl-card'
    );
    tiltEls.forEach(function(el){
      el.addEventListener('mousemove', function(e){
        var r = el.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width;
        var py = (e.clientY - r.top) / r.height;
        el.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
        el.style.setProperty('--my', (py * 100).toFixed(1) + '%');
        var rotY = (px - 0.5) * 9;
        var rotX = (0.5 - py) * 9;
        el.style.transform =
          'perspective(900px) rotateX(' + rotX.toFixed(2) + 'deg) rotateY(' + rotY.toFixed(2) + 'deg) translateY(-6px) translateZ(6px)';
      });
      el.addEventListener('mouseleave', function(){
        el.style.transform = '';
        el.style.removeProperty('--mx');
        el.style.removeProperty('--my');
      });
    });
  }

  /* ============================================================
     HERO: signal line morph + card tilt + parallax shapes
     ============================================================ */
  var signalPath = document.getElementById('signalPath');
  var signalCard = document.querySelector('.signal-card');
  var heroVisual = document.querySelector('.hero-visual');
  var heroEl = document.getElementById('hero');
  var heroCopy = document.querySelector('.hero-copy');
  var shapes = document.querySelectorAll('.hero .shape');

  function buildPath(noiseAmount){
    var points = 24, w = 400, midY = 80;
    var d = 'M 0 ' + midY;
    for(var i = 1; i <= points; i++){
      var x = (w / points) * i;
      var seed = Math.sin(i * 12.9898) * 43758.5453;
      var rand = seed - Math.floor(seed);
      var wobble = (rand - 0.5) * 2 * 46 * noiseAmount;
      var y = midY + wobble;
      d += ' L ' + x.toFixed(1) + ' ' + y.toFixed(1);
    }
    return d;
  }

  if(signalPath){
    var currentNoise = 1, targetNoise = 1, isHovering = false;

    (function renderSignal(){
      currentNoise += (targetNoise - currentNoise) * 0.08;
      signalPath.setAttribute('d', buildPath(currentNoise));
      requestAnimationFrame(renderSignal);
    })();

    if(signalCard){
      signalCard.addEventListener('mouseenter', function(){ isHovering = true; });
      signalCard.addEventListener('mousemove', function(e){
        var rect = signalCard.getBoundingClientRect();
        var pct = (e.clientX - rect.left) / rect.width;
        pct = Math.max(0, Math.min(1, pct));
        targetNoise = 1 - pct;
      });
      signalCard.addEventListener('mouseleave', function(){ isHovering = false; });
      setInterval(function(){
        if(document.hidden || isHovering) return;
        targetNoise = 0.4 + Math.sin(Date.now() / 3000) * 0.3;
      }, 50);
    }
  }

  if(heroEl && hasFinePointer && !reduceMotion){
    heroEl.addEventListener('mousemove', function(e){
      var rect = heroEl.getBoundingClientRect();
      var px = (e.clientX - rect.left) / rect.width - 0.5;   // -0.5 .. 0.5
      var py = (e.clientY - rect.top) / rect.height - 0.5;

      if(heroVisual){
        var rotY = px * 10;
        var rotX = -py * 10;
        heroVisual.style.transform =
          'perspective(1000px) rotateX(' + rotX.toFixed(2) + 'deg) rotateY(' + rotY.toFixed(2) + 'deg)';
      }
      if(heroCopy){
        heroCopy.style.transform = 'translate(' + (-px * 10).toFixed(1) + 'px,' + (-py * 6).toFixed(1) + 'px)';
      }
      shapes.forEach(function(shape, i){
        var depth = (i + 1) * 14;
        shape.style.setProperty('--mx', (px * depth).toFixed(1) + 'px');
        shape.style.setProperty('--my', (py * depth).toFixed(1) + 'px');
      });
    });
    heroEl.addEventListener('mouseleave', function(){
      if(heroVisual){ heroVisual.style.transform = ''; }
      if(heroCopy){ heroCopy.style.transform = ''; }
      shapes.forEach(function(shape){
        shape.style.setProperty('--mx', '0px');
        shape.style.setProperty('--my', '0px');
      });
    });
  }

  /* ============================================================
     HERO PARTICLES — floating depth-parallax dots
     ============================================================ */
  var particlesCanvas = document.getElementById('particlesCanvas');
  if(particlesCanvas && !reduceMotion){
    var pctx = particlesCanvas.getContext('2d');
    var particles = [];
    var PCOUNT = window.innerWidth < 700 ? 26 : 55;
    var pw = 0, ph = 0;

    function resizeParticles(){
      pw = particlesCanvas.width = window.innerWidth;
      ph = particlesCanvas.height = window.innerHeight;
    }
    function initParticles(){
      particles = [];
      for(var i = 0; i < PCOUNT; i++){
        particles.push({
          x: Math.random() * pw,
          y: Math.random() * ph,
          r: Math.random() * 1.6 + 0.6,
          depth: Math.random() * 0.7 + 0.3,
          vy: Math.random() * 0.18 + 0.05,
          hue: i % 3
        });
      }
    }
    resizeParticles();
    initParticles();
    window.addEventListener('resize', function(){
      PCOUNT = window.innerWidth < 700 ? 26 : 55;
      resizeParticles();
      initParticles();
    });

    var colors = ['94,234,212', '79,141,255', '167,139,250'];

    function drawParticles(){
      pctx.clearRect(0, 0, pw, ph);
      var px = (mouseX / window.innerWidth - 0.5);
      var py = (mouseY / window.innerHeight - 0.5);
      particles.forEach(function(p){
        p.y -= p.vy;
        if(p.y < -4){ p.y = ph + 4; p.x = Math.random() * pw; }
        var ox = px * 22 * p.depth;
        var oy = py * 22 * p.depth;
        pctx.beginPath();
        pctx.arc(p.x + ox, p.y + oy, p.r, 0, Math.PI * 2);
        pctx.fillStyle = 'rgba(' + colors[p.hue] + ',' + (0.35 * p.depth + 0.15) + ')';
        pctx.fill();
      });
      requestAnimationFrame(drawParticles);
    }
    requestAnimationFrame(drawParticles);
  }

  /* ============================================================
     GLOBAL BACKGROUND — slow aurora / mesh gradient, mouse-reactive
     ============================================================ */
  var bgCanvas = document.getElementById('bgCanvas');
  if(bgCanvas && !reduceMotion){
    var bctx = bgCanvas.getContext('2d');
    var bw = 0, bh = 0;
    function resizeBg(){
      bw = bgCanvas.width = window.innerWidth;
      bh = bgCanvas.height = window.innerHeight;
    }
    resizeBg();
    window.addEventListener('resize', resizeBg);

    var blobs = [
      {baseX:.18, baseY:.22, r:0.55, color:'79,141,255',  sx:0.00021, sy:0.00017, phase:0},
      {baseX:.82, baseY:.30, r:0.48, color:'167,139,250', sx:0.00017, sy:0.00024, phase:2},
      {baseX:.55, baseY:.85, r:0.5,  color:'94,234,212',  sx:0.00019, sy:0.00015, phase:4}
    ];

    function drawBg(t){
      bctx.clearRect(0, 0, bw, bh);
      var mx = mouseKnown ? (mouseX / window.innerWidth - 0.5) : 0;
      var my = mouseKnown ? (mouseY / window.innerHeight - 0.5) : 0;
      blobs.forEach(function(b){
        var x = (b.baseX + Math.sin(t * b.sx + b.phase) * 0.05 + mx * 0.03) * bw;
        var y = (b.baseY + Math.cos(t * b.sy + b.phase) * 0.05 + my * 0.03) * bh;
        var radius = Math.max(bw, bh) * b.r;
        var grad = bctx.createRadialGradient(x, y, 0, x, y, radius);
        grad.addColorStop(0, 'rgba(' + b.color + ',0.10)');
        grad.addColorStop(1, 'rgba(' + b.color + ',0)');
        bctx.fillStyle = grad;
        bctx.beginPath();
        bctx.arc(x, y, radius, 0, Math.PI * 2);
        bctx.fill();
      });
      requestAnimationFrame(drawBg);
    }
    requestAnimationFrame(drawBg);
  }

})();
