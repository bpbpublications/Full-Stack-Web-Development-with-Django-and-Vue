<template>
  <div class="forbidden-page">
    <div class="container">
      <h1>Access Denied</h1>
      <p>You don't have permission to access this resource.</p>
      <router-link to="/" class="back-link">Back to Home</router-link>
    </div>
  </div>
</template>

<script setup>
// No additional script needed
</script>

<style scoped>
.forbidden-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 72px);
  background: var(--primary-black);
  color: var(--text-primary);
}

.container {
  text-align: center;
  padding: 2rem;
}

h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: var(--accent-color);
}

p {
  font-size: 1.2rem;
  margin-bottom: 2rem;
}

.back-link {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background: var(--accent-color);
  color: var(--primary-black);
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.back-link:hover {
  opacity: 0.9;
  transform: translateY(-2px);
}
</style>