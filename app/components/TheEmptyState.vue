<script setup lang="ts">
interface Props {
  title: string
  text?: string

  titleTag?: string

  compact?: boolean
}

withDefaults(defineProps<Props>(), {
  text: '',
  titleTag: 'p',
  compact: false,
})
</script>

<template>
  <div class="empty-state" :class="{ 'empty-state--compact': compact }">
    <component :is="titleTag" class="empty-state__title">{{ title }}</component>
    <p v-if="text" class="empty-state__text">{{ text }}</p>
    <div v-if="$slots.default" class="empty-state__actions">
      <slot />
    </div>
  </div>
</template>

<style lang="scss">
.empty-state {
  display: flex;
  flex-direction: column;
  gap: $space-2;
  align-items: center;
  padding: $space-8 $space-4;
  text-align: center;
  background-color: var(--color-surface);
  border: 1px dashed var(--color-border-strong);
  border-radius: $radius-lg;

  &--compact {
    padding: $space-5 $space-4;
  }

  &__title {
    font-size: 1.1rem;
    font-weight: 600;
  }

  &__text {
    color: var(--color-text-muted);
  }

  &__actions {
    margin-top: $space-2;
  }
}
</style>
