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
              <rbz-table :columns="columns"
                         :data="docs"
                         :show-menu-column="true"
                         :show-filter-button="true"
                         :show-new-button="true"
                         @new-button-clicked="addNewDoc"
                         :show-edit-button="true"
                         @edit-button-clicked="editDoc">
              </rbz-table>
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
import CloudFunctionsEditor from '@/doc-editors/CloudFunctionsEditor.vue'
import CustomResponseEditor from '@/doc-editors/CustomResponseEditor.vue'
import GitHistory from '@/components/GitHistory.vue'
import {defineComponent, shallowRef} from 'vue'
import {ColumnOptions, Commit, Document, DocumentType, GenericObject} from '@/types'
import {COLUMN_OPTIONS_MAP} from './documentListConst'
import {AxiosResponse} from 'axios'
import RbzTable from '@/components/RbzTable.vue'

export default defineComponent({
  watch: {
    $route: {
      handler: async function(val) {
        if (val.name.includes('DocumentList')) {
          this.setLoadingDocStatus(true)
          await this.setSelectedDataFromRouteParams()
          this.setLoadingDocStatus(false)
        }
      },
      deep: true,
    },
  },
  components: {
    RbzTable,
    GitHistory,
  },
  data() {
    return {
      columns: [] as ColumnOptions[],
      configs: [],
      gitLog: [],
      titles: DatasetsUtils.titles,

      selectedBranch: null,
      selectedDocType: null as DocumentType,
      // Documents
      docs: [] as GenericObject[],
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
        'cloudfunctions': shallowRef({component: CloudFunctionsEditor}),
        'actions': shallowRef({component: CustomResponseEditor}),
      },

      // for cloudfunctions mock data - remove later
      cloudFunctionsMockData: [{
        'id': 'f971e92459e2',
        'name': 'New Cloud Functions',
        'description': '5 requests per minute',
        'phase': 'requestpost',
        'code': `-- begin custom code
        --custom response header
        ngx.header['foo'] = 'bar'`,
      },
      {
        'id': 'f123456789',
        'name': 'New Cloud Function',
        'description': '2 requests per minute',
        'phase': 'responsepost',
        'code': `-- begin custom code
        --custom response header
        ngx.header['foo'] = 'bar'`,
      }],
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
    goToRoute() {
      const currentRoute = `/list/${this.selectedBranch}/${this.selectedDocType}`
      if (this.$route.path !== currentRoute) {
        console.log('Switching document list, new document list path: ' + currentRoute)
        this.$router.push(currentRoute)
      }
    },

    async setSelectedDataFromRouteParams() {
      this.setLoadingDocStatus(true)
      const branchNameFromRoute = this.$route.params.branch?.toString()
      if (branchNameFromRoute && this.branchNames.includes(branchNameFromRoute)) {
        this.selectedBranch = branchNameFromRoute
      } else {
        this.selectedBranch = this.branchNames[0]
      }
      const prevDocType = this.selectedDocType
      const docTypeFromRoute = this.$route.params.doc_type?.toString()
      if (docTypeFromRoute && Object.keys(this.componentsMap).includes(docTypeFromRoute)) {
        this.selectedDocType = docTypeFromRoute as DocumentType
      } else {
        this.selectedDocType = Object.keys(this.componentsMap)[0] as DocumentType
      }
      this.columns = COLUMN_OPTIONS_MAP[this.selectedDocType]
      if (!prevDocType || prevDocType !== this.selectedDocType) {
        await this.loadDocs(this.selectedDocType)
      }
      this.setLoadingDocStatus(false)
      this.loadGitLog()
      this.goToRoute()
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
      // TODO: mock file to be removed later
      const response = (doctype == 'cloudfunctions') ?
        await RequestsUtils.sendReblazeRequest({
          methodName: 'GET',
          url: `configs/cloud-functions/`,
          data: {headers: {'x-fields': `id, ${fieldNames.join(', ')}`}},
          onFail: () => {
            console.log('Error while attempting to load documents')
            this.docs = []
            this.isDownloadLoading = false
          },
        }) :
        await RequestsUtils.sendRequest({
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
      this.isDownloadLoading = false
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

    newDoc(): Document {
      const factory = DatasetsUtils.newDocEntryFactory[this.selectedDocType]
      return factory && factory()
    },

    editDoc(id: string) {
      const routeToDoc = `/config/${this.selectedBranch}/${this.selectedDocType}/${id}`
      this.$router.push(routeToDoc)
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
      await RequestsUtils.sendRequest({methodName: 'POST', url, data, successMessage, failureMessage})
        .then(() => {
          this.editDoc(docToAdd.id)
        })
      this.isNewLoading = false
      this.setLoadingDocStatus(false)
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

    referToVersionControl() {
      this.$router.push('/versioncontrol')
    },

    loadGitLog() {
      this.isGitLogLoading = true
      const config = this.selectedBranch
      const document = this.selectedDocType
      const url = `configs/${config}/d/${document}/v/`
      if (config && document) {
        RequestsUtils.sendRequest({methodName: 'GET', url}).then((response: AxiosResponse<Commit[]>) => {
          this.gitLog = response?.data
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
</style>
