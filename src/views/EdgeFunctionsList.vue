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
         v-show="!loadingDocCounter && selectedBranch">
      <div class="content">
        <rbz-table :columns="columns"
                   :data="edgeFunctions"
                   :default-sort-column-index="1"
                   :show-menu-column="true"
                   :show-filter-button="true"
                   :show-new-button="true"
                   @new-button-clicked="addNewEdgeFunction"
                   :row-clickable="true"
                   @row-clicked="editEdgeFunction"
                   :show-row-button="true"
                   @row-button-clicked="editEdgeFunction">
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
import {defineComponent} from 'vue'
import RbzTable from '@/components/RbzTable.vue'
import {ColumnOptions, EdgeFunction} from '@/types'
import DatasetsUtils from '@/assets/DatasetsUtils'
import RequestsUtils from '@/assets/RequestsUtils'
import Utils from '@/assets/Utils'
import {mapStores} from 'pinia'
import {useBranchesStore} from '@/stores/BranchesStore'

export default defineComponent({
  name: 'EdgeFunctionList',
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
          title: 'Phase',
          fieldNames: ['phase'],
          displayFunction: (item: EdgeFunction) => {
            const titles = DatasetsUtils.titles
            return titles[item.phase]
          },
          isSortable: true,
          isSearchable: true,
          classes: 'width-100px',
        },
      ] as ColumnOptions[],
      isNewLoading: false,
      titles: DatasetsUtils.titles,
      edgeFunctions: [],
      loadingDocCounter: 0,
      isDownloadLoading: false,
      apiRoot: RequestsUtils.reblazeAPIRoot,
      apiVersion: RequestsUtils.reblazeAPIVersion,
    }
  },

  watch: {
    selectedBranch: {
      handler: function(val, oldVal) {
        if ((this.$route.name as string).includes('EdgeFunctions/list') && val && val !== oldVal) {
          this.loadDocs()
        }
      },
      immediate: true,
    },
  },

  computed: {
    documentListAPIPath(): string {
      const apiPrefix = `${this.apiRoot}/${this.apiVersion}`
      return `${apiPrefix}/reblaze/configs/${this.selectedBranch}/d/cloud-functions/`
    },

    selectedBranch(): string {
      return this.branchesStore.selectedBranchId
    },

    ...mapStores(useBranchesStore),
  },

  methods: {
    async loadDocs() {
      this.setLoadingDocStatus(true)
      this.isDownloadLoading = true
      const url = `configs/${this.selectedBranch}/d/cloud-functions/`
      const response = await RequestsUtils.sendReblazeRequest({methodName: 'GET', url})
      this.edgeFunctions = response?.data || []
      this.isDownloadLoading = false
      this.setLoadingDocStatus(false)
    },

    setLoadingDocStatus(isLoading: boolean) {
      if (isLoading) {
        this.loadingDocCounter++
      } else {
        this.loadingDocCounter--
      }
    },

    newEdgeFunction(): EdgeFunction {
      const factory = DatasetsUtils.newDocEntryFactory['cloud-functions']
      return factory && factory()
    },

    editEdgeFunction(id: string) {
      this.$router.push(`/${this.selectedBranch}/cloud-functions/config/${id}`)
    },

    async addNewEdgeFunction() {
      this.isNewLoading = true
      const cloudFunctionToAdd = this.newEdgeFunction()
      const cloudFunctionText = this.titles['cloud-functions-singular']
      const successMessage = `New ${cloudFunctionText} was created.`
      const failureMessage = `Failed while attempting to create the new ${cloudFunctionText}.`
      const url = `configs/${this.selectedBranch}/d/cloud-functions/e/${cloudFunctionToAdd.id}/`
      const data = cloudFunctionToAdd
      await RequestsUtils.sendReblazeRequest({
        methodName: 'POST',
        url,
        data,
        successMessage,
        failureMessage,
      })
      this.editEdgeFunction(cloudFunctionToAdd.id)
      this.isNewLoading = false
    },

    downloadDoc() {
      if (!this.isDownloadLoading) {
        Utils.downloadFile('cloud-functions', 'json', this.edgeFunctions)
      }
    },
  },
  async created() {
    await this.branchesStore.list
  },
})
</script>
