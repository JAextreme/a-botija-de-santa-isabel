/* =========================================================
   rng.js — sorteios com semente (mulberry32)
   Usamos semente para que a partida seja reproduzível no debug
   (mesmo segredo, mesmas pistas falsas). Efeitos só visuais
   podem usar Math.random à vontade.
   ========================================================= */
(function () {
  'use strict';

  function RNG(semente) {
    this.s = (semente >>> 0) || 1;
  }
  RNG.prototype.next = function () {
    var t = (this.s += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  // número real entre a e b
  RNG.prototype.range = function (a, b) { return a + (b - a) * this.next(); };
  // inteiro entre a e b (inclusive)
  RNG.prototype.int = function (a, b) { return a + Math.floor(this.next() * (b - a + 1)); };
  // verdadeiro com probabilidade p (0 a 1)
  RNG.prototype.chance = function (p) { return this.next() < p; };
  // escolhe um item do array
  RNG.prototype.pick = function (arr) { return arr[Math.floor(this.next() * arr.length)]; };
  // escolhe com pesos: [{peso: 3, ...}, ...]
  RNG.prototype.pickPeso = function (arr) {
    var total = 0, i;
    for (i = 0; i < arr.length; i++) total += arr[i].peso || 1;
    var r = this.next() * total;
    for (i = 0; i < arr.length; i++) { r -= arr[i].peso || 1; if (r <= 0) return arr[i]; }
    return arr[arr.length - 1];
  };

  BSI.RNG = RNG;
  // sorteador global da jogabilidade (re-semeado no novo jogo / ao carregar)
  BSI.rng = new RNG(Date.now() & 0xffffffff);
})();
