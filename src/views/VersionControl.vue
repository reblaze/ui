<template>
  <div class="card-content">
    <div class="media">
      <div class="media-content">
        <div class="columns">
          <div class="column"
               v-if="selectedBranch">
            <div class="field is-grouped is-pulled-right">
              <p class="control">
                  <span class="field has-addons">
                    <span class="control">
                      <button class="button is-small fork-branch-toggle"
                              data-qa="fork-branch-btn"
                              @click="toggleBranchFork()">
                        <span class="icon is-small">
                          <i class="fas fa-code-branch"></i>
                        </span>
                        <span>
                          Fork
                        </span>
                      </button>
                    </span>
                    <span class="control is-expanded"
                          v-if="forkBranchInputOpen">
                      <input class="input is-small fork-branch-input"
                             title="Forked branch name"
                             data-qa="fork-branch-name-input"
                             @input="validateInput($event, isSelectedBranchForkNameValid)"
                             placeholder="Forked Branch Name"
                             v-model="forkBranchName"
                             type="text">
                    </span>
                    <span class="control"
                          v-if="forkBranchInputOpen">
                      <button class="button is-danger is-small fork-branch-cancel"
                              data-qa="cancel-branch-fork-btn"
                              @click="toggleBranchFork">
                        <span class="icon is-small">
                          <i class="fas fa-times"></i>
                        </span>
                      </button>
                    </span>
                    <span class="control"
                          v-if="forkBranchInputOpen">
                      <button class="button is-primary is-small fork-branch-confirm"
                              data-qa="confirm-branch-fork-btn"
                              @click="forkBranch"
                              :disabled="!isSelectedBranchForkNameValid">
                        <span class="icon is-small">
                          <i class="fas fa-check"></i>
                        </span>
                      </button>
                    </span>
                  </span>
              </p>

              <p class="control">
                <button class="button is-small download-branch-button"
                        :class="{'is-loading': isDownloadLoading}"
                        @click="downloadBranch()"
                        data-qa="download-branch-btn"
                        title="Download branch">
                  <span class="icon is-small">
                    <i class="fas fa-download"></i>
                  </span>
                  <span>
                    Download
                  </span>
                </button>
              </p>

              <p class="control">
                  <span class="field has-addons">
                    <span class="control">
                      <button class="button is-small has-text-danger delete-branch-toggle"
                              data-qa="delete-branch-btn"
                              @click="toggleBranchDelete()"
                              :disabled="isSelectedBranchProtected"
                              :title="isSelectedBranchProtected ? 'Protected branch cannot be deleted' : ''">
                        <span class="icon is-small">
                          <i class="fas fa-trash"></i>
                        </span>
                        <span>
                          Delete
                        </span>
                      </button>
                    </span>
                    <span class="control is-expanded"
                          v-if="deleteBranchInputOpen">
                      <input class="input is-small delete-branch-input"
                             data-qa="confirm-branch-name-input"
                             title="Confirm branch name"
                             placeholder="Confirm Branch Name"
                             v-model="deleteBranchName"
                             type="text">
                    </span>
                    <span class="control"
                          v-if="deleteBranchInputOpen">
                      <button class="button is-danger is-small delete-branch-cancel"
                              data-qa="cancel-delete-branch-btn"
                              @click="toggleBranchDelete">
                        <span class="icon is-small">
                          <i class="fas fa-times"></i>
                        </span>
                      </button>
                    </span>
                    <span class="control"
                          v-if="deleteBranchInputOpen">
                      <button class="button is-primary is-small delete-branch-confirm"
                              data-qa="confirm-delete-branch-btn"
                              @click="deleteBranch"
                              :disabled="!isSelectedBranchDeleteNameValid">
                        <span class="icon is-small">
                          <i class="fas fa-check"></i>
                        </span>
                      </button>
                    </span>
                  </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <hr/>
    <div class="content">
      <git-history :api-path="gitAPIPath"
                   :is-collapsed-initial-state="false"/>
    </div>
  </div>
</template>

