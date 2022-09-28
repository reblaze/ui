// @ts-nocheck
import DynamicRulesEditor from '@/doc-editors/DynamicRulesEditor.vue'
import {beforeEach, describe, expect, jest, test} from '@jest/globals'
import {mount, VueWrapper} from '@vue/test-utils'
import {DynamicRules} from '@/types'
// Dictionary,
// IncludeExcludeType,
// ThresholdActionPair
import axios from 'axios'
// import TagAutocompleteInput from '@/components/TagAutocompleteInput.vue'
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
    test('should have correct ID displayed', () => {
      expect(wrapper.find('.document-id').text()).toEqual(dynamicRulesDocs[0].id)
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
