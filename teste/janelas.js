/* Teste automático: janelas do CifrasONE pela janela comum (janela.js) + chaves de IA no cofre (cofre.js).
   Só valores de mentira (PIN e chave inventados). Roda em 390 px e em 1280 px.
   Cada janela: trava a página de trás, não rola ao arrastar fora, fecha pelo ✕/botão, Esc, Voltar e toque fora
   (arrastar de dentro para fora não fecha), com texto digitado pergunta "Descartar?", uma janela por vez.
   Também: alert()/confirm() trocados, afinador, menu ☰ e 👤, chave antiga que passa para o cofre, PIN ao abrir e
   ao recarregar, tranca ao sair do app, "✓ guardado" / "Mostrar a chave guardada", painel da digital.
   Uso (na raiz do repositório):
     python3 -m http.server 8098 &
     NODE_PATH=/opt/node22/lib/node_modules node teste/janelas.js */
const { chromium } = require('playwright');
const BASE = process.env.BASE || 'http://localhost:8098';
const PIN = 'pin-de-mentira-789';
const CHAVE = 'gsk_chave_de_mentira_para_o_teste_000111222';

const falhas = [];
let total = 0;
const conferir = (ok, msg) => { total++; if (!ok) falhas.push(msg); else process.stdout.write('  ✓ ' + msg + '\n'); };

