<template>
   <div class="rate-limit-threshold-wrapper">
        <div v-show="chart">
            <div class="control-panel chart-info">
                <div class="height-30px">
                    <div class="field is-grouped is-pulled-left">
                        <label class="label is-small has-text-centered threshold-input-label">
                            Threshold:
                        </label>
                        <div class="control">
                            <input class="input is-small threshold-input"
                                   title="Rate limit threshold"
                                   type="number"
                                   placeholder="Rate limit threshold"
                                   @keydown="validateNumber"
                                   @change="thresholds.inputUpdated"
                                   v-model="thresholds.input"/>
                        </div>
                        <p class="control">
                            <button class="button is-small update-rate-limit-button"
                                    @click="updateChanges()"
                                    title="Update threshold limit"
                                    :disabled="!inputThresholdValid || localRateLimit.is_template">
                              <span class="icon is-small">
                                <i class="fas fa-level-up-alt"></i>
                              </span>
                            </button>
                        </p>
                    </div>
                </div>
                <div v-if="chartData"
                     class="additional-info-wrapper">
                    <label class="label is-small">
                        Recommended normal threshold: {{!thresholds.recommendedNormal}}.
                        Number of blocked users: {{!chartData.global.outliers_buffer}}
                    </label>
                    <label class="label is-small">
                        Recommended strict threshold: {{!thresholds.recommendedStrict}}.
                        Number of blocked users: {{!chartData.global.outliers}}
                    </label>
                </div>
            </div>
            <div id="chart">
            </div>
        </div>
        <div v-if="!chart && !errors.length">
            <div class="loader is-loading"></div>
        </div>
        <div v-if="errors.length">
            <div v-for="[errorId, errorMsg] in errors" :key="errorId">
                {{! errorMsg }}
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import _ from 'lodash'
import {defineComponent} from 'vue'


const securityAutomation = {
  THRESHOLD_COLOR: {
    recommendedNormal: 'normal',
    recommendedStrict: 'strict',
    selected: 'selected',
  },
  STROKE_COLOR: {
    min: 'min',
    median: 'median',
    max: 'max',
  },
  FILL_COLOR: {
    min: 'min',
    median: 'median',
    max: 'max',
  },
  LEGEND_COLOR: 'beige',
}

