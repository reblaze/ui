<template>
  <div class="card">
    <div class="card-content">
      <div class="media">
        <div class="media-content">
          <div class="field is-grouped">
            <div class="control"
                 v-if="branchNames.length">
              <div class="select is-small">
                <select v-model="selectedBranch"
                        title="Switch branch"
                        class="branch-selection"
                        @change="switchBranch()">
                  <option v-for="name in branchNames"
                          :key="name"
                          :value="name">
                    {{ name }}
                  </option>
                </select>
              </div>
            </div>
            <p class="control">
              <button class="button is-small download-doc-button"
                      :class="{'is-loading':isDownloadLoading}"
                      @click="downloadDoc()"
                      title="Download document"
                      data-qa="download-document">
                <span class="icon is-small">
                    <i class="fas fa-download"></i>
                </span>
              </button>
            </p>
          </div>
        </div>
      </div>

      <hr/>

      <div class="content document-list-wrapper"
           v-show="!loadingDocCounter">
        <div class="card">
          <div class="card-content">
            <div class="content">
              <table class="table is-bordered is-fullwidth is-size-7 document-list-table is-hoverable vectors-table">
                <thead>
                <tr class="header-row">
                  <th v-for="col in columns"
                      :key="col.fieldNames.join(', ')"
                      class="column-header is-size-7 column-title"
                      :class="`${col.classes}${col.isSortable ? ' is-clickable' : null}`"
                      @click="sortColumn(col)">
                    <div v-if="col.isSortable">
                      <div class="arrow-wrapper">
                        <span class="arrow arrow-asc"
                              :class="{ active: sortField === col.fieldNames && sortDir === 'asc', }"/>
                      </div>
                      <div class="arrow-wrapper">
                        <span class="arrow arrow-desc"
                              :class="{active: sortField === col.fieldNames && sortDir === 'desc', }"/>
                      </div>
                    </div>
                    {{ col.columnTitle }}
                  </th>
                  <th class="column-header width-80px">
                    <div class="field is-grouped is-grouped-centered">
                      <p class="control">
                        <button class="button is-size-7 new-document-button"
                                title="Add new document"
                                :disabled="!selectedBranch || !selectedDocType"
                                :class="{'is-loading': isNewLoading}"
                                @click="addNewDoc()">
                          <span class="icon is-small">
                    <i class="fas fa-plus"></i>
                  </span>
                        </button>
                      </p>
                      <p class="control">
                        <button class="button is-size-7 filter-toggle"
                                :class="{'is-active': filtersVisible }"
                                title="Filter table data"
                                @click="filtersVisible = !filtersVisible">
                  <span class="icon is-small">
                      <i class="fas fa-filter"></i>
                  </span>
                        </button>
                      </p>
                    </div>
                  </th>
                </tr>
                <tr class="search-row header-row" v-if="filtersVisible">
                  <th class="control has-icons-right searchable"
                      v-for="col in columns"
                      :key="col.columnTitle">
                    <div v-if="col.isSearchable">
                      <input class="input is-small filter-input"
                             :title="col.columnTitle"
                             :placeholder="col.columnTitle"
                             v-model="filter[col.fieldNames.join(', ')]"
                             @change="updateDataDisplay()"/>
                      <span class="icon is-small is-right">
                        <i class="fa fa-filter" aria-hidden="true"></i>
                      </span>
                    </div>
                  </th>
                  <th class="unsearchable"></th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="row in getSlicedDataArrayDisplay(docsDisplayData, currentPage)"
                    :key="row.id"
                    class="data-row">
                  <td v-for="col in columns"
                      :key="col.fieldNames.join(', ')"
                      :title="row[col.columnTitle]">
                    <div class="is-size-7 vertical-scroll data-cell"
                         :class="col.classes">
                      {{ col.displayFunction ? col.displayFunction(row) : row[col.fieldNames[0]] }}
                    </div>
                  </td>
                  <td class="is-size-7">
                    <div class="field is-grouped is-grouped-centered">
                      <button title="Edit"
                              class="button is-small edit-doc-button"
                              @click="editDoc(row.id)">
                <span class="icon is-small">
                  <i class="fas fa-edit"></i>
                </span>
                      </button>
                    </div>
                  </td>
                </tr>
                <tr v-if="totalPages > 1" class="pagination-row">
                  <td :colspan="columns.length+1" >
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
              <span class="is-family-monospace has-text-grey-lighter">
                {{ documentListAPIPath }}
              </span>
            </div>
          </div>
        </div>
        <hr/>
        <git-history :gitLog="gitLog"
                     :apiPath="gitAPIPath"
                     :loading="isGitLogLoading"
                     @restore-version="restoreGitVersion"></git-history>
      </div>

      <div class="content no-data-wrapper"
           v-if="loadingDocCounter || !selectedBranch || !selectedDocType">
        <div v-if="loadingDocCounter > 0">
          <button class="button is-outlined is-text is-small is-loading document-loading">
            Loading
          </button>
        </div>
        <div v-else
             class="no-data-message">
          No data found!
          <div>
            <!--display correct message by priority (Branch -> Document type)-->
            <span v-if="!branchNames.includes(selectedBranch)">
              Missing branch. To be redirected to Version Control page where you will be able to create a new one, click
              <a title="Add new"
                 class="version-control-referral-button"
                 @click="referToVersionControl()">
                here
              </a>
            </span>
            <span v-else-if="!Object.keys(componentsMap).includes(selectedDocType)">
              Missing document type. Please select one from the menu to the left
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import _ from 'lodash'
import DatasetsUtils from '@/assets/DatasetsUtils'
import RequestsUtils from '@/assets/RequestsUtils'
import Utils from '@/assets/Utils'
import ACLEditor from '@/doc-editors/ACLEditor.vue'
import ContentFilterEditor from '@/doc-editors/ContentFilterProfileEditor.vue'
import ContentFilterRulesEditor from '@/doc-editors/ContentFilterRulesEditor.vue'
import SecurityPoliciesEditor from '@/doc-editors/SecurityPoliciesEditor.vue'
import RateLimitsEditor from '@/doc-editors/RateLimitsEditor.vue'
import GlobalFilterListEditor from '@/doc-editors/GlobalFilterListEditor.vue'
import FlowControlPolicyEditor from '@/doc-editors/FlowControlPolicyEditor.vue'
import GitHistory from '@/components/GitHistory.vue'
import {defineComponent, shallowRef} from 'vue'
import {ColumnOptions, Commit, Document, DocumentType, GenericObject} from '@/types'
import {COLUMN_OPTIONS_MAP} from './documentListConst'
import {AxiosResponse} from 'axios'

