/* =========================================================
   tutorial.js — DICAS DE CONTROLE na hora certa (v1.0)
   Uma dica por vez, embaixo, só quando ela faz sentido
   (tem bicho perto → "atacar"; a arma tá vazia → "recarregar").
   Quando você faz o que ela pede, aparece um ✓ e ela some.
   O que já foi aprendido fica guardado nas preferências
   (não volta em outro jogo salvo). Dá pra desligar nas Opções.
   ========================================================= */
(function () {
  'use strict';
  var I = function () { return BSI.input; };
  function cfg() { return BSI.save.cfg(); }
  function tecla(a) { return '[' + I().rotulo(a) + ']'; }
  function perto(m, raio) {
    var L = m.lider(); if (!L) return false;
    function ok(e) { return !e.morto && e.time !== 'protegido' && BSI.util.dist(e, L) < raio; }
    return m.inimigos.some(function (e) { return e.time === 'inimigos' && ok(e); }) || (m.bichos || []).some(ok);
  }
  function arma(m) { var L = m.lider(); return L && L.arma; }
  function sabe(id) { return !!(cfg().dicas || {})[id]; }

  // ordem = prioridade. quando: a dica faz sentido agora · feito: o jogador fez
  var DICAS = [
    { id: 'andar', txt: function () { var r = I().rotulo; return '[' + [r('cima'), r('esq'), r('baixo'), r('dir')].join(' ') + '] andar'; },
      quando: function () { return true; }, feito: function (d, dt) { var v = I().movimento(); if (v && (v.x || v.y)) d.acum += dt; return d.acum > 0.8; } },
    { id: 'interagir', txt: function () { return tecla('interagir') + ' conversar, pegar e usar as coisas'; },
      quando: function (m) { return !!m.interagivel; }, feito: function () { return I().apertou('interagir'); } },
    { id: 'correr', txt: function () { return 'Segure ' + tecla('correr') + ' enquanto anda pra correr'; },
      quando: function () { return sabe('andar'); }, feito: function (d, dt) { var v = I().movimento(); if (I().segurando('correr') && v && (v.x || v.y)) d.acum += dt; return d.acum > 0.5; } },
    { id: 'ataque', txt: function () { return tecla('ataque') + ' ou clique: atacar (o tiro vai pra onde o mouse aponta)'; },
      quando: function (m) { return perto(m, 150); }, feito: function () { return I().apertou('ataque'); } },
    { id: 'esquiva', txt: function () { return tecla('esquiva') + ' esquivar (sai do golpe rolando)'; },
      quando: function (m) { return sabe('ataque') && perto(m, 70); }, feito: function () { return I().apertou('esquiva'); } },
    { id: 'recarregar', txt: function () { return tecla('recarregar') + ' recarregar a arma'; },
      quando: function (m) { var a = arma(m); return a && a.pente && a.peca && a.peca.pente < a.pente; }, feito: function (d, dt, m) { var L = m.lider(); return I().apertou('recarregar') || (L && L.recarga); } },
    { id: 'mira', txt: function () { return 'Segure ' + tecla('mira') + ' ou o botão direito pra mirar com precisão'; },
      quando: function (m) { var a = arma(m); return sabe('ataque') && a && a.tipo !== 'corpo' && perto(m, 200); }, feito: function () { return I().segurando('mira'); } },
    { id: 'habilidade', txt: function () { return tecla('habilidade') + ' usar a habilidade de quem você controla'; },
      quando: function (m) { return sabe('ataque') && perto(m, 160); }, feito: function () { return I().apertou('habilidade') || ['hab1', 'hab2', 'hab3', 'hab4', 'hab5', 'hab6'].some(function (h) { return I().apertou(h); }); } },
    { id: 'proximo', txt: function () { return tecla('proximo') + ' trocar de personagem (cada um tem seu jeito)'; },
      quando: function (m, T) { return sabe('andar') && T.tJogo > 25 && m.herois.length > 1; }, feito: function () { return I().apertou('proximo'); } },
    { id: 'trocarArma', txt: function () { return 'Roda do mouse ou ' + tecla('rodaArmas') + ': trocar de arma · ' + tecla('equipamento') + ' abrir o equipamento'; },
      quando: function (m, T) { return sabe('ataque') && T.tJogo > 60; }, feito: function () { return I().mouse.roda !== 0 || I().apertou('rodaArmas') || I().apertou('equipamento'); } },
    { id: 'mapa', txt: function () { return tecla('mapa') + ' abrir o mapa completo'; },
      quando: function (m, T) { return T.tJogo > 45; }, feito: function () { return I().apertou('mapa'); } },
    { id: 'pausa', txt: function () { return tecla('pausa') + ' pausar, salvar e abrir as opções'; },
      quando: function (m, T) { return T.tJogo > 90; }, feito: function () { return I().apertou('pausa'); } }
  ];

  var T = BSI.tutorial = {
    atual: null, tJogo: 0, ok: 0, okTxt: '', DICAS: DICAS,
    ligado: function () { return cfg().dicasLigadas !== false; },
    aprender: function (id) { var c = cfg(); c.dicas = c.dicas || {}; if (c.dicas[id]) return; c.dicas[id] = true; BSI.save.salvarCfg(c); },
    esquecerTudo: function () { var c = cfg(); c.dicas = {}; BSI.save.salvarCfg(c); },
    // chamado todo passo durante o jogo (antes do input ser limpo)
    atualizar: function (dt, m) {
      if (T.ok > 0) T.ok -= dt;
      if (!m || !T.ligado() || BSI.dialogo.ativo || BSI.jogo.modal || (BSI.roteiro && BSI.roteiro.emCena())) return;
      T.tJogo += dt;
      // a dica atual foi cumprida? (vale mesmo se ela já não "faz sentido")
      if (T.atual) {
        var d = T.atual;
        if (d.def.feito(d, dt, m)) { T.aprender(d.def.id); T.ok = 1.2; T.okTxt = d.def.txt(); T.atual = null; BSI.audio.sfx('pegar'); return; }
        d.t += dt;
        if (!d.def.quando(m, T) && d.t > 4) T.atual = null; // perdeu o sentido: guarda pra depois
        return;
      }
      if (T.ok > 0) return;
      for (var i = 0; i < DICAS.length; i++) {
        var def = DICAS[i];
        if (sabe(def.id)) continue;
        if (def.quando(m, T)) { T.atual = { def: def, t: 0, acum: 0 }; return; }
      }
    },
    // desenhado na camada de texto, embaixo, acima do objetivo
    desenharTexto: function () {
      if (!T.ligado() || BSI.dialogo.ativo) return;
      var txt = null, cor = '#f4e6b0', alfa = 1;
      if (T.atual) { txt = T.atual.def.txt(); alfa = Math.min(1, T.atual.t * 3); }
      else if (T.ok > 0) { txt = '✓ ' + T.okTxt; cor = '#9fe0a0'; alfa = Math.min(1, T.ok * 2); }
      if (!txt) return;
      var W = BSI.view.w, H = BSI.view.h, Tx = BSI.texto, tam = BSI.acess && BSI.acess.textoGrande() ? 8 : 6.5;
      var u = BSI.uctx, larg = Math.min(W - 160, Tx.largura ? Tx.largura(txt, tam) + 14 : txt.length * tam * 0.55 + 14);
      larg = Math.max(60, larg);
      var y = H - 26 - tam;
      if (u) { u.save(); u.globalAlpha = 0.6 * alfa; u.fillStyle = '#120c1c'; u.fillRect(Math.round(W / 2 - larg / 2), y - 3, Math.round(larg), tam + 7); u.restore(); }
      Tx.escrever(txt, W / 2, y, { tam: tam, alinhar: 'center', cor: cor, alfa: alfa });
    }
  };
})();
