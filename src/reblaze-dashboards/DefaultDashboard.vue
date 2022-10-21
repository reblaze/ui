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
                  {{ data.topCountries.length > 3 ? `+${data.topCountries.length - 3}` : '' }}
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
          <label class="label is-small is-clickable"
                 @click="toggleStatusesClassDetails">
            Response Status {{ statusesClassDetails ? 'Classes' : '' }}
          </label>
          <rbz-chart :data="statusesChartData"
                     :series-options="statusesChartSeriesOptions"
                     :legend-as-tooltip="true"
                     :chart-height="150">
          </rbz-chart>
        </div>
      </div>
      <div class="column width-200px">
        <div class="height-200px is-flex is-justify-content-space-around has-text-centered">
          <div>
            Humans
            <div class="bar-wrapper height-130px">
              <div class="humans-bar width-60px"
                   :title="`${trafficInfo.humans.percentile}% humans`"
                   :style="`height: ${trafficInfo.humans.percentile}%`">
              </div>
              <div class="bots-bar width-60px"
                   :title="`${trafficInfo.bots.percentile}% bots`"
                   :style="`height: ${trafficInfo.bots.percentile}%`">
              </div>
            </div>
            Bots
          </div>
          <div>
            Passed
            <div class="bar-wrapper height-130px">
              <div class="passed-bar width-60px"
                   :title="`${trafficInfo.passed.percentile}% passed`"
                   :style="`height: ${trafficInfo.passed.percentile}%`">
              </div>
              <div class="blocked-bar width-60px"
                   :title="`${trafficInfo.blocked.percentile}% blocked`"
                   :style="`height: ${trafficInfo.blocked.percentile}%`">
              </div>
            </div>
            Blocked
          </div>
        </div>
        <div class="height-200px">
          <svg id="doughnut"
               width="100%"
               height="100%"
               viewBox="0 0 100 100">
          </svg>
        </div>
      </div>
    </div>
    <!--First tables row-->
    <div class="columns">
      <div class="column is-4">
        <rbz-table :columns="topTableColumns"
                   :data="topTargetApps"
                   :default-sort-column-index="1"
                   :use-scroll="true"
                   :rows-per-page="5"
                   default-sort-column-direction="desc"
                   table-title="TOP TARGETED SERVICES/APPS">
        </rbz-table>
      </div>
      <div class="column is-4">
        <rbz-table :columns="topTableColumns"
                   :data="topTargetUris"
                   :default-sort-column-index="1"
                   :use-scroll="true"
                   :rows-per-page="5"
                   default-sort-column-direction="desc"
                   table-title="TOP TARGETED URLs">
        </rbz-table>
      </div>
      <div class="column is-4">
        <rbz-table :columns="topTableColumnsTagPrefixRemoved"
                   :data="topTargetRTCs"
                   :default-sort-column-index="1"
                   :use-scroll="true"
                   :rows-per-page="5"
                   default-sort-column-direction="desc"
                   table-title="TOP TARGETED RTCs">
        </rbz-table>
      </div>
    </div>
    <!--Second tables row-->
    <div class="columns">
      <div class="column is-4">
        <rbz-table :columns="topTableColumnsTagPrefixRemoved"
                   :data="topCountries"
                   :default-sort-column-index="1"
                   :use-scroll="true"
                   :rows-per-page="5"
                   default-sort-column-direction="desc"
                   table-title="TOP COUNTRIES">
        </rbz-table>
      </div>
      <div class="column is-4">
        <rbz-table :columns="topTableColumnsTagPrefixRemoved"
                   :data="topASNumbers"
                   :default-sort-column-index="1"
                   :use-scroll="true"
                   :rows-per-page="5"
                   default-sort-column-direction="desc"
                   table-title="TOP AS NUMBERS">
        </rbz-table>
      </div>
      <div class="column is-4">
        <rbz-table :columns="topTableColumns"
                   :data="topIPAddresses"
                   :default-sort-column-index="1"
                   :use-scroll="true"
                   :rows-per-page="5"
                   default-sort-column-direction="desc"
                   table-title="TOP IP ADDRESSES">
        </rbz-table>
      </div>
    </div>
    <!--Third tables row-->
    <div class="columns">
      <div class="column is-4">
        <rbz-table :columns="topTableColumnsTagPrefixRemoved"
                   :data="topRateLimits"
                   :default-sort-column-index="1"
                   :use-scroll="true"
                   :rows-per-page="5"
                   default-sort-column-direction="desc"
                   table-title="TOP RATE LIMITS">
        </rbz-table>
      </div>
      <div class="column is-4">
        <rbz-table :columns="topTableColumnsTagPrefixRemoved"
                   :data="topACLs"
                   :default-sort-column-index="1"
                   :use-scroll="true"
                   :rows-per-page="5"
                   default-sort-column-direction="desc"
                   table-title="TOP ACLs">
        </rbz-table>
      </div>
      <div class="column is-4">
        <rbz-table :columns="topTableColumnsTagPrefixRemoved"
                   :data="topContentFilters"
                   :default-sort-column-index="1"
                   :use-scroll="true"
                   :rows-per-page="5"
                   default-sort-column-direction="desc"
                   table-title="TOP CONTENT FILTERS">
        </rbz-table>
      </div>
    </div>
    <!--Fourth tables row-->
    <div class="columns">
      <div class="column is-4">
        <rbz-table :columns="topTableColumns"
                   :data="topUserAgents"
                   :default-sort-column-index="1"
                   :use-scroll="true"
                   :rows-per-page="5"
                   default-sort-column-direction="desc"
                   table-title="TOP USER AGENT">
        </rbz-table>
      </div>
      <div class="column is-4">
        <rbz-table :columns="topTableColumns"
                   :data="topTags"
                   :default-sort-column-index="1"
                   :use-scroll="true"
                   :rows-per-page="5"
                   default-sort-column-direction="desc"
                   table-title="TOP TAGS">
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

