<template>
    <div class="course-inquiry-form">
        <h2>Course Inquiry Form</h2>
        <form @submit.prevent="handleSubmit">
            <input v-model="name" type="text" placeholder="Enter your name" required />
            <textarea v-model="message" placeholder="Enter your message" />
            <select v-model="selectedOption">
                <option value="Data Analysis">Data Analysis</option>
                <option value="Machine Learning">Machine Learning</option>
                <option value="Deep Learning">Deep Learning</option>
            </select>
            <button type="submit">Submit</button>
        </form>
    </div>
</template>

<script>
import { ref } from 'vue';

export default {
    setup() {
        const name = ref('');
        const message = ref('');
        const selectedOption = ref('');

        const handleSubmit = () => {
            console.log({
                name: name.value,
                message: message.value,
                selectedOption: selectedOption.value
            });
        };

        return { name, message, selectedOption, handleSubmit };
    }
};
</script>

<style scoped>
.course-inquiry-form {
    max-width: 500px;
    margin: 40px auto;
    padding: 20px;
    background-color: #f9f9f9;
    border: 1px solid #ddd;
    border-radius: 10px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

form {
    display: flex;
    flex-direction: column;
}

input,
textarea,
select {
    width: 100%;
    padding: 10px;
    margin-bottom: 20px;
    border: 1px solid #ccc;
    border-radius: 5px;
}

button[type="submit"] {
    background-color: #333;
    color: #fff;
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
}

button[type="submit"]:hover {
    background-color: #444;
}

h2 {
    margin-top: 0;
    text-align: center;
}
</style>