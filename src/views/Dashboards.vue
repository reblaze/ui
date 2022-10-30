<template>
  <div class="card-content">
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
              <Datepicker v-model="date"
                          range
                          utc
                          enableSeconds
                          format="yyyy-MM-dd HH:mm"
                          inputClassName="input is-small is-size-7 width-260px date-picker-input"
                          :monthChangeOnScroll="false"
                          :clearable="false"
                          :presetRanges="presetRanges"
                          @open="loadPresetRanges">
              </Datepicker>
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
      <div v-if="!data?.length"
           class="has-text-centered is-fullwidth">
        <div v-if="isSearchLoading">
          <button class="button is-outlined is-text is-small is-loading dashboard-loading">
            Loading
          </button>
        </div>
        <div v-else>
          Your search did not match any data
        </div>
      </div>
      <div v-show="dashboards[activeDashboardIndex]?.useDashboard === 'default' && data?.length">
        <rbz-dashboard-default :data="data"
                               :loading="isSearchLoading">
        </rbz-dashboard-default>
      </div>
      <div v-show="dashboards[activeDashboardIndex]?.useDashboard === 'threats' && data?.length">
      </div>
    </div>
    <div v-if="dashboards[activeDashboardIndex]?.metabaseId">
      <iframe :src="getDashboardURL(dashboards[activeDashboardIndex].metabaseId)"
              width="100%"
              height="600"
              allowtransparency>
      </iframe>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue'
import RequestsUtils from '@/assets/RequestsUtils'
import RbzDashboardDefault from '@/reblaze-dashboards/DefaultDashboard.vue'
import Datepicker from '@vuepic/vue-datepicker'
import {GenericObject} from '@/types'

const jwt = require('jsonwebtoken')
const MS_PER_MINUTE = 60000
const HOUR = 60 * MS_PER_MINUTE

type DashboardData = {
  title: string
  metabaseId?: number
  useDashboard?: string
}

export default defineComponent({
  name: 'DashboardDisplay',
  components: {RbzDashboardDefault, Datepicker},
  data() {
    const defaultMetabaseURL = 'http://localhost:3000'
    const now = new Date()
    return {
      defaultMetabaseURL: defaultMetabaseURL,
      metabaseURL: defaultMetabaseURL,
      dashboards: [] as DashboardData[],
      metabaseKey: '',
      activeDashboardIndex: -1,
      data: [],
      searchFilter: '',
      date: [new Date(now.getTime() - (HOUR / 2)).toISOString(), now.toISOString()],
      presetRanges: [],
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
      this.metabaseURL = dashboardsInfo.metabaseURL || this.defaultMetabaseURL
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
        url: `metrics/1s?filters=${query}`,
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
    },

    loadPresetRanges() {
      const now = new Date()
      this.presetRanges = [
        {
          label: 'Last 30 Minutes',
          range: [new Date(now.getTime() - (HOUR / 2)), now],
        },
        {
          label: 'Last Hour',
          range: [new Date(now.getTime() - HOUR), now],
        },
        {
          label: 'Last 2 Hours',
          range: [new Date(now.getTime() - (2 * HOUR)), now],
        },
        {
          label: 'Last 3 Hours',
          range: [new Date(now.getTime() - (3 * HOUR)), now],
        },
        {
          label: 'Last 4 Hours',
          range: [new Date(now.getTime() - (4 * HOUR)), now],
        },
        {
          label: 'Last 12 Hours',
          range: [new Date(now.getTime() - (12 * HOUR)), now],
        },
        {
          label: 'Last 24 Hours',
          range: [new Date(now.getTime() - (24 * HOUR)), now],
        },
      ]
    },
  },
  async mounted() {
    await this.loadConfigurationFromDB()
    await this.loadData()
  },
})
</script>
<style lang="scss">
@import 'node_modules/@vuepic/vue-datepicker/src/VueDatePicker/style/main';

.search-wrapper {
  /* Magic number 450x - width of datepicker, search, and clear buttons */
  width: calc(100% - 450px);
}

.date-picker-input {
  padding-left: 33px;
}
</style>
