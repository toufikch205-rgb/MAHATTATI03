/* Extracted inline script 3 from index.html; original load position preserved. */
const $=id=>document.getElementById(id);let lang='ar',mode='car',selecting='pickup',userMarker=null,pickupMarker=null,destMarker=null,accuracyCircle=null,userLatLng=null;
const words={ar:{mapLabel:'من أين',mapDefault:'موقعك الحالي',car:'داخل المدينة',intercity:'بين الولايات',destination:'ما وجهتك وكم التكلفة؟',pickup:'نقطة الانطلاق',pickupPh:'موقعي الحالي',dest:'الوجهة',destPh:'إلى أين تريد الذهاب؟',continue:'متابعة الطلب　↗',mapNote:'موقعك على الخريطة',locating:'جارٍ تحديد موقعك…',located:'تم تحديد موقعك',noLocation:'تعذر تحديد الموقع — تحقق من الإذن',pickPrompt:'اضغط على الخريطة لتحديد نقطة الانطلاق',destPrompt:'اضغط على الخريطة لتحديد الوجهة',needDest:'أدخل الوجهة أو اخترها من الخريطة أولًا.',picked:'تم تحديد نقطة الانطلاق على الخريطة.',destSet:'تم تحديد الوجهة على الخريطة.',demo:'هذه واجهة تجريبية؛ ربط السائقين والطلبات يأتي في المرحلة التالية.',menuDemo:'القائمة والإشعارات ستُضاف في المرحلة التالية.',promoTitle:'سائقونا وسياراتنا موثوقون',promoText:'جميع السائقين والسيارات يتم التحقق منهم',promoMore:'اعرف أكثر',currentLocationOption:'اختيار الموقع الحالي',choosePickupOption:'اختيار نقطة انطلاق',language:'FR'},fr:{mapLabel:'Départ',mapDefault:'Votre position actuelle',car:'Course à prix juste',intercity:'Inter-wilayas',destination:'Où allez-vous et à quel prix ?',pickup:'Point de départ',pickupPh:'Ma position actuelle',dest:'Destination',destPh:'Où souhaitez-vous aller ?',continue:'Continuer　↗',mapNote:'Votre position sur la carte',locating:'Localisation en cours…',located:'Position détectée',noLocation:'Position indisponible — vérifiez l’autorisation',pickPrompt:'Touchez la carte pour choisir le départ',destPrompt:'Touchez la carte pour choisir la destination',needDest:'Saisissez une destination ou choisissez-la sur la carte.',picked:'Point de départ sélectionné.',destSet:'Destination sélectionnée.',demo:'Version de démonstration : la connexion aux chauffeurs viendra ensuite.',menuDemo:'Le menu et les notifications seront ajoutés ensuite.',promoTitle:'Des chauffeurs et véhicules vérifiés',promoText:'Les chauffeurs et les véhicules sont vérifiés',promoMore:'En savoir plus',currentLocationOption:'Choisir ma position actuelle',choosePickupOption:'Choisir un point de départ',language:'ع'}};
function say(k){return words[lang][k]||k}function toast(t){const el=$('toast');clearTimeout(window.tt);if(!t||!String(t).trim()){el.textContent='';el.classList.remove('show');return;}el.textContent=String(t);el.classList.add('show');window.tt=setTimeout(()=>{el.classList.remove('show');el.textContent='';},2800)}
function applyLang(){const w=words[lang];document.documentElement.lang=lang;document.documentElement.dir=lang==='ar'?'rtl':'ltr';$('mapLabel').textContent=w.mapLabel;$('currentLocationText').textContent=w.currentLocationOption;$('choosePickupText').textContent=w.choosePickupOption;$('carTitle').textContent=w.car;$('intercityTitle').textContent=w.intercity;$('destinationPrompt').textContent=w.destination;$('pickupLabel').textContent=w.pickup;$('destLabel').textContent=w.dest;$('pickupInput').placeholder=w.pickupPh;$('destInput').placeholder=w.destPh;if($('continueBtn'))$('continueBtn').textContent=w.continue;$('mapNote').textContent=w.mapNote;$('promoTitle').textContent=w.promoTitle;$('promoText').textContent=w.promoText;$('promoMore').textContent=w.promoMore;if(!userLatLng)$('mapAddress').textContent=w.mapDefault;}
const map=L.map('map',{zoomControl:false,scrollWheelZoom:true}).setView([35.6971,-0.6308],15);window.map=map;
const osmAttribution='© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap contributors</a>';
let baseTiles=L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:osmAttribution, crossOrigin:true, updateWhenIdle:false, keepBuffer:2}).addTo(map);
// If OSM's public tile endpoint is unreachable on a particular network, keep the map usable via a compatible fallback.
let mainTileErrors=0, mainFallbackUsed=false;
baseTiles.on('tileload',()=>{mainTileErrors=0;const n=document.getElementById('mainMapTileNotice');if(n)n.remove();});
baseTiles.on('tileerror',()=>{mainTileErrors++;if(mainTileErrors>=3&&!mainFallbackUsed){mainFallbackUsed=true;map.removeLayer(baseTiles);baseTiles=L.tileLayer('https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',{maxZoom:20,attribution:osmAttribution+' | © CARTO',crossOrigin:true}).addTo(map);baseTiles.on('tileerror',()=>{if(!document.getElementById('mainMapTileNotice')){const n=document.createElement('div');n.id='mainMapTileNotice';n.textContent='تعذر تحميل الخريطة. تأكد من الإنترنت ثم أعد فتح الصفحة.';n.style.cssText='position:absolute;z-index:1000;top:120px;left:12px;right:12px;background:#fff;color:#333;padding:10px;border-radius:12px;font:13px system-ui;box-shadow:0 2px 10px #0002';document.querySelector('.map-wrap')?.appendChild(n);}});}});
let routeLine=null, routeOutline=null, routeRequestId=0;
/* updateRouteSummary moved to js/features/maps/map-controller.js; loaded before this file. */
/* drawSelectedRoute moved to js/features/maps/map-controller.js; loaded before this file. */

let tileErrorShown=false;baseTiles.on('tileerror',()=>{if(!tileErrorShown){tileErrorShown=true;const msg=lang==='ar'?'تعذر تحميل بعض أجزاء الخريطة. تحقق من الإنترنت ثم أعد فتح الصفحة.':'Certaines tuiles de la carte n’ont pas chargé. Vérifiez Internet puis réessayez.';$('mapNote').textContent=msg;$('mapNote').classList.add('visible');}});baseTiles.on('tileload',()=>{tileErrorShown=false;});
function divIcon(html,size=[40,40],anchor=[20,20]){return L.divIcon({className:'',html,iconSize:size,iconAnchor:anchor})}

/* mahattatiSearchPlaces moved to js/features/maps/map-controller.js; loaded before this file. */
/* reverseGeocode moved to js/features/maps/map-controller.js; loaded before this file. */
function setPickupLabel(address){
  $('pickupInput').value=address;
  $('modalPickupInput').value=address;
  $('mapAddress').textContent=address;
}
function setDestinationLabel(address){
  $('destInput').value=address;
  $('modalDestInput').value=address;
}
/* setUser moved to js/features/maps/map-controller.js; loaded before this file. */
let locationRequestId=0;
// Request phone location automatically on first app entry, after the map and page load.
(function autoLocateOnEntry(){
  let requested=false;
  const run=()=>{
    if(requested)return;
    requested=true;
    setTimeout(()=>{
      try {
        if(typeof locate==='function' && typeof map!=='undefined' && !userLatLng && !pickupMarker) locate();
      } catch(error) { console.warn('[MAHATTATI] Automatic location request could not start:',error); }
    },180);
  };
  if(document.readyState==='complete') run();
  else window.addEventListener('load',run,{once:true});
})();
/* locate moved to js/features/maps/map-controller.js; loaded before this file. */
let mapSelectionRequestId=0;
/* setSelectMode moved to js/features/maps/map-controller.js; loaded before this file. */
map.on('click',async e=>{
  // Map taps never silently overwrite entered addresses. The user must explicitly
  // activate "choose pickup on map" or "choose destination on map" first.
  if(selecting!=='pickup' && selecting!=='dest') return;
  // Manual selection cancels any in-flight GPS result so it cannot overwrite the user's choice.
  ++locationRequestId;
  const selectionRequestId=++mapSelectionRequestId;
  const ll=e.latlng, isPickup=selecting==='pickup';
  // Disarm immediately, before reverse geocoding starts, so rapid taps cannot
  // replace the endpoint again while the address lookup is still pending.
  selecting=null;
  if(isPickup && accuracyCircle){map.removeLayer(accuracyCircle);accuracyCircle=null;}
  const icon=divIcon(`<div class="custom-pin ${isPickup?'green':'red'}"></div><span class="route-point-letter ${isPickup?'route-point-a':'route-point-b'}">${isPickup?'A':'B'}</span>`,[38,40],[19,25]);
  if(isPickup){
    if(pickupMarker && pickupMarker!==userMarker) map.removeLayer(pickupMarker);
    pickupMarker=L.marker(ll,{icon,zIndexOffset:1100,title:say('pickup')}).addTo(map);
    const address=await reverseGeocode(ll); if(selectionRequestId!==mapSelectionRequestId)return; setPickupLabel(address); toast(say('picked')); drawSelectedRoute();
  } else {
    if(destMarker) map.removeLayer(destMarker);
    destMarker=L.marker(ll,{icon,zIndexOffset:1100,title:say('dest')}).addTo(map);
    const address=await reverseGeocode(ll); if(selectionRequestId!==mapSelectionRequestId)return; setDestinationLabel(address); toast(say('destSet')); drawSelectedRoute();
  }
  // Stop map-pick mode after one intentional selection. The next tap must not
  // silently replace the other endpoint; the user chooses A or B explicitly.
  selecting=null;
  $('mapNote').textContent=lang==='ar'
    ? (isPickup?'تم تحديث نقطة الانطلاق A. لتغيير الوجهة B استخدم حقل الوجهة أو فعّل اختيار الوجهة على الخريطة.':'تم تحديث نقطة الوصول B. لتغيير الانطلاق A استخدم حقل الانطلاق أو فعّل اختيار الانطلاق على الخريطة.')
    : (isPickup?'Départ A mis à jour. Pour changer l’arrivée B, utilisez son champ ou activez sa sélection sur la carte.':'Arrivée B mise à jour. Pour changer le départ A, utilisez son champ ou activez sa sélection sur la carte.');
  $('mapNote').classList.add('visible');
});
$('locateBtn').onclick=locate;$('zoomIn').onclick=()=>map.zoomIn();$('pickOnMap').onclick=()=>setSelectMode('pickup');$('destOnMap').onclick=()=>setSelectMode('dest');$('destinationFocus').onclick=()=>{openRouteModal();};
function openRouteModal(){const m=$('routeModal');$('modalPickupInput').value=$('pickupInput').value||$('mapAddress').textContent||'';$('modalDestInput').value=$('destInput').value||'';m.classList.add('open');m.setAttribute('aria-hidden','false');setTimeout(()=>$('modalPickupField').focus({preventScroll:true}),120);}
function closeRouteModal(){const m=$('routeModal');m.classList.remove('open');m.setAttribute('aria-hidden','true');if($('modalPickupMenu'))toggleModalPickupMenu(false);}
$('routeModalClose').onclick=closeRouteModal;
$('routeModal').addEventListener('click',e=>{if(e.target===$('routeModal'))closeRouteModal();});
function toggleModalPickupMenu(force){const menu=$('modalPickupMenu');const field=$('modalPickupField');const open=typeof force==='boolean'?force:!menu.classList.contains('open');menu.classList.toggle('open',open);field.classList.toggle('pickup-active',open);$('modalPickupInput').setAttribute('aria-expanded',String(open));}
$('modalPickupField').addEventListener('click',e=>{e.preventDefault();toggleModalPickupMenu();});
$('modalPickupField').addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();toggleModalPickupMenu();}else if(e.key==='Escape'){toggleModalPickupMenu(false);}});
$('modalPickupMenu').addEventListener('click',e=>e.stopPropagation());
$('modalCurrentLocation').onclick=()=>{toggleModalPickupMenu(false);locate();setTimeout(()=>$('modalDestInput').focus({preventScroll:true}),250);};
$('modalSelectLocation').onclick=()=>{toggleModalPickupMenu(false);closeRouteModal();$('pickupSearchPanel').classList.add('open');$('pickupSearchResults').innerHTML='<div class="pickup-search-status">'+(lang==='ar'?'اكتب اسم المكان أو العنوان للبحث عن نقطة الانطلاق':'Saisissez un lieu ou une adresse')+'</div>';$('pickupSearchInput').value='';setTimeout(()=>$('pickupSearchInput').focus(),80);};
$('modalPickupInput').addEventListener('input',()=>{$('pickupInput').value=$('modalPickupInput').value;});
function openDestinationSearch(){ $('destinationModalSearch').classList.add('open'); $('modalDestField').classList.add('dest-active'); $('destinationSearchInput').value=''; $('destinationSearchResults').innerHTML='<div class="pickup-search-status">اكتب اسم المكان أو العنوان للبحث عن وجهتك</div>'; setTimeout(()=>$('destinationSearchInput').focus({preventScroll:true}),80); }
$('modalDestField').addEventListener('click',e=>{e.preventDefault();openDestinationSearch();});
$('modalDestField').addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openDestinationSearch();}});
$('destinationSearchBack').onclick=()=>{$('destinationModalSearch').classList.remove('open');$('modalDestField').classList.remove('dest-active');$('modalDestField').focus();};
let destinationSearchTimer;
/* searchDestinationPlaces moved to js/features/maps/map-controller.js; loaded before this file. */
$('destinationSearchButton').onclick=searchDestinationPlaces;$('destinationSearchInput').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();searchDestinationPlaces();}});
/* showTripMapPage moved to js/features/maps/map-controller.js; loaded before this file. */
/* hideTripMapPage moved to js/features/maps/map-controller.js; loaded before this file. */
$('tripPageBack').onclick=hideTripMapPage;$('tripPageEdit').onclick=()=>{hideTripMapPage();openRouteModal();};$('tripFareEdit').onclick=openSuggestFarePage;$('tripFilters').onclick=()=>openTripOptions();
let rideSearchStartedAt=0,rideSearchTimerId=null;
/* startRideSearchTimer is defined in js/features/customer/ride-booking.js (loaded before this controller). */

