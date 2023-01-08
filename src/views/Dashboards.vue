<template>
  <div class="card-content is-fullheight">
    <div class="tabs-wrapper mb-5">
      <div class="tabs"
           data-qa="dashboard-tabs">
        <ul>
          <li v-for="(dashboard, index) in dashboards"
              :key="index"
              :class="{'is-active': index === activeDashboardIndex}"
              @click="activeDashboardIndex = index"
              :data-qa="`dashboard-tab-${index}`">
            <a>
              {{ dashboard.title }}
            </a>
          </li>
        </ul>
      </div>
    </div>
    <div v-show="dashboards[activeDashboardIndex]?.useDashboard">
      <div class="media mb-5">
        <div class="media-content">
          <div class="search-wrapper is-flex is-justify-content-space-between">
            <div class="control is-flex-grow-1">
              <Multiselect v-model="securityPolicyFilter"
                           ref="securityPolicyMultiselect"
                           class="security-policy-multiselect"
                           mode="multiple"
                           :options="securityPoliciesOptions"
                           :groups="true"
                           group-label="securityPolicy"
                           group-options="securityPolicyEntries"
                           value-prop="value"
                           label="name"
                           :searchable="true"
                           track-by="searchValue"
                           placeholder="Filter By Security Policy"
                           :close-on-select="false"
                           :clear-on-select="false"
                           :hide-selected="false">
                <template #beforelist>
                  <div class="multiselect-select-all-group-label"
                       @click="selectAllSecurityPolicies">
                    <span>Select All</span>
                  </div>
                </template>
              </Multiselect>
            </div>
            <div class="control has-icons-left width-250px">
              <input class="input is-small proxy-filter-input"
                     placeholder="Filter By Pod"
                     v-model="proxyFilter"/>
              <span class="icon is-small is-left has-text-grey">
                <i class="fas fa-code"></i>
              </span>
            </div>
            <p class="control width-250px">
              <rbz-date-picker @update:date="date = $event"
                               ref="rbzDatePicker"/>
            </p>
            <p class="control width-80px">
              <button class="button is-small search-button"
                      :class="{'is-loading': isSearchLoading}"
                      @click="loadData()"
                      title="Search"
                      data-qa="search-button">
              <span class="icon is-small">
                <i class="fas fa-search"></i>
              </span>
                <span>
                Search
              </span>
              </button>
            </p>
            <p class="control width-80px">
              <button class="button is-small clear-search-button"
                      @click="clearSearch()"
                      title="Clear filter"
                      data-qa="clear-search-button">
              <span class="icon is-small">
                <i class="fas fa-times"></i>
              </span>
                <span>
                Clear
              </span>
              </button>
            </p>
          </div>
        </div>
      </div>
      <div v-show="dashboards[activeDashboardIndex]?.useDashboard === 'default'">
        <rbz-dashboard-default :data="data"
                               :loading="isSearchLoading">
        </rbz-dashboard-default>
      </div>
      <div v-show="dashboards[activeDashboardIndex]?.useDashboard === 'threats'">
      </div>
    </div>
    <div v-if="dashboards[activeDashboardIndex]?.metabaseId"
         class="metabase-iframe-wrapper">
      <iframe :src="getDashboardURL(dashboards[activeDashboardIndex].metabaseId)"
              class="metabase-iframe is-fullheight is-fullwidth"
              width="100%"
              height="100%"
              allowtransparency>
      </iframe>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue'
import RequestsUtils from '@/assets/RequestsUtils'
import RbzDashboardDefault from '@/reblaze-dashboards/DefaultDashboard.vue'
import {GenericObject, SecurityPolicy, SecurityPolicyEntryMatch} from '@/types'
import RbzDatePicker from '@/components/RbzDatePicker.vue'
import Multiselect from '@vueform/multiselect'
import '@vueform/multiselect/themes/default.css'
import _ from 'lodash'
import {mapStores} from 'pinia'
import {useBranchesStore} from '@/stores/BranchesStore'

const jwt = require('jsonwebtoken')

type DashboardData = {
  title: string
  metabaseId?: number
  useDashboard?: string
}

type SecurityPolicyEntryOption = {
  name: string
  searchValue: string
  value: {
    securityPolicyID: string
    securityPolicyEntryID: string
  }
}

type SecurityPolicyOption = {
  securityPolicy: string
  id: string
  securityPolicyEntries: SecurityPolicyEntryOption[]
}

