<template>
    <div class="lms-login-form">
      <h2>LMS Login</h2>
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="email">Email:</label>
          <input 
            v-model="email" 
            type="email" 
            id="email" 
          
            required 
          />
        </div>
        <div class="form-group">
          <label for="password">Password:</label>
          <input 
            v-model="password" 
            type="password" 
            id="password" 
          
            required 
          />
        </div>
        <button type="submit">Login</button>
      </form>
      <p>
        Forgot password? <a href="#">Reset password</a>
      </p>
    </div>
  </template>
  
  <script>
  import { ref } from 'vue';
  
  export default {
    setup() {
      const email = ref('');
      const password = ref('');
  
      const handleLogin = () => {
        console.log(`Logging in with ${email.value} and ${password.value}`);
      };
  
      return { email, password, handleLogin };
    }
  };
  </script>
  
  <style scoped>
  .lms-login-form {
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
    font-weight: bold;
  }
  
  input[type="email"], input[type="password"] {
    width: 100%;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    text-align:left;
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
  
  a {
    color: #337ab7;
    text-decoration: none;
  }
  
  a:hover {
    color: #23527c;
  }
  </style>