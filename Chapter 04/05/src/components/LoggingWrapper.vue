<script setup>
import { onMounted } from "vue";

const props = defineProps({
  is: { type: [Object, Function, String], required: true },
  name: { type: String, default: "" },
});

onMounted(() => {
  const resolvedName = props.name || props.is?.name || props.is?.__name || "AnonymousComponent";
  console.log(`${resolvedName} component has been mounted.`);
});
</script>

<template>
  <component :is="is" v-bind="$attrs">
    <slot />
  </component>
</template>
