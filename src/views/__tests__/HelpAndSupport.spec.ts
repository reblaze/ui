// @ts-nocheck
import HelpAndSupport from '@/views/HelpAndSupport.vue'
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
  path: `/${selectedBranch}/support`,
  name: 'Support',
}
jest.mock('vue-router', () => ({
  useRoute: jest.fn(() => (mockRoute)),
}))
jest.mock('../../assets/RequestsUtils.ts')

describe('HelpAndSupport.vue', () => {
  let wrapper: VueWrapper
  let mockRouter: any
  beforeEach(async () => {
    mockRouter = {
      push: jest.fn(),
    }
    wrapper = shallowMount(HelpAndSupport, {
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

  describe('contact support card', () => {
    test('should exit', async () => {
      const contactSupportCard = wrapper.find('.contact-support-card')
      expect(contactSupportCard.exists()).toBeTruthy()
    })

    test('should contain the support email', async () => {
      const contactSupportCard = wrapper.find('.contact-support-card')
      const email = contactSupportCard.find('.email')
      expect(email.text()).toContain('support@reblaze.com')
    })

    test('should contain the correct phone numbers', async () => {
      const contactSupportCard = wrapper.find('.contact-support-card')
      const phoneNumbers = contactSupportCard.find('.phone-numbers')
      expect(phoneNumbers.text()).toContain('+ 1 (888) 6155996')
      expect(phoneNumbers.text()).toContain('+ 972 (73) 2005230')
      expect(phoneNumbers.text()).toContain('+ 44 (808) 1751950')
    })
  })

  describe('manager escalation card', () => {
    test('should exit', async () => {
      const managerEscalationCard = wrapper.find('.manager-escalation-card')
      expect(managerEscalationCard.exists()).toBeTruthy()
    })

    test('should contain the manager email', async () => {
      const managerEscalationCard = wrapper.find('.manager-escalation-card')
      const email = managerEscalationCard.find('.email')
      expect(email.text()).toContain('manager.escalation@reblaze.com')
    })
  })
})
