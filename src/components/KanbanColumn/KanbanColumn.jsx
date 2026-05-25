import { COLUNAS } from '../../reducers/kanbanReducer';

function KanbanColumn({ coluna, titulo, tarefas, onMover }) {
  const colunasKeys = Object.keys(COLUNAS);

  return (
    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 min-h-[300px]">
      <h3 className="font-bold text-lg mb-3 text-gray-700 dark:text-gray-200">
        {titulo}
      </h3>
      <div className="flex flex-col gap-2">
        {tarefas.map((tarefa) => (
          <div
            key={tarefa.id}
            className="bg-white dark:bg-gray-700 p-3 rounded shadow-sm border border-gray-200 dark:border-gray-600"
          >
            <p className="text-sm text-gray-800 dark:text-gray-100">
              {tarefa.titulo || tarefa.title || `Tarefa #${tarefa.id}`}
            </p>
            <div className="flex gap-1 mt-2 flex-wrap">
              {colunasKeys
                .filter((key) => key !== coluna)
                .map((destino) => (
                  <button
                    key={destino}
                    onClick={() => onMover(tarefa.id, coluna, destino)}
                    className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition-colors"
                  >
                    {COLUNAS[destino]}
                  </button>
                ))}
            </div>
          </div>
        ))}
        {tarefas.length === 0 && (
          <p className="text-sm text-gray-400 italic">Nenhuma tarefa</p>
        )}
      </div>
    </div>
  );
}

export default KanbanColumn;
