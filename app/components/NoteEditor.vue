<script setup lang="ts">
import { useForm, useField } from 'vee-validate'
import type { RouteLocationRaw } from 'vue-router'
import type { Note, TodoItem } from '~/types/note'
import { useNotesStore } from '~/stores/notes'
import { requiredText } from '~/utils/validation'
import { useToast } from '~/composables/useToast'

interface Props {
  initialNote: Note
  isNew: boolean
  restorableDraft: Note | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  titleChange: [value: string]
}>()

const notesStore = useNotesStore()
const router = useRouter()

const isMobile = useMediaQuery('(max-width: 639px)')
const primaryActionsTarget = computed(() =>
  isMobile.value ? '#app-actions-slot' : '#app-header-slot',
)

const editor = useEditHistory(props.initialNote)
const {
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
} = editor

const { validate: validateForm } = useForm()
const { showToast } = useToast()

const submitAttempted = ref(false)

const { value: titleFieldValue, errorMessage: titleError } = useField<string>(
  'title',
  requiredText('Введите название заметки'),
  { initialValue: workingNote.value.title, validateOnValueUpdate: true },
)

const titleInvalid = computed(() => submitAttempted.value && !!titleError.value)

watch(
  () => workingNote.value.title,
  (title) => {
    emit('titleChange', title)
    if (titleFieldValue.value !== title) {
      titleFieldValue.value = title
    }
  },
)

const isNewNote = ref(props.isNew)
const { discardDraft } = useDraftAutosave(workingNote, isNewNote)

useEditorHotkeys({ onUndo: undo, onRedo: redo })

const isRestoreOpen = ref(false)
const isCancelOpen = ref(false)
const isDeleteOpen = ref(false)

const bypassLeaveGuard = ref(false)

const pendingLeave = ref<RouteLocationRaw | null>(null)

const isDeletedElsewhere = computed(() =>
  notesStore.isDeletedExternally(props.initialNote.id),
)

const titleInputElem = ref<{ focus: () => void } | null>(null)

onMounted(() => {
  if (props.restorableDraft) {
    isRestoreOpen.value = true
  } else if (isNewNote.value) {
    titleInputElem.value?.focus()
  }
})

onBeforeUnmount(() => {
  editor.dispose()
})

function handleTitleInput(value: string): void {
  workingNote.value.title = value
  handleTextInput({ field: 'title' })
}

function handleTodoTextInput(todo: TodoItem, value: string): void {
  todo.text = value
  handleTextInput({ field: 'todo', todoId: todo.id })
}

function restoreDraft(): void {
  if (props.restorableDraft) {
    resetTo(props.restorableDraft)
  }
  isRestoreOpen.value = false
}

function keepSavedVersion(): void {
  isRestoreOpen.value = false
  discardDraft()
}

async function saveNote(): Promise<void> {
  if (isDeletedElsewhere.value) {
    return
  }
  submitAttempted.value = true
  const { valid, errors } = await validateForm()
  if (!valid) {
    showValidationToasts(errors)
    return
  }
  const note = flushToWorkingNote()
  notesStore.saveNote(note)
  discardDraft()
  bypassLeaveGuard.value = true
  router.push(routes.home)
}

function showValidationToasts(errors: Record<string, string | undefined>): void {
  if (errors.title) {
    showToast(errors.title)
  }
  const hasTodoError = Object.entries(errors).some(
    ([name, message]) => name.startsWith('todo-') && !!message,
  )
  if (hasTodoError) {
    showToast('Заполните текст всех пунктов')
  }
}

function hasUnsavedChanges(): boolean {
  const current = flushToWorkingNote()
  return notesDiffer(
    stripEmptyTodos(current),
    stripEmptyTodos(props.initialNote),
  )
}

onBeforeRouteLeave((to) => {
  if (bypassLeaveGuard.value || !hasUnsavedChanges()) {
    return true
  }
  pendingLeave.value = to.fullPath
  isCancelOpen.value = true
  return false
})

function requestCancel(): void {
  if (!hasUnsavedChanges()) {
    discardDraft()
    bypassLeaveGuard.value = true
    router.push(routes.home)
    return
  }
  pendingLeave.value = routes.home
  isCancelOpen.value = true
}

function confirmCancel(): void {
  isCancelOpen.value = false
  discardDraft()
  bypassLeaveGuard.value = true
  router.push(pendingLeave.value ?? routes.home)
}

function confirmDelete(): void {
  isDeleteOpen.value = false
  if (notesStore.findNoteById(props.initialNote.id)) {
    notesStore.deleteNote(props.initialNote.id)
  }
  discardDraft()
  bypassLeaveGuard.value = true
  router.push(routes.home)
}
</script>

