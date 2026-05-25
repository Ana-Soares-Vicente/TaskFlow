import { useReducer, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { kanbanReducer, COLUNAS } from '../../reducers/kanbanReducer';
import { api } from '../../services/api';
import './ProjetoDetalhe.css';

const estadoInicial = { BACKLOG: [], TODO: [], DOING: [], DONE: [] };

function Kanban({id, navigate, ProjetoAtual, setProjetoAtual}) {
  const { novaTarefa, setNovaTarefa } = useState("");
  const [colunas, dispatch] = useReducer(kanbanReducer, estadoInicial);

  useEffect(() => {
    localStorage .setItem(`projeto-${id}`, JSON.stringify(colunas));
  }, [colunas, id]);

  function encontrarTarefa(tarefaId) {
    for (const coluna of Object.keys(colunas)) {
      const tarefa = colunas[coluna].find((t) => t.id === tarefaId);
      if (tarefa) return tarefa;
    }

function handleMoverTarefa(tarefaId, deColuna, paraColuna) {
    moverTarefa(tarefaId, deColuna, paraColuna);
  }

  function adicionarTarefa(titulo) {
    const novaTarefa = { id: Date.now(), titulo, status: 'BACKLOG' };
    dispatch({ type: 'ADICIONAR_TAREFA', payload: novaTarefa });
    api.post(`/projetos/${id}/tarefas`, novaTarefa);
  }

function removerTarefa(tarefaId, coluna) {
    dispatch({ type: 'REMOVER_TAREFA', payload: { tarefaId, coluna } });
    api.delete(`/tarefas/${tarefaId}`);
  }


  return (
    <div className="container-projeto-detalhe">
      {Object.entries(COLUNAS).map(([key, label]) => (
        <div key={key} className="kanban-column">
          <h3 className="kanban-column-title">{label}</h3>
          <div>
            {colunas[key].map((tarefa) => (
              <div key={tarefa.id} className="kanban-card">
                <p>{tarefa.titulo || tarefa.title || `Tarefa #${tarefa.id}`}</p>
                <div className="kanban-card-actions">
                  {Object.keys(COLUNAS)
                    .filter((dest) => dest !== key)
                    .map((destino) => (
                      <button
                        key={destino}
                        onClick={() => moverTarefa(tarefa.id, key, destino)}
                        className="kanban-card-btn"
                      >
                        {COLUNAS[destino]}
                      </button>
                    ))}
                </div>
              </div>
            ))}
            {colunas[key].length === 0 && (
              <p className="kanban-empty">Nenhuma tarefa</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default ProjetoDetalhe;
