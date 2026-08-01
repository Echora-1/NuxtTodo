<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'

interface BreadcrumbItem {
  label: string

  to?: RouteLocationRaw
}

interface Props {
  items: BreadcrumbItem[]
}

defineProps<Props>()
</script>

<template>
  <nav class="breadcrumbs" aria-label="Хлебные крошки">
    <ol class="breadcrumbs__list">
      <li
        v-for="(item, index) in items"
        :key="index"
        class="breadcrumbs__item"
      >
        <NuxtLink
          v-if="item.to"
          :to="item.to"
          class="breadcrumbs__link"
        >
          {{ item.label }}
        </NuxtLink>
        <span v-else class="breadcrumbs__current" aria-current="page">
          {{ item.label }}
        </span>

        <span
          v-if="index < items.length - 1"
          class="breadcrumbs__separator"
          aria-hidden="true"
        >
          /
        </span>
      </li>
    </ol>
  </nav>
</template>

<style lang="scss">
.breadcrumbs {
  max-width: 100%;
  min-width: 0;

  &__list {
    display: flex;
    align-items: center;

    flex-wrap: nowrap;
    min-width: 0;
  }

  &__item {
    display: flex;
    align-items: center;
    min-width: 0;

    &:not(:last-child) {
      flex-shrink: 0;
    }
  }

  &__link {
    font-size: 0.9rem;
    font-weight: 500;
    color: var(--color-text-muted);
    white-space: nowrap;
    transition: color var(--dur-fast) var(--ease);

    &:hover {
      color: var(--color-text);
    }
  }

  &__current {
    display: block;
    overflow: hidden;
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--color-text);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__separator {
    flex-shrink: 0;
    padding: 0 $space-2;
    color: var(--color-text-subtle);
    user-select: none;
  }
}
</style>
