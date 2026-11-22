/* =========================================================
   opcoes.js — PAUSA → OPÇÕES e a tela de CONTROLES (remapear).
   Tudo fica salvo nas preferências (vale pra todo jogo salvo).
   ←/→ (ou clique) muda o valor; [Esc] volta.
   ========================================================= */
(function () {
  'use strict';
  var C = BSI.cor, Tx = BSI.texto;
  function cfg() { return BSI.save.cfg(); }

  // ---------------- ACESSIBILIDADE (v1.0) ----------------
  var VEL_TEXTO = { lenta: 28, normal: 55, rapida: 110, instantanea: 100000 };
  var NOME_VEL = { lenta: 'lenta', normal: 'normal', rapida: 'rápida', instantanea: 'instantânea' };
  BSI.acess = {
    daltonico: function () { return !!cfg().daltonico; },
    corAviso: function () { return cfg().daltonico ? '#ffe14a' : '#e8403a'; },   // golpe chegando
    corInimigo: function (chefe) { return cfg().daltonico ? (chefe ? '#ff40ff' : '#ff7af0') : (chefe ? '#ff4040' : '#e8503a'); },
    semTremor: function () { return !!cfg().semTremor; },
    semFlash: function () { return !!cfg().semFlash; },
    textoGrande: function () { return cfg().textoTam === 'grande'; },
    velTexto: function () { return VEL_TEXTO[cfg().velTexto] || VEL_TEXTO.normal; }
  };
  function salvar() { BSI.save.salvarCfg(cfg()); }
  function ciclar(lista, atual, dir) { var i = lista.indexOf(atual); if (i < 0) i = 0; return lista[(i + dir + lista.length) % lista.length]; }
  var VM = function () { return BSI.config.visual.minimapa; };

  var POS = ['cimaDireita', 'cimaEsquerda', 'baixoDireita', 'baixoEsquerda'];
  var NOME_POS = { cimaDireita: 'em cima, à direita', cimaEsquerda: 'em cima, à esquerda', baixoDireita: 'embaixo, à direita', baixoEsquerda: 'embaixo, à esquerda' };
  var TAM = ['pequeno', 'medio', 'grande'], NOME_TAM = { pequeno: 'pequeno', medio: 'médio', grande: 'grande' };
  var TRANSP = [0, 0.15, 0.3, 0.5];

  // aplica o brilho (filtro CSS no palco: não pesa nada)
  function aplicarBrilho() {
    var el = document.getElementById('palco'); if (!el || !el.style) return;
    var b = cfg().brilho || 100;
    el.style.filter = b === 100 ? '' : 'brightness(' + (b / 100) + ')';
  }

  var GRAF = ['leve', 'medio', 'bonito'], NOME_GRAF = { leve: 'leve (PC fraco)', medio: 'médio', bonito: 'bonito (efeitos)' };
  var ITENS = [
    { nome: 'Gráficos', valor: function () { return NOME_GRAF[cfg().graficos || 'medio']; }, mudar: function (d) { cfg().graficos = ciclar(GRAF, cfg().graficos || 'medio', d); salvar(); BSI.view.redimensionar(); BSI.sprites.limpar(); } },
    { nome: 'Efeitos de tela', valor: function () { return cfg().efeitosTela === false ? 'desligados' : 'ligados (bloom, vinheta, grão)'; }, mudar: function () { cfg().efeitosTela = cfg().efeitosTela === false; } },
    { nome: 'Brilho', valor: function () { return (cfg().brilho || 100) + '%'; }, mudar: function (d) { cfg().brilho = Math.max(70, Math.min(150, (cfg().brilho || 100) + d * 10)); aplicarBrilho(); } },
    { nome: 'Escuridão', valor: function () { return cfg().escuridao === 'reduzida' ? 'reduzida (enxerga mais)' : 'normal'; }, mudar: function () { cfg().escuridao = cfg().escuridao === 'reduzida' ? 'normal' : 'reduzida'; } },
    { nome: 'Minimapa', valor: function () { var l = cfg().minimapa !== undefined ? cfg().minimapa : VM().ligado; return l ? 'ligado' : 'desligado'; }, mudar: function () { var l = cfg().minimapa !== undefined ? cfg().minimapa : VM().ligado; cfg().minimapa = !l; } },
    { nome: 'Posição do minimapa', valor: function () { return NOME_POS[cfg().minimapaPos || VM().posicao]; }, mudar: function (d) { cfg().minimapaPos = ciclar(POS, cfg().minimapaPos || VM().posicao, d); } },
    { nome: 'Tamanho do minimapa', valor: function () { return NOME_TAM[cfg().minimapaTam || VM().tamanho]; }, mudar: function (d) { cfg().minimapaTam = ciclar(TAM, cfg().minimapaTam || VM().tamanho, d); } },
    { nome: 'Transparência do minimapa', valor: function () { var t = cfg().minimapaTransp !== undefined ? cfg().minimapaTransp : VM().transparencia; return Math.round(t * 100) + '%'; }, mudar: function (d) { var t = cfg().minimapaTransp !== undefined ? cfg().minimapaTransp : VM().transparencia; cfg().minimapaTransp = ciclar(TRANSP, t, d); } },
    { nome: 'Dificuldade', valor: function () { var k = (BSI.state && BSI.state.dificuldade) || cfg().dificuldade || 'cabra'; return BSI.config.balance.dificuldades[k].nome; }, mudar: function (d) { var k = (BSI.state && BSI.state.dificuldade) || cfg().dificuldade || 'cabra'; k = ciclar(['turista', 'cabra', 'lapuca'], k, d); cfg().dificuldade = k; if (BSI.state) BSI.state.dificuldade = k; } },
    { nome: 'Assistência de mira', valor: function () { return cfg().assistenciaMira === 'leve' ? 'leve' : 'desligada'; }, mudar: function () { cfg().assistenciaMira = cfg().assistenciaMira === 'leve' ? 'desligada' : 'leve'; } },
    { nome: 'Fogo amigo', valor: function () { return cfg().fogoAmigo ? 'ligado (cuidado!)' : 'desligado (o fogo do Daniel queima igual)'; }, mudar: function () { cfg().fogoAmigo = !cfg().fogoAmigo; } },
    { nome: 'Companheiros usam habilidade', valor: function () { return (cfg().autoHab || BSI.config.balance.grupo.autoHabilidades) === 'sim' ? 'sozinhos, quando faz sentido' : 'só quando eu pedir (1 a 6)'; }, mudar: function () { var a = cfg().autoHab || BSI.config.balance.grupo.autoHabilidades; cfg().autoHab = a === 'sim' ? 'pedir' : 'sim'; } },
    { nome: 'Som', valor: function () { return BSI.audio.mudo ? 'desligado' : 'ligado'; }, mudar: function () { BSI.audio.alternarMudo(); } },
    { nome: 'Volume geral', valor: function () { return Math.round(BSI.audio.volume * 100) + '%'; }, mudar: function (d) { BSI.audio.mudarVolume(d * 0.1); } },
    { nome: '  Música', valor: function () { return Math.round(BSI.audio.volBarra('musica') * 100) + '%'; }, mudar: function (d) { BSI.audio.mudarBarra('musica', d * 0.1); } },
    { nome: '  Efeitos', valor: function () { return Math.round(BSI.audio.volBarra('efeitos') * 100) + '%'; }, mudar: function (d) { BSI.audio.mudarBarra('efeitos', d * 0.1); BSI.audio.sfx('pegar'); } },
    { nome: '  Ambiente', valor: function () { return Math.round(BSI.audio.volBarra('ambiente') * 100) + '%'; }, mudar: function (d) { BSI.audio.mudarBarra('ambiente', d * 0.1); } },
    { nome: 'Legendas de sons', valor: function () { return BSI.audio.legendasLigadas ? 'ligadas' : 'desligadas'; }, mudar: function () { BSI.audio.alternarLegendas(); } },
    { nome: 'Tamanho do texto', valor: function () { return cfg().textoTam === 'grande' ? 'grande' : 'normal'; }, mudar: function () { cfg().textoTam = cfg().textoTam === 'grande' ? 'normal' : 'grande'; } },
    { nome: 'Velocidade do texto', valor: function () { return NOME_VEL[cfg().velTexto || 'normal']; }, mudar: function (d) { cfg().velTexto = ciclar(['lenta', 'normal', 'rapida', 'instantanea'], cfg().velTexto || 'normal', d); } },
    { nome: 'Tremor de tela', valor: function () { return cfg().semTremor ? 'desligado' : 'ligado'; }, mudar: function () { cfg().semTremor = !cfg().semTremor; } },
    { nome: 'Clarões e piscadas', valor: function () { return cfg().semFlash ? 'suaves' : 'normais'; }, mudar: function () { cfg().semFlash = !cfg().semFlash; } },
    { nome: 'Modo daltônico', valor: function () { return cfg().daltonico ? 'ligado (aviso amarelo, inimigo rosa)' : 'desligado'; }, mudar: function () { cfg().daltonico = !cfg().daltonico; BSI.sprites.limpar(); } },
    { nome: 'Dicas de controle', valor: function () { return cfg().dicasLigadas === false ? 'desligadas' : 'ligadas'; }, mudar: function () { cfg().dicasLigadas = cfg().dicasLigadas === false; } },
    { nome: 'Mostrar as dicas de novo', valor: function () { return '↺'; }, abrir: function () { BSI.tutorial.esquecerTudo(); cfg().dicasLigadas = true; BSI.hud.aviso('As dicas de controle vão aparecer de novo.'); } },
    { nome: 'Controles (trocar teclas)', valor: function () { return '▶'; }, abrir: function (volta) { BSI.jogo.abrirModal(new Controles(volta)); } },
    { nome: 'Voltar', valor: function () { return ''; }, voltar: true }
  ];

  function Opcoes(volta) { this.sel = 0; this.ini = 0; this.volta = volta; this.t = 0; }
  Opcoes.prototype.telaCheia = true;
  Opcoes.prototype.passo = function () { return 12; };
  Opcoes.prototype.porTela = function () { return Math.max(5, Math.floor((BSI.view.h - 54) / this.passo())); };
  // i = índice do item; fora da janela visível devolve null
  Opcoes.prototype.linha = function (i) {
    var k = i - this.ini; if (k < 0 || k >= this.porTela()) return null;
    return { x: 20, y: 30 + k * this.passo(), w: BSI.view.w - 40, h: this.passo() - 2 };
  };
  Opcoes.prototype.rolar = function () {
    var pt = this.porTela();
    if (this.sel < this.ini) this.ini = this.sel;
    if (this.sel >= this.ini + pt) this.ini = this.sel - pt + 1;
    this.ini = Math.max(0, Math.min(this.ini, ITENS.length - pt));
  };
  Opcoes.prototype.sair = function () { salvar(); BSI.audio.sfx('menu'); BSI.jogo.abrirModal(this.volta ? this.volta() : null); if (!this.volta) BSI.jogo.fecharModal(); };
  Opcoes.prototype.atualizar = function (dt) {
    var I = BSI.input, n = ITENS.length, self = this;
    this.t += dt;
    if (I.apertou('pausa')) { this.sair(); return; }
    if (I.apertou('cima')) { this.sel = (this.sel - 1 + n) % n; BSI.audio.sfx('menu'); }
    if (I.apertou('baixo')) { this.sel = (this.sel + 1) % n; BSI.audio.sfx('menu'); }
    // mouse: passa por cima seleciona, clique muda
    if (I.mouse.roda) { this.ini = Math.max(0, Math.min(n - this.porTela(), this.ini + (I.mouse.roda > 0 ? 1 : -1))); this.sel = Math.max(this.ini, Math.min(this.ini + this.porTela() - 1, this.sel)); }
    if (I.mouse.dentro) for (var i = 0; i < n; i++) { var r = this.linha(i); if (r && I.mouse.x >= r.x && I.mouse.x < r.x + r.w && I.mouse.y >= r.y && I.mouse.y < r.y + r.h && (I.mouse.x !== this.mx || I.mouse.y !== this.my)) this.sel = i; }
    this.mx = I.mouse.x; this.my = I.mouse.y;
    var it = ITENS[this.sel], d = 0;
    if (I.apertou('esq')) d = -1; if (I.apertou('dir')) d = 1;
    this.rolar();
    var clicou = I.toque && (function () { var r = self.linha(self.sel); return r && I.toque.x >= r.x && I.toque.x < r.x + r.w && I.toque.y >= r.y && I.toque.y < r.y + r.h; })();
    if (clicou || (I.apertou('confirmar') || I.apertou('interagir'))) {
      if (it.voltar) { this.sair(); return; }
      if (it.abrir) { salvar(); var me = this; it.abrir(function () { return me; }); BSI.audio.sfx('confirma'); return; }
      d = 1;
    }
    if (d && it.mudar) { it.mudar(d); salvar(); BSI.audio.sfx('menu'); }
  };
  Opcoes.prototype.desenhar = function (g) {
    var W = BSI.view.w, H = BSI.view.h;
    g.fillStyle = 'rgba(10,6,20,0.92)'; g.fillRect(0, 0, W, H);
    for (var i = 0; i < ITENS.length; i++) {
      var r = this.linha(i), s = i === this.sel; if (!r) continue;
      g.fillStyle = s ? C.ocre : 'rgba(30,20,40,0.85)'; g.fillRect(r.x, r.y, r.w, r.h);
      if (s) { g.fillStyle = C.amarelo; g.fillRect(r.x, r.y, r.w, 1); g.fillRect(r.x, r.y + r.h - 1, r.w, 1); }
    }
  };
  Opcoes.prototype.desenharTexto = function () {
    var W = BSI.view.w, H = BSI.view.h;
    Tx.escrever('OPÇÕES', W / 2, 12, { tam: 12, alinhar: 'center', cordel: true, cor: C.amarelo });
    if (this.ini > 0) Tx.escrever('▲ mais', W - 22, 21, { tam: 6, alinhar: 'right', cor: C.amarelo });
    if (this.ini + this.porTela() < ITENS.length) Tx.escrever('▼ mais', W - 22, 30 + this.porTela() * this.passo() - 1, { tam: 6, alinhar: 'right', cor: C.amarelo });
    for (var i = 0; i < ITENS.length; i++) {
      var r = this.linha(i), s = i === this.sel, it = ITENS[i]; if (!r) continue;
      Tx.escrever(it.nome, r.x + 6, r.y + 2, { tam: 7, cor: s ? C.contorno : C.creme, contorno: !s });
      var v = it.valor();
      if (v) Tx.escrever((it.mudar && s ? '◀ ' : '') + v + (it.mudar && s ? ' ▶' : ''), r.x + r.w - 6, r.y + 2, { tam: 7, alinhar: 'right', cor: s ? C.contorno : C.amarelo, contorno: !s });
    }
    Tx.escrever('↑↓ escolhe   ←→ ou clique muda   [Esc] volta', W / 2, H - 12, { tam: 6, alinhar: 'center', cor: '#c8bca0' });
  };

  // ---------------- CONTROLES ----------------
  var GRUPOS = ['cima', 'baixo', 'esq', 'dir', 'correr', 'ataque', 'mira', 'recarregar', 'esquiva', 'interagir', 'habilidade', 'poder', 'proximo', 'ordem', 'mapa', 'equipamento', 'travar', 'rodaArmas', 'hab1', 'hab2', 'hab3', 'hab4', 'hab5', 'hab6', 'pausa'];
  function Controles(volta) { this.sel = 0; this.ini = 0; this.volta = volta; this.esperando = null; this.t = 0; }
  Controles.prototype.telaCheia = true;
  Controles.prototype.lista = function () { return GRUPOS.concat(['__padrao', '__voltar']); };
  Controles.prototype.porTela = function () { return Math.floor((BSI.view.h - 50) / 11); };
  Controles.prototype.atualizar = function (dt) {
    var I = BSI.input, L = this.lista(), n = L.length, self = this;
    this.t += dt;
    if (this.esperando) return; // a próxima tecla vai pro capturarProxima
    if (I.apertou('pausa')) { BSI.input.salvarMapa(); BSI.jogo.abrirModal(this.volta ? this.volta() : null); return; }
    if (I.apertou('cima')) { this.sel = (this.sel - 1 + n) % n; BSI.audio.sfx('menu'); }
    if (I.apertou('baixo')) { this.sel = (this.sel + 1) % n; BSI.audio.sfx('menu'); }
    if (I.mouse.roda) this.sel = Math.max(0, Math.min(n - 1, this.sel + I.mouse.roda));
    var pt = this.porTela();
    if (this.sel < this.ini) this.ini = this.sel;
    if (this.sel >= this.ini + pt) this.ini = this.sel - pt + 1;
    var clique = null;
    if (I.toque) for (var i = 0; i < pt; i++) { var y = 30 + i * 11; if (I.toque.y >= y && I.toque.y < y + 10 && this.ini + i < n) clique = this.ini + i; }
    if (clique !== null) this.sel = clique;
    if (clique !== null || I.apertou('confirmar') || I.apertou('interagir')) {
      var a = L[this.sel];
      if (a === '__voltar') { BSI.input.salvarMapa(); BSI.jogo.abrirModal(this.volta ? this.volta() : null); return; }
      if (a === '__padrao') { BSI.input.restaurarPadrao(); BSI.hud.aviso('Teclas voltaram ao padrão.'); BSI.audio.sfx('confirma'); return; }
      this.esperando = a; BSI.audio.sfx('confirma');
      // espera um pouquinho pra tecla do Enter não ser capturada
      setTimeout(function () {
        BSI.input.capturarProxima(function (code) {
          if (code !== 'Escape') { BSI.input.remapear(self.esperando, code); BSI.input.salvarMapa(); BSI.audio.sfx('salvar'); }
          self.esperando = null;
        });
      }, 120);
    }
  };
  Controles.prototype.desenhar = function (g) {
    var W = BSI.view.w, H = BSI.view.h, L = this.lista(), pt = this.porTela();
    g.fillStyle = 'rgba(10,6,20,0.94)'; g.fillRect(0, 0, W, H);
    for (var i = 0; i < pt && this.ini + i < L.length; i++) {
      var k = this.ini + i, y = 30 + i * 11, s = k === this.sel;
      g.fillStyle = s ? C.ocre : (i % 2 ? 'rgba(30,20,40,0.85)' : 'rgba(40,28,50,0.85)'); g.fillRect(24, y, W - 48, 10);
    }
    if (this.esperando) { g.fillStyle = 'rgba(0,0,0,0.7)'; g.fillRect(0, 0, W, H); BSI.telas.moldura(g, W / 2 - 100, H / 2 - 24, 200, 48); }
  };
  Controles.prototype.desenharTexto = function () {
    var W = BSI.view.w, H = BSI.view.h, L = this.lista(), pt = this.porTela(), I = BSI.input;
    Tx.escrever('CONTROLES', W / 2, 10, { tam: 12, alinhar: 'center', cordel: true, cor: C.amarelo });
    for (var i = 0; i < pt && this.ini + i < L.length; i++) {
      var k = this.ini + i, a = L[k], y = 30 + i * 11, s = k === this.sel;
      var nome = a === '__padrao' ? 'Restaurar o padrão' : (a === '__voltar' ? 'Voltar' : (I.NOMES[a] || a));
      Tx.escrever(nome, 30, y + 1.5, { tam: 6.5, cor: s ? C.contorno : C.creme, contorno: !s });
      if (a.indexOf('__') !== 0) {
        var teclas = I.teclasDe(a).map(function (c) { return I.nomeTecla(c); }).join('  /  ');
        Tx.escrever(teclas || '—', W - 30, y + 1.5, { tam: 6.5, alinhar: 'right', cor: s ? C.contorno : C.amarelo, contorno: !s });
      }
    }
    if (this.esperando) {
      Tx.escrever('Aperte a nova tecla para:', W / 2, H / 2 - 14, { tam: 7, alinhar: 'center', cor: C.contorno, contorno: false });
      Tx.escrever(I.NOMES[this.esperando] || this.esperando, W / 2, H / 2 - 4, { tam: 9, alinhar: 'center', cor: C.barro, contorno: false });
      Tx.escrever('([Esc] cancela)', W / 2, H / 2 + 8, { tam: 6, alinhar: 'center', cor: '#5a4030', contorno: false });
    } else Tx.escrever('↑↓ escolhe   [Enter] ou clique troca a tecla   [Esc] volta', W / 2, H - 12, { tam: 6, alinhar: 'center', cor: '#c8bca0' });
  };

  BSI.opcoes = { itens: ITENS, aplicarBrilho: aplicarBrilho, Opcoes: Opcoes, Controles: Controles, abrir: function (volta) { BSI.jogo.abrirModal(new Opcoes(volta)); } };
  aplicarBrilho();
})();
