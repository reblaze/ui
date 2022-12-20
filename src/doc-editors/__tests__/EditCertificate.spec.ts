// @ts-nocheck
import EditCertificate from '@/doc-editors/popups/EditCertificate.vue'
import {beforeEach, describe, expect, jest, test} from '@jest/globals'
import {mount, VueWrapper} from '@vue/test-utils'
import RequestsUtils, {IRequestParams} from '../../assets/RequestsUtils'
import {nextTick} from 'vue'
import {Certificate} from 'crypto'

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

describe('EditCertificate.vue', () => {
  let loadBalancerMock: LoadBalancer[]
  let certificatesMock: Certificate[]
  let certificateMock: Certificate
  let sitesMock: Site[]
  let sendReblazeRequestSpy: any
  let wrapper: VueWrapper
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
    certificatesMock = [
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
    ]
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
      'san': ['san-test-1'],
      'subject': 'C=US, ST=New York, O=Kramerica Industries, L=New York, CN=kramericaindustries.kramericaindustries',
      'upload_time': '2022-10-20 17:21:46.982976',
    }
    sendReblazeRequestSpy = jest.spyOn(RequestsUtils, 'sendReblazeRequest').mockImplementation(
        (requestParams: IRequestParams) => {
          if (requestParams.url === `configs/${selectedBranch}/d/certificates/e/placeholder?le_auto_renew=false&le_auto_replace=true`) {
            return Promise.resolve({data: certificateMock})
          }
          return Promise.resolve({data: []})
        },
    )
    wrapper = mount(EditCertificate, {
      global: {
      },
      props: {
        certificate: certificateMock,
        sites: sitesMock,
        selectedBranch: selectedBranch,
        balancers: loadBalancerMock,
        certificates: certificatesMock,
      },
    })
    await nextTick()
  })
  afterEach(() => {
    jest.clearAllMocks()
    jest.clearAllTimers()
  })

  test('should close the modal on X button', async () => {
    const xButton = wrapper.find('.close-modal')
    await xButton.trigger('click')
    expect(wrapper.emitted('close-modal')).toBeTruthy()
  })

  test('should check the lets encrypt', async () => {
    const letsEncryptCheckbox = wrapper.find('.lets-encrypt')
    await letsEncryptCheckbox.setChecked()
    expect(letsEncryptCheckbox.element.checked).toBeTruthy()
  })

  test('should check the lets encrypt and save the editation', async () => {
    const letsEncryptCheckbox = wrapper.find('.lets-encrypt')
    await letsEncryptCheckbox.setChecked()
    const saveButton = wrapper.find('.save-button')
    await saveButton.trigger('click')
    expect(sendReblazeRequestSpy).toHaveBeenCalled()
    expect(sendReblazeRequestSpy).toHaveBeenCalledWith(expect.objectContaining({
      url: expect.stringMatching(`configs/${selectedBranch}/d/certificates/e/`),
    }))
    expect(wrapper.emitted('call-loaders')).toBeTruthy()
    expect(wrapper.emitted('close-modal')).toBeTruthy()
  })

  describe('inputs', () => {
    // TODO: ask Aviv on that
    test('should display connected sites inside the input', () => {
      const connectedSites = wrapper.find('.connected-sites').element.value
      expect(connectedSites).toBe('test-site-1')
    })

    test('should not display connected sites inside the input if there is not exsits one at least', () => {
      certificateMock = {
        'cert_body': '-----BEGIN CERTIFICATE-----\ntest-cert-1\n-----END CERTIFICATE-----\n',
        'exp_date': '2027-06-09',
        'id': 'test-id',
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
        'san': ['san-test-1'],
        'subject': 'C=US, ST=New York, O=Kramerica Industries, L=New York, CN=kramericaindustries.kramericaindustries',
        'upload_time': '2022-10-20 17:21:46.982976',
      }
      wrapper = mount(EditCertificate, {
        global: {
        },
        props: {
          certificate: certificateMock,
          sites: sitesMock,
          selectedBranch: selectedBranch,
          balancers: loadBalancerMock,
          certificates: certificatesMock,
        },
      })
      const connectedSites = wrapper.find('.connected-sites')
      expect(connectedSites.exists()).toBeFalsy()
    })

    test('should display certificate subject inside the input', () => {
      const certificateSubject = wrapper.find('.subject').element.value
      expect(certificateSubject).toBe(certificateMock.subject)
    })

    test('should display certificate issuer inside the input', () => {
      const certificateIssuer = wrapper.find('.issuer').element.value
      expect(certificateIssuer).toBe(certificateMock.issuer)
    })

    test('should display SAN inside the input', () => {
      const san = wrapper.find('.san').element.value
      expect(san).toBe(certificateMock.san[0])
    })

    test('should display certificate body inside the input', () => {
      const certificateBody = wrapper.find('.certificate-body').element.value
      expect(certificateBody).toBe(certificateMock.cert_body)
    })
  })

  describe('sites manipulations', () => {
    test('should display 0 apps selected in the first load', () => {
      certificateMock = {
        'cert_body': '-----BEGIN CERTIFICATE-----\ntest-cert-1\n-----END CERTIFICATE-----\n',
        'exp_date': '2027-06-09',
        'id': 'test-id',
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
        'san': ['san-test-1'],
        'subject': 'C=US, ST=New York, O=Kramerica Industries, L=New York, CN=kramericaindustries.kramericaindustries',
        'upload_time': '2022-10-20 17:21:46.982976',
      }
      wrapper = mount(EditCertificate, {
        global: {
        },
        props: {
          certificate: certificateMock,
          sites: sitesMock,
          selectedBranch: selectedBranch,
          balancers: loadBalancerMock,
          certificates: certificatesMock,
        },
      })
      const selectedAppsNumber = wrapper.find('.selected-apps-number')
      expect(selectedAppsNumber.text()).toBe('0 apps selected')
    })

    test('should not attach sites to certificatein the first load by default', () => {
      certificateMock = {
        'cert_body': '-----BEGIN CERTIFICATE-----\ntest-cert-1\n-----END CERTIFICATE-----\n',
        'exp_date': '2027-06-09',
        'id': 'test-id',
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
        'san': ['san-test-1'],
        'subject': 'C=US, ST=New York, O=Kramerica Industries, L=New York, CN=kramericaindustries.kramericaindustries',
        'upload_time': '2022-10-20 17:21:46.982976',
      }
      wrapper = mount(EditCertificate, {
        global: {
        },
        props: {
          certificate: certificateMock,
          sites: sitesMock,
          selectedBranch: selectedBranch,
          balancers: loadBalancerMock,
          certificates: certificatesMock,
        },
      })
      const firstOptionMultiselect = wrapper.findAll('.option-multiselect').at(0)?.element.selected
      const secondOptionMultiselect = wrapper.findAll('.option-multiselect').at(1)?.element.selected
      const thirdOptionMultiselect = wrapper.findAll('.option-multiselect').at(2)?.element.selected
      expect(firstOptionMultiselect).toBeFalsy()
      expect(secondOptionMultiselect).toBeFalsy()
      expect(thirdOptionMultiselect).toBeFalsy()
    })

    test('should attach one site to certificate and select it by default', () => {
      const firstOptionMultiselect = wrapper.findAll('.option-multiselect').at(0)?.element.selected
      const secondOptionMultiselect = wrapper.findAll('.option-multiselect').at(1)?.element.selected
      const thirdOptionMultiselect = wrapper.findAll('.option-multiselect').at(2)?.element.selected
      expect(firstOptionMultiselect).toBeTruthy()
      expect(secondOptionMultiselect).toBeFalsy()
      expect(thirdOptionMultiselect).toBeFalsy()
    })

    test('should attach two sites to certificate and select it by default', () => {
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
          'ssl_certificate': 'placeholder',
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
      ]
      wrapper = mount(EditCertificate, {
        global: {
        },
        props: {
          certificate: certificateMock,
          sites: sitesMock,
          selectedBranch: selectedBranch,
          balancers: loadBalancerMock,
          certificates: certificatesMock,
        },
      })
      const firstOptionMultiselect = wrapper.findAll('.option-multiselect').at(0)?.element.selected
      const secondOptionMultiselect = wrapper.findAll('.option-multiselect').at(1)?.element.selected
      const thirdOptionMultiselect = wrapper.findAll('.option-multiselect').at(2)?.element.selected
      expect(firstOptionMultiselect).toBeTruthy()
      expect(secondOptionMultiselect).toBeTruthy()
      expect(thirdOptionMultiselect).toBeFalsy()
    })
  })
})
