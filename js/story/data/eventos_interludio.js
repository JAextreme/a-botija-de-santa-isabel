/* =========================================================
   eventos_interludio.js — CONTEÚDO: cutscenes do Interlúdio.
   A noite começa engraçada (pipoca, histórias do Tio Ota) e vira
   terror aos poucos. Ao amanhecer, o Dudu conta tudo e a Tia Zane
   aparece atrás do ladrão de carne.
   ========================================================= */
(function () {
  'use strict';
  var T = BSI.cfg.TILE;
  var E = BSI.data.eventos, A = BSI.story.acoes;

  // ---------------- AÇÕES ----------------
  A.noitePipoca = function (m) { BSI.fases.dispararEvento('noite_pipoca', m); };
  A.ativarSinal = function (m) { if (m && m.conversando && m.conversando.ativar) m.conversando.ativar(); };
  A.reacenderFogueira = function (m) { if (m && m.conversando && m.conversando.reacender) m.conversando.reacender(m); };

  // ---------------- A NOITE DA PIPOCA ----------------
  E.noite_pipoca = function (m) {
    var ok = false;
    return [
      ['minigame', function (mm, pronto) { BSI.minigames.pipoca(function (r) { ok = r; pronto(); }); }],
      ['se', function () { return ok; },
        [['flag', 'pipoca_perfeita', true], ['faz', function (mm) { mm.herois.forEach(function (h) { if (h.caido) h.reviver(6); else h.vida = h.vidaMax; }); }], ['fala', 'pipoca_boa']],
        [['flag', 'pipoca_queimada', true], ['medidor', 'juizo', -5], ['fala', 'pipoca_queimada']]],
      ['fala', 'historias_tio_ota'],
      // o silêncio: vagalumes somem, a noite escurece
      ['faz', function (mm) { mm.vagalumes = []; mm.ambienteAlvo = 0.06; }],
      ['espera', 1.5],
      ['fala', 'silencio'],
      ['faz', function (mm) {
        BSI.audio.sfx('mugido');
        mm.props.forEach(function (p) { if (p.id === 'boi') p.agitado = true; });
        if (mm.chefe) mm.chefe.aparecer();
      }],
      ['espera', 2],
      ['fala', 'figura_dudu'],
      ['cartela', 'BOSS', 'A Alma da Casa do Dudu', 'O coronel não descansa'],
      ['faz', function (mm) {
        BSI.story.flag('pipoca_feita');
        if (mm.chefe) mm.chefe.ativar();
        mm.ambienteAlvo = null;
        BSI.jogo.salvar(); // voltando de uma queda, a luta recomeça direto
      }],
      ['objetivo', 'Sobreviva à alma! Reza do Vander, fogo do Daniel, isca do Miguel, fogueiras e os sinais do Tio Ota.']
    ];
  };

  // ---------------- AMANHECER: A TIA ZANE ----------------
  E.tia_zane_chega = function () {
    var resultado = null;
    var grupo = BSI.data.fases.amanhecer.grupo;
    return [
      ['espera', 0.8],
      ['faz', function (mm) {
        if ((BSI.state.suspeitaZane || 0) >= 20) BSI.story.flag('zane_sentiu');
        var z = new BSI.Npc('tiazane', 2 * T, 20 * T + 10, null, true);
        mm.props.push(z);
      }],
      ['npcAnda', 'tiazane', 12, 20, 6],
      ['fala', 'tia_zane_chega'],
      ['se', function () { return BSI.story.tem('escolheu_fugir'); },
        [
          ['faz', function (mm) {
            var z = mm.acharNpc('tiazane'); if (z) z.morto = true;
            var mig = mm.heroi('miguel'), x = mig ? mig.x : mm.lider().x, y = mig ? mig.y : mm.lider().y;
            mm.trocarGrupo(['miguel']);
            var L = mm.lider(); L.x = x; L.y = y; mm.reiniciarTrilha();
          }],
          ['jogavel', function (mm, pronto) { BSI.perseguicao(mm, 22, function (r) { resultado = r; pronto(); }); }],
          ['se', function () { return resultado === 'fugiu'; },
            [['flag', 'miguel_fugiu_zane', true], ['fala', 'zane_fugiu']],
            [['flag', 'pego_pela_zane', true], ['fala', 'zane_pegou']]],
          ['faz', function (mm) {
            var L = mm.lider();
            mm.trocarGrupo(grupo);
            mm.props.push(new BSI.Npc('tiazane', L.x + 20, L.y, null, true));
          }],
          ['fala', 'zane_conversa']
        ],
        []],
      ['faz', function (mm) { var z = mm.acharNpc('tiazane'); if (z) { z.destinoFixo = { x: 0, y: z.y }; z.sumir(); } }],
      ['espera', 1.2],
      ['faz', function () { BSI.fases.iniciar('ato2_bar'); }]
    ];
  };
})();
