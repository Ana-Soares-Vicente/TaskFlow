// ====================================================================
// ProjetoDetalhe.jsx — Kanban com Drag and Drop usando @dnd-kit
// ====================================================================

import { useReducer, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { kanbanReducer, COLUNAS } from '../../reducers/kanbanReducer';
import { api } from '../../services/api';
import './ProjetoDetalhe.css';

// --- Imports do @dnd-kit ---
// DndContext: o "container" que habilita drag and drop em tudo que está dentro dele
// DragOverlay: mostra uma cópia visual do card enquanto você arrasta
// closestCorners: algoritmo que detecta qual "zona de drop" está mais perto do mouse
// PointerSensor: detecta quando o usuário clica e arrasta com o mouse
// useSensor/useSensors: configura quais sensores (mouse, touch, teclado) usar
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';

// SortableContext: permite reordenar itens dentro de uma lista
// verticalListSortingStrategy: estratégia de layout vertical (cards empilhados)
// useSortable: hook que torna um item arrastável E "droppável"
// arrayMove: helper para reordenar um array (move item de posição)
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';

// CSS: aplica transformações visuais (mover o card enquanto arrasta)
import { CSS } from '@dnd-kit/utilities';

// ====================================================================
// COMPONENTE: KanbanCard (cada card individual arrastável)
// ====================================================================
function KanbanCard({ tarefa }) {
  // useSortable transforma este componente em algo que pode ser:
  //   - arrastado (draggable)
  //   - alvo de drop (droppable)
  // O "id" é o identificador único deste card no sistema de drag
  const {
    attributes,   // props de acessibilidade (role, tabindex, etc.)
    listeners,    // event handlers do drag (onPointerDown, etc.)
    setNodeRef,   // ref para o DOM node — dnd-kit precisa saber qual elemento é
    transform,    // posição atual durante o drag (x, y)
    transition,   // animação suave ao soltar
    isDragging,   // true se ESTE card está sendo arrastado agora
  } = useSortable({ id: tarefa.id });

  // Converte o transform do dnd-kit em CSS inline
  // Ex: "translate3d(0px, 50px, 0)" — move o card visualmente
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    // Se está sendo arrastado, fica semi-transparente (o original)
    // O card "real" que segue o mouse é renderizado pelo DragOverlay
    opacity: isDragging ? 0.4 : 1,
    cursor: 'grab',
  };

  return (
    <div
      ref={setNodeRef}        // Conecta este div ao sistema dnd-kit
      style={style}           // Aplica transform/transition/opacity
      {...attributes}         // Props de acessibilidade
      {...listeners}          // Handlers de drag (mouse/touch)
      className="kanban-card"
    >
      <p>{tarefa.titulo || tarefa.title || `Tarefa #${tarefa.id}`}</p>
    </div>
  );
}

