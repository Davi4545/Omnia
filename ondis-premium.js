(function(){
  "use strict";

  const CACHE_KEY = "ondis_visual_config_v1";
  const VALID_THEMES = ["executive", "sapphire", "carbon", "emerald", "amethyst", "ondis", "custom"];
  const LEGACY_MAP = {
    default: "executive",
    spacewhite: "executive",
    ocean: "sapphire",
    neon: "carbon",
    textured: "carbon",
    purple: "amethyst",
    sunset: "amethyst",
    vintage: "executive",
    ultra: "executive",
    "neon-tokyo": "executive"
  };

  const DEFAULT_CUSTOM = {
    primary: "#2457e6",
    accent: "#14a98f",
    background: "#f5f7fb",
    surface: "#ffffff",
    text: "#0f172a",
    font: "Inter",
    radius: 15,
    backgroundType: "gradient",
    backgroundImage: "",
    highContrast: false
  };

  function normalizeTheme(value){
    const mapped = LEGACY_MAP[value] || value;
    return VALID_THEMES.includes(mapped) ? mapped : "executive";
  }

  function normalize(input){
    const source = input && input.ui ? input.ui : (input || {});
    return {
      theme: normalizeTheme(source.theme),
      custom: Object.assign({}, DEFAULT_CUSTOM, source.themeCustom || source.custom || {})
    };
  }

  function backgroundValue(custom){
    if(custom.backgroundType === "image" && custom.backgroundImage){
      return `linear-gradient(rgba(255,255,255,.72),rgba(255,255,255,.72)), url("${String(custom.backgroundImage).replace(/"/g, "%22")}") center/cover fixed`;
    }
    if(custom.backgroundType === "solid") return custom.background;
    return `radial-gradient(900px 460px at 92% -10%, color-mix(in srgb, ${custom.accent} 18%, transparent), transparent 64%), radial-gradient(720px 430px at 0% 105%, color-mix(in srgb, ${custom.primary} 12%, transparent), transparent 62%), ${custom.background}`;
  }

  function apply(input, persist){
    const config = normalize(input);
    const root = document.documentElement;
    const custom = config.custom;
    root.dataset.theme = config.theme;
    root.dataset.contrast = custom.highContrast ? "high" : "normal";
    root.style.setProperty("--ondis-custom-primary", custom.primary);
    root.style.setProperty("--ondis-custom-accent", custom.accent);
    root.style.setProperty("--ondis-custom-bg", custom.background);
    root.style.setProperty("--ondis-custom-surface", custom.surface);
    root.style.setProperty("--ondis-custom-text", custom.text);
    root.style.setProperty("--ondis-custom-font", custom.font);
    root.style.setProperty("--ondis-custom-radius", `${Number(custom.radius) || 15}px`);
    root.style.setProperty("--ondis-custom-background", backgroundValue(custom));

    const meta = document.querySelector('meta[name="theme-color"]');
    if(meta) meta.content = config.theme === "carbon" ? "#0b111a" : (config.theme === "ondis" ? "#0b0e13" : (config.theme === "custom" ? custom.background : "#f5f7fb"));
    if(persist !== false){
      try{ localStorage.setItem(CACHE_KEY, JSON.stringify(config)); }catch(e){}
    }
    return config;
  }

  function readCache(){
    try{ return JSON.parse(localStorage.getItem(CACHE_KEY) || "null"); }catch(e){ return null; }
  }

  window.ONDIS_THEME = {
    CACHE_KEY,
    VALID_THEMES,
    DEFAULT_CUSTOM,
    normalize,
    apply,
    applyFromState(state){ return apply(state, true); },
    readCache
  };

  apply(readCache() || { theme: "executive", custom: DEFAULT_CUSTOM }, false);
})();

