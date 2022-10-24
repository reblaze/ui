<template>
  <div class="card-content">
    <div class="media">
      <div class="media-content">
        <div class="columns">
          <div class="column">
            <div class="field is-grouped">
              <p class="control">
                <button class="button is-small redirect-list-button"
                        @click="redirectToList()"
                        title="Return to list"
                        data-qa="redirect-to-list">
                  <span class="icon is-small">
                    <i class="fas fa-arrow-left"></i>
                  </span>
                  <span>
                    Return To List
                  </span>
                </button>
              </p>
              <div class="control"
                   v-if="docIdNames.length">
                <div class="select is-small">
                  <select v-model="selectedDocID"
                          title="Switch document ID"
                          @change="switchDocID()"
                          class="doc-selection"
                          data-qa="switch-document">
                    <option v-for="pair in docIdNames"
                            :key="pair[0]"
                            :value="pair[0]">
                      {{ pair[1] }}
                    </option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div class="column">
            <div class="field is-grouped is-pulled-right">
              <p class="control">
                <button class="button is-small new-document-button"
                        :class="{'is-loading': isNewLoading}"
                        @click="addNewDoc()"
                        title="Add new document"
                        :disabled="!selectedBranch || !selectedDocType"
                        data-qa="add-new-document">
                  <span class="icon is-small">
                    <i class="fas fa-plus"></i>
                  </span>
                  <span>
                    New
                  </span>
                </button>
              </p>

              <p class="control">
                <button class="button is-small fork-document-button"
                        :class="{'is-loading': isForkLoading}"
                        @click="forkDoc()"
                        title="Duplicate document"
                        :disabled="!selectedDoc || dynamicRuleManaged"
                        data-qa="duplicate-document">
                  <span class="icon is-small">
                    <i class="fas fa-clone"></i>
                  </span>
                  <span>
                    Duplicate
                  </span>
                </button>
              </p>

              <p class="control">
                <button class="button is-small download-doc-button"
                        :class="{'is-loading': isDownloadLoading}"
                        :disabled="!selectedDoc"
                        @click="downloadDoc()"
                        title="Download document"
                        data-qa="download-document">
                  <span class="icon is-small">
                    <i class="fas fa-download"></i>
                  </span>
                  <span>
                    Download
                  </span>
                </button>
              </p>

              <p class="control">
                <button class="button is-small save-document-button"
                        :class="{'is-loading': isSaveLoading}"
                        @click="saveChanges()"
                        title="Save changes"
                        :disabled="isDocumentInvalid || !selectedDoc || dynamicRuleManaged"
                        data-qa="save-changes">
                  <span class="icon is-small">
                    <i class="fas fa-save"></i>
                  </span>
                  <span>
                    Save
                  </span>
                </button>
              </p>

              <p class="control">
                <button class="button is-small has-text-danger delete-document-button"
                        :class="{'is-loading': isDeleteLoading}"
                        @click="deleteDoc()"
                        title="Delete document"
                        :disabled="selectedDocNotDeletable"
                        data-qa="delete-document">
                  <span class="icon is-small">
                    <i class="fas fa-trash"></i>
                  </span>
                  <span>
                    Delete
                  </span>
                </button>
              </p>

            </div>
          </div>
        </div>
      </div>
    </div>

    <hr/>

    <div class="content document-editor-wrapper"
         v-show="!loadingDocCounter">
      <component
          v-if="selectedBranch && selectedDocType && selectedDoc && !loadingDocCounter"
          :is="componentsMap[selectedDocType].component"
          v-model:selectedBranch="selectedBranch"
          v-model:selectedDoc="selectedDoc"
          v-model:selectedDocMatchingGlobalFilter="selectedDocMatchingGlobalFilter"
          v-model:docs="docs"
          :apiPath="documentAPIPath"
          @form-invalid="isDocumentInvalid = $event"
          @go-to-route="goToRoute($event)"
          ref="currentComponent">
      </component>
      <hr/>
      <git-history v-if="selectedDocID && !isReblazeDocument"
                   :api-path="gitAPIPath"
                   :restore-target-title="`document [${titles[selectedDocType]}]`"
                   @restore-version="restoreGitVersion"/>
    </div>

    <div class="content no-data-wrapper"
         v-if="loadingDocCounter || !selectedBranch || !selectedDocType || !selectedDoc">
      <div v-if="loadingDocCounter > 0">
        <button class="button is-outlined is-text is-small is-loading document-loading">
          Loading
        </button>
      </div>
      <div v-else
           class="no-data-message">
        No data found.
        <div>
          <!--display correct message by priority (Document type -> Document)-->
          <span v-if="!Object.keys(componentsMap).includes(selectedDocType)">
            Missing document type. Please check your URL or click a link in the menu to the side
          </span>
          <span v-else-if="!docIdNames.find((docIdName) => docIdName[0].includes(selectedDoc?.id))">
            Missing document. To create a new one, click
            <a title="Add new"
               @click="addNewDoc()">
              here
            </a>
          </span>
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
import ContentFilterEditor from '@/doc-editors/ContentFilterProfilesEditor.vue'
import ContentFilterRulesEditor from '@/doc-editors/ContentFilterRulesEditor.vue'
import SecurityPoliciesEditor from '@/doc-editors/SecurityPoliciesEditor.vue'
import RateLimitsEditor from '@/doc-editors/RateLimitRulesEditor.vue'
import EdgeFunctionsEditor from '@/doc-editors/EdgeFunctionsEditor.vue'
import DynamicRulesEditor from '@/doc-editors/DynamicRulesEditor.vue'
import GlobalFilterListEditor from '@/doc-editors/GlobalFiltersEditor.vue'
import FlowControlPolicyEditor from '@/doc-editors/FlowControlPoliciesEditor.vue'
import CustomResponseEditor from '@/doc-editors/CustomResponsesEditor.vue'
import GitHistory from '@/components/GitHistory.vue'
import {mdiSourceBranch, mdiSourceCommit} from '@mdi/js'
import {defineComponent, shallowRef} from 'vue'
import {Document, DocumentType, DynamicRule, GlobalFilter, HttpRequestMethods, SecurityPolicy} from '@/types'
import axios, {AxiosResponse} from 'axios'
import {mapStores} from 'pinia'
import {useBranchesStore} from '@/stores/BranchesStore'

