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
            <rbz-date-picker @update:date="date = $event"
                             ref="rbzDatePicker"
                             class="mb-3"/>
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
          {{ data.length }} EVENTS
          <span v-if="groupBy.length"
                class="group-by-label">
            {{ groupedByLabel }}
            <span class="is-clickable px-1"
                  @click="clearGroupByProperty()">
              <i class="fas fa-times"></i>
            </span>
          </span>
          <span v-else>
            ungrouped by any category
          </span>
        </div>
      </div>
    </div>
    <div v-show="!isSearchLoading && data?.length > 0">
      <events-log-charts :data="data"
                         class="mb-3"/>
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
import {Dictionary, EventLog, GenericObject} from '@/types'
import _ from 'lodash'
import EventsLogRow from '@/components/EventsLogRow.vue'
import EventsLogCharts from '@/components/EventsLogCharts.vue'
import RbzDatePicker from '@/components/RbzDatePicker.vue'

export default defineComponent({
  name: 'EventsLog',
  components: {
    RbzDatePicker,
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
      date: [null, null],
      isSearchLoading: false,
      showFullGroupIndexes: [],
      addToSummaryProperty: null,
      addToSummaryInnerIdentifier: null,
    }
  },
  computed: {
    groupedData(): Dictionary<EventLog[]> {
      if (this.groupBy.length === 2) {
        return _.groupBy(this.data, (dataItem: EventLog) => {
          const propertyValue: any = dataItem[this.groupBy[0] as keyof EventLog]
          if (this.groupBy[0] === 'tags') {
            const splitTag = this.groupBy[1].split(/:/)
            if (splitTag.length < 2) {
              return this.groupBy[1]
            }
            const tagPrefix = splitTag.shift()
            const dataItemTag = _.find(propertyValue, (tag: string) => {
              return tag.startsWith(tagPrefix)
            })
            const dataItemSplitTag = dataItemTag.split(/:/)
            dataItemSplitTag.shift()
            return dataItemSplitTag.join(':')
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
      let groupByText = ''
      if (this.groupBy[1]) {
        let value = this.groupBy[1].toUpperCase()
        if (this.groupBy[0] === 'tags') {
          const splitTag = value.split(/:/)
          value = splitTag.shift()
        }
        groupByText += `${value} `
      }
      groupByText += this.groupBy[0].toUpperCase()
      // Drop the last plural characters (S) from nested grouping (headers -> header, etc.)
      if (this.groupBy[1]) {
        groupByText = groupByText.slice(0, -1)
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
        if (filter) {
          // Extract data from filter
          const splitFilter = filter.split(/:/)
          const filterObject: GenericObject = {
            field: splitFilter.shift(),
            value: splitFilter.join(':'),
            op: 'regex',
          }
          // Negative check
          const isNegative = filterObject['value'].startsWith('!')
          if (isNegative) {
            filterObject['value'] = filterObject['value'].substring(1)
          }
          // Nested check
          const isNested = _.some([
            'arguments',
            'cookies',
            'curiesession_ids',
            'headers',
            'proxy',
            'security_config',
            'trigger_counters',
          ], (operatorName) => {
            return filterObject['field'].startsWith(operatorName)
          })
          if (isNested) {
            const splitField = filterObject.field.split(/_/)
            let field = splitField.shift()
            if (['curiesession', 'security', 'trigger'].includes(field)) {
              field = `${field}_${splitField.shift()}`
            }
            const key = splitField.join('_')
            filterObject['field'] = field
            filterObject['key'] = key
          }
          // Number check
          const isNumber = ['response_code', 'trigger_counters'].includes(filterObject['field'])
          if (isNumber) {
            filterObject['op'] = 'eq'
            filterObject['value'] = Number(filterObject['value'])
          } else {
            // URI encoding
            if (filterObject['field'] === 'uri') {
              filterObject['value'] = encodeURI(filterObject['value'])
            }
            filterObject['value'] = this.escapeRegex(filterObject['value'] as string)
          }
          if (isNegative) {
            filterObject['op'] = `not ${filterObject['op']}`
          }
          queryJson['AND'].push(filterObject)
        }
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
      this.$refs.rbzDatePicker.resetDateToDefault()
      this.data = []
      this.eventsLimit = 200
      this.showFullGroupIndexes = []
      this.groupBy = []
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

    clearGroupByProperty() {
      this.groupBy = []
      this.showFullGroupIndexes = []
    },

    setGroupByProperty(groupByObject: { property: string, innerIdentifier?: string }) {
      const groupByValue = [groupByObject.property]
      if (groupByObject.innerIdentifier) {
        groupByValue.push(groupByObject.innerIdentifier)
      }
      this.groupBy = _.isEqual(this.groupBy, groupByValue) ? [] : groupByValue
      this.showFullGroupIndexes = []
    },
  },
  async mounted() {
    await this.loadData()
  },
})
</script>
<style scoped
       lang="scss">
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

.group-by-label {
  background-color: $color-alto;
  border: 1px solid $color-white;
  border-radius: 10px;
  padding: 0.25rem 0.5rem;
  width: fit-content;
}
</style>
