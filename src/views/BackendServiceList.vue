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
                         :show-row-button="true"
                         @row-button-clicked="editBackendService">
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

export default defineComponent({
  name: 'BackendServiceList',
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
          classes: 'width-120px',
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
          classes: 'width-120px',
        },
      ] as ColumnOptions[],
      isNewLoading: false,
      titles: DatasetsUtils.titles,
      backendServices: [],
      selectedBranch: null,
      configs: [],

      loadingDocCounter: 0,
      isDownloadLoading: false,

      apiRoot: RequestsUtils.reblazeAPIRoot,
      apiVersion: RequestsUtils.reblazeAPIVersion,
    }
  },

  computed: {
    documentListAPIPath(): string {
      const apiPrefix = `${this.apiRoot}/${this.apiVersion}`
      return `${apiPrefix}/reblaze/configs/${this.selectedBranch}/d/backends/`
    },

    branchNames(): string[] {
      return this.configs?.length ? _.sortBy(_.map(this.configs, 'id')) : []
    },
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
      const routeToEditBackendService = `/backend-services/config/${id}`
      this.$router.push(routeToEditBackendService)
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

    async loadConfigs() {
      let configs
      try {
        const response = await RequestsUtils.sendRequest({
          methodName: 'GET',
          url: 'configs/',
          config: {headers: {'x-fields': 'id'}},
        })
        configs = response.data
      } catch (err) {
        console.log('Error while attempting to get configs')
        console.log(err)
      }
      console.log('loaded configs: ', configs)
      this.configs = configs
      this.selectedBranch = this.branchNames[0]
    },

    async switchBranch() {
      this.setLoadingDocStatus(true)
      Utils.toast(`Switched to branch '${this.selectedBranch}'.`, 'is-info')
      await this.loadBackendServices()
      this.setLoadingDocStatus(false)
    },
  },
  async created() {
    await this.loadConfigs()
    this.loadBackendServices()
  },
})
</script>
