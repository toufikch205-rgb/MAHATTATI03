/* Extracted inline script 13 from index.html; original load position preserved. */
(function(){
 function setup(){
  const box=document.querySelector('#mddRideRequestPage .mdd-request-offer');
  const input=document.getElementById('mddRequestOfferPrice');
  if(!box||!input||document.getElementById('mddRequestQuickPrices'))return;
  const quick=document.createElement('div');quick.id='mddRequestQuickPrices';quick.setAttribute('aria-label','اقتراحات سريعة للسعر');
  const priceEl=document.getElementById('mddRequestPrice');
  const base=parseInt((priceEl?.textContent||'150').replace(/[^0-9]/g,''),10)||150;
  [1.05,1.1,1.15].forEach(function(mult){const amount=Math.ceil(base*mult/10)*10;const b=document.createElement('button');b.type='button';b.textContent=amount+' دج';b.addEventListener('click',function(){input.value=amount;input.dispatchEvent(new Event('input',{bubbles:true}));input.focus();});quick.appendChild(b);});
  const title=box.querySelector('.mdd-request-offer-title');if(title)title.insertAdjacentElement('afterend',quick);else box.prepend(quick);
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup);else setup();
 const observer=new MutationObserver(setup);observer.observe(document.documentElement,{childList:true,subtree:true});
})();
