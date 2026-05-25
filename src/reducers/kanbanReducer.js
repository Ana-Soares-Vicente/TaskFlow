// reducers/kanbanReducer.js
export const COLUNAS = {
 BACKLOG: 'Backlog',
 TODO: 'A Fazer',
 DOING: 'Em Progresso',
 DONE: 'Concluído',
};
export function kanbanReducer(state, action) {
 switch (action.type) {
 case 'SET_TAREFAS':
 return action.payload;
 case 'MOVER_TAREFA': {
 const { tarefaId, deColuna, paraColuna } = action.payload;
 const tarefa = state[deColuna].find(t => t.id === tarefaId);
 return {
 ...state,
 [deColuna]: state[deColuna].filter(t => t.id !== tarefaId),
 [paraColuna]: [...state[paraColuna], { ...tarefa, status: paraColuna }],
 };
 }
 case 'ADICIONAR_TAREFA':
 return {
 ...state,
 BACKLOG: [...state.BACKLOG, action.payload],
 };
 case 'REMOVER_TAREFA': {
 const { tarefaId: id, coluna } = action.payload;
 return {
 ...state,
 [coluna]: state[coluna].filter(t => t.id !== id),
 };
 }
 default:
 return state;
 }
}
