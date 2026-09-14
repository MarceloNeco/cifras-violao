/* ============================================================
   dicionario.js — a página de consulta de acordes
   ============================================================ */

const NOTAS_BOTAO = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
const TIPOS_BOTAO = [
  {sufixo:'',       nome:'maior'},
  {sufixo:'m',      nome:'menor'},
  {sufixo:'7',      nome:'7'},
  {sufixo:'m7',     nome:'m7'},
  {sufixo:'7M',     nome:'7M'},
  {sufixo:'6',      nome:'6'},
  {sufixo:'m6',     nome:'m6'},
  {sufixo:'9',      nome:'9'},
  {sufixo:'sus4',   nome:'sus4'},
  {sufixo:'sus2',   nome:'sus2'},
  {sufixo:'º',      nome:'dim'},
  {sufixo:'m7(b5)', nome:'meio-dim'},
  {sufixo:'+',      nome:'aum'}
];
/* graus do campo harmônico maior */
const GRAUS = [
  {passo:0,  sufixo:'',       grau:'I'},
  {passo:2,  sufixo:'m',      grau:'ii'},
  {passo:4,  sufixo:'m',      grau:'iii'},
  {passo:5,  sufixo:'',       grau:'IV'},
  {passo:7,  sufixo:'7',      grau:'V7'},
  {passo:9,  sufixo:'m',      grau:'vi'},
  {passo:11, sufixo:'m7(b5)', grau:'vii'}
];
const TONS_CAMPO = ['C','G','D','A','E','B','F#','Db','Ab','Eb','Bb','F'];

let notaEscolhida = 'C', tipoEscolhido = '';

const $ = s => document.querySelector(s);
iniciarTema();
montarBotoes();
montarCampoHarmonico();

/* o acorde pode vir pela barra de endereço: acordes.html?a=Am7 */
const pedido = new URLSearchParams(location.search).get('a');
mostrar(pedido || 'C');

function montarBotoes(){
  $('#notas').innerHTML = NOTAS_BOTAO.map(n =>
    `<button class="etiqueta" data-nota="${n}">${n}</button>`).join('');
  $('#tipos').innerHTML = TIPOS_BOTAO.map(t =>
    `<button class="etiqueta" data-tipo="${escapar(t.sufixo)}">${t.nome}</button>`).join('');

  $('#notas').querySelectorAll('[data-nota]').forEach(b=>
    b.onclick = ()=>{ notaEscolhida = b.dataset.nota; mostrar(notaEscolhida + tipoEscolhido); });
  $('#tipos').querySelectorAll('[data-tipo]').forEach(b=>
    b.onclick = ()=>{ tipoEscolhido = b.dataset.tipo; mostrar(notaEscolhida + tipoEscolhido); });

  $('#entrada').addEventListener('input', e=>{
    const t = e.target.value.trim();
    if (t) mostrar(t, true);
  });

  const sel = $('#tom-campo');
  sel.innerHTML = TONS_CAMPO.map(t => `<option value="${t}">${t}</option>`).join('');
  sel.onchange = montarCampoHarmonico;
}

function marcarBotoes(texto){
  const a = lerAcorde(texto);
  if (!a) return;
  notaEscolhida = a.nota;
  tipoEscolhido = a.sufixo;
  const tipoNormal = normalizarSufixo(a.sufixo);
  $('#notas').querySelectorAll('[data-nota]').forEach(b=>
    b.setAttribute('aria-pressed', VALOR_NOTA[b.dataset.nota] === VALOR_NOTA[a.nota]));
  $('#tipos').querySelectorAll('[data-tipo]').forEach(b=>
    b.setAttribute('aria-pressed', normalizarSufixo(b.dataset.tipo) === tipoNormal));
}

function mostrar(texto, veioDeDigitacao){
  const caixa = $('#resultado');
  const posicoes = ehAcorde(texto) ? opcoesDoAcorde(texto) : [];

  if (!posicoes.length){
    caixa.hidden = false;
    caixa.innerHTML = `<p class="vazio"><strong>Não reconheci “${escapar(texto)}”</strong>
      Escreva a nota em letra (C, D, E, F, G, A, B) e o tipo depois: <b>Am7</b>, <b>C7M</b>, <b>F#m</b>, <b>G/B</b>.</p>`;
    return;
  }

  marcarBotoes(texto);
  if (!veioDeDigitacao) $('#entrada').value = texto;

  const notas = notasDoAcorde(texto);
  caixa.hidden = false;
  caixa.innerHTML = `
    <div class="cabeca-acorde">
      <div>
        <h2>${escapar(texto)}</h2>
        <p class="porextenso">${escapar(nomePorExtenso(texto))}</p>
      </div>
      <button class="botao forte" id="ouvir">▶ Ouvir</button>
    </div>
    ${notas.length ? `<p class="notas-acorde">Notas: ${notas.map(n=>`<b>${escapar(n)}</b>`).join(' · ')}</p>` : ''}
    <div class="posicoes">
      ${posicoes.slice(0,3).map((p,i)=>`
        <figure data-pos="${i}">
          <div class="lugar-desenho">${diagramaSVG(texto, 118, p)}</div>
          <figcaption>${i===0 ? 'Posição mais fácil' : (i+1) + 'ª posição'}${p.base>1 ? ' · a partir da ' + p.base + 'ª casa' : ''}</figcaption>
        </figure>`).join('')}
    </div>
    <p class="dica">Os números dentro das bolinhas são os dedos:
       <b>1</b> indicador, <b>2</b> médio, <b>3</b> anular, <b>4</b> mínimo.
       A barra laranja é a pestana.</p>`;

  caixa.querySelectorAll('figure').forEach((fig, i)=>{
    fig.onclick = ()=> tocarPosicao(posicoes[i]);
  });
  $('#ouvir').onclick = ()=> tocarPosicao(posicoes[0]);
}

function montarCampoHarmonico(){
  const tom = $('#tom-campo') ? $('#tom-campo').value || 'C' : 'C';
  const base = VALOR_NOTA[tom];
  const bemol = tom.includes('b');
  const acordes = GRAUS.map(g => ({
    nome: (bemol ? BEMOIS : SUSTENIDOS)[(base + g.passo) % 12] + g.sufixo,
    grau: g.grau
  }));
  $('#campo-harmonico').innerHTML = acordes.map(a =>
    `<a class="grau" href="acordes.html?a=${encodeURIComponent(a.nome)}">
       ${diagramaSVG(a.nome)}<span class="etiqueta-grau">${a.grau}</span>
     </a>`).join('');
}
