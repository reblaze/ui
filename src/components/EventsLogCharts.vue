<template>
  <div class="columns height-250px">
    <div class="column">
      <label class="label is-small">
        Traffic Info
      </label>
      <rbz-chart :data="trafficChartData"
                 :series-options="trafficChartSeriesOptions"
                 :legend-as-tooltip="true"
                 :chart-height="200">
      </rbz-chart>
    </div>
    <div class="column width-230px">
      <div class="uniques-wrapper height-100px mb-3">
        <span class="has-text-weight-bold">
          UNIQUES
        </span>
        <hr class="my-0">
        <span class="width-50pct is-inline-block">
          SESSIONS
        </span>
        <span class="width-50pct is-inline-block has-text-weight-bold">
          {{ uniquesInfo.sessions }}
        </span>
        <hr class="my-0">
        <span class="width-50pct is-inline-block">
          IPs
        </span>
        <span class="width-50pct is-inline-block has-text-weight-bold">
          {{ uniquesInfo.ips }}
        </span>
        <hr class="my-0">
        <span class="width-50pct is-inline-block">
          ASNs
        </span>
        <span class="width-50pct is-inline-block has-text-weight-bold">
          {{ uniquesInfo.asns }}
        </span>
        <hr class="my-0">
        <span class="width-50pct is-inline-block">
          URIs
        </span>
        <span class="width-50pct is-inline-block has-text-weight-bold">
          {{ uniquesInfo.uris }}
        </span>
      </div>
      <div class="bar-wrapper mb-3">
        <div class="bar humans-bar has-text-weight-bold is-inline-block height-1rem"
             :title="`${trafficInfo.humans.percentile}% humans`"
             :style="`width: ${trafficInfo.humans.percentile}%`">
        </div>
        <div class="bar bots-bar has-text-weight-bold is-inline-block height-1rem"
             :title="`${trafficInfo.bots.percentile}% bots`"
             :style="`width: ${trafficInfo.bots.percentile}%`">
        </div>
        <span class="legend is-flex is-justify-content-space-between">
          <span :title="`${trafficInfo.humans.percentile}% humans`">
            <span class="square humans-legend"></span>
            Humans
          </span>
          <span :title="`${trafficInfo.bots.percentile}% bots`">
            <span class="square bots-legend"></span>
            Bots
          </span>
        </span>
      </div>
      <div class="bar-wrapper">
        <div class="bar passed-bar has-text-weight-bold is-inline-block height-1rem"
             :title="`${trafficInfo.passed.percentile}% passed`"
             :style="`width: ${trafficInfo.passed.percentile}%`">
        </div>
        <div class="bar reported-bar has-text-weight-bold is-inline-block height-1rem"
             :title="`${trafficInfo.reported.percentile}% reported`"
             :style="`width: ${trafficInfo.reported.percentile}%`">
        </div>
        <div class="bar blocked-bar has-text-weight-bold is-inline-block height-1rem"
             :title="`${trafficInfo.blocked.percentile}% blocked`"
             :style="`width: ${trafficInfo.blocked.percentile}%`">
        </div>
        <span class="legend is-flex is-justify-content-space-between">
          <span :title="`${trafficInfo.passed.percentile}% passed`">
            <span class="square passed-legend"></span>
            Passed
          </span>
          <span :title="`${trafficInfo.reported.percentile}% reported`">
            <span class="square reported-legend"></span>
            Reported
          </span>
          <span :title="`${trafficInfo.blocked.percentile}% blocked`">
            <span class="square blocked-legend"></span>
            Blocked
          </span>
        </span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent, PropType} from 'vue'
import {EventLog, GenericObject} from '@/types'
import _ from 'lodash'
import RbzChart, {SeriesOptions} from '@/components/RbzChart.vue'
import Utils from '@/assets/Utils'

