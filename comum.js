/* ============================================================
   comum.js — coisas usadas em todas as páginas
   ============================================================ */

/* Versão do site. Ao publicar uma mudança, altere estas duas linhas:
   o número aparece no rodapé de todas as páginas. */
const VERSAO = '2.8.1';
const VERSAO_DATA = '2026-10-09';

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
   Camadas: o botão Voltar do celular fecha o que está aberto
   (menu ☰, afinador, modo celular) em vez de sair da página.
   Cada camada que abre ganha uma entrada no histórico; no
   Voltar, fecha só a camada de cima. Fechar pelo botão da tela
   também tira a entrada do histórico. Um ponto só no código.
   ============================================================ */
const Camadas = {
  pilha: [],
  ignorar: 0,
  depois: null,
  abrir(nome, fechar){
    if (this.pilha.some(c => c.nome === nome)) return;
    this.pilha.push({nome, fechar});
    try{ history.pushState({camada: nome}, ''); }catch(e){}
  },
  /* fecha a camada e as que estão por cima dela; 'depois' roda quando o
     histórico já voltou (history.go é assíncrono) */
  fechar(nome, depois){
    const i = this.pilha.findIndex(c => c.nome === nome);
    if (i < 0){ if (depois) depois(); return; }
    const n = this.pilha.length - i;
    this.pilha.splice(i);
    this.ignorar += 1;
    this.depois = depois || null;
    const socorro = setTimeout(()=>{ if (this.depois){ const d = this.depois; this.depois = null; d(); } }, 400);
    this._socorro = socorro;
    try{ history.go(-n); }catch(e){ this.ignorar -= 1; clearTimeout(socorro); if (depois) depois(); }
  },
  aberta(nome){ return this.pilha.some(c => c.nome === nome); }
};
window.addEventListener('popstate', ()=>{
  if (Camadas.ignorar > 0){
    Camadas.ignorar--;
    clearTimeout(Camadas._socorro);
    if (Camadas.depois){ const d = Camadas.depois; Camadas.depois = null; d(); }
    return;
  }
  const c = Camadas.pilha.pop();
  if (c) c.fechar();
});

/* ============================================================
   A barra do topo, igual em todas as páginas.
   Cada página só diz quem ela é: <body data-pagina="cifra">.
   Padrão dos apps SolverONE (diretriz de 02/Out/2026): ☰ na
   extrema esquerda, depois o nome do app (tocar = início);
   à direita, da extrema direita para a esquerda, só três itens
   fixos: 👤 perfil (foto ou iniciais), 📥 inbox (com contador)
   e 🔍 busca. Não há mais 🏠, ⚙ fixo nem PT|EN no topo: o idioma
   mora dentro de Configurações e o resto no menu do 👤.
   O ☰ abre uma gaveta lateral com todas as funções em grupos, e
   no celular há uma barra de baixo com os atalhos principais
   (menos na cifra, onde o rodapé é da barra de tocar).
   ============================================================ */
