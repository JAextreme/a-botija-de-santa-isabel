/* =========================================================
   bosses/cds.js — BOSS FINAL: RAFAEL CDs (personagem fictício)
   Neto do coronel Firmino CDs. Promessas impossíveis, capangas,
   e a escritura da botija pra dizer que a terra é dele.
   FASE 1 — PALANQUE: dispara PROMESSAS (balões que viram projéteis)
     em padrões cada vez mais densos. Bala e peixeira quase não pegam
     (ele se esconde atrás do púlpito). Pra machucar:
       * bater numa promessa (ataque corpo a corpo) REBATE ela nele
       * JOÃO VITOR (lábia): rebate todas as promessas por perto
       * HELANO (Tiro do Profeta): uma frase de profeta que deixa ele mudo
       * JOÃO PEDRO (escapamento): "Lula E Bolsonaro" — ele trava sem
         saber pra que lado falar (dano dobrado)
     Ajudas do plano: gerador sabotado (o microfone falha), caixa do
     Gojoba (promessas mais lentas), fake news do Stelo, Tia Zane no
     palanque.
   FASE 2 — QUERMESSE: três ondas de capangas entre as barracas; os
     aliados conquistados entram na briga (time do Roma, Tia Zane, a
     caixa do Gojoba, o ritual da Tribo dos Amadeus).
   FASE 3 — A ALMA DO CORONEL aparece pra proteger o neto (ver alma.js).
   ========================================================= */
