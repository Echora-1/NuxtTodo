import type { Note, Patch } from '~/types/note'

export const HISTORY_LIMIT = 50

export interface HistoryState {
  pasts: Patch[]
  futures: Patch[]
}

export function createHistoryState(): HistoryState {
  return { pasts: [], futures: [] }
}

export function applyPatch(note: Note, patch: Patch): Note {
  switch (patch.type) {
    case 'setTitle':
      return { ...note, title: patch.next }

    case 'setTodoText':
      return {
        ...note,
        todos: note.todos.map((todo) =>
          todo.id === patch.todoId ? { ...todo, text: patch.next } : todo,
        ),
      }

    case 'toggleTodo':
      return {
        ...note,
        todos: note.todos.map((todo) =>
          todo.id === patch.todoId ? { ...todo, isDone: patch.next } : todo,
        ),
      }

    case 'addTodo': {
      const todos = [...note.todos]
      todos.splice(patch.index, 0, { ...patch.todo })
      return { ...note, todos }
    }

    case 'removeTodo':
      return {
        ...note,
        todos: note.todos.filter((todo) => todo.id !== patch.todo.id),
      }
  }
}

export function invertPatch(patch: Patch): Patch {
  switch (patch.type) {
    case 'setTitle':
      return { type: 'setTitle', prev: patch.next, next: patch.prev }

    case 'setTodoText':
      return {
        type: 'setTodoText',
        todoId: patch.todoId,
        prev: patch.next,
        next: patch.prev,
      }

    case 'toggleTodo':
      return {
        type: 'toggleTodo',
        todoId: patch.todoId,
        prev: patch.next,
        next: patch.prev,
      }

    case 'addTodo':
      return { type: 'removeTodo', todo: patch.todo, index: patch.index }

    case 'removeTodo':
      return { type: 'addTodo', todo: patch.todo, index: patch.index }
  }
}

export function recordPatch(state: HistoryState, patch: Patch): void {
  state.pasts.push(patch)

  if (state.pasts.length > HISTORY_LIMIT) {
    state.pasts.shift()
  }

  state.futures = []
}

export function canUndo(state: HistoryState): boolean {
  return state.pasts.length > 0
}

export function canRedo(state: HistoryState): boolean {
  return state.futures.length > 0
}

export function undo(state: HistoryState): Patch | null {
  const patch = state.pasts.pop()

  if (!patch) {
    return null
  }

  state.futures.push(patch)
  return invertPatch(patch)
}

export function redo(state: HistoryState): Patch | null {
  const patch = state.futures.pop()

  if (!patch) {
    return null
  }

  state.pasts.push(patch)
  return patch
}