/* stopRideSearchTimer is defined in js/features/customer/ride-booking.js (loaded before this controller). */
let passengerAcceptancePollId=null,passengerAcceptancePollTimer=null,passengerAcceptanceCheckBusy=false,passengerAcceptedRequestId=null,passengerAcceptanceChannel=null;
/* stopPassengerAcceptancePolling is defined in js/features/customer/ride-booking.js (loaded before this controller). */
/* checkPassengerRequestStatus is defined in js/features/customer/ride-booking.js (loaded before this controller). */
/* startPassengerAcceptancePolling is defined in js/features/customer/ride-booking.js (loaded before this controller). */

let requestSubmissionInProgress=false;
async function submitTripRequest(){
 const modal=$('requestSentModal');
 if(requestSubmissionInProgress||modal.classList.contains('open')) return;
 const rawPickup=($('tripPagePickup')?.textContent||'').trim();
 const rawDestination=($('tripPageDestination')?.textContent||'').trim();
 const pickupInput=($('pickupInput')?.value||$('modalPickupInput')?.value||'').trim();
 const destinationInput=($('destInput')?.value||$('modalDestInput')?.value||'').trim();
 const pickup=rawPickup&&rawPickup!=='موقع الانطلاق'&&rawPickup!=='نقطة الانطلاق'?rawPickup:(pickupInput||($('userLatLng')?'موقعي الحالي':'موقعي الحالي'));
 const destination=rawDestination&&rawDestination!=='الوجهة'?rawDestination:destinationInput;
 if(!destination||destination==='الوجهة'){toast(lang==='ar'?'حدّد وجهتك قبل إرسال الطلب.':'Choisissez une destination avant d’envoyer la demande.');return;}
 const fareInput=$('sfPrice')?.value;
 const fare=Number(fareInput!==undefined&&fareInput!==''?fareInput:proposedFare);
 if(!Number.isFinite(fare)||fare<=0){toast(lang==='ar'?'أدخل أجرة صحيحة أكبر من صفر.':'Saisissez un tarif valide supérieur à zéro.');return;}
 let departure='الآن';
 if(typeof sfDepartureMode!=='undefined'){
  if(sfDepartureMode==='half') departure='بعد نصف ساعة';
  else if(sfDepartureMode==='custom'){
   const selectedTime=$('sfCustomTime')?.value;
   const selectedTimestamp=selectedTime?new Date(selectedTime).getTime():NaN;
   if(!selectedTime||!Number.isFinite(selectedTimestamp)||selectedTimestamp<=Date.now()){toast('يرجى تحديد وقت قادم للانطلاق');return;}
   departure=new Date(selectedTimestamp).toLocaleString('ar-DZ',{dateStyle:'short',timeStyle:'short'});
  }
 }
 const client=window.mahattatiSupabase;
 if(!client){toast('تعذّر الاتصال بقاعدة البيانات. أعد تحميل الصفحة وحاول مجددًا.');return;}
 const {data:{user},error:authError}=await client.auth.getUser();
 if(authError||!user){toast('سجّل الدخول أولاً، ثم أعد إرسال طلب الرحلة.');if(window.mahattatiOpenAuth)window.mahattatiOpenAuth();return;}
 requestSubmissionInProgress=true;
 const sendButton=$('tripSearchOffers');if(sendButton){sendButton.disabled=true;sendButton.setAttribute('aria-busy','true');}
 try{
  const p=typeof pickupMarker!=='undefined'&&pickupMarker?.getLatLng?pickupMarker.getLatLng():null;
  const d=typeof destMarker!=='undefined'&&destMarker?.getLatLng?destMarker.getLatLng():null;
  const request={
   pickup,destination,price:Math.round(fare),
   passengers:Math.min(8,Math.max(1,Number(tripPassengerCount||sfPassengerCount)||1)),
   comment:String(tripCommentText||'').trim().slice(0,300),departure,status:'pending',
   createdAt:Date.now(),mode,
   pickupLatitude:p?Number(p.lat):null,pickupLongitude:p?Number(p.lng):null,
   destinationLatitude:d?Number(d.lat):null,destinationLongitude:d?Number(d.lng):null,
   serviceType:(window.mahattatiSelectedService||'economy')
  };
  // Reset any previous trip's acceptance/tracking state before starting a new request.
  stopPassengerAcceptancePolling();
  passengerAcceptedRequestId=null;
  // Avoid calling a tracking helper from another script scope; hide stale UI directly.
  const staleTrackingPanel=document.getElementById('mahattatiDriverTracking');
  if(staleTrackingPanel){staleTrackingPanel.classList.remove('open','active','show');staleTrackingPanel.setAttribute('aria-hidden','true');staleTrackingPanel.style.setProperty('display','none','important');staleTrackingPanel.style.setProperty('visibility','hidden','important');}
  // أظهر صفحة البحث فورًا حتى لا تبقى الواجهة صامتة أثناء انتظار قاعدة البيانات.
  proposedFare=request.price;
  modal.classList.add('open');modal.setAttribute('aria-hidden','false');modal.style.setProperty('display','flex','important');modal.style.setProperty('z-index','90000','important');modal.style.setProperty('visibility','visible','important');
  $('searchFareValue').textContent=String(request.price);$('searchAutoFare').textContent=String(request.price);$('searchCashFare').textContent=String(request.price);
  $('searchPickupLabel').textContent=request.pickup;$('searchDestinationLabel').textContent=request.destination;
  const searchStatus=$('requestSearchStatus'),driversHost=$('availableDriversResults');
  if(searchStatus)searchStatus.textContent='جارٍ إرسال طلبك إلى السائقين المتاحين…';
  if(driversHost)driversHost.innerHTML='<p style="padding:10px;color:#657065">جارٍ إرسال الطلب والبحث عن السائقين…</p>';
  let saved;
  try{
   saved=await window.mahattatiSaveTripRequest(request);
  }catch(saveError){
   console.error('Mahattati trip save failed:',saveError);
   if(searchStatus)searchStatus.textContent='تعذّر إرسال الطلب إلى الخادم. تحقق من الاتصال ثم اضغط «إعادة المحاولة» أو ألغِ الطلب.';
   if(driversHost)driversHost.innerHTML='<button type="button" id="retryTripSubmission" style="border:0;border-radius:14px;padding:13px 18px;background:#00e96b;color:#063b20;font-weight:800;width:100%">إعادة المحاولة</button>';
   document.getElementById('retryTripSubmission')?.addEventListener('click',()=>{modal.classList.remove('open');modal.setAttribute('aria-hidden','true');submitTripRequest();});
   throw saveError;
  }
  request.id=saved.id;request.createdAt=saved.createdAt;request.status='قيد الانتظار';
  let requests=[];try{const parsed=JSON.parse(localStorage.getItem('mahattati_requests')||'[]');if(Array.isArray(parsed))requests=parsed;}catch(e){}
  requests.unshift(request);try{localStorage.setItem('mahattati_requests',JSON.stringify(requests.slice(0,200)));}catch(storageError){console.warn('Could not cache trip request locally:',storageError);}
  if(searchStatus)searchStatus.textContent='تم إرسال طلبك. جارٍ البحث عن سائق متاح…';
  if(driversHost)driversHost.innerHTML='<p style="padding:10px;color:#657065">جارٍ البحث عن السائقين المتاحين…</p>';
  try{
    const {data:drivers,error:driversError}=await client.rpc('list_available_drivers',{p_service_type:request.serviceType||'economy'});
    if(driversError)throw driversError;
    const available=Array.isArray(drivers)?drivers:[];
    if(searchStatus)searchStatus.textContent=available.length?'تم إرسال طلبك والأجرة المقترحة إلى قائمة الطلبات؛ سيظهر للسائقين المعتمدين المتصلين الذين يقبلون هذا النوع من الرحلات. ننتظر قبول أحدهم.':'تم حفظ طلبك والأجرة المقترحة، لكن لا يوجد سائق متصل ومتاح لهذه الخدمة الآن. سيبقى الطلب قيد الانتظار حتى يظهر سائق مناسب.';
    if(driversHost)driversHost.innerHTML=available.length?available.map(d=>{
      let distance='';
      if(request.pickupLatitude!=null&&request.pickupLongitude!=null&&d.latitude!=null&&d.longitude!=null){
        const rad=x=>x*Math.PI/180,lat1=Number(request.pickupLatitude),lat2=Number(d.latitude),dl=rad(Number(d.longitude)-Number(request.pickupLongitude)),dp=rad(lat2-lat1);
        const a=Math.sin(dp/2)**2+Math.cos(rad(lat1))*Math.cos(rad(lat2))*Math.sin(dl/2)**2;
        distance=' · '+(6371*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a))).toFixed(1)+' كم تقريبًا';
      }
      const name=String(d.driver_name||'سائق محطتي').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
      return '<div style="display:flex;align-items:center;gap:10px;padding:10px;margin:7px 0;border:1px solid #e4eee2;border-radius:12px;background:#f8fff7"><span style="font-size:22px">🚗</span><div><strong>'+name+'</strong><div style="font-size:12px;color:#687568">متصل ومتاح'+distance+'</div></div><span style="margin-right:auto;color:#16b95c;font-weight:800">متاح</span></div>';
    }).join(''):'<p style="padding:10px;color:#657065">لا يوجد سائق متصل ومتاح لهذه الخدمة في الوقت الحالي.</p>';
  }catch(driverLookupError){
    console.warn('Available driver lookup failed:',driverLookupError);
    if(searchStatus)searchStatus.textContent='تم إرسال طلبك للسائقين. تعذّر عرض قائمة السائقين المتاحين حاليًا.';
    if(driversHost)driversHost.innerHTML='<p style="padding:10px;color:#657065">سيبقى طلبك قيد الانتظار حتى يردّ أحد السائقين.</p>';
  }
  toast('تم إرسال الطلب للسائقين المتصلين.');
  startRideSearchTimer();
  startPassengerAcceptancePolling(request.id);
 }catch(e){
  console.error('Mahattati trip submission failed:',e);
  if(!modal.classList.contains('open'))toast(e?.message||'تعذّر إرسال الطلب إلى قاعدة البيانات. حاول مجددًا.');
 }finally{
  requestSubmissionInProgress=false;if(sendButton){sendButton.disabled=false;sendButton.removeAttribute('aria-busy');}
 }
}
$('tripSearchOffers').onclick=submitTripRequest;
$('searchFarePlus').addEventListener('click',async()=>{
 const value=Math.max(0,Number($('searchFareValue').textContent)||proposedFare)+50;
 $('searchFareValue').textContent=String(value);$('searchAutoFare').textContent=String(value);$('searchCashFare').textContent=String(value);setProposedFare(value);
});
$('searchFareMinus').addEventListener('click',()=>{
 const value=Math.max(50,(Number($('searchFareValue').textContent)||proposedFare)-50);
 $('searchFareValue').textContent=String(value);$('searchAutoFare').textContent=String(value);$('searchCashFare').textContent=String(value);setProposedFare(value);
});
$('searchAutoToggle').addEventListener('click',()=>{const b=$('searchAutoToggle'),on=b.getAttribute('aria-pressed')!=='true';b.setAttribute('aria-pressed',String(on));b.setAttribute('aria-label',on?'إيقاف القبول التلقائي':'تفعيل القبول التلقائي');});
$('requestSentOkay').addEventListener('click',()=>{stopPassengerAcceptancePolling();stopRideSearchTimer();$('requestSentModal').classList.remove('open');$('requestSentModal').setAttribute('aria-hidden','true');showRequestHistory();});
$('requestSentModal').addEventListener('click',e=>{if(e.target===$('requestSentModal')){stopPassengerAcceptancePolling();stopRideSearchTimer();$('requestSentModal').classList.remove('open');$('requestSentModal').setAttribute('aria-hidden','true');}});
let proposedFare=500;
let fareWasManuallyEdited=false;
let lastCalculatedFareRouteKey='';
let lastFareRouteKey='';
function setProposedFare(value){
 proposedFare=Math.max(0,Math.round(Number(value)||0));
 $('fareValue').textContent=String(proposedFare);
 $('sfPrice').value=String(proposedFare);
 $('sfPassengerCount').textContent=String(sfPassengerCount);setSfDepartureMode(sfDepartureMode);
 if($('sfAutoPrice')) $('sfAutoPrice').textContent=String(proposedFare);
}
$('farePlus').onclick=()=>{fareWasManuallyEdited=true;setProposedFare(proposedFare+50);};
$('fareMinus').onclick=()=>{fareWasManuallyEdited=true;setProposedFare(proposedFare-50);};
function openSuggestFarePage(){
 $('sfPickup').textContent=$('tripPagePickup').textContent||'موقع الانطلاق';
 $('sfDestination').textContent=$('tripPageDestination').textContent||'الوجهة';
 $('sfPrice').value=String(proposedFare);
 if($('sfAutoPrice')) $('sfAutoPrice').textContent=$('sfPrice').value;
 $('suggestFarePage').classList.add('open');$('suggestFarePage').setAttribute('aria-hidden','false');
}
function closeSuggestFarePage(){ setProposedFare($('sfPrice').value);$('suggestFarePage').classList.remove('open');$('suggestFarePage').setAttribute('aria-hidden','true'); }
$('sfClose').addEventListener('click',closeSuggestFarePage);
$('sfPrice').addEventListener('input',()=>{fareWasManuallyEdited=true;const value=Number($('sfPrice').value);if(Number.isFinite(value)&&value>0){proposedFare=Math.round(value);$('fareValue').textContent=String(proposedFare);if($('sfAutoPrice'))$('sfAutoPrice').textContent=String(proposedFare);}});

