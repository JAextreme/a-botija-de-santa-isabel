/* =========================================================
   vida.js — o sertão VIVO em volta (não é inimigo, não é caça):
   galinha ciscando, calango correndo, urubu rodando no céu com
   a sombra no chão, jumento passando devagar, folha e poeira no
   vento, fumaça de chaminé. E de vez em quando um EVENTO:
   redemoinho, jumento atravessando, moto passando lá longe,
   vizinho gritando. Ninguém leva dano; é só pra dar vida.
   ========================================================= */
(function () {
  'use strict';
  var U = BSI.util, C = BSI.cor, T = BSI.cfg.TILE, O = BSI.painter.objetos;
  function V() { return BSI.config.visual.decoracao; }

  // ---------------- sprites dos bichinhos ----------------
  O.galinha1 = { w: 9, h: 8, pintar: function (r) { r(1, 3, 6, 4, '#f2e6c9'); r(5, 1, 3, 3, '#f2e6c9'); r(8, 2, 1, 1, '#f0c75e'); r(6, 0, 1, 1, '#c03030'); r(0, 2, 2, 2, '#d8cdb0'); r(3, 7, 1, 1, '#f0c75e'); r(5, 7, 1, 1, '#f0c75e'); r(6, 2, 1, 1, C.contorno); } };
  O.galinha2 = { w: 9, h: 8, pintar: function (r) { r(1, 3, 6, 4, '#f2e6c9'); r(5, 4, 3, 3, '#f2e6c9'); r(8, 6, 1, 1, '#f0c75e'); r(6, 3, 1, 1, '#c03030'); r(0, 2, 2, 2, '#d8cdb0'); r(2, 7, 1, 1, '#f0c75e'); r(4, 7, 1, 1, '#f0c75e'); } };
  O.galinhaPreta1 = { w: 9, h: 8, pintar: function (r) { r(1, 3, 6, 4, '#3a3038'); r(5, 1, 3, 3, '#3a3038'); r(8, 2, 1, 1, '#f0c75e'); r(6, 0, 1, 1, '#c03030'); r(0, 2, 2, 2, '#5a4a58'); r(3, 7, 1, 1, '#f0c75e'); r(5, 7, 1, 1, '#f0c75e'); } };
  O.calango = { w: 10, h: 4, pintar: function (r) { r(0, 2, 4, 1, '#8a9a5a'); r(3, 1, 4, 2, '#9aaa6a'); r(7, 1, 2, 2, '#aab87a'); r(4, 0, 1, 1, '#6a7a4a'); r(4, 3, 1, 1, '#6a7a4a'); r(6, 0, 1, 1, '#6a7a4a'); r(6, 3, 1, 1, '#6a7a4a'); } };
  O.urubu1 = { w: 15, h: 6, pintar: function (r) { r(0, 0, 6, 2, '#1e1a20'); r(9, 0, 6, 2, '#1e1a20'); r(5, 1, 5, 3, '#1e1a20'); r(6, 4, 3, 1, '#2a2428'); r(7, 0, 1, 1, '#8a3a3a'); } };
  O.urubu2 = { w: 15, h: 6, pintar: function (r) { r(0, 3, 6, 2, '#1e1a20'); r(9, 3, 6, 2, '#1e1a20'); r(5, 1, 5, 3, '#1e1a20'); r(6, 4, 3, 1, '#2a2428'); r(7, 0, 1, 1, '#8a3a3a'); } };
  O.jumento1 = { w: 22, h: 18, pintar: function (r) {
    var p = '#8a7a6a', e = '#6a5a4e', c = '#b0a090';
    r(4, 6, 12, 6, p); r(4, 6, 12, 1, c); r(15, 3, 5, 5, p); r(17, 0, 1, 4, e); r(19, 0, 1, 4, e); r(19, 6, 3, 3, c); r(20, 7, 1, 1, C.contorno);
    r(5, 12, 2, 6, e); r(13, 12, 2, 6, e); r(8, 12, 2, 5, p); r(11, 12, 2, 5, p); r(2, 7, 2, 4, e); r(7, 7, 6, 3, '#a8402a'); r(7, 7, 6, 1, '#c86a4a');
  } };
  O.jumento2 = { w: 22, h: 18, pintar: function (r) {
    var p = '#8a7a6a', e = '#6a5a4e', c = '#b0a090';
    r(4, 6, 12, 6, p); r(4, 6, 12, 1, c); r(15, 3, 5, 5, p); r(17, 0, 1, 4, e); r(19, 0, 1, 4, e); r(19, 6, 3, 3, c); r(20, 7, 1, 1, C.contorno);
    r(6, 12, 2, 6, e); r(12, 12, 2, 6, e); r(7, 12, 2, 5, p); r(13, 12, 2, 5, p); r(2, 7, 2, 4, e); r(7, 7, 6, 3, '#a8402a'); r(7, 7, 6, 1, '#c86a4a');
  } };
  O.motoLonge = { w: 20, h: 12, pintar: function (r) { r(1, 7, 5, 5, '#1e1e24'); r(14, 7, 5, 5, '#1e1e24'); r(5, 5, 10, 3, '#3b5b8c'); r(8, 1, 4, 4, '#c8905e'); r(8, 0, 4, 2, '#c03030'); r(13, 3, 3, 1, '#9aa3ab'); r(2, 8, 2, 2, '#6a6a72'); r(15, 8, 2, 2, '#6a6a72'); } };

  // ---------------- um bichinho ----------------
  function Bichinho(tipo, x, y) {
    this.tipo = tipo; this.x = x; this.y = y; this.t = Math.random() * 5;
    this.vx = 0; this.vy = 0; this.espera = Math.random() * 2; this.esq = Math.random() < 0.5;
    this.hw = 3; this.hh = 2;
    this.alt = tipo === 'urubu' ? 60 + Math.random() * 30 : 0;
    this.cx0 = x; this.cy0 = y; this.raio = 40 + Math.random() * 60; this.ang = Math.random() * 6.28;
    this.preta = Math.random() < 0.3;
  }
  Bichinho.prototype.atualizar = function (dt, m) {
    this.t += dt;
    var L = m.lider();
    if (this.tipo === 'urubu') {
      // roda no céu em volta de um ponto, devagar
      this.ang += dt * 0.35;
      this.x = this.cx0 + Math.cos(this.ang) * this.raio; this.y = this.cy0 + Math.sin(this.ang) * this.raio * 0.6;
      this.esq = Math.sin(this.ang) > 0;
      return;
    }
    var perto = L && U.dist(L, this) < (this.tipo === 'calango' ? 34 : 26);
    if (perto && !this.fugindo) {
      // susto! corre pro lado contrário
      var n = U.norm(this.x - L.x || 1, this.y - L.y);
      var vel = this.tipo === 'calango' ? 120 : (this.tipo === 'jumento' ? 20 : 60);
      this.vx = n.x * vel; this.vy = n.y * vel; this.fugindo = 0.6; this.esq = this.vx < 0;
      if (this.tipo === 'galinha' && Math.random() < 0.5) { m.particulas.explosao(this.x, this.y - 4, 3, '#f2e6c9', 25, 0.4); m.falar(this, 'Có-có-CÓÓ!', 0.8); }
    }
    if (this.fugindo > 0) this.fugindo -= dt;
    else {
      this.espera -= dt;
      if (this.espera <= 0) {
        this.espera = 1 + Math.random() * 3;
        var vel2 = this.tipo === 'jumento' ? 8 : (this.tipo === 'calango' ? 0 : 14);
        if (this.tipo === 'calango' && Math.random() < 0.4) vel2 = 70;
        var a = Math.random() * 6.28;
        this.vx = Math.cos(a) * vel2 * (Math.random() < 0.5 ? 1 : 0); this.vy = Math.sin(a) * vel2 * 0.6;
        if (this.vx) this.esq = this.vx < 0;
      }
      if (this.tipo === 'calango') { this.vx *= 0.92; this.vy *= 0.92; }
    }
    var nx = this.x + this.vx * dt, ny = this.y + this.vy * dt;
    if (!m.mapa.solidoPx(nx, ny) && !m.fogo.queimandoPx(nx, ny)) { this.x = nx; this.y = ny; } else { this.vx = -this.vx; this.vy = -this.vy; }
    if (this.tipo === 'jumento' && Math.abs(this.vx) > 1 && Math.random() < 0.05) m.particulas.poeira(this.x, this.y);
  };
  Bichinho.prototype.desenhar = function (g, cx, cy) {
    var nome, f = Math.floor(this.t * (Math.abs(this.vx) + Math.abs(this.vy) > 5 ? 8 : 2)) % 2;
    if (this.tipo === 'galinha') nome = this.preta ? 'galinhaPreta1' : (f ? 'galinha2' : 'galinha1');
    else if (this.tipo === 'calango') nome = 'calango';
    else if (this.tipo === 'jumento') nome = f ? 'jumento2' : 'jumento1';
    else nome = Math.floor(this.t * 3) % 4 === 0 ? 'urubu2' : 'urubu1';
    var o = BSI.sprites.objeto(nome);
    var x = Math.round(this.x - cx - o.w / 2), y = Math.round(this.y - cy - o.h + 2 - this.alt);
    if (this.tipo === 'urubu') {
      // a sombra vai no chão, o urubu lá em cima
      g.fillStyle = 'rgba(0,0,0,0.22)'; g.fillRect(Math.round(this.x - cx) - 5, Math.round(this.y - cy), 11, 2);
    }
    g.drawImage(this.esq ? o.espelho : o.c, x, y, o.w, o.h);
  };

  // ---------------- eventos aleatórios ----------------
  var GRITOS = ['ABAIXA ESSE SOM, MENINO!', 'QUEM DEIXOU O BODE SOLTO?!', 'Ô ZÉ, A JANTA TÁ NA MESA!', 'FECHA ESSA PORTEIRA!', 'VOCÊS NÃO DORMEM NÃO, É?!', 'ALGUÉM VIU MINHA CHINELA?'];
  var EVENTOS = {
    redemoinho: function (m) {
      var cam = m.camera, W = BSI.view.w, Hh = BSI.view.h;
      m.efeitosVida.push({ tipo: 'redemoinho', x: cam.x - 20, y: cam.y + Hh * (0.3 + Math.random() * 0.5), vx: 38 + Math.random() * 20, t: (W + 60) / 45 });
      BSI.hud.aviso('Um redemoinho passou levantando poeira. Dizem que é o Saci.', '#e8dcb0');
    },
    jumento: function (m) {
      var cam = m.camera, W = BSI.view.w, Hh = BSI.view.h, daEsq = Math.random() < 0.5;
      var y = cam.y + Hh * (0.35 + Math.random() * 0.4);
      var x = daEsq ? cam.x - 16 : cam.x + W + 16;
      var p = m.mapa.pontoLivre(x, y, 4, 3);
      var j = new Bichinho('jumento', p.x, p.y);
      j.vx = daEsq ? 16 : -16; j.esq = !daEsq; j.espera = 99; j.passando = 12;
      m.fauna.push(j);
      m.agendar(1.5, function () { m.falar(j, 'Inhóóó!', 1.4); });
    },
    moto: function (m) {
      var cam = m.camera, W = BSI.view.w, Hh = BSI.view.h, daEsq = Math.random() < 0.5;
      m.efeitosVida.push({ tipo: 'moto', x: daEsq ? cam.x - 30 : cam.x + W + 30, y: cam.y + (Math.random() < 0.5 ? 26 : Hh - 18), vx: daEsq ? 150 : -150, t: (W + 80) / 150 });
      BSI.audio.sfx('escapamento');
    },
    vizinho: function (m) {
      BSI.hud.aviso('Vizinho, de longe: "' + BSI.rng.pick(GRITOS) + '"', '#e8dcb0');
    }
  };

  BSI.vida = {
    eventos: EVENTOS,
    // povoa o mapa com bichinhos conforme o tema
    popular: function (m) {
      m.fauna = []; m.efeitosVida = []; m.tEventoVida = 60;
      var tema = BSI.decoracao.temaMapa[m.mapa.id], dens = V().densidadeFauna;
      if (!tema || m.dados.semTelhado) return;
      var qtd = { sitio: { galinha: 5, calango: 3, urubu: 2 }, mato: { calango: 4, urubu: 3 }, cidade: { galinha: 4, calango: 2, urubu: 1 }, festa: { galinha: 2 } }[tema];
      var w = m.mapa.w * T, h = m.mapa.h * T;
      Object.keys(qtd).forEach(function (tipo) {
        var n = Math.round(qtd[tipo] * dens);
        for (var i = 0; i < n; i++) {
          for (var k = 0; k < 20; k++) {
            var x = 24 + Math.random() * (w - 48), y = 24 + Math.random() * (h - 48);
            if (tipo !== 'urubu' && m.mapa.solidoPx(x, y)) continue;
            m.fauna.push(new Bichinho(tipo, x, y));
            break;
          }
        }
      });
      // galinha anda em bando: junta perto da primeira
      var gal = m.fauna.filter(function (b) { return b.tipo === 'galinha'; });
      for (var g = 1; g < gal.length; g++) { var p = m.mapa.pontoLivre(gal[0].x + (Math.random() - 0.5) * 40, gal[0].y + (Math.random() - 0.5) * 30, 3, 2); gal[g].x = p.x; gal[g].y = p.y; }
      var fx = V().eventosACadaSeg;
      m.tEventoVida = fx[0] + Math.random() * (fx[1] - fx[0]);
    },
    atualizar: function (m, dt) {
      if (!m.fauna) return;
      var i;
      for (i = m.fauna.length - 1; i >= 0; i--) {
        var b = m.fauna[i];
        b.atualizar(dt, m);
        if (b.passando !== undefined) { b.passando -= dt; if (b.passando <= 0) m.fauna.splice(i, 1); }
      }
      // vento: folha seca e poeira passando na tela
      var cam = m.camera, W = BSI.view.w, Hh = BSI.view.h;
      if (!m.terror() && Math.random() < dt * 1.2) {
        var folha = Math.random() < 0.5;
        m.particulas.add({ x: cam.x - 4, y: cam.y + Math.random() * Hh, vx: 30 + Math.random() * 25, vy: (Math.random() - 0.5) * 8, vida: (W + 10) / 40, cor: folha ? '#a8823a' : 'rgba(225,190,140,0.45)', tam: folha ? 1 : 2, atrito: 1 });
      }
      // fumaça das chaminés (telhado com casa embaixo) às vezes
      if (m.mapa.altos && Math.random() < dt * 0.8) {
        var al = m.mapa.altos[Math.floor(Math.random() * m.mapa.altos.length)];
        if (al && al.tipo === 'beiral' && al.y > cam.y && al.y < cam.y + Hh) m.particulas.fumaca(al.x, al.y - 8);
      }
      for (i = m.efeitosVida.length - 1; i >= 0; i--) {
        var e = m.efeitosVida[i];
        e.t -= dt; e.x += e.vx * dt;
        if (e.tipo === 'redemoinho') {
          for (var k = 0; k < 3; k++) {
            var a = Math.random() * 6.28, r = 3 + Math.random() * 8;
            m.particulas.add({ x: e.x + Math.cos(a) * r, y: e.y - Math.random() * 22, vx: -Math.sin(a) * 30, vy: -10, vida: 0.5, cor: Math.random() < 0.3 ? '#a8823a' : 'rgba(225,190,140,0.6)', tam: 1 + (Math.random() < 0.4 ? 1 : 0), atrito: 0.9 });
          }
        } else if (e.tipo === 'moto' && Math.random() < 0.6) m.particulas.poeira(e.x - Math.sign(e.vx) * 10, e.y);
        if (e.t <= 0) m.efeitosVida.splice(i, 1);
      }
      // sorteio de evento
      if (BSI.roteiro.emCena() || (m.chefe && m.chefe.ativo) || m.terror() || m.perseguicao || m.defesa) return;
      m.tEventoVida -= dt;
      if (m.tEventoVida <= 0) {
        var faixa = V().eventosACadaSeg;
        m.tEventoVida = faixa[0] + Math.random() * (faixa[1] - faixa[0]);
        var nomes = ['redemoinho', 'jumento', 'moto', 'vizinho'];
        if (m.dados.semTelhado) nomes = ['vizinho'];
        EVENTOS[BSI.rng.pick(nomes)](m);
      }
    },
    desenharMoto: function (g, m, cx, cy) {
      if (!m.efeitosVida) return;
      m.efeitosVida.forEach(function (e) {
        if (e.tipo !== 'moto') return;
        var o = BSI.sprites.objeto('motoLonge');
        g.drawImage(e.vx < 0 ? o.espelho : o.c, Math.round(e.x - cx - o.w / 2), Math.round(e.y - cy - o.h), o.w, o.h);
      });
    }
  };
})();
