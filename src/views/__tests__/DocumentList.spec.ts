// @ts-nocheck
import DocumentList from '@/views/DocumentList.vue'
import GitHistory from '@/components/GitHistory.vue'
import DatasetsUtils from '@/assets/DatasetsUtils'
import COLUMN_OPTIONS_MAP from '../documentListConst.ts'
import Utils from '@/assets/Utils'
import {afterEach, beforeEach, describe, expect, jest, test} from '@jest/globals'
import {DOMWrapper, shallowMount} from '@vue/test-utils'
import axios from 'axios'
import _ from 'lodash'
import {
  ACLProfile,
  Branch,
  Commit,
  ContentFilterProfile,
  Document,
  FlowControlPolicy,
  GlobalFilter,
  RateLimit,
  SecurityPolicy,
} from '@/types'
import {setImmediate, setTimeout} from 'timers'
import {nextTick} from 'vue'

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
  let globalFilterDocsLogs: Commit[][]
  let securityPoliciesDocs: SecurityPolicy[]
  let securityPoliciesDocsLogs: Commit[][]
  let flowControlPolicyDocs: FlowControlPolicy[]
  let contentFilterDocs: ContentFilterProfile[]
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
        'action': {
          'type': 'monitor',
          'params': {},
        },
        'rule': {
          'relation': 'OR',
          'sections': [
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
        'action': {
          'type': 'monitor',
          'params': {},
        },
        'rule': {
          'relation': 'OR',
          'sections': [
            {'relation': 'OR', 'entries': [['ip', '1.1.1.1', null]]},
            {'relation': 'OR', 'entries': [['ip', '2.2.2.2', null]]},
            {'relation': 'OR', 'entries': [['headers', ['headerrr', 'valueeee'], 'anooo']]}],
        },
      },
    ]
    globalFilterDocsLogs = [
      [
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
    securityPoliciesDocsLogs = [
      [
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
        'action': {
          'type': 'default',
          'params': {},
        },
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
        'action': {
          'type': 'default',
          'params': {},
        },
        'timeframe': 60,
        'id': '4435d797ab0c',
      },
    ]
    contentFilterDocs = [{
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
    rateLimitsDocs = [{
      'id': 'f971e92459e2',
      'name': 'Rate Limit Example Rule 5/60',
      'description': '5 requests per minute',
      'timeframe': '60',
      'thresholds': [
        {
          'limit': '5',
          'action': {'type': 'default', 'params': {'action': {'type': 'default', 'params': {}}}},
        },
      ],
      'include': ['badpeople'],
      'exclude': ['goodpeople'],
      'key': [{'attrs': 'ip'}],
      'pairwith': {'self': 'self'},
    }]
    jest.spyOn(axios.CancelToken, 'source').mockImplementation(() => {
      return {
        token: null,
        cancel: () => {
        },
      }
    })
    jest.spyOn(axios, 'get').mockImplementation((path, config) => {
      if (path === '/conf/api/v2/configs/') {
        return Promise.resolve({data: gitData})
      }
      const branch = wrapper.vm.selectedBranch
      if (path === `/conf/api/v2/configs/${branch}/d/aclprofiles/`) {
        const aclXFields = _.flatMap(COLUMN_OPTIONS_MAP?.aclprofiles, 'fieldNames')
        aclXFields.unshift('id')
        if (config && config.headers && config.headers['x-fields'] === aclXFields.join(', ')) {
          return Promise.resolve({data: _.map(aclDocs, (i) => _.pick(i, aclXFields))})
        }
        return Promise.resolve({data: aclDocs})
      }
      if (path === `/conf/api/v2/configs/${branch}/d/aclprofiles/v/7f8a987c8e5e9db7c734ac8841c543d5bc5d9657/`) {
        return Promise.resolve({data: aclGitOldVersion})
      }
      if (path === `/conf/api/v2/configs/${branch}/d/globalfilters/`) {
        const globalFilterXFields = _.flatMap(COLUMN_OPTIONS_MAP?.globalfilters, 'fieldNames')
        globalFilterXFields.unshift('id')
        if (config && config.headers && config.headers['x-fields'] === globalFilterXFields.join(', ')) {
          return Promise.resolve({data: _.map(globalFilterDocs, (i) => _.pick(i, globalFilterXFields))})
        }
        return Promise.resolve({data: globalFilterDocs})
      }
      if (path === `/conf/api/v2/configs/${branch}/d/securitypolicies/`) {
        const securitypoliciesXFields = _.flatMap(COLUMN_OPTIONS_MAP?.securitypolicies, 'fieldNames')
        securitypoliciesXFields.unshift('id')
        if (config && config.headers && config.headers['x-fields'] === securitypoliciesXFields?.join(', ')) {
          return Promise.resolve({data: _.map(securityPoliciesDocs, (i) => _.pick(i, securitypoliciesXFields))})
        }
        return Promise.resolve({data: securityPoliciesDocs})
      }
      if (path === `/conf/api/v2/configs/${branch}/d/flowcontrol/`) {
        const flowcontrolXFields = _.flatMap(COLUMN_OPTIONS_MAP?.flowcontrol, 'fieldNames')
        flowControlPolicyDocs.unshift('id')
        if (config && config.headers && config.headers['x-fields'] === flowcontrolXFields.join(', ')) {
          return Promise.resolve({data: _.map(flowControlPolicyDocs, (i) => _.pick(i, flowcontrolXFields))})
        }
        return Promise.resolve({data: flowControlPolicyDocs})
      }
      if (path === `/conf/api/v2/configs/${branch}/d/contentfilterprofiles/`) {
        const contentfilterprofilesXFields = _.flatMap(COLUMN_OPTIONS_MAP?.contentfilterprofiles, 'fieldNames')
        contentfilterprofilesXFields.unshift('id')
        if (config && config.headers && config.headers['x-fields'] === contentfilterprofilesXFields.join(', ')) {
          return Promise.resolve({data: _.map(contentFilterDocs, (i) => _.pick(i, contentfilterprofilesXFields))})
        }
        return Promise.resolve({data: contentFilterDocs})
      }
      if (path === `/conf/api/v2/configs/${branch}/d/ratelimits/`) {
        const ratelimitsXFields = _.flatMap(COLUMN_OPTIONS_MAP?.ratelimits, 'fieldNames')
        ratelimitsXFields.unshift('id')
        if (config && config.headers && config.headers['x-fields'] === ratelimitsXFields.join(', ')) {
          return Promise.resolve({data: _.map(rateLimitsDocs, (i) => _.pick(i, ratelimitsXFields))})
        }
        return Promise.resolve({data: rateLimitsDocs})
      }
      if (path === '/conf/api/v2/configs/master/v/') {
        return Promise.resolve({data: gitData[0].logs})
      }
      if (path === '/conf/api/v2/configs/zzz_branch/v/') {
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
      push: jest.fn(),
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

  test('should have a git history component with correct data', () => {
    const gitHistory = wrapper.findComponent(GitHistory)
    expect(gitHistory).toBeTruthy()
    expect(gitHistory.vm.gitLog).toEqual(aclDocsLogs[0])
  })

  test('should send API request to restore to the correct version', async () => {
    const wantedVersion = {
      version: '7f8a987c8e5e9db7c734ac8841c543d5bc5d9657',
    }
    const putSpy = jest.spyOn(axios, 'put')
    putSpy.mockImplementation(() => Promise.resolve())
    const gitHistory = wrapper.findComponent(GitHistory)
    gitHistory.vm.$emit('restore-version', wantedVersion)
    await nextTick()
    expect(putSpy).toHaveBeenCalledWith(`/conf/api/v2/configs/master/d/aclprofiles/v/${wantedVersion.version}/revert/`)
  })

  test('should log message when receiving no configs from the server', (done) => {
    const originalLog = console.log
    let consoleOutput: string[] = []
    const mockedLog = (output: string) => consoleOutput.push(output)
    consoleOutput = []
    console.log = mockedLog
    jest.spyOn(axios, 'get').mockImplementation((path) => {
      if (path === '/conf/api/v2/configs/') {
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
      if (path === '/conf/api/v2/configs/') {
        return Promise.resolve({data: gitData})
      }
      const branch = wrapper.vm.selectedBranch
      const doctype = wrapper.vm.selectedDocType
      if (path === `/conf/api/v2/configs/${branch}/d/${doctype}/`) {
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

  describe('route params', () => {
    test('should load correct branch from route when valid', (done) => {
      mockRoute.params = {
        branch: 'zzz_branch',
        doc_type: 'flowcontrol',
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
        const branchSelection = wrapper.find('.branch-selection')
        expect(branchSelection.element.selectedIndex).toEqual(1)
        done()
      })
    })

    test('should load correct doc type from route when valid', (done) => {
      mockRoute.params = {
        branch: 'zzz_branch',
        doc_type: 'flowcontrol',
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
        const docTypeSelection = wrapper.find('.doc-type-selection')
        expect(docTypeSelection.element.selectedIndex).toEqual(1)
        done()
      })
    })

    test('should load correct doc from route when valid', (done) => {
      mockRoute.params = {
        branch: 'zzz_branch',
        doc_type: 'flowcontrol',
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
        const docSelection = wrapper.find('.doc-selection')
        expect(docSelection.element.selectedIndex).toEqual(1)
        done()
      })
    })

    test('should load correct branch from route without changing document type', (done) => {
      mockRoute.params = {
        branch: 'zzz_branch',
        doc_type: 'aclprofiles',
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
        const branchSelection = wrapper.find('.branch-selection')
        expect(branchSelection.element.selectedIndex).toEqual(1)
        const docTypeSelection = wrapper.find('.doc-type-selection')
        expect(docTypeSelection.element.selectedIndex).toEqual(4)
        const docSelection = wrapper.find('.doc-selection')
        expect(docSelection.element.selectedIndex).toEqual(1)
        done()
      })
    })

    test('should load correct document type from route without changing branch', (done) => {
      mockRoute.params = {
        branch: 'master',
        doc_type: 'securitypolicies',
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
        const branchSelection = wrapper.find('.branch-selection')
        expect(branchSelection.element.selectedIndex).toEqual(0)
        const docTypeSelection = wrapper.find('.doc-type-selection')
        expect(docTypeSelection.element.selectedIndex).toEqual(2)
        const docSelection = wrapper.find('.doc-selection')
        expect(docSelection.element.selectedIndex).toEqual(0)
        done()
      })
    })

    test('should load correct default branch if non existent in route params', (done) => {
      mockRoute.params = {}
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
        const branchSelection = wrapper.find('.branch-selection')
        expect(branchSelection.element.selectedIndex).toEqual(0)
        done()
      })
    })

    test('should load correct default document type if non existent in route params', (done) => {
      mockRoute.params = {}
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
        const docTypeSelection = wrapper.find('.doc-type-selection')
        expect(docTypeSelection.element.selectedIndex).toEqual(0)
        done()
      })
    })
  })

  describe('no data', () => {
    test('should display correct message when there is no branch data', (done) => {
      jest.spyOn(axios, 'get').mockImplementation((path) => {
        if (path === '/conf/api/v2/configs/') {
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
        expect(noDataMessage.text().toLowerCase()).toContain('missing branch.')
        done()
      })
    })

    test('should display link to version control when there is no branch data', (done) => {
      jest.spyOn(axios, 'get').mockImplementation((path) => {
        if (path === '/conf/api/v2/configs/') {
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
        const button = wrapper.find('.version-control-referral-button')
        await button.trigger('click')
      })
    })

    // TODO: I need this 2 tests?
    /*test('should display correct message when there is no doc type data', (done) => {
      // it is not possible to get to this state from the UI, but we protect from it anyway
      wrapper.vm.selectedDocType = null
      // allow all requests to finish
      setImmediate(() => {
        const noDataMessage: DOMWrapper = wrapper.find('.no-data-message')
        expect(noDataMessage.exists()).toBeTruthy()
        expect(noDataMessage?.text()?.toLowerCase()).toContain('no data found!')
        expect(noDataMessage?.text()?.toLowerCase()).toContain('missing document type.')
        done()
      })
    })

    test('should display correct message when there is no doc data', (done) => {
      jest.spyOn(axios, 'get').mockImplementation((path) => {
        if (path === '/conf/api/v2/configs/') {
          return Promise.resolve({data: gitData})
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
        expect(noDataMessage?.text()?.toLowerCase()).toContain('no data found!')
        expect(noDataMessage?.text()?.toLowerCase()).toContain('missing document.')
        done()
      })
    })*/
  })

  describe('loading indicator', () => {
    test('should display loading indicator when branch not loaded', async () => {
      jest.spyOn(axios, 'get').mockImplementation((path) => {
        if (path === '/conf/api/v2/configs/') {
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

    // TODO This function should change?
    test('should display loading indicator when doc not loaded', async () => {
      jest.spyOn(axios, 'get').mockImplementation((path) => {
        if (path === '/conf/api/v2/configs/') {
          return Promise.resolve({data: gitData})
        }
        const branch = wrapper.vm.selectedBranch
        if (path === `/conf/api/v2/configs/${branch}/d/aclprofiles/`) {
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

    test('should display loading indicator when adding a new document', async () => {
      jest.spyOn(axios, 'post').mockImplementation(() => new Promise(() => {
      }))
      const newDocumentButton = wrapper.find('.new-document-button')
      await newDocumentButton.trigger('click')
      expect(newDocumentButton.element.classList).toContain('is-loading')
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
    describe('new document button', () => {
      test('should be able to add a new aclprofiles document', () => {
        const newACLProfilesDoc = DatasetsUtils.newDocEntryFactory.aclprofiles()
        newACLProfilesDoc.id = expect.any(String)
        const postSpy = jest.spyOn(axios, 'post')
        postSpy.mockImplementation(() => Promise.resolve())
        const newDocumentButton = wrapper.find('.new-document-button')
        newDocumentButton.trigger('click')
        expect(postSpy).toHaveBeenCalledWith(`/conf/api/v2/configs/master/d/aclprofiles/e/`, newACLProfilesDoc)
      })

      test('should be able to add a new globalfilters document', (done) => {
        mockRoute.params = {
            branch: 'master',
            doc_type: 'globalfilters',
        },
        mockRoute.path = `/list/master/globalfilters`
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
          const newGlobalFilterDoc = DatasetsUtils.newDocEntryFactory.globalfilters()
          newGlobalFilterDoc.id = expect.any(String)
          const postSpy = jest.spyOn(axios, 'post')
          postSpy.mockImplementation(() => Promise.resolve())
          const newDocumentButton = wrapper.find('.new-document-button')
          newDocumentButton.trigger('click')
          expect(postSpy).toHaveBeenCalledWith(`/conf/api/v2/configs/master/d/globalfilters/e/`, newGlobalFilterDoc)
          done()
        })

      })

      test('should be able to add a new contentfilterprofiles document', (done) => {
        mockRoute.params = {
          branch: 'master',
          doc_type: 'contentfilterprofiles',
        },
        mockRoute.path = `/list/master/contentfilterprofiles`
        wrapper = shallowMount(DocumentList, {
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
          const newDocumentButton = wrapper.find('.new-document-button')
          newDocumentButton.trigger('click')
          expect(postSpy).toHaveBeenCalledWith(`/conf/api/v2/configs/master/d/contentfilterprofiles/e/`, newContentFilterProfilesDoc)
          done()
        })
      })

      test('should be able to add a new ratelimits document', (done) => {
        mockRoute.params = {
          branch: 'master',
          doc_type: 'ratelimits',
        },
        mockRoute.path = `/list/master/ratelimits`
        wrapper = shallowMount(DocumentList, {
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
          const newDocumentButton = wrapper.find('.new-document-button')
          newDocumentButton.trigger('click')
          expect(postSpy).toHaveBeenCalledWith(`/conf/api/v2/configs/master/d/ratelimits/e/`, newRateLimitsDoc)
          done()
        })
      })

      test('should be able to add a new flowcontrol document', (done) => {
        mockRoute.params = {
          branch: 'master',
          doc_type: 'flowcontrol',
        },
        mockRoute.path = `/list/master/flowcontrol`
        wrapper = shallowMount(DocumentList, {
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
          const newDocumentButton = wrapper.find('.new-document-button')
          newDocumentButton.trigger('click')
          expect(postSpy).toHaveBeenCalledWith(`/conf/api/v2/configs/master/d/flowcontrol/e/`, newFlowControlDoc)
          done()
        })
      })

      test('should be able to add a new contentfilterrules document', (done) => {
        mockRoute.params = {
          branch: 'master',
          doc_type: 'contentfilterrules',
        },
        mockRoute.path = `/list/master/contentfilterrules`
        wrapper = shallowMount(DocumentList, {
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
          const newDocumentButton = wrapper.find('.new-document-button')
          newDocumentButton.trigger('click')
          expect(postSpy).toHaveBeenCalledWith(`/conf/api/v2/configs/master/d/contentfilterrules/e/`, newContentFilterRulesDoc)
          done()
        })
      })
    })

    // TODO: need to change the x-fields like before?
    test('should not attempt to download document when download button is clicked' +
      ' if the full docs data was not loaded yet', async () => {
      jest.spyOn(axios, 'get').mockImplementation((path, config) => {
        if (path === '/conf/api/v2/configs/') {
          return Promise.resolve({data: gitData})
        }
        const branch = wrapper.vm.selectedBranch
        if (path === `/conf/api/v2/configs/${branch}/d/aclprofiles/`) {
          if (config && config.headers && config.headers['x-fields'] === 'id, name') {
            return Promise.resolve({data: _.map(aclDocs, (i) => _.pick(i, 'id', 'name'))})
          }
          setTimeout(() => {
            return Promise.resolve({data: aclDocs})
          }, 5000)
        }
        if (path === `/conf/api/v2/configs/${branch}/d/aclprofiles/v/7f8a987c8e5e9db7c734ac8841c543d5bc5d9657/`) {
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

  describe('table', () => {
    let globalFilterMock : GlobalFilter[]
    let sortedGlobalFilterMockByNameAsc : GlobalFilter
    let sortedGlobalFilterMockByNameDesc : GlobalFilter
    let sortedGlobalFilterMockByDescriptionDesc : GlobalFilter
    let sortedGlobalFilterMockByDescriptionAsc : GlobalFilter
    let columnTitle : string[]
    beforeEach((done) => {
      globalFilterMock = [
        {
          name:'c test3',
          description: 'c Jest testing description',
          tags: ['apple', 'crawler', 'curiefense'],
          isSortable: true,
          isSearchable: true,
          id: 3
        },
        {
          name:'b test2',
          description: 'b Jest testing description',
          tags: ['crawler', 'curiefense'],
          isSortable: false,
          isSearchable: true,
          id: 2
        },
        {
          name:'a test1',
          description: 'a Jest testing description',
          tags: ['curiefense'],
          isSortable: true,
          isSearchable: false,
          id: 1
        }
      ]
      sortedGlobalFilterMockByNameAsc = [
        {
          name:'a test1',
          description: 'a Jest testing description',
          tags: ['curiefense'],
          isSortable: true,
          isSearchable: false
        },
        {
          name:'b test2',
          description: 'b Jest testing description',
          tags: ['crawler', 'curiefense'],
          isSortable: false,
          isSearchable: true
        },
        {
          name:'c test3',
          description: 'c Jest testing description',
          tags: ['apple', 'crawler', 'curiefense'],
          isSortable: true,
          isSearchable: true
        }
      ]
      sortedGlobalFilterMockByDescriptionAsc = [
        {
          name:'c test3',
          description: 'a Jest testing description',
          tags: ['curiefense'],
          isSortable: true,
          isSearchable: false
        },
        {
          name:'b test2',
          description: 'b Jest testing description',
          tags: ['crawler', 'curiefense'],
          isSortable: false,
          isSearchable: true
        },
        {
          name:'a test1',
          description: 'c Jest testing description',
          tags: ['apple', 'crawler', 'curiefense'],
          isSortable: true,
          isSearchable: true
        }
      ]
      columnTitle = ["Name", "Description", "Tags"]
      sortedGlobalFilterMockByNameDesc = [...sortedGlobalFilterMockByNameAsc].reverse();
      sortedGlobalFilterMockByDescriptionDesc = [...sortedGlobalFilterMockByDescriptionAsc].reverse();
      jest.spyOn(axios, 'get').mockImplementation(() => {
        return Promise.resolve({data: globalFilterMock})
      })

      mockRoute.params.doc_type = 'globalfilters'
      mockRoute.path = `/list/master/globalfilters`
      wrapper = shallowMount(DocumentList, {
        global: {
          mocks: {
            $route: mockRoute,
            $router: mockRouter,
          },
        },
      })
      setImmediate(() => {
        done()
      })
    })
    
    describe('sorting', () => {
      test('should have the correct arrow active by default', () => {
        const ascArrowElement = wrapper.find('.arrow-asc')
        expect(ascArrowElement.element.classList).toContain('active')
      })

      test('should have asc arrow active on click on non sorted column', async () => {
        const header = wrapper.findAll('.column-title').at(1)
        await header.trigger('click')
        const arrowElement = header.find('.arrow-asc')
        expect(arrowElement.element.classList).toContain('active')
      })

      test('should have desc arrow active on click on asc sorted column', async () => {
        const header = wrapper.findAll('.column-title').at(1)
        await header.trigger('click')
        await header.trigger('click')
        const arrowElement = header.find('.arrow-desc')
        expect(arrowElement.element.classList).toContain('active')
      })

      test('should have asc arrow active on click on desc sorted column', async () => {
        const nameCell = wrapper.findAll('.column-title').at(0)
        await nameCell.trigger('click')
        await nameCell.trigger('click')
        const arrowElement = nameCell.find('.arrow-asc')
        expect(arrowElement.element.classList).toContain('active')
      })
      
      test('should have values sorted in ascending order', async () =>{
        const header = wrapper.findAll('.column-title').at(1)
        await header.trigger('click')
        const firstRow = wrapper.findAll('.data-row').at(0)
        const descriptionCellFirstRow = firstRow.findAll('td').at(1)
        const secondRow = wrapper.findAll('.data-row').at(1)
        const descriptionCellSecondRow = secondRow.findAll('td').at(1)
        const thirdRow = wrapper.findAll('.data-row').at(2)
        const descriptionCellThirdRow = thirdRow.findAll('td').at(1)
        expect(descriptionCellFirstRow.text()).toBe(sortedGlobalFilterMockByDescriptionAsc[0]["description"])
        expect(descriptionCellSecondRow.text()).toBe(sortedGlobalFilterMockByDescriptionAsc[1]["description"])
        expect(descriptionCellThirdRow.text()).toBe(sortedGlobalFilterMockByDescriptionAsc[2]["description"])
      })

      test('should have values sorted in descending order', async () =>{
        const header = wrapper.findAll('.column-title').at(1)
        await header.trigger('click')
        await header.trigger('click')
        const firstRow = wrapper.findAll('.data-row').at(0)
        const descriptionCellFirstRow = firstRow.findAll('td').at(1)
        const secondRow = wrapper.findAll('.data-row').at(1)
        const descriptionCellSecondRow = secondRow.findAll('td').at(1)
        const thirdRow = wrapper.findAll('.data-row').at(2)
        const descriptionCellThirdRow = thirdRow.findAll('td').at(1)
        expect(descriptionCellFirstRow.text()).toBe(sortedGlobalFilterMockByDescriptionDesc[0]["description"])
        expect(descriptionCellSecondRow.text()).toBe(sortedGlobalFilterMockByDescriptionDesc[1]["description"])
        expect(descriptionCellThirdRow.text()).toBe(sortedGlobalFilterMockByDescriptionDesc[2]["description"])
      })

      test('should have values sorted in ascending order after sorted descending order', async () =>{
        const header = wrapper.findAll('.column-title').at(0)
        await header.trigger('click')
        await header.trigger('click')
        const firstRow = wrapper.findAll('.data-row').at(0)
        const nameCellFirstRow = firstRow.findAll('td').at(0)
        const secondRow = wrapper.findAll('.data-row').at(1)
        const nameCellSecondRow = secondRow.findAll('td').at(0)
        const thirdRow = wrapper.findAll('.data-row').at(2)
        const nameCellThirdRow = thirdRow.findAll('td').at(0)

        expect(nameCellFirstRow.text()).toBe(sortedGlobalFilterMockByNameAsc[0]["name"])
        expect(nameCellSecondRow.text()).toBe(sortedGlobalFilterMockByNameAsc[1]["name"])
        expect(nameCellThirdRow.text()).toBe(sortedGlobalFilterMockByNameAsc[2]["name"])

      })
            
      test('should have asc arrow in new sorting column when previous was asc arrow', async () =>{
        const descriptionCell = wrapper.findAll('.column-title').at(1)
        await descriptionCell.trigger('click')
        const nameCell = wrapper.findAll('.column-title').at(0)
        await nameCell.trigger('click')
        const ascArrowElement = wrapper.findAll('.arrow-asc').at(0)
        expect(ascArrowElement.element.classList).toContain('active')
      })

      test('should have asc arrow in new sorting column when previous was dsec arrow', async () =>{
        const nameCell = wrapper.findAll('.column-title').at(0)
        await nameCell.trigger('click')
        const descriptionCell = wrapper.findAll('.column-title').at(1)
        await descriptionCell.trigger('click')
        const ascArrowElement = wrapper.findAll('.arrow-asc').at(1)
        expect(ascArrowElement.element.classList).toContain('active')
      })

      test('should not have arrows when the column is non sortable', () => {
        const tagsCell = wrapper.findAll('.column-title').at(2)
        expect(tagsCell.element.classList).not.toContain('is-clickable')
      })

      test('should not do anything when clicking on non sortable cell', async () => {
        const tagsCell = wrapper.findAll('.column-title').at(2)
        await tagsCell.trigger('click')
        const firstRow = wrapper.findAll('.data-row').at(0)
        const descriptionCellFirstRow = firstRow.findAll('td').at(1)
        const secondRow = wrapper.findAll('.data-row').at(1)
        const descriptionCellSecondRow = secondRow.findAll('td').at(1)
        const thirdRow = wrapper.findAll('.data-row').at(2)
        const descriptionCellThirdRow = thirdRow.findAll('td').at(1)
        expect(descriptionCellFirstRow.text()).toBe(sortedGlobalFilterMockByDescriptionAsc[0]["description"])
        expect(descriptionCellSecondRow.text()).toBe(sortedGlobalFilterMockByDescriptionAsc[1]["description"])
        expect(descriptionCellThirdRow.text()).toBe(sortedGlobalFilterMockByDescriptionAsc[2]["description"])
      })
    })

    describe('filtering', () => {
      test('should have invisible icon state on the first load', async () => {
        const filterButton = wrapper.find('.filter-toggle')
        expect(filterButton.element.classList).not.toContain('is-active')
      })

      test('should have to change to visible state after click on the filter icon', async () => {
        const filterButton = wrapper.find('.filter-toggle')
        await filterButton.trigger('click')
        expect(filterButton.element.classList).toContain('is-active')
      })

      test('should not show the search row in the first load', async () => {
        const filterHeader = wrapper.find('search-row')
        expect(filterHeader.exists()).toBe(false)
      })

      test('should have to click on the filter button to expose the search row', async () => {
        const filterButton = wrapper.find('.filter-toggle')
        await filterButton.trigger('click')
        const filterHeader = wrapper.findAll('.header-row').at(1)
        expect(filterHeader.element.classList).toContain('search-row')
      })

      test('should have to click twice on the filter button to see if search row is disappear', async () => {
        const filterButton = wrapper.find('.filter-toggle')
        await filterButton.trigger('click')
        await filterButton.trigger('click')
        const filterRow = wrapper.find('search-row')
        expect(filterRow.exists()).toBe(false)
      })

      test('should have to check if the placeholders in the filter cells are the same as the column title', async () => {
        const filterButton = wrapper.find('.filter-toggle')
        await filterButton.trigger('click')
        const nameInput = wrapper.findAll('.filter-input').at(0).attributes('placeholder')
        const descriptionInput = wrapper.findAll('.filter-input').at(1).attributes('placeholder')
        const tagsInput = wrapper.findAll('.filter-input').at(2).attributes('placeholder')
        expect(nameInput).toBe(columnTitle[0]);
        expect(descriptionInput).toBe(columnTitle[1]);
        expect(tagsInput).toBe(columnTitle[2]);
      })

      test('should have to filter values', async () =>{
        const filterButton = wrapper.find('.filter-toggle')
        await filterButton.trigger('click')
        const nameInput = wrapper.findAll('.filter-input').at(0)
        await nameInput.trigger('click')
        await nameInput.setValue('a')
        await nameInput.trigger('keydown', { keyCode: 13 })
        const firstDataCell = wrapper.findAll('.data-cell').at(0)
        const secondDataCell = wrapper.findAll('.data-cell').at(1)
        expect(firstDataCell.text()).toBe(globalFilterMock[2]["name"])
        expect(secondDataCell.text()).toBe(globalFilterMock[2]["description"])
      })

      test('should have return whole values when empty filter', async () =>{
        const filterButton = wrapper.find('.filter-toggle')
        await filterButton.trigger('click')
        const nameInput = wrapper.findAll('.filter-input').at(0)
        await nameInput.trigger('click')
        await nameInput.setValue('')
        await nameInput.trigger('keydown', { keyCode: 13 })
        const firstRow = wrapper.findAll('.data-row').at(0)
        const nameCellFirstRow = firstRow.findAll('td').at(0)
        const secondRow = wrapper.findAll('.data-row').at(1)
        const nameCellSecondRow = secondRow.findAll('td').at(0)
        const thirdRow = wrapper.findAll('.data-row').at(2)
        const nameCellThirdRow = thirdRow.findAll('td').at(0)
        expect(nameCellFirstRow.text()).toBe(sortedGlobalFilterMockByNameAsc[0]["name"])
        expect(nameCellSecondRow.text()).toBe(sortedGlobalFilterMockByNameAsc[1]["name"])
        expect(nameCellThirdRow.text()).toBe(sortedGlobalFilterMockByNameAsc[2]["name"])
      })

      test('should have to check multi filter by adding description and name', async () => {
        const filterButton = wrapper.find('.filter-toggle')
        await filterButton.trigger('click')
        const descriptionInput = wrapper.findAll('.filter-input').at(1)
        await descriptionInput.trigger('click')
        await descriptionInput.setValue('Jest')
        await descriptionInput.trigger('keydown', { keyCode: 13 })
        const nameInput = wrapper.findAll('.filter-input').at(0)
        await nameInput.trigger('click')
        await nameInput.setValue('a')
        await nameInput.trigger('keydown', { keyCode: 13 })
        const dataRow = wrapper.find('.data-row')
        const nameCellFirstRow = dataRow.findAll('td').at(0)
        expect(nameCellFirstRow.text()).toBe(sortedGlobalFilterMockByNameAsc[0]["name"])
      })

      test('should have to check multi filter by combination of adding and removing description and name', async () => {
        const filterButton = wrapper.find('.filter-toggle')
        await filterButton.trigger('click')
        const descriptionInput = wrapper.findAll('.filter-input').at(1)
        await descriptionInput.trigger('click')
        await descriptionInput.setValue('Jest')
        await descriptionInput.trigger('keydown', { keyCode: 13 })
        const nameInput = wrapper.findAll('.filter-input').at(0)
        await nameInput.trigger('click')
        await nameInput.setValue('a')
        await descriptionInput.trigger('keydown', { keyCode: 13 })
        await nameInput.trigger('click')
        await nameInput.setValue('')
        await descriptionInput.trigger('keydown', { keyCode: 13 })
        const dataRow = wrapper.find('.data-row')
        const nameCellFirstRow = dataRow.findAll('td').at(0)
        expect(nameCellFirstRow.text()).toBe(sortedGlobalFilterMockByNameAsc[0]["name"])
      })

      test('should have to check add value for description then remove it and add name filter', async () => {
        const filterButton = wrapper.find('.filter-toggle')
        await filterButton.trigger('click')
        const descriptionInput = wrapper.findAll('.filter-input').at(1)
        await descriptionInput.trigger('click')
        await descriptionInput.setValue('Jest')
        await descriptionInput.trigger('keydown', { keyCode: 13 })
        await descriptionInput.trigger('click')
        await descriptionInput.setValue('')
        const nameInput = wrapper.findAll('.filter-input').at(0)
        await nameInput.trigger('click')
        await nameInput.setValue('a')
        await descriptionInput.trigger('keydown', { keyCode: 13 })
        await nameInput.trigger('click')
        await nameInput.setValue('')
        await descriptionInput.trigger('keydown', { keyCode: 13 })
        const dataRow = wrapper.find('.data-row')
        const nameCellFirstRow = dataRow.findAll('td').at(0)
        expect(nameCellFirstRow.text()).toBe(sortedGlobalFilterMockByNameAsc[0]["name"])
      })

      test('should not have a search inputh when dont have searchable permission', async () => {
        const filterButton = wrapper.find('.filter-toggle')
        await filterButton.trigger('click')
        const nameInput = wrapper.find('.unsearchable')
        await nameInput.trigger('click')
        expect(nameInput.element.classList).toContain('unsearchable')
      })
    })

    describe('edit', () => {
      test('edit document button', async () => {
        const firstDataRow = wrapper.findAll('.edit-doc-button').at(0)
        await firstDataRow.trigger('click')
        const secondDataRow = wrapper.findAll('.edit-doc-button').at(1)
        await secondDataRow.trigger('click')
        expect(mockRouter.push).toHaveBeenCalledTimes(2)
        expect(mockRouter.push).toHaveBeenCalledWith(`/config/master/globalfilters/${globalFilterMock[2]["id"]}`)
        expect(mockRouter.push).toHaveBeenCalledWith(`/config/master/globalfilters/${globalFilterMock[1]["id"]}`)
      })
    })
  })
})