let sfPassengerCount=1, sfDepartureMode='now';
function setSfDepartureMode(mode){
 sfDepartureMode=mode;
 document.querySelectorAll('#suggestFarePage .sf-time-option').forEach(btn=>{const active=btn.dataset.time===mode;btn.classList.toggle('selected',active);btn.setAttribute('aria-pressed',String(active));});
 const custom=mode==='custom';$('sfCustomTime').hidden=!custom;$('sfCustomTimeLabel').hidden=!custom;
 const minDate=new Date(Date.now()+60000);minDate.setSeconds(0,0);minDate.setMinutes(minDate.getMinutes()-minDate.getTimezoneOffset());$('sfCustomTime').min=minDate.toISOString().slice(0,16);
 if(custom&&(!$('sfCustomTime').value||new Date($('sfCustomTime').value).getTime()<=Date.now())){const d=new Date(Date.now()+30*60000);d.setMinutes(d.getMinutes()-d.getTimezoneOffset());$('sfCustomTime').value=d.toISOString().slice(0,16);}
}
$('sfPassengerMinus').addEventListener('click',()=>{sfPassengerCount=Math.max(1,sfPassengerCount-1);$('sfPassengerCount').textContent=String(sfPassengerCount);});
$('sfPassengerPlus').addEventListener('click',()=>{sfPassengerCount=Math.min(4,sfPassengerCount+1);$('sfPassengerCount').textContent=String(sfPassengerCount);});
document.querySelectorAll('#suggestFarePage .sf-time-option').forEach(btn=>btn.addEventListener('click',()=>setSfDepartureMode(btn.dataset.time)));

$('sfPrice').addEventListener('input',()=>{fareWasManuallyEdited=true;proposedFare=Math.max(0,Math.round(Number($('sfPrice').value)||0));if($('sfAutoPrice')) $('sfAutoPrice').textContent=String(proposedFare);$('fareValue').textContent=String(proposedFare);});
$('sfAutoToggle').addEventListener('click',()=>{const on=$('sfAutoToggle').getAttribute('aria-pressed')!=='true';$('sfAutoToggle').setAttribute('aria-pressed',String(on));$('sfAutoToggle').classList.toggle('enabled',on);});
let tripPassengerCount=1;let tripCommentText='';
function openTripOptions(){ $('passengerCount').textContent=String(tripPassengerCount); $('tripComment').value=tripCommentText; $('tripOptionsModal').classList.add('open'); $('tripOptionsModal').setAttribute('aria-hidden','false'); }
function closeTripOptions(){ $('tripOptionsModal').classList.remove('open'); $('tripOptionsModal').setAttribute('aria-hidden','true'); }
$('sfFilters').addEventListener('click',openTripOptions);
$('tripOptionsClose').addEventListener('click',closeTripOptions);
$('tripOptionsModal').addEventListener('click',e=>{if(e.target===$('tripOptionsModal'))closeTripOptions();});
$('passengerMinus').addEventListener('click',()=>{tripPassengerCount=Math.max(1,tripPassengerCount-1);$('passengerCount').textContent=String(tripPassengerCount);});
$('passengerPlus').addEventListener('click',()=>{tripPassengerCount=Math.min(8,tripPassengerCount+1);$('passengerCount').textContent=String(tripPassengerCount);});
$('tripOptionsSave').addEventListener('click',()=>{tripCommentText=$('tripComment').value.trim();closeTripOptions();toast(`تم حفظ الخيارات: ${tripPassengerCount} ${tripPassengerCount===1?'راكب':'ركاب'}${tripCommentText?' • تم حفظ ملاحظة السائق':''}`);});
$('sfSearch').addEventListener('click',()=>{
 if(sfDepartureMode==='custom'&&!$('sfCustomTime').value){toast('يرجى تحديد وقت الانطلاق');return;}
 proposedFare=Math.max(0,Math.round(Number($('sfPrice').value)||0));
 $('fareValue').textContent=String(proposedFare);
 tripPassengerCount=sfPassengerCount;
 if($('passengerCount'))$('passengerCount').textContent=String(tripPassengerCount);
 closeSuggestFarePage();
 submitTripRequest();
});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeTripOptions();if($('suggestFarePage').classList.contains('open'))closeSuggestFarePage();}});
$('routeModalSubmit').onclick=()=>{ const pickup=$('modalPickupInput').value.trim(), destination=$('modalDestInput').value.trim(); if(!destination){toast(say('needDest'));$('modalDestField').focus();return;} $('pickupInput').value=pickup; $('destInput').value=destination; closeRouteModal();document.querySelector('.route-fields').classList.add('open');toast(say('demo'));};
function selectTripMode(selectedMode){
  mode=selectedMode;
  const cityButton=$('carService'), intercityButton=$('intercityService');
  cityButton.classList.toggle('active',selectedMode==='car');
  intercityButton.classList.toggle('active',selectedMode==='intercity');
  // Keep route type explicit when a user switches between city and intercity.
  if(routeLine && routeLine.getBounds){
    map.fitBounds(routeLine.getBounds().pad(.22),{maxZoom:selectedMode==='intercity'?10:16,animate:true});
  }
}
$('carService').onclick=()=>{selectTripMode('car');openRouteModal();};
$('intercityService').onclick=()=>{selectTripMode('intercity');openRouteModal();};function openMenu(){const b=$('menuBackdrop');if($('driverDashboardPage')?.classList.contains('open'))b.classList.add('driver-menu-open');else b.classList.remove('driver-menu-open');b.classList.add('open');b.setAttribute('aria-hidden','false');}
function closeMenu(){const b=$('menuBackdrop');b.classList.remove('open','driver-menu-open');b.setAttribute('aria-hidden','true');}
// Bottom navigation actions
const bottomNavItems=[...document.querySelectorAll('.bottom-nav-item')];
function setBottomNavActive(activeId){bottomNavItems.forEach(item=>item.classList.toggle('active',item.id===activeId));}
function showHomePage(){
  $('requestHistoryPage').classList.remove('open');$('requestHistoryPage').setAttribute('aria-hidden','true');
  closeMenu();if($('routeModal').classList.contains('open'))closeRouteModal();
  if($('tripMapPage').classList.contains('open'))hideTripMapPage();
  if($('suggestFarePage').classList.contains('open'))closeSuggestFarePage();
  setBottomNavActive('bottomNavDestination');
  document.body.classList.remove('trip-page-active');
  setTimeout(()=>map.invalidateSize(),80);
}
function showRequestHistory(){
  closeMenu();if($('routeModal').classList.contains('open'))closeRouteModal();
  if($('tripMapPage').classList.contains('open'))hideTripMapPage();
  $('requestHistoryPage').classList.add('open');$('requestHistoryPage').setAttribute('aria-hidden','false');
  setBottomNavActive('bottomNavHistory');renderRequestHistory('all');
}
function renderRequestHistory(filter){
  document.querySelectorAll('.history-filter').forEach(b=>b.classList.toggle('active',b.dataset.historyFilter===filter));
  let requests=[];try{requests=JSON.parse(localStorage.getItem('mahattati_requests')||'[]');if(!Array.isArray(requests))requests=[];}catch(e){requests=[];}
  requests=requests.filter(r=>filter==='all'||(filter==='active'?['active','pending','in_progress','جارية'].includes(String(r.status||'').toLowerCase()):['completed','complete','done','مكتملة'].includes(String(r.status||'').toLowerCase())));
  const list=$('requestHistoryList');list.innerHTML='';
  if(!requests.length){const empty=document.createElement('div');empty.className='history-empty';const icon=document.createElement('span');icon.className='history-empty-icon';icon.textContent='◷';const title=document.createElement('strong');title.textContent=filter==='active'?'لا توجد طلبات جارية':filter==='completed'?'لا توجد رحلات مكتملة':'لا توجد طلبات محفوظة بعد';const desc=document.createElement('p');desc.textContent='ستظهر هنا طلباتك الجارية والرحلات التي أكملتها عند توفر تسجيل الطلبات في التطبيق.';empty.append(icon,title,desc);list.appendChild(empty);return;}
  requests.sort((a,b)=>Number(b.createdAt||0)-Number(a.createdAt||0)).forEach(r=>{const card=document.createElement('article');card.className='history-empty';card.style.textAlign='right';card.style.marginTop='12px';const title=document.createElement('strong');title.textContent=(r.pickup||'نقطة الانطلاق')+' ← '+(r.destination||r.dest||'الوجهة');const meta=document.createElement('p');meta.style.margin='8px 0 0';meta.textContent=[r.status||'طلب',r.createdAt?new Date(r.createdAt).toLocaleString('ar-DZ'): '',r.price?String(r.price)+' دج':'',r.passengers?String(r.passengers)+' ركاب':'',r.departure||''].filter(Boolean).join(' · ');card.append(title,meta);list.appendChild(card);});
}
$('bottomNavDestination').addEventListener('click',showHomePage);
$('bottomNavHistory').addEventListener('click',showRequestHistory);
$('historyClose').addEventListener('click',showHomePage);
document.querySelectorAll('.history-filter').forEach(b=>b.addEventListener('click',()=>renderRequestHistory(b.dataset.historyFilter)));
$('bottomNavAccount').addEventListener('click',()=>{setBottomNavActive('bottomNavAccount');openMenu();});

