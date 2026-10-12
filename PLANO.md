# Palavra Viva — Planejamento e Arquitetura

**Versão para decisão · 11/10/2026 · para Anderson**

Um aplicativo que funciona offline, é 100% gratuito e ensina a Palavra de Deus em camadas: a Escritura explicando a Escritura, o ensino por passagem e os versículos-chave. Mantém a regra dos 36 critérios e as duas auditorias, sem afrouxar nada.

**Como ler este documento.** Cada ponto importante é de um destes tipos: *decidido* (regra sua), *proposto* (sugestão deste plano, depende da sua aprovação), *verificado* (conferido em arquivo, teste ou fonte citada) ou *a medir* (só o piloto de 88 versículos dirá). Nenhum prazo nem taxa de aprovação é promessa: são estimativas até serem medidos.

## 1. Objetivo e regras que não mudam

Que a pessoa abra o app, leia a Palavra, saia entendendo o evangelho e queira ler mais, sem pagar nada.

| Regra (decidida por você) | Como é cumprida |
|---|---|
| Custo zero: nenhuma API paga, plano pago ou hospedagem paga | Hospedagem em arquivos estáticos (GitHub Pages ou Cloudflare Pages); produção em GPU gratuita com modelos abertos; APIs gratuitas só como reserva já qualificada |
| Os 36 critérios, sem remover, rebaixar ou ponderar | Cada auditor devolve os 36 critérios; qualquer "F" reprova |
| Dois auditores, os dois aprovam, sem maioria | O código só aprova se os dois devolverem 36 "P" em 36 critérios, no formato estrito; falha de formato conta como reprovação, nunca como aprovação |
| Famílias diferentes entre si e do gerador | Cada modelo tem a linhagem registrada (modelo-base); o código recusa par da mesma linhagem ou da linhagem do gerador; rodízio entre auditores qualificados é permitido |
| Offline | Depois da instalação, que exige internet uma vez, o texto bíblico, a trilha do evangelho e o aviso de licença já estão no aparelho; as camadas de ensino são baixadas por livro (ou "Baixar tudo") e depois funcionam sem rede |
| Fidelidade acima de volume | Menos texto certo vale mais que muito texto duvidoso |
| Tudo operável pelo celular, sem terminal | Passos curtos no site do GitHub e do Kaggle |
| Nenhuma chave em chat | Chaves e tokens ficam só nos Secrets do GitHub e do Kaggle; nunca em chat, notebook, arquivo ou commit. Os modelos do piloto vêm de espelhos abertos, sem token do Hugging Face |
| XCurOS só em testes | Fora do rodízio de auditores e de qualquer produção até a sua decisão escrita sobre a licença |

## 2. Separação entre app e produção

O app só lê pacotes já aprovados e publicados; por isso a produção pode parar sem derrubar nada. Cada decisão abaixo responde a uma falha do projeto anterior, cuja fábrica dependia de serviços gratuitos externos que mudam sem aviso.

| Falha do projeto anterior (evidência do projeto) | Como a arquitetura responde |
|---|---|
| Cota gratuita do gerador esgotada | Geração em lote numa GPU gratuita com modelo aberto, sem cota por chamada |
| Só uma família de auditor válida; modelos retirados (HTTP 404); chave recusada (401) | Dois auditores abertos de famílias diferentes rodam no mesmo lote; APIs entram só como reserva, depois de qualificadas |
| Banco D1 da Cloudflare pausado por cota | O app não usa banco nem servidor: só arquivos estáticos |
| Produção e app misturados; contadores parados | O app lê só pacotes aprovados, com manifesto e hash; o contador é calculado dos próprios pacotes |
| Ramos *main* e laboratório divergentes | Um repositório novo, um ramo de publicação, um workflow simples |
| Executor externo dizia ter feito sem prova | Toda ação exige hash de commit ou número de execução; o app mostra a versão publicada |
| Dependência de colar muito texto em agentes com cota | Passos curtos que você executa direto no site do GitHub |

## 3. As três camadas de ensino

O ensino deixa de ser "uma explicação de IA por versículo" e vira três camadas, da mais segura para a mais exigente. O evangelho já é ensinado na Camada 1, antes de qualquer geração por IA.

