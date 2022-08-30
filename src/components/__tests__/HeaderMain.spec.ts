// @ts-nocheck
import HeaderMain from '@/components/HeaderMain.vue'
import {default as packageJson} from '@/../package.json'
import {describe, test, expect} from '@jest/globals'
import {mount} from '@vue/test-utils'

describe('HeaderMain.vue', () => {
  test('should render the logo', () => {
    // const logoPath = 'http://localhost/assets/logo.png' // webRoot
    const wrapper = mount(HeaderMain)
    const element = wrapper.find('.logo').element as HTMLImageElement
    console.log('logo src', element['src'] as string)
    expect(element['src'].length > 0).toBeTruthy()
  })

  test('should render version from package.json', () => {
    const appVersion = packageJson.version
    const wrapper = mount(HeaderMain)
    expect(wrapper.find('div.version-box').text()).toContain(appVersion)
  })

  test('should render default version when no version found', async () => {
    const defaultVersion = '0.0.0'
    const wrapper = mount(HeaderMain)
    await wrapper.setData({version: null})
    expect(wrapper.find('div.version-box').text()).toContain(defaultVersion)
  })
})