$('menuBtn').onclick=()=>{if($('menuPartner'))$('menuPartner').textContent='وضع الشريك السائق';openMenu();};$('menuClose').onclick=closeMenu;
$('menuBackdrop').addEventListener('click',e=>{if(e.target===$('menuBackdrop'))closeMenu();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeMenu();if($('driverSignupPage')?.classList.contains('open'))closeDriverSignupPage();if($('driverPartnerPage')?.classList.contains('open'))closeDriverPartnerPage();if($('vehicleRegistrationPage')?.classList.contains('open'))closeVehicleRegistrationPage();if($('vehicleInfoPage')?.classList.contains('open'))closeVehicleInfoPage();if($('temporaryCardPage')?.classList.contains('open'))closeTemporaryCardPage();if($('routeModal').classList.contains('open'))closeRouteModal();}});
function openDriverPartnerPage(){closeMenu();const page=$('driverPartnerPage');page.classList.add('open');page.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';}
function closeDriverPartnerPage(){const page=$('driverPartnerPage');page.classList.remove('open');page.setAttribute('aria-hidden','true');document.body.style.overflow='';}
$('menuPartner').onclick=()=>{const driverPage=$('driverDashboardPage');if(driverPage?.classList.contains('open')){closeMenu();driverPage.classList.remove('open');driverPage.setAttribute('aria-hidden','true');document.body.style.overflow='';if(typeof showHomePage==='function')showHomePage();$('menuPartner').textContent='وضع الشريك السائق';}else{ $('menuPartner').textContent='وضع الشريك السائق';openDriverPartnerPage(); }};
$('driverPartnerMenu').onclick=()=>{closeDriverPartnerPage();openMenu();};
$('driverPartnerPassenger').onclick=()=>{closeDriverPartnerPage();showHomePage();};
function openDriverSignupPage(){closeDriverPartnerPage();closeMenu();const p=$('driverSignupPage');p.classList.add('open');p.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';}
function closeDriverSignupPage(){const p=$('driverSignupPage');p.classList.remove('open');p.setAttribute('aria-hidden','true');document.body.style.overflow='';}
$('driverPartnerStart').onclick=openDriverSignupPage;
$('driverSignupClose').onclick=()=>{closeDriverSignupPage();openDriverPartnerPage();};
$('driverSignupHelp').onclick=()=>toast(lang==='ar'?'يمكنك إدخال معلوماتك الشخصية للبدء في التسجيل':'Veuillez saisir vos informations personnelles.');
function openDriverLicensePage(){const p=$('driverLicensePage');p.classList.add('open');p.setAttribute('aria-hidden','false');$('driverSignupPage').classList.remove('open');$('driverSignupPage').setAttribute('aria-hidden','true');}
function closeDriverLicensePage(){const p=$('driverLicensePage');p.classList.remove('open');p.setAttribute('aria-hidden','true');}
$('driverSignupBack').onclick=()=>{};
$('driverPhotoInput').addEventListener('change',e=>{const f=e.target.files&&e.target.files[0];if(!f)return;const reader=new FileReader();reader.onload=()=>{const box=$('driverPhotoPreview');box.textContent='';box.style.backgroundImage='url("'+reader.result+'")';};reader.readAsDataURL(f);});
function previewLicenseImage(inputId,previewId){$(inputId).addEventListener('change',e=>{const f=e.target.files&&e.target.files[0];if(!f)return;const reader=new FileReader();reader.onload=()=>{const box=$(previewId);box.textContent='';box.style.backgroundImage='url("'+reader.result+'")';};reader.readAsDataURL(f);});}
previewLicenseImage('driverLicenseFrontInput','driverLicenseFrontPreview');previewLicenseImage('driverLicenseBackInput','driverLicenseBackPreview');
$('driverSignupForm').addEventListener('submit',e=>{
 e.preventDefault(); const form=$('driverSignupForm'); if(!form.reportValidity())return;
 const photoInput=$('driverPhotoInput');
 if(!photoInput.files || !photoInput.files.length){toast(lang==='ar'?'يرجى إضافة صورة شخصية قبل المتابعة':'Veuillez ajouter une photo de profil avant de continuer.');$('driverPhotoInput').click();return;}
 const birth=$('driverBirthDate'); const date=new Date(birth.value+'T00:00:00'); const today=new Date(); today.setHours(0,0,0,0);
 if(!birth.value || Number.isNaN(date.getTime()) || date>=today){toast(lang==='ar'?'يرجى إدخال تاريخ ميلاد صحيح في الماضي':'Veuillez saisir une date de naissance valide dans le passé.');birth.focus();return;}
 const adultDate=new Date(today.getFullYear()-18,today.getMonth(),today.getDate());
 if(date>adultDate){toast(lang==='ar'?'يجب أن يكون عمر الشريك السائق 18 سنة على الأقل لإكمال التسجيل.':'Vous devez avoir au moins 18 ans pour vous inscrire comme chauffeur partenaire.');birth.focus();return;}
 openDriverLicensePage();
});
$('driverLicenseBack').onclick=()=>{closeDriverLicensePage();const p=$('driverSignupPage');p.classList.add('open');p.setAttribute('aria-hidden','false');};
$('driverLicenseClose').onclick=()=>{closeDriverLicensePage();openDriverPartnerPage();};
$('driverLicenseHelp').onclick=()=>toast(lang==='ar'?'أضف صورة واضحة لوجهي رخصة القيادة وأدخل رقمها وتاريخ انتهائها.':'Ajoutez les deux côtés du permis, son numéro et sa date d’expiration.');
function openVehicleRegistrationPage(){const p=$('vehicleRegistrationPage');p.classList.add('open');p.setAttribute('aria-hidden','false');$('driverLicensePage').classList.remove('open');$('driverLicensePage').setAttribute('aria-hidden','true');}
function closeVehicleRegistrationPage(){const p=$('vehicleRegistrationPage');p.classList.remove('open');p.setAttribute('aria-hidden','true');}
$('driverLicenseNext').onclick=()=>{const form=$('driverLicenseForm');if(!form.reportValidity())return;const front=$('driverLicenseFrontInput'),back=$('driverLicenseBackInput');if(!front.files.length){toast('يرجى إضافة صورة رخصة القيادة');front.click();return;}if(!back.files.length){toast('يرجى إضافة صورة الجانب الخلفي للرخصة');back.click();return;}const expiry=new Date($('driverLicenseExpiry').value);const today=new Date();today.setHours(0,0,0,0);if(Number.isNaN(expiry.getTime())||expiry<=today){toast('تاريخ انتهاء الصلاحية يجب أن يكون بعد تاريخ اليوم.');$('driverLicenseExpiry').focus();return;}openVehicleRegistrationPage();};
$('vehicleRegistrationBack').onclick=()=>{closeVehicleRegistrationPage();$('driverLicensePage').classList.add('open');$('driverLicensePage').setAttribute('aria-hidden','false');};
$('vehicleRegistrationClose').onclick=()=>{closeVehicleRegistrationPage();openDriverPartnerPage();};
$('vehicleRegistrationHelp').onclick=()=>toast('اختر نوع شهادة تسجيل المركبة المناسبة لوثائق مركبتك.');
document.querySelectorAll('#vehicleRegistrationPage .vr-option').forEach(btn=>btn.addEventListener('click',()=>{const select=$('vehicleRegistrationType');select.value=btn.dataset.vrValue;updateSharedRegistrationSteps();document.querySelectorAll('#vehicleRegistrationPage .vr-option').forEach(option=>{const active=option===btn;option.classList.toggle('selected',active);option.setAttribute('aria-checked',active?'true':'false');});}));
function openVehicleInfoPage(){
  setRegistrationProgress();
  /* Hide the previous step before showing step 5/5. The temporary-card page had a higher z-index and otherwise covered the vehicle-info page. */
  const temporaryPage=$('temporaryCardPage');
  if(temporaryPage){temporaryPage.classList.remove('open');temporaryPage.setAttribute('aria-hidden','true');}
  const registrationPage=$('vehicleRegistrationPage');
  if(registrationPage){registrationPage.classList.remove('open');registrationPage.setAttribute('aria-hidden','true');}
  const p=$('vehicleInfoPage');
  p.classList.add('open');
  p.setAttribute('aria-hidden','false');
  document.body.style.overflow='hidden';
}
function closeVehicleInfoPage(){const p=$('vehicleInfoPage');p.classList.remove('open');p.setAttribute('aria-hidden','true');}
function updateSharedRegistrationSteps(){const temporary=$('vehicleRegistrationType')?.value==='temporary-grey-card';const total=temporary?5:4;[['driverSignupPage',1],['driverLicensePage',2]].forEach(([id,step])=>{const page=$(id);const strong=page?.querySelector('.dsp-progress-label strong');const bar=page?.querySelector('.dsp-progress span');if(strong)strong.textContent=step+' من '+total;if(bar)bar.style.width=(step/total*100)+'%';});setRegistrationProgress();}
function setRegistrationProgress(){const temporary=$('vehicleRegistrationType').value==='temporary-grey-card';const total=temporary?5:4;const regLabel=$('vehicleRegistrationProgressLabel');const regBar=$('vehicleRegistrationProgressBar');if(regLabel)regLabel.textContent='3 من '+total;if(regBar)regBar.style.width=(3/total*100)+'%';const infoLabel=$('vehicleInfoProgressLabel');const infoBar=$('vehicleInfoProgressBar');if(infoLabel)infoLabel.textContent=(temporary?'5 من 5':'4 من 4');if(infoBar)infoBar.style.width='100%';}
$('vehicleRegistrationType').addEventListener('change',updateSharedRegistrationSteps);
$('vehicleRegistrationForm').addEventListener('submit',e=>{e.preventDefault();const type=$('vehicleRegistrationType').value;if(!type){$('vehicleRegistrationType').reportValidity();return;}setRegistrationProgress();if(type==='permanent-grey-card'){if(!$('vehicleRegistrationDocumentInput')?.files?.length){toast('يرجى إضافة صورة البطاقة الرمادية قبل المتابعة.');$('vehicleRegistrationDocumentInput')?.click();return;}openVehicleInfoPage();return;}openTemporaryCardPage();});
function openTemporaryCardPage(){setRegistrationProgress();const p=$('temporaryCardPage');p.classList.add('open');p.setAttribute('aria-hidden','false');$('vehicleRegistrationPage').classList.remove('open');$('vehicleRegistrationPage').setAttribute('aria-hidden','true');}
function closeTemporaryCardPage(){const p=$('temporaryCardPage');p.classList.remove('open');p.setAttribute('aria-hidden','true');}
// Validate step 4/5 explicitly on both button click and form submit, then close it before opening step 5/5.
function validateTemporaryCardAndContinue(e){
 if(e){e.preventDefault();e.stopPropagation();}
 const input=$('temporaryCardPhotoInput');
 if(!input.files||!input.files.length){toast('يرجى إضافة صورة شهادة تسجيل المركبة المؤقتة.');input.click();return false;}
 const expiryValue=$('temporaryCardExpiry').value;
 const expiry=new Date(expiryValue+'T00:00:00');
 const today=new Date();today.setHours(0,0,0,0);
 if(!expiryValue||Number.isNaN(expiry.getTime())||expiry<=today){toast('يرجى إدخال تاريخ انتهاء صلاحية صحيح بعد تاريخ اليوم.');$('temporaryCardExpiry').focus();return false;}
 openVehicleInfoPage();
 return true;
}
$('temporaryCardForm').noValidate=true;
$('temporaryCardForm').addEventListener('submit',validateTemporaryCardAndContinue);
$('temporaryCardNext').addEventListener('click',validateTemporaryCardAndContinue);
$('temporaryCardBack').onclick=()=>{closeTemporaryCardPage();$('vehicleRegistrationPage').classList.add('open');$('vehicleRegistrationPage').setAttribute('aria-hidden','false');};
$('temporaryCardClose').onclick=()=>{closeTemporaryCardPage();openDriverPartnerPage();};
$('temporaryCardHelp').onclick=()=>toast('أضف صورة واضحة لشهادة تسجيل المركبة المؤقتة وأدخل تاريخ انتهاء صلاحيتها.');
function previewTemporaryCardImage(){ $('temporaryCardPhotoInput').addEventListener('change',e=>{const f=e.target.files&&e.target.files[0];if(!f)return;const reader=new FileReader();reader.onload=()=>{const box=$('temporaryCardPhotoPreview');box.textContent='';box.style.backgroundImage='url("'+reader.result+'")';};reader.readAsDataURL(f);});}previewTemporaryCardImage();
$('vehicleRegistrationNext').onclick=()=>{$('vehicleRegistrationForm').requestSubmit();};
$('vehicleInfoBack').onclick=()=>{closeVehicleInfoPage();if($('vehicleRegistrationType').value==='temporary-grey-card'){openTemporaryCardPage();}else{$('vehicleRegistrationPage').classList.add('open');$('vehicleRegistrationPage').setAttribute('aria-hidden','false');}};
$('vehicleInfoClose').onclick=()=>{closeVehicleInfoPage();openDriverPartnerPage();};
$('vehicleInfoHelp').onclick=()=>toast('أدخل بيانات المركبة كما تظهر في وثائقها وأضف الصور المطلوبة.');
function previewVehicleImage(inputId,previewId){$(inputId).addEventListener('change',e=>{const f=e.target.files&&e.target.files[0];if(!f)return;const reader=new FileReader();reader.onload=()=>{const box=$(previewId);box.textContent='';box.style.backgroundImage='url("'+reader.result+'")';};reader.readAsDataURL(f);});}
previewVehicleImage('vehiclePhotoInput','vehiclePhotoPreview');
$('vehicleInfoForm').addEventListener('submit',e=>{
 e.preventDefault();
 const photo=$('vehiclePhotoInput');
 const fields=[
  ['vehicleBrand','يرجى إدخال العلامة التجارية للسيارة.'],
  ['vehicleModel','يرجى إدخال طراز المركبة.'],
  ['vehicleColor','يرجى إدخال لون المركبة.'],
  ['vehicleYear','يرجى إدخال سنة إنتاج المركبة.'],
  ['vehiclePlate','يرجى إدخال رقم لوحة المركبة.']
 ];
 for(const [id,message] of fields){
  const field=$(id);
  if(!field.value.trim()){
   toast(message);field.focus();return;
  }
 }
 const year=Number($('vehicleYear').value),currentYear=new Date().getFullYear();
 if(!Number.isInteger(year)||year<1950||year>currentYear){toast('يرجى إدخال سنة إنتاج صحيحة بين 1950 و'+currentYear+'.');$('vehicleYear').focus();return;}
 if(!photo.files||!photo.files.length){toast('يرجى إضافة صورة المركبة قبل المتابعة.');return;}
 closeVehicleInfoPage();
 openDriverAccessSetupPage();
});
$('vehicleInfoClose').addEventListener('click',()=>{});
$('driverLicensePage').querySelector('#driverLicenseClose').addEventListener('click',()=>{});
function openDriverAccessSetupPage(){const p=$('driverAccessSetupPage');if(!p)return;p.classList.add('open');p.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';}
function closeDriverAccessSetupPage(){const p=$('driverAccessSetupPage');p.classList.remove('open');p.setAttribute('aria-hidden','true');}
$('driverAccessClose').onclick=()=>{closeDriverAccessSetupPage();openDriverPartnerPage();};
$('driverAccessContinue').onclick=async()=>{
 const client=window.mahattatiSupabase;if(!client){toast('قاعدة البيانات غير متاحة.');return;}
 const nationalId=$('driverNationalIdNumber')?.value.trim(),phone=$('driverApplicationPhone')?.value.trim();
 if(!nationalId||nationalId.length<6){toast('أدخل رقم بطاقة التعريف الوطنية بشكل صحيح.');$('driverNationalIdNumber')?.focus();return;}
 if(!phone||phone.length<8){toast('أدخل رقم هاتف صحيحًا.');$('driverApplicationPhone')?.focus();return;}
 const {data:{user},error:authError}=await client.auth.getUser();if(authError||!user){toast('سجّل الدخول أولاً لإرسال طلب الشراكة.');if(window.mahattatiOpenAuth)window.mahattatiOpenAuth();return;}
 const {data:existing,error:existingError}=await client.from('driver_applications').select('status').eq('user_id',user.id).maybeSingle();
 if(existingError){toast('تعذّر التحقق من ملف السائق: '+existingError.message);return;}
 if(existing){toast(existing.status==='approved'?'حسابك معتمد بالفعل.':'لديك ملف سائق قيد المراجعة أو تمت مراجعته.');if(existing.status==='approved')openDriverPermissionsPage();return;}
 const profilePhoto=$('driverPhotoInput')?.files?.[0],licenseFront=$('driverLicenseFrontInput')?.files?.[0],licenseBack=$('driverLicenseBackInput')?.files?.[0],registration=$('vehicleRegistrationDocumentInput')?.files?.[0]||$('temporaryCardPhotoInput')?.files?.[0];
 if(!profilePhoto){toast('أضف صورتك الشخصية قبل إرسال الملف.');return;}
 if(!licenseFront||!licenseBack){toast('أضف وجهي رخصة القيادة قبل إرسال الملف.');return;}
 if(!registration){toast('أضف صورة البطاقة الرمادية / شهادة تسجيل المركبة.');return;}
 const files=[profilePhoto,licenseFront,licenseBack,registration];
 for(const file of files){if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>10*1024*1024){toast('الوثائق يجب أن تكون JPG أو PNG أو WEBP وأقل من 10MB لكل صورة.');return;}}
 const btn=$('driverAccessContinue');btn.disabled=true;btn.textContent='جارٍ إرسال الملف بأمان…';
 const uploaded=[];
 try{
   const bucket=client.storage.from('driver-private-documents');
   for(let i=0;i<files.length;i++){
     const file=files[i],ext=file.type==='image/png'?'png':file.type==='image/webp'?'webp':'jpg';
     const path=user.id+'/application-'+Date.now()+'-'+['profile-photo','license-front','license-back','vehicle-registration'][i]+'.'+ext;
     const {error}=await bucket.upload(path,file,{upsert:false,contentType:file.type});if(error)throw error;uploaded.push(path);
   }
   const fullName=[$('driverFirstName')?.value.trim(),$('driverLastName')?.value.trim()].filter(Boolean).join(' ');
   const {error}=await client.from('driver_applications').insert({user_id:user.id,full_name:fullName,surname:$('driverLastName')?.value.trim()||'',phone,email:user.email||'',birth_date:$('driverBirthDate')?.value||null,driver_license_number:$('driverLicenseNumber')?.value.trim()||null,driver_license_expiry:$('driverLicenseExpiry')?.value||null,vehicle_make:$('vehicleBrand')?.value.trim()||'',vehicle_model:$('vehicleModel')?.value.trim()||'',vehicle_color:$('vehicleColor')?.value.trim()||'',vehicle_year:Number($('vehicleYear')?.value)||null,vehicle_plate:$('vehiclePlate')?.value.trim()||null,vehicle_registration_type:$('vehicleRegistrationType')?.value||null,selfie_license_path:JSON.stringify(uploaded.slice(0,3)),vehicle_registration_path:uploaded[3],national_id_number:nationalId});
   if(error)throw error;
   toast('تم إرسال ملف السائق بأمان. سيبقى قيد المراجعة حتى تتم الموافقة.');
   closeDriverAccessSetupPage();openDriverPermissionsPage();
 }catch(e){console.error('Driver application submission failed',e);toast('تعذّر إرسال ملف السائق: '+(e.message||'خطأ غير معروف'));for(const path of uploaded){try{await client.storage.from('driver-private-documents').remove([path]);}catch(_){}}}
 finally{btn.disabled=false;btn.innerHTML='انتقال إلى الإعداد <span aria-hidden="true">←</span>';}
};
function openDriverPermissionsPage(){const p=$('driverPermissionsPage');if(!p)return;p.classList.add('open');p.setAttribute('aria-hidden','false');}
function closeDriverPermissionsPage(){const p=$('driverPermissionsPage');if(!p)return;p.classList.remove('open');p.setAttribute('aria-hidden','true');}
function showDriverAccessMessage(message,kind='warning'){
 const box=$('driverAccessMessage');
 if(!box)return;
 box.textContent=message;
 box.style.display='block';
 box.style.background=kind==='success'?'#e9fbeF':'#fff4e5';
 box.style.color=kind==='success'?'#176534':'#8a4b08';
 box.style.borderColor=kind==='success'?'#91d5a5':'#f2c078';
}
async function openDriverDashboardPage(){
 const p=$('driverDashboardPage');
 const client=window.mahattatiSupabase;
 const btn=$('driverPartnerLogin');
 if(btn)btn.disabled=true;
 const message=(text)=>{showDriverAccessMessage(text);toast(text);};
 try{
  if(!p)throw new Error('تعذّر العثور على واجهة السائق.');
  if(!client){message('سبب عدم الدخول: تعذّر الاتصال بقاعدة البيانات. تحقق من الإنترنت وحاول مجددًا.');return;}
  const {data:{user},error:authError}=await client.auth.getUser();
  if(authError)throw authError;
  if(!user){
   message('سبب عدم الدخول: لم تسجّل الدخول إلى حسابك بعد. سجّل الدخول أولًا ثم اضغط «لديّ حساب بالفعل» مجددًا.');
   if(typeof window.mahattatiOpenAuth==='function')window.mahattatiOpenAuth();
   return;
  }
  const {data:driver,error}=await client.from('driver_applications').select('status').eq('user_id',user.id).maybeSingle();
  if(error)throw error;
  if(!driver){
   message('سبب عدم الدخول: لا يوجد طلب شراكة سائق مرتبط بحسابك. اختر «إنشاء حساب شريك سائق» لإرسال طلبك.');
   return;
  }
  if(driver.status!=='approved'){
   const messages={
    pending:'سبب عدم الدخول: طلبك ما زال قيد الانتظار لدى الإدارة. ستتمكن من الدخول بعد الموافقة.',
    under_review:'سبب عدم الدخول: ملفك قيد المراجعة حاليًا. يرجى الانتظار حتى تنتهي المراجعة.',
    rejected:'سبب عدم الدخول: تم رفض طلب شراكة السائق. يرجى التواصل مع الإدارة لمعرفة الخطوة التالية.'
   };
   message(messages[driver.status]||'سبب عدم الدخول: حالة حسابك ('+String(driver.status||'غير محددة')+') لا تسمح بالدخول حاليًا. يرجى التواصل مع الإدارة.');
   return;
  }
  const box=$('driverAccessMessage');
  if(box){box.style.display='none';box.textContent='';}
  closeDriverPartnerPage();
  closeMenu();
  p.classList.add('open');
  p.setAttribute('aria-hidden','false');
  document.body.style.overflow='hidden';
 }catch(error){
  console.error('Driver dashboard access verification failed:',error);
  message('سبب عدم الدخول: تعذّر التحقق من حسابك بسبب مشكلة في الاتصال أو صلاحيات قاعدة البيانات. لم نفتح الواجهة حفاظًا على أمان حسابك. حاول مجددًا، وإذا استمرت المشكلة تواصل مع الإدارة.');
 }finally{
  if(btn)btn.disabled=false;
 }
}
function mddNotice(msg){const t=$('mddToast');if(!t)return;t.textContent=msg;t.classList.add('show');clearTimeout(window.__mddTimer);window.__mddTimer=setTimeout(()=>t.classList.remove('show'),2200);}
$('mddStatus').onclick=async()=>{const b=$('mddStatus'),client=window.mahattatiSupabase;if(!client){mddNotice('قاعدة البيانات غير متاحة.');return;}b.disabled=true;try{const {data:{user},error:ue}=await client.auth.getUser();if(ue)throw ue;if(!user){if(window.mahattatiOpenAuth)window.mahattatiOpenAuth();throw new Error('سجّل الدخول أولاً.');}const {data:driver,error:de}=await client.from('driver_applications').select('status,is_online,is_busy').eq('user_id',user.id).maybeSingle();if(de)throw de;if(!driver||driver.status!=='approved')throw new Error('حساب السائق غير معتمد بعد.');const next=!driver.is_online;const {error}=await client.rpc('set_my_driver_online',{p_is_online:next});if(error)throw error;b.setAttribute('aria-pressed',String(next));b.classList.toggle('online',next);b.querySelector('span').textContent=next?'متصل':'غير متصل';$('mddOnlineHint').innerHTML='<i class="'+(next?'online':'')+'"></i><span>'+(next?'أنت متصل الآن ويمكنك استقبال طلبات الرحلات.':'أنت غير متصل. غيّر حالتك لاستقبال الطلبات.')+'</span>';if(window.mahattatiLoadDriverRequests)window.mahattatiLoadDriverRequests();}catch(e){mddNotice(e.message||'تعذّر تغيير حالة الاتصال.');}finally{b.disabled=false;}};
$('mddSettings').onclick=()=>mddNotice('إعدادات السائق — ستتوفر هنا لاحقًا.');$('mddMenu').onclick=(e)=>{e.preventDefault();e.stopPropagation();const menuPartner=$('menuPartner'),driverPage=$('driverDashboardPage');if(menuPartner)menuPartner.textContent=driverPage?.classList.contains('open')?'انتقال إلى وضع الراكب':'وضع الشريك السائق';openMenu();};
function mddRestorePinnedNav(){document.body.classList.remove('mdd-request-nav-pinned');const nav=window.__mddPinnedNav;if(!nav)return;const dashboard=document.getElementById('driverDashboardPage');if(dashboard){const rides=dashboard.querySelector('.mdd-rides');if(rides&&rides.parentNode===dashboard)dashboard.insertBefore(nav,rides.nextSibling);else dashboard.appendChild(nav);}nav.style.removeProperty('position');nav.style.removeProperty('left');nav.style.removeProperty('right');nav.style.removeProperty('bottom');nav.style.removeProperty('z-index');nav.style.removeProperty('width');nav.style.removeProperty('min-height');nav.style.removeProperty('padding');nav.style.removeProperty('background');nav.style.removeProperty('box-shadow');nav.style.removeProperty('backdrop-filter');window.__mddPinnedNav=null;}
function mddPinNavAboveRequest(){let nav=window.__mddPinnedNav||document.querySelector('#driverDashboardPage .mdd-nav')||document.querySelector('nav.mdd-nav');if(!nav)return;const dashboard=document.getElementById('driverDashboardPage');if(!window.__mddPinnedNav){window.__mddPinnedNav=nav;window.__mddPinnedNavOriginalParent=nav.parentNode;window.__mddPinnedNavOriginalNext=nav.nextSibling;}document.body.classList.add('mdd-request-nav-pinned');if(nav.parentNode!==document.body)document.body.appendChild(nav);['position','left','right','bottom','z-index','width','display','visibility','opacity','pointer-events','background','box-shadow'].forEach((k,i)=>{});nav.style.setProperty('position','fixed','important');nav.style.setProperty('left','0','important');nav.style.setProperty('right','0','important');nav.style.setProperty('top','auto','important');nav.style.setProperty('bottom','0','important');nav.style.setProperty('z-index','2147483647','important');nav.style.setProperty('width','100%','important');nav.style.setProperty('display','grid','important');nav.style.setProperty('visibility','visible','important');nav.style.setProperty('opacity','1','important');nav.style.setProperty('background','rgba(255,255,255,.99)','important');nav.style.setProperty('box-shadow','0 -5px 18px rgba(20,40,22,.12)','important');nav.style.setProperty('pointer-events','auto','important');}
function mddMountRealHomeMapInRequest(){if(window.mddMountRealMapIndependent)window.mddMountRealMapIndependent();}
function mddRestoreRealHomeMap(){try{if(window.map)window.map.invalidateSize({pan:false});}catch(e){}}
function mddShowTab(tab){mddRestoreRealHomeMap();mddRestorePinnedNav();const wallet=$('mddWalletPage'),earnings=$('mddEarningsPage'),ratings=$('mddRatingsPage'),heading=document.querySelector('#driverDashboardPage .mdd-heading'),hint=$('mddOnlineHint'),rides=document.querySelector('#driverDashboardPage .mdd-rides'),nav=document.querySelector('#driverDashboardPage .mdd-nav'),requestPage=$('mddRideRequestPage'),isWallet=tab==='المحفظة',isEarnings=tab==='أرباحي',isRatings=tab==='تقييمات'||tab==='أيام',isRequest=tab==='طلبات الركوب'||tab==='الطلب';if(isWallet)window.mddRefreshDriverWalletBalance?.();[[wallet,isWallet,'mdd-wallet-open'],[earnings,isEarnings,'mdd-earnings-open'],[ratings,isRatings,'mdd-ratings-open']].forEach(([el,show,cls])=>{if(!el)return;el.hidden=!show;el.classList.toggle(cls,show);el.style.setProperty('display',show?'block':'none','important');el.setAttribute('aria-hidden',String(!show));});if(heading)heading.hidden=isWallet||isEarnings||isRatings;if(hint)hint.hidden=isWallet||isEarnings||isRatings;if(rides)rides.hidden=isWallet||isEarnings||isRatings;if(requestPage){requestPage.classList.remove('open');requestPage.setAttribute('aria-hidden','true');}if(nav){nav.hidden=false;nav.style.setProperty('display','grid','important');nav.setAttribute('aria-hidden','false');}document.querySelectorAll('#driverDashboardPage .mdd-nav button').forEach(x=>{const active=x.dataset.tab===tab;x.classList.toggle('active',active);x.setAttribute('aria-current',active?'page':'false')});}
document.querySelectorAll('#driverDashboardPage .mdd-nav button').forEach(b=>{b.addEventListener('click',()=>mddShowTab(b.dataset.tab));});const mddWalletNav=document.querySelector('#driverDashboardPage .mdd-nav button[data-tab="المحفظة"]');if(mddWalletNav)mddWalletNav.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();mddShowTab('المحفظة');}); function mddPopulateRequest(card){card=card||document.querySelector('#driverDashboardPage .mdd-ride');if(!card)return;const price=card.querySelector('.mdd-ride-top strong'),distance=card.querySelector('.mdd-ride-top>span'),labels=[...card.querySelectorAll('.mdd-route small')].map(x=>x.textContent.trim()),names=[...card.querySelectorAll('.mdd-route b')].map(x=>x.textContent.trim());let pickup='',dropoff='';labels.forEach((label,i)=>{if(label.includes('الاستلام'))pickup=names[i]||'';if(label.includes('التوصيل'))dropoff=names[i]||'';});if(!pickup&&names.length)pickup=names[0];if(!dropoff&&names.length>1)dropoff=names[names.length-1];const p=price?price.childNodes[0].textContent.trim():'150';$('mddRequestPrice').innerHTML=p+' <span>دج</span>';$('mddRequestDriverDistance').textContent=distance?distance.textContent.trim().replace(/^↗\s*/,''):'غير محددة';$('mddRequestTripDistance').textContent='غير متاحة';$('mddRequestTripTime').textContent='غير متاح';$('mddRequestPickup').textContent=pickup||'غير محدد';$('mddRequestDropoff').textContent=dropoff||'غير محدد';$('mddRequestOfferPrice').value='';$('mddRequestOfferNote').value='';}
function mddCloseRequest(){mddRestoreRealHomeMap();const page=$('mddRideRequestPage');if(page){page.classList.remove('open');page.setAttribute('aria-hidden','true');}document.body.style.overflow='';mddShowTab('طلبات الركوب');}
/* زر العودة موحّد في معالج التفويض داخل mdd-request-reopen-fix. */
$('mddRequestAccept').onclick=()=>{mddCloseRequest();mddNotice('تم اختيار القبول مقابل السعر المعروض تجريبيًا؛ يلزم ربطه بخادم الطلبات لتأكيد الرحلة.');};
$('mddRequestSkip').onclick=()=>{mddCloseRequest();mddNotice('تم تخطي الطلب تجريبيًا.');};
$('mddRequestSendOffer').onclick=()=>{const price=Number($('mddRequestOfferPrice').value),note=$('mddRequestOfferNote').value.trim();if(!Number.isFinite(price)||price<=0){mddNotice('اكتب أجرتك المقترحة بالدينار الجزائري.');$('mddRequestOfferPrice').focus();return;}try{const items=JSON.parse(localStorage.getItem('mahattati_price_proposals')||'[]');items.push({price,note,pickup:$('mddRequestPickup').textContent,dropoff:$('mddRequestDropoff').textContent,createdAt:new Date().toISOString(),source:'request-screen'});localStorage.setItem('mahattati_price_proposals',JSON.stringify(items));}catch(e){}mddCloseRequest();mddNotice('تم تسجيل اقتراحك تجريبيًا. إرساله للعميل يتطلب ربط الخادم.');};
async function mddRefreshDriverWalletBalance(){const value=$('mddWalletBalanceValue'),msg=$('mddWalletBalanceStatus'),client=window.mahattatiSupabase;if(!value||!msg)return;if(!client){value.textContent='غير متاح';msg.textContent='تعذر الاتصال بقاعدة البيانات.';return;}value.textContent='جارٍ التحميل…';msg.textContent='يتم جلب الرصيد الحقيقي من حسابك.';try{const {data:{user},error:ue}=await client.auth.getUser();if(ue)throw ue;if(!user)throw new Error('سجّل الدخول بحساب السائق لعرض الرصيد.');const {data,error}=await client.rpc('get_my_driver_wallet_balance');if(error)throw error;const balance=Number(Array.isArray(data)?data[0]:data);if(!Number.isFinite(balance))throw new Error('لم يرجع الخادم رصيدًا صالحًا.');value.innerHTML=balance.toLocaleString('fr-DZ',{maximumFractionDigits:2})+' <small>عملة</small>';msg.textContent='الرصيد محدث من قاعدة البيانات.';}catch(e){value.textContent='—';msg.textContent=e.message||'تعذر تحميل الرصيد الحقيقي.';}}window.mddRefreshDriverWalletBalance=mddRefreshDriverWalletBalance;$('mddWalletMenu').onclick=()=>mddShowTab('طلبات الركوب');$('mddWalletBalance').onclick=()=>mddRefreshDriverWalletBalance();function mddWalletChoiceModal(kind){
 let modal=document.getElementById('mddWalletChoiceModal');
 if(!modal){
  modal=document.createElement('div');modal.id='mddWalletChoiceModal';
  modal.style.cssText='position:fixed;inset:0;z-index:12000;background:rgba(10,20,12,.48);display:flex;align-items:flex-end;justify-content:center;padding:12px 12px calc(12px + env(safe-area-inset-bottom));';
  modal.innerHTML='<section dir="rtl" style="width:100%;max-width:520px;max-height:85dvh;overflow:auto;background:#fff;border-radius:25px;padding:22px 18px 20px;box-shadow:0 15px 45px #0003;color:#243329;font-family:system-ui;box-sizing:border-box"><header style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:16px"><h2 id="mddWalletChoiceTitle" style="font-size:23px;margin:0;font-weight:850"></h2><button id="mddWalletChoiceClose" type="button" aria-label="إغلاق" style="width:40px;height:40px;border:1px solid #e2e9e2;border-radius:12px;background:#f7faf7;font-size:25px;color:#243329">×</button></header><div id="mddWalletChoiceBody"></div></section>';
  document.body.appendChild(modal);
  modal.addEventListener('click',e=>{if(e.target===modal)modal.remove()});
  modal.querySelector('#mddWalletChoiceClose').onclick=()=>modal.remove();
 }
 const title=modal.querySelector('#mddWalletChoiceTitle'),body=modal.querySelector('#mddWalletChoiceBody');
 const option=(icon,name,desc,active)=>'<article style="display:flex;align-items:center;gap:12px;padding:14px 12px;margin:10px 0;border:1px solid '+(active?'#00d96b':'#e3e9e3')+';border-radius:16px;background:'+(active?'#f2fff7':'#fafcfa')+'"><span style="width:44px;height:44px;flex:0 0 44px;border-radius:13px;display:grid;place-items:center;background:'+(active?'#d9ffea':'#eef2ee')+';font-size:24px">'+icon+'</span><div style="flex:1;min-width:0"><strong style="display:block;font-size:16px">'+name+'</strong><small style="display:block;color:#667368;font-size:12px;line-height:1.6;margin-top:3px">'+desc+'</small></div><span style="font-size:11px;font-weight:800;color:'+(active?'#12884a':'#788278')+'">'+(active?'متاح':'قريبًا')+'</span></article>';
 if(kind==='topup'){
  title.textContent='تعبئة رصيد المحفظة';
  body.innerHTML='<p style="margin:0 0 12px;color:#687468;font-size:14px;line-height:1.8">اختار الطريقة المناسبة لتعبئة رصيدك.</p>'+option('🏪','الشحن عند الوكيل','ادفع نقدًا لوكيل محطتي واطلب منه شحن رصيد حساب السائق. بعد تأكيد العملية يتحدّث رصيدك من قاعدة البيانات.',true)+option('💳','البطاقة البنكية CIB','الدفع الإلكتروني الآمن — سيتم تفعيله بعد ربط مزوّد دفع معتمد.',false)+option('🟡','البطاقة الذهبية Edahabia','الدفع بالبطاقة الذهبية — غير مفعّل حاليًا.',false)+option('🏤','CCP / بريدي موب','حسب وسيلة الدفع والخدمة التي يدعمها مزوّد الدفع — غير مفعّل حاليًا.',false)+'<p style="font-size:11px;color:#7a857b;line-height:1.7;margin:14px 2px 0">تنبيه: لن تتم إضافة رصيد إلكتروني قبل التحقق من نجاح الدفع من جهة الخادم.</p>';
 }else{
  title.textContent='طرق السداد';
  body.innerHTML='<p style="margin:0 0 12px;color:#687468;font-size:14px;line-height:1.8">هذه طرق تعبئة رصيد محفظة السائق وحالتها الحالية.</p>'+option('🏪','الدفع النقدي عند الوكيل','متاح: الوكيل يشحن حسابك بعد استلام المبلغ وتأكيد العملية.',true)+option('💳','CIB','سيتم تفعيله بعد إعداد بوابة دفع آمنة.',false)+option('🟡','Edahabia','سيتم تفعيله بعد التأكد من دعم البطاقة لدى مزوّد الدفع.',false)+option('📱','CCP / بريدي موب','التوفر يعتمد على مزوّد الدفع المعتمد؛ ليس تحويلًا تلقائيًا بمجرد إدخال رقم CCP.',false);
 }
 modal.style.display='flex';
}
$('mddWalletTopup').onclick=()=>mddWalletChoiceModal('topup');$('mddWalletPayment').onclick=()=>mddWalletChoiceModal('methods');$('mddEarningsBack').onclick=()=>mddShowTab('طلبات الركوب');$('mddRatingsBack').onclick=()=>mddShowTab('طلبات الركوب');$('mddEarningsWithdraw').onclick=()=>mddNotice('لا توجد أرباح متاحة للسحب حاليًا. سيتم تفعيل السحب بعد ربط الرحلات ونظام الدفع.');
const mddDetailModal=$('mddOrderDetails');
function mddCloseOrderDetails(){if(!mddDetailModal)return;mddDetailModal.classList.remove('open');mddDetailModal.setAttribute('aria-hidden','true');document.body.style.overflow='hidden';}
function mddOpenOrderDetails(button){const card=button.closest('.mdd-ride');if(!card)return;const price=card.querySelector('.mdd-ride-top strong');const badges=card.querySelector('.mdd-ride-top');const distance=card.querySelector('.mdd-ride-top>span');const routeLabels=[...card.querySelectorAll('.mdd-route small')].map(x=>x.textContent.trim());const routeNames=[...card.querySelectorAll('.mdd-route b')].map(x=>x.textContent.trim());$('mddDetailPrice').innerHTML=(price?price.childNodes[0].textContent.trim():'—')+' <small>دج</small>';$('mddDetailDistance').textContent=distance?distance.textContent.trim().replace(/^↗\s*/, ''):'غير محددة';let pickup='',dropoff='';for(let i=0;i<routeLabels.length;i++){if(routeLabels[i].includes('الاستلام'))pickup=routeNames[i]||'';if(routeLabels[i].includes('التوصيل'))dropoff=routeNames[i]||'';}if(!pickup&&routeNames.length>1)pickup=routeNames[0];if(!dropoff&&routeNames.length>1)dropoff=routeNames[routeNames.length-1];$('mddDetailPickup').textContent=pickup||'غير مذكور في الطلب';$('mddDetailDropoff').textContent=dropoff||routeNames[0]||'غير مذكور في الطلب';$('mddDetailFair').hidden=!card.querySelector('.mdd-ride-top label');mddDetailModal.classList.add('open');mddDetailModal.setAttribute('aria-hidden','false');}
document.querySelectorAll('#driverDashboardPage .mdd-view').forEach(b=>b.onclick=()=>{const card=b.closest('.mdd-ride');if(!card)return;mddPopulateRequest(card);const page=$('mddRideRequestPage');if(page){page.classList.add('open');page.setAttribute('aria-hidden','false');page.style.setProperty('display','block','important');page.scrollTop=0;document.body.style.overflow='hidden';mddPinNavAboveRequest();mddMountRealHomeMapInRequest();}});
$('mddDetailClose').onclick=mddCloseOrderDetails;
mddDetailModal.addEventListener('click',e=>{if(e.target===mddDetailModal)mddCloseOrderDetails();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&mddDetailModal.classList.contains('open'))mddCloseOrderDetails();});
$('mddDetailAccept').onclick=()=>{mddCloseOrderDetails();mddNotice('تم اختيار قبول الطلب تجريبيًا؛ يلزم ربطه بنظام الطلبات الفعلي لتأكيد القبول.');};