const STATUS_COLORS = {
  '1': '#02a4d3', // $color-cerulean
  '2': '#06c', // $color-science-blue
  '3': '#4169e1', // $color-royal-blue
  '4': '#f34723', // $color-pomegranate
  '5': '#ff355e', // $color-radical-red
}

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
        classes: 'width-80px ellipsis',
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
          strokeColor: '#50c878', // $color-emerald
        },
        {
          title: 'Blocked',
          fieldName: 'blocked',
          show: true,
          drawStyle: 'line',
          strokeColor: '#ff355e', // $color-radical-red
        },
        {
          title: 'Report',
          fieldName: 'report',
          show: true,
          drawStyle: 'line',
          strokeColor: '#ffdb58', // $color-mustard
        },
        {
          title: 'Humans',
          fieldName: 'humans',
          show: true,
          drawStyle: 'line',
          strokeColor: '#4169e1', // $color-royal-blue
        },
        {
          title: 'Bots',
          fieldName: 'bots',
          show: true,
          drawStyle: 'line',
          strokeColor: '#843179', // $color-plum
        },
      ] as SeriesOptions[],
      statusesClassDetails: true,
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
        const data = []
        for (const [key, value] of Object.entries(totals)) {
          data.push({
            status: key,
            fill: (value / _.sum(Object.values(totals))) * 100,
            color: this.getStatusColor(key),
          })
        }
        const svgDoughnut = document.querySelector('#doughnut')
        svgDoughnut.innerHTML = ''
        let filled = 0
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
          const circleTooltip = document.createElementNS('http://www.w3.org/2000/svg', 'title')
          circleTooltip.innerHTML = `${dataItem.status}: ${dataItem.fill}%`
          circle.appendChild(circleTooltip)
          svgDoughnut.appendChild(circle)
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
      const blocked = _.sumBy(this.data, (value) => {
        return value?.counters.blocks
      })
      const passed = hits - blocked
      const passedPercentile = (Math.round((passed / hits) * 1e2) / 1e2) * 100
      const blockedPercentile = 100 - passedPercentile
      const humans = _.sumBy(this.data, (value) => {
        return value?.counters.human
      })
      const bots = _.sumBy(this.data, (value) => {
        return value?.counters.bot
      })
      const humansPercentile = (Math.round((humans / hits) * 1e2) / 1e2) * 100
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
        const passed = dataItem.counters.hits - dataItem.counters.blocks
        const blocked = dataItem.counters.blocks
        const report = dataItem.counters.report
        const humans = dataItem.counters.human
        const bots = dataItem.counters.bot
        returnArray.push({
          timeframe: Math.floor(new Date(dataItem['timestamp']).getTime() / 1000),
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
      if (this.statusesClassDetails) {
        for (const dataItem of this.data) {
          const statusesObject: GenericObject = {
            'timeframe': Math.floor(new Date(dataItem['timestamp']).getTime() / 1000),
          }
          for (const statusClass of dataItem.counters.status_classes) {
            statusesObject[`${statusClass.key}xx`] = statusClass.value > 0 ? statusClass.value : 0
          }
          returnArray.push(statusesObject)
        }
      } else {
        for (const dataItem of this.data) {
          const statusesObject: GenericObject = {
            'timeframe': Math.floor(new Date(dataItem['timestamp']).getTime() / 1000),
          }
          for (const status of dataItem.counters.status) {
            statusesObject[status.key] = status.value > 0 ? status.value : 0
          }
          returnArray.push(statusesObject)
        }
      }
      return returnArray
    },

    statusesChartSeriesOptions(): SeriesOptions[] {
      const seriesOption: SeriesOptions = {
        title: '',
        fieldName: '',
        show: true,
        drawStyle: 'line',
        strokeColor: '',
      }
      const statusKeys = _.uniq(_.flatMap(this.statusesChartData, (statusesChartDataItem) => {
        return _.keys(statusesChartDataItem)
      })).filter((key) => key !== 'timeframe')
      const returnArray = []
      for (const key of statusKeys) {
        seriesOption.title = key
        seriesOption.fieldName = key
        seriesOption.strokeColor = this.getStatusColor(key)
        returnArray.push(seriesOption)
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
      return this.buildTopDataFromCounters('top_blocked_country', 'top_passed_country', 'top_reported_country')
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
    toggleStatusesClassDetails() {
      this.statusesClassDetails = !this.statusesClassDetails
    },

    buildTopDataFromCounters(blocksFieldName: string, passedFieldName: string, reportFieldName: string) {
      const returnArray = []
      const groupedObject: { [key: string]: topTableData } = {}
      this.data.forEach((item) => {
        if (item.counters[blocksFieldName]) {
          for (const blockedItem of item.counters[blocksFieldName]) {
            if (!groupedObject[blockedItem.key]) {
              groupedObject[blockedItem.key] = {}
            }
            groupedObject[blockedItem.key].blocked = groupedObject[blockedItem.key].blocked || 0
            groupedObject[blockedItem.key].blocked += blockedItem.value || 0
          }
        }
        if (item.counters[passedFieldName]) {
          for (const passedItem of item.counters[passedFieldName]) {
            if (!groupedObject[passedItem.key]) {
              groupedObject[passedItem.key] = {}
            }
            groupedObject[passedItem.key].passed = groupedObject[passedItem.key].passed || 0
            groupedObject[passedItem.key].passed += passedItem.value || 0
          }
        }
        if (item.counters[reportFieldName]) {
          for (const reportedItem of item.counters[reportFieldName]) {
            if (!groupedObject[reportedItem.key]) {
              groupedObject[reportedItem.key] = {}
            }
            groupedObject[reportedItem.key].report = groupedObject[reportedItem.key].report || 0
            groupedObject[reportedItem.key].report += reportedItem.value || 0
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

.traffic-info:not(:last-child) {
  margin-bottom: 25px;
}

.flag {
  border: 1px solid #000;
  margin: -0.9em -1.1em;
}

.humans-bar {
  background-color: $color-royal-blue;
}

.bots-bar {
  background-color: $color-plum;
}

.passed-bar {
  background-color: $color-emerald;
}

.blocked-bar {
  background-color: $color-radical-red;
}
</style>
