/* ============================================================
   biblioteca.js — a página inicial: busca, categorias e favoritos
   ============================================================ */

let TODAS = [];
let categoriaAtual = 'Todas';
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
  })
  .catch(erro=>{
    elLista.innerHTML = `<div class="vazio"><strong>Não consegui carregar as músicas</strong>
      ${escapar(erro.message)}<br><br>
      Se você abriu o arquivo direto do computador (com dois cliques), isso é normal:
      o navegador bloqueia a leitura dos arquivos. Publique no GitHub Pages que funciona.</div>`;
  });

function montarFiltros(){
  const categorias = ['Todas', 'Favoritas',
    ...[...new Set(TODAS.map(m => m.categoria).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'pt'))];
  elFiltros.innerHTML = categorias.map(c =>
    `<button class="etiqueta" data-cat="${escapar(c)}" aria-pressed="${c===categoriaAtual}">${escapar(c)}</button>`
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
    if (categoriaAtual !== 'Todas' && categoriaAtual !== 'Favoritas' && m.categoria !== categoriaAtual) return false;
    if (!alvo) return true;
    return alvo.split(/\s+/).every(pedaco => m._busca.includes(pedaco));
  }).sort((a,b)=> (a.titulo||'').localeCompare(b.titulo||'', 'pt'));
}

function desenhar(){
  const favoritos = lerFavoritos();
  const achadas = filtrar();

  elContagem.textContent = achadas.length === 0 ? '' :
    achadas.length === 1 ? '1 música' : `${achadas.length} músicas`;

  if (!achadas.length){
    elLista.innerHTML = `<div class="vazio">
      <strong>Nenhuma música encontrada</strong>
      ${categoriaAtual === 'Favoritas'
        ? 'Toque na estrelinha de uma música para guardá-la aqui.'
        : 'Tente outra palavra ou mude a categoria.'}</div>`;
    return;
  }

  elLista.innerHTML = achadas.map(m => `
    <div class="cartao">
      <button class="estrela" data-id="${escapar(m.id)}"
              aria-pressed="${favoritos.has(m.id)}"
              aria-label="Favoritar ${escapar(m.titulo)}">${favoritos.has(m.id) ? '★' : '☆'}</button>
      <a class="info" href="cifra.html?m=${encodeURIComponent(m.id)}">
        <div class="titulo">${escapar(m.titulo)}</div>
        <div class="artista">${escapar(m.artista || '')}${m.categoria ? ' · ' + escapar(m.categoria) : ''}</div>
      </a>
      ${m.tom ? `<span class="tom">${escapar(m.tom)}</span>` : ''}
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
