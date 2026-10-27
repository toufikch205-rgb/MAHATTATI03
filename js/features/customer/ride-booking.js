/* Extracted inline script 4 from index.html; original load position preserved. */
(()=>{
 const page=document.getElementById('mahattatiSafetyPage');if(!page)return;
 const close=()=>{page.classList.remove('open');page.setAttribute('aria-hidden','true');document.body.style.overflow='';};
 window.openMahattatiSafetyPage=()=>{document.getElementById('mahattatiAccountSettings')?.classList.remove('open');document.getElementById('menuBackdrop')?.classList.remove('open');document.getElementById('requestHistoryPage')?.classList.remove('open');page.classList.add('open');page.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';};
 document.getElementById('msfBack')?.addEventListener('click',close);
 document.getElementById('msfSupportAction')?.addEventListener('click',()=>alert('الدعم\nبيانات الاتصال الرسمية غير مضافة في هذه النسخة بعد. يرجى إضافة رقم الهاتف أو البريد الإلكتروني المعتمد قبل نشر التطبيق.'));
 document.getElementById('msfRatingsAction')?.addEventListener('click',()=>alert('التقييمات\nراجع تقييم السائق وتعليقات الركاب المتاحة قبل تأكيد الرحلة، وبعد انتهائها قدّم تقييمًا صادقًا يساعد على تحسين الخدمة.'));
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&page.classList.contains('open'))close();});
})();

/* === Ride request search timer and passenger acceptance verification ===
   Extracted from the legacy controller without changing the function bodies.
   These classic-script functions intentionally use shared globals initialized
   by legacy-main-controller.js later in the page. Keep this script before that
   controller; do not convert it to an ES module until shared state is migrated.
*/

function startRideSearchTimer(){
 if(rideSearchTimerId)clearInterval(rideSearchTimerId);
 rideSearchStartedAt=Date.now();
 const out=$('searchElapsed');
 const tick=()=>{const elapsed=Math.max(0,Math.floor((Date.now()-rideSearchStartedAt)/1000));if(out)out.textContent=Math.floor(elapsed/60)+':'+String(elapsed%60).padStart(2,'0');};
 tick();rideSearchTimerId=setInterval(tick,1000);
}

function stopRideSearchTimer(){if(rideSearchTimerId){clearInterval(rideSearchTimerId);rideSearchTimerId=null;}}

function stopPassengerAcceptancePolling(){
 if(passengerAcceptancePollTimer){clearInterval(passengerAcceptancePollTimer);passengerAcceptancePollTimer=null;}
 if(passengerAcceptanceChannel&&window.mahattatiSupabase){try{window.mahattatiSupabase.removeChannel(passengerAcceptanceChannel)}catch(e){}passengerAcceptanceChannel=null;}
 passengerAcceptancePollId=null;
}

