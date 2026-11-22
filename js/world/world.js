/* =========================================================
   world.js — o MUNDO de um mapa: junta grupo, cachorros, inimigos,
   chefe, bichos, objetos, zonas de evento, projéteis, fogo, luz e
   efeitos; roda tudo a cada passo e desenha na ordem certa.
   ========================================================= */
(function () {
  'use strict';
  var U = BSI.util, T = BSI.cfg.TILE, C = BSI.cor;

  // tile → pixel (pés no centro do tile)
  function px(tx) { return tx * T + T / 2; }
  function py(ty) { return ty * T + T / 2 + 2; }

  // a entidade do mapa existe nesta partida/fase?
  function existe(e) {
    var S = BSI.state;
    if (e.fases && e.fases.indexOf(S.fase) < 0) return false;
    if (e.segredo && e.segredo !== S.segredo) return false;
    if (e.comFlag && !S.flags[e.comFlag]) return false;
    if (e.semFlag && S.flags[e.semFlag]) return false;
    return true;
  }

  function Mundo(mapaId, chegada, heroisExistentes) {
    this.mapa = new BSI.Mapa(mapaId);
    this.dados = this.mapa.dados;
    // tiles que mudam conforme a história (ex.: a cerca do atalho do Felipe)
    var mapaRef = this.mapa;
    (this.dados.trocasSe || []).forEach(function (tr) { if (BSI.state.flags[tr.flag]) tr.tiles.forEach(function (p) { mapaRef.trocar(p[0], p[1], tr.ch); }); });
    this.giro = 0; this.inverterForcado = false; this.luzesCeu = 0; this.defesa = null; this.caixa = null;
    this.fogo = new BSI.Fogo(this.mapa);
    this.particulas = new BSI.Particulas();
    this.camera = new BSI.Camera();
    this.inimigos = []; this.bichos = []; this.props = []; this.projeteis = []; this.cachorros = []; this.zonas = [];
    this.efeitos = []; this.baloes = []; this.agenda = []; this.claroes = []; this.vagalumes = [];
    this.chefe = null;
    this.lento = { t: 0, escala: 1 };
    this.luzTotal = 0; this.revelar = 0; this.conselho = 0; this.apagao = 0; this.caosCalma = 0;
    this.multVel = 1; this.multDano = 1; this.multVelInimigo = 1;
    this.desobediencia = 0;
    this.ordem = 'seguir'; this.pontoOrdem = null; // ordens pro grupo (tecla T)
    this.saindo = false;
    this.conversando = null;
    this.interagivel = null;
    this.tempo = 0;
    this.cdDanielSorri = 6;

    var c = chegada || this.dados.inicio;
    var cx = px(c.x), cy = py(c.y);
    var S = BSI.state, self = this;

    // ---- grupo ----
    if (heroisExistentes && heroisExistentes.length) {
      this.herois = heroisExistentes;
      this.herois.forEach(function (h) { h.st = {}; h.kbx = h.kby = 0; h.ia.parado = 0; h.ia.tarefa = null; });
    } else this.herois = this.criarHerois(S.grupo, cx, cy);
    this.liderIdx = U.clamp(S.lider || 0, 0, this.herois.length - 1);
    if (this.herois[this.liderIdx].caido) {
      var vivo = this.proximoVivo(this.liderIdx, 1);
      if (vivo < 0) { this.herois.forEach(function (h) { h.reviver(2); }); vivo = 0; }
      this.liderIdx = vivo;
    }
    this.posicionarGrupo(cx, cy);

    // ---- cachorros (depois que foram chamados no prólogo) ----
    var fase = BSI.fases.atual();
    if (S.flags.chamou_cachorros && !(fase && fase.cachorros === false)) {
      this.cachorros.push(new BSI.Cachorro('trovao', cx - 10, cy + 6, -1));
      this.cachorros.push(new BSI.Cachorro('piaba', cx + 10, cy + 6, 1));
    }

    // ---- entidades do mapa ----
    this.dados.entidades.forEach(function (e, i) {
      if (!existe(e)) return;
      var x = px(e.x), y = py(e.y), chave = mapaId + ':' + i;
      switch (e.tipo) {
        case 'inimigo': self.inimigos.push(new BSI.Inimigo(e.id, x, y)); break;
        case 'animal': self.bichos.push(new BSI.Bicho(e.id, x, y)); break;
        case 'item': if (!S.coletados[chave]) self.props.push(new BSI.Item(e.item, x, y, e.qtd, chave)); break;
        case 'checkpoint': self.props.push(new BSI.Fogueira(x, y, chave)); break;
        case 'fogueira': self.props.push(new BSI.Fogueira(x, y, chave, true)); break;
        case 'sinal': self.props.push(new BSI.Sinal(x, y - 2, chave)); break;
        case 'caixa':
          self.caixa = new BSI.CaixaSom(x, y);
          if (S.flags.gojoba_vencido) { self.caixa.volume = 0; self.caixa.destruida = !!S.flags.queimou_caixa; }
          self.props.push(self.caixa); break;
        case 'cabo': var cb = new BSI.Cabo(x, y); if (S.flags.gojoba_vencido) { cb.cortado = true; cb.dialogo = null; } self.props.push(cb); break;
        case 'diazepan': self.props.push(new BSI.Diazepan(x, y)); break;
        case 'npc': self.props.push(new BSI.Npc(e.id, x, y, e.dialogo, e.parado)); break;
        case 'decor': self.props.push(new BSI.Decor(e.sprite, x, y, e.dialogo, e)); break;
        case 'placa': self.props.push(new BSI.Placa(x, y, e.dialogo)); break;
        case 'gatilho': self.props.push(new BSI.Gatilho(x, y - 2, e.dialogo)); break;
        case 'zona': self.zonas.push({ evento: e.evento, x: e.x * T, y: e.y * T, w: e.w * T, h: e.h * T, dentro: false }); break;
        case 'chefe':
          var Ch = BSI.chefes[e.id];
          var depois = Ch.depois ? Ch.depois() : null;
          if (depois === 'npc') { self.props.push(new BSI.Npc(e.id, x, y, e.id + '_depois')); break; }
          if (depois === 'nada') break;
          self.chefe = new Ch(x, y);
          self.inimigos.push(self.chefe);
          break;
      }
    });
    if (BSI.impacto) BSI.impacto.ligarTodos();
    if (BSI.inimigosNovos) BSI.inimigosNovos.popular(this); // os 8 inimigos novos
    BSI.decoracao.popular(this); // placas engraçadas e objetos espalhados
    // armas soltas pelo mapa (config/weapons.js → armasNoMapa)
    (BSI.config.armasNoMapa || []).forEach(function (a, i) {
      if (a.mapa !== mapaId) return;
      var ch = 'arma:' + mapaId + ':' + i; if (S.coletados[ch]) return;
      var pa = self.mapa.pontoLivre(px(a.x), py(a.y), 4, 4);
      var it = new BSI.Item('arma', pa.x, pa.y, 1, ch); it.arma = a.arma; it.mun = a.mun; self.props.push(it);
    });
    BSI.vida.popular(this);      // galinha, calango, urubu... e eventos à toa
    if (BSI.armas) { BSI.armas.garantir(); this.agendar(1.2, function () { if (!BSI.roteiro.emCena()) BSI.armas.verificarLendarias(self); }); }
    var fa = BSI.fases.atual();
    this.faseAqui = fa && fa.mapa === mapaId ? fa : null; // a fase pode mudar o clima do mapa (amanhecer)
    var nVag = (this.faseAqui && this.faseAqui.semVagalumes) ? 0 : (this.dados.vagalumes || 0);
    for (var v = 0; v < nVag; v++) this.vagalumes.push(new BSI.Vagalume(this.mapa));
    this.ambienteAtual = this.ambienteBase();

    // web namorada do Helano: uma vez por mapa, em algum momento
    this.webTimer = 25 + Math.random() * 40;
    this.webFeito = !!this.dados.semWeb;
  }

  var M = Mundo.prototype;

  // quanto de luz o mapa tem agora (fase, flags e transições)
  // HORÁRIO: vem da fase (config/visual.js → horarioDaFase); o mapa pode
  // forçar 'interior' ou 'terror' (horario) e ajustar um pouco (ajusteLuz).
  M.horario = function () {
    var V = BSI.config.visual, d = this.dados, S = BSI.state;
    var e = d.escuroSe;
    if (e && S.flags[e.flag] && !(e.semFlag && S.flags[e.semFlag])) return e.horario || 'terror';
    var id = d.horario || V.horarioDaFase[S.fase] || 'noite';
    return V.horarios[id] ? id : 'noite';
  };
  M.terror = function () { return this.horario() === 'terror'; };
  // a luz mínima (luar) que sempre existe: nunca fica breu a ponto de não ver
  M.pisoLuz = function () {
    var L = BSI.config.visual.luz, red = BSI.save.cfg().escuridao === 'reduzida';
    if (this.terror()) return red ? L.minimoTerrorReduzida : L.minimoTerror;
    return red ? L.minimoReduzida : L.minimoNormal;
  };
  M.tintaAtual = function () {
    if (this.faseAqui && this.faseAqui.tinta && !this.terror()) return this.faseAqui.tinta;
    return BSI.config.visual.horarios[this.horario()].tinta;
  };
  M.ambienteBase = function () {
    var V = BSI.config.visual, d = this.dados;
    var h = V.horarios[this.horario()];
    var amb = (this.faseAqui && this.faseAqui.ambiente !== undefined && !this.terror()) ? this.faseAqui.ambiente : h.ambiente;
    if (amb < 0.99) amb += d.ajusteLuz || 0;
    return Math.max(this.pisoLuz(), Math.min(1, amb));
  };

  M.criarHerois = function (ids, cx, cy) {
    var S = BSI.state;
    return ids.map(function (id) {
      var h = new BSI.Heroi(id, cx, cy);
      if (S.vidas && S.vidas[id] !== undefined) h.vida = Math.max(1, S.vidas[id]);
      return h;
    });
  };
  M.posicionarGrupo = function (cx, cy) {
    var self = this;
    this.herois.forEach(function (h, i) {
      var p = self.mapa.pontoLivre(cx + (i === self.liderIdx ? 0 : ((i % 3) - 1) * 10), cy + (i === self.liderIdx ? 0 : 8 + Math.floor(i / 3) * 6), h.hw, h.hh);
      h.x = p.x; h.y = p.y; h.ia.ultX = h.x; h.ia.ultY = h.y;
    });
    this.reiniciarTrilha();
    this.camera.pular(this.lider(), this.mapa);
  };
  // troca o grupo ativo no meio do mapa (história)
  M.trocarGrupo = function (ids) {
    var L = this.lider();
    var x = L.x, y = L.y;
    BSI.state.grupo = ids.slice(); BSI.state.lider = 0; BSI.state.vidas = {};
    this.herois = this.criarHerois(ids, x, y);
    this.liderIdx = 0;
    this.posicionarGrupo(x, y);
    this.webFeito = true;
  };

  // ---------------- grupo ----------------
  M.lider = function () { return this.herois[this.liderIdx]; };
  M.proximoVivo = function (de, passo) {
    var n = this.herois.length;
    for (var i = 1; i <= n; i++) {
      var k = ((de + passo * i) % n + n) % n;
      if (!this.herois[k].caido) return k;
    }
    return -1;
  };
  M.trocar = function (passo) {
    var k = this.proximoVivo(this.liderIdx, passo);
    if (k < 0 || k === this.liderIdx) return;
    this.liderIdx = k;
    BSI.state.lider = k;
    this.reiniciarTrilha();
    var h = this.lider();
    BSI.audio.sfx('troca');
    this.falar(h, BSI.falas.sorteia('troca_' + h.id), 1.2);
    this.particulas.explosao(h.x, h.y - 18, 6, [C.amarelo, C.branco], 20, 0.35);
  };
  M.ordemSeguidor = function (h) {
    var n = 0;
    for (var i = 0; i < this.herois.length; i++) {
      var k = (this.liderIdx + i) % this.herois.length;
      var o = this.herois[k];
      if (o.caido) continue;
      if (o === h) return n;
      n++;
    }
    return 1;
  };
  M.reiniciarTrilha = function () {
    var L = this.lider();
    this.trilha = [];
    for (var i = 0; i < 4; i++) this.trilha.push({ x: L.x, y: L.y });
  };
  M.temNoGrupo = function (id) { return this.herois.some(function (h) { return h.id === id && !h.caido; }); };
  M.heroi = function (id) { return this.herois.filter(function (h) { return h.id === id; })[0] || null; };
  M.acharNpc = function (id) { return this.props.filter(function (p) { return p.id === id && p instanceof BSI.Npc && !p.morto; })[0] || null; };

  M.aoCairHeroi = function (h) {
    BSI.state.stats.quedas = (BSI.state.stats.quedas || 0) + 1;
    this.falar(h, 'Caí! Me acode, Zé Neto!', 2);
    if (BSI.falasVivas) { var amigo = this.herois.filter(function (o) { return o !== h && !o.caido; })[0]; if (amigo) { var mm = this; this.agendar(0.8, function () { BSI.falasVivas.dizer(mm, amigo, 'caido', { forcar: true }); }); } }
    if (h === this.lider()) {
      var k = this.proximoVivo(this.liderIdx, 1);
      if (k < 0) { BSI.jogo.todosCairam(); return; }
      this.liderIdx = k; BSI.state.lider = k; this.reiniciarTrilha();
    }
    if (this.herois.every(function (o) { return o.caido; })) BSI.jogo.todosCairam();
  };

  M.salvarCheckpoint = function (f) {
    var S = BSI.state;
    S.checkpoint = { mapa: this.mapa.id, x: (f.x - T / 2) / T, y: (f.y - T / 2 - 2) / T + 1.2, chave: f.chave };
    S.mapa = this.mapa.id;
    this.herois.forEach(function (h) { if (h.caido) h.reviver(2); });
    S.vidas = {};
    this.herois.forEach(function (h) { S.vidas[h.id] = h.vida; });
    BSI.jogo.salvar();
    BSI.audio.sfx('salvar');
    BSI.hud.aviso('Fogueira acesa: jogo salvo!');
    this.falar(this.lider(), BSI.falas.sorteia('checkpoint'), 1.8);
  };

  // ---------------- consultas ----------------
  M.alvosPara = function (time, soInimigos) {
    var r = [], i;
    if (time === 'herois') {
      for (i = 0; i < this.inimigos.length; i++) if (!this.inimigos[i].morto && this.inimigos[i].time === 'inimigos') r.push(this.inimigos[i]);
      if (!soInimigos) for (i = 0; i < this.bichos.length; i++) if (!this.bichos[i].morto) r.push(this.bichos[i]);
    } else {
      for (i = 0; i < this.herois.length; i++) if (!this.herois[i].caido) r.push(this.herois[i]);
      for (i = 0; i < this.inimigos.length; i++) if (!this.inimigos[i].morto && this.inimigos[i].time === 'herois') r.push(this.inimigos[i]);
    }
    return r;
  };

  M.bloqueiaEscudo = function (p) {
    if (p.time === 'herois') return false;
    for (var i = 0; i < this.herois.length; i++) {
      var h = this.herois[i];
      if (h.caido || !(h.st.escudo > 0)) continue;
      var sx = h.x + h.face.x * 9, sy = h.y - 6 + h.face.y * 7;
      if (U.dist2(p.x, p.y, sx, sy) < 8 * 8) {
        this.particulas.explosao(p.x, p.y, 5, [C.branco, C.amarelo], 40, 0.25);
        if (BSI.combos && BSI.combos.rebater(this, h, p)) { BSI.audio.sfx('estalo'); return false; }
        BSI.audio.sfx('estalo');
        return true;
      }
    }
    return false;
  };

  M.barulho = function (x, y, raio) {
    var r2 = raio * raio;
    this.inimigos.forEach(function (e) { if (!e.morto && U.dist2(e.x, e.y, x, y) < r2) e.ouvir(x, y); });
  };

  M.soltarItem = function (item, x, y, qtd) {
    var p = this.mapa.pontoLivre(x + (Math.random() - 0.5) * 8, y + (Math.random() - 0.5) * 8, 3, 3);
    this.props.push(new BSI.Item(item, p.x, p.y, qtd));
  };

  M.encherPoder = function (v) {
    var S = BSI.state;
    var antes = S.poder || 0;
    S.poder = Math.min(100, antes + v);
    if (antes < 100 && S.poder >= 100) { BSI.audio.sfx('confirma'); BSI.hud.aviso('Poder de grupo pronto! (' + BSI.hud.nomeBotao('poder') + ')', C.amarelo); }
  };

  M.aoMatarInimigo = function () { BSI.state.stats.abates = (BSI.state.stats.abates || 0) + 1; this.encherPoder(5); };
  M.aoCacar = function (b) {
    BSI.state.stats.cacas = (BSI.state.stats.cacas || 0) + 1;
    BSI.story.medidor('raiva', b.d.raiva, 'A Caipora não gostou nada disso... Raiva +' + b.d.raiva);
    var h = this.lider(), self = this;
    this.agendar(1.2, function () { if (!(BSI.falasVivas && BSI.falasVivas.reagir(self, 'caca'))) self.falar(h, BSI.falas.sorteia('caca'), 1.8); });
  };
  M.estatistica = function (k) { var s = BSI.state.stats; s[k] = (s[k] || 0) + 1; };

  // ---------------- efeitos de tempo ----------------
  M.tempoLento = function (escala, durReal) { this.lento.t = durReal; this.lento.escala = escala; };
  M.agendar = function (seg, fn, real) { this.agenda.push({ t: seg, fn: fn, real: !!real }); };
  M.clarao = function (x, y) { this.claroes.push({ x: x, y: y, t: 0.07 }); };
  M.falar = function (ent, texto, dur) {
    if (!texto) return;
    for (var i = 0; i < this.baloes.length; i++) if (this.baloes[i].ent === ent) { this.baloes[i].texto = texto; this.baloes[i].t = dur || 1.5; return; }
    this.baloes.push({ ent: ent, texto: texto, t: dur || 1.5 });
  };

  // O Aboio do Tio Ota: o gado do curral atravessa a tela em disparada
  M.estouroBoiada = function () {
    var cam = this.camera, n = 8;
    for (var i = 0; i < n; i++) {
      this.efeitos.push({
        tipo: 'boi', x: cam.x - 30 - Math.random() * 120, y: cam.y + 24 + (i + Math.random() * 0.6) * (BSI.view.h - 30) / n,
        vel: 200 + Math.random() * 60, t: 3, t0: 3, atingidos: []
      });
    }
    this.camera.tremer(6);
  };

  // ---------------- atualização ----------------
  M.atualizar = function (dtReal) {
    var S = BSI.state, self = this;
    var cena = BSI.roteiro.emCena(); // cutscene: ninguém controla nada, inimigos param
    // HITSTOP: o mundo congela uns milissegundos no acerto (a câmera continua tremendo)
    if (this.hitstop > 0) { this.hitstop -= dtReal; this.camera.atualizar(dtReal, this.lider(), this.mapa); return; }
    if (this.onomatopeias) for (var on = this.onomatopeias.length - 1; on >= 0; on--) { var o0 = this.onomatopeias[on]; o0.t -= dtReal; o0.y -= dtReal * 14; if (o0.t <= 0) this.onomatopeias.splice(on, 1); }
    this.tempo += dtReal;
    S.tempo += dtReal;

    if (this.lento.t > 0) { this.lento.t -= dtReal; if (this.lento.t <= 0) this.lento.escala = 1; }
    var dt = dtReal * (this.lento.t > 0 ? this.lento.escala : 1);

    for (var a = this.agenda.length - 1; a >= 0; a--) {
      var ag = this.agenda[a];
      ag.t -= ag.real ? dtReal : dt;
      if (ag.t <= 0) { this.agenda.splice(a, 1); ag.fn(); }
    }

    var juizo = BSI.story.efeitoJuizo();
    BSI.input.doido.inverter = juizo.inverter !== this.inverterForcado; // Gadernal inverte (e desinverte!)
    BSI.input.doido.tremor = juizo.tremor;
    var desc = S.medidores.desconfianca;
    this.desobediencia = desc > 60 ? (desc - 60) / 80 : 0;
    this.multVelInimigo = this.caosCalma > 0 ? 0.35 : 1;

    var I = BSI.input;
    if (!cena) {
      if (I.apertou('anterior')) this.trocar(-1);
      if (I.apertou('proximo')) this.trocar(1);
      if (I.apertou('ordem')) BSI.grupo.ciclarOrdem(this);
      if (I.apertou('mapa')) { BSI.minimapa.abrir(this); return; }
      if (I.apertou('equipamento')) { BSI.jogo.abrirModal(new BSI.Equip(this)); BSI.audio.sfx('menu'); return; }
      BSI.rodaArmas.atualizar(this);
      BSI.mira.atualizar(this);
      // 1 a 6: pede a habilidade daquele companheiro sem trocar
      for (var nh = 0; nh < 6; nh++) if (I.apertou('hab' + (nh + 1)) && !BSI.rodaArmas.ativa) {
        if (nh === this.liderIdx) BSI.habilidades.usar(this.lider(), this);
        else BSI.grupo.pedir(this, nh);
      }
      if (I.apertou('poder')) { BSI.poderes.apertou(this); return; }
      this.interagivel = this.acharInteragivel();
      if (I.apertou('interagir') && this.interagivel) { BSI.jogo.conversar(this.interagivel.dialogo, this.interagivel); return; }
    } else this.interagivel = null;

    // ---- heróis e cachorros ----
    var L, i;
    for (i = 0; i < this.herois.length; i++) this.herois[i].atualizar(dt, this, i === this.liderIdx && !cena);
    L = this.lider();
    var ult = this.trilha[this.trilha.length - 1];
    if (U.dist2(L.x, L.y, ult.x, ult.y) > 9) { this.trilha.push({ x: L.x, y: L.y }); if (this.trilha.length > 160) this.trilha.shift(); }
    for (i = 0; i < this.cachorros.length; i++) this.cachorros[i].atualizar(dt, this);

    // ---- resto (inimigos e bichos param durante cutscene) ----
    if (!cena) {
      for (i = 0; i < this.inimigos.length; i++) if (!this.inimigos[i].morto) this.inimigos[i].atualizar(dt, this);
      for (i = 0; i < this.bichos.length; i++) if (!this.bichos[i].morto) this.bichos[i].atualizar(dt, this);
    }
    for (i = 0; i < this.props.length; i++) if (!this.props[i].morto) this.props[i].atualizar(dt, this);
    for (i = 0; i < this.projeteis.length; i++) this.projeteis[i].atualizar(dt, this);
    for (i = 0; i < this.vagalumes.length; i++) this.vagalumes[i].atualizar(dt, this);
    BSI.vida.atualizar(this, cena ? 0 : dt);
    BSI.minimapa.atualizar(this, dtReal);
    if (BSI.falasVivas && !cena) BSI.falasVivas.atualizar(this, dt); // conversas de estrada, chefes, reações
    this.fogo.atualizar(dt, this);
    this.particulas.atualizar(dt);
    this.atualizarEfeitos(dt);
    this.danoDoFogo(dt);
    this.rouboDoMiguel();
    this.separar();
    BSI.caipora.atualizar(this, dt);

    // Caos e Calma: inimigos andam perdidos
    if (this.caosCalma > 0) {
      this.caosCalma -= dt;
      if (Math.random() < dt * 2) this.inimigos.forEach(function (e) { if (!e.morto && e.time === 'inimigos' && !e.chefe) e.fugir(0.6, { x: e.x + (Math.random() - 0.5) * 50, y: e.y + (Math.random() - 0.5) * 50 }); });
    }

    // limpa mortos
    this.inimigos = this.inimigos.filter(function (e) { return !e.morto; });
    this.bichos = this.bichos.filter(function (e) { return !e.morto; });
    this.props = this.props.filter(function (e) { return !e.morto; });
    this.projeteis = this.projeteis.filter(function (e) { return !e.morto; });
    for (var b = this.baloes.length - 1; b >= 0; b--) { this.baloes[b].t -= dtReal; if (this.baloes[b].t <= 0 || this.baloes[b].ent.morto) this.baloes.splice(b, 1); }
    for (var c = this.claroes.length - 1; c >= 0; c--) { this.claroes[c].t -= dtReal; if (this.claroes[c].t <= 0) this.claroes.splice(c, 1); }
    // transição suave de luz (a noite escurecendo na cutscene)
    var alvoAmb = this.ambienteAlvo != null ? this.ambienteAlvo : this.ambienteBase();
    this.ambienteAtual += (alvoAmb - this.ambienteAtual) * Math.min(1, dtReal * 0.8);
    if (this.perseguicao) this.perseguicao.atualizar(dt);
    if (this.luzesCeu > 0) this.luzesCeu -= dtReal;
    if (this.poderInfinito) S.poder = 100; // A GRANDE FOGUEIRA
    if (this.defesa) this.defesa.atualizar(dt);
    ['luzTotal', 'revelar', 'conselho', 'apagao'].forEach(function (k) { if (self[k] > 0) self[k] -= dtReal; });

    if (this.ambienteAtual < 0.6 && S.pilha > 0) S.pilha = Math.max(0, S.pilha - dt * 0.22);

    this.cdDanielSorri -= dt;
    if (this.fogo.n > 8 && this.cdDanielSorri <= 0) {
      var dn = this.heroi('daniel');
      if (dn && !dn.caido) { this.falar(dn, BSI.falas.sorteia('danielFogo'), 1.5); this.cdDanielSorri = 9; }
    }

    // web namorada do Helano
    if (!cena && !this.webFeito && L.id === 'helano' && !L.bloqueado()) {
      this.webTimer -= dt;
      if (this.webTimer <= 0) { this.webFeito = true; BSI.minigames.webNamorada(L, this); }
    }

    // zonas de evento (história)
    if (!cena) {
      for (var z = 0; z < this.zonas.length; z++) {
        var zo = this.zonas[z], dentro = BSI.colisao.noRet(L, zo);
        if (dentro && !zo.dentro) BSI.fases.dispararEvento(zo.evento, this);
        zo.dentro = dentro;
      }
    }

    // portas
    if (!this.saindo && !cena) this.checarPortas(L);

    // no discurso do CDs a câmera enquadra o líder E o palanque
    var alvoCam = L, chC = this.chefe;
    if (chC && chC.cds && chC.estado === 'discurso') alvoCam = { x: (L.x + chC.x) / 2, y: (L.y + chC.y) / 2 + 24, face: { x: 0, y: 0 } };
    this.camera.atualizar(dtReal, alvoCam, this.mapa);
  };

  M.checarPortas = function (L) {
    var portas = this.dados.portas || [];
    for (var p = 0; p < portas.length; p++) {
      var po = portas[p];
      if (!BSI.colisao.noRet(L, { x: po.x * T, y: po.y * T, w: po.w * T, h: po.h * T })) continue;
      // porta trancada pela história
      if (po.requer && !BSI.story.tem(po.requer)) {
        var n = U.norm(L.x - (po.x + po.w / 2) * T, L.y - (po.y + po.h / 2) * T);
        L.x += n.x * 10; L.y += n.y * 10;
        BSI.colisao.mover(L, this.mapa, 0, 0);
        if (po.bloqueio) BSI.jogo.conversar(po.bloqueio, null);
        return;
      }
      if (BSI.caipora.trilhaMudou(this)) { this.saindo = true; return; }
      this.saindo = true;
      // porta que avança a história começa a fase nova
      if (po.fase && BSI.fases.indice(po.fase) > BSI.fases.indice(BSI.state.fase)) BSI.fases.iniciar(po.fase);
      else BSI.jogo.trocarMapa(po.para, po.chegada);
      return;
    }
  };

  M.acharInteragivel = function () {
    var L = this.lider();
    if (!L || L.caido) return null;
    var fx = L.x + L.face.x * 8, fy = L.y + L.face.y * 6;
    var melhor = null, md = 22 * 22;
    for (var i = 0; i < this.props.length; i++) {
      var p = this.props[i];
      if (!p.dialogo) continue;
      var d = U.dist2(p.x, p.y, fx, fy);
      if (d < md) { md = d; melhor = p; }
    }
    return melhor;
  };

  M.atualizarEfeitos = function (dt) {
    var self = this;
    for (var i = this.efeitos.length - 1; i >= 0; i--) {
      var e = this.efeitos[i];
      if (!e) continue; // a lista pode encolher durante o laço (ex.: chefe derrotado)
      e.t -= dt;
      if (e.tipo === 'circulo') {
        this.herois.forEach(function (h) {
          if (!h.caido && U.dist2(h.x, h.y, e.x, e.y) < e.r * e.r) { h.st.rapido = Math.max(h.st.rapido || 0, 0.3); h.st.forte = Math.max(h.st.forte || 0, 0.3); }
        });
      } else if (e.tipo === 'onda') {
        e.r = e.rMax * (1 - e.t / e.t0);
      } else if (e.tipo === 'galao' && e.t <= 0) {
        this.fogo.acenderArea(e.x, e.y, 1, true);
        if (BSI.combos) BSI.combos.galao(this, e);
        this.props.forEach(function (p) { if (p.fogueira && p.forca < 1 && U.dist2(p.x, p.y, e.x, e.y) < 30 * 30) p.reacender(self); });
        if (this.caixa && this.caixa.ativa && U.dist2(this.caixa.x, this.caixa.y, e.x, e.y) < 28 * 28) this.caixa.queimar(this);
        this.alvosPara('herois').forEach(function (a) { if (U.dist2(a.x, a.y, e.x, e.y) < 20 * 20) a.levarDano(2, self, e.dono, 'fogo'); });
        this.particulas.explosao(e.x, e.y - 4, 16, [C.fogo1, C.fogo2, C.fogo3], 60, 0.5);
        this.camera.tremer(2.5);
        BSI.audio.sfx('fogo');
        this.barulho(e.x, e.y, 120);
      } else if (e.tipo === 'garrafa' && e.t <= 0) {
        // garrafa do Paulo espatifou
        this.herois.forEach(function (h) { if (!h.caido && U.dist2(h.x, h.y, e.x, e.y) < e.raio * e.raio) h.levarDano(1, self, { x: e.x, y: e.y }, 'corpo'); });
        this.particulas.explosao(e.x, e.y - 2, 12, ['#9fd0a0', '#6a9a6a', '#ffffff'], 60, 0.4, { grav: 80 });
        BSI.audio.sfx('vidro');
        this.efeitos.push({ tipo: 'poca', x: e.x, y: e.y, t: 3.5, t0: 3.5 });
      } else if (e.tipo === 'telha' && e.t <= 0) {
        // telha do Gadernal caiu
        this.herois.forEach(function (h) { if (!h.caido && U.dist2(h.x, h.y, e.x, e.y) < e.raio * e.raio) h.levarDano(2, self, { x: e.x, y: e.y }, 'corpo'); });
        this.particulas.explosao(e.x, e.y - 2, 10, ['#a8402a', '#7a2a1c', 'rgba(225,190,140,0.9)'], 50, 0.4, { grav: 80 });
        BSI.audio.sfx('vidro');
      } else if (e.tipo === 'poca') {
        this.herois.forEach(function (h) { if (!h.caido && U.dist2(h.x, h.y, e.x, e.y) < 10 * 10) h.st.zonzo = Math.max(h.st.zonzo || 0, 0.6); });
      } else if (e.tipo === 'boi') {
        e.x += e.vel * dt;
        if (Math.random() < 0.4) this.particulas.poeira(e.x - 10, e.y + 2);
        this.inimigos.forEach(function (en) {
          if (en.morto || en.time !== 'inimigos' || e.atingidos.indexOf(en) >= 0) return;
          if (Math.abs(en.x - e.x) < 14 && Math.abs(en.y - e.y) < 12) {
            e.atingidos.push(en);
            en.levarDano(en.chefe ? en.vidaFase * 0.15 : 5, self, self.lider(), 'aboio');
            en.kbx += 250; en.atordoar && en.atordoar(1.5);
          }
        });
      }
      if (e.t <= 0) this.efeitos.splice(i, 1);
    }
  };

  M.danoDoFogo = function (dt) {
    if (!this.fogo.n) return;
    var self = this;
    var todos = this.herois.concat(this.inimigos, this.bichos);
    todos.forEach(function (e) {
      if (e.morto || e.caido) return;
      e.cdFogo = (e.cdFogo || 0) - dt;
      if (e.cdFogo > 0) return;
      if (self.fogo.queimandoPx(e.x, e.y)) {
        e.cdFogo = 0.8;
        e.levarDano(1, self, null, 'fogo');
        if (e.id !== 'daniel') self.particulas.explosao(e.x, e.y - 6, 4, [C.fogo2, C.fogo3], 20, 0.3);
      }
    });
  };

  M.rouboDoMiguel = function () {
    var self = this;
    this.herois.forEach(function (h) {
      if (h.id !== 'miguel' || h.caido || !(h.st.invisivel > 0)) return;
      var cx0 = self.caixa;
      if (cx0 && cx0.ativa && !cx0.penDrive && U.dist2(h.x, h.y, cx0.x, cx0.y) < 18 * 18) { cx0.penDrive = true; cx0.reduzir(self, 'pendrive'); self.falar(h, 'Pen drive? Que pen drive?', 1.6); }
      self.inimigos.forEach(function (e) {
        if (e.morto || e.roubado || e.time !== 'inimigos') return;
        if (U.dist2(h.x, h.y, e.x, e.y) < 16 * 16) {
          e.roubado = true;
          if (e.chefe) { if (e.roubarGarrafa) e.roubarGarrafa(self); }
          else {
            BSI.state.municao += 2;
            BSI.audio.sfx('pegar');
            BSI.hud.aviso('Miguel roubou 2 cartuchos do ' + e.d.nome.toLowerCase() + ' sem ninguém ver');
          }
          self.particulas.explosao(e.x, e.y - 8, 6, [C.amarelo], 20, 0.4);
          self.estatistica('roubos');
        }
      });
    });
  };

  M.separar = function () {
    var l = this.inimigos.concat(this.bichos), H = this.herois, i, j;
    for (i = 0; i < l.length; i++) {
      var a = l[i];
      for (j = 0; j < H.length; j++) empurraPar(a, H[j], this.mapa);
      for (j = i + 1; j < l.length; j++) empurraPar(a, l[j], this.mapa);
    }
  };
  function empurraPar(a, b, mapa) {
    if (a.morto || b.morto || b.caido || (b.st && b.st.invisivel > 0) || a.voando || b.voando || a.alma || b.alma) return;
    var dx = b.x - a.x, dy = b.y - a.y, min = a.hw + b.hw;
    var d2 = dx * dx + dy * dy;
    if (d2 >= min * min || d2 < 0.0001) return;
    var d = Math.sqrt(d2), em = (min - d) / 2;
    var nx = dx / d, ny = dy / d;
    BSI.colisao.mover(a, mapa, -nx * em, -ny * em);
    BSI.colisao.mover(b, mapa, nx * em, ny * em);
  }

  // ---------------- desenho ----------------
  M.desenhar = function (g) {
    var cam = this.camera, cx = cam.ix(), cy = cam.iy();
    var W = BSI.view.w, Hh = BSI.view.h;
    g.fillStyle = '#0b0812'; g.fillRect(0, 0, W, Hh);
    BSI.efeitos.preparar(this);
    var girando = Math.abs(this.giro) > 0.001;
    if (girando) { g.save(); g.translate(W / 2, Hh / 2); g.rotate(this.giro); g.translate(-W / 2, -Hh / 2); }
    var me = this.mapa.esc || 1;
    g.drawImage(this.mapa.canvas, -cx, -cy, this.mapa.canvas.width / me, this.mapa.canvas.height / me);

    var self = this, k;
    this.efeitos.forEach(function (e) {
      if (e.tipo === 'circulo') desenharCirculo(g, e, cx, cy, self.tempo);
      if (e.tipo === 'poca') { g.fillStyle = 'rgba(200,220,160,' + (0.35 * e.t / e.t0).toFixed(2) + ')'; g.fillRect(Math.round(e.x - cx) - 8, Math.round(e.y - cy) - 2, 16, 5); }
      if (e.tipo === 'telha') { var ft = 1 - e.t / e.t0; g.fillStyle = 'rgba(232,64,58,' + (0.15 + ft * 0.3).toFixed(2) + ')'; g.beginPath(); g.ellipse(Math.round(e.x - cx), Math.round(e.y - cy), e.raio * (0.4 + ft * 0.6), e.raio * 0.6 * (0.4 + ft * 0.6), 0, 0, Math.PI * 2); g.fill();
        g.fillStyle = '#a8402a'; g.fillRect(Math.round(e.x - cx) - 4, Math.round(e.y - cy - (1 - ft) * 90) - 3, 8, 4); g.fillStyle = '#7a2a1c'; g.fillRect(Math.round(e.x - cx) - 4, Math.round(e.y - cy - (1 - ft) * 90), 8, 1); }
      if (e.tipo === 'garrafa') { // sombra mostrando onde a garrafa vai cair
        var f = 1 - e.t / e.t0;
        g.fillStyle = 'rgba(232,64,58,' + (0.15 + f * 0.3).toFixed(2) + ')';
        g.beginPath(); g.ellipse(Math.round(e.x - cx), Math.round(e.y - cy), e.raio * (0.4 + f * 0.6), e.raio * 0.6 * (0.4 + f * 0.6), 0, 0, Math.PI * 2); g.fill();
      }
    });

    this.fogo.desenhar(g, cx, cy);

    var lista = [];
    for (k = 0; k < this.props.length; k++) if (!this.props[k].invisivel) lista.push(this.props[k]);
    for (k = 0; k < this.bichos.length; k++) lista.push(this.bichos[k]);
    for (k = 0; k < this.inimigos.length; k++) lista.push(this.inimigos[k]);
    for (k = 0; k < this.cachorros.length; k++) lista.push(this.cachorros[k]);
    for (k = 0; k < this.herois.length; k++) lista.push(this.herois[k]);
    var fauna = this.fauna || [];
    for (k = 0; k < fauna.length; k++) if (fauna[k].tipo !== 'urubu') lista.push(fauna[k]);
    // copas, mandacarus e beirais na tela entram na mesma ordem de profundidade
    var altos = this.mapa.altos || [], y0v = cy - 40, y1v = cy + Hh + 40, x0v = cx - 40, x1v = cx + W + 40;
    for (k = 0; k < altos.length; k++) { var al = altos[k]; if (al.y > y0v && al.y < y1v && al.x > x0v && al.x < x1v) lista.push(al); }
    lista.sort(function (a, b) { return (a.caido ? a.y - 8 : a.y) - (b.caido ? b.y - 8 : b.y); });
    for (k = 0; k < lista.length; k++) lista[k].desenhar(g, cx, cy, this);

    var L = this.lider();
    if (L && !L.caido && !BSI.roteiro.emCena()) {
      var bob = Math.round(Math.sin(this.tempo * 6));
      g.fillStyle = C.amarelo;
      var lx = Math.round(L.x - cx), ly = Math.round(L.y - cy) - 22 + bob - (L.st.montado > 0 ? 5 : 0);
      g.fillRect(lx - 2, ly, 5, 1); g.fillRect(lx - 1, ly + 1, 3, 1); g.fillRect(lx, ly + 2, 1, 1);
    }

    // urubus lá no alto e a moto passando ficam por cima de tudo
    for (k = 0; k < fauna.length; k++) if (fauna[k].tipo === 'urubu') fauna[k].desenhar(g, cx, cy);
    BSI.vida.desenharMoto(g, this, cx, cy);
    if (this.dados.bandeirinhas) desenharBandeirinhas(g, this.dados.bandeirinhas, cx, cy, this.tempo);
    for (k = 0; k < this.projeteis.length; k++) this.projeteis[k].desenhar(g, cx, cy);
    this.efeitos.forEach(function (e) { desenharEfeito(g, e, cx, cy); });
    this.particulas.desenhar(g, cx, cy);
    for (k = 0; k < this.vagalumes.length; k++) this.vagalumes[k].desenhar(g, cx, cy);

    BSI.efeitos.mundo(g, this, cx, cy, this.tempo); // nuvens, água, mariposas
    var amb = this.ambienteAtual;
    if (this.luzTotal > 0 || (BSI.debug && BSI.debug.op.luzTotal)) amb = 1;
    else amb = Math.max(this.pisoLuz(), amb); // nem cutscene apaga o luar
    if (amb < 0.99) BSI.luz.desenhar(g, this.luzes(), amb, cx, cy, this.tintaAtual());
    if (girando) g.restore();
    if (this.luzesCeu > 0) desenharLuzesCeu(g, W, Hh, this.tempo, this.luzesCeu);

    if (this.conselho > 0) this.desenharConselho(g, cx, cy);
    if (this.lento.t > 0) { g.fillStyle = 'rgba(80,140,220,0.12)'; g.fillRect(0, 0, W, Hh); }
    if (this.caosCalma > 0) { g.fillStyle = 'rgba(160,90,200,0.08)'; g.fillRect(0, 0, W, Hh); }
    BSI.efeitos.pos(g, W, Hh, this.tempo); // bloom, vinheta, granulado
  };

  // Conselho do Alpendre: pontos fracos e setas pro caminho
  M.desenharConselho = function (g, cx, cy) {
    var t = this.tempo, self = this;
    this.inimigos.forEach(function (e) {
      if (e.morto || e.time !== 'inimigos') return;
      var x = Math.round(e.x - cx), y = Math.round(e.y - cy) - (e.chefe ? 22 : 12);
      g.strokeStyle = C.amarelo; g.lineWidth = 1;
      var r = 4 + Math.sin(t * 8) * 1;
      g.strokeRect(x - r + 0.5, y - r + 0.5, r * 2, r * 2);
      g.fillStyle = C.amarelo; g.fillRect(x, y, 1, 1);
    });
    // seta pra próxima saída/porta
    var L = this.lider(), alvo = null, md = 1e12;
    (this.dados.portas || []).forEach(function (p) {
      var x = (p.x + p.w / 2) * T, y = (p.y + p.h / 2) * T, d = U.dist2(x, y, L.x, L.y);
      if (d < md && d > 40 * 40) { md = d; alvo = { x: x, y: y }; }
    });
    if (!alvo) return;
    var n = U.norm(alvo.x - L.x, alvo.y - L.y);
    if (this.conselhoErrado) { n.x = -n.x; n.y = -n.y; }
    for (var i = 1; i <= 3; i++) {
      var ax = Math.round(L.x - cx + n.x * (14 + i * 9 + (t * 20) % 9)), ay = Math.round(L.y - cy - 6 + n.y * (14 + i * 9 + (t * 20) % 9));
      g.fillStyle = self.conselhoErrado ? '#ff9a7a' : '#9fe0a0';
      g.fillRect(ax - 1, ay - 1, 3, 3);
    }
  };

  M.luzes = function () {
    var r = [], S = BSI.state, L = this.lider(), i;
    if (L && !L.caido && !(this.apagao > 0)) {
      var pil = S.pilha / 100;
      var CL = BSI.config.visual.luz;
      var raio = CL.lanternaBase + CL.lanternaExtra * pil;
      var pisca = pil < 0.25 && Math.random() < 0.08;
      if (!pisca) r.push({ x: L.x + L.face.x * 18, y: L.y - 6 + L.face.y * 14, r: raio, forca: CL.forcaLanterna || 1 });
      r.push({ x: L.x, y: L.y - 6, r: 26, forca: 0.9 });
    } else if (L) r.push({ x: L.x, y: L.y - 6, r: 14, forca: 0.6 });
    for (i = 0; i < this.herois.length; i++) {
      var h = this.herois[i];
      if (h === L || h.caido) continue;
      r.push({ x: h.x, y: h.y - 6, r: this.apagao > 0 ? 10 : 26, forca: BSI.config.visual.luz.forcaCompanheiro || 0.75 });
    }
    // contorno no escuro: inimigos sempre dá pra ver um pouquinho (leitura do combate)
    var kc = BSI.config.visual.luz.contornoNoEscuro;
    if (kc > 0) for (i = 0; i < this.inimigos.length; i++) {
      var en = this.inimigos[i];
      if (en.morto || en.alma || en.ignorarMira || (en.st && en.st.invisivel > 0)) continue;
      r.push({ x: en.x, y: en.y - 8, r: en.chefe ? 26 : 16, forca: kc });
    }
    for (i = 0; i < this.props.length; i++) {
      var p = this.props[i];
      if (p.luz) { var lp = p.luz(); if (lp) r.push(lp); }
      if (this.revelar > 0 && (p.dialogo || p.item)) r.push({ x: p.x, y: p.y - 6, r: 22, forca: 0.8, cor: '#9fd8ff' });
    }
    if (this.chefe && !this.chefe.morto) { var lc = this.chefe.luz ? this.chefe.luz() : { x: this.chefe.x, y: this.chefe.y - 14, r: 30, forca: 0.55 }; if (lc) r.push(lc); }
    for (i = 0; i < this.vagalumes.length; i++) { var lv = this.vagalumes[i].luz(); if (lv) r.push(lv); }
    for (i = 0; i < this.claroes.length; i++) r.push({ x: this.claroes[i].x, y: this.claroes[i].y, r: 60, forca: 1, cor: '#fff1a8' });
    for (i = 0; i < this.efeitos.length; i++) {
      var ef = this.efeitos[i];
      if (ef.tipo === 'galao') r.push({ x: ef.x, y: ef.y, r: 14, forca: 0.6 });
      if (ef.tipo === 'garrafa') r.push({ x: ef.x, y: ef.y, r: 16, forca: 0.7, cor: '#e8403a' });
      if (ef.tipo === 'boi') r.push({ x: ef.x, y: ef.y - 8, r: 30, forca: 0.8, cor: '#f0c75e' });
    }
    this.fogo.luzes(r);
    return r;
  };

  // as luzes estranhas no céu (igual às histórias de Quixadá)
  function desenharLuzesCeu(g, W, Hh, t, resto) {
    var a = Math.min(1, resto);
    g.globalAlpha = 0.12 * a * (0.6 + Math.sin(t * 9) * 0.4); g.fillStyle = '#a0ffd8'; g.fillRect(0, 0, W, Hh); g.globalAlpha = 1;
    for (var i = 0; i < 4; i++) {
      var x = Math.round(W * (0.2 + i * 0.2) + Math.sin(t * (0.8 + i * 0.3)) * 30), y = Math.round(14 + Math.cos(t * (1.1 + i * 0.2)) * 8);
      g.fillStyle = 'rgba(160,255,220,' + (0.5 + Math.sin(t * 6 + i) * 0.4).toFixed(2) + ')'; g.fillRect(x - 2, y - 1, 5, 3); g.fillStyle = '#ffffff'; g.fillRect(x, y, 1, 1);
    }
  }

  // fios de bandeirinhas de festa junina, balançando no vento
  function desenharBandeirinhas(g, fios, cx, cy, t) {
    var cores = ['#c0303a', '#f0c75e', '#3b5b8c', '#4f7a3a', '#e0702a', '#d9798a'];
    fios.forEach(function (f, fi) {
      var x1 = f[0] * T + 8 - cx, y1 = f[1] * T - 6 - cy, x2 = f[2] * T + 8 - cx, y2 = f[3] * T - 6 - cy;
      var n = Math.max(2, Math.round(Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1)) / 9));
      for (var i = 0; i <= n; i++) {
        var p = i / n, x = Math.round(x1 + (x2 - x1) * p), y = Math.round(y1 + (y2 - y1) * p + Math.sin(p * Math.PI) * 10 + Math.sin(t * 2 + i) * 0.8);
        g.fillStyle = 'rgba(30,20,20,0.6)'; g.fillRect(x, y, 1, 1);
        if (i % 1 === 0 && i < n) { g.fillStyle = cores[(i + fi) % cores.length]; g.fillRect(x, y + 1, 4, 3); g.fillRect(x + 1, y + 4, 2, 1); }
      }
    });
  }

  function desenharCirculo(g, e, cx, cy, t) {
    var x = Math.round(e.x - cx), y = Math.round(e.y - cy);
    var alfa = Math.min(1, e.t / 1.0);
    g.fillStyle = 'rgba(242,230,201,' + (0.75 * alfa).toFixed(2) + ')';
    var n = 40;
    for (var i = 0; i < n; i++) {
      if (i % 2) continue;
      var a = i / n * Math.PI * 2 + t * 0.3;
      g.fillRect(Math.round(x + Math.cos(a) * e.r), Math.round(y + Math.sin(a) * e.r * 0.6), 2, 1);
    }
    for (var j = 0; j < 3; j++) {
      var b = j / 3 * Math.PI * 2 - t * 0.5;
      var sx = Math.round(x + Math.cos(b) * e.r * 0.55), sy = Math.round(y + Math.sin(b) * e.r * 0.33);
      g.fillRect(sx - 2, sy, 5, 1); g.fillRect(sx, sy - 2, 1, 5);
    }
  }

  function desenharEfeito(g, e, cx, cy) {
    var p, x, y;
    if (e.tipo === 'galao') {
      p = 1 - e.t / e.t0;
      x = U.lerp(e.x0, e.x, p); y = U.lerp(e.y0, e.y, p) - Math.sin(p * Math.PI) * 18;
      g.fillStyle = C.barro; g.fillRect(Math.round(x - cx) - 2, Math.round(y - cy) - 2, 4, 4);
      g.fillStyle = C.fogo2; g.fillRect(Math.round(x - cx), Math.round(y - cy) - 3, 1, 1);
    } else if (e.tipo === 'garrafa') {
      p = 1 - e.t / e.t0;
      x = U.lerp(e.x0, e.x, p); y = U.lerp(e.y0, e.y, p) - Math.sin(p * Math.PI) * 30;
      var gr = BSI.sprites.objeto('garrafa');
      g.save(); g.translate(Math.round(x - cx), Math.round(y - cy)); g.rotate(p * 12);
      g.drawImage(gr.c, -3, -5, gr.w, gr.h); g.restore();
    } else if (e.tipo === 'onda') {
      g.strokeStyle = 'rgba(242,230,201,' + (e.t / e.t0 * 0.8).toFixed(2) + ')';
      g.lineWidth = 1;
      g.beginPath(); g.ellipse(Math.round(e.x - cx), Math.round(e.y - cy), e.r, e.r * 0.6, 0, 0, Math.PI * 2); g.stroke();
    } else if (e.tipo === 'corte') {
      g.fillStyle = 'rgba(255,120,100,0.9)';
      g.fillRect(Math.round(e.x - cx) - 5, Math.round(e.y - cy), 10, 1);
      g.fillRect(Math.round(e.x - cx) - 3, Math.round(e.y - cy) - 2, 6, 1);
    } else if (e.tipo === 'boi') {
      var b = BSI.sprites.boi();
      BSI.sprites.pintar(g, b, b.dirs.right[1 + Math.floor(e.t * 12) % 2], e.x - cx, e.y - cy);
    }
  }

  BSI.Mundo = Mundo;
})();
