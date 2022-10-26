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
                 :show-checkbox="true"
                 @select-array="updateSelected"
                 @row-button-clicked="deleteQuarantinedElement">
                <template #menu>
                  <button class="button is-size-7 new-entity-button dropdown-item"
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
// import RequestsUtils from '@/assets/RequestsUtils'


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
      selectBox: true,
      selectedArray: [] as string[],
    }
  },
  methods: {

    updateSelected(selectedBoxes: string[]) {
      this.selectedArray = [...selectedBoxes]
    },
    async loadQuarantinedData() {
      // const url = '/query'
      // const config = {headers: {'provider': 'mongodb'}}
      // const data = {
      //   'query':
      //       {
      //         'collection': 'dynamic_rules_violations_active',
      //         'execute': [
      //           {
      //             'func': 'find',
      //             'options': {},
      //           },
      //         ],
      //       },
      // }
      // const response = await RequestsUtils.sendDataLayerRequest({methodName: 'POST', url, data, config})

      // Mock data
      const response = [
        {
          _id: '633ec6b737f44e76740d8f5e',
          count: 5,
          first_added: 1262296800,
          last_seen: 1262296800,
          rule_id: '1',
          tags: ['include1'],
          target: 'ip',
          value: '1.1.1.1',
        },
        {
          _id: '633ec6b737f44e76740d8f5f',
          count: 5,
          first_added: 1262296800,
          last_seen: 1262296800,
          rule_id: 3,
          tags: ['include1'],
          target: 'ip',
          value: '1.1.1.1',
        },
        {
          _id: '633ec6b737f44e76740d8f60',
          count: 5,
          first_added: 1262296800,
          last_seen: 1262296800,
          rule_id: 1,
          tags: ['include1'],
          target: 'ip',
          value: '2.2.2.2',
        },
        {
          _id: '633ec6b737f44e76740d8f61',
          count: 5,
          first_added: 1262296800,
          last_seen: 1262296800,
          rule_id: 3,
          tags: ['include1'],
          target: 'ip',
          value: '2.2.2.2',
        },
        {
          _id: '633ec6b737f44e76740d8f62',
          count: 5,
          first_added: 1262296800,
          last_seen: 1262296800,
          rule_id: 3,
          tags: ['include1', 'exclude1'],
          target: 'ip',
          value: '3.3.3.3',
        },
        {
          _id: '633ec6b737f44e76740d8f63',
          count: 5,
          first_added: 1262296800,
          last_seen: 1262296800,
          rule_id: 3,
          tags: ['include1'],
          target: 'ip',
          value: '4.4.4.4',
        },
        {
          _id: '633ec6b737f44e76740d8f64',
          count: 5,
          first_added: 1262296800,
          last_seen: 1262296800,
          rule_id: 2,
          tags: ['include2', 'include3'],
          target: 'headers_content-type',
          value: 'json',
        },
        {
          _id: '633ec6b737f44e76740d8f65',
          count: 5,
          first_added: 1262296800,
          last_seen: 1262296800,
          rule_id: 4,
          tags: ['geo-country:Israel'],
          target: 'country',
          value: 'israel',
        },
      ]
      this.quarantinedData = response.map((result: any) => {
      // this.quarantinedData = response.data.data.results.map((result: any) => {
        return {...result, id: result._id}
      })
      this.selectedArray = []
    },

    async deleteQuarantinedElement(id?: string) {
      this.quarantinedData = this.quarantinedData.filter((item) => item.id !== id)

      // const url = '/query'
      // const config = {headers: {'provider': 'mongodb'}}
      // const data = {
      //   'query':
      //       {
      //         'collection': 'dynamic_rules_violations_active',
      //         'execute': [
      //           {
      //             'func': 'delete_many',
      //             'options': {'filter': {'_id': {'$oid': id}}},
      //           },
      //         ],
      //       },
      // }
      // await RequestsUtils.sendDataLayerRequest({methodName: 'POST', url, data, config})
      // this.loadQuarantinedData()
    },
    deleteSelectedRows() {
      this.selectedArray.forEach((rowId) => {
        this.quarantinedData = this.quarantinedData.filter((item) => item.id !== rowId)
      })
    },

  },
  created() {
    this.loadQuarantinedData()
  },
})

</script>
