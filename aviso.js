/* ============================================================
   aviso.js — o aviso de uso, numa janela que abre por cima da
   página, sem sair de onde se está.

   >>> PARA FUNCIONAR, PREENCHA A LINHA ABAIXO <<<
   Crie um formulário grátis em formspree.io, copie o endereço
   que eles dão (algo como https://formspree.io/f/abcdwxyz)
   e cole entre as aspas. Enquanto estiver vazio, o aviso mostra
   que o canal ainda não está no ar.
   ============================================================ */

const FORMULARIO_REMOCAO = '';

const VERSAO_AVISO = '2026-09-17';

function trechoContato(){
  if (!FORMULARIO_REMOCAO){
    return `<p class="alerta-config">O canal de contato ainda não foi configurado.
      Enquanto isso, pedidos podem ser encaminhados pelo repositório do projeto no GitHub.</p>`;
  }
  return `
  <form class="form-remocao" id="form-remocao" novalidate>
    <div class="dupla">
      <label>Nome<input type="text" name="nome" required autocomplete="name"></label>
      <label>E-mail para resposta<input type="email" name="email" required autocomplete="email"></label>
    </div>
    <label>Obra ou página em questão
      <input type="text" name="obra" placeholder="Nome da música, ou o endereço da página"></label>
    <label>Mensagem
      <textarea name="mensagem" rows="4" required
        placeholder="Descrição do pedido e da titularidade alegada."></textarea></label>
    <input type="text" name="_gotcha" tabindex="-1" autocomplete="off" aria-hidden="true" hidden>
    <div class="linha-botoes">
      <button class="botao forte" type="submit">Enviar pedido</button>
      <span class="recado" id="recado-remocao"></span>
    </div>
  </form>`;
}

/* O texto sobre monetização muda conforme o anúncio esteja ligado
   ou desligado no config.js — para o aviso nunca dizer algo que
   não é verdade. */
function trechoMonetizacao(){
  /* o anúncio agora é ligado/desligado no diretrizes-config.js */
  let ligado = false;
  try{ ligado = !!(window.DGO && DGO.cfg && DGO.cfg.anuncios && DGO.cfg.anuncios.ativo); }catch(e){}
  if (!ligado){
    return `<p>Não há publicidade, patrocínio, assinatura, venda de qualquer espécie,
       doação ou outra forma de monetização, direta ou indireta. Nada aqui é
       comercializado e nenhuma receita é obtida a partir do conteúdo reunido.</p>`;
  }
  return `<p>Este acervo exibe um espaço publicitário no topo das páginas e oferece um
     perfil de assinante que remove esse espaço. O conteúdo reunido — letras e
     harmonias — não é vendido, licenciado nem oferecido como produto, e o acesso a
     ele é o mesmo para quem vê e para quem não vê o anúncio.</p>
  <p>Fica registrado, por honestidade, que a existência de publicidade afasta este
     acervo do uso estritamente privado de que trata o art. 46 da Lei nº 9.610/1998.
     Qualquer titular que prefira não ver sua obra num site com publicidade pode
     pedir a remoção pelo formulário da seção 3, que é atendida de imediato.</p>`;
}

