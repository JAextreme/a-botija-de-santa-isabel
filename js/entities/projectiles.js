/* =========================================================
   projectiles.js — chumbo de espingarda, pedra de baladeira,
   prego da torre do Hugo, galão de querosene do Daniel.
   ========================================================= */
(function () {
  'use strict';
  var C = BSI.cor;

  var ESTILO = {
    chumbo: { cor: C.amarelo, rastro: 'rgba(255,220,150,0.6)', tam: 2 },
    bala: { cor: C.branco, rastro: 'rgba(255,240,200,0.7)', tam: 2 },
    pedra: { cor: '#9a8a7a', rastro: null, tam: 2 },
    prego: { cor: '#c8ccd4', rastro: null, tam: 1 },
    profeta: { cor: '#ffffff', rastro: 'rgba(160,220,255,0.9)', tam: 3 },
    chinela: { cor: '#3b8a5a', rastro: 'rgba(59,138,90,0.4)', tam: 4 },
    nota: { cor: '#ff60c0', rastro: null, tam: 3, nota: true },
    cadeira: { cor: '#7a4a2a', rastro: 'rgba(122,74,42,0.5)', tam: 5 }
  };

  function Projetil(o) {
    this.x = o.x; this.y = o.y;
    this.vx = o.vx; this.vy = o.vy;
    this.vida = o.vida || 0.6;
    this.dano = o.dano || 1;
    this.time = o.time || 'herois';
    this.tipo = o.tipo || 'chumbo';
    this.fura = o.fura || 0;        // quantos inimigos atravessa
    this.raio = o.raio || 3;
    this.dono = o.dono || null;
    this.kb = o.kb || 0; this.critico = !!o.critico;
    this.atingidos = [];
    this.morto = false;
    this.px = o.x; this.py = o.y;   // posição anterior (rastro)
  }

  Projetil.prototype.atualizar = function (dt, mundo) {
    this.px = this.x; this.py = this.y;
    this.vida -= dt;
    if (this.vida <= 0) { this.morto = true; return; }
    var passos = 2;
    for (var s = 0; s < passos && !this.morto; s++) {
      this.x += this.vx * dt / passos;
      this.y += this.vy * dt / passos;
      if (mundo.mapa.bloqueiaTiroPx(this.x, this.y + 4)) {
        // tile opaco ou sólido: para (mandacaru e cerca também param chumbo)
        this.morto = true;
        mundo.particulas.explosao(this.x, this.y, 4, ['#c8b090', '#8a7a6a'], 30, 0.25);
        return;
      }
      // escudos (João Luiz) bloqueiam o que vem do outro time
      if (mundo.bloqueiaEscudo(this)) { this.morto = true; return; }
      var alvos = mundo.alvosPara(this.time);
      // FOGO AMIGO (opção): tiro do grupo pega nos amigos também (menos no dono)
      if (this.time === 'herois' && BSI.save.cfg().fogoAmigo) { var dono0 = this.dono; alvos = alvos.concat(mundo.herois.filter(function (h) { return h !== dono0 && !h.caido; })); }
      for (var i = 0; i < alvos.length; i++) {
        var a = alvos[i];
        if (a.morto || a.caido || this.atingidos.indexOf(a) >= 0) continue;
        if (Math.abs(a.x - this.x) < a.hw + this.raio && Math.abs((a.y - 5) - this.y) < a.hh + 6 + this.raio) {
          this.atingidos.push(a);
          var multP = this.tipo === 'profeta' && BSI.combos ? BSI.combos.profeta(mundo, a, this) : 1;
          a.levarDano(a.def && this.time === 'herois' ? Math.max(1, Math.round(this.dano * 0.5)) : this.dano * multP, mundo, this.dono || this, this.tipo);
          if (this.kb && a.empurrar && !a.def) a.empurrar(this.x - this.vx * 0.05, this.y - this.vy * 0.05, this.kb * (a.chefe ? 0.25 : 1));
          if (this.fura-- <= 0) { this.morto = true; break; }
        }
      }
    }
  };

  Projetil.prototype.desenhar = function (g, cx, cy) {
    var e = ESTILO[this.tipo] || ESTILO.chumbo;
    var x = Math.round(this.x - cx), y = Math.round(this.y - cy);
    if (e.rastro) {
      g.strokeStyle = e.rastro; g.lineWidth = 1;
      g.beginPath(); g.moveTo(Math.round(this.px - cx) + 0.5, Math.round(this.py - cy) + 0.5);
      g.lineTo(x + 0.5, y + 0.5); g.stroke();
    }
    if (this.tipo === 'promessa') {
      // balão de fala (o texto é escrito pelo HUD por cima)
      var amigo = this.time === 'herois';
      g.fillStyle = BSI.cor.contorno; g.fillRect(x - 7, y - 5, 14, 9);
      g.fillStyle = amigo ? '#9fe0a0' : '#fff6e0'; g.fillRect(x - 6, y - 4, 12, 7);
      g.fillStyle = amigo ? '#9fe0a0' : '#fff6e0'; g.fillRect(x - 3, y + 3, 2, 2);
      g.fillStyle = BSI.cor.contorno; g.fillRect(x - 4, y - 1, 1, 1); g.fillRect(x - 1, y - 1, 1, 1); g.fillRect(x + 2, y - 1, 1, 1);
      return;
    }
    if (e.nota) {
      // notinha musical: bolinha + haste (rosa e azul alternando)
      g.fillStyle = (Math.floor(this.vida * 6) % 2) ? '#ff60c0' : '#60e0ff';
      g.fillRect(x - 2, y, 3, 2); g.fillRect(x, y - 4, 1, 4); g.fillRect(x, y - 4, 2, 1);
      return;
    }
    g.fillStyle = e.cor;
    g.fillRect(x - (e.tam >> 1), y - (e.tam >> 1), e.tam, e.tam);
  };

  BSI.Projetil = Projetil;
})();
