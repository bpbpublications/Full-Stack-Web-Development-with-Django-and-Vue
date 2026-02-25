<template>
    <div class="course-overview">
        <h1>{{ course.title }}</h1>
        <img :src="course.image" alt="Course Image" class="course-image" />
        <p class="description">{{ course.description }}</p>
        <h3>Learning Objectives</h3>
        <ul>
            <li v-for="objective in course.objectives" :key="objective">{{ objective }}</li>
        </ul>
        <section class="instructor-info">
            <h3>About the Instructor</h3>
            <img :src="instructor.photo" alt="Instructor Photo" class="instructor-photo" />
            <p>{{ instructor.name }} - {{ instructor.qualifications }}</p>
            <p>{{ instructor.bio }}</p>
        </section>
        <button @click="enroll(course.id)">Enroll Now</button>
    </div>
</template>

<script>
export default {
    name: 'CourseOverview',
    props: {
        course: Object,
        instructor: Object
    },
    methods: {
        enroll(courseId) {

            console.log(`Enrolling in course ID: ${courseId}`);
        }
    }
}
</script>

<style scoped>
.course-overview {
    max-width: 800px;
    margin: 40px auto;
    padding: 20px;
    background-color: #fff;
    border: 1px solid #ddd;
    border-radius: 10px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.course-image,
.instructor-photo {
    width: 100%;
    height: auto;
    border-radius: 10px;
}

.description {
    font-size: 1.2em;
    margin-top: 20px;
    color: #666;
}

h1,
h3 {
    color: #333;
}

ul {
    list-style: none;
    padding: 0;
    margin: 0;
}

li {
    margin-bottom: 10px;
}

.instructor-info {
    margin-top: 20px;
}

button {
    background-color: #4CAF50;
    color: #fff;
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
}

button:hover {
    background-color: #3e8e41;
}
</style>
</style>