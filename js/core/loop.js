/* =========================================================
   loop.js — laço principal com passo de tempo fixo.
   A física roda sempre a 60 Hz (estável em qualquer aparelho);
   o desenho acontece uma vez por quadro do navegador.
   ========================================================= */
(function () {
  'use strict';

  var acumulado = 0, antes = 0, rodando = false;
  var fnAtualizar = null, fnDesenhar = null;
  // medidor de FPS (mostrado no debug)
  var fpsQuadros = 0, fpsTempo = 0;

  function quadro(agora) {
    if (!rodando) return;
    requestAnimationFrame(quadro);
    var dt = (agora - antes) / 1000;
    antes = agora;
    if (!(dt > 0)) dt = 0;
    if (dt > BSI.cfg.MAX_FRAME) dt = BSI.cfg.MAX_FRAME; // aba voltou do segundo plano
    acumulado += dt;

    var passos = 0;
    while (acumulado >= BSI.cfg.DT && passos < 8) {
      fnAtualizar(BSI.cfg.DT);
      acumulado -= BSI.cfg.DT;
      passos++;
    }
    if (passos >= 8) acumulado = 0; // aparelho muito lento: descarta atraso

    fnDesenhar();

    fpsQuadros++; fpsTempo += dt;
    if (fpsTempo >= 0.5) { BSI.loop.fps = Math.round(fpsQuadros / fpsTempo); fpsQuadros = 0; fpsTempo = 0; }
  }

  BSI.loop = {
    fps: 0,
    iniciar: function (atualizar, desenhar) {
      fnAtualizar = atualizar; fnDesenhar = desenhar;
      rodando = true;
      antes = BSI.util.agora();
      requestAnimationFrame(quadro);
    },
    parar: function () { rodando = false; }
  };
})();
