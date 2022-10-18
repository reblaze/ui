<template>
  <div>
    <!--First graphs row-->
    <div class="columns">
      <div class="column width-300px">
        <div class="field traffic-info">
          <label class="label is-small has-text-grey-light">
            Total Calls
          </label>
          <div class="control columns is-variable is-1">
            <span class="column is-3 has-text-weight-bold">
              {{ amountSuffixFormatter(totalCallsInfo.amount) }}
            </span>
            <span class="column is-3">
              <!--TODO: Trend-->
            </span>
            <span class="column is-6">
              <span class="has-text-weight-bold">
                {{ amountSuffixFormatter(totalCallsInfo.callsPerHour) }}
              </span>
              Calls / Hr
            </span>
          </div>
        </div>
        <div v-for="(data, trafficCategory) in trafficInfo"
             :key="trafficCategory"
             class="field traffic-info">
          <label class="label is-small has-text-grey-light">
            {{ capitalize(trafficCategory) }}
          </label>
          <div class="control columns is-variable is-1">
            <span class="column is-3 has-text-weight-bold">
              {{ amountSuffixFormatter(data.amount) }}
            </span>
            <span class="column is-3">
              <!--TODO: Trend-->
            </span>
            <span class="column is-6">
              <template v-if="data.topCountries && data.topCountries.length">
                <country-flag v-for="topCountry in data.topCountries.slice(0, 3)"
                              :key="topCountry"
                              :country="topCountry"
                              :title="topCountry"
                              size="small"
                              class="flag"/>
                <span>
                  +{{ data.topCountries.length - 3 }}
                </span>
              </template>
            </span>
          </div>
        </div>
      </div>
      <div class="column">
        <div class="height-200px">
          <label class="label is-small">
            Traffic Info
          </label>
          <rbz-chart :data="trafficChartData"
                     :series-options="trafficChartSeriesOptions"
                     :legend-as-tooltip="true"
                     :chart-height="150">
          </rbz-chart>
        </div>
        <div class="height-200px">
          <label class="label is-small">
            Response Status
          </label>
          <rbz-chart :data="statusesChartData"
                     :series-options="statusesChartSeriesOptions"
                     :legend-as-tooltip="true"
                     :chart-height="150">
          </rbz-chart>
        </div>
      </div>
      <div class="column width-200px">
        <div class="height-200px">
          Bars
        </div>
        <div class="height-200px">
          Pie
        </div>
      </div>
    </div>
    <!--First tables row-->
    <div class="columns">
      <div class="column is-4">
        <rbz-table :columns="topTableColumns"
                   :data="topTargetApps"
                   :default-sort-column-index="1"
                   default-sort-column-direction="desc"
                   table-title="TOP TARGETED SERVICES/APPS"
                   :rowsPerPage="5">
        </rbz-table>
      </div>
      <div class="column is-4">
        <rbz-table :columns="topTableColumns"
                   :data="topTargetUris"
                   :default-sort-column-index="1"
                   default-sort-column-direction="desc"
                   table-title="TOP TARGETED URLs"
                   :rowsPerPage="5">
        </rbz-table>
      </div>
      <div class="column is-4">
        <rbz-table :columns="topTableColumnsTagPrefixRemoved"
                   :data="topTargetRTCs"
                   :default-sort-column-index="1"
                   default-sort-column-direction="desc"
                   table-title="TOP TARGETED RTCs"
                   :rowsPerPage="5">
        </rbz-table>
      </div>
    </div>
    <!--Second tables row-->
    <div class="columns">
      <div class="column is-4">
        <rbz-table :columns="topTableColumnsTagPrefixRemoved"
                   :data="topCountries"
                   :default-sort-column-index="1"
                   default-sort-column-direction="desc"
                   table-title="TOP COUNTRIES"
                   :rowsPerPage="5">
        </rbz-table>
      </div>
      <div class="column is-4">
        <rbz-table :columns="topTableColumnsTagPrefixRemoved"
                   :data="topASNumbers"
                   :default-sort-column-index="1"
                   default-sort-column-direction="desc"
                   table-title="TOP AS NUMBERS"
                   :rowsPerPage="5">
        </rbz-table>
      </div>
      <div class="column is-4">
        <rbz-table :columns="topTableColumns"
                   :data="topIPAddresses"
                   :default-sort-column-index="1"
                   default-sort-column-direction="desc"
                   table-title="TOP IP ADDRESSES"
                   :rowsPerPage="5">
        </rbz-table>
      </div>
    </div>
    <!--Third tables row-->
    <div class="columns">
      <div class="column is-4">
        <rbz-table :columns="topTableColumnsTagPrefixRemoved"
                   :data="topRateLimits"
                   :default-sort-column-index="1"
                   default-sort-column-direction="desc"
                   table-title="TOP RATE LIMITS"
                   :rowsPerPage="5">
        </rbz-table>
      </div>
      <div class="column is-4">
        <rbz-table :columns="topTableColumnsTagPrefixRemoved"
                   :data="topACLs"
                   :default-sort-column-index="1"
                   default-sort-column-direction="desc"
                   table-title="TOP ACLs"
                   :rowsPerPage="5">
        </rbz-table>
      </div>
      <div class="column is-4">
        <rbz-table :columns="topTableColumnsTagPrefixRemoved"
                   :data="topContentFilters"
                   :default-sort-column-index="1"
                   default-sort-column-direction="desc"
                   table-title="TOP CONTENT FILTERS"
                   :rowsPerPage="5">
        </rbz-table>
      </div>
    </div>
    <!--Fourth tables row-->
    <div class="columns">
      <div class="column is-4">
        <rbz-table :columns="topTableColumns"
                   :data="topUserAgents"
                   :default-sort-column-index="1"
                   default-sort-column-direction="desc"
                   table-title="TOP USER AGENT"
                   :rowsPerPage="5">
        </rbz-table>
      </div>
      <div class="column is-4">
        <rbz-table :columns="topTableColumns"
                   :data="topTags"
                   :default-sort-column-index="1"
                   default-sort-column-direction="desc"
                   table-title="TOP TAGS"
                   :rowsPerPage="5">
        </rbz-table>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent, PropType} from 'vue'
