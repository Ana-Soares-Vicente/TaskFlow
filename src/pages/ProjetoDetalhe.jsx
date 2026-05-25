// pages/ProjetoDetalhe.jsx (simplificado)
import { useReducer, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { kanbanReducer, COLUNAS } from '../reducers/kanbanReducer';
import { api } from '../services/api';


const estadoInicial = { BACKLOG: [], TODO: [], DOING: [], DONE: [] };
function ProjetoDetalhe() {
 const { id } = useParams();
 const [colunas, dispatch] = useReducer(kanbanReducer, estadoInicial);
 useEffect(() => {
 api.get(`/projetos/${id}/tarefas`).then(tarefas => {
 const agrupado = { BACKLOG: [], TODO: [], DOING: [], DONE: [] };
 tarefas.forEach(t => agrupado[t.status]?.push(t));
 dispatch({ type: 'SET_TAREFAS', payload: agrupado });
 });
 }, [id]);
 const moverTarefa = (tarefaId, deColuna, paraColuna) => {
    dispatch({ type: 'MOVER_TAREFA', payload: { tarefaId, deColuna, paraColuna } });
 api.put(`/tarefas/${tarefaId}`, { status: paraColuna });
 };
 return (
 <div className="grid grid-cols-4 gap-4 p-4">
 {Object.entries(COLUNAS).map(([key, label]) => (
 <ColunaKanban
 key={key}
 coluna={key}
 titulo={label}
 tarefas={colunas[key]}
 onMover={moverTarefa}
 />
 ))}
 </div>
 );
}
export default ProjetoDetalhe;