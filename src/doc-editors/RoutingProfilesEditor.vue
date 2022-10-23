<template>
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
                  <span>
                    Return To List
                  </span>
                </button>
              </p>
            </div>
          </div>
          <div class="column">
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
              <p class="control">
                <button class="button is-small save-document-button"
                        :class="{'is-loading': isSaveLoading}"
                        title="Save changes"
                        data-qa="save-changes"
                        @click="saveChanges()">
                  <span class="icon is-small">
                    <i class="fas fa-save"></i>
                  </span>
                  <span>
                    Save
                  </span>
                </button>
              </p>
              <p class="control">
                <button class="button is-small has-text-danger delete-document-button"
                        title="Delete document"
                        data-qa="delete-document"
                        :class="{'is-loading': isDeleteLoading}"
                        :disabled="selectedRoutingProfile?.id === '__default__'"
                        @click="deleteDoc()">
                  <span class="icon is-small">
                    <i class="fas fa-trash"></i>
                  </span>
                  <span>
                    Delete
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
                  <input class="input is-small document-name"
                         title="Document name"
                         placeholder="Document name"
                         v-model="selectedRoutingProfile.name"/>
                </div>
              </div>
              <div class="field">
                <div class="field textarea-field">
                  <label class="label is-small">Description</label>
                  <div class="control">
                            <textarea class="is-small textarea document-description"
                                      data-qa="description-input"
                                      title="Document description"
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
                <th class="is-size-7 width-150px">Edge Functions</th>
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
                <td class="is-size-7 width-150px entry-edge-functions-count"
                    v-if="existingEdgeFunctionIDs(mapEntry)">
                  {{ existingEdgeFunctionIDs(mapEntry).length }}
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
                                <span class="has-text-grey is-pulled-right map-entry-id"
                                      title="Map entry id">
                                  {{ mapEntry.id }}
                                </span>
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
                              Edge Functions
                            </p>
                            <div class="content">
                              <table class="table is-hoverable is-narrow is-fullwidth
                                              current-entry-edge-functions-table">
                                <thead>
                                <tr>
                                  <th class="is-size-7 width-250px">
                                    Edge Function Name
                                  </th>
                                  <th class="is-size-7 width-200px">
                                    Description
                                  </th>
                                  <th class="is-size-7 width-80px">
                                    Phase
                                  </th>
                                  <th class="has-text-centered is-size-7 width-60px">
                                    <a v-if="edgeFunctions && mapEntry.cloud_functions &&
                                             edgeFunctions.length > existingEdgeFunctionIDs(mapEntry).length"
                                       class="has-text-grey-dark is-small edge-function-add-button"
                                       data-qa="add-existing-edge-function"
                                       title="Add new"
                                       tabindex="0"
                                       @click="edgeFunctionNewEntryModeMapEntryId = mapIndex"
                                       @keypress.space.prevent
                                       @keypress.space="edgeFunctionNewEntryModeMapEntryId = mapIndex"
                                       @keypress.enter="edgeFunctionNewEntryModeMapEntryId = mapIndex">
                                      <span class="icon is-small"><i class="fas fa-plus"></i></span>
                                    </a>
                                  </th>
                                </tr>
                                </thead>
                                <tbody>
                                <template v-for="(edgeFunctionId, edgeFunctionIndex) in mapEntry.cloud_functions">
                                  <tr v-if="edgeFunctionsDetails(edgeFunctionId)"
                                      :key="edgeFunctionId"
                                      class="edge-function-row">
                                    <td class="is-size-7 width-250px ellipsis edge-function-name"
                                        v-if="edgeFunctionsDetails(edgeFunctionId)"
                                        :title="edgeFunctionsDetails(edgeFunctionId).name">
                                      {{ edgeFunctionsDetails(edgeFunctionId).name }}
                                    </td>
                                    <td class="is-size-7 width-220px ellipsis edge-function-description"
                                        v-if="edgeFunctionsDetails(edgeFunctionId)"
                                        :title="edgeFunctionsDetails(edgeFunctionId).description">
                                      {{ edgeFunctionsDetails(edgeFunctionId).description }}
                                    </td>
                                    <td class="is-size-7 width-80px ellipsis edge-function-timeframe"
                                        v-if="edgeFunctionsDetails(edgeFunctionId)">
                                      {{ edgeFunctionsDetails(edgeFunctionId).phase }}
                                    </td>
                                    <td class="has-text-centered is-size-7 width-60px">
                                      <a class="is-small has-text-grey edge-function-remove-button"
                                         data-qa="remove-edge-function-btn"
                                         title="Remove entry"
                                         tabindex="0"
                                         @click="removeEdgeFunctionFromEntry(mapEntry, edgeFunctionIndex)"
                                         @keypress.space.prevent
                                         @keypress.space="removeEdgeFunctionFromEntry(mapEntry, edgeFunctionIndex)"
                                         @keypress.enter="removeEdgeFunctionFromEntry(mapEntry, edgeFunctionIndex)">
                                        remove
                                      </a>
                                    </td>
                                  </tr>
                                </template>
                                <tr v-if="edgeFunctionNewEntryMode(mapIndex)"
                                    class="new-edge-function-row">
                                  <td colspan="3">
                                    <div class="control is-expanded">
                                      <div class="select is-small is-size-7 is-fullwidth">
                                        <select class="select is-small new-edge-function-selection"
                                                title="Edge Function ID"
                                                v-model="edgeFunctionMapEntryId">
                                          <option v-for="edgeFunction in newEdgeFunctions(mapEntry.cloud_functions)"
                                                  :key="edgeFunction.id"
                                                  :value="edgeFunction.id">
                                            {{ edgeFunction.name + ' ' + edgeFunction.description }}
                                          </option>
                                        </select>
                                      </div>
                                    </div>
                                  </td>
                                  <td class="has-text-centered is-size-7 width-60px">
                                    <a class="is-small has-text-grey edge-function-confirm-add-button"
                                       title="Add this entry"
                                       tabindex="0"
                                       @click="addEdgeFunctionToEntry(mapEntry, edgeFunctionMapEntryId)"
                                       @keypress.space.prevent
                                       @keypress.space="addEdgeFunctionToEntry(mapEntry, edgeFunctionMapEntryId)"
                                       @keypress.enter="addEdgeFunctionToEntry(mapEntry, edgeFunctionMapEntryId)">
                                      add
                                    </a>
                                  </td>
                                </tr>
                                <tr v-if="mapEntry.cloud_functions && !existingEdgeFunctionIDs(mapEntry).length">
                                  <td colspan="5">
                                    <p class="is-size-7 has-text-grey has-text-centered">
                                      To attach an existing Edge Function, click
                                      <a class="edge-function-text-add-button"
                                         title="Add New"
                                         @click="edgeFunctionNewEntryModeMapEntryId = mapIndex">here</a>.
                                      <br/>
                                      To create a new Edge Function, click
                                      <a class="edge-function-referral-button"
                                         @click="referToEdgeFunction">here</a>.
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
          <span class="is-family-monospace has-text-grey-lighter is-inline-block mt-3">{{ documentAPIPath }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import _ from 'lodash'
import RequestsUtils from '@/assets/RequestsUtils'
import {BackendService, EdgeFunction, RoutingProfile, RoutingProfileEntryLocation} from '@/types'
import Utils from '@/assets/Utils'
import {defineComponent} from 'vue'
import DatasetsUtils from '@/assets/DatasetsUtils'
import {AxiosResponse} from 'axios'
import {mapStores} from 'pinia'
import {useBranchesStore} from '@/stores/BranchesStore'

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
      formValid: true,

      // Map Entries
      mapEntryIndex: -1,
      initialMapEntryPath: '',
      entriesLocationNames: [] as RoutingProfileEntryLocation['path'][],
      backendServiceNames: [] as [BackendService['id'], BackendService['name']][],
      edgeFunctions: [] as EdgeFunction[],
      edgeFunctionNewEntryModeMapEntryId: null,
      edgeFunctionMapEntryId: null,
      matchingPathTitle: 'A unique matching regex value, not overlapping other path mapping definitions',

      apiRoot: RequestsUtils.reblazeAPIRoot,
      apiVersion: RequestsUtils.reblazeAPIVersion,
    }
  },
  watch: {
    selectedBranch: {
      handler: function(val, oldVal) {
        if ((this.$route.name as string).includes('RoutingProfiles/config') && val && val !== oldVal) {
          this.loadBackendServices()
          this.loadEdgeFunctions()
          this.setSelectedDataFromRouteParams()
        }
      },
      immediate: true,
    },
  },
  computed: {
    documentAPIPath(): string {
      const apiPrefix = `${this.apiRoot}/${this.apiVersion}`
      const selectedId = this.selectedRoutingProfile.id
      return `${apiPrefix}/reblaze/configs/${this.selectedBranch}/d/routing-profiles/e/${selectedId}/`
    },

    selectedBranch(): string {
      return this.branchesStore.selectedBranchId
    },

    ...mapStores(useBranchesStore),
  },
  methods: {
    async setSelectedDataFromRouteParams() {
      this.setLoadingDocStatus(true)
      this.docIdFromRoute = this.$route.params?.doc_id?.toString()
      await this.loadProfile()
    },

    redirectToList() {
      this.$router.push(`/${this.selectedBranch}/routing-profiles/list`)
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
      const routingProfileText = this.titles['routing-profiles-singular']
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
      const routingProfileText = this.titles['routing-profiles-singular']
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
          console.log('Error while attempting to load the Routing Profile')
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

    newEdgeFunctions(currentEdgeFunctionIDs: string[]): EdgeFunction[] {
      return _.filter(this.edgeFunctions, (edgeFunction) => {
        return _.indexOf(currentEdgeFunctionIDs, edgeFunction.id) === -1
      })
    },

    addEdgeFunctionToEntry(mapEntry: RoutingProfileEntryLocation, id: string) {
      if (id) {
        mapEntry.cloud_functions.push(id)
        this.edgeFunctionNewEntryModeMapEntryId = null
        this.edgeFunctionMapEntryId = null
      }
    },

    removeEdgeFunctionFromEntry(mapEntry: RoutingProfileEntryLocation, index: number) {
      mapEntry.cloud_functions.splice(index, 1)
    },

    edgeFunctionsDetails(edgeFunctionId: EdgeFunction['id']): EdgeFunction {
      return _.find(this.edgeFunctions, (edgeFunction) => {
        return edgeFunction.id === edgeFunctionId
      })
    },

    edgeFunctionNewEntryMode(id: number): boolean {
      return this.edgeFunctionNewEntryModeMapEntryId === id
    },

    existingEdgeFunctionIDs(mapEntry: RoutingProfileEntryLocation): EdgeFunction['id'][] {
      return _.filter(mapEntry.cloud_functions, (edgeFunctionId) => {
        return this.edgeFunctionsDetails(edgeFunctionId) !== undefined
      })
    },

    addNewProfile(mapEntry: RoutingProfileEntryLocation, idx: number) {
      const newMapEntry = _.cloneDeep(mapEntry)
      const newMapEntryId = DatasetsUtils.generateUUID2()
      newMapEntry.id = newMapEntryId
      newMapEntry.path = `/new/path/to/match/profile/${newMapEntryId}`

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

    referToEdgeFunction() {
      this.$emit('go-to-route', `/config/${this.selectedBranch}/edge-functions`)
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

    loadEdgeFunctions() {
      RequestsUtils.sendReblazeRequest({
        methodName: 'GET',
        url: `configs/${this.selectedBranch}/d/cloud-functions/`,
      }).then((response: AxiosResponse<EdgeFunction[]>) => {
        this.edgeFunctions = response.data
      })
    },
  },
  async created() {
    await this.branchesStore.list
  },
})
</script>