// ====================================================================
// COMPONENTE: KanbanColumn (cada coluna que recebe cards)
// ====================================================================
function KanbanColumn({ colunaId, titulo, tarefas }) {
  // Precisamos que a coluna também seja "droppable" para poder
  // receber cards mesmo quando está vazia.
  // Usamos useSortable com o id da coluna para isso.
  const { setNodeRef } = useSortable({
    id: colunaId,
    // data.type permite diferenciar "coluna" de "card" no onDragOver
    data: { type: 'coluna' },
  });

  return (
    <div ref={setNodeRef} className="kanban-column">
      <h3 className="kanban-column-title">{titulo}</h3>

      {/* SortableContext: define quais itens podem ser reordenados DENTRO desta coluna */}
      {/* items: array de IDs dos cards nesta coluna */}
      {/* strategy: como os cards estão organizados (vertical = um embaixo do outro) */}
      <SortableContext
        items={tarefas.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        {tarefas.map((tarefa) => (
          <KanbanCard key={tarefa.id} tarefa={tarefa} />
        ))}
      </SortableContext>

      {tarefas.length === 0 && (
        <p className="kanban-empty">Nenhuma tarefa</p>
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

  // Guarda o card que está sendo arrastado no momento (para o DragOverlay)
  const [activeTask, setActiveTask] = useState(null);

  // Carrega tarefas da API ao montar o componente
  useEffect(() => {
    api.get(`/projetos/${id}/tarefas`).then((tarefas) => {
      const agrupado = { BACKLOG: [], TODO: [], DOING: [], DONE: [] };
      tarefas.forEach((t) => agrupado[t.status]?.push(t));
      dispatch({ type: 'SET_TAREFAS', payload: agrupado });
    }).catch((error) => {
      console.error('Erro ao carregar tarefas:', error);
    });
  }, [id]);

  // --- Configuração dos Sensores ---
  // PointerSensor com distance: 5 significa que o drag só começa
  // depois de mover 5px — evita iniciar drag acidentalmente ao clicar
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // precisa mover pelo menos 5px para começar o drag
      },
    })
  );

  // --- Helper: encontrar em qual coluna está um card pelo ID ---
  function encontrarColuna(taskId) {
    // Percorre todas as colunas e retorna a chave da que contém o card
    for (const [colunaKey, tarefas] of Object.entries(colunas)) {
      if (tarefas.some((t) => t.id === taskId)) {
        return colunaKey;
      }
    }
    // Se o ID bate com uma chave de coluna (ex: "BACKLOG"), retorna ela mesma
    if (Object.keys(colunas).includes(taskId)) {
      return taskId;
    }
    return null;
  }

  // ====================================================================
  // EVENTO: onDragStart — quando o usuário COMEÇA a arrastar
  // ====================================================================
  function handleDragStart(event) {
    const { active } = event;
    // active.id = o ID do card que está sendo arrastado
    // Procuramos o objeto completo da tarefa para mostrar no DragOverlay
    const coluna = encontrarColuna(active.id);
    if (coluna) {
      const tarefa = colunas[coluna].find((t) => t.id === active.id);
      setActiveTask(tarefa || null);
    }
  }

  // ====================================================================
  // EVENTO: onDragOver — quando o card arrastado PASSA POR CIMA de outro
  // Este é o evento mais importante! É aqui que movemos entre colunas
  // ====================================================================
  function handleDragOver(event) {
    const { active, over } = event;
    // active = card sendo arrastado
    // over = elemento por cima do qual o card está agora

    if (!over) return; // mouse está fora de qualquer zona

    const activeId = active.id;
    const overId = over.id;

    // Encontra em qual coluna cada um está
    const activeColuna = encontrarColuna(activeId);
    const overColuna = encontrarColuna(overId);

    // Se não encontrou ou estão na mesma coluna, não faz nada aqui
    // (reordenar dentro da mesma coluna é tratado no onDragEnd)
    if (!activeColuna || !overColuna || activeColuna === overColuna) return;

    // --- Mover card de uma coluna para outra ---
    dispatch({
      type: 'MOVER_TAREFA',
      payload: {
        tarefaId: activeId,
        deColuna: activeColuna,
        paraColuna: overColuna,
      },
    });
  }

  // ====================================================================
  // EVENTO: onDragEnd — quando o usuário SOLTA o card
  // ====================================================================
  function handleDragEnd(event) {
    const { active, over } = event;

    // Limpa o card ativo do overlay
    setActiveTask(null);

    if (!over) return; // soltou fora de qualquer zona

    const activeId = active.id;
    const overId = over.id;

    const activeColuna = encontrarColuna(activeId);
    const overColuna = encontrarColuna(overId);

    if (!activeColuna || !overColuna) return;

    // Se estão na mesma coluna, pode ser uma REORDENAÇÃO
    if (activeColuna === overColuna) {
      const tarefas = colunas[activeColuna];
      const oldIndex = tarefas.findIndex((t) => t.id === activeId);
      const newIndex = tarefas.findIndex((t) => t.id === overId);

      // Se mudou de posição dentro da mesma coluna
      if (oldIndex !== newIndex && newIndex !== -1) {
        // arrayMove: pega o array, move item de oldIndex para newIndex
        const novaOrdem = arrayMove(tarefas, oldIndex, newIndex);
        dispatch({
          type: 'SET_TAREFAS',
          payload: { ...colunas, [activeColuna]: novaOrdem },
        });
      }
    }

    // Persiste a mudança na API (salva no backend)
    if (activeColuna !== overColuna) {
      api.put(`/tarefas/${activeId}`, { status: overColuna });
    }
  }

  // ====================================================================
  // RENDER
  // ====================================================================
  return (
    // DndContext: tudo dentro dele pode participar do drag and drop
    // sensors: quais inputs detectam o drag (mouse, touch, teclado)
    // collisionDetection: algoritmo pra saber "sobre qual elemento estou?"
    // onDragStart/Over/End: callbacks para cada fase do drag
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="container-projeto-detalhe">
        {Object.entries(COLUNAS).map(([key, label]) => (
          <KanbanColumn
            key={key}
            colunaId={key}
            titulo={label}
            tarefas={colunas[key]}
          />
        ))}
      </div>

      {/* DragOverlay: renderiza uma cópia "fantasma" do card que segue o mouse */}
      {/* Isso dá o feedback visual de "estou carregando este card" */}
      <DragOverlay>
        {activeTask ? (
          <div className="kanban-card kanban-card-overlay">
            <p>{activeTask.titulo || activeTask.title || `Tarefa #${activeTask.id}`}</p>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

export default ProjetoDetalhe;
