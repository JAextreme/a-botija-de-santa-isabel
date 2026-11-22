/* =========================================================
   fases.js (CONTEÚDO) — a sequência jogável da história.
   Cada fase: ato, titulo, subtitulo (cartela), mapa, chegada,
   grupo ativo (4 a 6), abertura (diálogo), objetivo, e
   verificar(mundo) opcional (checado a cada passo).
   Portas com "fase" no mapa levam para a fase seguinte.
   ========================================================= */
(function () {
  'use strict';

  BSI.data.ordemFases = ['prologo', 'ato1_cacada', 'ato1_paulo', 'interludio', 'amanhecer', 'ato2_bar', 'ato2_tapera', 'ato3_festa'];

  BSI.data.fases = {
    prologo: {
      ato: 'PRÓLOGO', titulo: 'Duas da Manhã', subtitulo: 'Sexta-feira, lua cheia, Santa Isabel',
      mapa: 'terreiro', chegada: { x: 9, y: 12 },
      grupo: ['joaopedro', 'miguel', 'daniel', 'davi', 'helano', 'zeneto'],
      abertura: 'prologo_abertura',
      objetivo: 'Pegue as espingardas e a cartucheira no alpendre e chame Trovão e Piaba.',
      // quando tudo estiver pronto, o Vander chega com o sonho
      verificar: function (m) {
        var t = BSI.story.tem;
        if (t('pegou_espingardas') && t('pegou_cartucheira') && t('chamou_cachorros')) BSI.fases.dispararEvento('prologo_vander', m);
      }
    },
    ato1_cacada: {
      ato: 'ATO I', titulo: 'A Caçada que Dá Errado', subtitulo: 'Na serra, quem caça também é caçado',
      mapa: 'trilha', chegada: { x: 19.5, y: 29 },
      grupo: ['joaopedro', 'miguel', 'daniel', 'davi', 'helano', 'zeneto'],
      abertura: 'ato1_abertura',
      objetivo: 'Suba a serra até o alto. Cace se quiser... mas a mata tá olhando.'
    },
    ato1_paulo: {
      ato: 'ATO I', titulo: 'O Pedágio do Roma', subtitulo: 'Três da manhã nas terras do presidente',
      mapa: 'terras_paulo', chegada: { x: 1.5, y: 10.5 },
      grupo: ['joaovitor', 'joaoluiz', 'luizfernando', 'helano', 'miguel', 'joaopedro'],
      abertura: 'ato1_paulo_abertura',
      objetivo: 'Passe pela porteira do pedágio e chegue ao campo do Roma.'
    },
    interludio: {
      ato: 'INTERLÚDIO', titulo: 'A Noite da Pipoca', subtitulo: 'Açudinho, ao lado do curral do Tio Ota',
      mapa: 'acudinho', chegada: { x: 16, y: 20 },
      grupo: ['miguel', 'daniel', 'joaopedro', 'vander', 'helano', 'davi'],
      abertura: 'interludio_abertura',
      objetivo: 'Vá até a fogueira assar a carne e fazer a pipoca.'
    },
    amanhecer: {
      ato: 'INTERLÚDIO', titulo: 'O Amanhecer', subtitulo: 'E a Tia Zane acordou',
      mapa: 'acudinho', chegada: { x: 18, y: 20 },
      grupo: ['miguel', 'daniel', 'joaopedro', 'vander', 'helano', 'davi'],
      ambiente: 0.85, tinta: 'rgb(70,30,40)', semVagalumes: true,
      abertura: 'amanhecer_dudu',
      roteiro: function () { return BSI.data.eventos.tia_zane_chega(); }
    },
    ato2_bar: {
      ato: 'ATO II', titulo: 'A Tapera', subtitulo: 'Fim de tarde em Santa Isabel',
      mapa: 'santa_isabel', chegada: { x: 24, y: 30 },
      grupo: ['hugo', 'joaocarlos', 'davi', 'joaopedro', 'miguel', 'zeneto'],
      tinta: 'rgb(60,24,30)',
      abertura: 'ato2_abertura',
      objetivo: 'Vá ao bar do Stelo (oeste da praça) ouvir as notícias... e as fake news.'
    },
    ato2_tapera: {
      ato: 'ATO II', titulo: 'O Caminho da Tapera', subtitulo: 'No pé da serra, onde tudo começou',
      mapa: 'caminho_tapera', chegada: { x: 1.5, y: 14.5 },
      grupo: ['davi', 'joaopedro', 'vander', 'hugo', 'daniel', 'helano'],
      abertura: 'ato2_tapera_abertura',
      objetivo: 'Siga o mapa do Miguel até a tapera, ao norte.'
    },
    ato3_festa: {
      ato: 'ATO III', titulo: 'A Noite da Festa', subtitulo: 'A padroeira, o palanque e a botija',
      mapa: 'praca_festa', chegada: { x: 2, y: 17.5 },
      grupo: ['miguel', 'hugo', 'joaovitor', 'helano', 'joaopedro', 'davi'],
      cachorros: false,
      abertura: 'ato3_abertura',
      objetivo: 'O plano: Miguel rouba a botija no camarim, Hugo sabota o gerador. Falem com os aliados e cheguem perto do palanque.'
    }
  };
})();