<template>
  <section class="note-editor">
    <p v-if="isDeletedElsewhere" class="note-editor__alert" role="alert">
      Эта заметка была удалена в другой вкладке. Сохранение недоступно.
    </p>

    <Teleport to="#app-header-slot" defer>
      <div class="note-editor__history">
        <TheButton
          variant="primary"
          size="icon"
          :disabled="!canUndo"
          aria-label="Отменить"
          aria-keyshortcuts="Control+Z"
          @click="undo"
        >
          <Icon name="lucide:undo-2" size="18" />
        </TheButton>
        <TheButton
          variant="primary"
          size="icon"
          :disabled="!canRedo"
          aria-label="Повторить"
          aria-keyshortcuts="Control+Shift+Z"
          @click="redo"
        >
          <Icon name="lucide:redo-2" size="18" />
        </TheButton>
      </div>
    </Teleport>

    <Teleport :to="primaryActionsTarget" defer>
      <div class="note-editor__primary-actions">
        <TheButton
          v-if="!isNewNote"
          variant="danger"
          @click="isDeleteOpen = true"
        >
          Удалить
        </TheButton>
        <TheButton variant="secondary" @click="requestCancel">
          Отмена
        </TheButton>
        <TheButton
          variant="primary"
          :disabled="isDeletedElsewhere"
          @click="saveNote"
        >
          Сохранить
        </TheButton>
      </div>
    </Teleport>

    <div class="note-editor__field">
      <label class="note-editor__label" for="note-title">Название</label>
      <TheInput
        id="note-title"
        ref="titleInputElem"
        size="lg"
        :model-value="workingNote.title"
        :is-invalid="titleInvalid"
        placeholder="Введите название"
        @update:model-value="handleTitleInput"
        @blur="commitPendingText"
      />
    </div>

    <div class="note-editor__todos">
      <div class="note-editor__todos-head">
        <span class="note-editor__label">Пункты</span>
      </div>

      <TransitionGroup
        v-if="workingNote.todos.length"
        tag="ul"
        name="editor-todo"
        class="note-editor__todo-list"
      >
        <TodoEditorItem
          v-for="todo in workingNote.todos"
          :key="todo.id"
          :todo="todo"
          :show-errors="submitAttempted"
          @toggle="toggleTodo(todo.id)"
          @remove="removeTodo(todo.id)"
          @text-input="handleTodoTextInput(todo, $event)"
          @text-commit="commitPendingText"
        />
      </TransitionGroup>

      <TheEmptyState
        v-else
        compact
        title="Пунктов пока нет"
        text="Добавьте первый пункт списка."
      />

      <TheButton variant="secondary" @click="addTodo">
        <Icon name="lucide:plus" size="18" />
        Добавить пункт
      </TheButton>
    </div>

    <TheConfirmModal
      :is-open="isRestoreOpen"
      title="Восстановить черновик?"
      message="Найдены несохранённые изменения этой заметки. Восстановить их или открыть сохранённую версию?"
      confirm-text="Восстановить"
      cancel-text="Открыть сохранённую"
      @confirm="restoreDraft"
      @cancel="keepSavedVersion"
    />

    <TheConfirmModal
      :is-open="isCancelOpen"
      title="Отменить редактирование?"
      message="Внесённые изменения будут потеряны."
      confirm-text="Да, отменить"
      cancel-text="Продолжить"
      is-danger
      @confirm="confirmCancel"
      @cancel="isCancelOpen = false"
    />

    <TheConfirmModal
      :is-open="isDeleteOpen"
      title="Удалить заметку?"
      message="Заметка будет удалена без возможности восстановления."
      confirm-text="Удалить"
      cancel-text="Отмена"
      is-danger
      @confirm="confirmDelete"
      @cancel="isDeleteOpen = false"
    />
  </section>
</template>

<style lang="scss">
.note-editor {
  display: flex;
  flex-direction: column;
  gap: $space-5;

  &__alert {
    padding: $space-3 $space-4;
    font-size: 0.9rem;
    color: var(--color-danger);
    background-color: var(--color-surface);
    border: 1px solid var(--color-danger);
    border-radius: $radius-md;
  }

  &__history {
    display: flex;
    align-items: center;
    gap: $space-2;
  }

  &__primary-actions {
    display: flex;
    align-items: center;
    gap: $space-2;

    @include mobile {
      width: 100%;

      .the-button {
        flex: 1;
      }
    }
  }

  &__field,
  &__todos {
    display: flex;
    flex-direction: column;
    gap: $space-3;
  }

  &__label {
    font-family: var(--font-mono);
    font-size: 0.78rem;
    font-weight: 500;
    letter-spacing: 0.02em;
    color: var(--color-text-subtle);
  }

  &__todo-list {
    display: flex;
    flex-direction: column;
    max-height: calc(100dvh - 23rem);
    overflow-y: auto;
    padding: $space-2 $space-4;
    background-color: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: $radius-md;

    @include mobile {
      max-height: calc(100dvh - 25rem);
    }
  }
}

.editor-todo-enter-active,
.editor-todo-leave-active {
  transition: opacity var(--dur-base) var(--ease);
}

.editor-todo-enter-from,
.editor-todo-leave-to {
  opacity: 0;
}

.editor-todo-move {
  transition: transform var(--dur-base) var(--ease);
}
</style>
