/* =========================================================
   combos.js — COMBOS ENTRE PERSONAGENS (o nome aparece na tela)
   - PAREDE DE FOGO: fogo do Daniel + gambiarra (torre) do Hugo
   - TIRO CRÍTICO NO ATORDOADO: escapamento do João Pedro +
     Tiro do Profeta do Lapuca
   - TIRO PERFURANTE: qualquer tiro de dentro do Ritual Amadeu
   - CHURRASCO EXPLOSIVO: isca de carne do Miguel + fogo/bomba
   Novos:
   - MOLOTOV DO DANIEL: garrafa na mão do Daniel vira fogo
   - EXPLOSÃO DE POEIRA: explosão dentro da nuvem de farinha
   - SAIDEIRA: garrafa num bêbado acalmado pelo João Carlos =
     ele vira aliado
   - MURALHA AMADEU: escudo do João Luiz dentro do Ritual
     rebate o tiro de volta
   ========================================================= */
(function () {
  'use strict';
  var U = BSI.util, C = BSI.cor;
  var ultimo = {}, anunciado = {};

  var K = BSI.combos = {
    anunciar: function (m, nome, h) {
      var agora = m.tempo;
      if (anunciado[nome] && agora - anunciado[nome] < 2) return;
      anunciado[nome] = agora;
      BSI.state.stats.combos = (BSI.state.stats.combos || 0) + 1;
      if (BSI.impacto) BSI.impacto.palavra(m, (h || m.lider()).x, (h || m.lider()).y - 30, 'COMBO: ' + nome + '!', '#ffd060', true);
      BSI.hud.aviso('COMBO: ' + nome + '!', C.amarelo);
      BSI.audio.sfx('critico');
      m.encherPoder(8);
    },
    // as habilidades avisam aqui o que acabaram de fazer
    registrar: function (acao, h, m) {
      ultimo[acao] = { t: m.tempo, h: h };
      var fogo = ultimo.fogo, gamb = ultimo.gambiarra;
      if (fogo && gamb && Math.abs(fogo.t - gamb.t) < 4) {
        // PAREDE DE FOGO: a torre do Hugo "venta" o fogo numa linha
        var torre = m.props.filter(function (p) { return p instanceof BSI.Torre && !p.morto; }).pop();
        var base = torre || gamb.h, d = fogo.h.face;
        for (var k = 1; k <= 7; k++) m.fogo.acenderArea(base.x + d.x * k * 12, base.y + d.y * k * 10, 1, true);
        ultimo.fogo = ultimo.gambiarra = null;
        K.anunciar(m, 'PAREDE DE FOGO', fogo.h);
      }
    },
    // explosão de arremesso/rojão: isca por perto? nuvem de farinha? bêbado acalmado?
    explodiuPerto: function (m, x, y, h) {
      var isca = m.props.filter(function (p) { return p.isca && !p.morto && U.dist2(p.x, p.y, x, y) < 30 * 30; })[0];
      if (isca) K.churrasco(m, isca, h);
      var nuvem = m.projeteis.filter(function (p) { return p.tipo === 'nuvem' && p.efeito === 'cega' && !p.morto && U.dist2(p.x, p.y, x, y) < p.r * p.r * 1.4; })[0];
      if (nuvem) {
        nuvem.morto = true;
        K.estouro(m, nuvem.x, nuvem.y, 40, 3, h);
        K.anunciar(m, 'EXPLOSÃO DE POEIRA', h);
      }
      if (h && h.arma && h.arma.id === 'garrafa') m.inimigos.forEach(function (i) {
        if (i.morto || !(i.st.acalmado > 0) || !i.conversavel || U.dist2(i.x, i.y, x, y) > 24 * 24) return;
        i.converter(12); m.falar(i, 'Saideira? Agora eu tô com vocês!', 1.8);
        K.anunciar(m, 'SAIDEIRA', h);
      });
    },
    churrasco: function (m, isca, h) {
      isca.morto = true;
      K.estouro(m, isca.x, isca.y, 44, 4, h);
      m.fogo.acenderArea(isca.x, isca.y, 1, true);
      K.anunciar(m, 'CHURRASCO EXPLOSIVO', h);
    },
    estouro: function (m, x, y, raio, dano, h) {
      m.inimigos.concat(m.bichos).forEach(function (i) { if (!i.morto && U.dist2(i.x, i.y, x, y) < raio * raio) { i.levarDano(dano * (i.chefe ? 0.5 : 1), m, h, 'explosao'); if (i.empurrar) i.empurrar(x, y, 220); } });
      m.particulas.explosao(x, y - 4, 26, [C.fogo1, C.fogo2, C.fogo3, '#f2ecdc'], 110, 0.7);
      m.camera.tremer(6); m.clarao(x, y); BSI.audio.sfx('explosao');
      if (BSI.impacto) BSI.impacto.palavra(m, x, y - 20, ['BUMMM!', 'CABUM!', 'PIPOCOU!'], '#ff9a3a', true);
    },
    // galão de querosene do Daniel caiu: isca perto?
    galao: function (m, e) {
      var isca = m.props.filter(function (p) { return p.isca && !p.morto && U.dist2(p.x, p.y, e.x, e.y) < 30 * 30; })[0];
      if (isca) K.churrasco(m, isca, e.dono);
    },
    // tiro do profeta num atordoado: crítico
    profeta: function (m, alvo, p) {
      if (!(alvo.st && alvo.st.atordoado > 0)) return 1;
      K.anunciar(m, 'TIRO CRÍTICO NO ATORDOADO', p.dono);
      return 2.5;
    },
    // escudo do João Luiz dentro do Ritual: rebate
    rebater: function (m, h, p) {
      var noRitual = m.efeitos.some(function (f) { return f.tipo === 'circulo' && U.dist2(f.x, f.y, h.x, h.y) < f.r * f.r; });
      if (!noRitual) return false;
      p.time = 'herois'; p.vx = -p.vx * 1.2; p.vy = -p.vy * 1.2; p.dono = h; p.atingidos = []; p.vida = Math.max(p.vida, 0.6);
      K.anunciar(m, 'MURALHA AMADEU', h);
      return true;
    }
  };
})();