/* ONDIS V8 — Command Center shortcut (Ctrl/Cmd + K) */
(function(){
  "use strict";
  if(window.__ONDIS_COMMAND_V8__) return; window.__ONDIS_COMMAND_V8__=true;
  const items=[
    ["⚡","Frente de Loja","Venda rápida, abertura e fechamento","./frente-loja.html?view=venda"],
    ["▣","ONDIS Finance","Operação, estoque, financeiro e DRE","./caixa.html"],
    ["◎","CRM Simplificado","Clientes e oportunidades do dia","./crm.html"],
    ["◉","CRM Completo","Pipeline, métricas e relacionamento","./crm-completo.html?v=10"],
    ["🛍","Catálogo","Produtos, vitrine e estoque","./catalogo.html"],
    ["◷","Ponto","Jornada e registros da equipe","./ponto.html"],
    ["🏆","Gamificação & Ranking","Liga ONDIS, metas e conquistas","./index.html#seller"],
    ["✦","Agente ONDIS IA","Perguntas e inteligência da operação","./caixa.html?view=agente"],
    ["◫","Financeiro & DRE","Lucro, caixa, ponto de equilíbrio","./caixa.html?view=financeiro"]
  ];
  function build(){
    if(document.getElementById("ondisCommandOverlay")) return;
    const overlay=document.createElement("div"); overlay.id="ondisCommandOverlay";
    overlay.innerHTML='<div class="ondisCommand" role="dialog" aria-modal="true" aria-label="Busca rápida ONDIS"><div class="ondisCommandHead"><b>⌕</b><input id="ondisCommandInput" autocomplete="off" placeholder="Buscar módulo ou ação…" aria-label="Buscar módulo ou ação"><kbd>ESC</kbd></div><div class="ondisCommandList" id="ondisCommandList"></div><div class="ondisCommandFoot"><span>↑↓ navegar · Enter abrir</span><span>ONDIS Command Center</span></div></div>';
    document.body.appendChild(overlay);
    let hint=null;
    const topbar=document.querySelector(".contentTopbar");
    if(topbar){
      hint=document.createElement("button"); hint.type="button"; hint.className="ondisSearchIcon"; hint.innerHTML='⌕'; hint.title="Busca rápida (Ctrl K)"; hint.setAttribute("aria-label","Abrir busca rápida");
      const hamb=topbar.querySelector(".hamb"); hamb?.insertAdjacentElement("afterend",hint);
    }
    const input=overlay.querySelector("#ondisCommandInput"),list=overlay.querySelector("#ondisCommandList"); const avail=()=>items.filter(it=>!window.ONDIS_MODULES||window.ONDIS_MODULES.hrefAllowed(it[3])); let active=0, filtered=avail();
    function render(){list.innerHTML="";filtered.forEach((it,i)=>{const b=document.createElement("button");b.type="button";b.className="ondisCommandItem"+(i===active?" active":"");b.innerHTML='<span class="ondisCommandIcon">'+it[0]+'</span><span><strong>'+it[1]+'</strong><small>'+it[2]+'</small></span><span>↗</span>';b.addEventListener("click",()=>location.href=it[3]);list.appendChild(b)});if(!filtered.length)list.innerHTML='<div style="padding:24px;text-align:center;color:var(--ui2-muted);font-size:12px">Nenhum módulo encontrado.</div>'}
    function open(){overlay.classList.add("open");input.value="";filtered=avail();active=0;render();setTimeout(()=>input.focus(),30)} function close(){overlay.classList.remove("open")}
    input.addEventListener("input",()=>{const q=input.value.toLowerCase().trim();filtered=avail().filter(x=>(x[1]+" "+x[2]).toLowerCase().includes(q));active=0;render()});
    input.addEventListener("keydown",e=>{if(e.key==="ArrowDown"){e.preventDefault();active=Math.min(active+1,filtered.length-1);render()}else if(e.key==="ArrowUp"){e.preventDefault();active=Math.max(active-1,0);render()}else if(e.key==="Enter"&&filtered[active])location.href=filtered[active][3];else if(e.key==="Escape")close()});
    overlay.addEventListener("mousedown",e=>{if(e.target===overlay)close()}); if(hint)hint.addEventListener("click",open);
    document.addEventListener("keydown",e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="k"){e.preventDefault();overlay.classList.contains("open")?close():open()}else if(e.key==="Escape"&&overlay.classList.contains("open"))close()});
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",build);else build();
})();

