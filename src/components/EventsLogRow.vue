<template>
  <div class="box event-row-box mb-0">
    <div class="event-row-summary is-fullwidth mb-0 is-clickable"
         :class="{'event-row-summary-open': eventFullDetails}"
         @click="toggleShowFullDetails()">
      <div class="columns event-row-summary-columns mb-0">
        <span class="column width-10px">
          <span class="dot"
                :class="{
                  'dot-report': isEventReport,
                  'dot-passed': !isEventReport && !event.reason,
                  'dot-blocked': event.reason,
                }"
                :title="dotTitle"/>
        </span>
        <span class="column width-100px"
              @contextmenu="openContextMenu($event, 'ip')">
          {{ event.ip }}
        </span>
        <span class="column width-50px status-box-wrapper"
              @contextmenu="openContextMenu($event, 'response_code')">
          <span class="status-box px-2 my-2"
                :style="`background: ${getStatusColor(event.response_code?.toString())}`">
            {{ event.response_code }}
          </span>
        </span>
        <span class="column width-60px"
              @contextmenu="openContextMenu($event, 'method')">
          {{ event.method }}
        </span>
        <span class="column ellipsis">
          <span @contextmenu="openContextMenu($event, 'headers', 'x-forwarded-proto')">
            {{ `${event.headers['x-forwarded-proto']}://` }}
          </span>
          <span @contextmenu="openContextMenu($event, 'authority')">
            {{ event.authority }}
          </span>
          <span v-if="event.headers['x-forwarded-port'] === '80'"
                @contextmenu="openContextMenu($event, 'headers', 'x-forwarded-port')">
            {{ `:${event.headers['x-forwarded-port']}` }}
          </span>
          <span @contextmenu="openContextMenu($event, 'uri')">
            {{ event.uri }}
          </span>
        </span>
        <span class="column width-170px">
          {{ eventTime }}
        </span>
        <span class="column width-40px has-text-weight-bold has-text-right">
          <span v-if="groupHeader && groupLength > 1"
                title="Expand group"
                @click.stop="emitToggleShowFullGroup()">
            <!--length minus 1 to exclude the first entry which is always shown-->
            +{{ groupLength - 1 }}
          </span>
        </span>
      </div>
      <div class="columns event-row-summary-columns mb-0">
        <span class="column width-10px">
          <!--Placeholder for the circle from the line above, spans upon the two rows-->
        </span>
        <span class="column width-500px ellipsis">
          <span @contextmenu="openContextMenu($event, 'curiesession')">
            <span class="has-text-weight-bold">
              Session ID:
            </span>
            {{ event.curiesession }}
          </span>
        </span>
        <span class="column ellipsis"
              :title="addToSummaryDisplay"
              @contextmenu="openContextMenu($event, addToSummaryProperty, addToSummaryInnerIdentifier)">
          {{ addToSummaryDisplay }}
        </span>
        <span class="column width-40px">
          <!--Placeholder to keep the spacing aligned with the line above-->
        </span>
      </div>
    </div>
    <div class="full-details-wrapper py-4"
         v-if="eventFullDetails">
      <div class="box full-details-box reason-box py-2 px-3 mb-3 is-clickable"
           title="Reason"
           v-if="event.reason"
           @contextmenu="openContextMenu($event, 'reason')">
        <span class="has-text-weight-bold">
          Reason:
        </span>
        {{ event.reason }}
      </div>
      <div class="is-flex is-justify-content-space-between">
        <div class="box full-details-box py-2 px-3 mr-2 mb-3 is-clickable is-inline-block"
             title="Request ID"
             @contextmenu="openContextMenu($event, 'request_id')">
          <span class="has-text-weight-bold">
            Request ID:
          </span>
          {{ event.request_id }}
        </div>
        <div v-if="event.proxy">
          <div class="box full-details-box py-2 px-3 mb-3 is-inline-block">
            <span class="has-text-weight-bold">
              Latency
            </span>
            {{ eventLatency }} ms
          </div>
          <div class="box full-details-box py-2 px-3 ml-2 mb-3 is-inline-block">
            <span class="has-text-weight-bold">
              Geographic Coordinates:
            </span>
            <span title="Latitude"
                  class="is-clickable"
                  @contextmenu="openContextMenu($event, 'proxy', 'geo_lat')">
              {{ event.proxy.geo_lat }}
            </span>
            ,
            <span title="Longitude"
                  class="is-clickable"
                  @contextmenu="openContextMenu($event, 'proxy', 'geo_long')">
              {{ event.proxy.geo_long }}
            </span>
          </div>
          <div class="box full-details-box py-2 px-3 mb-3 ml-2 is-inline-block">
            <span title="Upload"
                  class="is-clickable"
                  @contextmenu="openContextMenu($event, 'proxy', 'request_length')">
              <i class="fa fa-upload"/>
              {{ amountSuffixFormatterBytes(Number(event.proxy.request_length)) }}
            </span>
            |
            <span title="Download"
                  class="is-clickable"
                  @contextmenu="openContextMenu($event, 'proxy', 'bytes_sent')">
              <i class="fa fa-download"/>
              {{ amountSuffixFormatterBytes(Number(event.proxy.bytes_sent)) }}
              <span v-if="['200', '304'].includes(event.proxy.status) &&
               event.proxy.upstream_status === '-' &&
               /challenge/.test(event.reason)">
                (from-cache)
              </span>
            </span>
          </div>
        </div>
      </div>
      <div class="card collapsible-card collapsible-card-session-ids mb-3"
           :class="{ collapsed: isSessionIDsCollapsed }"
           v-if="event.curiesession_ids?.length > 1">
        <div class="card-content px-0 py-0">
          <div class="media collapsible collapsible-title px-3 py-3 mb-0"
               @click="isSessionIDsCollapsed = !isSessionIDsCollapsed">
            <div class="media-content">
              <p class="title is-7 is-uppercase">Session IDs ({{ event.curiesession_ids.length - 1 }})</p>
            </div>
            <span v-show="isSessionIDsCollapsed">
              <i class="fas fa-angle-down"
                 aria-hidden="true"></i>
            </span>
            <span v-show="!isSessionIDsCollapsed">
              <i class="fas fa-angle-up"
                 aria-hidden="true"></i>
            </span>
          </div>
          <div class="content collapsible-content px-3 py-3">
            <template v-for="(sessionIDValue, sessionIDKey) in event.curiesession_ids">
              <div v-if="sessionIDKey !== 'sessionid'" :key="sessionIDKey"
                   :title="`${sessionIDKey}: ${sessionIDValue}`"
                   @contextmenu="openContextMenu($event, 'curiesession_ids', sessionIDKey)"
                   class="path-part-field is-size-7 is-clickable">
                <div class="width-200px has-text-weight-bold">
                  {{ sessionIDKey }}
                </div>
                <div>
                  {{ sessionIDValue }}
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
      <div class="box full-details-box py-2 px-3 mb-3 is-clickable"
           v-if="eventUserAgent !== '-'"
           title="User agent"
           @contextmenu="openContextMenu($event, 'headers', 'user-agent')">
        <span class="has-text-weight-bold">
          User Agent:
        </span>
        {{ eventUserAgent }}
      </div>
      <div class="card collapsible-card collapsible-card-tags mb-3"
           :class="{ collapsed: isTagsCollapsed }">
        <div class="card-content px-0 py-0">
          <div class="media collapsible collapsible-title px-3 py-3 mb-0"
               @click="isTagsCollapsed = !isTagsCollapsed">
            <div class="media-content">
              <p class="title is-7 is-uppercase">Tags ({{ event.tags?.length }})</p>
            </div>
            <span v-show="isTagsCollapsed">
              <i class="fas fa-angle-down"
                 aria-hidden="true"></i>
            </span>
            <span v-show="!isTagsCollapsed">
              <i class="fas fa-angle-up"
                 aria-hidden="true"></i>
            </span>
          </div>
          <div class="content collapsible-content px-3 py-3">
            <template v-if="eventTagsLegitimate?.length">
              <span class="label is-size-7">
                Legitimate
              </span>
              <labeled-tags :tags="eventTagsLegitimate"
                            label-class="is-clickable is-inline-block"
                            @tag-contextmenu="openContextMenu($event.event, 'tags', $event.tag)"/>
            </template>
            <template v-if="eventTagsMalicious?.length">
              <span class="label is-size-7">Malicious</span>
              <labeled-tags :tags="eventTagsMalicious"
                            label-class="is-clickable is-inline-block"
                            @tag-contextmenu="openContextMenu($event.event, 'tags', $event.tag)"/>
            </template>
            <template v-if="eventTagsNeutral?.length">
              <span class="label is-size-7">Neutral</span>
              <labeled-tags :tags="eventTagsNeutral"
                            label-class="is-clickable is-inline-block"
                            @tag-contextmenu="openContextMenu($event.event, 'tags', $event.tag)"/>
            </template>
          </div>
        </div>
      </div>
      <div class="card collapsible-card collapsible-card-arguments mb-3"
           :class="{ collapsed: isArgumentsCollapsed }"
           v-if="Object.keys(event.arguments)?.length">
        <div class="card-content px-0 py-0">
          <div class="media collapsible collapsible-title px-3 py-3 mb-0"
               @click="isArgumentsCollapsed = !isArgumentsCollapsed">
            <div class="media-content">
              <p class="title is-7 is-uppercase">Arguments ({{ Object.keys(event.arguments)?.length }})</p>
            </div>
            <span v-show="isArgumentsCollapsed">
              <i class="fas fa-angle-down"
                 aria-hidden="true"></i>
            </span>
            <span v-show="!isArgumentsCollapsed">
              <i class="fas fa-angle-up"
                 aria-hidden="true"></i>
            </span>
          </div>
          <div class="content collapsible-content px-3 py-3">
            <div v-for="(argumentValue, argumentKey) in event.arguments"
                 :key="argumentKey"
                 :title="`${argumentKey}: ${argumentValue}`"
                 @contextmenu="openContextMenu($event, 'arguments', argumentKey)"
                 class="argument-field is-size-7 is-clickable">
              <div class="width-200px has-text-weight-bold">
                {{ argumentKey }}
              </div>
              <div>
                {{ argumentValue }}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="card collapsible-card collapsible-card-cookies mb-3"
           :class="{ collapsed: isCookiesCollapsed }"
           v-if="Object.keys(event.cookies)?.length">
        <div class="card-content px-0 py-0">
          <div class="media collapsible collapsible-title px-3 py-3 mb-0"
               @click="isCookiesCollapsed = !isCookiesCollapsed">
            <div class="media-content">
              <p class="title is-7 is-uppercase">Cookies ({{ Object.keys(event.cookies)?.length }})</p>
            </div>
            <span v-show="isCookiesCollapsed">
              <i class="fas fa-angle-down"
                 aria-hidden="true"></i>
            </span>
            <span v-show="!isCookiesCollapsed">
              <i class="fas fa-angle-up"
                 aria-hidden="true"></i>
            </span>
          </div>
          <div class="content collapsible-content px-3 py-3">
            <div v-for="(cookieValue, cookieKey) in event.cookies"
                 :key="cookieKey"
                 :title="`${cookieKey}: ${cookieValue}`"
                 @contextmenu="openContextMenu($event, 'cookies', cookieKey)"
                 class="cookie-field is-size-7 is-clickable">
              <div class="width-200px has-text-weight-bold">
                {{ cookieKey }}
              </div>
              <div>
                {{ cookieValue }}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="card collapsible-card collapsible-card-headers mb-3"
           :class="{ collapsed: isHeadersCollapsed }"
           v-if="Object.keys(eventHeaders)?.length > 1">
        <div class="card-content px-0 py-0">
          <div class="media collapsible collapsible-title px-3 py-3 mb-0"
               @click="isHeadersCollapsed = !isHeadersCollapsed">
            <div class="media-content">
              <p class="title is-7 is-uppercase">Headers ({{ Object.keys(eventHeaders).length }})</p>
            </div>
            <span v-show="isHeadersCollapsed">
              <i class="fas fa-angle-down"
                 aria-hidden="true"></i>
            </span>
            <span v-show="!isHeadersCollapsed">
              <i class="fas fa-angle-up"
                 aria-hidden="true"></i>
            </span>
          </div>
          <div class="content collapsible-content px-3 py-3">
            <div v-for="(headerValue, headerKey) in eventHeaders"
                 :key="headerKey"
                 :title="`${headerKey}: ${headerValue}`"
                 @contextmenu="openContextMenu($event, 'headers', headerKey)"
                 class="header-field is-size-7 is-clickable">
              <div class="width-200px has-text-weight-bold">
                {{ headerKey }}
              </div>
              <div>
                {{ headerValue }}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="card collapsible-card collapsible-card-path-parts mb-3"
           :class="{ collapsed: isPathPartsCollapsed }"
           v-if="Object.keys(event.path_parts)?.length > 1">
        <div class="card-content px-0 py-0">
          <div class="media collapsible collapsible-title px-3 py-3 mb-0"
               @click="isPathPartsCollapsed = !isPathPartsCollapsed">
            <div class="media-content">
              <p class="title is-7 is-uppercase">Path Parts ({{ Object.keys(event.path_parts)?.length - 1 }})</p>
            </div>
            <span v-show="isPathPartsCollapsed">
              <i class="fas fa-angle-down"
                 aria-hidden="true"></i>
            </span>
            <span v-show="!isPathPartsCollapsed">
              <i class="fas fa-angle-up"
                 aria-hidden="true"></i>
            </span>
          </div>
          <div class="content collapsible-content px-3 py-3">
            <template v-for="(pathPartValue, pathPartKey) in event.path_parts">
              <div v-if="pathPartKey !== 'path'" :key="pathPartKey"
                   :title="`${pathPartKey}: ${pathPartValue}`"
                   @contextmenu="openContextMenu($event, 'path_parts', pathPartKey)"
                   class="path-part-field is-size-7 is-clickable">
                <div class="width-200px has-text-weight-bold">
                  {{ pathPartKey }}
                </div>
                <div>
                  {{ pathPartValue }}
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
      <div class="card collapsible-card collapsible-card-logs mb-3"
           :class="{ collapsed: isLogsCollapsed }"
           v-if="event.logs?.length">
        <div class="card-content px-0 py-0">
          <div class="media collapsible collapsible-title px-3 py-3 mb-0"
               @click="isLogsCollapsed = !isLogsCollapsed">
            <div class="media-content">
              <p class="title is-7 is-uppercase">Logs ({{ event.logs?.length }})</p>
            </div>
            <span v-show="isLogsCollapsed">
              <i class="fas fa-angle-down"
                 aria-hidden="true"></i>
            </span>
            <span v-show="!isLogsCollapsed">
              <i class="fas fa-angle-up"
                 aria-hidden="true"></i>
            </span>
          </div>
          <div class="content collapsible-content px-3 py-3">
            <div v-for="(logValue, index) in event.logs"
                 :key="index"
                 :title="logValue"
                 class="log-field is-size-7">
              <div>
                {{ logValue }}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="card collapsible-card collapsible-card-proxy mb-3"
           :class="{ collapsed: isUpstreamCollapsed }">
        <div class="card-content px-0 py-0">
          <div class="media collapsible collapsible-title px-3 py-3 mb-0"
               @click="isUpstreamCollapsed = !isUpstreamCollapsed">
            <div class="media-content">
              <p class="title is-7 is-uppercase">Upstream</p>
            </div>
            <span v-show="isUpstreamCollapsed">
              <i class="fas fa-angle-down"
                 aria-hidden="true"></i>
            </span>
            <span v-show="!isUpstreamCollapsed">
              <i class="fas fa-angle-up"
                 aria-hidden="true"></i>
            </span>
          </div>
          <div class="content collapsible-content px-3 py-3">
            <div v-if="event.proxy?.upstream_addr"
                 :title="`upstream_addr: ${event.proxy.upstream_addr}`"
                 @contextmenu="openContextMenu($event, 'proxy', 'upstream_addr')"
                 class="cookie-field is-size-7 is-clickable">
              <div class="width-200px has-text-weight-bold">
                Upstream Address
              </div>
              <div>
                {{ event.proxy.upstream_addr }}
              </div>
            </div>
            <div v-if="event.proxy?.upstream_status"
                 :title="`upstream_status: ${event.proxy.upstream_status}`"
                 @contextmenu="openContextMenu($event, 'proxy', 'upstream_status')"
                 class="cookie-field is-size-7 is-clickable">
              <div class="width-200px has-text-weight-bold">
                Upstream Status
              </div>
              <div class="status-box-wrapper width-50px">
                <span class="status-box px-2 my-1"
                      :style="`background: ${getStatusColor(event.response_code?.toString())}`">
                  {{ event.proxy.upstream_status }}
                </span>
              </div>
            </div>
            <div v-if="event.proxy?.upstream_response_time"
                 :title="`upstream_response_time: ${event.proxy.upstream_response_time * 1000}`"
                 @contextmenu="openContextMenu($event, 'proxy', 'upstream_response_time')"
                 class="cookie-field is-size-7 is-clickable">
              <div class="width-200px has-text-weight-bold">
                Upstream Response Time
              </div>
              <div>
                {{ event.proxy.upstream_response_time * 1000 }} ms
              </div>
            </div>
            <div v-if="event.proxy?.request_time"
                 :title="`request_time: ${event.proxy.request_time * 1000}`"
                 @contextmenu="openContextMenu($event, 'proxy', 'request_time')"
                 class="cookie-field is-size-7 is-clickable">
              <div class="width-200px has-text-weight-bold">
                Request Time
              </div>
              <div>
                {{ event.proxy.request_time * 1000 }} ms
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="context-menu width-180px"
         role="menubar"
         tabindex="-1"
         ref="contextMenu"
         @focusout="closeContextMenu"
         v-if="contextMenuVisible"
         :style="{'top': contextMenuTop, 'left': contextMenuLeft}">
      <div class="context-content py-0">
        <button class="button is-size-7 is-fullwidth context-menu-item"
                title="Copy request as curl"
                @mousedown="contextMenuCopyAsCurl()">
          <span class="icon is-small">
            <i class="fas fa-terminal"></i>
          </span>
          <span>
            Copy Request As curl
          </span>
        </button>
        <hr class="context-menu-divider my-0">
        <button class="button is-size-7 is-fullwidth context-menu-item"
                title="Copy request as JSON"
                @mousedown="contextMenuCopyAsJSON()">
          <span class="icon is-small">
            <i class="fas fa-file-code"></i>
          </span>
          <span>
            Copy Request As JSON
          </span>
        </button>
        <hr class="context-menu-divider my-0">
        <button class="button is-size-7 is-fullwidth context-menu-item"
                title="copy value to clipboard"
                @mousedown="contextMenuCopyToClipboard()">
          <span class="icon is-small">
            <i class="fas fa-copy"></i>
          </span>
          <span>
            Copy Value To Clipboard
          </span>
        </button>
        <hr class="context-menu-divider my-0">
        <button class="button is-size-7 is-fullwidth context-menu-item"
                title="Show matching"
                @mousedown="contextMenuAddToFilter()">
          <span class="icon is-small">
            <i class="fas fa-filter"></i>
          </span>
          <span>
            Show Matching
          </span>
        </button>
        <hr class="context-menu-divider my-0">
        <button class="button is-size-7 is-fullwidth context-menu-item"
                title="Hide matching"
                @mousedown="contextMenuAddToFilter(true)">
          <span class="icon is-small">
            <i class="fas fa-filter"></i>
          </span>
          <span>
            Hide Matching
          </span>
        </button>
        <template v-if="addToSummaryVisible">
          <hr class="context-menu-divider my-0">
          <button class="button is-size-7 is-fullwidth context-menu-item"
                  :title="`${addToSummaryEqualsContextMenu ? 'Remove from' : 'Add to'} summary`"
                  @mousedown="contextMenuAddToSummary()">
            <span class="icon is-small">
              <i class="fas fa-level-up-alt"></i>
            </span>
            <span>
              {{ `${addToSummaryEqualsContextMenu ? 'Remove From' : 'Add To'} Summary` }}
            </span>
          </button>
        </template>
        <template v-if="!Array.isArray(event[contextMenuProperty])">
          <hr class="context-menu-divider my-0">
          <button class="button is-size-7 is-fullwidth context-menu-item"
                  :title="`${contextMenuProperty === groupProperty ? 'Ungroup' : 'Group'} events by value`"
                  @mousedown="contextMenuGroupBy()">
            <span class="icon is-small">
              <i class="fas fa-object-group"></i>
            </span>
            <span>
              {{ `${contextMenuProperty === groupProperty ? 'Ungroup' : 'Group'} Events By Value` }}
            </span>
          </button>
        </template>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent, nextTick, PropType} from 'vue'