export default defineComponent({
  watch: {
    $route: {
      handler: async function(val) {
        if (val?.name?.includes('DocumentList')) {
          this.setLoadingDocStatus(true)
          await this.setSelectedDataFromRouteParams()
          this.setLoadingDocStatus(false)
        }
      },
      deep: true,
    },
  },
  components: {
    GitHistory,
  },
  data() {
    return {
      columns: [] as ColumnOptions[],
      currentPage: 1,
      configs: [],
      filter: {} as GenericObject,
      filtersVisible: false,
      gitLog: [],
      rowsPerPage: 10,
      sortField: [] as ColumnOptions['fieldNames'],
      sortFieldDisplayFunction: null as ColumnOptions['displayFunction'],
      sortDir: 'asc',
      titles: DatasetsUtils.titles,
      totalPages: 1,

      selectedBranch: null,
      selectedDocType: null as DocumentType,
      // Documents
      docs: [] as GenericObject[],
      docsDisplayData: [] as GenericObject[],
      docIdNames: [] as [Document['id'], Document['name']][],

      // To prevent deletion of docs referenced by Security Policies
      referencedIDsACL: [],
      referencedIDsContentFilter: [],
      referencedIDsLimits: [],

      // Loading indicators
      isNewLoading: false,
      isDownloadLoading: false,
      isGitLogLoading: false,
      loadingDocCounter: 0,

      apiRoot: RequestsUtils.confAPIRoot,
      apiVersion: RequestsUtils.confAPIVersion,
      componentsMap: {
        'globalfilters': shallowRef({component: GlobalFilterListEditor}),
        'flowcontrol': shallowRef({component: FlowControlPolicyEditor}),
        'securitypolicies': shallowRef({component: SecurityPoliciesEditor}),
        'ratelimits': shallowRef({component: RateLimitsEditor}),
        'aclprofiles': shallowRef({component: ACLEditor}),
        'contentfilterprofiles': shallowRef({component: ContentFilterEditor}),
        'contentfilterrules': shallowRef({component: ContentFilterRulesEditor}),
      },
    }
  },
  computed: {
    documentListAPIPath(): string {
      const apiPrefix = `${this.apiRoot}/${this.apiVersion}`
      return `${apiPrefix}/configs/${this.selectedBranch}/d/${this.selectedDocType}/`
    },

    gitAPIPath(): string {
      const apiPrefix = `${this.apiRoot}/${this.apiVersion}`
      return `${apiPrefix}/configs/${this.selectedBranch}/d/${this.selectedDocType}/v/`
    },

    branchNames(): string[] {
      return this.configs?.length ? _.sortBy(_.map(this.configs, 'id')) : []
    },

  },
  methods: {
    getDataArrayDisplay() {
      if (!this.docs?.length) {
        return []
      }
      const sortModifier = this.sortDir === 'asc' ? 1 : -1
      return this.docs.filter((item: any) => {
        const keys = Object.keys(this.filter)
        if (!keys) {
          return item
        }
        return _.reduce(
            keys,
            (match: any, key: any) => {
              let getFilterValue: (item: any) => string
              const columnOption = this.columns.find((column) => {
                return column.fieldNames.join(', ') === key
              })
              if (columnOption?.displayFunction) {
                getFilterValue = columnOption?.displayFunction
              } else {
                getFilterValue = (item: any) => {
                  return item[key]?.toString() || ''
                }
              }
              return (match && getFilterValue(item).toLowerCase().includes(this.filter[key].toLowerCase()))
            }, true)
      }).sort((a: any, b: any) => {
        let getSortValue: (item: any) => string
        if (this.sortFieldDisplayFunction) {
          getSortValue = this.sortFieldDisplayFunction
        } else {
          getSortValue = (item: any) => {
            return item[this.sortField[0]]?.toString() || ''
          }
        }
        if (getSortValue(a)?.toLowerCase() < getSortValue(b)?.toLowerCase()) {
          return -1 * sortModifier
        }
        if (getSortValue(a)?.toLowerCase() > getSortValue(b)?.toLowerCase()) {
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

    sortColumn(column: ColumnOptions) {
      if (!column.isSortable) {
        return
      }
      if (column.fieldNames === this.sortField) {
        this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc'
      } else {
        this.sortDir = 'asc'
      }
      this.sortField = column.fieldNames
      this.sortFieldDisplayFunction = column.displayFunction
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
      this.docsDisplayData = this.getDataArrayDisplay()
      this.totalPages = Math.ceil(this.docsDisplayData.length / this.rowsPerPage) || 1
      if (this.currentPage > this.totalPages) {
        this.currentPage = this.totalPages
      }
    },

    goToRoute() {
      const currentRoute = `/list/${this.selectedBranch}/${this.selectedDocType}`
      if (this.$route.path !== currentRoute) {
        console.log('Switching document, new document path: ' + currentRoute)
        this.$router.push(currentRoute)
      }
    },

    async setSelectedDataFromRouteParams() {
      this.setLoadingDocStatus(true)
      const branchNameFromRoute = this.$route.params.branch === 'undefined' ? null : this.$route.params.branch
      this.selectedBranch = branchNameFromRoute || this.branchNames[0]
      const prevDocType = this.selectedDocType
      this.selectedDocType = (this.$route.params.doc_type || Object.keys(this.componentsMap)[0]) as DocumentType
      this.columns = COLUMN_OPTIONS_MAP[this.selectedDocType]
      this.sortField = this.columns[0]?.fieldNames || []
      if (!prevDocType || prevDocType !== this.selectedDocType) {
        await this.loadDocs(this.selectedDocType)
      }
      this.setLoadingDocStatus(false)
      this.loadGitLog()
      this.goToRoute()
    },

    newDoc(): Document {
      const factory = DatasetsUtils.newDocEntryFactory[this.selectedDocType]
      return factory && factory()
    },

    async loadConfigs() {
      // store configs
      let configs
      try {
        const response = await RequestsUtils.sendRequest({methodName: 'GET', url: 'configs/'})
        configs = response.data
      } catch (err) {
        console.log('Error while attempting to get configs')
        console.log(err)
      }
      console.log('loaded configs: ', configs)
      this.configs = configs
    },

    async loadDocs(doctype: DocumentType) {
      this.isDownloadLoading = true
      const branch = this.selectedBranch
      const fieldNames = _.flatMap(this.columns, 'fieldNames')
      const response = await RequestsUtils.sendRequest({
        methodName: 'GET',
        url: `configs/${branch}/d/${doctype}/`,
        data: {headers: {'x-fields': `id, ${fieldNames.join(', ')}`}},
        onFail: () => {
          console.log('Error while attempting to load documents')
          this.docs = []
          this.isDownloadLoading = false
        },
      })
      this.docs = response?.data || []
      this.docsDisplayData = this.docs
      this.isDownloadLoading = false
      this.updateDataDisplay()
      this.loadGitLog()
    },

    async switchBranch() {
      this.setLoadingDocStatus(true)
      Utils.toast(`Switched to branch '${this.selectedBranch}'.`, 'is-info')
      await this.loadDocs(this.selectedDocType)
      this.goToRoute()
      this.setLoadingDocStatus(false)
    },

    downloadDoc() {
      if (!this.isDownloadLoading) {
        Utils.downloadFile(this.selectedDocType, 'json', this.docs)
      }
    },

    editDoc(id: string) {
      const routeToDoc = `/config/${this.selectedBranch}/${this.selectedDocType}/${id}`
      this.$router.push(routeToDoc)
    },


    // Collect every request to display a loading indicator
    // The loading indicator will be displayed as long as at least one request is still active (counter > 0)
    setLoadingDocStatus(isLoading: boolean) {
      if (isLoading) {
        this.loadingDocCounter++
      } else {
        this.loadingDocCounter--
      }
    },

    async addNewDoc() {
      this.setLoadingDocStatus(true)
      this.isNewLoading = true
      const docToAdd = this.newDoc()
      const docTypeText = this.titles[this.selectedDocType + '-singular']
      const successMessage = `New ${docTypeText} was created.`
      const failureMessage = `Failed while attempting to create the new ${docTypeText}.`
      const url = `configs/${this.selectedBranch}/d/${this.selectedDocType}/e/`
      const data = docToAdd
      await RequestsUtils.sendRequest({methodName: 'POST', url, data, successMessage, failureMessage}).then(() => {
        this.editDoc(docToAdd.id)
      })
      this.isNewLoading = false
      this.setLoadingDocStatus(false)
    },

    async loadReferencedDocsIDs() {
      const response = await RequestsUtils.sendRequest({
        methodName: 'GET',
        url: `configs/${this.selectedBranch}/d/securitypolicies/`,
      })
      const docs = response?.data
      const referencedACL: string[] = []
      const referencedContentFilter: string[] = []
      const referencedLimit: string[] = []
      _.forEach(docs, (doc) => {
        _.forEach(doc.map, (mapEntry) => {
          referencedACL.push(mapEntry['acl_profile'])
          referencedContentFilter.push(mapEntry['content_filter_profile'])
          referencedLimit.push(mapEntry['limit_ids'])
        })
      })
      this.referencedIDsACL = _.uniq(referencedACL)
      this.referencedIDsContentFilter = _.uniq(referencedContentFilter)
      this.referencedIDsLimits = _.uniq(_.flatten(referencedLimit))
    },


    referToVersionControl() {
      this.$router.push('/versioncontrol')
    },

    loadGitLog(interaction?: boolean) {
      this.isGitLogLoading = true
      const config = this.selectedBranch
      const document = this.selectedDocType
      const url = `configs/${config}/d/${document}/v/`
      if (config && document) {
        RequestsUtils.sendRequest({methodName: 'GET', url}).then((response: AxiosResponse<Commit[]>) => {
          this.gitLog = response?.data
          if (interaction) {
            this.loadConfigs()
          }
          this.isGitLogLoading = false
        })
      }
    },

    async restoreGitVersion(gitVersion: Commit) {
      const branch = this.selectedBranch
      const doctype: DocumentType = this.selectedDocType
      const docTitle = this.titles[doctype]
      const versionId = gitVersion.version
      const urlTrail = `configs/${branch}/d/${doctype}/v/${versionId}/`

      await RequestsUtils.sendRequest({
        methodName: 'PUT',
        url: `${urlTrail}revert/`,
        successMessage: `Document [${docTitle}] restored to version [${versionId}]!`,
        failureMessage: `Failed restoring document [${docTitle}] to version [${versionId}]!`,
      })
      await this.loadDocs(this.selectedDocType)
    },
  },
  mounted() {
    this.setLoadingDocStatus(true)
    this.updateDataDisplay()
    this.setLoadingDocStatus(false)
  },
  async created() {
    this.setLoadingDocStatus(true)
    await this.loadConfigs()
    this.setSelectedDataFromRouteParams()
    this.setLoadingDocStatus(false)
  },
})
</script>

<style scoped lang="scss">
.no-data-wrapper {
  /* Magic number! Delayed the display of loading indicator as to not display it in short loads */
  animation: delayedDisplay 300ms;
  /* Magic number! The page looks empty without content */
  min-height: 50vh;
}

@keyframes delayedDisplay {
  0% {
    opacity: 0;
  }

  50% {
    opacity: 0;
  }

  51% {
    opacity: 1;
  }

  100% {
    opacity: 1;
  }
}

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

.filter-toggle {
  cursor: pointer;
  opacity: 0.3;
}

.filter-toggle.is-active {
  opacity: 1;
}

.data-cell {
  max-height: 4.5rem;
}
</style>
