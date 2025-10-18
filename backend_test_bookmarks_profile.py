import requests
import sys
import json
import os
from datetime import datetime, timedelta
from io import BytesIO

class BookmarksProfileTester:
    def __init__(self, base_url="https://auth-problems.preview.emergentagent.com"):
        self.base_url = base_url
        self.student_token = None
        self.admin_token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        self.created_resources = {"papers": [], "notes": [], "syllabus": []}

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

        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers)
            elif method == 'POST':
                if files:
                    test_headers.pop('Content-Type', None)
                    response = requests.post(url, data=data, files=files, headers=test_headers)
                else:
                    response = requests.post(url, json=data, headers=test_headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers)
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

    def setup_test_users(self):
        """Setup test users for testing"""
        print("\n🔍 Setting up test users...")
        
        # Login as student
        student_credentials = {
            "email": "student@example.com",
            "password": "password123"
        }
        
        success, response = self.run_test(
            "Student login",
            "POST",
            "api/auth/login",
            200,
            data=student_credentials
        )
        
        if success:
            self.student_token = response.get('access_token')
        
        # Login as admin
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
            self.admin_token = response.get('access_token')

    def create_test_resources(self):
        """Create test resources for bookmark testing"""
        print("\n🔍 Creating test resources...")
        
        if not self.admin_token:
            self.log_test("Create test resources", False, "No admin token available")
            return False

        pdf_content = b"%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n>>\nendobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000074 00000 n \n0000000120 00000 n \ntrailer\n<<\n/Size 4\n/Root 1 0 R\n>>\nstartxref\n179\n%%EOF"
        
        headers = {'Authorization': f'Bearer {self.admin_token}'}
        
        # Create test paper
        files = {'file': ('test_paper.pdf', BytesIO(pdf_content), 'application/pdf')}
        data = {
            'title': 'Data Structures and Algorithms',
            'branch': 'Computer Science',
            'description': 'Comprehensive guide to DSA',
            'tags': 'algorithms, data-structures'
        }
        
        success, response = self.run_test(
            "Create test paper",
            "POST",
            "api/papers",
            200,
            data=data,
            files=files,
            headers=headers
        )
        
        if success:
            self.created_resources["papers"].append(response.get('id'))
        
        # Create test note
        files = {'file': ('test_notes.pdf', BytesIO(pdf_content), 'application/pdf')}
        data = {
            'title': 'Machine Learning Notes',
            'branch': 'Computer Science',
            'description': 'ML fundamentals and algorithms',
            'tags': 'machine-learning, ai'
        }
        
        success, response = self.run_test(
            "Create test note",
            "POST",
            "api/notes",
            200,
            data=data,
            files=files,
            headers=headers
        )
        
        if success:
            self.created_resources["notes"].append(response.get('id'))
        
        # Create test syllabus
        files = {'file': ('test_syllabus.pdf', BytesIO(pdf_content), 'application/pdf')}
        data = {
            'title': 'CS Curriculum 2024',
            'branch': 'Computer Science',
            'year': '1st Year',
            'description': 'Complete CS curriculum',
            'tags': 'syllabus, curriculum'
        }
        
        success, response = self.run_test(
            "Create test syllabus",
            "POST",
            "api/syllabus",
            200,
            data=data,
            files=files,
            headers=headers
        )
        
        if success:
            self.created_resources["syllabus"].append(response.get('id'))

    def test_bookmark_functionality(self):
        """Test bookmark CRUD operations"""
        print("\n🔍 Testing Bookmark Functionality...")
        
        if not self.student_token:
            self.log_test("Bookmark tests", False, "No student token available")
            return False

        headers = {'Authorization': f'Bearer {self.student_token}'}
        
        # Test creating bookmarks
        if self.created_resources["papers"]:
            paper_id = self.created_resources["papers"][0]
            bookmark_data = {
                "resource_type": "paper",
                "resource_id": paper_id,
                "category": "Study Materials"
            }
            
            success, response = self.run_test(
                "Create paper bookmark",
                "POST",
                "api/bookmarks",
                200,
                data=bookmark_data,
                headers=headers
            )
        
        if self.created_resources["notes"]:
            note_id = self.created_resources["notes"][0]
            bookmark_data = {
                "resource_type": "note",
                "resource_id": note_id,
                "category": "Reference"
            }
            
            self.run_test(
                "Create note bookmark",
                "POST",
                "api/bookmarks",
                200,
                data=bookmark_data,
                headers=headers
            )
        
        if self.created_resources["syllabus"]:
            syllabus_id = self.created_resources["syllabus"][0]
            bookmark_data = {
                "resource_type": "syllabus",
                "resource_id": syllabus_id,
                "category": "Curriculum"
            }
            
            self.run_test(
                "Create syllabus bookmark",
                "POST",
                "api/bookmarks",
                200,
                data=bookmark_data,
                headers=headers
            )
        
        # Test getting bookmarks
        success, response = self.run_test(
            "Get user bookmarks",
            "GET",
            "api/bookmarks",
            200,
            headers=headers
        )
        
        if success:
            bookmarks = response
            if len(bookmarks) >= 3:
                self.log_test("Bookmarks retrieved successfully", True, f"Found {len(bookmarks)} bookmarks")
            else:
                self.log_test("Bookmarks retrieved successfully", False, f"Expected 3+ bookmarks, got {len(bookmarks)}")
        
        # Test checking bookmark status
        if self.created_resources["papers"]:
            paper_id = self.created_resources["papers"][0]
            success, response = self.run_test(
                "Check bookmark status",
                "GET",
                f"api/bookmarks/check/paper/{paper_id}",
                200,
                headers=headers
            )
            
            if success and response.get('bookmarked'):
                self.log_test("Bookmark status check works", True)
            else:
                self.log_test("Bookmark status check works", False, "Bookmark not found or status incorrect")
        
        # Test removing bookmark
        if self.created_resources["papers"]:
            paper_id = self.created_resources["papers"][0]
            self.run_test(
                "Remove paper bookmark",
                "DELETE",
                f"api/bookmarks/paper/{paper_id}",
                200,
                headers=headers
            )

    def test_profile_functionality(self):
        """Test profile management features"""
        print("\n🔍 Testing Profile Functionality...")
        
        if not self.student_token:
            self.log_test("Profile tests", False, "No student token available")
            return False

        headers = {'Authorization': f'Bearer {self.student_token}'}
        
        # Test getting profile
        success, response = self.run_test(
            "Get user profile",
            "GET",
            "api/profile",
            200,
            headers=headers
        )
        
        if success:
            user_profile = response
            if user_profile.get('name') and user_profile.get('email'):
                self.log_test("Profile contains required fields", True)
            else:
                self.log_test("Profile contains required fields", False, "Missing name or email")
        
        # Test updating profile name
        profile_update = {
            "name": "Updated Student Name"
        }
        
        self.run_test(
            "Update profile name",
            "PUT",
            "api/profile",
            200,
            data=profile_update,
            headers=headers
        )
        
        # Test password update
        password_update = {
            "current_password": "password123",
            "new_password": "newpassword123"
        }
        
        self.run_test(
            "Update password",
            "PUT",
            "api/profile/password",
            200,
            data=password_update,
            headers=headers
        )

    def test_achievements_functionality(self):
        """Test achievements system"""
        print("\n🔍 Testing Achievements Functionality...")
        
        if not self.student_token:
            self.log_test("Achievements tests", False, "No student token available")
            return False

        headers = {'Authorization': f'Bearer {self.student_token}'}
        
        # Test getting achievements
        success, response = self.run_test(
            "Get user achievements",
            "GET",
            "api/achievements",
            200,
            headers=headers
        )
        
        if success:
            achievements = response
            self.log_test("Achievements endpoint works", True, f"Found {len(achievements)} achievements")
            
            # Check if user has bookmark-related achievements
            bookmark_achievements = [a for a in achievements if 'bookmark' in a.get('name', '').lower()]
            if bookmark_achievements:
                self.log_test("Bookmark achievements awarded", True, f"Found {len(bookmark_achievements)} bookmark achievements")
            else:
                self.log_test("Bookmark achievements awarded", False, "No bookmark achievements found")

    def test_learning_goals_functionality(self):
        """Test learning goals CRUD operations"""
        print("\n🔍 Testing Learning Goals Functionality...")
        
        if not self.student_token:
            self.log_test("Learning goals tests", False, "No student token available")
            return False

        headers = {'Authorization': f'Bearer {self.student_token}'}
        
        # Test creating learning goal
        goal_data = {
            "title": "Master React Development",
            "description": "Learn React hooks, context, and advanced patterns",
            "target_date": (datetime.now() + timedelta(days=90)).isoformat()
        }
        
        success, response = self.run_test(
            "Create learning goal",
            "POST",
            "api/learning-goals",
            200,
            data=goal_data,
            headers=headers
        )
        
        goal_id = None
        if success:
            goal_id = response.get('id')
        
        # Test getting learning goals
        success, response = self.run_test(
            "Get learning goals",
            "GET",
            "api/learning-goals",
            200,
            headers=headers
        )
        
        if success:
            goals = response
            if len(goals) >= 1:
                self.log_test("Learning goals retrieved", True, f"Found {len(goals)} goals")
            else:
                self.log_test("Learning goals retrieved", False, "No goals found")
        
        # Test updating goal progress
        if goal_id:
            progress_update = {
                "progress": 25
            }
            
            self.run_test(
                "Update goal progress",
                "PUT",
                f"api/learning-goals/{goal_id}",
                200,
                data=progress_update,
                headers=headers
            )
            
            # Test completing goal
            completion_update = {
                "progress": 100,
                "completed": True
            }
            
            self.run_test(
                "Complete learning goal",
                "PUT",
                f"api/learning-goals/{goal_id}",
                200,
                data=completion_update,
                headers=headers
            )

    def run_all_tests(self):
        """Run all bookmark and profile tests"""
        print("🚀 Starting Bookmarks & Profile API Tests...")
        print(f"Testing against: {self.base_url}")
        
        # Setup
        self.setup_test_users()
        self.create_test_resources()
        
        # Test bookmark functionality
        self.test_bookmark_functionality()
        
        # Test profile functionality
        self.test_profile_functionality()
        
        # Test achievements
        self.test_achievements_functionality()
        
        # Test learning goals
        self.test_learning_goals_functionality()
        
        # Print summary
        print(f"\n📊 Test Summary:")
        print(f"Tests run: {self.tests_run}")
        print(f"Tests passed: {self.tests_passed}")
        print(f"Success rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        
        return self.tests_passed == self.tests_run

def main():
    backend_url = "https://auth-problems.preview.emergentagent.com"
    
    tester = BookmarksProfileTester(backend_url)
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
    
    with open('/app/backend_test_bookmarks_results.json', 'w') as f:
        json.dump(results, f, indent=2)
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())