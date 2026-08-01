<script setup lang="ts">
import type { Note } from '~/types/note'

interface Props {
  note: Note
}

const props = defineProps<Props>()

const emit = defineEmits<{
  delete: []
}>()

const displayTitle = computed(() => props.note.title.trim())
const totalCount = computed(() => props.note.todos.length)
const doneCount = computed(
  () => props.note.todos.filter((todo) => todo.isDone).length,
)
const doneRatio = computed(() =>
  totalCount.value ? doneCount.value / totalCount.value : 0,
)
</script>

<template>
  <article class="note-card">
    <button
      class="note-card__delete"
      type="button"
      aria-label="Удалить заметку"
      @click="emit('delete')"
    >
      <Icon name="lucide:x" size="15" />
    </button>

    <NuxtLink
      :to="routes.note(props.note.id)"
      class="note-card__link"
      :aria-label="`Редактировать заметку «${displayTitle}»`"
    >
      <div class="note-card__head">
        <h2 class="note-card__title">
          {{ displayTitle }}
        </h2>
        <span v-if="totalCount" class="note-card__counter u-mono">
          {{ doneCount }}/{{ totalCount }}
        </span>
      </div>

      <div v-if="totalCount" class="note-card__progress" aria-hidden="true">
        <span
          class="note-card__progress-fill"
          :style="{ transform: `scaleX(${doneRatio})` }"
        />
      </div>

      <TodoPreview :todos="props.note.todos" class="note-card__preview" />
    </NuxtLink>
  </article>
</template>

<style lang="scss">
.note-card {
  position: relative;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: $radius-lg;
  box-shadow: var(--shadow-sm);
  transition:
    border-color var(--dur-base) var(--ease),
    box-shadow var(--dur-base) var(--ease),
    transform var(--dur-base) var(--ease);

  &:hover {
    border-color: var(--color-border-strong);
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
  }

  &__link {
    display: flex;
    flex-direction: column;
    gap: $space-3;
    padding: $space-4;
    border-radius: $radius-lg;
  }

  &__head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: $space-3;
  }

  &__title {
    font-size: 1.1rem;
    font-weight: 600;
    letter-spacing: -0.01em;
    overflow-wrap: anywhere;
  }

  &__counter {
    flex-shrink: 0;
    font-size: 0.78rem;
    color: var(--color-text-subtle);
  }

  &__progress {
    height: 3px;
    overflow: hidden;
    background-color: var(--color-surface-muted);
    border-radius: 999px;
  }

  &__progress-fill {
    display: block;
    height: 100%;
    background-color: var(--color-accent);
    border-radius: inherit;
    transform-origin: left center;
    transition: transform var(--dur-base) var(--ease);
  }

  &__delete {
    position: absolute;
    top: -9px;
    right: -9px;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    color: var(--color-text-muted);
    background-color: var(--color-surface);
    border: 1px solid var(--color-border-strong);
    border-radius: 50%;
    box-shadow: var(--shadow-sm);
    opacity: 0;
    transform: scale(0.8);
    transition:
      opacity var(--dur-fast) var(--ease),
      transform var(--dur-fast) var(--ease),
      color var(--dur-fast) var(--ease),
      border-color var(--dur-fast) var(--ease);

    &:hover {
      color: var(--color-danger);
      border-color: var(--color-danger);
    }
  }

  &:hover &__delete,
  &:focus-within &__delete,
  &__delete:focus-visible {
    opacity: 1;
    transform: scale(1);
  }
}

@media (hover: none) {
  .note-card__delete {
    opacity: 1;
    transform: none;
  }
}
</style>
