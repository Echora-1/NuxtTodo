import { beforeEach, describe, expect, it } from 'vitest'
import type { Note } from '~/types/note'
import {
  clearDraft,
  loadDraft,
  loadNotes,
  saveDraft,
  saveNotes,
  SCHEMA_VERSION,
} from '~/utils/storage'

const NOTES_KEY = 'nuxt-todo/notes'
const DRAFT_KEY = 'nuxt-todo/draft'

function makeNote(id = 'note-1'): Note {
  return {
    id,
    title: 'Список дел',
    todos: [{ id: 'todo-1', text: 'Купить хлеб', isDone: false }],
    createdAt: 1,
    updatedAt: 2,
  }
}

beforeEach(() => {
  localStorage.clear()
})

describe('saveNotes / loadNotes', () => {
  it('сохраняет и читает заметки', () => {
    const notes = [makeNote(), makeNote('note-2')]
    saveNotes(notes)

    expect(loadNotes()).toEqual(notes)
  })

  it('записывает актуальную версию схемы', () => {
    saveNotes([makeNote()])

    const raw = JSON.parse(localStorage.getItem(NOTES_KEY) as string)
    expect(raw.schemaVersion).toBe(SCHEMA_VERSION)
  })

  it('возвращает пустой список при отсутствии данных', () => {
    expect(loadNotes()).toEqual([])
  })

  it('возвращает пустой список при битом JSON', () => {
    localStorage.setItem(NOTES_KEY, '{ это не json')
    expect(loadNotes()).toEqual([])
  })

  it('игнорирует несовместимую версию схемы', () => {
    localStorage.setItem(
      NOTES_KEY,
      JSON.stringify({ schemaVersion: SCHEMA_VERSION + 1, notes: [makeNote()] }),
    )
    expect(loadNotes()).toEqual([])
  })

  it('отфильтровывает некорректные заметки', () => {
    localStorage.setItem(
      NOTES_KEY,
      JSON.stringify({
        schemaVersion: SCHEMA_VERSION,
        notes: [makeNote(), { id: 'broken' }, { title: 'нет id' }],
      }),
    )

    const loaded = loadNotes()
    expect(loaded).toHaveLength(1)
    expect(loaded[0]?.id).toBe('note-1')
  })
})

describe('черновик', () => {
  it('сохраняет и читает черновик с флагом isNew', () => {
    saveDraft(makeNote(), true)

    const draft = loadDraft()
    expect(draft?.noteId).toBe('note-1')
    expect(draft?.isNew).toBe(true)
    expect(draft?.note).toEqual(makeNote())
    expect(draft?.schemaVersion).toBe(SCHEMA_VERSION)
  })

  it('clearDraft удаляет черновик', () => {
    saveDraft(makeNote(), false)
    clearDraft()

    expect(loadDraft()).toBeNull()
    expect(localStorage.getItem(DRAFT_KEY)).toBeNull()
  })

  it('возвращает null при несовместимой версии черновика', () => {
    localStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({
        schemaVersion: SCHEMA_VERSION + 1,
        noteId: 'note-1',
        note: makeNote(),
        isNew: false,
        updatedAt: 0,
      }),
    )
    expect(loadDraft()).toBeNull()
  })
})
