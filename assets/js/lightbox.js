/* Click-to-lightbox viewer. Set data-target on the script tag to choose which images open it. */
(function(){
  var d=document;
  var cur=d.currentScript;
  var sel=(cur&&cur.getAttribute('data-target'))||'.gallery-pair .ph img, .gallery-grid3 .ph img, .gallery-grid .ph img';
  var imgs=[].slice.call(d.querySelectorAll(sel));
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
    lb.querySelector('.lightbox-close').focus();
  }
  function close(){
    lb.classList.remove('on');lb.setAttribute('aria-hidden','true');
    d.documentElement.style.overflow='';
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
