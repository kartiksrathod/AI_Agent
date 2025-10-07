import requests
import sys
import json
import os
from datetime import datetime
from io import BytesIO

class EducationalPlatformTester:
    def __init__(self, base_url="https://document-manager-fix.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        self.admin_token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details,
            "timestamp": datetime.now().isoformat()
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, files=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if headers:
            test_headers.update(headers)
        
        if self.token and 'Authorization' not in test_headers:
            test_headers['Authorization'] = f'Bearer {self.token}'

        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers)
            elif method == 'POST':
                if files:
                    # Remove Content-Type for file uploads
                    test_headers.pop('Content-Type', None)
                    response = requests.post(url, data=data, files=files, headers=test_headers)
                else:
                    response = requests.post(url, json=data, headers=test_headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers)

            success = response.status_code == expected_status
            details = f"Status: {response.status_code}"
            
            if not success:
                try:
                    error_data = response.json()
                    details += f", Error: {error_data.get('detail', 'Unknown error')}"
                except:
                    details += f", Response: {response.text[:100]}"

            self.log_test(name, success, details)
            return success, response.json() if success and response.content else {}

        except Exception as e:
            self.log_test(name, False, f"Exception: {str(e)}")
            return False, {}

    def test_health_check(self):
        """Test basic health endpoints"""
        print("\n🔍 Testing Health Endpoints...")
        self.run_test("Root endpoint", "GET", "", 200)
        self.run_test("Health check", "GET", "health", 200)

    def test_user_registration(self):
        """Test user registration (should not have admin toggle)"""
        print("\n🔍 Testing User Registration...")
        
        test_user_data = {
            "name": "Test User",
            "email": f"testuser_{datetime.now().strftime('%H%M%S')}@example.com",
            "password": "TestPass123!"
        }
        
        success, response = self.run_test(
            "Normal user registration",
            "POST",
            "api/auth/register",
            200,
            data=test_user_data
        )
        
        if success:
            # Verify user is not admin
            user = response.get('user', {})
            is_admin = user.get('is_admin', False)
            if not is_admin:
                self.log_test("User registered without admin privileges", True)
            else:
                self.log_test("User registered without admin privileges", False, "User has admin privileges")
            
            self.token = response.get('access_token')
        
        return success

    def test_admin_login(self):
        """Test admin login with provided credentials"""
        print("\n🔍 Testing Admin Login...")
        
        admin_credentials = {
            "email": "admin@example.com",
            "password": "admin123"
        }
        
        success, response = self.run_test(
            "Admin login",
            "POST",
            "api/auth/login",
            200,
            data=admin_credentials
        )
        
        if success:
            user = response.get('user', {})
            is_admin = user.get('is_admin', False)
            if is_admin:
                self.log_test("Admin user has admin privileges", True)
                self.admin_token = response.get('access_token')
            else:
                self.log_test("Admin user has admin privileges", False, "Admin user does not have admin privileges")
        
        return success

    def test_file_upload_endpoints(self):
        """Test file upload functionality (admin only)"""
        print("\n🔍 Testing File Upload Endpoints...")
        
        if not self.admin_token:
            self.log_test("File upload tests", False, "No admin token available")
            return False

        # Create a dummy PDF file for testing
        pdf_content = b"%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n>>\nendobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000074 00000 n \n0000000120 00000 n \ntrailer\n<<\n/Size 4\n/Root 1 0 R\n>>\nstartxref\n179\n%%EOF"
        
        # Test Papers upload
        files = {'file': ('test_paper.pdf', BytesIO(pdf_content), 'application/pdf')}
        data = {
            'title': 'Test Paper',
            'branch': 'Computer Science',
            'description': 'Test paper description',
            'tags': 'test, paper'
        }
        
        headers = {'Authorization': f'Bearer {self.admin_token}'}
        success, response = self.run_test(
            "Upload paper (admin)",
            "POST",
            "api/papers",
            200,
            data=data,
            files=files,
            headers=headers
        )
        
        # Test Notes upload
        files = {'file': ('test_notes.pdf', BytesIO(pdf_content), 'application/pdf')}
        data = {
            'title': 'Test Notes',
            'branch': 'Computer Science',
            'description': 'Test notes description',
            'tags': 'test, notes'
        }
        
        self.run_test(
            "Upload notes (admin)",
            "POST",
            "api/notes",
            200,
            data=data,
            files=files,
            headers=headers
        )
        
        # Test Syllabus upload
        files = {'file': ('test_syllabus.pdf', BytesIO(pdf_content), 'application/pdf')}
        data = {
            'title': 'Test Syllabus',
            'branch': 'Computer Science',
            'year': '2024',
            'description': 'Test syllabus description',
            'tags': 'test, syllabus'
        }
        
        self.run_test(
            "Upload syllabus (admin)",
            "POST",
            "api/syllabus",
            200,
            data=data,
            files=files,
            headers=headers
        )
        
        return success

    def test_resource_retrieval(self):
        """Test resource retrieval endpoints"""
        print("\n🔍 Testing Resource Retrieval...")
        
        self.run_test("Get papers", "GET", "api/papers", 200)
        self.run_test("Get notes", "GET", "api/notes", 200)
        self.run_test("Get syllabus", "GET", "api/syllabus", 200)
        self.run_test("Get stats", "GET", "api/stats", 200)

    def test_ai_assistant(self):
        """Test AI assistant functionality"""
        print("\n🔍 Testing AI Assistant...")
        
        if not self.token:
            self.log_test("AI Assistant test", False, "No user token available")
            return False

        chat_data = {
            "message": "Explain data structures in computer science",
            "sessionId": "test_session_123"
        }
        
        headers = {'Authorization': f'Bearer {self.token}'}
        success, response = self.run_test(
            "AI Assistant chat",
            "POST",
            "api/ai/chat",
            200,
            data=chat_data,
            headers=headers
        )
        
        if success:
            ai_response = response.get('response', '')
            if ai_response and len(ai_response) > 10:
                self.log_test("AI Assistant provides meaningful response", True)
            else:
                self.log_test("AI Assistant provides meaningful response", False, "Response too short or empty")
        
        return success

    def test_unauthorized_access(self):
        """Test that unauthorized users cannot access protected endpoints"""
        print("\n🔍 Testing Unauthorized Access...")
        
        # Test without token
        old_token = self.token
        self.token = None
        
        self.run_test("Unauthorized paper upload", "POST", "api/papers", 401)
        self.run_test("Unauthorized AI chat", "POST", "api/ai/chat", 401, data={"message": "test"})
        
        # Restore token
        self.token = old_token

    def run_all_tests(self):
        """Run all tests"""
        print("🚀 Starting Educational Platform API Tests...")
        print(f"Testing against: {self.base_url}")
        
        # Basic health checks
        self.test_health_check()
        
        # Authentication tests
        self.test_user_registration()
        self.test_admin_login()
        
        # File upload tests (admin only)
        self.test_file_upload_endpoints()
        
        # Resource retrieval tests
        self.test_resource_retrieval()
        
        # AI assistant tests
        self.test_ai_assistant()
        
        # Security tests
        self.test_unauthorized_access()
        
        # Print summary
        print(f"\n📊 Test Summary:")
        print(f"Tests run: {self.tests_run}")
        print(f"Tests passed: {self.tests_passed}")
        print(f"Success rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        
        return self.tests_passed == self.tests_run

def main():
    # Use the public endpoint from environment
    backend_url = "https://document-manager-fix.preview.emergentagent.com"
    
    tester = EducationalPlatformTester(backend_url)
    success = tester.run_all_tests()
    
    # Save detailed results
    results = {
        "timestamp": datetime.now().isoformat(),
        "backend_url": backend_url,
        "total_tests": tester.tests_run,
        "passed_tests": tester.tests_passed,
        "success_rate": (tester.tests_passed/tester.tests_run)*100 if tester.tests_run > 0 else 0,
        "test_details": tester.test_results
    }
    
    with open('/app/backend_test_results.json', 'w') as f:
        json.dump(results, f, indent=2)
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())