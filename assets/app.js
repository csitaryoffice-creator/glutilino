'use strict';
(() => {
  const header=document.querySelector('.site-header');
  const toggle=document.querySelector('.menu-toggle');
  const nav=document.querySelector('#navigation');
  const normalizePath=path=>{
    const normalized=(path||'/').replace(/\/index\.html$/i,'/');
    return normalized.endsWith('/')?normalized:`${normalized}/`;
  };
  if(toggle&&nav){
    header.classList.add('enhanced');toggle.hidden=false;
    const setMenu=open=>{nav.classList.toggle('open',open);toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'Menü bezárása':'Menü megnyitása');document.body.classList.toggle('menu-open',open);};
    const close=()=>setMenu(false);
    toggle.addEventListener('click',()=>setMenu(toggle.getAttribute('aria-expanded')!=='true'));
    nav.addEventListener('click',e=>{
      const link=e.target.closest('a');
      if(!link)return;
      const url=new URL(link.href,window.location.href);
      const samePage=url.origin===window.location.origin&&normalizePath(url.pathname)===normalizePath(window.location.pathname);
      if(samePage&&url.hash&&window.matchMedia('(max-width: 1100px)').matches){
        const target=document.querySelector(url.hash);
        if(target){
          e.preventDefault();
          close();
          const scrollToTarget=()=>{
            const headerHeight=header?.getBoundingClientRect().height||0;
            const top=Math.max(0,target.getBoundingClientRect().top+window.scrollY-headerHeight-14);
            const previousScrollBehavior=document.documentElement.style.scrollBehavior;
            document.documentElement.style.scrollBehavior='auto';
            window.scrollTo({top,behavior:'auto'});
            requestAnimationFrame(()=>{document.documentElement.style.scrollBehavior=previousScrollBehavior;});
          };
          requestAnimationFrame(()=>requestAnimationFrame(()=>{
            scrollToTarget();
            window.setTimeout(scrollToTarget,180);
            history.pushState(null,'',url.hash);
          }));
          return;
        }
      }
      close();
    });
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&nav.classList.contains('open')){close();toggle.focus();}});
    window.matchMedia('(min-width: 1101px)').addEventListener('change',close);
  }
  if(header){
    const syncHeader=()=>{if(!document.body.classList.contains('lightbox-open'))header.classList.toggle('is-scrolled',window.scrollY>24);};
    syncHeader();
    window.addEventListener('scroll',syncHeader,{passive:true});
  }
  const orderLinks=[...document.querySelectorAll('.nav-order,.header-cta,.hero-secondary')];
  if(orderLinks.length){
    const orderDialog=document.createElement('dialog');
    orderDialog.className='order-dialog';
    orderDialog.setAttribute('aria-labelledby','order-dialog-title');
    orderDialog.innerHTML=`<div class="order-dialog-card">
      <button class="order-dialog-close" type="button" aria-label="Rendelési ablak bezárása">×</button>
      <h2 id="order-dialog-title">Rendelés elvitelre</h2>
      <p>Számunkra kiemelten fontos, hogy gluténmentes ételeink biztonságosan kerüljenek hozzád. Jelenleg nem tudunk olyan ételkiszállító szolgáltatást igénybe venni, amelynél garantálható lenne a keresztszennyeződés elkerülése, ezért házhozszállítást egyelőre nem vállalunk.</p>
      <p><strong>Telefonon viszont örömmel felvesszük a rendelésedet</strong>, az elkészült ételt pedig személyesen átveheted nálunk.</p>
      <p>Köszönjük a megértésedet és azt, hogy ebben is segítesz nekünk a biztonságot az első helyen tartani.</p>
      <a class="button order-dialog-cta" href="tel:+36300743932">Leadom a rendelést</a>
    </div>`;
    document.body.append(orderDialog);
    const closeButton=orderDialog.querySelector('.order-dialog-close');
    const closeOrder=()=>{
      if(typeof orderDialog.close==='function'&&orderDialog.open)orderDialog.close();
      else{orderDialog.removeAttribute('open');document.body.classList.remove('order-dialog-open');}
    };
    orderLinks.forEach(link=>link.addEventListener('click',event=>{
      event.preventDefault();
      if(typeof orderDialog.showModal==='function')orderDialog.showModal();
      else orderDialog.setAttribute('open','');
      document.body.classList.add('order-dialog-open');
    }));
    closeButton.addEventListener('click',closeOrder);
    orderDialog.addEventListener('click',event=>{if(event.target===orderDialog)closeOrder();});
    orderDialog.addEventListener('close',()=>document.body.classList.remove('order-dialog-open'));
    orderDialog.addEventListener('cancel',()=>document.body.classList.remove('order-dialog-open'));
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
  const filterBar=document.querySelector('.filter-bar');
  if(filters.length&&filterBar){
    filterBar.hidden=false;
    const normalize=id=>filters.some(button=>button.dataset.filter===id)?id:'all';
    const readHashCategory=()=>normalize(location.hash.slice(1)||'all');
    const clearCategoryHash=()=>{
      if(location.hash)history.replaceState(history.state,'',location.pathname+location.search);
    };
    const updateAnchorOffset=()=>{
      const headerHeight=header?.getBoundingClientRect().height||0;
      const filterHeight=filterBar.getBoundingClientRect().height||0;
      const gap=window.matchMedia('(max-width: 760px)').matches?16:22;
      const offset=Math.ceil(headerHeight+filterHeight+gap);
      document.documentElement.style.setProperty('--menu-anchor-offset',`${offset}px`);
      return offset;
    };
    const apply=id=>{
      id=normalize(id);
      filters.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.filter===id)));
      sections.forEach(section=>section.hidden=id!=='all'&&section.dataset.category!==id);
      const active=filters.find(button=>button.dataset.filter===id);
      const status=document.querySelector('#filter-status');
      if(status&&active)status.textContent=active.textContent+' kategória megjelenítve.';
      return id;
    };
    const scrollToCategory=(id,behavior='auto',shouldProceed=()=>true)=>{
      const target=sections.find(section=>section.dataset.category===id);
      if(!target)return;
      requestAnimationFrame(()=>requestAnimationFrame(()=>{
        if(!shouldProceed())return;
        const offset=updateAnchorOffset();
        const top=target.getBoundingClientRect().top+window.scrollY-offset;
        window.scrollTo({top:Math.max(0,top),behavior});
      }));
    };
    filterBar.addEventListener('click',event=>{
      const button=event.target.closest('[data-filter]');
      if(!button||!filterBar.contains(button))return;
      event.preventDefault();
      const id=apply(button.dataset.filter);
      clearCategoryHash();
      if(id!=='all')scrollToCategory(id,'smooth');
    });
    const openHashCategory=()=>{
      const id=readHashCategory();
      clearCategoryHash();
      window.scrollTo({top:0,left:0,behavior:'auto'});
      apply(id);
      updateAnchorOffset();
      if(id!=='all')scrollToCategory(id);
    };
    if('scrollRestoration' in history)history.scrollRestoration='manual';
    const initialCategory=readHashCategory();
    clearCategoryHash();
    window.scrollTo({top:0,left:0,behavior:'auto'});
    apply(initialCategory);
    updateAnchorOffset();
    window.addEventListener('hashchange',openHashCategory);
    window.addEventListener('resize',updateAnchorOffset,{passive:true});
    let initialPositioningCancelled=false;
    const cancelInitialPositioning=()=>{initialPositioningCancelled=true;};
    window.addEventListener('wheel',cancelInitialPositioning,{once:true,passive:true});
    window.addEventListener('touchstart',cancelInitialPositioning,{once:true,passive:true});
    window.addEventListener('pointerdown',cancelInitialPositioning,{once:true,passive:true});
    window.addEventListener('keydown',cancelInitialPositioning,{once:true});
    const positionInitialCategory=()=>{
      updateAnchorOffset();
      if(initialCategory!=='all')scrollToCategory(initialCategory,'auto',()=>!initialPositioningCancelled);
    };
    if(document.readyState==='complete')positionInitialCategory();
    else window.addEventListener('load',positionInitialCategory,{once:true});
    document.fonts?.ready?.then(updateAnchorOffset);
  }
  const menuBook=document.querySelector('[data-menu-book]');
  if(menuBook){
    const spreads=[...menuBook.querySelectorAll('[data-book-spread]')];
    const pages=[];
    spreads.forEach((spread,spreadIndex)=>{
      [...spread.querySelectorAll('.menu-book-page:not(.menu-book-blank)')].forEach(page=>pages.push({page,spreadIndex}));
    });
    const previous=menuBook.querySelector('[data-book-prev]');
    const next=menuBook.querySelector('[data-book-next]');
    const status=menuBook.querySelector('[data-book-status]');
    const stage=menuBook.querySelector('.menu-book-stage');
    const magnifier=menuBook.querySelector('[data-book-magnifier]');
    const fullscreenButton=menuBook.querySelector('[data-book-fullscreen]');
    const closeButton=menuBook.querySelector('[data-book-close]');
    const zoomButton=menuBook.querySelector('[data-book-zoom]');
    const labels=['Címlap','Ételek · 1–2. oldal','Italok · 3–4. oldal','Hátlap'];
    const pageLabels=pages.map(({page},index)=>page.querySelector('img')?.alt||`${index+1}. oldal`);
    const canMagnify=window.matchMedia('(hover: hover) and (pointer: fine)');
    const mobileBookLayout=window.matchMedia('(max-width: 760px)');
    let active=0,pageActive=mobileBookLayout.matches?1:0,dragging=false,startX=0,startY=0,deltaX=0;
    const isSingleMode=()=>mobileBookLayout.matches&&menuBook.classList.contains('is-fullscreen-custom');
    const hideMagnifier=()=>{if(magnifier)magnifier.classList.remove('is-visible');};
    const clearTouchZoom=()=>{
      menuBook.classList.remove('is-touch-zoomed');
      if(zoomButton){zoomButton.setAttribute('aria-pressed','false');zoomButton.setAttribute('aria-label','Nagyítás bekapcsolása');}
    };
    const fitBookToViewport=()=>{
      if(!stage||menuBook.classList.contains('is-fullscreen-custom'))return;
      window.requestAnimationFrame(()=>{
        const viewportHeight=Math.min(window.innerHeight,window.visualViewport?.height||window.innerHeight);
        const top=Math.max(0,stage.getBoundingClientRect().top);
        const gap=mobileBookLayout.matches?18:28;
        const availableHeight=Math.max(180,viewportHeight-top-gap);
        if(!mobileBookLayout.matches&&availableHeight<viewportHeight*.55){
          menuBook.style.removeProperty('--menu-book-open-width');
          menuBook.style.removeProperty('--menu-book-cover-width');
          return;
        }
        menuBook.style.setProperty('--menu-book-open-width',`${availableHeight*.9425}px`);
        menuBook.style.setProperty('--menu-book-cover-width',`${availableHeight*.4717}px`);
      });
    };
    const resetDraggedSpread=()=>{
      const current=spreads[active];
      if(!current)return;
      current.style.transition='transform .22s ease';current.style.transform='';
      window.setTimeout(()=>{current.style.transition='';},240);
    };
    const prepareSpreads=(target,direction)=>{
      spreads.forEach((spread,index)=>{
        spread.classList.remove('is-active','is-turning-forward','is-turning-back');
        spread.setAttribute('aria-hidden',String(index!==target));
        spread.style.transform='';spread.style.transition='';
      });
      active=target;
      const current=spreads[active];
      current.classList.add('is-active',direction>0?'is-turning-forward':'is-turning-back');
      window.setTimeout(()=>current.classList.remove('is-turning-forward','is-turning-back'),520);
    };
    const showSpread=(index,direction=1)=>{
      const target=Math.max(0,Math.min(spreads.length-1,index));
      hideMagnifier();clearTouchZoom();menuBook.classList.remove('is-mobile-single');
      pages.forEach(({page})=>page.classList.remove('is-mobile-page-active'));
      prepareSpreads(target,direction);
      menuBook.classList.toggle('is-cover',active===0);
      menuBook.classList.toggle('is-back',active===spreads.length-1);
      previous.disabled=active===0;next.disabled=active===spreads.length-1;
      status.textContent=labels[active]||`${active+1}. oldalpár`;
      const firstPage=pages.findIndex(item=>item.spreadIndex===active);
      if(firstPage>=0)pageActive=firstPage;
    };
    const showPage=(index,direction=1)=>{
      pageActive=Math.max(0,Math.min(pages.length-1,index));
      const entry=pages[pageActive];
      hideMagnifier();clearTouchZoom();menuBook.classList.add('is-mobile-single');
      prepareSpreads(entry.spreadIndex,direction);
      pages.forEach(({page},i)=>page.classList.toggle('is-mobile-page-active',i===pageActive));
      menuBook.classList.toggle('is-cover',pageActive===0);
      menuBook.classList.toggle('is-back',pageActive===pages.length-1);
      previous.disabled=pageActive===0;next.disabled=pageActive===pages.length-1;
      status.textContent=pageLabels[pageActive];
    };
    const go=delta=>isSingleMode()?showPage(pageActive+delta,delta):showSpread(active+delta,delta);
    previous.addEventListener('click',()=>go(-1));
    next.addEventListener('click',()=>go(1));
    menuBook.addEventListener('keydown',event=>{
      if(event.key==='ArrowRight'){event.preventDefault();go(1);}
      if(event.key==='ArrowLeft'){event.preventDefault();go(-1);}
      if(event.key==='Escape'&&menuBook.classList.contains('is-fullscreen-custom')){event.preventDefault();setFullscreen(false);}
    });
    if(stage){
      stage.addEventListener('dragstart',event=>event.preventDefault());
      stage.addEventListener('pointerdown',event=>{
        if(event.button!==0||menuBook.classList.contains('is-touch-zoomed'))return;
        dragging=true;startX=event.clientX;startY=event.clientY;deltaX=0;
        hideMagnifier();menuBook.classList.add('is-dragging');
        spreads[active].classList.remove('is-turning-forward','is-turning-back');
        stage.setPointerCapture?.(event.pointerId);
      });
      stage.addEventListener('pointermove',event=>{
        if(menuBook.classList.contains('is-touch-zoomed')){
          const image=event.target.closest('.menu-book-page.is-mobile-page-active img, .menu-book-spread.is-active .menu-book-page img');
          if(image){const rect=image.getBoundingClientRect();menuBook.style.setProperty('--book-zoom-x',`${Math.max(0,Math.min(100,(event.clientX-rect.left)/rect.width*100))}%`);menuBook.style.setProperty('--book-zoom-y',`${Math.max(0,Math.min(100,(event.clientY-rect.top)/rect.height*100))}%`);}
          return;
        }
        if(dragging){
          deltaX=event.clientX-startX;
          const deltaY=event.clientY-startY;
          if(Math.abs(deltaX)>8&&Math.abs(deltaX)>Math.abs(deltaY))event.preventDefault();
          const visual=Math.max(-130,Math.min(130,deltaX*.28));
          spreads[active].style.transition='none';
          spreads[active].style.transform=`translate3d(${visual}px,0,0) rotateY(${visual/24}deg)`;
          return;
        }
        if(!canMagnify.matches||event.pointerType!=='mouse'||!magnifier)return;
        const image=event.target.closest('.menu-book-spread.is-active .menu-book-page img');
        if(!image){hideMagnifier();return;}
        const rect=image.getBoundingClientRect();
        const x=event.clientX-rect.left,y=event.clientY-rect.top;
        const lens=magnifier.getBoundingClientRect().width||210,zoom=2.45;
        magnifier.style.left=`${event.clientX}px`;magnifier.style.top=`${event.clientY}px`;
        magnifier.style.backgroundImage=`url("${image.currentSrc||image.src}")`;
        magnifier.style.backgroundSize=`${rect.width*zoom}px ${rect.height*zoom}px`;
        magnifier.style.backgroundPosition=`${lens/2-x*zoom}px ${lens/2-y*zoom}px`;
        magnifier.classList.add('is-visible');
      });
      stage.addEventListener('pointerup',event=>{
        if(!dragging)return;
        dragging=false;menuBook.classList.remove('is-dragging');
        if(stage.hasPointerCapture?.(event.pointerId))stage.releasePointerCapture(event.pointerId);
        const threshold=Math.min(86,stage.getBoundingClientRect().width*.1);
        if(Math.abs(deltaX)>threshold)go(deltaX<0?1:-1);else resetDraggedSpread();
      });
      stage.addEventListener('pointercancel',()=>{dragging=false;deltaX=0;menuBook.classList.remove('is-dragging');resetDraggedSpread();});
      stage.addEventListener('pointerleave',()=>{if(!dragging)hideMagnifier();});
    }
    const setFullscreen=open=>{
      menuBook.classList.toggle('is-fullscreen-custom',open);
      document.body.classList.toggle('menu-book-fullscreen-open',open);
      fullscreenButton?.setAttribute('aria-label',open?'Kilépés a teljes képernyőből':'Étlap megnyitása teljes képernyőn');
      hideMagnifier();clearTouchZoom();
      if(open&&mobileBookLayout.matches){
        const firstPage=pages.findIndex(item=>item.spreadIndex===active);
        showPage(firstPage>=0?firstPage:pageActive,1);
      }else if(!open){showSpread(pages[pageActive]?.spreadIndex??active,1);fitBookToViewport();}
    };
    fullscreenButton?.addEventListener('click',()=>setFullscreen(!menuBook.classList.contains('is-fullscreen-custom')));
    closeButton?.addEventListener('click',event=>{
      event.preventDefault();
      event.stopPropagation();
      setFullscreen(false);
    });
    zoomButton?.addEventListener('click',()=>{
      if(mobileBookLayout.matches)return;
      const open=!menuBook.classList.contains('is-touch-zoomed');
      menuBook.classList.toggle('is-touch-zoomed',open);
      zoomButton.setAttribute('aria-pressed',String(open));
      zoomButton.setAttribute('aria-label',open?'Nagyítás kikapcsolása':'Nagyítás bekapcsolása');
    });
    const syncInitialBookView=()=>{
      if(menuBook.classList.contains('is-fullscreen-custom'))setFullscreen(false);
      showSpread(mobileBookLayout.matches?1:active,1);fitBookToViewport();
    };
    showSpread(mobileBookLayout.matches?1:0);
    fitBookToViewport();
    mobileBookLayout.addEventListener?.('change',syncInitialBookView);
    window.addEventListener('resize',fitBookToViewport,{passive:true});
    window.visualViewport?.addEventListener('resize',fitBookToViewport,{passive:true});
    window.addEventListener('load',fitBookToViewport,{once:true});
    document.fonts?.ready?.then(fitBookToViewport);
    window.addEventListener('pageshow',syncInitialBookView);
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
  const reviewCarousel=document.querySelector('[data-review-carousel]');
  if(reviewCarousel){
    const slides=[...reviewCarousel.querySelectorAll('[data-review-slide]')];
    const dots=[...reviewCarousel.querySelectorAll('[data-review-dot]')];
    const viewport=reviewCarousel.querySelector('.review-viewport');
    const track=reviewCarousel.querySelector('.review-track');
    const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
    let active=0,timer=0,physical=slides.length,dragging=false,startX=0,deltaX=0;
    let cachedStep=0,dragBase=0,dragFrame=0,lastX=0,lastTime=0,velocity=0;
    const interval=12000;
    const visibleCount=()=>window.matchMedia('(max-width: 760px)').matches?1:window.matchMedia('(max-width: 1100px)').matches?2:3;
    const syncA11y=()=>{
      const visible=new Set(Array.from({length:visibleCount()},(_,offset)=>(active+offset)%slides.length));
      slides.forEach((slide,i)=>{slide.classList.toggle('is-active',i===active);slide.setAttribute('aria-hidden',String(!visible.has(i)));});
      dots.forEach((dot,i)=>{const current=i===active;dot.setAttribute('aria-current',String(current));dot.tabIndex=current?0:-1;});
    };
    const clone=slide=>{const copy=slide.cloneNode(true);copy.classList.add('review-clone');copy.classList.remove('is-active');copy.removeAttribute('data-review-slide');copy.setAttribute('aria-hidden','true');return copy;};
    if(viewport&&track&&slides.length>1){
      track.prepend(...slides.map(clone));
      track.append(...slides.map(clone));
    }
    const measureStep=()=>{const first=track?.querySelector('.review-slide');if(!first)return 0;const styles=getComputedStyle(track);cachedStep=first.getBoundingClientRect().width+(parseFloat(styles.columnGap)||parseFloat(styles.gap)||0);return cachedStep;};
    const setPosition=(animate,offset=0)=>{
      if(!track)return;
      const distance=cachedStep||measureStep();
      track.style.transition=animate&&!reduced.matches?'transform .44s cubic-bezier(.2,.8,.2,1)':'none';
      track.style.transform=`translate3d(${-(physical*distance)+offset}px,0,0)`;
    };
    const normalize=()=>{
      if(physical>=slides.length*2){physical-=slides.length;setPosition(false);}
      else if(physical<slides.length){physical+=slides.length;setPosition(false);}
    };
    const goBy=delta=>{active=(active+delta+slides.length)%slides.length;physical+=delta;syncA11y();setPosition(true);};
    const goTo=index=>{let delta=(index-active+slides.length)%slides.length;if(delta>slides.length/2)delta-=slides.length;active=index;physical+=delta;syncA11y();setPosition(true);};
    const stop=()=>{if(timer){window.clearInterval(timer);timer=0;}};
    const start=(ignoreHover=false)=>{stop();if(!reduced.matches&&slides.length>1&&!document.hidden&&(ignoreHover||!reviewCarousel.matches(':hover'))&&!reviewCarousel.contains(document.activeElement))timer=window.setInterval(()=>goBy(1),interval);};
    dots.forEach((dot,i)=>dot.addEventListener('click',()=>goTo(i)));
    if(viewport&&track){
      const finishDrag=event=>{
        if(!dragging)return;
        dragging=false;viewport.classList.remove('is-dragging');
        if(viewport.hasPointerCapture?.(event.pointerId))viewport.releasePointerCapture(event.pointerId);
        if(dragFrame){cancelAnimationFrame(dragFrame);dragFrame=0;track.style.transform=`translate3d(${dragBase+deltaX}px,0,0)`;}
        const threshold=Math.min(72,cachedStep*.15);
        const shouldMove=event.type!=='pointercancel'&&(Math.abs(deltaX)>threshold||Math.abs(velocity)>.42);
        if(shouldMove){
          const direction=(Math.abs(deltaX)>12?deltaX:velocity)<0?1:-1;
          const amount=Math.max(1,Math.min(3,Math.round(Math.abs(deltaX)/cachedStep)||1));
          goBy(direction*amount);
        }else setPosition(true);
        if(event.pointerType!=='mouse')window.setTimeout(()=>start(true),600);
      };
      viewport.addEventListener('pointerdown',event=>{
        if(event.button!==0)return;
        cachedStep=measureStep();dragBase=-(physical*cachedStep);dragging=true;startX=event.clientX;deltaX=0;lastX=event.clientX;lastTime=performance.now();velocity=0;
        stop();track.style.transition='none';viewport.classList.add('is-dragging');viewport.setPointerCapture?.(event.pointerId);
      });
      viewport.addEventListener('pointermove',event=>{
        if(!dragging)return;
        deltaX=event.clientX-startX;
        const now=performance.now();const elapsed=Math.max(1,now-lastTime);const instant=(event.clientX-lastX)/elapsed;
        velocity=velocity*.72+instant*.28;lastX=event.clientX;lastTime=now;
        if(Math.abs(deltaX)>3){
          event.preventDefault();
          if(!dragFrame)dragFrame=requestAnimationFrame(()=>{track.style.transform=`translate3d(${dragBase+deltaX}px,0,0)`;dragFrame=0;});
        }
      });
      viewport.addEventListener('pointerup',finishDrag);
      viewport.addEventListener('pointercancel',finishDrag);
      track.addEventListener('transitionend',normalize);
    }
    reviewCarousel.addEventListener('mouseenter',stop);
    reviewCarousel.addEventListener('mouseleave',start);
    reviewCarousel.addEventListener('focusin',stop);
    reviewCarousel.addEventListener('focusout',()=>window.setTimeout(()=>{if(!reviewCarousel.contains(document.activeElement))start();},0));
    window.addEventListener('resize',()=>{cachedStep=0;syncA11y();requestAnimationFrame(()=>setPosition(false));});
    document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();else start();});
    reduced.addEventListener('change',()=>{setPosition(false);start();});
    syncA11y();setPosition(false);start();
  }
  const mapFrame=document.querySelector('.google-map-frame');
  if(mapFrame&&'IntersectionObserver' in window){
    new IntersectionObserver(entries=>{
      if(entries[0].isIntersecting)mapFrame.style.filter='none';
    },{threshold:.05}).observe(mapFrame);
  }
})();
