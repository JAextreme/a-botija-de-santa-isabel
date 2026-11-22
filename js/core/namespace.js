/* =========================================================
   namespace.js — cria o objeto global BSI (Botija de Santa Isabel)
   Todo o jogo vive dentro de window.BSI, sem módulos ES,
   para funcionar abrindo o index.html direto (file://).
   ========================================================= */
(function () {
  'use strict';

  var BSI = window.BSI = window.BSI || {};

  // Configuração fixa do motor
  BSI.cfg = {
    TILE: 16,          // tamanho do tile em pixels virtuais
    DT: 1 / 60,        // passo fixo da física (60 Hz)
    MAX_FRAME: 0.25,   // maior "pulo" de tempo aceito num quadro (evita espiral da morte)
    VERSAO: '0.5.0-completo'
  };

  // Espaços para cada parte do jogo
  BSI.data = BSI.data || {};       // CONTEÚDO: mapas, diálogos, falas, personagens...
  BSI.data.maps = BSI.data.maps || {};
  BSI.data.dialogos = BSI.data.dialogos || {};

  // Utilidades matemáticas pequenas
  BSI.util = {
    clamp: function (v, a, b) { return v < a ? a : (v > b ? b : v); },
    lerp: function (a, b, t) { return a + (b - a) * t; },
    len: function (x, y) { return Math.sqrt(x * x + y * y); },
    dist: function (a, b) { var dx = a.x - b.x, dy = a.y - b.y; return Math.sqrt(dx * dx + dy * dy); },
    dist2: function (ax, ay, bx, by) { var dx = ax - bx, dy = ay - by; return dx * dx + dy * dy; },
    norm: function (x, y) {
      var l = Math.sqrt(x * x + y * y);
      return l > 0.00001 ? { x: x / l, y: y / l } : { x: 0, y: 0 };
    },
    // direção do sprite a partir de um vetor
    dirDe: function (x, y) {
      if (Math.abs(x) > Math.abs(y)) return x < 0 ? 'left' : 'right';
      return y < 0 ? 'up' : 'down';
    },
    // gira um vetor (usado em espalhamento de chumbo e zigue-zague)
    girar: function (x, y, ang) {
      var c = Math.cos(ang), s = Math.sin(ang);
      return { x: x * c - y * s, y: x * s + y * c };
    },
    // cópia profunda simples (estado do jogo é só JSON)
    clonar: function (o) { return JSON.parse(JSON.stringify(o)); },
    // hash determinístico de inteiros (variação de tiles)
    hash: function (x, y, s) {
      var h = (x * 374761393 + y * 668265263 + (s || 0) * 2147483647) | 0;
      h = (h ^ (h >>> 13)) * 1274126177 | 0;
      return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
    },
    agora: function () { return (window.performance && performance.now) ? performance.now() : Date.now(); }
  };

  // Lê parâmetros da URL (?debug=1)
  BSI.params = {};
  try {
    var q = (window.location && window.location.search) || '';
    q.replace(/^\?/, '').split('&').forEach(function (par) {
      if (!par) return;
      var kv = par.split('=');
      BSI.params[decodeURIComponent(kv[0])] = kv.length > 1 ? decodeURIComponent(kv[1]) : '1';
    });
  } catch (e) { /* sem URL, sem problema */ }
})();
