import {ColumnOptionsMap} from '@/types'


export const HEADER_COLUMNS_MAP: ColumnOptionsMap = {
  'globalfilters': [
    {
      columnTitle: 'Name',
      fieldName: 'name',
      isSortable: true,
      isSearchable: true,
      classes: 'width-120px',
    },
    {
      columnTitle: 'Description',
      fieldName: 'description',
      isSortable: true,
      isSearchable: true,
      classes: 'width-500px ellipsis',
    },
    {
      columnTitle: 'Tags',
      fieldName: 'tags', // TODO: returned array from DB, need to .join(\n)
      isSortable: false,
      isSearchable: true,
      classes: 'width-100px',
    },
    {
      columnTitle: 'Type',
      fieldName: 'source', // TODO: what should to returned there?
      isSortable: true,
      isSearchable: true,
      classes: 'width-80px',
    },
    {
      columnTitle: 'Active',
      fieldName: 'active', // TODO: needs to write a function that returns Yes if active, otherwise returns No(?) if not active
      isSortable: true,
      isSearchable: true,
      classes: 'width-80px',
    },
    {
      columnTitle: 'Action',
      fieldName: 'action',
      isSortable: true,
      isSearchable: true,
      classes: 'width-80px',
    },
    // TODO: should ask Aviv what to get from DB to #ofsections & #ofentries
  ],
  'ratelimits': [
    {
      columnTitle: 'Name',
      fieldName: 'name',
      isSortable: true,
      isSearchable: true,
      classes: 'width-120px',
    },
    {
      columnTitle: 'Description',
      fieldName: 'description',
      isSortable: true,
      isSearchable: true,
      classes: 'width-500px ellipsis',
    },
    {
      columnTitle: 'Limit',
      fieldName: 'limit',
      isSortable: true,
      isSearchable: true,
      classes: 'width-80px',
    },
    {
      columnTitle: 'Pair with',
      fieldName: 'pairwith',
      isSortable: true,
      isSearchable: true,
      classes: 'width-80px',
    },
  ],
  'flowcontrol': [
    // TODO: what should be on there columns header? it isnt in reblaze
    {
      columnTitle: 'Name',
      fieldName: 'name',
      isSortable: true,
      isSearchable: true,
      classes: 'width-120px',
    },
    {
      columnTitle: 'Description',
      fieldName: 'description',
      isSortable: true,
      isSearchable: true,
      classes: 'width-500px ellipsis',
    },
    {
      columnTitle: 'Sequences',
      fieldName: 'sequence', // TODO: needs to returned length of this array
      isSortable: true,
      isSearchable: true,
      classes: 'width-100px',
    },
    {
      columnTitle: 'Timeframe',
      fieldName: 'timeframe',
      isSortable: true,
      isSearchable: true,
      classes: 'width-100px',
    },
    {
      columnTitle: 'Action', // TODO: this parameter is part of object called action: {type: "challenge", params: {}}
      fieldName: 'action',
      isSortable: true,
      isSearchable: true,
      classes: 'width-80px',
    },
  ],
  'aclprofiles': [
  // TODO: add function that combine allow, allow_bot, deny, deny_bot, force_deny, passthrough.
    {
      columnTitle: 'Name',
      fieldName: 'name',
      isSortable: true,
      isSearchable: true,
      classes: 'width-120px',
    },
    {
      columnTitle: 'Description',
      fieldName: 'description',
      isSortable: true,
      isSearchable: true,
      classes: 'width-500px ellipsis',
    },
    {
      columnTitle: 'Tags',
      fieldName: 'tags',
      isSortable: true,
      isSearchable: true,
      classes: 'width-100px',
    },
  ],
  'contentfilterprofiles': [
    {
      columnTitle: 'Name',
      fieldName: 'name',
      isSortable: true,
      isSearchable: true,
      classes: 'width-120px',
    },
    {
      columnTitle: 'Description',
      fieldName: 'description',
      isSortable: true,
      isSearchable: true,
      classes: 'width-500px ellipsis',
    },
    {
      columnTitle: 'Restrict Content Type',
      fieldName: 'content_type', // TODO:should to .join()
      isSortable: true,
      isSearchable: true,
      classes: 'width-150px',
    },
    {
      columnTitle: 'Decoding',
      fieldName: 'decoding', // TODO:should to .join()
      isSortable: true,
      isSearchable: true,
      classes: 'width-80px',
    },

  ],
  'contentfilterrules': [
    {
      columnTitle: 'Name',
      fieldName: 'name',
      isSortable: true,
      isSearchable: true,
      classes: 'width-120px',
    },
    {
      columnTitle: 'Description',
      fieldName: 'description',
      isSortable: true,
      isSearchable: true,
      classes: 'width-500px ellipsis',
    },
    {
      columnTitle: 'Category',
      fieldName: 'category',
      isSortable: true,
      isSearchable: true,
      classes: 'width-80px',
    },
    {
      columnTitle: 'Subcategory',
      fieldName: 'subcategory',
      isSortable: true,
      isSearchable: true,
      classes: 'width-100px',
    },
    {
      columnTitle: 'Risk Level',
      fieldName: 'risk',
      isSortable: true,
      isSearchable: true,
      classes: 'width-90px',
    },
    {
      columnTitle: 'Tags', // TODO: needs to join("/n")
      fieldName: 'tags',
      isSortable: true,
      isSearchable: true,
      classes: 'width-80px',
    },
  ],
}
