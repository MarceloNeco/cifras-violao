/* ============================================================
   leitor.js — a página que mostra a cifra
   Cuida de: tom, capotraste, rolagem automática, tamanho da letra,
   modo celular, diagramas dos acordes e afinador.
   ============================================================ */

const params = new URLSearchParams(location.search);
const ID = params.get('m');

let MUSICA = null;      // dados do índice
let LINHAS = [];        // cifra já separada em linhas
let TOM_ORIGINAL = 'C';
let deslocamento = 0;   // quantos semitons subiu/desceu
let capo = 0;           // casa do capotraste
let tamanho = 15;       // tamanho da letra, em pixels
let rolando = false, velocidade = 8, sobra = 0, ultimoQuadro = 0, animacao = null;

const $ = s => document.querySelector(s);

iniciarTema();
carregarTudo();

/* ---------------- carregar a música ---------------- */
async function carregarTudo(){
  if (!ID){ location.replace('index.html'); return; }
  try{
    const indice = await carregarIndice();
    MUSICA = indice.find(m => m.id === ID);
    if (!MUSICA) throw new Error('Essa música não está no índice.');

    document.title = MUSICA.titulo + ' — Cifras de Violão';
    $('#titulo').textContent = MUSICA.titulo;
    $('#nome-palco').textContent = MUSICA.titulo;
    montarLinks();

    /* tenta sempre abrir o arquivo: se ele existir, a cifra aparece,
       mesmo que o indice.json ainda diga que está pendente */
    let r = null;
    try{ r = await fetch(MUSICA.arquivo || (MUSICA.id + '.txt'), {cache:'no-cache'}); }catch(e){}
    if (!r || !r.ok){ semCifraAinda(); return; }
    const {dados, corpo} = lerArquivoDeMusica(await r.text());

    MUSICA = {...MUSICA, ...dados};
    TOM_ORIGINAL = MUSICA.tom || 'C';
    capo = parseInt(MUSICA.capo, 10) || 0;
    LINHAS = analisarCifra(corpo);

    document.title = MUSICA.titulo + ' — Cifras de Violão';
    $('#titulo').textContent = MUSICA.titulo;
    $('#nome-palco').textContent = MUSICA.titulo;
    $('#meta').textContent = [MUSICA.artista, MUSICA.categoria, MUSICA.ritmo]
                              .filter(Boolean).join(' · ');

    const tinhaPreferencia = recuperarPreferencias();
    ligarBotoes();
    montarAfinador();
    desenharCifra();
    /* na primeira visita, ajusta a letra para a cifra caber na largura da tela */
    if (!tinhaPreferencia) setTimeout(ajustarAoEcra, 60);
  }catch(erro){
    $('#titulo').textContent = 'Não deu certo';
    $('#cifra').innerHTML = `<span class="l-letra">${escapar(erro.message)}

Se você abriu o arquivo com dois cliques no computador, o navegador bloqueia
a leitura dos arquivos por segurança. Publicando no GitHub Pages funciona.</span>`;
  }
}

/* botões para ouvir a música e procurar a cifra */
function montarLinks(){
  const l = linksDaMusica(MUSICA);
  $('#ouvir').innerHTML =
    `<a class="botao" href="${l.spotify}" target="_blank" rel="noopener">
       <span class="ponto verde"></span> Ouvir no Spotify</a>
     <a class="botao" href="${l.youtube}" target="_blank" rel="noopener">
       <span class="ponto vermelho"></span> Ver no YouTube</a>` +
    (MUSICA.pendente ? `<a class="botao" href="${l.cifra}" target="_blank" rel="noopener">🔎 Procurar a cifra</a>` : '');
}

