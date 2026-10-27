/* MAHATTATI2 map/location/route functions extracted from the legacy controller.
   This classic script is loaded immediately BEFORE legacy-main-controller.js.
   It intentionally uses shared globals created by the original controller at runtime.
   Do not convert to type=module without migrating the shared state first. */

function updateRouteSummary(distanceMeters, durationSeconds, state="ready"){
  const badge=$('routeSummaryBadge'), main=$('routeSummaryMain'), sub=$('routeSummarySub');
  if(!badge||!main||!sub)return;
  badge.hidden=false;
  badge.classList.toggle('pending',state==='pending');
  if(state==='pending'){
    main.textContent=lang==='ar'?'جارٍ حساب المسافة والوقت…':'Calcul de la distance et du temps…';
    sub.textContent='';
    return;
  }
  if(state==='error'){
    main.textContent=lang==='ar'?'تعذر حساب المسار':'Itinéraire indisponible';
    sub.textContent=lang==='ar'?'تحقق من الاتصال وحاول مجددًا':'Vérifiez la connexion puis réessayez';
    return;
  }
  const km=(distanceMeters/1000).toLocaleString(lang==='ar'?'ar-DZ':'fr-FR',{maximumFractionDigits:1});
  const minutes=Math.max(1,Math.round(durationSeconds/60));
  const hours=Math.floor(minutes/60), remainder=minutes%60;
  const timeText=hours>0
    ? (lang==='ar'?hours+' س '+(remainder?remainder+' د':''):hours+' h '+(remainder?remainder+' min':''))
    : (lang==='ar'?minutes+' دقيقة':minutes+' min');
  main.textContent=lang==='ar'?km+' كم • '+timeText:km+' km • '+timeText;
  sub.textContent=lang==='ar'?'المسافة والمدة حسب الطرق':'Distance et durée par la route';
}

