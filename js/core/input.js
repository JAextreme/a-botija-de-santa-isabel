/* =========================================================
   input.js — teclado, mouse e gamepad viram "ações".
   O resto do jogo só pergunta: segurando('ataque')? apertou('mapa')?
   Todas as teclas são REMAPEÁVEIS (Pausa → Opções → Controles) e o
   mapa de teclas fica salvo nas preferências.
   ========================================================= */
(function () {
  'use strict';

  // ---------------- teclas padrão (PC) ----------------
  // ação → lista de teclas (e.code). Mouse: 'Mouse0' esquerdo, 'Mouse2' direito.
  var PADRAO = {
    cima: ['KeyW', 'ArrowUp'], baixo: ['KeyS', 'ArrowDown'], esq: ['KeyA', 'ArrowLeft'], dir: ['KeyD', 'ArrowRight'],
    correr: ['ShiftLeft', 'ShiftRight'],
    ataque: ['Mouse0', 'KeyJ'],
    mira: ['Mouse2'],
    interagir: ['KeyE', 'Space'],
    habilidade: ['KeyF'],
    poder: ['KeyG'],
    proximo: ['KeyQ', 'Tab'],
    anterior: [],                     // Shift+Tab também volta
    ordem: ['KeyT'],
    mapa: ['KeyM'],
    recarregar: ['KeyR'], esquiva: ['KeyC'], equipamento: ['KeyI'], travar: ['KeyX'], rodaArmas: ['KeyZ'],
    hab1: ['Digit1'], hab2: ['Digit2'], hab3: ['Digit3'], hab4: ['Digit4'], hab5: ['Digit5'], hab6: ['Digit6'],
    confirmar: ['Enter', 'NumpadEnter'],
    pausa: ['Escape', 'KeyP'],
    debug: ['F1']
  };
  // nome bonito de cada ação (tela de controles)
  var NOMES = {
    cima: 'Andar pra cima', baixo: 'Andar pra baixo', esq: 'Andar pra esquerda', dir: 'Andar pra direita', correr: 'Correr',
    ataque: 'Atacar / atirar', mira: 'Mira de precisão', interagir: 'Interagir / falar', habilidade: 'Habilidade',
    poder: 'Poder de grupo', proximo: 'Trocar personagem', ordem: 'Ordem pro grupo', mapa: 'Mapa completo',
    recarregar: 'Recarregar', esquiva: 'Esquiva', equipamento: 'Equipamento', travar: 'Trava de alvo', rodaArmas: 'Roda de armas',
    hab1: 'Habilidade do 1º', hab2: 'Habilidade do 2º', hab3: 'Habilidade do 3º', hab4: 'Habilidade do 4º', hab5: 'Habilidade do 5º', hab6: 'Habilidade do 6º',
    pausa: 'Pausa'
  };
  var REMAPEAVEIS = ['cima', 'baixo', 'esq', 'dir', 'correr', 'ataque', 'mira', 'interagir', 'habilidade', 'poder', 'proximo', 'ordem', 'mapa', 'recarregar', 'esquiva', 'equipamento', 'travar', 'rodaArmas', 'hab1', 'hab2', 'hab3', 'hab4', 'hab5', 'hab6', 'pausa'];
  var IMPEDIR = { Space: 1, ArrowUp: 1, ArrowDown: 1, ArrowLeft: 1, ArrowRight: 1, F1: 1, Tab: 1 };

  var mapa = {};          // ação → [códigos]
  var porTecla = {};      // código → [ações]
  var segura = {};        // segura[acao] = {fonte: bool}
  var fila = {}, apertado = {};
  var stick = { x: 0, y: 0 }, padStick = { x: 0, y: 0 }, padAntes = {}, stickAntes = { x: 0, y: 0 };
  var capturando = null;  // remapeamento: função que recebe a próxima tecla

  function montarIndice() {
    porTecla = {};
    Object.keys(mapa).forEach(function (a) { mapa[a].forEach(function (c) { (porTecla[c] = porTecla[c] || []).push(a); }); });
  }
  function marcar(acao, fonte, valor) {
    if (!segura[acao]) segura[acao] = {};
    var antes = estaSegura(acao);
    segura[acao][fonte] = valor;
    if (valor && !antes) fila[acao] = true;
  }
  function estaSegura(acao) {
    var s = segura[acao];
    if (!s) return false;
    for (var k in s) if (s[k]) return true;
    return false;
  }
  function tecla(code, valor, shift) {
    var acoes = porTecla[code] || [];
    if (code === 'Tab' && shift && valor) { fila.anterior = true; return; }
    acoes.forEach(function (a) { marcar(a, 'k:' + code, valor); });
  }

  var Input = {
    ultimoDispositivo: 'teclado',  // 'teclado' | 'pad' | 'toque'
    toque: null,                   // clique/toque no jogo em coordenadas virtuais {x,y}
    deslize: null,
    doido: { inverter: false, tremor: 0 },
    mouse: { x: 0, y: 0, dentro: false, roda: 0, arrasto: null, arrastoAntes: null, segurando: false },
    PADRAO: PADRAO, NOMES: NOMES, REMAPEAVEIS: REMAPEAVEIS,

    init: function () {
      Input.carregarMapa();
      window.addEventListener('keydown', function (e) {
        if (IMPEDIR[e.code]) e.preventDefault();
        BSI.audio.destravar();
        Input.ultimoDispositivo = 'teclado';
        if (capturando) { e.preventDefault(); var cb = capturando; capturando = null; cb(e.code); return; }
        if (!e.repeat) tecla(e.code, true, e.shiftKey);
      });
      window.addEventListener('keyup', function (e) { tecla(e.code, false); });
      window.addEventListener('blur', function () { for (var k in segura) segura[k] = {}; stick.x = stick.y = 0; });
      window.addEventListener('gamepadconnected', function () { Input.ultimoDispositivo = 'pad'; });

      // ---- mouse ----
      var palco = document.getElementById('palco');
      function pos(e) { var v = BSI.view.paraVirtual(e.clientX, e.clientY); Input.mouse.x = v.x; Input.mouse.y = v.y; Input.mouse.dentro = v.x >= 0 && v.y >= 0 && v.x <= BSI.view.w && v.y <= BSI.view.h; }
      window.addEventListener('mousemove', function (e) {
        pos(e);
        if (Input.mouse.segurando) { Input.mouse.arrasto = { x: Input.mouse.x, y: Input.mouse.y }; }
      });
      window.addEventListener('mousedown', function (e) {
        pos(e);
        BSI.audio.destravar();
        if (capturando) { e.preventDefault(); var cb = capturando; capturando = null; cb('Mouse' + e.button); return; }
        if (!Input.mouse.dentro) return;
        Input.ultimoDispositivo = 'teclado';
        if (e.button === 0) { Input.toqueTela(Input.mouse.x, Input.mouse.y); Input.mouse.segurando = true; Input.mouse.arrastoAntes = { x: Input.mouse.x, y: Input.mouse.y }; Input.mouse.arrasto = { x: Input.mouse.x, y: Input.mouse.y }; }
        tecla('Mouse' + e.button, true);
      });
      window.addEventListener('mouseup', function (e) { tecla('Mouse' + e.button, false); if (e.button === 0) { Input.mouse.segurando = false; Input.mouse.arrasto = null; } });
      if (palco) palco.addEventListener('contextmenu', function (e) { e.preventDefault(); });
      window.addEventListener('wheel', function (e) { if (Input.mouse.dentro) { Input.mouse.roda += e.deltaY > 0 ? 1 : -1; } }, { passive: true });
    },

    // ---------------- mapa de teclas ----------------
    carregarMapa: function () {
      var cfg = BSI.save.cfg(), salvo = cfg.teclas || {};
      mapa = {};
      Object.keys(PADRAO).forEach(function (a) { mapa[a] = (salvo[a] || PADRAO[a]).slice(); });
      montarIndice();
    },
    salvarMapa: function () {
      var cfg = BSI.save.cfg(); cfg.teclas = {};
      REMAPEAVEIS.forEach(function (a) { cfg.teclas[a] = mapa[a].slice(); });
      BSI.save.salvarCfg(cfg);
    },
    restaurarPadrao: function () { var cfg = BSI.save.cfg(); delete cfg.teclas; BSI.save.salvarCfg(cfg); Input.carregarMapa(); },
    teclasDe: function (a) { return (mapa[a] || []).slice(); },
    // troca a tecla principal de uma ação (a anterior vira secundária)
    remapear: function (a, code) {
      Object.keys(mapa).forEach(function (o) { if (o !== a) mapa[o] = mapa[o].filter(function (c) { return c !== code; }); }); // tira de quem usava
      var l = mapa[a].filter(function (c) { return c !== code; });
      mapa[a] = [code].concat(l.slice(0, 1));
      montarIndice(); Input.salvarMapa();
    },
    capturarProxima: function (cb) { capturando = cb; },
    capturandoTecla: function () { return !!capturando; },
    // nome curto de uma tecla pra mostrar na tela: [E], [F], [Clique]
    nomeTecla: function (code) {
      if (!code) return '—';
      var esp = { Mouse0: 'Clique', Mouse2: 'Clique dir.', Mouse1: 'Botão do meio', Space: 'Espaço', ShiftLeft: 'Shift', ShiftRight: 'Shift dir.', Escape: 'Esc', Enter: 'Enter', Tab: 'Tab', ArrowUp: '↑', ArrowDown: '↓', ArrowLeft: '←', ArrowRight: '→', ControlLeft: 'Ctrl', AltLeft: 'Alt' };
      if (esp[code]) return esp[code];
      if (/^Key/.test(code)) return code.slice(3);
      if (/^Digit/.test(code)) return code.slice(5);
      if (/^Numpad/.test(code)) return 'Num ' + code.slice(6);
      return code;
    },
    rotulo: function (acao) {
      if (Input.ultimoDispositivo === 'pad') return ({ ataque: 'A', habilidade: 'X', poder: 'Y', interagir: 'B', proximo: 'RB', mapa: 'Back', pausa: 'Start', ordem: 'LB' })[acao] || '?';
      return Input.nomeTecla((mapa[acao] || [])[0]);
    },

    // ---------------- por passo ----------------
    comecarPasso: function () { lerGamepad(); apertado = fila; fila = {}; },
    terminarPasso: function () { Input.toque = null; Input.deslize = null; Input.mouse.roda = 0; },

    segurando: function (a) { return estaSegura(a); },
    apertou: function (a) { return !!apertado[a]; },
    consumir: function (a) { apertado[a] = false; },
    confirmou: function () { return Input.apertou('confirmar') || Input.apertou('interagir') || Input.apertou('ataque'); },

    movimento: function () {
      var x = 0, y = 0;
      if (estaSegura('esq')) x -= 1;
      if (estaSegura('dir')) x += 1;
      if (estaSegura('cima')) y -= 1;
      if (estaSegura('baixo')) y += 1;
      var correndo = estaSegura('correr');
      var l = Math.sqrt(x * x + y * y);
      if (l > 0) { x /= l; y /= l; }
      var sx = stick.x + padStick.x, sy = stick.y + padStick.y;
      var sl = Math.sqrt(sx * sx + sy * sy);
      if (sl > 0.15) {
        if (sl > 1) { sx /= sl; sy /= sl; sl = 1; }
        x = sx; y = sy;
        if (sl > 0.92) correndo = true;
      }
      if (Input.doido.inverter) { x = -x; y = -y; }
      if (Input.doido.tremor > 0 && (x || y)) { var r = BSI.util.girar(x, y, (Math.random() - 0.5) * Input.doido.tremor); x = r.x; y = r.y; }
      return { x: x, y: y, mag: Math.min(1, Math.sqrt(x * x + y * y)), correndo: correndo };
    },

    // ---------------- toque (desligado por padrão: o jogo é de PC) ----------------
    toqueSegura: function (acao, valor) { Input.ultimoDispositivo = 'toque'; marcar(acao, 'toque', valor); },
    toqueStick: function (x, y) { Input.ultimoDispositivo = 'toque'; stick.x = x; stick.y = y; gerarApertoDirecional(x, y); },
    toqueTela: function (vx, vy) { Input.toque = { x: vx, y: vy }; },
    toqueDeslize: function (dir) { Input.deslize = dir; }
  };

  function gerarApertoDirecional(x, y) {
    var L = 0.6;
    if (y < -L && stickAntes.y >= -L) fila.cima = true;
    if (y > L && stickAntes.y <= L) fila.baixo = true;
    if (x < -L && stickAntes.x >= -L) fila.esq = true;
    if (x > L && stickAntes.x <= L) fila.dir = true;
    stickAntes.x = x; stickAntes.y = y;
  }

  // Gamepad (opcional): A ataca, X habilidade, Y poder, B fala, LB ordem, RB troca, Back mapa, Start pausa
  var BOTOES_PAD = { 0: 'ataque', 2: 'habilidade', 3: 'poder', 1: 'interagir', 4: 'ordem', 5: 'proximo', 9: 'pausa', 8: 'mapa', 6: 'mira', 7: 'correr', 10: 'correr', 12: 'cima', 13: 'baixo', 14: 'esq', 15: 'dir' };
  function lerGamepad() {
    if (!navigator.getGamepads) return;
    var pads;
    try { pads = navigator.getGamepads(); } catch (e) { return; }
    var p = null;
    for (var i = 0; pads && i < pads.length; i++) if (pads[i] && pads[i].connected) { p = pads[i]; break; }
    if (!p) { padStick.x = padStick.y = 0; return; }
    var ax = p.axes[0] || 0, ay = p.axes[1] || 0;
    if (Math.abs(ax) < 0.2) ax = 0;
    if (Math.abs(ay) < 0.2) ay = 0;
    if (ax || ay) Input.ultimoDispositivo = 'pad';
    padStick.x = ax; padStick.y = ay;
    gerarApertoDirecional(ax, ay);
    var porAcao = {};
    for (var b in BOTOES_PAD) {
      var bt = p.buttons[b];
      var on = !!(bt && (bt.pressed || bt.value > 0.5));
      var acao = BOTOES_PAD[b];
      porAcao[acao] = porAcao[acao] || on;
      if (on && !padAntes[b]) Input.ultimoDispositivo = 'pad';
      padAntes[b] = on;
    }
    for (var ac in porAcao) marcar(ac, 'pad', porAcao[ac]);
  }

  BSI.input = Input;
})();
