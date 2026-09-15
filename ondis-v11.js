(()=>{
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const brl=n=>(Number(n)||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const store=(k,d=[])=>{try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}};
const save=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch{}};
function findData(fragment,def=[]){for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i)||'';if(k.toLowerCase().includes(fragment)){const v=store(k,null);if(Array.isArray(v)||typeof v==='object')return v}}return def}
function state(){try{if(typeof window.ONDIS_STATE==='function')return window.ONDIS_STATE();if(typeof window.OMNIA_GET_STATE==='function')return window.OMNIA_GET_STATE();return null}catch{return null}}
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
function esc(v){return String(v??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]))}
function norm(v){return String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim()}
const AI_KB={
  'frente de loja':{title:'Frente de Loja',text:'É o PDV operacional do ONDIS. Nele você abre o caixa, identifica cliente e vendedor, lança produtos por busca ou código, aplica cashback, marca presente, suspende/recupera vendas, faz troca e finaliza pagamento.',go:'frente-loja.html'},
  'ondis finance':{title:'ONDIS Finance',text:'É a retaguarda financeira e operacional: Central do Gestor, compras inteligentes, Performance 360°, Clientes 360°, vendas, trocas, estoque, inventário, notas fiscais, DRE, contas, fluxo de caixa, fornecedores, Open to Buy e precificação.',go:'caixa.html'},
  'financeiro':{title:'Financeiro',text:'Reúne contas a pagar e receber, fluxo de caixa, DRE & margem, orçamento, metas e cenários, rentabilidade, fornecedores 360°, Open to Buy e precificação. A ideia é mostrar lucro real, ponto de equilíbrio e capacidade segura de compra.',go:'caixa.html?view=financeiro'},
  'dre':{title:'DRE inteligente',text:'Calcula receita líquida, CMV, despesas fixas e variáveis, margem de contribuição, lucro operacional, ponto de equilíbrio e meta de faturamento para a margem desejada.',go:'caixa.html?view=dre'},
  'crm':{title:'CRM',text:'O CRM Hoje organiza as ações do dia; o CRM 360° aprofunda histórico, recompra, relacionamento, clientes sumidos, campanhas e perfil 360°.',go:'crm.html'},
  'crm 360':{title:'CRM 360°',text:'Mostra o histórico completo do cliente, frequência, ticket, cashback, recompra e relacionamento. É a visão detalhada para gestão e segmentação.',go:'crm-completo.html'},
  'lista da vez':{title:'Lista da Vez',text:'Organiza a fila de vendedores e mede atendimento, vendas, conversão, PA e tempo médio. Quando a venda é registrada também na Frente de Loja, o ONDIS cruza os dados para medir usabilidade.',go:'index.html?view=operacao'},
  'estoque':{title:'Estoque',text:'Controla saldo, entradas, inventário, divergências, giro, cobertura, ruptura e estoque parado. Collections Intelligence cruza giro × margem para orientar reposição e markdown.',go:'caixa.html?view=estoque'},
  'inventario':{title:'Inventário',text:'Permite bipar as peças, cruzar o físico com o estoque da operação e apontar faltas, sobras e duplicidades antes de aplicar o ajuste.',go:'caixa.html?view=inventario'},
  'cashback':{title:'Cashback',text:'O ONDIS reconhece o cliente pelo CPF, consulta saldo disponível e pode aplicar o benefício na venda. As regras podem variar por padrão, VIP, aniversário ou estoque parado.',go:'frente-loja.html'},
  'troca':{title:'Troca de produto',text:'A Frente de Loja localiza a compra por CPF ou código de troca, valida o item devolvido, recebe o novo produto e calcula automaticamente eventual diferença de valor.',go:'frente-loja.html'},
  'presente':{title:'Venda para presente',text:'Ao marcar “Para presente”, o ONDIS prepara um canhoto não fiscal com loja, data, código de troca, produtos e prazo de 30 dias para troca.',go:'frente-loja.html'},
  'ranking':{title:'Ranking & Gamificação',text:'O ONDIS combina meta, vendas, conversão, PA, CRM, margem e usabilidade. Selos, XP, missões e temporadas estimulam comportamentos saudáveis — não só faturamento.',go:'index.html?view=ranking'},
  'ponto':{title:'Ponto',text:'Módulo de jornada e presença da equipe, pensado para conversar com performance, pontualidade e gestão de vendedores.',go:'ponto.html'},
  'catalogo':{title:'Catálogo',text:'Vitrine digital de produtos com filtros e montagem de link para cliente. Pode alimentar pré-venda e omnichannel.',go:'catalogo.html'},
  'compras':{title:'Compras Inteligentes',text:'Cruza vendas, giro, cobertura, ruptura, caixa e Open to Buy para sugerir o que comprar, quanto e quando.',go:'compras-inteligentes.html'},
  'collections':{title:'Collections Intelligence',text:'Acompanha coleção, sell-through, idade de estoque, margem e giro. Classifica produtos e ajuda a decidir reposição, ativação ou markdown.',go:'collections.html'},
  'marketing':{title:'Marketing Intelligence',text:'Cria públicos usando dados reais do CRM e acompanha campanhas, clientes reativados, receita e ROI.',go:'marketing.html'},
  'club':{title:'ONDIS Club',text:'Camada de fidelidade para níveis, pontos, cashback e benefícios, conectada ao histórico de compra do cliente.',go:'fidelidade.html'},
  'auditoria':{title:'Auditoria & Perdas',text:'Sinaliza descontos, cancelamentos, divergências e alterações fora do padrão, mantendo trilha de revisão gerencial.',go:'auditoria.html'},
  'omnichannel':{title:'Omnichannel',text:'Organiza pedidos vindos de catálogo e outros canais em etapas como novo, separando, pagamento, pronto e entregue.',go:'omnichannel.html'},
  'open to buy':{title:'Open to Buy',text:'Calcula uma referência de orçamento seguro de compras cruzando caixa, estoque, vendas e compromissos futuros.',go:'caixa.html?view=open-to-buy'},
  'precificacao':{title:'Precificação',text:'Simula preço e margem considerando custo, taxas, descontos, cashback e margem desejada.',go:'caixa.html?view=precificacao'},
  'metas':{title:'Metas',text:'Acompanha meta da loja e vendedores. No ONDIS Finance, metas financeiras podem ser derivadas do lucro ou margem desejados.',go:'index.html?view=metas'},
  'performance 360':{title:'Performance 360°',text:'Analisa vendedor por faturamento, conversão, PA, ticket, margem, CRM e usabilidade do ONDIS.',go:'caixa.html?view=performance'},
  'clientes 360':{title:'Clientes 360°',text:'Consolida histórico de compra, ticket, frequência, cashback, categoria favorita e risco de afastamento do cliente.',go:'caixa.html?view=clientes360'},
  'autopilot':{title:'ONDIS Autopilot',text:'Prioriza decisões por impacto e urgência, reunindo recomendações de caixa, estoque, CRM, margem e operação.',go:'autopilot.html'}
};
function aiContext(){
  const st=state()||{};
  const sales=(st.SALES||st.sales||findData('sales',findData('vendas',[]))||[]).filter(x=>x&&x.status!=='cancelada');
  const fin=(st.FIN_ENTRIES||st.finEntries||findData('finance',findData('fin',[]))||[]).filter(x=>x&&!x.deleted);
  const products=st.PRODUCTS||st.products||findData('product',[])||[];
  const stock=st.STOCK||st.stock||findData('stock',{})||{};
  const clients=st.CLIENTS||st.clients||findData('client',[])||[];
  const sellers=st.SELLERS||st.sellers||[];
  const records=st.TURN_RECORDS||st.records||[];
  const now=new Date(),ym=now.toISOString().slice(0,7),today=now.toISOString().slice(0,10);
  const monthSales=sales.filter(x=>String(x.createdAt||x.date||'').slice(0,7)===ym);
  const todaySales=sales.filter(x=>String(x.createdAt||x.date||'').slice(0,10)===today);
  const revenue=monthSales.reduce((a,x)=>a+Number(x.total||x.valor||x.amount||0),0);
  const revenueToday=todaySales.reduce((a,x)=>a+Number(x.total||x.valor||x.amount||0),0);
  const pay=fin.filter(x=>/payable|pagar/i.test(x.type||x.kind||'')&&x.status!=='paid').reduce((a,x)=>a+Number(x.amount||x.valor||0),0);
  const rec=fin.filter(x=>/receivable|receber/i.test(x.type||x.kind||'')&&x.status!=='paid').reduce((a,x)=>a+Number(x.amount||x.valor||0),0);
  const sellerMap={};monthSales.forEach(x=>{const n=x.sellerName||x.vendedor||x.seller||'Sem vendedor';sellerMap[n]=(sellerMap[n]||0)+Number(x.total||x.valor||0)});
  const topSeller=Object.entries(sellerMap).sort((a,b)=>b[1]-a[1])[0]||null;
  const itemCount=monthSales.reduce((a,s)=>a+(s.items||[]).reduce((q,i)=>q+Number(i.qty||1),0),0);
  let stockUnits=0,low=0; if(stock&&typeof stock==='object')Object.values(stock).forEach(v=>{const n=Number(typeof v==='object'?(v.qty??v.quantity??v.stock??0):v)||0;stockUnits+=n;if(n<=2)low++});
  const completed=records.filter(r=>/vend|sale|conclu/i.test(r.result||r.status||'')).length;
  const attended=records.filter(r=>r&&r.status!=='cancelado').length;
  return {st,sales,monthSales,todaySales,fin,products,stock,clients,sellers,records,revenue,revenueToday,pay,rec,balance:rec-pay,topSeller,itemCount,stockUnits,low,conversion:attended?completed/attended*100:null};
}
function aiInsight(c){
  const out=[];
  if(c.balance<0)out.push(`Caixa futuro pressionado: obrigações superam recebíveis em <b>${brl(Math.abs(c.balance))}</b>.`);
  else if(c.rec||c.pay)out.push(`Posição financeira futura positiva em <b>${brl(c.balance)}</b>.`);
  if(c.low)out.push(`<b>${c.low}</b> item(ns) com saldo muito baixo merecem revisão de ruptura.`);
  if(c.topSeller)out.push(`<b>${esc(c.topSeller[0])}</b> lidera o faturamento do mês com ${brl(c.topSeller[1])}.`);
  if(c.revenueToday>0)out.push(`Hoje foram registrados <b>${brl(c.revenueToday)}</b> em vendas.`);
  if(!out.length)out.push('Ainda não encontrei dados suficientes para um diagnóstico completo nesta tela. Posso explicar qualquer módulo ou orientar o próximo passo.');
  return out;
}
function kbMatch(q){const n=norm(q);let best=null;for(const [k,v] of Object.entries(AI_KB)){if(n.includes(norm(k))&&(best==null||k.length>best[0].length))best=[k,v]}return best?.[1]||null}
function aiLocalAnswer(q){
  const n=norm(q),c=aiContext(),kb=kbMatch(q);
  if(/^(oi|ola|bom dia|boa tarde|boa noite|hey)\b/.test(n))return {html:`Olá! Sou o <b>ONDIS Intelligence</b>. Posso responder sobre o sistema e analisar vendas, financeiro, estoque, clientes, equipe, metas, CRM, caixa e operação.`,chips:['Como está a operação?','Onde estou perdendo dinheiro?','Qual módulo devo usar?']};
  if(/(explique os modulos|quais modulos|lista de modulos|modulos do ondis)/.test(n))return {html:'<b>Mapa do ONDIS</b><br>Operação: Lista da Vez, Frente de Loja, metas e ranking.<br>Relacionamento: CRM Hoje, CRM 360°, Marketing e ONDIS Club.<br>Gestão: ONDIS Finance, DRE, contas, fluxo de caixa, estoque, inventário e compras.<br>Inteligência: Collections, Equipe 360°, Auditoria, Omnichannel e Autopilot.',chips:['Explique o ONDIS Finance','Explique o CRM','Explique Collections','Como funciona o Autopilot?']};
  if(/(o que voce faz|como voce pode ajudar|ajuda|comandos|perguntar)/.test(n))return {html:'Eu consigo <b>explicar qualquer módulo</b>, orientar como executar tarefas e interpretar os dados disponíveis nesta instalação. Também consigo gerar uma leitura gerencial de prioridades, caixa, vendas, estoque, CRM e equipe.',chips:['Faça um diagnóstico','Explique o ONDIS Finance','Como funciona a Lista da Vez?']};
  if(/(diagnostico|como esta a operacao|resumo|situacao da loja|visao geral)/.test(n)){const ins=aiInsight(c);return {html:`<b>Diagnóstico agora</b><br>Faturamento do mês: <b>${brl(c.revenue)}</b> · hoje: <b>${brl(c.revenueToday)}</b> · vendas no mês: <b>${c.monthSales.length}</b>.<br><br>${ins.map(x=>'• '+x).join('<br>')}`,chips:['O que exige atenção?','Como melhorar o lucro?','Quem está vendendo mais?']};}
  if(/(quem|qual vendedor|lider|ranking).*(vende|fatura|melhor|lider)/.test(n)||/(melhor vendedor|quem esta vendendo)/.test(n))return {html:c.topSeller?`No mês, <b>${esc(c.topSeller[0])}</b> lidera o faturamento registrado com <b>${brl(c.topSeller[1])}</b>. Posso também explicar por que faturamento sozinho não define melhor performance — conversão, PA, margem, CRM e usabilidade também importam.`:'Não encontrei vendas vinculadas a vendedores suficientes nesta tela para montar um ranking confiável.',chips:['Como medir vendedor 360°?','Como funciona a usabilidade?']};
  if(/(quanto|faturamento|vendas).*(hoje)/.test(n))return {html:`Hoje há <b>${c.todaySales.length}</b> venda(s) registrada(s), somando <b>${brl(c.revenueToday)}</b>.`,chips:['E no mês?','Quem vendeu mais?']};
  if(/(quanto|faturamento|vendas).*(mes|mês)/.test(n))return {html:`No mês atual há <b>${c.monthSales.length}</b> venda(s), totalizando <b>${brl(c.revenue)}</b> e <b>${c.itemCount}</b> item(ns) vendidos.`,chips:['Como melhorar o lucro?','Ver financeiro']};
  if(/(caixa|finance|conta|pagar|receber|saldo|capital de giro|dinheiro)/.test(n))return {html:`<b>Leitura financeira</b><br>A receber: <b>${brl(c.rec)}</b><br>A pagar: <b>${brl(c.pay)}</b><br>Posição líquida: <b>${brl(c.balance)}</b>.<br>${c.balance<0?'Prioridade: revisar vencimentos, compras e geração de caixa antes de assumir novos compromissos.':'A posição encontrada não indica pressão líquida imediata nos lançamentos disponíveis.'}`,chips:['Como funciona o DRE?','Quanto posso comprar?','Como melhorar o lucro?']};
  if(/(lucro|margem|rentabilidade|perdendo dinheiro|melhorar o lucro)/.test(n))return {html:'Para melhorar lucro, o ONDIS deve atacar nesta ordem: <b>margem por venda → desconto → CMV → estoque parado → despesas → mix de produtos</b>. Use DRE & Margem para descobrir a origem, Rentabilidade para localizar produto/vendedor/categoria e Collections para agir no estoque.',chips:['Explique o DRE','O que é Giro × Margem?','Como reduzir estoque parado?']};
  if(/(estoque|ruptura|parado|encalhado|giro|sell.?through|markdown)/.test(n))return {html:`O sistema encontrou <b>${c.products.length}</b> produto(s) cadastrados${c.stockUnits?` e aproximadamente <b>${c.stockUnits}</b> unidade(s) no saldo lido`:''}.${c.low?` <b>${c.low}</b> saldo(s) estão em nível muito baixo.`:''}<br><br>Para decidir, use <b>Giro × Margem</b>: estrelas devem ser protegidas, alto giro/baixa margem pede revisão de preço, baixo giro/alta margem pede ativação comercial e baixo giro/baixa margem pede markdown.`,chips:['Como funciona Collections?','O que comprar agora?']};
  if(/(cliente|crm|recompra|sumido|vip|cashback|campanha)/.test(n)&&!kb)return {html:`O ONDIS usa histórico de compra, frequência, ticket, cashback e comportamento de recompra para priorizar clientes. Nesta instalação encontrei <b>${c.clients.length}</b> registro(s) de cliente na fonte disponível nesta tela.`,chips:['Explique o CRM 360','Como recuperar clientes sumidos?','Como funciona cashback?']};
  if(/(onde|como acesso|abrir|ir para).*(modulo|módulo|finance|crm|estoque|frente|ponto|catalogo)/.test(n)&&kb)return {html:`<b>${kb.title}</b><br>${kb.text}`,action:{label:`Abrir ${kb.title}`,go:kb.go}};
  if(kb)return {html:`<b>${kb.title}</b><br>${kb.text}`,action:{label:`Abrir ${kb.title}`,go:kb.go}};
  if(/(o que fazer hoje|prioridade|exige atencao|atenção|acao hoje)/.test(n)){const ins=aiInsight(c);return {html:`<b>Prioridades sugeridas</b><br>${ins.map((x,i)=>`${i+1}. ${x}`).join('<br>')}<br><br>Depois disso, eu priorizaria CRM de recompra e produtos com baixo giro.`,chips:['Faça um diagnóstico','Como melhorar o lucro?']};}
  if(/(o que e|o que é|para que serve|como funciona)/.test(n))return {html:'Não reconheci o nome exato do recurso na pergunta. Posso explicar qualquer área do ONDIS. Tente citar o módulo ou a ação, por exemplo: <b>“Como funciona o Open to Buy?”</b>, <b>“Para que serve o Autopilot?”</b> ou <b>“Como faço uma troca?”</b>.',chips:['Lista da Vez','ONDIS Finance','CRM','Collections']};
  return {html:`Entendi sua pergunta: <b>${esc(q)}</b>.<br><br>Com os dados disponíveis nesta tela, vejo <b>${brl(c.revenue)}</b> de faturamento no mês e ${c.monthSales.length} venda(s). Para eu ser mais específico, você pode mencionar o assunto — financeiro, vendas, estoque, cliente, vendedor, meta, CRM, troca, cashback ou qualquer módulo.`,chips:['Faça um diagnóstico','Explique os módulos','O que exige atenção?']};
}
function addAgentMessage(html,who='ai',extra={}){const body=$('#v11AgentBody');if(!body)return;const div=document.createElement('div');div.className='v11-agent-msg '+who;div.innerHTML=html;body.appendChild(div);if(extra.action){const a=document.createElement('button');a.className='v11-ai-action';a.textContent=extra.action.label;a.onclick=()=>location.href='./'+extra.action.go;div.appendChild(a)}if(extra.chips?.length){const chips=document.createElement('div');chips.className='v11-ai-inline-chips';extra.chips.slice(0,4).forEach(t=>{const b=document.createElement('button');b.type='button';b.textContent=t;b.onclick=()=>answer(t);chips.appendChild(b)});div.appendChild(chips)}body.scrollTop=body.scrollHeight}
function injectAgent(){
  if($('#v11Agent'))return;
  const isMain=/\/index(?:-liga-ondis)?\.html$/.test(location.pathname)||/\/$/.test(location.pathname);
  const markup=`<button class="v11-agent-btn${isMain?' v11-agent-inline':''}" id="v11AgentBtn" type="button" aria-label="Abrir ONDIS IA">✦ <span>IA</span></button><aside class="v11-agent" id="v11Agent" aria-hidden="true"><div class="v11-agent-head"><div><b>✦ ONDIS Intelligence</b><small>Assistente do sistema · dados da operação</small></div><div class="v11-agent-head-actions"><button id="v11AgentClear" type="button" title="Limpar conversa">↺</button><button id="v11AgentClose" type="button" aria-label="Fechar">×</button></div></div><div class="v11-agent-context"><span>● Contexto ativo</span><b id="v11AgentContextName">${esc(document.title.split('—')[0]||'ONDIS')}</b></div><div class="v11-agent-body" id="v11AgentBody"><div class="v11-agent-msg ai"><b>✦ Posso ajudar com praticamente qualquer coisa dentro do ONDIS.</b><br>Faça perguntas sobre operação, vendas, caixa, DRE, estoque, clientes, vendedores, metas, CRM, cashback, trocas, módulos ou peça um diagnóstico da loja.</div><div class="v11-agent-quick"><button type="button">Faça um diagnóstico</button><button type="button">O que exige atenção?</button><button type="button">Como melhorar o lucro?</button><button type="button">Explique os módulos</button></div></div><div class="v11-agent-foot"><div class="v11-agent-inputwrap"><textarea id="v11AgentInput" rows="1" placeholder="Pergunte qualquer coisa sobre o ONDIS…"></textarea><small>Enter envia · Shift+Enter quebra linha</small></div><button id="v11AgentSend" type="button">Enviar</button></div></aside>`;
  document.body.insertAdjacentHTML('beforeend',markup);
  if(isMain){const account=$('#accountMenu');const btn=$('#v11AgentBtn');if(account&&btn)account.parentElement.insertBefore(btn,account)}
  const panel=$('#v11Agent'),btn=$('#v11AgentBtn');
  btn?.addEventListener('click',()=>{panel?.classList.add('open');panel?.setAttribute('aria-hidden','false');setTimeout(()=>$('#v11AgentInput')?.focus(),60)});
  $('#v11AgentClose')?.addEventListener('click',()=>{panel?.classList.remove('open');panel?.setAttribute('aria-hidden','true')});
  $('#v11AgentClear')?.addEventListener('click',()=>{const body=$('#v11AgentBody');if(body)body.innerHTML='<div class="v11-agent-msg ai"><b>✦ Conversa limpa.</b><br>O que você quer analisar agora?</div>'});
  $$('.v11-agent-quick button').forEach(b=>b.addEventListener('click',()=>answer(b.textContent)));
  $('#v11AgentSend')?.addEventListener('click',()=>answer($('#v11AgentInput')?.value));
  $('#v11AgentInput')?.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();answer(e.target.value)}});
}
function answer(q){q=(q||'').trim();if(!q)return;addAgentMessage(`<b>Você</b><br>${esc(q)}`,'user');const input=$('#v11AgentInput');if(input)input.value='';const r=aiLocalAnswer(q);addAgentMessage(`<b>✦ ONDIS</b><br>${r.html}`,'ai',r)}
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
function injectCRM(){if(!/\/crm\.html$/.test(location.pathname)||$('#v11Crm'))return;const el=document.createElement('section');el.id='v11Crm';el.className='v11-crm-strip';el.innerHTML=`<div class="v11-crm-icon">👥</div><div class="v11-crm-copy"><span class="v11-eyebrow">CRM UNIFICADO</span><strong>Relacionamento que vira recorrência</strong><p><b>Hoje</b> concentra as ações prioritárias. <b>CRM 360°</b> aprofunda histórico, recompra e relacionamento.</p></div><div class="v11-crm-actions"><button class="active" type="button" data-go="crm.html">⚡ Hoje</button><button type="button" data-go="crm-completo.html">◎ CRM 360°</button></div>`;document.body.insertBefore(el,document.body.children[1]||null);el.querySelectorAll('[data-go]').forEach(b=>b.addEventListener('click',()=>location.href='./'+b.dataset.go))}
function injectGame(){if(!/liga|index-liga/.test(location.pathname)||$('#v11Game'))return;const el=document.createElement('section');el.id='v11Game';el.className='v11-intel v11-game-strip';el.innerHTML=`<strong>🏆 Temporada ONDIS · Missões inteligentes</strong><p>XP reforça comportamentos saudáveis: venda, margem, CRM e giro de estoque.</p><div class="v11-missions"><div class="v11-mission"><b>🎯 Meta do dia</b><div class="v11-progress"><i style="width:72%"></i></div><small>+150 XP</small></div><div class="v11-mission"><b>👥 Recuperar 3 clientes</b><div class="v11-progress"><i style="width:33%"></i></div><small>+200 XP</small></div><div class="v11-mission"><b>💰 Boa margem</b><div class="v11-progress"><i style="width:60%"></i></div><small>+250 XP</small></div><div class="v11-mission"><b>📦 Girar estoque antigo</b><div class="v11-progress"><i style="width:40%"></i></div><small>+300 XP</small></div></div>`;document.body.insertBefore(el,document.body.children[1]||null)}
function runInjections(){injectAgent();injectInbox();injectFinance();injectStock();injectPOS();injectCRM();injectGame();document.documentElement.dataset.ondisBuild='12.3.0'}
function boot(){runInjections();let tries=0;const t=setInterval(()=>{tries++;runInjections();if(state()||tries>50)clearInterval(t)},120)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
