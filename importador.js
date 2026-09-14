/* ============================================================
   importador.js — arruma uma cifra colada de outro site
   e monta o arquivo .txt pronto para o repositório.
   Tudo acontece dentro do navegador; nada é enviado a lugar nenhum.
   ============================================================ */

const $ = s => document.querySelector(s);
let INDICE = [];

iniciarTema();
carregarIndice().then(l => { INDICE = l; montarEscolhas(); }).catch(()=>{});

/* ---------- passo 1: escolher a música ---------- */
function montarEscolhas(){
  const pendentes = INDICE.filter(m => m.pendente)
    .sort((a,b)=> a.titulo.localeCompare(b.titulo,'pt'));
  $('#escolher').innerHTML = '<option value="">— música nova (preencher à mão) —</option>' +
    pendentes.map(m => `<option value="${escapar(m.id)}">${escapar(m.titulo)} — ${escapar(m.artista||'')}</option>`).join('');

  $('#lista-categorias').innerHTML =
    [...new Set(INDICE.map(m=>m.categoria).filter(Boolean))].sort()
      .map(c => `<option value="${escapar(c)}">`).join('');

  $('#escolher').onchange = ()=>{
    const m = INDICE.find(x => x.id === $('#escolher').value);
    if (!m) return;
    $('#titulo').value = m.titulo || '';
    $('#artista').value = m.artista || '';
    $('#categoria').value = m.categoria || '';
    $('#arquivo').value = (m.arquivo || m.id + '.txt');
    if (m.tom) $('#tom').value = m.tom;
  };
  $('#titulo').addEventListener('input', ()=>{
    if (!$('#escolher').value) $('#arquivo').value = apelido($('#titulo').value) + '.txt';
  });
}

/* "Se Esta Rua Fosse Minha" -> "se-esta-rua-fosse-minha" */
function apelido(t){
  return (t||'').normalize('NFD').replace(/[̀-ͯ]/g,'')
    .replace(/[^a-zA-Z0-9]+/g,'-').replace(/^-+|-+$/g,'').toLowerCase();
}

/* ---------- passo 2: arrumar o texto ---------- */

/* espaços esquisitos que vêm junto na cópia e estragam o alinhamento */
function normalizar(texto){
  return texto
    .replace(/\r\n?/g, '\n')
    .replace(/[   ]/g, ' ')     // espaços "duros"
    .replace(/[‐-―]/g, '-')          // travessões virando hífen
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .split('\n').map(expandirTabs).join('\n');
}
function expandirTabs(linha){
  let saida = '';
  for (const c of linha){
    if (c === '\t') saida += ' '.repeat(8 - (saida.length % 8));
    else saida += c;
  }
  return saida.replace(/\s+$/, '');
}

/* alguns sites escrevem o acorde no meio da letra: "Se esta [C]rua" */
function separarAcordesDeDentro(linha){
  if (!/\[[A-G][^\]]{0,10}\]/.test(linha)) return null;
  const semColchetes = linha.replace(/\[[^\]]*\]/g, '');
  if (!semColchetes.trim()) return null;              // era só um rótulo, tipo [Intro]

  let letra = '', acordes = '', i = 0;
  while (i < linha.length){
    if (linha[i] === '['){
      const fim = linha.indexOf(']', i);
      if (fim < 0) { letra += linha[i++]; continue; }
      const dentro = linha.slice(i+1, fim);
      if (ehAcorde(dentro)){
        if (acordes.length > letra.length) acordes += ' ';
        acordes = acordes.padEnd(letra.length, ' ') + dentro;
      }
      i = fim + 1;
      continue;
    }
    letra += linha[i++];
  }
  return acordes.trim() ? acordes + '\n' + letra : null;
}

function arrumar(texto){
  const linhas = normalizar(texto).split('\n');
  const saida = [];
  let convertidas = 0;

  linhas.forEach(linha=>{
    const separada = separarAcordesDeDentro(linha);
    if (separada){ saida.push(...separada.split('\n')); convertidas++; }
    else saida.push(linha);
  });

  /* tira linhas em branco demais e as das pontas */
  const limpo = saida.join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/^\n+/, '').replace(/\n+$/, '');

  const linhasFinais = analisarCifra(limpo);
  return {
    corpo: limpo,
    linhas: linhasFinais,
    convertidas,
    acordes: linhasFinais.filter(l => l.tipo === 'acordes').length,
    letras: linhasFinais.filter(l => l.tipo === 'letra').length
  };
}

/* o primeiro acorde costuma ser o tom da música */
function adivinharTom(linhas){
  for (const l of linhas){
    if (l.tipo !== 'acordes') continue;
    const p = l.texto.trim().split(/\s+/).find(ehAcorde);
    if (p) return p;
  }
  return '';
}

/* ---------- passo 3 e 4 ---------- */
let RESULTADO = null;

