export interface TodoItem {
  id: string
  text: string
  isDone: boolean
}

export interface Note {
  id: string
  title: string
  todos: TodoItem[]
  createdAt: number
  updatedAt: number
}

export interface PersistedState {
  schemaVersion: number
  notes: Note[]
}

export interface DraftState {
  schemaVersion: number
  noteId: string
  note: Note
  isNew: boolean
  updatedAt: number
}

export type Patch =
  | { type: 'setTitle'; prev: string; next: string }
  | { type: 'setTodoText'; todoId: string; prev: string; next: string }
  | { type: 'toggleTodo'; todoId: string; prev: boolean; next: boolean }
  | { type: 'addTodo'; todo: TodoItem; index: number }
  | { type: 'removeTodo'; todo: TodoItem; index: number }
