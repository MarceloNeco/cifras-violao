/* ============================================================
   comum.js — coisas usadas em todas as páginas
   ============================================================ */

/* Versão do site. Ao publicar uma mudança, altere estas duas linhas:
   o número aparece no rodapé de todas as páginas. */
const VERSAO = '2.5';
const VERSAO_DATA = '2026-09-25';

/* assinatura com a versão e o link do aviso, no rodapé de cada página */
function montarRodape(){
  document.querySelectorAll('.rodape').forEach(r=>{
    if (r.querySelector('.assinatura')) return;
    r.insertAdjacentHTML('beforeend',
      `<div class="assinatura"><span data-i18n="rodape.versao">versão</span> ${VERSAO}` +
      ` · <span data-i18n-data="${VERSAO_DATA}">${VERSAO_DATA}</span>` +
      ` · <a href="#novidades" data-abre-novidades><span data-i18n="novidades.botao">Novidades</span></a>` +
      ` · <a href="#aviso" data-abre-aviso data-i18n="rodape.aviso">Aviso</a></div>`);
  });
  iniciarNovidades();
}

/* ============================================================
   Histórico de versões ("Novidades")
   A lista mora no versoes.json (a mais nova em cima), em PT e EN.
   Abre pelo link "Novidades" do rodapé e por um botão nas
   Configurações, logo abaixo da linha da versão.
   Enquanto a pessoa não abre a versão mais nova, o link ganha
   um selo "novo".
   ============================================================ */
const NOVIDADES_CHAVE = 'cifras:novidades-vista';
let janelaNovidades = null;

function jaViuNovidades(){
  try{ return localStorage.getItem(NOVIDADES_CHAVE) === VERSAO; }catch(e){ return true; }
}
function pintarSeloNovidades(){
  const novo = !jaViuNovidades();
  document.querySelectorAll('[data-abre-novidades]').forEach(a=>{
    a.classList.toggle('tem-novidade', novo);
  });
}

async function abrirNovidades(){
  const idioma = (typeof IDIOMA !== 'undefined' && IDIOMA === 'en') ? 'en' : 'pt';
  const txt = (chave, reserva) => (typeof t === 'function' ? t(chave) : reserva);
  const data = d => (typeof formatarData === 'function' ? formatarData(d) : d);

  if (!janelaNovidades){
    janelaNovidades = document.createElement('dialog');
    janelaNovidades.className = 'janela';
    janelaNovidades.setAttribute('aria-labelledby', 'titulo-novidades');
    document.body.appendChild(janelaNovidades);
    janelaNovidades.addEventListener('click', e=>{
      if (e.target === janelaNovidades || e.target.closest('.fechar-janela, [data-fecha-janela]'))
        janelaNovidades.close();
    });
  }

  let lista = [];
  try{
    const r = await fetch('versoes.json', {cache:'no-cache'});
    lista = (await r.json()).versoes || [];
  }catch(e){ lista = null; }

  const corpo = lista === null
    ? `<p>${escapar(txt('novidades.erro', 'Não consegui abrir a lista de versões.'))}</p>`
    : lista.map((v, i) => `
        <section class="versao-item">
          <h3>${txt('rodape.versao', 'versão')} ${escapar(v.versao)}
            ${i === 0 ? `<span class="selo-novo">${escapar(txt('novidades.novo', 'novo'))}</span>` : ''}
            <small>${escapar(data(v.data))}</small></h3>
          <ul>${(v[idioma] || v.pt || []).map(item => `<li>${escapar(item)}</li>`).join('')}</ul>
        </section>`).join('');

  janelaNovidades.innerHTML = `
    <button class="fechar-janela" aria-label="${escapar(txt('afinador.fechar', 'Fechar'))}">✕</button>
    <div class="janela-texto texto-legal">
      <h2 id="titulo-novidades">${escapar(txt('novidades.titulo', 'Novidades de cada versão'))}</h2>
      ${corpo}
    </div>
    <div class="janela-rodape">
      <button class="botao forte" data-fecha-janela>${escapar(txt('afinador.fechar', 'Fechar'))}</button>
    </div>`;

  if (janelaNovidades.showModal) janelaNovidades.showModal(); else janelaNovidades.setAttribute('open', '');
  try{ localStorage.setItem(NOVIDADES_CHAVE, VERSAO); }catch(e){}
  pintarSeloNovidades();
}

/* as Configurações são desenhadas pelo módulo das diretrizes (igual em
   todos os apps); aqui só penduramos o botão "Novidades" embaixo da
   linha da versão, sem mexer no diretrizes.js */
