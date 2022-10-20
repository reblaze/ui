// @ts-nocheck
import MainComponent from '../MainComponent.vue'
import {describe, test, expect, beforeEach} from '@jest/globals'
import {DOMWrapper, shallowMount, VueWrapper} from '@vue/test-utils'

// TODO: Resolve pinia integration with jest and remove this skip
describe.skip('MainComponent.vue', () => {
  let wrapper: VueWrapper
  beforeEach(() => {
    const $route = {
      path: '/config',
    }
    wrapper = shallowMount(MainComponent, {
      global: {
        mocks: {
          $route,
        },
      },
      stubs: ['router-link', 'router-view'],
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
