<template>
  <button
    @click="toggleTheme"
    class="theme-toggle"
    :class="{ 'theme-toggle--light': themeStore.isLight }"
    :aria-label="themeStore.isDark ? 'Switch to light theme' : 'Switch to dark theme'"
    :title="themeStore.isDark ? 'Switch to light theme' : 'Switch to dark theme'"
  >
    <div class="theme-toggle__track">
      <div class="theme-toggle__thumb">
        <i 
          class="theme-toggle__icon"
          :class="themeStore.isDark ? 'fas fa-moon' : 'fas fa-sun'"
        ></i>
      </div>
    </div>
    <span class="theme-toggle__label" v-if="showLabel">
      {{ themeStore.isDark ? 'Dark' : 'Light' }}
    </span>
  </button>
</template>

<script setup>
import { useThemeStore } from '../../stores/themeStore'

defineProps({
  showLabel: {
    type: Boolean,
    default: false
  }
})

const themeStore = useThemeStore()

const toggleTheme = () => {
  themeStore.toggleTheme()
}
</script>

<style scoped>
.theme-toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 8px;
  transition: all 0.3s ease;
  color: var(--text-primary);
}

.theme-toggle:hover {
  background-color: var(--hover-bg);
}

.theme-toggle:focus {
  outline: 2px solid var(--accent-color);
  outline-offset: 2px;
}

.theme-toggle__track {
  position: relative;
  width: 48px;
  height: 24px;
  background-color: var(--tertiary-bg);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  transition: all 0.3s ease;
}

.theme-toggle--light .theme-toggle__track {
  background-color: var(--accent-color);
}

.theme-toggle__thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 18px;
  height: 18px;
  background-color: var(--text-primary);
  border-radius: 50%;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px var(--shadow-light);
}

.theme-toggle--light .theme-toggle__thumb {
  transform: translateX(24px);
  background-color: #ffffff;
}

.theme-toggle__icon {
  font-size: 10px;
  color: var(--primary-bg);
  transition: all 0.3s ease;
}

.theme-toggle--light .theme-toggle__icon {
  color: var(--accent-color);
}

.theme-toggle__label {
  font-size: 0.875rem;
  font-weight: 500;
  user-select: none;
}

/* Compact variant */
.theme-toggle--compact {
  padding: 0.125rem;
}

.theme-toggle--compact .theme-toggle__track {
  width: 36px;
  height: 18px;
  border-radius: 9px;
}

.theme-toggle--compact .theme-toggle__thumb {
  width: 14px;
  height: 14px;
  top: 1px;
  left: 1px;
}

.theme-toggle--compact.theme-toggle--light .theme-toggle__thumb {
  transform: translateX(18px);
}

.theme-toggle--compact .theme-toggle__icon {
  font-size: 8px;
}

/* Animation for theme change */
@keyframes themeChange {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

.theme-toggle:active .theme-toggle__thumb {
  animation: themeChange 0.2s ease;
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .theme-toggle__track {
    border-width: 2px;
  }
  
  .theme-toggle__thumb {
    box-shadow: 0 0 0 2px var(--primary-bg);
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .theme-toggle,
  .theme-toggle__track,
  .theme-toggle__thumb,
  .theme-toggle__icon {
    transition: none;
  }
  
  .theme-toggle:active .theme-toggle__thumb {
    animation: none;
  }
}
</style>
