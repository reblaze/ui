<template>
  <div class="card collapsible-card"
       :class="{ collapsed: isVersionHistoryCollapsed }">
    <div class="card-content px-0 py-0">
      <div class="media collapsible px-5 py-5 mb-0"
           @click="toggleVersionHistoryCollapsed">
        <div class="media-content">
          <p class="title is-6 version-history-title">
            Version History
            <button class="button is-outlined is-text is-small is-loading"
                    v-if="loading">
              Loading
            </button>
          </p>
        </div>
        <span v-show="isVersionHistoryCollapsed">
          <i class="fas fa-angle-down"
             aria-hidden="true" />
        </span>
        <span v-show="!isVersionHistoryCollapsed">
          <i class="fas fa-angle-up"
             aria-hidden="true" />
        </span>
      </div>
      <div class="content px-5 pb-5">
        <div class="collapsible-content mb-4">
          <table class="table"
                 v-if="gitLog && gitLog.length">
            <thead>
            <tr>
              <th class="is-size-7 width-120px">Date</th>
              <th class="is-size-7 width-70px">Version</th>
              <th class="is-size-7 width-70px">Parents</th>
              <th class="is-size-7">Message</th>
              <th class="is-size-7 width-150px">Author</th>
              <th class="is-size-7 width-200px">Email</th>
              <th class="is-size-7"></th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="(commit, index) in commits"
                :key="commit.version"
                @mouseleave="mouseLeave()"
                @mouseover="mouseOver(index)">
              <td class="is-size-7 is-vcentered py-3"
                  :title="fullFormatDate(commit.date)">
                {{ formatDate(commit.date) }}
              </td>
              <td class="is-size-7 is-vcentered py-3"
                  :title="commit.version">
                {{ commit.version.substr(0, 7) }}
              </td>
              <td class="is-size-7 is-vcentered py-3">
                <p v-for="parent in commit.parents"
                   :key="parent"
                   :title="parent">
                  {{ parent.substr(0, 7) }}
                </p>
              </td>
              <td class="is-size-7 is-vcentered py-3">{{ commit.message }}</td>
              <td class="is-size-7 is-vcentered py-3">{{ commit.author }}</td>
              <td class="is-size-7 is-vcentered py-3">{{ commit.email }}</td>
              <td class="is-size-7 is-vcentered restore-cell">
                <p class="control has-text-centered"
                   v-if="commitOverIndex === index">
                  <button class="button is-small restore-button"
                          @click="restoreVersion(commit)"
                          tabindex="1"
                          title="Restore version">
                    <span class="icon is-small">
                      <i class="fas fa-history"></i>
                    </span>
                  </button>
                </p>
              </td>
            </tr>
            <tr v-if="!expanded && gitLog.length > maxRows">
              <td colspan="6">
                <a class="has-text-grey"
                   @click="expanded = true">View More</a>
              </td>
            </tr>
            <tr v-if="expanded && gitLog.length > maxRows">
              <td colspan="6">
                <a class="has-text-grey"
                   @click="expanded = false">View Less</a>
              </td>
            </tr>
            </tbody>
          </table>
        </div>
        <span class="is-family-monospace has-text-grey-lighter is-inline-block mt-3">
          {{ apiRoot }}/{{ apiVersion }}/{{ apiPath }}
        </span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue'
import {Commit} from '@/types'
import DateTimeUtils from '@/assets/DateTimeUtils'
import RequestsUtils from '@/assets/RequestsUtils'
import {AxiosError, AxiosResponse} from 'axios'

export default defineComponent({
  name: 'GitHistory',

  props: {
    apiPath: String,
    restoreTargetTitle: String,
    isCollapsedInitialState: {
      type: Boolean,
      default: true,
    },
  },

  watch: {
    apiPath: {
      handler: function(val, oldVal) {
        if (val && val !== oldVal) {
          if (!this.isVersionHistoryCollapsed) {
            this.loadGitLog()
          }
        }
      },
    },
  },

  data() {
    return {
      gitLog: [],
      isVersionHistoryCollapsed: this.isCollapsedInitialState,
      loading: false,
      expanded: false,
      maxRows: 5,
      commitOverIndex: null,
      apiRoot: RequestsUtils.confAPIRoot,
      apiVersion: RequestsUtils.confAPIVersion,
    }
  },

  computed: {
    commits(): Commit[] {
      if (this.expanded) {
        return this.gitLog
      }
      return this.gitLog.slice(0, this.maxRows)
    },
  },
  emits: ['restore-version'],
  methods: {
    loadGitLog() {
      this.loading = true
      this.gitLog = []
      const url = this.apiPath
      RequestsUtils.sendRequest({methodName: 'GET', url}).then((response: AxiosResponse<Commit[]>) => {
        this.gitLog = response?.data
        this.loading = false
      }).catch((err: AxiosError) => {
        console.error(`Error while attempting to load Git Log from path: ${this.apiPath}. Error: ${err}`)
        this.loading = false
      })
    },

    async restoreVersion(commit: Commit) {
      const versionId = commit.version
      const url = this.apiPath

      await RequestsUtils.sendRequest({
        methodName: 'PUT',
        url: `${url}${versionId}/revert/`,
        successMessage: `The ${this.restoreTargetTitle} restored to version [${versionId}]!`,
        failureMessage: `Failed restoring ${this.restoreTargetTitle} to version [${versionId}]!`,
      })
      this.loadGitLog()
      this.$emit('restore-version')
    },

    toggleVersionHistoryCollapsed() {
      this.isVersionHistoryCollapsed = !this.isVersionHistoryCollapsed
      if ((!this.gitLog || !this.gitLog.length) && !this.isVersionHistoryCollapsed) {
        this.loadGitLog()
      }
    },

    mouseLeave() {
      this.commitOverIndex = null
    },

    mouseOver(index: number) {
      this.commitOverIndex = index
    },

    formatDate(date: string) {
      return DateTimeUtils.isoToNowCuriefenseFormat(date)
    },

    fullFormatDate(date: string) {
      return DateTimeUtils.isoToNowFullCuriefenseFormat(date)
    },
  },

  mounted() {
    if (!this.isCollapsedInitialState) {
      this.loadGitLog()
    }
  },
})
</script>
<style scoped
       lang="scss">
.version-history-title {
  line-height: 30px;
}

.restore-cell {
  width: 50px;
}

</style>
