<template>
  <div class="card-content">
    <div class="content"
          v-if="dnsRecords && !loadingDocCounter">
      <rbz-table :columns="columns"
                 :data="dnsRecords"
                 :vertical-align-top="true"
                 :show-menu-column="true"
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
          classes: 'width-300px',
          cellContentClasses: 'word-break-all',
        },
        {
          title: 'Type',
          fieldNames: ['type'],
          isSortable: true,
          isSearchable: true,
          classes: 'width-100px',
          cellContentClasses: 'word-break-all',
        },
        {
          title: 'TTL',
          fieldNames: ['ttl'],
          isSortable: true,
          isSearchable: true,
          isNumber: true,
          classes: 'width-100px',
        },
        {
          title: 'Value',
          fieldNames: ['resource_records'],
          displayFunction: (item: DnsRecord) => {
            return item.resource_records?.join('\n')
          },
          isSortable: true,
          isSearchable: true,
          cellContentClasses: 'vertical-scroll multi-line white-space-pre word-break-all',
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

.word-break-all {
  word-break: break-all;
}

:deep(.rbz-table .multi-line) {
  height: fit-content;
  max-height: 10rem;
}

</style>