/* ONDIS V12.1 — global identity upgrade */
(function(){
  'use strict';
  function cleanupThemeUI(){
    document.querySelectorAll('[data-theme-value="ultra"],[data-theme-value="neon-tokyo"],[data-theme-value="vintage"]').forEach(el=>el.remove());
    try{
      const raw=JSON.parse(localStorage.getItem('ondis_visual_config_v1')||'null');
      if(raw && ['ultra','neon-tokyo','vintage'].includes(raw.theme)){ raw.theme='executive'; localStorage.setItem('ondis_visual_config_v1',JSON.stringify(raw)); window.ONDIS_THEME?.apply(raw,true); }
    }catch(e){}
  }
  function modernBrand(){
    const selectors=['.sidebar .brand','.sidebarBrand','.mainSidebar .brand','.crm-brand','.caixa-brand'];
    const seen=new Set();
    selectors.flatMap(sel=>[...document.querySelectorAll(sel)]).forEach(t=>{
      if(!t || seen.has(t)) return; seen.add(t);
      if(t.querySelector('.ondisBrandModern')) return;
      const close=t.querySelector('button,.sidebarClose,.collapseBtn');
      const wrap=document.createElement('div'); wrap.className='ondisBrandModern';
      wrap.innerHTML='<img class="ondisBrandSymbol" src="./ondis-symbol.png?v=12.2" alt="Símbolo ONDIS"><span class="ondisBrandCopy"><b>ONDIS</b><small>Sua loja</small></span>';
      [...t.children].forEach(x=>{if(x!==close)x.style.display='none'}); t.insertBefore(wrap,close||null);
    });
  }
  function fav(){let l=document.querySelector('link[rel~="icon"]');if(!l){l=document.createElement('link');l.rel='icon';document.head.appendChild(l)}l.href='./favicon.png?v=12.2'}
  function init(){cleanupThemeUI();modernBrand();fav()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();

/* =====================================================================
   ONDIS_MODULES — janelas liberadas por loja
   ---------------------------------------------------------------------
   O super admin define, para cada loja, o que ela pode usar. O mapa fica
   em  stores/{lojaId}.modules  =  { crm:true, ponto:false, ... }

   • Loja SEM mapa (nunca configurada) -> tudo liberado (lojas atuais
     continuam exatamente como estão).
   • Loja COM mapa -> só entra o que estiver explicitamente `true`
     (módulo criado no futuro nasce DESLIGADO nessas lojas).
   • O que NÃO estiver marcado some para todos, inclusive para o super admin
     (ele edita a lista no painel do Super Admin).

   Isto controla a INTERFACE. Para barrar também o acesso direto aos
   dados, as Regras do Firestore precisam espelhar esta configuração.
   ===================================================================== */
(function(){
  "use strict";

  // soft:true  = página sem login próprio -> bloqueada pelo cache local gravado no painel
  const MODULES = [
    { id:"operacao",       label:"Operação (chão de loja)", desc:"Lista da vez, fila e registro de atendimentos",     group:"painel",  nav:["tabOps"] },
    { id:"frenteLoja",     label:"Frente de Loja",          desc:"Venda rápida, abertura e fechamento de caixa",       group:"painel",  nav:["btnFrenteLoja"],      page:"frente-loja.html" },
    { id:"dados",          label:"Dados",                   desc:"Histórico de atendimentos e exportações",            group:"painel",  nav:["tabDados"] },
    { id:"metas",          label:"Metas",                   desc:"Metas mensais da loja e dos vendedores",             group:"painel",  nav:["tabMetas"] },
    { id:"metasRank",      label:"Ranking de Metas",        desc:"Corrida de metas da equipe",                         group:"painel",  nav:["tabMetasRank"] },
    { id:"naoConvertidos", label:"Não Convertidos",         desc:"Análise dos atendimentos sem venda",                 group:"painel",  nav:["tabNoConv"] },
    { id:"dashboard",      label:"Dashboard",               desc:"Gráficos e indicadores",                             group:"painel",  nav:["tabDashboard"] },
    { id:"liga",           label:"Liga ONDIS",              desc:"Gamificação, selos e arena do vendedor",             group:"painel",  nav:["tabSeller"],          page:"liga-ondis.html", soft:true },
    { id:"ranking",        label:"Ranking",                 desc:"Ranking geral de vendedores",                        group:"painel",  nav:["btnRanking"] },
    { id:"crm",            label:"CRM Simplificado",        desc:"Clientes e oportunidades do dia",                    group:"modulos", nav:["btnCRMSimples"],      page:"crm.html" },
    { id:"crmCompleto",    label:"CRM Completo",            desc:"Pipeline, métricas e relacionamento",                group:"modulos", nav:["btnCRMCompleto","btnDashboardCRM"], page:"crm-completo.html", soft:true },
    { id:"ponto",          label:"Ponto",                   desc:"Jornada e registros da equipe",                      group:"modulos", nav:["btnPonto"],           page:"ponto.html" },
    { id:"catalogo",       label:"Catálogo",                desc:"Produtos, vitrine e link para clientes",             group:"modulos", nav:["btnCatalogo"],        page:"catalogo.html" },
    { id:"caixa",          label:"ONDIS Finance",           desc:"PDV, fiscal, estoque, financeiro e DRE",             group:"modulos", nav:["btnCaixa"],           page:"caixa.html" },
    { id:"comissao",       label:"Comissão",                desc:"Cálculo de comissão por faixas",                     group:"modulos", nav:["btnComissao"],        page:"comissao.html" },
    { id:"comprasIntel",   label:"Compras Inteligentes",    desc:"Sugestão de reposição e compras",                    group:"modulos", nav:["btnComprasIntel"],    page:"compras-inteligentes.html", soft:true },
    { id:"collections",    label:"Collections",             desc:"Coleções e vitrines",                                group:"modulos", nav:["btnCollections"],     page:"collections.html", soft:true },
    { id:"marketing",      label:"Marketing Intelligence",  desc:"Campanhas e inteligência de marketing",              group:"modulos", nav:["btnMarketingIntel"],  page:"marketing.html", soft:true },
    { id:"fidelidade",     label:"ONDIS Club",              desc:"Programa de fidelidade e cashback",                  group:"modulos", nav:["btnFidelidade"],      page:"fidelidade.html", soft:true },
    { id:"equipe360",      label:"Equipe 360°",             desc:"Visão completa da equipe",                           group:"modulos", nav:["btnEquipe360"],       page:"equipe-360.html" },
    { id:"auditoria",      label:"Auditoria & Perdas",      desc:"Controle de perdas e divergências",                  group:"modulos", nav:["btnAuditoria"],       page:"auditoria.html", soft:true },
    { id:"omnichannel",    label:"Omnichannel",             desc:"Integração de canais de venda",                      group:"modulos", nav:["btnOmnichannel"],     page:"omnichannel.html", soft:true },
    { id:"autopilot",      label:"ONDIS Autopilot",         desc:"Automações e agente de IA",                          group:"modulos", nav:["btnAutopilot"],       page:"autopilot.html", soft:true }
  ];

  const BY_ID = {}; MODULES.forEach(m => { BY_ID[m.id] = m; });
  const BY_PAGE = {}; MODULES.forEach(m => { if(m.page) BY_PAGE[m.page] = m; });

  // abas do painel principal (index.html)
  const TAB_ORDER = ["ops","dados","metas","metasRank","noConv","dashboard","seller"];
  const TAB_TO_MODULE = { ops:"operacao", dados:"dados", metas:"metas", metasRank:"metasRank", noConv:"naoConvertidos", dashboard:"dashboard", seller:"liga" };
  const TAB_ID = { ops:"tabOps", dados:"tabDados", metas:"tabMetas", metasRank:"tabMetasRank", noConv:"tabNoConv", dashboard:"tabDashboard", seller:"tabSeller" };
  const VIEW_IDS = ["viewOps","viewDados","viewMetas","viewMetasRank","viewNoConv","viewDashboard","viewSeller"];

  const CACHE = "ondis_modules_v1";
  let current = null, currentRole = "", redirecting = false;

  function hasConfig(map){ return !!map && typeof map === "object" && !Array.isArray(map) && Object.keys(map).length > 0; }
  function isEnabled(map, id){ return hasConfig(map) ? map[id] === true : true; }
  function effective(map){ const o = {}; MODULES.forEach(m => { o[m.id] = isEnabled(map, m.id); }); return o; }
  function sanitize(map){ const o = {}; MODULES.forEach(m => { o[m.id] = !!(map && map[m.id] === true); }); return o; }

  function writeCache(map, role){
    try{
      localStorage.setItem(CACHE, JSON.stringify({ map: hasConfig(map) ? sanitize(map) : null, role: role || "", t: Date.now() }));
    }catch(e){}
  }
  function readCache(){
    try{
      const c = JSON.parse(localStorage.getItem(CACHE) || "null");
      if(!c || (Date.now() - (c.t || 0)) > 24 * 3600 * 1000) return null; // cache velho é ignorado
      return c;
    }catch(e){ return null; }
  }

  function tabAllowed(tab){
    const id = TAB_TO_MODULE[tab];
    return !id || isEnabled(current, id);
  }
  function anyTabAllowed(){ return TAB_ORDER.some(tabAllowed); }
  function fallbackTab(){ for(const t of TAB_ORDER){ if(tabAllowed(t)) return t; } return null; }
  function release(){ document.documentElement.classList.remove("modsPending"); }

  function showEmptyNote(show){
    const wrap = document.querySelector("main.wrap");
    if(!wrap) return;
    let note = document.getElementById("modsEmptyNote");
    if(show){
      VIEW_IDS.forEach(v => { const el = document.getElementById(v); if(el) el.style.display = "none"; });
      if(!note){
        note = document.createElement("div");
        note.id = "modsEmptyNote";
        note.className = "card modsEmptyNote";
        note.innerHTML = "<h2>Bem-vindo(a)!</h2><p class=\"hint\">Use o menu à esquerda para abrir os módulos liberados para a sua loja.</p>";
        wrap.insertBefore(note, wrap.firstChild);
      }
      note.style.display = "block";
    } else if(note){ note.style.display = "none"; }
  }

  // Chamado no início de setTab() do index.html: devolve a aba a abrir, ou false se não há nenhuma.
  function guardTab(tab){
    if(tabAllowed(tab)){ showEmptyNote(false); return tab; }
    const alt = fallbackTab();
    if(alt){ showEmptyNote(false); return alt; }
    showEmptyNote(true);
    return false;
  }

  function applyNav(map, role){
    current = map; currentRole = role || "";
    writeCache(map, currentRole);

    MODULES.forEach(m => {
      const on = isEnabled(map, m.id);
      (m.nav || []).forEach(nid => {
        const el = document.getElementById(nid);
        if(!el) return;
        // Módulo não marcado pelo super admin: some do menu para TODOS (inclusive o próprio super admin)
        el.classList.toggle("modHidden", !on);
        el.classList.remove("modOff");
      });
    });

    const group = document.getElementById("modulosGroup"), label = document.getElementById("modulosLabel");
    if(group && label){
      const any = Array.prototype.some.call(group.children, b => !b.classList.contains("modHidden") && b.style.display !== "none");
      label.classList.toggle("modHidden", !any);
    }

    if(!anyTabAllowed()){
      showEmptyNote(true);
      // vendedor (sem menu de administração) vai direto ao 1º módulo com página própria
      const pm = MODULES.find(m => m.page && isEnabled(map, m.id));
      if(pm && currentRole !== "admin" && currentRole !== "superadmin" && !redirecting){ redirecting = true; location.replace("./" + pm.page); return; }
    } else {
      showEmptyNote(false);
      const active = document.querySelector(".sideNav .navItem.active");
      if(active && active.classList.contains("modHidden")){
        const el = document.getElementById(TAB_ID[fallbackTab()]);
        if(el) el.click();
      }
    }
    release();
  }

  // ---------- bloqueio de páginas inteiras ----------
  function blockPage(id, opts){
    opts = opts || {};
    if(document.getElementById("ondisModBlock")) return;
    const m = BY_ID[id], name = m ? m.label : "Este módulo";
    const wrap = document.createElement("div"); wrap.id = "ondisModBlock"; wrap.className = "ondisModBlock";
    const card = document.createElement("div"); card.className = "ondisModBlockCard";
    const ico = document.createElement("div"); ico.className = "ondisModBlockIco"; ico.textContent = "🔒";
    const h = document.createElement("h2"), p = document.createElement("p");
    if(opts.publicView){ h.textContent = "Página indisponível"; p.textContent = "Este catálogo não está disponível no momento."; }
    else { h.textContent = name + " não está liberado"; p.textContent = "O módulo " + name + " não faz parte do plano desta loja. Para contratar, fale com o administrador do ONDIS."; }
    card.appendChild(ico); card.appendChild(h); card.appendChild(p);
    if(!opts.publicView){
      const a = document.createElement("a"); a.className = "ondisModBlockBtn"; a.href = "./index.html"; a.textContent = "← Voltar ao ONDIS"; card.appendChild(a);
    }
    wrap.appendChild(card); document.body.appendChild(wrap);
  }

  // true = pode usar; false = bloqueou (aviso já exibido). Falha de leitura => libera.
  function guardPage(storeData, id, role, opts){
    if(isEnabled(storeData && storeData.modules, id)) return true;
    blockPage(id, opts);
    return false;
  }

  function fileOf(href){
    const s = String(href || "").split("#")[0].split("?")[0];
    return s.split("/").pop() || "index.html";
  }
  // Usado pelo Ctrl+K: o link aponta para algo que a loja pode usar?
  function hrefAllowed(href){
    const map = current !== null ? current : (readCache() || {}).map;
    let m = BY_PAGE[fileOf(href)];
    if(!m && /index\.html#seller/.test(String(href))) m = BY_ID.liga;
    return !m || isEnabled(map, m.id);
  }

  // Páginas sem login próprio: bloqueio "suave" pelo cache gravado pelo painel.
  function softGuard(){
    const m = BY_PAGE[fileOf(location.pathname)];
    if(!m || !m.soft) return;
    const c = readCache();
    if(!c) return;
    if(!isEnabled(c.map, m.id)) blockPage(m.id);
  }
  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", softGuard); else softGuard();

  window.ONDIS_MODULES = {
    list(){ return MODULES.map(m => Object.assign({}, m)); },
    byId: BY_ID,
    isEnabled, effective, sanitize, hasConfig,
    applyNav, guardTab, tabAllowed, guardPage, blockPage, hrefAllowed, release
  };
})();

/* =====================================================================
   ONDIS_SEGMENTOS — tipo de loja (Ótica, Vestuário, Outros)
   ---------------------------------------------------------------------
   Cada segmento traz a sua lista de categorias de produto e de motivos de
   "não vendeu", usadas no atendimento (VENDEU / NÃO VENDEU).
   Em  stores/{loja}  ficam:
     segmento    "otica" | "vestuario" | "outros"
     categorias  (opcional) lista própria — substitui a do segmento
     motivos     (opcional) lista própria — substitui a do segmento
   Loja sem `segmento` (criada antes) usa Ótica, como já funcionava.
   ===================================================================== */
(function(){
  "use strict";
  const SEGMENTOS = {
    otica: {
      id:"otica", nome:"Ótica",
      categorias:["Óculos de Sol","Óculos de Grau (Armação)","Lente de Grau","Lente de Contato","Relógio","Acessórios"],
      motivos:["Preço","Não encontrou o produto","Modelo/cor","Grau/receita","Só pesquisando","Outro"],
      detalhe:{ rotulo:"Modelo / grau (opcional)", exemplo:"Ex: aviador, +1,50" }
    },
    vestuario: {
      id:"vestuario", nome:"Vestuário",
      categorias:["Camiseta","Calça","Camisa MC","Camisa ML","Vestido","Jaqueta","Acessórios","Bermuda","Saia","Polo","Boné"],
      motivos:["Preço","Não encontrou o produto","Tamanho/numeração","Modelo/cor","Só pesquisando","Outro"],
      detalhe:{ rotulo:"Numeração", exemplo:"Ex: 42, G, 38" }
    },
    outros: {
      id:"outros", nome:"Outros",
      categorias:["Produtos","Serviços","Acessórios","Outros"],
      motivos:["Preço","Não encontrou o produto","Só pesquisando","Outro"],
      detalhe:{ rotulo:"Detalhe (opcional)", exemplo:"" }
    }
  };
  const PADRAO = "otica";

  function limpa(lista, max){
    if(!Array.isArray(lista)) return null;
    const vistos = {}, out = [];
    lista.forEach(x => {
      const s = String(x == null ? "" : x).trim().slice(0, 40);
      const k = s.toLowerCase();
      if(s && !vistos[k]){ vistos[k] = 1; out.push(s); }
    });
    return out.slice(0, max || 30);
  }
  function get(id){ return SEGMENTOS[id] || SEGMENTOS[PADRAO]; }

  // Dados da loja -> o que o atendimento deve usar
  function resolve(loja){
    const seg = get(loja && loja.segmento);
    const cats = limpa(loja && loja.categorias);
    const mots = limpa(loja && loja.motivos);
    return {
      segmento: seg.id, nome: seg.nome,
      categorias: (cats && cats.length) ? cats : seg.categorias.slice(),
      motivos: (mots && mots.length) ? mots : seg.motivos.slice(),
      detalhe: Object.assign({}, seg.detalhe),
      personalizado: !!((cats && cats.length) || (mots && mots.length))
    };
  }
  // Para gravar: só guarda a lista se for diferente do padrão do segmento
  function paraGravar(segId, categorias, motivos){
    const seg = get(segId);
    const c = limpa(categorias), m = limpa(motivos);
    const igual = (a, b) => JSON.stringify(a) === JSON.stringify(b);
    return {
      segmento: seg.id,
      categorias: (c && c.length && !igual(c, seg.categorias)) ? c : null,
      motivos: (m && m.length && !igual(m, seg.motivos)) ? m : null
    };
  }
  window.ONDIS_SEGMENTOS = {
    list(){ return Object.keys(SEGMENTOS).map(k => SEGMENTOS[k]); },
    get, resolve, paraGravar, limpa, PADRAO
  };
})();

/* =====================================================================
   ONDIS_LOJA — escolha SEGURA da loja ativa
   ---------------------------------------------------------------------
   As páginas guardam a loja escolhida em sessionStorage("omnia_loja_ativa").
   Antes, qualquer valor ali era aceito — inclusive de uma sessão antiga ou
   de outra pessoa. Agora só vale se o usuário PERTENCE àquela loja
   (storeId / storeIds do cadastro) ou se for o super admin.
   Isto organiza a interface; quem barra de verdade são as Regras do Firestore.
   ===================================================================== */
(function(){
  "use strict";
  const SUPER_EMAIL = "davi.vieira.each@gmail.com";
  function idsDe(prof){
    const out = [];
    if(prof && prof.storeId) out.push(prof.storeId);
    if(prof && Array.isArray(prof.storeIds)) prof.storeIds.forEach(x => { if(x) out.push(x); });
    return out;
  }
  function ehSuper(prof){
    return !!prof && (prof.role === "superadmin" || String(prof.email || "").toLowerCase() === SUPER_EMAIL);
  }
  function escolher(prof){
    let salva = null;
    try{ salva = sessionStorage.getItem("omnia_loja_ativa"); }catch(e){}
    const ids = idsDe(prof);
    if(salva && (ehSuper(prof) || ids.indexOf(salva) !== -1)) return salva;
    return ids[0] || null;
  }
  window.ONDIS_LOJA = { escolher, idsDe, ehSuper };
})();
