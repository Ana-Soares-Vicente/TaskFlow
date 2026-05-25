import { useReducer, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { kanbanReducer, COLUNAS } from '../../reducers/kanbanReducer';
import { api } from '../../services/api';
import './ProjetoDetalhe.css';

const estadoInicial = { BACKLOG: [], TODO: [], DOING: [], DONE: [] };

function ProjetoDetalhe() {
  const { id } = useParams();
  const [colunas, dispatch] = useReducer(kanbanReducer, estadoInicial);

  useEffect(() => {
    api.get(`/projetos/${id}/tarefas`).then((tarefas) => {
      const agrupado = { BACKLOG: [], TODO: [], DOING: [], DONE: [] };
      tarefas.forEach((t) => agrupado[t.status]?.push(t));
      dispatch({ type: 'SET_TAREFAS', payload: agrupado });
    }).catch((error) => {
      console.error('Erro ao carregar tarefas:', error);
    });
  }, [id]);

  const moverTarefa = (tarefaId, deColuna, paraColuna) => {
    dispatch({ type: 'MOVER_TAREFA', payload: { tarefaId, deColuna, paraColuna } });
    api.put(`/tarefas/${tarefaId}`, { status: paraColuna });
  };

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
