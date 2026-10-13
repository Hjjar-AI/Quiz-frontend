<!-- frontend/src/components/charts/ChartCard.vue -->
<template>
  <BaseCard class="chart-card">
    <div class="chart-card__header">
      <h4 class="chart-card__title">{{ title }}</h4>
      <BaseIconButton
        v-if="allowExport"
        class="no-print"
        icon="bi bi-download"
        :label="t('ui.exportAsPng')"
        @click="exportImage"
      />
    </div>
    <div class="chart-card__body">
      <canvas ref="chartCanvas" :width="width" :height="height" role="img" :aria-label="title"></canvas>
    </div>
    <details class="accessible-data">
      <summary>{{ t('a11y.chartData') }}</summary>
      <BaseTableShell :aria-label="title">
        <table>
          <caption>{{ title }}</caption>
          <thead><tr>
            <th scope="col">{{ t('a11y.chartLabel') }}</th>
            <th v-for="(dataset, index) in data.datasets || []" :key="index" scope="col">
              {{ dataset.label || t('a11y.chartSeries', { number: formatNumber(index + 1) }) }}
            </th>
          </tr></thead>
          <tbody><tr v-for="row in dataRows" :key="row.index">
            <th scope="row" dir="auto">{{ row.label }}</th>
            <td v-for="(value, index) in row.values" :key="index" dir="auto">{{ formatValue(value) }}</td>
          </tr></tbody>
        </table>
      </BaseTableShell>
    </details>
  </BaseCard>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import Chart from 'chart.js/auto'
import BaseTableShell from '@/components/common/BaseTableShell.vue'
import { useMediaQuery } from '@/composables/useMediaQuery'
import { useLocaleFormatters } from '@/i18n/helpers/format'
import { useTheme } from '@/composables/useTheme'
import { useNotify } from '@/composables/useNotify'
import { useChartPalette } from '@/composables/useChartPalette'
import { getChartPalette } from '@/utils/chartPalette'
import { downloadUrl } from '@/utils/downloadFile'
import BaseIconButton from '@/components/base/BaseIconButton.vue'

const { t } = useI18n()
const { formatNumber } = useLocaleFormatters()
const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')

const props = defineProps({
  title: { type: String, required: true },
  type: {
    type: String,
    default: 'bar',
    validator: (v) => ['bar', 'line', 'pie', 'doughnut'].includes(v),
  },
  data: { type: Object, required: true },
  options: { type: Object, default: () => ({}) },
  width: { type: Number, default: 600 },
  height: { type: Number, default: 300 },
  allowExport: { type: Boolean, default: true },
})

const dataRows = computed(() => {
  const datasets = props.data.datasets || []
  const count = Math.max(props.data.labels?.length || 0, ...datasets.map(dataset => dataset.data?.length || 0))
  return Array.from({ length: count }, (_, index) => ({
    index,
    label: props.data.labels?.[index] ?? formatNumber(index + 1),
    values: datasets.map(dataset => dataset.data?.[index]),
  }))
})

function formatValue(value) {
  if (value == null) return '—'
  if (Array.isArray(value)) return value.map(formatValue).join(' – ')
  if (typeof value === 'object') return Object.entries(value).map(([key, item]) => `${key}: ${formatValue(item)}`).join(', ')
  if (typeof value !== 'number' || !Number.isFinite(value)) return String(value)
  const [coefficient, exponent = '0'] = String(value).toLowerCase().split('e')
  const decimals = Math.max(0, (coefficient.split('.')[1]?.length || 0) - Number(exponent))
  return formatNumber(value, Math.min(20, decimals))
}

const chartCanvas = ref(null)
const { currentTheme } = useTheme()
const { notify } = useNotify()
const { palette, refreshPalette } = useChartPalette()

let chartInstance = null
let observer = null
const isVisible = ref(false)
const pointStyles = ['circle', 'rect', 'triangle', 'rectRot', 'crossRot', 'star']
const lineDashes = [[], [8, 4], [3, 3], [10, 3, 2, 3], [2, 4], [12, 4]]

