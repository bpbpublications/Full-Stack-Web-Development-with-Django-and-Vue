<template>
  <div>
    <h2>Name: {{ student.name }}</h2>
    <p>Email: {{ student.email }}</p>

    <ul>
      <li v-for="course in student.courses" :key="course.id">
        {{ course.name }}
      </li>
    </ul>

    <button @click="rename">Rename</button>
    <button @click="addCourse">Add course</button>
  </div>
</template>

<script>
import { reactive } from 'vue'

export default {
  setup() {

    const student = reactive({
      name: 'John Edward',
      email: 'johnedward@example.com',
      courses: [
        { id: 1, name: 'Course 1' },
        { id: 2, name: 'Course 2' },
        { id: 3, name: 'Course 3' }
      ]
    })

    const rename = () => {

      student.name = 'Jane Doe'
    }

    const addCourse = () => {

      student.courses.push({ id: Date.now(), name: 'New Course' })
    }

    return { student, rename, addCourse }
  }
}
</script>