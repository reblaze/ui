<template>
  <table class="table is-bordered is-fullwidth is-size-7 rbz-table is-hoverable">
    <thead>
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
      <th class="column-header width-45px is-relative has-text-centered"
          v-if="showMenuColumn">
        <div class="dropdown is-block"
             :class="{'is-active': menuVisible}">
          <div class="dropdown-trigger menu">
            <button class="button is-size-7 menu-toggle-button is-block"
                    aria-haspopup="true"
                    aria-controls="dropdown-menu"
                    :title="`${menuVisible ? 'Close' : 'Open'} menu`"
                    v-if="showFilterButton || showNewButton"
                    @click.stop="menuVisible = !menuVisible">
            <span class="icon is-small">
              <i class="fas fa-ellipsis-v"></i>
            </span>
            </button>
          </div>
          <div class="dropdown-menu"
               id="dropdown-menu"
               role="menubar">
            <div class="dropdown-content width-100px">
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
              <hr class="dropdown-divider">
              <button class="button is-size-7 new-entity-button dropdown-item"
                      title="Add new"
                      v-if="showNewButton"
                      @click.stop="newButtonClicked()">
                <span class="icon is-small">
                  <i class="fas fa-plus"></i>
                </span>
                <span>
                  Add
                </span>
              </button>
            </div>
          </div>
        </div>
      </th>
    </tr>
    <tr class="search-row header-row"
        v-if="filtersVisible">
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
      <td class="is-size-7" v-if="showMenuColumn">
        <div class="field is-grouped is-grouped-centered">
          <p class="control" v-if="showRowButton">
            <button :title="rowButtonTitle"
                    class="button is-small row-entity-button"
                    @click="rowButtonClicked(row.id)">
              <span class="icon is-small">
                <i :class="`fas ${rowButtonIcon ? rowButtonIcon : 'fa-edit'}`"></i>
              </span>
            </button>
          </p>
          <p class="control" v-if="showSecondRowButton">
            <button :title="secondRowButtonTitle"
                    class="button is-small second-row-entity-button"
                    @click="secondRowButtonClicked(row.id)">
              <span class="icon is-small">
                <i :class="`fas ${secondRowButtonIcon ? secondRowButtonIcon : 'fa-edit'}`"></i>
              </span>
            </button>
          </p>
        </div>
      </td>
    </tr>
    <tr v-if="totalPages > 1"
        class="pagination-row">
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
    showRowButton: Boolean,
    showSecondRowButton: Boolean,
    rowButtonTitle: String,
    rowButtonIcon: String,
    secondRowButtonTitle: String,
    secondRowButtonIcon: String,
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
        }
      },
      immediate: true,
      deep: true,
    },
  },
  data() {
    return {
      // Menu
      menuVisible: false,

      // Filtering
      filter: {} as GenericObject,
      filtersVisible: false,

      // Sorting
      sortDir: 'asc',
      sortColumnTitle: null as ColumnOptions['title'],
      sortColumnDisplayFunction: null as ColumnOptions['displayFunction'],

      // Pagination
      currentPage: 1,

      // Loading indicator
      loadingCounter: 0,
    }
  },
  emits: ['new-button-clicked', 'row-button-clicked', 'second-row-button-clicked'],
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
            return item[sortColumn?.fieldNames[0]]?.toString() || ''
          }
        }
        if (getSortValue(a).toLowerCase() < getSortValue(b).toLowerCase()) {
          return -1 * sortModifier
        }
        if (getSortValue(a).toLowerCase() > getSortValue(b).toLowerCase()) {
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

    rowButtonClicked(id: string) {
      this.$emit('row-button-clicked', id)
    },

    secondRowButtonClicked(id: string) {
      this.$emit('second-row-button-clicked', id)
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

.menu {
  float: right;
}

.rbz-table .menu-toggle-button {
  background: transparent;
  border-color: transparent;
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

.rbz-table .data-cell {
  max-height: 4.5rem;
}
</style>
