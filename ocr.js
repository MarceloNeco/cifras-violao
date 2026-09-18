/* ============================================================
   ocr.js — a página que transforma uma FOTO em cifra.

   O caminho é: câmera (ou galeria) → a imagem é endireitada e
   tem o contraste puxado → o motor de leitura roda dentro do
   próprio navegador → o texto sai numa caixa que você pode
   corrigir → vai para a fila da página Importar.

   Nenhuma imagem sai do aparelho.
   ============================================================ */

const $ = s => document.querySelector(s);

let fluxoCamera = null;
let cameraTraseira = true;
let imagemOriginal = null;    // um <img> ou um <canvas> com a foto crua
let giro = 0;                 // 0, 90, 180, 270
let contraste = 40;           // 0 a 100
let trabalhador = null;
let lendo = false;

iniciarTema();

/* ---------- o trabalhador que lê ---------- */
function garantirTrabalhador(){
  if (trabalhador) return trabalhador;
  trabalhador = new Worker('ocr-worker.js');
  trabalhador.onmessage = e=>{
    const m = e.data || {};
    if (m.tipo === 'estado'){
      if (m.etapa === 'motor')  recado(t('ocr.baixando'), 'trabalhando');
      if (m.etapa === 'idioma') recado(t('ocr.baixando'), 'trabalhando');
      if (m.etapa === 'lendo')  recado(t('ocr.lendo'), 'trabalhando');
    }
    if (m.tipo === 'pronto'){
      lendo = false;
      $('#ler').disabled = false;
      const texto = limparLeitura(m.texto || '');
      if (!texto.trim()){ recado(t('ocr.nada'), 'erro'); return; }
      $('#saida').value = texto;
      $('#bloco-saida').hidden = false;
      recado(t('ocr.pronto') + (m.confianca ? ` (${Math.round(m.confianca)}%)` : ''), 'certo');
      $('#bloco-saida').scrollIntoView({behavior:'smooth', block:'start'});
    }
    if (m.tipo === 'erro'){
      lendo = false;
      $('#ler').disabled = false;
      recado(m.mensagem === 'sem-motor' || m.mensagem === 'sem-idioma'
             ? t('ocr.semMotor') : t('ocr.erro'), 'erro');
    }
  };
  return trabalhador;
}

/* ---------- consertos de leitura ----------
   O motor às vezes troca um acorde por um símbolo parecido — o
   caso mais comum é o C virar €. Só trocamos quando o resultado
   vira um acorde de verdade, então nada da letra é mexido. */
const TROCAS = {'€':'C', '¢':'C', '©':'C', '£':'E', '@':'C', '§':'S'};

function limparLeitura(bruto){
  const texto = bruto.replace(/\r\n?/g, '\n').replace(/\n{4,}/g, '\n\n\n');
  if (typeof ehAcorde !== 'function') return texto;
  return texto.split('\n').map(linha =>
    linha.replace(/\S+/g, pedaco=>{
      if (pedaco.length > 7 || ehAcorde(pedaco)) return pedaco;
      let tentativa = pedaco;
      Object.keys(TROCAS).forEach(k => { tentativa = tentativa.split(k).join(TROCAS[k]); });
      return (tentativa !== pedaco && ehAcorde(tentativa)) ? tentativa : pedaco;
    })
  ).join('\n');
}

function recado(texto, classe){
  const el = $('#recado');
  el.textContent = texto;
  el.className = 'recado ' + (classe || '');
}

/* ---------- câmera ---------- */
async function abrirCamera(){
  try{
    pararCamera();
    fluxoCamera = await navigator.mediaDevices.getUserMedia({
      video: {facingMode: cameraTraseira ? {ideal:'environment'} : {ideal:'user'},
              width:{ideal:1920}, height:{ideal:1440}},
      audio: false
    });
    const v = $('#video');
    v.srcObject = fluxoCamera;
    await v.play();
    $('#area-camera').hidden = false;
    recado('', '');
  }catch(e){
    recado(t('ocr.semCamera'), 'erro');
  }
}
function pararCamera(){
  if (fluxoCamera){ fluxoCamera.getTracks().forEach(f => f.stop()); fluxoCamera = null; }
  $('#area-camera').hidden = true;
}
function tirarFoto(){
  const v = $('#video');
  if (!v.videoWidth) return;
  const c = document.createElement('canvas');
  c.width = v.videoWidth; c.height = v.videoHeight;
  c.getContext('2d').drawImage(v, 0, 0);
  imagemOriginal = c;
  giro = 0;
  pararCamera();
  desenharPrevia();
}

