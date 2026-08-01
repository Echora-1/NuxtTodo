import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import type { Note } from '~/types/note'
import { useNotesStore } from '~/stores/notes'
import { loadNotes } from '~/utils/storage'

function makeNote(id: string, title = 'Заметка'): Note {
  return { id, title, todos: [], createdAt: 0, updatedAt: 0 }
}

beforeEach(() => {
  localStorage.clear()
  setActivePinia(createPinia())
})

describe('notes store', () => {
  it('загружает заметки из хранилища', () => {
    localStorage.setItem(
      'nuxt-todo/notes',
      JSON.stringify({ schemaVersion: 1, notes: [makeNote('a')] }),
    )

    const store = useNotesStore()
    store.loadFromStorage()

    expect(store.notes).toHaveLength(1)
    expect(store.isLoaded).toBe(true)
  })

  it('saveNote создаёт новую заметку и сохраняет в хранилище', () => {
    const store = useNotesStore()
    store.saveNote(makeNote('a', 'Новая'))

    expect(store.notes).toHaveLength(1)
    expect(store.findNoteById('a')?.title).toBe('Новая')

    expect(loadNotes()).toHaveLength(1)
  })

  it('saveNote обновляет существующую заметку без дублирования', () => {
    const store = useNotesStore()
    store.saveNote(makeNote('a', 'Первое'))
    store.saveNote(makeNote('a', 'Второе'))

    expect(store.notes).toHaveLength(1)
    expect(store.findNoteById('a')?.title).toBe('Второе')
  })

  it('saveNote проставляет updatedAt', () => {
    const store = useNotesStore()
    store.saveNote(makeNote('a'))
    expect(store.findNoteById('a')?.updatedAt).toBeGreaterThan(0)
  })

  it('deleteNote удаляет заметку и обновляет хранилище', () => {
    const store = useNotesStore()
    store.saveNote(makeNote('a'))
    store.saveNote(makeNote('b'))

    store.deleteNote('a')

    expect(store.notes).toHaveLength(1)
    expect(store.findNoteById('a')).toBeNull()
    expect(loadNotes().map((note) => note.id)).toEqual(['b'])
  })

  it('findNoteById возвращает null для несуществующего id', () => {
    const store = useNotesStore()
    expect(store.findNoteById('missing')).toBeNull()
  })

  it('notesByRecent сортирует по времени изменения по убыванию', async () => {
    const store = useNotesStore()
    store.saveNote(makeNote('a'))
    await new Promise((resolve) => setTimeout(resolve, 2))
    store.saveNote(makeNote('b'))

    expect(store.notesByRecent.map((note) => note.id)).toEqual(['b', 'a'])
  })
})

describe('кросс-таб сообщения', () => {
  it('notes-updated перечитывает заметки из хранилища', () => {
    const store = useNotesStore()
    localStorage.setItem(
      'nuxt-todo/notes',
      JSON.stringify({ schemaVersion: 1, notes: [makeNote('x')] }),
    )

    store.handleTabMessage({ type: 'notes-updated' })

    expect(store.findNoteById('x')?.id).toBe('x')
  })

  it('note-deleted убирает заметку и помечает её удалённой в другой вкладке', () => {
    const store = useNotesStore()
    store.saveNote(makeNote('a'))

    store.handleTabMessage({ type: 'note-deleted', id: 'a' })

    expect(store.findNoteById('a')).toBeNull()
    expect(store.isDeletedExternally('a')).toBe(true)
  })
})
