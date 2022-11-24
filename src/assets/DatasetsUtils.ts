import {
  ACLProfile,
  BackendService,
  ProxyTemplate,
  ContentFilterProfile,
  ContentFilterRule,
  CustomResponse,
  DynamicRule,
  EdgeFunction,
  FlowControlPolicy,
  GlobalFilter,
  HttpRequestMethods,
  MobileSDK,
  RateLimit,
  RoutingProfile,
  SecurityPolicy,
  Site,
} from '@/types'
import _ from 'lodash'

const titles: { [key: string]: string } = {
  'admin': 'Admin',
  'allow': 'Allow',
  'allow_bot': 'Allow Bot',
  'args': 'Arguments',
  'attrs': 'Attributes',
  'audit-log': 'Audit Log',
  'passthrough': 'Passthrough',
  'cookies': 'Cookies',
  'curiefense-lists': 'Curiefense Lists',
  'customsigs': 'Custom Signatures',
  'deny': 'Deny',
  'deny_bot': 'Deny Bot',
  'events-and-attacks': 'Events & Attacks',
  'external-lists': 'External Lists',
  'force_deny': 'Enforce Deny',
  'headers': 'Headers',
  'names': 'Name',
  'reg': 'Regex',
  'regex': 'Regex',
  'saml2-sso': 'SAML2 SSO',
  'top-activities': 'Top Activities',
  'traffic-overview': 'Traffic Overview',
  'update-log': 'Update log',
  'version-control': 'Version Control',
  'include': 'Include',
  'exclude': 'Exclude',
  'headers-entry': 'Header',
  'cookies-entry': 'Cookie',
  'args-entry': 'Argument',
  'attrs-entry': 'Attribute',
  'aclprofiles': 'ACL Profiles',
  'aclprofiles-singular': 'ACL Profile',
  'dynamic-rules': 'Dynamic Rules',
  'dynamic-rules-singular': 'Dynamic Rule',
  'ratelimits': 'Rate Limit Rules',
  'ratelimits-singular': 'Rate Limit Rule',
  'securitypolicies': 'Security Policies',
  'securitypolicies-singular': 'Security Policy',
  'contentfilterprofiles': 'Content Filter Profiles',
  'contentfilterprofiles-singular': 'Content Filter Profile',
  'contentfilterrules': 'Content Filter Rules',
  'contentfilterrules-singular': 'Content Filter Rule',
  'cloud-functions': 'Edge Functions',
  'cloud-functions-singular': 'Edge Function',
  'globalfilters': 'Global Filters',
  'globalfilters-singular': 'Global Filter',
  'quarantined': 'Quarantined List',
  'flowcontrol': 'Flow Control Policies',
  'flowcontrol-singular': 'Flow Control Policy',
  'actions': 'Custom Responses',
  'actions-singular': 'Custom Response',
  'active': 'Active',
  'routing-profiles': 'Routing Profiles',
  'routing-profiles-singular': 'Routing Profile',
  'mobile-sdks': 'MobileSDKs',
  'mobile-sdks-singular': 'MobileSDK',
  'proxy-templates': 'Proxy Templates',
  'proxy-templates-singular': 'Proxy Template',
  'sites': 'Server Groups',
  'sites-singular': 'Server Group',
  'backends': 'Backends Services',
  'backends-singular': 'Backend Service',
  'report': 'Report',
  'ignore': 'Ignore',
  'request': 'Request',
  'response': 'Response',
}

function generateUUID(): string {
  let dt = new Date().getTime()
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = (dt + Math.random() * 16) % 16 | 0
    dt = Math.floor(dt / 16)
    return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16)
  })
}

function generateUUID2(): string {
  return generateUUID().split('-')[4]
}

const defaultFlowControlSequenceItem = {
  'method': 'GET' as HttpRequestMethods,
  'uri': '/',
  'cookies': {},
  'headers': {
    'host': 'www.example.com',
  },
  'args': {},
}

