<script setup lang="ts">
type InputSize = 'md' | 'lg'

interface Props {
  modelValue: string
  placeholder?: string
  ariaLabel?: string
  id?: string
  size?: InputSize
  isCompleted?: boolean
  isInvalid?: boolean
}

withDefaults(defineProps<Props>(), {
  placeholder: '',
  ariaLabel: undefined,
  id: undefined,
  size: 'md',
  isCompleted: false,
  isInvalid: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  blur: []
}>()

const inputElem = ref<HTMLInputElement | null>(null)

function handleInput(event: Event): void {
  emit('update:modelValue', (event.target as HTMLInputElement).value)
}

defineExpose({
  focus: () => inputElem.value?.focus(),
})
</script>

<template>
  <input
    :id="id"
    ref="inputElem"
    class="the-input"
    :class="[
      `the-input--${size}`,
      { 'the-input--completed': isCompleted, 'the-input--invalid': isInvalid },
    ]"
    type="text"
    :value="modelValue"
    :placeholder="placeholder"
    :aria-label="ariaLabel"
    :aria-invalid="isInvalid || undefined"
    @input="handleInput"
    @blur="emit('blur')"
  />
</template>

<style lang="scss">
.the-input {
  width: 100%;
  min-width: 0;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: $radius-sm;
  transition: border-color var(--dur-fast) var(--ease);

  &:hover {
    border-color: var(--color-border-strong);
  }

  &:focus-visible {
    border-color: var(--color-accent);
    outline: none;
  }

  &--md {
    height: 38px;
    padding: 0 $space-3;
  }

  &--lg {
    height: 48px;
    padding: 0 $space-4;
    font-size: 1.05rem;
    font-weight: 600;
    border-radius: $radius-md;
  }

  &--completed {
    color: var(--color-text-subtle);
    text-decoration: line-through;
  }

  &--invalid {
    border-color: var(--color-danger);

    &:hover,
    &:focus-visible {
      border-color: var(--color-danger);
    }
  }
}
</style>