const VIOLAO_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
    stroke-width="1.8" stroke-linecap="round" aria-hidden="true">
    <path d="M11.5 12.5 19 5M17 3l4 4M6.5 21a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"/></svg>`;
const LUPA_SVG = `<svg class="icone-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    stroke-width="2" stroke-linecap="round" aria-hidden="true">
    <circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>`;
const INBOX_SVG = `<svg class="icone-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M4 13h4l2 3h4l2-3h4"/><path d="M6 5h12l2 8v6H4v-6l2-8Z"/></svg>`;
const PESSOA_SVG = `<svg class="icone-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    stroke-width="2" stroke-linecap="round" aria-hidden="true">
    <circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>`;

const PAGINAS = [
  {id:'inicio',   href:'index.html',    ico:'🏠', chave:'barra.inicio'},
  {id:'acordes',  href:'acordes.html',  ico:'🎼', chave:'barra.acordes'},
  {id:'importar', href:'importar.html', ico:'📋', chave:'barra.importar'},
  {id:'ocr',      href:'ocr.html',      ico:'📷', chave:'barra.foto'}
];

function montarTopo(){
  const barra = document.querySelector('.topo .topo-interno');
  if (!barra || barra.dataset.pronta) return;
  const pagina = document.body.dataset.pagina || 'inicio';
  const naCifra = pagina === 'cifra';
  const noInicio = pagina === 'inicio';

  /* o nome do app: "Cifras" na cor do texto e "ONE" na cor de destaque,
     como nos outros apps da família (RiseONE, OmniLifeONE...).
     É nome próprio: não se traduz, por isso não leva data-i18n. */
  const nomeDoApp = `<span class="marca-nome">Cifras<span class="marca-one">ONE</span></span>`;

  barra.innerHTML = `
    <button class="botao icone abre-menu" type="button" data-botao-menu
            aria-expanded="false" aria-controls="gaveta-menu" data-i18n-aria="menu.titulo" aria-label="Menu">☰</button>
    <a class="marca${naCifra ? ' marca-curta' : ''}" href="index.html" data-i18n-title="topo.inicio"
       data-i18n-aria="topo.marcaAria" aria-label="CifrasONE — ir para o início"${noInicio ? ' aria-current="page"' : ''}>
      ${VIOLAO_SVG}${nomeDoApp}
    </a>
    <div class="espaco"></div>
    ${naCifra ? `
      <button class="botao icone" type="button" id="btn-favorito" aria-pressed="false"
              data-i18n-title="cifra.favoritar" data-i18n-aria="cifra.favoritar">☆</button>
      <button class="botao icone some-no-palco" type="button" id="btn-compartilhar"
              data-i18n-title="cifra.compartilhar" data-i18n-aria="cifra.compartilhar">⤴</button>
      <button class="botao icone" type="button" id="btn-afinador"
              data-i18n-title="cifra.afinador" data-i18n-aria="cifra.afinador">🎵</button>` : ''}
    <button class="botao icone" type="button" data-abre-busca
            data-i18n-title="topo.busca" data-i18n-aria="topo.busca" aria-label="Buscar">${LUPA_SVG}</button>
    <button class="botao icone com-contador" type="button" data-abre-inbox aria-haspopup="dialog"
            data-i18n-title="topo.inbox" data-i18n-aria="topo.inbox" aria-label="Inbox">${INBOX_SVG}<span class="contador" data-inbox-contador hidden></span></button>
    <button class="botao icone perfil" type="button" data-abre-perfil aria-haspopup="menu"
            aria-expanded="false" aria-controls="menu-perfil" data-i18n-title="topo.perfil" aria-label="Perfil">
      <span class="avatar sem-foto" data-avatar>${PESSOA_SVG}</span><span class="perfil-apelido" data-apelido></span></button>
    ${menuPerfilHTML(pagina)}`;
  barra.dataset.pronta = 'sim';

  montarGaveta(pagina);
  if (!naCifra) montarBarraBaixo(pagina);
  montarPerfil();
  montarInbox();

  /* Conta, Configurações e Instalar são do módulo das diretrizes
     (diretrizes.js). Aqui só existe o botão; quem abre a tela é ele. */
  document.querySelectorAll('[data-abre-conta]').forEach(b => b.addEventListener('click', ()=>{
    if (window.DGO) DGO.abrirLogin(); else location.href = 'index.html';
  }));
  document.querySelectorAll('[data-abre-config]').forEach(b => b.addEventListener('click', ()=>{
    if (window.DGO) DGO.abrirConfiguracoes();
  }));
  document.querySelectorAll('[data-abre-instalar]').forEach(b => b.addEventListener('click', ()=>{
    if (window.DGO && DGO.pwa) DGO.pwa.instalar();
  }));
  document.querySelectorAll('[data-abre-assistone]').forEach(b => b.addEventListener('click', ()=>{
    if (window.DGO && DGO.assistente){ DGO.assistente.ligar(true); setTimeout(()=> DGO.assistente.abrir(), 250); }
  }));
  document.querySelectorAll('[data-abre-busca]').forEach(b => b.addEventListener('click', abrirBusca));
}

/* ---------- 🔍 busca ----------
   No Início a lupa vai direto para a caixa de busca das músicas; nas
   outras telas abre a busca do AssistONE (funções, telas e conteúdos,
   com o índice do diretrizes-config.js), que também leva ao Início. */
function abrirBusca(){
  const campo = document.querySelector('#busca, #entrada');
  if (campo){
    campo.scrollIntoView({block:'center', behavior:'smooth'});
    campo.focus({preventScroll:true});
    if (campo.select) campo.select();
    return;
  }
  if (window.DGO && DGO.assistente){
    if (!DGO.assistente.ligado()) DGO.assistente.ligar(true);
    setTimeout(()=> DGO.assistente.procurar(), 80);
  }else{
    location.href = 'index.html';
  }
}

/* ---------- 👤 perfil: identidade conectada + menu ----------
   O cabeçalho do menu mostra com qual identidade a pessoa está
   conectada (nome, apelido/e-mail, plano, desde quando e como entrou);
   depois vêm Configurações (onde mora o PT|EN), o Tema (toggle), os
   extras do app (imagem de fundo, instalar) e, por último, Sair. */
const DESDE_CHAVE = 'cifras:conectado-desde';

function menuPerfilHTML(){
  return `
    <div class="menu-perfil" id="menu-perfil" role="menu" data-i18n-aria="perfil.menu" aria-label="Menu do perfil">
      <div class="perfil-cabeca">
        <span class="avatar grande sem-foto" data-avatar>${PESSOA_SVG}</span>
        <div class="perfil-quem">
          <b data-perfil-nome></b>
          <small data-perfil-email></small>
          <small data-perfil-papel></small>
          <small data-perfil-desde></small>
        </div>
      </div>
      <button class="gaveta-item" type="button" role="menuitem" data-abre-config>
        <span class="ico">⚙</span><span><span data-i18n="perfil.config"></span><small data-i18n="perfil.configDica"></small></span></button>
      <button class="gaveta-item" type="button" role="menuitemcheckbox" aria-checked="false" data-botao-tema data-switch-tema>
        <span class="ico" data-ico-tema>☾</span><span data-i18n="perfil.temaEscuro"></span><span class="switch" aria-hidden="true"></span></button>
      <button class="gaveta-item" type="button" role="menuitemcheckbox" aria-pressed="false" data-botao-fundo>
        <span class="ico">▨</span><span data-i18n="perfil.fundo"></span><span class="switch" aria-hidden="true"></span></button>
      <button class="gaveta-item" type="button" role="menuitem" data-abre-instalar>
        <span class="ico">📲</span><span data-i18n="perfil.instalar"></span></button>
      <hr>
      <button class="gaveta-item entrar" type="button" role="menuitem" data-abre-conta hidden>
        <span class="ico">→</span><span data-i18n="perfil.entrar"></span></button>
      <button class="gaveta-item sair" type="button" role="menuitem" data-sair hidden>
        <span class="ico">⏻</span><span data-i18n="perfil.sair"></span></button>
    </div>`;
}

function sessaoAtual(){
  try{ return (window.DGO && DGO.sessao) ? DGO.sessao() : null; }catch(e){ return null; }
}
function iniciaisDe(nome){
  const partes = (nome || '').trim().split(/[\s._@-]+/).filter(Boolean);
  if (!partes.length) return '';
  return (partes[0][0] + (partes.length > 1 ? partes[partes.length - 1][0] : '')).toUpperCase();
}
function rotuloNivel(s){
  const tipo = s.tipo === 'admin' ? 'admin' : s.tipo === 'anunciante' ? 'anunciante' : (s.nivel || 'visitante');
  return t('perfil.nivel.' + tipo);
}

/* desenha o avatar no topo e o cabeçalho do menu a partir da sessão do módulo */
function pintarPerfil(){
  const s = sessaoAtual();
  const u = (s && s.usuario) || {};
  const conectado = !!(s && s.tipo);
  const nome = conectado ? (u.nome || u.apelido || u.email || t('perfil.visitante')) : t('perfil.visitante');
  const apelido = conectado ? (u.apelido ? '@' + u.apelido : '') : '';
  const email = conectado ? (u.email || '') : '';
  const papel = conectado ? rotuloNivel(s) : '';

  document.querySelectorAll('[data-avatar]').forEach(a=>{
    if (conectado && u.foto){
      a.innerHTML = `<img src="${escapar(u.foto).replace(/"/g, '&quot;')}" alt="">`;
      a.classList.remove('sem-foto');
    }else if (conectado && iniciaisDe(nome)){
      a.textContent = iniciaisDe(nome);
      a.classList.remove('sem-foto');
    }else{
      a.innerHTML = PESSOA_SVG;
      a.classList.add('sem-foto');
    }
  });
  const curto = conectado ? (u.apelido || nome.split(/\s+/)[0]) : t('perfil.visitante');
  document.querySelectorAll('[data-apelido]').forEach(el => el.textContent = curto);

  const bt = document.querySelector('[data-abre-perfil]');
  if (bt){
    const partes = [t('topo.perfil'), nome];
    if (apelido || email) partes.push([apelido, email].filter(Boolean).join(' · '));
    if (papel) partes.push(papel);
    if (!conectado) partes.push(t('perfil.entrar'));
    bt.setAttribute('aria-label', partes.join(' — '));
    bt.title = partes.join(' — ');
  }

  const menu = document.getElementById('menu-perfil');
  if (!menu) return;
  menu.querySelector('[data-perfil-nome]').textContent = nome;
  const linhaEmail = menu.querySelector('[data-perfil-email]');
  linhaEmail.textContent = [apelido, email].filter(Boolean).join(' · ') || (conectado ? '' : t('perfil.semConta'));
  menu.querySelector('[data-perfil-papel]').textContent = papel;
  let desde = '';
  if (conectado){
    let guardado = null;
    try{ guardado = localStorage.getItem(DESDE_CHAVE); }catch(e){}
    if (guardado){
      const d = new Date(guardado);
      if (!isNaN(d)) desde = t('perfil.desde', {d: formatarData(d) + ' ' + d.toTimeString().slice(0, 5)});
    }
    if (u.via) desde += (desde ? ' · ' : '') + t('perfil.via', {v: u.via === 'google' ? 'Google' : u.via});
  }
  menu.querySelector('[data-perfil-desde]').textContent = desde;
  menu.querySelector('[data-abre-conta]').hidden = conectado;
  menu.querySelector('[data-sair]').hidden = !conectado;
}

