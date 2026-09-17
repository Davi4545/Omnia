// Integração com a API da Focus NFe (NFC-e).
// Fontes oficiais consultadas: https://doc.focusnfe.com.br/reference/ambiente
//                              https://doc.focusnfe.com.br/reference/autenticacao
//                              https://doc.focusnfe.com.br/reference/referencia
//                              https://doc.focusnfe.com.br/reference/emitir_nfce
//
// Escopo desta v1 (documentado para não gerar expectativa errada):
//  - Empresa optante pelo Simples Nacional (CRT 1) -> ICMS via CSOSN (icms_situacao_tributaria).
//  - Venda presencial de mercadoria, sem frete, dentro do mesmo estado (local_destino "1").
//  - Um único meio de pagamento por venda (sem split de pagamento).
//  - PIS/COFINS com situação "07" (isenta) -> padrão usual para Simples Nacional; ajuste no
//    "fiscal" da loja se o contador indicar outro código.
//  - Cada produto PRECISA ter NCM cadastrado (obrigatório por lei). Sem NCM, a emissão é
//    bloqueada antes de chamar a Focus NFe (ver validateSaleIsFiscallyReady).

const axios = require('axios');

const BASE_URL = {
  homologacao: 'https://homologacao.focusnfe.com.br',
  producao: 'https://api.focusnfe.com.br',
};

// Tabela de forma de pagamento (SEFAZ / Focus NFe) usada nas formas de pagamento da NFC-e.
const FORMA_PAGAMENTO = {
  'Dinheiro': '01',
  'Cartão de crédito': '03',
  'Cartão de débito': '04',
  'Crediário': '05', // "Crédito Loja" - pagamento interno parcelado, não é meio eletrônico
  'Pix': '17',
};

function pad(n) { return String(n).padStart(2, '0'); }

