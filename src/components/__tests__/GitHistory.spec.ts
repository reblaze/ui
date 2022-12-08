// @ts-nocheck
import GitHistory from '@/components/GitHistory.vue'
import {beforeEach, describe, expect, jest, test} from '@jest/globals'
import {mount} from '@vue/test-utils'
import RequestsUtils, {IRequestParams} from '../../assets/RequestsUtils'
import {nextTick} from 'vue'

describe('GitHistory.vue', () => {
  // Number of log items = 7
  const gitLog = [
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
  ]
  const apiPath = '/conf/api/v3/configs/prod/d/aclprofiles/e/__acldefault__/v/'
  let wrapper: any
  let sendRequestSpy
  beforeEach(async () => {
    sendRequestSpy = jest.spyOn(RequestsUtils, 'sendRequest').mockImplementation(
      (requestParams: IRequestParams) => {
        if (requestParams.url === apiPath) {
          return Promise.resolve({data: gitLog})
        }
        if (requestParams.url === `${apiPath}7dd9580c00bef1049ee9a531afb13db9ef3ee956/revert/`) {
          return Promise.resolve({data: {}})
        }
        return Promise.resolve({data: []})
      })
    wrapper = mount(GitHistory, {
      props: {
        apiPath,
        isCollapsedInitialState: false,
      },
    })
    await nextTick()
  })

  describe('log table rendering', () => {
    test('should only render five rows in addition to header and footer' +
      'if the log has more than 5 rows of data', () => {
      expect(wrapper.findAll('tr').length).toEqual(7)
    })

    test('should render all rows if table expanded in addition to header and footer', async () => {
      await wrapper.setData({expanded: true})
      expect(wrapper.findAll('tr').length).toEqual(9)
    })

    test('should render footer with expand message' +
      'if table is not expanded and more than five items are present', () => {
      const rows = wrapper.findAll('tr')
      const lastRow = rows.at(rows.length - 1)
      expect(lastRow.text()).toEqual('View More')
    })

    test('should render footer with collapse message' +
      'if table is expanded and more than five items are present', async () => {
      await wrapper.setData({expanded: true})
      const rows = wrapper.findAll('tr')
      const lastRow = rows.at(rows.length - 1)
      expect(lastRow.text()).toEqual('View Less')
    })

    test('should not render footer if less than five items are present', async () => {
      const shortGitLog = gitLog.slice(0, 4)
      await wrapper.setData({gitLog: shortGitLog})
      const rows = wrapper.findAll('tr')
      const lastRow = rows.at(rows.length - 1)
      expect(lastRow.text()).not.toEqual('View More')
      expect(lastRow.text()).not.toEqual('View Less')
    })
  })

  describe('log version restoration', () => {
    test('should not render restore button when not hovering over a row', () => {
      expect(wrapper.findAll('.restore-button').length).toEqual(0)
    })

    test('should render a single restore button when hovering over a row', async () => {
      const firstDataRow = wrapper.find('tbody').findAll('tr').at(0)
      await firstDataRow.trigger('mouseover')
      expect(firstDataRow.findAll('.restore-button').length).toEqual(1)
    })

    test('should stop rendering the restore button when no longer hovering over a row', async () => {
      const firstDataRow = wrapper.find('tbody').findAll('tr').at(0)
      await firstDataRow.trigger('mouseover')
      await firstDataRow.trigger('mouseleave')
      expect(firstDataRow.findAll('.restore-button').length).toEqual(0)
    })

    test('should emit a restore-version event when restore button is clicked', async () => {
      jest.clearAllMocks()
      const firstDataRow = wrapper.find('tbody').findAll('tr').at(0)
      await firstDataRow.trigger('mouseover')
      const restoreButton = firstDataRow.find('.restore-button')
      await restoreButton.trigger('click')
      expect(wrapper.emitted('restore-version')).toBeTruthy()
      expect(sendRequestSpy).toHaveBeenCalledWith(expect.objectContaining({
        url: `${apiPath}${gitLog[0].version}/revert/`,
      }))
    })
  })
})
