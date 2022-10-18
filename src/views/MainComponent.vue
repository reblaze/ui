<template>
  <div>
    <nav class="navbar is-fixed-top is-light" role="navigation" aria-label="main navigation">
      <header-main/>
    </nav>
    <br/>
    <div class="content-container">
      <div class="columns">
        <div class="column width-250px">
          <side-menu></side-menu>
        </div>
        <div class="column">
          <router-view></router-view>
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

export default defineComponent({
  name: 'MainComponent',
  components: {HeaderMain, SideMenu},
  methods: {},
})
</script>
<style scoped lang="scss">
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

</style>
