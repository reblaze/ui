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
                          data-qa="delete-document"
                          :class="{'is-loading': isDeleteLoading}"
                          :disabled="selectedProxyTemplate?.id === '__default__'"
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
               v-if="selectedProxyTemplate">
            <div class="columns">
              <div class="column is-4">
                <div class="field">
                  <label class="label is-small">
                    Name
                    <span class="has-text-grey is-pulled-right document-id"
                          title="Rule id">
                      {{ selectedProxyTemplate.id }}
                    </span>
                  </label>
                  <div class="control">
                    <input class="input is-small document-name"
                           title="Document name"
                           placeholder="Document name"
                           v-model="selectedProxyTemplate.name"/>
                  </div>
                </div>
                <div class="field">
                  <div class="field textarea-field">
                    <label class="label is-small">Description</label>
                    <div class="control">
                      <textarea class="is-small textarea document-description"
                                data-qa="description-input"
                                title="Document description"
                                v-model="selectedProxyTemplate.description"
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
                                 v-model="selectedProxyTemplate.xff_header_name">
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
                                 v-model="selectedProxyTemplate.limit_req_rate">
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
                                 v-model="selectedProxyTemplate.client_body_timeout">
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
                                 v-model="selectedProxyTemplate.client_header_timeout">
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
                                 v-model="selectedProxyTemplate.client_max_body_size">
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
                                 v-model="selectedProxyTemplate.limit_req_burst">
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
                                 v-model="selectedProxyTemplate.keepalive_timeout">
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
                                 v-model="selectedProxyTemplate.send_timeout">
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
                      <div class="field cell-height">
                        <label class="label is-small">
                          Proxy Connect Timeout
                        </label>
                        <div class="control suffix seconds-suffix">
                          <input class="input is-small document-proxy-connect-timeout"
                                 title="Proxy connect timeout"
                                 placeholder="Proxy connect timeout"
                                 v-model="selectedProxyTemplate.proxy_connect_timeout">
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
                      <div class="field cell-height">
                        <label class="label is-small">
                          Proxy Send Timeout
                        </label>
                        <div class="control suffix seconds-suffix">
                          <input class="input is-small document-proxy-sen-timeout"
                                 title="Proxy send timeout"
                                 placeholder="Proxy send timeout"
                                 v-model="selectedProxyTemplate.proxy_send_timeout">
                        </div>
                        <div class="help height-100px">
                          Sets a timeout for transmitting a request to the proxied server. The timeout is set only
                          between two successive write operations, not for the transmission of the whole request. If the
                          proxied server does not receive anything within this time, the connection is closed
                          <a href="https://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_send_timeout"
                             target="_blank">
                            (more info)
                          </a>
                        </div>
                      </div>
                      <div class="field cell-height">
                        <label class="label is-small">
                          Proxy Read Timeout
                        </label>
                        <div class="control suffix seconds-suffix">
                          <input class="input is-small document-proxy-read-timeout"
                                 title="Proxy read timeout"
                                 placeholder="Proxy read timeout"
                                 v-model="selectedProxyTemplate.proxy_read_timeout">
                        </div>
                        <div class="help height-100px">
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
                      <div class="field cell-height">
                        <label class="label is-small">
                          Backend Service Host Header
                        </label>
                        <div class="control">
                          <input class="input is-small document-upstream-host"
                                 title="Backend service host header"
                                 placeholder="Backend service host header"
                                 v-model="selectedProxyTemplate.upstream_host">
                        </div>
                        <div class="help  height-50px">
                          The Host header Reblaze will present to the backend service.<br/>Setting value to $host means
                          client's header is passed as is
                        </div>
                      </div>
                      <div class="field cell-height">
                        <label class="label is-small">
                          Real IP Header Name
                        </label>
                        <div class="control cell-height">
                          <input class="input is-small document-real-ip-header-name"
                                 title="Real IP header name"
                                 placeholder="Real IP header name"
                                 v-model="selectedProxyTemplate.xrealip_header_name">
                        </div>
                        <div class="help cell-height">
                          The Host header Reblaze will present to the backend service.<br/>X-Real-IP is the default
                          value
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="card collapsible-card"
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
                    <div class="columns columns-divided add-new-trusted-source ml-3px"  v-if="addingNewTrustedSource">
                          <input class="column is-6 ellipsis add-new-address"
                            title="Trusted Source CIDR / IP / Tag Rule Address"
                            placeholder="CIDR/IP/Tag Rule Address"
                            v-model="newAddress">
                          <input class="column is-5 ellipsis add-new-comment"
                            title="Trusted Source Comment"
                            placeholder="CIDR/IP/Tag Rule Address"
                            v-model="newComment">
                          <button  class="width-50px is-2 ml-3px" @click="addNewTrustedSource" >
                            Add
                          </button>
                    </div>
                    <div class="columns columns-divided edit-new-trusted-source ml-3px"  v-if="showEditTrustedSource">
                          <input class="column is-6 ellipsis add-new-address"
                            title="Trusted Source CIDR / IP / Tag Rule Address"
                            placeholder="CIDR/IP/Tag Rule Address"
                            v-model="editAddress">
                          <input class="column is-5 ellipsis add-new-comment"
                            title="Trusted Source Comment"
                            placeholder="CIDR/IP/Tag Rule Address"
                            v-model="editComment">
                          <button  class="width-50px is-2 ml-3px" @click="editTrustedSource" >
                            Edit
                          </button>
                    </div>
                </div>
              </div>
            </div>
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
                              v-model="confSpecific">
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
                              v-model="sslConfSpecific">
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
import {ProxyTemplate} from '@/types'
import Utils from '@/assets/Utils'
import {defineComponent} from 'vue'
import DatasetsUtils from '@/assets/DatasetsUtils'
import RbzTable from '@/components/RbzTable.vue'


