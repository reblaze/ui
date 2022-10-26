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
      <div class="card">
        <div class="card-content">
          <div class="content">
            <rbz-table :columns="columns"
                       :data="configTemplates"
                       :default-sort-column-index="1"
                       :show-filter-button="true"
                       :show-menu-column="true"
                       :show-new-button="true"
                       @new-button-clicked="addNewConfigTemplate"
                       :row-clickable="true"
                       @row-clicked="editConfigTemplate"
                       :show-row-button="true"
                       @row-button-clicked="editConfigTemplate">
            </rbz-table>
            <span class="is-family-monospace has-text-grey-lighter is-inline-block mt-3">
                {{ documentListAPIPath }}
              </span>
          </div>
        </div>
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
import {ColumnOptions, ConfigTemplate} from '@/types'
import DatasetsUtils from '@/assets/DatasetsUtils'
import RequestsUtils from '@/assets/RequestsUtils'
import Utils from '@/assets/Utils'
import {mapStores} from 'pinia'
import {useBranchesStore} from '@/stores/BranchesStore'

export default defineComponent({
  name: 'ConfigTemplateList',
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
          title: 'Static IP Rate Limit',
          fieldNames: ['limit_req_rate', 'limit_req_burst'],
          displayFunction: (item: ConfigTemplate) => {
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
          displayFunction: (item: ConfigTemplate) => {
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
      configTemplates: [],
      loadingDocCounter: 0,
      isDownloadLoading: false,
      apiRoot: RequestsUtils.reblazeAPIRoot,
      apiVersion: RequestsUtils.reblazeAPIVersion,
    }
  },

  watch: {
    selectedBranch: {
      handler: function(val, oldVal) {
        if ((this.$route.name as string).includes('ConfigTemplates/list') && val && val !== oldVal) {
          this.loadConfigTemplates()
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

    newConfigTemplate(): ConfigTemplate {
      const factory = DatasetsUtils.newOperationEntryFactory['proxy-templates']
      return factory && factory()
    },

    editConfigTemplate(id: string) {
      this.$router.push(`/${this.selectedBranch}/config-templates/config/${id}`)
    },

    async addNewConfigTemplate() {
      this.isNewLoading = true
      const configTemplateToAdd = this.newConfigTemplate()
      const configTemplateText = this.titles['proxy-templates-singular']
      const successMessage = `New ${configTemplateText} was created.`
      const failureMessage = `Failed while attempting to create the new ${configTemplateText}.`
      const url = `configs/${this.selectedBranch}/d/proxy-templates/e/${configTemplateToAdd.id}`
      const data = configTemplateToAdd
      await RequestsUtils.sendReblazeRequest({methodName: 'POST', url, data, successMessage, failureMessage})
      this.editConfigTemplate(configTemplateToAdd.id)
      this.isNewLoading = false
    },

    downloadDoc() {
      if (!this.isDownloadLoading) {
        Utils.downloadFile(this.titles['proxy-templates'], 'json', this.configTemplates)
      }
    },

    async loadConfigTemplates() {
      const url = `configs/${this.selectedBranch}/d/proxy-templates/`
      const response = await RequestsUtils.sendReblazeRequest({methodName: 'GET', url})
      this.configTemplates = response?.data
    },

    async switchBranch() {
      this.setLoadingDocStatus(true)
      Utils.toast(`Switched to branch '${this.selectedBranch}'.`, 'is-info')
      await this.loadConfigTemplates()
      this.setLoadingDocStatus(false)
    },
  },
  async created() {
    await this.branchesStore.list
  },
})
</script>
