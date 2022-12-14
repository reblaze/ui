<template>
  <div class="card-content">
    <div class="media">
      <div class="media-content">
        <div class="field is-grouped is-pulled-right">
          <p class="control">
            <button class="button is-small download-document-button"
                    :class="{'is-loading':isDownloadLoading}"
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
        </div>
      </div>
    </div>

    <hr/>

    <div class="content document-list-wrapper"
         v-show="!loadingDocCounter && selectedBranch && selectedDocType">
      <div class="content">
        <rbz-table :columns="columns"
                   :data="docs"
                   :default-sort-column-index="1"
                   :show-menu-column="true"
                   :show-filter-button="true"
                   :show-new-button="true"
                   @new-button-clicked="addNewDoc"
                   :row-clickable="true"
                   @row-clicked="editDoc"
                   :show-row-button="true"
                   row-button-title="Edit"
                   row-button-icon="fa-edit"
                   @row-button-clicked="editDoc">
        </rbz-table>
        <span class="is-family-monospace has-text-grey-lighter is-inline-block mt-3">
          {{ documentListAPIPath }}
        </span>
      </div>
      <hr/>
      <git-history :api-path="gitAPIPath"
                   :restore-target-title="`document [${titles[selectedDocType]}]`"
                   @restore-version="restoreGitVersion"/>
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
        No data found.
        <div>
          <span v-if="!Object.keys(componentsMap).includes(selectedDocType)">
            Missing document type. Please check your URL or click a link in the menu to the side
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
import GlobalFilterListEditor from '@/doc-editors/GlobalFiltersEditor.vue'
import FlowControlPolicyEditor from '@/doc-editors/FlowControlPoliciesEditor.vue'
import CustomResponseEditor from '@/doc-editors/CustomResponsesEditor.vue'
import GitHistory from '@/components/GitHistory.vue'
import {defineComponent, shallowRef} from 'vue'
import {ColumnOptions, Document, DocumentType, GenericObject, GlobalFilter} from '@/types'
import RbzTable from '@/components/RbzTable.vue'
import {mapStores} from 'pinia'
import {useBranchesStore} from '@/stores/BranchesStore'
import {
  ACLProfile,
  ColumnOptionsMap,
  ContentFilterProfile,
  ContentFilterRule,
  CustomResponse,
  FlowControlPolicy,
  RateLimit,
  SecurityPolicy,
  SecurityPolicyEntryMatch,
} from '@/types'
import axios, {AxiosResponse} from 'axios'