/* músicas que estão na lista mas ainda não têm o arquivo da cifra */
function semCifraAinda(){
  $('#meta').textContent = [MUSICA.artista, MUSICA.categoria].filter(Boolean).join(' · ');
  $('#painel').hidden = true;
  $('#diagramas').hidden = true;
  const arquivo = (MUSICA.arquivo || MUSICA.id + '.txt');
  $('#cifra').innerHTML = `<div class="vazio aviso-cifra">
    <strong>Esta música ainda não tem cifra</strong>
    Ela já está na sua lista, mas falta criar o arquivo <b>${escapar(arquivo)}</b>.
    <ol>
      <li>Use o botão <b>Procurar a cifra</b> aqui em cima e copie a cifra de onde você preferir.</li>
      <li>Cole na página <a href="importar.html">Importar cifra</a> — ela arruma o texto e monta o arquivo pronto.</li>
      <li>No GitHub: <b>Add file → Create new file</b>, nome do arquivo <b>${escapar(arquivo)}</b>, e cole o que a página gerou.</li>
    </ol>
    Assim que o arquivo existir, esta página passa a mostrar a cifra com rolagem, tom e desenhos.
  </div>`;
}

/* ---------------- desenhar ---------------- */
function desenharCifra(){
  const total = deslocamento - capo;             // o que a mão realmente toca
  const bemol = preferirBemol(TOM_ORIGINAL, total);

  const html = LINHAS.map(l=>{
    if (l.tipo === 'vazia')  return '<span class="l-vazia"></span>';
    if (l.tipo === 'secao')  return `<span class="l-secao">[${escapar(l.texto)}]</span>`;
    if (l.tipo === 'acordes'){
      const linha = transporLinhaDeAcordes(l.texto, total, bemol);
      const marcada = escapar(linha).replace(/\S+/g, p =>
        ehAcorde(p) ? `<b data-acorde="${p}">${p}</b>` : p);
      const rot = l.rotulo ? `<span class="l-secao" style="display:inline;margin:0">[${escapar(l.rotulo)}] </span>` : '';
      return rot + `<span class="l-acorde">${marcada}</span>`;
    }
    return `<span class="l-letra">${escapar(l.texto)}</span>`;
  }).join('\n');

  $('#cifra').innerHTML = html;
  $('#cifra').querySelectorAll('.l-acorde b').forEach(b=>{
    b.addEventListener('click', ()=> tocarAcorde(b.dataset.acorde));
  });

  /* tom que sai do violão (contando o capotraste) */
  const tomSoando = transporAcorde(TOM_ORIGINAL, deslocamento, preferirBemol(TOM_ORIGINAL, deslocamento));
  $('#tom-atual').textContent = tomSoando;
  $('#tom-palco').textContent = tomSoando;
  $('#capo-atual').textContent = capo === 0 ? '—' : capo + 'ª';

  const forma = transporAcorde(TOM_ORIGINAL, total, bemol);
  $('#meta').textContent = [MUSICA.artista, MUSICA.categoria, MUSICA.ritmo].filter(Boolean).join(' · ')
    + (capo ? ` · capotraste na ${capo}ª casa (você faz o formato de ${forma})` : '');

  desenharDiagramas(total, bemol);
  guardarPreferencias();
  if (typeof medirLinhas === 'function') setTimeout(()=>{ medirLinhas(); atualizarGuia(); }, 0);
}

function desenharDiagramas(total, bemol){
  const lista = acordesDaMusica(LINHAS, total, bemol);
  $('#diagramas').innerHTML =
    `<div class="aviso">Acordes usados${capo ? ' (formatos com o capotraste na ' + capo + 'ª casa)' : ''} — toque num desenho para ouvir</div>`
    + lista.map(a => `<span data-som="${a}">${diagramaSVG(a)}</span>`).join('');
  $('#diagramas').querySelectorAll('[data-som]').forEach(el=>{
    el.addEventListener('click', ()=> tocarAcorde(el.dataset.som));
  });
}

