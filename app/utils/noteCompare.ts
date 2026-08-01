import type { Note } from '~/types/note'

export function stripEmptyTodos(note: Note): Note {
  return {
    ...note,
    todos: note.todos.filter((todo) => todo.text.trim().length > 0),
  }
}

export function notesDiffer(first: Note, second: Note): boolean {
  if (first.title !== second.title) {
    return true
  }
  if (first.todos.length !== second.todos.length) {
    return true
  }
  return first.todos.some((todo, index) => {
    const other = second.todos[index]
    return (
      !other ||
      todo.id !== other.id ||
      todo.text !== other.text ||
      todo.isDone !== other.isDone
    )
  })
}
