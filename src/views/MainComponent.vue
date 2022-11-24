<template>
  <div class="main-component-wrapper is-fullheight">
    <nav class="navbar is-fixed-top is-light"
         role="navigation"
         aria-label="main navigation">
      <header-main/>
    </nav>
    <br/>
    <div class="content-container is-fullheight">
      <div class="columns">
        <div class="column side-menu-column">
          <side-menu></side-menu>
        </div>
        <div class="column router-view-column">
          <div class="card is-fullheight has-overflow-y-auto"
               ref="viewCardScroll">
            <router-view></router-view>
          </div>
        </div>
      </div>
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

export default defineComponent({
  name: 'MainComponent',
  components: {HeaderMain, SideMenu},
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
    ...mapStores(useBranchesStore),
  },
  created() {
    this.branchesStore.loadBranches()
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
  margin-bottom: 1rem;
  z-index: 100000;
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
