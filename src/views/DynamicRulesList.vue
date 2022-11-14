<template>
  <div class="card-content">
    <div class="media">
      <div class="media-content">
        <div class="field is-grouped is-pulled-right">
          <p class="control">
            <button class="button is-small download-doc-button"
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
         v-show="!loadingDocCounter && selectedBranch">
      <div class="content">
        <rbz-table :columns="columns"
                   :data="dynamicRulesData"
                   :default-sort-column-index="1"
                   :show-menu-column="true"
                   :show-filter-button="true"
                   :show-new-button="true"
                   @new-button-clicked="addNewDynamicRule"
                   :row-clickable="true"
                   @row-clicked="editDynamicRule"
                   :show-row-button="true"
                   @row-button-clicked="editDynamicRule">
        </rbz-table>
        <span class="is-family-monospace has-text-grey-lighter is-inline-block mt-3">
          {{ documentListAPIPath }}
        </span>
      </div>
    </div>

    <div class="content no-data-wrapper"
         v-if="loadingDocCounter || !selectedBranch">
      <button class="button is-outlined is-text is-small is-loading document-loading">
        Loading
      </button>
    </div>
  </div>
</template>
<script lang="ts">
import _ from 'lodash'
import {defineComponent} from 'vue'
import RbzTable from '@/components/RbzTable.vue'
import {ColumnOptions, CustomResponse, DynamicRule, GlobalFilter} from '@/types'
import DatasetsUtils from '@/assets/DatasetsUtils'
import RequestsUtils from '@/assets/RequestsUtils'
import Utils from '@/assets/Utils'
import {AxiosResponse} from 'axios'
import {mapStores} from 'pinia'
import {useBranchesStore} from '@/stores/BranchesStore'

type MiniGlobalFilter = {
  id: string,
  action: string,
  tags: string[]
}

