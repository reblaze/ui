<template>
    <div class="card">
        <div class="card-content">
          <div class="content">
            <div class="columns columns-divided">
              <div class="column is-3">
                <div class="field">
                  <label class="label is-small">
                    Name
                    <span class="has-text-grey is-pulled-right document-id"
                          title="Rule id">
                      aaa
                    </span>
                    <!-- TODO: add {{ localDoc.id }} instead "aaa" -->
                  </label>
                  <div class="control">
                    <input class="input is-small document-name"
                           data-qa="list-name-input"
                           title="List name"
                           placeholder="List name"/>
                           <!-- TODO: add to input @change="emitDocUpdate", v-model="localDoc.name" and :readonly="readonly" -->
                  </div>
                  <p class="subtitle is-7 has-text-grey sections-entries-display">
                    aaa
                  </p>
                  <!-- TODO: add {{ sectionsEntriesDisplay }} instead "aaa" -->
                </div>
                <div class="field">
                  <label class="checkbox is-size-7">
                    <input type="checkbox"
                           data-qa="active-checkbox"
                           class="document-active">
                           <!-- TODO: add to input :readonly="readonly", :disabled="readonly", @change="emitDocUpdate" and v-model="localDoc.active" -->
                    Active
                  </label>
                </div>
                <div class="field">
                  <div class="control"> <!-- TODO: add to div v-if="editable" -->
                    <label class="label is-small">Sections Relation</label>
                    <div class="tags has-addons mb-0 document-sections-relation"
                         tabindex="0"
                         @keypress.space.prevent>
                         <!-- TODO: add to div @keypress.space="toggleRuleRelation()" and @keypress.enter="toggleRuleRelation()" -->
                      <span class="tag pointer mb-0"
                            data-qa="relation-toggle">
                            <!-- TODO: addto span :class="localDoc.rule.relation === 'AND' ? 'is-info xis-light is-selected' : ''" and @click="setRuleRelation('AND')" -->
                        AND
                      </span>
                      <span class="tag pointer mb-0">
                        <!-- TODO: add to span :class="localDoc.rule.relation === 'OR' ? 'is-info xis-light is-selected' : ''" and @click="setRuleRelation('OR')" -->
                        OR
                      </span>
                    </div>
                  </div>
                </div>
                <div class="field">
                  <label class="label is-small">Tags</label>
                  <div class="control"
                       data-qa="tag-input">
                    <tag-autocomplete-input :selection-type="'multiple'"></tag-autocomplete-input>
                    <!--TODO: add to tagautocomplete-input :initial-tag="selectedDocTags" and @tag-changed="selectedDocTags = $event" -->
                  </div>
                </div>
                <div class="field">
                  <a
                     class="is-small has-text-grey is-size-7 is-pulled-right update-now-button"
                     data-qa="update-now-btn"
                     tabindex="0"
                     @keypress.space.prevent>
                    update now
                  </a>
                  <!-- TODO: add to a tag v-if="externalSource" , @click="fetchList", @keypress.space="fetchList" and @keypress.enter="fetchList" -->
                  <label class="label is-small">Source</label>
                  <div class="control">
                    <input class="input is-small document-source"
                           data-qa="source-input"
                           title="List source"
                           placeholder="List source"/>
                           <!-- TODO: add to input tag @change="emitDocUpdate" v-model="localDoc.source" :readonly="readonly" -->
                  </div>
                  <p class="help"> <!-- TODO: add v-if="externalSource" and :title="fullFormattedModifiedDate" to p tag -->
                    aaaa
                  </p>
                  <!-- TODO: add updated @ {{ formattedModifiedDate }} instead "aaa" -->
                </div>
                <div class="field">
                  <response-action :ignore="['ban']"
                                   label-separated-line
                                   is-single-input-column/>
                                   <!-- TODO: add v-model:action="localDoc.action" and @update:action="emitDocUpdate" -->
                </div>
                <div class="field textarea-field">
                  <label class="label is-small">Description</label>
                  <div class="control">
                    <textarea class="is-small textarea document-description"
                              title="Description"
                              rows="5">
                    </textarea>
                    <!-- TODO: add to textarea @change="emitDocUpdate"
                                v-model="localDoc.description"
                                :readonly="readonly" -->
                  </div>
                </div>
                <div class="pt-6">
                  <div class="field" > <!-- TODO: v-if="editable"-->
                    <div class="control is-expanded">
                      <button class="button is-small has-text-danger-dark remove-all-sections-button"
                              data-qa="remove-all-sections-btn"
                              title="Remove all sections"
                              > <!-- TODO: add @click="removeAllSections" there-->
                        Clear all sections
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div class="column is-9">
                <entries-relation-list ref="entriesRelationList">  <!-- TODO: add to entries-relation-list v-model:rule="localDoc.rule", :editable="editable", @update:rule="emitDocUpdate", @invalid="emitFormInvalid" -->
                </entries-relation-list>
              </div>
            </div>
            <span class="is-family-monospace has-text-grey-lighter">aaa</span> <!-- TODO: should be {{ apiPath }} instead "aaa" -->
          </div>
        </div>
      </div>
</template>
<script lang="ts">
// import _ from 'lodash'
import {defineComponent} from 'vue'
/* import RequestsUtils from '@/assets/RequestsUtils'
import ResponseAction from '@/components/ResponseAction.vue'
import {AxiosResponse} from 'axios'
import DateTimeUtils from '@/assets/DateTimeUtils' */
export default defineComponent({
})
</script>
<style scoped lang="scss">
</style>
