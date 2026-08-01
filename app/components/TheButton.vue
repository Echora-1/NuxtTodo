<script setup lang="ts">
type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'md' | 'icon'

interface Props {
  variant?: ButtonVariant
  size?: ButtonSize
  type?: 'button' | 'submit'
  disabled?: boolean
}

withDefaults(defineProps<Props>(), {
  variant: 'secondary',
  size: 'md',
  type: 'button',
  disabled: false,
})
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    :class="['the-button', `the-button--${variant}`, `the-button--${size}`]"
  >
    <slot />
  </button>
</template>

<style lang="scss">
.the-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: $space-2;
  min-height: 40px;
  padding: 0 $space-4;
  font-size: 0.94rem;
  font-weight: 500;
  white-space: nowrap;
  border: 1px solid transparent;
  border-radius: $radius-md;
  transition:
    background-color var(--dur-fast) var(--ease),
    border-color var(--dur-fast) var(--ease),
    transform var(--dur-fast) var(--ease),
    opacity var(--dur-fast) var(--ease);

  &:not(:disabled):active {
    transform: translateY(1px);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  &--primary {
    color: var(--color-accent-contrast);
    background-color: var(--color-accent);
  }

  &--primary:not(:disabled):hover {
    opacity: 0.88;
  }

  &--secondary {
    color: var(--color-text);
    background-color: var(--color-surface);
    border-color: var(--color-border-strong);
  }

  &--secondary:not(:disabled):hover {
    background-color: var(--color-surface-muted);
  }

  &--ghost {
    color: var(--color-text-muted);
    background-color: transparent;
  }

  &--ghost:not(:disabled):hover {
    color: var(--color-text);
    background-color: var(--color-surface-muted);
  }

  &--danger {
    color: var(--color-danger-contrast);
    background-color: var(--color-danger);
  }

  &--danger:not(:disabled):hover {
    opacity: 0.9;
  }

  &--icon {
    width: 36px;
    min-height: 36px;
    padding: 0;
    font-size: 1.4rem;
    line-height: 1;
  }
}
</style>
