<template>
  <div>
    <!--First graphs row-->
    <div class="columns">
      <div class="column is-3">
        <div class="field">
          <label class="label is-small">
            Total Calls
          </label>
          <div class="control">
              <span>
              </span>
            <span>
              </span>
            <span>
              </span>
          </div>
        </div>
        <div v-for="(data, trendName) in totalCallsTrend"
             :key="trendName"
             class="field">
          <label class="label is-small">
            {{ trendName }}
          </label>
          <div class="control">
              <span>
              </span>
            <span>
              </span>
            <span>
              </span>
          </div>
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

type topTableData = {
  rowIdentification?: string
  passed?: number
  blocks?: number
  report?: number
}

export default defineComponent({
  name: 'ReblazeDashboardDefault',
  components: {RbzTable},
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
          classes: 'width-60px',
        },
        {
          title: 'blocked',
          fieldNames: ['blocks'],
          isSortable: true,
          classes: 'width-60px',
        },
        {
          title: 'Report',
          fieldNames: ['report'],
          isSortable: true,
          classes: 'width-60px',
        },
      ] as ColumnOptions[],
    }
  },
  computed: {
    totalCallsTrend() {
      return {
        'passed': {},
        'blocked': {},
        'humans': {},
        'bots': {},
      }
    },

    topTargetApps(): topTableData[] {
      const returnArray = []
      const groupedObject = _.groupBy(this.data, 'Appid')
      for (const appId of Object.keys(groupedObject)) {
        returnArray.push({
          rowIdentification: appId,
          passed: _.sumBy(groupedObject[appId], (item) => item['Counters'].hits - item['Counters'].blocks),
          blocks: _.sumBy(groupedObject[appId], (item) => item['Counters'].blocks),
          report: _.sumBy(groupedObject[appId], (item) => item['Counters'].report),
        })
      }
      return returnArray
    },

    topTargetUris(): topTableData[] {
      return this.buildTopDataFromCounters('top-blocked-uri', 'top-passed-uri', 'top-reported-uri')
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

    topRateLimits(): topTableData[] {
      return []
    },

    topACLs(): topTableData[] {
      return []
    },

    topContentFilters(): topTableData[] {
      return []
    },

    topUserAgents(): topTableData[] {
      return this.buildTopDataFromCounters('top-blocked-user-agent', 'top-passed-user-agent', 'top-reported-user-agent')
    },
  },
  methods: {
    buildTopDataFromCounters(blocksFieldName: string, passedFieldName: string, reportFieldName: string) {
      const returnArray = []
      const groupedObject: { [key: string]: topTableData } = {}
      this.data.forEach((item) => {
        if (item['Counters'][blocksFieldName]) {
          for (const key of Object.keys(item['Counters'][blocksFieldName])) {
            (groupedObject[key] || (groupedObject[key] = {})).blocks = groupedObject[key].blocks || 0
            groupedObject[key].blocks += item['Counters'][blocksFieldName][key] || 0
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
          passed: groupedObject[key].passed,
          blocks: groupedObject[key].blocks,
          report: groupedObject[key].report,
        })
      }
      return returnArray
    },
  },
})
</script>
<style scoped lang="scss">
</style>
