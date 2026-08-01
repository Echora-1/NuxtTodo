<script setup lang="ts">
interface Props {
  modelValue: boolean
  ariaLabel?: string
  id?: string
}

withDefaults(defineProps<Props>(), {
  ariaLabel: undefined,
  id: undefined,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

function handleChange(event: Event): void {
  emit('update:modelValue', (event.target as HTMLInputElement).checked)
}
</script>

<template>
  <input
    :id="id"
    class="the-checkbox"
    type="checkbox"
    :checked="modelValue"
    :aria-label="ariaLabel"
    @change="handleChange"
  />
</template>

<style lang="scss">
.the-checkbox {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  accent-color: var(--color-accent);
  cursor: pointer;
}
</style>
