/* =========================================================
   eventos_ato3.js — CONTEÚDO: Ato III, A Noite da Festa.
   O plano (botija, gerador, Stelo, aliados), o golpe final da
   web namorada, o comício, a alma do coronel, a Grande Fogueira
   e a chamada dos finais.
   ========================================================= */
(function () {
  'use strict';
  var T = BSI.cfg.TILE, U = BSI.util;
  var E = BSI.data.eventos, A = BSI.story.acoes;
  var TIME_ALMA = ['davi', 'joaopedro', 'miguel', 'daniel', 'vander'];

  // ---------------- resumo do plano (marcador {plano} nos diálogos) ----------------
  BSI.story.resumoPlano = function () {
    var t = BSI.story.tem, itens = [
      ['botija_recuperada', true], ['gerador_sabotado', true], ['ritual_tribo', true], ['fogueira_combinada', true],
      ['stelo_ajudou', true],
      ['zane_no_palanque', t('tia_zane_respeitada')], ['gojoba_aliado_festa', t('gojoba_bem_tratado')], ['roma_na_festa', t('paulo_aliado')]
    ].filter(function (i) { return i[1]; });
    var feitos = itens.filter(function (i) { return t(i[0]) || (i[0] === 'stelo_ajudou' && t('stelo_caos')); }).length;
    return feitos + ' de ' + itens.length + ' partes';
  };

  // ---------------- AÇÕES DO PLANO ----------------
  A.sabotarGerador = function (m) {
    if (!m) return;
    var gerador = m.conversando || m.lider();
    // o Hugo vem fazer o serviço, não precisa trocar de personagem
    BSI.grupo.especialista(m, 'hugo', gerador, function (h) {
      if (BSI.story.tem('gerador_sabotado')) return;
      BSI.story.flag('gerador_sabotado');
      if (gerador.dialogo !== undefined) { gerador.dialogo = null; m.particulas.explosao(gerador.x, gerador.y - 8, 12, [BSI.cor.amarelo], 40, 0.5); }
      m.falar(h, 'Um fio aqui, outro ali... o microfone dele vai falhar na hora H.', 2.2);
      BSI.audio.sfx('estalo');
    }, 'sabotar o gerador');
  };
  A.roubarBotija = function (m) {
    if (!m) return;
    var alvo = m.conversando || m.lider();
    // o Miguel some na madrugada sozinho e volta com a botija
    BSI.grupo.especialista(m, 'miguel', alvo, function (h) {
      if (BSI.story.tem('botija_recuperada')) return;
      h.st.invisivel = Math.max(h.st.invisivel || 0, 2.5);
      BSI.story.flag('botija_recuperada');
      m.props.forEach(function (p) { if (p.sprite === 'botija' || p.dialogo === 'botija_camarim') p.morto = true; });
      m.falar(h, 'Roubo da madrugada. Só que de noite.', 2);
      BSI.hud.faixa('A BOTIJA VOLTOU!', 'O Miguel roubou de volta sem ninguém ver.', 'Moedas e a escritura de Santa Isabel.');
      BSI.audio.sfx('salvar');
    }, 'roubar a botija');
  };
  A.steloFakeNews = function () {
    if (BSI.story.tem('stelo_ajudou') || BSI.story.tem('stelo_caos')) { BSI.hud.aviso('O Stelo já espalhou. Agora é esperar.'); return; }
    if (BSI.rng.chance(0.6)) {
      BSI.story.flag('stelo_ajudou');
      BSI.hud.aviso('A cidade inteira recebeu o áudio do Stelo. O povo tá desconfiado do CDs!', '#9fe0a0');
    } else {
      BSI.story.flag('stelo_caos');
      BSI.story.medidor('juizo', -15, 'O áudio virou confusão: disseram que VOCÊS são reptilianos. Juízo -15');
    }
  };
  A.resgatarHelano = function (m) {
    if (!m) return;
    BSI.story.flag('helano_resgatado');
    if (!m.temNoGrupo('helano')) {
      var g = BSI.state.grupo.slice(); g.push('helano');
      m.trocarGrupo(g);
    }
    BSI.fases.objetivo('Terminem o plano e cheguem perto do palanque.');
  };
  A.comecarComicio = function (m) { if (m) BSI.fases.dispararEvento('comicio', m); };

  // ---------------- o golpe final da web namorada ----------------
  E.web_final = function (m) {
    var h = m.heroi('helano');
    if (!h || h.caido) return 'depois';
    var ok = false;
    var golpe = { de: 'Morena de São Paulo', msg: 'Tô na festa!!! Me encontra na sacristia, sozinho. Finalmente vou te conhecer...' };
    return [
      ['fala', 'web_final_msg'],
      ['minigame', function (mm, pronto) { BSI.minigames.webNamorada(h, mm, function (r) { ok = r; pronto(); }, golpe); }],
      ['se', function () { return ok; },
        [['flag', 'helano_desmascarou', true], ['fala', 'web_final_ok']],
        [['flag', 'helano_preso', true], ['fala', 'web_final_caiu'],
          ['faz', function (mm) {
            var g = BSI.state.grupo.filter(function (id) { return id !== 'helano'; });
            mm.trocarGrupo(g);
            mm.props.push(new BSI.Gatilho(32 * T + 8, 7 * T + 8, 'sacristia'));
          }],
          ['objetivo', 'Resgate o Lapuca na sacristia (ao lado da igreja), ou siga o plano sem ele.']]]
    ];
  };

  // ---------------- o comício ----------------
  E.chegar_palanque = function (m) {
    if (BSI.story.tem('cds_luta')) return null;
    BSI.jogo.conversar('chegar_palanque', null);
    return 'depois';
  };
  E.comicio = function (m) {
    var c = m.chefe;
    if (!c || !c.cds) return null;
    return [
      ['fala', 'comicio_inicio'],
      ['cartela', 'BOSS FINAL', 'Rafael CDs', 'O palanque das promessas'],
      ['faz', function (mm) { c.ativar(); BSI.jogo.salvar(); }],
      ['objetivo', 'Rebatam as promessas do Rafael CDs!']
    ];
  };

  // ---------------- a alma do coronel ----------------
  function timeAlma() {
    var t = TIME_ALMA.slice(), S = BSI.story;
    t.push(!S.tem('helano_preso') || S.tem('helano_resgatado') ? 'helano' : 'zeneto');
    return t;
  }
  function podeFogueira() {
    // pouca desconfiança + gente de cada grupo reunida (a Tribo está na praça)
    return BSI.state.medidores.desconfianca < 40;
  }
  function criarAlma(m) {
    var c = m.chefe;
    var a = new BSI.chefes.alma(24 * T + 8, 14 * T + 10, { coronel: true, aoDerrotar: function (mm) { E.final_cds(mm); } });
    m.inimigos.push(a);
    m.chefe = a;
    m.cdsAcuado = c;
    a.ativar();
    a.alfa = 0.5;
    m.ambienteAlvo = 0.2; // as luzes da festa apagam quando a alma desce
    BSI.state.poder = 100;
    if (BSI.story.tem('grande_fogueira')) acenderGrandeFogueira(m);
  }
  function acenderGrandeFogueira(m) {
    m.poderInfinito = true;
    var f = new BSI.Fogueira(24 * T + 8, 16 * T + 10, 'grande', true);
    f.grande = true;
    m.props.push(f);
  }
  E.fase_alma = function (m) {
    return [
      ['fade', function (mm) {
        var ids = timeAlma();
        mm.props.forEach(function (p) { if (p instanceof BSI.Npc && ids.indexOf(p.id) >= 0) p.morto = true; });
        mm.trocarGrupo(ids);
      }],
      ['se', podeFogueira,
        [['fala', 'fogueira_grande'], ['flag', 'grande_fogueira', true], ['faz', function (mm) { acenderGrandeFogueira(mm); }]],
        [['fala', 'fogueira_falhou']]],
      ['cartela', 'BOSS FINAL', 'A Alma do Coronel', 'O avô protege o neto'],
      ['faz', function (mm) { criarAlma(mm); BSI.jogo.salvar(); }],
      ['objetivo', 'Os três irmãos, os três netos e a fé: Vander reza, Daniel queima, Miguel faz isca... e no fim, O ABOIO DO TIO OTA [' + BSI.input.rotulo('poder') + '].']
    ];
  };
  // voltando de um checkpoint no meio da última luta
  E.fase_alma_retomar = function (m) {
    m.props.forEach(function (p) { if (p instanceof BSI.Npc && timeAlma().indexOf(p.id) >= 0) p.morto = true; });
    criarAlma(m);
  };

  // ---------------- o fim ----------------
  E.final_cds = function (m) {
    BSI.roteiro.rodar([
      ['espera', 1.2],
      ['fala', 'cds_derrota'],
      ['flag', 'cds_derrotado', true],
      ['faz', function (mm) { mm.poderInfinito = false; BSI.finais.tocar(mm); }]
    ]);
  };
})();
