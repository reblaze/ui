<template>
    <div class="card">
        <div class="card-content">
        <div class="media">
            <div class="media-content">
              <rbz-table :columns="columns"
                          :data="profiles"
                          :show-menu-column="true"
                          :show-filter-button="true"
                          :show-new-button="true"
                          @new-button-clicked="addNewProfile"
                          :show-edit-button="true"
                          @edit-button-clicked="editProfile">
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
            return _.map(item.cloud_functions)?.join('\n')
          },
          isSortable: true,
          isSearchable: true,
          classes: 'width-120px',
        },
      ] as ColumnOptions[],
      isNewLoading: false,
      titles: DatasetsUtils.titles,
      profiles: [],
    }
  },

  methods: {
    newProfile(): RoutingProfile {
      const factory = DatasetsUtils.newOperationEntryFactory['routingprofiles']
      return factory && factory()
    },

    editProfile(id: string) {
      const routeToEditProfile = `/routing-profile/config/${id}`
      this.$router.push(routeToEditProfile)
    },
    async addNewProfile() {
      this.isNewLoading = true
      const profileToAdd = this.newProfile()
      const routingProfileText = this.titles['routingprofiles-singular']
      const successMessage = `New ${routingProfileText} was created.`
      const failureMessage = `Failed while attempting to create the new ${routingProfileText}.`
      const url = `config/d/routing-profiles/e/${profileToAdd.id}`
      const data = profileToAdd
      await RequestsUtils.sendReblazeRequest({methodName: 'POST', url, data, successMessage, failureMessage})
      this.editProfile(profileToAdd.id)
      this.isNewLoading = false
    },

    async loadProfiles() {
      const url = 'config/d/routing-profiles/'
      const response = await RequestsUtils.sendReblazeRequest({methodName: 'GET', url})
      this.profiles = _.values(response?.data)
    },
  },
  created() {
    this.loadProfiles()
  },
})
</script>
