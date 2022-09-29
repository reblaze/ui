// @ts-nocheck
import FlowControlPolicyEditor from '@/doc-editors/FlowControlPolicyEditor.vue'
import LimitOption from '@/components/LimitOption.vue'
import TagAutocompleteInput from '@/components/TagAutocompleteInput.vue'
import {beforeEach, describe, expect, test, jest} from '@jest/globals'
import {shallowMount} from '@vue/test-utils'
import axios from 'axios'
import {FlowControlPolicy} from '@/types'
import {VueWrapper} from '@vue/test-utils'
import {nextTick} from 'vue'

jest.mock('axios')

describe('FlowControlPolicyEditor.vue', () => {
  let docs: FlowControlPolicy[]
  let wrapper: VueWrapper
  beforeEach(() => {
    docs = [
      {
        'exclude': ['devops', 'internal'],
        'include': ['china'],
        'name': 'flow control policy',
        'key': [
          {
            'attrs': 'ip',
          },
        ],
        'sequence': [
          {
            'method': 'GET',
            'uri': '/login',
            'cookies': {
              'foo': 'bar',
            },
            'headers': {
              'host': 'www.example.com',
            },
            'args': {},
          },
          {
            'method': 'POST',
            'uri': '/login',
            'cookies': {
              'foo': 'bar',
            },
            'headers': {
              'host': 'www.example.com',
              'test': 'one',
            },
            'args': {},
          },
        ],
        'active': true,
        'description': 'New Flow Control Policy Description and Remarks',
        'action': 'default',
        'timeframe': 60,
        'id': 'c03dabe4b9ca',
        'tags': ['test-tag'],
      },
    ]
    wrapper = shallowMount(FlowControlPolicyEditor, {
      props: {
        selectedDoc: docs[0],
      },
    })
  })

  describe('form data', () => {
    test('should have correct ID displayed', () => {
      expect(wrapper.find('.document-id').text()).toEqual(docs[0].id)
    })

    test('should have correct name in input', () => {
      const element = wrapper.find('.document-name').element as HTMLInputElement
      expect(element.value).toEqual(docs[0].name)
    })

    test('should have correct active mode', () => {
      const element = wrapper.find('.document-active').element as HTMLInputElement
      expect(element.checked).toEqual(docs[0].active)
    })

    test('should have correct timeframe in input', () => {
      const element = wrapper.find('.document-timeframe').element as HTMLInputElement
      expect(element.value).toEqual(docs[0].timeframe.toString())
    })

    test('should have limit option component with correct data', () => {
      const wantedType = Object.keys(docs[0].key[0])[0]
      const wantedValue = Object.values(docs[0].key[0])[0]
      const limitOptionComponent = wrapper.findAllComponents(LimitOption).at(0)
      const actualType = limitOptionComponent.vm.option.type
      const actualValue = limitOptionComponent.vm.option.key
      expect(actualType).toEqual(wantedType)
      expect(actualValue).toEqual(wantedValue)
    })

    test('should have correct description in input', () => {
      const element = wrapper.find('.document-description').element as HTMLTextAreaElement
      expect(element.value).toEqual(docs[0].description.toString())
    })

    test('should have correct tags in include filter', () => {
      const includeFilterColumn = wrapper.find('.include-filter-column')
      const tagCells = includeFilterColumn.findAll('.tag-cell')
      expect(tagCells.at(0).text()).toEqual(docs[0].include[0])
      expect(tagCells.length).toEqual(1)
    })

    test('should have correct tags in exclude filter', () => {
      const excludeFilterColumn = wrapper.find('.exclude-filter-column')
      const tagCells = excludeFilterColumn.findAll('.tag-cell')
      expect(tagCells.at(0).text()).toEqual(docs[0].exclude[0])
      expect(tagCells.at(1).text()).toEqual(docs[0].exclude[1])
      expect(tagCells.length).toEqual(2)
    })
  })

  describe('count by key', () => {
    test('should add key when button is clicked', () => {
      const addKeyButton = wrapper.find('.add-key-button')
      addKeyButton.trigger('click')
      const wantedType = 'attrs'
      const wantedValue = 'ip'
      const actualType = Object.keys(wrapper.vm.localDoc.key[1])[0]
      const actualValue = Object.values(wrapper.vm.localDoc.key[1])[0]
      expect(wrapper.vm.localDoc.key.length).toEqual(2)
      expect(actualType).toEqual(wantedType)
      expect(actualValue).toEqual(wantedValue)
    })

    test('should handle key with no value', () => {
      docs[0].key = [{'headers': null}]
      wrapper = shallowMount(FlowControlPolicyEditor, {
        props: {
          selectedDoc: docs[0],
        },
      })
      const wantedType = 'headers'
      const actualType = Object.keys(wrapper.vm.localDoc.key[0])[0]
      const actualValue = Object.values(wrapper.vm.localDoc.key[0])[0]
      expect(actualType).toEqual(wantedType)
      expect(actualValue).toEqual(null)
    })

    test('should show error when two of the same key type exist', async () => {
      const addKeyButton = wrapper.find('.add-key-button')
      await addKeyButton.trigger('click')
      await addKeyButton.trigger('click')
      const keyInvalidLabel = wrapper.find('.key-invalid')
      expect(keyInvalidLabel.exists()).toBeTruthy()
    })

    test('should remove key when remove event occurs', () => {
      const addKeyButton = wrapper.find('.add-key-button')
      addKeyButton.trigger('click')
      const limitOptionsComponent = wrapper.findComponent(LimitOption)
      limitOptionsComponent.vm.$emit('remove', 1)
      expect(wrapper.vm.localDoc.key.length).toEqual(1)
    })

    test('should not be able to remove key when only one key exists', () => {
      const limitOptionsComponent = wrapper.findComponent(LimitOption)
      limitOptionsComponent.vm.$emit('remove', 1)
      expect(wrapper.vm.localDoc.key.length).toEqual(1)
    })

    test('should update key when change event occurs', async () => {
      const newOption = {
        type: 'self',
        key: 'self',
      }
      const wantedResult = {
        self: 'self',
      }
      const limitOptionsComponent = wrapper.findComponent(LimitOption)
      await limitOptionsComponent.vm.$emit('change', newOption, 0)
      expect(wrapper.vm.localDoc.key[0]).toEqual(wantedResult)
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

    test('should not have any warning in the tags table when there are no duplicate tags', () => {
      const tagsWithWarning = wrapper.findAll('.has-text-danger')
      expect(tagsWithWarning.length).toEqual(0)
    })

    test('should emit doc update when adding tags', async () => {
      const newTag = 'test-tag'
      const wantedEmit = JSON.parse(JSON.stringify(docs[0]))
      wantedEmit.include.push(newTag)
      const newIncludeEntryButton = wrapper.findAll('.add-new-filter-entry-button').at(0)
      // add first
      await newIncludeEntryButton.trigger('click')
      const firstTagAutocompleteInput = wrapper.find('.filter-columns').findComponent(TagAutocompleteInput)
      firstTagAutocompleteInput.vm.$emit('tag-submitted', newTag)
      // check
      expect(wrapper.emitted('update:selectedDoc')).toBeTruthy()
      expect(wrapper.emitted('update:selectedDoc')[0]).toEqual([wantedEmit])
    })

    test('should show a warning when there are duplicate tags', async () => {
      const duplicatedTagsDoc = JSON.parse(JSON.stringify(docs[0]))
      duplicatedTagsDoc.include = ['test-tag', 'test-tag']
      await wrapper.setProps({selectedDoc: duplicatedTagsDoc})
      // check
      const tagsWithWarning = wrapper.findAll('.has-text-danger')
      expect(tagsWithWarning.length).toEqual(2)
    })

    test('should not emit doc update when adding tags which is 2 or less characters long', async () => {
      const newTag = 't'
      const wantedEmit = JSON.parse(JSON.stringify(docs[0]))
      wantedEmit.include.push(newTag)
      const newIncludeEntryButton = wrapper.findAll('.add-new-filter-entry-button').at(0)
      // add first
      await newIncludeEntryButton.trigger('click')
      const firstTagAutocompleteInput = wrapper.find('.filter-columns').findComponent(TagAutocompleteInput)
      firstTagAutocompleteInput.vm.$emit('tag-submitted', newTag)
      // check
      expect(wrapper.emitted('update:selectedDoc')).toBeFalsy()
    })

    test('should remove tag from correct filter when tag removed', async () => {
      const removeIncludeEntryButton = wrapper.find('.remove-filter-entry-button')
      removeIncludeEntryButton.trigger('click')
      await nextTick()
      expect(wrapper.vm.localDoc.include.length).toEqual(0)
    })

    test('should hide tag input when tag selection cancelled', async () => {
      const newIncludeEntryButton = wrapper.find('.add-new-filter-entry-button')
      await newIncludeEntryButton.trigger('click')
      wrapper.vm.cancelAddNewTag()
      await nextTick()
      const tagAutocompleteInput = wrapper.find('.filter-columns').findComponent(TagAutocompleteInput)
      await nextTick()
      expect(tagAutocompleteInput.exists()).toBeFalsy()
    })
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
      wrapper = shallowMount(FlowControlPolicyEditor, {
        props: {
          selectedDoc: docs[0],
        },
      })
      const tagAutocompleteInput = wrapper.findComponent(TagAutocompleteInput)
      expect(tagAutocompleteInput.props('initialTag')).toEqual('')
    })

    test('should set tags input to be an empty string if document tags is empty', () => {
      docs[0].tags = []
      wrapper = shallowMount(FlowControlPolicyEditor, {
        props: {
          selectedDoc: docs[0],
        },
      })
      const tagAutocompleteInput = wrapper.findComponent(TagAutocompleteInput)
      expect(tagAutocompleteInput.props('initialTag')).toEqual('')
    })
  })

  describe('sequence list', () => {
    describe('add section button', () => {
      test('should add section', async () => {
        const addSectionButton = wrapper.find('.new-sequence-button')
        await addSectionButton.trigger('click')
        wrapper.vm.$forceUpdate()
        await nextTick()
        const sections = wrapper.findAll('.sequence-entries')
        expect(sections.length).toEqual(3)
      })

      test('should add section with default data', async () => {
        // empty sections list
        let removeSectionButton = wrapper.find('.remove-section-button')
        await removeSectionButton.trigger('click')
        removeSectionButton = wrapper.find('.remove-section-button')
        await removeSectionButton.trigger('click')
        // create new section
        const addSectionButton = wrapper.find('.new-sequence-button')
        await addSectionButton.trigger('click')
        wrapper.vm.$forceUpdate()
        await nextTick()
        // check data
        const tables = wrapper.findAll('.sequence-entries-table')
        const methodEntryInput = wrapper.find('.method-entry-input')
        const uriEntryInput = wrapper.find('.uri-entry-input')
        const hostEntryInput = wrapper.find('.host-entry-input')
        expect(tables.length).toEqual(1)
        expect((methodEntryInput.element as HTMLInputElement).value).toContain('GET')
        expect((uriEntryInput.element as HTMLInputElement).value).toContain('/')
        expect((hostEntryInput.element as HTMLInputElement).value).toContain('www.example.com')
      })

      test('should get header host value from first section', async () => {
        const wantedHostValue = 'api.example.com'
        const hostEntryInput = wrapper.findAll('.host-entry-input').at(0)
        hostEntryInput.setValue(wantedHostValue)
        await hostEntryInput.trigger('input')
        const addSectionButton = wrapper.find('.new-sequence-button')
        await addSectionButton.trigger('click')
        wrapper.vm.$forceUpdate()
        await nextTick()
        const newHostEntryInput = wrapper.findAll('.host-entry-input').at(2)
        expect((newHostEntryInput.element as HTMLInputElement).value).toContain(wantedHostValue)
      })
    })

    describe('remove section button', () => {
      test('should remove section', async () => {
        const removeSectionButton = wrapper.find('.remove-section-button')
        await removeSectionButton.trigger('click')
        wrapper.vm.$forceUpdate()
        await nextTick()
        const tables = wrapper.findAll('.sequence-entries-table')
        expect(tables.length).toEqual(1)
      })

      test('should not have the option to remove section if no sections exist', async () => {
        // remove all sections
        while (wrapper.vm.localDoc.sequence.length > 0) {
          const removeSectionButton = wrapper.find('.remove-section-button')
          await removeSectionButton.trigger('click')
        }
        wrapper.vm.$forceUpdate()
        await nextTick()
        // check
        const removeSectionButton = wrapper.find('.remove-section-button')
        expect(removeSectionButton.exists()).toBeFalsy() // element
      })
    })

    describe('add entry button', () => {
      test('should open new entry row', async () => {
        const table = wrapper.findAll('.sequence-entries-table').at(0)
        const addEntryButton = table.find('.add-entry-button')
        await addEntryButton.trigger('click')
        wrapper.vm.$forceUpdate()
        await nextTick()
        const newEntryRow = table.find('.new-entry-row')
        expect(newEntryRow.exists()).toBeTruthy()
      })

      test('should add new entries from input when confirm button is clicked', async () => {
        const table = wrapper.findAll('.sequence-entries-table').at(0)
        const addEntryButton = table.find('.add-entry-button')
        await addEntryButton.trigger('click')
        const newEntryRow = table.find('.new-entry-row')
        const typeSelection = newEntryRow.find('.new-entry-type-selection')
        typeSelection.trigger('click')
        const options = typeSelection.findAll('option')
        await typeSelection.setValue(options.at(0).element.value)
        const newEntryName = newEntryRow.find('.new-entry-name-input')
        newEntryName.setValue('something')
        const newEntryValue = newEntryRow.find('.new-entry-value-input')
        newEntryValue.setValue('right')
        const confirmAddEntryButton = table.find('.confirm-add-entry-button')
        await confirmAddEntryButton.trigger('click')
        wrapper.vm.$forceUpdate()
        await nextTick()
        const entriesRows = wrapper.findAll('.sequence-entries-table').at(0).findAll('.sequence-entry-row')
        expect(entriesRows.length).toEqual(5)
        expect(entriesRows.at(3).text()).toContain('Header')
        expect(entriesRows.at(3).text()).toContain('something')
        expect(entriesRows.at(3).text()).toContain('right')
      })

      test('should be able to add header as a new entry', async () => {
        const table = wrapper.findAll('.sequence-entries-table').at(0)
        const addEntryButton = table.find('.add-entry-button')
        await addEntryButton.trigger('click')
        const newEntryRow = table.find('.new-entry-row')
        const typeSelection = newEntryRow.find('.new-entry-type-selection')
        typeSelection.trigger('click')
        const options = typeSelection.findAll('option')
        typeSelection.setValue(options.at(0).element.value)
        const newEntryName = newEntryRow.find('.new-entry-name-input')
        newEntryName.setValue('something')
        const newEntryValue = newEntryRow.find('.new-entry-value-input')
        newEntryValue.setValue('right')
        const confirmAddEntryButton = table.find('.confirm-add-entry-button')
        await confirmAddEntryButton.trigger('click')
        wrapper.vm.$forceUpdate()
        await nextTick()
        const entriesRows = wrapper.findAll('.sequence-entries-table').at(0).findAll('.sequence-entry-row')
        expect(entriesRows.length).toEqual(5)
        expect(entriesRows.at(3).text()).toContain('Header')
        expect(entriesRows.at(3).text()).toContain('something')
        expect(entriesRows.at(3).text()).toContain('right')
      })

      test('should be able to add argument as a new entry', async () => {
        const table = wrapper.findAll('.sequence-entries-table').at(0)
        const addEntryButton = table.find('.add-entry-button')
        await addEntryButton.trigger('click')
        const newEntryRow = table.find('.new-entry-row')
        const typeSelection = newEntryRow.find('.new-entry-type-selection')
        typeSelection.trigger('click')
        const options = typeSelection.findAll('option')
        typeSelection.setValue(options.at(1).element.value)
        const newEntryName = newEntryRow.find('.new-entry-name-input')
        newEntryName.setValue('something')
        const newEntryValue = newEntryRow.find('.new-entry-value-input')
        newEntryValue.setValue('right')
        const confirmAddEntryButton = table.find('.confirm-add-entry-button')
        await confirmAddEntryButton.trigger('click')
        wrapper.vm.$forceUpdate()
        await nextTick()
        const entriesRows = wrapper.findAll('.sequence-entries-table').at(0).findAll('.sequence-entry-row')
        expect(entriesRows.length).toEqual(5)
        expect(entriesRows.at(3).text()).toContain('Argument')
        expect(entriesRows.at(3).text()).toContain('something')
        expect(entriesRows.at(3).text()).toContain('right')
      })

      test('should be able to add cookie as a new entry', async () => {
        const table = wrapper.findAll('.sequence-entries-table').at(0)
        const addEntryButton = table.find('.add-entry-button')
        await addEntryButton.trigger('click')
        const newEntryRow = table.find('.new-entry-row')
        const typeSelection = newEntryRow.find('.new-entry-type-selection')
        typeSelection.trigger('click')
        const options = typeSelection.findAll('option')
        typeSelection.setValue(options.at(2).element.value)
        const newEntryName = newEntryRow.find('.new-entry-name-input')
        newEntryName.setValue('something')
        const newEntryValue = newEntryRow.find('.new-entry-value-input')
        newEntryValue.setValue('right')
        const confirmAddEntryButton = table.find('.confirm-add-entry-button')
        await confirmAddEntryButton.trigger('click')
        wrapper.vm.$forceUpdate()
        await nextTick()
        const entriesRows = wrapper.findAll('.sequence-entries-table').at(0).findAll('.sequence-entry-row')
        expect(entriesRows.length).toEqual(5)
        expect(entriesRows.at(4).text()).toContain('Cookie')
        expect(entriesRows.at(4).text()).toContain('something')
        expect(entriesRows.at(4).text()).toContain('right')
      })

      test('should not add new header if name is host', async () => {
        const table = wrapper.findAll('.sequence-entries-table').at(0)
        const addEntryButton = table.find('.add-entry-button')
        await addEntryButton.trigger('click')
        const newEntryRow = table.find('.new-entry-row')
        const typeSelection = newEntryRow.find('.new-entry-type-selection')
        typeSelection.trigger('click')
        const options = typeSelection.findAll('option')
        typeSelection.setValue(options.at(0).element.value)
        const newEntryName = newEntryRow.find('.new-entry-name-input')
        newEntryName.setValue('host')
        const newEntryValue = newEntryRow.find('.new-entry-value-input')
        newEntryValue.setValue('some value')
        const confirmAddEntryButton = table.find('.confirm-add-entry-button')
        await confirmAddEntryButton.trigger('click')
        wrapper.vm.$forceUpdate()
        await nextTick()
        const entriesRows = wrapper.findAll('.sequence-entries-table').at(0).findAll('.sequence-entry-row')
        expect(entriesRows.length).toEqual(4)
      })

      test('should not add new entries from input when confirm button is clicked if does not have name', async () => {
        const table = wrapper.findAll('.sequence-entries-table').at(0)
        const addEntryButton = table.find('.add-entry-button')
        addEntryButton.trigger('click')
        await nextTick()
        const newEntryRow = table.find('.new-entry-row')
        const typeSelection = newEntryRow.find('.new-entry-type-selection')
        typeSelection.trigger('click')
        const options = typeSelection.findAll('option')
        typeSelection.setValue(options.at(0).element.value)
        await nextTick()
        const newEntryValue = newEntryRow.find('.new-entry-value-input')
        newEntryValue.setValue('right')
        const confirmAddEntryButton = table.find('.confirm-add-entry-button')
        confirmAddEntryButton.trigger('click')
        wrapper.vm.$forceUpdate()
        await nextTick()
        const entriesRows = wrapper.findAll('.sequence-entries-table').at(0).findAll('.sequence-entry-row')
        expect(entriesRows.length).toEqual(4)
      })

      test('should not add new entries from input when confirm button is clicked if does not have value', async () => {
        const table = wrapper.findAll('.sequence-entries-table').at(0)
        const addEntryButton = table.find('.add-entry-button')
        await addEntryButton.trigger('click')
        const newEntryRow = table.find('.new-entry-row')
        const typeSelection = newEntryRow.find('.new-entry-type-selection')
        typeSelection.trigger('click')
        const options = typeSelection.findAll('option')
        typeSelection.setValue(options.at(0).element.value)
        const newEntryName = newEntryRow.find('.new-entry-name-input')
        newEntryName.setValue('something')
        const confirmAddEntryButton = table.find('.confirm-add-entry-button')
        await confirmAddEntryButton.trigger('click')
        wrapper.vm.$forceUpdate()
        await nextTick()
        const entriesRows = wrapper.findAll('.sequence-entries-table').at(0).findAll('.sequence-entry-row')
        expect(entriesRows.length).toEqual(4)
      })
    })

    describe('remove entry button', () => {
      test('should remove entry', async () => {
        const table = wrapper.findAll('.sequence-entries-table').at(0)
        const removeEntryButton = table.find('.remove-entry-button')
        await removeEntryButton.trigger('click')
        wrapper.vm.$forceUpdate()
        await nextTick()
        const entriesRows = wrapper.findAll('.sequence-entries-table').at(0).findAll('.sequence-entry-row')
        expect(entriesRows.length).toEqual(3)
      })
    })
  })
})
