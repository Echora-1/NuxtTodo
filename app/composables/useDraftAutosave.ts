import type { Ref } from 'vue'
import type { Note } from '~/types/note'
import { clearDraft, saveDraft } from '~/utils/storage'

const AUTOSAVE_DELAY = 400

export function useDraftAutosave(workingNote: Ref<Note>, isNew: Ref<boolean>) {
  let timer: ReturnType<typeof setTimeout> | null = null

  function scheduleSave(): void {
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      saveDraft(workingNote.value, isNew.value)
    }, AUTOSAVE_DELAY)
  }

  const stopWatch = watch(workingNote, scheduleSave, { deep: true })

  function cancelPendingSave(): void {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
  }

  function discardDraft(): void {
    cancelPendingSave()
    clearDraft()
  }

  onBeforeUnmount(() => {
    cancelPendingSave()
    stopWatch()
  })

  return { discardDraft }
}