import RbzTable from '@/components/RbzTable.vue'
import {ColumnOptions, GenericObject} from '@/types'
import _ from 'lodash'
import RbzChart, {SeriesOptions} from '@/components/RbzChart.vue'
import Utils from '@/assets/Utils'
import CountryFlag from 'vue-country-flag-next'
import DatasetsUtils from '@/assets/DatasetsUtils'

type topTableData = {
  rowIdentification?: string
  passed?: number
  blocked?: number
  report?: number
}

export default defineComponent({
  name: 'RbzDashboardDefault',
  components: {
    CountryFlag,
    RbzChart,
    RbzTable,
  },
  props: {
    data: Array as PropType<GenericObject[]>,
  },
  data() {
    const topTableColumns: ColumnOptions[] = [
      {
        title: '',
        fieldNames: ['rowIdentification'],
        classes: 'width-100px ellipsis',
      },
      {
        title: 'Passed',
        fieldNames: ['passed'],
        isSortable: true,
        isNumber: true,
        classes: 'width-60px',
      },
      {
        title: 'blocked',
        fieldNames: ['blocked'],
        isSortable: true,
        isNumber: true,
        classes: 'width-60px',
      },
      {
        title: 'Report',
        fieldNames: ['report'],
        isSortable: true,
        isNumber: true,
        classes: 'width-60px',
      },
    ]
    const topTableColumnsTagPrefixRemoved = _.cloneDeep(topTableColumns)
    topTableColumnsTagPrefixRemoved[0].displayFunction = (item: topTableData) => {
      const splitFilter = item.rowIdentification.split(/:/)
      splitFilter.shift()
      return splitFilter.join(':')
    }
    return {
      topTableColumns: topTableColumns,
      topTableColumnsTagPrefixRemoved: topTableColumnsTagPrefixRemoved,
      trafficChartSeriesOptions: [
        {
          title: 'Passed',
          fieldName: 'passed',
          show: true,
          drawStyle: 'line',
          strokeColor: 'hsl(141, 53%, 53%)',
        }, {
          title: 'Blocked',
          fieldName: 'blocked',
          show: true,
          drawStyle: 'line',
          strokeColor: 'hsl(348, 100%, 61%)',
        }, {
          title: 'Report',
          fieldName: 'report',
          show: true,
          drawStyle: 'line',
          strokeColor: 'hsl(48, 100%, 67%)',
        }, {
          title: 'Humans',
          fieldName: 'humans',
          show: true,
          drawStyle: 'line',
          strokeColor: 'hsl(217, 71%, 53%)',
        }, {
          title: 'Bots',
          fieldName: 'bots',
          show: true,
          drawStyle: 'line',
          strokeColor: 'rgb(100, 100, 0)',
        },
      ] as SeriesOptions[],
      statusesChartSeriesOptions: [
        {
          title: '3xx',
          fieldName: '3xx',
          show: true,
          drawStyle: 'line',
          strokeColor: 'rgb(255, 0, 0)',
        }, {
          title: '4xx',
          fieldName: '4xx',
          show: true,
          drawStyle: 'line',
          strokeColor: 'rgb(0, 255, 0)',
        }, {
          title: '5xx',
          fieldName: '5xx',
          show: true,
          drawStyle: 'line',
          strokeColor: 'rgb(0, 0, 255)',
        },
      ] as SeriesOptions[],
    }
  },
  computed: {
    totalCallsInfo() {
      if (!this.data || !this.data.length) {
        return {}
      }
      const hits = _.sumBy(this.data, (value) => {
        return value?.counters.hits
      })
      const startDate = new Date(_.minBy(this.data, 'timestamp')['timestamp'])
      const endDate = new Date(_.maxBy(this.data, 'timestamp')['timestamp'])
      const totalTimeInHours = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60)
      return {
        amount: hits,
        callsPerHour: Math.floor(hits / totalTimeInHours),
      }
    },

    trafficInfo() {
      const hits = _.sumBy(this.data, (value) => {
        return value?.counters.hits
      })
      const blocked = _.sumBy(this.data, (value) => {
        return value?.counters.blocks
      })
      const humans = _.sumBy(this.data, (value) => {
        return value?.counters.human
      })
      const bots = _.sumBy(this.data, (value) => {
        return value?.counters.bot
      })
      return {
        'passed': {
          amount: hits - blocked,
          topCountries: _.map(_.orderBy(this.topCountries, ['passed'], ['desc']), (topCountry) => {
            return DatasetsUtils.geoCountryTagToCode(topCountry.rowIdentification)
          }),
        },
        'blocked': {
          amount: blocked,
          topCountries: _.map(_.orderBy(this.topCountries, ['blocked'], ['desc']), (topCountry) => {
            return DatasetsUtils.geoCountryTagToCode(topCountry.rowIdentification)
          }),
        },
        'humans': {
          amount: humans,
        },
        'bots': {
          amount: bots,
        },
      }
    },

    trafficChartData(): GenericObject[] {
      const returnArray = []
      // Group by minutes
      const groupedObject = _.groupBy(this.data, (dataItem) => {
        return Math.floor(new Date(dataItem['timestamp']).getTime() / 1000)
      })
      for (const minute of Object.keys(groupedObject)) {
        const passed = _.sumBy(groupedObject[minute], (item) => item.counters.hits - item.counters.blocks)
        const blocked = _.sumBy(groupedObject[minute], (item) => item.counters.blocks)
        const report = _.sumBy(groupedObject[minute], (item) => item.counters.report)
        const humans = _.sumBy(groupedObject[minute], (item) => item.counters.human)
        const bots = _.sumBy(groupedObject[minute], (item) => item.counters.bot)
        returnArray.push({
          timeframe: Number(minute),
          passed: passed > 0 ? passed : 0,
          blocked: blocked > 0 ? blocked : 0,
          report: report > 0 ? report : 0,
          humans: humans > 0 ? humans : 0,
          bots: bots > 0 ? bots : 0,
        })
      }
      return returnArray
    },

    statusesChartData(): GenericObject[] {
      const returnArray = []
      // Group by minutes
      const groupedObject = _.groupBy(this.data, (dataItem) => {
        return Math.floor(new Date(dataItem['timestamp']).getTime() / 1000)
      })
      for (const minute of Object.keys(groupedObject)) {
        const counter3xx = _.sumBy(groupedObject[minute], (item) => item.counters['3xx'])
        const counter4xx = _.sumBy(groupedObject[minute], (item) => item.counters['4xx'])
        const counter5xx = _.sumBy(groupedObject[minute], (item) => item.counters['5xx'])
        returnArray.push({
          'timeframe': Number(minute),
          '3xx': counter3xx > 0 ? counter3xx : 0,
          '4xx': counter4xx > 0 ? counter4xx : 0,
          '5xx': counter5xx > 0 ? counter5xx : 0,
        })
      }
      return returnArray
    },

    topTargetApps(): topTableData[] {
      const returnArray = []
      const groupedObject = _.groupBy(this.data, 'appid')
      for (const appId of Object.keys(groupedObject)) {
        const passed = _.sumBy(groupedObject[appId], (item) => item.counters.hits - item.counters.blocks)
        const blocked = _.sumBy(groupedObject[appId], (item) => item.counters.blocks)
        const report = _.sumBy(groupedObject[appId], (item) => item.counters.report)
        returnArray.push({
          rowIdentification: appId,
          passed: passed > 0 ? passed : 0,
          blocked: blocked > 0 ? blocked : 0,
          report: report > 0 ? report : 0,
        })
      }
      return returnArray
    },

    topTargetUris(): topTableData[] {
      return this.buildTopDataFromCounters('top_blocked_uri', 'top_passed_uri', 'top_reported_uri')
    },

    topTargetRTCs(): topTableData[] {
      return this.topTags.filter((tag: topTableData) => {
        return tag.rowIdentification.startsWith('rtc:')
      })
    },

    topCountries(): topTableData[] {
      return this.buildTopDataFromCounters('top_blocked_countries', 'top_passed_countries', 'top_reported_countries')
    },

    topASNumbers(): topTableData[] {
      return this.buildTopDataFromCounters('top_blocked_asn', 'top_passed_asn', 'top_reported_asn')
    },

    topIPAddresses(): topTableData[] {
      return this.buildTopDataFromCounters('top_blocked_ip', 'top_passed_ip', 'top_reported_ip')
    },

    topRateLimits(): topTableData[] {
      return this.topTags.filter((tag: topTableData) => {
        return tag.rowIdentification.startsWith('rate-limit:')
      })
    },

    topACLs(): topTableData[] {
      return this.topTags.filter((tag: topTableData) => {
        return tag.rowIdentification.startsWith('acl:')
      })
    },

    topContentFilters(): topTableData[] {
      return this.topTags.filter((tag: topTableData) => {
        return tag.rowIdentification.startsWith('content-filter:')
      })
    },

    topUserAgents(): topTableData[] {
      return this.buildTopDataFromCounters('top_blocked_user_agent', 'top_passed_user_agent', 'top_reported_user_agent')
    },

    topTags(): topTableData[] {
      return this.buildTopDataFromCounters('top_blocked_tags', 'top_passed_tags', 'top_reported_tags')
    },
  },
  methods: {
    buildTopDataFromCounters(blocksFieldName: string, passedFieldName: string, reportFieldName: string) {
      const returnArray = []
      const groupedObject: { [key: string]: topTableData } = {}
      this.data.forEach((item) => {
        if (item.counters[blocksFieldName]) {
          for (const key of Object.keys(item.counters[blocksFieldName])) {
            (groupedObject[key] || (groupedObject[key] = {})).blocked = groupedObject[key].blocked || 0
            groupedObject[key].blocked += item.counters[blocksFieldName][key] || 0
          }
        }
        if (item.counters[passedFieldName]) {
          for (const key of Object.keys(item.counters[passedFieldName])) {
            (groupedObject[key] || (groupedObject[key] = {})).passed = groupedObject[key].passed || 0
            groupedObject[key].passed += item.counters[passedFieldName][key] || 0
          }
        }
        if (item.counters[reportFieldName]) {
          for (const key of Object.keys(item.counters[reportFieldName])) {
            (groupedObject[key] || (groupedObject[key] = {})).report = groupedObject[key].report || 0
            groupedObject[key].report += item.counters[reportFieldName][key] || 0
          }
        }
      })
      for (const key of Object.keys(groupedObject)) {
        returnArray.push({
          rowIdentification: key,
          passed: groupedObject[key].passed > 0 ? groupedObject[key].passed : 0,
          blocked: groupedObject[key].blocked > 0 ? groupedObject[key].blocked : 0,
          report: groupedObject[key].report > 0 ? groupedObject[key].report : 0,
        })
      }
      return returnArray
    },

    capitalize(value: string) {
      return _.capitalize(value)
    },

    amountSuffixFormatter(value: number) {
      return Utils.amountSuffixFormatter(value)
    },
  },
})
</script>
<style scoped lang="scss">
.traffic-info:not(:last-child) {
  margin-bottom: 25px;
}

.flag {
  border: 1px solid #000;
  margin: -0.9em -1.1em;
}
</style>
