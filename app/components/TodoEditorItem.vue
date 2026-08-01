<script setup lang="ts">
import { useField } from 'vee-validate'
import type { TodoItem } from '~/types/note'
import { requiredText } from '~/utils/validation'

interface Props {
  todo: TodoItem
  showErrors?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showErrors: false,
})

const { value: textFieldValue, errorMessage: textError } = useField<string>(
  () => `todo-${props.todo.id}`,
  requiredText('Заполните текст всех пунктов'),
  { initialValue: props.todo.text, validateOnValueUpdate: true },
)

watch(
  () => props.todo.text,
  (text) => {
    if (textFieldValue.value !== text) {
      textFieldValue.value = text
    }
  },
)

const isInvalid = computed(() => props.showErrors && !!textError.value)

const emit = defineEmits<{
  toggle: []
  remove: []
  textInput: [value: string]
  textCommit: []
}>()

const checkboxId = useId()

const isEditing = ref(props.todo.text.length === 0)
const inputElem = ref<{ focus: () => void } | null>(null)

const hasText = computed(() => props.todo.text.trim().length > 0)

async function enterEdit(): Promise<void> {
  isEditing.value = true
  await nextTick()
  inputElem.value?.focus()
}

function exitEdit(): void {
  isEditing.value = false
  emit('textCommit')
}

onMounted(() => {
  if (isEditing.value) {
    inputElem.value?.focus()
  }
})
</script>

<template>
  <li class="todo-editor-item">
    <TheCheckbox
      :id="checkboxId"
      :model-value="props.todo.isDone"
      aria-label="Отметить пункт выполненным"
      @update:model-value="emit('toggle')"
    />

    <TheInput
      v-if="isEditing"
      ref="inputElem"
      class="todo-editor-item__field"
      :model-value="props.todo.text"
      :is-completed="props.todo.isDone"
      :is-invalid="isInvalid"
      placeholder="Текст пункта"
      aria-label="Текст пункта"
      @update:model-value="emit('textInput', $event)"
      @keydown.enter.prevent="exitEdit"
      @blur="exitEdit"
    />

    <button
      v-else
      type="button"
      class="todo-editor-item__view"
      :class="{
        'todo-editor-item__view--done': props.todo.isDone,
        'todo-editor-item__view--empty': !hasText,
        'todo-editor-item__view--invalid': isInvalid,
      }"
      :aria-label="`Редактировать пункт${hasText ? `: ${props.todo.text}` : ''}`"
      @click="enterEdit"
    >
      <span class="todo-editor-item__view-text">
        {{ hasText ? props.todo.text : 'Текст пункта' }}
      </span>
    </button>

    <TheButton
      variant="ghost"
      size="icon"
      aria-label="Удалить пункт"
      @click="emit('remove')"
    >
      <Icon name="lucide:x" size="16" />
    </TheButton>
  </li>
</template>

<style lang="scss">
.todo-editor-item {
  display: flex;
  align-items: center;
  gap: $space-2;
  padding: $space-2 0;

  &__field {
    flex: 1;

    line-height: normal;
  }

  &__view {
    display: flex;
    align-items: center;
    flex: 1;
    min-width: 0;
    height: 38px;
    padding: 0 $space-3;
    font-size: 1rem;
    color: var(--color-text);
    border: 1px solid transparent;
    border-radius: $radius-sm;
    cursor: text;
    transition: background-color var(--dur-fast) var(--ease);

    &:hover {
      background-color: var(--color-surface-muted);
    }

    &--done {
      color: var(--color-text-subtle);
      text-decoration: line-through;
    }

    &--empty {
      color: var(--color-text-subtle);
    }

    &--invalid {
      border-color: var(--color-danger);
    }
  }

  &__view-text {
    min-width: 0;
    overflow: hidden;
    line-height: normal;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
