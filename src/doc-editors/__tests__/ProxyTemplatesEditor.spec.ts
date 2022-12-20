// @ts-nocheck
import ProxyTemplatesEditor from '@/doc-editors/ProxyTemplatesEditor.vue'
import {beforeEach, describe, expect, jest, test} from '@jest/globals'
import {mount, VueWrapper} from '@vue/test-utils'
import {ProxyTemplate, Site} from '@/types'
import {createTestingPinia} from '@pinia/testing'
import {nextTick} from 'vue'
import {useBranchesStore} from '../../stores/BranchesStore'
import RequestsUtils, {IRequestParams} from '../../assets/RequestsUtils'
import Utils from '../../assets/Utils'
import DatasetsUtils from '../../assets/DatasetsUtils'
import _ = require('lodash')

const selectedBranch = 'prod'
const mockRoute = {
  params: {
    branch: selectedBranch,
    doc_id: '00b2acde6d94',
  },
  path: `/${selectedBranch}/proxy-templates/config/00b2acde6d94`,
  name: 'ProxyTemplates/config',
}
jest.mock('vue-router', () => ({
  useRoute: jest.fn(() => (mockRoute)),
}))
jest.mock('../../assets/RequestsUtils.ts')

describe('ProxyTemplatesEditor.vue', () => {
  let proxyTemplatesDocs: ProxyTemplate[]
  let serverGroupsDocs: Site[]
  let mockRouter: any
  let wrapper: VueWrapper
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
    serverGroupsDocs = [
      {
        'id': '__default__',
        'mobile_sdk': '',
        'name': 'default.site',
        'proxy_template': '3aed9031176d',
        'routing_profile': '__default__',
        'security_policy': '__default__',
        'server_names': ['default.site'],
        'ssl_certificate': 'placeholder',
      },
    ]
    sendReblazeRequestSpy = jest.spyOn(RequestsUtils, 'sendReblazeRequest').mockImplementation(
      (requestParams: IRequestParams) => {
        if (requestParams.url === `configs/${selectedBranch}/d/proxy-templates/`) {
          return Promise.resolve({data: _.cloneDeep(proxyTemplatesDocs)})
        }
        if (requestParams.url === `configs/${selectedBranch}/d/proxy-templates/e/00b2acde6d94/`) {
          return Promise.resolve({data: _.cloneDeep(proxyTemplatesDocs[0])})
        }
        if (requestParams.url === `'configs/${selectedBranch}/d/proxy-templates/e/__default__/`) {
          return Promise.resolve({data: _.cloneDeep(proxyTemplatesDocs[1])})
        }
        if (requestParams.url === `'configs/${selectedBranch}/d/proxy-templates/e/3aed9031176d/`) {
          return Promise.resolve({data: _.cloneDeep(proxyTemplatesDocs[2])})
        }
        if (requestParams.url === `configs/${selectedBranch}/d/sites/`) {
          return Promise.resolve({data: _.cloneDeep(serverGroupsDocs)})
        }
        return Promise.resolve({data: []})
      })
    mockRouter = {
      push: jest.fn(),
    }
    wrapper = mount(ProxyTemplatesEditor, {
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

  describe('form data', () => {
    test('should have correct ID displayed', () => {
      expect(wrapper.find('.document-id').text()).toEqual(proxyTemplatesDocs[0].id)
    })

    test('should have correct name in input', () => {
      const element = wrapper.find('.document-name').element as HTMLInputElement
      expect(element.value).toEqual(proxyTemplatesDocs[0].name)
    })

    test('should have correct description in input', () => {
      const element = wrapper.find('.document-description').element as HTMLInputElement
      expect(element.value).toEqual(proxyTemplatesDocs[0].description)
    })

    describe('frontend settings', () => {
      test('should have correct client ip header name in input', () => {
        const element = wrapper.find('.document-ip-header-name').element as HTMLInputElement
        expect(element.value).toEqual(proxyTemplatesDocs[0].xff_header_name)
      })

      test('should have correct requests per second per IP address in input', () => {
        const element = wrapper.find('.document-limit-req-rate').element as HTMLInputElement
        expect(element.value).toEqual(proxyTemplatesDocs[0].limit_req_rate)
      })

      test('should have correct client body timeout in input', () => {
        const element = wrapper.find('.document-client-body-timeout').element as HTMLInputElement
        expect(element.value).toEqual(proxyTemplatesDocs[0].client_body_timeout)
      })

      test('should have correct client header timeout in input', () => {
        const element = wrapper.find('.document-client-header-timeout').element as HTMLInputElement
        expect(element.value).toEqual(proxyTemplatesDocs[0].client_header_timeout)
      })

      test('should have correct client max body size in input', () => {
        const element = wrapper.find('.document-client-max-body-size').element as HTMLInputElement
        expect(element.value).toEqual(proxyTemplatesDocs[0].client_max_body_size)
      })

      test('should have correct limit request burst in input', () => {
        const element = wrapper.find('.document-limit-req-burst').element as HTMLInputElement
        expect(element.value).toEqual(proxyTemplatesDocs[0].limit_req_burst)
      })

      test('should have correct keepalive timeout in input', () => {
        const element = wrapper.find('.document-keepalive-timeout').element as HTMLInputElement
        expect(element.value).toEqual(proxyTemplatesDocs[0].keepalive_timeout)
      })

      test('should have correct send timeout in input', () => {
        const element = wrapper.find('.document-send-timeout').element as HTMLInputElement
        expect(element.value).toEqual(proxyTemplatesDocs[0].send_timeout)
      })
    })

    describe('backend settings', () => {
      test('should have correct proxy connect timeout in input', () => {
        const element = wrapper.find('.document-proxy-connect-timeout').element as HTMLInputElement
        expect(element.value).toEqual(proxyTemplatesDocs[0].proxy_connect_timeout)
      })

      test('should have correct proxy send timeout in input', () => {
        const element = wrapper.find('.document-proxy-send-timeout').element as HTMLInputElement
        expect(element.value).toEqual(proxyTemplatesDocs[0].proxy_send_timeout)
      })

      test('should have correct proxy read timeout in input', () => {
        const element = wrapper.find('.document-proxy-read-timeout').element as HTMLInputElement
        expect(element.value).toEqual(proxyTemplatesDocs[0].proxy_read_timeout)
      })

      test('should have correct Backend Service host header in input', () => {
        const element = wrapper.find('.document-upstream-host').element as HTMLInputElement
        expect(element.value).toEqual(proxyTemplatesDocs[0].upstream_host)
      })

      test('should have correct real IP header name in input', () => {
        const element = wrapper.find('.document-real-ip-header-name').element as HTMLInputElement
        expect(element.value).toEqual(proxyTemplatesDocs[0].xrealip_header_name)
      })
    })

    describe('advanced settings', () => {
      test('should have correct http listener configuration in input', () => {
        const element = wrapper.find('.document-site-conf').element as HTMLInputElement
        expect(element.value).toEqual(proxyTemplatesDocs[0].conf_specific)
      })

      test('should have correct https listener configuration in input', () => {
        const element = wrapper.find('.document-site-ssl-conf').element as HTMLInputElement
        expect(element.value).toEqual(proxyTemplatesDocs[0].ssl_conf_specific)
      })
    })
  })

  describe('buttons', () => {
    test('should redirect to list on button click', (done) => {
      jest.spyOn(mockRouter, 'push').mockImplementation((path) => {
        expect(path).toEqual(`/${selectedBranch}/proxy-templates/list`)
        done()
      })
      const button = wrapper.find('.redirect-list-button')
      button.trigger('click')
    })

    test('should be able to save document changes', () => {
      const doc = wrapper.vm.selectedProxyTemplate
      doc.name = `${doc.name} changed`
      const saveDocumentButton = wrapper.find('.save-document-button')
      saveDocumentButton.trigger('click')
      expect(sendReblazeRequestSpy).toHaveBeenCalledWith(expect.objectContaining({
        methodName: 'PUT',
        url: `configs/${selectedBranch}/d/proxy-templates/e/${doc.id}/`,
        data: doc,
      }))
    })

    test('should be able to fork document', () => {
      const originalDoc = wrapper.vm.selectedProxyTemplate
      const forkedDoc = {...originalDoc}
      forkedDoc.id = expect.any(String)
      forkedDoc.name = expect.stringMatching(`copy of ${forkedDoc.name}`)
      const forkDocumentButton = wrapper.find('.fork-document-button')
      forkDocumentButton.trigger('click')
      expect(sendReblazeRequestSpy).toHaveBeenCalledWith(expect.objectContaining({
        methodName: 'POST',
        url: expect.stringMatching(`configs/${selectedBranch}/d/proxy-templates/e/`),
        data: forkedDoc,
      }))
    })

    test('should be able to add a new document', () => {
      const newDoc = DatasetsUtils.newOperationEntryFactory['proxy-templates']()
      newDoc.name = expect.stringMatching('New Proxy Template')
      newDoc.id = expect.any(String)
      const newDocumentButton = wrapper.find('.new-document-button')
      newDocumentButton.trigger('click')
      expect(sendReblazeRequestSpy).toHaveBeenCalledWith(expect.objectContaining({
        methodName: 'POST',
        url: expect.stringMatching(`configs/${selectedBranch}/d/proxy-templates/e/`),
        data: newDoc,
      }))
    })

    test('should be able to delete a document', async () => {
      const deleteDocumentButton = wrapper.find('.delete-document-button')
      await deleteDocumentButton.trigger('click')
      expect(sendReblazeRequestSpy).toHaveBeenCalledWith(expect.objectContaining({
        methodName: 'DELETE',
        url: `configs/${selectedBranch}/d/proxy-templates/e/${proxyTemplatesDocs[0].id}/`,
      }))
    })

    test('should not be able to delete a document if its id starts with `__`', async () => {
      await wrapper.setData({selectedDocID: '__default__'})
      jest.clearAllMocks()
      const deleteDocumentButton = wrapper.find('.delete-document-button')
      await deleteDocumentButton.trigger('click')
      expect(sendReblazeRequestSpy).not.toHaveBeenCalled()
    })

    test('should not be able to delete a document if it is referenced by a Server Group', async () => {
      await wrapper.setData({selectedDocID: 'f123456789'})
      jest.clearAllMocks()
      const deleteDocumentButton = wrapper.find('.delete-document-button')
      await deleteDocumentButton.trigger('click')
      expect(sendReblazeRequestSpy).not.toHaveBeenCalled()
    })

    test('should attempt to download document when download button is clicked', async () => {
      const wantedFileName = 'proxy-template'
      const wantedFileType = 'json'
      const wantedFileData = proxyTemplatesDocs[0]
      const downloadFileSpy = jest.spyOn(Utils, 'downloadFile').mockImplementation(() => {
      })
      const downloadDocButton = wrapper.find('.download-document-button')
      await downloadDocButton.trigger('click')
      expect(downloadFileSpy).toHaveBeenCalledWith(wantedFileName, wantedFileType, wantedFileData)
    })
  })
})
