<template>
  <div>
    <!--First graphs row-->
    <div class="columns">
      <div class="column is-3">
        <div class="field traffic-info">
          <label class="label is-small">
            Total Calls
          </label>
          <div class="control columns">
            <span class="column is-4">
              {{ amountSuffixFormatter(totalCallsInfo.amount) }}
            </span>
            <span class="column is-3">
              <!--TODO: Trend-->
            </span>
            <span class="column is-5">
              {{ totalCallsInfo.callsPerHour }} Calls / Hr
            </span>
          </div>
        </div>
        <div v-for="(data, trafficCategory) in trafficInfo"
             :key="trafficCategory"
             class="field traffic-info">
          <label class="label is-small">
            {{ capitalize(trafficCategory) }}
          </label>
          <div class="control columns">
            <span class="column is-4">
              {{ amountSuffixFormatter(data.amount) }}
            </span>
            <span class="column is-3">
              <!--TODO: Trend-->
            </span>
            <span class="column is-5">
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
      <div class="column is-9">
        <div class="chart-display">
          <label class="label is-small">
            Traffic Info
          </label>
          <rbz-chart :data="trafficChartData"
                     :series-options="trafficChartSeriesOptions"
                     :legend-as-tooltip="true"
                     :chart-height="150">
          </rbz-chart>
        </div>
        <div class="chart-display">
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
    </div>
    <!--First tables row-->
    <div class="columns">
      <div class="column is-4">
        <rbz-table :columns="topTableColumns"
                   :data="topTargetApps"
                   table-title="TOP TARGETED SERVICES/APPS"
                   :rowsPerPage="5">
        </rbz-table>
      </div>
      <div class="column is-4">
        <rbz-table :columns="topTableColumns"
                   :data="topTargetUris"
                   table-title="TOP TARGETED URLs"
                   :rowsPerPage="5">
        </rbz-table>
      </div>
      <div class="column is-4">
        <rbz-table :columns="topTableColumns"
                   :data="topTargetRTCs"
                   table-title="TOP TARGETED RTCs"
                   :rowsPerPage="5">
        </rbz-table>
      </div>
    </div>
    <!--Second tables row-->
    <div class="columns">
      <div class="column is-4">
        <rbz-table :columns="topTableColumns"
                   :data="topCountries"
                   table-title="TOP COUNTRIES"
                   :rowsPerPage="5">
        </rbz-table>
      </div>
      <div class="column is-4">
        <rbz-table :columns="topTableColumns"
                   :data="topASNumbers"
                   table-title="TOP AS NUMBERS"
                   :rowsPerPage="5">
        </rbz-table>
      </div>
      <div class="column is-4">
        <rbz-table :columns="topTableColumns"
                   :data="topIPAddresses"
                   table-title="TOP IP ADDRESSES"
                   :rowsPerPage="5">
        </rbz-table>
      </div>
    </div>
    <!--Third tables row-->
    <div class="columns">
      <div class="column is-4">
        <rbz-table :columns="topTableColumns"
                   :data="topRateLimits"
                   table-title="TOP RATE LIMITS"
                   :rowsPerPage="5">
        </rbz-table>
      </div>
      <div class="column is-4">
        <rbz-table :columns="topTableColumns"
                   :data="topACLs"
                   table-title="TOP ACLs"
                   :rowsPerPage="5">
        </rbz-table>
      </div>
      <div class="column is-4">
        <rbz-table :columns="topTableColumns"
                   :data="topContentFilters"
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
                   table-title="TOP USER AGENT"
                   :rowsPerPage="5">
        </rbz-table>
      </div>
      <div class="column is-4">
        <rbz-table :columns="topTableColumns"
                   :data="topTags"
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
    return {
      topTableColumns: [
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
      ] as ColumnOptions[],
      trafficChartSeriesOptions: [
        {
          title: 'Passed',
          fieldName: 'passed',
          show: true,
          drawStyle: 'line',
          strokeColor: 'rgb(0, 255, 0)',
        }, {
          title: 'Blocked',
          fieldName: 'blocked',
          show: true,
          drawStyle: 'line',
          strokeColor: 'rgb(255, 0, 0)',
        }, {
          title: 'Report',
          fieldName: 'report',
          show: true,
          drawStyle: 'line',
          strokeColor: 'rgb(0, 0, 255)',
        }, {
          title: 'Humans',
          fieldName: 'humans',
          show: true,
          drawStyle: 'line',
          strokeColor: 'rgb(0, 100, 100)',
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
        return value?.['Counters'].hits
      })
      const startDate = new Date(_.minBy(this.data, 'Timestamp')['Timestamp'])
      const endDate = new Date(_.maxBy(this.data, 'Timestamp')['Timestamp'])
      const totalTimeInHours = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60)
      return {
        amount: hits,
        callsPerHour: Math.floor(hits / totalTimeInHours),
      }
    },

    trafficInfo() {
      const hits = _.sumBy(this.data, (value) => {
        return value?.['Counters'].hits
      })
      const blocked = _.sumBy(this.data, (value) => {
        return value?.['Counters'].blocks
      })
      const humans = _.sumBy(this.data, (value) => {
        return value?.['Counters'].human
      })
      const bots = _.sumBy(this.data, (value) => {
        return value?.['Counters'].bot
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
        return Math.floor(new Date(dataItem['Timestamp']).getTime() / 1000)
      })
      for (const minute of Object.keys(groupedObject)) {
        const passed = _.sumBy(groupedObject[minute], (item) => item['Counters'].hits - item['Counters'].blocks)
        const blocked = _.sumBy(groupedObject[minute], (item) => item['Counters'].blocks)
        const report = _.sumBy(groupedObject[minute], (item) => item['Counters'].report)
        const humans = _.sumBy(groupedObject[minute], (item) => item['Counters'].human)
        const bots = _.sumBy(groupedObject[minute], (item) => item['Counters'].bot)
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
        return Math.floor(new Date(dataItem['Timestamp']).getTime() / 1000)
      })
      for (const minute of Object.keys(groupedObject)) {
        const counter3xx = _.sumBy(groupedObject[minute], (item) => item['Counters']['3xx'])
        const counter4xx = _.sumBy(groupedObject[minute], (item) => item['Counters']['4xx'])
        const counter5xx = _.sumBy(groupedObject[minute], (item) => item['Counters']['5XX'])
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
      const groupedObject = _.groupBy(this.data, 'Appid')
      for (const appId of Object.keys(groupedObject)) {
        const passed = _.sumBy(groupedObject[appId], (item) => item['Counters'].hits - item['Counters'].blocks)
        const blocked = _.sumBy(groupedObject[appId], (item) => item['Counters'].blocks)
        const report = _.sumBy(groupedObject[appId], (item) => item['Counters'].report)
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
      return this.buildTopDataFromCounters('top-blocked-uri', 'top-passed-uri', 'top-reported-uri')
    },

    // TODO
    topTargetRTCs(): topTableData[] {
      return []
    },

    topCountries(): topTableData[] {
      return this.buildTopDataFromCounters('top-blocked-countries', 'top-passed-countries', 'top-reported-countries')
    },

    topASNumbers(): topTableData[] {
      return this.buildTopDataFromCounters('top-blocked-asn', 'top-passed-asn', 'top-reported-asn')
    },

    topIPAddresses(): topTableData[] {
      return this.buildTopDataFromCounters('top-blocked-ip', 'top-passed-ip', 'top-reported-ip')
    },

    // TODO
    topRateLimits(): topTableData[] {
      return []
    },

    // TODO
    topACLs(): topTableData[] {
      return []
    },

    // TODO
    topContentFilters(): topTableData[] {
      return []
    },

    topUserAgents(): topTableData[] {
      return this.buildTopDataFromCounters('top-blocked-user-agent', 'top-passed-user-agent', 'top-reported-user-agent')
    },

    // TODO
    topTags(): topTableData[] {
      return []
    },
  },
  methods: {
    buildTopDataFromCounters(blocksFieldName: string, passedFieldName: string, reportFieldName: string) {
      const returnArray = []
      const groupedObject: { [key: string]: topTableData } = {}
      this.data.forEach((item) => {
        if (item['Counters'][blocksFieldName]) {
          for (const key of Object.keys(item['Counters'][blocksFieldName])) {
            (groupedObject[key] || (groupedObject[key] = {})).blocked = groupedObject[key].blocked || 0
            groupedObject[key].blocked += item['Counters'][blocksFieldName][key] || 0
          }
        }
        if (item['Counters'][passedFieldName]) {
          for (const key of Object.keys(item['Counters'][passedFieldName])) {
            (groupedObject[key] || (groupedObject[key] = {})).passed = groupedObject[key].passed || 0
            groupedObject[key].passed += item['Counters'][passedFieldName][key] || 0
          }
        }
        if (item['Counters'][reportFieldName]) {
          for (const key of Object.keys(item['Counters'][reportFieldName])) {
            (groupedObject[key] || (groupedObject[key] = {})).report = groupedObject[key].report || 0
            groupedObject[key].report += item['Counters'][reportFieldName][key] || 0
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

.chart-display {
  height: 200px;
}
</style>
