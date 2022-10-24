// @ts-nocheck
import DynamicRulesEditor from '@/doc-editors/DynamicRulesEditor.vue'
import {beforeEach, describe, expect, jest, test} from '@jest/globals'
import {shallowMount, VueWrapper} from '@vue/test-utils'
import {DynamicRule, GlobalFilter, CustomResponse} from '@/types'
import axios from 'axios'
import TagAutocompleteInput from '@/components/TagAutocompleteInput.vue'


jest.mock('axios')

describe('DynamicRulesEditor.vue', () => {
  let dynamicRulesDocs: DynamicRule[]
  let globalFilterMatchingDoc: GlobalFilter[]
  let customResponsesDocs: CustomResponse[]
  let mockRouter: any
  let wrapper: VueWrapper
  let selectedBranch: string
  beforeEach(() => {
    dynamicRulesDocs = [{
      'id': 'abc123',
      'name': 'New Dynamic Rules',
      'description': 'New Dynamic Rules Description and Remarks',
      'timeframe': 180,
      'threshold': 9999,
      'include': ['all'],
      'exclude': [],
      'ttl': 7200,
      'target': 'remote_addr',
    }]
    globalFilterMatchingDoc = [
      {
        'id': 'dr_abc123',
        'name': 'New Dynamic Rule abc123',
        'source': 'self-managed',
        'mdate': '2020-05-23T00:04:41',
        'description': 'Tag API Requests',
        'active': true,
        'tags': ['api', 'okay'],
        'action': 'action-dynamic-rule-block',
        'rule': {
          'relation': 'OR',
          'entries': [
            {'relation': 'OR', 'entries': [['ip', '1.1.1.1', null]]},
            {'relation': 'OR', 'entries': [['ip', '2.2.2.2', null]]},
            {'relation': 'OR', 'entries': [['headers', ['headerrr', 'valueeee'], 'anooo']]},
          ],
        },
      },
    ]
    customResponsesDocs = [
      {
        'id': 'action-dynamic-rule-block',
        'name': 'default monitoring action',
      },
    ]
    selectedBranch = 'prod',

    mockRouter = {
      push: jest.fn(),
    }

    jest.spyOn(axios, 'get').mockImplementation((path) => {
      console.log('path', path)
      if (path.includes('dynamic-rules')) {
        return Promise.resolve({data: dynamicRulesDocs})
      } else if (path.includes('globalfilters')) {
        return Promise.resolve({data: globalFilterMatchingDoc})
      } else if (path.includes('actions')) {
        return Promise.resolve({data: customResponsesDocs})
      }
      return Promise.resolve({data: {}})
    })
    wrapper = shallowMount(DynamicRulesEditor, {
      props: {
        'selectedDoc': dynamicRulesDocs[0],
        'selectedBranch': selectedBranch,
        'selectedDocMatchingGlobalFilter': globalFilterMatchingDoc[0],
      },
      global: {
        mocks: {
          $router: mockRouter,
        },
      },
    })
  })

  describe('form data', () => {
    afterEach(() => {
      jest.clearAllMocks()
      jest.clearAllTimers()
    })

    test('should have correct action list', () => {
      expect(wrapper.vm.customResponseNames.length).toBeGreaterThan(0)
    })
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

    test('should have correct Threshold in input', () => {
      const element = wrapper.find('.document-threshold').element as HTMLInputElement
      expect(element.value).toEqual(dynamicRulesDocs[0].threshold.toString())
    })

    test('should have correct time-span in input', () => {
      const element = wrapper.find('.document-time-span').element as HTMLInputElement
      expect(element.value).toEqual(dynamicRulesDocs[0].ttl.toString())
    })

    test('should not have any warning in the tags table when there are no duplicate tags', () => {
      const tagsWithWarning = wrapper.findAll('.has-text-danger')
      expect(tagsWithWarning.length).toEqual(0)
    })

    test('should emit correct data after input was changed', async () => {
      const newDesciption = '4 new requests per minute'
      const description = wrapper.find('.document-description')
      description.value = newDesciption
      await description.setValue(newDesciption)
      await description.trigger('change')

      expect(wrapper.emitted('update:selectedDoc')).toBeTruthy()
      expect(wrapper.emitted('update:selectedDoc')[0][0].description).toContain(newDesciption)
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
      jest.spyOn(axios, 'get').mockImplementation((path) => {
        if (path === `db/prod/k/autocomplete/`) {
          return Promise.resolve(tagsData)
        }
        return Promise.resolve()
      })
    })


    test('should have tags input component with correct data', () => {
      const tagAutocompleteInputComponent = wrapper.findAllComponents(TagAutocompleteInput).at(0)
      expect(tagAutocompleteInputComponent.props('initialTag')).toEqual(globalFilterMatchingDoc[0].tags.join(' '))
    })

    test('should emit doc update when adding tags', async () => {
      const newTag = 'test-tag'
      const newTagInputValue = `${globalFilterMatchingDoc[0].tags.join(' ')} ${newTag}`
      const wantedEmit = JSON.parse(JSON.stringify(globalFilterMatchingDoc[0]))
      wantedEmit.tags.push(newTag)
      // add first
      const tagAutocompleteInput = wrapper.findAllComponents(TagAutocompleteInput).at(0)
      tagAutocompleteInput.vm.$emit('tag-changed', newTagInputValue)
      expect(wrapper.emitted('update:selectedDocMatchingGlobalFilter')[0]).toEqual([wantedEmit])
    })
  })
})
