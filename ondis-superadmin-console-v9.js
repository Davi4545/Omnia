/* ONDIS Super Admin Console V9 — interface only.
   No Firebase imports or writes; reuses all existing administrative handlers.
*/
(() => {
  'use strict';
  const views = Object.freeze({overview:'Visão geral',stores:'Lojas e franquias',users:'Usuários e acessos',backup:'Backups'});
  const hashes = Object.freeze({overview:'visao-geral',stores:'lojas',users:'usuarios',backup:'backups'});
  const $ = id => document.getElementById(id);
  const normalize = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
  let active = 'overview';

  function navigate(view,{focusId=null,updateHash=true}={}){
    if(!(view in views)) return;
    active=view;
    document.querySelectorAll('[data-sa-panel]').forEach(panel => {
      const visible=panel.getAttribute('data-sa-panel')===view;
      panel.classList.toggle('is-active',visible);
      panel.setAttribute('aria-hidden',visible?'false':'true');
    });
    document.querySelectorAll('[data-sa-nav]').forEach(btn => {
      const visible=btn.getAttribute('data-sa-nav')===view;
      btn.classList.toggle('is-active',visible);
      if(visible) btn.setAttribute('aria-current','page');
      else btn.removeAttribute('aria-current');
    });
    const crumb=$('saBreadcrumb'); if(crumb) crumb.textContent=views[view];
    if(updateHash){
      try{history.replaceState(history.state,'','#'+hashes[view]);}catch(_e){}
    }
    window.scrollTo({top:0,behavior:'auto'});
    if(focusId){const field=$(focusId);if(field)field.focus({preventScroll:true});}
  }

  function filterTable(kind){
    const wrap=$(kind==='stores'?'tabelaLojas':'tabelaUsuarios');
    if(!wrap) return;
    const rows=[...wrap.querySelectorAll('tbody tr')];
    const total=rows.length;
    let visible=0;
    if(kind==='stores'){
      const phrase=normalize($('saStoreSearch')?.value);
      const segment=normalize($('saStoreSegment')?.value);
      rows.forEach(row=>{
        const cells=row.cells;
        const nameCode=normalize((cells[0]?.textContent||'')+' '+(cells[1]?.textContent||''));
        const segmentText=normalize(cells[3]?.textContent||'');
        const show=(!phrase||nameCode.includes(phrase))&&(!segment||segmentText.includes(segment));
        row.hidden=!show;if(show) visible++;
      });
      if($('saStoresCount'))$('saStoresCount').textContent=String(total);
      if($('saStoresFooter'))$('saStoresFooter').textContent=total?`${visible} de ${total} loja(s) exibida(s)`:'Nenhuma loja cadastrada';
    }else{
      const phrase=normalize($('saUserSearch')?.value);
      const role=normalize($('saUserRole')?.value);
      const status=normalize($('saUserStatus')?.value);
      rows.forEach(row=>{
        const cells=row.cells;
        const identity=normalize(cells[0]?.textContent||'');
        const roleText=normalize(cells[1]?.textContent||'');
        const statusText=normalize(cells[2]?.textContent||'');
        const roleMatches=!role||(role==='superadmin'?roleText.includes('super admin'):(role==='admin'?roleText.includes('administrador'):roleText.includes('vendedor')));
        const statusMatches=!status||statusText===status;
        const show=(!phrase||identity.includes(phrase))&&roleMatches&&statusMatches;
        row.hidden=!show;if(show) visible++;
      });
      if($('saUsersCount'))$('saUsersCount').textContent=String(total);
      if($('saUsersFooter'))$('saUsersFooter').textContent=total?`${visible} de ${total} usuário(s) exibido(s)`:'Nenhum usuário cadastrado';
    }
  }

  function filterModules(){
    const list=$('mmList'); if(!list)return;
    const phrase=normalize($('saModuleSearch')?.value);
    const rows=[...list.querySelectorAll('.mmRow')];
    let activeCount=0;
    rows.forEach(row=>{
      const input=row.querySelector('input[data-mod]');
      if(input?.checked)activeCount++;
      row.hidden=!!phrase&&!normalize(row.textContent).includes(phrase);
    });
    if($('saModuleSelected'))$('saModuleSelected').textContent=`${activeCount} de ${rows.length} habilitados`;
    const groups=[...list.querySelectorAll('.mmGroup')];
    groups.forEach(group=>{
      let next=group.nextElementSibling,hasVisible=false;
      while(next&&!next.classList.contains('mmGroup')){
        if(next.classList.contains('mmRow')&&!next.hidden)hasVisible=true;
        next=next.nextElementSibling;
      }
      group.hidden=!!phrase&&!hasVisible;
    });
  }

  function wire(){
    document.addEventListener('click',event=>{
      const btn=event.target.closest('[data-sa-nav],[data-sa-target]');
      if(btn){
        const view=btn.getAttribute('data-sa-nav')||btn.getAttribute('data-sa-target');
        if(view in views){event.preventDefault();navigate(view,{focusId:btn.getAttribute('data-sa-focus')});}
        return;
      }
      // Backdrop click closes the corresponding existing modal without changing data.
      const modal=event.target.closest('.modalBack.show');
      if(modal&&event.target===modal){
        const handlers={modalModulos:'fecharModulos',modalSegmento:'fecharSegmento',modalUsuariosLoja:'fecharUsuariosLoja'};
        const fn=window[handlers[modal.id]];if(typeof fn==='function')fn();
      }
    });
    document.addEventListener('keydown',event=>{
      if(event.key!=='Escape')return;
      const modal=document.querySelector('.modalBack.show');
      if(!modal)return;
      const handlers={modalModulos:'fecharModulos',modalSegmento:'fecharSegmento',modalUsuariosLoja:'fecharUsuariosLoja'};
      const fn=window[handlers[modal.id]];if(typeof fn==='function')fn();
    });
    ['saStoreSearch','saStoreSegment'].forEach(id=>$(id)?.addEventListener(id.endsWith('Search')?'input':'change',()=>filterTable('stores')));
    ['saUserSearch','saUserRole','saUserStatus'].forEach(id=>$(id)?.addEventListener(id.endsWith('Search')?'input':'change',()=>filterTable('users')));
    $('saModuleSearch')?.addEventListener('input',filterModules);
    $('mmList')?.addEventListener('change',event=>{if(event.target.matches('input[data-mod]'))filterModules();});
    if($('tabelaLojas'))new MutationObserver(()=>filterTable('stores')).observe($('tabelaLojas'),{childList:true});
    if($('tabelaUsuarios'))new MutationObserver(()=>filterTable('users')).observe($('tabelaUsuarios'),{childList:true});
    if($('mmList'))new MutationObserver(filterModules).observe($('mmList'),{childList:true});
    window.addEventListener('hashchange',()=>{
      const item=Object.keys(hashes).find(key=>hashes[key]===location.hash.slice(1));
      if(item&&item!==active)navigate(item,{updateHash:false});
    });
    const initial=Object.keys(hashes).find(key=>hashes[key]===location.hash.slice(1))||'overview';
    navigate(initial,{updateHash:false});
    filterTable('stores');filterTable('users');filterModules();
  }
  window.ONDIS_SA_UI={navigate,filterTable,filterModules};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',wire,{once:true});
  else wire();
})();
