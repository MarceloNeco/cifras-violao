/* ============================================================
   anuncios.js — carrossel da faixa do topo e pop-ups de anúncio

   O módulo das diretrizes (diretrizes.js, igual em todos os apps)
   continua mandando na faixa: quando ela aparece, quando some,
   o × que fecha até o fim da sessão, quem não vê anúncio
   (assinante e anunciante). Na versão dele a faixa é só uma imagem
   parada ("<ANUNCIE AQUI>"). Este arquivo troca o conteúdo dela pelo
   carrossel com os outros apps do portfólio, igual aos outros apps:

     [ANÚNCIO em pé] · [carrossel andando para a esquerda] · [×]

   E acrescenta os pop-ups:
     - um ANTES do login (primeira página da sessão), app sorteado;
     - outro DEPOIS do login, de preferência outro app;
     - o × só libera depois de 3, 2, 1;
     - nunca por cima do modo celular, do afinador ou da tela de login.

   A lista vem do anuncios.json. Nada aqui mexe no diretrizes.js.
   ============================================================ */
(function(){
  const EU = 'cifras-violao';                 // o app nunca anuncia a si mesmo
  const CHAVE = 'cifras:anuncios:';           // prefixo do que fica guardado

  let LISTA = [], POPUP = [], CFG = {velocidade:55, popupAntesDoLogin:true, popupDepoisDoLogin:true};

  const idioma = () => (typeof IDIOMA !== 'undefined' && IDIOMA === 'en') ? 'en' : 'pt';
  const txt = (a, campo) => idioma() === 'en' ? (a[campo === 'pt' ? 'en' : 'en2'] || a[campo] || '') : (a[campo] || '');
  const tr = (chave, reserva) => (typeof t === 'function' ? t(chave) : reserva);
  const esc = s => String(s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  function semAnuncios(){
    try{ return !!(window.DGO && DGO.sessao && DGO.sessao().semAnuncios); }catch(e){ return false; }
  }

  /* exibições e cliques de cada anúncio, guardados no aparelho */
  function contar(id, tipo){
    try{
      const m = JSON.parse(localStorage.getItem(CHAVE + 'metricas') || '{}');
      m[id] = m[id] || {exibicoes:0, cliques:0};
      m[id][tipo] = (m[id][tipo] || 0) + 1;
      localStorage.setItem(CHAVE + 'metricas', JSON.stringify(m));
    }catch(e){}
  }

  function imagem(a, classe){
    const reserva = `<span class="${classe} cf-emoji">${esc(a.ic || '📣')}</span>`;
    if (!a.img) return reserva;
    /* sem internet ou imagem quebrada: fica o emoji */
    return `<img class="${classe}" src="${esc(a.img)}" alt="" loading="lazy"
             onerror="this.outerHTML=this.dataset.reserva" data-reserva="${esc(reserva)}">`;
  }

  /* ---------------- a faixa do topo ---------------- */
  function itemHTML(a){
    return `<a class="cf-item" href="${esc(a.url)}" target="_blank" rel="noopener" data-anuncio="${esc(a.id)}">
      ${imagem(a, 'cf-img')}
      <span class="cf-txt"><b>${esc(a.nome)}${a.breve ? ` <em>${esc(tr('anuncio.breve','em breve'))}</em>` : ''}</b>
      <small>${esc(txt(a, 'pt'))}</small></span></a>`;
  }

  function vestirFaixa(faixa){
    if (!faixa || !LISTA.length) return;
    const antiga = faixa.querySelector(':scope > a');
    if (antiga) antiga.remove();                // a imagem parada "<ANUNCIE AQUI>"
    let area = faixa.querySelector('.cf-carrossel');
    if (!area){
      area = document.createElement('div');
      area.className = 'cf-carrossel';
      faixa.insertBefore(area, faixa.firstChild);
      faixa.classList.add('cf-faixa');
    }
    const seq = LISTA.map(itemHTML).join('');
    area.innerHTML =
      `<span class="cf-tag">${esc(tr('anuncio.tag','ANÚNCIO'))}</span>
       <div class="cf-janela"><div class="cf-trilho">${seq}${seq}</div></div>`;   // duas voltas = laço sem emenda
    area.querySelectorAll('.cf-item').forEach(el=>
      el.addEventListener('click', ()=> contar(el.dataset.anuncio, 'cliques')));
    if (!vestirFaixa.contou){ vestirFaixa.contou = true; LISTA.forEach(a => contar(a.id, 'exibicoes')); }

    requestAnimationFrame(()=>{
      const trilho = area.querySelector('.cf-trilho');
      const metade = trilho.scrollWidth / 2;
      trilho.style.animationDuration = Math.max(8, metade / Math.max(20, +CFG.velocidade || 55)) + 's';
      acertarTopo(faixa.offsetHeight);
    });
  }

  /* a faixa mudou de altura: empurra a barra do topo do site igual
     o módulo faz (ele guarda a posição original em data-dgo-topo-original) */
  function acertarTopo(altura){
    document.documentElement.style.setProperty('--dgo-topo', altura + 'px');
    document.querySelectorAll('[data-dgo-topo-original]').forEach(n=>{
      n.style.top = `calc(${altura}px + ${n.dataset.dgoTopoOriginal || '0px'})`;
    });
    const b = document.body;
    if (b && b.dataset.dgoPadOriginal !== undefined)
      b.style.paddingTop = ((parseFloat(b.dataset.dgoPadOriginal) || 0) + altura) + 'px';
  }

  /* o módulo recria a faixa (troca de idioma, fecha tela cheia...):
     cada vez que ela nasce, vestimos de novo */
  function vigiarFaixa(){
    new MutationObserver(()=>{
      const f = document.querySelector('.dgo-banner');
      if (f && !f.querySelector('.cf-carrossel')) vestirFaixa(f);
    }).observe(document.body, {childList:true});
    const f = document.querySelector('.dgo-banner');
    if (f) vestirFaixa(f);
    document.addEventListener('dgo:idioma', ()=> setTimeout(()=>{
      const f2 = document.querySelector('.dgo-banner');
      if (f2) vestirFaixa(f2);
    }, 50));
    /* no toque, o carrossel para um pouco para dar tempo de ler */
    document.addEventListener('touchstart', e=>{
      const c = e.target.closest && e.target.closest('.cf-carrossel');
      if (c) c.classList.add('parado');
    }, {passive:true});
    document.addEventListener('touchend', ()=>{
      const c = document.querySelector('.cf-carrossel.parado');
      if (c) setTimeout(()=> c.classList.remove('parado'), 1500);
    }, {passive:true});
  }

  /* ---------------- pop-up ---------------- */
  function telaOcupada(){
    return document.body.classList.contains('modo-palco')
        || !!document.querySelector('#afinador[aberta], .dgo-modal, dialog[open], .cf-pop');
  }

  function sortear(){
    if (!POPUP.length) return null;
    let ultimo = null;
    try{ ultimo = sessionStorage.getItem(CHAVE + 'ultimo'); }catch(e){}
    const outros = POPUP.filter(a => a.id !== ultimo);
    const de = outros.length ? outros : POPUP;
    return de[Math.floor(Math.random() * de.length)];
  }

  function mostrarPopup(a){
    if (!a || semAnuncios() || telaOcupada()) return false;
    try{ sessionStorage.setItem(CHAVE + 'ultimo', a.id); }catch(e){}
    contar(a.id, 'exibicoes');

    let falta = 3, liberado = false;
    const fundo = document.createElement('div');
    fundo.className = 'cf-pop';
    fundo.setAttribute('role', 'dialog');
    fundo.setAttribute('aria-modal', 'true');
    fundo.setAttribute('aria-label', tr('anuncio.tag', 'ANÚNCIO'));
    fundo.innerHTML = `
      <div class="cf-pop-caixa">
        <div class="cf-pop-topo">
          <span class="cf-pop-selo">${esc(tr('anuncio.tag','ANÚNCIO'))}</span>
          <span class="cf-pop-aviso" aria-live="polite">${esc(tr('anuncio.fechaEm','Pode fechar em {n} s').replace('{n}', falta))}</span>
          <button class="cf-pop-x" type="button" disabled aria-label="${esc(tr('afinador.fechar','Fechar'))}">${falta}</button>
        </div>
        <div class="cf-pop-corpo">
          <div class="cf-pop-arte">${imagem(a, 'cf-pop-img')}</div>
          <div class="cf-pop-texto">
            <div class="cf-pop-nome">${esc(a.nome)}</div>
            <h2>${esc(txt(a, 'pt') || a.nome)}</h2>
            <p>${esc(txt(a, 'pt2'))}</p>
            <a class="botao forte" href="${esc(a.url)}" target="_blank" rel="noopener">${esc(tr('anuncio.conhecer','Conhecer'))} ↗</a>
          </div>
        </div>
      </div>`;
    document.body.appendChild(fundo);

    const x = fundo.querySelector('.cf-pop-x'), aviso = fundo.querySelector('.cf-pop-aviso');
    fundo.querySelector('.cf-pop-texto a').addEventListener('click', ()=> contar(a.id, 'cliques'));
    const fechar = ()=>{
      if (!liberado) return;
      fundo.remove();
      document.removeEventListener('keydown', teclado);
    };
    const teclado = e=>{ if (e.key === 'Escape') fechar(); };
    document.addEventListener('keydown', teclado);
    fundo.addEventListener('click', e=>{ if (e.target === fundo) fechar(); });

    /* 3, 2, 1 e só então o × funciona */
    const relogio = setInterval(()=>{
      falta--;
      if (falta > 0){
        x.textContent = falta;
        aviso.textContent = tr('anuncio.fechaEm','Pode fechar em {n} s').replace('{n}', falta);
        return;
      }
      clearInterval(relogio);
      liberado = true;
      x.disabled = false;
      x.textContent = '×';
      aviso.textContent = tr('anuncio.podeFechar','Pode fechar');
      x.onclick = fechar;
      x.focus();
    }, 1000);
    return true;
  }

  /* uma vez por sessão, em dois momentos */
  function umaVez(momento, atraso){
    let ja = null;
    try{ ja = sessionStorage.getItem(CHAVE + momento); }catch(e){}
    if (ja) return;
    setTimeout(function tentar(tentativas){
      if (semAnuncios()) return;
      /* tela ocupada (tocando no modo celular, login aberto): tenta mais tarde */
      if (telaOcupada()){ if ((tentativas || 0) < 20) setTimeout(()=> tentar((tentativas || 0) + 1), 3000); return; }
      if (mostrarPopup(sortear())){
        try{ sessionStorage.setItem(CHAVE + momento, '1'); }catch(e){}
      }
    }, atraso);
  }

  function logado(){
    try{ const s = DGO.sessao(); return !!(s && s.tipo && s.tipo !== 'visitante'); }catch(e){ return false; }
  }

  function ligarPopups(){
    if (CFG.popupAntesDoLogin && !logado()) umaVez('antes', 1800);
    if (CFG.popupDepoisDoLogin)
      document.addEventListener('dgo:entrou', ()=> umaVez('depois', 1500));
  }

  /* ---------------- começo ---------------- */
  async function iniciar(){
    try{
      const r = await fetch('anuncios.json', {cache:'no-cache'});
      const j = await r.json();
      const valido = a => a && a.id && a.url && a.url.indexOf(EU) < 0;
      LISTA = (j.banner || []).filter(valido);
      POPUP = (j.popup === 'mesmos' || !j.popup) ? LISTA : (j.popup || []).filter(valido);
      CFG = Object.assign(CFG, j.config || {});
    }catch(e){ return; }          // sem a lista, fica a faixa do módulo como está
    vigiarFaixa();
    ligarPopups();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
  else iniciar();

  window.CifrasAnuncios = { mostrarPopup: ()=> mostrarPopup(sortear()) };   // para a página de teste
})();
