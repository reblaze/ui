// @ts-nocheck
import DeleteCertificate from '@/doc-editors/popups/DeleteCertificate.vue'
import {beforeEach, describe, expect, jest, test} from '@jest/globals'
import {mount, VueWrapper} from '@vue/test-utils'
import {Certificate} from '@/types'
import DeleteCertificate from '@/doc-editors/popups/DeleteCertificate.vue'
import {createTestingPinia} from '@pinia/testing'
import {nextTick} from 'vue'
import {useBranchesStore} from '../../stores/BranchesStore'
import RequestsUtils, {IRequestParams} from '../../assets/RequestsUtils'
import Utils from '../../assets/Utils'
import DatasetsUtils from '../../assets/DatasetsUtils'

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

describe('DeleteCertificate.vue', () => {
  let attachedAppsMock: string
  let certificateMock: Certificate
  let mockRouter: any
  let wrapper: VueWrapper
  // let sendReblazeRequestSpy: any
  beforeEach(async () => {
    certificateMock = {
        'cert_body': '-----BEGIN CERTIFICATE-----\ntest-cert-1\n-----END CERTIFICATE-----\n',
        'exp_date': '2027-06-09',
        'id': 'placeholder',
        'issuer': 'C=US, ST=New York, O=Kramerica Industries, L=New York, CN=kramericaindustries.kramericaindustries',
        'le_auto_renew': false,
        'le_auto_replace': false,
        'le_hash': '',
        'links': [
          {
            'link': 'arn:aws:acm:eu-west-1:588266063552:certificate/e2d3af86-60b7-4d46-a3d2-5b6b1f7b0323',
            'provider': 'aws',
            'region': 'eu-west-1',
          },
        ],
        'name': 'test-certificate-name-1',
        'san': [],
        'subject': 'C=US, ST=New York, O=Kramerica Industries, L=New York, CN=kramericaindustries.kramericaindustries',
        'upload_time': '2022-10-20 17:21:46.982976',
      }
    /* sitesMock = [
      {
        'id': '__default__',
        'mobile_sdk': '',
        'name': 'test-site-1',
        'proxy_template': '__default__',
        'routing_profile': '__default__',
        'security_policy': '__default__',
        'server_names': [
          'fire-asd.rbzdevavih002ohbs.dev.rbzdns.com',
        ],
        'ssl_certificate': 'placeholder',
      },
      {
        'description': 'New Site Description and Remarks',
        'id': '90e76f075a82',
        'mobile_sdk': '',
        'name': 'test-site-2',
        'proxy_template': '__default__',
        'routing_profile': '__default__',
        'security_policy': '__default__',
        'server_names': [
          'www.example.com',
        ],
        'ssl_certificate': 'd8ad5b1156c0',
      },
      {
        'description': 'New Site Description and Remarks',
        'id': '6523f661e2e3',
        'mobile_sdk': '',
        'name': 'test-site-3',
        'proxy_template': '__default__',
        'routing_profile': '__default__',
        'security_policy': '__default__',
        'server_names': [
          'www.example.com',
        ],
        'ssl_certificate': 'd8ad5b1156c0',
      },
      {
        'description': 'New Site Description and Remarks 4',
        'id': '6523f661e2e4',
        'mobile_sdk': '',
        'name': 'test-site-4',
        'proxy_template': '__default__4',
        'routing_profile': '__default__4',
        'security_policy': '__default__4',
        'server_names': [
          'www.example4.com',
        ],
        'ssl_certificate': '',
      },
    ] */
    attachedAppsMock = "test-site-1\ntest-site-2\ntest-site-3"
    mockRouter = {
      push: jest.fn(),
    }
    wrapper = mount(DeleteCertificate, {
      global: {
        mocks: {
          $route: mockRoute,
          $router: mockRouter,
        },
        plugins: [createTestingPinia()],
      },
      props: {
        certificate: certificateMock,
        selectedBranch: selectedBranch,
        attachedApps: attachedAppsMock,
      },
    })
    const store = useBranchesStore()
    store.selectedBranchId = selectedBranch
    await nextTick()
  })
  afterEach(() => {
    jest.clearAllMocks()
    jest.clearAllTimers()
  })

    test('should delete certificate modal introduce the name of the correct certificate', () => {
      const remainSentense = 'Are you sure you want to remove certificate '
      expect(wrapper.find('.certificate-name').text()).toBe(`${remainSentense}${certificateMock.name}?`)
    })

    test('should close the modal on X button', async () => {
      const xButton = wrapper.find('.exit-delete-modal')
      await xButton.trigger('click')
      expect(wrapper.find('.delete-modal').exists()).toBeFalsy()
    })

})
