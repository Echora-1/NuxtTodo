export type TabMessage =
  | { type: 'notes-updated' }
  | { type: 'note-deleted'; id: string }

const CHANNEL_NAME = 'nuxt-todo'
const FALLBACK_KEY = 'nuxt-todo/bus'

let channel: BroadcastChannel | null = null
let isChannelResolved = false

function getChannel(): BroadcastChannel | null {
  if (isChannelResolved) {
    return channel
  }

  isChannelResolved = true

  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    channel = new BroadcastChannel(CHANNEL_NAME)
  }

  return channel
}

export function postTabMessage(message: TabMessage): void {
  const activeChannel = getChannel()

  if (activeChannel) {
    activeChannel.postMessage(message)
    return
  }

  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(
        FALLBACK_KEY,
        JSON.stringify({ message, nonce: Date.now() + Math.random() }),
      )
    } catch {

    }
  }
}

export function onTabMessage(handler: (message: TabMessage) => void): () => void {
  const activeChannel = getChannel()

  if (activeChannel) {
    const listener = (event: MessageEvent<TabMessage>) => handler(event.data)
    activeChannel.addEventListener('message', listener)
    return () => activeChannel.removeEventListener('message', listener)
  }

  if (typeof window === 'undefined') {
    return () => {}
  }

  const storageListener = (event: StorageEvent) => {
    if (event.key !== FALLBACK_KEY || !event.newValue) {
      return
    }
    try {
      const parsed = JSON.parse(event.newValue) as { message: TabMessage }
      handler(parsed.message)
    } catch {

    }
  }

  window.addEventListener('storage', storageListener)
  return () => window.removeEventListener('storage', storageListener)
}
