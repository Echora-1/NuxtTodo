import { afterEach, describe, expect, it } from 'vitest'
import type { Note } from '~/types/note'
import { useEditHistory } from '~/composables/useEditHistory'

function makeNote(): Note {
  return {
    id: 'note-1',
    title: 'Старт',
    todos: [{ id: 'todo-1', text: 'Пункт', isDone: false }],
    createdAt: 0,
    updatedAt: 0,
  }
}

let editor: ReturnType<typeof useEditHistory> | null = null

afterEach(() => {
  editor?.dispose()
  editor = null
})

describe('useEditHistory — коалесинг текста', () => {
  it('непрерывный ввод в одно поле фиксируется одной записью', () => {
    editor = useEditHistory(makeNote())

    editor.workingNote.value.title = 'Старт1'
    editor.handleTextInput({ field: 'title' })
    editor.workingNote.value.title = 'Старт12'
    editor.handleTextInput({ field: 'title' })
    editor.workingNote.value.title = 'Старт123'
    editor.handleTextInput({ field: 'title' })
    editor.commitPendingText()

    expect(editor.canUndo.value).toBe(true)

    editor.undo()

    expect(editor.workingNote.value.title).toBe('Старт')
    expect(editor.canUndo.value).toBe(false)

    editor.redo()
    expect(editor.workingNote.value.title).toBe('Старт123')
  })

  it('ввод без изменения значения не создаёт запись', () => {
    editor = useEditHistory(makeNote())

    editor.handleTextInput({ field: 'title' })
    editor.commitPendingText()

    expect(editor.canUndo.value).toBe(false)
  })

  it('переключение на другое поле фиксирует предыдущее', () => {
    editor = useEditHistory(makeNote())

    editor.workingNote.value.title = 'Новый'
    editor.handleTextInput({ field: 'title' })

    editor.workingNote.value.todos[0]!.text = 'Пункт+'
    editor.handleTextInput({ field: 'todo', todoId: 'todo-1' })
    editor.commitPendingText()

    editor.undo()
    expect(editor.workingNote.value.todos[0]!.text).toBe('Пункт')
    expect(editor.workingNote.value.title).toBe('Новый')

    editor.undo()
    expect(editor.workingNote.value.title).toBe('Старт')
  })
})

describe('useEditHistory — атомарные операции', () => {
  it('отметка чекбокса — отдельная запись', () => {
    editor = useEditHistory(makeNote())

    editor.toggleTodo('todo-1')
    expect(editor.workingNote.value.todos[0]!.isDone).toBe(true)

    editor.undo()
    expect(editor.workingNote.value.todos[0]!.isDone).toBe(false)
  })

  it('добавление и удаление пункта отменяются по одному шагу', () => {
    editor = useEditHistory(makeNote())

    editor.addTodo()
    expect(editor.workingNote.value.todos).toHaveLength(2)

    editor.removeTodo('todo-1')
    expect(editor.workingNote.value.todos).toHaveLength(1)

    editor.undo()
    expect(editor.workingNote.value.todos).toHaveLength(2)

    editor.undo()
    expect(editor.workingNote.value.todos).toHaveLength(1)
    expect(editor.workingNote.value.todos[0]!.id).toBe('todo-1')
  })

  it('атомарная операция сначала фиксирует незавершённый ввод текста', () => {
    editor = useEditHistory(makeNote())

    editor.workingNote.value.title = 'Изменён'
    editor.handleTextInput({ field: 'title' })

    editor.toggleTodo('todo-1')

    editor.undo()
    expect(editor.workingNote.value.todos[0]!.isDone).toBe(false)
    expect(editor.workingNote.value.title).toBe('Изменён')

    editor.undo()
    expect(editor.workingNote.value.title).toBe('Старт')
  })
})

describe('useEditHistory — redo-ветка и сброс', () => {
  it('новое изменение после undo очищает redo', () => {
    editor = useEditHistory(makeNote())

    editor.toggleTodo('todo-1')
    editor.undo()
    expect(editor.canRedo.value).toBe(true)

    editor.addTodo()
    expect(editor.canRedo.value).toBe(false)
  })

  it('resetTo подставляет заметку и обнуляет историю', () => {
    editor = useEditHistory(makeNote())
    editor.toggleTodo('todo-1')

    editor.resetTo({
      id: 'note-1',
      title: 'Черновик',
      todos: [],
      createdAt: 0,
      updatedAt: 0,
    })

    expect(editor.workingNote.value.title).toBe('Черновик')
    expect(editor.workingNote.value.todos).toHaveLength(0)
    expect(editor.canUndo.value).toBe(false)
    expect(editor.canRedo.value).toBe(false)
  })
})
