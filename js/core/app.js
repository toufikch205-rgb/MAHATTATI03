/* Extracted inline script 2 from index.html; original load position preserved. */
(()=>{
 const welcome=document.getElementById('mahattatiWelcome');
 const start=document.getElementById('mahattatiWelcomeStart');
 const login=document.getElementById('mahattatiWelcomeLogin');

 // A welcome screen should only cover the app until the user chooses to continue.
 const enter=()=>{
   if(welcome) {
     welcome.hidden=true;
     welcome.setAttribute('aria-hidden','true');
   }
   document.body.style.overflow='';
   try{sessionStorage.setItem('mahattati_welcome_seen','1')}catch(e){}
 };
 const showWelcome=()=>{
   if(welcome){
     welcome.hidden=false;
     welcome.removeAttribute('aria-hidden');
   }
   document.body.style.overflow='hidden';
 };
 try{
   if(sessionStorage.getItem('mahattati_welcome_seen')==='1') enter();
   else showWelcome();
 }catch(e){showWelcome();}

 const openAuthFromWelcome=(button)=>{
   // Hide the high-z-index welcome layer first, otherwise it can cover the auth dialog.
   enter();
   if(typeof window.mahattatiOpenAuth==='function'){
     window.mahattatiOpenAuth();
     return;
   }
   const originalText=button?.textContent||'';
   if(button){button.disabled=true;button.textContent='جارٍ فتح تسجيل الدخول…';}
   let attempts=0;
   const waitForAuth=()=>{
     if(typeof window.mahattatiOpenAuth==='function'){
       if(button){button.disabled=false;button.textContent=originalText;}
       window.mahattatiOpenAuth();
       return;
     }
     attempts++;
     if(attempts<40){setTimeout(waitForAuth,100);return;}
     if(button){button.disabled=false;button.textContent=originalText;}
     // If auth did not load, restore the welcome screen instead of leaving a blank page.
     showWelcome();
     alert('تعذّر تحميل نافذة تسجيل الدخول. حدّث الصفحة وتحقق من اتصال الإنترنت.');
   };
   waitForAuth();
 };

 start?.addEventListener('click',()=>openAuthFromWelcome(start));
 login?.addEventListener('click',()=>openAuthFromWelcome(login));
})();