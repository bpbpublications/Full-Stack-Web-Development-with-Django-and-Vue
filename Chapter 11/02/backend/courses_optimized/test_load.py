"""
Load Tests for Optimized Courses App

This module demonstrates performance testing and optimization techniques.
Tests compare optimized vs non-optimized query patterns to show the impact of:
- select_related() - Prevents N+1 queries on ForeignKey
- prefetch_related() - Prevents N+1 queries on reverse relations
- Denormalization - Caches aggregates to avoid expensive calculations
- Pagination - Handles large datasets efficiently
- Indexing - Database level optimization

Run with: python -m pytest courses_optimized/test_load.py -v
Or use Django's unittest: python manage.py test courses_optimized.test_load
"""
import time
from django.test import TestCase
from django.test.utils import override_settings
from django.db import connection
from django.db.models import Count, Avg, Q
from django.test.utils import CaptureQueriesContext
from django.core.cache import cache

from accounts.models import CustomUser
from .models import OptimizedCourse, CourseStats


def load_tests(loader, tests, pattern):
    """
    Load tests function for unittest framework.
    This allows running tests with: python -m unittest discover -p "test_*.py"
    """
    return tests


class PerformanceTestCase(TestCase):
    """Base class for performance tests with utilities."""
    
    @classmethod
    def setUpClass(cls):
        """Set up test data for all tests."""
        super().setUpClass()
        cls.create_test_instructors(5)
        cls.create_test_courses(100)
    
    @classmethod
    def create_test_instructors(cls, count):
        """Create test instructors."""
        cls.instructors = [
            CustomUser.objects.create_user(
                email=f'instructor{i}@test.com',
                name=f'Instructor {i}',
                password='testpass123',
                role='instructor'
            )
            for i in range(count)
        ]
    
    @classmethod
    def create_test_courses(cls, count):
        """Create test courses efficiently."""
        courses_data = [
            {
                'title': f'Course {i}',
                'slug': f'course-{i}',
                'description': f'Description for course {i}',
                'instructor_id': cls.instructors[i % len(cls.instructors)].id,
                'price': 99.99 + i,
                'status': 'active' if i % 10 != 0 else 'draft',
                'thumbnail': None
            }
            for i in range(count)
        ]
        
        # Use bulk_create for efficiency
        cls.courses = OptimizedCourse.objects.bulk_create(
            [OptimizedCourse(**data) for data in courses_data],
            batch_size=100
        )
        
        # Create stats for each course
        CourseStats.objects.bulk_create(
            [CourseStats(course=course) for course in cls.courses],
            batch_size=100
        )
    
    def assertQueryCountLess(self, expected_count, tolerance=0.1):
        """
        Context manager to assert number of queries.
        
        Usage:
            with self.assertQueryCountLess(5):
                # Code that should make fewer than 5 queries
        """
        return QueryCountAssertion(expected_count, tolerance=tolerance)


class QueryCountAssertion:
    """Context manager for asserting query counts."""
    
    def __init__(self, expected_count, tolerance=0.1):
        self.expected_count = expected_count
        self.tolerance = tolerance
        self.actual_count = 0
    
    def __enter__(self):
        self.context = CaptureQueriesContext(connection)
        return self.context.__enter__()
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        self.context.__exit__(exc_type, exc_val, exc_tb)
        self.actual_count = len(self.context.captured_queries)
        
        # Allow some tolerance (default 10%)
        threshold = int(self.expected_count * (1 + self.tolerance))
        
        if self.actual_count > threshold:
            raise AssertionError(
                f'Expected at most {threshold} queries, '
                f'but {self.actual_count} were executed.\n'
                f'Queries:\n' +
                '\n'.join([q['sql'][:100] for q in self.context.captured_queries])
            )


