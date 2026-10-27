/* MAHATTATI — approved agent wallet funding.
 * Uses the authenticated agent RPC; no direct balance writes are made from the browser.
 */
(function(){
 'use strict';
 const $=id=>document.getElementById(id);
 const client=()=>window.mahattatiSupabase;
 const panel=$('agentWalletPanel'),form=$('agentFundingForm'),toggle=$('agentFundingToggle');
 const money=value=>Number(value||0).toLocaleString('fr-DZ',{maximumFractionDigits:2});
 function message(text,ok=false){
  const el=$('agentWalletMessage');if(!el)return;
  el.textContent=text;el.classList.add('show');
  el.style.background=ok?'#e9fbef':'#fff4e5';el.style.color=ok?'#176534':'#8a4b08';
 }
 async function currentUser(){
  const c=client();if(!c)throw new Error('خدمة قاعدة البيانات غير متاحة.');
  const {data,error}=await c.auth.getUser();if(error)throw error;
  if(!data.user)throw new Error('سجّل الدخول أولًا.');
  return data.user;
 }
 async function refreshBalance(){
  if(!panel||panel.hidden)return;
  try{
   const user=await currentUser(),c=client();
   const {data,error}=await c.from('agent_wallets').select('balance').eq('agent_user_id',user.id).maybeSingle();
   if(error)throw error;
   $('agentWalletBalance').textContent=money(data?.balance||0);
   return Number(data?.balance||0);
  }catch(e){message('تعذّر تحميل رصيد الوكيل: '+(e.message||'خطأ غير معروف'));return null;}
 }
 window.mahattatiRefreshAgentWalletBalance=refreshBalance;
 window.addEventListener('mahattati:merchant-application',event=>{
  const app=event.detail;
  const isAgent=!!(app&&app.status==='approved'&&['agent','وكيل','agent_partner'].includes(String(app.business_type||'').toLowerCase()));
  if(panel)panel.hidden=!isAgent;
  if(!isAgent){if(form)form.hidden=true;return;}
  refreshBalance();
 });
 if(toggle&&form)toggle.addEventListener('click',()=>{
  form.hidden=!form.hidden;
  const recharge=$('agentRechargePanel');if(recharge)recharge.hidden=true;
  if(!form.hidden){$('agentFundingAmount').focus();}
 });
 if(form)form.addEventListener('submit',async event=>{
  event.preventDefault();
  if(!form.reportValidity())return;
  const amount=Number($('agentFundingAmount').value),note=$('agentFundingNote').value.trim();
  if(!Number.isSafeInteger(amount)||amount<1||amount>100000000){message('أدخل عدد عملات صحيحًا بين 1 و100,000,000.');return;}
  const button=$('agentFundingSubmit');button.disabled=true;button.textContent='جارٍ إرسال الطلب…';
  try{
   const c=client();await currentUser();
   const {data,error}=await c.rpc('agent_request_wallet_funding',{p_amount:amount,p_note:note||null});
   if(error)throw error;
   const row=Array.isArray(data)?data[0]:data;
   if(!row||!row.reference_code)throw new Error('لم يؤكد الخادم إنشاء طلب التمويل.');
   form.reset();form.hidden=true;
   message('تم إرسال طلب التمويل بنجاح. رقم الطلب: '+row.reference_code+' — الحالة: قيد المراجعة. ستتم إضافة الرصيد بعد موافقة الإدارة.',true);
   await refreshBalance();
  }catch(e){message(e.message||'تعذّر إرسال طلب التمويل.');}
  finally{button.disabled=false;button.textContent='إرسال طلب التمويل';}
 });
})();