import {
  ACLProfile,
  EdgeFunction,
  ColumnOptionsMap,
  ContentFilterProfile,
  ContentFilterRule,
  CustomResponse,
  FlowControlPolicy,
  GlobalFilter,
  RateLimit,
  SecurityPolicy,
  SecurityPolicyEntryMatch,
} from '@/types'
import _ from 'lodash'
import DatasetsUtils from '@/assets/DatasetsUtils'

export const COLUMN_OPTIONS_MAP: ColumnOptionsMap = {
  'globalfilters': [
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
      title: 'Tags',
      fieldNames: ['tags'],
      displayFunction: (item: GlobalFilter) => {
        return item?.tags?.join('\n')
      },
      isSearchable: true,
      classes: 'width-100px white-space-pre ellipsis',
    },
    {
      title: 'Active',
      fieldNames: ['active'],
      displayFunction: (item: GlobalFilter) => {
        return item?.active ? 'yes' : 'no'
      },
      isSortable: true,
      isSearchable: true,
      classes: 'width-80px',
    },
    {
      title: 'Custom Response',
      fieldNames: ['action'],
      isSortable: true,
      isSearchable: true,
      classes: 'width-80px',
    },
  ],
  'flowcontrol': [
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
      title: 'Tags',
      fieldNames: ['tags'],
      displayFunction: (item: FlowControlPolicy) => {
        return item?.tags?.join('\n')
      },
      isSortable: false,
      isSearchable: true,
      classes: 'width-100px white-space-pre ellipsis',
    },
    {
      title: 'Sequences',
      fieldNames: ['sequence'],
      displayFunction: (item: FlowControlPolicy) => {
        return item?.sequence?.length?.toString()
      },
      isSortable: true,
      isSearchable: true,
      classes: 'width-100px',
    },
    {
      title: 'Timeframe',
      fieldNames: ['timeframe'],
      isSortable: true,
      isSearchable: true,
      classes: 'width-100px',
    },
  ],
  'securitypolicies': [
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
      title: 'Matching Names',
      fieldNames: ['match'],
      isSortable: true,
      isSearchable: true,
      classes: 'width-150px ellipsis',
    },
    {
      title: 'Tags',
      fieldNames: ['tags'],
      displayFunction: (item: SecurityPolicy) => {
        return item?.tags?.join('\n')
      },
      isSortable: true,
      isSearchable: true,
      classes: 'width-100px white-space-pre ellipsis',
    },
    {
      title: 'Connected Profiles & Rules',
      fieldNames: ['map'],
      displayFunction: (item: SecurityPolicy) => {
        const getRateLimitsAmount = () => {
          const amount = _.sumBy(item?.map, (mapEntry: SecurityPolicyEntryMatch) => {
            return mapEntry.limit_ids.length
          })
          return `Rate Limit: ${amount} total`
        }
        const getActiveACLs = () => {
          const active = item?.map?.filter((mapEntry: SecurityPolicyEntryMatch) => {
            return mapEntry.acl_active
          }).length
          const total = item?.map?.length
          return `ACL: ${active} out of ${total} active`
        }
        const getActiveContentFilters = () => {
          const active = item?.map?.filter((mapEntry: SecurityPolicyEntryMatch) => {
            return mapEntry.content_filter_active
          }).length
          const total = item?.map?.length
          return `Content Filter: ${active} out of ${total} active`
        }
        return [
          getActiveContentFilters(),
          getActiveACLs(),
          getRateLimitsAmount(),
        ].join('\n')
      },
      classes: 'width-200px white-space-pre ellipsis',
    },
  ],
  'ratelimits': [
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
      title: 'Tags',
      fieldNames: ['tags'],
      displayFunction: (item: RateLimit) => {
        return item?.tags?.join('\n')
      },
      isSortable: false,
      isSearchable: true,
      classes: 'width-100px white-space-pre ellipsis',
    },
    {
      title: 'Timeframe',
      fieldNames: ['timeframe'],
      isSortable: true,
      isSearchable: true,
      classes: 'width-100px',
    },
    {
      title: 'Thresholds',
      fieldNames: ['thresholds'],
      displayFunction: (item: RateLimit) => {
        return _.map(item.thresholds, 'limit').join(', ')
      },
      isSortable: true,
      isSearchable: true,
      classes: 'width-100px white-space-pre ellipsis',
    },
    {
      title: 'Event',
      fieldNames: ['pairwith'],
      displayFunction: (item: RateLimit) => {
        if (!item.pairwith) {
          return ''
        }
        return _.isEqual(item.pairwith, {'self': 'self'}) ? 'HTTP request' :
          `${Object.keys(item.pairwith)[0]}: ${Object.values(item.pairwith)[0]}`
      },
      isSortable: true,
      isSearchable: true,
      classes: 'width-80px',
    },
  ],
  'aclprofiles': [
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
      title: 'Tags',
      fieldNames: ['tags'],
      displayFunction: (item: ACLProfile) => {
        return item?.tags?.join('\n')
      },
      isSortable: false,
      isSearchable: true,
      classes: 'width-100px white-space-pre ellipsis',
    },
  ],
  'actions': [
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
      title: 'Status Code',
      fieldNames: ['params'],
      displayFunction: (item: CustomResponse) => {
        return item?.params?.status?.toString() || ''
      },
      isSortable: true,
      isSearchable: true,
      classes: 'width-100px white-space-pre ellipsis',
    },
    {
      title: 'Tags',
      fieldNames: ['tags'],
      displayFunction: (item: CustomResponse) => {
        return item?.tags?.join('\n')
      },
      isSortable: false,
      isSearchable: true,
      classes: 'width-100px white-space-pre ellipsis',
    },
    {
      title: 'Type',
      fieldNames: ['type'],
      displayFunction: (item: CustomResponse) => {
        return _.capitalize(item?.type)
      },
      isSortable: true,
      isSearchable: true,
      classes: 'width-120px',
    },
  ],
  'contentfilterprofiles': [
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
      title: 'Tags',
      fieldNames: ['tags'],
      displayFunction: (item: ContentFilterProfile) => {
        return item?.tags?.join('\n')
      },
      isSortable: false,
      isSearchable: true,
      classes: 'width-100px white-space-pre ellipsis',
    },
    {
      title: 'Restrict Content Type',
      fieldNames: ['content_type'],
      displayFunction: (item: ContentFilterProfile) => {
        return item['content_type']?.join('\n')
      },
      isSortable: true,
      isSearchable: true,
      classes: 'width-150px white-space-pre ellipsis',
    },
    {
      title: 'Decoding',
      fieldNames: ['decoding'],
      displayFunction: (item: ContentFilterProfile) => {
        if (!item.decoding) {
          return ''
        }
        const displayValues: string[] = []
        Object.keys(item.decoding).forEach((decodingKey: string) => {
          if (item.decoding[decodingKey as keyof ContentFilterProfile['decoding']]) {
            displayValues.push(decodingKey)
          }
        })
        return displayValues.join('\n')
      },
      isSortable: true,
      isSearchable: true,
      classes: 'width-100px white-space-pre ellipsis',
    },

  ],
  'contentfilterrules': [
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
      title: 'Category',
      fieldNames: ['category'],
      isSortable: true,
      isSearchable: true,
      classes: 'width-100px',
    },
    {
      title: 'Subcategory',
      fieldNames: ['subcategory'],
      isSortable: true,
      isSearchable: true,
      classes: 'width-120px',
    },
    {
      title: 'Risk Level',
      fieldNames: ['risk'],
      isSortable: true,
      isSearchable: true,
      classes: 'width-100px',
    },
    {
      title: 'Tags',
      fieldNames: ['tags'],
      displayFunction: (item: ContentFilterRule) => {
        return item?.tags?.join('\n')
      },
      isSortable: true,
      isSearchable: true,
      classes: 'width-100px white-space-pre ellipsis',
    },
  ],
  'cloud-functions': [
    {
      title: 'Name',
      fieldNames: ['name'],
      isSortable: true,
      isSearchable: true,
      classes: 'width-150px',
    },
    {
      title: 'Description',
      fieldNames: ['description'],
      isSortable: true,
      isSearchable: true,
      classes: 'ellipsis',
    },
    {
      title: 'Phase',
      fieldNames: ['phase'],
      displayFunction: (item: EdgeFunction) => {
        const titles = DatasetsUtils.titles
        return titles[item.phase]
      },
      isSortable: true,
      isSearchable: true,
      classes: 'width-150px',
    },
  ],
  'dynamic-rules': [
    {
      title: 'Name',
      fieldNames: ['name'],
      isSortable: true,
      isSearchable: true,
      classes: 'width-150px',
    },
    {
      title: 'Description',
      fieldNames: ['description'],
      isSortable: true,
      isSearchable: true,
      classes: 'ellipsis',
    },
    {
      title: 'Timeframe',
      fieldNames: ['timeframe'],
      isSortable: true,
      isSearchable: true,
      classes: 'width-100px',
    },
    {
      title: 'Threshold',
      fieldNames: ['threshold'],
      isSortable: true,
      isSearchable: true,
      classes: 'width-100px',
    },
  ],
}
