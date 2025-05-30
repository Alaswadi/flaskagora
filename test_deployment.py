#!/usr/bin/env python3
"""
Test script to check if the Flask app is accessible
"""
import requests
import sys
import json
import urllib3

# Disable SSL warnings for self-signed certificates
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

def test_url(url, endpoint=""):
    """Test if a URL is accessible"""
    full_url = f"{url}{endpoint}"
    print(f"\n🔍 Testing: {full_url}")

    try:
        # Disable SSL verification for self-signed certificates
        response = requests.get(full_url, timeout=10, allow_redirects=True, verify=False)
        print(f"✅ Status: {response.status_code}")
        print(f"📍 Final URL: {response.url}")
        print(f"🔒 Is HTTPS: {response.url.startswith('https://')}")

        # Print some headers
        headers_to_check = ['content-type', 'server', 'x-forwarded-proto', 'location']
        for header in headers_to_check:
            if header in response.headers:
                print(f"📋 {header}: {response.headers[header]}")

        # If it's JSON, print it nicely
        if 'application/json' in response.headers.get('content-type', ''):
            try:
                data = response.json()
                print(f"📄 Response: {json.dumps(data, indent=2)}")
            except:
                print(f"📄 Response: {response.text[:200]}...")
        else:
            print(f"📄 Response length: {len(response.text)} characters")
            if response.text:
                print(f"📄 First 100 chars: {response.text[:100]}...")

        return True

    except requests.exceptions.RequestException as e:
        print(f"❌ Error: {e}")
        return False

def main():
    """Main test function"""
    print("🚀 Testing IT Consultation Platform Deployment")
    print("=" * 50)

    # Your Coolify URL
    base_url = "https://qo08ogcgsk8cc88w84w4o8w0.phishsimulator.com"

    # Test different endpoints
    endpoints = [
        "",           # Homepage
        "/health",    # Health check
        "/debug",     # Debug page
        "/room",      # Room page
        "/api/token", # API endpoint
    ]

    results = {}

    for endpoint in endpoints:
        results[endpoint] = test_url(base_url, endpoint)

    print("\n" + "=" * 50)
    print("📊 SUMMARY:")
    for endpoint, success in results.items():
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {base_url}{endpoint}")

    # Overall result
    all_passed = all(results.values())
    if all_passed:
        print("\n🎉 All tests passed! Your deployment is working.")
    else:
        print("\n⚠️  Some tests failed. Check the errors above.")
        sys.exit(1)

if __name__ == "__main__":
    main()
