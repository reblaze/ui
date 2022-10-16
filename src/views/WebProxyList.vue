<template>
  <div class="card">
    <div class="card-content">
      <div class="media">
        <div class="media-content">
          <div class="field is-grouped">
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
      </div>

      <hr/>

      <div class="content document-list-wrapper"
           v-show="!loadingDocCounter && selectedBranch">
        <div class="card">
          <div class="card-content">
            <div class="content">
              <rbz-table :columns="columns"
                         :data="sites"
                         :show-menu-column="true"
                         :show-filter-button="true"
                         :show-new-button="true"
                         @new-button-clicked="addNewSite"
                         :show-edit-button="true"
                         @edit-button-clicked="editSite">
              </rbz-table>
              <span class="is-family-monospace has-text-grey-lighter">
                {{ documentListAPIPath }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="content no-data-wrapper"
           v-if="loadingDocCounter || !selectedBranch">
        <button class="button is-outlined is-text is-small is-loading document-loading">
          Loading
        </button>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import _ from 'lodash'
import {defineComponent} from 'vue'
import RbzTable from '@/components/RbzTable.vue'
import {ColumnOptions, MobileSDK, ProxyTemplate, RoutingProfile, SecurityPolicy, Site} from '@/types'
import DatasetsUtils from '@/assets/DatasetsUtils'
import RequestsUtils from '@/assets/RequestsUtils'
import Utils from '@/assets/Utils'
import {AxiosResponse} from 'axios'

export default defineComponent({
  name: 'WebProxyList',
  components: {
    RbzTable,
  },
  data() {
    return {
      columns: [
        {
          title: 'Name',
          fieldNames: ['name'],
          isSortable: true,
          isSearchable: true,
          classes: 'width-120px',
        },
        {
          title: 'Description',
          fieldNames: ['description'],
          isSortable: true,
          isSearchable: true,
          classes: 'ellipsis',
        },
        {
          title: 'Security Policy',
          fieldNames: ['security_policy'],
          displayFunction: (item: Site) => {
            const securityPolicy = _.find(this.securityPoliciesNames, (securityPolicy) => {
              return securityPolicy[0] === item.security_policy
            })
            return securityPolicy?.[1] || ''
          },
          isSortable: true,
          isSearchable: true,
          classes: 'width-120px ellipsis',
        },
        {
          title: 'Routing Profile',
          fieldNames: ['routing_profile'],
          displayFunction: (item: Site) => {
            const routingProfile = _.find(this.routingProfilesNames, (routingProfile) => {
              return routingProfile[0] === item.routing_profile
            })
            return routingProfile?.[1] || ''
          },
          isSortable: true,
          isSearchable: true,
          classes: 'width-120px ellipsis',
        },
        {
          title: 'Proxy Template',
          fieldNames: ['proxy_template'],
          displayFunction: (item: Site) => {
            const proxyTemplate = _.find(this.proxyTemplatesNames, (proxyTemplate) => {
              return proxyTemplate[0] === item.proxy_template
            })
            return proxyTemplate?.[1] || ''
          },
          isSortable: true,
          isSearchable: true,
          classes: 'width-120px ellipsis',
        },
        {
          title: 'Mobile SDK',
          fieldNames: ['mobile_sdk'],
          displayFunction: (item: Site) => {
            const mobileSDK = _.find(this.mobileSDKsNames, (mobileSDK) => {
              return mobileSDK[0] === item.mobile_sdk
            })
            return mobileSDK?.[1] || ''
          },
          isSortable: true,
          isSearchable: true,
          classes: 'width-120px ellipsis',
        },
      ] as ColumnOptions[],
      isNewLoading: false,
      titles: DatasetsUtils.titles,
      sites: [],
      selectedBranch: null,
      configs: [],
      loadingDocCounter: 0,
      isDownloadLoading: false,
      securityPoliciesNames: [] as [SecurityPolicy['id'], SecurityPolicy['name']][],
      routingProfilesNames: [] as [RoutingProfile['id'], RoutingProfile['name']][],
      proxyTemplatesNames: [] as [ProxyTemplate['id'], ProxyTemplate['name']][],
      mobileSDKsNames: [] as [MobileSDK['id'], MobileSDK['name']][],
      apiRoot: RequestsUtils.reblazeAPIRoot,
      apiVersion: RequestsUtils.reblazeAPIVersion,
    }
  },

  computed: {
    documentListAPIPath(): string {
      const apiPrefix = `${this.apiRoot}/${this.apiVersion}`
      return `${apiPrefix}/reblaze/configs/${this.selectedBranch}/d/sites/`
    },

    branchNames(): string[] {
      return this.configs?.length ? _.sortBy(_.map(this.configs, 'id')) : []
    },
  },

  methods: {
    setLoadingDocStatus(isLoading: boolean) {
      if (isLoading) {
        this.loadingDocCounter++
      } else {
        this.loadingDocCounter--
      }
    },

    newSite(): Site {
      const factory = DatasetsUtils.newOperationEntryFactory['sites']
      return factory && factory()
    },

    editSite(id: string) {
      const routeToEditSite = `/web-proxy/config/${id}`
      this.$router.push(routeToEditSite)
    },

    async addNewSite() {
      this.isNewLoading = true
      const siteToAdd = this.newSite()
      const siteText = this.titles['sites-singular']
      const successMessage = `New ${siteText} was created.`
      const failureMessage = `Failed while attempting to create the new ${siteText}.`
      const url = `configs/${this.selectedBranch}/d/sites/e/${siteToAdd.id}`
      const data = siteToAdd
      await RequestsUtils.sendReblazeRequest({methodName: 'POST', url, data, successMessage, failureMessage})
      this.editSite(siteToAdd.id)
      this.isNewLoading = false
    },

    downloadDoc() {
      if (!this.isDownloadLoading) {
        Utils.downloadFile('sites', 'json', this.sites)
      }
    },

    async loadSites() {
      const url = `configs/${this.selectedBranch}/d/sites/`
      const response = await RequestsUtils.sendReblazeRequest({methodName: 'GET', url})
      this.sites = response?.data
    },

    async loadConfigs() {
      let configs
      try {
        const response = await RequestsUtils.sendRequest({methodName: 'GET', url: 'configs/'})
        configs = response.data
      } catch (err) {
        console.log('Error while attempting to get configs')
        console.log(err)
      }
      console.log('loaded configs: ', configs)
      this.configs = configs
      this.selectedBranch = this.branchNames[0]
    },

    async switchBranch() {
      this.setLoadingDocStatus(true)
      Utils.toast(`Switched to branch '${this.selectedBranch}'.`, 'is-info')
      await this.loadSites()
      this.setLoadingDocStatus(false)
    },

    loadSecurityPolicies() {
      RequestsUtils.sendRequest({
        methodName: 'GET',
        url: `configs/${this.selectedBranch}/d/securitypolicies/`,
        config: {headers: {'x-fields': 'id, name'}},
      }).then((response: AxiosResponse<SecurityPolicy[]>) => {
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
        config: {headers: {'x-fields': 'id, name'}},
      }).then((response: AxiosResponse<RoutingProfile[]>) => {
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
  },
  async created() {
    await this.loadConfigs()
    this.loadSites()
    this.loadSecurityPolicies()
    this.loadRoutingProfiles()
    this.loadProxyTemplates()
    this.loadMobileSDKs()
  },
})
</script>
