import type { Note, Patch, TodoItem } from '~/types/note'
import { generateId } from '~/utils/id'
import {
  applyPatch,
  canRedo as canRedoState,
  canUndo as canUndoState,
  createHistoryState,
  recordPatch,
  redo as redoState,
  undo as undoState,
} from '~/utils/history'

type TextFieldKey = { field: 'title' } | { field: 'todo'; todoId: string }

const TEXT_COMMIT_DELAY = 500

function cloneNote(note: Note): Note {
  return {
    ...note,
    todos: note.todos.map((todo) => ({ ...todo })),
  }
}

export function useEditHistory(initialNote: Note) {

  const workingNote = ref<Note>(cloneNote(initialNote))

  let committedNote = cloneNote(initialNote)

  const historyState = createHistoryState()

  const pastCount = ref(0)
  const futureCount = ref(0)
  const hasPendingChange = ref(false)

  let pendingKey: TextFieldKey | null = null
  let commitTimer: ReturnType<typeof setTimeout> | null = null

  const canUndo = computed(() => pastCount.value > 0 || hasPendingChange.value)
  const canRedo = computed(() => futureCount.value > 0)

  function syncCounts(): void {
    pastCount.value = historyState.pasts.length
    futureCount.value = historyState.futures.length
  }

  function readCommittedText(key: TextFieldKey): string {
    if (key.field === 'title') {
      return committedNote.title
    }
    const todo = committedNote.todos.find((item) => item.id === key.todoId)
    return todo ? todo.text : ''
  }

  function readWorkingText(key: TextFieldKey): string {
    if (key.field === 'title') {
      return workingNote.value.title
    }
    const todo = workingNote.value.todos.find((item) => item.id === key.todoId)
    return todo ? todo.text : ''
  }

  function clearTimer(): void {
    if (commitTimer) {
      clearTimeout(commitTimer)
      commitTimer = null
    }
  }

  function commitPendingText(): void {
    clearTimer()

    if (!pendingKey) {
      hasPendingChange.value = false
      return
    }

    const key = pendingKey
    pendingKey = null
    hasPendingChange.value = false

    const prev = readCommittedText(key)
    const next = readWorkingText(key)

    if (prev === next) {
      return
    }

    const patch: Patch =
      key.field === 'title'
        ? { type: 'setTitle', prev, next }
        : { type: 'setTodoText', todoId: key.todoId, prev, next }

    recordPatch(historyState, patch)

    committedNote = applyPatch(committedNote, patch)
    syncCounts()
  }

  function isSameKey(first: TextFieldKey, second: TextFieldKey): boolean {
    if (first.field !== second.field) {
      return false
    }
    if (first.field === 'title' || second.field === 'title') {
      return true
    }
    return first.todoId === second.todoId
  }

  function handleTextInput(key: TextFieldKey): void {
    if (pendingKey && !isSameKey(pendingKey, key)) {
      commitPendingText()
    }

    pendingKey = key
    hasPendingChange.value = true

    clearTimer()
    commitTimer = setTimeout(commitPendingText, TEXT_COMMIT_DELAY)
  }

  function commitAtomicPatch(patch: Patch): void {
    commitPendingText()
    recordPatch(historyState, patch)
    workingNote.value = applyPatch(workingNote.value, patch)
    committedNote = applyPatch(committedNote, patch)
    syncCounts()
  }

  function toggleTodo(todoId: string): void {
    const todo = committedNote.todos.find((item) => item.id === todoId)
    if (!todo) {
      return
    }
    commitAtomicPatch({
      type: 'toggleTodo',
      todoId,
      prev: todo.isDone,
      next: !todo.isDone,
    })
  }

  function addTodo(): void {
    const todo: TodoItem = { id: generateId(), text: '', isDone: false }
    commitAtomicPatch({
      type: 'addTodo',
      todo,
      index: committedNote.todos.length,
    })
  }

  function removeTodo(todoId: string): void {
    const index = committedNote.todos.findIndex((item) => item.id === todoId)
    if (index === -1) {
      return
    }
    commitAtomicPatch({
      type: 'removeTodo',
      todo: { ...committedNote.todos[index]! },
      index,
    })
  }

  function undo(): void {
    commitPendingText()
    const inverse = undoState(historyState)
    if (!inverse) {
      return
    }
    workingNote.value = applyPatch(workingNote.value, inverse)
    committedNote = cloneNote(workingNote.value)
    syncCounts()
  }

  function redo(): void {
    commitPendingText()
    const patch = redoState(historyState)
    if (!patch) {
      return
    }
    workingNote.value = applyPatch(workingNote.value, patch)
    committedNote = cloneNote(workingNote.value)
    syncCounts()
  }

  function flushToWorkingNote(): Note {
    commitPendingText()
    return workingNote.value
  }

  function resetTo(note: Note): void {
    clearTimer()
    pendingKey = null
    hasPendingChange.value = false
    workingNote.value = cloneNote(note)
    committedNote = cloneNote(note)
    historyState.pasts = []
    historyState.futures = []
    syncCounts()
  }

  function dispose(): void {
    clearTimer()
  }

  return {
    workingNote,
    canUndo,
    canRedo,
    handleTextInput,
    commitPendingText,
    toggleTodo,
    addTodo,
    removeTodo,
    undo,
    redo,
    flushToWorkingNote,
    resetTo,
    dispose,
  }
}
