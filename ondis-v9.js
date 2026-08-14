(function(){
  'use strict';
  window.ONDIS_V9={version:'9.0',label:'ONDIS Nova Era'};
  function money(v){return Number(v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}
  function enhance(){
    document.documentElement.dataset.ondisUi='v9';
    document.querySelectorAll('.pageHead').forEach(h=>h.classList.add('v9-page-head'));
    const front=document.body.classList.contains('ondis-front');
    if(front){
      const t=document.getElementById('topTitle'); if(t)t.textContent='Frente de Loja';
      const q=new URL(location.href); if(q.searchParams.get('view')!=='venda'){q.searchParams.set('view','venda');history.replaceState({},'',q)}
    }
  }
  window.renderFinanceV9=function(data){
    data=data||{}; const FIN_ENTRIES=data.FIN_ENTRIES||[], SALES=data.SALES||[];
    const host=document.getElementById('fin2Metrics'); if(!host) return;
    const now=new Date(), month=now.toISOString().slice(0,7);
    const entries=(FIN_ENTRIES||[]).filter(e=>!e.deleted);
    const sales=SALES.filter(s=>s.status!=='cancelada'&&(s.createdAt||'').slice(0,7)===month);
    const revenue=sales.reduce((a,s)=>a+Number(s.total||0),0);
    const payOpen=entries.filter(e=>e.type==='payable'&&e.status!=='paid').reduce((a,e)=>a+Number(e.amount||0),0);
    const recOpen=entries.filter(e=>e.type==='receivable'&&e.status!=='paid').reduce((a,e)=>a+Number(e.amount||0),0);
    const overdue=entries.filter(e=>e.status!=='paid'&&e.dueDate&&new Date(e.dueDate+'T23:59:59')<now).reduce((a,e)=>a+Number(e.amount||0),0);
    const net=recOpen-payOpen;
    host.innerHTML=[['Faturamento do mês',revenue],['A receber',recOpen],['A pagar',payOpen],['Exposição vencida',overdue]].map(x=>`<div class="fin2-metric"><small>${x[0]}</small><b>${money(x[1])}</b></div>`).join('');
    const score=Math.max(0,Math.min(100,Math.round(72+(net>=0?10:-12)-(overdue>0?12:0)+(revenue>0?6:0))));
    const sc=document.getElementById('fin2Score'); if(sc)sc.innerHTML=`${score}<small>/100</small>`;
    const insight=document.getElementById('fin2Insight'); if(insight){insight.textContent=overdue>0?`Há ${money(overdue)} vencidos. Priorize a regularização e preserve a reserva mínima antes de novas compras.`:net<0?`Os compromissos em aberto superam os recebíveis em ${money(Math.abs(net))}. Reforce caixa e renegocie vencimentos.`:`A posição projetada está positiva em ${money(net)} antes das demais movimentações. Continue monitorando giro e margem.`}
    const list=document.getElementById('fin2Alerts'); if(list){const arr=[]; if(overdue>0)arr.push(['!','Contas vencidas',money(overdue),'Requer ação']); if(payOpen>recOpen)arr.push(['↘','Pressão de caixa',`A pagar supera a receber em ${money(payOpen-recOpen)}`,'Atenção']); if(!arr.length)arr.push(['✓','Financeiro sob controle','Nenhuma anomalia crítica detectada nos lançamentos atuais.','Saudável']); list.innerHTML=arr.map(a=>`<div class="fin2-alert"><i>${a[0]}</i><div><b>${a[1]}</b><small>${a[2]}</small></div><span class="status">${a[3]}</span></div>`).join('')}
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',enhance);else enhance();
})();
