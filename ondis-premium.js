(function(){
  "use strict";

  const CACHE_KEY = "ondis_visual_config_v1";
  const VALID_THEMES = ["executive", "sapphire", "carbon", "emerald", "amethyst", "vintage", "custom"];
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
    if(meta) meta.content = config.theme === "carbon" ? "#0b111a" : (config.theme === "custom" ? custom.background : "#f5f7fb");
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
    ["▣","Caixa ONDIS","Operação, estoque, financeiro e DRE","./caixa.html"],
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
    const input=overlay.querySelector("#ondisCommandInput"),list=overlay.querySelector("#ondisCommandList"); let active=0, filtered=items.slice();
    function render(){list.innerHTML="";filtered.forEach((it,i)=>{const b=document.createElement("button");b.type="button";b.className="ondisCommandItem"+(i===active?" active":"");b.innerHTML='<span class="ondisCommandIcon">'+it[0]+'</span><span><strong>'+it[1]+'</strong><small>'+it[2]+'</small></span><span>↗</span>';b.addEventListener("click",()=>location.href=it[3]);list.appendChild(b)});if(!filtered.length)list.innerHTML='<div style="padding:24px;text-align:center;color:var(--ui2-muted);font-size:12px">Nenhum módulo encontrado.</div>'}
    function open(){overlay.classList.add("open");input.value="";filtered=items.slice();active=0;render();setTimeout(()=>input.focus(),30)} function close(){overlay.classList.remove("open")}
    input.addEventListener("input",()=>{const q=input.value.toLowerCase().trim();filtered=items.filter(x=>(x[1]+" "+x[2]).toLowerCase().includes(q));active=0;render()});
    input.addEventListener("keydown",e=>{if(e.key==="ArrowDown"){e.preventDefault();active=Math.min(active+1,filtered.length-1);render()}else if(e.key==="ArrowUp"){e.preventDefault();active=Math.max(active-1,0);render()}else if(e.key==="Enter"&&filtered[active])location.href=filtered[active][3];else if(e.key==="Escape")close()});
    overlay.addEventListener("mousedown",e=>{if(e.target===overlay)close()}); if(hint)hint.addEventListener("click",open);
    document.addEventListener("keydown",e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="k"){e.preventDefault();overlay.classList.contains("open")?close():open()}else if(e.key==="Escape"&&overlay.classList.contains("open"))close()});
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",build);else build();
})();
