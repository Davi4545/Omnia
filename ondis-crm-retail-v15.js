/* ONDIS V15 -- only navigation and visual affordances. Never writes Firestore. */
(()=>{'use strict';
const path=location.pathname.toLowerCase();
if(path.endsWith('/crm.html')){
  document.querySelectorAll('[data-crm-simple-go]').forEach(b=>b.addEventListener('click',()=>{
    const section=b.dataset.crmSimpleGo;
    if(typeof window.showTab==='function')window.showTab(section);
    else document.getElementById('tab'+section.charAt(0).toUpperCase()+section.slice(1))?.click();
  }));
  document.querySelectorAll('.crmV15Shortcut').forEach(b=>b.setAttribute('aria-label',b.textContent.trim()));
}
if(path.endsWith('/crm-completo.html')){
  document.querySelectorAll('[data-crm-view-shortcut]').forEach(b=>b.addEventListener('click',()=>{
    const key=b.dataset.crmViewShortcut;
    const tab=document.querySelector('.crm-nav [data-view="'+key+'"]');
    if(tab){tab.click();document.querySelector('#view-'+key)?.scrollIntoView({behavior:'smooth',block:'start'});}
  }));
}
})();
