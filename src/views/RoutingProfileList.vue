<template>
    <div class="card">
        <div class="card-content">
        <div class="media">
            <div class="media-content">
              <rbz-table :columns="columns"
                         :data="mockArray"
                         :show-new-button="true"
                         :show-edit-button="true">
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
          'server_names': [
            {
              'server1': 'TEST server1',
            },
            {
              'server2': 'TEST server2',
            },
          ],
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
          displayFunction: (item) => {
            return _.map(item?.locations, 'path')?.join('\n')
          },
          isSortable: true,
          isSearchable: true,
          classes: 'width-120px',
        },
        {
          title: 'BE Service',
          fieldNames: ['beservice'],
          isSortable: true,
          isSearchable: true,
          classes: 'width-120px',
        },
        {
          title: 'Cloud Functions Active out of Total',
          fieldNames: ['locations'],
          isSortable: true,
          isSearchable: true,
          classes: 'width-120px',
        },
      ],
    }
  },

  methods: {

  },
})
</script>

<style scoped lang="scss">

</style>
