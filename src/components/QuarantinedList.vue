<template>
  <div class="card-content">
    <div class="content">
      <rbz-table :columns="columns"
                 :data="quarantinedData"
                 :default-sort-column-index="1"
                 :row-button-icon="'fa-trash'"
                 :row-button-title="'Delete'"
                 :show-menu-column="true"
                 :show-filter-button="true"
                 :show-row-button="true"
                 :show-checkbox-column="true"
                 @select-array="updateSelected"
                 @row-button-clicked="deleteQuarantinedElement">
                <template #menu>
                  <button class="button is-size-7 has-text-danger new-entity-button dropdown-item"
                        title="Delete selected"
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


export default defineComponent({
  name: 'QuarantinedList',
  components: {
    RbzTable,
  },
  data() {
    return {
      columns: [
        {
          title: 'ID',
          fieldNames: ['id'],
          isSortable: true,
          isSearchable: true,
          classes: 'ellipsis',
        },
        {
          title: 'Key Parameter',
          fieldNames: ['target'],
          isSortable: true,
          isSearchable: true,
          classes: 'ellipsis',
        },
        {
          title: 'Value',
          fieldNames: ['value'],
          isSortable: true,
          isSearchable: true,
          classes: 'width-120px',
        },
        {
          title: 'Count',
          fieldNames: ['count'],
          isSortable: true,
          isSearchable: true,
          classes: 'width-100px',
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
          classes: 'ellipsis',
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
          classes: 'ellipsis',
        },
        {
          title: 'Rules',
          fieldNames: ['rule_id'],
          isSortable: true,
          isSearchable: true,
          classes: 'ellipsis',
        },
        {
          title: 'Tags',
          fieldNames: ['tags'],
          isSortable: true,
          displayFunction: (item: Quarantined) => {
            return item.tags?.join('\n')
          },
          isSearchable: true,
          classes: 'ellipsis white-space-pre',
        },
      ] as ColumnOptions[],
      quarantinedData: null as Quarantined[],
      selectedArray: [] as string[],
    }
  },
  watch: {
    selectedBranch: {
      handler: function(val, oldVal) {
        if ((this.$route.name as string).includes('Quarantined') && val && val !== oldVal) {
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
  },
})

</script>