export default defineComponent({
  name: 'DashboardDisplay',
  components: {
    Multiselect,
    RbzDashboardDefault,
    RbzDatePicker,
  },
  data() {
    const defaultMetabaseURL = 'http://localhost:3000'
    return {
      defaultMetabaseURL: defaultMetabaseURL,
      metabaseURL: defaultMetabaseURL,
      dashboards: [] as DashboardData[],
      metabaseKey: '',
      activeDashboardIndex: -1,
      data: [],
      proxyFilter: '',
      securityPolicyFilter: [] as SecurityPolicyEntryOption['value'][],
      date: [null, null],
      isSearchLoading: false,
      securityPoliciesOptions: [] as SecurityPolicyOption[],
    }
  },
  computed: {
    selectedBranch(): string {
      return this.branchesStore.selectedBranchId
    },

    ...mapStores(useBranchesStore),
  },
  methods: {
    async loadConfigurationFromDB() {
      const response = await RequestsUtils.sendRequest({
        methodName: 'GET',
        url: `db/system/`,
      })
      const systemDBData = response?.data
      const dashboardsInfo = systemDBData?.dashboardsinfo
      this.metabaseURL = dashboardsInfo?.metabaseURL || this.defaultMetabaseURL
      this.metabaseKey = dashboardsInfo?.metabaseKey || ''
      if (dashboardsInfo?.dashboards?.length) {
        this.dashboards = dashboardsInfo.dashboards
        this.activeDashboardIndex = 0
      }
    },

    async loadSecurityPolicies() {
      const response = await RequestsUtils.sendRequest({
        methodName: 'GET',
        url: `configs/${this.selectedBranch}/d/securitypolicies/`,
        config: {headers: {'x-fields': 'id, name, map'}},
      })
      if (response.data) {
        const securityPoliciesOptions: SecurityPolicyOption[] = []
        _.forEach(response.data, (securityPolicy: SecurityPolicy) => {
          const securityPolicyEntriesOptions: SecurityPolicyEntryOption[] = []
          _.forEach(securityPolicy.map, (mapEntry: SecurityPolicyEntryMatch) => {
            const securityPolicyEntriesOption: SecurityPolicyEntryOption = {
              name: mapEntry.name,
              searchValue: `${securityPolicy.name} ${mapEntry.name}`,
              value: {
                securityPolicyID: securityPolicy.id,
                securityPolicyEntryID: mapEntry.id,
              },
            }
            securityPolicyEntriesOptions.push(securityPolicyEntriesOption)
          })
          const securityPoliciesOption: SecurityPolicyOption = {
            securityPolicy: securityPolicy.name,
            id: securityPolicy.id,
            securityPolicyEntries: securityPolicyEntriesOptions,
          }
          securityPoliciesOptions.push(securityPoliciesOption)
        })
        this.securityPoliciesOptions = securityPoliciesOptions
      }
    },

    selectAllSecurityPolicies() {
      this.$refs.securityPolicyMultiselect.clear()
      this.$refs.securityPolicyMultiselect.selectAll()
    },

    buildQuery() {
      const startDate = this.date[0]
      const endDate = this.date[1]
      const queryJson = {
        '$and': [
          {
            'timestamp': {
              '$gt': startDate,
              '$lt': endDate,
            },
          },
          {
            'branch': this.selectedBranch,
          },
        ] as GenericObject[],
      } as GenericObject
      if (this.proxyFilter) {
        queryJson['$and'].push({
          'proxy': {
            '$regex': this.proxyFilter,
          },
        })
      }
      if (this.securityPolicyFilter.length) {
        const securityPoliciesFilter = {
          '$or': [] as GenericObject[],
        }
        this.securityPolicyFilter.forEach((filter: SecurityPolicyEntryOption['value']) => {
          const securityPolicyID = filter.securityPolicyID
          const securityPolicyEntryID = filter.securityPolicyEntryID
          const filterObject = {
            '$and': [
              {
                'secpolid': securityPolicyID,
                'secpolentryid': securityPolicyEntryID,
              },
            ],
          } as GenericObject
          securityPoliciesFilter['$or'].push(filterObject)
        })
        queryJson['$and'].push(securityPoliciesFilter)
      }
      return JSON.stringify(queryJson)
    },

    async loadData() {
      this.isSearchLoading = true
      const query = this.buildQuery()
      const response = await RequestsUtils.sendDataLayerRequest({
        methodName: 'GET',
        url: `metrics/1m?filters=${query}`,
        config: {
          headers: {
            'syntax': 'mongodb',
            'provider': 'mongodb',
            'Content-Type': 'application/json',
          },
        },
      })
      this.data = response?.data?.data?.results || []
      this.isSearchLoading = false
    },

    getDashboardURL(metabaseId: number) {
      const payload = {
        resource: {dashboard: metabaseId},
        params: {},
        exp: Math.round(Date.now() / 1000) + (10 * 60), // 10 minute expiration
      }
      const token = jwt.sign(payload, this.metabaseKey)
      return `${this.metabaseURL}/embed/dashboard/${token}#theme=transparent&bordered=false&titled=true`
    },

    clearSearch() {
      this.proxyFilter = ''
      this.securityPolicyFilter = []
      this.$refs.rbzDatePicker.resetDateToDefault()
    },
  },
  async mounted() {
    await this.loadConfigurationFromDB()
    await this.loadSecurityPolicies()
    await this.loadData()
  },
})
</script>
<style scoped
       lang="scss">
@import 'src/assets/styles/colors';

.search-wrapper {
  gap: 1rem;
}

.security-policy-multiselect {
  --ms-font-size: 0.75rem;
  --ms-option-font-size: 0.75rem;
  --ms-option-line-height: 0.75rem;
  --ms-radius: 2px;
  min-height: 30px;

  &.is-active {
    border-color: $color-royal-blue;
    box-shadow: 0 0 0 0.125em rgb(50 115 220 / 25%);
  }

  :deep(.multiselect-wrapper) {
    min-height: 30px;
  }

  :deep(.multiselect-dropdown) {
    z-index: 1000;
  }

  :deep(.multiselect-group-label) {
    font-size: 0.75rem;
    line-height: 0.75rem;
  }

  .multiselect-select-all-group-label {
    background: $color-wild-sand;
    color: $color-oxford-blue;
    cursor: pointer;
    font-weight: 600;
    padding: 0.3rem 0.75rem;
  }

  .multiselect-select-all-group-label:hover {
    background: $color-mercury;
  }
}

.metabase-iframe-wrapper {
  height: calc(100% - 50px);
  margin: 0;
  overflow: hidden;
  padding: 0;
}

.metabase-iframe {
  overflow: hidden;
}
</style>
