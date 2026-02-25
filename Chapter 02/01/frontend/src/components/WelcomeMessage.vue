<template>
  <div>
    <p>{{ message }}</p>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import axiosInstance from '../services/axios';

export default {
  setup() {
    const message = ref('');

    onMounted(async () => {
      try {
        const response = await axiosInstance.get('welcome/');
        message.value = response.data.message;
      } catch (error) {
        console.error('There was an error fetching the welcome message:', error);
      }
    });

    return {
      message,
    };
  },
};
</script>

<style scoped>
p {
  font-size: 30px;
  font-weight: bold;
  color: #111;
}
</style>