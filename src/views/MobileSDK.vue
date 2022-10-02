<template>
  <div class="card">
    <div class="card-content">
      <div class="media">
          <div class="media-content">
            <rbz-table :columns="columns"
                        :data="mobilesdks"
                        :show-menu-column="true"
                        :show-filter-button="true"
                        :show-new-button="true"
                        @new-button-clicked="addNewSDK"
                        :show-edit-button="true"
                        @edit-button-clicked="editMobileSDK">
            </rbz-table>
          </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import _ from 'lodash'
import {defineComponent} from 'vue'
import RbzTable from '@/components/RbzTable.vue'
import {ColumnOptions, RoutingProfile} from '@/types'
import DatasetsUtils from '@/assets/DatasetsUtils'
import RequestsUtils from '@/assets/RequestsUtils'

export default defineComponent({
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
          classes: 'width-120px',
        },
        {
          title: 'Description',
          fieldNames: ['description'],
          isSortable: true,
          isSearchable: true,
          classes: 'ellipsis',
        },
        {
          title: 'Path',
          fieldNames: ['locations'],
          displayFunction: (item: RoutingProfile) => {
            return _.map(item.locations, 'path')?.join('\n')
          },
          isSortable: true,
          isSearchable: true,
          classes: 'width-120px white-space-pre',
        },
        {
          title: 'BE Service',
          fieldNames: ['beservice'],
          displayFunction: (item: RoutingProfile) => {
            return _.map(item.locations, 'backend_id')?.join('\n')
          },
          isSortable: true,
          isSearchable: true,
          classes: 'width-120px white-space-pre',
        },
        {
          title: 'Cloud Functions',
          fieldNames: ['locations'],
          displayFunction: (item: RoutingProfile) => {
            return item.id
          },
          isSortable: true,
          isSearchable: true,
          classes: 'width-120px',
        },
      ] as ColumnOptions[],
      isNewLoading: false,
      loadingDocCounter: 0,
      titles: DatasetsUtils.titles,
      mobilesdks: [],
    }
  },

  methods: {
    // TODO: Needs to changes all names to MobileSDK
    newMobileSDK(): RoutingProfile {
      // TODO: Needs to add mobile sdk as new entity type
      const factory = DatasetsUtils.newOperationEntryFactory['routingprofiles']
      return factory && factory()
    },

    editMobileSDK(id: string) {
      const routeToDoc = `/mobilesdk/config/${id}`
      this.$router.push(routeToDoc)
    },
    async addNewSDK() {
      // TODO: Needs to modify
      this.isNewLoading = true
      const mobileSDKToAdd = this.newMobileSDK()
      const mobileSDKText = this.titles['routingprofiles-singular']
      const successMessage = `New ${mobileSDKText} was created.`
      const failureMessage = `Failed while attempting to create the new ${mobileSDKText}.`
      const url = `config/routing-profiles/${mobileSDKToAdd.name}/`
      const data = mobileSDKToAdd
      const response = await RequestsUtils.sendReblazeRequest({methodName: 'POST', url, data, successMessage, failureMessage})
      this.editMobileSDK(response?.data?.id)
      this.isNewLoading = false
    },

    async loadMobileSDKs() {
      const url = 'config/mobile-sdks/'
      const response = await RequestsUtils.sendReblazeRequest({methodName: 'GET', url})
      this.mobilesdks = _.values(response?.data)
      console.log(this.mobilesdks)
    },
  },
  created() {
    this.loadMobileSDKs()
  },
})
</script>

<style scoped lang="scss">

</style>