| Camada | Cobertura | Origem do conteúdo | Risco doutrinário | Controle de qualidade |
|---|---|---|---|---|
| 1. Escritura explica Escritura | Todos os versículos existentes na fonte (referências cruzadas), 66 introduções de livro, trilha do evangelho | Referências do OpenBible.info (CC BY, derivadas do TSK). Introduções: rascunho de IA aberta que passa pelo mesmo pipeline (filtro, dois auditores, 36 de 36) e depois por revisão humana de 100%; autoria e datas só de lista curada. Trilha: montada só com versículos | Muito baixo | Script confere que cada referência existe; introduções e trilha: 36 de 36 nos dois auditores (a trilha também passa 3 de 3 nos critérios extras, condicionado à sua aprovação) e depois revisão humana de 100%; 5% das referências conferidas por pertinência |
| 2. Ensino por passagem | Passagens da tabela de perícopes revisada por pessoa (não capítulos automáticos); o número vem da tabela (ordem de grandeza: mil e poucas passagens, a confirmar) | IA aberta gera; dois auditores de famílias diferentes auditam | Médio | 36 de 36 nos dois auditores, controles ocultos, filtro de código, revisão humana por amostra |
| 3. Versículo a versículo | Versículos-chave (cerca de 1.000, incluindo os já certificados, só depois de reauditados pelo pipeline atual) | O pipeline atual, mesma regra | Médio a alto | Mesma regra, mais revisão humana de 100% dos versículos doutrinários e 10% dos demais |

**Perícopes.** Capítulo nem sempre é unidade de sentido (Is 52:13–53:12 e 1Co 12–14 seriam cortados). A Camada 2 usa uma tabela de perícopes fixa, revisada por pessoa.

**Cada passagem da Camada 2** traz cinco partes: pergunta de abertura; o que o texto diz; como o texto se liga ao evangelho; uma aplicação compatível com o gênero; uma oração.

- **Ligação com o evangelho (campo "Cristo neste texto").** Em vez de forçar "onde Cristo aparece", o campo tem quatro tipos válidos: (1) o texto fala de Cristo diretamente; (2) tipologia confirmada pelo Novo Testamento; (3) lugar do texto no enredo da redenção; (4) o texto mostra a necessidade de Cristo. O selo "Cristo neste texto" aparece só nos tipos 1 e 2; os tipos 3 e 4 aparecem como "Como este texto se liga ao evangelho", sem selo. **O tipo é atribuído por pessoa na tabela de perícopes, não pelo gerador.** O tipo 2 só vale quando a tabela cita o texto do Novo Testamento que o confirma (por exemplo Jo 3:14; 1Co 10:1-4; Hb 9) e o estudo cita esse versículo literalmente (conferência por código); sem citação válida o campo cai para o tipo 3 e o selo não aparece.
- **Aplicação.** Pode ser princípio, exemplo a imitar, exemplo a evitar, ou "sem aplicação direta" quando o gênero não pede (leis, juízos, relatos descritivos). Leis e juízos seguem regra explícita (Rm 10:4; Gl 3; Hb 8–10). A oração pode ser de reflexão.
- **Rótulos.** A tela separa visualmente "Texto bíblico" de "Ensino" e usa dois selos: "Ensino do app, não é a Bíblia. Gerado por IA e conferido por outras IAs" (em todo ensino) e "Revisado por pessoa" (só quando o pacote traz `humanReviewed: true`; nunca em passagem fora da amostra revisada). Referências cruzadas aparecem como "textos relacionados", porque podem trazer variantes de texto ou numeração diferente.

**Regras doutrinárias propostas** (dependem da sua aprovação; a linha confessional exata é decisão sua, seção 10):

| Situação | Regra |
|---|---|
| Variantes do N4 (Mc 16:9–20, Jo 7:53–8:11, 1Jo 5:7) | O app ensina o que está no N4 e sinaliza variantes importantes com nota curta; a IA nunca "corrige" com outra tradução |
| Etimologia, datas, geografia e costumes | Proibido à IA, exceto de lista curada e revisada por pessoa |
| Promessas arrancadas do contexto (Jr 29:11, Fp 4:13, Sl 91, Is 54:17, Pv 22:6) | Lista de alto risco revisada por pessoa; filtro para frases como "Deus vai resolver", "se orar receberá", prosperidade e cura |
| Salmos imprecatórios | Exigem o quadro do Novo Testamento (Rm 12:19; Mt 5:44); proibido suavizar o texto ou justificar violência |
| Pergunta de abertura | Só perguntas abertas, sem tese embutida |
| Trilha do evangelho em 9 passos, só com versículos que fecham sentido sozinhos (sugestão sujeita à sua revisão) | 1 Criação (Gn 1:27); 2 Deus santo e o pecado como culpa (Is 6:3; Rm 3:23); 3 Queda (Gn 3:6; Rm 5:12); 4 Promessa (Gn 3:15 com Gl 4:4 e Rm 16:20); 5 Cristo, Deus e homem (Jo 1:1,14); 6 Cruz, no nosso lugar (Is 53:5; Rm 5:8; 2Co 5:21); 7 Ressurreição (1Co 15:3-4; Rm 4:25); 8 Resposta: arrependimento e fé, graça antes do esforço (Mc 1:15; Ef 2:8-9; Rm 10:9); 9 Volta de Cristo e nova criação (Jo 14:3; Ap 21:4) |
| Autoria e datas disputadas (Hebreus, Jó, Pentateuco, Isaías, Daniel) | Apresentadas como tradição ou leitura, não como fato; datas só de lista curada |
| Posições contestadas dentro da fé evangélica (Rm 9, Hb 6, 1Co 14, batismo, milênio) | Texto dentro da linha doutrinária escolhida, indicando quando existe outra leitura |

