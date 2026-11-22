/* =========================================================
   bosses/alma.js — BOSS DO INTERLÚDIO: A ALMA DA CASA DO DUDU
   (a alma do coronel Firmino CDs). Luta de terror:
   - Atravessa parede, persegue o grupo, apaga lanterna e fogueira,
     grita e espalha o grupo no escuro, e avança com os olhos acesos
     (aviso antes: olhos vermelhos + gemido).
   - Espingarda e peixeira quase não fazem nada.
   - FUNCIONA: reza do Vander (segure K), fogo do Daniel, fogueiras
     acesas (ela não entra), os 4 sinais de proteção do Tio Ota no
     curral, a carne assada do Miguel como isca (K) e o
     "Tirar o excesso" do Davi.
   - Fraca (15%), só O ABOIO DO TIO OTA termina (poder máximo dos
     Netos). Se demorar, o aboio vem sozinho lá do curral.
   ========================================================= */
(function () {
  'use strict';
  var U = BSI.util, C = BSI.cor;

  BSI.data.falantes.alma = { nome: 'A Alma do Coronel' };
  var VIDA = 140;
  var MULT = { chumbo: 0.12, profeta: 0.2, corpo: 0.15, fogo: 3, reza: 1, sinal: 1, excesso: 1, poder: 1, aboio: 1, gambiarra: 1, prego: 0.12, debug: 1, teste: 1 };

  // op: { coronel: true, aoDerrotar: fn } — a alma grande do Ato III
  function Alma(x, y, op) {
    BSI.Entidade.call(this, x, y, 6, 4);
    this.chefe = true; this.alma = true; this.semPips = true;
    this.d = { nome: 'A Alma da Casa do Dudu', visao: 400 };
    this.time = 'inimigos';
    this.vidaFase = this.vida = VIDA;
    this.fase = 0;
    this.casa = { x: x, y: y };
    this.ativo = false; this.estado = 'oculta'; this.tEstado = 0;
    this.st = {}; this.face = { x: -1, y: 0 };
    this.cdInvestida = 6; this.cdGrito = 14; this.cdApagao = 8;
    this.alfa = 0;
    this.escala = 1;
    if (op && op.coronel) {
      this.coronel = true; this.escala = 1.7; this.aoDerrotar = op.aoDerrotar;
      this.vidaFase = this.vida = 230;
      this.d = { nome: 'A Alma do Coronel Firmino CDs', visao: 500 };
      return;
    }
    // voltando de um checkpoint no meio da luta: já começa ativa
    if (BSI.story.tem('alma_luta') && !BSI.story.tem('alma_derrotada')) { this.ativo = true; this.estado = 'ativa'; this.tEstado = -2; this.alfa = 0.4; }
  }
  Alma.prototype = Object.create(BSI.Entidade.prototype);
  var A = Alma.prototype;

  // ---------- interface comum ----------
  A.livre = function () { return this.ativo && (this.estado === 'ativa' || this.estado === 'prep' || this.estado === 'investida' || this.estado === 'acuada' || this.estado === 'comendo'); };
  A.atordoar = function (s) { if (this.livre()) this.st.atordoado = Math.min(1.5, s * 0.5); };
  A.acalmar = function () { };
  A.virarBode = function (s) { if (this.livre()) this.st.bode = Math.min(2, s); };
  A.converter = function () { };
  A.forcarAlvo = function (h, s) { this.provocador = h; this.st.provocado = s; };
  A.fugir = function (s, de) { if (this.livre()) { this.st.medo = Math.min(2, s); this.medoDe = { x: de.x, y: de.y }; } };
  A.ouvir = function () { };
  A.morrer = function (m) { this.levarDano(999, m, null, 'debug'); };
  A.pularFase = null; // ritual dos Amadeus não funciona em alma

  A.aparecer = function () { this.estado = 'aparecendo'; this.tEstado = 0; this.alfa = 0; };
  A.ativar = function () {
    this.ativo = true; this.estado = 'ativa'; this.tEstado = 0;
    if (!this.coronel) BSI.story.flag('alma_luta');
  };

  A.levarDano = function (q, m, fonte, tipo) {
    if (!this.livre()) return;
    if (this.estado === 'acuada') {
      if (tipo === 'aboio' || tipo === 'debug' || tipo === 'teste') { this.derrotar(m); return; }
      if (Math.random() < 0.1) m.falar(this, '...só o aboio...', 1.2);
      return;
    }
    var mult = MULT[tipo] !== undefined ? MULT[tipo] : 0.3;
    if (this.estado === 'comendo') mult *= 1.5;
    if (m.conselho > 0) mult *= 1.5;
    q *= mult;
    this.vida -= q;
    this.flash = 0.15;
    if (fonte && fonte.time === 'herois') m.encherPoder(q * 1.5);
    if (mult < 0.3 && Math.random() < 0.3) m.falar(fonte && fonte.def ? fonte : this, BSI.rng.pick(['A bala atravessou!', 'Não pega nela!', 'Tiro em alma? Tá doido, é?']), 1.2);
    if (this.vida <= this.vidaFase * 0.15 || tipo === 'debug') this.acuar(m);
  };

  A.acuar = function (m) {
    if (this.estado === 'acuada') return;
    this.vida = this.vidaFase * 0.15;
    this.estado = 'acuada'; this.tEstado = 0; this.tAcuada = 24;
    BSI.state.poder = 100;
    BSI.audio.sfx('alma');
    BSI.hud.faixa('A ALMA ESTÁ FRACA!', 'Só O ABOIO DO TIO OTA acaba com ela', 'Poder de grupo [' + BSI.input.rotulo('poder') + '] com os três netos juntos: Miguel, Daniel e João Pedro.');
  };

  A.derrotar = function (m) {
    if (this.estado === 'derrotada') return;
    this.estado = 'derrotada'; this.tEstado = 0;
    if (this.aoDerrotar) { BSI.audio.sfx('alma'); m.camera.tremer(10); m.particulas.explosao(this.x, this.y - 20, 60, [C.alma, '#ffffff', '#6a8fc4'], 120, 1.6, { grav: -30 }); this.aoDerrotar(m); return; }
    BSI.story.flag('alma_derrotada');
    BSI.audio.sfx('alma');
    m.camera.tremer(8);
    m.particulas.explosao(this.x, this.y - 14, 40, [C.alma, '#ffffff', '#6a8fc4'], 90, 1.4, { grav: -30 });
    BSI.roteiro.rodar([['espera', 1.6], ['fala', 'alma_derrota'], ['faz', function () { BSI.fases.iniciar('amanhecer'); }]]);
  };

  // ---------- cérebro ----------
  A.alvo = function (m) {
    var isca = null;
    m.props.forEach(function (p) { if (p.isca && !p.morto) isca = p; });
    if (isca) return isca;
    if (this.st.provocado > 0 && this.provocador && !this.provocador.caido) return this.provocador;
    var melhor = null, md = 1e12, self = this;
    m.herois.forEach(function (h) { if (h.caido || h.st.invisivel > 0) return; var d = U.dist2(h.x, h.y, self.x, self.y); if (d < md) { md = d; melhor = h; } });
    return melhor;
  };

  A.atualizar = function (dt, m) {
    this.t += dt; this.tEstado += dt;
    if (this.flash > 0) this.flash -= dt;
    for (var k in this.st) if (this.st[k] > 0) this.st[k] -= dt;
    if (this.estado === 'oculta') return;
    if (this.estado === 'aparecendo') { this.alfa = Math.min(0.5, this.alfa + dt * 0.3); return; }
    if (this.estado === 'derrotada') { this.alfa = Math.max(0, this.alfa - dt * 0.5); this.y -= dt * 10; return; }
    if (this.tEstado < 0) { this.alfa = Math.min(0.85, this.alfa + dt); return; } // carência ao voltar do checkpoint
    this.alfa = 0.6 + Math.sin(this.t * 7) * 0.12 + (Math.random() < 0.05 ? -0.4 : 0);
    var self = this, acuada = this.estado === 'acuada';

    // ---- coisas que a alma não suporta ----
    var empX = 0, empY = 0;
    m.herois.forEach(function (h) {
      if (h.caido || !(h.st.rezando > 0)) return;
      var d = U.dist(h, self);
      if (d < 62) { var n = U.norm(self.x - h.x, self.y - h.y); empX += n.x * 110; empY += n.y * 110; self.levarDano(5 * dt, m, h, 'reza'); }
    });
    m.props.forEach(function (p) {
      if (p.sinal && p.ativo && U.dist(p, self) < 46) { var n = U.norm(self.x - p.x, self.y - p.y); empX += n.x * 90; empY += n.y * 90; self.levarDano(4 * dt, m, null, 'sinal'); }
      if (p.fogueira && p.forca > 0.3) {
        var d = U.dist(p, self);
        if (d < 44) { var nf = U.norm(self.x - p.x, self.y - p.y); empX += nf.x * 70; empY += nf.y * 70; }
        if (d < 64) p.forca = Math.max(0, p.forca - dt * 0.18); // ela tenta apagar a fogueira
      }
    });
    if (acuada) {
      this.tAcuada -= dt;
      if (this.tAcuada <= 0) {
        // o aboio vem sozinho lá do curral: o Tio Ota protege os netos
        BSI.hud.faixa('UM ABOIO AO LONGE...', 'Lá do curral, a voz do Tio Ota.', 'O gado veio sozinho.');
        BSI.audio.sfx('aboio'); m.estouroBoiada();
        this.derrotar(m);
        return;
      }
    }
    if (this.st.atordoado > 0) { this.mover(dt, empX, empY); return; }

    // ---- ataques ----
    this.cdInvestida -= dt; this.cdGrito -= dt; this.cdApagao -= dt;
    if (this.cdApagao <= 0) { this.cdApagao = 9 + Math.random() * 5; m.apagao = 2; BSI.audio.sfx('estalo'); }
    if (!acuada && this.cdGrito <= 0 && this.estado === 'ativa') {
      this.cdGrito = 15 + Math.random() * 5;
      BSI.audio.sfx('alma'); m.camera.tremer(6);
      var L = m.lider();
      m.herois.forEach(function (h) { if (h !== L && !h.caido) { h.kbx += (Math.random() - 0.5) * 520; h.kby += (Math.random() - 0.5) * 520; h.st.zonzo = 2; } });
      BSI.hud.aviso('O grito da alma espalhou o grupo no escuro!', '#9fd8ff');
    }

    var a = this.alvo(m);
    if (this.estado === 'prep') {
      if (this.tEstado > 0.9) { this.estado = 'investida'; this.tEstado = 0; BSI.audio.sfx('alma'); }
      this.mover(dt, empX * 0.3, empY * 0.3);
      return;
    }
    if (this.estado === 'investida') {
      this.mover(dt, this.dirInv.x * 175 + empX, this.dirInv.y * 175 + empY);
      this.tocar(m, 2);
      if (this.tEstado > 0.8) { this.estado = acuada ? 'acuada' : 'ativa'; this.tEstado = 0; }
      return;
    }
    if (this.estado === 'comendo') {
      if (!a || !a.isca) { this.estado = 'ativa'; this.tEstado = 0; }
      else { this.mover(dt, (a.x - this.x) * 3 + empX, (a.y - 8 - this.y) * 3 + empY); return; }
    }
    if (!a) { this.mover(dt, empX, empY); return; }
    var dx = a.x - this.x, dy = a.y - this.y, dist = Math.sqrt(dx * dx + dy * dy) || 1;
    // acuada, ela não cai mais na isca: só o aboio termina
    if (a.isca && dist < 10 && !acuada) { this.estado = 'comendo'; this.tEstado = 0; m.falar(this, '...cheiro de carne...', 1.5); return; }
    var vel = acuada ? 18 : 36;
    if (BSI.story.tem('irmaos_unidos')) { var dz = m.acharNpc && m.acharNpc('diazepan'); if (dz && U.dist(dz, this) < 90) vel *= 0.55; }
    var deriva = U.girar(dx / dist, dy / dist, Math.sin(this.t * 1.7) * 0.6);
    if (this.st.medo > 0) { var nm = U.norm(this.x - this.medoDe.x, this.y - this.medoDe.y); deriva = nm; vel = 50; }
    this.mover(dt, deriva.x * vel + empX, deriva.y * vel + empY);
    this.face = { x: dx / dist, y: dy / dist };
    this.tocar(m, 1);
    if (!acuada && !a.isca && this.cdInvestida <= 0 && dist < 130) {
      this.cdInvestida = 6 + Math.random() * 3;
      this.estado = 'prep'; this.tEstado = 0;
      this.dirInv = { x: dx / dist, y: dy / dist };
    }
  };

  // alma atravessa parede: move direto, sem colisão (mas não sai do mapa)
  A.mover = function (dt, vx, vy) {
    var T = BSI.cfg.TILE, m = BSI.jogo.mundo;
    this.x = U.clamp(this.x + vx * dt, T, (m.mapa.w - 1) * T);
    this.y = U.clamp(this.y + vy * dt, T, (m.mapa.h - 1) * T);
  };
  A.tocar = function (m, dano) {
    var self = this;
    m.herois.forEach(function (h) {
      if (h.caido || h.inv > 0) return;
      var alc = 12 * (self.escala || 1);
      if (U.dist2(h.x, h.y - 4, self.x, self.y - 4) < alc * alc) { h.levarDano(dano, m, self, 'alma'); h.st.zonzo = 1.5; }
    });
  };

  // ---------- desenho (fantasma do coronel, feito na hora) ----------
  A.desenhar = function (g, cx, cy) {
    if (this.estado === 'oculta' || this.alfa <= 0.01) return;
    var x = Math.round(this.x - cx), y = Math.round(this.y - cy) - 6 + Math.round(Math.sin(this.t * 2.5) * 2);
    var prep = this.estado === 'prep';
    if (prep) x += Math.round((Math.random() - 0.5) * 3);
    var esc = this.escala || 1;
    if (esc !== 1) { g.save(); g.translate(x, y + 6); g.scale(esc, esc); g.translate(-x, -(y + 6)); }
    g.globalAlpha = Math.max(0, Math.min(1, this.alfa));
    var corpo = this.flash > 0 ? '#ffffff' : '#9fd8ff', esc = '#5a8fc4', fundo = '#2a4a7a';
    // rabo de fumaça
    for (var i = 0; i < 4; i++) {
      var w = 10 - i * 2;
      g.fillStyle = i % 2 ? esc : fundo;
      g.fillRect(x - w / 2 + Math.round(Math.sin(this.t * 4 + i) * 2), y + 4 + i * 3, w, 3);
    }
    // casaco do coronel
    g.fillStyle = fundo; g.fillRect(x - 7, y - 14, 14, 19);
    g.fillStyle = esc; g.fillRect(x - 6, y - 13, 12, 17);
    g.fillStyle = corpo; g.fillRect(x - 1, y - 13, 2, 15); g.fillRect(x - 4, y - 8, 1, 1); g.fillRect(x + 3, y - 8, 1, 1);
    // braços esticados
    g.fillStyle = esc; g.fillRect(x - 11, y - 11, 5, 3); g.fillRect(x + 6, y - 11, 5, 3);
    g.fillStyle = corpo; g.fillRect(x - 13, y - 11, 2, 2); g.fillRect(x + 11, y - 11, 2, 2);
    // cabeça, bigode e chapéu de coronel
    g.fillStyle = corpo; g.fillRect(x - 5, y - 24, 10, 10);
    g.fillStyle = fundo; g.fillRect(x - 4, y - 17, 8, 2);
    g.fillStyle = fundo; g.fillRect(x - 9, y - 25, 18, 2); g.fillRect(x - 5, y - 31, 10, 6);
    g.fillStyle = esc; g.fillRect(x - 5, y - 27, 10, 1);
    // olhos
    var olho = prep || this.estado === 'investida' ? '#ff4a3a' : '#e8f8ff';
    g.fillStyle = olho; g.fillRect(x - 3, y - 21, 2, 2); g.fillRect(x + 1, y - 21, 2, 2);
    g.globalAlpha = 1;
    if (esc !== 1) g.restore();
    if (this.estado === 'acuada') {
      g.strokeStyle = 'rgba(240,199,94,' + (0.4 + Math.sin(this.t * 8) * 0.3).toFixed(2) + ')';
      g.beginPath(); g.ellipse(x, y + 6, 14, 6, 0, 0, Math.PI * 2); g.stroke();
    }
    if (this.estado === 'comendo') { g.fillStyle = C.amarelo; g.fillRect(x + 8, y - 30, 1, 3); g.fillRect(x + 8, y - 26, 1, 1); }
  };
  A.luz = function () {
    if (this.estado === 'oculta' || this.estado === 'derrotada') return null;
    return { x: this.x, y: this.y - 14 * (this.escala || 1), r: (30 + Math.sin(this.t * 5) * 4) * (this.escala || 1), forca: 0.55 * Math.min(1, this.alfa + 0.2), cor: '#9fd8ff' };
  };

  // =========================================================
  //  ISCA: carne assada do Miguel (a alma é atraída pelo cheiro)
  // =========================================================
  function Isca(x, y) { BSI.Entidade.call(this, x, y, 4, 3); this.isca = true; this.vida = 7; }
  Isca.prototype = Object.create(BSI.Entidade.prototype);
  Isca.prototype.atualizar = function (dt, m) {
    this.t += dt; this.vida -= dt;
    if (Math.random() < 0.15) m.particulas.fumaca(this.x + (Math.random() - 0.5) * 4, this.y - 8);
    if (this.vida <= 0) this.morto = true;
  };
  Isca.prototype.desenhar = function (g, cx, cy) {
    var x = Math.round(this.x - cx), y = Math.round(this.y - cy);
    g.fillStyle = C.madeiraEsc; g.fillRect(x - 1, y - 12, 1, 12);
    g.fillStyle = C.contorno; g.fillRect(x - 4, y - 12, 8, 6);
    g.fillStyle = '#8a3a20'; g.fillRect(x - 3, y - 11, 6, 4);
    g.fillStyle = '#c86a3a'; g.fillRect(x - 3, y - 11, 6, 1);
  };
  Isca.prototype.luz = function () { return { x: this.x, y: this.y - 8, r: 14, forca: 0.5, cor: '#f7a733' }; };

  // =========================================================
  //  SINAL DE PROTEÇÃO DO TIO OTA (ferradura no mourão do curral)
  // =========================================================
  function Sinal(x, y, chave) {
    BSI.Entidade.call(this, x, y, 4, 3);
    this.sinal = true; this.chave = chave;
    this.ativo = !!(BSI.state.sinais && BSI.state.sinais[chave]);
    this.dialogo = this.ativo ? null : 'sinal_protecao';
  }
  Sinal.prototype = Object.create(BSI.Entidade.prototype);
  Sinal.prototype.atualizar = function (dt) { this.t += dt; };
  Sinal.prototype.ativar = function () {
    this.ativo = true; this.dialogo = null;
    BSI.state.sinais = BSI.state.sinais || {};
    BSI.state.sinais[this.chave] = true;
    BSI.audio.sfx('cura');
  };
  Sinal.prototype.desenhar = function (g, cx, cy) {
    var x = Math.round(this.x - cx), y = Math.round(this.y - cy);
    g.fillStyle = C.contorno; g.fillRect(x - 2, y - 20, 5, 21);
    g.fillStyle = C.madeira; g.fillRect(x - 1, y - 19, 3, 19);
    // ferradura
    g.fillStyle = '#a8aeb6'; g.fillRect(x - 3, y - 17, 1, 5); g.fillRect(x + 3, y - 17, 1, 5); g.fillRect(x - 2, y - 12, 5, 1);
    if (this.ativo) {
      var a = Math.round(Math.sin(this.t * 10) * 1);
      g.fillStyle = C.fogo3; g.fillRect(x, y - 24 + a, 2, 3);
      g.fillStyle = C.fogo1; g.fillRect(x, y - 23 + a, 1, 2);
      g.strokeStyle = 'rgba(240,199,94,0.25)';
      g.beginPath(); g.ellipse(x, y, 46, 28, 0, 0, Math.PI * 2); g.stroke();
    }
  };
  Sinal.prototype.luz = function () { return this.ativo ? { x: this.x, y: this.y - 20, r: 40, forca: 0.9, cor: '#f0c75e' } : null; };

  // depois de vencida, a alma simplesmente não aparece mais
  Alma.semNpc = true;
  Alma.depois = function () { return BSI.story.tem('alma_derrotada') ? 'nada' : null; };

  BSI.chefes = BSI.chefes || {};
  BSI.chefes.alma = Alma;
  BSI.Isca = Isca;
  BSI.Sinal = Sinal;
})();
