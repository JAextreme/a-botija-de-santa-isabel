/* =========================================================
   config/balance.js — NÚMEROS DO JOGO (pode mexer à vontade)
   Grupo, IA dos companheiros e ajudas.
   (Armas ficam em config/weapons.js a partir da Etapa 3.)
   ========================================================= */
(function () {
  'use strict';
  var BSI = window.BSI = window.BSI || {};
  BSI.config = BSI.config || {};

  BSI.config.balance = {
    grupo: {
      // quando um objeto precisa de alguém específico (cabo → Hugo),
      // quanto tempo ele tem pra chegar correndo antes de "teleportar" do lado
      tempoChegar: 1.6,
      // companheiros usam a habilidade sozinhos: 'sim' | 'pedir' (só com 1-6) | 'nao'
      autoHabilidades: 'sim',
      // a IA pensa em usar habilidade a cada X segundos
      pensarHabilidade: 0.6,
      // recarga extra (multiplicador) quando a IA usa sozinha (deixa o jogador decidir os momentos grandes)
      recargaIA: 1.4,
      // distância máxima pra um companheiro aceitar uma ordem de habilidade (1-6)
      alcancePedido: 260
    },
    // CONVERSAS DE ESTRADA: de quanto em quanto tempo (segundos, andando e fora de briga)
    estrada: { intervalo: [35, 70] },
    // DIFICULDADE (escolhida no Novo Jogo; dá pra mudar em Opções)
    dificuldades: {
      turista: { nome: 'Turista (fácil)', danoInimigo: 0.5, vidaInimigo: 0.75, danoGrupo: 1.3, maxAtacando: 2, municao: 1.5 },
      cabra: { nome: 'Cabra da Peste (normal)', danoInimigo: 1, vidaInimigo: 1, danoGrupo: 1, maxAtacando: 3, municao: 1 },
      lapuca: { nome: 'Lapuca (difícil)', danoInimigo: 1.5, vidaInimigo: 1.3, danoGrupo: 0.85, maxAtacando: 3, municao: 0.7 }
    },
    // COMBATE (Etapa 3): sensação de impacto e esquiva
    combate: {
      hitstopBase: 0.05,     // pausinha no acerto (segundos)
      hitstopMax: 0.08,
      hitstopCritico: 0.08,
      esquivaDur: 0.26,      // quanto tempo dura o rolamento
      esquivaInv: 0.36,      // invencível durante (um tiquinho a mais)
      esquivaRecarga: 0.9,   // espera entre uma esquiva e outra
      esquivaVel: 3.0,       // velocidade do rolamento (x a normal)
      maxAtacando: 3         // no máximo quantos inimigos atacam ao mesmo tempo
    },
    ordens: {
      // AVANÇAR: até onde os companheiros vão atrás de inimigo
      avancarAlcance: 170,
      // SEGURAR: raio em volta do ponto marcado
      segurarRaio: 40
    }
  };
})();
