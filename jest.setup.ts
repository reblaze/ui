import {jest} from '@jest/globals'
import {TextEncoder, TextDecoder} from 'util'

globalThis.URL.createObjectURL = <any>jest.fn()
globalThis.TextEncoder = TextEncoder
// @ts-ignore
globalThis.TextDecoder = TextDecoder

import {defineComponent} from 'vue'
export default defineComponent({})

declare module '@vue/runtime-core' {
    export interface ComponentCustomProperties {
      $refs: {
        [key: string]: HTMLElement | any,
      },
      $goto: any,
      // ... more stuff
    }
  }
