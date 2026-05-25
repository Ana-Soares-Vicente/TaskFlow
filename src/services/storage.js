// ====================================================================
// storage.js — Serviço de dados local usando localStorage
// Substitui a API backend enquanto não há servidor
// ====================================================================

// Chaves usadas no localStorage
const STORAGE_KEYS = {
  PROJETOS: 'taskflow_projetos',
  TAREFAS: 'taskflow_tarefas',
};

// --- Helpers genéricos ---
function getFromStorage(key) {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

function saveToStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// Gera um ID único simples (timestamp + random)
function gerarId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// ====================================================================
// PROJETOS
// ====================================================================
export const projetosService = {
  // Retorna todos os projetos
  listar() {
    return getFromStorage(STORAGE_KEYS.PROJETOS);
  },

  // Retorna um projeto pelo ID
  buscarPorId(id) {
    const projetos = this.listar();
    return projetos.find((p) => p.id === id) || null;
  },

  // Cria um novo projeto
  criar(nome) {
    const projetos = this.listar();
    const novoProjeto = {
      id: gerarId(),
      nome,
      criadoEm: new Date().toISOString(),
    };
    projetos.push(novoProjeto);
    saveToStorage(STORAGE_KEYS.PROJETOS, projetos);
    return novoProjeto;
  },

  // Remove um projeto e suas tarefas
  remover(id) {
    const projetos = this.listar().filter((p) => p.id !== id);
    saveToStorage(STORAGE_KEYS.PROJETOS, projetos);
    // Remove tarefas associadas
    const tarefas = tarefasService.listarPorProjeto(id);
    const todasTarefas = getFromStorage(STORAGE_KEYS.TAREFAS);
    const filtradas = todasTarefas.filter((t) => t.projetoId !== id);
    saveToStorage(STORAGE_KEYS.TAREFAS, filtradas);
  },
};

// ====================================================================
// TAREFAS
// ====================================================================
export const tarefasService = {
  // Retorna todas as tarefas de um projeto
  listarPorProjeto(projetoId) {
    const tarefas = getFromStorage(STORAGE_KEYS.TAREFAS);
    return tarefas.filter((t) => t.projetoId === projetoId);
  },

  // Cria uma nova tarefa no Backlog
  criar(projetoId, titulo) {
    const tarefas = getFromStorage(STORAGE_KEYS.TAREFAS);
    const novaTarefa = {
      id: gerarId(),
      projetoId,
      titulo,
      status: 'BACKLOG',
      criadoEm: new Date().toISOString(),
    };
    tarefas.push(novaTarefa);
    saveToStorage(STORAGE_KEYS.TAREFAS, tarefas);
    return novaTarefa;
  },

  // Atualiza o status de uma tarefa (ao mover entre colunas)
  atualizarStatus(tarefaId, novoStatus) {
    const tarefas = getFromStorage(STORAGE_KEYS.TAREFAS);
    const index = tarefas.findIndex((t) => t.id === tarefaId);
    if (index !== -1) {
      tarefas[index].status = novoStatus;
      saveToStorage(STORAGE_KEYS.TAREFAS, tarefas);
    }
  },

  // Salva a ordem completa das tarefas de um projeto
  salvarOrdem(projetoId, colunasComTarefas) {
    const todasTarefas = getFromStorage(STORAGE_KEYS.TAREFAS);
    // Remove tarefas deste projeto
    const outrasTarefas = todasTarefas.filter((t) => t.projetoId !== projetoId);
    // Reconstrói com a nova ordem
    const tarefasDoProjeto = [];
    for (const [status, tarefas] of Object.entries(colunasComTarefas)) {
      tarefas.forEach((t) => {
        tarefasDoProjeto.push({ ...t, status });
      });
    }
    saveToStorage(STORAGE_KEYS.TAREFAS, [...outrasTarefas, ...tarefasDoProjeto]);
  },

  // Remove uma tarefa
  remover(tarefaId) {
    const tarefas = getFromStorage(STORAGE_KEYS.TAREFAS);
    const filtradas = tarefas.filter((t) => t.id !== tarefaId);
    saveToStorage(STORAGE_KEYS.TAREFAS, filtradas);
  },
};
