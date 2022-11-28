<template>
  <div class="card-content">
    <div class="content"
          v-if="dnsRecords && !loadingDocCounter">
      <rbz-table :columns="columns"
                 :data="dnsRecords"
                 :default-sort-column-index="1"
                 :show-filter-button="true">
      </rbz-table>
    </div>
    <div class="content no-data-wrapper"
         v-if="!selectedBranch || !dnsRecords">
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
          title: 'Name',
          fieldNames: ['name'],
          isSortable: true,
          isSearchable: true,
          classes: 'ellipsis ',
        },
        {
          title: 'Name',
          fieldNames: ['name'],
          isSortable: true,
          isSearchable: true,
          classes: 'ellipsis ',
        },
        {
          title: 'Resource Records',
          fieldNames: ['resource_records'],
          isSortable: true,
          isSearchable: true,
          classes: 'ellipsis ',
        },
        {
          title: 'Time Records',
          fieldNames: ['ttl'],
          isSortable: true,
          isSearchable: true,
          classes: 'ellipsis ',
        },
        {
          title: 'Record Type',
          fieldNames: ['type'],
          isSortable: true,
          isSearchable: true,
          classes: 'ellipsis ',
        },
      ] as ColumnOptions[],
      dnsRecords: [] as undefined as DnsRecord[],
      loadingDocCounter: 0,
    }
  },
  watch: {
    selectedBranch: {
      handler: async function(val, oldVal) {
        if ((this.$route.name as string).includes('DNSRecords') && val && val !== oldVal) {
          await this.loadDNS()
        }
      },
      immediate: true,
    },
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
      const url = '/tools/dns-information/'
      const methodName = 'GET'
      const response = await RequestsUtils.sendReblazeRequest({methodName, url})
      this.dnsRecords = response?.data?.dns_records || []
      this.setLoadingDocStatus(false)
    },
  },

  computed: {
    selectedBranch(): string {
      return this.branchesStore.selectedBranchId
    },

    ...mapStores(useBranchesStore),
  },

  async created() {
    await this.branchesStore.list
    await this.loadDNS()
  },
})

</script>

