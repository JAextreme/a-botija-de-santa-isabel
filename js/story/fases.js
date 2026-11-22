/* =========================================================
   fases.js — MOTOR da história:
   - FASES: cada trecho jogável (mapa, grupo ativo, objetivo,
     cartela de capítulo e diálogo de abertura). Conteúdo em
     js/story/data/fases.js
   - ROTEIRO: cutscenes em sequência de passos (falas, esperas,
     minigames, NPC andando, fade...). Durante o roteiro o jogador
     não controla ninguém e os inimigos param.
   - EVENTOS: zonas no mapa que disparam roteiros (data/eventos_*.js)
   - PISTAS: Caderno de Pistas (data/pistas.js)
   ========================================================= */
(function () {
  'use strict';
  var U = BSI.util;

  // =========================================================
  //  ROTEIRO
  //  passos: ['fala', spec] ['espera', s] ['faz', fn(m)]
  //          ['minigame', fn(m, pronto)] ['cartela', ato, titulo, sub]
  //          ['fade', fn(m)] ['npcAnda', id, tx, ty, maxSeg]
  //          ['se', fnCond(m), [passos], [passos]] ['objetivo', txt]
  //          ['aviso', txt] ['pista', id] ['flag', nome, valor]
  //          ['medidor', nome, delta] ['som', nome]
  // =========================================================
  var R = BSI.roteiro = {
    ativo: false,
    fila: [],
    esperando: null,   // função que diz se já pode seguir
    tEspera: 0,
    aoFim: null,
    pilhaFim: [],

    rodar: function (passos, aoFim) {
      if (!passos || !passos.length) { if (aoFim) aoFim(); return; }
      if (R.ativo) { // já tem roteiro rodando: enfileira
        R.fila = R.fila.concat(passos);
        if (aoFim) R.fila.push(['faz', function () { aoFim(); }]);
        return;
      }
      R.ativo = true; R.fila = passos.slice(); R.aoFim = aoFim || null; R.esperando = null;
    },
    parar: function () { R.ativo = false; R.livre = false; R.fila = []; R.esperando = null; R.aoFim = null; },
    // cutscene de verdade (sem controle)? (false durante um passo 'jogavel')
    emCena: function () { return R.ativo && !R.livre; },

    atualizar: function (dt) {
      if (!R.ativo) return;
      var guarda = 0;
      while (R.ativo && guarda++ < 50) {
        if (R.esperando) {
          R.tEspera += dt; dt = 0;
          if (!R.esperando()) return;
          R.esperando = null;
        }
        if (!R.fila.length) {
          R.ativo = false;
          var cb = R.aoFim; R.aoFim = null;
          if (cb) cb();
          return;
        }
        R.executar(R.fila.shift());
      }
    },

    executar: function (p) {
      var J = BSI.jogo, M = J.mundo, tipo = p[0];
      R.tEspera = 0;
      R.livre = false;
      switch (tipo) {
        case 'jogavel':
          // trecho jogável no meio do roteiro (ex.: fugir da Tia Zane): o jogador controla
          var acabou = false;
          R.livre = true;
          p[1](J.mundo, function () { acabou = true; });
          R.esperando = function () { if (acabou) R.livre = false; return acabou; };
          break;
        case 'fala':
          J.conversar(p[1], null);
          R.esperando = function () { return !BSI.dialogo.ativo; };
          break;
        case 'espera':
          var s = p[1];
          R.esperando = function () { return R.tEspera >= s; };
          break;
        case 'faz':
          p[1](J.mundo);
          break;
        case 'minigame':
          var feito = false;
          p[1](J.mundo, function () { feito = true; });
          R.esperando = function () { return feito && !J.modal; };
          break;
        case 'cartela':
          J.abrirModal(new BSI.Cartela(p[1], p[2], p[3]));
          R.esperando = function () { return !J.modal; };
          break;
        case 'fade':
          var pronto = false;
          J.fadeOut(function () { if (p[1]) p[1](J.mundo); pronto = true; });
          R.esperando = function () { return pronto && J.fade.a < 0.05; };
          break;
        case 'npcAnda':
          var npc = M && M.acharNpc(p[1]);
          if (!npc) break;
          var T = BSI.cfg.TILE, alvo = { x: p[2] * T + 8, y: p[3] * T + 10 }, max = p[4] || 6;
          npc.destinoFixo = alvo;
          R.esperando = function () { return U.dist(npc, alvo) < 4 || R.tEspera > max || npc.morto; };
          break;
        case 'se':
          var sim = p[1](J.mundo);
          var ramo = (sim ? p[2] : p[3]) || [];
          R.fila = ramo.concat(R.fila);
          break;
        case 'objetivo': BSI.fases.objetivo(p[1]); break;
        case 'aviso': BSI.hud.aviso(p[1], p[2]); break;
        case 'pista': BSI.fases.pista(p[1]); break;
        case 'flag': BSI.story.flag(p[1], p[2]); break;
        case 'medidor': BSI.story.medidor(p[1], p[2]); break;
        case 'som': BSI.audio.sfx(p[1]); break;
        default: console.warn('Passo de roteiro desconhecido:', tipo);
      }
    }
  };

  // =========================================================
  //  FASES
  // =========================================================
  var F = BSI.fases = {
    atual: function () { return BSI.state && BSI.data.fases[BSI.state.fase]; },
    indice: function (id) { return BSI.data.ordemFases.indexOf(id); },

    // começa uma fase: escurece, monta o grupo e o mapa, mostra a cartela e a abertura
    iniciar: function (id, semCartela) {
      var f = BSI.data.fases[id], J = BSI.jogo;
      if (!f) { console.warn('Fase inexistente', id); return; }
      R.parar();
      J.fadeOut(function () {
        var S = BSI.state;
        S.fase = id;
        if (f.grupo) { S.grupo = f.grupo.slice(); S.lider = 0; }
        S.vidas = {};
        S.objetivo = f.objetivo || ''; delete S.objetivoAlvo;
        S.checkpoint = { mapa: f.mapa, x: f.chegada.x, y: f.chegada.y, chave: 'fase:' + id };
        if (f.aoIniciar) f.aoIniciar();
        J.recriarMundo(f.mapa, f.chegada);
        J.cena = 'jogo';
        J.salvar();
        var passos = [];
        if (!semCartela && f.titulo) passos.push(['cartela', f.ato || '', f.titulo, f.subtitulo || '']);
        if (f.abertura) passos.push(['fala', f.abertura]);
        if (f.roteiro) passos = passos.concat(f.roteiro());
        if (f.objetivo) passos.push(['objetivo', f.objetivo]);
        passos.push(['faz', function () { J.salvar(); }]);
        R.rodar(passos);
      });
    },

    // alvo (opcional): pra onde a estrela do minimapa aponta. Sem alvo, usa
    // a tabela js/story/data/alvos.js pelo texto do objetivo.
    objetivo: function (txt, alvo) {
      if (!BSI.state) return;
      BSI.state.objetivo = txt;
      if (alvo !== undefined) BSI.state.objetivoAlvo = alvo; else delete BSI.state.objetivoAlvo;
      if (txt) BSI.hud.aviso('Objetivo: ' + txt, BSI.cor.amarelo);
    },

    pista: function (id) {
      var S = BSI.state, p = BSI.data.pistas[id];
      if (!p) { console.warn('Pista inexistente', id); return; }
      S.pistas = S.pistas || [];
      if (S.pistas.indexOf(id) >= 0) return;
      S.pistas.push(id);
      BSI.audio.sfx('salvar');
      BSI.hud.aviso('Nova pista no Caderno: ' + p.titulo, '#9fd8ff');
    },

    // zona de evento: chamada pelo mundo quando o líder entra
    dispararEvento: function (nome, mundo) {
      var S = BSI.state;
      S.eventos = S.eventos || {};
      if (S.eventos[nome]) return;
      var fn = BSI.data.eventos[nome];
      if (!fn) { console.warn('Evento inexistente', nome); return; }
      var r = fn(mundo);
      if (r === 'depois') return;      // ainda não é a hora (tenta quando entrar de novo)
      S.eventos[nome] = true;
      if (r && r.length) R.rodar(r);
    }
  };
})();
