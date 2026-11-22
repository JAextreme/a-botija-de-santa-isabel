/* =========================================================
   dialogos_proto.js — CONTEÚDO: diálogos do protótipo.

   FORMATO de um diálogo: um objeto de "nós"; começa em "inicio".
   Cada nó é uma lista de passos:
     ['quem', 'texto']          fala (quem = id de personagem, NPC,
                                'narrador' ou 'lider' = quem está controlando)
     { escolha: [ { txt, vai, flags:{...}, medidores:{...} }, ... ] }
     { flags: { nome: true } }  liga flags
     { medidores: { raiva: 5 } } mexe nos medidores
     { se: 'flag', vai: 'no' }  pula se a flag estiver ligada
     { vai: 'no' }              pula pra outro nó
     { acao: 'nome' }           chama BSI.story.acoes[nome]
     { fim: true }              encerra
   Marcadores no texto: {lider} {controles} {municao}
   ========================================================= */
(function () {
  'use strict';
  var D = BSI.data.dialogos;

  // ---------------- o bode ----------------
  // fogueira acesa: a Oficina do Hugo (melhorar armas com sucata)
  D.bancada_hugo = {
    inicio: [
      ['narrador', 'A fogueira tá boa. Dá pra esquentar o café, descansar e o Hugo abrir a bancada dele.'],
      { escolha: [
        { txt: 'Abrir a Oficina do Hugo (melhorar armas)', acao: 'abrirOficina', vai: 'fim' },
        { txt: 'Só esquentar as mãos', vai: 'fim' }
      ] }
    ],
    fim: [{ fim: true }]
  };
  // placas engraçadas espalhadas pelos mapas (js/world/decoracao.js)
  D.placa_texto = {
    inicio: [
      ['narrador', 'A placa diz: {placa}'],
      { fim: true }
    ]
  };
  D.bode_davi = {
    inicio: [
      ['davi', 'E aí, bode. Tudo em paz?'],
      ['bode', 'Méééé.'],
      ['davi', '(traduzindo) Ele disse que lá na trilha tem um mato fechado que só sai no fogo.'],
      ['bode', 'Mé. Méé-mé.'],
      ['davi', 'E que tem uma pedra que parece pedra, mas não é pedra. E que eu tô devendo dois real a ele.'],
      { se: 'falou_com_bode', vai: 'de_novo' },
      { flags: { falou_com_bode: true } },
      ['daniel', '*ouviu "fogo" e sorriu*'],
      { fim: true }
    ],
    de_novo: [
      ['bode', 'Mééééééé.'],
      ['davi', 'Ele mandou eu parar de perguntar a mesma coisa.'],
      { fim: true }
    ]
  };
  D.bode_outro = {
    inicio: [
      ['bode', 'Méééé.'],
      ['lider', 'Só o Davi entende esse bode. Eu, hein.'],
      { fim: true }
    ]
  };

  // ---------------- a moto ----------------
  D.moto_jp = {
    inicio: [
      ['joaopedro', 'Minha princesa. Escapamento aberto, 2 da manhã, e o vizinho batendo panela de ódio.'],
      ['joaopedro', 'Aperta a HABILIDADE que eu subo nela e saio roncando. O ronco atordoa quem tiver perto.'],
      ['joaopedro', '...e chama todo mundo que tiver longe. Mas isso é detalhe.'],
      { fim: true }
    ]
  };
  D.moto_hugo = {
    inicio: [
      ['hugo', 'Essa moto do João Pedro tá com o escapamento amarrado com arame. Fui eu que amarrei.'],
      { fim: true }
    ]
  };
  D.moto_outro = {
    inicio: [
      ['lider', 'A moto do João Pedro. Ainda tá quente. E os vizinhos também.'],
      { fim: true }
    ]
  };

  // ---------------- a rede ----------------
  D.rede_helano = {
    inicio: [
      ['helano', 'A rede chama. Mas a serra chama mais alto.'],
      { fim: true }
    ]
  };
  D.rede_outro = {
    inicio: [
      ['lider', 'A rede do alpendre. Dá vontade de deitar e esquecer botija, caçada, tudo.'],
      { fim: true }
    ]
  };

  // ---------------- placas ----------------
  D.placa_trilha = {
    inicio: [
      ['narrador', 'Uma placa torta, escrita a carvão: "PRA SERRA. QUEM SOBE DE NOITE DESCE DIFERENTE."'],
      { fim: true }
    ]
  };
  // ---------------- pedras com desenho ----------------
  D.pedra_miguel = {
    inicio: [
      ['miguel', 'Peraí. PERAÍ. Esse desenho na pedra...'],
      ['miguel', 'É o meu estilo cubista! Igualzinho o que eu desenho desde criança!'],
      ['zeneto', 'Isso aí tá aí há uns cem anos, Miguel.'],
      ['miguel', 'Então eu sou um gênio adiantado. Ou atrasado. Um dos dois.'],
      { fim: true }
    ]
  };
  D.pedra_miguel2 = {
    inicio: [
      ['miguel', 'Mais um! Esse aqui parece um mapa... com uma seta apontando pra serra.'],
      ['miguel', 'Fiz não. Mas assinaria embaixo.'],
      { fim: true }
    ]
  };
  D.pedra_outro = {
    inicio: [
      ['lider', 'Uma pedra com um desenho esquisito. O Miguel ia gostar disso.'],
      { fim: true }
    ]
  };
})();