class OptimizedCoursesN1QueryTests(PerformanceTestCase):
    """Tests demonstrating N+1 query prevention."""
    
    def test_list_courses_without_optimization(self):
        """
        BAD: Fetching courses without select_related causes N+1 queries.
        
        Example of N+1 problem:
        - 1 query to fetch 100 courses
        - 100 queries to fetch instructor for each course
        = 101 total queries
        """
        courses = OptimizedCourse.objects.all()[:10]
        
        with CaptureQueriesContext(connection) as ctx:
            for course in courses:
                _ = course.instructor.name
        
        self.assertGreater(len(ctx.captured_queries), 10)
        print(f"\n❌ Without optimization: {len(ctx.captured_queries)} queries for 10 courses")
    
    def test_list_courses_with_optimization(self):
        """
        GOOD: Using select_related prevents N+1 queries.
        
        select_related joins the instructor table, so:
        - 1 query with JOIN to fetch courses + instructor data
        = 1 total query (or very few)
        """
        courses = OptimizedCourse.objects.select_related('instructor').all()[:10]
        
        with CaptureQueriesContext(connection) as ctx:
            for course in courses:
                _ = course.instructor.name
        
        self.assertLessEqual(len(ctx.captured_queries), 3)
        print(f"\n✅ With select_related: {len(ctx.captured_queries)} queries for 10 courses")
    
    def test_stats_without_optimization(self):
        """
        BAD: Fetching stats without prefetch_related causes N+1.
        """
        courses = OptimizedCourse.objects.all()[:10]
        
        with CaptureQueriesContext(connection) as ctx:
            for course in courses:
                try:
                    _ = course.stats.enrolled_count
                except:
                    pass
        
        self.assertGreater(len(ctx.captured_queries), 10)
        print(f"\n❌ Without prefetch_related: {len(ctx.captured_queries)} queries")
    
    def test_stats_with_optimization(self):
        """
        GOOD: Using prefetch_related prevents N+1.
        """
        courses = OptimizedCourse.objects.prefetch_related('stats').all()[:10]
        
        with CaptureQueriesContext(connection) as ctx:
            for course in courses:
                _ = course.stats.enrolled_count
        
        self.assertLessEqual(len(ctx.captured_queries), 3)
        print(f"\n✅ With prefetch_related: {len(ctx.captured_queries)} queries")


class OptimizedCoursesQueryOptimizationTests(PerformanceTestCase):
    """Tests demonstrating query optimization techniques."""
    
    def test_denormalization_performance(self):
        """
        Denormalization: Store aggregate data in a separate table.
        
        Denormalized approach:
        - 1 query: SELECT enrolled_count FROM course_stats WHERE course_id = 1
        
        Normal approach:
        - 1 query: SELECT COUNT(*) FROM enrollments WHERE course_id = 1
        """
        course = OptimizedCourse.objects.select_related('stats').first()
        
        with CaptureQueriesContext(connection) as ctx:
            enrolled = course.stats.enrolled_count
        
        self.assertEqual(len(ctx.captured_queries), 0)
        print(f"\n✅ Denormalized access: {len(ctx.captured_queries)} queries")
    
    def test_filtering_by_indexed_field(self):
        """
        Index optimization: Database can quickly find records.
        
        Without index:
        - Full table scan required
        - O(n) complexity
        
        With index on 'status':
        - Database can use index
        - O(log n) complexity
        """
        with CaptureQueriesContext(connection) as ctx:
            active_courses = OptimizedCourse.objects.filter(status='active').count()
        
        self.assertEqual(len(ctx.captured_queries), 1)
        print(f"\n✅ Indexed filtering: {len(ctx.captured_queries)} query")
    
    def test_only_fetch_needed_fields(self):
        """
        Query optimization: only() and defer() to limit fields.
        
        only(fields): Fetch only specified fields
        defer(fields): Defer fetching specified fields
        """
        with CaptureQueriesContext(connection) as ctx:
            courses = OptimizedCourse.objects.only('id', 'title', 'price').all()[:10]
            list(courses)
        
        self.assertEqual(len(ctx.captured_queries), 1)
        print(f"\n✅ Selective field fetching: {len(ctx.captured_queries)} query")