async function drawSelectedRoute(){
  // A always comes from the chosen pickup marker; B from the chosen destination marker.
  // Never substitute the phone GPS position for an explicitly selected pickup.
  const start = pickupMarker ? pickupMarker.getLatLng() : null;
  const end = destMarker ? destMarker.getLatLng() : null;
  // A changed endpoint pair starts a new trip: recalculate the suggested fare unless the user edits it for this route.
  const fareRouteKey = start && end ? [start.lat,start.lng,end.lat,end.lng].map(n=>Number(n).toFixed(5)).join('|') : '';
  if (fareRouteKey !== lastFareRouteKey) { lastFareRouteKey = fareRouteKey; fareWasManuallyEdited = false; }
  const requestId = ++routeRequestId;
  if (routeLine) { map.removeLayer(routeLine); routeLine = null; }
  if (routeOutline) { map.removeLayer(routeOutline); routeOutline = null; }
  if (!start || !end) {
    if ($('routeSummaryBadge')) $('routeSummaryBadge').hidden = true;
    return;
  }
  updateRouteSummary(0, 0, 'pending');

  // Try providers sequentially for older in-app browsers and avoid parallel requests to demo servers.
  const routePath = start.lng + ',' + start.lat + ';' + end.lng + ',' + end.lat;
  const query = '?overview=full&geometries=geojson&steps=false&alternatives=false';
  const providers = [
    'https://router.project-osrm.org/route/v1/driving/' + routePath + query,
    'https://routing.openstreetmap.de/routed-car/route/v1/driving/' + routePath + query
  ];
  const fetchRoute = async (url) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);
    try {
      const response = await fetch(url, { signal: controller.signal, headers: { Accept: 'application/json' }, cache: 'no-store' });
      if (!response.ok) throw new Error('Routing service HTTP ' + response.status);
      const data = await response.json();
      if (data.code !== 'Ok' || !Array.isArray(data.routes) || !data.routes.length) throw new Error(data.message || data.code || 'No road route returned');
      const route = data.routes[0];
      const coords = route.geometry && route.geometry.coordinates;
      if (!Array.isArray(coords) || coords.length < 2 || !Number.isFinite(route.distance) || route.distance <= 0 || !Number.isFinite(route.duration) || route.duration <= 0) throw new Error('Route geometry or metrics are invalid');
      const snapDistances = (data.waypoints || []).map(point => Number(point.distance) || 0);
      // Accept OSRM's nearest routable road snap even when the point is far from a mapped street.
      const points = coords.map(pair => [pair[1], pair[0]]);
      if (points.some(pair => !Number.isFinite(pair[0]) || !Number.isFinite(pair[1]) || Math.abs(pair[0]) > 90 || Math.abs(pair[1]) > 180)) throw new Error('Invalid route coordinates');
      return { route, points, snapDistances };
    } finally { clearTimeout(timer); }
  };

  // Try public car-routing graphs in parallel. They include main and secondary mapped roads; each service snaps endpoints to its nearest routable road.
  let result = null;
  let lastRouteError = null;
  try {
    result = await Promise.any(providers.map(provider => fetchRoute(provider).catch(error => {
      lastRouteError = error;
      throw error;
    })));
  } catch (error) {
    lastRouteError = error || lastRouteError;
  }
  if (requestId !== routeRequestId) return;
  if (!result) {
    console.warn('[MAHATTATI] No reliable road route returned:', lastRouteError);
    // Do not draw a misleading straight line as if it were a road route.
    if ($('routeSummaryBadge')) $('routeSummaryBadge').hidden = true;
    const msg = lang === 'ar'
      ? 'تعذر إيجاد طريق موثوق بين A وB. بقيت النقطتان كما اخترتهما؛ جرّب تحريكهما إلى شارع قريب ثم أعد المحاولة.'
      : 'Aucun itinéraire routier fiable entre A et B. Les points restent inchangés ; rapprochez-les d’une rue puis réessayez.';
    if ($('mapNote')) { $('mapNote').textContent = msg; $('mapNote').classList.add('visible'); }
    toast(msg);
    return;
  }
  const { route, points, snapDistances } = result;
  routeOutline = L.polyline(points, {
    color: '#ffffff', weight: 11, opacity: .98,
    lineCap: 'round', lineJoin: 'round', interactive: false
  }).addTo(map);
  routeLine = L.polyline(points, {
    color: '#00D968', weight: 6, opacity: 1,
    lineCap: 'round', lineJoin: 'round', interactive: false
  }).addTo(map);
  routeOutline.bringToFront();
  routeLine.bringToFront();
  if (pickupMarker) pickupMarker.setZIndexOffset(1200);
  if (destMarker) destMarker.setZIndexOffset(1300);

  const routeBounds = routeLine.getBounds();
  if (pickupMarker) routeBounds.extend(pickupMarker.getLatLng());
  if (destMarker) routeBounds.extend(destMarker.getLatLng());
  map.fitBounds(routeBounds.pad(.22), {
    maxZoom: mode === 'intercity' ? 10 : 16,
    animate: true
  });

  updateRouteSummary(route.distance, route.duration, 'ready');
  // Calculate once for every new A-to-B route. Later manual edits stay intact until either endpoint changes.
  const currentFareRouteKey = [start.lat,start.lng,end.lat,end.lng].map(n=>Number(n).toFixed(5)).join('|');
  if (currentFareRouteKey !== lastCalculatedFareRouteKey) {
    lastCalculatedFareRouteKey = currentFareRouteKey;
    fareWasManuallyEdited = false;
  }
  if (!fareWasManuallyEdited || currentFareRouteKey !== lastCalculatedFareRouteKey) {
    const calculatedFare = Math.max(50, Math.round((route.distance / 1000 * 25) / 50) * 50);
    setProposedFare(calculatedFare);
  }
  if ($('fareRouteMeta')) $('fareRouteMeta').textContent = lang === 'ar'
    ? (route.distance / 1000).toLocaleString('ar-DZ', {maximumFractionDigits:1}) + ' كم × 25 دج للكيلومتر'
    : (route.distance / 1000).toLocaleString('fr-FR', {maximumFractionDigits:1}) + ' km × 25 DA/km';
  const km = (route.distance / 1000).toLocaleString(
    lang === 'ar' ? 'ar-DZ' : 'fr-FR', { maximumFractionDigits: 1 }
  );
  const mins = Math.max(1, Math.round(route.duration / 60));
  const warning = snapDistances.some(distance => distance > 250)
    ? (lang === 'ar'
      ? ' تنبيه: إحدى النقطتين بعيدة عن الطريق المرسوم؛ راجع موقع العلامة.'
      : ' Attention : un point est éloigné de la route cartographiée.')
    : '';
  toast(lang === 'ar'
    ? `تم رسم المسار: ${km} كم تقريبًا • ${mins} دقيقة${warning}`
    : `Itinéraire : env. ${km} km • ${mins} min${warning}`);
}

