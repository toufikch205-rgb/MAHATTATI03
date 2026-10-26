(()=>{
 'use strict';
 const SUPABASE_URL='https://smzximwtqwvvfwlbxpca.supabase.co';
 const SUPABASE_PUBLISHABLE_KEY='sb_publishable_dyr_bfOQQd1rFcF5l5a-Yg_TYj6uzBw';
 const overlay=document.getElementById('mahattatiAuthOverlay');
 if(!overlay)return;
 const $=id=>document.getElementById(id);
 let mode='login',busy=false;
 const client=window.supabase?.createClient?window.supabase.createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}}):null;
 window.mahattatiSupabase=client;
 const say=(msg,ok=false)=>{const el=$('mauthMessage');el.textContent=msg||'';el.classList.toggle('ok',!!ok)};
 function setMode(next){mode=next;const signup=mode==='signup';$('mahattatiAuthTitle').textContent=signup?'إنشاء حساب جديد':'مرحبًا بعودتك';$('mauthSubtitle').textContent=signup?'أنشئ حسابك لحفظ بياناتك وطلباتك في قاعدة البيانات.':'سجّل الدخول بالبريد الإلكتروني وكلمة المرور الصحيحة فقط، دون رمز تحقق.';$('mauthNameWrap').hidden=!signup;$('mauthName').required=signup;$('mauthPassword').autocomplete=signup?'new-password':'current-password';$('mauthSubmit').textContent=signup?'إنشاء الحساب':'تسجيل الدخول';$('mauthSwitch').textContent=signup?'لديك حساب بالفعل؟ تسجيل الدخول':'ليس لديك حساب؟ إنشاء حساب جديد';say('');}
 window.mahattatiOpenAuth=()=>{if(!client){alert('تعذّر تحميل خدمة تسجيل الدخول. تحقق من اتصال الإنترنت ثم أعد المحاولة.');return;}setMode('login');overlay.classList.add('open');overlay.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';setTimeout(()=>$('mauthEmail').focus(),50)};
 function closeAuth(){overlay.classList.remove('open');overlay.setAttribute('aria-hidden','true');document.body.style.overflow='';}
 $('mauthClose').addEventListener('click',closeAuth);overlay.addEventListener('click',e=>{if(e.target===overlay)closeAuth()});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&overlay.classList.contains('open'))closeAuth()});$('mauthSwitch').addEventListener('click',()=>setMode(mode==='login'?'signup':'login'));
 function setDisplayName(name,email=''){const chosen=(name||'').trim()||email.split('@')[0]||'مستخدم';try{localStorage.setItem('mahattati_profile_name',chosen)}catch(e){};['menuUsername','masProfileName'].forEach(id=>{const el=$(id);if(el)el.textContent=chosen;});}
 async function syncProfile(user,name){if(!client||!user)return;const displayName=(name||user.user_metadata?.full_name||user.email?.split('@')[0]||'مستخدم').trim();const {error}=await client.from('user_profiles').upsert({id:user.id,display_name:displayName,updated_at:new Date().toISOString()},{onConflict:'id'});if(error)console.warn('Profile sync failed:',error.message);setDisplayName(displayName,user.email||'');}
 function normalizeCloudRequest(row){const d=row.details||{};return {id:row.id,pickup:row.from_location||d.pickup||'',destination:row.to_location||d.destination||'',price:row.fare??d.price??0,passengers:d.passengers||1,comment:d.comment||'',departure:d.departure||'',status:row.status==='completed'?'مكتملة':row.status==='cancelled'?'ملغاة':row.status==='accepted'?'مقبولة':row.status==='in_progress'?'جارية':row.status==='pending'?'قيد الانتظار':'قيد الانتظار',createdAt:Date.parse(row.created_at)||Date.now(),mode:d.mode||'داخل المدينة',driverId:row.driver_id||null};}
 async function loadCloudRequests(user){if(!client||!user)return;const {data,error}=await client.from('trip_requests').select('id,from_location,to_location,status,fare,distance_km,details,created_at').eq('user_id',user.id).order('created_at',{ascending:false}).limit(200);if(error){console.warn('Trip history sync failed:',error.message);return;}const cloud=(data||[]).map(normalizeCloudRequest);let local=[];try{local=JSON.parse(localStorage.getItem('mahattati_requests')||'[]');if(!Array.isArray(local))local=[];}catch(e){}const byId=new Map();cloud.forEach(r=>byId.set(String(r.id),r));local.forEach(r=>{if(!byId.has(String(r.id)))byId.set(String(r.id),r)});const merged=[...byId.values()].sort((a,b)=>Number(b.createdAt||0)-Number(a.createdAt||0)).slice(0,200);try{localStorage.setItem('mahattati_requests',JSON.stringify(merged))}catch(e){}}
 window.mahattatiSaveTripRequest=async request=>{
   if(!client)throw new Error('قاعدة البيانات غير متاحة حالياً.');
   const {data:{user},error:userError}=await client.auth.getUser();
   if(userError)throw userError;
   if(!user)throw new Error('سجّل الدخول أولاً حتى يتم إرسال الطلب للسائقين.');
   const service=String(request.serviceType||'economy').toLowerCase();
   const allowed=['economy','comfort','premium','delivery'];
   const serviceType=allowed.includes(service)?service:'economy';
   const payload={
     user_id:user.id,
     from_location:String(request.pickup||'موقعي الحالي').slice(0,300),
     to_location:String(request.destination||'').slice(0,300),
     status:'pending',
     fare:Number(request.price)||null,
     distance_km:Number(request.distanceKm)||null,
     duration_minutes:Number(request.durationMinutes)||null,
     pickup_latitude:request.pickupLatitude!==null&&request.pickupLatitude!==undefined&&request.pickupLatitude!==''&&Number.isFinite(Number(request.pickupLatitude))?Number(request.pickupLatitude):null,
     pickup_longitude:request.pickupLongitude!==null&&request.pickupLongitude!==undefined&&request.pickupLongitude!==''&&Number.isFinite(Number(request.pickupLongitude))?Number(request.pickupLongitude):null,
     destination_latitude:request.destinationLatitude!==null&&request.destinationLatitude!==undefined&&request.destinationLatitude!==''&&Number.isFinite(Number(request.destinationLatitude))?Number(request.destinationLatitude):null,
     destination_longitude:request.destinationLongitude!==null&&request.destinationLongitude!==undefined&&request.destinationLongitude!==''&&Number.isFinite(Number(request.destinationLongitude))?Number(request.destinationLongitude):null,
     service_type:serviceType,
     expires_at:new Date(Date.now()+15*60*1000).toISOString(),
     details:{passengers:Number(request.passengers)||1,comment:String(request.comment||'').slice(0,300),departure:String(request.departure||'الآن'),mode:String(request.mode||'داخل المدينة'),serviceType}
   };
   if(!payload.to_location)throw new Error('حدّد وجهتك قبل إرسال الطلب.');
   const {data,error}=await client.from('trip_requests').insert(payload).select('id,created_at,status').single();
   if(error)throw error;
   return {id:data.id,createdAt:Date.parse(data.created_at)||Date.now(),status:data.status};
 };
 window.mahattatiLogout=async()=>{if(!client)return;try{const {error}=await client.auth.signOut();if(!error)return;console.warn('MAHATTATI remote sign-out failed; clearing local session:',error);}catch(error){console.warn('MAHATTATI remote sign-out unavailable; clearing local session:',error);}try{const {error:localError}=await client.auth.signOut({scope:'local'});if(localError)console.warn('MAHATTATI local sign-out warning:',localError);}catch(error){console.warn('MAHATTATI local sign-out warning:',error);}};
 let passengerTripChannel=null,passengerTrackingTimer=null,passengerTrackingTripId=null,passengerDriverMarker=null;
 window.passengerArrivalEtaAt=Number(window.passengerArrivalEtaAt)||0;
 let passengerDriverAcceptedAt=Date.now(),passengerDriverLastLatLng=null;
 function ensurePassengerTrackingPanel(){
   let panel=document.getElementById('mahattatiDriverTracking');
   if(panel)return panel;
   panel=document.createElement('section');panel.id='mahattatiDriverTracking';panel.dir='rtl';
   panel.style.cssText='display:none;position:fixed;inset:0;width:100%;height:100%;z-index:2147483000;background:#f7f9f6;color:#17211a;font-family:system-ui,-apple-system,sans-serif;overflow-y:auto;overflow-x:hidden;overscroll-behavior:contain;padding:calc(6px + env(safe-area-inset-top)) 12px calc(8px + env(safe-area-inset-bottom));box-sizing:border-box;isolation:isolate;opacity:1;visibility:visible;transform:none;filter:none;backdrop-filter:none;-webkit-backdrop-filter:none';
   panel.innerHTML='<header style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin:0 0 8px"><button id="mahattatiTrackingClose" type="button" aria-label="إغلاق" style="width:36px;height:36px;flex:0 0 36px;border:0;border-radius:50%;background:white;font-size:23px;color:#26332a">×</button><div style="text-align:right"><small style="color:#159653;font-weight:800;letter-spacing:1px">MAHATTATI</small><h1 style="font-size:clamp(19px,5vw,23px);line-height:1.2;margin:2px 0 0">السائق قادم إليك</h1></div><span style="font-size:24px">🚗</span></header><div style="border-radius:22px;background:#fff;padding:14px 13px;box-shadow:0 8px 28px #15251a0c;border:1px solid #e7eee8;text-align:center"><div style="width:52px;height:52px;margin:0 auto 7px;border-radius:50%;background:#e8fff0;color:#08c96a;display:grid;place-items:center;font-size:29px">✓</div><div style="font-size:20px;font-weight:800;margin-bottom:7px">تم قبول طلبك بنجاح</div><div id="mahattatiDriverTrackingText" style="font-size:14px;line-height:1.7;color:#69746c">السائق قبل طلبك وهو في طريقه إليك. ستظهر المسافة والمدة المتبقية هنا عند توفر موقعه.</div><div style="display:flex;gap:8px;margin-top:12px"><div style="flex:1;background:#f5f7f1;border-radius:15px;padding:10px 6px"><div style="font-size:11px;color:#778078">الوقت المتبقي للوصول</div><strong id="mahattatiTrackingElapsed" style="font-size:clamp(19px,5vw,23px);display:block;margin-top:3px">جارٍ التقدير…</strong></div><div style="flex:1;background:#eafff1;border-radius:18px;padding:16px 8px"><div style="font-size:13px;color:#47835c">المسافة المتبقية</div><strong id="mahattatiTrackingDistance" style="font-size:25px;display:block;margin-top:5px">— كم</strong></div></div><div style="margin-top:8px;border-radius:16px;background:#fff;border:1px solid #e7eee8;padding:10px 11px;display:flex;align-items:center;gap:13px"><div style="font-size:22px">⏱️</div><div style="text-align:right;flex:1"><div style="font-size:11px;color:#7a857d">الوقت المتوقع لوصول السائق</div><strong id="mahattatiTrackingEta" style="font-size:17px">بانتظار موقع السائق</strong></div><span style="color:#09c96a;font-size:24px">●</span></div><div style="margin-top:8px;border-radius:16px;background:#eaf4e9;padding:11px 12px;text-align:right"><strong style="font-size:14px">📍 تابع اقتراب السائق</strong><p style="font-size:12px;line-height:1.55;color:#536357;margin:4px 0 0">يتم تحديث موقع السائق تلقائيًا عند مشاركة موقعه. أبقِ التطبيق مفتوحًا للحصول على أحدث المعلومات.</p></div><button id="mahattatiTrackingBack" type="button" style="width:100%;margin-top:10px;border:0;border-radius:15px;background:#00e96b;color:#073b20;font-weight:800;font-size:16px;padding:12px">حسنًا، متابعة الرحلة</button>';
   document.body.appendChild(panel);
   const close=()=>{panel.style.display='none';document.body.style.overflow='';};
   panel.querySelector('#mahattatiTrackingClose').onclick=close;panel.querySelector('#mahattatiTrackingBack').onclick=close;
   return panel;
 }
 function updatePassengerTrackingClock(){
   const panel=document.getElementById('mahattatiDriverTracking');if(!panel)return;
   const el=panel.querySelector('#mahattatiTrackingElapsed');if(!el)return;
   if(!window.passengerArrivalEtaAt){el.textContent='بانتظار موقع السائق';return;}
   const remaining=Math.max(0,Math.ceil((window.passengerArrivalEtaAt-Date.now())/1000));
   if(remaining===0){el.textContent='السائق وصل تقريبًا';return;}
   el.textContent=String(Math.floor(remaining/60)).padStart(2,'0')+':'+String(remaining%60).padStart(2,'0');
 }
 function updatePassengerTrackingMetrics(lat,lng){
   const panel=ensurePassengerTrackingPanel();let pickup=null;
   try{pickup=window.pickupMarker?.getLatLng?.()||window.userLatLng||null;}catch(e){}
   if(!pickup&&window.map&&window.L){try{pickup=window.map.getCenter();}catch(e){}}
   if(pickup&&Number.isFinite(Number(pickup.lat))&&Number.isFinite(Number(pickup.lng))){
     const R=6371,rad=x=>x*Math.PI/180,dLat=(Number(pickup.lat)-lat)*Math.PI/180,dLng=(Number(pickup.lng)-lng)*Math.PI/180;
     const a=Math.sin(dLat/2)**2+Math.cos(rad(lat))*Math.cos(rad(Number(pickup.lat)))*Math.sin(dLng/2)**2;
     const km=2*R*Math.asin(Math.sqrt(Math.min(1,a)));
     const d=panel.querySelector('#mahattatiTrackingDistance'),eta=panel.querySelector('#mahattatiTrackingEta');
     if(d)d.textContent=km<1?Math.round(km*1000)+' م':km.toFixed(1)+' كم';
     // Estimate an arrival countdown once, then let it tick down instead of showing time since acceptance.
     if(!window.passengerArrivalEtaAt){
       const minutes=km<0.2?1:Math.max(2,Math.round(km/0.4));
       window.passengerArrivalEtaAt=Date.now()+minutes*60*1000;
     }
     if(eta)eta.textContent=km<0.2?'السائق قريب جدًا منك':'الوقت المتبقي يتحدّث مع تحديث موقع السائق';
   }
 }
 function clearPassengerTracking(){
   if(passengerTrackingTimer){clearInterval(passengerTrackingTimer);passengerTrackingTimer=null;}
   passengerTrackingTripId=null; window.passengerArrivalEtaAt=0;
   if(passengerDriverMarker&&window.map){try{window.map.removeLayer(passengerDriverMarker)}catch(e){}}
   passengerDriverMarker=null;
   const panel=document.getElementById('mahattatiDriverTracking');if(panel)panel.style.display='none';
 }
 window.clearPassengerTracking=clearPassengerTracking;
 async function updatePassengerDriverLocation(){
   if(!passengerTrackingTripId||!client)return;
   const panel=ensurePassengerTrackingPanel();panel.style.display='block';
   try{
     const {data,error}=await client.rpc('get_my_trip_driver_location',{p_request_id:passengerTrackingTripId});
     if(error)throw error;
     if(!data){panel.querySelector('#mahattatiDriverTrackingText').textContent='لا توجد رحلة نشطة لمتابعتها.';return;}
     const text=panel.querySelector('#mahattatiDriverTrackingText');
     if(data.latitude==null||data.longitude==null){window.passengerArrivalEtaAt=0;const elapsed=panel.querySelector('#mahattatiTrackingElapsed'),distance=panel.querySelector('#mahattatiTrackingDistance'),eta=panel.querySelector('#mahattatiTrackingEta');if(elapsed)elapsed.textContent='بانتظار موقع السائق';if(distance)distance.textContent='— كم';if(eta)eta.textContent='يظهر الوقت والمسافة عند مشاركة السائق لموقعه';text.textContent='تم قبول طلبك، والسائق قادم إليك. ننتظر أن يشارك موقعه حتى نعرض المسافة والوقت بشكل صحيح.';return;}
     const lat=Number(data.latitude),lng=Number(data.longitude);
     if(!Number.isFinite(lat)||!Number.isFinite(lng))return;
     text.textContent=(data.driver_name?'السائق '+data.driver_name+' قبل طلبك وهو قادم إليك. ':'السائق قبل طلبك وهو قادم إليك. ')+'يتم تحديث موقعه تلقائيًا.';
     passengerDriverLastLatLng={lat,lng};updatePassengerTrackingMetrics(lat,lng);updatePassengerTrackingClock();
     if(window.map&&window.L){
       if(!passengerDriverMarker){passengerDriverMarker=window.L.circleMarker([lat,lng],{radius:9,color:'#17833b',weight:3,fillColor:'#00ff66',fillOpacity:.95}).addTo(window.map);passengerDriverMarker.bindPopup('السائق في الطريق إليك');}
       else passengerDriverMarker.setLatLng([lat,lng]);
     }
   }catch(e){console.warn('Driver tracking unavailable:',e.message||e);const text=panel.querySelector('#mahattatiDriverTrackingText');if(text)text.textContent='تعذّرت قراءة موقع السائق مؤقتًا.';}
 }
 async function refreshPassengerTracking(user){
   if(!user)return;
   try{
     let data=null,error=null;
     // Prefer the exact request already accepted by the realtime/polling handler.
     const targetId=passengerTrackingTripId||passengerAcceptedRequestId||passengerAcceptancePollId;
     if(targetId){
       const result=await client.from('trip_requests').select('id,status,driver_id,accepted_at').eq('id',targetId).eq('user_id',user.id).maybeSingle();
       data=result.data;error=result.error;
     }else{
       const result=await client.from('trip_requests').select('id,status,driver_id,accepted_at').eq('user_id',user.id).not('driver_id','is',null).not('accepted_at','is',null).in('status',['accepted','in_progress','driver_accepted','accepted_by_driver']).order('created_at',{ascending:false}).limit(1).maybeSingle();
       data=result.data;error=result.error;
     }
     if(error)throw error;
     // Never restore the accepted-trip screen for a pending request or a row without an assigned driver.
     // The database must confirm BOTH a real driver assignment and an accepted/active status.
     const confirmedStatus=String(data?.status||'').toLowerCase().trim().replace(/[ -]+/g,'_');
     const confirmedAccepted=!!data?.driver_id&&!!data?.accepted_at&&['accepted','driver_accepted','accepted_by_driver','in_progress'].includes(confirmedStatus);
     if(!confirmedAccepted){
       if(typeof window.clearPassengerTracking==='function')window.clearPassengerTracking();
       passengerAcceptedRequestId=null;
       const stalePanel=document.getElementById('mahattatiDriverTracking');
       if(stalePanel){stalePanel.classList.remove('open','active','show');stalePanel.setAttribute('aria-hidden','true');stalePanel.style.setProperty('display','none','important');stalePanel.style.setProperty('visibility','hidden','important');}
       return;
     }
     const panel=ensurePassengerTrackingPanel();
     // Always restore the accepted-trip screen when an active accepted ride is found,
     // including after the browser resumes from background or the customer returns to the app.
     panel.style.setProperty('display','block','important');
     panel.style.setProperty('visibility','visible','important');
     panel.style.setProperty('opacity','1','important');
     panel.style.setProperty('z-index','2147483000','important');
     document.body.style.overflow='hidden';
     if(passengerTrackingTripId!==data.id){
       passengerTrackingTripId=data.id;window.passengerArrivalEtaAt=0;
       panel.querySelector('#mahattatiDriverTrackingText').textContent='تم قبول طلبك. جارٍ الاتصال بموقع السائق…';
     }
     await updatePassengerDriverLocation();
     if(!passengerTrackingTimer)passengerTrackingTimer=setInterval(updatePassengerDriverLocation,12000);
     if(!window.mahattatiArrivalCountdownTimer)window.mahattatiArrivalCountdownTimer=setInterval(updatePassengerTrackingClock,1000);
   }catch(e){console.warn('Passenger tracking lookup failed:',e.message||e);}
 }
 async function startPassengerRealtime(user){
   if(!client||!user)return;
   if(passengerTripChannel){try{await client.removeChannel(passengerTripChannel)}catch(e){}passengerTripChannel=null;}
   await refreshPassengerTracking(user);
   // Re-check cloud status when the app is reopened/resumed; mobile browsers may suspend realtime.
   if(!window.__mahattatiPassengerResumeBound){
     window.__mahattatiPassengerResumeBound=true;
     const resumePassengerTrip=async()=>{
       if(document.hidden)return;
       try{const {data:{user:activeUser}}=await client.auth.getUser();if(activeUser)await refreshPassengerTracking(activeUser);}catch(e){console.warn('Passenger resume sync failed:',e.message||e);}
     };
     document.addEventListener('visibilitychange',resumePassengerTrip);
     window.addEventListener('focus',resumePassengerTrip);
     window.addEventListener('pageshow',resumePassengerTrip);
     setInterval(resumePassengerTrip,7000);
   }
   passengerTripChannel=client.channel('mahattati-passenger-'+user.id)
     .on('postgres_changes',{event:'*',schema:'public',table:'trip_requests',filter:'user_id=eq.'+user.id},async payload=>{
       try{
         const row=payload.new||{};
         const status=String(row.status||'').toLowerCase().trim();
         const accepted=!!row.driver_id&&!!row.accepted_at&&['accepted','driver_accepted','accepted_by_driver','in_progress'].includes(status);
         const labels={pending:'قيد الانتظار',accepted:'قبل السائق طلبك',in_progress:'الرحلة جارية',completed:'اكتملت الرحلة',cancelled:'تم إلغاء الطلب'};
         const label=labels[status]||'تم تحديث حالة الطلب';
         await loadCloudRequests(user);
         if(accepted){
           // لا تعرض صفحة قبول السائق إلا عندما تؤكد قاعدة البيانات حالة القبول ووجود driver_id فعلي.
           // in_progress وحدها لا تكفي لإظهار شاشة القبول.
           stopPassengerAcceptancePolling();
           stopRideSearchTimer();
           const tracking=ensurePassengerTrackingPanel();
           ['requestSentModal','searchDriversModal','rideSearchModal','driverOffersModal','availableDriversModal'].forEach(id=>{const el=document.getElementById(id);if(el){el.classList.remove('open','active','show');el.setAttribute('aria-hidden','true');el.style.setProperty('display','none','important');}});
           document.querySelectorAll('.modal-backdrop,.menu-backdrop').forEach(el=>{if(el.id!=='mahattatiDriverTracking'){el.classList.remove('open','active','show');el.style.setProperty('display','none','important');}});
           tracking.style.setProperty('display','block','important');
           tracking.style.setProperty('position','fixed','important');
           tracking.style.setProperty('inset','0','important');
           tracking.style.setProperty('z-index','2147483000','important');
           tracking.style.setProperty('visibility','visible','important');
           tracking.style.setProperty('opacity','1','important');
           document.body.style.overflow='hidden';
           const message=tracking.querySelector('#mahattatiDriverTrackingText');
           if(message)message.textContent='تم قبول طلبك بنجاح! السائق قادم إليك.';
           passengerTrackingTripId=row.id||passengerTrackingTripId;
           await refreshPassengerTracking(user);
         }else if(['cancelled','completed','rejected','expired'].includes(status)){
           try{if(typeof window.showRequestHistory==='function')window.showRequestHistory();}catch(e){}
           try{if(typeof window.toast==='function')window.toast(label);}catch(e){}
         }
       }catch(e){console.warn('Passenger realtime update failed:',e);}
     }).subscribe();
 }
 async function enterAuthenticated(user,name,options={}){
   try{setDisplayName(name||user?.user_metadata?.full_name||'',user?.email||'');if(user){try{await syncProfile(user,name)}catch(err){console.warn('Profile sync failed:',err)}try{await loadCloudRequests(user)}catch(err){console.warn('Trip history sync failed:',err)}try{startPassengerRealtime(user)}catch(err){console.warn('Realtime setup failed:',err)}}}
   finally{
     closeAuth();
     /* Restoring an existing Supabase session is not a user action: keep the welcome screen visible. */
     if(!options.keepWelcomeVisible){const welcome=$('mahattatiWelcome');if(welcome){welcome.hidden=true;document.body.style.overflow='';try{sessionStorage.setItem('mahattati_welcome_seen','1')}catch(e){}}}
   }
 }
 $('mahattatiAuthForm').addEventListener('submit',async e=>{
   e.preventDefault();
   if(busy)return;
   if(!client){say('خدمة تسجيل الدخول غير متاحة حاليًا. تحقق من اتصال الإنترنت ثم أعد تحميل الصفحة.');return;}
   const email=$('mauthEmail').value.trim().toLowerCase(),password=$('mauthPassword').value,name=$('mauthName').value.trim();
   if(!email||!password){say('أدخل البريد الإلكتروني وكلمة المرور.');return;}
   if(mode==='signup'&&!name){say('أدخل اسمك للمتابعة.');$('mauthName').focus();return;}
   busy=true;$('mauthSubmit').disabled=true;$('mauthSwitch').disabled=true;
   say(mode==='signup'?'جارٍ إنشاء الحساب…':'جارٍ تسجيل الدخول…');
   try{
     if(mode==='signup'){
       const {data,error}=await client.auth.signUp({email,password,options:{data:{full_name:name}}});
       if(error)throw error;
       if(data?.session?.user){await enterAuthenticated(data.session.user,name);return;}
       if(data?.user){
         // No session means Supabase requires email confirmation; do not pretend the user is authenticated.
         say('تم إنشاء الحساب، لكن إعدادات Supabase تتطلب تأكيد البريد الإلكتروني قبل تسجيل الدخول. بعد التأكيد يمكنك الدخول بالبريد وكلمة المرور فقط، دون رمز في كل مرة.');
         return;
       }
       throw new Error('لم يتم إنشاء الحساب. تحقق من البيانات وحاول مجددًا.');
     }
     const {data,error}=await client.auth.signInWithPassword({email,password});
     if(error)throw error;
     if(!data?.user)throw new Error('لم يتم العثور على حساب صالح.');
     await enterAuthenticated(data.user);
   }catch(err){
     const raw=String(err?.message||'');const lower=raw.toLowerCase();let friendly='تعذّر إكمال العملية. تحقق من اتصال الإنترنت وحاول مجددًا.';
     if(lower.includes('invalid login credentials')||lower.includes('invalid_credentials')||lower.includes('email or password'))friendly='البريد الإلكتروني أو كلمة المرور غير صحيحة. تحقق من المعلومات وحاول مجددًا.';
     else if(lower.includes('email not confirmed'))friendly='يجب تأكيد البريد الإلكتروني من الرسالة التي وصلتك قبل تسجيل الدخول.';
     else if(lower.includes('user already registered')||lower.includes('already registered'))friendly='هذا البريد الإلكتروني مسجّل من قبل. اختر تسجيل الدخول بدل إنشاء حساب جديد.';
     else if(lower.includes('password')&&(lower.includes('least')||lower.includes('short')||lower.includes('weak')))friendly='كلمة المرور ضعيفة أو قصيرة. استعمل 6 أحرف على الأقل.';
     else if(lower.includes('failed to fetch')||lower.includes('network')||lower.includes('load failed'))friendly='تعذّر الاتصال بخدمة تسجيل الدخول. تحقق من الإنترنت وأعد المحاولة.';
     else if(raw)friendly=raw;
     say(friendly);
   }finally{busy=false;$('mauthSubmit').disabled=false;$('mauthSwitch').disabled=false;}
 });
 if(client){client.auth.getSession().then(async({data,error})=>{if(error)console.warn(error.message);if(data?.session?.user){const u=data.session.user;await enterAuthenticated(u,undefined,{keepWelcomeVisible:true});}});client.auth.onAuthStateChange((event,session)=>{if(event==='SIGNED_OUT'){if(passengerTripChannel){client.removeChannel(passengerTripChannel);passengerTripChannel=null;}if(typeof window.clearPassengerTracking==='function')window.clearPassengerTracking();/* Keep local display name; cloud access is revoked by the session. */}else if(event==='SIGNED_IN'&&session?.user){setTimeout(()=>enterAuthenticated(session.user,undefined,{keepWelcomeVisible:true}),0);}});}
})();