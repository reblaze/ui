<template>
  <div class="card-content">
    <div class="content"
          v-if="dnsRecords && !loadingDocCounter">
      <rbz-table :columns="columns"
                 :data="dnsRecords"
                 :default-sort-column-index="1"
                 :vertical-align-top="true"
                 :show-filter-button="true">
      </rbz-table>
    </div>
    <div class="content no-data-wrapper"
         v-if="!dnsRecords">
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
import {ColumnOptions, DnsRecord} from '@/types'
import RequestsUtils from '@/assets/RequestsUtils'


export default defineComponent({
  name: 'DNSRecords',
  components: {
    RbzTable,
  },
  data() {
    return {
      columns: [
        {
          title: 'Name',
          fieldNames: ['name'],
          isSortable: true,
          isSearchable: true,
          classes: 'ellipsis width-300px align-top',
        },
        {
          title: 'Type',
          fieldNames: ['type'],
          isSortable: true,
          isSearchable: true,
          classes: 'width-100px',
        },
        {
          title: 'TTL',
          fieldNames: ['ttl'],
          isSortable: true,
          isSearchable: true,
          classes: 'width-100px',
        },
        {
          title: 'Value',
          fieldNames: ['resource_records'],
          displayFunction: (item: DnsRecord) => {
            return item.resource_records?.join('<br>\n')
          },
          isSortable: true,
          isSearchable: true,
          classes: 'ellipsis multi-line',
        },
      ] as ColumnOptions[],
      dnsRecords: [] as undefined as DnsRecord[],
      loadingDocCounter: 0,
    }
  },
  methods: {

    setLoadingDocStatus(isLoading: boolean) {
      if (isLoading) {
        this.loadingDocCounter++
      } else {
        this.loadingDocCounter--
      }
    },

    async loadDNS() {
      this.setLoadingDocStatus(true)
      const url = 'tools/dns-information/'
      const methodName = 'GET'
      const response = await RequestsUtils.sendReblazeRequest({methodName, url})
      this.dnsRecords = response?.data?.dns_records || []
      this.setLoadingDocStatus(false)
    },
  },

  async created() {
    await this.loadDNS()
  },
})

</script>

<style scoped
       lang="scss">
.content table td {
  vertical-align: top !important;
}

.align-top {
  align-self: flex-start;
  height: 100%;
  vertical-align: top !important;
}

.rbz-table .data-cell-content {
  max-height: 90px !important;
}

.rbz-table .data-cell {
  vertical-align: top !important;
}

.multi-line {
  height: fit-content !important;
  max-height: fit-content !important;
  max-width: 300px;
  min-height: 150px;
  min-width: 250px;
  width: 250px;
}

</style>