import {EventLog, TagsNamespaceValue} from '@/types'
import _ from 'lodash'
import {STATUS_COLORS} from '@/types/const'
import packageJson from '../../package.json'
import LabeledTags from '@/components/LabeledTags.vue'
import Utils from '@/assets/Utils'


export default defineComponent({

  name: 'EventsLogRow',
  components: {LabeledTags},
  props: {
    event: Object as PropType<EventLog>,
    eventIndex: Number,
    addToSummaryProperty: String as PropType<keyof EventLog>,
    addToSummaryInnerIdentifier: String,
    groupHeader: Boolean,
    groupLength: Number,
    groupProperty: String,
    tagCategories: {
      type: Object as PropType<TagsNamespaceValue>,
      default: () => (null as TagsNamespaceValue),
    },
  },
  data() {
    return {
      // Full Details
      eventFullDetails: false,
      isSessionIDsCollapsed: false,
      isArgumentsCollapsed: false,
      isCookiesCollapsed: false,
      isHeadersCollapsed: false,
      isTagsCollapsed: false,
      isPathPartsCollapsed: false,
      isLogsCollapsed: false,
      isUpstreamCollapsed: false,

      // Context Menu
      contextMenuVisible: false,
      contextMenuProperty: null as keyof EventLog,
      contextMenuInnerIdentifier: null as string,
      contextMenuTop: '0px',
      contextMenuLeft: '0px',
    }
  },
  emits: ['toggle-show-full-group', 'add-filter', 'add-to-summary', 'group-by'],
  watch: {
    event: {
      handler: function(val: EventLog, oldVal: EventLog) {
        if (val && !_.isEqual(val, oldVal)) {
          val.tags.sort()
          // Collapsible cards
          if (!Object.keys(val.arguments)?.length) {
            this.isArgumentsCollapsed = true
          }
          if (!Object.keys(val.cookies)?.length) {
            this.isCookiesCollapsed = true
          }
          if (!Object.keys(val.headers)?.length) {
            this.isHeadersCollapsed = true
          }
          if (!val.tags?.length) {
            this.isTagsCollapsed = true
          }
          if (Object.keys(val.path_parts)?.length <= 1) {
            this.isPathPartsCollapsed = true
          }
          if (!val.logs?.length) {
            this.isLogsCollapsed = true
          }
        }
      },
      immediate: true,
      deep: true,
    },
  },
  computed: {
    dotTitle(): string {
      if (this.isEventReport) {
        return 'Report'
      }
      return this.event.reason ? 'Blocked' : 'Passed'
    },

    isEventReport(): boolean {
      const triggers = _.sum([
        this.event.acl_triggers?.length,
        this.event.content_filter_triggers?.length,
        this.event.global_filter_triggers?.length,
        this.event.rate_limit_triggers?.length,
      ])
      return !this.event.reason && triggers > 0
    },

    addToSummaryDisplay(): string {
      let displayValue = ''
      if (this.addToSummaryProperty) {
        let operand: any
        let operator: string = this.addToSummaryProperty
        if (!_.isNil(this.addToSummaryInnerIdentifier)) {
          const propertyValue: any = this.event[this.addToSummaryProperty]
          if (this.addToSummaryProperty === 'tags') {
            operand = propertyValue.join(', ')
          } else {
            operand = propertyValue[this.addToSummaryInnerIdentifier]
            operator = `${this.addToSummaryProperty}_${this.addToSummaryInnerIdentifier}`
          }
        } else {
          operand = this.event[this.addToSummaryProperty]
        }
        displayValue = `${operator}: ${operand}`
      }
      return displayValue
    },

    addToSummaryEqualsContextMenu(): boolean {
      return this.contextMenuProperty === this.addToSummaryProperty &&
          this.contextMenuInnerIdentifier === this.addToSummaryInnerIdentifier
    },

    addToSummaryVisible(): boolean {
      const hiddenProperties: string[] = [
        'ip',
        'response_code',
        'method',
        'authority',
        'uri',
        'curiesession',
      ]
      const hiddenHeaders: string[] = [
        'x-forwarded-port',
        'x-forwarded-proto',
      ]
      return !hiddenProperties.includes(this.contextMenuProperty) ||
          (this.contextMenuProperty === 'headers' && !hiddenHeaders.includes(this.contextMenuInnerIdentifier))
    },

    eventUserAgent(): string {
      const userAgentHeader = _.find(this.event.headers, (header, key) => {
        return key === `user-agent`
      })
      return userAgentHeader || ''
    },

    eventHeaders(): EventLog['headers'] {
      const hiddenHeaders: string[] = [
        'host',
        'user-agent',
        'x-forwarded-port',
        'x-forwarded-proto',
      ]
      return _.pickBy(this.event.headers, (headerValue, headerKey) => {
        return !hiddenHeaders.includes(headerKey)
      })
    },

    eventTime(): string {
      const splitTimestamp = this.event.timestamp.split('.')
      splitTimestamp[1] = splitTimestamp[1].slice(0, 3)
      return splitTimestamp.join('.')
    },

    eventLatency(): number {
      // Latency = request time - upstream response time
      let latency = (Number(this.event.proxy?.request_time) - Number(this.event.proxy?.upstream_response_time))
      // * 1000 to change seconds into milliseconds
      latency = latency * 1000
      // Math floor to remove high decimal accuracy when dealing with milliseconds
      latency = Math.floor(latency)
      if (_.isFinite(latency)) {
        return latency
      }
      return 0
    },

    eventTagsLegitimate(): string[] {
      return _.filter(this.event.tags, (tag: string) => {
        return this.tagCategories?.legitimate?.includes(tag)
      })
    },

    eventTagsMalicious(): string[] {
      return _.filter(this.event.tags, (tag: string) => {
        return this.tagCategories?.malicious?.includes(tag)
      })
    },

    eventTagsNeutral(): string[] {
      // Includes anything no in `legitimate` or `malicious`
      return _.filter(this.event.tags, (tag: string) => {
        const knownTags = _.union(
            this.tagCategories?.legitimate,
            this.tagCategories?.malicious,
        )
        return !knownTags?.includes(tag)
      })
    },
  },
  methods: {
    toggleShowFullDetails() {
      this.eventFullDetails = !this.eventFullDetails
    },

    emitToggleShowFullGroup() {
      this.$emit('toggle-show-full-group')
    },

    getStatusColor(status: string) {
      for (const [key, value] of Object.entries(STATUS_COLORS)) {
        if (status?.startsWith(key)) {
          return value
        }
      }
      return `#000`
    },

    amountSuffixFormatterBytes(value: number) {
      return Utils.amountSuffixFormatterBytes(value)
    },

    setContextMenu(top: number, left: number) {
      const largestHeight = window.innerHeight - this.$refs.contextMenu.offsetHeight - 25
      const largestWidth = window.innerWidth - this.$refs.contextMenu.offsetWidth - 25
      if (top > largestHeight) {
        top = largestHeight
      }
      if (left > largestWidth) {
        left = largestWidth
      }
      this.contextMenuTop = top + 'px'
      this.contextMenuLeft = left + 'px'
    },

    closeContextMenu() {
      this.contextMenuVisible = false
      this.contextMenuProperty = null
      this.contextMenuInnerIdentifier = null
      document.getElementsByClassName('has-overflow-y-auto')[0].removeEventListener('scroll', this.closeContextMenu)
    },

    openContextMenu(event: PointerEvent, property: keyof EventLog, innerIdentifier?: string) {
      this.contextMenuVisible = true
      this.contextMenuProperty = property
      this.contextMenuInnerIdentifier = innerIdentifier
      nextTick(() => {
        this.$refs.contextMenu.focus()
        this.setContextMenu(event.y, event.x)
      })
      document.getElementsByClassName('has-overflow-y-auto')[0].addEventListener('scroll', this.closeContextMenu)
      event.preventDefault()
    },

    contextMenuCopyAsCurl() {
      let value = `curl`
      value += ` -X '${this.event.method}'`
      value += ` '${this.event.authority}${this.event.uri}'`
      const argumentsPairs = _.toPairs(this.event.arguments)
      _.forEach(argumentsPairs, (pair, index) => {
        value += index ? '?' : '&'
        value += `${pair[0]}=${pair[1]}`
      })
      _.forEach(this.event.headers, (headerValue, headerKey) => {
        value += ` -H '${headerKey}: ${headerValue}'`
      })
      _.forEach(this.event.cookies, (cookieValue, cookieKey) => {
        value += ` -H 'Cookie: ${cookieKey}=${cookieValue}'`
      })
      value += ` -H 'curl-generated-by-reblaze: ${packageJson.version}'`
      navigator.clipboard.writeText(value)
      this.closeContextMenu()
    },

    contextMenuCopyAsJSON() {
      navigator.clipboard.writeText(JSON.stringify(this.event))
      this.closeContextMenu()
    },

    contextMenuCopyToClipboard() {
      let value: any
      if (this.contextMenuInnerIdentifier) {
        if (this.contextMenuProperty === 'tags') {
          value = this.contextMenuInnerIdentifier
        } else {
          const propertyValue: any = this.event[this.contextMenuProperty]
          value = propertyValue[this.contextMenuInnerIdentifier]
        }
      } else {
        value = this.event[this.contextMenuProperty]
      }
      navigator.clipboard.writeText(value)
      this.closeContextMenu()
    },

    contextMenuAddToFilter(isNegative?: boolean) {
      let operand: any
      let operator: string = this.contextMenuProperty
      if (!_.isNil(this.contextMenuInnerIdentifier)) {
        if (this.contextMenuProperty === 'tags') {
          operand = this.contextMenuInnerIdentifier
        } else {
          operator = `${this.contextMenuProperty}_${this.contextMenuInnerIdentifier}`
          const propertyValue: any = this.event[this.contextMenuProperty]
          operand = propertyValue[this.contextMenuInnerIdentifier]
        }
      } else {
        operand = this.event[this.contextMenuProperty]
      }
      if (isNegative) {
        operand = `!${operand}`
      }
      const filterString = `${operator}:${operand}`
      this.$emit('add-filter', filterString)
      this.closeContextMenu()
    },

    contextMenuAddToSummary() {
      this.$emit('add-to-summary', {
        property: this.contextMenuProperty,
        innerIdentifier: this.contextMenuInnerIdentifier,
      })
    },

    contextMenuGroupBy() {
      this.$emit('group-by', {
        property: this.contextMenuProperty,
        innerIdentifier: this.contextMenuInnerIdentifier,
      })
      this.closeContextMenu()
    },
  },
})
</script>
<style scoped
       lang="scss">
