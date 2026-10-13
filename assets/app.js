'use strict';
(() => {
  const header=document.querySelector('.site-header');
  const toggle=document.querySelector('.menu-toggle');
  const nav=document.querySelector('#navigation');
  if(toggle&&nav){
    header.classList.add('enhanced');toggle.hidden=false;
    const setMenu=open=>{nav.classList.toggle('open',open);toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'Menü bezárása':'Menü megnyitása');document.body.classList.toggle('menu-open',open);};
    const close=()=>setMenu(false);
    toggle.addEventListener('click',()=>setMenu(toggle.getAttribute('aria-expanded')!=='true'));
    nav.addEventListener('click',e=>{if(e.target.closest('a'))close();});
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&nav.classList.contains('open')){close();toggle.focus();}});
    window.matchMedia('(min-width: 761px)').addEventListener('change',close);
  }
  if(header){
    const syncHeader=()=>{if(!document.body.classList.contains('lightbox-open'))header.classList.toggle('is-scrolled',window.scrollY>24);};
    syncHeader();
    window.addEventListener('scroll',syncHeader,{passive:true});
  }
  const video=document.querySelector('.hero-video');
  const videoButton=document.querySelector('.video-toggle');
  if(video){
    const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
    const connection=navigator.connection;
    let manuallyPaused=false,visible=true,autoReady=true;
    const load=()=>{if(!video.getAttribute('src')){video.src=window.matchMedia('(max-width: 760px)').matches?video.dataset.mobile:video.dataset.desktop;video.load();}};
    const play=async()=>{load();try{await video.play();}catch{if(videoButton)videoButton.textContent='Videó lejátszása';}};
    const label=()=>{if(videoButton){const text=video.paused?'Videó lejátszása':'Videó szüneteltetése';videoButton.textContent=text;videoButton.setAttribute('aria-label',text);}};
    if(videoButton){videoButton.hidden=false;label();}
    video.addEventListener('playing',()=>{video.classList.add('playing');label();});video.addEventListener('pause',label);
    video.addEventListener('error',()=>{video.classList.remove('playing');if(videoButton){videoButton.textContent='A videó nem érhető el';videoButton.disabled=true;}});
    if(videoButton)videoButton.addEventListener('click',()=>{if(video.paused){manuallyPaused=false;play();}else{manuallyPaused=true;video.pause();}});
    const shouldPlay=()=>autoReady&&!manuallyPaused&&!reduced.matches&&!connection?.saveData&&!/2g/.test(connection?.effectiveType||'')&&!document.hidden&&visible;
    if('IntersectionObserver' in window){new IntersectionObserver(entries=>{visible=entries[0].intersectionRatio>=.32;if(shouldPlay())play();else video.pause();},{threshold:[0,.32]}).observe(video.parentElement);}
    else if(shouldPlay())play();
    if(shouldPlay())play();
    document.addEventListener('visibilitychange',()=>{if(shouldPlay())play();else video.pause();});
    reduced.addEventListener('change',()=>{if(reduced.matches)video.pause();});
  }
  const pizza=document.querySelector('.pizza-scroll img');
  if(pizza){
    const section=pizza.closest('.craft');
    const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
    let scheduled=false,active=false;
    const syncScroll=()=>{
      if(!active){scheduled=false;return;}
      const rect=section.getBoundingClientRect();
      const progress=Math.max(0,Math.min(1,(window.innerHeight-rect.top)/(window.innerHeight+rect.height)));
      pizza.style.setProperty('--pizza-angle',`${reduced.matches?0:progress*100}deg`);
      scheduled=false;
    };
    window.addEventListener('scroll',()=>{if(!scheduled){scheduled=true;requestAnimationFrame(syncScroll);}},{passive:true});
    window.addEventListener('resize',syncScroll);
    reduced.addEventListener('change',syncScroll);
    if('IntersectionObserver' in window){new IntersectionObserver(entries=>{active=entries[0].isIntersecting;if(active)syncScroll();},{rootMargin:'45% 0px'}).observe(section);}
    else{active=true;syncScroll();}
  }
  const filters=[...document.querySelectorAll('[data-filter]')];
  const sections=[...document.querySelectorAll('[data-category]')];
  if(filters.length){
    document.querySelector('.filter-bar').hidden=false;
    const apply=(id)=>{if(!filters.some(b=>b.dataset.filter===id))id='all';filters.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.filter===id)));sections.forEach(s=>s.hidden=id!=='all'&&s.dataset.category!==id);const active=filters.find(b=>b.dataset.filter===id);document.querySelector('#filter-status').textContent=active.textContent+' kategória megjelenítve.';};
    filters.forEach(b=>b.addEventListener('click',()=>{apply(b.dataset.filter);history.replaceState(null,'',b.dataset.filter==='all'?location.pathname:'#'+b.dataset.filter);}));
    apply(location.hash.slice(1));window.addEventListener('hashchange',()=>apply(location.hash.slice(1)));
  }
  const lightbox=document.querySelector('.lightbox');
  if(lightbox){
    let lightboxScroll=0;
    let bodyStyle={};
    const lockPage=()=>{
      lightboxScroll=window.scrollY;
      const pageWidth=document.documentElement.clientWidth;
      if(header){document.documentElement.style.setProperty('--lightbox-header-height',`${header.getBoundingClientRect().height}px`);const brandImage=header.querySelector('.brand img');if(brandImage)document.documentElement.style.setProperty('--lightbox-brand-width',`${brandImage.getBoundingClientRect().width}px`);}
      bodyStyle={position:document.body.style.position,top:document.body.style.top,left:document.body.style.left,right:document.body.style.right,width:document.body.style.width,paddingRight:document.body.style.paddingRight};
      document.body.classList.add('lightbox-open');document.body.style.position='fixed';document.body.style.top=`-${lightboxScroll}px`;document.body.style.left='0';document.body.style.right='auto';document.body.style.width=`${pageWidth}px`;
    };
    const unlockPage=()=>{
      const root=document.documentElement;const behavior=root.style.scrollBehavior;root.style.scrollBehavior='auto';
      Object.assign(document.body.style,bodyStyle);window.scrollTo({top:lightboxScroll,left:0,behavior:'auto'});document.body.classList.remove('lightbox-open');root.style.removeProperty('--lightbox-header-height');root.style.removeProperty('--lightbox-brand-width');root.style.scrollBehavior=behavior;
    };
    document.querySelectorAll('[data-gallery]').forEach(button=>button.addEventListener('click',()=>{
      const photo=button.querySelector('img');const full=lightbox.querySelector('img');full.src=button.dataset.gallery;full.alt=photo.alt;lockPage();lightbox.showModal();lightbox.querySelector('.lightbox-close').focus({preventScroll:true});
    }));
    lightbox.addEventListener('close',unlockPage);
    lightbox.querySelector('button').addEventListener('click',()=>lightbox.close());
    lightbox.addEventListener('click',e=>{if(e.target===lightbox){const r=lightbox.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)lightbox.close();}});
  }
  const mapFrame=document.querySelector('.google-map-frame');
  if(mapFrame&&'IntersectionObserver' in window){
    new IntersectionObserver(entries=>{
      if(entries[0].isIntersecting)mapFrame.style.filter='none';
    },{threshold:.05}).observe(mapFrame);
  }
})();
