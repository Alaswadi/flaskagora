from flask import Flask, render_template, request, jsonify
from werkzeug.middleware.proxy_fix import ProxyFix
import time
import random
import string
import os

app = Flask(__name__)

# Configure ProxyFix for Coolify/Traefik proxy
# This tells Flask to trust proxy headers for HTTPS detection
app.wsgi_app = ProxyFix(
    app.wsgi_app,
    x_for=1,      # Trust X-Forwarded-For
    x_proto=1,    # Trust X-Forwarded-Proto (for HTTPS detection)
    x_host=1,     # Trust X-Forwarded-Host
    x_prefix=1    # Trust X-Forwarded-Prefix
)

# Agora.io Configuration
def load_agora_config():
    """Load Agora configuration from environment variables, config.py, or defaults"""

    # Priority 1: Environment variables (Docker/production)
    if os.getenv('AGORA_APP_ID'):
        config = {
            'APP_ID': os.getenv('AGORA_APP_ID'),
            'APP_CERTIFICATE': os.getenv('AGORA_APP_CERTIFICATE'),
            'TOKEN_EXPIRATION_TIME': int(os.getenv('TOKEN_EXPIRATION_TIME', 3600))
        }
        print("✅ Loaded Agora configuration from environment variables")
        return config

    # Priority 2: config.py file (local development)
    try:
        from config import AGORA_APP_ID, AGORA_APP_CERTIFICATE, TOKEN_EXPIRATION_TIME
        config = {
            'APP_ID': AGORA_APP_ID,
            'APP_CERTIFICATE': AGORA_APP_CERTIFICATE,
            'TOKEN_EXPIRATION_TIME': TOKEN_EXPIRATION_TIME
        }
        print("✅ Loaded Agora configuration from config.py")
        return config
    except ImportError:
        pass

    # Priority 3: Fallback to hardcoded values
    config = {
        'APP_ID': 'f3657d780c174dd2a7f9f7394548feee',  # Your actual App ID
        'APP_CERTIFICATE': '3925aa83f68c4c80b333a7b5ef5c0a87',  # Your actual Primary Certificate
        'TOKEN_EXPIRATION_TIME': 3600  # Token expires in 1 hour
    }
    print("⚠️  Using hardcoded Agora configuration. Set environment variables or create config.py")
    return config

AGORA_CONFIG = load_agora_config()

@app.route('/')
def index():
    """Homepage - Welcome to IT Consultation Platform"""
    return render_template('index.html')

@app.route('/health')
def health():
    """Health check endpoint for Coolify"""
    return jsonify({
        'status': 'healthy',
        'service': 'IT Consultation Platform',
        'version': '1.0.0',
        'proxy_headers': {
            'X-Forwarded-Proto': request.headers.get('X-Forwarded-Proto'),
            'X-Forwarded-Host': request.headers.get('X-Forwarded-Host'),
            'Host': request.headers.get('Host')
        },
        'is_secure': request.is_secure,
        'url': request.url
    })

@app.route('/room')
def room():
    """Consultation Room - Video call interface"""
    # Get room name from query parameter, default to 'test-room'
    room_name = request.args.get('room', 'test-room')
    return render_template('room.html', room_name=room_name)

