<script setup lang="ts">
import type { Note } from '~/types/note'
import { useNotesStore } from '~/stores/notes'
import { clearDraft, loadDraft } from '~/utils/storage'

type EditorStatus = 'edit' | 'not-found'

interface EditorResolution {
  status: EditorStatus
  initialNote: Note
  isNew: boolean
  restorableDraft: Note | null
}

const route = useRoute()
const notesStore = useNotesStore()

const noteId = String(route.params.id)

function createEmptyNote(id: string): Note {
  return { id, title: '', todos: [], createdAt: 0, updatedAt: 0 }
}

function resolveEditorState(): EditorResolution {
  const stored = notesStore.findNoteById(noteId)
  const draft = loadDraft()
  const draftForThis = draft && draft.noteId === noteId ? draft : null

  if (stored) {
    const isMeaningful =
      draftForThis !== null &&
      notesDiffer(stripEmptyTodos(draftForThis.note), stripEmptyTodos(stored))

    if (draftForThis && !isMeaningful) {
      clearDraft()
    }

    return {
      status: 'edit',
      initialNote: stored,
      isNew: false,
      restorableDraft: isMeaningful ? draftForThis!.note : null,
    }
  }

  if (route.query.new === '1') {
    return {
      status: 'edit',
      initialNote: createEmptyNote(noteId),
      isNew: true,
      restorableDraft: draftForThis ? draftForThis.note : null,
    }
  }

  if (draftForThis) {
    return {
      status: 'edit',
      initialNote: createEmptyNote(noteId),
      isNew: draftForThis.isNew,
      restorableDraft: draftForThis.note,
    }
  }

  return {
    status: 'not-found',
    initialNote: createEmptyNote(noteId),
    isNew: false,
    restorableDraft: null,
  }
}

const resolution = resolveEditorState()

const liveTitle = ref(resolution.initialNote.title)

const breadcrumbItems = computed(() => {
  let current: string
  if (resolution.status === 'not-found') {
    current = 'Не найдено'
  } else if (resolution.isNew) {
    current = 'Новая заметка'
  } else {
    current = liveTitle.value.trim()
  }
  return [{ label: 'Мои заметки', to: routes.home }, { label: current }]
})

const isNotFound = computed(() => resolution.status === 'not-found')

const pageTitle = computed(() => {
  if (resolution.status === 'not-found') {
    return 'Заметка не найдена'
  }
  if (resolution.isNew) {
    return 'Новая заметка'
  }
  const name = liveTitle.value.trim()
  return name ? `Заметка | ${name}` : 'Заметка'
})

useHead({ title: pageTitle })
</script>

<template>
  <div class="edit-page">

    <TheBreadcrumbs :items="breadcrumbItems" class="edit-page__crumbs" />

    <Teleport v-if="isNotFound" to="#app-header-slot" defer>
      <NuxtLink :to="routes.home" class="edit-page__home-link">
        Мои заметки
      </NuxtLink>
    </Teleport>

    <NoteEditor
      v-if="resolution.status === 'edit'"
      :initial-note="resolution.initialNote"
      :is-new="resolution.isNew"
      :restorable-draft="resolution.restorableDraft"
      @title-change="liveTitle = $event"
    />

    <TheEmptyState
      v-else
      title-tag="h1"
      title="Заметка не найдена"
      text="Возможно, она была удалена или ссылка неверна."
    >
      <NuxtLink :to="routes.home">
        <TheButton variant="primary">Вернуться к списку</TheButton>
      </NuxtLink>
    </TheEmptyState>
  </div>
</template>

<style lang="scss">
.edit-page {
  display: flex;
  flex-direction: column;
  gap: $space-4;

  &__home-link {
    font-size: 1.15rem;
    font-weight: 600;
    letter-spacing: -0.01em;
    color: var(--color-text);
    transition: color var(--dur-fast) var(--ease);

    &:hover {
      color: var(--color-text-muted);
    }
  }
}
</style>