async function rodar(browser, nome, viewport) {
  console.log('\n=== ' + nome + ' ===');
  const ctx = await browser.newContext({ serviceWorkers: 'block', viewport, locale: 'pt-BR', reducedMotion: 'reduce' });
  await ctx.route(url => !url.href.startsWith(BASE), r => r.fulfill({ status: 404, headers: { 'access-control-allow-origin': '*' }, body: 'nao' }));
  /* sem anúncios no teste: o pop-up do anúncio (3, 2, 1) abriria por conta própria no meio das conferências */
  await ctx.addInitScript(() => { try { sessionStorage.setItem('dgo:cifras-violao:popup:antes', '1'); sessionStorage.setItem('dgo:cifras-violao:popup:depois', '1'); } catch (e) {} });
  await ctx.route(BASE + '/fora/index.html', r => r.fulfill({ status: 200, contentType: 'text/html',
    body: '<!doctype html><title>fora</title><script src="/janela.js"></script><script src="/cofre.js"></script><p>outro app</p>' }));
  const page = await ctx.newPage();
  const erros = [], consoles = [];
  page.on('pageerror', e => erros.push(e.message));
  page.on('console', m => consoles.push(m.text()));
  const ev = (f, a) => page.evaluate(f, a);
  const pausa = ms => page.waitForTimeout(ms);
  const largura = viewport.width;

  const abertas = () => ev(() => document.querySelectorAll('dialog.sj[open]').length);
  const travada = () => ev(() => getComputedStyle(document.documentElement).overflow === 'hidden');
  const dialogo = sel => page.waitForSelector('dialog.sj[open]' + (sel || ''), { timeout: 8000 }).catch(async e => {
    const est = await ev(() => ({ abertas: [...document.querySelectorAll('dialog.sj')].map(d => d.className + (d.open ? ' [aberta]' : '')), quantas: SolverJanela.quantas(), esperando: SolverJanela.esperando(), nivel: (history.state && history.state.sjNivel) || 0, len: history.length }));
    throw new Error('esperava a janela ' + sel + ' e só havia ' + JSON.stringify(est));
  });
  const vazio = async () => { for (let i = 0; i < 20; i++) { if (await abertas() === 0) return true; await pausa(100); } return false; };

  /* roda a bateria de saídas de uma janela; "fora" = ponto na parte escura; "dentro" = ponto dentro da caixa */
  async function bateria(titulo, abrir, o) {
    o = o || {};
    const y0 = await ev(() => scrollY);
    await abrir(); await dialogo(o.sel);
    conferir(await abertas() === 1, titulo + ': abre como janela comum (1 aberta)');
    conferir(await travada(), titulo + ': a página de trás fica travada (sem rolagem)');
    const fora = o.fora || [5, 5];
    await page.mouse.move(fora[0], fora[1]); await page.mouse.wheel(0, 600); await pausa(150);
    conferir(await ev(() => scrollY) === y0, titulo + ': arrastar fora não rola a página de trás');
    const dentro = o.dentro || [largura / 2, 380];
    await page.mouse.move(dentro[0], dentro[1]); await page.mouse.down(); await page.mouse.move(fora[0], fora[1], { steps: 4 }); await page.mouse.up(); await pausa(200);
    conferir(await abertas() === 1, titulo + ': arrastar de dentro para fora NÃO fecha');
    await page.keyboard.press('Escape');
    conferir(await vazio(), titulo + ': Esc fecha');
    conferir(await ev(() => scrollY) === y0, titulo + ': a página volta exatamente onde estava');
    await abrir(); await dialogo(o.sel);
    await page.mouse.click(fora[0], fora[1]);
    conferir(await vazio(), titulo + ': toque na parte escura fecha');
    await abrir(); await dialogo(o.sel);
    const url0 = page.url();
    await page.goBack();
    conferir(await vazio() && page.url() === url0, titulo + ': Voltar do celular fecha e não sai da página');
    if (o.botao) {
      await abrir(); await dialogo(o.sel);
      await page.click('dialog.sj[open] ' + o.botao);
      conferir(await vazio(), titulo + ': o botão da janela (' + o.botao + ') fecha');
    }
  }

  /* ------------------------------------------------------------------ início */
  await page.goto(BASE + '/index.html');
  await page.waitForFunction(() => window.DGO && DGO.versao && document.querySelector('[data-abre-perfil]'));
  await pausa(600);
  conferir(await ev(() => DGO.versao) === '1.11.0' && await ev(() => SolverJanela.versao) === '1.0.1' && await ev(() => SolverCofre.versao) === '1.4.0',
    'módulo 1.11.0, janela.js 1.0.1 e cofre.js 1.4.0 carregados');
  await ev(() => window.scrollTo(0, 500));

  await bateria('Novidades', () => ev(() => document.querySelector('.rodape [data-abre-novidades]').click()), { sel: '.janela-fundo', botao: '[data-fecha-janela]' });
  await bateria('Novidades (✕)', () => ev(() => document.querySelector('.rodape [data-abre-novidades]').click()), { sel: '.janela-fundo', botao: '.fechar-janela' });
  await bateria('Inbox 📥', () => ev(() => document.querySelector('[data-abre-inbox]').click()), { sel: '.janela-fundo', botao: '.fechar-janela' });
  await bateria('Aviso de uso', () => ev(() => document.querySelector('.rodape [data-abre-aviso]').click()), { sel: '.janela-fundo', botao: '[data-fecha-janela]' });
  await bateria('Menu ☰', () => ev(() => document.querySelector('[data-botao-menu]').click()), { sel: '.gaveta-j', fora: [largura - 5, 500], dentro: [100, 300], botao: '[data-fecha-menu]' });
  await bateria('Menu 👤', () => ev(() => document.querySelector('[data-abre-perfil]').click()), { sel: '.perfil-j', fora: [5, 600], dentro: [largura - 100, 250] });

  /* inbox: marcar como lida troca o miolo no lugar (continua 1 janela) */
  await ev(() => document.querySelector('[data-abre-inbox]').click()); await dialogo('.janela-fundo');
  const btLida = await page.$('dialog.sj[open] [data-inbox-lida]');
  if (btLida) { await btLida.click(); await pausa(500); conferir(await abertas() === 1, 'Inbox: marcar como lida atualiza dentro da mesma janela'); }
  await page.keyboard.press('Escape'); await vazio();

  /* menu ☰ e 👤: voltam ao lugar certo ao fechar */
  await ev(() => document.querySelector('[data-botao-menu]').click()); await dialogo('.gaveta-j');
  await page.keyboard.press('Escape'); await vazio();
  conferir(await ev(() => !!document.querySelector('#gaveta-menu .gaveta-painel') && document.querySelector('[data-botao-menu]').getAttribute('aria-expanded') === 'false'),
    'Menu ☰: o painel volta ao esconderijo e o botão fica com aria-expanded=false');
  const baseAntes = await ev(() => document.querySelector('[data-abre-perfil]').getBoundingClientRect().bottom);
  await ev(() => document.querySelector('[data-abre-perfil]').click()); await dialogo('.perfil-j');
  const pos = await ev(() => { const m = document.getElementById('menu-perfil').getBoundingClientRect(); return { menuTopo: m.top, dentro: m.right <= innerWidth && m.left >= 0 }; });
  pos.botaoBase = baseAntes;
  conferir(pos.menuTopo >= pos.botaoBase && pos.menuTopo - pos.botaoBase < 20 && pos.dentro, 'Menu 👤: abre logo abaixo do botão e cabe na tela');
  conferir(await ev(() => !document.querySelector('dialog.sj-pergunta')), 'Menu 👤: nunca pergunta "Descartar?"');
  await page.keyboard.press('Escape'); await vazio();
  conferir(await ev(() => document.querySelector('.topo-interno > #menu-perfil') !== null), 'Menu 👤: o menu volta para a barra do topo');

  /* Menu ☰: Configurações abre depois que a gaveta fecha; link navega */
  await ev(() => document.querySelector('[data-botao-menu]').click()); await dialogo('.gaveta-j');
  await page.click('dialog.sj[open] .gaveta-painel [data-abre-config]'); await pausa(600);
  conferir(await abertas() === 1 && await ev(() => !!document.querySelector('dialog.sj[open].dgo-modal')), 'Menu ☰ → Configurações: a gaveta fecha e as Configurações abrem (uma janela por vez)');
  await page.keyboard.press('Escape'); await vazio();

  /* uma janela por vez */
  await ev(() => { window.__a = SolverJanela.abrir({ conteudo: Object.assign(document.createElement('p'), { textContent: 'um' }), classe: 'janela-fundo' }); window.__b = SolverJanela.abrir({ conteudo: Object.assign(document.createElement('p'), { textContent: 'dois' }), classe: 'janela-fundo' }); });
  await pausa(200);
  conferir(await abertas() === 1 && await ev(() => SolverJanela.esperando()) === 1, 'Uma janela por vez: a segunda espera a primeira fechar');
  await ev(() => window.__a.fechar('x')); await pausa(400);
  conferir(await abertas() === 1 && await ev(() => document.querySelector('dialog.sj[open]').textContent) === 'dois', 'e abre quando a primeira fecha');
  await ev(() => window.__b.fechar('x')); await vazio();

  /* ------------------------------------------------------------------ aviso: Descartar? */
  await ev(() => document.querySelector('.rodape [data-abre-aviso]').click()); await dialogo('.janela-fundo');
  await page.keyboard.press('Escape');
  conferir(await vazio(), 'Aviso: sem nada digitado, Esc fecha direto (não pergunta)');
  await ev(() => document.querySelector('.rodape [data-abre-aviso]').click()); await dialogo('.janela-fundo');
  await page.fill('dialog.sj[open] #form-remocao [name=nome]', 'Nome de mentira').catch(() => {});
  const temForm = await ev(() => !!document.querySelector('dialog.sj[open] #form-remocao'));
  if (temForm) {
    await page.keyboard.press('Escape'); await pausa(250);
    conferir(await ev(() => !!document.querySelector('dialog.sj-pergunta[open]')) && await ev(() => document.querySelectorAll('dialog.sj[open]').length) === 2, 'Aviso: com texto digitado, Esc pergunta "Descartar o que você digitou?" (por cima)');
    await page.click('[data-sj=continuar]'); await pausa(250);
    conferir(await abertas() === 1 && await ev(() => document.querySelector('dialog.sj[open] #form-remocao [name=nome]').value) === 'Nome de mentira', 'Continuar mantém a janela e o texto');
    await page.mouse.click(5, 5); await pausa(250);
    conferir(await ev(() => !!document.querySelector('dialog.sj-pergunta[open]')), 'toque fora também pergunta');
    await page.click('[data-sj=descartar]');
    conferir(await vazio(), 'Descartar fecha a pergunta e a janela juntas');
  } else {
    conferir(true, 'Aviso: sem formulário de contato configurado (FORMULARIO_REMOCAO vazio): nada a descartar');
    await page.keyboard.press('Escape'); await vazio();
  }

  /* ------------------------------------------------------------------ Configurações do módulo: ajuda dentro da janela */
  await ev(() => DGO.abrirConfiguracoes()); await dialogo('.dgo-modal'); await pausa(300);
  await ev(() => DGO.ia.chaves('groq')); await pausa(400);
  conferir(await abertas() === 1, 'Chaves de IA: abrir a tela troca o conteúdo da mesma janela (não empilha)');
  const guiaDentro = await ev(() => { const d = document.querySelector('dialog.sj[open] details.dgo-guia, dialog.sj[open] .dgo-guia'); return !!d; });
  conferir(guiaDentro, 'Chaves de IA: o guia "como conseguir a chave" é uma seção que abre DENTRO da janela');
  await page.keyboard.press('Escape'); await vazio();

  /* ------------------------------------------------------------------ cifra + afinador + aviso de voz */
  await page.goto(BASE + '/cifra.html?m=peixe-vivo');
  await page.waitForFunction(() => document.querySelector('#btn-afinador') && document.querySelector('#cifra').textContent.length > 20);
  await pausa(500);
  await ev(() => window.scrollTo(0, 300));
  await bateria('Afinador', () => ev(() => document.getElementById('btn-afinador').click()), { sel: '.afinador-j', fora: [largura / 2, 60], dentro: [largura / 2, 700], botao: '#fechar-afinador' });
  await ev(() => document.getElementById('btn-afinador').click()); await dialogo('.afinador-j');
  conferir(await ev(() => document.getElementById('afinador').hasAttribute('aberta') && document.querySelectorAll('#cordas .corda').length === 6), 'Afinador: marca "aberta" e mostra as 6 cordas dentro da janela');
  await page.keyboard.press('Escape'); await vazio();
  conferir(await ev(() => !document.getElementById('afinador').hasAttribute('aberta') && document.getElementById('afinador').parentNode.tagName === 'BODY'), 'Afinador: ao fechar, o painel volta ao lugar e a marca sai');

  /* alert() de voz trocado */
  await ev(() => { try { delete window.speechSynthesis; } catch (e) {} Object.defineProperty(window, 'speechSynthesis', { value: undefined, configurable: true }); delete window.speechSynthesis; });
  const semVoz = await ev(() => !('speechSynthesis' in window));
  if (semVoz) {
    await ev(() => document.getElementById('btn-voz').click()); await dialogo('.janela-fundo');
    conferir(await ev(() => document.querySelector('dialog.sj[open]').getAttribute('role')) === 'alertdialog' && /leitura em voz alta/.test(await ev(() => document.querySelector('dialog.sj[open]').textContent)), 'Voz: o aviso "sem leitura em voz alta" é janela do app (alertdialog), não alert()');
    await page.click('dialog.sj[open] [data-ok]'); conferir(await vazio(), 'e o botão "Entendi" fecha');
  }

  /* ------------------------------------------------------------------ importar: confirm() e alert() trocados */
  await page.goto(BASE + '/importar.html');
  await page.waitForFunction(() => window.DGO && document.querySelector('#esvaziar'));
  await ev(() => { localStorage.setItem('cifras:fila', JSON.stringify([{ id: 'a', arquivo: 'a.txt', titulo: 'A', texto: 'x' }, { id: 'b', arquivo: 'b.txt', titulo: 'B', texto: 'y' }])); });
  await page.reload(); await page.waitForFunction(() => window.DGO && document.querySelector('#esvaziar')); await pausa(400);
  await ev(() => document.getElementById('esvaziar').click()); await dialogo('.janela-fundo');
  conferir(/2 músicas/.test(await ev(() => document.querySelector('dialog.sj[open]').textContent)) && await ev(() => document.querySelector('dialog.sj[open]').getAttribute('role')) === 'alertdialog', 'Fila: "Tirar todas as músicas?" é uma confirmação do app (alertdialog)');
  await page.click('dialog.sj[open] [data-nao]'); await vazio();
  conferir(await ev(() => JSON.parse(localStorage.getItem('cifras:fila')).length) === 2, 'Cancelar mantém a fila');
  await ev(() => document.getElementById('esvaziar').click()); await dialogo('.janela-fundo');
  await page.click('dialog.sj[open] [data-ok]'); await vazio();
  conferir(await ev(() => JSON.parse(localStorage.getItem('cifras:fila')).length) === 0, 'Confirmar esvazia a fila');
  await ev(() => { const o = Storage.prototype.setItem; Storage.prototype.setItem = function (k, v) { if (k === 'cifras:fila') throw new Error('cheio'); return o.call(this, k, v); }; gravarFila(); });
  await dialogo('.janela-fundo');
  conferir(/fila ficou grande/.test(await ev(() => document.querySelector('dialog.sj[open]').textContent)), 'Fila grande demais: aviso do app no lugar do alert()');
  await page.click('dialog.sj[open] [data-ok]'); await vazio();

  /* ------------------------------------------------------------------ inglês */
  await ev(() => { localStorage.setItem('dgo:global:idioma', JSON.stringify('en')); });
  await page.reload(); await page.waitForFunction(() => window.DGO && document.querySelector('#esvaziar')); await pausa(500);
  await ev(() => { localStorage.setItem('cifras:fila', JSON.stringify([{ id: 'a', arquivo: 'a.txt', titulo: 'A', texto: 'x' }])); });
  await ev(() => document.getElementById('esvaziar').click()); await dialogo('.janela-fundo');
  conferir(/Remove all songs from the queue/.test(await ev(() => document.querySelector('dialog.sj[open]').textContent)), 'Inglês: a confirmação da fila vem em inglês');
  await page.keyboard.press('Escape'); await vazio();
  await ev(() => { localStorage.removeItem('dgo:global:idioma'); localStorage.removeItem('cifras:fila'); });

  /* trocar o idioma com a faixa de anúncio na tela (o contorno anuncios.imagem foi tirado: o módulo 1.11.0 já corrigiu) */
  await page.goto(BASE + '/index.html'); await page.waitForFunction(() => window.DGO && DGO.versao && document.querySelector('.dgo-faixa')); await pausa(500);
  const errosAntes = erros.length;
  await ev(() => DGO.trocarIdioma('en')); await pausa(600);
  conferir(await ev(() => document.documentElement.lang) === 'en' && erros.length === errosAntes, 'Trocar o idioma com a faixa de anúncio na tela funciona, sem o contorno antigo');
  await ev(() => DGO.trocarIdioma('pt')); await pausa(300);

  /* ------------------------------------------------------------------ chaves de IA: antiga → cofre, PIN, "✓ guardado" */
  await page.goto(BASE + '/index.html');
  await page.waitForFunction(() => window.DGO && DGO.versao && window.SolverCofre);
  await ev(c => { localStorage.setItem('dgo:global:chaves-ia', JSON.stringify({ groq: c })); }, CHAVE);
  await page.reload(); await page.waitForFunction(() => window.DGO && DGO.versao);
  await page.waitForSelector('dialog#solver-cofre[open]', { timeout: 8000 });
  conferir(await ev(() => !!document.querySelector('dialog#solver-cofre.sj')) && await travada(), 'Chave antiga em texto aberto: o app pede para criar o PIN do cofre (janela comum, página travada)');
  const pins = await page.$$('#solver-cofre input[type=password]');
  await pins[0].fill(PIN); await pins[1].fill(PIN); await page.click('#solver-cofre button[type=submit]');
  await page.waitForFunction(() => SolverCofre.aberto() && SolverCofre.tem('ia:groq'), null, { timeout: 15000 });
  conferir(true, 'A chave antiga passou para o cofre (SolverCofre.tem("ia:groq"))');
  await pausa(500);
  await page.keyboard.press('Escape').catch(() => {}); await pausa(200);
  /* nenhum lugar do app (fora o item compartilhado que outros apps ainda leem) guarda a chave em texto aberto */
  const abertos = await ev(c => { const r = []; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if ((localStorage.getItem(k) || '').indexOf(c) !== -1) r.push(k); } for (let i = 0; i < sessionStorage.length; i++) { const k = sessionStorage.key(i); if ((sessionStorage.getItem(k) || '').indexOf(c) !== -1) r.push('s:' + k); } return r; }, CHAVE);
  conferir(abertos.filter(k => k !== 'dgo:global:chaves-ia').length === 0, 'A chave não está em texto aberto em nenhum lugar do app (só a cópia compartilhada "manter" do cofre, para os apps antigos: ' + JSON.stringify(abertos) + ')');

  /* tela das chaves: ✓ guardado, Mostrar, painel da digital */
  await ev(() => DGO.ia.chaves('groq')); await pausa(600);
  const tela = await ev(() => { const m = document.querySelector('dialog.sj[open] .dgo-cofre'); const i = m && m.querySelector('input[data-sj-texto]');
    return { achou: !!m, valor: i ? i.value : 'sem', guardado: m ? /✓ guardado/.test(m.textContent) : false,
      mostrar: m ? !!Array.from(m.querySelectorAll('button')).find(b => /Mostrar a chave guardada/.test(b.textContent)) : false,
      texto: m ? m.textContent.indexOf('gsk_chave_de_mentira') !== -1 : true,
      digital: !!(m && m.querySelector('[data-cifras-digital]') && m.querySelector('[data-cifras-digital]').textContent.trim().length > 0) }; });
  conferir(tela.achou && tela.valor === '' && !tela.texto, 'Chaves de IA: a chave guardada NÃO aparece no campo nem na tela');
  conferir(tela.guardado && tela.mostrar, 'Chaves de IA: "✓ guardado" e "Mostrar a chave guardada"');
  conferir(tela.digital, 'Chaves de IA: o painel da digital (SolverCofre.painelDigital) aparece na tela das chaves');
  await ev(() => document.querySelector('dialog.sj[open] .dgo-cofre button').scrollIntoView());
  await page.click('dialog.sj[open] button:has-text("Mostrar a chave guardada")');
  await page.waitForSelector('dialog#solver-cofre[open]', { timeout: 8000 });
  conferir(!(await ev(() => SolverCofre.aberto())), '"Mostrar a chave" tranca o cofre e pede o PIN');
  await page.fill('#solver-cofre input[type=password]', PIN); await page.click('#solver-cofre button[type=submit]');
  await page.waitForFunction(() => SolverCofre.aberto(), null, { timeout: 15000 }); await pausa(500);
  await page.keyboard.press('Escape'); await vazio();

  /* proteger: PIN ao recarregar com chave guardada */
  await page.reload();
  await page.waitForSelector('dialog#solver-cofre[open]', { timeout: 8000 }).catch(() => {});
  conferir(await ev(() => !!document.querySelector('dialog#solver-cofre[open]')), 'Recarregar com chave guardada pede o PIN (proteger: true)');
  await page.fill('#solver-cofre input[type=password]', PIN); await page.click('#solver-cofre button[type=submit]');
  await page.waitForFunction(() => SolverCofre.aberto(), null, { timeout: 15000 });
  await pausa(300);
  /* sair do app (outro endereço) tranca */
  await page.goto(BASE + '/fora/index.html'); await pausa(800);
  conferir(!(await ev(() => SolverCofre.aberto())), 'Sair do app (ir para outro endereço) tranca o cofre');
  await page.goto(BASE + '/cifra.html?m=peixe-vivo'); await page.waitForFunction(() => window.DGO && DGO.versao);
  await page.waitForSelector('dialog#solver-cofre[open]', { timeout: 8000 }).catch(() => {});
  conferir(await ev(() => !!document.querySelector('dialog#solver-cofre[open]')), 'Voltar ao app pede o PIN de novo');
  await page.mouse.click(5, 5); await pausa(300);
  conferir(await vazio(), 'a janela do PIN fecha tocando fora ("Agora não")');

  conferir(!consoles.concat(erros).some(a => a.indexOf(PIN) !== -1 || a.indexOf(CHAVE) !== -1), 'nenhum PIN ou chave aparece no console');
  if (erros.length) falhas.push(nome + ': erros de página: ' + erros.join(' | '));
  await ctx.close();
}

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME || undefined });
  await rodar(browser, 'celular 390 px', { width: 390, height: 780 });
  await rodar(browser, 'computador 1280 px', { width: 1280, height: 800 });
  await browser.close();
  if (falhas.length) { console.log('\nFALHOU (' + falhas.length + ' de ' + total + '):\n - ' + falhas.join('\n - ')); process.exit(1); }
  console.log('\nOK: ' + total + ' conferências — janelas do CifrasONE pela janela comum e chaves de IA no cofre.');
})().catch(e => { console.error('Erro no teste:', e.message); process.exit(1); });
