/* =========================================================
   finais.js (CONTEÚDO) — os finais do jogo, em ORDEM DE PRIORIDADE:
   o primeiro cuja condição bater é o que acontece.
   Cada final tem um diálogo "final_<id>" em dialogos_ato3.js.
   ========================================================= */
(function () {
  'use strict';
  function t(f, S) { return !!S.flags[f]; }

  BSI.data.finais = [
    {
      id: 'sobrenatural', nome: 'Final Sobrenatural', frase: 'A Caipora cobrou a conta.',
      condicao: 'Raiva da Caipora no máximo (90 ou mais)',
      teste: function (S) { return S.medidores.raiva >= 90; }
    },
    {
      id: 'traicao', nome: 'Final da Traição', frase: 'Baratinha, parceiro.',
      condicao: 'Desconfiança no grupo no máximo (90 ou mais)',
      teste: function (S) { return S.medidores.desconfianca >= 90; }
    },
    {
      id: 'absurdo', nome: 'Final Absurdo', frase: 'O Stelo estava certo o tempo todo.',
      condicao: 'Acreditar em 2 ou mais fake news do Stelo',
      teste: function (S) { return (S.steloFalsas || 0) >= 2; }
    },
    {
      id: 'tragico', nome: 'Final Trágico-Cômico', frase: 'De volta ao fiado da bodega.',
      condicao: 'Vencer com o Juízo muito baixo (20 ou menos) ou com o Daniel descontrolado (fogo demais)',
      teste: function (S) { return S.medidores.juizo <= 20 || t('daniel_descontrolado', S); }
    },
    {
      id: 'heroico', nome: 'Final Heroico', frase: 'A terra é de Santa Isabel.',
      condicao: 'Botija recuperada, Raiva da Caipora baixa (menos de 50) e a Grande Fogueira acesa',
      teste: function (S) { return t('botija_recuperada', S) && S.medidores.raiva < 50 && t('grande_fogueira', S); }
    },
    {
      id: 'familia', nome: 'Final da Família Reunida', frase: 'Almoço na casa da Tia Zane.',
      condicao: 'Irmãos unidos até o fim e a Tia Zane respeitada',
      teste: function (S) { return t('irmaos_unidos', S) && t('tia_zane_respeitada', S); }
    },
    {
      id: 'meio', nome: 'Final do Meio-Termo', frase: 'Ganhamos. Mais ou menos.',
      condicao: 'Quando nenhum outro final acontece',
      teste: function () { return true; }
    }
  ];

  // quem fez o jogo (créditos)
  BSI.data.creditos = [
    ['A BOTIJA DE SANTA ISABEL', 'titulo'],
    ['uma aventura do sertão', ''],
    ['', ''],
    ['A TURMA', 'secao'],
    ['Helano "Lapuca" — o profeta', ''], ['Zé Neto — o doutor', ''], ['João Vitor "Miserável"', ''],
    ['João Luiz Amadeu', ''], ['Luiz Fernando Amadeu', ''], ['João Pedro — escapamento das 2h', ''],
    ['Davi — TIRAR O EXCESSO!', ''], ['Vander — o que aparece e some', ''], ['Miguel — artista e ladrão de carne', ''],
    ['Hugo — a gambiarra', ''], ['Daniel — o fogo', ''], ['João Carlos — a família', ''],
    ['', ''],
    ['TAMBÉM ESTRELANDO', 'secao'],
    ['Tia Zane e a chinela teleguiada', ''], ['Trovão e Piaba', ''], ['O Bode', ''], ['Stelo e o grupo do WhatsApp', ''],
    ['Paulo do Zé Baixinho e o Roma', ''], ['Gojoba e a caixa de 500 watts', ''], ['Emanuel "Gadernal"', ''],
    ['Vinícius "Diazepan" (dormindo)', ''], ['Felipe Parceiro, parceiro', ''], ['Dudu', ''],
    ['Seu Chico Vaqueiro', ''], ['Dona Socorro e o caderno do fiado', ''], ['Dona Benedita rezadeira', ''], ['Padre Anselmo', ''],
    ['Rafael CDs (fictício, como todo político deste jogo)', ''],
    ['', ''],
    ['EM MEMÓRIA', 'secao'],
    ['Tio Ota — o maior vaqueiro de Santa Isabel', ''],
    ['"Água de Deus não tem dono."', ''],
    ['', ''],
    ['ARTE EXTRA', 'secao'],
    ['Partículas e ícones de teclas: Kenney (kenney.nl), licença CC0', ''],
    ['', ''],
    ['Nenhuma música real foi tocada (as do Gojoba são ruins de propósito).', ''],
    ['Obrigado por jogar!', 'titulo']
  ];
})();
