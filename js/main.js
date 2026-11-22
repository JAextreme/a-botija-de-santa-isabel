/* =========================================================
   main.js — inicialização e controle das telas:
   título → jogo (mundo + diálogos + minigames + pausa).
   Também cuida de checkpoint, salvamento, troca de mapa e
   "todo mundo caiu, volta pra fogueira".
   ========================================================= */
(function () {
  'use strict';
  var C = BSI.cor, Tx = BSI.texto, U = BSI.util;

  var J = BSI.jogo = {
    cena: 'titulo',
    mundo: null,
    modal: null,
    snapshot: null,      // estado no último checkpoint (para voltar quando todos caem)
    fade: { a: 1, alvo: 0, cb: null, espera: 0 },
    menuTitulo: null,
    tTitulo: 0,
    tDebug: 0,

    init: function () {
      BSI.view.init();
      BSI.input.init();
      BSI.touch.init();
      BSI.debug.init();
      J.criarMenuTitulo();
      BSI.loop.iniciar(J.atualizar, J.desenhar);
    },

    // ---------------- telas ----------------
    criarMenuTitulo: function () {
      J.cena = 'titulo';
      J.menuTitulo = new BSI.Menu([
        { txt: 'Continuar', ativo: function () { return BSI.save.temJogo(); }, acao: function () { J.abrirModal(new BSI.TelaSaves('carregar')); } },
        { txt: 'Novo jogo', acao: function () { J.abrirModal(new BSI.TelaSaves('novo')); } },
        { txt: 'Jogos salvos', acao: function () { J.abrirModal(new BSI.TelaSaves('gerenciar')); } },
        { txt: 'Conquistas e finais', acao: function () { J.abrirModal(new BSI.Galeria2()); } },
        { txt: 'Créditos', acao: function () { J.abrirModal(new BSI.Creditos(null, true)); } },
        { txt: 'Opções', acao: function () { BSI.opcoes.abrir(null); } }
      ], { y: function () { return Math.round(BSI.view.h * 0.5); }, larg: 140, alt: Math.min(15, Math.floor(BSI.view.h * 0.45 / 6)) });
    },

    // dificuldade do jogo novo
    escolherDificuldade: function () {
      var D = BSI.config.balance.dificuldades;
      var m = new BSI.Menu(['turista', 'cabra', 'lapuca'].map(function (k) {
        return { txt: D[k].nome, acao: function () { var c = BSI.save.cfg(); c.dificuldade = k; BSI.save.salvarCfg(c); J.fecharModal(); J.novoJogo(); } };
      }), { y: function () { return Math.round(BSI.view.h * 0.45); }, larg: 170, alt: 15 });
      m.sel = 1;
      return {
        atualizar: function () { m.atualizar(); if (BSI.input.apertou('pausa')) J.fecharModal(); },
        desenhar: function (g) { g.fillStyle = 'rgba(10,6,20,0.8)'; g.fillRect(0, 0, BSI.view.w, BSI.view.h); m.desenhar(g); },
        desenharTexto: function () {
          Tx.escrever('DIFICULDADE', BSI.view.w / 2, BSI.view.h * 0.45 - 22, { tam: 11, alinhar: 'center', cordel: true, cor: C.amarelo });
          m.desenharTexto();
          Tx.escrever('Dá pra mudar depois em Opções.', BSI.view.w / 2, BSI.view.h * 0.45 + 50, { tam: 6, alinhar: 'center', cor: '#d8cdb0' });
        }
      };
    },

    confirmacao: function (pergunta, aoSim) {
      var m = new BSI.Menu([
        { txt: 'Sim', acao: function () { J.fecharModal(); aoSim(); } },
        { txt: 'Não', acao: function () { J.fecharModal(); } }
      ], { y: function () { return Math.round(BSI.view.h / 2); }, larg: 90 });
      m.sel = 1;
      return {
        atualizar: function () { m.atualizar(); if (BSI.input.apertou('pausa')) J.fecharModal(); },
        desenhar: function (g) {
          g.fillStyle = 'rgba(10,6,20,0.8)'; g.fillRect(0, 0, BSI.view.w, BSI.view.h);
          m.desenhar(g);
        },
        desenharTexto: function () {
          Tx.escrever(pergunta, BSI.view.w / 2, BSI.view.h / 2 - 20, { tam: 8, alinhar: 'center' });
          m.desenharTexto();
        }
      };
    },

    pausa: function () {
      var m = new BSI.Menu([
        { txt: 'Continuar', acao: function () { J.fecharModal(); } },
        { txt: function () { return 'Caderno de Pistas (' + ((BSI.state.pistas || []).length) + ')'; }, acao: function () { J.abrirModal(new BSI.Caderno()); } },
        { txt: 'Ver o mapa', acao: function () { BSI.minimapa.abrir(J.mundo); } },
        { txt: 'Opções (luz, minimapa, teclas, som)', acao: function () { BSI.opcoes.abrir(J.pausa); } },
        { txt: 'Voltar à última fogueira', acao: function () { J.fecharModal(); J.voltarCheckpoint('Voltando pra fogueira...'); } },
        { txt: 'Salvar e sair pro título', acao: function () { J.fecharModal(); J.fadeOut(function () { J.mundo = null; J.criarMenuTitulo(); }); } }
      ], { y: function () { return Math.round(BSI.view.h * 0.3); }, larg: 190, alt: 14 });
      return {
        atualizar: function () {
          if (BSI.input.apertou('pausa')) { J.fecharModal(); return; }
          m.atualizar();
        },
        desenhar: function (g) {
          g.fillStyle = 'rgba(10,6,20,0.82)'; g.fillRect(0, 0, BSI.view.w, BSI.view.h);
          m.desenhar(g);
          // medidores
          var S = BSI.state, y = Math.round(BSI.view.h * 0.3) + 6 * 14 + 14, x = BSI.view.w / 2 - 70;
          [['raiva', '#7ab04a'], ['desconfianca', '#c45a8a'], ['juizo', '#6a9ae0']].forEach(function (md, i) {
            BSI.hud.barra(g, x + 60, y + i * 10 + 2, 80, 6, S.medidores[md[0]] / 100, md[1]);
          });
        },
        desenharTexto: function () {
          var W = BSI.view.w, S = BSI.state;
          Tx.escrever('PAUSA', W / 2, Math.round(BSI.view.h * 0.3) - 22, { tam: 14, alinhar: 'center', cordel: true, cor: C.amarelo });
          m.desenharTexto();
          var y = Math.round(BSI.view.h * 0.3) + 6 * 14 + 14, x = W / 2 - 70;
          ['Raiva da Caipora', 'Desconfiança', 'Juízo do grupo'].forEach(function (t, i) {
            Tx.escrever(t, x + 56, y + i * 10, { tam: 6.5, alinhar: 'right' });
          });
          var st = S.stats;
          Tx.escrever('Caças: ' + (st.cacas || 0) + '   Jagunços: ' + (st.abates || 0) + '   Excessos: ' + (st.excessos || 0) + '   Golpes de web namorada: ' + (st.golpes || 0), W / 2, y + 34, { tam: 6, alinhar: 'center', cor: '#d8cdb0' });
          if (S.objetivo) Tx.quebrar('Objetivo: ' + S.objetivo, W - 30, 6.5).forEach(function (l, i) { Tx.escrever(l, W / 2, y + 52 + i * 8, { tam: 6.5, alinhar: 'center', cor: C.amarelo }); });
          var tm = Math.floor(S.tempo / 60);
          Tx.escrever('Tempo de jogo: ' + tm + ' min', W / 2, y + 43, { tam: 6, alinhar: 'center', cor: '#d8cdb0' });
        }
      };
    },

    // ---------------- partida ----------------
    novoJogo: function () {
      BSI.story.novoJogo();
      if (J.proximoNome) { BSI.state._nomeNovo = J.proximoNome; J.proximoNome = null; }
      BSI.hud.limpar();
      BSI.fases.iniciar(BSI.data.ordemFases[0]);
    },
    continuar: function (slot, anterior) {
      if (slot) BSI.save.usarSlot(slot);
      var s = anterior ? BSI.save.carregarAnterior(BSI.save.slotAtual()) : BSI.save.carregarJogo();
      if (!s) { BSI.hud.aviso('Esse save não pôde ser carregado.', '#ff9a7a'); return; }
      s = U.clonar(s); delete s._meta;
      J.fadeOut(function () {
        BSI.story.carregar(s);
        BSI.hud.limpar();
        J.snapshot = U.clonar(BSI.state);
        J.recriarMundo(s.checkpoint.mapa, s.checkpoint);
        J.cena = 'jogo';
        BSI.hud.aviso('Continuando de ' + J.mundo.dados.nome);
      });
    },
    recriarMundo: function (mapaId, chegada) {
      BSI.state.mapa = mapaId;
      J.mundo = new BSI.Mundo(mapaId, chegada);
    },
    salvar: function () {
      J.snapshot = U.clonar(BSI.state);
      BSI.save.salvarJogo(J.snapshot);
    },

    trocarMapa: function (id, chegada) {
      if (J.trocando) return;
      J.trocando = true;
      J.fadeOut(function () {
        J.trocando = false;
        var S = BSI.state, antigos = J.mundo ? J.mundo.herois : null;
        if (antigos) antigos.forEach(function (h) { if (h.caido) h.reviver(2); }); // caído volta no checkpoint
        S.mapa = id;
        J.mundo = new BSI.Mundo(id, chegada, antigos);
        // a entrada de cada mapa é um checkpoint
        S.checkpoint = { mapa: id, x: chegada.x, y: chegada.y, chave: 'entrada:' + id };
        S.vidas = {};
        J.mundo.herois.forEach(function (h) { S.vidas[h.id] = h.vida; });
        J.salvar();
        BSI.hud.aviso(J.mundo.dados.nome);
      });
    },

    todosCairam: function () {
      if (J.voltando) return;
      J.voltarCheckpoint('Todo mundo caiu... voltando pra fogueira.');
    },
    voltarCheckpoint: function (msg) {
      J.voltando = true;
      BSI.roteiro.parar();
      J.modal = null;
      BSI.hud.aviso(msg, '#ff9a7a');
      J.fadeOut(function () {
        J.voltando = false;
        BSI.state = U.clonar(J.snapshot || BSI.state);
        BSI.state.vidas = {};  // todo mundo volta com a vida cheia
        var cp = BSI.state.checkpoint;
        J.recriarMundo(cp.mapa, cp);
      }, 0.9);
    },

    conversar: function (spec, alvo) {
      var M = J.mundo;
      if (M) M.conversando = alvo;
      if (alvo && alvo.aoFalar) alvo.aoFalar();
      BSI.dialogo.iniciar(spec, M, function () { if (M) M.conversando = null; });
    },

    abrirModal: function (m) { J.modal = m; },
    fecharModal: function () { J.modal = null; },

    // ---------------- escurecer / clarear ----------------
    fadeOut: function (cb, espera) {
      J.fade.alvo = 1;
      J.fade.espera = espera || 0.05;   // segundos de tela preta depois do cb
      J.fade.cb = cb;
    },

    // ---------------- laço ----------------
    atualizar: function (dt) {
      var I = BSI.input;
      I.comecarPasso();
      if (I.apertou('debug')) BSI.debug.alternar();
      BSI.hud.atualizar(dt);

      // fade
      var f = J.fade;
      if (f.a !== f.alvo) f.a = f.alvo > f.a ? Math.min(f.alvo, f.a + dt * 4) : Math.max(f.alvo, f.a - dt * 3);
      // tela totalmente preta: executa o que estava esperando (vale também se já estava preta)
      if (f.a === 1 && f.alvo === 1) {
        if (f.cb) { var cb = f.cb; f.cb = null; cb(); }
        else { f.espera -= dt; if (f.espera <= 0) f.alvo = 0; }
      }
      var bloqueado = f.alvo === 1;
      // dicas de controle (antes de tudo: vê a tecla antes de a pausa abrir)
      if (BSI.tutorial && J.cena === 'jogo' && J.mundo && !bloqueado) BSI.tutorial.atualizar(dt, J.mundo);
      if (BSI.conquistas && J.cena === 'jogo' && J.mundo) BSI.conquistas.atualizar(dt);

      if (J.cena === 'titulo') {
        J.tTitulo += dt;
        if (!bloqueado) { if (J.modal) J.modal.atualizar(dt); else J.menuTitulo.atualizar(); }
      } else if (J.cena === 'jogo' && J.mundo && !bloqueado) {
        if (J.modal) J.modal.atualizar(dt);
        else if (BSI.dialogo.ativo) BSI.dialogbox.atualizar(dt);
        else if (I.apertou('pausa') && !BSI.roteiro.emCena()) J.abrirModal(J.pausa());
        else {
          BSI.roteiro.atualizar(dt);
          if (J.mundo && !J.modal && !BSI.dialogo.ativo) {
            J.mundo.atualizar(dt);
            var fase = BSI.fases.atual();
            if (fase && fase.verificar && !BSI.roteiro.ativo && J.fade.alvo === 0) fase.verificar(J.mundo);
          }
        }
      }

      // trilha sonora: título, mapa, chefe, perseguição, créditos
      if (BSI.musica) {
        var nomeModal = J.modal && J.modal.constructor && J.modal.constructor.name;
        if (nomeModal === 'Creditos' || nomeModal === 'Estatisticas') BSI.musica.desejada = 'creditos';
        else if (J.cena === 'titulo') { BSI.musica.desejada = 'titulo'; BSI.musica.ambiente.desejado = null; }
        else if (J.mundo) BSI.musica.escolher(J.mundo);
        try { BSI.musica.atualizar(); } catch (e) { }
      }
      if (BSI.cordel) BSI.cordel.atualizarCursor();
      J.tDebug -= dt;
      if (J.tDebug <= 0) { J.tDebug = 0.5; BSI.debug.sincronizar(); }
      I.terminarPasso();
    },

    desenhar: function () {
      var g = BSI.ctx, W = BSI.view.w, H = BSI.view.h;
      g.setTransform(BSI.view.det, 0, 0, BSI.view.det, 0, 0); // tudo continua em pixels virtuais
      g.imageSmoothingEnabled = false;
      Tx.comecar();
      if (J.cena === 'titulo') {
        BSI.telas.fundoTitulo(g, J.tTitulo);
        var mw = Math.min(W - 20, 250), mx = Math.round(W / 2 - mw / 2), my = Math.round(H * 0.08);
        var t1 = Math.round(Math.min(30, mw / 6)), t2 = Math.round(Math.min(14, mw / 15));
        var yA = my + 9, yB = yA + 10, yC = yB + t1 + 3, yD = yC + t2 + 4;
        var mh = yD + 14 - my;
        BSI.telas.moldura(g, mx, my, mw, mh);
        var cheia = J.modal && J.modal.telaCheia; // tela cheia (opções, créditos...) esconde o título
        if (!cheia) J.menuTitulo.desenhar(g);
        if (J.modal) J.modal.desenhar(g);
        // textos
        if (!cheia) {
        Tx.escrever('— A —', W / 2, yA, { tam: 8, alinhar: 'center', cordel: true, cor: C.contorno, contorno: false });
        Tx.escrever('BOTIJA', W / 2, yB, { tam: t1, alinhar: 'center', cordel: true, cor: C.barro, corContorno: C.contorno, grossura: 3 });
        Tx.escrever('DE SANTA ISABEL', W / 2, yC, { tam: t2, alinhar: 'center', cordel: true, cor: C.contorno, contorno: false });
        Tx.escrever('uma aventura do sertão', W / 2, yD, { tam: 6, alinhar: 'center', cor: '#5a4030', contorno: false, negrito: false });
        J.menuTitulo.desenharTexto();
        Tx.escrever('v' + BSI.cfg.VERSAO, W - 4, H - 8, { tam: 5, alinhar: 'right', cor: '#8a7a70', contorno: false });
        }
        if (J.modal) J.modal.desenharTexto();
      } else if (J.mundo) {
        J.mundo.desenhar(g);
        BSI.debug.desenharHitbox(g, J.mundo);
        BSI.hud.desenhar(g, J.mundo);
        BSI.dialogbox.desenhar(g);
        if (J.modal) J.modal.desenhar(g);
        if (!(J.modal && J.modal.telaCheia)) BSI.hud.desenharTexto(J.mundo); // tela cheia esconde o HUD
        BSI.dialogbox.desenharTexto();
        if (J.modal) J.modal.desenharTexto();
      }
      // fade por cima de tudo (inclusive texto)
      if (J.fade.a > 0) {
        var u = BSI.uctx;
        if (BSI.cordel && J.fade.a < 0.999) BSI.cordel.pagina(u, W, H, J.fade.a); // página de cordel virando
        else { u.globalAlpha = J.fade.a; u.fillStyle = '#0b0812'; u.fillRect(0, 0, W, H); u.globalAlpha = 1; }
      }
    }
  };

  // inicia quando a página carregar
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', J.init);
  else J.init();
})();
