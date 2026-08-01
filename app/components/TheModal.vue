<script setup lang="ts">
interface Props {
  isOpen: boolean
  title?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
})

const emit = defineEmits<{
  close: []
}>()

const dialogElem = ref<HTMLDialogElement | null>(null)
const titleId = useId()

watch(
  () => props.isOpen,
  (isOpen) => {
    const dialog = dialogElem.value
    if (!dialog) {
      return
    }

    if (isOpen && !dialog.open) {
      dialog.showModal()
    } else if (!isOpen && dialog.open) {
      dialog.close()
    }
  },
)

onMounted(() => {
  if (props.isOpen && dialogElem.value && !dialogElem.value.open) {
    dialogElem.value.showModal()
  }
})

function handleClose(): void {
  if (props.isOpen) {
    emit('close')
  }
}

function handleBackdropClick(event: MouseEvent): void {
  const dialog = dialogElem.value
  if (!dialog || 'closedBy' in HTMLDialogElement.prototype) {
    return
  }
  if (event.target !== dialog) {
    return
  }

  const rect = dialog.getBoundingClientRect()
  const isInsideBox =
    rect.top <= event.clientY &&
    event.clientY <= rect.top + rect.height &&
    rect.left <= event.clientX &&
    event.clientX <= rect.left + rect.width

  if (!isInsideBox) {
    dialog.close()
  }
}
</script>

<template>
  <dialog
    ref="dialogElem"
    class="the-modal"
    closedby="any"
    :aria-labelledby="title ? titleId : undefined"
    @close="handleClose"
    @click="handleBackdropClick"
  >
    <div class="the-modal__content">
      <header v-if="title" class="the-modal__header">
        <h2 :id="titleId" class="the-modal__title">{{ title }}</h2>
      </header>

      <div class="the-modal__body">
        <slot />
      </div>

      <footer v-if="$slots.footer" class="the-modal__footer">
        <slot name="footer" />
      </footer>
    </div>
  </dialog>
</template>

<style lang="scss">
.the-modal {

  margin: auto;
  width: calc(100% - #{$space-4 * 2});
  max-width: 420px;
  padding: 0;
  color: var(--color-text);
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: $radius-lg;
  box-shadow: var(--shadow-md);

  &[open] {
    animation: the-modal-in var(--dur-base) var(--ease);
  }

  &::backdrop {
    background-color: var(--color-overlay);
    animation: the-modal-backdrop var(--dur-base) var(--ease);
  }

  &__content {
    display: flex;
    flex-direction: column;
    gap: $space-4;
    padding: $space-5;
  }

  &__title {
    font-size: 1.15rem;
    font-weight: 600;
    letter-spacing: -0.01em;
  }

  &__body {
    color: var(--color-text-muted);
    line-height: 1.55;
  }

  &__footer {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: $space-2;

    margin-inline: -#{$space-5};
    padding: $space-4 $space-5 0;
    border-top: 1px solid var(--color-border);
  }
}

@keyframes the-modal-in {
  from {
    opacity: 0;
    transform: translateY(8px) scale(0.98);
  }
}

@keyframes the-modal-backdrop {
  from {
    opacity: 0;
  }
}
</style>
