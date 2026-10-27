/* Extracted inline script 11 from index.html; original load position preserved. */
(function(){
 'use strict';
 const $=id=>document.getElementById(id);
 const client=()=>window.mahattatiSupabase;
 const statusText={pending:'قيد المراجعة',under_review:'قيد التدقيق',approved:'مقبول',rejected:'مرفوض'};
 const typeText={store:'متجر / بيع منتجات',restaurant:'مطعم / أكل',pharmacy:'صيدلية',services:'خدمات',other:'نشاط آخر',agent:'وكيل محطتي — شحن أرصدة السائقين', 'وكيل':'وكيل محطتي — شحن أرصدة السائقين',agent_partner:'وكيل محطتي — شحن أرصدة السائقين'};
 let currentApplication=null;
 function showMessage(id,message,ok=false){const el=$(id);if(!el)return;el.textContent=message;el.classList.add('show');el.style.background=ok?'#e9fbeF':'#fff4e5';el.style.color=ok?'#176534':'#8a4b08';}
 function hideMessage(id){const el=$(id);if(el){el.textContent='';el.classList.remove('show');}}
 function openPage(id){closeMenuSafe();$('merchantPortal').classList.remove('open');$('merchantAdminPortal').classList.remove('open');const el=$(id);el.classList.add('open');el.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';}
 function closePage(id){const el=$(id);el.classList.remove('open');el.setAttribute('aria-hidden','true');document.body.style.overflow='';}
 function closeMenuSafe(){if(typeof closeMenu==='function')closeMenu();}
 async function getUser(promptLogin=true){const c=client();if(!c)throw new Error('خدمة قاعدة البيانات غير متاحة.');const {data,error}=await c.auth.getUser();if(error)throw error;if(!data.user){if(promptLogin&&typeof window.mahattatiOpenAuth==='function')window.mahattatiOpenAuth();throw new Error('سجّل الدخول أولًا ثم أعد المحاولة.');}return data.user;}
 async function getApplication(user){const c=client();const {data,error}=await c.from('merchant_applications').select('id,user_id,business_name,owner_name,phone,email,business_type,wilaya,address,description,status,reviewer_note,submitted_at,reviewed_at').eq('user_id',user.id).maybeSingle();if(error)throw error;return data;}
 function renderApplication(app){
  currentApplication=app;
  $('merchantApplicationForm').hidden=!!app;
  $('merchantApprovedDashboard').hidden=!(app&&app.status==='approved');
  const isAgent=!!(app&&app.status==='approved'&&['agent','وكيل','agent_partner'].includes(String(app.business_type||'').toLowerCase()));
  const agentPanel=$('agentWalletPanel'),refreshButton=$('merchantRefreshStatus');
  if(agentPanel)agentPanel.hidden=!isAgent;
  if(refreshButton)refreshButton.hidden=isAgent;
  if(!app){
   $('merchantApplicationForm').hidden=false;
   window.dispatchEvent(new CustomEvent('mahattati:merchant-application',{detail:null}));
   return;
  }
  if(app.status==='approved'){
   $('merchantApprovedDashboard').hidden=false;
   $('merchantDashboardBusinessName').textContent=app.business_name||'النشاط التجاري';
   $('merchantBusinessTypeLabel').textContent=typeText[app.business_type]||app.business_type||'نشاط تجاري';
   $('merchantDashboardBusinessDetails').textContent=[app.owner_name,app.phone,app.wilaya,app.address].filter(Boolean).join(' · ');
   showMessage('merchantPortalMessage',isAgent?'حسابك معتمد. يمكنك الآن تمويل محفظتك أو شحن أرصدة السائقين.':'حسابك مقبول. تم ربطه بواجهة التاجر.',true);
  }else{
   $('merchantApprovedDashboard').hidden=true;$('merchantApplicationForm').hidden=true;
   const note=app.reviewer_note?' ملاحظة الإدارة: '+app.reviewer_note:'';
   showMessage('merchantPortalMessage','حالة طلبك: '+(statusText[app.status]||app.status)+'. '+(app.status==='rejected'?'تواصل مع الدعم لتصحيح البيانات قبل إعادة التقديم.':'ستظهر واجهة التاجر بعد الموافقة.')+note);
  }
  window.dispatchEvent(new CustomEvent('mahattati:merchant-application',{detail:app}));
 }
 async function openMerchant(){
  openPage('merchantPortal');hideMessage('merchantPortalMessage');$('merchantApplicationForm').hidden=true;$('merchantApprovedDashboard').hidden=true;
  try{
   const user=await getUser();const app=await getApplication(user);
   if(app){renderApplication(app);return;}
   currentApplication=null;$('merchantApplicationForm').reset();$('merchantOwnerName').value=user.user_metadata?.full_name||user.user_metadata?.name||'';
   $('merchantApplicationForm').hidden=false;
  }catch(e){showMessage('merchantPortalMessage',e.message||'تعذر تحميل طلب التاجر.');}
 }
 $('menuMerchant').addEventListener('click',openMerchant);
 $('merchantPortalBack').addEventListener('click',()=>closePage('merchantPortal'));
 $('merchantRefreshStatus').addEventListener('click',openMerchant);
 $('merchantApplicationForm').addEventListener('submit',async e=>{
  e.preventDefault();const button=$('merchantSubmit');if(!e.currentTarget.reportValidity())return;
  button.disabled=true;button.textContent='جارٍ إرسال الطلب…';hideMessage('merchantPortalMessage');
  try{
   const user=await getUser();const c=client();const existing=await getApplication(user);
   if(existing){renderApplication(existing);showMessage('merchantPortalMessage','يوجد طلب سابق لهذا الحساب. لا يمكن إرسال طلب مكرر.');return;}
   const payload={user_id:user.id,business_name:$('merchantBusinessName').value.trim(),owner_name:$('merchantOwnerName').value.trim(),phone:$('merchantPhone').value.trim(),email:user.email||'',business_type:$('merchantBusinessType').value,wilaya:$('merchantWilaya').value.trim(),address:$('merchantAddress').value.trim(),description:$('merchantDescription').value.trim()||null,status:'pending'};
   const {data,error}=await c.from('merchant_applications').insert(payload).select('id,user_id,business_name,owner_name,phone,email,business_type,wilaya,address,description,status,reviewer_note,submitted_at,reviewed_at').single();
   if(error)throw error;renderApplication(data);showMessage('merchantPortalMessage','تم إرسال طلبك بنجاح، وهو الآن قيد المراجعة.',true);
  }catch(e){showMessage('merchantPortalMessage',e.message||'تعذر إرسال الطلب. تحقق من الاتصال والصلاحيات.');}
  finally{button.disabled=false;button.textContent='إرسال طلب التسجيل';}
 });
 async function assertStaff(){
  const user=await getUser(false);const c=client();
  const {data,error}=await c.from('staff_members').select('staff_role').ilike('email',user.email||'').maybeSingle();
  if(error)throw error;if(!data||!['admin','staff'].includes(data.staff_role))throw new Error('هذا القسم مخصص لحسابات الإدارة المخولة فقط.');
  return {user,role:data.staff_role};
 }
 async function refreshAdminMessage(message,ok){showMessage('merchantAdminMessage',message,ok);}
 async function loadMerchantApplications(){
  hideMessage('merchantAdminMessage');const list=$('merchantAdminList');list.textContent='جارٍ تحميل الطلبات…';
  try{
   await assertStaff();const c=client();const {data,error}=await c.from('merchant_applications').select('id,user_id,business_name,owner_name,phone,email,business_type,wilaya,address,description,status,reviewer_note,submitted_at').order('submitted_at',{ascending:false});
   if(error)throw error;
   list.replaceChildren();
   if(!data||!data.length){list.textContent='لا توجد طلبات تجار أو وكلاء حتى الآن.';} const agentApps=data.filter(app=>app.business_type==='agent'); const otherApps=data.filter(app=>app.business_type!=='agent'); if(agentApps.length){const heading=document.createElement('h2');heading.textContent='طلبات وكلاء محطتي';heading.style.cssText='margin:8px 0 14px;color:#176534';list.appendChild(heading);} data=[...agentApps,...otherApps];
   data.forEach(app=>{
    const card=document.createElement('article');card.className='merchant-app-card';
    const title=document.createElement('h3');title.textContent=(app.business_type==='agent'?'طلب وكيل محطتي — ':'')+(app.business_name||'نشاط دون اسم');card.appendChild(title);
    const meta=document.createElement('div');meta.className='merchant-app-meta';meta.textContent=['الحالة: '+(statusText[app.status]||app.status),'صاحب النشاط: '+(app.owner_name||'—'),'الهاتف: '+(app.phone||'—'),'البريد: '+(app.email||'—'),'النوع: '+(app.business_type==='agent'?'وكيل تعبئة':(typeText[app.business_type]||app.business_type||'—')),'الولاية: '+(app.wilaya||'—'),'العنوان: '+(app.address||'—'),'الوصف: '+(app.description||'—'),'تاريخ الطلب: '+(app.submitted_at?new Date(app.submitted_at).toLocaleString('ar-DZ'):'—'),app.reviewer_note?'ملاحظة سابقة: '+app.reviewer_note:''].join('\n');card.appendChild(meta);
    const note=document.createElement('textarea');note.className='merchant-review-note';note.maxLength=700;note.placeholder='ملاحظة الإدارة (اختياري)';note.value=app.reviewer_note||'';note.setAttribute('aria-label','ملاحظة الإدارة');card.appendChild(note);
    const actions=document.createElement('div');actions.className='merchant-admin-actions';
    const approve=document.createElement('button');approve.type='button';approve.className='merchant-approve';approve.textContent='قبول وتفعيل';
    const pending=document.createElement('button');pending.type='button';pending.className='merchant-secondary';pending.textContent='قيد التدقيق';
    const reject=document.createElement('button');reject.type='button';reject.className='merchant-reject';reject.textContent='رفض الطلب';
    async function updateStatus(status,button){button.disabled=true;try{await assertStaff();const {data,error}=await client().rpc('review_merchant_application',{p_application_id:app.id,p_status:status,p_note:note.value.trim()||null});if(error)throw error;if(!data||data.status!==status)throw new Error('لم يؤكد الخادم تحديث حالة الطلب.');await loadMerchantApplications();showMessage('merchantAdminMessage','تم تحديث حالة الطلب إلى: '+(statusText[status]||status)+(status==='approved'?'، وتم تفعيل دور التاجر في الحساب.':''),true);}catch(e){showMessage('merchantAdminMessage',e.message||'تعذر تحديث الطلب.');button.disabled=false;}}
    approve.addEventListener('click',()=>updateStatus('approved',approve));pending.addEventListener('click',()=>updateStatus('under_review',pending));reject.addEventListener('click',()=>updateStatus('rejected',reject));
    if(app.business_type==='agent'&&app.status==='approved'){
     const fund=document.createElement('button');fund.type='button';fund.className='merchant-approve';fund.textContent='تمويل محفظة الوكيل بالعملات';fund.style.cssText='width:100%;margin-top:10px;background:#0b8f52;color:#fff';
     fund.addEventListener('click',async()=>{
      const raw=prompt('أدخل عدد العملات التي تريد إضافتها إلى محفظة هذا الوكيل. هذه العملية تسجّل تمويلاً من الإدارة.');
      if(raw===null)return;
      const amount=Number(raw.trim());
      if(!Number.isSafeInteger(amount)||amount<1){showMessage('merchantAdminMessage','أدخل عدد عملات صحيحًا أكبر من صفر.');return;}
      if(!confirm('تأكيد إضافة '+amount.toLocaleString('fr-DZ')+' عملة إلى محفظة '+(app.owner_name||app.business_name)+'؟'))return;
      fund.disabled=true;fund.textContent='جارٍ تمويل المحفظة…';
      try{
       await assertStaff();
       const {data,error}=await client().rpc('admin_fund_agent_wallet',{p_agent_user_id:app.user_id,p_amount:amount});
       if(error)throw error;
       const result=Array.isArray(data)?data[0]:data;
       if(!result||!result.reference_code)throw new Error('لم يؤكد الخادم عملية التمويل.');
       showMessage('merchantAdminMessage','تم تمويل المحفظة بنجاح. رقم العملية: '+result.reference_code+' · الرصيد الجديد: '+Number(result.new_agent_balance).toLocaleString('fr-DZ')+' عملة.',true);
       await loadMerchantApplications();
      }catch(e){showMessage('merchantAdminMessage',e.message||'تعذر تمويل محفظة الوكيل.');fund.disabled=false;fund.textContent='تمويل محفظة الوكيل بالعملات';}
     });
     card.appendChild(fund);
    }
    actions.append(approve,pending,reject);card.appendChild(actions);list.appendChild(card);
   });
   
  }catch(e){list.textContent='';showMessage('merchantAdminMessage',e.message||'تعذر تحميل طلبات التجار.');} await loadAgentFundingRequests(list);
 }
 async function loadAgentFundingRequests(list){
  const wrap=document.createElement('section');wrap.style.cssText='margin:24px 0;padding:18px;border:1px solid #d7eadf;border-radius:18px;background:#f7fff9';const title=document.createElement('h3');title.textContent='طلبات تمويل رصيد الوكلاء';title.style.cssText='margin:0 0 14px;font-size:19px';wrap.appendChild(title);const body=document.createElement('div');body.textContent='جارٍ تحميل الطلبات…';wrap.appendChild(body);list.appendChild(wrap);
  try{const {data,error}=await client().rpc('admin_list_agent_wallet_funding_requests');if(error)throw error;body.textContent='';if(!data||!data.length){body.textContent='لا توجد طلبات تمويل حتى الآن.';return;}data.forEach(req=>{const card=document.createElement('article');card.style.cssText='background:white;border:1px solid #e1eee5;border-radius:14px;padding:14px;margin:10px 0';const details=document.createElement('div');details.style.cssText='white-space:pre-line;line-height:1.8';details.textContent=['رقم الطلب: '+req.reference_code,'الوكيل: '+(req.owner_name||req.business_name||req.agent_user_id),'الهاتف: '+(req.phone||'—'),'المبلغ المطلوب: '+Number(req.requested_amount).toLocaleString('fr-DZ')+' عملة','الحالة: '+({pending:'قيد المراجعة',approved:'تمت الموافقة',rejected:'مرفوض'}[req.status]||req.status),'تاريخ الطلب: '+new Date(req.created_at).toLocaleString('ar-DZ'),req.note?'ملاحظة الوكيل: '+req.note:''].filter(Boolean).join('\n');card.appendChild(details);
   if(req.status==='pending'){const note=document.createElement('input');note.type='text';note.maxLength=500;note.placeholder='ملاحظة الإدارة (اختياري)';note.style.cssText='width:100%;box-sizing:border-box;margin:12px 0;padding:11px;border:1px solid #ddd;border-radius:10px;font:inherit';card.appendChild(note);const actions=document.createElement('div');actions.style.cssText='display:flex;gap:8px';const approve=document.createElement('button');approve.type='button';approve.textContent='موافقة وتمويل';approve.style.cssText='flex:1;padding:12px;border:0;border-radius:10px;background:#0b8f52;color:white;font:inherit;font-weight:800';const reject=document.createElement('button');reject.type='button';reject.textContent='رفض الطلب';reject.style.cssText='flex:1;padding:12px;border:0;border-radius:10px;background:#fff0f0;color:#b42318;border:1px solid #f2cccc;font:inherit;font-weight:800';async function review(status,btn){if(!confirm(status==='approved'?'تأكيد الموافقة وإضافة '+Number(req.requested_amount).toLocaleString('fr-DZ')+' عملة إلى محفظة الوكيل؟':'هل تريد رفض طلب التمويل؟'))return;approve.disabled=reject.disabled=true;btn.textContent='جارٍ المعالجة…';try{await assertStaff();const {data,error}=await client().rpc('admin_review_agent_wallet_funding_request',{p_request_id:req.id,p_status:status,p_note:note.value.trim()||null});if(error)throw error;const result=Array.isArray(data)?data[0]:data;if(!result)throw new Error('لم يؤكد الخادم معالجة الطلب');showMessage('merchantAdminMessage',status==='approved'?'تمت الموافقة وتمويل المحفظة. رقم التمويل: '+result.funding_reference+' · الرصيد الجديد: '+Number(result.new_agent_balance).toLocaleString('fr-DZ')+' عملة.':'تم رفض طلب التمويل.',true);await loadMerchantApplications();}catch(e){showMessage('merchantAdminMessage',e.message||'تعذرت معالجة الطلب.');approve.disabled=reject.disabled=false;btn.textContent=status==='approved'?'موافقة وتمويل':'رفض الطلب';}}approve.addEventListener('click',()=>review('approved',approve));reject.addEventListener('click',()=>review('rejected',reject));actions.append(approve,reject);card.appendChild(actions);}body.appendChild(card);});}catch(e){body.textContent='تعذر تحميل طلبات التمويل: '+(e.message||'خطأ غير معروف');}
 }
 $('menuMerchantAdmin').addEventListener('click',async()=>{openPage('merchantAdminPortal');await loadMerchantApplications();});
 $('merchantAdminBack').addEventListener('click',()=>closePage('merchantAdminPortal'));
 $('merchantAdminRefresh').addEventListener('click',loadMerchantApplications);
 async function refreshStaffShortcut(){
  const button=$('menuMerchantAdmin');button.hidden=true;
  try{await assertStaff();button.hidden=false;}catch(_){button.hidden=true;}
 }
 const c=client();if(c&&c.auth&&c.auth.onAuthStateChange)c.auth.onAuthStateChange(()=>{setTimeout(refreshStaffShortcut,0);});
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshStaffShortcut();});
 setTimeout(refreshStaffShortcut,900);
 document.addEventListener('keydown',e=>{if(e.key==='Escape'){if($('merchantPortal').classList.contains('open'))closePage('merchantPortal');if($('merchantAdminPortal').classList.contains('open'))closePage('merchantAdminPortal');}});
})();
