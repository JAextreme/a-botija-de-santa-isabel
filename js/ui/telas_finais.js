/* =========================================================
   telas_finais.js — as telas da v1.0:
   - CONQUISTAS (22): ganhas jogando, guardadas nas preferências
     (valem pra todo jogo salvo); aviso + som quando ganha.
   - ESTATÍSTICAS do fim: tempo, final, inimigos, caças, golpes
     de web do Helano, excessos do Davi, carne da Tia Zane...
   - GALERIA de conquistas e finais (o que falta é silhueta).
   Os CRÉDITOS em cordel ficam em story/finais.js.
   ========================================================= */
(function () {
  'use strict';
  var C = BSI.cor, Tx = BSI.texto;
  function cfg() { return BSI.save.cfg(); }
  function st() { return (BSI.state && BSI.state.stats) || {}; }
  function tem(f) { return !!(BSI.state && BSI.state.flags && BSI.state.flags[f]); }
  function faseJaPassou(id) { var o = BSI.data.ordemFases, S = BSI.state; return S && o.indexOf(S.fase) > o.indexOf(id); }

  // ícone = desenho pequeno (feito de retângulos) pra galeria
  var LISTA = [
    { id: 'primeira_caca', nome: 'Caçador de Fim de Semana', desc: 'Cace o primeiro bicho.', icone: 'peba', teste: function () { return st().cacas >= 1; } },
    { id: 'cacador', nome: 'Mata Limpa? Nunca Ouvi Falar', desc: 'Cace 15 bichos (a Caipora anotou).', icone: 'peba', teste: function () { return st().cacas >= 15; } },
    { id: 'amigo_caipora', nome: 'Amigo da Caipora', desc: 'Saia da serra sem caçar nenhum bicho.', icone: 'folha', teste: function () { return faseJaPassou('ato1_cacada') && !(st().cacas > 0); } },
    { id: 'jagunco10', nome: 'Espanta-Jagunço', desc: 'Derrube 10 jagunços.', icone: 'chapeu', teste: function () { return st().abates >= 10; } },
    { id: 'jagunco100', nome: 'O Terror da Serra', desc: 'Derrube 100 jagunços.', icone: 'chapeu', teste: function () { return st().abates >= 100; } },
    { id: 'web1', nome: 'Caiu na Web', desc: 'O Helano caiu no primeiro golpe da web namorada.', icone: 'celular', teste: function () { return st().golpes >= 1; } },
    { id: 'web5', nome: 'Lapuca Apaixonado', desc: 'O Helano caiu em 5 golpes da web.', icone: 'celular', teste: function () { return st().golpes >= 5; } },
    { id: 'excesso10', nome: 'TIRAR O EXCESSO!', desc: 'O Davi tirou o excesso 10 vezes.', icone: 'tesoura', teste: function () { return st().excessos >= 10; } },
    { id: 'carne5', nome: 'Ladrão Oficial', desc: 'O Miguel "pegou emprestada" a carne da Tia Zane 5 vezes.', icone: 'carne', teste: function () { return st().carne >= 5; } },
    { id: 'chinela', nome: 'Mais Rápido que a Chinela', desc: 'Fuja da Tia Zane sem ser pego.', icone: 'chinela', teste: function () { return tem('miguel_fugiu_zane'); } },
    { id: 'combo1', nome: 'Gambiarra Explosiva', desc: 'Faça a primeira combinação de golpes do grupo.', icone: 'fogo', teste: function () { return st().combos >= 1; } },
    { id: 'combo10', nome: 'Química do Sertão', desc: 'Faça 10 combinações.', icone: 'fogo', teste: function () { return st().combos >= 10; } },
    { id: 'fogo50', nome: 'Daniel, NÃO!', desc: 'Queime 50 moitas (sem querer, claro).', icone: 'fogo', teste: function () { return st().queimados >= 50; } },
    { id: 'paulo', nome: 'Pedágio Pago', desc: 'Resolva a questão com o Paulo do Zé Baixinho.', icone: 'garrafa', teste: function () { return tem('paulo_derrotado') || tem('paulo_aliado'); } },
    { id: 'alma', nome: 'Água de Deus Não Tem Dono', desc: 'Liberte o açude da alma penada.', icone: 'alma', teste: function () { return tem('alma_derrotada'); } },
    { id: 'gojoba', nome: 'Silêncio no Bar', desc: 'Desligue a caixa de 500 watts do Gojoba.', icone: 'caixa', teste: function () { return tem('gojoba_vencido'); } },
    { id: 'gadernal', nome: 'Irmão é Irmão', desc: 'Acalme o Gadernal na tapera.', icone: 'cafe', teste: function () { return tem('gadernal_calmo'); } },
    { id: 'cds', nome: 'Fim do Comício', desc: 'Derrube o palanque do Rafael CDs.', icone: 'microfone', teste: function () { return tem('cds_derrotado'); } },
    { id: 'botija', nome: 'A Botija Voltou!', desc: 'Recupere a botija de Santa Isabel.', icone: 'botija', teste: function () { return tem('botija_recuperada'); } },
    { id: 'zerou', nome: 'Fim do Cordel', desc: 'Termine o jogo em qualquer final.', icone: 'livro', teste: function () { return tem('jogo_zerado'); } },
    { id: 'lapuca', nome: 'Zerou no Lapuca', desc: 'Termine o jogo na dificuldade mais difícil.', icone: 'olho', teste: function () { return tem('jogo_zerado') && BSI.state.dificuldade === 'lapuca'; } },
    { id: 'todos_finais', nome: 'Cordelista Completo', desc: 'Descubra os 7 finais.', icone: 'livro', teste: function () { return Object.keys(BSI.finais.vistos()).length >= BSI.data.finais.length; } }
  ];

  var CQ = BSI.conquistas = {
    lista: LISTA,
    ganhas: function () { return cfg().conquistas || {}; },
    tem: function (id) { return !!CQ.ganhas()[id]; },
    ganhar: function (id) {
      var c = cfg(); c.conquistas = c.conquistas || {};
      if (c.conquistas[id]) return false;
      c.conquistas[id] = Date.now(); BSI.save.salvarCfg(c);
      var a = LISTA.filter(function (x) { return x.id === id; })[0];
      if (a && BSI.hud) { BSI.hud.aviso('★ CONQUISTA: ' + a.nome, '#f0c75e'); BSI.audio.sfx('conquista'); }
      return true;
    },
    // confere tudo (barato: chamado 1x por segundo e no fim)
    checar: function () {
      if (!BSI.state) return;
      LISTA.forEach(function (a) { if (!CQ.tem(a.id)) { var ok = false; try { ok = a.teste(); } catch (e) { } if (ok) CQ.ganhar(a.id); } });
    },
    t: 0,
    atualizar: function (dt) { CQ.t += dt; if (CQ.t > 1) { CQ.t = 0; CQ.checar(); } }
  };

  // ---------------- ícones (pixel art com retângulos) ----------------
  var ICONES = {
    peba: [['#8a6a4a', 2, 6, 12, 6], ['#6a4a2a', 3, 7, 2, 4], ['#6a4a2a', 7, 7, 2, 4], ['#6a4a2a', 11, 7, 2, 4], ['#8a6a4a', 13, 9, 3, 2]],
    folha: [['#4f7a3a', 4, 3, 8, 10], ['#6a9a4a', 5, 4, 3, 6], ['#3a5a2a', 7, 3, 1, 12]],
    chapeu: [['#7a5a3a', 1, 9, 14, 3], ['#9a7a4a', 4, 4, 8, 6], ['#3a2a1a', 4, 8, 8, 1]],
    celular: [['#2a2a3a', 5, 2, 7, 12], ['#7ab0e0', 6, 3, 5, 8], ['#e85a8a', 7, 5, 3, 2]],
    tesoura: [['#c0c0c8', 3, 3, 2, 9], ['#c0c0c8', 10, 3, 2, 9], ['#e8403a', 2, 11, 4, 3], ['#e8403a', 9, 11, 4, 3], ['#c0c0c8', 5, 7, 5, 1]],
    carne: [['#a03a2a', 3, 4, 9, 7], ['#c85a3a', 4, 5, 6, 4], ['#f0e0c0', 11, 6, 4, 2]],
    chinela: [['#3a6ab0', 4, 2, 7, 12], ['#2a4a80', 5, 3, 5, 10], ['#e8e0c0', 6, 4, 3, 1]],
    fogo: [['#e0702a', 4, 5, 8, 9], ['#f0c75e', 6, 7, 4, 6], ['#e8403a', 7, 2, 2, 4]],
    garrafa: [['#4a7a3a', 6, 6, 5, 8], ['#4a7a3a', 7, 2, 3, 4], ['#f0e0c0', 6, 8, 5, 2]],
    alma: [['#c8e0f0', 4, 3, 8, 9], ['#c8e0f0', 3, 10, 2, 3], ['#c8e0f0', 11, 10, 2, 3], ['#2a2a3a', 6, 6, 1, 2], ['#2a2a3a', 9, 6, 1, 2]],
    caixa: [['#2a2a2a', 3, 2, 10, 12], ['#5a5a5a', 6, 4, 4, 4], ['#5a5a5a', 5, 9, 6, 4]],
    cafe: [['#f0e0c0', 4, 6, 8, 7], ['#6a3a1a', 5, 7, 6, 2], ['#f0e0c0', 12, 8, 2, 3]],
    microfone: [['#5a5a5a', 6, 2, 4, 6], ['#2a2a2a', 7, 8, 2, 6], ['#c0303a', 4, 13, 8, 1]],
    botija: [['#8a5a2a', 4, 5, 8, 9], ['#6a4a2a', 6, 2, 4, 3], ['#f0c75e', 6, 8, 4, 3]],
    livro: [['#c0303a', 3, 3, 10, 10], ['#f0e0c0', 4, 4, 8, 8], ['#2a1a10', 5, 6, 6, 1], ['#2a1a10', 5, 8, 6, 1]],
    olho: [['#f0e0c0', 2, 5, 12, 6], ['#3a5a2a', 6, 6, 4, 4], ['#000000', 7, 7, 2, 2]]
  };
  function icone(g, nome, x, y, silhueta) {
    (ICONES[nome] || ICONES.livro).forEach(function (r) { g.fillStyle = silhueta ? '#2a2234' : r[0]; g.fillRect(x + r[1], y + r[2], r[3], r[4]); });
  }

  // ---------------- ESTATÍSTICAS (depois do final) ----------------
  function tempoTxt(s) { s = Math.floor(s || 0); var h = Math.floor(s / 3600), m = Math.floor(s / 60) % 60; return (h ? h + ' h ' : '') + m + ' min'; }
  function Estatisticas(fim) { this.fim = fim; this.t = 0; CQ.checar(); }
  Estatisticas.prototype.telaCheia = true;
  Estatisticas.prototype.linhas = function () {
    var S = BSI.state, s = S.stats || {}, dif = BSI.config.balance.dificuldades[S.dificuldade || 'cabra'];
    var ganhas = Object.keys(CQ.ganhas()).length;
    return [
      ['Final', this.fim ? this.fim.nome : '—'],
      ['Tempo de jogo', tempoTxt(S.tempo)],
      ['Dificuldade', dif ? dif.nome : '—'],
      ['Inimigos derrubados', s.abates || 0],
      ['Bichos caçados', s.cacas || 0],
      ['Golpes de web namorada no Helano', s.golpes || 0],
      ['Vezes que o Davi tirou o excesso', s.excessos || 0],
      ['Carne roubada da Tia Zane', (s.carne || 0) + (s.carne === 1 ? ' pedaço' : ' pedaços')],
      ['Combinações de golpes', s.combos || 0],
      ['Moitas queimadas pelo Daniel', s.queimados || 0],
      ['Conquistas', ganhas + ' de ' + LISTA.length],
      ['Finais descobertos', Object.keys(BSI.finais.vistos()).length + ' de ' + BSI.data.finais.length]
    ];
  };
  Estatisticas.prototype.atualizar = function (dt) {
    this.t += dt; var I = BSI.input;
    if (this.t > 1 && (I.confirmou() || I.toque || I.apertou('pausa'))) { BSI.audio.sfx('pagina'); BSI.jogo.abrirModal(new BSI.Creditos(this.fim)); }
  };
  Estatisticas.prototype.desenhar = function (g) {
    var W = BSI.view.w, H = BSI.view.h;
    BSI.telas.fundoTitulo(g, this.t);
    g.fillStyle = 'rgba(10,6,20,0.6)'; g.fillRect(0, 0, W, H);
    var w = Math.min(W - 20, 300), x = Math.round(W / 2 - w / 2);
    if (BSI.cordel) BSI.cordel.caixa(g, x, 10, w, H - 20, '#1e1428', false, true);
    else { g.fillStyle = '#1e1428'; g.fillRect(x, 10, w, H - 20); }
  };
  Estatisticas.prototype.desenharTexto = function () {
    var W = BSI.view.w, H = BSI.view.h, w = Math.min(W - 20, 300), x = Math.round(W / 2 - w / 2);
    Tx.escrever('COMO FOI A NOITE', W / 2, 18, { tam: 11, alinhar: 'center', cordel: true, cor: C.amarelo });
    var L = this.linhas(), passo = Math.min(13, Math.floor((H - 70) / L.length));
    L.forEach(function (l, i) {
      var y = 38 + i * passo, a = Math.min(1, Math.max(0, (this.t - i * 0.12) * 4));
      Tx.escrever(l[0], x + 14, y, { tam: 7, cor: '#d8cdb0', alfa: a });
      Tx.escrever(String(l[1]), x + w - 14, y, { tam: 7, alinhar: 'right', cor: i === 0 ? C.amarelo : C.creme, alfa: a });
    }, this);
    if (this.t > 1) Tx.escrever('[' + BSI.input.rotulo('interagir') + '] ou clique: créditos', W / 2, H - 18, { tam: 6, alinhar: 'center', cor: '#9a8a80' });
  };
  BSI.Estatisticas = Estatisticas;

  // ---------------- GALERIA: conquistas e finais ----------------
  function Galeria2(volta) { this.aba = 0; this.sel = 0; this.ini = 0; this.t = 0; this.volta = volta; CQ.checar(); }
  Galeria2.prototype.telaCheia = true;
  Galeria2.prototype.itens = function () {
    if (this.aba === 0) {
      var v = BSI.finais.vistos();
      return BSI.data.finais.map(function (f) { return { ok: !!v[f.id], nome: f.nome, desc: v[f.id] ? '"' + f.frase + '"' : 'Dica: ' + (f.dica || f.condicao), icone: 'livro' }; });
    }
    var g = CQ.ganhas();
    return LISTA.map(function (a) { return { ok: !!g[a.id], nome: g[a.id] ? a.nome : '???', desc: a.desc, icone: a.icone }; });
  };
  Galeria2.prototype.porTela = function () { return Math.max(3, Math.floor((BSI.view.h - 70) / 20)); };
  Galeria2.prototype.sair = function () { BSI.audio.sfx('menu'); if (this.volta) BSI.jogo.abrirModal(this.volta()); else BSI.jogo.fecharModal(); };
  Galeria2.prototype.atualizar = function (dt) {
    var I = BSI.input, n = this.itens().length; this.t += dt;
    if (I.apertou('pausa')) { this.sair(); return; }
    if (I.apertou('esq') || I.apertou('dir') || I.apertou('proximo')) { this.aba = 1 - this.aba; this.sel = 0; this.ini = 0; BSI.audio.sfx('pagina'); return; }
    if (I.apertou('cima')) { this.sel = (this.sel - 1 + n) % n; BSI.audio.sfx('menu'); }
    if (I.apertou('baixo')) { this.sel = (this.sel + 1) % n; BSI.audio.sfx('menu'); }
    if (I.mouse.roda) this.sel = Math.max(0, Math.min(n - 1, this.sel + (I.mouse.roda > 0 ? 1 : -1)));
    if (I.toque) {
      var W = BSI.view.w;
      if (I.toque.y < 34) { this.aba = I.toque.x < W / 2 ? 0 : 1; this.sel = 0; this.ini = 0; BSI.audio.sfx('pagina'); }
      else if (I.toque.y > BSI.view.h - 20) this.sair();
    }
    var pt = this.porTela();
    if (this.sel < this.ini) this.ini = this.sel;
    if (this.sel >= this.ini + pt) this.ini = this.sel - pt + 1;
  };
  Galeria2.prototype.desenhar = function (g) {
    var W = BSI.view.w, H = BSI.view.h, it = this.itens(), pt = this.porTela();
    BSI.telas.fundoTitulo(g, this.t);
    g.fillStyle = 'rgba(10,6,20,0.82)'; g.fillRect(0, 0, W, H);
    // abas
    [0, 1].forEach(function (a) { g.fillStyle = a === this.aba ? C.ocre : 'rgba(40,28,50,0.9)'; g.fillRect(a ? W / 2 + 2 : 10, 20, W / 2 - 12, 12); }, this);
    for (var k = 0; k < pt && this.ini + k < it.length; k++) {
      var i = this.ini + k, y = 40 + k * 20, s = i === this.sel;
      g.fillStyle = s ? 'rgba(211,155,58,0.3)' : 'rgba(30,20,40,0.85)'; g.fillRect(10, y, W - 20, 18);
      g.fillStyle = it[i].ok ? '#3a2d48' : '#16101c'; g.fillRect(12, y + 1, 16, 16);
      icone(g, it[i].icone, 12, y + 1, !it[i].ok);
    }
  };
  Galeria2.prototype.desenharTexto = function () {
    var W = BSI.view.w, H = BSI.view.h, it = this.itens(), pt = this.porTela();
    var nF = Object.keys(BSI.finais.vistos()).length, nC = Object.keys(CQ.ganhas()).length;
    Tx.escrever('CONQUISTAS E FINAIS', W / 2, 5, { tam: 10, alinhar: 'center', cordel: true, cor: C.amarelo });
    Tx.escrever('Finais  ' + nF + '/' + BSI.data.finais.length, W / 4 + 2, 22, { tam: 7, alinhar: 'center', cor: this.aba === 0 ? C.contorno : C.creme, contorno: this.aba !== 0 });
    Tx.escrever('Conquistas  ' + nC + '/' + LISTA.length, W * 3 / 4, 22, { tam: 7, alinhar: 'center', cor: this.aba === 1 ? C.contorno : C.creme, contorno: this.aba !== 1 });
    for (var k = 0; k < pt && this.ini + k < it.length; k++) {
      var i = this.ini + k, y = 40 + k * 20, o = it[i];
      Tx.escrever(o.ok ? o.nome : (this.aba === 0 ? '??? (final não descoberto)' : '???'), 32, y + 2, { tam: 7, cor: o.ok ? C.amarelo : '#8a7a80' });
      var d = Tx.quebrar(o.desc, W - 50, 5.5)[0];
      Tx.escrever(d, 32, y + 10, { tam: 5.5, cor: o.ok ? C.creme : '#7a6a70', negrito: false });
    }
    if (this.ini > 0) Tx.escrever('▲', W - 14, 36, { tam: 6, cor: C.amarelo });
    if (this.ini + pt < it.length) Tx.escrever('▼', W - 14, 40 + pt * 20 - 4, { tam: 6, cor: C.amarelo });
    Tx.escrever('←→ troca a aba   ↑↓ passa   [Esc] volta', W / 2, H - 12, { tam: 6, alinhar: 'center', cor: '#c8bca0' });
  };
  BSI.Galeria2 = Galeria2;
})();
