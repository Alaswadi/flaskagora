#!/usr/bin/env python3
"""
Start the Flask app in HTTP mode (no SSL)
This is useful for development or when you want to avoid SSL certificate issues
"""
import os
import sys

# Set environment variables for HTTP mode
os.environ['FLASK_ENV'] = 'production'
os.environ['FLASK_APP'] = 'app.py'
os.environ['HOST'] = '0.0.0.0'
os.environ['PORT'] = '5000'
os.environ['FORCE_HTTPS'] = 'false'
os.environ['PREFERRED_URL_SCHEME'] = 'http'

# Import and run the app
if __name__ == '__main__':
    print("🚀 Starting IT Consultation Platform in HTTP mode")
    print("⚠️  Note: Camera access may be limited on HTTP in production browsers")
    print("💡 For full functionality, consider using HTTPS or localhost")
    print("=" * 60)
    
    # Import the app after setting environment variables
    from app import app
    
    # Run the app
    app.run(
        debug=False,
        host='0.0.0.0',
        port=5000,
        use_reloader=False
    )
