<template>
  <div class="card-content">
    <div class="content"
         v-if="quarantinedData && !loadingDocCounter">
      <rbz-table :columns="columns"
                 :data="quarantinedData"
                 :default-sort-column-index="1"
                 row-button-icon="fa-trash"
                 row-button-title="Delete"
                 row-button-class="has-text-danger"
                 :show-menu-column="true"
                 :show-filter-button="true"
                 :show-row-button="true"
                 :show-checkbox-column="true"
                 @select-array="updateSelected"
                 @row-button-clicked="deleteQuarantinedElement">
        <template #menu>
          <button class="button is-size-7 has-text-danger delete-selected-button dropdown-item"
                  title="Delete selected"
                  :class="{'disabled': !selectedArray || selectedArray.length === 0 }"
                  :disabled="!selectedArray || selectedArray.length === 0"
                  @click.stop="deleteSelectedRows">
            <span class="icon is-small">
              <i class="fas fa-trash"></i>
            </span>
            <span>
              Delete Selected
            </span>
          </button>
        </template>
      </rbz-table>
    </div>
    <div class="content no-data-wrapper"
         v-if="!selectedBranch || !quarantinedData">
      <div v-if="loadingDocCounter > 0">
        <button class="button is-outlined is-text is-small is-loading document-loading">
          Loading
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue'
import RbzTable from '@/components/RbzTable.vue'
import {ColumnOptions, Quarantined} from '@/types'
import DateTimeUtils from '@/assets/DateTimeUtils'
import RequestsUtils from '@/assets/RequestsUtils'
import {mapStores} from 'pinia'
import {useBranchesStore} from '@/stores/BranchesStore'
import _ from 'lodash'


