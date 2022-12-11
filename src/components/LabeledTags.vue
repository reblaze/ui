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
@import 'src/assets/styles/colors';

.labeled-tag {
  background-color: $color-alto;
  border: 1px solid $color-white;
  border-radius: 5px;
  margin-right: 2px;
  max-width: 90%;
  padding: 5px 10px;
  width: fit-content;
}
</style>
