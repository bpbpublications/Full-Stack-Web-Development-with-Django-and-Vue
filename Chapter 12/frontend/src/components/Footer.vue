<template>
  <footer class="footer">
    <div class="footer-content">
      <div class="footer-section">
        <h3>About Datapundits</h3>
        <p>Empowering learners worldwide with quality education in data science and technology.</p>
      </div>
      <div class="footer-section">
        <h3>Quick Links</h3>
        <ul>
          <li><router-link to="/courses">Browse Courses</router-link></li>
          <li><router-link to="/about">About Us</router-link></li>
          <li><router-link to="/contact">Contact</router-link></li>
          <li><router-link to="/privacy">Privacy Policy</router-link></li>
        </ul>
      </div>
      <div class="footer-section">
        <h3>Contact Us</h3>
        <p>Email: support@datapundits.com</p>
        <p>Phone: +1 (555) 123-4567</p>
        <div class="social-links">
          <a href="#" class="social-link">Twitter</a>
          <a href="#" class="social-link">LinkedIn</a>
          <a href="#" class="social-link">GitHub</a>
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      <p>&copy; 2025. Datapundits. All rights reserved.</p>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  background-color: var(--secondary-black);
  border-top: 1px solid var(--tertiary-black);
  padding: 4rem 2rem 2rem;
  margin-top: 4rem;
}

.footer-content {
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4rem;
}

.footer-section h3 {
  color: var(--accent-color);
  margin-bottom: 1.5rem;
  font-size: 1.2rem;
}

.footer-section p {
  color: var(--text-secondary);
  line-height: 1.6;
}

.footer-section ul {
  list-style: none;
  padding: 0;
}

.footer-section ul li {
  margin-bottom: 0.8rem;
}

.footer-section a {
  color: var(--text-secondary);
  text-decoration: none;
  transition: color 0.3s ease;
}

.footer-section a:hover {
  color: var(--accent-color);
}

.social-links {
  margin-top: 1.5rem;
  display: flex;
  gap: 1rem;
}

.social-link {
  padding: 0.5rem 1rem;
  border: 1px solid var(--tertiary-black);
  border-radius: 4px;
}

.footer-bottom {
  max-width: 1400px;
  margin: 0 auto;
  text-align: center;
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid var(--tertiary-black);
  color: var(--text-secondary);
}

@media (max-width: 768px) {
  .footer-content {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .footer {
    padding: 2rem 1rem 1rem;
  }
}
</style>
