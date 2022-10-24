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
                       :data="mobileSDKs"
                       :show-menu-column="true"
                       :show-filter-button="true"
                       :show-new-button="true"
                       @new-button-clicked="addNewSDK"
                       :row-clickable="true"
                       @row-clicked="editMobileSDK"
                       :show-row-button="true"
                       @row-button-clicked="editMobileSDK">
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
import {defineComponent} from 'vue'
import RbzTable from '@/components/RbzTable.vue'
import {ColumnOptions, MobileSDK} from '@/types'
import DatasetsUtils from '@/assets/DatasetsUtils'
import RequestsUtils from '@/assets/RequestsUtils'
import Utils from '@/assets/Utils'
import {mapStores} from 'pinia'
import {useBranchesStore} from '@/stores/BranchesStore'

export default defineComponent({
  name: 'MobileSDKList',
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
          classes: 'width-120px',
        },
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
          title: 'Grace Period',
          fieldNames: ['grace'],
          displayFunction: (item: MobileSDK) => {
            return `${item.grace} seconds`
          },
          isSortable: true,
          isSearchable: true,
          classes: 'width-100px',
        },
        {
          title: 'Token Header Name',
          fieldNames: ['uid_header'],
          isSortable: true,
          isSearchable: true,
          classes: 'width-150px',
        },
      ] as ColumnOptions[],
      isNewLoading: false,
      titles: DatasetsUtils.titles,
      mobileSDKs: [],
      loadingDocCounter: 0,
      isDownloadLoading: false,
      apiRoot: RequestsUtils.reblazeAPIRoot,
      apiVersion: RequestsUtils.reblazeAPIVersion,
    }
  },

  watch: {
    selectedBranch: {
      handler: function(val, oldVal) {
        if ((this.$route.name as string).includes('MobileSDKs/list') && val && val !== oldVal) {
          this.loadMobileSDKs()
        }
      },
      immediate: true,
    },
  },

  computed: {
    documentListAPIPath(): string {
      const apiPrefix = `${this.apiRoot}/${this.apiVersion}`
      return `${apiPrefix}/reblaze/configs/${this.selectedBranch}/d/mobile-sdks/`
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

    newMobileSDK(): MobileSDK {
      const factory = DatasetsUtils.newOperationEntryFactory['mobile-sdks']
      return factory && factory()
    },

    editMobileSDK(id: string) {
      this.$router.push(`/${this.selectedBranch}/mobile-sdks/config/${id}`)
    },

    async addNewSDK() {
      this.isNewLoading = true
      const mobileSDKToAdd = this.newMobileSDK()
      const mobileSDKText = this.titles['mobile-sdks-singular']
      const successMessage = `New ${mobileSDKText} was created.`
      const failureMessage = `Failed while attempting to create the new ${mobileSDKText}.`
      const url = `configs/${this.selectedBranch}/d/mobile-sdks/e/${mobileSDKToAdd.id}/`
      const data = mobileSDKToAdd
      await RequestsUtils.sendReblazeRequest({
        methodName: 'POST',
        url,
        data,
        successMessage,
        failureMessage,
      })
      this.editMobileSDK(mobileSDKToAdd.id)
      this.isNewLoading = false
    },

    downloadDoc() {
      if (!this.isDownloadLoading) {
        Utils.downloadFile('mobile-sdks', 'json', this.mobileSDKs)
      }
    },

    async loadMobileSDKs() {
      const url = `configs/${this.selectedBranch}/d/mobile-sdks/`
      const response = await RequestsUtils.sendReblazeRequest({methodName: 'GET', url})
      this.mobileSDKs = response?.data
    },

    async switchBranch() {
      this.setLoadingDocStatus(true)
      Utils.toast(`Switched to branch '${this.selectedBranch}'.`, 'is-info')
      await this.loadMobileSDKs()
      this.setLoadingDocStatus(false)
    },
  },
  async created() {
    await this.branchesStore.list
  },
})
</script>
