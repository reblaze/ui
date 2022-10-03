// @ts-nocheck
import DynamicRulesEditor from '@/doc-editors/DynamicRulesEditor.vue'
import {beforeEach, describe, expect, jest, test} from '@jest/globals'
import {mount, VueWrapper} from '@vue/test-utils'
import {DynamicRules} from '@/types'
// Dictionary,
// IncludeExcludeType,
// ThresholdActionPair
import axios from 'axios'
import TagAutocompleteInput from '@/components/TagAutocompleteInput.vue'
// import {nextTick} from 'vue'

jest.mock('axios')

describe('DynamicRulesEditor.vue', () => {
  let dynamicRulesDocs: DynamicRules[]
  let mockRouter: any
  let wrapper: VueWrapper
  beforeEach(() => {
    dynamicRulesDocs = [{
      'id': 'abc123',
      'name': 'New Dynamic Rules',
      'description': 'New Dynamic Rules Description and Remarks',
      'timeframe': 30,
      'thresholds': 250,
      'tags': ['default dynamic rule'],
      'include': ['all'],
      'exclude': [],
    }]
    const selectedBranch = 'master'
    jest.spyOn(axios, 'get').mockImplementation((path) => {
      if (path === `/conf/api/v3/configs/${selectedBranch}/d/dynamicrules/abc123`) {
        return Promise.resolve({data: dynamicRulesDocs})
      }
      return Promise.resolve({data: []})
    })
    mockRouter = {
      push: jest.fn(),
    }
    const onUpdate = async (selectedDoc: DynamicRules) => {
      await wrapper.setProps({selectedDoc})
    }
    wrapper = mount(DynamicRulesEditor, {
      props: {
        'selectedDoc': dynamicRulesDocs[0],
        'selectedBranch': selectedBranch,
        'onUpdate:selectedDoc': onUpdate,
      //  'docs': selectedDocs[0],
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
      expect(element.value).toEqual(cloudFunctionsDocs[0].timeframe)
    })

    test('should have correct timeframe in input', () => {
      const element = wrapper.find('.document-timeframe').element as HTMLInputElement
      expect(element.value).toEqual(cloudFunctionsDocs[0].timeframe)
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
        if (path === `db/master/k/autocomplete/`) {
          return Promise.resolve(tagsData)
        }
        return Promise.resolve()
      })
    })

    test('should emit doc update when adding tags', async () => {
      const newTag = 'test-tag'
      const wantedEmit = JSON.parse(JSON.stringify(dynamicRulesDocs[0]))
      wantedEmit.include.push(newTag)
      const newIncludeEntryButton = wrapper.findAll('.add-new-filter-entry-button').at(0)
      // add first
      await newIncludeEntryButton.trigger('click')
      const firstTagAutocompleteInput = wrapper.findComponent(TagAutocompleteInput)
      firstTagAutocompleteInput.vm.$emit('tag-submitted', newTag)
      // check
      expect(wrapper.emitted('update:selectedDoc')).toBeTruthy()
      expect(wrapper.emitted('update:selectedDoc')[0]).toEqual([wantedEmit])
    })
  })
})
