<template>
  <div class="card-content">
    <div class="media">
      <div class="media-content">
        <div class="columns">
          <div class="column">
            <div class="field is-grouped is-pulled-right">
              <div class="control">
                <span class="is-size-7 version-display">Version: {{ selectedCommit }}</span>
              </div>
              <div class="control">
                <span class="is-size-7 buckets-display">Buckets: {{ selectedBucketNames.length }}</span>
              </div>
              <p class="control">
                <button
                    data-qa="publish-changes"
                    class="button is-small publish-button"
                    :class="{'is-loading': isPublishLoading}"
                    @click="publish"
                    :title="selectedBucketNames.length > 0 ? 'Publish configuration': 'Select one or more buckets'"
                    :disabled="selectedBucketNames.length === 0">
                    <span class="icon is-small">
                      <i class="fas fa-cloud-upload-alt"></i>
                    </span>
                  <span>Publish configuration</span>
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="content">
      <hr/>
      <div class="columns">
        <div class="column">
          <p class="title is-6 is-expanded">Version History</p>
          <table class="table"
                 v-if="gitLog && gitLog.length > 0">
            <tbody>
            <tr @click="selectCommit(commit)"
                class="commit-row"
                data-qa="commit-row-btn"
                v-for="commit in commitLines"
                :key="commit.version"
                :class="getVersionRowClass(commit.version)">
              <td class="is-size-7">
                {{ formatDate(commit.date) }} {{ commit.version }}
                <br/>
                {{ commit.message }}
                <br/>
                <strong>{{ commit.author }}</strong> <i>{{ commit.email }}</i>
              </td>
            </tr>
            <tr v-if="!expanded && gitLog.length > init_max_rows">
              <td>
                <a class="has-text-grey view-more-button"
                   @click="expanded = true">
                  View More
                </a>
              </td>
            </tr>
            <tr v-if="expanded && gitLog.length > init_max_rows">
              <td>
                <a class="has-text-grey view-less-button"
                   @click="expanded = false">
                  View Less
                </a>
              </td>
            </tr>
            </tbody>
          </table>
        </div>
        <div class="column">
          <p class="title is-6 is-expanded">Target Buckets</p>
          <table class="table"
                 v-if="gitLog && gitLog.length > 0">
            <tbody>
            <tr
                v-for="bucket in buckets"
                :key="bucket.name"
                :data-qa="bucket.name"
                class="bucket-row"
                :class="{'has-background-warning-light': !publishMode && selectedBucketNames.includes(bucket.name)}"
                @click="bucketNameClicked(bucket.name)">
              <td class="is-size-7">
                  <span class="icon is-small is-vcentered">
                    <svg :width="14"
                         :height="14"
                         :viewBox="'0 0 24 24'">
                      <path :d="mdiBucketPath"/>
                    </svg>
                  </span>
                &nbsp;
                <span class="is-vcentered">{{ bucket.name }}</span>
              </td>
              <td class="is-size-7">
                {{ bucket.url }}
                <p class="has-text-danger"
                   v-if="bucket.publishStatus && !bucket.publishStatus.ok">
                  Error publishing to this bucket: {{ bucket.publishStatus.message }}!
                </p>
                <p class="has-text-success"
                   v-if="bucket.publishStatus && bucket.publishStatus.ok">
                  Publish to this bucket has been done successfully!
                </p>
              </td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import _ from 'lodash'
import RequestsUtils, {IRequestParams} from '@/assets/RequestsUtils'
import {mdiBucket} from '@mdi/js'
import {defineComponent} from 'vue'
import {Commit} from '@/types'
import {AxiosResponse} from 'axios'
import Utils from '@/assets/Utils'
import DateTimeUtils from '@/assets/DateTimeUtils'
import {mapStores} from 'pinia'
import {useBranchesStore} from '@/stores/BranchesStore'

