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
    sunset: "amethyst"
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
    if(meta) meta.content = config.theme === "carbon" ? "#0b111a" : (config.theme === "ondis" ? "#08090c" : (config.theme === "custom" ? custom.background : "#f5f7fb"));
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

/* =====================================================================
   ONDIS_MODULES — controle de módulos liberados por loja
   ---------------------------------------------------------------------
   O super admin define, para cada loja, quais janelas ela pode usar.
   O mapa fica em  stores/{lojaId}.modules  =  { crm:true, ponto:false, ... }

   Regras:
   • Loja SEM mapa (nunca configurada)  -> tudo liberado (compatível com
     as lojas que já existem hoje).
   • Loja COM mapa -> só entra o que estiver explicitamente `true`.
     (módulo novo que aparecer no futuro nasce DESLIGADO nessas lojas.)
   • Super admin sempre enxerga tudo (itens desligados aparecem apagados
     com um cadeado, só para ele).

   ATENÇÃO: isto controla a interface. Para impedir também o acesso
   direto aos dados, as Regras de Segurança do Firestore precisam
   espelhar esta configuração (ver orientações entregues junto).
   ===================================================================== */
(function(){
  "use strict";

  const MODULES = [
    { id:"operacao",       label:"Operação (chão de loja)", desc:"Lista da vez, atendimentos e registro de vendas", group:"painel",  nav:["tabOps"] },
    { id:"dados",          label:"Dados",                   desc:"Histórico de atendimentos e exportações",         group:"painel",  nav:["tabDados"] },
    { id:"metas",          label:"Metas",                   desc:"Metas mensais da loja e dos vendedores",          group:"painel",  nav:["tabMetas"] },
    { id:"metasRank",      label:"Ranking de Metas",        desc:"Corrida de metas da equipe",                      group:"painel",  nav:["tabMetasRank"] },
    { id:"naoConvertidos", label:"Não Convertidos",         desc:"Análise dos atendimentos sem venda",              group:"painel",  nav:["tabNoConv"] },
    { id:"dashboard",      label:"Dashboard",               desc:"Gráficos e indicadores",                          group:"painel",  nav:["tabDashboard"] },
    { id:"arena",          label:"Arena",                   desc:"Arena de resultados do vendedor",                 group:"painel",  nav:["tabSeller"] },
    { id:"ranking",        label:"Ranking",                 desc:"Ranking geral de vendedores",                     group:"painel",  nav:["btnRanking"] },
    { id:"crm",            label:"CRM",                     desc:"Carteira de clientes, funil e disparos",          group:"modulos", nav:["btnCRM"],       page:"crm.html" },
    { id:"ponto",          label:"Ponto",                   desc:"Controle de ponto da equipe",                     group:"modulos", nav:["btnPonto"],     page:"ponto.html" },
    { id:"catalogo",       label:"Catálogo",                desc:"Vitrine de produtos e link para clientes",        group:"modulos", nav:["btnCatalogo"],  page:"catalogo.html" },
    { id:"comissao",       label:"Comissão",                desc:"Cálculo de comissão por faixas",                  group:"modulos", nav:["btnComissao"],  page:"comissao.html" }
  ];

  const BY_ID = {};
  MODULES.forEach(m => { BY_ID[m.id] = m; });

  // abas do painel principal (index.html) -> módulo
  const TAB_ORDER = ["ops","dados","metas","metasRank","noConv","dashboard","seller"];
  const TAB_TO_MODULE = { ops:"operacao", dados:"dados", metas:"metas", metasRank:"metasRank", noConv:"naoConvertidos", dashboard:"dashboard", seller:"arena" };
  const TAB_ID = { ops:"tabOps", dados:"tabDados", metas:"tabMetas", metasRank:"tabMetasRank", noConv:"tabNoConv", dashboard:"tabDashboard", seller:"tabSeller" };
  const VIEW_IDS = ["viewOps","viewDados","viewMetas","viewMetasRank","viewNoConv","viewDashboard","viewSeller"];

  let current = null;       // último mapa aplicado
  let currentRole = "";
  let redirecting = false;

  function hasConfig(map){
    return !!map && typeof map === "object" && !Array.isArray(map) && Object.keys(map).length > 0;
  }
  function isEnabled(map, id){
    if(!hasConfig(map)) return true;
    return map[id] === true;
  }
  function effective(map){
    const out = {};
    MODULES.forEach(m => { out[m.id] = isEnabled(map, m.id); });
    return out;
  }
  // Mapa "limpo" para gravar: só ids conhecidos, sempre booleanos.
  function sanitize(map){
    const out = {};
    MODULES.forEach(m => { out[m.id] = !!(map && map[m.id] === true); });
    return out;
  }

  function tabAllowed(tab){
    if(currentRole === "superadmin") return true;
    const id = TAB_TO_MODULE[tab];
    return !id || isEnabled(current, id);
  }
  function anyTabAllowed(){
    return TAB_ORDER.some(tabAllowed);
  }
  function fallbackTab(){
    for(const t of TAB_ORDER){ if(tabAllowed(t)) return t; }
    return null;
  }

  function release(){
    document.documentElement.classList.remove("modsPending");
  }

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
    } else if(note){
      note.style.display = "none";
    }
  }

  // Chamado no início de setTab() do index.html.
  // Retorna a aba a abrir (a própria, ou uma permitida) ou false se não há nenhuma.
  function guardTab(tab){
    if(tabAllowed(tab)){ showEmptyNote(false); return tab; }
    const alt = fallbackTab();
    if(alt){ showEmptyNote(false); return alt; }
    showEmptyNote(true);
    return false;
  }

  function applyNav(map, role){
    current = map;
    currentRole = role || "";
    const isSuper = currentRole === "superadmin";

    MODULES.forEach(m => {
      const on = isEnabled(map, m.id);
      (m.nav || []).forEach(nid => {
        const el = document.getElementById(nid);
        if(!el) return;
        el.classList.toggle("modHidden", !on && !isSuper);
        el.classList.toggle("modOff", !on && isSuper);
        if(!on && isSuper){ el.title = "Módulo desligado nesta loja (só o super admin vê este item)"; }
        else if(el.title && el.title.indexOf("Módulo desligado") === 0){ el.removeAttribute("title"); }
      });
    });

    // rótulo "Módulos": some se não sobrou nenhum botão visível no grupo
    const group = document.getElementById("modulosGroup");
    const label = document.getElementById("modulosLabel");
    if(group && label){
      const any = Array.prototype.some.call(group.children, b => !b.classList.contains("modHidden") && b.style.display !== "none");
      label.classList.toggle("modHidden", !any);
    }

    if(!isSuper){
      if(!anyTabAllowed()){
        showEmptyNote(true);
        // vendedor (sem menu de administração) vai direto ao 1º módulo com página própria
        const pm = MODULES.find(m => m.page && isEnabled(map, m.id));
        if(pm && currentRole !== "admin" && !redirecting){
          redirecting = true;
          location.replace("./" + pm.page);
          return;
        }
      } else {
        showEmptyNote(false);
        // se a aba aberta foi desligada, abre a primeira permitida
        const active = document.querySelector(".sideNav .navItem.active");
        if(active && active.classList.contains("modHidden")){
          const el = document.getElementById(TAB_ID[fallbackTab()]);
          if(el) el.click();
        }
      }
    }
    release();
  }

  // ---------- bloqueio de páginas inteiras (crm, ponto, comissão, catálogo) ----------
  function blockPage(id, opts){
    opts = opts || {};
    if(document.getElementById("ondisModBlock")) return;
    const m = BY_ID[id];
    const name = m ? m.label : "Este módulo";
    const wrap = document.createElement("div");
    wrap.id = "ondisModBlock";
    wrap.className = "ondisModBlock";
    const card = document.createElement("div");
    card.className = "ondisModBlockCard";
    const ico = document.createElement("div");
    ico.className = "ondisModBlockIco";
    ico.textContent = "🔒";
    const h = document.createElement("h2");
    const p = document.createElement("p");
    if(opts.publicView){
      h.textContent = "Página indisponível";
      p.textContent = "Este catálogo não está disponível no momento.";
    } else {
      h.textContent = name + " não está liberado";
      p.textContent = "O módulo " + name + " não faz parte do plano desta loja. Para contratar, fale com o administrador do ONDIS.";
    }
    card.appendChild(ico); card.appendChild(h); card.appendChild(p);
    if(!opts.publicView){
      const a = document.createElement("a");
      a.className = "ondisModBlockBtn";
      a.href = "./index.html";
      a.textContent = "← Voltar ao ONDIS";
      card.appendChild(a);
    }
    wrap.appendChild(card);
    document.body.appendChild(wrap);
  }

  // true = pode usar a página; false = bloqueou (e já mostrou o aviso)
  function guardPage(storeData, id, role, opts){
    if(role === "superadmin") return true;
    const map = storeData && storeData.modules;
    if(isEnabled(map, id)) return true;
    blockPage(id, opts);
    return false;
  }

  window.ONDIS_MODULES = {
    list(){ return MODULES.map(m => Object.assign({}, m)); },
    byId: BY_ID,
    isEnabled, effective, sanitize, hasConfig,
    applyNav, guardTab, tabAllowed, guardPage, blockPage, release
  };
})();
