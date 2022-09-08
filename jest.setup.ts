import {jest} from '@jest/globals'
import {TextEncoder, TextDecoder} from 'util'

global.URL.createObjectURL = <any>jest.fn()
global.TextEncoder = TextEncoder

global.TextDecoder = TextDecoder

import {defineComponent} from 'vue'
export default defineComponent({})

declare module '@vue/runtime-core' {
    export interface ComponentCustomProperties {
      $refs: {
        [key: string]: any
      }
    }
  }