export default defineComponent({
  watch: {
    selectedBranch: {
      handler: async function(val, oldVal) {
        if ((this.$route.name as string).includes('DocumentList') && val && val !== oldVal) {
          this.setLoadingDocStatus(true)
          await this.setSelectedDataFromRouteParams(true)
          await this.loadCustomResponses()
          this.setLoadingDocStatus(false)
        }
      },
      immediate: true,
    },

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
      titles: DatasetsUtils.titles,
      selectedDocType: null as DocumentType,
      cancelSource: axios.CancelToken.source(),
      // Documents
      docs: [] as GenericObject[],
      // To prevent deletion of docs referenced by Security Policies
      referencedIDsACL: [],
      referencedIDsContentFilter: [],
      referencedIDsLimits: [],

      // Loading indicators
      isNewLoading: false,
      isDownloadLoading: false,
      loadingDocCounter: 0,

      confAPIRoot: RequestsUtils.confAPIRoot,
      confAPIVersion: RequestsUtils.confAPIVersion,
      reblazeAPIRoot: RequestsUtils.reblazeAPIRoot,
      reblazeAPIVersion: RequestsUtils.reblazeAPIVersion,
      componentsMap: {
        'globalfilters': shallowRef({component: GlobalFilterListEditor}),
        'flowcontrol': shallowRef({component: FlowControlPolicyEditor}),
        'securitypolicies': shallowRef({component: SecurityPoliciesEditor}),
        'ratelimits': shallowRef({component: RateLimitsEditor}),
        'aclprofiles': shallowRef({component: ACLEditor}),
        'contentfilterprofiles': shallowRef({component: ContentFilterEditor}),
        'contentfilterrules': shallowRef({component: ContentFilterRulesEditor}),
        'actions': shallowRef({component: CustomResponseEditor}),
      },
      selectedDocMatchingGlobalFilter: null as GlobalFilter,
      matchedDocsData: null as any,
      customResponsesNames: [] as [CustomResponse['id'], CustomResponse['name']][],
    }
  },
  computed: {
    documentListAPIPath(): string {
      const apiPrefix = `${this.confAPIRoot}/${this.confAPIVersion}`
      return `${apiPrefix}/configs/${this.selectedBranch}/d/${this.selectedDocType}/`
    },

    gitAPIPath(): string {
      return `configs/${this.selectedBranch}/d/${this.selectedDocType}/v/`
    },

    columns(): ColumnOptions[] {
      return this.columnOptionMap[this.selectedDocType] || []
    },

    columnOptionMap() {
      return {
        'globalfilters': [
          {
            title: 'ID',
            fieldNames: ['id'],
            isSortable: true,
            isSearchable: true,
            classes: 'width-130px',
            cellContentClasses: 'ellipsis',
          },
          {
            title: 'Name',
            fieldNames: ['name'],
            isSortable: true,
            isSearchable: true,
            cellContentClasses: 'ellipsis',
          },
          {
            title: 'Tags',
            fieldNames: ['tags'],
            displayFunction: (item: GlobalFilter) => {
              return item?.tags?.length
            },
            isSortable: true,
            isSearchable: true,
            isNumber: true,
            classes: 'width-100px',
            cellContentClasses: 'white-space-pre ellipsis',
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
            title: 'Custom Response',
            fieldNames: ['action'],
            isSortable: true,
            displayFunction: (item: GlobalFilter) => {
              const customResponse = _.find(this.customResponsesNames, (customResponseName) => {
                return customResponseName[0] === item.action
              })
              return customResponse?.[1] || ''
            },
            isSearchable: true,
            classes: 'width-150px',
            cellContentClasses: 'ellipsis',
          },
        ],
        'flowcontrol': [
          {
            title: 'ID',
            fieldNames: ['id'],
            isSortable: true,
            isSearchable: true,
            classes: 'width-130px',
            cellContentClasses: 'ellipsis',
          },
          {
            title: 'Name',
            fieldNames: ['name'],
            isSortable: true,
            isSearchable: true,
            cellContentClasses: 'ellipsis',
          },
          {
            title: 'Tags',
            fieldNames: ['tags'],
            displayFunction: (item: FlowControlPolicy) => {
              return item?.tags?.length
            },
            isSortable: true,
            isSearchable: true,
            isNumber: true,
            classes: 'width-100px',
            cellContentClasses: 'white-space-pre ellipsis',
          },
          {
            title: 'Active',
            fieldNames: ['active'],
            displayFunction: (item: FlowControlPolicy) => {
              return item?.active ? 'yes' : 'no'
            },
            isSortable: true,
            isSearchable: true,
            classes: 'width-80px',
          },
          {
            title: 'Sequences',
            fieldNames: ['sequence'],
            displayFunction: (item: FlowControlPolicy) => {
              return item?.sequence?.length
            },
            isSortable: true,
            isSearchable: true,
            isNumber: true,
            classes: 'width-100px',
          },
          {
            title: 'Timeframe',
            fieldNames: ['timeframe'],
            isSortable: true,
            isSearchable: true,
            isNumber: true,
            classes: 'width-100px',
          },
        ],
        'securitypolicies': [
          {
            title: 'ID',
            fieldNames: ['id'],
            isSortable: true,
            isSearchable: true,
            classes: 'width-130px',
            cellContentClasses: 'ellipsis',
          },
          {
            title: 'Name',
            fieldNames: ['name'],
            isSortable: true,
            isSearchable: true,
            classes: 'width-130px',
            cellContentClasses: 'ellipsis',
          },
          {
            title: 'Matching Names',
            fieldNames: ['match'],
            isSortable: true,
            isSearchable: true,
            cellContentClasses: 'ellipsis',
          },
          {
            title: 'Tags',
            fieldNames: ['tags'],
            displayFunction: (item: SecurityPolicy) => {
              return item?.tags?.length
            },
            isSortable: true,
            isSearchable: true,
            isNumber: true,
            classes: 'width-100px',
            cellContentClasses: 'white-space-pre ellipsis',
          },
          {
            title: 'Connected Profiles & Rules',
            fieldNames: ['map'],
            displayFunction: (item: SecurityPolicy) => {
              const getRateLimitsAmount = () => {
                const amount = _.sumBy(item?.map, (mapEntry: SecurityPolicyEntryMatch) => {
                  return mapEntry.limit_ids.length
                })
                return `Rate Limit: ${amount} total`
              }
              const getActiveACLs = () => {
                const active = item?.map?.filter((mapEntry: SecurityPolicyEntryMatch) => {
                  return mapEntry.acl_active
                }).length
                const total = item?.map?.length
                return `ACL: ${active} out of ${total} active`
              }
              const getActiveContentFilters = () => {
                const active = item?.map?.filter((mapEntry: SecurityPolicyEntryMatch) => {
                  return mapEntry.content_filter_active
                }).length
                const total = item?.map?.length
                return `Content Filter: ${active} out of ${total} active`
              }
              return [
                getActiveContentFilters(),
                getActiveACLs(),
                getRateLimitsAmount(),
              ].join('\n')
            },
            classes: 'width-200px',
            cellContentClasses: 'white-space-pre ellipsis vertical-scroll multi-line',
          },
        ],
        'ratelimits': [
          {
            title: 'ID',
            fieldNames: ['id'],
            isSortable: true,
            isSearchable: true,
            classes: 'width-130px',
            cellContentClasses: 'ellipsis',
          },
          {
            title: 'Name',
            fieldNames: ['name'],
            isSortable: true,
            isSearchable: true,
            cellContentClasses: 'ellipsis',
          },
          {
            title: 'Tags',
            fieldNames: ['tags'],
            displayFunction: (item: RateLimit) => {
              return item?.tags?.length
            },
            isSortable: true,
            isSearchable: true,
            isNumber: true,
            classes: 'width-100px',
            cellContentClasses: 'white-space-pre ellipsis',
          },
          {
            title: 'Active',
            fieldNames: ['active'],
            displayFunction: (item: RateLimit) => {
              return item?.active ? 'yes' : 'no'
            },
            isSortable: true,
            isSearchable: true,
            classes: 'width-80px',
          },
          {
            title: 'Timeframe',
            fieldNames: ['timeframe'],
            isSortable: true,
            isSearchable: true,
            isNumber: true,
            classes: 'width-100px',
          },
          {
            title: 'Thresholds',
            fieldNames: ['thresholds'],
            displayFunction: (item: RateLimit) => {
              return _.map(item.thresholds, (threshold) =>{
                const customResponse = _.find(this.customResponsesNames, (customResponseName) => {
                  return customResponseName[0] === threshold.action
                })
                const customResponseName = customResponse?.[1] || ''
                return `Limit:${threshold.limit}\n` +
                        `Custom Response: ${customResponseName}`
              }).join('\n')
            },
            isSortable: true,
            isSearchable: true,
            classes: 'width-250px',
            cellContentClasses: 'vertical-scroll multi-line white-space-pre ellipsis',
          },
          {
            title: 'Event',
            fieldNames: ['pairwith'],
            displayFunction: (item: RateLimit) => {
              if (!item.pairwith) {
                return ''
              }
              return _.isEqual(item.pairwith, {'self': 'self'}) ? 'HTTP request' :
                `${Object.keys(item.pairwith)[0]}: ${Object.values(item.pairwith)[0]}`
            },
            isSortable: true,
            isSearchable: true,
            classes: 'width-100px',
            cellContentClasses: 'ellipsis',
          },
        ],
        'aclprofiles': [
          {
            title: 'ID',
            fieldNames: ['id'],
            isSortable: true,
            isSearchable: true,
            classes: 'width-130px',
            cellContentClasses: 'ellipsis',
          },
          {
            title: 'Name',
            fieldNames: ['name'],
            isSortable: true,
            isSearchable: true,
            cellContentClasses: 'ellipsis',
          },
          {
            title: 'Tags',
            fieldNames: ['tags'],
            displayFunction: (item: ACLProfile) => {
              return item?.tags?.length
            },
            isSortable: true,
            isSearchable: true,
            isNumber: true,
            classes: 'width-100px',
            cellContentClasses: 'white-space-pre ellipsis',
          },
          {
            title: 'Custom Response',
            fieldNames: ['action'],
            displayFunction: (item: GlobalFilter) => {
              const customResponse = _.find(this.customResponsesNames, (customResponseName) => {
                return customResponseName[0] === item.action
              })
              return customResponse?.[1] || ''
            },
            isSortable: true,
            isSearchable: true,
            classes: 'width-150px',
            cellContentClasses: 'ellipsis',
          },
        ],
        'actions': [
          {
            title: 'ID',
            fieldNames: ['id'],
            isSortable: true,
            isSearchable: true,
            classes: 'width-130px',
            cellContentClasses: 'ellipsis',
          },
          {
            title: 'Name',
            fieldNames: ['name'],
            isSortable: true,
            isSearchable: true,
            cellContentClasses: 'ellipsis',
          },
          {
            title: 'Status Code',
            fieldNames: ['params'],
            displayFunction: (item: CustomResponse) => {
              return item?.params?.status || ''
            },
            isSortable: true,
            isSearchable: true,
            isNumber: true,
            classes: 'width-100px',
            cellContentClasses: 'white-space-pre ellipsis',
          },
          {
            title: 'Tags',
            fieldNames: ['tags'],
            displayFunction: (item: CustomResponse) => {
              return item?.tags?.length
            },
            isSortable: true,
            isSearchable: true,
            isNumber: true,
            classes: 'width-100px',
            cellContentClasses: 'white-space-pre ellipsis',
          },
          {
            title: 'Type',
            fieldNames: ['type'],
            isSortable: true,
            isSearchable: true,
            classes: 'width-100px',
            cellContentClasses: 'is-capitalized',
          },
        ],
        'contentfilterprofiles': [
          {
            title: 'ID',
            fieldNames: ['id'],
            isSortable: true,
            isSearchable: true,
            classes: 'width-130px',
            cellContentClasses: 'ellipsis',
          },
          {
            title: 'Name',
            fieldNames: ['name'],
            isSortable: true,
            isSearchable: true,
            cellContentClasses: 'ellipsis',
          },
          {
            title: 'Tags',
            fieldNames: ['tags'],
            displayFunction: (item: ContentFilterProfile) => {
              return item?.tags?.length
            },
            isSortable: true,
            isSearchable: true,
            isNumber: true,
            classes: 'width-100px',
            cellContentClasses: 'white-space-pre ellipsis',
          },
          {
            title: 'Restrict Content Type',
            fieldNames: ['content_type'],
            displayFunction: (item: ContentFilterProfile) => {
              return item['content_type']?.join('\n')
            },
            isSortable: true,
            isSearchable: true,
            classes: 'width-170px',
            cellContentClasses: 'vertical-scroll multi-line white-space-pre ellipsis',
          },
          {
            title: 'Decoding',
            fieldNames: ['decoding'],
            displayFunction: (item: ContentFilterProfile) => {
              if (!item.decoding) {
                return ''
              }
              const displayValues: string[] = []
              Object.keys(item.decoding).forEach((decodingKey: string) => {
                if (item.decoding[decodingKey as keyof ContentFilterProfile['decoding']]) {
                  displayValues.push(decodingKey)
                }
              })
              return displayValues.join('\n')
            },
            isSortable: true,
            isSearchable: true,
            classes: 'width-100px',
            cellContentClasses: 'vertical-scroll multi-line white-space-pre ellipsis',
          },
          {
            title: 'Custom Response',
            fieldNames: ['action'],
            displayFunction: (item: GlobalFilter) => {
              const customResponse = _.find(this.customResponsesNames, (customResponseName) => {
                return customResponseName[0] === item.action
              })
              return customResponse?.[1] || ''
            },
            isSortable: true,
            isSearchable: true,
            classes: 'width-150px',
            cellContentClasses: 'ellipsis',
          },
        ],
        'contentfilterrules': [
          {
            title: 'ID',
            fieldNames: ['id'],
            isSortable: true,
            isSearchable: true,
            classes: 'width-130px',
            cellContentClasses: 'ellipsis',
          },
          {
            title: 'Name',
            fieldNames: ['name'],
            isSortable: true,
            isSearchable: true,
            cellContentClasses: 'ellipsis',
          },
          {
            title: 'Category',
            fieldNames: ['category'],
            isSortable: true,
            isSearchable: true,
            classes: 'width-100px',
            cellContentClasses: 'ellipsis',
          },
          {
            title: 'Subcategory',
            fieldNames: ['subcategory'],
            isSortable: true,
            isSearchable: true,
            classes: 'width-130px',
            cellContentClasses: 'ellipsis',
          },
          {
            title: 'Risk Level',
            fieldNames: ['risk'],
            isSortable: true,
            isSearchable: true,
            isNumber: true,
            classes: 'width-100px',
          },
          {
            title: 'Tags',
            fieldNames: ['tags'],
            displayFunction: (item: ContentFilterRule) => {
              return item?.tags?.length
            },
            isSortable: true,
            isSearchable: true,
            isNumber: true,
            classes: 'width-100px',
            cellContentClasses: 'white-space-pre ellipsis',
          },
        ],
      } as ColumnOptionsMap
    },

    selectedBranch(): string {
      return this.branchesStore.selectedBranchId
    },

    ...mapStores(useBranchesStore),
  },
  methods: {
    loadCustomResponses() {
      RequestsUtils.sendRequest({
        methodName: 'GET',
        url: `configs/${this.selectedBranch}/d/actions/`,
        config: {headers: {'x-fields': 'id, name'}},
      }).then((response: AxiosResponse<CustomResponse[]>) => {
        this.customResponsesNames = _.sortBy(_.map(response.data, (entity) => {
          return [entity.id, entity.name]
        }), (e) => {
          return e[1]
        })
      })
    },

    goToRoute() {
      const currentRoute = `/${this.selectedBranch}/${this.selectedDocType}/list`
      if (this.$route.path !== currentRoute) {
        console.log('Switching document list, new document list path: ' + currentRoute)
        this.$router.push(currentRoute)
      }
    },

    async setSelectedDataFromRouteParams(forceLoadDocs: boolean = false) {
      this.setLoadingDocStatus(true)
      const prevDocType = this.selectedDocType
      const docTypeFromRoute = this.$route.params.doc_type?.toString()
      if (docTypeFromRoute && Object.keys(this.componentsMap).includes(docTypeFromRoute)) {
        this.selectedDocType = docTypeFromRoute as DocumentType
      } else {
        this.selectedDocType = Object.keys(this.componentsMap)[0] as DocumentType
      }
      if (forceLoadDocs || !prevDocType || prevDocType !== this.selectedDocType) {
        await this.loadDocs()
      }
      this.setLoadingDocStatus(false)
      this.goToRoute()
    },

    async loadDocs() {
      this.isDownloadLoading = true
      const fieldNames = _.flatMap(this.columns, 'fieldNames')
      const url = `configs/${this.selectedBranch}/d/${this.selectedDocType}/`
      const response = await RequestsUtils.sendRequest({
        methodName: 'GET',
        url: url,
        config: {headers: {'x-fields': `id, ${_.uniq(fieldNames).join(', ')}`}},
        onFail: () => {
          console.log('Error while attempting to load documents')
          this.docs = []
          this.isDownloadLoading = false
        },
      })
      this.docs = response?.data || []
      // After we load the basic data (with x-fields) we can async load the full data for the download
      this.cancelSource.cancel(`Operation cancelled and restarted for a new document type ${this.selectedDocType}`)
      this.cancelSource = axios.CancelToken.source()
      RequestsUtils.sendRequest({
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
      const routeToDoc = `/${this.selectedBranch}/${this.selectedDocType}/config/${id}`
      this.$router.push(routeToDoc)
    },

    async addNewDoc() {
      this.setLoadingDocStatus(true)
      this.isNewLoading = true
      const docToAdd = this.newDoc()

      const docTypeText = this.titles[this.selectedDocType + '-singular']
      const successMessage = `New ${docTypeText} was created.`
      const failureMessage = `Failed while attempting to create the new ${docTypeText}.`
      const data = docToAdd
      const url = `configs/${this.selectedBranch}/d/${this.selectedDocType}/e/`
      await RequestsUtils.sendRequest({
        methodName: 'POST',
        url,
        data,
        successMessage,
        failureMessage,
      }).then(() => {
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

    redirectToVersionControl() {
      this.$router.push(`${this.selectedBranch}/versioncontrol`)
    },

    restoreGitVersion() {
      this.loadDocs()
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

:deep(.rbz-table .multi-line) {
  height: fit-content;
  max-height: 5rem;
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
