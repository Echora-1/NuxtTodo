import * as vue from 'vue'

Object.assign(globalThis, {
  ref: vue.ref,
  computed: vue.computed,
  reactive: vue.reactive,
  watch: vue.watch,
  watchEffect: vue.watchEffect,
  shallowRef: vue.shallowRef,
})
