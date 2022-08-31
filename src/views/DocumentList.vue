<template>
<div class='card'>
    <div class='card-content'>
        <div class='media'>
            <div class='media-content'>
                <div class='field is-grouped'>
                    <div class='control' v-if='branchNames.length'>
                        <div class='select is-small'>
                            <select v-model='selectedBranch' title='Switch branch'
                            class='branch-selection' @change='switchBranch()'>
                                <option v-for='name in branchNames' :key='name' :value='name'>
                                    {{ name }}
                                </option>
                            </select>
                        </div>
                    </div>
                    <p class='control'>
                        <button class='button is-small download-doc-button' :class='{"is-loading":isDownloadLoading}'
                        title='Download document' data-qa='download-document'>
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
                      class='column-header is-size-7'
                      :class="`${col.classes}${col.isSortable ? ' sort-column' : null}`"
                      @click='sortColumn(col)'>
                      <!-- BUG: the @click should be on the tag but
                      when col isnt Searchable it also gave the permmision to click-->
                        <div v-if='col.isSortable'>
                            <div class='arrow-wrapper'>
                                <span class='arrow arrow-asc'
                                :class='{ active: sortField === col.fieldName && sortDir === "asc", }' />
                            </div>
                            <div class='arrow-wrapper'>
                                <span class='arrow arrow-desc'
                                :class='{active: sortField === col.fieldName && sortDir === "desc", }' />
                            </div>
                        </div>
                        {{ col.columnTitle }}
                    </th>
                    <th class='column-header width-80px'>
                        <div class='field is-grouped is-grouped-centered'>
                            <p class='control'>
                                <button class='button is-size-7' title='Add new document' @click='addNewDoc()'
                                :disabled='!selectedBranch || !selectedDocType' :class='{"is-loading": isNewLoading}' >
                                    <!-- TODO: Check the button of new doc adding -->
                                    <span class='icon is-small'>
                                        <i class='fas fa-plus'></i>
                                    </span>
                                </button>
                            </p>
                            <p class='control'>
                                <button class='button is-size-7 filter-toggle' @click='filtervisible = !filtervisible'
                                :class='{"is-active": filtervisible }' title='Filter table data' >
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
                            <input class='input is-small filter-input search-input-vectors-score'
                            :title='col.columnTitle' :placeholder='col.columnTitle'
                            v-model='filter[col.fieldName]' @change='updateDataDisplay()' />
                            <span class='icon is-small is-right'>
                                <i class='fa fa-filter' aria-hidden='true'></i>
                            </span>
                        </div>
                    </th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                <tr v-for='row in getSlicedDataArrayDisplay(docsDisplayData, currentPage)' :key='row.id'>
                    <td v-for='col in columns' :key='col.fieldName' class='is-size-7'
                    :class="col.classes" :title="row[col.fieldName]">
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
                <tr v-if='totalPages > 1'> <!-- BUG: this footer isnt shown with async call -
                only after rerender it's shown (like sorting)-->
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
// import GitHistory from '@/components/GitHistory.vue'
import {mdiSourceBranch, mdiSourceCommit} from '@mdi/js'
import {defineComponent, shallowRef} from 'vue'
import {BasicDocument, Commit, Document, DocumentType, ColumnOptions} from '@/types'
import axios, {AxiosResponse} from 'axios'
import {HEADER_COLUMNS_MAP} from './documentListConst'

/*  interface DummyArray {
  id: number
  name: string
  url: string
  ip: string
} */

type GenericObject = {
    [key: string]: any
}


