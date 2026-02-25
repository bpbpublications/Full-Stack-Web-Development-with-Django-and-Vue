<template>
  <div class="dashboard-profile">
    <h1>My Profile</h1>
    
    <div class="profile-section card">
      <div class="profile-header">
        <div class="avatar-section">
          <img :src="user.avatar || 'src/assets/default-avatar2.png'" alt="3Profile" class="profile-avatar">
          <button class="change-avatar-btn">
            <i class="fas fa-camera"></i>
            <span>Change Photo</span>
          </button>
        </div>
        
        <div class="profile-info">
          <h2>{{ user.name }}</h2>
          <p>{{ user.email }}</p>
          <span class="member-since">Member since {{ formatDate(user.joinedDate) }}</span>
        </div>
      </div>

      <form @submit.prevent="updateProfile" class="profile-form">
        <div class="form-group">
          <label for="name">Full Name</label>
          <input 
            type="text" 
            id="name" 
            v-model="profileData.name"
            placeholder="Your full name"
          >
        </div>

        <div class="form-group">
          <label for="email">Email Address</label>
          <input 
            type="email" 
            id="email" 
            v-model="profileData.email"
            placeholder="Your email"
          >
        </div>

        <div class="form-group">
          <label for="bio">Bio</label>
          <textarea 
            id="bio" 
            v-model="profileData.bio"
            placeholder="Tell us about yourself"
            rows="4"
          ></textarea>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn-primary">
            Save Changes
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useUserStore } from '../../stores/userStore'

const userStore = useUserStore()
const user = ref(userStore.getUserProfile)

const profileData = ref({
  name: user.value.name,
  email: user.value.email,
  bio: user.value.bio || ''
})

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const updateProfile = async () => {
  try {
    // Here you would typically make an API call to update the profile
    // await userService.updateProfile(profileData.value)
    
    // Update local store
    userStore.updateProfile(profileData.value)
    
    // Show success message
  } catch (error) {
    console.error('Failed to update profile:', error)
    // Show error message
  }
}
</script>

<style scoped>
.dashboard-profile {
  padding: 2rem;
}

.card {
  background: var(--secondary-black);
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
}

.profile-header {
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.profile-avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
}

.change-avatar-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid var(--accent-color);
  border-radius: 6px;
  background: transparent;
  color: var(--accent-color);
  cursor: pointer;
  transition: all 0.3s ease;
}

.change-avatar-btn:hover {
  background: var(--accent-color);
  color: var(--primary-black);
}

.profile-info {
  flex: 1;
}

.member-since {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.profile-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  color: var(--text-secondary);
}

.form-group input,
.form-group textarea {
  padding: 0.75rem;
  border: 1px solid var(--tertiary-black);
  border-radius: 8px;
  background: var(--tertiary-black);
  color: var(--text-primary);
  font-size: 1rem;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--accent-color);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 1rem;
}

.btn-primary {
  padding: 0.75rem 1.5rem;
  background: var(--accent-color);
  color: var(--primary-black);
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  opacity: 0.9;
}
</style>