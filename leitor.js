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
    $('#titulo').textContent = t('cifra.erroTitulo');
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
       <span class="ponto verde"></span> ${t('cifra.spotify')}</a>
     <a class="botao" href="${l.youtube}" target="_blank" rel="noopener">
       <span class="ponto vermelho"></span> ${t('cifra.youtube')}</a>` +
    (MUSICA.pendente ? `<a class="botao" href="${l.cifra}" target="_blank" rel="noopener">${t('cifra.procurar')}</a>` : '');
}

/* músicas que estão na lista mas ainda não têm o arquivo da cifra */
function semCifraAinda(){
  $('#meta').textContent = [MUSICA.artista, MUSICA.categoria].filter(Boolean).join(' · ');
  $('#painel').hidden = true;
  $('#diagramas').hidden = true;
  const arquivo = (MUSICA.arquivo || MUSICA.id + '.txt');
  $('#cifra').innerHTML = `<div class="vazio aviso-cifra">
    <strong>${t('cifra.semTitulo')}</strong>
    ${t('cifra.semTexto', {arquivo: '<b>' + escapar(arquivo) + '</b>'})}
    <ol>
      <li>${t('cifra.semPasso1')}</li>
      <li>${t('cifra.semPasso2')}</li>
      <li>${t('cifra.semPasso3', {arquivo: escapar(arquivo)})}</li>
    </ol>
    ${t('cifra.semFim')}
  </div>`;
}

/* ---------------- desenhar ---------------- */
function desenharCifra(){
  if (vozLendo) pararVoz();   // as linhas vão mudar: a leitura recomeça pelo botão
  const total = deslocamento - capo;             // o que a mão realmente toca
  const bemol = preferirBemol(TOM_ORIGINAL, total);

  /* Quantas letras cabem na largura da tela. Linha maior que isso é
     quebrada em pedaços, e cada pedaço leva junto os acordes que estão
     em cima dele — assim o acorde continua em cima da sílaba certa
     mesmo com a letra grande (antes a linha saía da tela). */
  const colunas = colunasQueCabem();
  const acordeHTML = texto => `<span class="l-acorde">${escapar(texto).replace(/\S+/g, p =>
        ehAcorde(p) ? `<b data-acorde="${p}">${p}</b>` : p)}</span>`;
  const letraHTML = texto => `<span class="l-letra">${escapar(texto)}</span>`;

  const partes = [];
  for (let i = 0; i < LINHAS.length; i++){
    const l = LINHAS[i];
    if (l.tipo === 'vazia'){ partes.push('<span class="l-vazia"></span>'); continue; }
    if (l.tipo === 'secao'){ partes.push(`<span class="l-secao">[${escapar(l.texto)}]</span>`); continue; }

    let acordes = '', letra = null, rotulo = '';
    if (l.tipo === 'acordes'){
      acordes = transporLinhaDeAcordes(l.texto, total, bemol);
      rotulo = l.rotulo ? '[' + l.rotulo + '] ' : '';
      const prox = LINHAS[i+1];
      if (prox && prox.tipo === 'letra'){ letra = prox.texto; i++; }   // o par acorde + letra
    }else{
      letra = l.texto;
    }

    quebrarPar(acordes, letra || '', colunas, rotulo.length).forEach((pedaco, n)=>{
      const rot = (n === 0 && rotulo)
        ? `<span class="l-secao" style="display:inline;margin:0">${escapar(rotulo)}</span>` : '';
      const linhas = [];
      /* na continuação, linha vazia não entra (ficaria um buraco na tela) */
      if (l.tipo === 'acordes' && (n === 0 || pedaco.acordes)) linhas.push(rot + acordeHTML(pedaco.acordes));
      if (letra !== null && (n === 0 || pedaco.letra)) linhas.push(letraHTML(pedaco.letra));
      partes.push(linhas.join('\n'));
    });
  }

  $('#cifra').innerHTML = partes.join('\n');
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
    + (capo ? ' · ' + t('cifra.capoMeta', {n: capo, forma}) : '');

  desenharDiagramas(total, bemol);
  guardarPreferencias();
  if (typeof medirLinhas === 'function') setTimeout(()=>{ medirLinhas(); atualizarGuia(); }, 0);
}

/* quantas letras (colunas) cabem na largura da área da cifra */
function colunasQueCabem(){
  const area = $('#cifra');
  if (!area || !area.clientWidth) return Infinity;
  return Math.max(12, Math.floor((area.clientWidth - 4) / medirLarguraChar()));
}

/* Quebra uma linha de acordes + a linha de letra embaixo dela em pedaços
   que caibam em "colunas". O corte:
   - nunca parte um acorde no meio;
   - de preferência cai entre duas palavras da letra;
   - só em último caso corta uma palavra (palavra maior que a tela). */
function quebrarPar(acordes, letra, colunas, recuoPrimeira){
  const tamanhoTotal = Math.max(acordes.length, letra.length);
  if (tamanhoTotal + recuoPrimeira <= colunas) return [{acordes, letra}];

  /* onde começa e termina cada acorde */
  const faixas = [];
  acordes.replace(/\S+/g, (p, ini)=>{ faixas.push([ini, ini + p.length]); return p; });
  const dentroDeAcorde = c => faixas.some(([a, b]) => a < c && c < b);
  const vazio = (txt, c) => c >= txt.length || txt[c] === ' ';
  const entrePalavras = c => vazio(letra, c - 1) || vazio(letra, c);

  const pedacos = [];
  let inicio = 0, primeira = true;
  while (inicio < tamanhoTotal){
    const cabe = colunas - (primeira ? recuoPrimeira : 0);
    let fim = inicio + cabe;
    if (fim < tamanhoTotal){
      let corte = -1;
      for (let c = fim; c > inicio; c--)                      // 1º: entre palavras
        if (!dentroDeAcorde(c) && entrePalavras(c)){ corte = c; break; }
      if (corte < 0)
        for (let c = fim; c > inicio; c--)                    // 2º: só não partir acorde
          if (!dentroDeAcorde(c)){ corte = c; break; }
      fim = corte > 0 ? corte : fim;                          // 3º: corta onde der
    }
    pedacos.push({acordes: acordes.slice(inicio, fim).replace(/\s+$/, ''),
                  letra:   letra.slice(inicio, fim).replace(/\s+$/, '')});
    inicio = fim;
    /* a próxima fileira não começa com espaço em branco */
    while (inicio < tamanhoTotal && vazio(acordes, inicio) && vazio(letra, inicio)) inicio++;
    primeira = false;
  }
  return pedacos;
}

function desenharDiagramas(total, bemol){
  const lista = acordesDaMusica(LINHAS, total, bemol);
  $('#diagramas').innerHTML =
    `<div class="aviso">${t('cifra.acordesUsados')}${capo ? ' (' + t('cifra.acordesCapo', {n: capo}) + ')' : ''} — ${t('cifra.toqueDesenho')}</div>`
    + lista.map(a => `<span data-som="${a}">${diagramaSVG(a)}</span>`).join('');
  $('#diagramas').querySelectorAll('[data-som]').forEach(el=>{
    el.addEventListener('click', ()=> tocarAcorde(el.dataset.som));
  });
}

/* ---------------- rolagem automática ----------------
   Regras que valem no celular:
   1) enquanto o dedo está na tela, a rolagem automática para de empurrar —
      assim ela não briga com o arrasto do usuário;
   2) durante o Play a barra do topo fica quieta (não pisca por cima da cifra);
   3) no modo celular a barra de controles se recolhe sozinha depois de
      alguns segundos e vira um botão redondo de Play/Pause no canto.
      Um toque na cifra traz a barra de volta.
   ---------------------------------------------------- */

const ROTULO_PLAY  = '▶ Play';
const ROTULO_PAUSE = '⏸ Pause';

let dedoNaTela = false;      // o usuário está arrastando com o dedo
let botaoFlutuante = null;
let relogioRecolher = null;

function quadro(agora){
  if (!rolando) return;
  /* dedo na tela: deixa o usuário mandar, sem empurrar por baixo */
  if (dedoNaTela){ ultimoQuadro = agora; animacao = requestAnimationFrame(quadro); return; }
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

function pintarBotoesPlay(){
  const b = $('#btn-rolar');
  if (b){
    b.innerHTML = rolando ? ROTULO_PAUSE : ROTULO_PLAY;
    b.classList.toggle('ativo', rolando);
    b.setAttribute('aria-pressed', rolando);
    b.title = rolando ? 'Pause (barra de espaço)' : 'Play (barra de espaço)';
  }
  const f = criarBotaoFlutuante();
  f.textContent = rolando ? '⏸' : '▶';
  f.classList.toggle('ativo', rolando);
  f.setAttribute('aria-label', rolando ? 'Pause' : 'Play');
}

function comecarRolagem(){
  rolando = true; sobra = 0; ultimoQuadro = performance.now();
  pintarBotoesPlay();
  animacao = requestAnimationFrame(quadro);
  manterTelaAcesa();
  agendarRecolher();
}
function pararRolagem(){
  rolando = false;
  if (animacao) cancelAnimationFrame(animacao);
  pintarBotoesPlay();
  soltarTela();
  mostrarBarra(false);
}
function alternarRolagem(){ rolando ? pararRolagem() : comecarRolagem(); }

/* ---------- botão redondo de Play/Pause (modo celular) ---------- */
function criarBotaoFlutuante(){
  if (botaoFlutuante) return botaoFlutuante;
  botaoFlutuante = document.createElement('button');
  botaoFlutuante.className = 'play-flutuante';
  botaoFlutuante.id = 'play-flutuante';
  botaoFlutuante.type = 'button';
  botaoFlutuante.textContent = '▶';
  botaoFlutuante.addEventListener('click', e=>{ e.stopPropagation(); alternarRolagem(); });
  document.body.appendChild(botaoFlutuante);
  return botaoFlutuante;
}

/* ---------- a barra que se recolhe ---------- */
function agendarRecolher(){
  clearTimeout(relogioRecolher);
  if (!rolando) return;
  if (!document.body.classList.contains('modo-palco')) return;
  relogioRecolher = setTimeout(()=>{
    if (rolando) document.body.classList.add('barra-oculta');
  }, 2600);
}
function mostrarBarra(reagendar = true){
  clearTimeout(relogioRecolher);
  document.body.classList.remove('barra-oculta');
  if (reagendar) agendarRecolher();
}

/* um toque na cifra traz a barra de volta; um arrasto pausa o empurrão */
function ligarGestos(){
  const acabou = ()=>{
    if (!dedoNaTela) return;
    dedoNaTela = false;
    ultimoQuadro = performance.now();   // recomeça a contar do zero, sem salto
    sobra = 0;
    agendarRecolher();
  };
  document.addEventListener('touchstart', e=>{
    if (e.target.closest('.painel, .faixa-palco, .play-flutuante, .gaveta, .regua')) return;
    dedoNaTela = true;
    mostrarBarra(false);
  }, {passive:true});
  document.addEventListener('touchend', acabou, {passive:true});
  document.addEventListener('touchcancel', acabou, {passive:true});
  /* no computador, o clique na cifra também traz a barra de volta */
  document.addEventListener('mousedown', e=>{
    if (e.target.closest('.painel, .faixa-palco, .play-flutuante, .gaveta, .regua')) return;
    mostrarBarra();
  });
  /* mexeu na barra? ela fica mais um tempo na tela */
  document.addEventListener('pointerdown', e=>{
    if (e.target.closest('.painel, .faixa-palco')) mostrarBarra();
  });
}

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
   são 53 pixels de tela que voltam para a cifra.
   Durante o Play a barra fica quieta — antes ela reaparecia assim que
   você arrastava para cima e tapava a cifra. */
function esconderTopoAoRolar(){
  if (!window.matchMedia('(max-width:640px)').matches) return;
  let ultimo = window.scrollY, parado = null;
  window.addEventListener('scroll', ()=>{
    const agora = window.scrollY;
    if (rolando){
      document.body.classList.toggle('topo-oculto', agora > 120);
      ultimo = agora;
      return;
    }
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
    b.innerHTML = ligado ? t('cifra.mostrarTudo') : t('cifra.soCifra');
    try{ localStorage.setItem(chaveSoCifra, ligado ? 'sim' : 'nao'); }catch(e){}
  }
  let guardadoSoCifra = null;
  try{ guardadoSoCifra = localStorage.getItem(chaveSoCifra); }catch(e){}
  aplicarSoCifra(guardadoSoCifra === 'sim');
  $('#btn-so-cifra').onclick = ()=> aplicarSoCifra(!document.body.classList.contains('so-cifra'));

  $('#btn-palco').onclick  = ()=> modoPalco(true);
  $('#btn-caber').onclick  = ajustarAoEcra;
  let temporizador = null, larguraAntes = window.innerWidth;
  window.addEventListener('resize', ()=>{
    /* no celular a barra de endereço some e volta ao rolar e muda só a altura:
       isso não é motivo para redesenhar */
    if (window.innerWidth === larguraAntes) return;
    larguraAntes = window.innerWidth;
    clearTimeout(temporizador);
    temporizador = setTimeout(()=>{
      if (document.body.classList.contains('modo-palco')) ajustarAoEcra();
      else if (LINHAS.length) desenharCifra();      // tela girou: quebra as linhas de novo
    }, 250);
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

  const compartilhador = $('#btn-compartilhar');
  if (compartilhador) compartilhador.onclick = async ()=>{
    let r = 'nada';
    if (window.DGO && DGO.compartilhar){
      /* compartilhamento nativo do módulo — o mesmo nos três apps */
      try{ await DGO.compartilhar({titulo: MUSICA.titulo,
                                   texto: buscaDaMusica(MUSICA),
                                   url: location.href}); r = 'compartilhado'; }
      catch(e){ r = 'nada'; }
    }else if (navigator.share){
      try{ await navigator.share({title: MUSICA.titulo, url: location.href}); r = 'compartilhado'; }
      catch(e){ r = 'nada'; }
    }else{
      try{ await navigator.clipboard.writeText(MUSICA.titulo + '\n' + location.href); r = 'copiado'; }
      catch(e){}
    }
    if (r === 'copiado'){
      compartilhador.textContent = '✓';
      setTimeout(()=>{ compartilhador.textContent = '⤴'; }, 1600);
    }
  };

  /* trocou o idioma? redesenha o que é feito em JavaScript */
  document.addEventListener('idioma-mudou', ()=>{
    if (!LINHAS.length) return;
    montarLinks();
    montarAfinador();
    desenharCifra();
    pintarBotoesPlay();
  });

  esconderTopoAoRolar();
  ligarGestos();
  pintarBotoesPlay();
  iniciarGuia();
  iniciarVoz();
  $('#btn-afinador').onclick = ()=> abrirAfinador(!$('#afinador').hasAttribute('aberta'));
  $('#fechar-afinador').onclick = ()=> abrirAfinador(false);
  /* o afinador também fecha com um toque fora dele — antes ele ficava
     tapando a metade de baixo da letra até achar o botão Fechar */
  document.addEventListener('pointerdown', e=>{
    if (!$('#afinador').hasAttribute('aberta')) return;
    if (e.target.closest('#afinador, #btn-afinador')) return;
    abrirAfinador(false);
  });

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
/* deixa a letra do tamanho certo para a linha mais comprida caber na tela.
   Conta pela linha original (sem quebra): se ela couber, nada precisa quebrar. */
function ajustarAoEcra(){
  const el = $('#cifra');
  if (!el || !el.clientWidth || !LINHAS.length) return;
  const total = deslocamento - capo;
  const bemol = preferirBemol(TOM_ORIGINAL, total);
  const maior = Math.max(1, ...LINHAS.map(l => l.tipo === 'acordes'
      ? transporLinhaDeAcordes(l.texto, total, bemol).length + (l.rotulo ? l.rotulo.length + 3 : 0)
      : (l.texto || '').length));
  const porPixel = medirLarguraChar() / tamanho;            // largura de uma letra por px de fonte
  tamanho = Math.max(11, Math.min(30, Math.floor((el.clientWidth - 4) / (maior * porPixel))));
  document.documentElement.style.setProperty('--tamanho-cifra', tamanho + 'px');
  desenharCifra();
}

function mudarFonte(passo){
  tamanho = Math.max(11, Math.min(34, tamanho + passo));
  document.documentElement.style.setProperty('--tamanho-cifra', tamanho + 'px');
  desenharCifra();   // redesenha para a linha que não cabe descer inteira, com o acorde junto
}
function modoPalco(ligar){
  document.body.classList.toggle('modo-palco', ligar);
  if (ligar){
    tamanho = 30;
    document.documentElement.style.setProperty('--tamanho-cifra', tamanho + 'px');
    setTimeout(ajustarAoEcra, 30);
    manterTelaAcesa();
    mostrarBarra(false);
    if (document.documentElement.requestFullscreen)
      document.documentElement.requestFullscreen().catch(()=>{});
  }else{
    pararRolagem();
    document.body.classList.remove('barra-oculta');
    desenharCifra();   // a largura útil muda ao sair do modo celular
    if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(()=>{});
  }
}

/* ---------------- afinador ---------------- */
const CORDAS = [
  {nome:'E', midi:40, obs:'afinador.grossa'},
  {nome:'A', midi:45, obs:'5ª'},
  {nome:'D', midi:50, obs:'4ª'},
  {nome:'G', midi:55, obs:'3ª'},
  {nome:'B', midi:59, obs:'2ª'},
  {nome:'E', midi:64, obs:'afinador.fina'}
];
function textoDaCorda(c){ return c.obs.includes('.') ? t(c.obs) : c.obs; }
function montarAfinador(){
  $('#cordas').innerHTML = CORDAS.map((c,i)=>
    `<button class="corda" data-i="${i}"><b>${c.nome}</b><small>${textoDaCorda(c)}</small></button>`).join('');
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
  b.title = t('cifra.guiaSom');
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

/* ============================================================
   Ler a letra em voz alta (alternativa a ler na tela)

   Usa a voz do próprio aparelho (Web Speech API), do jeito combinado
   nas diretrizes: sem escolher voz pelo nome — só o idioma — para o
   celular usar o mecanismo que está nas Configurações dele (Google,
   Samsung, SherpaTTS...). Lê só a letra e o nome das partes; os
   acordes ficam de fora. A linha que está sendo lida fica marcada.
   ============================================================ */
let vozLendo = false, vozFila = [], vozRelogio = null;

function idiomaDaMusica(){
  /* música internacional é lida com voz em inglês */
  return /internacional|international/i.test((MUSICA && MUSICA.categoria) || '') ? 'en-US' : 'pt-BR';
}

function pararVoz(){
  vozLendo = false; vozFila = [];
  clearInterval(vozRelogio);
  try{ speechSynthesis.cancel(); }catch(e){}
  document.querySelectorAll('.l-lendo').forEach(e => e.classList.remove('l-lendo'));
  pintarBotaoVoz();
}

function pintarBotaoVoz(){
  const b = $('#btn-voz');
  if (!b) return;
  b.classList.toggle('ativo', vozLendo);
  b.setAttribute('aria-pressed', vozLendo);
  b.textContent = vozLendo ? '⏹' : '🗣';
  b.title = t(vozLendo ? 'cifra.vozParar' : 'cifra.voz');
  b.setAttribute('aria-label', b.title);
}

function falarProxima(){
  document.querySelectorAll('.l-lendo').forEach(e => e.classList.remove('l-lendo'));
  if (!vozLendo) return;
  const el = vozFila.shift();
  if (!el){ pararVoz(); return; }
  el.classList.add('l-lendo');
  if (!rolando) el.scrollIntoView({block:'center', behavior:'smooth'});
  const fala = new SpeechSynthesisUtterance(el.textContent.replace(/[\[\]]/g, '').trim());
  fala.lang = idiomaDaMusica();
  fala.rate = 0.95;
  fala.onend = ()=> falarProxima();
  fala.onerror = ()=> falarProxima();
  speechSynthesis.speak(fala);
}

function lerEmVozAlta(){
  if (vozLendo){ pararVoz(); return; }
  if (!('speechSynthesis' in window)){ alert(t('cifra.semVoz')); return; }
  /* uma linha de cada vez: frase curta não trava o Chrome do Android */
  vozFila = [...document.querySelectorAll('#cifra .l-letra, #cifra .l-secao')]
            .filter(el => el.textContent.trim());
  if (!vozFila.length) return;
  vozLendo = true;
  pintarBotaoVoz();
  try{ speechSynthesis.cancel(); }catch(e){}
  /* o Chrome derruba a fala colada no cancel(): espera um instante */
  setTimeout(falarProxima, 60);
  /* o Chrome do Android para sozinho em ~15 s sem isto */
  vozRelogio = setInterval(()=>{ try{ speechSynthesis.resume(); }catch(e){} }, 9000);
}

function iniciarVoz(){
  const b = $('#btn-voz');
  if (!b) return;
  b.onclick = lerEmVozAlta;
  pintarBotaoVoz();
  document.addEventListener('idioma-mudou', pintarBotaoVoz);
  /* saiu da página ou redesenhou a cifra (tom, letra maior): para a leitura */
  window.addEventListener('pagehide', pararVoz);
}