/* ---------------- rolagem automática ---------------- */
function quadro(agora){
  if (!rolando) return;
  const passou = Math.min(100, agora - ultimoQuadro);
  ultimoQuadro = agora;
  sobra += (velocidade * 2.2) * (passou / 1000);   // pixels por segundo
  const inteiro = Math.floor(sobra);
  if (inteiro > 0){
    sobra -= inteiro;
    const antes = window.scrollY;
    window.scrollBy(0, inteiro);
    if (window.scrollY === antes){ pararRolagem(); return; }  // chegou ao fim
  }
  animacao = requestAnimationFrame(quadro);
}
function comecarRolagem(){
  rolando = true; sobra = 0; ultimoQuadro = performance.now();
  $('#btn-rolar').innerHTML = '⏸ Pausar';
  $('#btn-rolar').classList.add('ativo');
  animacao = requestAnimationFrame(quadro);
  manterTelaAcesa();
}
function pararRolagem(){
  rolando = false;
  if (animacao) cancelAnimationFrame(animacao);
  $('#btn-rolar').innerHTML = '▶ Rolar';
  $('#btn-rolar').classList.remove('ativo');
  soltarTela();
}
function alternarRolagem(){ rolando ? pararRolagem() : comecarRolagem(); }

/* impede o celular de apagar a tela enquanto você toca */
let trava = null;
async function manterTelaAcesa(){
  try{ if ('wakeLock' in navigator && !trava) trava = await navigator.wakeLock.request('screen'); }catch(e){}
}
function soltarTela(){ try{ trava && trava.release(); }catch(e){} trava = null; }
document.addEventListener('visibilitychange', ()=>{
  if (document.visibilityState === 'visible' && rolando) manterTelaAcesa();
});

/* no celular, some com a barra do topo quando você rola para baixo:
   são 53 pixels de tela que voltam para a cifra */
function esconderTopoAoRolar(){
  if (!window.matchMedia('(max-width:640px)').matches) return;
  let ultimo = window.scrollY, parado = null;
  window.addEventListener('scroll', ()=>{
    const agora = window.scrollY;
    if (Math.abs(agora - ultimo) > 6){
      document.body.classList.toggle('topo-oculto', agora > ultimo && agora > 120);
      ultimo = agora;
    }
    clearTimeout(parado);
    parado = setTimeout(()=>{ if (window.scrollY < 120) document.body.classList.remove('topo-oculto'); }, 250);
  }, {passive:true});
}

/* ---------------- botões e teclado ---------------- */
function ligarBotoes(){
  $('#tom-mais').onclick  = ()=>{ deslocamento = Math.min(11, deslocamento + 1); desenharCifra(); };
  $('#tom-menos').onclick = ()=>{ deslocamento = Math.max(-11, deslocamento - 1); desenharCifra(); };
  $('#tom-zero').onclick  = ()=>{ deslocamento = 0; desenharCifra(); };

  $('#capo-mais').onclick  = ()=>{ capo = Math.min(11, capo + 1); desenharCifra(); };
  $('#capo-menos').onclick = ()=>{ capo = Math.max(0, capo - 1); desenharCifra(); };

  $('#btn-rolar').onclick = alternarRolagem;
  $('#velocidade').oninput = e=>{
    velocidade = +e.target.value;
    $('#velocidade-valor').textContent = velocidade;
    guardarPreferencias();
  };

  $('#fonte-mais').onclick  = ()=> mudarFonte(+1);
  $('#fonte-menos').onclick = ()=> mudarFonte(-1);

  /* só a cifra: esconde cabeçalho, links e desenhos */
  const chaveSoCifra = 'cifras:so-cifra';
  function aplicarSoCifra(ligado){
    document.body.classList.toggle('so-cifra', ligado);
    const b = $('#btn-so-cifra');
    b.classList.toggle('ativo', ligado);
    b.setAttribute('aria-pressed', ligado);
    b.innerHTML = ligado ? '▥ Mostrar tudo' : '▤ Só a cifra';
    try{ localStorage.setItem(chaveSoCifra, ligado ? 'sim' : 'nao'); }catch(e){}
  }
  let guardadoSoCifra = null;
  try{ guardadoSoCifra = localStorage.getItem(chaveSoCifra); }catch(e){}
  aplicarSoCifra(guardadoSoCifra === 'sim');
  $('#btn-so-cifra').onclick = ()=> aplicarSoCifra(!document.body.classList.contains('so-cifra'));

  $('#btn-palco').onclick  = ()=> modoPalco(true);
  $('#btn-caber').onclick  = ajustarAoEcra;
  let temporizador = null;
  window.addEventListener('resize', ()=>{
    clearTimeout(temporizador);
    temporizador = setTimeout(()=>{ if (document.body.classList.contains('modo-palco')) ajustarAoEcra(); }, 250);
  });
  $('#sair-palco').onclick = ()=> modoPalco(false);

  const fav = $('#btn-favorito');
  const marcado = lerFavoritos().has(ID);
  fav.setAttribute('aria-pressed', marcado);
  fav.textContent = marcado ? '★' : '☆';
  fav.onclick = ()=>{
    const agora = alternarFavorito(ID);
    fav.setAttribute('aria-pressed', agora);
    fav.textContent = agora ? '★' : '☆';
  };

  esconderTopoAoRolar();
  iniciarGuia();
  $('#btn-afinador').onclick = ()=> abrirAfinador(true);
  $('#fechar-afinador').onclick = ()=> abrirAfinador(false);

  document.addEventListener('keydown', e=>{
    if (/^(INPUT|TEXTAREA)$/.test(e.target.tagName)) return;
    switch(e.key){
      case ' ': e.preventDefault(); alternarRolagem(); break;
      case 'ArrowUp':   e.preventDefault(); mudarVelocidade(+1); break;
      case 'ArrowDown': e.preventDefault(); mudarVelocidade(-1); break;
      case '+': case '=': $('#tom-mais').click(); break;
      case '-': case '_': $('#tom-menos').click(); break;
      case 'Escape': if (document.body.classList.contains('modo-palco')) modoPalco(false);
                     else abrirAfinador(false); break;
    }
  });
}