@import '../assets/styles/colors';

$event-row-box-horizontal-padding: 1rem;

.event-row-box {
  padding: 0 $event-row-box-horizontal-padding;
}

.event-row-summary {
  background-color: $color-white;
  border: 1px solid $color-white;
  border-bottom: 1px solid $color-nobel;
  border-radius: 6px;
  height: 4rem;
  line-height: 2rem;
  margin-left: - $event-row-box-horizontal-padding;
  margin-right: - $event-row-box-horizontal-padding;
  padding-left: $event-row-box-horizontal-padding;
  padding-right: $event-row-box-horizontal-padding;
  position: sticky;
  top: 150px; // Height of filter wrapper
  width: calc(100% + 2rem);
  z-index: 10;
}

.event-row-summary-open {
  border: 1px solid $color-nobel;
}

.event-row-summary-columns {
  height: 2rem;
  margin: 0;
}

.event-row-summary-columns > .column {
  margin: 0;
  padding: 0 0.25rem;
}

.dot {
  margin-left: -0.5rem;
  margin-top: 1.75rem;
}

.dot-passed {
  background-color: $color-emerald;
}

.dot-report {
  background-color: $color-mustard;
}

.dot-blocked {
  background-color: $color-radical-red;
}

.status-box-wrapper {
  position: relative;
}

