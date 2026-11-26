/* ONDIS V15.2 — controles de fechar/cancelar, exclusivamente no CRM Completo.
   Não grava nem consulta Firebase. */
(()=>{'use strict';
  function closeDialog(button){
    const modal=button.closest('dialog');
    if(!modal || !modal.open)return;
    modal.close();
  }
  document.addEventListener('click',event=>{
    const btn=event.target.closest('[data-crm-close-dialog]');
    if(!btn)return;
    event.preventDefault();
    closeDialog(btn);
  });
})();
