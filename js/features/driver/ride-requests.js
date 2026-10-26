(function(){
 'use strict';
 const $=id=>document.getElementById(id);
 const statusText={pending:'قيد المراجعة',under_review:'قيد التدقيق',approved:'مقبول',rejected:'مرفوض'};
 const roleAllowed=['admin','reviewer','staff'];
 const client=()=>window.mahattatiSupabase;
 function message(text,ok=false){const el=$('driverAdminMessage');if(!el)return;el.textContent=text;el.classList.add('show');el.style.background=ok?'#e9fbef':'#fff4e5';el.style.color=ok?'#176534':'#8a4b08';}
 function hideMessage(){const el=$('driverAdminMessage');if(el){el.textContent='';el.classList.remove('show');}}
 function openPortal(){if(typeof closeMenu==='function')closeMenu();$('driverAdminPortal').classList.add('open');$('driverAdminPortal').setAttribute('aria-hidden','false');document.body.style.overflow='hidden';}
 function closePortal(){const p=$('driverAdminPortal');p.classList.remove('open');p.setAttribute('aria-hidden','true');document.body.style.overflow='';}
 async function assertStaff(){
  const c=client();if(!c)throw new Error('خدمة قاعدة البيانات غير متاحة.');
  const {data:{user},error}=await c.auth.getUser();if(error)throw error;
  if(!user)throw new Error('سجّل الدخول بحساب الإدارة أولًا.');
  const {data,error:staffError}=await c.from('staff_members').select('staff_role').ilike('email',user.email||'').maybeSingle();
  if(staffError)throw staffError;
  if(!data||!roleAllowed.includes(data.staff_role))throw new Error('هذا القسم مخصص لحسابات الإدارة المخولة فقط.');
  return {user,role:data.staff_role};
 }
 function node(tag,cls,text){const el=document.createElement(tag);if(cls)el.className=cls;if(text!==undefined)el.textContent=text;return el;}
 function renderCard(app,container){
  const card=node('article','merchant-app-card');
  card.appendChild(node('h3','',app.full_name||app.email||'طلب سائق'));
  const meta=node('div','merchant-app-meta',[
   'الحالة: '+(statusText[app.status]||app.status||'غير محددة'),
   'الاسم: '+([app.full_name,app.surname].filter(Boolean).join(' ')||'—'),
   'الهاتف: '+(app.phone||'—'),
   'البريد: '+(app.email||'—'),
   'المركبة: '+([app.vehicle_make,app.vehicle_model].filter(Boolean).join(' ')||'—'),
   'اللون: '+(app.vehicle_color||'—'),
   'سنة الصنع: '+(app.vehicle_year||'—'),
   'رقم اللوحة: '+(app.vehicle_plate||'—'),
   'تاريخ الإرسال: '+(app.submitted_at?new Date(app.submitted_at).toLocaleString('ar-DZ'):'—'),
   'تاريخ المراجعة: '+(app.reviewed_at?new Date(app.reviewed_at).toLocaleString('ar-DZ'):'—'),
   app.reviewer_note?'ملاحظة سابقة: '+app.reviewer_note:''
  ].filter(Boolean).join('\n'));
  card.appendChild(meta);
  const note=node('textarea','merchant-review-note');note.maxLength=700;note.placeholder='ملاحظة الإدارة (اختياري)';note.value=app.reviewer_note||'';note.setAttribute('aria-label','ملاحظة الإدارة');card.appendChild(note);
  const actions=node('div','merchant-admin-actions');
  async function updateStatus(status,button){
   button.disabled=true;
   try{
    await assertStaff();
    const {data,error}=await client().rpc('review_driver_application',{p_application_id:app.id,p_status:status,p_note:note.value.trim()||null});
    if(error)throw error;
    if(!data||data.status!==status)throw new Error('لم يؤكد الخادم تغيير حالة طلب السائق.');
    if(status==='approved'&&data.account_activated!==true)throw new Error('تم تحديث الحالة لكن الخادم لم يؤكد تفعيل حساب السائق.');
    await loadApplications();
    message(status==='approved'?'تم قبول السائق ونقله إلى قائمة المقبولين وتفعيل صلاحية حساب السائق.':status==='rejected'?'تم رفض طلب السائق.':'تم تحديث حالة الطلب إلى: '+(statusText[status]||status),true);
   }catch(e){message(e.message||'تعذر تحديث طلب السائق.');button.disabled=false;}
  }
  if(app.status!=='approved'){
   const approve=node('button','merchant-approve','قبول السائق وتفعيل الحساب');
   const review=node('button','merchant-secondary','قيد التدقيق');
   const reject=node('button','merchant-reject','رفض الطلب');
   approve.type=review.type=reject.type='button';
   approve.addEventListener('click',()=>updateStatus('approved',approve));
   review.addEventListener('click',()=>updateStatus('under_review',review));
   reject.addEventListener('click',()=>updateStatus('rejected',reject));
   actions.append(approve,review,reject);card.appendChild(actions);
  }else{
   card.appendChild(node('p','merchant-status','هذا السائق مقبول، ويجب أن يتمكن من دخول حساب السائق.'));
   const revoke=node('button','merchant-reject','إلغاء الاعتماد');
   revoke.type='button';revoke.addEventListener('click',()=>updateStatus('rejected',revoke));actions.appendChild(revoke);card.appendChild(actions);
  }
  container.appendChild(card);
 }
 async function loadApplications(){
  hideMessage();
  const pending=$('driverAdminPendingList'),approved=$('driverAdminApprovedList'),other=$('driverAdminOtherList');
  [pending,approved,other].forEach(el=>el.replaceChildren(node('p','merchant-app-meta','جارٍ تحميل الطلبات…')));
  try{
   await assertStaff();
   const {data,error}=await client().from('driver_applications')
    .select('id,user_id,full_name,surname,phone,email,vehicle_make,vehicle_model,vehicle_color,vehicle_year,vehicle_plate,status,reviewer_note,submitted_at,reviewed_at')
    .order('submitted_at',{ascending:false});
   if(error)throw error;
   [pending,approved,other].forEach(el=>el.replaceChildren());
   const rows=data||[];
   const groups=[
    {el:pending,items:rows.filter(x=>['pending','under_review'].includes(x.status)),empty:'لا توجد طلبات تنتظر القرار.'},
    {el:approved,items:rows.filter(x=>x.status==='approved'),empty:'لا يوجد سائقون مقبولون بعد.'},
    {el:other,items:rows.filter(x=>!['pending','under_review','approved'].includes(x.status)),empty:'لا توجد طلبات مرفوضة أو حالات أخرى.'}
   ];
   groups.forEach(g=>{if(!g.items.length)g.el.appendChild(node('p','merchant-app-meta',g.empty));else g.items.forEach(app=>renderCard(app,g.el));});
   message('تم تحميل '+rows.length+' طلب سائق.',true);
  }catch(e){
   [pending,approved,other].forEach(el=>el.replaceChildren());
   message(e.message||'تعذر تحميل طلبات السائقين. تحقق من صلاحيات قاعدة البيانات.');
  }
 }
 $('menuDriverAdmin').addEventListener('click',async()=>{openPortal();await loadApplications();});
 $('driverAdminBack').addEventListener('click',closePortal);
 $('driverAdminRefresh').addEventListener('click',loadApplications);
 async function refreshShortcut(){
  const button=$('menuDriverAdmin');button.hidden=true;
  try{await assertStaff();button.hidden=false;}catch(_){button.hidden=true;}
 }
 const c=client();if(c&&c.auth&&c.auth.onAuthStateChange)c.auth.onAuthStateChange(()=>setTimeout(refreshShortcut,0));
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshShortcut();});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&$('driverAdminPortal').classList.contains('open'))closePortal();});
 setTimeout(refreshShortcut,1100);
})();