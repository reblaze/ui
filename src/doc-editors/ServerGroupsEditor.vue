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
                <button class="button is-small new-document-button"
                        :class="{'is-loading': isNewLoading}"
                        @click="addNewDoc()"
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
                        :disabled="!selectedServerGroup"
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
                  <span class="field has-addons">
                    <span class="control">
                      <button class="button is-small has-text-danger delete-server-group"
                              data-qa="delete-server-group-btn"
                              :class="{'is-loading': isDeleteLoading}"
                              :disabled="selectedDocNotDeletable"
                              @click="toggleDeleteServerGroupDoc()">
                        <span class="icon is-small">
                          <i class="fas fa-trash"></i>
                        </span>
                        <span>
                          Delete
                        </span>
                      </button>
                    </span>
                    <span class="control is-expanded confirm-delete"
                          v-if="deleteServerGroupDoc">
                      <input class="input is-small width-200px delete-server-group-input"
                             data-qa="confirm-server-group-input"
                             title="Server Group Name"
                             ref="confirm-delete"
                             placeholder="Confirm Server Group name"
                             v-model="deleteServerGroupDocName"
                             type="text">
                    </span>
                    <span class="control"
                          v-if="deleteServerGroupDoc">
                      <button class="button is-danger is-small delete-server-group-cancel"
                              data-qa="cancel-delete-server-group-btn"
                              @click="toggleDeleteServerGroupDoc">
                        <span class="icon is-small">
                          <i class="fas fa-times"></i>
                        </span>
                      </button>
                    </span>
                    <span class="control"
                          v-if="deleteServerGroupDoc">
                      <button class="button is-primary is-small delete-server-group-confirm"
                              data-qa="confirm-delete-server-group-btn"
                              :disabled="!isDeleteServerGroupDocNameValid"
                              @click="deleteServerGroup">
                        <span class="icon is-small">
                          <i class="fas fa-check"></i>
                        </span>
                      </button>
                    </span>
                  </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <hr/>
    <div class="content"
         v-if="!loadingDocCounter && selectedBranch && selectedServerGroup">
      <div class="columns columns-divided">
        <div class="column is-4">
          <div class="field">
            <label class="label is-small">
              Name
              <span class="has-text-grey is-pulled-right document-id"
                    title="Rule id">
                      {{ selectedServerGroup.id }}
                    </span>
            </label>
            <div class="control">
              <input class="input is-small document-name"
                     title="Document name"
                     placeholder="Document name"
                     v-model="selectedServerGroup.name"/>
            </div>
          </div>
          <div class="field">
            <label class="label is-small">
              Match Host/Authority Headers
            </label>
            <div class="control">
                    <textarea
                        class="is-small textarea match-host"
                        title="Match Host/Authority Headers"
                        placeholder="Match Host/Authority Headers"
                        data-qa="match-host-input"
                        v-model="serverNames"
                        rows="2">
                    </textarea>
            </div>
          </div>
          <!--div-- class="field">
            <label class="label is-small">
              Certificate
            </label>
            <div class="control is-expanded">
              <div class="select is-fullwidth is-small">
                <select v-model="selectedServerGroup.ssl_certificate" >
                  <option value="" selected disabled>
                      Select Certificate
                  </option>
                  <option v-for="certificate in certificatesNames"
                      :value="certificate[0]"
                      :key="certificate[0]">
                      {{certificate[0] }} ({{certificate[1] }})
                  </option>
                </select>
              </div>
            </div>
            <p class="help">
              (Optional) Choose a certificate for the site, or create a
              <a url="/new-ssl-page/certificate-store">
                  new one
              </a>.
            </p>
          <div class="field">
            <div class="field textarea-field">
              <label class="label is-small">Description</label>
              <div class="control">
                      <textarea class="is-small textarea document-description"
                                data-qa="description-input"
                                title="Document description"
                                v-model="selectedServerGroup.description"
                                rows="5">
                      </textarea>
              </div>
            </div>
          </div>
          </-div-->
        </div>
      </div>
      <div class="columns is-multiline">
        <div class="column is-4">
          <div class="field">
            <label class="label is-small">Routing Profile</label>
            <div class="control is-expanded">
              <div class="select is-fullwidth is-small">
                <select v-model="selectedServerGroup.routing_profile"
                        data-qa="routing-profile-dropdown"
                        class="document-routing-profile-selection"
                        title="Routing profile">
                  <option v-for="routingProfile in routingProfilesNames"
                          :value="routingProfile[0]"
                          :key="routingProfile[0]">
                    {{ routingProfile[1] }}
                  </option>
                </select>
              </div>
            </div>
          </div>
        </div>
        <div v-if="selectedRoutingProfile"
             class="column is-12">
          <div class="card mb-0">
            <div class="card-content">
              <table class="table is-size-7">
                <thead>
                <tr>
                  <th class="width-500px">
                    Path
                  </th>
                  <th class="width-250px">
                    Backend Service
                  </th>
                  <th class="width-120px">
                    Edge Functions
                  </th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="location in selectedRoutingProfile.locations"
                    :key="location.path">
                  <td class="ellipsis">
                    {{ location.path }}
                  </td>
                  <td class="ellipsis">
                    {{ referencedDocName(backendServicesNames, location.backend_id) }}
                  </td>
                  <td>
                          <span v-for="edgeFunction in location.cloud_functions"
                                :key="edgeFunction">
                            {{ location.cloud_functions.length }}
                          </span>
                  </td>
                </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <div class="columns is-multiline">
        <div class="column is-4">
          <div class="field">
            <label class="label is-small">Security Policy</label>
            <div class="control is-expanded">
              <div class="select is-fullwidth is-small">
                <select v-model="selectedServerGroup.security_policy"
                        data-qa="security-policy-dropdown"
                        class="document-security-policy-selection"
                        title="Security policy">
                  <option v-for="securityPolicy in securityPoliciesNames"
                          :value="securityPolicy[0]"
                          :key="securityPolicy[0]">
                    {{ securityPolicy[1] }}
                  </option>
                </select>
              </div>
            </div>
          </div>
        </div>
        <div v-if="selectedSecurityPolicy"
             class="column is-12">
          <div class="card mb-0">
            <div class="card-content">
              <table class="table is-size-7">
                <thead>
                <tr>
                  <th class="width-100px">Name</th>
                  <th class="width-400px">Path</th>
                  <th class="width-150px">Content Filter</th>
                  <th class="width-150px">ACL</th>
                  <th class="width-120px">Rate Limit</th>
                </tr>
                </thead>
                <tbody v-for="(mapEntry, mapIndex) in selectedSecurityPolicy.map"
                       :key="mapIndex">
                <tr>
                  <td class="ellipsis"
                      :title="mapEntry.name">
                    {{ mapEntry.name }}
                  </td>
                  <td class="ellipsis"
                      :title="mapEntry.match">
                    {{ mapEntry.match }}
                  </td>
                  <td class="ellipsis"
                      :class="mapEntry.content_filter_active ? 'has-text-success' : 'has-text-danger'"
                      :title="mapEntry.content_filter_active ? 'Active mode' : 'Learning mode'">
                    {{ referencedDocName(contentFilterProfilesNames, mapEntry.content_filter_profile) }}
                  </td>
                  <td class="ellipsis"
                      :class="mapEntry.acl_active ? 'has-text-success' : 'has-text-danger'"
                      :title="mapEntry.acl_active ? 'Active mode' : 'Learning mode'">
                    {{ referencedDocName(aclProfilesNames, mapEntry.acl_profile) }}
                  </td>
                  <td class="ellipsis">
                    {{ mapEntry.limit_ids.length }}
                  </td>
                </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <div class="columns">
        <div class="column is-4">
          <div class="field">
            <label class="label is-small">Mobile SDK</label>
            <div class="control is-expanded">
              <div class="select is-fullwidth is-small">
                <select v-model="selectedServerGroup.mobile_sdk"
                        data-qa="mobile-sdk-dropdown"
                        class="document-mobile-sdk-selection"
                        title="Mobile SDK">
                  <option value="">
                    None
                  </option>
                  <option v-for="mobileSDK in mobileSDKsNames"
                          :value="mobileSDK[0]"
                          :key="mobileSDK[0]">
                    {{ mobileSDK[1] }}
                  </option>
                </select>
              </div>
            </div>
          </div>
          <div class="field">
            <label class="label is-small">Proxy Template</label>
            <div class="control is-expanded">
              <div class="select is-fullwidth is-small">
                <select v-model="selectedServerGroup.proxy_template"
                        data-qa="proxy-template-dropdown"
                        class="document-proxy-template-selection"
                        title="Proxy template">
                  <option v-for="proxyTemplate in proxyTemplatesNames"
                          :value="proxyTemplate[0]"
                          :key="proxyTemplate[0]">
                    {{ proxyTemplate[1] }}
                  </option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
      <span class="is-family-monospace has-text-grey-lighter is-inline-block mt-3">{{ documentAPIPath }}</span>
    </div>
    <div class="content no-data-wrapper"
         v-if="loadingDocCounter || !selectedBranch || !selectedServerGroup">
      <div v-if="loadingDocCounter > 0">
        <button class="button is-outlined is-text is-small is-loading document-loading">
          Loading
        </button>
      </div>
      <div v-else
           class="no-data-message">
        No data found.
        <div>
          <span v-if="!selectedServerGroup?.id">
            Missing document. To create a new one, click
            <a title="Add new"
               @click="addNewDoc()">
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
import RequestsUtils from '@/assets/RequestsUtils'
import {
  ACLProfile,
  BackendService,
  Certificate,
  ProxyTemplate,
  ContentFilterProfile,
  MobileSDK,
  RoutingProfile,
  SecurityPolicy,
  Site,
  HttpRequestMethods,
} from '@/types'
import Utils from '@/assets/Utils'
import {defineComponent} from 'vue'
import DatasetsUtils from '@/assets/DatasetsUtils'
import {AxiosResponse} from 'axios'
import {mapStores} from 'pinia'
import {useBranchesStore} from '@/stores/BranchesStore'

