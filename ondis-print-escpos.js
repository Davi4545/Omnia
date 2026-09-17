/*
 * Impressão do cupom em impressora térmica (USB/Serial ou rede) via QZ Tray.
 * QZ Tray precisa estar instalado e rodando no PC do caixa: https://qz.io/download/
 *
 * Por que QZ Tray e não window.print()?
 * O navegador não abre socket TCP puro (impressora de rede na porta 9100) nem tem suporte
 * confiável a impressora térmica USB via WebUSB/WebSerial (trava em driver no Windows). O QZ
 * Tray é um serviço local que expõe um WebSocket e sabe falar com as duas formas de impressora.
 *
 * Configuração usada (Configurações > Impressão no frente de loja):
 *   CFG.thermalPrinterName -> nome exato da impressora, igual aparece no QZ Tray / no SO.
 *                             Deixe em branco para usar a impressora padrão do sistema.
 */
(function () {
  const ESC = '\x1B', GS = '\x1D';
  const CMD = {
    init: ESC + '@',
    alignLeft: ESC + 'a' + '\x00',
    alignCenter: ESC + 'a' + '\x01',
    boldOn: ESC + 'E' + '\x01',
    boldOff: ESC + 'E' + '\x00',
    doubleOn: GS + '!' + '\x11',
    doubleOff: GS + '!' + '\x00',
    cut: GS + 'V' + '\x01',
    feed: (n) => '\n'.repeat(n || 1),
  };

  // Impressoras térmicas comuns não têm acentuação UTF-8 confiável sem configurar a página de
  // código certa (CP860/CP850). Para não sair caractere quebrado no cupom, tiramos os acentos.
  function stripAccents(s) {
    return String(s == null ? '' : s)
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\x00-\x7E]/g, '?');
  }

  const WIDTH = 42; // colunas para bobina de 80mm em fonte padrão; ajuste para 32 se for 58mm

  function line(char) { return char.repeat(WIDTH) + '\n'; }
  function padRow(left, right) {
    left = stripAccents(left); right = stripAccents(right);
    const space = Math.max(1, WIDTH - left.length - right.length);
    return left + ' '.repeat(space) + right + '\n';
  }
  function money(v) { return 'R$ ' + Number(v || 0).toFixed(2).replace('.', ','); }

  function buildReceiptEscPos(sale, storeName) {
    let out = CMD.init;
    out += CMD.alignCenter + CMD.boldOn + CMD.doubleOn;
    out += stripAccents(storeName || 'ONDIS') + '\n';
    out += CMD.doubleOff + CMD.boldOff;
    out += stripAccents('Cupom nao fiscal - venda ' + (sale.number || '')) + '\n';
    out += stripAccents(new Date(sale.createdAt || Date.now()).toLocaleString('pt-BR')) + '\n';
    out += CMD.alignLeft + line('-');
    (sale.items || []).forEach((i) => {
      out += stripAccents(`${i.qty}x ${i.name}`) + '\n';
      out += padRow('', money(i.qty * i.unitPrice)) ;
    });
    out += line('-');
    if (sale.discount) out += padRow('Desconto', '-' + money(sale.discount));
    if (sale.cashbackUsed) out += padRow('Cashback usado', '-' + money(sale.cashbackUsed));
    out += CMD.boldOn + padRow('TOTAL', money(sale.total)) + CMD.boldOff;
    out += padRow('Pagamento', stripAccents(sale.payment || ''));
    out += line('-');
    if (sale.fiscalStatus === 'autorizada' && sale.fiscalChave) {
      out += stripAccents('NFC-e autorizada') + '\n';
      out += stripAccents('Chave: ' + sale.fiscalChave) + '\n';
    } else {
      out += stripAccents('Documento sem valor fiscal') + '\n';
    }
    out += CMD.alignCenter + stripAccents('Cliente: ' + (sale.customer || '')) + '\n';
    out += CMD.feed(3) + CMD.cut;
    return out;
  }

  async function ensureQzConnected() {
    if (typeof qz === 'undefined') {
      throw new Error('QZ Tray não carregado nesta página (script qz-tray.js ausente ou bloqueado).');
    }
    if (!qz.websocket.isActive()) {
      await qz.websocket.connect({ retries: 2, delay: 1 });
    }
  }

  async function printReceiptThermal(sale) {
    if (!sale) return alert('Nenhuma venda para imprimir.');
    try {
      await ensureQzConnected();
      const printerName = (window.CFG && window.CFG.thermalPrinterName) || undefined;
      const printer = printerName || (await qz.printers.getDefault());
      const config = qz.configs.create(printer);
      const data = buildReceiptEscPos(sale, (window.CFG && window.CFG.receiptName) || 'ONDIS');
      await qz.print(config, [{ type: 'raw', format: 'plain', flavor: 'plain', data }]);
    } catch (e) {
      console.warn('Falha na impressão térmica (QZ Tray):', e);
      alert('Não foi possível imprimir na térmica: ' + e.message + '\nVerifique se o QZ Tray está instalado e aberto, ou use "Imprimir (navegador)".');
    }
  }

  window.buildReceiptEscPos = buildReceiptEscPos;
  window.printReceiptThermal = printReceiptThermal;
})();
