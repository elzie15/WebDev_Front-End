document.addEventListener('DOMContentLoaded', () => {

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hero = document.querySelector('.hero'); 

  /* ---------------------- MICRO-INTERACTIONS ---------------------- */
  if(hero && !reduce){
    // subtle scroll depth
    window.addEventListener('scroll', () => {
      const rect = hero.getBoundingClientRect();
      const pct = Math.max(0, Math.min(1, 1 - Math.abs(rect.top) / window.innerHeight));
      hero.querySelectorAll('.layer').forEach((L,i)=>{
        L.style.transform += ` translateY(${pct * (i+1)*4}px)`;
      });
    });
  }

  /* --------------- THEME / MOOD TOGGLE --------------- */
  document.querySelectorAll('[data-mood]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-mood]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const mood = btn.dataset.mood;
      applyMood(mood);
    });
  });

  function applyMood(m) {
    const r = document.documentElement;
    if (m === 'a') { // warm
      r.style.setProperty('--accent-b', 'var(--accent-a)');
      r.style.setProperty('--bg', '#08121a');
    } else if (m === 'b') { // neon
      r.style.setProperty('--accent-b', '#8be9fd');
      r.style.setProperty('--bg', '#030417');
    } else {
      r.style.setProperty('--accent-b', '#8be9fd');
      r.style.setProperty('--bg', '#071027');
    }
  }

  /* --------------- HERO PARALLAX --------------- */
  if(hero && !reduce){
    const layers = hero.querySelectorAll('.layer');
    hero.addEventListener('mousemove', ev => {
      const cx = (ev.clientX / window.innerWidth) - 0.5;
      const cy = (ev.clientY / window.innerHeight) - 0.5;
      layers.forEach((L, i) => {
        const depth = (i + 1) * 6;
        L.style.transform = `translate3d(${cx * depth}px, ${cy * depth}px, 0) rotate(${cx * depth / 8}deg)`;
      });
    });
    window.addEventListener('scroll', () => {
      const rect = hero.getBoundingClientRect();
      const pct = Math.max(0, Math.min(1, 1 - Math.abs(rect.top) / window.innerHeight));
      layers.forEach((L, i) => L.style.transform += ` translateY(${pct * (i + 1) * 6}px)`);
    });
  }

  /* --------------- CARD TILT --------------- */
  document.querySelectorAll('[data-tilt]').forEach(card => {
    if (reduce) return;

    const thumb = card.querySelector('.thumb');

    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      const rx = y * -8;
      const ry = x * 12;
      card.style.transform = `perspective(700px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(0)`;
      if (thumb) thumb.style.transform = `scale(1.08) rotateX(${rx}deg) rotateY(${ry}deg)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      if (thumb) thumb.style.transform = '';
    });
  });

  /* --------------- INTERSECTION OBSERVER REVEAL --------------- */
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('show');
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  /* --------------- SMOOTH PAGE TRANSITION (simulated) --------------- */
  document.querySelectorAll('a[data-enter]').forEach(a => {
    a.addEventListener('click', e => {
      if (e.metaKey || e.ctrlKey) return;
      e.preventDefault();
      document.body.classList.add('fade-out');
      setTimeout(() => window.location.href = a.href, 360);
    });
  });

  /* ------------------- tsParticles starfield ------------------- */
  if (window.tsParticles) {
    tsParticles.load("starfield", {
      detectRetina: true,
      background: { color: "transparent" },
      fpsLimit: 60,
      particles: {
        number: { value: 160, density: { enable: true, area: 1200 } },
        color: { value: "#ffffff" },
        shape: { type: "circle" },
        opacity: { value: { min: 0.15, max: 0.9 }, animation: { enable: true, speed: 0.2, minimumValue: 0.15 } },
        size: { value: { min: 0.2, max: 1.6 } },
        move: { enable: true, speed: 0.08, random: true, straight: false, outModes: { default: "out" } }
      },
      interactivity: { detectsOn: "canvas", events: { onHover: { enable: false }, onClick: { enable: false }, resize: true } }
    }).catch(err => console.warn('tsParticles load failed', err));
  } else {
    console.warn('tsParticles not loaded - check CDN include');
  }

  const fsHtml = `
  <div id="fs-viewer" class="fs-viewer" aria-hidden="true">
    <div class="fs-backdrop" data-fs-backdrop></div>
    <div class="fs-shell" role="dialog" aria-modal="true" aria-label="Full view">
      <button class="fs-close" aria-label="Close viewer">&times;</button>
      <button class="fs-nav fs-prev" aria-label="Previous" data-fs-prev>‹</button>
      <button class="fs-nav fs-next" aria-label="Next" data-fs-next>›</button>
      <div class="fs-body">
        <div class="fs-media">
          <img id="fs-image" alt="">
        </div>
        <div class="fs-meta">
          <h3 id="fs-title"></h3>
          <p id="fs-desc"></p>
        </div>
      </div>
    </div>
  </div>
  `;
  const fsContainer = document.createElement('div');
  fsContainer.innerHTML = fsHtml;
  document.body.appendChild(fsContainer.firstElementChild);

  const FS = document.getElementById('fs-viewer');
  const FS_IMG = document.getElementById('fs-image');
  const FS_TITLE = document.getElementById('fs-title');
  const FS_DESC = document.getElementById('fs-desc');
  const FS_CLOSE = FS.querySelector('.fs-close');
  const FS_BACKDROP = FS.querySelector('[data-fs-backdrop]');
  const FS_PREV = FS.querySelector('[data-fs-prev]');
  const FS_NEXT = FS.querySelector('[data-fs-next]');

  const cards = Array.from(document.querySelectorAll('.card')).filter(c => c.querySelector('.thumb'));

  function extractCardData(card) {
    let imgUrl = '';
    const thumb = card.querySelector('.thumb');
    if (thumb) {
      const bg = thumb.style.backgroundImage || window.getComputedStyle(thumb).backgroundImage || '';
      const match = bg.match(/url\(["']?(.*?)["']?\)/);
      if (match) imgUrl = match[1];
    }
    if (!imgUrl) {
      const imgTag = card.querySelector('img');
      if (imgTag && imgTag.src) imgUrl = imgTag.src;
    }
    const titleEl = card.querySelector('h4, h5, h3, h2, h1');
    const title = titleEl ? titleEl.textContent.trim() : '';
    let descEl = card.querySelector('.text-muted.small, .text-muted, p');
    const desc = descEl ? descEl.textContent.trim() : '';
    return { imgUrl, title, desc };
  }

  let currentIndex = -1;
  function openViewer(index) {
    if (index < 0 || index >= cards.length) return;
    const data = extractCardData(cards[index]);
    FS_IMG.src = data.imgUrl || '';
    FS_IMG.alt = data.title || '';
    FS_TITLE.textContent = data.title || '';
    FS_DESC.textContent = data.desc || '';
    FS.classList.add('fs-show');
    FS.setAttribute('aria-hidden', 'false');
    document.documentElement.classList.add('fs-open');
    currentIndex = index;
    preloadIndex(index - 1);
    preloadIndex(index + 1);
  }

  function closeViewer() {
    FS.classList.remove('fs-show');
    FS.setAttribute('aria-hidden', 'true');
    document.documentElement.classList.remove('fs-open');
    setTimeout(() => {
      FS_IMG.src = '';
      FS_TITLE.textContent = '';
      FS_DESC.textContent = '';
      currentIndex = -1;
    }, 300);
  }

  function navigateNext() { if(currentIndex !== -1) openViewer((currentIndex+1)%cards.length); }
  function navigatePrev() { if(currentIndex !== -1) openViewer((currentIndex-1+cards.length)%cards.length); }

  function preloadIndex(i){
    if(i<0||i>=cards.length) return;
    const { imgUrl } = extractCardData(cards[i]);
    if(imgUrl) new Image().src = imgUrl;
  }

  cards.forEach((card,i)=>{
    card.addEventListener('click',e=>{
      if(e.target.closest('a')) return;
      openViewer(i);
    });
  });

  FS_CLOSE.addEventListener('click', closeViewer);
  FS_BACKDROP.addEventListener('click', closeViewer);
  FS.addEventListener('click', e=>{ if(e.target===FS) closeViewer(); });
  FS_NEXT.addEventListener('click', e=>{ e.stopPropagation(); navigateNext(); });
  FS_PREV.addEventListener('click', e=>{ e.stopPropagation(); navigatePrev(); });

  document.addEventListener('keydown', e=>{
    if(FS.classList.contains('fs-show')){
      if(e.key==='Escape') closeViewer();
      if(e.key==='ArrowRight') navigateNext();
      if(e.key==='ArrowLeft') navigatePrev();
    }
  });

  let touchStartX=0, touchStartY=0, touchDeltaX=0, touchDeltaY=0, touchMoved=false;

  FS.addEventListener('touchstart', ev=>{
    if(!ev.touches||ev.touches.length>1) return;
    touchStartX=ev.touches[0].clientX;
    touchStartY=ev.touches[0].clientY;
    touchMoved=false;
  },{passive:true});

  FS.addEventListener('touchmove', ev=>{
    if(!ev.touches||ev.touches.length>1) return;
    touchDeltaX=ev.touches[0].clientX-touchStartX;
    touchDeltaY=ev.touches[0].clientY-touchStartY;
    if(Math.abs(touchDeltaX)>10||Math.abs(touchDeltaY)>10) touchMoved=true;
  },{passive:true});

  FS.addEventListener('touchend', ev=>{
    if(!touchMoved) return;
    if(touchDeltaY>80&&Math.abs(touchDeltaY)>Math.abs(touchDeltaX)){ closeViewer(); return; }
    if(touchDeltaX<-50){ navigateNext(); return; }
    if(touchDeltaX>50){ navigatePrev(); return; }
  });

});
