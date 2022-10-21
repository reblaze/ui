<template>
  <div class="card">
    <div class="card-content">
      <div class="media">
        <div class="media-content">
          <div class="columns">
            <div class="column">
              <input class="input is-small is-fullwidth filter-input"
                     placeholder="Filters, comma separated. Available filters: `proxy`, `appid`, and `profile`."
                     v-model="searchFilter"/>
            </div>
            <div class="column is-narrow">
              <div class="field is-grouped is-pulled-right">
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
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <hr/>

      <div class="media">
        <div class="media-content">
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
      </div>
      <div v-show="dashboards[activeDashboardIndex]?.useDashboard === 'default'">
        <rbz-dashboard-default :data="data">
        </rbz-dashboard-default>
      </div>
      <div v-show="dashboards[activeDashboardIndex]?.useDashboard === 'threats'">
      </div>
      <div v-if="dashboards[activeDashboardIndex]?.metabaseId">
<!--        <iframe :src="getDashboardURL(dashboards[activeDashboardIndex]?.metabaseId)"-->
<!--                width="100%"-->
<!--                height="600"-->
<!--                allowtransparency>-->
<!--        </iframe>-->
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue'
import RequestsUtils from '@/assets/RequestsUtils'
import RbzDashboardDefault from '@/reblaze-dashboards/DefaultDashboard.vue'
import Datepicker from '@vuepic/vue-datepicker'
import {GenericObject} from '@/types'
import '@vuepic/vue-datepicker/dist/main.css'

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
      this.metabaseURL = systemDBData?.links?.metabase_url || this.defaultMetabaseURL
      this.dashboards = systemDBData?.dashboards || []
      if (this.dashboards.length) {
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
            'flavor': 'mongodb',
            'Content-Type': 'application/json',
          },
        },
      })
      this.data = response?.data || []
      this.isSearchLoading = false
      this.data = [
        {
          'counters': {
            'blocks': 0,
            'bot': 7,
            'cf_risk_level_active': [],
            'cf_risk_level_report': [],
            'cf_section_active': {
              'args': 0,
              'attrs': 0,
              'body': 0,
              'headers': 0,
              'uri': 0,
            },
            'cf_section_report': {
              'args': 0,
              'attrs': 0,
              'body': 0,
              'headers': 0,
              'uri': 0,
            },
            'cf_top_aclid_active': [],
            'cf_top_aclid_report': [],
            'cf_top_ruleid_active': [],
            'cf_top_ruleid_report': [],
            'cf_top_secpolentryid_active': [],
            'cf_top_secpolentryid_report': [
              {
                'key': '__default__',
                'value': 7,
              },
            ],
            'cf_top_secpolid_active': [],
            'cf_top_secpolid_report': [
              {
                'key': '__default__',
                'value': 7,
              },
            ],
            'challenge': 0,
            'hits': 7,
            'human': 0,
            'methods': [
              {
                'key': 'GET',
                'value': 3,
              },
              {
                'key': 'PUT',
                'value': 3,
              },
              {
                'key': 'DELETE',
                'value': 1,
              },
            ],
            'processing_time': {
              'average': 1551.2857142857142,
              'max': 1947,
              'min': 1365,
            },
            'report': 7,
            'requests_triggered_acl_active': 0,
            'requests_triggered_acl_report': 0,
            'requests_triggered_cf_active': 0,
            'requests_triggered_cf_report': 0,
            'requests_triggered_globalfilter_active': 0,
            'requests_triggered_globalfilter_report': 4,
            'requests_triggered_ratelimit_active': 0,
            'requests_triggered_ratelimit_report': 0,
            'status': [
              {
                'key': '200',
                'value': 70,
              },
            ],
            'status_classes': [
              {
                'key': '2',
                'value': 7,
              },
            ],
            'top_blocked_asn': [],
            'top_blocked_country': [],
            'top_blocked_ip': [],
            'top_blocked_session': [],
            'top_blocked_uri': [],
            'top_blocked_user_agent': [],
            'top_ip_per_unique_uri': [
              {
                'key': '79.178.43.18',
                'value': 7,
              },
            ],
            'top_max_args_per_request': [
              {
                'key': '1',
                'value': 3,
              },
              {
                'key': '0',
                'value': 4,
              },
            ],
            'top_max_cookies_per_request': [
              {
                'key': '0',
                'value': 7,
              },
            ],
            'top_max_headers_per_request': [
              {
                'key': '5',
                'value': 3,
              },
              {
                'key': '3',
                'value': 4,
              },
            ],
            'top_passed_asn': [
              {
                'key': 8551,
                'value': 7,
              },
            ],
            'top_passed_country': [
              {
                'key': 'il',
                'value': 7,
              },
            ],
            'top_passed_ip': [
              {
                'key': '79.178.43.18',
                'value': 7,
              },
            ],
            'top_passed_session': [
              {
                'key': '4738982146e3c2cc8daf69b376c5205ac7fff610da023a6fd5e5b809',
                'value': 7,
              },
            ],
            'top_passed_uri': [
              {
                'key': '/delete/01/',
                'value': 1,
              },
              {
                'key': '/get/01/',
                'value': 1,
              },
              {
                'key': '/get/02/',
                'value': 1,
              },
              {
                'key': '/get/4661/',
                'value': 1,
              },
              {
                'key': '/put/01/',
                'value': 1,
              },
              {
                'key': '/put/02/',
                'value': 1,
              },
              {
                'key': '/put/8370/',
                'value': 1,
              },
            ],
            'top_passed_user_agent': [
              {
                'key': 'curl/7.79.1',
                'value': 7,
              },
            ],
            'top_request_per_args': [
              {
                'key': '0',
                'value': 4,
              },
              {
                'key': '1',
                'value': 3,
              },
            ],
            'top_request_per_cookies': [
              {
                'key': '0',
                'value': 7,
              },
            ],
            'top_request_per_headers': [
              {
                'key': '3',
                'value': 4,
              },
              {
                'key': '5',
                'value': 3,
              },
            ],
            'top_session_per_unique_uri': [
              {
                'key': '4738982146e3c2cc8daf69b376c5205ac7fff610da023a6fd5e5b809',
                'value': 7,
              },
            ],
            'top_tags': [
              {
                'key': 'api',
                'value': 4,
              },
            ],
            'top_uri_per_unique_ip': [
              {
                'key': '/put/8370/',
                'value': 1,
              },
              {
                'key': '/get/01/',
                'value': 1,
              },
              {
                'key': '/put/01/',
                'value': 1,
              },
              {
                'key': '/get/02/',
                'value': 1,
              },
              {
                'key': '/get/4661/',
                'value': 1,
              },
              {
                'key': '/put/02/',
                'value': 1,
              },
              {
                'key': '/delete/01/',
                'value': 1,
              },
            ],
            'top_uri_per_unique_session': [
              {
                'key': '/get/4661/',
                'value': 1,
              },
              {
                'key': '/put/01/',
                'value': 1,
              },
              {
                'key': '/put/02/',
                'value': 1,
              },
              {
                'key': '/get/01/',
                'value': 1,
              },
              {
                'key': '/get/02/',
                'value': 1,
              },
              {
                'key': '/delete/01/',
                'value': 1,
              },
              {
                'key': '/put/8370/',
                'value': 1,
              },
            ],
            'unique_asn': 1,
            'unique_blocked_asn': 0,
            'unique_blocked_country': 0,
            'unique_blocked_ip': 0,
            'unique_blocked_session': 0,
            'unique_blocked_uri': 0,
            'unique_blocked_user_agent': 0,
            'unique_country': 1,
            'unique_ip': 1,
            'unique_passed_asn': 1,
            'unique_passed_country': 1,
            'unique_passed_ip': 1,
            'unique_passed_session': 1,
            'unique_passed_uri': 7,
            'unique_passed_user_agent': 1,
            'unique_session': 1,
            'unique_uri': 7,
            'unique_user_agent': 1,
          },
          'proxy': 'curieproxyngx',
          'secpolentryid': '__default__',
          'secpolid': '__default__',
          'timestamp': '2022-10-21T13:53:39Z',
        },
        {
          'counters': {
            'blocks': 0,
            'bot': 6,
            'cf_risk_level_active': [],
            'cf_risk_level_report': [],
            'cf_section_active': {
              'args': 0,
              'attrs': 0,
              'body': 0,
              'headers': 0,
              'uri': 0,
            },
            'cf_section_report': {
              'args': 0,
              'attrs': 0,
              'body': 0,
              'headers': 0,
              'uri': 0,
            },
            'cf_top_aclid_active': [],
            'cf_top_aclid_report': [],
            'cf_top_ruleid_active': [],
            'cf_top_ruleid_report': [],
            'cf_top_secpolentryid_active': [],
            'cf_top_secpolentryid_report': [
              {
                'key': '__default__',
                'value': 6,
              },
            ],
            'cf_top_secpolid_active': [],
            'cf_top_secpolid_report': [
              {
                'key': '__default__',
                'value': 6,
              },
            ],
            'challenge': 0,
            'hits': 6,
            'human': 0,
            'methods': [
              {
                'key': 'POST',
                'value': 3,
              },
              {
                'key': 'DELETE',
                'value': 2,
              },
              {
                'key': 'PUT',
                'value': 1,
              },
            ],
            'processing_time': {
              'average': 1640.3333333333333,
              'max': 2254,
              'min': 1371,
            },
            'report': 6,
            'requests_triggered_acl_active': 0,
            'requests_triggered_acl_report': 0,
            'requests_triggered_cf_active': 0,
            'requests_triggered_cf_report': 0,
            'requests_triggered_globalfilter_active': 0,
            'requests_triggered_globalfilter_report': 6,
            'requests_triggered_ratelimit_active': 0,
            'requests_triggered_ratelimit_report': 0,
            'status': [
              {
                'key': '200',
                'value': 6,
              },
            ],
            'status_classes': [
              {
                'key': '2',
                'value': 6,
              },
            ],
            'top_blocked_asn': [],
            'top_blocked_country': [],
            'top_blocked_ip': [],
            'top_blocked_session': [],
            'top_blocked_uri': [],
            'top_blocked_user_agent': [],
            'top_ip_per_unique_uri': [
              {
                'key': '79.178.43.18',
                'value': 6,
              },
            ],
            'top_max_args_per_request': [
              {
                'key': '1',
                'value': 4,
              },
              {
                'key': '0',
                'value': 2,
              },
            ],
            'top_max_cookies_per_request': [
              {
                'key': '0',
                'value': 6,
              },
            ],
            'top_max_headers_per_request': [
              {
                'key': '5',
                'value': 4,
              },
              {
                'key': '3',
                'value': 2,
              },
            ],
            'top_passed_asn': [
              {
                'key': 8551,
                'value': 6,
              },
            ],
            'top_passed_country': [
              {
                'key': 'il',
                'value': 6,
              },
            ],
            'top_passed_ip': [
              {
                'key': '79.178.43.18',
                'value': 6,
              },
            ],
            'top_passed_session': [
              {
                'key': '4738982146e3c2cc8daf69b376c5205ac7fff610da023a6fd5e5b809',
                'value': 6,
              },
            ],
            'top_passed_uri': [
              {
                'key': '/delete/02/',
                'value': 1,
              },
              {
                'key': '/delete/25511/',
                'value': 1,
              },
              {
                'key': '/post/01/',
                'value': 1,
              },
              {
                'key': '/post/02/',
                'value': 1,
              },
              {
                'key': '/post/32153/',
                'value': 1,
              },
              {
                'key': '/put/01/',
                'value': 1,
              },
            ],
            'top_passed_user_agent': [
              {
                'key': 'curl/7.79.1',
                'value': 6,
              },
            ],
            'top_request_per_args': [
              {
                'key': '1',
                'value': 4,
              },
              {
                'key': '0',
                'value': 2,
              },
            ],
            'top_request_per_cookies': [
              {
                'key': '0',
                'value': 6,
              },
            ],
            'top_request_per_headers': [
              {
                'key': '5',
                'value': 4,
              },
              {
                'key': '3',
                'value': 2,
              },
            ],
            'top_session_per_unique_uri': [
              {
                'key': '4738982146e3c2cc8daf69b376c5205ac7fff610da023a6fd5e5b809',
                'value': 6,
              },
            ],
            'top_tags': [
              {
                'key': 'api',
                'value': 6,
              },
            ],
            'top_uri_per_unique_ip': [
              {
                'key': '/delete/25511/',
                'value': 1,
              },
              {
                'key': '/post/01/',
                'value': 1,
              },
              {
                'key': '/post/02/',
                'value': 1,
              },
              {
                'key': '/put/01/',
                'value': 1,
              },
              {
                'key': '/post/32153/',
                'value': 1,
              },
              {
                'key': '/delete/02/',
                'value': 1,
              },
            ],
            'top_uri_per_unique_session': [
              {
                'key': '/post/01/',
                'value': 1,
              },
              {
                'key': '/put/01/',
                'value': 1,
              },
              {
                'key': '/delete/02/',
                'value': 1,
              },
              {
                'key': '/post/02/',
                'value': 1,
              },
              {
                'key': '/delete/25511/',
                'value': 1,
              },
              {
                'key': '/post/32153/',
                'value': 1,
              },
            ],
            'unique_asn': 1,
            'unique_blocked_asn': 0,
            'unique_blocked_country': 0,
            'unique_blocked_ip': 0,
            'unique_blocked_session': 0,
            'unique_blocked_uri': 0,
            'unique_blocked_user_agent': 0,
            'unique_country': 1,
            'unique_ip': 1,
            'unique_passed_asn': 1,
            'unique_passed_country': 1,
            'unique_passed_ip': 1,
            'unique_passed_session': 1,
            'unique_passed_uri': 6,
            'unique_passed_user_agent': 1,
            'unique_session': 1,
            'unique_uri': 6,
            'unique_user_agent': 1,
          },
          'proxy': 'curieproxyngx',
          'secpolentryid': '__default__',
          'secpolid': '__default__',
          'timestamp': '2022-10-21T13:53:40Z',
        },
        {
          'counters': {
            'blocks': 0,
            'bot': 6,
            'cf_risk_level_active': [],
            'cf_risk_level_report': [],
            'cf_section_active': {
              'args': 0,
              'attrs': 0,
              'body': 0,
              'headers': 0,
              'uri': 0,
            },
            'cf_section_report': {
              'args': 0,
              'attrs': 0,
              'body': 0,
              'headers': 0,
              'uri': 0,
            },
            'cf_top_aclid_active': [],
            'cf_top_aclid_report': [],
            'cf_top_ruleid_active': [],
            'cf_top_ruleid_report': [],
            'cf_top_secpolentryid_active': [],
            'cf_top_secpolentryid_report': [
              {
                'key': '__default__',
                'value': 6,
              },
            ],
            'cf_top_secpolid_active': [],
            'cf_top_secpolid_report': [
              {
                'key': '__default__',
                'value': 6,
              },
            ],
            'challenge': 0,
            'hits': 6,
            'human': 0,
            'methods': [
              {
                'key': 'GET',
                'value': 3,
              },
              {
                'key': 'PUT',
                'value': 2,
              },
              {
                'key': 'DELETE',
                'value': 1,
              },
            ],
            'processing_time': {
              'average': 1577.6666666666667,
              'max': 1793,
              'min': 1323,
            },
            'report': 6,
            'requests_triggered_acl_active': 0,
            'requests_triggered_acl_report': 0,
            'requests_triggered_cf_active': 0,
            'requests_triggered_cf_report': 0,
            'requests_triggered_globalfilter_active': 0,
            'requests_triggered_globalfilter_report': 3,
            'requests_triggered_ratelimit_active': 0,
            'requests_triggered_ratelimit_report': 0,
            'status': [
              {
                'key': '200',
                'value': 6,
              },
            ],
            'status_classes': [
              {
                'key': '2',
                'value': 6,
              },
            ],
            'top_blocked_asn': [],
            'top_blocked_country': [],
            'top_blocked_ip': [],
            'top_blocked_session': [],
            'top_blocked_uri': [],
            'top_blocked_user_agent': [],
            'top_ip_per_unique_uri': [
              {
                'key': '79.178.43.18',
                'value': 6,
              },
            ],
            'top_max_args_per_request': [
              {
                'key': '1',
                'value': 2,
              },
              {
                'key': '0',
                'value': 4,
              },
            ],
            'top_max_cookies_per_request': [
              {
                'key': '0',
                'value': 6,
              },
            ],
            'top_max_headers_per_request': [
              {
                'key': '5',
                'value': 2,
              },
              {
                'key': '3',
                'value': 4,
              },
            ],
            'top_passed_asn': [
              {
                'key': 8551,
                'value': 6,
              },
            ],
            'top_passed_country': [
              {
                'key': 'il',
                'value': 6,
              },
            ],
            'top_passed_ip': [
              {
                'key': '79.178.43.18',
                'value': 6,
              },
            ],
            'top_passed_session': [
              {
                'key': '4738982146e3c2cc8daf69b376c5205ac7fff610da023a6fd5e5b809',
                'value': 6,
              },
            ],
            'top_passed_uri': [
              {
                'key': '/delete/01/',
                'value': 1,
              },
              {
                'key': '/get/01/',
                'value': 1,
              },
              {
                'key': '/get/02/',
                'value': 1,
              },
              {
                'key': '/get/14273/',
                'value': 1,
              },
              {
                'key': '/put/02/',
                'value': 1,
              },
              {
                'key': '/put/30049/',
                'value': 1,
              },
            ],
            'top_passed_user_agent': [
              {
                'key': 'curl/7.79.1',
                'value': 6,
              },
            ],
            'top_request_per_args': [
              {
                'key': '0',
                'value': 4,
              },
              {
                'key': '1',
                'value': 2,
              },
            ],
            'top_request_per_cookies': [
              {
                'key': '0',
                'value': 6,
              },
            ],
            'top_request_per_headers': [
              {
                'key': '3',
                'value': 4,
              },
              {
                'key': '5',
                'value': 2,
              },
            ],
            'top_session_per_unique_uri': [
              {
                'key': '4738982146e3c2cc8daf69b376c5205ac7fff610da023a6fd5e5b809',
                'value': 6,
              },
            ],
            'top_tags': [
              {
                'key': 'api',
                'value': 3,
              },
            ],
            'top_uri_per_unique_ip': [
              {
                'key': '/get/14273/',
                'value': 1,
              },
              {
                'key': '/get/01/',
                'value': 1,
              },
              {
                'key': '/put/02/',
                'value': 1,
              },
              {
                'key': '/put/30049/',
                'value': 1,
              },
              {
                'key': '/get/02/',
                'value': 1,
              },
              {
                'key': '/delete/01/',
                'value': 1,
              },
            ],
            'top_uri_per_unique_session': [
              {
                'key': '/get/01/',
                'value': 1,
              },
              {
                'key': '/get/14273/',
                'value': 1,
              },
              {
                'key': '/put/30049/',
                'value': 1,
              },
              {
                'key': '/get/02/',
                'value': 1,
              },
              {
                'key': '/put/02/',
                'value': 1,
              },
              {
                'key': '/delete/01/',
                'value': 1,
              },
            ],
            'unique_asn': 1,
            'unique_blocked_asn': 0,
            'unique_blocked_country': 0,
            'unique_blocked_ip': 0,
            'unique_blocked_session': 0,
            'unique_blocked_uri': 0,
            'unique_blocked_user_agent': 0,
            'unique_country': 1,
            'unique_ip': 1,
            'unique_passed_asn': 1,
            'unique_passed_country': 1,
            'unique_passed_ip': 1,
            'unique_passed_session': 1,
            'unique_passed_uri': 6,
            'unique_passed_user_agent': 1,
            'unique_session': 1,
            'unique_uri': 6,
            'unique_user_agent': 1,
          },
          'proxy': 'curieproxyngx',
          'secpolentryid': '__default__',
          'secpolid': '__default__',
          'timestamp': '2022-10-21T13:53:41Z',
        },
        {
          'counters': {
            'blocks': 0,
            'bot': 7,
            'cf_risk_level_active': [],
            'cf_risk_level_report': [],
            'cf_section_active': {
              'args': 0,
              'attrs': 0,
              'body': 0,
              'headers': 0,
              'uri': 0,
            },
            'cf_section_report': {
              'args': 0,
              'attrs': 0,
              'body': 0,
              'headers': 0,
              'uri': 0,
            },
            'cf_top_aclid_active': [],
            'cf_top_aclid_report': [],
            'cf_top_ruleid_active': [],
            'cf_top_ruleid_report': [],
            'cf_top_secpolentryid_active': [],
            'cf_top_secpolentryid_report': [
              {
                'key': '__default__',
                'value': 7,
              },
            ],
            'cf_top_secpolid_active': [],
            'cf_top_secpolid_report': [
              {
                'key': '__default__',
                'value': 7,
              },
            ],
            'challenge': 0,
            'hits': 7,
            'human': 0,
            'methods': [
              {
                'key': 'POST',
                'value': 3,
              },
              {
                'key': 'DELETE',
                'value': 2,
              },
              {
                'key': 'PUT',
                'value': 2,
              },
            ],
            'processing_time': {
              'average': 1535.4285714285713,
              'max': 1711,
              'min': 1317,
            },
            'report': 7,
            'requests_triggered_acl_active': 0,
            'requests_triggered_acl_report': 0,
            'requests_triggered_cf_active': 0,
            'requests_triggered_cf_report': 0,
            'requests_triggered_globalfilter_active': 0,
            'requests_triggered_globalfilter_report': 7,
            'requests_triggered_ratelimit_active': 0,
            'requests_triggered_ratelimit_report': 0,
            'status': [
              {
                'key': '200',
                'value': 7,
              },
            ],
            'status_classes': [
              {
                'key': '2',
                'value': 7,
              },
            ],
            'top_blocked_asn': [],
            'top_blocked_country': [],
            'top_blocked_ip': [],
            'top_blocked_session': [],
            'top_blocked_uri': [],
            'top_blocked_user_agent': [],
            'top_ip_per_unique_uri': [
              {
                'key': '79.178.43.18',
                'value': 7,
              },
            ],
            'top_max_args_per_request': [
              {
                'key': '1',
                'value': 5,
              },
              {
                'key': '0',
                'value': 2,
              },
            ],
            'top_max_cookies_per_request': [
              {
                'key': '0',
                'value': 7,
              },
            ],
            'top_max_headers_per_request': [
              {
                'key': '5',
                'value': 5,
              },
              {
                'key': '3',
                'value': 2,
              },
            ],
            'top_passed_asn': [
              {
                'key': 8551,
                'value': 7,
              },
            ],
            'top_passed_country': [
              {
                'key': 'il',
                'value': 7,
              },
            ],
            'top_passed_ip': [
              {
                'key': '79.178.43.18',
                'value': 7,
              },
            ],
            'top_passed_session': [
              {
                'key': '4738982146e3c2cc8daf69b376c5205ac7fff610da023a6fd5e5b809',
                'value': 7,
              },
            ],
            'top_passed_uri': [
              {
                'key': '/delete/02/',
                'value': 1,
              },
              {
                'key': '/delete/25790/',
                'value': 1,
              },
              {
                'key': '/post/01/',
                'value': 1,
              },
              {
                'key': '/post/02/',
                'value': 1,
              },
              {
                'key': '/post/9112/',
                'value': 1,
              },
              {
                'key': '/put/01/',
                'value': 1,
              },
              {
                'key': '/put/02/',
                'value': 1,
              },
            ],
            'top_passed_user_agent': [
              {
                'key': 'curl/7.79.1',
                'value': 7,
              },
            ],
            'top_request_per_args': [
              {
                'key': '1',
                'value': 5,
              },
              {
                'key': '0',
                'value': 2,
              },
            ],
            'top_request_per_cookies': [
              {
                'key': '0',
                'value': 7,
              },
            ],
            'top_request_per_headers': [
              {
                'key': '5',
                'value': 5,
              },
              {
                'key': '3',
                'value': 2,
              },
            ],
            'top_session_per_unique_uri': [
              {
                'key': '4738982146e3c2cc8daf69b376c5205ac7fff610da023a6fd5e5b809',
                'value': 7,
              },
            ],
            'top_tags': [
              {
                'key': 'api',
                'value': 7,
              },
            ],
            'top_uri_per_unique_ip': [
              {
                'key': '/put/02/',
                'value': 1,
              },
              {
                'key': '/delete/02/',
                'value': 1,
              },
              {
                'key': '/post/01/',
                'value': 1,
              },
              {
                'key': '/post/02/',
                'value': 1,
              },
              {
                'key': '/post/9112/',
                'value': 1,
              },
              {
                'key': '/put/01/',
                'value': 1,
              },
              {
                'key': '/delete/25790/',
                'value': 1,
              },
            ],
            'top_uri_per_unique_session': [
              {
                'key': '/put/01/',
                'value': 1,
              },
              {
                'key': '/put/02/',
                'value': 1,
              },
              {
                'key': '/post/01/',
                'value': 1,
              },
              {
                'key': '/delete/25790/',
                'value': 1,
              },
              {
                'key': '/post/02/',
                'value': 1,
              },
              {
                'key': '/post/9112/',
                'value': 1,
              },
              {
                'key': '/delete/02/',
                'value': 1,
              },
            ],
            'unique_asn': 1,
            'unique_blocked_asn': 0,
            'unique_blocked_country': 0,
            'unique_blocked_ip': 0,
            'unique_blocked_session': 0,
            'unique_blocked_uri': 0,
            'unique_blocked_user_agent': 0,
            'unique_country': 1,
            'unique_ip': 1,
            'unique_passed_asn': 1,
            'unique_passed_country': 1,
            'unique_passed_ip': 1,
            'unique_passed_session': 1,
            'unique_passed_uri': 7,
            'unique_passed_user_agent': 1,
            'unique_session': 1,
            'unique_uri': 7,
            'unique_user_agent': 1,
          },
          'proxy': 'curieproxyngx',
          'secpolentryid': '__default__',
          'secpolid': '__default__',
          'timestamp': '2022-10-21T13:53:42Z',
        },
        {
          'counters': {
            'blocks': 0,
            'bot': 3,
            'cf_risk_level_active': [],
            'cf_risk_level_report': [],
            'cf_section_active': {
              'args': 0,
              'attrs': 0,
              'body': 0,
              'headers': 0,
              'uri': 0,
            },
            'cf_section_report': {
              'args': 0,
              'attrs': 0,
              'body': 0,
              'headers': 0,
              'uri': 0,
            },
            'cf_top_aclid_active': [],
            'cf_top_aclid_report': [],
            'cf_top_ruleid_active': [],
            'cf_top_ruleid_report': [],
            'cf_top_secpolentryid_active': [],
            'cf_top_secpolentryid_report': [
              {
                'key': '__default__',
                'value': 3,
              },
            ],
            'cf_top_secpolid_active': [],
            'cf_top_secpolid_report': [
              {
                'key': '__default__',
                'value': 3,
              },
            ],
            'challenge': 0,
            'hits': 3,
            'human': 0,
            'methods': [
              {
                'key': 'GET',
                'value': 2,
              },
              {
                'key': 'PUT',
                'value': 1,
              },
            ],
            'processing_time': {
              'average': 1531.0,
              'max': 1608,
              'min': 1432,
            },
            'report': 3,
            'requests_triggered_acl_active': 0,
            'requests_triggered_acl_report': 0,
            'requests_triggered_cf_active': 0,
            'requests_triggered_cf_report': 0,
            'requests_triggered_globalfilter_active': 0,
            'requests_triggered_globalfilter_report': 1,
            'requests_triggered_ratelimit_active': 0,
            'requests_triggered_ratelimit_report': 0,
            'status': [
              {
                'key': '200',
                'value': 3,
              },
            ],
            'status_classes': [
              {
                'key': '2',
                'value': 3,
              },
            ],
            'top_blocked_asn': [],
            'top_blocked_country': [],
            'top_blocked_ip': [],
            'top_blocked_session': [],
            'top_blocked_uri': [],
            'top_blocked_user_agent': [],
            'top_ip_per_unique_uri': [
              {
                'key': '79.178.43.18',
                'value': 3,
              },
            ],
            'top_max_args_per_request': [
              {
                'key': '1',
                'value': 1,
              },
              {
                'key': '0',
                'value': 2,
              },
            ],
            'top_max_cookies_per_request': [
              {
                'key': '0',
                'value': 3,
              },
            ],
            'top_max_headers_per_request': [
              {
                'key': '5',
                'value': 1,
              },
              {
                'key': '3',
                'value': 2,
              },
            ],
            'top_passed_asn': [
              {
                'key': 8551,
                'value': 3,
              },
            ],
            'top_passed_country': [
              {
                'key': 'il',
                'value': 3,
              },
            ],
            'top_passed_ip': [
              {
                'key': '79.178.43.18',
                'value': 3,
              },
            ],
            'top_passed_session': [
              {
                'key': '4738982146e3c2cc8daf69b376c5205ac7fff610da023a6fd5e5b809',
                'value': 3,
              },
            ],
            'top_passed_uri': [
              {
                'key': '/get/01/',
                'value': 1,
              },
              {
                'key': '/get/02/',
                'value': 1,
              },
              {
                'key': '/put/3869/',
                'value': 1,
              },
            ],
            'top_passed_user_agent': [
              {
                'key': 'curl/7.79.1',
                'value': 3,
              },
            ],
            'top_request_per_args': [
              {
                'key': '0',
                'value': 2,
              },
              {
                'key': '1',
                'value': 1,
              },
            ],
            'top_request_per_cookies': [
              {
                'key': '0',
                'value': 3,
              },
            ],
            'top_request_per_headers': [
              {
                'key': '3',
                'value': 2,
              },
              {
                'key': '5',
                'value': 1,
              },
            ],
            'top_session_per_unique_uri': [
              {
                'key': '4738982146e3c2cc8daf69b376c5205ac7fff610da023a6fd5e5b809',
                'value': 3,
              },
            ],
            'top_tags': [
              {
                'key': 'api',
                'value': 1,
              },
            ],
            'top_uri_per_unique_ip': [
              {
                'key': '/put/3869/',
                'value': 1,
              },
              {
                'key': '/get/01/',
                'value': 1,
              },
              {
                'key': '/get/02/',
                'value': 1,
              },
            ],
            'top_uri_per_unique_session': [
              {
                'key': '/put/3869/',
                'value': 1,
              },
              {
                'key': '/get/02/',
                'value': 1,
              },
              {
                'key': '/get/01/',
                'value': 1,
              },
            ],
            'unique_asn': 1,
            'unique_blocked_asn': 0,
            'unique_blocked_country': 0,
            'unique_blocked_ip': 0,
            'unique_blocked_session': 0,
            'unique_blocked_uri': 0,
            'unique_blocked_user_agent': 0,
            'unique_country': 1,
            'unique_ip': 1,
            'unique_passed_asn': 1,
            'unique_passed_country': 1,
            'unique_passed_ip': 1,
            'unique_passed_session': 1,
            'unique_passed_uri': 3,
            'unique_passed_user_agent': 1,
            'unique_session': 1,
            'unique_uri': 3,
            'unique_user_agent': 1,
          },
          'proxy': 'curieproxyngx',
          'secpolentryid': '__default__',
          'secpolid': '__default__',
          'timestamp': '2022-10-21T13:53:43Z',
        },
      ]
    },

    // getDashboardURL(metabaseId: number) {
    //   const METABASE_SECRET_KEY = ''
    //   const payload = {
    //     resource: {dashboard: metabaseId},
    //     params: {},
    //     exp: Math.round(Date.now() / 1000) + (10 * 60), // 10 minute expiration
    //   }
    //   const token = jwt.sign(payload, METABASE_SECRET_KEY)
    //   return `${this.metabaseURL}/embed/dashboard/${token}#theme=transparent&bordered=false&titled=true`
    // },

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

.date-picker-input {
  padding-left: 33px;
}
</style>
