/* =========================================================
   dialogbox.js — caixa de diálogo com retrato, nome, texto
   "digitando" (pulável) e escolhas de 2 a 3 opções.
   ========================================================= */
(function () {
  'use strict';
  var C = BSI.cor, Tx = BSI.texto, R = BSI.dialogo;
  var VEL = 55;       // letras por segundo
  var acum = 0;

  function passoOp() { return BSI.acess && BSI.acess.textoGrande() ? 15 : 13; }
  function geometria() {
    var W = BSI.view.w, H = BSI.view.h;
    var h = BSI.view.retrato ? 78 : 62;
    if (BSI.acess && BSI.acess.textoGrande()) h = Math.min(Math.round(H * 0.42), h + 22);
    return { x: 4, y: H - h - 4, w: W - 8, h: h };
  }

  BSI.dialogbox = {
    atualizar: function (dt) {
      if (!R.ativo) return;
      var I = BSI.input;
      if (R.linha && !R.escolha && R.mostrados < R.linha.texto.length) {
        acum += dt * (BSI.acess ? BSI.acess.velTexto() : VEL);
        while (acum >= 1) {
          acum -= 1; R.mostrados++;
          if (R.mostrados % 3 === 0 && R.linha.texto[R.mostrados] !== ' ') BSI.audio.sfx('blip');
        }
      }
      if (R.escolha) {
        var n = R.escolha.opcoes.length;
        // JUÍZO ZERADO: a escolha sai no impulso, sozinha
        if (BSI.state && BSI.state.medidores.juizo <= 0) {
          if (R.escolha.impulso === undefined) { R.escolha.impulso = 1.2; BSI.hud.aviso('JUÍZO ZERADO: a escolha vai sair no impulso!', '#ff9a7a'); }
          R.escolha.impulso -= dt;
          R.escolha.sel = Math.floor(BSI.util.agora() / 90) % n;
          if (R.escolha.impulso <= 0) { R.escolha.sel = Math.floor(Math.random() * n); R.avancar(); }
          return;
        }
        if (I.apertou('cima')) { R.escolha.sel = (R.escolha.sel + n - 1) % n; BSI.audio.sfx('menu'); }
        if (I.apertou('baixo')) { R.escolha.sel = (R.escolha.sel + 1) % n; BSI.audio.sfx('menu'); }
        if (I.toque) {
          var op = BSI.dialogbox.opcaoNoPonto(I.toque.x, I.toque.y);
          if (op >= 0) { R.escolha.sel = op; R.avancar(); return; }
        }
        if (I.confirmou()) R.avancar();
        return;
      }
      if (I.confirmou() || I.toque) R.avancar();
    },

    opcaoNoPonto: function (x, y) {
      if (!R.escolha) return -1;
      var gm = geometria();
      for (var i = 0; i < R.escolha.opcoes.length; i++) {
        var oy = gm.y + 14 + i * passoOp();
        if (x > gm.x + 50 && x < gm.x + gm.w && y > oy - 2 && y < oy + 11) return i;
      }
      return -1;
    },

    desenhar: function (g) {
      if (!R.ativo) return;
      var gm = geometria();
      // moldura estilo cordel: borda dupla
      if (BSI.cordel && BSI.view.det > 1) BSI.cordel.caixa(g, gm.x, gm.y, gm.w, gm.h, '#1e1428', false, true); // madeira entalhada + papel escuro
      else {
      g.fillStyle = C.contorno; g.fillRect(gm.x, gm.y, gm.w, gm.h);
      g.fillStyle = C.creme; g.fillRect(gm.x + 1, gm.y + 1, gm.w - 2, gm.h - 2);
      g.fillStyle = C.contorno; g.fillRect(gm.x + 2, gm.y + 2, gm.w - 4, gm.h - 4);
      g.fillStyle = '#241a2e'; g.fillRect(gm.x + 3, gm.y + 3, gm.w - 6, gm.h - 6);
      // cantinhos
      g.fillStyle = C.ocre;
      [[gm.x + 3, gm.y + 3], [gm.x + gm.w - 5, gm.y + 3], [gm.x + 3, gm.y + gm.h - 5], [gm.x + gm.w - 5, gm.y + gm.h - 5]].forEach(function (p) { g.fillRect(p[0], p[1], 2, 2); });
      }

      var temRetrato = R.linha && R.linha.spr;
      if (temRetrato) {
        if (BSI.cordel && BSI.view.det > 1) BSI.cordel.caixa(g, gm.x + 5, gm.y + 5, 44, 44, '#3a2d48');
        else { g.fillStyle = C.contorno; g.fillRect(gm.x + 6, gm.y + 6, 42, 42); g.fillStyle = '#3a2d48'; g.fillRect(gm.x + 7, gm.y + 7, 40, 40); }
        var sp = R.linha.spr;
        var rt = BSI.retratos && BSI.retratos.de(R.linha.quem, R.linha.expr);
        if (rt) { g.drawImage(rt, gm.x + 7, gm.y + 7, 40, 40); }
        else {
        var img = sp.retrato;
        var k = Math.min(2.5 / (sp.retratoEsc || 1), 38 / Math.max(img.width, img.height));
        var dw = Math.round(img.width * k), dh = Math.round(img.height * k);
        g.drawImage(img, 0, 0, img.width, img.height, gm.x + 7 + Math.round((40 - dw) / 2), gm.y + 7 + Math.round((40 - dh) / 2), dw, dh);
        }
      }
      if (R.escolha) {
        R.escolha.opcoes.forEach(function (o, i) {
          var oy = gm.y + 14 + i * passoOp();
          if (i === R.escolha.sel) { g.fillStyle = 'rgba(211,155,58,0.35)'; g.fillRect(gm.x + 52, oy - 2, gm.w - 58, passoOp() - 1); }
        });
      }
      // setinha de "continua"
      if (R.linha && !R.escolha && R.mostrados >= R.linha.texto.length) {
        var t = BSI.util.agora() / 1000;
        if (Math.floor(t * 3) % 2) { g.fillStyle = C.amarelo; g.fillRect(gm.x + gm.w - 11, gm.y + gm.h - 9, 5, 1); g.fillRect(gm.x + gm.w - 10, gm.y + gm.h - 8, 3, 1); g.fillRect(gm.x + gm.w - 9, gm.y + gm.h - 7, 1, 1); }
      }
    },

    desenharTexto: function () {
      if (!R.ativo) return;
      var gm = geometria();
      var temRetrato = R.linha && R.linha.spr;
      var tx = gm.x + (temRetrato ? 54 : 10);
      var larg = gm.x + gm.w - 10 - tx;
      var tam = BSI.view.retrato ? 8 : 7.5;
      if (BSI.acess && BSI.acess.textoGrande()) tam += 1.5;
      if (R.escolha) {
        Tx.escrever('O que fazer?', gm.x + 10, gm.y + 4, { tam: 6, cor: C.ocre });
        R.escolha.opcoes.forEach(function (o, i) {
          var oy = gm.y + 14 + i * passoOp();
          var sel = i === R.escolha.sel;
          Tx.escrever((sel ? '▸ ' : '  ') + o.txt, gm.x + 54, oy, { tam: tam, cor: sel ? C.amarelo : C.creme });
        });
        return;
      }
      if (!R.linha) return;
      if (R.linha.nome) Tx.escrever(R.linha.nome, tx, gm.y + 5, { tam: 7, cor: C.amarelo });
      var mostra = R.linha.texto.substring(0, R.mostrados);
      // quebra com o texto inteiro (as palavras não pulam de linha enquanto digita)
      var linhas = Tx.quebrar(R.linha.texto, larg, tam, false);
      var resto = mostra.length, y = gm.y + (R.linha.nome ? 16 : 8);
      for (var i = 0; i < linhas.length && resto > 0; i++) {
        var parte = linhas[i].substring(0, resto);
        Tx.escrever(parte, tx, y, { tam: tam, negrito: false, cor: R.linha.quem === 'narrador' ? '#d8cdb0' : C.creme });
        resto -= linhas[i].length + 1;
        y += tam + 3;
      }
    }
  };
})();
