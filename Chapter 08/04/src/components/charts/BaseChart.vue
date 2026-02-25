<template>
  <div class="chart-container" :style="{ height: height }">
    <div v-if="loading" class="chart-loading">
      <div class="spinner"></div>
      <span>Loading chart data...</span>
    </div>
    <div v-else-if="error" class="chart-error">
      <span>{{ error }}</span>
      <button @click="$emit('retry')" class="retry-btn">Retry</button>
    </div>
    <component 
      v-else
      :is="chartComponent"
      :data="data"
      :options="mergedOptions"
      :plugins="plugins"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useThemeStore } from '../../stores/themeStore'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  ArcElement,
  RadialLinearScale
} from 'chart.js'
import { Bar, Line, Pie, Doughnut, PolarArea, Radar } from 'vue-chartjs'


ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  ArcElement,
  RadialLinearScale
)

const props = defineProps({
  type: {
    type: String,
    required: true,
    validator: (value) => ['line', 'bar', 'pie', 'doughnut', 'radar', 'polarArea'].includes(value)
  },
  data: {
    type: Object,
    required: true
  },
  options: {
    type: Object,
    default: () => ({})
  },
  plugins: {
    type: Array,
    default: () => []
  },
  height: {
    type: String,
    default: '300px'
  },
  loading: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['retry'])

const themeStore = useThemeStore()


const chartComponent = computed(() => {
  const componentMap = {
    'bar': Bar,
    'line': Line,
    'pie': Pie,
    'doughnut': Doughnut,
    'radar': Radar,
    'polarArea': PolarArea
  }
  return componentMap[props.type]
})


const defaultOptions = computed(() => {
  const isDark = themeStore.isDark

  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: isDark ? 'rgba(255, 255, 255, 0.85)' : 'rgba(33, 37, 41, 0.85)',
          font: {
            family: "'Inter', sans-serif",
            size: 11
          },
          padding: 12,
          usePointStyle: true,
          pointStyle: 'circle'
        },
        position: 'top'
      },
      tooltip: {
        backgroundColor: isDark ? 'rgba(20, 20, 20, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        titleColor: isDark ? '#fff' : '#212529',
        bodyColor: isDark ? 'rgba(255, 255, 255, 0.9)' : 'rgba(33, 37, 41, 0.9)',
        borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 6,
        titleFont: {
          family: "'Inter', sans-serif",
          size: 13,
          weight: 'bold'
        },
        bodyFont: {
          family: "'Inter', sans-serif",
          size: 12
        },
        displayColors: true,
        boxPadding: 4
      }
    },
    scales: props.type !== 'pie' && props.type !== 'doughnut' && props.type !== 'polarArea' ? {
      x: {
        grid: {
          color: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)',
          drawBorder: false
        },
        ticks: {
          color: isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(33, 37, 41, 0.8)',
          font: {
            family: "'Inter', sans-serif",
            size: 10
          },
          padding: 6,
          maxRotation: 0
        }
      },
      y: {
        grid: {
          color: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)',
          drawBorder: false
        },
        ticks: {
          color: isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(33, 37, 41, 0.8)',
          font: {
            family: "'Inter', sans-serif",
            size: 10
          },
          padding: 6
        },
        beginAtZero: true
      }
    } : {}
  }
})


const mergedOptions = computed(() => ({
  ...defaultOptions.value,
  ...props.options
}))
</script>

<style scoped>
.chart-container {
  position: relative;
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
}

.chart-loading, .chart-error {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: var(--shadow-light);
  backdrop-filter: blur(2px);
  color: var(--text-secondary);
  z-index: 10;
}

.spinner {
  width: 36px;
  height: 36px;
  border: 3px solid var(--border-light);
  border-radius: 50%;
  border-top-color: var(--accent-color);
  animation: spin 1s ease-in-out infinite;
  margin-bottom: 12px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.retry-btn {
  margin-top: 12px;
  padding: 8px 16px;
  background: var(--accent-color);
  color: var(--primary-bg);
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s, transform 0.1s;
}

.retry-btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.retry-btn:active {
  transform: translateY(1px);
}
</style>