function mudarVelocidade(passo){
  velocidade = Math.max(1, Math.min(30, velocidade + passo));
  $('#velocidade').value = velocidade;
  $('#velocidade-valor').textContent = velocidade;
  guardarPreferencias();
}
/* deixa a letra do tamanho certo para a linha mais comprida caber na tela */
function ajustarAoEcra(){
  const el = $('#cifra');
  if (!el || !el.clientWidth) return;
  for (let i=0; i<3; i++){
    const sobrando = el.scrollWidth - el.clientWidth;
    if (sobrando <= 1 && i > 0) break;
    const proporcao = el.clientWidth / Math.max(1, el.scrollWidth);
    const novo = Math.max(11, Math.min(30, Math.floor(tamanho * proporcao)));
    if (novo === tamanho) break;
    tamanho = novo;
    document.documentElement.style.setProperty('--tamanho-cifra', tamanho + 'px');
    el.getBoundingClientRect();   // obriga o navegador a recalcular
  }
  guardarPreferencias();
}

function mudarFonte(passo){
  tamanho = Math.max(11, Math.min(34, tamanho + passo));
  document.documentElement.style.setProperty('--tamanho-cifra', tamanho + 'px');
  guardarPreferencias();
  if (typeof medirLinhas === 'function') setTimeout(()=>{ medirLinhas(); atualizarGuia(); }, 0);
}
function modoPalco(ligar){
  document.body.classList.toggle('modo-palco', ligar);
  if (ligar){
    tamanho = 30;
    document.documentElement.style.setProperty('--tamanho-cifra', tamanho + 'px');
    setTimeout(ajustarAoEcra, 30);
    manterTelaAcesa();
    if (document.documentElement.requestFullscreen)
      document.documentElement.requestFullscreen().catch(()=>{});
  }else{
    pararRolagem();
    if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(()=>{});
  }
}

/* ---------------- afinador ---------------- */
const CORDAS = [
  {nome:'E', midi:40, obs:'6ª (mais grossa)'},
  {nome:'A', midi:45, obs:'5ª'},
  {nome:'D', midi:50, obs:'4ª'},
  {nome:'G', midi:55, obs:'3ª'},
  {nome:'B', midi:59, obs:'2ª'},
  {nome:'E', midi:64, obs:'1ª (mais fina)'}
];
function montarAfinador(){
  $('#cordas').innerHTML = CORDAS.map((c,i)=>
    `<button class="corda" data-i="${i}"><b>${c.nome}</b><small>${c.obs}</small></button>`).join('');
  $('#cordas').querySelectorAll('.corda').forEach(b=>{
    b.addEventListener('click', ()=>{
      const c = CORDAS[+b.dataset.i];
      const solta = capo ? c.midi + capo : c.midi;   // com capotraste a corda sobe
      tocarNota(solta, 2.4);
      b.classList.add('soando');
      setTimeout(()=> b.classList.remove('soando'), 2400);
    });
  });
}
function abrirAfinador(abrir){
  const g = $('#afinador');
  abrir ? g.setAttribute('aberta','') : g.removeAttribute('aberta');
  g.setAttribute('aria-hidden', !abrir);
}

