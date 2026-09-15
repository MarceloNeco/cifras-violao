/* ============================================================
   leitor-pdf.js — lê uma coletânea de cifras em PDF e devolve
   o texto no formato "===" que o importador entende.

   O PDF é lido dentro do seu navegador, usando a biblioteca pdf.js
   que está no próprio repositório (pdf-lib.mjs e pdf-worker.mjs).
   Nada é enviado para lugar nenhum, e não depende de internet além
   do próprio site.
   ============================================================ */

let pdfPronto = null;
async function prepararPdfJs(){
  if (pdfPronto) return pdfPronto;
  try{
    /* a biblioteca vem do próprio repositório: nada é buscado na internet */
    const lib = await import('./pdf-lib.mjs');
    lib.GlobalWorkerOptions.workerSrc = './pdf-worker.mjs';
    pdfPronto = lib;
    return lib;
  }catch(e){
    throw new Error('Não consegui abrir o leitor de PDF (pdf-lib.mjs). '
      + 'Confira se os arquivos pdf-lib.mjs e pdf-worker.mjs estão no repositório.');
  }
}

/* ---------- reconstrói as linhas de uma página ---------- */
function linhasDaPagina(conteudo){
  const itens = conteudo.items.filter(i => i.str && i.str.trim() !== '');
  if (!itens.length) return [];

  /* largura de um caractere: a cifra está em fonte monoespaçada */
  const larguras = itens.filter(i => i.str.trim().length > 1)
                        .map(i => i.width / i.str.length).sort((a,b)=> a-b);
  const larguraChar = larguras[Math.floor(larguras.length/2)] || 5;

  /* junta os pedaços que estão na mesma altura */
  const porY = new Map();
  itens.forEach(i=>{
    const y = Math.round(i.transform[5] * 2) / 2;
    if (!porY.has(y)) porY.set(y, []);
    porY.get(y).push(i);
  });
  const ys = [...porY.keys()].sort((a,b)=> b - a);

  /* onde começa a margem esquerda: a posição em que a maioria das linhas começa.
     (o título da coletânea e o número da página ficam fora dessa margem) */
  const inicios = {};
  ys.forEach(y=>{
    const x = Math.round(Math.min(...porY.get(y).map(i => i.transform[4])));
    inicios[x] = (inicios[x] || 0) + 1;
  });
  const origemX = +Object.keys(inicios).sort((a,b)=> inicios[b]-inicios[a])[0] || 0;

  /* altura de uma linha = o MENOR salto que se repete.
     (o salto mais comum costuma ser o de duas linhas, entre uma estrofe e outra) */
  const contagem = {};
  for (let k=1; k<ys.length; k++){
    const salto = Math.round(ys[k-1] - ys[k]);
    if (salto > 2) contagem[salto] = (contagem[salto] || 0) + 1;
  }
  const candidatos = Object.keys(contagem).map(Number).sort((a,b)=> a-b)
                       .filter(v => contagem[v] >= 2);
  const alturaLinha = candidatos[0] || 13;

  const linhas = [];
  let anteriorY = null;
  ys.forEach(y=>{
    if (anteriorY !== null){
      const extras = Math.round((anteriorY - y) / alturaLinha) - 1;
      for (let k=0; k < Math.min(extras, 2); k++) linhas.push('');
    }
    anteriorY = y;
    let linha = '';
    porY.get(y).sort((a,b)=> a.transform[4] - b.transform[4]).forEach(p=>{
      const coluna = Math.max(0, Math.round((p.transform[4] - origemX) / larguraChar));
      if (linha.length < coluna) linha += ' '.repeat(coluna - linha.length);
      linha += p.str;
    });
    linhas.push(linha.replace(/\s+$/, ''));
  });

  /* tira a margem que toda a página tem à esquerda */
  const cheias = linhas.filter(l => l.trim());
  if (!cheias.length) return linhas;
  const margem = Math.min(...cheias.map(l => l.match(/^ */)[0].length));
  return margem > 0 ? linhas.map(l => l.slice(margem)) : linhas;
}

/* ---------- acha onde cada música começa ---------- */
const RE_TOM_PDF = /^\s*Tom:\s*(\S+)/i;
const RE_NUMERADA = /^\s*\d+\.\s+(.+?)\s*$/;