**Quem verifica cada regra.** *Por código (reprova sozinho):* citação entre aspas que não casa literalmente com o texto N4; padrões de etimologia ("do grego", "do hebraico", "significa") e anos ("a.C.", "d.C.") fora da lista curada; frases proibidas ("Deus vai resolver", "se orar receberá", "Deus me disse", "assim diz o Senhor"). *Pelo auditor:* gênero, tom, quadro do Novo Testamento nos imprecatórios, ligação com o evangelho. *Por pessoa:* passagens de alto risco. Cada regra é ligada ao critério dos 36 que a cobre; regra sem critério correspondente vira verificador de código ou critério extra (próximo parágrafo).

**Critérios extras para o conteúdo novo (adição, não substituição dos 36).** Três critérios valem só para o conteúdo novo: pergunta de abertura sem indução; quiz com um único gabarito defensável; trilha do evangelho sem fórmula mágica. O conteúdo desses tipos passa com 36 de 36 nos critérios existentes **e** 3 de 3 nos extras, nos dois auditores. Os extras não substituem, não ponderam e não alteram os 36. Dependem da sua aprovação (seção 10); sem ela, pergunta de abertura, quiz e trilha não são publicados.

**Revisão humana.** 100% das introduções, da trilha, dos versículos-chave doutrinários e das passagens de alto risco (salmos imprecatórios, Rm 8–11, Hebreus, Apocalipse, Mt 24). Nas demais passagens, 10% por livro, com mínimo de 3 passagens (ou todas, se o livro tiver 3 ou menos), e 5% das referências cruzadas, conferidas por pertinência e não só por existência.

**Linha doutrinária mínima.** Antes de qualquer conteúdo contar como aprovado, existe um texto de até uma página com o credo de referência, os pontos em que o app apresenta mais de uma leitura (batismo, milênio, dons, Rm 9) e o nome do revisor humano. Esse texto é anexado ao comando do gerador e dos dois auditores.

## 4. Experiência do leitor

A curiosidade nasce de boas perguntas e de caminhos que levam a outros caminhos, não de truques de retenção.

**Eixo único: Pergunta → Texto → Fio → Volta.** A pessoa vê uma pergunta curta antes do texto, lê, segue um fio (referência cruzada) e volta ao ponto de partida com um toque. O resto são recursos de apoio.

| Primeira versão (MVP) | Fica para depois |
|---|---|
| Pergunta de abertura, texto, quatro profundidades (Ler, Entender, Ligar ao evangelho, Aprofundar), siga o fio, trilha de 9 passos, continuar de onde parei, anotações e destaques com exportação, busca, áudio (se passar no teste), plano de leitura flexível | Quiz de fixação (sem nota, só sobre fatos do texto), compartilhar como imagem, personagens, mapa e linha do tempo em texto, glossário do N4 |

Passagem sem Camada 2 mostra só "Ler" e "Siga o fio": aba sem conteúdo fica oculta, nunca vazia, e nenhuma tela mostra "em breve". A pergunta de abertura só aparece onde a Camada 2 estiver publicada.

**Tela inicial:** título curto, botão "Começa aqui: a história de Jesus em 9 passos" e três portas pequenas: continuar, ler a Bíblia, tenho uma pergunta. Sem cadastro, sem tutorial, sem pedir permissão.

**Sem padrões manipulativos:** nada de confete, pontos, ranking, "sentimos sua falta" ou pergunta usada como isca; progresso só como lembrança, nunca como meta; tom sóbrio e reverente. Textos de IA nunca falam como Deus nem em profecia pessoal; a aplicação usa linguagem de convite.

**Requisitos de acessibilidade e desempenho, com o método de teste de cada um** (metas iniciais, que só podem ser endurecidas sem nova decisão sua):

