import type { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Limpa em ordem reversa de FK
  await knex('zettel_links').del();
  await knex('zettel_notes').del();
  await knex('session_comments').del();
  await knex('study_sessions').del();
  await knex('kanban_cards').del();
  await knex('kanban_columns').del();
  await knex('objectives').del();
  await knex('topics').del();
  await knex('subjects').del();

  // ── Subjects ──────────────────────────────────────────────────────────────
  const subjects = await knex('subjects')
    .insert([
      {
        name: 'Matemática Discreta',
        description: 'Fundamentos matemáticos da computação: lógica, conjuntos, relações e grafos.',
        color: '#6366f1',
      },
      {
        name: 'Algoritmos',
        description: 'Projeto e análise de algoritmos, estruturas de dados e complexidade computacional.',
        color: '#f59e0b',
      },
      {
        name: 'Redes de Computadores',
        description: 'Arquitetura de redes, protocolos TCP/IP, camadas OSI e segurança em redes.',
        color: '#10b981',
      },
    ])
    .returning('*');

  const [matDisc, algoritmos, redes] = subjects;

  // ── Topics ────────────────────────────────────────────────────────────────
  const topics = await knex('topics')
    .insert([
      // Matemática Discreta
      {
        subject_id: matDisc.id,
        name: 'Lógica Proposicional',
        description: 'Operadores lógicos, tabelas-verdade, tautologias e equivalências.',
      },
      {
        subject_id: matDisc.id,
        name: 'Teoria dos Conjuntos',
        description: 'Operações entre conjuntos, relações, funções e cardinalidade.',
      },
      {
        subject_id: matDisc.id,
        name: 'Teoria dos Grafos',
        description: 'Grafos, árvores, caminhos eulerianos, hamiltonianos e conectividade.',
      },
      // Algoritmos
      {
        subject_id: algoritmos.id,
        name: 'Complexidade de Algoritmos',
        description: 'Notação Big-O, análise de melhor, médio e pior caso.',
      },
      {
        subject_id: algoritmos.id,
        name: 'Algoritmos de Ordenação',
        description: 'Bubble, insertion, merge sort, quick sort e heap sort.',
      },
      {
        subject_id: algoritmos.id,
        name: 'Programação Dinâmica',
        description: 'Memoização, tabulação e problemas clássicos como LCS e knapsack.',
      },
      // Redes de Computadores
      {
        subject_id: redes.id,
        name: 'Modelo OSI',
        description: 'As 7 camadas, seus protocolos e a diferença para o modelo TCP/IP.',
      },
      {
        subject_id: redes.id,
        name: 'TCP/IP e Sockets',
        description: 'Three-way handshake, controle de fluxo, congestionamento e API de sockets.',
      },
      {
        subject_id: redes.id,
        name: 'Segurança em Redes',
        description: 'Criptografia simétrica e assimétrica, TLS, firewalls e VPN.',
      },
    ])
    .returning('*');

  const [topLogica, , topGrafos, , topOrdenacao, topProgDin, , topTcpIp] = topics;

  // ── Objectives ────────────────────────────────────────────────────────────
  const objectives = await knex('objectives')
    .insert([
      // Matemática Discreta
      { subject_id: matDisc.id, title: 'Completar lista de exercícios de Grafos', description: 'Resolver os 20 exercícios do capítulo 5 do livro Rosen.', status: 'in_progress', due_date: '2026-08-10' },
      { subject_id: matDisc.id, title: 'Revisar lógica para a prova', description: 'Cobrir tabelas-verdade, equivalências e inferências.', status: 'in_progress', due_date: '2026-08-01' },
      // Algoritmos
      { subject_id: algoritmos.id, title: 'Implementar algoritmos de ordenação', description: 'Merge Sort, Quick Sort e Heap Sort com análise de complexidade.', status: 'in_progress', due_date: '2026-08-15' },
      { subject_id: algoritmos.id, title: 'Dominar programação dinâmica', description: 'Resolver 10 problemas do LeetCode usando DP bottom-up.', status: 'in_progress', due_date: '2026-08-20' },
      // Redes
      { subject_id: redes.id, title: 'Compreender a camada de transporte', description: 'TCP, UDP, controle de fluxo e congestionamento.', status: 'pending', due_date: '2026-08-31' },
      { subject_id: redes.id, title: 'Criar servidor HTTP do zero em Node.js', description: 'Implementar HTTP/1.1 sem frameworks, apenas net.Socket.', status: 'pending', due_date: '2026-08-05' },
    ])
    .returning('*');

  const [objGrafos, objLogica, objOrdenacao, objProgDin, objTransporte] = objectives;

  // ── Kanban Columns ────────────────────────────────────────────────────────
  const columns = await knex('kanban_columns')
    .insert([
      { title: 'A Fazer', position: 0 },
      { title: 'Em Progresso', position: 1 },
      { title: 'Concluído', position: 2 },
    ])
    .returning('*');

  const [colTodo, colDoing, colDone] = columns;

  // ── Kanban Cards ──────────────────────────────────────────────────────────
  // Semana atual: 27/07 – 02/08/2026
  await knex('kanban_cards').insert([
    // A Fazer – sem agendamento
    {
      column_id: colTodo.id,
      subject_id: matDisc.id,
      topic_id: topGrafos.id,
      objective_id: objGrafos.id,
      title: 'Resolver exercícios Cap. 5 — Grafos',
      description: 'Exercícios de conectividade, DFS, BFS e ciclos eulerianos.',
      position: 0,
      scheduled_for: null,
    },
    {
      column_id: colTodo.id,
      subject_id: algoritmos.id,
      topic_id: topOrdenacao.id,
      objective_id: objOrdenacao.id,
      title: 'Analisar complexidade do Quick Sort',
      description: 'Provar o caso médio O(n log n) e pior caso O(n²) com pivô fixo.',
      position: 1,
      scheduled_for: null,
    },
    {
      column_id: colTodo.id,
      subject_id: redes.id,
      topic_id: topTcpIp.id,
      objective_id: objTransporte.id,
      title: 'Estudar three-way handshake',
      description: 'SYN, SYN-ACK, ACK — sequência e estados da conexão TCP.',
      position: 2,
      scheduled_for: null,
    },
    // Em Progresso – agendados para esta semana
    {
      column_id: colDoing.id,
      subject_id: algoritmos.id,
      topic_id: topOrdenacao.id,
      objective_id: objOrdenacao.id,
      title: 'Implementar Merge Sort',
      description: 'Divisão recursiva e merge iterativo, medir tempo com n = 10k.',
      position: 0,
      scheduled_for: '2026-07-28',
    },
    {
      column_id: colDoing.id,
      subject_id: redes.id,
      topic_id: topTcpIp.id,
      objective_id: objTransporte.id,
      title: 'Estudar camada de transporte TCP',
      description: 'Sliding window, controle de congestionamento AIMD e Nagle.',
      position: 1,
      scheduled_for: '2026-07-29',
    },
    {
      column_id: colDoing.id,
      subject_id: matDisc.id,
      topic_id: topGrafos.id,
      objective_id: objGrafos.id,
      title: 'Implementar Dijkstra em TypeScript',
      description: 'Usar min-heap (priority queue) e testar com grafo de 100 nós.',
      position: 2,
      scheduled_for: '2026-07-30',
    },
    {
      column_id: colDoing.id,
      subject_id: algoritmos.id,
      topic_id: topProgDin.id,
      objective_id: objProgDin.id,
      title: 'Revisar Programação Dinâmica',
      description: 'Problemas LCS, knapsack 0/1 e coin change no LeetCode.',
      position: 3,
      scheduled_for: '2026-07-31',
    },
    // Concluído
    {
      column_id: colDone.id,
      subject_id: matDisc.id,
      topic_id: topLogica.id,
      objective_id: objLogica.id,
      title: 'Revisar lógica proposicional',
      description: 'Tabelas-verdade, lei de De Morgan e equivalências fundamentais.',
      position: 0,
      scheduled_for: null,
    },
  ]);

  // ── Zettel Notes ──────────────────────────────────────────────────────────
  await knex('zettel_notes').insert([
    {
      title: 'Complexidade O(n log n) — Divide e Conquista',
      content: `## Ideia central
Algoritmos de divisão e conquista que dividem o problema em subproblemas de tamanho n/2 e combinam em O(n) atingem O(n log n).

## Relação de recorrência
T(n) = 2T(n/2) + O(n)

Pelo Teorema Mestre (caso 2): a = 2, b = 2, f(n) = n.
Como n^(log₂ 2) = n¹ = n, e f(n) = Θ(n), temos **T(n) = Θ(n log n)**.

## Exemplos
- **Merge Sort**: divide ao meio, merge custa O(n)
- **Quick Sort** (caso médio): pivô ideal, partição O(n)

## Por que importa
É o limite inferior ótimo para algoritmos de ordenação baseados em comparação. Impossível ordenar em melhor que O(n log n) no pior caso.

## Conexões
→ [[Algoritmo de Dijkstra]] usa heap binário: O((V + E) log V)`,
      tags: ['algoritmos', 'complexidade', 'divide-e-conquista', 'merge-sort'],
    },
    {
      title: 'Grafos — Algoritmo de Dijkstra',
      content: `## O que é
Algoritmo guloso para encontrar o caminho de menor custo de uma fonte s para todos os vértices num grafo com arestas de peso não-negativo.

## Ideia
1. Inicializa dist[s] = 0, dist[v] = ∞ para todo v ≠ s
2. Usa uma fila de prioridade (min-heap)
3. A cada passo, extrai o vértice u com menor dist[u]
4. Relaxa todas as arestas (u, v): se dist[u] + w(u,v) < dist[v], atualiza

## Complexidade
| Estrutura      | Complexidade     |
|----------------|-----------------|
| Array simples  | O(V²)           |
| Binary heap    | O((V+E) log V)  |
| Fibonacci heap | O(V log V + E)  |

## Limitação
**Não funciona com arestas de peso negativo.** Para isso, usar Bellman-Ford O(VE).

## Aplicação prática
Roteamento OSPF em redes IP usa Dijkstra para calcular a árvore geradora mínima de custo.

## Conexões
→ [[Complexidade O(n log n) — Divide e Conquista]]
→ Modelo OSI camada de rede`,
      tags: ['grafos', 'matematica-discreta', 'caminho-minimo', 'dijkstra'],
    },
  ]);
}
