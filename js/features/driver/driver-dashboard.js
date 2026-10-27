/* MAHATTATI2 Phase 8.1: driver dashboard navigation and section visibility.
 * Extracted without changing tab behavior or ride-acceptance logic.
 * Depends on shared legacy helpers exposed on window.
 */
(function(){
 'use strict';
 const $=id=>document.getElementById(id);
 window.mddShowTab=function(tab){mddRestoreRealHomeMap();mddRestorePinnedNav();const wallet=$('mddWalletPage'),earnings=$('mddEarningsPage'),ratings=$('mddRatingsPage'),heading=document.querySelector('#driverDashboardPage .mdd-heading'),hint=$('mddOnlineHint'),rides=document.querySelector('#driverDashboardPage .mdd-rides'),nav=document.querySelector('#driverDashboardPage .mdd-nav'),requestPage=$('mddRideRequestPage'),isWallet=tab==='المحفظة',isEarnings=tab==='أرباحي',isRatings=tab==='تقييمات'||tab==='أيام',isRequest=tab==='طلبات الركوب'||tab==='الطلب';if(isWallet)window.mddRefreshDriverWalletBalance?.();[[wallet,isWallet,'mdd-wallet-open'],[earnings,isEarnings,'mdd-earnings-open'],[ratings,isRatings,'mdd-ratings-open']].forEach(([el,show,cls])=>{if(!el)return;el.hidden=!show;el.classList.toggle(cls,show);el.style.setProperty('display',show?'block':'none','important');el.setAttribute('aria-hidden',String(!show));});if(heading)heading.hidden=isWallet||isEarnings||isRatings;if(hint)hint.hidden=isWallet||isEarnings||isRatings;if(rides)rides.hidden=isWallet||isEarnings||isRatings;if(requestPage){requestPage.classList.remove('open');requestPage.setAttribute('aria-hidden','true');}if(nav){nav.hidden=false;nav.style.setProperty('display','grid','important');nav.setAttribute('aria-hidden','false');}document.querySelectorAll('#driverDashboardPage .mdd-nav button').forEach(x=>{const active=x.dataset.tab===tab;x.classList.toggle('active',active);x.setAttribute('aria-current',active?'page':'false')});};
 document.querySelectorAll('#driverDashboardPage .mdd-nav button').forEach(b=>{b.addEventListener('click',()=>window.mddShowTab(b.dataset.tab));});
 const walletNav=document.querySelector('#driverDashboardPage .mdd-nav button[data-tab="المحفظة"]');
 if(walletNav)walletNav.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();window.mddShowTab('المحفظة');});
})();
