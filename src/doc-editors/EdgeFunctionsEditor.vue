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
              <div class="control doc-selection-wrapper"
                   v-if="docs.length">
                <div class="select is-small">
                  <select v-model="selectedDocID"
                          title="Switch document ID"
                          @change="switchDocID()"
                          class="doc-selection"
                          data-qa="switch-document">
                          <option v-for="doc in docs"
                            :key="doc.id"
                            :value="doc.id">
                      {{ doc.name }}
                    </option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          <div class="column">
            <div class="field is-grouped is-pulled-right">
              <p class="control">
                <button class="button is-small new-edge-function-document-button"
                        :class="{'is-loading': isNewLoading}"
                        @click="addNewEdgeFunction()"
                        title="Add new document"
                        :disabled="!selectedBranch"
                        data-qa="add-new-document">
                  <span class="icon is-small">
                    <i class="fas fa-plus"></i>
                  </span>
                  <span>
                    New
                  </span>
                </button>
              </p>

              <p class="control">
                <button class="button is-small fork-document-button"
                        :class="{'is-loading': isForkLoading}"
                        @click="forkDoc()"
                        title="Duplicate document"
                        :disabled="!selectedEdgeFunction"
                        data-qa="duplicate-document">
                  <span class="icon is-small">
                    <i class="fas fa-clone"></i>
                  </span>
                  <span>
                    Duplicate
                  </span>
                </button>
              </p>
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
                        :disabled="selectedDocNotDeletable"
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
    <div class="content"
         v-if="!loadingDocCounter && selectedBranch && selectedEdgeFunction">
      <div class="columns columns-divided">
        <div class="column is-4">
          <div class="field">
            <label class="label is-small">
              Name
              <span class="has-text-grey is-pulled-right document-id"
                    title="Document id">
                {{ selectedEdgeFunction.id }}
              </span>
            </label>
            <div class="control">
              <input class="input is-small document-name"
                     data-qa="edge-functions-name-input"
                     type="text"
                     title="Document name"
                     :placeholder="selectedEdgeFunction.name"
                     v-model="selectedEdgeFunction.name"/>
            </div>
          </div>
          <div class="field textarea-field">
            <label class="label is-small">Description</label>
            <div class="control">
                  <textarea class="is-small textarea document-description"
                            data-qa="description-input"
                            title="Document description"
                            v-model="selectedEdgeFunction.description"
                            rows="2"></textarea>
            </div>
          </div>
          <div class="field">
            <label class="label is-small">
              Phase
            </label>
                <div class="control is-expanded">
                  <div class="select is-fullwidth is-small">
              <select v-model="selectedEdgeFunction.phase"
                      class="phase-selection"
                      data-qa="cloud-phase-dropdown"
                      title="Phase">
                <option v-for="key in cloudPhases"
                        :key="key"
                        :value="key">
                  {{ titles[key] }}
                </option>
              </select>
            </div>
          </div>
        </div>
            </div>
        <div class="column is-8">
          <div class="field">
            <label class="label is-small">Code</label>
            <textarea class="is-small textarea edge-functions-code"
                      data-qa="code-input"
                      title="code"
                      v-model="selectedEdgeFunction.code"
                      rows="20">
                    </textarea>
          </div>
        </div>
      </div>
      <span class="is-family-monospace has-text-grey-lighter is-inline-block mt-3">{{ documentAPIPath }}</span>
    </div>
    <div class="content no-data-wrapper"
         v-if="loadingDocCounter || !selectedBranch || !selectedEdgeFunction || !docs">
      <div v-if="loadingDocCounter > 0">
        <button class="button is-outlined is-text is-small is-loading document-loading">
          Loading
        </button>
      </div>
      <div v-else
           class="no-data-message">
        No data found.
        <div>
          <span v-if="!selectedEdgeFunction?.id">
            Missing document. To create a new one, click
            <a title="Add new"
               @click="addNewEdgeFunction()">
              here
            </a>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import _ from 'lodash'
import {defineComponent} from 'vue'
import {EdgeFunction, EdgeFunctionsPhaseType, HttpRequestMethods} from '@/types'
import DatasetsUtils from '@/assets/DatasetsUtils'
import {mapStores} from 'pinia'
import {useBranchesStore} from '@/stores/BranchesStore'
import RequestsUtils from '@/assets/RequestsUtils'
import Utils from '@/assets/Utils'

