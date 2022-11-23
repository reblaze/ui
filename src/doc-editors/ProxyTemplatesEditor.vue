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
                <button class="button is-small new-proxy-template-document-button"
                        :class="{'is-loading': isNewLoading}"
                        @click="addNewProxyTemplate()"
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
                        :disabled="!selectedProxyTemplate"
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
         v-if="!loadingDocCounter && selectedBranch && selectedProxyTemplate">
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
                                rows="2">
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
                <div class="field height-100px">
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
                <div class="field height-140px">
                  <label class="label is-small">
                    Proxy Send Timeout
                  </label>
                  <div class="control suffix seconds-suffix">
                    <input class="input is-small document-proxy-sen-timeout"
                           title="Proxy send timeout"
                           placeholder="Proxy send timeout"
                           v-model="selectedProxyTemplate.proxy_send_timeout">
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
                           v-model="selectedProxyTemplate.proxy_read_timeout">
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
                           v-model="selectedProxyTemplate.upstream_host">
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
                           v-model="selectedProxyTemplate.xrealip_header_name">
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
      <div class="card collapsible-card"
             :class="{ collapsed: isTrustedSourcesCollapsed }">
          <div class="card-content px-0 py-0">
            <div class="media collapsible px-5 py-5 mb-0"
                 @click="isTrustedSourcesCollapsed = !isTrustedSourcesCollapsed">
              <div class="media-content">
                <p class="title is-5 is-uppercase">Trusted Sources</p>
              </div>
              <span v-show="isTrustedSourcesCollapsed">
                <i class="fas fa-angle-down"
                   aria-hidden="true"></i>
              </span>
              <span v-show="!isTrustedSourcesCollapsed">
                <i class="fas fa-angle-up"
                   aria-hidden="true"></i>
              </span>
            </div>
            <div class="content collapsible-content px-5 py-5">
                  <div class="content" >
                    <rbz-table :columns="trusted_sources_columns"
                                :data="trustedData"
                                :row-button-icon="'fa-trash'"
                                :row-button-title="'Delete'"
                                :show-menu-column="true"
                                :show-filter-button="true"
                                :show-row-button="true"
                                :show-new-button="true"
                                :show-second-row-button="true"
                                @row-button-clicked="openDeleteModal"
                                @new-button-clicked="openAddNewTrustedSourceModal"
                                @second-row-button-clicked="openEditTrustedModal"
                                >
                    </rbz-table>
                </div>
                <div class="content no-data-wrapper" v-if="!trustedData">
                  <button class="button is-outlined is-text is-small is-loading document-loading">
                    Loading
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
                      <textarea rows="5"
                                class="is-small textarea site-conf"
                                v-model="selectedProxyTemplate.conf_specific">
                      </textarea>
                    </div>
                    <p class="help has-text-danger">
                      Unless instructed, don't touch!
                    </p>
                  </div>
                </div>
              </div>
              <div class="column is-6">
                <div class="field ">
                  <div class="field">
                    <label class="label is-small">
                      HTTPS Listener Custom Configuration
                    </label>
                    <div class="control">
                      <textarea rows="5"
                                class="is-small textarea site-ssl-conf"
                                v-model="selectedProxyTemplate.ssl_conf_specific">
                      </textarea>
                    </div>
                    <p class="help has-text-danger">
                      Unless instructed, don't touch!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <span class="is-family-monospace has-text-grey-lighter is-inline-block mt-3">{{ documentAPIPath }}</span>
    </div>
    <div class="modal add-source is-active"
      v-if="isAddModalVisible">
      <div class="modal-background"
            tabindex="0"
            @keydown.esc="closeModal">
        <div class="modal-card modal-position">
          <div class="modal-card-head">
            <h5 class="modal-card-title is-size-6 mb-0">
                Add Trusted Source
            </h5>
            <button class="button is-small" @click="closeModal">X</button>
          </div>
          <div class="modal-card-body">
              <div class="field">
                  <div class="is-small is-size-7 is-fullwidth mb-1">
                    <span value="cidr" key="cidr">IP address</span>
                  </div>
                  <input
                      class="input is-small"
                      :class="{'is-danger': isError('ip')}"
                      placeholder="Enter IP address"
                      v-model="sourceToAdd.address"
                      @input="validateIp"
                      ref="address" />
                  <p class="help is-danger" v-if="isError('ip')">
                      Incorrect value: expected IP address
                  </p>
                  <p class="help is-danger" v-else-if="isError('duplicate')">
                      A source with this ip address is already in the trusted sources list
                  </p>
              </div>
              <div class="field">
                  <label class="label is-small mb-1">Comment</label>
                  <div class="control">
                      <input
                          class="input is-small"
                          placeholder="Enter comment"
                          v-model="sourceToAdd.comment" />
                  </div>
              </div>
          </div>
          <div class="modal-card-foot modal-footer-buttons">
            <div class="buttons is-right is-fullwidth">
              <button class="button is-small" @click="closeModal">
                  Cancel
              </button>
              <button
                  :disabled="!ipToAddIsValid"
                  class="button is-small"
                  @click="saveTrustedSource">
                  Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="modal add-source is-active"
      v-if="isEditTrustedSource">
      <div class="modal-background"
            tabindex="0"
            @keydown.esc="closeModal">
        <div class="modal-card modal-position">
          <div class="modal-card-head">
            <h5 class="modal-card-title is-size-6 mb-0">
                Edit Trusted Source
            </h5>
            <button class="button is-small" @click="closeModal">X</button>
          </div>
          <div class="modal-card-body">
              <div class="field">
                  <div class="is-small is-size-7 is-fullwidth mb-1">
                    <span value="cidr" key="cidr">IP address</span>
                  </div>
                  <input
                      class="input is-small"
                      :class="{'is-danger': isError('ip')}"
                      placeholder="Enter IP address"
                      v-model="sourceToAdd.address"
                      @input="validateIp"
                      ref="address" />
                  <p class="help is-danger" v-if="isError('ip')">
                      Incorrect value: expected IP address
                  </p>
                  <p class="help is-danger" v-else-if="isError('duplicate')">
                      A source with this ip address is already in the trusted sources list
                  </p>
              </div>
              <div class="field">
                  <label class="label is-small mb-1">Comment</label>
                  <div class="control">
                      <input
                          class="input is-small"
                          placeholder="Enter comment"
                          v-model="sourceToAdd.comment" />
                  </div>
              </div>
          </div>
          <div class="modal-card-foot modal-footer-buttons">
            <div class="buttons is-right is-fullwidth">
              <button class="button is-small" @click="closeModal">
                  Cancel
              </button>
              <button
                  :disabled="!ipToAddIsValid"
                  class="button is-small"
                  @click="saveTrustedSource">
                  Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="modal add-source is-active"
      v-if="isDeleteModalVisible">
      <div class="modal-background"
            tabindex="0"
            @keydown.esc="closeModal">
        <div class="modal-card modal-position">
          <div class="modal-card-head">
            <h5 class="modal-card-title is-size-6 mb-0">
                Delete Trusted Source
            </h5>
            <button class="button is-small" @click="closeModal">X</button>
          </div>
          <div class="modal-card-body delete-modal" >
            <span class="warning-delete">Are you sure you want to delete this trusted source?</span>
          </div>
          <div class="modal-card-foot modal-footer-buttons">
            <div class="buttons is-right is-fullwidth">
              <button class="button is-small" @click="closeModal">
                  Cancel
              </button>
              <button
                  class="button is-small"
                  @click="saveTrustedSource">
                  OK
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="content no-data-wrapper"
         v-if="loadingDocCounter || !selectedBranch || !selectedProxyTemplate">
      <div v-if="loadingDocCounter > 0">
        <button class="button is-outlined is-text is-small is-loading document-loading">
          Loading
        </button>
      </div>
      <div v-else
           class="no-data-message">
        No data found.
        <div>
          <span v-if="!selectedProxyTemplate?.id">
            Missing document. To create a new one, click
            <a title="Add new"
               @click="addNewProxyTemplate()">
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
import {ProxyTemplate, HttpRequestMethods} from '@/types'
import Utils from '@/assets/Utils'
import {defineComponent} from 'vue'
import DatasetsUtils from '@/assets/DatasetsUtils'
import RbzTable from '@/components/RbzTable.vue'
import {mapStores} from 'pinia'
import {useBranchesStore} from '@/stores/BranchesStore'
import _ from 'lodash'

