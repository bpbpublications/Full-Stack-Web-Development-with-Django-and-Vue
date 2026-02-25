<template>
    <div class="course-ratings">
        <div class="average-rating">
            <h2>Average Rating: {{ averageRating }} <span class="rating-icon"></span></h2>
            <p>({{ totalReviews }} reviews)</p>
        </div>
        <div class="review-list">
            <div v-for="review in reviews" :key="review.id" class="review-item">
                <h3>{{ review.author }}</h3>
                <span class="rating">{{ review.rating }} <span class="rating-icon"></span></span>
                <p>{{ review.comment }}</p>
                <p class="date">{{ review.date }}</p>
            </div>
        </div>
    </div>
</template>

<script>
import { computed } from 'vue';

export default {
    name: 'CourseRatings',
    props: ['reviews', 'averageRating', 'totalReviews'],
    setup(props) {

    },
};
</script>
<style scoped>
.average-rating h2 {
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 5px;
}

.average-rating .rating-icon {
    color: gold;
    font-size: 18px;
}

.review-list {
    padding: 20px;
}

.review-item {
    margin-bottom: 20px;
    padding: 10px;
    border-bottom: 1px solid #ccc;
    transition: background-color 0.3s;
}

.review-item:hover {
    background-color: #f0f0f0;
}

.review-item .rating-icon {
    color: gold;
    font-size: 16px;
}

.review-item .date {
    font-size: 14px;
    color: #666;
}
</style>