export default defineComponent({
  name: 'ProxyTemplateEditor',
  components: {
    RbzTable,
  },
  data() {
    return {
      titles: DatasetsUtils.titles,
      configs: [],
      selectedBranch: null,
      selectedProxyTemplate: null as ProxyTemplate,
      docIdFromRoute: '',

      // Collapsible cards
      isFrontendCollapsed: false,
      isBackendCollapsed: false,
      isAdvancedCollapsed: false,
      isTrustedCollapsed: false,

      // Loading indicators
      loadingDocCounter: 0,
      isSaveLoading: false,
      isDeleteLoading: false,
      isDownloadLoading: false,

      apiRoot: RequestsUtils.reblazeAPIRoot,
      apiVersion: RequestsUtils.reblazeAPIVersion,

      // Trusted indicators
      addingNewTrustedSource: false,
      showEditTrustedSource: false,


      planetID: null,
      planetName: null,
      trustedData: null as {id: number, address: string, 'comment': string}[],
      trusted_sources_columns: [
        {
          title: 'CIDR / IP / Tag Rule',
          fieldNames: ['address'],
          isSortable: true,
          isSearchable: true,
          classes: 'ellipsis',
        },
        {
          title: 'comment',
          fieldNames: ['comment'],
          isSortable: true,
          isSearchable: true,
          classes: 'ellipsis',
        },
      ],
      newAddress: '127.0.0.0/8',
      newComment: 'Private subnet',
      editAddress: '',
      editComment: '',
      currentEditIndex: 0,
    }
  },
  computed: {
    documentAPIPath(): string {
      const apiPrefix = `${this.apiRoot}/${this.apiVersion}`
      return `${apiPrefix}/reblaze/configs/${this.selectedBranch}/d/proxy-templates/e/${this.selectedProxyTemplate.id}/`
    },

    branchNames() {
      return this.configs?.length ? _.sortBy(_.map(this.configs, 'id')) : []
    },

    sslConfSpecific: {
      get: function(): string {
        if (this.selectedProxyTemplate.ssl_conf_specific) {
          return Object.values(this.selectedProxyTemplate.ssl_conf_specific).join('\n')
        }
        return ''
      },
      // turn an Array into an Object
      set: function(site: string): void {
        this.selectedProxyTemplate.ssl_conf_specific = site.length > 0 ?
          Object.assign({}, _.map(site.split('\n'), (site) => {
            return site.trim()
          })) : {}
      },
    },
    // in type {} will storw an array 0: 'string', 1: 'string'
    confSpecific: {
      get: function(): string {
        if (this.selectedProxyTemplate.conf_specific) {
          return Object.values(this.selectedProxyTemplate.conf_specific).join('\n')
        }
        return ''
      },
      // turn an Array into an Object
      set: function(site: string): void {
        this.selectedProxyTemplate.conf_specific = site.length > 0 ?
          Object.assign({}, _.map(site.split('\n'), (site) => {
            return site.trim()
          })) : {}
      },
    },
  },
  methods: {
    async setSelectedDataFromRouteParams() {
      this.setLoadingDocStatus(true)
      this.docIdFromRoute = this.$route.params.doc_id.toString()
      await this.loadProxyTemplate()
    },

    async loadConfigs(counterOnly?: boolean) {
      let configs
      try {
        const response = await RequestsUtils.sendRequest({
          methodName: 'GET',
          url: 'configs/',
          config: {headers: {'x-fields': 'id'}},
        })
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
      this.$router.push(`/proxy-templates/list`)
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
      await this.loadProxyTemplate()
      this.setLoadingDocStatus(false)
    },

    downloadDoc() {
      if (!this.isDownloadLoading) {
        Utils.downloadFile('proxy-template', 'json', this.selectedProxyTemplate)
      }
    },

    async deleteDoc() {
      this.setLoadingDocStatus(true)
      this.isDeleteLoading = true
      const proxyTemplateText = this.titles['proxy-templates-singular']
      const url = `configs/${this.selectedBranch}/d/proxy-templates/e/${this.selectedProxyTemplate.id}/`
      const successMessage = `The ${proxyTemplateText} was deleted.`
      const failureMessage = `Failed while attempting to delete the ${proxyTemplateText}.`
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
      const url = `configs/${this.selectedBranch}/d/proxy-templates/e/${this.selectedProxyTemplate.id}/`
      const data = this.selectedProxyTemplate
      const proxyTemplateText = this.titles['proxy-templates-singular']
      const successMessage = `Changes to the ${proxyTemplateText} were saved.`
      const failureMessage = `Failed while attempting to save the changes to the ${proxyTemplateText}.`
      await RequestsUtils.sendReblazeRequest({methodName, url, data, successMessage, failureMessage})
      this.isSaveLoading = false
    },

    async loadProxyTemplate() {
      this.isDownloadLoading = true
      const response = await RequestsUtils.sendReblazeRequest({
        methodName: 'GET',
        url: `configs/${this.selectedBranch}/d/proxy-templates/e/${this.docIdFromRoute}`,
        onFail: () => {
          console.log('Error while attempting to load the Proxy Template')
          this.selectedProxyTemplate = null
          this.isDownloadLoading = false
        },
      })
      this.selectedProxyTemplate = response?.data || {}
      this.isDownloadLoading = false
    },

    async loadTrustedSources() {
      const url = `configs/${this.selectedBranch}/d/planet/`
      const methodName = 'GET'
      const response = await RequestsUtils.sendReblazeRequest({methodName, url})
      console.log('trusted_nets', response?.data)
      this.planetID = response.data.id
      this.planetName = response.data.name
      this.trustedData = response?.data?.trusted_nets?.map(
        (trusted: {address: string, comment: string}, index: number)=> {
          return {id: index, address: trusted.address, comment: trusted.comment}
        })
    },
    toggleAddingNewTrustedSource() {
      this.addingNewTrustedSource=true
      console.log('this.addingNewTrustedSource', this.addingNewTrustedSource)
    },
    addNewTrustedSource() {
      const id = this.trustedData.length
      const newTrustedElement = {id: id, address: this.newAddress, comment: this.newComment}
      this.trustedData.push(newTrustedElement)
      this.newAddress = '127.0.0.0/8'
      this.newComment = 'Private subnet'
      this.addingNewTrustedSource=false
    },
    toggleEditTrustedElement(id: number) {
      this.showEditTrustedSource=true

      this.currentEditIndex = this.trustedData.findIndex((trusted) => trusted.id ===id)
      this.editAddress = this.trustedData[this.currentEditIndex].address
      this.editComment = this.trustedData[this.currentEditIndex].comment
      console.log('this.addingNewTrustedSource', this.addingNewTrustedSource)
    },
    editTrustedSource() {
      this.trustedData[this.currentEditIndex].address = this.editAddress
      this.trustedData[this.currentEditIndex].comment = this.editComment

      this.showEditTrustedSource=false
    },

    async deleteTrustedElement(id: number) {
      const trustedArr = [...this.trustedData]
      this.trustedData = trustedArr.filter((trusted) => trusted.id !== id)
      const dataTrusted = this.trustedData.map((trusted) => {
        return {address: trusted.address, comment: trusted.comment}
      })
      const data = {
        id: this.planetID,
        name: this.planetName,
        trusted_nets: dataTrusted,
      }
      console.log('delete id', id, 'data', data)
      const url = `configs/${this.selectedBranch}/d/planet/`
      const methodName = 'PUT'
      await RequestsUtils.sendReblazeRequest({methodName, url, data})
    },
  },
  async created() {
    await this.loadConfigs()
    this.setSelectedDataFromRouteParams()
    await this.loadTrustedSources()
  },
})
</script>
<style scoped
       lang="scss">
.collapsible {
  cursor: pointer;
  display: flex;
  flex-direction: row;
  justify-items: center;
}

.collapsible-card {
  border: 1px solid #fff;
}

.collapsible-card:hover {
  border: 1px solid #b5b5b5;
}

.card.collapsed .collapsible-content {
  display: none;
}

.rbz-content .collapsed .media {
  margin: 0;
}

.collapsible .fa-angle-down {
  align-self: center;
}

.ml-3px {
  margin-left: 3px;
}

.cell-height {
  height: fit-content;
}

</style>