$('#processar').onclick = ()=>{
  const bruto = $('#entrada').value;
  if (!bruto.trim()){ $('#relatorio').textContent = 'Cole a cifra no quadro primeiro.'; return; }

  RESULTADO = arrumar(bruto);
  if (!$('#tom').value.trim()) $('#tom').value = adivinharTom(RESULTADO.linhas);
  if (!$('#arquivo').value.trim()) $('#arquivo').value = apelido($('#titulo').value || 'musica') + '.txt';

  $('#relatorio').textContent =
    `${RESULTADO.acordes} linhas de acorde · ${RESULTADO.letras} linhas de letra` +
    (RESULTADO.convertidas ? ` · ${RESULTADO.convertidas} linhas com acorde no meio da letra foram separadas` : '');

  mostrarPrevia();
  montarSaida();
  $('#passo3').hidden = false;
  $('#passo4').hidden = false;
  $('#passo3').scrollIntoView({behavior:'smooth', block:'start'});
};

function mostrarPrevia(){
  $('#previa').innerHTML = RESULTADO.linhas.map(l=>{
    if (l.tipo === 'vazia')  return '<span class="l-vazia"></span>';
    if (l.tipo === 'secao')  return `<span class="l-secao">[${escapar(l.texto)}]</span>`;
    if (l.tipo === 'acordes'){
      const rot = l.rotulo ? `<span class="l-secao" style="display:inline;margin:0">[${escapar(l.rotulo)}] </span>` : '';
      return rot + `<span class="l-acorde">${escapar(l.texto)}</span>`;
    }
    return `<span class="l-letra">${escapar(l.texto)}</span>`;
  }).join('\n');

  const usados = acordesDaMusica(RESULTADO.linhas, 0, false);
  $('#diagramas').innerHTML = usados.length
    ? `<div class="aviso">Acordes encontrados (${usados.length})</div>` + usados.map(a => diagramaSVG(a)).join('')
    : `<div class="aviso">Não encontrei nenhuma linha de acordes — confira se a cifra colou junto com a letra.</div>`;
}

function montarSaida(){
  const d = {
    titulo: $('#titulo').value.trim() || 'Sem título',
    artista: $('#artista').value.trim(),
    tom: $('#tom').value.trim(),
    capo: parseInt($('#capo').value,10) || 0,
    categoria: $('#categoria').value.trim(),
    ritmo: $('#ritmo').value.trim()
  };
  const cabecalho =
    `titulo: ${d.titulo}\n` +
    `artista: ${d.artista}\n` +
    `tom: ${d.tom}\n` +
    (d.capo ? `capo: ${d.capo}\n` : '') +
    `categoria: ${d.categoria}\n` +
    (d.ritmo ? `ritmo: ${d.ritmo}\n` : '');

  $('#saida').value = cabecalho + '---\n' + RESULTADO.corpo + '\n';

  const arquivo = $('#arquivo').value.trim() || 'musica.txt';
  $('#nome-arquivo').textContent = arquivo;

  const id = arquivo.replace(/\.txt$/i, '');
  const jaExiste = INDICE.find(m => m.id === id);

  if (jaExiste && jaExiste.pendente){
    $('#aviso-indice').innerHTML = `<p class="dica"><b>${escapar(d.titulo)}</b> já está no
      <b>indice.json</b>. Só abra o arquivo e apague a linha
      <b>"pendente": true,</b> do bloco dela — e o tom, se quiser deixar certinho:</p>`;
    $('#saida-json').value = `    "tom": "${d.tom}",\n    (apague a linha  "pendente": true,  deste bloco)`;
    mostrarBlocoJson(true);
  } else if (jaExiste){
    $('#aviso-indice').innerHTML = `<p class="dica">Essa música já está no <b>indice.json</b>
      e não está marcada como pendente. Não precisa mexer em nada.</p>`;
    $('#saida-json').value = '';
    mostrarBlocoJson(false);
  } else {
    $('#aviso-indice').innerHTML = `<p class="dica">Essa música ainda não está no <b>indice.json</b>.
      Abra o arquivo e cole este bloco antes do <b>]</b> do final,
      lembrando da vírgula no fim do bloco anterior:</p>`;
    $('#saida-json').value =
`  {
    "id": "${id}",
    "titulo": "${d.titulo}",
    "artista": "${d.artista}",
    "tom": "${d.tom}",
    "categoria": "${d.categoria}",
    "arquivo": "${arquivo}"
  }`;
    mostrarBlocoJson(true);
  }
}

function mostrarBlocoJson(mostrar){
  $('#saida-json').hidden = !mostrar;
  $('#copiar-json').parentElement.hidden = !mostrar;
}

/* ---------- botões ---------- */
function copiarDe(area, botao){
  area.select();
  try{ document.execCommand('copy'); }catch(e){}
  if (navigator.clipboard) navigator.clipboard.writeText(area.value).catch(()=>{});
  const antes = botao.textContent;
  botao.textContent = '✓ Copiado';
  setTimeout(()=> botao.textContent = antes, 1600);
}
$('#copiar').onclick = e => copiarDe($('#saida'), e.currentTarget);
$('#copiar-json').onclick = e => copiarDe($('#saida-json'), e.currentTarget);

$('#baixar').onclick = ()=>{
  const nome = $('#arquivo').value.trim() || 'musica.txt';
  const blob = new Blob([$('#saida').value], {type:'text/plain;charset=utf-8'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = nome;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(()=> URL.revokeObjectURL(a.href), 2000);
};

$('#limpar-tudo').onclick = ()=>{
  $('#entrada').value = '';
  $('#relatorio').textContent = '';
  $('#passo3').hidden = true;
  $('#passo4').hidden = true;
};
