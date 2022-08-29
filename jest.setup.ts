// import VueAxios from 'vue-axios'
// import axios from 'axios'
import {jest} from '@jest/globals'
// Vue.use(VueAxios, axios)
// app.use(VueAxios, axios)

global.URL.createObjectURL = <any>jest.fn()

import {TextEncoder} from 'util'

global.TextEncoder = TextEncoder
// global.textDecoder = TextDecoder
// global.ArrayBuffer = ArrayBuffer
// global.Uint8Array = Uint8Array

import {defineComponent} from 'vue'
export default defineComponent({})

// import * as runtimeCore from '@vue/runtime-core'

// global.setImmediate = jest.useRealTimers as unknown as typeof setImmediate
// global.setImmediate = process.nextTick as any
// global.setTimeout = process.nextTick as any

declare module '@vue/runtime-core' {
    export interface ComponentCustomProperties {
      $refs: {
        [key: string]: HTMLElement | any,
      },
      $goto: any,
      // ... more stuff
    }
  }
// jest.setTimeout(5000)
