<template>
  <div class="rbz-table-wrapper"
       :class="{'scrollable scrollbox-shadowed': useScroll}"
       :style="useScroll ? `max-height: ${2 * rowsPerPage}rem` : ''">
    <table class="table is-bordered is-fullwidth is-size-7 rbz-table is-hoverable">
      <!--Set the columns width for table with layout fixed-->
      <colgroup>
        <col class="width-45px"
             v-if="showCheckboxColumn"/>
        <col v-for="(col, index) in columns"
             :key="index"
             :class="col.classes ? col.classes : ''"/>
        <col :class="overrideMenuColumnWidthClass ? overrideMenuColumnWidthClass : 'width-45px'"
             v-if="showMenuColumn"/>
      </colgroup>
      <thead>
      <tr class="header-row"
          v-if="tableTitle">
        <th :colspan="totalColumns"
            class="has-text-centered table-title">
          {{ tableTitle }}
        </th>
      </tr>
      <tr class="header-row">
        <th class="is-size-7 width-45px"
            v-if="showCheckboxColumn">
          <div class="field is-grouped is-grouped-centered">
            <input type="checkbox"
                   title="Select all rows"
                   ref="check-box"
                   :checked="(selectedArray.length === dataArrayDisplay.length) && !!dataArrayDisplay.length"
                   class="is-small header-checkbox"
                   @click="selectAll()"/>
          </div>
        </th>
        <th v-for="(col, index) in columns"
            :key="index"
            class="column-header is-size-7 column-title"
            :class="`
              ${col.classes ? col.classes : ''}
              ${col.isSortable ? 'is-clickable' : ''}
            `"
            @click="sortColumn(col)">
          <div v-if="col.isSortable">
            <div class="arrow-wrapper">
              <span class="arrow arrow-asc"
                    :class="{'is-active': sortColumnTitle === col.title && sortDirection === 'asc'}"/>
            </div>
            <div class="arrow-wrapper">
              <span class="arrow arrow-desc"
                    :class="{'is-active': sortColumnTitle === col.title && sortDirection === 'desc'}"/>
            </div>
          </div>
          <span>
            {{ col.title }}
          </span>
        </th>
        <th class="column-header is-relative has-text-centered"
            :class="overrideMenuColumnWidthClass ? overrideMenuColumnWidthClass : 'width-45px'"
            v-if="showMenuColumn">
          <div class="dropdown is-block is-right"
               :class="{'is-active': menuVisible}">
            <div class="dropdown-trigger">
              <button class="button is-size-7 menu-toggle-button is-block"
                      aria-haspopup="true"
                      aria-controls="dropdown-menu"
                      :title="`${menuVisible ? 'Close' : 'Open'} menu`"
                      v-if="showFilterButton || showNewButton || showCheckboxColumn"
                      @click.stop="menuVisible = !menuVisible">
              <span class="icon is-small">
                <i class="fas fa-ellipsis-v"></i>
              </span>
              </button>
            </div>
            <div class="dropdown-menu"
                 id="dropdown-menu"
                 role="menubar">
              <div class="dropdown-content py-0"
                   :class="showCheckboxColumn? 'width-130px' : 'width-100px'">
                <button class="button is-size-7 filter-toggle dropdown-item"
                        :class="{'is-active': filtersVisible }"
                        title="Filter table data"
                        v-if="showFilterButton"
                        @click.stop="filtersVisible = !filtersVisible">
                  <span class="icon is-small">
                    <i class="fas fa-filter"></i>
                  </span>
                  <span>
                    Filter
                  </span>
                </button>
                <hr class="dropdown-divider my-0">
                <button class="button is-size-7 new-entity-button dropdown-item"
                        title="Add new"
                        v-if="showNewButton"
                        @click.stop="newButtonClicked()">
                  <span class="icon is-small">
                    <i class="fas fa-plus"></i>
                  </span>
                  <span>
                    New
                  </span>
                </button>
                <slot name="menu"></slot>
              </div>
            </div>
          </div>
        </th>
      </tr>
      <tr class="search-row header-row"
          v-if="filtersVisible">
        <th class="is-size-7 width-50px"
            v-if="showCheckboxColumn">
        </th>
        <th class="control has-icons-right"
            v-for="(col, index) in columns"
            :key="index">
          <div v-if="col.isSearchable">
            <input class="input is-small filter-input"
                   :title="col.title"
                   :placeholder="col.title"
                   v-model="filter[col.title]"
                   @change="currentPage = 1"/>
            <span class="icon is-small is-right">
              <i class="fa fa-filter"
                 aria-hidden="true"></i>
            </span>
          </div>
        </th>
        <th v-if="showMenuColumn"></th>
      </tr>
      </thead>
      <tbody>
      <template v-for="(row, index) in slicedDataArrayDisplay"
                :key="index">
        <tr @click="rowClickable && rowClicked(row.id ? row.id : row.name)"
            :class="{'is-clickable': rowClickable}"
            class="data-row">
          <td class="is-size-7"
              v-if="showCheckboxColumn">
            <div class="field is-grouped is-grouped-centered">
              <input type="checkbox"
                     title="Checkbox"
                     :checked="selectedArray.includes(row.id)"
                     :id="row.id"
                     :ref="row.id"
                     class="is-small row-checkbox"
                     @change="rowSelected(row.id)"/>
            </div>
          </td>
          <td v-for="(col, index) in columns"
              :key="index"
              :title="row[col.title]"
              class="data-cell is-size-7"
              :class="`
                ${col.classes ? col.classes : ''}
                ${verticalAlignTop ? 'vertical-align-top' : 'vertical-align-middle'}
              `">
            <div class="data-cell-content"
                 :class="col.cellContentClasses">
              <span v-if="col.displayFunction"
                    v-html="col.displayFunction(row)"
                    :title="col.displayFunction(row)?.toString()">
              </span>
              <span v-else
                    :title="row[col.fieldNames[0]]">
                {{ row[col.fieldNames[0]] }}
              </span>
            </div>
          </td>
          <td class="is-size-7"
              v-if="showMenuColumn">
            <div class="field is-grouped is-grouped-centered">
              <p class="control mx-0"
                 v-if="showRowButton">
                <button :title="rowButtonTitle"
                        class="button is-small row-entity-button"
                        :class="rowButtonClass"
                        :disabled="rowButtonDisabledCallback(row)"
                        @click="rowButtonClicked(row.id)">
                  <span class="icon is-small">
                    <i :class="`fas ${rowButtonIcon ? rowButtonIcon : 'fa-edit'}`"></i>
                  </span>
                </button>
              </p>
              <p class="control mx-0"
                 v-if="showSecondRowButton">
                <button :title="secondRowButtonTitle"
                        class="button is-small row-entity-button"
                        :disabled="secondRowButtonDisabledCallback(row)"
                        :class="secondRowButtonClass"
                        @click="secondRowButtonClicked(row.id)">
                  <span class="icon is-small">
                    <i :class="`fas ${secondRowButtonIcon ? secondRowButtonIcon : 'fa-edit'}`"></i>
                  </span>
                </button>
              </p>
            </div>
          </td>
        </tr>
        <slot name="tableMenu"
              :row="row"/>
      </template>
      <tr v-if="!slicedDataArrayDisplay?.length">
        <td :colspan="totalColumns"
            class="has-text-centered table-no-data-message">
          <div v-if="loading">
            <button class="button is-outlined is-text is-small is-loading document-loading">
              Loading
            </button>
          </div>
          <div v-else>
            No data found.
          </div>
        </td>
      </tr>
      <tr v-if="totalPages > 1 && !useScroll"
          class="pagination-row">
        <td :colspan="totalColumns">
          <div class="pagination is-small">
            <button class="pagination-previous"
                    @click="prevPage"
                    :disabled="currentPage === 1">
              Previous Page
            </button>
            <button class="pagination-next"
                    @click="nextPage"
                    :disabled="currentPage === totalPages">
              Next Page
            </button>
          </div>
        </td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<script lang="ts">
import _ from 'lodash'
import {defineComponent, PropType} from 'vue'
import {ColumnOptions, GenericObject} from '@/types'

export default defineComponent({
  name: 'RbzTable',
  props: {
    columns: Array as PropType<ColumnOptions[]>,
    data: Array as PropType<GenericObject[]>,
    defaultSortColumnIndex: Number,
    defaultSortColumnDirection: String as PropType<'asc' | 'desc'>,
    showMenuColumn: Boolean,
    overrideMenuColumnWidthClass: String,
    showFilterButton: Boolean,
    showNewButton: Boolean,
    rowClickable: Boolean,
    showRowButton: Boolean,
    showSecondRowButton: Boolean,
    verticalAlignTop: Boolean,
    rowButtonTitle: String,
    rowButtonClass: String,
    rowButtonDisabledCallback: {
      type: Function,
      default: () => {
        return false
      },
    },
    rowButtonIcon: String,
    secondRowButtonTitle: String,
    secondRowButtonClass: String,
    secondRowButtonDisabledCallback: {
      type: Function,
      default: () => {
        return false
      },
    },
    secondRowButtonIcon: String,
    tableTitle: String,
    isSortByOriginalValue: Boolean,
    rowsPerPage: {
      type: Number,
      default: 10,
    },
    showCheckboxColumn: Boolean,
    useScroll: Boolean,
    loading: Boolean,
  },
  data() {
    return {
      // Menu
      menuVisible: false,

      // Filtering
      filter: {} as GenericObject,
      filtersVisible: false,

      // Sorting
      sortDirection: 'asc',
      sortColumnTitle: null as ColumnOptions['title'],
      sortColumnDisplayFunction: null as ColumnOptions['displayFunction'],
      sortColumnIsNumber: false as ColumnOptions['isNumber'],

      // Pagination
      currentPage: 1,

      // checkboxes
      selectedRow: '' as string,
      selectedArray: [] as String[],
    }
  },
  watch: {
    columns: {
      handler: function(val) {
        if (val?.length) {
          let column
          if (this.defaultSortColumnIndex) {
            column = val[this.defaultSortColumnIndex]
          } else {
            column = _.find(val, (columnOptions) => {
              return columnOptions.isSortable
            })
          }
          this.sortColumnTitle = column?.title || null
          this.sortColumnDisplayFunction = column?.displayFunction || null
          this.sortColumnIsNumber = column?.isNumber || false
          if (this.defaultSortColumnDirection) {
            this.sortDirection = this.defaultSortColumnDirection
          }
          this.filter = {}
          this.filtersVisible = false
          this.currentPage = 1
        }
      },
      immediate: true,
      deep: true,
    },
    dataArrayDisplay: {
      handler: function(val) {
        this.currentPage = 1
        const dataIdArrayDisplay = _.map(this.dataArrayDisplay, 'id')
        if (val?.length > 0 && this.selectedArray?.length > 0) {
          // filter out whatever is NOT in dataIdArrayDisplay/dataArrayDisplay
          this.selectedArray = _.filter(this.selectedArray, (selectedArrayItem) => {
            return _.includes(dataIdArrayDisplay, selectedArrayItem)
          })
          this.$emit('select-array', _.cloneDeep(this.selectedArray))
        } else {
          this.selectedArray = []
        }
      },
    },
  },
  emits: ['new-button-clicked', 'row-button-clicked', 'second-row-button-clicked', 'row-clicked', 'select-array'],
  computed: {
    dataArrayDisplay() {
      if (!this.data?.length || !Array.isArray(this.data)) {
        return []
      }
      const sortModifier = this.sortDirection === 'asc' ? 1 : -1
      return this.data.filter((item: GenericObject) => {
        const keys = Object.keys(this.filter)
        return _.reduce(
          keys,
          (match: boolean, key: string) => {
            let getFilterValue: ColumnOptions['displayFunction']
            const filterColumn = this.columns.find((column) => {
              return column.title === key
            })
            if (filterColumn.displayFunction) {
              getFilterValue = filterColumn.displayFunction
            } else {
              getFilterValue = (item: GenericObject) => {
                return item[filterColumn?.fieldNames[0]]?.toString() || ''
              }
            }
            const filterValue = getFilterValue(item)?.toString().toLowerCase() || ''
            return (match && filterValue.includes(this.filter[key].toLowerCase()))
          }, true)
      }).sort((a: GenericObject, b: GenericObject) => {
        let getSortValue: ColumnOptions['displayFunction']
        if (this.sortColumnDisplayFunction) {
          getSortValue = this.sortColumnDisplayFunction
        } else {
          getSortValue = (item: GenericObject) => {
            if (!this.columns) {
              return ''
            }
            const sortColumn = this.columns.find((column) => {
              return column.title === this.sortColumnTitle
            })
            const defaultValue = this.sortColumnIsNumber ? 0 : ''
            return item[sortColumn?.fieldNames[0]] || defaultValue
          }
        }
        let sortValueA = getSortValue(a)
        let sortValueB = getSortValue(b)
        if (!this.sortColumnIsNumber) {
          const sortValueALowerCase = sortValueA.toString().toLowerCase()
          const sortValueBLowerCase = sortValueB.toString().toLowerCase()
          // only ignore case if the values are different from one another
          if (!_.isEqual(sortValueALowerCase, sortValueBLowerCase)) {
            sortValueA = sortValueALowerCase
            sortValueB = sortValueBLowerCase
          }
        }
        if (sortValueA < sortValueB) {
          return -1 * sortModifier
        }
        if (sortValueA > sortValueB) {
          return 1 * sortModifier
        }
        return 0
      })
    },

    slicedDataArrayDisplay(): GenericObject[] {
      if (!this.dataArrayDisplay.length) {
        return []
      }
      if (this.useScroll) {
        return this.dataArrayDisplay
      }
      const sliceStart = this.rowsPerPage * (this.currentPage - 1)
      const sliceEnd = sliceStart + this.rowsPerPage
      return this.dataArrayDisplay.slice(sliceStart, sliceEnd)
    },

    totalPages(): number {
      return Math.ceil(this.dataArrayDisplay.length / this.rowsPerPage) || 1
    },

    totalColumns(): number {
      const extraColumns = (this.showMenuColumn ? 1 : 0) + (this.showCheckboxColumn ? 1 : 0)
      return this.columns.length + extraColumns
    },
  },
  methods: {

    newButtonClicked() {
      this.$emit('new-button-clicked')
    },

    rowButtonClicked(id: string) {
      this.$emit('row-button-clicked', id)
    },

    secondRowButtonClicked(id: string) {
      this.$emit('second-row-button-clicked', id)
    },

    rowClicked(id: string) {
      this.$emit('row-clicked', id)
    },

    rowSelected(id: string) {
      const selectedIndex = this.selectedArray.findIndex((row) => row === id)
      if (selectedIndex == -1) {
        this.selectedArray.push(id)
        this.$refs['check-box'].checked = false
      } else {
        this.selectedArray.splice(selectedIndex, 1)
        this.$refs['check-box'].checked = false
      }
      this.$emit('select-array', _.cloneDeep(this.selectedArray))
    },

    selectAll() {
      const currentCheckboxes = _.map(this.dataArrayDisplay, 'id')
      if (this.$refs['check-box'].checked) {
        this.selectedArray = _.cloneDeep(currentCheckboxes)
      } else {
        this.selectedArray = []
      }
      this.$emit('select-array', _.cloneDeep(this.selectedArray))
    },

    sortColumn(column: ColumnOptions) {
      if (!column.isSortable) {
        return
      }
      if (column.title === this.sortColumnTitle) {
        this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc'
      } else {
        this.sortDirection = 'asc'
      }
      this.sortColumnTitle = column.title

      this.sortColumnDisplayFunction = (this.isSortByOriginalValue) ? null :
        column.displayFunction

      this.sortColumnIsNumber = column.isNumber
    },

    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--
      }
    },

    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++
      }
    },

    closeMenu() {
      this.menuVisible = false
    },
  },
  beforeMount() {
    document.addEventListener('click', this.closeMenu)
  },
  beforeUnmount() {
    document.removeEventListener('click', this.closeMenu)
  },
})
</script>

<style scoped
       lang="scss">
.scrollable {
  border-collapse: separate;
  overflow-x: hidden;
  overflow-y: auto;
}

.scrollable thead {
  position: sticky;
  top: 0;
}

.rbz-table {
  border-collapse: separate;
  table-layout: fixed;
}

.rbz-table .arrow-wrapper {
  float: right;
  height: 0;
}

.rbz-table .arrow {
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  display: inline-block;
  height: 0;
  opacity: 0.3;
  width: 0;
}

.rbz-table .arrow.is-active {
  opacity: 1;
}

.rbz-table .arrow-asc {
  border-bottom: 6px solid #000;
  border-top: 0;
  vertical-align: top;
}

.rbz-table .arrow-desc {
  border-bottom: 0;
  border-top: 6px solid #000;
  vertical-align: bottom;
}

.rbz-table.table.is-hoverable tbody tr:hover {
  background-color: #e8e8e8;
}

.rbz-table th {
  background-color: #eef6fc;
  padding: 0.25em 0.5em;
  vertical-align: baseline;
}

.rbz-table .column-title {
  box-sizing: content-box;
}

.rbz-table .search-row th {
  padding: 0;
}

.rbz-table .search-row .filter-input {
  background-color: transparent;
  border: 0;
}

.rbz-table td {
  padding: 0.5em;
}

.rbz-table .menu {
  display: inline-flex;
  justify-content: flex-end;
  width: 100%;
}

.rbz-table .menu-toggle-button {
  background: transparent;
  border-color: transparent;
  margin: auto;
}

.rbz-table .dropdown-menu {
  min-width: 0;
}

.rbz-table .menu-toggle-button:focus {
  box-shadow: none;
}

.rbz-table .filter-toggle,
.rbz-table .new-entity-button,
.rbz-table .row-entity-button,
.rbz-table .second-row-entity-button {
  background: transparent;
  border-color: transparent;
  color: initial;
}

.rbz-table .filter-toggle {
  opacity: 0.3;
}

.rbz-table .filter-toggle.is-active {
  opacity: 1;
}

.rbz-table .filter-toggle:focus {
  box-shadow: none;
}

.rbz-table .data-cell.vertical-align-middle {
  vertical-align: middle;
}

.rbz-table .data-cell.vertical-align-top {
  vertical-align: top;
}

.rbz-table .data-cell-content {
  max-height: 1.75rem;
}
</style>
