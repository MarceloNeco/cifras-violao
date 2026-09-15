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

/* o primeiro acorde costuma indicar o tom — mas o tom é só a nota
   (maior ou menor), sem as sétimas e nonas do acorde */
function adivinharTom(linhas){
  for (const l of linhas){
    if (l.tipo !== 'acordes') continue;
    const p = l.texto.trim().split(/\s+/).find(ehAcorde);
    if (!p) continue;
    const a = lerAcorde(p);
    if (!a) continue;
    const tipo = normalizarSufixo(a.sufixo);
    const menor = ['m','m7','m6','dim7','m7b5'].includes(tipo);
    return a.nota + (menor ? 'm' : '');
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
  const jaExiste = INDICE.some(m => m.id === id);

  /* monta o indice.json inteiro, já atualizado — é mais seguro trocar o
     arquivo todo do que caçar uma linha no meio de centenas */
  $('#saida-json').value = indiceAtualizado([{...d, id, arquivo}]);

  $('#aviso-indice').innerHTML = `<p class="dica">
    A cifra já funciona só com o arquivo do item <b>a</b> — esta parte é só para
    ${jaExiste ? 'tirar o selo <b>sem cifra</b> da lista e gravar o tom' : 'a música aparecer na lista'}.
    <br><br>
    <b>Não edite o indice.json linha por linha</b> — ele tem centenas de linhas e é
    fácil quebrar. Faça assim: baixe o arquivo pronto aqui embaixo e suba por
    <b>Add file → Upload files</b>, que ele substitui o antigo.
    Ou, se preferir colar: abra o <b>indice.json</b> no GitHub, clique no lápis,
    aperte <b>Ctrl+A</b> para marcar tudo e cole por cima.</p>`;
  mostrarBlocoJson(true);
}

function mostrarBlocoJson(mostrar){
  $('#saida-json').hidden = !mostrar;
  $('#copiar-json').parentElement.hidden = !mostrar;
}

/* devolve o indice.json inteiro com as músicas da lista já em dia */
function indiceAtualizado(musicas){
  const porId = new Map(musicas.map(m => [m.id, m]));
  const saida = INDICE.map(m => {
    const nova = porId.get(m.id);
    if (!nova) return m;
    porId.delete(m.id);
    const copia = {...m, titulo: nova.titulo, artista: nova.artista,
                   categoria: nova.categoria, tom: nova.tom, arquivo: nova.arquivo};
    if (nova.capo) copia.capo = nova.capo; else delete copia.capo;
    delete copia.pendente;
    return copia;
  });
  porId.forEach(n => saida.push({id:n.id, titulo:n.titulo, artista:n.artista,
                                 tom:n.tom, categoria:n.categoria, arquivo:n.arquivo}));
  return JSON.stringify(saida, null, 2) + '\n';
}

/* ---------- a fila (fica guardada no navegador) ---------- */
const FILA_CHAVE = 'cifras:fila';
let FILA = [];
try{ FILA = JSON.parse(localStorage.getItem(FILA_CHAVE) || '[]'); }catch(e){ FILA = []; }

function gravarFila(){
  try{ localStorage.setItem(FILA_CHAVE, JSON.stringify(FILA)); }catch(e){
    alert('A fila ficou grande demais para o navegador guardar. Baixe o zip do que já tem e recomece a fila.');
  }
  desenharFila();
}

function desenharFila(){
  $('#passo5').hidden = FILA.length === 0;
  $('#contador-fila').textContent = FILA.length === 1 ? '1 música' : FILA.length + ' músicas';
  $('#fila').innerHTML = FILA.length === 0
    ? '<li class="fila-vazia">A fila está vazia.</li>'
    : FILA.map((f,i)=>`
      <li>
        <span class="nome">${escapar(f.titulo)} <small>${escapar(f.artista||'')}</small></span>
        <span class="arquivo">${escapar(f.arquivo)}</span>
        <button class="tirar" data-i="${i}" title="Tirar da fila" aria-label="Tirar ${escapar(f.titulo)} da fila">✕</button>
      </li>`).join('');
  $('#fila').querySelectorAll('.tirar').forEach(b=>{
    b.onclick = ()=>{ FILA.splice(+b.dataset.i, 1); gravarFila(); };
  });
}
desenharFila();

/* monta o texto do arquivo .txt a partir da ficha + corpo já arrumado */
function textoDoArquivo(d, corpo){
  return `titulo: ${d.titulo}\n` +
         `artista: ${d.artista || ''}\n` +
         `tom: ${d.tom || ''}\n` +
         (d.capo ? `capo: ${d.capo}\n` : '') +
         `categoria: ${d.categoria || ''}\n` +
         (d.ritmo ? `ritmo: ${d.ritmo}\n` : '') +
         '---\n' + corpo + '\n';
}

function porNaFila(item){
  const igual = FILA.findIndex(f => f.id === item.id);
  if (igual >= 0) FILA[igual] = item; else FILA.push(item);
}

$('#add-fila').onclick = ()=>{
  if (!RESULTADO) return;
  const arquivo = $('#arquivo').value.trim() || 'musica.txt';
  const item = {
    id: arquivo.replace(/\.txt$/i, ''),
    arquivo,
    titulo: $('#titulo').value.trim() || 'Sem título',
    artista: $('#artista').value.trim(),
    categoria: $('#categoria').value.trim(),
    tom: $('#tom').value.trim(),
    capo: parseInt($('#capo').value,10) || 0,
    conteudo: $('#saida').value
  };
  porNaFila(item);
  gravarFila();

  /* limpa para a próxima música */
  $('#entrada').value = '';
  $('#relatorio').textContent = `“${item.titulo}” entrou na fila. Pode colar a próxima.`;
  $('#titulo').value = ''; $('#artista').value = ''; $('#tom').value = '';
  $('#capo').value = 0; $('#ritmo').value = ''; $('#arquivo').value = '';
  $('#escolher').value = '';
  $('#passo3').hidden = true; $('#passo4').hidden = true; $('#um-so').hidden = true;
  RESULTADO = null;
  $('#entrada').scrollIntoView({behavior:'smooth', block:'center'});
};

$('#ver-um').onclick = ()=>{ $('#um-so').hidden = !$('#um-so').hidden; };

$('#baixar-zip').onclick = ()=>{
  if (!FILA.length) return;
  const arquivos = FILA.map(f => ({nome: f.arquivo, texto: f.conteudo}));
  arquivos.push({nome:'indice.json', texto: indiceAtualizado(FILA)});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(montarZip(arquivos));
  a.download = 'cifras-para-subir.zip';
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(()=> URL.revokeObjectURL(a.href), 3000);
};

$('#esvaziar').onclick = ()=>{
  if (!confirm('Tirar todas as ' + FILA.length + ' músicas da fila? Isso não dá para desfazer.')) return;
  FILA = []; gravarFila();
};

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

$('#baixar-json').onclick = ()=>{
  const blob = new Blob([$('#saida-json').value], {type:'application/json;charset=utf-8'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'indice.json';
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(()=> URL.revokeObjectURL(a.href), 2000);
};

$('#limpar-tudo').onclick = ()=>{
  $('#entrada').value = '';
  $('#relatorio').textContent = '';
  $('#passo3').hidden = true;
  $('#passo4').hidden = true;
};


/* ============================================================
   Modo "um arquivo com várias cifras"
   ============================================================ */

function trocarModo(varias){
  $('#bloco-varias').hidden = !varias;
  document.querySelectorAll('.bloco-uma').forEach(e=>{
    if (varias) e.hidden = true;
    else if (e.id === 'passo3' || e.id === 'passo4') e.hidden = !RESULTADO;
    else e.hidden = false;
  });
  $('#modo-uma').setAttribute('aria-pressed', !varias);
  $('#modo-varias').setAttribute('aria-pressed', varias);
}
$('#modo-uma').onclick = ()=> trocarModo(false);
$('#modo-varias').onclick = ()=> trocarModo(true);

/* compara títulos ignorando acento, pontuação e maiúscula */
function chaveTitulo(t){
  return semAcento(t||'').replace(/[^a-z0-9]+/g, '');
}

/* lê o cabeçalho "=== Título | Artista | Categoria | tom: G | capo: 2" */
function lerCabecalhoLote(linha){
  const partes = linha.split('|').map(p => p.trim());
  const d = {titulo: partes.shift() || '', artista:'', categoria:'', tom:'', capo:0, ritmo:''};
  const soltas = [];
  partes.forEach(p=>{
    const m = /^([a-zA-ZçÇ]+)\s*:\s*(.*)$/.exec(p);
    if (!m){ soltas.push(p); return; }
    const campo = semAcento(m[1]), valor = m[2].trim();
    if (campo === 'tom') d.tom = valor;
    else if (campo === 'capo') d.capo = parseInt(valor,10) || 0;
    else if (campo === 'ritmo') d.ritmo = valor;
    else if (campo.startsWith('cat')) d.categoria = valor;
    else if (campo.startsWith('art')) d.artista = valor;
    else soltas.push(p);
  });
  if (soltas[0] && !d.artista) d.artista = soltas[0];
  if (soltas[1] && !d.categoria) d.categoria = soltas[1];
  return d;
}

/* separa o arquivo grande em músicas */
function separarLote(texto){
  const linhas = texto.replace(/\r\n?/g,'\n').split('\n');
  const blocos = [];
  let atual = null;
  linhas.forEach(linha=>{
    const m = /^\s*={3,}\s*(.+?)\s*$/.exec(linha);
    if (m){
      atual = {cabecalho: m[1], corpo: []};
      blocos.push(atual);
      return;
    }
    if (atual) atual.corpo.push(linha);
  });
  return blocos;
}

$('#processar-varias').onclick = ()=>{
  const bruto = $('#entrada-varias').value;
  const blocos = separarLote(bruto);
  const relato = $('#relatorio-varias');

  if (!blocos.length){
    relato.innerHTML = `<p class="vazio aviso-cifra"><strong>Não achei nenhuma marca de separação</strong>
      Cada música precisa começar numa linha com <b>===</b> seguida do título.
      Clique em <b>Ver o modelo</b> para ver um exemplo.</p>`;
    return;
  }

  const entraram = [], vazias = [];
  blocos.forEach(b=>{
    const d = lerCabecalhoLote(b.cabecalho);
    const arrumado = arrumar(b.corpo.join('\n'));
    if (!arrumado.corpo.trim() || !arrumado.acordes){ vazias.push(d.titulo || '(sem título)'); return; }

    /* casa com a lista do site pelo título */
    const conhecida = INDICE.find(m => chaveTitulo(m.titulo) === chaveTitulo(d.titulo));
    if (conhecida){
      d.artista   = d.artista   || conhecida.artista  || '';
      d.categoria = d.categoria || conhecida.categoria || '';
    }
    if (!d.tom) d.tom = adivinharTom(arrumado.linhas);

    const id = conhecida ? conhecida.id : apelido(d.titulo);
    const arquivo = (conhecida && conhecida.arquivo) ? conhecida.arquivo : id + '.txt';

    porNaFila({id, arquivo, titulo: d.titulo, artista: d.artista, categoria: d.categoria,
               tom: d.tom, capo: d.capo, conteudo: textoDoArquivo(d, arrumado.corpo)});
    entraram.push({titulo: d.titulo, tom: d.tom, acordes: arrumado.acordes,
                   conhecida: !!conhecida, arquivo});
  });

  gravarFila();

  relato.innerHTML = `
    <p class="dica"><b>${entraram.length}</b> ${entraram.length === 1 ? 'música entrou' : 'músicas entraram'} na fila.</p>
    <ul class="fila">
      ${entraram.map(e=>`<li>
        <span class="nome">${escapar(e.titulo)}
          <small>tom ${escapar(e.tom || '?')} · ${e.acordes} linhas de acorde
          ${e.conhecida ? '' : ' · <b>não estava na sua lista, entrou como música nova</b>'}</small></span>
        <span class="arquivo">${escapar(e.arquivo)}</span></li>`).join('')}
    </ul>
    ${vazias.length ? `<p class="dica"><b>Fora:</b> ${vazias.map(escapar).join(', ')} —
       não encontrei linhas de acorde nesses blocos.</p>` : ''}`;

  $('#passo5').scrollIntoView({behavior:'smooth', block:'start'});
};

$('#modelo-varias').onclick = ()=>{
  $('#entrada-varias').value =
`=== Peixe Vivo
[Intro] G  D7  G

 G                 D7
Como pode um peixe vivo
      D7           G
Viver fora da água fria

=== O Cravo e a Rosa | Domínio público | Infantil | tom: C

 C                    G7
O cravo brigou com a rosa
                      C
Debaixo de uma sacada
`;
};

/* abrir um arquivo do computador (aceita texto salvo em UTF-8 ou no padrão do Windows) */
$('#arquivo-varias').onchange = async e=>{
  const f = e.target.files[0];
  if (!f) return;
  const dados = new Uint8Array(await f.arrayBuffer());
  let texto;
  try{ texto = new TextDecoder('utf-8', {fatal:true}).decode(dados); }
  catch(erro){ texto = new TextDecoder('windows-1252').decode(dados); }
  $('#entrada-varias').value = texto;
  $('#nome-lote').textContent = f.name + ' — ' + Math.round(f.size/1024) + ' KB';
};