function botaoNovidadesNasConfiguracoes(){
  document.querySelectorAll('.dgo-mini').forEach(linha=>{
    if (!/Diretrizes/.test(linha.textContent)) return;
    if (linha.nextElementSibling && linha.nextElementSibling.matches('[data-abre-novidades]')) return;
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'dgo-b dgo-b2';
    b.setAttribute('data-abre-novidades', '');
    b.textContent = typeof t === 'function' ? t('novidades.titulo') : 'Novidades de cada versão';
    linha.insertAdjacentElement('afterend', b);
    pintarSeloNovidades();
  });
}

let novidadesProntas = false;
function iniciarNovidades(){
  if (novidadesProntas) return;
  novidadesProntas = true;
  document.addEventListener('click', e=>{
    const alvo = e.target.closest('[data-abre-novidades]');
    if (!alvo) return;
    e.preventDefault();
    abrirNovidades();
  });
  new MutationObserver(botaoNovidadesNasConfiguracoes)
    .observe(document.body, {childList:true, subtree:true});
  pintarSeloNovidades();
}

/* ============================================================
   A barra do topo, igual em todas as páginas.
   Cada página só diz quem ela é: <body data-pagina="cifra">.
   Assim o botão de idioma e o de conta aparecem em todo lugar
   sem precisar repetir o mesmo HTML seis vezes.
   ============================================================ */
