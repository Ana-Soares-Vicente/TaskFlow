// ====================================================================
// ProjetoDetalhe.jsx — Kanban com Drag and Drop usando @dnd-kit
// Dados vêm do localStorage (sem backend)
// ====================================================================

import { useReducer, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { kanbanReducer, COLUNAS } from '../../reducers/kanbanReducer';
import { projetosService, tarefasService } from '../../services/storage';
import './ProjetoDetalhe.css';

// --- Imports do @dnd-kit ---
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';

import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';

import { CSS } from '@dnd-kit/utilities';

// ====================================================================
// COMPONENTE: KanbanCard (cada card arrastável)
// ====================================================================
function KanbanCard({ tarefa, onRemover }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: tarefa.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    cursor: 'grab',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="kanban-card"
    >
      <p>{tarefa.titulo}</p>
      <button
        className="btn-remover-tarefa"
        onClick={(e) => {
          e.stopPropagation();
          onRemover(tarefa.id);
        }}
        title="Remover tarefa"
      >
        ✕
      </button>
    </div>
  );
}

// ====================================================================
// COMPONENTE: KanbanColumn (cada coluna droppable)
// ====================================================================
function KanbanColumn({ colunaId, titulo, tarefas, onRemoverTarefa }) {
  const { setNodeRef } = useSortable({
    id: colunaId,
    data: { type: 'coluna' },
  });

  return (
    <div ref={setNodeRef} className="kanban-column">
      <h3 className="kanban-column-title">
        {titulo}
        <span className="kanban-column-count">{tarefas.length}</span>
      </h3>

      <SortableContext
        items={tarefas.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        {tarefas.map((tarefa) => (
          <KanbanCard
            key={tarefa.id}
            tarefa={tarefa}
            onRemover={onRemoverTarefa}
          />
        ))}
      </SortableContext>

      {tarefas.length === 0 && (
        <p className="kanban-empty">Arraste tarefas para cá</p>
      )}
    </div>
  );
}

// ====================================================================
// COMPONENTE PRINCIPAL: ProjetoDetalhe
// ====================================================================
const estadoInicial = { BACKLOG: [], TODO: [], DOING: [], DONE: [] };

function ProjetoDetalhe() {
  const { id } = useParams();
  const [colunas, dispatch] = useReducer(kanbanReducer, estadoInicial);
  const [activeTask, setActiveTask] = useState(null);
  const [novaTarefa, setNovaTarefa] = useState('');
  const [projeto, setProjeto] = useState(null);

  // Carrega projeto e tarefas do localStorage
  useEffect(() => {
    const projetoData = projetosService.buscarPorId(id);
    setProjeto(projetoData);

    const tarefas = tarefasService.listarPorProjeto(id);
    const agrupado = { BACKLOG: [], TODO: [], DOING: [], DONE: [] };
    tarefas.forEach((t) => {
      if (agrupado[t.status]) {
        agrupado[t.status].push(t);
      } else {
        agrupado.BACKLOG.push(t);
      }
    });
    dispatch({ type: 'SET_TAREFAS', payload: agrupado });
  }, [id]);

  // Sensores do drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  // Criar nova tarefa
  function handleCriarTarefa(e) {
    e.preventDefault();
    if (!novaTarefa.trim()) return;

    const tarefa = tarefasService.criar(id, novaTarefa.trim());
    dispatch({ type: 'ADICIONAR_TAREFA', payload: tarefa });
    setNovaTarefa('');
  }

  // Remover tarefa
  function handleRemoverTarefa(tarefaId) {
    // Encontrar em qual coluna está
    for (const [coluna, tarefas] of Object.entries(colunas)) {
      if (tarefas.some((t) => t.id === tarefaId)) {
        dispatch({ type: 'REMOVER_TAREFA', payload: { tarefaId, coluna } });
        tarefasService.remover(tarefaId);
        return;
      }
    }
  }

  // Helper: encontrar coluna de um card
  function encontrarColuna(taskId) {
    for (const [colunaKey, tarefas] of Object.entries(colunas)) {
      if (tarefas.some((t) => t.id === taskId)) {
        return colunaKey;
      }
    }
    if (Object.keys(colunas).includes(taskId)) {
      return taskId;
    }
    return null;
  }

  // Drag Start
  function handleDragStart(event) {
    const { active } = event;
    const coluna = encontrarColuna(active.id);
    if (coluna) {
      const tarefa = colunas[coluna].find((t) => t.id === active.id);
      setActiveTask(tarefa || null);
    }
  }

  // Drag Over — mover entre colunas
  function handleDragOver(event) {
    const { active, over } = event;
    if (!over) return;

    const activeColuna = encontrarColuna(active.id);
    const overColuna = encontrarColuna(over.id);

    if (!activeColuna || !overColuna || activeColuna === overColuna) return;

    dispatch({
      type: 'MOVER_TAREFA',
      payload: {
        tarefaId: active.id,
        deColuna: activeColuna,
        paraColuna: overColuna,
      },
    });
  }

  // Drag End — reordenar + persistir
  function handleDragEnd(event) {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeColuna = encontrarColuna(active.id);
    const overColuna = encontrarColuna(over.id);

    if (!activeColuna || !overColuna) return;

    // Reordenar dentro da mesma coluna
    if (activeColuna === overColuna) {
      const tarefas = colunas[activeColuna];
      const oldIndex = tarefas.findIndex((t) => t.id === active.id);
      const newIndex = tarefas.findIndex((t) => t.id === over.id);

      if (oldIndex !== newIndex && newIndex !== -1) {
        const novaOrdem = arrayMove(tarefas, oldIndex, newIndex);
        const novasColunas = { ...colunas, [activeColuna]: novaOrdem };
        dispatch({ type: 'SET_TAREFAS', payload: novasColunas });
        tarefasService.salvarOrdem(id, novasColunas);
        return;
      }
    }

    // Persistir mudança de coluna
    tarefasService.salvarOrdem(id, colunas);
  }

  // Projeto não encontrado
  if (!projeto) {
    return (
      <div className="container-projeto-detalhe">
        <div className="projeto-nao-encontrado">
          <h2>Projeto não encontrado</h2>
          <Link to="/projetos" className="btn-voltar">
            ← Voltar para Projetos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-projeto-detalhe">
      {/* Cabeçalho do projeto */}
      <div className="projeto-detalhe-header">
        <Link to="/projetos" className="btn-voltar">← Projetos</Link>
        <h1>{projeto.nome}</h1>
      </div>

      {/* Formulário para adicionar tarefa */}
      <form onSubmit={handleCriarTarefa} className="form-nova-tarefa">
        <input
          type="text"
          placeholder="Nova tarefa..."
          value={novaTarefa}
          onChange={(e) => setNovaTarefa(e.target.value)}
          className="input-nova-tarefa"
        />
        <button type="submit" className="btn-adicionar-tarefa">
          + Adicionar
        </button>
      </form>

      {/* Board Kanban com Drag and Drop */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="kanban-board">
          {Object.entries(COLUNAS).map(([key, label]) => (
            <KanbanColumn
              key={key}
              colunaId={key}
              titulo={label}
              tarefas={colunas[key]}
              onRemoverTarefa={handleRemoverTarefa}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask ? (
            <div className="kanban-card kanban-card-overlay">
              <p>{activeTask.titulo}</p>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

export default ProjetoDetalhe;
