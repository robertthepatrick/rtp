/* ============================================================
   ROBERT the PATRICK — canonical shared script (site.js)
   Assembled by audit from the 26 live pages on 2026-11-15.
   REFERENCE FILE ONLY — no live artifact has been changed to
   use it yet. Four parts, in load order on the case-study
   template pages:
     1. the "js" class gate (tiny inline script in <head>)
     2. nav-toggle + scroll-hide-header + header-tone script
     3. custom cursor (pixel-sampling variant — the more
        complete of the two variants found; ~2/3 of pages
        already use this one)
     4. clip-path image-reveal IntersectionObserver
     5. click-to-lightbox (only needed on gallery pages, but
        harmless to include everywhere — it no-ops if there
        are no .gallery-pair/.gallery-grid3/.gallery-grid images)

   NOTE on drift found during the audit: the header-tone
   function (pairFor/menuFor, part 2) has at least two live
   variants across the 26 pages — a "blue-grey" dark-section
   color (used on most pages, kept below) and a "cream"
   dark-section color (found only on the Labor Protection
   Network page). This file standardizes on the blue-grey
   version used by the majority. See the audit report for
   detail before deciding whether LPN's version was intentional.
   ============================================================ */

/* ---- 1. js class gate (inline in <head> on most pages) ---- */
if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.documentElement.classList.add('js');
}

/* ---- 2. nav-toggle + scroll-hide-header + header-tone ---- */
(function(){
  var d=document,site=d.getElementById('top');
  var tog=d.querySelector('.nav-toggle');
  tog.addEventListener('click',function(){var o=tog.getAttribute('aria-expanded')!=='true';tog.setAttribute('aria-expanded',o);site.classList.toggle('nav-open',o);});
  /* the header hides on scroll down and returns on scroll up, as on every page */
  var lastY=0;
  function onScroll(){
    var y=window.pageYOffset||0;
    site.classList.toggle('scrolled',y>8);
    if(y>lastY+3&&y>8)site.classList.add('hide');
    else if(y<lastY-3||y<=8)site.classList.remove('hide');
    lastY=y;
  }
  /* header tone: colour of the section under the header, the menu takes its contrast */
  function lum(r,g,b){return (.2126*r+.7152*g+.0722*b)/255;}
  function rgbOf(c){var m=c.match(/[\d.]+/g);return m&&m.length>=3?m.map(Number):null;}
  function under(){
    var els=d.elementsFromPoint(innerWidth/2,site.offsetHeight/2);
    for(var i=0;i<els.length;i++){var el=els[i];if(site.contains(el))continue;
      while(el&&el!==d.documentElement){var v=rgbOf(getComputedStyle(el).backgroundColor);
        if(v&&(v.length<4||v[3]>=.5))return v;el=el.parentElement;}
      break;}
    return [255,255,255];
  }
  function pairFor(v){
    var r=v[0],g=v[1],b=v[2],l=lum(r,g,b);
    if(l>.94)return[239,235,225];
    if(l<.12)return[76,95,127];
    if(r>200&&g>140&&b<120)return[1,84,50];
    if(g>r+20&&g>b&&l<.4)return[255,255,255];
    if(r>200&&g>195&&b>180)return[255,189,56];
    return[239,235,225];
  }
  function menuFor(v){
    var r=v[0],g=v[1],b=v[2],l=lum(r,g,b);
    if(l>.94)return['#efebe1','#000'];
    if(l<.12)return['#4c5f7f','#fff'];
    if(r>200&&g>140&&b<120)return['#015432','#fff'];
    if(g>r+20&&g>b&&l<.4)return['#fff','#000'];
    if(r>200&&g>195&&b>180)return['#ffbd38','#000'];
    return['#efebe1','#000'];
  }
  var lastTone='';
  function tone(){
    var v=under(),k=v.join();if(k===lastTone)return;lastTone=k;
    var hb=pairFor(v),ink=lum(hb[0],hb[1],hb[2])<.5?'#fff':'#000',m=menuFor(hb);
    site.style.background='rgb('+hb.join(',')+')';
    site.style.color=ink;
    site.style.setProperty('--ink',ink);
    site.style.setProperty('--menu-bg',m[0]);
    site.style.setProperty('--menu-ink',m[1]);
    site.classList.toggle('on-dark',ink==='#fff');
  }
  var raf2=0;function queueTone(){if(!raf2)raf2=requestAnimationFrame(function(){raf2=0;tone();});}
  window.addEventListener('scroll',function(){onScroll();queueTone();},{passive:true});
  window.addEventListener('resize',queueTone);
  onScroll();tone();
})();

