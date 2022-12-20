// @ts-nocheck
import MobileSDKList from '@/views/MobileSDKsList.vue'
import RbzTable from '@/components/RbzTable'
import DatasetsUtils from '@/assets/DatasetsUtils'
import Utils from '@/assets/Utils'
import {afterEach, beforeEach, describe, expect, jest, test} from '@jest/globals'
import {shallowMount, VueWrapper} from '@vue/test-utils'
import _ from 'lodash'
import {MobileSDK} from '@/types'
import {nextTick} from 'vue'
import {createTestingPinia} from '@pinia/testing'
import {useBranchesStore} from '../../stores/BranchesStore'
import RequestsUtils, {IRequestParams} from '../../assets/RequestsUtils'

const selectedBranch = 'prod'
const mockRoute = {
  params: {
    branch: selectedBranch,
  },
  path: `/${selectedBranch}/mobile-sdks/list`,
  name: 'MobileSDK/list',
}
jest.mock('vue-router', () => ({
  useRoute: jest.fn(() => (mockRoute)),
}))
jest.mock('../../assets/RequestsUtils.ts')

describe('MobileSDKList.vue', () => {
  let wrapper: VueWrapper
  let mockRouter: any
  let mobileSDKsDocs: MobileSDK[]
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
    sendReblazeRequestSpy = jest.spyOn(RequestsUtils, 'sendReblazeRequest').mockImplementation(
      (requestParams: IRequestParams) => {
        if (requestParams.url === `configs/${selectedBranch}/d/mobile-sdks/`) {
          return Promise.resolve({data: _.cloneDeep(mobileSDKsDocs)})
        }
        return Promise.resolve({data: []})
      })
    mockRouter = {
      push: jest.fn(),
    }
    wrapper = shallowMount(MobileSDKList, {
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
      wrapper = shallowMount(MobileSDKList, {
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
      expect(wrapper.vm.mobileSDKs).toEqual([])
    })

    test('should default to empty array when receiving a rejected promise', async () => {
      jest.spyOn(RequestsUtils, 'sendReblazeRequest').mockImplementation(() => {
        return Promise.reject(new Error())
      })
      wrapper = shallowMount(MobileSDKList, {
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
      expect(wrapper.vm.mobileSDKs).toEqual([])
    })
  })

  describe('loading indicator', () => {
    test('should display loading indicator when doc type not loaded', async () => {
      jest.spyOn(RequestsUtils, 'sendReblazeRequest').mockImplementation(
        (requestParams: IRequestParams) => {
          if (requestParams.url === `configs/${selectedBranch}/d/mobile-sdks/`) {
            return new Promise(() => {
            })
          }
          return Promise.resolve({data: {}})
        })
      wrapper = shallowMount(MobileSDKList, {
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
      const wantedFileName = 'mobile-sdks'
      const wantedFileType = 'json'
      const wantedFileData = mobileSDKsDocs
      const downloadFileSpy = jest.spyOn(Utils, 'downloadFile').mockImplementation(() => {
      })
      const downloadDocButton = wrapper.find('.download-document-button')
      await downloadDocButton.trigger('click')
      expect(downloadFileSpy).toHaveBeenLastCalledWith(wantedFileName, wantedFileType, wantedFileData)
    })

    test('should be able to add a new document', async () => {
      const newDoc = DatasetsUtils.newOperationEntryFactory['mobile-sdks']()
      newDoc.name = expect.stringMatching('New Mobile SDK')
      newDoc.id = expect.any(String)
      const rbzTable = wrapper.findComponent(RbzTable)
      rbzTable.vm.$emit('new-button-clicked')
      expect(sendReblazeRequestSpy).toHaveBeenLastCalledWith(expect.objectContaining({
        methodName: 'POST',
        url: expect.stringMatching(`configs/${selectedBranch}/d/mobile-sdks/e/`),
        data: newDoc,
      }))
    })

    test('should redirect to correct document when clicking on edit document button', async () => {
      const rbzTable = wrapper.findComponent(RbzTable)
      rbzTable.vm.$emit('row-button-clicked', mobileSDKsDocs[1]['id'])
      expect(mockRouter.push).toHaveBeenLastCalledWith(`/prod/mobile-sdks/config/${mobileSDKsDocs[1]['id']}`)
      rbzTable.vm.$emit('row-button-clicked', mobileSDKsDocs[0]['id'])
      expect(mockRouter.push).toHaveBeenLastCalledWith(`/prod/mobile-sdks/config/${mobileSDKsDocs[0]['id']}`)
    })
  })

  describe('document column options', () => {
    test(`should load correct column options`, async () => {
      const defaultDoc = DatasetsUtils.newOperationEntryFactory['mobile-sdks']()
      _.forEach(wrapper.vm.columns, (columnOptions) => {
        if (typeof columnOptions.displayFunction === 'function') {
          expect(['string', 'number']).toContain(typeof columnOptions.displayFunction(defaultDoc))
        }
      })
    })
  })
})
