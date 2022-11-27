<!-- <template>
  <div class="columns height-200px">
    <div class="column">
      <label class="label is-small">
        Traffic Info
      </label>
      <rbz-chart :data="trafficChartData"
                 :series-options="trafficChartSeriesOptions"
                 :legend-as-tooltip="true"
                 :chart-height="150">
      </rbz-chart>
    </div>
    <div class="column width-200px">
      <div class="height-200px is-flex is-justify-content-space-around has-text-centered">
        <div class="bar-wrapper height-150px">
          <div class="bar humans-bar has-text-weight-bold width-60px"
               :title="`${trafficInfo.humans.percentile}% humans`"
               :style="`height: ${trafficInfo.humans.percentile}%`">
            <span v-if="trafficInfo.humans.percentile >= 10">
              Humans
            </span>
          </div>
          <div class="bar bots-bar has-text-weight-bold width-60px"
               :title="`${trafficInfo.bots.percentile}% bots`"
               :style="`height: ${trafficInfo.bots.percentile}%`">
            <span v-if="trafficInfo.bots.percentile >= 10">
              Bots
            </span>
          </div>
        </div>
        <div class="bar-wrapper height-150px">
          <div class="bar passed-bar has-text-weight-bold width-60px"
               :title="`${trafficInfo.passed.percentile}% passed`"
               :style="`height: ${trafficInfo.passed.percentile}%`">
            <span v-if="trafficInfo.passed.percentile >= 10">
              Passed
            </span>
          </div>
          <div class="bar report-bar has-text-weight-bold width-60px"
               :title="`${trafficInfo.report.percentile}% report`"
               :style="`height: ${trafficInfo.report.percentile}%`">
            <span v-if="trafficInfo.report.percentile >= 10">
              Report
            </span>
          </div>
          <div class="bar blocked-bar has-text-weight-bold width-60px"
               :title="`${trafficInfo.blocked.percentile}% blocked`"
               :style="`height: ${trafficInfo.blocked.percentile}%`">
            <span v-if="trafficInfo.blocked.percentile >= 10">
              Blocked
            </span>
          </div>
        </div>
      </div>
    </div>
    <div class="column width-200px">
      <span class="has-text-weight-bold">
        UNIQUES
      </span>
      <hr class="mt-1 mb-2">
      <span class="width-50pct is-inline-block">
        SESSIONS
      </span>
      <span class="width-50pct is-inline-block has-text-weight-bold">
        {{ uniquesInfo.sessions }}
      </span>
      <hr class="mt-1 mb-2">
      <span class="width-50pct is-inline-block">
        IPs
      </span>
      <span class="width-50pct is-inline-block has-text-weight-bold">
        {{ uniquesInfo.ips }}
      </span>
      <hr class="mt-1 mb-2">
      <span class="width-50pct is-inline-block">
        ASNs
      </span>
      <span class="width-50pct is-inline-block has-text-weight-bold">
        {{ uniquesInfo.asns }}
      </span>
      <hr class="mt-1 mb-2">
      <span class="width-50pct is-inline-block">
        URIs
      </span>
      <span class="width-50pct is-inline-block has-text-weight-bold">
        {{ uniquesInfo.uris }}
      </span>
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
          title: 'Report',
          fieldName: 'report',
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
      const sortedDataGroupedBySecond = _.groupBy(sortedData, (event: EventLog) => {
        return event.timestamp.split('.')[0]
      })
      _.forEach(sortedDataGroupedBySecond, (events: EventLog[], key: string) => {
        const passed = _.filter(events, (event: EventLog) => {
          return !this.isEventReport(event) && !event.reason
        })
        const report = _.filter(events, (event: EventLog) => {
          return this.isEventReport(event)
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
          timeframe: Math.floor(new Date(key).getTime() / 1000),
          passed: passed.length > 0 ? passed.length : 0,
          blocked: blocked.length > 0 ? blocked.length : 0,
          report: report.length > 0 ? report.length : 0,
          humans: humans.length > 0 ? humans.length : 0,
          bots: bots.length > 0 ? bots.length : 0,
        })
      })
      return returnArray
    },

    trafficInfo() {
      const hits = this.data.length
      const passed = _.filter(this.data, (event: EventLog) => {
        return !this.isEventReport(event) && !event.reason
      })
      const report = _.filter(this.data, (event: EventLog) => {
        return this.isEventReport(event)
      })
      const blocked = _.filter(this.data, (event: EventLog) => {
        return !!event.reason
      })
      const passedPercentile = Number(((passed.length / hits) * 100).toFixed(2))
      const reportPercentile = Number(((report.length / hits) * 100).toFixed(2))
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
        'report': {
          amount: report.length,
          percentile: reportPercentile,
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
    isEventReport(event: EventLog): boolean {
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
  flex-direction: column;
  justify-content: center;
}

.humans-bar {
  background-color: $color-royal-blue;
  color: $color-white;
}

.bots-bar {
  background-color: $color-plum;
  color: $color-white;
}

.passed-bar {
  background-color: $color-emerald;
}

.report-bar {
  background-color: $color-mustard;
}

.blocked-bar {
  background-color: $color-radical-red;
}
</style>
 -->
