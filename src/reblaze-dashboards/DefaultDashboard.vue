<template>
  <div>
    <div v-show="!loading && totalCallsInfo.amount">
      <!--First graph row-->
      <div class="columns height-300px">
        <div class="column width-200px">
          <div class="field traffic-info mb-0 height-50px">
            <label class="label is-small has-text-grey-light">
              Total Calls
            </label>
            <div class="control columns is-variable is-0">
              <span class="column is-4 has-text-weight-bold">
                {{ amountSuffixFormatter(totalCallsInfo.amount) }}
              </span>
              <span class="column is-8">
                <span class="has-text-weight-bold">
                  {{ amountSuffixFormatter(totalCallsInfo.callsPerHour) }}
                </span>
                Calls / Hr
              </span>
            </div>
          </div>
          <div v-for="(data, trafficCategory) in trafficInfo"
               :key="trafficCategory"
               class="field traffic-info mb-0 width-50pct height-100px is-inline-block">
            <label class="label is-small has-text-grey-light is-capitalized">
              {{ trafficCategory }}
            </label>
            <div class="control">
              <div class="has-text-weight-bold">
                {{ data.percentile }}%
              </div>
              <div class="has-text-weight-bold">
                {{ amountSuffixFormatter(data.amount) }}
              </div>
              <div class="height-2rem country-flags-wrapper">
                <template v-if="data.topCountries && data.topCountries.length">
                  <country-flag v-for="topCountry in data.topCountries.slice(0, 3)"
                                :key="topCountry"
                                :country="topCountry"
                                :title="topCountry"
                                size="small"
                                class="flag"/>
                  <span>
                    {{ data.topCountries.length > 3 ? `+${data.topCountries.length - 3}` : '' }}
                  </span>
                </template>
              </div>
            </div>
          </div>
        </div>
        <div class="column">
          <label class="label is-small">
            Traffic Info
          </label>
          <rbz-chart :data="trafficChartData"
                     :series-options="trafficChartSeriesOptions"
                     :legend-as-tooltip="true"
                     :chart-height="250">
          </rbz-chart>
        </div>
      </div>
      <!--Second graph row-->
      <div class="columns height-300px">
        <div class="column width-200px">
          <div class="height-200px">
            <svg id="doughnut"
                 width="100%"
                 height="100%"
                 viewBox="0 0 100 100">
            </svg>
          </div>
          <div class="height-100px">
            <div class="status-legend-wrapper is-size-7 scrollbox-shadowed height-50px">
              <div v-for="legend in statusesPieChartLegend"
                   :key="legend.status">
                <span class="width-60px is-inline-block">
                  <span class="status-marker is-inline-block"
                        :style="`background: ${legend.color}`">
                  </span>
                  <span class="status-label is-inline-block">
                    {{ legend.status }}
                  </span>
                </span>
                <span class="status-value is-inline-block">
                  {{ legend.percentile }}%
                </span>
              </div>
            </div>
          </div>
        </div>
        <div class="column">
          <label class="label is-small is-clickable"
                 @click="toggleStatusesClassDetails">
            Response Status {{ statusesClassDetails ? 'Classes' : '' }}
          </label>
          <rbz-chart :data="statusesChartData"
                     :series-options="statusesChartSeriesOptions"
                     :legend-as-tooltip="true"
                     :chart-height="250">
          </rbz-chart>
        </div>
      </div>
      <!--Top tables-->
      <div class="columns is-multiline">
        <div class="column is-6">
          <rbz-table :columns="topTableColumns"
                     :data="topTargetApps"
                     :default-sort-column-index="1"
                     :rows-per-page="10"
                     default-sort-column-direction="desc"
                     table-title="TOP TARGETED SERVICES/APPS">
          </rbz-table>
        </div>
        <div class="column is-6">
          <rbz-table :columns="topTableColumns"
                     :data="topTargetUris"
                     :default-sort-column-index="1"
                     :rows-per-page="10"
                     default-sort-column-direction="desc"
                     table-title="TOP TARGETED URLs">
          </rbz-table>
        </div>
        <div class="column is-6">
          <rbz-table :columns="topTableColumns"
                     :data="topTargetRTCs"
                     :default-sort-column-index="1"
                     :rows-per-page="10"
                     default-sort-column-direction="desc"
                     table-title="TOP TARGETED RTCs">
          </rbz-table>
        </div>
        <div class="column is-6">
          <rbz-table :columns="topTableColumns"
                     :data="topCountries"
                     :default-sort-column-index="1"
                     :rows-per-page="10"
                     default-sort-column-direction="desc"
                     table-title="TOP COUNTRIES">
          </rbz-table>
        </div>
        <div class="column is-6">
          <rbz-table :columns="topTableColumns"
                     :data="topASNumbers"
                     :default-sort-column-index="1"
                     :rows-per-page="10"
                     default-sort-column-direction="desc"
                     table-title="TOP AS NUMBERS">
          </rbz-table>
        </div>
        <div class="column is-6">
          <rbz-table :columns="topTableColumns"
                     :data="topIPAddresses"
                     :default-sort-column-index="1"
                     :rows-per-page="10"
                     default-sort-column-direction="desc"
                     table-title="TOP IP ADDRESSES">
          </rbz-table>
        </div>
        <div class="column is-6">
          <rbz-table :columns="topTableColumns"
                     :data="topRateLimits"
                     :default-sort-column-index="1"
                     :rows-per-page="10"
                     default-sort-column-direction="desc"
                     table-title="TOP RATE LIMITS">
          </rbz-table>
        </div>
        <div class="column is-6">
          <rbz-table :columns="topTableColumns"
                     :data="topACLs"
                     :default-sort-column-index="1"
                     :rows-per-page="10"
                     default-sort-column-direction="desc"
                     table-title="TOP ACLs">
          </rbz-table>
        </div>
        <div class="column is-6">
          <rbz-table :columns="topTableColumns"
                     :data="topContentFilters"
                     :default-sort-column-index="1"
                     :rows-per-page="10"
                     default-sort-column-direction="desc"
                     table-title="TOP CONTENT FILTERS">
          </rbz-table>
        </div>
        <div class="column is-6">
          <rbz-table :columns="topTableColumns"
                     :data="topUserAgents"
                     :default-sort-column-index="1"
                     :rows-per-page="10"
                     default-sort-column-direction="desc"
                     table-title="TOP USER AGENT">
          </rbz-table>
        </div>
        <div class="column is-6">
          <rbz-table :columns="topTableColumns"
                     :data="topTags"
                     :default-sort-column-index="1"
                     :rows-per-page="10"
                     default-sort-column-direction="desc"
                     table-title="TOP TAGS">
          </rbz-table>
        </div>
      </div>
    </div>
    <div v-show="loading || !totalCallsInfo.amount"
         class="has-text-centered is-fullwidth">
      <div v-if="loading">
        <button class="button is-outlined is-text is-small is-loading dashboard-loading">
          Loading
        </button>
      </div>
      <div v-else>
        Your search did not match any data
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
import {STATUS_COLORS} from '@/types/const'

