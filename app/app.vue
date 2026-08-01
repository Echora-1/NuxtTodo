<template>
  <div class="app-shell">

    <header class="app-shell__header">
      <div class="app-shell__inner app-shell__bar">
        <div id="app-header-slot" class="app-shell__slot" />
      </div>
    </header>

    <main class="app-shell__main">
      <div class="app-shell__inner">
        <NuxtPage />
      </div>
    </main>

    <div class="app-shell__actions">
      <div class="app-shell__inner">
        <div id="app-actions-slot" class="app-shell__actions-slot" />
      </div>
    </div>

    <TheToaster />
  </div>
</template>

<style lang="scss">
.app-shell {
  display: flex;
  flex-direction: column;
  min-height: 100vh;

  &__header {
    position: sticky;
    top: 0;
    z-index: 10;
    background-color: var(--color-surface);
    border-bottom: 1px solid var(--color-border);
  }

  &__header:not(:has(.app-shell__slot > *)) {
    display: none;
  }

  &__inner {
    width: 100%;
    max-width: 880px;
    margin: 0 auto;
    padding: 0 $space-4;

    @include desktop {
      padding: 0 $space-5;
    }
  }

  &__bar {
    display: flex;
    align-items: center;
    min-height: 60px;
  }

  &__slot {
    display: flex;
    flex: 1;
    align-items: center;
    justify-content: space-between;
    gap: $space-3;
    min-width: 0;
  }

  &__main {
    flex: 1;
    padding: $space-5 0 $space-8;
  }

  &:has(.app-shell__actions-slot > *) &__main {
    padding-bottom: 96px;
  }

  &__actions {
    position: fixed;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 20;
    background-color: var(--color-surface);
    border-top: 1px solid var(--color-border);
    padding: $space-2 0 calc(#{$space-2} + env(safe-area-inset-bottom));
  }

  &__actions:not(:has(.app-shell__actions-slot > *)) {
    display: none;
  }

  &__actions-slot {
    display: flex;
    align-items: center;
  }
}
</style>
