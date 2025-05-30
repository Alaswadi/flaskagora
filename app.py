from flask import Flask, render_template, request, jsonify
import time
import random
import string

app = Flask(__name__)

# Agora.io Configuration
try:
    # Try to import from config.py file
    from config import AGORA_APP_ID, AGORA_APP_CERTIFICATE, TOKEN_EXPIRATION_TIME
    AGORA_CONFIG = {
        'APP_ID': AGORA_APP_ID,
        'APP_CERTIFICATE': AGORA_APP_CERTIFICATE,
        'TOKEN_EXPIRATION_TIME': TOKEN_EXPIRATION_TIME
    }
    print("✅ Loaded Agora configuration from config.py")
except ImportError:
    # Fallback to placeholder values
    AGORA_CONFIG = {
        'APP_ID': 'f3657d780c174dd2a7f9f7394548feee',  # Your actual App ID
        'APP_CERTIFICATE': '3925aa83f68c4c80b333a7b5ef5c0a87',  # Your actual Primary Certificate
        'TOKEN_EXPIRATION_TIME': 3600  # Token expires in 1 hour
    }
    print("⚠️  Using placeholder Agora configuration. Create config.py with your credentials.")

@app.route('/')
def index():
    """Homepage - Welcome to IT Consultation Platform"""
    return render_template('index.html')

@app.route('/room')
def room():
    """Consultation Room - Video call interface"""
    # Get room name from query parameter, default to 'test-room'
    room_name = request.args.get('room', 'test-room')
    return render_template('room.html', room_name=room_name)

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
    app.run(debug=True, host='0.0.0.0', port=5000)
