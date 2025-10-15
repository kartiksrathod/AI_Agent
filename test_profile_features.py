#!/usr/bin/env python3
"""
Test script to verify profile photo upload and password reset functionality
"""

import requests
import json
import os
from io import BytesIO

# Backend URL
BASE_URL = "http://localhost:8001"

def test_admin_login():
    """Test admin login"""
    print("\n1. Testing Admin Login...")
    response = requests.post(
        f"{BASE_URL}/api/auth/login",
        json={
            "email": "admin@example.com",
            "password": "admin123"
        }
    )
    
    if response.status_code == 200:
        data = response.json()
        print("   ✅ Admin login successful")
        print(f"   User: {data['user']['name']}")
        print(f"   Is Admin: {data['user']['is_admin']}")
        return data['access_token'], data['user']['id']
    else:
        print(f"   ❌ Login failed: {response.status_code}")
        print(f"   Error: {response.text}")
        return None, None

def test_profile_photo_upload(token, user_id):
    """Test profile photo upload"""
    print("\n2. Testing Profile Photo Upload...")
    
    # Create a dummy image file (1x1 red pixel PNG)
    png_data = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\x0cIDATx\x9cc\xf8\xcf\xc0\x00\x00\x00\x03\x00\x01\x00\x18\xdd\x8d\xb4\x00\x00\x00\x00IEND\xaeB`\x82'
    
    files = {'file': ('test_photo.png', BytesIO(png_data), 'image/png')}
    headers = {'Authorization': f'Bearer {token}'}
    
    response = requests.post(
        f"{BASE_URL}/api/profile/photo",
        files=files,
        headers=headers
    )
    
    if response.status_code == 200:
        print("   ✅ Profile photo uploaded successfully")
        print(f"   Response: {response.json()}")
        
        # Verify photo can be retrieved
        photo_response = requests.get(
            f"{BASE_URL}/api/profile/photo/{user_id}",
            headers=headers
        )
        
        if photo_response.status_code == 200:
            print("   ✅ Profile photo can be retrieved")
            return True
        else:
            print(f"   ⚠️  Photo uploaded but cannot be retrieved: {photo_response.status_code}")
            return False
    else:
        print(f"   ❌ Photo upload failed: {response.status_code}")
        print(f"   Error: {response.text}")
        return False

def test_password_update(token):
    """Test password update"""
    print("\n3. Testing Password Update...")
    
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }
    
    # Test with correct current password
    response = requests.put(
        f"{BASE_URL}/api/profile/password",
        json={
            "current_password": "admin123",
            "new_password": "newadmin123"
        },
        headers=headers
    )
    
    if response.status_code == 200:
        print("   ✅ Password updated successfully")
        print(f"   Response: {response.json()}")
        
        # Test login with new password
        print("\n4. Testing Login with New Password...")
        login_response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={
                "email": "admin@example.com",
                "password": "newadmin123"
            }
        )
        
        if login_response.status_code == 200:
            print("   ✅ Login with new password successful")
            new_token = login_response.json()['access_token']
            
            # Change password back to original
            print("\n5. Reverting Password to Original...")
            revert_response = requests.put(
                f"{BASE_URL}/api/profile/password",
                json={
                    "current_password": "newadmin123",
                    "new_password": "admin123"
                },
                headers={'Authorization': f'Bearer {new_token}', 'Content-Type': 'application/json'}
            )
            
            if revert_response.status_code == 200:
                print("   ✅ Password reverted to original")
                return True
            else:
                print(f"   ⚠️  Could not revert password: {revert_response.status_code}")
                return False
        else:
            print(f"   ❌ Login with new password failed: {login_response.status_code}")
            return False
    else:
        print(f"   ❌ Password update failed: {response.status_code}")
        print(f"   Error: {response.text}")
        return False

def test_wrong_current_password(token):
    """Test password update with wrong current password"""
    print("\n6. Testing Wrong Current Password (Expected to Fail)...")
    
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }
    
    response = requests.put(
        f"{BASE_URL}/api/profile/password",
        json={
            "current_password": "wrongpassword",
            "new_password": "newpassword123"
        },
        headers=headers
    )
    
    if response.status_code == 400:
        error_detail = response.json().get('detail', '')
        if "incorrect" in error_detail.lower():
            print("   ✅ Correctly rejected wrong current password")
            print(f"   Error message: {error_detail}")
            return True
        else:
            print(f"   ⚠️  Unexpected error message: {error_detail}")
            return False
    else:
        print(f"   ❌ Should have failed with 400, got: {response.status_code}")
        return False

def main():
    print("=" * 70)
    print("PROFILE FEATURES TEST SUITE")
    print("=" * 70)
    
    # Test admin login
    token, user_id = test_admin_login()
    if not token:
        print("\n❌ Cannot proceed without valid login")
        return
    
    # Test profile photo upload
    photo_success = test_profile_photo_upload(token, user_id)
    
    # Test password update
    password_success = test_password_update(token)
    
    # Test wrong password
    wrong_pw_success = test_wrong_current_password(token)
    
    # Summary
    print("\n" + "=" * 70)
    print("TEST SUMMARY")
    print("=" * 70)
    print(f"Profile Photo Upload: {'✅ PASS' if photo_success else '❌ FAIL'}")
    print(f"Password Update: {'✅ PASS' if password_success else '❌ FAIL'}")
    print(f"Wrong Password Validation: {'✅ PASS' if wrong_pw_success else '❌ FAIL'}")
    print("=" * 70)
    
    if photo_success and password_success and wrong_pw_success:
        print("\n🎉 ALL TESTS PASSED!")
    else:
        print("\n⚠️  SOME TESTS FAILED")

if __name__ == "__main__":
    main()
