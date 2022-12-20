// @ts-nocheck
import EdgeFunctionsList from '@/views/EdgeFunctionsList.vue'
import RbzTable from '@/components/RbzTable'
import DatasetsUtils from '@/assets/DatasetsUtils'
import Utils from '@/assets/Utils'
import {afterEach, beforeEach, describe, expect, jest, test} from '@jest/globals'
import {shallowMount, VueWrapper} from '@vue/test-utils'
import _ from 'lodash'
import {EdgeFunction} from '@/types'
import {nextTick} from 'vue'
import {createTestingPinia} from '@pinia/testing'
import {useBranchesStore} from '../../stores/BranchesStore'
import RequestsUtils, {IRequestParams} from '../../assets/RequestsUtils'

const selectedBranch = 'prod'
const mockRoute = {
  params: {
    branch: selectedBranch,
  },
  path: `/${selectedBranch}/cloud-functions/list`,
  name: 'EdgeFunctions/list',
}
jest.mock('vue-router', () => ({
  useRoute: jest.fn(() => (mockRoute)),
}))
jest.mock('../../assets/RequestsUtils.ts')

describe('EdgeFunctionsList.vue', () => {
  let wrapper: VueWrapper
  let mockRouter: any
  let edgeFunctionsDocs: EdgeFunction[]
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
    sendReblazeRequestSpy = jest.spyOn(RequestsUtils, 'sendReblazeRequest').mockImplementation(
      (requestParams: IRequestParams) => {
        if (requestParams.url === `configs/${selectedBranch}/d/cloud-functions/`) {
          return Promise.resolve({data: _.cloneDeep(edgeFunctionsDocs)})
        }
        return Promise.resolve({data: []})
      })
    mockRouter = {
      push: jest.fn(),
    }
    wrapper = shallowMount(EdgeFunctionsList, {
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
      wrapper = shallowMount(EdgeFunctionsList, {
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
      expect(wrapper.vm.edgeFunctions).toEqual([])
    })
  })

  describe('loading indicator', () => {
    test('should display loading indicator when doc type not loaded', async () => {
      jest.spyOn(RequestsUtils, 'sendReblazeRequest').mockImplementation(
        (requestParams: IRequestParams) => {
          if (requestParams.url === `configs/${selectedBranch}/d/cloud-functions/`) {
            return new Promise(() => {
            })
          }
          return Promise.resolve({data: {}})
        })
      wrapper = shallowMount(EdgeFunctionsList, {
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
      const wantedFileName = 'cloud-functions'
      const wantedFileType = 'json'
      const wantedFileData = edgeFunctionsDocs
      const downloadFileSpy = jest.spyOn(Utils, 'downloadFile').mockImplementation(() => {
      })
      const downloadDocButton = wrapper.find('.download-document-button')
      await downloadDocButton.trigger('click')
      expect(downloadFileSpy).toHaveBeenLastCalledWith(wantedFileName, wantedFileType, wantedFileData)
    })

    test('should be able to add a new document', async () => {
      const newDoc = DatasetsUtils.newDocEntryFactory['cloud-functions']()
      newDoc.name = expect.stringMatching('New Edge Function')
      newDoc.id = expect.any(String)
      const rbzTable = wrapper.findComponent(RbzTable)
      rbzTable.vm.$emit('new-button-clicked')
      expect(sendReblazeRequestSpy).toHaveBeenLastCalledWith(expect.objectContaining({
        methodName: 'POST',
        url: expect.stringMatching(`configs/${selectedBranch}/d/cloud-functions/e/`),
        data: newDoc,
      }))
    })

    test('should redirect to correct document when clicking on edit document button', async () => {
      const rbzTable = wrapper.findComponent(RbzTable)
      rbzTable.vm.$emit('row-button-clicked', edgeFunctionsDocs[1]['id'])
      expect(mockRouter.push).toHaveBeenLastCalledWith(`/prod/cloud-functions/config/${edgeFunctionsDocs[1]['id']}`)
      rbzTable.vm.$emit('row-button-clicked', edgeFunctionsDocs[0]['id'])
      expect(mockRouter.push).toHaveBeenLastCalledWith(`/prod/cloud-functions/config/${edgeFunctionsDocs[0]['id']}`)
    })
  })

  describe('document column options', () => {
    test(`should load correct column options`, async () => {
      const defaultDoc = DatasetsUtils.newDocEntryFactory['cloud-functions']()
      _.forEach(wrapper.vm.columns, (columnOptions) => {
        if (typeof columnOptions.displayFunction === 'function') {
          expect(['string', 'number']).toContain(typeof columnOptions.displayFunction(defaultDoc))
        }
      })
    })
  })
})
