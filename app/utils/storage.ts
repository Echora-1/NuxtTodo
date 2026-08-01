import type { DraftState, Note, PersistedState } from '~/types/note'

export const SCHEMA_VERSION = 1

const NOTES_KEY = 'nuxt-todo/notes'
const DRAFT_KEY = 'nuxt-todo/draft'

function getStorage(): Storage | null {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return null
    }
    return window.localStorage
  } catch {
    return null
  }
}

function readJson<T>(key: string): T | null {
  const storage = getStorage()
  if (!storage) {
    return null
  }

  const raw = storage.getItem(key)
  if (!raw) {
    return null
  }

  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

function writeJson(key: string, value: unknown): void {
  const storage = getStorage()
  if (!storage) {
    return
  }

  try {
    storage.setItem(key, JSON.stringify(value))
  } catch {

  }
}

function isTodoValid(value: unknown): boolean {
  if (typeof value !== 'object' || value === null) {
    return false
  }
  const todo = value as Record<string, unknown>
  return (
    typeof todo.id === 'string' &&
    typeof todo.text === 'string' &&
    typeof todo.isDone === 'boolean'
  )
}

function isNoteValid(value: unknown): boolean {
  if (typeof value !== 'object' || value === null) {
    return false
  }
  const note = value as Record<string, unknown>
  return (
    typeof note.id === 'string' &&
    typeof note.title === 'string' &&
    Array.isArray(note.todos) &&
    note.todos.every(isTodoValid)
  )
}

function migrate(state: PersistedState): Note[] | null {
  if (state.schemaVersion === SCHEMA_VERSION && Array.isArray(state.notes)) {
    return state.notes.filter(isNoteValid) as Note[]
  }

  return null
}

export function loadNotes(): Note[] {
  const state = readJson<PersistedState>(NOTES_KEY)
  if (!state || typeof state.schemaVersion !== 'number') {
    return []
  }

  return migrate(state) ?? []
}

export function saveNotes(notes: Note[]): void {
  const state: PersistedState = { schemaVersion: SCHEMA_VERSION, notes }
  writeJson(NOTES_KEY, state)
}

export function loadDraft(): DraftState | null {
  const draft = readJson<DraftState>(DRAFT_KEY)
  if (
    !draft ||
    draft.schemaVersion !== SCHEMA_VERSION ||
    typeof draft.noteId !== 'string' ||
    !isNoteValid(draft.note)
  ) {
    return null
  }

  return draft
}

export function saveDraft(note: Note, isNew: boolean): void {
  const draft: DraftState = {
    schemaVersion: SCHEMA_VERSION,
    noteId: note.id,
    note,
    isNew,
    updatedAt: Date.now(),
  }
  writeJson(DRAFT_KEY, draft)
}

export function clearDraft(): void {
  const storage = getStorage()
  if (!storage) {
    return
  }
  try {
    storage.removeItem(DRAFT_KEY)
  } catch {

  }
}
