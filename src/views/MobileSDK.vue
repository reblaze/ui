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

      <div class="content no-data-wrapper"
           v-if="loadingDocCounter || !selectedBranch">
          <button class="button is-outlined is-text is-small is-loading document-loading">
            Loading
          </button>
      </div>
      <div class="content document-list-wrapper"
           v-show="!loadingDocCounter">
        <div class="card">
          <div class="card-content">
            <div class="content">
              <rbz-table :columns="columns"
                        :data="selectedMobileSDK"
                        :show-menu-column="true"
                        :show-filter-button="true"
                        :show-new-button="true"
                        @new-button-clicked="addNewSDK"
                        :show-edit-button="true"
                        @edit-button-clicked="editMobileSDK">
            </rbz-table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
// import _ from 'lodash'
import {defineComponent} from 'vue'
import RbzTable from '@/components/RbzTable.vue'
import {ColumnOptions, MobileSDK} from '@/types'
import DatasetsUtils from '@/assets/DatasetsUtils'
import RequestsUtils from '@/assets/RequestsUtils'
import _ from 'lodash'
import Utils from '@/assets/Utils'

export default defineComponent({
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
          title: 'Grace',
          fieldNames: ['grace'],
          isSortable: true,
          isSearchable: true,
          classes: 'width-120px white-space-pre',
        },
        {
          title: 'ID',
          fieldNames: ['id'],
          isSortable: true,
          isSearchable: true,
          classes: 'width-120px white-space-pre',
        },
      ] as ColumnOptions[],
      isNewLoading: false,
      titles: DatasetsUtils.titles,
      selectedMobileSDK: [],
      loadingDocCounter: 0,
      configs: [],
      selectedBranch: null,
      branches: 0,
      isDownloadLoading: false,
    }
  },

  computed: {
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

    downloadDoc() {
      if (!this.isDownloadLoading) {
        Utils.downloadFile('mobile-sdk', 'json', this.selectedMobileSDK)
      }
    },

    async switchBranch() {
      this.setLoadingDocStatus(true)
      Utils.toast(`Switched to branch '${this.selectedBranch}'.`, 'is-info')
      await this.loadMobileSDKs()
      this.setLoadingDocStatus(false)
    },

    newMobileSDK(): MobileSDK {
      const factory = DatasetsUtils.newOperationEntryFactory['mobilesdks']
      return factory && factory()
    },

    async loadConfigs(counterOnly?: boolean) {
      // store configs
      let configs
      try {
        const response = await RequestsUtils.sendRequest({methodName: 'GET', url: 'configs/'})
        configs = response.data
      } catch (err) {
        console.log('Error while attempting to get configs')
        console.log(err)
      }
      if (!counterOnly) {
        console.log('loaded configs: ', configs)
        this.configs = configs
      }
      this.branches = _.size(configs)
      console.log('config counters', this.branches)
      this.selectedBranch = this.branchNames[0]
    },

    editMobileSDK(id: string) {
      const routeToDoc = `/mobilesdk/config/${id}`
      this.$router.push(routeToDoc)
    },
    async addNewSDK() {
      this.isNewLoading = true
      const mobileSDKToAdd = this.newMobileSDK()
      const mobileSDKText = this.titles['mobilesdks-singular']
      const successMessage = `New ${mobileSDKText} was created.`
      const failureMessage = `Failed while attempting to create the new ${mobileSDKText}.`
      const url = `configs/${this.selectedBranch}/d/mobile-sdks/e/${mobileSDKToAdd.id}/`
      const data = mobileSDKToAdd
      const response = await RequestsUtils.sendReblazeRequest({methodName: 'POST', url, data, successMessage, failureMessage})
      this.editMobileSDK(response?.data)
      this.isNewLoading = false
    },

    async loadMobileSDKs() {
      const url = `configs/${this.selectedBranch}/d/mobile-sdks/`
      const response = await RequestsUtils.sendReblazeRequest({methodName: 'GET', url})
      this.selectedMobileSDK = response?.data
      console.log(this.selectedMobileSDK)
      this.selectedBranch = this.branchNames[0]
    },
  },
  async created() {
    await this.loadConfigs()
    this.loadMobileSDKs()
  },
})
</script>
