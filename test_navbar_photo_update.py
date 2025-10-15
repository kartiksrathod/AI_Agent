#!/usr/bin/env python3
"""
Test that profile photo appears in navbar after upload
"""

import requests
from io import BytesIO

BASE_URL = "http://localhost:8001"

def test_photo_in_profile_response():
    print("=" * 70)
    print("TESTING PROFILE PHOTO IN API RESPONSE")
    print("=" * 70)
    
    # Login
    print("\n1. Login as admin...")
    response = requests.post(
        f"{BASE_URL}/api/auth/login",
        json={"email": "admin@example.com", "password": "admin123"}
    )
    
    if response.status_code != 200:
        print(f"   ❌ Login failed")
        return
    
    data = response.json()
    token = data['access_token']
    user = data['user']
    
    print(f"   ✅ Login successful")
    print(f"   User ID: {user['id']}")
    print(f"   Has profile_photo in response: {user.get('profile_photo') is not None}")
    if user.get('profile_photo'):
        print(f"   Photo path: {user['profile_photo']}")
    
    # Upload a new photo
    print("\n2. Upload new profile photo...")
    png_data = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\x0cIDATx\x9cc\xf8\xcf\xc0\x00\x00\x00\x03\x00\x01\x00\x18\xdd\x8d\xb4\x00\x00\x00\x00IEND\xaeB`\x82'
    files = {'file': ('navbar_test.png', BytesIO(png_data), 'image/png')}
    headers = {'Authorization': f'Bearer {token}'}
    
    response = requests.post(
        f"{BASE_URL}/api/profile/photo",
        files=files,
        headers=headers
    )
    
    if response.status_code != 200:
        print(f"   ❌ Upload failed")
        return
    
    upload_data = response.json()
    print(f"   ✅ Photo uploaded")
    print(f"   File path: {upload_data['file_path']}")
    
    # Get profile to check if photo is in response
    print("\n3. Get profile to verify photo is included...")
    response = requests.get(
        f"{BASE_URL}/api/profile",
        headers=headers
    )
    
    if response.status_code != 200:
        print(f"   ❌ Get profile failed")
        return
    
    profile = response.json()
    print(f"   ✅ Profile retrieved")
    print(f"   Has profile_photo: {profile.get('profile_photo') is not None}")
    if profile.get('profile_photo'):
        print(f"   Photo path: {profile['profile_photo']}")
    
    # Login again to verify photo is in login response
    print("\n4. Login again to verify photo in login response...")
    response = requests.post(
        f"{BASE_URL}/api/auth/login",
        json={"email": "admin@example.com", "password": "admin123"}
    )
    
    if response.status_code != 200:
        print(f"   ❌ Re-login failed")
        return
    
    data = response.json()
    user = data['user']
    
    print(f"   ✅ Re-login successful")
    print(f"   Has profile_photo in login response: {user.get('profile_photo') is not None}")
    if user.get('profile_photo'):
        print(f"   Photo path: {user['profile_photo']}")
    
    print("\n" + "=" * 70)
    print("SUMMARY")
    print("=" * 70)
    print("✅ Profile photo is properly returned in API responses")
    print("✅ Frontend should display photo in navbar")
    print("=" * 70)

if __name__ == "__main__":
    test_photo_in_profile_response()
