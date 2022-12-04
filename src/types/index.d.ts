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

  type GlobalFilterRuleEntry = [Category, string | string[], string]

  type GlobalFilterRuleSection = {
    relation: Relation
    entries: GlobalFilterRule[]
  }

  type GlobalFilterRule = GlobalFilterRuleSection | GlobalFilterRuleEntry

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

  type Category =
    'args'
    | 'authority'
    | 'company'
    | 'cookies'
    | 'country'
    | 'headers'
    | 'ip'
    | 'method'
    | 'network'
    | 'path'
    | 'securitypolicyentryid'
    | 'asn'
    | 'query'
    | 'region'
    | 'securitypolicyid'
    | 'session'
    | 'subregion'
    | 'uri'
    | ArgsCookiesHeadersType

  type ContentFilterProfileSectionType = 'headers' | 'args' | 'cookies' | 'path' | 'allsections'

  type ArgsCookiesHeadersType = 'headers' | 'args' | 'cookies'

  type NamesRegexType = 'names' | 'regex'

  type EdgeFunctionsPhaseType = 'request' | 'response'

  type Document =
    BasicDocument
    & (ACLProfile | EdgeFunction | ContentFilterProfile | ContentFilterRule | CustomResponse |
    DynamicRule | FlowControlPolicy | GlobalFilter | RateLimit | SecurityPolicy)

  type DocumentType =
    'aclprofiles'
    | 'flowcontrol'
    | 'globalfilters'
    | 'ratelimits'
    | 'securitypolicies'
    | 'contentfilterprofiles'
    | 'contentfilterrules'
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
    allsections: ContentFilterProfileSection
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
    rule: GlobalFilterRuleSection
  }

  type SecurityPolicy = {
    id: string
    name: string
    match: string
    description: string
    tags: string[]
    session: LimitOptionType[]
    session_ids: LimitOptionType[]
    map: SecurityPolicyEntryMatch[]
  }

  type EdgeFunction = {
    id: string
    name: string
    description: string
    code: string
    phase: EdgeFunctionsPhaseType
  }

  type DynamicRule = {
    id: string
    name: string
    active: boolean
    description: string
    timeframe: number
    threshold: number
    exclude: string[]
    include: string[]
    ttl: number,
    target: string
  }


  type RateLimit = {
    id: string
    name: string
    global: boolean
    active: boolean
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
      status?: number
      headers?: GenericObject
      content?: string
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
    fieldNames?: string[]
    isSortByOriginalValue?: boolean
    displayFunction?: (item: any) => string | number // Will be rendered as HTML
    tooltipFunction?: (item: any) => string // Override tooltip (priority: tooltipFunction->displayFunction->fieldName)
    isSortable?: boolean
    isSearchable?: boolean
    isNumber?: boolean // True if all values are always numbers, for sorting
    classes?: string
    cellContentClasses?: string
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
    sticky: 'none' | 'autocookie' | 'customcookie' | 'iphash' | 'least_conn'
    sticky_cookie_name?: string
    back_hosts: {
      http_port: number
      https_port: number
      weight: number
      fail_timeout: number
      monitor_state: string
      down: boolean
      host: string
      max_fails: number
      backup: boolean
    }[]
  }

  type DocumentName = {
    id: string
    name: string
  }

  type RoutingProfileEntryLocation = {
    id: string
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
    uid_header: string
    grace: string
    active_config: MobileSDKConfig[]
    signatures: MobileSDKSignature[]
  }

  type ProxyTemplate = {
    name: string
    id: string
    description: string
    acao_header: boolean
    client_body_timeout: string
    client_header_timeout: string
    client_max_body_size: string
    conf_specific: string
    custom_listener: boolean
    keepalive_timeout: string
    limit_req_rate: string
    limit_req_burst: string
    mask_headers: string
    proxy_connect_timeout: string
    proxy_read_timeout: string
    proxy_send_timeout: string
    send_timeout: string
    ssl_conf_specific: string
    upstream_host: string
    xff_header_name: string
    xrealip_header_name: string
  }

  type Site = {
    name: string
    id: string
    description: string
    server_names: string[]
    security_policy: SecurityPolicy['id']
    routing_profile: RoutingProfile['id']
    proxy_template: ProxyTemplate['id']
    mobile_sdk: MobileSDK['id']
    ssl_certificate: string
  }

  type Link = {
    provider: string
    link: string
    region: string
  }

  type Certificate = {
    id: string
    name?: string
    cert_body: string
    exp_date?: string
    links?: Link[]
    issuer?: string
    le_auto_renew?: boolean
    le_auto_replace?: boolean
    le_hash?: string
    private_key: string
    san?: string[]
    subject?: string
    upload_time?: string
    loading?: boolean
  }

  type Balancer = {
    certificates?: string[]
    default_certificate?: string
    dns_name: string
    listener_name: string
    listener_port: string
    load_balancer_type: string
    name: string
    provider: string
    region: string
    id?: string
    attach_loading?: boolean | string
    detach_loading?: boolean | string
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

  type DnsRecord = {
      name: string,
      resource_records: string[],
      ttl: number,
      type: string
  }

  type Quarantined = {
    id: string
    config: string
    count: number
    timestamp: string
    last_seen: number
    rule_id: string
    tags: string[]
    target: string
    value: string
  }

  type EventLog = {
    timestamp: string
    curiesession: string
    curiesession_ids: { [key: string]: string }
    request_id: string
    arguments: { [key: string]: string }
    path: string
    path_parts: { [key: string]: string }
    authority: string
    cookies: { [key: string]: string }
    headers: { [key: string]: string }
    uri: string
    ip: string
    method: typeof httpRequestMethods[number]
    response_code: number
    logs: string[]
    processing_stage: number
    acl_triggers: {
      id: string
      name: string
      active: boolean
    }[]
    rate_limit_triggers: {
      id: string
      name: string
      active: boolean
    }[]
    global_filter_triggers: {
      id: string
      name: string
      active: boolean
    }[]
    content_filter_triggers: {
      id: string
      name: string
      active: boolean
    }[]
    reason: string
    tags: string[]
    proxy: {
      bytes_sent: string
      geo_lat: string
      geo_long: string
      request_length: string
      request_time: string
      upstream_addr: string
      upstream_response_time: string
      upstream_status: string
    }
    security_config: {
      revision: string
      acl_active: boolean
      cf_active: boolean
      cf_rules: number
      rate_limit_rules: number
      global_filters_active: number
    }
    trigger_counters: {
      acl: number
      acl_active: number
      global_filters: number
      global_filters_active: number
      rate_limit: number
      rate_limit_active: number
      content_filters: number
      content_filters_active: number
    }
  }
}
export = CuriefenseClient