async function mahattatiSearchPlaces(query, limit=6){
  const q=String(query||'').trim();
  if(q.length<2) return [];
  const urls=[
    'https://nominatim.openstreetmap.org/search?format=jsonv2&limit='+limit+'&addressdetails=1&countrycodes=dz&accept-language='+(lang==='ar'?'ar':'fr')+'&q='+encodeURIComponent(q),
    'https://photon.komoot.io/api/?limit='+limit+'&lang='+(lang==='ar'?'en':'fr')+'&q='+encodeURIComponent(q)
  ];
  let lastError=null;
  for(const url of urls){
    const controller=new AbortController();
    const timeout=setTimeout(()=>controller.abort(),10000);
    try{
      const res=await fetch(url,{signal:controller.signal,headers:{'Accept':'application/json'},cache:'no-store'});
      if(!res.ok)throw new Error('HTTP '+res.status);
      const data=await res.json();
      let places;
      if(Array.isArray(data)) places=data;
      else if(Array.isArray(data.features)){
        places=data.features.map(f=>{
          const p=f.properties||{}, c=f.geometry&&f.geometry.coordinates||[];
          const country=String(p.country||'').toLowerCase();
          if(country && !['algeria','algérie','الجزائر'].includes(country)) return null;
          return {lat:String(c[1]),lon:String(c[0]),display_name:[p.name,p.street,p.district,p.city,p.state,p.country].filter((v,i,a)=>v&&a.indexOf(v)===i).join(', '),name:p.name||p.city||p.district||'',type:p.type||'',class:'place',addresstype:p.type||''};
        }).filter(Boolean);
      } else throw new Error('Unexpected search response');
      if(places.length)return places;
    }catch(err){lastError=err;console.warn('[MAHATTATI] Geocoding provider failed:',err);}
    finally{clearTimeout(timeout);}
  }
  throw lastError||new Error('No geocoding results');
}

async function reverseGeocode(latlng){
  // Human-readable address; coordinates remain a fallback when the service is unavailable.
  const fallback = `${latlng.lat.toFixed(5)}, ${latlng.lng.toFixed(5)}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 7000);
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(latlng.lat)}&lon=${encodeURIComponent(latlng.lng)}&zoom=18&addressdetails=1&accept-language=${lang==='ar'?'ar':'fr'}`;
    const res = await fetch(url, {signal:controller.signal,headers:{'Accept':'application/json'}});
    if(!res.ok) throw new Error('reverse geocoding unavailable');
    const data = await res.json();
    return data.name || data.address?.road || data.address?.suburb || data.address?.neighbourhood || data.address?.city || data.address?.town || data.address?.village || data.display_name || fallback;
  } catch(e) { return fallback; }
  finally { clearTimeout(timeout); }
}

async function setUser(latlng,acc=80,requestId=locationRequestId){
  if(requestId!==locationRequestId)return '';
  userLatLng=latlng;
  const icon=divIcon('<div class="custom-pin user-location"></div>',[30,34],[15,17]);
  if(userMarker) map.removeLayer(userMarker);
  userMarker=L.marker(latlng,{icon,zIndexOffset:1200,title:lang==='ar'?'موقع الهاتف الحالي':'Position actuelle du téléphone',alt:lang==='ar'?'علامة موقعك الحالي':'Current location marker',keyboard:true}).addTo(map);
  if(pickupMarker && pickupMarker!==userMarker) map.removeLayer(pickupMarker);
  pickupMarker=userMarker;
  if(accuracyCircle) map.removeLayer(accuracyCircle);
  accuracyCircle=L.circle(latlng,{radius:Math.max(acc,25),color:'#1685ff',weight:2,opacity:.9,fillColor:'#1685ff',fillOpacity:.12}).addTo(map);
  $('mapAddress').textContent=lang==='ar'?'تم تحديد الموقع؛ جارٍ جلب العنوان…':'Position détectée; recherche de l’adresse…';
  drawSelectedRoute();
  const address=await reverseGeocode(latlng);
  // A newer GPS request or a manual map selection takes priority over a late address response.
  if(requestId!==locationRequestId || pickupMarker!==userMarker)return '';
  setPickupLabel(address);
  drawSelectedRoute();
  $('mapNote').textContent=(lang==='ar'?'موقعك الحالي: ':'Votre position : ')+address;
  return address;
}

