/* =========================================================
   particles.js — poeira, faíscas, fumaça, pipoca, estrelinhas.
   Um conjunto reaproveitado (sem criar lixo pro coletor).
   ========================================================= */
(function () {
  'use strict';
  var MAX = 500;

  function Particulas() {
    this.lista = [];
  }
  // p: {x,y,vx,vy,vida,cor,tam,grav,atrito,brilho,sobe}
  Particulas.prototype.add = function (p) {
    if (this.lista.length >= MAX) this.lista.shift();
    p.vida0 = p.vida = p.vida || 0.5;
    p.vx = p.vx || 0; p.vy = p.vy || 0;
    p.tam = p.tam || 1;
    p.grav = p.grav || 0;
    p.atrito = p.atrito === undefined ? 0.9 : p.atrito;
    this.lista.push(p);
    return p;
  };
  // jato de várias partículas
  Particulas.prototype.explosao = function (x, y, n, cor, vel, vida, extra) {
    for (var i = 0; i < n; i++) {
      var a = Math.random() * Math.PI * 2, v = (vel || 40) * (0.3 + Math.random() * 0.7);
      var p = { x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, vida: (vida || 0.5) * (0.6 + Math.random() * 0.6), cor: Array.isArray(cor) ? cor[i % cor.length] : cor, tam: 1 };
      if (extra) for (var k in extra) p[k] = extra[k];
      this.add(p);
    }
  };
  Particulas.prototype.poeira = function (x, y) {
    this.add({ x: x + (Math.random() * 4 - 2), y: y, vx: (Math.random() - 0.5) * 10, vy: -6 - Math.random() * 6, vida: 0.35, cor: 'rgba(225,190,140,0.7)', tam: 2, atrito: 0.85 });
  };
  // partícula com textura (fumaça, chama, faísca da Kenney) — só nos gráficos Médio/Bonito
  Particulas.prototype.textura = function (img, x, y, op) {
    if (!BSI.imagens || !BSI.imagens[img] || BSI.view.det < 2) return false;
    var p = { x: x, y: y, img: img, vx: op.vx || 0, vy: op.vy || 0, vida: op.vida || 1, tam: op.tam || 8, cresce: op.cresce || 0, rot: Math.random() * 6.28, vrot: op.vrot || 0, alfa: op.alfa || 0.6, aditivo: !!op.aditivo, atrito: op.atrito === undefined ? 0.97 : op.atrito, grav: op.grav || 0, tinta: op.tinta };
    this.add(p);
    return true;
  };
  Particulas.prototype.fumaca = function (x, y) {
    if (this.textura('part:fumaca' + (1 + Math.floor(Math.random() * 4)), x, y, { vx: (Math.random() - 0.5) * 6, vy: -10 - Math.random() * 8, vida: 1.6, tam: 6, cresce: 7, vrot: (Math.random() - 0.5) * 1.2, alfa: 0.5, tinta: '#4a4048' })) return;
    this.add({ x: x, y: y, vx: (Math.random() - 0.5) * 6, vy: -10 - Math.random() * 8, vida: 1.2, cor: 'rgba(60,55,60,0.55)', tam: 3, atrito: 0.97 });
  };
  Particulas.prototype.faisca = function (x, y) {
    this.add({ x: x, y: y, vx: (Math.random() - 0.5) * 30, vy: -20 - Math.random() * 30, vida: 0.6, cor: BSI.cor.fogo2, tam: 1, grav: 40, atrito: 0.98, brilho: true });
  };

  Particulas.prototype.atualizar = function (dt) {
    var l = this.lista;
    for (var i = l.length - 1; i >= 0; i--) {
      var p = l[i];
      p.vida -= dt;
      if (p.vida <= 0) { l.splice(i, 1); continue; }
      var at = Math.pow(p.atrito, dt * 60);
      p.vx *= at; p.vy *= at;
      p.vy += p.grav * dt;
      p.x += p.vx * dt; p.y += p.vy * dt;
    }
  };

  Particulas.prototype.desenhar = function (g, cx, cy) {
    var l = this.lista;
    for (var i = 0; i < l.length; i++) {
      var p = l[i];
      var a = p.vida / p.vida0;
      if (p.img) {
        var im = p.tinta ? BSI.imagemTingida(p.img, p.tinta) : BSI.imagens[p.img]; if (!im) continue;
        var vida = 1 - a, tt = p.tam + p.cresce * vida;
        g.save();
        g.globalAlpha = p.alfa * (a < 0.4 ? a / 0.4 : 1) * (vida < 0.15 ? vida / 0.15 : 1);
        if (p.aditivo) g.globalCompositeOperation = 'lighter';
        g.translate(p.x - cx, p.y - cy); g.rotate(p.rot + p.vrot * vida * p.vida0);
        g.imageSmoothingEnabled = true;
        g.drawImage(im, -tt / 2, -tt / 2, tt, tt);
        g.restore();
        continue;
      }
      g.globalAlpha = a < 0.3 ? a / 0.3 : 1;
      g.fillStyle = p.cor;
      var e = BSI.view.det > 1 ? 2 : 1, t = e > 1 ? Math.max(0.5, p.tam * 0.6) : p.tam;
      g.fillRect(Math.round((p.x - cx - t / 2) * e) / e, Math.round((p.y - cy - t / 2) * e) / e, t, t);
    }
    g.globalAlpha = 1;
  };

  BSI.Particulas = Particulas;
})();
