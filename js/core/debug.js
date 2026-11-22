/* =========================================================
   debug.js — MODO DEBUG (F1, Select do gamepad, ou ?debug=1)
   Invencível, hitboxes, sem recarga, munição infinita, luz total,
   mexer nos medidores, ir para qualquer mapa, trocar o grupo,
   forçar o efeito do "TIRAR O EXCESSO!", ver o segredo sorteado.
   ========================================================= */
(function () {
  'use strict';

  var D = BSI.debug = {
    ativo: false,
    op: { invencivel: false, hitbox: false, semRecarga: false, municaoInfinita: false, luzTotal: false },
    painel: null,

    init: function () {
      D.painel = document.getElementById('debug-painel');
      if (BSI.params.debug) D.alternar(true);
    },

    alternar: function (forcar) {
      D.ativo = forcar === undefined ? !D.ativo : forcar;
      if (D.ativo) D.montar();
      D.painel.classList.toggle('escondido', !D.ativo);
    },

    montar: function () {
      var P = D.painel, h = '';
      h += '<h3>DEBUG — Botija v' + BSI.cfg.VERSAO + '</h3>';
      h += '<div class="grade">';
      [['invencivel', 'Invencível'], ['hitbox', 'Hitboxes'], ['semRecarga', 'Sem recarga'], ['municaoInfinita', 'Munição infinita'], ['luzTotal', 'Luz total']].forEach(function (o) {
        h += '<label><input type="checkbox" data-op="' + o[0] + '"' + (D.op[o[0]] ? ' checked' : '') + '> ' + o[1] + '</label>';
      });
      h += '</div>';
      h += '<h3>Medidores</h3>';
      ['raiva', 'desconfianca', 'juizo'].forEach(function (m) {
        h += '<div class="linha"><span style="width:90px">' + BSI.data.medidores[m].nome.replace(' no grupo', '').replace(' do grupo', '') + '</span><input type="range" min="0" max="100" data-med="' + m + '"><span data-medv="' + m + '"></span></div>';
      });
      h += '<h3>Pular para fase</h3><div class="linha"><select data-fase>';
      BSI.data.ordemFases.forEach(function (k) { var f = BSI.data.fases[k]; h += '<option value="' + k + '">' + f.ato + ' — ' + f.titulo + '</option>'; });
      h += '</select><button data-acao="irFase">Ir</button></div>';
      h += '<div class="linha"><button data-acao="arsenal">ARSENAL</button><button data-acao="campoTiro">Campo de tiro</button><select data-arena>' + Object.keys(BSI.data.inimigos).concat(Object.keys(BSI.chefes || {}).map(function (c) { return 'chefe:' + c; })).map(function (k) { return '<option>' + k + '</option>'; }).join('') + '</select><button data-acao="arena">Arena</button></div>';
      h += '<div class="linha"><button data-acao="poder">Poder 100%</button><button data-acao="boss">Boss: -1 fase</button><button data-acao="raiva">Raiva 75</button></div>';
      h += '<h3>Ir para mapa</h3><div class="linha"><select data-mapa>';
      Object.keys(BSI.data.maps).forEach(function (k) { h += '<option value="' + k + '">' + BSI.data.maps[k].nome + '</option>'; });
      h += '</select><button data-acao="irMapa">Ir</button></div>';
      h += '<h3>Grupo ativo</h3><div class="grade">';
      BSI.data.ordemPersonagens.forEach(function (id) {
        h += '<label><input type="checkbox" data-pj="' + id + '"> ' + BSI.data.personagens[id].curto + '</label>';
      });
      h += '</div><div class="linha"><button data-acao="grupo">Aplicar grupo</button></div>';
      h += '<h3>Tirar o excesso (forçar)</h3><div class="linha"><select data-excesso><option value="">(sorteio)</option>';
      BSI.excesso.tabela.forEach(function (e) { h += '<option value="' + e.id + '">' + e.nome + '</option>'; });
      h += '</select></div>';
      h += '<h3>Ações</h3><div class="linha">';
      h += '<button data-acao="municao">+20 munição</button><button data-acao="curar">Curar/reviver</button>';
      h += '<button data-acao="matar">Matar inimigos</button><button data-acao="web">Web namorada</button>';
      h += '<button data-acao="pilha">Pilha 10%</button><button data-acao="apagarSave">Apagar save</button>';
      h += '</div><div class="info" data-info></div>';
      h += '<div class="linha"><button data-acao="galeria">Galeria</button><button data-acao="fechar">Fechar (F1)</button></div>';
      P.innerHTML = h;

      P.querySelectorAll('[data-op]').forEach(function (c) {
        c.addEventListener('change', function () { D.op[c.getAttribute('data-op')] = c.checked; });
      });
      P.querySelectorAll('[data-med]').forEach(function (r) {
        r.addEventListener('input', function () {
          if (!BSI.state) return;
          BSI.state.medidores[r.getAttribute('data-med')] = +r.value;
        });
      });
      P.querySelector('[data-excesso]').addEventListener('change', function (e) { BSI.excesso.forcado = e.target.value || null; });
      P.querySelectorAll('[data-acao]').forEach(function (b) {
        b.addEventListener('click', function () { D.acao(b.getAttribute('data-acao')); });
      });
      // evita que teclas no painel mexam o jogo
      P.addEventListener('keydown', function (e) { e.stopPropagation(); });
      D.sincronizar();
    },

    // atualiza valores mostrados no painel
    sincronizar: function () {
      if (!D.ativo || !D.painel || !BSI.state) return;
      var S = BSI.state, P = D.painel;
      P.querySelectorAll('[data-med]').forEach(function (r) {
        var m = r.getAttribute('data-med');
        if (document.activeElement !== r) r.value = S.medidores[m];
        var v = P.querySelector('[data-medv="' + m + '"]'); if (v) v.textContent = Math.round(S.medidores[m]);
      });
      P.querySelectorAll('[data-pj]').forEach(function (c) {
        if (!c._mexido) c.checked = S.grupo.indexOf(c.getAttribute('data-pj')) >= 0;
        c.onchange = function () { c._mexido = true; };
      });
      var info = P.querySelector('[data-info]');
      var M = BSI.jogo && BSI.jogo.mundo;
      if (info) {
        var seg = BSI.data.segredos.filter(function (s) { return s.id === S.segredo; })[0];
        info.textContent =
          'FPS: ' + BSI.loop.fps + '   tela: ' + BSI.view.w + 'x' + BSI.view.h + ' x' + BSI.view.s + '  detalhe ' + BSI.view.det + 'x  gráficos ' + BSI.view.qualidade + '\n' +
          'Mapa: ' + (M ? M.mapa.id : '-') + '   inimigos: ' + (M ? M.inimigos.length : 0) + '   fogo: ' + (M ? M.fogo.n : 0) + '\n' +
          'Segredo: ' + (seg ? seg.id : '?') + '\n' +
          'Flags: ' + Object.keys(S.flags).filter(function (k) { return S.flags[k]; }).join(', ') + '\n' +
          'Stats: ' + JSON.stringify(S.stats);
      }
    },

    acao: function (a) {
      var M = BSI.jogo && BSI.jogo.mundo, S = BSI.state;
      if (a === 'fechar') { D.alternar(false); return; }
      if (a === 'galeria') { D.alternar(false); BSI.galeria.abrir(); return; }
      if (a === 'apagarSave') { BSI.save.apagarJogo(); BSI.hud.aviso('Save apagado'); return; }
      if (a === 'irFase') {
        if (!BSI.state) BSI.story.novoJogo();
        // fases depois do prólogo assumem que o prólogo aconteceu
        var fid = D.painel.querySelector('[data-fase]').value, idx = BSI.fases.indice(fid);
        if (idx >= 1) ['pegou_espingardas', 'pegou_cartucheira', 'chamou_cachorros', 'prologo_pronto', 'botija_assumida'].forEach(function (f) { BSI.story.flag(f); });
        if (idx >= 2) ['subiu_alto', 'ato1_pode_descer'].forEach(function (f) { BSI.story.flag(f); });
        if (idx >= 3) ['porteira_aberta', 'paulo_aliado', 'paulo_respeitado', 'ato1_completo'].forEach(function (f) { BSI.story.flag(f); });
        if (idx >= 4) ['pipoca_feita', 'alma_luta', 'alma_derrotada'].forEach(function (f) { BSI.story.flag(f); });
        if (idx >= 5) ['miguel_confessou', 'tia_zane_respeitada'].forEach(function (f) { BSI.story.flag(f); });
        if (idx >= 6) ['falou_stelo', 'jc_amigos', 'gojoba_luta', 'gojoba_vencido', 'gojoba_bem_tratado', 'mapa_tapera'].forEach(function (f) { BSI.story.flag(f); });
        if (idx >= 8) ['gerador_sabotado', 'ritual_tribo'].forEach(function (f) { BSI.story.flag(f); });
        if (idx >= 7) ['gadernal_luta', 'diazepan_achado', 'gadernal_calmo', 'irmaos_revelados', 'irmaos_unidos', 'botija_achada', 'botija_roubada', 'ato2_completo'].forEach(function (f) { BSI.story.flag(f); });
        BSI.hud.limpar();
        BSI.fases.iniciar(fid);
        return;
      }
      if (!S) return;
      if (a === 'poder') S.poder = 100;
      if (a === 'raiva') BSI.story.medidor('raiva', 75 - S.medidores.raiva);
      if (a === 'boss' && M && M.chefe && M.chefe.livre && M.chefe.livre()) M.chefe.levarDano(999, M, null, 'debug');
      if (a === 'irMapa') {
        var id = D.painel.querySelector('[data-mapa]').value;
        BSI.jogo.trocarMapa(id, BSI.data.maps[id].inicio);
      }
      if (a === 'grupo') {
        var ids = [];
        D.painel.querySelectorAll('[data-pj]').forEach(function (c) { if (c.checked) ids.push(c.getAttribute('data-pj')); c._mexido = false; });
        if (!ids.length) return;
        S.grupo = ids; S.lider = 0; S.vidas = {};
        if (M) BSI.jogo.recriarMundo(M.mapa.id, { x: (M.lider().x - 8) / 16, y: (M.lider().y - 10) / 16 });
      }
      if (!M) return;
      if (a === 'municao') S.municao += 20;
      if (a === 'arsenal') { // qualquer arma pra qualquer personagem: uma de cada no bornal + munição cheia
        var AR = BSI.armas, s2 = AR.garantir();
        Object.keys(BSI.config.armas).forEach(function (id) { if (!s2.inv.some(function (p) { return p.id === id; })) { var C0 = BSI.config.armas[id]; s2.inv.push({ uid: s2.proxUid++, id: id, nivel: 0, pente: C0.pente || 0 }); } });
        Object.keys(BSI.config.municoes).forEach(function (k) { AR.ganharMun(k, 999); });
        s2.sucata += 20; BSI.hud.aviso('ARSENAL: todas as armas no bornal (abra com I).');
      }
      if (a === 'campoTiro' && M) { // bonecos de palha pra testar arma
        for (var bi = 0; bi < 5; bi++) { var bp = M.mapa.pontoLivre(M.lider().x + 40 + bi * 18, M.lider().y + (bi % 2) * 20 - 10, 4, 3); M.inimigos.push(new BSI.Inimigo('boneco', bp.x, bp.y)); }
        BSI.hud.aviso('Campo de tiro: 5 bonecos de palha (não revidam).');
      }
      if (a === 'arena' && M) {
        var qual = D.painel.querySelector('[data-arena]').value, pa = M.mapa.pontoLivre(M.lider().x + 60, M.lider().y, 4, 3);
        try {
          if (qual.indexOf('chefe:') === 0) { var Ch = BSI.chefes[qual.slice(6)], ch = new Ch(pa.x, pa.y); M.chefe = ch; M.inimigos.push(ch); ch.ativo = true; if (ch.estado === 'espera' || ch.estado === 'fora' || !ch.estado) ch.estado = 'ativa'; }
          else M.inimigos.push(new BSI.Inimigo(qual, pa.x, pa.y));
          BSI.hud.aviso('Arena: ' + qual);
        } catch (er) { BSI.hud.aviso('Esse não dá pra chamar fora da fase dele: ' + er.message, '#ff9a7a'); }
      }
      if (a === 'curar') M.herois.forEach(function (h) { if (h.caido) h.reviver(6); else h.vida = h.vidaMax; });
      if (a === 'matar') M.inimigos.forEach(function (e) { if (!e.morto) e.morrer(M); });
      if (a === 'pilha') S.pilha = 10;
      if (a === 'web') {
        var hel = M.herois.filter(function (h) { return h.id === 'helano'; })[0];
        if (hel) BSI.minigames.webNamorada(hel, M); else BSI.hud.aviso('Helano não está no grupo');
      }
    },

    // desenha caixas de colisão
    desenharHitbox: function (g, mundo) {
      if (!D.op.hitbox) return;
      var cx = mundo.camera.ix(), cy = mundo.camera.iy();
      function cx_(e, cor) { g.strokeStyle = cor; g.lineWidth = 1; g.strokeRect(Math.round(e.x - e.hw - cx) + 0.5, Math.round(e.y - e.hh - cy) + 0.5, e.hw * 2, e.hh * 2); }
      mundo.herois.forEach(function (e) { cx_(e, '#7ad07a'); });
      mundo.inimigos.forEach(function (e) {
        cx_(e, '#ff5a5a');
        g.strokeStyle = 'rgba(255,90,90,0.25)';
        g.beginPath(); g.arc(Math.round(e.x - cx), Math.round(e.y - cy), e.d.visao, 0, Math.PI * 2); g.stroke();
      });
      mundo.bichos.forEach(function (e) { cx_(e, '#f0c75e'); });
      mundo.props.forEach(function (e) { cx_(e, '#6a9ae0'); });
      (mundo.dados.portas || []).forEach(function (p) { g.strokeStyle = '#d070ff'; g.strokeRect(p.x * 16 - cx + 0.5, p.y * 16 - cy + 0.5, p.w * 16, p.h * 16); });
      g.fillStyle = 'rgba(255,255,0,0.6)';
      mundo.trilha.forEach(function (p) { g.fillRect(Math.round(p.x - cx), Math.round(p.y - cy), 1, 1); });
    }
  };
})();