function locate(){
  if(window.MAHATTATI_LOCATION_ALLOWED===false){const msg=lang==='ar'?'تم رفض إذن الموقع. اسمح بالوصول إلى الموقع من صفحة إعداد الأذونات أولًا.':'Accès à la localisation refusé. Autorisez la localisation dans les paramètres des autorisations.';$('mapNote').textContent=msg;$('mapNote').classList.add('visible');toast(msg);return;}
  const requestId=++locationRequestId;
  if (!window.isSecureContext && location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
    const msg=lang==='ar'?'تحديد موقع الهاتف يحتاج فتح التطبيق عبر HTTPS والسماح بإذن الموقع. يمكنك تحديد نقطة الانطلاق يدويًا من الخريطة.':'La localisation nécessite HTTPS et l’autorisation du navigateur. Vous pouvez choisir le départ sur la carte.';
    $('mapAddress').textContent=lang==='ar'?'الموقع يحتاج اتصالًا آمنًا (HTTPS)':'Localisation : connexion sécurisée HTTPS requise';
    $('mapNote').textContent=msg; $('mapNote').classList.add('visible'); toast(msg); return;
  }
  if (!navigator.geolocation) {
    const msg=lang==='ar'?'هذا المتصفح لا يدعم تحديد الموقع. جرّب Chrome وفعّل GPS.':'Ce navigateur ne prend pas en charge la géolocalisation. Essayez Chrome et activez le GPS.';
    $('mapAddress').textContent=msg; $('mapNote').textContent=msg; $('mapNote').classList.add('visible'); toast(msg); return;
  }
  $('mapAddress').textContent=say('locating');
  $('mapNote').textContent=lang==='ar'?'جارٍ طلب موقع الهاتف بدقة عالية… تأكد من تفعيل GPS والسماح بالإذن.':'Recherche de la position précise du téléphone… Activez le GPS et autorisez l’accès.';
  $('mapNote').classList.add('visible');
  let finished=false;
  const finishError=(err)=>{
    if(finished||requestId!==locationRequestId)return;
    finished=true;
    let msg;
    if(err && err.code===1) msg=lang==='ar'?'إذن الموقع مرفوض. افتح إعدادات المتصفح واسمح بالوصول إلى الموقع لهذا الموقع، ثم أعد المحاولة.':'Autorisation refusée. Autorisez la localisation dans les paramètres du navigateur puis réessayez.';
    else if(err && err.code===2) msg=lang==='ar'?'الهاتف لم يتمكن من تحديد موقعه. فعّل الموقع/GPS، واخرج إلى مكان مفتوح ثم أعد المحاولة.':'Position indisponible. Activez le GPS/localisation et réessayez dans un endroit dégagé.';
    else msg=lang==='ar'?'انتهت مهلة تحديد الموقع. فعّل GPS ودقة الموقع في الهاتف، وتأكد من إذن المتصفح ثم أعد المحاولة.':'Délai dépassé. Activez le GPS et la précision de localisation, vérifiez l’autorisation puis réessayez.';
    $('mapAddress').textContent=msg; $('mapNote').textContent=msg; $('mapNote').classList.add('visible'); toast(msg);
  };
  const success=async pos=>{
    if(finished||requestId!==locationRequestId)return;
    const c=pos&&pos.coords;
    if(!c||!Number.isFinite(c.latitude)||!Number.isFinite(c.longitude)||Math.abs(c.latitude)>90||Math.abs(c.longitude)>180){finishError({code:2});return;}
    finished=true;
    const ll=L.latLng(c.latitude,c.longitude);
    // Keep the real GPS coordinate as the pickup; accuracy is shown as a circle.
    await setUser(ll,Number.isFinite(c.accuracy)&&c.accuracy>0?c.accuracy:100,requestId);
    if(requestId!==locationRequestId || pickupMarker!==userMarker)return;
    map.setView(ll,Math.min(18,Math.max(16,map.getZoom())),{animate:true});
    $('mapAddress').textContent=$('pickupInput').value;
    $('mapNote').textContent=(lang==='ar'?'موقع الهاتف الحالي • دقة GPS التقريبية: ':'Position du téléphone • précision GPS approximative : ')+(Math.round(c.accuracy||0))+' m';
    $('mapNote').classList.add('visible');
    toast(lang==='ar'?'تم تحديد موقع الهاتف الحقيقي وتعيينه كنقطة انطلاق':'Position réelle détectée et définie comme départ');
  };
  // First request prioritizes GPS accuracy. A second, less restrictive request
  // helps phones whose GPS takes longer to obtain its first fix.
  try {
    navigator.geolocation.getCurrentPosition(success,err=>{
      if(requestId!==locationRequestId||finished)return;
      if(err&&err.code===1){finishError(err);return;}
      // Fall back quickly to a cached/network location instead of waiting a long time for GPS.
      try { navigator.geolocation.getCurrentPosition(success,finishError,{enableHighAccuracy:false,timeout:10000,maximumAge:120000}); }
      catch(e) { finishError({code:2}); }
    },{enableHighAccuracy:true,timeout:10000,maximumAge:30000});
  } catch(e) { finishError({code:2}); }
}