(function () {
  'use strict';
  var U = BSI.util, C = BSI.cor, T = BSI.cfg.TILE;

  var VISUAL = { pele: '#e0b08a', cabelo: '#1a1410', camisa: '#2a3a6a', camisa2: '#f2e6c9', padrao: 'jaleco', calca: '#1e2440', cabeca: 'liso', extras: ['oculosEscuros'], acessorio: 'celular' };
  BSI.data.falantes.cds = { nome: 'Rafael CDs', visual: VISUAL };
  BSI.data.falantes.capanga = { nome: 'Capanga do CDs', visual: { pele: '#a87048', cabelo: '#1a120c', camisa: '#1e1e24', calca: '#2a2a33', chapeu: '#1a1a20', cabeca: 'chapeuPreto', extras: ['oculosEscuros'] } };

  // promessas impossíveis (inventadas, de político fictício)
  var PROMESSAS = [
    'AÇUDE DE ÁGUA MINERAL!', 'METRÔ ATÉ QUIXERAMOBIM!', 'PRAIA EM SANTA ISABEL!', 'CHUVA TODO SÁBADO!',
    'WI-FI NO CURRAL!', 'RAPADURA GRÁTIS!', 'AEROPORTO NO AÇUDINHO!', 'NEVE NO SÃO JOÃO!',
    'UM BODE POR FAMÍLIA!', 'ESCADA ROLANTE NA SERRA!', 'SHOPPING NA TAPERA!', 'ESTÁDIO PRO ROMA!'
  ];
  BSI.data.promessas = PROMESSAS;
  var VIDA1 = 70;
  var ONDAS = [5, 6, 7];

  function CDs(x, y) {
    BSI.Entidade.call(this, x, y, 6, 3);
    this.chefe = true; this.humano = true; this.cds = true; this.semPips = false;
    this.d = { nome: 'Rafael CDs', visao: 400 };
    this.time = 'inimigos';
    this.palanque = { x: x, y: y };
    this.fase = 0; this.vidaFase = VIDA1; this.vida = VIDA1;
    this.ativo = false; this.estado = 'esperando'; this.tEstado = 0;
    this.st = {}; this.dir = 'down'; this.face = { x: 0, y: 1 }; this.quadro = 0;
    this.cdPromessa = 2; this.padrao = 0; this.tMic = 9; this.semMic = 0;
    this.onda = 0; this.capangas = []; this.tOnda = 0; this.tGojoba = 6;
    this.spr = BSI.sprites.humano('npc:cds', VISUAL);
    this.tFala = 2;
    // voltando de checkpoint no meio da luta
    var S = BSI.story;
    if (S.tem('cds_fase3')) { this.ativo = true; this.fase = 2; this.estado = 'acuado'; this.time = 'protegido'; this.retomar3 = true; }
    else if (S.tem('cds_fase2')) { this.ativo = true; this.fase = 1; this.estado = 'quermesse'; this.time = 'protegido'; this.retomar2 = true; }
    else if (S.tem('cds_luta')) { this.ativo = true; this.estado = 'discurso'; if (S.tem('stelo_ajudou')) this.vida = VIDA1 * 0.75; }
  }
  CDs.prototype = Object.create(BSI.Entidade.prototype);
  var P = CDs.prototype;

  P.livre = function () { return this.ativo && this.estado === 'discurso'; };
  P.atordoar = function (s) { if (this.livre()) this.st.travado = Math.max(this.st.travado || 0, Math.min(2, s)); };
  P.acalmar = function () { }; P.converter = function () { }; P.ouvir = function () { };
  P.virarBode = function (s) { if (this.livre()) { this.st.bode = Math.min(3, s); } };
  P.forcarAlvo = function () { }; P.fugir = function () { };
  P.morrer = function (m) { if (this.estado === 'discurso') { this.vida = 0; this.fimFase1(m); } else if (this.estado === 'quermesse') { this.capangas.forEach(function (e) { if (!e.morto) e.morrer(m); }); this.onda = 3; } };
  P.pularFase = function (m) { this.morrer(m); };

  P.ativar = function () {
    this.ativo = true; this.estado = 'discurso'; this.tEstado = 0;
    BSI.story.flag('cds_luta');
    if (BSI.story.tem('stelo_ajudou')) this.vida = VIDA1 * 0.75;
  };

  // ---------- truques do grupo (chamados pelas habilidades) ----------
  P.travar = function (m, s, txt) { // João Pedro: Lula E Bolsonaro
    if (!this.livre()) return;
    this.st.travado = s;
    m.falar(this, txt || 'É... eu... sou a favor dos dois... de nenhum... ALÔ?', 2.2);
  };
  P.frase = function (m, h) { // Helano: frase de profeta
    if (!this.livre()) return;
    this.st.travado = 3;
    this.levarDano(BSI.story.tem('helano_desmascarou') ? 14 : 10, m, h, 'profeta');
    m.falar(this, '...', 2);
  };
  P.refletirPerto = function (m, h, raio) { // João Vitor: lábia
    var n = 0, self = this;
    m.projeteis.forEach(function (p) { if (p.tipo === 'promessa' && p.time !== 'herois' && U.dist2(p.x, p.y, h.x, h.y - 6) < raio * raio) { self.refletir(p, h); n++; } });
    return n;
  };
  P.refletir = function (p, h) {
    var n = U.norm(this.x - p.x, this.y - 18 - p.y);
    p.time = 'herois'; p.vx = n.x * 170; p.vy = n.y * 170; p.vida = 2.5; p.dano = 5; p.dono = h; p.atingidos = [];
    p.texto = BSI.rng.pick(['E A ÁGUA?', 'CADÊ O METRÔ?', 'MENTIRA!', 'PROMETEU ANO PASSADO!', 'E A ESCRITURA?']);
    BSI.audio.sfx('acerto');
  };

  P.levarDano = function (q, m, fonte, tipo) {
    if (!this.livre()) return;
    var mult = { promessa: 1, profeta: 1, poder: 1, excesso: 1, aboio: 1, gambiarra: 1, debug: 1, teste: 1, ritual: 1 }[tipo] || 0.25;
    if (this.st.travado > 0) mult *= 2;
    if (m.conselho > 0) mult *= 1.5;
    this.vida -= q * mult;
    this.flash = 0.2;
    if (fonte && fonte.time === 'herois') m.encherPoder(q * mult * 1.5);
    BSI.audio.sfx('acerto');
    if (mult < 0.5 && this.tFala <= 0) { this.tFala = 2; m.falar(this, BSI.rng.pick(['Bala em político não pega! Tenho imunidade!', 'Seguranças!', 'Isso é perseguição!']), 1.6); }
    // Tia Zane sobe no palanque e conta a história do Tio Ota
    if (BSI.story.tem('zane_no_palanque') && !this.zaneFalou && this.vida <= this.vidaFase * 0.35) {
      this.zaneFalou = true;
      var self = this;
      BSI.roteiro.rodar([['fala', 'zane_palanque'], ['faz', function (mm) { self.vida = 0; self.fimFase1(mm); }]]);
      return;
    }
    if (this.vida <= 0) { this.vida = 0; this.fimFase1(m); }
  };

  P.fimFase1 = function (m) {
    if (this.estado !== 'discurso') return;
    this.estado = 'transicao';
    m.projeteis.forEach(function (p) { if (p.tipo === 'promessa') p.morto = true; });
    var self = this;
    BSI.roteiro.rodar([
      ['fala', 'cds_fase1_fim'],
      ['faz', function (mm) { self.comecarFase2(mm); BSI.jogo.salvar(); }],
      ['objetivo', 'Derrotem as ondas de capangas na quermesse!']
    ]);
  };

  P.comecarFase2 = function (m) {
    this.fase = 1; this.estado = 'quermesse'; this.onda = 0; this.tOnda = 1.5;
    this.time = 'protegido'; // escondido atrás dos capangas: ninguém mira nele
    BSI.story.flag('cds_fase2');
    this.x = this.palanque.x; this.y = this.palanque.y;
    var S = BSI.story, L = m.lider();
    // aliados conquistados ao longo do jogo
    if (S.tem('paulo_aliado') || S.tem('roma_na_festa')) {
      BSI.hud.faixa('O ROMA ENTROU EM CAMPO!', 'Paulo do Zé Baixinho e o time inteiro', 'Os torcedores brigam do lado de vocês.');
      for (var i = 0; i < 3; i++) { var t = new BSI.Inimigo('bebado', L.x - 40 + i * 20, L.y + 20); t.converter(9999); m.inimigos.push(t); }
    }
    if (S.tem('tia_zane_respeitada')) { var z = new BSI.TiaZane(L.x + 30, L.y + 10); z.aliada = true; m.props.push(z); m.falar(z, 'Quem mexer com meus netos leva chinelada!', 2.2); }
  };

  P.novaOnda = function (m) {
    var n = ONDAS[this.onda], self = this;
    var pontos = [[2, 17], [2, 18], [46, 12], [46, 20], [14, 34], [40, 33], [44, 6], [6, 30]];
    this.capangas = [];
    for (var i = 0; i < n; i++) {
      var p = pontos[(i + this.onda * 3) % pontos.length];
      var e = new BSI.Inimigo(i % 3 === 2 ? 'atirador' : 'jagunco', p[0] * T + 8, p[1] * T + 10);
      e.alvo = m.lider(); e.estado = 'persegue'; e.vida += this.onda;
      m.inimigos.push(e); self.capangas.push(e);
    }
    BSI.hud.faixa('ONDA ' + (this.onda + 1) + ' DE 3', 'Os capangas do CDs invadem a quermesse!', '');
    // ritual secreto da Tribo dos Amadeus na segunda onda
    if (this.onda === 1 && BSI.story.tem('ritual_tribo')) {
      m.agendar(1.5, function () {
        self.capangas.forEach(function (e) { if (!e.morto) e.atordoar(5); });
        BSI.hud.faixa('O RITUAL SECRETO DA TRIBO!', 'Duas palmas, um estalo e um aceno de sobrancelha', 'Os capangas ficaram sem entender nada por 5 s.');
        BSI.audio.sfx('excesso');
      });
    }
    this.onda++;
  };

  P.atualizar = function (dt, m) {
    this.t += dt; this.tEstado += dt; this.tFala -= dt;
    if (this.flash > 0) this.flash -= dt;
    for (var k in this.st) if (this.st[k] > 0) this.st[k] -= dt;
    if (this.retomar2) { this.retomar2 = false; this.comecarFase2(m); }
    if (this.retomar3) { this.retomar3 = false; BSI.data.eventos.fase_alma_retomar(m); }
    if (!this.ativo || BSI.roteiro.emCena()) { this.quadro = 0; return; }

    if (this.estado === 'discurso') {
      var fr = Math.max(0, this.vida / this.vidaFase);
      // microfone falhando (gerador sabotado pelo Hugo)
      if (BSI.story.tem('gerador_sabotado')) {
        this.tMic -= dt;
        if (this.tMic <= 0) { this.tMic = 9; this.semMic = 2.5; m.falar(this, 'Alô? ALÔ? O microfone!', 2); BSI.audio.sfx('estalo'); }
      }
      if (this.semMic > 0) { this.semMic -= dt; return; }
      if (this.st.travado > 0) return;
      this.cdPromessa -= dt;
      if (this.cdPromessa <= 0) {
        var gojoba = BSI.story.tem('gojoba_aliado_festa');
        this.cdPromessa = (1.0 + fr * 0.9) * (gojoba ? 1.3 : 1);
        this.lancar(m, gojoba ? 0.7 : 1, fr);
      }
      if (this.tFala <= 0) { this.tFala = 4; m.falar(this, BSI.rng.pick(PROMESSAS), 2); }
      return;
    }
    if (this.estado === 'quermesse') {
      // a caixa reserva do Gojoba ensurdece os capangas de vez em quando
      if (BSI.story.tem('gojoba_aliado_festa')) {
        this.tGojoba -= dt;
        if (this.tGojoba <= 0) {
          this.tGojoba = 7;
          this.capangas.forEach(function (e) { if (!e.morto) e.atordoar(1.6); });
          BSI.hud.aviso('A caixa reserva do Gojoba ensurdeceu os capangas!', '#ff9ad8');
          BSI.audio.sfx('buzina');
        }
      }
      var vivos = this.capangas.filter(function (e) { return !e.morto; }).length;
      // a barra mostra quanto falta das 3 ondas
      var restoOnda = this.onda > 0 ? vivos / ONDAS[this.onda - 1] : 1;
      this.vida = this.vidaFase * Math.max(0, (ONDAS.length - this.onda + restoOnda) / ONDAS.length);
      if (vivos === 0) {
        this.tOnda -= dt;
        if (this.tOnda <= 0) {
          if (this.onda >= ONDAS.length) { this.fimFase2(m); return; }
          this.tOnda = 2; this.novaOnda(m);
        }
      }
      if (this.tFala <= 0) { this.tFala = 5; m.falar(this, BSI.rng.pick(['Peguem eles!', 'A escritura é MINHA!', 'Quem trouxer a botija ganha cargo!', 'Vote CDs!']), 1.8); }
    }
  };

  P.fimFase2 = function (m) {
    this.estado = 'acuado'; this.fase = 2; this.time = 'protegido';
    BSI.story.flag('cds_fase3');
    BSI.roteiro.rodar([['fala', 'cds_alma_surge'], ['faz', function (mm) { BSI.fases.dispararEvento('fase_alma', mm); }]]);
  };

  // lança promessas em padrões (leque, chuva, espiral, anel)
  P.lancar = function (m, velMult, fr) {
    var L = m.lider(), self = this;
    if (!L) return;
    var ox = this.x, oy = this.y - 22;
    var tipo = this.padrao++ % (fr < 0.5 ? 4 : 3);
    function bola(vx, vy) {
      var p = new BSI.Projetil({ x: ox, y: oy, vx: vx * velMult, vy: vy * velMult, vida: 6, dano: 1, time: 'inimigos', tipo: 'promessa', dono: self, raio: 6 });
      p.texto = BSI.rng.pick(PROMESSAS);
      m.projeteis.push(p);
    }
    var base = U.norm(L.x - ox, L.y - 6 - oy), i, n;
    if (tipo === 0) { n = fr < 0.5 ? 7 : 5; for (i = 0; i < n; i++) { var v = U.girar(base.x, base.y, (i / (n - 1) - 0.5) * 1.1); bola(v.x * 62, v.y * 62); } }
    else if (tipo === 1) { n = 8; for (i = 0; i < n; i++) { var a = i / n * Math.PI * 2 + this.t; bola(Math.cos(a) * 50, Math.sin(a) * 50); } }
    else if (tipo === 2) { n = 6; for (i = 0; i < n; i++) { var w = U.girar(base.x, base.y, (Math.random() - 0.5) * 0.5); bola(w.x * (55 + i * 8), w.y * (55 + i * 8)); } }
    else { n = 12; for (i = 0; i < n; i++) { var b = i / n * Math.PI * 2; bola(Math.cos(b) * 70, Math.sin(b) * 70); } }
    BSI.audio.sfx('alerta');
  };

  P.desenhar = function (g, cx, cy) {
    var x = Math.round(this.x - cx), y = Math.round(this.y - cy);
    var spr = this.spr, q = this.estado === 'discurso' ? (Math.floor(this.t * 3) % 2 ? 1 : 0) : 0;
    var img = this.flash > 0 ? spr.branco.down[q] : spr.dirs.down[q];
    var esc = 1.3 / (spr.esc || 1);
    g.drawImage(img, x - Math.round(spr.ox * esc), y - Math.round(spr.oy * esc) - (this.estado === 'discurso' || this.estado === 'transicao' ? 6 : 0), Math.round(spr.w * esc), Math.round(spr.h * esc));
    if (this.estado === 'discurso' || this.estado === 'transicao') {
      // púlpito com microfone
      g.fillStyle = C.contorno; g.fillRect(x - 9, y - 9, 18, 11); g.fillStyle = '#2a3a6a'; g.fillRect(x - 8, y - 8, 16, 9);
      g.fillStyle = C.amarelo; g.fillRect(x - 4, y - 6, 8, 2);
      g.fillStyle = '#9aa3ab'; g.fillRect(x + 2, y - 16, 1, 7); g.fillStyle = '#1e1e24'; g.fillRect(x + 1, y - 18, 3, 3);
      if (this.semMic > 0) { g.fillStyle = '#ff4040'; g.fillRect(x + 5, y - 20, 1, 3); g.fillRect(x + 7, y - 21, 1, 3); }
    }
    if (this.st.travado > 0) { g.fillStyle = C.amarelo; for (var i = 0; i < 3; i++) { var a = this.t * 5 + i * 2.1; g.fillRect(Math.round(x + Math.cos(a) * 7), Math.round(y - 30 + Math.sin(a) * 2), 1, 1); } }
    if (this.estado === 'acuado') { g.fillStyle = '#9fd8ff'; g.fillRect(x - 6, y - 26, 2, 2); g.fillRect(x + 5, y - 25, 2, 2); }
  };
  P.luz = function () { return { x: this.x, y: this.y - 20, r: 48, forca: 0.8, cor: '#fff1a8' }; };

  CDs.depois = function () { return BSI.story.tem('cds_derrotado') ? 'npc' : null; };

  BSI.chefes = BSI.chefes || {};
  BSI.chefes.cds = CDs;
})();
