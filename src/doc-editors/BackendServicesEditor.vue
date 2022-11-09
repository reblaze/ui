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
              <div class="control"
                   v-if="docs.length">
                <div class="select is-small">
                  <select v-model="selectedDocID"
                          title="Switch document ID"
                          @change="switchDocID()"
                          class="site-selection"
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
                <button class="button is-small new-backends-document-button"
                        :class="{'is-loading': isNewLoading}"
                        @click="addNewBackendService()"
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
                        :disabled="!selectedBackendService"
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
         v-if="loadingDocCounter==0 && selectedBranch && selectedBackendService">
      <div class="columns columns-divided">
        <div class="column is-4">
          <div class="field">
            <label class="label is-small">
              Name
              <span class="has-text-grey is-pulled-right document-id"
                    title="Rule id">
                      {{ selectedBackendService.id }}
                    </span>
            </label>
            <div class="control">
              <input class="input is-small document-name"
                     title="Document name"
                     placeholder="Document name"
                     v-model="selectedBackendService.name"/>
            </div>
          </div>
          <div class="field">
            <label class="checkbox is-size-7">
              <input type="checkbox"
                     data-qa="http11-checkbox"
                     class="document-http11"
                     v-model="selectedBackendService.http11">
              Use HTTP/1.1
            </label>
            <div class="help">
              Speeds up the connection with connection pooling (multiplexing).
            </div>
          </div>
          <div class="field">
            <div class="field textarea-field">
              <label class="label is-small">Description</label>
              <div class="control">
                      <textarea class="is-small textarea document-description"
                                data-qa="description-input"
                                title="Document description"
                                v-model="selectedBackendService.description"
                                rows="2">
                      </textarea>
              </div>
            </div>
          </div>
          <div class="field">
            <label class="label is-small">
              Transport Protocol
            </label>
            <div class="control is-expanded">
              <div class="select is-fullwidth is-small">
                <select v-model="selectedBackendService.transport_mode"
                        data-qa="transport-mode-dropdown"
                        class="document-transport-mode-selection"
                        title="Transport protocol">
                  <option v-for="{name, value} in protocols"
                          :key="value"
                          :value="value">
                    {{ name }}
                  </option>
                </select>
              </div>
            </div>
            <div class="help">
              Service connectivity might follow incoming requests, will always be HTTP, or always HTTPS.
              Port-bridge mode means that Reblaze will target port numbers identical to incoming requests' port
              numbers.
            </div>
          </div>
        </div>
        <div class="column is-4">
          <div class="field">
            <label class="label is-small">
              Load Balancing Stickiness Model
            </label>
            <div class="control is-expanded">
              <div class="select is-fullwidth is-small">
                <select class="select"
                        v-model="selectedBackendService.sticky">
                  <option v-for="stickinessModel in stickinessModels"
                          :key="stickinessModel.value"
                          :value="stickinessModel.value">
                    {{ stickinessModel.name }}
                  </option>
                </select>
              </div>
            </div>
          </div>
          <div v-if="selectedBackendService.sticky === 'customcookie'"
               class="field">
            <label class="label is-small">
              Custom Cookie Name
            </label>
            <div class="control">
              <input class="input is-small sticky-cookie-name-input"
                     data-qa="document-sticky-cookie-name-input"
                     title="Custom cookie name"
                     placeholder="Custom cookie name"
                     v-model="selectedBackendService.sticky_cookie_name">
            </div>
          </div>
        </div>
      </div>
      <div class="columns">
        <div class="column is-12">
          <table class="table is-hoverable is-fullwidth back-hosts-table">
            <thead>
            <tr>
              <th class="is-size-7">Host</th>
              <th class="is-size-7 width-100px">HTTP Port</th>
              <th class="is-size-7 width-100px">HTTPS Port</th>
              <th class="is-size-7 width-100px">Weight</th>
              <th class="is-size-7 width-100px">Max Fails</th>
              <th class="is-size-7 width-100px">Fail Timeout</th>
              <th class="has-text-centered is-size-7 width-100px">Is Down?</th>
              <th class="has-text-right is-vertical-middle is-size-7 width-60px">
                <a
                    v-if="!isPortBridge"
                    class="has-text-grey-dark is-small"
                    title="Add New"
                    @click="selectedBackendService.back_hosts.push ({ ...newBackHost })"
                >
                      <span class="icon is-small">
                        <i class="fas fa-plus"></i>
                      </span>
                </a>
              </th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="(backHost, index) in selectedBackendService.back_hosts"
                :key="index">
              <td class="is-size-7">
                <input class="input is-small back-host-host"
                       v-model="backHost.host"
                       placeholder="IP/FQDN">
              </td>
              <td class="is-size-7 width-100px">
                <input class="input is-small back-host-http-port"
                       data-qa="back-host-http-port-input"
                       type="number"
                       title="HTTP port"
                       placeholder="HTTP port"
                       max="65535"
                       v-model.number="backHost.http_port">
              </td>
              <td class="is-size-7 width-100px">
                <input class="input is-small back-host-https-port"
                       data-qa="back-host-https-port-input"
                       type="number"
                       title="HTTPS port"
                       placeholder="HTTPS port"
                       max="65535"
                       v-model.number="backHost.https_port">
              </td>
              <td class="is-size-7 width-100px">
                <input class="input is-small back-host-weight"
                       data-qa="back-host-weight-input"
                       type="number"
                       title="Weight"
                       placeholder="Weight"
                       :disabled="isSingleHost"
                       v-model.number="backHost.weight">
              </td>
              <td class="is-size-7 width-100px">
                <input class="input is-small back-host-max-fails"
                       data-qa="back-host-max-fails-input"
                       type="number"
                       title="Max fails"
                       placeholder="Max fails"
                       :disabled="isSingleHost"
                       v-model.number="backHost.max_fails">
              </td>
              <td class="is-size-7 width-100px">
                <input class="input is-small back-host-fail-timeout"
                       data-qa="back-host-fail-timeout-input"
                       title="Fail timeout"
                       placeholder="Fail timeout"
                       v-model="backHost.fail_timeout">
              </td>
              <td class="is-vertical-middle is-size-7 has-text-centered width-100px">
                <input type="checkbox"
                       v-model="backHost.down"
                       :disabled="!isDownable(index)"/>
              </td>
              <td class="has-text-centered is-vertical-middle is-size-7 is-60-px">
                <a v-if="isDownable(index)"
                   class="is-small has-text-grey"
                   @click="deleteHost(index)">
                  delete
                </a>
              </td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>
      <span class="is-family-monospace has-text-grey-lighter is-inline-block mt-3">{{ documentAPIPath }}</span>
    </div>
    <div class="content no-data-wrapper"
         v-if="loadingDocCounter || !selectedBranch || !selectedBackendService">
      <div v-if="loadingDocCounter > 0">
        <button class="button is-outlined is-text is-small is-loading document-loading">
          Loading
        </button>
      </div>
      <div v-else
           class="no-data-message">
        No data found.
        <div>
          <span v-if="!selectedBackendService?.id">
            Missing document. To create a new one, click
            <a title="Add new"
               @click="addNewBackendService()">
              here
            </a>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import RequestsUtils from '@/assets/RequestsUtils'
