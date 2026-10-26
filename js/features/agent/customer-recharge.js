/* Extracted inline script 15 from index.html; original load position preserved. */
/* MAHATTATI: hide merchant/admin menu shortcuts on published version */
(function(){
  const selectors = '#menuMerchant, #menuMerchantAdmin, #menuDriverAdmin, .merchant-menu-button, .merchant-admin-button';
  function hideUnwantedMenuButtons(){
    document.querySelectorAll(selectors).forEach(function(el){
      if (!el.hidden) el.hidden = true;
      if (el.style.getPropertyValue('display') !== 'none' ||
          el.style.getPropertyPriority('display') !== 'important') {
        el.style.setProperty('display','none','important');
      }
      if (el.style.getPropertyValue('visibility') !== 'hidden' ||
          el.style.getPropertyPriority('visibility') !== 'important') {
        el.style.setProperty('visibility','hidden','important');
      }
      if (el.getAttribute('aria-hidden') !== 'true') {
        el.setAttribute('aria-hidden','true');
      }
    });
  }
  hideUnwantedMenuButtons();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', hideUnwantedMenuButtons, {once:true});
  }
  new MutationObserver(hideUnwantedMenuButtons).observe(document.documentElement, {
    subtree:true, childList:true, attributes:true, attributeFilter:['hidden','style','class']
  });
})();
