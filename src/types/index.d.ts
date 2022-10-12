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
    names: ContentFilterEntryMatch[]
    regex: ContentFilterEntryMatch[]
    max_count: number
    max_length: number
  }

  type SecurityPolicyEntryMatch = {
    id: string
    match: string
    name: string
    acl_profile: string
    content_filter_profile: string
    acl_active: boolean
    content_filter_active: boolean
    limit_ids: string[]
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
    limit: number
    action: string
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

  type CloudFunctionsPhaseType = 'request0' | 'request1' | 'response0' | 'response1'

  type Document =
    BasicDocument
    & (ACLProfile | CloudFunction | ContentFilterProfile | ContentFilterRule | CustomResponse | FlowControlPolicy | GlobalFilter | RateLimit | SecurityPolicy)

  type DocumentType =
    'aclprofiles'
    | 'flowcontrol'
    | 'globalfilters'
    | 'ratelimits'
    | 'securitypolicies'
    | 'contentfilterprofiles'
    | 'contentfilterrules'
    | 'cloudfunctions'
    | 'actions'

  // Document types helpers - END

  // Document types - START

  type BasicDocument = {
    id: string
    name: string
  }

  type ACLProfile = {
    id: string
    name: string
    description: string
    action: string
    tags: string[]
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
    description: string
    action: string
    tags: string[]
    ignore_body: boolean
    ignore_alphanum: boolean
    headers: ContentFilterProfileSection
    cookies: ContentFilterProfileSection
    args: ContentFilterProfileSection
    path: ContentFilterProfileSection
    decoding: {
      base64: boolean
      dual: boolean
      html: boolean
      unicode: boolean
    }
    masking_seed: string
    content_type: string[]
    active: string[]
    report: string[]
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
    action: string
    rule: {
      relation: Relation
      entries: GlobalFilterSection[]
    }
  }

  type SecurityPolicy = {
    id: string
    name: string
    match: string
    map: SecurityPolicyEntryMatch[]
  }

  type CloudFunction = {
    id: string
    name: string
    description: string
    code: string
    phase: CloudFunctionsPhaseType
  }

  type RateLimit = {
    id: string
    name: string
    global: boolean
    description: string
    thresholds: ThresholdActionPair[]
    key: LimitOptionType[]
    timeframe: number
    tags: string[]
    exclude: string[]
    include: string[]
    pairwith: LimitOptionType
  }

  type CustomResponse = {
    id: string
    name: string
    description: string
    tags: string[]
    type: 'skip' | 'custom' | 'challenge' | 'monitor'
    params?: {
      status: number
      headers: GenericObject
      content: string
    }
  }

  type HttpRequestMethods = typeof httpRequestMethods[number]

  type FlowControlPolicy = {
    id: string
    name: string
    timeframe: number
    active: boolean
    description: string
    key: LimitOptionType[]
    tags: string[]
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

  // Document types - END

  // Document other - START

  type ColumnOptions = {
    title: string
    fieldNames: string[]
    displayFunction?: (item: any) => string // Will be rendered as HTML
    isSortable?: boolean
    isSearchable?: boolean
    classes?: string
  }

  type ColumnOptionsMap = {
    [key: string]: ColumnOptions[]
  }

  // Document other - END

  // Operation documents - START

  type BackendService = {
    name: string
    id: string
    description: string
    least_conn: boolean
    http11: boolean
    transport_mode: string
    sticky: string
    back_hosts: {
      http_port: number
      https_port: number
      weight: number
      fail_timeout: string
      monitor_state: string
      down: boolean
      host: string
      max_fails: number
      backup: boolean
    }[]
  }

  type RoutingProfileEntryLocation = {
    path: string
    backend_id: string
    cloud_functions: string[]
  }

  type RoutingProfile = {
    name: string
    id: string
    description: string
    locations: RoutingProfileEntryLocation[]
  }

  type MobileSDKConfig = {
    active: boolean
    json: string
    name: string
  }

  type MobileSDKSignature = {
    name: string
    hash: string
    active: boolean
  }

  type MobileSDK = {
    id: string
    name: string
    description: string
    secret: string
    var_name: string
    uid_header: string
    grace: string
    grace_var_name: string
    validator_type: string
    active_config: MobileSDKConfig[]
    signatures: MobileSDKSignature[]
    support_legacy_sdk: boolean
  }

  type ProxyTemplate = {
    name: string
    id: string
    description: string
    acao_header: boolean
    xff_header_name: string
    post_private_args: string
    proxy_connect_timeout: string
    proxy_send_timeout: string
    proxy_read_timeout: string
    upstream_host: string
    client_body_timeout: string
    client_header_timeout: string
    keepalive_timeout: string
    send_timeout: string
    client_max_body_size: string
    limit_req_rate: string
    limit_req_burst: string
    session_key: string
    mask_headers: string
    xrealip_header_name: string
    custom_listener: boolean
  }

  type Site = {
    name: string
    id: string
    description: string
    canonical_name: string
    server_names: string[]
    security_policy: SecurityPolicy['id']
    routing_profile: RoutingProfile['id']
    proxy_template: ProxyTemplate['id']
    mobile_sdk: MobileSDK['id']
    ssl_certificate?: string
  }

  // Operation documents - END

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

  // Git - END

}
export = CuriefenseClient
