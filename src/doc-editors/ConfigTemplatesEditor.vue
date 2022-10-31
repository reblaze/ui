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
         v-if="selectedConfigTemplate">
      <div class="columns">
        <div class="column is-4">
          <div class="field">
            <label class="label is-small">
              Name
              <span class="has-text-grey is-pulled-right document-id"
                    title="Rule id">
                      {{ selectedConfigTemplate.id }}
                    </span>
            </label>
            <div class="control">
              <input class="input is-small document-name"
                     title="Document name"
                     placeholder="Document name"
                     v-model="selectedConfigTemplate.name"/>
            </div>
          </div>
          <div class="field">
            <div class="field textarea-field">
              <label class="label is-small">Description</label>
              <div class="control">
                      <textarea class="is-small textarea document-description"
                                data-qa="description-input"
                                title="Document description"
                                v-model="selectedConfigTemplate.description"
                                rows="5">
                      </textarea>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="card collapsible-card"
           :class="{ collapsed: isFrontendCollapsed }">
        <div class="card-content px-0 py-0">
          <div class="media collapsible px-5 py-5 mb-0"
               @click="isFrontendCollapsed = !isFrontendCollapsed">
            <div class="media-content">
              <p class="title is-5 is-uppercase">Frontend Settings</p>
            </div>
            <span v-show="isFrontendCollapsed">
                    <i class="fas fa-angle-down"
                       aria-hidden="true"></i>
                  </span>
            <span v-show="!isFrontendCollapsed">
                    <i class="fas fa-angle-up"
                       aria-hidden="true"></i>
                  </span>
          </div>
          <div class="content collapsible-content px-5 py-5">
            <div class="columns">
              <div class="column is-6">
                <div class="field height-100px">
                  <label class="label is-small">
                    Client IP Header Name
                  </label>
                  <div class="control">
                    <input class="input is-small document-ip-header-name"
                           title="Client IP header name"
                           placeholder="Client IP header name"
                           v-model="selectedConfigTemplate.xff_header_name">
                  </div>
                  <div class="help">
                    The header name which Reblaze will use to extract the client's IP address
                  </div>
                </div>
                <div class="field height-120px">
                  <label class="label is-small">
                    Requests per second per IP address
                  </label>
                  <div class="control">
                    <input class="input is-small document-limit-req-rate"
                           title="Requests per second per IP address"
                           placeholder="Requests per second per IP address"
                           v-model="selectedConfigTemplate.limit_req_rate">
                  </div>
                  <div class="help">
                    Static rate limiting for each IP address: the requests per second per IP address for this
                    application
                    <a href="https://www.nginx.com/blog/rate-limiting-nginx/"
                       target="_blank">(more info)</a>.
                    Use the <strong>Rate Limits</strong> section for granular, dynamic rate limiting
                  </div>
                </div>
                <div class="field height-120px">
                  <label class="label is-small">
                    Client Body Timeout
                  </label>
                  <div class="control suffix seconds-suffix">
                    <input class="input is-small document-client-body-timeout"
                           title="Client body timeout"
                           placeholder="Client body timeout"
                           v-model="selectedConfigTemplate.client_body_timeout">
                  </div>
                  <div class="help height-50px">
                    Defines a timeout for reading client request body, for a period between two successive read
                    operations, not for the transmission of the whole request body
                    <a href="https://nginx.org/en/docs/http/ngx_http_core_module.html#client_body_timeout"
                       target="_blank">
                      (more info)
                    </a>
                  </div>
                </div>
                <div class="field height-120px">
                  <label class="label is-small">
                    Client Header Timeout
                  </label>
                  <div class="control suffix seconds-suffix">
                    <input class="input is-small document-client-header-timeout"
                           title="Client header timeout"
                           placeholder="Client header timeout"
                           v-model="selectedConfigTemplate.client_header_timeout">
                  </div>
                  <div class="help">
                    Defines a timeout for reading client request header. If a client does not transmit the entire
                    header
                    within this time, the request is terminated with the 408 (Request Time-out) error
                    <a href="https://nginx.org/en/docs/http/ngx_http_core_module.html#client_header_timeout"
                       target="_blank">
                      (more info)
                    </a>
                  </div>
                </div>
              </div>
              <div class="column is-6">
                <div class="field height-100px">
                  <label class="label is-small">
                    Client Max Body Size
                  </label>
                  <div class="control suffix mb-suffix">
                    <input class="input is-small document-client-max-body-size"
                           title="Client max body size"
                           placeholder="Client max body size"
                           v-model="selectedConfigTemplate.client_max_body_size">
                  </div>
                  <div class="help">
                    Sets the maximum allowed size of the client request body, based on “Content-Length” request
                    header
                    field in MB
                    <a href="https://nginx.org/en/docs/http/ngx_http_core_module.html#client_max_body_size"
                       target="_blank">
                      (more info)
                    </a>
                  </div>
                </div>
                <div class="field height-120px">
                  <label class="label is-small">
                    Burst of requests per second per IP address
                  </label>
                  <div class="control">
                    <input class="input is-small document-limit-req-burst"
                           title="Burst of requests per second per IP address"
                           placeholder="Burst of requests per second per IP address"
                           v-model="selectedConfigTemplate.limit_req_burst">
                  </div>
                  <div class="help">
                    The burst parameter defines how many requests a client can make in excess of the rate
                    specified
                    above that will be put in a queue
                    <a href="https://www.nginx.com/blog/rate-limiting-nginx/"
                       target="_blank">
                      (more info)
                    </a>
                  </div>
                </div>
                <div class="field height-120px">
                  <label class="label is-small">
                    Keepalive Timeout
                  </label>
                  <div class="control suffix seconds-suffix">
                    <input class="input is-small document-keepalive-timeout"
                           title="Keepalive timeout"
                           placeholder="Keepalive timeout"
                           v-model="selectedConfigTemplate.keepalive_timeout">
                  </div>
                  <div class="help">
                    Defines a timeout during which a keep-alive client connection will stay open on the server
                    side. A
                    value of zero disables keep-alive client connections
                    <a href="https://nginx.org/en/docs/http/ngx_http_core_module.html#keepalive_timeout"
                       target="_blank">
                      (more info)
                    </a>
                  </div>
                </div>
                <div class="field height-120px">
                  <label class="label is-small">
                    Send Timeout
                  </label>
                  <div class="control suffix seconds-suffix">
                    <input class="input is-small document-send-timeout"
                           title="Send timeout"
                           placeholder="Send timeout"
                           v-model="selectedConfigTemplate.send_timeout">
                  </div>
                  <div class="help">
                    Defines a timeout for transmitting a response to the client between two successive write
                    operations,
                    not for the transmission of the whole response
                    <a href="https://nginx.org/en/docs/http/ngx_http_core_module.html#send_timeout"
                       target="_blank">
                      (more info)
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="card collapsible-card"
           :class="{ collapsed: isBackendCollapsed }">
        <div class="card-content px-0 py-0">
          <div class="media collapsible px-5 py-5 mb-0"
               @click="isBackendCollapsed = !isBackendCollapsed">
            <div class="media-content">
              <p class="title is-5 is-uppercase">Backend Settings</p>
            </div>
            <span v-show="isBackendCollapsed">
                    <i class="fas fa-angle-down"
                       aria-hidden="true"></i>
                  </span>
            <span v-show="!isBackendCollapsed">
                    <i class="fas fa-angle-up"
                       aria-hidden="true"></i>
                  </span>
          </div>
          <div class="content collapsible-content px-5 py-5">
            <div class="columns">
              <div class="column is-6">
                <div class="field height-100px">
                  <label class="label is-small">
                    Proxy Connect Timeout
                  </label>
                  <div class="control suffix seconds-suffix">
                    <input class="input is-small document-proxy-connect-timeout"
                           title="Proxy connect timeout"
                           placeholder="Proxy connect timeout"
                           v-model="selectedConfigTemplate.proxy_connect_timeout">
                  </div>
                  <div class="help height-50px">
                    Defines a timeout for establishing a connection with a proxied server. It should be noted that
                    this timeout cannot usually exceed 75 seconds
                    <a href="https://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_connect_timeout"
                       target="_blank">
                      (more info)
                    </a>
                  </div>
                </div>
                <div class="field height-140px">
                  <label class="label is-small">
                    Proxy Send Timeout
                  </label>
                  <div class="control suffix seconds-suffix">
                    <input class="input is-small document-proxy-sen-timeout"
                           title="Proxy send timeout"
                           placeholder="Proxy send timeout"
                           v-model="selectedConfigTemplate.proxy_send_timeout">
                  </div>
                  <div class="help height-140px">
                    Sets a timeout for transmitting a request to the proxied server. The timeout is set only
                    between two successive write operations, not for the transmission of the whole request. If the
                    proxied server does not receive anything within this time, the connection is closed
                    <a href="https://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_send_timeout"
                       target="_blank">
                      (more info)
                    </a>
                  </div>
                </div>
                <div class="field height-140px">
                  <label class="label is-small">
                    Proxy Read Timeout
                  </label>
                  <div class="control suffix seconds-suffix">
                    <input class="input is-small document-proxy-read-timeout"
                           title="Proxy read timeout"
                           placeholder="Proxy read timeout"
                           v-model="selectedConfigTemplate.proxy_read_timeout">
                  </div>
                  <div class="help height-140px">
                    Defines a timeout for reading a response from the proxied server. The timeout is set only
                    between two successive read operations, not for the transmission of the whole response. If the
                    proxied server does not transmit anything within this time, the connection is closed
                    <a href="https://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_read_timeout"
                       target="_blank">
                      (more info)
                    </a>
                  </div>
                </div>
              </div>
              <div class="column is-6">
                <div class="field height-100px">
                  <label class="label is-small">
                    Backend Service Host Header
                  </label>
                  <div class="control">
                    <input class="input is-small document-upstream-host"
                           title="Backend service host header"
                           placeholder="Backend service host header"
                           v-model="selectedConfigTemplate.upstream_host">
                  </div>
                  <div class="help height-50px">
                    The Host header Reblaze will present to the backend service.<br/>Setting value to $host means
                    client's header is passed as is
                  </div>
                </div>
                <div class="field height-120px">
                  <label class="label is-small">
                    Real IP Header Name
                  </label>
                  <div class="control">
                    <input class="input is-small document-real-ip-header-name"
                           title="Real IP header name"
                           placeholder="Real IP header name"
                           v-model="selectedConfigTemplate.xrealip_header_name">
                  </div>
                  <div class="help">
                    The Host header Reblaze will present to the backend service.<br/>X-Real-IP is the default
                    value
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!--div-- class="card collapsible-card"
             :class="{ collapsed: isTrustedCollapsed }">
          <div class="card-content px-0 py-0">
            <div class="media collapsible px-5 py-5 mb-0"
                 @click="isTrustedCollapsed = !isTrustedCollapsed">
              <div class="media-content">
                <p class="title is-5 is-uppercase">Trusted Sources</p>
              </div>
              <span v-show="isTrustedCollapsed">
                <i class="fas fa-angle-down"
                   aria-hidden="true"></i>
              </span>
              <span v-show="!isTrustedCollapsed">
                <i class="fas fa-angle-up"
                   aria-hidden="true"></i>
              </span>
            </div>
            <div class="content collapsible-content px-5 py-5">
                  <div class="content">
                    <rbz-table :columns="trusted_sources_columns"
                                :data="trustedData"
                                :row-button-icon="'fa-trash'"
                                :row-button-title="'Delete'"
                                :show-menu-column="true"
                                :show-filter-button="true"
                                :show-row-button="true"
                                :show-new-button="true"
                                :show-second-row-button="true"
                                @row-button-clicked="deleteTrustedElement"
                                @new-button-clicked="toggleAddingNewTrustedSource"
                                @second-row-button-clicked="toggleEditTrustedElement"
                                >
                    </rbz-table>
                </div>
            </div>
          </div>
        </div-->
      <div class="card collapsible-card"
           :class="{ collapsed: isAdvancedCollapsed }">
        <div class="card-content px-0 py-0">
          <div class="media collapsible px-5 py-5 mb-0"
               @click="isAdvancedCollapsed = !isAdvancedCollapsed">
            <div class="media-content">
              <p class="title is-5 is-uppercase">Advanced Settings</p>
            </div>
            <span v-show="isAdvancedCollapsed">
                    <i class="fas fa-angle-down"
                       aria-hidden="true"></i>
                  </span>
            <span v-show="!isAdvancedCollapsed">
                    <i class="fas fa-angle-up"
                       aria-hidden="true"></i>
                  </span>
          </div>
          <div class="content collapsible-content px-5 py-5">
            <div class="columns">
              <div class="column is-6">
                <div class="field ">
                  <div class="field">
                    <label class="label is-small">
                      HTTP Listener Custom Configuration
                    </label>
                    <div class="control">
                            <textarea
                                rows="5"
                                class="is-small textarea site-conf"
                                v-model="selectedConfigTemplate.conf_specific.value">
                            </textarea>
                    </div>
                    <p class="help has-text-danger">Unless instructed, don't touch!</p>
                  </div>
                </div>
              </div>
              <div class="column is-6">
                <div class="field ">
                  <div class="field">
                    <label class="label is-small">HTTPS Listener Custom Configuration</label>
                    <div class="control">
                            <textarea
                                rows="5"
                                class="is-small textarea site-ssl-conf"
                                v-model="selectedConfigTemplate.ssl_conf_specific.value">
                            </textarea>
                    </div>
                    <p class="help has-text-danger">Unless instructed, don't touch!</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <span class="is-family-monospace has-text-grey-lighter is-inline-block mt-3">{{ documentAPIPath }}</span>
    </div>
  </div>
