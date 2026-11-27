/* ONDIS | Correção v2: menu de ações em camada independente, sem clipping.
   Escopo: #viewOps #queueList details.queueMenu. Mantém handlers originais. */
(() => {
  'use strict';
  if (window.__ONDIS_OPERACAO_MENU_PORTAL_V2__) return;
  window.__ONDIS_OPERACAO_MENU_PORTAL_V2__ = true;

  const SCOPE = '#viewOps #queueList';
  const STYLE_ID = 'ondis-ops-menu-portal-style-v2';
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    ${SCOPE} details.queueMenu > .queueMenuPanel { display: none !important; }
    ${SCOPE} details.queueMenu > summary { cursor: pointer; }
    #ondisOpsMenuPortalV2 {
      position: fixed !important; z-index: 2147483000 !important;
      box-sizing: border-box !important; width: 236px;
      max-width: calc(100vw - 24px); max-height: calc(100dvh - 24px);
      overflow: auto !important; overscroll-behavior: contain;
      background: #fff !important; border: 1px solid #e9dfe3 !important;
      border-radius: 14px !important; padding: 7px !important;
      box-shadow: 0 18px 50px rgba(29, 15, 22, .24) !important;
      isolation: isolate !important; display: flex !important; flex-direction: column !important;
      gap: 3px !important; color: #253044 !important;
    }
    #ondisOpsMenuPortalV2[hidden] { display: none !important; }
    #ondisOpsMenuPortalV2 button {
      width: 100% !important; box-sizing: border-box !important;
      border: 0 !important; background: transparent !important;
      color: #293347 !important; text-align: left !important;
      font: 650 12px/1.35 system-ui,-apple-system,Segoe UI,Roboto,sans-serif !important;
      min-height: 38px !important; padding: 9px 11px !important;
      border-radius: 9px !important; cursor: pointer !important;
      white-space: normal !important; display: block !important;
    }
    #ondisOpsMenuPortalV2 button:hover,
    #ondisOpsMenuPortalV2 button:focus-visible { background: #fff0f3 !important; outline: 0 !important; color: #9d1735 !important; }
    #ondisOpsMenuPortalV2 button.bad { color: #b42340 !important; }
    #ondisOpsMenuPortalV2 button:disabled { opacity: .45 !important; cursor: not-allowed !important; }
  `;
  document.head.appendChild(style);

  const portal = document.createElement('div');
  portal.id = 'ondisOpsMenuPortalV2';
  portal.hidden = true;
  portal.setAttribute('role', 'menu');
  document.body.appendChild(portal);

  let source = null;
  let anchor = null;
  let trackingFrame = 0;
  const close = (restoreFocus = false) => {
    if (portal.hidden) return;
    portal.hidden = true;
    portal.replaceChildren();
    if (source && source.isConnected) source.removeAttribute('aria-expanded');
    if (restoreFocus && source?.isConnected) source.focus();
    source = null;
    anchor = null;
    if (trackingFrame) cancelAnimationFrame(trackingFrame);
    trackingFrame = 0;
  };
  function position() {
    if (!anchor?.isConnected || !source?.isConnected) { close(); return; }
    const r = anchor.getBoundingClientRect();
    const vw = document.documentElement.clientWidth;
    const vh = window.innerHeight;
    const margin = 12;
    const w = Math.min(236, vw - 2 * margin);
    portal.style.width = `${w}px`;
    portal.style.maxHeight = `${Math.max(100, vh - 2 * margin)}px`;
    const height = Math.min(portal.scrollHeight, vh - 2 * margin);
    let left = Math.max(margin, Math.min(vw - w - margin, r.right - w));
    let top = r.bottom + 7;
    if (top + height > vh - margin && r.top - height - 7 >= margin) top = r.top - height - 7;
    else top = Math.max(margin, Math.min(vh - height - margin, top));
    portal.style.left = `${Math.round(left)}px`;
    portal.style.top = `${Math.round(top)}px`;
  }
  function track() {
    if (portal.hidden) return;
    position();
    trackingFrame = requestAnimationFrame(track);
  }
  function open(summary) {
    close();
    const details = summary.closest('details.queueMenu');
    const originalPanel = details?.querySelector(':scope > .queueMenuPanel');
    if (!originalPanel) return;
    document.querySelectorAll(`${SCOPE} details.queueMenu[open]`).forEach(d => { d.open = false; });
    source = summary;
    anchor = summary;
    summary.setAttribute('aria-expanded', 'true');
    const originals = [...originalPanel.querySelectorAll('button[data-act]')];
    originals.forEach(original => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = original.className;
      button.textContent = original.textContent;
      button.disabled = original.disabled;
      button.setAttribute('role', 'menuitem');
      button.addEventListener('click', () => {
        close();
        if (original.isConnected && !original.disabled) original.click();
      });
      portal.appendChild(button);
    });
    if (!portal.childElementCount) { close(); return; }
    portal.hidden = false;
    position();
    track();
  }
  document.addEventListener('click', event => {
    const t = event.target;
    if (!(t instanceof Element)) return;
    const summary = t.closest(`${SCOPE} details.queueMenu > summary`);
    if (summary) {
      // Impede que o details nativo seja aberto, evitando z-index / clipping.
      event.preventDefault();
      event.stopPropagation();
      if (summary === source && !portal.hidden) close(true);
      else open(summary);
      return;
    }
    if (!portal.hidden && !t.closest('#ondisOpsMenuPortalV2')) close();
  }, true);
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !portal.hidden) { event.preventDefault(); close(true); }
  }, true);
  document.addEventListener('visibilitychange', () => { if (document.hidden) close(); });
  window.addEventListener('blur', () => close());
})();
