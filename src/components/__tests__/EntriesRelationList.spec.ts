// @ts-nocheck
import EntriesRelationList from '@/components/EntriesRelationList.vue'
import {afterEach, beforeEach, describe, expect, jest, test} from '@jest/globals'
import {DOMWrapper, mount, VueWrapper} from '@vue/test-utils'
import _ from 'lodash'
import {GlobalFilter, GlobalFilterSection, Rule} from '@/types'
import {nextTick} from 'vue'


describe('EntriesRelationList.vue', () => {
  let wrapper: VueWrapper
  let ruleData: GlobalFilter['rule']
  let entryData1: GlobalFilterSection
  let entryData2: GlobalFilterSection
  beforeEach(() => {
    entryData1 = {
      relation: 'OR',
      entries: [
        [
          'uri',
          '/login',
        ],
        [
          'ip',
          '1.1.1.1',
        ],
      ],
    }
    entryData2 = {
      relation: 'AND',
      entries: [
        [
          'headers',
          ['user-agent', 'curl'],
        ],
        [
          'headers',
          ['content-type', 'application/json'],
        ],
      ],
    }
    ruleData = {
      relation: 'AND',
      entries: [
        entryData1,
        entryData2,
      ],
    }
    const onUpdate = async (rule: GlobalFilter['rule']) => {
      await wrapper.setProps({rule})
    }
    wrapper = mount(EntriesRelationList, {
      props: {
        'rule': ruleData,
        'editable': true,
        'onUpdate:rule': onUpdate,
      },
    })
  })
  afterEach(() => {
    jest.clearAllMocks()
    jest.clearAllTimers()
  })

  test('should have a single table rendered for each entries list', () => {
    const tables = wrapper.findAll('.entries-table')
    expect(tables.length).toEqual(2)
  })

  test('should display correct data from prop to view', () => {
    const wantedEntryData = _.cloneDeep(entryData1.entries)
    const categories = wrapper.findAll('.entry-category')
    const values = wrapper.findAll('.entry-value')
    expect(categories.at(0).text().toLowerCase()).toContain(wantedEntryData[0][0].toLowerCase())
    expect(values.at(0).text().toLowerCase()).toContain((wantedEntryData[0][1] as string).toLowerCase())
    expect(categories.at(1).text().toLowerCase()).toContain(wantedEntryData[1][0].toLowerCase())
    expect(values.at(1).text().toLowerCase()).toContain((wantedEntryData[1][1] as string).toLowerCase())
    expect(ruleData.entries[0].entries).toEqual(wantedEntryData)
  })

  test('should display correct data from prop to view if data changed', async () => {
    const wantedEntryData = ['ip', '1.2.3.4']
    const newRuleData = JSON.parse(JSON.stringify(ruleData))
    newRuleData.entries[0].entries = [wantedEntryData]
    await wrapper.setProps({rule: newRuleData})
    const categories = wrapper.findAll('.entry-category')
    const values = wrapper.findAll('.entry-value')
    expect(categories.at(0).text().toLowerCase()).toContain(wantedEntryData[0].toLowerCase())
    expect(values.at(0).text().toLowerCase()).toContain(wantedEntryData[1].toLowerCase())
  })

  test('should not break if not given a prop', () => {
    wrapper = mount(EntriesRelationList)
    wrapper.vm.$forceUpdate()
    expect(wrapper).toBeTruthy()
  })

  test('should not break if data changes to invalid data', async () => {
    entryData1 = {}
    entryData2 = {
      relation: 'AND',
      entries: [
        [
          'headers',
          ['user-agent', 'curl'],
        ],
        [
          'headers',
          ['content-type', 'application/json'],
        ],
      ],
    }
    ruleData = {
      relation: 'AND',
      entries: [
        entryData1,
        entryData2,
      ],
    }
    await wrapper.setProps({rule: ruleData})
    wrapper.vm.$forceUpdate()
    expect(wrapper).toBeTruthy()
  })

  test('should clear errors', async () => {
    // change entry type to headers
    wrapper.setData({newEntrySectionIndex: 1})
    await nextTick()
    const newEntryRow = wrapper.find('.new-entry-row')
    await nextTick()
    const typeSelection = newEntryRow.find('.new-entry-type-selection')
    await typeSelection.trigger('click')
    const options = typeSelection.findAll('option')
    await typeSelection.setValue(options.at(7).element.value)
    const newEntrySecondAttr = newEntryRow.find('.new-entry-value-annotation-input')

    await newEntrySecondAttr.setValue('\\')
    await newEntrySecondAttr.setValue('something')
    // check
    expect(wrapper.vm.entriesErrors.length).toEqual(0)
  })

  test('should clear errors, clear invalidIPs and reset the newEntrySectionIndex to -1', () => {
    wrapper.vm.cancelAllEntries()
    expect(wrapper.vm.newEntrySectionIndex).toEqual(-1)
    expect(wrapper.vm.entriesErrors.length).toEqual(0)
    expect(wrapper.vm.invalidIPs.length).toEqual(0)
  })

  describe('relation switch labels', () => {
    test('should change section relation between `OR` and `AND` when clicked', async () => {
      const section = wrapper.findAll('.section').at(1)
      const sectionRelationToggle = section.find('.section-relation-toggle')
      await sectionRelationToggle.trigger('click')
      expect(sectionRelationToggle.text()).toEqual('OR')
      await sectionRelationToggle.trigger('click')
      expect(sectionRelationToggle.text()).toEqual('AND')
    })

    test('should not change section relation if section entries contains two entries of same category', async () => {
      const newRuleData = JSON.parse(JSON.stringify(ruleData))
      newRuleData.entries[0].entries = [
        [
          'uri',
          '/login',
        ],
        [
          'uri',
          '/account',
        ],
      ]
      await wrapper.setProps({rule: newRuleData})
      const section = wrapper.findAll('.section').at(0)
      const sectionRelationToggle = section.find('.section-relation-toggle')
      await sectionRelationToggle.trigger('click')
      expect(sectionRelationToggle.text()).toEqual('OR')
    })
  })

  describe('data pagination', () => {
    let checkedTable: DOMWrapper
    beforeEach(() => {
      entryData1 = {
        relation: 'AND',
        entries: [
          ['uri', '/login0'],
          ['uri', '/login1'],
          ['uri', '/login2'],
          ['uri', '/login3'],
          ['uri', '/login4'],
          ['uri', '/login5'],
          ['uri', '/login6'],
          ['uri', '/login7'],
          ['uri', '/login8'],
          ['uri', '/login9'],
          ['uri', '/account0'],
          ['uri', '/account1'],
          ['uri', '/account2'],
          ['uri', '/account3'],
          ['uri', '/account4'],
          ['uri', '/account5'],
          ['uri', '/account6'],
          ['uri', '/account7'],
          ['uri', '/account8'],
          ['uri', '/account9'],
          ['uri', '/about0'],
          ['uri', '/about1'],
          ['uri', '/about2'],
          ['uri', '/about3'],
          ['uri', '/about4'],
          ['uri', '/about5'],
          ['uri', '/about6'],
          ['uri', '/about7'],
          ['uri', '/about8'],
        ],
      }
      ruleData = {
        relation: 'AND',
        entries: [
          entryData1,
        ],
      }
      const onUpdate = (rule: GlobalFilter['rule']) => {
        wrapper.setProps({rule})
      }
      wrapper = mount(EntriesRelationList, {
        props: {
          'rule': ruleData,
          'editable': true,
          'onUpdate:rule': onUpdate,
        },
      })
      wrapper.vm.$forceUpdate()
      checkedTable = wrapper.findAll('.entries-table').at(0)
    })

    test('should show 20 entries per page', () => {
      const entryRows = checkedTable.findAll('.entry-row')
      expect(entryRows.length).toEqual(20)
    })

    test('should correctly render next page when next page button is clicked', async () => {
      checkedTable = wrapper.findAll('.entries-table').at(0)
      const nextPageButton = checkedTable.find('.pagination-next')
      await nextPageButton.trigger('click')
      checkedTable = wrapper.findAll('.entries-table').at(0)
      const entryRows = checkedTable.findAll('.entry-row')
      expect(entryRows.length).toEqual(9)
    })

    test('should have next page button disabled if currently in last page', async () => {
      const nextPageButton = checkedTable.find('.pagination-next')
      await nextPageButton.trigger('click')
      // checkedTable = wrapper.findAll('.entries-table').at(0)
      // const entryRows = checkedTable.findAll('.entry-row')
      // expect(entryRows.length).toEqual(9)
      expect(nextPageButton.element.disabled).toBeTruthy()
    })

    test('should correctly render prev page when next prev button is clicked', async () => {
      const nextPageButton = checkedTable.find('.pagination-next')
      await nextPageButton.trigger('click')
      const prevPageButton = checkedTable.find('.pagination-previous')
      await prevPageButton.trigger('click')
      checkedTable = wrapper.findAll('.entries-table').at(0)
      const entryRows = checkedTable.findAll('.entry-row')
      expect(entryRows.length).toEqual(20)
    })

    test('should have prev page button disabled if currently in first page', async () => {
      const prevPageButton = checkedTable.find('.pagination-previous')
      expect(prevPageButton.element.disabled).toBeTruthy()
    })

    test('should not show pagination when sections entries are empty', () => {
      const ruleData = {
        relation: 'AND',
        entries: [
          {
            relation: 'AND',
            entries: [
            ],
          },
        ],
      }
      wrapper = mount(EntriesRelationList, {
        props: {
          'rule': ruleData,
          'editable': true,
        },
      })
      const sections = wrapper.findAll('.section')
      const pagination = sections.at(0)?.find('.pagination')
      expect(pagination?.exists()).toBeFalsy()
    })

    test('should not show pagination when sections entries is null', () => {
      const ruleData = {
        relation: 'AND',
        entries: [
          {
            relation: 'AND',
            entries: null,
          },
        ],
      }
      wrapper = mount(EntriesRelationList, {
        props: {
          'rule': ruleData,
          'editable': true,
        },
      })
      const sections = wrapper.findAll('.section')
      const pagination = sections.at(0)?.find('.pagination')
      expect(pagination?.exists()).toBeFalsy()
    })

    test('should not show pagination when there are 20 entries or less', () => {
      const ruleData = {
        relation: 'AND',
        entries: [
          {
            relation: 'AND',
            entries: [
              ['uri', '/login0'],
              ['uri', '/login1'],
              ['uri', '/login2'],
              ['uri', '/login3'],
              ['uri', '/login4'],
              ['uri', '/login5'],
              ['uri', '/login6'],
              ['uri', '/login7'],
              ['uri', '/login8'],
              ['uri', '/login9'],
              ['uri', '/account0'],
              ['uri', '/account1'],
              ['uri', '/account2'],
              ['uri', '/account3'],
              ['uri', '/account4'],
              ['uri', '/account5'],
              ['uri', '/account6'],
              ['uri', '/account7'],
              ['uri', '/account8'],
              ['uri', '/account9'],
            ],
          },
        ],
      }
      wrapper = mount(EntriesRelationList, {
        props: {
          'rule': ruleData,
          'editable': true,
        },
      })
      const sections = wrapper.findAll('.section')
      const pagination = sections.at(0)?.find('.pagination')
      expect(pagination?.exists()).toBeFalsy()
    })
  })

  describe('rule prop validator', () => {
    let validator: Function
    beforeEach(() => {
      validator = wrapper.vm.$options.props.rule.validator
    })

    test('should return true for data in the correct schema', () => {
      const isValid = validator(ruleData)
      expect(isValid).toEqual(true)
    })

    test('should return false for relation not `or` or `and`', () => {
      (ruleData as GlobalFilter).relation = 'unknown value'
      const isValid = validator(ruleData)
      expect(isValid).toEqual(false)
    })

    test('should return false for entries with too few arguments', () => {
      (ruleData as GlobalFilter).entries[0].entries[0] = ['ip']
      const isValid = validator(ruleData)
      expect(isValid).toEqual(false)
    })

    test('should return false for entries with too many arguments', () => {
      (ruleData as GlobalFilter).entries[0].entries[0] = ['ip', 'test', 'banana', 'apple', 'pear', 'eggplant']
      const isValid = validator(ruleData)
      expect(isValid).toEqual(false)
    })

    test('should return false for object entry which does not match the schema', () => {
      (ruleData as GlobalFilter).entries[0].entries[0] = {
        prop: 'value',
      }
      const isValid = validator(ruleData)
      expect(isValid).toEqual(false)
    })

    test('should return false for undefined sections', () => {
      ruleData.entries = undefined
      const isValid = validator(ruleData)
      expect(isValid).toEqual(false)
    })

    test('should return false for undefined relation', () => {
      ruleData.relation = undefined
      const isValid = validator(ruleData)
      expect(isValid).toEqual(false)
    })

    test('should return false for undefined rule', () => {
      ruleData = undefined
      const isValid = validator(ruleData)
      expect(isValid).toEqual(false)
    })
  })

  describe('add section button', () => {
    test('should add empty section', () => {
      const addSectionButton = wrapper.find('.add-section-button')
      addSectionButton.trigger('click')
      const tables = wrapper.findAll('.entries-table')
      expect(tables.length).toEqual(2)
    })

    test('should not have the option to add wrapper if not editable', () => {
      wrapper = mount(EntriesRelationList, {
        props: {
          rule: ruleData,
          editable: false,
        },
      })
      const addSectionButton = wrapper.find('.add-section-button')
      expect(addSectionButton.exists()).toBeFalsy()
    })
  })

  describe('remove section button', () => {
    test('should remove section', async () => {
      const removeSectionButton = wrapper.find('.remove-section-button')
      await removeSectionButton.trigger('click')
      const tables = wrapper.findAll('.entries-table')
      expect(tables.length).toEqual(1)
    })

    test('should not have the option to remove section if no sections exist', () => {
      ruleData.entries = []
      wrapper = mount(EntriesRelationList, {
        props: {
          rule: ruleData,
          editable: true,
        },
      })
      const removeSectionButton = wrapper.find('.remove-section-button')
      expect(removeSectionButton.exists()).toBeFalsy()
    })

    test('should not have the option to remove wrapper if not editable', () => {
      wrapper = mount(EntriesRelationList, {
        props: {
          rule: ruleData,
          editable: false,
        },
      })
      const removeSectionButton = wrapper.find('.remove-section-button')
      expect(removeSectionButton.exists()).toBeFalsy()
    })
  })

  describe('add entry button', () => {
    test('should open new entry row', async () => {
      const addEntryButton = wrapper.find('.add-entry-button')
      await addEntryButton.trigger('click')
      const newEntryRow = wrapper.find('.new-entry-row')
      expect(newEntryRow.exists()).toBeTruthy()
    })

    test('should add new entry from input when confirm button is clicked', async () => {
      const addEntryButton = wrapper.find('.add-entry-button')
      await addEntryButton.trigger('click')
      const newEntryRow = wrapper.find('.new-entry-row')
      const newEntryTextarea = newEntryRow.find('.new-entry-textarea')
      await newEntryTextarea.setValue('1.2.3.4#annotation')
      const confirmAddEntryButton = wrapper.find('.confirm-add-entry-button')
      await confirmAddEntryButton.trigger('click')
      expect(wrapper.vm.rule.entries[0].entries.length).toEqual(3)
      expect(wrapper.vm.rule.entries[0].entries[2]).toEqual(['ip', '1.2.3.4', 'annotation'])
    })

    test('should add new entry from input with general annotation when confirm button is clicked', async () => {
      const addEntryButton = wrapper.find('.add-entry-button')
      await addEntryButton.trigger('click')
      const newEntryRow = wrapper.find('.new-entry-row')
      const newEntryTextarea = newEntryRow.find('.new-entry-textarea')
      await newEntryTextarea.setValue('1.2.3.4')
      const newEntryAnnotation = newEntryRow.find('.new-entry-value-annotation-input')
      await newEntryAnnotation.setValue('annot')
      const confirmAddEntryButton = wrapper.find('.confirm-add-entry-button')
      await confirmAddEntryButton.trigger('click')
      expect(wrapper.vm.rule.entries[0].entries.length).toEqual(3)
      expect(wrapper.vm.rule.entries[0].entries[2]).toEqual(['ip', '1.2.3.4', 'annot'])
    })

    test('should add multiple new entries from input when confirm button is clicked', async () => {
      const addEntryButton = wrapper.find('.add-entry-button')
      await addEntryButton.trigger('click')
      const newEntryRow = wrapper.find('.new-entry-row')
      const newEntryTextarea = newEntryRow.find('.new-entry-textarea')
      await newEntryTextarea.setValue('1.2.3.4#annotation\n127.0.0.1#localhost')
      const confirmAddEntryButton = wrapper.find('.confirm-add-entry-button')
      await confirmAddEntryButton.trigger('click')
      expect(wrapper.vm.rule.entries[0].entries.length).toEqual(4)
      expect(wrapper.vm.rule.entries[0].entries[2]).toEqual(['ip', '1.2.3.4', 'annotation'])
      expect(wrapper.vm.rule.entries[0].entries[3]).toEqual(['ip', '127.0.0.1', 'localhost'])
    })

    test('should add multiple new entries with general' +
      'annotation from input when confirm button is clicked', async () => {
      const addEntryButton = wrapper.find('.add-entry-button')
      await addEntryButton.trigger('click')
      const newEntryRow = wrapper.find('.new-entry-row')
      const newEntryTextarea = newEntryRow.find('.new-entry-textarea')
      await newEntryTextarea.setValue('1.2.3.4\n127.0.0.1#localhost')
      const newEntryAnnotation = newEntryRow.find('.new-entry-value-annotation-input')
      await newEntryAnnotation.setValue('annot')
      const confirmAddEntryButton = wrapper.find('.confirm-add-entry-button')
      await confirmAddEntryButton.trigger('click')
      expect(wrapper.vm.rule.entries[0].entries.length).toEqual(4)
      expect(wrapper.vm.rule.entries[0].entries[2]).toEqual(['ip', '1.2.3.4', 'annot'])
      expect(wrapper.vm.rule.entries[0].entries[3]).toEqual(['ip', '127.0.0.1', 'localhost'])
    })

    test('should add new entries from name-value input when confirm button is clicked', async () => {
      const addEntryButton = wrapper.find('.add-entry-button')
      await addEntryButton.trigger('click')
      const newEntryRow = wrapper.find('.new-entry-row')
      const typeSelection = newEntryRow.find('.new-entry-type-selection')
      await typeSelection.trigger('click')
      const options = typeSelection.findAll('option')
      await typeSelection.setValue(options.at(7).element.value)
      const newEntryInputName = newEntryRow.find('.new-entry-name-input')
      await newEntryInputName.setValue('something')
      const newEntryInputValue = newEntryRow.find('.new-entry-value-annotation-input')
      await newEntryInputValue.setValue('right')
      const confirmAddEntryButton = wrapper.find('.confirm-add-entry-button')
      await confirmAddEntryButton.trigger('click')
      expect(wrapper.vm.rule.entries[0].entries.length).toEqual(3)
      expect(wrapper.vm.rule.entries[0].entries[2]).toEqual(['headers', ['something', 'right']])
    })

    test('should not add new entries from multi-line' +
      'input when confirm button is clicked if has too few arguments', async () => {
      const addEntryButton = wrapper.find('.add-entry-button')
      await addEntryButton.trigger('click')
      const newEntryRow = wrapper.find('.new-entry-row')
      const typeSelection = newEntryRow.find('.new-entry-type-selection')
      await typeSelection.trigger('click')
      const options = typeSelection.findAll('option')
      await typeSelection.setValue(options.at(7).element.value)
      const newEntryInputName = newEntryRow.find('.new-entry-name-input')
      await newEntryInputName.setValue('something')
      const newEntryInputValue = newEntryRow.find('.new-entry-value-annotation-input')
      await newEntryInputValue.setValue('')
      const confirmAddEntryButton = wrapper.find('.confirm-add-entry-button')
      await confirmAddEntryButton.trigger('click')
      expect(wrapper.vm.rule.entries[0].entries.length).toEqual(2)
    })

    test('should not show new entry button if not editable', () => {
      wrapper = mount(EntriesRelationList, {
        props: {
          rule: ruleData,
          editable: false,
        },
      })
      const addEntryButton = wrapper.find('.add-entry-button')
      expect(addEntryButton.exists()).toBeFalsy()
    })

    test('should set section relation to `OR` if two items of same category added', async () => {
      // set relation to AND
      const sectionRelationToggle = wrapper.findAll('.section-relation-toggle').at(0)
      await sectionRelationToggle.trigger('click')
      expect(sectionRelationToggle.text()).toEqual('AND')
      // open new entry row
      const addEntryButton = wrapper.find('.add-entry-button')
      await addEntryButton.trigger('click')
      // add input to new entry row
      const newEntryRow = wrapper.find('.new-entry-row')
      const newEntryTextarea = newEntryRow.find('.new-entry-textarea')
      await newEntryTextarea.setValue('1.2.3.4#annotation\n1.2.3.5#wow')
      // confirm add new entry
      const confirmAddEntryButton = wrapper.find('.confirm-add-entry-button')
      await confirmAddEntryButton.trigger('click')
      // check
      expect(sectionRelationToggle.text()).toEqual('OR')
    })

    test('should not set section relation to `OR` if no more than one item of same category added', async () => {
      const newRuleData = JSON.parse(JSON.stringify(ruleData))
      newRuleData.entries[0].entries = [
        [
          'uri',
          '/login',
        ],
      ]
      await wrapper.setProps({rule: newRuleData})
      // check relation is AND
      const sectionRelationToggle = wrapper.findAll('.section-relation-toggle').at(0)
      expect(sectionRelationToggle.text()).toEqual('AND')
      // open new entry row
      const addEntryButton = wrapper.find('.add-entry-button')
      await addEntryButton.trigger('click')
      // add input to new entry row
      const newEntryRow = wrapper.find('.new-entry-row')
      const newEntryTextarea = newEntryRow.find('.new-entry-textarea')
      await newEntryTextarea.setValue('1.2.3.4#annotation')
      // confirm add new entry
      const confirmAddEntryButton = wrapper.find('.confirm-add-entry-button')
      await confirmAddEntryButton.trigger('click')
      // check relation is still AND
      expect(sectionRelationToggle.text()).toEqual('AND')
    })

    test('should not set section relation to `OR` if two headers added', async () => {
      const headerName = 'user-agent'
      const headerValue = 'curl'
      // set relation to AND
      const sectionRelationToggle: DOMWrapper = wrapper.findAll('.section-relation-toggle').at(0)
      await sectionRelationToggle.trigger('click')
      expect(sectionRelationToggle.text()).toEqual('AND')
      // open new entry row
      let addEntryButton = wrapper.find('.add-entry-button')
      await addEntryButton.trigger('click')
      let newEntryRow = wrapper.find('.new-entry-row')
      // change entry type to headers
      let typeSelection = newEntryRow.find('.new-entry-type-selection')
      await typeSelection.trigger('click')
      let options = typeSelection.findAll('option')
      await typeSelection.setValue(options.at(7).element.value)
      // add input to new entry row
      let newEntryInputName = newEntryRow.find('.new-entry-name-input')
      await newEntryInputName.setValue(headerName)
      let newEntryInputValue = newEntryRow.find('.new-entry-value-annotation-input')
      await newEntryInputValue.setValue(headerValue)
      // confirm add new entry
      let confirmAddEntryButton = wrapper.find('.confirm-add-entry-button')
      await confirmAddEntryButton.trigger('click')
      // open new entry row - second time
      addEntryButton = wrapper.find('.add-entry-button')
      await addEntryButton.trigger('click')
      newEntryRow = wrapper.find('.new-entry-row')
      // change entry type to headers - second time
      typeSelection = newEntryRow.find('.new-entry-type-selection')
      await typeSelection.trigger('click')
      options = typeSelection.findAll('option')
      await typeSelection.setValue(options.at(7).element.value)
      // add input to new entry row - second time
      newEntryInputName = newEntryRow.find('.new-entry-name-input')
      await newEntryInputName.setValue(headerName)
      newEntryInputValue = newEntryRow.find('.new-entry-value-annotation-input')
      await newEntryInputValue.setValue(headerValue)
      // confirm add new entry - second time
      confirmAddEntryButton = wrapper.find('.confirm-add-entry-button')
      await confirmAddEntryButton.trigger('click')
      // check
      expect(sectionRelationToggle.text()).toEqual('AND')
    })


    test('should paint the row in red in case of adding a duplicated entry', async () => {
      const addEntryButton = wrapper.find('.add-entry-button')
      await addEntryButton.trigger('click')
      const newEntryRow = wrapper.find('.new-entry-row')
      const newEntryTextarea = newEntryRow.find('.new-entry-textarea')
      await newEntryTextarea.setValue('1.1.1.1')
      const confirmAddEntryButton = newEntryRow.find('.confirm-add-entry-button')
      await confirmAddEntryButton.trigger('click')
      // add a second entry
      // addEntryButton = wrapper.find('.add-entry-button')
      // await addEntryButton.trigger('click')
      // newEntryRow = wrapper.find('.new-entry-row')
      // newEntryTextarea = newEntryRow.find('.new-entry-textarea')
      // await newEntryTextarea.setValue('1.2.3.4')
      // confirmAddEntryButton = newEntryRow.find('.confirm-add-entry-button')
      // await confirmAddEntryButton.trigger('click')
      // counting only the rows in that section
      const section = wrapper.findAll('.section').at(0)
      const rows = section.findAll('.entry-row')
      console.log('rows: ', rows.length-1, rows.map((row) => row.html()))
      expect(rows.at(rows.length-1).element.classList.contains('has-text-danger')).toBeTruthy()
    })
  })

  describe('cancel entry button', () => {
    test('should close adding mode', async () => {
      const addEntryButton = wrapper.find('.add-entry-button')
      await addEntryButton.trigger('click')
      const cancelEntryButton = wrapper.find('.cancel-entry-button')
      await cancelEntryButton.trigger('click')
      expect(wrapper.vm.newEntrySectionIndex).toEqual(-1)
    })
    test('should remove empty section', async () => {
      wrapper = mount(EntriesRelationList, {
        props: {
          rule: {
            relation: 'OR',
            entries: [],
          },
          editable: true,
        },
      })
      const addSectionButton = wrapper.find('.add-section-button')
      await addSectionButton.trigger('click')
      const cancelEntryButton = wrapper.find('.cancel-entry-button')
      await cancelEntryButton.trigger('click')
      expect(wrapper.findAll('.section').length).toEqual(0)
    })
  })

  describe('remove entry button', () => {
    test('should remove entry', async () => {
      const removeEntryButton = wrapper.find('.remove-entry-button')
      await removeEntryButton.trigger('click')
      expect(wrapper.vm.rule.entries[0].entries.length).toEqual(1)
    })
    test('should remove section if no entries left', async () => {
      const entryData3: GlobalFilterSection = {
        relation: 'AND',
        entries: [
          [
            'headers',
            ['user-agent', 'curl'],
          ],
        ],
      }
      const rule: Rule = {
        relation: 'AND',
        entries: [
          entryData1,
          entryData3,
        ],
      }
      wrapper = mount(EntriesRelationList, {
        props: {
          rule,
          editable: true,
        },
      })
      const section = wrapper.findAll('.section').at(1)
      const removeEntryButton = section.find('.remove-entry-button')
      await removeEntryButton.trigger('click')
      expect(wrapper.findAll('.section').length).toEqual(rule.entries.length - 1)
    })
  })

  describe('validators', () => {
    let newEntryTextarea: DOMWrapper<Element>
    let newEntrySecondAttr: DOMWrapper<Element>
    let wrapper: VueWrapper
    let newEntryRows: DOMWrapper<Element>[]
    let newEntryRow: DOMWrapper<Element>
    let confirmAddEntryButton: DOMWrapper<Element>
    let options: DOMWrapper<HTMLOptionElement>[]
    beforeEach(async () => {
      entryData1 = {
        relation: 'OR',
        entries: [
          [
            'uri',
            '/login',
          ],
          [
            'ip',
            '1.1.1.1',
          ],
        ],
      }
      entryData2 = {
        relation: 'AND',
        entries: [
          [
            'headers',
            ['user-agent', 'curl'],
          ],
          [
            'headers',
            ['content-type', 'application/json'],
          ],
        ],
      }
      ruleData = {
        relation: 'AND',
        entries: [
          entryData1,
          entryData2,
        ],
      }
      const onUpdate = async (rule: GlobalFilter['rule']) => {
        await wrapper.setProps({rule})
      }
      wrapper = mount(EntriesRelationList, {
        props: {
          'rule': ruleData,
          'editable': true,
          'onUpdate:rule': onUpdate,
        },
      })
      wrapper.vm.$forceUpdate()
      await nextTick()

      // open new entry row
      const addEntryButton = wrapper.find('.add-entry-button')
      await addEntryButton.trigger('click')
      // add input to new entry row
      newEntryRows = wrapper.findAll('.new-entry-row')
      newEntryRow = newEntryRows.at(0)
      newEntryTextarea = newEntryRow.find('.new-entry-textarea')
      newEntrySecondAttr = newEntryRow.find('.new-entry-value-annotation-input')
      const typeSelection = newEntryRow.find('.new-entry-type-selection')
      await typeSelection.trigger('click')
      options = typeSelection.findAll('option')
      confirmAddEntryButton = wrapper.find('.confirm-add-entry-button')
    })
    test('should not add entry if it contains an error or empty first attr', async () => {
      await newEntryTextarea.setValue('')
      // confirm add new entry
      await confirmAddEntryButton.trigger('click')
      // check
      const entries = wrapper.findAll('.entry-row')
      expect(entries.length).toEqual(entryData1.entries.length + entryData2.entries.length)
      expect(newEntryRows.length).toEqual(1)
    })
    test('should highlight duplicated entries', async () => {
      await newEntryTextarea.setValue('1.2.3.4\n1.2.3.4\n1.2.3.4')
      // confirm add new entry
      await confirmAddEntryButton.trigger('click')
      // check
      expect(wrapper.vm.duplicatedEntries.length).toEqual(1)
    })
    test('should validate duplicated entries if category is args, cookies, headers', async () => {
      // open new entry row
      const addEntryButton = wrapper.find('.add-entry-button')
      await addEntryButton.trigger('click')
      // change entry type to headers
      const typeSelection = newEntryRow.find('.new-entry-type-selection')
      await typeSelection.trigger('click')
      options = typeSelection.findAll('option')
      await typeSelection.setValue(options.at(7).element.value)
      // add input to new entry row
      newEntryRow = wrapper.find('.new-entry-row')
      const newEntryFirstAttr = newEntryRow.find('.new-entry-name-input')
      const duplicateValues = entryData2.entries[0][1]
      await newEntryFirstAttr.setValue(duplicateValues[0])
      await newEntrySecondAttr.setValue(duplicateValues[1])
      // confirm add new entry
      confirmAddEntryButton = newEntryRow.find('.confirm-add-entry-button')
      await confirmAddEntryButton.trigger('click')
      // check
      expect(wrapper.vm.duplicatedEntries.length).toEqual(1)
    })
    // TODO: Fix regex test for rust standards and re-apply this
    // test('should validate value as regex if category is path, query, or uri', async () => {
    //   // change entry type to path
    //   await nextTick()
    //   newEntryTextarea.setValue('\\')
    //   // check
    //   expect(wrapper.vm.entriesErrors.length).toEqual(1)
    // })
    test('should validate value as ip if category is ip', async () => {
      // change entry type to ip
      const typeSelection = newEntryRow.find('.new-entry-type-selection')
      await typeSelection.trigger('click')
      options = typeSelection.findAll('option')
      await typeSelection.setValue(options.at(4).element.value)
      await newEntryTextarea.setValue('1.1.1.1.')
      // check
      expect(wrapper.vm.entriesErrors.length).toEqual(1)
    })
    test('should validate value as non-empty if category is not ip, path, query, uri', async () => {
      // change entry type to method
      const typeSelection = newEntryRow.find('.new-entry-type-selection')
      await typeSelection.trigger('click')
      options = typeSelection.findAll('option')
      await typeSelection.setValue(options.at(3).element.value)
      await newEntryTextarea.setValue(' ')
      // check
      expect(wrapper.vm.entriesErrors.length).toEqual(1)
    })
    // TODO: Fix regex test for rust standards and re-apply this
    // test('should validate second attribute if category is args, cookies, headers', async () => {
    //   // change entry type to headers
    //   await nextTick()
    //   newEntrySecondAttr.setValue('\\')
    //   // check
    //   expect(wrapper.vm.entriesErrors.length).toEqual(1)
    // })

    test('validate textarea input should be the regrex validator when input is path,query or uri', async () => {
      const spy = jest.spyOn(wrapper.vm, 'validateRegex')
      const addEntryButton = wrapper.find('.add-entry-button')
      await addEntryButton.trigger('click')
      // change entry type to headers
      const typeSelection = newEntryRow.find('.new-entry-type-selection')
      await typeSelection.trigger('click')
      options = typeSelection.findAll('option')
      await typeSelection.setValue(options.at(7).element.value)
      // add input to new entry row
      await wrapper.setData({newEntryCategory: 'path'})
      wrapper.vm.$forceUpdate()
      newEntryRow = wrapper.find('.new-entry-row')
      expect(wrapper.vm.newEntryCategory).toEqual('path')
      const textArea = newEntryRow.find('.new-entry-textarea')
      const input = newEntryRow.find('.new-entry-name-input')
      expect(input.exists()).toBe(false)
      expect(textArea.exists()).toBe(true)
      await textArea.trigger('input')
      expect(spy).toHaveBeenCalled()
    })

    test('should display correct error for single line invalid ip', async () => {
      // change entry type to ip
      const wantedValue = 'a.b.c.d'
      const typeSelection = newEntryRow.find('.new-entry-type-selection')
      await typeSelection.trigger('click')
      options = typeSelection.findAll('option')
      await typeSelection.setValue(options.at(4).element.value)
      await newEntryTextarea.setValue(wantedValue)
      const errorsDiv = wrapper.find('.invalid-ips-errors')

      // check
      expect(errorsDiv.text()).toContain(wantedValue)
    })

    test('should display correct error for multiline invalid ip', async () => {
      // change entry type to ip
      const invalidValue = 'a.b.c.d'
      const validValue = '1.1.1.1'
      const typeSelection = newEntryRow.find('.new-entry-type-selection')
      await typeSelection.trigger('click')
      options = typeSelection.findAll('option')
      await typeSelection.setValue(options.at(4).element.value)
      await newEntryTextarea.setValue(invalidValue + '\n' + validValue)
      const errorsDiv = wrapper.find('.invalid-ips-errors')

      // check
      expect(errorsDiv.text()).toContain(`(line 1) ${invalidValue}`)
      expect(errorsDiv.text()).not.toContain(`(line 2) ${validValue}`)
    })
  })
})
