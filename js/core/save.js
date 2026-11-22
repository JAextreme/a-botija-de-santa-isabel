/* =========================================================
   save.js — salvamento em localStorage, sempre com try/catch
   (aba anônima, armazenamento bloqueado ou cheio não podem
   quebrar o jogo: ele só deixa de salvar).
   ========================================================= */
(function () {
  'use strict';
  var cfgCache = null;

  var CHAVE_SAVE = 'bsi.save.v1';
  var CHAVE_CFG = 'bsi.cfg.v1';
  var memoria = {}; // reserva caso o localStorage não exista

  function ler(chave) {
    try {
      var txt = window.localStorage.getItem(chave);
      return txt ? JSON.parse(txt) : null;
    } catch (e) {
      return memoria[chave] || null;
    }
  }
  function gravar(chave, valor) {
    memoria[chave] = valor;
    try {
      window.localStorage.setItem(chave, JSON.stringify(valor));
      return true;
    } catch (e) {
      return false;
    }
  }
  function apagar(chave) {
    delete memoria[chave];
    try { window.localStorage.removeItem(chave); } catch (e) { /* nada */ }
  }

  BSI.save = {
    temJogo: function () { return !!ler(CHAVE_SAVE); },
    carregarJogo: function () { return ler(CHAVE_SAVE); },
    salvarJogo: function (estado) { return gravar(CHAVE_SAVE, estado); },
    apagarJogo: function () { apagar(CHAVE_SAVE); },

    // preferências (som, volume, opções, teclas). UM objeto só, guardado em
    // memória: todo mundo mexe no mesmo e quem salva não apaga o dos outros.
    cfg: function () {
      if (cfgCache) return cfgCache;
      var c = ler(CHAVE_CFG) || {};
      if (typeof c.volume !== 'number') c.volume = 0.7;
      if (typeof c.mudo !== 'boolean') c.mudo = false;
      return (cfgCache = c);
    },
    salvarCfg: function (c) {
      var atual = BSI.save.cfg();
      if (c && c !== atual) for (var k in c) atual[k] = c[k];
      gravar(CHAVE_CFG, atual);
    }
  };
})();
