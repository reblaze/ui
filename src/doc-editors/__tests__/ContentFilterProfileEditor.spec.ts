import ContentFilterEditor from '@/doc-editors/ContentFilterProfileEditor.vue'
import {beforeEach, describe, expect, jest, test} from '@jest/globals'
import {shallowMount} from '@vue/test-utils'
import Vue from 'vue'
import {
  ArgsCookiesHeadersType,
  ContentFilterEntryMatch,
  ContentFilterProfile,
  ContentFilterProfileSection,
  ContentFilterRule,
  ContentFilterRuleGroup,
  NamesRegexType,
} from '@/types'
import AutocompleteInput from '@/components/AutocompleteInput.vue'
// @ts-ignore
import _ from 'lodash'
import axios from 'axios'

jest.mock('axios')

describe('ContentFilterProfileEditor.vue', () => {
  let docs: ContentFilterProfile[]
  let wrapper: any
  let contentFilterRulesDocs: ContentFilterRule[]
  let contentFilterGroupsDocs: ContentFilterRuleGroup[]
  beforeEach(async () => {
    docs = [{
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
    contentFilterGroupsDocs = [
      {
        id: '1000',
        name: '1000',
        description: '',
        content_filter_rule_ids: ['100000', '100001'],
      },
      {
        id: '1001',
        name: '1001',
        description: '',
        content_filter_rule_ids: [],
      },
    ]
    jest.spyOn(axios, 'get').mockImplementation((path, config) => {
      if (!wrapper) {
        return Promise.resolve({data: []})
      }
      const branch = (wrapper.vm as any).selectedBranch
      if (path === `/conf/api/v2/configs/${branch}/d/contentfilterrules/`) {
        if (config && config.headers && config.headers['x-fields'] === 'id, name') {
          return Promise.resolve({data: _.map(contentFilterRulesDocs, (i: any) => _.pick(i, 'id', 'name'))})
        }
        return Promise.resolve({data: contentFilterRulesDocs})
      } else if (path === `/conf/api/v2/configs/${branch}/d/contentfiltergroups/`) {
        if (config?.headers?.['x-fields'] === 'id, name') {
          return Promise.resolve({data: _.map(contentFilterGroupsDocs, (i: any) => _.pick(i, 'id', 'name'))})
        }
        return Promise.resolve({data: contentFilterGroupsDocs})
      }
      return Promise.resolve({data: []})
    })
    const onUpdate = (doc: ContentFilterProfile) => {
      wrapper.setProps({selectedDoc: doc})
    }
    wrapper = shallowMount(ContentFilterEditor, {
      props: {
        selectedDoc: docs[0],
        selectedBranch: 'master',
      },
      listeners: {
        'update:selectedDoc': onUpdate,
      },
    })
    await Vue.nextTick()
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

  describe('normalize sections', () => {
    describe('with missing sections', () => {
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
        await Vue.nextTick()
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

    describe('with all sections provided', () => {
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
        await Vue.nextTick()
        expect(wrapper.emitted('update:selectedDoc')).toBeFalsy()
      })
    })
  })

  test('should unpack exclusions correctly from model for view', async () => {
    const unpackedExclusions = 'cf-rule-id:100000 cf-risk:5'
    const packedExclusions = ['cf-rule-id:100000', 'cf-risk:5']
    const actualUnpackedExclusions = (wrapper.vm as any).exclusionsToString(packedExclusions)
    expect(actualUnpackedExclusions).toEqual(unpackedExclusions)
  })

  test('should unpack empty exclusions correctly from model for view', async () => {
    const unpackedExclusions = ''
    const packedExclusions: ContentFilterEntryMatch['exclusions'] = []
    const actualUnpackedExclusions = (wrapper.vm as any).exclusionsToString(packedExclusions)
    expect(actualUnpackedExclusions).toEqual(unpackedExclusions)
  })

  buildTabDescribe('headers')
  buildTabDescribe('cookies')
  buildTabDescribe('args')

  function buildTabDescribe(tab: ArgsCookiesHeadersType) {
    describe(`tab ${tab}`, () => {
      beforeEach(async () => {
        // select tab
        const tabElement = wrapper.find(`.${tab}-tab`)
        const anchorElement = tabElement.find('a')
        anchorElement.trigger('click')
        await wrapper.vm.$forceUpdate()
        await Vue.nextTick()
      })

      test('should have correct tab active', async () => {
        const tabElement = wrapper.find(`.${tab}-tab`)
        expect(tabElement.element.classList).toContain('is-active')
      })

      test('should open new parameter row when button is clicked', async () => {
        const button = wrapper.find('.new-parameter-button')
        button.trigger('click')
        await Vue.nextTick()
        const newRow = wrapper.find('.new-parameter-row')
        expect(newRow.element).toBeDefined()
      })

      buildNamesRegexDescribe('names', 0)
      buildNamesRegexDescribe('regex', 1)

      function buildNamesRegexDescribe(type: NamesRegexType, typeIndex: number) {
        describe(`type ${type}`, () => {
          let newRow: any

          beforeEach(async () => {
            const button = wrapper.find('.new-parameter-button')
            button.trigger('click')
            await Vue.nextTick()
            newRow = wrapper.find('.new-parameter-row')
            const typeSelection = newRow.find('.new-entry-type')
            const options = typeSelection.findAll('option')
            options.at(typeIndex).setSelected()
            await Vue.nextTick()
          })

          test('should add name key when creating new parameter', async () => {
            const wantedValue = 'foo'
            const keyInput = newRow.find('.new-entry-key')
            keyInput.setValue(wantedValue)
            await Vue.nextTick()
            const regInput = newRow.find('.new-entry-reg')
            regInput.setValue('bar')
            await Vue.nextTick()
            const confirmButton = newRow.find('.confirm-add-new-parameter')
            confirmButton.trigger('click')
            await Vue.nextTick()
            const actualValue = (wrapper.find('.entry-key').element as HTMLInputElement).value
            expect(actualValue).toEqual(wantedValue)
          })

          test('should add value when creating new parameter', async () => {
            const wantedValue = 'bar'
            const keyInput = newRow.find('.new-entry-key')
            keyInput.setValue('foo')
            await Vue.nextTick()
            const regInput = newRow.find('.new-entry-reg')
            regInput.setValue(wantedValue)
            await Vue.nextTick()
            const confirmButton = newRow.find('.confirm-add-new-parameter')
            confirmButton.trigger('click')
            await Vue.nextTick()
            const actualValue = (wrapper.find('.entry-reg').element as HTMLInputElement).value
            expect(actualValue).toEqual(wantedValue)
          })

          test('should add restrict when creating new parameter', async () => {
            const keyInput = newRow.find('.new-entry-key')
            keyInput.setValue('foo')
            await Vue.nextTick()
            const regInput = newRow.find('.new-entry-reg')
            regInput.setValue('bar')
            await Vue.nextTick()
            const input = newRow.find('.new-entry-restrict')
            input.setChecked(true)
            await Vue.nextTick()
            const confirmButton = newRow.find('.confirm-add-new-parameter')
            confirmButton.trigger('click')
            await Vue.nextTick()
            const actualValue = (wrapper.find('.entry-restrict').element as HTMLInputElement).checked
            expect(actualValue).toEqual(true)
          })

          test('should add mask when creating new parameter', async () => {
            const keyInput = newRow.find('.new-entry-key')
            keyInput.setValue('foo')
            await Vue.nextTick()
            const regInput = newRow.find('.new-entry-reg')
            regInput.setValue('bar')
            await Vue.nextTick()
            const input = newRow.find('.new-entry-mask')
            input.setChecked(true)
            await Vue.nextTick()
            const confirmButton = newRow.find('.confirm-add-new-parameter')
            confirmButton.trigger('click')
            await Vue.nextTick()
            const actualValue = (wrapper.find('.entry-mask').element as HTMLInputElement).checked
            expect(actualValue).toEqual(true)
          })

          test('should add exclusions when creating new parameter', async () => {
            const keyInput = newRow.find('.new-entry-key')
            keyInput.setValue('foo')
            await Vue.nextTick()
            const regInput = newRow.find('.new-entry-reg')
            regInput.setValue('bar')
            await Vue.nextTick()
            const wantedValue = ['cf-rule-id:100001', 'cf-risk:3']
            const autocompleteInput = wrapper.findComponent(AutocompleteInput)
            autocompleteInput.vm.$emit('value-submitted', 'cf-rule-id:100001 cf-risk:3')
            await Vue.nextTick()
            const confirmButton = newRow.find('.confirm-add-new-parameter')
            confirmButton.trigger('click')
            await Vue.nextTick()
            const actualValue = (wrapper.vm as any).localDoc[tab][type][0].exclusions
            expect(actualValue).toEqual(wantedValue)
          })

          test('should remove parameter when remove button is clicked', async () => {
            const keyInput = newRow.find('.new-entry-key')
            keyInput.setValue('foo')
            await Vue.nextTick()
            const regInput = newRow.find('.new-entry-reg')
            regInput.setValue('bar')
            await Vue.nextTick()
            const confirmButton = newRow.find('.confirm-add-new-parameter')
            confirmButton.trigger('click')
            await Vue.nextTick()
            const removeButton = wrapper.find('.remove-entry-button')
            removeButton.trigger('click')
            await Vue.nextTick()
            await wrapper.vm.$forceUpdate()
            const rows = wrapper.findAll('.entry-row')
            expect(rows.length).toEqual(0)
          })

          test('should reset data when cancel button is clicked', async () => {
            const cancelButton = wrapper.find('.cancel-new-parameter')
            cancelButton.trigger('click')
            await Vue.nextTick()
            const {defaultNewEntry, newContentFilterLine, newEntry} = wrapper.vm as any
            expect(newContentFilterLine).toBeFalsy()
            expect(newEntry).toEqual(defaultNewEntry)
          })
        })
      }
    })
  }
})
