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
                          :disabled="selectedWebProxy?.id === '__default__'"
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
               v-if="selectedWebProxy">
            <div class="columns columns-divided">
              <div class="column is-4">
                <div class="field">
                  <label class="label is-small">
                    Name
                    <span class="has-text-grey is-pulled-right document-id"
                          title="Rule id">
                      {{ selectedWebProxy.id }}
                    </span>
                  </label>
                  <div class="control">
                    <input class="input is-small document-name"
                           title="Document name"
                           placeholder="Document name"
                           v-model="selectedWebProxy.name"/>
                  </div>
                </div>
                <div class="field">
                  <div class="field textarea-field">
                    <label class="label is-small">Description</label>
                    <div class="control">
                      <textarea class="is-small textarea document-description"
                                data-qa="description-input"
                                title="Document description"
                                v-model="selectedWebProxy.description"
                                rows="5">
                      </textarea>
                    </div>
                  </div>
                </div>
              </div>
              <div class="column is-4">
                <div class="field">
                  <label class="label is-small">
                    Domain Name
                  </label>
                  <div class="control">
                    <input class="input is-small domain-name"
                           title="Domain name"
                           placeholder="Domain name"
                           v-model="selectedWebProxy.canonical_name"/>
                  </div>
                </div>
                <div class="field">
                  <label class="label is-small">Additional Domain Names</label>
                  <div class="control">
                    <textarea
                        class="textarea is-small additional-domain-names"
                        placeholder="Additional domain names"
                        v-model="serverNames">
                    </textarea>
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
                      <select v-model="selectedWebProxy.routing_profile"
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
                          Cloud Functions
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
                          {{ referencedDocName(this.backendServicesNames, location.backend_id) }}
                        </td>
                        <td>
                          <span v-for="cloudFunction in location.cloud_functions"
                                :key="cloudFunction">
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
                      <select v-model="selectedWebProxy.security_policy"
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
                      <select v-model="selectedWebProxy.mobile_sdk"
                              data-qa="mobile-sdk-dropdown"
                              class="document-mobile-sdk-selection"
                              title="Mobile SDK">
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
                      <select v-model="selectedWebProxy.proxy_template"
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
import {
  ACLProfile,
  BackendService,
  ContentFilterProfile,
  MobileSDK,
  ProxyTemplate,
  RoutingProfile,
  SecurityPolicy,
  Site,
} from '@/types'
import Utils from '@/assets/Utils'
import {defineComponent} from 'vue'
import DatasetsUtils from '@/assets/DatasetsUtils'
import {AxiosResponse} from 'axios'

export default defineComponent({
  name: 'WebProxyEditor',
  data() {
    return {
      titles: DatasetsUtils.titles,
      configs: [],
      selectedBranch: null,
      selectedWebProxy: null as Site,
      docIdFromRoute: '',

      // Loading indicators
      loadingDocCounter: 0,
      isSaveLoading: false,
      isDeleteLoading: false,
      isDownloadLoading: false,

      // Referenced docs
      securityPolicies: [] as SecurityPolicy[],
      securityPoliciesNames: [] as [SecurityPolicy['id'], SecurityPolicy['name']][],
      routingProfiles: [] as RoutingProfile[],
      routingProfilesNames: [] as [RoutingProfile['id'], RoutingProfile['name']][],
      proxyTemplatesNames: [] as [ProxyTemplate['id'], ProxyTemplate['name']][],
      mobileSDKsNames: [] as [MobileSDK['id'], MobileSDK['name']][],
      backendServicesNames: [] as [BackendService['id'], BackendService['name']][],
      contentFilterProfilesNames: [] as [ContentFilterProfile['id'], ContentFilterProfile['name']][],
      aclProfilesNames: [] as [ACLProfile['id'], ACLProfile['name']][],

      apiRoot: RequestsUtils.reblazeAPIRoot,
      apiVersion: RequestsUtils.reblazeAPIVersion,
    }
  },
  computed: {
    documentAPIPath(): string {
      const apiPrefix = `${this.apiRoot}/${this.apiVersion}`
      return `${apiPrefix}/reblaze/configs/${this.selectedBranch}/d/sites/e/${this.selectedWebProxy.id}/`
    },

    branchNames() {
      return this.configs?.length ? _.sortBy(_.map(this.configs, 'id')) : []
    },

    selectedSecurityPolicy(): SecurityPolicy {
      return this.securityPolicies.find((securityPolicy) => {
        return securityPolicy.id === this.selectedWebProxy.security_policy
      })
    },

    selectedRoutingProfile(): RoutingProfile {
      return this.routingProfiles.find((routingProfile) => {
        return routingProfile.id === this.selectedWebProxy.routing_profile
      })
    },

    serverNames: {
      get() {
        return Array.from(this.selectedWebProxy.server_names || '').join('\n')
      },
      set(newValue: string) {
        const value = newValue.replaceAll(' ', '')
        this.selectedWebProxy.server_names = value.split('\n')
      },
    },
  },
  methods: {
    async setSelectedDataFromRouteParams() {
      this.setLoadingDocStatus(true)
      this.docIdFromRoute = this.$route.params.doc_id.toString()
      await this.loadWebProxy()
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
      this.$router.push(`/web-proxy/list`)
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
      await this.loadWebProxy()
      this.setLoadingDocStatus(false)
    },

    downloadDoc() {
      if (!this.isDownloadLoading) {
        Utils.downloadFile('web-proxy', 'json', this.selectedWebProxy)
      }
    },

    async deleteDoc() {
      this.setLoadingDocStatus(true)
      this.isDeleteLoading = true
      const webProxyText = this.titles['sites-singular']
      const url = `configs/${this.selectedBranch}/d/sites/e/${this.selectedWebProxy.id}/`
      const successMessage = `The ${webProxyText} was deleted.`
      const failureMessage = `Failed while attempting to delete the ${webProxyText}.`
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
      const url = `configs/${this.selectedBranch}/d/sites/e/${this.selectedWebProxy.id}/`
      const data = this.selectedWebProxy
      const webProxyText = this.titles['sites-singular']
      const successMessage = `Changes to the ${webProxyText} were saved.`
      const failureMessage = `Failed while attempting to save the changes to the ${webProxyText}.`
      await RequestsUtils.sendReblazeRequest({methodName, url, data, successMessage, failureMessage})
      this.isSaveLoading = false
    },

    async loadWebProxy() {
      this.isDownloadLoading = true
      const response = await RequestsUtils.sendReblazeRequest({
        methodName: 'GET',
        url: `configs/${this.selectedBranch}/d/sites/e/${this.docIdFromRoute}`,
        onFail: () => {
          console.log('Error while attempting to load the Web Proxy')
          this.selectedWebProxy = null
          this.isDownloadLoading = false
        },
      })
      this.selectedWebProxy = response?.data || {}
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
  },
  async created() {
    await this.loadConfigs()
    this.setSelectedDataFromRouteParams()
    this.loadSecurityPolicies()
    this.loadRoutingProfiles()
    this.loadProxyTemplates()
    this.loadMobileSDKs()
    this.loadBackendServices()
    this.loadContentFilterProfiles()
    this.loadACLProfiles()
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
</style>
