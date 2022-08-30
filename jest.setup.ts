import '@testing-library/jest-dom'

// import VueAxios from 'vue-axios'
// import axios from 'axios'
import {jest} from '@jest/globals'
// Vue.use(VueAxios, axios)
// app.use(VueAxios, axios)

global.URL.createObjectURL = <any>jest.fn()