class OptimizedCoursesPaginationTests(PerformanceTestCase):
    """Tests demonstrating pagination benefits."""
    
    def test_pagination_reduces_data_transfer(self):
        """
        Pagination: Fetch limited results instead of everything.
        
        Without pagination:
        - All 100 courses loaded into memory
        - All 100 serialized
        - Large response payload
        
        With pagination (page_size=10):
        - Only 10 courses per request
        - Smaller memory footprint
        - Faster response times
        """
        with CaptureQueriesContext(connection) as ctx:
            courses = OptimizedCourse.objects.all()[:10]
            list(courses)
        
        self.assertEqual(len(ctx.captured_queries), 1)
        print(f"\n✅ Pagination query: {len(ctx.captured_queries)} query (with LIMIT)")
    
    def test_unpaginated_large_result_set(self):
        """
        Shows why unpaginated queries are problematic.
        """
        with CaptureQueriesContext(connection) as ctx:
            courses = list(OptimizedCourse.objects.all())
        
        self.assertEqual(len(ctx.captured_queries), 1)
        print(f"\n❌ Unpaginated query: {len(ctx.captured_queries)} query (NO LIMIT)")


class OptimizedCoursesAggregationTests(PerformanceTestCase):
    """Tests demonstrating efficient aggregation."""
    
    def test_aggregation_at_database_level(self):
        """
        Database-level aggregation: COUNT, AVG, SUM at the database.
        
        Inefficient (Python-level):
        - Fetch all enrollments
        - Calculate count in Python
        
        Efficient (Database-level):
        - SELECT COUNT(*) at database
        - Return single number
        """
        with CaptureQueriesContext(connection) as ctx:
            count = OptimizedCourse.objects.filter(
                status='active'
            ).count()
        
        self.assertEqual(len(ctx.captured_queries), 1)
        self.assertGreater(count, 0)
        print(f"\n✅ Database aggregation: {len(ctx.captured_queries)} query with COUNT()")
    
    def test_multi_aggregate_operations(self):
        """
        Multiple aggregations in one query.
        
        Using .aggregate():
        - SELECT COUNT(*), AVG(rating) FROM courses
        = 1 query for multiple aggregates
        """
        with CaptureQueriesContext(connection) as ctx:
            stats = OptimizedCourse.objects.filter(
                status='active'
            ).aggregate(
                count=Count('id'),
                avg_price=Avg('price'),
                avg_rating=Avg('rating')
            )
        
        self.assertEqual(len(ctx.captured_queries), 1)
        print(f"\n✅ Multi-aggregate: {len(ctx.captured_queries)} query for 3 aggregates")


class OptimizedCoursesCachingTests(PerformanceTestCase):
    """Tests demonstrating caching benefits."""
    
    def test_cache_hit_performance(self):
        """
        Caching: Store frequently accessed data in memory.
        
        First request: DB query
        Subsequent requests: Cache hit (no DB query)
        """
        cache.clear()
        cache_key = 'test_course_list'
        
        with CaptureQueriesContext(connection) as ctx:
            data = cache.get(cache_key)
            if not data:
                data = list(OptimizedCourse.objects.all()[:10].values())
                cache.set(cache_key, data, 300)
        
        first_queries = len(ctx.captured_queries)
        self.assertGreater(first_queries, 0)
        
        with CaptureQueriesContext(connection) as ctx:
            data = cache.get(cache_key)
        
        second_queries = len(ctx.captured_queries)
        self.assertEqual(second_queries, 0)
        
        print(f"\n✅ Cache benefits: {first_queries} queries → {second_queries} queries")


class PerformanceComparisonTests(PerformanceTestCase):
    """Direct performance comparisons."""
    
    def test_optimized_vs_unoptimized_list_view(self):
        """
        Compare optimized vs unoptimized course listing.
        """
        start = time.time()
        courses = list(OptimizedCourse.objects.all()[:10])
        for course in courses:
            _ = course.instructor.name
        unoptimized_time = time.time() - start
        
        start = time.time()
        courses = list(OptimizedCourse.objects.select_related('instructor').all()[:10])
        for course in courses:
            _ = course.instructor.name
        optimized_time = time.time() - start
        
        improvement = ((unoptimized_time - optimized_time) / unoptimized_time) * 100
        print(f"\n📊 Performance Improvement: {improvement:.1f}%")
        print(f"   Unoptimized: {unoptimized_time*1000:.2f}ms")
        print(f"   Optimized: {optimized_time*1000:.2f}ms")


# Run tests with: python manage.py test courses_optimized.test_load