/* ---------------- lembrar as escolhas de cada música ---------------- */
function chave(){ return 'cifras:pref:' + ID; }
function guardarPreferencias(){
  try{
    localStorage.setItem(chave(), JSON.stringify({deslocamento, capo, tamanho, velocidade}));
  }catch(e){}
}
function recuperarPreferencias(){
  let p = {};
  try{ p = JSON.parse(localStorage.getItem(chave()) || '{}'); }catch(e){}
  const tinha = typeof p.tamanho === 'number';
  if (typeof p.deslocamento === 'number') deslocamento = p.deslocamento;
  if (typeof p.capo === 'number') capo = p.capo;
  if (typeof p.tamanho === 'number') tamanho = p.tamanho;
  if (typeof p.velocidade === 'number') velocidade = p.velocidade;
  document.documentElement.style.setProperty('--tamanho-cifra', tamanho + 'px');
  $('#velocidade').value = velocidade;
  $('#velocidade-valor').textContent = velocidade;
  return tinha;
}

/* ============================================================
   O guia de leitura

   Não há ritmo escrito numa cifra, então nada aqui segue a música:
   tudo segue a ROLAGEM. A régua marca a altura em que os acordes
   entram; a letra vai sendo pintada da esquerda para a direita e,
   quando a tinta chega embaixo de um acorde, ele acende (e soa,
   se o som estiver ligado).

   A posição horizontal do acorde sobre a letra é o que define
   quando ele entra — é a única pista de tempo que uma cifra tem.
   ============================================================ */

let guiaLigado = false, guiaComSom = false;
let linhasDeAcorde = [], larguraDeUmChar = 8;
let acordeAtual = null, bolinha = null, regua = null;
let letraPintada = null;

/* ---------- medidas ---------- */
function medirLarguraChar(){
  const area = $('#cifra');
  if (!area) return 8;
  const teste = document.createElement('span');
  teste.textContent = '0'.repeat(20);
  teste.style.cssText = 'position:absolute;visibility:hidden;white-space:pre';
  area.appendChild(teste);
  const w = teste.getBoundingClientRect().width / 20;
  teste.remove();
  return w || 8;
}

function medirLinhas(){
  const area = $('#cifra');
  if (!area) return;
  larguraDeUmChar = medirLarguraChar();
  linhasDeAcorde = [...area.querySelectorAll('.l-acorde')].map(el=>{
    let letra = el.nextElementSibling;
    while (letra && !letra.classList.contains('l-letra')
                 && !letra.classList.contains('l-acorde')) letra = letra.nextElementSibling;
    if (letra && !letra.classList.contains('l-letra')) letra = null;

    const acordes = [...el.querySelectorAll('b')].map(b => ({
      el: b,
      coluna: Math.round(b.offsetLeft / larguraDeUmChar),
      x: b.offsetLeft
    }));
    const ultima = acordes.length ? acordes[acordes.length-1] : null;
    const largura = Math.max(
      letra ? letra.textContent.length : 0,
      ultima ? ultima.coluna + 6 : 0
    );
    return {el, letra, topo: el.offsetTop, acordes, largura};
  }).filter(l => l.acordes.length);
}

/* ---------- a régua ---------- */
const REGUA_CHAVE = 'cifras:regua';