/* ---- 3. custom cursor (pixel-sampling variant) ---- */
(function(){
  var W=window,d=document;
  if(!W.matchMedia||!W.matchMedia('(hover:hover) and (pointer:fine)').matches)return;
  var cur=d.createElement('div');cur.className='cur';cur.setAttribute('aria-hidden','true');
  cur.innerHTML='<svg viewBox="0 0 24 24"><path d="M4 12h15M13 6l6 6-6 6"/></svg>';
  d.body.appendChild(cur);d.documentElement.classList.add('cc');
  var DOT=14/84,BIG=1,tx=-100,ty=-100,cx=-100,cy=-100,cs=DOT,big=false,raf=0,last='';
  function rgb(c){var m=c.match(/[\d.]+/g);return m?m.map(Number):null;}
  function bgPick(x,y){
    var els=d.elementsFromPoint(x,y);
    for(var i=0;i<els.length;i++){var el=els[i];if(el===cur||cur.contains(el))continue;
      var v=rgb(getComputedStyle(el).backgroundColor);if(!v||(v.length>3&&v[3]<.5))continue;
      var r=v[0],g=v[1],b=v[2],l=(.2126*r+.7152*g+.0722*b)/255;
      if(r>200&&g>140&&b<120)return['#000000','#ffbd38'];
      if(l<.2)return['#efebe1','#000000'];
      if(b>r+20&&l<.6)return['#ffbd38','#4c5f7f'];
      return l>.5?['#000000','rgb('+r+','+g+','+b+')']:['#efebe1','rgb('+r+','+g+','+b+')'];
    }
    return['#000000','#ffbd38'];
  }
  /* over a photo, the dot flips light/dark by the actual pixel under
     the cursor, not the section colour behind it. Samples a small cached canvas of the image
     (correcting for its object-fit/object-position crop) and falls back to the section-colour
     method for everything else, or if sampling fails for any reason (e.g. a blocked canvas
     read) — this never breaks the cursor, it only loses this one refinement. */
  function imgData(img){
    if(img._pd!==undefined)return img._pd;
    img._pd=null;
    try{
      var nw=img.naturalWidth,nh=img.naturalHeight;
      if(nw&&nh){
        var max=100,sc=Math.min(1,max/Math.max(nw,nh));
        var cw=Math.max(1,Math.round(nw*sc)),ch=Math.max(1,Math.round(nh*sc));
        var c=document.createElement('canvas');c.width=cw;c.height=ch;
        var ctx=c.getContext('2d');ctx.drawImage(img,0,0,cw,ch);
        img._pd={dt:ctx.getImageData(0,0,cw,ch).data,w:cw,h:ch};
      }
    }catch(e){}
    return img._pd;
  }
  function posFrac(s){
    s=(s||'50%').trim();
    if(s==='left'||s==='top')return 0;
    if(s==='right'||s==='bottom')return 1;
    if(s==='center'||s==='')return .5;
    return s.indexOf('%')>-1?parseFloat(s)/100:.5;
  }
  function imgPixel(img,x,y){
    var pd=imgData(img);if(!pd)return null;
    try{
      var r=img.getBoundingClientRect(),cs=getComputedStyle(img);
      var fit=cs.objectFit||'fill',pos=(cs.objectPosition||'50% 50%').split(/\s+/);
      var px=posFrac(pos[0]),py=posFrac(pos[1]);
      var bw=r.width,bh=r.height,nw=img.naturalWidth,nh=img.naturalHeight;
      var sc=fit==='cover'?Math.max(bw/nw,bh/nh):fit==='contain'?Math.min(bw/nw,bh/nh):1;
      var dw=nw*sc,dh=nh*sc,offX=(dw-bw)*px,offY=(dh-bh)*py;
      var natX=(x-r.left+offX)/sc,natY=(y-r.top+offY)/sc;
      if(natX<0||natY<0||natX>=nw||natY>=nh)return null;
      var sx=Math.min(pd.w-1,Math.max(0,Math.round(natX*pd.w/nw)));
      var sy=Math.min(pd.h-1,Math.max(0,Math.round(natY*pd.h/nh)));
      var i=(sy*pd.w+sx)*4;
      return[pd.dt[i],pd.dt[i+1],pd.dt[i+2]];
    }catch(e){return null;}
  }
  function pick(x,y){
    var top=d.elementFromPoint(x,y);
    if(top&&top.tagName==='IMG'){
      var pv=imgPixel(top,x,y);
      if(pv){
        var r=pv[0],g=pv[1],b=pv[2],l=(.2126*r+.7152*g+.0722*b)/255;
        return l>.5?['#000000','rgb('+r+','+g+','+b+')']:['#efebe1','rgb('+r+','+g+','+b+')'];
      }
    }
    return bgPick(x,y);
  }
  function loop(){
    cx+=(tx-cx)*.35;cy+=(ty-cy)*.35;cs+=((big?BIG:DOT)-cs)*.2;
    cur.style.transform='translate3d('+cx.toFixed(1)+'px,'+cy.toFixed(1)+'px,0) scale('+cs.toFixed(3)+')';
    raf=(Math.abs(tx-cx)>.3||Math.abs(ty-cy)>.3||Math.abs((big?BIG:DOT)-cs)>.002)?W.requestAnimationFrame(loop):0;
  }
  function clickImg(x,y){
    var hit=d.elementFromPoint(x,y);if(hit&&hit.closest){if(hit.closest('.site,.menu'))return false;}
    var ns=d.querySelectorAll('.fig,.ph,.figs,.bleed');
    for(var i=0;i<ns.length;i++){
      var n=ns[i],r=n.getBoundingClientRect();
      if(x<r.left||x>r.right||y<r.top||y>r.bottom)continue;
      if(n.closest('a[href],button,[onclick]'))return true;
      var card=n.closest('.card');
      if(card&&card.querySelector('a[href],button,[onclick]'))return true;
    }
    return false;
  }
  function update(){
    var c=pick(tx,ty),k=c[0]+c[1];
    if(k!==last){cur.style.setProperty('--cc',c[0]);cur.style.setProperty('--cc-on',c[1]);last=k;}
    var on=clickImg(tx,ty);
    if(on!==big){big=on;cur.classList.toggle('big',on);}
    if(!raf)raf=W.requestAnimationFrame(loop);
  }
  d.addEventListener('mousemove',function(e){
    if(!cur.classList.contains('on')){cx=e.clientX;cy=e.clientY;cur.classList.add('on');}
    tx=e.clientX;ty=e.clientY;update();
  },{passive:true});
  W.addEventListener('scroll',function(){if(cur.classList.contains('on'))update();},{passive:true});
  d.documentElement.addEventListener('mouseleave',function(){cur.classList.remove('on');});
  W.addEventListener('blur',function(){cur.classList.remove('on');});
})();

