/* ============================================================
   acordes.js  —  Motor de acordes
   Faz tres coisas:
   1) entende um acorde escrito em texto (ex.: "G/B", "C7M", "Am7")
   2) transpoe (muda o tom) para cima ou para baixo
   3) descobre a posicao no braco do violao e desenha o diagrama
   ============================================================ */

const SUSTENIDOS = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
const BEMOIS     = ['C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B'];

/* quantos semitons cada nota vale, contando a partir do Do */
const VALOR_NOTA = {
  'C':0,'C#':1,'Db':1,'D':2,'D#':3,'Eb':3,'E':4,'Fb':4,'E#':5,'F':5,
  'F#':6,'Gb':6,'G':7,'G#':8,'Ab':8,'A':9,'A#':10,'Bb':10,'B':11,'Cb':11
};

/* tons que costumam ser escritos com bemol */
const TONS_COM_BEMOL = new Set([5,10,3,8,1,6]); // F, Bb, Eb, Ab, Db, Gb

/* pedacinho que vem depois da nota (o "sufixo"): m, 7, 7M, sus4... */
const RE_ACORDE = /^([A-G])([#b]?)([^\/\s]*)(?:\/([A-G])([#b]?))?$/;

/* palavras do portugues que por azar se parecem com acorde quando estao sozinhas */
const PALAVRAS_TRAICOEIRAS = new Set(['Em','Do','Da','De','A','E','O','Ao','Me','Meu','Ai','Ea']);

/* o sufixo so vale se for feito de pedacos conhecidos (evita ler "Como" como acorde) */
function sufixoValido(sufixo){
  if (!sufixo) return true;
  if (/^(o|º|°|ø)$/.test(sufixo)) return true;            // Eº = diminuto
  let resto = sufixo;
  const pedacos = ['maj','min','dim','aug','sus','add','7M','M7','M','m','º','°','ø','+','-','#','b','(',')','/',','];
  while (resto.length){
    if (/^\d+/.test(resto)){ resto = resto.replace(/^\d+/,''); continue; }
    const achou = pedacos.find(p => resto.startsWith(p));
    if (!achou) return false;
    resto = resto.slice(achou.length);
  }
  return true;
}

/* coisas que aparecem na linha de acordes mas nao sao acorde */
const RE_ENFEITE = /^(\||\|\||:\||\|:|%|\(|\)|-|–|x\d+|\d+x|\(\d+x\)|N\.?C\.?)$/i;

function ehAcorde(texto){
  if (!texto) return false;
  if (RE_ENFEITE.test(texto)) return false;
  const m = RE_ACORDE.exec(texto);
  if (!m) return false;
  return sufixoValido(m[3] || '');
}

function lerAcorde(texto){
  const m = RE_ACORDE.exec(texto);
  if (!m) return null;
  return {
    nota: m[1] + (m[2]||''),
    sufixo: m[3] || '',
    baixo: m[4] ? m[4] + (m[5]||'') : null
  };
}

/* soma semitons a uma nota isolada */
function transporNota(nota, semitons, usarBemol){
  const base = VALOR_NOTA[nota];
  if (base === undefined) return nota;
  const nova = ((base + semitons) % 12 + 12) % 12;
  return usarBemol ? BEMOIS[nova] : SUSTENIDOS[nova];
}

/* soma semitons a um acorde inteiro, mantendo sufixo e baixo */
function transporAcorde(texto, semitons, usarBemol){
  const a = lerAcorde(texto);
  if (!a) return texto;
  let saida = transporNota(a.nota, semitons, usarBemol) + a.sufixo;
  if (a.baixo) saida += '/' + transporNota(a.baixo, semitons, usarBemol);
  return saida;
}

/* dado o tom original e o deslocamento, decide se escreve com # ou b */
function preferirBemol(tomOriginal, semitons){
  const a = lerAcorde(tomOriginal || 'C');
  if (!a) return false;
  const valor = ((VALOR_NOTA[a.nota] + semitons) % 12 + 12) % 12;
  return TONS_COM_BEMOL.has(valor);
}

/* ---------- normalizacao dos sufixos ----------
   No Brasil se escreve C7M, Cº, C4, C9. Aqui viram nomes internos. */
function normalizarSufixo(s){
  const t = (s || '').replace(/\s/g,'');
  const mapa = {
    '':'maj','M':'maj','maj':'maj',
    'm':'m','min':'m','-':'m',
    '7':'7','dom7':'7',
    'm7':'m7','min7':'m7','-7':'m7',
    '7M':'maj7','maj7':'maj7','M7':'maj7','7maj':'maj7',
    'm7M':'m7','m7maj':'m7',
    '4':'sus4','sus':'sus4','sus4':'sus4','7sus4':'sus4','sus4(7)':'sus4',
    '2':'sus2','sus2':'sus2','9(11)':'9',
    '6':'6','m6':'m6','6/9':'6',
    '9':'9','add9':'9','9M':'9','7(9)':'9','m9':'m7',
    '11':'9','13':'7','7(13)':'7','7(b9)':'7','7(#9)':'7','7(#11)':'7','7(b5)':'7','7(#5)':'aug',
    'o':'dim7','0':'dim7','°':'dim7','º':'dim7','dim':'dim7','dim7':'dim7','o7':'dim7',
    'm7(b5)':'m7b5','m7b5':'m7b5','ø':'m7b5','m5-/7':'m7b5','m7(5-)':'m7b5',
    '+':'aug','aug':'aug','5+':'aug','(#5)':'aug','M(#5)':'aug',
    '5':'maj','(5)':'maj'
  };
  if (mapa[t] !== undefined) return mapa[t];
  /* nao achou exato: tenta pelo comeco */
  if (/^m/.test(t) && /7/.test(t)) return 'm7';
  if (/^m/.test(t)) return 'm';
  if (/7M|maj7/i.test(t)) return 'maj7';
  if (/7/.test(t)) return '7';
  return 'maj';
}

/* ---------- posicoes no braco ----------
   Cada posicao e uma lista de 6 numeros, da corda mais grossa (Mi) para a
   mais fina (mi).  -1 = corda que nao toca.  0 = corda solta. */

const ACORDES_ABERTOS = {
  'C:maj':[-1,3,2,0,1,0], 'C:7':[-1,3,2,3,1,0], 'C:maj7':[-1,3,2,0,0,0],
  'D:maj':[-1,-1,0,2,3,2], 'D:m':[-1,-1,0,2,3,1], 'D:7':[-1,-1,0,2,1,2],
  'D:m7':[-1,-1,0,2,1,1], 'D:maj7':[-1,-1,0,2,2,2], 'D:sus4':[-1,-1,0,2,3,3],
  'D:sus2':[-1,-1,0,2,3,0],
  'E:maj':[0,2,2,1,0,0], 'E:m':[0,2,2,0,0,0], 'E:7':[0,2,0,1,0,0],
  'E:m7':[0,2,0,0,0,0], 'E:maj7':[0,2,1,1,0,0], 'E:sus4':[0,2,2,2,0,0],
  'F:maj7':[-1,-1,3,2,1,0],
  'G:maj':[3,2,0,0,0,3], 'G:7':[3,2,0,0,0,1], 'G:maj7':[3,2,0,0,0,2],
  'G:sus4':[3,3,0,0,1,3],
  'A:maj':[-1,0,2,2,2,0], 'A:m':[-1,0,2,2,1,0], 'A:7':[-1,0,2,0,2,0],
  'A:m7':[-1,0,2,0,1,0], 'A:maj7':[-1,0,2,1,2,0], 'A:sus4':[-1,0,2,2,3,0],
  'A:sus2':[-1,0,2,2,0,0], 'A:m6':[-1,0,2,2,1,2],
  'B:7':[-1,2,1,2,0,2]
};

/* formas moveis.  O numero 0 e a casa da tonica (onde vai a pestana).
   Os outros numeros sao casas contadas a partir dela; null = corda abafada. */
const FORMA_MI = { /* tonica na 6a corda */
  'maj':[0,2,2,1,0,0], 'm':[0,2,2,0,0,0], '7':[0,2,0,1,0,0], 'm7':[0,2,0,0,0,0],
  'maj7':[0,2,1,1,0,0], 'sus4':[0,2,2,2,0,0],
  '6':[0,null,2,1,2,null], 'm6':[0,2,2,0,2,0], '9':[0,2,0,1,0,2],
  'aug':[0,3,2,1,1,0]
};
const FORMA_LA = { /* tonica na 5a corda */
  'maj':[null,0,2,2,2,0], 'm':[null,0,2,2,1,0], '7':[null,0,2,0,2,0], 'm7':[null,0,2,0,1,0],
  'maj7':[null,0,2,1,2,0], 'sus4':[null,0,2,2,3,0], 'sus2':[null,0,2,2,0,0],
  'm6':[null,0,2,2,1,2], '9':[null,0,-1,0,0,null],
  'dim7':[null,0,1,2,1,null], 'm7b5':[null,0,1,0,1,null], 'aug':[null,0,3,2,2,null]
};

function posicaoDoAcorde(texto){
  const lista = opcoesDoAcorde(texto);
  return lista.length ? lista[0] : null;
}

/* devolve as posições possíveis, da melhor para a pior */
function opcoesDoAcorde(texto){
  const a = lerAcorde(texto);
  if (!a) return [];
  const tipo = normalizarSufixo(a.sufixo);
  const valor = VALOR_NOTA[a.nota];
  if (valor === undefined) return [];

  const nomeCanonico = SUSTENIDOS[valor] + ':' + tipo;
  const nomeBemol    = BEMOIS[valor] + ':' + tipo;
  const aberto = ACORDES_ABERTOS[nomeCanonico] || ACORDES_ABERTOS[nomeBemol];

  /* a posição aberta (quando existe) vem primeiro; depois as formas com pestana */
  const opcoes = [];
  if (aberto) opcoes.push(montar(aberto, 1, 0, a.baixo));
  [[FORMA_MI[tipo], 4], [FORMA_LA[tipo], 9]].forEach(([forma, cordaSolta])=>{
    if (!forma) return;
    let casa = ((valor - cordaSolta) % 12 + 12) % 12 || 12;
    if (tipo === 'dim7') { while (casa > 3) casa -= 3; }   // o diminuto se repete a cada 3 casas
    if (tipo === 'aug')  { while (casa > 4) casa -= 4; }   // o aumentado, a cada 4
    const casas = forma.map(f => f === null ? -1 : f + casa);
    const pestana = forma.filter(f => f === 0).length >= 2 ? casa : 0;
    const presas = casas.filter(c => c > 0);
    const menor = Math.min(...presas), maior = Math.max(...presas);
    /* só é pestana de verdade se nada estiver preso antes dela */
    const vale = pestana && casas.every(c => c <= 0 || c >= pestana) ? pestana : 0;
    opcoes.push(montar(casas, maior > 5 ? menor : 1, vale, a.baixo));
  });
  /* prefere a que a mão alcança; em seguida, a que fica mais perto do começo do braço */
  const perto = opcoes.filter(p => maiorCasa(p) <= 12);
  const boas = (perto.length ? perto : opcoes).filter(daPraFazer);
  const usar = boas.length ? boas : (perto.length ? perto : opcoes);
  usar.sort((x, y)=> maiorCasa(x) - maiorCasa(y));
  if (aberto && usar.includes(opcoes[0])){        // a aberta sempre encabeça a lista
    const i = usar.indexOf(opcoes[0]);
    usar.splice(i, 1); usar.unshift(opcoes[0]);
  }
  return semRepetir(usar);
}

function semRepetir(lista){
  const vistas = new Set(), saida = [];
  lista.forEach(p=>{
    const chave = p.casas.join(',');
    if (vistas.has(chave)) return;
    vistas.add(chave); saida.push(p);
  });
  return saida;
}

/* toda nota presa tem que ter um dedo sobrando para ela */
function daPraFazer(pos){
  return pos.casas.every((c,i)=> c <= 0 || pos.dedos[i] > 0) ? 1 : 0;
}
function maiorCasa(pos){ return Math.max(...pos.casas); }

/* junta tudo: baixo invertido (acordes com barra), dedilhado e base do desenho */
function montar(casas, base, pestana, baixo){
  const pos = {casas: casas.slice(), base, pestana};
  if (baixo) porBaixoNoAcorde(pos, baixo);
  pos.dedos = escolherDedos(pos.casas, pos.pestana);
  return pos;
}

/* acordes tipo G/B, Dm/C: põe a nota do baixo na corda grave certa */
function porBaixoNoAcorde(pos, baixo){
  const alvo = VALOR_NOTA[baixo];
  if (alvo === undefined) return;
  const soltas = [4, 9];                       // Mi da 6ª corda, Lá da 5ª
  for (let corda = 0; corda < 2; corda++){
    const casa = ((alvo - soltas[corda]) % 12 + 12) % 12;
    const serve = casa === 0 || (casa >= pos.base && casa <= pos.base + 4);
    if (!serve) continue;
    pos.casas[corda] = casa;
    for (let antes = 0; antes < corda; antes++) pos.casas[antes] = -1;  // abafa o que for mais grave
    return;
  }
}

/* qual dedo em cada nota: 1 na pestana, e os outros da casa mais baixa para a mais alta */
function escolherDedos(casas, pestana){
  const dedos = casas.map(()=> 0);
  let proximo = 1;
  if (pestana){
    casas.forEach((c,i)=>{ if (c === pestana) dedos[i] = 1; });
    proximo = 2;
  }
  const restantes = [];
  casas.forEach((c,i)=>{ if (c > 0 && !dedos[i]) restantes.push({i, c}); });
  restantes.sort((a,b)=> a.c - b.c || a.i - b.i);
  restantes.forEach(r=>{ if (proximo <= 4) dedos[r.i] = proximo++; });
  return dedos;
}

/* desenha o diagrama em SVG */
function diagramaSVG(texto, tamanho, posicaoEscolhida){
  const pos = posicaoEscolhida || posicaoDoAcorde(texto);
  const L = tamanho || 78;
  const larg = L, alt = L * 1.46;
  const temCasa = pos && pos.base > 1;
  const mX = L * (temCasa ? 0.26 : 0.13), mY = L*0.40;   // esquerda: nº da casa / topo: nome e x-o
  const areaL = larg - mX - L*0.09, areaA = alt - mY - L*0.10;
  const passoC = areaL / 5, passoF = areaA / 5;

  if (!pos){
    return `<svg viewBox="0 0 ${larg} ${alt}" class="diagrama"><text x="${larg/2}" y="${alt/2}"
      text-anchor="middle" class="dg-nome">${texto}</text>
      <text x="${larg/2}" y="${alt/2+14}" text-anchor="middle" class="dg-aviso">?</text></svg>`;
  }

  let s = `<svg viewBox="0 0 ${larg} ${alt}" class="diagrama" role="img" aria-label="Posição de ${texto}">`;
  s += `<text x="${larg/2}" y="${L*0.135}" text-anchor="middle" class="dg-nome">${texto}</text>`;

  /* pestana (a barra que o dedo indicador faz) */
  let xPestana = null;
  if (pos.pestana){
    const y = mY + (pos.pestana - pos.base + 0.5) * passoF;
    const primeira = pos.casas.findIndex(c => c === pos.pestana);
    xPestana = {x: mX + primeira*passoC, y};
    s += `<rect x="${mX-3.5}" y="${y-passoF*0.26}" width="${areaL+7}" height="${passoF*0.52}" rx="${passoF*0.26}" class="dg-pestana"/>`;
  }
  /* cordas */
  for (let c=0;c<6;c++){
    const x = mX + c*passoC;
    s += `<line x1="${x}" y1="${mY}" x2="${x}" y2="${mY+areaA}" class="dg-linha"/>`;
  }
  /* trastes */
  for (let f=0;f<=5;f++){
    const y = mY + f*passoF;
    const grossa = (f===0 && pos.base===1) ? ' dg-pestanafixa' : '';
    s += `<line x1="${mX}" y1="${y}" x2="${mX+areaL}" y2="${y}" class="dg-linha${grossa}"/>`;
  }
  /* numero da casa quando o desenho nao comeca no inicio do braco */
  if (pos.base > 1){
    s += `<text x="${mX-L*0.075}" y="${mY+passoF*0.72}" text-anchor="end" class="dg-casa">${pos.base}ª</text>`;
  }
  /* bolinhas, X e O */
  pos.casas.forEach((casa, i) => {
    const x = mX + i*passoC;
    if (casa < 0){
      s += `<text x="${x}" y="${mY-5}" text-anchor="middle" class="dg-marca">✕</text>`;
    } else if (casa === 0){
      s += `<circle cx="${x}" cy="${mY-8}" r="3.2" class="dg-solta"/>`;
    } else {
      if (pos.pestana && casa === pos.pestana) return;   // essa nota já está dentro da barra
      const y = mY + (casa - pos.base + 0.5) * passoF;
      s += `<circle cx="${x}" cy="${y}" r="${passoF*0.36}" class="dg-dedo"/>`;
      const dedo = pos.dedos && pos.dedos[i];
      if (dedo) s += `<text x="${x}" y="${y + passoF*0.21}" text-anchor="middle" class="dg-numero">${dedo}</text>`;
    }
  });
  /* o 1 do indicador em cima da barra */
  if (xPestana)
    s += `<text x="${xPestana.x}" y="${xPestana.y + passoF*0.21}" text-anchor="middle" class="dg-numero">1</text>`;
  return s + '</svg>';
}

/* ---------- som do acorde (usa o proprio navegador) ---------- */
const CORDAS_MIDI = [40,45,50,55,59,64]; // Mi2 La2 Re3 Sol3 Si3 Mi4
let _audio = null;
function tocarAcorde(texto){
  tocarPosicao(posicaoDoAcorde(texto));
}

/* toca uma posição específica do braço */
function tocarPosicao(pos){
  if (!pos) return;
  try{
    _audio = _audio || new (window.AudioContext || window.webkitAudioContext)();
    if (_audio.state === 'suspended') _audio.resume();
  }catch(e){ return; }
  const agora = _audio.currentTime;
  pos.casas.forEach((casa, i) => {
    if (casa < 0) return;
    const midi = CORDAS_MIDI[i] + casa;
    const freq = 440 * Math.pow(2, (midi - 69) / 12);
    const t = agora + i * 0.045;
    const osc = _audio.createOscillator();
    const vol = _audio.createGain();
    osc.type = 'triangle';
    osc.frequency.value = freq;
    vol.gain.setValueAtTime(0.0001, t);
    vol.gain.exponentialRampToValueAtTime(0.16, t + 0.012);
    vol.gain.exponentialRampToValueAtTime(0.0001, t + 1.8);
    osc.connect(vol).connect(_audio.destination);
    osc.start(t); osc.stop(t + 1.9);
  });
}

/* toca uma nota solta (usado pelo afinador) */
function tocarNota(midi, segundos){
  try{
    _audio = _audio || new (window.AudioContext || window.webkitAudioContext)();
    if (_audio.state === 'suspended') _audio.resume();
  }catch(e){ return; }
  const t = _audio.currentTime, dur = segundos || 2.2;
  const freq = 440 * Math.pow(2, (midi - 69) / 12);
  const osc = _audio.createOscillator(), vol = _audio.createGain();
  osc.type = 'triangle'; osc.frequency.value = freq;
  vol.gain.setValueAtTime(0.0001, t);
  vol.gain.exponentialRampToValueAtTime(0.22, t + 0.02);
  vol.gain.setValueAtTime(0.22, t + dur - 0.3);
  vol.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(vol).connect(_audio.destination);
  osc.start(t); osc.stop(t + dur);
}

/* ============================================================
   Extras usados pelo dicionário de acordes
   ============================================================ */

/* de quais notas cada tipo de acorde é feito (em semitons a partir da tônica) */
const INTERVALOS = {
  'maj':[0,4,7], 'm':[0,3,7], '7':[0,4,7,10], 'm7':[0,3,7,10],
  'maj7':[0,4,7,11], 'sus4':[0,5,7], 'sus2':[0,2,7], '6':[0,4,7,9],
  'm6':[0,3,7,9], '9':[0,4,7,10,14], 'dim7':[0,3,6,9], 'm7b5':[0,3,6,10],
  'aug':[0,4,8]
};

const NOME_NOTA_PT = {'C':'Dó','D':'Ré','E':'Mi','F':'Fá','G':'Sol','A':'Lá','B':'Si'};
const NOME_TIPO_PT = {
  'maj':'maior', 'm':'menor', '7':'com sétima', 'm7':'menor com sétima',
  'maj7':'com sétima maior', 'sus4':'com quarta', 'sus2':'com segunda',
  '6':'com sexta', 'm6':'menor com sexta', '9':'com nona',
  'dim7':'diminuto', 'm7b5':'meio-diminuto', 'aug':'aumentado'
};

/* quais notas saem quando você toca o acorde */
function notasDoAcorde(texto){
  const a = lerAcorde(texto);
  if (!a) return [];
  const base = VALOR_NOTA[a.nota];
  const passos = INTERVALOS[normalizarSufixo(a.sufixo)];
  if (base === undefined || !passos) return [];
  const bemol = a.nota.includes('b');
  const notas = passos.map(p => (bemol ? BEMOIS : SUSTENIDOS)[(base + p) % 12]);
  if (a.baixo && !notas.includes(a.baixo)) notas.unshift(a.baixo + ' (baixo)');
  return notas;
}

/* "Am7" vira "Lá menor com sétima" */
function nomePorExtenso(texto){
  const a = lerAcorde(texto);
  if (!a) return texto;
  const acidente = a.nota[1] === '#' ? ' sustenido' : a.nota[1] === 'b' ? ' bemol' : '';
  const tipo = NOME_TIPO_PT[normalizarSufixo(a.sufixo)] || '';
  const baixo = a.baixo ? ' com baixo em ' + (NOME_NOTA_PT[a.baixo[0]] || a.baixo) : '';
  return ((NOME_NOTA_PT[a.nota[0]] || a.nota) + acidente + ' ' + tipo + baixo).trim();
}
