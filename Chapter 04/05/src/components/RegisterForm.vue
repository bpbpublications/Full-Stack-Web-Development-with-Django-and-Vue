<template>
    <div class="register-form">
        <h2>Register</h2>
        <form @submit.prevent="handleRegister">
            <div class="form-group">
                <label for="name">Full Name:</label>
                <input v-model="name" type="text" id="name" placeholder="Enter Full Name" required />
            </div>
            <div class="form-group">
                <label for="email">Email:</label>
                <input v-model="email" type="email" id="email" placeholder="Email" required />
            </div>
            <div class="form-group">
                <label for="password">Password:</label>
                <input v-model="password" type="password" id="password" placeholder="Password" required />
            </div>
            <div class="form-group">
                <label for="role">Role:</label>
                <select v-model="role" id="role">
                    <option value="student">Student</option>
                    <option value="instructor">Instructor</option>
                    <option value="admin">Administrator</option>
                </select>
            </div>
            <button type="submit">Register</button>
        </form>
    </div>
</template>

<script>
import { ref } from 'vue';

export default {
    setup() {
        const name = ref('');
        const email = ref('');
        const password = ref('');
        const role = ref('student');

        const handleRegister = () => {
            console.log({
                name: name.value,
                email: email.value,
                password: password.value,
                role: role.value
            });
            // Handle registration logic 
        };

        return { name, email, password, role, handleRegister };
    }
};
</script>

<style scoped>
.register-form {
    max-width: 400px;
    margin: 40px auto;
    padding: 20px;
    background-color: #f9f9f9;
    border: 1px solid #ddd;
    border-radius: 10px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

h2 {
    margin-top: 0;
    text-align: center;
}

.form-group {
    margin-bottom: 20px;
}

label {
    display: block;
    margin-bottom: 10px;
    text-align: left;
}

input[type="text"],
input[type="email"],
input[type="password"] {
    width: 100%;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
}

select {
    width: 100%;
    padding: 10px;
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
</style>