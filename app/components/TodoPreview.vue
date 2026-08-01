<script setup lang="ts">
import type { TodoItem } from '~/types/note'

interface Props {
  todos: TodoItem[]
  limit?: number
}

const props = withDefaults(defineProps<Props>(), {
  limit: 3,
})

const visibleTodos = computed(() => props.todos.slice(0, props.limit))
const hiddenCount = computed(() => Math.max(0, props.todos.length - props.limit))
</script>

<template>
  <div class="todo-preview">
    <ul v-if="visibleTodos.length" class="todo-preview__list">
      <li
        v-for="todo in visibleTodos"
        :key="todo.id"
        class="todo-preview__item"
      >
        <span
          class="todo-preview__marker"
          :class="{ 'todo-preview__marker--done': todo.isDone }"
          aria-hidden="true"
        />
        <span
          class="todo-preview__text"
          :class="{ 'todo-preview__text--done': todo.isDone }"
        >
          {{ todo.text || 'Без текста' }}
        </span>
      </li>
    </ul>

    <p v-else class="todo-preview__empty">Нет пунктов</p>

    <p v-if="hiddenCount" class="todo-preview__more">
      ещё {{ hiddenCount }}
    </p>
  </div>
</template>

<style lang="scss">
.todo-preview {
  display: flex;
  flex-direction: column;
  gap: $space-2;

  &__list {
    display: flex;
    flex-direction: column;
    gap: $space-1;
  }

  &__item {
    display: flex;
    align-items: center;
    gap: $space-2;
    min-width: 0;
  }

  &__marker {
    position: relative;

    top: 1px;
    flex-shrink: 0;
    width: 15px;
    height: 15px;
    border: 1.5px solid var(--color-border-strong);
    border-radius: 4px;

    &--done {
      background-color: var(--color-accent);
      border-color: var(--color-accent);

      &::after {
        content: '';
        position: absolute;
        top: 1px;
        left: 4px;
        width: 4px;
        height: 8px;
        border: solid var(--color-accent-contrast);
        border-width: 0 2px 2px 0;
        transform: rotate(45deg);
      }
    }
  }

  &__text {
    overflow: hidden;
    font-size: 0.9rem;
    color: var(--color-text-muted);
    text-overflow: ellipsis;
    white-space: nowrap;

    &--done {
      color: var(--color-text-subtle);
      text-decoration: line-through;
    }
  }

  &__empty,
  &__more {
    font-size: 0.85rem;
    color: var(--color-text-subtle);
  }
}
</style>
