import {
  ACLProfile,
  CloudFunction,
  ColumnOptionsMap,
  ContentFilterProfile,
  ContentFilterRule, CustomResponse,
  FlowControlPolicy,
  GlobalFilter,
  RateLimit,
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
      title: 'Action',
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
    {
      title: 'Action',
      fieldNames: ['action'],
      isSortable: true,
      isSearchable: true,
      classes: 'width-80px',
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
      title: 'Timeframe',
      fieldNames: ['timeframe'],
      isSortable: true,
      isSearchable: true,
      classes: 'width-100px',
    },
    {
      title: 'Limits',
      fieldNames: ['thresholds'],
      displayFunction: (item: RateLimit) => {
        return _.map(item.thresholds, 'limit').join('\n')
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
      title: 'Restrict Content Type',
      fieldNames: ['content_type'],
      displayFunction: (item: ContentFilterProfile) => {
        return item['content_type']?.join(', ')
      },
      isSortable: true,
      isSearchable: true,
      classes: 'width-150px',
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
        return item?.tags?.join(', ')
      },
      isSortable: true,
      isSearchable: true,
      classes: 'width-80px',
    },
  ],
  'cloudfunctions': [
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
      displayFunction: (item: CloudFunction) => {
        const titles = DatasetsUtils.titles
        return titles[item.phase]
      },
      isSortable: true,
      isSearchable: true,
      classes: 'width-150px',
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
}
