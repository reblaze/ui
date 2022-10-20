import {createApp} from 'vue'
import App from './App.vue'
import router from './router'
import './assets/styles/main.scss'
import {createPinia} from 'pinia'
import axios from 'axios'
import VueAxios from 'vue-axios'
import VueSidebarMenu from 'vue-sidebar-menu'
import 'vue-sidebar-menu/dist/vue-sidebar-menu.css'

const pinia = createPinia()
const app = createApp(App)

app.use(pinia)
app.use(router)
app.use(VueAxios, axios)
app.use(VueSidebarMenu)

app.mount('#app')
declare module '@vue/runtime-core' {
  export interface ComponentCustomProperties {
    $refs: {
      [key: string]: any,
    },
  }
}
