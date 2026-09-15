/* ============================================================
   zip.js — monta um arquivo .zip dentro do navegador,
   sem depender de nenhuma biblioteca de fora.
   Guarda os arquivos sem compactar (o formato "stored" do zip),
   que é simples e qualquer descompactador abre.
   ============================================================ */

const TABELA_CRC = (()=>{
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++){
    let c = n;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(bytes){
  let c = 0xFFFFFFFF;
  for (let i = 0; i < bytes.length; i++) c = TABELA_CRC[(c ^ bytes[i]) & 0xFF] ^ (c >>> 8);
  return (c ^ 0xFFFFFFFF) >>> 0;
}

/* data e hora no formato antigo que o zip usa */
function dataHoraZip(d){
  const hora = ((d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1)) & 0xFFFF;
  const data = (((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate()) & 0xFFFF;
  return {hora, data};
}

/* arquivos = [{nome:'musica.txt', texto:'...'}]  ->  Blob do zip */
function montarZip(arquivos){
  const cod = new TextEncoder();
  const {hora, data} = dataHoraZip(new Date());
  const pedacos = [];        // partes do arquivo final
  const central = [];        // o "índice" que vai no fim do zip
  let posicao = 0;

  arquivos.forEach(a=>{
    const nome = cod.encode(a.nome);
    const conteudo = cod.encode(a.texto);
    const soma = crc32(conteudo);

    const cabecalho = new DataView(new ArrayBuffer(30));
    cabecalho.setUint32(0, 0x04034b50, true);   // assinatura
    cabecalho.setUint16(4, 20, true);           // versão necessária
    cabecalho.setUint16(6, 0x0800, true);       // nomes em UTF-8
    cabecalho.setUint16(8, 0, true);            // sem compactação
    cabecalho.setUint16(10, hora, true);
    cabecalho.setUint16(12, data, true);
    cabecalho.setUint32(14, soma, true);
    cabecalho.setUint32(18, conteudo.length, true);
    cabecalho.setUint32(22, conteudo.length, true);
    cabecalho.setUint16(26, nome.length, true);
    cabecalho.setUint16(28, 0, true);
    pedacos.push(new Uint8Array(cabecalho.buffer), nome, conteudo);

    const entrada = new DataView(new ArrayBuffer(46));
    entrada.setUint32(0, 0x02014b50, true);
    entrada.setUint16(4, 20, true);             // versão de quem criou
    entrada.setUint16(6, 20, true);
    entrada.setUint16(8, 0x0800, true);
    entrada.setUint16(10, 0, true);
    entrada.setUint16(12, hora, true);
    entrada.setUint16(14, data, true);
    entrada.setUint32(16, soma, true);
    entrada.setUint32(20, conteudo.length, true);
    entrada.setUint32(24, conteudo.length, true);
    entrada.setUint16(28, nome.length, true);
    entrada.setUint32(42, posicao, true);       // onde o arquivo começa
    central.push(new Uint8Array(entrada.buffer), nome);

    posicao += 30 + nome.length + conteudo.length;
  });

  const tamanhoCentral = central.reduce((s, p) => s + p.length, 0);
  const fim = new DataView(new ArrayBuffer(22));
  fim.setUint32(0, 0x06054b50, true);
  fim.setUint16(8, arquivos.length, true);
  fim.setUint16(10, arquivos.length, true);
  fim.setUint32(12, tamanhoCentral, true);
  fim.setUint32(16, posicao, true);

  return new Blob([...pedacos, ...central, new Uint8Array(fim.buffer)],
                  {type:'application/zip'});
}