function textoDoAviso(){ return `
  <h2 id="titulo-aviso">Aviso</h2>
  <p class="atualizado">Última atualização:
     ${typeof formatarData === 'function' ? formatarData(VERSAO_AVISO) : VERSAO_AVISO}</p>
  <p class="atualizado" lang="en">This notice is written in Portuguese because it refers to
     Brazilian law (Lei 9.610/1998 and Lei 13.709/2018).</p>

  <h3>1. Natureza e finalidade</h3>
  <p>Este site é um acervo particular de cifras de violão, mantido para estudo e
     prática musical individual. Não se trata de serviço, produto ou publicação
     dirigida ao público.</p>
  ${trechoMonetizacao()}

  <h3>2. Direitos autorais</h3>
  <p>As letras e as harmonias aqui reunidas pertencem aos respectivos autores,
     intérpretes e editoras. Nenhuma titularidade é reivindicada sobre esse
     material, e a presença neste acervo não implica cessão, licença ou
     autorização de uso por terceiros.</p>
  <p>A compilação tem caráter de anotação pessoal de estudo, na linha do que dispõe
     o art. 46 da Lei nº 9.610/1998. Não substitui, nem pretende substituir, a
     aquisição de songbooks, partituras, fonogramas ou o acesso a serviços
     devidamente licenciados, que seguem sendo o caminho recomendado para quem
     deseja o material de forma completa e autorizada.</p>
  <p>Este acervo não hospeda áudio, vídeo ou partitura digitalizada. As indicações
     de Spotify e YouTube são apenas links de busca para os serviços oficiais.</p>

  <h3>3. Pedidos de remoção</h3>
  <p>Qualquer autor, editora, intérprete ou representante legal que identifique
     conteúdo de titularidade própria neste acervo pode solicitar a retirada pelo
     formulário abaixo. A remoção é feita de imediato, sem necessidade de ordem
     judicial, exigência de comprovação formal ou qualquer contrapartida.</p>
  ${trechoContato()}

  <h3>4. Dados pessoais</h3>
  <p>Este site é estático. Não possui servidor de aplicação nem banco de dados.
     Existe uma tela de perfil (visitante, assinante e anunciante), mas ela funciona
     inteiramente dentro do navegador: o nome e a senha ficam gravados apenas no
     aparelho de quem usa, não são transmitidos a lugar algum e não constituem
     cadastro. A navegação não é registrada: não são utilizados cookies de
     rastreamento, pixels, ferramentas de analytics, mapas de calor ou qualquer
     instrumento de medição de audiência.</p>
  <p>No perfil de visitante existe a opção de não guardar nada no aparelho: com ela
     ligada, favoritos, tons escolhidos e a fila de importação são apagados ao fechar
     o navegador.</p>
  <p>Fotografias abertas na página "Foto vira cifra" são lidas dentro do próprio
     navegador, por um motor de reconhecimento de texto que roda no aparelho. Nenhuma
     imagem é enviada para servidor algum.</p>
  <p>As preferências de uso — tema, imagem de fundo, músicas favoritas, tom escolhido,
     tamanho da letra e a fila da página de importação — ficam gravadas exclusivamente
     no armazenamento local do navegador utilizado, permanecem no próprio aparelho e
     não trafegam para lugar algum. Limpar os dados do navegador apaga todas elas.</p>
  <p>Arquivos abertos na página de importação, inclusive PDFs, são processados dentro
     do próprio navegador e não são enviados a nenhum servidor.</p>
  <p>Há uma única exceção, e ela é voluntária: o formulário da seção 3. Os dados ali
     informados — nome, e-mail e o texto da mensagem — são transmitidos ao serviço
     Formspree, que os encaminha por correio eletrônico ao responsável pelo acervo,
     e ficam sujeitos à política de privacidade daquele serviço. São utilizados
     apenas para responder à solicitação enviada.</p>
  <p>Pelo caráter exclusivamente pessoal e não econômico da atividade, não se
     configura tratamento de dados sujeito à Lei nº 13.709/2018, conforme o art. 4º,
     inciso II, alínea "a".</p>
  <p>A hospedagem é feita pelo GitHub Pages. Como ocorre com qualquer site, o
     provedor de hospedagem mantém registros técnicos de acesso próprios, regidos
     pelas políticas do GitHub, fora do controle deste acervo.</p>

  <h3>5. Conteúdo de terceiros</h3>
  <p>Os links para serviços externos levam a buscas nas plataformas correspondentes.
     O conteúdo, a disponibilidade e as políticas desses serviços são de
     responsabilidade exclusiva dos respectivos operadores.</p>

  <h3>6. Ausência de garantias</h3>
  <p>As cifras podem conter erros de transcrição, tom ou digitação, e representam
     uma entre várias interpretações possíveis de cada obra. O material é
     disponibilizado no estado em que se encontra, sem garantia de exatidão,
     integralidade ou adequação a qualquer finalidade específica.</p>

  <h3>7. Alterações</h3>
  <p>Este aviso pode ser alterado a qualquer tempo, sem comunicação prévia. A data
     no topo indica a última revisão.</p>`;
}

/* ---------- a janela ---------- */
let janelaAviso = null;

function montarJanelaAviso(){
  if (janelaAviso) return janelaAviso;
  janelaAviso = document.createElement('dialog');
  janelaAviso.className = 'janela';
  janelaAviso.setAttribute('aria-labelledby', 'titulo-aviso');
  janelaAviso.innerHTML = `
    <button class="fechar-janela" aria-label="Fechar">✕</button>
    <div class="janela-texto texto-legal">${textoDoAviso()}</div>
    <div class="janela-rodape">
      <button class="botao forte" data-fecha-janela>Fechar</button>
    </div>`;
  document.body.appendChild(janelaAviso);

  janelaAviso.querySelectorAll('.fechar-janela, [data-fecha-janela]')
    .forEach(b => b.addEventListener('click', fecharAviso));

  /* clicar fora, na parte escura, também fecha */
  janelaAviso.addEventListener('click', e=>{
    if (e.target === janelaAviso) fecharAviso();
  });
  janelaAviso.addEventListener('close', ()=>{
    if (location.hash === '#aviso') history.replaceState(null, '', location.pathname);
  });

  const form = janelaAviso.querySelector('#form-remocao');
  if (form) form.addEventListener('submit', enviarPedido);
  return janelaAviso;
}

function abrirAviso(){
  const j = montarJanelaAviso();
  if (!j.open) j.showModal();
  j.querySelector('.janela-texto').scrollTop = 0;
}
function fecharAviso(){ if (janelaAviso && janelaAviso.open) janelaAviso.close(); }

async function enviarPedido(e){
  e.preventDefault();
  const form = e.target;
  const recado = form.querySelector('#recado-remocao');
  const botao = form.querySelector('button[type=submit]');

  if (!form.nome.value.trim() || !form.email.value.trim() || !form.mensagem.value.trim()){
    recado.textContent = 'Preencha nome, e-mail e mensagem.';
    recado.className = 'recado erro';
    return;
  }
  botao.disabled = true;
  recado.textContent = 'Enviando…';
  recado.className = 'recado';
  try{
    const r = await fetch(FORMULARIO_REMOCAO, {
      method:'POST',
      headers:{'Accept':'application/json'},
      body:new FormData(form)
    });
    if (!r.ok) throw new Error('resposta ' + r.status);
    form.reset();
    recado.textContent = 'Pedido enviado. A resposta vai para o e-mail informado.';
    recado.className = 'recado certo';
  }catch(erro){
    recado.innerHTML = 'Não foi possível enviar agora. Tente novamente em alguns minutos.';
    recado.className = 'recado erro';
  }finally{
    botao.disabled = false;
  }
}

/* o link do rodapé e o endereço terminado em #aviso abrem a janela */
document.addEventListener('click', e=>{
  const alvo = e.target.closest('[data-abre-aviso]');
  if (!alvo) return;
  e.preventDefault();
  abrirAviso();
});
window.addEventListener('DOMContentLoaded', ()=>{
  if (location.hash === '#aviso') abrirAviso();
});
