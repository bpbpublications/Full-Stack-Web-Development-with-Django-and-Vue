from locust import HttpUser, task, between
class BenchmarkUser(HttpUser):
    wait_time = between(1, 3)  
    @task
    def get_courses(self):
        with self.client.get("http://localhost:8000/api/courses/?access=public", catch_response=True) as response:
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