function montarPerfil(){
  const bt = document.querySelector('[data-abre-perfil]');
  const menu = document.getElementById('menu-perfil');
  if (!bt || !menu) return;

  function itens(){ return [...menu.querySelectorAll('[role^="menuitem"]')].filter(b => !b.hidden); }
  function abrirPerfil(abrir){
    if (abrir === menu.classList.contains('aberto')) return;
    if (abrir) pintarPerfil();
    menu.classList.toggle('aberto', abrir);
    bt.setAttribute('aria-expanded', String(abrir));
    if (abrir){
      Camadas.abrir('perfil', ()=> abrirPerfil(false));
      setTimeout(()=>{ const f = itens()[0]; if (f) f.focus({preventScroll:true}); }, 60);
    }else{
      Camadas.fechar('perfil');
      if (menu.contains(document.activeElement)) bt.focus({preventScroll:true});
    }
  }
  bt.addEventListener('click', ()=> abrirPerfil(!menu.classList.contains('aberto')));
  document.addEventListener('pointerdown', e=>{
    if (!menu.classList.contains('aberto')) return;
    if (menu.contains(e.target) || bt.contains(e.target)) return;
    abrirPerfil(false);
  });
  document.addEventListener('keydown', e=>{
    if (!menu.classList.contains('aberto')) return;
    if (e.key === 'Escape'){ e.preventDefault(); abrirPerfil(false); return; }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp'){
      const lista = itens(); const i = lista.indexOf(document.activeElement);
      if (!lista.length) return;
      e.preventDefault();
      lista[(i + (e.key === 'ArrowDown' ? 1 : lista.length - 1)) % lista.length].focus();
    }
  });
  /* escolher algo fecha o menu; os toggles (tema, fundo) ficam abertos para ver o efeito */
  menu.addEventListener('click', e=>{
    const alvo = e.target.closest('button');
    if (!alvo) return;
    if (alvo.matches('[data-botao-tema], [data-botao-fundo]')) return;
    setTimeout(()=> abrirPerfil(false), 80);
  });
  menu.querySelector('[data-sair]').addEventListener('click', ()=>{
    if (window.DGO && DGO.sair) DGO.sair();
  });

  document.addEventListener('dgo:entrou', ()=>{
    try{ localStorage.setItem(DESDE_CHAVE, new Date().toISOString()); }catch(e){}
    pintarPerfil();
  });
  document.addEventListener('dgo:saiu', ()=>{
    try{ localStorage.removeItem(DESDE_CHAVE); }catch(e){}
    pintarPerfil();
  });
  document.addEventListener('dgo:pronto', pintarPerfil);
  document.addEventListener('idioma-mudou', pintarPerfil);
  pintarPerfil();
}

