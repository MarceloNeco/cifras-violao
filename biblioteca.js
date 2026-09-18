/* ============================================================
   biblioteca.js — a página inicial: busca, categorias e favoritos
   ============================================================ */

let TODAS = [];
let categoriaAtual = 'Todas';

/* as quatro primeiras categorias são fixas: a etiqueta muda de
   idioma, mas o nome usado por dentro do código continua o mesmo */
const ESPECIAIS = {
  'Todas': 'lista.todas', 'Prontas': 'lista.prontas',
  'Sem cifra': 'lista.semCifra', 'Favoritas': 'lista.favoritas'
};
function nomeDaCategoria(c){ return ESPECIAIS[c] ? t(ESPECIAIS[c]) : c; }
let termo = '';

const elLista = document.getElementById('lista');
const elFiltros = document.getElementById('filtros');
const elBusca = document.getElementById('busca');
const elLimpar = document.getElementById('limpar');
const elContagem = document.getElementById('contagem');

iniciarTema();

carregarIndice()
  .then(musicas=>{
    TODAS = musicas.map(m => ({
      ...m,
      _busca: semAcento([m.titulo, m.artista, m.categoria, m.tom, (m.buscar||'')].join(' '))
    }));
    montarFiltros();
    desenhar();
    conferirArquivos();
  })
  .catch(erro=>{
    elLista.innerHTML = `<div class="vazio"><strong>${t('lista.erroTitulo')}</strong>
      ${escapar(erro.message)}<br><br>${t('lista.erroAjuda')}</div>`;
  });

function montarFiltros(){
  const categorias = [...Object.keys(ESPECIAIS),
    ...[...new Set(TODAS.map(m => m.categoria).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'pt'))];
  elFiltros.innerHTML = categorias.map(c =>
    `<button class="etiqueta" data-cat="${escapar(c)}" aria-pressed="${c===categoriaAtual}">${escapar(nomeDaCategoria(c))}</button>`
  ).join('');
  elFiltros.querySelectorAll('.etiqueta').forEach(b=>{
    b.addEventListener('click', ()=>{
      categoriaAtual = b.dataset.cat;
      elFiltros.querySelectorAll('.etiqueta').forEach(x =>
        x.setAttribute('aria-pressed', x.dataset.cat === categoriaAtual));
      desenhar();
    });
  });
}

function filtrar(){
  const favoritos = lerFavoritos();
  const alvo = semAcento(termo).trim();
  return TODAS.filter(m=>{
    if (categoriaAtual === 'Favoritas' && !favoritos.has(m.id)) return false;
    if (categoriaAtual === 'Prontas' && m.pendente) return false;
    if (categoriaAtual === 'Sem cifra' && !m.pendente) return false;
    if (!ESPECIAIS[categoriaAtual] && m.categoria !== categoriaAtual) return false;
    if (!alvo) return true;
    return alvo.split(/\s+/).every(pedaco => m._busca.includes(pedaco));
  }).sort((a,b)=> (a.titulo||'').localeCompare(b.titulo||'', 'pt'));
}

function desenhar(){
  const favoritos = lerFavoritos();
  const achadas = filtrar();

  elContagem.textContent = achadas.length === 0 ? '' :
    achadas.length === 1 ? t('lista.uma') : t('lista.varias', {n: achadas.length});

  if (!achadas.length){
    elLista.innerHTML = `<div class="vazio">
      <strong>${t('lista.vazioTitulo')}</strong>
      ${categoriaAtual === 'Favoritas' ? t('lista.vazioFav') : t('lista.vazioOutro')}</div>`;
    return;
  }

  elLista.innerHTML = achadas.map(m => `
    <div class="cartao${m.pendente ? ' pendente' : ''}">
      <button class="estrela" data-id="${escapar(m.id)}"
              aria-pressed="${favoritos.has(m.id)}"
              aria-label="${t('lista.favoritar')} ${escapar(m.titulo)}">${favoritos.has(m.id) ? '★' : '☆'}</button>
      <a class="info" href="cifra.html?m=${encodeURIComponent(m.id)}">
        <div class="titulo">${escapar(m.titulo)}</div>
        <div class="artista">${escapar(m.artista || '')}${m.categoria ? ' · ' + escapar(m.categoria) : ''}</div>
      </a>
      ${m.pendente ? `<span class="selo">${t('lista.selo')}</span>`
                   : (m.tom ? `<span class="tom">${escapar(m.tom)}</span>` : '')}
    </div>`).join('');

  elLista.querySelectorAll('.estrela').forEach(b=>{
    b.addEventListener('click', ()=>{
      const agora = alternarFavorito(b.dataset.id);
      b.setAttribute('aria-pressed', agora);
      b.textContent = agora ? '★' : '☆';
      if (categoriaAtual === 'Favoritas') desenhar();
    });
  });
}

elBusca.addEventListener('input', ()=>{
  termo = elBusca.value;
  elLimpar.style.display = termo ? 'block' : 'none';
  desenhar();
});
elLimpar.addEventListener('click', ()=>{
  elBusca.value = ''; termo = ''; elLimpar.style.display = 'none';
  elBusca.focus(); desenhar();
});
document.addEventListener('keydown', e=>{
  if (e.key === '/' && document.activeElement !== elBusca){ e.preventDefault(); elBusca.focus(); }
});


/* ------------------------------------------------------------
   Confere, em segundo plano, quais das músicas marcadas como
   pendentes já têm arquivo de cifra no repositório. Assim o selo
   "sem cifra" some sozinho quando você sobe o .txt, sem precisar
   editar o indice.json.
   ------------------------------------------------------------ */
const CACHE_CHAVE = 'cifras:existem';
const CACHE_VALIDADE = 30 * 60 * 1000;   // meia hora

function lerCache(){
  try{
    const g = JSON.parse(localStorage.getItem(CACHE_CHAVE) || '{}');
    if (!g.quando || Date.now() - g.quando > CACHE_VALIDADE) return {};
    return g.itens || {};
  }catch(e){ return {}; }
}
function gravarCache(itens){
  try{ localStorage.setItem(CACHE_CHAVE, JSON.stringify({quando: Date.now(), itens})); }catch(e){}
}

async function conferirArquivos(){
  const cache = lerCache();
  if (!TODAS.some(m => m.pendente)) return;
  const faltando = TODAS.filter(m => m.pendente && cache[m.id] === undefined);

  /* o que já está no cache vale na hora */
  let mudou = false;
  TODAS.forEach(m => { if (m.pendente && cache[m.id]) { m.pendente = false; mudou = true; } });
  if (mudou){ montarFiltros(); desenhar(); }
  if (!faltando.length) return;

  /* de 6 em 6 para não abrir 60 pedidos de uma vez */
  const fila = faltando.slice();
  const trabalhar = async ()=>{
    while (fila.length){
      const m = fila.shift();
      const nome = m.arquivo || (m.id + '.txt');
      let existe = false;
      try{
        const r = await fetch(nome, {method:'HEAD'});
        existe = r.ok;
      }catch(e){}
      cache[m.id] = existe;
      if (existe) m.pendente = false;
    }
  };
  await Promise.all(Array.from({length:6}, trabalhar));
  gravarCache(cache);
  montarFiltros();
  desenhar();
}


/* trocou o idioma: as etiquetas e os recados são refeitos */
document.addEventListener('idioma-mudou', ()=>{
  if (!TODAS.length) return;
  montarFiltros();
  desenhar();
});
