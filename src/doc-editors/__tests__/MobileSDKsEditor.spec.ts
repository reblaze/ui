// @ts-nocheck
import MobileSDKEditor from '@/doc-editors/MobileSDKsEditor.vue'
import {beforeEach, describe, expect, jest, test} from '@jest/globals'
import {mount, VueWrapper} from '@vue/test-utils'
import {MobileSDK, Site} from '@/types'
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
  path: `/${selectedBranch}/mobile-sdks/config/00b2acde6d94`,
  name: 'MobileSDK/config',
}
jest.mock('vue-router', () => ({
  useRoute: jest.fn(() => (mockRoute)),
}))
jest.mock('../../assets/RequestsUtils.ts')

describe('MobileSDKsEditor.vue', () => {
  let mobileSDKsDocs: MobileSDK[]
  let serverGroupsDocs: Site[]
  let mockRouter: any
  let wrapper: VueWrapper
  let sendReblazeRequestSpy: any
  beforeEach(async () => {
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
    serverGroupsDocs = [
      {
        'id': '__default__',
        'mobile_sdk': 'f123456789',
        'name': 'default.site',
        'proxy_template': '__default__',
        'routing_profile': '__default__',
        'security_policy': '__default__',
        'server_names': ['default.site'],
        'ssl_certificate': 'placeholder',
      },
    ]
    sendReblazeRequestSpy = jest.spyOn(RequestsUtils, 'sendReblazeRequest').mockImplementation(
      (requestParams: IRequestParams) => {
        if (requestParams.url === `configs/${selectedBranch}/d/mobile-sdks/`) {
          return Promise.resolve({data: _.cloneDeep(mobileSDKsDocs)})
        }
        if (requestParams.url === `configs/${selectedBranch}/d/mobile-sdks/e/00b2acde6d94/`) {
          return Promise.resolve({data: _.cloneDeep(mobileSDKsDocs[0])})
        }
        if (requestParams.url === `'configs/${selectedBranch}/d/mobile-sdks/e/__default__/`) {
          return Promise.resolve({data: _.cloneDeep(mobileSDKsDocs[1])})
        }
        if (requestParams.url === `'configs/${selectedBranch}/d/mobile-sdks/e/f123456789/`) {
          return Promise.resolve({data: _.cloneDeep(mobileSDKsDocs[2])})
        }
        if (requestParams.url === `configs/${selectedBranch}/d/sites/`) {
          return Promise.resolve({data: _.cloneDeep(serverGroupsDocs)})
        }
        return Promise.resolve({data: []})
      })
    mockRouter = {
      push: jest.fn(),
    }
    wrapper = mount(MobileSDKEditor, {
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
      expect(wrapper.find('.document-id').text()).toEqual(mobileSDKsDocs[0].id)
    })

    test('should have correct name in input', () => {
      const element = wrapper.find('.document-name').element as HTMLInputElement
      expect(element.value).toEqual(mobileSDKsDocs[0].name)
    })

    test('should have correct description in input', () => {
      const element = wrapper.find('.document-description').element as HTMLInputElement
      expect(element.value).toEqual(mobileSDKsDocs[0].description)
    })

    test('should have correct grace period in input', () => {
      const element = wrapper.find('.document-description').element as HTMLInputElement
      expect(element.value).toEqual(mobileSDKsDocs[0].description)
    })

    test('should have correct transport protocol in dropdown', () => {
      const element = wrapper.find('.document-grace-period').element as HTMLInputElement
      expect(element.value).toEqual(mobileSDKsDocs[0].grace)
    })

    test('should have correct token header name in dropdown', () => {
      const element = wrapper.find('.document-token-header-name').element as HTMLInputElement
      expect(element.value).toEqual(mobileSDKsDocs[0].uid_header)
    })
  })

  describe('buttons', () => {
    test('should redirect to list on button click', (done) => {
      jest.spyOn(mockRouter, 'push').mockImplementation((path) => {
        expect(path).toEqual(`/${selectedBranch}/mobile-sdks/list`)
        done()
      })
      const button = wrapper.find('.redirect-list-button')
      button.trigger('click')
    })

    test('should be able to save document changes', () => {
      const doc = wrapper.vm.selectedMobileSDK
      doc.name = `${doc.name} changed`
      const saveDocumentButton = wrapper.find('.save-document-button')
      saveDocumentButton.trigger('click')
      expect(sendReblazeRequestSpy).toHaveBeenCalledWith(expect.objectContaining({
        methodName: 'PUT',
        url: `configs/${selectedBranch}/d/mobile-sdks/e/${doc.id}/`,
        data: doc,
      }))
    })

    test('should be able to fork document', () => {
      const originalDoc = wrapper.vm.selectedMobileSDK
      const forkedDoc = {...originalDoc}
      forkedDoc.id = expect.any(String)
      forkedDoc.name = expect.stringMatching(`copy of ${forkedDoc.name}`)
      const forkDocumentButton = wrapper.find('.fork-document-button')
      forkDocumentButton.trigger('click')
      expect(sendReblazeRequestSpy).toHaveBeenCalledWith(expect.objectContaining({
        methodName: 'POST',
        url: expect.stringMatching(`configs/${selectedBranch}/d/mobile-sdks/e/`),
        data: forkedDoc,
      }))
    })

    test('should be able to add a new document', () => {
      const newDoc = DatasetsUtils.newOperationEntryFactory['mobile-sdks']()
      newDoc.name = expect.stringMatching('New Mobile SDK')
      newDoc.id = expect.any(String)
      const newDocumentButton = wrapper.find('.new-document-button')
      newDocumentButton.trigger('click')
      expect(sendReblazeRequestSpy).toHaveBeenCalledWith(expect.objectContaining({
        methodName: 'POST',
        url: expect.stringMatching(`configs/${selectedBranch}/d/mobile-sdks/e/`),
        data: newDoc,
      }))
    })

    test('should be able to delete a document', async () => {
      const deleteDocumentButton = wrapper.find('.delete-document-button')
      await deleteDocumentButton.trigger('click')
      expect(sendReblazeRequestSpy).toHaveBeenCalledWith(expect.objectContaining({
        methodName: 'DELETE',
        url: `configs/${selectedBranch}/d/mobile-sdks/e/${mobileSDKsDocs[0].id}/`,
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
      const wantedFileName = 'mobile-sdk'
      const wantedFileType = 'json'
      const wantedFileData = mobileSDKsDocs[0]
      const downloadFileSpy = jest.spyOn(Utils, 'downloadFile').mockImplementation(() => {
      })
      const downloadDocButton = wrapper.find('.download-document-button')
      await downloadDocButton.trigger('click')
      expect(downloadFileSpy).toHaveBeenCalledWith(wantedFileName, wantedFileType, wantedFileData)
    })
  })
})