@app.route('/debug')
def debug():
    """Debug page to check browser and deployment status"""
    import platform
    import sys

    debug_info = {
        'server': {
            'python_version': sys.version,
            'platform': platform.platform(),
            'agora_config': {
                'app_id': AGORA_CONFIG['APP_ID'],
                'has_certificate': bool(AGORA_CONFIG['APP_CERTIFICATE']),
                'token_expiration': AGORA_CONFIG['TOKEN_EXPIRATION_TIME']
            }
        },
        'request': {
            'url': request.url,
            'protocol': request.scheme,
            'host': request.host,
            'user_agent': request.headers.get('User-Agent', 'Unknown'),
            'is_secure': request.is_secure,
            'proxy_headers': {
                'X-Forwarded-Proto': request.headers.get('X-Forwarded-Proto'),
                'X-Forwarded-Host': request.headers.get('X-Forwarded-Host'),
                'X-Forwarded-For': request.headers.get('X-Forwarded-For'),
                'X-Real-IP': request.headers.get('X-Real-IP'),
                'Host': request.headers.get('Host')
            }
        },
        'coolify_env': {
            'COOLIFY_URL': os.getenv('COOLIFY_URL'),
            'COOLIFY_FQDN': os.getenv('COOLIFY_FQDN'),
            'FLASK_ENV': os.getenv('FLASK_ENV')
        }
    }

    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <title>Debug Information</title>
        <style>
            body {{ font-family: Arial, sans-serif; margin: 20px; }}
            .section {{ margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }}
            .good {{ background-color: #d4edda; border-color: #c3e6cb; }}
            .warning {{ background-color: #fff3cd; border-color: #ffeaa7; }}
            .error {{ background-color: #f8d7da; border-color: #f5c6cb; }}
            pre {{ background: #f8f9fa; padding: 10px; border-radius: 3px; overflow-x: auto; }}
        </style>
    </head>
    <body>
        <h1>🔍 IT Consultation Platform - Debug Information</h1>

        <div class="section {'good' if request.is_secure else 'error'}">
            <h2>🔒 Security Status</h2>
            <p><strong>Protocol:</strong> {request.scheme.upper()}</p>
            <p><strong>Is Secure (HTTPS):</strong> {'✅ Yes' if request.is_secure else '❌ No - Camera access will fail!'}</p>
            <p><strong>URL:</strong> {request.url}</p>
            {'<p style="color: green;">✅ HTTPS is enabled - camera access should work</p>' if request.is_secure else '<p style="color: red;">❌ HTTPS required for camera access in production!</p>'}
        </div>

        <div class="section">
            <h2>🌐 Browser Test</h2>
            <p>Click the button below to test camera access:</p>
            <button onclick="testCamera()" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">
                Test Camera Access
            </button>
            <div id="camera-result" style="margin-top: 10px;"></div>
        </div>

        <div class="section">
            <h2>⚙️ Server Configuration</h2>
            <pre>{debug_info}</pre>
        </div>

        <div class="section">
            <h2>🚀 Quick Actions</h2>
            <a href="/" style="display: inline-block; padding: 10px 20px; background: #28a745; color: white; text-decoration: none; border-radius: 5px; margin-right: 10px;">
                Go to Homepage
            </a>
            <a href="/room?room=debug-test" style="display: inline-block; padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 5px;">
                Test Video Room
            </a>
        </div>

        <script>
            async function testCamera() {{
                const resultDiv = document.getElementById('camera-result');
                resultDiv.innerHTML = '<p>Testing camera access...</p>';

                try {{
                    console.log('Testing camera access...');
                    console.log('Navigator.mediaDevices:', !!navigator.mediaDevices);
                    console.log('Protocol:', location.protocol);

                    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {{
                        throw new Error('Browser does not support camera access API');
                    }}

                    const stream = await navigator.mediaDevices.getUserMedia({{
                        video: true,
                        audio: true
                    }});

                    // Stop the stream immediately
                    stream.getTracks().forEach(track => track.stop());

                    resultDiv.innerHTML = '<p style="color: green;">✅ Camera access successful! Video calls should work.</p>';

                }} catch (error) {{
                    console.error('Camera test failed:', error);
                    resultDiv.innerHTML = `
                        <p style="color: red;">❌ Camera access failed:</p>
                        <p><strong>Error:</strong> ${{error.message}}</p>
                        <p><strong>Protocol:</strong> ${{location.protocol}}</p>
                        <p><strong>Browser:</strong> ${{navigator.userAgent}}</p>
                    `;
                }}
            }}
        </script>
    </body>
    </html>
    """

@app.route('/api/token')
def get_token():
    """
    Generate Agora RTC token for channel access
    """
    try:
        # Get parameters
        channel_name = request.args.get('channel', 'test-room')
        uid = request.args.get('uid', '0')  # Use 0 for auto-generated UID
        role = request.args.get('role', '1')  # 1 = Host, 2 = Audience

        # For development/testing, we'll use null token (less secure)
        # In production, uncomment the token generation code below

        # Try to generate token if agora-token-builder is available
        token = None
        try:
            from agora_token_builder import RtcTokenBuilder
            from agora_token_builder.AccessToken import kJoinChannel

            # Calculate expiration time
            expiration_time_in_seconds = AGORA_CONFIG['TOKEN_EXPIRATION_TIME']
            current_timestamp = int(time.time())
            privilege_expired_ts = current_timestamp + expiration_time_in_seconds

            # Generate token
            token = RtcTokenBuilder.buildTokenWithUid(
                AGORA_CONFIG['APP_ID'],
                AGORA_CONFIG['APP_CERTIFICATE'],
                channel_name,
                int(uid),
                1,  # Role: 1 = Host/Publisher, 2 = Audience
                privilege_expired_ts
            )
            print(f"Generated token for channel: {channel_name}, UID: {uid}")

        except ImportError:
            print("agora-token-builder not installed, using null token for development")
            token = None
        except Exception as e:
            print(f"Error generating token: {e}")
            token = None

        return jsonify({
            'success': True,
            'token': token,
            'appId': AGORA_CONFIG['APP_ID'],
            'channel': channel_name,
            'uid': uid,
            'expiration': AGORA_CONFIG['TOKEN_EXPIRATION_TIME']
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'appId': AGORA_CONFIG['APP_ID'],
            'channel': request.args.get('channel', 'test-room')
        }), 500

if __name__ == '__main__':
    # Configuration for Docker and production
    debug_mode = os.getenv('FLASK_ENV', 'development') == 'development'
    host = os.getenv('HOST', '0.0.0.0')
    port = int(os.getenv('PORT', 5000))

    print("=" * 60)
    print("🚀 IT CONSULTATION PLATFORM - STARTING UP")
    print("=" * 60)
    print(f"📍 Host: {host}")
    print(f"🔌 Port: {port}")
    print(f"📊 Debug mode: {debug_mode}")
    print(f"🔑 Agora App ID: {AGORA_CONFIG['APP_ID']}")
    print(f"🔐 Has Certificate: {bool(AGORA_CONFIG['APP_CERTIFICATE'])}")
    print(f"🌍 Environment: {os.getenv('FLASK_ENV', 'development')}")
    print(f"🐳 Container: {os.getenv('COOLIFY_CONTAINER_NAME', 'local')}")
    print(f"🌐 URL: {os.getenv('COOLIFY_URL', f'http://{host}:{port}')}")
    print("=" * 60)

    try:
        app.run(debug=debug_mode, host=host, port=port)
    except Exception as e:
        print(f"❌ STARTUP ERROR: {e}")
        import traceback
        traceback.print_exc()
        raise
