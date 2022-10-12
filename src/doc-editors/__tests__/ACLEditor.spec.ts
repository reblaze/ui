// @ts-nocheck
import ACLEditor from '@/doc-editors/ACLEditor.vue'
import TagAutocompleteInput from '@/components/TagAutocompleteInput.vue'
import {describe, test, expect, beforeEach, jest} from '@jest/globals'
import {shallowMount} from '@vue/test-utils'
import {ACLProfile, CustomResponse} from '@/types'
import {nextTick} from 'vue'
import axios from 'axios'

jest.mock('axios')

describe('ACLEditor.vue', () => {
  let docs: ACLProfile[]
  let customResponsesDocs: CustomResponse[]
  let wrapper: any
  beforeEach(() => {
    docs = [
      {
        'id': '__default__',
        'name': 'default-acl',
        'description': 'New ACL Profile Description and Remarks',
        'action': 'default',
        'tags': ['test', 'tag'],
        'allow': [],
        'allow_bot': [
          'google',
        ],
        'deny_bot': [
          'yahoo',
        ],
        'passthrough': [
          'internal',
          'devops',
        ],
        'deny': [
          'tor',
        ],
        'force_deny': [
          'china',
          'ukraine',
        ],
      },
    ]
    customResponsesDocs = [
      {
        'id': 'default',
        'name': 'default blocking action',
      },
      {
        'id': 'monitor',
        'name': 'default monitoring action',
      },
    ]
    const selectedBranch = 'master'
    jest.spyOn(axios, 'get').mockImplementation((path) => {
      if (path === `/conf/api/v3/configs/${selectedBranch}/d/actions/`) {
        return Promise.resolve({data: customResponsesDocs})
      }
      return Promise.resolve({data: {}})
    })
    wrapper = shallowMount(ACLEditor, {
      props: {
        selectedDoc: docs[0],
        selectedBranch: selectedBranch,
      },
    })
  })

  test('should have correct ID displayed', () => {
    expect(wrapper.find('.document-id').text()).toEqual(docs[0].id)
  })

  test('should have correct name in input', () => {
    const element = wrapper.find('.document-name').element as HTMLInputElement
    expect(element.value).toEqual(docs[0].name)
  })

  test('should have correct name in input', () => {
    const element = wrapper.find('.document-description').element as HTMLInputElement
    expect(element.value).toEqual(docs[0].description)
  })

  test('should have tags input component with correct data', () => {
    const tagAutocompleteInputComponent = wrapper.findComponent(TagAutocompleteInput)
    expect(tagAutocompleteInputComponent.props('initialTag')).toEqual(docs[0].tags.join(' '))
  })

  test('should not have any warning in the tags table when there are no duplicate tags', () => {
    const tagsWithWarning = wrapper.findAll('.has-text-danger')
    expect(tagsWithWarning.length).toEqual(0)
  })

  test('should show a warning when there are duplicate tags', () => {
    docs[0]['deny'].push('test-tag')
    docs[0]['allow'].push('test-tag')
    wrapper = shallowMount(ACLEditor, {
      props: {
        selectedDoc: docs[0],
      },
    })
    const tagsWithWarning = wrapper.findAll('.has-text-danger')
    expect(tagsWithWarning.length).toEqual(2)
  })

  test('should show tags as crossed when there are is `all` tag in higher priority', () => {
    docs[0]['passthrough'].push('all')
    wrapper = shallowMount(ACLEditor, {
      props: {
        selectedDoc: docs[0],
      },
    })
    const tagCells = wrapper.findAll('.tag-cell')
    const tagCellsCrossed = tagCells.filter((item: any) => item.element.classList.contains('tag-crossed'))
    expect(tagCellsCrossed.length).toEqual(3)
  })

  test('should not show non bot tags as crossed when there are is `all` tag in higher bot priority', () => {
    docs[0]['deny_bot'].push('all')
    wrapper = shallowMount(ACLEditor, {
      props: {
        selectedDoc: docs[0],
      },
    })
    const tagCells = wrapper.findAll('.tag-cell')
    const tagCellsCrossed = tagCells.filter((item: any) => item.element.classList.contains('tag-crossed'))
    expect(tagCellsCrossed.length).toEqual(0)
  })

  test('should show bot tags as crossed when there are is `all` tag in higher bot priority', () => {
    docs[0]['allow_bot'].push('all')
    wrapper = shallowMount(ACLEditor, {
      props: {
        selectedDoc: docs[0],
      },
    })
    const tagCells = wrapper.findAll('.tag-cell')
    const tagCellsCrossed = tagCells.filter((item: any) => item.element.classList.contains('tag-crossed'))
    expect(tagCellsCrossed.length).toEqual(1)
  })

  test('should add tag to correct section when tag selected', async () => {
    const newPassthroughEntryButton = wrapper.findAll('.add-new-entry-button').at(1)
    await newPassthroughEntryButton.trigger('click')
    const newTag = 'test-tag'
    const tagAutocompleteInput = wrapper.find('.operation-tags').findComponent(TagAutocompleteInput)
    tagAutocompleteInput.vm.$emit('tag-submitted', newTag)
    expect(wrapper.vm.localDoc.passthrough.includes(newTag)).toBeTruthy()
  })

  test('should remove tag from correct section when tag removed', () => {
    const removePassthroughEntryButton = wrapper.findAll('.remove-entry-button').at(3)
    removePassthroughEntryButton.trigger('click')
    expect(wrapper.vm.localDoc.passthrough).toEqual(['internal'])
  })

  test('should hide tag input when tag selection cancelled', async () => {
    const newPassthroughEntryButton = wrapper.findAll('.add-new-entry-button').at(1)
    await newPassthroughEntryButton.trigger('click')
    wrapper.vm.cancelAddNewTag()
    const tagAutocompleteInput = wrapper.find('.operation-tags').findComponent(TagAutocompleteInput)
    await nextTick()
    expect(tagAutocompleteInput.exists()).toBeFalsy()
  })

  describe('tags management', () => {
    test('should emit doc update when adding tags', () => {
      const newTag = 'test-tag'
      const newTagInputValue = `${docs[0].tags.join(' ')} ${newTag}`
      const wantedEmit = JSON.parse(JSON.stringify(docs[0]))
      wantedEmit.tags.push(newTag)
      // change tags
      const tagAutocompleteInput = wrapper.findComponent(TagAutocompleteInput)
      tagAutocompleteInput.vm.$emit('tag-changed', newTagInputValue)
      // check
      expect(wrapper.emitted('update:selectedDoc')).toBeTruthy()
      expect(wrapper.emitted('update:selectedDoc')[0]).toEqual([wantedEmit])
    })

    test('should set document tags to be an empty array if empty string provided', () => {
      const newTagInputValue = ''
      const wantedEmit = JSON.parse(JSON.stringify(docs[0]))
      wantedEmit.tags = []
      // change tags
      const tagAutocompleteInput = wrapper.findComponent(TagAutocompleteInput)
      tagAutocompleteInput.vm.$emit('tag-changed', newTagInputValue)
      // check
      expect(wrapper.emitted('update:selectedDoc')).toBeTruthy()
      expect(wrapper.emitted('update:selectedDoc')[0]).toEqual([wantedEmit])
    })

    test('should set tags input to be an empty string if document tags do not exist', () => {
      delete docs[0].tags
      wrapper = shallowMount(ACLEditor, {
        props: {
          selectedDoc: docs[0],
        },
      })
      const tagAutocompleteInput = wrapper.findComponent(TagAutocompleteInput)
      expect(tagAutocompleteInput.props('initialTag')).toEqual('')
    })

    test('should set tags input to be an empty string if document tags is empty', () => {
      docs[0].tags = []
      wrapper = shallowMount(ACLEditor, {
        props: {
          selectedDoc: docs[0],
        },
      })
      const tagAutocompleteInput = wrapper.findComponent(TagAutocompleteInput)
      expect(tagAutocompleteInput.props('initialTag')).toEqual('')
    })
  })
})
