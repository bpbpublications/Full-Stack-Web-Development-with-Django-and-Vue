from rest_framework.exceptions import APIException  

class CourseNotFoundException(APIException): 
    status_code = 404 
    default_detail = "Course not found"  
 

class CourseAlreadyExistsException(APIException): 
    status_code = 400 
    default_detail = "Course already exists" 