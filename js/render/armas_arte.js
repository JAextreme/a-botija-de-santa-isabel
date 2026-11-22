/* =========================================================
   armas_arte.js — desenho (em 2x) de cada arma do arsenal,
   apontando pra direita. px/py = onde a mão segura.
   Serve pra mão do boneco, pro chão e pros ícones.
   ========================================================= */
(function () {
  'use strict';
  var A = BSI.boneco.ARMAS, t = BSI.boneco.tons;
  var mad = t('#7a4a26'), fe = t('#5a5f66'), co = t('#8a5a30');

  A.pressao = { w: 26, h: 8, px: 7, py: 4, pintar: function (P) {
    P.r(0, 3, 8, 4, '#4a6a3a'); P.r(0, 3, 8, 1, '#6a8a5a'); P.r(8, 3, 17, 2, fe.b); P.r(8, 3, 17, 1, fe.c2); P.r(12, 5, 6, 2, '#2a2a33'); P.r(22, 2, 2, 1, fe.e2);
  } };
  A.baladeira = { w: 14, h: 14, px: 3, py: 10, pintar: function (P) {
    P.r(2, 7, 3, 7, mad.b); P.r(2, 7, 1, 7, mad.c); P.r(0, 1, 3, 7, mad.b); P.r(5, 1, 3, 7, mad.e); P.r(1, 5, 6, 3, mad.b);
    P.r(0, 1, 1, 1, '#c03030'); P.r(7, 1, 1, 1, '#c03030'); P.r(1, 2, 13, 1, '#3a2a2a'); P.r(12, 1, 2, 3, '#8a6a4a'); P.p(13, 2, '#c8b090');
  } };
  A.pistolaPrego = { w: 20, h: 12, px: 4, py: 7, pintar: function (P) {
    P.r(3, 6, 5, 6, '#e0a020'); P.r(3, 6, 1, 6, '#f0c050'); P.r(2, 1, 14, 6, '#e0a020'); P.r(2, 1, 14, 1, '#f8d070'); P.r(15, 3, 4, 2, fe.b); P.r(6, 3, 6, 2, '#2a2a33'); P.p(18, 3, '#c8ccd4'); P.r(8, 7, 2, 3, '#2a2a33');
  } };
  A.rojao = { w: 24, h: 8, px: 6, py: 4, pintar: function (P) {
    P.r(0, 3, 14, 2, mad.c); P.r(14, 1, 8, 6, '#c03030'); P.r(14, 1, 8, 1, '#e8504a'); P.r(16, 3, 4, 1, '#f0c75e'); P.r(22, 2, 2, 4, '#e8e0cc'); P.p(23, 1, '#f0c75e');
  } };
  A.foice = { w: 26, h: 16, px: 4, py: 12, pintar: function (P) {
    P.r(0, 11, 18, 2, mad.b); P.r(0, 11, 18, 1, mad.c);
    for (var i = 0; i < 9; i++) { P.r(16 + Math.round(Math.sin(i / 8 * 3) * 6), 2 + i, 3, 1, '#c8d0d8'); }
    P.r(18, 1, 6, 2, '#e8eef4'); P.r(22, 3, 3, 4, '#aeb6be');
  } };
  A.enxada = { w: 26, h: 12, px: 4, py: 7, pintar: function (P) {
    P.r(0, 6, 20, 2, mad.b); P.r(0, 6, 20, 1, mad.c); P.r(19, 1, 6, 11, '#7a8088'); P.r(19, 1, 6, 2, '#aeb6be'); P.r(24, 1, 1, 11, '#4a4f58'); P.p(20, 6, '#3a3a44');
  } };
  A.pa = { w: 26, h: 12, px: 4, py: 6, pintar: function (P) {
    P.r(0, 5, 17, 2, mad.b); P.r(0, 5, 17, 1, mad.c); P.r(0, 3, 2, 6, mad.e); P.r(17, 2, 8, 8, '#7a8088'); P.r(17, 2, 8, 1, '#aeb6be'); P.r(24, 3, 2, 6, '#5a5f66'); P.r(16, 4, 2, 4, '#4a4f58');
  } };
  A.relho = { w: 30, h: 10, px: 3, py: 6, pintar: function (P) {
    P.r(0, 5, 7, 3, '#5a3418'); P.r(0, 5, 7, 1, '#8a5a32');
    for (var i = 0; i < 22; i++) P.p(7 + i, 5 + Math.round(Math.sin(i / 3.5) * 2), i % 3 ? '#a8784a' : '#6a4026');
    P.r(28, 3, 2, 2, '#e8d0a0');
  } };
  A.laco = { w: 20, h: 16, px: 3, py: 8, pintar: function (P) {
    for (var a = 0; a < 26; a++) { var an = a / 26 * Math.PI * 2; P.p(12 + Math.round(Math.cos(an) * 6), 8 + Math.round(Math.sin(an) * 6), a % 2 ? '#c8a060' : '#8a6a3a'); }
    P.r(0, 7, 7, 2, '#a88050'); P.r(5, 6, 2, 4, '#6a4a2a');
  } };
  A.cadeira = { w: 18, h: 18, px: 3, py: 9, pintar: function (P) {
    P.r(2, 2, 14, 3, '#c03030'); P.r(2, 2, 14, 1, '#e8504a'); P.r(3, 5, 2, 12, '#a02020'); P.r(13, 5, 2, 12, '#a02020'); P.r(3, 9, 12, 3, '#c03030'); P.r(5, 12, 1, 5, '#801818'); P.r(12, 12, 1, 5, '#801818');
  } };
  A.tacoSinuca = { w: 32, h: 6, px: 6, py: 3, pintar: function (P) {
    P.r(0, 2, 12, 3, '#3a2418'); P.r(0, 2, 12, 1, '#5a3a22'); P.r(12, 2, 18, 2, '#d8b880'); P.r(12, 2, 18, 1, '#f0d8a0'); P.r(30, 2, 2, 2, '#3b6a8c');
  } };
  A.garrafa = { w: 8, h: 16, px: 4, py: 10, pintar: function (P) {
    P.r(1, 6, 6, 10, '#6a9a6a'); P.r(1, 6, 2, 10, '#8aba8a'); P.r(3, 0, 2, 6, '#6a9a6a'); P.r(3, 0, 2, 1, '#7a4a2a'); P.r(1, 9, 6, 4, '#f2e6c9'); P.r(2, 10, 4, 1, '#c03030');
  } };
  A.traque = { w: 10, h: 10, px: 5, py: 6, pintar: function (P) {
    P.r(1, 3, 8, 6, '#c03030'); P.r(1, 3, 8, 1, '#e8504a'); P.r(3, 5, 4, 2, '#f0c75e'); P.r(4, 0, 1, 3, '#d8cdb0'); P.p(5, 0, '#f7a733');
  } };
  A.bomba = { w: 12, h: 12, px: 6, py: 7, pintar: function (P) {
    P.r(2, 4, 8, 8, '#2a2a33'); P.r(1, 5, 10, 6, '#2a2a33'); P.r(3, 5, 3, 2, '#5a5a66'); P.r(5, 1, 2, 3, '#8a6a4a'); P.p(6, 0, '#f7a733'); P.r(3, 8, 6, 1, '#c03030');
  } };
  A.pedra = { w: 8, h: 7, px: 4, py: 4, pintar: function (P) { P.r(1, 1, 6, 5, '#8a7a6a'); P.r(0, 2, 8, 3, '#8a7a6a'); P.r(1, 1, 3, 2, '#b0a090'); P.r(5, 4, 2, 2, '#5f5248'); } };
  A.farinha = { w: 12, h: 14, px: 6, py: 8, pintar: function (P) {
    P.r(1, 3, 10, 11, '#f2ecdc'); P.r(1, 3, 2, 11, '#ffffff'); P.r(9, 3, 2, 11, '#d8cdb0'); P.r(3, 0, 6, 3, '#d8cdb0'); P.r(4, 7, 4, 3, '#3b6a8c'); P.p(5, 1, '#a88050');
  } };
  A.pimenta = { w: 12, h: 8, px: 4, py: 4, pintar: function (P) {
    P.r(2, 2, 8, 4, '#d02020'); P.r(2, 2, 8, 1, '#f05040'); P.r(9, 3, 2, 2, '#a01010'); P.r(0, 3, 2, 2, '#3a7a2a'); P.p(0, 2, '#4a9a3a');
  } };
  A.chinela = { w: 16, h: 8, px: 6, py: 4, pintar: function (P) {
    P.r(0, 2, 16, 4, '#3b8a5a'); P.r(1, 1, 14, 6, '#3b8a5a'); P.r(1, 2, 14, 1, '#5aaa7a'); P.r(4, 3, 6, 1, '#f2f0ea'); P.r(4, 4, 1, 2, '#f2f0ea'); P.r(9, 4, 1, 2, '#f2f0ea'); P.p(7, 3, '#f0c75e');
  } };
  A.caixaSom = { w: 18, h: 18, px: 6, py: 14, pintar: function (P) {
    P.r(1, 2, 16, 15, '#1e1e24'); P.r(1, 2, 16, 1, '#3a3a44'); P.r(4, 5, 10, 10, '#3a3a44'); P.r(6, 7, 6, 6, '#5a5a66'); P.r(8, 9, 2, 2, '#ff60c0'); P.r(3, 0, 12, 2, '#5a5a66'); P.p(15, 4, '#7ad07a');
  } };
  A.bracoPaulo = { w: 18, h: 14, px: 3, py: 7, pintar: function (P) {
    P.r(0, 5, 6, 5, '#a8302a'); P.r(6, 1, 11, 12, '#c84a3a'); P.r(6, 1, 11, 2, '#e86a5a'); P.r(8, 4, 2, 7, '#a8302a'); P.r(11, 4, 2, 7, '#a8302a'); P.r(14, 4, 2, 7, '#a8302a'); P.r(5, 4, 2, 7, '#f2e6c9');
  } };
  A.lampiao = { w: 12, h: 18, px: 6, py: 3, pintar: function (P) {
    P.r(4, 0, 4, 2, '#5a5f66'); P.r(2, 2, 8, 2, '#7a8088'); P.r(3, 4, 6, 8, '#fff1a8'); P.r(3, 4, 1, 8, '#ffffff'); P.r(5, 6, 2, 4, '#f7a733'); P.r(2, 12, 8, 2, '#7a8088'); P.r(1, 14, 10, 4, '#c8a040'); P.r(1, 14, 10, 1, '#e8c860');
  } };
  A.cadeira.w = 18;
})();
