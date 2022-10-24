<template>
  <div class="card-content">
    <div class="media">
      <div class="media-content">
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
                       :row-clickable="true"
                       @row-clicked="editSite"
                       :show-row-button="true"
                       @row-button-clicked="editSite">
            </rbz-table>
            <span class="is-family-monospace has-text-grey-lighter is-inline-block mt-3">
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
</template>
<script lang="ts">
import _ from 'lodash'
import {defineComponent} from 'vue'
import RbzTable from '@/components/RbzTable.vue'
import {ColumnOptions, MobileSDK, ConfigTemplate, RoutingProfile, SecurityPolicy, Site} from '@/types'
import DatasetsUtils from '@/assets/DatasetsUtils'
import RequestsUtils from '@/assets/RequestsUtils'
import Utils from '@/assets/Utils'
import {AxiosResponse} from 'axios'
import {mapStores} from 'pinia'
import {useBranchesStore} from '@/stores/BranchesStore'

export default defineComponent({
  name: 'ServerGroupsList',
  components: {
    RbzTable,
  },
  data() {
    return {
      columns: [
        {
          title: 'ID',
          fieldNames: ['id'],
          isSortable: true,
          isSearchable: true,
          classes: 'width-120px',
        },
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
          title: 'Config Template',
          fieldNames: ['proxy_template'],
          displayFunction: (item: Site) => {
            const configTemplate = _.find(this.configTemplatesNames, (configTemplate) => {
              return configTemplate[0] === item.proxy_template
            })
            return configTemplate?.[1] || ''
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
      loadingDocCounter: 0,
      isDownloadLoading: false,
      securityPoliciesNames: [] as [SecurityPolicy['id'], SecurityPolicy['name']][],
      routingProfilesNames: [] as [RoutingProfile['id'], RoutingProfile['name']][],
      configTemplatesNames: [] as [ConfigTemplate['id'], ConfigTemplate['name']][],
      mobileSDKsNames: [] as [MobileSDK['id'], MobileSDK['name']][],
      apiRoot: RequestsUtils.reblazeAPIRoot,
      apiVersion: RequestsUtils.reblazeAPIVersion,
    }
  },

  watch: {
    selectedBranch: {
      handler: function(val, oldVal) {
        if ((this.$route.name as string).includes('ServerGroups/list') && val && val !== oldVal) {
          this.loadSites()
          this.loadSecurityPolicies()
          this.loadRoutingProfiles()
          this.loadConfigTemplates()
          this.loadMobileSDKs()
        }
      },
      immediate: true,
    },
  },

  computed: {
    documentListAPIPath(): string {
      const apiPrefix = `${this.apiRoot}/${this.apiVersion}`
      return `${apiPrefix}/reblaze/configs/${this.selectedBranch}/d/sites/`
    },

    selectedBranch(): string {
      return this.branchesStore.selectedBranchId
    },

    ...mapStores(useBranchesStore),
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
      this.$router.push(`/${this.selectedBranch}/server-groups/config/${id}`)
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
  },
  async created() {
    await this.branchesStore.list
  },
})
</script>
