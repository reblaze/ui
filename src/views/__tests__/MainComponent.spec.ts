// @ts-nocheck
import MainComponent from '../MainComponent.vue'
import {beforeEach, describe, expect, jest, test} from '@jest/globals'
import {DOMWrapper, shallowMount, VueWrapper} from '@vue/test-utils'
import {createTestingPinia} from '@pinia/testing'

const mockRoute = {
  params: {
    branch: 'prod',
  },
  path: '/prod/dashboard',
  name: 'DashboardDisplay',
}
jest.mock('vue-router', () => ({
  useRoute: jest.fn(() => (mockRoute)),
}))

describe('MainComponent.vue', () => {
  let wrapper: VueWrapper
  beforeEach(() => {
    const $route = {
      path: '/prod/dashboard',
    }
    wrapper = shallowMount(MainComponent, {
      global: {
        mocks: {
          $route,
        },
        plugins: [createTestingPinia()],
        stubs: ['router-link', 'router-view'],
      },
    })
  })

  test('should render side menu component', () => {
    const component: DOMWrapper = wrapper.find('side-menu')
    expect(component).toBeTruthy()
  })

  test('should render header component', () => {
    const component: DOMWrapper = wrapper.find('header-main')
    expect(component).toBeTruthy()
  })
})
