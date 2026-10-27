/* Extracted inline script 5 from index.html; original load position preserved. */
(()=>{
 const $id=id=>document.getElementById(id);
 const page=$id('mahattatiAccountSettings'); if(!page)return;
 const safeGet=(key,fallback='')=>{try{return localStorage.getItem(key)??fallback}catch(e){return fallback}};
 const safeSet=(key,value)=>{try{localStorage.setItem(key,String(value));return true}catch(e){return false}};
 const notify=message=>{if(typeof window.toast==='function'){window.toast(message);return;}const el=$id('toast');if(el){el.textContent=message;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),2600)}else alert(message)};
 function openSettings(){page.classList.add('open');page.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';try{const n=safeGet('mahattati_profile_name', $id('menuUsername')?.textContent?.trim()||'Tfk');$id('masProfileName').textContent=n||'غير محدد';$id('masPhoneValue').textContent=safeGet('mahattati_phone','غير محدد')||'غير محدد';const choice=safeGet('mahattati_driver_location','yes');$id('masLocationYes').classList.toggle('active',choice==='yes');$id('masLocationNo').classList.toggle('active',choice==='no');}catch(e){}}
 function closeSettings(){page.classList.remove('open');page.setAttribute('aria-hidden','true');document.body.style.overflow='';if(typeof setBottomNavActive==='function')setBottomNavActive('bottomNavDestination');}
 window.openMahattatiAccountSettings=openSettings;
 $id('bottomNavAccount')?.addEventListener('click',()=>{if(typeof closeMenu==='function')closeMenu();if(typeof closeRouteModal==='function'&&$id('routeModal')?.classList.contains('open'))closeRouteModal();if(typeof hideTripMapPage==='function'&&$id('tripMapPage')?.classList.contains('open'))hideTripMapPage();if(typeof closeSuggestFarePage==='function'&&$id('suggestFarePage')?.classList.contains('open'))closeSuggestFarePage();$id('requestHistoryPage')?.classList.remove('open');$id('requestHistoryPage')?.setAttribute('aria-hidden','true');setBottomNavActive?.('bottomNavAccount');openSettings();});
 $id('masBack').addEventListener('click',closeSettings);
 $id('masEditName').addEventListener('click',()=>{const current=$id('masProfileName').textContent;const value=prompt('أدخل اسم الملف الشخصي:',current==='غير محدد'?'':current);if(value===null)return;const name=value.trim();if(!name){notify('يرجى إدخال اسم صحيح');return;}if(!safeSet('mahattati_profile_name',name)){notify('تعذر حفظ الاسم على هذا الجهاز');return;}$id('masProfileName').textContent=name;if($id('menuUsername'))$id('menuUsername').textContent=name;notify('تم تحديث الاسم');});
 $id('masEditPhone').addEventListener('click',()=>{const current=safeGet('mahattati_phone','');const value=prompt('أدخل رقم الهاتف الجديد:',current);if(value===null)return;const phone=value.trim();if(!phone){notify('يرجى إدخال رقم الهاتف');return;}if(!/^[+\d\s()-]{7,20}$/.test(phone)){notify('تحقق من صيغة رقم الهاتف');return;}if(!safeSet('mahattati_phone',phone)){notify('تعذر حفظ الرقم على هذا الجهاز');return;}$id('masPhoneValue').textContent=phone;notify('تم حفظ الرقم محليًا؛ التحقق من الرقم غير متاح دون خادم');});
 [['masAppearance','mahattati_appearance'],['masDistance','mahattati_distance'],['masLanguage','mahattati_language']].forEach(([id,key])=>{$id(id).value=safeGet(key,id==='masDistance'?'km':id==='masLanguage'?'ar':'default');$id(id).addEventListener('change',()=>{safeSet(key,$id(id).value);notify('تم حفظ التفضيل');});});
 page.querySelectorAll('[data-location-choice]').forEach(btn=>btn.addEventListener('click',()=>{const choice=btn.dataset.locationChoice;safeSet('mahattati_driver_location',choice);$id('masLocationYes').classList.toggle('active',choice==='yes');$id('masLocationNo').classList.toggle('active',choice==='no');notify(choice==='yes'?'وافقت على إظهار الموقع للسائق':'رفضت إظهار الموقع للسائق');}));
 $id('masRegisterDriver').addEventListener('click',()=>{closeSettings();if(typeof openDriverPartnerPage==='function'){openDriverPartnerPage();}else{notify('تعذر فتح صفحة تسجيل السائق. حدّث الصفحة وحاول مجددًا.');}});
 const agentPage=$id('mahattatiAgentJoin');
 function openAgentPage(){page.classList.remove('open');agentPage?.classList.add('open');agentPage?.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';}
 function closeAgentPage(){agentPage?.classList.remove('open');agentPage?.setAttribute('aria-hidden','true');document.body.style.overflow='';openSettings();}
 async function showAgentApplicationStatus(app){
  let statusPage=document.getElementById('mahattatiAgentApplicationStatusPage');
  if(!statusPage){statusPage=document.createElement('section');statusPage.id='mahattatiAgentApplicationStatusPage';statusPage.dir='rtl';statusPage.style.cssText='position:fixed;inset:0;z-index:2147483647;background:#f4faf5;color:#173421;overflow:auto;padding:calc(14px + env(safe-area-inset-top)) 18px 24px;font-family:system-ui,sans-serif;box-sizing:border-box';document.body.appendChild(statusPage);}
  statusPage.replaceChildren();
  const box=document.createElement('div');box.style.cssText='max-width:600px;margin:22px auto;background:white;border:1px solid #dcebe0;border-radius:24px;padding:24px';
  const top=document.createElement('header');top.style.cssText='display:flex;align-items:center;gap:12px;margin-bottom:18px';
  const back=document.createElement('button');back.type='button';back.setAttribute('aria-label','العودة إلى الإعدادات');back.textContent='←';back.style.cssText='width:44px;height:44px;border:1px solid #dce8de;border-radius:50%;background:white;font-size:25px;cursor:pointer';back.onclick=()=>{statusPage.remove();closeAgentPage();};
  const h=document.createElement('h1');h.textContent='حالة طلب الوكيل';h.style.cssText='margin:0;font-size:26px';top.append(back,h);
  const state=app.status||'pending';const badge=document.createElement('div');badge.style.cssText='padding:16px;border-radius:14px;font-weight:800;background:'+(state==='approved'?'#dcfce7':state==='rejected'?'#fee2e2':'#fff7d6');badge.textContent=state==='approved'?'تمت الموافقة على حسابك ✓':state==='rejected'?'تم رفض الطلب':'طلبك قيد المراجعة';
  const p=document.createElement('p');p.style.cssText='line-height:1.9';p.textContent=state==='approved'?'تم اعتماد حسابك. يمكنك الآن العودة إلى الإعدادات والدخول إلى واجهة الوكيل.':state==='rejected'?'تم رفض الطلب. يرجى مراجعة ملاحظة الإدارة قبل إعادة التقديم.':'استلمنا طلبك. ستتمكن من الدخول إلى واجهة الإرسال مباشرة بعد موافقة الإدارة. لن تحتاج إلى التسجيل من جديد.';
  const note=document.createElement('p');note.style.cssText='line-height:1.8;color:#8a4b08';note.textContent=app.reviewer_note?'ملاحظة الإدارة: '+app.reviewer_note:'';
  const refresh=document.createElement('button');refresh.type='button';refresh.textContent='تحديث حالة الطلب';refresh.style.cssText='width:100%;padding:14px;border:0;border-radius:13px;background:#08c96a;font:inherit;font-weight:800;margin-top:12px';refresh.onclick=async()=>{refresh.disabled=true;try{const c=window.mahattatiSupabase;const {data:{user},error:ae}=await c.auth.getUser();if(ae||!user)throw ae||new Error();const {data,error}=await c.from('merchant_applications').select('status,business_type,reviewer_note').eq('user_id',user.id).eq('business_type','agent').maybeSingle();if(error)throw error;if(!data)throw new Error('لم يتم العثور على طلب الوكيل');if(data.status==='approved'){statusPage.remove();closeAgentPage();alert('تمت الموافقة على حسابك. افتح تسجيل كوكيل للدخول إلى الواجهة.');return;}await showAgentApplicationStatus(data);}catch(e){alert('تعذر تحديث الحالة. تحقق من الاتصال.');}finally{refresh.disabled=false;}};
  box.append(top,badge,p,note,refresh);statusPage.appendChild(box);statusPage.style.display='block';statusPage.style.visibility='visible';statusPage.style.opacity='1';statusPage.style.pointerEvents='auto';
 }
 $id('masRegisterAgent').addEventListener('click',async e=>{
  e.preventDefault();e.stopImmediatePropagation();
  const c=window.mahattatiSupabase;
  try{
   if(!c){openAgentPage();return;}
   const {data:{user},error:ae}=await c.auth.getUser();
   if(ae||!user){openAgentPage();return;}
   const {data,error}=await c.from('merchant_applications').select('status,business_type,reviewer_note').eq('user_id',user.id).eq('business_type','agent').maybeSingle();
   if(error)throw error;
   if(!data){openAgentPage();return;}
   if(data.status==='approved'){
    closeAgentPage();
    const formPage=document.getElementById('mahattatiAgentApplicationForm');if(formPage)formPage.remove();
    const statusPage=document.getElementById('mahattatiAgentApplicationStatusPage');if(statusPage)statusPage.remove();
    const dashboard=document.getElementById('mahattatiAgentDashboardPage');
    if(dashboard){dashboard.style.display='block';dashboard.style.visibility='visible';dashboard.style.opacity='1';dashboard.style.pointerEvents='auto';dashboard.style.zIndex='2147483601';return;}
    // If the dashboard was not created yet, do not send an approved agent back to registration.
    openAgentPage();
    const register=document.getElementById('majRegisterNow');if(register)register.textContent='تسجيل الآن';
    return;
   }
   await showAgentApplicationStatus(data);
  }catch(err){console.error('[agent application status]',err);openAgentPage();}
 });
 $id('majClose')?.addEventListener('click',closeAgentPage);
 $id('majAgentLoginNow')?.addEventListener('click',async()=>{
  const c=window.mahattatiSupabase;
  try{
   if(!c){if(typeof window.mahattatiOpenAuth==='function')window.mahattatiOpenAuth();else alert('تعذر فتح تسجيل الدخول. حدّث الصفحة وحاول مجددًا.');return;}
   const {data:{user},error}=await c.auth.getUser();
   if(error)throw error;
   if(!user){if(typeof window.mahattatiOpenAuth==='function')window.mahattatiOpenAuth();else alert('يرجى تسجيل الدخول أولًا من صفحة الدخول الرئيسية.');return;}
   const {data,error:queryError}=await c.from('merchant_applications').select('status,business_type,reviewer_note').eq('user_id',user.id).eq('business_type','agent').maybeSingle();
   if(queryError)throw queryError;
   if(!data){alert('لا يوجد طلب وكيل مرتبط بهذا الحساب. اضغط «سجّل الآن» لإرسال طلبك.');return;}
   if(data.status==='approved'){
    closeAgentPage();
    const form=document.getElementById('mahattatiAgentApplicationForm');if(form)form.remove();
    const status=document.getElementById('mahattatiAgentApplicationStatusPage');if(status)status.remove();
    const dashboard=document.getElementById('mahattatiAgentDashboardPage');
    if(dashboard){dashboard.style.display='block';dashboard.style.visibility='visible';dashboard.style.opacity='1';dashboard.style.pointerEvents='auto';dashboard.style.zIndex='2147483601';return;}
    // The dashboard is built by the existing form handler; reopen that path if it is absent.
    window.mahattatiOpenApprovedAgentDashboard=true;
    openAgentPage();
    document.getElementById('majRegisterNow')?.click();
   }else{
    await showAgentApplicationStatus(data);
   }
  }catch(err){console.error('[agent login]',err);alert('تعذر التحقق من حساب الوكيل. تحقق من الاتصال ثم حاول مجددًا.');}
 });
 $id('majRegisterNow')?.addEventListener('click',async()=>{
  // Check existing application first: never create a duplicate request.
  const c=window.mahattatiSupabase;
  try{
   if(c){
    const {data:{user},error:authError}=await c.auth.getUser();
    if(authError)throw authError;
    if(user){
     const {data:existing,error}=await c.from('merchant_applications').select('status,business_type,reviewer_note').eq('user_id',user.id).eq('business_type','agent').maybeSingle();
     if(error)throw error;
     if(existing){
      if(existing.status==='approved'&&!window.mahattatiOpenApprovedAgentDashboard){
       alert('حسابك معتمد بالفعل. اضغط «الدخول إلى حسابي» للدخول إلى واجهة الوكيل.');
       return;
      }
      if(existing.status==='pending'||existing.status==='under_review'){
       await showAgentApplicationStatus(existing);return;
      }
      if(existing.status==='rejected'){
       await showAgentApplicationStatus(existing);return;
      }
     }
    }
   }
  }catch(err){console.error('[agent registration precheck]',err);alert('تعذر التحقق من حالة طلبك. تحقق من الاتصال وحاول مجددًا.');return;}
  let formPage=document.getElementById('mahattatiAgentApplicationForm');
  if(!formPage){
   formPage=document.createElement('section');formPage.id='mahattatiAgentApplicationForm';formPage.dir='rtl';
   formPage.style.cssText='position:fixed;inset:0;z-index:2147483600;background:#f5fbf6;color:#18241c;overflow:auto;padding:calc(12px + env(safe-area-inset-top)) 14px calc(18px + env(safe-area-inset-bottom));font-family:system-ui,-apple-system,sans-serif;box-sizing:border-box';
   formPage.innerHTML=`<div style="max-width:620px;margin:auto"><header style="display:flex;align-items:center;gap:12px;margin-bottom:16px"><button type="button" id="majFormBack" aria-label="رجوع" style="width:42px;height:42px;border:1px solid #dce9de;border-radius:50%;background:white;font-size:26px">×</button><div><div style="font-size:12px;color:#08a95b;font-weight:800">MAHATTATI</div><h1 style="margin:2px 0;font-size:25px">طلب التسجيل كوكيل</h1></div></header>
   <div style="background:white;border:1px solid #e0eee3;border-radius:22px;padding:16px;box-shadow:0 8px 28px #17351c0a">
   <p style="margin:0 0 16px;color:#68756b;line-height:1.7">أدخل معلوماتك وارفع صورة واضحة. يشترط أن يكون عمرك 18 سنة على الأقل وأن تتوفر لديك الوثائق المطلوبة.</p>
   <form id="majAgentDetailsForm" novalidate>
    <label style="display:block;font-weight:700;margin:12px 0 6px" for="majAgentPhoto">الصورة الشخصية</label><input id="majAgentPhoto" type="file" accept="image/*" required style="width:100%;padding:11px;border:1px solid #d8e5da;border-radius:12px;background:#fbfdfb;box-sizing:border-box">
    <label style="display:block;font-weight:700;margin:12px 0 6px" for="majAgentName">الاسم الكامل</label><input id="majAgentName" required maxlength="100" autocomplete="name" placeholder="اكتب اسمك الكامل" style="width:100%;padding:13px;border:1px solid #d8e5da;border-radius:12px;box-sizing:border-box;font:inherit">
    <label style="display:block;font-weight:700;margin:12px 0 6px" for="majAgentAge">العمر</label><input id="majAgentAge" type="number" min="18" max="100" required inputmode="numeric" placeholder="18 سنة أو أكثر" style="width:100%;padding:13px;border:1px solid #d8e5da;border-radius:12px;box-sizing:border-box;font:inherit">
    <label style="display:block;font-weight:700;margin:12px 0 6px" for="majAgentNationalId">بطاقة التعريف الوطنية</label><input id="majAgentNationalId" type="file" accept="image/*,.pdf,application/pdf" required style="width:100%;padding:11px;border:1px solid #d8e5da;border-radius:12px;background:#fbfdfb;box-sizing:border-box">
    <label style="display:block;font-weight:700;margin:12px 0 6px" for="majAgentTradeLicense">رخصة النشاط التجاري</label><input id="majAgentTradeLicense" type="file" accept="image/*,.pdf,application/pdf" required style="width:100%;padding:11px;border:1px solid #d8e5da;border-radius:12px;background:#fbfdfb;box-sizing:border-box">
    <label style="display:block;font-weight:700;margin:12px 0 6px" for="majAgentTaxNumber">الرقم الضريبي</label><input id="majAgentTaxNumber" type="text" required maxlength="60" placeholder="أدخل الرقم الضريبي" style="width:100%;padding:13px;border:1px solid #d8e5da;border-radius:12px;box-sizing:border-box;font:inherit">
    <label style="display:block;font-weight:700;margin:12px 0 6px" for="majAgentTaxCard">البطاقة الضريبية</label><input id="majAgentTaxCard" type="file" accept="image/*,.pdf,application/pdf" required style="width:100%;padding:11px;border:1px solid #d8e5da;border-radius:12px;background:#fbfdfb;box-sizing:border-box">
    <label style="display:block;font-weight:700;margin:12px 0 6px" for="majAgentShopAddress">عنوان المحل</label><textarea id="majAgentShopAddress" required maxlength="300" rows="3" placeholder="الولاية، البلدية، الشارع، ورقم المحل إن وجد" style="width:100%;padding:13px;border:1px solid #d8e5da;border-radius:12px;box-sizing:border-box;font:inherit;resize:vertical"></textarea>
    <label style="display:block;font-weight:700;margin:12px 0 6px" for="majAgentCriminalRecord">صحيفة السوابق القضائية</label><input id="majAgentCriminalRecord" type="file" accept="image/*,.pdf,application/pdf" required style="width:100%;padding:11px;border:1px solid #d8e5da;border-radius:12px;background:#fbfdfb;box-sizing:border-box">
    <label style="display:block;font-weight:700;margin:12px 0 6px" for="majAgentPhone">رقم الهاتف</label><input id="majAgentPhone" type="tel" required maxlength="25" autocomplete="tel" placeholder="05 / 06 / 07..." style="width:100%;padding:13px;border:1px solid #d8e5da;border-radius:12px;box-sizing:border-box;font:inherit">
    <h2 style="font-size:18px;margin:20px 0 8px">تأكيد توفر الشروط</h2><p style="color:#68756b;font-size:13px;line-height:1.6">ضع علامة أمام كل شرط تتوفر عليه قبل إرسال طلبك.</p>
    <div id="majAgentRequirements" style="display:grid;gap:9px">
     <label style="display:flex;gap:10px;align-items:flex-start;padding:11px;background:#f5faf5;border-radius:12px;line-height:1.6"><input type="checkbox" required style="margin-top:5px;accent-color:#08c96a">عمري 18 سنة على الأقل.</label>
     <label style="display:flex;gap:10px;align-items:flex-start;padding:11px;background:#f5faf5;border-radius:12px;line-height:1.6"><input type="checkbox" required style="margin-top:5px;accent-color:#08c96a">أمتلك رخصة نشاط تجاري سارية.</label>
     <label style="display:flex;gap:10px;align-items:flex-start;padding:11px;background:#f5faf5;border-radius:12px;line-height:1.6"><input type="checkbox" required style="margin-top:5px;accent-color:#08c96a">لدي رقم ضريبي فعّال وبطاقة ضريبية.</label>
     <label style="display:flex;gap:10px;align-items:flex-start;padding:11px;background:#f5faf5;border-radius:12px;line-height:1.6"><input type="checkbox" required style="margin-top:5px;accent-color:#08c96a">لدي حساب بنكي فعّال.</label>
     <label style="display:flex;gap:10px;align-items:flex-start;padding:11px;background:#f5faf5;border-radius:12px;line-height:1.6"><input type="checkbox" required style="margin-top:5px;accent-color:#08c96a">لدي عنوان واضح ومحدد لموقع النشاط التجاري.</label>
     <label style="display:flex;gap:10px;align-items:flex-start;padding:11px;background:#f5faf5;border-radius:12px;line-height:1.6"><input type="checkbox" required style="margin-top:5px;accent-color:#08c96a">أمتلك نسخة من صحيفة السوابق القضائية.</label>
    </div>
    <p id="majAgentFormStatus" role="status" style="font-size:13px;line-height:1.6;color:#b45309"></p>
    <button type="submit" style="width:100%;border:0;border-radius:15px;background:#08c96a;color:#063b20;font-weight:800;font-size:17px;padding:15px;margin-top:10px">متابعة</button>
   </form></div><p style="font-size:12px;color:#78857b;text-align:center;line-height:1.7">ملاحظة: هذا النموذج يتحقق من المعلومات على جهازك فقط؛ لم يتم ربط طلبات الوكلاء بخادم للمراجعة بعد.</p></div>`;
   document.body.appendChild(formPage);
   formPage.querySelector('#majFormBack').addEventListener('click',()=>{formPage.remove();closeAgentPage();});
   // Keep the pending/approved application status screen authoritative; never fall through to the dashboard after submission.
   formPage.querySelector('#majAgentDetailsForm').addEventListener('submit',async e=>{
    e.preventDefault();const status=formPage.querySelector('#majAgentFormStatus'),age=Number(formPage.querySelector('#majAgentAge').value),photo=formPage.querySelector('#majAgentPhoto').files[0];
    if(!window.mahattatiOpenApprovedAgentDashboard){
    if(age>0&&age<18){status.textContent='يشترط أن يكون العمر 18 سنة على الأقل.';return;}
    const docIds=['majAgentNationalId','majAgentTradeLicense','majAgentTaxCard','majAgentCriminalRecord'];
    const requiredIds=['majAgentPhoto','majAgentName','majAgentAge','majAgentNationalId','majAgentTradeLicense','majAgentTaxNumber','majAgentTaxCard','majAgentShopAddress','majAgentCriminalRecord','majAgentPhone'];
    for(const id of requiredIds){const el=formPage.querySelector('#'+id);if(!el||el.type==='file'?!el?.files?.[0]:!el.value.trim()){status.textContent='أكمل جميع المعلومات وارفع كل الوثائق المطلوبة قبل إرسال الطلب.';el?.focus();return;}}
    if(!Number.isInteger(age)||age<18||age>100){status.textContent='يشترط أن يكون العمر بين 18 و100 سنة.';return;}
    if([...formPage.querySelectorAll('#majAgentRequirements input[type="checkbox"]')].some(x=>!x.checked)){status.textContent='يجب تأكيد جميع الشروط قبل إرسال الطلب.';return;}
    for(const id of docIds){const file=formPage.querySelector('#'+id)?.files?.[0];if(file&&file.size>5*1024*1024){status.textContent='حجم كل وثيقة يجب ألا يتجاوز 5 ميغابايت.';return;}}
    if(photo&&photo.size>5*1024*1024){status.textContent='حجم الصورة الشخصية يجب ألا يتجاوز 5 ميغابايت.';return;}
    }
    // Submit a server-side agent application and never expose the agent dashboard before admin approval.
    const authClient=window.mahattatiSupabase;
    if(!authClient){status.textContent='تعذر الاتصال بقاعدة البيانات. سجّل الدخول ثم أعد المحاولة.';return;}
    const {data:{user},error:authError}=await authClient.auth.getUser();
    if(authError||!user){status.textContent='يجب تسجيل الدخول أولًا لإرسال طلب الوكيل.';if(window.mahattatiOpenAuth)window.mahattatiOpenAuth();return;}
    status.textContent='جارٍ التحقق من حالة طلبك…';
    try{
      const {data:existing,error:existingError}=await authClient.from('merchant_applications').select('id,status,business_type,reviewer_note').eq('user_id',user.id).maybeSingle();
      if(existingError)throw existingError;
      if(existing && existing.business_type==='agent' && existing.status==='approved'){
        // Continue to shared dashboard creation below; the dashboard DOM may not exist after a fresh page load.
        formPage.remove();
        closeAgentPage();
      }else if(existing && existing.business_type==='agent'){
        status.textContent=existing.status==='rejected'?'تم رفض طلب الوكيل. راجع الإدارة لتصحيح المعلومات.':'طلب الوكيل قيد المراجعة من لوحة التحكم. لا يمكن فتح واجهة الإرسال قبل الموافقة.';
        let statusPage=document.getElementById('mahattatiAgentApplicationStatusPage');
        if(!statusPage){statusPage=document.createElement('section');statusPage.id='mahattatiAgentApplicationStatusPage';statusPage.dir='rtl';statusPage.style.cssText='position:fixed;inset:0;z-index:2147483647;background:#f4faf5;color:#173421;overflow:auto;padding:calc(20px + env(safe-area-inset-top)) 18px 24px;font-family:system-ui,sans-serif;display:block;visibility:visible;opacity:1;pointer-events:auto;box-sizing:border-box';document.body.appendChild(statusPage);statusPage.setAttribute('role','dialog');statusPage.setAttribute('aria-modal','true');}
        const renderExistingStatus=(state,note='')=>{statusPage.replaceChildren();const box=document.createElement('div');box.style.cssText='max-width:600px;margin:35px auto;background:white;border:1px solid #dcebe0;border-radius:24px;padding:24px';const h=document.createElement('h1');h.textContent='حالة طلب الوكيل';const badge=document.createElement('div');badge.style.cssText='padding:15px;border-radius:14px;font-weight:800;background:'+(state==='approved'?'#dcfce7':state==='rejected'?'#fee2e2':'#fff7d6');badge.textContent=state==='approved'?'تمت الموافقة على حسابك ✓':state==='rejected'?'تم رفض الطلب':'طلبك قيد المراجعة';const p=document.createElement('p');p.style.lineHeight='1.9';p.textContent=state==='approved'?'تم اعتماد حسابك. أغلق هذه الصفحة ثم افتح واجهة الوكيل مجددًا.':state==='rejected'?'راجع ملاحظة الإدارة لتصحيح الطلب.':'استلمنا طلبك. ستتمكن من الدخول إلى واجهة الإرسال مباشرة بعد موافقة الإدارة.';const n=document.createElement('p');n.textContent=note?'ملاحظة الإدارة: '+note:'';const refresh=document.createElement('button');refresh.textContent='تحديث حالة الطلب';refresh.style.cssText='width:100%;padding:14px;border:0;border-radius:13px;background:#08c96a;font:inherit;font-weight:800;margin-top:10px';refresh.onclick=async()=>{refresh.disabled=true;try{const c=window.mahattatiSupabase;const {data:{user},error:ae}=await c.auth.getUser();if(ae||!user)throw ae||new Error();const {data,error}=await c.from('merchant_applications').select('status,reviewer_note').eq('user_id',user.id).eq('business_type','agent').maybeSingle();if(error||!data)throw error||new Error();if(data.status==='approved'){statusPage.remove();status.textContent='تمت الموافقة. أعد فتح واجهة الوكيل للدخول.';}else renderExistingStatus(data.status,data.reviewer_note||'');}catch(e){alert('تعذر تحديث الحالة. تحقق من الاتصال.');}finally{refresh.disabled=false;}};const back=document.createElement('button');back.textContent='العودة';back.style.cssText='width:100%;padding:13px;border:1px solid #dce8de;border-radius:13px;background:white;font:inherit;margin-top:9px';back.onclick=()=>statusPage.remove();box.append(h,badge,p,n,refresh,back);statusPage.appendChild(box);};
        renderExistingStatus(existing.status,existing.reviewer_note||'');
        return;
      }else if(existing){
        status.textContent='لديك طلب شريك آخر مسجل بهذا الحساب. تواصل مع الإدارة لإضافة طلب وكيل منفصل.';
        return;
      }else{
        const fullName=formPage.querySelector('#majAgentName').value.trim();
        const phone=formPage.querySelector('#majAgentPhone').value.trim();
        const address=formPage.querySelector('#majAgentShopAddress').value.trim();
        const taxNumber=formPage.querySelector('#majAgentTaxNumber').value.trim();
        const description='طلب وكيل تعبئة. العمر: '+age+'؛ الرقم الضريبي: '+taxNumber+'؛ تم تأكيد توفر الوثائق المطلوبة من المستخدم. يجب على الإدارة التحقق من الوثائق الأصلية قبل الموافقة.';
        const {error:insertError}=await authClient.from('merchant_applications').insert({
          user_id:user.id,business_name:'وكيل محطتي - '+fullName,owner_name:fullName,phone,email:user.email||'',
          business_type:'agent',wilaya:address.slice(0,80),address,description,status:'pending'
        });
        if(insertError)throw insertError;
        status.textContent='تم إرسال طلب الوكيل إلى لوحة التحكم بنجاح.';
        let statusPage=document.getElementById('mahattatiAgentApplicationStatusPage');
        if(!statusPage){statusPage=document.createElement('section');statusPage.id='mahattatiAgentApplicationStatusPage';statusPage.dir='rtl';statusPage.style.cssText='position:fixed;inset:0;z-index:2147483647;background:#f4faf5;color:#173421;overflow:auto;padding:calc(20px + env(safe-area-inset-top)) 18px 24px;font-family:system-ui,sans-serif;display:block;visibility:visible;opacity:1;pointer-events:auto;box-sizing:border-box';document.body.appendChild(statusPage);statusPage.setAttribute('role','dialog');statusPage.setAttribute('aria-modal','true');}
        const renderStatus=(state,note='')=>{statusPage.replaceChildren();const box=document.createElement('div');box.style.cssText='max-width:600px;margin:35px auto;background:white;border:1px solid #dcebe0;border-radius:24px;padding:24px';const h=document.createElement('h1');h.textContent='حالة طلب الوكيل';const badge=document.createElement('div');badge.style.cssText='padding:15px;border-radius:14px;font-weight:800;background:'+(state==='approved'?'#dcfce7':state==='rejected'?'#fee2e2':'#fff7d6');badge.textContent=state==='approved'?'تمت الموافقة على حسابك ✓':state==='rejected'?'تم رفض الطلب':'طلبك قيد المراجعة';const p=document.createElement('p');p.style.lineHeight='1.9';p.textContent=state==='approved'?'تم اعتماد حسابك ويمكنك الآن فتح واجهة الإرسال.':state==='rejected'?'راجع ملاحظة الإدارة لتصحيح الطلب.':'استلمنا طلبك. لن تتمكن من فتح واجهة الإرسال حتى توافق الإدارة على حسابك.';const n=document.createElement('p');n.textContent=note?'ملاحظة الإدارة: '+note:'';const refresh=document.createElement('button');refresh.textContent='تحديث حالة الطلب';refresh.style.cssText='width:100%;padding:14px;border:0;border-radius:13px;background:#08c96a;font:inherit;font-weight:800;margin-top:10px';refresh.onclick=async()=>{refresh.disabled=true;try{const c=window.mahattatiSupabase;const {data:{user},error:ae}=await c.auth.getUser();if(ae||!user)throw ae||new Error();const {data,error}=await c.from('merchant_applications').select('status,reviewer_note').eq('user_id',user.id).eq('business_type','agent').maybeSingle();if(error||!data)throw error||new Error();renderStatus(data.status,data.reviewer_note||'');}catch(e){alert('تعذر تحديث الحالة. تحقق من الاتصال.');}finally{refresh.disabled=false;}};const back=document.createElement('button');back.textContent='العودة';back.style.cssText='width:100%;padding:13px;border:1px solid #dce8de;border-radius:13px;background:white;font:inherit;margin-top:9px';back.onclick=()=>statusPage.remove();box.append(h,badge,p,n,refresh,back);statusPage.appendChild(box);};
        renderStatus('pending');
        const submit=formPage.querySelector('button[type="submit"]');if(submit)submit.disabled=true;
        return;
      }
    }catch(err){
      status.textContent='تعذر إرسال/التحقق من طلب الوكيل. لم تُفتح الواجهة. تحقق من الاتصال والصلاحيات ثم أعد المحاولة.';
      return;
    }
    let dashboard=document.getElementById('mahattatiAgentDashboardPage');
    if(!dashboard){
      dashboard=document.createElement('section');dashboard.id='mahattatiAgentDashboardPage';dashboard.dir='rtl';
      dashboard.style.cssText='position:fixed;inset:0;z-index:2147483601;background:#f7f7ff;color:#201a35;overflow:auto;padding:calc(18px + env(safe-area-inset-top)) 18px calc(22px + env(safe-area-inset-bottom));font-family:system-ui,-apple-system,sans-serif;box-sizing:border-box';
      dashboard.innerHTML=`<div style="max-width:620px;margin:0 auto;min-height:100%;display:flex;flex-direction:column">
       <header style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin:10px 0 24px"><div style="width:46px;height:46px;border-radius:50%;background:#eee8fa;color:#4d2ba3;display:grid;place-items:center;font-size:20px;font-weight:800">A</div><h1 style="font-size:clamp(20px,5vw,27px);margin:0;font-weight:850">وكيل mahattati **</h1></header>
       <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:34px"><div><div style="font-size:16px;color:#5f5870;margin-bottom:7px">رصيد العملات المتاح ◉</div><div id="majAgentWalletBalance" style="font-size:25px;letter-spacing:1px;font-weight:900">جارٍ تحميل الرصيد…</div></div><button type="button" id="majAgentAddBalance" style="border:0;border-radius:28px;background:#5420c7;color:white;padding:14px 20px;font:inherit;font-weight:800;box-shadow:0 8px 18px #5420c733">＋ تمويل الرصيد</button></div>
       <div style="display:grid;grid-template-columns:minmax(0,1fr);gap:12px">
        <button type="button" data-agent-action="recharge" style="min-height:130px;border:1px solid #d5f0dc;border-radius:22px;background:linear-gradient(135deg,#e8f9ed,#f8fffa);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;color:#14532d;font:inherit;font-weight:800;font-size:clamp(16px,4vw,21px)"><span style="font-size:44px">💼</span><span>الشحن للعملاء</span></button>
       </div>
       <p style="margin:18px 2px 0;color:#746d80;font-size:12px;line-height:1.7">رصيد الوكيل يُموَّل من المنصة. عند استلام النقد من السائق، يُضاف له العدد نفسه من العملات، ويُخصم العدد نفسه من رصيد الوكيل.</p>
       <button type="button" id="majAgentDashboardBack" style="margin-top:auto;padding:14px;border:1px solid #e5def4;border-radius:15px;background:white;color:#4b278c;font:inherit;font-weight:800">العودة إلى معلومات التسجيل</button>
      </div>`;
      document.body.appendChild(dashboard);
      (async()=>{
       const balanceEl=dashboard.querySelector('#majAgentWalletBalance');
       try{
        const c=window.mahattatiSupabase;
        if(!c||!c.auth)throw new Error('تعذر الاتصال');
        const {data:{user},error:authError}=await c.auth.getUser();if(authError)throw authError;if(!user)throw new Error('سجّل الدخول');
        const {data,error}=await c.from('agent_wallets').select('balance').eq('agent_user_id',user.id).maybeSingle();if(error)throw error;
        if(balanceEl)balanceEl.textContent=(Number(data?.balance||0)).toLocaleString('fr-DZ')+' عملة';
       }catch(_){if(balanceEl)balanceEl.textContent='غير متاح';}
      })();
      dashboard.querySelector('#majAgentDashboardBack').addEventListener('click',()=>{dashboard.remove();formPage.style.display='block';});
      dashboard.querySelectorAll('[data-agent-action="recharge"]').forEach(button=>button.addEventListener('click',()=>openAgentRechargeFlow(dashboard)));
      dashboard.querySelector('#majAgentAddBalance').addEventListener('click',openAgentFundingRequest);
      async function openAgentFundingRequest(){
       const oldFlow=document.getElementById('majAgentFundingRequestFlow');if(oldFlow)oldFlow.remove();
       const flow=document.createElement('section');flow.id='majAgentFundingRequestFlow';flow.dir='rtl';flow.style.cssText='position:fixed;inset:0;z-index:2147483603;background:#f7f7ff;color:#201a35;overflow:auto;padding:calc(20px + env(safe-area-inset-top)) 18px 24px;font-family:system-ui,sans-serif;box-sizing:border-box';
       flow.innerHTML=`<div style="max-width:540px;margin:0 auto"><button type="button" id="majFundingBack" style="border:0;background:#eeeaf8;border-radius:50%;width:46px;height:46px;font-size:25px">→</button><h2 style="margin:24px 0 8px;font-size:27px">طلب تمويل الرصيد</h2><p style="color:#6d6380;line-height:1.8">أرسل طلبًا إلى إدارة محطتي لتعبئة محفظتك بالعملات. لن يُضاف الرصيد إلا بعد مراجعة الإدارة والموافقة على الطلب.</p><form id="majFundingRequestForm" style="background:white;border:1px solid #e7e1f2;border-radius:22px;padding:20px"><label for="majFundingAmount" style="display:block;font-weight:800;margin-bottom:8px">عدد العملات المطلوبة</label><input id="majFundingAmount" type="number" min="1" step="1" required placeholder="مثال: 5000" style="width:100%;box-sizing:border-box;padding:15px;border:1px solid #ddd5ed;border-radius:13px;font:inherit;margin-bottom:15px"><label for="majFundingNote" style="display:block;font-weight:800;margin-bottom:8px">ملاحظة للإدارة (اختياري)</label><textarea id="majFundingNote" maxlength="500" rows="3" placeholder="اكتب تفاصيل إضافية إن وجدت" style="width:100%;box-sizing:border-box;padding:13px;border:1px solid #ddd5ed;border-radius:13px;font:inherit"></textarea><button id="majFundingSubmit" type="submit" style="width:100%;margin-top:16px;padding:15px;border:0;border-radius:14px;background:#0b8f52;color:white;font:inherit;font-weight:850">إرسال طلب التمويل</button><div id="majFundingMessage" role="status" style="margin-top:12px;line-height:1.7"></div></form></div>`;
       document.body.appendChild(flow);flow.querySelector('#majFundingBack').addEventListener('click',()=>flow.remove());
       const form=flow.querySelector('#majFundingRequestForm'),msg=flow.querySelector('#majFundingMessage'),btn=flow.querySelector('#majFundingSubmit');
       form.addEventListener('submit',async ev=>{ev.preventDefault();const amount=Number(flow.querySelector('#majFundingAmount').value);if(!Number.isSafeInteger(amount)||amount<1){msg.style.color='#b42318';msg.textContent='أدخل عدد عملات صحيحًا أكبر من صفر.';return;}btn.disabled=true;btn.textContent='جارٍ إرسال الطلب…';try{const c=window.mahattatiSupabase;if(!c)throw new Error('تعذر الاتصال بالخادم');const {data,error}=await c.rpc('agent_request_wallet_funding',{p_amount:amount,p_note:flow.querySelector('#majFundingNote').value.trim()||null});if(error)throw error;const result=Array.isArray(data)?data[0]:data;if(!result?.reference_code)throw new Error('لم يؤكد الخادم استلام الطلب');msg.style.color='#087443';msg.textContent='تم إرسال الطلب بنجاح. رقم الطلب: '+result.reference_code+' — الحالة: قيد المراجعة. سيتم إضافة العملات بعد موافقة الإدارة.';form.querySelectorAll('input,textarea').forEach(el=>el.disabled=true);btn.textContent='تم إرسال الطلب';}catch(e){msg.style.color='#b42318';msg.textContent=(e.message||'تعذر إرسال الطلب')+(String(e.message||'').toLowerCase().includes('pending')?' — لديك طلب قيد المراجعة بالفعل.':'');btn.disabled=false;btn.textContent='إرسال طلب التمويل';}});
      }
      function openAgentRechargeFlow(root){
        let flow=document.getElementById('mahattatiAgentRechargeFlow');if(flow){flow.remove();}
        flow=document.createElement('section');flow.id='mahattatiAgentRechargeFlow';flow.dir='rtl';
        flow.style.cssText='position:fixed;inset:0;z-index:2147483602;background:#f7f7ff;color:#201a35;overflow:auto;padding:calc(18px + env(safe-area-inset-top)) 18px calc(22px + env(safe-area-inset-bottom));font-family:system-ui,-apple-system,sans-serif;box-sizing:border-box';
        flow.innerHTML=`<div style="max-width:560px;margin:0 auto">
          <button type="button" id="majRechargeBack" style="border:0;background:#eeeaf8;border-radius:50%;width:46px;height:46px;font-size:25px">→</button>
          <div style="margin:22px 0"><div style="color:#6d6380;font-size:14px">خدمات الوكيل · شحن رصيد السائق</div><h2 style="margin:8px 0;font-size:27px">الشحن للعملاء</h2><p style="color:#6d6380;line-height:1.8;margin:0">ابحث عن السائق، راجع بياناته، ثم أدخل المبلغ الذي استلمته نقدًا منه.</p></div>
          <div style="background:white;border:1px solid #e7e1f2;border-radius:22px;padding:18px;margin-bottom:14px">
           <label for="majRechargeDriverSearch" style="display:block;font-weight:800;margin-bottom:9px">1. البحث عن السائق</label>
           <input id="majRechargeDriverSearch" type="text" autocomplete="off" placeholder="معرّف السائق MHD-100001 أو رقم هاتفه" style="box-sizing:border-box;width:100%;padding:15px;border:1px solid #ddd5ed;border-radius:13px;font:inherit;outline-color:#5924c8">
           <button id="majRechargeSearchBtn" type="button" style="width:100%;margin-top:10px;padding:14px;border:0;border-radius:13px;background:#5924c8;color:white;font:inherit;font-weight:800">البحث عن السائق</button>
           <div id="majRechargeSearchResult" style="margin-top:12px;color:#6d6380;font-size:14px;line-height:1.8" role="status">أدخل معرّف السائق (مثل MHD-100001) أو رقم هاتفه.</div>
          </div>
          <div id="majRechargeAmountPanel" style="display:none;background:white;border:1px solid #e7e1f2;border-radius:22px;padding:18px;margin-bottom:14px">
           <label for="majRechargeAmount" style="display:block;font-weight:800;margin-bottom:9px">2. مبلغ الشحن (دج)</label>
           <input id="majRechargeAmount" type="number" min="1" step="1" inputmode="numeric" placeholder="مثال: 1000" style="box-sizing:border-box;width:100%;padding:15px;border:1px solid #ddd5ed;border-radius:13px;font:inherit">
           <div style="margin-top:12px;background:#f5f1ff;padding:13px;border-radius:12px;line-height:1.8;font-size:14px">تأكد أنك استلمت المبلغ نقدًا من السائق قبل المتابعة. سيظهر ملخص العملية قبل التأكيد.</div>
           <button id="majRechargeReviewBtn" type="button" style="width:100%;margin-top:13px;padding:15px;border:0;border-radius:13px;background:#16d978;color:#123b28;font:inherit;font-weight:900">مراجعة الشحن</button>
          </div>
          <div id="majRechargeReviewPanel" style="display:none;background:white;border:1px solid #e7e1f2;border-radius:22px;padding:18px;margin-bottom:14px"></div>
          <div id="majRechargeReceipt" style="display:none;background:white;border:1px solid #b8f1d1;border-radius:22px;padding:18px;margin-bottom:14px"></div>
          <p style="color:#7c748b;font-size:12px;line-height:1.8">الشحن مرتبط الآن بالخادم الآمن. لن تتم العملية إلا إذا كان حساب الوكيل معتمدًا ولديه رصيد كافٍ، وكان السائق معتمدًا. يجب تمويل محفظة الوكيل من الإدارة قبل أول عملية.</p>
        </div>`;
        document.body.appendChild(flow);
        const $=id=>flow.querySelector('#'+id);let selectedDriver=null,amount=0;
        $('majRechargeBack').onclick=()=>flow.remove();
        $('majRechargeSearchBtn').onclick=async()=>{
          const term=$('majRechargeDriverSearch').value.trim();const result=$('majRechargeSearchResult');
          $('majRechargeAmountPanel').style.display='none';$('majRechargeReviewPanel').style.display='none';
          if(term.length<3){result.textContent='أدخل رقم هاتف أو معرفًا صحيحًا للبحث.';return;}
          result.textContent='جارٍ البحث…';
          try{
            const c=window.supabaseClient||window.mahattatiSupabase||window.supabase;
            if(!c||typeof c.from!=='function'){result.textContent='تعذر الاتصال بالخادم. لم يتم تنفيذ أي عملية.';return;}
            const cleanTerm=term.trim();
            if(!/^MHD-\d{6}$/i.test(cleanTerm)&&!(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(cleanTerm))&&cleanTerm.replace(/\D/g,'').length<7){result.textContent='أدخل معرّفًا كاملًا مثل MHD-100001 أو رقم هاتف كاملًا (7 أرقام على الأقل).';return;}
            const {data,error}=await c.rpc('agent_find_approved_driver',{p_search:cleanTerm});
            if(error)throw error;
            const rows=[...(data||[])].filter(x=>x.user_id&&x.status==='approved');
            const unique=new Map(rows.map(x=>[x.user_id,x]));
            const matches=[...unique.values()];
            if(matches.length!==1){selectedDriver=null;result.textContent=matches.length?'عثرنا على أكثر من حساب مطابق. استعمل معرّف السائق للتأكد من الحساب الصحيح.':'لم يُعثر على حساب سائق معتمد مطابق. تأكد من رقم الهاتف أو المعرّف.';return;}
            selectedDriver=matches[0];result.innerHTML='';
            const card=document.createElement('div');card.style.cssText='background:#edfff4;border:1px solid #b8f1d1;border-radius:14px;padding:13px;color:#14532d';
            const title=document.createElement('strong');title.textContent=(selectedDriver.full_name||'')+' '+(selectedDriver.surname||'');const code=document.createElement('div');code.textContent='معرّف السائق: '+(selectedDriver.driver_code||'غير متوفر');code.style.cssText='direction:ltr;text-align:right;font-weight:800;margin-top:5px';const phone=document.createElement('div');phone.textContent='الهاتف: '+(selectedDriver.phone||'غير مسجل');const verified=document.createElement('div');verified.textContent='✓ سائق معتمد';card.append(title,code,phone,verified);result.appendChild(card);$('majRechargeAmountPanel').style.display='block';
          }catch(e){selectedDriver=null;result.textContent='تعذر البحث عن السائق بسبب صلاحيات قاعدة البيانات أو الاتصال. لم يتم تنفيذ أي عملية.';}
        };
        $('majRechargeReviewBtn').onclick=()=>{
          if(!selectedDriver){alert('ابحث عن السائق أولًا.');return;}
          amount=Number($('majRechargeAmount').value);
          if(!Number.isSafeInteger(amount)||amount<1){alert('أدخل مبلغًا صحيحًا بالدينار الجزائري.');return;}
          const panel=$('majRechargeReviewPanel');panel.style.display='block';panel.innerHTML='';
          const heading=document.createElement('h3');heading.textContent='3. تأكيد تفاصيل الشحن';heading.style.marginTop='0';
          const details=document.createElement('p');details.style.lineHeight='2';details.textContent='السائق: '+((selectedDriver.full_name||'')+' '+(selectedDriver.surname||''))+' · الهاتف: '+selectedDriver.phone+' · المبلغ النقدي المستلم: '+amount.toLocaleString('fr-DZ')+' دج · العملات التي ستُضاف لحساب السائق: '+amount.toLocaleString('fr-DZ')+' عملة';
          const warning=document.createElement('p');warning.style.cssText='color:#9a3412;background:#fff7ed;padding:12px;border-radius:12px;line-height:1.7';warning.textContent='سيُنفّذ الشحن الحقيقي فقط بعد التحقق من اعتماد الوكيل وتوفر رصيده. لا تؤكد إلا بعد استلام النقد من السائق.';
          const confirm=document.createElement('button');confirm.type='button';confirm.textContent='تأكيد الشحن الحقيقي وإصدار الإيصال';confirm.style.cssText='width:100%;padding:15px;border:0;border-radius:13px;background:#5924c8;color:white;font:inherit;font-weight:800';
          confirm.onclick=async()=>{
            if(confirm.disabled)return;
            if(!selectedDriver?.driver_code){alert('معرّف السائق غير متوفر. أعد البحث عن السائق.');return;}
            const c=window.mahattatiSupabase;
            if(!c||typeof c.rpc!=='function'){alert('تعذر الاتصال الآمن بالخادم. لم يُنفّذ أي شحن.');return;}
            confirm.disabled=true;confirm.textContent='جارٍ التحقق وتنفيذ الشحن…';
            try{
              const {data,error}=await c.rpc('agent_recharge_driver',{p_driver_code:selectedDriver.driver_code,p_amount:amount});
              if(error)throw error;
              const tx=Array.isArray(data)?data[0]:data;
              if(!tx?.reference_code)throw new Error('لم يُرجع الخادم رقمًا مرجعيًا صالحًا.');
              const receipt=$('majRechargeReceipt');receipt.style.display='block';receipt.innerHTML='';
              const h=document.createElement('h3');h.textContent='إيصال شحن ناجح';h.style.marginTop='0';
              const ref=document.createElement('p');ref.textContent='الرقم المرجعي: '+tx.reference_code;ref.style.direction='ltr';ref.style.fontWeight='800';
              const body=document.createElement('p');body.style.lineHeight='2';body.textContent='السائق: '+((selectedDriver.full_name||'')+' '+(selectedDriver.surname||''))+' · المعرّف: '+selectedDriver.driver_code+' · الهاتف: '+(selectedDriver.phone||'غير مسجل')+' · المبلغ المشحون: '+amount.toLocaleString('fr-DZ')+' دج · رصيد السائق الجديد: '+Number(tx.new_driver_balance).toLocaleString('fr-DZ')+' عملة · رصيد الوكيل المتبقي: '+Number(tx.new_agent_balance).toLocaleString('fr-DZ')+' عملة · الحالة: ناجحة';
              const print=document.createElement('button');print.type='button';print.textContent='طباعة / حفظ الإيصال';print.style.cssText='width:100%;padding:13px;border:1px solid #ddd5ed;border-radius:12px;background:white;color:#4b278c;font:inherit;font-weight:800';print.onclick=()=>window.print();
              receipt.append(h,ref,body,print);receipt.scrollIntoView({behavior:'smooth',block:'start'});
              warning.textContent='تم تنفيذ العملية وتسجيلها في قاعدة البيانات.';
            }catch(e){
              const msg=String(e?.message||e||'').toLowerCase();
              if(msg.includes('insufficient agent balance'))warning.textContent='تعذّر الشحن: رصيد الوكيل غير كافٍ. لم يتم تغيير أي رصيد.';
              else if(msg.includes('approved agent account required'))warning.textContent='تعذّر الشحن: حساب الوكيل غير معتمد في قاعدة البيانات بعد. لم يتم تغيير أي رصيد.';
              else if(msg.includes('approved driver not found'))warning.textContent='تعذّر الشحن: لم يعد حساب السائق معتمدًا أو أن المعرّف غير صحيح. لم يتم تغيير أي رصيد.';
              else warning.textContent='تعذّر تنفيذ الشحن الآمن: '+(e?.message||'خطأ غير معروف')+'. لم يتم إصدار إيصال نجاح.';
              console.error('Agent recharge failed',e);
            }finally{confirm.disabled=false;confirm.textContent='تأكيد الشحن الحقيقي وإصدار الإيصال';}
          };
          panel.append(heading,details,warning,confirm);panel.scrollIntoView({behavior:'smooth',block:'start'});
        };
      }
    }
    formPage.style.display='none';dashboard.style.display='block';dashboard.scrollTop=0;
    window.mahattatiOpenApprovedAgentDashboard=false;
    status.style.color='#087b42';status.textContent='تم التحقق من الحقول محليًا. لوحة الوكيل التجريبية جاهزة للمعاينة.';
   });
   if(window.mahattatiOpenApprovedAgentDashboard){
    const detailsForm=formPage.querySelector('#majAgentDetailsForm');
    if(detailsForm)detailsForm.requestSubmit();
   }
  }
 });
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&agentPage?.classList.contains('open'))closeAgentPage();});
 $id('masLegalDocs').addEventListener('click',()=>{
  closeSettings();
  let legalPage=document.getElementById('mahattatiLegalDocumentsPage');
  if(!legalPage){
    legalPage=document.createElement('section');
    legalPage.id='mahattatiLegalDocumentsPage';
    legalPage.dir='rtl';
    legalPage.style.cssText='position:fixed;inset:0;z-index:2147483647;display:block;overflow:auto;background:#f7f9fa;color:#202520;padding:calc(12px + env(safe-area-inset-top)) 16px calc(22px + env(safe-area-inset-bottom));font-family:system-ui,-apple-system,Arial,sans-serif;box-sizing:border-box';
    legalPage.innerHTML='<div style="max-width:680px;margin:0 auto"><header style="position:sticky;top:0;background:#f7f9fa;padding:8px 0 14px;display:flex;align-items:center;gap:12px;border-bottom:1px solid #e2e8e2"><button type="button" id="mahattatiLegalBack" aria-label="رجوع" style="width:44px;height:44px;border:1px solid #dce5dc;border-radius:14px;background:#fff;font-size:25px">→</button><div><strong style="font-size:21px">المستندات القانونية</strong><div style="font-size:12px;color:#687368">محطتي — MAHATTATI</div></div></header><article style="background:#fff;border:1px solid #e1e8e1;border-radius:18px;padding:17px;margin-top:16px;line-height:1.9"><h2 style="font-size:18px;margin:0 0 8px">سياسة الخصوصية</h2><p>تستخدم محطتي المعلومات التي تدخلها لإنشاء حسابك وتقديم خدمات طلب الرحلات وإرسال الطرود، ومعالجة الطلبات ومراجعة حسابات السائقين والوكلاء.</p><p>قد تشمل البيانات الاسم ورقم الهاتف ومعلومات الرحلة والموقع والوثائق التي تقدمها عند التسجيل كشريك سائق. تُستخدم بيانات الموقع لتحديد نقطة الانطلاق والوجهة وتسهيل الرحلة عندما تمنح الإذن بذلك.</p><p>تُحفظ بيانات الحساب والطلبات في قاعدة بيانات الخدمة. ينبغي تقييد الوصول إلى الوثائق الشخصية على الأشخاص المخولين فقط. لا تشارك كلمة المرور أو روابط الوثائق الخاصة مع الآخرين.</p><h2 style="font-size:18px;margin:22px 0 8px">شروط الاستخدام</h2><p>قدّم معلومات صحيحة ومحدّثة، ولا تستخدم التطبيق في نشاط مخالف للقانون أو يعرّض الركاب أو السائقين أو الطرود للخطر.</p><p>يجب على السائق إكمال بياناته ووثائقه وانتظار موافقة الإدارة قبل استخدام وظائف الشريك. إرسال طلب التسجيل لا يعني الموافقة التلقائية.</p><p>قد تتغير الأجرة والوقت التقديري حسب المسافة والطريق والظروف. تحقّق من تفاصيل الطلب قبل تأكيده، وتعامل باحترام مع بقية المستخدمين.</p><h2 style="font-size:18px;margin:22px 0 8px">ملاحظة مهمة</h2><p style="background:#f3f8ef;border-radius:12px;padding:12px">هذه نسخة أولية من نصوص الخصوصية وشروط الاستخدام داخل التطبيق، وليست مراجعة قانونية نهائية. قبل الإطلاق الرسمي، يجب اعتماد النصوص النهائية وإضافة بيانات الجهة المشغّلة ووسائل التواصل الرسمية وإجراءات الاحتفاظ بالبيانات وحذف الحساب.</p></article></div>';
    document.body.appendChild(legalPage);
    legalPage.querySelector('#mahattatiLegalBack').addEventListener('click',()=>{legalPage.remove();openSettings();});
  }else{legalPage.style.display='block';}
});
 $id('masAppVersion').addEventListener('click',()=>notify('إصدار التطبيق: 1.0.0'));
 $id('masDeleteAccount').addEventListener('click',async()=>{
   const button=$id('masDeleteAccount');
   button.disabled=true;
   try{
     if(typeof window.mahattatiLogout==='function') await window.mahattatiLogout();
     try{sessionStorage.removeItem('mahattati_welcome_seen')}catch(e){}
     try{document.getElementById('mahattatiAuthOverlay')?.classList.remove('open');document.getElementById('mahattatiAuthOverlay')?.setAttribute('aria-hidden','true');}catch(e){}
     page.classList.remove('open');
     page.setAttribute('aria-hidden','true');
     document.body.style.overflow='hidden';
     document.getElementById('menuBackdrop')?.classList.remove('open');
     document.getElementById('requestHistoryPage')?.classList.remove('open');
     const welcome=document.getElementById('mahattatiWelcome');
     if(welcome){welcome.hidden=false;welcome.setAttribute('aria-hidden','false');}
     else location.reload();
   }catch(error){
     notify('تعذر تسجيل الخروج من الحساب. تحقق من الاتصال ثم أعد المحاولة.');
     console.error('MAHATTATI sign-out failed:',error);
   }finally{button.disabled=false;}
 });
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&page.classList.contains('open'))closeSettings();});
 // The account tab opens this dedicated settings page rather than the side menu.
})();
