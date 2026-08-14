# ONDIS CRM Completo

## Acesso

O menu principal mantém duas entradas independentes:

- **CRM Simplificado** → `crm.html`
- **CRM Completo** → `crm-completo.html`

O CRM Simplificado e suas integrações continuam preservados.

## Fonte dos dados

- `stores/{loja}/clientes`: cadastro e histórico do cliente, compartilhado com o CRM Simplificado.
- `stores/{loja}/records`: fonte do faturamento; somente registros com `outcome: "sold"` entram no cálculo.
- `stores/{loja}/crm_negociacoes`: oportunidades e etapas do funil. A etapa não é gravada no cliente.
- `stores/{loja}/crm_atividades`: agenda, tarefas, retornos e pós-vendas.
- `stores/{loja}/crm_atendimentos`: atendimentos comerciais e abertura manual do WhatsApp.
- `stores/{loja}/crm_segmentos`: segmentos personalizados. Segmentos RFV automáticos são calculados em tempo real.
- `stores/{loja}/crm_campanhas`: revisão, agendamento e execução manual das campanhas.
- `stores/{loja}/crm_jornadas`: configurações de jornadas e criação idempotente de tarefas.
- `stores/{loja}/crm_fidelidade`: pontos, cashback, cupons e indicações.
- `stores/{loja}/crm_pesquisas`: NPS e CSAT.
- `stores/{loja}/crm_auditoria`: registro de ações sensíveis.

## Migração

A migração do funil antigo é opcional, visível em **Administração → Integrações** e disponível para gerente ou administrador.

- Usa o ID estável `legacy_{clienteId}`.
- Cria somente negociações inexistentes.
- Não altera nem exclui o cliente original.
- Mantém o valor em zero até revisão humana, evitando inventar oportunidades.
- Pode ser executada novamente sem duplicar negociações.

## Cálculos

- **Faturamento:** soma de `records` concluídos como venda no período.
- **Pipeline:** soma das negociações abertas.
- **Previsão ponderada:** valor aberto multiplicado pela probabilidade da oportunidade.
- **Ticket médio:** faturamento dividido pelas vendas concluídas.
- **Conversão:** negociações ganhas divididas pelas negociações encerradas.
- **Total gasto do cliente:** soma das compras concluídas do histórico do cliente.
- **LTV:** gasto mensal médio do relacionamento anualizado; não repete o ticket médio.
- **RFV:** classificação por recência, frequência e valor.

## Integrações externas

O botão de WhatsApp existente foi preservado. Sem credenciais de API, o sistema abre a conversa manualmente e não presume envio, entrega, leitura ou resposta. E-mail, SMS e WhatsApp oficial só aparecem como conectados quando a loja possui configuração válida.

## Recuperação de carregamento

- As leituras iniciais de usuário, loja e estado operacional possuem limite de tempo e são executadas em paralelo.
- Se autenticação, rede ou Firebase não responderem, o bloqueio visual é removido automaticamente e a tela apresenta as ações **Tentar novamente** e **Abrir CRM Simplificado**.
- Ao abrir o HTML diretamente por `file://`, a interface explica que o sistema precisa ser executado pelo endereço HTTPS publicado.
- O carregamento normal continua usando somente os dados reais da loja; a recuperação não injeta dados fictícios.

## Liga ONDIS • Missão Órbita

- A antiga Arena foi reorganizada nas abas **Visão geral**, **Meu progresso**, **Ranking**, **Missões**, **Conquistas** e **Recompensas**.
- A rota Plutão (80%), Lua (meta principal), Marte (Meta 2) e Saturno (Meta 3) lê os percentuais configurados em Metas.
- Foguetes, posição, distância, ranking, ritmo coletivo e missões usam `records`, metas semanais/mensais, conversão e P.A. existentes.
- Os filtros de período, loja, equipe, vendedor e mês preservam a fonte única de dados e respeitam a seleção de vendedor permitida pelo perfil.
- Recompensas e conquistas continuam usando o editor e as regras já existentes; nenhuma pontuação fixa foi criada.

## Verificações executadas

- Validação de sintaxe JavaScript.
- Validação de IDs HTML sem duplicações.
- Teste de fumaça das 16 telas com dados isolados.
- Teste de estados vazios e permissões de vendedor.
- Teste dos cinco principais diálogos.
- Validação das sete colunas do funil.
- Verificação dos arquivos locais referenciados pela página.
- Teste de recuperação do CRM sem módulo/Firebase disponível.
- Teste de fumaça da Liga com quatro planetas, seis abas, quatro KPIs, ranking, cinco missões, recompensa e troca de período.


## Upgrade Ranking + Liga ONDIS

- Ranking de Metas redesenhado em visual executivo claro com KPIs, progresso circular, evolução diária, insights e classificação individual.
- Corrida espacial preservada como visualização complementar.
- Liga ONDIS atualizada para a mesma linguagem visual premium das referências.
- Novas conquistas: 80%, 120%, 150% da meta, evolução de conversão, evolução de meta, sequências de 2 e 3 meses e bônus extra.
- Editor administrativo agora permite editar título, descrição, ícone, régua, ativação e pontos de cada conquista.
- Missões da semana ampliadas com vendas, meta semanal, meta mensal, conversão, P.A. e ticket médio.
