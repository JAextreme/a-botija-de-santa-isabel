/* =========================================================
   falas.js — CONTEÚDO: frases curtas que aparecem em balão
   em cima dos personagens durante a ação, e as mensagens de
   web namorada do Helano. Acrescente à vontade.
   ========================================================= */
(function () {
  'use strict';

  BSI.data.falas = {
    semMunicao: ['Acabou o cartucho, macho!', 'Tá liso de munição.', 'Click. Só o click.'],
    zenetoDesmaio: ['Ai... sangue... não...', 'Vou ali desmaiar e já volto.', 'Me dá um boldo...'],
    zenetoCura: ['Toma uma dipirona!', 'Chá de boldo resolve tudo.', 'Isso aí é virose, toma isso.', 'Diagnóstico: tu tá bom. Eu acho.'],
    zenetoFalha: ['Eita... era pra ser boldo... era?', 'Errei a dose. Fica zonzo um pouquinho.', 'Hmm. Efeito colateral raro. Raríssimo.'],
    helanoTiro: ['O tempo é do sertão.', 'Quem espera, acerta.', 'A bala já sabe pra onde vai.', 'Botija contada é botija cobrada.'],
    labiaConverte: ['Parceiro, tu tá do lado errado. O de cá paga melhor.', 'Tu é primo do meu primo, sabia? Família não briga.', 'Te pago amanhã. Juro pela tribo.'],
    labiaPedagio: ['Pedágio pago. Agora some daqui.', 'Deixa uns cartuchos aí que eu esqueço tua cara.'],
    lealdade: ['Ninguém toca na tribo!', 'Atrás de mim, Amadeus!', 'Tampa de panela é escudo sagrado.'],
    ritual: ['Pelo círculo dos Amadeus!', 'Quem tá dentro do círculo não cai.', 'Giz, palma e juramento!'],
    escapamento: ['VRUUUUM! 2 da manhã é minha hora!', 'Escuta esse ronco, macho!', 'Escapamento aberto é patrimônio!'],
    vander: ['Eu vi isso num sonho.', '...', 'Ninguém me viu chegando.'],
    roubo: ['Ninguém viu nada.', 'Roubo da madrugada, papai.', 'Sombra não tem dono.'],
    gambiarra: ['Arame, prego e fé.', 'Funciona se ninguém olhar muito.', 'Deixa que eu ajeito.'],
    danielFogo: ['Hehe.', 'Olha que bonito.', '*sorri*', 'Queima devagarzinho...'],
    provocacao: ['Vem cá, cabra frouxo!', 'Bate em mim, se tem coragem!', 'Teu chapéu é feio!'],
    negaFogo: ['Negou fogo! É a Caipora!', 'Click... a espingarda não quis.', 'Essa arma tá com medo da mata.'],
    caca: ['A mata tá olhando...', 'Ouviram esse assobio?', 'Eita, que a Caipora não gostou.'],
    checkpoint: ['Fogueira acesa. Bora descansar um tiquinho.'],

    // frase ao virar o personagem controlado
    troca_helano: ['Hm.', 'O caminho se mostra a quem anda.'],
    troca_zeneto: ['Doutor na área!', 'Alguém aí tá precisando de um boldo?'],
    troca_joaovitor: ['Deixa comigo, que eu resolvo na conversa.', 'Quanto é que eu ganho nisso?'],
    troca_joaoluiz: ['Pela tribo!', 'Amadeu não abandona Amadeu.'],
    troca_luizfernando: ['O círculo tá pronto.', 'Isso aqui pede um ritual.'],
    troca_joaopedro: ['Bora, que a moto tá quente!', 'Meu altar tá rezando por nós. Os dois lados.'],
    troca_davi: ['Tenho um plano infalível!', 'O bode me contou tudo.'],
    troca_vander: ['...', 'Eu já sabia que tu ia me chamar.'],
    troca_miguel: ['Cadê minha carne?', 'Ninguém viu eu aqui.'],
    troca_hugo: ['Dá pra consertar. Quase tudo dá.', 'Cadê minha chave inglesa?'],
    troca_daniel: ['*sorri*', 'Alguém tem fósforo?'],
    troca_joaocarlos: ['Diga, primo.', 'Bora resolver isso em família.']
  };

  // Mensagens que chegam no celular do Helano (minigame de deslizar)
  BSI.data.webNamoradas = [
    { de: 'Morena de São Paulo', msg: 'Oi sumido... tô pensando em tu aí no sertão.' },
    { de: 'Galega de Fortaleza', msg: 'Manda um áudio, vai? Tua voz é tão de profeta.' },
    { de: 'Morena de São Paulo', msg: 'Me empresta 50 reais pra passagem? Volto pra te ver.' },
    { de: 'Ruiva de Recife', msg: 'Tu é o homem mais misterioso do Ceará, sabia?' },
    { de: 'Galega de Fortaleza', msg: 'Liga a câmera. Só um pouquinho. Por favor.' }
  ];

  BSI.falas = {
    sorteia: function (chave) {
      var l = BSI.data.falas[chave];
      if (!l || !l.length) return '';
      return l[Math.floor(Math.random() * l.length)];
    }
  };
})();
