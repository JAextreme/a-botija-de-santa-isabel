/* =========================================================
   touch.js — controles de celular: joystick virtual (metade
   esquerda, aparece onde o dedo encosta) + botões grandes.
   Aparece sozinho em aparelho de toque (ou no primeiro toque).
   Deslizar o dedo rápido também vale como "deslize" (minigame).
   ========================================================= */
(function () {
  'use strict';
  var I = BSI.input;
  var RAIO = 50;

  var T = BSI.touch = {
    ativo: false,
    el: null,

    init: function () {
      // O jogo é de PC: os controles de toque ficam DESLIGADOS por padrão
      // (sem manutenção). Só ligam se a preferência "toque" estiver marcada.
      T.el = document.getElementById('toque');
      T.montar();
      if (BSI.save.cfg().toque) T.ligar();
    },

    ligar: function () { T.ativo = true; T.el.classList.add('ativo'); BSI.view.redimensionar(); },
    desligar: function () { T.ativo = false; T.el.classList.remove('ativo'); BSI.view.redimensionar(); },

    montar: function () {
      var el = T.el;
      el.innerHTML = '';
      // ---- joystick ----
      var area = document.createElement('div'); area.className = 'joy-area';
      var base = document.createElement('div'); base.className = 'joy-base';
      var knob = document.createElement('div'); knob.className = 'joy-knob';
      var dica = document.createElement('div'); dica.className = 'joy-dica'; dica.textContent = 'arraste para andar';
      base.appendChild(knob); area.appendChild(base); area.appendChild(dica); el.appendChild(area);
      T.area = area;

      var dedo = null, ox = 0, oy = 0, t0 = 0, sx = 0, sy = 0;
      area.addEventListener('pointerdown', function (e) {
        e.preventDefault();
        BSI.audio.destravar();
        if (dedo !== null) return;
        dedo = e.pointerId;
        try { area.setPointerCapture(e.pointerId); } catch (er) { }
        var r = area.getBoundingClientRect();
        ox = e.clientX; oy = e.clientY; sx = e.clientX; sy = e.clientY; t0 = Date.now();
        base.style.left = (e.clientX - r.left) + 'px'; base.style.top = (e.clientY - r.top) + 'px';
        base.classList.add('visivel'); dica.style.display = 'none';
        knob.style.transform = 'translate(0,0)';
        // também conta como toque na tela (avançar diálogo, menus)
        var v = BSI.view.paraVirtual(e.clientX, e.clientY);
        I.toqueTela(v.x, v.y);
      });
      area.addEventListener('pointermove', function (e) {
        if (e.pointerId !== dedo) return;
        var dx = e.clientX - ox, dy = e.clientY - oy, d = Math.sqrt(dx * dx + dy * dy);
        if (d > RAIO) { dx = dx / d * RAIO; dy = dy / d * RAIO; }
        knob.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
        I.toqueStick(dx / RAIO, dy / RAIO);
      });
      function soltar(e) {
        if (e.pointerId !== dedo) return;
        dedo = null;
        base.classList.remove('visivel');
        I.toqueStick(0, 0);
        // deslize rápido?
        var dx = e.clientX - sx, dy = e.clientY - sy, dt = Date.now() - t0;
        if (dt < 450 && Math.sqrt(dx * dx + dy * dy) > 30) {
          I.toqueDeslize(Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 'esq' : 'dir') : (dy < 0 ? 'cima' : 'baixo'));
        }
      }
      area.addEventListener('pointerup', soltar);
      area.addEventListener('pointercancel', soltar);

      // ---- botões ----
      var bts = document.createElement('div'); bts.className = 'botoes'; el.appendChild(bts);
      [
        ['bt-ataque', 'ATACAR', 'ataque'],
        ['bt-hab', 'HAB', 'habilidade'],
        ['bt-poder', 'PODER', 'poder'],
        ['bt-falar', 'FALAR', 'interagir'],
        ['bt-ant', '◀', 'anterior'],
        ['bt-prox', '▶', 'proximo']
      ].forEach(function (b) { bts.appendChild(botao(b[0], b[1], b[2])); });
      T.btPausa = botao('bt-pausa', 'II', 'pausa');
      el.appendChild(T.btPausa);
    },

    reposicionar: function () {
      if (!T.area) return;
      var V = BSI.view;
      var p = T.btPausa.style;
      if (V.retrato && T.ativo) {
        T.area.style.top = (window.innerHeight - V.faixaControles) + 'px';
        T.area.style.height = V.faixaControles + 'px';
        // pausa no canto da faixa de controles (não cobre o HUD)
        p.top = (window.innerHeight - V.faixaControles + 8) + 'px'; p.left = '8px'; p.marginLeft = '0';
      } else {
        T.area.style.top = '0px';
        T.area.style.height = '100%';
        p.top = '6px'; p.left = '50%'; p.marginLeft = '-20px';
      }
    }
  };

  function botao(classe, texto, acao) {
    var b = document.createElement('div');
    b.className = 'bt ' + classe;
    b.textContent = texto;
    var dedos = {};
    function on(e) {
      e.preventDefault(); e.stopPropagation();
      BSI.audio.destravar();
      dedos[e.pointerId] = true;
      try { b.setPointerCapture(e.pointerId); } catch (er) { }
      b.classList.add('apertado');
      I.toqueSegura(acao, true);
    }
    function off(e) {
      if (!dedos[e.pointerId]) return;
      delete dedos[e.pointerId];
      if (Object.keys(dedos).length) return;
      b.classList.remove('apertado');
      I.toqueSegura(acao, false);
    }
    b.addEventListener('pointerdown', on);
    b.addEventListener('pointerup', off);
    b.addEventListener('pointercancel', off);
    b.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    return b;
  }
})();
