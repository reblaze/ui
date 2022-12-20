// stores/counter.spec.ts
import {afterEach, beforeEach, describe, expect, jest, test} from '@jest/globals'
import {createPinia, setActivePinia} from 'pinia'
import {useBranchesStore} from '@/stores/BranchesStore'
import RequestsUtils, {IRequestParams} from '../../assets/RequestsUtils'
import {Branch} from '../../types'
import * as _ from 'lodash'

const selectedBranch = 'prod'
const mockRoute = {
  params: {
    branch: selectedBranch,
  },
  path: `/${selectedBranch}/support`,
  name: 'HelpAndSupport',
}
jest.mock('vue-router', () => ({
  useRoute: jest.fn(() => (mockRoute)),
}))
jest.mock('../../assets/RequestsUtils.ts')

describe('Branches Store', () => {
  let branchesStore: any
  let branches: Branch[]
  let sendRequestSpy: any
  beforeEach(async () => {
    // creates a fresh pinia and make it active so it's automatically picked
    // up by any useStore() call without having to pass it to it:
    // `useStore(pinia)`
    setActivePinia(createPinia())
    branches = [
      {
        'id': 'prod',
        'description': 'Update entry [__acldefault__] of document [aclprofiles]',
        'date': '2020-11-10T15:49:17+02:00',
        'logs': [
          {
            'version': '7dd9580c00bef1049ee9a531afb13db9ef3ee956',
            'date': '2020-11-10T15:49:17+02:00',
            'parents': [
              'fc47a6cd9d7f254dd97875a04b87165cc484e075',
            ],
            'message': 'Update entry [__acldefault__] of document [aclprofiles]',
            'email': 'curiefense@reblaze.com',
            'author': 'Curiefense API',
          },
          {
            'version': 'fc47a6cd9d7f254dd97875a04b87165cc484e075',
            'date': '2020-11-10T15:48:35+02:00',
            'parents': [
              '5aba4a5b9d6faea1896ee8965c7aa651f76af63c',
            ],
            'message': 'Update entry [__acldefault__] of document [aclprofiles]',
            'email': 'curiefense@reblaze.com',
            'author': 'Curiefense API',
          },
          {
            'version': '5aba4a5b9d6faea1896ee8965c7aa651f76af63c',
            'date': '2020-11-10T15:48:31+02:00',
            'parents': [
              '277c5d7bd0e2eb4b9d2944f7eefdfadf37ba8581',
            ],
            'message': 'Update entry [__acldefault__] of document [aclprofiles]',
            'email': 'curiefense@reblaze.com',
            'author': 'Curiefense API',
          },
          {
            'version': '277c5d7bd0e2eb4b9d2944f7eefdfadf37ba8581',
            'date': '2020-11-10T15:48:22+02:00',
            'parents': [
              '878b47deeddac94625fe7c759786f2df885ec541',
            ],
            'message': 'Update entry [__acldefault__] of document [aclprofiles]',
            'email': 'curiefense@reblaze.com',
            'author': 'Curiefense API',
          },
          {
            'version': '878b47deeddac94625fe7c759786f2df885ec541',
            'date': '2020-11-10T15:48:05+02:00',
            'parents': [
              '93c180513fe7edeaf1c0ca69a67aa2a11374da4f',
            ],
            'message': 'Update entry [__acldefault__] of document [aclprofiles]',
            'email': 'curiefense@reblaze.com',
            'author': 'Curiefense API',
          },
          {
            'version': '93c180513fe7edeaf1c0ca69a67aa2a11374da4f',
            'date': '2020-11-10T15:47:59+02:00',
            'parents': [
              '1662043d2a18d6ad2c9c94d6f826593ff5506354',
            ],
            'message': 'Update entry [__acldefault__] of document [aclprofiles]',
            'email': 'curiefense@reblaze.com',
            'author': 'Curiefense API',
          },
          {
            'version': '1662043d2a18d6ad2c9c94d6f826593ff5506354',
            'date': '2020-11-08T21:31:41+01:00',
            'parents': [
              '16379cdf39501574b4a2f5a227b82a4454884b84',
            ],
            'message': 'Create config [prod]\n',
            'email': 'curiefense@reblaze.com',
            'author': 'Curiefense API',
          },
          {
            'version': '16379cdf39501574b4a2f5a227b82a4454884b84',
            'date': '2020-08-27T16:19:06+00:00',
            'parents': [
              'a34f979217215060861b58b3f270e82580c20efb',
            ],
            'message': 'Initial empty config',
            'email': 'curiefense@reblaze.com',
            'author': 'Curiefense API',
          },
          {
            'version': 'a34f979217215060861b58b3f270e82580c20efb',
            'date': '2020-08-27T16:19:06+00:00',
            'parents': [],
            'message': 'Initial empty content',
            'email': 'curiefense@reblaze.com',
            'author': 'Curiefense API',
          },
        ],
        'version': '7dd9580c00bef1049ee9a531afb13db9ef3ee956',
      },
      {
        'id': 'zzz_branch',
        'description': 'Initial empty content',
        'date': '2020-08-27T16:19:06+00:00',
        'logs': [
          {
            'version': 'a34f979217215060861b58b3f270e82580c20efb',
            'date': '2020-08-27T16:19:06+00:00',
            'parents': [],
            'message': 'Initial empty content',
            'email': 'curiefense@reblaze.com',
            'author': 'Curiefense API',
          },
        ],
        'version': 'a34f979217215060861b58b3f270e82580c20efb',
      },
    ]
    sendRequestSpy = jest.spyOn(RequestsUtils, 'sendRequest').mockImplementation(
      (requestParams: IRequestParams) => {
        if (requestParams.url === 'configs/') {
          return Promise.resolve({data: branches})
        }
        return Promise.resolve({data: []})
      })
    branchesStore = useBranchesStore()
    await branchesStore.loadBranches()
  })
  afterEach(() => {
    jest.clearAllMocks()
    jest.clearAllTimers()
  })

  describe('computed', () => {
    test('should have correct list data as promise', async () => {
      const wantedValue = branches
      const actualValue = await branchesStore.list
      expect(actualValue).toEqual(wantedValue)
    })

    test('should have correct selectedBranchId data', () => {
      const wantedValue = branches[0].id
      const actualValue = branchesStore.selectedBranchId
      expect(actualValue).toEqual(wantedValue)
    })

    test('should have correct selectedBranch data', () => {
      const wantedValue = branches[0]
      const actualValue = branchesStore.selectedBranch
      expect(actualValue).toEqual(wantedValue)
    })

    test('should have correct branchesCounter data', () => {
      const wantedValue = branches.length
      const actualValue = branchesStore.branchesCounter
      expect(actualValue).toEqual(wantedValue)
    })

    test('should have correct commitsCounter data', () => {
      const wantedValue = _.sumBy(branches, (branch: Branch) => {
        return branch.logs.length
      })
      const actualValue = branchesStore.commitsCounter
      expect(actualValue).toEqual(wantedValue)
    })
  })

  describe('methods', () => {
    describe('loadBranches function', () => {
      test('should load branches', async () => {
        jest.clearAllMocks()
        jest.clearAllTimers()
        await branchesStore.loadBranches()
        expect(sendRequestSpy).toHaveBeenLastCalledWith(expect.objectContaining({
          methodName: 'GET',
          url: `configs/`,
        }))
      })

      test('should only send a single server request if branches are already being loaded', async () => {
        jest.spyOn(RequestsUtils, 'sendRequest').mockImplementation(
          (requestParams: IRequestParams) => {
            if (requestParams.url === 'configs/') {
              return new Promise(() => {
              })
            }
            return Promise.resolve({data: []})
          })
        jest.clearAllMocks()
        jest.clearAllTimers()
        branchesStore.loadBranches()
        branchesStore.loadBranches()
        branchesStore.loadBranches()
        branchesStore.loadBranches()
        expect(sendRequestSpy).toHaveBeenCalledTimes(1)
      })

      test('should receive the same promise if branches are already being loaded', async () => {
        jest.spyOn(RequestsUtils, 'sendRequest').mockImplementation(
          (requestParams: IRequestParams) => {
            if (requestParams.url === 'configs/') {
              return new Promise(() => {
              })
            }
            return Promise.resolve({data: []})
          })
        jest.clearAllMocks()
        jest.clearAllTimers()
        const firstValue = branchesStore.loadBranches()
        firstValue.then((res: any) => {
          console.log(res)
        }).catch((err: any) => {
          console.log(err)
        })
        const secondValue = branchesStore.loadBranches()
        expect(firstValue).toStrictEqual(secondValue)
      })

      test('should log message when receiving no configs from the server', async () => {
        const originalLog = console.log
        let consoleOutput: string[] = []
        const mockedLog = (output: string) => consoleOutput.push(output)
        consoleOutput = []
        console.log = mockedLog
        jest.spyOn(RequestsUtils, 'sendRequest').mockImplementation(
          (requestParams: IRequestParams) => {
            if (requestParams.url === 'configs/') {
              return Promise.reject(new Error())
            }
            return Promise.resolve({data: []})
          })
        jest.clearAllMocks()
        jest.clearAllTimers()
        try {
          await branchesStore.loadBranches()
          // should not get here
          expect(false).toBeTruthy()
        } catch (err) {
          expect(consoleOutput).toContain(`Error while attempting to get configs`)
        } finally {
          console.log = originalLog
        }
      })
    })

    test('should set selected branch when setSelectedBranch function is called', async () => {
      await branchesStore.setSelectedBranch(branches[1].id)
      expect(branchesStore.selectedBranch).toEqual(branches[1])
    })

    test('should increase commits counter when increaseCommitsCounter function is called', async () => {
      const previousCommitsCounter = branchesStore.commitsCounter
      await branchesStore.increaseCommitsCounter()
      expect(branchesStore.commitsCounter).toEqual(previousCommitsCounter + 1)
    })
  })
})