export default defineComponent({
  name: 'EdgeFunctionsEditor',
  props: {
  },
  data() {
    return {
      cloudPhases: ['request', 'response'] as EdgeFunctionsPhaseType[],
      titles: DatasetsUtils.titles,
      docs: [] as unknown as EdgeFunction[],
      selectedDocID: null,

      // Loading indicators
      loadingDocCounter: 0,
      isSaveLoading: false,
      isDeleteLoading: false,
      isDownloadLoading: false,
      isForkLoading: false,
      isNewLoading: false,

      // To prevent deletion of docs referenced by Security Policies
      referencedIDsEdgeFunctions: [],
      apiRoot: RequestsUtils.reblazeAPIRoot,
      apiVersion: RequestsUtils.reblazeAPIVersion,
    }
  },
  watch: {
    selectedBranch: {
      handler: async function(val, oldVal) {
        if ((this.$route.name as string).includes('EdgeFunctions/config') && val && val !== oldVal) {
          await this.loadDocs()
          await this.setSelectedDataFromRouteParams()
          // redirect to list if no data found
          if (!this.docs?.[0]?.id || !this.selectedEdgeFunction) {
            this.redirectToList()
          }
          await this.loadReferencedEdgeFunctionsDocsIDs()
        }
      },
      immediate: true,
    },
  },
  computed: {

    selectedBranch(): string {
      return this.branchesStore.selectedBranchId
    },

    ...mapStores(useBranchesStore),

    selectedDocIndex(): number {
      return _.findIndex(this.docs, (doc) => {
        return doc.id === this.selectedDocID
      })
    },

    isDocReferenced(): boolean {
      return JSON.stringify(this.referencedIDsEdgeFunctions).includes(this.selectedDocID)
    },

    selectedDocNotDeletable(): boolean {
      return !this.selectedEdgeFunction ||
          this.selectedEdgeFunction.id.startsWith('__') || // Default entries
          this.isDocReferenced
    },

    documentAPIPath(): string {
      const apiPrefix = `${this.apiRoot}/${this.apiVersion}`
      return `${apiPrefix}/reblaze/configs/${this.selectedBranch}/d/cloud-functions/e/${this.selectedDocID}/`
    },

    selectedEdgeFunction: {
      get(): EdgeFunction {
        return this.selectedDocIndex > -1 ? this.docs[this.selectedDocIndex] : null
      },
      set(newDoc: EdgeFunction): void {
        this.docs[this.selectedDocIndex] = newDoc
      },
    },
  },
  methods: {
    async goToRoute() {
      const newRoute = `/${this.selectedBranch}/cloud-functions/config/${this.selectedDocID}`
      if (this.$route.path !== newRoute) {
        console.log('Switching document, new edge function document path: ' + newRoute)
        await this.$router.push(newRoute)
        await this.setSelectedDataFromRouteParams()
      }
    },

    async setSelectedDataFromRouteParams() {
      this.setLoadingDocStatus(true)
      this.selectedDocID = this.$route.params?.doc_id?.toString()
      this.setLoadingDocStatus(false)
    },

    redirectToList() {
      this.$router.push(`/${this.selectedBranch}/cloud-functions/list`)
    },

    setLoadingDocStatus(isLoading: boolean) {
      if (isLoading) {
        this.loadingDocCounter++
      } else {
        this.loadingDocCounter--
      }
    },

    async switchDocID() {
      this.setLoadingDocStatus(true)
      const docName = this.docs[this.selectedDocIndex].name
      if (docName) {
        Utils.toast(
            `Switched to document ${docName} with ID "${this.selectedDocID}".`,
            'is-info',
        )
      }
      this.goToRoute()
      this.setLoadingDocStatus(false)
    },

    downloadDoc() {
      if (!this.isDownloadLoading) {
        Utils.downloadFile('cloud-function', 'json', this.selectedEdgeFunction)
      }
    },

    async deleteDoc() {
      this.setLoadingDocStatus(true)
      this.isDeleteLoading = true
      const cloudFunctionText = this.titles['cloud-functions-singular']
      const url = `configs/${this.selectedBranch}/d/cloud-functions/e/${this.selectedEdgeFunction.id}/`
      const successMessage = `The ${cloudFunctionText} was deleted.`
      const failureMessage = `Failed while attempting to delete the ${cloudFunctionText}.`
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

    sortDocs() {
      this.docs = _.sortBy(this.docs, [(doc) => doc.name.toLowerCase()])
    },

    async loadDocs() {
      this.isDownloadLoading = true
      this.setLoadingDocStatus(true)
      const url = `configs/${this.selectedBranch}/d/cloud-functions/`

      const response = await RequestsUtils.sendReblazeRequest({
        methodName: 'GET',
        url,
        onFail: () => {
          console.log('Error while attempting to load documents')
          this.docs = []
          this.isDownloadLoading = false
        },
      })
      this.docs = response?.data || []
      this.sortDocs()

      this.setLoadingDocStatus(false)
      this.isDownloadLoading = false
    },

    newEdgeFunction(): EdgeFunction {
      const factory = DatasetsUtils.newDocEntryFactory['cloud-functions']
      return factory && factory()
    },

    async forkDoc() {
      this.setLoadingDocStatus(true)
      this.isForkLoading = true
      const docToAdd = _.cloneDeep(this.selectedEdgeFunction) as EdgeFunction
      docToAdd.id = DatasetsUtils.generateUUID2()
      docToAdd.name = 'copy of ' + docToAdd.name + ' ' + docToAdd.id

      const docTypeText = this.titles['cloud-functions-singular']
      const successMessage = `The ${docTypeText} was duplicated.`
      const failureMessage = `Failed while attempting to duplicate the ${docTypeText}.`
      await this.addNewEdgeFunction(docToAdd, successMessage, failureMessage)
      this.isForkLoading = false
      this.setLoadingDocStatus(false)
    },

    async addNewEdgeFunction(cloudFunctionToAdd?: EdgeFunction, successMessage?: string, failureMessage?: string) {
      this.setLoadingDocStatus(true)
      this.isNewLoading = true

      if (!cloudFunctionToAdd) {
        cloudFunctionToAdd = this.newEdgeFunction()
      }
      const cloudFunctionText = this.titles['cloud-functions-singular']
      if (!successMessage) {
        successMessage = `New ${cloudFunctionText} was created.`
      }
      if (!failureMessage) {
        failureMessage = `Failed while attempting to create the new ${cloudFunctionText}.`
      }
      const data = cloudFunctionToAdd
      await this.saveChanges('POST', data, successMessage, failureMessage)
      this.loadDocs()
      this.selectedDocID = cloudFunctionToAdd.id

      this.goToRoute()
      this.isNewLoading = false
      this.setLoadingDocStatus(false)
    },

    async saveChanges(methodName?: HttpRequestMethods, data?: EdgeFunction,
                      successMessage?: string, failureMessage?: string) {
      this.setLoadingDocStatus(true)
      this.isSaveLoading = true
      if (!methodName) {
        methodName = 'PUT'
      }
      if (!data) {
        data = this.selectedEdgeFunction
      }
      const url = `configs/${this.selectedBranch}/d/cloud-functions/e/${data.id}/`
      const cloudFunctionText = this.titles['cloud-functions-singular']
      if (!successMessage) {
        successMessage = `Changes to the ${cloudFunctionText} were saved.`
      }
      if (!failureMessage) {
        failureMessage = `Failed while attempting to save the changes to the ${cloudFunctionText}.`
      }
      await RequestsUtils.sendReblazeRequest({methodName, url, data, successMessage, failureMessage})
      this.isSaveLoading = false
      this.setLoadingDocStatus(false)
    },


    async loadReferencedEdgeFunctionsDocsIDs() {
      const response = await RequestsUtils.sendReblazeRequest({
        methodName: 'GET',
        url: `configs/${this.selectedBranch}/d/routing-profiles/`,
      })
      const routingProfiles = response?.data || []
      console.log('routingProfiles', routingProfiles)
      const referencedRoutingProfiles: string[] = []

      _.forEach(routingProfiles, (routingProfile) => {
        _.forEach(routingProfile.locations, (location) => {
          referencedRoutingProfiles.push(location['cloud_functions'])
        })
      })
      this.referencedIDsEdgeFunctions = _.uniq(referencedRoutingProfiles)

      console.log('referencedRoutingProfiles=',
        JSON.stringify(this.referencedIDsEdgeFunctions).includes(this.selectedDocID))
    },
  },
})
</script>