export default defineComponent({
  name: 'RateLimitRecommendation',
  props: {
    rateLimit: Object,
    domain: String,
    path: String,
  },
  data() {
    // Stub functions that will be built programmatically later in the code
    const thresholds = {
      recommendedStrict: '',
      recommendedStrictUpdated: () => null as string,
      recommendedNormal: '',
      recommendedNormalUpdated: () => null as string,
      input: '',
      inputUpdated: () => null as string,
    }
    return {
      titles: [],
      chartData: null,
      chart: null,
      chartOptions: null,
      thresholds,
      errors: [],
      horizontalLinePlugin: null,
    }
  },
  computed: {
    localRateLimit() {
      return _.cloneDeep(this.rateLimit)
    },

    inputThresholdValid() {
      return Number(this.thresholds.input) > 0
    },
  },
  watch: {
    chartData: {
      handler: function(val, oldVal) {
        if (!val && !oldVal) {
          return
        }
        if (!val || !val.global || !val.df_stats) {
          this.addError('unknown', 'Error loading the data, please try again later')
          return
        }
        this.clearError('unknown')
        if (!val.global.events || val.global.events < 1000 || !val.df_stats?.length) {
          this.addError('missing-data', 'Insufficient data for results, please try again later')
          return
        }
        this.clearError('missing-data')
        const datasets = [[null], [null], [null], [null], [null], [null]] as
        [[number], [number], [number], [number], [string], [string]]

        const dfStats = _.sortBy(val.df_stats, 'timeframe') as
        [{timeframe: number, min: number, max: number, median: number,
          events: string, outliers: string}]
        // uPlot is displaying time in local, so we need to offset our timeframe by the timezone offset
        const date = new Date(0)
        date.setUTCSeconds(dfStats[0]?.timeframe)
        const timezoneOffset = date.getTimezoneOffset() * 60
        dfStats.forEach((dfStat) => {
          datasets[0].push(dfStat.timeframe + timezoneOffset)
          datasets[1].push(dfStat.min)
          datasets[2].push(dfStat.median)
          datasets[3].push(dfStat.max)
          datasets[4].push(dfStat.events)
          datasets[5].push(dfStat.outliers)
        })
        this.thresholds.recommendedNormal = Math.round(val.global.recommendation_buffer).toString()
        this.thresholds.recommendedStrict = Math.round(val.global.recommendation).toString()
        this.thresholds.input = this.thresholds.recommendedStrict
        this.chartOptions = {
          class: 'chart',
          width: 0,
          height: 0,
          plugins: [
            // this.legendAsTooltipPlugin({
            //   classList: ['legend-tooltip'],
            // }),
            this.horizontalLinePlugin({
              objRef: this.thresholds,
              valueProperty: 'recommendedNormal',
              label: 'Recommended normal threshold',
              lineClassList: ['line-element'],
              labelClassList: ['is-size-7', 'label-element'],
              lineStyle: {backgroundColor: securityAutomation.THRESHOLD_COLOR.recommendedNormal},
              labelStyle: {
                backgroundColor: securityAutomation.THRESHOLD_COLOR.recommendedNormal,
                color: 'black',
              },
              labelLocation: 'top-left',
            }),
            this.horizontalLinePlugin({
              objRef: this.thresholds,
              valueProperty: 'recommendedStrict',
              label: 'Recommended strict threshold',
              lineClassList: ['line-element'],
              labelClassList: ['is-size-7', 'label-element'],
              lineStyle: {backgroundColor: securityAutomation.THRESHOLD_COLOR.recommendedStrict},
              labelStyle: {
                backgroundColor: securityAutomation.THRESHOLD_COLOR.recommendedStrict,
                color: 'black',
              },
              labelLocation: 'bottom-left',
            }),
            this.horizontalLinePlugin({
              objRef: this.thresholds,
              valueProperty: 'input',
              label: 'Selected threshold',
              lineClassList: ['line-element', 'selected-recommendation-line'],
              labelClassList: ['is-size-7', 'label-element', 'selected-recommendation-label'],
              lineStyle: {backgroundColor: securityAutomation.THRESHOLD_COLOR.selected},
              labelStyle: {backgroundColor: securityAutomation.THRESHOLD_COLOR.selected, color: 'black'},
              labelLocation: 'bottom-right',
            }),
          ],
          series: [
            {},
            {
              show: true,
              spanGaps: true,
              label: 'Min',
              stroke: securityAutomation.STROKE_COLOR.min,
              width: 0.4,
              fill: securityAutomation.FILL_COLOR.min,
              dash: [10, 5],
              drawStyle: 0,
              lineInterpolation: null,
              // paths: this.paths,
            },
            {
              show: true,
              spanGaps: true,
              label: 'Median',
              stroke: securityAutomation.STROKE_COLOR.median,
              width: 0.4,
              fill: securityAutomation.FILL_COLOR.median,
              dash: [10, 5],
              drawStyle: 0,
              lineInterpolation: null,
              // paths: this.paths,
            },
            {
              show: true,
              spanGaps: true,
              label: 'Max',
              stroke: securityAutomation.STROKE_COLOR.max,
              width: 0.4,
              fill: securityAutomation.FILL_COLOR.max,
              dash: [10, 5],
              drawStyle: 0,
              lineInterpolation: null,
              // paths: this.paths,
            },
            {
              show: false,
              spanGaps: true,
              label: 'Events',
              stroke: 'rgba(0, 0, 0, 0.6)',
              width: 0.4,
              fill: 'rgba(0, 0, 0, 0.3)',
              dash: [10, 5],
              drawStyle: 0,
              lineInterpolation: null,
              // paths: this.paths,
            },
            {
              show: false,
              spanGaps: true,
              label: 'Outliers',
              stroke: 'rgba(0, 0, 0, 0.6)',
              width: 0.4,
              fill: 'rgba(0, 0, 0, 0.3)',
              dash: [10, 5],
              drawStyle: 0,
              lineInterpolation: null,
              // paths: this.paths,
            },
          ],
        }
        // this.chart = new window.uPlot(this.chartOptions, datasets, document.querySelector('#chart'))
        // this.setChartSize()
      },
      deep: true,
    },
  },
  methods: {

    addError(id: string, msg: string) {
      this.clearError(id)
      this.errors.push([id, msg])
    },

    clearError(id: string) {
      _.remove(this.errors, (error) => {
        return error[0] === id
      })
    },

    // converts the legend into a simple tooltip
    // legendAsTooltipPlugin({
    //   // classList,
    //   // style = {backgroundColor: securityAutomation.LEGEND_COLOR, color: 'black'},
    // }: any) {
    //   let legendElement: any

    //   const init = (uPlotChart:any) => {
    //     legendElement = uPlotChart.root.querySelector('.u-legend') as HTMLElement
    //     legendElement.classList.remove('u-inline')
    //     classList && legendElement.classList.add(...classList)

    //     window.uPlot.assign(legendElement.style, {
    //       display: 'none',
    //       ...style,
    //     })

    //     // hide series color markers
    //     const idents = legendElement.querySelectorAll('.u-marker')
    //     idents.forEach((ident:any) => {
    //       ident.style.display = 'none'
    //     })

    //     const overElement = uPlotChart.over
    //     overElement.style.overflow = 'visible'

    //     // move legend into plot bounds
    //     overElement.appendChild(legendElement)

    //     // show/hide tooltip on enter/exit. A style declaration is reset by setting it to null
    //     overElement.addEventListener('mouseenter', () => {
    //       legendElement.style.display = null
    //     })
    //     overElement.addEventListener('mouseleave', () => {
    //       legendElement.style.display = 'none'
    //     })
    //   }

    //   const update = (uPlotChart:any) => {
    //     const {left, top} = uPlotChart.cursor
    //     legendElement.style.transform = `translate(${left}px, ${top}px)`
    //   }

    //   return {
    //     hooks: {
    //       init,
    //       setCursor: update,
    //     },
    //   }
    // },

    // adds an horizontal line
    // horizontalLinePlugin({
    //   objRef,
    //   valueProperty,
    //   label,
    //   lineClassList,
    //   labelClassList,
    //   lineStyle,
    //   labelStyle,
    //   labelLocation = 'bottom-right',
    // } = {}) {
    //   let overElement, lineElement, labelElement

    //   const init = (uPlotChart) => {
    //     overElement = uPlotChart.over

    //     // Line
    //     lineElement = document.createElement('div')
    //     lineClassList && lineElement.classList.add(...lineClassList)
    //     window.uPlot.assign(lineElement.style, lineStyle)
    //     overElement.appendChild(lineElement)

    //     // Label
    //     labelElement = document.createElement('div')
    //     labelElement.innerText = label
    //     labelClassList && labelElement.classList.add(...labelClassList)
    //     if (labelLocation.includes('left')) {
    //       labelElement.style.left = '0'
    //     } else if (labelLocation.includes('right')) {
    //       labelElement.style.right = '0'
    //     }
    //     window.uPlot.assign(labelElement.style, labelStyle)
    //     overElement.appendChild(labelElement)
    //   }

    //   // const draw = (uPlotChart) => {
    //   //   const borderRadius = '0.75rem'
    //   //   const top = Math.round(uPlotChart.valToPos(objRef[valueProperty], 'y'))
    //   //   // Hide label if outside graph borders. A style declaration is reset by setting it to null
    //   //   if (top <= 0) {
    //   //     lineElement.style.display = 'none'
    //   //     labelElement.style.display = 'none'
    //   //   } else {
    //   //     lineElement.style.display = null
    //   //     labelElement.style.display = null
    //   //   }
    //   //   // Move to correct place
    //   //   lineElement.style.transform = `translateY(${top}px)`
    //   //   if (labelLocation.includes('bottom')) {
    //   //     labelElement.style.transform = `translateY(${top}px)`
    //   //     if (labelLocation.includes('left')) {
    //   //       labelElement.style.borderBottomRightRadius = borderRadius
    //   //     } else if (labelLocation.includes('right')) {
    //   //       labelElement.style.borderBottomLeftRadius = borderRadius
    //   //     }
    //   //   } else if (labelLocation.includes('top')) {
    //   //     labelElement.style.transform = `translateY(${top - labelElement.clientHeight}px)`
    //   //     if (labelLocation.includes('left')) {
    //   //       labelElement.style.borderTopRightRadius = borderRadius
    //   //     } else if (labelLocation.includes('right')) {
    //   //       labelElement.style.borderTopLeftRadius = borderRadius
    //   //     }
    //   //   }
    //   //   objRef[`${valueProperty}Updated`] = () => {
    //   //     draw(uPlotChart)
    //   //   }
    //   // }

    //   return {
    //     hooks: {
    //       init,
    //       draw,
    //     }
    //   }
    // },

    // paths(uPlotChart, seriesIdx, idx0, idx1, extendGap, buildClip) {
    //   const {bars} = window.uPlot.paths
    //   const renderer = bars({size: [1, Infinity, 1]})
    //   return renderer(uPlotChart, seriesIdx, idx0, idx1, extendGap, buildClip)
    // },

    // Programmatically change the width of the chart based on component width on window resize
    setChartSize() {
      const wrapperElement = document.querySelector('#links-to-urls')
      if (wrapperElement) {
        this.chart.setSize({
          width: wrapperElement.clientWidth - 100,
          height: 600,
        })
      }
    },

    // async loadChartData() {
    //   this.chartData = await recommendRateLimitThreshold(this.localRateLimit,
    //     this.domain, this.path)
    //     .then((res:any) => {
    //       this.clearError('connection')
    //       return res
    //     })
    //     .catch(() => {
    //       this.addError('connection', 'Error connecting to the recommendation broker, please try again later')
    //     })
    //   window.addEventListener('resize', () => {
    //     this.setChartSize()
    //   })
    // },

    validateNumber(event:any) {
      const {target, key} = event
      let isInvalid = 'e.-'.includes(key)
      const newVal = `${target.value}${key}`
      if (!isInvalid) {
        isInvalid = (Math.pow(2, 31) - 1) < parseInt(newVal)
      }
      if (!isInvalid) {
        const isNumber = !isNaN(Number(newVal))
        isInvalid = isNumber && !/^([1-9]([0-9]+)?|0)$/.test(newVal)
      }
      if (isInvalid) {
        event.preventDefault()
      }
    },

    updateChanges() {
      this.localRateLimit.limit = this.thresholds.input
      this.$emit('update:rateLimit', this.localRateLimit)
    },
  },

  // async mounted() {
  //   await this.loadChartData()
  // },
})
</script>

<style scoped lang="scss">
.rate-limit-threshold-wrapper {
  margin: 20px 10px;
}

.threshold-input-label {
  margin-right: 10px;
  margin-top: 0.5em;
}

.threshold-input {
  width: 200px;
}

.chart-info {
  margin-bottom: 10px;
}

.additional-info-wrapper {
  margin: 0.5rem 0;
}

/* uPlot elements */

.u-over > .legend-tooltip {
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.5);
  left: 0;
  pointer-events: none;
  position: absolute;
  text-align: left;
  top: 0;
  width: 230px;
  z-index: 100;
}

.line-element {
  height: 1px;
  left: 0;
  pointer-events: none;
  position: absolute;
  top: 0;
  width: 100%;
}

.label-element {
  height: auto;
  padding: 0.1rem 0.5rem;
  pointer-events: none;
  position: absolute;
  top: 0;
  width: auto;
}

</style>
