// @ts-nocheck
import PremiumPage from '@/views/PremiumPage.vue'
import {afterEach, beforeEach, describe, expect, jest, test} from '@jest/globals'
import {shallowMount, VueWrapper} from '@vue/test-utils'
import {nextTick} from 'vue'
import {createTestingPinia} from '@pinia/testing'
import {useBranchesStore} from '../../stores/BranchesStore'

const selectedBranch = 'prod'
const mockRoute = {
  params: {
    branch: selectedBranch,
  },
  path: `/${selectedBranch}/premium`,
  name: 'Premium',
}
jest.mock('vue-router', () => ({
  useRoute: jest.fn(() => (mockRoute)),
}))
jest.mock('../../assets/RequestsUtils.ts')

describe('PremiumPage.vue', () => {
  let wrapper: VueWrapper
  let mockRouter: any
  beforeEach(async () => {
    mockRouter = {
      push: jest.fn(),
    }
    wrapper = shallowMount(PremiumPage, {
      global: {
        mocks: {
          $route: mockRoute,
          $router: mockRouter,
        },
        plugins: [createTestingPinia()],
      },
    })
    const store = useBranchesStore()
    store.selectedBranchId = selectedBranch
    await nextTick()
  })
  afterEach(() => {
    jest.clearAllMocks()
  })

  test('should display an appropriate message about the feature not being enables', async () => {
    const wantedMessage = 'The feature you attempted to access is not enabled for the open source version and requires the premium version.'
    expect(wrapper.text()).toContain(wantedMessage)
  })

  test('should display an appropriate message about contacting Reblaze', async () => {
    const wantedMessage = 'Please contact Reblaze in order to upgrade your subscription and receive access to the premium features.'
    expect(wrapper.text()).toContain(wantedMessage)
  })
})
