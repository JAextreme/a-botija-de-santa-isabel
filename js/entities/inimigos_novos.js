/* =========================================================
   inimigos_novos.js — 8 INIMIGOS NOVOS + FILA DE ATAQUE
   capanga de peixeira · capanga de espingarda (mantém
   distância) · capanga de escudo (só toma dano por trás) ·
   cachorro bravo (em grupo) · cascavel (escondida no mato,
   avisa com o chocalho) · enxame de abelha italiana (persegue
   até você entrar na água) · alma menor (atravessa parede,
   só morre com luz/reza/fogo) · bode endiabrado (investida).
   Todo ataque perigoso tem AVISO antes (pisca vermelho, linha,
   chocalho). No máximo 2 ou 3 atacam ao mesmo tempo; o resto
   fica rodeando (config/balance.js → combate.maxAtacando).
   ========================================================= */
(function () {
  'use strict';
  var U = BSI.util, C = BSI.cor, T = BSI.cfg.TILE;
  var Inimigo = BSI.Inimigo, P = Inimigo.prototype;

  var CAPANGA = { pele: '#a87048', cabelo: '#1a120c', camisa: '#1e1e24', calca: '#2a2a33', chapeu: '#1a1a20', cabeca: 'chapeuPreto', extras: ['oculosEscuros'] };
  function vis(o) { var v = U.clonar(CAPANGA); for (var k in o) v[k] = o[k]; return v; }

  var NOVOS = {
    capangaPeixeira: { nome: 'Capanga de peixeira', vida: 3, vel: 54, visao: 110, dano: 1, ataque: 'corpo', humano: true, prep: 0.32, visual: vis({ camisa: '#6a2a2a', camisa2: '#3a1a1a', padrao: 'listra', acessorio: null }), falas: ['Vem cá, cabra!', 'Tá olhando o quê?'] },
    capangaEspingarda: { nome: 'Capanga de espingarda', vida: 3, vel: 36, visao: 150, dano: 1, ataque: 'espingarda', humano: true, prep: 0.75, visual: vis({ camisa: '#3a4a3a', cabeca: 'chapeu', chapeu: '#4a3020', extras: ['bigode'] }), falas: ['Fica parado aí!', 'Na mira, macho!'] },
    capangaEscudo: { nome: 'Capanga de escudo', vida: 6, vel: 30, visao: 100, dano: 2, ataque: 'corpo', humano: true, prep: 0.6, escudo: true, visual: vis({ camisa: '#4a4a5a', cabeca: 'bone', chapeu: '#2a2a33', extras: ['barba'] }), falas: ['Pode bater, que a porta aguenta!'] },
    cachorroBravo: { nome: 'Cachorro bravo', vida: 2, vel: 72, visao: 120, dano: 1, ataque: 'corpo', prep: 0.25, bicho: 'cachorroBravo', alcance: 13 },
    cascavel: { nome: 'Cascavel', vida: 1.5, vel: 20, visao: 46, dano: 2, ataque: 'bote', prep: 0.55, bicho: 'cascavel', escondida: true },
    abelhas: { nome: 'Enxame de abelha italiana', vida: 4, vel: 62, visao: 120, dano: 1, ataque: 'enxame', voando: true, bicho: 'abelhas' },
    almaMenor: { nome: 'Alma menor', vida: 3, vel: 30, visao: 130, dano: 1, ataque: 'enxame', voando: true, alma: true, bicho: 'almaMenor' },
    bodeEndiabrado: { nome: 'Bode endiabrado', vida: 5, vel: 34, visao: 120, dano: 2, ataque: 'investida', prep: 0.8, bicho: 'bodeEndiabrado' }
  };
  Object.keys(NOVOS).forEach(function (k) { BSI.data.inimigos[k] = NOVOS[k]; });
  // boneco de palha do campo de tiro (debug): não anda, não ataca
  BSI.data.inimigos.boneco = { nome: 'Boneco de palha', vida: 999, vel: 0, visao: 0, dano: 0, ataque: 'corpo', humano: true, visual: { pele: '#d8b870', cabelo: '#c8a050', camisa: '#a8402a', calca: '#3b5b8c', cabeca: 'palha', chapeu: '#e0c27a' } };

  // ---------------- sprites dos bichos (arte 1x, vira 2x com relevo) ----------------
  var PT = BSI.painter;
  PT.cachorroBravo = function (g, q) { PT.cachorro(g, q, '#4a4038', '#2a221c'); g.fillStyle = '#c03030'; g.fillRect(1, 3, 1, 1); g.fillStyle = '#f2f0ea'; g.fillRect(1, 5, 1, 1); g.fillRect(3, 5, 1, 1); };
  PT.cascavel = function (g, q) {
    var r = function (x, y, w, h, c) { g.fillStyle = c; g.fillRect(x, y, w, h); }, o = q === 1 ? 1 : 0;
    for (var i = 0; i < 12; i++) { var y = 4 + Math.round(Math.sin(i * 0.8 + o) * 1.5); r(2 + i, y, 1, 2, i % 3 === 0 ? '#5a4a2a' : '#9a8048'); if (i % 3 === 1) r(2 + i, y, 1, 1, '#d8c080'); }
    r(0, 3 + o, 3, 3, '#8a7040'); r(0, 4 + o, 1, 1, '#c03030'); r(1, 3 + o, 1, 1, C.contorno); // cabeça
    r(14, 3, 2, 2, '#e8d8a0'); r(15, 2, 1, 1, '#e8d8a0'); // chocalho
  };
  PT.abelhas = function (g, q) {
    for (var i = 0; i < 9; i++) { var x = 3 + ((i * 5 + q * 3) % 11), y = 2 + ((i * 7 + q * 2) % 8); g.fillStyle = '#e8c040'; g.fillRect(x, y, 2, 1); g.fillStyle = '#2a2018'; g.fillRect(x + 1, y, 1, 1); g.fillStyle = 'rgba(230,240,255,0.8)'; g.fillRect(x, y - 1, 1, 1); }
  };
  PT.almaMenor = function (g, q) {
    var r = function (x, y, w, h, c) { g.fillStyle = c; g.fillRect(x, y, w, h); };
    r(3, 2, 8, 9, '#9fd8ff'); r(2, 4, 10, 6, '#9fd8ff'); r(4, 1, 6, 1, '#c8ecff'); r(3, 11, 2, 2 + q, '#7ab8e8'); r(7, 11, 2, 3 - q, '#7ab8e8'); r(10, 10, 2, 2, '#7ab8e8');
    r(5, 5, 1, 2, '#1a2a4a'); r(8, 5, 1, 2, '#1a2a4a'); r(6, 8, 2, 1, '#1a2a4a'); r(4, 3, 2, 1, '#ffffff');
  };
  PT.bodeEndiabrado = function (g, q) { PT.bode(g, q); g.fillStyle = '#c03030'; g.fillRect(3, 4, 1, 1); g.fillStyle = '#3a2a20'; g.fillRect(4, 0, 1, 3); g.fillRect(6, 0, 1, 2); g.fillStyle = '#2a2018'; g.fillRect(9, 6, 4, 2); };
  var SPR = { cachorroBravo: [15, 11, 8, 10], cascavel: [16, 8, 8, 7], abelhas: [16, 12, 8, 9], almaMenor: [14, 15, 7, 13], bodeEndiabrado: [17, 16, 9, 14] };
  function sprBicho(id) { var s = SPR[id]; return BSI.sprites.bicho('inimigo:' + id, PT[id], s[0], s[1], s[2], s[3]); }

  // ---------------- dificuldade ----------------
  function DIF() { var d = (BSI.state && BSI.state.dificuldade) || BSI.save.cfg().dificuldade || 'cabra'; return BSI.config.balance.dificuldades[d] || BSI.config.balance.dificuldades.cabra; }
  BSI.dificuldade = DIF;
  var construir = Inimigo;
  // vida conforme a dificuldade (vale pros antigos também)
  var origAtualizar = P.atualizar, origDesenhar = P.desenhar, origLevar = P.levarDano, origGolpear = P.golpear, origComecar = P.comecarGolpe;

  // ---------------- FILA DE ATAQUE: no máximo N atacando ----------------
  function atacandoAgora(m) { var n = 0; m.inimigos.forEach(function (i) { if (!i.morto && i.time === 'inimigos' && !i.chefe && i.estado === 'prepara') n++; }); return n; }
  P.comecarGolpe = function (nx, ny, m) {
    m = m || (BSI.jogo && BSI.jogo.mundo);
    if (m && this.time === 'inimigos' && atacandoAgora(m) >= (DIF().maxAtacando || 3)) { this.rodeando = 0.8; return; } // espera a vez, rodeando
    origComecar.call(this, nx, ny);
  };

  P.atualizar = function (dt, m) {
    if (!this._difOk) { this._difOk = true; this.vida *= DIF().vidaInimigo; this.vidaMax = this.vida; }
    if (this.rodeando > 0 && this.alvo && !this.st.atordoado) { // rodeando o alvo enquanto espera a vez
      this.rodeando -= dt; this.t += dt; this.tEstado += dt; if (this.flash > 0) this.flash -= dt; if (this.alerta > 0) this.alerta -= dt; this.empurrao(dt, m.mapa);
      var a = this.alvo, dx = this.x - a.x, dy = this.y - a.y, d = Math.sqrt(dx * dx + dy * dy) || 1, lado = (this.id.length % 2 ? 1 : -1);
      var nx = -dy / d * lado + (dx / d) * (d < 30 ? 0.6 : -0.4), ny = dx / d * lado + (dy / d) * (d < 30 ? 0.6 : -0.4);
      var nn = U.norm(nx, ny); this.andar(dt, m, nn.x, nn.y, 0.7); this.face = U.norm(-dx, -dy); this.dir = U.dirDe(this.face.x, this.face.y);
      return;
    }
    var d0 = this.d;
    if (d0.ataque === 'espingarda') return atualizarEspingarda.call(this, dt, m);
    if (d0.ataque === 'bote') return atualizarCascavel.call(this, dt, m);
    if (d0.ataque === 'enxame') return atualizarEnxame.call(this, dt, m);
    if (d0.ataque === 'investida') return atualizarBode.call(this, dt, m);
    return origAtualizar.call(this, dt, m);
  };

  // passa um quadro de "relógio" comum a todos os comportamentos novos
  function relogio(self, dt, m) {
    self.t += dt; self.tEstado += dt;
    for (var k in self.st) if (self.st[k] > 0) self.st[k] -= dt;
    if (self.flash > 0) self.flash -= dt; if (self.alerta > 0) self.alerta -= dt; if (self.cd > 0) self.cd -= dt;
    if (!self.d.voando) self.empurrao(dt, m.mapa); else { self.x += self.kbx * dt; self.y += self.kby * dt; self.kbx *= 0.9; self.kby *= 0.9; }
    return !(self.st.atordoado > 0 || self.st.acalmado > 0);
  }
  function avisoAlerta(self, alvo, m) {
    if (alvo && !self.alvo && self.time === 'inimigos') { self.alerta = 0.7; BSI.audio.sfx('alerta'); if (self.d.falas && Math.random() < 0.6) m.falar(self, BSI.rng.pick(self.d.falas), 1.6); }
    self.alvo = alvo;
  }

  // ---- capanga de espingarda: mantém distância, mira (linha vermelha) e atira em leque ----
  function atualizarEspingarda(dt, m) {
    if (!relogio(this, dt, m)) return;
    if (this.st.medo > 0) { var nf = U.norm(this.x - this.medoDe.x, this.y - this.medoDe.y); this.andar(dt, m, nf.x, nf.y, 1.2); return; }
    var alvo = this.escolherAlvo(m); avisoAlerta(this, alvo, m);
    if (!alvo) { this.estado = 'patrulha'; return; }
    var dx = alvo.x - this.x, dy = alvo.y - this.y, d = Math.sqrt(dx * dx + dy * dy) || 1, nx = dx / d, ny = dy / d;
    if (this.estado === 'prepara') { this.face = { x: nx, y: ny }; this.dir = U.dirDe(nx, ny); if (this.tEstado > this.d.prep) this.golpear(m); return; }
    if (this.estado === 'recupera') { if (this.tEstado > 0.6) { this.estado = 'persegue'; this.tEstado = 0; } this.andar(dt, m, -nx, -ny, 0.5); return; } // recua depois do tiro
    this.estado = 'persegue';
    var lado = Math.sin(this.t * 0.9 + this.x) > 0 ? 1 : -1;
    if (d < 85) this.andar(dt, m, -nx - ny * lado * 0.5, -ny + nx * lado * 0.5, 1);
    else if (d > 140) this.andar(dt, m, nx, ny, 1);
    else this.andar(dt, m, -ny * lado, nx * lado, 0.5);
    this.face = { x: nx, y: ny }; this.dir = U.dirDe(nx, ny);
    if (this.cd <= 0 && d < 150 && BSI.colisao.visao(m.mapa, this.x, this.y - 6, alvo.x, alvo.y - 6)) this.comecarGolpe(nx, ny, m);
  }

  // ---- cascavel: quieta no mato; chega perto, chocalha e dá o bote ----
  function atualizarCascavel(dt, m) {
    if (!relogio(this, dt, m)) return;
    var L = m.lider(), alvo = null, md = 1e9, self = this;
    m.herois.forEach(function (h) { if (h.caido) return; var d2 = U.dist2(h.x, h.y, self.x, self.y); if (d2 < md) { md = d2; alvo = h; } });
    var d = Math.sqrt(md);
    this.visivel = d < 60 || this.estado !== 'patrulha' || this.flash > 0 || (L && L.id === 'vander');
    if (this.estado === 'prepara') { if (this.tEstado > this.d.prep) this.golpear(m); return; }
    if (this.estado === 'recupera') { if (this.tEstado > 1.2) { this.estado = 'patrulha'; this.tEstado = 0; } return; }
    if (alvo && d < 50) {
      if (!this.chocalhando) { this.chocalhando = true; m.falar(this, 'tssssss...', 1); BSI.audio.sfx('crepita'); }
      if (d < 26 && this.cd <= 0) { var n = U.norm(alvo.x - this.x, alvo.y - this.y); this.alvo = alvo; this.comecarGolpe(n.x, n.y, m); }
    } else this.chocalhando = false;
  }

  // ---- enxame (abelhas) e alma menor: voam por cima de tudo ----
  function atualizarEnxame(dt, m) {
    if (!relogio(this, dt, m)) return;
    var alma = this.d.alma, self = this;
    if (alma && m.ambienteAtual > 0.75 && !m.terror()) { this.morrer(m); return; } // alma não aguenta claridade
    var alvo = this.escolherAlvoVoando(m); avisoAlerta(this, alvo, m);
    if (!alvo) { this.x += Math.sin(this.t * 2) * 6 * dt; this.y += Math.cos(this.t * 1.7) * 6 * dt; return; }
    // abelha desiste se o alvo estiver na água (ou com fogo/fumaça perto)
    if (!alma) {
      var tx = Math.floor(alvo.x / T), ty = Math.floor(alvo.y / T), agua = false;
      for (var yy = ty - 1; yy <= ty + 1; yy++) for (var xx = tx - 1; xx <= tx + 1; xx++) if (m.mapa.ch(xx, yy) === '~') agua = true;
      if (agua) { this.estado = 'volta'; var nv = U.norm(this.x - alvo.x, this.y - alvo.y); this.x += nv.x * 50 * dt; this.y += nv.y * 50 * dt; if (U.dist(this, alvo) > 120) { this.morto = true; m.falar(alvo, 'Ufa! Abelha não nada.', 1.5); } return; }
      if (m.fogo.queimandoPx(this.x, this.y + 6)) { this.levarDano(1, m, null, 'fogo'); }
    }
    var dx = alvo.x - this.x, dy = (alvo.y - 8) - this.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
    var v = this.d.vel * (m.multVelInimigo || 1) * (this.st.medo > 0 ? -1 : 1);
    var bal = Math.sin(this.t * 6) * 0.5;
    this.x += (dx / d + -dy / d * bal) * v * dt; this.y += (dy / d + dx / d * bal) * v * dt;
    this.face = { x: dx / d, y: dy / d };
    if (d < 12 && this.cd <= 0) { alvo.levarDano(this.d.dano, m, this, alma ? 'alma' : 'ferroada'); this.cd = 1.1; if (!alma && Math.random() < 0.4) m.falar(alvo, BSI.rng.pick(['Ai! Ai! Abelha!', 'Corre pro açude!', 'Me ferroou!']), 1.2); }
  }
  P.escolherAlvoVoando = function (m) {
    if (this.alvo && !this.alvo.caido && U.dist(this.alvo, this) < this.d.visao * 2) return this.alvo;
    var melhor = null, md = this.d.visao * this.d.visao, self = this;
    m.herois.forEach(function (h) { if (h.caido || (h.st.invisivel > 0)) return; var d2 = U.dist2(h.x, h.y, self.x, self.y); if (d2 < md) { md = d2; melhor = h; } });
    return melhor;
  };

  // ---- bode endiabrado: raspa o casco (linha vermelha) e corre em linha reta ----
  function atualizarBode(dt, m) {
    if (!relogio(this, dt, m)) return;
    if (this.estado === 'investida') {
      var v = 200 * (m.multVelInimigo || 1), ax = this.x, ay = this.y;
      BSI.colisao.mover(this, m.mapa, this.dirInv.x * v * dt, this.dirInv.y * v * dt);
      if (Math.random() < 0.6) m.particulas.poeira(this.x, this.y);
      var self = this;
      m.herois.forEach(function (h) { if (!h.caido && U.dist2(h.x, h.y, self.x, self.y) < 12 * 12 && self.atingidos.indexOf(h) < 0) { self.atingidos.push(h); h.levarDano(self.d.dano, m, self, 'corpo'); h.empurrar(self.x, self.y, 260); } });
      if (U.len(this.x - ax, this.y - ay) < v * dt * 0.3) { this.atordoar(1.8); m.camera.tremer(3); BSI.audio.sfx('batida'); m.falar(this, 'Mééé...', 1); BSI.impacto && BSI.impacto.palavra(m, this.x, this.y - 18, 'TOING!', '#fff1a8'); return; } // bateu na parede: tonto
      if (this.tEstado > 0.7) { this.estado = 'recupera'; this.tEstado = 0; }
      return;
    }
    if (this.estado === 'prepara') { if (Math.random() < 0.3) m.particulas.poeira(this.x - this.face.x * 6, this.y); if (this.tEstado > this.d.prep) { this.estado = 'investida'; this.tEstado = 0; this.atingidos = []; BSI.audio.sfx('bode'); } return; }
    if (this.estado === 'recupera') { if (this.tEstado > 1.0) { this.estado = 'persegue'; this.tEstado = 0; } return; }
    var alvo = this.escolherAlvo(m); avisoAlerta(this, alvo, m);
    if (!alvo) return origAtualizar.call(this, 0, m);
    var dx = alvo.x - this.x, dy = alvo.y - this.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
    if (d < 110 && this.cd <= 0) { this.dirInv = { x: dx / d, y: dy / d }; this.comecarGolpe(dx / d, dy / d, m); this.cd = 2.5; return; }
    this.andar(dt, m, dx / d, dy / d, 0.8);
  }

  // ---------------- golpes novos ----------------
  P.golpear = function (m) {
    var a = this.d.ataque, f = this.face;
    if (a === 'espingarda') {
      this.estado = 'recupera'; this.tEstado = 0;
      for (var k = 0; k < 3; k++) { var v = U.girar(f.x, f.y, (k - 1) * 0.16); m.projeteis.push(new BSI.Projetil({ x: this.x + f.x * 8, y: this.y - 7, vx: v.x * 190, vy: v.y * 190, vida: 0.6, dano: this.d.dano, time: this.time, tipo: 'chumbo', dono: this })); }
      BSI.audio.sfx('tiro'); m.camera.tremer(1.5); m.clarao(this.x + f.x * 10, this.y - 7); m.barulho(this.x, this.y, 200);
      this.cd = 2.2 + Math.random();
      return;
    }
    if (a === 'bote') {
      this.estado = 'recupera'; this.tEstado = 0; this.cd = 1.5;
      var al = this.alvo;
      if (al && U.dist(al, this) < 30) { al.levarDano(this.d.dano, m, this, 'corpo'); al.st.zonzo = Math.max(al.st.zonzo || 0, 2); m.falar(al, 'A COBRA! Ai, ai!', 1.4); }
      this.x += f.x * 10; this.y += f.y * 6; BSI.audio.sfx('facada');
      return;
    }
    return origGolpear.call(this, m);
  };

  // ---------------- dano: escudo, alma, enxame ----------------
  P.levarDano = function (qtd, m, fonte, tipo) {
    var d = this.d;
    // capanga de escudo: de frente, só fogo e explosão passam
    if (d.escudo && fonte && tipo !== 'fogo' && tipo !== 'luz' && tipo !== 'explosao') {
      var fx = fonte.x - this.x, fy = fonte.y - this.y, fd = Math.sqrt(fx * fx + fy * fy) || 1;
      if ((fx * this.face.x + fy * this.face.y) / fd > 0.1 && this.estado !== 'recupera') {
        BSI.audio.sfx('estalo'); m.particulas.explosao(this.x + this.face.x * 6, this.y - 8, 4, ['#c8d0d8', '#ffffff'], 30, 0.2);
        if (BSI.impacto && Math.random() < 0.4) BSI.impacto.palavra(m, this.x, this.y - 20, 'TONC!', '#c8d0d8');
        if (fonte.empurrar) fonte.empurrar(this.x, this.y, 60);
        return;
      }
    }
    // alma menor: só luz, reza e fogo
    if (d.alma && !this.chefe && tipo !== 'luz' && tipo !== 'fogo' && tipo !== 'reza' && tipo !== 'aboio') { if (Math.random() < 0.3 && BSI.impacto) BSI.impacto.palavra(m, this.x, this.y - 16, 'OXE? ATRAVESSOU!', '#9fd8ff'); return; }
    // enxame: golpe e tiro quase não fazem nada; fogo e farinha espantam
    if (d.ataque === 'enxame' && !d.alma && tipo !== 'fogo' && tipo !== 'pimenta') qtd *= 0.25;
    return origLevar.call(this, qtd, m, fonte, tipo);
  };

  // ---------------- desenho ----------------
  P.desenhar = function (g, cx, cy) {
    var d = this.d;
    if (!d.bicho) {
      origDesenhar.call(this, g, cx, cy);
      var x = Math.round(this.x - cx), y = Math.round(this.y - cy);
      if (d.escudo) { var sx = x + this.face.x * 7, sy = y - 8 + this.face.y * 5; g.fillStyle = C.contorno; g.fillRect(sx - 5, sy - 7, 10, 13); g.fillStyle = '#7a8088'; g.fillRect(sx - 4, sy - 6, 8, 11); g.fillStyle = '#aeb6be'; g.fillRect(sx - 4, sy - 6, 3, 11); g.fillStyle = '#c03030'; g.fillRect(sx - 1, sy - 2, 2, 2); }
      // espingarda: linha vermelha de mira (aviso!)
      if (d.ataque === 'espingarda' && this.estado === 'prepara') { var al = this.alvo; if (al) { g.strokeStyle = 'rgba(255,60,40,' + (0.3 + this.tEstado / d.prep * 0.6).toFixed(2) + ')'; g.lineWidth = 0.5; g.beginPath(); g.moveTo(x, y - 7); g.lineTo(al.x - cx, al.y - cy - 6); g.stroke(); } }
      return;
    }
    if (d.escondida && !this.visivel) return;
    var spr = sprBicho(d.bicho), dir = this.face.x > 0 ? 'right' : 'left', q = Math.floor(this.t * (d.voando ? 10 : 6)) % 3;
    var voa = d.voando ? Math.sin(this.t * 4) * 2 + 6 : 0;
    if (!d.voando) this.sombra(g, cx, cy, d.bicho === 'cascavel' ? 12 : 10);
    else { g.fillStyle = 'rgba(20,10,20,0.25)'; g.fillRect(Math.round(this.x - cx) - 4, Math.round(this.y - cy), 8, 1); }
    var prep = this.estado === 'prepara' && Math.floor(this.tEstado * 14) % 2 === 0;
    var img = this.flash > 0 ? spr.branco[dir][q] : (prep && spr.vermelho ? spr.vermelho[dir][q] : spr.dirs[dir][q]);
    var alfa = d.alma ? 0.6 + Math.sin(this.t * 3) * 0.2 : 1;
    BSI.sprites.pintar(g, spr, img, this.x - cx, this.y - cy - voa, alfa);
    var x2 = Math.round(this.x - cx), y2 = Math.round(this.y - cy);
    // bode: linha da investida (aviso)
    if (d.ataque === 'investida' && this.estado === 'prepara' && this.dirInv) { g.fillStyle = 'rgba(255,60,40,0.5)'; for (var k = 4; k < 110; k += 5) g.fillRect(x2 + this.dirInv.x * k, y2 + this.dirInv.y * k, 1.5, 1.5); }
    if (this.alerta > 0) { g.fillStyle = C.amarelo; g.fillRect(x2 - 1, y2 - 20 - voa, 2, 4); g.fillRect(x2 - 1, y2 - 15 - voa, 2, 1); }
    if (this.st.atordoado > 0) { g.fillStyle = C.amarelo; for (var i = 0; i < 3; i++) { var a = this.t * 5 + i * 2.1; g.fillRect(Math.round(x2 + Math.cos(a) * 6), Math.round(y2 - 15 + Math.sin(a) * 2), 1, 1); } }
  };
  P.luz = function () { return this.d.alma ? { x: this.x, y: this.y - 10, r: 22, forca: 0.6, cor: '#9fd8ff' } : null; };

  // ---------------- onde aparecem (além dos que já estavam nos mapas) ----------------
  BSI.config.inimigosExtras = [
    { mapa: 'trilha', id: 'cascavel', x: 6, y: 14 }, { mapa: 'trilha', id: 'cascavel', x: 33, y: 20 },
    { mapa: 'trilha', id: 'cachorroBravo', x: 30, y: 26, n: 3 },
    { mapa: 'serra', id: 'capangaPeixeira', x: 22, y: 18 }, { mapa: 'serra', id: 'capangaEspingarda', x: 36, y: 20 },
    { mapa: 'serra', id: 'cascavel', x: 14, y: 30 }, { mapa: 'serra', id: 'abelhas', x: 30, y: 34 }, { mapa: 'serra', id: 'bodeEndiabrado', x: 44, y: 22 },
    { mapa: 'grota', id: 'almaMenor', x: 12, y: 13 }, { mapa: 'grota', id: 'almaMenor', x: 20, y: 7 },
    { mapa: 'caminho_tapera', id: 'capangaEscudo', x: 18, y: 14 }, { mapa: 'caminho_tapera', id: 'capangaEspingarda', x: 28, y: 18 },
    { mapa: 'caminho_tapera', id: 'cachorroBravo', x: 10, y: 8, n: 2 }, { mapa: 'caminho_tapera', id: 'abelhas', x: 36, y: 8 },
    { mapa: 'caminho_tapera', id: 'capangaPeixeira', x: 24, y: 24 }
  ];
  BSI.inimigosNovos = {
    popular: function (mundo) {
      BSI.config.inimigosExtras.forEach(function (e, i) {
        if (e.mapa !== mundo.mapa.id) return;
        for (var k = 0; k < (e.n || 1); k++) {
          var p = mundo.mapa.pontoLivre(e.x * T + 8 + k * 10, e.y * T + 10 + (k % 2) * 8, 4, 3);
          mundo.inimigos.push(new Inimigo(e.id, p.x, p.y));
        }
      });
    },
    NOVOS: NOVOS
  };
})();
