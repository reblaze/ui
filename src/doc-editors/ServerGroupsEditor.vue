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
                   v-if="docIdNames.length">
                <div class="select is-small">
                  <select v-model="selectedDocID"
                          title="Switch document ID"
                          @change="switchDocID()"
                          class="site-selection"
                          data-qa="switch-document">
                    <option v-for="pair in docIdNames"
                            :key="pair[0]"
                            :value="pair[0]">
                      {{ pair[1] }}
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
                <button class="button is-small has-text-danger delete-document-button"
                        title="Delete document"
                        data-qa="delete-document"
                        :class="{'is-loading': isDeleteLoading}"
                        :disabled="selectedServerGroup?.id === '__default__'"
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
             v-if="selectedServerGroup">
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
                      rows="5">
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
                </!--div-->
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
                <label class="label is-small">Config Template</label>
                <div class="control is-expanded">
                  <div class="select is-fullwidth is-small">
                    <select v-model="selectedServerGroup.proxy_template"
                            data-qa="config-template-dropdown"
                            class="document-config-template-selection"
                            title="Config template">
                      <option v-for="configTemplate in configTemplatesNames"
                              :value="configTemplate[0]"
                              :key="configTemplate[0]">
                        {{ configTemplate[1] }}
                      </option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
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
import {
  ACLProfile,
  BackendService,
  ContentFilterProfile,
  MobileSDK,
  ConfigTemplate,
  RoutingProfile,
  SecurityPolicy,
  Site,
  Certificate,
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
      selectedServerGroup: null as Site,
      docIdFromRoute: '',
      docs: [] as unknown as Site[],
      docIdNames: [] as unknown as [Site['id'], Site['name']][],
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
      configTemplatesNames: [] as [ConfigTemplate['id'], ConfigTemplate['name']][],
      mobileSDKsNames: [] as [MobileSDK['id'], MobileSDK['name']][],
      certificatesNames: [] as [Certificate['id'], Certificate['san']][],
      backendServicesNames: [] as [BackendService['id'], BackendService['name']][],
      contentFilterProfilesNames: [] as [ContentFilterProfile['id'], ContentFilterProfile['name']][],
      aclProfilesNames: [] as [ACLProfile['id'], ACLProfile['name']][],

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
          this.updateDocIdNames()
          this.loadSecurityPolicies()
          this.loadRoutingProfiles()
          this.loadConfigTemplates()
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
      return `${apiPrefix}/reblaze/configs/${this.selectedBranch}/d/sites/e/${this.selectedServerGroup.id}/`
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

    serverNames: {
      get() {
        return Array.from(this.selectedServerGroup.server_names || '').join('\n')
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

    selectedDocIndex(): number {
      if (this.selectedDocID) {
        return _.findIndex(this.docIdNames, (doc) => {
          return doc[0] === this.selectedDocID
        })
      }
      return 0
    },
  },
  methods: {

    async goToRoute(newRoute?: string) {
      if (!newRoute) {
        newRoute = `/${this.selectedBranch}/server-groups/config/${this.selectedDocID}`
      }
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

    updateDocIdNames() {
      this.docIdNames = _.sortBy(_.map(this.docs, (doc) => [doc.id, doc.name]), (entry) => entry[1].toLowerCase())
    },

    async loadDocs(skipDocSelection?: boolean) {
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
      this.updateDocIdNames()
      if (this.docIdNames && this.docIdNames.length && this.docIdNames[0].length) {
        if (!skipDocSelection || !_.find(this.docIdNames, (idName: [Site['id'], Site['name']]) => {
          return idName[0] === this.selectedDocID
        })) {
          this.docIdFromRoute = this.docIdNames[0][0]
        }
        await this.loadServerGroup() // loadSelectedDocData()
      }
      this.setLoadingDocStatus(false)
      this.isDownloadLoading = false
    },

    async setSelectedDataFromRouteParams() {
      this.setLoadingDocStatus(true)
      this.docIdFromRoute = this.$route.params?.doc_id?.toString()
      this.selectedDocID = this.docIdFromRoute
      await this.loadServerGroup()
      this.updateDocIdNames()
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

      const docName = this.docIdNames[this.selectedDocIndex][1]
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

    async deleteDoc() {
      this.setLoadingDocStatus(true)
      this.isDeleteLoading = true
      const serverGroupText = this.titles['sites-singular']
      const url = `configs/${this.selectedBranch}/d/sites/e/${this.selectedServerGroup.id}/`
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

    async addNewDoc(siteToAdd?: Site, successMessage?: string, failureMessage?: string) {
      this.setLoadingDocStatus(true)
      this.isNewLoading = true
      if (!siteToAdd) {
        siteToAdd = this.newSite()
      }
      this.docs.unshift(siteToAdd)
      this.selectedDocID = siteToAdd.id
      const siteText = this.titles['sites-singular']
      if (!successMessage) {
        successMessage = `New ${siteText} was created.`
      }
      if (!failureMessage) {
        failureMessage = `Failed while attempting to create the new ${siteText}.`
      }
      const data = siteToAdd
      await this.saveChanges('POST', data, successMessage, failureMessage)

      this.goToRoute()
      this.isNewLoading = false
      this.setLoadingDocStatus(false)
    },

    async saveChanges(methodName?: HttpRequestMethods, data?: Site, successMessage?: string, failureMessage?: string) {
      this.isSaveLoading = true
      if (!methodName) {
        methodName = 'PUT'
      }
      const url = `configs/${this.selectedBranch}/d/sites/e/${this.selectedDocID}/`
      if (!data) {
        data = this.selectedServerGroup
      }
      const serverGroupText = this.titles['sites-singular']
      if (!successMessage) {
        successMessage = `Changes to the ${serverGroupText} were saved.`
      }
      if (!failureMessage) {
        failureMessage = `Failed while attempting to save the changes to the ${serverGroupText}.`
      }

      await RequestsUtils.sendReblazeRequest({methodName, url, data, successMessage, failureMessage})
      this.isSaveLoading = false
    },

    async forkDoc() {
      this.setLoadingDocStatus(true)
      this.isForkLoading = true
      const docToAdd = _.cloneDeep(this.selectedServerGroup) as Site
      docToAdd.name = 'copy of ' + docToAdd.name
      docToAdd.id = DatasetsUtils.generateUUID2()

      const docTypeText = this.titles['sites-singular']
      const successMessage = `The ${docTypeText} was duplicated.`
      const failureMessage = `Failed while attempting to duplicate the ${docTypeText}.`
      await this.addNewDoc(docToAdd, successMessage, failureMessage)
      this.isForkLoading = false
      this.setLoadingDocStatus(false)
    },

    loadCertificates() {
      RequestsUtils.sendReblazeRequest({
        methodName: 'GET',
        url: `configs/${this.selectedBranch}/d/certificates/`,
        config: {headers: {'x-fields': 'id, san'}},
      }).then((response: AxiosResponse<Certificate[]>) => {
        if (response.data.length > 0) {
          this.certificatesNames = _.sortBy(_.map(response.data, (entity) => {
            return [entity.id, entity.san]
          }), (e) => {
            return e[1]
          })
        } else {
          // TODO  get certificate to work
          this.certificatesNames = [['need-real-data', ['www.certificate.com']]] as [string, string[]][]
        }
      })
    },

    async loadServerGroup() {
      this.isDownloadLoading = true
      const response = await RequestsUtils.sendReblazeRequest({
        methodName: 'GET',
        url: `configs/${this.selectedBranch}/d/sites/e/${this.selectedDocID}`,
        onFail: () => {
          console.log(`Error while attempting to load the ${this.titles['sites-singular']}`)
          this.selectedServerGroup = null
          this.isDownloadLoading = false
        },
      })
      this.selectedServerGroup = response?.data || {}
      this.selectedDocID = this.docIdFromRoute
      this.isDownloadLoading = false
    },

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

    loadConfigTemplates() {
      RequestsUtils.sendReblazeRequest({
        methodName: 'GET',
        url: `configs/${this.selectedBranch}/d/proxy-templates/`,
        config: {headers: {'x-fields': 'id, name'}},
      }).then((response: AxiosResponse<ConfigTemplate[]>) => {
        this.configTemplatesNames = _.sortBy(_.map(response.data, (entity) => {
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
  },
  async created() {
    await this.branchesStore.list
    this.loadCertificates()
  },
})
</script>
