#!/usr/bin/env python3
"""
Test profile features for regular (non-admin) user
"""

import requests
from io import BytesIO

BASE_URL = "http://localhost:8001"

def test_regular_user():
    print("=" * 70)
    print("TESTING REGULAR USER PROFILE FEATURES")
    print("=" * 70)
    
    # Login as regular user
    print("\n1. Login as Regular User (student@example.com)...")
    response = requests.post(
        f"{BASE_URL}/api/auth/login",
        json={
            "email": "student@example.com",
            "password": "password123"
        }
    )
    
    if response.status_code != 200:
        print(f"   ❌ Login failed: {response.status_code}")
        return False
        
    data = response.json()
    token = data['access_token']
    user_id = data['user']['id']
    print(f"   ✅ Login successful")
    print(f"   User: {data['user']['name']}")
    print(f"   Is Admin: {data['user']['is_admin']}")
    
    # Upload photo
    print("\n2. Upload Profile Photo...")
    png_data = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\x0cIDATx\x9cc\xf8\xcf\xc0\x00\x00\x00\x03\x00\x01\x00\x18\xdd\x8d\xb4\x00\x00\x00\x00IEND\xaeB`\x82'
    files = {'file': ('student_photo.png', BytesIO(png_data), 'image/png')}
    headers = {'Authorization': f'Bearer {token}'}
    
    response = requests.post(
        f"{BASE_URL}/api/profile/photo",
        files=files,
        headers=headers
    )
    
    if response.status_code != 200:
        print(f"   ❌ Photo upload failed: {response.status_code}")
        return False
        
    print("   ✅ Photo uploaded successfully")
    
    # Update password
    print("\n3. Update Password...")
    response = requests.put(
        f"{BASE_URL}/api/profile/password",
        json={
            "current_password": "password123",
            "new_password": "newpass123"
        },
        headers={'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'}
    )
    
    if response.status_code != 200:
        print(f"   ❌ Password update failed: {response.status_code}")
        return False
        
    print("   ✅ Password updated successfully")
    
    # Test new password
    print("\n4. Login with New Password...")
    response = requests.post(
        f"{BASE_URL}/api/auth/login",
        json={
            "email": "student@example.com",
            "password": "newpass123"
        }
    )
    
    if response.status_code != 200:
        print(f"   ❌ Login with new password failed")
        return False
        
    print("   ✅ New password works!")
    new_token = response.json()['access_token']
    
    # Revert password
    print("\n5. Revert Password...")
    response = requests.put(
        f"{BASE_URL}/api/profile/password",
        json={
            "current_password": "newpass123",
            "new_password": "password123"
        },
        headers={'Authorization': f'Bearer {new_token}', 'Content-Type': 'application/json'}
    )
    
    if response.status_code == 200:
        print("   ✅ Password reverted")
    
    print("\n" + "=" * 70)
    print("✅ ALL REGULAR USER TESTS PASSED!")
    print("=" * 70)
    return True

if __name__ == "__main__":
    test_regular_user()