<script lang="ts">
import RequestsUtils from '@/assets/RequestsUtils'
import Utils from '@/assets/Utils'
import GitHistory from '@/components/GitHistory.vue'
import {defineComponent} from 'vue'
import {mapStores} from 'pinia'
import {useBranchesStore} from '@/stores/BranchesStore'
import {Branch} from '@/types'

export default defineComponent({

  name: 'VersionControl',
  props: {},
  components: {
    GitHistory,
  },

  data() {
    return {
      selectedBranchData: null,
      isDownloadLoading: false,
      branches: null as Branch[],

      forkBranchName: '',
      forkBranchInputOpen: false,
      deleteBranchName: '',
      deleteBranchInputOpen: false,
    }
  },

  watch: {
    selectedBranch: {
      handler: async function(val, oldVal) {
        if ((this.$route.name as string).includes('VersionControl') && val && val !== oldVal) {
          await this.loadSelectedBranchData()
        }
      },
      immediate: true,
    },
  },

  computed: {
    gitAPIPath(): string {
      return `configs/${this.selectedBranch}/v/`
    },

    isSelectedBranchForkNameValid(): boolean {
      const newName = this.forkBranchName.trim()
      const isBranchNameEmpty = newName === ''
      const isBranchNameContainsSpaces = newName.includes(' ')
      const isBranchNameDuplicate = this.branches.find((item) => {
        return item.id === newName
      })
      return !isBranchNameEmpty && !isBranchNameDuplicate && !isBranchNameContainsSpaces
    },

    isSelectedBranchDeleteNameValid(): boolean {
      const newName = this.deleteBranchName.trim()
      return newName === this.selectedBranch
    },

    isSelectedBranchProtected(): boolean {
      return ['prod', 'stage'].includes(this.selectedBranch.toLowerCase())
    },

    selectedBranch(): string {
      return this.branchesStore.selectedBranchId
    },

    ...mapStores(useBranchesStore),
  },

  methods: {
    validateInput(event: Event, validator: Function | boolean) {
      Utils.validateInput(event, validator)
    },

    toggleBranchFork() {
      this.forkBranchInputOpen = !this.forkBranchInputOpen
      if (!this.forkBranchInputOpen) {
        this.forkBranchName = ''
      }
    },

    toggleBranchDelete() {
      this.deleteBranchInputOpen = !this.deleteBranchInputOpen
      if (!this.deleteBranchInputOpen) {
        this.deleteBranchName = ''
      }
    },

    async loadSelectedBranchData() {
      this.isDownloadLoading = true
      const response = await RequestsUtils.sendRequest({
        methodName: 'GET',
        url: `configs/${this.selectedBranch}/`,
      })
      this.selectedBranchData = response?.data
      this.isDownloadLoading = false
    },

    deleteBranch() {
      RequestsUtils.sendRequest({
        methodName: 'DELETE',
        url: `configs/${this.selectedBranch}/`,
        successMessage: `Branch ${this.selectedBranch} was deleted.`,
        failureMessage: `Failed while attempting to delete branch "${this.selectedBranch}".`,
      }).then(async () => {
        this.branches = await this.branchesStore.loadBranches()
        await this.branchesStore.setSelectedBranch()
        this.toggleBranchDelete()
      })
    },

    forkBranch() {
      const newBranchName = this.forkBranchName
      RequestsUtils.sendRequest({
        methodName: 'POST',
        url: `configs/${this.selectedBranch}/clone/${newBranchName}/`,
        data: {
          'id': 'string',
          'description': 'string',
        },
        successMessage: `Branch "${this.selectedBranch}" was forked to "${this.forkBranchName}".`,
        failureMessage: `Failed while attempting to fork branch "${this.selectedBranch}" to "${this.forkBranchName}".`,
      }).then(async () => {
        this.branches = await this.branchesStore.loadBranches()
        await this.branchesStore.setSelectedBranch(newBranchName)
        this.toggleBranchFork()
      })
    },

    downloadBranch() {
      if (!this.isDownloadLoading) {
        Utils.downloadFile(this.selectedBranch, 'json', this.selectedBranchData)
      }
    },

  },

  async created() {
    this.branches = await this.branchesStore.list
  },
})
</script>
