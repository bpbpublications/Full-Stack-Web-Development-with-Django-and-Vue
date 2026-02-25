<template>
  <div class="certificates">
    <h1>My Certificates</h1>

    <div class="certificates-grid">
      <div v-for="cert in certificates" :key="cert.id" class="certificate-card">
        <div class="certificate-content">
          <i class="fas fa-certificate certificate-icon"></i>
          <h3>{{ cert.courseName }}</h3>
          <p class="completion-date">Completed on {{ formatDate(cert.completionDate) }}</p>
          <div class="certificate-actions">
            <button class="btn-download" @click="downloadCertificate(cert.id)">
              <i class="fas fa-download"></i> Download
            </button>
            <button class="btn-share" @click="shareCertificate(cert.id)">
              <i class="fas fa-share-alt"></i> Share
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const certificates = ref([
  {
    id: 1,
    courseName: 'Web Development Fundamentals',
    completionDate: '2023-05-15'
  },
  {
    id: 2,
    courseName: 'Python Programming',
    completionDate: '2023-06-20'
  }
])

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const downloadCertificate = (certId) => {
  // Implement certificate download logic
  console.log('Downloading certificate:', certId)
}

const shareCertificate = (certId) => {
  // Implement certificate sharing logic
  console.log('Sharing certificate:', certId)
}
</script>

<style scoped>
.certificates {
  padding: 2rem;
}

.certificates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.certificate-card {
  background: var(--secondary-black);
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  transition: transform 0.3s ease;
}

.certificate-card:hover {
  transform: translateY(-4px);
}

.certificate-icon {
  font-size: 3rem;
  color: var(--accent-color);
  margin-bottom: 1rem;
}

.certificate-content h3 {
  margin-bottom: 0.5rem;
}

.completion-date {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
}

.certificate-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.btn-download,
.btn-share {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-download {
  background: var(--accent-color);
  color: var(--primary-black);
}

.btn-share {
  background: var(--tertiary-black);
  color: var(--text-primary);
}

.btn-download:hover,
.btn-share:hover {
  opacity: 0.9;
}
</style>