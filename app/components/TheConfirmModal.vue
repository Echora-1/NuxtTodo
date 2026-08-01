<script setup lang="ts">
interface Props {
  isOpen: boolean
  title: string
  message?: string
  confirmText?: string
  cancelText?: string
  isDanger?: boolean
}

withDefaults(defineProps<Props>(), {
  message: '',
  confirmText: 'Подтвердить',
  cancelText: 'Отмена',
  isDanger: false,
})

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()
</script>

<template>
  <TheModal :is-open="isOpen" :title="title" @close="emit('cancel')">
    <p v-if="message" class="confirm-modal__message">{{ message }}</p>

    <template #footer>
      <TheButton variant="ghost" @click="emit('cancel')">
        {{ cancelText }}
      </TheButton>
      <TheButton
        :variant="isDanger ? 'danger' : 'primary'"
        @click="emit('confirm')"
      >
        {{ confirmText }}
      </TheButton>
    </template>
  </TheModal>
</template>

<style lang="scss">
.confirm-modal__message {
  margin: 0;
}
</style>
