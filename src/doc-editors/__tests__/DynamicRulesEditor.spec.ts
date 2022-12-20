// @ts-nocheck
import DynamicRulesEditor from '@/doc-editors/DynamicRulesEditor.vue'
import {beforeEach, describe, expect, jest, test} from '@jest/globals'
import {mount, VueWrapper} from '@vue/test-utils'
import {CustomResponse, DynamicRule, GlobalFilter} from '@/types'
import TagAutocompleteInput from '@/components/TagAutocompleteInput.vue'
import {createTestingPinia} from '@pinia/testing'
import RequestsUtils, {IRequestParams} from '../../assets/RequestsUtils'
import DatasetsUtils from '../../assets/DatasetsUtils'
import Utils from '../../assets/Utils'
import {useBranchesStore} from '../../stores/BranchesStore'
import {nextTick} from 'vue'
import _ = require('lodash')

const selectedBranch = 'prod'
const mockRoute = {
  params: {
    branch: selectedBranch,
    doc_id: '665ea3c4ed60',
  },
  path: `/${selectedBranch}/dynamic-rules/config/665ea3c4ed60`,
  name: 'DynamicRules/config',
}
jest.mock('vue-router', () => ({
  useRoute: jest.fn(() => (mockRoute)),
}))
jest.mock('../../assets/RequestsUtils.ts')

