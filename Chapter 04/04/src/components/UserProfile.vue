<template>
  <div>
    <h1>User Profile</h1>

    <p>Name: {{ name }}</p>

    <input
      v-model.trim="name"
      placeholder="Update your name"
      @keyup.enter="updateName"
    />

    <button :disabled="!name" @click="updateName">
      Update Name
    </button>

    <p v-if="message" class="msg">{{ message }}</p>
  </div>
</template>

<script>
import { ref } from "vue";

export default {
  setup() {
    const name = ref("Akpan Bolton");
    const message = ref("");

    const updateName = () => {
      const trimmed = (name.value || "").trim();

      if (!trimmed) {
        message.value = "Please enter a valid name.";
        return;
      }

    
      name.value = trimmed;

      console.log(`User name updated to: ${name.value}`);
      message.value = "Name updated!";
    };

    return { name, updateName, message };
  },
};
</script>

<style scoped>
input {
  margin-right: 10px;
  padding: 5px;
}
button {
  padding: 5px 10px;
}
button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.msg {
  margin-top: 10px;
  color: gray;
}
</style>
