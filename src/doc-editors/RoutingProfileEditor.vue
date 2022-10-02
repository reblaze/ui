<template>
    <div class="card">
      <div class="card-content">
        <div class="media">
          <div class="media-content">
            <div class="columns">
              <div class="column">
                <div class="field is-grouped is-pulled-right">
                  <p class="control">
                    <button class="button is-small download-doc-button"
                            :disabled="!selectedRoutingProfile"
                            :class="{'is-loading': isDownloadLoading}"
                            title="Download document"
                            data-qa="download-document"
                            @click="downloadDoc()">
                      <span class="icon is-small">
                        <i class="fas fa-download"></i>
                      </span>
                    </button>
                  </p>
                  <p class="control">
                    <!-- TODO: add to button :disabled="isDocumentInvalid || !selectedDoc" -->
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
                    <!-- TODO: add to button
                    :disabled="selectedDocNotDeletable"
                    :class="{'is-loading': isDeleteLoading}" -->
                    <button class="button is-small has-text-danger delete-document-button"
                            title="Delete document"
                            data-qa="delete-document"
                            @click="deleteDoc">
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
        <div class="content" v-if="selectedRoutingProfile">
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
                         :placeholder="selectedRoutingProfile.name"
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
                                  rows="5">
                                  <!-- TODO: add to textarea: v-model="selectedRoutingProfile.description" -->
                        </textarea>
                  </div>
                </div>
              </div>
            </div>
            <div class="column is-4 custom-panel">
              <div class="field">
                <div class="field textarea-field">
                  <label class="label is-small">Cloud Function</label>
                  <div class="control">
                    <!-- TODO: add to textarea: v-model="selectedRoutingProfile.description" @input="emitDocUpdate" -->
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
                    <!-- TODO: add to textarea: v-model="selectedRoutingProfile.description" @input="emitDocUpdate" -->
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
                  Backend service
                </label>
                <div v-for="(location, index) in selectedRoutingProfile.locations" :key="index"
                    class="columns mb-0 headers-columns">
                  <div class="column is-5">
                    <input class="input is-small location-path"
                          title="Header key"
                          placeholder="Location path"
                          v-model="location.path"/>
                  </div>
                  <div class="column is-5">
                    <input class="input is-small location-backend-id"
                          title="Header value"
                          placeholder="Location backend ID"
                          v-model="location.backend_id"/>
                  </div>
                  <div class="column is-narrow">
                    <button class="button is-light is-small remove-icon is-small has-text-grey"
                            title="Click to remove header"
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
          <span class="is-family-monospace has-text-grey-lighter">{{ apiPath }}</span>
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
  props: {
    apiPath: String,
  },
  data() {
    return {
      selectedType: ['a', 'b', 'c', 'd', 'e', 'f'],
      headersArray: ['a', 'b'],
      loadingDocCounter: 0,
      idFromRoute: '',
      isDownloadLoading: false,
      selectedRoutingProfile: null as RoutingProfile,
      isSaveLoading: false,
      isDeleteLoading: false,
      titles: DatasetsUtils.titles,
      isDocumentInvalid: false,
    }
  },
  computed: {
    // TODO: check with Aviv why get a lot of errors
    cloudFunctionIds: {
      get() {
        return this.selectedRoutingProfile.cloud_functions.join('\n')
      },
      set(cloudFunctionStringToAdd:any): void {
        console.log(cloudFunctionStringToAdd.split('\n'))
        this.selectedRoutingProfile.cloud_functions = cloudFunctionStringToAdd.split('\n')

      },
    },
    serverNameIds: {
      get() {
        return this.selectedRoutingProfile.server_names.join('\n')
      },
      set(serverNameStringToAdd:string): void {
        const splitServerNames = serverNameStringToAdd.split('\n')
        if(splitServerNames !== this.selectedRoutingProfile.server_names){
          this.selectedRoutingProfile.server_names = splitServerNames
        }
      },
    },
  },
  methods: {
    displayCloudFunctions(){
      console.log(_.map(this.selectedRoutingProfile, 'cloud_functions')?.join(', '))
      return _.map(this.selectedRoutingProfile, 'cloud_functions')?.join(', ')
    },

    displayServerNames(){
      console.log(_.map(this.selectedRoutingProfile, 'server_names')?.join(', '))
      return _.map(this.selectedRoutingProfile, 'server_names')?.join(', ')
    },

    downloadDoc() {
      if (!this.isDownloadLoading) {
        Utils.downloadFile('routing-profile', 'json', this.selectedRoutingProfile)
      }
    },
    setLoadingDocStatus(isLoading: boolean) {
      if (isLoading) {
        this.loadingDocCounter++
      } else {
        this.loadingDocCounter--
      }
    },

    goToRoute() {
      const routeToDoc = `/routing-profile/list/`
      this.$router.push(routeToDoc)
    },

    async deleteDoc() {
      this.setLoadingDocStatus(true)
      this.isDeleteLoading = true
      const routingProfileText = this.titles['routing-singular']
      const url = `config/d/routing-profiles/e/${this.selectedRoutingProfile.id}/`
      const successMessage = `The ${routingProfileText} was deleted.`
      const failureMessage = `Failed while attempting to delete the ${routingProfileText}.`
      await RequestsUtils.sendReblazeRequest({
        methodName: 'DELETE',
        url: url,
        successMessage,
        failureMessage,
      })
      this.goToRoute()
      this.isDeleteLoading = false
      this.setLoadingDocStatus(false)
    },

    async saveChanges() {
      this.isSaveLoading = true
      const methodName = "PUT"
      let url = `config/d/routing-profiles/e/${this.selectedRoutingProfile.id}/`
      const data = this.selectedRoutingProfile
      data.server_names = data.server_names.filter((item:string) =>{
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
        url: `config/d/routing-profiles/e/${this.idFromRoute}/`,
        onFail: () => {
          console.log('Error while attempting to load routing profiles')
          this.selectedRoutingProfile = null
          this.isDownloadLoading = false
        },
      })
      this.selectedRoutingProfile = response?.data || {}
      this.isDownloadLoading = false
    },

    async setSelectedDataFromRouteParams() {
      this.setLoadingDocStatus(true)
      this.idFromRoute = this.$route.params.doc_id.toString()
      await this.loadProfile()
    },

    getLocations(){
      if (!this.selectedRoutingProfile.locations) {
        return []
      }
      return _.map(this.selectedRoutingProfile.locations, function(value, key) {
        return {key: key, value: value}
      })
    },

    addLocationElement(): void {
      this.selectedRoutingProfile.locations.push({path: '', backend_id: ''})

    },

    removeLocationElement(index: number): void {
      this.selectedRoutingProfile.locations.splice(index, 1)
    },
  },
  created() {
    this.setSelectedDataFromRouteParams()
  },
})
</script>
<style scoped lang="scss">

</style>
