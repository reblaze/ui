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
          <div class="field is-grouped">
            <div class="control search-wrapper">
              <input class="input is-small is-fullwidth filter-input"
                     placeholder="Filters, comma separated. Available filters: `proxy`, `appid`, and `profile`."
                     v-model="searchFilter"/>
            </div>
            <p class="control">
              <rbz-date-picker @update:date="date = $event"
                               ref="rbzDatePicker" />
            </p>
            <p class="control">
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
            <p class="control">
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
import {GenericObject} from '@/types'
import RbzDatePicker from '@/components/RbzDatePicker.vue'

const jwt = require('jsonwebtoken')

type DashboardData = {
  title: string
  metabaseId?: number
  useDashboard?: string
}

export default defineComponent({
  name: 'DashboardDisplay',
  components: {
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
      searchFilter: '',
      date: [null, null],
      isSearchLoading: false,
    }
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
        ] as GenericObject[],
      } as GenericObject
      const filters = this.searchFilter ? this.searchFilter.split(',') : []
      filters.forEach((filter) => {
        filter = filter.trim()
        const splitFilter = filter.split(/:/)
        const operator = splitFilter.shift()
        const operand = splitFilter.join(':')
        const filterObject = {} as GenericObject
        filterObject[operator] = {
          '$regex': operand,
        }
        queryJson['$and'].push(filterObject)
      })
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
      this.searchFilter = ''
      this.$refs.rbzDatePicker.resetDateToDefault()
    },
  },
  async mounted() {
    await this.loadConfigurationFromDB()
    await this.loadData()
  },
})
</script>
<style scoped
       lang="scss">
.search-wrapper {
  /* Magic number 450x - width of datepicker, search, and clear buttons */
  width: calc(100% - 450px);
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
