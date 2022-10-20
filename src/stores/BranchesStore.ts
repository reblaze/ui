import {defineStore} from 'pinia'
import {Branch} from '@/types'
import RequestsUtils from '@/assets/RequestsUtils'
import {AxiosError, AxiosResponse} from 'axios'
import _ from 'lodash'
import {computed, ref} from 'vue'
import {useRoute} from 'vue-router'

export const useBranchesStore = defineStore('branches', () => {
  const route = useRoute()

  // Data
  const _list = ref([] as Branch[])
  const _selectedBranchId = ref(null as Branch['id'])
  const _loading = ref(false)
  const _listPromise = ref(null as Promise<Branch[]>)

  // Computed
  const list = computed((): Promise<Branch[]> => {
    if (_loading.value) {
      return _listPromise.value
    }
    return new Promise((resolve) => {
      resolve(_list.value)
    })
  })
  const selectedBranchId = computed((): Branch['id'] => {
    return _selectedBranchId.value
  })
  const selectedBranch = computed((): Branch => {
    return _list.value.find((branch: Branch) => {
      return branch.id === _selectedBranchId.value
    })
  })
  const branchesCounter = computed((): number => {
    return _.size(_list.value)
  })
  const commitsCounter = computed((): number => {
    return _.sum(_.map(_.map(_list.value, 'logs'), (logs) => {
      return _.size(logs)
    }))
  })

  // Methods
  async function loadBranches() {
    if (_loading.value) {
      return _listPromise.value
    }
    _listPromise.value = new Promise((resolve, reject) => {
      _loading.value = true
      RequestsUtils.sendRequest({
        methodName: 'GET',
        url: 'configs/',
      }).then((response: AxiosResponse) => {
        console.log('Branches loaded: ', response.data)
        setBranches(response.data)
        const branchNameFromRoute = route.params.branch.toString()
        setSelectedBranch(branchNameFromRoute)
        _loading.value = false
        resolve(list.value)
      }).catch((err: AxiosError) => {
        console.log('Error while attempting to get configs')
        console.log(err)
        _loading.value = false
        reject(err)
      })
    })
    return _listPromise.value
  }

  function setBranches(branchesList: Branch[]) {
    _list.value = branchesList
  }

  async function setSelectedBranch(id ?: Branch['id']) {
    const branches = await list.value
    let newId = branches[0].id
    if (id) {
      const branch = branches.find((branch: Branch) => {
        return branch.id === id
      })
      if (branch) {
        newId = id
      }
    }
    _selectedBranchId.value = newId
  }

  return {
    _list,
    list,
    selectedBranchId,
    selectedBranch,
    branchesCounter,
    commitsCounter,
    loadBranches,
    setSelectedBranch,
  }
})