// ISO-8601 com timezone -03:00 (Brasília). A Focus exige diferença máxima de 5 min do horário
// real do servidor, então geramos sempre no momento da chamada.
function dataEmissaoAgora() {
  const d = new Date();
  const off = -d.getTimezoneOffset(); // minutos (Cloud Functions roda em UTC, off = 0)
  const sign = off >= 0 ? '+' : '-';
  const offH = pad(Math.floor(Math.abs(off) / 60));
  const offM = pad(Math.abs(off) % 60);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}${sign}${offH}:${offM}`;
}

// Referência única exigida pela Focus. Só letras e números (ver /reference/referencia).
function buildRef(saleId) {
  return String(saleId).replace(/[^a-zA-Z0-9]/g, '').slice(0, 36);
}

// Confere se a venda tem tudo que a lei exige antes de gastar uma emissão com a Focus NFe.
// Retorna { ok:true } ou { ok:false, motivo }.
function validateSaleIsFiscallyReady(sale, fiscalConfig, productsById) {
  if (!fiscalConfig || !fiscalConfig.cnpjEmitente) {
    return { ok: false, motivo: 'CNPJ emitente não configurado nas configurações fiscais da loja.' };
  }
  if (!fiscalConfig.ambiente || !BASE_URL[fiscalConfig.ambiente]) {
    return { ok: false, motivo: 'Ambiente fiscal inválido (use "homologacao" ou "producao").' };
  }
  if (!sale.cpf || String(sale.cpf).length !== 11) {
    return { ok: false, motivo: 'Venda sem CPF válido do cliente.' };
  }
  if (!Array.isArray(sale.items) || !sale.items.length) {
    return { ok: false, motivo: 'Venda sem itens.' };
  }
  if (!FORMA_PAGAMENTO[sale.payment]) {
    return { ok: false, motivo: `Forma de pagamento "${sale.payment}" sem mapeamento fiscal.` };
  }
  for (const item of sale.items) {
    const p = productsById[item.productId];
    if (!p || !p.ncm) {
      return { ok: false, motivo: `Produto "${item.name}" sem NCM cadastrado. Cadastre o NCM no produto antes de vender.` };
    }
  }
  return { ok: true };
}

// Monta o payload de emissão a partir da venda já validada.
function buildNfcePayload(sale, fiscalConfig, productsById) {
  const items = sale.items.map((item, idx) => {
    const p = productsById[item.productId] || {};
    return {
      numero_item: idx + 1,
      codigo_produto: item.productId,
      descricao: item.name,
      codigo_ncm: p.ncm,
      cfop: p.cfop || fiscalConfig.cfopPadrao || '5102',
      unidade_comercial: p.unidade || 'UN',
      quantidade_comercial: item.qty,
      valor_unitario_comercial: item.unitPrice,
      valor_bruto: Number((item.qty * item.unitPrice).toFixed(2)),
      unidade_tributavel: p.unidade || 'UN',
      quantidade_tributavel: item.qty,
      valor_unitario_tributacao: item.unitPrice,
      icms_origem: p.icmsOrigem || '0',
      icms_situacao_tributaria: p.csosn || fiscalConfig.csosnPadrao || '102',
      pis_situacao_tributaria: fiscalConfig.pisSituacao || '07',
      cofins_situacao_tributaria: fiscalConfig.cofinsSituacao || '07',
      inclui_no_total: '1',
    };
  });

  return {
    cnpj_emitente: fiscalConfig.cnpjEmitente,
    data_emissao: dataEmissaoAgora(),
    modalidade_frete: '9',
    local_destino: '1',
    presenca_comprador: '1',
    natureza_operacao: fiscalConfig.naturezaOperacao || 'Venda',
    indicador_inscricao_estadual_destinatario: '9',
    nome_destinatario: sale.customer,
    cpf_destinatario: sale.cpf,
    items,
    formas_pagamento: [
      { forma_pagamento: FORMA_PAGAMENTO[sale.payment], valor_pagamento: sale.total },
    ],
  };
}

function client(fiscalConfig, token) {
  return axios.create({
    baseURL: BASE_URL[fiscalConfig.ambiente],
    auth: { username: token, password: '' },
    timeout: 20000,
    validateStatus: () => true, // tratamos o status manualmente (400/422 vêm com corpo útil)
  });
}

async function emitirNfce({ sale, fiscalConfig, token, productsById }) {
  const check = validateSaleIsFiscallyReady(sale, fiscalConfig, productsById);
  if (!check.ok) {
    return { ok: false, bloqueada: true, motivo: check.motivo };
  }
  const ref = buildRef(sale.id);
  const payload = buildNfcePayload(sale, fiscalConfig, productsById);
  const http = client(fiscalConfig, token);
  const resp = await http.post(`/v2/nfce?ref=${ref}&completa=1`, payload);
  return { ok: resp.status >= 200 && resp.status < 300, ref, status: resp.status, data: resp.data };
}

async function consultarNfce({ ref, fiscalConfig, token }) {
  const http = client(fiscalConfig, token);
  const resp = await http.get(`/v2/nfce/${ref}`);
  return { ok: resp.status >= 200 && resp.status < 300, status: resp.status, data: resp.data };
}

async function cancelarNfce({ ref, justificativa, fiscalConfig, token }) {
  // Regra SEFAZ: justificativa com no mínimo 15 caracteres.
  if (!justificativa || justificativa.trim().length < 15) {
    return { ok: false, bloqueada: true, motivo: 'Justificativa do cancelamento precisa ter no mínimo 15 caracteres.' };
  }
  const http = client(fiscalConfig, token);
  // A Focus exige a justificativa no CORPO da requisição (DELETE com body JSON), não só na query.
  const resp = await http.delete(`/v2/nfce/${ref}`, { data: { justificativa } });
  return { ok: resp.status >= 200 && resp.status < 300, status: resp.status, data: resp.data };
}

module.exports = {
  BASE_URL,
  FORMA_PAGAMENTO,
  buildRef,
  validateSaleIsFiscallyReady,
  buildNfcePayload,
  emitirNfce,
  consultarNfce,
  cancelarNfce,
};
