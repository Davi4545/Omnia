const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');
const admin = require('firebase-admin');
const focus = require('./focusnfe');

admin.initializeApp();
const db = admin.firestore();

// Secret com os tokens da Focus NFe por loja. Configure com:
//   firebase functions:secrets:set FOCUS_NFE_TOKENS
// Cole um JSON assim (uma entrada por loja/storeId):
// {
//   "STORE_ID_1": { "homologacao": "token_homolog_aqui", "producao": "token_producao_aqui" }
// }
const FOCUS_NFE_TOKENS = defineSecret('FOCUS_NFE_TOKENS');

function requireAuth(request) {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Faça login para emitir nota fiscal.');
}

function getTokenFor(storeId, ambiente) {
  let map;
  try {
    map = JSON.parse(FOCUS_NFE_TOKENS.value());
  } catch (e) {
    throw new HttpsError('failed-precondition', 'FOCUS_NFE_TOKENS mal configurado (JSON inválido).');
  }
  const entry = map[storeId];
  const token = entry && entry[ambiente];
  if (!token) {
    throw new HttpsError('failed-precondition', `Token Focus NFe não configurado para a loja "${storeId}" no ambiente "${ambiente}".`);
  }
  return token;
}

// A tela "Configurações > Fiscal" do frente-loja.html grava em stores/{storeId}/caixa/config
// (mesmo doc do cashback/impressão). Os campos cfgFiscal* de lá viram o fiscalConfig aqui.
// O token da Focus NFe NUNCA vem daqui — só do secret FOCUS_NFE_TOKENS.
async function loadFiscalConfig(storeId) {
  const snap = await db.doc(`stores/${storeId}/caixa/config`).get();
  if (!snap.exists) throw new HttpsError('failed-precondition', 'Configurações da loja não encontradas. Preencha Configurações > Fiscal no frente de loja.');
  const c = snap.data();
  if (!c.fiscalCnpj) throw new HttpsError('failed-precondition', 'CNPJ emitente não preenchido em Configurações > Fiscal.');
  return {
    ambiente: c.fiscalEnv || 'homologacao',
    cnpjEmitente: String(c.fiscalCnpj).replace(/\D/g, ''),
    csosnPadrao: c.fiscalCsosn || '102',
    cfopPadrao: c.fiscalCfop || '5102',
    naturezaOperacao: c.fiscalNatureza || 'Venda',
    pisSituacao: c.fiscalPis || '07',
    cofinsSituacao: c.fiscalCofins || '07',
  };
}

async function loadProductsById(storeId, productIds) {
  const uniqueIds = [...new Set(productIds)];
  const result = {};
  // Firestore getAll aceita até 300 refs de uma vez; venda de PDV nunca chega perto disso.
  const refs = uniqueIds.map((id) => db.doc(`stores/${storeId}/produtos/${id}`));
  if (!refs.length) return result;
  const docs = await db.getAll(...refs);
  docs.forEach((d) => { if (d.exists) result[d.id] = d.data(); });
  return result;
}

