<template>
  <div class="admin-settings">
    <div class="header">
      <h1>System Settings</h1>
    </div>

    <div class="settings-grid">
      <!-- Site Settings -->
      <div class="settings-section card">
        <h2>Site Settings</h2>
        <form @submit.prevent="saveSiteSettings">
          <div class="form-group">
            <label>Site Name</label>
            <input 
              v-model="siteSettings.name" 
              type="text" 
              placeholder="Enter site name"
            >
          </div>
          <div class="form-group">
            <label>Support Email</label>
            <input 
              v-model="siteSettings.supportEmail" 
              type="email" 
              placeholder="Support email address"
            >
          </div>
          <div class="form-group">
            <label>Maintenance Mode</label>
            <div class="toggle-switch">
              <input 
                type="checkbox" 
                id="maintenance" 
                v-model="siteSettings.maintenanceMode"
              >
              <label for="maintenance"></label>
            </div>
          </div>
          <button type="submit" class="save-btn">Save Site Settings</button>
        </form>
      </div>

      <!-- Course Settings -->
      <div class="settings-section card">
        <h2>Course Settings</h2>
        <form @submit.prevent="saveCourseSettings">
          <div class="form-group">
            <label>Default Course Privacy</label>
            <select v-model="courseSettings.defaultPrivacy">
              <option value="public">Public</option>
              <option value="private">Private</option>
              <option value="unlisted">Unlisted</option>
            </select>
          </div>
          <div class="form-group">
            <label>Maximum Course Size (MB)</label>
            <input 
              v-model="courseSettings.maxSize" 
              type="number" 
              min="1"
              max="10000"
            >
          </div>
          <div class="form-group">
            <label>Auto-approve Courses</label>
            <div class="toggle-switch">
              <input 
                type="checkbox" 
                id="autoApprove" 
                v-model="courseSettings.autoApprove"
              >
              <label for="autoApprove"></label>
            </div>
          </div>
          <button type="submit" class="save-btn">Save Course Settings</button>
        </form>
      </div>

      <!-- User Settings -->
      <div class="settings-section card">
        <h2>User Settings</h2>
        <form @submit.prevent="saveUserSettings">
          <div class="form-group">
            <label>Default User Role</label>
            <select v-model="userSettings.defaultRole">
              <option value="student">Student</option>
              <option value="instructor">Instructor</option>
            </select>
          </div>
          <div class="form-group">
            <label>Email Verification Required</label>
            <div class="toggle-switch">
              <input 
                type="checkbox" 
                id="emailVerification" 
                v-model="userSettings.requireEmailVerification"
              >
              <label for="emailVerification"></label>
            </div>
          </div>
          <div class="form-group">
            <label>Maximum File Upload Size (MB)</label>
            <input 
              v-model="userSettings.maxUploadSize" 
              type="number" 
              min="1"
              max="1000"
            >
          </div>
          <button type="submit" class="save-btn">Save User Settings</button>
        </form>
      </div>

      <!-- Payment Settings -->
      <div class="settings-section card">
        <h2>Payment Settings</h2>
        <form @submit.prevent="savePaymentSettings">
          <div class="form-group">
            <label>Currency</label>
            <select v-model="paymentSettings.currency">
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>
          <div class="form-group">
            <label>Platform Fee (%)</label>
            <input 
              v-model="paymentSettings.platformFee" 
              type="number" 
              min="0"
              max="100"
            >
          </div>
          <div class="form-group">
            <label>Minimum Payout Amount</label>
            <input 
              v-model="paymentSettings.minPayout" 
              type="number" 
              min="0"
            >
          </div>
          <button type="submit" class="save-btn">Save Payment Settings</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const siteSettings = ref({
  name: 'Datapundits',
  supportEmail: 'support@datapundits.com',
  maintenanceMode: false
})

const courseSettings = ref({
  defaultPrivacy: 'public',
  maxSize: 5000,
  autoApprove: false
})

const userSettings = ref({
  defaultRole: 'student',
  requireEmailVerification: true,
  maxUploadSize: 100
})

const paymentSettings = ref({
  currency: 'USD',
  platformFee: 5,
  minPayout: 50
})

const saveSiteSettings = async () => {
  try {
    // API call to save site settings
    console.log('Saving site settings:', siteSettings.value)
    // Show success message
  } catch (error) {
    console.error('Failed to save site settings:', error)
    // Show error message
  }
}

const saveCourseSettings = async () => {
  try {
    // API call to save course settings
    console.log('Saving course settings:', courseSettings.value)
    // Show success message
  } catch (error) {
    console.error('Failed to save course settings:', error)
    // Show error message
  }
}

const saveUserSettings = async () => {
  try {
    // API call to save user settings
    console.log('Saving user settings:', userSettings.value)
    // Show success message
  } catch (error) {
    console.error('Failed to save user settings:', error)
    // Show error message
  }
}

const savePaymentSettings = async () => {
  try {
    // API call to save payment settings
    console.log('Saving payment settings:', paymentSettings.value)
    // Show success message
  } catch (error) {
    console.error('Failed to save payment settings:', error)
    // Show error message
  }
}
</script>

<style scoped>
.admin-settings {
  padding: 0.5rem 2rem 2rem 2rem;
  margin-top: 72px; /* Exact height of admin header */
  position: relative;
  z-index: 1;
  min-height: calc(100vh - 72px);
}

/* Responsive positioning */
@media (min-width: 769px) {
  .admin-settings {
    margin-top: 72px; /* Fixed admin header height */
    padding-top: 0.5rem;
  }
}

@media (max-width: 768px) {
  .admin-settings {
    margin-top: 0; /* Admin header is relative on mobile */
    padding-top: 0.5rem;
  }
}

.header {
  display: flex !important;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  margin-top: 0;
  background: var(--card-bg);
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px var(--shadow);
  border: 1px solid var(--border-color);
  position: relative;
  z-index: 2;
}

.header h1 {
  margin: 0 !important;
  font-size: 1.75rem !important;
  font-weight: 700 !important;
  color: var(--text-primary) !important;
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
}

.settings-section {
  background: var(--secondary-black);
  border-radius: 8px;
  padding: 1.5rem;
}

.settings-section h2 {
  margin-bottom: 1.5rem;
  color: var(--text-primary);
  font-size: 1.25rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-secondary);
}

input[type="text"],
input[type="email"],
input[type="number"],
select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--tertiary-black);
  color: var(--text-primary);
}

.toggle-switch {
  position: relative;
  width: 60px;
  height: 34px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-switch label {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--tertiary-black);
  transition: .4s;
  border-radius: 34px;
}

.toggle-switch label:before {
  position: absolute;
  content: "";
  height: 26px;
  width: 26px;
  left: 4px;
  bottom: 4px;
  background-color: var(--text-secondary);
  transition: .4s;
  border-radius: 50%;
}

.toggle-switch input:checked + label {
  background-color: var(--accent-color);
}

.toggle-switch input:checked + label:before {
  transform: translateX(26px);
  background-color: white;
}

.save-btn {
  width: 100%;
  padding: 0.75rem;
  background: var(--accent-color);
  color: var(--primary-black);
  border: none;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.3s;
}

.save-btn:hover {
  opacity: 0.9;
}

@media (max-width: 768px) {
  .settings-grid {
    grid-template-columns: 1fr;
  }
}
</style>


