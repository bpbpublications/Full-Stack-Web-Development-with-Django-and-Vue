<template>
  <button
    @click="toggle"
    :class="[
      'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2',
      modelValue ? 'bg-blue-600' : 'bg-gray-200',
      disabled ? 'opacity-50 cursor-not-allowed' : ''
    ]"
    :disabled="disabled"
    role="switch"
    :aria-checked="modelValue"
  >
    <span class="sr-only">{{ label }}</span>
    <span
      :class="[
        'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
        modelValue ? 'translate-x-5' : 'translate-x-0'
      ]"
    />
  </button>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  disabled: {
    type: Boolean,
    default: false
  },
  label: {
    type: String,
    default: 'Toggle'
  }
});

const emit = defineEmits(['update:modelValue']);

const toggle = () => {
  if (!props.disabled) {
    emit('update:modelValue', !props.modelValue);
  }
};
</script>
