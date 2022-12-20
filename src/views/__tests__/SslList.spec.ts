// @ts-nocheck
import SslList from '../SslList.vue'
import {beforeEach, describe, expect, jest, test} from '@jest/globals'
import {mount, VueWrapper} from '@vue/test-utils'
import {LoadBalancer, Certificate, Site} from '@/types'
import GenerateCertificate from '@/doc-editors/popups/GenerateCertificate.vue'
import DeleteCertificate from '@/doc-editors/popups/DeleteCertificate.vue'
import EditCertificate from '@/doc-editors/popups/EditCertificate.vue'
// import AttachCertificate from '@/doc-editors/popups/AttachCertificate.vue'
import {createTestingPinia} from '@pinia/testing'
import {nextTick} from 'vue'
import {useBranchesStore} from '../../stores/BranchesStore'
import RequestsUtils, {IRequestParams} from '../../assets/RequestsUtils'
// import Utils from '../../assets/Utils'
// import DatasetsUtils from '../../assets/DatasetsUtils'

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

describe('SslList.vue', () => {
  let loadBalancerMock: LoadBalancer[]
  let certificateMock: Certificate[]
  let sitesMock: Site[]
  let mockRouter: any
  let wrapper: VueWrapper
  let sendReblazeRequestSpy: any
  beforeEach(async () => {
    loadBalancerMock = [
      {
        'certificates': ['arn:aws:acm:eu-west-1:588266063552:certificate/e2d3af86-60b7-4d46-a3d2-5b6b1f7b0323'],
        'default_certificate': 'test-certificate-name-3',
        'dns_name': 'rbzdevavih002-prod-alb-784708966.eu-west-1.elb.amazonaws.com',
        'elb_version': 2,
        'hosted_zoned_id': 'Z32O12XQLNTSW2',
        'listener_name': 'Listener-name-1',
        'listener_port': 1,
        'load_balancer_type': 'application',
        'name': 'test-balancer-name-1',
        'provider': 'aws',
        'region': 'eu-west-1',
      },
      {
        'certificates': ['arn:aws:acm:eu-west-1:588266063552:certificate/e2d3af86-60b7-4d46-a3d2-5b6b1f7b0323', 'arn:aws:acm:eu-west-1:588266063552:certificate/c1e4b216-79be-42e1-b837-39898be39754'],
        'default_certificate': 'test-certificate-name-3',
        'dns_name': 'rbzdevavih002-prod-alb-784708966.eu-west-1.elb.amazonaws.com',
        'elb_version': 2,
        'hosted_zoned_id': 'Z32O12XQLNTSW2',
        'listener_name': 'Listener-name-2',
        'listener_port': 2,
        'load_balancer_type': 'application',
        'name': 'test-balancer-name-2',
        'provider': 'aws',
        'region': 'eu-west-1',
      },
      {
        'certificates': [],
        'default_certificate': 'test-certificate-name-1',
        'dns_name': 'rbzdevavih002-stage-alb-242899288.eu-west-1.elb.amazonaws.com',
        'elb_version': 2,
        'hosted_zoned_id': 'Z32O12XQLNTSW2',
        'listener_name': 'Listener-name-3',
        'listener_port': 3,
        'load_balancer_type': 'application',
        'name': 'test-balancer-name-3',
        'provider': 'aws',
        'region': 'eu-west-1',
      },
    ]
    certificateMock = [
      {
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
        'san': ['fire-asd.rbzdevavih002ohbs.dev.rbzdns.com'],
        'subject': 'C=US, ST=New York, O=Kramerica Industries, L=New York, CN=kramericaindustries.kramericaindustries',
        'upload_time': '2022-10-20 17:21:46.982976',
      },
      {
        'cert_body': '-----BEGIN CERTIFICATE-----\ntest-cert-2\n-----END CERTIFICATE-----\n',
        'exp_date': '2023-02-22',
        'id': 'd8ad5b1156c0',
        'issuer': 'C=US, O=Let\'s Encrypt, CN=R3',
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
        'name': 'test-certificate-name-2',
        'san': [
          'www.example.com',
        ],
        'subject': 'CN=test-com.rbzdevsaforb.dev.rbzdns.com',
        'upload_time': '2022-11-28 12:28:24.819755',
      },
      {
        'cert_body': '-----BEGIN CERTIFICATE-----\ntest-cert-3\n-----END CERTIFICATE-----\n',
        'exp_date': '2023-02-26',
        'id': '16a0c52d56bd',
        'issuer': 'C=US, O=Let\'s Encrypt, CN=R3',
        'le_auto_renew': false,
        'le_auto_replace': false,
        'le_hash': '56d7fd3d7d8346bf9b027221ec97bd08',
        'links': [],
        'name': 'test-certificate-name-3',
        'san': [
          'fire-asd.rbzdevavih002ohbs.dev.rbzdns.com',
        ],
        'subject': 'CN=fire-asd.rbzdevavih002ohbs.dev.rbzdns.com',
        'upload_time': '2022-11-28',
      },
    ]
    sitesMock = [
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
        'description': 'New Server Group Description and Remarks',
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
        'description': 'New Server Group Description and Remarks',
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
        'description': 'New Server Group Description and Remarks 4',
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
    ]
    sendReblazeRequestSpy = jest.spyOn(RequestsUtils, 'sendReblazeRequest').mockImplementation(
      (requestParams: IRequestParams) => {
        if (requestParams.url === `config/load-balancers/`) {
          return Promise.resolve({data: loadBalancerMock})
        }
        if (requestParams.url === `configs/${selectedBranch}/d/certificates/`) {
          return Promise.resolve({data: certificateMock})
        }
        if (requestParams.url === `configs/${selectedBranch}/d/sites/`) {
          return Promise.resolve({data: sitesMock})
        }
        return Promise.resolve({data: []})
      },
    )
    mockRouter = {
      push: jest.fn(),
    }
    wrapper = mount(SslList, {
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
    jest.clearAllTimers()
  })

  describe('tabs', () => {
    test('should check if load balancers tab is checked by default', () => {
      const loadBalancersTab = wrapper.find('.load-balancers-tab')
      expect(loadBalancersTab.element.classList).toContain('is-active')
    })

    test('should not choosed by default the certificates tab', () => {
      const certificatesTab = wrapper.find('.certificates-tab')
      expect(certificatesTab.element.classList).not.toContain('is-active')
    })

    test('should open the certificates tab correct', async () => {
      const certificatesTab = wrapper.find('.certificates-tab')
      await certificatesTab.find('a').trigger('click')
      expect(certificatesTab.element.classList).toContain('is-active')
    })
  })

  /* describe('load balancers', () => {
    test(`should load correct column options`, async () => {
      wrapper.vm.loadBalancerColumnOption.forEach((columnOptions) => {
        if (typeof columnOptions.displayFunction === 'function') {
          expect(['string', 'number']).toContain(typeof columnOptions.displayFunction(loadBalancerMock[0]))
        }
      })
    })

    test('should load balancer tab selected by default', () => {
      // console.log('wrapper.element.innerHTML', wrapper.element.innerHTML)
      expect(wrapper.find('.load-balancers-tab').element.classList).toContain('is-active')
    })

    test("should not have the certificate window when didn't click on some row", () => {
      expect(wrapper.findAll('.selected')).toHaveLength(0)
    })

    test('should have the certificate window when click on some row', () => {
      const nameCell =  wrapper.findAll('.data-row')[0]
      nameCell.trigger('click')
      console.log('@!@!@!', wrapper.vm.selectedBalancer.id)
      console.log('@!@!@!@!@!@!', wrapper.vm.rowProp)
      // console.log('@!@!@!@!@!@!', wrapper.findComponent(RbzTable).rowClicked(wrapper.vm.selectedBalancer.id))
      expect(wrapper.find('.selected').exists()).toBeTruthy()
    })

    test('should have default certificate without attached certificates', () => {
      const nameCell =  wrapper.findAll('.load-balancer-name')[0]
      nameCell.trigger('click')
      expect(wrapper.find('.default-certificate')).toBeTruthy()
      expect(wrapper.findAll('.attached-certificate')).toHaveLength(0)
    })

    test('should have default certificate without attached certificates', () => {
      const nameCell =  wrapper.findAll('.load-balancer-name')[1]
      nameCell.trigger('click')
      expect(wrapper.find('.default-certificate')).toBeTruthy()
      expect(wrapper.findAll('.attached-certificate').length).toEqual(2)
    })
  }) */

  describe('certificates', () => {
    beforeEach(async () => {
      const certificatesTab = wrapper.find('.certificates-tab')
      await certificatesTab.find('a').trigger('click')
    })

    test(`should load correct column options`, async () => {
      wrapper.vm.certificateColumnOption.forEach((columnOptions) => {
        if (typeof columnOptions.displayFunction === 'function') {
          expect(['string', 'number']).toContain(typeof columnOptions.displayFunction(certificateMock[0]))
        }
      })
    })

    describe('generate certificate', () => {
      test('should not open the generate popup when the system load', () => {
        const generateComponent = wrapper.findComponent(GenerateCertificate)
        expect(generateComponent.exists()).toBe(false)
      })

      test('should open the generate popup when click on generate button', async () => {
        const menuButton = wrapper.find('.menu-toggle-button')
        await menuButton.trigger('click')
        const newEntityButton = wrapper.find('.new-entity-button')
        await newEntityButton.trigger('click')
        const generateComponent = wrapper.findComponent(GenerateCertificate)
        expect(generateComponent.exists()).toBe(true)
      })

      test('should send api call to load certificates on call-load-certificate emit', async () => {
        jest.clearAllMocks()
        const deleteButton = wrapper.findAll('.row-entity-button').at(0)
        await deleteButton.trigger('click')
        const newEntityButton = wrapper.find('.new-entity-button')
        await newEntityButton.trigger('click')
        const deleteComponent = wrapper.findComponent(GenerateCertificate)
        deleteComponent.vm.$emit('call-load-certificate')
        expect(sendReblazeRequestSpy).toHaveBeenCalled()
        expect(sendReblazeRequestSpy).toHaveBeenCalledWith(expect.objectContaining({
          url: `configs/${selectedBranch}/d/certificates/`,
        }))
      })
    })

    describe('delete certificate', () => {
      test('should not open the delete popup when the system load', () => {
        const deleteComponent = wrapper.findComponent(DeleteCertificate)
        expect(deleteComponent.exists()).toBe(false)
      })

      test('should open the delete popup when click on delete button', async () => {
        const deleteButton = wrapper.findAll('.second-row-entity-button').at(0)
        await deleteButton.trigger('click')
        const deleteComponent = wrapper.findComponent(DeleteCertificate)
        expect(deleteComponent.exists()).toBe(true)
      })

      test('should send api call to load certificates on call-load-certificate emit', async () => {
        jest.clearAllMocks()
        const deleteButton = wrapper.findAll('.second-row-entity-button').at(0)
        await deleteButton.trigger('click')
        const deleteComponent = wrapper.findComponent(DeleteCertificate)
        deleteComponent.vm.$emit('call-load-certificate')
        expect(sendReblazeRequestSpy).toHaveBeenCalled()
        expect(sendReblazeRequestSpy).toHaveBeenCalledWith(expect.objectContaining({
          url: `configs/${selectedBranch}/d/certificates/`,
        }))
      })
    })

    describe('edit certificate', () => {
      test('should not open the edit popup when the system load', () => {
        const editComponent = wrapper.findComponent(EditCertificate)
        expect(editComponent.exists()).toBe(false)
      })

      test('should open the edit popup when click on edit button', async () => {
        const editButton = wrapper.findAll('.row-entity-button').at(0)
        await editButton.trigger('click')
        const editComponent = wrapper.findComponent(EditCertificate)
        expect(editComponent.exists()).toBe(true)
      })

      test('should send api call to load certificates on call-load-certificate emit', async () => {
        jest.clearAllMocks()
        const editButton = wrapper.findAll('.row-entity-button').at(0)
        await editButton.trigger('click')
        const editComponent = wrapper.findComponent(EditCertificate)
        editComponent.vm.$emit('call-loaders')
        expect(sendReblazeRequestSpy).toHaveBeenCalled()
        expect(sendReblazeRequestSpy).toHaveBeenCalledWith(expect.objectContaining({
          url: `config/load-balancers/`,
        }))
      })
    })
  })
})
