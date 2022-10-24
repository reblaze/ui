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
                       :data="backendServices"
                       :show-menu-column="true"
                       :show-filter-button="true"
                       :show-new-button="true"
                       @new-button-clicked="addNewBackendService"
                       :row-clickable="true"
                       @row-clicked="editBackendService"
                       :show-row-button="true"
                       @row-button-clicked="editBackendService">
            </rbz-table>
            <span class="is-family-monospace has-text-grey-lighter is-inline-block mt-3">
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
import _ from 'lodash'
import {defineComponent} from 'vue'
import RbzTable from '@/components/RbzTable.vue'
import {BackendService, ColumnOptions} from '@/types'
import DatasetsUtils from '@/assets/DatasetsUtils'
import RequestsUtils from '@/assets/RequestsUtils'
import Utils from '@/assets/Utils'
import backendServicesConsts from '@/assets/backendServicesConsts'
import {mapStores} from 'pinia'
import {useBranchesStore} from '@/stores/BranchesStore'

export default defineComponent({
  name: 'BackendServiceList',
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
          classes: 'width-130px',
        },
        {
          title: 'Name',
          fieldNames: ['name'],
          isSortable: true,
          isSearchable: true,
          classes: 'width-130px',
        },
        {
          title: 'Description',
          fieldNames: ['description'],
          isSortable: true,
          isSearchable: true,
          classes: 'ellipsis',
        },
        {
          title: 'Hosts',
          fieldNames: ['back_hosts'],
          displayFunction: (item: BackendService) => {
            return _.map(item.back_hosts, 'host')
          },
          isSortable: true,
          isSearchable: true,
          classes: 'width-150px',
        },
        {
          title: 'Transport Protocol',
          fieldNames: ['transport_mode'],
          displayFunction: (item: BackendService) => {
            return backendServicesConsts.transportProtocols.find((protocol) => {
              return item.transport_mode === protocol.value
            }).name
          },
          isSortable: true,
          isSearchable: true,
          classes: 'width-150px',
        },
        {
          title: 'Stickiness Model',
          fieldNames: ['sticky'],
          displayFunction: (item: BackendService) => {
            return backendServicesConsts.stickinessModels.find((protocol) => {
              return item.sticky === protocol.value
            }).name
          },
          isSortable: true,
          isSearchable: true,
          classes: 'width-130px',
        },
      ] as ColumnOptions[],
      isNewLoading: false,
      titles: DatasetsUtils.titles,
      backendServices: [],

      loadingDocCounter: 0,
      isDownloadLoading: false,

      apiRoot: RequestsUtils.reblazeAPIRoot,
      apiVersion: RequestsUtils.reblazeAPIVersion,
    }
  },

  watch: {
    selectedBranch: {
      handler: function(val, oldVal) {
        if ((this.$route.name as string).includes('BackendServices/list') && val && val !== oldVal) {
          this.loadBackendServices()
        }
      },
      immediate: true,
    },
  },

  computed: {
    documentListAPIPath(): string {
      const apiPrefix = `${this.apiRoot}/${this.apiVersion}`
      return `${apiPrefix}/reblaze/configs/${this.selectedBranch}/d/backends/`
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

    newBackendService(): BackendService {
      const factory = DatasetsUtils.newOperationEntryFactory['backends']
      return factory && factory()
    },

    editBackendService(id: string) {
      this.$router.push(`/${this.selectedBranch}/backend-services/config/${id}`)
    },

    async addNewBackendService() {
      this.isNewLoading = true
      const backendServiceToAdd = this.newBackendService()
      const backendServiceText = this.titles['backends-singular']
      const successMessage = `New ${backendServiceText} was created.`
      const failureMessage = `Failed while attempting to create the new ${backendServiceText}.`
      const url = `configs/${this.selectedBranch}/d/backends/e/${backendServiceToAdd.id}`
      const data = backendServiceToAdd
      await RequestsUtils.sendReblazeRequest({methodName: 'POST', url, data, successMessage, failureMessage})
      this.editBackendService(backendServiceToAdd.id)
      this.isNewLoading = false
    },

    downloadDoc() {
      if (!this.isDownloadLoading) {
        Utils.downloadFile('backends', 'json', this.backendServices)
      }
    },

    async loadBackendServices() {
      const url = `configs/${this.selectedBranch}/d/backends/`
      const response = await RequestsUtils.sendReblazeRequest({methodName: 'GET', url})
      this.backendServices = response?.data
    },

    async switchBranch() {
      this.setLoadingDocStatus(true)
      Utils.toast(`Switched to branch '${this.selectedBranch}'.`, 'is-info')
      await this.loadBackendServices()
      this.setLoadingDocStatus(false)
    },
  },
  async created() {
    await this.branchesStore.list
  },
})
</script>