function mergeChartOptions(base, override) {
  const out = { ...base, ...override }

  if (base.plugins || override.plugins) {
    const bPlugins = base.plugins || {}
    const oPlugins = override.plugins || {}
    const bLegend = bPlugins.legend || {}
    const oLegend = oPlugins.legend || {}
    out.plugins = {
      ...bPlugins,
      ...oPlugins,
      legend: {
        ...bLegend,
        ...oLegend,
        labels: {
          ...(bLegend.labels || {}),
          ...(oLegend.labels || {}),
        },
      },
    }
  }

  if (base.scales || override.scales) {
    const bScales = base.scales || {}
    const oScales = override.scales || {}
    const axes = new Set([...Object.keys(bScales), ...Object.keys(oScales)])
    const mergedScales = { ...bScales }
    for (const axis of axes) {
      const bAxis = bScales[axis] || {}
      const oAxis = oScales[axis] || {}
      mergedScales[axis] = {
        ...bAxis,
        ...oAxis,
        ticks: {
          ...(bAxis.ticks || {}),
          ...(oAxis.ticks || {}),
        },
      }
    }
    out.scales = mergedScales
  }

  return out
}

function renderChart() {
  if (!chartCanvas.value) return

  if (chartInstance) {
    chartInstance.destroy()
    chartInstance = null
  }

  const ctx = chartCanvas.value.getContext('2d')

  // Deep-clone the data so Chart.js mutations don't leak back to the
  // caller. structuredClone is preferred; JSON fallback for older
  // environments.
  let chartData
  try {
    chartData = structuredClone(props.data)
  } catch {
    chartData = JSON.parse(JSON.stringify(props.data))
  }

  if (chartData.datasets) {
    chartData.datasets.forEach((ds, i) => {
      const color = palette.value[i % palette.value.length]
      if (!ds.backgroundColor) {
        ds.backgroundColor =
          props.type === 'pie' || props.type === 'doughnut'
            ? (ds.data || []).map((_, index) => palette.value[index % palette.value.length])
            : color
      }
      if (!ds.borderColor) ds.borderColor = color
      if (!ds.pointStyle) ds.pointStyle = pointStyles[i % pointStyles.length]
      if (props.type === 'line' && !ds.borderDash) {
        ds.borderDash = lineDashes[i % lineDashes.length]
      }
    })
  }

  const tokens = getChartPalette()
  const textColor = tokens.text || tokens.primary
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: textColor,
          usePointStyle: true,
        },
      },
    },
    scales:
      props.type === 'bar' || props.type === 'line'
        ? {
            x: { ticks: { color: textColor } },
            y: { ticks: { color: textColor } },
          }
        : undefined,
  }

  const mergedOptions = mergeChartOptions(defaultOptions, props.options)
  if (reducedMotion.value) mergedOptions.animation = false

  chartInstance = new Chart(ctx, {
    type: props.type,
    data: chartData,
    options: mergedOptions,
  })
}

function exportImage() {
  if (!chartCanvas.value) return
  downloadUrl(chartCanvas.value.toDataURL('image/png'), `${props.title.replace(/\s+/g, '_')}.png`)
  notify(t('notifications.chartExported'), 'success')
}

function prepareForPrint() {
  // A chart below the viewport may not have crossed the lazy-render
  // observer yet. Render it synchronously before the browser captures
  // the print preview, then let Chart.js fit the print-sized container.
  refreshPalette()
  renderChart()
  chartInstance?.resize()
}

function restoreAfterPrint() {
  refreshPalette()
  if (isVisible.value) nextTick(renderChart)
}

watch([currentTheme, reducedMotion], () => {
  refreshPalette()
  if (isVisible.value) {
    nextTick(renderChart)
  }
})

watch(
  () => props.data,
  () => {
    if (isVisible.value) {
      nextTick(renderChart)
    }
  },
  { deep: true },
)

onMounted(() => {
  window.addEventListener('beforeprint', prepareForPrint)
  window.addEventListener('afterprint', restoreAfterPrint)

  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          isVisible.value = true
          nextTick(renderChart)
          observer.disconnect()
        }
      }
    },
    { threshold: 0.1 },
  )

  if (chartCanvas.value) {
    observer.observe(chartCanvas.value)
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('beforeprint', prepareForPrint)
  window.removeEventListener('afterprint', restoreAfterPrint)

  if (observer) {
    observer.disconnect()
    observer = null
  }
  if (chartInstance) {
    chartInstance.destroy()
    chartInstance = null
  }
})
</script>