export default defineComponent({
  name: 'PublishChanges',
  props: {},
  components: {},
  data() {
    return {
      mdiBucketPath: mdiBucket,
      gitLog: [],
      expanded: false,
      init_max_rows: 5,
      publishMode: false,
      // db/system info
      publishInfo: {buckets: [], branch_buckets: []},
      // reent commit or user clicks
      selectedCommit: null,
      // branch's buckets by default + plus user clicks
      selectedBucketNames: [],
      // buckets which are within an ongoing publish operation
      publishedBuckets: [],
      apiRoot: RequestsUtils.confAPIRoot,
      apiVersion: RequestsUtils.confAPIVersion,
      // loading indicator
      isPublishLoading: false,
    }
  },
  watch: {
    selectedBranch: {
      handler: function(val, oldVal) {
        if ((this.$route.name as string).includes('PublishChanges') && val && val !== oldVal) {
          this.loadPublishInfo()
          this.loadBranchLogs()
          this.setDefaultBuckets()
        }
      },
      immediate: true,
    },
  },
  computed: {
    buckets(): any[] {
      if (!this.publishMode) {
        return this.publishInfo.buckets
      }
      return this.publishedBuckets
    },

    commitLines(): Commit[] {
      if (this.expanded) {
        return this.gitLog
      }
      return this.gitLog.slice(0, this.init_max_rows)
    },

    selectedBranch(): string {
      return this.branchesStore.selectedBranchId
    },

    ...mapStores(useBranchesStore),
  },
  methods: {
    selectCommit(commit: Commit) {
      this.selectedCommit = commit.version
      this.publishMode = false
    },

    formatDate(date: string) {
      return DateTimeUtils.isoToNowFullCuriefenseFormat(date)
    },

    getVersionRowClass(version: string) {
      const classNames = []
      if (version === this.selectedCommit) {
        classNames.push('has-background-warning-light')
        classNames.push('marked')
      }
      return classNames.join(' ')
    },

    loadBranchLogs() {
      this.gitLog = this.branchesStore.selectedBranch?.logs
      this.selectedCommit = this.gitLog?.[0]?.version || null
    },

    switchBranch() {
      this.loadBranchLogs()
      this.publishMode = false
      Utils.toast(`Switched to branch "${this.selectedBranch}".`, 'is-info')
      this.setDefaultBuckets()
    },

    setDefaultBuckets() {
      this.selectedBucketNames = []
      const bucketList = _.find(this.publishInfo.branch_buckets, (list) => {
        return list.name === this.selectedBranch
      })
      if (bucketList) {
        this.selectedBucketNames = _.cloneDeep(_.filter(bucketList.buckets, (bucket) => {
          return _.find(this.buckets, (publishInfoBucket) => {
            return publishInfoBucket.name === bucket
          })
        }))
      }
    },

    loadPublishInfo() {
      RequestsUtils.sendRequest({
        methodName: 'GET',
        url: `db/system/k/publishinfo/`,
        failureMessage: 'Failed while attempting to load publish info',
      }).then((response: AxiosResponse) => {
        this.publishInfo = {...this.publishInfo, ...response.data}
        this.setDefaultBuckets()
      })
    },

    bucketNameClicked(name: string) {
      const index = _.indexOf(this.selectedBucketNames, name)
      if (index > -1) {
        this.selectedBucketNames.splice(index, 1)
      } else {
        this.selectedBucketNames.push(name)
      }
    },

    async publish() {
      this.isPublishLoading = true
      this.publishMode = true
      this.publishedBuckets = _.cloneDeep(_.filter(this.publishInfo.buckets, (bucket) => {
        return _.indexOf(this.selectedBucketNames, bucket.name) > -1
      }))

      const failureMessage = 'Failed while attempting to publish branch ' +
          `"${this.selectedBranch}" version "${this.selectedCommit}".`
      const publishRequestData: IRequestParams = {
        methodName: 'PUT',
        url: `tools/publish/${this.selectedBranch}/v/${this.selectedCommit}/`,
        data: this.buckets,
      }
      const response = await RequestsUtils.sendReblazeRequest(publishRequestData)
      if (response) {
        this.parsePublishResults(true)
        this.isPublishLoading = false
      } else {
        console.log(`Reblaze publish ${failureMessage}`)
        console.log('Attempting publish using confserver')
        publishRequestData.failureMessage = failureMessage
        publishRequestData.onFail = () => {
          this.isPublishLoading = false
        }
        RequestsUtils.sendRequest(publishRequestData).then((response: AxiosResponse) => {
          this.parsePublishResults(response?.data.ok, response?.data)
          this.isPublishLoading = false
        })
      }
    },

    parsePublishResults(success: boolean, data?: any) {
      if (success) {
        Utils.toast(
            `Branch "${this.selectedBranch}" was published with version "${this.selectedCommit}".`,
            'is-success',
        )
      } else {
        Utils.toast(
            `Failed while attempting to publish branch "${this.selectedBranch}" version "${this.selectedCommit}".`,
            'is-danger',
        )
      }
      _.each(data?.status, (responseStatus) => {
        const index = _.findIndex(this.publishedBuckets, (entry) => {
          return entry.name === responseStatus.name
        })
        if (index > -1) {
          this.publishedBuckets[index].publishStatus = responseStatus
        }
      })
      this.publishedBuckets = _.cloneDeep(this.publishedBuckets)
    },

  },

  async created() {
    await this.branchesStore.list
  },

})
</script>

<style scoped
       lang="scss">
.marked {
  font-weight: 400;
}
</style>
