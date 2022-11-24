<template>
  <div class="events-log-wrapper card-content is-fullwidth is-size-7">
    <div class="media mb-0 filter-wrapper">
      <div class="media-content">
        <div class="field is-grouped">
          <div class="control search-wrapper">
            <textarea class="textarea is-small is-fullwidth filter-textarea"
                      v-model="searchFilter"
                      rows="3"
                      placeholder="Filters, separated by a new line."/>
          </div>
          <div class="control">
            <Datepicker v-model="date"
                        range
                        enable-seconds
                        auto-apply
                        utc="preserve"
                        format="yyyy-MM-dd HH:mm"
                        input-class-name="input is-small is-size-7 width-260px date-picker-input"
                        class="mb-3"
                        :close-on-auto-apply="false"
                        :month-change-on-scroll="false"
                        :clearable="false"
                        :preset-ranges="presetRanges"
                        @open="loadPresetRanges()">
            </Datepicker>
            <div class="select is-small is-fullwidth">
              <select data-qa="events-limit-dropdown"
                      title="Events limit"
                      v-model="eventsLimit"
                      class="branch-selection">
                <option v-for="limitOption in eventsLimitOptions"
                        :key="limitOption"
                        :value="limitOption">
                  Last {{ limitOption }} Events
                </option>
              </select>
            </div>
          </div>
          <div class="control">
            <div class="control">
              <button class="button is-small search-button width-80px mb-3"
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
            </div>
            <div class="control">
              <button class="button is-small clear-search-button width-80px"
                      @click="clear()"
                      title="Clear filter"
                      data-qa="clear-search-button">
                <span class="icon is-small">
                  <i class="fas fa-times"></i>
                </span>
                <span>
                  Clear
                </span>
              </button>
            </div>
          </div>
        </div>
        <div v-if="!isSearchLoading && data?.length > 0">
          {{ data.length }} EVENTS {{ groupedByLabel }}
        </div>
      </div>
    </div>
    <div v-show="!isSearchLoading && data?.length > 0">
      <events-log-charts :data="data"
                         class="mb-5"/>
      <template v-if="groupBy.length">
        <div v-for="(group, groupKey, groupIndex) in groupedData"
             :key="groupIndex"
             class="is-fullwidth grouped-events-wrapper">
          <events-log-row :event="group[0]"
                          :event-index="groupIndex"
                          :group-header="!!groupBy[0]"
                          :group-length="group.length"
                          :group-property="groupBy[0]"
                          :add-to-summary-property="addToSummaryProperty"
                          :add-to-summary-inner-identifier="addToSummaryInnerIdentifier"
                          :tag-categories="tagCategories"
                          @toggle-show-full-group="toggleShowFullGroup(groupIndex)"
                          @add-filter="addFilter"
                          @add-to-summary="addToSummary"
                          @group-by="setGroupByProperty">
          </events-log-row>
          <events-log-row v-show="showFullGroupIndexes.includes(groupIndex)"
                          v-for="(event, eventIndex) in getGroupTail(group)"
                          :key="event.request_id"
                          :event="event"
                          :event-index="eventIndex"
                          :group-property="groupBy[0]"
                          :add-to-summary-property="addToSummaryProperty"
                          :add-to-summary-inner-identifier="addToSummaryInnerIdentifier"
                          :tag-categories="tagCategories"
                          @add-filter="addFilter"
                          @add-to-summary="addToSummary"
                          @group-by="setGroupByProperty">
          </events-log-row>
        </div>
      </template>
      <template v-else>
        <div class="is-fullwidth ungrouped-events-wrapper">
          <events-log-row v-for="(event, eventIndex) in data"
                          :key="event.request_id"
                          :event="event"
                          :event-index="eventIndex"
                          :group-property="groupBy[0]"
                          :add-to-summary-property="addToSummaryProperty"
                          :add-to-summary-inner-identifier="addToSummaryInnerIdentifier"
                          :tag-categories="tagCategories"
                          @add-filter="addFilter"
                          @add-to-summary="addToSummary"
                          @group-by="setGroupByProperty">
          </events-log-row>
        </div>
      </template>
    </div>
    <div v-show="isSearchLoading || !data?.length"
         class="has-text-centered is-fullwidth">
      <div v-if="isSearchLoading">
        <button class="button is-outlined is-text is-small is-loading events-log-loading">
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
import {defineComponent} from 'vue'
import RequestsUtils from '@/assets/RequestsUtils'
import Datepicker from '@vuepic/vue-datepicker'
import {Dictionary, EventLog, GenericObject, TagsNamespaceValue} from '@/types'
import _ from 'lodash'
import EventsLogRow from '@/components/EventsLogRow.vue'
import {AxiosResponse} from 'axios'
import EventsLogCharts from '@/components/EventsLogCharts.vue'

