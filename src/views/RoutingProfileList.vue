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

      <div class="content document-editor-wrapper">
          <div class="content">
              <rbz-table :columns="columns"
                          :data="selectedRoutingProfiles"
                          :show-menu-column="true"
                          :show-filter-button="true"
                          :show-new-button="true"
                          @new-button-clicked="addNewProfile"
                          :show-edit-button="true"
                          @edit-button-clicked="editProfile">
              </rbz-table>
          </div>
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
  components: {
    RbzTable,
  },
  data() {
    return {
      mockArray: [
        {
          'name': 'NAME_test1',
          'id': 'ID_1a2b',
          'server_names': ['server1'],
          'locations': [
            {
              'path': '/test1',
              'backend_id': 'b2a1',
            },
            {
              'path': '/test2',
              'backend_id': 'b22a11',
            },
          ],
          'cloud_functions': ['cloudFuncTest1, cloudFuncTest2'],
        },
        {
          'name': 'NAME_test2',
          'id': 'ID_3c4d',
          'server_names': ['server3', 'server4'],
          'locations': [
            {
              'path': '/test3',
              'backend_id': 'd4c3',
            },
            {
              'path': '/test4',
              'backend_id': 'BACKENDID_d44c33',
            },
          ],
          'cloud_functions': ['cloudFuncTest3, cloudFuncTest4'],
        },
      ],
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
      selectedRoutingProfiles: [],
      selectedBranch: null,
      configs: [],
      branches: 0,
      loadingDocCounter: 0,
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

    newProfile(): RoutingProfile {
      const factory = DatasetsUtils.newOperationEntryFactory['routingprofiles']
      return factory && factory()
    },

    editProfile(id: string) {
      const routeToEditProfile = `/routing-profile/config/${id}`
      this.$router.push(routeToEditProfile)
    },
    async addNewProfile() {
      this.isNewLoading = true
      const profileToAdd = this.newProfile()
      const routingProfileText = this.titles['routingprofiles-singular']
      const successMessage = `New ${routingProfileText} was created.`
      const failureMessage = `Failed while attempting to create the new ${routingProfileText}.`
      const url = `config/d/routing-profiles/e/${profileToAdd.id}`
      const data = profileToAdd
      await RequestsUtils.sendReblazeRequest({methodName: 'POST', url, data, successMessage, failureMessage})
      this.editProfile(profileToAdd.id)
      this.isNewLoading = false
    },

    downloadDoc() {
      if (!this.isDownloadLoading) {
        Utils.downloadFile('routing-profile', 'json', this.selectedRoutingProfiles)
      }
    },

    async loadProfiles() {
      const url = `configs/${this.selectedBranch}/d/routing-profiles/`
      const response = await RequestsUtils.sendReblazeRequest({methodName: 'GET', url})
      this.selectedRoutingProfiles = _.values(response?.data)
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
