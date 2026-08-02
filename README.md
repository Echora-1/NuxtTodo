# ✏️ Заметки

[![Live Demo](https://img.shields.io/badge/Live_Demo-2ea44f?style=for-the-badge)](https://echora-1.github.io/NuxtTodo/)

Небольшое SPA для заметок со списками задач на Nuxt 4 + TypeScript. Создание и
редактирование заметок, todo-пункты с отметкой выполнения, история изменений с
undo/redo, черновики несохранённого редактирования и синхронизация между
вкладками.
## Запуск

Локально:

```bash
npm install
npm run dev
```

Приложение будет доступно на `http://localhost:3000`.

Через Docker:

```bash
docker compose up --build
```

## Структура проекта

```
app/
├── components/     # NoteCard, NoteEditor, TodoEditorItem, TodoPreview,
│                   # TheButton, TheInput, TheCheckbox, TheModal,
│                   # TheConfirmModal, TheBreadcrumbs, TheEmptyState, TheToaster
├── composables/    # useEditHistory (undo/redo), useDraftAutosave,
│                   # useEditorHotkeys, useMediaQuery, useToast
├── pages/          # index.vue (список заметок), notes/[id].vue (редактор)
├── stores/         # notes.ts (Pinia-стор заметок)
├── utils/          # history (патчи undo/redo), storage (localStorage),
│                   # tabChannel (кросс-таб), noteCompare, routes, id, validation
├── plugins/        # tab-sync.client.ts (синхронизация вкладок)
├── types/          # note.ts (доменные типы)
├── assets/scss/    # переменные, миксины, глобальные стили (БЭМ)
└── app.vue         # корневой layout (хедер, слоты, тостер)
tests/              # unit-тесты: history, storage, store, editHistory
```
