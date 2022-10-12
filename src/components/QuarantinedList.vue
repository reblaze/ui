<template >
  <div class="quarantine">
    <section>
        <div class="card">
          <div class="card-content">
                <div class="content">
                    <rbz-table :columns="columns"
                                :data="quarantinedData"
                                :row-button-icon="'fa-trash'"
                                :row-button-title="'Delete'"
                                :show-new-button="false"
                                :show-menu-column="true"
                                :show-filter-button="true"
                                :show-row-button="true"
                                @row-button-clicked="deleteQuarantinedElement">
                    </rbz-table>
                </div>
          </div>
        </div>
    </section>
  </div>
</template>

<script lang="ts">
// import _ from 'lodash'
import {defineComponent} from 'vue'
import RbzTable from '@/components/RbzTable.vue'
import {Quarantined, ColumnOptions} from '@/types'
// import DateTimeUtils from '@/assets/DateTimeUtils'

export default defineComponent({
  name: 'QuarantinedList',
  props: {},
  components: {
    RbzTable,
  },
  data() {
    return {
      columns: [
        {
          title: 'IP',
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
            return item
          },
          isSortable: true,
          isSearchable: true,
          classes: 'ellipsis',
        },
        {
          title: 'Last Seen',
          fieldNames: ['last_seen'],
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
          isSearchable: true,
          classes: 'ellipsis',
        },
        {
          title: 'Target',
          fieldNames: ['target'],
          isSortable: true,
          isSearchable: true,
          classes: 'ellipsis',
        },
      ] as ColumnOptions[],
      quarantinedData: null as Quarantined[],
    }
  },
  watch: {

  },
  computed: {

  },
  methods: {
    loadQuarantinedData(): Quarantined[] {
      // const url = `configs/${this.selectedBranch}/d/globalfilters/e/dr_${val}/`
      // POST {DATA_LAYER_URL}/query
      // {"query":
      //     {
      //         "collection": "dynamic_rules_violations_active",
      //         "execute": [
      //             {
      //                 "func": "find",
      //                 "options": {}
      //             }
      //         ]
      //     }
      // }
      // const response = await RequestsUtils.sendRequest({methodName: 'GET', url})
      const quarantinedData = [{
        'id': '633ec6b737f44e76740d8f5e',
        'count': 5,
        'first_added': 1262296800,
        'last_seen': 1262296800,
        'rule_id': '1',
        'tags': ['include1'],
        'target': 'ip',
        'value': '1.1.1.1',
      },
      {
        'id': '633ec6b737f44e76740d8f5f',
        'count': 5,
        'first_added': 1262296800,
        'last_seen': 1262296800,
        'rule_id': '3',
        'tags': ['include1'],
        'target': 'ip',
        'value': '1.1.1.1',
      },
      {
        'id': '633ec6b737f44e76740d8f60',
        'count': 5,
        'first_added': 1262296800,
        'last_seen': 1262296800,
        'rule_id': '1',
        'tags': ['include1'],
        'target': 'ip',
        'value': '2.2.2.2',
      },
      {
        'id': '633ec6b737f44e76740d8f61',
        'count': 5,
        'first_added': 1262296800,
        'last_seen': 1262296800,
        'rule_id': '3',
        'tags': ['include1'],
        'target': 'ip',
        'value': '2.2.2.2',
      },
      {
        'id': '633ec6b737f44e76740d8f62',
        'count': 5,
        'first_added': 1262296800,
        'last_seen': 1262296800,
        'rule_id': '3',
        'tags': ['include1', 'exclude1'],
        'target': 'ip',
        'value': '3.3.3.3',
      },
      {
        'id': '633ec6b737f44e76740d8f63',
        'count': 5,
        'first_added': 1262296800,
        'last_seen': 1262296800,
        'rule_id': '3',
        'tags': ['include1'],
        'target': 'ip',
        'value': '4.4.4.4',
      },
      {
        'id': '633ec6b737f44e76740d8f64',
        'count': 5,
        'first_added': 1262296800,
        'last_seen': 1262296800,
        'rule_id': '2',
        'tags': ['include2', 'include3'],
        'target': 'headers_content-type',
        'value': 'json',
      },
      {
        'id': '633ec6b737f44e76740d8f65',
        'count': 5,
        'first_added': 1262296800,
        'last_seen': 1262296800,
        'rule_id': '4',
        'tags': ['geo-country:Israel'],
        'target': 'country',
        'value': 'israel',
      },
      ]
      return quarantinedData
    },

    deleteQuarantinedElement(id: string) {
      const quarantinedDataArray = this.quarantinedData.filter((quarantinedLine) => quarantinedLine.id !== id)
      // POST {DATA_LAYER_URL}/query
      // {"query":
      //     {
      //         "collection": "dynamic_rules_violations_active",
      //         "execute": [
      //             {
      //                 "func": "delete_many",
      //                 "options": {"filter": {"_id": {"$in": [{"$oid": "ID_STRING"}]}}
      //             }
      //         ]
      //     }
      // }
      this.quarantinedData = quarantinedDataArray
    },

  },
  created() {
    this.quarantinedData = this.loadQuarantinedData()
  },
})

</script>
