<template>
<div class='card'>
    <div class='card-content'>
        <div class='media'>
            <div class='media-content'>
                <div class='field is-grouped'>
                    <div class='control' v-if='branchNames.length'>
                        <div class='select is-small'>
                            <!--TODO: add to input below   @change='switchBranch()' -->
                            <select v-model='selectedBranch' title='Switch branch' class='branch-selection'>
                                <option v-for='name in branchNames' :key='name' :value='name'>
                                    {{ name }}
                                </option>
                            </select>
                        </div>
                    </div>
                    <p class='control'>
                        <button class='button is-small download-doc-button' :class='{"is-loading":isDownloadLoading}' title='Download document' data-qa='download-document'>
                            <span class='icon is-small'>
                                <i class='fas fa-download'></i>
                            </span>
                        </button>
                    </p>
                </div>
            </div>
        </div>
        <hr />
        <table class='table is-bordered is-fullwidth is-size-7 document-list-table is-hoverable vectors-table'>
            <thead>
                <tr>
                    <th v-for='col in columns'
                      :key='col.fieldName'
                      class='column-header is-size-7 is-8'
                      :class='{"sort-column":col.isSortable}'
                      @click='sortColumn(col.fieldName)'>
                        <div v-if='col.isSortable'>
                            <div class='arrow-wrapper'>
                                <span class='arrow arrow-asc' :class='{ active: sortField === col.fieldName && sortDir === "asc", }' />
                            </div>
                            <div class='arrow-wrapper'>
                                <span class='arrow arrow-desc' :class='{active: sortField === col.fieldName && sortDir === "desc", }' />
                            </div>
                        </div>
                        {{ col.columnTitle }}
                    </th>
                    <th class='column-header is-2'>
                        <div class='field is-grouped is-grouped-centered'>
                            <p class='control'>
                                <button class='button is-size-7' title='Add new document'>
                                    <!-- TODO:Should add to the button :disabled='!selectedBranch || !selectedDocType' :class='{'is-loading': isNewLoading}' @click='addNewDoc()'-->
                                    <span class='icon is-small'>
                                        <i class='fas fa-plus'></i>
                                    </span>
                                </button>
                            </p>
                            <p class='control'>
                                <button class='button is-size-7 filter-toggle' :class='{"is-active": filtervisible }' title='Filter columns and rows' @click='filtervisible = !filtervisible'>
                                    <span class='icon is-small'>
                                        <i class='fas fa-filter'></i>
                                    </span>
                                </button>
                            </p>
                        </div>
                    </th>
                </tr>

                <tr class='search-row' v-if='filtervisible'>
                    <th class='control has-icons-right' v-for='col in columns' :key='col.columnTitle'>
                        <div v-if='col.isSearchable'>
                            <input class='input is-small filter-input search-input-vectors-score' :title='col.columnTitle' :placeholder='col.columnTitle' v-model='filter[col.fieldName]' @change='updateDataDisplay()' />
                            <span class='icon is-small is-right'>
                                <i class='fa fa-filter' aria-hidden='true'></i>
                            </span>
                        </div>
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr v-for='row in getSlicedDataArrayDisplay(rows, currentPage)' :key='row.id'>
                    <td v-for='col in columns' :key='col.fieldName' class='is-size-7'>
                        {{ row[col.fieldName] }}
                    </td>
                    <td class='is-size-7'>
                        <!-- TODO: Need to add the correct icon to linking there. -->
                        <div class='field is-grouped is-grouped-centered'>
                            <button title='Edit' class='button is-small'>
                                <span class='icon is-small'>
                                    <i class='fas fa-edit'></i>
                                </span>
                            </button>
                        </div>
                    </td>
                </tr>
                <tr v-if='totalPages > 1'>
                    <td :colspan='columns.length+1'>
                        <div class='pagination is-small'>
                            <button class='pagination-previous' @click='prevPage' :disabled='currentPage === 1'>
                                Previous Page
                            </button>
                            <button class='pagination-next' @click='nextPage' :disabled='currentPage === totalPages'>
                                Next Page
                            </button>
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</div>
</template>

<script lang="ts">
import _ from 'lodash'
import {
  defineComponent,
} from 'vue'

interface HeaderColumns {
    columnTitle: string
    fieldName: string
    isSortable: boolean
    isSearchable: boolean
}

/*  interface DummyArray {
  id: number
  name: string
  url: string
  ip: string
} */

type GenericObject = {
    [key: string]: any
}

const headerColumns: HeaderColumns[] = [{
  columnTitle: 'ID',
  fieldName: 'id',
  isSortable: true,
  isSearchable: true,
},
{
  columnTitle: 'Name',
  fieldName: 'name',
  isSortable: true,
  isSearchable: true,
},
{
  columnTitle: 'URL',
  fieldName: 'url',
  isSortable: false,
  isSearchable: true,
},
{
  columnTitle: 'IP',
  fieldName: 'ip',
  isSortable: true,
  isSearchable: false,
},
]
const dummyArray: GenericObject[] = [{
  id: 1,
  name: 'Jonny1',
  url: 'http://localhost/1',
  ip: '127.0.0.1',
},
{
  id: 7,
  name: 'Jonny4',
  url: 'http://localhost/4',
  ip: '127.0.0.4',
},
{
  id: 8,
  name: 'Jonny4',
  url: 'http://localhost/4',
  ip: '127.0.0.4',
},
{
  id: 9,
  name: 'Jonny4',
  url: 'http://localhost/4',
  ip: '127.0.0.4',
},
{
  id: 4,
  name: 'Jonny4',
  url: 'http://localhost/4',
  ip: '127.0.0.4',
},
{
  id: 6,
  name: 'Jonny6',
  url: 'http://localhost/6',
  ip: '127.0.0.6',
},
{
  id: 3,
  name: 'Jonny3',
  url: 'http://localhost/3',
  ip: '127.0.0.3',
},
{
  id: 2,
  name: 'Jonny2',
  url: 'http://localhost/2',
  ip: '127.0.0.2',
},
{
  id: 5,
  name: 'Jonny5',
  url: 'http://localhost/5',
  ip: '127.0.0.5',
},
]