function limiteDaRegua(){
  const noPalco = document.body.classList.contains('modo-palco');
  if (noPalco) return {minimo: 70, maximo: window.innerHeight - 110};

  /* usa a ALTURA das barras, não a posição atual: assim o limite vale
     tanto com a página no começo quanto com a barra já grudada no topo */
  const topoPag = document.querySelector('.topo');
  const fixo = document.querySelector('.fixavel');
  const alturaTopo = topoPag ? topoPag.getBoundingClientRect().height : 0;
  const alturaFixa = (fixo && getComputedStyle(fixo).position === 'sticky')
                   ? fixo.getBoundingClientRect().height : 0;
  const minimo = alturaTopo + alturaFixa + 26;
  const maximo = window.innerHeight - 70;
  return {minimo: Math.min(minimo, Math.max(80, maximo - 40)), maximo};
}

function posicaoDaRegua(){
  let fracao = 0.62;
  try{
    const g = parseFloat(localStorage.getItem(REGUA_CHAVE));
    if (!isNaN(g)) fracao = g;
  }catch(e){}
  const {minimo, maximo} = limiteDaRegua();
  return Math.min(maximo, Math.max(minimo, window.innerHeight * fracao));
}

function desenharRegua(){
  if (!regua) return;
  const y = posicaoDaRegua();
  regua.style.top = y + 'px';
  return y;
}

function criarRegua(){
  if (regua) return regua;
  regua = document.createElement('div');
  regua.className = 'regua';
  regua.hidden = true;
  regua.innerHTML =
    `<span class="regua-traco"></span>
     <span class="regua-meio"></span>
     <span class="regua-traco"></span>
     <button class="regua-pega" title="Arraste para escolher a altura em que os acordes entram"
             aria-label="Altura da régua">↕</button>`;
  document.body.appendChild(regua);

  let arrastando = false;
  const mover = e=>{
    if (!arrastando) return;
    const {minimo, maximo} = limiteDaRegua();
    const y = Math.min(maximo, Math.max(minimo, e.clientY));
    try{ localStorage.setItem(REGUA_CHAVE, (y / window.innerHeight).toFixed(4)); }catch(err){}
    desenharRegua();
    atualizarGuia();
    e.preventDefault();
  };
  const pegar = e=>{
    arrastando = true;
    regua.classList.add('arrastando');
    e.target.setPointerCapture && e.target.setPointerCapture(e.pointerId);
  };
  const soltar = ()=>{ arrastando = false; regua.classList.remove('arrastando'); };

  regua.querySelectorAll('.regua-traco, .regua-pega').forEach(p=>{
    p.addEventListener('pointerdown', pegar);
  });
  regua.addEventListener('pointermove', mover);
  window.addEventListener('pointermove', mover);
  window.addEventListener('pointerup', soltar);

  /* também dá para ajustar pelo teclado, com a régua em foco */
  regua.querySelector('.regua-pega').addEventListener('keydown', e=>{
    const passo = e.key === 'ArrowUp' ? -12 : e.key === 'ArrowDown' ? 12 : 0;
    if (!passo) return;
    e.preventDefault();
    const {minimo, maximo} = limiteDaRegua();
    const y = Math.min(maximo, Math.max(minimo, posicaoDaRegua() + passo));
    try{ localStorage.setItem(REGUA_CHAVE, (y / window.innerHeight).toFixed(4)); }catch(err){}
    desenharRegua(); atualizarGuia();
  });
  return regua;
}

/* ---------- pintura ---------- */
function criarBolinha(){
  if (bolinha) return bolinha;
  bolinha = document.createElement('span');
  bolinha.className = 'bolinha';
  bolinha.setAttribute('aria-hidden','true');
  $('#cifra').appendChild(bolinha);
  return bolinha;
}

function despintar(){
  if (letraPintada){
    letraPintada.classList.remove('pintando');
    letraPintada.style.removeProperty('--ate');
    letraPintada = null;
  }
  document.querySelectorAll('.l-ativa').forEach(e=>{
    e.classList.remove('l-ativa', 'pintando');
    e.style.removeProperty('--ate');
  });
  document.querySelectorAll('.acorde-agora').forEach(e => e.classList.remove('acorde-agora'));
}

function limparGuia(){
  despintar();
  if (bolinha) bolinha.style.opacity = '0';
  acordeAtual = null;
}

