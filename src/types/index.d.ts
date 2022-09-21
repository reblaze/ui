/* eslint-disable */
import {httpRequestMethods} from './const'

declare module CuriefenseClient {

  type GenericObject = { [key: string]: any }

  type Dictionary<T> = { [key: string]: T }

  type TagsNamespaceValue = {
    neutral?: string[]
    malicious?: string[]
    legitimate?: string[]
  }

  // Document types helpers - START

  type ContentFilterEntryMatch = {
    key: string
    reg: string
    restrict: boolean
    mask: boolean
    type: NamesRegexType
    exclusions: string[]
    keyDirty?: boolean
    regDirty?: boolean
  }

  type ContentFilterProfileSection = {
    names: ContentFilterEntryMatch[],
    regex: ContentFilterEntryMatch[],
    max_count: number,
    max_length: number
  }

  type SecurityPolicyEntryMatch = {
    match: string
    name: string
    acl_profile: string
    content_filter_profile: string
    acl_active: boolean
    content_filter_active: boolean
    limit_ids: string[]
    workers: string[]
  }

  type GlobalFilterSectionEntry = [Category, string | string[], string?]

  type GlobalFilterSection = {
    entries: GlobalFilterSectionEntry[]
    relation: Relation
  }

  type LimitOptionType = {
    [key: string]: string
  }

  type ThresholdActionPair = {
    limit: string
    action: ResponseActionType
  }

  type ResponseActionType = {
    type: 'default' | 'challenge' | 'monitor' | 'response' | 'redirect' | 'ban' | 'request_header'
    params?: {
      status?: string
      duration?: string
      headers?: string
      content?: string
      location?: string
      action?: ResponseActionType
    }
  }

  type ACLProfileFilter = 'allow' | 'allow_bot' | 'deny_bot' | 'passthrough' | 'force_deny' | 'deny'

  type ContentFilterProfileTagLists = 'active' | 'report' | 'ignore'

  type IncludeExcludeType = 'include' | 'exclude'

  type Relation = 'OR' | 'AND'

  type Category = 'path' | 'query' | 'uri' | 'method' | 'ip' | 'asn' | 'country' | 'headers' | 'args' | 'cookies'

  type ContentFilterProfileSectionType = 'headers' | 'args' | 'cookies' | 'path'

  type ArgsCookiesHeadersType = 'headers' | 'args' | 'cookies'

  type LimitRuleType = 'headers' | 'args' | 'cookies' | 'attrs' | 'self'

  type NamesRegexType = 'names' | 'regex'

  type Document =
    BasicDocument
    & (ACLProfile | FlowControlPolicy | GlobalFilter | RateLimit | CloudFunctions | SecurityPolicy | ContentFilterProfile | ContentFilterRule)

  type DocumentType =
    'aclprofiles'
    | 'flowcontrol'
    | 'globalfilters'
    | 'ratelimits'
    | 'securitypolicies'
    | 'contentfilterprofiles'
    | 'contentfilterrules'
    | 'cloudfunctions'

  // Document types helpers - END

  // Document types - START

  type BasicDocument = {
    id: string
    name: string
  }

  type ACLProfile = {
    id: string
    name: string
    allow: string[]
    allow_bot: string[]
    deny_bot: string[]
    passthrough: string[]
    force_deny: string[]
    deny: string[]
  }

  type ContentFilterProfile = {
    id: string
    name: string
    ignore_alphanum: boolean
    headers: ContentFilterProfileSection,
    cookies: ContentFilterProfileSection,
    args: ContentFilterProfileSection,
    path: ContentFilterProfileSection,
    decoding: {
      base64: boolean,
      dual: boolean,
      html: boolean,
      unicode: boolean
    },
    masking_seed: string,
    content_type: string[],
    active: string[],
    report: string[],
    ignore: string[]
  }

  type GlobalFilter = {
    id: string
    name: string
    source: string
    mdate: string // ISO string
    description: string
    active: boolean
    tags: string[]
    action: ResponseActionType
    rule: {
      relation: Relation
      sections: GlobalFilterSection[]
    }
  }

  type SecurityPolicy = {
    id: string
    name: string
    match: string
    map: SecurityPolicyEntryMatch[]
  }

  type CloudFunctions = {
    id: string,
    name: string,
    key?: string,
    description?: string,
    code?: string,
    phase?: CloudFunctionsPhase,
    match?: string,
  }
  // phase: { id: string, name: string}
  type CloudFunctionsPhase = {[key: CloudFunctionsPhaseType]: string}
  type CloudFunctionsPhaseType = 'requestpre' | 'requestpost' | 'responsepre' | 'responsepost'

  type RateLimit = {
    id: string
    name: string
    description: string
    thresholds: ThresholdActionPair[]
    key: LimitOptionType[]
    timeframe: string
    exclude: string[]
    include: string[]
    pairwith: LimitOptionType
  }

  type HttpRequestMethods = typeof httpRequestMethods[number]

  type FlowControlPolicy = {
    id: string
    name: string
    timeframe: number
    active: boolean
    description: string
    key: LimitOptionType[]
    action: ResponseActionType
    exclude: string[]
    include: string[]
    sequence: {
      args: GenericObject
      cookies: GenericObject
      headers: GenericObject
      method: HttpRequestMethods
      uri: string
    }[]
  }

  type ContentFilterRule = {
    id: string
    name: string
    operand: string
    description: string
    risk: number
    msg: string
    category: string
    subcategory: string
    tags: string[]
  }

  type ContentFilterRuleGroup = {
    id: string
    name: string
    description?: string
    content_filter_rule_ids: ContentFilterRule['id'][]
  }

  // Document types - END

  // Document other - START

  type ColumnOptions = {
    title: string
    fieldNames: string[]
    titleDisplayFunction?: (item: any) => string // Will be rendered as HTML
    displayFunction?: (item: any) => string // Will be rendered as HTML
    isSortable?: boolean
    isSearchable?: boolean
    classes?: string
  }

  type ColumnOptionsMap = {
    [key: string]: ColumnOptions[]
  }

  // Document other - END


  // Git - START

  type Branch = {
    id: string
    description: string
    date: string // ISO string
    logs: Commit[]
    version: string
  }

  type Commit = {
    version: string
    date: string // ISO string
    parents: string[]
    message: string
    email: string
    author: string
  }

  type SearchDocument = Document & {
    docType: DocumentType
    description: string
    tags: string
    connections: string[]
    connectedACL: string[]
    connectedContentFilter: string[]
    connectedRateLimits: string[]
    connectedSecurityPolicies: string[]
    map: SecurityPolicyEntryMatch[]
  }

  type Rule = {
    relation: Relation,
    sections: GlobalFilterSection[],
  }

  // Git - END

}
export = CuriefenseClient
