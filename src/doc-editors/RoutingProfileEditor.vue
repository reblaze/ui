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
                          title="Routing Profile id">
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
            </div>
            <div class="field px-3">
              <label class="label is-small">
                Path Mapping
              </label>
              <table class="table entries-table">
                <thead>
                <tr>
                  <th class="is-size-7 width-50px"></th>
                  <th class="is-size-7 width-400px">Path</th>
                  <th class="is-size-7 width-150px">Backend Service</th>
                  <th class="is-size-7 width-150px">Cloud Functions</th>
                  <th></th>
                </tr>
                </thead>
                <tbody v-for="(mapEntry, mapIndex) in selectedRoutingProfile.locations"
                       :key="mapIndex">
                <tr @click="changeSelectedMapEntry(mapIndex)"
                    class="has-row-clickable entry-row"
                    :class="mapEntryIndex === mapIndex ? 'has-background-light borderless' : ''">
                  <td class="is-size-7 width-50px has-text-right has-text-grey-light entry-index">
                    {{ mapIndex + 1 }}
                  </td>
                  <td class="is-size-7 width-400px ellipsis entry-match"
                      :title="mapEntry.path">
                    {{ mapEntry.path }}
                  </td>
                  <td class="is-size-7 width-150px ellipsis entry-content-filter">
                    {{ backendServiceName(mapEntry.backend_id) }}
                  </td>
                  <td class="is-size-7 width-150px entry-cloud-functions-count"
                      v-if="existingCloudFunctionIDs(mapEntry)">
                    {{ existingCloudFunctionIDs(mapEntry).length }}
                  </td>
                  <td class="is-size-7 width-70px"
                      :rowspan="mapEntryIndex === mapIndex ? '2' : '1'">
                    <a class="has-text-grey"
                       title="more details"
                       data-qa="expand-path-btn">
                      {{ mapEntryIndex === mapIndex ? 'close' : 'expand' }}
                    </a>
                  </td>
                </tr>
                <tr v-if="mapEntryIndex === mapIndex"
                    :class=" mapEntryIndex === mapIndex ? 'has-background-light borderless' : ''"
                    class="expanded current-entry-row">
                  <td colspan="10">
                    <div class="card">
                      <div class="card-content">
                        <div class="content">
                          <div class="columns">
                            <div class="column is-8">
                              <div class="field">
                                <label class="label is-small">
                                  Path
                                </label>
                                <div class="control has-icons-left">
                                  <input class="input is-small current-entry-path"
                                         type="text"
                                         @input="validateInput($event, isSelectedMapEntryPathValid(mapIndex))"
                                         data-qa="expanded-path-input"
                                         :title="matchingPathTitle"
                                         placeholder="Matching path regex"
                                         required
                                         :disabled="initialMapEntryPath === '/'"
                                         ref="mapEntryPath"
                                         v-model="mapEntry.path">
                                  <span class="icon is-small is-left has-text-grey">
                                  <i class="fas fa-code"></i>
                                </span>
                                </div>
                              </div>
                              <hr/>
                              <p class="title is-6 has-text-grey">
                                Cloud Functions
                              </p>
                              <div class="content">
                                <table class="table is-hoverable is-narrow is-fullwidth
                                              current-entry-cloud-functions-table">
                                  <thead>
                                  <tr>
                                    <th class="is-size-7 width-250px">
                                      Cloud Function Name
                                    </th>
                                    <th class="is-size-7 width-200px">
                                      Description
                                    </th>
                                    <th class="is-size-7 width-80px">
                                      Phase
                                    </th>
                                    <th class="has-text-centered is-size-7 width-60px">
                                      <a v-if="cloudFunctionsNames && mapEntry.cloud_functions &&
                                             cloudFunctionsNames.length > existingCloudFunctionIDs(mapEntry).length"
                                         class="has-text-grey-dark is-small cloud-function-add-button"
                                         data-qa="add-existing-cloud-function"
                                         title="Add new"
                                         tabindex="0"
                                         @click="cloudFunctionNewEntryModeMapEntryId = mapIndex"
                                         @keypress.space.prevent
                                         @keypress.space="cloudFunctionNewEntryModeMapEntryId = mapIndex"
                                         @keypress.enter="cloudFunctionNewEntryModeMapEntryId = mapIndex">
                                        <span class="icon is-small"><i class="fas fa-plus"></i></span>
                                      </a>
                                    </th>
                                  </tr>
                                  </thead>
                                  <tbody>
                                  <template v-for="(cloudFunctionId, cloudFunctionIndex) in mapEntry.cloud_functions">
                                    <tr v-if="cloudFunctionsDetails(cloudFunctionId)"
                                        :key="cloudFunctionId"
                                        class="cloud-function-row">
                                      <td class="is-size-7 width-250px ellipsis cloud-function-name"
                                          v-if="cloudFunctionsDetails(cloudFunctionId)"
                                          :title="cloudFunctionsDetails(cloudFunctionId).name">
                                        {{ cloudFunctionsDetails(cloudFunctionId).name }}
                                      </td>
                                      <td class="is-size-7 width-220px ellipsis cloud-function-description"
                                          v-if="cloudFunctionsDetails(cloudFunctionId)"
                                          :title="cloudFunctionsDetails(cloudFunctionId).description">
                                        {{ cloudFunctionsDetails(cloudFunctionId).description }}
                                      </td>
                                      <td class="is-size-7 width-80px ellipsis cloud-function-timeframe"
                                          v-if="cloudFunctionsDetails(cloudFunctionId)">
                                        {{ cloudFunctionsDetails(cloudFunctionId).phase }}
                                      </td>
                                      <td class="has-text-centered is-size-7 width-60px">
                                        <a class="is-small has-text-grey cloud-function-remove-button"
                                           data-qa="remove-cloud-function-btn"
                                           title="Remove entry"
                                           tabindex="0"
                                           @click="removeCloudFunctionFromEntry(mapEntry, cloudFunctionIndex)"
                                           @keypress.space.prevent
                                           @keypress.space="removeCloudFunctionFromEntry(mapEntry, cloudFunctionIndex)"
                                           @keypress.enter="removeCloudFunctionFromEntry(mapEntry, cloudFunctionIndex)">
                                          remove
                                        </a>
                                      </td>
                                    </tr>
                                  </template>
                                  <tr v-if="cloudFunctionNewEntryMode(mapIndex)"
                                      class="new-cloud-function-row">
                                    <td colspan="3">
                                      <div class="control is-expanded">
                                        <div class="select is-small is-size-7 is-fullwidth">
                                          <select class="select is-small new-cloud-function-selection"
                                                  title="Cloud Function ID"
                                                  v-model="cloudFunctionMapEntryId">
                                            <option v-for="cloudFunction in newCloudFunctions(mapEntry.cloud_functions)"
                                                    :key="cloudFunction.id"
                                                    :value="cloudFunction.id">
                                              {{ cloudFunction.name + ' ' + cloudFunction.description }}
                                            </option>
                                          </select>
                                        </div>
                                      </div>
                                    </td>
                                    <td class="has-text-centered is-size-7 width-60px">
                                      <a class="is-small has-text-grey cloud-function-confirm-add-button"
                                         title="Add this entry"
                                         tabindex="0"
                                         @click="addCloudFunctionToEntry(mapEntry, cloudFunctionMapEntryId)"
                                         @keypress.space.prevent
                                         @keypress.space="addCloudFunctionToEntry(mapEntry, cloudFunctionMapEntryId)"
                                         @keypress.enter="addCloudFunctionToEntry(mapEntry, cloudFunctionMapEntryId)">
                                        add
                                      </a>
                                    </td>
                                  </tr>
                                  <tr v-if="mapEntry.cloud_functions && !existingCloudFunctionIDs(mapEntry).length">
                                    <td colspan="5">
                                      <p class="is-size-7 has-text-grey has-text-centered">
                                        To attach an existing Cloud Function, click
                                        <a class="cloud-function-text-add-button"
                                           title="Add New"
                                           @click="cloudFunctionNewEntryModeMapEntryId = mapIndex">here</a>.
                                        <br/>
                                        To create a new Cloud Function, click
                                        <a class="cloud-function-referral-button"
                                           @click="referToCloudFunction">here</a>.
                                      </p>
                                    </td>
                                  </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>
                            <div class="column is-4">
                              <div class="field">
                                <label class="label is-small">Backend Service</label>
                                <div class="control is-expanded">
                                  <div class="select is-fullwidth is-small">
                                    <select v-model="mapEntry.backend_id"
                                            data-qa="backend-service-dropdown"
                                            class="current-entry-backend-service-selection"
                                            title="Backend service">
                                      <option v-for="backendService in backendServiceNames"
                                              :value="backendService[0]"
                                              :key="backendService[0]">
                                        {{ backendService[1] }}
                                      </option>
                                    </select>
                                  </div>
                                </div>
                              </div>
                              <hr/>
                              <div class="field">
                                <button title="Create a new profile based on this one"
                                        data-qa="fork-btn"
                                        class="button is-small is-pulled-left is-light fork-entry-button"
                                        @click="addNewProfile(mapEntry, mapIndex)">
                                  <span class="icon"><i class="fas fa-code-branch"></i></span>
                                  <span>
                                Fork profile
                              </span>
                                </button>
                                <button title="Delete this profile"
                                        data-qa="delete-location-btn"
                                        class="button is-small is-pulled-right is-danger is-light remove-entry-button"
                                        @click="removeMapEntry(mapIndex)"
                                        v-if="initialMapEntryPath !== '/'">
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
                </tbody>
              </table>
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
import {BackendService, CloudFunction, RoutingProfile, RoutingProfileEntryLocation} from '@/types'
import Utils from '@/assets/Utils'
import {defineComponent} from 'vue'
import DatasetsUtils from '@/assets/DatasetsUtils'
import {AxiosResponse} from 'axios'

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
      formValid: true,

      // Map Entries
      mapEntryIndex: -1,
      initialMapEntryPath: '',
      entriesLocationNames: [] as RoutingProfileEntryLocation['path'][],
      backendServiceNames: [] as [BackendService['id'], BackendService['name']][],
      cloudFunctionsNames: [] as CloudFunction[],
      cloudFunctionNewEntryModeMapEntryId: null,
      cloudFunctionMapEntryId: null,
      matchingPathTitle: 'A unique matching regex value, not overlapping other path mapping definitions',

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

    branchNames() {
      return this.configs?.length ? _.sortBy(_.map(this.configs, 'id')) : []
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

    validateInput(event: Event, validator: Function | boolean) {
      this.formValid = Utils.validateInput(event, validator)
    },

    isSelectedMapEntryPathValid(index: number): boolean {
      const newMapEntryPath = this.selectedRoutingProfile.locations[index].path.trim() || ''
      const isMapEntryPathEmpty = newMapEntryPath === ''
      const isMapEntryPathDuplicate = this.entriesLocationNames.includes(
          newMapEntryPath,
      ) ? this.initialMapEntryPath !== newMapEntryPath : false
      return !isMapEntryPathEmpty && !isMapEntryPathDuplicate
    },

    backendServiceName(id: string): string {
      const backendService = _.find(this.backendServiceNames, (backendService) => backendService[0] === id)
      return backendService?.[1] || ''
    },

    newCloudFunctions(currentCloudFunctionIDs: string[]): CloudFunction[] {
      return _.filter(this.cloudFunctionsNames, (cloudFunction) => {
        return _.indexOf(currentCloudFunctionIDs, cloudFunction.id) === -1
      })
    },

    addCloudFunctionToEntry(mapEntry: RoutingProfileEntryLocation, id: string) {
      if (id) {
        mapEntry.cloud_functions.push(id)
        this.cloudFunctionNewEntryModeMapEntryId = null
        this.cloudFunctionMapEntryId = null
      }
    },

    removeCloudFunctionFromEntry(mapEntry: RoutingProfileEntryLocation, index: number) {
      mapEntry.cloud_functions.splice(index, 1)
    },

    cloudFunctionsDetails(cloudFunctionId: CloudFunction['id']): CloudFunction {
      return _.find(this.cloudFunctionsNames, (cloudFunction) => {
        return cloudFunction.id === cloudFunctionId
      })
    },

    cloudFunctionNewEntryMode(id: number): boolean {
      return this.cloudFunctionNewEntryModeMapEntryId === id
    },

    existingCloudFunctionIDs(mapEntry: RoutingProfileEntryLocation): CloudFunction['id'][] {
      return _.filter(mapEntry.cloud_functions, (cloudFunctionId) => {
        return this.cloudFunctionsDetails(cloudFunctionId) !== undefined
      })
    },

    addNewProfile(mapEntry: RoutingProfileEntryLocation, idx: number) {
      const newMapEntry = _.cloneDeep(mapEntry)
      newMapEntry.path = `/new/path/to/match/profile/${DatasetsUtils.generateUUID2()}`

      // reverting the entry match to a stable and valid state if invalid
      if (!this.isSelectedMapEntryPathValid(idx)) {
        this.selectedRoutingProfile.locations[idx].path = this.initialMapEntryPath
        Utils.clearInputValidationClasses(this.$refs.mapEntryPath[0])
        this.formValid = true
      }
      this.selectedRoutingProfile.locations.splice(idx, 0, newMapEntry)
      const element = this.$refs.mapEntryPath[0] as HTMLInputElement
      this.initialMapEntryPath = newMapEntry.path
      this.entriesLocationNames = _.map(this.selectedRoutingProfile.locations, 'path')
      // Pushing the select action to the end of queue in order for the new profile to be rendered beforehand
      setImmediate(() => {
        element.select()
        element.focus()
      })
    },

    changeSelectedMapEntry(index: number) {
      // reverting the entry match to a stable and valid state if invalid on close
      if (this.mapEntryIndex !== -1 && !this.isSelectedMapEntryPathValid(this.mapEntryIndex)) {
        if (this.selectedRoutingProfile.locations[this.mapEntryIndex]) {
          this.selectedRoutingProfile.locations[this.mapEntryIndex].path = this.initialMapEntryPath
        }
        this.mapEntryIndex = (this.mapEntryIndex === index ? -1 : index)
        Utils.clearInputValidationClasses(this.$refs.mapEntryPath[0])
        this.formValid = true
      } else {
        this.mapEntryIndex = (this.mapEntryIndex === index ? -1 : index)
      }
      this.initialMapEntryPath = this.selectedRoutingProfile.locations[index]?.path.trim() || ''
      this.entriesLocationNames = _.map(this.selectedRoutingProfile.locations, 'path')
    },

    removeMapEntry(index: number) {
      this.changeSelectedMapEntry(-1)
      this.selectedRoutingProfile.locations.splice(index, 1)
    },

    referToCloudFunction() {
      this.$emit('go-to-route', `/config/${this.selectedBranch}/cloud-functions`)
    },

    loadBackendServices() {
      RequestsUtils.sendReblazeRequest({
        methodName: 'GET',
        url: `configs/${this.selectedBranch}/d/backends/`,
        config: {headers: {'x-fields': 'id, name'}},
      }).then((response: AxiosResponse<BackendService[]>) => {
        this.backendServiceNames = _.sortBy(_.map(response.data, (entity) => {
          return [entity.id, entity.name]
        }), (e) => {
          return e[1]
        })
      })
    },

    loadCloudFunctions() {
      RequestsUtils.sendReblazeRequest({
        methodName: 'GET',
        url: `configs/${this.selectedBranch}/d/cloud-functions/`,
      }).then((response: AxiosResponse<CloudFunction[]>) => {
        this.cloudFunctionsNames = response.data
      })
    },
  },
  async created() {
    await this.loadConfigs()
    this.loadBackendServices()
    this.loadCloudFunctions()
    this.setSelectedDataFromRouteParams()
  },
})
</script>