1. fonte inicial de 18 px, três tamanhos, e zoom do sistema até 200% sem rolagem horizontal (teste manual);
2. contraste mínimo 4,5:1, conferido por script sobre os tokens de cor nos temas claro e escuro;
3. alvos de toque de 48 px, conferidos por script que lê o CSS;
4. TalkBack: duas pessoas percorrem a trilha, leem um capítulo, abrem uma nota e voltam, sem ajuda;
5. frases do ensino gerado: média de até 15 palavras e nenhuma acima de 25, medido por script no pacote;
6. `lang="pt-BR"` em todas as páginas;
7. desempenho no Moto E13 real: abertura a frio da tela de leitura em até 3 s, JavaScript inicial de até 150 KB compactado, busca em até 300 ms.

**Botão "Ouvir".** Aparece só se, depois do evento `voiceschanged` (ou 2 s de espera), existir voz com idioma pt-BR e `localService` verdadeiro, e uma frase curta de teste terminar com sucesso (`onend`). Sem voz local, o botão fica oculto e a página de ajuda explica como instalar a voz pt-BR do Android. O áudio fala por versículo ou frase, com fila (enunciados longos são cortados no Chrome). Só entra na primeira versão se passar no teste no Moto E13.

**Medição sem rastreio:** métricas só no aparelho e opcionais; nada é enviado a servidor. A tela inicial e a trilha de 9 passos são desenhadas e testadas com 5 leitores antes de gerar a Camada 2.

**Teste de compreensão (aceite da Fase 4).** Depois de percorrer a trilha, 5 leitores novos respondem de viva voz, sem consulta, a três perguntas abertas: "Quem é Jesus?", "O que ele fez na cruz e por quê?", "Como a pessoa recebe esse perdão?". Passa se ao menos 4 de 5 disserem, com as próprias palavras, que Jesus morreu no lugar do pecador e que o perdão vem pela fé, não por esforço. Se falhar, a trilha é reescrita e testada de novo.

## 5. Arquitetura técnica

Site estático que guarda tudo no aparelho: sem servidor, sem banco, sem chave de API.

| Componente | Escolha | Por que |
|---|---|---|
| Hospedagem | GitHub Pages como padrão (endereço github.io gratuito); Cloudflare Pages como espelho de contingência (pages.dev); nenhum domínio pago; o nome do repositório é definido uma vez, antes da primeira publicação | Sem banco e sem funções. Cada endereço é uma origem diferente: trocar de um para o outro perde notas e downloads do leitor, por isso o espelho é só contingência e o backup JSON é parte do app |
| Interface | HTML, CSS e JavaScript simples, sem framework pesado | Leve num celular modesto como o Moto E13 |
| Offline | Service worker com cache versionado | Funciona sem rede e atualiza em segundo plano |
| Dados do leitor | IndexedDB, mais `navigator.storage.persist()` e `estimate()`; todos os caches e bancos com o prefixo `pv4-`, e a limpeza apaga só chaves com esse prefixo | Reduz o risco de o navegador apagar notas; backup em JSON (exportar e importar); não colide com o app antigo na mesma origem github.io |
| Busca | Índice local pré-gerado, com normalização de acentos, dividido por prefixo do termo (um arquivo com hash por fragmento) e um índice separado por camada, rodando num Web Worker | Cada consulta carrega 1 a 3 fragmentos e uma atualização da Camada 2 não invalida o índice da Bíblia; meta de 300 ms (a medir) |
| Áudio | Voz do próprio aparelho (Web Speech), conforme a seção 4 | Sem arquivos de áudio; a qualidade da voz varia por aparelho |
| Texto bíblico | JSON por livro e capítulo (Bíblia Livre N4) | Já existe; a contagem de registros é conferida por script na Fase 2 |

**Conteúdo e integridade.** Todo arquivo tem esquema fixo (JSON Schema) e hash. O hash vai no nome de cada arquivo de conteúdo (como na tabela abaixo) e o manifesto mapeia o id imutável ao nome com hash. O app recusa pacote cujo hash não confere e, em falha de hash ou de rede, mantém o último pacote válido. Os arquivos com hash das últimas 3 versões ficam publicados, para quem ainda tem o manifesto antigo em cache não receber erro 404.

