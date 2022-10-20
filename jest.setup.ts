import {jest} from '@jest/globals'
import {TextDecoder, TextEncoder} from 'util'
import {defineComponent} from 'vue'

global.URL.createObjectURL = <any>jest.fn()
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

export default defineComponent({})

declare module '@vue/runtime-core' {
  export interface ComponentCustomProperties {
    $refs: {
      [key: string]: any
    }
  }
}
