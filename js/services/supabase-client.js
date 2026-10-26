(()=>{
 const page=document.getElementById('mddDriverSettings');if(!page)return;
 const get=(k,d)=>{try{return localStorage.getItem('mdd_setting_'+k)??d}catch(e){return d}};
 const set=(k,v)=>{try{localStorage.setItem('mdd_setting_'+k,String(v))}catch(e){}}
 const dashboard=document.getElementById('driverDashboardPage');
 let shortcut=document.getElementById('mddFloatingShortcut');
 if(!shortcut&&dashboard){
  shortcut=document.createElement('button');
  shortcut.id='mddFloatingShortcut';
  shortcut.type='button';
  shortcut.className='mdd-floating-shortcut';
  shortcut.textContent='☷';
  shortcut.setAttribute('aria-label','العودة إلى طلبات الركوب');
  shortcut.title='طلبات الركوب';
  shortcut.style.cssText='position:fixed;right:16px;bottom:calc(88px + env(safe-area-inset-bottom));z-index:2147483000;width:48px;height:48px;border:0;border-radius:16px;background:#20b96b;color:#fff;font-size:23px;font-weight:800;box-shadow:0 5px 18px #168b4b40;display:grid;place-items:center;cursor:pointer';
  dashboard.appendChild(shortcut);
  shortcut.addEventListener('click',()=>{
   const navButton=dashboard.querySelector('.mdd-nav button[data-tab="طلبات الركوب"]');
   if(navButton)navButton.click();
   else {const main=dashboard.querySelector('.mdd-main');if(main)main.scrollTop=0;}
  });
 }
 const applyShortcut=()=>{if(!shortcut)return;const enabled=get('shortcut','true')!=='false';shortcut.hidden=!enabled;shortcut.style.display=enabled?'grid':'none';shortcut.setAttribute('aria-hidden',String(!enabled));};
 const open=()=>{page.classList.add('open');page.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';page.querySelectorAll('[data-mds-toggle]').forEach(b=>b.setAttribute('aria-checked',get(b.dataset.mdsToggle,'true')));const sound=document.getElementById('mdsSoundIcon');if(sound)sound.value=get('soundIcon','bell');const map=get('maps','allow');page.querySelectorAll('[data-mds-map]').forEach(b=>b.classList.toggle('active',b.dataset.mdsMap===map));applyShortcut();};
 const close=()=>{page.classList.remove('open');page.setAttribute('aria-hidden','true');document.body.style.overflow='';};
 window.openMddDriverSettings=open;
 document.getElementById('mddSettings')?.addEventListener('click',open);
 document.getElementById('mdsBack')?.addEventListener('click',close);
 page.querySelectorAll('[data-mds-toggle]').forEach(b=>b.addEventListener('click',()=>{const v=b.getAttribute('aria-checked')!=='true';b.setAttribute('aria-checked',String(v));set(b.dataset.mdsToggle,v);if(b.dataset.mdsToggle==='shortcut')applyShortcut();if(b.dataset.mdsToggle==='sounds'&&get('soundIcon','bell')==='silent'&&v){const sound=document.getElementById('mdsSoundIcon');if(sound)sound.value='bell';set('soundIcon','bell');}}));
 document.getElementById('mdsSoundIcon')?.addEventListener('change',e=>{set('soundIcon',e.target.value);const b=page.querySelector('[data-mds-toggle="sounds"]');if(b){const enabled=e.target.value!=='silent';b.setAttribute('aria-checked',String(enabled));set('sounds',enabled);}});
 page.querySelectorAll('[data-mds-map]').forEach(b=>b.addEventListener('click',()=>{page.querySelectorAll('[data-mds-map]').forEach(x=>x.classList.toggle('active',x===b));set('maps',b.dataset.mdsMap);}));
 applyShortcut();
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&page.classList.contains('open'))close();});
})();