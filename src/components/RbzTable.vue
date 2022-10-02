<template>
  <table class="table is-bordered is-fullwidth is-size-7 rbz-table is-hoverable">
    <thead>
    <tr class="header-row" v-if="tableTitle">
      <th :colspan="columns.length"
          class="has-text-centered">
        {{ tableTitle }}
      </th>
    </tr>
    <tr class="header-row">
      <th v-for="(col, index) in columns"
          :key="index"
          class="column-header is-size-7 column-title"
          :class="`${col.classes} ${col.isSortable ? 'is-clickable' : ''}`"
          @click="sortColumn(col)">
        <div v-if="col.isSortable">
          <div class="arrow-wrapper">
                        <span class="arrow arrow-asc"
                              :class="{'is-active': sortColumnTitle === col.title && sortDir === 'asc'}"/>
          </div>
          <div class="arrow-wrapper">
                        <span class="arrow arrow-desc"
                              :class="{'is-active': sortColumnTitle === col.title && sortDir === 'desc'}"/>
          </div>
        </div>
        <span>
          {{ col.title }}
        </span>
      </th>
      <th class="column-header width-70px"
          v-if="showMenuColumn">
        <div class="field is-grouped">
          <button class="button is-size-7 filter-toggle"
                  :class="{'is-active': filtersVisible }"
                  title="Filter table data"
                  v-if="showFilterButton"
                  @click="filtersVisible = !filtersVisible">
            <span class="icon is-small">
              <i class="fas fa-filter"></i>
            </span>
          </button>
          <button class="button is-size-7 new-entity-button"
                  title="Add new"
                  v-if="showNewButton"
                  @click="newButtonClicked()">
            <span class="icon is-small">
              <i class="fas fa-plus"></i>
            </span>
          </button>
        </div>
      </th>
    </tr>
    <tr class="search-row header-row" v-if="filtersVisible">
      <th class="control has-icons-right"
          v-for="(col, index) in columns"
          :key="index">
        <div v-if="col.isSearchable">
          <input class="input is-small filter-input"
                 :title="col.title"
                 :placeholder="col.title"
                 v-model="filter[col.fieldNames.join(', ')]"
                 @change="currentPage = 1"/>
          <span class="icon is-small is-right">
            <i class="fa fa-filter" aria-hidden="true"></i>
          </span>
        </div>
      </th>
      <th v-if="showMenuColumn"></th>
    </tr>
    </thead>
    <tbody>
    <tr v-for="row in slicedDataArrayDisplay"
        :key="row.id"
        class="data-row">
      <td v-for="(col, index) in columns"
          :key="index"
          :title="row[col.title]">
        <div class="is-size-7 vertical-scroll data-cell"
             :class="col.classes">
          <span v-if="col.displayFunction"
                v-html="col.displayFunction(row)"
                :title="col.displayFunction(row)">
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
          <p class="control"
             v-if="showEditButton">
            <button title="Edit"
                    class="button is-small edit-entity-button"
                    @click="editButtonClicked(row.id)">
              <span class="icon is-small">
                <i class="fas fa-edit"></i>
              </span>
            </button>
          </p>
        </div>
      </td>
    </tr>
    <tr v-if="totalPages > 1" class="pagination-row">
      <td :colspan="columns.length + 1">
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
    showMenuColumn: Boolean,
    showFilterButton: Boolean,
    showNewButton: Boolean,
    showEditButton: Boolean,
    tableTitle: String,
    rowsPerPage: {
      type: Number,
      default: 10,
    },
  },
  watch: {
    columns: {
      handler: function(val) {
        if (val?.length) {
          const firstSortableColumn = _.find(val, (columnOptions) => {
            return columnOptions.isSortable
          })
          this.sortColumnTitle = firstSortableColumn?.title || null
          this.sortColumnDisplayFunction = firstSortableColumn?.displayFunction || null
          this.sortColumnIsNumber = firstSortableColumn?.isNumber || false
        }
      },
      immediate: true,
      deep: true,
    },
  },
  data() {
    return {
      // Filtering
      filter: {} as GenericObject,
      filtersVisible: false,

      // Sorting
      sortDir: 'asc',
      sortColumnTitle: null as ColumnOptions['title'],
      sortColumnDisplayFunction: null as ColumnOptions['displayFunction'],
      sortColumnIsNumber: false as ColumnOptions['isNumber'],

      // Pagination
      currentPage: 1,

      // Loading indicator
      loadingCounter: 0,
    }
  },
  emits: ['new-button-clicked', 'edit-button-clicked'],
  computed: {
    dataArrayDisplay() {
      if (!this.data?.length) {
        return []
      }
      const sortModifier = this.sortDir === 'asc' ? 1 : -1
      return this.data.filter((item: GenericObject) => {
        const keys = Object.keys(this.filter)
        return _.reduce(
            keys,
            (match: boolean, key: string) => {
              let getFilterValue: (item: any) => string
              const columnOption = this.columns.find((column) => {
                return column.fieldNames.join(', ') === key
              })
              if (columnOption.displayFunction) {
                getFilterValue = columnOption.displayFunction
              } else {
                getFilterValue = (item: any) => {
                  return item[key]?.toString() || ''
                }
              }
              return (match && getFilterValue(item).toLowerCase().includes(this.filter[key].toLowerCase()))
            }, true)
      }).sort((a: GenericObject, b: GenericObject) => {
        let getSortValue: (item: GenericObject) => string
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
          sortValueA = sortValueA.toLowerCase()
          sortValueB = sortValueB.toLowerCase()
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
      const sliceStart = this.rowsPerPage * (this.currentPage - 1)
      const sliceEnd = sliceStart + this.rowsPerPage
      return this.dataArrayDisplay.slice(sliceStart, sliceEnd)
    },

    totalPages() {
      return Math.ceil(this.dataArrayDisplay.length / this.rowsPerPage) || 1
    },
  },
  methods: {
    newButtonClicked() {
      this.$emit('new-button-clicked')
    },

    editButtonClicked(id: string) {
      this.$emit('edit-button-clicked', id)
    },

    sortColumn(column: ColumnOptions) {
      if (!column.isSortable) {
        return
      }
      if (column.title === this.sortColumnTitle) {
        this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc'
      } else {
        this.sortDir = 'asc'
      }
      this.sortColumnTitle = column.title
      this.sortColumnDisplayFunction = column.displayFunction
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
  },
})
</script>

<style scoped lang="scss">
.arrow-wrapper {
  float: right;
  height: 0;
}

.arrow {
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  display: inline-block;
  height: 0;
  opacity: 0.3;
  width: 0;
}

.arrow.is-active {
  opacity: 1;
}

.arrow-asc {
  border-bottom: 6px solid #000;
  border-top: 0;
  vertical-align: top;
}

.arrow-desc {
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

.filter-toggle,
.new-entity-button {
  background: transparent;
  border-color: transparent;
  cursor: pointer;
}

.filter-toggle {
  opacity: 0.3;
}

.filter-toggle.is-active {
  opacity: 1;
}

.filter-toggle:focus {
  box-shadow: none;
}

.data-cell {
  max-height: 4.5rem;
}
</style>