describe('DynamicRulesEditor.vue', () => {
  let dynamicRulesDocs: DynamicRule[]
  let globalFiltersDocs: GlobalFilter[]
  let customResponsesDocs: CustomResponse[]
  let mockRouter: any
  let wrapper: VueWrapper
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
    globalFiltersDocs = [
      {
        'id': 'dr_665ea3c4ed60',
        'name': 'Global Filter for Dynamic Rule 665ea3c4ed60',
        'source': 'self-managed',
        'mdate': '2020-05-23T00:04:41',
        'description': '',
        'active': true,
        'tags': ['api', 'okay'],
        'action': 'action-dynamic-rule-block',
        'rule': {
          'relation': 'OR',
          'entries': [],
        },
      },
      {
        'id': 'dr_28eddd47b516',
        'name': 'Global Filter for Dynamic Rule 28eddd47b516',
        'source': 'self-managed',
        'mdate': '2020-05-23T00:04:41',
        'description': '',
        'active': true,
        'tags': ['api', 'okay'],
        'action': 'action-dynamic-rule-block',
        'rule': {
          'relation': 'OR',
          'entries': [],
        },
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
        if (requestParams.url === `configs/${selectedBranch}/d/dynamic-rules/e/665ea3c4ed60/`) {
          return Promise.resolve({data: _.cloneDeep(dynamicRulesDocs[0])})
        }
        if (requestParams.url === `'configs/${selectedBranch}/d/dynamic-rules/e/28eddd47b516/`) {
          return Promise.resolve({data: _.cloneDeep(dynamicRulesDocs[1])})
        }
        return Promise.resolve({data: []})
      })
    jest.spyOn(RequestsUtils, 'sendRequest').mockImplementation(
      (requestParams: IRequestParams) => {
        if (requestParams.url === `configs/${selectedBranch}/d/globalfilters/`) {
          return Promise.resolve({data: _.cloneDeep(globalFiltersDocs)})
        }
        if (requestParams.url === `configs/${selectedBranch}/d/globalfilters/e/dr_665ea3c4ed60/`) {
          return Promise.resolve({data: _.cloneDeep(globalFiltersDocs[0])})
        }
        if (requestParams.url === `configs/${selectedBranch}/d/globalfilters/e/dr_28eddd47b516/`) {
          return Promise.resolve({data: _.cloneDeep(globalFiltersDocs[1])})
        }
        if (requestParams.url === `configs/${selectedBranch}/d/actions/`) {
          return Promise.resolve({data: _.cloneDeep(customResponsesDocs)})
        }
        return Promise.resolve({data: []})
      })
    mockRouter = {
      push: jest.fn(),
    }
    wrapper = mount(DynamicRulesEditor, {
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
      expect(wrapper.find('.document-id').text()).toEqual(dynamicRulesDocs[0].id)
    })

    test('should have correct name in input', () => {
      const element = wrapper.find('.document-name').element as HTMLInputElement
      expect(element.value).toEqual(dynamicRulesDocs[0].name)
    })

    test('should have correct description in input', () => {
      const element = wrapper.find('.document-description').element as HTMLInputElement
      expect(element.value).toEqual(dynamicRulesDocs[0].description)
    })

    test('should have correct timeframe in input', () => {
      const element = wrapper.find('.document-timeframe').element as HTMLInputElement
      expect(element.value).toEqual(dynamicRulesDocs[0].timeframe.toString())
    })

    test('should have correct threshold in input', () => {
      const element = wrapper.find('.document-threshold').element as HTMLInputElement
      expect(element.value).toEqual(dynamicRulesDocs[0].threshold.toString())
    })

    test('should have correct quarantined time in input', () => {
      const element = wrapper.find('.document-quarantine-time').element as HTMLInputElement
      expect(element.value).toEqual(dynamicRulesDocs[0].ttl.toString())
    })
  })

  describe('tags', () => {
    beforeEach(() => {
      const tagsData = {
        data: {
          tags: [
            'united-states',
            'test-tag-1',
            'test-tag-2',
            'another-tag',
            'devops',
            'internal',
          ],
        },
      }
      jest.spyOn(RequestsUtils, 'sendRequest').mockImplementation((path) => {
        if (path === `db/prod/k/autocomplete/`) {
          return Promise.resolve(tagsData)
        }
        return Promise.resolve()
      })
    })

    test('should have tags input component with correct data', () => {
      const tagAutocompleteInputComponent = wrapper.findComponent(TagAutocompleteInput)
      expect(tagAutocompleteInputComponent.props('initialTag')).toEqual(globalFiltersDocs[0].tags.join(' '))
    })

    test('should not have any warning in the tags table when there are no duplicate tags', () => {
      const filterColumns = wrapper.find('.filter-columns')
      const tagsWithWarning = filterColumns.findAll('.has-text-danger')
      expect(tagsWithWarning.length).toEqual(0)
    })
  })

  describe('buttons', () => {
    test('should redirect to list on button click', (done) => {
      jest.spyOn(mockRouter, 'push').mockImplementation((path) => {
        expect(path).toEqual(`/${selectedBranch}/dynamic-rules/list`)
        done()
      })
      const button = wrapper.find('.redirect-list-button')
      button.trigger('click')
    })

    test('should be able to save document changes', () => {
      const doc = wrapper.vm.selectedDynamicRule
      doc.name = `${doc.name} changed`
      const saveDocumentButton = wrapper.find('.save-document-button')
      saveDocumentButton.trigger('click')
      expect(sendReblazeRequestSpy).toHaveBeenCalledWith(expect.objectContaining({
        methodName: 'PUT',
        url: `configs/${selectedBranch}/d/dynamic-rules/e/${doc.id}/`,
        data: doc,
      }))
    })

    test('should be able to fork document', () => {
      const originalDoc = wrapper.vm.selectedDynamicRule
      const forkedDoc = {...originalDoc}
      forkedDoc.id = expect.any(String)
      forkedDoc.name = expect.stringMatching(`copy of ${forkedDoc.name}`)
      const forkDocumentButton = wrapper.find('.fork-document-button')
      forkDocumentButton.trigger('click')
      expect(sendReblazeRequestSpy).toHaveBeenCalledWith(expect.objectContaining({
        methodName: 'POST',
        url: expect.stringMatching(`configs/${selectedBranch}/d/dynamic-rules/e/`),
        data: forkedDoc,
      }))
    })

    test('should be able to add a new document', () => {
      const newDoc = DatasetsUtils.newDocEntryFactory['dynamic-rules']()
      newDoc.name = expect.stringMatching('New Dynamic Rule')
      newDoc.id = expect.any(String)
      const newDocumentButton = wrapper.find('.new-document-button')
      newDocumentButton.trigger('click')
      expect(sendReblazeRequestSpy).toHaveBeenCalledWith(expect.objectContaining({
        methodName: 'POST',
        url: expect.stringMatching(`configs/${selectedBranch}/d/dynamic-rules/e/`),
        data: newDoc,
      }))
    })

    test('should be able to delete a document', async () => {
      const deleteDocumentButton = wrapper.find('.delete-document-button')
      await deleteDocumentButton.trigger('click')
      expect(sendReblazeRequestSpy).toHaveBeenCalledWith(expect.objectContaining({
        methodName: 'DELETE',
        url: `configs/${selectedBranch}/d/dynamic-rules/e/${dynamicRulesDocs[0].id}/`,
      }))
    })

    test('should attempt to download document when download button is clicked', async () => {
      const wantedFileName = 'dynamic-rule'
      const wantedFileType = 'json'
      const wantedFileData = dynamicRulesDocs[0]
      const downloadFileSpy = jest.spyOn(Utils, 'downloadFile').mockImplementation(() => {
      })
      const downloadDocButton = wrapper.find('.download-document-button')
      await downloadDocButton.trigger('click')
      expect(downloadFileSpy).toHaveBeenCalledWith(wantedFileName, wantedFileType, wantedFileData)
    })
  })
})