export default defineComponent({
  name: 'ServerGroupsEditor',
  data() {
    return {
      titles: DatasetsUtils.titles,
      configs: [],
      docs: [] as unknown as Site[],
      selectedDocID: null,

      // Loading indicators
      loadingDocCounter: 0,
      isSaveLoading: false,
      isDeleteLoading: false,
      isDownloadLoading: false,
      isNewLoading: false,
      isForkLoading: false,

      // Referenced docs
      securityPolicies: [] as SecurityPolicy[],
      securityPoliciesNames: [] as [SecurityPolicy['id'], SecurityPolicy['name']][],
      routingProfiles: [] as RoutingProfile[],
      routingProfilesNames: [] as [RoutingProfile['id'], RoutingProfile['name']][],
      proxyTemplatesNames: [] as [ProxyTemplate['id'], ProxyTemplate['name']][],
      mobileSDKsNames: [] as [MobileSDK['id'], MobileSDK['name']][],
      certificatesNames: [] as [Certificate['id'], Certificate['san']][],
      backendServicesNames: [] as [BackendService['id'], BackendService['name']][],
      contentFilterProfilesNames: [] as [ContentFilterProfile['id'], ContentFilterProfile['name']][],
      aclProfilesNames: [] as [ACLProfile['id'], ACLProfile['name']][],

      deleteServerGroupDocName: '' as string,
      deleteServerGroupDoc: false as boolean,

      apiRoot: RequestsUtils.reblazeAPIRoot,
      apiVersion: RequestsUtils.reblazeAPIVersion,

    }
  },
  watch: {
    selectedBranch: {
      handler: function(val, oldVal) {
        if ((this.$route.name as string).includes('ServerGroups/config') && val && val !== oldVal) {
          this.loadDocs()
          this.setSelectedDataFromRouteParams()
          // this.loadCertificates()
          this.loadSecurityPolicies()
          this.loadRoutingProfiles()
          this.loadProxyTemplates()
          this.loadMobileSDKs()
          this.loadBackendServices()
          this.loadContentFilterProfiles()
          this.loadACLProfiles()
        }
      },
      immediate: true,
    },
  },
  computed: {
    documentAPIPath(): string {
      const apiPrefix = `${this.apiRoot}/${this.apiVersion}`
      return `${apiPrefix}/reblaze/configs/${this.selectedBranch}/d/sites/e/${this.selectedDocID}/`
    },

    selectedDocNotDeletable(): boolean {
      return !this.selectedServerGroup ||
          this.selectedServerGroup.id.startsWith('__') // Default entries
    },

    selectedSecurityPolicy(): SecurityPolicy {
      return this.securityPolicies.find((securityPolicy) => {
        return securityPolicy.id === this.selectedServerGroup.security_policy
      })
    },

    selectedRoutingProfile(): RoutingProfile {
      return this.routingProfiles.find((routingProfile) => {
        return routingProfile.id === this.selectedServerGroup.routing_profile
      })
    },

    selectedServerGroup: {
      get(): Site {
        return this.docs[this.selectedDocIndex]
      },
      set(newDoc: Site): void {
        this.docs[this.selectedDocIndex] = newDoc
      },
    },

    selectedDocIndex(): number {
      if (this.selectedDocID) {
        return _.findIndex(this.docs, (doc) => {
          return doc.id === this.selectedDocID
        })
      }
      return 0
    },

    serverNames: {
      get(): string {
        return Array.from(this.selectedServerGroup?.server_names || '').join('\n')
      },
      set(newValue: string) {
        const value = newValue.replaceAll(' ', '')
        this.selectedServerGroup.server_names = value.split('\n')
      },
    },

    selectedBranch(): string {
      return this.branchesStore.selectedBranchId
    },

    ...mapStores(useBranchesStore),

    isDeleteServerGroupDocNameValid(): boolean {
      const deleteConfirmInputName = this.deleteServerGroupDocName.trim()
      return deleteConfirmInputName === this.selectedServerGroup.name
    },
  },
  methods: {

    async goToRoute() {
      const newRoute = `/${this.selectedBranch}/server-groups/config/${this.selectedDocID}`
      if (this.$route.path !== newRoute) {
        console.log('Switching document, new document path: ' + newRoute)
        await this.$router.push(newRoute)
        await this.setSelectedDataFromRouteParams()
      }
    },

    newSite(): Site {
      const factory = DatasetsUtils.newOperationEntryFactory['sites']
      return factory && factory()
    },

    sortDocs() {
      this.docs = _.sortBy(this.docs, [(doc) => doc.name.toLowerCase()])
    },

    async loadDocs() {
      this.isDownloadLoading = true
      this.setLoadingDocStatus(true)
      const branch = this.selectedBranch
      const url = `configs/${branch}/d/sites/`

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
        if (!_.find(this.docs, (doc: Site) => {
          return doc.id === this.selectedDocID
        })) {
          this.selectedDocID = this.docs[0].id
        }
      }
      this.setLoadingDocStatus(false)
      this.isDownloadLoading = false
    },

    async setSelectedDataFromRouteParams() {
      this.setLoadingDocStatus(true)
      this.selectedDocID = this.$route.params?.doc_id?.toString()
      this.setLoadingDocStatus(false)
    },

    redirectToList() {
      this.$router.push(`/${this.selectedBranch}/server-groups/list`)
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
        Utils.downloadFile('server-groups', 'json', this.selectedServerGroup)
      }
    },

    async deleteServerGroup() {
      this.setLoadingDocStatus(true)
      this.isDeleteLoading = true
      const serverGroupText = this.titles['sites-singular']
      const url = `configs/${this.selectedBranch}/d/sites/e/${this.selectedDocID}/`
      const successMessage = `The ${serverGroupText} was deleted.`
      const failureMessage = `Failed while attempting to delete the ${serverGroupText}.`
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

    async forkDoc() {
      this.setLoadingDocStatus(true)
      this.isForkLoading = true
      const docToAdd = this.selectedServerGroup as Site
      docToAdd.id = DatasetsUtils.generateUUID2()
      docToAdd.name = 'Proxy Template copy no. ' + docToAdd.id

      const docTypeText = this.titles['sites-singular']
      const successMessage = `The ${docTypeText} was duplicated.`
      const failureMessage = `Failed while attempting to duplicate the ${docTypeText}.`
      await this.addNewDoc(docToAdd, successMessage, failureMessage)
      this.isForkLoading = false
      this.setLoadingDocStatus(false)
    },

    async addNewDoc(siteToAdd?: Site, successMessage?: string, failureMessage?: string) {
      this.setLoadingDocStatus(true)
      this.isNewLoading = true

      if (!siteToAdd) {
        siteToAdd = this.newSite()
      }

      const siteText = this.titles['sites-singular']
      if (!successMessage) {
        successMessage = `New ${siteText} was created.`
      }
      if (!failureMessage) {
        failureMessage = `Failed while attempting to create the new ${siteText}.`
      }
      const data = siteToAdd
      await this.saveChanges('POST', data, successMessage, failureMessage)
      // this.docs.unshift(siteToAdd)
      // this.sortDocs()
      this.loadDocs()
      this.selectedDocID = siteToAdd.id

      this.goToRoute()
      this.isNewLoading = false
      this.setLoadingDocStatus(false)
    },

    async saveChanges(methodName?: HttpRequestMethods, data?: Site, successMessage?: string, failureMessage?: string) {
      this.setLoadingDocStatus(true)
      this.isSaveLoading = true

      if (!methodName) {
        methodName = 'PUT'
      }
      if (!data) {
        data = this.selectedServerGroup
      }
      const url = `configs/${this.selectedBranch}/d/sites/e/${data.id}/`
      const serverGroupText = this.titles['sites-singular']
      if (!successMessage) {
        successMessage = `Changes to the ${serverGroupText} were saved.`
      }
      if (!failureMessage) {
        failureMessage = `Failed while attempting to save the changes to the ${serverGroupText}.`
      }

      // data.ssl_certificate = 'lets encript certificate'
      // TODO delete after we have UI for ssl certificate as it is a required string in schema
      await RequestsUtils.sendReblazeRequest({methodName, url, data, successMessage, failureMessage})
      this.isSaveLoading = false
      this.setLoadingDocStatus(false)
    },

    // loadCertificates() {
    //   RequestsUtils.sendReblazeRequest({
    //     methodName: 'GET',
    //     url: `configs/${this.selectedBranch}/d/certificates/`,
    //     config: {headers: {'x-fields': 'id, san'}},
    //   }).then((response: AxiosResponse<Certificate[]>) => {
    //     if (response.data.length > 0) {
    //       this.certificatesNames = _.sortBy(_.map(response.data, (entity) => {
    //         return [entity.id, entity.san]
    //       }), (e) => {
    //         return e[1]
    //       })
    //     } else {
    //       // TODO  get certificate to work
    //       this.certificatesNames = [['need-real-data', ['www.certificate.com']]] as [string, string[]][]
    //     }
    //   })
    // },

    // async loadServerGroup() {
    //   this.setLoadingDocStatus(true)
    //   this.isDownloadLoading = true
    //   this.selectedServerGroup = null
    //   const response = await RequestsUtils.sendReblazeRequest({
    //     methodName: 'GET',
    //     url: `configs/${this.selectedBranch}/d/sites/e/${this.selectedDocID}`,
    //     onFail: () => {
    //       console.log(`Error while attempting to load the ${this.titles['sites-singular']}`)
    //       this.selectedServerGroup = null
    //       this.isDownloadLoading = false
    //     },
    //   })
    //   this.selectedServerGroup = response?.data || {}
    //   this.isDownloadLoading = false
    //   this.setLoadingDocStatus(false)
    // },

    loadSecurityPolicies() {
      RequestsUtils.sendRequest({
        methodName: 'GET',
        url: `configs/${this.selectedBranch}/d/securitypolicies/`,
      }).then((response: AxiosResponse<SecurityPolicy[]>) => {
        this.securityPolicies = response.data
        this.securityPoliciesNames = _.sortBy(_.map(response.data, (entity) => {
          return [entity.id, entity.name]
        }), (e) => {
          return e[1]
        })
      })
    },

    loadRoutingProfiles() {
      RequestsUtils.sendReblazeRequest({
        methodName: 'GET',
        url: `configs/${this.selectedBranch}/d/routing-profiles/`,
      }).then((response: AxiosResponse<RoutingProfile[]>) => {
        this.routingProfiles = response.data
        this.routingProfilesNames = _.sortBy(_.map(response.data, (entity) => {
          return [entity.id, entity.name]
        }), (e) => {
          return e[1]
        })
      })
    },

    loadProxyTemplates() {
      RequestsUtils.sendReblazeRequest({
        methodName: 'GET',
        url: `configs/${this.selectedBranch}/d/proxy-templates/`,
        config: {headers: {'x-fields': 'id, name'}},
      }).then((response: AxiosResponse<ProxyTemplate[]>) => {
        this.proxyTemplatesNames = _.sortBy(_.map(response.data, (entity) => {
          return [entity.id, entity.name]
        }), (e) => {
          return e[1]
        })
      })
    },

    loadMobileSDKs() {
      RequestsUtils.sendReblazeRequest({
        methodName: 'GET',
        url: `configs/${this.selectedBranch}/d/mobile-sdks/`,
        config: {headers: {'x-fields': 'id, name'}},
      }).then((response: AxiosResponse<MobileSDK[]>) => {
        this.mobileSDKsNames = _.sortBy(_.map(response.data, (entity) => {
          return [entity.id, entity.name]
        }), (e) => {
          return e[1]
        })
      })
    },

    loadBackendServices() {
      RequestsUtils.sendReblazeRequest({
        methodName: 'GET',
        url: `configs/${this.selectedBranch}/d/backends/`,
        config: {headers: {'x-fields': 'id, name'}},
      }).then((response: AxiosResponse<BackendService[]>) => {
        this.backendServicesNames = _.sortBy(_.map(response.data, (entity) => {
          return [entity.id, entity.name]
        }), (e) => {
          return e[1]
        })
      })
    },

    loadContentFilterProfiles() {
      RequestsUtils.sendRequest({
        methodName: 'GET',
        url: `configs/${this.selectedBranch}/d/contentfilterprofiles/`,
        config: {headers: {'x-fields': 'id, name'}},
      }).then((response: AxiosResponse<ContentFilterProfile[]>) => {
        this.contentFilterProfilesNames = _.sortBy(_.map(response.data, (entity) => {
          return [entity.id, entity.name]
        }), (e) => {
          return e[1]
        })
      })
    },

    loadACLProfiles() {
      RequestsUtils.sendRequest({
        methodName: 'GET',
        url: `configs/${this.selectedBranch}/d/aclprofiles/`,
        config: {headers: {'x-fields': 'id, name'}},
      }).then((response: AxiosResponse<ACLProfile[]>) => {
        this.aclProfilesNames = _.sortBy(_.map(response.data, (entity) => {
          return [entity.id, entity.name]
        }), (e) => {
          return e[1]
        })
      })
    },

    referencedDocName(list: [string, string][], id: string): string {
      const matchedItem = _.find(list, (listItem) => listItem[0] === id)
      return matchedItem?.[1] || ''
    },

    toggleDeleteServerGroupDoc() {
      this.deleteServerGroupDoc = !this.deleteServerGroupDoc
      if (!this.deleteServerGroupDoc) {
        this.deleteServerGroupDocName = ''
      }
    },
  },
  async created() {
    await this.branchesStore.list
  },
})
</script>