export default defineComponent({
  name: 'EventsLogCharts',
  components: {
    RbzChart,
  },
  props: {
    data: Array as PropType<EventLog[]>,
  },
  data() {
    return {
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
    }
  },
  computed: {
    trafficChartData(): GenericObject[] {
      const returnArray: GenericObject[] = []
      const sortedData = _.sortBy(this.data, 'timestamp')
      if (!sortedData.length) {
        return []
      }
      const start = sortedData[0].timestamp
      const end = sortedData[sortedData.length - 1].timestamp
      let sortedDataGrouped
      const timeDiff = new Date(end).getTime() - new Date(start).getTime()
      if (timeDiff < 2000) { // if data contains less than 2 seconds
        sortedDataGrouped = _.groupBy(sortedData, (event: EventLog) => {
          const splitTime = event.timestamp.split('.')
          return `${splitTime[0]}.${splitTime[1].slice(0, 2)}`
        })
      } else if (timeDiff < 120000) { // if data contains less than 2 minutes
        sortedDataGrouped = _.groupBy(sortedData, (event: EventLog) => {
          return event.timestamp.split('.')[0]
        })
      } else {
        sortedDataGrouped = _.groupBy(sortedData, (event: EventLog) => {
          const time = event.timestamp.split('.')[0]
          return time.split(':').slice(0, 2).join(':')
        })
      }
      _.forEach(sortedDataGrouped, (events: EventLog[], key: string) => {
        const hits = events.length
        const passed = _.filter(events, (event: EventLog) => {
          return !this.isEventReported(event) && !event.reason
        })
        const reported = _.filter(events, (event: EventLog) => {
          return this.isEventReported(event)
        })
        const blocked = _.filter(events, (event: EventLog) => {
          return event.reason
        })
        const humans = _.filter(events, (event: EventLog) => {
          return event.tags.includes('human')
        })
        const bots = _.filter(events, (event: EventLog) => {
          return event.tags.includes('bot')
        })
        returnArray.push({
          timeframe: new Date(key).getTime(),
          hits: hits > 0 ? hits : 0,
          passed: passed.length > 0 ? passed.length : 0,
          blocked: blocked.length > 0 ? blocked.length : 0,
          reported: reported.length > 0 ? reported.length : 0,
          humans: humans.length > 0 ? humans.length : 0,
          bots: bots.length > 0 ? bots.length : 0,
        })
      })
      return returnArray
    },

    trafficInfo() {
      const hits = this.data.length
      const passed = _.filter(this.data, (event: EventLog) => {
        return !this.isEventReported(event) && !event.reason
      })
      const reported = _.filter(this.data, (event: EventLog) => {
        return this.isEventReported(event)
      })
      const blocked = _.filter(this.data, (event: EventLog) => {
        return !!event.reason
      })
      const passedPercentile = Number(((passed.length / hits) * 100).toFixed(2))
      const reportedPercentile = Number(((reported.length / hits) * 100).toFixed(2))
      const blockedPercentile = Number(((blocked.length / hits) * 100).toFixed(2))
      const humans = _.filter(this.data, (event: EventLog) => {
        return event.tags.includes('human')
      })
      const bots = _.filter(this.data, (event: EventLog) => {
        return event.tags.includes('bot')
      })
      const humansPercentile = Number(((humans.length / hits) * 100).toFixed(2))
      const botsPercentile = Number(((bots.length / hits) * 100).toFixed(2))
      return {
        'passed': {
          amount: passed.length,
          percentile: passedPercentile,
        },
        'reported': {
          amount: reported.length,
          percentile: reportedPercentile,
        },
        'blocked': {
          amount: blocked.length,
          percentile: blockedPercentile,
        },
        'humans': {
          amount: humans.length,
          percentile: humansPercentile,
        },
        'bots': {
          amount: bots.length,
          percentile: botsPercentile,
        },
      }
    },

    uniquesInfo() {
      const sessions = Object.keys(_.countBy(this.data, (event: EventLog) => {
        return event.curiesession
      })).length
      const ips = Object.keys(_.countBy(this.data, (event: EventLog) => {
        return event.ip
      })).length
      const asns = Object.keys(_.countBy(this.data, (event: EventLog) => {
        return event.tags.find((tag) => {
          return tag.startsWith('geo-asn:')
        })
      })).length
      const uris = Object.keys(_.countBy(this.data, (event: EventLog) => {
        return event.uri
      })).length
      return {
        'sessions': sessions,
        'ips': ips,
        'asns': asns,
        'uris': uris,
      }
    },
  },
  methods: {
    isEventReported(event: EventLog): boolean {
      const triggers = _.sum([
        event.acl_triggers?.length,
        event.content_filter_triggers?.length,
        event.global_filter_triggers?.length,
        event.rate_limit_triggers?.length,
      ])
      return !event.reason && triggers > 0
    },
  },
})
</script>
<style scoped
       lang="scss">
@import 'src/assets/styles/colors';

.bar {
  display: flex;
  flex-direction: row;
  justify-content: center;
}

.humans-bar,
.humans-legend {
  background-color: $color-royal-blue;
  color: $color-white;
}

.bots-bar,
.bots-legend {
  background-color: $color-plum;
  color: $color-white;
}

.passed-bar,
.passed-legend {
  background-color: $color-emerald;
}

.reported-bar,
.reported-legend {
  background-color: $color-mustard;
}

.blocked-bar,
.blocked-legend {
  background-color: $color-radical-red;
}
</style>
