/* =========================================================
   eventos_ato2.js — CONTEÚDO: cutscenes e ações do Ato II.
   - Teorias do Stelo: uma é "verdadeira" (sorteada por partida),
     as outras são fake news (Juízo -5 e conta pro final Absurdo).
   - Gojoba chega no bar → luta contra a caixa de som.
   - Tapera: Gadernal → Diazepan acorda → irmãos → sonho do Vander
     → cavar a botija → capangas → a botija é roubada.
   ========================================================= */
(function () {
  'use strict';
  var T = BSI.cfg.TILE, U = BSI.util;
  var E = BSI.data.eventos, A = BSI.story.acoes;

  // ---------------- teorias do Stelo ----------------
  function teoria(id) {
    var S = BSI.state;
    var mw = BSI.jogo && BSI.jogo.mundo; if (mw && BSI.falasVivas) mw.agendar(0.6, function () { BSI.falasVivas.reagir(mw, 'fakeNews'); });
    if (!S.steloVerdade) S.steloVerdade = BSI.rng.pick(['et', 'reptil', 'cia']);
    BSI.story.flag('acreditou_' + id);
    if (S.steloVerdade === id) {
      BSI.story.flag('stelo_acertou');
      BSI.fases.pista('stelo_verdade');
    } else {
      S.steloFalsas = (S.steloFalsas || 0) + 1;
      BSI.story.medidor('juizo', -5, 'Fake news! Juízo -5 (o Stelo jura que é verdade)');
    }
  }
  A.steloET = function () { teoria('et'); };
  A.steloReptil = function () { teoria('reptil'); };
  A.steloCIA = function () { teoria('cia'); };

  // ---------------- bar, bodega, rezadeira, Felipe ----------------
  A.gojobaChega = function (m) { if (m && m.mapa.id === 'bar_stelo') BSI.fases.dispararEvento('gojoba_chega', m); };
  A.sabotarCabo = function (m) {
    if (!m || !m.conversando || !m.conversando.cortar) return;
    // o Hugo vem correndo e corta, não precisa trocar de personagem
    var cabo = m.conversando;
    BSI.grupo.especialista(m, 'hugo', cabo, function (h) {
      if (cabo.cortado) return;
      cabo.cortar(m);
      m.falar(h, 'Arame, alicate e coragem. Cortado!', 1.6);
    }, 'cortar o cabo');
  };
  A.comprarMoto = function () {
    var S = BSI.state, p = Math.min(10, S.municao);
    S.municao -= p; BSI.story.flag('comprou_moto_felipe');
    BSI.hud.aviso('-' + p + ' cartuchos. Agora vocês têm uma moto sem motor.', '#ff9a7a');
  };
  function fiado(txt) { var S = BSI.state; S.fiado = (S.fiado || 0) + 1; BSI.hud.aviso(txt + ' (anotado no caderno do fiado: ' + S.fiado + ')'); BSI.audio.sfx('pegar'); }
  A.fiadoMunicao = function () { BSI.state.municao += 5; fiado('+5 cartuchos'); };
  A.fiadoPilha = function () { BSI.state.pilha = 100; fiado('Pilha nova'); };
  A.fiadoRapadura = function () { BSI.state.rapaduras += 2; fiado('+2 rapaduras'); };
  A.rezaBenedita = function (m) {
    if (m) m.herois.forEach(function (h) { if (h.caido) h.reviver(6); else h.vida = h.vidaMax; });
    BSI.story.medidor('juizo', 30, 'A reza da Dona Benedita: grupo curado, Juízo +30');
    if (BSI.state.medidores.raiva > 0) BSI.story.medidor('raiva', -10);
    BSI.audio.sfx('cura');
  };

  // pista falsa do Stelo: o 'pouso de disco voador' na praça (desvio cômico)
  E.circulo_et = function () { return [['fala', 'circulo_et']]; };

  // ---------------- O GOJOBA ----------------
  E.gojoba_chega = function (m) {
    var g = m.chefe;
    if (!g || g.ativo) return null;
    return [
      ['faz', function (mm) { g.x = 12 * T; g.y = 15 * T; g.entrar(); }],
      ['espera', 0.2],
      ['faz', function (mm) { g.destino = { x: 12 * T, y: 11 * T }; }],
      ['espera', 0.1],
      ['fala', 'gojoba_chega'],
      ['faz', function (mm) { g.x = 12 * T + 8; g.y = 11 * T + 8; g.ativar(mm); BSI.jogo.salvar(); }],
      ['objetivo', 'Desliguem a caixa de som do Gojoba!']
    ];
  };
  // chamado pelo Gojoba quando a caixa desliga (depois do diálogo)
  E.gojoba_depois_luta = function (m) {
    BSI.fases.objetivo(BSI.story.tem('mapa_tapera') ? 'Saia da cidade pela estrada a leste, rumo à tapera.' : 'O Miguel precisa ver os desenhos no banheiro do bar (sudeste).');
    BSI.jogo.salvar();
  };

  // ---------------- A TAPERA: GADERNAL ----------------
  E.gadernal_chega = function (m) {
    if (!m.chefe || m.chefe.ativo) return null;
    return [
      ['fala', 'gadernal_chega'],
      ['faz', function (mm) { mm.chefe.ativar(); BSI.jogo.salvar(); }],
      ['objetivo', 'Sobreviva ao Gadernal! As regras mudam a cada pouco.']
    ];
  };
  E.diazepan_acorda = function (m) {
    var g = m.chefe;
    return [
      ['faz', function (mm) { if (g && g.calmar) g.calmar(mm); mm.projeteis = []; mm.efeitos = mm.efeitos.filter(function (e) { return e.tipo !== 'telha'; }); }],
      ['fala', 'diazepan_acorda'],
      ['faz', function (mm) {
        // os irmãos viram NPCs e descem pro porão
        var gx = g ? g.x : 13 * T, gy = g ? g.y : 8 * T;
        if (g) g.morto = true;
        mm.chefe = null;
        mm.props.push(new BSI.Npc('gadernal', gx, gy, 'gadernal_npc', true));
        mm.props.push(new BSI.Npc('diazepan', 10 * T + 8, 11 * T + 10, 'diazepan_npc', true));
      }],
      ['espera', 0.6],
      ['fala', 'vander_sonho2'],
      ['flag', 'irmaos_revelados', true],
      ['npcAnda', 'gadernal', 11, 17, 5],
      ['npcAnda', 'diazepan', 9, 17, 5],
      ['faz', function (mm) {
        // aparece o ponto de cavar no porão
        mm.props.push(new BSI.Gatilho(10 * T + 8, 18 * T + 10 - 2, 'cavar_botija'));
        BSI.jogo.salvar();
      }],
      ['objetivo', 'Desçam ao porão pela escada: os três irmãos cavam juntos.']
    ];
  };

  // ---------------- A BOTIJA ----------------
  A.cavar = function (m) { if (m) BSI.fases.dispararEvento('cavar_botija', m); };
  E.cavar_botija = function (m) {
    var defesaOk = false;
    return [
      ['minigame', function (mm, pronto) { BSI.minigames.cavar(function () { pronto(); }); }],
      ['flag', 'botija_achada', true],
      ['faz', function (mm) { var gt = mm.props.filter(function (p) { return p.dialogo === 'cavar_botija'; })[0]; if (gt) gt.morto = true; mm.props.push(new BSI.Decor('botija', 10 * T + 8, 18 * T + 12, null)); }],
      ['fala', 'botija_achada'],
      // todo mundo pro terreiro da tapera; capangas chegando
      ['fade', function (mm) {
        mm.luzesCeu = 30;
        var L = mm.lider(); L.x = 16.5 * T; L.y = 23 * T + 10;
        mm.posicionarGrupo(L.x, L.y);
        [[5, 24], [29, 24], [10, 27], [24, 27], [3, 12], [30, 8], [16, 28]].forEach(function (p, i) {
          var e = new BSI.Inimigo(i % 3 === 2 ? 'atirador' : 'jagunco', p[0] * T + 8, p[1] * T + 10);
          e.alvo = mm.lider(); e.estado = 'persegue';
          mm.inimigos.push(e);
        });
      }],
      ['objetivo', 'Defenda a tapera dos capangas do CDs!'],
      ['jogavel', function (mm, pronto) {
        var lista = mm.inimigos.slice();
        mm.defesa = {
          t: 55,
          restantes: function () { return lista.filter(function (e) { return !e.morto; }).length; },
          atualizar: function (dt) {
            this.t -= dt;
            if (this.restantes() === 0 || this.t <= 0) { mm.defesa = null; defesaOk = this.restantes() === 0; pronto(); }
          }
        };
      }],
      ['faz', function () { BSI.story.flag('tapera_defendida', defesaOk); BSI.story.flag('botija_roubada'); }],
      ['fala', 'botija_roubada'],
      ['faz', function (mm) { mm.props.forEach(function (p) { if (p.sprite === 'botija') p.morto = true; }); }],
      ['fala', 'quem_trouxe'],
      ['flag', 'ato2_completo', true],
      ['espera', 0.6],
      ['faz', function () { BSI.fases.iniciar('ato3_festa'); }]
    ];
  };
})();
