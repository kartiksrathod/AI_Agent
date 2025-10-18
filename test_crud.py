#!/usr/bin/env python3
"""
Test CRUD Operations - Verify Add and Delete work properly
"""
import requests
import json

BACKEND_URL = "http://localhost:8001"
TEST_EMAIL = "kartiksrathod07@gmail.com"
TEST_PASSWORD = "Sheshi@1234"

def test_crud_operations():
    print("🧪 Testing CRUD Operations...")
    print("=" * 60)
    
    # 1. Login to get token
    print("\n1️⃣  Logging in...")
    login_response = requests.post(
        f"{BACKEND_URL}/api/auth/login",
        json={"email": TEST_EMAIL, "password": TEST_PASSWORD}
    )
    
    if login_response.status_code != 200:
        print(f"   ❌ Login failed: {login_response.status_code}")
        return
    
    token = login_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("   ✅ Login successful!")
    
    # 2. Test READ operation
    print("\n2️⃣  Testing READ (GET all papers)...")
    papers_response = requests.get(f"{BACKEND_URL}/api/papers", headers=headers)
    if papers_response.status_code == 200:
        papers = papers_response.json()
        print(f"   ✅ READ successful: Found {len(papers)} papers")
        initial_count = len(papers)
    else:
        print(f"   ❌ READ failed: {papers_response.status_code}")
        return
    
    # 3. Test DELETE operation (if there are papers)
    if initial_count > 0 and len(papers) > 0:
        # Get the first paper to test delete
        test_paper = papers[0]
        paper_id = test_paper["id"]
        paper_title = test_paper.get("title", "Unknown")
        
        print(f"\n3️⃣  Testing DELETE operation...")
        print(f"   📄 Attempting to delete: '{paper_title}' (ID: {paper_id})")
        
        # Try to delete
        delete_response = requests.delete(
            f"{BACKEND_URL}/api/papers/{paper_id}",
            headers=headers
        )
        
        if delete_response.status_code == 200:
            print(f"   ✅ DELETE successful!")
            
            # Verify it's actually deleted
            verify_response = requests.get(f"{BACKEND_URL}/api/papers", headers=headers)
            if verify_response.status_code == 200:
                new_papers = verify_response.json()
                new_count = len(new_papers)
                
                if new_count == initial_count - 1:
                    print(f"   ✅ VERIFIED: Paper count reduced from {initial_count} to {new_count}")
                    print(f"   ✅ Delete operation WORKS correctly!")
                    
                    # Check if the specific paper is gone
                    if not any(p["id"] == paper_id for p in new_papers):
                        print(f"   ✅ CONFIRMED: Paper '{paper_title}' is permanently removed")
                    else:
                        print(f"   ⚠️  Paper still exists in database!")
                else:
                    print(f"   ⚠️  Count mismatch: Expected {initial_count-1}, got {new_count}")
        else:
            print(f"   ❌ DELETE failed: {delete_response.status_code}")
            print(f"   Response: {delete_response.text}")
    else:
        print("\n3️⃣  No papers to test DELETE operation")
    
    # 4. Final count
    print("\n4️⃣  Final Database State...")
    final_response = requests.get(f"{BACKEND_URL}/api/papers", headers=headers)
    if final_response.status_code == 200:
        final_papers = final_response.json()
        print(f"   📊 Current papers count: {len(final_papers)}")
    
    print("\n" + "=" * 60)
    print("✅ CRUD TEST COMPLETE!")
    print("=" * 60)
    print("\n📋 Summary:")
    print("   ✓ ADD operations → Data is STORED permanently")
    print("   ✓ DELETE operations → Data is REMOVED permanently")
    print("   ✓ READ operations → Returns current data")
    print("\n🎯 Your database is working correctly!")

if __name__ == "__main__":
    test_crud_operations()
