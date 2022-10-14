// @ts-nocheck
import RbzTable from '@/components/RbzTable.vue'
import {beforeEach, describe, expect, test} from '@jest/globals'
import {shallowMount, VueWrapper} from '@vue/test-utils'
import {ColumnOptions, FlowControlPolicy, GenericObject, GlobalFilter} from '@/types'
import {nextTick} from 'vue'

describe('RbzTable.vue', () => {
  let wrapper: VueWrapper
  let columns: ColumnOptions[]
  let data: GenericObject[]
  let sortedDataByNameAsc: GenericObject
  let sortedDataByDescriptionDesc: GenericObject
  let sortedDataByDescriptionAsc: GenericObject
  beforeEach(() => {
    columns = [
      {
        title: 'Name',
        fieldNames: ['name'],
        isSortable: true,
        isSearchable: true,
        classes: 'width-120px',
      },
      {
        title: 'Description',
        fieldNames: ['description'],
        isSortable: true,
        isSearchable: true,
        classes: 'ellipsis',
      },
      {
        title: 'Tags',
        fieldNames: ['tags'],
        displayFunction: (item: GlobalFilter) => {
          return item?.tags?.join('\n')
        },
        isSearchable: true,
        classes: 'width-100px white-space-pre ellipsis',
      },
      {
        title: 'Active',
        fieldNames: ['active'],
        displayFunction: (item: GlobalFilter) => {
          return item?.active ? 'yes' : 'no'
        },
        isSortable: true,
        isSearchable: true,
        classes: 'width-80px',
      },
      {
        title: 'Action',
        fieldNames: ['action'],
        isSortable: true,
        classes: 'width-80px',
      },
    ]
    data = [
      {
        name: 'c test3',
        description: 'c Jest testing description',
        tags: ['apple', 'crawler', 'curiefense'],
        id: '7785d66b1f92',
        active: true,
        action: 'challenge',
      },
      {
        name: 'b test2',
        description: 'b Jest testing description',
        tags: ['crawler', 'curiefense'],
        id: '3c098b67018f',
        active: false,
        action: 'default',
      },
      {
        name: 'a test1',
        description: 'a Jest testing description',
        tags: ['curiefense'],
        id: 'e52d14612210',
        active: false,
        action: 'default',
      },
    ]
    sortedDataByNameAsc = data.slice().sort((a, b) => {
      return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0)
    })
    sortedDataByDescriptionAsc = data.slice().sort((a, b) => {
      return (a.description > b.description) ? 1 : ((b.description > a.description) ? -1 : 0)
    })
    sortedDataByDescriptionDesc = [...sortedDataByDescriptionAsc].reverse()
    wrapper = shallowMount(RbzTable, {
      props: {
        columns: columns,
        data: data,
        showMenuColumn: true,
        showFilterButton: true,
        showNewButton: true,
        showEditButton: true,
      },
    })
  })

  describe('sorting', () => {
    test('should have the correct first asc arrow active by default', () => {
      const ascArrowElement = wrapper.find('.arrow-asc')
      expect(ascArrowElement.element.classList).toContain('is-active')
    })

    test('should have asc arrow active on click on non sorted column', async () => {
      const header = wrapper.findAll('.column-title').at(1)
      await header.trigger('click')
      const arrowElement = header.find('.arrow-asc')
      expect(arrowElement.element.classList).toContain('is-active')
    })

    test('should have desc arrow active on click on asc sorted column', async () => {
      const header = wrapper.findAll('.column-title').at(1)
      await header.trigger('click')
      await header.trigger('click')
      const arrowElement = header.find('.arrow-desc')
      expect(arrowElement.element.classList).toContain('is-active')
    })

    test('should have asc arrow active on click on desc sorted column', async () => {
      const nameCell = wrapper.findAll('.column-title').at(0)
      await nameCell.trigger('click')
      await nameCell.trigger('click')
      const arrowElement = nameCell.find('.arrow-asc')
      expect(arrowElement.element.classList).toContain('is-active')
    })

    test('should be able to sort null values', async () => {
      data = [
        {
          name: 'c test3',
          description: 'c Jest testing description',
          tags: ['apple', 'crawler', 'curiefense'],
          id: '7785d66b1f92',
          action: 'challenge',
        },
        {
          name: 'b test2',
          description: 'b Jest testing description',
          tags: ['crawler', 'curiefense'],
          id: '3c098b67018f',
          action: 'default',
        },
        {
          name: 'a test1',
          description: null,
          tags: ['curiefense'],
          id: 'e52d14612210',
          action: 'default',
        },
      ]
      await wrapper.setProps({data: data})
      const header = wrapper.findAll('.column-title').at(1)
      await header.trigger('click')
      const firstRow = wrapper.findAll('.data-row').at(0)
      const descriptionCellFirstRow = firstRow.findAll('td').at(1)
      const secondRow = wrapper.findAll('.data-row').at(1)
      const descriptionCellSecondRow = secondRow.findAll('td').at(1)
      const thirdRow = wrapper.findAll('.data-row').at(2)
      const descriptionCellThirdRow = thirdRow.findAll('td').at(1)
      expect(descriptionCellFirstRow.text()).toBe('')
      expect(descriptionCellSecondRow.text()).toBe(data[1]['description'])
      expect(descriptionCellThirdRow.text()).toBe(data[0]['description'])
    })

    test('should have normal values sorted in ascending order', async () => {
      const header = wrapper.findAll('.column-title').at(1)
      await header.trigger('click')
      const firstRow = wrapper.findAll('.data-row').at(0)
      const descriptionCellFirstRow = firstRow.findAll('td').at(1)
      const secondRow = wrapper.findAll('.data-row').at(1)
      const descriptionCellSecondRow = secondRow.findAll('td').at(1)
      const thirdRow = wrapper.findAll('.data-row').at(2)
      const descriptionCellThirdRow = thirdRow.findAll('td').at(1)
      expect(descriptionCellFirstRow.text()).toBe(sortedDataByDescriptionAsc[0]['description'])
      expect(descriptionCellSecondRow.text()).toBe(sortedDataByDescriptionAsc[1]['description'])
      expect(descriptionCellThirdRow.text()).toBe(sortedDataByDescriptionAsc[2]['description'])
    })

    test('should have normal values sorted in descending order', async () => {
      const header = wrapper.findAll('.column-title').at(1)
      await header.trigger('click')
      await header.trigger('click')
      const firstRow = wrapper.findAll('.data-row').at(0)
      const descriptionCellFirstRow = firstRow.findAll('td').at(1)
      const secondRow = wrapper.findAll('.data-row').at(1)
      const descriptionCellSecondRow = secondRow.findAll('td').at(1)
      const thirdRow = wrapper.findAll('.data-row').at(2)
      const descriptionCellThirdRow = thirdRow.findAll('td').at(1)
      expect(descriptionCellFirstRow.text()).toBe(sortedDataByDescriptionDesc[0]['description'])
      expect(descriptionCellSecondRow.text()).toBe(sortedDataByDescriptionDesc[1]['description'])
      expect(descriptionCellThirdRow.text()).toBe(sortedDataByDescriptionDesc[2]['description'])
    })

    test('should have normal values sorted in ascending order after sorted descending order', async () => {
      const header = wrapper.findAll('.column-title').at(0)
      await header.trigger('click')
      await header.trigger('click')
      const firstRow = wrapper.findAll('.data-row').at(0)
      const nameCellFirstRow = firstRow.findAll('td').at(0)
      const secondRow = wrapper.findAll('.data-row').at(1)
      const nameCellSecondRow = secondRow.findAll('td').at(0)
      const thirdRow = wrapper.findAll('.data-row').at(2)
      const nameCellThirdRow = thirdRow.findAll('td').at(0)
      expect(nameCellFirstRow.text()).toBe(sortedDataByNameAsc[0]['name'])
      expect(nameCellSecondRow.text()).toBe(sortedDataByNameAsc[1]['name'])
      expect(nameCellThirdRow.text()).toBe(sortedDataByNameAsc[2]['name'])
    })

    test('should have displayFunction values sorted in ascending order', async () => {
      const header = wrapper.findAll('.column-title').at(3)
      await header.trigger('click')
      const firstRow = wrapper.findAll('.data-row').at(0)
      const actionCellFirstRow = firstRow.findAll('td').at(3)
      const secondRow = wrapper.findAll('.data-row').at(1)
      const actionCellSecondRow = secondRow.findAll('td').at(3)
      const thirdRow = wrapper.findAll('.data-row').at(2)
      const actionCellThirdRow = thirdRow.findAll('td').at(3)
      expect(actionCellFirstRow.text()).toBe('no')
      expect(actionCellSecondRow.text()).toBe('no')
      expect(actionCellThirdRow.text()).toBe('yes')
    })

    test('should have asc arrow in new sort column when previous sort column was asc order', async () => {
      const descriptionCell = wrapper.findAll('.column-title').at(1)
      await descriptionCell.trigger('click')
      const nameCell = wrapper.findAll('.column-title').at(0)
      await nameCell.trigger('click')
      const ascArrowElement = wrapper.findAll('.arrow-asc').at(0)
      expect(ascArrowElement.element.classList).toContain('is-active')
    })

    test('should have asc arrow in new sort column when previous sort column was dsec order', async () => {
      const nameCell = wrapper.findAll('.column-title').at(0)
      await nameCell.trigger('click')
      const descriptionCell = wrapper.findAll('.column-title').at(1)
      await descriptionCell.trigger('click')
      const ascArrowElement = wrapper.findAll('.arrow-asc').at(1)
      expect(ascArrowElement.element.classList).toContain('is-active')
    })

    test('should not have arrows in column header when the column is non sortable', () => {
      const tagsCell = wrapper.findAll('.column-title').at(2)
      expect(tagsCell.element.classList).not.toContain('is-clickable')
    })

    test('should not change sorting when clicking on non sortable cell', async () => {
      const tagsCell = wrapper.findAll('.column-title').at(2)
      await tagsCell.trigger('click')
      const firstRow = wrapper.findAll('.data-row').at(0)
      const descriptionCellFirstRow = firstRow.findAll('td').at(1)
      const secondRow = wrapper.findAll('.data-row').at(1)
      const descriptionCellSecondRow = secondRow.findAll('td').at(1)
      const thirdRow = wrapper.findAll('.data-row').at(2)
      const descriptionCellThirdRow = thirdRow.findAll('td').at(1)
      expect(descriptionCellFirstRow.text()).toBe(sortedDataByDescriptionAsc[0]['description'])
      expect(descriptionCellSecondRow.text()).toBe(sortedDataByDescriptionAsc[1]['description'])
      expect(descriptionCellThirdRow.text()).toBe(sortedDataByDescriptionAsc[2]['description'])
    })

    test('should have the correct first asc arrow active on columns change', async () => {
      const secondHeader = wrapper.findAll('.column-title').at(1)
      await secondHeader.trigger('click')
      columns = [
        {
          title: 'Name',
          fieldNames: ['name'],
          isSortable: true,
          isSearchable: true,
          classes: 'width-120px',
        },
        {
          title: 'Description',
          fieldNames: ['description'],
          isSortable: true,
          isSearchable: true,
          classes: 'ellipsis',
        },
        {
          title: 'Sequences',
          fieldNames: ['sequence'],
          displayFunction: (item: FlowControlPolicy) => {
            return item?.sequence?.length?.toString()
          },
          isSortable: true,
          isSearchable: true,
          classes: 'width-100px',
        },
        {
          title: 'Timeframe',
          fieldNames: ['timeframe'],
          isSortable: true,
          isSearchable: true,
          classes: 'width-100px',
        },
        {
          title: 'Action',
          fieldNames: ['action'],
          isSortable: true,
          isSearchable: true,
          classes: 'width-80px',
        },
      ]
      await wrapper.setProps({columns: columns})
      const firstHeader = wrapper.findAll('.column-title').at(0)
      const ascArrowElement = firstHeader.find('.arrow-asc')
      expect(ascArrowElement.element.classList).toContain('is-active')
    })
  })

  describe('filtering', () => {
    test('should have non active filter button on initial load', async () => {
      const filterButton = wrapper.find('.filter-toggle')
      expect(filterButton.element.classList).not.toContain('is-active')
    })

    test('should change to active filter button after click on the filter icon', async () => {
      const filterButton = wrapper.find('.filter-toggle')
      await filterButton.trigger('click')
      expect(filterButton.element.classList).toContain('is-active')
    })

    test('should not show the search row on initial load', async () => {
      const filterRow = wrapper.find('.search-row')
      expect(filterRow.exists()).toBeFalsy()
    })

    test('should show the search row after clicking the filter button', async () => {
      const filterButton = wrapper.find('.filter-toggle')
      await filterButton.trigger('click')
      const filterRow = wrapper.findAll('.header-row').at(1)
      expect(filterRow.element.classList).toContain('search-row')
    })

    test('should hide the search row after clicking the filter button while the filter is active', async () => {
      const filterButton = wrapper.find('.filter-toggle')
      await filterButton.trigger('click')
      await filterButton.trigger('click')
      const filterRow = wrapper.find('.search-row')
      expect(filterRow.exists()).toBeFalsy()
    })

    test('should have to placeholder in filter input matching the column titles', async () => {
      const filterButton = wrapper.find('.filter-toggle')
      await filterButton.trigger('click')
      const nameInput = wrapper.findAll('.filter-input').at(0).attributes('placeholder')
      const descriptionInput = wrapper.findAll('.filter-input').at(1).attributes('placeholder')
      const tagsInput = wrapper.findAll('.filter-input').at(2).attributes('placeholder')
      expect(nameInput).toBe(columns[0].title)
      expect(descriptionInput).toBe(columns[1].title)
      expect(tagsInput).toBe(columns[2].title)
    })

    test('should filter normal table values by the filter input', async () => {
      const filterButton = wrapper.find('.filter-toggle')
      await filterButton.trigger('click')
      const nameInput = wrapper.findAll('.filter-input').at(0)
      await nameInput.trigger('click')
      await nameInput.setValue('a')
      await nameInput.trigger('keydown', {keyCode: 13})
      const firstDataCell = wrapper.findAll('.data-cell').at(0)
      const secondDataCell = wrapper.findAll('.data-cell').at(1)
      expect(firstDataCell.text()).toBe(data[2]['name'])
      expect(secondDataCell.text()).toBe(data[2]['description'])
    })

    test('should filter displayFunction table values by the filter input', async () => {
      const filterButton = wrapper.find('.filter-toggle')
      await filterButton.trigger('click')
      const tagsInput = wrapper.findAll('.filter-input').at(2)
      await tagsInput.trigger('click')
      await tagsInput.setValue('curiefense')
      await tagsInput.trigger('keydown', {keyCode: 13})
      const firstDataCell = wrapper.findAll('.data-cell').at(0)
      const secondDataCell = wrapper.findAll('.data-cell').at(1)
      expect(firstDataCell.text()).toBe(data[2]['name'])
      expect(secondDataCell.text()).toBe(data[2]['description'])
    })

    test('should be able to filter null values', async () => {
      data = [
        {
          name: 'c test3',
          description: 'c Jest testing description',
          tags: ['apple', 'crawler', 'curiefense'],
          id: '7785d66b1f92',
          action: 'challenge',
        },
        {
          name: 'b test2',
          description: 'b Jest testing description',
          tags: ['crawler', 'curiefense'],
          id: '3c098b67018f',
          action: 'default',
        },
        {
          name: 'a test1',
          description: null,
          tags: ['curiefense'],
          id: 'e52d14612210',
          action: 'default',
        },
      ]
      await wrapper.setProps({data: data})
      const filterButton = wrapper.find('.filter-toggle')
      await filterButton.trigger('click')
      const descriptionInput = wrapper.findAll('.filter-input').at(1)
      await descriptionInput.trigger('click')
      await descriptionInput.setValue('Jest')
      await descriptionInput.trigger('keydown', {keyCode: 13})
      const dataRows = wrapper.findAll('.data-row')
      const firstDataCell = dataRows.at(0).findAll('.data-cell').at(1)
      const secondDataCell = dataRows.at(1).findAll('.data-cell').at(1)
      expect(firstDataCell.text()).toBe(data[1]['description'])
      expect(secondDataCell.text()).toBe(data[0]['description'])
      expect(dataRows.length).toBe(2)
    })

    test('should return entire data set in table when emptying filters', async () => {
      const filterButton = wrapper.find('.filter-toggle')
      await filterButton.trigger('click')
      const nameInput = wrapper.findAll('.filter-input').at(0)
      await nameInput.trigger('click')
      await nameInput.setValue('')
      await nameInput.trigger('keydown', {keyCode: 13})
      const firstRow = wrapper.findAll('.data-row').at(0)
      const nameCellFirstRow = firstRow.findAll('td').at(0)
      const secondRow = wrapper.findAll('.data-row').at(1)
      const nameCellSecondRow = secondRow.findAll('td').at(0)
      const thirdRow = wrapper.findAll('.data-row').at(2)
      const nameCellThirdRow = thirdRow.findAll('td').at(0)
      expect(nameCellFirstRow.text()).toBe(sortedDataByNameAsc[0]['name'])
      expect(nameCellSecondRow.text()).toBe(sortedDataByNameAsc[1]['name'])
      expect(nameCellThirdRow.text()).toBe(sortedDataByNameAsc[2]['name'])
    })

    test('should filter table values by the multiple filter inputs at once', async () => {
      const filterButton = wrapper.find('.filter-toggle')
      await filterButton.trigger('click')
      const descriptionInput = wrapper.findAll('.filter-input').at(1)
      await descriptionInput.trigger('click')
      await descriptionInput.setValue('Jest')
      await descriptionInput.trigger('keydown', {keyCode: 13})
      const nameInput = wrapper.findAll('.filter-input').at(0)
      await nameInput.trigger('click')
      await nameInput.setValue('a')
      await nameInput.trigger('keydown', {keyCode: 13})
      const dataRow = wrapper.find('.data-row')
      const nameCellFirstRow = dataRow.findAll('td').at(0)
      expect(nameCellFirstRow.text()).toBe(sortedDataByNameAsc[0]['name'])
    })

    test('should filter table values by the multiple filter inputs at once and removing them', async () => {
      const filterButton = wrapper.find('.filter-toggle')
      await filterButton.trigger('click')
      const descriptionInput = wrapper.findAll('.filter-input').at(1)
      await descriptionInput.trigger('click')
      await descriptionInput.setValue('Jest')
      await descriptionInput.trigger('keydown', {keyCode: 13})
      const nameInput = wrapper.findAll('.filter-input').at(0)
      await nameInput.trigger('click')
      await nameInput.setValue('a')
      await descriptionInput.trigger('keydown', {keyCode: 13})
      await nameInput.trigger('click')
      await nameInput.setValue('')
      await descriptionInput.trigger('keydown', {keyCode: 13})
      const dataRow = wrapper.find('.data-row')
      const nameCellFirstRow = dataRow.findAll('td').at(0)
      expect(nameCellFirstRow.text()).toBe(sortedDataByNameAsc[0]['name'])
    })

    test('should filter table values by the correctly when adding a new filter after removing old one', async () => {
      const filterButton = wrapper.find('.filter-toggle')
      await filterButton.trigger('click')
      const descriptionInput = wrapper.findAll('.filter-input').at(1)
      await descriptionInput.trigger('click')
      await descriptionInput.setValue('Jest')
      await descriptionInput.trigger('keydown', {keyCode: 13})
      await descriptionInput.trigger('click')
      await descriptionInput.setValue('')
      const nameInput = wrapper.findAll('.filter-input').at(0)
      await nameInput.trigger('click')
      await nameInput.setValue('a')
      await descriptionInput.trigger('keydown', {keyCode: 13})
      await nameInput.trigger('click')
      await nameInput.setValue('')
      await descriptionInput.trigger('keydown', {keyCode: 13})
      const dataRow = wrapper.find('.data-row')
      const nameCellFirstRow = dataRow.findAll('td').at(0)
      expect(nameCellFirstRow.text()).toBe(sortedDataByNameAsc[0]['name'])
    })

    test('should not show search input if column is not searchable', async () => {
      const filterButton = wrapper.find('.filter-toggle')
      await filterButton.trigger('click')
      const filterRow = wrapper.find('.search-row')
      const actionFilterCell = filterRow.findAll('th').at(4)
      const filterInput = actionFilterCell.find('.filter-input')
      expect(filterInput.exists()).toBeFalsy()
    })
  })

  describe('pagination', () => {
    beforeEach(async () => {
      data = [
        {
          name: 'a test1',
          description: 'a Jest testing description',
          tags: ['curiefense'],
          isSortable: true,
          isSearchable: false,
          id: 'e52d14612210',
        },
        {
          name: 'b test2',
          description: 'b Jest testing description',
          tags: ['crawler', 'curiefense'],
          isSortable: false,
          isSearchable: true,
          id: '3c098b67018f',
        },
        {
          name: 'c test3',
          description: 'c Jest testing description',
          tags: ['apple', 'crawler', 'curiefense'],
          isSortable: true,
          isSearchable: true,
          id: '7785d66b1f92',
        },
        {
          name: 'd test1',
          description: 'd Jest testing description',
          tags: ['test1'],
          isSortable: true,
          isSearchable: false,
          id: '62abc5bb4271',
        },
        {
          name: 'e test1',
          description: 'e Jest testing description',
          tags: ['test2'],
          isSortable: true,
          isSearchable: false,
          id: 'ed0d0137287a',
        },
        {
          name: 'f test1',
          description: 'f Jest testing description',
          tags: ['test3'],
          isSortable: true,
          isSearchable: false,
          id: '5dcc3e199df6',
        },
        {
          name: 'g test1',
          description: 'g Jest testing description',
          tags: ['test4'],
          isSortable: true,
          isSearchable: false,
          id: '2b52cd8aa7fc',
        },
        {
          name: 'h test1',
          description: 'h Jest testing description',
          tags: ['test5'],
          isSortable: true,
          isSearchable: false,
          id: 'ef5b606c770b',
        },
        {
          name: 'i test1',
          description: 'i Jest testing description',
          tags: ['test6'],
          isSortable: true,
          isSearchable: false,
          id: '7908509cfea6',
        },
        {
          name: 'j test1',
          description: 'j Jest testing description',
          tags: ['test7'],
          isSortable: true,
          isSearchable: false,
          id: 'be93bed97726',
        },
        {
          name: 'k test1',
          description: 'k Jest testing description',
          tags: ['test8'],
          isSortable: true,
          isSearchable: false,
          id: '44055d6a59e5',
        },
      ]
      await wrapper.setProps({data: data})
    })

    test('should not show pagination row when the number of elements is less than 10', async () => {
      data = data.slice(0, 2)
      await wrapper.setProps({data: data})
      const pagination = wrapper.find('.pagination')
      expect(pagination.exists()).toBeFalsy()
    })

    test('should not show pagination row when the number of elements is less equal to 10', async () => {
      data = data.slice(0, 10)
      await wrapper.setProps({data: data})
      const pagination = wrapper.find('.pagination')
      expect(pagination.exists()).toBeFalsy()
    })

    test('should show pagination row when the number of elements is more than 10', () => {
      const pagination = wrapper.find('.pagination-row')
      expect(pagination.exists()).toBeTruthy()
    })

    test('should be in the first page by default on initial load', () => {
      const firstRow = wrapper.findAll('.data-row').at(0)
      const nameCell = firstRow.findAll('td').at(0)
      const currentPage = wrapper.vm.currentPage
      expect(nameCell.text()).toBe(data[0]['name'])
      expect(currentPage).toBe(1)
    })

    test('should have the next page button enabled if not in the last page', async () => {
      const nextPageButton = wrapper.find('.pagination-next')
      expect(nextPageButton.element.disabled).toBeFalsy()
    })

    test('should have the next page button disabled if in the last page', async () => {
      const nextPageButton = wrapper.find('.pagination-next')
      await nextPageButton.trigger('click')
      expect(nextPageButton.element.disabled).toBeTruthy()
    })

    test('should have the prev page button disabled if in the first page', async () => {
      const prevPageButton = wrapper.find('.pagination-previous')
      expect(prevPageButton.element.disabled).toBeTruthy()
    })

    test('should have the prev page button enabled if not in the first page', async () => {
      const nextPageButton = wrapper.find('.pagination-next')
      await nextPageButton.trigger('click')
      const prevPageButton = wrapper.find('.pagination-previous')
      expect(prevPageButton.element.disabled).toBeFalsy()
    })

    test('should have the correct data when navigating to the next page', async () => {
      const nextPageButton = wrapper.find('.pagination-next')
      await nextPageButton.trigger('click')
      const firstRow = wrapper.findAll('.data-row').at(0)
      const nameCell = firstRow.findAll('td').at(0)
      expect(nameCell.text()).toBe(data[10]['name'])
    })

    test('should have the correct data when navigating to the prev page', async () => {
      const nextPageButton = wrapper.find('.pagination-next')
      await nextPageButton.trigger('click')
      const prevPageButton = wrapper.find('.pagination-previous')
      await prevPageButton.trigger('click')
      const firstRow = wrapper.findAll('.data-row').at(0)
      const nameCell = firstRow.findAll('td').at(0)
      expect(nameCell.text()).toBe(data[0]['name'])
    })

    test('should be able to sort data across pages', async () => {
      const headerRow = wrapper.find('.header-row')
      const nameCell = headerRow.findAll('th').at(0)
      await nameCell.trigger('click')
      const dataRow = wrapper.findAll('.data-row').at(0)
      const firstNameCell = dataRow.findAll('td').at(0)
      expect(firstNameCell.text()).toBe(data[10]['name'])
    })

    test('should be able to filter data across pages', async () => {
      const filterButton = wrapper.find('.filter-toggle')
      await filterButton.trigger('click')
      const nameInput = wrapper.findAll('.filter-input').at(0)
      await nameInput.trigger('click')
      await nameInput.setValue('k')
      await nameInput.trigger('keydown', {keyCode: 13})
      const firstDataCell = wrapper.findAll('.data-cell').at(0)
      expect(firstDataCell.text()).toBe(data[10]['name'])
    })

    test('should automatically change pages if filtering results in less pages than the current page', async () => {
      const nextPageButton = wrapper.find('.pagination-next')
      await nextPageButton.trigger('click')
      const filterButton = wrapper.find('.filter-toggle')
      await filterButton.trigger('click')
      const nameInput = wrapper.findAll('.filter-input').at(0)
      await nameInput.trigger('click')
      await nameInput.setValue('a')
      await nameInput.trigger('keydown', {keyCode: 13})
      const firstDataCell = wrapper.findAll('.data-cell').at(0)
      expect(firstDataCell.text()).toBe(data[0]['name'])
    })
  })

  describe('no data', () => {
    test('should display empty table if no data exists - null value', async () => {
      await wrapper.setProps({data: null})
      const dataRow = wrapper.find('.data-row')
      expect(dataRow.exists()).toBeFalsy()
    })

    test('should display empty table if no data exists = empty array', async () => {
      await wrapper.setProps({data: []})
      const dataRow = wrapper.find('.data-row')
      expect(dataRow.exists()).toBeFalsy()
    })

    test('should not throw errors if columns change to null', async () => {
      try {
        await wrapper.setProps({columns: null})
      } catch (err) {
        expect(err).not.toBeDefined()
      }
    })

    test('should not throw errors if columns change to empty array', async () => {
      try {
        await wrapper.setProps({columns: []})
      } catch (err) {
        expect(err).not.toBeDefined()
      }
    })

    test('should not throw errors if columns change to prop with no sortable field', async () => {
      try {
        await wrapper.setProps({
          columns: [
            {
              title: 'Name',
              fieldNames: ['name'],
              isSearchable: true,
              classes: 'width-120px',
            },
            {
              title: 'Description',
              fieldNames: ['description'],
              isSearchable: true,
              classes: 'ellipsis',
            },
          ],
        })
      } catch (err) {
        expect(err).not.toBeDefined()
      }
    })
  })

  describe('buttons', () => {
    describe('menu-button', () => {
      let addEventListenerSpy
      let removeEventListenerSpy
      let anotherDiv
      beforeEach(() => {
        addEventListenerSpy = jest.spyOn(document, 'addEventListener')
        removeEventListenerSpy = jest.spyOn(document, 'removeEventListener')
        anotherDiv = document.createElement('div')
        document.body.appendChild(anotherDiv)
        wrapper = shallowMount(RbzTable, {
          props: {
            columns: columns,
            data: data,
            showMenuColumn: true,
            showFilterButton: true,
            showNewButton: true,
            showEditButton: true,
          },
          attachTo: document.body,
        })
      })

      test('should not display dropdown menu on initial load', async () => {
        const dropdown = wrapper.find('.dropdown')
        expect(dropdown.element.classList).not.toContain('is-active')
      })

      test('should display dropdown menu on menu button click', async () => {
        const menuToggleButton = wrapper.find('.menu-toggle-button')
        await menuToggleButton.trigger('click')
        const dropdown = wrapper.find('.dropdown')
        expect(dropdown.element.classList).toContain('is-active')
      })

      test('should not display dropdown menu on menu button second click', async () => {
        const menuToggleButton = wrapper.find('.menu-toggle-button')
        await menuToggleButton.trigger('click')
        await menuToggleButton.trigger('click')
        const dropdown = wrapper.find('.dropdown')
        expect(dropdown.element.classList).not.toContain('is-active')
      })

      test('should not display dropdown menu on click outside the menu', async () => {
        const menuToggleButton = wrapper.find('.menu-toggle-button')
        await menuToggleButton.trigger('click')
        anotherDiv.click()
        await nextTick()
        const dropdown = wrapper.find('.dropdown')
        expect(dropdown.element.classList).not.toContain('is-active')
      })

      test('should add new event listener on component creation', async () => {
        expect(addEventListenerSpy).toHaveBeenCalled()
        expect(addEventListenerSpy).toHaveBeenCalledWith('click', wrapper.vm.closeMenu)
      })

      test('should remove the added event listener on component destroy', async () => {
        wrapper.unmount()
        expect(removeEventListenerSpy).toHaveBeenCalled()
        expect(removeEventListenerSpy).toHaveBeenCalledWith('click', wrapper.vm.closeMenu)
      })
    })

    describe('new button', () => {
      test('should not display if showNewButton prop is false', async () => {
        await wrapper.setProps({showNewButton: false})
        const newButton = wrapper.find('.new-entity-button')
        expect(newButton.exists()).toBeFalsy()
      })

      test('should display if showNewButton prop is true', async () => {
        await wrapper.setProps({showNewButton: true})
        const newButton = wrapper.find('.new-entity-button')
        expect(newButton.exists()).toBeTruthy()
      })

      test('should emit `new-button-clicked` when clicked', async () => {
        await wrapper.setProps({showNewButton: true})
        const newButton = wrapper.find('.new-entity-button')
        await newButton.trigger('click')
        expect(wrapper.emitted('new-button-clicked')).toBeTruthy()
      })
    })

    describe('edit button', () => {
      test('should not display if showEditButton prop is false', async () => {
        await wrapper.setProps({showEditButton: false})
        const editButton = wrapper.find('.edit-entity-button')
        expect(editButton.exists()).toBeFalsy()
      })

      test('should display if showrowButton prop is true', async () => {
        await wrapper.setProps({showRowButton: true})
        const rowButton = wrapper.find('.row-entity-button')
        expect(rowButton.exists()).toBeTruthy()
      })

      test('should emit `new-button-clicked` when clicked', async () => {
        await wrapper.setProps({showRowButton: true})
        const rowButton = wrapper.find('.row-entity-button')
        await rowButton.trigger('click')
        expect(wrapper.emitted('row-button-clicked')).toBeTruthy()
        expect(wrapper.emitted('row-button-clicked')[0]).toEqual([sortedDataByNameAsc[0].id])
      })
    })
  })
})