/* ---------- imagem escolhida na galeria ---------- */
function usarArquivo(arquivo){
  if (!arquivo) return;
  const img = new Image();
  img.onload = ()=>{ imagemOriginal = img; giro = 0; desenharPrevia(); };
  img.onerror = ()=> recado(t('ocr.erro'), 'erro');
  img.src = URL.createObjectURL(arquivo);
}

/* ---------- endireitar e limpar a imagem ----------
   Deixa em tons de cinza e puxa o contraste: é o que mais ajuda
   a leitura de uma folha fotografada com o celular. */
function prepararCanvas(){
  if (!imagemOriginal) return null;
  const larg = imagemOriginal.width || imagemOriginal.naturalWidth;
  const alt  = imagemOriginal.height || imagemOriginal.naturalHeight;

  /* uma folha de cifra lê melhor com uns 1800 px de largura */
  const alvo = 1800;
  const escala = Math.min(2.2, Math.max(1, alvo / Math.max(1, larg)));
  const virado = (giro === 90 || giro === 270);
  const lFinal = Math.round((virado ? alt : larg) * escala);
  const aFinal = Math.round((virado ? larg : alt) * escala);

  const c = document.createElement('canvas');
  c.width = lFinal; c.height = aFinal;
  const ctx = c.getContext('2d', {willReadFrequently:true});
  ctx.save();
  ctx.translate(lFinal/2, aFinal/2);
  ctx.rotate(giro * Math.PI / 180);
  ctx.drawImage(imagemOriginal, -larg*escala/2, -alt*escala/2, larg*escala, alt*escala);
  ctx.restore();

  /* cinza + contraste */
  const dados = ctx.getImageData(0, 0, lFinal, aFinal);
  const p = dados.data;
  const f = 1 + (contraste / 100) * 1.6;      // 1.0 … 2.6
  for (let i = 0; i < p.length; i += 4){
    const cinza = 0.299*p[i] + 0.587*p[i+1] + 0.114*p[i+2];
    let v = (cinza - 128) * f + 128;
    v = v < 0 ? 0 : v > 255 ? 255 : v;
    p[i] = p[i+1] = p[i+2] = v;
  }
  ctx.putImageData(dados, 0, 0);
  return c;
}

function desenharPrevia(){
  const c = prepararCanvas();
  if (!c) return;
  const tela = $('#previa');
  const ctx = tela.getContext('2d');
  const largura = Math.min(900, c.width);
  tela.width = largura;
  tela.height = Math.round(c.height * largura / c.width);
  ctx.drawImage(c, 0, 0, tela.width, tela.height);
  $('#bloco-previa').hidden = false;
  $('#ler').disabled = false;
}

/* ---------- ler ---------- */
async function lerAgora(){
  if (lendo) return;
  const c = prepararCanvas();
  if (!c){ recado(t('ocr.erro'), 'erro'); return; }
  lendo = true;
  $('#ler').disabled = true;
  recado(t('ocr.baixando'), 'trabalhando');

  const blob = await new Promise(ok => c.toBlob(ok, 'image/png'));
  const bytes = await blob.arrayBuffer();
  garantirTrabalhador().postMessage(
    {tipo:'ler', imagem: bytes, idiomas: $('#idioma-ocr').value}, [bytes]);
}

/* ---------- mandar para a página Importar ---------- */
function mandarParaFila(){
  const texto = $('#saida').value.trim();
  if (!texto) return;
  try{
    sessionStorage.setItem('cifras:ocr-texto', texto);
    sessionStorage.setItem('cifras:ocr-titulo', $('#titulo-musica').value.trim());
  }catch(e){}
  location.href = 'importar.html?ocr=1';
}

/* ---------- ligar os botões ---------- */
$('#abrir-camera').onclick = abrirCamera;
$('#parar-camera').onclick = pararCamera;
$('#tirar').onclick = tirarFoto;
$('#trocar-camera').onclick = ()=>{ cameraTraseira = !cameraTraseira; abrirCamera(); };
$('#arquivo').onchange = e => usarArquivo(e.target.files[0]);
$('#girar').onclick = ()=>{ giro = (giro + 90) % 360; desenharPrevia(); };
$('#contraste').oninput = e =>{ contraste = +e.target.value; desenharPrevia(); };
$('#ler').onclick = lerAgora;
$('#mandar').onclick = mandarParaFila;
$('#limpar').onclick = ()=>{
  imagemOriginal = null; giro = 0;
  $('#bloco-previa').hidden = true;
  $('#bloco-saida').hidden = true;
  $('#saida').value = ''; $('#titulo-musica').value = '';
  $('#arquivo').value = '';
  recado('', '');
};

window.addEventListener('pagehide', pararCamera);

/* se não houver câmera nenhuma, o botão some e sobra a galeria */
if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia){
  $('#abrir-camera').hidden = true;
}