export default defineComponent({
  name: 'DocumentEditor2',
  props: {},
  components: {
    GitHistory,
  },
  data() {
    const reblazeComponentsMap = {
      'cloud-functions': shallowRef({component: EdgeFunctionsEditor}),
      'dynamic-rules': shallowRef({component: DynamicRulesEditor}),
    }
    return {
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
      referencedIDsEdgeFunctions: [],
      referencedIDsDynamicRules: [],

      selectedDocType: null as DocumentType,

      docs: [] as Document[],
      docIdNames: [] as [Document['id'], Document['name']][],
      selectedDocID: null,
      cancelSource: axios.CancelToken.source(),
      isDownloadLoading: false,
      isDocumentInvalid: false,
      selectedDocMatchingGlobalFilter: null as GlobalFilter,
      duplicatedDocMatchingGlobalFilter: null as GlobalFilter,

      componentsMap: {
        'globalfilters': shallowRef({component: GlobalFilterListEditor}),
        'flowcontrol': shallowRef({component: FlowControlPolicyEditor}),
        'securitypolicies': shallowRef({component: SecurityPoliciesEditor}),
        'ratelimits': shallowRef({component: RateLimitsEditor}),
        'aclprofiles': shallowRef({component: ACLEditor}),
        'contentfilterprofiles': shallowRef({component: ContentFilterEditor}),
        'contentfilterrules': shallowRef({component: ContentFilterRulesEditor}),
        'actions': shallowRef({component: CustomResponseEditor}),
        ...reblazeComponentsMap,
      },
      reblazeComponentsMap: reblazeComponentsMap,
      confAPIRoot: RequestsUtils.confAPIRoot,
      confAPIVersion: RequestsUtils.confAPIVersion,
      reblazeAPIRoot: RequestsUtils.confAPIRoot,
      reblazeAPIVersion: RequestsUtils.confAPIVersion,
    }
  },
  watch: {
    selectedBranch: {
      handler: async function(val, oldVal) {
        if ((this.$route.name as string).includes('DocumentEditor') && val && val !== oldVal) {
          this.setLoadingDocStatus(true)
          await this.setSelectedDataFromRouteParams(true)
          await this.loadReferencedDocsIDs()
          this.setLoadingDocStatus(false)
        }
      },
      immediate: true,
    },

    selectedDocID: {
      handler: async function(val, oldVal) {
        if (val && val !== oldVal && this.selectedDocType === 'dynamic-rules') {
          if (this.isNewLoading) {
            const docMatchingGlobalFilter = DatasetsUtils.newDocEntryFactory['globalfilters']() as GlobalFilter
            docMatchingGlobalFilter.id = `dr_${this.selectedDocID}`
            docMatchingGlobalFilter.active = (this.selectedDoc as DynamicRule).active
            docMatchingGlobalFilter.name = 'Global Filter for Dynamic Rule' + this.selectedDocID
            this.selectedDocMatchingGlobalFilter = docMatchingGlobalFilter
          } else {
            this.setLoadingDocStatus(true)
            const url = `configs/${this.selectedBranch}/d/globalfilters/e/dr_${val}/`
            const response = await RequestsUtils.sendRequest({methodName: 'GET', url})

            this.selectedDocMatchingGlobalFilter = response.data
            this.setLoadingDocStatus(false)
          }
        }
      },
    },
  },
  computed: {
    isReblazeDocument(): boolean {
      return Object.keys(this.reblazeComponentsMap).includes(this.selectedDocType)
    },

    dynamicRuleManaged(): boolean {
      return this.selectedDocID.startsWith('dr_')
    },

    documentAPIPath(): string {
      let apiPrefix
      if (this.isReblazeDocument) {
        apiPrefix = `${this.reblazeAPIRoot}/${this.reblazeAPIVersion}`
      } else {
        apiPrefix = `${this.confAPIRoot}/${this.confAPIVersion}`
      }
      return `${apiPrefix}/configs/${this.selectedBranch}/d/${this.selectedDocType}/e/${this.selectedDocID}/`
    },

    gitAPIPath(): string {
      return `configs/${this.selectedBranch}/d/${this.selectedDocType}/v/`
    },

    selectedDoc: {
      get(): Document {
        return this.docs[this.selectedDocIndex]
      },
      set(newDoc: Document): void {
        this.docs[this.selectedDocIndex] = newDoc
      },
    },

    selectedDocNotDeletable(): boolean {
      return !this.selectedDoc ||
          this.selectedDoc.id.startsWith('__') || // Default entries
          this.selectedDoc.id.startsWith('rl-') || // Reblaze-managed Rate Limits
          this.selectedDoc.id.startsWith('action-') || // Reblaze-managed Custom Responses
          this.selectedDoc.id.startsWith('rbz-') || // Reblaze-managed Global Filters
          this.selectedDoc.id.startsWith('dr_') || // Dynamic-Rule-managed Global Filters
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
      if (this.selectedDocType === 'cloud-functions') {
        return this.referencedIDsEdgeFunctions.includes(this.selectedDocID)
      }
      if (this.selectedDocType === 'dynamic-rules') {
        return this.referencedIDsDynamicRules.includes(this.selectedDocID)
      }
      return false
    },

    selectedBranch(): string {
      return this.branchesStore.selectedBranchId
    },

    ...mapStores(useBranchesStore),
  },
  methods: {

    async goToRoute(newRoute?: string) {
      if (!newRoute) {
        newRoute = `/${this.selectedBranch}/${this.selectedDocType}/config/${this.selectedDocID}`
      }
      if (this.$route.path !== newRoute) {
        console.log('Switching document, new document path: ' + newRoute)
        await this.$router.push(newRoute)
        await this.setSelectedDataFromRouteParams()
      }
    },

    async setSelectedDataFromRouteParams(forceLoadDocs: boolean = false) {
      this.setLoadingDocStatus(true)
      const prevDocType = this.selectedDocType
      const docTypeFromRoute = this.$route.params?.doc_type?.toString()
      if (docTypeFromRoute && Object.keys(this.componentsMap).includes(docTypeFromRoute)) {
        this.selectedDocType = docTypeFromRoute as DocumentType
      } else {
        this.selectedDocType = Object.keys(this.componentsMap)[0] as DocumentType
      }
      if (forceLoadDocs || !prevDocType || prevDocType !== this.selectedDocType) {
        await this.loadDocs()
      }
      const docIdFromRoute = this.$route.params?.doc_id?.toString()
      if (docIdFromRoute && this.docIdNames.findIndex((idName) => idName[0] === docIdFromRoute) > -1) {
        this.selectedDocID = docIdFromRoute
      } else {
        this.selectedDocID = this.docIdNames?.[0]?.[0]
      }
      this.isDocumentInvalid = false

      await this.loadSelectedDocData()
      await this.goToRoute()
      this.setLoadingDocStatus(false)
    },

    redirectToVersionControl() {
      this.$router.push(`/${this.selectedBranch}/versioncontrol`)
    },

    redirectToList() {
      this.$router.push(`/${this.selectedBranch}/${this.selectedDocType}/list`)
    },

    newDoc(): Document {
      const factory = DatasetsUtils.newDocEntryFactory[this.selectedDocType]
      return factory && factory()
    },

    updateDocIdNames() {
      this.docIdNames = _.sortBy(_.map(this.docs, (doc) => [doc.id, doc.name]), (entry) => entry[1])
    },

    async loadSelectedDocData() {
      this.setLoadingDocStatus(true)
      // check if the selected doc only has id and name, if it does, attempt to load the rest of the document data
      if (this.selectedDoc && Object.keys(this.selectedDoc).length === 2) {
        let response
        const url = `configs/${this.selectedBranch}/d/${this.selectedDocType}/e/${this.selectedDocID}/`
        if (this.isReblazeDocument) {
          response = await RequestsUtils.sendReblazeRequest({
            methodName: 'GET',
            url,
          })
        } else {
          response = await RequestsUtils.sendRequest({
            methodName: 'GET',
            url,
          })
        }
        this.selectedDoc = response?.data || this.selectedDoc
        if (this.selectedDocType === 'dynamic-rules') {
          // get globalFilters from conf server
          const globalResponse = RequestsUtils.sendRequest({
            methodName: 'GET',
            url: `configs/${this.selectedBranch}/d/globalfilters/e/dr_${this.selectedDocID}/`,
          })
          this.selectedDocMatchingGlobalFilter = globalResponse.data
        }
      }
      this.setLoadingDocStatus(false)
    },

    async loadDocs(skipDocSelection?: boolean) {
      this.isDownloadLoading = true
      this.setLoadingDocStatus(true)
      const branch = this.selectedBranch
      const url = `configs/${branch}/d/${this.selectedDocType}/`
      let requestFunction
      if (this.isReblazeDocument) {
        requestFunction = RequestsUtils.sendReblazeRequest
      } else {
        requestFunction = RequestsUtils.sendRequest
      }

      const response = await requestFunction({
        methodName: 'GET',
        url,
        config: {headers: {'x-fields': 'id, name'}},
        onFail: () => {
          console.log('Error while attempting to load documents')
          this.docs = []
          this.isDownloadLoading = false
        },
      })
      this.docs = response?.data || []
      // After we load the basic data (id and name) we can async load the full data
      this.cancelSource.cancel(`Operation cancelled and restarted for a new document type ${this.selectedDocType}`)
      this.cancelSource = axios.CancelToken.source()
      requestFunction({
        methodName: 'GET',
        url,
        config: {cancelToken: this.cancelSource.token},
        onFail: () => {
          console.log('Error while attempting to load documents')
          this.docs = []
          this.isDownloadLoading = false
        },
      }).then((response: AxiosResponse) => {
        this.docs = response?.data || []
        this.isDownloadLoading = false
      })
      this.updateDocIdNames()
      if (this.docIdNames && this.docIdNames.length && this.docIdNames[0].length) {
        if (!skipDocSelection || !_.find(this.docIdNames, (idName: [Document['id'], Document['name']]) => {
          return idName[0] === this.selectedDocID
        })) {
          this.selectedDocID = this.docIdNames[0][0]
        }
        await this.loadSelectedDocData()
      }
      this.setLoadingDocStatus(false)
      this.isDownloadLoading = false
    },

    async switchDocID() {
      this.setLoadingDocStatus(true)
      const docName = this.selectedDoc.name
      if (docName) {
        Utils.toast(
            `Switched to document ${docName} with ID "${this.selectedDocID}".`,
            'is-info',
        )
      }
      this.goToRoute()
      this.setLoadingDocStatus(false)
    },

    downloadDoc() {
      if (!this.isDownloadLoading) {
        Utils.downloadFile(this.titles[`${this.selectedDocType}-singular`], 'json', this.selectedDoc)
      }
    },

    async forkDoc() {
      this.setLoadingDocStatus(true)
      this.isForkLoading = true
      let docToAdd = _.cloneDeep(this.selectedDoc) as Document
      docToAdd.name = 'copy of ' + docToAdd.name
      docToAdd.id = DatasetsUtils.generateUUID2()
      // A special check for securitypolicies as we would want to change the domain name to be unique
      if (this.selectedDocType === 'securitypolicies') {
        docToAdd = docToAdd as SecurityPolicy
        docToAdd.match = `${docToAdd.id}.${docToAdd.match}`
      }
      if (this.selectedDocType === 'dynamic-rules') {
        this.duplicatedDocMatchingGlobalFilter = this.selectedDocMatchingGlobalFilter
      }
      const docTypeText = this.titles[this.selectedDocType + '-singular']
      const successMessage = `The ${docTypeText} was duplicated.`
      const failureMessage = `Failed while attempting to duplicate the ${docTypeText}.`
      await this.addNewDoc(docToAdd, successMessage, failureMessage)
      this.isForkLoading = false
      this.setLoadingDocStatus(false)
    },

    async addNewDoc(docToAdd?: Document, successMessage?: string, failureMessage?: string) {
      this.setLoadingDocStatus(true)
      this.isNewLoading = true
      if (!docToAdd) {
        docToAdd = this.newDoc()
      }
      this.docs.unshift(docToAdd)
      this.selectedDocID = docToAdd.id
      const docTypeText = this.titles[this.selectedDocType + '-singular']
      if (!successMessage) {
        successMessage = `New ${docTypeText} was created.`
      }
      if (!failureMessage) {
        failureMessage = `Failed while attempting to create the new ${docTypeText}.`
      }
      if (this.selectedDocType === 'dynamic-rules') {
        let docMatchingGlobalFilter
        if (this.isForkLoading) {
          docMatchingGlobalFilter = this.duplicatedDocMatchingGlobalFilter
        } else {
          docMatchingGlobalFilter = DatasetsUtils.newDocEntryFactory['globalfilters']() as GlobalFilter
        }
        docMatchingGlobalFilter.id = `dr_${this.selectedDocID}`
        docMatchingGlobalFilter.active = (this.selectedDoc as DynamicRule).active
        docMatchingGlobalFilter.name = 'Global Filter for Dynamic Rule ' + this.selectedDocID
        docMatchingGlobalFilter.action = 'action-dynamic-rule-block'
        this.selectedDocMatchingGlobalFilter = docMatchingGlobalFilter
      }
      await this.saveChanges('POST', successMessage, failureMessage)

      this.goToRoute()
      this.isNewLoading = false
      this.setLoadingDocStatus(false)
    },

    async saveChanges(methodName?: HttpRequestMethods, successMessage?: string, failureMessage?: string) {
      this.isSaveLoading = true
      const docTypeText = this.titles[this.selectedDocType + '-singular']
      if (!successMessage) {
        successMessage = `Changes to the ${docTypeText} were saved.`
      }
      if (!failureMessage) {
        failureMessage = `Failed while attempting to save the changes to the ${docTypeText}.`
      }

      if (!methodName) {
        methodName = 'PUT'
      }

      const data = this.selectedDoc
      let requestFunction
      let url = ''
      if (this.isReblazeDocument) {
        requestFunction = RequestsUtils.sendReblazeRequest
        url = `configs/${this.selectedBranch}/d/${this.selectedDocType}/e/${this.selectedDocID}/`
      } else {
        requestFunction = RequestsUtils.sendRequest
        url = `configs/${this.selectedBranch}/d/${this.selectedDocType}/e/`
        if (methodName !== 'POST') {
          url += `${this.selectedDocID}/`
        }
      }

      await requestFunction({methodName, url, data, successMessage, failureMessage}).then(() => {
        this.updateDocIdNames()
        // If the saved doc was a security policy, refresh the referenced IDs lists
        if (this.selectedDocType === 'securitypolicies') {
          this.loadReferencedDocsIDs()
        }
        // If the saved doc was a dynamic rule, also save the matching global filter
        if (this.selectedDocType === 'dynamic-rules') {
          let url = `configs/${this.selectedBranch}/d/globalfilters/e/`
          if (methodName !== 'POST') {
            url += `dr_${this.selectedDocID}/`
          }
          const data = this.selectedDocMatchingGlobalFilter
          RequestsUtils.sendRequest({methodName, url, data: data})
        }
      })

      this.isSaveLoading = false
    },

    async deleteDoc() {
      this.setLoadingDocStatus(true)
      this.isDeleteLoading = true
      this.docs.splice(this.selectedDocIndex, 1)
      const docTypeText = this.titles[this.selectedDocType + '-singular']
      const successMessage = `The ${docTypeText} was deleted.`
      const failureMessage = `Failed while attempting to delete the ${docTypeText}.`
      const url = `configs/${this.selectedBranch}/d/${this.selectedDocType}/e/${this.selectedDocID}/`
      let requestFunction
      const methodName = 'DELETE'
      if (this.isReblazeDocument) {
        requestFunction = RequestsUtils.sendReblazeRequest
      } else {
        requestFunction = RequestsUtils.sendRequest
      }
      await requestFunction({methodName, url, successMessage, failureMessage}).then(() => {
        this.updateDocIdNames()
      })
      // If the deleted doc is a dynamic rule, also delete the matching global filter
      if (this.selectedDocType === 'dynamic-rules') {
        const url = `configs/${this.selectedBranch}/d/globalfilters/e/dr_${this.selectedDocID}/`
        RequestsUtils.sendRequest({methodName, url}).then(() => {
          console.log(`globalfilters deleted successfully dr_${this.selectedDocID}`)
        })
      }

      this.selectedDocID = this.docs[0].id
      await this.loadSelectedDocData()
      this.goToRoute()
      this.isDeleteLoading = false
      this.setLoadingDocStatus(false)
    },

    async loadReferencedDocsIDs() {
      const response = await RequestsUtils.sendRequest({
        methodName: 'GET',
        url: `configs/${this.selectedBranch}/d/securitypolicies/`,
      })
      const docs = response?.data || []
      const referencedACL: string[] = []
      const referencedContentFilter: string[] = []
      const referencedLimit: string[] = []
      const referencedEdgeFunctions: string[] = []
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
      this.referencedIDsEdgeFunctions = _.uniq(_.flatten(referencedEdgeFunctions))
    },

    restoreGitVersion() {
      this.loadDocs(true)
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
  },

  async created() {
    this.setLoadingDocStatus(true)
    await this.branchesStore.list
    this.setLoadingDocStatus(false)
  },
})
</script>
<style scoped
       lang="scss">

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

</style>