exports.emitirNFCe = onCall({ secrets: [FOCUS_NFE_TOKENS], region: 'southamerica-east1' }, async (request) => {
  requireAuth(request);
  const { storeId, saleId } = request.data || {};
  if (!storeId || !saleId) throw new HttpsError('invalid-argument', 'storeId e saleId são obrigatórios.');

  const saleRef = db.doc(`stores/${storeId}/caixa_vendas/${saleId}`);
  const saleSnap = await saleRef.get();
  if (!saleSnap.exists) throw new HttpsError('not-found', 'Venda não encontrada.');
  const sale = { id: saleId, ...saleSnap.data() };

  if (sale.fiscalStatus === 'autorizada') {
    return { ok: true, jaEmitida: true, fiscalStatus: sale.fiscalStatus, chave: sale.fiscalChave };
  }

  const fiscalConfig = await loadFiscalConfig(storeId);
  const token = getTokenFor(storeId, fiscalConfig.ambiente);
  const productsById = await loadProductsById(storeId, sale.items.map((i) => i.productId));

  const result = await focus.emitirNfce({ sale, fiscalConfig, token, productsById });

  if (result.bloqueada) {
    await saleRef.update({ fiscalStatus: 'bloqueada', fiscalMotivo: result.motivo });
    return { ok: false, bloqueada: true, motivo: result.motivo };
  }

  const body = result.data || {};
  const autorizada = body.status === 'autorizado';
  const update = {
    fiscalStatus: autorizada ? 'autorizada' : (body.status || 'erro'),
    fiscalRef: result.ref,
    fiscalChave: body.chave_nfe || body.chave_acesso || null,
    fiscalNumero: body.numero || null,
    fiscalSerie: body.serie || null,
    fiscalDanfeUrl: body.caminho_danfe
      ? (String(body.caminho_danfe).startsWith('http') ? body.caminho_danfe : focus.BASE_URL[fiscalConfig.ambiente] + body.caminho_danfe)
      : null,
    fiscalMensagemSefaz: body.mensagem_sefaz || null,
    fiscalRaw: body, // guarda a resposta crua — a Focus é a fonte da verdade, não nossa leitura dela
    fiscalAtualizadoEm: new Date().toISOString(),
  };
  await saleRef.update(update);

  return { ok: result.ok, autorizada, ...update };
});

exports.consultarNFCe = onCall({ secrets: [FOCUS_NFE_TOKENS], region: 'southamerica-east1' }, async (request) => {
  requireAuth(request);
  const { storeId, saleId } = request.data || {};
  if (!storeId || !saleId) throw new HttpsError('invalid-argument', 'storeId e saleId são obrigatórios.');

  const saleRef = db.doc(`stores/${storeId}/caixa_vendas/${saleId}`);
  const saleSnap = await saleRef.get();
  if (!saleSnap.exists) throw new HttpsError('not-found', 'Venda não encontrada.');
  const sale = saleSnap.data();
  if (!sale.fiscalRef) throw new HttpsError('failed-precondition', 'Esta venda ainda não teve nenhuma emissão iniciada.');

  const fiscalConfig = await loadFiscalConfig(storeId);
  const token = getTokenFor(storeId, fiscalConfig.ambiente);
  const result = await focus.consultarNfce({ ref: sale.fiscalRef, fiscalConfig, token });

  const body = result.data || {};
  await saleRef.update({ fiscalStatus: body.status || sale.fiscalStatus, fiscalRaw: body, fiscalAtualizadoEm: new Date().toISOString() });
  return { ok: result.ok, ...body };
});

exports.cancelarNFCe = onCall({ secrets: [FOCUS_NFE_TOKENS], region: 'southamerica-east1' }, async (request) => {
  requireAuth(request);
  const { storeId, saleId, justificativa } = request.data || {};
  if (!storeId || !saleId) throw new HttpsError('invalid-argument', 'storeId e saleId são obrigatórios.');

  const saleRef = db.doc(`stores/${storeId}/caixa_vendas/${saleId}`);
  const saleSnap = await saleRef.get();
  if (!saleSnap.exists) throw new HttpsError('not-found', 'Venda não encontrada.');
  const sale = saleSnap.data();
  if (sale.fiscalStatus !== 'autorizada') throw new HttpsError('failed-precondition', 'Só é possível cancelar uma NFC-e autorizada.');

  const fiscalConfig = await loadFiscalConfig(storeId);
  const token = getTokenFor(storeId, fiscalConfig.ambiente);
  const result = await focus.cancelarNfce({ ref: sale.fiscalRef, justificativa, fiscalConfig, token });

  if (result.bloqueada) return { ok: false, motivo: result.motivo };

  const body = result.data || {};
  const cancelada = body.status === 'cancelado';
  await saleRef.update({
    fiscalStatus: cancelada ? 'cancelada' : (body.status || sale.fiscalStatus),
    fiscalCancelamentoJustificativa: justificativa,
    fiscalRaw: body,
    fiscalAtualizadoEm: new Date().toISOString(),
  });
  return { ok: result.ok, cancelada, ...body };
});
