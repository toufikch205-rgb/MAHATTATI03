/* Extracted inline script 14 from index.html; original load position preserved. */
(function(){
  let requestMap=null, requestTiles=null, pickupPin=null, destinationPin=null, routeLayer=null;
  const ORAN=[35.6971,-0.6308];
  function makeIcon(letter,color){return L.divIcon({className:'mdd-osm-marker',html:'<div style="width:32px;height:32px;border:3px solid #fff;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:'+color+';box-shadow:0 2px 8px #0005;display:flex;align-items:center;justify-content:center"><span style="transform:rotate(45deg);color:#fff;font:bold 13px system-ui">'+letter+'</span></div>',iconSize:[32,32],iconAnchor:[16,30]});}
  function initRequestMap(){
    const el=document.getElementById('mddRequestLeafletMap'); if(!el||!window.L)return;
    if(!requestMap){
      requestMap=L.map(el,{zoomControl:false,scrollWheelZoom:true,attributionControl:true}).setView(ORAN,14);
      requestTiles=L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap contributors</a>',crossOrigin:true,updateWhenIdle:false,keepBuffer:2});
      let requestTileErrors=0, requestFallbackUsed=false;
      requestTiles.on('tileload',function(){requestTileErrors=0;const box=document.getElementById('mddRequestLeafletMap');box?.querySelector('.mdd-tile-error')?.remove();});
      requestTiles.on('tileerror',function(){requestTileErrors++;if(requestTileErrors>=3&&!requestFallbackUsed){requestFallbackUsed=true;requestMap.removeLayer(requestTiles);requestTiles=L.tileLayer('https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',{maxZoom:20,attribution:'© OpenStreetMap contributors | © CARTO',crossOrigin:true}).addTo(requestMap);requestTiles.on('tileerror',function(){const box=document.getElementById('mddRequestLeafletMap');if(box&&!box.querySelector('.mdd-tile-error')){const note=document.createElement('div');note.className='mdd-tile-error';note.textContent='تعذر تحميل الخريطة من مصادر الخرائط. تحقق من الإنترنت وأعد المحاولة.';note.style.cssText='position:absolute;z-index:1000;top:10px;left:10px;right:10px;padding:8px 10px;background:#fff;color:#334;border-radius:10px;font:12px system-ui;box-shadow:0 2px 8px #0002';box.appendChild(note);}});}});
      requestTiles.addTo(requestMap);
      let routeRequestId=0;
      async function drawRoadRoute(){
        if(!pickupPin||!destinationPin||!requestMap)return;
        const start=pickupPin.getLatLng(),end=destinationPin.getLatLng();
        const requestId=++routeRequestId;
        const box=document.getElementById('mddRequestLeafletMap');
        let note=box&&box.querySelector('.mdd-route-status');
        if(box&&!note){note=document.createElement('div');note.className='mdd-route-status';note.style.cssText='position:absolute;z-index:1000;top:10px;left:10px;right:10px;padding:8px 10px;background:#fff;color:#334;border-radius:10px;font:12px system-ui;box-shadow:0 2px 8px #0002;text-align:center;pointer-events:none';box.appendChild(note)}
        if(note)note.textContent='جارٍ حساب المسار عبر الطرق…';
        if(routeLayer){requestMap.removeLayer(routeLayer);routeLayer=null;}
        const path=start.lng+','+start.lat+';'+end.lng+','+end.lat;
        const providers=[
          'https://router.project-osrm.org/route/v1/driving/'+path+'?overview=full&geometries=geojson&steps=false&alternatives=false',
          'https://routing.openstreetmap.de/routed-car/route/v1/driving/'+path+'?overview=full&geometries=geojson&steps=false&alternatives=false'
        ];
        const fetchRoute=async url=>{
          const controller=new AbortController();
          const timer=setTimeout(()=>controller.abort(),10000);
          try{
            const response=await fetch(url,{signal:controller.signal,headers:{'Accept':'application/json'},cache:'no-store'});
            if(!response.ok)throw new Error('HTTP '+response.status);
            const data=await response.json();
            if(data.code!=='Ok'||!Array.isArray(data.routes)||!data.routes.length)throw new Error('No route');
            const route=data.routes[0],coords=route.geometry&&route.geometry.coordinates;
            if(!Array.isArray(coords)||coords.length<2||!Number.isFinite(route.distance)||route.distance<=0||!Number.isFinite(route.duration)||route.duration<=0)throw new Error('Invalid route');
            const roadPoints=coords.map(c=>[c[1],c[0]]);
            if(roadPoints.some(p=>!Number.isFinite(p[0])||!Number.isFinite(p[1])||Math.abs(p[0])>90||Math.abs(p[1])>180))throw new Error('Invalid coordinates');
            return roadPoints;
          }finally{clearTimeout(timer);}
        };
        try{
          const roadPoints=await Promise.any(providers.map(url=>fetchRoute(url)));
          if(requestId!==routeRequestId)return;
          routeLayer=L.polyline(roadPoints,{color:'#00bd69',weight:6,opacity:.95,lineCap:'round',lineJoin:'round'}).addTo(requestMap);
          requestMap.fitBounds(routeLayer.getBounds().pad(.14),{maxZoom:16});
          if(note)note.textContent='تم رسم المسار عبر الطرق';
          if(note)setTimeout(()=>{if(note&&note.isConnected&&requestId===routeRequestId)note.remove()},2500);
        }catch(err){
          if(requestId!==routeRequestId)return;
          if(note)note.textContent='تعذر إيجاد طريق عبر الخدمات المتاحة. تحقق من الإنترنت وجرّب تحريك إحدى النقطتين إلى شارع قريب.';
          if(routeLayer){requestMap.removeLayer(routeLayer);routeLayer=null;}
          console.warn('[MAHATTATI request map] Routing failed:',err);
        }
      }
      function refreshRoute(){if(pickupPin&&destinationPin)drawRoadRoute();}
      requestMap.on('click',function(e){
        if(!pickupPin){pickupPin=L.marker(e.latlng,{icon:makeIcon('A','#00bd69'),draggable:true}).addTo(requestMap).bindPopup('نقطة الانطلاق A');pickupPin.on('dragend',refreshRoute);}
        else if(!destinationPin){destinationPin=L.marker(e.latlng,{icon:makeIcon('B','#e64a33'),draggable:true}).addTo(requestMap).bindPopup('نقطة النهاية B');destinationPin.on('dragend',refreshRoute);}
        else{destinationPin.setLatLng(e.latlng);}
        if(pickupPin&&destinationPin)drawRoadRoute();
      });
    }
    requestAnimationFrame(()=>{try{requestMap.invalidateSize({pan:false});requestTiles.redraw();}catch(e){}});
    setTimeout(()=>{try{requestMap.invalidateSize({pan:false});}catch(e){}},250);
  }
  // Keep the home map in its own container; never move it into the driver request page.
  window.mddMountRealMapIndependent=initRequestMap;window.mddMountRealHomeMapInRequest=initRequestMap;
  window.mddRestoreRealHomeMap=function(){try{if(window.map)window.map.invalidateSize({pan:false});}catch(e){}};
  document.addEventListener('click',function(e){if(e.target.closest('#driverDashboardPage .mdd-view'))setTimeout(initRequestMap,80);},true);
  window.addEventListener('resize',function(){if(requestMap&&document.getElementById('mddRideRequestPage')?.classList.contains('open'))requestMap.invalidateSize({pan:false});});
  document.addEventListener('visibilitychange',function(){if(!document.hidden&&requestMap)requestMap.invalidateSize({pan:false});});
  window.addEventListener('load',initRequestMap);
  const page=document.getElementById('mddRideRequestPage');
  if(page&&window.MutationObserver){new MutationObserver(()=>{if(page.classList.contains('open')){initRequestMap();setTimeout(()=>{try{requestMap&&requestMap.invalidateSize({pan:false});}catch(e){}},180);}}).observe(page,{attributes:true,attributeFilter:['class','style']});}
})();
