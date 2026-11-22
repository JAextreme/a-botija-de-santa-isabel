/* =========================================================
   saves.js — TELA DOS 3 ESPAÇOS DE SAVE (v1.0)
   modo 'carregar' (Continuar), 'novo' (Novo jogo) ou 'gerenciar'.
   Em cada espaço: nome, ato, tempo de jogo e data.
   Exportar (baixa um arquivo .json) e Importar (escolhe o arquivo)
   pra levar o progresso pra outro PC. Save estragado não trava:
   aparece "corrompido" e dá pra voltar pro save anterior.
   ========================================================= */
(function () {
  'use strict';
  var C = BSI.cor, Tx = BSI.texto;
  function J() { return BSI.jogo; }
  function tempo(seg) { var h = Math.floor(seg / 3600), m = Math.floor(seg / 60) % 60; return (h ? h + 'h' : '') + (m < 10 && h ? '0' : '') + m + 'min'; }
  function data(iso) { try { var d = new Date(iso); return ('0' + d.getDate()).slice(-2) + '/' + ('0' + (d.getMonth() + 1)).slice(-2) + '/' + d.getFullYear() + ' ' + ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2); } catch (e) { return ''; } }

  function baixar(nome, texto) {
    try {
      var b = new Blob([texto], { type: 'application/json' }), a = document.createElement('a');
      a.href = URL.createObjectURL(b); a.download = nome; document.body.appendChild(a); a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
      return true;
    } catch (e) { return false; }
  }
  function escolherArquivo(aoLer) {
    try {
      var i = document.createElement('input'); i.type = 'file'; i.accept = '.json,application/json';
      i.onchange = function () { var f = i.files && i.files[0]; if (!f) return; var r = new FileReader(); r.onload = function () { aoLer(String(r.result)); }; r.readAsText(f); };
      i.click();
    } catch (e) { BSI.hud.aviso('Não deu pra abrir o arquivo.', '#ff9a7a'); }
  }

  var ACOES = { carregar: ['Carregar'], novo: ['Começar aqui'], gerenciar: ['Exportar', 'Importar', 'Renomear', 'Apagar'] };

  function TelaSaves(modo, volta) { this.modo = modo; this.sel = Math.max(0, BSI.save.slotAtual() - 1); this.acao = 0; this.t = 0; this.volta = volta; this.confirmar = null; }
  TelaSaves.prototype.telaCheia = true;
  TelaSaves.prototype.caixa = function (i) { var W = BSI.view.w, H = BSI.view.h, h = Math.min(40, Math.floor((H - 60) / 3)); return { x: 16, y: 30 + i * (h + 4), w: W - 32, h: h }; };
  TelaSaves.prototype.botoes = function (i) {
    var c = this.caixa(i), info = BSI.save.info(i + 1), lista = ACOES[this.modo].slice();
    if (this.modo === 'carregar' && info.corrompido && info.temAnterior) lista = ['Usar o save anterior'];
    if (this.modo === 'gerenciar' && (info.vazio || info.corrompido)) lista = ['Importar'].concat(info.corrompido ? ['Apagar'] : []);
    var w = 58;
    return lista.map(function (n, k) { return { nome: n, x: c.x + c.w - (lista.length - k) * (w + 3) - 4, y: c.y + c.h - 14, w: w, h: 11 }; });
  };
  TelaSaves.prototype.sair = function () { BSI.audio.sfx('menu'); J().abrirModal(this.volta ? this.volta() : null); if (!this.volta) J().fecharModal(); };
  TelaSaves.prototype.executar = function (i, nome) {
    var n = i + 1, info = BSI.save.info(n), self = this;
    BSI.audio.sfx('confirma');
    if (nome === 'Carregar') { if (!info.meta) { BSI.hud.aviso(info.corrompido ? 'Esse save está corrompido.' : 'Esse espaço está vazio.', '#ff9a7a'); return; } J().fecharModal(); J().continuar(n); return; }
    if (nome === 'Usar o save anterior') { J().fecharModal(); J().continuar(n, true); return; }
    if (nome === 'Começar aqui') {
      var comecar = function () {
        BSI.save.usarSlot(n);
        var padrao = 'Jogo ' + n;
        var nomeSave = padrao;
        try { if (window.prompt) nomeSave = window.prompt('Nome desse jogo salvo:', padrao) || padrao; } catch (e) { }
        J().proximoNome = nomeSave.slice(0, 24);
        J().abrirModal(J().escolherDificuldade());
      };
      if (info.meta || info.corrompido) { this.confirmar = { texto: 'Apagar "' + (info.meta ? info.meta.nome : 'save corrompido') + '" e começar do zero aqui?', sim: comecar }; return; }
      comecar(); return;
    }
    if (nome === 'Exportar') { var t = BSI.save.exportar(n); if (t && baixar('botija-save-' + n + '.json', t)) BSI.hud.aviso('Save exportado: botija-save-' + n + '.json (pasta Downloads)'); else BSI.hud.aviso('Não deu pra exportar.', '#ff9a7a'); return; }
    if (nome === 'Importar') {
      var importar = function () { escolherArquivo(function (txt) { var erro = BSI.save.importar(n, txt); BSI.hud.aviso(erro || 'Save importado no espaço ' + n + '!', erro ? '#ff9a7a' : '#9fe0a0'); BSI.audio.sfx(erro ? 'estalo' : 'salvar'); }); };
      if (info.meta) { this.confirmar = { texto: 'Trocar "' + info.meta.nome + '" pelo save do arquivo?', sim: importar }; return; }
      importar(); return;
    }
    if (nome === 'Renomear') { try { var novo = window.prompt('Novo nome:', info.meta.nome); if (novo) BSI.save.renomear(n, novo.slice(0, 24)); } catch (e) { } return; }
    if (nome === 'Apagar') { this.confirmar = { texto: 'Apagar o espaço ' + n + ' pra sempre? (não dá pra desfazer)', sim: function () { BSI.save.apagarJogo(n); BSI.hud.aviso('Espaço ' + n + ' apagado.'); } }; return; }
  };
  TelaSaves.prototype.atualizar = function (dt) {
    var I = BSI.input, self = this; this.t += dt;
    if (this.confirmar) {
      if (I.apertou('pausa')) { this.confirmar = null; return; }
      var W = BSI.view.w, H = BSI.view.h, bs = [{ x: W / 2 - 52, y: H / 2 + 6, w: 48, h: 13, sim: true }, { x: W / 2 + 4, y: H / 2 + 6, w: 48, h: 13 }];
      var esc = null;
      if (I.toque) bs.forEach(function (b) { if (I.toque.x >= b.x && I.toque.x < b.x + b.w && I.toque.y >= b.y && I.toque.y < b.y + b.h) esc = b; });
      if (I.apertou('confirmar') || I.apertou('interagir')) esc = bs[0];
      if (esc) { var c = this.confirmar; this.confirmar = null; if (esc.sim) c.sim(); BSI.audio.sfx('confirma'); }
      return;
    }
    if (this.t > 0.15 && I.apertou('pausa')) { this.sair(); return; }
    if (I.apertou('cima')) { this.sel = (this.sel + 2) % 3; this.acao = 0; BSI.audio.sfx('menu'); }
    if (I.apertou('baixo')) { this.sel = (this.sel + 1) % 3; this.acao = 0; BSI.audio.sfx('menu'); }
    var bt = this.botoes(this.sel);
    if (I.apertou('esq')) { this.acao = (this.acao - 1 + bt.length) % bt.length; BSI.audio.sfx('menu'); }
    if (I.apertou('dir')) { this.acao = (this.acao + 1) % bt.length; BSI.audio.sfx('menu'); }
    if (I.toque) {
      for (var i = 0; i < 3; i++) {
        var bb = this.botoes(i);
        for (var k = 0; k < bb.length; k++) { var b = bb[k]; if (I.toque.x >= b.x && I.toque.x < b.x + b.w && I.toque.y >= b.y && I.toque.y < b.y + b.h) { this.sel = i; this.executar(i, b.nome); return; } }
        var cx = this.caixa(i); if (I.toque.y >= cx.y && I.toque.y < cx.y + cx.h) { this.sel = i; this.acao = 0; }
      }
      return;
    }
    if (this.t > 0.15 && (I.apertou('confirmar') || I.apertou('interagir')) && bt[this.acao]) this.executar(this.sel, bt[this.acao].nome);
  };
  TelaSaves.prototype.desenhar = function (g) {
    var W = BSI.view.w, H = BSI.view.h, self = this;
    BSI.telas.fundoTitulo(g, this.t);
    g.fillStyle = 'rgba(10,6,16,0.75)'; g.fillRect(0, 0, W, H);
    for (var i = 0; i < 3; i++) {
      var c = this.caixa(i), info = BSI.save.info(i + 1);
      BSI.cordel.caixa(g, c.x, c.y, c.w, c.h, info.corrompido ? '#3a1414' : (i === this.sel ? '#2e2238' : 'rgba(30,20,40,0.94)'), i === this.sel, true);
      this.botoes(i).forEach(function (b, k) { BSI.cordel.caixa(g, b.x, b.y, b.w, b.h, (i === self.sel && k === self.acao) ? '#d39b3a' : '#4a3a2a', i === self.sel && k === self.acao); });
    }
    if (this.confirmar) { g.fillStyle = 'rgba(0,0,0,0.7)'; g.fillRect(0, 0, W, H); BSI.cordel.caixa(g, W / 2 - 110, H / 2 - 26, 220, 50, '#1e1428', true, true); BSI.cordel.caixa(g, W / 2 - 52, H / 2 + 6, 48, 13, '#d39b3a', true); BSI.cordel.caixa(g, W / 2 + 4, H / 2 + 6, 48, 13, '#4a3a2a'); }
  };
  TelaSaves.prototype.desenharTexto = function () {
    var W = BSI.view.w, H = BSI.view.h, self = this;
    Tx.escrever(this.modo === 'novo' ? 'ONDE COMEÇAR O JOGO NOVO?' : (this.modo === 'carregar' ? 'CONTINUAR QUAL JOGO?' : 'JOGOS SALVOS'), W / 2, 9, { tam: 10, alinhar: 'center', cordel: true, cor: C.amarelo });
    for (var i = 0; i < 3; i++) {
      var c = this.caixa(i), info = BSI.save.info(i + 1);
      Tx.escrever('Espaço ' + (i + 1), c.x + 8, c.y + 5, { tam: 5.5, cor: '#c8bca0' });
      if (info.vazio) Tx.escrever('— vazio —', c.x + 8, c.y + 13, { tam: 7, cor: '#8a7a70' });
      else if (info.corrompido) Tx.escrever('Save corrompido' + (info.temAnterior ? ' (tem um save anterior bom)' : ''), c.x + 8, c.y + 13, { tam: 7, cor: '#ff9a7a' });
      else {
        var mt = info.meta;
        Tx.escrever(mt.nome, c.x + 50, c.y + 4, { tam: 7.5, cor: C.amarelo });
        Tx.escrever(mt.ato || '', c.x + 8, c.y + 15, { tam: 6, cor: C.creme });
        Tx.escrever(tempo(mt.tempo || 0) + ' de jogo · ' + data(mt.data) + ' · ' + ((BSI.config.balance.dificuldades[mt.dificuldade] || {}).nome || ''), c.x + 8, c.y + 23, { tam: 5, cor: '#c8bca0' });
      }
      this.botoes(i).forEach(function (b, k) { Tx.escrever(b.nome, b.x + b.w / 2, b.y + 2.5, { tam: 5.5, alinhar: 'center', cor: (i === self.sel && k === self.acao) ? C.contorno : C.creme, contorno: !(i === self.sel && k === self.acao) }); });
    }
    if (this.confirmar) {
      Tx.quebrar(this.confirmar.texto, 200, 6.5).forEach(function (l, k) { Tx.escrever(l, W / 2, H / 2 - 20 + k * 8, { tam: 6.5, alinhar: 'center', cor: C.creme }); });
      Tx.escrever('Sim', W / 2 - 28, H / 2 + 8.5, { tam: 6.5, alinhar: 'center', cor: C.contorno, contorno: false }); Tx.escrever('Não', W / 2 + 28, H / 2 + 8.5, { tam: 6.5, alinhar: 'center', cor: C.creme });
    } else Tx.escrever('↑↓ escolhe o espaço · ←→ a ação · [Enter] ou clique · [Esc] volta', W / 2, H - 10, { tam: 5, alinhar: 'center', cor: '#c8bca0' });
  };
  BSI.TelaSaves = TelaSaves;
})();
