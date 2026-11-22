/* =========================================================
   text.js — texto nítido no canvas "tela-texto".
   As coordenadas e tamanhos são em pixels VIRTUAIS (iguais aos
   do jogo); o canvas de texto aplica a escala real da tela,
   então a letra sai lisa em qualquer celular.
   ========================================================= */
(function () {
  'use strict';

  var FONTE = '"Trebuchet MS", "Segoe UI", system-ui, sans-serif';
  var FONTE_CORDEL = 'Georgia, "Times New Roman", serif';

  var Tx = BSI.texto = {
    FONTE: FONTE,
    FONTE_CORDEL: FONTE_CORDEL,

    // prepara o canvas de texto no início do quadro
    comecar: function () {
      var u = BSI.uctx, s = BSI.view.s;
      u.setTransform(1, 0, 0, 1, 0, 0);
      u.clearRect(0, 0, BSI.ucanvas.width, BSI.ucanvas.height);
      u.setTransform(s, 0, 0, s, 0, 0);
      u.textBaseline = 'top';
    },

    fonte: function (tam, negrito, cordel) {
      BSI.uctx.font = (negrito ? 'bold ' : '') + tam + 'px ' + (cordel ? FONTE_CORDEL : FONTE);
    },

    // escreve com contorno (lê bem em cima de qualquer fundo)
    escrever: function (txt, x, y, op) {
      op = op || {};
      var u = BSI.uctx;
      Tx.fonte(op.tam || 8, op.negrito !== false, op.cordel);
      u.textAlign = op.alinhar || 'left';
      u.globalAlpha = op.alfa === undefined ? 1 : op.alfa;
      if (op.contorno !== false) {
        u.lineJoin = 'round';
        u.lineWidth = op.grossura || Math.max(1.5, (op.tam || 8) / 4);
        u.strokeStyle = op.corContorno || 'rgba(20,12,24,0.95)';
        u.strokeText(txt, x, y);
      }
      u.fillStyle = op.cor || BSI.cor.creme;
      u.fillText(txt, x, y);
      u.globalAlpha = 1;
    },

    largura: function (txt, tam, negrito, cordel) {
      Tx.fonte(tam || 8, negrito !== false, cordel);
      return BSI.uctx.measureText(txt).width;
    },

    // quebra o texto em linhas que cabem na largura
    quebrar: function (txt, largMax, tam, negrito) {
      Tx.fonte(tam || 8, negrito !== false);
      var u = BSI.uctx, linhas = [];
      String(txt).split('\n').forEach(function (par) {
        var palavras = par.split(' '), atual = '';
        for (var i = 0; i < palavras.length; i++) {
          var teste = atual ? atual + ' ' + palavras[i] : palavras[i];
          if (u.measureText(teste).width > largMax && atual) { linhas.push(atual); atual = palavras[i]; }
          else atual = teste;
        }
        linhas.push(atual);
      });
      return linhas;
    }
  };
})();