export default defineComponent({
  name: 'DynamicRulesList',
  components: {
    RbzTable,
  },
  data() {
    return {
      columns: [
        {
          title: 'ID',
          fieldNames: ['id'],
          isSortable: true,
          isSearchable: true,
          classes: 'width-130px ellipsis',
        },
        {
          title: 'Name',
          fieldNames: ['name'],
          isSortable: true,
          isSearchable: true,
          classes: 'ellipsis',
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
          title: 'Threshold',
          fieldNames: ['threshold'],
          isSortable: true,
          isSearchable: true,
          isNumber: true,
          classes: 'width-100px',
        },
        {
          title: 'Custom Response',
          displayFunction: (item: DynamicRule) => {
            const matchingGlobalFilter = _.find(this.globalFiltersData, (globalFilter: GlobalFilter) => {
              return globalFilter.id === `dr_${item.id}`
            })
            const customResponse = _.find(this.customResponsesNames, (customResponseName) => {
              return customResponseName[0] === matchingGlobalFilter?.action
            })
            return customResponse?.[1] || ''
          },
          isSortable: false,
          isSearchable: true,
          classes: 'width-100px white-space-pre ellipsis',
        },
        {
          title: 'Tags',
          displayFunction: (item: DynamicRule) => {
            if (this.globalFiltersData.length > 0) {
              const matchingGlobalFilter = _.find(this.globalFiltersData, (globalFilter: GlobalFilter) => {
                return globalFilter.id === `dr_${item.id}`
              })
              return matchingGlobalFilter ? matchingGlobalFilter.tags?.join('\n') : ''
            } else {
              return ''
            }
          },
          isSortable: false,
          isSearchable: true,
          classes: 'width-100px vertical-scroll white-space-pre ellipsis',
        },
      ] as ColumnOptions[],
      isNewLoading: false,
      titles: DatasetsUtils.titles,
      dynamicRulesData: [] as DynamicRule[],
      globalFiltersData: [] as MiniGlobalFilter[],
      loadingDocCounter: 0,
      isDownloadLoading: false,
      customResponsesNames: [],

      apiRoot: RequestsUtils.reblazeAPIRoot,
      apiVersion: RequestsUtils.reblazeAPIVersion,
    }
  },

  watch: {
    selectedBranch: {
      handler: async function(val, oldVal) {
        if ((this.$route.name as string).includes('DynamicRules/list') && val && val !== oldVal) {
          await this.loadDynamicRulesData()
          // this.loadCustomResponses()
        }
      },
      immediate: true,
    },
  },

  computed: {
    documentListAPIPath(): string {
      const apiPrefix = `${this.apiRoot}/${this.apiVersion}`
      return `${apiPrefix}/reblaze/configs/${this.selectedBranch}/d/dynamic-rules/`
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

    setLoadingDocStatus(isLoading: boolean) {
      if (isLoading) {
        this.loadingDocCounter++
      } else {
        this.loadingDocCounter--
      }
    },

    newDynamicRuleDoc(): DynamicRule {
      const factory = DatasetsUtils.newOperationEntryFactory['dynamic-rules']
      return factory && factory()
    },

    async addNewDynamicRule() {
      this.setLoadingDocStatus(true)
      this.isNewLoading = true
      const docToAdd = this.newDynamicRuleDoc()
      const docTypeText = this.titles['dynamic-rules-singular']
      const successMessage = `New ${docTypeText} was created.`
      const failureMessage = `Failed while attempting to create the new ${docTypeText}.`
      const data = docToAdd
      const url = `configs/${this.selectedBranch}/d/dynamic-rules/e/${docToAdd.id}`
      await RequestsUtils.sendReblazeRequest({methodName: 'POST', url, data, successMessage, failureMessage,
      })
      // update the Tags and Actions from GlobalFilters
      const docMatchingGlobalFilter = DatasetsUtils.newDocEntryFactory['globalfilters']() as GlobalFilter
      docMatchingGlobalFilter.id = `dr_${docToAdd.id}`
      docMatchingGlobalFilter.active = (docToAdd as DynamicRule).active
      docMatchingGlobalFilter.name = 'Global Filter for Dynamic Rule ' + docToAdd.id
      docMatchingGlobalFilter.action = 'action-dynamic-rule-block'
      const globalFiltersData = docMatchingGlobalFilter
      const globalFiltersUrl = `configs/${this.selectedBranch}/d/globalfilters/e/`
      await RequestsUtils.sendRequest({methodName: 'POST', url: globalFiltersUrl, data: globalFiltersData})

      this.editDynamicRule(docToAdd.id)

      this.isNewLoading = false
      this.setLoadingDocStatus(false)
    },

    editDynamicRule(id: string) {
      const routeToDoc = `/${this.selectedBranch}/dynamic-rules/config/${id}`
      this.$router.push(routeToDoc)
    },

    downloadDoc() {
      if (!this.isDownloadLoading) {
        Utils.downloadFile('dynamic-rules', 'json', this.dynamicRulesData)
      }
    },

    async loadDynamicRulesData() {
      this.setLoadingDocStatus(true)
      this.isDownloadLoading = true
      const url = `configs/${this.selectedBranch}/d/dynamic-rules/`
      const response = await RequestsUtils.sendReblazeRequest({
        methodName: 'GET',
        url: url,
        onFail: () => {
          console.log('Error while attempting to load documents')
          this.dynamicRulesData = []
          this.isDownloadLoading = false
        },
      })
      this.dynamicRulesData = response?.data || []

      // bring Tags from GlobalFilters
      this.globalFiltersData = [] as MiniGlobalFilter[]

      this.dynamicRulesData.map((doc) => {
        const url = `configs/${this.selectedBranch}/d/globalfilters/e/dr_${doc.id}/`
        RequestsUtils.sendRequest({methodName: 'GET', url,
          onFail: () => {
            console.log('Error while attempting to load documents')
            this.isDownloadLoading = false
          },
        }).then((responseGlobal: AxiosResponse<GlobalFilter>) => {
          this.globalFiltersData.push({id: responseGlobal.data.id, tags: responseGlobal.data.tags,
            action: responseGlobal.data.action})
        })
      })
      this.isDownloadLoading = false
      this.setLoadingDocStatus(false)
    },

  },
  async created() {
    await this.branchesStore.list
  },
})
</script>
