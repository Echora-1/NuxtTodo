interface EditorHotkeyHandlers {
  onUndo: () => void
  onRedo: () => void
}

export function useEditorHotkeys(handlers: EditorHotkeyHandlers): void {
  function handleKeydown(event: KeyboardEvent): void {
    const isModifier = event.ctrlKey || event.metaKey
    if (!isModifier) {
      return
    }

    const key = event.key.toLowerCase()

    if (key === 'z') {
      event.preventDefault()
      if (event.shiftKey) {
        handlers.onRedo()
      } else {
        handlers.onUndo()
      }
      return
    }

    if (key === 'y' && !event.shiftKey) {
      event.preventDefault()
      handlers.onRedo()
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', handleKeydown)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('keydown', handleKeydown)
  })
}
