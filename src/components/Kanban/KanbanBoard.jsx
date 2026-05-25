import React from "react";
import { DragDropContext } from "react-beautiful-dnd";

export default function KanbanBoard({ colunas, dispatch }) {
    function onDragEnd(result) {
        const { source, destination } = result;
        if (!destination) return;
        if (source.droppableId === destination.droppableId && source.index === destination.index) return;   
        dispatch({
            type: 'MOVER_TAREFA',
            payload: {
                tarefaId: result.draggableId,
                deColuna: source.droppableId,
                paraColuna: destination.droppableId,
            },
        });
    }

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            {/* Renderizar colunas e tarefas aqui */}
        </DragDropContext>
    );
}
