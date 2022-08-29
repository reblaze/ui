declare module '*.vue' {
  import type {DefineComponent} from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

import { defineComponent } from 'vue'
export default defineComponent({})

import * as runtimeCore from '@vue/runtime-core'

declare module '@vue/runtime-core' {
  export interface ComponentCustomProperties {
    $refs: {
      [key: string]: HTMLElement | any,
    },
    $goto: any,
    // ... more stuff
  }
}


// declare module '*.vue' {
//     import type {defineComponent} from 'vue'
//     const component: ReturnType<typeof defineComponent>
//     export default component
//   }


