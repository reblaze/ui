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
      'timeframe': 180,
      'thresholds': 9999,
      'tags': ['default', 'dynamic', 'rule'],
      'include': ['all'],
      'exclude': [],
    }]
    const selectedBranch = 'master'
    jest.spyOn(axios, 'get').mockImplementation((path) => {
      // if (path === `/conf/api/v3/configs/${selectedBranch}/d/dynamicrules/abc123`) {
      //   return Promise.resolve({data: dynamicRulesDocs})
      // }
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
      expect(element.value).toEqual(dynamicRulesDocs[0].timeframe.toString())
    })

    test('should have correct Threshold in input', () => {
      const element = wrapper.find('.document-threshold').element as HTMLInputElement
      expect(element.value).toEqual(dynamicRulesDocs[0].thresholds.toString())
    })

    test.skip('should have tags input component with correct data', () => {
      const tagAutocompleteInputComponent = wrapper.findComponent(TagAutocompleteInput)
      expect(tagAutocompleteInputComponent.props('initialTag')).toEqual(dynamicRulesDocs[0].tags.join(' '))
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
        if (path === `db/master/k/autocomplete/`) {
          return Promise.resolve(tagsData)
        }
        return Promise.resolve()
      })
    })

    test.skip('should emit doc update when adding tags', async () => {
      const newTag = 'test-tag'
      const newTagInputValue = `${dynamicRulesDocs[0].tags.join(' ')} ${newTag}`
      console.log('newTagInputValue', newTagInputValue)
      const wantedEmit = JSON.parse(JSON.stringify(dynamicRulesDocs[0]))
      wantedEmit.tags.concat(' newTag')
      console.log('wantedEmit.tags', wantedEmit.tags)
      // add first
      // const newIncludeEntryButton = wrapper.findAll('.add-new-filter-entry-button').at(0)
      // await newIncludeEntryButton.trigger('click')
      const tagAutocompleteInput = wrapper.findComponent(TagAutocompleteInput)

      // const inputTag = firstTagAutocompleteInput.find('.autocomplete-input')
      // await inputTag.setValue(inputTag.value + newTag)
      tagAutocompleteInput.vm.$emit('tag-changed', newTagInputValue)
      // check
      console.log('emitted1', wrapper.vm.selectedDoc)
      console.log('emitted2', wrapper.emitted('update:selectedDoc').tags)
      expect(wrapper.emitted('update:selectedDoc')).toBeTruthy()
      expect(firstTagAutocompleteInput.vm.selectedDoc[0].tags).toEqual([wantedEmit])
      expect(wrapper.emitted('update:selectedDoc')[0]).toEqual([wantedEmit])
    })
  })
})
