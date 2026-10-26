/* Extracted inline script 2 from index.html; original load position preserved. */
(()=>{
 const welcome=document.getElementById('mahattatiWelcome');
 const start=document.getElementById('mahattatiWelcomeStart');
 const login=document.getElementById('mahattatiWelcomeLogin');
 const enter=()=>{welcome.hidden=true;document.body.style.overflow='';try{sessionStorage.setItem('mahattati_welcome_seen','1')}catch(e){}};
 // Start opens the existing app without changing its other behavior.
 start?.addEventListener('click',()=>{
   if(window.mahattatiOpenAuth){ window.mahattatiOpenAuth(); return; }
   start.disabled=true;
   const originalText=start.textContent;
   start.textContent='جارٍ فتح تسجيل الدخول…';
   let attempts=0;
   const waitForAuth=()=>{
     if(window.mahattatiOpenAuth){ start.disabled=false; start.textContent=originalText; window.mahattatiOpenAuth(); return; }
     attempts++;
     if(attempts<30){ setTimeout(waitForAuth,100); }
     else { start.disabled=false; start.textContent=originalText; alert('تعذّر تحميل نافذة تسجيل الدخول. حدّث الصفحة وتحقق من اتصال الإنترنت.'); }
   };
   waitForAuth();
 });

 // The welcome-screen 'تسجيل الدخول' link opens the actual email/password auth dialog.
 login?.addEventListener('click',()=>{
   if(window.mahattatiOpenAuth){ window.mahattatiOpenAuth(); return; }
   let attempts=0;
   const waitForAuth=()=>{
     if(window.mahattatiOpenAuth){ window.mahattatiOpenAuth(); return; }
     attempts++;
     if(attempts<30){ setTimeout(waitForAuth,100); }
     else { alert('تعذّر تحميل صفحة تسجيل الدخول. تحقق من اتصال الإنترنت ثم أعد المحاولة.'); }
   };
   waitForAuth();
 });
 document.body.style.overflow='hidden';
})();
