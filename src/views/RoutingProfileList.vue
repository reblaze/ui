<template>
  <div class="card-content">
    <div class="media">
      <div class="media-content">
        <div class="field is-grouped">
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
                       :data="routingProfiles"
                       :show-menu-column="true"
                       :show-filter-button="true"
                       :show-new-button="true"
                       @new-button-clicked="addNewProfile"
                       :show-row-button="true"
                       @row-button-clicked="editProfile">
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
import _ from 'lodash'
import {defineComponent} from 'vue'
import RbzTable from '@/components/RbzTable.vue'
import {ColumnOptions, RoutingProfile} from '@/types'
import DatasetsUtils from '@/assets/DatasetsUtils'
import RequestsUtils from '@/assets/RequestsUtils'
import Utils from '@/assets/Utils'
import {mapStores} from 'pinia'
import {useBranchesStore} from '@/stores/BranchesStore'

export default defineComponent({
  name: 'RoutingProfileList',
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
          title: 'Paths',
          fieldNames: ['locations'],
          displayFunction: (item: RoutingProfile) => {
            return item.locations.length
          },
          isSortable: true,
          isSearchable: true,
          classes: 'width-60px white-space-pre',
        },
        {
          title: 'Cloud Functions',
          fieldNames: ['locations'],
          displayFunction: (item: RoutingProfile) => {
            return _.sumBy(item.locations, (mapEntry) => {
              return mapEntry['cloud_functions']?.length || 0
            })
          },
          isSortable: true,
          isSearchable: true,
          classes: 'width-120px white-space-pre',
        },
      ] as ColumnOptions[],
      isNewLoading: false,
      titles: DatasetsUtils.titles,
      routingProfiles: [] as RoutingProfile[],
      loadingDocCounter: 0,
      isDownloadLoading: false,
      apiRoot: RequestsUtils.reblazeAPIRoot,
      apiVersion: RequestsUtils.reblazeAPIVersion,
    }
  },

  watch: {
    selectedBranch: {
      handler: function(val, oldVal) {
        if ((this.$route.name as string).includes('RoutingProfiles/list') && val && val !== oldVal) {
          this.loadProfiles()
        }
      },
      immediate: true,
    },
  },

  computed: {
    documentListAPIPath(): string {
      const apiPrefix = `${this.apiRoot}/${this.apiVersion}`
      return `${apiPrefix}/reblaze/configs/${this.selectedBranch}/d/routing-profiles/`
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

    newProfile(): RoutingProfile {
      const factory = DatasetsUtils.newOperationEntryFactory['routing-profiles']
      return factory && factory()
    },

    editProfile(id: string) {
      this.$router.push(`/${this.selectedBranch}/routing-profiles/config/${id}`)
    },

    async addNewProfile() {
      this.isNewLoading = true
      const profileToAdd = this.newProfile()
      const routingProfileText = this.titles['routing-profiles-singular']
      const successMessage = `New ${routingProfileText} was created.`
      const failureMessage = `Failed while attempting to create the new ${routingProfileText}.`
      const url = `configs/${this.selectedBranch}/d/routing-profiles/e/${profileToAdd.id}`
      const data = profileToAdd
      await RequestsUtils.sendReblazeRequest({methodName: 'POST', url, data, successMessage, failureMessage})
      this.editProfile(profileToAdd.id)
      this.isNewLoading = false
    },

    downloadDoc() {
      if (!this.isDownloadLoading) {
        Utils.downloadFile('routing-profiles', 'json', this.routingProfiles)
      }
    },

    async loadProfiles() {
      const url = `configs/${this.selectedBranch}/d/routing-profiles/`
      const response = await RequestsUtils.sendReblazeRequest({methodName: 'GET', url})
      this.routingProfiles = response?.data
    },

    async switchBranch() {
      this.setLoadingDocStatus(true)
      Utils.toast(`Switched to branch '${this.selectedBranch}'.`, 'is-info')
      await this.loadProfiles()
      this.setLoadingDocStatus(false)
    },
  },
  async created() {
    await this.branchesStore.list
  },
})
</script>
