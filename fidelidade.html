import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import {
  getFirestore, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc,
  collection, onSnapshot, writeBatch
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

window.__ONDIS_CRM_MODULE_LOADED__=true;

const firebaseConfig={
  apiKey:"AIzaSyCTjYwOpMpwhGbrsUFPOgO2V-GXAwfcubA",
  authDomain:"omnia-3b32b.firebaseapp.com",projectId:"omnia-3b32b",
  storageBucket:"omnia-3b32b.firebasestorage.app",messagingSenderId:"858764463578",
  appId:"1:858764463578:web:1fabf841013e2053bd44e3"
};
const SUPER_ADMIN_EMAIL="davi.vieira.each@gmail.com";
const firebaseApp=initializeApp(firebaseConfig);
const auth=getAuth(firebaseApp), db=getFirestore(firebaseApp);
const $=(id)=>document.getElementById(id);
const qsa=(selector,root=document)=>Array.from(root.querySelectorAll(selector));
const now=()=>Date.now();
const isoNow=()=>new Date().toISOString();
const uid=(prefix="crm")=>`${prefix}_${Date.now()}_${Math.random().toString(36).slice(2,8)}`;
const withTimeout=(promise,ms=8000,label="A operação")=>Promise.race([
  promise,
  new Promise((_,reject)=>setTimeout(()=>reject(new Error(`${label} excedeu ${ms/1000}s.`)),ms))
]);

const STAGES=[
  {id:"novo",name:"Novo lead",prob:10,color:"#7893bc"},
  {id:"contato",name:"Contato realizado",prob:20,color:"#507ee0"},
  {id:"interesse",name:"Interesse identificado",prob:35,color:"#7657cf"},
  {id:"orcamento",name:"Orçamento enviado",prob:50,color:"#d98a16"},
  {id:"negociacao",name:"Negociação",prob:70,color:"#d36b30"},
  {id:"ganha",name:"Venda ganha",prob:100,color:"#079669",closed:true,won:true},
  {id:"perdida",name:"Venda perdida",prob:0,color:"#dc4c64",closed:true,lost:true}
];
const LOSS_REASONS=["Preço","Falta de estoque","Produto inadequado","Prazo","Concorrência","Cliente desistiu","Sem resposta","Outro"];
const COLLECTIONS={
  clients:"clientes",records:"records",deals:"crm_negociacoes",tasks:"crm_atividades",
  attendances:"crm_atendimentos",campaigns:"crm_campanhas",journeys:"crm_jornadas",
  segments:"crm_segmentos",loyalty:"crm_fidelidade",surveys:"crm_pesquisas",audit:"crm_auditoria"
};
const initialParams=new URLSearchParams(location.search);
const requestedView=initialParams.get("view");
const embedMode=initialParams.get("embed")==="1";
const validInitialViews=new Set(["hoje","clientes","segmentos","atendimentos","agenda","funil","orcamentos","produtos","campanhas","jornadas","fidelidade","metricas","equipe","integracoes","usuarios","lgpd"]);
const state={
  me:null,storeId:null,store:{},appState:{},sellers:[],users:[],
  clients:[],records:[],deals:[],tasks:[],attendances:[],campaigns:[],journeys:[],segments:[],loyalty:[],surveys:[],audit:[],
  errors:{},loaded:new Set(),view:validInitialViews.has(requestedView)?requestedView:"hoje",selectedClients:new Set(),attendanceStatus:"",selectedAttendance:null,agendaRange:"today",
  detailClient:null,clientDetailTab:"resumo",renderQueued:false
};
if(embedMode) document.body.classList.add("crm-embed");

function esc(value){return String(value??"").replace(/[&<>'"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));}
function digits(value){return String(value||"").replace(/\D/g,"");}
function money(value){return Number(value||0).toLocaleString("pt-BR",{style:"currency",currency:"BRL"});}
function number(value,digitsCount=0){return Number(value||0).toLocaleString("pt-BR",{minimumFractionDigits:digitsCount,maximumFractionDigits:digitsCount});}
function parseMoney(value){if(typeof value==="number")return value;const raw=String(value||"").trim().replace(/R\$/g,"").replace(/\s/g,"");if(!raw)return 0;const normalized=raw.includes(",")?raw.replace(/\./g,"").replace(",","."):raw;const parsed=Number(normalized);return Number.isFinite(parsed)?parsed:0;}
function dateValue(value){
  if(!value)return null;if(typeof value==="number")return new Date(value);if(value?.toDate)return value.toDate();
  if(/^\d{4}-\d{2}-\d{2}$/.test(String(value))){const [y,m,d]=String(value).split("-").map(Number);return new Date(y,m-1,d,12,0,0,0);}
  const parsed=new Date(value);return Number.isNaN(parsed.getTime())?null:parsed;
}
function dateKey(value){const d=dateValue(value);if(!d)return "";return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;}
function formatDate(value,withTime=false){const d=dateValue(value);if(!d)return "—";return d.toLocaleString("pt-BR",withTime?{dateStyle:"short",timeStyle:"short"}:{dateStyle:"short"});}
function toLocalInput(value){const d=dateValue(value);if(!d)return "";const offset=d.getTimezoneOffset()*60000;return new Date(d.getTime()-offset).toISOString().slice(0,16);}
function daysSince(value){const d=dateValue(value);return d?Math.max(0,Math.floor((Date.now()-d.getTime())/86400000)):9999;}
function daysUntil(value){const d=dateValue(value);return d?Math.ceil((d.getTime()-Date.now())/86400000):9999;}
function initials(name){return String(name||"?").trim().split(/\s+/).slice(0,2).map(v=>v[0]||"").join("").toUpperCase();}
function firstName(name){return String(name||"cliente").trim().split(/\s+/)[0]||"cliente";}
function stage(id){return STAGES.find(s=>s.id===id)||STAGES[0];}
function sellerById(id,name=""){return state.sellers.find(s=>String(s.id)===String(id))||state.users.find(s=>String(s.id)===String(id))||{id:id||"",name:name||"Sem responsável"};}
function clientById(id){return state.clients.find(c=>c.id===id);}
function dealById(id){return state.deals.find(d=>d.id===id);}
function isAdmin(){return ["admin","superadmin"].includes(state.me?.role);}
function isManager(){return ["admin","superadmin","manager","gerente","marketing","crm"].includes(state.me?.role);}
function isMarketing(){return ["marketing","crm"].includes(state.me?.role);}
function canManage(){return isAdmin()||["manager","gerente"].includes(state.me?.role);}
function ownerMatches(item){
  if(isManager())return true;
  const myName=String(state.me?.name||state.me?.email||"").trim().toLowerCase();
  const ownerName=String(item?.ownerNome||item?.vendedorNome||"").trim().toLowerCase();
  return item?.ownerUid===state.me?.uid || (!!myName&&ownerName===myName) || (!item?.ownerUid&&!ownerName);
}
function visibleClients(){
  let list=state.clients.filter(ownerMatches);
  const sellerId=$("sellerFilter")?.value;if(isManager()&&sellerId)list=list.filter(c=>c.ownerUid===sellerId);
  return list;
}
function visibleDeals(){
  let list=state.deals.filter(ownerMatches);
  const sellerId=$("sellerFilter")?.value;if(isManager()&&sellerId)list=list.filter(d=>d.ownerUid===sellerId);
  return list;
}
function visibleTasks(){
  let list=state.tasks.filter(ownerMatches);
  const sellerId=$("sellerFilter")?.value;if(isManager()&&sellerId)list=list.filter(t=>t.ownerUid===sellerId);
  return list;
}
function visibleAttendances(){
  let list=state.attendances.filter(ownerMatches);
  const sellerId=$("sellerFilter")?.value;if(isManager()&&sellerId)list=list.filter(a=>a.ownerUid===sellerId);
  return list;
}
function getRange(){
  const filter=$("periodFilter")?.value||"30",end=new Date();end.setHours(23,59,59,999);let start=new Date(end);
  if(filter==="today")start.setHours(0,0,0,0);
  else if(filter==="month"){start=new Date(end.getFullYear(),end.getMonth(),1);start.setHours(0,0,0,0);}
  else if(filter==="custom"){
    start=dateValue($("dateStart")?.value)||new Date(end.getFullYear(),end.getMonth(),1);
    const customEnd=dateValue($("dateEnd")?.value);if(customEnd){end.setTime(customEnd.getTime());end.setHours(23,59,59,999);}
  }else{start.setDate(end.getDate()-(Number(filter)-1));start.setHours(0,0,0,0);}
  return {start,end};
}
function inRange(value,range=getRange()){const d=dateValue(value);return !!d&&d>=range.start&&d<=range.end;}
function previousRange(){const current=getRange(),span=current.end-current.start+1;return {start:new Date(current.start.getTime()-span),end:new Date(current.start.getTime()-1)};}
function recordDate(record){return record.tsEnd||record.tsStart||(record.dateKey?`${record.dateKey}T12:00:00`:null);}
function saleRecords(range=getRange()){return state.records.filter(r=>r.outcome==="sold"&&inRange(recordDate(r),range)&&(!$("sellerFilter")?.value||r.sellerId===$("sellerFilter").value));}
function closedWonDeals(range=getRange()){return visibleDeals().filter(d=>d.etapa==="ganha"&&inRange(d.fechadoEm||d.atualizadoEm||d.criadoEm,range));}
function openDeals(){return visibleDeals().filter(d=>!stage(d.etapa).closed);}
function clientPurchases(client){return Array.isArray(client?.compras)?client.compras:[];}
function totalSpent(client){return clientPurchases(client).reduce((sum,p)=>sum+Number(p.valor||0),0);}
function lastPurchase(client){return clientPurchases(client).map(p=>dateValue(p.ts||p.data)).filter(Boolean).sort((a,b)=>b-a)[0]||null;}
function firstPurchase(client){return clientPurchases(client).map(p=>dateValue(p.ts||p.data)).filter(Boolean).sort((a,b)=>a-b)[0]||null;}
function lastInteraction(client){return (Array.isArray(client?.interacoes)?client.interacoes:[]).map(i=>dateValue(i.ts||i.data)).filter(Boolean).sort((a,b)=>b-a)[0]||null;}
function clientDeals(id){return state.deals.filter(d=>d.clientId===id);}
function clientTasks(id){return state.tasks.filter(t=>t.clientId===id);}
function clientAttendances(id){return state.attendances.filter(a=>a.clientId===id);}
function clientSurveys(id){return state.surveys.filter(s=>s.clientId===id);}
function clientLoyalty(id){return state.loyalty.filter(l=>l.clientId===id);}
function rfv(client){
  const recency=daysSince(lastPurchase(client)),frequency=clientPurchases(client).length,value=totalSpent(client);
  const r=recency<=30?5:recency<=60?4:recency<=90?3:recency<=180?2:1;
  const f=frequency>=8?5:frequency>=5?4:frequency>=3?3:frequency>=2?2:1;
  const v=value>=5000?5:value>=3000?4:value>=1500?3:value>=500?2:1;
  const score=r+f+v;
  const label=score>=13?"Campeões":score>=10?"Fiéis":score>=7?"Potenciais":recency>120?"Em risco":"Novos";
  return {r,f,v,score,label,recency,frequency,value};
}
function clientRisk(client){
  const negative=clientSurveys(client.id).some(s=>Number(s.nota)<=6&&daysSince(s.criadoEm)<90);
  const days=daysSince(lastPurchase(client));
  if(negative||days>=120)return "alto";if(days>=60)return "medio";return "baixo";
}
function segmentLabel(client){return rfv(client).label;}
function lifetimeValue(client){const purchases=clientPurchases(client),total=totalSpent(client);if(!purchases.length)return 0;const first=firstPurchase(client),last=lastPurchase(client);const months=Math.max(1,first&&last?((last-first)/2629800000)+1:1);return (total/months)*12;}
function contactPhone(client){return digits(client?.whatsapp||client?.telefone);}
function whatsappUrl(client,text){const phone=contactPhone(client);if(phone.length<10)return "";const full=phone.startsWith("55")?phone:`55${phone}`;return `https://wa.me/${full}?text=${encodeURIComponent(text||"")}`;}

function toast(message,type="success"){const el=document.createElement("div");el.className=`toast ${type}`;el.textContent=message;$("toastStack").appendChild(el);setTimeout(()=>el.remove(),4200);}
function showLoading(text="Processando…"){$("loadingText").textContent=text;$("loadingScreen").classList.add("show");}
function hideLoading(){
  $("loadingScreen").classList.remove("show");
  $("loadingScreen").setAttribute("aria-hidden","true");
  const recovery=window.__ONDIS_CRM_RECOVERY__;
  if(recovery?.timer){clearTimeout(recovery.timer);recovery.timer=null;}
}
function emptyState(icon,title,text,action="",label=""){
  return `<div class="empty-state"><span>${icon}</span><strong>${esc(title)}</strong><p>${esc(text)}</p>${action?`<button class="btn btn-primary" data-action="${action}">${esc(label)}</button>`:""}</div>`;
}
function errorMessage(error){const code=String(error?.code||error?.message||error||"");if(/permission|insufficient/i.test(code))return "Permissão insuficiente para acessar estes dados.";if(/network|offline|unavailable/i.test(code))return "Falha de conexão. Verifique a internet e tente novamente.";return "Não foi possível concluir a operação.";}
function showPermission(message){$("permissionBanner").textContent=message;$("permissionBanner").classList.remove("hidden");}
function queueRender(){if(state.renderQueued)return;state.renderQueued=true;requestAnimationFrame(()=>{state.renderQueued=false;renderAll();});}

function collectionRef(key){return collection(db,"stores",state.storeId,COLLECTIONS[key]);}
function documentRef(key,id){return doc(db,"stores",state.storeId,COLLECTIONS[key],id);}
async function audit(action,targetType,targetId,details={}){
  if(!state.storeId||!state.me)return;
  const id=uid("aud");
  try{await setDoc(documentRef("audit",id),{id,action,targetType,targetId:targetId||"",details,userUid:state.me.uid,userName:state.me.name||state.me.email||"",userRole:state.me.role,createdAt:isoNow()});}catch(error){console.error("Auditoria:",error);}
}
async function safeWrite(key,id,data,{merge=true,auditAction=""}={}){
  try{await setDoc(documentRef(key,id),data,{merge});if(auditAction)await audit(auditAction,key,id);return true;}
  catch(error){console.error(error);toast(errorMessage(error),"error");return false;}
}

function normalizeRole(role){const value=String(role||"seller").toLowerCase();const map={vendedor:"seller",gerente:"manager",administrador:"admin","marketing/crm":"marketing"};return map[value]||value;}
function listenStoreCollection(key){
  return onSnapshot(collectionRef(key),snap=>{
    state[key]=snap.docs.map(d=>({id:d.id,...d.data()}));state.loaded.add(key);delete state.errors[key];queueRender();checkInitialLoad();
  },error=>{
    console.error(`Falha em ${key}:`,error);state.errors[key]=error;state.loaded.add(key);queueRender();checkInitialLoad();
  });
}
function checkInitialLoad(){
  const core=["clients","records","deals","tasks"];
  if(core.every(k=>state.loaded.has(k))){hideLoading();if(state.errors.clients||state.errors.records)showPermission("Alguns dados essenciais não puderam ser carregados. Verifique as permissões do usuário e as regras do banco.");}
}
async function loadUsers(){
  try{
    const snap=await withTimeout(getDocs(collection(db,"users")),8000,"A lista de usuários");
    state.users=snap.docs.map(d=>({id:d.id,...d.data()})).filter(u=>u.storeId===state.storeId||(Array.isArray(u.storeIds)&&u.storeIds.includes(state.storeId)));
  }catch(error){state.errors.users=error;console.error("Usuários:",error);}
}
async function loadStoreContext(){
  await Promise.all([
    (async()=>{try{const snap=await withTimeout(getDoc(doc(db,"stores",state.storeId)),8000,"O cadastro da loja");if(snap.exists())state.store={id:snap.id,...snap.data()};}catch(error){state.errors.store=error;console.error("Loja:",error);}})(),
    (async()=>{try{const snap=await withTimeout(getDoc(doc(db,"stores",state.storeId,"app","state")),8000,"Os dados operacionais");if(snap.exists()&&snap.data().json)state.appState=JSON.parse(snap.data().json);}catch(error){state.errors.appState=error;console.error("Estado da loja:",error);}})(),
    loadUsers()
  ]);
  buildSellerList();
}
function buildSellerList(){
  const fromApp=(Array.isArray(state.appState?.sellers)?state.appState.sellers:[]).map(s=>({id:s.id,name:s.name||"Vendedor",photo:s.photo||"",active:s.active!==false,source:"operation"}));
  const fromUsers=state.users.filter(u=>u.active!==false).map(u=>({id:u.id,name:u.name||u.email||"Usuário",email:u.email||"",role:normalizeRole(u.role),active:true,source:"user"}));
  const map=new Map();[...fromApp,...fromUsers].forEach(s=>{if(s.id&&!map.has(s.id))map.set(s.id,s);});
  state.sellers=Array.from(map.values()).sort((a,b)=>a.name.localeCompare(b.name,"pt-BR"));
}
function populateSelect(selectId,{blankLabel="",clients=false}={}){
  const select=$(selectId);if(!select)return;const current=select.value;
  const list=clients?visibleClients().slice().sort((a,b)=>(a.nome||"").localeCompare(b.nome||"","pt-BR")):state.sellers;
  const options=[];if(blankLabel)options.push(`<option value="">${esc(blankLabel)}</option>`);
  options.push(...list.map(item=>`<option value="${esc(item.id)}">${esc(clients?item.nome:item.name)}</option>`));
  select.innerHTML=options.join("");if(Array.from(select.options).some(o=>o.value===current))select.value=current;
}
function populateControls(){
  ["sellerFilter","clientOwnerFilter"].forEach(id=>populateSelect(id,{blankLabel:"Todos os vendedores"}));
  ["clientOwnerSelect","dealOwnerSelect","taskOwnerSelect","attendanceOwnerSelect","transferOwnerSelect"].forEach(id=>populateSelect(id,{blankLabel:id==="transferOwnerSelect"?"Liberar para a equipe":"Sem responsável"}));
  ["dealClientSelect","taskClientSelect","attendanceClientSelect","surveyClientSelect","loyaltyClientSelect"].forEach(id=>populateSelect(id,{blankLabel:id==="taskClientSelect"?"Sem cliente":"Selecione um cliente",clients:true}));
  const stageSelect=$("dealStageSelect");if(stageSelect){const current=stageSelect.value;stageSelect.innerHTML=STAGES.map(s=>`<option value="${s.id}">${s.name}</option>`).join("");if(current)stageSelect.value=current;}
  const segments=allSegments();const segmentOptions=[`<option value="todos">Todos com consentimento</option>`,...segments.map(s=>`<option value="${esc(s.id)}">${esc(s.name)}</option>`)];
  if($("campaignSegmentSelect")){const current=$("campaignSegmentSelect").value;$("campaignSegmentSelect").innerHTML=segmentOptions.join("");if(current)$("campaignSegmentSelect").value=current;}
  if($("clientSegmentFilter")){const current=$("clientSegmentFilter").value;$("clientSegmentFilter").innerHTML=`<option value="">Todos os segmentos</option>`+segments.map(s=>`<option value="${esc(s.id)}">${esc(s.name)}</option>`).join("");if(current)$("clientSegmentFilter").value=current;}
  if($("metricSegmentFilter")){const current=$("metricSegmentFilter").value;$("metricSegmentFilter").innerHTML=`<option value="">Todos os segmentos</option>`+segments.map(s=>`<option value="${esc(s.id)}">${esc(s.name)}</option>`).join("");if(current)$("metricSegmentFilter").value=current;}
  if($("metricCampaignFilter")){const current=$("metricCampaignFilter").value;$("metricCampaignFilter").innerHTML=`<option value="">Todas as campanhas</option>`+state.campaigns.map(c=>`<option value="${esc(c.id)}">${esc(c.nome)}</option>`).join("");if(current)$("metricCampaignFilter").value=current;}
  if($("metricProductFilter")){const current=$("metricProductFilter").value,products=Array.from(new Set(state.deals.map(d=>d.produto).filter(Boolean))).sort((a,b)=>a.localeCompare(b,"pt-BR"));$("metricProductFilter").innerHTML=`<option value="">Todos os produtos</option>`+products.map(p=>`<option>${esc(p)}</option>`).join("");if(current)$("metricProductFilter").value=current;}
  if($("metricOriginFilter")){const current=$("metricOriginFilter").value,origins=Array.from(new Set(state.deals.map(d=>d.origem).filter(Boolean))).sort((a,b)=>a.localeCompare(b,"pt-BR"));$("metricOriginFilter").innerHTML=`<option value="">Todas as origens</option>`+origins.map(o=>`<option>${esc(o)}</option>`).join("");if(current)$("metricOriginFilter").value=current;}
}

onAuthStateChanged(auth,async user=>{
  if(!user){location.href="./login.html";return;}
  showLoading("Validando acesso e carregando a loja…");
  let profile={role:"seller",name:user.email,email:user.email,active:true};
  try{const snap=await withTimeout(getDoc(doc(db,"users",user.uid)),8000,"A validação do usuário");if(snap.exists())profile={...profile,...snap.data()};}catch(error){console.error(error);}
  if(String(user.email||"").toLowerCase()===SUPER_ADMIN_EMAIL)profile.role="superadmin";
  profile.role=normalizeRole(profile.role);
  if(profile.active===false){toast("Sua conta está desativada.","error");await signOut(auth);location.href="./login.html";return;}
  state.me={uid:user.uid,...profile};
  state.storeId=sessionStorage.getItem("omnia_loja_ativa")||profile.storeId||(Array.isArray(profile.storeIds)?profile.storeIds[0]:null);
  if(!state.storeId){hideLoading();showPermission("Nenhuma loja está vinculada a este usuário. Volte ao ONDIS e selecione uma loja.");return;}
  await loadStoreContext();
  applyPermissions();
  populateControls();
  Object.keys(COLLECTIONS).forEach(listenStoreCollection);
  qsa(".crm-view").forEach(v=>v.classList.toggle("active",v.id===`view-${state.view}`));
  qsa(".nav-link").forEach(b=>b.classList.toggle("active",b.dataset.view===state.view));
  renderShell();
  if(state.errors.store||state.errors.appState||state.errors.users){
    showPermission("Parte do contexto da loja demorou para responder. O CRM continuará tentando carregar os dados disponíveis.");
  }
});

function applyPermissions(){
  qsa(".manager-only").forEach(el=>el.classList.toggle("hidden",!isManager()));
  qsa(".admin-only").forEach(el=>el.classList.toggle("hidden",!isAdmin()));
  $("rolePill").textContent={seller:"Vendedor",manager:"Gerente",gerente:"Gerente",admin:"Administrador",superadmin:"Super admin",marketing:"Marketing/CRM",crm:"Marketing/CRM"}[state.me.role]||state.me.role;
  if(isMarketing())qsa('[data-view="equipe"]').forEach(el=>el.classList.add("hidden"));
}
function renderShell(){
  const name=state.store.name||state.store.code||state.storeId;
  $("storeContext").textContent=`${name} · ${state.me.name||state.me.email}`;
  $("pageTitle").textContent=document.querySelector(`#view-${state.view}`)?.dataset.title||"CRM Completo";
}
function renderAll(){
  if(!state.me||!state.storeId)return;
  buildSellerList();populateControls();renderShell();
  const renderers={hoje:renderToday,clientes:renderClients,segmentos:renderSegments,atendimentos:renderAttendances,agenda:renderAgenda,funil:renderPipeline,orcamentos:renderQuotes,produtos:renderProducts,campanhas:renderCampaigns,jornadas:renderJourneys,fidelidade:renderLoyalty,metricas:renderMetrics,equipe:renderTeam,integracoes:renderIntegrations,usuarios:renderUsers,lgpd:renderLgpd};
  try{renderers[state.view]?.();}catch(error){console.error(`Render ${state.view}:`,error);const view=$(`view-${state.view}`);if(view)view.insertAdjacentHTML("beforeend",`<div class="error-box">Não foi possível montar esta visão. Atualize a página ou contate o suporte.</div>`);}
  if(state.detailClient&&$("client360Dialog")?.open)renderClient360(state.detailClient);
}
function switchView(view){
  const target=$(`view-${view}`);if(!target)return;
  if(target.closest(".admin-only")&&!isAdmin())return;
  state.view=view;qsa(".crm-view").forEach(v=>v.classList.toggle("active",v===target));qsa(".nav-link").forEach(b=>b.classList.toggle("active",b.dataset.view===view));renderAll();
  $("crmSidebar").classList.remove("open");window.scrollTo({top:0,behavior:"smooth"});
}

qsa(".nav-link").forEach(button=>button.addEventListener("click",()=>switchView(button.dataset.view)));
$("menuToggle").addEventListener("click",()=>$("crmSidebar").classList.add("open"));
$("sidebarClose").addEventListener("click",()=>$("crmSidebar").classList.remove("open"));
$("logoutButton").addEventListener("click",async()=>{await signOut(auth);location.href="./login.html";});
$("refreshButton").addEventListener("click",()=>{renderAll();toast("Visão atualizada com os dados carregados.");});
$("periodFilter").addEventListener("change",()=>{qsa(".custom-date").forEach(el=>el.classList.toggle("hidden",$("periodFilter").value!=="custom"));renderAll();});
["dateStart","dateEnd","sellerFilter"].forEach(id=>$(id)?.addEventListener("change",renderAll));
window.addEventListener("error",event=>console.error("CRM Completo:",event.error||event.message));
window.addEventListener("unhandledrejection",event=>console.error("CRM Completo:",event.reason));

function kpi(label,value,{icon="•",foot="",trend=""}={}){return `<div class="kpi-card"><div class="k-label"><span>${esc(label)}</span><span class="k-icon">${icon}</span></div><strong class="k-value">${value}</strong>${foot?`<div class="k-foot ${trend}">${esc(foot)}</div>`:""}</div>`;}
function percentChange(current,previous){if(!previous)return current?100:0;return ((current-previous)/Math.abs(previous))*100;}
function trendText(current,previous){const pct=percentChange(current,previous),arrow=pct>0?"↑":pct<0?"↓":"→";return {text:`${arrow} ${number(Math.abs(pct),1)}% vs. período anterior`,className:pct>0?"trend-up":pct<0?"trend-down":""};}
function monthlyGoal(){
  const month=dateKey(new Date()).slice(0,7),raw=state.appState?.goalsByMonth?.[month];
  if(typeof raw==="number")return raw;if(raw&&typeof raw==="object")return Number(raw.value||raw.goal||raw.target||0);return 0;
}
function pipelineValue(){return openDeals().reduce((sum,d)=>sum+Number(d.valor||0),0);}
function weightedPipeline(){return openDeals().reduce((sum,d)=>sum+Number(d.valor||0)*(Number(d.probabilidade??stage(d.etapa).prob)/100),0);}
function contactsInRange(range=getRange()){return visibleAttendances().filter(a=>inRange(a.ultimaMensagemEm||a.atualizadoEm||a.criadoEm,range));}
function responseRate(range=getRange()){
  const contacts=contactsInRange(range),answered=contacts.filter(a=>["aguardando_vendedor","agendada","concluida"].includes(a.status));
  return contacts.length?(answered.length/contacts.length)*100:0;
}
function opportunityConversion(range=getRange()){
  const considered=visibleDeals().filter(d=>stage(d.etapa).closed&&inRange(d.fechadoEm||d.atualizadoEm,range));
  const won=considered.filter(d=>d.etapa==="ganha");return considered.length?(won.length/considered.length)*100:0;
}
function lastClientActivity(client){const dates=[lastInteraction(client),lastPurchase(client),...clientAttendances(client.id).map(a=>dateValue(a.atualizadoEm||a.criadoEm))].filter(Boolean).sort((a,b)=>b-a);return dates[0]||null;}

const BUILTIN_SEGMENTS=[
  {id:"novos",name:"Novos clientes",description:"Cadastrados nos últimos 30 dias",test:c=>daysSince(c.criadoEm)<=30},
  {id:"recorrentes",name:"Clientes recorrentes",description:"Duas ou mais compras concluídas",test:c=>clientPurchases(c).length>=2},
  {id:"vip",name:"VIP",description:"RFV alto, valor ou frequência elevada",test:c=>rfv(c).score>=13||totalSpent(c)>=3000||clientPurchases(c).length>=5},
  {id:"alto_ticket",name:"Alto ticket",description:"Ticket médio individual acima de R$ 1.000",test:c=>clientPurchases(c).length&&totalSpent(c)/clientPurchases(c).length>=1000},
  {id:"alta_frequencia",name:"Alta frequência",description:"Cinco ou mais compras concluídas",test:c=>clientPurchases(c).length>=5},
  {id:"inativos_30",name:"Inativos 30+ dias",description:"Sem compra concluída há pelo menos 30 dias",test:c=>lastPurchase(c)&&daysSince(lastPurchase(c))>=30},
  {id:"inativos_60",name:"Inativos 60+ dias",description:"Sem compra concluída há pelo menos 60 dias",test:c=>lastPurchase(c)&&daysSince(lastPurchase(c))>=60},
  {id:"inativos_90",name:"Inativos 90+ dias",description:"Sem compra concluída há pelo menos 90 dias",test:c=>lastPurchase(c)&&daysSince(lastPurchase(c))>=90},
  {id:"risco",name:"Em risco de abandono",description:"Risco comportamental alto ou avaliação negativa",test:c=>clientRisk(c)==="alto"},
  {id:"aniversariantes",name:"Aniversariantes do mês",description:"Aniversário no mês atual",test:c=>{const d=dateValue(c.nascimento);return d&&d.getMonth()===new Date().getMonth();}},
  {id:"orcamento",name:"Orçamento não convertido",description:"Possui orçamento aberto",test:c=>clientDeals(c.id).some(d=>d.etapa==="orcamento")},
  {id:"sem_resposta",name:"Clientes sem resposta",description:"Atendimento aguardando cliente",test:c=>clientAttendances(c.id).some(a=>a.status==="aguardando_cliente")},
  {id:"recompra",name:"Alta propensão de recompra",description:"Comprou mais de uma vez e está na janela de recompra",test:c=>clientPurchases(c).length>=2&&daysSince(lastPurchase(c))>=30&&daysSince(lastPurchase(c))<=120}
];
function customSegmentTest(segment,client){
  const condition=Array.isArray(segment.conditions)?segment.conditions[0]:segment.condition||segment;
  if(!condition)return false;let actual;
  if(condition.campo==="total")actual=totalSpent(client);else if(condition.campo==="compras")actual=clientPurchases(client).length;else if(condition.campo==="dias")actual=daysSince(lastPurchase(client));else if(condition.campo==="tag")actual=(client.tags||[]).join(",");else actual=client[condition.campo]||"";
  const expected=condition.valor;switch(condition.operador){case"gte":return Number(actual)>=Number(expected);case"lte":return Number(actual)<=Number(expected);case"contains":return String(actual).toLowerCase().includes(String(expected).toLowerCase());default:return String(actual).toLowerCase()===String(expected).toLowerCase();}
}
function allSegments(){return [...BUILTIN_SEGMENTS,...state.segments.map(s=>({id:s.id,name:s.nome||s.name,description:s.descricao||"Segmento personalizado",custom:true,test:c=>customSegmentTest(s,c)}))];}
function segmentClients(segmentId,base=visibleClients()){if(!segmentId||segmentId==="todos")return base;const segment=allSegments().find(s=>s.id===segmentId);return segment?base.filter(segment.test):[];}

function priorityItems(){
  const items=[],today=new Date(),visible=visibleClients();
  visible.forEach(client=>{
    const birth=dateValue(client.nascimento);
    if(birth&&birth.getDate()===today.getDate()&&birth.getMonth()===today.getMonth())items.push({id:`birth_${client.id}`,client,type:"aniversario",level:"medio",reason:"Aniversário hoje",detail:"Um contato pessoal fortalece o relacionamento.",value:0,due:today});
    const risk=clientRisk(client),rf=rfv(client);
    if((rf.label==="Campeões"||rf.label==="Fiéis")&&risk==="alto")items.push({id:`risk_${client.id}`,client,type:"alto",level:"alto",reason:"Cliente valioso em risco",detail:`${rf.recency} dias desde a última compra.`,value:totalSpent(client),due:today});
    const recentPurchase=lastPurchase(client);if(recentPurchase&&daysSince(recentPurchase)>=25&&daysSince(recentPurchase)<=40&&!clientTasks(client.id).some(t=>t.tipo==="Pós-venda"&&daysSince(t.criadoEm)<45))items.push({id:`post_${client.id}`,client,type:"posvenda",level:"medio",reason:"Pós-venda pendente",detail:`Compra concluída há ${daysSince(recentPurchase)} dias.`,value:totalSpent(client),due:today});
    clientLoyalty(client.id).filter(l=>l.tipo==="cashback"&&l.validade&&daysUntil(l.validade)>=0&&daysUntil(l.validade)<=10).forEach(l=>items.push({id:`cash_${l.id}`,client,type:"alto",level:"alto",reason:"Cashback vencendo",detail:`Benefício de ${money(l.valor)} vence em breve.`,value:Number(l.valor||0),due:dateValue(l.validade)}));
    clientSurveys(client.id).filter(s=>Number(s.nota)<=6&&daysSince(s.criadoEm)<=30).forEach(s=>items.push({id:`nps_${s.id}`,client,type:"alto",level:"alto",reason:"Avaliação negativa",detail:`${s.tipo||"NPS"} ${s.nota}/10 requer recuperação.`,value:0,due:dateValue(s.criadoEm)}));
  });
  openDeals().forEach(deal=>{
    const client=clientById(deal.clientId);if(!client)return;
    if(!deal.proximaAcaoEm)items.push({id:`deal_next_${deal.id}`,client,deal,type:"alto",level:"alto",reason:"Negociação sem próxima ação",detail:deal.produto||stage(deal.etapa).name,value:Number(deal.valor||0),due:today});
    else if(dateValue(deal.proximaAcaoEm)<new Date())items.push({id:`deal_late_${deal.id}`,client,deal,type:"atrasada",level:"alto",reason:"Negociação atrasada",detail:deal.proximaAcao||deal.produto||"Próxima ação vencida",value:Number(deal.valor||0),due:dateValue(deal.proximaAcaoEm)});
    if(deal.etapa==="orcamento"&&daysSince(deal.etapaAlteradaEm||deal.atualizadoEm||deal.criadoEm)>=3)items.push({id:`quote_${deal.id}`,client,deal,type:"atrasada",level:"medio",reason:"Orçamento parado",detail:`Sem avanço há ${daysSince(deal.etapaAlteradaEm||deal.atualizadoEm||deal.criadoEm)} dias.`,value:Number(deal.valor||0),due:dateValue(deal.proximaAcaoEm)});
  });
  visibleTasks().filter(t=>t.status!=="concluida"&&dateValue(t.prazo)<new Date()).forEach(task=>{const client=clientById(task.clientId);if(client)items.push({id:`task_${task.id}`,client,task,type:"atrasada",level:task.prioridade==="alta"?"alto":"medio",reason:"Atividade atrasada",detail:task.titulo,value:0,due:dateValue(task.prazo)});});
  const weight={alto:3,medio:2,baixo:1};return items.sort((a,b)=>(weight[b.level]-weight[a.level])||((a.due?.getTime?.()||Infinity)-(b.due?.getTime?.()||Infinity)));
}

function renderToday(){
  const sales=saleRecords(),previousSales=saleRecords(previousRange()),revenue=sales.reduce((s,r)=>s+Number(r.value||0),0),prevRevenue=previousSales.reduce((s,r)=>s+Number(r.value||0),0);
  const won=closedWonDeals(),crmRevenue=won.reduce((s,d)=>s+Number(d.valor||0),0),goal=monthlyGoal(),monthSales=state.records.filter(r=>r.outcome==="sold"&&String(r.monthKey||dateKey(recordDate(r)).slice(0,7))===dateKey(new Date()).slice(0,7)).reduce((s,r)=>s+Number(r.value||0),0),trend=trendText(revenue,prevRevenue);
  $("todayKpis").innerHTML=[
    kpi("Faturamento",money(revenue),{icon:"R$",foot:trend.text,trend:trend.className}),
    kpi("Receita influenciada",money(crmRevenue),{icon:"↗",foot:`${won.length} negociações ganhas`}),
    kpi("Pipeline aberto",money(pipelineValue()),{icon:"▥",foot:`Ponderado: ${money(weightedPipeline())}`}),
    kpi("Meta mensal",goal?money(goal):"Não definida",{icon:"◎",foot:goal?`${number(monthSales/goal*100,1)}% atingido`:"Configure no Controle de Meta"}),
    kpi("Contatos realizados",number(contactsInRange().length),{icon:"◌",foot:`Taxa de resposta: ${number(responseRate(),1)}%`}),
    kpi("Negociações abertas",number(openDeals().length),{icon:"◇",foot:`${openDeals().filter(d=>dateValue(d.proximaAcaoEm)<new Date()).length} atrasadas`}),
    kpi("Vendas concluídas",number(sales.length),{icon:"✓",foot:`Ticket médio: ${money(sales.length?revenue/sales.length:0)}`}),
    kpi("Conversão",`${number(opportunityConversion(),1)}%`,{icon:"↝",foot:"Ganhas ÷ oportunidades encerradas"})
  ].join("");
  let priorities=priorityItems(),filter=$("priorityFilter")?.value;if(filter)priorities=priorities.filter(p=>p.type===filter);
  $("prioritySummary").textContent=priorities.length?`${priorities.length} ações recomendadas, ordenadas por urgência e potencial.`:"Nenhuma prioridade corresponde ao filtro atual.";
  $("priorityList").innerHTML=priorities.length?priorities.slice(0,30).map(p=>`<article class="priority-row"><div class="priority-reason"><span class="priority-dot">${p.level==="alto"?"!":"•"}</span><div><strong>${esc(p.client.nome)}</strong><small>${esc(p.reason)} · ${esc(p.detail)}</small></div></div><div class="priority-meta"><small>Potencial</small><strong>${p.value?money(p.value):"Relacionamento"}</strong></div><div class="priority-meta"><small>Responsável</small><strong>${esc(sellerById(p.deal?.ownerUid||p.task?.ownerUid||p.client.ownerUid,p.client.ownerNome).name)}</strong></div><div class="priority-meta"><small>Prazo</small><strong>${formatDate(p.due,true)}</strong></div><div class="priority-actions"><button class="mini-btn" title="Entrar em contato" data-contact-client="${p.client.id}">◌</button>${!p.deal?`<button class="mini-btn" title="Criar negociação" data-new-deal-client="${p.client.id}">＋</button>`:""}<button class="mini-btn" title="Adiar para amanhã" data-defer-priority="${p.id}" data-client="${p.client.id}">→</button></div></article>`).join(""):emptyState("◎","Sem prioridades neste filtro","Importe clientes, conecte vendas, crie uma negociação ou uma campanha para começar a gerar recomendações.","new-deal","Criar primeira oportunidade");
  const open=openDeals(),max=Math.max(1,...STAGES.filter(s=>!s.closed).map(s=>open.filter(d=>d.etapa===s.id).reduce((a,d)=>a+Number(d.valor||0),0)));
  $("todayPipeline").innerHTML=`<div class="metric-list">${STAGES.filter(s=>!s.closed).map(s=>{const value=open.filter(d=>d.etapa===s.id).reduce((a,d)=>a+Number(d.valor||0),0);return `<div class="metric-line"><span>${esc(s.name)}</span><div class="bar-track"><div class="bar-fill" style="width:${value/max*100}%;background:${s.color}"></div></div><strong>${money(value)}</strong></div>`;}).join("")}</div>`;
  const tasks=visibleTasks().filter(t=>t.status!=="concluida").sort((a,b)=>(dateValue(a.prazo)||Infinity)-(dateValue(b.prazo)||Infinity)).slice(0,7);
  $("todayTasks").innerHTML=tasks.length?tasks.map(t=>`<div class="timeline-item"><strong>${esc(t.titulo)}</strong><p>${esc(clientById(t.clientId)?.nome||t.tipo||"Atividade")}</p><small>${formatDate(t.prazo,true)} · ${esc(sellerById(t.ownerUid,t.ownerNome).name)}</small></div>`).join(""):emptyState("□","Sem atividades pendentes","Crie uma tarefa com responsável e prazo para organizar a execução.","new-task","Criar atividade");
}

$("priorityFilter").addEventListener("change",renderToday);

function filterClients(){
  let list=visibleClients();const search=String($("clientSearch")?.value||"").trim().toLowerCase(),segmentId=$("clientSegmentFilter")?.value,risk=$("clientRiskFilter")?.value,owner=$("clientOwnerFilter")?.value,city=$("clientCityFilter")?.value,lastDays=$("clientLastPurchaseFilter")?.value,minSpent=parseMoney($("clientSpendMin")?.value),consent=$("clientConsentFilter")?.value;
  if(search)list=list.filter(c=>[c.nome,c.telefone,c.whatsapp,c.cpf,c.cnpj,c.documento,c.email].some(v=>String(v||"").toLowerCase().includes(search)));
  if(segmentId)list=segmentClients(segmentId,list);if(risk)list=list.filter(c=>clientRisk(c)===risk);if(owner)list=list.filter(c=>c.ownerUid===owner);if(city)list=list.filter(c=>String(c.cidade||"")===city);if(lastDays==="never")list=list.filter(c=>!lastPurchase(c));else if(lastDays)list=list.filter(c=>lastPurchase(c)&&daysSince(lastPurchase(c))<=Number(lastDays));if(minSpent)list=list.filter(c=>totalSpent(c)>=minSpent);if(consent==="whatsapp")list=list.filter(c=>c.consentWhatsapp&&!c.optOut);else if(consent==="optout")list=list.filter(c=>c.optOut);else if(consent==="missing")list=list.filter(c=>!c.optOut&&!c.consentWhatsapp&&!c.consentEmail&&!c.consentSms);
  return list.sort((a,b)=>(a.nome||"").localeCompare(b.nome||"","pt-BR"));
}
function savedClientViews(){try{return JSON.parse(localStorage.getItem(`ondis_crm_views_${state.storeId}`)||"[]");}catch{return [];}}
function currentClientFilterState(){return {search:$("clientSearch")?.value||"",segment:$("clientSegmentFilter")?.value||"",risk:$("clientRiskFilter")?.value||"",owner:$("clientOwnerFilter")?.value||"",city:$("clientCityFilter")?.value||"",last:$("clientLastPurchaseFilter")?.value||"",spent:$("clientSpendMin")?.value||"",consent:$("clientConsentFilter")?.value||""};}
function loadClientView(index){const view=savedClientViews()[Number(index)];if(!view)return;const map={clientSearch:view.filters.search,clientSegmentFilter:view.filters.segment,clientRiskFilter:view.filters.risk,clientOwnerFilter:view.filters.owner,clientCityFilter:view.filters.city,clientLastPurchaseFilter:view.filters.last,clientSpendMin:view.filters.spent,clientConsentFilter:view.filters.consent};Object.entries(map).forEach(([id,value])=>{if($(id))$(id).value=value||"";});renderClients();toast(`Visualização \"${view.name}\" aplicada.`);}
function saveClientView(){const name=prompt("Nome da visualização:","Minha carteira")?.trim();if(!name)return;const views=savedClientViews();views.push({name,filters:currentClientFilterState(),createdAt:isoNow()});localStorage.setItem(`ondis_crm_views_${state.storeId}`,JSON.stringify(views));toast("Visualização salva neste dispositivo.");$("clientAdvancedGroup")?.remove();$("advancedClientFilters").click();}
function nextClientTask(client){return clientTasks(client.id).filter(t=>t.status!=="concluida"&&dateValue(t.prazo)).sort((a,b)=>dateValue(a.prazo)-dateValue(b.prazo))[0];}
function consentSummary(client){if(client.optOut)return "Opt-out";const channels=[];if(client.consentWhatsapp)channels.push("WhatsApp");if(client.consentEmail)channels.push("E-mail");if(client.consentSms)channels.push("SMS");return channels.join(", ")||"Não registrado";}
function renderClients(){
  const clients=filterClients();
  $("clientRows").innerHTML=clients.map(c=>{const risk=clientRisk(c),lastBuy=lastPurchase(c),lastContact=lastClientActivity(c),next=nextClientTask(c),owner=sellerById(c.ownerUid,c.ownerNome);return `<tr><td><input type="checkbox" class="client-check" value="${c.id}" ${state.selectedClients.has(c.id)?"checked":""}></td><td><div class="client-cell"><span class="avatar">${initials(c.nome)}</span><div><strong>${esc(c.nome||"Sem nome")}</strong><small>${esc(c.telefone||c.whatsapp||c.email||"Sem contato")}</small></div></div></td><td>${formatDate(lastBuy)}</td><td>${formatDate(lastContact,true)}</td><td>${next?`<span class="badge ${dateValue(next.prazo)<new Date()?"danger":"info"}">${esc(next.titulo)} · ${formatDate(next.prazo)}</span>`:"—"}</td><td>${esc(owner.name)}</td><td><span class="badge info">${esc(segmentLabel(c))}</span></td><td><span class="badge ${risk==="alto"?"danger":risk==="medio"?"warning":"success"}">${risk==="alto"?"Alto":risk==="medio"?"Médio":"Baixo"}</span></td><td><strong>${money(totalSpent(c))}</strong></td><td><div class="row-actions"><button class="mini-btn" data-open-client="${c.id}" title="Abrir Cliente 360°">◉</button><button class="mini-btn" data-contact-client="${c.id}" title="WhatsApp">◌</button><button class="mini-btn" data-edit-client="${c.id}" title="Editar">✎</button><button class="mini-btn" data-new-deal-client="${c.id}" title="Nova negociação">＋</button></div></td></tr>`;}).join("");
  $("clientEmpty").innerHTML=clients.length?"":state.clients.length?emptyState("⌕","Nenhum resultado","Ajuste os filtros ou limpe a busca para encontrar clientes."):emptyState("◉","Nenhum cliente cadastrado","Os clientes antigos aparecerão aqui sem alteração. Você também pode cadastrar o primeiro cliente.","new-client","Cadastrar cliente");
  renderSelectionBar();
}
function renderSelectionBar(){const count=state.selectedClients.size;$("selectedClientCount").textContent=count;$("clientSelectionBar").classList.toggle("hidden",count===0);const shown=filterClients();$("selectAllClients").checked=shown.length>0&&shown.every(c=>state.selectedClients.has(c.id));$("selectAllClients").indeterminate=shown.some(c=>state.selectedClients.has(c.id))&&!shown.every(c=>state.selectedClients.has(c.id));}

function openClientForm(client=null){
  const form=$("clientForm");form.reset();form.elements.id.value=client?.id||"";$("clientDialogTitle").textContent=client?"Editar cliente":"Novo cliente";
  if(client){
    const values={tipo:client.tipo||"pf",nome:client.nome,nomeFantasia:client.nomeFantasia,documento:client.documento||client.cpf||client.cnpj,nascimento:client.nascimento,telefone:client.telefone,whatsapp:client.whatsapp,email:client.email,cep:client.cep,endereco:client.endereco,numero:client.numero,complemento:client.complemento,bairro:client.bairro,cidade:client.cidade,estado:client.estado,origem:client.origem||"Loja",ownerUid:client.ownerUid,marcas:(client.marcasPreferidas||[]).join(", "),interesses:(client.interesses||[]).join(", "),obs:client.obs};
    Object.entries(values).forEach(([name,value])=>{if(form.elements[name])form.elements[name].value=value||"";});
    ["consentWhatsapp","consentEmail","consentSms","optOut"].forEach(name=>form.elements[name].checked=!!client[name]);
  }else{form.elements.ownerUid.value=state.me.uid;}
  $("clientDialog").showModal();
}
async function saveClient(form){
  const data=Object.fromEntries(new FormData(form));const existing=clientById(data.id),id=data.id||uid("cli"),owner=sellerById(data.ownerUid);
  if(!data.nome.trim()||digits(data.telefone).length<10){toast("Informe nome e um telefone válido.","warning");return false;}
  const payload={id,tipo:data.tipo,nome:data.nome.trim(),nomeFantasia:data.nomeFantasia||"",documento:data.documento||"",telefone:data.telefone.trim(),whatsapp:data.whatsapp||"",email:data.email||"",nascimento:data.nascimento||"",cep:data.cep||"",endereco:data.endereco||"",numero:data.numero||"",complemento:data.complemento||"",bairro:data.bairro||"",cidade:data.cidade||"",estado:String(data.estado||"").toUpperCase(),origem:data.origem||"",ownerUid:data.ownerUid||"",ownerNome:owner.name||"",marcasPreferidas:String(data.marcas||"").split(",").map(v=>v.trim()).filter(Boolean),interesses:String(data.interesses||"").split(",").map(v=>v.trim()).filter(Boolean),obs:data.obs||"",consentWhatsapp:form.elements.consentWhatsapp.checked,consentEmail:form.elements.consentEmail.checked,consentSms:form.elements.consentSms.checked,optOut:form.elements.optOut.checked,consentUpdatedAt:isoNow(),criadoEm:existing?.criadoEm||isoNow(),atualizadoEm:isoNow()};
  showLoading("Salvando cliente…");const ok=await safeWrite("clients",id,payload,{merge:true,auditAction:existing?"cliente_alterado":"cliente_criado"});hideLoading();if(ok){toast("Cliente salvo com sucesso.");$("clientDialog").close();}return ok;
}
function clientTimeline(client){
  const events=[];
  clientPurchases(client).forEach(p=>events.push({date:p.ts||p.data,title:"Compra concluída",text:`${p.desc||"Compra"} · ${money(p.valor)}`}));
  (client.interacoes||[]).forEach(i=>events.push({date:i.ts||i.data,title:i.tipo||"Interação",text:i.texto||""}));
  clientDeals(client.id).forEach(d=>events.push({date:d.criadoEm,title:"Negociação criada",text:`${d.produto||"Oportunidade"} · ${money(d.valor)}`}));
  clientAttendances(client.id).forEach(a=>events.push({date:a.criadoEm,title:`Atendimento · ${a.canal||"Canal"}`,text:a.resumo||""}));
  clientSurveys(client.id).forEach(s=>events.push({date:s.criadoEm,title:`${s.tipo||"Avaliação"} · ${s.nota}/10`,text:s.comentario||""}));
  return events.filter(e=>dateValue(e.date)).sort((a,b)=>dateValue(b.date)-dateValue(a.date));
}
function clientDetailPanel(client,tab){
  if(tab==="compras"){const items=clientPurchases(client).slice().sort((a,b)=>(b.ts||0)-(a.ts||0));return items.length?`<div class="timeline">${items.map(p=>`<div class="timeline-item"><strong>${esc(p.desc||"Compra concluída")} · ${money(p.valor)}</strong><p>Venda concluída registrada no histórico do cliente.</p><small>${formatDate(p.ts||p.data,true)}</small></div>`).join("")}</div>`:emptyState("R$","Sem compras concluídas","O total gasto permanece zerado até existir uma venda concluída.");}
  if(tab==="negociacoes"){const items=clientDeals(client.id);return items.length?`<div class="timeline">${items.map(d=>`<div class="timeline-item"><strong>${esc(d.produto||"Negociação")} · ${money(d.valor)}</strong><p>${esc(stage(d.etapa).name)} · ${esc(sellerById(d.ownerUid,d.ownerNome).name)}</p><small>${formatDate(d.atualizadoEm||d.criadoEm,true)}</small></div>`).join("")}</div>`:emptyState("◇","Sem negociações","Crie uma oportunidade sem alterar o status geral do cliente.","new-deal","Criar negociação");}
  if(tab==="atendimentos"){const items=clientAttendances(client.id);return items.length?`<div class="timeline">${items.map(a=>`<div class="timeline-item"><strong>${esc(a.canal||"Atendimento")} · ${esc(a.status||"")}</strong><p>${esc(a.resumo||"")}</p><small>${formatDate(a.criadoEm,true)}</small></div>`).join("")}</div>`:emptyState("◌","Sem atendimentos","Registre ligações, visitas e conversas vinculadas a este cliente.","new-attendance","Registrar atendimento");}
  if(tab==="fidelidade"){const items=clientLoyalty(client.id),surveys=clientSurveys(client.id);return `<div class="info-grid"><div class="info-box"><small>Pontos</small><strong>${number(items.filter(i=>i.tipo==="pontos").reduce((s,i)=>s+Number(i.valor||0),0))}</strong></div><div class="info-box"><small>Cashback</small><strong>${money(items.filter(i=>i.tipo==="cashback").reduce((s,i)=>s+Number(i.valor||0),0))}</strong></div><div class="info-box"><small>Última avaliação</small><strong>${surveys.length?`${surveys.sort((a,b)=>dateValue(b.criadoEm)-dateValue(a.criadoEm))[0].nota}/10`:"—"}</strong></div></div>`;}
  if(tab==="timeline"){const events=clientTimeline(client);return events.length?`<div class="timeline">${events.map(e=>`<div class="timeline-item"><strong>${esc(e.title)}</strong><p>${esc(e.text)}</p><small>${formatDate(e.date,true)}</small></div>`).join("")}</div>`:emptyState("⌁","Linha do tempo vazia","Interações, compras, negociações e avaliações aparecerão aqui.");}
  const rf=rfv(client),risk=clientRisk(client),last=lastPurchase(client),first=firstPurchase(client),next=nextClientTask(client),purchases=clientPurchases(client);return `<div class="info-grid"><div class="info-box"><small>Telefone</small><strong>${esc(client.telefone||"—")}</strong></div><div class="info-box"><small>E-mail</small><strong>${esc(client.email||"—")}</strong></div><div class="info-box"><small>Localização</small><strong>${esc([client.cidade,client.estado].filter(Boolean).join(" / ")||"—")}</strong></div><div class="info-box"><small>Primeira compra</small><strong>${formatDate(first)}</strong></div><div class="info-box"><small>Última compra</small><strong>${formatDate(last)}</strong></div><div class="info-box"><small>Frequência</small><strong>${purchases.length} compra(s)</strong></div><div class="info-box"><small>RFV</small><strong>${rf.r}-${rf.f}-${rf.v} · ${esc(rf.label)}</strong></div><div class="info-box"><small>Risco de abandono</small><strong>${risk==="alto"?"Alto":risk==="medio"?"Médio":"Baixo"}</strong></div><div class="info-box"><small>Próxima ação</small><strong>${next?`${esc(next.titulo)} · ${formatDate(next.prazo)}`:"—"}</strong></div><div class="info-box"><small>Interesses</small><strong>${esc((client.interesses||[]).join(", ")||"—")}</strong></div><div class="info-box"><small>Marcas preferidas</small><strong>${esc((client.marcasPreferidas||[]).join(", ")||"—")}</strong></div><div class="info-box"><small>Consentimento</small><strong>${esc(consentSummary(client))}</strong></div></div>`;
}
function renderClient360(id){
  const client=clientById(id);if(!client)return;state.detailClient=id;const purchases=clientPurchases(client),total=totalSpent(client),ticket=purchases.length?total/purchases.length:0,rf=rfv(client),last=lastClientActivity(client);
  $("client360Content").innerHTML=`<header><div><span class="eyebrow">Cliente 360°</span><h2>${esc(client.nome||"Cliente")}</h2></div><button class="icon-btn" data-close-client360>×</button></header><div class="detail-summary"><div class="detail-hero"><span class="avatar">${initials(client.nome)}</span><div><h2>${esc(client.nome)}</h2><p>${esc(client.telefone||client.email||"Sem contato")} · ${esc(sellerById(client.ownerUid,client.ownerNome).name)}</p></div><div class="detail-actions"><button class="btn btn-ghost" data-contact-client="${client.id}">WhatsApp</button><button class="btn btn-ghost" data-edit-client="${client.id}">Editar</button><button class="btn btn-primary" data-new-deal-client="${client.id}">Nova negociação</button></div></div><div class="detail-kpis"><div class="detail-kpi"><small>Total gasto</small><strong>${money(total)}</strong></div><div class="detail-kpi"><small>Ticket médio</small><strong>${money(ticket)}</strong></div><div class="detail-kpi"><small>LTV anualizado</small><strong>${money(lifetimeValue(client))}</strong></div><div class="detail-kpi"><small>Score RFV</small><strong>${rf.score}/15 · ${esc(rf.label)}</strong></div><div class="detail-kpi"><small>Última interação</small><strong>${formatDate(last,true)}</strong></div></div><div class="detail-tabs">${[["resumo","Resumo"],["compras","Compras"],["negociacoes","Negociações"],["atendimentos","Conversas"],["fidelidade","Fidelidade e NPS"],["timeline","Linha do tempo"]].map(([id,label])=>`<button class="${state.clientDetailTab===id?"active":""}" data-client-tab="${id}">${label}</button>`).join("")}</div><div class="detail-panel">${clientDetailPanel(client,state.clientDetailTab)}</div></div>`;
}
function openClient360(id){state.clientDetailTab="resumo";renderClient360(id);$("client360Dialog").showModal();}

$("clientSearch").addEventListener("input",renderClients);["clientSegmentFilter","clientRiskFilter","clientOwnerFilter"].forEach(id=>$(id)?.addEventListener("change",renderClients));
$("advancedClientFilters").addEventListener("click",()=>{
  let extra=$("clientAdvancedGroup");if(extra){extra.classList.toggle("hidden");return;}
  extra=document.createElement("div");extra.id="clientAdvancedGroup";extra.className="toolbar multi-row";const cities=Array.from(new Set(visibleClients().map(c=>c.cidade).filter(Boolean))).sort((a,b)=>a.localeCompare(b,"pt-BR"));
  const views=savedClientViews();extra.innerHTML=`${views.length?`<select id="clientSavedView"><option value="">Visualizações salvas</option>${views.map((v,i)=>`<option value="${i}">${esc(v.name)}</option>`).join("")}</select>`:""}<select id="clientCityFilter"><option value="">Todas as cidades</option>${cities.map(c=>`<option>${esc(c)}</option>`).join("")}</select><select id="clientLastPurchaseFilter"><option value="">Qualquer última compra</option><option value="30">Comprou nos últimos 30 dias</option><option value="60">Comprou nos últimos 60 dias</option><option value="90">Comprou nos últimos 90 dias</option><option value="180">Comprou nos últimos 180 dias</option><option value="never">Nunca comprou</option></select><input id="clientSpendMin" placeholder="Total gasto mínimo"><select id="clientConsentFilter"><option value="">Qualquer consentimento</option><option value="whatsapp">Opt-in WhatsApp</option><option value="optout">Opt-out</option><option value="missing">Sem registro</option></select><button class="btn btn-ghost" data-action="save-client-view">Salvar visualização</button>`;
  $("clientSelectionBar").before(extra);["clientCityFilter","clientLastPurchaseFilter","clientConsentFilter"].forEach(id=>$(id).addEventListener("change",renderClients));$("clientSpendMin").addEventListener("input",renderClients);$("clientSavedView")?.addEventListener("change",event=>loadClientView(event.target.value));
});
$("selectAllClients").addEventListener("change",event=>{filterClients().forEach(c=>event.target.checked?state.selectedClients.add(c.id):state.selectedClients.delete(c.id));renderClients();});
$("clientRows").addEventListener("change",event=>{if(event.target.classList.contains("client-check")){event.target.checked?state.selectedClients.add(event.target.value):state.selectedClients.delete(event.target.value);renderSelectionBar();}});
$("clientForm").addEventListener("submit",async event=>{event.preventDefault();await saveClient(event.currentTarget);});

function renderSegments(){
  const base=visibleClients(),segments=allSegments();
  $("segmentGrid").innerHTML=segments.map(segment=>{const clients=base.filter(segment.test);return `<article class="segment-card"><header><div><h3>${esc(segment.name)}</h3><p>${esc(segment.description)}</p></div><span class="badge ${segment.custom?"warning":"info"}">${segment.custom?"Personalizado":"Automático"}</span></header><div class="segment-count">${number(clients.length)}</div><small>cliente(s) nesta visão</small><footer><button class="text-btn" data-use-segment="${segment.id}">Ver clientes</button><button class="text-btn" data-campaign-segment="${segment.id}">Criar campanha</button></footer></article>`;}).join("");
  const labels=["Campeões","Fiéis","Potenciais","Novos","Em risco"],counts=labels.map(label=>({label,count:base.filter(c=>rfv(c).label===label).length})),max=Math.max(1,...counts.map(x=>x.count));
  $("rfvDistribution").innerHTML=`<div class="metric-list">${counts.map(x=>`<div class="metric-line"><span>${x.label}</span><div class="bar-track"><div class="bar-fill" style="width:${x.count/max*100}%"></div></div><strong>${x.count}</strong></div>`).join("")}</div>`;
}
function previewCustomSegment(){
  const form=$("segmentForm"),data=Object.fromEntries(new FormData(form));if(!data.valor){$("segmentPreview").textContent="Preencha a condição para calcular o público.";return;}
  const temp={condition:{campo:data.campo,operador:data.operador,valor:data.valor}},count=visibleClients().filter(c=>customSegmentTest(temp,c)).length;
  $("segmentPreview").innerHTML=`<strong>${count} cliente(s)</strong> correspondem à condição atual.`;
}
async function saveSegment(form){
  const data=Object.fromEntries(new FormData(form));if(!data.nome.trim())return false;const id=uid("seg"),payload={id,nome:data.nome.trim(),conditions:[{campo:data.campo,operador:data.operador,valor:data.valor}],conector:data.conector,criadoPor:state.me.uid,criadoEm:isoNow(),atualizadoEm:isoNow()};
  showLoading("Salvando segmento…");const ok=await safeWrite("segments",id,payload,{merge:false,auditAction:"segmento_criado"});hideLoading();if(ok){$("segmentDialog").close();toast("Segmento salvo e pronto para campanhas.");}return ok;
}
$("segmentForm").addEventListener("input",previewCustomSegment);$("segmentForm").addEventListener("submit",async event=>{event.preventDefault();await saveSegment(event.currentTarget);});

function attendanceStatus(attendance){if(attendance.status!=="concluida"&&attendance.proximaAcaoEm&&dateValue(attendance.proximaAcaoEm)<new Date())return "atrasada";return attendance.status||"nova";}
function renderAttendances(){
  let list=visibleAttendances().slice().sort((a,b)=>dateValue(b.ultimaMensagemEm||b.atualizadoEm||b.criadoEm)-dateValue(a.ultimaMensagemEm||a.atualizadoEm||a.criadoEm));if(state.attendanceStatus)list=list.filter(a=>attendanceStatus(a)===state.attendanceStatus);
  if(state.selectedAttendance&&!list.some(a=>a.id===state.selectedAttendance))state.selectedAttendance=null;if(!state.selectedAttendance&&list.length)state.selectedAttendance=list[0].id;
  $("attendanceList").innerHTML=list.length?list.map(a=>{const client=clientById(a.clientId);return `<article class="inbox-item ${a.id===state.selectedAttendance?"active":""}" data-attendance="${a.id}"><header><strong>${esc(client?.nome||"Cliente não encontrado")}</strong><span class="badge ${attendanceStatus(a)==="atrasada"?"danger":"info"}">${esc(attendanceStatus(a).replaceAll("_"," "))}</span></header><p>${esc(a.resumo||"Sem resumo")}</p><small>${esc(a.canal||"Canal")} · ${formatDate(a.ultimaMensagemEm||a.atualizadoEm||a.criadoEm,true)}</small></article>`;}).join(""):emptyState("◌","Nenhum atendimento","Registre contatos reais ou abra o WhatsApp a partir de um cliente.","new-attendance","Registrar atendimento");
  renderAttendanceDetail();
}
function renderAttendanceDetail(){
  const a=state.attendances.find(x=>x.id===state.selectedAttendance);if(!a){$("attendanceDetail").innerHTML=emptyState("◌","Selecione um atendimento","Os detalhes e ações da conversa aparecerão aqui.");return;}const client=clientById(a.clientId),events=(a.historico||[]).slice().sort((x,y)=>dateValue(y.criadoEm)-dateValue(x.criadoEm));
  $("attendanceDetail").innerHTML=`<div class="inbox-detail-head"><div><div class="client-cell"><span class="avatar">${initials(client?.nome)}</span><div><strong>${esc(client?.nome||"Cliente")}</strong><small>${esc(a.canal||"")} · ${esc(sellerById(a.ownerUid,a.ownerNome).name)}</small></div></div></div><div class="row-actions"><button class="btn btn-ghost" data-contact-client="${client?.id||""}">Responder</button><button class="btn btn-ghost" data-new-deal-client="${client?.id||""}" data-campaign-id="${esc(a.campanhaId||"")}">Criar negociação</button><button class="btn btn-primary" data-complete-attendance="${a.id}">Concluir</button></div></div><div class="info-grid" style="margin-top:14px"><div class="info-box"><small>Produto</small><strong>${esc(a.produto||"—")}</strong></div><div class="info-box"><small>Próxima ação</small><strong>${formatDate(a.proximaAcaoEm,true)}</strong></div><div class="info-box"><small>Status</small><strong>${esc(attendanceStatus(a).replaceAll("_"," "))}</strong></div></div><div class="timeline"><div class="timeline-item"><strong>Resumo atual</strong><p>${esc(a.resumo||"")}</p><small>${formatDate(a.atualizadoEm||a.criadoEm,true)}</small></div>${events.map(e=>`<div class="timeline-item"><strong>${esc(e.tipo||"Registro")}</strong><p>${esc(e.texto||"")}</p><small>${formatDate(e.criadoEm,true)} · ${esc(e.quem||"")}</small></div>`).join("")}</div>`;
}
async function saveAttendance(form){
  const data=Object.fromEntries(new FormData(form)),client=clientById(data.clientId),owner=sellerById(data.ownerUid);if(!client||!data.resumo.trim()){toast("Selecione o cliente e descreva o atendimento.","warning");return false;}const id=uid("atd"),payload={id,clientId:data.clientId,canal:data.canal,ownerUid:data.ownerUid||state.me.uid,ownerNome:owner.name||state.me.name,status:data.status,produto:data.produto||"",resumo:data.resumo.trim(),proximaAcaoEm:data.proximaAcaoEm||"",ultimaMensagemEm:isoNow(),tempoRespostaMin:null,historico:[{tipo:"Atendimento registrado",texto:data.resumo.trim(),quem:state.me.name||state.me.email,criadoEm:isoNow()}],criadoEm:isoNow(),atualizadoEm:isoNow()};
  showLoading("Salvando atendimento…");const ok=await safeWrite("attendances",id,payload,{merge:false,auditAction:"atendimento_criado"});hideLoading();if(ok){$("attendanceDialog").close();toast("Atendimento registrado.");if(data.proximaAcaoEm)await createTask({clientId:data.clientId,titulo:`Retorno: ${data.resumo.slice(0,60)}`,tipo:"Retorno",ownerUid:payload.ownerUid,prazo:data.proximaAcaoEm,prioridade:"media",descricao:`Criado pelo atendimento ${id}`},false);}return ok;
}
$("attendanceTabs").addEventListener("click",event=>{const button=event.target.closest("button[data-status]");if(!button)return;qsa("button",$("attendanceTabs")).forEach(b=>b.classList.toggle("active",b===button));state.attendanceStatus=button.dataset.status;renderAttendances();});
$("attendanceList").addEventListener("click",event=>{const item=event.target.closest("[data-attendance]");if(item){state.selectedAttendance=item.dataset.attendance;renderAttendances();}});
$("attendanceForm").addEventListener("submit",async event=>{event.preventDefault();await saveAttendance(event.currentTarget);});

function taskStatus(task){if(task.status==="concluida")return "concluida";return dateValue(task.prazo)<new Date()?"atrasada":"pendente";}
function agendaRangeTest(task){const d=dateValue(task.prazo);if(!d)return state.agendaRange==="all";const start=new Date();start.setHours(0,0,0,0),end=new Date(start);if(state.agendaRange==="today")end.setHours(23,59,59,999);else if(state.agendaRange==="week")end.setDate(end.getDate()+7);else if(state.agendaRange==="month")end=new Date(start.getFullYear(),start.getMonth()+1,0,23,59,59,999);else return true;return d>=start&&d<=end;}
function renderAgenda(){
  const status=$("agendaStatus")?.value;let list=visibleTasks().filter(agendaRangeTest);if(status)list=list.filter(t=>taskStatus(t)===status);list.sort((a,b)=>(dateValue(a.prazo)||Infinity)-(dateValue(b.prazo)||Infinity));
  $("agendaList").innerHTML=list.length?list.map(t=>{const client=clientById(t.clientId),ts=taskStatus(t);return `<article class="task-card ${ts==="atrasada"?"overdue":""} ${ts==="concluida"?"completed":""}"><header><h3>${esc(t.titulo)}</h3><span class="badge ${ts==="atrasada"?"danger":ts==="concluida"?"success":"info"}">${ts}</span></header><p>${esc(t.descricao||client?.nome||t.tipo||"")}</p><footer><small>${formatDate(t.prazo,true)} · ${esc(sellerById(t.ownerUid,t.ownerNome).name)}</small><button class="mini-btn" data-toggle-task="${t.id}" title="${ts==="concluida"?"Reabrir":"Concluir"}">${ts==="concluida"?"↶":"✓"}</button>${client?`<button class="mini-btn" data-contact-client="${client.id}" title="Contato">◌</button>`:""}</footer></article>`;}).join(""):emptyState("□","Agenda sem atividades","Crie atividades com responsável, prazo, prioridade e cliente relacionado.","new-task","Criar atividade");
}
async function createTask(data,notify=true){
  const id=data.id||uid("task"),owner=sellerById(data.ownerUid);const payload={id,tipo:data.tipo||"Tarefa",titulo:data.titulo||"Atividade",clientId:data.clientId||"",dealId:data.dealId||"",ownerUid:data.ownerUid||state.me.uid,ownerNome:data.ownerNome||owner.name||state.me.name,prioridade:data.prioridade||"media",prazo:data.prazo,status:data.status||"pendente",descricao:data.descricao||"",origem:data.origem||"manual",criadoPor:state.me.uid,criadoEm:data.criadoEm||isoNow(),atualizadoEm:isoNow()};const ok=await safeWrite("tasks",id,payload,{merge:true,auditAction:"atividade_criada"});if(ok&&notify)toast("Atividade criada.");return ok;
}
async function saveTask(form){const data=Object.fromEntries(new FormData(form));data.dealId=form.dataset.dealId||"";if(!data.titulo.trim()||!data.prazo){toast("Informe título e prazo.","warning");return false;}showLoading("Salvando atividade…");const ok=await createTask(data,false);hideLoading();if(ok){form.dataset.dealId="";$("taskDialog").close();toast("Atividade salva na agenda.");}return ok;}
$("agendaTabs").addEventListener("click",event=>{const button=event.target.closest("button[data-range]");if(!button)return;qsa("button",$("agendaTabs")).forEach(b=>b.classList.toggle("active",b===button));state.agendaRange=button.dataset.range;renderAgenda();});$("agendaStatus").addEventListener("change",renderAgenda);$("taskForm").addEventListener("submit",async event=>{event.preventDefault();await saveTask(event.currentTarget);});

function filterDeals(){let list=visibleDeals(),origin=$("dealOriginFilter")?.value,min=Number($("dealValueFilter")?.value||0),close=$("dealCloseFilter")?.value;if(origin)list=list.filter(d=>d.origem===origin);if(min)list=list.filter(d=>Number(d.valor||0)>=min);if(close)list=list.filter(d=>d.previsao&&d.previsao<=close);return list;}
function averageCloseDays(won=closedWonDeals()){if(!won.length)return 0;return won.reduce((s,d)=>s+Math.max(0,daysBetween(d.criadoEm,d.fechadoEm||d.atualizadoEm)),0)/won.length;}
function daysBetween(a,b){const d1=dateValue(a),d2=dateValue(b);return d1&&d2?Math.max(0,(d2-d1)/86400000):0;}
function renderPipeline(){
  const deals=filterDeals(),open=deals.filter(d=>!stage(d.etapa).closed),won=deals.filter(d=>d.etapa==="ganha"&&inRange(d.fechadoEm||d.atualizadoEm)),lost=deals.filter(d=>d.etapa==="perdida"&&inRange(d.fechadoEm||d.atualizadoEm)),considered=won.length+lost.length;
  $("pipelineKpis").innerHTML=[kpi("Pipeline",money(open.reduce((s,d)=>s+Number(d.valor||0),0)),{icon:"▥"}),kpi("Previsão ponderada",money(open.reduce((s,d)=>s+Number(d.valor||0)*(Number(d.probabilidade??stage(d.etapa).prob)/100),0)),{icon:"↝"}),kpi("Tempo médio de fechamento",`${number(averageCloseDays(),1)} dias`,{icon:"◷"}),kpi("Conversão",`${number(considered?won.length/considered*100:0,1)}%`,{icon:"✓"})].join("");
  $("dealKanban").innerHTML=STAGES.map(s=>{const cards=deals.filter(d=>d.etapa===s.id).sort((a,b)=>Number(b.valor||0)-Number(a.valor||0)),total=cards.reduce((sum,d)=>sum+Number(d.valor||0),0);return `<section class="kanban-column" data-stage-drop="${s.id}"><div class="kanban-head"><strong><span style="color:${s.color}">●</span> ${esc(s.name)}</strong><span>${cards.length} · ${money(total)}</span></div>${cards.map(d=>dealCard(d)).join("")}</section>`;}).join("");
}
function dealCard(deal){const client=clientById(deal.clientId),overdue=!stage(deal.etapa).closed&&deal.proximaAcaoEm&&dateValue(deal.proximaAcaoEm)<new Date();return `<article class="deal-card ${overdue?"overdue":""}" draggable="true" data-deal="${deal.id}"><h4>${esc(client?.nome||"Cliente não encontrado")}</h4><p>${esc(deal.produto||"Sem produto informado")}</p><strong class="deal-value">${money(deal.valor)}</strong><div class="deal-meta"><span>${number(deal.probabilidade??stage(deal.etapa).prob)}% prob.</span><span>${esc(deal.origem||"Sem origem")}</span></div><footer><small>${overdue?"Atrasada · ":""}${deal.proximaAcaoEm?formatDate(deal.proximaAcaoEm):"Sem próxima ação"}</small><button class="mini-btn" data-edit-deal="${deal.id}" title="Editar">✎</button>${!stage(deal.etapa).closed?`<button class="mini-btn" data-new-task-deal="${deal.id}" title="Agendar">□</button>`:""}</footer></article>`;}
function openDealForm(clientId="",deal=null,forceStage="",campaignId=""){
  const form=$("dealForm");form.reset();form.dataset.campaignId=deal?.campanhaId||campaignId||"";$("dealDialogTitle").textContent=deal?"Editar negociação":forceStage==="orcamento"?"Novo orçamento":"Nova negociação";form.elements.id.value=deal?.id||"";
  const values={clientId:deal?.clientId||clientId,produto:deal?.produto,valor:deal?Number(deal.valor||0).toLocaleString("pt-BR",{minimumFractionDigits:2}):"",etapa:forceStage||deal?.etapa||"novo",origem:deal?.origem||"Loja",ownerUid:deal?.ownerUid||clientById(clientId)?.ownerUid||state.me.uid,previsao:deal?.previsao,probabilidade:deal?.probabilidade??stage(forceStage||deal?.etapa||"novo").prob,proximaAcao:deal?.proximaAcao,proximaAcaoEm:toLocalInput(deal?.proximaAcaoEm),obs:deal?.obs};Object.entries(values).forEach(([name,value])=>{if(form.elements[name])form.elements[name].value=value??"";});$("dealDialog").showModal();
}
async function saveDeal(form){
  const data=Object.fromEntries(new FormData(form)),client=clientById(data.clientId),existing=dealById(data.id),id=data.id||uid("neg"),value=parseMoney(data.valor),owner=sellerById(data.ownerUid,client?.ownerNome);if(!client||!data.produto.trim()||value<=0){toast("Selecione o cliente, informe o interesse e um valor válido.","warning");return false;}
  let lossReason=existing?.motivoPerda||"",closedAt=existing?.fechadoEm||"";
  if(data.etapa==="perdida"&&existing?.etapa!=="perdida"){lossReason=prompt(`Motivo da perda:\n${LOSS_REASONS.join(" · ")}`,"Sem resposta")||"";if(!lossReason.trim()){toast("O motivo da perda é obrigatório.","warning");return false;}if(!LOSS_REASONS.some(r=>lossReason.toLowerCase().startsWith(r.toLowerCase())))lossReason=`Outro: ${lossReason}`;closedAt=isoNow();}
  if(data.etapa==="ganha"&&existing?.etapa!=="ganha"){if(!confirm("Confirmar esta negociação como venda ganha? O valor será contabilizado como receita influenciada pelo CRM."))return false;closedAt=isoNow();}
  const payload={id,clientId:data.clientId,clienteNome:client.nome,produto:data.produto.trim(),valor:value,etapa:data.etapa,origem:data.origem,ownerUid:data.ownerUid||state.me.uid,ownerNome:owner.name||state.me.name,previsao:data.previsao||"",probabilidade:Number(data.probabilidade||stage(data.etapa).prob),proximaAcao:data.proximaAcao||"",proximaAcaoEm:data.proximaAcaoEm||"",obs:data.obs||"",motivoPerda:lossReason,fechadoEm:closedAt,campanhaId:existing?.campanhaId||form.dataset.campaignId||"",criadoEm:existing?.criadoEm||isoNow(),atualizadoEm:isoNow(),etapaAlteradaEm:existing?.etapa!==data.etapa?isoNow():(existing?.etapaAlteradaEm||existing?.criadoEm||isoNow())};
  showLoading("Salvando negociação…");const ok=await safeWrite("deals",id,payload,{merge:true,auditAction:existing?"negociacao_alterada":"negociacao_criada"});hideLoading();if(ok){form.dataset.campaignId="";$("dealDialog").close();toast("Negociação salva.");}return ok;
}
async function moveDeal(id,newStage){
  const deal=dealById(id);if(!deal||deal.etapa===newStage)return;if(stage(newStage).closed){openDealForm("",{...deal,etapa:newStage});return;}
  const ok=await safeWrite("deals",id,{etapa:newStage,probabilidade:stage(newStage).prob,etapaAlteradaEm:isoNow(),atualizadoEm:isoNow()},{merge:true,auditAction:"negociacao_etapa_alterada"});if(ok)toast(`Negociação movida para ${stage(newStage).name}.`);
}
let draggedDeal="";
$("dealKanban").addEventListener("dragstart",event=>{const card=event.target.closest("[data-deal]");if(card){draggedDeal=card.dataset.deal;event.dataTransfer.effectAllowed="move";}});
$("dealKanban").addEventListener("dragover",event=>{const col=event.target.closest("[data-stage-drop]");if(col){event.preventDefault();col.classList.add("dragover");}});
$("dealKanban").addEventListener("dragleave",event=>event.target.closest("[data-stage-drop]")?.classList.remove("dragover"));
$("dealKanban").addEventListener("drop",async event=>{const col=event.target.closest("[data-stage-drop]");if(!col)return;event.preventDefault();col.classList.remove("dragover");await moveDeal(draggedDeal,col.dataset.stageDrop);draggedDeal="";});
["dealOriginFilter","dealValueFilter","dealCloseFilter"].forEach(id=>$(id).addEventListener("change",renderPipeline));
$("dealForm").addEventListener("submit",async event=>{event.preventDefault();await saveDeal(event.currentTarget);});
$("dealStageSelect").addEventListener("change",event=>{const form=$("dealForm");if(!form.elements.id.value||form.elements.probabilidade.value==stage(form.elements.etapa.dataset.previous||"novo").prob)form.elements.probabilidade.value=stage(event.target.value).prob;event.target.dataset.previous=event.target.value;});

function renderQuotes(){
  const quotes=visibleDeals().filter(d=>d.etapa==="orcamento"||d.orcamento).sort((a,b)=>dateValue(b.atualizadoEm)-dateValue(a.atualizadoEm));
  $("quoteRows").innerHTML=quotes.map(d=>{const c=clientById(d.clientId),valid=d.orcamentoValidade||d.previsao,status=d.etapa==="orcamento"?(valid&&dateValue(valid)<new Date()?"Vencido":"Em aberto"):stage(d.etapa).name;return `<tr><td><div class="client-cell"><span class="avatar">${initials(c?.nome)}</span><strong>${esc(c?.nome||"Cliente")}</strong></div></td><td>${esc(d.produto||"—")}</td><td><strong>${money(d.valor)}</strong></td><td>${formatDate(d.orcamentoEnviadoEm||d.etapaAlteradaEm)}</td><td>${formatDate(valid)}</td><td>${esc(sellerById(d.ownerUid,d.ownerNome).name)}</td><td><span class="badge ${status==="Vencido"?"danger":"warning"}">${esc(status)}</span></td><td><div class="row-actions"><button class="mini-btn" data-edit-deal="${d.id}">✎</button><button class="mini-btn" data-contact-client="${d.clientId}">◌</button><button class="mini-btn" data-move-deal="${d.id}" data-stage="ganha">✓</button></div></td></tr>`;}).join("");$("quoteEmpty").innerHTML=quotes.length?"":emptyState("▤","Nenhum orçamento","Crie um orçamento vinculado a cliente, responsável e oportunidade.","new-quote","Criar orçamento");
}
function aggregateBy(list,keyFn,valueFn=()=>1){const map=new Map();list.forEach(item=>{const key=keyFn(item)||"Não informado";map.set(key,(map.get(key)||0)+valueFn(item));});return Array.from(map,([label,value])=>({label,value})).sort((a,b)=>b.value-a.value);}
function rankingHtml(rows,{moneyValues=false}={}){const max=Math.max(1,...rows.map(r=>r.value));return rows.length?`<div class="metric-list">${rows.slice(0,12).map(r=>`<div class="metric-line"><span>${esc(r.label)}</span><div class="bar-track"><div class="bar-fill" style="width:${r.value/max*100}%"></div></div><strong>${moneyValues?money(r.value):number(r.value)}</strong></div>`).join("")}</div>`:emptyState("⌁","Sem dados para analisar","Cadastre interesses ou negociações para formar este ranking.");}
function renderProducts(){
  const deals=visibleDeals(),interests=[...deals.map(d=>({name:d.produto,value:Number(d.valor||0),origin:d.origem})),...visibleClients().flatMap(c=>(c.interesses||[]).map(name=>({name,value:0,origin:c.origem})))],byInterest=aggregateBy(interests,i=>i.name),byOrigin=aggregateBy(deals,d=>d.origem,d=>Number(d.valor||0));
  $("productKpis").innerHTML=[kpi("Interesses registrados",number(interests.length),{icon:"⌁"}),kpi("Produtos distintos",number(new Set(interests.map(i=>i.name).filter(Boolean)).size),{icon:"◇"}),kpi("Valor em oportunidades",money(deals.filter(d=>!stage(d.etapa).closed).reduce((s,d)=>s+Number(d.valor||0),0)),{icon:"R$"}),kpi("Sem produto informado",number(deals.filter(d=>!d.produto).length),{icon:"!"})].join("");$("interestRanking").innerHTML=rankingHtml(byInterest);$("originRanking").innerHTML=rankingHtml(byOrigin,{moneyValues:true});
}

function campaignAudience(form=$("campaignForm")){
  const data=Object.fromEntries(new FormData(form)),selectedIds=JSON.parse(form.dataset.recipientIds||"[]"),base=selectedIds.length?visibleClients().filter(c=>selectedIds.includes(c.id)):segmentClients(data.segmentId||"todos"),excludedTags=String(data.excluirTags||"").split(",").map(v=>v.trim().toLowerCase()).filter(Boolean),seenPhones=new Set();let duplicates=0,noConsent=0,frequencyExcluded=0;
  const eligible=base.filter(client=>{
    const phone=contactPhone(client);if(!phone||seenPhones.has(phone)){if(phone)duplicates++;return false;}seenPhones.add(phone);
    if(client.optOut||!client.consentWhatsapp){noConsent++;return false;}
    if(excludedTags.some(tag=>(client.tags||[]).map(v=>String(v).toLowerCase()).includes(tag)))return false;
    if(data.frequencia!=="once"){
      const days=Number(data.frequencia),recent=state.campaigns.some(c=>(c.recipientIds||[]).includes(client.id)&&daysSince(c.agendadaEm||c.criadoEm)<days);if(recent){frequencyExcluded++;return false;}
    }
    return true;
  });
  return {base,eligible,duplicates,noConsent,frequencyExcluded,data};
}
function campaignMessagePreview(){
  const form=$("campaignForm"),data=Object.fromEntries(new FormData(form)),sample=campaignAudience(form).base[0],text=String(data.mensagem||"").replaceAll("{nome}",firstName(sample?.nome)).replaceAll("{vendedor}",state.me?.name||"").replaceAll("{loja}",state.store.name||state.store.code||"").replaceAll("{produto}",sample?.interesses?.[0]||"produto").replaceAll("{beneficio}","benefício");$("campaignPreview").textContent=text||"Sua mensagem aparecerá aqui.";renderCampaignReview();
}
function renderCampaignReview(){const a=campaignAudience();$("campaignReview").innerHTML=[['Público selecionado',a.base.length],['Elegíveis',a.eligible.length],['Sem consentimento',a.noConsent],['Duplicidades',a.duplicates],['Frequência',a.frequencyExcluded],['Estimativa de envios',a.eligible.length],['Custo estimado','Não informado'],['Canal','WhatsApp manual']].map(([label,value])=>`<div class="review-item"><small>${label}</small><strong>${value}</strong></div>`).join("");}
function openCampaignForm(segmentId="todos",recipientIds=[]){$("campaignForm").reset();$("campaignForm").dataset.recipientIds=JSON.stringify(recipientIds);$("campaignSegmentSelect").disabled=recipientIds.length>0;$("campaignSegmentSelect").value=segmentId||"todos";$("campaignDialogTitle").textContent=recipientIds.length?`Campanha para ${recipientIds.length} selecionado(s)`:"Nova campanha";campaignMessagePreview();$("campaignDialog").showModal();}
async function saveCampaign(form){
  const audience=campaignAudience(form),data=audience.data;if(!data.nome.trim()||!data.mensagem.trim()){toast("Informe nome e mensagem da campanha.","warning");return false;}if(!audience.eligible.length){toast("Nenhum cliente elegível após consentimento, duplicidade e exclusões.","warning");return false;}
  const schedule=data.agendadaEm||"";if(!confirm(`Revisar campanha \"${data.nome}\" com ${audience.eligible.length} cliente(s) elegível(is)?\n\nO ONDIS não enviará automaticamente: no canal manual, cada WhatsApp precisa ser aberto e confirmado por uma pessoa.`))return false;
  const selectedIds=JSON.parse(form.dataset.recipientIds||"[]"),id=uid("camp"),payload={id,nome:data.nome.trim(),segmentId:selectedIds.length?"selecao_manual":data.segmentId,segmentName:selectedIds.length?"Seleção manual":(allSegments().find(s=>s.id===data.segmentId)?.name||"Todos"),canal:data.canal,mensagem:data.mensagem.trim(),mensagemB:data.mensagemB||"",abTest:!!data.mensagemB.trim(),frequencia:data.frequencia,excluirTags:String(data.excluirTags||"").split(",").map(v=>v.trim()).filter(Boolean),agendadaEm:schedule,status:schedule?"agendada":"revisada",recipientIds:audience.eligible.map(c=>c.id),publicoTotal:audience.base.length,elegiveis:audience.eligible.length,semConsentimento:audience.noConsent,duplicidades:audience.duplicates,enviosManuais:[],criadoPor:state.me.uid,criadoEm:isoNow(),atualizadoEm:isoNow()};
  showLoading("Salvando campanha…");const ok=await safeWrite("campaigns",id,payload,{merge:false,auditAction:"campanha_criada"});hideLoading();if(ok){$("campaignDialog").close();toast("Campanha revisada e salva. Nenhum envio automático foi realizado.");}return ok;
}
function campaignRevenue(campaign){return state.deals.filter(d=>d.campanhaId===campaign.id&&d.etapa==="ganha").reduce((s,d)=>s+Number(d.valor||0),0);}
function renderCampaigns(){
  const campaigns=state.campaigns.slice().sort((a,b)=>dateValue(b.criadoEm)-dateValue(a.criadoEm)),deals=state.deals.filter(d=>d.campanhaId);
  $("campaignKpis").innerHTML=[kpi("Campanhas",number(campaigns.length),{icon:"◈"}),kpi("Agendadas",number(campaigns.filter(c=>c.status==="agendada").length),{icon:"□"}),kpi("Negociações criadas",number(deals.length),{icon:"◇"}),kpi("Receita influenciada",money(campaigns.reduce((s,c)=>s+campaignRevenue(c),0)),{icon:"R$"})].join("");
  $("campaignRows").innerHTML=campaigns.map(c=>`<tr><td><strong>${esc(c.nome)}</strong><br><small>${esc(c.canal||"")}</small></td><td>${esc(c.segmentName||c.segmentId||"Todos")}</td><td>${number(c.elegiveis||c.recipientIds?.length||0)}</td><td>${c.agendadaEm?formatDate(c.agendadaEm,true):"Revisão manual"}</td><td><span class="badge ${c.status==="agendada"?"warning":c.status==="cancelada"?"danger":"info"}">${esc(c.status||"rascunho")}</span></td><td>${number(state.deals.filter(d=>d.campanhaId===c.id).length)}</td><td>${money(campaignRevenue(c))}</td><td><div class="row-actions">${!["cancelada","concluida"].includes(c.status)?`<button class="mini-btn" data-send-campaign="${c.id}" title="Abrir próximo WhatsApp">◌</button><button class="mini-btn" data-pause-campaign="${c.id}" title="${c.status==="pausada"?"Retomar":"Pausar"}">${c.status==="pausada"?"▶":"Ⅱ"}</button><button class="mini-btn" data-cancel-campaign="${c.id}" title="Cancelar">×</button>`:""}</div></td></tr>`).join("");$("campaignEmpty").innerHTML=campaigns.length?"":emptyState("◈","Nenhuma campanha","Crie uma campanha com público, consentimento e revisão antes de qualquer contato.","new-campaign","Criar campanha");
}
async function sendNextCampaign(campaignId){
  const campaign=state.campaigns.find(c=>c.id===campaignId);if(!campaign)return;if(campaign.status==="pausada"){toast("Retome a campanha antes de abrir novos contatos.","warning");return;}const sent=new Set(campaign.enviosManuais||[]),client=(campaign.recipientIds||[]).map(clientById).find(c=>c&&!sent.has(c.id));if(!client){toast("Todos os destinatários elegíveis já foram abertos para envio manual.","warning");return;}const url=whatsappUrl(client,String(campaign.mensagem||"").replaceAll("{nome}",firstName(client.nome)).replaceAll("{vendedor}",state.me.name||"").replaceAll("{loja}",state.store.name||state.store.code||"").replaceAll("{produto}",client.interesses?.[0]||"produto").replaceAll("{beneficio}","benefício"));if(!url){toast("Cliente sem WhatsApp válido.","warning");return;}window.open(url,"_blank","noopener");sent.add(client.id);await safeWrite("campaigns",campaign.id,{enviosManuais:Array.from(sent),status:"em_execucao",atualizadoEm:isoNow()},{merge:true,auditAction:"campanha_whatsapp_aberto"});const attendanceId=uid("atd");await safeWrite("attendances",attendanceId,{id:attendanceId,clientId:client.id,canal:"WhatsApp",ownerUid:state.me.uid,ownerNome:state.me.name,status:"aguardando_cliente",produto:"",resumo:`Mensagem manual preparada pela campanha ${campaign.nome}.`,campanhaId:campaign.id,ultimaMensagemEm:isoNow(),criadoEm:isoNow(),atualizadoEm:isoNow()},{merge:false});toast(`WhatsApp de ${client.nome} aberto. O sistema não presume entrega ou leitura.`);}
$("campaignForm").addEventListener("input",campaignMessagePreview);$("campaignForm").addEventListener("change",campaignMessagePreview);$("campaignForm").addEventListener("submit",async event=>{event.preventDefault();await saveCampaign(event.currentTarget);});

const JOURNEY_DESCRIPTIONS={"Boas-vindas":"Inicia após o cadastro e cria a primeira ação de relacionamento.","Aniversário":"Prepara contato no aniversário com consentimento preservado.","Pós-venda":"Cria acompanhamento após venda concluída.","Recuperação de orçamento":"Retoma orçamentos sem avanço.","Cliente inativo":"Recupera clientes fora da frequência habitual.","Produto reservado":"Lembra o responsável sobre a reserva.","Cashback vencendo":"Prioriza benefícios próximos do vencimento.","NPS negativo":"Escala avaliações negativas para recuperação.","Recompra":"Identifica a janela provável de recompra.","Nova coleção":"Organiza contatos por interesse e consentimento.","Cliente VIP":"Cria tratamento diferenciado para clientes de alto valor."};
function journeyEligible(journey){
  const clients=visibleClients();switch(journey.gatilho){case"aniversario":return clients.filter(c=>{const d=dateValue(c.nascimento),n=new Date();return d&&d.getDate()===n.getDate()&&d.getMonth()===n.getMonth();});case"venda_concluida":return clients.filter(c=>lastPurchase(c)&&daysSince(lastPurchase(c))<=Number(journey.esperaDias||1));case"orcamento_parado":return clients.filter(c=>clientDeals(c.id).some(d=>d.etapa==="orcamento"&&daysSince(d.etapaAlteradaEm||d.atualizadoEm)>=Number(journey.esperaDias||3)));case"inatividade":return clients.filter(c=>lastPurchase(c)&&daysSince(lastPurchase(c))>=Math.max(30,Number(journey.esperaDias||60)));case"nps_negativo":return clients.filter(c=>clientSurveys(c.id).some(s=>Number(s.nota)<=6&&daysSince(s.criadoEm)<=30));default:return clients.filter(c=>daysSince(c.criadoEm)<=Number(journey.esperaDias||1));}}
function renderJourneys(){
  const templates=Object.keys(JOURNEY_DESCRIPTIONS),saved=state.journeys;const cards=saved.length?saved:templates.map((name,index)=>({id:`template_${index}`,nome:name,modelo:name,status:"modelo",gatilho:"",isTemplate:true}));
  $("journeyGrid").innerHTML=cards.map(j=>`<article class="journey-card"><header><div><h3>${esc(j.nome||j.modelo)}</h3><p>${esc(JOURNEY_DESCRIPTIONS[j.modelo]||`${j.gatilho||"Gatilho"} · ${j.acao||"Ação"}`)}</p></div><span class="badge ${j.status==="ativa"?"success":j.status==="pausada"?"warning":"info"}">${esc(j.status||"rascunho")}</span></header>${!j.isTemplate?`<div class="info-grid"><div class="info-box"><small>Elegíveis agora</small><strong>${journeyEligible(j).length}</strong></div><div class="info-box"><small>Objetivo</small><strong>${esc(j.objetivo||"—")}</strong></div></div>`:""}<footer>${j.isTemplate?`<button class="text-btn" data-journey-template="${esc(j.modelo)}">Usar modelo</button>`:`<button class="text-btn" data-toggle-journey="${j.id}">${j.status==="ativa"?"Pausar":"Ativar"}</button><button class="text-btn" data-run-journey="${j.id}">Executar agora</button>`}</footer></article>`).join("");
}
async function saveJourney(form){const data=Object.fromEntries(new FormData(form));if(!data.nome.trim())return false;const id=uid("jor"),payload={id,nome:data.nome.trim(),modelo:data.modelo,status:data.status,gatilho:data.gatilho,esperaDias:Number(data.esperaDias||0),acao:data.acao,objetivo:data.objetivo,criadoPor:state.me.uid,criadoEm:isoNow(),atualizadoEm:isoNow()};showLoading("Salvando jornada…");const ok=await safeWrite("journeys",id,payload,{merge:false,auditAction:"jornada_criada"});hideLoading();if(ok){$("journeyDialog").close();toast("Jornada salva. Nenhuma mensagem foi enviada automaticamente.");}return ok;}
async function runJourney(id){
  const journey=state.journeys.find(j=>j.id===id);if(!journey||journey.status!=="ativa"){toast("Ative a jornada antes de executar.","warning");return;}const eligible=journeyEligible(journey).filter(c=>!c.optOut),date=dateKey(new Date());if(!eligible.length){toast("Nenhum cliente elegível para esta execução.","warning");return;}if(!confirm(`Executar \"${journey.nome}\" para ${eligible.length} cliente(s)?\n\nSerão criadas tarefas. Nenhuma mensagem será enviada automaticamente.`))return;showLoading("Criando tarefas da jornada…");let created=0;
  for(const client of eligible){
    if(journey.objetivo==="compra"&&lastPurchase(client)&&daysSince(lastPurchase(client))<Number(journey.esperaDias||1))continue;
    const taskId=`jr_${journey.id}_${client.id}_${date}`,existing=state.tasks.some(t=>t.id===taskId);if(existing)continue;
    const due=new Date();due.setDate(due.getDate()+Number(journey.esperaDias||0));await createTask({id:taskId,clientId:client.id,titulo:`${journey.nome}: ${client.nome}`,tipo:journey.acao==="whatsapp_manual"?"WhatsApp":"Tarefa",ownerUid:client.ownerUid||state.me.uid,prazo:toLocalInput(due),prioridade:journey.modelo==="NPS negativo"?"alta":"media",descricao:"Criada por jornada. Interromper se o objetivo for atingido.",origem:`jornada:${journey.id}`},false);created++;
  }hideLoading();await audit("jornada_executada","crm_jornadas",journey.id,{elegiveis:eligible.length,tarefasCriadas:created});toast(`${created} tarefa(s) criada(s). Duplicidades da mesma execução foram ignoradas.`);
}
$("journeyTemplate").addEventListener("change",event=>{const form=$("journeyForm");form.elements.nome.value=event.target.value;});$("journeyForm").addEventListener("submit",async event=>{event.preventDefault();await saveJourney(event.currentTarget);});

function loyaltyBalance(clientId,type){return state.loyalty.filter(l=>l.clientId===clientId&&l.tipo===type).reduce((s,l)=>s+Number(l.valor||0),0);}
function renderLoyalty(){
  const members=visibleClients().filter(c=>clientLoyalty(c.id).length),cashback=state.loyalty.filter(l=>l.tipo==="cashback").reduce((s,l)=>s+Number(l.valor||0),0),points=state.loyalty.filter(l=>l.tipo==="pontos").reduce((s,l)=>s+Number(l.valor||0),0),surveys=state.surveys,avg=surveys.length?surveys.reduce((s,v)=>s+Number(v.nota||0),0)/surveys.length:0;
  $("loyaltyKpis").innerHTML=[kpi("Clientes no programa",number(members.length),{icon:"☆"}),kpi("Pontos em saldo",number(points),{icon:"◎"}),kpi("Cashback registrado",money(cashback),{icon:"R$"}),kpi("Nota média",surveys.length?`${number(avg,1)}/10`:"Sem avaliações",{icon:"◉"})].join("");
  $("loyaltyClients").innerHTML=members.length?members.slice(0,30).map(c=>`<div class="priority-row" style="grid-template-columns:1fr auto auto"><div class="client-cell"><span class="avatar">${initials(c.nome)}</span><div><strong>${esc(c.nome)}</strong><small>${esc(segmentLabel(c))}</small></div></div><span class="badge info">${number(loyaltyBalance(c.id,"pontos"))} pontos</span><strong>${money(loyaltyBalance(c.id,"cashback"))}</strong></div>`).join(""):emptyState("☆","Programa sem movimentações","Registre pontos, cashback, cupons ou indicações sem criar saldos fictícios.","new-loyalty","Registrar movimentação");
  $("surveyList").innerHTML=surveys.length?surveys.slice().sort((a,b)=>dateValue(b.criadoEm)-dateValue(a.criadoEm)).slice(0,20).map(s=>{const c=clientById(s.clientId);return `<div class="timeline-item"><strong>${esc(c?.nome||"Cliente")} · ${esc(s.tipo||"NPS")} ${s.nota}/10</strong><p>${esc(s.comentario||"Sem comentário")}</p><small>${formatDate(s.criadoEm,true)} · ${esc(s.canal||"")}</small></div>`;}).join(""):emptyState("◉","Sem avaliações","Registre NPS ou CSAT. Notas negativas criarão prioridade para recuperação.");
}
async function saveLoyalty(form){const data=Object.fromEntries(new FormData(form)),value=parseMoney(data.valor);if(!clientById(data.clientId)||!Number.isFinite(value)||value===0){toast("Selecione o cliente e informe um valor válido.","warning");return false;}const id=uid("fid"),payload={id,clientId:data.clientId,tipo:data.tipo,valor:value,validade:data.validade||"",descricao:data.descricao||"",criadoPor:state.me.uid,criadoEm:isoNow()};showLoading("Salvando movimentação…");const ok=await safeWrite("loyalty",id,payload,{merge:false,auditAction:"fidelidade_movimentada"});hideLoading();if(ok){$("loyaltyDialog").close();toast("Movimentação registrada.");}return ok;}
async function saveSurvey(form){const data=Object.fromEntries(new FormData(form)),score=Number(data.nota);if(!clientById(data.clientId)||!Number.isFinite(score)||score<0||score>10){toast("Informe cliente e nota entre 0 e 10.","warning");return false;}const id=uid("nps"),payload={id,clientId:data.clientId,tipo:data.tipo,nota:score,canal:data.canal,comentario:data.comentario||"",criadoPor:state.me.uid,criadoEm:isoNow()};showLoading("Salvando avaliação…");const ok=await safeWrite("surveys",id,payload,{merge:false,auditAction:"avaliacao_registrada"});if(ok&&score<=6){const client=clientById(data.clientId),manager=state.sellers.find(s=>["manager","gerente","admin"].includes(s.role))||sellerById(client.ownerUid,client.ownerNome);const due=new Date();due.setDate(due.getDate()+1);await createTask({clientId:client.id,titulo:`Recuperar cliente insatisfeito: ${client.nome}`,tipo:"Recuperação",ownerUid:manager.id||client.ownerUid||state.me.uid,prazo:toLocalInput(due),prioridade:"alta",descricao:`${data.tipo} ${score}/10. ${data.comentario||"Sem comentário."}`,origem:`pesquisa:${id}`},false);}hideLoading();if(ok){$("surveyDialog").close();toast(score<=6?"Avaliação salva e prioridade de recuperação criada.":"Avaliação salva.");}return ok;}
$("loyaltyForm").addEventListener("submit",async event=>{event.preventDefault();await saveLoyalty(event.currentTarget);});$("surveyForm").addEventListener("submit",async event=>{event.preventDefault();await saveSurvey(event.currentTarget);});

function repeatRate(){const buyers=visibleClients().filter(c=>clientPurchases(c).length),repeat=buyers.filter(c=>clientPurchases(c).length>=2);return buyers.length?repeat.length/buyers.length*100:0;}
function averageLtv(){const buyers=visibleClients().filter(c=>clientPurchases(c).length);return buyers.length?buyers.reduce((s,c)=>s+lifetimeValue(c),0)/buyers.length:0;}
function clientForRecord(record){const direct=clientById(record.clientId);if(direct)return direct;const phone=digits(record.clientPhone||record.telefone);if(phone){const found=state.clients.find(c=>digits(c.telefone||c.whatsapp)===phone);if(found)return found;}const name=String(record.clientName||"").trim().toLowerCase();return name?state.clients.find(c=>String(c.nome||"").trim().toLowerCase()===name):null;}
function metricContext(range=getRange()){
  const segmentId=$("metricSegmentFilter")?.value,campaignId=$("metricCampaignFilter")?.value,channel=$("metricChannelFilter")?.value,product=$("metricProductFilter")?.value,origin=$("metricOriginFilter")?.value;
  let clients=segmentId?segmentClients(segmentId):visibleClients(),clientIds=new Set(clients.map(c=>c.id));
  let deals=visibleDeals().filter(d=>clientIds.has(d.clientId));if(campaignId)deals=deals.filter(d=>d.campanhaId===campaignId);if(product)deals=deals.filter(d=>d.produto===product);if(origin)deals=deals.filter(d=>d.origem===origin);
  if(campaignId||product||origin){const dealClients=new Set(deals.map(d=>d.clientId));clients=clients.filter(c=>dealClients.has(c.id));clientIds=new Set(clients.map(c=>c.id));}
  let attendances=visibleAttendances().filter(a=>clientIds.has(a.clientId));if(channel)attendances=attendances.filter(a=>a.canal===channel);if(channel){const contactClients=new Set(attendances.map(a=>a.clientId));clients=clients.filter(c=>contactClients.has(c.id));clientIds=new Set(clients.map(c=>c.id));deals=deals.filter(d=>clientIds.has(d.clientId));}
  const specific=!!(segmentId||campaignId||channel||product||origin);let sales=saleRecords(range);if(specific)sales=sales.filter(r=>{const c=clientForRecord(r);return c&&clientIds.has(c.id);});
  return {clients,deals,attendances,sales,specific};
}
function conversionFor(deals,range=getRange()){const considered=deals.filter(d=>stage(d.etapa).closed&&inRange(d.fechadoEm||d.atualizadoEm,range));return considered.length?considered.filter(d=>d.etapa==="ganha").length/considered.length*100:0;}
function renderRevenueChart(sales=saleRecords()){
  const range=getRange(),span=Math.max(1,Math.ceil((range.end-range.start)/86400000)+1),bucketSize=span>45?7:1,buckets=[];
  for(let cursor=new Date(range.start);cursor<=range.end;cursor.setDate(cursor.getDate()+bucketSize)){const start=new Date(cursor),end=new Date(cursor);end.setDate(end.getDate()+bucketSize-1);end.setHours(23,59,59,999);const value=sales.filter(r=>{const d=dateValue(recordDate(r));return d>=start&&d<=end;}).reduce((s,r)=>s+Number(r.value||0),0);buckets.push({label:start.toLocaleDateString("pt-BR",{day:"2-digit",month:"2-digit"}),value});}
  const max=Math.max(1,...buckets.map(b=>b.value));$("revenueChart").innerHTML=buckets.map(b=>`<div class="chart-col"><div class="chart-bar" style="height:${Math.max(2,b.value/max*155)}px" data-value="${money(b.value)}"></div><small>${b.label}</small></div>`).join("");
}
function renderMetrics(){
  const ctx=metricContext(),sales=ctx.sales,revenue=sales.reduce((s,r)=>s+Number(r.value||0),0),won=ctx.deals.filter(d=>d.etapa==="ganha"&&inRange(d.fechadoEm||d.atualizadoEm)),crmRevenue=won.reduce((s,d)=>s+Number(d.valor||0),0),open=ctx.deals.filter(d=>!stage(d.etapa).closed),buyers=ctx.clients.filter(c=>clientPurchases(c).length),newClients=ctx.clients.filter(c=>inRange(c.criadoEm)),recurring=buyers.filter(c=>clientPurchases(c).length>=2),contacts=ctx.attendances.filter(a=>inRange(a.criadoEm||a.atualizadoEm)),answered=contacts.filter(a=>["aguardando_vendedor","agendada","concluida"].includes(a.status)),ltv=buyers.length?buyers.reduce((s,c)=>s+lifetimeValue(c),0)/buyers.length:0,repurchase=buyers.length?recurring.length/buyers.length*100:0,recovered=won.filter(d=>/recuper|inativ|reativa/i.test(`${d.origem||""} ${state.campaigns.find(c=>c.id===d.campanhaId)?.segmentName||""}`)).reduce((s,d)=>s+Number(d.valor||0),0);
  $("metricKpis").innerHTML=[
    kpi("Faturamento",money(revenue),{icon:"R$",foot:ctx.specific?"Somente vendas com cliente identificável no filtro":"Somente registros com resultado vendido"}),
    kpi("Receita influenciada",money(crmRevenue),{icon:"↗",foot:"Negociações CRM ganhas"}),
    kpi("Receita recuperada",money(recovered),{icon:"↻",foot:"Ganhas por recuperação ou inatividade"}),
    kpi("Pipeline aberto",money(open.reduce((s,d)=>s+Number(d.valor||0),0)),{icon:"▥"}),
    kpi("Previsão de vendas",money(open.reduce((s,d)=>s+Number(d.valor||0)*(Number(d.probabilidade??stage(d.etapa).prob)/100),0)),{icon:"◇"}),
    kpi("Conversão",`${number(conversionFor(ctx.deals),1)}%`,{icon:"↝"}),
    kpi("Ticket médio",money(sales.length?revenue/sales.length:0),{icon:"◎"}),
    kpi("LTV médio",money(ltv),{icon:"∞"}),
    kpi("Taxa de recompra",`${number(repurchase,1)}%`,{icon:"↻"}),
    kpi("Clientes novos",number(newClients.length),{icon:"＋",foot:`${recurring.length} recorrentes na base filtrada`}),
    kpi("Tempo de fechamento",`${number(averageCloseDays(won),1)} dias`,{icon:"◷"}),
    kpi("Taxa de resposta",`${number(contacts.length?answered.length/contacts.length*100:0,1)}%`,{icon:"◌",foot:`${contacts.length} contatos`})
  ].join("");
  renderRevenueChart(sales);
  const stageRows=STAGES.map(s=>({label:s.name,value:ctx.deals.filter(d=>d.etapa===s.id&&inRange(d.atualizadoEm||d.criadoEm)).length}));$("conversionChart").innerHTML=rankingHtml(stageRows);
  const losses=ctx.deals.filter(d=>d.etapa==="perdida"&&inRange(d.fechadoEm||d.atualizadoEm)),lossRows=aggregateBy(losses,d=>d.motivoPerda||"Não informado");$("lossReasons").innerHTML=rankingHtml(lossRows);
  const prevCtx=metricContext(previousRange()),prevSales=prevCtx.sales,prevRevenue=prevSales.reduce((s,r)=>s+Number(r.value||0),0),prevWon=prevCtx.deals.filter(d=>d.etapa==="ganha"&&inRange(d.fechadoEm||d.atualizadoEm,previousRange())).length,currentMetrics=[{label:"Faturamento",current:revenue,previous:prevRevenue,format:money},{label:"Vendas",current:sales.length,previous:prevSales.length,format:number},{label:"Negociações ganhas",current:won.length,previous:prevWon,format:number}];
  $("periodComparison").innerHTML=`<div class="metric-list">${currentMetrics.map(m=>{const change=percentChange(m.current,m.previous);return `<div class="metric-line"><span>${m.label}</span><div class="bar-track"><div class="bar-fill" style="width:${Math.min(100,Math.abs(change))}%"></div></div><strong class="${change>0?"trend-up":change<0?"trend-down":""}">${m.format(m.current)} · ${change>=0?"+":""}${number(change,1)}%</strong></div>`;}).join("")}</div>`;
}
[
  "metricCampaignFilter","metricSegmentFilter","metricChannelFilter","metricProductFilter","metricOriginFilter"
].forEach(id=>$(id)?.addEventListener("change",renderMetrics));

function sellerSales(sellerId,range=getRange()){return state.records.filter(r=>r.outcome==="sold"&&r.sellerId===sellerId&&inRange(recordDate(r),range));}
function renderTeam(){
  const sellers=state.sellers.filter(s=>s.active!==false),clients=visibleClients(),deals=visibleDeals(),tasks=visibleTasks();
  $("teamRows").innerHTML=sellers.map(s=>{const sc=clients.filter(c=>c.ownerUid===s.id),sd=deals.filter(d=>d.ownerUid===s.id),open=sd.filter(d=>!stage(d.etapa).closed),closed=sd.filter(d=>stage(d.etapa).closed&&inRange(d.fechadoEm||d.atualizadoEm)),won=closed.filter(d=>d.etapa==="ganha"),late=tasks.filter(t=>t.ownerUid===s.id&&taskStatus(t)==="atrasada"),contacts=state.attendances.filter(a=>a.ownerUid===s.id&&inRange(a.criadoEm||a.atualizadoEm)),sales=sellerSales(s.id),revenue=sales.reduce((sum,r)=>sum+Number(r.value||0),0);return `<tr><td><div class="client-cell"><span class="avatar">${initials(s.name)}</span><strong>${esc(s.name)}</strong></div></td><td>${sc.length}</td><td>${open.length}</td><td><span class="badge ${late.length?"danger":"success"}">${late.length}</span></td><td>${contacts.length}</td><td>${number(closed.length?won.length/closed.length*100:0,1)}%</td><td>${money(open.reduce((sum,d)=>sum+Number(d.valor||0),0))}</td><td><strong>${money(revenue)}</strong></td><td><button class="text-btn" data-transfer-owner="${s.id}">Transferir carteira</button></td></tr>`;}).join("");$("teamEmpty").innerHTML=sellers.length?"":emptyState("♙","Nenhum vendedor encontrado","Cadastre vendedores no ONDIS para acompanhar carteiras e performance.");
}

function integrationStatus(name){const integrations=state.store.integrations||state.store.crmIntegrations||{};const item=integrations[name]||{};return item.connected===true||item.active===true;}
function legacyDealsToMigrate(){return state.clients.filter(c=>["lead","negociacao"].includes(c.etapa)&&!state.deals.some(d=>d.legacyClientId===c.id||d.id===`legacy_${c.id}`));}
function renderIntegrations(){
  const items=[
    {id:"vendas",name:"Vendas ONDIS",icon:"R$",connected:state.records.length>0||!!state.appState,description:"Registros concluídos alimentam o faturamento sem contar leads."},
    {id:"whatsapp",name:"WhatsApp",icon:"◌",connected:integrationStatus("whatsapp"),description:integrationStatus("whatsapp")?"Configuração oficial encontrada na loja.":"Abertura manual preservada; entrega, leitura e resposta não são presumidas."},
    {id:"email",name:"E-mail",icon:"@",connected:integrationStatus("email"),description:"Canal disponível somente quando houver credenciais válidas."},
    {id:"catalogo",name:"Catálogo ONDIS",icon:"▤",connected:true,description:"Acesso ao catálogo existente para apoiar atendimentos."},
    {id:"liga",name:"Liga ONDIS",icon:"☆",connected:!!state.appState,description:"Metas e vendedores são lidos da operação existente, sem duplicação."},
    {id:"legacy",name:"Funil legado",icon:"⇄",connected:legacyDealsToMigrate().length===0,description:legacyDealsToMigrate().length?`${legacyDealsToMigrate().length} cliente(s) com etapa antiga aguardam migração segura.`:"Nenhuma oportunidade legada pendente."}
  ];
  $("integrationGrid").innerHTML=items.map(i=>`<article class="integration-card"><header><span class="integration-icon">${i.icon}</span><span class="integration-status ${i.connected?"connected":"disconnected"}">${i.connected?"CONECTADO":"NÃO CONFIGURADO"}</span></header><h3>${esc(i.name)}</h3><p>${esc(i.description)}</p><footer>${i.id==="legacy"&&legacyDealsToMigrate().length?`<button class="text-btn" data-migrate-legacy>Migrar agora</button>`:i.id==="catalogo"?`<button class="text-btn" data-open-catalog>Abrir catálogo</button>`:`<span></span>`}</footer></article>`).join("");
}
async function migrateLegacyDeals(){
  if(!canManage()){toast("A migração exige perfil de gerente ou administrador.","error");return;}const clients=legacyDealsToMigrate();if(!clients.length){toast("Nenhum dado legado precisa de migração.");return;}if(!confirm(`Criar ${clients.length} oportunidade(s) a partir das etapas antigas?\n\nOs clientes originais não serão alterados nem excluídos.`))return;showLoading("Migrando funil legado com segurança…");let created=0;
  try{for(let offset=0;offset<clients.length;offset+=400){const batch=writeBatch(db),slice=clients.slice(offset,offset+400);slice.forEach(client=>{const id=`legacy_${client.id}`,mapped=client.etapa==="negociacao"?"negociacao":"novo";batch.set(documentRef("deals",id),{id,legacyClientId:client.id,clientId:client.id,clienteNome:client.nome||"",produto:(client.interesses||[])[0]||"Oportunidade migrada",valor:0,etapa:mapped,origem:"CRM Simplificado",ownerUid:client.ownerUid||"",ownerNome:client.ownerNome||"",probabilidade:stage(mapped).prob,proximaAcao:"Revisar oportunidade migrada",proximaAcaoEm:"",obs:"Criada por migração não destrutiva. Valor mantido em zero até revisão humana.",criadoEm:client.criadoEm||isoNow(),atualizadoEm:isoNow(),etapaAlteradaEm:isoNow()},{merge:false});});await batch.commit();created+=slice.length;}await audit("migracao_funil_legado","crm_negociacoes","",{criados:created});toast(`${created} oportunidade(s) migrada(s). Os clientes antigos foram preservados.`);}catch(error){console.error(error);toast(errorMessage(error),"error");}hideLoading();
}

function renderUsers(){
  const users=state.users;$("userRows").innerHTML=users.map(u=>`<tr><td><div class="client-cell"><span class="avatar">${initials(u.name||u.email)}</span><strong>${esc(u.name||"Sem nome")}</strong></div></td><td>${esc(u.email||"—")}</td><td><span class="badge info">${esc(normalizeRole(u.role))}</span></td><td>${esc(state.store.name||state.store.code||state.storeId)}</td><td><span class="badge ${u.active===false?"danger":"success"}">${u.active===false?"Inativo":"Ativo"}</span></td></tr>`).join("");$("userEmpty").innerHTML=users.length?"":state.errors.users?`<div class="error-box">${esc(errorMessage(state.errors.users))}</div>`:emptyState("♧","Nenhum usuário encontrado","Os usuários autorizados para esta loja aparecerão aqui.");
}
function renderLgpd(){
  const clients=visibleClients(),optOut=clients.filter(c=>c.optOut),wa=clients.filter(c=>c.consentWhatsapp&&!c.optOut),without=clients.filter(c=>!c.optOut&&!c.consentWhatsapp&&!c.consentEmail&&!c.consentSms);
  $("lgpdKpis").innerHTML=[kpi("Opt-in WhatsApp",number(wa.length),{icon:"✓"}),kpi("Opt-out",number(optOut.length),{icon:"×"}),kpi("Sem registro",number(without.length),{icon:"!"}),kpi("Eventos auditados",number(state.audit.length),{icon:"⌾"})].join("");
  $("consentList").innerHTML=clients.length?clients.slice().sort((a,b)=>String(a.nome).localeCompare(String(b.nome),"pt-BR")).slice(0,50).map(c=>`<div class="priority-row" style="grid-template-columns:1fr auto"><div class="client-cell"><span class="avatar">${initials(c.nome)}</span><div><strong>${esc(c.nome)}</strong><small>Atualizado em ${formatDate(c.consentUpdatedAt||c.atualizadoEm,true)}</small></div></div><span class="badge ${c.optOut?"danger":c.consentWhatsapp?"success":"warning"}">${esc(consentSummary(c))}</span></div>`).join(""):emptyState("⌾","Sem clientes","Os consentimentos aparecerão após o cadastro dos clientes.");
  const logs=state.audit.slice().sort((a,b)=>dateValue(b.createdAt)-dateValue(a.createdAt)).slice(0,50);$("auditList").innerHTML=logs.length?`<div class="timeline">${logs.map(l=>`<div class="timeline-item"><strong>${esc(String(l.action||"ação").replaceAll("_"," "))}</strong><p>${esc(l.targetType||"")} ${l.targetId?`· ${esc(l.targetId)}`:""}</p><small>${formatDate(l.createdAt,true)} · ${esc(l.userName||"")}</small></div>`).join("")}</div>`:emptyState("⌾","Auditoria vazia","Transferências, alterações, campanhas, exportações e consentimentos serão registrados aqui.");
}

const SUPER_PROMPTS=[
  ["prioridades","Quem minha equipe deve chamar hoje?"],["risco","Quais negociações estão em risco?"],
  ["inativos","Crie uma campanha para clientes inativos."],["recompra","Quais clientes têm maior chance de recompra?"],
  ["conversao","Por que a conversão caiu?"],["desempenho","Resuma o desempenho da loja."],["tarefas","Quais vendedores estão com tarefas atrasadas?"]
];
function openSuper(){$("superDrawer").classList.add("open");$("drawerBackdrop").classList.add("show");$("superDrawer").setAttribute("aria-hidden","false");renderSuperPrompts();}
function closeSuper(){$("superDrawer").classList.remove("open");$("drawerBackdrop").classList.remove("show");$("superDrawer").setAttribute("aria-hidden","true");}
function renderSuperPrompts(){$("superPrompts").innerHTML=SUPER_PROMPTS.map(([id,label])=>`<button data-super-prompt="${id}">${esc(label)}</button>`).join("");}
function superAnswer(type){
  let title="Análise",html="";
  if(type==="prioridades"){const items=priorityItems().slice(0,8);title="Prioridades recomendadas";html=items.length?`<p>Ordenei por urgência e potencial com base em tarefas, negociações, compras e avaliações.</p><ul>${items.map(i=>`<li><strong>${esc(i.client.nome)}</strong>: ${esc(i.reason)}${i.value?` (${money(i.value)})`:""}.</li>`).join("")}</ul>`:`<p>Não há prioridades calculáveis com os dados atuais. Crie atividades ou negociações para o CRM orientar a próxima ação.</p>`;}
  else if(type==="risco"){const deals=openDeals().filter(d=>!d.proximaAcaoEm||dateValue(d.proximaAcaoEm)<new Date()||daysSince(d.etapaAlteradaEm||d.atualizadoEm)>=7).sort((a,b)=>Number(b.valor||0)-Number(a.valor||0));title="Negociações em risco";html=deals.length?`<p>${deals.length} negociação(ões) exigem revisão.</p><ul>${deals.slice(0,10).map(d=>`<li><strong>${esc(clientById(d.clientId)?.nome||"Cliente")}</strong>: ${money(d.valor)} · ${!d.proximaAcaoEm?"sem próxima ação":dateValue(d.proximaAcaoEm)<new Date()?"ação atrasada":"parada na etapa"}.</li>`).join("")}</ul>`:`<p>Nenhuma negociação aberta apresenta atraso ou ausência de próxima ação.</p>`;}
  else if(type==="inativos"){const segment=BUILTIN_SEGMENTS.find(s=>s.id==="inativos_60"),count=visibleClients().filter(segment.test).filter(c=>c.consentWhatsapp&&!c.optOut).length;title="Campanha para inativos";html=`<p>Encontrei <strong>${count}</strong> cliente(s) inativo(s) há 60 dias ou mais com consentimento para WhatsApp.</p><p>Posso abrir o construtor usando esse segmento. A campanha passará por revisão humana e não será enviada automaticamente.</p><button class="btn btn-primary" data-campaign-segment="inativos_60">Revisar campanha</button>`;}
  else if(type==="recompra"){const clients=segmentClients("recompra").sort((a,b)=>rfv(b).score-rfv(a).score).slice(0,10);title="Maior chance de recompra";html=clients.length?`<p>A seleção considera recorrência, RFV e janela desde a última compra.</p><ul>${clients.map(c=>`<li><strong>${esc(c.nome)}</strong>: RFV ${rfv(c).score}/15 · última compra há ${daysSince(lastPurchase(c))} dias.</li>`).join("")}</ul>`:`<p>A base ainda não possui histórico suficiente para indicar recompra sem inventar informação.</p>`;}
  else if(type==="conversao"){const current=opportunityConversion(),rangePrev=previousRange(),closedPrev=visibleDeals().filter(d=>stage(d.etapa).closed&&inRange(d.fechadoEm||d.atualizadoEm,rangePrev)),prev=closedPrev.length?closedPrev.filter(d=>d.etapa==="ganha").length/closedPrev.length*100:0,losses=aggregateBy(visibleDeals().filter(d=>d.etapa==="perdida"&&inRange(d.fechadoEm||d.atualizadoEm)),d=>d.motivoPerda||"Não informado");title="Diagnóstico de conversão";html=`<p>A conversão atual é <strong>${number(current,1)}%</strong>; no período anterior, <strong>${number(prev,1)}%</strong>.</p>${losses.length?`<p>Principal motivo de perda: <strong>${esc(losses[0].label)}</strong> (${losses[0].value}).</p>`:`<p>Não há perdas suficientes registradas para explicar uma variação com segurança.</p>`}`;}
  else if(type==="tarefas"){const late=visibleTasks().filter(t=>taskStatus(t)==="atrasada"),rows=aggregateBy(late,t=>sellerById(t.ownerUid,t.ownerNome).name);title="Tarefas atrasadas por vendedor";html=rows.length?`<ul>${rows.map(r=>`<li><strong>${esc(r.label)}</strong>: ${r.value} tarefa(s) atrasada(s).</li>`).join("")}</ul>`:`<p>Nenhuma tarefa atrasada foi encontrada na visão autorizada.</p>`;}
  else{const sales=saleRecords(),revenue=sales.reduce((s,r)=>s+Number(r.value||0),0);title="Resumo da loja";html=`<ul><li>Faturamento concluído: <strong>${money(revenue)}</strong> em ${sales.length} venda(s).</li><li>Pipeline aberto: <strong>${money(pipelineValue())}</strong>.</li><li>Conversão de oportunidades encerradas: <strong>${number(opportunityConversion(),1)}%</strong>.</li><li>Contatos registrados: <strong>${contactsInRange().length}</strong>.</li><li>Prioridades atuais: <strong>${priorityItems().length}</strong>.</li></ul><p>Os valores respeitam o período e o vendedor selecionados.</p>`;}
  $("superAnswer").innerHTML=`<h3>${title}</h3>${html}`;
}
$("openSuper").addEventListener("click",openSuper);$("closeSuper").addEventListener("click",closeSuper);$("drawerBackdrop").addEventListener("click",closeSuper);$("superPrompts").addEventListener("click",event=>{const button=event.target.closest("[data-super-prompt]");if(button)superAnswer(button.dataset.superPrompt);});

function csvDownload(filename,rows){const csv=rows.map(row=>row.map(value=>`"${String(value??"").replaceAll('"','""')}"`).join(";")).join("\n"),blob=new Blob(["\ufeff",csv],{type:"text/csv;charset=utf-8"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
async function exportClients(){const clients=state.selectedClients.size?visibleClients().filter(c=>state.selectedClients.has(c.id)):filterClients();csvDownload(`clientes_crm_${dateKey(new Date())}.csv`,[["Nome","Telefone","E-mail","Cidade","Responsável","Segmento","Risco","Total gasto","Última compra","Consentimento"],...clients.map(c=>[c.nome,c.telefone,c.email,c.cidade,sellerById(c.ownerUid,c.ownerNome).name,segmentLabel(c),clientRisk(c),totalSpent(c),formatDate(lastPurchase(c)),consentSummary(c)])]);await audit("clientes_exportados","clientes","",{quantidade:clients.length});toast(`${clients.length} cliente(s) exportado(s).`);}
async function exportMetrics(){const sales=saleRecords(),revenue=sales.reduce((s,r)=>s+Number(r.value||0),0);csvDownload(`metricas_crm_${dateKey(new Date())}.csv`,[["Indicador","Valor"],["Faturamento",revenue],["Vendas concluídas",sales.length],["Pipeline aberto",pipelineValue()],["Previsão ponderada",weightedPipeline()],["Conversão (%)",opportunityConversion()],["Ticket médio",sales.length?revenue/sales.length:0],["LTV médio",averageLtv()],["Taxa de recompra (%)",repeatRate()],["Contatos",contactsInRange().length]]);await audit("metricas_exportadas","relatorio","",{periodo:getRange()});}
async function exportAudit(){const logs=state.audit;csvDownload(`auditoria_crm_${dateKey(new Date())}.csv`,[["Data","Ação","Usuário","Perfil","Tipo","Alvo"],...logs.map(l=>[formatDate(l.createdAt,true),l.action,l.userName,l.userRole,l.targetType,l.targetId])]);await audit("auditoria_exportada","crm_auditoria","",{quantidade:logs.length});}

function openTransfer(ids,ownerFrom=""){const selected=ids?.length?ids:(ownerFrom?visibleClients().filter(c=>c.ownerUid===ownerFrom).map(c=>c.id):Array.from(state.selectedClients));if(!selected.length){toast("Selecione pelo menos um cliente.","warning");return;}state.transferIds=selected;$("transferSummary").textContent=`${selected.length} cliente(s) serão transferidos. A operação ficará registrada na auditoria.`;$("transferForm").reset();$("transferDialog").showModal();}
async function transferClients(form){if(!canManage()){toast("A transferência exige perfil de gerente ou administrador.","error");return false;}const data=Object.fromEntries(new FormData(form)),ids=state.transferIds||[],owner=sellerById(data.ownerUid);if(!ids.length||!data.motivo.trim())return false;if(!confirm(`Confirmar a transferência de ${ids.length} cliente(s) para ${data.ownerUid?owner.name:"a equipe"}?`))return false;showLoading("Transferindo carteira…");try{for(let offset=0;offset<ids.length;offset+=400){const batch=writeBatch(db);ids.slice(offset,offset+400).forEach(id=>batch.set(documentRef("clients",id),{ownerUid:data.ownerUid||"",ownerNome:data.ownerUid?owner.name:"",atualizadoEm:isoNow()},{merge:true}));await batch.commit();}await audit("clientes_transferidos","clientes","",{quantidade:ids.length,novoResponsavel:data.ownerUid||"equipe",motivo:data.motivo});state.selectedClients.clear();$("transferDialog").close();toast("Carteira transferida com sucesso.");return true;}catch(error){console.error(error);toast(errorMessage(error),"error");return false;}finally{hideLoading();}}
$("transferForm").addEventListener("submit",async event=>{event.preventDefault();await transferClients(event.currentTarget);});

async function addTagToSelected(){const tag=prompt("Etiqueta para adicionar aos clientes selecionados:","")?.trim();if(!tag)return;const clients=visibleClients().filter(c=>state.selectedClients.has(c.id));showLoading("Adicionando etiqueta…");try{for(let offset=0;offset<clients.length;offset+=400){const batch=writeBatch(db);clients.slice(offset,offset+400).forEach(c=>batch.set(documentRef("clients",c.id),{tags:Array.from(new Set([...(c.tags||[]),tag])),atualizadoEm:isoNow()},{merge:true}));await batch.commit();}await audit("etiqueta_adicionada_em_massa","clientes","",{tag,quantidade:clients.length});toast("Etiqueta adicionada.");}catch(error){toast(errorMessage(error),"error");}hideLoading();}
function contactClient(id){const client=clientById(id);if(!client)return;const url=whatsappUrl(client,`Oi ${firstName(client.nome)}! Tudo bem? Aqui é ${state.me.name||"da equipe"}, da ${state.store.name||state.store.code||"loja"}.`);if(!url){toast("Este cliente não possui WhatsApp válido.","warning");return;}window.open(url,"_blank","noopener");}

function openTaskForm({clientId="",dealId=""}={}){const form=$("taskForm");form.reset();form.dataset.dealId=dealId||"";const deal=dealById(dealId),client=clientById(clientId||deal?.clientId);form.elements.clientId.value=client?.id||"";form.elements.ownerUid.value=deal?.ownerUid||client?.ownerUid||state.me.uid;form.elements.prazo.value=toLocalInput(new Date(Date.now()+86400000));if(deal)form.elements.titulo.value=`Retorno: ${deal.produto||client?.nome||"negociação"}`;$("taskDialog").showModal();}
function openAttendanceForm(clientId=""){const form=$("attendanceForm");form.reset();form.elements.clientId.value=clientId||"";const client=clientById(clientId);form.elements.ownerUid.value=client?.ownerUid||state.me.uid;$("attendanceDialog").showModal();}
function openJourneyForm(template="Boas-vindas"){$("journeyForm").reset();$("journeyForm").elements.modelo.value=template;$("journeyForm").elements.nome.value=template;$("journeyDialog").showModal();}

document.addEventListener("click",async event=>{
  const action=event.target.closest("[data-action]")?.dataset.action;
  if(action==="new-client")openClientForm();else if(action==="new-deal")openDealForm();else if(action==="new-quote")openDealForm("",null,"orcamento");else if(action==="new-task")openTaskForm();else if(action==="new-attendance")openAttendanceForm();else if(action==="new-segment"){$("segmentForm").reset();previewCustomSegment();$("segmentDialog").showModal();}else if(action==="new-campaign")openCampaignForm();else if(action==="new-journey")openJourneyForm();else if(action==="new-loyalty"){$("loyaltyForm").reset();$("loyaltyDialog").showModal();}else if(action==="new-survey"){$("surveyForm").reset();$("surveyDialog").showModal();}else if(action==="transfer-clients")openTransfer();else if(action==="tag-clients")await addTagToSelected();else if(action==="campaign-from-selection")openCampaignForm("todos",Array.from(state.selectedClients));else if(action==="save-client-view")saveClientView();else if(action==="export-clients")await exportClients();else if(action==="export-metrics")await exportMetrics();else if(action==="export-audit")await exportAudit();else if(action==="open-league")location.href="./index.html#arena";
  const openClient=event.target.closest("[data-open-client]");if(openClient)openClient360(openClient.dataset.openClient);
  const editClient=event.target.closest("[data-edit-client]");if(editClient)openClientForm(clientById(editClient.dataset.editClient));
  const contact=event.target.closest("[data-contact-client]");if(contact&&contact.dataset.contactClient)contactClient(contact.dataset.contactClient);
  const newDeal=event.target.closest("[data-new-deal-client]");if(newDeal)openDealForm(newDeal.dataset.newDealClient,null,"",newDeal.dataset.campaignId||"");
  const editDeal=event.target.closest("[data-edit-deal]");if(editDeal)openDealForm("",dealById(editDeal.dataset.editDeal));
  const move=event.target.closest("[data-move-deal]");if(move)await moveDeal(move.dataset.moveDeal,move.dataset.stage);
  const newTaskDeal=event.target.closest("[data-new-task-deal]");if(newTaskDeal)openTaskForm({dealId:newTaskDeal.dataset.newTaskDeal});
  const toggleTask=event.target.closest("[data-toggle-task]");if(toggleTask){const task=state.tasks.find(t=>t.id===toggleTask.dataset.toggleTask);await safeWrite("tasks",task.id,{status:task.status==="concluida"?"pendente":"concluida",concluidaEm:task.status==="concluida"?"":isoNow(),atualizadoEm:isoNow()},{merge:true,auditAction:"atividade_status_alterado"});}
  const completeAttendance=event.target.closest("[data-complete-attendance]");if(completeAttendance)await safeWrite("attendances",completeAttendance.dataset.completeAttendance,{status:"concluida",atualizadoEm:isoNow()},{merge:true,auditAction:"atendimento_concluido"});
  const useSegment=event.target.closest("[data-use-segment]");if(useSegment){switchView("clientes");$("clientSegmentFilter").value=useSegment.dataset.useSegment;renderClients();}
  const campaignSegment=event.target.closest("[data-campaign-segment]");if(campaignSegment)openCampaignForm(campaignSegment.dataset.campaignSegment);
  const journeyTemplate=event.target.closest("[data-journey-template]");if(journeyTemplate)openJourneyForm(journeyTemplate.dataset.journeyTemplate);
  const toggleJourney=event.target.closest("[data-toggle-journey]");if(toggleJourney){const j=state.journeys.find(x=>x.id===toggleJourney.dataset.toggleJourney);const newStatus=j.status==="ativa"?"pausada":"ativa";if(confirm(`${newStatus==="ativa"?"Ativar":"Pausar"} a jornada \"${j.nome}\"?`))await safeWrite("journeys",j.id,{status:newStatus,atualizadoEm:isoNow()},{merge:true,auditAction:`jornada_${newStatus}`});}
  const runJourneyButton=event.target.closest("[data-run-journey]");if(runJourneyButton)await runJourney(runJourneyButton.dataset.runJourney);
  const sendCampaignButton=event.target.closest("[data-send-campaign]");if(sendCampaignButton)await sendNextCampaign(sendCampaignButton.dataset.sendCampaign);
  const pauseCampaign=event.target.closest("[data-pause-campaign]");if(pauseCampaign){const c=state.campaigns.find(x=>x.id===pauseCampaign.dataset.pauseCampaign),next=c?.status==="pausada"?"agendada":"pausada";if(c&&confirm(`${next==="pausada"?"Pausar":"Retomar"} a campanha \"${c.nome}\"?`))await safeWrite("campaigns",c.id,{status:next,atualizadoEm:isoNow()},{merge:true,auditAction:`campanha_${next}`});}
  const cancelCampaign=event.target.closest("[data-cancel-campaign]");if(cancelCampaign&&confirm("Cancelar esta campanha? Nenhum novo contato manual deverá ser aberto."))await safeWrite("campaigns",cancelCampaign.dataset.cancelCampaign,{status:"cancelada",atualizadoEm:isoNow()},{merge:true,auditAction:"campanha_cancelada"});
  const migrate=event.target.closest("[data-migrate-legacy]");if(migrate)await migrateLegacyDeals();
  const catalog=event.target.closest("[data-open-catalog]");if(catalog)location.href="./catalogo.html";
  const transferOwner=event.target.closest("[data-transfer-owner]");if(transferOwner)openTransfer([],transferOwner.dataset.transferOwner);
  const close360=event.target.closest("[data-close-client360]");if(close360)$("client360Dialog").close();
  const clientTab=event.target.closest("[data-client-tab]");if(clientTab){state.clientDetailTab=clientTab.dataset.clientTab;renderClient360(state.detailClient);}
  const defer=event.target.closest("[data-defer-priority]");if(defer){const due=new Date(Date.now()+86400000);await createTask({clientId:defer.dataset.client,titulo:"Prioridade adiada",tipo:"Retorno",ownerUid:clientById(defer.dataset.client)?.ownerUid||state.me.uid,prazo:toLocalInput(due),prioridade:"media",descricao:"Criada ao adiar uma prioridade do CRM."});}
});

$("client360Dialog").addEventListener("close",()=>{state.detailClient=null;});
