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
      <div class="card">
        <div class="card-content">
          <div class="content">
            <rbz-table :columns="columns"
                       :data="dynamicRulesData"
                       :show-menu-column="true"
                       :show-filter-button="true"
                       :show-new-button="true"
                       @new-button-clicked="addNewDynamicRule"
                       :show-row-button="true"
                       @row-button-clicked="editDynamicRule">
            </rbz-table>
            <span class="is-family-monospace has-text-grey-lighter">
                {{ documentListAPIPath }}
              </span>
          </div>
        </div>
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
// import _ from 'lodash'
import {defineComponent} from 'vue'
import RbzTable from '@/components/RbzTable.vue'
import {ColumnOptions, DynamicRule, GlobalFilter} from '@/types'
import DatasetsUtils from '@/assets/DatasetsUtils'
import RequestsUtils from '@/assets/RequestsUtils'
import Utils from '@/assets/Utils'
import {AxiosResponse} from 'axios'
import {mapStores} from 'pinia'
import {useBranchesStore} from '@/stores/BranchesStore'

export default defineComponent({
  name: 'DynamicRulesList',
  components: {
    RbzTable,
  },
  data() {
    return {
      columns: [
        {
          title: 'Name',
          fieldNames: ['name'],
          isSortable: true,
          isSearchable: true,
          classes: 'width-150px',
        },
        {
          title: 'Description',
          fieldNames: ['description'],
          isSortable: true,
          isSearchable: true,
          classes: 'width-100px',
        },
        {
          title: 'Timeframe',
          fieldNames: ['timeframe'],
          isSortable: true,
          isSearchable: true,
          classes: 'width-100px',
        },
        {
          title: 'Threshold',
          fieldNames: ['threshold'],
          isSortable: true,
          isSearchable: true,
          classes: 'width-100px',
        },
        {
          title: 'Action',
          fieldNames: ['action'],
          isSortable: true,
          isSearchable: true,
          classes: 'width-100px',
        },
        {
          title: 'Action',
          displayFunction: (item: DynamicRule) => {
            const matchingGlobalFilter = this.globalFiltersData.find((globalFilter: GlobalFilter) => {
              return globalFilter.id === `dr_${item.id}`
            })
            return matchingGlobalFilter.action?.join('\n')
          },
          isSortable: false,
          isSearchable: true,
          classes: 'width-100px white-space-pre ellipsis',
        },
        {
          title: 'Tags',
          displayFunction: (item: DynamicRule) => {
            const matchingGlobalFilter = this.globalFiltersData.find((globalFilter: GlobalFilter) => {
              return globalFilter.id === `dr_${item.id}`
            })
            return matchingGlobalFilter.tags?.join('\n')
          },
          isSortable: false,
          isSearchable: true,
          classes: 'width-100px white-space-pre ellipsis',
        },
      ] as ColumnOptions[],
      isNewLoading: false,
      titles: DatasetsUtils.titles,
      dynamicRulesData: [] as DynamicRule[],
      globalFiltersData: [] as {id: string, action: string, tags: string[]}[],
      loadingDocCounter: 0,
      isDownloadLoading: false,

      apiRoot: RequestsUtils.reblazeAPIRoot,
      apiVersion: RequestsUtils.reblazeAPIVersion,
    }
  },

  watch: {
    selectedBranch: {
      handler: async function(val, oldVal) {
        if ((this.$route.name as string).includes('DynamicRules/list') && val && val !== oldVal) {
          await this.loadDynamicRulesData()
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
    setLoadingDocStatus(isLoading: boolean) {
      if (isLoading) {
        this.loadingDocCounter++
      } else {
        this.loadingDocCounter--
      }
    },

    newDynamicRuleDoc(): DynamicRule {
      const factory = DatasetsUtils.newOperationEntryFactory['dynamic-rule']
      return factory && factory()
    },

    async addNewDynamicRule() {
      this.setLoadingDocStatus(true)
      this.isNewLoading = true
      const docToAdd = this.newDynamicRuleDoc()
      docToAdd.name = docToAdd.name + ' ' + docToAdd.id

      const docTypeText = this.titles['dynamic-rules-singular']
      const successMessage = `New ${docTypeText} was created.`
      const failureMessage = `Failed while attempting to create the new ${docTypeText}.`
      const data = docToAdd

      const url = `configs/${this.selectedBranch}/d/dynamic-rules/e/${docToAdd.id}`
      console.log('add new doc function', url, data, successMessage)
      await RequestsUtils.sendReblazeRequest({methodName: 'POST', url, data, successMessage, failureMessage,
      })
      // update the Tags and Actions from GlobalFilters
      const docMatchingGlobalFilter = DatasetsUtils.newDocEntryFactory['globalfilters']() as GlobalFilter
      docMatchingGlobalFilter.id = `dr_${docToAdd.id}`
      docMatchingGlobalFilter.active = (docToAdd as DynamicRule).active
      docMatchingGlobalFilter.name = 'Global Filter for Dynamic Rule ' + docToAdd.id
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
      this.isDownloadLoading = true
      const url = `configs/${this.selectedBranch}/d/dynamic-rules/`
      const response = await RequestsUtils.sendReblazeRequest({
        methodName: 'GET',
        url: url,
        config: {headers: {'x-fields': 'id, name, description, time-frame, threshold'}},
        onFail: () => {
          console.log('Error while attempting to load documents')
          this.dynamicRulesData = []
          this.isDownloadLoading = false
        },
      })
      this.dynamicRulesData = response?.data || []

      // bring Tags from GlobalFilters
      this.globalFiltersData = []

      this.dynamicRulesData.map(async (doc) => {
        const url = `configs/${this.selectedBranch}/d/globalfilters/e/dr_${doc.id}/`
        const config = {headers: {'x-fields': 'id, tags, action'}}
        RequestsUtils.sendRequest({methodName: 'GET', url, config, onFail: () => {
          console.log('Error while attempting to load documents')
          this.isDownloadLoading = false
        },
        }).then((responseGlobal: AxiosResponse<GlobalFilter>) => {
          console.log('responseGlobal.data.id', responseGlobal.data.id,
            'responseGlobal.data.tags', responseGlobal.data.tags)
          this.globalFiltersData.push({id: responseGlobal.data.id, tags: responseGlobal.data.tags,
            action: responseGlobal.data.action})
        })
      })
      this.isDownloadLoading = false
    },

  },
  async created() {
    this.setLoadingDocStatus(true)
    await this.branchesStore.list
    await this.loadDynamicRulesData()
    this.setLoadingDocStatus(false)
  },
})
</script>
