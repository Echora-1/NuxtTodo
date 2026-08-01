import { defineStore } from 'pinia'
import type { Note } from '~/types/note'
import { loadNotes, saveNotes } from '~/utils/storage'
import { postTabMessage, type TabMessage } from '~/utils/tabChannel'

export const useNotesStore = defineStore('notes', () => {
  const notes = ref<Note[]>([])
  const isLoaded = ref(false)

  const externallyDeletedIds = ref<string[]>([])

  const notesByRecent = computed(() =>
    [...notes.value].sort((first, second) => second.updatedAt - first.updatedAt),
  )

  function loadFromStorage(): void {
    notes.value = loadNotes()
    isLoaded.value = true
  }

  function findNoteById(id: string): Note | null {
    return notes.value.find((note) => note.id === id) ?? null
  }

  function persist(): void {
    saveNotes(notes.value)
  }

  function saveNote(note: Note): void {
    const now = Date.now()
    const index = notes.value.findIndex((item) => item.id === note.id)
    const stamped: Note = { ...note, updatedAt: now }

    if (index === -1) {
      notes.value.push({ ...stamped, createdAt: stamped.createdAt || now })
    } else {
      notes.value[index] = stamped
    }

    persist()
    postTabMessage({ type: 'notes-updated' })
  }

  function deleteNote(id: string): void {
    notes.value = notes.value.filter((note) => note.id !== id)
    persist()
    postTabMessage({ type: 'note-deleted', id })
  }

  function handleTabMessage(message: TabMessage): void {
    if (message.type === 'notes-updated') {
      notes.value = loadNotes()
      return
    }

    if (message.type === 'note-deleted') {
      notes.value = notes.value.filter((note) => note.id !== message.id)
      if (!externallyDeletedIds.value.includes(message.id)) {
        externallyDeletedIds.value.push(message.id)
      }
    }
  }

  function isDeletedExternally(id: string): boolean {
    return externallyDeletedIds.value.includes(id)
  }

  return {
    notes,
    isLoaded,
    externallyDeletedIds,
    notesByRecent,
    loadFromStorage,
    findNoteById,
    saveNote,
    deleteNote,
    handleTabMessage,
    isDeletedExternally,
  }
})
