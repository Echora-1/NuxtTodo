import type { RouteLocationRaw } from 'vue-router'

export const routes = {

  home: '/' as RouteLocationRaw,
  note: (id: string): RouteLocationRaw => `/notes/${id}`,
  newNote: (id: string): RouteLocationRaw => ({
    path: `/notes/${id}`,
    query: { new: '1' },
  }),
}