async function checkPassengerRequestStatus(realtimeRow=null){
 const id=passengerAcceptancePollId,client=window.mahattatiSupabase;
 if(!id||!client||passengerAcceptanceCheckBusy||passengerAcceptedRequestId===id)return;
 passengerAcceptanceCheckBusy=true;
 try{
  // Use the realtime row immediately when it belongs to the request being watched.
  // This keeps the passenger screen responsive even if a follow-up SELECT is delayed by RLS/network.
  let data=null,error=null;
  if(realtimeRow&&String(realtimeRow.id)===String(id)){data=realtimeRow;}
  else{const result=await client.from('trip_requests').select('id,status,driver_id,accepted_at').eq('id',id).maybeSingle();data=result.data;error=result.error;}
  if(error)throw error;
  if(!data)return;
  const status=String(data.status||'').toLowerCase().trim().replace(/[ -]+/g,'_');
  // A driver_id alone is NOT proof that the driver accepted the trip.
  // Only show the accepted-trip screen after the database status explicitly confirms acceptance.
  const acceptedStatuses=['accepted','driver_accepted','accepted_by_driver','in_progress'];
  // The assigned driver is the authoritative signal; tolerate status variants used by the backend.
  const isActuallyAccepted=!!data.driver_id&&!!data.accepted_at&&acceptedStatuses.includes(status);
  if(isActuallyAccepted){
   passengerAcceptedRequestId=id;
   passengerTrackingTripId=id;
   stopPassengerAcceptancePolling();
   stopRideSearchTimer();
   const modal=$('requestSentModal');
   if(modal){modal.classList.remove('open');modal.setAttribute('aria-hidden','true');modal.style.setProperty('display','none','important');}
   passengerDriverAcceptedAt=Date.now();
   const panel=ensurePassengerTrackingPanel();
   // Hide all request/search overlays before showing the accepted-trip screen.
   ['requestSentModal','searchDriversModal','rideSearchModal','driverOffersModal','availableDriversModal'].forEach(id=>{const el=document.getElementById(id);if(el){el.classList.remove('open','active','show');el.setAttribute('aria-hidden','true');el.style.setProperty('display','none','important');}});
   document.querySelectorAll('.modal-backdrop,.menu-backdrop').forEach(el=>{if(el.id!=='mahattatiDriverTracking'){el.classList.remove('open','active','show');el.style.setProperty('display','none','important');}});
   panel.classList.add('open','active','show');
   panel.setAttribute('aria-hidden','false');
   panel.style.setProperty('display','block','important');
   panel.style.setProperty('position','fixed','important');
   panel.style.setProperty('inset','0','important');
   panel.style.setProperty('width','100vw','important');
   panel.style.setProperty('height','100dvh','important');
   panel.style.setProperty('overflow-y','auto','important');
   panel.style.setProperty('z-index','2147483000','important');
   panel.style.setProperty('background','#f7f9f6','important');
   panel.style.setProperty('opacity','1','important');
   panel.style.setProperty('visibility','visible','important');
   panel.style.pointerEvents='auto';
   document.body.style.overflow='hidden';
   const text=panel.querySelector('#mahattatiDriverTrackingText');
   if(text)text.textContent='تم قبول طلبك! جارٍ الاتصال بموقع السائق لحساب المسافة ووقت الوصول.';
   updatePassengerTrackingClock();
   if(passengerDriverLastLatLng)updatePassengerTrackingMetrics(passengerDriverLastLatLng.lat,passengerDriverLastLatLng.lng);
   if(!window.mahattatiTrackingClockTimer)window.mahattatiTrackingClockTimer=setInterval(updatePassengerTrackingClock,1000);
   const {data:{user}}=await client.auth.getUser();
   if(user)await refreshPassengerTracking(user);
   toast('قبل السائق طلبك، وهو قادم إليك الآن.');
  }else if(['cancelled','completed','rejected','expired'].includes(status)){
   stopPassengerAcceptancePolling();
   stopRideSearchTimer();
   const status=$('requestSearchStatus');
   if(status)status.textContent=data.status==='cancelled'?'تم إلغاء الطلب.':data.status==='expired'?'انتهت مهلة الطلب.':'تم إنهاء الطلب.';
  }
 }catch(e){console.warn('Passenger request status polling failed:',e.message||e);}finally{passengerAcceptanceCheckBusy=false;}
}

function startPassengerAcceptancePolling(id){
 stopPassengerAcceptancePolling();
 passengerAcceptancePollId=id;
 passengerAcceptedRequestId=null;
 // Listen for the exact request's database change so the accepted screen opens immediately;
 // polling remains as a fallback when realtime is delayed or unavailable.
 const client=window.mahattatiSupabase;
 if(client){
   try{
     passengerAcceptanceChannel=client.channel('mahattati-request-status-'+String(id))
       .on('postgres_changes',{event:'UPDATE',schema:'public',table:'trip_requests',filter:'id=eq.'+String(id)},payload=>{
         const row=payload.new||{};
         const status=String(row.status||'').toLowerCase().trim().replace(/[ -]+/g,'_');
         const acceptedStatuses=['accepted','driver_accepted','accepted_by_driver','in_progress','ongoing','confirmed'];
         if(String(row.id)===String(passengerAcceptancePollId)&&row.driver_id&&row.accepted_at&&acceptedStatuses.includes(status)){
           checkPassengerRequestStatus(row);
         }
       }).subscribe();
   }catch(e){console.warn('Request acceptance realtime unavailable:',e);}
 }
 checkPassengerRequestStatus();
 passengerAcceptancePollTimer=setInterval(()=>{if(!document.hidden)checkPassengerRequestStatus();},500);
 // Recheck when the customer returns to the tab/app after backgrounding it.
 if(!window.__mahattatiAcceptanceVisibilityBound){
   window.__mahattatiAcceptanceVisibilityBound=true;
   document.addEventListener('visibilitychange',()=>{if(!document.hidden&&passengerAcceptancePollId)checkPassengerRequestStatus();});
   window.addEventListener('focus',()=>{if(passengerAcceptancePollId)checkPassengerRequestStatus();});
 }
}