const VIOLAO_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
    stroke-width="1.8" stroke-linecap="round">
    <path d="M11.5 12.5 19 5M17 3l4 4M6.5 21a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"/></svg>`;

function montarTopo(){
  const barra = document.querySelector('.topo .topo-interno');
  if (!barra || barra.dataset.pronta) return;
  const pagina = document.body.dataset.pagina || 'inicio';
  const naCifra = pagina === 'cifra';

  const elo = (nome, endereco, chave) =>
    `<a class="botao${pagina === nome ? ' ativo' : ''}" href="${endereco}" data-i18n="${chave}"></a>`;

  /* o nome do app: "Cifras" na cor do texto e "ONE" na cor de destaque,
     como nos outros apps da família (RiseONE, OmniLifeONE...).
     É nome próprio: não se traduz, por isso não leva data-i18n. */
  const nomeDoApp = `<span class="marca-nome">Cifras<span class="marca-one">ONE</span></span>`;

  /* ☰ fica à esquerda, como é o padrão nos apps de celular */
  barra.innerHTML = `
    <button class="botao icone abre-menu" data-botao-menu
            aria-expanded="false" aria-controls="menu-topo" aria-label="Menu">☰</button>
    <a class="marca" href="index.html">
      ${VIOLAO_SVG}${naCifra ? '<span data-i18n="topo.voltar"></span>' : nomeDoApp}
    </a>
    <div class="espaco"></div>
    ${naCifra ? `
      <button class="botao icone" id="btn-favorito" aria-pressed="false"
              data-i18n-title="cifra.favoritar">☆</button>
      <button class="botao icone some-no-palco" id="btn-compartilhar"
              data-i18n-title="cifra.compartilhar">⤴</button>
      <button class="botao icone" id="btn-afinador" data-i18n-title="cifra.afinador">🎵</button>` : ''}
    <button class="botao icone" data-abre-conta data-i18n-title="topo.conta">☺</button>
    <nav class="menu-topo" id="menu-topo">
      ${elo('acordes',  'acordes.html',  'topo.acordes')}
      ${elo('importar', 'importar.html', 'topo.importar')}
      ${elo('ocr',      'ocr.html',      'topo.foto')}
      <button class="botao" data-abre-instalar data-i18n="topo.instalar"></button>
      <div class="menu-icones">
        <button class="botao icone" data-abre-config
                data-i18n-title="topo.config" data-i18n-aria="topo.config">⚙</button>
        <button class="botao icone" data-botao-fundo data-i18n-title="topo.fundo">▨</button>
        <button class="botao icone" data-botao-tema data-i18n-title="topo.tema">☾</button>
      </div>
    </nav>`;
  barra.dataset.pronta = 'sim';

  /* Conta, Configurações e Instalar são do módulo das diretrizes
     (diretrizes.js). Aqui só existe o botão; quem abre a tela é ele. */
  barra.querySelector('[data-abre-conta]').addEventListener('click', ()=>{
    if (window.DGO) DGO.abrirLogin(); else location.href = 'index.html';
  });
  barra.querySelector('[data-abre-config]').addEventListener('click', ()=>{
    if (window.DGO) DGO.abrirConfiguracoes();
  });
  barra.querySelector('[data-abre-instalar]').addEventListener('click', ()=>{
    if (window.DGO && DGO.pwa) DGO.pwa.instalar();
  });

  const botaoMenu = barra.querySelector('[data-botao-menu]');
  const menu = barra.querySelector('#menu-topo');
  botaoMenu.addEventListener('click', e=>{
    e.stopPropagation();
    const abrir = !menu.classList.contains('aberto');
    menu.classList.toggle('aberto', abrir);
    botaoMenu.setAttribute('aria-expanded', abrir);
  });
  /* O menu fecha sozinho: ao tocar fora dele, depois de escolher qualquer
     coisa dentro dele (antes os botões ▨ e ☾ deixavam o menu aberto por
     cima da letra) e ao rolar a página. */
  const fecharMenu = ()=>{
    if (!menu.classList.contains('aberto')) return;
    menu.classList.remove('aberto');
    botaoMenu.setAttribute('aria-expanded', 'false');
  };
  document.addEventListener('click', e=>{
    if (!menu.contains(e.target) && !botaoMenu.contains(e.target)) fecharMenu();
  });
  menu.addEventListener('click', e=>{
    if (e.target.closest('button, a')) setTimeout(fecharMenu, 150);
  });
  /* só fecha numa rolagem de verdade: no celular a barra de endereço
     mexe alguns pixels sozinha e isso fechava o menu logo após abrir */
  let rolagemAoAbrir = 0;
  botaoMenu.addEventListener('click', ()=>{ rolagemAoAbrir = window.scrollY; });
  window.addEventListener('scroll', ()=>{
    if (Math.abs(window.scrollY - rolagemAoAbrir) > 40) fecharMenu();
  }, {passive:true});
  document.addEventListener('keydown', e=>{ if (e.key === 'Escape') fecharMenu(); });
}

/* ---------- tema claro / escuro ---------- */
const TEMA_CHAVE = 'cifras:tema';

function aplicarTema(tema){
  document.documentElement.dataset.tema = tema;
  try{ localStorage.setItem(TEMA_CHAVE, tema); }catch(e){}
  document.querySelectorAll('[data-botao-tema]').forEach(b=>{
    b.textContent = tema === 'escuro' ? '☀' : '☾';
    b.title = tema === 'escuro' ? 'Mudar para o modo claro' : 'Mudar para o modo escuro';
  });
}
function temaSalvo(){
  try{ return localStorage.getItem(TEMA_CHAVE); }catch(e){ return null; }
}
function iniciarTema(){
  montarTopo();
  const escuroNoSistema = window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches;
  aplicarTema(temaSalvo() || (escuroNoSistema ? 'escuro' : 'claro'));
  iniciarFundo();
  montarRodape();
  if (typeof iniciarIdioma === 'function') iniciarIdioma();
  document.querySelectorAll('[data-botao-tema]').forEach(b=>{
    b.addEventListener('click', ()=>{
      aplicarTema(document.documentElement.dataset.tema === 'escuro' ? 'claro' : 'escuro');
    });
  });
}

/* ---------- imagem de fundo ---------- */
const FUNDO_CHAVE = 'cifras:fundo';

function aplicarFundo(ligado){
  document.body.classList.toggle('com-fundo', ligado);
  try{ localStorage.setItem(FUNDO_CHAVE, ligado ? 'sim' : 'nao'); }catch(e){}
  document.querySelectorAll('[data-botao-fundo]').forEach(b=>{
    b.classList.toggle('ativo', ligado);
    b.title = ligado ? 'Tirar a imagem de fundo' : 'Colocar a imagem de fundo';
    b.setAttribute('aria-pressed', ligado);
  });
}
function iniciarFundo(){
  let guardado = null;
  try{ guardado = localStorage.getItem(FUNDO_CHAVE); }catch(e){}
  aplicarFundo(guardado !== 'nao');          // vem ligado, a não ser que você desligue
  document.querySelectorAll('[data-botao-fundo]').forEach(b=>{
    b.addEventListener('click', ()=> aplicarFundo(!document.body.classList.contains('com-fundo')));
  });
}

/* ---------- favoritos (ficam guardados no navegador) ---------- */
const FAV_CHAVE = 'cifras:favoritos';
function lerFavoritos(){
  try{ return new Set(JSON.parse(localStorage.getItem(FAV_CHAVE) || '[]')); }
  catch(e){ return new Set(); }
}
function gravarFavoritos(conjunto){
  try{ localStorage.setItem(FAV_CHAVE, JSON.stringify([...conjunto])); }catch(e){}
}
function alternarFavorito(id){
  const f = lerFavoritos();
  f.has(id) ? f.delete(id) : f.add(id);
  gravarFavoritos(f);
  return f.has(id);
}

/* ---------- ajudantes ---------- */
function semAcento(t){
  return (t||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase();
}
function escapar(t){
  return (t||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

/* ---------- índice das músicas ---------- */
async function carregarIndice(){
  const r = await fetch('indice.json', {cache:'no-cache'});
  if (!r.ok) throw new Error('Não consegui abrir o indice.json');
  const dados = await r.json();
  return Array.isArray(dados) ? dados : (dados.musicas || []);
}

/* ---------- leitura de um arquivo de cifra ----------
   O arquivo tem um cabeçalho, uma linha com --- e depois a cifra. */
function lerArquivoDeMusica(texto){
  const limpo = texto.replace(/\r\n?/g, '\n');
  const corte = limpo.indexOf('\n---');
  let cabecalho = '', corpo = limpo;
  if (corte >= 0){
    cabecalho = limpo.slice(0, corte);
    corpo = limpo.slice(limpo.indexOf('\n', corte + 1) + 1);
  }
  const dados = {};
  cabecalho.split('\n').forEach(linha=>{
    const m = /^([a-zA-ZçÇãáéíóúâêô_]+)\s*:\s*(.*)$/.exec(linha.trim());
    if (m) dados[semAcento(m[1])] = m[2].trim();
  });
  return {dados, corpo: corpo.replace(/\n+$/,'')};
}

/* ---------- separa a cifra em linhas classificadas ----------
   tipo: 'secao' | 'acordes' | 'letra' | 'vazia' */
function analisarCifra(corpo){
  const linhas = corpo.split('\n');
  return linhas.map(linha=>{
    if (!linha.trim()) return {tipo:'vazia', texto:''};

    /* [Intro], [Refrão], [Parte B] ... podem vir sozinhos ou com acordes na frente */
    let rotulo = null, resto = linha;
    const mr = /^(\s*)\[([^\]]{1,30})\](.*)$/.exec(linha);
    if (mr){ rotulo = mr[2]; resto = mr[3]; }
    if (rotulo && !resto.trim()) return {tipo:'secao', texto:rotulo};

    const pedacos = resto.trim().split(/\s+/);
    const candidatos = pedacos.filter(p => !RE_ENFEITE.test(p));
    const todosAcordes = candidatos.length > 0 && candidatos.every(ehAcorde);

    /* uma palavra sozinha que por acaso parece acorde continua sendo letra */
    const suspeita = candidatos.length === 1 && PALAVRAS_TRAICOEIRAS.has(candidatos[0]) && !rotulo;

    if (todosAcordes && !suspeita) return {tipo:'acordes', texto:resto, rotulo};
    if (rotulo) return {tipo:'letra', texto:linha};
    return {tipo:'letra', texto:linha};
  });
}

/* ---------- transpõe uma linha de acordes mantendo o alinhamento ----------
   Os acordes têm que continuar em cima da sílaba certa mesmo quando
   "C" vira "C#" (uma letra a mais). */
function transporLinhaDeAcordes(linha, semitons, usarBemol){
  const partes = [];
  const re = /(\S+)/g;
  let m;
  while ((m = re.exec(linha)) !== null) partes.push({inicio:m.index, texto:m[1]});

  let saida = '';
  partes.forEach(p=>{
    const novo = ehAcorde(p.texto) ? transporAcorde(p.texto, semitons, usarBemol) : p.texto;
    if (saida.length < p.inicio) saida += ' '.repeat(p.inicio - saida.length);
    else if (saida.length > 0) saida += ' ';   // nunca deixa dois acordes grudados
    saida += novo;
  });
  return saida;
}

/* lista, sem repetir, os acordes que aparecem na música */
function acordesDaMusica(linhas, semitons, usarBemol){
  const vistos = [];
  linhas.forEach(l=>{
    if (l.tipo !== 'acordes') return;
    l.texto.trim().split(/\s+/).forEach(p=>{
      if (!ehAcorde(p)) return;
      const a = transporAcorde(p, semitons, usarBemol);
      if (!vistos.includes(a)) vistos.push(a);
    });
  });
  return vistos;
}

/* ---------- links para ouvir / procurar a música ---------- */
function buscaDaMusica(m){
  const artista = /^dom[ií]nio p[uú]blico/i.test(m.artista || '') ? '' : (m.artista || '');
  return (m.titulo + ' ' + artista).trim();
}
function linksDaMusica(m){
  const q = encodeURIComponent(buscaDaMusica(m));
  return {
    spotify: 'https://open.spotify.com/search/' + q,
    youtube: 'https://www.youtube.com/results?search_query=' + q,
    cifra:   'https://www.google.com/search?q=' + encodeURIComponent('cifra ' + buscaDaMusica(m))
  };
}
