import type { Ref } from 'vue'

export function useMediaQuery(query: string): Ref<boolean> {
  const matches = ref(false)

  if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
    const mediaQuery = window.matchMedia(query)
    matches.value = mediaQuery.matches

    const handleChange = (event: MediaQueryListEvent) => {
      matches.value = event.matches
    }

    mediaQuery.addEventListener('change', handleChange)
    onScopeDispose(() => mediaQuery.removeEventListener('change', handleChange))
  }

  return matches
}
