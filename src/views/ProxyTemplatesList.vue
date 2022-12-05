<template>
  <div class="card-content">
    <div class="media">
      <div class="media-content">
        <div class="field is-grouped is-pulled-right">
          <p class="control">
            <button :class="{'is-loading':isDownloadLoading}"
                    class="button is-small download-doc-button"
                    data-qa="download-document"
                    title="Download document"
                    @click="downloadDoc()">
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

    <div v-show="!loadingDocCounter && selectedBranch"
         class="content document-list-wrapper">
      <div class="content">
        <rbz-table :columns="columns"
                   :data="proxyTemplates"
                   :default-sort-column-index="1"
                   :show-filter-button="true"
                   :show-menu-column="true"
                   :show-new-button="true"
                   @new-button-clicked="addNewProxyTemplate"
                   :row-clickable="true"
                   @row-clicked="editProxyTemplate"
                   :show-row-button="true"
                   @row-button-clicked="editProxyTemplate">
        </rbz-table>
        <span class="is-family-monospace has-text-grey-lighter is-inline-block mt-3">
          {{ documentListAPIPath }}
        </span>
      </div>
    </div>

    <div v-if="loadingDocCounter || !selectedBranch"
         class="content no-data-wrapper">
      <button class="button is-outlined is-text is-small is-loading document-loading">
        Loading
      </button>
    </div>
  </div>
</template>
<script lang="ts">
import {defineComponent} from 'vue'
import RbzTable from '@/components/RbzTable.vue'
import {ColumnOptions, ProxyTemplate} from '@/types'
import DatasetsUtils from '@/assets/DatasetsUtils'
import RequestsUtils from '@/assets/RequestsUtils'
import Utils from '@/assets/Utils'
import {mapStores} from 'pinia'
import {useBranchesStore} from '@/stores/BranchesStore'

export default defineComponent({
  name: 'ProxyTemplateList',
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
          title: 'Static IP Rate Limit',
          fieldNames: ['limit_req_rate', 'limit_req_burst'],
          displayFunction: (item: ProxyTemplate) => {
            return [
              `<span class="width-50px is-inline-block">Rate:</span> ${item['limit_req_rate']} / second`,
              `<span class="width-50px is-inline-block">Burst:</span> ${item['limit_req_burst']} / second`,
            ].join('\n')
          },
          classes: 'width-200px',
          cellContentClasses: 'multi-line white-space-pre ellipsis',
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
          classes: 'width-150px',
          cellContentClasses: 'multi-line white-space-pre ellipsis',
        },
      ] as ColumnOptions[],
      isNewLoading: false,
      titles: DatasetsUtils.titles,
      proxyTemplates: [],
      loadingDocCounter: 0,
      isDownloadLoading: false,
      apiRoot: RequestsUtils.reblazeAPIRoot,
      apiVersion: RequestsUtils.reblazeAPIVersion,
    }
  },

  watch: {
    selectedBranch: {
      handler: function(val, oldVal) {
        if ((this.$route.name as string).includes('ProxyTemplates/list') && val && val !== oldVal) {
          this.loadProxyTemplates()
        }
      },
      immediate: true,
    },
  },

  computed: {
    documentListAPIPath(): string {
      const apiPrefix = `${this.apiRoot}/${this.apiVersion}`
      return `${apiPrefix}/reblaze/configs/${this.selectedBranch}/d/proxy-templates/`
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

    newProxyTemplate(): ProxyTemplate {
      const factory = DatasetsUtils.newOperationEntryFactory['proxy-templates']
      return factory && factory()
    },

    editProxyTemplate(id: string) {
      this.$router.push(`/${this.selectedBranch}/proxy-templates/config/${id}`)
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
        Utils.downloadFile(this.titles['proxy-templates'], 'json', this.proxyTemplates)
      }
    },

    async loadProxyTemplates() {
      this.setLoadingDocStatus(true)
      this.isDownloadLoading = true
      const url = `configs/${this.selectedBranch}/d/proxy-templates/`
      const response = await RequestsUtils.sendReblazeRequest({methodName: 'GET', url})
      this.proxyTemplates = response?.data
      this.isDownloadLoading = false
      this.setLoadingDocStatus(false)
    },

    async switchBranch() {
      this.setLoadingDocStatus(true)
      Utils.toast(`Switched to branch '${this.selectedBranch}'.`, 'is-info')
      await this.loadProxyTemplates()
      this.setLoadingDocStatus(false)
    },
  },
  async created() {
    await this.branchesStore.list
  },
})
</script>
<style scoped lang="scss">
:deep(.multi-line) {
  height: fit-content;
  max-height: fit-content;
  min-height: 50px;
}
</style>

