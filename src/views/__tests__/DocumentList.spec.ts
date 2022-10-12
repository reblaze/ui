// @ts-nocheck
import DocumentList from '@/views/DocumentList.vue'
import GitHistory from '@/components/GitHistory.vue'
import RbzTable from '@/components/RbzTable'
import DatasetsUtils from '@/assets/DatasetsUtils'
import Utils from '@/assets/Utils'
import {afterEach, beforeEach, describe, expect, jest, test} from '@jest/globals'
import {DOMWrapper, mount, shallowMount} from '@vue/test-utils'
import axios from 'axios'
import _ from 'lodash'
import {
  ACLProfile,
  Branch,
  Commit,
  ContentFilterProfile,
  ContentFilterRule,
  DocumentType,
  FlowControlPolicy,
  GlobalFilter,
  RateLimit,
  SecurityPolicy,
} from '@/types'
import {setImmediate, setTimeout} from 'timers'
import {nextTick} from 'vue'
import {createRouter, createWebHistory} from 'vue-router'
import {routes} from '@/router'
import {COLUMN_OPTIONS_MAP} from '../documentListConst'

jest.mock('axios')

describe('DocumentList.vue', () => {
  let wrapper: DOMWrapper
  let mockRoute: any
  let mockRouter: any
  let gitData: Branch[]
  let aclDocs: ACLProfile[]
  let aclDocsLogs: Commit[][]
  let aclGitOldVersion: ACLProfile[]
  let globalFilterDocs: GlobalFilter[]
  let securityPoliciesDocs: SecurityPolicy[]
  let flowControlPolicyDocs: FlowControlPolicy[]
  let contentFilterProfilesDocs: ContentFilterProfile[]
  let contentFilterRulesDocs: ContentFilterRule[]
  let rateLimitsDocs: RateLimit[]
  beforeEach((done) => {
    gitData = [
      {
        'id': 'master',
        'description': 'Update entry [__default__] of document [aclprofiles]',
        'date': '2020-11-10T15:49:17+02:00',
        'logs': [
          {
            'version': '7dd9580c00bef1049ee9a531afb13db9ef3ee956',
            'date': '2020-11-10T15:49:17+02:00',
            'parents': [
              'fc47a6cd9d7f254dd97875a04b87165cc484e075',
            ],
            'message': 'Update entry [__default__] of document [aclprofiles]',
            'email': 'curiefense@reblaze.com',
            'author': 'Curiefense API',
          },
          {
            'version': 'fc47a6cd9d7f254dd97875a04b87165cc484e075',
            'date': '2020-11-10T15:48:35+02:00',
            'parents': [
              '5aba4a5b9d6faea1896ee8965c7aa651f76af63c',
            ],
            'message': 'Update entry [__default__] of document [aclprofiles]',
            'email': 'curiefense@reblaze.com',
            'author': 'Curiefense API',
          },
          {
            'version': '5aba4a5b9d6faea1896ee8965c7aa651f76af63c',
            'date': '2020-11-10T15:48:31+02:00',
            'parents': [
              '277c5d7bd0e2eb4b9d2944f7eefdfadf37ba8581',
            ],
            'message': 'Update entry [__default__] of document [aclprofiles]',
            'email': 'curiefense@reblaze.com',
            'author': 'Curiefense API',
          },
          {
            'version': '277c5d7bd0e2eb4b9d2944f7eefdfadf37ba8581',
            'date': '2020-11-10T15:48:22+02:00',
            'parents': [
              '878b47deeddac94625fe7c759786f2df885ec541',
            ],
            'message': 'Update entry [__default__] of document [aclprofiles]',
            'email': 'curiefense@reblaze.com',
            'author': 'Curiefense API',
          },
          {
            'version': '878b47deeddac94625fe7c759786f2df885ec541',
            'date': '2020-11-10T15:48:05+02:00',
            'parents': [
              '93c180513fe7edeaf1c0ca69a67aa2a11374da4f',
            ],
            'message': 'Update entry [__default__] of document [aclprofiles]',
            'email': 'curiefense@reblaze.com',
            'author': 'Curiefense API',
          },
          {
            'version': '93c180513fe7edeaf1c0ca69a67aa2a11374da4f',
            'date': '2020-11-10T15:47:59+02:00',
            'parents': [
              '1662043d2a18d6ad2c9c94d6f826593ff5506354',
            ],
            'message': 'Update entry [__default__] of document [aclprofiles]',
            'email': 'curiefense@reblaze.com',
            'author': 'Curiefense API',
          },
          {
            'version': '1662043d2a18d6ad2c9c94d6f826593ff5506354',
            'date': '2020-11-08T21:31:41+01:00',
            'parents': [
              '16379cdf39501574b4a2f5a227b82a4454884b84',
            ],
            'message': 'Create config [master]\n',
            'email': 'curiefense@reblaze.com',
            'author': 'Curiefense API',
          },
          {
            'version': '16379cdf39501574b4a2f5a227b82a4454884b84',
            'date': '2020-08-27T16:19:06+00:00',
            'parents': [
              'a34f979217215060861b58b3f270e82580c20efb',
            ],
            'message': 'Initial empty config',
            'email': 'curiefense@reblaze.com',
            'author': 'Curiefense API',
          },
          {
            'version': 'a34f979217215060861b58b3f270e82580c20efb',
            'date': '2020-08-27T16:19:06+00:00',
            'parents': [],
            'message': 'Initial empty content',
            'email': 'curiefense@reblaze.com',
            'author': 'Curiefense API',
          },
        ],
        'version': '7dd9580c00bef1049ee9a531afb13db9ef3ee956',
      },
      {
        'id': 'zzz_branch',
        'description': 'Initial empty content',
        'date': '2020-08-27T16:19:06+00:00',
        'logs': [
          {
            'version': 'a34f979217215060861b58b3f270e82580c20efb',
            'date': '2020-08-27T16:19:06+00:00',
            'parents': [],
            'message': 'Initial empty content',
            'email': 'curiefense@reblaze.com',
            'author': 'Curiefense API',
          },
        ],
        'version': 'a34f979217215060861b58b3f270e82580c20efb',
      },
    ]
    aclDocs = [
      {
        'id': '__default__',
        'name': 'default-acl',
        'allow': [],
        'allow_bot': [
          'google',
        ],
        'deny_bot': [],
        'passthrough': [
          'internal',
        ],
        'deny': [
          'tor',
        ],
        'force_deny': [
          'china',
        ],
      },
      {
        'id': '5828321c37e0',
        'name': 'an ACL',
        'allow': [],
        'allow_bot': [
          'google',
          'yahoo',
        ],
        'deny_bot': [],
        'passthrough': [
          'devops',
        ],
        'deny': [
          'tor',
        ],
        'force_deny': [
          'iran',
        ],
      },
    ]
    aclDocsLogs = [
      [
        {
          'version': '7f8a987c8e5e9db7c734ac8841c543d5bc5d9657',
          'date': '2020-11-12T17:23:11+02:00',
          'parents': [
            '82d8f29096af1db07dbf7e1cff581fdf6e1a7440',
          ],
          'message': 'Revert to version [7a24bd37e93e812fa5173c4b2fb0068ad8e4ffdd]',
          'email': 'curiefense@reblaze.com',
          'author': 'Curiefense API',
        },
        {
          'version': '82d8f29096af1db07dbf7e1cff581fdf6e1a7440',
          'date': '2020-11-12T17:22:56+02:00',
          'parents': [
            '7a24bd37e93e812fa5173c4b2fb0068ad8e4ffdd',
          ],
          'message': 'Update entry [__default__] of document [aclprofiles]',
          'email': 'curiefense@reblaze.com',
          'author': 'Curiefense API',
        },
        {
          'version': '7a24bd37e93e812fa5173c4b2fb0068ad8e4ffdd',
          'date': '2020-11-12T17:22:53+02:00',
          'parents': [
            '886baf66ddd032744ac34b848c8412386a160fb3',
          ],
          'message': 'Update entry [__default__] of document [aclprofiles]',
          'email': 'curiefense@reblaze.com',
          'author': 'Curiefense API',
        },
        {
          'version': '886baf66ddd032744ac34b848c8412386a160fb3',
          'date': '2020-11-12T17:22:51+02:00',
          'parents': [
            'af98cb28fc4db3a76c3a51d697b6037e8695dd7b',
          ],
          'message': 'Update entry [__default__] of document [aclprofiles]',
          'email': 'curiefense@reblaze.com',
          'author': 'Curiefense API',
        },
        {
          'version': 'af98cb28fc4db3a76c3a51d697b6037e8695dd7b',
          'date': '2020-11-12T17:22:50+02:00',
          'parents': [
            'cda70058b632405600db1fbc5cf8dfd90514ec30',
          ],
          'message': 'Update entry [__default__] of document [aclprofiles]',
          'email': 'curiefense@reblaze.com',
          'author': 'Curiefense API',
        },
        {
          'version': 'e57349cabbb31dd4f07945a42c2ab91671a5a7b1',
          'date': '2020-11-10T16:00:18+02:00',
          'parents': [
            '78d2193cdaa2818734894ab5bbb85cf932d4f217',
          ],
          'message': 'Revert document [aclprofiles] to version [6c439c1626b15011c8eac9117026e0bb4c9f3a1e]',
          'email': 'curiefense@reblaze.com',
          'author': 'Curiefense API',
        },
        {
          'version': '78d2193cdaa2818734894ab5bbb85cf932d4f217',
          'date': '2020-11-10T16:00:18+02:00',
          'parents': [
            '6c439c1626b15011c8eac9117026e0bb4c9f3a1e',
          ],
          'message': 'Revert document [aclprofiles] to version [7a2448715e1ea8b97fc742cd51ec65703c9d0ef2]',
          'email': 'curiefense@reblaze.com',
          'author': 'Curiefense API',
        },
        {
          'version': '6c439c1626b15011c8eac9117026e0bb4c9f3a1e',
          'date': '2020-11-10T16:00:17+02:00',
          'parents': [
            '7a2448715e1ea8b97fc742cd51ec65703c9d0ef2',
          ],
          'message': 'Revert document [aclprofiles] to version [95c050c78a8ad2e66d946e216f3506a0f7b32278]',
          'email': 'curiefense@reblaze.com',
          'author': 'Curiefense API',
        },
        {
          'version': '7a2448715e1ea8b97fc742cd51ec65703c9d0ef2',
          'date': '2020-11-10T16:00:17+02:00',
          'parents': [
            '95c050c78a8ad2e66d946e216f3506a0f7b32278',
          ],
          'message': 'Revert document [aclprofiles] to version [b9cdba04b4ca00119bd148822ce0bc6a3761f017]',
          'email': 'curiefense@reblaze.com',
          'author': 'Curiefense API',
        },
        {
          'version': '95c050c78a8ad2e66d946e216f3506a0f7b32278',
          'date': '2020-11-10T16:00:16+02:00',
          'parents': [
            'b9cdba04b4ca00119bd148822ce0bc6a3761f017',
          ],
          'message': 'Revert document [aclprofiles] to version [134f8b24c3218e837243ae596a079cfc1ab671db]',
          'email': 'curiefense@reblaze.com',
          'author': 'Curiefense API',
        },
        {
          'version': 'b9cdba04b4ca00119bd148822ce0bc6a3761f017',
          'date': '2020-11-10T16:00:15+02:00',
          'parents': [
            '134f8b24c3218e837243ae596a079cfc1ab671db',
          ],
          'message': 'Revert document [aclprofiles] to version [fa54d53d087ad9d6b4b189188a1cfa68da718d79]',
          'email': 'curiefense@reblaze.com',
          'author': 'Curiefense API',
        },
        {
          'version': '134f8b24c3218e837243ae596a079cfc1ab671db',
          'date': '2020-11-10T16:00:15+02:00',
          'parents': [
            'fa54d53d087ad9d6b4b189188a1cfa68da718d79',
          ],
          'message': 'Revert document [aclprofiles] to version [0ff9c981493ee6d05720398425006fd8b0b1b856]',
          'email': 'curiefense@reblaze.com',
          'author': 'Curiefense API',
        },
        {
          'version': 'fa54d53d087ad9d6b4b189188a1cfa68da718d79',
          'date': '2020-11-10T16:00:14+02:00',
          'parents': [
            '0ff9c981493ee6d05720398425006fd8b0b1b856',
          ],
          'message': 'Revert document [aclprofiles] to version [efe3914cd898ef76bb0b9d12346090a1d112953c]',
          'email': 'curiefense@reblaze.com',
          'author': 'Curiefense API',
        },
        {
          'version': '0ff9c981493ee6d05720398425006fd8b0b1b856',
          'date': '2020-11-10T16:00:13+02:00',
          'parents': [
            'efe3914cd898ef76bb0b9d12346090a1d112953c',
          ],
          'message': 'Revert document [aclprofiles] to version [7b92d1c84d07ea51e9e5500ae86c327f554c7072]',
          'email': 'curiefense@reblaze.com',
          'author': 'Curiefense API',
        },
        {
          'version': 'efe3914cd898ef76bb0b9d12346090a1d112953c',
          'date': '2020-11-10T16:00:13+02:00',
          'parents': [
            '7b92d1c84d07ea51e9e5500ae86c327f554c7072',
          ],
          'message': 'Revert document [aclprofiles] to version [0eed6e6f205bccbff485527c3dab5ed5134beae9]',
          'email': 'curiefense@reblaze.com',
          'author': 'Curiefense API',
        },
        {
          'version': '7b92d1c84d07ea51e9e5500ae86c327f554c7072',
          'date': '2020-11-10T16:00:12+02:00',
          'parents': [
            '0eed6e6f205bccbff485527c3dab5ed5134beae9',
          ],
          'message': 'Revert document [aclprofiles] to version [7ebf09f77d8928025a889225233effc75de786d9]',
          'email': 'curiefense@reblaze.com',
          'author': 'Curiefense API',
        },
        {
          'version': '0eed6e6f205bccbff485527c3dab5ed5134beae9',
          'date': '2020-11-10T16:00:11+02:00',
          'parents': [
            '7ebf09f77d8928025a889225233effc75de786d9',
          ],
          'message': 'Revert document [aclprofiles] to version [8fc02c8a78fae8ac6bf7522222170b6541bae502]',
          'email': 'curiefense@reblaze.com',
          'author': 'Curiefense API',
        },
        {
          'version': '7ebf09f77d8928025a889225233effc75de786d9',
          'date': '2020-11-10T16:00:11+02:00',
          'parents': [
            '8fc02c8a78fae8ac6bf7522222170b6541bae502',
          ],
          'message': 'Revert document [aclprofiles] to version [1e350194f779279bbb9a3a80e89fa2bc45a06f16]',
          'email': 'curiefense@reblaze.com',
          'author': 'Curiefense API',
        },
        {
          'version': '8fc02c8a78fae8ac6bf7522222170b6541bae502',
          'date': '2020-11-10T16:00:10+02:00',
          'parents': [
            '1e350194f779279bbb9a3a80e89fa2bc45a06f16',
          ],
          'message': 'Revert document [aclprofiles] to version [99788d931b6018e8f940cc98c3c51aceb07fc77f]',
          'email': 'curiefense@reblaze.com',
          'author': 'Curiefense API',
        },
        {
          'version': '1e350194f779279bbb9a3a80e89fa2bc45a06f16',
          'date': '2020-11-10T16:00:09+02:00',
          'parents': [
            '99788d931b6018e8f940cc98c3c51aceb07fc77f',
          ],
          'message': 'Revert document [aclprofiles] to version [7dd9580c00bef1049ee9a531afb13db9ef3ee956]',
          'email': 'curiefense@reblaze.com',
          'author': 'Curiefense API',
        },
        {
          'version': '99788d931b6018e8f940cc98c3c51aceb07fc77f',
          'date': '2020-11-10T16:00:07+02:00',
          'parents': [
            '7dd9580c00bef1049ee9a531afb13db9ef3ee956',
          ],
          'message': 'Revert document [aclprofiles] to version [fc47a6cd9d7f254dd97875a04b87165cc484e075]',
          'email': 'curiefense@reblaze.com',
          'author': 'Curiefense API',
        },
        {
          'version': '7dd9580c00bef1049ee9a531afb13db9ef3ee956',
          'date': '2020-11-10T15:49:17+02:00',
          'parents': [
            'fc47a6cd9d7f254dd97875a04b87165cc484e075',
          ],
          'message': 'Update entry [__default__] of document [aclprofiles]',
          'email': 'curiefense@reblaze.com',
          'author': 'Curiefense API',
        },
        {
          'version': 'fc47a6cd9d7f254dd97875a04b87165cc484e075',
          'date': '2020-11-10T15:48:35+02:00',
          'parents': [
            '5aba4a5b9d6faea1896ee8965c7aa651f76af63c',
          ],
          'message': 'Update entry [__default__] of document [aclprofiles]',
          'email': 'curiefense@reblaze.com',
          'author': 'Curiefense API',
        },
        {
          'version': '5aba4a5b9d6faea1896ee8965c7aa651f76af63c',
          'date': '2020-11-10T15:48:31+02:00',
          'parents': [
            '277c5d7bd0e2eb4b9d2944f7eefdfadf37ba8581',
          ],
          'message': 'Update entry [__default__] of document [aclprofiles]',
          'email': 'curiefense@reblaze.com',
          'author': 'Curiefense API',
        },
        {
          'version': '277c5d7bd0e2eb4b9d2944f7eefdfadf37ba8581',
          'date': '2020-11-10T15:48:22+02:00',
          'parents': [
            '878b47deeddac94625fe7c759786f2df885ec541',
          ],
          'message': 'Update entry [__default__] of document [aclprofiles]',
          'email': 'curiefense@reblaze.com',
          'author': 'Curiefense API',
        },
        {
          'version': '878b47deeddac94625fe7c759786f2df885ec541',
          'date': '2020-11-10T15:48:05+02:00',
          'parents': [
            '93c180513fe7edeaf1c0ca69a67aa2a11374da4f',
          ],
          'message': 'Update entry [__default__] of document [aclprofiles]',
          'email': 'curiefense@reblaze.com',
          'author': 'Curiefense API',
        },
        {
          'version': '93c180513fe7edeaf1c0ca69a67aa2a11374da4f',
          'date': '2020-11-10T15:47:59+02:00',
          'parents': [
            '1662043d2a18d6ad2c9c94d6f826593ff5506354',
          ],
          'message': 'Update entry [__default__] of document [aclprofiles]',
          'email': 'curiefense@reblaze.com',
          'author': 'Curiefense API',
        },
        {
          'version': '1662043d2a18d6ad2c9c94d6f826593ff5506354',
          'date': '2020-11-08T21:31:41+01:00',
          'parents': [
            '16379cdf39501574b4a2f5a227b82a4454884b84',
          ],
          'message': 'Create config [master]\n',
          'email': 'curiefense@reblaze.com',
          'author': 'Curiefense API',
        },
      ],
      [
        {
          'version': '93c180513fe7edeaf1c0ca69a67aa2a11374da4f',
          'date': '2020-11-10T15:47:59+02:00',
          'parents': [
            '1662043d2a18d6ad2c9c94d6f826593ff5506354',
          ],
          'message': 'Update entry [__default__] of document [aclprofiles]',
          'email': 'curiefense@reblaze.com',
          'author': 'Curiefense API',
        },
        {
          'version': '1662043d2a18d6ad2c9c94d6f826593ff5506354',
          'date': '2020-11-08T21:31:41+01:00',
          'parents': [
            '16379cdf39501574b4a2f5a227b82a4454884b84',
          ],
          'message': 'Create config [master]\n',
          'email': 'curiefense@reblaze.com',
          'author': 'Curiefense API',
        },
      ],
    ]
    aclGitOldVersion = [
      {
        'id': '__default__',
        'name': 'default-acl',
        'allow': [],
        'allow_bot': [
          'google',
        ],
        'deny_bot': [],
        'passthrough': [
          'internal',
        ],
        'deny': [
          'tor',
        ],
        'force_deny': [
          'china',
        ],
      },
      {
        'id': '5828321c37e0',
        'name': 'copy of default-acl',
        'allow': [],
        'allow_bot': [
          'google',
        ],
        'deny_bot': [],
        'passthrough': [
          'internal',
        ],
        'deny': [
          'tor',
        ],
        'force_deny': [
          'china',
        ],
      },
    ]
    globalFilterDocs = [
      {
        'id': 'xlbp148c',
        'name': 'API Discovery',
        'source': 'self-managed',
        'mdate': '2020-05-23T00:04:41',
        'description': 'Tag API Requests',
        'active': true,
        'tags': ['api'],
        'action': 'monitor',
        'rule': {
          'relation': 'OR',
          'entries': [
            {'relation': 'OR', 'entries': [['ip', '1.1.1.1', null]]},
            {'relation': 'OR', 'entries': [['ip', '2.2.2.2', null]]},
            {'relation': 'OR', 'entries': [['headers', ['headerrr', 'valueeee'], 'anooo']]}],
        },
      }, {
        'id': '07656fbe',
        'name': 'devop internal demo',
        'source': 'self-managed',
        'mdate': '2020-05-23T00:04:41',
        'description': 'this is my own list',
        'active': false,
        'tags': ['internal', 'devops'],
        'action': 'monitor',
        'rule': {
          'relation': 'OR',
          'entries': [
            {'relation': 'OR', 'entries': [['ip', '1.1.1.1', null]]},
            {'relation': 'OR', 'entries': [['ip', '2.2.2.2', null]]},
            {'relation': 'OR', 'entries': [['headers', ['headerrr', 'valueeee'], 'anooo']]}],
        },
      },
    ]
    securityPoliciesDocs = [
      {
        'id': '__default__',
        'name': 'default entry',
        'match': '__default__',
        'map': [
          {
            'name': 'default',
            'match': '/',
            'acl_profile': '5828321c37e0',
            'acl_active': false,
            'content_filter_profile': '009e846e819e',
            'content_filter_active': false,
            'limit_ids': [],
          },
        ],
      },
    ]
    flowControlPolicyDocs = [
      {
        'active': true,
        'description': '',
        'exclude': [],
        'include': ['all'],
        'name': 'flow control policy',
        'key': [
          {'headers': 'something'},
        ],
        'sequence': [
          {
            'method': 'GET',
            'uri': '/login',
            'cookies': {
              'foo': 'bar',
            },
            'headers': {},
            'args': {},
          },
          {
            'method': 'POST',
            'uri': '/login',
            'cookies': {
              'foo': 'bar',
            },
            'headers': {
              'test': 'one',
            },
            'args': {},
          },
        ],
        'action': 'default',
        'timeframe': 60,
        'id': 'c03dabe4b9ca',
      },
      {
        'active': true,
        'description': '',
        'exclude': [],
        'include': ['all'],
        'name': 'flow control policy 2',
        'key': [
          {'headers': 'something'},
        ],
        'sequence': [
          {
            'method': 'GET',
            'uri': '/login',
            'cookies': {
              'foo': 'bar',
            },
            'headers': {},
            'args': {},
          },
          {
            'method': 'POST',
            'uri': '/login',
            'cookies': {
              'foo': 'bar',
            },
            'headers': {
              'test': 'one',
            },
            'args': {},
          },
        ],
        'action': 'default',
        'timeframe': 60,
        'id': '4435d797ab0c',
      },
    ]
    contentFilterProfilesDocs = [{
      'id': '009e846e819e',
      'name': 'content filter',
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
        base64: true,
        dual: false,
        html: false,
        unicode: false,
      },
      'masking_seed': '',
      'content_type': [],
      'active': [],
      'report': [],
      'ignore': [],
    }]
    contentFilterRulesDocs = [{
      'id': '100000',
      'name': '100000',
      'msg': 'SQLi Attempt (Conditional Operator Detected)',
      'operand': '\\s(and|or)\\s+\\d+\\s+.*between\\s.*\\d+\\s+and\\s+\\d+.*',
      'risk': 5,
      'description': 'SQL injection',
      'category': 'sqli',
      'subcategory': 'statement injection',
      'tags': [],
    }]
    rateLimitsDocs = [{
      'id': 'f971e92459e2',
      'name': 'Rate Limit Example Rule 5/60',
      'description': '5 requests per minute',
      'timeframe': '60',
      'thresholds': [
        {
          'limit': '5',
          'action': 'default',
        },
      ],
      'include': ['badpeople'],
      'exclude': ['goodpeople'],
      'key': [{'attrs': 'ip'}],
      'pairwith': {'self': 'self'},
    }, {
      'id': '7785d66b1f92',
      'name': 'New Rate Limit Rule',
      'description': 'test',
      'timeframe': '600',
      'thresholds': [
        {
          'limit': '5',
          'action': 'default',
        },
      ],
      'include': ['all'],
      'exclude': [''],
      'key': [{'attrs': 'ip'}],
      'pairwith': null,
    }, {
      'id': '6fe6109e0e53',
      'name': 'RL',
      'description': 'foo bar',
      'timeframe': '3600',
      'thresholds': [
        {
          'limit': '10',
          'action': 'default',
        },
      ],
      'include': ['blocklist'],
      'exclude': [''],
      'key': [{'attrs': 'ip'}],
      'pairwith': {'header': 'foo'},
    }]
    jest.spyOn(axios.CancelToken, 'source').mockImplementation(() => {
      return {
        token: null,
        cancel: () => {
        },
      }
    })
    jest.spyOn(axios, 'get').mockImplementation((path, config) => {
      if (path === '/conf/api/v3/configs/') {
        return Promise.resolve({data: gitData})
      }
      const branch = wrapper.vm.selectedBranch
      if (path === `/conf/api/v3/configs/${branch}/d/aclprofiles/`) {
        const aclXFields = _.flatMap(COLUMN_OPTIONS_MAP['aclprofiles'], 'fieldNames')
        aclXFields.unshift('id')
        if (config && config.headers && config.headers['x-fields'] === aclXFields.join(', ')) {
          return Promise.resolve({data: _.map(aclDocs, (i) => _.pick(i, aclXFields))})
        }
        return Promise.resolve({data: aclDocs})
      }
      if (path === `/conf/api/v3/configs/${branch}/d/aclprofiles/v/`) {
        return Promise.resolve({data: aclDocsLogs[0]})
      }
      if (path === `/conf/api/v3/configs/${branch}/d/aclprofiles/v/7f8a987c8e5e9db7c734ac8841c543d5bc5d9657/`) {
        return Promise.resolve({data: aclGitOldVersion})
      }
      if (path === `/conf/api/v3/configs/master/d/globalfilters/`) {
        const globalFilterXFields = _.flatMap(COLUMN_OPTIONS_MAP['globalfilters'], 'fieldNames')
        globalFilterXFields.unshift('id')
        if (config && config.headers && config.headers['x-fields'] === globalFilterXFields.join(', ')) {
          return Promise.resolve({data: _.map(globalFilterDocs, (i) => _.pick(i, globalFilterXFields))})
        }
        return Promise.resolve({data: globalFilterDocs})
      }
      if (path === `/conf/api/v3/configs/zzz_branch/d/globalfilters/`) {
        globalFilterDocs.shift()
        const globalFilterXFields = _.flatMap(COLUMN_OPTIONS_MAP['globalfilters'], 'fieldNames')
        globalFilterXFields.unshift('id')
        if (config && config.headers && config.headers['x-fields'] === globalFilterXFields.join(', ')) {
          return Promise.resolve({data: _.map(globalFilterDocs, (i) => _.pick(i, globalFilterXFields))})
        }
        return Promise.resolve({data: globalFilterDocs})
      }
      if (path === `/conf/api/v3/configs/${branch}/d/securitypolicies/`) {
        const securitypoliciesXFields = _.flatMap(COLUMN_OPTIONS_MAP['securitypolicies'], 'fieldNames')
        securitypoliciesXFields.unshift('id')
        if (config && config.headers && config.headers['x-fields'] === securitypoliciesXFields?.join(', ')) {
          return Promise.resolve({data: _.map(securityPoliciesDocs, (i) => _.pick(i, securitypoliciesXFields))})
        }
        return Promise.resolve({data: securityPoliciesDocs})
      }
      if (path === `/conf/api/v3/configs/${branch}/d/flowcontrol/`) {
        const flowcontrolXFields = _.flatMap(COLUMN_OPTIONS_MAP?.flowcontrol, 'fieldNames')
        flowcontrolXFields.unshift('id')
        if (config && config.headers && config.headers['x-fields'] === flowcontrolXFields.join(', ')) {
          return Promise.resolve({data: _.map(flowControlPolicyDocs, (i) => _.pick(i, flowcontrolXFields))})
        }
        return Promise.resolve({data: flowControlPolicyDocs})
      }
      if (path === `/conf/api/v3/configs/${branch}/d/contentfilterprofiles/`) {
        const contentfilterprofilesXFields = _.flatMap(COLUMN_OPTIONS_MAP['contentfilterprofiles'], 'fieldNames')
        contentfilterprofilesXFields.unshift('id')
        if (config && config.headers && config.headers['x-fields'] === contentfilterprofilesXFields.join(', ')) {
          return Promise.resolve({
            data: _.map(contentFilterProfilesDocs, (i) => {
              return _.pick(i, contentfilterprofilesXFields)
            }),
          })
        }
        return Promise.resolve({data: contentFilterProfilesDocs})
      }
      if (path === `/conf/api/v3/configs/${branch}/d/contentfilterrules/`) {
        const contentfilterrulesXFields = _.flatMap(COLUMN_OPTIONS_MAP['contentfilterrules'], 'fieldNames')
        contentfilterrulesXFields.unshift('id')
        if (config && config.headers && config.headers['x-fields'] === contentfilterrulesXFields.join(', ')) {
          return Promise.resolve({data: _.map(contentFilterRulesDocs, (i) => _.pick(i, contentfilterrulesXFields))})
        }
        return Promise.resolve({data: contentFilterRulesDocs})
      }
      if (path === `/conf/api/v3/configs/${branch}/d/ratelimits/`) {
        const ratelimitsXFields = _.flatMap(COLUMN_OPTIONS_MAP['ratelimits'], 'fieldNames')
        ratelimitsXFields.unshift('id')
        if (config && config.headers && config.headers['x-fields'] === ratelimitsXFields.join(', ')) {
          return Promise.resolve({data: _.map(rateLimitsDocs, (i) => _.pick(i, ratelimitsXFields))})
        }
        return Promise.resolve({data: rateLimitsDocs})
      }
      if (path === '/conf/api/v3/configs/master/v/') {
        return Promise.resolve({data: gitData[0].logs})
      }
      if (path === '/conf/api/v3/configs/zzz_branch/v/') {
        return Promise.resolve({data: gitData[1].logs})
      }
      return Promise.resolve({data: []})
    })
    mockRoute = {
      params: {
        branch: 'master',
        doc_type: 'aclprofiles',
      },
      path: `/list/master/aclprofiles`,
      name: `DocumentList`,
    }
    mockRouter = {
      push: jest.fn((val) => {
        const splitParams = val.split('/')
        wrapper.vm.$route.params = {
          branch: splitParams[2],
          doc_type: splitParams[3],
        }
        wrapper.vm.$route.path = val
      }),
    }
    wrapper = shallowMount(DocumentList, {
      global: {
        mocks: {
          $route: mockRoute,
          $router: mockRouter,
        },
      },
    })
    // allow all requests to finish
    setImmediate(() => {
      done()
    })
  })
  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('git history', () => {
    test('should have a git history component with correct data', () => {
      const gitHistory = wrapper.findComponent(GitHistory)
      expect(gitHistory).toBeTruthy()
      expect(gitHistory.vm.gitLog).toEqual(aclDocsLogs[0])
    })

    test('should have an empty git log array if got no git log data from server - response null', () => {
      jest.spyOn(axios, 'get').mockImplementation((path) => {
        if (path === '/conf/api/v3/configs/') {
          return Promise.resolve({data: gitData})
        }
        const branch = wrapper.vm.selectedBranch
        if (path === `/conf/api/v3/configs/${branch}/d/aclprofiles/`) {
          return Promise.resolve({data: aclDocs})
        }
        if (path === `/conf/api/v3/configs/master/d/aclprofiles/v/`) {
          return Promise.resolve(null)
        }
        return Promise.resolve({data: []})
      })
      wrapper = shallowMount(DocumentList, {
        global: {
          mocks: {
            $route: mockRoute,
            $router: mockRouter,
          },
        },
      })
      const gitHistory = wrapper.findComponent(GitHistory)
      expect(gitHistory).toBeTruthy()
    })

    test('should have an empty git log array if got no git log data from server - data null', () => {
      jest.spyOn(axios, 'get').mockImplementation((path) => {
        if (path === '/conf/api/v3/configs/') {
          return Promise.resolve({data: gitData})
        }
        const branch = wrapper.vm.selectedBranch
        if (path === `/conf/api/v3/configs/${branch}/d/aclprofiles/`) {
          return Promise.resolve({data: aclDocs})
        }
        if (path === `/conf/api/v3/configs/master/d/aclprofiles/v/`) {
          return Promise.resolve({data: null})
        }
        return Promise.resolve({data: []})
      })
      wrapper = shallowMount(DocumentList, {
        global: {
          mocks: {
            $route: mockRoute,
            $router: mockRouter,
          },
        },
      })
      const gitHistory = wrapper.findComponent(GitHistory)
      expect(gitHistory).toBeTruthy()
    })

    test('should send API request to restore to the correct version', async () => {
      const wantedVersion = {
        version: '7f8a987c8e5e9db7c734ac8841c543d5bc5d9657',
      }
      const wantedPath = `/conf/api/v3/configs/master/d/aclprofiles/v/${wantedVersion.version}/revert/`
      const putSpy = jest.spyOn(axios, 'put')
      putSpy.mockImplementation(() => Promise.resolve())
      const gitHistory = wrapper.findComponent(GitHistory)
      gitHistory.vm.$emit('restore-version', wantedVersion)
      await nextTick()
      expect(putSpy).toHaveBeenCalledWith(wantedPath)
    })
  })

  describe('route params', () => {
    let router
    let rbzTable
    beforeEach(async () => {
      router = createRouter({
        history: createWebHistory(process.env.BASE_URL),
        routes,
      })
      router.push('/list/zzz_branch/flowcontrol')
      await router.isReady()
      wrapper = mount(DocumentList, {
        global: {
          plugins: [router],
        },
      })
      rbzTable = wrapper.findComponent(RbzTable)
    })
    test('should load correct branch from route when valid', () => {
      expect(wrapper.vm.selectedBranch).toEqual('zzz_branch')
      expect(rbzTable.vm.data[0].name).toEqual('flow control policy')
    })

    test('should load correct doc type from route when valid', () => {
      expect(wrapper.vm.selectedDocType).toEqual('flowcontrol')
      expect(rbzTable.vm.data[0].name).toEqual('flow control policy')
    })

    test('should load correct default branch if got non existent branch in route params', (done) => {
      router.push('/list/random123/random123')
      setImmediate(() => {
        expect(wrapper.vm.selectedBranch).toEqual('master')
        expect(rbzTable.vm.data[0].name).toEqual('API Discovery')
        done()
      })
    })

    test('should load correct default branch if none given in route params', (done) => {
      router.push('/list')
      setImmediate(() => {
        expect(wrapper.vm.selectedBranch).toEqual('master')
        expect(rbzTable.vm.data[0].name).toEqual('API Discovery')
        done()
      })
    })

    test('should load correct default document type if non existent in route params', (done) => {
      router.push('/list/zzz_branch')
      setImmediate(() => {
        expect(wrapper.vm.selectedDocType).toEqual('globalfilters')
        expect(rbzTable.vm.data[0].name).toEqual('devop internal demo')
        done()
      })
    })

    test('should load correct default document type if none given in route params', (done) => {
      router.push('/list/zzz_branch/random123')
      setImmediate(() => {
        expect(wrapper.vm.selectedDocType).toEqual('globalfilters')
        expect(rbzTable.vm.data[0].name).toEqual('devop internal demo')
        done()
      })
    })

    test('should load correct data when changing doc type', (done) => {
      router.push('/list/master/contentfilterprofiles')
      setImmediate(() => {
        expect(wrapper.vm.selectedDocType).toEqual('contentfilterprofiles')
        expect(rbzTable.vm.data[0].name).toEqual('content filter')
        done()
      })
    })

    test('should not load new data if new route is not DocumentList', (done) => {
      const spy = jest.spyOn(wrapper.vm, 'setSelectedDataFromRouteParams')
      router.push('/config/master/contentfilterprofiles')
      setImmediate(() => {
        expect(spy).not.toHaveBeenCalled()
        done()
      })
    })
  })

  describe('no data', () => {
    test('should display correct message when there is no branch data', (done) => {
      jest.spyOn(axios, 'get').mockImplementation((path) => {
        if (path === '/conf/api/v3/configs/') {
          return Promise.resolve({data: []})
        }
        return Promise.resolve({data: []})
      })
      wrapper = shallowMount(DocumentList, {
        global: {
          mocks: {
            $route: mockRoute,
            $router: mockRouter,
          },
        },
      })
      // allow all requests to finish
      setImmediate(() => {
        const noDataMessage: DOMWrapper = wrapper.find('.no-data-message')
        expect(noDataMessage.exists()).toBeTruthy()
        expect(noDataMessage.text().toLowerCase()).toContain('no data found!')
        done()
      })
    })

    test('should display link to version control when there is no branch data', (done) => {
      jest.spyOn(axios, 'get').mockImplementation((path) => {
        if (path === '/conf/api/v3/configs/') {
          return Promise.resolve({data: []})
        }
        return Promise.resolve({data: []})
      })
      wrapper = shallowMount(DocumentList, {
        global: {
          mocks: {
            $route: mockRoute,
            $router: mockRouter,
          },
        },
      })
      // allow all requests to finish
      setImmediate(async () => {
        jest.spyOn(mockRouter, 'push').mockImplementation((path) => {
          expect(path).toEqual('/versioncontrol')
          done()
        })
        const button = wrapper.find('.redirect-version-control-button')
        await button.trigger('click')
      })
    })

    test('should log message when receiving no configs from the server', (done) => {
      const originalLog = console.log
      let consoleOutput: string[] = []
      const mockedLog = (output: string) => consoleOutput.push(output)
      consoleOutput = []
      console.log = mockedLog
      jest.spyOn(axios, 'get').mockImplementation((path) => {
        if (path === '/conf/api/v3/configs/') {
          return Promise.reject(new Error())
        }
        return Promise.resolve({data: {}})
      })
      wrapper = shallowMount(DocumentList, {
        global: {
          mocks: {
            $route: mockRoute,
            $router: mockRouter,
          },
        },
      })
      // allow all requests to finish
      setImmediate(() => {
        expect(consoleOutput).toContain(`Error while attempting to get configs`)
        console.log = originalLog
        done()
      })
    })

    test('should log message when receiving no documents from the server', (done) => {
      const originalLog = console.log
      let consoleOutput: string[] = []
      const mockedLog = (output: string) => consoleOutput.push(output)
      consoleOutput = []
      console.log = mockedLog
      jest.spyOn(axios, 'get').mockImplementation((path) => {
        if (path === '/conf/api/v3/configs/') {
          return Promise.resolve({data: gitData})
        }
        const branch = wrapper.vm.selectedBranch
        const doctype = wrapper.vm.selectedDocType
        if (path === `/conf/api/v3/configs/${branch}/d/${doctype}/`) {
          return Promise.reject(new Error())
        }
        return Promise.resolve({data: {}})
      })
      wrapper = shallowMount(DocumentList, {
        global: {
          mocks: {
            $route: mockRoute,
            $router: mockRouter,
          },
        },
      })
      // allow all requests to finish
      setImmediate(() => {
        expect(consoleOutput).toContain(`Error while attempting to load documents`)
        console.log = originalLog
        done()
      })
    })
  })

  describe('loading indicator', () => {
    test('should display loading indicator when branch not loaded', async () => {
      jest.spyOn(axios, 'get').mockImplementation((path) => {
        if (path === '/conf/api/v3/configs/') {
          return new Promise(() => {
          })
        }
        return Promise.resolve({data: []})
      })
      wrapper = shallowMount(DocumentList, {
        global: {
          mocks: {
            $route: mockRoute,
            $router: mockRouter,
          },
        },
      })
      await nextTick()
      const docLoadingIndicator = wrapper.find('.document-loading')
      expect(docLoadingIndicator.exists()).toBeTruthy()
    })

    test('should display loading indicator when doc type not loaded', async () => {
      jest.spyOn(axios, 'get').mockImplementation((path) => {
        if (path === '/conf/api/v3/configs/') {
          return Promise.resolve({data: gitData})
        }
        const branch = wrapper.vm.selectedBranch
        if (path === `/conf/api/v3/configs/${branch}/d/aclprofiles/`) {
          return new Promise(() => {
          })
        }
        return Promise.resolve({data: []})
      })
      wrapper = shallowMount(DocumentList, {
        global: {
          mocks: {
            $route: mockRoute,
            $router: mockRouter,
          },
        },
      })
      await nextTick()
      const docLoadingIndicator = wrapper.find('.document-loading')
      expect(docLoadingIndicator.exists()).toBeTruthy()
    })
  })

  describe('dropdowns', () => {
    test('should be able to switch branches through dropdown', (done) => {
      const branchSelection = wrapper.find('.branch-selection')
      branchSelection.trigger('click')
      const options = branchSelection.findAll('option')
      branchSelection.setValue(options.at(1).element.value)
      // allow all requests to finish
      setImmediate(() => {
        expect(branchSelection.element.selectedIndex).toEqual(1)
        done()
      })
    })
  })

  describe('buttons', () => {
    describe('download button', () => {
      test('should not attempt to download document when download button is clicked' +
        ' if the full docs data was not loaded yet', async () => {
        jest.spyOn(axios, 'get').mockImplementation((path, config) => {
          if (path === '/conf/api/v3/configs/') {
            return Promise.resolve({data: gitData})
          }
          const branch = wrapper.vm.selectedBranch
          if (path === `/conf/api/v3/configs/${branch}/d/aclprofiles/`) {
            const aclXFields = _.flatMap(COLUMN_OPTIONS_MAP['aclprofiles'], 'fieldNames')
            aclXFields.unshift('id')
            if (config && config.headers && config.headers['x-fields'] === aclXFields.join(', ')) {
              return Promise.resolve({data: _.map(aclDocs, (i) => _.pick(i, aclXFields))})
            }
            setTimeout(() => {
              return Promise.resolve({data: aclDocs})
            }, 5000)
          }
          if (path === `/conf/api/v3/configs/${branch}/d/aclprofiles/v/7f8a987c8e5e9db7c734ac8841c543d5bc5d9657/`) {
            return Promise.resolve({data: aclGitOldVersion})
          }
          return Promise.resolve({data: []})
        })
        wrapper = shallowMount(DocumentList, {
          global: {
            mocks: {
              $route: mockRoute,
              $router: mockRouter,
            },
          },
        })
        const downloadFileSpy = jest.spyOn(Utils, 'downloadFile').mockImplementation(() => {
        })
        await nextTick()
        await nextTick()
        await nextTick()
        const downloadDocButton = wrapper.find('.download-doc-button')
        await downloadDocButton.trigger('click')
        expect(downloadFileSpy).not.toHaveBeenCalled()
      })

      test('should attempt to download document when download button is clicked', async () => {
        const wantedFileName = 'aclprofiles'
        const wantedFileType = 'json'
        const wantedFileData = aclDocs
        const downloadFileSpy = jest.spyOn(Utils, 'downloadFile').mockImplementation(() => {
        })
        await nextTick()
        await nextTick()
        await nextTick()
        const downloadDocButton = wrapper.find('.download-doc-button')
        await downloadDocButton.trigger('click')
        expect(downloadFileSpy).toHaveBeenCalledWith(wantedFileName, wantedFileType, wantedFileData)
      })
    })

    describe('new document button', () => {
      test('should be able to add a new aclprofiles document', (done) => {
        mockRoute.params = {
          branch: 'master',
          doc_type: 'aclprofiles',
        }
        mockRoute.path = `/list/master/aclprofiles`
        wrapper = mount(DocumentList, {
          global: {
            mocks: {
              $route: mockRoute,
              $router: mockRouter,
            },
          },
        })
        // allow all requests to finish
        setImmediate(() => {
          const newACLProfilesDoc = DatasetsUtils.newDocEntryFactory.aclprofiles()
          newACLProfilesDoc.id = expect.any(String)
          const postSpy = jest.spyOn(axios, 'post')
          postSpy.mockImplementation(() => Promise.resolve())
          const rbzTable = wrapper.findComponent(RbzTable)
          rbzTable.vm.$emit('new-button-clicked')
          expect(postSpy).toHaveBeenCalledWith(`/conf/api/v3/configs/master/d/aclprofiles/e/`, newACLProfilesDoc)
          done()
        })
      })

      test('should be able to add a new globalfilters document', (done) => {
        mockRoute.params = {
          branch: 'master',
          doc_type: 'globalfilters',
        }
        mockRoute.path = `/list/master/globalfilters`
        wrapper = mount(DocumentList, {
          global: {
            mocks: {
              $route: mockRoute,
              $router: mockRouter,
            },
          },
        })
        // allow all requests to finish
        setImmediate(() => {
          const newGlobalFilterDoc = DatasetsUtils.newDocEntryFactory.globalfilters()
          newGlobalFilterDoc.id = expect.any(String)
          const postSpy = jest.spyOn(axios, 'post')
          postSpy.mockImplementation(() => Promise.resolve())
          const rbzTable = wrapper.findComponent(RbzTable)
          rbzTable.vm.$emit('new-button-clicked')
          expect(postSpy).toHaveBeenCalledWith(`/conf/api/v3/configs/master/d/globalfilters/e/`, newGlobalFilterDoc)
          done()
        })
      })

      test('should be able to add a new contentfilterprofiles document', (done) => {
        mockRoute.params = {
          branch: 'master',
          doc_type: 'contentfilterprofiles',
        }
        mockRoute.path = `/list/master/contentfilterprofiles`
        wrapper = mount(DocumentList, {
          global: {
            mocks: {
              $route: mockRoute,
              $router: mockRouter,
            },
          },
        })
        setImmediate(() => {
          const newContentFilterProfilesDoc = DatasetsUtils.newDocEntryFactory.contentfilterprofiles()
          newContentFilterProfilesDoc.id = expect.any(String)
          const postSpy = jest.spyOn(axios, 'post')
          postSpy.mockImplementation(() => Promise.resolve())
          const rbzTable = wrapper.findComponent(RbzTable)
          rbzTable.vm.$emit('new-button-clicked')
          const wantedPath = `/conf/api/v3/configs/master/d/contentfilterprofiles/e/`
          expect(postSpy).toHaveBeenCalledWith(wantedPath, newContentFilterProfilesDoc)
          done()
        })
      })

      test('should be able to add a new ratelimits document', (done) => {
        mockRoute.params = {
          branch: 'master',
          doc_type: 'ratelimits',
        }
        mockRoute.path = `/list/master/ratelimits`
        wrapper = mount(DocumentList, {
          global: {
            mocks: {
              $route: mockRoute,
              $router: mockRouter,
            },
          },
        })
        setImmediate(() => {
          const newRateLimitsDoc = DatasetsUtils.newDocEntryFactory.ratelimits()
          newRateLimitsDoc.id = expect.any(String)
          const postSpy = jest.spyOn(axios, 'post')
          postSpy.mockImplementation(() => Promise.resolve())
          const rbzTable = wrapper.findComponent(RbzTable)
          rbzTable.vm.$emit('new-button-clicked')
          expect(postSpy).toHaveBeenCalledWith(`/conf/api/v3/configs/master/d/ratelimits/e/`, newRateLimitsDoc)
          done()
        })
      })

      test('should be able to add a new flowcontrol document', (done) => {
        mockRoute.params = {
          branch: 'master',
          doc_type: 'flowcontrol',
        }
        mockRoute.path = `/list/master/flowcontrol`
        wrapper = mount(DocumentList, {
          global: {
            mocks: {
              $route: mockRoute,
              $router: mockRouter,
            },
          },
        })
        setImmediate(() => {
          const newFlowControlDoc = DatasetsUtils.newDocEntryFactory.flowcontrol()
          newFlowControlDoc.id = expect.any(String)
          const postSpy = jest.spyOn(axios, 'post')
          postSpy.mockImplementation(() => Promise.resolve())
          const rbzTable = wrapper.findComponent(RbzTable)
          rbzTable.vm.$emit('new-button-clicked')
          expect(postSpy).toHaveBeenCalledWith(`/conf/api/v3/configs/master/d/flowcontrol/e/`, newFlowControlDoc)
          done()
        })
      })

      test('should be able to add a new contentfilterrules document', (done) => {
        mockRoute.params = {
          branch: 'master',
          doc_type: 'contentfilterrules',
        }
        mockRoute.path = `/list/master/contentfilterrules`
        wrapper = mount(DocumentList, {
          global: {
            mocks: {
              $route: mockRoute,
              $router: mockRouter,
            },
          },
        })
        setImmediate(() => {
          const newContentFilterRulesDoc = DatasetsUtils.newDocEntryFactory.contentfilterrules()
          newContentFilterRulesDoc.id = expect.any(String)
          const postSpy = jest.spyOn(axios, 'post')
          postSpy.mockImplementation(() => Promise.resolve())
          const rbzTable = wrapper.findComponent(RbzTable)
          rbzTable.vm.$emit('new-button-clicked')
          const wantedPath = `/conf/api/v3/configs/master/d/contentfilterrules/e/`
          expect(postSpy).toHaveBeenCalledWith(wantedPath, newContentFilterRulesDoc)
          done()
        })
      })
    })

    describe('edit document button', () => {
      test('should redirect to correct document when clicking on edit document button', async () => {
        const rbzTable = wrapper.findComponent(RbzTable)
        rbzTable.vm.$emit('edit-button-clicked', aclDocs[1]['id'])
        expect(mockRouter.push).toHaveBeenCalledWith(`/config/master/aclprofiles/${aclDocs[1]['id']}`)
        rbzTable.vm.$emit('edit-button-clicked', aclDocs[0]['id'])
        expect(mockRouter.push).toHaveBeenCalledWith(`/config/master/aclprofiles/${aclDocs[0]['id']}`)
      })
    })
  })

  describe('document column options', () => {
    const buildColumnOptionsTest = (docType: DocumentType) => {
      test(`should load correct column options for ${docType}`, (done) => {
        mockRoute.params = {
          branch: 'master',
          doc_type: docType,
        }
        mockRoute.path = `/list/master/${docType}`
        wrapper = mount(DocumentList, {
          global: {
            mocks: {
              $route: mockRoute,
              $router: mockRouter,
            },
          },
        })
        // allow all requests to finish
        setImmediate(() => {
          expect(wrapper.vm.columns).toEqual(COLUMN_OPTIONS_MAP[docType])
          const defaultDoc = DatasetsUtils.newDocEntryFactory[docType]()
          COLUMN_OPTIONS_MAP[docType].forEach((columnOptions) => {
            if (typeof columnOptions.displayFunction === 'function') {
              expect(typeof columnOptions.displayFunction(defaultDoc) === 'string')
            }
          })
          done()
        })
      })
    }

    const documentTypes: DocumentType[] = [
      'aclprofiles',
      'flowcontrol',
      'globalfilters',
      'ratelimits',
      'securitypolicies',
      'contentfilterprofiles',
      'contentfilterrules',
      'cloud-functions',
      'actions',
    ]
    documentTypes.forEach((docType) => {
      buildColumnOptionsTest(docType)
    })
  })
})

