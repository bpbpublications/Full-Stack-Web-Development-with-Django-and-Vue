<template>
  <div class="orders">
    <h1>My Orders</h1>

    <div class="orders-list">
      <div v-for="order in orders" :key="order.id" class="order-card">
        <div class="order-header">
          <div>
            <span class="order-id">Order #{{ order.id }}</span>
            <span class="order-date">{{ order.date }}</span>
          </div>
          <div :class="['order-status', order.status.toLowerCase()]">
            {{ order.status }}
          </div>
        </div>

        <div class="order-items">
          <div v-for="item in order.items" :key="item.id" class="order-item">
            <img :src="item.image" :alt="item.name" class="item-image">
            <div class="item-details">
              <h3>{{ item.name }}</h3>
              <p class="item-instructor">by {{ item.instructor }}</p>
            </div>
            <div class="item-price">${{ item.price }}</div>
          </div>
        </div>

        <div class="order-footer">
          <div class="order-total">
            <span>Total:</span>
            <span class="total-amount">${{ order.total }}</span>
          </div>
          <button class="view-invoice-btn">
            <i class="fas fa-download"></i> Download Invoice
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const orders = ref([
  {
    id: '1234',
    date: '2023-08-15',
    status: 'Completed',
    items: [
      {
        id: 1,
        name: 'Advanced Data Analysis',
        instructor: 'Jane Smith',
        price: 69.99,
        image: '/course-thumbnails/data-analysis.jpg'
      }
    ],
    total: 69.99
  },
  {
    id: '1235',
    date: '2023-08-10',
    status: 'Processing',
    items: [
      {
        id: 2,
        name: 'Python for Beginners',
        instructor: 'John Doe',
        price: 49.99,
        image: '/course-thumbnails/python.jpg'
      },
      {
        id: 3,
        name: 'Web Development Basics',
        instructor: 'Sarah Johnson',
        price: 59.99,
        image: '/course-thumbnails/web-dev.jpg'
      }
    ],
    total: 109.98
  }
])
</script>

<style scoped>
.orders {
  max-width: 1000px;
  margin: 0 auto;
}

.order-card {
  background: var(--secondary-black);
  border-radius: 12px;
  margin-bottom: 2rem;
  overflow: hidden;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: var(--tertiary-black);
}

.order-id {
  font-weight: bold;
  margin-right: 1rem;
}

.order-date {
  color: var(--text-secondary);
}

.order-status {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
}

.order-status.completed {
  background: #4CAF50;
  color: white;
}

.order-status.processing {
  background: #FFC107;
  color: black;
}

.order-items {
  padding: 1rem;
}

.order-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid var(--tertiary-black);
}

.item-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
  margin-right: 1rem;
}

.item-details {
  flex: 1;
}

.item-instructor {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin-top: 0.25rem;
}

.item-price {
  font-weight: bold;
  font-size: 1.1rem;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: var(--tertiary-black);
}

.order-total {
  font-size: 1.1rem;
}

.total-amount {
  font-weight: bold;
  margin-left: 0.5rem;
}

.view-invoice-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: var(--accent-color);
  color: var(--primary-black);
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: opacity 0.3s ease;
}

.view-invoice-btn:hover {
  opacity: 0.9;
}
</style>