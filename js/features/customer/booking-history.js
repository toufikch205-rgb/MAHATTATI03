/* Extracted inline script 6 from index.html; original load position preserved. */
/* Compatibility bridge: older/independent scripts may call this name directly. */
window.clearPassengerTracking = window.clearPassengerTracking || function(){
  try {
    const panel=document.getElementById('mahattatiDriverTracking');
    if(panel){
      panel.classList.remove('open','active','show');
      panel.setAttribute('aria-hidden','true');
      panel.style.setProperty('display','none','important');
      panel.style.setProperty('visibility','hidden','important');
    }
  } catch(error) { console.warn('Passenger tracking cleanup fallback:',error); }
};
function clearPassengerTracking(){
  return window.clearPassengerTracking();
}