const mddNegotiateButton=$('mddDetailNegotiate'),mddNegotiationPanel=$('mddNegotiationPanel');
if(mddNegotiateButton&&mddNegotiationPanel){mddNegotiateButton.onclick=()=>{mddNegotiationPanel.hidden=!mddNegotiationPanel.hidden;if(!mddNegotiationPanel.hidden){const priceText=$('mddDetailPrice').textContent;const current=parseInt(priceText.replace(/[^0-9]/g,''),10);$('mddProposalPrice').value=Number.isFinite(current)&&current>0?current:'';$('mddProposalPrice').focus();}};}
$('mddSendProposal').onclick=()=>{const price=Number($('mddProposalPrice').value),note=$('mddProposalNote').value.trim();if(!Number.isFinite(price)||price<=0){mddNotice('أدخل سعرًا مقترحًا صحيحًا بالدينار الجزائري.');$('mddProposalPrice').focus();return;}try{const proposals=JSON.parse(localStorage.getItem('mahattati_price_proposals')||'[]');proposals.push({price, note, createdAt:new Date().toISOString(), pickup:$('mddDetailPickup').textContent, dropoff:$('mddDetailDropoff').textContent});localStorage.setItem('mahattati_price_proposals',JSON.stringify(proposals));}catch(e){}mddNegotiationPanel.hidden=true;mddCloseOrderDetails();mddNotice('تم تسجيل اقتراح السعر تجريبيًا. الإرسال للراكب يتطلب ربط التطبيق بخادم الطلبات.');};



