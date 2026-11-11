/* =====================================================================
   EQUIPE 360° — desempenho real da equipe de UMA loja
   ---------------------------------------------------------------------
   Antes esta tela era uma maquete com nomes e números fixos (iguais em
   qualquer loja). Agora tudo vem de  stores/{loja ativa}/...  :
     app/state     -> vendedores ativos
     caixa_vendas  -> faturamento, vendas, ticket e peças por vendedor
     records       -> atendimentos (vendeu / não vendeu) -> conversão
     ponto         -> quem já bateu o ponto hoje
   Os cálculos seguem as mesmas regras da “Performance 360°” do Finance.
   ===================================================================== */
(function(){
  "use strict";

  const num = v => { const n = Number(v); return isFinite(n) ? n : 0; };
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]));
  const money = v => num(v).toLocaleString("pt-BR", { style:"currency", currency:"BRL" });
  const pct = v => (v == null ? "—" : num(v).toFixed(1).replace(".", ",") + "%");
  const MESES = ["janeiro","fevereiro","março","abril","maio","junho","julho","agosto","setembro","outubro","novembro","dezembro"];

  // nome sem acento, minúsculo e com espaços normalizados (para ligar o ponto ao vendedor)
  function norm(s){
    return String(s == null ? "" : s).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s+/g, " ").trim();
  }
  function rotuloMes(ym){
    const p = String(ym || "").split("-");
    const m = MESES[(parseInt(p[1], 10) || 1) - 1] || "";
    return m ? (m.charAt(0).toUpperCase() + m.slice(1) + " de " + p[0]) : ym;
  }

  // dados = { mes:"2026-11", hoje:"2026-11-05", sellers, sales, records, pontos }
  function calcular(dados){
    const ym = dados.mes, hoje = dados.hoje;
    const vendedores = (dados.sellers || []).filter(x => x && x.active !== false);
    const vendas = (dados.sales || []).filter(s => s && s.status !== "cancelada" && String(s.createdAt || "").slice(0, 7) === ym);
    const atend = (dados.records || []).filter(r => r && r.monthKey === ym && r.source !== "caixa");
    const pontosHoje = (dados.pontos || []).filter(p => p && p.data === hoje && p.marcacoes && p.marcacoes.entrada);

    const idsVend = vendedores.map(x => x.id);
    const idsVendas = vendas.map(s => s.sellerId).filter(Boolean);
    const ids = Array.from(new Set(idsVend.concat(idsVendas)));
    const nomeDe = id => { const v = vendedores.find(x => x.id === id); return v ? (v.name || "Vendedor") : "Ex-vendedor"; };

    // ponto de hoje por nome (exato; senão pelo primeiro nome se for único)
    const pontoPorNome = {};
    pontosHoje.forEach(p => { pontoPorNome[norm(p.nome)] = p.marcacoes.entrada.hora || "✔"; });
    const chaves = Object.keys(pontoPorNome);
    function pontoDe(nome){
      const n = norm(nome);
      if(pontoPorNome[n]) return { estado:"presente", hora:pontoPorNome[n] };
      const primeiro = n.split(" ")[0];
      const iguais = chaves.filter(k => k.split(" ")[0] === primeiro);
      if(primeiro && iguais.length === 1) return { estado:"presente", hora:pontoPorNome[iguais[0]] };
      return { estado: chaves.length ? "ausente" : "semDados", hora:"" };
    }

    const linhas = ids.map(id => {
      const vs = vendas.filter(s => s.sellerId === id);
      const fat = vs.reduce((a, s) => a + num(s.total), 0);
      const pecas = vs.reduce((a, s) => a + (s.items || []).reduce((q, i) => q + num(i.qty), 0), 0);
      const at = atend.filter(r => r.sellerId === id);
      const conv = at.filter(r => r.outcome === "sold").length;
      const ativo = idsVend.indexOf(id) !== -1;
      return {
        id, nome: nomeDe(id), ativo,
        faturamento: fat, vendas: vs.length,
        ticket: vs.length ? fat / vs.length : 0, pa: vs.length ? pecas / vs.length : 0,
        atendimentos: at.length, convertidos: conv, conversao: at.length ? conv / at.length * 100 : null,
        ponto: ativo ? pontoDe(nomeDe(id)) : { estado:"semDados", hora:"" }
      };
    }).sort((a, b) => b.faturamento - a.faturamento || b.atendimentos - a.atendimentos);

    const fatTotal = vendas.reduce((a, s) => a + num(s.total), 0);
    const convTotal = atend.filter(r => r.outcome === "sold").length;
    const ativosLinhas = linhas.filter(l => l.ativo);
    const presentes = ativosLinhas.filter(l => l.ponto.estado === "presente").length;

    const kpis = {
      equipe: vendedores.length, presentes, temPonto: chaves.length > 0,
      conversao: atend.length ? convTotal / atend.length * 100 : null,
      atendimentos: atend.length, faturamento: fatTotal, vendas: vendas.length,
      ticket: vendas.length ? fatTotal / vendas.length : 0
    };

    // ---- coaching (leituras simples, sem inventar números) ----
    const dicas = [];
    const comVenda = linhas.filter(l => l.vendas > 0);
    if(comVenda.length){
      const t = comVenda[0];
      dicas.push({ titulo: t.nome + " lidera o mês com " + money(t.faturamento) + ".", texto: t.vendas + " venda(s), ticket médio de " + money(t.ticket) + "." });
    }
    if(kpis.conversao != null){
      linhas.filter(l => l.ativo && l.atendimentos >= 5 && l.conversao != null && l.conversao < kpis.conversao - 10).forEach(l => {
        dicas.push({ titulo: l.nome + " converte " + pct(l.conversao) + " — abaixo da equipe (" + pct(kpis.conversao) + ").",
                     texto: "Foram " + l.atendimentos + " atendimentos. Vale acompanhar a abordagem e os motivos de “não vendeu”." });
      });
    }
    linhas.filter(l => l.ativo && l.vendas === 0 && l.atendimentos > 0).forEach(l => {
      dicas.push({ titulo: l.nome + " ainda não vendeu neste mês.", texto: l.atendimentos + " atendimento(s) registrado(s) sem venda." });
    });
    if(kpis.temPonto){
      const sem = ativosLinhas.filter(l => l.ponto.estado === "ausente").map(l => l.nome);
      if(sem.length) dicas.push({ titulo: "Sem ponto registrado hoje: " + sem.join(", ") + ".", texto: "Confira se o nome no Ponto é igual ao do cadastro de vendedores." });
    }

    return { mes: ym, rotuloMes: rotuloMes(ym), hoje, kpis, linhas, dicas };
  }

  function pontoHtml(p){
    if(p.estado === "presente") return '<span class="pill good">✔ ' + esc(p.hora) + "</span>";
    if(p.estado === "ausente") return '<span class="pill warn">sem ponto</span>';
    return '<span style="opacity:.55">—</span>';
  }

  // Preenche a página (ids e360*). `r` é o resultado de calcular().
  function render(r, loja){
    const $ = id => document.getElementById(id);
    if($("e360Loja")) $("e360Loja").textContent = loja || "";
    if($("e360Mes")) $("e360Mes").textContent = r.rotuloMes;
    const k = r.kpis;
    if($("e360Kpis")) $("e360Kpis").innerHTML =
      '<div class="kpi"><small>Equipe ativa</small><b>' + k.equipe + "</b><em>" +
        (k.temPonto ? (k.presentes + " presente(s) hoje") : "sem ponto hoje") + "</em></div>" +
      '<div class="kpi"><small>Conversão do mês</small><b>' + pct(k.conversao) + "</b><em>" + k.atendimentos + " atendimento(s)</em></div>" +
      '<div class="kpi"><small>Faturamento do mês</small><b>' + money(k.faturamento) + "</b><em>" + k.vendas + " venda(s)</em></div>" +
      '<div class="kpi"><small>Ticket médio</small><b>' + (k.vendas ? money(k.ticket) : "—") + "</b><em>por venda</em></div>";

    if($("e360Tabela")){
      if(!r.linhas.length){
        $("e360Tabela").innerHTML = '<div class="insight"><b>Nenhum vendedor cadastrado nesta loja.</b>Cadastre a equipe no painel principal (Lista da Vez).</div>';
      } else {
        $("e360Tabela").innerHTML = '<table class="table"><tr><th>Vendedor</th><th>Faturamento</th><th>Vendas</th><th>Ticket</th><th>P.A.</th><th>Atend.</th><th>Conversão</th><th>Ponto hoje</th></tr>' +
          r.linhas.map(l => "<tr><td><b>" + esc(l.nome) + "</b>" + (l.ativo ? "" : ' <small style="opacity:.6">(inativo)</small>') + "</td><td>" + money(l.faturamento) + "</td><td>" + l.vendas + "</td><td>" +
            (l.vendas ? money(l.ticket) : "—") + "</td><td>" + (l.vendas ? l.pa.toFixed(1).replace(".", ",") : "—") + "</td><td>" + l.atendimentos + "</td><td>" + pct(l.conversao) + "</td><td>" + pontoHtml(l.ponto) + "</td></tr>").join("") + "</table>";
      }
    }
    if($("e360Coach")){
      $("e360Coach").innerHTML = r.dicas.length
        ? r.dicas.map(d => '<div class="insight"><b>' + esc(d.titulo) + "</b>" + esc(d.texto) + "</div>").join("")
        : '<div class="insight"><b>Ainda não há dados suficientes neste mês.</b>Conforme a equipe registrar atendimentos e vendas, as leituras aparecem aqui.</div>';
    }
  }

  window.Equipe360 = { calcular, render, norm, money, pct, rotuloMes };
})();
