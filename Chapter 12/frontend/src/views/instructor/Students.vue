<template>
  <div class="students">
    <h2>Students</h2>
    <div class="students-table">
      <table>
        <thead>
          <tr>
            <th>Student</th>
            <th>Course</th>
            <th>Enrolled Date</th>
            <th>Progress</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="student in students" :key="student.id">
            <td>
              <div class="student-info">
                <img :src="student.avatar" :alt="student.name" class="student-avatar">
                <div>
                  <div class="student-name">{{ student.name }}</div>
                  <div class="student-email">{{ student.email }}</div>
                </div>
              </div>
            </td>
            <td>{{ student.course }}</td>
            <td>{{ formatDate(student.enrolledDate) }}</td>
            <td>
              <div class="progress-bar">
                <div class="progress" :style="{ width: student.progress + '%' }"></div>
              </div>
              <span class="progress-text">{{ student.progress }}%</span>
            </td>
            <td>
              <button class="action-btn">View Details</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const students = ref([
  {
    id: 1,
    name: 'John Smith',
    email: 'john@example.com',
    avatar: '/avatar1.jpg',
    course: 'Advanced Data Science',
    enrolledDate: '2023-05-15',
    progress: 75
  },
  {
    id: 2,
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    avatar: '/avatar2.jpg',
    course: 'Web Development Fundamentals',
    enrolledDate: '2023-06-01',
    progress: 45
  }
])

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>

<style scoped>
.students {
  padding: 1rem;
}

.students-table {
  background: var(--secondary-black);
  border-radius: 12px;
  overflow: hidden;
  margin-top: 1.5rem;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid var(--tertiary-black);
}

th {
  background: var(--tertiary-black);
  color: var(--text-secondary);
  font-weight: 500;
}

.student-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.student-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.student-name {
  font-weight: 500;
}

.student-email {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.progress-bar {
  width: 100px;
  height: 6px;
  background: var(--tertiary-black);
  border-radius: 3px;
  overflow: hidden;
}

.progress {
  height: 100%;
  background: var(--accent-color);
}

.progress-text {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-left: 0.5rem;
}

.action-btn {
  background: var(--tertiary-black);
  color: var(--text-primary);
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
}

.action-btn:hover {
  background: var(--accent-color);
  color: var(--primary-black);
}
</style>