| Arquivo | Conteúdo | Regra de entrada |
|---|---|---|
| content-manifest.json | Versão, número de geração, lista de pacotes (tamanho e SHA-256 de cada um) e lista de revogados | O app só aceita pacote cujo hash confere; o nome é diferente de `manifest.json`, que é o manifesto do PWA |
| biblia/livro/capitulo.hash.json | Versículos do capítulo | Somente leitura |
| camada1/refs/livro.hash.json | Referências cruzadas e introdução do livro | Cada referência validada por script |
| camada1/trilha.hash.json | Os 9 passos com seus versículos | Só entra revisada por pessoa |
| camada2/livro/passagem.hash.json | Pergunta, o que diz, ligação com o evangelho, aplicação, oração | Só entra aprovado: 36 de 36 nos dois auditores (e os extras, quando aplicáveis) |
| camada3/versiculos.hash.json | Estudo por versículo-chave | Mesma regra, mais revisão humana |

Cada estudo carrega seu id, o hash do texto-fonte, a versão do contrato (hoje `pv-teaching-r4`), a linhagem e a versão dos modelos do gerador e dos dois auditores, a data e o campo `humanReviewed`. IDs são imutáveis (por exemplo `43-003-016`); Marcos 5:19 tem id reservado e marca de lacuna. `schemaVersion`, `contentVersion` e `contractVersion` são separados.

**Atualização, retorno e retirada de conteúdo.**

- O app registra o service worker com `updateViaCache: 'none'` e busca `sw.js` e `content-manifest.json` sempre na rede (`cache: 'no-store'` no código). No Cloudflare, um arquivo `_headers` reforça isso; o GitHub Pages não aceita cabeçalhos próprios, então lá a garantia vem só do código;
- ao haver versão nova, o app mostra o botão **Atualizar**; não há `skipWaiting` automático;
- o cache anterior só é apagado depois que o novo estiver ativo;
- existe uma página de reset e um botão **Limpar cache** no app;
- o manifesto tem um número de **geração** que só cresce, inclusive num rollback. O app aceita qualquer manifesto de geração maior; ao aplicá-lo, remove do cache e do banco tudo o que não está nele ou que consta como revogado. Assim um pacote errado já baixado pode ser retirado do aparelho do leitor;
- rollback = novo commit que reaponta o conteúdo ao estado anterior, com geração nova, por um workflow acionado pelo celular.

**Offline de verdade.** O precache da instalação guarda o shell do app, o texto bíblico N4 (tamanho medido na Fase 2), a trilha do evangelho completa com seus versículos, o aviso de licença e a introdução de João. As camadas de ensino são baixadas por livro ou Testamento, com botão **Baixar tudo**, barra de progresso e retomada; há orçamento de tamanho por camada. Teste de contrato com teto de cerca de 8.000 arquivos (o plano gratuito do Cloudflare Pages declara 20.000 arquivos e 25 MiB por arquivo, a conferir na documentação do serviço na Fase 0).

**Contrato antes da publicação.** Um teste automático no GitHub confere esquema, hashes, referências, tamanho máximo e a regra de entrada de cada camada. Publicação só com tudo verde.

## 6. Produção gratuita e a regra dos 36

A produção roda em lotes numa GPU gratuita (Kaggle ou Colab) com modelos abertos, sem cota por chamada. O app não depende dela.

1. **Selecionar a unidade** (perícope ou versículo-chave) com o contexto vizinho.
2. **Gerar** com modelo aberto da família A (hoje Qwen2.5-7B-Instruct).
3. **Filtro automático do código** (o mesmo do projeto): tamanho, frases-modelo, repetição, inglês, citação longa demais, repetição contra os estudos já certificados.
4. **Dois auditores** de famílias diferentes entre si e do gerador (hoje Gemma-2-9b-it e Llama-3.1-8B-Instruct). Cada um devolve os 36 critérios no formato estrito; só passa com 36 de 36 "P" nos dois.
5. **Reprovado volta** ao gerador com a lista de critérios que falharam, até 3 tentativas. Nunca é aprovado à força. Item reprovado 3 vezes vai para a fila "sem estudo": o app mostra só o texto e as referências.
6. **Revisão humana** conforme a seção 3.
7. **Empacotar** com manifesto, hash e versão; o teste do GitHub valida e só então publica.

