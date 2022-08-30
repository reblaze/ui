import {
  ACLProfile,
  ColumnOptionsMap,
  ContentFilterProfile,
  ContentFilterRule,
  FlowControlPolicy,
  GlobalFilter,
  RateLimit,
} from '@/types'
import {RESPONSE_ACTIONS} from '@/components/responseActionConst'
import _ from 'lodash'

export const COLUMN_OPTIONS_MAP: ColumnOptionsMap = {
  'globalfilters': [
    {
      columnTitle: 'Name',
      fieldNames: ['name'],
      isSortable: true,
      isSearchable: true,
      classes: 'width-120px',
    },
    {
      columnTitle: 'Description',
      fieldNames: ['description'],
      isSortable: true,
      isSearchable: true,
      classes: 'width-500px ellipsis',
    },
    {
      columnTitle: 'Tags',
      fieldNames: ['tags'],
      displayFunction: (item: GlobalFilter) => {
        return item?.tags?.join('\n')
      },
      isSortable: false,
      isSearchable: true,
      classes: 'width-100px white-space-pre ellipsis',
    },
    {
      columnTitle: 'Active',
      fieldNames: ['active'],
      displayFunction: (item: GlobalFilter) => {
        return item?.active ? 'yes' : 'no'
      },
      isSortable: true,
      isSearchable: true,
      classes: 'width-80px',
    },
    {
      columnTitle: 'Action',
      fieldNames: ['action'],
      displayFunction: (item: GlobalFilter) => {
        return RESPONSE_ACTIONS[item?.action?.type]?.title
      },
      isSortable: true,
      isSearchable: true,
      classes: 'width-80px',
    },
  ],
  'flowcontrol': [
    {
      columnTitle: 'Name',
      fieldNames: ['name'],
      isSortable: true,
      isSearchable: true,
      classes: 'width-120px',
    },
    {
      columnTitle: 'Description',
      fieldNames: ['description'],
      isSortable: true,
      isSearchable: true,
      classes: 'width-500px ellipsis',
    },
    {
      columnTitle: 'Sequences',
      fieldNames: ['sequence'],
      displayFunction: (item: FlowControlPolicy) => {
        return item?.sequence?.length?.toString()
      },
      isSortable: true,
      isSearchable: true,
      classes: 'width-100px',
    },
    {
      columnTitle: 'Timeframe',
      fieldNames: ['timeframe'],
      isSortable: true,
      isSearchable: true,
      classes: 'width-100px',
    },
    {
      columnTitle: 'Action',
      fieldNames: ['action'],
      displayFunction: (item: FlowControlPolicy) => {
        return RESPONSE_ACTIONS[item?.action?.type]?.title
      },
      isSortable: true,
      isSearchable: true,
      classes: 'width-80px',
    },
  ],
  'ratelimits': [
    {
      columnTitle: 'Name',
      fieldNames: ['name'],
      isSortable: true,
      isSearchable: true,
      classes: 'width-120px',
    },
    {
      columnTitle: 'Description',
      fieldNames: ['description'],
      isSortable: true,
      isSearchable: true,
      classes: 'width-500px ellipsis',
    },
    {
      columnTitle: 'Timeframe',
      fieldNames: ['timeframe'],
      isSortable: true,
      isSearchable: true,
      classes: 'width-100px',
    },
    {
      columnTitle: 'Limits',
      fieldNames: ['thresholds'],
      displayFunction: (item: RateLimit) => {
        return _.map(item.thresholds, 'limit').join('\n')
      },
      isSortable: true,
      isSearchable: true,
      classes: 'width-100px white-space-pre ellipsis',
    },
    {
      columnTitle: 'Event',
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
      columnTitle: 'Name',
      fieldNames: ['name'],
      isSortable: true,
      isSearchable: true,
      classes: 'width-120px',
    },
    {
      columnTitle: 'Description',
      fieldNames: ['description'],
      isSortable: true,
      isSearchable: true,
      classes: 'width-500px ellipsis',
    },
    {
      columnTitle: 'Tags',
      fieldNames: ['force_deny', 'passthrough', 'allow_bot', 'deny_bot', 'allow', 'deny'],
      displayFunction: (item: ACLProfile) => {
        return _.concat(
          item['force_deny'],
          item['passthrough'],
          item['allow_bot'],
          item['deny_bot'],
          item['allow'],
          item['deny'],
        )?.join('\n')
      },
      isSortable: true,
      isSearchable: true,
      classes: 'width-100px white-space-pre ellipsis',
    },
  ],
  'contentfilterprofiles': [
    {
      columnTitle: 'Name',
      fieldNames: ['name'],
      isSortable: true,
      isSearchable: true,
      classes: 'width-120px',
    },
    {
      columnTitle: 'Description',
      fieldNames: ['description'],
      isSortable: true,
      isSearchable: true,
      classes: 'width-500px ellipsis',
    },
    {
      columnTitle: 'Restrict Content Type',
      fieldNames: ['content_type'],
      displayFunction: (item: ContentFilterProfile) => {
        return item['content_type']?.join(', ')
      },
      isSortable: true,
      isSearchable: true,
      classes: 'width-150px',
    },
    {
      columnTitle: 'Decoding',
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
      columnTitle: 'Name',
      fieldNames: ['name'],
      isSortable: true,
      isSearchable: true,
      classes: 'width-120px',
    },
    {
      columnTitle: 'Description',
      fieldNames: ['description'],
      isSortable: true,
      isSearchable: true,
      classes: 'width-500px ellipsis',
    },
    {
      columnTitle: 'Category',
      fieldNames: ['category'],
      isSortable: true,
      isSearchable: true,
      classes: 'width-100px',
    },
    {
      columnTitle: 'Subcategory',
      fieldNames: ['subcategory'],
      isSortable: true,
      isSearchable: true,
      classes: 'width-120px',
    },
    {
      columnTitle: 'Risk Level',
      fieldNames: ['risk'],
      isSortable: true,
      isSearchable: true,
      classes: 'width-100px',
    },
    {
      columnTitle: 'Tags',
      fieldNames: ['tags'],
      displayFunction: (item: ContentFilterRule) => {
        return item?.tags?.join(', ')
      },
      isSortable: true,
      isSearchable: true,
      classes: 'width-80px',
    },
  ],
}
