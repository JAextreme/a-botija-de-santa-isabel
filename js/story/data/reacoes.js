/* =========================================================
   reacoes.js — REAÇÕES A EVENTOS (balão de quem estiver no grupo)
   [quem, texto, espera_em_segundos_até_repetir]
   'qualquer' = alguém do grupo.
   E as FOFOCAS dos NPCs: mudam por ato e pelo que vocês fizeram.
   Uma fofoca nova por conversa; quando acabam, ele fala o normal.
   ========================================================= */
(function () {
  'use strict';
  BSI.data.reacoes = {
    caca: [
      ['helano', 'A mata viu isso. E a mata não esquece.'], ['davi', 'O bode vai ficar sabendo disso, viu?'], ['miguel', 'Coitado do bicho... era bonito.'],
      ['zeneto', 'Atestado de óbito do tatu: tiro e falta de juízo.'], ['joaopedro', 'Eita. A Caipora tá anotando nossa placa.'], ['vander', '...ela tá olhando. Eu sinto.'],
      ['qualquer', 'Ouvi um assobio na mata... foi o vento, né? NÉ?']
    ],
    fogo: [
      ['daniel', 'Hehe. Olha que bonito.'], ['daniel', 'Tá espalhando. Hehe.'], ['helano', 'Fogo que se acende fácil se apaga difícil.'],
      ['zeneto', 'Queimadura de terceiro grau no mato! Alguém tem água?'], ['hugo', 'Isso não tem gambiarra que conserte.'], ['qualquer', 'DANIEL! Para de sorrir e ajuda!']
    ],
    web: [
      ['joaopedro', 'Lapuca, de novo no celular? Quem é essa moça?'], ['davi', 'Lapuca, o bode disse que essa namorada não existe.'], ['miguel', 'Ela mandou foto? Deixa eu ver o enquadramento.'],
      ['zeneto', 'Lapuca, isso é síndrome de web namorada. Tem cura: bloquear.'], ['vander', 'Eu vi como isso termina. Larga esse celular.']
    ],
    tiaZane: [
      ['miguel', 'É A TIA ZANE! CORRE!'], ['davi', 'A chinela! A chinela teleguiada!'], ['joaopedro', 'Fingindo que é estátua... fingindo que é estátua...'], ['qualquer', 'Alguém comeu a carne dela de novo?!']
    ],
    fakeNews: [
      ['helano', 'O Stelo acerta uma em cada três. O difícil é saber qual.'], ['zeneto', 'Isso aí é desinformação crônica.'], ['joaovitor', 'Comprei essa notícia. Vou revender mais caro.'],
      ['davi', 'O bode leu essa notícia e riu.'], ['qualquer', 'Essa o Stelo inventou agora, tenho certeza.']
    ],
    poder: [
      ['helano', 'Juntos, o sertão treme.'], ['joaopedro', 'BORA, CAMBADA!'], ['davi', 'TODO MUNDO TIRANDO O EXCESSO JUNTO!'],
      ['joaoluiz', 'Pela tribo e por quem não é tribo também!'], ['miguel', 'Isso é uma obra coletiva!'], ['qualquer', 'É agora, gente!']
    ],
    juizoBaixo: [
      ['zeneto', 'Gente, eu acho que a gente tá ficando doido. Diagnóstico sério.'], ['helano', 'Juízo é igual açude: quando seca, aparece tudo que tava no fundo.'],
      ['davi', 'Eu já tô vendo dois bodes. E só tem um.'], ['joaopedro', 'Tô ouvindo uma música que nem existe.'], ['qualquer', 'Minha cabeça tá rodando...']
    ],
    lendaria: [
      ['helano', 'Isso aqui tem história. Respeito.'], ['miguel', 'Isso devia estar num museu! Meu museu!'], ['joaopedro', 'EITA! Agora sim!'],
      ['davi', 'Exatamente como eu planejei. Não planejei nada.'], ['vander', 'Eu sonhei com isso.'], ['qualquer', 'Que coisa bonita!']
    ]
  };

  // ----- FOFOCAS dos NPCs: { se, seNao, fala } — a primeira que bater e ainda não foi dita -----
  BSI.data.fofocas = {
    socorro: [
      { se: 'paulo_aliado', fala: 'Fiquei sabendo que vocês fizeram as pazes com o Paulo do Zé Baixinho. O Roma inteiro passou aqui comprando rapadura pra comemorar.' },
      { se: 'paulo_derrotado', seNao: 'paulo_aliado', fala: 'O Paulo do Zé Baixinho passou aqui com o olho roxo. Disse que foi a porta. A porta tem nome, né?' },
      { se: 'alma_derrotada', fala: 'Dizem que a alma da casa do Dudu sossegou. O Dudu veio aqui e comprou café pela primeira vez em vinte anos.' },
      { medidor: ['raiva', 60], fala: 'Os bichos da mata andam estranhos. O galo cantou de noite e a galinha botou ovo quadrado. É a Caipora, meus filhos. Respeitem.' },
      { se: 'gojoba_vencido', fala: 'O Gojoba tá proibido de comprar pilha aqui. Ordem da cidade inteira.' },
      { se: 'stelo_caos', fala: 'Recebi um áudio dizendo que vocês são reptilianos. Não acreditei. Mas vou contar os dedos de vocês, só por garantia.' },
      { se: 'tia_zane_respeitada', fala: 'A Tia Zane passou aqui falando bem de vocês. Fiquei até preocupada. Ela nunca fala bem de ninguém.' }
    ],
    padre: [
      { se: 'alma_derrotada', fala: 'Senti uma paz esses dias. Como se uma alma antiga tivesse finalmente ido descansar. Obra de vocês?' },
      { medidor: ['juizo', -40], fala: 'Meus filhos, vocês estão com uma cara... Venham na missa. Nem que seja pra dormir.' },
      { se: 'irmaos_unidos', fala: 'Soube dos três irmãos. Família que se reencontra é milagre pequeno. Mas é milagre.' },
      { se: 'queimou_caixa', fala: 'Dizem que queimaram a caixa de som do Gojoba. Rezei um terço de agradecimento. Não contem pra ele.' }
    ],
    benedita: [
      { medidor: ['desconfianca', 40], fala: 'Tem desconfiança nesse grupo, meus filhos. Tá na cara de vocês. Briga de amigo não se leva pra cama.' },
      { medidor: ['raiva', 50], fala: 'A dona da mata tá zangada com vocês. Deixem fumo no toco e peçam desculpa, que ela perdoa.' },
      { se: 'alma_derrotada', fala: 'O Tio Ota tá contente. Eu sei. Senti ele passar aqui de manhã, com cheiro de curral.' }
    ],
    stelo: [
      { se: 'gojoba_vencido', fala: 'Fofoca fresquinha: o Gojoba tá dizendo que perdeu a briga de propósito. Pra deixar vocês felizes.' },
      { se: 'paulo_aliado', fala: 'Soube que o Paulo agora é aliado de vocês. Isso é fake news? Não? Pois eu vou espalhar que é.' },
      { fala: 'Notícia de hoje, quentinha: {lista:steloFake}' },
      { fala: 'Saiu no grupo da família: {lista:steloFake}' }
    ],
    felipe: [
      { fala: 'Oferta do dia, parceiro: {lista:felipeOfertas}' },
      { se: 'comprou_moto_felipe', fala: 'E a moto sem motor, tá gostando? Tenho o motor também. Sem a moto.' },
      { fala: 'Só hoje, parceiro, preço de amigo: {lista:felipeOfertas}' }
    ],
    seuchico: [
      { se: 'porteira_aberta', fala: 'Vocês passaram pela porteira do Paulo. Coragem tem. Juízo eu não sei.' },
      { fala: 'O Tio Ota aboiava aqui nesse chão. O gado ainda vira a cabeça quando o vento bate do lado do curral dele.' }
    ]
  };
})();
