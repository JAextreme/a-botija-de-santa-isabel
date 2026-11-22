/* =========================================================
   tiazane.js — A TIA ZANE atrás do ladrão de carne.
   Perseguição ao amanhecer: o Miguel tem que sobreviver um tempo.
   - Ela corre quase tão rápido quanto ele (correndo ele ganha).
   - Arremessa a CHINELA (aviso antes: braço levantado + "!").
   - Se o Miguel ficar invisível (K), ela perde ele de vista.
   - 2 chineladas ou ela alcançar = pego no flagra.
   Ninguém pode bater na Tia Zane (ela fica fora da lista de inimigos).
   ========================================================= */
(function () {
  'use strict';
  var U = BSI.util, C = BSI.cor;

  function TiaZane(x, y) {
    BSI.Entidade.call(this, x, y, 5, 3);
    this.chinela = true;      // o que ela joga conta como chinelada
    this.id = 'tiazane';
    this.time = 'zane';
    this.spr = BSI.sprites.humano('npc:tiazane', BSI.data.falantes.tiazane.visual);
    this.dir = 'down'; this.face = { x: 0, y: 1 }; this.quadro = 0; this.passo = 0;
    this.estado = 'corre'; this.tEstado = 0; this.cd = 2;
    this.ultimoVisto = null; this.tFala = 3; this.t = 0;
  }
  TiaZane.prototype = Object.create(BSI.Entidade.prototype);

  TiaZane.prototype.atualizar = function (dt, m) {
    this.t += dt; this.tEstado += dt; this.cd -= dt; this.tFala -= dt;
    this.empurrao(dt, m.mapa);
    if (this.aliada) { this.atualizarAliada(dt, m); return; }
    var mig = m.lider();
    if (!mig || !m.perseguicao) return;
    // largada: ela respira fundo antes de correr (dá tempo do Miguel sair)
    if (this.t < 1.6) { this.quadro = 0; if (this.t < dt * 2) m.falar(this, 'Ah, é assim, é? *respira fundo*', 1.5); return; }
    var visivel = !(mig.st.invisivel > 0);
    if (visivel) this.ultimoVisto = { x: mig.x, y: mig.y };
    if (this.tFala <= 0) {
      this.tFala = 4 + Math.random() * 3;
      m.falar(this, visivel ? BSI.rng.pick(['VOLTA AQUI, LADRÃO DE CARNE!', 'Tu vai ver a chinela, Miguel!', 'Minha carne de sol!', 'Eu criei esse menino!']) : 'Cadê esse ladrão?! Sumiu!', 1.8);
    }
    if (this.estado === 'prep') {
      this.quadro = 0;
      if (this.tEstado > 0.5) {
        this.estado = 'corre'; this.tEstado = 0; this.cd = 1.8 + Math.random() * 0.8;
        var n = U.norm(mig.x - this.x, mig.y - this.y);
        m.projeteis.push(new BSI.Projetil({ x: this.x + n.x * 6, y: this.y - 8, vx: n.x * 165, vy: n.y * 165, vida: 1.1, dano: 1, time: 'inimigos', tipo: 'chinela', dono: this, raio: 4 }));
        BSI.audio.sfx('facada');
      }
      return;
    }
    var alvo = visivel ? mig : this.ultimoVisto;
    if (!alvo) return;
    var dx = alvo.x - this.x, dy = alvo.y - this.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
    if (!visivel && d < 8) { // chegou onde viu ele pela última vez
      this.ultimoVisto = { x: this.x + (Math.random() - 0.5) * 120, y: this.y + (Math.random() - 0.5) * 120 };
      return;
    }
    var vel = visivel ? 74 : 40;
    var ax = this.x, ay = this.y;
    BSI.colisao.mover(this, m.mapa, dx / d * vel * dt, dy / d * vel * dt);
    this.face = { x: dx / d, y: dy / d }; this.dir = U.dirDe(dx, dy);
    this.passo += U.len(this.x - ax, this.y - ay);
    this.quadro = [1, 0, 2, 0][Math.floor(this.passo / 5) % 4];
    if (visivel && d < 11) { m.perseguicao.pego(m); return; }
    if (visivel && this.cd <= 0 && d < 125 && d > 24) { this.estado = 'prep'; this.tEstado = 0; }
  };

  // Ato III: a Tia Zane do lado dos netos, chinela nos capangas
  TiaZane.prototype.atualizarAliada = function (dt, m) {
    if (BSI.roteiro.emCena()) return;
    var alvo = null, md = 140 * 140, self = this;
    m.inimigos.forEach(function (e) { if (e.morto || e.time !== 'inimigos' || e.chefe) return; var d = U.dist2(e.x, e.y, self.x, self.y); if (d < md) { md = d; alvo = e; } });
    var L = m.lider();
    if (this.estado === 'prep') {
      if (this.tEstado > 0.4) {
        this.estado = 'corre'; this.tEstado = 0; this.cd = 1.4;
        if (alvo) { var n = U.norm(alvo.x - this.x, alvo.y - this.y); m.projeteis.push(new BSI.Projetil({ x: this.x, y: this.y - 8, vx: n.x * 170, vy: n.y * 170, vida: 1, dano: 2, time: 'herois', tipo: 'chinela', dono: this, raio: 4 })); BSI.audio.sfx('chinela'); }
      }
      return;
    }
    if (alvo && this.cd <= 0) { this.estado = 'prep'; this.tEstado = 0; this.dir = U.dirDe(alvo.x - this.x, alvo.y - this.y); return; }
    // fica perto do neto líder
    if (L && U.dist(L, this) > 40) {
      var nl = U.norm(L.x - this.x, L.y - this.y), ax = this.x;
      BSI.colisao.mover(this, m.mapa, nl.x * 60 * dt, nl.y * 60 * dt);
      this.dir = U.dirDe(nl.x, nl.y); this.passo += Math.abs(this.x - ax) + 0.3; this.quadro = [1, 0, 2, 0][Math.floor(this.passo / 5) % 4];
    } else this.quadro = 0;
    if (this.tFala <= 0) { this.tFala = 6; m.falar(this, BSI.rng.pick(['Sai daí, cabra safado!', 'Respeita a família do Ota!', 'Chinela teleguiada!']), 1.8); }
  };

  TiaZane.prototype.desenhar = function (g, cx, cy) {
    this.sombra(g, cx, cy, 10);
    this.desenharSprite(g, cx, cy, this.spr, this.dir, this.quadro);
    var x = Math.round(this.x - cx), y = Math.round(this.y - cy);
    // a chinela na mão (levantada no aviso)
    var cy2 = this.estado === 'prep' ? y - 24 : y - 10;
    g.fillStyle = C.contorno; g.fillRect(x + 6, cy2 - 1, 6, 4);
    g.fillStyle = '#3b8a5a'; g.fillRect(x + 7, cy2, 4, 2);
    if (this.estado === 'prep') { g.fillStyle = C.barro; g.fillRect(x - 1, y - 30, 2, 4); g.fillRect(x - 1, y - 25, 2, 1); }
  };

  // ---------------- a perseguição em si ----------------
  // m.perseguicao = BSI.perseguicao(m, segundos, aoFim('fugiu' | 'pego'))
  BSI.perseguicao = function (m, seg, aoFim) {
    var L = m.lider();
    var p = m.mapa.pontoLivre(L.x - 130, L.y - 30, 5, 3);
    var zane = new TiaZane(p.x, p.y);
    m.props.push(zane);
    if (BSI.falasVivas) m.agendar(0.8, function () { BSI.falasVivas.reagir(m, 'tiaZane'); });
    var P = {
      t: seg, total: seg, hits: 0, acabou: false, zane: zane,
      atualizar: function (dt) { if (P.acabou) return; P.t -= dt; if (P.t <= 0) P.fim('fugiu'); },
      chinelada: function () {
        P.hits++;
        BSI.hud.aviso('CHINELADA! (' + P.hits + '/2)', '#ff9a7a');
        if (P.hits >= 2) P.fim('pego');
      },
      pego: function () { P.fim('pego'); },
      fim: function (r) {
        if (P.acabou) return;
        P.acabou = true;
        zane.morto = true;
        m.perseguicao = null;
        m.projeteis.forEach(function (pr) { if (pr.tipo === 'chinela') pr.morto = true; });
        BSI.audio.sfx(r === 'fugiu' ? 'confirma' : 'chinela');
        aoFim(r);
      }
    };
    m.perseguicao = P;
    return P;
  };

  BSI.TiaZane = TiaZane;
})();
