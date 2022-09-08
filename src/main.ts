import {createApp} from 'vue'
import App from './App.vue'
import router from './router'
import './assets/styles/main.scss'
import axios from 'axios'
import VueAxios from 'vue-axios'

const app = createApp(App)

app.use(router)

app.use(VueAxios, axios)

app.mount('#app')
declare module '@vue/runtime-core' {
    export interface ComponentCustomProperties {
      $refs: {
        [key: string]: any,
      },
    }
  }
