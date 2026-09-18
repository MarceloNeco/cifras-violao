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

/* algumas cifras vêm com um cabeçalho de 2 ou 3 linhas antes da música:
   TÍTULO / Artista / Tom: X. Isso vira ficha, não faz parte da cifra. */
function separarCabecalhoSolto(texto){
  const linhas = texto.split('\n');
  const ficha = {};
  let corte = 0;
  for (let i = 0; i < Math.min(6, linhas.length); i++){
    const t = (linhas[i]||'').trim();
    if (!t) continue;
    const mTom = /^Tom:\s*(\S+)/i.exec(t);
    if (mTom){
      ficha.tom = mTom[1];
      const anteriores = linhas.slice(0, i).map(l=>l.trim()).filter(Boolean);
      if (anteriores.length >= 2){ ficha.titulo = anteriores[anteriores.length-2]; ficha.artista = anteriores[anteriores.length-1]; }
      else if (anteriores.length === 1){ ficha.titulo = anteriores[0]; }
      corte = i + 1;
      break;
    }
    if (/^\[/.test(t) || ehAcorde(t.split(/\s+/)[0])) break;   // já começou a cifra
  }
  return {ficha, corpo: linhas.slice(corte).join('\n')};
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

  const separado = separarCabecalhoSolto(bruto);
  if (separado.ficha.titulo && !$('#titulo').value.trim()) $('#titulo').value = separado.ficha.titulo;
  if (separado.ficha.artista && !$('#artista').value.trim()) $('#artista').value = separado.ficha.artista;
  if (separado.ficha.tom && !$('#tom').value.trim()) $('#tom').value = separado.ficha.tom;

  RESULTADO = arrumar(separado.corpo);
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
      d.titulo    = conhecida.titulo;                       // grafia certa, da sua lista
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

/* abrir um arquivo do computador: .txt (UTF-8 ou padrão do Windows) ou .pdf */
$('#arquivo-varias').onchange = async e=>{
  const f = e.target.files[0];
  if (!f) return;
  const aviso = $('#nome-lote');

  if (/\.pdf$/i.test(f.name) || f.type === 'application/pdf'){
    aviso.textContent = 'Abrindo o PDF…';
    try{
      const r = await pdfParaFormatoLote(f, (feita, total)=>{
        aviso.textContent = `Lendo o PDF… página ${feita} de ${total}`;
      });
      $('#entrada-varias').value = r.texto;
      aviso.textContent = r.quantas
        ? `${f.name} — ${r.paginas} páginas, ${r.quantas} músicas encontradas. Confira e mande para a fila.`
        : `${f.name} — li o PDF, mas não reconheci nenhuma música. Ele precisa ter o título, o artista e uma linha "Tom:" antes de cada cifra.`;
    }catch(erro){
      aviso.textContent = erro.message;
    }
    return;
  }

  const dados = new Uint8Array(await f.arrayBuffer());
  let texto;
  try{ texto = new TextDecoder('utf-8', {fatal:true}).decode(dados); }
  catch(erro){ texto = new TextDecoder('windows-1252').decode(dados); }
  $('#entrada-varias').value = texto;
  aviso.textContent = f.name + ' — ' + Math.round(f.size/1024) + ' KB';
};

/* ============================================================
   Conferir a lista
   Compara os arquivos .txt que estão no repositório com o que o
   indice.json conhece, e monta o índice corrigido. Serve para
   recuperar músicas que sumiram da página inicial porque a linha
   delas no índice se perdeu.
   ============================================================ */

function ondeEstaORepositorio(){
  const dono = location.hostname.split('.')[0];
  const repo = location.pathname.split('/').filter(Boolean)[0];
  if (!dono || !repo || !location.hostname.endsWith('github.io')) return null;
  return {dono, repo};
}

async function lerFichaDoArquivo(nome){
  try{
    const r = await fetch(nome, {cache:'no-cache'});
    if (!r.ok) return null;
    const {dados} = lerArquivoDeMusica(await r.text());
    return dados;
  }catch(e){ return null; }
}

$('#conferir').onclick = async ()=>{
  const recado = $('#recado-conferir');
  const caixa = $('#resultado-conferir');
  const onde = ondeEstaORepositorio();
  caixa.innerHTML = '';

  if (!onde){
    recado.textContent = 'Isto só funciona com o site publicado no GitHub Pages.';
    return;
  }

  recado.textContent = 'Lendo a lista de arquivos do repositório…';
  let arquivos;
  try{
    const r = await fetch(`https://api.github.com/repos/${onde.dono}/${onde.repo}/contents/`,
                          {headers:{'Accept':'application/vnd.github+json'}});
    if (!r.ok) throw new Error('status ' + r.status);
    arquivos = (await r.json())
      .filter(f => f.type === 'file' && /\.txt$/i.test(f.name) && !/^MODELO/i.test(f.name))
      .map(f => f.name);
  }catch(e){
    recado.textContent = 'Não consegui ler a lista de arquivos do GitHub agora. Tente de novo em alguns minutos.';
    return;
  }

  const conhecidos = new Set(INDICE.map(m => m.arquivo || (m.id + '.txt')));
  const faltando = arquivos.filter(a => !conhecidos.has(a));
  const semArquivo = INDICE.filter(m => m.pendente && arquivos.includes(m.arquivo || (m.id + '.txt')));

  recado.textContent = `${arquivos.length} cifras no repositório · ${faltando.length} fora do índice`;

  if (!faltando.length && !semArquivo.length){
    caixa.innerHTML = `<p class="dica">Está tudo certo: todas as cifras do repositório
      estão no índice, e nenhuma delas está marcada como "sem cifra" à toa.</p>`;
    return;
  }

  recado.textContent += ' · lendo as fichas…';
  const novas = [];
  for (const nome of faltando){
    const ficha = await lerFichaDoArquivo(nome);
    const id = nome.replace(/\.txt$/i, '');
    novas.push({
      id,
      titulo: (ficha && ficha.titulo) || id.replace(/-/g,' '),
      artista: (ficha && ficha.artista) || '',
      tom: (ficha && ficha.tom) || '',
      categoria: (ficha && ficha.categoria) || '',
      arquivo: nome
    });
  }

  /* índice corrigido: tira o "pendente" de quem já tem arquivo e acrescenta as que faltavam */
  const corrigido = INDICE.map(m=>{
    const copia = {...m};
    if (arquivos.includes(m.arquivo || (m.id + '.txt'))) delete copia.pendente;
    return copia;
  }).concat(novas);

  caixa.innerHTML = `
    ${novas.length ? `<p class="dica"><b>${novas.length}</b> ${novas.length===1?'cifra estava':'cifras estavam'} no repositório
      mas fora do índice:</p>
      <ul class="fila">${novas.map(n=>`<li>
        <span class="nome">${escapar(n.titulo)} <small>${escapar(n.artista||'')}</small></span>
        <span class="arquivo">${escapar(n.arquivo)}</span></li>`).join('')}</ul>` : ''}
    ${semArquivo.length ? `<p class="dica">${semArquivo.length} ${semArquivo.length===1?'música estava marcada':'músicas estavam marcadas'}
      como "sem cifra" mesmo já tendo arquivo. O selo também foi corrigido.</p>` : ''}
    <p class="dica">Baixe o índice corrigido e suba por <b>Add file → Upload files</b>,
       que ele substitui o antigo.</p>
    <div class="linha-botoes">
      <button class="botao forte" id="baixar-corrigido">⬇ Baixar o indice.json corrigido</button>
    </div>`;

  $('#baixar-corrigido').onclick = ()=>{
    const blob = new Blob([JSON.stringify(corrigido, null, 2) + '\n'],
                          {type:'application/json;charset=utf-8'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'indice.json';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(()=> URL.revokeObjectURL(a.href), 2000);
  };
};


/* ------------------------------------------------------------
   Texto que veio da página da FOTO (ocr.html).
   Ele chega pela memória curta do navegador, já cai na caixa de
   colar e a página trata igual a qualquer cifra copiada.
   ------------------------------------------------------------ */
(function receberDaFoto(){
  let texto = null, titulo = '';
  try{
    texto = sessionStorage.getItem('cifras:ocr-texto');
    titulo = sessionStorage.getItem('cifras:ocr-titulo') || '';
    sessionStorage.removeItem('cifras:ocr-texto');
    sessionStorage.removeItem('cifras:ocr-titulo');
  }catch(e){}
  if (!texto) return;

  const caixa = document.querySelector('#entrada');
  if (!caixa) return;
  caixa.value = texto;
  if (titulo) document.querySelector('#titulo').value = titulo;

  const recado = document.querySelector('#relatorio');
  if (recado) recado.textContent = (typeof t === 'function')
    ? t('importar.veioDaFoto').replace(/<[^>]+>/g,'')
    : 'Este texto veio de uma foto. Confira antes de guardar.';

  const botao = document.querySelector('#processar');
  if (botao) botao.click();
  caixa.scrollIntoView({behavior:'smooth', block:'center'});
})();