| O que nunca muda | Como é garantido |
|---|---|
| Os 36 critérios, sem peso e sem exceção | Os dois auditores devolvem 36 "P"; um "F" bloqueia |
| Dois auditores, os dois aprovam | Sem votação por maioria |
| Famílias diferentes | Linhagem registrada por modelo (modelo-base, não o prefixo do nome, porque derivados e destilados misturam linhagens); modelo sem linhagem declarada não pode ser auditor |
| Falha sempre bloqueia | Resposta fora do formato conta como reprovação |
| Controle ruim aprovado pelos dois derruba o lote | Cada lote leva controles ruins ocultos e embaralhados (o maior valor entre 10 controles e 12% do lote, arredondado para cima), de dois tipos: (A) estudo de outro livro no lugar certo; (B) estudo do versículo certo com defeito doutrinário injetado, de um catálogo de pelo menos 10 tipos (prosperidade, etimologia inventada, tipologia sem base no NT, juízo aplicado como promessa, voz de Deus etc.). Se um controle ruim for aprovado pelos **dois** auditores, o lote inteiro é descartado |
| Auditor que deixa passar controle é acompanhado | Cada controle aprovado por um só auditor conta contra ele num acumulado entre lotes; se o limite inferior de Wilson 95% do recall acumulado cair abaixo do limiar de qualificação, o auditor é suspenso até nova qualificação |

**Como um auditor é qualificado.** A qualificação é feita em nível de **estudo**, com um conjunto dourado: os defeitos são injetados por script pelo Claude, e uma pessoa aprova os estudos bons e confere uma amostra dos ruins. Tamanho mínimo: 60 estudos bons e 150 estudos ruins, cada ruim com um defeito injetado, com pelo menos 4 casos por critério, e defeitos sutis, não só versículo trocado. O auditor é qualificado se (a) detectar os estudos ruins com limite inferior de Wilson 95% de pelo menos 0,85 e (b) aprovar pelo menos 70% dos estudos bons (aprovar um bom exige 36 "P", então essa taxa mede produtividade, não rigor). O recall por critério é registrado e um critério sem nenhuma detecção desqualifica. O **par** também é medido: a taxa de estudos ruins aprovados pelos dois ao mesmo tempo. Os limiares podem ser endurecidos no piloto, nunca relaxados sem decisão escrita sua. Um auditor é classificado em: (a) falha de formato ou conexão; (b) rigoroso demais (aprova menos de 70% dos bons); (c) leniente demais (limite inferior de Wilson 95% do recall abaixo de 0,85); (d) qualificado. Só (d) entra.

**Auditores de reserva por API.** Groq, Cloudflare Workers AI e similares entram num rodízio só depois de qualificados pelo mesmo teste. O XCurOS fica fora do rodízio e só é usado em testes.

**Camadas de proteção.** Modelos abertos de 7 a 9 bilhões de parâmetros erram; por isso a regra dos 36 trabalha junto com o filtro do código, os controles ocultos e a revisão humana. Passar nos 36 é condição necessária; a aprovação final exige, além dos 36, o filtro de código e os controles ocultos no lote, e a revisão humana na proporção da seção 3 para cada tipo de conteúdo. Item fora da amostra revisada é publicado sem o selo "Revisado por pessoa".

**O notebook do piloto (v3).** Roda 88 versículos na GPU gratuita: gera com Qwen, filtra, audita com Gemma e Llama no formato estrito dos 36 critérios, mistura controles ruins ocultos (semente fixa registrada), aprova só quando os dois auditores aprovam e invalida o lote se um controle ruim passar pelos dois. Tem checkpoint por lote (retoma se a célula for rodada de novo na mesma sessão), teste de sanidade após carregar cada modelo com troca automática de fp16 para bf16 se a saída vier sem sentido, e divisão automática do lote em falta de memória. *Verificado:* o notebook foi executado de ponta a ponta com modelos simulados em quatro cenários (normal, auditores lenientes, saída sem sentido em fp16, retomada); o script de teste (`dryrun3.py`) e o registro da execução (`dryrun3-log.txt`) acompanham este documento. *A medir:* o comportamento com os modelos reais é a primeira etapa da Fase 1. No Kaggle, só a saída de uma execução "Save & Run All" concluída é guardada; uma sessão interativa que cai perde os arquivos, então os lotes de produção usam essa modalidade.

**Medições que o piloto entrega:** taxa real de aprovação dos dois auditores, tempo por item, critérios mais reprovados, comportamento dos controles. Estimativas dos revisores, **ainda não medidas**: piloto de 88 em cerca de 15 a 25 minutos; mil e poucas passagens em 3,5 a 6 horas; os 31.102 versículos, um a um, em cerca de 150 horas com transformers (30 a 45 horas com vLLM). A cota semanal gratuita do Kaggle (relatos de usuários falam em cerca de 30 horas) e seus termos de uso são confirmados por você na Fase 0; até lá o plano não depende deles. O plano garante a Camada 1 completa; a Camada 2 cobre as perícopes da tabela aprovada; a Camada 3 cobre os versículos-chave. Cobrir todos os versículos um a um é meta de longo prazo, sem prazo prometido.