const newDocEntryFactory: { [key: string]: Function } = {
  'aclprofiles'(): ACLProfile {
    return {
      'id': generateUUID2(),
      'name': 'New ACL Profile',
      'description': 'New ACL Profile Description and Remarks',
      'action': 'action-acl-block',
      'tags': ['all'],
      'allow': [],
      'allow_bot': [],
      'deny_bot': [],
      'passthrough': [],
      'force_deny': [],
      'deny': [],
    }
  },

  'contentfilterprofiles'(): ContentFilterProfile {
    return {
      'id': generateUUID2(),
      'name': 'New Content Filter Profile',
      'description': 'New Content Filter Profile Description and Remarks',
      'action': 'action-contentfilter-block',
      'tags': ['all'],
      'ignore_body': true,
      'ignore_alphanum': true,
      'allsections': {
        'names': [],
        'regex': [],
        'max_count': 42,
        'max_length': 1024,
      },
      'headers': {
        'names': [],
        'regex': [],
        'max_count': 42,
        'max_length': 1024,
      },
      'cookies': {
        'names': [],
        'regex': [],
        'max_count': 42,
        'max_length': 1024,
      },
      'args': {
        'names': [],
        'regex': [],
        'max_count': 512,
        'max_length': 1024,
      },
      'path': {
        'names': [],
        'regex': [],
        'max_count': 42,
        'max_length': 1024,
      },
      'decoding': {
        'base64': true,
        'dual': true,
        'html': false,
        'unicode': false,
      },
      'masking_seed': 'CHANGEME',
      'content_type': [],
      'active': ['cf-rule-risk:5', 'cf-rule-risk:4', 'cf-rule-risk:3', 'cf-rule-subcategory:libinjection-xss'],
      'report': [],
      'ignore': [],
    }
  },

  'globalfilters'(): GlobalFilter {
    return {
      'id': generateUUID2(),
      'name': 'New Global Filter',
      'source': 'self-managed',
      'mdate': '',
      'description': 'New Global Filter Description and Remarks',
      'active': false,
      'tags': ['trusted'],
      'action': 'action-global-filter-block',
      'rule': {
        'relation': 'OR',
        'entries': [],
      },
    }
  },

  'securitypolicies'(): SecurityPolicy {
    const id = generateUUID2()
    return {
      'id': id,
      'name': 'New Security Policy',
      'match': `${id}.example.com`,
      'description': 'New Security Policy Description and Remarks',
      'tags': ['all'],
      'session': [
        {
          'attrs': 'ip',
        },
      ],
      'session_ids': [],
      'map': [
        {
          'id': generateUUID2(),
          'match': '/',
          'name': 'default',
          'acl_profile': '__acldefault__',
          'content_filter_profile': '__defaultcontentfilter__',
          'acl_active': false,
          'content_filter_active': false,
          'limit_ids': [],
        },
      ],
    }
  },

  'ratelimits'(): RateLimit {
    return {
      'id': generateUUID2(),
      'name': 'New Rate Limit Rule',
      'global': false,
      'active': false,
      'description': 'New Rate Limit Rule Description and Remarks',
      'timeframe': 60,
      'tags': ['all'],
      'thresholds': [
        {
          'limit': 5,
          'action': 'action-rate-limit-block',
        },
      ],
      'include': ['all'],
      'exclude': [],
      'key': [
        {
          'attrs': 'securitypolicyid',
        },
        {
          'attrs': 'securitypolicyentryid',
        },
        {
          'attrs': 'session',
        },
      ],
      'pairwith': {
        'self': 'self',
      },
    }
  },

  'flowcontrol'(): FlowControlPolicy {
    return {
      'id': generateUUID2(),
      'name': 'New Flow Control Policy',
      'description': 'New Flow Control Policy Description and Remarks',
      'active': true,
      'include': ['all'],
      'exclude': [],
      'timeframe': 60,
      'tags': ['all'],
      'key': [
        {
          'attrs': 'ip',
        },
      ],
      'sequence': [
        _.cloneDeep(defaultFlowControlSequenceItem),
        {
          ..._.cloneDeep(defaultFlowControlSequenceItem),
          method: 'POST' as HttpRequestMethods,
        },
      ],
    }
  },

  'cloud-functions'(): EdgeFunction {
    const id = generateUUID2()
    return {
      'id': id,
      'name': 'New Edge Function ' + id,
      'description': 'New Edge Function Description and Remarks',
      'phase': 'request',
      'code': `-- begin custom code
        --custom response header
        ngx.header['foo'] = 'bar'`,
    }
  },

  'dynamic-rules'(): DynamicRule {
    const id = generateUUID2()
    return {
      'id': id,
      'name': 'New Dynamic Rule ' + id,
      'description': 'New Dynamic Rule Description and Remarks',
      'timeframe': 1,
      'threshold': 9999,
      'active': false,
      'include': ['all'],
      'exclude': [],
      'ttl': 7200,
      'target': 'ip',
    }
  },


  'contentfilterrules'(): ContentFilterRule {
    return {
      'id': generateUUID2(),
      'name': 'New Content Filter Rule',
      'description': 'New Content Filter Rule Description and Remarks',
      'msg': '',
      'operand': '',
      'risk': 1,
      'category': '',
      'subcategory': '',
      'tags': ['all'],
    }
  },

  'actions'(): CustomResponse {
    return {
      'id': generateUUID2(),
      'name': 'New Custom Response',
      'description': 'New Custom Response Rule Description and Remarks',
      'tags': ['all'],
      'type': 'monitor',
    }
  },
}
const newOperationEntryFactory: { [key: string]: Function } = {
  'sites'(): Site {
    const id = generateUUID2()
    return {
      'id': id,
      'name': 'New Site ' + id, // TODO: Remove this random uuid once names are no longer unique
      'description': 'New Site Description and Remarks',
      'server_names': ['www.example.com'],
      'security_policy': '__default__',
      'routing_profile': '__default__',
      'proxy_template': '__default__',
      'mobile_sdk': '',
      'ssl_certificate': 'placeholder',
    }
  },

  'routing-profiles'(): RoutingProfile {
    const id = generateUUID2()
    return {
      'id': id,
      'name': 'New Routing Profile ' + id, // TODO: Remove this random uuid once names are no longer unique
      'description': 'New Routing Profile Description and Remarks',
      'locations': [
        {
          'id': generateUUID2(),
          'path': '/',
          'backend_id': '__default__',
          'cloud_functions': [],
        },
      ],
    }
  },

  'mobile-sdks'(): MobileSDK {
    const id = generateUUID2()
    return {
      'id': id,
      'name': 'New Mobile SDK ' + id, // TODO: Remove this random uuid once names are no longer unique
      'description': 'New Mobile SDK Description and Remarks',
      'uid_header': 'authorization',
      'grace': '5',
      'active_config': [
        {
          'active': true,
          'json': '{}',
          'name': 'Default',
        },
      ],
      'signatures': [],
    }
  },

  'proxy-templates'(): ProxyTemplate {
    const id = generateUUID2()
    return {
      'id': id,
      'name': 'New Proxy Template ' + id, // TODO: Remove this random uuid once names are no longer unique
      'description': 'New Proxy Template Description and Remarks',
      'acao_header': false,
      'client_body_timeout': '5',
      'client_header_timeout': '5',
      'client_max_body_size': '150',
      'conf_specific': '',
      'custom_listener': false,
      'keepalive_timeout': '660',
      'limit_req_rate': '1200',
      'limit_req_burst': '400',
      'mask_headers': '',
      'proxy_connect_timeout': '5',
      'proxy_read_timeout': '60',
      'proxy_send_timeout': '30',
      'send_timeout': '5',
      'ssl_conf_specific': '',
      'upstream_host': '$host',
      'xff_header_name': 'X-Forwarded-For',
      'xrealip_header_name': 'X-Real-IP',
    }
  },

  'backends'(): BackendService {
    const id = generateUUID2()
    return {
      'id': id,
      'name': 'New Backend Service ' + id, // TODO: Remove this random uuid once names are no longer unique
      'description': 'New Backend Service Description and Remarks',
      'least_conn': false,
      'http11': true,
      'transport_mode': 'default',
      'sticky': 'none',
      'back_hosts': [{
        'http_port': 80,
        'https_port': 443,
        'weight': 1,
        'fail_timeout': 10,
        'monitor_state': '',
        'down': false,
        'host': '127.0.0.1',
        'max_fails': 0,
        'backup': false,
      }],
    }
  },

  'dynamic-rules'(): DynamicRule {
    const id = generateUUID2()
    return {
      'id': id,
      'name': 'New Dynamic Rule ' + id,
      'description': 'New Dynamic Rule Description and Remarks',
      'timeframe': 60,
      'threshold': 9999,
      'active': false,
      'include': ['all'],
      'exclude': [],
      'ttl': 7200,
      'target': 'ip',
    }
  },
}

export default {
  name: 'DatasetsUtils',
  titles,
  generateUUID,
  generateUUID2,
  newDocEntryFactory,
  newOperationEntryFactory,
  defaultFlowControlSequenceItem,
}