function setSelectMode(m){selecting=m;$('mapNote').textContent=say(m==='pickup'?'pickPrompt':'destPrompt');$('mapNote').classList.add('visible');toast(say(m==='pickup'?'pickPrompt':'destPrompt'));}

async function searchDestinationPlaces(){
  const q=$('destinationSearchInput').value.trim(),box=$('destinationSearchResults');
  if(q.length<2){box.innerHTML='<div class="pickup-search-status">اكتب اسم المكان أو العنوان (حرفين على الأقل)</div>';return;}
  box.innerHTML='<div class="pickup-search-status">جارٍ البحث عن الموقع…</div>';
  try{
    const places=await mahattatiSearchPlaces(q,8);box.innerHTML='';
    if(!places.length){box.innerHTML='<div class="pickup-search-status">لم يتم العثور على المكان. جرّب اسم البلدية أو الولاية.</div>';return;}
    const localityTypes=new Set(['city','town','village','municipality','suburb','neighbourhood','quarter','hamlet']);
    const ranked=[...places].sort((a,b)=>{
      const score=p=>(localityTypes.has(String(p.type||'').toLowerCase())?5:0)+(String(p.class||'').toLowerCase()==='place'?3:0)+(String(p.addresstype||'').toLowerCase()==='city'?2:0);
      return score(b)-score(a);
    });
    ranked.forEach(place=>{
      const b=document.createElement('button');b.type='button';b.className='pickup-search-result';b.textContent=(place.display_name||place.name||q)+(place.type?' · '+String(place.type).replaceAll('_',' '):'');
      b.onclick=()=>{
        const lat=Number(place.lat),lon=Number(place.lon);if(!Number.isFinite(lat)||!Number.isFinite(lon)||Math.abs(lat)>90||Math.abs(lon)>180)return;
        const ll=L.latLng(lat,lon);if(destMarker)map.removeLayer(destMarker);
        const icon=divIcon('<div class="custom-pin red"></div><span class="route-point-letter route-point-b">B</span>',[38,40],[19,25]);
        destMarker=L.marker(ll,{icon,zIndexOffset:1300,title:say('dest')}).addTo(map);
        setDestinationLabel(place.display_name||place.name||q);$('modalDestInput').value=place.display_name||place.name||q;
        $('destinationModalSearch').classList.remove('open');$('modalDestField').classList.remove('dest-active');closeRouteModal();showTripMapPage();
        if(pickupMarker){const bounds=L.latLngBounds(pickupMarker.getLatLng(),ll).pad(.22);map.fitBounds(bounds,{maxZoom:16,animate:true});}else map.setView(ll,15,{animate:true});
        drawSelectedRoute();toast('تم تحديد نقطة الوصول B على الخريطة');
      };box.appendChild(b);
    });
  }catch(err){console.warn('[MAHATTATI] Destination search failed:',err);box.innerHTML='<div class="pickup-search-status">تعذر الاتصال بخدمات البحث. تحقق من الإنترنت وحاول مجددًا.</div>';}
}

function showTripMapPage(){document.body.classList.add('trip-page-active');const page=$('tripMapPage');page.classList.add('open');page.setAttribute('aria-hidden','false');$('tripPagePickup').textContent=$('modalPickupInput').value||$('pickupInput').value||'موقعي الحالي';$('tripPageDestination').textContent=$('modalDestInput').value||$('destInput').value||'الوجهة';setTimeout(()=>{map.invalidateSize();if(pickupMarker&&destMarker){drawSelectedRoute();}},180);}

function hideTripMapPage(){const page=$('tripMapPage');page.classList.remove('open');page.setAttribute('aria-hidden','true');document.body.classList.remove('trip-page-active');setTimeout(()=>map.invalidateSize(),80);}