const dpermLabels={notifications:'الإشعارات',location:'الموقع',overlay:'العرض فوق التطبيقات الأخرى',battery:'استخدام البطارية دون قيود',autostart:'التشغيل التلقائي'};
function setDpermState(kind,choice){
  try{localStorage.setItem('mahattati_permission_'+kind,choice)}catch(e){}
  const card=document.querySelector('[data-permission-card="'+kind+'"]'); if(!card)return;
  card.querySelectorAll('[data-choice]').forEach(b=>{const active=b.dataset.choice===choice;b.classList.toggle('selected',active);b.setAttribute('aria-pressed',active?'true':'false')});
  const result=card.querySelector('.dperm-result'); if(result)result.textContent=choice==='allow'?'تمت الموافقة':'تم الرفض';
  card.classList.toggle('permission-allowed',choice==='allow');card.classList.toggle('permission-denied',choice==='deny');
}
document.querySelectorAll('[data-permission][data-choice]').forEach(btn=>btn.addEventListener('click',async()=>{
  const kind=btn.dataset.permission,choice=btn.dataset.choice;
  setDpermState(kind,choice);
  if(kind==='location'){
    window.MAHATTATI_LOCATION_ALLOWED=choice==='allow';
    try{localStorage.setItem('mahattati_location_allowed',choice==='allow'?'true':'false')}catch(e){}
    if(choice==='deny'){toast('تم رفض إذن الموقع؛ لن يستخدم MAHATTATI موقع الهاتف.');return;}
    if(!navigator.geolocation){toast('هذا المتصفح لا يدعم تحديد الموقع.');return;}
    navigator.geolocation.getCurrentPosition(pos=>{window.MAHATTATI_CURRENT_COORDS={latitude:pos.coords.latitude,longitude:pos.coords.longitude,accuracy:pos.coords.accuracy};toast('تم السماح بالوصول إلى الموقع بنجاح.');},err=>{toast(err&&err.code===1?'رفض المتصفح إذن الموقع؛ اسمح به من إعدادات المتصفح.':'تعذر تحديد الموقع؛ تحقق من GPS واتصال HTTPS.');},{enableHighAccuracy:true,timeout:15000,maximumAge:0});
    return;
  }
  const msgs={notifications:choice==='allow'?'تمت الموافقة على الإشعارات داخل إعدادات MAHATTATI.':'تم رفض الإشعارات داخل إعدادات MAHATTATI.',overlay:choice==='allow'?'تم السماح بخيار العرض داخل واجهة MAHATTATI.':'تم رفض خيار العرض داخل واجهة MAHATTATI.',battery:choice==='allow'?'تمت الموافقة على خيار البطارية داخل واجهة MAHATTATI.':'تم رفض خيار البطارية داخل واجهة MAHATTATI.',autostart:choice==='allow'?'تمت الموافقة على التشغيل التلقائي داخل واجهة MAHATTATI.':'تم رفض التشغيل التلقائي داخل واجهة MAHATTATI.'};
  toast(msgs[kind]||'تم حفظ اختيارك.');
}));
// Restore previously selected choices when this page is reopened.
['notifications','location','overlay','battery','autostart'].forEach(kind=>{try{const v=localStorage.getItem('mahattati_permission_'+kind);if(v==='allow'||v==='deny')setDpermState(kind,v)}catch(e){}});
try{const savedLocation=localStorage.getItem('mahattati_location_allowed');if(savedLocation==='true')window.MAHATTATI_LOCATION_ALLOWED=true;else if(savedLocation==='false')window.MAHATTATI_LOCATION_ALLOWED=false}catch(e){}

