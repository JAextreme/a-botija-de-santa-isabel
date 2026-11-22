/* =========================================================
   config/visual.js — NÚMEROS DO VISUAL (pode mexer à vontade)
   Luz, horários do dia por fase, minimapa e decoração.
   ========================================================= */
(function () {
  'use strict';
  var BSI = window.BSI = window.BSI || {};
  BSI.config = BSI.config || {};

  BSI.config.visual = {
    // ---------------- LUZ ----------------
    luz: {
      // luz mínima que SEMPRE existe (luar). 0 = breu, 1 = dia.
      minimoNormal: 0.46,
      minimoReduzida: 0.6,      // opção "Escuridão: Reduzida"
      minimoTerror: 0.14,       // alma da casa do Dudu, partes da tapera
      minimoTerrorReduzida: 0.3,
      lanternaBase: 48,         // raio da lanterna com pilha zerada
      lanternaExtra: 40,        // + isso com pilha cheia
      fogueiraRaio: 92,
      // contorno dos personagens/inimigos no escuro (0 = sem contorno)
      contornoNoEscuro: 0.55,
      forcaLanterna: 0.82,      // 1 = apaga a noite toda no facho; menos = a noite ainda tinge
      forcaCompanheiro: 0.55
    },

    // ---------------- HORÁRIOS ----------------
    // ambiente: claridade; tinta: cor da sombra (o "clima" da hora)
    horarios: {
      dia:        { nome: 'Dia quente',          ambiente: 1.0,  tinta: 'rgb(60,40,20)' },
      fimDeTarde: { nome: 'Fim de tarde dourado', ambiente: 0.82, tinta: 'rgb(110,50,20)' },
      noite:      { nome: 'Noite enluarada',     ambiente: 0.5,  tinta: 'rgb(14,22,60)' },
      madrugada:  { nome: 'Madrugada roxa',      ambiente: 0.44, tinta: 'rgb(40,16,60)' },
      amanhecer:  { nome: 'Amanhecer alaranjado', ambiente: 0.86, tinta: 'rgb(110,40,40)' },
      festa:      { nome: 'Noite de festa',      ambiente: 0.58, tinta: 'rgb(40,16,50)' },
      interior:   { nome: 'Dentro de casa',      ambiente: 0.8,  tinta: 'rgb(40,24,16)' },
      terror:     { nome: 'Terror',              ambiente: 0.06, tinta: 'rgb(4,6,20)' }
    },
    // horário de cada fase (o mapa pode ter "interior" ou "terror")
    horarioDaFase: {
      prologo: 'noite',
      ato1_cacada: 'madrugada',
      ato1_paulo: 'madrugada',
      interludio: 'noite',
      amanhecer: 'amanhecer',
      ato2_bar: 'fimDeTarde',
      ato2_tapera: 'noite',
      ato3_festa: 'festa'
    },

    // ---------------- MINIMAPA ----------------
    minimapa: {
      ligado: true,
      posicao: 'cimaDireita',   // cimaDireita | cimaEsquerda | baixoDireita | baixoEsquerda
      tamanho: 'medio',         // pequeno | medio | grande
      transparencia: 0.15,      // 0 = opaco
      raioRevelar: 8,           // em tiles: quanto da névoa some em volta do grupo
      atualizacoesPorSegundo: 4,
      pixelsPorTile: { pequeno: 2, medio: 3, grande: 4 },
      larguraTiles: { pequeno: 44, medio: 40, grande: 42 }
    },

    // ---------------- DECORAÇÃO ----------------
    decoracao: {
      densidadeMiudezas: 0.16,  // pedrinha, capim, osso... (por tile livre)
      densidadeFauna: 1.0,      // multiplica galinhas, calangos, urubus...
      eventosACadaSeg: [40, 90] // intervalo dos eventos aleatórios (redemoinho, jumento...)
    }
  };
})();