export default defineComponent({
  name: 'QuarantinedList',
  components: {
    RbzTable,
  },
  data() {
    return {
      columns: [
        {
          title: 'Key Parameter',
          fieldNames: ['target'],
          isSortable: true,
          isSearchable: true,
          classes: 'width-130px',
          cellContentClasses: 'ellipsis',
        },
        {
          title: 'Value',
          fieldNames: ['value'],
          isSortable: true,
          isSearchable: true,
          cellContentClasses: 'ellipsis',
        },
        {
          title: 'Count',
          fieldNames: ['count'],
          isSortable: true,
          isSearchable: true,
          classes: 'width-80px',
        },
        {
          title: 'First Added',
          fieldNames: ['timestamp'],
          isSortByOriginalValue: true,
          displayFunction: (item: any) => {
            const newDate = new Date(item['timestamp'])
            const newDateMinutes = newDate.getTime()
            const timeZoneDifference = newDate.getTimezoneOffset()
            const timeZoneMinutes = timeZoneDifference * 60 * 1000
            const finalDate = new Date(newDateMinutes - timeZoneMinutes)
            return DateTimeUtils.isoToNowCuriefenseFormat(finalDate)
          },
          isSortable: true,
          isSearchable: true,
          classes: 'width-150px',
          cellContentClasses: 'ellipsis',
        },
        {
          title: 'Last Seen',
          fieldNames: ['last_seen'],
          isSortByOriginalValue: true,
          displayFunction: (item: any) => {
            const newDate = new Date(item['last_seen'] * 1000)
            return DateTimeUtils.isoToNowCuriefenseFormat(newDate)
          },
          isSortable: true,
          isSearchable: true,
          classes: 'width-150px',
          cellContentClasses: 'ellipsis',
        },
        {
          title: 'Expires',
          fieldNames: ['expires'],
          isSortByOriginalValue: true,
          displayFunction: (item: Quarantined) => {
            const dynamicRules: { id: string, name: string, ttl: number } =
              _.find(this.dynamicRulesNames, (dynamicRule) => {
                return dynamicRule.id === item.rule_id
              })
            const lastSeen = item['last_seen'] ? item['last_seen'] : 0
            const ttl = dynamicRules?.ttl ? dynamicRules?.ttl : 0
            const newDate = new Date((lastSeen + ttl) * 1000)
            return DateTimeUtils.isoToNowCuriefenseFormat(newDate) || ''
          },
          isSortable: true,
          isSearchable: true,
          classes: 'width-150px',
          cellContentClasses: 'ellipsis',
        },
        {
          title: 'Dynamic Rule',
          fieldNames: ['rule_id'],
          displayFunction: (item: Quarantined) => {
            const dynamicRules: { id: string, name: string } = _.find(this.dynamicRulesNames, (dynamicRule) => {
              return dynamicRule.id === item.rule_id
            })
            return dynamicRules?.name.trim() || ''
          },
          isSortable: true,
          isSearchable: true,
          classes: 'width-110px',
          cellContentClasses: 'ellipsis',
        },
        {
          title: 'Tags',
          fieldNames: ['tags'],
          isSortable: true,
          displayFunction: (item: Quarantined) => {
            return item.tags?.join('\n')
          },
          isSearchable: true,
          classes: 'width-110px',
          cellContentClasses: 'vertical-scroll ellipsis',
        },
      ] as ColumnOptions[],
      quarantinedData: null as Quarantined[],
      selectedArray: [] as string[],
      dynamicRulesNames: [] as { id: string, name: string }[],
      loadingDocCounter: 0,
    }
  },
  watch: {
    selectedBranch: {
      handler: function(val, oldVal) {
        if ((this.$route.name as string).includes('Quarantined') && val && val !== oldVal) {
          this.loadDynamicRules()
          this.loadQuarantinedData()
        }
      },
      immediate: true,
    },
  },
  computed: {
    selectedBranch(): string {
      return this.branchesStore.selectedBranchId
    },

    ...mapStores(useBranchesStore),
  },
  methods: {

    setLoadingDocStatus(isLoading: boolean) {
      if (isLoading) {
        this.loadingDocCounter++
      } else {
        this.loadingDocCounter--
      }
    },

    async loadDynamicRules() {
      this.setLoadingDocStatus(true)
      const response = await RequestsUtils.sendReblazeRequest({
        methodName: 'GET',
        url: `configs/${this.selectedBranch}/d/dynamic-rules/`,
        config: {headers: {'x-fields': 'id, name, ttl'}},
      })
      if (response?.data?.length) {
        this.dynamicRulesNames = _.map(response.data, (rule) => {
          return {id: rule.id, name: rule.name, ttl: rule.ttl}
        })
      }
      this.setLoadingDocStatus(false)
    },

    updateSelected(selectedBoxes: string[]) {
      this.selectedArray = [...selectedBoxes]
    },

    async loadQuarantinedData() {
      this.setLoadingDocStatus(true)
      const url = 'query'
      const config = {headers: {'provider': 'mongodb'}}
      const data = {
        'query':
          {
            'collection': 'dynamic_rules_violations_active',
            'execute': [
              {
                'func': 'find',
                'options': {'filter': {'config': this.selectedBranch}},
              },
            ],
          },
      }
      const response = await RequestsUtils.sendDataLayerRequest({methodName: 'POST', url, data, config})

      this.quarantinedData = response.data.data.results.map((result: any) => {
        return {...result, id: result._id}
      })
      this.selectedArray = []
      this.setLoadingDocStatus(false)
    },

    async deleteQuarantinedElement(id?: string) {
      const url = 'query'
      const config = {headers: {'provider': 'mongodb'}}
      const data = {
        'query':
          {
            'collection': 'dynamic_rules_violations_active',
            'execute': [
              {
                'func': 'delete_many',
                'options': {'filter': {'_id': {'$oid': id}}},
              },
            ],
          },
      }
      await RequestsUtils.sendDataLayerRequest({methodName: 'POST', url, data, config})
      this.loadQuarantinedData()
    },

    async deleteSelectedRows() {
      this.setLoadingDocStatus(true)
      const toDeleteArray = this.selectedArray.map((rowId) => {
        return {'$oid': rowId}
      })
      const url = '/query'
      const config = {headers: {'provider': 'mongodb'}}
      const data = {
        'query':
          {
            'collection': 'dynamic_rules_violations_active',
            'execute': [
              {
                'func': 'delete_many',
                'options': {'filter': {'_id': {'$in': toDeleteArray}}},
              },
            ],
          },
      }
      await RequestsUtils.sendDataLayerRequest({methodName: 'POST', url, data, config})
      this.loadQuarantinedData()
      this.setLoadingDocStatus(false)
    },
  },
  async created() {
    await this.branchesStore.list
  },
})

</script>

<style scoped
       lang="scss">

.delete-selected-button {
  background-color: transparent;
  border: 0 solid transparent;
}

.delete-selected-button.disabled {
  font-weight: 100;
  opacity: 0.3;
}

.delete-selected-button:hover {
  background-color: transparent;
  border: 0 solid transparent;
  box-shadow: none;
  font-weight: 200;
}

</style>