/* ---------- 📥 inbox ----------
   Um lugar só para as mensagens: avisos do administrador da
   plataforma (recados.json na raiz, com início, fim e público),
   avisos do próprio app (a versão nova e os lembretes agendados
   pelo módulo). Lido/não lido e arquivado ficam no navegador;
   nada é apagado sozinho. O contador vai no botão e no ícone do
   app instalado (setAppBadge, pelo módulo). */
const INBOX_LIDAS = 'cifras:inbox-lidas';
const INBOX_ARQUIVO = 'cifras:inbox-arquivo';
let janelaInbox = null, inboxVerArquivo = false;

function lerConjunto(chave){
  try{ return new Set(JSON.parse(localStorage.getItem(chave) || '[]')); }catch(e){ return new Set(); }
}
function gravarConjunto(chave, c){
  try{ localStorage.setItem(chave, JSON.stringify([...c])); }catch(e){}
}
function textoRecado(r, campo){
  const idioma = (typeof IDIOMA !== 'undefined' && IDIOMA === 'en') ? 'en' : 'pt';
  const alt = {titulo:'title', texto:'text'}[campo] || campo;
  const bloco = r[idioma] || r.pt || {};
  return bloco[campo] || bloco[alt] || (r.pt && (r.pt[campo] || r.pt[alt])) || '';
}
function recadoParaMim(r, s){
  const nivel = String(r.nivel || r.publico || 'todos').toLowerCase();
  if (nivel === 'todos' || nivel === 'all' || nivel === 'cifras-violao' || nivel === 'cifrasone') return true;
  const meu = (s && s.nivel) || 'visitante';
  if (nivel === 'membros' || nivel === 'members' || nivel === 'membro') return meu === 'membro' || meu === 'premium';
  if (nivel === 'premium') return meu === 'premium';
  return false;
}