/* ---- 4. clip-path image-reveal IntersectionObserver ---- */
(function(){
  var d=document;if(!d.documentElement.classList.contains('js'))return;
  var clips=[].slice.call(d.querySelectorAll('.clip'));
  function show(el){el.classList.add('in');}
  if(!('IntersectionObserver' in window)){clips.forEach(show);return;}
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){(e.target._clips||[]).forEach(show);io.unobserve(e.target);}});},{rootMargin:'0px 0px -8% 0px',threshold:.05});
  clips.forEach(function(c){var p=c.parentNode;if(!p._clips){p._clips=[];io.observe(p);}p._clips.push(c);});
  setTimeout(function(){clips.forEach(function(c){if(!c.classList.contains('in')){var r=c.parentNode.getBoundingClientRect();if(r.top<innerHeight*.9&&r.bottom>0)show(c);}});},1500);
})();

/* ---- 5. click-to-lightbox (gallery pages only; no-ops elsewhere) ---- */
(function(){
  var d=document;
  var imgs=[].slice.call(d.querySelectorAll('.gallery-pair .ph img, .gallery-grid3 .ph img, .gallery-grid .ph img'));
  if(!imgs.length)return;
  var idx=0;
  var lb=d.createElement('div');
  lb.className='lightbox';
  lb.setAttribute('role','dialog');
  lb.setAttribute('aria-modal','true');
  lb.setAttribute('aria-hidden','true');
  lb.innerHTML=
    '<button class="lightbox-close" aria-label="Close"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M18 6L6 18"/></svg></button>'+
    '<button class="lightbox-prev" aria-label="Previous photograph"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 6l-6 6 6 6"/></svg></button>'+
    '<button class="lightbox-next" aria-label="Next photograph"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 6l6 6-6 6"/></svg></button>'+
    '<img class="lightbox-img" alt="" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==">'+
    '<div class="lightbox-count"></div>';
  d.body.appendChild(lb);
  var img=lb.querySelector('.lightbox-img'),cnt=lb.querySelector('.lightbox-count');
  var lastFocus=null;
  function render(){
    var el=imgs[idx];
    img.src=el.currentSrc||el.src;
    img.alt=el.alt||'';
    cnt.textContent=(idx+1)+' / '+imgs.length;
  }
  function open(i){
    idx=i;lastFocus=d.activeElement;render();
    lb.classList.add('open');lb.setAttribute('aria-hidden','false');
    requestAnimationFrame(function(){lb.classList.add('on');});
    d.documentElement.style.overflow='hidden';
    d.documentElement.classList.add('lb-open');
    lb.querySelector('.lightbox-close').focus();
  }
  function close(){
    lb.classList.remove('on');lb.setAttribute('aria-hidden','true');
    d.documentElement.style.overflow='';
    d.documentElement.classList.remove('lb-open');
    setTimeout(function(){lb.classList.remove('open');},200);
    if(lastFocus)lastFocus.focus();
  }
  function next(){idx=(idx+1)%imgs.length;render();}
  function prev(){idx=(idx-1+imgs.length)%imgs.length;render();}
  imgs.forEach(function(el,i){el.addEventListener('click',function(){open(i);});});
  lb.querySelector('.lightbox-close').addEventListener('click',close);
  lb.querySelector('.lightbox-next').addEventListener('click',next);
  lb.querySelector('.lightbox-prev').addEventListener('click',prev);
  lb.addEventListener('click',function(e){if(e.target===lb)close();});
  d.addEventListener('keydown',function(e){
    if(!lb.classList.contains('open'))return;
    if(e.key==='Escape')close();
    else if(e.key==='ArrowRight')next();
    else if(e.key==='ArrowLeft')prev();
  });
  var touchX=null;
  lb.addEventListener('touchstart',function(e){touchX=e.touches[0].clientX;},{passive:true});
  lb.addEventListener('touchend',function(e){
    if(touchX===null)return;
    var dx=e.changedTouches[0].clientX-touchX;
    if(Math.abs(dx)>40){dx<0?next():prev();}
    touchX=null;
  },{passive:true});
})();
