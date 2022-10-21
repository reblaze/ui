<template>
  <div class="chart-wrapper"
       ref="chartWrapper">
    <div v-show="chart">
      <div ref="chart">
      </div>
    </div>
    <div v-if="!chart">
      <div class="loader is-loading"></div>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent, PropType} from 'vue'
import _ from 'lodash'
import uPlot, {Series} from 'uplot'
import {GenericObject} from '@/types'
import Utils from '@/assets/Utils'

export type SeriesOptions = {
  title: string
  fieldName: string
  show: boolean
  drawStyle: 'line' | 'bars'
  strokeColor: Series.Stroke
  fillColor?: Series.Fill
}

export default defineComponent({
  name: 'RbzChart',
  props: {
    data: Array as PropType<GenericObject[]>,
    seriesOptions: Array as PropType<SeriesOptions[]>,
    legendAsTooltip: Boolean,
    chartHeight: Number,
  },
  data() {
    return {
      chart: null,
      chartOptions: null as uPlot.Options,
    }
  },
  watch: {
    data: {
      handler: function(val, oldVal) {
        if (!val && !oldVal) {
          return
        }
        this.redrawChart()
      },
      deep: true,
    },
    seriesOptions: {
      handler: function(val, oldVal) {
        if (!val && !oldVal) {
          return
        }
        this.redrawChart()
      },
      deep: true,
    },
    chartHeight: {
      handler: function() {
        this.setChartSize()
      },
    },
  },
  methods: {
    redrawChart() {
      const datasets: [
        xValues: number[],
        ...yValues: ((number | null | undefined)[])[],
      ] = [[]]
      this.seriesOptions.forEach(() => {
        datasets.push([])
      })
      const sortedData = _.sortBy(this.data, 'timeframe')
      // uPlot is displaying time in local, so we need to offset our timeframe by the timezone offset
      const date = new Date(0)
      date.setUTCSeconds(sortedData[0]?.timeframe)
      const timezoneOffset = date.getTimezoneOffset() * 60
      sortedData.forEach((dataItem) => {
        datasets[0].push(dataItem.timeframe + timezoneOffset) // timestamps X axis
        datasets.forEach((dataset, index) => {
          if (index !== 0) { // timestamps X axis
            dataset.push(dataItem[this.seriesOptions[index - 1].fieldName])
          }
        })
      })
      this.chartOptions = {
        class: 'chart',
        width: 0,
        height: 0,
        plugins: [],
        series: [
          {}, // timestamps X axis
        ],
        axes: [
          {},
          {
            values: (self, splits) => splits.map((value) => {
              return value == null ? null : this.amountSuffixFormatter(value)
            }),
          },
        ],
      }
      this.seriesOptions.forEach((seriesOptions) => {
        this.chartOptions.series.push({
          show: seriesOptions.show,
          spanGaps: true,
          label: seriesOptions.title,
          stroke: seriesOptions.strokeColor,
          width: 0.4,
          fill: seriesOptions.fillColor,
          dash: [10, 5],
          paths: this.paths as Series.PathBuilder,
        })
      })
      if (this.legendAsTooltip) {
        this.chartOptions.plugins.push(this.legendAsTooltipPlugin({
          classList: ['legend-tooltip'],
        }))
      }
      if (this.chart) {
        this.chart.destroy()
      }
      // eslint-disable-next-line new-cap
      this.chart = new uPlot(this.chartOptions, datasets, this.$refs.chart)
      this.setChartSize()
    },

    // converts the legend into a simple tooltip
    legendAsTooltipPlugin({classList = [], style = {}} = {}) {
      let legendElement: HTMLElement

      const init = (uPlotChart: uPlot) => {
        legendElement = uPlotChart.root.querySelector('.u-legend')
        legendElement.classList.remove('u-inline')
        classList && legendElement.classList.add(...classList)

        uPlot.assign(legendElement.style, {
          display: 'none',
          ...style,
          ...{backgroundColor: 'rgba(255, 250, 195, 0.85)', color: 'black'},
        })

        // better the color series color markers
        const idents: NodeListOf<HTMLElement> = legendElement.querySelectorAll('.u-marker')
        idents.forEach((ident) => {
          ident.style.backgroundColor = ident.style.borderColor
        })

        const overElement: HTMLDivElement = uPlotChart.over
        overElement.style.overflow = 'visible'

        // move legend into plot bounds
        overElement.appendChild(legendElement)

        // show/hide tooltip on enter/exit. A style declaration is reset by setting it to null
        overElement.addEventListener('mouseenter', () => {
          legendElement.style.display = null
        })
        overElement.addEventListener('mouseleave', () => {
          legendElement.style.display = 'none'
        })
      }

      const update = (uPlotChart: uPlot) => {
        const {left, top} = uPlotChart.cursor
        legendElement.style.transform = `translate(${left}px, ${top}px)`
      }

      return {
        hooks: {
          init,
          setCursor: update,
        },
      }
    },

    paths(uPlotChart: uPlot, seriesIdx: number, idx0: number, idx1: number) {
      const {linear, bars} = uPlot.paths
      const style = this.seriesOptions[seriesIdx - 1].drawStyle
      let renderer
      if (style === 'line') {
        renderer = linear()
      }
      if (style === 'bars') {
        renderer = bars({size: [1, Infinity, 1]})
      }
      return renderer(uPlotChart, seriesIdx, idx0, idx1)
    },

    // Programmatically change the width of the chart based on component width on window resize
    setChartSize() {
      const wrapperElement = this.$refs.chartWrapper
      if (wrapperElement) {
        this.chart.setSize({
          width: wrapperElement.clientWidth,
          height: this.chartHeight,
        })
      }
    },

    amountSuffixFormatter(value: number) {
      return Utils.amountSuffixFormatter(value)
    },
  },
  mounted() {
    window.addEventListener('resize', () => {
      this.setChartSize()
    })
  },
})
</script>
<style scoped
       lang="scss">
.chart-wrapper {
  position: relative;
}

/* uPlot elements */

:deep(.legend-tooltip) {
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.5);
  left: 0;
  pointer-events: none;
  position: absolute;
  text-align: left;
  top: 0;
  width: 230px;
  z-index: 100;
}
</style>
