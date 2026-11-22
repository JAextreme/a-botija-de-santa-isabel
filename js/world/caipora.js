/* =========================================================
   caipora.js — a mata reage à RAIVA DA CAIPORA (mapas com "mata").
     30+  assobios no mato
     50+  vulto passando na beira da luz; espingarda nega fogo (hero.js)
     70+  lanterna apaga sozinha; arapucas aparecem na trilha
     90+  a trilha muda de lugar (ao sair do mapa, volta pro começo)
   Respeitar a mata (oferenda de fumo no toco) baixa a raiva.
   ========================================================= */
(function () {
  'use strict';
  var U = BSI.util, T = BSI.cfg.TILE, C = BSI.cor;

  // ---------------- ARAPUCA ----------------
  function Arapuca(x, y) {
    BSI.Entidade.call(this, x, y, 4, 3);
    this.visivel = false;
  }
  Arapuca.prototype = Object.create(BSI.Entidade.prototype);
  Arapuca.prototype.atualizar = function (dt, mundo) {
    this.t += dt;
    this.visivel = false;
    for (var i = 0; i < mundo.herois.length; i++) {
      var h = mundo.herois[i];
      if (h.caido) continue;
      var d2 = U.dist2(h.x, h.y, this.x, this.y);
      if (d2 < 26 * 26 && (h.id === 'vander' || d2 < 14 * 14)) this.visivel = true;
      if (d2 < 7 * 7 && !(h.st.invisivel > 0)) {
        h.st.atordoado = 1.6;
        this.morto = true;
        BSI.audio.sfx('estalo');
        BSI.hud.aviso(h.nome() + ' caiu numa arapuca da Caipora!', '#ff9a7a');
        mundo.particulas.explosao(this.x, this.y - 2, 8, [C.madeira, C.matoSeco], 30, 0.4);
        return;
      }
    }
  };
  Arapuca.prototype.desenhar = function (g, cx, cy) {
    if (!this.visivel) return;
    var x = Math.round(this.x - cx), y = Math.round(this.y - cy);
    g.fillStyle = C.madeiraEsc;
    g.fillRect(x - 4, y - 1, 9, 1); g.fillRect(x - 4, y - 4, 1, 4); g.fillRect(x + 4, y - 4, 1, 4); g.fillRect(x - 3, y - 5, 7, 1);
    g.fillStyle = C.matoSeco; g.fillRect(x - 2, y - 3, 5, 1);
  };

  // ---------------- VULTO (a Caipora passando) ----------------
  function Vulto(x, y) {
    BSI.Entidade.call(this, x, y, 3, 3);
    this.vida = 1.4;
    this.vx = (Math.random() < 0.5 ? -1 : 1) * 70;
  }
  Vulto.prototype = Object.create(BSI.Entidade.prototype);
  Vulto.prototype.atualizar = function (dt) {
    this.t += dt; this.vida -= dt; this.x += this.vx * dt;
    if (this.vida <= 0) this.morto = true;
  };
  Vulto.prototype.desenhar = function (g, cx, cy) {
    var x = Math.round(this.x - cx), y = Math.round(this.y - cy), a = Math.min(1, this.vida * 2, (1.4 - this.vida) * 4);
    g.globalAlpha = a * 0.8;
    g.fillStyle = '#0a0610';
    g.fillRect(x - 3, y - 14, 6, 10); g.fillRect(x - 2, y - 17, 4, 3); g.fillRect(x - 6, y - 5, 12, 4); // vulto montado num porco-do-mato
    g.fillStyle = '#a8402a'; g.fillRect(x - 3, y - 19, 6, 2); g.fillRect(x - 4, y - 18, 1, 3); // cabelo vermelho
    g.fillStyle = '#ffd060'; g.fillRect(x - 1, y - 16, 1, 1); g.fillRect(x + 1, y - 16, 1, 1);
    g.globalAlpha = 1;
  };
  Vulto.prototype.luz = function () { return { x: this.x, y: this.y - 16, r: 8, forca: 0.5, cor: '#ffd060' }; };

  BSI.caipora = {
    atualizar: function (m, dt) {
      if (!m.dados.mata || BSI.roteiro.emCena()) return;
      var raiva = BSI.state.medidores.raiva, c = m.caip;
      if (!c) c = m.caip = { assobio: 12, apagao: 20, vulto: 8, armou: false };
      var L = m.lider();
      if (!L) return;
      if (raiva >= 30) {
        c.assobio -= dt;
        if (c.assobio <= 0) {
          c.assobio = 14 + Math.random() * 22 - raiva / 8;
          BSI.audio.sfx('assobio');
          m.falar(L, BSI.falas.sorteia('caca'), 1.8);
        }
      }
      if (raiva >= 50) {
        c.vulto -= dt;
        if (c.vulto <= 0) {
          c.vulto = 12 + Math.random() * 14;
          var a = Math.random() * Math.PI * 2, r = 70 + Math.random() * 40;
          m.props.push(new Vulto(L.x + Math.cos(a) * r, L.y + Math.sin(a) * r));
        }
      }
      if (raiva >= 70) {
        c.apagao -= dt;
        if (c.apagao <= 0) {
          c.apagao = 22 + Math.random() * 18;
          m.apagao = 2.5;
          BSI.audio.sfx('estalo');
          BSI.hud.aviso('A lanterna apagou sozinha...', '#ff9a7a');
        }
        if (!c.armou) {
          c.armou = true;
          var n = 0;
          for (var i = 0; i < 80 && n < 7; i++) {
            var px = L.x + (Math.random() - 0.5) * 520, py = L.y + (Math.random() - 0.5) * 520;
            var ch = m.mapa.ch(Math.floor(px / T), Math.floor(py / T));
            if ((ch === '^' || ch === ',' || ch === '.') && U.dist2(px, py, L.x, L.y) > 60 * 60) { m.props.push(new Arapuca(px, py)); n++; }
          }
        }
      }
    },

    // raiva 90+: ao tentar sair, a trilha muda e o grupo volta pro começo
    trilhaMudou: function (m) {
      if (!m.dados.mata || BSI.state.medidores.raiva < 90 || m.trilhaPerdida) return false;
      m.trilhaPerdida = true;
      if (!BSI.rng.chance(0.6)) return false;
      BSI.audio.sfx('assobio');
      BSI.jogo.fadeOut(function () {
        var p = m.dados.inicio, x = p.x * T + 8, y = p.y * T + 10;
        m.herois.forEach(function (h, i) { var q = m.mapa.pontoLivre(x + (i % 3) * 8, y + Math.floor(i / 3) * 8, 4, 3); h.x = q.x; h.y = q.y; });
        m.cachorros.forEach(function (d) { d.x = x; d.y = y; });
        m.reiniciarTrilha(); m.camera.pular(m.lider(), m.mapa);
        m.saindo = false;
        BSI.hud.aviso('A trilha mudou de lugar... o grupo andou em círculo. (Caipora)', '#ff9a7a');
      });
      return true;
    },

    Arapuca: Arapuca,
    Vulto: Vulto
  };
})();
