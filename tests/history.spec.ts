import { describe, expect, it } from 'vitest'
import type { Note, Patch } from '~/types/note'
import {
  applyPatch,
  canRedo,
  canUndo,
  createHistoryState,
  HISTORY_LIMIT,
  invertPatch,
  recordPatch,
  redo,
  undo,
} from '~/utils/history'

function makeNote(): Note {
  return {
    id: 'note-1',
    title: 'Заголовок',
    todos: [
      { id: 'todo-1', text: 'Первый', isDone: false },
      { id: 'todo-2', text: 'Второй', isDone: true },
    ],
    createdAt: 0,
    updatedAt: 0,
  }
}

describe('applyPatch / invertPatch', () => {
  const cases: Patch[] = [
    { type: 'setTitle', prev: 'Заголовок', next: 'Новый' },
    { type: 'setTodoText', todoId: 'todo-1', prev: 'Первый', next: 'Изменённый' },
    { type: 'toggleTodo', todoId: 'todo-1', prev: false, next: true },
    {
      type: 'addTodo',
      todo: { id: 'todo-3', text: 'Третий', isDone: false },
      index: 2,
    },
    {
      type: 'removeTodo',
      todo: { id: 'todo-2', text: 'Второй', isDone: true },
      index: 1,
    },
  ]

  it.each(cases)('обратимо для патча $type', (patch) => {
    const note = makeNote()
    const changed = applyPatch(note, patch)
    const restored = applyPatch(changed, invertPatch(patch))

    expect(restored).toEqual(note)

    expect(note).toEqual(makeNote())
  })

  it('setTitle меняет только заголовок', () => {
    const note = makeNote()
    const changed = applyPatch(note, { type: 'setTitle', prev: 'Заголовок', next: 'X' })
    expect(changed.title).toBe('X')
    expect(changed.todos).toEqual(note.todos)
  })

  it('addTodo вставляет пункт по индексу', () => {
    const note = makeNote()
    const changed = applyPatch(note, {
      type: 'addTodo',
      todo: { id: 'todo-9', text: 'Вставка', isDone: false },
      index: 1,
    })
    expect(changed.todos.map((todo) => todo.id)).toEqual([
      'todo-1',
      'todo-9',
      'todo-2',
    ])
  })
})

describe('стек истории', () => {
  it('recordPatch добавляет шаг и очищает redo-ветку', () => {
    const state = createHistoryState()
    state.futures.push({ type: 'setTitle', prev: 'a', next: 'b' })

    recordPatch(state, { type: 'setTitle', prev: 'x', next: 'y' })

    expect(state.pasts).toHaveLength(1)
    expect(state.futures).toHaveLength(0)
  })

  it('undo возвращает обратный патч и переносит шаг в futures', () => {
    const state = createHistoryState()
    const patch: Patch = { type: 'toggleTodo', todoId: 'todo-1', prev: false, next: true }
    recordPatch(state, patch)

    const inverse = undo(state)

    expect(inverse).toEqual({
      type: 'toggleTodo',
      todoId: 'todo-1',
      prev: true,
      next: false,
    })
    expect(state.pasts).toHaveLength(0)
    expect(state.futures).toHaveLength(1)
  })

  it('redo возвращает исходный патч и переносит шаг обратно', () => {
    const state = createHistoryState()
    const patch: Patch = { type: 'setTitle', prev: 'a', next: 'b' }
    recordPatch(state, patch)
    undo(state)

    const repeated = redo(state)

    expect(repeated).toEqual(patch)
    expect(state.pasts).toHaveLength(1)
    expect(state.futures).toHaveLength(0)
  })

  it('undo и redo применяются к заметке согласованно', () => {
    const note = makeNote()
    const state = createHistoryState()
    const patch: Patch = { type: 'setTitle', prev: 'Заголовок', next: 'После' }

    const afterApply = applyPatch(note, patch)
    recordPatch(state, patch)

    const undone = applyPatch(afterApply, undo(state)!)
    expect(undone.title).toBe('Заголовок')

    const redone = applyPatch(undone, redo(state)!)
    expect(redone.title).toBe('После')
  })

  it('undo/redo на пустом стеке возвращает null', () => {
    const state = createHistoryState()
    expect(undo(state)).toBeNull()
    expect(redo(state)).toBeNull()
  })

  it('canUndo / canRedo отражают состояние стека', () => {
    const state = createHistoryState()
    expect(canUndo(state)).toBe(false)
    expect(canRedo(state)).toBe(false)

    recordPatch(state, { type: 'setTitle', prev: 'a', next: 'b' })
    expect(canUndo(state)).toBe(true)

    undo(state)
    expect(canUndo(state)).toBe(false)
    expect(canRedo(state)).toBe(true)
  })

  it('история ограничена лимитом и не хранит копии заметки', () => {
    const state = createHistoryState()

    for (let step = 0; step < HISTORY_LIMIT + 10; step += 1) {
      recordPatch(state, {
        type: 'setTitle',
        prev: String(step),
        next: String(step + 1),
      })
    }

    expect(state.pasts).toHaveLength(HISTORY_LIMIT)

    const oldest = state.pasts[0]
    expect(oldest).toMatchObject({ type: 'setTitle', prev: '10' })
  })
})