const MS_PER_MINUTE = 60000
const HOUR = 60 * MS_PER_MINUTE

export default defineComponent({
  name: 'EventsLog',
  components: {
    Datepicker,
    EventsLogCharts,
    EventsLogRow,
  },
  data() {
    return {
      data: [] as EventLog[],
      searchFilter: '',
      eventsLimitOptions: [200, 500, 1000, 1500, 2000, 2500],
      eventsLimit: 200,
      groupBy: [],
      date: this.getDefaultDate(),
      presetRanges: [],
      isSearchLoading: false,
      showFullGroupIndexes: [],
      addToSummaryProperty: null,
      addToSummaryInnerIdentifier: null,
      tagCategories: null as TagsNamespaceValue,
    }
  },
  computed: {
    groupedData(): Dictionary<EventLog[]> {
      if (this.groupBy.length === 2) {
        return _.groupBy(this.data, (dataItem: EventLog) => {
          const propertyValue: any = dataItem[this.groupBy[0] as keyof EventLog]
          if (this.groupBy[0] === 'tags') {
            return propertyValue.includes(this.groupBy[1])
          } else {
            return propertyValue[this.groupBy[1]]
          }
        })
      }
      return _.groupBy(this.data, this.groupBy[0])
    },

    groupedByLabel(): string {
      if (!this.groupBy.length) {
        return 'ungrouped by any category'
      }
      let groupByText = this.groupBy[0].toUpperCase()
      if (this.groupBy[1]) {
        groupByText += ` value ${this.groupBy[1].toUpperCase()}`
      }
      const groupByLength = Object.keys(this.groupedData).length
      return `grouped by ${groupByText} with ${groupByLength} UNIQUE VALUE${groupByLength > 1 ? 'S' : ''}`
    },
  },
  methods: {
    escapeRegex(input: string): string {
      if (input.indexOf('re(') === 0) {
        input = input.slice(3, -1) // getting a value from the expression re(value)
      } else {
        input = input.replace(/[,.*+?^${}()|[\]\\]/g, '\\$&') // $& means the whole matched string
      }
      return `(?i)${input}`
    },

    buildQuery() {
      const startDate = this.date[0]
      const endDate = this.date[1]
      const queryJson = {
        'AND': [
          {
            'field': 'timestamp',
            'value': [
              startDate,
              endDate,
            ],
            'op': 'between',
          },
        ] as GenericObject[],
      }
      const filters = this.searchFilter ? this.searchFilter.split('\n') : []
      filters.forEach((filter) => {
        filter = filter.trim()
        // Extract data from filter
        const splitFilter = filter.split(/:/)
        const operator = splitFilter.shift()
        let operand: string | number = splitFilter.join(':')
        let operation
        // Negative check
        const isNegative = operand.startsWith('!')
        if (isNegative) {
          operand = operand.substring(1)
        }
        // Number check
        const isNumber = ['response_code'].includes(operator)
        if (isNumber) {
          operation = 'eq'
          operand = Number(operand)
        } else {
          operation = 'regex'
          // URI encoding
          if (operator === 'uri') {
            operand = encodeURI(operand)
          }
          operand = this.escapeRegex(operand as string)
        }
        if (isNegative) {
          operation = `not ${operation}`
        }
        const filterObject = {
          'field': operator,
          'value': operand,
          'op': operation,
        }
        queryJson['AND'].push(filterObject)
      })
      return JSON.stringify(queryJson)
    },

    addFilter(filterToAdd: string) {
      const splitFilter = filterToAdd.split(/:/)
      const operator = splitFilter.shift()
      const operand = splitFilter.join(':')
      const filters: string[] = this.searchFilter ? this.searchFilter.split('\n') : []
      // If the same filter exists, do not add it again
      const filterExists = filters.some((filter) => {
        const currentSplitFilter = filter.split(/:/)
        const currentOperator = currentSplitFilter.shift()
        const currentOperand = currentSplitFilter.join(':')
        return operator === currentOperator && operand === currentOperand
      })
      if (filterExists) {
        return
      }
      filters.push(filterToAdd)
      this.searchFilter = filters.join('\n')
    },

    removeFilter(filterToRemove: string) {
      const splitFilter = filterToRemove.split(/:/)
      const operator = splitFilter.shift()
      const filters = this.searchFilter ? this.searchFilter.split('\n') : []
      // If the same filter exists, remove it
      const currentFilterIndex = filters.findIndex((filter) => {
        return filter.startsWith(operator)
      })
      if (currentFilterIndex > -1) {
        filters.splice(currentFilterIndex, 1)
      }
    },

    addToSummary(toSummaryObject: { property: string, innerIdentifier?: string }) {
      const isPropertyEqual = _.isEqual(this.addToSummaryProperty, toSummaryObject.property)
      const isIdentifierEqual = _.isEqual(this.addToSummaryInnerIdentifier, toSummaryObject.innerIdentifier)
      if (isPropertyEqual && isIdentifierEqual) {
        this.addToSummaryProperty = null
        this.addToSummaryInnerIdentifier = null
      } else {
        this.addToSummaryProperty = toSummaryObject.property
        this.addToSummaryInnerIdentifier = toSummaryObject.innerIdentifier
      }
    },

    async loadData() {
      this.isSearchLoading = true
      const query = this.buildQuery()
      const response = await RequestsUtils.sendDataLayerRequest({
        methodName: 'GET',
        url: `logs?limit=${this.eventsLimit}&filters=${query}`,
      })
      this.data = response?.data?.data?.results || []
      this.isSearchLoading = false
    },

    clear() {
      this.searchFilter = ''
      this.date = this.getDefaultDate()
      this.data = []
      this.eventsLimit = 200
      this.showFullGroupIndexes = []
      this.groupBy = []
    },

    getDefaultDate() {
      const now = new Date()
      return [new Date(now.getTime() - (HOUR / 2)).toISOString(), now.toISOString()]
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

    getGroupTail(group: EventLog[]): EventLog[] {
      return _.tail(group)
    },

    toggleShowFullGroup(index: number) {
      if (this.showFullGroupIndexes.includes(index)) {
        this.showFullGroupIndexes = this.showFullGroupIndexes.filter((groupIndex) => {
          return groupIndex !== index
        })
      } else {
        this.showFullGroupIndexes.push(index)
      }
    },

    setGroupByProperty(groupByObject: { property: string, innerIdentifier?: string }) {
      const groupByValue = [groupByObject.property]
      if (groupByObject.innerIdentifier) {
        groupByValue.push(groupByObject.innerIdentifier)
      }
      this.groupBy = _.isEqual(this.groupBy, groupByValue) ? [] : groupByValue
      this.showFullGroupIndexes = []
    },

    async loadTagCategories() {
      const response: AxiosResponse<TagsNamespaceValue> = await RequestsUtils.sendRequest({
        methodName: 'GET',
        url: `db/system/k/tags/`,
      })
      this.tagCategories = response?.data || null as TagsNamespaceValue
    },
  },
  async mounted() {
    await this.loadData()
    await this.loadTagCategories()
  },
})
</script>
<style scoped
       lang="scss">
@import 'node_modules/@vuepic/vue-datepicker/src/VueDatePicker/style/main';
@import 'src/assets/styles/colors';

.filter-wrapper {
  background: $color-white;
  height: 150px;
  margin: -1.5rem;
  padding: 1.5rem;
  position: sticky;
  top: 0;
  z-index: 11;
}

.events-log-wrapper {
  position: absolute;
}

.search-wrapper {
  /*
  (260px + 0.75rem) - width of datepicker and events dropdown + margin-right
  (80px + 0.75rem) - width of search and clear buttons + margin-right
  */
  width: calc(100% - (260px + 0.75rem) - (80px + 0.75rem));
}

.filter-textarea {
  resize: none;
}

.date-picker-input {
  padding-left: 33px;
}
</style>
