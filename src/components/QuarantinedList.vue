<template>
  <div class="card-content">
    <div class="content">
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
import {AxiosResponse} from 'axios'
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
        },
        {
          title: 'Value',
          fieldNames: ['value'],
          isSortable: true,
          isSearchable: true,
          classes: 'width-90px',
        },
        {
          title: 'Count',
          fieldNames: ['count'],
          isSortable: true,
          isSearchable: true,
          classes: 'width-50px',
        },
        {
          title: 'First Added',
          fieldNames: ['first_added'],
          displayFunction: (item: any) => {
            const newDate = new Date(item['first_added'] * 1000)
            return DateTimeUtils.isoToNowCuriefenseFormat(newDate)
          },
          isSortable: true,
          isSearchable: true,
          classes: 'width-130px',
        },
        {
          title: 'Last Seen',
          fieldNames: ['last_seen'],
          displayFunction: (item: any) => {
            const newDate = new Date(item['last_seen'] * 1000)
            return DateTimeUtils.isoToNowCuriefenseFormat(newDate)
          },
          isSortable: true,
          isSearchable: true,
          classes: 'width-130px',
        },
        {
          title: 'Rule',
          fieldNames: ['rule_id'],
          displayFunction: (item: Quarantined) => {
            console.log('item.rule_id', item.rule_id)
            const dynamicRules: {id: string, name: string} = _.find(this.dynamicRulesNames, (dynamicRule) => {
              return dynamicRule.id === item.rule_id
            })
            console.log('dynamicRules', dynamicRules)
            return dynamicRules?.name || ''
          },
          isSortable: true,
          isSearchable: true,
          classes: 'width-130px',
        },
        {
          title: 'Tags',
          fieldNames: ['tags'],
          isSortable: true,
          displayFunction: (item: Quarantined) => {
            return item.tags?.join('\n')
          },
          isSearchable: true,
          classes: 'vertical-scroll ellipsis white-space-pre',
        },
      ] as ColumnOptions[],
      quarantinedData: null as Quarantined[],
      selectedArray: [] as string[],
      dynamicRulesNames: [] as {id: string, name: string}[],
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
    loadDynamicRules() {
      RequestsUtils.sendReblazeRequest({
        methodName: 'GET',
        url: `configs/${this.selectedBranch}/d/dynamic-rules/`,
        config: {headers: {'x-fields': 'id, name'}},
      }).then((response: AxiosResponse<{id: string, name: string}>) => {
        this.dynamicRulesNames = _.map(response.data, (id, name) => {
          return {id, name}
        })
      })
    },

    updateSelected(selectedBoxes: string[]) {
      this.selectedArray = [...selectedBoxes]
    },
    async loadQuarantinedData() {
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
    },
  },
  async created() {
    await this.branchesStore.list
    this.loadDynamicRules()
    console.log('dynamicRulesNames', this.dynamicRulesNames)
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