export default defineComponent({
  watch: {
    $route: {
      handler: async function() {
        this.setLoadingDocStatus(true)
        await this.setSelectedDataFromRouteParams()
        this.setLoadingDocStatus(false)
      },
      deep: true,
    },
  },
  data() {
    return {
      columns: [] as ColumnOptions[],
      // General
      rowsPerPage: 10, // TODO:Need to change this to be an generic number ?
      currentPage: 1,
      totalPages: 1,
      data: {}, // TODO: We need it?
      filter: {} as GenericObject,
      dataDisplay: [] as GenericObject[],
      filtervisible: false,
      sortField: '',
      sortDir: 'asc',

      configs: [],
      mdiSourceBranchPath: mdiSourceBranch,
      mdiSourceCommitPath: mdiSourceCommit,
      titles: DatasetsUtils.titles,

      // Loading indicators
      loadingDocCounter: 0,
      isForkLoading: false,
      isNewLoading: false,
      isSaveLoading: false,
      isDeleteLoading: false,

      // To prevent deletion of docs referenced by Security Policies
      referencedIDsACL: [],
      referencedIDsContentFilter: [],
      referencedIDsLimits: [],

      selectedBranch: null,
      selectedDocType: null as DocumentType,

      docs: [] as GenericObject[],
      docsDisplayData: [] as GenericObject[],
      docIdNames: [] as [Document['id'], Document['name']][],
      selectedDocID: null,
      cancelSource: axios.CancelToken.source(),
      isDownloadLoading: false,
      isDocumentInvalid: false,

      gitLog: [],
      loadingGitlog: false,
      commits: 0,
      branches: 0,

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
  methods: {
    getDataArrayDisplay() {
      if (!this.docs?.length) {
        return []
      }
      const sortModifier = this.sortDir === 'asc' ? 1 : -1
      return this.docs
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
      if (!filter.isSortable) {
        return
      }
      if (filter.fieldName === this.sortField) {
        this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc'
      } else {
        this.sortDir = 'asc'
      }
      this.sortField = filter.fieldName
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


    /* TODO: why do i need to start the circle with counter and witout only boolean var? */
    goToRoute() {
      const currentRoute = `/config/${this.selectedBranch}/${this.selectedDocType}`
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
      this.columns = HEADER_COLUMNS_MAP[this.selectedDocType]
      if (!prevDocType || prevDocType !== this.selectedDocType) {
        await this.loadDocs(this.selectedDocType)
      }
      this.setLoadingDocStatus(false)
      // this.loadGitLog()
      this.goToRoute()
    },

    resetGitLog() {
      this.gitLog = []
    },

    newDoc(): Document {
      const factory = DatasetsUtils.newDocEntryFactory[this.selectedDocType]
      return factory && factory()
    },

    async loadConfigs(counterOnly?: boolean) {
      // store configs
      let configs
      try {
        const response = await RequestsUtils.sendRequest({methodName: 'GET', url: 'configs/'})
        configs = response.data
      } catch (err) {
        console.log('Error while attempting to get configs')
        console.log(err)
      }
      if (!counterOnly) {
        console.log('loaded configs: ', configs)
        this.configs = configs
      }
      // counters
      this.commits = _.sum(_.map(_.map(configs, 'logs'), (logs) => {
        return _.size(logs)
      }))
      this.branches = _.size(configs)
      console.log('config counters', this.branches, this.commits)
    },

    updateDocIdNames() {
      this.docIdNames = _.sortBy(_.map(this.docs, (doc) => [doc.id, doc.name]), (entry) => entry[1])
    },

    async loadSelectedDocData() {
      this.setLoadingDocStatus(true)
      // check if the selected doc only has id and name, if it does, attempt to load the rest of the document data
      if (this.selectedDoc && Object.keys(this.selectedDoc).length === 2) {
        this.selectedDoc = (await RequestsUtils.sendRequest({
          methodName: 'GET',
          url: `configs/${this.selectedBranch}/d/${this.selectedDocType}/e/${this.selectedDocID}/`,
        })).data
      }
      this.setLoadingDocStatus(false)
    },

    async loadDocs(doctype: DocumentType) {
      this.isDownloadLoading = true
      const branch = this.selectedBranch
      const fieldNames = _.map(this.columns, 'fieldName')
      console.log(fieldNames)
      const response = await RequestsUtils.sendRequest({
        methodName: 'GET',
        url: `configs/${branch}/d/${doctype}/`,
        data: {headers: {'x-fields': fieldNames.join(', ')}},
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

      // this.loadGitLog()
    },

    loadGitLog(interaction?: boolean) {
      this.loadingGitlog = true
      const config = this.selectedBranch
      const document = this.selectedDocType
      const entry = this.selectedDocID
      const url = `configs/${config}/d/${document}/e/${entry}/v/`
      if (config && document && entry) {
        RequestsUtils.sendRequest({methodName: 'GET', url}).then((response: AxiosResponse<Commit[]>) => {
          this.gitLog = response?.data
          if (interaction) {
            this.loadConfigs(true)
          }
          this.loadingGitlog = false
        })
      }
    },

    async switchBranch() {
      this.setLoadingDocStatus(true)
      Utils.toast(`Switched to branch '${this.selectedBranch}'.`, 'is-info')
      await this.loadDocs(this.selectedDocType)
      await this.loadReferencedDocsIDs()
      this.goToRoute()
      this.setLoadingDocStatus(false)
    },

    downloadDoc() {
      if (!this.isDownloadLoading) {
        Utils.downloadFile(this.selectedDocType, 'json', this.docs)
      }
    },


    async addNewDoc(docToAdd?: Document, successMessage?: string, failureMessage?: string) {
      this.setLoadingDocStatus(true)
      this.isNewLoading = true
      if (!docToAdd) {
        docToAdd = this.newDoc()
      }
      this.resetGitLog()
      this.docs.unshift(docToAdd)
      this.selectedDocID = docToAdd.id
      const docTypeText = this.titles[this.selectedDocType + '-singular']
      if (!successMessage) {
        successMessage = `New ${docTypeText} was created.`
      }
      if (!failureMessage) {
        failureMessage = `Failed while attempting to create the new ${docTypeText}.`
      }
      // await this.saveChanges('POST', successMessage, failureMessage)
      this.goToRoute()
      this.isNewLoading = false
      this.setLoadingDocStatus(false)
    },

    // TODO: check with Aviv if we need saveChanges
    /* async saveChanges(methodName?: HttpRequestMethods, successMessage?: string, failureMessage?: string) {
      this.isSaveLoading = true
      if (!methodName) {
        methodName = 'PUT'
      }
      let url = `configs/${this.selectedBranch}/d/${this.selectedDocType}/e/`
      if (methodName !== 'POST') {
        url += `${this.selectedDocID}/`
      }
      const data = this.selectedDoc

      const docTypeText = this.titles[this.selectedDocType + '-singular']
      if (!successMessage) {
        successMessage = `Changes to the ${docTypeText} were saved.`
      }
      if (!failureMessage) {
        failureMessage = `Failed while attempting to save the changes to the ${docTypeText}.`
      }
      await RequestsUtils.sendRequest({methodName, url, data, successMessage, failureMessage}).then(() => {
        this.updateDocIdNames()
        this.loadGitLog(true)
        // If the saved doc was a security policy, refresh the referenced IDs lists
        if (this.selectedDocType === 'securitypolicies') {
          this.loadReferencedDocsIDs()
        }
      })
      this.isSaveLoading = false
    },*/

    // TODO: check with Aviv if we need deleteDoc()
    /* async deleteDoc() {
      this.setLoadingDocStatus(true)
      this.isDeleteLoading = true
      this.docs.splice(this.selectedDocIndex, 1)
      const docTypeText = this.titles[this.selectedDocType + '-singular']
      const successMessage = `The ${docTypeText} was deleted.`
      const failureMessage = `Failed while attempting to delete the ${docTypeText}.`
      await RequestsUtils.sendRequest({
        methodName: 'DELETE',
        url: `configs/${this.selectedBranch}/d/${this.selectedDocType}/e/${this.selectedDocID}/`,
        successMessage,
        failureMessage,
      }).then(() => {
        this.updateDocIdNames()
        this.loadGitLog(true)
      })
      this.selectedDocID = this.docs[0].id
      await this.loadSelectedDocData()
      this.addMissingDefaultsToDoc()
      this.resetGitLog()
      this.goToRoute()
      this.isDeleteLoading = false
      this.setLoadingDocStatus(false)
    },*/

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

    addMissingDefaultsToDoc() {
      if (!this.selectedDoc) {
        return
      }
      this.selectedDoc = {...this.newDoc(), ...this.selectedDoc as {}}
    },

    // Collect every request to display a loading indicator
    // The loading indicator will be displayed as long as at least one request is still active (counter > 0)
    /* TODO: why do i need to start the circle with counter and witout onli boolean var? */
    setLoadingDocStatus(isLoading: boolean) {
      if (isLoading) {
        this.loadingDocCounter++
      } else {
        this.loadingDocCounter--
      }
    },
  },
  computed: {
    branchNames(): string[] {
      return this.configs?.length ? _.sortBy(_.map(this.configs, 'id')) : []
    },

    /* TODO: the get() method needs to be GenericObject? */
    selectedDoc: {
      get(): GenericObject {
        return this.docs?.[this.selectedDocIndex]
      },
      set(newDoc: any): void {
        this.docs[this.selectedDocIndex] = newDoc
      },
    },

    selectedDocNotDeletable(): boolean {
      return !this.selectedDoc ||
          (this.selectedDoc as BasicDocument).id === '__default__' ||
          this.isDocReferenced ||
          this.docs.length <= 1
    },

    selectedDocIndex(): number {
      if (this.selectedDocID) {
        return _.findIndex(this.docs, (doc) => {
          return doc.id === this.selectedDocID
        })
      }
      return 0
    },

    isDocReferenced(): boolean {
      if (this.selectedDocType === 'aclprofiles') {
        return this.referencedIDsACL.includes(this.selectedDocID)
      }
      if (this.selectedDocType === 'contentfilterprofiles') {
        return this.referencedIDsContentFilter.includes(this.selectedDocID)
      }
      if (this.selectedDocType === 'ratelimits') {
        return this.referencedIDsLimits.includes(this.selectedDocID)
      }
      return false
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
  async created() {
    this.setLoadingDocStatus(true)
    await this.loadConfigs()
    this.setSelectedDataFromRouteParams()
    this.setLoadingDocStatus(false)
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