.status-box {
  border-radius: 2px;
  color: $color-white;
  line-height: 1rem;
  position: absolute;
  text-align: center;
}

.full-details-box {
  word-break: break-all;
}

.full-details-box:hover {
  outline: 1px solid $color-nobel;
}

.reason-box,
.reason-box:hover {
  outline: 1px solid $color-radical-red;
}

.collapsible-card-arguments,
.collapsible-card-cookies,
.collapsible-card-headers {
  border-radius: 6px;
  box-shadow: 0 0.5em 1em -0.125em rgb(10 10 10 / 10%), 0 0 0 1px rgb(10 10 10 / 2%);
}

.collapsible-title {
  line-height: 0.75rem;
}

.argument-field,
.cookie-field,
.header-field,
.log-field,
.path-part-field {
  display: flex;
  min-height: 1.5rem;
  word-break: break-all;
}

.context-menu {
  background: $color-white;
  border: 1px solid $color-boulder;
  display: block;
  list-style: none;
  margin: 0;
  padding: 0;
  position: fixed;
  z-index: 100;
}

.context-menu:focus-visible {
  outline: none;
}

.context-menu-item {
  background: transparent;
  border-color: transparent;
  color: initial;
  justify-content: left;
}

.context-menu-item:hover {
  background: $color-black-haze;
}
</style>
