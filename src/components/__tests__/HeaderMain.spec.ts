// @ts-nocheck
import HeaderMain from '@/components/HeaderMain.vue'
import packageJson from '@/../package.json'
import {describe, test, expect} from '@jest/globals'
import {mount} from '@vue/test-utils'

describe('HeaderMain.vue', () => {
  test.skip('should render the logo with alt=logo', () => {
    const wrapper = mount(HeaderMain)
    const element = wrapper.find('img.logo').element as HTMLImageElement
    expect(element['alt']).toEqual('logo')
  })

  test.skip('should render the logo', (done) => {
    const wrapper = mount(HeaderMain)
    const element = wrapper.find('img.logo').element as HTMLImageElement
    setImmediate(() => {
      expect(element['src']).toEqual('http://localhost/logo.png')
      done()
    })
  })

  test.skip('should render version from package.json', () => {
    const appVersion = packageJson.version
    const wrapper = mount(HeaderMain)
    expect(wrapper.find('div.version-box').text()).toContain(appVersion)
  })

  test.skip('should render default version when no version found', async () => {
    const defaultVersion = '0.0.0'
    const wrapper = mount(HeaderMain)
    await wrapper.setData({version: null})
    expect(wrapper.find('div.version-box').text()).toContain(defaultVersion)
  })
})
