(function(){
  'use strict';

  /* ============================================================
     NAV: scrolled state + active link + burger menu
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
      window.scrollTo({top: top, behavior:'smooth'});
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
     CURSOR GLOW (desktop only)
     ============================================================ */
  var glow = document.getElementById('cursorGlow');
  var hasFinePointer = window.matchMedia('(pointer:fine)').matches;
  if(glow && hasFinePointer){
    window.addEventListener('mousemove', function(e){
      glow.style.opacity = '1';
      glow.style.transform = 'translate(' + e.clientX + 'px,' + e.clientY + 'px) translate(-50%,-50%)';
    });
    window.addEventListener('mouseleave', function(){ glow.style.opacity = '0'; });
  }

  /* ============================================================
     ACTIVE NAV LINK ON SCROLL (IntersectionObserver)
     ============================================================ */
  var sections = document.querySelectorAll('section[id]');
  var navLinks = document.querySelectorAll('.nav-links a[data-section]');
  if('IntersectionObserver' in window && sections.length){
    var navObserver = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          var id = entry.target.getAttribute('id');
          navLinks.forEach(function(l){
            l.classList.toggle('active', l.getAttribute('data-section') === id);
          });
        }
      });
    }, {rootMargin: '-45% 0px -50% 0px', threshold: 0});
    sections.forEach(function(s){ navObserver.observe(s); });
  }

  /* ============================================================
     SCROLL REVEAL
     ============================================================ */
  var revealEls = document.querySelectorAll('.reveal');
  if('IntersectionObserver' in window && revealEls.length){
    var revealObserver = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          entry.target.classList.add('in-view');
          revealObserver.unobserve(entry.target);
        }
      });
    }, {threshold: 0.15});
    revealEls.forEach(function(el){ revealObserver.observe(el); });
  } else {
    revealEls.forEach(function(el){ el.classList.add('in-view'); });
  }

  /* ============================================================
     TIMELINE LINE FILL ON SCROLL
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
     SKILL BARS FILL WHEN IN VIEW
     ============================================================ */
  var skillBars = document.querySelectorAll('.skill-bar-fill');
  if('IntersectionObserver' in window && skillBars.length){
    var skillObserver = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          entry.target.classList.add('animate');
          skillObserver.unobserve(entry.target);
        }
      });
    }, {threshold: 0.4});
    skillBars.forEach(function(bar){ skillObserver.observe(bar); });
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
     HERO SIGNAL LINE — morphs from noisy to clean based on
     cursor position within the signal card
     ============================================================ */
  var signalPath = document.getElementById('signalPath');
  var signalCard = document.querySelector('.signal-card');

  function buildPath(noiseAmount){
    // 400x160 viewbox, path drawn across x, noise on y around baseline 80
    var points = 24;
    var w = 400, midY = 80;
    var d = 'M 0 ' + midY;
    for(var i = 1; i <= points; i++){
      var x = (w / points) * i;
      var seed = Math.sin(i * 12.9898) * 43758.5453;
      var rand = seed - Math.floor(seed); // 0..1 pseudo-random, stable per i
      var wobble = (rand - 0.5) * 2 * 46 * noiseAmount;
      var y = midY + wobble;
      d += ' L ' + x.toFixed(1) + ' ' + y.toFixed(1);
    }
    return d;
  }

  if(signalPath){
    var currentNoise = 1;
    var targetNoise = 1;

    function renderSignal(){
      currentNoise += (targetNoise - currentNoise) * 0.08;
      signalPath.setAttribute('d', buildPath(currentNoise));
      requestAnimationFrame(renderSignal);
    }
    requestAnimationFrame(renderSignal);

    if(signalCard){
      var isHovering = false;
      signalCard.addEventListener('mouseenter', function(){ isHovering = true; });
      signalCard.addEventListener('mousemove', function(e){
        var rect = signalCard.getBoundingClientRect();
        var pct = (e.clientX - rect.left) / rect.width; // 0 (left/noisy) -> 1 (right/clean)
        pct = Math.max(0, Math.min(1, pct));
        targetNoise = 1 - pct;
      });
      signalCard.addEventListener('mouseleave', function(){
        isHovering = false;
      });
      // gentle ambient breathing when idle, so it never looks static
      setInterval(function(){
        if(document.hidden || isHovering) return;
        targetNoise = 0.4 + Math.sin(Date.now() / 3000) * 0.3;
      }, 50);
    }
  }

})();
