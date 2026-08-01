<script setup lang="ts">
import { MasonryWall } from '@yeger/vue-masonry-wall'
import type { Note } from '~/types/note'
import { useNotesStore } from '~/stores/notes'
import { generateId } from '~/utils/id'

const notesStore = useNotesStore()
const router = useRouter()

const isMobile = useMediaQuery('(max-width: 639px)')

useHead({ title: 'Мои заметки' })

const pendingDeleteId = ref<string | null>(null)

const pendingDeleteTitle = computed(() => {
  if (!pendingDeleteId.value) {
    return ''
  }
  const note = notesStore.findNoteById(pendingDeleteId.value)
  return note?.title.trim() ?? ''
})

function createNote(): void {
  const id = generateId()
  router.push(routes.newNote(id))
}

function requestDelete(id: string): void {
  pendingDeleteId.value = id
}

function confirmDelete(): void {
  if (pendingDeleteId.value) {
    notesStore.deleteNote(pendingDeleteId.value)
  }
  pendingDeleteId.value = null
}
</script>

<template>
  <div class="notes-page">
    <Teleport to="#app-header-slot" defer>
      <div class="home-header">
        <div class="home-header__title-group">
          <h1 class="home-header__title">Мои заметки</h1>
          <span
            v-if="notesStore.notesByRecent.length"
            class="home-header__count u-mono"
          >
            {{ notesStore.notesByRecent.length }}
          </span>
        </div>
        <TheButton v-if="!isMobile" variant="primary" @click="createNote">
          <Icon name="lucide:plus" />
          Новая заметка
        </TheButton>
      </div>
    </Teleport>

    <Teleport v-if="isMobile" to="#app-actions-slot" defer>
      <TheButton
        class="home-header__add-mobile"
        variant="primary"
        @click="createNote"
      >
        <Icon name="lucide:plus" />
        Новая заметка
      </TheButton>
    </Teleport>

    <MasonryWall
      v-if="notesStore.notesByRecent.length"
      class="notes-page__wall"
      :items="notesStore.notesByRecent"
      :column-width="260"
      :gap="16"
      :max-columns="3"
      :key-mapper="(note: Note) => note.id"
    >
      <template #default="{ item }">
        <NoteCard :note="item" @delete="requestDelete(item.id)" />
      </template>
    </MasonryWall>

    <TheEmptyState
      v-else
      title="Заметок пока нет"
      text="Создайте первую заметку, чтобы собрать список задач."
    />

    <TheConfirmModal
      :is-open="pendingDeleteId !== null"
      title="Удалить заметку?"
      :message="`Заметка «${pendingDeleteTitle}» будет удалена без возможности восстановления.`"
      confirm-text="Удалить"
      cancel-text="Отмена"
      is-danger
      @confirm="confirmDelete"
      @cancel="pendingDeleteId = null"
    />
  </div>
</template>

<style lang="scss">

.home-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $space-3;
  width: 100%;

  &__title-group {
    display: flex;
    align-items: center;
    gap: $space-3;
    min-width: 0;
  }

  &__title {
    overflow: hidden;
    font-size: 1.15rem;
    font-weight: 600;
    letter-spacing: -0.01em;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__count {
    flex-shrink: 0;
    min-width: 24px;
    padding: 2px $space-2;
    font-size: 0.76rem;
    text-align: center;
    color: var(--color-text-muted);
    background-color: var(--color-surface-muted);
    border-radius: 999px;
  }

  &__add-mobile {
    flex: 1;
  }
}

.notes-page {
  display: flex;
  flex-direction: column;
  gap: $space-5;
}
</style>
