// @ts-nocheck
import DynamicRulesList from '@/views/DynamicRulesList.vue'
import RbzTable from '@/components/RbzTable'
import DatasetsUtils from '@/assets/DatasetsUtils'
import Utils from '@/assets/Utils'
import {afterEach, beforeEach, describe, expect, jest, test} from '@jest/globals'
import {shallowMount, VueWrapper} from '@vue/test-utils'
import _ from 'lodash'
import {CustomResponse, DynamicRule} from '@/types'
import {nextTick} from 'vue'
import {createTestingPinia} from '@pinia/testing'
import {useBranchesStore} from '../../stores/BranchesStore'
import RequestsUtils, {IRequestParams} from '../../assets/RequestsUtils'

const selectedBranch = 'prod'
const mockRoute = {
  params: {
    branch: selectedBranch,
  },
  path: `/${selectedBranch}/dynamic-rules/list`,
  name: 'DynamicRules/list',
}
jest.mock('vue-router', () => ({
  useRoute: jest.fn(() => (mockRoute)),
}))
jest.mock('../../assets/RequestsUtils.ts')

describe('DynamicRulesList.vue', () => {
  let wrapper: VueWrapper
  let mockRouter: any
  let dynamicRulesDocs: DynamicRule[]
  let customResponsesDocs: CustomResponse[]
  let sendReblazeRequestSpy: any
  beforeEach(async () => {
    dynamicRulesDocs = [
      {
        'active': true,
        'description': 'New Dynamic Rule Description and Remarks 2',
        'exclude': [],
        'id': '665ea3c4ed60',
        'include': ['all'],
        'name': 'test dynamic rule ',
        'target': 'ip',
        'threshold': 2,
        'timeframe': 3,
        'ttl': 72000,
      },
      {
        'active': false,
        'description': 'New Dynamic Rule Description and Remarks',
        'exclude': [],
        'id': '28eddd47b516',
        'include': ['all'],
        'name': 'New Dynamic Rule 28eddd47b516',
        'target': 'ip',
        'threshold': 9999,
        'timeframe': 1,
        'ttl': 7200,
      },
    ]
    customResponsesDocs = [
      {
        'id': 'action-dynamic-rule-block',
        'name': 'Dynamic-rule block',
      },
      {
        'id': 'action-monitor',
        'name': 'monitor (tag only)',
      },
    ]
    sendReblazeRequestSpy = jest.spyOn(RequestsUtils, 'sendReblazeRequest').mockImplementation(
      (requestParams: IRequestParams) => {
        if (requestParams.url === `configs/${selectedBranch}/d/dynamic-rules/`) {
          return Promise.resolve({data: _.cloneDeep(dynamicRulesDocs)})
        }
        return Promise.resolve({data: []})
      })
    jest.spyOn(RequestsUtils, 'sendRequest').mockImplementation(
      (requestParams: IRequestParams) => {
        if (requestParams.url === `configs/${selectedBranch}/d/actions/`) {
          return Promise.resolve({data: _.cloneDeep(customResponsesDocs)})
        }
        return Promise.resolve({data: []})
      })
    mockRouter = {
      push: jest.fn(),
    }
    wrapper = shallowMount(DynamicRulesList, {
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
      wrapper = shallowMount(DynamicRulesList, {
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
      expect(wrapper.vm.dynamicRules).toEqual([])
    })
  })

  describe('loading indicator', () => {
    test('should display loading indicator when doc type not loaded', async () => {
      jest.spyOn(RequestsUtils, 'sendReblazeRequest').mockImplementation(
        (requestParams: IRequestParams) => {
          if (requestParams.url === `configs/${selectedBranch}/d/dynamic-rules/`) {
            return new Promise(() => {
            })
          }
          return Promise.resolve({data: {}})
        })
      wrapper = shallowMount(DynamicRulesList, {
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
      const wantedFileName = 'dynamic-rules'
      const wantedFileType = 'json'
      const wantedFileData = dynamicRulesDocs
      const downloadFileSpy = jest.spyOn(Utils, 'downloadFile').mockImplementation(() => {
      })
      const downloadDocButton = wrapper.find('.download-document-button')
      await downloadDocButton.trigger('click')
      expect(downloadFileSpy).toHaveBeenLastCalledWith(wantedFileName, wantedFileType, wantedFileData)
    })

    test('should be able to add a new document', async () => {
      const newDoc = DatasetsUtils.newDocEntryFactory['dynamic-rules']()
      newDoc.name = expect.stringMatching('New Dynamic Rule')
      newDoc.id = expect.any(String)
      const rbzTable = wrapper.findComponent(RbzTable)
      rbzTable.vm.$emit('new-button-clicked')
      expect(sendReblazeRequestSpy).toHaveBeenLastCalledWith(expect.objectContaining({
        methodName: 'POST',
        url: expect.stringMatching(`configs/${selectedBranch}/d/dynamic-rules/e/`),
        data: newDoc,
      }))
    })

    test('should redirect to correct document when clicking on edit document button', async () => {
      const rbzTable = wrapper.findComponent(RbzTable)
      rbzTable.vm.$emit('row-button-clicked', dynamicRulesDocs[1]['id'])
      expect(mockRouter.push).toHaveBeenLastCalledWith(`/prod/dynamic-rules/config/${dynamicRulesDocs[1]['id']}`)
      rbzTable.vm.$emit('row-button-clicked', dynamicRulesDocs[0]['id'])
      expect(mockRouter.push).toHaveBeenLastCalledWith(`/prod/dynamic-rules/config/${dynamicRulesDocs[0]['id']}`)
    })
  })

  describe('document column options', () => {
    test(`should load correct column options`, async () => {
      const defaultDoc = DatasetsUtils.newDocEntryFactory['dynamic-rules']()
      _.forEach(wrapper.vm.columns, (columnOptions) => {
        if (typeof columnOptions.displayFunction === 'function') {
          expect(['string', 'number']).toContain(typeof columnOptions.displayFunction(defaultDoc))
        }
      })
    })
  })
})
