<template>
  <div class="is-size-7 mb-4">
    <span class="is-small"
           v-if="title">
      {{ title }}:
    </span>
    <div class="labeled-tags-wrapper">
      <div v-for="(tag, index) in tags"
           :key="index"
           :title="tag"
           class="labeled-tag ellipsis"
           :class="labelClass"
           @click="emitTagClicked($event, tag, index)"
           @contextmenu="emitTagContextmenu($event, tag, index)">
        {{ tag }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue'

export default defineComponent({
  name: 'LabeledTags',
  props: {
    title: String,
    tags: Array,
    labelClass: String,
  },
  emits: ['tag-clicked', 'tag-contextmenu'],
  methods: {
    emitTagClicked(event: PointerEvent, tag: string, index: number) {
      this.$emit('tag-clicked', {event, tag, index})
    },

    emitTagContextmenu(event: PointerEvent, tag: string, index: number) {
      this.$emit('tag-contextmenu', {event, tag, index})
    },
  },
})
</script>

<style scoped
       lang="scss">

@import 'node_modules/bulma/sass/utilities/initial-variables.sass';
@import 'node_modules/bulma/sass/utilities/functions.sass';
@import 'node_modules/bulma/sass/utilities/derived-variables.sass';
@import 'node_modules/bulma/sass/helpers/color.sass';

.labeled-tag {
  @extend .has-background-grey-lighter;
  border: 1px solid #fff;
  border-radius: 10px;
  margin-right: 0.25rem;
  max-width: 90%;
  padding: 0.05rem 0.5rem;
  width: fit-content;
}
</style>
