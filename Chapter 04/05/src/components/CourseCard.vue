<script setup>
defineProps({
  title: { type: String, required: true },
});
</script>

<template>
  <div class="card">
    <h3>{{ title }}</h3>
    <button @click="$emit('select')">Select</button>
  </div>
</template>

<style scoped>
.card {
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 8px;
}
</style>
