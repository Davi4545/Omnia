/* ONDIS: contraste visual de temas personalizados. Sem leitura/escrita de banco. */
(() => {
  'use strict';
  const root=document.documentElement;
  function relativeLuminance(color){
    const c=String(color||'').trim();
    let parts=null;
    if(/^#([a-f\d]{3}|[a-f\d]{6})$/i.test(c)){
      const h=c.length===4 ? c.slice(1).split('').map(x=>x+x).join('') : c.slice(1);
      parts=[0,2,4].map(i=>parseInt(h.slice(i,i+2),16));
    } else {
      const m=c.match(/rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/i);
      if(m)parts=[Number(m[1]),Number(m[2]),Number(m[3])];
    }
    if(!parts)return null;
    const [r,g,b]=parts.map(v=>{v=Math.max(0,Math.min(1,v/255));return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;});
    return .2126*r+.7152*g+.0722*b;
  }
  const darkThemes=new Set(['neon','ocean','sunset','purple','textured']);
  function sync(){
    const theme=root.dataset.theme||'executive';
    if(theme==='custom'){
      const style=getComputedStyle(root);
      const surface=style.getPropertyValue('--ondis-custom-surface').trim()
                    ||style.getPropertyValue('--ondis-surface').trim();
      const value=relativeLuminance(surface);
      if(value!==null)root.dataset.ondisSurfaceTone=value<.18?'dark':'light';
    } else root.dataset.ondisSurfaceTone=darkThemes.has(theme)?'dark':'light';
  }
  const obs=new MutationObserver(mutations=>{
    if(mutations.some(m=>m.attributeName==='data-theme'||m.attributeName==='style'))sync();
  });
  obs.observe(root,{attributes:true,attributeFilter:['data-theme','style']});
  function setupAccountAccessibility(){
    const button=document.getElementById('btnAccount');
    const popup=document.getElementById('accountDrop');
    if(!button||!popup)return;
    button.setAttribute('aria-controls','accountDrop');
    button.setAttribute('aria-haspopup','true');
    const refresh=()=>button.setAttribute('aria-expanded',popup.classList.contains('show')?'true':'false');
    new MutationObserver(refresh).observe(popup,{attributes:true,attributeFilter:['class']});
    refresh();
    document.addEventListener('keydown',event=>{
      if(event.key!=='Escape'||!popup.classList.contains('show'))return;
      if(typeof window.closeAccountMenu==='function')window.closeAccountMenu();
      else popup.classList.remove('show');
      button.focus();
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{sync();setupAccountAccessibility();},{once:true});
  else {sync();setupAccountAccessibility();}
})();
