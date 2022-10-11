<template>
  <div class="card">
    <div class="card-content">
      <div class="media">
        <div class="media-content">
          <div class="columns">
            <div class="column">
              <div class="field is-grouped">
                <p class="control">
                  <button class="button is-small redirect-list-button"
                          @click="redirectToList()"
                          title="Return to list"
                          data-qa="redirect-to-list">
                        <span class="icon is-small">
                          <i class="fas fa-arrow-left"></i>
                        </span>
                  </button>
                </p>
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
            <div class="column">
              <div class="field is-grouped is-pulled-right">
                <p class="control">
                  <button class="button is-small save-document-button"
                          :class="{'is-loading': isSaveLoading}"
                          title="Save changes"
                          data-qa="save-changes"
                          @click="saveChanges()">
                      <span class="icon is-small">
                        <i class="fas fa-save"></i>
                      </span>
                  </button>
                </p>
                <p class="control">
                  <button class="button is-small has-text-danger delete-document-button"
                          title="Delete document"
                          :disabled="selectedRoutingProfile?.id === '__default__'"
                          data-qa="delete-document"
                          :class="{'is-loading': isDeleteLoading}"
                          @click="deleteDoc()">
                      <span class="icon is-small">
                        <i class="fas fa-trash"></i>
                      </span>
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <hr/>
      <div class="card">
        <div class="card-content">
          <div class="content"
               v-if="selectedRoutingProfile">
            <div class="columns columns-divided">
              <div class="column is-4">
                <div class="field">
                  <label class="label is-small">
                    Name
                    <span class="has-text-grey is-pulled-right document-id"
                          title="Rule id">
                              {{ selectedRoutingProfile.id }}
                          </span>
                  </label>
                  <div class="control">
                    <input class="input is-small routing-name"
                           title="Document name"
                           placeholder="Document name"
                           v-model="selectedRoutingProfile.name"/>
                  </div>
                </div>
                <div class="field">
                  <div class="field textarea-field">
                    <label class="label is-small">Description</label>
                    <div class="control">
                            <textarea class="is-small textarea routing-description"
                                      data-qa="routing-input"
                                      title="selectedRoutingProfile.description"
                                      v-model="selectedRoutingProfile.description"
                                      rows="5">
                            </textarea>
                    </div>
                  </div>
                </div>
              </div>
              <div class="column is-4 custom-panel">
                <div class="field">
                  <div class="field textarea-field">
                    <label class="label is-small">
                      Cloud Functions
                    </label>
                    <div class="control">
                            <textarea class="is-small textarea routing-description"
                                      data-qa="routing-input"
                                      :title="cloudFunctionIds"
                                      v-model="cloudFunctionIds"
                                      rows="3">
                            </textarea>
                    </div>
                  </div>
                </div>
                <div class="field">
                  <div class="field textarea-field">
                    <label class="label is-small">Server Names</label>
                    <div class="control">
                            <textarea class="is-small textarea routing-description"
                                      data-qa="routing-input"
                                      :title="serverNameIds"
                                      v-model="serverNameIds"
                                      rows="3">
                            </textarea>
                    </div>
                  </div>
                </div>
              </div>
              <div class="column is-4 custom-panel">
                <div class="field">
                  <label class="label is-small is-size-7 has-text-left form-label">
                    Backend Services
                  </label>
                  <div v-for="(location, index) in selectedRoutingProfile.locations"
                       :key="index"
                       class="columns mb-0 headers-columns">
                    <div class="column is-5">
                      <input class="input is-small location-path"
                             title="Path"
                             placeholder="Path"
                             v-model="location.path"/>
                    </div>
                    <div class="column is-5">
                      <input class="input is-small location-backend-id"
                             title="Backend ID"
                             placeholder="Backend ID"
                             v-model="location.backend_id"/>
                    </div>
                    <div class="column is-narrow">
                      <button class="button is-light is-small remove-icon is-small has-text-grey"
                              title="Click to remove location"
                              :disabled="selectedRoutingProfile.locations.length === 1"
                              @click="removeLocationElement(index)">
                        <span class="icon is-small"><i class="fas fa-trash fa-xs"></i></span>
                      </button>
                    </div>
                  </div>
                  <a title="Add new header"
                     class="is-text is-small is-size-7 ml-3 add-key-button"
                     data-qa="add-new-key-btn"
                     tabindex="0"
                     @keypress.space.prevent
                     @click="addLocationElement()">
                    New entry
                  </a>
                </div>
              </div>
            </div>
            <span class="is-family-monospace has-text-grey-lighter">{{ documentAPIPath }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import _ from 'lodash'
import RequestsUtils from '@/assets/RequestsUtils'
import {RoutingProfile} from '@/types'
import Utils from '@/assets/Utils'
import {defineComponent} from 'vue'
import DatasetsUtils from '@/assets/DatasetsUtils'

export default defineComponent({
  name: 'RoutingProfilesEditor',
  data() {
    return {
      loadingDocCounter: 0,
      docIdFromRoute: '',
      isDownloadLoading: false,
      selectedRoutingProfile: null as RoutingProfile,
      isSaveLoading: false,
      isDeleteLoading: false,
      titles: DatasetsUtils.titles,
      configs: [],
      selectedBranch: null,
      apiRoot: RequestsUtils.reblazeAPIRoot,
      apiVersion: RequestsUtils.reblazeAPIVersion,
    }
  },
  computed: {
    documentAPIPath(): string {
      const apiPrefix = `${this.apiRoot}/${this.apiVersion}`
      const selectedId = this.selectedRoutingProfile.id
      return `${apiPrefix}/reblaze/configs/${this.selectedBranch}/d/routing-profiles/e/${selectedId}/`
    },

    cloudFunctionIds: {
      get() {
        return this.selectedRoutingProfile.cloud_functions?.join('\n')
      },
      set(cloudFunctionStringToAdd: string): void {
        const splitCloudFunction = cloudFunctionStringToAdd.split('\n')
        if (splitCloudFunction !== this.selectedRoutingProfile.cloud_functions) {
          this.selectedRoutingProfile.cloud_functions = cloudFunctionStringToAdd.split('\n')
        }
      },
    },

    branchNames() {
      return this.configs?.length ? _.sortBy(_.map(this.configs, 'id')) : []
    },

    serverNameIds: {
      get() {
        return this.selectedRoutingProfile.server_names?.join('\n')
      },
      set(serverNameStringToAdd: string): void {
        const splitServerNames = serverNameStringToAdd.split('\n')
        if (splitServerNames !== this.selectedRoutingProfile.server_names) {
          this.selectedRoutingProfile.server_names = splitServerNames
        }
      },
    },
  },
  methods: {
    async setSelectedDataFromRouteParams() {
      this.setLoadingDocStatus(true)
      this.docIdFromRoute = this.$route.params.doc_id.toString()
      await this.loadProfile()
    },

    async loadConfigs(counterOnly?: boolean) {
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
      this.selectedBranch = this.branchNames[0]
    },

    redirectToList() {
      this.$router.push(`/routing-profiles/list`)
    },

    setLoadingDocStatus(isLoading: boolean) {
      if (isLoading) {
        this.loadingDocCounter++
      } else {
        this.loadingDocCounter--
      }
    },

    async switchBranch() {
      this.setLoadingDocStatus(true)
      Utils.toast(`Switched to branch '${this.selectedBranch}'.`, 'is-info')
      await this.loadProfile()
      this.setLoadingDocStatus(false)
    },

    downloadDoc() {
      if (!this.isDownloadLoading) {
        Utils.downloadFile('routing-profile', 'json', this.selectedRoutingProfile)
      }
    },

    async deleteDoc() {
      this.setLoadingDocStatus(true)
      this.isDeleteLoading = true
      const routingProfileText = this.titles['routing-singular']
      const url = `configs/${this.selectedBranch}/d/routing-profiles/e/${this.selectedRoutingProfile.id}/`
      const successMessage = `The ${routingProfileText} was deleted.`
      const failureMessage = `Failed while attempting to delete the ${routingProfileText}.`
      await RequestsUtils.sendReblazeRequest({
        methodName: 'DELETE',
        url: url,
        successMessage,
        failureMessage,
      })
      this.redirectToList()
      this.isDeleteLoading = false
      this.setLoadingDocStatus(false)
    },

    async saveChanges() {
      this.isSaveLoading = true
      const methodName = 'PUT'
      const url = `configs/${this.selectedBranch}/d/routing-profiles/e/${this.selectedRoutingProfile.id}/`
      const data = this.selectedRoutingProfile
      data.server_names = data.server_names.filter((item: string) => {
        return item
      })
      const routingProfileText = this.titles['routing-singular']
      const successMessage = `Changes to the ${routingProfileText} were saved.`
      const failureMessage = `Failed while attempting to save the changes to the ${routingProfileText}.`
      await RequestsUtils.sendReblazeRequest({methodName, url, data, successMessage, failureMessage})
      this.isSaveLoading = false
    },

    async loadProfile() {
      this.isDownloadLoading = true
      const response = await RequestsUtils.sendReblazeRequest({
        methodName: 'GET',
        url: `configs/${this.selectedBranch}/d/routing-profiles/e/${this.docIdFromRoute}`,
        onFail: () => {
          console.log('Error while attempting to load routing profiles')
          this.selectedRoutingProfile = null
          this.isDownloadLoading = false
        },
      })
      this.selectedRoutingProfile = response?.data || {}
      this.isDownloadLoading = false
    },

    addLocationElement(): void {
      this.selectedRoutingProfile.locations.push({path: '', backend_id: ''})
    },

    removeLocationElement(index: number): void {
      this.selectedRoutingProfile.locations.splice(index, 1)
    },
  },
  async created() {
    await this.loadConfigs()
    this.setSelectedDataFromRouteParams()
  },
})
</script>

