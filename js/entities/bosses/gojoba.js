/* =========================================================
   bosses/gojoba.js — BOSS DO ATO II: GOJOBA e a CAIXA DE SOM
   Gojoba é parente do João Carlos: bêbado, chato, abraça e não
   deixa ninguém ir embora. Não dá pra "vencer" o Gojoba na porrada:
   tem que DESLIGAR A CAIXA DE SOM (volume 3 → 0).
   - A caixa solta ondas de notas no ritmo da batida (bullet hell
     leve). Cada nota que acerta tira JUÍZO (não tira vida).
     Mesas e balcão seguram as ondas.
   - Abraço do Gojoba: prende o herói (e tira meio coração).
   Jeitos de baixar o volume:
     * HUGO corta os 3 cabos (Espaço com o Hugo, ou a habilidade perto)
     * MIGUEL invisível rouba o pen drive (1 vez)
     * DAVI "tira o excesso" do volume (1 vez)
     * DANIEL toca fogo na caixa: desliga tudo... com consequências
   JOÃO CARLOS (habilidade) distrai o Gojoba conversando — a não ser
   que tenha escolhido ficar do lado do primo.
   ========================================================= */
(function () {
  'use strict';
  var U = BSI.util, C = BSI.cor;

  var MUSICAS = ['"O Refrão de 7 Horas"', '"Forró de Plástico Vol. 9"', '"Arrocha da Buzina (Remix)"'];
  BSI.data.musicasGojoba = MUSICAS;

  // =========================================================
  //  A CAIXA DE SOM
  // =========================================================
  function Caixa(x, y) {
    BSI.Entidade.call(this, x, y, 10, 5);
    this.caixa = true;
    this.volume = 3; this.ativa = false; this.destruida = false;
    this.tBatida = 1; this.batida = 0; this.pulso = 0;
    this.penDrive = false; this.excesso = false;
  }
  Caixa.prototype = Object.create(BSI.Entidade.prototype);
  Caixa.prototype.musica = function () { return MUSICAS[Math.max(0, 3 - this.volume) % 3]; };
  Caixa.prototype.intervalo = function () { return [0, 1.25, 0.95, 0.72][this.volume]; };

  Caixa.prototype.reduzir = function (m, motivo) {
    if (!this.ativa || this.volume <= 0) return;
    this.volume--;
    BSI.audio.sfx('estalo'); m.camera.tremer(3);
    m.particulas.explosao(this.x, this.y - 12, 14, ['#ff60c0', '#60e0ff', C.branco], 50, 0.6);
    var txt = { cabo: 'Hugo cortou um cabo!', pendrive: 'Miguel roubou o pen drive!', excesso: 'Davi tirou o excesso de volume!', fogo: 'A CAIXA PEGOU FOGO!' }[motivo] || 'O volume baixou!';
    BSI.hud.aviso(txt + (this.volume > 0 ? ' Volume ' + this.volume + '/3' : ' A música parou!'), '#9fe0a0');
    if (this.volume <= 0) this.desligar(m);
  };
  Caixa.prototype.queimar = function (m) {
    if (!this.ativa) return;
    BSI.story.flag('queimou_caixa');
    this.destruida = true;
    m.fogo.acenderArea(this.x, this.y, 1, true);
    this.volume = 1; this.reduzir(m, 'fogo');
  };
  Caixa.prototype.desligar = function (m) {
    this.ativa = false;
    m.projeteis.forEach(function (p) { if (p.tipo === 'nota') p.morto = true; });
    BSI.story.medidor('juizo', 20, 'O silêncio voltou. Juízo +20');
    if (m.chefe && m.chefe.caixaDesligou) m.chefe.caixaDesligou(m);
  };

  Caixa.prototype.atualizar = function (dt, m) {
    this.t += dt;
    if (this.pulso > 0) this.pulso -= dt * 4;
    if (this.destruida && Math.random() < 0.2) m.particulas.fumaca(this.x, this.y - 14);
    if (!this.ativa || BSI.roteiro.emCena()) return;
    this.tBatida -= dt;
    if (this.tBatida > 0) return;
    this.tBatida = this.intervalo();
    this.batida++;
    this.pulso = 1;
    BSI.audio.sfx('batida');
    if (this.batida % 2 === 0) BSI.audio.sfx('buzina');
    // padrão: anel com buraco que gira; a cada 4 batidas, espiral
    var n = 10 + (3 - this.volume) * 0 + this.volume * 2, vel = 46 + this.volume * 6;
    var buraco = this.batida * 0.9, espiral = this.batida % 4 === 0;
    for (var i = 0; i < n; i++) {
      var a = i / n * Math.PI * 2 + (espiral ? this.batida * 0.3 : 0);
      var diff = Math.abs(((a - buraco) % (Math.PI * 2) + Math.PI * 3) % (Math.PI * 2) - Math.PI);
      if (!espiral && diff < 0.55) continue; // o buraco por onde dá pra passar
      m.projeteis.push(new BSI.Projetil({ x: this.x + Math.cos(a) * 12, y: this.y - 6 + Math.sin(a) * 8, vx: Math.cos(a) * vel, vy: Math.sin(a) * vel, vida: 4, dano: 0, time: 'inimigos', tipo: 'nota', dono: this, raio: 3 }));
    }
  };
  Caixa.prototype.desenhar = function (g, cx, cy) {
    var o = BSI.sprites.objeto('caixaSom');
    var esc = 1 + Math.max(0, this.pulso) * 0.08;
    var w = Math.round(o.w * esc), h = Math.round(o.h * esc);
    var x = Math.round(this.x - cx), y = Math.round(this.y - cy);
    g.fillStyle = 'rgba(20,10,20,0.4)'; g.fillRect(x - 12, y, 24, 3);
    g.globalAlpha = this.destruida ? 0.6 : 1;
    g.drawImage(o.c, x - Math.round(w / 2), y - h + 3, w, h);
    g.globalAlpha = 1;
    if (this.ativa && this.pulso > 0.5) { g.fillStyle = '#ff60c0'; g.fillRect(x - 16, y - 26, 2, 4); g.fillRect(x + 14, y - 24, 2, 4); }
  };
  Caixa.prototype.luz = function () {
    if (!this.ativa) return null;
    return { x: this.x, y: this.y - 10, r: 34 + this.pulso * 16, forca: 0.6, cor: this.batida % 2 ? '#ff60c0' : '#60e0ff' };
  };

  // =========================================================
  //  OS CABOS (o Hugo corta)
  // =========================================================
  function Cabo(x, y) {
    BSI.Entidade.call(this, x, y, 5, 3);
    this.cabo = true; this.cortado = false; this.dialogo = 'cabo_som';
  }
  Cabo.prototype = Object.create(BSI.Entidade.prototype);
  Cabo.prototype.atualizar = function (dt, m) {
    this.t += dt;
    if (!this.cortado && m.caixa && m.caixa.ativa && Math.random() < 0.05) m.particulas.add({ x: this.x + (Math.random() - 0.5) * 6, y: this.y - 4, vx: 0, vy: -10, vida: 0.3, cor: C.amarelo, tam: 1 });
  };
  Cabo.prototype.cortar = function (m) {
    if (this.cortado) return;
    this.cortado = true; this.dialogo = null;
    m.particulas.explosao(this.x, this.y - 4, 12, [C.amarelo, C.branco], 50, 0.4);
    if (m.caixa) m.caixa.reduzir(m, 'cabo');
  };
  Cabo.prototype.desenhar = function (g, cx, cy) {
    var o = BSI.sprites.objeto(this.cortado ? 'caboCortado' : 'cabo');
    g.drawImage(o.c, Math.round(this.x - cx - o.w / 2), Math.round(this.y - cy - o.h + 2), o.w, o.h);
  };
  Cabo.prototype.luz = function () { return this.cortado ? null : { x: this.x, y: this.y - 4, r: 12, forca: 0.5, cor: '#f0c75e' }; };

  // =========================================================
  //  O GOJOBA
  // =========================================================
  function Gojoba(x, y) {
    BSI.Entidade.call(this, x, y, 5, 3);
    this.chefe = true; this.humano = true; this.conversavel = true; this.semPips = true;
    this.d = { nome: 'Gojoba e a caixa de som', visao: 300 };
    this.time = 'inimigos';
    this.vidaFase = 3; this.vida = 3;
    this.ativo = false; this.estado = 'fora'; this.tEstado = 0;
    this.st = {}; this.face = { x: 0, y: -1 }; this.dir = 'up'; this.quadro = 0; this.passo = 0;
    this.cdAbraco = 2; this.abracado = null;
    this.spr = BSI.sprites.humano('npc:gojoba', BSI.data.falantes.gojoba.visual);
    this.tFala = 3;
    // voltando de um checkpoint no meio da luta: já começa ligado
    if (BSI.story.tem('gojoba_luta') && !BSI.story.tem('gojoba_vencido')) { this.ativo = true; this.estado = 'anda'; this.retomar = true; this.cdAbraco = 4; }
  }
  Gojoba.prototype = Object.create(BSI.Entidade.prototype);
  var G = Gojoba.prototype;
  G.livre = function () { return this.ativo && this.estado !== 'chora' && this.estado !== 'fora'; };
  G.atordoar = function (s) { if (this.livre()) this.st.atordoado = Math.min(2, s); };
  G.acalmar = function (s) { if (this.livre()) { this.st.acalmado = s; this.soltar(); } };
  G.virarBode = function (s) { if (this.livre()) this.st.bode = Math.min(3, s); };
  G.converter = function () { }; G.ouvir = function () { };
  G.forcarAlvo = function (h, s) { this.provocador = h; this.st.provocado = s; };
  G.fugir = function (s, de) { if (this.livre()) { this.st.medo = Math.min(2, s); this.medoDe = { x: de.x, y: de.y }; } };
  G.morrer = function (m) { if (m.caixa) { m.caixa.volume = 1; m.caixa.reduzir(m, 'debug'); } };
  G.pularFase = function (m) { if (m.caixa) m.caixa.reduzir(m, 'ritual'); };

  G.entrar = function () { this.estado = 'entrando'; this.tEstado = 0; };
  G.ativar = function (m) {
    this.ativo = true; this.estado = 'anda'; this.tEstado = 0;
    if (m.caixa) m.caixa.ativa = true;
    BSI.story.flag('gojoba_luta');
  };
  G.soltar = function () { if (this.abracado) { this.abracado.st.abracado = 0; this.abracado = null; } };
  G.caixaDesligou = function (m) {
    this.soltar();
    this.estado = 'chora'; this.tEstado = 0;
    BSI.story.flag('gojoba_vencido');
    BSI.roteiro.rodar([['espera', 1.2], ['fala', 'gojoba_fim'], ['faz', function () { BSI.data.eventos.gojoba_depois_luta(m); }]]);
  };

  G.levarDano = function (q, m, fonte, tipo) {
    if (!this.livre()) return;
    this.flash = 0.2;
    if (fonte && fonte.time === 'herois') m.encherPoder(q * 1.5);
    this.st.atordoado = 0.5;
    this.soltar();
    if (this.tFala <= 0) { this.tFala = 2; m.falar(this, tipo === 'fogo' ? 'Ai, primo, tá quente!' : BSI.rng.pick(['Ai! Isso é jeito de tratar parente?', 'Tá doido, é? Bora dançar!', 'Mais uma música e eu vou embora! Mentira!']), 1.6); }
  };

  G.atualizar = function (dt, m) {
    this.t += dt; this.tEstado += dt; this.tFala -= dt;
    if (this.flash > 0) this.flash -= dt;
    for (var k in this.st) if (this.st[k] > 0) this.st[k] -= dt;
    if (this.retomar && m.caixa) { this.retomar = false; if (m.caixa.volume > 0) { m.caixa.ativa = true; m.caixa.tBatida = 2; } }
    this.vida = m.caixa ? m.caixa.volume : 0;
    this.empurrao(dt, m.mapa);
    if (this.estado === 'fora') return;
    if (this.estado === 'entrando') { this.quadro = [1, 0, 2, 0][Math.floor(this.t * 6) % 4]; return; }
    if (this.estado === 'chora') { this.quadro = 0; this.dir = 'down'; if (Math.random() < 0.05) m.particulas.add({ x: this.x + (Math.random() < 0.5 ? -3 : 3), y: this.y - 14, vx: 0, vy: 20, vida: 0.4, cor: '#9fd8ff', tam: 1 }); return; }
    if (!this.ativo || BSI.roteiro.emCena()) return;
    this.cdAbraco -= dt;

    // abraçando alguém: vai junto e não solta
    if (this.abracado) {
      var h = this.abracado;
      if (h.caido || !(h.st.abracado > 0)) { if (!h.caido) h.levarDano(1, m, this, 'corpo'); this.soltar(); this.cdAbraco = 4; return; }
      this.x = h.x + 6; this.y = h.y; this.quadro = 0;
      return;
    }
    if (this.st.atordoado > 0 || this.st.acalmado > 0) {
      this.quadro = 0;
      if (this.st.acalmado > 0 && this.tFala <= 0) { this.tFala = 2.5; m.falar(this, BSI.rng.pick(['...e aí a tia Lourdes casou de novo...', 'Primo, tu lembra do aniversário do vô?', '...o Zé da prima é sobrinho do...']), 2.2); }
      return;
    }
    var alvo = null, md = 1e12, self = this;
    if (this.st.provocado > 0 && this.provocador && !this.provocador.caido) alvo = this.provocador;
    else m.herois.forEach(function (o) { if (o.caido || o.st.invisivel > 0) return; var d = U.dist2(o.x, o.y, self.x, self.y); if (d < md) { md = d; alvo = o; } });
    if (!alvo) return;
    var dx = alvo.x - this.x, dy = alvo.y - this.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
    var w = U.girar(dx / d, dy / d, Math.sin(this.t * 2.7) * 0.8); // cambaleando
    if (this.st.medo > 0) w = U.norm(this.x - this.medoDe.x, this.y - this.medoDe.y);
    var ax = this.x;
    BSI.colisao.mover(this, m.mapa, w.x * 34 * dt, w.y * 34 * dt);
    this.face = { x: dx / d, y: dy / d }; this.dir = U.dirDe(dx, dy);
    this.passo += Math.abs(this.x - ax) + 0.3; this.quadro = [1, 0, 2, 0][Math.floor(this.passo / 5) % 4];
    if (d < 13 && this.cdAbraco <= 0) {
      this.abracado = alvo; alvo.st.abracado = 2.2;
      m.falar(this, BSI.rng.pick(['Fica mais um pouquinho, primo!', 'Só mais uma música! Só mais uma!', 'Eu amo vocês! Ninguém vai embora!']), 2);
      BSI.audio.sfx('dano');
    }
    if (this.tFala <= 0) { this.tFala = 5; m.falar(this, BSI.rng.pick(['Aumenta o som, Stelo!', 'ESSA É A MINHA MÚSICA!', 'Dança, primo, dança!']), 1.8); }
  };

  G.desenhar = function (g, cx, cy) {
    if (this.estado === 'fora') return;
    this.sombra(g, cx, cy, 10);
    var spr = this.spr, dir = this.dir, img = this.flash > 0 ? spr.branco[dir][this.quadro] : spr.dirs[dir][this.quadro];
    var inc = this.estado === 'chora' ? 0 : Math.sin(this.t * 2.7) * 0.1;
    g.save(); g.translate(Math.round(this.x - cx), Math.round(this.y - cy)); g.rotate(inc);
    BSI.sprites.pintar(g, spr, img, 0, 0); g.restore();
    if (this.abracado) { g.fillStyle = '#ff9a9a'; var x = Math.round(this.x - cx), y = Math.round(this.y - cy); g.fillRect(x - 6, y - 26, 2, 2); g.fillRect(x - 3, y - 26, 2, 2); g.fillRect(x - 6, y - 25, 5, 2); g.fillRect(x - 5, y - 23, 3, 1); }
    if (this.st.acalmado > 0) { g.fillStyle = C.creme; var xx = Math.round(this.x - cx), yy = Math.round(this.y - cy); g.fillRect(xx + 5, yy - 24, 8, 5); g.fillStyle = C.contorno; g.fillRect(xx + 6, yy - 22, 1, 1); g.fillRect(xx + 8, yy - 22, 1, 1); g.fillRect(xx + 10, yy - 22, 1, 1); }
  };

  // depois da luta ele vira NPC no bar
  Gojoba.depois = function () { return BSI.story.tem('gojoba_vencido') ? 'npc' : null; };

  BSI.chefes = BSI.chefes || {};
  BSI.chefes.gojoba = Gojoba;
  BSI.CaixaSom = Caixa;
  BSI.Cabo = Cabo;
})();
