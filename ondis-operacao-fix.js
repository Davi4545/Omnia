/* ONDIS — somente um menu da fila aberto por vez, com fechamento externo. */
(function () {
  'use strict';
  const ROOT = '#viewOps #queueList';
  function menus() { return document.querySelectorAll(ROOT + ' details.queueMenu'); }
  function closeMenus(except) {
    menus().forEach(menu => {
      if (menu !== except && menu.open) menu.open = false;
      if (menu !== except) menu.classList.remove('queueMenu--flip');
    });
  }
  document.addEventListener('toggle', function (event) {
    const menu = event.target;
    if (!(menu instanceof HTMLElement) || !menu.matches(ROOT + ' details.queueMenu')) return;
    if (!menu.open) { menu.classList.remove('queueMenu--flip'); return; }
    closeMenus(menu);
    const panel = menu.querySelector('.queueMenuPanel');
    if (!panel) return;
    menu.classList.remove('queueMenu--flip');
    const anchor = menu.querySelector('summary').getBoundingClientRect();
    const needed = Math.min(panel.scrollHeight + 12, window.innerHeight - 24);
    const below = window.innerHeight - anchor.bottom;
    if (below < needed && anchor.top > below) menu.classList.add('queueMenu--flip');
  }, true);
  document.addEventListener('pointerdown', function (event) {
    if (!(event.target instanceof Element) || !event.target.closest(ROOT + ' details.queueMenu')) closeMenus();
  });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenus(); });
  window.addEventListener('resize', () => closeMenus());
  document.addEventListener('scroll', function (event) {
    if (event.target instanceof Element && event.target.closest(ROOT + ' details.queueMenu')) return;
    closeMenus();
  }, true);
})();
