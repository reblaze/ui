// @ts-nocheck
import BackendServicesEditor from '@/doc-editors/BackendServicesEditor.vue'
import {beforeEach, describe, expect, jest, test} from '@jest/globals'
import {mount, VueWrapper} from '@vue/test-utils'
import {BackendService, RoutingProfile} from '@/types'
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
    doc_id: '6f6295de664f',
  },
  path: `/${selectedBranch}/backend-services/config/6f6295de664f`,
  name: 'BackendServices/config',
}
jest.mock('vue-router', () => ({
  useRoute: jest.fn(() => (mockRoute)),
}))
jest.mock('../../assets/RequestsUtils.ts')

describe('BackendServicesEditor.vue', () => {
  let backendServicesDocs: BackendService[]
  let routingProfilesDocs: RoutingProfile[]
  let mockRouter: any
  let wrapper: VueWrapper
  let sendReblazeRequestSpy: any
  beforeEach(async () => {
    backendServicesDocs = [
      {
        'back_hosts': [
          {
            'backup': false,
            'down': false,
            'fail_timeout': 10,
            'host': '127.0.0.1',
            'http_port': 80,
            'https_port': 443,
            'max_fails': 0,
            'monitor_state': '',
            'weight': 1,
          },
        ],
        'description': 'New Backend Service Description and Remarks',
        'http11': true,
        'id': '6f6295de664f',
        'least_conn': false,
        'name': 'New Backend Service 6f6295de664f',
        'sticky': 'none',
        'transport_mode': 'default',
      },
      {
        'back_hosts': [
          {
            'backup': false,
            'down': false,
            'fail_timeout': 10,
            'host': 'test.example.com',
            'http_port': 80,
            'https_port': 443,
            'max_fails': 0,
            'monitor_state': '0',
            'weight': 1,
          },
        ],
        'description': '',
        'http11': true,
        'id': 'c84a01fbe369',
        'least_conn': false,
        'name': 'example-com',
        'sticky': 'none',
        'sticky_cookie_name': '',
        'transport_mode': 'default',
      },
      {
        'back_hosts': [
          {
            'backup': false,
            'down': false,
            'fail_timeout': 10,
            'host': 'example.com',
            'http_port': 80,
            'https_port': 443,
            'max_fails': 0,
            'monitor_state': '0',
            'weight': 1,
          },
        ],
        'description': '',
        'http11': true,
        'id': '__default__',
        'least_conn': false,
        'name': 'example-com',
        'sticky': 'none',
        'sticky_cookie_name': '',
        'transport_mode': 'default',
      },
    ]
    routingProfilesDocs = [
      {
        'id': '__default__',
        'locations': [
          {
            'backend_id': 'c84a01fbe369',
            'cloud_functions': [],
            'id': '__root_entry__',
            'path': '/',
          },
        ],
        'name': 'default routing',
      },
    ]
    sendReblazeRequestSpy = jest.spyOn(RequestsUtils, 'sendReblazeRequest').mockImplementation(
      (requestParams: IRequestParams) => {
        if (requestParams.url === `configs/${selectedBranch}/d/backends/`) {
          return Promise.resolve({data: _.cloneDeep(backendServicesDocs)})
        }
        if (requestParams.url === `configs/${selectedBranch}/d/backends/e/6f6295de664f/'`) {
          return Promise.resolve({data: _.cloneDeep(backendServicesDocs[0])})
        }
        if (requestParams.url === `'configs/${selectedBranch}/d/backends/e/__default__/`) {
          return Promise.resolve({data: _.cloneDeep(backendServicesDocs[1])})
        }
        if (requestParams.url === `'configs/${selectedBranch}/d/backends/e/c84a01fbe369/`) {
          return Promise.resolve({data: _.cloneDeep(backendServicesDocs[2])})
        }
        if (requestParams.url === `configs/${selectedBranch}/d/routing-profiles/`) {
          return Promise.resolve({data: _.cloneDeep(routingProfilesDocs)})
        }
        return Promise.resolve({data: []})
      })
    mockRouter = {
      push: jest.fn(),
    }
    wrapper = mount(BackendServicesEditor, {
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
      expect(wrapper.find('.document-id').text()).toEqual(backendServicesDocs[0].id)
    })

    test('should have correct name in input', () => {
      const element = wrapper.find('.document-name').element as HTMLInputElement
      expect(element.value).toEqual(backendServicesDocs[0].name)
    })

    test('should have correct description in input', () => {
      const element = wrapper.find('.document-description').element as HTMLInputElement
      expect(element.value).toEqual(backendServicesDocs[0].description)
    })

    test('should have correct transport protocol in dropdown', () => {
      const element = wrapper.find('.document-transport-mode-selection').element as HTMLInputElement
      expect(element.value).toEqual(backendServicesDocs[0].transport_mode)
    })

    test('should have correct load balancing stickiness model in dropdown', () => {
      const element = wrapper.find('.document-load-balancing-stickiness-selection').element as HTMLInputElement
      expect(element.value).toEqual(backendServicesDocs[0].sticky)
    })
  })

  describe('buttons', () => {
    test('should redirect to list on button click', (done) => {
      jest.spyOn(mockRouter, 'push').mockImplementation((path) => {
        expect(path).toEqual(`/${selectedBranch}/backend-services/list`)
        done()
      })
      const button = wrapper.find('.redirect-list-button')
      button.trigger('click')
    })

    test('should be able to save document changes', () => {
      const doc = wrapper.vm.selectedBackendService
      doc.name = `${doc.name} changed`
      const saveDocumentButton = wrapper.find('.save-document-button')
      saveDocumentButton.trigger('click')
      expect(sendReblazeRequestSpy).toHaveBeenCalledWith(expect.objectContaining({
        methodName: 'PUT',
        url: `configs/${selectedBranch}/d/backends/e/${doc.id}/`,
        data: doc,
      }))
    })

    test('should be able to fork document', () => {
      const originalDoc = wrapper.vm.selectedBackendService
      const forkedDoc = {...originalDoc}
      forkedDoc.id = expect.any(String)
      forkedDoc.name = expect.stringMatching(`copy of ${forkedDoc.name}`)
      const forkDocumentButton = wrapper.find('.fork-document-button')
      forkDocumentButton.trigger('click')
      expect(sendReblazeRequestSpy).toHaveBeenCalledWith(expect.objectContaining({
        methodName: 'POST',
        url: expect.stringMatching(`configs/${selectedBranch}/d/backends/e/`),
        data: forkedDoc,
      }))
    })

    test('should be able to add a new document', () => {
      const newDoc = DatasetsUtils.newOperationEntryFactory['backends']()
      newDoc.name = expect.stringMatching('New Backend Service')
      newDoc.id = expect.any(String)
      const newDocumentButton = wrapper.find('.new-document-button')
      newDocumentButton.trigger('click')
      expect(sendReblazeRequestSpy).toHaveBeenCalledWith(expect.objectContaining({
        methodName: 'POST',
        url: expect.stringMatching(`configs/${selectedBranch}/d/backends/e/`),
        data: newDoc,
      }))
    })

    test('should be able to delete a document', async () => {
      const deleteDocumentButton = wrapper.find('.delete-document-button')
      await deleteDocumentButton.trigger('click')
      expect(sendReblazeRequestSpy).toHaveBeenCalledWith(expect.objectContaining({
        methodName: 'DELETE',
        url: `configs/${selectedBranch}/d/backends/e/${backendServicesDocs[0].id}/`,
      }))
    })

    test('should not be able to delete a document if its id starts with `__`', async () => {
      await wrapper.setData({selectedDocID: '__default__'})
      jest.clearAllMocks()
      const deleteDocumentButton = wrapper.find('.delete-document-button')
      await deleteDocumentButton.trigger('click')
      expect(sendReblazeRequestSpy).not.toHaveBeenCalled()
    })

    test('should not be able to delete a document if it is referenced by a Routing Profile', async () => {
      await wrapper.setData({selectedDocID: 'c84a01fbe369'})
      jest.clearAllMocks()
      const deleteDocumentButton = wrapper.find('.delete-document-button')
      await deleteDocumentButton.trigger('click')
      expect(sendReblazeRequestSpy).not.toHaveBeenCalled()
    })

    test('should attempt to download document when download button is clicked', async () => {
      const wantedFileName = 'backend-service'
      const wantedFileType = 'json'
      const wantedFileData = backendServicesDocs[0]
      const downloadFileSpy = jest.spyOn(Utils, 'downloadFile').mockImplementation(() => {
      })
      const downloadDocButton = wrapper.find('.download-document-button')
      await downloadDocButton.trigger('click')
      expect(downloadFileSpy).toHaveBeenCalledWith(wantedFileName, wantedFileType, wantedFileData)
    })
  })
})
