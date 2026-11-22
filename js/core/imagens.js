/* =========================================================
   imagens.js — carrega as imagens EMBUTIDAS (js/data/*.js) e
   serve de "encaixe": BSI.imagens[nome] é uma imagem pronta.
   Hoje: partículas e teclas dos pacotes CC0 da Kenney
   (kenney.nl — Particle Pack e Input Prompts Pixel).
   Se faltar uma imagem, o jogo usa o desenho por código.
   ========================================================= */
(function () {
  'use strict';
  BSI.imagens = BSI.imagens || {};
  var dados = BSI.imagensDados || {};
  Object.keys(dados).forEach(function (nome) {
    if (typeof Image === 'undefined') return;
    var img = new Image();
    img.onload = function () { BSI.imagens[nome] = img; };
    img.src = dados[nome];
  });

  // as partículas da Kenney são BRANCAS (feitas pra tingir): versão colorida guardada
  var tintas = {};
  BSI.imagemTingida = function (nome, cor) {
    var k = nome + '|' + cor; if (tintas[k]) return tintas[k];
    var im = BSI.imagens[nome]; if (!im) return null;
    var c = document.createElement('canvas'); c.width = im.width; c.height = im.height;
    var g = c.getContext('2d'); g.drawImage(im, 0, 0);
    g.globalCompositeOperation = 'source-in'; g.fillStyle = cor; g.fillRect(0, 0, c.width, c.height);
    return (tintas[k] = c);
  };

  // teclas: nome da tecla (código do navegador) → partes do ícone
  var COD = { ShiftLeft: 'Shift', ShiftRight: 'Shift', ControlLeft: 'Ctrl', ControlRight: 'Ctrl', AltLeft: 'Alt', AltRight: 'Alt', NumpadEnter: 'Enter' };
  BSI.iconeTecla = function (code) {
    var k = COD[code] || code, I = BSI.imagens;
    if (I['tecla:' + k]) return [I['tecla:' + k]];
    var partes = [];
    for (var i = 0; i < 3; i++) { var p = I['tecla:' + k + ':' + i]; if (p) partes.push(p); }
    return partes.length ? partes : null;
  };
  // desenha o ícone da tecla de uma ação no canvas de texto (u) — devolve a largura, ou 0
  BSI.desenharTecla = function (u, acao, x, y, alt, alinhar) {
    if (!BSI.input || BSI.input.ultimoDispositivo === 'pad') return 0;
    var code = (BSI.input.teclasDe(acao) || [])[0];
    if (!code || code.indexOf('Mouse') === 0) return 0;
    var partes = BSI.iconeTecla(code); if (!partes) return 0;
    alt = alt || 8;
    var w = partes.length * alt;
    var x0 = alinhar === 'center' ? x - w / 2 : (alinhar === 'right' ? x - w : x);
    var suave = u.imageSmoothingEnabled; u.imageSmoothingEnabled = false;
    partes.forEach(function (p, i) { u.drawImage(p, x0 + i * alt, y, alt, alt); });
    u.imageSmoothingEnabled = suave;
    return w;
  };
})();
