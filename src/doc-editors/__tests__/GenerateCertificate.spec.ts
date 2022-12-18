// @ts-nocheck
import GenerateCertificate from '@/doc-editors/popups/GenerateCertificate.vue'
import {beforeEach, describe, expect, jest, test} from '@jest/globals'
import {mount, VueWrapper} from '@vue/test-utils'
import {Certificate} from '@/types'
import RequestsUtils, {IRequestParams} from '../../assets/RequestsUtils'
import {nextTick} from 'vue'

const selectedBranch = 'prod'
const mockRoute = {
  params: {
    branch: selectedBranch,
  },
  path: `/${selectedBranch}/ssl/list`,
  name: 'SSL/list',
}
jest.mock('vue-router', () => ({
  useRoute: jest.fn(() => (mockRoute)),
}))
jest.mock('../../assets/RequestsUtils.ts')

describe('GenerateCertificate.vue', () => {
  let sendReblazeRequestSpy: any
  let mockRouter: any
  let wrapper: VueWrapper
  beforeEach(async () => {
    sendReblazeRequestSpy = jest.spyOn(RequestsUtils, 'sendReblazeRequest').mockImplementation(
        (requestParams: IRequestParams) => {
          if (requestParams.url === `configs/${selectedBranch}/d/certificates/e/placeholder`) {
            return Promise.resolve({data: certificateMock})
          }
          return Promise.resolve({data: []})
        },
    )
    mockRouter = {
      push: jest.fn(),
    }
    wrapper = mount(GenerateCertificate, {
      global: {
      },
      props: {
        selectedBranch: selectedBranch,
      },
    })
    await nextTick()
  })
  afterEach(() => {
    jest.clearAllMocks()
    jest.clearAllTimers()
  })

  test('should check manual input by default', () => {
    const manualInput = wrapper.find('.man-input-title')
    expect(manualInput.text()).toBe('Input Certificate Manually')
  })

  test('should change the manual input message', () => {
    const manualInput = wrapper.find('.man-input-title')
    expect(manualInput.text()).toBe('Input Certificate Manually')
  })
})
