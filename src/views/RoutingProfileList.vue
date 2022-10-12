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
                         :data="routingProfiles"
                         :show-menu-column="true"
                         :show-filter-button="true"
                         :show-new-button="true"
                         @new-button-clicked="addNewProfile"
                         :show-edit-button="true"
                         @edit-button-clicked="editProfile">
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
import {ColumnOptions, RoutingProfile} from '@/types'
import DatasetsUtils from '@/assets/DatasetsUtils'
import RequestsUtils from '@/assets/RequestsUtils'
import Utils from '@/assets/Utils'

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
          title: 'Path',
          fieldNames: ['locations'],
          displayFunction: (item: RoutingProfile) => {
            return _.map(item.locations, 'path')?.join('\n')
          },
          isSortable: true,
          isSearchable: true,
          classes: 'width-120px white-space-pre',
        },
        {
          title: 'BE Service',
          fieldNames: ['beservice'],
          displayFunction: (item: RoutingProfile) => {
            return _.map(item.locations, 'backend_id')?.join('\n')
          },
          isSortable: true,
          isSearchable: true,
          classes: 'width-120px white-space-pre',
        },
        {
          title: 'Cloud Functions',
          fieldNames: ['locations'],
          displayFunction: (item: RoutingProfile) => {
            return _.map(item.cloud_functions)?.join('\n')
          },
          isSortable: true,
          isSearchable: true,
          classes: 'width-120px',
        },
      ] as ColumnOptions[],
      isNewLoading: false,
      titles: DatasetsUtils.titles,
      routingProfiles: [],
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
      return `${apiPrefix}/reblaze/configs/${this.selectedBranch}/d/routing-profiles/`
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

    newProfile(): RoutingProfile {
      const factory = DatasetsUtils.newOperationEntryFactory['routing-profiles']
      return factory && factory()
    },

    editProfile(id: string) {
      const routeToEditProfile = `/routing-profiles/config/${id}`
      this.$router.push(routeToEditProfile)
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
      this.routingProfiles = _.values(response?.data)
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
      await this.loadProfiles()
      this.setLoadingDocStatus(false)
    },
  },
  async created() {
    await this.loadConfigs()
    this.loadProfiles()
  },
})
</script>