## 7. Fontes e licenças

Não é aconselhamento jurídico; a conferência final é sua e fica registrada na Fase 0, com link e data.

| Item | Uso | Situação |
|---|---|---|
| Bíblia Livre N4 | Texto bíblico do app | O manifesto do projeto registra CC BY 3.0 Brasil. A página do eBible para a edição porbr2018 da Bíblia Livre declara CC BY 4.0 Brasil (conferido hoje, ebible.org/porbr2018/copyright.htm). Em ambas, a exigência é atribuição: autores, fonte, versão e data, e aviso se o texto for alterado. O app exibe a atribuição da licença da edição que realmente usar; a edição e a licença são confirmadas na Fase 0 |
| OpenBible.info (base TSK) | Referências cruzadas da Camada 1 | CC BY; exige crédito visível |
| Qwen2.5 | Geração | Apache 2.0 |
| Llama 3.1 | Auditor | Termos próprios: exige "Built with Llama" quando o produto é distribuído; alternativa é trocar a família |
| Gemma 2 | Auditor | Termos próprios do Gemma; registrar a versão usada |
| Kaggle (GPU gratuita) | Produção em lote | Cota e termos confirmados por você na Fase 0, antes da Fase 1 |
| Vozes do aparelho (Web Speech) | Áudio | Nenhum arquivo distribuído; depende do aparelho |

**Marcos 5:19.** O dossiê do projeto indica que o versículo está ausente na fonte (Marcos com 677 de 678 versículos). É defeito de dados, não decisão doutrinária. Antes da Fase 2, confere-se na fonte original: se o versículo existir, o JSON é corrigido; se não, o app mostra "[versículo ausente nesta edição]" com a atribuição. A contagem exibida no app é calculada dos pacotes; "31.102" só é anunciado se a conferência fechar esse total.

## 8. Riscos e como são tratados desde o projeto

| Risco | Sinal de alerta | Tratamento |
|---|---|---|
| Texto com erro doutrinário ou fato inventado | Auditor aprova texto ruim | 36 de 36 nos dois auditores, controles ocultos em todo lote, revisão humana dos pontos doutrinários |
| Auditor aberto fraco demais | Aprova controles ruins ou reprova bons | Lote descartado ou auditor suspenso; só volta após nova qualificação |
| Modelos geram texto repetitivo ou genérico | Filtros de repetição e de aplicação genérica reprovam muito | Ensino por passagem com contexto; ajuste de prompt medido no piloto |
| Cota semanal da GPU gratuita acaba | Sessão interrompida | Lotes pequenos com ponto de retomada; o app continua com o que já existe |
| Serviço gratuito muda ou cai | Erros 404, 401, 429 | O app não depende de IA em tempo de uso; APIs só como reserva |
| Licença impede distribuição | Termos diferentes do esperado | Conferência na Fase 0 e atribuição visível |
| Pacote corrompido, versão errada ou conteúdo errado chega ao leitor | Hash não confere; erro doutrinário descoberto depois | Manifesto com hash, teste automático, geração crescente com lista de revogados e rollback |
| Executor diz que fez e não fez | Sem hash de commit ou número de execução | Toda entrega com prova; o app mostra a versão publicada |
| Operar só pelo celular fica trabalhoso | Passos longos | Passos curtos, uma ação por vez, nada que exija terminal |
| Prometer o que não se pode entregar | Meta fixa sem medição | O app mostra o que existe de cada camada, com contadores calculados dos pacotes |

## 9. Fases, entregas e critérios de aceite

Cada fase só termina quando o critério de aceite é cumprido com prova (resultado de execução ou arquivo).

