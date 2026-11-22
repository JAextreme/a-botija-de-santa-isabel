/* =========================================================
   pistas.js — CONTEÚDO: as pistas do Caderno de Pistas.
   As que têm "segredo" só aparecem quando aquele segredo foi
   sorteado para a partida (ver BSI.data.segredos em state.js).
   ========================================================= */
BSI.data.pistas = {
  // ---------- pistas da botija (sempre aparecem) ----------
  joaquim_bento: { titulo: 'O sonho do Vander', texto: 'A alma de um tal Joaquim Bento disse que tem uma botija na tapera do pé da serra. Condição: "Vai só. Não conta pra ninguém." O Vander contou pra todo mundo.' },
  desenho_pedra: { titulo: 'Desenho antigo na pedra', texto: 'Na serra tem uma pedra com um desenho cubista idêntico aos que o Miguel faz desde criança. Ele jura que não foi ele.' },
  medalhao_jb: { titulo: 'Medalhão na grota', texto: 'Uma ossada de jumento no fundo da grota, com um medalhão enferrujado: "J. B. — 19..". O resto do ano ninguém consegue ler.' },
  alma_coronel: { titulo: 'A alma da casa do Dudu', texto: 'O Dudu contou: a alma que apareceu no açudinho é do coronel Firmino CDs, que morreu sem achar a botija. Ela ronda a casa dele há anos.' },
  cedezzi_tapera: { titulo: 'O neto esteve aqui', texto: 'Semana passada, o Rafael CDs, neto do coronel, foi na casa do Dudu perguntar pela tapera do pé da serra. Ofereceu dinheiro pra ele "esquecer" o caminho.' },
  botija_do_povo: { titulo: 'O que o Tio Ota dizia', texto: 'A Tia Zane contou: "Ota dizia que aquela botija não era de ninguém. Era de Santa Isabel."' },
  daniel_fogo_alma: { titulo: 'O fogo do Daniel', segredo: 'daniel', texto: 'Na luta contra a alma, o Daniel disse sem pensar: "Eu sempre soube que fogo espanta ela." Sempre soube como?' },
  vander_nome_coronel: { titulo: 'O Vander sabia o nome', segredo: 'vander', texto: 'O Vander chamou a alma de "coronel Firmino" ANTES do Dudu contar quem era. Disse que ouviu o nome "num sonho andando".' },
  jv_bone_vermelho: { titulo: 'Rapaz de boné vermelho', segredo: 'joaovitor', texto: 'O Dudu viu o CDs chegar acompanhado de um rapaz de boné vermelho que "falava pelos cotovelos e cobrava por tudo".' },
  felipe_caminho: { titulo: 'O "parceiro" do CDs', segredo: 'felipe', texto: 'O Dudu contou que quem ensinou o caminho da casa dele pro CDs foi um rapaz que chamava todo mundo de "parceiro".' },
  mapa_banheiro: { titulo: 'O mapa do banheiro', texto: 'Juntos, os desenhos do Miguel na parede do banheiro do bar do Stelo formam o mapa da serra. O desenho cubista fica bem em cima da tapera do pé da serra.' },
  stelo_verdade: { titulo: 'O Stelo acertou uma', texto: 'Uma das teorias do Stelo bateu com a realidade: o CDs vai usar a festa da padroeira pra "revelar um tesouro histórico" num palanque gigante.' },
  tres_irmaos_parede: { titulo: 'Escrito na parede da tapera', texto: 'Na parede da tapera, desenhos iguais aos do Miguel e uma frase a carvão: "J. B. — OS TRÊS JUNTOS".' },
  irmaos: { titulo: 'Três irmãos', texto: 'Davi, Emanuel (o Gadernal) e Vinícius (o Diazepan) são irmãos, separados quando eram crianças. Bisnetos do velho Joaquim Bento.' },
  condicao_tres: { titulo: 'A condição verdadeira', texto: 'Novo sonho do Vander: o "vai só" era a alma do coronel se metendo. A botija só sai da terra pelas mãos de três irmãos do mesmo sangue, juntos.' },
  escritura: { titulo: 'A escritura de Santa Isabel', texto: 'Na botija: moedas de ouro e a escritura antiga das terras de Santa Isabel. Sem ela, ninguém prova que a terra é do povo.' },
  felipe_atalho: { titulo: 'O atalho do Felipe', texto: 'Os capangas do CDs chegaram na tapera pelo atalho que o Felipe Parceiro "mostrou" pro grupo.' },
  jv_bilhete_capanga: { titulo: 'Bilhete do capanga', segredo: 'joaovitor', texto: 'Um capanga deixou cair um bilhete: "Info boa, doutor. Tapera, hoje à noite. Ass.: M." Quem assina M?' },
  vander_rastro_capangas: { titulo: 'Os capangas seguiram um rastro', segredo: 'vander', texto: 'Os capangas disseram que só seguiram "um rastro de chinelo que andava sozinho de madrugada".' },
  daniel_fumaca: { titulo: 'A fumaça das fogueiras', segredo: 'daniel', texto: 'Os capangas acharam a tapera seguindo a fumaça das fogueiras. O Daniel ficou calado e não sorriu.' },
  felipe_avisou: { titulo: '"O parceiro mandou avisar"', segredo: 'felipe', texto: 'Um capanga gritou: "O parceiro mandou avisar que tá tudo certo!" antes de fugir com a botija.' },
  perfil_falso: { titulo: 'A Morena de São Paulo', texto: 'A web namorada do Helano era um perfil falso da equipe do Rafael CDs, criado pra tirar o profeta do caminho na noite da festa.' },
  cedezzi_comprando: { titulo: 'O neto do coronel', texto: 'O Paulo do Zé Baixinho contou: o neto do coronel, o tal CDs, anda comprando terra por aqui e perguntou da tapera do pé da serra.' },

  // ---------- segredo: Vander sonâmbulo ----------
  vander_rastro: { titulo: 'Rastro de chinelo', segredo: 'vander', texto: 'No meio da mata, rastro de chinelo tamanho 42 andando em linha reta... por cima de espinho. Igual ao chinelo do Vander.' },
  vander_sonambulo_1: { titulo: 'Figura no escuro', segredo: 'vander', texto: 'Os cachorros latiram pra uma figura andando de olho fechado no mato. Ela assobiava. Ninguém teve coragem de chamar pelo nome.' },
  vander_sonambulo_2: { titulo: 'O Vander na serra', segredo: 'vander', texto: 'O Vander apareceu na trilha descalço e falando dormindo. Quando acordou, não lembrava de ter subido a serra.' },

  // ---------- segredo: Daniel sabia desde criança ----------
  daniel_circulo: { titulo: 'Círculo de cinza', segredo: 'daniel', texto: 'Marcas antigas de fogueira em círculo perfeito, do jeito que o Tio Ota fazia "pra proteção". O Daniel olhou e disse: "Isso aqui eu conheço." E sorriu.' },

  // ---------- segredo: João Vitor vendia informação ----------
  jv_recibo: { titulo: 'Recibo amassado', segredo: 'joaovitor', texto: 'Um papel no chão da serra: "Recebi de C. a quantia de... por informações". A assinatura tem um rabisco que parece um "M" de Miserável.' },
  jv_celular: { titulo: 'Ligação escondida', segredo: 'joaovitor', texto: 'Depois do pedágio, o João Vitor se afastou pra falar baixinho no celular. Disse que era a mãe. A mãe dele não tem celular.' },

  // ---------- segredo: Felipe Parceiro trabalha pro CDs ----------
  felipe_bilhete: { titulo: 'Bilhete de "parceiro"', segredo: 'felipe', texto: 'Um bilhete na serra: "Parceiro, marca a trilha da tapera que o doutor paga bem. Ass.: F." Quem chama os outros de parceiro?' },
  felipe_placa: { titulo: 'Placa de venda', segredo: 'felipe', texto: 'Placa nas terras do Paulo: "VENDO TERRA E MOTO BARATINHA — TRATAR C/ FELIPE PARCEIRO". A terra nem é dele.' }
};
