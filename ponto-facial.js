/* =====================================================================
   PONTO POR RECONHECIMENTO FACIAL — modo QUIOSQUE (tablet fixo na loja)
   ---------------------------------------------------------------------
   • O tablet fica logado como administrador, com a câmera aberta.
   • O sistema reconhece quem está na frente (1 para N), pede uma prova de
     vida (virar o rosto e voltar) e deixa a pessoa escolher a batida.
   • Só o "código numérico" do rosto (128 números) é guardado — nunca a foto.
   • Tudo roda no navegador, com a biblioteca face-api.js hospedada no
     próprio site (sem enviar imagens a terceiros).

   Dados:
     stores/{loja}/pontoFaces/{uid}     rostos cadastrados (somente admin)
     stores/{loja}/pontoConfig/facial   configuração (rigor, prova de vida…)
     stores/{loja}/ponto/{uid}_{data}   mesma coleção do ponto de sempre;
                                        cada marcação ganha  metodo / dist.

   ATENÇÃO: é um controle interno. A conferência acontece no navegador e,
   por isso, não substitui ponto homologado para fins legais.
   ===================================================================== */
(function(){
  "use strict";

  const DEFAULTS = { ativo:false, limiar:0.50, provaDeVida:"virar", permitirManual:true };
  const MIN_FACE = 0.20;       // largura mínima do rosto (fração do vídeo): ignora quem está longe
  const FRAMES_ESTAVEIS = 3;   // quadros seguidos reconhecendo a mesma pessoa
  const MARGEM = 0.04;         // diferença mínima p/ o 2º colocado (evita sósia/ambiguidade)
  const COOLDOWN_MS = 20000;   // não aceita a mesma pessoa de novo logo após bater
  const VIDA_TIMEOUT_MS = 12000;
  const CONFIRMAR_TIMEOUT_MS = 20000;
  const PRONTO_MS = 4000;
  const INTERVALO_MS = 220;
  const TIPOS = {
    entrada:   { rot:"Entrada",   ico:"🟢" },
    intervalo: { rot:"Intervalo", ico:"☕" },
    retorno:   { rot:"Retorno",   ico:"🔄" },
    saida:     { rot:"Saída",     ico:"🔴" }
  };

  /* ===================== FUNÇÕES PURAS (testáveis) ===================== */
  function dist(a, b){
    let s = 0;
    for(let i = 0; i < a.length; i++){ const d = a[i] - b[i]; s += d * d; }
    return Math.sqrt(s);
  }
  function melhorDistancia(desc, pessoa){
    let m = Infinity;
    for(const s of (pessoa.samples || [])){ const d = dist(desc, s.v); if(d < m) m = d; }
    return m;
  }
  // Quem é esta pessoa? Só responde se estiver perto o bastante E claramente
  // mais perto de UMA pessoa do que de qualquer outra.
  function identificar(desc, galeria, limiar, margem){
    if(!desc || !galeria || !galeria.length) return { ok:false, motivo:"vazio" };
    const m = (margem == null) ? MARGEM : margem;
    const ds = galeria.map(p => ({ p, d: melhorDistancia(desc, p) })).sort((a, b) => a.d - b.d);
    const best = ds[0], second = ds[1];
    if(!(best.d <= limiar)) return { ok:false, motivo:"desconhecido", dist:best.d };
    if(second && (second.d - best.d) < m) return { ok:false, motivo:"ambiguo", dist:best.d };
    return { ok:true, pessoa:best.p, dist:best.d };
  }
  // Giro do rosto: 0,5 = de frente. Usa a ponta do nariz (30) entre as bordas do rosto (0 e 16).
  function giro(pts){
    if(!pts || pts.length < 31) return null;
    const l = pts[0], r = pts[16], n = pts[30];
    const w = r.x - l.x;
    if(!(w > 0)) return null;
    return (n.x - l.x) / w;
  }
  // Prova de vida: virar o rosto para um lado (qualquer) e voltar para a frente.
  function criarVida(){
    let virou = false, voltou = false;
    return {
      push(y){
        if(y == null) return false;
        const dev = Math.abs(y - 0.5);
        if(!virou){ if(dev >= 0.13) virou = true; }
        else if(dev <= 0.10) voltou = true;
        return virou && voltou;
      },
      ok(){ return virou && voltou; },
      virou(){ return virou; }
    };
  }
  function criarEstavel(n){
    let uid = null, c = 0;
    return {
      push(id){
        if(id && id === uid) c++;
        else { uid = id || null; c = id ? 1 : 0; }
        return c >= n ? uid : null;
      },
      reset(){ uid = null; c = 0; }
    };
  }
  // Quais batidas fazem sentido agora? (mesmas regras de ordem do ponto normal)
  function opcoesDeBatida(reg){
    const m = (reg && reg.marcacoes) || {};
    if(!m.entrada) return ["entrada"];
    const o = [];
    if(!m.intervalo) o.push("intervalo");
    else if(!m.retorno) o.push("retorno");
    if(!m.saida) o.push("saida");
    return o;
  }
  function validarBatida(reg, tipo){
    const m = (reg && reg.marcacoes) || {};
    if(!TIPOS[tipo]) return "Tipo de batida inválido.";
    if(m[tipo]) return "Já registrou " + TIPOS[tipo].rot + " hoje.";
    if(tipo === "intervalo" && !m.entrada) return "Bata a Entrada primeiro.";
    if(tipo === "retorno" && !m.intervalo) return "É preciso registrar o Intervalo antes do Retorno.";
    if(tipo === "saida" && !m.entrada) return "Bata a Entrada primeiro.";
    return null;
  }
  function arred(desc){ return Array.from(desc, x => Math.round(x * 10000) / 10000); }
  function esc(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c])); }

  /* ============================== ESTADO ============================== */
  let B = null;            // ponte com o ponto.html (firestore, loja, usuário…)
  let CFG = Object.assign({}, DEFAULTS);
  let GALERIA = [];        // [{uid, nome, samples:[{v:[..]}]}]
  let libPromise = null;
  const K = { rodando:false, estado:"parado", video:null, stream:null, timer:null, estavel:null, liv:null,
              cand:null, desde:0, desconhecidos:0, ultimoRosto:0, recente:{}, wake:null, tPronto:null, tConfirmar:null, vw:640, manual:false };

  const refCfg   = () => B.fs.doc(B.db, "stores", B.STORE_ID, "pontoConfig", "facial");
  const refFaces = () => B.fs.collection(B.db, "stores", B.STORE_ID, "pontoFaces");

  function erroRegras(e){
    if(e && (e.code === "permission-denied" || /permission/i.test(String(e.message || "")))){
      return "Sem permissão para acessar os rostos. As Regras do Firestore precisam liberar a coleção “pontoFaces” para administradores (veja as instruções de instalação).";
    }
    return (B && B.msgErro) ? B.msgErro(e, "acessar o reconhecimento facial") : String(e && e.message || e);
  }

  /* ===================== BIBLIOTECA E CÂMERA ===================== */
  function carregarLib(){
    if(libPromise) return libPromise;
    libPromise = new Promise((resolve, reject) => {
      const iniciar = async () => {
        try{
          const fa = window.faceapi;
          try{ await fa.tf.setBackend("webgl"); }catch(e){ try{ await fa.tf.setBackend("cpu"); }catch(e2){} }
          await fa.tf.ready();
          await fa.nets.tinyFaceDetector.loadFromUri("./");
          await fa.nets.faceLandmark68TinyNet.loadFromUri("./");
          await fa.nets.faceRecognitionNet.loadFromUri("./");
          resolve(fa);
        }catch(e){ libPromise = null; reject(e); }
      };
      if(window.faceapi){ iniciar(); return; }
      const s = document.createElement("script");
      s.src = "./face-api.js?v=1";
      s.onload = iniciar;
      s.onerror = () => { libPromise = null; reject(new Error("Não foi possível carregar o reconhecimento facial (arquivo face-api.js).")); };
      document.head.appendChild(s);
    });
    return libPromise;
  }

  async function abrirCamera(video){
    if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia){
      throw new Error("Este navegador não permite usar a câmera (é preciso abrir o site com https).");
    }
    const stream = await navigator.mediaDevices.getUserMedia({ video:{ facingMode:"user", width:{ ideal:640 }, height:{ ideal:480 } }, audio:false });
    video.srcObject = stream;
    video.setAttribute("playsinline", ""); video.muted = true;
    try{ await video.play(); }catch(e){}
    return stream;
  }
  function fecharCamera(){
    if(K.stream){ K.stream.getTracks().forEach(t => { try{ t.stop(); }catch(e){} }); K.stream = null; }
    if(K.video){ try{ K.video.srcObject = null; }catch(e){} }
  }
  async function manterTelaLigada(){
    try{ if(navigator.wakeLock){ K.wake = await navigator.wakeLock.request("screen"); } }catch(e){}
  }
  function opcoesDetector(){ return new window.faceapi.TinyFaceDetectorOptions({ inputSize:320, scoreThreshold:0.5 }); }

  async function detectar(video, comDescritor){
    const fa = window.faceapi;
    let t = fa.detectAllFaces(video, opcoesDetector()).withFaceLandmarks(true);
    const res = comDescritor ? await t.withFaceDescriptors() : await t;
    return res.map(r => ({
      box: r.detection.box, score: r.detection.score,
      pts: (r.landmarks && r.landmarks.positions) || [],
      descriptor: r.descriptor || null
    }));
  }

  /* ===================== GRAVAÇÃO DA BATIDA ===================== */
  // Relê o registro do dia no servidor antes de gravar (evita sobrescrever outro aparelho).
  async function registrarBatida(pessoa, tipo, extra){
    const hoje = B.hojeStr();
    const id = pessoa.uid + "_" + hoje;
    const ref = B.fs.doc(B.pontoRef, id);
    let reg = null;
    try{ const s = await B.fs.getDoc(ref); if(s.exists()) reg = Object.assign({ id }, s.data()); }catch(e){}
    if(!reg) reg = (B.getPontos().find(p => p.id === id)) || null;
    if(!reg) reg = { id, uid: pessoa.uid, nome: pessoa.nome, data: hoje, storeId: B.STORE_ID, marcacoes: {} };
    if(!reg.marcacoes) reg.marcacoes = {};
    const erro = validarBatida(reg, tipo);
    if(erro) return { ok:false, msg:erro };
    const agora = new Date();
    const marc = { hora: B.hhmm(agora), ts: agora.getTime(), loc: B.getLoc ? B.getLoc() : null };
    Object.assign(marc, extra || {});
    reg.marcacoes[tipo] = marc;
    reg.atualizadoEm = agora.toISOString();
    try{ await B.fs.setDoc(ref, reg); }
    catch(e){ return { ok:false, msg: (B.msgErro ? B.msgErro(e, "registrar o ponto") : "Falha ao registrar.") }; }
    return { ok:true, hora: marc.hora };
  }

  /* ===================== QUIOSQUE: INTERFACE ===================== */
  function injetarEstilo(){
    if(document.getElementById("pfStyle")) return;
    const st = document.createElement("style");
    st.id = "pfStyle";
    st.textContent = `
    #pfQuiosque{position:fixed;inset:0;z-index:2147483000;background:#0b0e13;color:#fff;display:flex;flex-direction:column;font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif}
    #pfQuiosque .pfTop{display:flex;justify-content:space-between;align-items:center;padding:14px 22px;border-bottom:1px solid rgba(255,255,255,.08)}
    #pfQuiosque .pfLoja{font-weight:800;font-size:18px;opacity:.92}
    #pfQuiosque .pfRelogio{font-size:34px;font-weight:900;letter-spacing:.02em}
    #pfQuiosque .pfCorpo{flex:1;display:flex;align-items:center;justify-content:center;gap:30px;padding:20px;flex-wrap:wrap}
    #pfQuiosque .pfCam{position:relative;width:min(46vw,460px);aspect-ratio:4/3;border-radius:22px;overflow:hidden;background:#000;border:2px solid rgba(255,255,255,.12);box-shadow:0 20px 60px rgba(0,0,0,.5)}
    #pfQuiosque .pfCam video{width:100%;height:100%;object-fit:cover;transform:scaleX(-1)}
    #pfQuiosque .pfOval{position:absolute;inset:10% 22%;border:3px dashed rgba(255,255,255,.35);border-radius:50%;pointer-events:none}
    #pfQuiosque.ok .pfOval{border-color:#19c37d;border-style:solid}
    #pfQuiosque .pfPainel{width:min(90vw,460px);display:flex;flex-direction:column;gap:14px;align-items:stretch}
    #pfQuiosque .pfMsg{font-size:30px;font-weight:900;line-height:1.15}
    #pfQuiosque .pfSub{font-size:16px;opacity:.75;line-height:1.4;min-height:22px}
    #pfQuiosque .pfAcoes{display:flex;flex-direction:column;gap:10px}
    #pfQuiosque button{font:inherit;cursor:pointer;border:0;border-radius:16px;padding:18px 20px;font-size:20px;font-weight:800;color:#fff;background:rgba(255,255,255,.12)}
    #pfQuiosque button.pri{background:linear-gradient(180deg,#f82034,#cf1226)}
    #pfQuiosque button.verde{background:linear-gradient(180deg,#19c37d,#0e9660)}
    #pfQuiosque button.peq{padding:10px 14px;font-size:14px;font-weight:700;background:rgba(255,255,255,.08)}
    #pfQuiosque .pfRodape{display:flex;justify-content:space-between;align-items:center;padding:12px 22px;border-top:1px solid rgba(255,255,255,.08);gap:10px;flex-wrap:wrap}
    #pfQuiosque .pfGrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px;max-height:46vh;overflow:auto}
    #pfQuiosque .pfGrid button{font-size:16px;padding:14px 10px}
    #pfQuiosque.erro .pfMsg{color:#ff8a94}
    `;
    document.head.appendChild(st);
  }

  function elQ(id){ return document.getElementById(id); }
  function setMsg(msg, sub, erro){
    const m = elQ("pfMsg"), s = elQ("pfSub"), q = elQ("pfQuiosque");
    if(m) m.textContent = msg || "";
    if(s) s.textContent = sub || "";
    if(q) q.classList.toggle("erro", !!erro);
  }
  function setAcoes(html){ const a = elQ("pfAcoes"); if(a) a.innerHTML = html || ""; }
  function setOk(on){ const q = elQ("pfQuiosque"); if(q) q.classList.toggle("ok", !!on); }
  function tickRelogio(){
    const r = elQ("pfRelogio"); if(!r) return;
    const d = new Date(); r.textContent = B.hhmm(d);
  }

  function montarQuiosque(){
    injetarEstilo();
    let q = elQ("pfQuiosque");
    if(q) q.remove();
    q = document.createElement("div");
    q.id = "pfQuiosque";
    q.innerHTML = `
      <div class="pfTop"><div class="pfLoja">${esc(B.LOJA_NOME || "ONDIS")} · Ponto</div><div class="pfRelogio" id="pfRelogio">--:--</div></div>
      <div class="pfCorpo">
        <div class="pfCam"><video id="pfVideo" autoplay playsinline muted></video><div class="pfOval"></div></div>
        <div class="pfPainel"><div class="pfMsg" id="pfMsg">Preparando…</div><div class="pfSub" id="pfSub"></div><div class="pfAcoes" id="pfAcoes"></div></div>
      </div>
      <div class="pfRodape">
        <button class="peq" id="pfSair">✕ Sair do quiosque</button>
        <button class="peq" id="pfManualBtn" style="display:none">Não consegui — registrar manualmente</button>
      </div>`;
    document.body.appendChild(q);
    K.video = elQ("pfVideo");
    elQ("pfSair").onclick = () => fecharQuiosque();
    elQ("pfManualBtn").onclick = () => abrirManual();
    document.addEventListener("visibilitychange", onVisibilidade);
    return q;
  }
  function onVisibilidade(){
    if(document.visibilityState === "visible" && K.rodando && !K.wake) manterTelaLigada();
  }

  function mostrarManualSeNecessario(){
    const b = elQ("pfManualBtn");
    if(b) b.style.display = (CFG.permitirManual && GALERIA.length) ? "inline-block" : "none";
  }

  function irParaProcurando(msg, sub, erro){
    clearTimeout(K.tPronto); clearTimeout(K.tConfirmar);
    K.estado = "procurando"; K.cand = null; K.manual = false;
    K.estavel.reset(); K.liv = null; K.desconhecidos = 0;
    setOk(false); setAcoes("");
    setMsg(msg || "Olhe para a câmera", sub || "Fique de frente, com o rosto dentro do círculo.", erro);
  }

  function opcoesHtml(pessoa, reg, manual){
    const ops = opcoesDeBatida(reg);
    if(!ops.length){
      return `<div class="pfSub">Você já finalizou o dia.</div><button id="pfVoltar">OK</button>`;
    }
    return ops.map((t, i) => `<button class="${i === 0 ? "pri" : ""}" data-t="${t}">${TIPOS[t].ico} Registrar ${TIPOS[t].rot}</button>`).join("") +
           `<button class="peq" id="pfCancelar">Cancelar</button>`;
  }

  function irParaConfirmar(pessoa, dist, manual){
    K.estado = "confirmar"; K.cand = { pessoa, dist, manual:!!manual };
    clearTimeout(K.tConfirmar);
    const id = pessoa.uid + "_" + B.hojeStr();
    const reg = B.getPontos().find(p => p.id === id) || { marcacoes:{} };
    setOk(true);
    setMsg("Olá, " + (pessoa.nome || "").split(" ")[0] + "!", manual ? "Registro manual — ficará marcado para conferência." : "O que você quer registrar?");
    setAcoes(opcoesHtml(pessoa, reg, manual));
    const a = elQ("pfAcoes");
    a.querySelectorAll("button[data-t]").forEach(b => b.onclick = () => salvar(b.getAttribute("data-t")));
    const c = elQ("pfCancelar"); if(c) c.onclick = () => irParaProcurando();
    const v = elQ("pfVoltar"); if(v) v.onclick = () => irParaProcurando();
    K.tConfirmar = setTimeout(() => { if(K.estado === "confirmar") irParaProcurando(); }, CONFIRMAR_TIMEOUT_MS);
  }

  async function salvar(tipo){
    if(K.estado !== "confirmar" || !K.cand) return;
    const { pessoa, dist: d, manual } = K.cand;
    clearTimeout(K.tConfirmar);
    K.estado = "salvando"; setAcoes(""); setMsg("Registrando…", "");
    const extra = manual ? { metodo:"manual-quiosque", conferir:true } : { metodo:"facial", dist: Math.round(d * 1000) / 1000 };
    const r = await registrarBatida(pessoa, tipo, extra);
    if(r.ok){
      K.recente[pessoa.uid] = Date.now();
      K.estado = "pronto";
      setOk(true);
      setMsg("✅ " + TIPOS[tipo].rot + " registrada às " + r.hora, "Bom trabalho, " + (pessoa.nome || "").split(" ")[0] + "!");
      setAcoes("");
      K.tPronto = setTimeout(() => irParaProcurando(), PRONTO_MS);
    } else {
      K.estado = "pronto";
      setMsg("Não foi possível registrar", r.msg, true);
      K.tPronto = setTimeout(() => irParaProcurando(), PRONTO_MS + 2000);
    }
    return r;
  }

  function abrirManual(){
    if(!CFG.permitirManual) return;
    clearTimeout(K.tPronto); clearTimeout(K.tConfirmar);
    K.estado = "manual"; K.manual = true; setOk(false);
    setMsg("Quem é você?", "Escolha seu nome. O registro ficará marcado ⚠️ para o administrador conferir.");
    const lista = GALERIA.slice().sort((a, b) => (a.nome || "").localeCompare(b.nome || ""));
    setAcoes(`<div class="pfGrid">${lista.map(p => `<button data-u="${esc(p.uid)}">${esc(p.nome || p.uid)}</button>`).join("")}</div><button class="peq" id="pfCancelar">Voltar</button>`);
    elQ("pfAcoes").querySelectorAll("button[data-u]").forEach(b => b.onclick = () => {
      const p = GALERIA.find(x => x.uid === b.getAttribute("data-u"));
      if(p) irParaConfirmar(p, 0, true);
    });
    const c = elQ("pfCancelar"); if(c) c.onclick = () => irParaProcurando();
  }

  // Recebe os rostos detectados num quadro e decide o que fazer (máquina de estados).
  function aoQuadro(dets, agora){
    agora = agora || Date.now();
    const vw = K.vw || 640;
    const rostos = (dets || []).filter(d => d.box && d.box.width >= vw * MIN_FACE).sort((a, b) => b.box.width - a.box.width);

    if(K.estado === "procurando"){
      if(!rostos.length){ K.estavel.reset(); K.desconhecidos = 0; setOk(false); setMsg("Olhe para a câmera", "Fique de frente, com o rosto dentro do círculo."); return; }
      if(rostos.length > 1 && rostos[1].box.width >= rostos[0].box.width * 0.7){
        K.estavel.reset(); setMsg("Uma pessoa por vez", "Aproxime-se sozinho(a) da câmera."); return;
      }
      const f = rostos[0];
      const r = identificar(f.descriptor, GALERIA, CFG.limiar);
      if(!r.ok){
        K.estavel.reset(); K.desconhecidos++;
        if(K.desconhecidos >= 10){ setMsg("Não reconheci seu rosto", "Fique de frente e com boa luz. Se continuar, use “registrar manualmente”.", true); }
        else setMsg("Reconhecendo…", "");
        return;
      }
      K.desconhecidos = 0;
      const uid = r.pessoa.uid;
      if(K.estavel.push(uid)){
        const ult = K.recente[uid];
        if(ult != null && (agora - ult) < COOLDOWN_MS){ setMsg("Você acabou de registrar", "Aguarde alguns segundos.", false); K.estavel.reset(); return; }
        K.cand = { pessoa:r.pessoa, dist:r.dist };
        if(CFG.provaDeVida === "virar"){
          K.estado = "vida"; K.liv = criarVida(); K.desde = agora; K.ultimoRosto = agora; setOk(true);
          setMsg("Olá, " + (r.pessoa.nome || "").split(" ")[0] + "!", "Vire o rosto para um lado e volte a olhar de frente.");
        } else {
          irParaConfirmar(r.pessoa, r.dist, false);
        }
      } else setMsg("Reconhecendo…", "");
      return;
    }

    if(K.estado === "vida"){
      if(agora - K.desde > VIDA_TIMEOUT_MS){ irParaProcurando("Não consegui confirmar", "Tente de novo: vire o rosto para um lado e volte.", true); return; }
      if(!rostos.length){
        if(agora - K.ultimoRosto > 2500) irParaProcurando("Perdi você de vista", "Fique na frente da câmera e tente de novo.", true);
        return;
      }
      K.ultimoRosto = agora;
      const f = rostos[0];
      const feito = K.liv.push(giro(f.pts));
      if(!feito){ setMsg(K.liv.virou() ? "Agora volte a olhar de frente" : "Vire o rosto para um lado", ""); return; }
      // voltou de frente: confere de novo quem é, no mesmo quadro
      const r = identificar(f.descriptor, GALERIA, CFG.limiar);
      if(r.ok && r.pessoa.uid === K.cand.pessoa.uid){ irParaConfirmar(r.pessoa, r.dist, false); }
      else irParaProcurando("Não consegui confirmar sua identidade", "Tente de novo.", true);
    }
  }

  async function laco(){
    if(!K.rodando) return;
    const t0 = Date.now();
    try{
      if((K.estado === "procurando" || K.estado === "vida") && K.video && K.video.readyState >= 2){
        K.vw = K.video.videoWidth || 640;
        const dets = await detectar(K.video, true);
        if(K.rodando) aoQuadro(dets, Date.now());
      }
    }catch(e){ console.error("Reconhecimento:", e); }
    tickRelogio();
    if(K.rodando) K.timer = setTimeout(laco, Math.max(30, INTERVALO_MS - (Date.now() - t0)));
  }

  async function abrirQuiosque(){
    if(!B || !B.isAdmin){ alert("Só administradores podem abrir o quiosque."); return; }
    if(!CFG.ativo){ alert("Ative o reconhecimento facial na configuração antes de abrir o quiosque."); return; }
    montarQuiosque();
    K.rodando = true; K.estavel = criarEstavel(FRAMES_ESTAVEIS); K.recente = {};
    tickRelogio(); setInterval(tickRelogio, 15000);
    setMsg("Preparando o reconhecimento…", "Carregando (na primeira vez pode levar alguns segundos).");
    try{
      await carregarGaleria();
      if(!GALERIA.length){ setMsg("Nenhum rosto cadastrado", "Cadastre os rostos da equipe em Config → Reconhecimento facial.", true); mostrarManualSeNecessario(); return; }
      await carregarLib();
      K.stream = await abrirCamera(K.video);
      manterTelaLigada();
      mostrarManualSeNecessario();
      irParaProcurando();
      laco();
    }catch(e){
      console.error(e);
      const nome = e && e.name;
      const msg = nome === "NotAllowedError" ? "A câmera está bloqueada. Permita o acesso à câmera nas configurações do navegador e tente de novo."
                : nome === "NotFoundError" ? "Nenhuma câmera foi encontrada neste aparelho."
                : (e && e.message) || "Não foi possível iniciar.";
      setMsg("Não foi possível iniciar", msg, true);
      setAcoes(`<button id="pfTentar" class="pri">Tentar de novo</button>`);
      const t = elQ("pfTentar"); if(t) t.onclick = () => { fecharQuiosque(); abrirQuiosque(); };
    }
  }

  function fecharQuiosque(){
    K.rodando = false; K.estado = "parado";
    clearTimeout(K.timer); clearTimeout(K.tPronto); clearTimeout(K.tConfirmar);
    fecharCamera();
    try{ if(K.wake){ K.wake.release(); K.wake = null; } }catch(e){}
    document.removeEventListener("visibilitychange", onVisibilidade);
    const q = elQ("pfQuiosque"); if(q) q.remove();
    if(/[?&]quiosque=1/.test(location.search)){ try{ history.replaceState(null, "", location.pathname); }catch(e){} }
  }

  /* ===================== CADASTRO DE ROSTOS ===================== */
  async function carregarGaleria(){
    const snap = await B.fs.getDocs(refFaces());
    GALERIA = [];
    snap.forEach(d => { const x = d.data(); if(x && Array.isArray(x.samples) && x.samples.length) GALERIA.push({ uid: x.uid || d.id, nome: x.nome || "", samples: x.samples, consentimento: x.consentimento || null }); });
    return GALERIA;
  }
  async function listarPessoas(){
    // usuários com login desta loja + pessoas já cadastradas sem login
    const lojas = B.STORE_ID;
    const out = {};
    try{
      const snap = await B.fs.getDocs(B.fs.collection(B.db, "users"));
      snap.forEach(d => {
        const u = d.data() || {};
        const ids = Array.isArray(u.storeIds) ? u.storeIds : [];
        if((u.storeId === lojas || ids.includes(lojas)) && u.active !== false) out[d.id] = { uid:d.id, nome: u.name || u.email || d.id, login:true };
      });
    }catch(e){ /* sem permissão de listar usuários: segue só com os cadastrados */ }
    GALERIA.forEach(g => { if(!out[g.uid]) out[g.uid] = { uid:g.uid, nome:g.nome, login:false }; });
    return Object.values(out).sort((a, b) => (a.nome || "").localeCompare(b.nome || ""));
  }

  function estiloCadastro(){
    injetarEstilo();
    if(document.getElementById("pfCadStyle")) return;
    const st = document.createElement("style"); st.id = "pfCadStyle";
    st.textContent = `
    #pfCadastro{position:fixed;inset:0;z-index:2147482000;background:rgba(10,14,22,.62);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:16px}
    #pfCadastro .pfBox{background:var(--ondis-surface,#fff);color:var(--ondis-text,#10131a);border:1px solid var(--ondis-line,#e6e8ee);border-radius:18px;width:min(640px,100%);max-height:92vh;overflow:auto;padding:20px;box-shadow:0 30px 80px rgba(0,0,0,.35)}
    #pfCadastro h2{font-size:18px;font-weight:900;margin:0 0 4px}
    #pfCadastro .pfLinha{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 12px;border:1px solid var(--ondis-line,#e6e8ee);border-radius:12px;margin-top:8px}
    #pfCadastro .pfTag{font-size:12px;font-weight:800;padding:3px 9px;border-radius:999px;background:rgba(0,0,0,.06)}
    #pfCadastro .pfTag.ok{background:rgba(7,150,95,.14);color:#07965f}
    #pfCadastro .pfCamC{position:relative;width:100%;aspect-ratio:4/3;background:#000;border-radius:14px;overflow:hidden;margin:10px 0}
    #pfCadastro video{width:100%;height:100%;object-fit:cover;transform:scaleX(-1)}
    #pfCadastro .pfPasso{font-size:16px;font-weight:800;text-align:center;margin:6px 0}
    #pfCadastro .pfBarra{height:8px;background:rgba(0,0,0,.08);border-radius:999px;overflow:hidden}
    #pfCadastro .pfBarra i{display:block;height:100%;width:0;background:var(--ondis-primary,#e4142b);transition:width .25s}
    #pfCadastro .pfRow{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}
    #pfCadastro label.pfCons{display:flex;gap:10px;align-items:flex-start;font-size:13px;line-height:1.45;margin-top:10px}
    #pfCadastro label.pfCons input{margin-top:3px;width:18px;height:18px;flex:0 0 auto}
    `;
    document.head.appendChild(st);
  }

  async function abrirCadastro(){
    if(!B || !B.isAdmin) return;
    estiloCadastro();
    let w = elQ("pfCadastro"); if(w) w.remove();
    w = document.createElement("div"); w.id = "pfCadastro";
    w.innerHTML = `<div class="pfBox"><div style="display:flex;justify-content:space-between;align-items:center"><h2>👤 Rostos cadastrados</h2><button class="btn" id="pfCadFechar">✕</button></div><div class="hint" style="text-align:left">Carregando…</div></div>`;
    document.body.appendChild(w);
    elQ("pfCadFechar").onclick = () => { pararCaptura(); w.remove(); renderCard(); };
    await renderListaCadastro();
  }

  async function renderListaCadastro(){
    const box = document.querySelector("#pfCadastro .pfBox"); if(!box) return;
    let pessoas = [];
    try{ await carregarGaleria(); pessoas = await listarPessoas(); }
    catch(e){ box.innerHTML = `<div style="display:flex;justify-content:space-between"><h2>👤 Rostos cadastrados</h2><button class="btn" id="pfCadFechar2">✕</button></div><div class="hint" style="text-align:left;color:#b00020">${esc(erroRegras(e))}</div>`; elQ("pfCadFechar2").onclick = () => elQ("pfCadastro").remove(); return; }
    const linhas = pessoas.map(p => {
      const g = GALERIA.find(x => x.uid === p.uid);
      return `<div class="pfLinha"><div><b>${esc(p.nome)}</b> ${p.login ? "" : '<span class="pfTag">sem login</span>'} ${g ? '<span class="pfTag ok">✔ cadastrado</span>' : '<span class="pfTag">sem rosto</span>'}</div>
        <div class="pfRow" style="margin:0"><button class="btn good" data-cad="${esc(p.uid)}">${g ? "Refazer" : "Cadastrar rosto"}</button>${g ? `<button class="btn bad" data-rem="${esc(p.uid)}">Remover</button>` : ""}</div></div>`;
    }).join("");
    box.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center"><h2>👤 Rostos cadastrados</h2><button class="btn" id="pfCadFechar2">✕</button></div>
      <div class="hint" style="text-align:left;padding:4px 0 6px">Cadastre cada pessoa uma vez. Só um código numérico do rosto é guardado — a foto não.</div>
      ${linhas || '<div class="hint">Nenhuma pessoa encontrada.</div>'}
      <div class="pfLinha"><div style="flex:1"><b>Pessoa sem login</b><div class="hint" style="text-align:left;padding:2px 0 0">Para quem não tem acesso ao sistema.</div></div>
        <div class="pfRow" style="margin:0"><input id="pfNovoNome" placeholder="Nome" style="min-width:140px"/><button class="btn" id="pfNovoBtn">Adicionar</button></div></div>`;
    elQ("pfCadFechar2").onclick = () => { pararCaptura(); elQ("pfCadastro").remove(); renderCard(); };
    box.querySelectorAll("[data-cad]").forEach(b => b.onclick = () => { const p = pessoas.find(x => x.uid === b.getAttribute("data-cad")); if(p) iniciarCaptura(p); });
    box.querySelectorAll("[data-rem]").forEach(b => b.onclick = async () => {
      const p = pessoas.find(x => x.uid === b.getAttribute("data-rem"));
      if(!p || !confirm("Remover o rosto de " + p.nome + "? Essa pessoa não poderá mais bater ponto por reconhecimento.")) return;
      try{ await B.fs.deleteDoc(B.fs.doc(B.db, "stores", B.STORE_ID, "pontoFaces", p.uid)); }catch(e){ alert(erroRegras(e)); }
      await renderListaCadastro();
    });
    elQ("pfNovoBtn").onclick = () => {
      const nome = (elQ("pfNovoNome").value || "").trim();
      if(nome.length < 2){ alert("Digite o nome da pessoa."); return; }
      iniciarCaptura({ uid:"p_" + Date.now().toString(36), nome, login:false });
    };
  }

  const PASSOS = [
    { txt:"Olhe de frente para a câmera",                 giro:false },
    { txt:"Vire levemente o rosto para um lado",          giro:true  },
    { txt:"Vire levemente o rosto para o outro lado",     giro:true  },
    { txt:"Levante um pouco o queixo, olhando para a câmera", giro:false },
    { txt:"Olhe de frente e sorria",                      giro:false }
  ];
  const TEXTO_CONSENTIMENTO = "Autorizo o uso do meu rosto (dado biométrico) exclusivamente para registro de ponto nesta loja, ciente de que posso revogar a autorização e solicitar a exclusão desses dados a qualquer momento.";
  let CAP = null;

  function pararCaptura(){
    if(CAP){ CAP.ativo = false; clearTimeout(CAP.timer); }
    fecharCamera(); CAP = null;
  }

  function iniciarCaptura(pessoa){
    const box = document.querySelector("#pfCadastro .pfBox"); if(!box) return;
    box.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center"><h2>📷 ${esc(pessoa.nome)}</h2><button class="btn" id="pfCapVoltar">← Voltar</button></div>
      <label class="pfCons"><input type="checkbox" id="pfConsent"/><span>${esc(TEXTO_CONSENTIMENTO)}<br><b>Confirmo que a pessoa autorizou.</b></span></label>
      <div class="pfCamC"><video id="pfCapVideo" autoplay playsinline muted></video></div>
      <div class="pfBarra"><i id="pfCapBarra"></i></div>
      <div class="pfPasso" id="pfCapPasso">Marque a autorização para começar.</div>
      <div class="pfRow"><button class="btn good" id="pfCapIniciar" disabled>Iniciar captura</button></div>
      <div class="hint" id="pfCapAviso" style="text-align:left"></div>`;
    elQ("pfCapVoltar").onclick = async () => { pararCaptura(); await renderListaCadastro(); };
    const cons = elQ("pfConsent"), ini = elQ("pfCapIniciar");
    cons.onchange = () => { ini.disabled = !cons.checked; };
    ini.onclick = () => capturar(pessoa);
  }

  async function capturar(pessoa){
    const passo = elQ("pfCapPasso"), barra = elQ("pfCapBarra"), aviso = elQ("pfCapAviso"), ini = elQ("pfCapIniciar");
    ini.disabled = true; elQ("pfConsent").disabled = true;
    CAP = { ativo:true, timer:null };
    try{
      passo.textContent = "Carregando o reconhecimento…";
      await carregarLib();
      const video = elQ("pfCapVideo");
      K.stream = await abrirCamera(video); K.video = video;
    }catch(e){
      passo.textContent = ""; aviso.textContent = (e && e.name === "NotAllowedError") ? "A câmera está bloqueada. Permita o acesso nas configurações do navegador." : ((e && e.message) || "Não foi possível abrir a câmera.");
      CAP = null; ini.disabled = false; elQ("pfConsent").disabled = false; return;
    }
    const video = elQ("pfCapVideo");
    const amostras = [];
    let passoAtual = 0, seguidos = 0;
    passo.textContent = PASSOS[0].txt;
    const loop = async () => {
      if(!CAP || !CAP.ativo) return;
      try{
        if(video.readyState >= 2){
          const vw = video.videoWidth || 640;
          const dets = (await detectar(video, true)).filter(d => d.box.width >= vw * MIN_FACE && d.score >= 0.6).sort((a, b) => b.box.width - a.box.width);
          const ps = PASSOS[passoAtual];
          let bom = false;
          if(dets.length === 1 || (dets.length > 1 && dets[1].box.width < dets[0].box.width * 0.6)){
            const f = dets[0]; const g = giro(f.pts);
            bom = ps.giro ? (g != null && Math.abs(g - 0.5) >= 0.07) : true;
            if(bom){ seguidos++; } else seguidos = 0;
            if(seguidos >= 2){
              amostras.push({ v: arred(f.descriptor) }); seguidos = 0; passoAtual++;
              barra.style.width = Math.round((passoAtual / PASSOS.length) * 100) + "%";
              if(passoAtual >= PASSOS.length){ await finalizarCaptura(pessoa, amostras); return; }
              passo.textContent = "✔ Capturado. " + PASSOS[passoAtual].txt;
            }
          } else { seguidos = 0; }
        }
      }catch(e){ console.error(e); }
      if(CAP && CAP.ativo) CAP.timer = setTimeout(loop, 350);
    };
    loop();
  }

  async function finalizarCaptura(pessoa, amostras){
    const passo = elQ("pfCapPasso"), aviso = elQ("pfCapAviso");
    CAP.ativo = false; fecharCamera();
    // 1) todas as capturas precisam ser da mesma pessoa
    const base = amostras[0].v;
    if(amostras.some(a => dist(a.v, base) > 0.6)){
      passo.textContent = ""; aviso.textContent = "As capturas parecem de pessoas diferentes. Tente de novo com só uma pessoa na frente da câmera.";
      CAP = null; const ini = elQ("pfCapIniciar"); if(ini){ ini.disabled = false; elQ("pfConsent").disabled = false; } return;
    }
    // 2) esse rosto já está cadastrado com outro nome?
    try{ await carregarGaleria(); }catch(e){}
    const outros = GALERIA.filter(g => g.uid !== pessoa.uid);
    for(const a of amostras){
      const r = identificar(a.v, outros, 0.45, 0);
      if(r.pessoa || r.dist < 0.45){
        const alvo = outros.find(o => melhorDistancia(a.v, o) < 0.45);
        if(alvo && !confirm("Este rosto parece ser o de “" + alvo.nome + "”, que já está cadastrado. Cadastrar mesmo assim?")){ CAP = null; await renderListaCadastro(); return; }
        break;
      }
    }
    passo.textContent = "Salvando…";
    try{
      const quem = (B.MY && (B.MY.name || B.MY.email)) || "admin";
      await B.fs.setDoc(B.fs.doc(B.db, "stores", B.STORE_ID, "pontoFaces", pessoa.uid), {
        uid: pessoa.uid, nome: pessoa.nome, samples: amostras, versao: 1,
        consentimento: { aceito:true, em:new Date().toISOString(), registradoPor: quem, texto: TEXTO_CONSENTIMENTO },
        criadoEm: new Date().toISOString()
      });
    }catch(e){
      passo.textContent = ""; aviso.textContent = erroRegras(e); CAP = null; return;
    }
    CAP = null;
    await renderListaCadastro();
  }

  /* ===================== CONFIGURAÇÃO (cartão na aba Config) ===================== */
  async function carregarCfg(){
    try{
      const s = await B.fs.getDoc(refCfg());
      if(s.exists()) CFG = Object.assign({}, DEFAULTS, s.data());
    }catch(e){ console.warn("Config facial:", e); }
    return CFG;
  }
  function urlQuiosque(){ return location.origin + location.pathname + "?quiosque=1"; }

  function renderCard(){
    const host = elQ("faceCfgCard"); if(!host || !B || !B.isAdmin) return;
    host.innerHTML = `
    <div class="card" style="max-width:520px">
      <div class="cardHead"><h2>🙂 Reconhecimento facial (quiosque)</h2></div>
      <div class="hint" style="text-align:left;padding:0 0 8px">Um tablet fixo na loja reconhece quem está na frente e registra o ponto. Só o código numérico do rosto é guardado, não a foto.</div>
      <div class="field"><label><input type="checkbox" id="pfCfgAtivo" ${CFG.ativo ? "checked" : ""}/> Ativar reconhecimento facial</label></div>
      <div class="field"><label>Rigor do reconhecimento</label>
        <select id="pfCfgLimiar">
          <option value="0.55" ${CFG.limiar >= 0.54 ? "selected" : ""}>Mais flexível (reconhece mais fácil, erra um pouco mais)</option>
          <option value="0.50" ${(CFG.limiar > 0.47 && CFG.limiar < 0.54) ? "selected" : ""}>Equilibrado (recomendado)</option>
          <option value="0.45" ${CFG.limiar <= 0.47 ? "selected" : ""}>Rigoroso (erra menos, mas pode recusar com pouca luz)</option>
        </select></div>
      <div class="field"><label>Prova de vida (evita foto de celular na frente da câmera)</label>
        <select id="pfCfgVida"><option value="virar" ${CFG.provaDeVida === "virar" ? "selected" : ""}>Virar o rosto para um lado e voltar</option><option value="off" ${CFG.provaDeVida === "off" ? "selected" : ""}>Desligada</option></select></div>
      <div class="field"><label><input type="checkbox" id="pfCfgManual" ${CFG.permitirManual ? "checked" : ""}/> Permitir registro manual no tablet (fica marcado ⚠️ para conferência)</label></div>
      <div class="pfRow" style="display:flex;gap:8px;flex-wrap:wrap;margin-top:6px">
        <button class="btn good" id="pfCfgSalvar">Salvar</button>
        <button class="btn" id="pfCfgRostos">👤 Cadastrar / gerenciar rostos</button>
        <button class="btn" id="pfCfgAbrir">📷 Abrir quiosque agora</button>
      </div>
      <div class="hint" style="text-align:left;margin-top:10px">Endereço para deixar aberto no tablet: <b id="pfUrl">${esc(urlQuiosque())}</b>
        <button class="btn" id="pfCopiar" style="padding:3px 8px;margin-left:6px">Copiar</button></div>
      <div class="hint" style="text-align:left;margin-top:8px">⚠️ Controle interno de jornada. A conferência acontece no navegador e não substitui ponto homologado para fins legais. O rosto é dado pessoal sensível (LGPD): colete o consentimento de cada pessoa.</div>
    </div>`;
    elQ("pfCfgSalvar").onclick = salvarCfg;
    elQ("pfCfgRostos").onclick = abrirCadastro;
    elQ("pfCfgAbrir").onclick = async () => { await salvarCfg(true); abrirQuiosque(); };
    elQ("pfCopiar").onclick = async () => { try{ await navigator.clipboard.writeText(urlQuiosque()); elQ("pfCopiar").textContent = "Copiado!"; }catch(e){ prompt("Copie o endereço:", urlQuiosque()); } };
  }

  async function salvarCfg(silencioso){
    CFG = {
      ativo: !!elQ("pfCfgAtivo").checked,
      limiar: parseFloat(elQ("pfCfgLimiar").value) || DEFAULTS.limiar,
      provaDeVida: elQ("pfCfgVida").value === "off" ? "off" : "virar",
      permitirManual: !!elQ("pfCfgManual").checked
    };
    try{ await B.fs.setDoc(refCfg(), CFG); if(silencioso !== true) alert("Configuração salva!"); }
    catch(e){ alert(erroRegras(e)); }
  }

  /* ===================== INICIALIZAÇÃO ===================== */
  async function init(bridge){
    B = bridge;
    if(!B || !B.isAdmin) return;
    await carregarCfg();
    renderCard();
    if(/[?&]quiosque=1/.test(location.search)) abrirQuiosque();
  }

  window.PontoFacial = {
    init, abrirQuiosque, fecharQuiosque, abrirCadastro,
    // exposto para testes automáticos
    _t: { dist, identificar, giro, criarVida, criarEstavel, opcoesDeBatida, validarBatida, registrarBatida, aoQuadro, arred, melhorDistancia,
          _estado: () => ({ K, CFG, GALERIA }), _setCfg: c => { CFG = Object.assign({}, DEFAULTS, c); }, _setGaleria: g => { GALERIA = g; },
          _setBridge: b => { B = b; }, _irProcurando: irParaProcurando, _montar: montarQuiosque, _salvar: salvar, _confirmar: irParaConfirmar, _manual: abrirManual }
  };
})();