[['dasTemporaryCertificate','dasTemporaryCertificateName'],['dasCriminalRecord','dasCriminalRecordName']].forEach(([inputId,nameId])=>$(inputId).addEventListener('change',e=>{const file=e.target.files&&e.target.files[0];if(file)$(nameId).textContent=file.name;}));
$('driverPartnerLogin').onclick=()=>{openDriverDashboardPage();};

$('menuBackdrop').querySelectorAll('[data-menu-action]').forEach(btn=>btn.addEventListener('click',()=>{
 const action=btn.dataset.menuAction;closeMenu();
 if(action==='city'){ $('carService').click(); }
 else if(action==='intercity'){ $('intercityService').click(); }
 else if(action==='history' || action==='notifications'){showRequestHistory();}
 else if(action==='settings'){ if(typeof window.openMahattatiAccountSettings==='function'){ window.openMahattatiAccountSettings(); setBottomNavActive('bottomNavAccount'); } else { toast(lang==='ar'?'تعذر فتح صفحة الحساب':'Impossible d’ouvrir la page du compte'); } }
 else if(action==='safety'){ if(typeof window.openMahattatiSafetyPage==='function'){window.openMahattatiSafetyPage();}else{toast('تعذر فتح صفحة السلامة');} }
 else if(action==='support' || action==='help'){ if(typeof window.openMahattatiSafetyPage==='function'){window.openMahattatiSafetyPage();}else{toast(lang==='ar'?'سيتم تفعيل هذه الصفحة لاحقًا':'Cette page sera activée prochainement');} }
 else { toast(lang==='ar'?'سيتم تفعيل هذه الصفحة في مرحلة لاحقة':'Cette page sera activée dans une prochaine étape'); }
}));
function togglePickupOptions(force){
  const menu=$('pickupOptions');
  const badge=$('pickupBadge');
  const open=typeof force==='boolean'?force:!menu.classList.contains('open');
  // Keep the options menu above the map and make its visibility explicit.
  if(open) $('pickupSearchPanel').classList.remove('open');
  menu.classList.toggle('open',open);
  menu.style.setProperty('display', open ? 'block' : 'none', 'important');
  menu.style.setProperty('visibility', open ? 'visible' : 'hidden', 'important');
  menu.style.setProperty('opacity', open ? '1' : '0', 'important');
  menu.style.setProperty('pointer-events', open ? 'auto' : 'none', 'important');
  badge.setAttribute('aria-expanded',String(open));
}
const pickupBadge=$('pickupBadge');
pickupBadge.addEventListener('click',(e)=>{
  e.preventDefault();
  e.stopPropagation();
  togglePickupOptions(!$('pickupOptions').classList.contains('open'));
});
$('pickupOptions').addEventListener('click',e=>e.stopPropagation());
$('pickupSearchPanel').addEventListener('click',e=>e.stopPropagation());
$('currentLocationOption').addEventListener('click',(e)=>{e.preventDefault();e.stopPropagation();togglePickupOptions(false);$('pickupSearchPanel').classList.remove('open');document.querySelector('.route-fields').classList.add('open');locate();});
$('choosePickupOption').addEventListener('click',(e)=>{e.preventDefault();e.stopPropagation();togglePickupOptions(false);$('pickupSearchPanel').classList.add('open');$('pickupSearchResults').innerHTML='<div class="pickup-search-status">'+(lang==='ar'?'اكتب اسم المكان للبحث عنه':'Saisissez un lieu pour le rechercher')+'</div>';setTimeout(()=>$('pickupSearchInput').focus(),0);});
$('pickupSearchBack').onclick=()=>{$('pickupSearchPanel').classList.remove('open');togglePickupOptions(true);$('pickupBadge').focus();};
let pickupSearchTimer;
async function searchPickupPlaces(){
  const q=$('pickupSearchInput').value.trim(), box=$('pickupSearchResults');
  if(q.length<2){box.innerHTML='<div class="pickup-search-status">'+(lang==='ar'?'اكتب حرفين على الأقل للبحث':'Saisissez au moins 2 caractères')+'</div>';return;}
  box.innerHTML='<div class="pickup-search-status">'+(lang==='ar'?'جارٍ البحث عن المواقع…':'Recherche des lieux…')+'</div>';
  try{
    const places=await mahattatiSearchPlaces(q,8);
    box.innerHTML='';
    if(!places.length){box.innerHTML='<div class="pickup-search-status">'+(lang==='ar'?'لم يتم العثور على نتائج. جرّب اسم البلدية أو الولاية.':'Aucun résultat. Essayez une commune ou une wilaya.')+'</div>';return;}
    places.forEach(place=>{
      const b=document.createElement('button');b.type='button';b.className='pickup-search-result';b.textContent=place.display_name||place.name||q;
      b.onclick=()=>{
        const lat=Number(place.lat),lon=Number(place.lon);if(!Number.isFinite(lat)||!Number.isFinite(lon))return;
        ++locationRequestId;const ll=L.latLng(lat,lon);
        if(pickupMarker)map.removeLayer(pickupMarker);
        if(userMarker){map.removeLayer(userMarker);userMarker=null;}
        if(accuracyCircle){map.removeLayer(accuracyCircle);accuracyCircle=null;}
        const icon=divIcon('<div class="custom-pin green"></div><span class="route-point-letter route-point-a">A</span>',[38,40],[19,25]);
        pickupMarker=L.marker(ll,{icon,title:say('pickup')}).addTo(map);map.setView(ll,16,{animate:true});
        setPickupLabel(place.display_name||place.name||q);$('mapAddress').textContent=place.name||(place.display_name||q).split(',')[0];
        drawSelectedRoute();$('pickupSearchPanel').classList.remove('open');document.querySelector('.route-fields').classList.add('open');selecting=null;
        $('modalPickupInput').value=place.display_name||place.name||q;$('modalDestInput').value=$('destInput').value||'';
        $('routeModal').classList.add('open');$('routeModal').setAttribute('aria-hidden','false');
        setTimeout(()=>$('modalDestInput').focus({preventScroll:true}),120);
        toast(lang==='ar'?'تم اختيار نقطة الانطلاق. أدخل وجهتك الآن':'Point de départ sélectionné. Choisissez la destination.');
      };box.appendChild(b);
    });
  }catch(err){box.innerHTML='<div class="pickup-search-status">'+(lang==='ar'?'تعذر الاتصال بخدمات البحث. تحقق من الإنترنت وحاول مجددًا.':'Recherche indisponible. Vérifiez Internet et réessayez.')+'</div>';}
}
$('pickupSearchInput').addEventListener('input',()=>{
  $('pickupSearchResults').innerHTML='';
});
$('pickupSearchButton').onclick=searchPickupPlaces;
$('pickupSearchInput').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();searchPickupPlaces();}});
document.addEventListener('click',e=>{if(!$('pickupOptions').contains(e.target)&&!$('pickupBadge').contains(e.target)&&!$('pickupSearchPanel').contains(e.target))togglePickupOptions(false);});
$('promoMore').onclick=()=>toast(lang==='ar'?'سيتم إضافة تفاصيل التحقق من السائقين لاحقًا':'Les détails de vérification seront ajoutés ensuite');
applyLang();setTimeout(()=>map.invalidateSize(),300);map.whenReady(()=>setTimeout(()=>map.invalidateSize(),150));window.addEventListener('resize',()=>map.invalidateSize());window.addEventListener('orientationchange',()=>setTimeout(()=>map.invalidateSize(),250));
