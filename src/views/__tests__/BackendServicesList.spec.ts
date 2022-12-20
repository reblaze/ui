// @ts-nocheck
import BackendServicesList from '@/views/BackendServicesList.vue'
import RbzTable from '@/components/RbzTable'
import DatasetsUtils from '@/assets/DatasetsUtils'
import Utils from '@/assets/Utils'
import {afterEach, beforeEach, describe, expect, jest, test} from '@jest/globals'
import {shallowMount, VueWrapper} from '@vue/test-utils'
import _ from 'lodash'
import {BackendService} from '@/types'
import {nextTick} from 'vue'
import {createTestingPinia} from '@pinia/testing'
import {useBranchesStore} from '../../stores/BranchesStore'
import RequestsUtils, {IRequestParams} from '../../assets/RequestsUtils'

const selectedBranch = 'prod'
const mockRoute = {
  params: {
    branch: selectedBranch,
  },
  path: `/${selectedBranch}/backend-services/list`,
  name: 'BackendServices/list',
}
jest.mock('vue-router', () => ({
  useRoute: jest.fn(() => (mockRoute)),
}))
jest.mock('../../assets/RequestsUtils.ts')

describe('BackendServicesList.vue', () => {
  let wrapper: VueWrapper
  let mockRouter: any
  let backendServicesDocs: BackendService[]
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
    sendReblazeRequestSpy = jest.spyOn(RequestsUtils, 'sendReblazeRequest').mockImplementation(
      (requestParams: IRequestParams) => {
        if (requestParams.url === `configs/${selectedBranch}/d/backends/`) {
          return Promise.resolve({data: _.cloneDeep(backendServicesDocs)})
        }
        return Promise.resolve({data: []})
      })
    mockRouter = {
      push: jest.fn(),
    }
    wrapper = shallowMount(BackendServicesList, {
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
      wrapper = shallowMount(BackendServicesList, {
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
      expect(wrapper.vm.backendServices).toEqual([])
    })
  })

  describe('loading indicator', () => {
    test('should display loading indicator when doc type not loaded', async () => {
      jest.spyOn(RequestsUtils, 'sendReblazeRequest').mockImplementation(
        (requestParams: IRequestParams) => {
          if (requestParams.url === `configs/${selectedBranch}/d/backends/`) {
            return new Promise(() => {
            })
          }
          return Promise.resolve({data: {}})
        })
      wrapper = shallowMount(BackendServicesList, {
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
      const wantedFileName = 'backend-services'
      const wantedFileType = 'json'
      const wantedFileData = backendServicesDocs
      const downloadFileSpy = jest.spyOn(Utils, 'downloadFile').mockImplementation(() => {
      })
      const downloadDocButton = wrapper.find('.download-document-button')
      await downloadDocButton.trigger('click')
      expect(downloadFileSpy).toHaveBeenLastCalledWith(wantedFileName, wantedFileType, wantedFileData)
    })

    test('should be able to add a new document', async () => {
      const newDoc = DatasetsUtils.newOperationEntryFactory['backends']()
      newDoc.name = expect.stringMatching('New Backend Service')
      newDoc.id = expect.any(String)
      const rbzTable = wrapper.findComponent(RbzTable)
      rbzTable.vm.$emit('new-button-clicked')
      expect(sendReblazeRequestSpy).toHaveBeenLastCalledWith(expect.objectContaining({
        methodName: 'POST',
        url: expect.stringMatching(`configs/${selectedBranch}/d/backends/e/`),
        data: newDoc,
      }))
    })

    test('should redirect to correct document when clicking on edit document button', async () => {
      const rbzTable = wrapper.findComponent(RbzTable)
      rbzTable.vm.$emit('row-button-clicked', backendServicesDocs[1]['id'])
      expect(mockRouter.push).toHaveBeenLastCalledWith(`/prod/backend-services/config/${backendServicesDocs[1]['id']}`)
      rbzTable.vm.$emit('row-button-clicked', backendServicesDocs[0]['id'])
      expect(mockRouter.push).toHaveBeenLastCalledWith(`/prod/backend-services/config/${backendServicesDocs[0]['id']}`)
    })
  })

  describe('document column options', () => {
    test(`should load correct column options`, async () => {
      const defaultDoc = DatasetsUtils.newOperationEntryFactory['backends']()
      _.forEach(wrapper.vm.columns, (columnOptions) => {
        if (typeof columnOptions.displayFunction === 'function') {
          expect(['string', 'number']).toContain(typeof columnOptions.displayFunction(defaultDoc))
        }
      })
    })
  })
})
