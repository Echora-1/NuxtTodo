import { useNotesStore } from '~/stores/notes'
import { onTabMessage } from '~/utils/tabChannel'

export default defineNuxtPlugin(() => {
  const notesStore = useNotesStore()
  notesStore.loadFromStorage()

  const unsubscribe = onTabMessage((message) => {
    notesStore.handleTabMessage(message)
  })

  if (import.meta.hot) {
    import.meta.hot.dispose(unsubscribe)
  }
})
