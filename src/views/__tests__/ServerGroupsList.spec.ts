// @ts-nocheck
import ServerGroupsList from '@/views/ServerGroupsList.vue'
import RbzTable from '@/components/RbzTable'
import DatasetsUtils from '@/assets/DatasetsUtils'
import Utils from '@/assets/Utils'
import {afterEach, beforeEach, describe, expect, jest, test} from '@jest/globals'
import {shallowMount, VueWrapper} from '@vue/test-utils'
import _ from 'lodash'
import {MobileSDK, ProxyTemplate, RoutingProfile, SecurityPolicy, Site} from '@/types'
import {nextTick} from 'vue'
import {createTestingPinia} from '@pinia/testing'
import {useBranchesStore} from '../../stores/BranchesStore'
import RequestsUtils, {IRequestParams} from '../../assets/RequestsUtils'

const selectedBranch = 'prod'
const mockRoute = {
  params: {
    branch: selectedBranch,
  },
  path: `/${selectedBranch}/sites/list`,
  name: 'ServerGroups/list',
}
jest.mock('vue-router', () => ({
  useRoute: jest.fn(() => (mockRoute)),
}))
jest.mock('../../assets/RequestsUtils.ts')

describe('ServerGroupsList.vue', () => {
  let wrapper: VueWrapper
  let mockRouter: any
  let serverGroupsDocs: Site[]
  let securityPoliciesDocs: SecurityPolicy[]
  let routingProfilesDocs: RoutingProfile[]
  let proxyTemplatesDocs: ProxyTemplate[]
  let mobileSDKsDocs: MobileSDK[]
  let sendReblazeRequestSpy: any
  beforeEach(async () => {
    serverGroupsDocs = [
      {
        'id': '__default__',
        'mobile_sdk': '',
        'name': 'default.site',
        'proxy_template': '__default__',
        'routing_profile': '__default__',
        'security_policy': '__default__',
        'server_names': ['default.site'],
        'ssl_certificate': 'placeholder',
      },
      {
        'description': 'New Server Group Description and Remarks',
        'id': '3ae72c36d2e2',
        'mobile_sdk': '',
        'name': 'Test Server Group',
        'proxy_template': '__default__',
        'routing_profile': '__default__',
        'security_policy': '__default__',
        'server_names': ['www.example.com'],
        'ssl_certificate': 'placeholder',
      },
    ]
    securityPoliciesDocs = [
      {
        'id': '__default__',
        'name': 'default entry',
        'match': '__default__',
        'map': [
          {
            'id': '__default__',
            'name': 'default',
            'match': '/',
            'acl_profile': '__acldefault__',
            'acl_active': false,
            'content_filter_profile': '__defaultcontentfilter__',
            'content_filter_active': false,
            'limit_ids': ['f971e92459e2'],
          },
          {
            'id': '__defaultentry__',
            'name': 'entry name',
            'match': '/login',
            'acl_profile': '5828321c37e0',
            'acl_active': false,
            'content_filter_profile': '009e846e819e',
            'content_filter_active': false,
            'limit_ids': ['365757ec0689'],
          },
        ],
      },
      {
        'id': '3086b9c5b518',
        'name': 'copy of default entry',
        'match': 'www.example.com',
        'map': [
          {
            'id': '123',
            'name': 'default',
            'match': '/',
            'acl_profile': '__acldefault__',
            'acl_active': false,
            'content_filter_profile': '__defaultcontentfilter__',
            'content_filter_active': false,
            'limit_ids': ['f971e92459e2', '365757ec0689'],
          },
          {
            'id': '456',
            'name': 'entry name',
            'match': '/login',
            'acl_profile': '5828321c37e0',
            'acl_active': false,
            'content_filter_profile': '009e846e819e',
            'content_filter_active': false,
            'limit_ids': [],
          },
        ],
      },
    ]
    routingProfilesDocs = [
      {
        'description': 'A description',
        'id': 'a80420a71989',
        'locations': [
          {
            'backend_id': '__default__',
            'cloud_functions': ['f971e92459e2'],
            'id': 'e327665d9470',
            'path': '/',
          },
          {
            'backend_id': 'c84a01fbe369',
            'cloud_functions': ['f123456789'],
            'id': '871ebfe196e6',
            'path': '/',
          },
        ],
        'name': 'Routing Profile test with some data',
      },
      {
        'id': '__default__',
        'locations': [{
          'backend_id': 'c84a01fbe369',
          'cloud_functions': ['__default__', 'f123456789'],
          'id': '__root_entry__',
          'path': '/',
        }],
        'name': 'default routing',
      },
      {
        'description': 'New Routing Profile Description and Remarks',
        'id': '376d4487e17a',
        'locations': [{
          'backend_id': '__default__',
          'cloud_functions': ['f123456789'],
          'id': 'd87f297cf1c6',
          'path': '/',
        }],
        'name': 'New Routing Profile 376d4487e17a',
      },
    ]
    proxyTemplatesDocs = [
      {
        'acao_header': false,
        'client_body_timeout': '5',
        'client_header_timeout': '5',
        'client_max_body_size': '150',
        'conf_specific': '',
        'custom_listener': false,
        'description': 'New Proxy Template Description and Remarks 111',
        'id': '00b2acde6d94',
        'keepalive_timeout': '660',
        'limit_req_burst': '400',
        'limit_req_rate': '1200',
        'mask_headers': '',
        'name': 'New Proxy Template 111',
        'proxy_connect_timeout': '5',
        'proxy_read_timeout': '60',
        'proxy_send_timeout': '30',
        'send_timeout': '5',
        'ssl_conf_specific': '',
        'upstream_host': '$host',
        'xff_header_name': 'X-Forwarded-For',
        'xrealip_header_name': 'X-Real-IP',
      },
      {
        'acao_header': false,
        'client_body_timeout': '30',
        'client_header_timeout': '10',
        'client_max_body_size': '150',
        'custom_listener': false,
        'id': '__default__',
        'keepalive_timeout': '60',
        'limit_req_burst': '40',
        'limit_req_rate': '500',
        'mask_headers': 'server*|Server*|Powered-*|powered-*',
        'name': 'Default Proxy Template',
        'post_private_args': '(cc_number|password)',
        'proxy_connect_timeout': '15',
        'proxy_read_timeout': '60',
        'proxy_send_timeout': '30',
        'send_timeout': '10',
        'session_key': 'cookie_jsessionid',
        'upstream_host': '$host',
        'xff_header_name': 'X-Forwarded-For',
        'xrealip_header_name': 'X-Real-IP',
      },
      {
        'acao_header': false,
        'client_body_timeout': '5',
        'client_header_timeout': '5',
        'client_max_body_size': '150',
        'conf_specific': '',
        'custom_listener': false,
        'description': 'New Proxy Template Description and Remarks',
        'id': '3aed9031176d',
        'keepalive_timeout': '660',
        'limit_req_burst': '400',
        'limit_req_rate': '1200',
        'mask_headers': '',
        'name': 'New Proxy Template',
        'proxy_connect_timeout': '5',
        'proxy_read_timeout': '60',
        'proxy_send_timeout': '30',
        'send_timeout': '5',
        'ssl_conf_specific': '',
        'upstream_host': '$host',
        'xff_header_name': 'X-Forwarded-For',
        'xrealip_header_name': 'X-Real-IP',
      },
    ]
    mobileSDKsDocs = [
      {
        'active_config': [{'active': true, 'json': '{}', 'name': 'Default'}],
        'description': 'New Mobile SDK Description and Remarks 1',
        'grace': '50',
        'id': '00b2acde6d94',
        'name': 'New Mobile SDK 00b2acde6d94',
        'signatures': [],
        'uid_header': 'authorization',
      },
      {
        'active_config': [{'active': true, 'json': '{}', 'name': 'Default'}],
        'description': 'Default Mobile SDK Description and Remarks',
        'grace': '5',
        'id': '__default__',
        'name': 'Default Mobile SDK',
        'signatures': [],
        'uid_header': 'authorization',
      },
      {
        'active_config': [{'active': true, 'json': '{}', 'name': 'Default'}],
        'description': 'Mobile SDK Description and Remarks',
        'grace': '5',
        'id': 'f123456789',
        'name': 'Mobile SDK',
        'signatures': [],
        'uid_header': 'authorization',
      },
    ]
    sendReblazeRequestSpy = jest.spyOn(RequestsUtils, 'sendReblazeRequest').mockImplementation(
      (requestParams: IRequestParams) => {
        if (requestParams.url === `configs/${selectedBranch}/d/sites/`) {
          return Promise.resolve({data: _.cloneDeep(serverGroupsDocs)})
        }
        if (requestParams.url === `configs/${selectedBranch}/d/routing-profiles/`) {
          return Promise.resolve({data: _.cloneDeep(routingProfilesDocs)})
        }
        if (requestParams.url === `configs/${selectedBranch}/d/proxy-templates/`) {
          return Promise.resolve({data: _.cloneDeep(proxyTemplatesDocs)})
        }
        if (requestParams.url === `configs/${selectedBranch}/d/mobile-sdks/`) {
          return Promise.resolve({data: _.cloneDeep(mobileSDKsDocs)})
        }
        return Promise.resolve({data: []})
      })
    jest.spyOn(RequestsUtils, 'sendRequest').mockImplementation(
      (requestParams: IRequestParams) => {
        if (requestParams.url === `configs/${selectedBranch}/d/securitypolicies/`) {
          return Promise.resolve({data: _.cloneDeep(securityPoliciesDocs)})
        }
        return Promise.resolve({data: []})
      })
    mockRouter = {
      push: jest.fn(),
    }
    wrapper = shallowMount(ServerGroupsList, {
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

  describe('no data', () => {
    test('should default to empty array when receiving response with no data', async () => {
      jest.spyOn(RequestsUtils, 'sendReblazeRequest').mockImplementation(() => {
        return Promise.resolve({})
      })
      wrapper = shallowMount(ServerGroupsList, {
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
      expect(wrapper.vm.serverGroups).toEqual([])
    })
  })

  describe('loading indicator', () => {
    test('should display loading indicator when doc type not loaded', async () => {
      jest.spyOn(RequestsUtils, 'sendReblazeRequest').mockImplementation(
        (requestParams: IRequestParams) => {
          if (requestParams.url === `configs/${selectedBranch}/d/sites/`) {
            return new Promise(() => {
            })
          }
          return Promise.resolve({data: {}})
        })
      wrapper = shallowMount(ServerGroupsList, {
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
      const docLoadingIndicator = wrapper.find('.document-loading')
      expect(docLoadingIndicator.exists()).toBeTruthy()
    })
  })

  describe('buttons', () => {
    test('should attempt to download document when download button is clicked', async () => {
      const wantedFileName = 'sites'
      const wantedFileType = 'json'
      const wantedFileData = serverGroupsDocs
      const downloadFileSpy = jest.spyOn(Utils, 'downloadFile').mockImplementation(() => {
      })
      const downloadDocButton = wrapper.find('.download-document-button')
      await downloadDocButton.trigger('click')
      expect(downloadFileSpy).toHaveBeenLastCalledWith(wantedFileName, wantedFileType, wantedFileData)
    })

    test('should be able to add a new document', async () => {
      const newDoc = DatasetsUtils.newOperationEntryFactory['sites']()
      newDoc.name = expect.stringMatching('New Server Group')
      newDoc.id = expect.any(String)
      const rbzTable = wrapper.findComponent(RbzTable)
      rbzTable.vm.$emit('new-button-clicked')
      expect(sendReblazeRequestSpy).toHaveBeenLastCalledWith(expect.objectContaining({
        methodName: 'POST',
        url: expect.stringMatching(`configs/${selectedBranch}/d/sites/e/`),
        data: newDoc,
      }))
    })

    test('should redirect to correct document when clicking on edit document button', async () => {
      const rbzTable = wrapper.findComponent(RbzTable)
      rbzTable.vm.$emit('row-button-clicked', serverGroupsDocs[1]['id'])
      expect(mockRouter.push).toHaveBeenLastCalledWith(`/prod/server-groups/config/${serverGroupsDocs[1]['id']}`)
      rbzTable.vm.$emit('row-button-clicked', serverGroupsDocs[0]['id'])
      expect(mockRouter.push).toHaveBeenLastCalledWith(`/prod/server-groups/config/${serverGroupsDocs[0]['id']}`)
    })
  })

  describe('document column options', () => {
    test(`should load correct column options`, async () => {
      const defaultDoc = DatasetsUtils.newOperationEntryFactory['sites']()
      _.forEach(wrapper.vm.columns, (columnOptions) => {
        if (typeof columnOptions.displayFunction === 'function') {
          expect(['string', 'number']).toContain(typeof columnOptions.displayFunction(defaultDoc))
        }
      })
    })
  })
})
