// @ts-nocheck
import RoutingProfilesList from '@/views/RoutingProfilesList.vue'
import RbzTable from '@/components/RbzTable'
import DatasetsUtils from '@/assets/DatasetsUtils'
import Utils from '@/assets/Utils'
import {afterEach, beforeEach, describe, expect, jest, test} from '@jest/globals'
import {shallowMount, VueWrapper} from '@vue/test-utils'
import _ from 'lodash'
import {RoutingProfile} from '@/types'
import {nextTick} from 'vue'
import {createTestingPinia} from '@pinia/testing'
import {useBranchesStore} from '../../stores/BranchesStore'
import RequestsUtils, {IRequestParams} from '../../assets/RequestsUtils'
``
const selectedBranch = 'prod'
const mockRoute = {
  params: {
    branch: selectedBranch,
  },
  path: `/${selectedBranch}/routing-profiles/list`,
  name: 'RoutingProfiles/list',
}
jest.mock('vue-router', () => ({
  useRoute: jest.fn(() => (mockRoute)),
}))
jest.mock('../../assets/RequestsUtils.ts')

describe('RoutingProfilesList.vue', () => {
  let wrapper: VueWrapper
  let mockRouter: any
  let routingProfilesDocs: RoutingProfile[]
  let sendReblazeRequestSpy: any
  beforeEach(async () => {
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
    sendReblazeRequestSpy = jest.spyOn(RequestsUtils, 'sendReblazeRequest').mockImplementation(
      (requestParams: IRequestParams) => {
        if (requestParams.url === `configs/${selectedBranch}/d/routing-profiles/`) {
          return Promise.resolve({data: _.cloneDeep(routingProfilesDocs)})
        }
        return Promise.resolve({data: []})
      })
    mockRouter = {
      push: jest.fn(),
    }
    wrapper = shallowMount(RoutingProfilesList, {
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
      wrapper = shallowMount(RoutingProfilesList, {
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
      expect(wrapper.vm.routingProfiles).toEqual([])
    })
  })

  describe('loading indicator', () => {
    test('should display loading indicator when doc type not loaded', async () => {
      jest.spyOn(RequestsUtils, 'sendReblazeRequest').mockImplementation(
        (requestParams: IRequestParams) => {
          if (requestParams.url === `configs/${selectedBranch}/d/routing-profiles/`) {
            return new Promise(() => {
            })
          }
          return Promise.resolve({data: {}})
        })
      wrapper = shallowMount(RoutingProfilesList, {
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
      const wantedFileName = 'routing-profiles'
      const wantedFileType = 'json'
      const wantedFileData = routingProfilesDocs
      const downloadFileSpy = jest.spyOn(Utils, 'downloadFile').mockImplementation(() => {
      })
      const downloadDocButton = wrapper.find('.download-document-button')
      await downloadDocButton.trigger('click')
      expect(downloadFileSpy).toHaveBeenLastCalledWith(wantedFileName, wantedFileType, wantedFileData)
    })

    test('should be able to add a new document', async () => {
      const newDoc = DatasetsUtils.newOperationEntryFactory['routing-profiles']()
      newDoc.name = expect.stringMatching('New Routing Profile')
      newDoc.id = expect.any(String)
      newDoc.locations[0].id = expect.any(String)
      const rbzTable = wrapper.findComponent(RbzTable)
      rbzTable.vm.$emit('new-button-clicked')
      expect(sendReblazeRequestSpy).toHaveBeenLastCalledWith(expect.objectContaining({
        methodName: 'POST',
        url: expect.stringMatching(`configs/${selectedBranch}/d/routing-profiles/e/`),
        data: newDoc,
      }))
    })

    test('should redirect to correct document when clicking on edit document button', async () => {
      const rbzTable = wrapper.findComponent(RbzTable)
      rbzTable.vm.$emit('row-button-clicked', routingProfilesDocs[1]['id'])
      expect(mockRouter.push).toHaveBeenLastCalledWith(`/prod/routing-profiles/config/${routingProfilesDocs[1]['id']}`)
      rbzTable.vm.$emit('row-button-clicked', routingProfilesDocs[0]['id'])
      expect(mockRouter.push).toHaveBeenLastCalledWith(`/prod/routing-profiles/config/${routingProfilesDocs[0]['id']}`)
    })
  })

  describe('document column options', () => {
    test(`should load correct column options`, async () => {
      const defaultDoc = DatasetsUtils.newOperationEntryFactory['routing-profiles']()
      _.forEach(wrapper.vm.columns, (columnOptions) => {
        if (typeof columnOptions.displayFunction === 'function') {
          expect(['string', 'number']).toContain(typeof columnOptions.displayFunction(defaultDoc))
        }
      })
    })
  })
})
