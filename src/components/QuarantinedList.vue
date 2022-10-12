<template >
  <div class="quarantine">
    <section>
        <div class="card">
          <div class="card-content">
                <div class="content">
                    <rbz-table :columns="columns"
                                :data="quarantinedData"
                                :row-button-icon="'fa-trash'"
                                :row-button-title="'Edit'"
                                :show-menu-column="true"
                                :show-filter-button="true"
                                :show-row-button="true"
                                @row-button-clicked="deleteEntry">
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
// import {COLUMN_OPTIONS_MAP} from '@/views/documentListConst'
// import {ColumnOptions} from '@/types'


export default defineComponent({
  name: 'QuarantinedList',
  props: {
    label: {
      type: String,
      default: '',
    },
  },
  components: {
    RbzTable,
  },
  data() {
    return {
      columns: [
        {
          title: 'IP',
          fieldNames: ['ip'],
          isSortable: true,
          isSearchable: true,
          classes: 'width-120px',
        },
        {
          title: 'Geo',
          fieldNames: ['geo'],
          isSortable: true,
          isSearchable: true,
          classes: 'ellipsis',
        },
        {
          title: 'ASN',
          fieldNames: ['asn'],
          isSortable: true,
          isSearchable: true,
          classes: 'ellipsis',
        },
        {
          title: 'Violations',
          fieldNames: ['violations'],
          isSortable: true,
          isSearchable: true,
          classes: 'ellipsis',
        },
        {
          title: 'CNT/limit',
          fieldNames: ['limit'],
          isSortable: true,
          isSearchable: true,
          classes: 'ellipsis',
        },
        {
          title: 'Added',
          fieldNames: ['added'],
          isSortable: true,
          isSearchable: true,
          classes: 'ellipsis',
        },
        {
          title: 'Last Seen',
          fieldNames: ['last'],
          isSortable: true,
          isSearchable: true,
          classes: 'ellipsis',
        },
        {
          title: 'Expires',
          fieldNames: ['expires'],
          isSortable: true,
          isSearchable: true,
          classes: 'ellipsis',
        },
      ],
      quarantinedData: [{
        'ip': '9.9.9.9',
        'geo': 'israel',
        'asn': '',
        'violations': 'First',
        'limit': '5',
        'added': false,
        'last_seen': '01/09/2022',
        'expires': '15/11/22',
      }],
    }
  },
  computed: {

  },
  // emits(): [],
  methods: {
    deleteEntry() {},

  },
})

</script>