async function itensInbox(){
  const itens = [];
  const hoje = new Date().toISOString().slice(0, 10);
  const s = sessaoAtual();
  try{
    const r = await fetch('recados.json', {cache:'no-cache'});
    const lista = await r.json();
    (Array.isArray(lista) ? lista : (lista.recados || [])).forEach(rc=>{
      if (!rc || !rc.id) return;
      if (rc.inicio && rc.inicio > hoje) return;
      if (rc.fim && rc.fim < hoje) return;
      if (!recadoParaMim(rc, s)) return;
      itens.push({id:'recado:' + rc.id, data: rc.inicio || hoje, tipo:'admin',
                  titulo: textoRecado(rc, 'titulo'), texto: textoRecado(rc, 'texto'), link: rc.link || ''});
    });
  }catch(e){}
  itens.push({id:'versao:' + VERSAO, data: VERSAO_DATA, tipo:'app',
              titulo: t('inbox.versaoTitulo', {v: VERSAO}), texto: t('inbox.versaoTexto'), acao: abrirNovidades});
  try{
    (DGO.notificacoes.agenda() || []).forEach(n=>{
      itens.push({id:'notif:' + n.id, data: (n.quando || '').slice(0, 10), tipo:'app',
                  titulo: n.titulo || t('inbox.lembrete'), texto: n.texto || '', link: n.url || '', hora: n.quando});
    });
  }catch(e){}
  return itens.sort((a, b)=> (b.data || '').localeCompare(a.data || ''));
}

async function contarInbox(){
  const lidas = lerConjunto(INBOX_LIDAS), arq = lerConjunto(INBOX_ARQUIVO);
  const itens = await itensInbox();
  const n = itens.filter(i => !lidas.has(i.id) && !arq.has(i.id)).length;
  document.querySelectorAll('[data-inbox-contador]').forEach(c=>{
    c.textContent = n > 9 ? '9+' : String(n);
    c.hidden = n === 0;
  });
  document.querySelectorAll('[data-abre-inbox]').forEach(b=>{
    const base = t('topo.inbox');
    b.setAttribute('aria-label', n ? base + ' — ' + t('inbox.naoLidas', {n}) : base);
  });
  try{ if (window.DGO && DGO.notificacoes) DGO.notificacoes.distintivo(n); }catch(e){}
  return n;
}