type topTableData = {
  rowIdentification?: string
  passed?: number
  blocked?: number
  reported?: number
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
    loading: Boolean,
  },
  data() {
    const topTableColumns: ColumnOptions[] = [
      {
        title: '',
        fieldNames: ['rowIdentification'],
        cellContentClasses: 'horizontal-scroll',
      },
      {
        title: 'Passed',
        fieldNames: ['passed'],
        isSortable: true,
        isNumber: true,
        classes: 'width-80px',
      },
      {
        title: 'Blocked',
        fieldNames: ['blocked'],
        isSortable: true,
        isNumber: true,
        classes: 'width-80px',
      },
      {
        title: 'Reported',
        fieldNames: ['reported'],
        isSortable: true,
        isNumber: true,
        classes: 'width-80px',
      },
    ]
    return {
      topTableColumns: topTableColumns,
      trafficChartSeriesOptions: [
        {
          title: 'Hits',
          fieldName: 'hits',
          show: true,
          drawStyle: 'spline',
          fillColor: `rgba(${Utils.hexToRgbArray('#7a7a7a').join(', ')}, 0.1)`,
          strokeColor: '#7a7a7a', // $color-boulder
        },
        {
          title: 'Passed',
          fieldName: 'passed',
          show: true,
          drawStyle: 'spline',
          fillColor: `rgba(${Utils.hexToRgbArray('#50c878').join(', ')}, 0.1)`,
          strokeColor: '#50c878', // $color-emerald
        },
        {
          title: 'Blocked',
          fieldName: 'blocked',
          show: true,
          drawStyle: 'spline',
          fillColor: `rgba(${Utils.hexToRgbArray('#ff355e').join(', ')}, 0.1)`,
          strokeColor: '#ff355e', // $color-radical-red
        },
        {
          title: 'Reported',
          fieldName: 'reported',
          show: true,
          drawStyle: 'spline',
          fillColor: `rgba(${Utils.hexToRgbArray('#ffdb58').join(', ')}, 0.1)`,
          strokeColor: '#ffdb58', // $color-mustard
        },
        {
          title: 'Humans',
          fieldName: 'humans',
          show: true,
          drawStyle: 'spline',
          fillColor: `rgba(${Utils.hexToRgbArray('#4169e1').join(', ')}, 0.1)`,
          strokeColor: '#4169e1', // $color-royal-blue
        },
        {
          title: 'Bots',
          fieldName: 'bots',
          show: true,
          drawStyle: 'spline',
          fillColor: `rgba(${Utils.hexToRgbArray('#843179').join(', ')}, 0.1)`,
          strokeColor: '#843179', // $color-plum
        },
      ] as SeriesOptions[],
      statusesClassDetails: true,
      statusesPieChartLegend: [],
    }
  },
  watch: {
    statusesChartData: {
      handler(val, oldVal) {
        if (!val || _.isEqual(val, oldVal)) {
          return
        }
        const totals: GenericObject = {}
        for (const dataItem of val) {
          for (const [key, value] of Object.entries(dataItem)) {
            if (key === 'timeframe') {
              continue
            }
            if (!totals[key]) {
              totals[key] = 0
            }
            totals[key] += value
          }
        }
        let data = []
        for (const [key, value] of Object.entries(totals)) {
          data.push({
            status: key,
            fill: (value / _.sum(Object.values(totals))) * 100,
            color: this.getStatusColor(key),
          })
        }
        data = _.sortBy(data, 'status')
        const svgDoughnut = document.querySelector('#doughnut')
        svgDoughnut.innerHTML = ''
        let filled = 0
        this.statusesPieChartLegend = []
        data.forEach((dataItem) => {
          const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
          const startAngle = -90
          const radius = 20
          const cx = 50
          const cy = 50
          const strokeWidth = 40
          const dashArray = 2 * Math.PI * radius
          const dashOffset = dashArray - (dashArray * dataItem.fill / 100)
          const angle = (filled * 360 / 100) + startAngle
          circle.setAttribute('r', radius.toString())
          circle.setAttribute('cx', cx.toString())
          circle.setAttribute('cy', cy.toString())
          circle.setAttribute('fill', 'transparent')
          circle.setAttribute('stroke', dataItem.color)
          circle.setAttribute('stroke-width', strokeWidth.toString())
          circle.setAttribute('stroke-dasharray', dashArray.toString())
          circle.setAttribute('stroke-dashoffset', dashOffset.toString())
          circle.setAttribute('transform', 'rotate(' + (angle) + ' ' + cx + ' ' + cy + ')')
          svgDoughnut.appendChild(circle)
          this.statusesPieChartLegend.push({
            status: dataItem.status,
            percentile: Math.floor(dataItem.fill * 100) / 100,
            color: dataItem.color,
          })
          filled += dataItem.fill
        })
      },
    },
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
      const passed = _.sumBy(this.data, (value) => {
        return value?.counters.passed
      })
      const blocked = _.sumBy(this.data, (value) => {
        return value?.counters.active
      })
      const passedPercentile = Math.round((passed / hits) * 100)
      const blockedPercentile = 100 - passedPercentile
      const humans = _.sumBy(this.data, (value) => {
        return value?.counters.human
      })
      const bots = _.sumBy(this.data, (value) => {
        return value?.counters.bot
      })
      const humansPercentile = Math.round((humans / hits) * 100)
      const botsPercentile = 100 - humansPercentile
      return {
        'passed': {
          amount: passed,
          percentile: passedPercentile,
          topCountries: _.map(_.filter(_.orderBy(this.topCountries, ['passed'], ['desc']), (topCountry) => {
            return topCountry.passed > 0
          }), (topCountry) => {
            return topCountry.rowIdentification
          }),
        },
        'blocked': {
          amount: blocked,
          percentile: blockedPercentile,
          topCountries: _.map(_.filter(_.orderBy(this.topCountries, ['blocked'], ['desc']), (topCountry) => {
            return topCountry.blocked > 0
          }), (topCountry) => {
            return topCountry.rowIdentification
          }),
        },
        'humans': {
          amount: humans,
          percentile: humansPercentile,
        },
        'bots': {
          amount: bots,
          percentile: botsPercentile,
        },
      }
    },

    trafficChartData(): GenericObject[] {
      const returnArray = []
      for (const dataItem of this.data) {
        const hits = dataItem.counters.hits
        const passed = dataItem.counters.passed
        const blocked = dataItem.counters.active
        const reported = dataItem.counters.reported
        const humans = dataItem.counters.human
        const bots = dataItem.counters.bot
        returnArray.push({
          timeframe: Math.floor(new Date(dataItem['timestamp']).getTime() / 1000),
          hits: hits > 0 ? hits : 0,
          passed: passed > 0 ? passed : 0,
          blocked: blocked > 0 ? blocked : 0,
          reported: reported > 0 ? reported : 0,
          humans: humans > 0 ? humans : 0,
          bots: bots > 0 ? bots : 0,
        })
      }
      return returnArray
    },

    statusesChartData(): GenericObject[] {
      const returnArray = []
      if (this.statusesClassDetails) {
        const existingStatusKeys = _.uniq(_.flatMap(this.data, (dataItem) => {
          return _.map(dataItem.counters.status_classes, 'key') || []
        })).sort()
        for (const dataItem of this.data) {
          const statusesObject: GenericObject = {
            'timeframe': Math.floor(new Date(dataItem['timestamp']).getTime() / 1000),
          }
          for (const statusKey of existingStatusKeys) {
            const statusClass = _.find(dataItem.counters.status_classes, (statusClass) => {
              return statusClass.key === statusKey
            })
            statusesObject[`${statusKey}xx`] = statusClass?.value > 0 ? statusClass.value : 0
          }
          returnArray.push(statusesObject)
        }
      } else {
        const existingStatusKeys = _.uniq(_.flatMap(this.data, (dataItem) => {
          return _.map(dataItem.counters.status, 'key') || []
        })).sort()
        for (const dataItem of this.data) {
          const statusesObject: GenericObject = {
            'timeframe': Math.floor(new Date(dataItem['timestamp']).getTime() / 1000),
          }
          for (const statusKey of existingStatusKeys) {
            const status = _.find(dataItem.counters.status, (status) => {
              return status.key === statusKey
            })
            statusesObject[statusKey] = status?.value > 0 ? status.value : 0
          }
          returnArray.push(statusesObject)
        }
      }
      return returnArray
    },

    statusesChartSeriesOptions(): SeriesOptions[] {
      const emptySeriesOption: SeriesOptions = {
        title: '',
        fieldName: '',
        show: true,
        drawStyle: 'spline',
        fillColor: '',
        strokeColor: '',
      }
      const statusKeys = _.uniq(_.flatMap(this.statusesChartData, (statusesChartDataItem) => {
        return _.keys(statusesChartDataItem)
      })).filter((key) => key !== 'timeframe')
      const returnArray = []
      for (const key of statusKeys) {
        const seriesOption = _.cloneDeep(emptySeriesOption)
        seriesOption.title = key
        seriesOption.fieldName = key
        seriesOption.fillColor = `rgba(${Utils.hexToRgbArray(this.getStatusColor(key)).join(', ')}, 0.1)`
        seriesOption.strokeColor = this.getStatusColor(key)
        returnArray.push(seriesOption)
      }
      return returnArray
    },

    topTargetApps(): topTableData[] {
      const returnArray = []
      const groupedObject = _.groupBy(this.data, 'secpolid')
      for (const appId of Object.keys(groupedObject)) {
        const passed = _.sumBy(groupedObject[appId], (item) => item.counters.passed)
        const blocked = _.sumBy(groupedObject[appId], (item) => item.counters.active)
        const reported = _.sumBy(groupedObject[appId], (item) => item.counters.reported)
        returnArray.push({
          rowIdentification: appId,
          passed: passed > 0 ? passed : 0,
          blocked: blocked > 0 ? blocked : 0,
          reported: reported > 0 ? reported : 0,
        })
      }
      return returnArray
    },

    topTargetUris(): topTableData[] {
      return this.buildTopDataFromCounters('top_uri_active', 'top_uri_passed', 'top_uri_reported')
    },

    topTargetRTCs(): topTableData[] {
      return this.buildTopDataFromCounters('top_rtc_active', 'top_rtc_passed', 'top_rtc_reported')
    },

    topCountries(): topTableData[] {
      return this.buildTopDataFromCounters('top_country_active', 'top_country_passed', 'top_country_reported')
    },

    topASNumbers(): topTableData[] {
      return this.buildTopDataFromCounters('top_asn_active', 'top_asn_passed', 'top_asn_reported')
    },

    topIPAddresses(): topTableData[] {
      return this.buildTopDataFromCounters('top_ip_active', 'top_ip_passed', 'top_ip_reported')
    },

    topRateLimits(): topTableData[] {
      return this.buildTopDataFromCounters('top_rl_active', 'top_rl_passed', 'top_rl_reported')
    },

    topACLs(): topTableData[] {
      return this.buildTopDataFromCounters('top_aclid_active', 'top_aclid_passed', 'top_aclid_reported')
    },

    topContentFilters(): topTableData[] {
      return this.buildTopDataFromCounters('top_ruleid_active', 'top_ruleid_passed', 'top_ruleid_reported')
    },

    topUserAgents(): topTableData[] {
      return this.buildTopDataFromCounters('top_user_agent_active', 'top_user_agent_passed', 'top_user_agent_reported')
    },

    topTags(): topTableData[] {
      return this.buildTopDataFromCounters('top_tags_active', 'top_tags_passed', 'top_tags_reported')
    },
  },
  methods: {
    toggleStatusesClassDetails() {
      this.statusesClassDetails = !this.statusesClassDetails
    },

    buildTopDataFromCounters(blocksFieldName: string, passedFieldName: string, reportedFieldName: string) {
      const returnArray = []
      const groupedObject: { [key: string]: topTableData } = {}
      this.data.forEach((item) => {
        if (item.counters[blocksFieldName]) {
          for (const blockedItem of item.counters[blocksFieldName]) {
            const escapedKey = _.escape(blockedItem.key)
            if (!groupedObject[escapedKey]) {
              groupedObject[escapedKey] = {}
            }
            groupedObject[escapedKey].blocked = groupedObject[escapedKey].blocked || 0
            groupedObject[escapedKey].blocked += blockedItem.value || 0
          }
        }
        if (item.counters[passedFieldName]) {
          for (const passedItem of item.counters[passedFieldName]) {
            const escapedKey = _.escape(passedItem.key)
            if (!groupedObject[escapedKey]) {
              groupedObject[escapedKey] = {}
            }
            groupedObject[escapedKey].passed = groupedObject[escapedKey].passed || 0
            groupedObject[escapedKey].passed += passedItem.value || 0
          }
        }
        if (item.counters[reportedFieldName]) {
          for (const reportededItem of item.counters[reportedFieldName]) {
            const escapedKey = _.escape(reportededItem.key)
            if (!groupedObject[escapedKey]) {
              groupedObject[escapedKey] = {}
            }
            groupedObject[escapedKey].reported = groupedObject[escapedKey].reported || 0
            groupedObject[escapedKey].reported += reportededItem.value || 0
          }
        }
      })
      for (const key of Object.keys(groupedObject)) {
        returnArray.push({
          rowIdentification: key,
          passed: groupedObject[key].passed > 0 ? groupedObject[key].passed : 0,
          blocked: groupedObject[key].blocked > 0 ? groupedObject[key].blocked : 0,
          reported: groupedObject[key].reported > 0 ? groupedObject[key].reported : 0,
        })
      }
      return returnArray
    },

    amountSuffixFormatter(value: number) {
      return Utils.amountSuffixFormatter(value)
    },

    getStatusColor(status: string) {
      for (const [key, value] of Object.entries(STATUS_COLORS)) {
        if (status.startsWith(key)) {
          return value
        }
      }
      return `#000`
    },
  },
})
</script>
<style scoped
       lang="scss">
@import 'src/assets/styles/colors';

.country-flags-wrapper {
  position: absolute;
}

.flag {
  border: 1px solid #000;
  margin: -0.9em -1.1em;
}

.status-legend-wrapper {
  overflow-y: auto;
}

.status-marker {
  height: 1rem;
  margin-right: 4px;
  vertical-align: text-bottom;
  width: 1rem;
}
</style>
