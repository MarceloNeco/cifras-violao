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

    const r = MUSICA.pendente ? null
            : await fetch(MUSICA.arquivo || (MUSICA.id + '.txt'), {cache:'no-cache'});
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
