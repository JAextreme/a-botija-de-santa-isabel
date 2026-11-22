/* =========================================================
   galeria.js — GALERIA do modo debug (F1 → Galeria).
   Mostra lado a lado tudo que é desenhado: personagens (todas
   as direções e animações), retratos, NPCs, inimigos, bichos,
   objetos e tiles. Serve pra comparar o "antes e depois".
   ←/→ troca de página, roda do mouse dá zoom, [Esc] sai.
   Qualquer parte do jogo pode pôr mais coisa aqui com
   BSI.galeria.secao(nome, fnItens).
   ========================================================= */
(function () {
  'use strict';
  var C = BSI.cor, Tx = BSI.texto;
  var secoes = []; // { nome, itens: fn -> [{nome, w, h, desenhar(g,x,y,t)}] }

  function img(c, escala) { // desenha canvas respeitando o detalhe da arte (arte 2x = metade do tamanho)
    escala = escala || 1;
    return { w: c.width / escala, h: c.height / escala, desenhar: function (g, x, y) { g.drawImage(c, x, y, c.width / escala, c.height / escala); } };
  }

  var G = BSI.galeria = {
    secao: function (nome, fn) { secoes.push({ nome: nome, itens: fn }); },
    abrir: function () { BSI.jogo.abrirModal(new Galeria()); },
    img: img
  };

  // ---------- seções padrão ----------
  function bonecos(lista, prefixo) {
    var r = [];
    lista.forEach(function (par) {
      var spr = BSI.sprites.humano(prefixo + par[0], par[1]);
      if (spr.anim) { // boneco novo: mostra cada animação
        Object.keys(spr.anim).forEach(function (an) {
          var q = spr.anim[an].down || spr.anim[an].right || spr.anim[an][Object.keys(spr.anim[an])[0]];
          r.push({ nome: par[2] + ' · ' + an, w: (q[0].width / (spr.esc || 1)) * 1.1 * Math.min(q.length, 8), h: q[0].height / (spr.esc || 1), desenhar: function (g, x, y) {
            for (var i = 0; i < q.length && i < 8; i++) g.drawImage(q[i], x + i * (q[i].width / (spr.esc || 1)) * 1.1, y, q[i].width / (spr.esc || 1), q[i].height / (spr.esc || 1));
          } });
        });
      } else {
        var dirs = ['down', 'up', 'left', 'right'];
        r.push({ nome: par[2], w: 4 * 3 * (spr.w + 2), h: spr.h, desenhar: function (g, x, y) {
          dirs.forEach(function (d, i) { spr.dirs[d].forEach(function (c, k) { g.drawImage(c, x + (i * 3 + k) * (spr.w + 2), y); }); });
        } });
      }
    });
    return r;
  }
  G.secao('Heróis', function () {
    return bonecos(Object.keys(BSI.data.personagens).map(function (id) { var p = BSI.data.personagens[id]; return [id, p.visual, p.curto || p.nome]; }), 'heroi:');
  });
  G.secao('Retratos', function () {
    var r = [];
    Object.keys(BSI.data.personagens).forEach(function (id) {
      var p = BSI.data.personagens[id], spr = BSI.sprites.humano('heroi:' + id, p.visual);
      if (BSI.retratos && BSI.retratos.de) {
        var exprs = BSI.retratos.EXPRESSOES;
        r.push({ nome: p.curto, w: exprs.length * 42, h: 40, desenhar: function (g, x, y) {
          exprs.forEach(function (e, i) { var c = BSI.retratos.de(id, e); if (c) g.drawImage(c, x + i * 42, y, 40, 40); });
        } });
      } else r.push({ nome: p.curto, w: 40, h: 34, desenhar: function (g, x, y) { g.drawImage(spr.retrato, x, y, spr.retrato.width * 2, spr.retrato.height * 2); } });
    });
    return r;
  });
  G.secao('NPCs e inimigos', function () {
    var l = [];
    Object.keys(BSI.data.falantes).forEach(function (id) { var f = BSI.data.falantes[id]; if (f.visual && !f.bicho) l.push([id, f.visual, f.nome]); });
    var r = bonecos(l, 'npc:');
    Object.keys(BSI.data.inimigos).forEach(function (id) { var d = BSI.data.inimigos[id]; if (d.visual) r = r.concat(bonecos([[id, d.visual, d.nome]], 'inimigo:')); });
    return r;
  });
  G.secao('Objetos', function () {
    return Object.keys(BSI.painter.objetos).map(function (n) {
      var o = BSI.sprites.objeto(n);
      return { nome: n, w: o.w, h: o.h, desenhar: function (g, x, y) { g.drawImage(o.c, x, y, o.w, o.h); } };
    });
  });
  G.secao('Tiles', function () {
    var T = BSI.cfg.TILE, defs = BSI.tiles.defs;
    // um mapinha 3x3 de cada tile pra ver as bordas e a textura
    return Object.keys(defs).map(function (ch) {
      var linhas = ['...', '.' + ch + '.', '...'];
      if (ch !== '.') linhas = [ch + ch + ch, ch + ch + ch, ch + ch + ch];
      BSI.data.maps.__galeria = { nome: 'galeria', linhas: linhas, entidades: [], inicio: { x: 1, y: 1 } };
      var m = new BSI.Mapa('__galeria');
      delete BSI.data.maps.__galeria;
      return { nome: ch + ' ' + defs[ch].nome, w: 3 * T, h: 3 * T, desenhar: function (g, x, y) { g.drawImage(m.canvas, x, y, 3 * T, 3 * T); (m.altos || []).forEach(function (a) { a.desenhar(g, -x, -y, null); }); } };
    });
  });

  // ---------- a tela ----------
  function Galeria() { this.pag = 0; this.zoom = 1; this.cache = {}; this.t = 0; this.rol = 0; }
  Galeria.prototype.telaCheia = true;
  Galeria.prototype.itens = function () {
    if (!this.cache[this.pag]) this.cache[this.pag] = secoes[this.pag].itens();
    return this.cache[this.pag];
  };
  Galeria.prototype.atualizar = function (dt) {
    var I = BSI.input;
    this.t += dt;
    if (I.apertou('pausa')) { BSI.jogo.fecharModal(); return; }
    if (I.apertou('dir')) { this.pag = (this.pag + 1) % secoes.length; this.rol = 0; }
    if (I.apertou('esq')) { this.pag = (this.pag - 1 + secoes.length) % secoes.length; this.rol = 0; }
    if (I.segurando('baixo')) this.rol += 160 * dt;
    if (I.segurando('cima')) this.rol = Math.max(0, this.rol - 160 * dt);
    if (I.mouse.roda) this.zoom = Math.max(1, Math.min(4, this.zoom - I.mouse.roda));
  };
  Galeria.prototype.layout = function () {
    var W = BSI.view.w, z = this.zoom, x = 6, y = 22 - this.rol, linhaH = 0, out = [];
    this.itens().forEach(function (it) {
      var w = it.w * z, h = it.h * z + 8;
      if (x + w > W - 6 && x > 6) { x = 6; y += linhaH + 4; linhaH = 0; }
      out.push({ it: it, x: x, y: y });
      x += w + 8; linhaH = Math.max(linhaH, h);
    });
    return out;
  };
  Galeria.prototype.desenhar = function (g) {
    var W = BSI.view.w, H = BSI.view.h, z = this.zoom, t = this.t;
    g.fillStyle = '#3a3440'; g.fillRect(0, 0, W, H);
    // xadrez de fundo pra ver contorno e transparência
    g.fillStyle = '#423b48';
    for (var yy = 0; yy < H; yy += 8) for (var xx = (yy / 8) % 2 * 8; xx < W; xx += 16) g.fillRect(xx, yy, 8, 8);
    this.layout().forEach(function (p) {
      if (p.y > H || p.y + p.it.h * z < 14) return;
      g.save(); g.translate(p.x, p.y + 8); g.scale(z, z); p.it.desenhar(g, 0, 0, t); g.restore();
    });
    g.fillStyle = 'rgba(10,6,20,0.9)'; g.fillRect(0, 0, W, 16);
  };
  Galeria.prototype.desenharTexto = function () {
    var W = BSI.view.w, H = BSI.view.h;
    Tx.escrever('GALERIA · ' + secoes[this.pag].nome + '  (' + (this.pag + 1) + '/' + secoes.length + ')   ←→ página · ↑↓ rola · roda: zoom ' + this.zoom + 'x · [Esc] sai', 6, 4, { tam: 6, cor: C.amarelo });
    var z = this.zoom;
    this.layout().forEach(function (p) { if (p.y > 10 && p.y < H) Tx.escrever(p.it.nome, p.x, p.y, { tam: 4.5, cor: '#d8cdb0', grossura: 1.5 }); });
  };
  BSI.Galeria = Galeria;
})();