import {BackendService, HttpRequestMethods} from '@/types'
import Utils from '@/assets/Utils'
import {defineComponent} from 'vue'
import DatasetsUtils from '@/assets/DatasetsUtils'
import backendServicesConsts from '@/assets/backendServicesConsts'
import {mapStores} from 'pinia'
import {useBranchesStore} from '@/stores/BranchesStore'
import _ from 'lodash'

export default defineComponent({
  name: 'BackendServiceEditor',
  data() {
    return {
      titles: DatasetsUtils.titles,
      selectedBackendService: null as BackendService,
      docs: [] as unknown as BackendService[],
      selectedDocID: null,
      stickinessModels: backendServicesConsts.stickinessModels,
      newBackHost: {
        http_port: 80,
        https_port: 443,
        weight: 1,
        fail_timeout: '10s',
        down: false,
        host: '',
        max_fails: 0,
        monitor_state: '',
        backup: false,
      },

      // To prevent deletion of Backend servises referenced by Routing profiles
      referencedIDsBackendService: [],

      // Loading indicators
      loadingDocCounter: 0,
      isSaveLoading: false,
      isDeleteLoading: false,
      isDownloadLoading: false,
      isNewLoading: false,
      isForkLoading: false,

      apiRoot: RequestsUtils.reblazeAPIRoot,
      apiVersion: RequestsUtils.reblazeAPIVersion,
    }
  },
  watch: {
    selectedBranch: {
      handler: function(val, oldVal) {
        if ((this.$route.name as string).includes('BackendServices/config') && val && val !== oldVal) {
          this.loadDocs()
          this.sortDocs()
          this.setSelectedDataFromRouteParams()
          this.loadBackendService()
          this.loadReferencedBackendServicesIDs()
        }
      },
      immediate: true,
    },
  },
  computed: {
    documentAPIPath(): string {
      const apiPrefix = `${this.apiRoot}/${this.apiVersion}`
      return `${apiPrefix}/reblaze/configs/${this.selectedBranch}/d/backends/e/${this.selectedBackendService.id}/`
    },

    selectedDocNotDeletable(): boolean {
      return !this.selectedBackendService ||
          this.selectedBackendService.id.startsWith('__') || // Default entries
          this.isDocReferenced
    },

    isSingleHost() {
      return this.selectedBackendService.id && this.selectedBackendService.back_hosts.length === 1
    },

    isPortBridge() {
      return this.selectedBackendService.transport_mode === 'port_bridge'
    },

    protocols() {
      return backendServicesConsts.transportProtocols.filter((transportProtocol) => {
        return this.isSingleHost || transportProtocol.value !== 'port_bridge'
      })
    },

    isDocReferenced(): boolean {
      return this.referencedIDsBackendService.includes(this.selectedBackendService.id)
    },

    selectedBranch(): string {
      return this.branchesStore.selectedBranchId
    },

    ...mapStores(useBranchesStore),

    selectedDocIndex(): number {
      if (this.selectedDocID) {
        return _.findIndex(this.docs, (doc) => {
          return doc.id === this.selectedDocID
        })
      }
      return 0
    },
  },
  methods: {

    async goToRoute() {
      const newRoute = `/${this.selectedBranch}/backend-services/config/${this.selectedDocID}`
      if (this.$route.path !== newRoute) {
        console.log('Switching document, new backend services document path: ' + newRoute)
        await this.$router.push(newRoute)
        await this.setSelectedDataFromRouteParams()
      }
    },

    async setSelectedDataFromRouteParams() {
      this.setLoadingDocStatus(true)
      this.selectedDocID = this.$route.params?.doc_id?.toString()
      await this.loadBackendService()
      this.setLoadingDocStatus(false)
    },

    redirectToList() {
      this.$router.push(`/${this.selectedBranch}/backend-services/list`)
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
      await this.loadBackendService()
      this.setLoadingDocStatus(false)
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
        Utils.downloadFile('backend', 'json', this.selectedBackendService)
      }
    },

    async deleteDoc() {
      this.setLoadingDocStatus(true)
      this.isDeleteLoading = true
      const backendServiceText = this.titles['backends-singular']
      const url = `configs/${this.selectedBranch}/d/backends/e/${this.selectedBackendService.id}/`
      const successMessage = `The ${backendServiceText} was deleted.`
      const failureMessage = `Failed while attempting to delete the ${backendServiceText}.`
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
      const branch = this.selectedBranch
      const url = `configs/${branch}/d/backends/`
      this.selectedBackendService = null
      const response = await RequestsUtils.sendReblazeRequest({
        methodName: 'GET',
        url,
        config: {headers: {'x-fields': 'id, name'}},
        onFail: () => {
          console.log('Error while attempting to load documents')
          this.docs = []
          this.isDownloadLoading = false
        },
      })
      this.docs = response?.data || []
      this.sortDocs()

      if (this.docs && this.docs.length && this.docs[0].id) {
        if (!_.find(this.docs, (doc: BackendService) => {
          return doc.id === this.selectedDocID
        })) {
          this.selectedDocID = this.docs[0].id
        }
        await this.loadBackendService()
      }
      this.setLoadingDocStatus(false)
      this.isDownloadLoading = false
    },

    newBackends(): BackendService {
      const factory = DatasetsUtils.newOperationEntryFactory['backends']
      return factory && factory()
    },

    async addNewBackendService(backendServiceToAdd?: BackendService, successMessage?: string, failureMessage?: string) {
      this.setLoadingDocStatus(true)
      this.isNewLoading = true
      this.selectedBackendService = null
      if (!backendServiceToAdd) {
        backendServiceToAdd = this.newBackends()
      }
      const backendServiceText = this.titles['backends-singular']
      if (!successMessage) {
        successMessage = `New ${backendServiceText} was created.`
      }
      if (!failureMessage) {
        failureMessage = `Failed while attempting to create the new ${backendServiceText}.`
      }
      const data = backendServiceToAdd
      await this.saveChanges('POST', data, successMessage, failureMessage)
      this.docs.unshift(backendServiceToAdd)
      this.selectedDocID = backendServiceToAdd.id
      this.sortDocs()

      this.goToRoute()
      this.isNewLoading = false
      this.setLoadingDocStatus(false)
    },

    async saveChanges(methodName?: HttpRequestMethods, data?: BackendService,
                      successMessage?: string, failureMessage?: string) {
      this.setLoadingDocStatus(true)
      this.isSaveLoading = true
      if (!methodName) {
        methodName = 'PUT'
      }
      if (!data) {
        data = this.selectedBackendService
      }
      const url = `configs/${this.selectedBranch}/d/backends/e/${data.id}/`
      const backendServiceText = this.titles['backends-singular']
      if (!successMessage) {
        successMessage = `Changes to the ${backendServiceText} were saved.`
      }
      if (!failureMessage) {
        failureMessage = `Failed while attempting to save the changes to the ${backendServiceText}.`
      }
      await RequestsUtils.sendReblazeRequest({methodName, url, data, successMessage, failureMessage})
      this.isSaveLoading = false
      this.setLoadingDocStatus(false)
    },

    async loadBackendService() {
      this.setLoadingDocStatus(true)
      this.isDownloadLoading = true
      this.selectedBackendService = null
      const response = await RequestsUtils.sendReblazeRequest({
        methodName: 'GET',
        url: `configs/${this.selectedBranch}/d/backends/e/${this.selectedDocID}`,
        onFail: () => {
          console.log('Error while attempting to load the Backend Service')
          this.selectedBackendService = null
          this.isDownloadLoading = false
        },
      })
      this.selectedBackendService = response?.data || {}
      this.isDownloadLoading = false
      this.setLoadingDocStatus(false)
    },

    async forkDoc() {
      this.setLoadingDocStatus(true)
      this.isForkLoading = true
      const docToAdd = _.cloneDeep(this.selectedBackendService) as BackendService
      docToAdd.name = 'copy of ' + docToAdd.name
      docToAdd.id = DatasetsUtils.generateUUID2()

      const docTypeText = this.titles['backends-singular']
      const successMessage = `The ${docTypeText} was duplicated.`
      const failureMessage = `Failed while attempting to duplicate the ${docTypeText}.`
      await this.addNewBackendService(docToAdd, successMessage, failureMessage)
      this.isForkLoading = false
      this.setLoadingDocStatus(false)
    },

    isDownable(index: number) {
      const backHosts = this.selectedBackendService.back_hosts
      const downedHosts = backHosts.filter(({down}, id) => {
        return down && id !== index
      })
      return !this.isSingleHost && downedHosts.length < backHosts.length - 1
    },

    deleteHost(index: number) {
      this.selectedBackendService.back_hosts.splice(index, 1)
      if (this.selectedBackendService.back_hosts.length === 1 &&
          this.selectedBackendService.id &&
          !this.selectedBackendService.back_hosts[0].max_fails) {
        this.selectedBackendService.back_hosts[0].max_fails = 0
      }
    },

    async loadReferencedBackendServicesIDs() {
      const response = await RequestsUtils.sendReblazeRequest({
        methodName: 'GET',
        url: `configs/${this.selectedBranch}/d/routing-profiles/`,
      })
      const routingProfiles = response?.data || []
      const referencedRoutingProfiles: string[] = []
      _.forEach(routingProfiles, (routingProfile) => {
        _.forEach(routingProfile.locations, (location) => {
          referencedRoutingProfiles.push(location['backend_id'])
        })
      })
      this.referencedIDsBackendService = _.uniq(referencedRoutingProfiles)
    },
  },
  async created() {
    await this.branchesStore.list
  },
})
</script>
<style scoped
       lang="scss">
.back-hosts-table td {
  height: 4rem;
  padding-bottom: 0;
  padding-top: 0;
  vertical-align: middle;
}
</style>
