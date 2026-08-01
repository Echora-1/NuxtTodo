import { ref, readonly, type Ref } from 'vue'
import { generateId } from '~/utils/id'

export type ToastType = 'error' | 'info'

export interface ToastItem {
  id: string
  message: string
  type: ToastType
}

interface ShowOptions {
  type?: ToastType
  duration?: number
}

const DEFAULT_DURATION = 4000

const items = ref<ToastItem[]>([])
const timers = new Map<string, ReturnType<typeof setTimeout>>()

function clearTimer(id: string): void {
  const timer = timers.get(id)
  if (timer) {
    clearTimeout(timer)
    timers.delete(id)
  }
}

function dismiss(id: string): void {
  clearTimer(id)
  items.value = items.value.filter((toast) => toast.id !== id)
}

function showToast(message: string, opts: ShowOptions = {}): void {

  if (items.value.some((toast) => toast.message === message)) {
    return
  }
  const id = generateId()
  const duration = opts.duration ?? DEFAULT_DURATION
  items.value = [...items.value, { id, message, type: opts.type ?? 'error' }]
  timers.set(
    id,
    setTimeout(() => dismiss(id), duration),
  )
}

export function useToast(): {
  toasts: Readonly<Ref<ToastItem[]>>
  showToast: (message: string, opts?: ShowOptions) => void
  dismiss: (id: string) => void
} {
  return {
    toasts: readonly(items) as Readonly<Ref<ToastItem[]>>,
    showToast,
    dismiss,
  }
}
