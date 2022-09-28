// @ts-nocheck
import CustomResponseEditor from '@/doc-editors/CustomResponseEditor.vue'
import TagAutocompleteInput from '@/components/TagAutocompleteInput.vue'
import EntriesRelationList from '@/components/EntriesRelationList.vue'
import {beforeEach, describe, expect, test} from '@jest/globals'
import {shallowMount, VueWrapper} from '@vue/test-utils'

describe('CustomResponseEditor.vue', () => {
  let docs: ContentFilterRule[]
  let wrapper: VueWrapper
  beforeEach(() => {
    docs = [
      {
        'id': '100000',
        'name': 'test name 1',
        'description': 'Description test 1',
        'tags': ['test1', 'test11', 'test111'],
        'type': 'skip',
      },
      {
        'id': '200000',
        'name': 'test name 2',
        'description': 'Description test 2',
        'tags': ['test2', 'test22', 'test222'],
        'type': 'custom',
        'params': {
          'status': '404',
          'headers': {
            'foo': 'bar',
            'aaa': 'bbb',
          },
          'content': 'test content',
        },
      },
      {
        'id': '300000',
        'name': 'test name 3',
        'description': 'Description test 3',
        'tags': '',
        'type': 'custom',
        'params': {
          'status': '503',
          'headers': {},
          'content': 'test content',
        },
      },
    ]
    wrapper = shallowMount(CustomResponseEditor, {
      props: {
        selectedDoc: docs[0],
      },
    })
  })
  describe('form data', () => {
    describe('Testing any type except custom type', () => {
      beforeEach(() => {
        wrapper.setProps({selectedDoc: docs[0]})
      })
      test('should have correct ID displayed', ()=>{
        expect(wrapper.find('.document-id').text()).toEqual(docs[0].id)
      })

      test('should have correct name in input', () => {
        const element = wrapper.find('.document-name').element as HTMLInputElement
        expect(element.value).toEqual(docs[0].name)
      })

      test('should have correct description in input', ()=>{
        const element = wrapper.find('.document-description').element as HTMLInputElement
        expect(element.value).toEqual(docs[0].description)
      })

      test('should have correct type in the dropdown', ()=>{
        const element = wrapper.find('.type-selection').element
        expect(element.value).toEqual(docs[0].type)
      })

      test('should not have to introduce the custom panel', ()=>{
        const customDiv = wrapper.find('.custom-panel')
        expect(customDiv.exists()).toBe(false)
      })
    })

    describe('custom type', () => {
      describe('with tags and headers', () => {
        beforeEach(() => {
          wrapper.setProps({selectedDoc: docs[1]})
        })

        test('should have to introduce the custom panel', ()=>{
          const customDiv = wrapper.find('.custom-panel')
          expect(customDiv.exists()).toBe(true)
        })

        test('should have correct status code displayed', ()=>{
          const element = wrapper.find('.document-status-code').element as HTMLInputElement
          expect(element.value).toEqual(docs[1].params.status)
        })

        test('should have correct headers displayed', ()=>{
          const headersKeys = Object.keys(docs[1].params.headers)
          const firstKeyHeader = wrapper.findAll('.document-header-key').at(0).element as HTMLInputElement
          const firstValueHeader = wrapper.findAll('.document-header-value').at(0).element as HTMLInputElement
          const secondKeyHeader = wrapper.findAll('.document-header-key').at(1).element as HTMLInputElement
          const secondValueHeader = wrapper.findAll('.document-header-value').at(1).element as HTMLInputElement
          expect(firstKeyHeader.value).toEqual(headersKeys[0])
          expect(firstValueHeader.value).toEqual(docs[1].params.headers['foo'])
          expect(secondKeyHeader.value).toEqual(headersKeys[1])
          expect(secondValueHeader.value).toEqual(docs[1].params.headers['aaa'])
        })

        test('should have correct content displayed', ()=>{
          const element = wrapper.find('.document-content').element as HTMLInputElement
          expect(element.value).toEqual(docs[1].params.content)
        })

        test('should delete a header on click', async ()=>{
          const headersKeys = Object.keys(docs[1].params.headers)
          const removeButton = wrapper.find('.remove-icon')
          await removeButton.trigger('click')
          const firstKeyHeader = wrapper.findAll('.document-header-key').at(0).element as HTMLInputElement
          const firstValueHeader = wrapper.findAll('.document-header-value').at(0).element as HTMLInputElement
          expect(firstKeyHeader.value).toEqual(headersKeys[1])
          expect(firstValueHeader.value).toEqual(docs[1].params.headers['aaa'])
        })

        test('should add a header on click', async ()=>{
          const addButton = wrapper.find('.add-key-button')
          await addButton.trigger('click')
          const newInputKey = wrapper.findAll('.document-header-key')
          expect(newInputKey.length).toBe(3)
        })

        test('should have correct tags displayed', ()=>{
          const element = wrapper.find('.document-autocomplete-input').element as HTMLInputElement
          expect(element.value).toEqual(docs[1].params.tags)
        })
      })

      describe('without tags and headers', () => {
        beforeEach(() => {
          wrapper.setProps({selectedDoc: docs[2]})
        })

        test('should not display headers when they are empty', ()=>{
          const keyHeader = wrapper.find('.document-header-key')
          const valueHeader = wrapper.find('.document-header-value')
          expect(keyHeader.exists()).toBe(false)
          expect(valueHeader.exists()).toBe(false)
        })

        test('should not display tags when they are empty', ()=>{
          const element = wrapper.find('.document-autocomplete-input').element as HTMLInputElement
          expect(element.value).toEqual(docs[2].params.tags)
        })
      })
    })
  })

  describe('tags management', () => {
    test('should emit doc update when adding tags', () => {
      const newTag = 'test-tag'
      const newTagInputValue = `${docs[0].tags.join(' ')} ${newTag}`
      const wantedEmit = JSON.parse(JSON.stringify(docs[0]))
      wantedEmit.tags.push(newTag)
      console.log(wantedEmit)
      // change tags
      const tagAutocompleteInput = wrapper.findComponent(TagAutocompleteInput)
      tagAutocompleteInput.vm.$emit('tag-changed', newTagInputValue)
      // check
      expect(wrapper.emitted('update:selectedDoc')).toBeTruthy()
      expect(wrapper.emitted('update:selectedDoc'[0])).toEqual([wantedEmit])
    })

    test('should emit form validness when EntriesRelationList is validated', () => {
      const entriesRelationListComponent = wrapper.findComponent(EntriesRelationList)
      entriesRelationListComponent.vm.$emit('invalid', false)
      // check
      expect(wrapper.emitted('form-invalid')).toBeTruthy()
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
      wrapper = shallowMount(CustomResponseEditor, {
        props: {
          selectedDoc: docs[0],
        },
      })
      const tagAutocompleteInput = wrapper.findComponent(TagAutocompleteInput)
      expect(tagAutocompleteInput.props('initialTag')).toEqual('')
    })

    test('should set tags input to be an empty string if document tags is empty', () => {
      docs[0].tags = []
      wrapper = shallowMount(CustomResponseEditor, {
        props: {
          selectedDoc: docs[0],
        },
      })
      const tagAutocompleteInput = wrapper.findComponent(TagAutocompleteInput)
      expect(tagAutocompleteInput.props('initialTag')).toEqual('')
    })
  })
})
