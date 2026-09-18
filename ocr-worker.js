/* ============================================================
   ocr-worker.js — a leitura da imagem acontece aqui, num
   "trabalhador" separado, para a tela não travar enquanto lê.

   Usa direto o motor Tesseract compilado para o navegador
   (os arquivos tesseract-core-*.wasm.js do repositório).
   Nada é enviado para fora do aparelho.
   ============================================================ */

let motor = null;      // o módulo do Tesseract já carregado
let api = null;        // a "máquina" de leitura
let idiomasProntos = new Set();
let idiomaAtivo = '';

/* o navegador aguenta as instruções rápidas (SIMD)? */
const PROVA_SIMD = new Uint8Array([
  0,97,115,109,1,0,0,0,1,5,1,96,0,1,123,3,2,1,0,10,10,1,8,0,65,0,253,15,253,98,11
]);
function temSimd(){
  try{ return WebAssembly.validate(PROVA_SIMD); }catch(e){ return false; }
}

function avisar(tipo, dados){ self.postMessage(Object.assign({tipo}, dados || {})); }

/* ---------- carregar o motor (só na primeira vez) ---------- */
async function garantirMotor(){
  if (motor) return;
  avisar('estado', {etapa:'motor'});
  const arquivo = temSimd() ? 'tesseract-core-simd-lstm.wasm.js'
                            : 'tesseract-core-lstm.wasm.js';
  try{
    importScripts(arquivo);
  }catch(e){
    throw new Error('sem-motor');
  }
  motor = await TesseractCore();
  api = new motor.TessBaseAPI();
}

/* ---------- carregar o idioma ---------- */
async function garantirIdioma(codigo){
  if (idiomasProntos.has(codigo)) return;
  avisar('estado', {etapa:'idioma', idioma: codigo});

  let bytes = null;
  /* primeiro tenta o arquivo compactado (menor no repositório) */
  try{
    const r = await fetch(codigo + '.traineddata.gz');
    if (r.ok){
      if (typeof DecompressionStream === 'function'){
        const fluxo = r.body.pipeThrough(new DecompressionStream('gzip'));
        bytes = new Uint8Array(await new Response(fluxo).arrayBuffer());
      }
    }
  }catch(e){}
  /* se não deu, tenta o arquivo solto */
  if (!bytes){
    const r = await fetch(codigo + '.traineddata');
    if (!r.ok) throw new Error('sem-idioma');
    bytes = new Uint8Array(await r.arrayBuffer());
  }
  motor.FS.writeFile(codigo + '.traineddata', bytes);
  idiomasProntos.add(codigo);
}

/* ---------- ler uma imagem ---------- */
async function ler(imagem, idiomas){
  await garantirMotor();
  for (const c of idiomas.split('+')) await garantirIdioma(c);

  if (idiomaAtivo !== idiomas){
    api.Init(null, idiomas);
    idiomaAtivo = idiomas;
    /* 4 = uma coluna de texto com tamanhos variados: é o que mais
       se parece com uma folha de cifra */
    try{ api.SetPageSegMode(4); }catch(e){}
    /* os espaços entre as palavras são o que alinha o acorde em
       cima da sílaba certa — sem isto a cifra sai desmontada */
    try{ api.SetVariable('preserve_interword_spaces', '1'); }catch(e){}
    try{ api.SetVariable('user_defined_dpi', '300'); }catch(e){}
  }

  avisar('estado', {etapa:'lendo'});
  motor.FS.writeFile('/input', new Uint8Array(imagem));
  api.SetImageFile();
  const texto = api.GetUTF8Text();
  let confianca = 0;
  try{ confianca = api.MeanTextConf(); }catch(e){}
  try{ motor.FS.unlink('/input'); }catch(e){}
  return {texto: texto || '', confianca};
}

self.onmessage = async e=>{
  const pedido = e.data || {};
  if (pedido.tipo !== 'ler') return;
  try{
    const r = await ler(pedido.imagem, pedido.idiomas || 'por');
    avisar('pronto', r);
  }catch(erro){
    avisar('erro', {mensagem: (erro && erro.message) || 'falhou'});
  }
};
