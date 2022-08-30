import ACLEditor from '@/doc-editors/ACLEditor.vue'
import TagAutocompleteInput from '@/components/TagAutocompleteInput.vue'
import {describe, test, expect, beforeEach} from '@jest/globals'
import {shallowMount} from '@vue/test-utils'
// import Vue from 'vue'
import {ACLProfile} from '@/types'

describe('ACLEditor.vue', () => {
  let docs: ACLProfile[]
  let wrapper: any
  beforeEach(() => {
    docs = [
      {
        'id': '__default__',
        'name': 'default-acl',
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
    wrapper = shallowMount(ACLEditor, {
      props: {
        selectedDoc: docs[0],
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

  test('should not have any warning in the tags table when there are no duplicate tags', () => {
    const tagsWithWarning = wrapper.findAll('.has-text-danger')
    expect(tagsWithWarning.length).toEqual(0)
  })

  test('should show a warning when there are duplicate tags', async () => {
    docs[0]['deny'].push('test-tag')
    docs[0]['allow'].push('test-tag')
    wrapper = shallowMount(ACLEditor, {
      props: {
        selectedDoc: docs[0],
      },
    })
    await wrapper.vm.$nextTick()
    const tagsWithWarning = wrapper.findAll('.has-text-danger')
    expect(tagsWithWarning.length).toEqual(2)
  })

  test('should show tags as crossed when there are is `all` tag in higher priority', async () => {
    docs[0]['passthrough'].push('all')
    wrapper = shallowMount(ACLEditor, {
      props: {
        selectedDoc: docs[0],
      },
    })
    await wrapper.vm.$nextTick()
    const tagCells = wrapper.findAll('.tag-cell')
    const tagCellsCrossed = tagCells.filter((item: any) => item.element.classList.contains('tag-crossed'))
    expect(tagCellsCrossed.length).toEqual(3)
  })

  test('should not show non bot tags as crossed when there are is `all` tag in higher bot priority', async () => {
    docs[0]['deny_bot'].push('all')
    wrapper = shallowMount(ACLEditor, {
      props: {
        selectedDoc: docs[0],
      },
    })
    await wrapper.vm.$nextTick()
    const tagCells = wrapper.findAll('.tag-cell')
    const tagCellsCrossed = tagCells.filter((item: any) => item.element.classList.contains('tag-crossed'))
    expect(tagCellsCrossed.length).toEqual(0)
  })

  test('should show bot tags as crossed when there are is `all` tag in higher bot priority', async () => {
    docs[0]['allow_bot'].push('all')
    wrapper = shallowMount(ACLEditor, {
      props: {
        selectedDoc: docs[0],
      },
    })
    await wrapper.vm.$nextTick()
    const tagCells = wrapper.findAll('.tag-cell')
    const tagCellsCrossed = tagCells.filter((item: any) => item.element.classList.contains('tag-crossed'))
    expect(tagCellsCrossed.length).toEqual(1)
  })

  test('should add tag to correct section when tag selected', async () => {
    const newPassthroughEntryButton = wrapper.findAll('.add-new-entry-button').at(1)
    newPassthroughEntryButton.trigger('click')
    await wrapper.vm.$nextTick()
    const newTag = 'test-tag'
    const tagAutocompleteInput = wrapper.findComponent(TagAutocompleteInput)
    tagAutocompleteInput.vm.$emit('tag-submitted', newTag)
    await wrapper.vm.$nextTick()
    expect((wrapper.vm as any).localDoc.passthrough.includes(newTag)).toBeTruthy()
  })

  test('should remove tag from correct section when tag removed', async () => {
    const removePassthroughEntryButton = wrapper.findAll('.remove-entry-button').at(3)
    removePassthroughEntryButton.trigger('click')
    await wrapper.vm.$nextTick()
    expect((wrapper.vm as any).localDoc.passthrough).toEqual(['internal'])
  })

  test('should hide tag input when tag selection cancelled', async () => {
    const newPassthroughEntryButton = wrapper.findAll('.add-new-entry-button').at(1)
    newPassthroughEntryButton.trigger('click')
    await wrapper.vm.$nextTick();
    (wrapper.vm as any).cancelAddNewTag()
    await wrapper.vm.$nextTick()
    const tagAutocompleteInput = wrapper.findComponent(TagAutocompleteInput)
    await wrapper.vm.$nextTick()
    expect(tagAutocompleteInput.exists()).toBeFalsy()
  })
})
