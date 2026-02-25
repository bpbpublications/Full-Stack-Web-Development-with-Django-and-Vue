<template>
  <div class="contact-page">
    <div class="contact-header">
      <h1>Get in Touch</h1>
      <p>Have a question or need help? Fill out the form below or contact us directly.</p>
    </div>

    <div class="contact-container">
      <form @submit.prevent="handleSubmit" class="contact-form">
        <div class="form-group">
          <label for="name">Full Name</label>
          <input 
            type="text" 
            id="name" 
            v-model="formData.name"
            required
            placeholder="Enter your full name"
          >
        </div>

        <div class="form-group">
          <label for="email">Email Address</label>
          <input 
            type="email" 
            id="email" 
            v-model="formData.email"
            required
            placeholder="Enter your email"
          >
        </div>

        <div class="form-group">
          <label for="subject">Subject</label>
          <input 
            type="text" 
            id="subject" 
            v-model="formData.subject"
            required
            placeholder="What is this regarding?"
          >
        </div>

        <div class="form-group">
          <label for="message">Message</label>
          <textarea 
            id="message" 
            v-model="formData.message"
            required
            rows="6"
            placeholder="Type your message here..."
          ></textarea>
        </div>

        <button type="submit" class="submit-btn">Send Message</button>
      </form>

      <div class="contact-info">
        <div class="info-card">
          <i class="fas fa-envelope"></i>
          <h3>Email Us</h3>
          <p>support@datapundits.com</p>
        </div>

        <div class="info-card">
          <i class="fas fa-phone"></i>
          <h3>Call Us</h3>
          <p>+1 (555) 123-4567</p>
        </div>

        <div class="info-card">
          <i class="fas fa-map-marker-alt"></i>
          <h3>Location</h3>
          <p>123 Learning Street<br>Education City, ED 12345</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const formData = ref({
  name: '',
  email: '',
  subject: '',
  message: ''
})

const handleSubmit = () => {
  // Here you would typically send the form data to your backend
  console.log('Form submitted:', formData.value)
  
  // Reset form after submission
  formData.value = {
    name: '',
    email: '',
    subject: '',
    message: ''
  }
}
</script>

<style scoped>
.contact-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.contact-header {
  text-align: center;
  margin-bottom: 3rem;
}

.contact-header h1 {
  font-size: 2.5rem;
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.contact-header p {
  color: var(--text-secondary);
  font-size: 1.1rem;
}

.contact-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
}

.contact-form {
  background: var(--secondary-black);
  padding: 2rem;
  border-radius: 12px;
  border: 1px solid var(--tertiary-black);
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-secondary);
}

.form-group input,
.form-group textarea {
  width: 100%;
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

.submit-btn {
  width: 100%;
  padding: 1rem;
  background: var(--accent-color);
  color: var(--primary-black);
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.submit-btn:hover {
  background-color: var(--accent-color-hover);
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.info-card {
  background: var(--secondary-black);
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid var(--tertiary-black);
  text-align: center;
}

.info-card i {
  font-size: 2rem;
  color: var(--accent-color);
  margin-bottom: 1rem;
}

.info-card h3 {
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.info-card p {
  color: var(--text-secondary);
}

/* Responsive Design */
@media (max-width: 768px) {
  .contact-container {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .contact-page {
    padding: 1rem;
  }

  .contact-header h1 {
    font-size: 2rem;
  }
}
  </style>
