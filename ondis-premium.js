(function(){
  "use strict";

  const CACHE_KEY = "ondis_visual_config_v1";
  const VALID_THEMES = ["executive", "sapphire", "carbon", "emerald", "amethyst", "custom"];
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
