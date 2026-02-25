from locust import HttpUser, task, between


class BenchmarkUser(HttpUser):
    """Load testing user for course API endpoints."""

    wait_time = between(1, 3)

    @task
    def get_courses(self):
        """Get all public courses."""
        with self.client.get("/api/courses/?access=public", catch_response=True) as response:
            if response.status_code == 200:
                try:
                    data = response.json()
                    if "courses" in data:
                        response.success()
                    else:
                        response.failure("Missing 'courses' key in response")
                except Exception as e:
                    response.failure(f"Invalid JSON: {e}")
            else:
                response.failure(f"Failed! Status code: {response.status_code}")

    @task
    def get_all_courses(self):
        """Get all courses without access filter."""
        with self.client.get("/api/courses/", catch_response=True) as response:
            if response.status_code == 200:
                try:
                    data = response.json()
                    if "courses" in data:
                        response.success()
                    else:
                        response.failure("Missing 'courses' key in response")
                except Exception as e:
                    response.failure(f"Invalid JSON: {e}")
            else:
                response.failure(f"Failed! Status code: {response.status_code}")

    @task
    def get_private_courses(self):
        """Get private courses."""
        with self.client.get("/api/courses/?access=private", catch_response=True) as response:
            if response.status_code == 200:
                try:
                    data = response.json()
                    if "courses" in data:
                        response.success()
                    else:
                        response.failure("Missing 'courses' key in response")
                except Exception as e:
                    response.failure(f"Invalid JSON: {e}")
            else:
                response.failure(f"Failed! Status code: {response.status_code}")