/* ---------- o coração ---------- */
function atualizarGuia(){
  if (!guiaLigado || !linhasDeAcorde.length) return;
  const area = $('#cifra');
  const alvo = window.scrollY + posicaoDaRegua() - area.offsetTop;

  let i = -1;
  for (let k = 0; k < linhasDeAcorde.length; k++){
    if (linhasDeAcorde[k].topo <= alvo) i = k; else break;
  }
  if (i < 0){ limparGuia(); return; }

  const linha = linhasDeAcorde[i];
  const proxima = linhasDeAcorde[i+1];
  const fim = proxima ? proxima.topo : linha.topo + 70;
  const andado = Math.min(1, Math.max(0, (alvo - linha.topo) / Math.max(1, fim - linha.topo)));

  /* até onde a tinta chegou, em pixels, dentro da linha */
  const ateX = andado * linha.largura * larguraDeUmChar;

  if (!linha.el.classList.contains('l-ativa')){
    despintar();
    linha.el.classList.add('l-ativa', 'pintando');
    if (linha.letra) linha.letra.classList.add('pintando');
    letraPintada = linha.letra || null;
  }
  linha.el.style.setProperty('--ate', ateX + 'px');
  if (linha.letra) linha.letra.style.setProperty('--ate', ateX + 'px');

  /* qual acorde a tinta já alcançou */
  let qual = -1;
  for (let k = 0; k < linha.acordes.length; k++){
    if (linha.acordes[k].x <= ateX) qual = k; else break;
  }

  const b = criarBolinha();
  b.style.opacity = '1';
  b.style.transform = `translate(${ateX - 5}px, ${linha.el.offsetTop - 13}px)`;

  const acorde = qual >= 0 ? linha.acordes[qual].el : null;
  if (acorde !== acordeAtual){
    document.querySelectorAll('.acorde-agora').forEach(e => e.classList.remove('acorde-agora'));
    if (acorde){
      acorde.classList.add('acorde-agora');
      b.classList.remove('pula'); void b.offsetWidth; b.classList.add('pula');
      if (guiaComSom) tocarAcorde(acorde.dataset.acorde);
    }
    acordeAtual = acorde;
  }
}

/* ---------- ligar e desligar ---------- */
function ligarGuia(ligado){
  guiaLigado = ligado;
  document.body.classList.toggle('com-guia', ligado);
  const b = $('#btn-guia');
  b.classList.toggle('ativo', ligado);
  b.setAttribute('aria-pressed', ligado);
  $('#btn-guia-som').hidden = !ligado;
  criarRegua().hidden = !ligado;
  try{ localStorage.setItem('cifras:guia', ligado ? 'sim' : 'nao'); }catch(e){}
  if (ligado){ medirLinhas(); desenharRegua(); atualizarGuia(); } else limparGuia();
}

function ligarSomDoGuia(ligado){
  guiaComSom = ligado;
  const b = $('#btn-guia-som');
  b.classList.toggle('ativo', ligado);
  b.setAttribute('aria-pressed', ligado);
  b.textContent = ligado ? '🔊' : '🔇';
  b.title = ligado ? 'Desligar o som do guia' : 'Ligar o som do guia';
  try{ localStorage.setItem('cifras:guia-som', ligado ? 'sim' : 'nao'); }catch(e){}
}

function iniciarGuia(){
  let salvo = null, salvoSom = null;
  try{
    salvo = localStorage.getItem('cifras:guia');
    salvoSom = localStorage.getItem('cifras:guia-som');
  }catch(e){}

  $('#btn-guia').onclick = ()=> ligarGuia(!guiaLigado);
  $('#btn-guia-som').onclick = ()=> ligarSomDoGuia(!guiaComSom);
  ligarSomDoGuia(salvoSom === 'sim');
  ligarGuia(salvo === 'sim');

  let pedido = null;
  const aoRolar = ()=>{
    if (pedido) return;
    pedido = requestAnimationFrame(()=>{ pedido = null; desenharRegua(); atualizarGuia(); });
  };
  window.addEventListener('scroll', aoRolar, {passive:true});

  let espera = null;
  window.addEventListener('resize', ()=>{
    clearTimeout(espera);
    espera = setTimeout(()=>{ medirLinhas(); desenharRegua(); atualizarGuia(); }, 200);
  });
}
