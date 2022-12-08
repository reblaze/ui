// @ts-nocheck
import EdgeFunctionsEditor from '@/doc-editors/EdgeFunctionsEditor.vue'
import {beforeEach, describe, expect, jest, test} from '@jest/globals'
import {mount, VueWrapper} from '@vue/test-utils'
import {EdgeFunction, RoutingProfile} from '@/types'
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
    doc_id: 'f971e92459e2',
  },
  path: `/${selectedBranch}/cloud-functions/config/f971e92459e2`,
  name: 'EdgeFunctions/config',
}
jest.mock('vue-router', () => ({
  useRoute: jest.fn(() => (mockRoute)),
}))
jest.mock('../../assets/RequestsUtils.ts')

describe('EdgeFunctionsEditor.vue', () => {
  let edgeFunctionsDocs: EdgeFunction[]
  let routingProfilesDocs: RoutingProfile[]
  let mockRouter: any
  let wrapper: VueWrapper
  let sendReblazeRequestSpy: any
  beforeEach(async () => {
    edgeFunctionsDocs = [
      {
        'id': 'f971e92459e2',
        'name': 'New Edge Functions',
        'description': '5 requests per minute',
        'phase': 'request',
        'code': `-- begin custom code
      --custom response header
      ngx.header['foo'] = 'bar'`,
      },
      {
        'id': 'f123456789',
        'name': 'New Edge Function',
        'description': '2 requests per minute',
        'phase': 'response',
        'code': `-- begin custom code
      --custom response header
      ngx.header['foo'] = 'bar'`,
      },
      {
        'id': '__default__',
        'name': 'Default Edge Function',
        'description': '2 requests per minute',
        'phase': 'response',
        'code': `-- begin custom code
      --custom response header
      ngx.header['foo'] = 'bar'`,
      },
    ]
    routingProfilesDocs = [
      {
        'id': '__default__',
        'locations': [
          {
            'backend_id': '__default__',
            'cloud_functions': ['f123456789'],
            'id': '__root_entry__',
            'path': '/',
          },
        ],
        'name': 'default routing',
      },
    ]
    sendReblazeRequestSpy = jest.spyOn(RequestsUtils, 'sendReblazeRequest').mockImplementation(
      (requestParams: IRequestParams) => {
        if (requestParams.url === `configs/${selectedBranch}/d/cloud-functions/`) {
          return Promise.resolve({data: edgeFunctionsDocs})
        }
        if (requestParams.url === `configs/${selectedBranch}/d/cloud-functions/e/f971e92459e2`) {
          return Promise.resolve({data: edgeFunctionsDocs[0]})
        }
        if (requestParams.url === `'configs/${selectedBranch}/d/cloud-functions/e/f123456789`) {
          return Promise.resolve({data: edgeFunctionsDocs[1]})
        }
        if (requestParams.url === `configs/${selectedBranch}/d/routing-profiles/`) {
          return Promise.resolve({data: routingProfilesDocs})
        }
        return Promise.resolve({data: []})
      })
    mockRouter = {
      push: jest.fn(),
    }
    wrapper = mount(EdgeFunctionsEditor, {
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
      expect(wrapper.find('.document-id').text()).toEqual(edgeFunctionsDocs[0].id)
    })

    test('should have correct name in input', () => {
      const element = wrapper.find('.document-name').element as HTMLInputElement
      expect(element.value).toEqual(edgeFunctionsDocs[0].name)
    })

    test('should have correct description in input', () => {
      const element = wrapper.find('.document-description').element as HTMLInputElement
      expect(element.value).toEqual(edgeFunctionsDocs[0].description)
    })

    test('should have correct phase in dropdown', () => {
      const element = wrapper.find('.phase-selection').element as HTMLInputElement
      expect(element.value).toEqual(edgeFunctionsDocs[0].phase)
    })

    test('should have correct code in input', () => {
      const element = wrapper.find('.document-code').element as HTMLInputElement
      expect(element.value).toEqual(edgeFunctionsDocs[0].code)
    })
  })

  describe('buttons', () => {
    test('should redirect to list on button click', (done) => {
      jest.spyOn(mockRouter, 'push').mockImplementation((path) => {
        expect(path).toEqual(`/${selectedBranch}/cloud-functions/list`)
        done()
      })
      const button = wrapper.find('.redirect-list-button')
      button.trigger('click')
    })

    test('should be able to save document changes', () => {
      const doc = wrapper.vm.selectedEdgeFunction
      doc.name = `${doc.name} changed`
      const saveDocumentButton = wrapper.find('.save-document-button')
      saveDocumentButton.trigger('click')
      expect(sendReblazeRequestSpy).toHaveBeenCalledWith(expect.objectContaining({
        url: `configs/${selectedBranch}/d/cloud-functions/e/${doc.id}/`,
        data: doc,
      }))
    })

    test('should be able to fork document', () => {
      const originalDoc = wrapper.vm.selectedEdgeFunction
      const forkedDoc = {...originalDoc}
      forkedDoc.id = expect.any(String)
      forkedDoc.name = expect.stringMatching(`copy of ${forkedDoc.name}`)
      const forkDocumentButton = wrapper.find('.fork-document-button')
      forkDocumentButton.trigger('click')
      expect(sendReblazeRequestSpy).toHaveBeenCalledWith(expect.objectContaining({
        url: expect.stringMatching(`configs/${selectedBranch}/d/cloud-functions/e/`),
        data: forkedDoc,
      }))
    })

    test('should be able to add a new document', () => {
      const newDoc = DatasetsUtils.newDocEntryFactory['cloud-functions']()
      newDoc.name = expect.stringMatching('New Edge Function')
      newDoc.id = expect.any(String)
      const newDocumentButton = wrapper.find('.new-document-button')
      newDocumentButton.trigger('click')
      expect(sendReblazeRequestSpy).toHaveBeenCalledWith(expect.objectContaining({
        url: expect.stringMatching(`configs/${selectedBranch}/d/cloud-functions/e/`),
        data: newDoc,
      }))
    })

    test('should be able to delete a document', async () => {
      const deleteDocumentButton = wrapper.find('.delete-document-button')
      await deleteDocumentButton.trigger('click')
      expect(sendReblazeRequestSpy).toHaveBeenCalledWith(expect.objectContaining({
        url: `configs/${selectedBranch}/d/cloud-functions/e/${edgeFunctionsDocs[0].id}/`,
      }))
    })

    test('should not be able to delete a document if its id starts with `__`', async () => {
      await wrapper.setData({selectedDocID: '__default__'})
      jest.clearAllMocks()
      const deleteDocumentButton = wrapper.find('.delete-document-button')
      await deleteDocumentButton.trigger('click')
      expect(sendReblazeRequestSpy).not.toHaveBeenCalled()
    })

    test('should not be able to delete a document if it is referenced by a routing profile', async () => {
      await wrapper.setData({selectedDocID: 'f123456789'})
      jest.clearAllMocks()
      const deleteDocumentButton = wrapper.find('.delete-document-button')
      await deleteDocumentButton.trigger('click')
      expect(sendReblazeRequestSpy).not.toHaveBeenCalled()
    })

    test('should attempt to download document when download button is clicked', async () => {
      const wantedFileName = 'cloud-function'
      const wantedFileType = 'json'
      const wantedFileData = edgeFunctionsDocs[0]
      const downloadFileSpy = jest.spyOn(Utils, 'downloadFile').mockImplementation(() => {
      })
      const downloadDocButton = wrapper.find('.download-document-button')
      await downloadDocButton.trigger('click')
      expect(downloadFileSpy).toHaveBeenCalledWith(wantedFileName, wantedFileType, wantedFileData)
    })
  })
})
