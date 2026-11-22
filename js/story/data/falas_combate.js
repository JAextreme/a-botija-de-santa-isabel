/* =========================================================
   falas_combate.js — FALAS DE COMBATE de cada um (balão curto)
   Situações: luta (começa a briga), acerto, dano (apanhou),
   semMunicao, recarga, trocaArma, curado, habilidade, abate
   (derrubou um), caido (um amigo caiu).
   O jogo nunca repete a mesma fala duas vezes seguidas.
   {lista:lapucaFrases} etc. sorteia de data/listas.js.
   ========================================================= */
(function () {
  'use strict';
  BSI.data.falasCombate = {
    helano: {
      luta: ['Lá vem a tempestade.', 'O sertão me avisou que vinha gente.', 'Fiquem atrás do profeta.', '{lista:lapucaFrases}'],
      acerto: ['Escrito estava.', 'A bala chegou antes da dúvida.', 'Profecia cumprida.'],
      dano: ['Até o profeta sangra... de mentirinha.', 'Isso não estava na visão.', 'Ai. Anotado.'],
      semMunicao: ['Profeta sem cartucho é poeta.', 'Acabou a munição. Sobrou a sabedoria.', 'O cano tá vazio, igual promessa de político.'],
      recarga: ['Paciência é pólvora socada.', 'Um minuto de silêncio pro cartucho.', 'Recarregando a fé.'],
      trocaArma: ['Cada arma tem seu tempo.', 'Mudou o vento, mudou a arma.', 'Essa aqui fala mais alto.'],
      curado: ['Obrigado, doutor. Eu acho.', 'O corpo agradece. A alma desconfia.'],
      habilidade: ['O tempo é do sertão.', 'Respira... e vai.', '{lista:lapucaFrases}'],
      abate: ['Vai em paz, cabra.', 'Menos um no caminho da botija.', 'Ele não viu o futuro.'],
      caido: ['Levanta, que a profecia precisa de tu!', 'Não é tua hora, irmão!', 'Zé Neto! Gente no chão!']
    },
    zeneto: {
      luta: ['Ninguém se machuca, que eu desmaio!', 'Tô com a maleta, tô com a maleta!', 'Prevenção é não brigar. Tarde demais.'],
      acerto: ['Toma uma injeção de maleta!', 'Diagnóstico: levou uma.', 'Pancada terapêutica!'],
      dano: ['Ai! Isso é traumatismo! Ou é só susto?', 'Me deem um boldo!', 'Vou anotar no prontuário: doeu.'],
      semMunicao: ['Acabou! Receita vencida!', 'Sem munição. Prescrevo correr.'],
      recarga: ['Dosagem nova chegando.', 'Pera que eu tô medindo a dose.'],
      trocaArma: ['Troca de medicação!', 'Esse aqui é de uso tópico.'],
      curado: ['Médico curado por médico. Que vergonha.', 'Obrigado. Cobrava, mas é tu.'],
      habilidade: ['{lista:zenetoDiagnosticos}', 'Abre a boca e diz "aaaa"!', 'Isso é virose, toma isso.'],
      abate: ['Óbito constatado. Brincadeira, tá só dormindo.', 'Alta médica pro cabra!'],
      caido: ['Paciente no chão! Abre espaço!', 'Calma, que o doutor chegou!', 'Não morre que eu não tenho atestado!']
    },
    joaovitor: {
      luta: ['Dá pra negociar? Não? Então bora.', 'Quanto cês querem pra ir embora?', 'Briga é cara, viu?'],
      acerto: ['Essa foi de graça.', 'Pechincha de pancada!', 'Leva uma e paga uma.'],
      dano: ['Ei! Isso vai pra tua conta!', 'Ai! Quero reembolso!', 'Me deve uma, cabra!'],
      semMunicao: ['Sem munição e sem dinheiro. Clássico.', 'Alguém empresta cartucho? Eu pago amanhã.'],
      recarga: ['Recarregando no fiado.', 'Bala é investimento.'],
      trocaArma: ['Essa saiu mais em conta.', 'Troquei. Bom negócio.'],
      curado: ['Quanto foi a consulta? Nada? Ótimo!', 'Valeu, doutor. Anota aí que eu pago.'],
      habilidade: ['Parceiro, vamos conversar...', 'Tenho uma proposta irrecusável!'],
      abate: ['Negócio fechado.', 'Saiu barato.', 'Esse não volta pra cobrar.'],
      caido: ['Levanta, que tu me deve dinheiro!', 'Não morre devendo, macho!']
    },
    joaoluiz: {
      luta: ['Tribo, formação!', 'Regra três: ninguém foge.', 'Amadeus, em linha!'],
      acerto: ['Pela tribo!', 'Tampa de panela neles!', 'Regra sete: bate primeiro.'],
      dano: ['Escudo pegou! Quase.', 'Doeu na tribo inteira.', 'Isso é falta, juiz!'],
      semMunicao: ['Tribo sem munição! Regra nove: improvisa!'],
      recarga: ['Segura que o Amadeu recarrega.'],
      trocaArma: ['Uma mão pra arma, outra pro escudo.', 'Troca autorizada pelo conselho.'],
      curado: ['A tribo agradece, doutor.', 'Curado e pronto pra proteger.'],
      habilidade: ['Ninguém toca na tribo!', 'Atrás de mim, Amadeus!', 'Escudo sagrado, levanta!'],
      abate: ['Um a zero pros Amadeus.', 'Regra doze: quem cai fica.'],
      caido: ['Amadeu não abandona amigo!', 'Eu te cubro! Levanta!', 'Escudo em cima dele!']
    },
    luizfernando: {
      luta: ['Desenhem o círculo!', 'Ritual na hora certa ganha guerra.', 'Ninguém sai do círculo!'],
      acerto: ['O círculo aprova.', 'Abençoado pelo giz!', 'Acertei e nem rezei.'],
      dano: ['O círculo falhou! Foi o giz barato!', 'Ai! Isso fere o ritual!'],
      semMunicao: ['Acabou a munição. Sobrou o giz.', 'Sem cartucho! Rezem por mim!'],
      recarga: ['Recarrega com fé.', 'Uma bala pra cada Amadeu.'],
      trocaArma: ['Arma nova, juramento novo.'],
      curado: ['O ritual agradece a medicina.', 'Curado! Agora sim, giz e palma!'],
      habilidade: ['Pelo círculo dos Amadeus!', 'Giz, palma e juramento!', 'Entrem no círculo, depressa!'],
      abate: ['Expulso do círculo da vida. Brincadeira, tá só desmaiado.', 'O ritual venceu.'],
      caido: ['Puxem ele pro círculo!', 'Irmão Amadeu no chão!']
    },
    joaopedro: {
      luta: ['Bora fazer barulho!', 'VRUUUM! Chegou o barulho!', 'Escapamento aberto e coragem fechada!'],
      acerto: ['PÁ! Barulhento e certeiro!', 'Esse aí ouviu de longe!', 'Sentiu o ronco?'],
      dano: ['Ei! Arranhou minha camisa de dois lados!', 'Ai! Nem o Lula nem o Bolsonaro me protegeram! Os dois de folga!', 'Doeu no escapamento!'],
      semMunicao: ['Acabou! Só sobrou o ronco!', 'Sem munição! Alguém liga a moto!'],
      recarga: ['Recarregando no barulho!', 'Segura que eu tô engatilhando!'],
      trocaArma: ['Essa faz mais zoada!', 'Troquei! Quanto mais barulho melhor!'],
      curado: ['Valeu, doutor! Volta o ronco!', 'Curado e pronto pras 2 da manhã!'],
      habilidade: ['VRUUUUM!', 'Escuta esse ronco, macho!', 'Acorda a vizinhança toda!'],
      abate: ['Desligou o motor!', 'Esse aí não aguentou o barulho.', 'Silêncio pra ele.'],
      caido: ['Levanta, que a moto não pega sozinha!', 'Ei! Ninguém cai na minha frente!']
    },
    davi: {
      luta: ['Calma, eu tenho um plano infalível!', 'Deixa comigo. Eu e o bode já combinamos.', '{lista:daviPlanos}'],
      acerto: ['Plano funcionando!', 'O bode me ensinou essa!', 'TÁ VENDO? TÁ VENDO?'],
      dano: ['Isso não tava no plano!', 'Ai! O bode avisou e eu não ouvi!', 'Plano B! Plano B!'],
      semMunicao: ['Sem munição! Hora do TIRAR O EXCESSO!', 'Acabou! Faz parte do plano. Juro.'],
      recarga: ['Recarregando o plano.', 'Pera que o plano tá carregando.'],
      trocaArma: ['Essa é do plano C.', 'Troquei porque o bode mandou.'],
      curado: ['Valeu, doutor. Plano de saúde aprovado!'],
      habilidade: ['TIRAR O EXCESSO!', 'Muita coisa! Tira! Tira!', 'Excesso detectado!'],
      abate: ['Exatamente como planejei.', 'Excesso removido.', 'Mais um pro bode contar.'],
      caido: ['Isso definitivamente não tava no plano!', 'Levanta! O bode tá olhando!']
    },
    vander: {
      luta: ['Eu já tinha visto essa briga.', '...vêm aí.', 'Fiquem onde eu disser.'],
      acerto: ['Não me viu.', 'De onde ninguém espera.', '...'],
      dano: ['Hum. Não vi essa.', 'Até a sombra sangra.', 'Ai.'],
      semMunicao: ['Acabou. Vou sumir um pouco.', '...sem munição.'],
      recarga: ['No silêncio se recarrega.'],
      trocaArma: ['Outra sombra, outra arma.'],
      curado: ['Agradeço. Em silêncio.', 'Já tô melhor. Eu vi que ia ficar.'],
      habilidade: ['Tem caminho onde ninguém vê.', 'Eu vi isso num sonho.', 'Pelo Tio Ota e por Santa Isabel...'],
      abate: ['Era o destino dele.', 'Dorme, cabra.', '...'],
      caido: ['Eu vi isso e não deu tempo.', 'Fica comigo. Fica.']
    },
    miguel: {
      luta: ['Que composição bonita! Pena que é briga.', 'Vou desenhar essa cena depois.', 'Ninguém vê o Miguel chegar.'],
      acerto: ['Pincelada!', 'Isso é arte moderna.', 'Cubismo na cara!'],
      dano: ['Ai! Estragou meu quadro!', 'Ei! Isso é falta de respeito com artista!'],
      semMunicao: ['Acabou a tinta. Digo, a munição.', 'Sem munição. Vou roubar uns.'],
      recarga: ['Recarregando a paleta.', 'Pedra boa é pedra redonda.'],
      trocaArma: ['Outro pincel!', 'Essa combina mais comigo.'],
      curado: ['Valeu, doutor. Vou te desenhar de graça.'],
      habilidade: ['Ninguém viu nada.', 'Roubo da madrugada, papai.', 'Sombra não tem dono.'],
      abate: ['Obra concluída.', 'Assinado: Miguel.', 'Esse vai pro museu.'],
      caido: ['Levanta! Tu é minha musa!', 'Não! Meu modelo vivo!']
    },
    hugo: {
      luta: ['Deixa que eu ajeito isso.', 'Briga? Tenho uma gambiarra pra isso.', 'Cadê meu arame?'],
      acerto: ['Apertado no lugar certo.', 'Parafuso no lugar!', 'Ajustado.'],
      dano: ['Ai! Fura-luva!', 'Isso desregulou alguma coisa em mim.', 'Vou precisar de fita isolante.'],
      semMunicao: ['Sem prego! Alguém tem prego?', 'Acabou! Vou improvisar.'],
      recarga: ['Recarrega rápido que eu sou técnico.', 'Encaixou! Pronto!', 'Dois segundos. Um e meio.'],
      trocaArma: ['Ferramenta certa pro serviço.', 'Troca de chave!'],
      curado: ['Funciona se ninguém olhar muito. Igual eu.'],
      habilidade: ['Arame, prego e fé.', 'Funciona se ninguém olhar muito.', 'Torre montada!'],
      abate: ['Desmontado.', 'Esse precisa de peça nova.', 'Garantia vencida.'],
      caido: ['Segura que eu conserto!', 'Levanta! Tu não é peça de reposição!']
    },
    daniel: {
      luta: ['Hehe.', 'Vai esquentar.', '*sorri*'],
      acerto: ['Hehe.', 'Quentinho.', '*sorri mais*'],
      dano: ['...hehe. Doeu.', 'Ai. Mas sorri.'],
      semMunicao: ['Acabou. Mas fogo não acaba.', 'Tem fósforo ainda.'],
      recarga: ['Calma. O fogo espera.'],
      trocaArma: ['Essa pega fogo?', 'Hm. Essa queima?'],
      curado: ['Hehe. Obrigado.', 'Já tava quente mesmo.'],
      habilidade: ['Olha que bonito.', 'Queima devagarzinho...', 'Hehe.'],
      abate: ['Apagou.', 'Hehe.', 'Virou cinza a valentia.'],
      caido: ['...não. Levanta.', 'Ei. Sem graça isso.']
    },
    joaocarlos: {
      luta: ['Primo, guarda a briga pra depois da festa!', 'Bora resolver em família.', 'Quem é esse aí? Parente de quem?'],
      acerto: ['Foi sem querer, primo!', 'Isso é carinho de família.', 'Saideira!'],
      dano: ['Ei! Eu conheço tua mãe!', 'Ai! Que falta de respeito!', 'Isso não se faz com parente!'],
      semMunicao: ['Acabou! Pede mais uma pro Stelo!', 'Sem munição. Bora conversar?'],
      recarga: ['Mais uma, garçom!', 'Enchendo o copo. Digo, o pente.'],
      trocaArma: ['Essa é de bar. Gosto.', 'Troquei. Cadeira é companheira.'],
      curado: ['Valeu, doutor! Esse vai pra família toda.'],
      habilidade: ['Primo, senta aqui. Bora conversar sobre a família.', 'Vem cá, conversa comigo!'],
      abate: ['Vai pra casa, primo. Dorme.', 'Amanhã tu me agradece.'],
      caido: ['Família não fica no chão!', 'Levanta, primo! Tua mãe vai me matar!']
    }
  };
})();
