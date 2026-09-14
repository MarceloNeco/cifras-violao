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

/* formas moveis: o numero 0 e onde fica a pestana (casa da tonica) */
const FORMA_MI = { /* tonica na 6a corda */
  'maj':[0,2,2,1,0,0], 'm':[0,2,2,0,0,0], '7':[0,2,0,1,0,0], 'm7':[0,2,0,0,0,0],
  'maj7':[0,2,1,1,0,0], 'sus4':[0,2,2,2,0,0],
  '6':[0,2,2,1,2,0], 'm6':[0,2,2,0,2,0], '9':[0,2,0,1,0,2],
  'aug':[0,3,2,1,1,0]
};
const FORMA_LA = { /* tonica na 5a corda */
  'maj':[-1,0,2,2,2,0], 'm':[-1,0,2,2,1,0], '7':[-1,0,2,0,2,0], 'm7':[-1,0,2,0,1,0],
  'maj7':[-1,0,2,1,2,0], 'sus4':[-1,0,2,2,3,0], 'sus2':[-1,0,2,2,0,0],
  '6':[-1,0,2,2,2,2], 'm6':[-1,0,2,2,1,2], '9':[-1,0,2,4,2,3],
  'dim7':[-1,0,1,2,1,-1], 'm7b5':[-1,0,1,0,1,-1], 'aug':[-1,0,3,2,2,-1]
};

function posicaoDoAcorde(texto){
  const a = lerAcorde(texto);
  if (!a) return null;
  const tipo = normalizarSufixo(a.sufixo);
  const valor = VALOR_NOTA[a.nota];
  if (valor === undefined) return null;

  const nomeCanonico = SUSTENIDOS[valor] + ':' + tipo;
  const nomeBemol    = BEMOIS[valor] + ':' + tipo;
  if (ACORDES_ABERTOS[nomeCanonico]) return {casas:ACORDES_ABERTOS[nomeCanonico], base:1, pestana:0};
  if (ACORDES_ABERTOS[nomeBemol])    return {casas:ACORDES_ABERTOS[nomeBemol],    base:1, pestana:0};

  /* forma movel: escolhe a que cai na casa mais baixa */
  const casaMi = ((valor - 4) % 12 + 12) % 12 || 12;  // Mi = 4
  const casaLa = ((valor - 9) % 12 + 12) % 12 || 12;  // La = 9
  const usaLa = FORMA_LA[tipo] && (casaLa <= casaMi || !FORMA_MI[tipo]);
  const forma = usaLa ? FORMA_LA[tipo] : FORMA_MI[tipo];
  if (!forma) return null;
  let casa = usaLa ? casaLa : casaMi;
  if (tipo === 'dim7') { while (casa > 3) casa -= 3; }      // o diminuto se repete a cada 3 casas
  if (tipo === 'aug')  { while (casa > 4) casa -= 4; }      // o aumentado, a cada 4

  const casas = forma.map(f => f < 0 ? -1 : f + casa);
  /* quantas cordas fazem pestana na casa da tonica */
  const pestana = forma.filter(f => f === 0).length >= 2 ? casa : 0;
  const menor = Math.min(...casas.filter(c => c > 0));
  const base = menor > 4 ? menor : 1;
  return {casas, base, pestana};
}

/* desenha o diagrama em SVG */
function diagramaSVG(texto, tamanho){
  const pos = posicaoDoAcorde(texto);
  const L = tamanho || 78;
  const larg = L, alt = L * 1.35;
  const mX = L*0.14, mY = L*0.30;
  const areaL = larg - mX*2, areaA = alt - mY - L*0.10;
  const passoC = areaL / 5, passoF = areaA / 5;

  if (!pos){
    return `<svg viewBox="0 0 ${larg} ${alt}" class="diagrama"><text x="${larg/2}" y="${alt/2}"
      text-anchor="middle" class="dg-nome">${texto}</text>
      <text x="${larg/2}" y="${alt/2+14}" text-anchor="middle" class="dg-aviso">?</text></svg>`;
  }

  let s = `<svg viewBox="0 0 ${larg} ${alt}" class="diagrama" role="img" aria-label="Posição de ${texto}">`;
  s += `<text x="${larg/2}" y="${L*0.15}" text-anchor="middle" class="dg-nome">${texto}</text>`;

  /* pestana */
  if (pos.pestana){
    const y = mY + (pos.pestana - pos.base + 0.5) * passoF;
    s += `<rect x="${mX-3}" y="${y-passoF*0.20}" width="${areaL+6}" height="${passoF*0.40}" rx="${passoF*0.2}" class="dg-pestana"/>`;
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
    s += `<text x="${mX-5}" y="${mY+passoF*0.72}" text-anchor="end" class="dg-casa">${pos.base}</text>`;
  }
  /* bolinhas, X e O */
  pos.casas.forEach((casa, i) => {
    const x = mX + i*passoC;
    if (casa < 0){
      s += `<text x="${x}" y="${mY-4}" text-anchor="middle" class="dg-marca">✕</text>`;
    } else if (casa === 0){
      s += `<circle cx="${x}" cy="${mY-7}" r="3.2" class="dg-solta"/>`;
    } else {
      const y = mY + (casa - pos.base + 0.5) * passoF;
      s += `<circle cx="${x}" cy="${y}" r="${passoF*0.33}" class="dg-dedo"/>`;
    }
  });
  return s + '</svg>';
}

/* ---------- som do acorde (usa o proprio navegador) ---------- */
const CORDAS_MIDI = [40,45,50,55,59,64]; // Mi2 La2 Re3 Sol3 Si3 Mi4
let _audio = null;
function tocarAcorde(texto){
  const pos = posicaoDoAcorde(texto);
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