</template>
<script lang="ts">
import RequestsUtils from '@/assets/RequestsUtils'
import {ConfigTemplate} from '@/types'
// import _ from 'lodash'
import Utils from '@/assets/Utils'
import {defineComponent} from 'vue'
import DatasetsUtils from '@/assets/DatasetsUtils'
import {mapStores} from 'pinia'
import {useBranchesStore} from '@/stores/BranchesStore'
import _ from 'lodash'

export default defineComponent({
  name: 'ConfigTemplateEditor',
  data() {
    return {
      titles: DatasetsUtils.titles,
      selectedConfigTemplate: null as ConfigTemplate,
      docIdFromRoute: '',

      // Collapsible cards
      isFrontendCollapsed: false,
      isBackendCollapsed: false,
      isAdvancedCollapsed: false,
      isTrustedCollapsed: false,

      // To prevent deletion of Config templates referenced by Server Groups
      referencedIDsConfigTemplate: [],

      // Loading indicators
      loadingDocCounter: 0,
      isSaveLoading: false,
      isDeleteLoading: false,
      isDownloadLoading: false,

      apiRoot: RequestsUtils.reblazeAPIRoot,
      apiVersion: RequestsUtils.reblazeAPIVersion,

      // Trusted indicators
      isAddModalVisible: false,
      showEditTrustedSource: false,

      // planetID: null,
      // planetName: null,
      // trustedData: null as {id: number, address: string, 'comment': string}[],
      // trusted_sources_columns: [
      //   {
      //     title: 'CIDR / IP / Tag Rule',
      //     fieldNames: ['address'],
      //     isSortable: true,
      //     isSearchable: true,
      //     classes: 'ellipsis',
      //   },
      //   {
      //     title: 'comment',
      //     fieldNames: ['comment'],
      //     isSortable: true,
      //     isSearchable: true,
      //     classes: 'ellipsis',
      //   },
      // ],
      // sourceToAdd: {address: '', comment: '', isValid: false} as {address: string, comment: string, isValid?: boolean},
      // tagRule: '',
      // newAddress: '127.0.0.0/8',
      // newComment: 'Private subnet',
      // editAddress: '',
      // editComment: '',
      // isEdit: false,
      // entryType: 'cidr',
      // isError: false,
      // currentEditIndex: 0,
    }
  },
  watch: {
    selectedBranch: {
      handler: function(val, oldVal) {
        if ((this.$route.name as string).includes('ConfigTemplates/config') && val && val !== oldVal) {
          this.setSelectedDataFromRouteParams()
          this.loadReferencedConfigTemplatesIDs()
        }
      },
      immediate: true,
    },
  },
  computed: {
    documentAPIPath(): string {
      const apiPrefix = `${this.apiRoot}/${this.apiVersion}`
      const apiPath = `configs/${this.selectedBranch}/d/proxy-templates/e/${this.selectedConfigTemplate.id}/`
      return `${apiPrefix}/reblaze/${apiPath}`
    },

    selectedDocNotDeletable(): boolean {
      return !this.selectedConfigTemplate ||
          this.selectedConfigTemplate.id.startsWith('__') || // Default entries
          this.selectedConfigTemplate.id.startsWith('rl-') || // Reblaze-managed Rate Limits
          this.selectedConfigTemplate.id.startsWith('action-') || // Reblaze-managed Custom Responses
          this.selectedConfigTemplate.id.startsWith('rbz-') || // Reblaze-managed Global Filters
          this.selectedConfigTemplate.id.startsWith('dr_') || // Dynamic-Rule-managed Global Filters
          this.isDocReferenced
    },

    isDocReferenced(): boolean {
      return this.referencedIDsConfigTemplate.includes(this.selectedConfigTemplate.id)
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
      await this.loadConfigTemplate()
    },

    redirectToList() {
      this.$router.push(`/${this.selectedBranch}/config-templates/list`)
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
      await this.loadConfigTemplate()
      this.setLoadingDocStatus(false)
    },

    downloadDoc() {
      if (!this.isDownloadLoading) {
        Utils.downloadFile(this.titles['proxy-templates-singular'], 'json', this.selectedConfigTemplate)
      }
    },

    async deleteDoc() {
      this.setLoadingDocStatus(true)
      this.isDeleteLoading = true
      const configTemplateText = this.titles['proxy-templates-singular']
      const url = `configs/${this.selectedBranch}/d/proxy-templates/e/${this.selectedConfigTemplate.id}/`
      const successMessage = `The ${configTemplateText} was deleted.`
      const failureMessage = `Failed while attempting to delete the ${configTemplateText}.`
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
      const url = `configs/${this.selectedBranch}/d/proxy-templates/e/${this.selectedConfigTemplate.id}/`
      const data = this.selectedConfigTemplate
      const configTemplateText = this.titles['proxy-templates-singular']
      const successMessage = `Changes to the ${configTemplateText} were saved.`
      const failureMessage = `Failed while attempting to save the changes to the ${configTemplateText}.`
      await RequestsUtils.sendReblazeRequest({methodName, url, data, successMessage, failureMessage})
      this.isSaveLoading = false
    },

    async loadConfigTemplate() {
      this.isDownloadLoading = true
      const response = await RequestsUtils.sendReblazeRequest({
        methodName: 'GET',
        url: `configs/${this.selectedBranch}/d/proxy-templates/e/${this.docIdFromRoute}`,
        onFail: () => {
          console.log(`Error while attempting to load the ${this.titles['proxy-template-singular']}`)
          this.selectedConfigTemplate = null
          this.isDownloadLoading = false
        },
      })
      this.selectedConfigTemplate = response?.data || {}
      if (!this.selectedConfigTemplate.conf_specific) {
        this.selectedConfigTemplate.conf_specific = {value: ''}
      }
      if (!this.selectedConfigTemplate.ssl_conf_specific) {
        this.selectedConfigTemplate.ssl_conf_specific = {value: ''}
      }
      this.isDownloadLoading = false
    },

    async loadReferencedConfigTemplatesIDs() {
      const response = await RequestsUtils.sendReblazeRequest({
        methodName: 'GET',
        url: `configs/${this.selectedBranch}/d/sites/`,
      })
      const serverGroups = response?.data || []
      const referencedConfigTemplates: string[] = []
      _.forEach(serverGroups, (serverGroup) => {
        referencedConfigTemplates.push(serverGroup['proxy_template'])
      })
      this.referencedIDsConfigTemplate = _.uniq(referencedConfigTemplates)
    },

    // TODO waiting for truseted source to be implemented on backend: moved from planet to proxy-template and to have an id for each record.
    // also need to complete the modal for editing and adding trusted sources.
    // async loadTrustedSources() {
    //   const url = `configs/${this.selectedBranch}/d/planet/`
    //   const methodName = 'GET'
    //   const response = await RequestsUtils.sendReblazeRequest({methodName, url})
    //   console.log('trusted_nets', response?.data)
    //   this.planetID = response.data.id
    //   this.planetName = response.data.name
    //   this.trustedData = response?.data?.trusted_nets?.map(
    //     (trusted: {address: string, comment: string}, index: number)=> {
    //       return {id: index, address: trusted.address, comment: trusted.comment}
    //     })
    // },
    // toggleAddingNewTrustedSource() {
    //   this.isAddModalVisible=true
    //   console.log('this.isAddModalVisible', this.isAddModalVisible)
    // },

    // addNewTrustedSource() {
    //   const id = this.trustedData.length
    //   const newTrustedElement = {id: id, address: this.newAddress, comment: this.newComment}
    //   this.trustedData.push(newTrustedElement)
    //   this.newAddress = '127.0.0.0/8'
    //   this.newComment = 'Private subnet'
    //   this.isAddModalVisible=false
    // },
    // openAddModal (id) {
    //   if ( id ) {
    //       this.sourceToAdd = {...this.findSource(id), isValid: true}
    //       const tagRule = this.tagRules.find(tr => tr.id === id)
    //       if (tagRule) {
    //           this.entryType = 'tag',
    //           this.sourceToAdd.tagRule = tagRule.name,
    //       }
    //       this.isEdit = true
    //   }
    //   else {
    //       this.sourceToAdd = {
    //           address: '',
    //           comment: '',
    //       };
    //       this.isEdit = false
    //   }
    //   this.isAddModalVisible = true
    //   this.$nextTick ( () => this.$refs.address?.focus())
    // },
    // onChangeEntryType() {
    //   this.sourceToAdd.address = '';
    //   this.sourceToAdd.isValid = false;
    //   this.tagRule = '';
    //   this.clearError();
    // },
    // validateIp() {
    //   this.clearError('ip');
    // const ipPattern = /((^\s*((([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]
    //          |1[0-9]{2}|2[0-4][0-9]|25[0-5]))\s*(:([0-9]
    //          |[1-8][0-9]|9[0-9]|[1-8][0-9]{2}|9[0-8][0-9]|99[0-9]|[1-8][0-9]{3}|9[0-8][0-9]{2}|99[0-8][0-9]|999[0-9]|[1-5][0-9]{4}|6[0-4]
    //          [0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5])|(\/[0-9]|\/[1-2][0-9]|\/[1-3][0-2]))?(\s?)?$)|(^\s*((([0-9A-Fa-f]{1,4}:)
    //          {7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|
    //          1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]
    //          |2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|
    //          2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|
    //          ((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]
    //          {1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|
    // 1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|
    // [1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d
    // |1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*(:([0-9]|[1-8][0-9]|9[0-9]|[1-8][0-9]{2}|9[0-8][0-9]|99[0-9]
    // |[1-8][0-9]{3}|9[0-8][0-9]{2}|99[0-8][0-9]|999[0-9]|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5])|(\/[0-9]
    // |\/[1-2][0-9]|\/[1-3][0-2]))?(\s?)?$))/
    //   this.sourceToAdd.isValid = ipPattern.test ( this.sourceToAdd.address )
    //   if (this.sourceToAdd.isValid) {
    //       this.validateDuplication()
    //   }
    //   else {
    //       this.errors.push('ip');
    //   }
    // },
    // validateDuplication() {
    //   this.clearError('duplicate');
    //   this.sourceToAdd.isValid = !this.findSource ( this.sourceToAdd.address );
    //   if (!this.sourceToAdd.isValid) {
    //       this.errors.push ('duplicate');
    //   }
    // },

    // closeModal() {
    //   this.isAddModalVisible = false
    //   this.sourceToAdd = {}
    //   this.errors = []
    //   this.entryType = 'cidr'
    //   this.tagRule = ''
    // },
    // toggleEditTrustedElement(id: number) {
    //   this.showEditTrustedSource=true

    //   this.currentEditIndex = this.trustedData.findIndex((trusted) => trusted.id ===id)
    //   this.editAddress = this.trustedData[this.currentEditIndex].address
    //   this.editComment = this.trustedData[this.currentEditIndex].comment
    // },
    // editTrustedSource() {
    //   this.isEdit = true
    //   this.trustedData[this.currentEditIndex].address = this.editAddress
    //   this.trustedData[this.currentEditIndex].comment = this.editComment

    //   this.showEditTrustedSource=false
    // },

    // async deleteTrustedElement(id: number) {
    //   const trustedArr = [...this.trustedData]
    //   this.trustedData = trustedArr.filter((trusted) => trusted.id !== id)
    //   const dataTrusted = this.trustedData.map((trusted) => {
    //     return {address: trusted.address, comment: trusted.comment}
    //   })
    //   const data = {
    //     id: this.planetID,
    //     name: this.planetName,
    //     trusted_nets: dataTrusted,
    //   }
    //   console.log('delete id', id, 'data', data)
    //   const url = `configs/${this.selectedBranch}/d/planet/`
    //   const methodName = 'PUT'
    //   await RequestsUtils.sendReblazeRequest({methodName, url, data})
    // },
  },
  async created() {
    await this.branchesStore.list
  },
})
</script>
<style scoped
       lang="scss">
</style>
