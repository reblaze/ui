// @ts-nocheck
import GlobalFilterListEditor from '../GlobalFiltersEditor.vue'
import {beforeEach, describe, expect, jest, test} from '@jest/globals'
import {mount, shallowMount, VueWrapper} from '@vue/test-utils'
import {CustomResponse, GlobalFilter, GlobalFilterRuleEntry} from '@/types'
import TagAutocompleteInput from '@/components/TagAutocompleteInput.vue'
import EntriesRelationList from '@/components/EntriesRelationList.vue'
import axios from 'axios'
import {nextTick} from 'vue'

jest.mock('axios')

describe('GlobalFiltersEditor.vue', () => {
  let docs: GlobalFilter[]
  let customResponsesDocs: CustomResponse[]
  let wrapper: VueWrapper
  beforeEach(() => {
    docs = [
      {
        'id': 'xlbp148c',
        'name': 'API Discovery',
        'source': 'self-managed',
        'mdate': '2020-05-23T00:04:41',
        'description': 'Tag API Requests',
        'active': true,
        'tags': ['api', 'okay'],
        'action': 'monitor',
        'rule': {
          'relation': 'OR',
          'entries': [
            {'relation': 'OR', 'entries': [['ip', '1.1.1.1', null]]},
            {'relation': 'OR', 'entries': [['ip', '2.2.2.2', null]]},
            {'relation': 'OR', 'entries': [['headers', ['headerrr', 'valueeee'], 'anooo']]},
          ],
        },
      },
      {
        'id': '07656fbe',
        'name': 'devop internal demo',
        'source': 'self-managed',
        'mdate': '2020-05-23T00:04:41',
        'description': 'this is my own list',
        'active': false,
        'tags': ['internal', 'devops'],
        'action': 'monitor',
        'rule': {
          'relation': 'OR',
          'entries': [
            {
              'relation': 'OR',
              'entries': [
                ['ip', '1.1.1.1', null],
              ],
            },
            {
              'relation': 'OR',
              'entries': [
                ['ip', '2.2.2.2', null],
              ],
            },
            {
              'relation': 'OR',
              'entries': [
                ['headers', ['headerrr', 'valueeee'], 'anooo'],
              ],
            }],
        },
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
    const selectedBranch = 'prod'
    jest.spyOn(axios, 'get').mockImplementation((path) => {
      if (path === `/conf/api/v3/configs/${selectedBranch}/d/actions/`) {
        return Promise.resolve({data: customResponsesDocs})
      }
      return Promise.resolve({data: {}})
    })
    wrapper = shallowMount(GlobalFilterListEditor, {
      props: {
        selectedDoc: docs[0],
        selectedBranch: selectedBranch,
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

    test('should have correct entries relation mode selected', () => {
      const container = wrapper.find('.document-entries-relation')
      // AND - span at 0
      // OR - span at 1
      const element = container.findAll('span').at(1).element as HTMLElement
      expect(element.classList).toContain('is-selected')
    })

    test('should have tags input component with correct data', () => {
      const tagAutocompleteInputComponent = wrapper.findComponent(TagAutocompleteInput)
      expect(tagAutocompleteInputComponent.props('initialTag')).toEqual(docs[0].tags.join(' '))
    })

    test('should have correct source in input', () => {
      const element = wrapper.find('.document-source').element as HTMLInputElement
      expect(element.value).toEqual(docs[0].source)
    })

    test('should have response action selection with correct data', () => {
      const wantedCustomResponse = docs[0].action.toString()
      const actionSelection = wrapper.find('.document-action-selection')
      const selectedCustomResponse = (actionSelection.find('option:checked').element as HTMLOptionElement).value
      expect(selectedCustomResponse).toEqual(wantedCustomResponse)
    })

    test('should have correct description in input', () => {
      const element = wrapper.find('.document-description').element as HTMLTextAreaElement
      expect(element.value).toEqual(docs[0].description.toString())
    })

    test('should have entries relation component with correct data', () => {
      const entriesRelationListComponent = wrapper.findComponent(EntriesRelationList)
      expect(entriesRelationListComponent.props('rule')).toEqual(docs[0].rule)
    })

    describe('sections entries display', () => {
      test('should display correct zero amount of sections', () => {
        docs[0].rule.entries = []
        wrapper = shallowMount(GlobalFilterListEditor, {
          props: {
            selectedDoc: docs[0],
          },
        })
        const display = wrapper.find('.entries-entries-display')
        expect(display.text()).toContain('0 sections')
      })

      test('should display correct zero amount of entries - not an array', () => {
        docs[0].rule.entries = [
          {'relation': 'OR', 'entries': null},
        ]
        wrapper = shallowMount(GlobalFilterListEditor, {
          props: {
            selectedDoc: docs[0],
          },
        })
        const display = wrapper.find('.entries-entries-display')
        expect(display.text()).toContain('0 entries')
      })

      test('should display correct zero amount of entries - length zero', () => {
        docs[0].rule.entries = [
          {'relation': 'OR', 'entries': []},
        ]
        wrapper = shallowMount(GlobalFilterListEditor, {
          props: {
            selectedDoc: docs[0],
          },
        })
        const display = wrapper.find('.entries-entries-display')
        expect(display.text()).toContain('0 entries')
      })

      test('should display correct singular amount of sections', () => {
        docs[0].rule.entries = [
          {'relation': 'OR', 'entries': [['ip', '1.1.1.1', null]]},
        ]
        wrapper = shallowMount(GlobalFilterListEditor, {
          props: {
            selectedDoc: docs[0],
          },
        })
        const display = wrapper.find('.entries-entries-display')
        expect(display.text()).toContain('1 section')
      })

      test('should display correct singular amount of entries', () => {
        docs[0].rule.entries = [
          {'relation': 'OR', 'entries': [['ip', '1.1.1.1', null]]},
        ]
        wrapper = shallowMount(GlobalFilterListEditor, {
          props: {
            selectedDoc: docs[0],
          },
        })
        const display = wrapper.find('.entries-entries-display')
        expect(display.text()).toContain('1 entry')
      })

      test('should display correct plural amount of sections', () => {
        const display = wrapper.find('.entries-entries-display')
        expect(display.text()).toContain('3 sections')
      })

      test('should display correct plural amount of entries', () => {
        const display = wrapper.find('.entries-entries-display')
        expect(display.text()).toContain('3 entries')
      })
    })
  })

  describe('form data when non editable', () => {
    // non editable if source is not 'self-managed'
    beforeEach(() => {
      docs[0].source = 'https://example.com'
      wrapper = shallowMount(GlobalFilterListEditor, {
        props: {
          selectedDoc: docs[0],
        },
      })
    })

    test('should hide sections relation mode', () => {
      const container = wrapper.find('.document-entries-relation')
      expect(container.exists()).toBeFalsy()
    })

    test('should hide remove all sections button', () => {
      const button = wrapper.find('.remove-all-entries-button')
      expect(button.exists()).toBeFalsy()
    })

    test('should display update now button', () => {
      const button = wrapper.find('.update-now-button')
      expect(button.exists()).toBeTruthy()
    })

    test('should have entries relation component with editable false prop', () => {
      const entriesRelationListComponent = wrapper.findComponent(EntriesRelationList)
      expect(entriesRelationListComponent.props('editable')).toBeFalsy()
    })
  })

  describe('selected doc change', () => {
    let cancelAllEntriesSpy
    beforeEach(() => {
      const basicDocument = {
        'id': '__default__',
        'name': 'default entry',
      }
      wrapper = mount(GlobalFilterListEditor, {
        props: {
          selectedDoc: basicDocument,
        },
      })
      cancelAllEntriesSpy = jest.spyOn(wrapper.vm.$refs.entriesRelationList, 'cancelAllEntries')
    })

    test('should cancel all new entries relation filter if selectedDoc updates - new ID', async () => {
      await wrapper.setProps({selectedDoc: docs[0]})
      expect(cancelAllEntriesSpy).toHaveBeenCalled()
    })

    test('should cancel all new entries relation filter if selectedDoc updates - new empty', async () => {
      await wrapper.setProps({selectedDoc: {}})
      expect(cancelAllEntriesSpy).toHaveBeenCalled()
    })

    test('should cancel all new entries relation filter if selectedDoc updates - old empty', async () => {
      await wrapper.setProps({selectedDoc: {}})
      jest.clearAllMocks()
      await wrapper.setProps({selectedDoc: docs[0]})
      expect(cancelAllEntriesSpy).toHaveBeenCalled()
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
      wrapper = shallowMount(GlobalFilterListEditor, {
        props: {
          selectedDoc: docs[0],
        },
      })
      const tagAutocompleteInput = wrapper.findComponent(TagAutocompleteInput)
      expect(tagAutocompleteInput.props('initialTag')).toEqual('')
    })

    test('should set tags input to be an empty string if document tags is empty', () => {
      docs[0].tags = []
      wrapper = shallowMount(GlobalFilterListEditor, {
        props: {
          selectedDoc: docs[0],
        },
      })
      const tagAutocompleteInput = wrapper.findComponent(TagAutocompleteInput)
      expect(tagAutocompleteInput.props('initialTag')).toEqual('')
    })
  })

  describe('rule relation', () => {
    // AND - span at 0
    // OR - span at 1
    let container: any
    let andElement: any
    let orElement: any
    beforeEach(() => {
      container = wrapper.find('.document-entries-relation')
      andElement = container.findAll('span').at(0)
      orElement = container.findAll('span').at(1)
    })

    test('should correctly switch between rule relations status using space bar keypress', async () => {
      expect(andElement.element.classList).not.toContain('is-selected')
      expect(orElement.element.classList).toContain('is-selected')
      await container.trigger('keypress.space')
      wrapper.vm.$forceUpdate()
      await nextTick()
      expect(andElement.element.classList).toContain('is-selected')
      expect(orElement.element.classList).not.toContain('is-selected')
      await container.trigger('keypress.space')
      wrapper.vm.$forceUpdate()
      await nextTick()
      expect(andElement.element.classList).not.toContain('is-selected')
      expect(orElement.element.classList).toContain('is-selected')
    })

    test('should correctly switch between rule relations status using enter keypress', async () => {
      expect(andElement.element.classList).not.toContain('is-selected')
      expect(orElement.element.classList).toContain('is-selected')
      await container.trigger('keypress.enter')
      wrapper.vm.$forceUpdate()
      await nextTick()
      expect(andElement.element.classList).toContain('is-selected')
      expect(orElement.element.classList).not.toContain('is-selected')
      await container.trigger('keypress.enter')
      wrapper.vm.$forceUpdate()
      await nextTick()
      expect(andElement.element.classList).not.toContain('is-selected')
      expect(orElement.element.classList).toContain('is-selected')
    })

    test('should correctly switch to AND state when span is clicked', async () => {
      expect(andElement.element.classList).not.toContain('is-selected')
      expect(orElement.element.classList).toContain('is-selected')
      await andElement.trigger('click')
      wrapper.vm.$forceUpdate()
      await nextTick()
      expect(andElement.element.classList).toContain('is-selected')
      expect(orElement.element.classList).not.toContain('is-selected')
      await andElement.trigger('click')
      wrapper.vm.$forceUpdate()
      await nextTick()
      expect(andElement.element.classList).toContain('is-selected')
      expect(orElement.element.classList).not.toContain('is-selected')
    })

    test('should correctly switch to OR state when span is clicked', async () => {
      await andElement.trigger('click')
      wrapper.vm.$forceUpdate()
      await nextTick()
      expect(andElement.element.classList).toContain('is-selected')
      expect(orElement.element.classList).not.toContain('is-selected')
      await orElement.trigger('click')
      wrapper.vm.$forceUpdate()
      await nextTick()
      expect(andElement.element.classList).not.toContain('is-selected')
      expect(orElement.element.classList).toContain('is-selected')
      await orElement.trigger('click')
      wrapper.vm.$forceUpdate()
      await nextTick()
      expect(andElement.element.classList).not.toContain('is-selected')
      expect(orElement.element.classList).toContain('is-selected')
    })
  })

  test('should remove all entries relation data from component when clear button is clicked', () => {
    wrapper = mount(GlobalFilterListEditor, {
      props: {
        selectedDoc: docs[0],
      },
    })
    const wantedRule: GlobalFilterRule = {
      relation: docs[0].rule.relation,
      entries: [],
    }
    const button = wrapper.find('.remove-all-entries-button')
    button.trigger('click')
    const entriesRelationListComponent = wrapper.findComponent(EntriesRelationList)
    expect(entriesRelationListComponent.props('rule')).toEqual(wantedRule)
  })

  describe('update now button', () => {
    let resolveData: any
    beforeEach(() => {
      resolveData = {}
      jest.spyOn(axios, 'get').mockImplementation((path) => {
        if (path.includes('/conf/api/v3/tools/fetch')) {
          return Promise.resolve(resolveData)
        }
        return Promise.resolve({data: {}})
      })
      docs[0].source = 'https://example.com'
      wrapper = shallowMount(GlobalFilterListEditor, {
        props: {
          selectedDoc: docs[0],
        },
      })
    })

    test('should update entries relation component with correct data - ipv4 array', async () => {
      const wantedEntries: GlobalFilterRuleEntry[] = [
        [
          'ip',
          '203.208.60.0/24',
          'Crawler',
        ],
        [
          'ip',
          '209.85.238.0/24',
          'Crawler',
        ],
        [
          'ip',
          '66.249.90.0',
          'Crawler',
        ],
      ]
      const wantedData: GlobalFilterRule = {
        relation: 'OR',
        entries: [{
          entries: wantedEntries,
          relation: 'OR',
        }],
      }
      resolveData = {
        data: {
          'type': 'acl',
          'name': 'Crawler example',
          'id': 'example_id',
          'active': true,
          'mdate': '2020-11-04 07:54:27.417791',
          'source': 'https://example.com',
          'description': 'some example crawlers',
          'entries_relation': 'OR',
          'tags': [
            'allowlist',
            'crawler',
          ],
          'entries': wantedEntries,
        },
      }
      const button = wrapper.find('.update-now-button')
      await button.trigger('click')
      wrapper.vm.$forceUpdate()
      await nextTick()
      const entriesRelationListComponent = wrapper.findComponent(EntriesRelationList)
      expect(entriesRelationListComponent.props('rule')).toEqual(wantedData)
    })

    test('should update entries relation component with correct data - ipv6 array', async () => {
      const wantedEntries: GlobalFilterRuleEntry[] = [
        [
          'ip',
          '2603:8080:3d40:f7:d45b:477e:579e:245',
          'Crawler',
        ],
        [
          'ip',
          '2a01:4f8:150:8147::2',
          'Crawler',
        ],
        [
          'ip',
          '2001:16b8:a08a:cb00:a5ce:3228:fbdc:23ad',
          'Crawler',
        ],
      ]
      const wantedData: GlobalFilterRule = {
        relation: 'OR',
        entries: [{
          entries: wantedEntries,
          relation: 'OR',
        }],
      }
      resolveData = {
        data: {
          'type': 'acl',
          'name': 'Crawler example',
          'id': 'example_id',
          'active': true,
          'mdate': '2020-11-04 07:54:27.417791',
          'source': 'https://example.com',
          'description': 'some example crawlers',
          'entries_relation': 'OR',
          'tags': [
            'allowlist',
            'crawler',
          ],
          'entries': wantedEntries,
        },
      }
      const button = wrapper.find('.update-now-button')
      await button.trigger('click')
      wrapper.vm.$forceUpdate()
      await nextTick()
      const entriesRelationListComponent = wrapper.findComponent(EntriesRelationList)
      expect(entriesRelationListComponent.props('rule')).toEqual(wantedData)
    })

    test('should update entries relation component with correct data - asn array', async () => {
      const wantedEntries: GlobalFilterRuleEntry[] = [
        [
          'asn',
          'as34109',
          'spam',
        ],
        [
          'asn',
          'as3396',
          'spam',
        ],
        [
          'asn',
          'as3502',
          'spam',
        ],
      ]
      const wantedData: GlobalFilterRule = {
        relation: 'OR',
        entries: [{
          entries: wantedEntries,
          relation: 'OR',
        }],
      }
      resolveData = {
        data: {
          'type': 'acl',
          'name': 'ASN example',
          'id': 'example_id',
          'active': true,
          'mdate': '2020-11-04 07:54:27.417791',
          'source': 'https://example.com',
          'description': 'some example ASNs',
          'entries_relation': 'OR',
          'tags': [
            'blocklist',
            'ASN',
          ],
          'entries': wantedEntries,
        },
      }
      const button = wrapper.find('.update-now-button')
      await button.trigger('click')
      wrapper.vm.$forceUpdate()
      await nextTick()
      const entriesRelationListComponent = wrapper.findComponent(EntriesRelationList)
      expect(entriesRelationListComponent.props('rule')).toEqual(wantedData)
    })

    test('should update entries relation component with correct data - ip singles', async () => {
      const wantedEntries: GlobalFilterRuleEntry[] = [
        [
          'ip',
          '203.208.60.0/24',
          null,
        ],
        [
          'ip',
          '209.85.238.0/24',
          null,
        ],
        [
          'ip',
          '66.249.90.0/24',
          null,
        ],
      ]
      const wantedData: GlobalFilterRule = {
        relation: 'OR',
        entries: [{
          entries: wantedEntries,
          relation: 'OR',
        }],
      }
      resolveData = {
        data: {
          'foo': 'bar',
          'data1': wantedEntries[0][1],
          'data2': wantedEntries[1][1],
          'data3': wantedEntries[2][1],
        },
      }
      const button = wrapper.find('.update-now-button')
      await button.trigger('click')
      wrapper.vm.$forceUpdate()
      await nextTick()
      const entriesRelationListComponent = wrapper.findComponent(EntriesRelationList)
      expect(entriesRelationListComponent.props('rule')).toEqual(wantedData)
    })

    test('should update entries relation component with correct data - asn singles', async () => {
      const wantedEntries: GlobalFilterRuleEntry[] = [
        [
          'asn',
          'as34109',
          null,
        ],
        [
          'asn',
          'as3396',
          null,
        ],
        [
          'asn',
          'as3502',
          null,
        ],
      ]
      const wantedData: GlobalFilterRule = {
        relation: 'OR',
        entries: [{
          entries: wantedEntries,
          relation: 'OR',
        }],
      }
      resolveData = {
        data: {
          'foo': 'bar',
          'data1': wantedEntries[0][1],
          'data2': wantedEntries[1][1],
          'data3': wantedEntries[2][1],
        },
      }
      const button = wrapper.find('.update-now-button')
      await button.trigger('click')
      wrapper.vm.$forceUpdate()
      await nextTick()
      const entriesRelationListComponent = wrapper.findComponent(EntriesRelationList)
      expect(entriesRelationListComponent.props('rule')).toEqual(wantedData)
    })

    test('should update entries relation component with correct data - ip inside object', async () => {
      const wantedEntries: GlobalFilterRuleEntry[] = [
        [
          'ip',
          '203.208.60.0/24',
          null,
        ],
        [
          'ip',
          '209.85.238.0/24',
          'Crawler',
        ],
        [
          'ip',
          '66.249.90.0/24',
          'Crawler',
        ],
      ]
      const wantedData: GlobalFilterRule = {
        relation: 'OR',
        entries: [{
          entries: wantedEntries,
          relation: 'OR',
        }],
      }
      resolveData = {
        data: {
          'type': 'acl',
          'name': 'Crawler example',
          'id': 'example_id',
          'active': true,
          'mdate': '2020-11-04 07:54:27.417791',
          'source': 'https://example.com',
          'description': 'some example crawlers',
          'entries_relation': 'OR',
          'tags': [
            'allowlist',
            'crawler',
          ],
          'entries': {
            '1': [wantedEntries[0], wantedEntries[1]],
            '2': wantedEntries[2],
          },
        },
      }
      const button = wrapper.find('.update-now-button')
      await button.trigger('click')
      wrapper.vm.$forceUpdate()
      await nextTick()
      const entriesRelationListComponent = wrapper.findComponent(EntriesRelationList)
      expect(entriesRelationListComponent.props('rule')).toEqual(wantedData)
    })

    test('should update entries relation component with correct data - asn inside object', async () => {
      const wantedEntries: GlobalFilterRuleEntry[] = [
        [
          'asn',
          'as34109',
          null,
        ],
        [
          'asn',
          'as3396',
          'spam',
        ],
        [
          'asn',
          'as3502',
          'spam',
        ],
      ]
      const wantedData: GlobalFilterRule = {
        relation: 'OR',
        entries: [{
          entries: wantedEntries,
          relation: 'OR',
        }],
      }
      resolveData = {
        data: {
          'type': 'acl',
          'name': 'ASN example',
          'id': 'example_id',
          'active': true,
          'mdate': '2020-11-04 07:54:27.417791',
          'source': 'https://example.com',
          'description': 'some example ASNs',
          'entries_relation': 'OR',
          'tags': [
            'blocklist',
            'ASN',
          ],
          'entries': {
            '1': [wantedEntries[0], wantedEntries[1]],
            '2': wantedEntries[2],
          },
        },
      }
      const button = wrapper.find('.update-now-button')
      await button.trigger('click')
      wrapper.vm.$forceUpdate()
      await nextTick()
      const entriesRelationListComponent = wrapper.findComponent(EntriesRelationList)
      expect(entriesRelationListComponent.props('rule')).toEqual(wantedData)
    })

    test('should update entries relation component with correct data - ip array', async () => {
      const wantedEntries: GlobalFilterRuleEntry[] = [
        [
          'ip',
          '203.208.60.0/24',
          'Crawler',
        ],
        [
          'ip',
          '209.85.238.0/24',
          'Crawler',
        ],
        [
          'ip',
          '66.249.90.0/24',
          'Crawler',
        ],
        [
          'ip',
          '66.249.91.0/24',
          null,
        ],
      ]
      const wantedData: GlobalFilterRule = {
        relation: 'OR',
        entries: [{
          entries: wantedEntries,
          relation: 'OR',
        }],
      }
      resolveData = {
        data: `${wantedEntries[0][1]}#${wantedEntries[0][2]}\n` +
          `${wantedEntries[1][1]};${wantedEntries[1][2]}\n` +
          `${wantedEntries[2][1]}?${wantedEntries[2][2]}\n` +
          `${wantedEntries[3][1]}`,
      }
      const button = wrapper.find('.update-now-button')
      await button.trigger('click')
      wrapper.vm.$forceUpdate()
      await nextTick()
      const entriesRelationListComponent = wrapper.findComponent(EntriesRelationList)
      expect(entriesRelationListComponent.props('rule')).toEqual(wantedData)
    })

    test('should update entries relation component with correct data - asn array', async () => {
      const wantedEntries: GlobalFilterRuleEntry[] = [
        [
          'asn',
          'as34109',
          'spam',
        ],
        [
          'asn',
          'as3396',
          'spam',
        ],
        [
          'asn',
          'as3502',
          'spam',
        ],
        [
          'asn',
          'as6752',
          null,
        ],
      ]
      const wantedData: GlobalFilterRule = {
        relation: 'OR',
        entries: [{
          entries: wantedEntries,
          relation: 'OR',
        }],
      }
      resolveData = {
        data: `${wantedEntries[0][1]}#${wantedEntries[0][2]}\n` +
          `${wantedEntries[1][1]};${wantedEntries[1][2]}\n` +
          `${wantedEntries[2][1]}?${wantedEntries[2][2]}\n` +
          `${wantedEntries[3][1]}`,
      }
      const button = wrapper.find('.update-now-button')
      await button.trigger('click')
      wrapper.vm.$forceUpdate()
      await nextTick()
      const entriesRelationListComponent = wrapper.findComponent(EntriesRelationList)
      expect(entriesRelationListComponent.props('rule')).toEqual(wantedData)
    })

    test('should update entries relation component with correct data - global filter', async () => {
      const globalFilter: GlobalFilter = {
        'id': 'xlbp148c',
        'name': 'API Discovery',
        'source': 'self-managed',
        'mdate': '2020-05-23T00:04:41',
        'description': 'Tag API Requests',
        'active': true,
        'tags': ['api', 'okay'],
        'action': 'monitor',
        'rule': {
          'relation': 'OR',
          'entries': [
            {'relation': 'OR', 'entries': [['ip', '1.2.3.4', null]]},
            {'relation': 'OR', 'entries': [['ip', '5.6.7.8', 'an IP']]},
            {'relation': 'OR', 'entries': [['asn', 'as612', 'annotation']]},
            {'relation': 'OR', 'entries': [['asn', 'as34109']]},
          ],
        },
      }
      const wantedData: GlobalFilterRule = JSON.parse(JSON.stringify(globalFilter.rule))
      resolveData = {data: globalFilter}
      const button = wrapper.find('.update-now-button')
      await button.trigger('click')
      wrapper.vm.$forceUpdate()
      await nextTick()
      const entriesRelationListComponent = wrapper.findComponent(EntriesRelationList)
      expect(entriesRelationListComponent.props('rule')).toEqual(wantedData)
    })

    test('should not update entries relation component with correct data - global filter - no entries', async () => {
      const wantedData: GlobalFilterRule = docs[0].rule
      resolveData = {
        data: {
          'id': 'xlbp148c',
          'name': 'API Discovery',
          'source': 'self-managed',
          'mdate': '2020-05-23T00:04:41',
          'description': 'Tag API Requests',
          'active': true,
          'tags': ['api', 'okay'],
          'action': 'monitor',
          'rule': {
            'relation': 'OR',
            'entries': [],
          },
        },
      }
      const button = wrapper.find('.update-now-button')
      await button.trigger('click')
      wrapper.vm.$forceUpdate()
      await nextTick()
      const entriesRelationListComponent = wrapper.findComponent(EntriesRelationList)
      expect(entriesRelationListComponent.props('rule')).toEqual(wantedData)
    })

    test('should not update entries relation component with correct data - global filter - no sections', async () => {
      const wantedData: GlobalFilterRule = docs[0].rule
      resolveData = {
        data: {
          'id': 'xlbp148c',
          'name': 'API Discovery',
          'source': 'self-managed',
          'mdate': '2020-05-23T00:04:41',
          'description': 'Tag API Requests',
          'active': true,
          'tags': ['api', 'okay'],
          'action': 'monitor',
          'rule': {
            'relation': 'OR',
          },
        },
      }
      const button = wrapper.find('.update-now-button')
      await button.trigger('click')
      wrapper.vm.$forceUpdate()
      await nextTick()
      const entriesRelationListComponent = wrapper.findComponent(EntriesRelationList)
      expect(entriesRelationListComponent.props('rule')).toEqual(wantedData)
    })

    test('should not update entries relation component with correct data - global filter - no rule', async () => {
      const wantedData: GlobalFilterRule = docs[0].rule
      resolveData = {
        data: {
          'id': 'xlbp148c',
          'name': 'API Discovery',
          'source': 'self-managed',
          'mdate': '2020-05-23T00:04:41',
          'description': 'Tag API Requests',
          'active': true,
          'tags': ['api', 'okay'],
          'action': 'monitor',
        },
      }
      const button = wrapper.find('.update-now-button')
      await button.trigger('click')
      wrapper.vm.$forceUpdate()
      await nextTick()
      const entriesRelationListComponent = wrapper.findComponent(EntriesRelationList)
      expect(entriesRelationListComponent.props('rule')).toEqual(wantedData)
    })

    test('should not update entries relation component when no data found', async () => {
      const wantedData: GlobalFilterRule = docs[0].rule
      resolveData = {
        data: null,
      }
      const button = wrapper.find('.update-now-button')
      await button.trigger('click')
      wrapper.vm.$forceUpdate()
      await nextTick()
      const entriesRelationListComponent = wrapper.findComponent(EntriesRelationList)
      expect(entriesRelationListComponent.props('rule')).toEqual(wantedData)
    })
  })
})