function ehTitulo(texto){
  if (!texto || texto.length > 70) return false;
  return texto === texto.toUpperCase() && /[A-ZÀ-Ú]/.test(texto);
}

function separarMusicasDoPdf(linhas){
  const achadas = [];
  for (let i = 0; i < linhas.length; i++){
    const mTom = RE_TOM_PDF.exec(linhas[i]);
    if (!mTom) continue;

    const antes = [];
    for (let k = i-1; k >= 0 && antes.length < 2; k--){
      if ((linhas[k] || '').trim()) antes.push({texto: linhas[k].trim(), pos: k});
    }
    if (!antes.length) continue;

    const c1 = antes[0] ? antes[0].texto : '';
    const c2 = antes[1] ? antes[1].texto : '';
    const n1 = RE_NUMERADA.exec(c1), n2 = RE_NUMERADA.exec(c2);

    let titulo = '', artista = '';
    if (n2 || ehTitulo(c2)){ titulo = n2 ? n2[1] : c2; artista = c1; }
    else if (n1 || ehTitulo(c1)){ titulo = n1 ? n1[1] : c1; }
    else continue;

    achadas.push({titulo, artista, tom: mTom[1],
                  inicio: i + 1, cabecaEm: antes[antes.length-1].pos});
  }

  achadas.forEach((m, k)=>{
    const fim = k+1 < achadas.length ? achadas[k+1].cabecaEm : linhas.length;
    let corpo = linhas.slice(m.inicio, fim);
    /* tira a margem que sobrou à esquerda de todas as linhas */
    const cheias = corpo.filter(l => l.trim());
    if (cheias.length){
      const recuo = Math.min(...cheias.map(l => l.match(/^ */)[0].length));
      if (recuo > 0) corpo = corpo.map(l => l.slice(recuo));
    }
    m.corpo = corpo.join('\n')
      .replace(/\n{3,}/g, '\n\n').replace(/^\n+/, '').replace(/\n+$/, '');
  });

  /* tira pedaços soltos e fica com a versão mais completa de cada título */
  const melhor = new Map();
  achadas.forEach(m=>{
    if (m.corpo.split('\n').length < 6) return;
    const chave = m.titulo.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (!melhor.has(chave) || melhor.get(chave).corpo.length < m.corpo.length) melhor.set(chave, m);
  });
  return [...melhor.values()];
}

/* "QUER NAMORAR COMIGO?" -> "Quer Namorar Comigo?" */
const MIUDAS = new Set(['de','da','do','das','dos','e','em','a','o','as','os','na','no','nas','nos',
                        'que','com','por','pra','para','um','uma','ao','à','of','the','in','to','and','a']);
function comoNome(t){
  return (t||'').toLowerCase().split(/(\s+)/).map((p, i)=>{
    if (!p.trim()) return p;
    if (i > 0 && MIUDAS.has(p)) return p;
    return p.charAt(0).toUpperCase() + p.slice(1);
  }).join('');
}

/* ---------- a função que o importador chama ---------- */
async function pdfParaFormatoLote(arquivo, aoAndar){
  const pdfjs = await prepararPdfJs();
  const dados = new Uint8Array(await arquivo.arrayBuffer());
  const doc = await pdfjs.getDocument({data: dados}).promise;

  const todas = [];
  for (let i = 1; i <= doc.numPages; i++){
    const pagina = await doc.getPage(i);
    todas.push(...linhasDaPagina(await pagina.getTextContent()));
    if (aoAndar && i % 3 === 0) aoAndar(i, doc.numPages);
  }
  if (aoAndar) aoAndar(doc.numPages, doc.numPages);

  /* números de página soltos e o cabeçalho repetido da coletânea saem fora */
  const limpas = todas.filter(l =>
    !/^\s*\d{1,3}\s*$/.test(l) && !/^COLET[ÂA]NEA DE CIFRAS/i.test(l.trim()));

  const musicas = separarMusicasDoPdf(limpas);
  const texto = musicas.map(m=>{
    const cabecalho = ['=== ' + comoNome(m.titulo)];
    if (m.artista) cabecalho.push(m.artista);
    cabecalho.push('tom: ' + m.tom);
    return cabecalho.join(' | ') + '\n\n' + m.corpo;
  }).join('\n\n');

  return {texto, quantas: musicas.length, paginas: doc.numPages};
}
