/* MAHATTATI — secure recharge of approved driver wallets by an approved agent.
 * All wallet changes are performed by the database RPC, never by client-side balance updates.
 */
(function(){
 'use strict';
 const $=id=>document.getElementById(id);
 const client=()=>window.mahattatiSupabase;
 let selectedDriver=null,activeAgent=false;
 const money=value=>Number(value||0).toLocaleString('fr-DZ',{maximumFractionDigits:2});
 function message(text,ok=false){
  const el=$('agentWalletMessage');if(!el)return;
  el.textContent=text;el.classList.add('show');
  el.style.background=ok?'#e9fbef':'#fff4e5';el.style.color=ok?'#176534':'#8a4b08';
 }
 function clearSelection(){
  selectedDriver=null;
  const selected=$('agentSelectedDriver');if(selected){selected.hidden=true;selected.replaceChildren();}
  const form=$('agentRechargeForm');if(form){form.hidden=true;form.reset();}
  const receipt=$('agentRechargeReceipt');if(receipt){receipt.hidden=true;receipt.textContent='';}
 }
 async function currentUser(){
  const c=client();if(!c)throw new Error('خدمة قاعدة البيانات غير متاحة.');
  const {data,error}=await c.auth.getUser();if(error)throw error;
  if(!data.user)throw new Error('سجّل الدخول أولًا.');
  return data.user;
 }
 function chooseDriver(driver){
  selectedDriver=driver;
  const selected=$('agentSelectedDriver');selected.replaceChildren();selected.hidden=false;
  const title=document.createElement('strong');title.textContent='السائق المحدد: '+[driver.full_name,driver.surname].filter(Boolean).join(' ');
  const details=document.createElement('p');details.textContent='رمز الشريك: '+(driver.driver_code||'غير متوفر')+' · الهاتف: '+(driver.phone||'غير متوفر');
  selected.append(title,details);
  $('agentRechargeForm').hidden=false;
  $('agentRechargeAmount').focus();
  $('agentDriverResults').replaceChildren();
  const receipt=$('agentRechargeReceipt');receipt.hidden=true;receipt.textContent='';
 }
 async function findDrivers(){
  const term=$('agentDriverSearch').value.trim();
  if(term.length<3){message('أدخل رمز السائق أو رقم الهاتف (3 أحرف على الأقل).');return;}
  const button=$('agentFindDriver');button.disabled=true;button.textContent='جارٍ البحث…';
  const results=$('agentDriverResults');results.replaceChildren();clearSelection();
  try{
   await currentUser();
   const {data,error}=await client().rpc('agent_find_approved_driver',{p_search:term});
   if(error)throw error;
   const rows=Array.isArray(data)?data:(data?[data]:[]);
   if(!rows.length){results.textContent='لم يتم العثور على سائق معتمد يطابق البحث.';return;}
   rows.forEach(driver=>{
    const card=document.createElement('article');
    card.style.cssText='border:1px solid #d7eadf;border-radius:12px;padding:12px;margin:8px 0;background:#fff';
    const title=document.createElement('strong');title.textContent=[driver.full_name,driver.surname].filter(Boolean).join(' ')||'سائق معتمد';
    const details=document.createElement('p');details.style.cssText='margin:6px 0 10px;color:#526158';details.textContent='رمز الشريك: '+(driver.driver_code||'غير متوفر')+' · الهاتف: '+(driver.phone||'غير متوفر');
    const pick=document.createElement('button');pick.type='button';pick.className='merchant-secondary';pick.textContent='اختيار هذا السائق';
    pick.addEventListener('click',()=>chooseDriver(driver));
    card.append(title,details,pick);results.appendChild(card);
   });
  }catch(e){message(e.message||'تعذّر البحث عن السائق.');}
  finally{button.disabled=false;button.textContent='البحث عن السائق';}
 }
 const toggle=$('agentRechargeToggle'),panel=$('agentRechargePanel');
 if(toggle&&panel)toggle.addEventListener('click',()=>{
  panel.hidden=!panel.hidden;
  const funding=$('agentFundingForm');if(funding)funding.hidden=true;
  if(!panel.hidden){$('agentDriverSearch').focus();}
  else clearSelection();
 });
 $('agentFindDriver')?.addEventListener('click',findDrivers);
 $('agentDriverSearch')?.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();findDrivers();}});
 $('agentDriverSearch')?.addEventListener('input',()=>{clearSelection();$('agentDriverResults').replaceChildren();});
 $('agentRechargeForm')?.addEventListener('submit',async event=>{
  event.preventDefault();
  if(!selectedDriver||!selectedDriver.driver_code){message('اختر سائقًا معتمدًا من نتائج البحث أولًا.');return;}
  if(!event.currentTarget.reportValidity())return;
  const amount=Number($('agentRechargeAmount').value);
  if(!Number.isSafeInteger(amount)||amount<1||amount>1000000){message('أدخل عدد عملات صحيحًا بين 1 و1,000,000.');return;}
  if(!window.confirm('تأكيد شحن '+amount.toLocaleString('fr-DZ')+' عملة للسائق '+[selectedDriver.full_name,selectedDriver.surname].filter(Boolean).join(' ')+' ('+selectedDriver.driver_code+')؟'))return;
  const button=$('agentRechargeSubmit');button.disabled=true;button.textContent='جارٍ تنفيذ الشحن…';
  try{
   await currentUser();
   const {data,error}=await client().rpc('agent_recharge_driver',{p_driver_code:selectedDriver.driver_code,p_amount:amount});
   if(error)throw error;
   const row=Array.isArray(data)?data[0]:data;
   if(!row||!row.reference_code)throw new Error('لم يؤكد الخادم عملية الشحن.');
   const receipt=$('agentRechargeReceipt');receipt.replaceChildren();receipt.hidden=false;
   const title=document.createElement('strong');title.textContent='تم الشحن بنجاح ✓';
   const details=document.createElement('p');details.style.whiteSpace='pre-line';
   details.textContent='رقم العملية: '+row.reference_code+'\nالسائق: '+[selectedDriver.full_name,selectedDriver.surname].filter(Boolean).join(' ')+'\nالمبلغ: '+money(amount)+' عملة\nرصيد السائق الجديد: '+money(row.new_driver_balance)+' عملة\nرصيد الوكيل المتبقي: '+money(row.new_agent_balance)+' عملة\nوقت العملية: '+(row.transaction_time?new Date(row.transaction_time).toLocaleString('ar-DZ'):'—');
   receipt.append(title,details);
   message('اكتملت عملية الشحن وسُجّلت في قاعدة البيانات.',true);
   $('agentRechargeAmount').value='';
   if(typeof window.mahattatiRefreshAgentWalletBalance==='function')await window.mahattatiRefreshAgentWalletBalance();
  }catch(e){message(e.message||'تعذّر تنفيذ الشحن. لم يتم تأكيد العملية.');}
  finally{button.disabled=false;button.textContent='تأكيد الشحن';}
 });
 window.addEventListener('mahattati:merchant-application',event=>{
  const app=event.detail;
  activeAgent=!!(app&&app.status==='approved'&&['agent','وكيل','agent_partner'].includes(String(app.business_type||'').toLowerCase()));
  if(!activeAgent){if(panel)panel.hidden=true;clearSelection();}
 });
})();