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
                     placeholder="Filters, separated by a comma."
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
      // TODO: const query = this.buildQuery()
      /* TODO: const response = await RequestsUtils.sendDataLayerRequest({
        methodName: 'GET',
        url: `metrics/1m?filters=${query}`,
        config: {
          headers: {
            'syntax': 'mongodb',
            'provider': 'mongodb',
            'Content-Type': 'application/json',
          },
        },
      }) */ 
      // TODO: this.data = response?.data?.data?.results || []
      this.data = [{
        '_id': '638db92c780c697a30eb2d79',
        'counters': {
          'active': 42,
          'bot': 52,
          'bytes_sent': {
            'average': 294.3269230769231,
            'max': 750,
            'min': 189,
          },
          'challenge': 0,
          'hits': 52,
          'human': 15,
          'methods': [
            {
              'key': 'DELETE',
              'value': 18,
            },
            {
              'key': 'GET',
              'value': 16,
            },
            {
              'key': 'POST',
              'value': 9,
            },
            {
              'key': 'PUT',
              'value': 9,
            },
          ],
          'passed': 0,
          'processing_time': {
            'average': 7155.826923076923,
            'max': 227657,
            'min': 638,
          },
          'reported': 10,
          'requests_triggered_acl_active': 11,
          'requests_triggered_acl_report': 0,
          'requests_triggered_cf_active': 0,
          'requests_triggered_cf_report': 0,
          'requests_triggered_globalfilter_active': 0,
          'requests_triggered_globalfilter_report': 52,
          'requests_triggered_ratelimit_active': 31,
          'requests_triggered_ratelimit_report': 0,
          'risk_level_active': [],
          'risk_level_report': [],
          'section_active': {
            'args': 0,
            'attrs': 0,
            'body': 0,
            'headers': 0,
            'plugins': 0,
            'uri': 0,
          },
          'section_passed': {
            'args': 0,
            'attrs': 0,
            'body': 0,
            'headers': 0,
            'plugins': 0,
            'uri': 0,
          },
          'section_reported': {
            'args': 0,
            'attrs': 0,
            'body': 0,
            'headers': 52,
            'plugins': 0,
            'uri': 0,
          },
          'status': [
            {
              'key': '471',
              'value': 31,
            },
            {
              'key': '472',
              'value': 11,
            },
            {
              'key': '200',
              'value': 10,
            },
          ],
          'status_classes': [
            {
              'key': '4',
              'value': 42,
            },
            {
              'key': '2',
              'value': 10,
            },
          ],
          'top_aclid_active': [
            {
              'key': '05ac96d7b825',
              'value': 11,
            },
          ],
          'top_aclid_passed': [
            {
              'key': '__acldefault__',
              'value': 27,
            },
            {
              'key': '05ac96d7b825',
              'value': 14,
            },
          ],
          'top_aclid_reported': [],
          'top_asn_active': [
            {
              'key': 396982,
              'value': 42,
            },
          ],
          'top_asn_passed': [],
          'top_asn_reported': [
            {
              'key': 396982,
              'value': 10,
            },
          ],
          'top_authority_active': [
            {
              'key': 'backend.adevin.ta',
              'value': 18,
            },
            {
              'key': 'mobile.api.account.org',
              'value': 11,
            },
            {
              'key': 'sub.doma.in',
              'value': 7,
            },
            {
              'key': 'api.payment.com',
              'value': 6,
            },
          ],
          'top_authority_passed': [],
          'top_authority_reported': [
            {
              'key': 'backend.adevin.ta',
              'value': 4,
            },
            {
              'key': 'api.payment.com',
              'value': 2,
            },
            {
              'key': 'mobile.api.account.org',
              'value': 2,
            },
            {
              'key': 'sub.doma.in',
              'value': 2,
            },
          ],
          'top_country_active': [
            {
              'key': 'be',
              'value': 37,
            },
            {
              'key': 'us',
              'value': 5,
            },
          ],
          'top_country_passed': [],
          'top_country_reported': [
            {
              'key': 'be',
              'value': 10,
            },
          ],
          'top_ip_active': [
            {
              'key': '34.76.187.123',
              'value': 37,
            },
            {
              'key': '34.135.106.84',
              'value': 5,
            },
          ],
          'top_ip_passed': [],
          'top_ip_per_unique_uri': [
            {
              'key': '34.76.187.123',
              'value': 2,
            },
            {
              'key': '34.135.106.84',
              'value': 1,
            },
          ],
          'top_ip_reported': [
            {
              'key': '34.76.187.123',
              'value': 10,
            },
          ],
          'top_max_args_per_request': [
            {
              'key': '0',
              'value': 52,
            },
          ],
          'top_max_cookies_per_request': [
            {
              'key': '0',
              'value': 52,
            },
          ],
          'top_max_headers_per_request': [
            {
              'key': '17',
              'value': 1,
            },
            {
              'key': '16',
              'value': 37,
            },
            {
              'key': '15',
              'value': 14,
            },
          ],
          'top_request_per_args': [
            {
              'key': '0',
              'value': 52,
            },
          ],
          'top_request_per_cookies': [
            {
              'key': '0',
              'value': 52,
            },
          ],
          'top_request_per_headers': [
            {
              'key': '16',
              'value': 37,
            },
            {
              'key': '15',
              'value': 14,
            },
            {
              'key': '17',
              'value': 1,
            },
          ],
          'top_rtc_active': [
            {
              'key': 'ato',
              'value': 41,
            },
            {
              'key': 'api-bola',
              'value': 31,
            },
          ],
          'top_rtc_passed': [],
          'top_rtc_reported': [
            {
              'key': 'ato',
              'value': 8,
            },
          ],
          'top_ruleid_active': [],
          'top_ruleid_passed': [],
          'top_ruleid_reported': [],
          'top_session_active': [
            {
              'key': '1527541779404f842337ee8d1e13ce9899b01ba75cfc81a49bf62498',
              'value': 3,
            },
            {
              'key': 'f3a692eb30bc282026518edfb76e638a85475cf43732b274ef6387d2',
              'value': 3,
            },
            {
              'key': '1a744ecc6953f1fa3612db5b256b29e809dbf9836225c53d12c4fb89',
              'value': 2,
            },
            {
              'key': '679ab6a79894a09b02fc1bdd3c1c76e6da38af1d79c94f61225e5a9d',
              'value': 2,
            },
            {
              'key': 'a408fd98acdce825dc399daa5a012937c1ec04b15f791bd63f89493d',
              'value': 2,
            },
            {
              'key': 'a4f45caee2b4bf8a793226fad420c1e0cf54ecbda702c0524bf732fe',
              'value': 2,
            },
            {
              'key': 'a51c9124d3f2522e23674b7840798709cc9d845238f0db05a481183d',
              'value': 2,
            },
            {
              'key': 'be39904c1844291789d2a2d509b6e7e9f23629dee5dc94ed06d2a245',
              'value': 2,
            },
            {
              'key': '1609d084edfc870ca794418bf758b30f34083b2a2f7a6160ad694da8',
              'value': 1,
            },
            {
              'key': '2e940feb67f767b81ab10f940e4b1ef35da171607126bd123eeb630e',
              'value': 1,
            },
            {
              'key': '323af57421a69c240a75a4e54c22fefba3f4be5c9f4949ebc4ba17ee',
              'value': 1,
            },
            {
              'key': '3b094f4178c77050cff76536654601ff0aafda5b496acaefa0e638a2',
              'value': 1,
            },
            {
              'key': '55df83ab746f190a87136c3188ece181bb9313a6c8679078616a6985',
              'value': 1,
            },
            {
              'key': '5c6f0a2c5441b7a3e3fdf8af7860348b25f49711211369dd6425e18a',
              'value': 1,
            },
            {
              'key': '6c80cdfcf5284d261760c6aa5098c3cba9d8a1aaa92057a2d32a5128',
              'value': 1,
            },
            {
              'key': '7bb2e1f2001aa22d4f039d3cf191cc4a0c4b6de347a161d7569bd0c3',
              'value': 1,
            },
            {
              'key': '86d8e067ef3ba9db8f3444dedbc5275cf9cff27274a68ef03c499e69',
              'value': 1,
            },
            {
              'key': '86f0b0f7059a7fbda45de096ff2644a427165ad9274f3b67ee2b9f02',
              'value': 1,
            },
            {
              'key': '8fb47e44ae9232def8c9716912bd9fd3cf9e47821694ccc2a7a28de3',
              'value': 1,
            },
            {
              'key': '93e130b6895395dfc4832db9fd9cf4fbed7554dc77ca56389351dfda',
              'value': 1,
            },
            {
              'key': '9890f11a1e54eab2fdeb748d6a970b5ab5bc460deeeff7f59ea81c37',
              'value': 1,
            },
            {
              'key': 'ae078a48ed89bee9af60cb0af85d32d50845f35954f15f8fd8bca85f',
              'value': 1,
            },
            {
              'key': 'b839303eeabae817da8ed1d9ce27e456d73c59f29e1cfe7ec2e52963',
              'value': 1,
            },
            {
              'key': 'b9113842bbe0f0d4a3887b1588e1490a9189b8f6c8ba4bf59f532c61',
              'value': 1,
            },
            {
              'key': 'c5a661016fd4f6e22c55ff997d7f2010463ae503eaf6adec4ce900a8',
              'value': 1,
            },
          ],
          'top_session_passed': [],
          'top_session_per_unique_uri': [
            {
              'key': 'a51c9124d3f2522e23674b7840798709cc9d845238f0db05a481183d',
              'value': 2,
            },
            {
              'key': 'e6292df371f8e15e98c2fbc8c4f2e18d1425d10f51b11b32ad5b77a5',
              'value': 2,
            },
            {
              'key': 'df0ac5b7b4ca9e3efee28f2ec6c891ca91e226dbba71e8c7af25fc79',
              'value': 2,
            },
            {
              'key': 'a408fd98acdce825dc399daa5a012937c1ec04b15f791bd63f89493d',
              'value': 2,
            },
            {
              'key': 'f3a692eb30bc282026518edfb76e638a85475cf43732b274ef6387d2',
              'value': 2,
            },
            {
              'key': '1a744ecc6953f1fa3612db5b256b29e809dbf9836225c53d12c4fb89',
              'value': 2,
            },
            {
              'key': '86d8e067ef3ba9db8f3444dedbc5275cf9cff27274a68ef03c499e69',
              'value': 2,
            },
            {
              'key': '1527541779404f842337ee8d1e13ce9899b01ba75cfc81a49bf62498',
              'value': 2,
            },
            {
              'key': 'e077b93239ab5169e4afd0c20f85de80cb4a92cd16b778b75c661c3f',
              'value': 2,
            },
            {
              'key': '1609d084edfc870ca794418bf758b30f34083b2a2f7a6160ad694da8',
              'value': 1,
            },
            {
              'key': 'be39904c1844291789d2a2d509b6e7e9f23629dee5dc94ed06d2a245',
              'value': 1,
            },
            {
              'key': 'ea9f17451697369949b29ff671113953061b0293e3111502ce0ae6c7',
              'value': 1,
            },
            {
              'key': '7bb2e1f2001aa22d4f039d3cf191cc4a0c4b6de347a161d7569bd0c3',
              'value': 1,
            },
            {
              'key': '2e940feb67f767b81ab10f940e4b1ef35da171607126bd123eeb630e',
              'value': 1,
            },
            {
              'key': '3b094f4178c77050cff76536654601ff0aafda5b496acaefa0e638a2',
              'value': 1,
            },
            {
              'key': '33afa3bc5a37968b660cee3368841b46ff9d0363fbd55ba644842d97',
              'value': 1,
            },
            {
              'key': '5c6f0a2c5441b7a3e3fdf8af7860348b25f49711211369dd6425e18a',
              'value': 1,
            },
            {
              'key': 'a4f45caee2b4bf8a793226fad420c1e0cf54ecbda702c0524bf732fe',
              'value': 1,
            },
            {
              'key': 'efb85aa75fdbe4579b7b4911ab9e60c613ee1a8b891e20b02ef0fcab',
              'value': 1,
            },
            {
              'key': 'b9113842bbe0f0d4a3887b1588e1490a9189b8f6c8ba4bf59f532c61',
              'value': 1,
            },
            {
              'key': '9890f11a1e54eab2fdeb748d6a970b5ab5bc460deeeff7f59ea81c37',
              'value': 1,
            },
            {
              'key': '8fb47e44ae9232def8c9716912bd9fd3cf9e47821694ccc2a7a28de3',
              'value': 1,
            },
            {
              'key': 'e621e7d7286b63bbba438de9346915eb2ac18b82f0ddf48b74ccc31a',
              'value': 1,
            },
            {
              'key': '86f0b0f7059a7fbda45de096ff2644a427165ad9274f3b67ee2b9f02',
              'value': 1,
            },
            {
              'key': '679ab6a79894a09b02fc1bdd3c1c76e6da38af1d79c94f61225e5a9d',
              'value': 1,
            },
          ],
          'top_session_reported': [
            {
              'key': '03e94cbb2726e33505dbf9957d5214586003c6a36d69a9e195e2e2bd',
              'value': 1,
            },
            {
              'key': '1a744ecc6953f1fa3612db5b256b29e809dbf9836225c53d12c4fb89',
              'value': 1,
            },
            {
              'key': '33afa3bc5a37968b660cee3368841b46ff9d0363fbd55ba644842d97',
              'value': 1,
            },
            {
              'key': '6c80cdfcf5284d261760c6aa5098c3cba9d8a1aaa92057a2d32a5128',
              'value': 1,
            },
            {
              'key': '86d8e067ef3ba9db8f3444dedbc5275cf9cff27274a68ef03c499e69',
              'value': 1,
            },
            {
              'key': 'b9113842bbe0f0d4a3887b1588e1490a9189b8f6c8ba4bf59f532c61',
              'value': 1,
            },
            {
              'key': 'df0ac5b7b4ca9e3efee28f2ec6c891ca91e226dbba71e8c7af25fc79',
              'value': 1,
            },
            {
              'key': 'e077b93239ab5169e4afd0c20f85de80cb4a92cd16b778b75c661c3f',
              'value': 1,
            },
            {
              'key': 'e621e7d7286b63bbba438de9346915eb2ac18b82f0ddf48b74ccc31a',
              'value': 1,
            },
            {
              'key': 'e6292df371f8e15e98c2fbc8c4f2e18d1425d10f51b11b32ad5b77a5',
              'value': 1,
            },
          ],
          'top_tags_active': [
            {
              'key': 'action:monitor',
              'value': 42,
            },
            {
              'key': 'api',
              'value': 42,
            },
            {
              'key': 'action:rate-limit-block',
              'value': 31,
            },
            {
              'key': 'mobile',
              'value': 31,
            },
            {
              'key': 'mobile-sdk:verified',
              'value': 17,
            },
            {
              'key': 'mobile-sdk:emulator',
              'value': 13,
            },
            {
              'key': 'challenge',
              'value': 12,
            },
            {
              'key': 'mobile-sdk:key-spoof',
              'value': 12,
            },
            {
              'key': 'action:acl-block',
              'value': 11,
            },
          ],
          'top_tags_passed': [],
          'top_tags_reported': [
            {
              'key': 'action:monitor',
              'value': 10,
            },
            {
              'key': 'api',
              'value': 10,
            },
            {
              'key': 'mobile-sdk:emulator',
              'value': 6,
            },
            {
              'key': 'challenge',
              'value': 2,
            },
            {
              'key': 'mobile-sdk:key-spoof',
              'value': 2,
            },
            {
              'key': 'mobile-sdk:verified',
              'value': 2,
            },
          ],
          'top_uri_active': [
            {
              'key': '/api/v2/account/login/',
              'value': 25,
            },
            {
              'key': '/api/v2/account/',
              'value': 17,
            },
          ],
          'top_uri_passed': [],
          'top_uri_per_unique_ip': [
            {
              'key': '/api/v2/account/login/',
              'value': 2,
            },
            {
              'key': '/api/v2/account/',
              'value': 1,
            },
          ],
          'top_uri_per_unique_session': [
            {
              'key': '/api/v2/account/',
              'value': 25,
            },
            {
              'key': '/api/v2/account/login/',
              'value': 20,
            },
          ],
          'top_uri_reported': [
            {
              'key': '/api/v2/account/',
              'value': 10,
            },
          ],
          'top_user_agent_active': [
            {
              'key': 'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.5304.91 Mobile Safari/537.36',
              'value': 31,
            },
            {
              'key': 'Mozilla/5.0 (iPhone; CPU iPhone OS 12_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148',
              'value': 11,
            },
          ],
          'top_user_agent_passed': [],
          'top_user_agent_reported': [
            {
              'key': 'Mozilla/5.0 (iPhone; CPU iPhone OS 12_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148',
              'value': 10,
            },
          ],
          'unique_asn': 1,
          'unique_asn_active': 1,
          'unique_asn_passed': 0,
          'unique_asn_reported': 1,
          'unique_country': 2,
          'unique_country_active': 2,
          'unique_country_passed': 0,
          'unique_country_reported': 1,
          'unique_ip': 2,
          'unique_ip_active': 2,
          'unique_ip_passed': 0,
          'unique_ip_reported': 1,
          'unique_session': 35,
          'unique_session_active': 31,
          'unique_session_passed': 0,
          'unique_session_reported': 10,
          'unique_uri': 2,
          'unique_uri_active': 2,
          'unique_uri_passed': 0,
          'unique_uri_reported': 1,
          'unique_user_agent': 2,
          'unique_user_agent_active': 2,
          'unique_user_agent_passed': 0,
          'unique_user_agent_reported': 1,
        },
        'proxy': 'curieproxy-prod-5cf96b76d-smgwf',
        'secpolentryid': '3c3b3c9352cf',
        'secpolid': '__default__',
        'timestamp': '2022-12-05T09:24:00',
      }]
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
