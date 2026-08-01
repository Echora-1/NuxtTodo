<script setup lang="ts">
import { useToast } from '~/composables/useToast'

const { toasts, dismiss } = useToast()
</script>

<template>
  <Teleport to="body">
    <div class="the-toaster" aria-live="assertive" aria-atomic="false">
      <TransitionGroup name="toast">
        <button
          v-for="toast in toasts"
          :key="toast.id"
          type="button"
          class="the-toaster__item"
          :class="`the-toaster__item--${toast.type}`"
          @click="dismiss(toast.id)"
        >
          <Icon
            v-if="toast.type === 'error'"
            name="lucide:circle-alert"
            size="18"
          />
          <span class="the-toaster__text">{{ toast.message }}</span>
        </button>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style lang="scss">
.the-toaster {
  position: fixed;

  top: calc(60px + #{$space-3});
  right: $space-4;
  z-index: 50;
  display: flex;
  flex-direction: column;
  gap: $space-2;
  max-width: min(360px, calc(100vw - #{$space-4} * 2));
  pointer-events: none;

  @include desktop {
    right: $space-5;
  }

  &__item {
    display: flex;
    align-items: center;
    gap: $space-2;
    width: 100%;
    padding: $space-3 $space-4;
    text-align: left;
    color: var(--color-text);
    background-color: var(--color-surface);
    border: 1px solid var(--color-border);
    border-left: 3px solid var(--color-border-strong);
    border-radius: $radius-md;
    box-shadow: 0 6px 20px rgb(0 0 0 / 12%);
    cursor: pointer;
    pointer-events: auto;

    &--error {
      border-left-color: var(--color-danger);

      .icon {
        color: var(--color-danger);
      }
    }
  }

  &__text {
    font-size: 0.9rem;
    line-height: 1.3;
  }
}

.toast-enter-active,
.toast-leave-active {
  transition:
    opacity var(--dur-base) var(--ease),
    transform var(--dur-base) var(--ease);
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(12px);
}

.toast-move {
  transition: transform var(--dur-base) var(--ease);
}

@media (prefers-reduced-motion: reduce) {
  .toast-enter-active,
  .toast-leave-active,
  .toast-move {
    transition: none;
  }

  .toast-enter-from,
  .toast-leave-to {
    transform: none;
  }
}
</style>
