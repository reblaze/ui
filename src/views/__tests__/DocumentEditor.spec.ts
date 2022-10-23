// @ts-nocheck
import DocumentEditor from '@/views/DocumentEditor.vue'
import GitHistory from '@/components/GitHistory.vue'
import DatasetsUtils from '@/assets/DatasetsUtils'
import Utils from '@/assets/Utils'
import {afterEach, beforeEach, describe, expect, jest, test} from '@jest/globals'
import {DOMWrapper, shallowMount, VueWrapper} from '@vue/test-utils'
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
  EdgeFunction,
} from '@/types'
import {setImmediate, setTimeout} from 'timers'
import {nextTick} from 'vue'

jest.mock('axios')

// TODO: Resolve pinia integration with jest and remove this skip
describe.skip('DocumentEditor.vue', () => {
  let wrapper: VueWrapper
  let mockRoute: any
  let mockRouter: any
  let gitData: Branch[]
  let aclDocs: ACLProfile[]
  let aclDocsLogs: Commit[][]
  let aclGitOldVersion: ACLProfile[]
  let profilingListDocs: GlobalFilter[]
  let profilingListDocsLogs: Commit[][]
  let securityPoliciesDocs: SecurityPolicy[]
  let securityPoliciesDocsLogs: Commit[][]
  let flowControlPolicyDocs: FlowControlPolicy[]
  let contentFilterDocs: ContentFilterProfile[]
  let rateLimitsDocs: RateLimit[]
  let edgeFunctionsDocs: EdgeFunction[]

  beforeEach((done) => {
    gitData = [
      {
        'id': 'prod',
        'description': 'Update entry [__acldefault__] of document [aclprofiles]',
        'date': '2020-11-10T15:49:17+02:00',
        'logs': [
          {
            'version': '7dd9580c00bef1049ee9a531afb13db9ef3ee956',
            'date': '2020-11-10T15:49:17+02:00',
            'parents': [
              'fc47a6cd9d7f254dd97875a04b87165cc484e075',
            ],
            'message': 'Update entry [__acldefault__] of document [aclprofiles]',
            'email': 'curiefense@reblaze.com',
            'author': 'Curiefense API',
          },
          {
            'version': 'fc47a6cd9d7f254dd97875a04b87165cc484e075',
            'date': '2020-11-10T15:48:35+02:00',
            'parents': [
              '5aba4a5b9d6faea1896ee8965c7aa651f76af63c',
            ],
            'message': 'Update entry [__acldefault__] of document [aclprofiles]',
            'email': 'curiefense@reblaze.com',
            'author': 'Curiefense API',
          },
          {
            'version': '5aba4a5b9d6faea1896ee8965c7aa651f76af63c',
            'date': '2020-11-10T15:48:31+02:00',
            'parents': [
              '277c5d7bd0e2eb4b9d2944f7eefdfadf37ba8581',
            ],
            'message': 'Update entry [__acldefault__] of document [aclprofiles]',
            'email': 'curiefense@reblaze.com',
            'author': 'Curiefense API',
          },
          {
            'version': '277c5d7bd0e2eb4b9d2944f7eefdfadf37ba8581',
            'date': '2020-11-10T15:48:22+02:00',
            'parents': [
              '878b47deeddac94625fe7c759786f2df885ec541',
            ],
            'message': 'Update entry [__acldefault__] of document [aclprofiles]',
            'email': 'curiefense@reblaze.com',
            'author': 'Curiefense API',
          },
          {
            'version': '878b47deeddac94625fe7c759786f2df885ec541',
            'date': '2020-11-10T15:48:05+02:00',
            'parents': [
              '93c180513fe7edeaf1c0ca69a67aa2a11374da4f',
            ],
            'message': 'Update entry [__acldefault__] of document [aclprofiles]',
            'email': 'curiefense@reblaze.com',
            'author': 'Curiefense API',
          },
          {
            'version': '93c180513fe7edeaf1c0ca69a67aa2a11374da4f',
            'date': '2020-11-10T15:47:59+02:00',
            'parents': [
              '1662043d2a18d6ad2c9c94d6f826593ff5506354',
            ],
            'message': 'Update entry [__acldefault__] of document [aclprofiles]',
            'email': 'curiefense@reblaze.com',
            'author': 'Curiefense API',
          },
          {
            'version': '1662043d2a18d6ad2c9c94d6f826593ff5506354',
            'date': '2020-11-08T21:31:41+01:00',
            'parents': [
              '16379cdf39501574b4a2f5a227b82a4454884b84',
            ],
            'message': 'Create config [prod]\n',
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
        'id': '__acldefault__',
        'name': 'default-acl',
        'action': 'monitor',
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
        'action': 'monitor',
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
          'message': 'Update entry [__acldefault__] of document [aclprofiles]',
          'email': 'curiefense@reblaze.com',
          'author': 'Curiefense API',
        },
        {
          'version': '7a24bd37e93e812fa5173c4b2fb0068ad8e4ffdd',
          'date': '2020-11-12T17:22:53+02:00',
          'parents': [
            '886baf66ddd032744ac34b848c8412386a160fb3',
          ],
          'message': 'Update entry [__acldefault__] of document [aclprofiles]',
          'email': 'curiefense@reblaze.com',
          'author': 'Curiefense API',
        },
        {
          'version': '886baf66ddd032744ac34b848c8412386a160fb3',
          'date': '2020-11-12T17:22:51+02:00',
          'parents': [
            'af98cb28fc4db3a76c3a51d697b6037e8695dd7b',
          ],
          'message': 'Update entry [__acldefault__] of document [aclprofiles]',
          'email': 'curiefense@reblaze.com',
          'author': 'Curiefense API',
        },
        {
          'version': 'af98cb28fc4db3a76c3a51d697b6037e8695dd7b',
          'date': '2020-11-12T17:22:50+02:00',
          'parents': [
            'cda70058b632405600db1fbc5cf8dfd90514ec30',
          ],
          'message': 'Update entry [__acldefault__] of document [aclprofiles]',
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
          'message': 'Update entry [__acldefault__] of document [aclprofiles]',
          'email': 'curiefense@reblaze.com',
          'author': 'Curiefense API',
        },
        {
          'version': 'fc47a6cd9d7f254dd97875a04b87165cc484e075',
          'date': '2020-11-10T15:48:35+02:00',
          'parents': [
            '5aba4a5b9d6faea1896ee8965c7aa651f76af63c',
          ],
          'message': 'Update entry [__acldefault__] of document [aclprofiles]',
          'email': 'curiefense@reblaze.com',
          'author': 'Curiefense API',
        },
        {
          'version': '5aba4a5b9d6faea1896ee8965c7aa651f76af63c',
          'date': '2020-11-10T15:48:31+02:00',
          'parents': [
            '277c5d7bd0e2eb4b9d2944f7eefdfadf37ba8581',
          ],
          'message': 'Update entry [__acldefault__] of document [aclprofiles]',
          'email': 'curiefense@reblaze.com',
          'author': 'Curiefense API',
        },
        {
          'version': '277c5d7bd0e2eb4b9d2944f7eefdfadf37ba8581',
          'date': '2020-11-10T15:48:22+02:00',
          'parents': [
            '878b47deeddac94625fe7c759786f2df885ec541',
          ],
          'message': 'Update entry [__acldefault__] of document [aclprofiles]',
          'email': 'curiefense@reblaze.com',
          'author': 'Curiefense API',
        },
        {
          'version': '878b47deeddac94625fe7c759786f2df885ec541',
          'date': '2020-11-10T15:48:05+02:00',
          'parents': [
            '93c180513fe7edeaf1c0ca69a67aa2a11374da4f',
          ],
          'message': 'Update entry [__acldefault__] of document [aclprofiles]',
          'email': 'curiefense@reblaze.com',
          'author': 'Curiefense API',
        },
        {
          'version': '93c180513fe7edeaf1c0ca69a67aa2a11374da4f',
          'date': '2020-11-10T15:47:59+02:00',
          'parents': [
            '1662043d2a18d6ad2c9c94d6f826593ff5506354',
          ],
          'message': 'Update entry [__acldefault__] of document [aclprofiles]',
          'email': 'curiefense@reblaze.com',
          'author': 'Curiefense API',
        },
        {
          'version': '1662043d2a18d6ad2c9c94d6f826593ff5506354',
          'date': '2020-11-08T21:31:41+01:00',
          'parents': [
            '16379cdf39501574b4a2f5a227b82a4454884b84',
          ],
          'message': 'Create config [prod]\n',
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
          'message': 'Update entry [__acldefault__] of document [aclprofiles]',
          'email': 'curiefense@reblaze.com',
          'author': 'Curiefense API',
        },
        {
          'version': '1662043d2a18d6ad2c9c94d6f826593ff5506354',
          'date': '2020-11-08T21:31:41+01:00',
          'parents': [
            '16379cdf39501574b4a2f5a227b82a4454884b84',
          ],
          'message': 'Create config [prod]\n',
          'email': 'curiefense@reblaze.com',
          'author': 'Curiefense API',
        },
      ],
    ]
    aclGitOldVersion = [
      {
        'id': '__acldefault__',
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
    profilingListDocs = [
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
      },
      {
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
    profilingListDocsLogs = [
      [
        {
          'version': '1662043d2a18d6ad2c9c94d6f826593ff5506354',
          'date': '2020-11-08T21:31:41+01:00',
          'parents': [
            '16379cdf39501574b4a2f5a227b82a4454884b84',
          ],
          'message': 'Create config [prod]\n',
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
          'message': 'Create config [prod]\n',
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
        'action': 'monitor',
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
        'action': 'monitor',
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
    edgeFunctionsDocs = [{
      'id': 'cf-12345678',
      'name': 'New Edge Functions',
      'key': 'cf12345678',
      'description': 'New Edge Functions Documentation',
      'code': 'foo = 12345678',
      'phase': 'request0',
    }]
    rateLimitsDocs = [{
      'id': 'f971e92459e2',
      'name': 'Rate Limit Example Rule 5/60',
      'description': '5 requests per minute',
      'timeframe': '60',
      'thresholds': [
        {
          'limit': '5',
          'action': 'monitor',
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
      if (path === '/conf/api/v3/configs/') {
        return Promise.resolve({data: gitData})
      }
      const branch = wrapper.vm.selectedBranch
      const docID = wrapper.vm.selectedDocID
      if (path === `/conf/api/v3/configs/${branch}/d/aclprofiles/`) {
        if (config && config.headers && config.headers['x-fields'] === 'id, name') {
          return Promise.resolve({data: _.map(aclDocs, (i) => _.pick(i, 'id', 'name'))})
        }
        return Promise.resolve({data: aclDocs})
      }
      if (path === `/conf/api/v3/configs/${branch}/d/aclprofiles/e/__acldefault__/`) {
        return Promise.resolve({data: aclDocs[0]})
      }
      if (path === `/conf/api/v3/configs/${branch}/d/aclprofiles/e/5828321c37e0/`) {
        return Promise.resolve({data: aclDocs[1]})
      }
      if (path === `/conf/api/v3/configs/${branch}/d/aclprofiles/v/7f8a987c8e5e9db7c734ac8841c543d5bc5d9657/`) {
        return Promise.resolve({data: aclGitOldVersion})
      }
      if (path === `/conf/api/v3/configs/prod/d/aclprofiles/e/__acldefault__/v/`) {
        return Promise.resolve({data: aclDocsLogs[0]})
      }
      if (path === `/conf/api/v3/configs/zzz_branch/d/aclprofiles/e/__acldefault__/v/`) {
        return Promise.resolve({data: aclDocsLogs[1]})
      }
      if (path === `/conf/api/v3/configs/${branch}/d/aclprofiles/e/5828321c37e0/v/`) {
        return Promise.resolve({data: aclDocsLogs[1]})
      }

      if (path === `/conf/api/v3/configs/${branch}/d/globalfilters/`) {
        if (config && config.headers && config.headers['x-fields'] === 'id, name') {
          return Promise.resolve({data: _.map(profilingListDocs, (i) => _.pick(i, 'id', 'name'))})
        }
        return Promise.resolve({data: profilingListDocs})
      }
      if (path === `/conf/api/v3/configs/${branch}/d/globalfilters/e/xlbp148c/`) {
        return Promise.resolve({data: profilingListDocs[0]})
      }
      if (path === `/conf/api/v3/configs/${branch}/d/globalfilters/e/07656fbe/`) {
        return Promise.resolve({data: profilingListDocs[1]})
      }
      if (path === `/conf/api/v3/configs/${branch}/d/globalfilters/e/${docID}/v/`) {
        return Promise.resolve({data: profilingListDocsLogs[0]})
      }
      if (path === `/conf/api/v3/configs/${branch}/d/securitypolicies/`) {
        if (config && config.headers && config.headers['x-fields'] === 'id, name') {
          return Promise.resolve({data: _.map(securityPoliciesDocs, (i) => _.pick(i, 'id', 'name'))})
        }
        return Promise.resolve({data: securityPoliciesDocs})
      }
      if (path === `/conf/api/v3/configs/${branch}/d/securitypolicies/e/__default__/`) {
        return Promise.resolve({data: securityPoliciesDocs[0]})
      }
      if (path === `/conf/api/v3/configs/${branch}/d/securitypolicies/e/${docID}/v/`) {
        return Promise.resolve({data: securityPoliciesDocsLogs[0]})
      }
      if (path === `/conf/api/v3/configs/${branch}/d/flowcontrol/`) {
        if (config && config.headers && config.headers['x-fields'] === 'id, name') {
          return Promise.resolve({data: _.map(flowControlPolicyDocs, (i) => _.pick(i, 'id', 'name'))})
        }
        return Promise.resolve({data: flowControlPolicyDocs})
      }
      if (path === `/conf/api/v3/configs/${branch}/d/flowcontrol/e/c03dabe4b9ca/`) {
        return Promise.resolve({data: flowControlPolicyDocs[0]})
      }
      if (path === `/conf/api/v3/configs/${branch}/d/contentfilterprofiles/`) {
        if (config && config.headers && config.headers['x-fields'] === 'id, name') {
          return Promise.resolve({data: _.map(contentFilterDocs, (i) => _.pick(i, 'id', 'name'))})
        }
        return Promise.resolve({data: contentFilterDocs})
      }
      if (path === `/conf/api/v3/configs/${branch}/d/contentfilterprofiles/e/009e846e819e/`) {
        return Promise.resolve({data: contentFilterDocs[0]})
      }
      if (path === `/conf/api/v3/configs/${branch}/d/ratelimits/`) {
        if (config && config.headers && config.headers['x-fields'] === 'id, name') {
          return Promise.resolve({data: _.map(rateLimitsDocs, (i) => _.pick(i, 'id', 'name'))})
        }
        return Promise.resolve({data: rateLimitsDocs})
      }
      if (path === `/conf/api/v3/configs/${branch}/d/ratelimits/e/f971e92459e2/`) {
        return Promise.resolve({data: rateLimitsDocs[0]})
      }
      if (path === `/reblaze/api/v3/reblaze/config/d/cloud-functions/`) {
        if (config && config.headers && config.headers['x-fields'] === 'id, name') {
          return Promise.resolve({data: _.map(edgeFunctionsDocs, (i) => _.pick(i, 'id', 'name'))})
        }
        return Promise.resolve({data: edgeFunctionsDocs[0]})
      }
      if (path === '/conf/api/v3/configs/prod/v/') {
        return Promise.resolve({data: gitData[0].logs})
      }
      if (path === '/conf/api/v3/configs/zzz_branch/v/') {
        return Promise.resolve({data: gitData[1].logs})
      }
      return Promise.resolve({data: []})
    })
    mockRoute = {
      params: {
        branch: 'prod',
        doc_type: 'aclprofiles',
        doc_id: '__acldefault__',
      },
      path: `/config/prod/aclprofiles/__acldefault__`,
      name: `DocumentEditor`,
    }
    mockRouter = {
      push: jest.fn((val) => {
        const splitParams = val.split('/')
        wrapper.vm.$route.params = {
          branch: splitParams[2],
          doc_type: splitParams[3],
          doc_id: splitParams[4],
        }
        wrapper.vm.$route.path = val
      }),
    }
    wrapper = shallowMount(DocumentEditor, {
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
    jest.clearAllTimers()
  })

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
      const docID = wrapper.vm.selectedDocID
      if (path === `/conf/api/v3/configs/${branch}/d/aclprofiles/`) {
        return Promise.resolve({data: aclDocs})
      }
      if (path === `/conf/api/v3/configs/${branch}/d/aclprofiles/e/${docID}/`) {
        return Promise.resolve({data: aclDocs[0]})
      }
      if (path === `/conf/api/v3/configs/prod/d/aclprofiles/e/${docID}/v/`) {
        return Promise.resolve(null)
      }
      return Promise.resolve({data: []})
    })
    wrapper = shallowMount(DocumentEditor, {
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
      const docID = wrapper.vm.selectedDocID
      if (path === `/conf/api/v3/configs/${branch}/d/aclprofiles/`) {
        return Promise.resolve({data: aclDocs})
      }
      if (path === `/conf/api/v3/configs/${branch}/d/aclprofiles/e/${docID}/`) {
        return Promise.resolve({data: aclDocs[0]})
      }
      if (path === `/conf/api/v3/configs/prod/d/aclprofiles/e/${docID}/v/`) {
        return Promise.resolve({data: null})
      }
      return Promise.resolve({data: []})
    })
    wrapper = shallowMount(DocumentEditor, {
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

  test('should have an empty git log array if got no git log data from server - response null', () => {
    jest.spyOn(axios, 'get').mockImplementation((path) => {
      if (path === '/conf/api/v3/configs/') {
        return Promise.resolve({data: gitData})
      }
      const branch = wrapper.vm.selectedBranch
      const docID = wrapper.vm.selectedDocID
      if (path === `/conf/api/v3/configs/${branch}/d/aclprofiles/`) {
        return Promise.resolve({data: aclDocs})
      }
      if (path === `/conf/api/v3/configs/${branch}/d/aclprofiles/e/${docID}/`) {
        return Promise.resolve({data: aclDocs[0]})
      }
      if (path === `/conf/api/v3/configs/prod/d/aclprofiles/e/${docID}/v/`) {
        return Promise.resolve(null)
      }
      return Promise.resolve({data: []})
    })
    wrapper = shallowMount(DocumentEditor, {
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
      const docID = wrapper.vm.selectedDocID
      if (path === `/conf/api/v3/configs/${branch}/d/aclprofiles/`) {
        return Promise.resolve({data: aclDocs})
      }
      if (path === `/conf/api/v3/configs/${branch}/d/aclprofiles/e/${docID}/`) {
        return Promise.resolve({data: aclDocs[0]})
      }
      if (path === `/conf/api/v3/configs/prod/d/aclprofiles/e/${docID}/v/`) {
        return Promise.resolve({data: null})
      }
      return Promise.resolve({data: []})
    })
    wrapper = shallowMount(DocumentEditor, {
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
    const putSpy = jest.spyOn(axios, 'put')
    putSpy.mockImplementation(() => Promise.resolve())
    const gitHistory = wrapper.findComponent(GitHistory)
    gitHistory.vm.$emit('restore-version', wantedVersion)
    await nextTick()
    expect(putSpy).toHaveBeenCalledWith(`/conf/api/v3/configs/prod/d/aclprofiles/v/${wantedVersion.version}/revert/`)
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
    wrapper = shallowMount(DocumentEditor, {
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
    wrapper = shallowMount(DocumentEditor, {
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
        doc_id: '4435d797ab0c',
      }
      wrapper = shallowMount(DocumentEditor, {
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
        expect((branchSelection.element as HTMLSelectElement).selectedIndex).toEqual(1)
        done()
      })
    })

    test('should load correct doc type from route when valid', (done) => {
      mockRoute.params = {
        branch: 'zzz_branch',
        doc_type: 'flowcontrol',
        doc_id: '4435d797ab0c',
      }
      wrapper = shallowMount(DocumentEditor, {
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
        expect((docTypeSelection.element as HTMLSelectElement).selectedIndex).toEqual(1)
        done()
      })
    })

    test('should load correct doc from route when valid', (done) => {
      mockRoute.params = {
        branch: 'zzz_branch',
        doc_type: 'flowcontrol',
        doc_id: '4435d797ab0c',
      }
      wrapper = shallowMount(DocumentEditor, {
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
        expect((docSelection.element as HTMLSelectElement).selectedIndex).toEqual(1)
        done()
      })
    })

    test('should load correct branch from route without changing document type or id', (done) => {
      mockRoute.params = {
        branch: 'zzz_branch',
        doc_type: 'aclprofiles',
        doc_id: '__acldefault__',
      }
      wrapper = shallowMount(DocumentEditor, {
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
        expect((branchSelection.element as HTMLSelectElement).selectedIndex).toEqual(1)
        const docTypeSelection = wrapper.find('.doc-type-selection')
        expect((docTypeSelection.element as HTMLSelectElement).selectedIndex).toEqual(4)
        const docSelection = wrapper.find('.doc-selection')
        expect((docSelection.element as HTMLSelectElement).selectedIndex).toEqual(1)
        done()
      })
    })

    test('should load correct document type from route without changing branch or document id', (done) => {
      mockRoute.params = {
        branch: 'prod',
        doc_type: 'securitypolicies',
        doc_id: '__default__',
      }
      wrapper = shallowMount(DocumentEditor, {
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
        expect((branchSelection.element as HTMLSelectElement).selectedIndex).toEqual(0)
        const docTypeSelection = wrapper.find('.doc-type-selection')
        expect((docTypeSelection.element as HTMLSelectElement).selectedIndex).toEqual(2)
        const docSelection = wrapper.find('.doc-selection')
        expect((docSelection.element as HTMLSelectElement).selectedIndex).toEqual(0)
        done()
      })
    })

    test('should load correct document id from route without changing branch or document type', (done) => {
      mockRoute.params = {
        branch: 'prod',
        doc_type: 'aclprofiles',
        doc_id: '5828321c37e0',
      }
      wrapper = shallowMount(DocumentEditor, {
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
        expect((branchSelection.element as HTMLSelectElement).selectedIndex).toEqual(0)
        const docTypeSelection = wrapper.find('.doc-type-selection')
        expect((docTypeSelection.element as HTMLSelectElement).selectedIndex).toEqual(4)
        const docSelection = wrapper.find('.doc-selection')
        expect((docSelection.element as HTMLSelectElement).selectedIndex).toEqual(0)
        done()
      })
    })

    test('should load correct default branch if non existent in route params', (done) => {
      delete mockRoute.params
      wrapper = shallowMount(DocumentEditor, {
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
        expect((branchSelection.element as HTMLSelectElement).selectedIndex).toEqual(0)
        done()
      })
    })

    test('should load correct default document type if non existent in route params', (done) => {
      delete mockRoute.params
      wrapper = shallowMount(DocumentEditor, {
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
        expect((docTypeSelection.element as HTMLSelectElement).selectedIndex).toEqual(0)
        done()
      })
    })

    test('should load correct default document id if non existent in route params', (done) => {
      delete mockRoute.params
      wrapper = shallowMount(DocumentEditor, {
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
        expect((docSelection.element as HTMLSelectElement).selectedIndex).toEqual(0)
        done()
      })
    })
  })

  describe('branches and commits display', () => {
    test('should display correct zero amount of branches', (done) => {
      gitData = []
      jest.spyOn(axios, 'get').mockImplementation((path) => {
        if (path === '/conf/api/v3/configs/') {
          return Promise.resolve({data: gitData})
        }
        return Promise.resolve({data: []})
      })
      wrapper = shallowMount(DocumentEditor, {
        global: {
          mocks: {
            $route: mockRoute,
            $router: mockRouter,
          },
        },
      })
      // allow all requests to finish
      setImmediate(() => {
        const gitBranches = wrapper.find('.git-branches')
        expect(gitBranches.text()).toEqual('0 branches')
        done()
      })
    })

    test('should display correct zero amount of commits', (done) => {
      gitData = []
      jest.spyOn(axios, 'get').mockImplementation((path) => {
        if (path === '/conf/api/v3/configs/') {
          return Promise.resolve({data: gitData})
        }
        return Promise.resolve({data: []})
      })
      wrapper = shallowMount(DocumentEditor, {
        global: {
          mocks: {
            $route: mockRoute,
            $router: mockRouter,
          },
        },
      })
      // allow all requests to finish
      setImmediate(() => {
        const gitCommits = wrapper.find('.git-commits')
        expect(gitCommits.text()).toEqual('0 commits')
        done()
      })
    })

    test('should display correct singular amount of branches', (done) => {
      gitData = [
        {
          'id': 'prod',
          'description': 'Update entry [__acldefault__] of document [aclprofiles]',
          'date': '2020-11-10T15:49:17+02:00',
          'logs': [{
            'version': '7dd9580c00bef1049ee9a531afb13db9ef3ee956',
            'date': '2020-11-10T15:49:17+02:00',
            'parents': [
              'fc47a6cd9d7f254dd97875a04b87165cc484e075',
            ],
            'message': 'Update entry [__acldefault__] of document [aclprofiles]',
            'email': 'curiefense@reblaze.com',
            'author': 'Curiefense API',
          }],
          'version': '7dd9580c00bef1049ee9a531afb13db9ef3ee956',
        },
      ]
      jest.spyOn(axios, 'get').mockImplementation((path) => {
        if (path === '/conf/api/v3/configs/') {
          return Promise.resolve({data: gitData})
        }
        if (path === '/conf/api/v3/configs/prod/') {
          return Promise.resolve({data: gitData[0]})
        }
        if (path === '/conf/api/v3/configs/prod/v/') {
          return Promise.resolve({data: gitData[0].logs})
        }
        return Promise.resolve({data: []})
      })
      wrapper = shallowMount(DocumentEditor, {
        global: {
          mocks: {
            $route: mockRoute,
            $router: mockRouter,
          },
        },
      })
      // allow all requests to finish
      setImmediate(() => {
        const gitBranches = wrapper.find('.git-branches')
        expect(gitBranches.text()).toEqual('1 branch')
        done()
      })
    })

    test('should display correct singular amount of commits', (done) => {
      gitData = [
        {
          'id': 'prod',
          'description': 'Update entry [__acldefault__] of document [aclprofiles]',
          'date': '2020-11-10T15:49:17+02:00',
          'logs': [{
            'version': '7dd9580c00bef1049ee9a531afb13db9ef3ee956',
            'date': '2020-11-10T15:49:17+02:00',
            'parents': [
              'fc47a6cd9d7f254dd97875a04b87165cc484e075',
            ],
            'message': 'Update entry [__acldefault__] of document [aclprofiles]',
            'email': 'curiefense@reblaze.com',
            'author': 'Curiefense API',
          }],
          'version': '7dd9580c00bef1049ee9a531afb13db9ef3ee956',
        },
      ]
      jest.spyOn(axios, 'get').mockImplementation((path) => {
        if (path === '/conf/api/v3/configs/') {
          return Promise.resolve({data: gitData})
        }
        if (path === '/conf/api/v3/configs/prod/') {
          return Promise.resolve({data: gitData[0]})
        }
        if (path === '/conf/api/v3/configs/prod/v/') {
          return Promise.resolve({data: gitData[0].logs})
        }
        return Promise.resolve({data: []})
      })
      wrapper = shallowMount(DocumentEditor, {
        global: {
          mocks: {
            $route: mockRoute,
            $router: mockRouter,
          },
        },
      })
      // allow all requests to finish
      setImmediate(() => {
        const gitCommits = wrapper.find('.git-commits')
        expect(gitCommits.text()).toEqual('1 commit')
        done()
      })
    })

    test('should display correct plural amount of branches', () => {
      const gitBranches = wrapper.find('.git-branches')
      expect(gitBranches.text()).toEqual('2 branches')
    })

    test('should display correct plural amount of commits', () => {
      const gitCommits = wrapper.find('.git-commits')
      expect(gitCommits.text()).toEqual('10 commits')
    })
  })

  describe('dropdowns', () => {
    test('should be able to switch branches through dropdown', async () => {
      const branchSelection = wrapper.find('.branch-selection')
      await branchSelection.trigger('click')
      const options = branchSelection.findAll('option')
      await branchSelection.setValue(options.at(1).element.value)
      expect((branchSelection.element as HTMLSelectElement).selectedIndex).toEqual(1)
    })

    test('should not switch doc type when switching branches', async () => {
      const docTypeSelection = wrapper.find('.doc-type-selection')
      await docTypeSelection.trigger('click')
      const docTypeOptions = docTypeSelection.findAll('option')
      await docTypeSelection.setValue(docTypeOptions.at(2).element.value)
      const branchSelection = wrapper.find('.branch-selection')
      await branchSelection.trigger('click')
      const branchOptions = branchSelection.findAll('option')
      await branchSelection.setValue(branchOptions.at(1).element.value)
      expect((docTypeSelection.element as HTMLSelectElement).selectedIndex).toEqual(2)
    })

    test('should not switch selected doc when switching branches', async () => {
      const docSelection = wrapper.find('.doc-selection')
      await docSelection.trigger('click')
      const docOptions = docSelection.findAll('option')
      await docSelection.setValue(docOptions.at(1).element.value)
      const branchSelection = wrapper.find('.branch-selection')
      await branchSelection.trigger('click')
      const branchOptions = branchSelection.findAll('option')
      await branchSelection.setValue(branchOptions.at(1).element.value)
      expect((docSelection.element as HTMLSelectElement).selectedIndex).toEqual(1)
    })

    test('should be able to switch doc types through dropdown', async () => {
      const docTypeSelection = wrapper.find('.doc-type-selection')
      await docTypeSelection.trigger('click')
      const options = docTypeSelection.findAll('option')
      await docTypeSelection.setValue(options.at(2).element.value)
      expect((docTypeSelection.element as HTMLSelectElement).selectedIndex).toEqual(2)
    })

    test('should be able to switch docs through dropdown', async () => {
      // switch to profiling lists
      const docTypeSelection = wrapper.find('.doc-type-selection')
      await docTypeSelection.trigger('click')
      const docTypeOptions = docTypeSelection.findAll('option')
      await docTypeSelection.setValue(docTypeOptions.at(0).element.value)
      // switch to a different document
      const docSelection = wrapper.find('.doc-selection')
      await docSelection.trigger('click')
      const options = docSelection.findAll('option')
      await docSelection.setValue(options.at(1).element.value)
      expect((docSelection.element as HTMLSelectElement).selectedIndex).toEqual(1)
    })
  })

  describe('buttons', () => {
    test('should redirect to list on button click', (done) => {
      const branch = wrapper.vm.selectedBranch
      const docType = wrapper.vm.selectedDocType
      jest.spyOn(mockRouter, 'push').mockImplementation((path) => {
        expect(path).toEqual(`/list/${branch}/${docType}`)
        done()
      })
      const button = wrapper.find('.redirect-list-button')
      button.trigger('click')
    })

    test('should refresh referenced IDs lists after saving security policy entity', (done) => {
      // switch to security policy entity type
      const docTypeSelection = wrapper.find('.doc-type-selection')
      docTypeSelection.trigger('click')
      const options = docTypeSelection.findAll('option')
      docTypeSelection.setValue(options.at(4).element.value)
      // allow all requests to finish
      setImmediate(async () => {
        const doc = wrapper.vm.selectedDoc
        doc.name = `${doc.name} changed`
        jest.spyOn(axios, 'put').mockImplementation(() => Promise.resolve())
        const getSpy = jest.spyOn(axios, 'get')
        const saveDocumentButton = wrapper.find('.save-document-button')
        saveDocumentButton.trigger('click')
        expect(getSpy).toHaveBeenCalledWith(`/conf/api/v3/configs/prod/d/securitypolicies/`)
        done()
      })
    })

    test('should be able to save document changes', () => {
      const doc = wrapper.vm.selectedDoc
      doc.name = `${doc.name} changed`
      const putSpy = jest.spyOn(axios, 'put')
      putSpy.mockImplementation(() => Promise.resolve())
      const saveDocumentButton = wrapper.find('.save-document-button')
      saveDocumentButton.trigger('click')
      expect(putSpy).toHaveBeenCalledWith(`/conf/api/v3/configs/prod/d/aclprofiles/e/${doc.id}/`, doc)
    })

    test('should be able to fork document', () => {
      const originalDoc = wrapper.vm.selectedDoc
      const forkedDoc = {...originalDoc}
      forkedDoc.id = expect.any(String)
      forkedDoc.name = `copy of ${forkedDoc.name}`
      const postSpy = jest.spyOn(axios, 'post')
      postSpy.mockImplementation(() => Promise.resolve())
      const forkDocumentButton = wrapper.find('.fork-document-button')
      forkDocumentButton.trigger('click')
      expect(postSpy).toHaveBeenCalledWith(`/conf/api/v3/configs/prod/d/aclprofiles/e/`, forkedDoc)
    })

    test('should not be able to fork document if there is no selected doc', () => {
      jest.spyOn(axios, 'get').mockImplementation((path) => {
        if (path === '/conf/api/v3/configs/') {
          return Promise.resolve({data: gitData})
        }
        return Promise.resolve({data: []})
      })
      wrapper = shallowMount(DocumentEditor, {
        global: {
          mocks: {
            $route: mockRoute,
            $router: mockRouter,
          },
        },
      })
      const originalDoc = wrapper.vm.selectedDoc
      const forkedDoc = {...originalDoc}
      forkedDoc.id = expect.any(String)
      forkedDoc.name = `copy of ${forkedDoc.name}`
      const postSpy = jest.spyOn(axios, 'post')
      postSpy.mockImplementation(() => Promise.resolve())
      const forkDocumentButton = wrapper.find('.fork-document-button')
      forkDocumentButton.trigger('click')
      expect(postSpy).not.toHaveBeenCalled()
    })

    test('should change security policy match when forking security policy document', (done) => {
      // switching to security policies
      const docTypeSelection = wrapper.find('.doc-type-selection')
      docTypeSelection.trigger('click')
      const options = docTypeSelection.findAll('option')
      docTypeSelection.setValue(options.at(2).element.value)
      // allow all requests to finish
      setImmediate(() => {
        const originalDoc = wrapper.vm.selectedDoc
        const forkedDoc = {...originalDoc}
        forkedDoc.id = expect.any(String)
        forkedDoc.name = `copy of ${forkedDoc.name}`
        forkedDoc.match = expect.stringContaining(`.${forkedDoc.match}`)
        const postSpy = jest.spyOn(axios, 'post')
        postSpy.mockImplementation(() => Promise.resolve())
        const forkDocumentButton = wrapper.find('.fork-document-button')
        forkDocumentButton.trigger('click')
        expect(postSpy).toHaveBeenCalledWith(`/conf/api/v3/configs/prod/d/securitypolicies/e/`, forkedDoc)
        done()
      })
    })

    test('should be able to add a new document', () => {
      const newDoc = DatasetsUtils.newDocEntryFactory.aclprofiles()
      newDoc.id = expect.any(String)
      const postSpy = jest.spyOn(axios, 'post')
      postSpy.mockImplementation(() => Promise.resolve())
      const newDocumentButton = wrapper.find('.new-document-button')
      newDocumentButton.trigger('click')
      expect(postSpy).toHaveBeenCalledWith(`/conf/api/v3/configs/prod/d/aclprofiles/e/`, newDoc)
    })

    test('should be able to add multiple new documents in a row with different IDs', () => {
      const newDocIDs: string[] = []
      const postSpy = jest.spyOn(axios, 'post')
      postSpy.mockImplementation((url, data: Partial<Document>) => {
        newDocIDs.push(data.id)
        return Promise.resolve()
      })
      const newDocumentButton = wrapper.find('.new-document-button')
      newDocumentButton.trigger('click')
      newDocumentButton.trigger('click')
      expect(postSpy).toHaveBeenCalledTimes(2)
      expect(newDocIDs[0]).not.toEqual(newDocIDs[1])
    })

    test('should be able to delete a document', async () => {
      const deleteSpy = jest.spyOn(axios, 'delete')
      deleteSpy.mockImplementation(() => Promise.resolve())
      // create new document so we can delete it
      const newDocumentButton = wrapper.find('.new-document-button')
      await newDocumentButton.trigger('click')
      const docID = wrapper.vm.selectedDocID
      const deleteDocumentButton = wrapper.find('.delete-document-button')
      await deleteDocumentButton.trigger('click')
      expect(deleteSpy).toHaveBeenCalledWith(`/conf/api/v3/configs/prod/d/aclprofiles/e/${docID}/`)
    })

    test('should not be able to delete a document if its id starts with `__` #1', () => {
      const deleteSpy = jest.spyOn(axios, 'delete')
      deleteSpy.mockImplementation(() => Promise.resolve())
      wrapper.setData({selectedDocID: '__default__'})
      const deleteDocumentButton = wrapper.find('.delete-document-button')
      deleteDocumentButton.trigger('click')
      expect(deleteSpy).not.toHaveBeenCalled()
    })

    test('should not be able to delete a document if its id starts with `__` #2', () => {
      const deleteSpy = jest.spyOn(axios, 'delete')
      deleteSpy.mockImplementation(() => Promise.resolve())
      wrapper.setData({selectedDocID: '__acldefault__'})
      const deleteDocumentButton = wrapper.find('.delete-document-button')
      deleteDocumentButton.trigger('click')
      expect(deleteSpy).not.toHaveBeenCalled()
    })

    test('should not be able to delete an ACL Profile document if it is referenced by a security policy', () => {
      // switch to a different document
      const docSelection = wrapper.find('.doc-selection')
      docSelection.trigger('click')
      const options = docSelection.findAll('option')
      docSelection.setValue(options.at(1).element.value)
      const deleteSpy = jest.spyOn(axios, 'delete')
      deleteSpy.mockImplementation(() => Promise.resolve())
      wrapper.setData({selectedDoc: {id: '__acldefault__'}})
      const deleteDocumentButton = wrapper.find('.delete-document-button')
      deleteDocumentButton.trigger('click')
      expect(deleteSpy).not.toHaveBeenCalled()
    })

    test('should not be able to delete an Content Filter Profile document' +
      ' if it is referenced by a security policy', () => {
      // switch to Content Filter Profiles
      const docTypeSelection = wrapper.find('.doc-type-selection')
      docTypeSelection.trigger('click')
      const docTypeOptions = docTypeSelection.findAll('option')
      docTypeSelection.setValue(docTypeOptions.at(5).element.value)
      const deleteSpy = jest.spyOn(axios, 'delete')
      deleteSpy.mockImplementation(() => Promise.resolve())
      wrapper.setData({selectedDoc: {id: '009e846e819e'}})
      const deleteDocumentButton = wrapper.find('.delete-document-button')
      deleteDocumentButton.trigger('click')
      expect(deleteSpy).not.toHaveBeenCalled()
    })

    test('should not be able to delete a Rate Limit document if it is referenced by a security policy', () => {
      // switch to Rate Limits
      const docTypeSelection = wrapper.find('.doc-type-selection')
      docTypeSelection.trigger('click')
      const docTypeOptions = docTypeSelection.findAll('option')
      docTypeSelection.setValue(docTypeOptions.at(3).element.value)
      const deleteSpy = jest.spyOn(axios, 'delete')
      deleteSpy.mockImplementation(() => Promise.resolve())
      wrapper.setData({selectedDoc: {id: 'f971e92459e2'}})
      const deleteDocumentButton = wrapper.find('.delete-document-button')
      deleteDocumentButton.trigger('click')
      expect(deleteSpy).not.toHaveBeenCalled()
    })

    test('should not attempt to download document when download button is clicked' +
      ' if the full docs data was not loaded yet', async () => {
      jest.spyOn(axios, 'get').mockImplementation((path, config) => {
        if (path === '/conf/api/v3/configs/') {
          return Promise.resolve({data: gitData})
        }
        const branch = wrapper.vm.selectedBranch
        const docID = wrapper.vm.selectedDocID
        if (path === `/conf/api/v3/configs/${branch}/d/aclprofiles/`) {
          if (config && config.headers && config.headers['x-fields'] === 'id, name') {
            return Promise.resolve({data: _.map(aclDocs, (i) => _.pick(i, 'id', 'name'))})
          }
          setTimeout(() => {
            return Promise.resolve({data: aclDocs})
          }, 5000)
        }
        if (path === `/conf/api/v3/configs/${branch}/d/aclprofiles/e/__acldefault__/`) {
          return Promise.resolve({data: aclDocs[0]})
        }
        if (path === `/conf/api/v3/configs/${branch}/d/aclprofiles/e/5828321c37e0/`) {
          return Promise.resolve({data: aclDocs[1]})
        }
        if (path === `/conf/api/v3/configs/${branch}/d/aclprofiles/v/7f8a987c8e5e9db7c734ac8841c543d5bc5d9657/`) {
          return Promise.resolve({data: aclGitOldVersion})
        }
        if (path === `/conf/api/v3/configs/${branch}/d/aclprofiles/e/${docID}/v/`) {
          return Promise.resolve({data: aclDocsLogs[0]})
        }
        return Promise.resolve({data: []})
      })
      wrapper = shallowMount(DocumentEditor, {
        global: {
          mocks: {
            $route: mockRoute,
            $router: mockRouter,
          },
        },
      })
      const downloadFileSpy = jest.spyOn(Utils, 'downloadFile').mockImplementation(() => {
      })
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
      const downloadDocButton = wrapper.find('.download-doc-button')
      await downloadDocButton.trigger('click')
      expect(downloadFileSpy).toHaveBeenCalledWith(wantedFileName, wantedFileType, wantedFileData)
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
      wrapper = shallowMount(DocumentEditor, {
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
        if (path === '/conf/api/v3/configs/') {
          return Promise.resolve({data: []})
        }
        return Promise.resolve({data: []})
      })
      wrapper = shallowMount(DocumentEditor, {
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

    test('should display correct message when there is no doc type data', (done) => {
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
        if (path === '/conf/api/v3/configs/') {
          return Promise.resolve({data: gitData})
        }
        return Promise.resolve({data: []})
      })
      wrapper = shallowMount(DocumentEditor, {
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
    })

    test('should not throw errors if no doc data exist - null response', (done) => {
      try {
        jest.spyOn(axios, 'get').mockImplementation((path) => {
          if (path === '/conf/api/v3/configs/') {
            return Promise.resolve({data: gitData})
          }
          const branch = wrapper.vm.selectedBranch
          const docID = wrapper.vm.selectedDocID
          if (path === `/conf/api/v3/configs/${branch}/d/aclprofiles/`) {
            return Promise.resolve({data: _.map(aclDocs, (i) => _.pick(i, 'id', 'name'))})
          }
          if (path === `/conf/api/v3/configs/${branch}/d/aclprofiles/e/${docID}/`) {
            return Promise.resolve(null)
          }
          return Promise.resolve({data: []})
        })
        wrapper = shallowMount(DocumentEditor, {
          global: {
            mocks: {
              $route: mockRoute,
              $router: mockRouter,
            },
          },
        })
        done()
      } catch (err) {
        expect(err).not.toBeDefined()
        done()
      }
    })

    test('should not throw errors if no doc data exist - null data', (done) => {
      try {
        jest.spyOn(axios, 'get').mockImplementation((path) => {
          if (path === '/conf/api/v3/configs/') {
            return Promise.resolve({data: gitData})
          }
          const branch = wrapper.vm.selectedBranch
          const docID = wrapper.vm.selectedDocID
          if (path === `/conf/api/v3/configs/${branch}/d/aclprofiles/`) {
            return Promise.resolve({data: _.map(aclDocs, (i) => _.pick(i, 'id', 'name'))})
          }
          if (path === `/conf/api/v3/configs/${branch}/d/aclprofiles/e/${docID}/`) {
            return Promise.resolve({data: null})
          }
          return Promise.resolve({data: []})
        })
        wrapper = shallowMount(DocumentEditor, {
          global: {
            mocks: {
              $route: mockRoute,
              $router: mockRouter,
            },
          },
        })
        done()
      } catch (err) {
        expect(err).not.toBeDefined()
        done()
      }
    })

    test('should not throw errors if no referenced docs data exist - null response', (done) => {
      try {
        jest.spyOn(axios, 'get').mockImplementation((path, config) => {
          if (path === '/conf/api/v3/configs/') {
            return Promise.resolve({data: gitData})
          }
          const branch = wrapper.vm.selectedBranch
          const docID = wrapper.vm.selectedDocID
          if (path === `/conf/api/v3/configs/${branch}/d/aclprofiles/`) {
            if (config && config.headers && config.headers['x-fields'] === 'id, name') {
              return Promise.resolve({data: _.map(aclDocs, (i) => _.pick(i, 'id', 'name'))})
            }
            return Promise.resolve({data: aclDocs})
          }
          if (path === `/conf/api/v3/configs/${branch}/d/aclprofiles/e/${docID}/`) {
            return Promise.resolve({data: aclDocs[0]})
          }
          if (path === `/conf/api/v3/configs/prod/d/aclprofiles/e/${docID}/v/`) {
            return Promise.resolve({data: aclDocsLogs[0]})
          }
          if (path === `/conf/api/v3/configs/${branch}/d/securitypolicies/`) {
            return Promise.resolve(null)
          }
          if (path === '/conf/api/v3/configs/prod/v/') {
            return Promise.resolve({data: gitData[0].logs})
          }
          if (path === '/conf/api/v3/configs/zzz_branch/v/') {
            return Promise.resolve({data: gitData[1].logs})
          }
          return Promise.resolve({data: []})
        })
        wrapper = shallowMount(DocumentEditor, {
          global: {
            mocks: {
              $route: mockRoute,
              $router: mockRouter,
            },
          },
        })
        done()
      } catch (err) {
        expect(err).not.toBeDefined()
        done()
      }
    })

    test('should not throw errors if no referenced docs data exist - null data', (done) => {
      try {
        jest.spyOn(axios, 'get').mockImplementation((path, config) => {
          if (path === '/conf/api/v3/configs/') {
            return Promise.resolve({data: gitData})
          }
          const branch = wrapper.vm.selectedBranch
          const docID = wrapper.vm.selectedDocID
          if (path === `/conf/api/v3/configs/${branch}/d/aclprofiles/`) {
            if (config && config.headers && config.headers['x-fields'] === 'id, name') {
              return Promise.resolve({data: _.map(aclDocs, (i) => _.pick(i, 'id', 'name'))})
            }
            return Promise.resolve({data: aclDocs})
          }
          if (path === `/conf/api/v3/configs/${branch}/d/aclprofiles/e/${docID}/`) {
            return Promise.resolve({data: aclDocs[0]})
          }
          if (path === `/conf/api/v3/configs/prod/d/aclprofiles/e/${docID}/v/`) {
            return Promise.resolve({data: aclDocsLogs[0]})
          }
          if (path === `/conf/api/v3/configs/${branch}/d/securitypolicies/`) {
            return Promise.resolve({data: null})
          }
          if (path === '/conf/api/v3/configs/prod/v/') {
            return Promise.resolve({data: gitData[0].logs})
          }
          if (path === '/conf/api/v3/configs/zzz_branch/v/') {
            return Promise.resolve({data: gitData[1].logs})
          }
          return Promise.resolve({data: []})
        })
        wrapper = shallowMount(DocumentEditor, {
          global: {
            mocks: {
              $route: mockRoute,
              $router: mockRouter,
            },
          },
        })
        done()
      } catch (err) {
        expect(err).not.toBeDefined()
        done()
      }
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
      wrapper = shallowMount(DocumentEditor, {
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

    test('should display loading indicator when doc not loaded', async () => {
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
      wrapper = shallowMount(DocumentEditor, {
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

    test('should display loading indicator when saving document changes', async () => {
      jest.spyOn(axios, 'put').mockImplementation(() => new Promise(() => {
      }))
      const saveDocumentButton = wrapper.find('.save-document-button')
      saveDocumentButton.trigger('click')
      await nextTick()
      expect(wrapper.vm.isSaveLoading).toBeTruthy()
      expect(Object.values(saveDocumentButton.element.classList)).toContain('is-loading')
    })

    test('should display loading indicator when forking document', async () => {
      jest.spyOn(axios, 'post').mockImplementation(() => new Promise(() => {
      }))
      const forkDocumentButton = wrapper.find('.fork-document-button')
      await forkDocumentButton.trigger('click')
      expect(forkDocumentButton.element.classList).toContain('is-loading')
    })

    test('should display loading indicator when adding a new document', async () => {
      jest.spyOn(axios, 'post').mockImplementation(() => new Promise(() => {
      }))
      const newDocumentButton = wrapper.find('.new-document-button')
      await newDocumentButton.trigger('click')
      expect(newDocumentButton.element.classList).toContain('is-loading')
    })

    test('should display loading indicator when deleting a document', async () => {
      jest.spyOn(axios, 'delete').mockImplementation(() => new Promise(() => {
      }))
      // create new document so we can delete it
      const newDocumentButton = wrapper.find('.new-document-button')
      await newDocumentButton.trigger('click')
      const deleteDocumentButton = wrapper.find('.delete-document-button')
      await deleteDocumentButton.trigger('click')
      expect(deleteDocumentButton.element.classList).toContain('is-loading')
    })
  })
})
