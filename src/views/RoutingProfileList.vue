<template>
    <div class="card">
        <div class="card-content">
        <div class="media">
            <div class="media-content">
              <rbz-table :columns="columns"
                         :data="mockArray"
                         :show-new-button="true"
                         :show-edit-button="true"
                         @edit-button-clicked="editDoc">
              </rbz-table>
            </div>
        </div>
        </div>
    </div>
</template>
<script lang="ts">
import _ from 'lodash'
import {defineComponent} from 'vue'
// import {AxiosResponse} from 'axios'
import RbzTable from '@/components/RbzTable.vue'
import {ColumnOptions, RoutingProfile} from '@/types'
import DatasetsUtils from '@/assets/DatasetsUtils'
import RequestsUtils from '@/assets/RequestsUtils'
import { AxiosResponse } from 'axios'
// import {ColumnOptions} from '@/types'

export default defineComponent({
  components: {
    RbzTable,
  },
  data() {
    return {
      mockArray: [
        {
          'name': 'NAME_test1',
          'id': 'ID_1a2b',
          'server_names': ['server1'],
          'locations': [
            {
              'path': '/test1',
              'backend_id': 'b2a1',
            },
            {
              'path': '/test2',
              'backend_id': 'b22a11',
            },
          ],
          'cloud_functions': ['cloudFuncTest1, cloudFuncTest2'],
        },
        {
          'name': 'NAME_test2',
          'id': 'ID_3c4d',
          'server_names': ['server3', 'server4'],
          'locations': [
            {
              'path': '/test3',
              'backend_id': 'd4c3',
            },
            {
              'path': '/test4',
              'backend_id': 'BACKENDID_d44c33',
            },
          ],
          'cloud_functions': ['cloudFuncTest3, cloudFuncTest4'],
        },
      ],
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
    
    newDoc(): RoutingProfile {
      const factory = DatasetsUtils.newOperationEntryFactory['routingprofiles']
      return factory && factory()
    },

    editDoc(id: string) {
      const routeToDoc = `/routing-profile/config/${id}`
      this.$router.push(routeToDoc)
    },
    async addNewDoc() {
      this.setLoadingDocStatus(true)
      this.isNewLoading = true
      const docToAdd = this.newDoc()
      const docTypeText = this.titles['routingprofiles-singular']
      const successMessage = `New ${docTypeText} was created.`
      const failureMessage = `Failed while attempting to create the new ${docTypeText}.`
      const url = `/config/routing-profiles/${docToAdd.name}/`
      const data = docToAdd
      await RequestsUtils.sendRequest({methodName: 'POST', url, data, successMessage, failureMessage}).then((response:AxiosResponse) => {
        this.editDoc(response.data.id)
      })
      this.isNewLoading = false
      this.setLoadingDocStatus(false)
    },
  },
})
</script>

<style scoped lang="scss">

</style>