const branchNames = ['main', 'avihay-branch']

export default defineComponent({
  data() {
    return {
      columns: [...headerColumns],
      rows: [...dummyArray],
      branchNames: [...branchNames],
      // General
      rowsPerPage: 10, // TODO:Need to change this to be an generic number ?
      currentPage: 1,
      totalPages: 1,
      selectedBranch: 'main',
      loadingDocCounter: 0,
      isDownloadLoading: false,
      selectedDocID: null,
      docs: [] as GenericObject[],
      data: {}, // TODO: We need it?
      filter: {} as GenericObject,
      dataDisplay: [] as GenericObject[],
      filtervisible: false,
      sortField: '',
      sortDir: 'asc',
    }
  },
  methods: {
    getDataArrayDisplay() {
      if (!dummyArray?.length) {
        return []
      }
      const sortModifier = this.sortDir === 'asc' ? 1 : -1
      return dummyArray
        .filter((item: any) => {
          const keys = Object.keys(this.filter)
          if (!keys) {
            return item
          }
          return _.reduce(
            keys,
            (match: any, key: any) => {
              return (
                match && item[key]
                  .toString()
                  .toLowerCase()
                  .includes(this.filter[key].toLowerCase())
              )
            }, true)
        })
        .sort((a: any, b: any) => {
          if (a[this.sortField] < b[this.sortField]) {
            return -1 * sortModifier
          }
          if (a[this.sortField] > b[this.sortField]) {
            return 1 * sortModifier
          }
          return 0
        })
    },

    getSlicedDataArrayDisplay(dataArray: any, currentPage: any): any[] {
      if (!dataArray?.length) {
        return []
      }
      const sliceStart = this.rowsPerPage * (currentPage - 1)
      const sliceEnd = sliceStart + this.rowsPerPage
      return dataArray.slice(sliceStart, sliceEnd)
    },

    /* TODO: We need onLongCellClick function below?*/

    /* onLongCellClick(event: any) {
      event.currentTarget.classList.toggle('long-cell-expanded')
    },*/

    sortColumn(filter: any) {
      if (filter === this.sortField) {
        this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc'
      } else {
        this.sortDir = 'asc'
      }
      this.sortField = filter
      this.updateDataDisplay()
    },

    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--
        this.updateDataDisplay()
      }
    },

    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++
        this.updateDataDisplay()
      }
    },

    updateDataDisplay() {
      this.rows = this.getDataArrayDisplay()
      this.totalPages = Math.ceil(this.rows.length / this.rowsPerPage) || 1
      if (this.currentPage > this.totalPages) {
        this.currentPage = this.totalPages
      }
    },

    /* TODO: need to check what to do there with Aviv*/
    async switchBranch() {
      this.setLoadingDocStatus(true)
      /* Utils.toast(`Switched to branch '${this.selectedBranch}'.`, 'is-info')
      await this.loadDocs(this.selectedDocType, true)
      await this.loadReferencedDocsIDs()
      this.goToRoute()*/
      this.setLoadingDocStatus(false)
    },

    /* TODO: why do i need to start the circle with counter and witout onli boolean var? */
    setLoadingDocStatus(isLoading: boolean) {
      if (isLoading) {
        this.loadingDocCounter++
      } else {
        this.loadingDocCounter--
      }
    },
  },
  /* TODO: How the download file icon is uses this methods
    computed:{
      selectedDoc: {
        get(): Document {
          return this.docs?.[this.selectedDocIndex]
        },
        set(newDoc: any): void {
          this.docs[this.selectedDocIndex] = newDoc
        },
      },
      selectedDocIndex(): number {
        if (this.selectedDocID) {
          return _.findIndex(this.docs, (doc:GenericObject) => {
            return doc.id === this.selectedDocID
          })
        }
        return 0
      },
    },
    */
  mounted() {
    this.updateDataDisplay()
  },
})
</script>

<style>

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

.arrow.active {
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

.vectors-table.table.is-hoverable tbody tr:hover,
.document-list-table.table.is-hoverable.is-striped tbody tr:hover {
  background-color: #e8e8e8;
}

.document-list-table th {
  background-color: #eef6fc;
  padding: 0.25em 0.5em;
}

.document-list-table .search-row th {
  padding: 0;
}

.document-list-table .search-row .filter-input {
  background-color: transparent;
  border: 0;
}

.document-list-table td {
  padding: 0.5em;
}

.document-list-table .row-selected {
  background-color: #f5f5f5;
}

/*td.table-wrapper {
  padding: 1rem 1rem 2rem;
}*/

.long-cell div {
  /*box-orient: vertical;*/
  display: box;
  -webkit-line-clamp: 3;
  overflow: hidden;
  text-overflow: ellipsis;
}

.long-cell-expanded div {
  display: block;
}

.filter-toggle {
  cursor: pointer;
  opacity: 0.3;
}

.filter-toggle.is-active {
  opacity: 1;
}

.sort-column {
  cursor: pointer;
}


.vector-class {
  cursor: help;
}
</style>
