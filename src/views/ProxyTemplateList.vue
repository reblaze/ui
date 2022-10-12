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
                         :data="proxyTemplates"
                         :show-menu-column="true"
                         :show-filter-button="true"
                         :show-new-button="true"
                         @new-button-clicked="addNewProxyTemplate"
                         :show-edit-button="true"
                         @edit-button-clicked="editProxyTemplate">
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
import {ColumnOptions, ProxyTemplate} from '@/types'
import DatasetsUtils from '@/assets/DatasetsUtils'
import RequestsUtils from '@/assets/RequestsUtils'
import Utils from '@/assets/Utils'

export default defineComponent({
  name: 'ProxyTemplateList',
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
          title: 'Static IP Rate Limit',
          fieldNames: ['limit_req_rate', 'limit_req_burst'],
          displayFunction: (item: ProxyTemplate) => {
            return [
              `<span class="width-50px is-inline-block">Rate:</span> ${item['limit_req_rate']} / second`,
              `<span class="width-50px is-inline-block">Burst:</span> ${item['limit_req_burst']} / second`,
            ].join('\n')
          },
          classes: 'width-150px white-space-pre',
        },
        {
          title: 'Proxy Timeout',
          fieldNames: ['proxy_connect_timeout', 'proxy_send_timeout', 'proxy_read_timeout'],
          displayFunction: (item: ProxyTemplate) => {
            return [
              `<span class="width-60px is-inline-block">Connect:</span> ${item['proxy_connect_timeout']}`,
              `<span class="width-60px is-inline-block">Send:</span> ${item['proxy_send_timeout']}`,
              `<span class="width-60px is-inline-block">Read:</span> ${item['proxy_read_timeout']}`,
            ].join('\n')
          },
          classes: 'width-100px white-space-pre',
        },
      ] as ColumnOptions[],
      isNewLoading: false,
      titles: DatasetsUtils.titles,
      proxyTemplates: [],
      selectedBranch: null,
      configs: [],
      branches: 0,
      loadingDocCounter: 0,
      isDownloadLoading: false,
      apiRoot: RequestsUtils.reblazeAPIRoot,
      apiVersion: RequestsUtils.reblazeAPIVersion,
    }
  },

  computed: {
    documentListAPIPath(): string {
      const apiPrefix = `${this.apiRoot}/${this.apiVersion}`
      return `${apiPrefix}/reblaze/configs/${this.selectedBranch}/d/proxy-templates/`
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

    newProxyTemplate(): ProxyTemplate {
      const factory = DatasetsUtils.newOperationEntryFactory['proxy-templates']
      return factory && factory()
    },

    editProxyTemplate(id: string) {
      const routeToEditProxyTemplate = `/proxy-templates/config/${id}`
      this.$router.push(routeToEditProxyTemplate)
    },

    async addNewProxyTemplate() {
      this.isNewLoading = true
      const proxyTemplateToAdd = this.newProxyTemplate()
      const proxyTemplateText = this.titles['proxy-templates-singular']
      const successMessage = `New ${proxyTemplateText} was created.`
      const failureMessage = `Failed while attempting to create the new ${proxyTemplateText}.`
      const url = `configs/${this.selectedBranch}/d/proxy-templates/e/${proxyTemplateToAdd.id}`
      const data = proxyTemplateToAdd
      await RequestsUtils.sendReblazeRequest({methodName: 'POST', url, data, successMessage, failureMessage})
      this.editProxyTemplate(proxyTemplateToAdd.id)
      this.isNewLoading = false
    },

    downloadDoc() {
      if (!this.isDownloadLoading) {
        Utils.downloadFile('proxy-templates', 'json', this.proxyTemplates)
      }
    },

    async loadProxyTemplates() {
      const url = `configs/${this.selectedBranch}/d/proxy-templates/`
      const response = await RequestsUtils.sendReblazeRequest({methodName: 'GET', url})
      this.proxyTemplates = _.values(response?.data)
    },

    async loadConfigs() {
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
      this.branches = _.size(configs)
      this.selectedBranch = this.branchNames[0]
    },

    async switchBranch() {
      this.setLoadingDocStatus(true)
      Utils.toast(`Switched to branch '${this.selectedBranch}'.`, 'is-info')
      await this.loadProxyTemplates()
      this.setLoadingDocStatus(false)
    },
  },
  async created() {
    await this.loadConfigs()
    this.loadProxyTemplates()
  },
})
</script>