type TrustedSource = {
  id: number,
  address: string,
  comment: string,
}

export default defineComponent({
  name: 'ProxyTemplateEditor',
  components: {
    RbzTable,
  },
  data() {
    return {
      titles: DatasetsUtils.titles,
      docs: [] as unknown as ProxyTemplate[],
      selectedDocID: null as string,

      // Collapsible cards
      isFrontendCollapsed: false,
      isBackendCollapsed: false,
      isAdvancedCollapsed: false,
      isTrustedSourcesCollapsed: false,

      // To prevent deletion of Proxy templates referenced by Server Groups
      referencedIDsProxyTemplate: [] as string[],

      // Loading indicators
      loadingDocCounter: 0,
      isSaveLoading: false,
      isDeleteLoading: false,
      isDownloadLoading: false,
      isNewLoading: false,
      isForkLoading: false,

      apiRoot: RequestsUtils.reblazeAPIRoot,
      apiVersion: RequestsUtils.reblazeAPIVersion,

      // Trusted indicators
      isAddModalVisible: false,
      isEditTrustedSource: false,
      isDeleteModalVisible: false,

      planetID: null as string,
      planetName: null as string,
      trustedData: null as TrustedSource[],
      trusted_sources_columns: [
        {
          title: 'IP',
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
      sourceToAdd: {id: 0, address: '', comment: ''} as TrustedSource,
      ipToAddIsValid: false as boolean,
      sourceToDelete: null as number,
      currentEditIndex: 0 as number,
      errors: [],
    }
  },
  watch: {
    selectedBranch: {
      handler: async function(val, oldVal) {
        if ((this.$route.name as string).includes('ProxyTemplates/config') && val && val !== oldVal) {
          await this.loadDocs()
          await this.setSelectedDataFromRouteParams()
          // redirect to list if no data found
          if (!this.docs?.[0]?.id || !this.selectedProxyTemplate) {
            this.redirectToList()
          }
          await this.loadTrustedSources()
          await this.loadReferencedProxyTemplatesIDs()
        }
      },
      immediate: true,
    },
  },
  computed: {
    selectedProxyTemplate: {
      get(): ProxyTemplate {
        return (this.selectedDocIndex > -1) ? this.docs[this.selectedDocIndex] : null
      },
      set(newDoc: ProxyTemplate): void {
        if (this.selectedDocIndex > -1) {
          this.docs[this.selectedDocIndex] = newDoc
        }
      },
    },

    documentAPIPath(): string {
      const apiPrefix = `${this.apiRoot}/${this.apiVersion}`
      const apiPath = `configs/${this.selectedBranch}/d/proxy-templates/e/${this.selectedProxyTemplate.id}/`
      return `${apiPrefix}/reblaze/${apiPath}`
    },

    selectedDocNotDeletable(): boolean {
      return !this.selectedProxyTemplate ||
          this.selectedProxyTemplate.id.startsWith('__') || // Default entries
          this.isDocReferenced
    },

    isDocReferenced(): boolean {
      return this.referencedIDsProxyTemplate.includes(this.selectedProxyTemplate.id)
    },

    selectedBranch(): string {
      return this.branchesStore.selectedBranchId
    },

    ...mapStores(useBranchesStore),

    selectedDocIndex(): number {
      return _.findIndex(this.docs, (doc) => {
        return doc.id === this.selectedDocID
      })
    },
  },
  methods: {

    async goToRoute() {
      const newRoute = `/${this.selectedBranch}/proxy-templates/config/${this.selectedDocID}`
      if (this.$route.path !== newRoute) {
        console.log('Switching document, new proxy templates document path: ' + newRoute)
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
      this.$router.push(`/${this.selectedBranch}/proxy-templates/list`)
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

      const docName = this.docs[this.selectedDocIndex].id
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
        Utils.downloadFile(this.titles['proxy-templates-singular'], 'json', this.selectedProxyTemplate)
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

    newProxyTemplate(): ProxyTemplate {
      const factory = DatasetsUtils.newOperationEntryFactory['proxy-templates']
      return factory && factory()
    },

    async forkDoc() {
      this.setLoadingDocStatus(true)
      this.isForkLoading = true
      const docToAdd = _.cloneDeep(this.selectedProxyTemplate) as ProxyTemplate
      docToAdd.id = DatasetsUtils.generateUUID2()
      docToAdd.name = 'copy of ' + docToAdd.name + ' ' + docToAdd.id

      const docTypeText = this.titles['proxy-templates-singular']
      const successMessage = `The ${docTypeText} was duplicated.`
      const failureMessage = `Failed while attempting to duplicate the ${docTypeText}.`
      await this.addNewProxyTemplate(docToAdd, successMessage, failureMessage)
      this.isForkLoading = false
      this.setLoadingDocStatus(false)
    },

    async addNewProxyTemplate(proxyTemplateToAdd?: ProxyTemplate, successMessage?: string, failureMessage?: string) {
      this.setLoadingDocStatus(true)
      this.isNewLoading = true

      if (!proxyTemplateToAdd) {
        proxyTemplateToAdd = this.newProxyTemplate()
      }
      const proxyTemplateText = this.titles['proxy-templates-singular']
      if (!successMessage) {
        successMessage = `New ${proxyTemplateText} was created.`
      }
      if (!failureMessage) {
        failureMessage = `Failed while attempting to create the new ${proxyTemplateText}.`
      }
      const data = proxyTemplateToAdd
      await this.saveChanges('POST', data, successMessage, failureMessage)
      this.loadDocs()
      this.selectedDocID = proxyTemplateToAdd.id

      this.goToRoute()
      this.isNewLoading = false
      this.setLoadingDocStatus(false)
    },


    async saveChanges(methodName?: HttpRequestMethods, data?: ProxyTemplate, successMessage?:
      string, failureMessage?: string) {
      this.setLoadingDocStatus(true)
      this.isSaveLoading = true
      if (!methodName) {
        methodName = 'PUT'
      }
      if (!data) {
        data = this.selectedProxyTemplate
      }
      const url = `configs/${this.selectedBranch}/d/proxy-templates/e/${data.id}/`
      const proxyTemplateText = this.titles['proxy-templates-singular']
      if (!successMessage) {
        successMessage = `Changes to the ${proxyTemplateText} were saved.`
      }
      if (!failureMessage) {
        failureMessage = `Failed while attempting to save the changes to the ${proxyTemplateText}.`
      }
      await RequestsUtils.sendReblazeRequest({methodName, url, data, successMessage, failureMessage})

      // save trusted sources
      const trustedUrl = `configs/${this.selectedBranch}/d/planet/`
      const trustedArr = this.trustedData.map((trusted) => {
        return {
          address: trusted.address,
          comment: trusted.comment,
        }
      })
      const planetData = {
        id: this.planetID,
        name: this.planetName,
        trusted_nets: trustedArr,
      }
      await RequestsUtils.sendReblazeRequest({methodName: 'PUT', data: planetData, url: trustedUrl})

      this.isSaveLoading = false
      this.setLoadingDocStatus(false)
    },

    sortDocs() {
      this.docs = _.sortBy(this.docs, [(doc) => doc.name.toLowerCase()])
    },

    async loadDocs() {
      this.isDownloadLoading = true
      this.setLoadingDocStatus(true)
      const branch = this.selectedBranch
      const url = `configs/${branch}/d/proxy-templates/`

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

      this.setLoadingDocStatus(false)
      this.isDownloadLoading = false
    },

    async loadReferencedProxyTemplatesIDs() {
      const response = await RequestsUtils.sendReblazeRequest({
        methodName: 'GET',
        url: `configs/${this.selectedBranch}/d/sites/`,
      })
      const serverGroups = response?.data || []
      const referencedProxyTemplates: string[] = []
      _.forEach(serverGroups, (serverGroup) => {
        referencedProxyTemplates.push(serverGroup['proxy_template'])
      })
      this.referencedIDsProxyTemplate = _.uniq(referencedProxyTemplates)
    },

    isError(error: string): boolean {
      return this.errors.find((item) => item === error)
    },

    validateIp() {
      this.clearError('ip')
      // eslint-disable-next-line max-len
      const ipPattern = /((^\s*((([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]))\s*(:([0-9]|[1-8][0-9]|9[0-9]|[1-8][0-9]{2}|9[0-8][0-9]|99[0-9]|[1-8][0-9]{3}|9[0-8][0-9]{2}|99[0-8][0-9]|999[0-9]|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5])|(\/[0-9]|\/[1-2][0-9]|\/[1-3][0-2]))?(\s?)?$)|(^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f] {1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d |1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*(:([0-9]|[1-8][0-9]|9[0-9]|[1-8][0-9]{2}|9[0-8][0-9]|99[0-9]|[1-8][0-9]{3}|9[0-8][0-9]{2}|99[0-8][0-9]|999[0-9]|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5])|(\/[0-9] |\/[1-2][0-9]|\/[1-3][0-2]))?(\s?)?$))/
      this.ipToAddIsValid = ipPattern.test(this.sourceToAdd.address)
      if (this.ipToAddIsValid) {
        this.validateDuplication()
      } else {
        this.errors.push('ip')
      }
    },
    validateDuplication() {
      this.clearError('duplicate')
      this.ipToAddIsValid = !this.trustedData.find((trustedSource) => {
        return trustedSource.address === this.sourceToAdd.address
      })
      if (!this.ipToAddIsValid) {
        this.errors.push('duplicate')
      }
    },

    clearError(field: string = '') {
      this.errors = field ? this.errors.filter((err: string) => err !== field) : []
    },

    // TODO to switch this, truseted source, to the correct path under Proxy Template later on
    // and to have an id for each record of the trusted_nets.
    async loadTrustedSources() {
      const url = `configs/${this.selectedBranch}/d/planet/`
      const methodName = 'GET'
      const response = await RequestsUtils.sendReblazeRequest({methodName, url})
      this.planetID = response.data.id
      this.planetName = response.data.name
      this.trustedData = response?.data?.trusted_nets?.map(
        (trusted: {address: string, comment: string}, index: number)=> {
          return {id: index, address: trusted.address, comment: trusted.comment}
        })
    },

    closeModal() {
      this.isAddModalVisible = false
      this.isEditTrustedSource = false
      this.isDeleteModalVisible = false
      this.currentEditIndex = 0
      this.sourceToAdd = {} as TrustedSource
      this.errors = []
    },

    async saveTrustedSource() {
      if (this.isEditTrustedSource) {
        this.editTrustedSource()
      } else if (this.isAddModalVisible) {
        this.addTrustedSource()
      } else {
        this.deleteTrustedElement()
      }
    },

    openAddNewTrustedSourceModal() {
      this.isAddModalVisible = true
      this.isEditTrustedSource = false
      this.isDeleteModalVisible = false
      this.currentEditIndex = this.trustedData.length
      this.sourceToAdd.address = ''
      this.sourceToAdd.comment = ''
    },

    openEditTrustedModal(id: number) {
      this.isAddModalVisible = false
      this.isDeleteModalVisible = false
      this.currentEditIndex = id
      this.sourceToAdd.address = this.trustedData[id].address
      this.sourceToAdd.comment = this.trustedData[id].comment
      this.ipToAddIsValid = true
      this.isEditTrustedSource = true
    },

    editTrustedSource() {
      this.trustedData[this.currentEditIndex].address = this.sourceToAdd.address
      this.trustedData[this.currentEditIndex].comment = this.sourceToAdd.comment
      this.isEditTrustedSource = false
    },

    addTrustedSource() {
      this.trustedData.push({id: this.trustedData.length,
        address: this.sourceToAdd.address, comment: this.sourceToAdd.comment})
      this.isAddModalVisible = false
    },

    openDeleteModal(id: number) {
      this.sourceToDelete = id
      this.isDeleteModalVisible = true
    },

    deleteTrustedElement() {
      this.trustedData = this.trustedData.filter((trusted) => trusted.id !== this.sourceToDelete)
      this.isDeleteModalVisible = false
    },
  },
  async created() {
    await this.branchesStore.list
  },
})
</script>
<style scoped
       lang="scss">

  .modal-position {
    margin: 300px auto;
  }

</style>
