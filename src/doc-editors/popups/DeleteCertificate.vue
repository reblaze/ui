<template>
<div class="modal is-active" v-if="deleteShown">
    <div class="modal-background">
        <div class="modal-card modal-location">
            <header class="modal-card-head">
                <h5 class="modal-card-title is-size-6 mb-0">Remove certificate</h5>
                <button class="delete" aria-label="close" @click="$emit('deleteShownChanged', false)"></button>
            </header>
            <section class="modal-card-body is-size-6 has-text-centered">
                <p class="is-small is-size-6">
                    Are you sure you want to remove certificate<br />
                    <strong>{{ clickedRow }}</strong>?
                </p>
                <p
                    v-if="attachedApps"
                    class="is-small is-size-6 mt-2"
                    v-html="attachedApps"
                ></p>
            </section>
            <footer class="modal-card-foot">
                <div class="buttons is-right is-fullwidth">
                    <button class="button is-small" @click="$emit('deleteShownChanged', false)">
                        Cancel
                    </button>
                    <button
                        class="button is-small is-light is-outlined is-danger"
                        :class="{'is-loading': is_loading}"
                        @click="deleteCertificate(clickedRow)">
                        Delete
                    </button>
                </div>
            </footer>
        </div>
    </div>
</div>
</template>
<script lang="ts">
// import RequestsUtils from '@/assets/RequestsUtils'
export default {
  props: {
    deleteShown: Boolean,
    clickedRow: String,
    selectedBranch: String,
  },
  data() {
    return {
      attachedApps: '',
      is_loading: false,
    }
  },

  methods: {
    async deleteCertificate(clickedRow:any) {
      /* TODO: after the backend finish - const url = `configs/${this.selectedBranch}/d/certificates/e/${clickedRow}`
      await RequestsUtils.sendReblazeRequest({methodName: 'DELETE', url}).then(() => {
        this.$emit('deleteShownChanged', false)
      }) */
      this.$emit('deleteClickedChanged', clickedRow)
    },
  },
}
</script>
<style scoped lang="scss">
.modal-location {
  margin-bottom: 8px;
  margin-top: -5px;
}

.modal-card {
  border-radius: 6px;
  top: 2%;
}

.buttons.is-fullwidth {
  width: 100%;
}
</style>
