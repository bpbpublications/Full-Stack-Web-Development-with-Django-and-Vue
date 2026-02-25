<script setup>
const props = defineProps({
  is: { type: [Object, Function, String], required: true },
  allowed: { type: Boolean, required: true },
  redirectTo: { type: String, default: "/login" }, 
});


</script>

<template>
  <div
    v-if="!allowed"
    class="access-denied"
  >
    <strong>Access denied.</strong>
    You do not have permission to view these courses.
  </div>

  <component v-else :is="is" v-bind="$attrs">
    <slot />
  </component>
</template>

<style scoped>
.access-denied {
  padding: 12px;
  border: 1px solid #f99;
  border-radius: 8px;
}
</style>
