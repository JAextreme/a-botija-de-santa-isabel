/* =========================================================
   eventos_ato1.js — CONTEÚDO: cutscenes do Prólogo e do Ato 1.
   Cada evento é uma função(mundo) que devolve:
     - uma lista de passos de roteiro (ver js/story/fases.js),
     - null  (não acontece nada, e não tenta de novo), ou
     - 'depois' (ainda não é a hora; tenta quando entrar na zona de novo).
   Também ficam aqui as AÇÕES chamadas pelos diálogos ({ acao: 'nome' }).
   ========================================================= */
(function () {
  'use strict';
  var T = BSI.cfg.TILE;
  BSI.data.eventos = BSI.data.eventos || {};
  var E = BSI.data.eventos, A = BSI.story.acoes;

  // ---------------- AÇÕES DOS DIÁLOGOS ----------------
  A.removerAlvo = function (m) { if (m && m.conversando) { m.conversando.morto = true; m.conversando = null; } };
  A.chamarCachorros = function (m) {
    if (!m) return;
    m.props.forEach(function (p) { if (p.id === 'trovao' || p.id === 'piaba') p.morto = true; });
    if (!m.cachorros.length) {
      var L = m.lider();
      m.cachorros.push(new BSI.Cachorro('trovao', L.x - 10, L.y + 6, -1));
      m.cachorros.push(new BSI.Cachorro('piaba', L.x + 10, L.y + 6, 1));
    }
    m.conversando = null;
  };
  A.gritoDavi = function (m) { BSI.audio.sfx('excesso'); if (m) m.camera.tremer(3); };
  A.daviZonzo = function (m) { var d = m && m.heroi('davi'); if (d) d.st.zonzo = 25; };
  A.oferenda = function () {
    var S = BSI.state;
    if ((S.fumo || 0) <= 0) { BSI.hud.aviso('Vocês não têm fumo de rolo... (tem um no terreiro de casa)', '#ff9a7a'); return; }
    S.fumo--;
    BSI.story.flag('oferenda_caipora');
    BSI.story.medidor('raiva', -30, 'A Caipora aceitou o agrado. Raiva -30');
    BSI.audio.sfx('assobio');
  };
  A.pagarPedagio = function () {
    var S = BSI.state, pago = Math.min(5, S.municao);
    S.municao -= pago;
    BSI.hud.aviso('-' + pago + ' cartuchos (pedágio)', '#ff9a7a');
  };
  A.abrirPorteira = function (m) {
    if (!m || m.mapa.id !== 'terras_paulo') return;
    m.mapa.trocar(27, 10, '^'); m.mapa.trocar(27, 11, '^');
    BSI.audio.sfx('estalo');
  };
  A.alertarBebados = function (m) {
    if (!m) return;
    var L = m.lider();
    m.inimigos.forEach(function (e) { if (!e.morto && e.id === 'bebado') { e.alvo = L; e.estado = 'persegue'; } });
  };
  A.darMunicao = function () { BSI.state.municao += 5; BSI.hud.aviso('+5 cartuchos'); };

  // ---------------- PRÓLOGO ----------------
  E.prologo_vander = function (m) {
    return [
      ['espera', 0.6],
      ['faz', function (mm) {
        var npc = new BSI.Npc('vander', 1.5 * T, 7 * T + 10, null, true);
        npc.alfa = 0.2;
        mm.props.push(npc);
      }],
      ['npcAnda', 'vander', 8, 10, 6],
      ['faz', function (mm) { var v = mm.acharNpc('vander'); if (v) v.alfa = 1; }],
      ['fala', 'prologo_vander'],
      ['faz', function (mm) { var v = mm.acharNpc('vander'); if (v) { v.destinoFixo = { x: 16 * T, y: 0 }; v.sumir(); } }],
      ['espera', 1.2],
      ['objetivo', 'Suba a serra pela trilha ao norte do terreiro.']
    ];
  };

  // ---------------- SERRA ----------------
  E.latido_pro_nada = function (m) {
    if (!m.cachorros.length) return null;
    var vander = BSI.state.segredo === 'vander';
    return [
      ['faz', function (mm) {
        mm.cachorros.forEach(function (c) { c.latir(mm, 1); });
        if (vander) { var L = mm.lider(); mm.props.push(new BSI.caipora.Vulto(L.x + 90, L.y - 30)); }
      }],
      ['espera', 1.2],
      ['fala', vander ? 'latido_vander' : 'latido_caipora']
    ];
  };
  E.pe_torcido = function (m) {
    if (!m.temNoGrupo('davi') || !m.temNoGrupo('zeneto')) return null;
    return [['fala', 'pe_torcido']];
  };
  E.vander_aparece = function (m) {
    var L = m.lider();
    return [
      ['faz', function (mm) {
        var npc = new BSI.Npc('vander', L.x + 30, L.y - 50, null, true);
        mm.props.push(npc);
        mm.particulas.explosao(npc.x, npc.y - 8, 10, ['#9fd8ff'], 20, 0.6);
      }],
      ['espera', 0.6],
      ['fala', 'vander_serra'],
      ['flag', 'viu_vander_serra', true],
      ['faz', function (mm) { var v = mm.acharNpc('vander'); if (v) { v.destinoFixo = { x: v.x + 120, y: v.y - 80 }; v.sumir(); } }],
      ['espera', 1]
    ];
  };
  E.sinal_celular = function (m) {
    BSI.story.flag('subiu_alto'); BSI.story.flag('ato1_pode_descer');
    var depois = ['objetivo', 'Desça a serra pela saída a leste, rumo às terras do Paulo do Zé Baixinho.'];
    var h = m.heroi('helano');
    if (!h || h.caido) return [['fala', 'sinal_sem_helano'], depois];
    var golpe = { de: 'Galega de Fortaleza', msg: 'Tô perdida aqui na serra, perto da grota! Me acha! Segue minha localização...' };
    var ok = false;
    return [
      ['fala', 'sinal_helano_1'],
      ['minigame', function (mm, pronto) { BSI.minigames.webNamorada(h, mm, function (r) { ok = r; pronto(); }, golpe); }],
      ['se', function () { return ok; },
        [['flag', 'helano_resistiu_golpe1', true], ['fala', 'sinal_resistiu'], depois],
        [['flag', 'helano_caiu_golpe1', true], ['fala', 'sinal_caiu'],
          ['faz', function () { BSI.jogo.trocarMapa('grota', BSI.data.maps.grota.inicio); }],
          ['espera', 1.0],
          ['fala', 'grota_chegada'],
          ['objetivo', 'Saia da grota pela trilha a noroeste e desça a serra pelo leste.']]
      ]
    ];
  };

  // ---------------- TERRAS DO PAULO ----------------
  E.porteira_pedagio = function () { return [['fala', 'pedagio'], ['objetivo', 'Siga a estrada até o campo do Roma (sudeste).']]; };

  // ---------------- BOSS PAULO ----------------
  E.paulo_intro = function (m) {
    if (!m.chefe) return null;
    return [
      ['fala', 'paulo_intro'],
      ['faz', function (mm) { if (mm.chefe) mm.chefe.ativar(); }],
      ['objetivo', 'Derrote o Paulo do Zé Baixinho (ou faça as pazes com ele).']
    ];
  };
  // chamado pelo próprio boss quando a luta acaba (vitória ou paz)
  E.paulo_fim_ato = function () {
    BSI.story.flag('ato1_completo');
    BSI.roteiro.rodar([
      ['espera', 0.5],
      ['fala', 'paulo_revela'],
      ['espera', 0.5],
      ['faz', function () { BSI.fases.iniciar('interludio'); }]
    ]);
  };
})();
