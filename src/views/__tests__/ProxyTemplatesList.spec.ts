// @ts-nocheck
import ProxyTemplatesList from '@/views/ProxyTemplatesList.vue'
import RbzTable from '@/components/RbzTable'
import DatasetsUtils from '@/assets/DatasetsUtils'
import Utils from '@/assets/Utils'
import {afterEach, beforeEach, describe, expect, jest, test} from '@jest/globals'
import {shallowMount, VueWrapper} from '@vue/test-utils'
import _ from 'lodash'
import {ProxyTemplate} from '@/types'
import {nextTick} from 'vue'
import {createTestingPinia} from '@pinia/testing'
import {useBranchesStore} from '../../stores/BranchesStore'
import RequestsUtils, {IRequestParams} from '../../assets/RequestsUtils'

const selectedBranch = 'prod'
const mockRoute = {
  params: {
    branch: selectedBranch,
  },
  path: `/${selectedBranch}/proxy-templates/list`,
  name: 'ProxyTemplates/list',
}
jest.mock('vue-router', () => ({
  useRoute: jest.fn(() => (mockRoute)),
}))
jest.mock('../../assets/RequestsUtils.ts')

describe('ProxyTemplatesList.vue', () => {
  let wrapper: VueWrapper
  let mockRouter: any
  let proxyTemplatesDocs: ProxyTemplate[]
  let sendReblazeRequestSpy: any
  beforeEach(async () => {
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
    sendReblazeRequestSpy = jest.spyOn(RequestsUtils, 'sendReblazeRequest').mockImplementation(
      (requestParams: IRequestParams) => {
        if (requestParams.url === `configs/${selectedBranch}/d/proxy-templates/`) {
          return Promise.resolve({data: _.cloneDeep(proxyTemplatesDocs)})
        }
        return Promise.resolve({data: []})
      })
    mockRouter = {
      push: jest.fn(),
    }
    wrapper = shallowMount(ProxyTemplatesList, {
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
      wrapper = shallowMount(ProxyTemplatesList, {
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
      expect(wrapper.vm.proxyTemplates).toEqual([])
    })

    test('should default to empty array when receiving a rejected promise', async () => {
      jest.spyOn(RequestsUtils, 'sendReblazeRequest').mockImplementation(() => {
        return Promise.reject(new Error())
      })
      wrapper = shallowMount(ProxyTemplatesList, {
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
      expect(wrapper.vm.proxyTemplates).toEqual([])
    })
  })

  describe('loading indicator', () => {
    test('should display loading indicator when doc type not loaded', async () => {
      jest.spyOn(RequestsUtils, 'sendReblazeRequest').mockImplementation(
        (requestParams: IRequestParams) => {
          if (requestParams.url === `configs/${selectedBranch}/d/proxy-templates/`) {
            return new Promise(() => {
            })
          }
          return Promise.resolve({data: {}})
        })
      wrapper = shallowMount(ProxyTemplatesList, {
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
      const wantedFileName = 'proxy-templates'
      const wantedFileType = 'json'
      const wantedFileData = proxyTemplatesDocs
      const downloadFileSpy = jest.spyOn(Utils, 'downloadFile').mockImplementation(() => {
      })
      const downloadDocButton = wrapper.find('.download-document-button')
      await downloadDocButton.trigger('click')
      expect(downloadFileSpy).toHaveBeenLastCalledWith(wantedFileName, wantedFileType, wantedFileData)
    })

    test('should be able to add a new document', async () => {
      const newDoc = DatasetsUtils.newOperationEntryFactory['proxy-templates']()
      newDoc.name = expect.stringMatching('New Proxy Template')
      newDoc.id = expect.any(String)
      const rbzTable = wrapper.findComponent(RbzTable)
      rbzTable.vm.$emit('new-button-clicked')
      expect(sendReblazeRequestSpy).toHaveBeenLastCalledWith(expect.objectContaining({
        methodName: 'POST',
        url: expect.stringMatching(`configs/${selectedBranch}/d/proxy-templates/e/`),
        data: newDoc,
      }))
    })

    test('should redirect to correct document when clicking on edit document button', async () => {
      const rbzTable = wrapper.findComponent(RbzTable)
      rbzTable.vm.$emit('row-button-clicked', proxyTemplatesDocs[1]['id'])
      expect(mockRouter.push).toHaveBeenLastCalledWith(`/prod/proxy-templates/config/${proxyTemplatesDocs[1]['id']}`)
      rbzTable.vm.$emit('row-button-clicked', proxyTemplatesDocs[0]['id'])
      expect(mockRouter.push).toHaveBeenLastCalledWith(`/prod/proxy-templates/config/${proxyTemplatesDocs[0]['id']}`)
    })
  })

  describe('document column options', () => {
    test(`should load correct column options`, async () => {
      const defaultDoc = DatasetsUtils.newOperationEntryFactory['proxy-templates']()
      _.forEach(wrapper.vm.columns, (columnOptions) => {
        if (typeof columnOptions.displayFunction === 'function') {
          expect(['string', 'number']).toContain(typeof columnOptions.displayFunction(defaultDoc))
        }
      })
    })
  })
})
