import {
  ACLProfile,
  ContentFilterProfile,
  ContentFilterRule, CustomResponse,
  FlowControlPolicy,
  GlobalFilter,
  HttpRequestMethods,
  RateLimit,
  SecurityPolicy,
  CloudFunction,
  DynamicRule,
  QuarantinedIps,
} from '@/types'

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
  'ratelimits': 'Rate Limits',
  'ratelimits-singular': 'Rate Limit',
  'securitypolicies': 'Security Policies',
  'securitypolicies-singular': 'Security Policy',
  'contentfilterprofiles': 'Content Filter Profiles',
  'contentfilterprofiles-singular': 'Content Filter Profile',
  'contentfilterrules': 'Content Filter Rules',
  'contentfilterrules-singular': 'Content Filter Rule',
  'cloud-functions': 'Cloud Functions',
  'cloudfunctions-singular': 'Cloud Function',
  'globalfilters': 'Global Filters',
  'globalfilters-singular': 'Global Filter',
  'quarantinedips-singular': 'Quarantined IPs',
  'quarantinedips': 'Quarantined IPs',
  'flowcontrol': 'Flow Control Policies',
  'flowcontrol-singular': 'Flow Control Policy',
  'actions': 'Custom Responses',
  'actions-singular': 'Custom Response',
  'active': 'Active',
  'report': 'Report',
  'ignore': 'Ignore',
  'request0': 'Request Pre Reblaze',
  'request1': 'Request Post Reblaze',
  'response0': 'Response Pre Reblaze',
  'response1': 'Response Post Reblaze',
}

const limitOptionsTypes = {
  'headers': 'Header',
  'cookies': 'Cookie',
  'args': 'Argument',
  'attrs': 'Attribute',
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
      'action': 'default',
      'tags': [],
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
      'action': 'default',
      'tags': [],
      'ignore_body': true,
      'ignore_alphanum': true,
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
      'action': 'monitor',
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
      'map': [
        {
          'id': generateUUID2(),
          'match': '/',
          'name': 'default',
          'acl_profile': '__default__',
          'content_filter_profile': '__default__',
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
      'description': 'New Rate Limit Rule Description and Remarks',
      'timeframe': 60,
      'thresholds': [
        {
          'limit': 5,
          'action': 'default',
        },
      ],
      'include': ['all'],
      'exclude': [],
      'key': [
        {
          'attrs': 'securitypolicyid',
        },
        {
          'attrs': 'pathmatchingid',
        },
        {
          'headers': 'rbzsessionid',
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
      'tags': [],
      'key': [
        {
          'attrs': 'ip',
        },
      ],
      'sequence': [
        {...defaultFlowControlSequenceItem},
        {
          ...defaultFlowControlSequenceItem,
          method: 'POST' as HttpRequestMethods,
        },
      ],
    }
  },

  'cloud-functions'(): CloudFunction {
    return {
      'id': generateUUID2(),
      'name': 'New Cloud Function',
      'description': 'New Cloud Function Description and Remarks',
      'phase': 'request1',
      'code': `-- begin custom code
        --custom response header
        ngx.header['foo'] = 'bar'`,
    }
  },

  'dynamic-rules'(): DynamicRule {
    return {
      'id': generateUUID2(),
      'name': 'New Dynamic Rule',
      'description': 'New Dynamic Rule Description and Remarks',
      'timeframe': 60,
      'threshold': 9999,
      'active': false,
      'include': ['all'],
      'exclude': [],
      'ttl': 7200,
      'target': '1.1.1.1',
    }
  },

  quarantinedips() {
    return {
      'ip': '9.9.9.9',
      'geo': 'israel',
      'asn': '',
      'violations': 'First',
      'limit': '5',
      'added': false,
      'last_seen': '01/09/2022',
      'expires': '15/11/22',
    } as QuarantinedIps
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
      'tags': [],
    }
  },

  'actions'(): CustomResponse {
    return {
      'id': generateUUID2(),
      'name': 'New Custom Response',
      'description': 'New Custom Response Rule Description and Remarks',
      'tags': [],
      'type': 'monitor',
    }
  },
}

export default {
  name: 'DatasetsUtils',
  titles,
  limitOptionsTypes,
  generateUUID,
  generateUUID2,
  newDocEntryFactory,
  defaultFlowControlSequenceItem,
}
