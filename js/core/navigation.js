/* Extracted inline script 8 from index.html; original load position preserved. */
(function(){
  function byId(id){return document.getElementById(id)}
  function openRequestPage(card){
    var page=byId('mddRideRequestPage');
    if(!page)return;
    if(card&&typeof window.mddPopulateRequest==='function'){
      try{window.mddPopulateRequest(card)}catch(e){console.error('Populate request details:',e)}
    }
    page.classList.add('open');
    page.setAttribute('aria-hidden','false');
    page.style.setProperty('display','block','important');
    page.style.setProperty('visibility','visible','important');
    page.style.setProperty('opacity','1','important');
    page.style.setProperty('z-index','9000','important');
    document.body.style.overflow='hidden';
    page.scrollTop=0;
    if(typeof window.mddPinNavAboveRequest==='function'){
      try{window.mddPinNavAboveRequest()}catch(e){console.error('Pin driver navigation:',e)}
    }
    if(typeof window.mddMountRealHomeMapInRequest==='function'){
      try{window.mddMountRealHomeMapInRequest()}catch(e){console.error('Mount request map:',e)}
    }
  }
  function closeRequestPage(){
    var page=byId('mddRideRequestPage');
    if(page){
      page.classList.remove('open');
      page.setAttribute('aria-hidden','true');
      page.style.setProperty('display','none','important');
      page.style.removeProperty('visibility');
      page.style.removeProperty('opacity');
      page.style.removeProperty('z-index');
    }
    document.body.style.overflow='';
    if(typeof window.mddRestoreRealHomeMap==='function'){
      try{window.mddRestoreRealHomeMap()}catch(e){console.error('Restore home map:',e)}
    }
    if(typeof window.mddShowTab==='function'){
      try{window.mddShowTab('طلبات الركوب')}
      catch(e){console.error('Restore driver requests tab:',e)}
    }else{
      var dash=byId('driverDashboardPage');
      if(dash)dash.querySelectorAll('.mdd-heading,#mddOnlineHint,.mdd-rides').forEach(function(el){el.hidden=false;el.style.removeProperty('display')});
      if(typeof window.mddRestorePinnedNav==='function'){try{window.mddRestorePinnedNav()}catch(e){}}
    }
  }
  document.addEventListener('click',function(e){
    var target=e.target;
    if(!target||typeof target.closest!=='function')return;
    var back=target.closest('#mddRequestBack');
    if(back){e.preventDefault();e.stopImmediatePropagation();closeRequestPage();return;}
    var view=target.closest('#driverDashboardPage .mdd-view');
    if(view){
      var card=view.closest('.mdd-ride');
      if(card){e.preventDefault();e.stopImmediatePropagation();openRequestPage(card);}
    }
  },true);
  document.addEventListener('keydown',function(e){
    var page=byId('mddRideRequestPage');
    if(e.key==='Escape'&&page&&page.classList.contains('open'))closeRequestPage();
  });
})();
