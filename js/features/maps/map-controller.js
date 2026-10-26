(function(){
 const valueEl=()=>document.getElementById('mdsDriverCodeValue');
 async function loadDriverCode(){
  const el=valueEl();if(!el)return;
  const client=window.supabaseClient||window.mahattatiSupabase||window.supabase;
  if(!client||!client.auth){el.textContent='سجّل الدخول أولًا';return;}
  try{
   const {data:{user},error:authError}=await client.auth.getUser();
   if(authError||!user){el.textContent='سجّل الدخول أولًا';return;}
   const {data,error}=await client.from('driver_applications').select('driver_code,status').eq('user_id',user.id).maybeSingle();
   if(error)throw error;
   if(!data||data.status!=='approved'){el.textContent='يظهر بعد اعتماد الحساب';return;}
   el.textContent=data.driver_code||'جارٍ إنشاء المعرّف…';
  }catch(e){el.textContent='تعذر تحميل المعرّف';}
 }
 document.addEventListener('click',e=>{if(e.target.closest('#mddSettings'))setTimeout(loadDriverCode,150);});
 document.getElementById('mdsCopyDriverCode')?.addEventListener('click',async()=>{
  const el=valueEl(),code=el?.textContent||'';
  if(!code||!/^MHD-\d{6}$/.test(code)){alert('المعرّف غير متاح بعد.');return;}
  try{await navigator.clipboard.writeText(code);alert('تم نسخ المعرّف: '+code);}catch(e){prompt('انسخ معرّفك:',code);}
 });
})();