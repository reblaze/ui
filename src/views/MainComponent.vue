<template>
  <div class="main-component-wrapper is-fullheight">
    <nav class="navbar is-fixed-top is-light"
         role="navigation"
         aria-label="main navigation">
      <header-main/>
    </nav>
    <div class="content-container is-fullheight">
      <div class="columns my-0">
        <div class="column side-menu-column">
          <side-menu></side-menu>
        </div>
        <div class="column router-view-column">
          <div class="card is-fullheight has-overflow-y-auto mb-0"
               ref="viewCardScroll">
            <router-view></router-view>
          </div>
        </div>
      </div>
      <idle-modal v-if="isIdle"></idle-modal>
    </div>
  </div>
</template>

<script lang="ts">
import HeaderMain from '@/components/HeaderMain.vue'
import SideMenu from '@/components/SideMenu.vue'
import {defineComponent} from 'vue'
import 'core-js'
import {mapStores} from 'pinia'
import {useBranchesStore} from '@/stores/BranchesStore'
import IdleModal from '@/components/IdleModal.vue'
import {useIdleStore} from '@/stores/IdleStore'

export default defineComponent({
  name: 'MainComponent',
  components: {IdleModal, HeaderMain, SideMenu},
  watch: {
    $route: {
      handler: async function(val, oldVal) {
        if (val && val !== oldVal) {
          this.$refs.viewCardScroll.scrollTop = 0
        }
      },
      deep: true,
    },
  },
  computed: {
    isIdle(): boolean {
      return this.idleStore.isIdle
    },

    ...mapStores(useBranchesStore, useIdleStore),
  },
  created() {
    this.branchesStore.loadBranches()
    this.idleStore.trackIdleStateStart()
  },
})
</script>
<style scoped
       lang="scss">
$side-menu-width: 220px;
$router-view-width: calc(100% - #{$side-menu-width});

html {
  background: hsl(206, 23%, 94%);
}

.navbar.is-fixed-top {
  z-index: 100000;
}

.content-container {
  padding-top: 60px;
}

.columns {
  height: 100%;
  margin-left: 0;
  width: 100%;
}

.side-menu-column {
  max-width: $side-menu-width;
  min-width: $side-menu-width;
  width: $side-menu-width;
}

.router-view-column {
  max-width: $router-view-width;
  min-width: $router-view-width;
  width: $router-view-width;
}

</style>