| Fase | Entrega | Critério de aceite |
|---|---|---|
| 0. Decisões e verificação | Decisões da seção 10 escritas; linha doutrinária mínima de uma página; edição e licença do N4 conferidas com link e data; limites do Cloudflare Pages conferidos com link e data; cota e termos do Kaggle confirmados; tratamento de Marcos 5:19 | Tudo isso registrado por escrito |
| 1. Piloto de produção | Conjunto dourado montado (60 estudos bons aprovados pelo revisor da decisão 2 e 150 ruins com defeito injetado por script, com pelo menos 4 casos por critério) e notebook v3 rodado na GPU gratuita com 88 versículos (a parte técnica pode começar em paralelo à Fase 0, mas nenhum texto conta como aprovado sem a linha doutrinária) | Passa se: (a) os dois auditores cumprem os critérios de qualificação da seção 6 no conjunto dourado; (b) todos os controles ruins foram reprovados; (c) a taxa de aprovação dos itens gerados fica entre 10% e 90% (fora disso o auditor ou o prompt é suspeito e o piloto repete); (d) uma pessoa revisa os 88 itens e não encontra erro doutrinário nos aprovados, senão o prompt é corrigido e o piloto repete. Se um auditor falhar na qualificação, a fase repete com outro modelo |
| 2. App base offline | Texto bíblico; a trilha do evangelho (só versículos, revisada por pessoa); a introdução de João (revisada por pessoa); os estudos já certificados que passarem de novo pelo pipeline atual (dois auditores qualificados de famílias diferentes, 36 de 36, controles ocultos), depois da revisão das 42 orações repetidas pela planilha do projeto anterior, e os que não passarem ficam fora até passar; o manifesto com hash | Instalar com rede, ligar o modo avião, fechar e reabrir: o texto, a trilha e João 1 abrem sem erro; atribuição visível; hash conferido por teste; contagem de versículos conferida por script |
| 3. Camada 1 | Referências cruzadas, 66 introduções (a de João já entregue na Fase 2), ajustes da trilha de 9 passos | 100% das referências validadas por script; introduções e trilha revisadas por pessoa; trilha com 36 de 36 nos dois auditores e 3 de 3 nos extras (condicionado à aprovação dos extras, seção 10) |
| 4. Interatividade | Quatro profundidades, siga o fio, mecanismo das perguntas de abertura (testado com conteúdo de teste; só aparecem onde a Camada 2 estiver publicada), continuar de onde parei, anotações e destaques com exportação, busca, plano de leitura flexível, áudio (só se passar no teste no Moto E13; senão o botão fica oculto e a fase encerra sem ele) | Itens 1 a 7 da seção 4 verificados com registro (o item 5 sobre os estudos já certificados, e de novo em cada lote da Fase 5); nenhuma passagem mostra aba vazia; teste de compreensão (4 de 5 leitores); abrir, aprofundar e voltar sem travar |
| 5. Camada 2 em lotes | Ensino por passagem, livro a livro (sugestão de ordem: João, Salmos, Provérbios, Romanos, Mateus) | Em cada lote: 36 de 36 nos dois auditores, controles ocultos reprovados, amostra revisada |
| 6. Camada 3 | Versículos-chave | Mesma regra, mais revisão humana de 100% dos versículos doutrinários e 10% dos demais |
| 7. Extras | Quiz, compartilhar como imagem, personagens, mapa e linha do tempo em texto, glossário do N4 | Mesmos controles de qualidade |

**Quem faz o quê.** O Claude prepara arquivos, textos de comando e testes. Você executa os passos curtos pelo celular (GitHub e Kaggle) e traz os resultados. Para escrever o código do app, uma ferramenta de agente que trabalhe no GitHub e entregue pull request que você aprova (como o Google Jules) é uma opção, desde que os testes do projeto rodem a cada alteração. Qualquer executor só vale com prova de commit ou de execução.

**Próximo passo recomendado:** as decisões 1 e 2 da seção 10 (linha doutrinária e revisor) e, em paralelo, rodar o piloto de 88 versículos no Kaggle.

## 10. Decisões que são suas

- [ ] **Linha doutrinária:** existe uma confissão ou denominação que os textos devem seguir? Isso define o critério da revisão humana e o texto de uma página da Fase 0.
- [ ] **Quem revisa:** você ou uma pessoa de confiança, para as introduções, a trilha e os versículos doutrinários?
- [ ] **Três critérios extras** para o conteúdo novo (pergunta de abertura, quiz, trilha), sem substituir os 36. Sem esta aprovação, esses itens não são publicados.
- [ ] **Perícopes:** quem monta a tabela, e quais livros entram no primeiro lote da Camada 2.
- [ ] **Nome e repositório:** app separado do Palavra Viva Robusto atual (recomendado) ou evolução dele?
- [ ] **Llama:** aceitar o termo "Built with Llama" (visível no app) ou trocar o auditor por outra família aberta.
- [ ] **Kaggle:** confirmar na sua conta a cota semanal de GPU e ler os termos de uso antes da Fase 1.
- [ ] **Licença do N4:** confirmar a edição usada e a licença na página da fonte.
- [ ] **Marcos 5:19:** se a lacuna se confirmar na fonte original, o app mostra "[versículo ausente nesta edição]" com a atribuição; completar com outra tradução só com a sua decisão escrita e com a licença e a atribuição dela registradas.
- [ ] **XCurOS:** aceitar ou não como auditor de reserva, depois de ler os termos de licença e ver o teste.
