(()=>{
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const brl=n=>(Number(n)||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const store=(k,d=[])=>{try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}};
const save=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch{}};
function findData(fragment,def=[]){for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i)||'';if(k.toLowerCase().includes(fragment)){const v=store(k,null);if(Array.isArray(v)||typeof v==='object')return v}}return def}
function state(){try{return typeof window.ONDIS_STATE==='function'?window.ONDIS_STATE():null}catch{return null}}
function metrics(){
  const st=state();
  const sales=(st?.SALES||findData('sales',findData('vendas',[]))||[]).filter(x=>x&&x.status!=='cancelada');
  const fin=(st?.FIN_ENTRIES||findData('finance',findData('fin',[]))||[]).filter(x=>x&&!x.deleted);
  const products=st?.PRODUCTS||findData('product',[])||[];
  const stock=st?.STOCK||findData('stock',{})||{};
  const now=new Date(),ym=now.toISOString().slice(0,7);
  const ms=sales.filter(s=>(s.createdAt||s.date||'').slice(0,7)===ym);
  const revenue=ms.reduce((a,s)=>a+Number(s.total||s.valor||0),0);
  const pay=fin.filter(x=>x.type==='payable'&&x.status!=='paid').reduce((a,x)=>a+Number(x.amount||0),0);
  const rec=fin.filter(x=>x.type==='receivable'&&x.status!=='paid').reduce((a,x)=>a+Number(x.amount||0),0);
  return {sales,fin,products,stock,revenue,pay,rec,balance:rec-pay,count:ms.length};
}
function injectAgent(){
  if($('#v11Agent'))return;
  const isMain=/\/index\.html$/.test(location.pathname)||/\/$/.test(location.pathname);
  const markup=`<button class="v11-agent-btn${isMain?' v11-agent-inline':''}" id="v11AgentBtn" type="button" aria-label="Abrir ONDIS IA">✦ <span>IA</span></button><aside class="v11-agent" id="v11Agent" aria-hidden="true"><div class="v11-agent-head"><div><b>✦ ONDIS Intelligence</b><small>Contextual · esta tela</small></div><button id="v11AgentClose" type="button" aria-label="Fechar">×</button></div><div class="v11-agent-body" id="v11AgentBody"><div class="v11-agent-msg ai">Estou analisando esta tela e os dados disponíveis da operação. Posso explicar resultados e apontar prioridades.</div><div class="v11-agent-quick"><button type="button">Como está a operação?</button><button type="button">O que exige atenção?</button><button type="button">Como melhorar o lucro?</button><button type="button">O que fazer hoje?</button></div></div><div class="v11-agent-foot"><input id="v11AgentInput" placeholder="Pergunte ao ONDIS…"><button id="v11AgentSend" type="button">Enviar</button></div></aside>`;
  document.body.insertAdjacentHTML('beforeend',markup);
  if(isMain){
    const account=$('#accountMenu');
    const btn=$('#v11AgentBtn');
    if(account&&btn) account.parentElement.insertBefore(btn,account);
  }
  const panel=$('#v11Agent'),btn=$('#v11AgentBtn');
  btn?.addEventListener('click',()=>{panel?.classList.add('open');panel?.setAttribute('aria-hidden','false');setTimeout(()=>$('#v11AgentInput')?.focus(),60)});
  $('#v11AgentClose')?.addEventListener('click',()=>{panel?.classList.remove('open');panel?.setAttribute('aria-hidden','true')});
  $$('.v11-agent-quick button').forEach(b=>b.addEventListener('click',()=>answer(b.textContent)));
  $('#v11AgentSend')?.addEventListener('click',()=>answer($('#v11AgentInput')?.value));
  $('#v11AgentInput')?.addEventListener('keydown',e=>{if(e.key==='Enter')answer(e.target.value)});
}
function answer(q){
  q=(q||'').trim();if(!q)return;
  const m=metrics(),body=$('#v11AgentBody'); if(!body)return;
  body.insertAdjacentHTML('beforeend',`<div class="v11-agent-msg"><b>Você</b><br>${q.replace(/[<>]/g,'')}</div>`);
  let a=`Neste mês identifiquei ${brl(m.revenue)} em vendas registradas e ${m.count} venda(s). `;
  if(/lucro|finance|caixa|pagar|receber/i.test(q))a+=`Há ${brl(m.rec)} a receber e ${brl(m.pay)} a pagar nos lançamentos encontrados. A posição líquida futura é ${brl(m.balance)}.`;
  else if(/estoque|produto|compr/i.test(q))a+=`Priorize ruptura, idade do estoque e margem antes de novas compras. A Inteligência de Estoque cruza Giro × Margem.`;
  else if(/hoje|atenção|opera/i.test(q))a+=m.balance<0?'Prioridade: proteger caixa e revisar vencimentos antes de assumir novas compras.':'A posição de compromissos está equilibrada; priorize CRM de recompra e itens de baixo giro.';
  else a+=`Posso aprofundar em vendas, caixa, estoque, clientes ou equipe usando os dados disponíveis nesta instalação.`;
  body.insertAdjacentHTML('beforeend',`<div class="v11-agent-msg ai"><b>✦ ONDIS</b><br>${a}</div>`);body.scrollTop=body.scrollHeight; if($('#v11AgentInput'))$('#v11AgentInput').value='';
}
function injectFinance(){
  const view=$('#view-financeiro'); if(!view||$('#v11Finance'))return;
  const m=metrics(),wrap=document.createElement('div');wrap.id='v11Finance';wrap.className='v11-section';
  wrap.innerHTML=`<div class="v11-intel"><strong>✦ Financeiro 4.0 · leitura executiva</strong><p>Caixa, compromissos, orçamento, capital de giro e decisões em uma única leitura.</p></div><div class="v11-grid" style="margin-top:12px"><div class="v11-card v11-kpi"><small>Faturamento mês</small><b>${brl(m.revenue)}</b></div><div class="v11-card v11-kpi"><small>A receber</small><b>${brl(m.rec)}</b></div><div class="v11-card v11-kpi"><small>A pagar</small><b>${brl(m.pay)}</b></div><div class="v11-card v11-kpi"><small>Posição futura</small><b>${brl(m.balance)}</b></div></div><div class="v11-grid" style="margin-top:12px"><div class="v11-card"><h3>📅 Calendário financeiro</h3><p>Visualize vencimentos e recebimentos por dia.</p><button class="btn" id="v11OpenAccounts">Ver compromissos</button></div><div class="v11-card"><h3>🛡 Capital de giro</h3><p>Folga estimada entre recebíveis e obrigações.</p><b style="font-size:22px">${brl(m.balance)}</b></div><div class="v11-card"><h3>🎯 Meta reversa</h3><p>Defina lucro desejado e transforme em faturamento necessário.</p><input id="v11ProfitGoal" class="input" type="number" value="30000"><button class="btn" id="v11GoalBtn" style="margin-top:7px">Calcular</button><small id="v11GoalOut" style="display:block;margin-top:7px"></small></div><div class="v11-card"><h3>🧪 Cenário “E se?”</h3><p>Simule crescimento de receita.</p><input id="v11Growth" class="input" type="number" value="10" min="-90" max="500"><button class="btn" id="v11ScenarioBtn" style="margin-top:7px">Simular %</button><small id="v11ScenarioOut" style="display:block;margin-top:7px"></small></div></div>`;
  view.insertBefore(wrap,view.children[1]||null);
  $('#v11OpenAccounts')?.addEventListener('click',()=>{const b=document.querySelector('[data-fin3="pagar"]')||document.querySelector('#financeTabs button[data-fin-tab="accounts"]');b?.click()});
  $('#v11GoalBtn')?.addEventListener('click',()=>{const goal=Number($('#v11ProfitGoal')?.value||0),margin=.20;if($('#v11GoalOut'))$('#v11GoalOut').textContent=`Com margem líquida alvo de 20%, faturamento de referência: ${brl(goal/margin)}.`});
  $('#v11ScenarioBtn')?.addEventListener('click',()=>{const g=Number($('#v11Growth')?.value||0)/100;if($('#v11ScenarioOut'))$('#v11ScenarioOut').textContent=`Receita simulada: ${brl(m.revenue*(1+g))} (${g>=0?'+':''}${(g*100).toFixed(1)}%).`});
}
function injectStock(){const view=$('#view-estoque');if(!view||$('#v11Stock'))return;const el=document.createElement('div');el.id='v11Stock';el.className='v11-section v11-card';el.innerHTML=`<h3>📦 Collections Intelligence</h3><p>Leitura para moda: Giro × Margem, coleção, estação, sell-through e idade do estoque.</p><div class="v11-quad"><button type="button"><b>⭐ Estrelas</b><span>Alto giro + alta margem · proteger estoque</span></button><button type="button"><b>⚡ Geradores de fluxo</b><span>Alto giro + baixa margem · revisar preço</span></button><button type="button"><b>💎 Oportunidades</b><span>Baixo giro + alta margem · ativar CRM</span></button><button type="button"><b>🧊 Problemas</b><span>Baixo giro + baixa margem · markdown inteligente</span></button></div>`;view.insertBefore(el,view.children[1]||null)}
function inboxItems(){const m=metrics();return [m.balance<0?['🔴','Caixa futuro exige atenção',`Compromissos líquidos em ${brl(m.balance)}.`]:['🟢','Caixa projetado sob controle',`Posição líquida de ${brl(m.balance)} nos lançamentos.`],['📦','Estoque','Revisar ruptura e itens parados.'],['👥','CRM','Priorizar recompra e cashback próximo do vencimento.'],['🏆','Equipe','Usar missões de margem, CRM e estoque.']];}
function injectInbox(){
  const host=$('#view-dashboard'); if(!host||$('#v11InboxMini'))return;
  const manager=$('#managerInsights'); if(!manager)return;
  const parent=manager.parentElement,items=inboxItems(),el=document.createElement('div');el.id='v11InboxMini';el.className='v11-inbox-mini';
  el.innerHTML=`<button type="button" class="v11-inbox-toggle" aria-expanded="false"><span>🔔 <b>Inbox</b></span><span class="v11-pill">${items.length} sinais</span></button><div class="v11-inbox-detail" hidden>${items.map(x=>`<div class="v11-inbox-compact"><span>${x[0]}</span><div><b>${x[1]}</b><small>${x[2]}</small></div></div>`).join('')}</div>`;
  parent.insertBefore(el,manager);
  const toggle=el.querySelector('.v11-inbox-toggle'),detail=el.querySelector('.v11-inbox-detail');
  toggle.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')==='true';toggle.setAttribute('aria-expanded',String(!open));detail.hidden=open});
}
function injectPOS(){
  if(!location.pathname.endsWith('frente-loja.html')||$('#v11PosTools'))return;
  const actions=$('.posTitleWrap'); if(actions){const tools=document.createElement('div');tools.id='v11PosTools';tools.className='v11-pos-tools';tools.innerHTML=`<button id="v11Suspend" type="button">⏸ Suspender venda</button><button id="v11Recover" type="button">↻ Recuperar venda</button><button id="v11CustomerHistory" type="button">◷ Histórico cliente</button>`;actions.parentElement.insertAdjacentElement('afterend',tools)}
  document.body.insertAdjacentHTML('beforeend',`<div class="v11-suspended" id="v11Suspended"><div class="v11-dialog"><div class="v11-dialog-head"><h3>Vendas suspensas</h3><button id="v11SuspClose" type="button">×</button></div><div id="v11SuspList"></div></div></div>`);
  $('#v11Suspend')?.addEventListener('click',()=>{const st=state();const cart=st?.CART||{};if(!Object.keys(cart).length)return alert('Adicione produtos antes de suspender.');const arr=store('ondis_v11_suspended',[]);arr.unshift({id:Date.now(),at:new Date().toISOString(),cart:JSON.parse(JSON.stringify(cart))});save('ondis_v11_suspended',arr);Object.keys(cart).forEach(k=>delete cart[k]);window.refreshAll?.();alert('Venda suspensa com sucesso.')});
  $('#v11Recover')?.addEventListener('click',()=>{renderSusp();$('#v11Suspended')?.classList.add('open')});
  $('#v11SuspClose')?.addEventListener('click',()=>$('#v11Suspended')?.classList.remove('open'));
  $('#v11CustomerHistory')?.addEventListener('click',()=>alert('Informe o CPF na finalização para o ONDIS reconhecer o cliente e consultar o histórico vinculado ao CRM.'));
}
function renderSusp(){const a=store('ondis_v11_suspended',[]),root=$('#v11SuspList');if(!root)return;root.innerHTML=a.length?a.map(x=>`<div class="v11-inbox-item"><div class="ico">🧾</div><div><b>Venda suspensa</b><p>${new Date(x.at).toLocaleString('pt-BR')}</p></div><div class="v11-row-actions"><button type="button" data-recover="${x.id}">Recuperar</button><button type="button" data-remove="${x.id}">Excluir</button></div></div>`).join(''):'<p>Nenhuma venda suspensa.</p>';root.querySelectorAll('[data-recover]').forEach(b=>b.addEventListener('click',()=>recoverSusp(Number(b.dataset.recover))));root.querySelectorAll('[data-remove]').forEach(b=>b.addEventListener('click',()=>dropSusp(Number(b.dataset.remove))))}
function recoverSusp(id){const arr=store('ondis_v11_suspended',[]),entry=arr.find(x=>x.id===id),st=state(),cart=st?.CART;if(!entry||!cart)return alert('Não foi possível recuperar o carrinho. Atualize a página e tente novamente.');Object.keys(cart).forEach(k=>delete cart[k]);Object.entries(entry.cart||{}).forEach(([k,v])=>cart[k]=v);save('ondis_v11_suspended',arr.filter(x=>x.id!==id));$('#v11Suspended')?.classList.remove('open');window.refreshAll?.();}
function dropSusp(id){save('ondis_v11_suspended',store('ondis_v11_suspended',[]).filter(x=>x.id!==id));renderSusp()}
function injectCRM(){if(!/crm(-completo)?\.html$/.test(location.pathname)||$('#v11Crm'))return;const el=document.createElement('div');el.id='v11Crm';el.className='v11-intel v11-crm-strip';el.innerHTML=`<strong>👥 CRM Unificado</strong><p><b>CRM Hoje</b> organiza as ações rápidas e <b>CRM 360°</b> aprofunda histórico, recompra e relacionamento.</p><div class="v11-pos-tools"><button type="button" data-go="crm.html">Hoje</button><button type="button" data-go="crm-completo.html">CRM 360°</button></div>`;document.body.insertBefore(el,document.body.children[1]||null);el.querySelectorAll('[data-go]').forEach(b=>b.addEventListener('click',()=>location.href='./'+b.dataset.go))}
function injectGame(){if(!/liga|index-liga/.test(location.pathname)||$('#v11Game'))return;const el=document.createElement('section');el.id='v11Game';el.className='v11-intel v11-game-strip';el.innerHTML=`<strong>🏆 Temporada ONDIS · Missões inteligentes</strong><p>XP reforça comportamentos saudáveis: venda, margem, CRM e giro de estoque.</p><div class="v11-missions"><div class="v11-mission"><b>🎯 Meta do dia</b><div class="v11-progress"><i style="width:72%"></i></div><small>+150 XP</small></div><div class="v11-mission"><b>👥 Recuperar 3 clientes</b><div class="v11-progress"><i style="width:33%"></i></div><small>+200 XP</small></div><div class="v11-mission"><b>💰 Boa margem</b><div class="v11-progress"><i style="width:60%"></i></div><small>+250 XP</small></div><div class="v11-mission"><b>📦 Girar estoque antigo</b><div class="v11-progress"><i style="width:40%"></i></div><small>+300 XP</small></div></div>`;document.body.insertBefore(el,document.body.children[1]||null)}
function runInjections(){injectAgent();injectInbox();injectFinance();injectStock();injectPOS();injectCRM();injectGame();document.documentElement.dataset.ondisBuild='11.3.0'}
function boot(){runInjections();let tries=0;const t=setInterval(()=>{tries++;runInjections();if(state()||tries>50)clearInterval(t)},120)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
