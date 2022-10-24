// @ts-nocheck
import HeaderMain from '@/components/HeaderMain.vue'
import packageJson from '@/../package.json'
import {describe, test, expect} from '@jest/globals'
import {mount} from '@vue/test-utils'
import RequestsUtils from '../../assets/RequestsUtils'

describe('HeaderMain.vue', () => {
  test('should render the logo with alt=logo', () => {
    const wrapper = mount(HeaderMain)
    const element = wrapper.find('img.logo').element as HTMLImageElement
    expect(element['alt']).toEqual('logo')
  })

  test('should render ui version from package.json', () => {
    const appVersion = packageJson.version
    const wrapper = mount(HeaderMain)
    expect(wrapper.find('.ui-version').text()).toContain(appVersion)
  })

  test('should render default ui version when no version found', async () => {
    const defaultVersion = '0.0.0'
    const wrapper = mount(HeaderMain)
    await wrapper.setData({clientVersion: null})
    expect(wrapper.find('.ui-version').text()).toContain(defaultVersion)
  })

  test('should render api version from RequestsUtils', () => {
    const apiVersion = RequestsUtils.reblazeAPIVersion
    const wrapper = mount(HeaderMain)
    expect(wrapper.find('.api-version').text()).toContain(apiVersion)
  })

  test('should render default api version when no version found', async () => {
    const defaultVersion = '0.0.0'
    const wrapper = mount(HeaderMain)
    await wrapper.setData({apiVersion: null})
    expect(wrapper.find('.api-version').text()).toContain(defaultVersion)
  })
})
