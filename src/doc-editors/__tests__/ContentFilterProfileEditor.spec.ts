// @ts-nocheck
import ContentFilterEditor from '@/doc-editors/ContentFilterProfileEditor.vue'
import TagAutocompleteInput from '@/components/TagAutocompleteInput.vue'
import {beforeEach, describe, expect, jest, test} from '@jest/globals'
import {shallowMount} from '@vue/test-utils'
import {
  ArgsCookiesHeadersType,
  ContentFilterEntryMatch,
  ContentFilterProfile,
  ContentFilterProfileSection,
  ContentFilterRule,
  NamesRegexType,
} from '@/types'
import AutocompleteInput from '@/components/AutocompleteInput.vue'
import _ from 'lodash'
import axios from 'axios'
import {nextTick} from 'vue'

jest.mock('axios')

describe('ContentFilterProfileEditor.vue', () => {
  let docs: ContentFilterProfile[]
  let wrapper: any
  let contentFilterRulesDocs: ContentFilterRule[]
  beforeEach(async () => {
    docs = [{
      'id': '__default__',
      'name': 'default contentfilter',
      'description': 'New Content Filter Profile Description and Remarks',
      'action': 'default',
      'tags': [],
      'ignore_body': true,
      'ignore_alphanum': true,
      'headers': {
        'names': [],
        'regex': [],
        'max_count': 42,
        'max_length': 1024,
      },
      'cookies': {
        'names': [],
        'regex': [],
        'max_count': 42,
        'max_length': 1024,
      },
      'args': {
        'names': [],
        'regex': [],
        'max_count': 512,
        'max_length': 1024,
      },
      'path': {
        'names': [],
        'regex': [],
        'max_count': 42,
        'max_length': 1024,
      },
      'decoding': {
        base64: true,
        dual: false,
        html: false,
        unicode: false,
      },
      'masking_seed': '',
      'content_type': ['json', 'multipart_form'],
      'active': ['active-tag1', 'active-tag2'],
      'report': ['report-tag1'],
      'ignore': ['ignore-tag1'],
      'tags': ['test-tag'],
    }]
    contentFilterRulesDocs = [
      {
        'id': '100000',
        'name': '100000',
        'msg': 'SQLi Attempt (Conditional Operator Detected)',
        'operand': '\\s(and|or)\\s+\\d+\\s+.*between\\s.*\\d+\\s+and\\s+\\d+.*',
        'risk': 5,
        'description': '',
        'category': 'sqli',
        'subcategory': 'statement injection',
        'tags': [],
      },
      {
        'id': '100001',
        'name': '100001',
        'subcategory': 'statement injection',
        'category': 'sqli',
        'risk': 5,
        'description': '',
        'operand': '\\s(and|or)\\s+["\']\\w+["\']\\s+.*between\\s.*["\']\\w+["\']\\s+and\\s+["\']\\w+.*',
        'msg': 'SQLi Attempt (Conditional Operator Detected)',
        'tags': [],
      },
      {
        'id': '100002',
        'name': '100002',
        'subcategory': 'statement injection',
        'category': 'sqli',
        'risk': 5,
        'description': '',
        'operand': '\\W(\\s*)?(and|or)\\s.*(\'|").+(\'|")(\\s+)?(=|>|<|>=|<=).*(\'|").+',
        'msg': 'SQLi Attempt (Conditional Operator Detected)',
        'tags': [],
      },
    ]
    jest.spyOn(axios, 'get').mockImplementation((path, config) => {
      if (!wrapper) {
        return Promise.resolve({data: []})
      }
      const branch = wrapper.vm.selectedBranch
      if (path === `/conf/api/v3/configs/${branch}/d/contentfilterrules/`) {
        if (config && config.headers && config.headers['x-fields'] === 'id, name') {
          return Promise.resolve({data: _.map(contentFilterRulesDocs, (i: any) => _.pick(i, 'id', 'name'))})
        }
        return Promise.resolve({data: contentFilterRulesDocs})
      }
      return Promise.resolve({data: []})
    })
    const onUpdate = (doc: ContentFilterProfile) => {
      wrapper.setProps({selectedDoc: doc})
    }
    wrapper = shallowMount(ContentFilterEditor, {
      props: {
        'selectedDoc': docs[0],
        'selectedBranch': 'master',
        'onUpdate:selectedDoc': onUpdate,
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

    test('should have correct max header length in input', () => {
      const element = wrapper.find('.max-header-length-input').element as HTMLInputElement
      expect(element.value).toEqual(docs[0].headers.max_length.toString())
    })

    test('should have correct max cookie length in input', () => {
      const element = wrapper.find('.max-cookie-length-input').element as HTMLInputElement
      expect(element.value).toEqual(docs[0].cookies.max_length.toString())
    })

    test('should have correct max arg length in input', () => {
      const element = wrapper.find('.max-arg-length-input').element as HTMLInputElement
      expect(element.value).toEqual(docs[0].args.max_length.toString())
    })

    test('should have correct max headers count in input', () => {
      const element = wrapper.find('.max-headers-count-input').element as HTMLInputElement
      expect(element.value).toEqual(docs[0].headers.max_count.toString())
    })

    test('should have correct max cookies count in input', () => {
      const element = wrapper.find('.max-cookies-count-input').element as HTMLInputElement
      expect(element.value).toEqual(docs[0].cookies.max_count.toString())
    })

    test('should have correct max args count in input', () => {
      const element = wrapper.find('.max-args-count-input').element as HTMLInputElement
      expect(element.value).toEqual(docs[0].args.max_count.toString())
    })

    test('should have correct ignore alphanumeric boolean in checkbox input', () => {
      const element = wrapper.find('.ignore-alphanumeric-input').element as HTMLInputElement
      expect(element.checked).toEqual(docs[0].ignore_alphanum)
    })
  })

  describe('tags', () => {
    test('should not have any warning in the tags table when there are no duplicate tags', () => {
      const tagsWithWarning = wrapper.findAll('.has-text-danger')
      expect(tagsWithWarning.length).toEqual(0)
    })

    test('should show a warning when there are duplicate tags', () => {
      docs[0]['report'].push('test-tag')
      docs[0]['active'].push('test-tag')
      wrapper = shallowMount(ContentFilterEditor, {
        props: {
          selectedDoc: docs[0],
        },
      })
      const tagsWithWarning = wrapper.findAll('.has-text-danger')
      expect(tagsWithWarning.length).toEqual(2)
    })

    test('should add tag to correct section when tag selected', async () => {
      const newActiveEntryButton = wrapper.findAll('.add-new-tag-entry-button').at(1)
      await newActiveEntryButton.trigger('click')
      const newTag = 'test-tag'
      const tagAutocompleteInput = wrapper.find('.tag-lists-wrapper').findComponent(TagAutocompleteInput)
      tagAutocompleteInput.vm.$emit('tag-submitted', newTag)
      expect(wrapper.vm.localDoc.active.includes(newTag)).toBeTruthy()
    })

    test('should remove tag from correct section when tag removed', () => {
      const removeActiveEntryButton = wrapper.findAll('.remove-tag-entry-button').at(2)
      removeActiveEntryButton.trigger('click')
      expect(wrapper.vm.localDoc.active).toEqual(['active-tag1'])
    })

    test('should hide tag input when tag selection cancelled', async () => {
      const newActiveEntryButton = wrapper.findAll('.add-new-tag-entry-button').at(1)
      await newActiveEntryButton.trigger('click')
      const tagAutocompleteInput = wrapper.find('.tag-lists-wrapper').findComponent(TagAutocompleteInput)
      tagAutocompleteInput.vm.$emit('keydown', new KeyboardEvent('keydown', {key: 'esc'}))
      await nextTick()
      expect(tagAutocompleteInput.exists()).toBeFalsy()
    })

    test('should display tags invalid message if all tag lists are empty', async () => {
      docs[0]['ignore'] = []
      docs[0]['active'] = []
      docs[0]['report'] = []
      wrapper = shallowMount(ContentFilterEditor, {
        props: {
          selectedDoc: docs[0],
        },
      })
      const invalidMsg = 'Content Filter Profile does not contain any tags, Content Filter Rules will be ineffective.'
      const tagsInvalidElement = wrapper.find('.tags-invalid')
      expect(tagsInvalidElement.exists()).toBeTruthy()
      expect(tagsInvalidElement.html()).toContain(invalidMsg)
    })

    test('should not display tags invalid message if tag list is not empty - ignore', async () => {
      docs[0]['ignore'] = ['test']
      delete docs[0]['active']
      delete docs[0]['report']
      wrapper = shallowMount(ContentFilterEditor, {
        props: {
          selectedDoc: docs[0],
        },
      })
      const tagsInvalidElement = wrapper.find('.tags-invalid')
      expect(tagsInvalidElement.exists()).toBeFalsy()
    })

    test('should not display tags invalid message if tag list is not empty - active', async () => {
      delete docs[0]['ignore']
      docs[0]['active'] = ['test']
      delete docs[0]['report']
      wrapper = shallowMount(ContentFilterEditor, {
        props: {
          selectedDoc: docs[0],
        },
      })
      const tagsInvalidElement = wrapper.find('.tags-invalid')
      expect(tagsInvalidElement.exists()).toBeFalsy()
    })

    test('should not display tags invalid message if tag list is not empty - report', async () => {
      delete docs[0]['ignore']
      delete docs[0]['active']
      docs[0]['report'] = ['test']
      wrapper = shallowMount(ContentFilterEditor, {
        props: {
          selectedDoc: docs[0],
        },
      })
      const tagsInvalidElement = wrapper.find('.tags-invalid')
      expect(tagsInvalidElement.exists()).toBeFalsy()
    })
  })

  describe('content types', () => {
    test('should have correct content type booleans in checkbox inputs', () => {
      const jsonInput = wrapper.find('.content-type-json-input').element as HTMLInputElement
      expect(jsonInput.checked).toEqual(docs[0].content_type.includes('json'))
      const multipartFormInput = wrapper.find('.content-type-multipart_form-input').element as HTMLInputElement
      expect(multipartFormInput.checked).toEqual(docs[0].content_type.includes('multipart_form'))
      const urlEncodedInput = wrapper.find('.content-type-url_encoded-input').element as HTMLInputElement
      expect(urlEncodedInput.checked).toEqual(docs[0].content_type.includes('url_encoded'))
      const xmlInput = wrapper.find('.content-type-xml-input').element as HTMLInputElement
      expect(xmlInput.checked).toEqual(docs[0].content_type.includes('xml'))
    })

    test('should have all inactive content type booleans in checkbox inputs if property does not exist', () => {
      delete docs[0]['content_type']
      wrapper = shallowMount(ContentFilterEditor, {
        props: {
          selectedDoc: docs[0],
        },
      })
      const jsonInput = wrapper.find('.content-type-json-input').element as HTMLInputElement
      expect(jsonInput.checked).toEqual(false)
      const multipartFormInput = wrapper.find('.content-type-multipart_form-input').element as HTMLInputElement
      expect(multipartFormInput.checked).toEqual(false)
      const urlEncodedInput = wrapper.find('.content-type-url_encoded-input').element as HTMLInputElement
      expect(urlEncodedInput.checked).toEqual(false)
      const xmlInput = wrapper.find('.content-type-xml-input').element as HTMLInputElement
      expect(xmlInput.checked).toEqual(false)
    })

    test('should emit new content type when one changed to true', async () => {
      const xmlInput = wrapper.find('.content-type-xml-input')
      xmlInput.setValue(true)
      await xmlInput.trigger('change')
      expect(wrapper.emitted('update:selectedDoc')).toBeTruthy()
      expect(wrapper.emitted('update:selectedDoc')[0][0].content_type).toContain('xml')
    })

    test('should emit new content type when one changed to false', async () => {
      const jsonInput = wrapper.find('.content-type-json-input')
      jsonInput.setValue(false)
      await jsonInput.trigger('change')
      expect(wrapper.emitted('update:selectedDoc')).toBeTruthy()
      expect(wrapper.emitted('update:selectedDoc')[0][0].content_type).not.toContain('json')
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
      wrapper = shallowMount(ContentFilterEditor, {
        props: {
          selectedDoc: docs[0],
        },
      })
      const tagAutocompleteInput = wrapper.findComponent(TagAutocompleteInput)
      expect(tagAutocompleteInput.props('initialTag')).toEqual('')
    })

    test('should set tags input to be an empty string if document tags is empty', () => {
      docs[0].tags = []
      wrapper = shallowMount(ContentFilterEditor, {
        props: {
          selectedDoc: docs[0],
        },
      })
      const tagAutocompleteInput = wrapper.findComponent(TagAutocompleteInput)
      expect(tagAutocompleteInput.props('initialTag')).toEqual('')
    })
  })

  describe('normalize doc data', () => {
    describe('sections - with missing sections', () => {
      let docsForNormalization: ContentFilterProfile[]
      let defaultSectionsValue: ContentFilterProfileSection
      beforeEach(async () => {
        // TS ignore because we want to test the status of normalization where some of the data is missing
        // @ts-ignore
        docsForNormalization = [{
          'id': '__default__',
          'name': 'default contentfilter',
          'ignore_alphanum': true,
          'decoding': {
            base64: true,
            dual: false,
            html: false,
            unicode: false,
          },
          'masking_seed': '',
          'content_type': [],
          'active': [],
          'report': [],
          'ignore': [],
        }]
        defaultSectionsValue = {
          names: [] as ContentFilterEntryMatch[],
          regex: [] as ContentFilterEntryMatch[],
          max_count: 0,
          max_length: 0,
        }
        wrapper = shallowMount(ContentFilterEditor, {
          props: {
            selectedDoc: docsForNormalization[0],
            selectedBranch: 'master',
          },
        })
      })

      test('should emit default section for args when given profile with undefined args', () => {
        expect(wrapper.emitted('update:selectedDoc')).toBeTruthy()
        expect(wrapper.emitted('update:selectedDoc')[0][0].args).toEqual(defaultSectionsValue)
      })

      test('should emit default section for headers when given profile with undefined headers', () => {
        expect(wrapper.emitted('update:selectedDoc')).toBeTruthy()
        expect(wrapper.emitted('update:selectedDoc')[0][0].headers).toEqual(defaultSectionsValue)
      })

      test('should emit default section for cookies when given profile with undefined cookies', () => {
        expect(wrapper.emitted('update:selectedDoc')).toBeTruthy()
        expect(wrapper.emitted('update:selectedDoc')[0][0].cookies).toEqual(defaultSectionsValue)
      })

      test('should emit default section for path when given profile with undefined path', () => {
        expect(wrapper.emitted('update:selectedDoc')).toBeTruthy()
        expect(wrapper.emitted('update:selectedDoc')[0][0].path).toEqual(defaultSectionsValue)
      })
    })

    describe('sections - with all sections provided', () => {
      test('should not emit new doc if all sections are provided', async () => {
        const docsShouldNotNormalize: ContentFilterProfile[] = [{
          'id': '__default__',
          'name': 'default contentfilter',
          'ignore_alphanum': true,
          'headers': {
            'names': [],
            'regex': [],
            'max_count': 42,
            'max_length': 1024,
          },
          'cookies': {
            'names': [],
            'regex': [],
            'max_count': 42,
            'max_length': 1024,
          },
          'args': {
            'names': [],
            'regex': [],
            'max_count': 512,
            'max_length': 1024,
          },
          'path': {
            'names': [],
            'regex': [],
            'max_count': 42,
            'max_length': 1024,
          },
          'decoding': {
            base64: true,
            dual: false,
            html: false,
            unicode: false,
          },
          'masking_seed': '',
          'content_type': [],
          'active': [],
          'report': [],
          'ignore': [],
        }]
        wrapper = shallowMount(ContentFilterEditor, {
          props: {
            selectedDoc: docsShouldNotNormalize[0],
            selectedBranch: 'master',
          },
        })
        expect(wrapper.emitted('update:selectedDoc')).toBeFalsy()
      })
    })

    describe('decoding', () => {
      let docsForNormalization: ContentFilterProfile[]
      let defaultContentFilterProfileDecoding: ContentFilterProfile['decoding']
      beforeEach(async () => {
        // TS ignore because we want to test the status of normalization where some of the data is missing
        // @ts-ignore
        docsForNormalization = [{
          'id': '__default__',
          'name': 'default contentfilter',
          'ignore_alphanum': true,
          'headers': {
            'names': [],
            'regex': [],
            'max_count': 42,
            'max_length': 1024,
          },
          'cookies': {
            'names': [],
            'regex': [],
            'max_count': 42,
            'max_length': 1024,
          },
          'args': {
            'names': [],
            'regex': [],
            'max_count': 512,
            'max_length': 1024,
          },
          'path': {
            'names': [],
            'regex': [],
            'max_count': 42,
            'max_length': 1024,
          },
          'masking_seed': '',
          'content_type': [],
          'active': [],
          'report': [],
          'ignore': [],
        }]
        defaultContentFilterProfileDecoding = {
          base64: true,
          dual: false,
          html: false,
          unicode: false,
        }
        wrapper = shallowMount(ContentFilterEditor, {
          props: {
            selectedDoc: docsForNormalization[0],
            selectedBranch: 'master',
          },
        })
      })

      test('should emit default decoding when given profile with undefined decoding', () => {
        expect(wrapper.emitted('update:selectedDoc')).toBeTruthy()
        expect(wrapper.emitted('update:selectedDoc')[0][0].decoding).toEqual(defaultContentFilterProfileDecoding)
      })
    })
  })

  test('should unpack exclusions correctly from model to view', async () => {
    const unpackedExclusions = 'cf-rule-id:100000 cf-risk:5'
    const packedExclusions = ['cf-rule-id:100000', 'cf-risk:5']
    const actualUnpackedExclusions = wrapper.vm.exclusionsToString(packedExclusions)
    expect(actualUnpackedExclusions).toEqual(unpackedExclusions)
  })

  test('should unpack empty exclusions correctly from model to view', async () => {
    const unpackedExclusions = ''
    const packedExclusions: ContentFilterEntryMatch['exclusions'] = []
    const actualUnpackedExclusions = wrapper.vm.exclusionsToString(packedExclusions)
    expect(actualUnpackedExclusions).toEqual(unpackedExclusions)
  })

  buildTabDescribe('headers')
  buildTabDescribe('cookies')
  buildTabDescribe('args')

  function buildTabDescribe(tab: ArgsCookiesHeadersType) {
    describe(`tab ${tab}`, () => {
      beforeEach(() => {
        // select tab
        const tabElement = wrapper.find(`.${tab}-tab`)
        const anchorElement = tabElement.find('a')
        anchorElement.trigger('click')
        wrapper.vm.$forceUpdate()
      })

      test('should have correct tab active', async () => {
        const tabElement = wrapper.find(`.${tab}-tab`)
        expect(tabElement.element.classList).toContain('is-active')
      })

      test('should open new parameter row when button is clicked', async () => {
        const button = wrapper.find('.new-parameter-button')
        await button.trigger('click')
        const newRow = wrapper.find('.new-parameter-row')
        expect(newRow.exists()).toBeTruthy()
      })

      buildNamesRegexDescribe('names', 0)
      buildNamesRegexDescribe('regex', 1)

      function buildNamesRegexDescribe(type: NamesRegexType, typeIndex: number) {
        describe(`type ${type}`, () => {
          let newRow: any

          beforeEach(async () => {
            const button = wrapper.find('.new-parameter-button')
            await button.trigger('click')
            newRow = wrapper.find('.new-parameter-row')
            const typeSelection = newRow.find('.new-entry-type')
            const options = typeSelection.findAll('option')
            typeSelection.setValue(options.at(typeIndex).element.value)
          })

          test('should add name key when creating new parameter', async () => {
            const wantedValue = 'foo'
            const keyInput = newRow.find('.new-entry-key')
            await keyInput.setValue(wantedValue)
            const regInput = newRow.find('.new-entry-reg')
            await regInput.setValue('bar')
            const confirmButton = newRow.find('.confirm-add-new-parameter')
            await confirmButton.trigger('click')
            const actualValue = (wrapper.find('.entry-key').element as HTMLInputElement).value
            expect(actualValue).toEqual(wantedValue)
          })

          test('should add value when creating new parameter', async () => {
            const wantedValue = 'bar'
            const keyInput = newRow.find('.new-entry-key')
            await keyInput.setValue('foo')
            const regInput = newRow.find('.new-entry-reg')
            await regInput.setValue(wantedValue)
            const confirmButton = newRow.find('.confirm-add-new-parameter')
            await confirmButton.trigger('click')
            const actualValue = (wrapper.find('.entry-reg').element as HTMLInputElement).value
            expect(actualValue).toEqual(wantedValue)
          })

          test('should add restrict when creating new parameter', async () => {
            const keyInput = newRow.find('.new-entry-key')
            await keyInput.setValue('foo')
            const regInput = newRow.find('.new-entry-reg')
            await regInput.setValue('bar')
            const input = newRow.find('.new-entry-restrict')
            await input.setValue(true)
            const confirmButton = newRow.find('.confirm-add-new-parameter')
            await confirmButton.trigger('click')
            const actualValue = (wrapper.find('.entry-restrict').element as HTMLInputElement).checked
            expect(actualValue).toEqual(true)
          })

          test('should add mask when creating new parameter', async () => {
            const keyInput = newRow.find('.new-entry-key')
            await keyInput.setValue('foo')
            const regInput = newRow.find('.new-entry-reg')
            await regInput.setValue('bar')
            const input = newRow.find('.new-entry-mask')
            await input.setValue(true)
            const confirmButton = newRow.find('.confirm-add-new-parameter')
            await confirmButton.trigger('click')
            const actualValue = (wrapper.find('.entry-mask').element as HTMLInputElement).checked
            expect(actualValue).toEqual(true)
          })

          test('should add exclusions when creating new parameter', async () => {
            const keyInput = newRow.find('.new-entry-key')
            await keyInput.setValue('foo')
            const regInput = newRow.find('.new-entry-reg')
            await regInput.setValue('bar')
            const wantedValue = ['cf-rule-id:100001', 'cf-risk:3']
            const autocompleteInput = wrapper.findComponent(AutocompleteInput)
            await autocompleteInput.vm.$emit('value-submitted', 'cf-rule-id:100001 cf-risk:3')
            const confirmButton = newRow.find('.confirm-add-new-parameter')
            await confirmButton.trigger('click')
            const actualValue = wrapper.vm.localDoc[tab][type][0].exclusions
            expect(actualValue).toEqual(wantedValue)
          })

          test('should add empty exclusions when creating new parameter', async () => {
            const keyInput = newRow.find('.new-entry-key')
            await keyInput.setValue('foo')
            const regInput = newRow.find('.new-entry-reg')
            await regInput.setValue('bar')
            const wantedValue = []
            const autocompleteInput = wrapper.findComponent(AutocompleteInput)
            await autocompleteInput.vm.$emit('value-submitted', '')
            const confirmButton = newRow.find('.confirm-add-new-parameter')
            await confirmButton.trigger('click')
            const actualValue = wrapper.vm.localDoc[tab][type][0].exclusions
            expect(actualValue).toEqual(wantedValue)
          })

          test('should remove parameter when remove button is clicked', async () => {
            const keyInput = newRow.find('.new-entry-key')
            await keyInput.setValue('foo')
            const regInput = newRow.find('.new-entry-reg')
            await regInput.setValue('bar')
            const confirmButton = newRow.find('.confirm-add-new-parameter')
            await confirmButton.trigger('click')
            const removeButton = wrapper.find('.remove-entry-button')
            await removeButton.trigger('click')
            wrapper.vm.$forceUpdate()
            const rows = wrapper.findAll('.entry-row')
            expect(rows.length).toEqual(0)
          })

          test('should reset data when cancel button is clicked', async () => {
            const cancelButton = wrapper.find('.cancel-new-parameter')
            await cancelButton.trigger('click')
            const {defaultNewEntry, newContentFilterLine, newEntry} = wrapper.vm
            expect(newContentFilterLine).toBeFalsy()
            expect(newEntry).toEqual(defaultNewEntry)
          })
        })
      }
    })
  }
})
