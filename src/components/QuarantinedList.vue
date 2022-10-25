<template>
  <div class="card-content">
    <div class="content">
      <rbz-table :columns="columns"
                 :select-box="selectAll"
                 :data="quarantinedData"
                 :row-button-icon="'fa-trash'"
                 :row-button-title="'Delete'"
                 :show-menu-column="true"
                 :show-filter-button="true"
                 :show-row-button="true"
                 @row-button-clicked="deleteQuarantinedElement">
                <template #menu>
                  <button class="button is-size-7 new-entity-button dropdown-item"
                        title="Delete selected"
                        @click.stop="deleteSelected()">
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
          title: 'selectBox',
          fieldNames: ['id'],
          displayFunction: (item: Quarantined) => {
            return `
            <input type="checkbox" :key="${item.id}" :value="${item.id}"
              @change="${() => this.updateSelected}"    @click="${() => this.toggleMarkItem(item.id)}">`
          },
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
      selectBox: true,
    }
  },
  methods: {

    toggleMarkItem(id: string) {
      console.log('id', id)
    },
    selectAll() {
      // c
    },
    updateSelected(event: Event) {
      console.log('event', event.target._value)
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
      this.quarantinedData = [
        {
          id: '1313212313',
          count: 10,
          first_added: 12,
          last_seen: 12,
          rule_id: 'string',
          tags: ['love'],
          target: 'action.com',
          value: 'stringify',
        },
        {
          id: '45643563446',
          count: 10,
          first_added: 12,
          last_seen: 12,
          rule_id: 'string',
          tags: ['nolove'],
          target: 'noaction.com',
          value: 'stringify',
        },
      ]
      // this.quarantinedData = response.data.data.results.map((result: any) => {
      //   return {...result, id: result._id}
      // })
      // console.log('this.quarantinedData', this.quarantinedData)
    },

    async deleteQuarantinedElement(id: string) {
      console.log('id', id)
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

  },
  created() {
    this.loadQuarantinedData()
  },
})

</script>