async function abrirInbox(){
  if (!janelaInbox){
    janelaInbox = document.createElement('dialog');
    janelaInbox.className = 'janela';
    janelaInbox.setAttribute('aria-labelledby', 'titulo-inbox');
    document.body.appendChild(janelaInbox);
    janelaInbox.addEventListener('click', e=>{
      if (e.target === janelaInbox || e.target.closest('.fechar-janela, [data-fecha-janela]')) janelaInbox.close();
    });
    janelaInbox.addEventListener('close', contarInbox);
  }
  const lidas = lerConjunto(INBOX_LIDAS), arq = lerConjunto(INBOX_ARQUIVO);
  const todos = await itensInbox();
  const itens = todos.filter(i => arq.has(i.id) === inboxVerArquivo);
  const naoLidas = todos.filter(i => !lidas.has(i.id) && !arq.has(i.id)).length;
  const data = d => (typeof formatarData === 'function' ? formatarData(d) : d);

  const corpo = itens.length ? itens.map(i => `
      <article class="inbox-item${lidas.has(i.id) ? '' : ' nova'}" data-id="${escapar(i.id)}">
        <div class="tipo">${escapar(t(i.tipo === 'admin' ? 'inbox.admin' : 'inbox.app'))} · ${escapar(data(i.data))}</div>
        <h3>${escapar(i.titulo)}</h3>
        ${i.texto ? `<p>${escapar(i.texto)}</p>` : ''}
        <div class="acoes">
          ${i.acao ? `<button class="botao forte" type="button" data-inbox-abrir>${escapar(t('inbox.abrir'))}</button>` : ''}
          ${i.link ? `<a class="botao forte" href="${escapar(i.link).replace(/"/g, '&quot;')}" target="_blank" rel="noopener">${escapar(t('inbox.abrir'))} ↗</a>` : ''}
          ${lidas.has(i.id) ? `<span class="lida">✓ ${escapar(t('inbox.jaLida'))}</span>`
                            : `<button class="botao" type="button" data-inbox-lida>${escapar(t('inbox.lida'))}</button>`}
          <button class="botao" type="button" data-inbox-arquivar>${escapar(t(inboxVerArquivo ? 'inbox.desarquivar' : 'inbox.arquivar'))}</button>
        </div>
      </article>`).join('')
    : `<p class="vazio">${escapar(t(inboxVerArquivo ? 'inbox.arquivoVazio' : 'inbox.vazio'))}</p>`;

  janelaInbox.innerHTML = `
    <button class="fechar-janela" aria-label="${escapar(t('geral.fechar'))}">✕</button>
    <div class="janela-texto texto-legal">
      <h2 id="titulo-inbox">${escapar(t('inbox.titulo'))}</h2>
      <p class="contagem" aria-live="polite">${escapar(naoLidas ? t('inbox.naoLidas', {n: naoLidas}) : t('inbox.tudoLido'))}</p>
      <div class="modos">
        <button class="etiqueta" type="button" data-inbox-modo="caixa" aria-pressed="${!inboxVerArquivo}">${escapar(t('inbox.caixa'))}</button>
        <button class="etiqueta" type="button" data-inbox-modo="arquivo" aria-pressed="${inboxVerArquivo}">${escapar(t('inbox.arquivadas'))} (${arq.size})</button>
      </div>
      <div class="inbox-lista">${corpo}</div>
    </div>
    <div class="janela-rodape">
      ${naoLidas ? `<button class="botao" type="button" data-inbox-todas>${escapar(t('inbox.todasLidas'))}</button> ` : ''}
      <button class="botao forte" type="button" data-fecha-janela>${escapar(t('geral.fechar'))}</button>
    </div>`;

  janelaInbox.querySelectorAll('[data-inbox-modo]').forEach(b => b.addEventListener('click', ()=>{
    inboxVerArquivo = b.dataset.inboxModo === 'arquivo'; abrirInbox();
  }));
  const acha = el => todos.find(i => i.id === el.closest('.inbox-item').dataset.id);
  janelaInbox.querySelectorAll('[data-inbox-lida]').forEach(b => b.addEventListener('click', ()=>{
    lidas.add(acha(b).id); gravarConjunto(INBOX_LIDAS, lidas); abrirInbox();
  }));
  janelaInbox.querySelectorAll('[data-inbox-arquivar]').forEach(b => b.addEventListener('click', ()=>{
    const id = acha(b).id;
    if (inboxVerArquivo) arq.delete(id); else { arq.add(id); lidas.add(id); gravarConjunto(INBOX_LIDAS, lidas); }
    gravarConjunto(INBOX_ARQUIVO, arq); abrirInbox();
  }));
  janelaInbox.querySelectorAll('[data-inbox-abrir]').forEach(b => b.addEventListener('click', ()=>{
    const i = acha(b); lidas.add(i.id); gravarConjunto(INBOX_LIDAS, lidas);
    janelaInbox.close(); if (i.acao) i.acao();
  }));
  janelaInbox.querySelectorAll('a[href]').forEach(a => a.addEventListener('click', ()=>{
    lidas.add(acha(a).id); gravarConjunto(INBOX_LIDAS, lidas);
  }));
  const todas = janelaInbox.querySelector('[data-inbox-todas]');
  if (todas) todas.addEventListener('click', ()=>{
    todos.forEach(i => lidas.add(i.id)); gravarConjunto(INBOX_LIDAS, lidas); abrirInbox();
  });

  if (!janelaInbox.open){
    if (janelaInbox.showModal) janelaInbox.showModal(); else janelaInbox.setAttribute('open', '');
  }
  contarInbox();
}

function montarInbox(){
  document.querySelectorAll('[data-abre-inbox]').forEach(b => b.addEventListener('click', abrirInbox));
  document.addEventListener('idioma-mudou', contarInbox);
  document.addEventListener('dgo:entrou', contarInbox);
  document.addEventListener('dgo:saiu', contarInbox);
  contarInbox();
}

/* ---------- gaveta lateral (☰) ---------- */
function montarGaveta(pagina){
  if (document.getElementById('gaveta-menu')) return;
  const item = (p, chave, ico) =>
    `<a class="gaveta-item${pagina === p.id ? ' atual' : ''}" href="${p.href}"${pagina === p.id ? ' aria-current="page"' : ''}>
       <span class="ico">${ico || p.ico}</span><span data-i18n="${chave}"></span></a>`;
  const [inicio, acordes, importar, ocr] = PAGINAS;
  const gaveta = document.createElement('div');
  gaveta.className = 'gaveta-menu';
  gaveta.id = 'gaveta-menu';
  gaveta.setAttribute('aria-hidden', 'true');
  gaveta.innerHTML = `
    <div class="gaveta-fundo" data-fecha-menu></div>
    <nav class="gaveta-painel" data-i18n-aria="menu.titulo" aria-label="Menu" tabindex="-1">
      <div class="gaveta-topo">
        <span class="marca"><span class="marca-nome">Cifras<span class="marca-one">ONE</span></span></span>
        <button class="botao icone" type="button" data-fecha-menu data-i18n-aria="menu.fechar" aria-label="Fechar">✕</button>
      </div>
      <div class="gaveta-grupo">
        <h3 data-i18n="menu.tocar"></h3>
        ${item(inicio, 'menu.cifras')}
        ${item(acordes, 'menu.acordes')}
        ${pagina === 'cifra' ? `<button class="gaveta-item" type="button" data-abre-afinador><span class="ico">🎵</span><span data-i18n="menu.afinador"></span></button>
        <button class="gaveta-item" type="button" data-abre-compartilhar><span class="ico">⤴</span><span data-i18n="menu.compartilhar"></span></button>` : ''}
      </div>
      <div class="gaveta-grupo">
        <h3 data-i18n="menu.trazer"></h3>
        ${item(importar, 'menu.importar')}
        ${item(ocr, 'menu.foto')}
      </div>
      <div class="gaveta-grupo">
        <h3 data-i18n="menu.config"></h3>
        <button class="gaveta-item" type="button" data-abre-config><span class="ico">⚙</span><span data-i18n="topo.config"></span></button>
        <button class="gaveta-item" type="button" data-abre-inbox-menu><span class="ico">📥</span><span data-i18n="menu.inbox"></span></button>
        <button class="gaveta-item" type="button" data-botao-tema><span class="ico" data-ico-tema>☾</span><span data-i18n="menu.tema"></span></button>
        <button class="gaveta-item" type="button" data-botao-fundo aria-pressed="false"><span class="ico">▨</span><span data-i18n="menu.fundo"></span><span class="marca-check" aria-hidden="true">✓</span></button>
        <button class="gaveta-item" type="button" data-abre-instalar><span class="ico">📲</span><span data-i18n="menu.instalar"></span></button>
      </div>
      <div class="gaveta-grupo">
        <h3 data-i18n="menu.ajuda"></h3>
        <button class="gaveta-item" type="button" data-abre-assistone><span class="ico">💡</span><span data-i18n="menu.assistone"></span></button>
        <a class="gaveta-item" href="#novidades" data-abre-novidades><span class="ico">🆕</span><span data-i18n="menu.novidades"></span></a>
        <a class="gaveta-item${pagina === 'aviso' ? ' atual' : ''}" href="aviso.html"><span class="ico">⚖</span><span data-i18n="menu.aviso"></span></a>
        <a class="gaveta-item" href="../" target="_blank" rel="noopener"><span class="ico">🧭</span><span data-i18n="menu.portal"></span> ↗</a>
      </div>
    </nav>`;
  document.body.appendChild(gaveta);

  const botaoMenu = document.querySelector('[data-botao-menu]');
  const painel = gaveta.querySelector('.gaveta-painel');

  function abrirGaveta(abrir){
    if (abrir === gaveta.classList.contains('aberta')) return;
    gaveta.classList.toggle('aberta', abrir);
    gaveta.setAttribute('aria-hidden', String(!abrir));
    if (botaoMenu) botaoMenu.setAttribute('aria-expanded', String(abrir));
    if (abrir){
      Camadas.abrir('menu', ()=> abrirGaveta(false));
      setTimeout(()=>{ (gaveta.querySelector('.gaveta-item.atual') || painel).focus({preventScroll:true}); }, 60);
    }else{
      Camadas.fechar('menu');
      if (botaoMenu) botaoMenu.focus({preventScroll:true});
    }
  }
  if (botaoMenu) botaoMenu.addEventListener('click', ()=> abrirGaveta(!gaveta.classList.contains('aberta')));
  gaveta.querySelectorAll('[data-fecha-menu]').forEach(el => el.addEventListener('click', ()=> abrirGaveta(false)));
  document.addEventListener('keydown', e=>{
    if (e.key === 'Escape' && gaveta.classList.contains('aberta')) abrirGaveta(false);
  });

  /* escolher algo dentro da gaveta: fecha primeiro (tirando a entrada do
     histórico) e só depois navega, para o Voltar não voltar ao menu aberto */
  gaveta.addEventListener('click', e=>{
    const alvo = e.target.closest('a, button');
    if (!alvo || alvo.hasAttribute('data-fecha-menu')) return;
    if (alvo.matches('[data-botao-tema], [data-botao-fundo]')) return; // visuais: fica aberto para ver o efeito
    if (alvo.tagName === 'A' && alvo.getAttribute('href') && !alvo.hasAttribute('data-abre-novidades') && alvo.target !== '_blank'){
      e.preventDefault();
      const href = alvo.getAttribute('href');
      gaveta.classList.remove('aberta');
      Camadas.fechar('menu', ()=>{ location.href = href; });
      return;
    }
    setTimeout(()=> abrirGaveta(false), 120);
  });
  const afinador = gaveta.querySelector('[data-abre-afinador]');
  if (afinador) afinador.addEventListener('click', ()=>{
    setTimeout(()=>{ const b = document.getElementById('btn-afinador'); if (b) b.click(); }, 300);
  });
  const compartilhar = gaveta.querySelector('[data-abre-compartilhar]');
  if (compartilhar) compartilhar.addEventListener('click', ()=>{
    setTimeout(()=>{ const b = document.getElementById('btn-compartilhar'); if (b) b.click(); }, 300);
  });
  const inbox = gaveta.querySelector('[data-abre-inbox-menu]');
  if (inbox) inbox.addEventListener('click', ()=> setTimeout(abrirInbox, 300));
}

/* ---------- barra de baixo (celular) ---------- */
function montarBarraBaixo(pagina){
  if (document.querySelector('.barra-baixo')) return;
  const nav = document.createElement('nav');
  nav.className = 'barra-baixo';
  nav.setAttribute('data-i18n-aria', 'menu.atalhos');
  nav.setAttribute('aria-label', 'Atalhos');
  nav.innerHTML = PAGINAS.map(p =>
    `<a href="${p.href}"${pagina === p.id ? ' class="atual" aria-current="page"' : ''}>
       <span class="ico" aria-hidden="true">${p.ico}</span><span data-i18n="${p.chave}"></span></a>`).join('');
  document.body.appendChild(nav);
  document.body.classList.add('tem-barra-baixo');
}

/* ---------- tema claro / escuro ---------- */
const TEMA_CHAVE = 'cifras:tema';

function aplicarTema(tema){
  document.documentElement.dataset.tema = tema;
  try{ localStorage.setItem(TEMA_CHAVE, tema); }catch(e){}
  document.querySelectorAll('[data-botao-tema]').forEach(b=>{
    const ico = b.querySelector('[data-ico-tema]') || b;
    ico.textContent = tema === 'escuro' ? '☀' : '☾';
    b.title = tema === 'escuro' ? t('tema.paraClaro') : t('tema.paraEscuro');
    if (b.hasAttribute('data-switch-tema')) b.setAttribute('aria-checked', String(tema === 'escuro'));
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
    b.title = ligado ? t('fundo.tirar') : t('fundo.por');
    b.setAttribute('aria-pressed', String(ligado));
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
