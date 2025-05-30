# IT Consultation Platform MVP

A simple Flask web application for video consultation rooms using Agora.io SDK.

## Project Structure

```
flaskagora/
├── app.py                 # Main Flask application
├── templates/
│   ├── index.html        # Homepage
│   └── room.html         # Consultation room page
├── static/
│   ├── style.css         # Basic styling
│   └── agora-logic.js    # Agora.io integration logic (commented)
├── requirements.txt      # Python dependencies
└── README.md            # This file
```

## Features

### Current Implementation
- ✅ Flask backend with routing
- ✅ Homepage with room creation/joining
- ✅ Room page with video call interface
- ✅ Basic UI with placeholders for video streams
- ✅ Structured JavaScript for Agora integration
- ✅ Responsive design

### Ready for Agora Integration
- 🔄 Commented Agora SDK integration points
- 🔄 Event handlers for call controls
- 🔄 Placeholder functions for video/audio management
- 🔄 UI elements for local and remote video streams

## Quick Start

### Option 1: Docker (Recommended)

#### Prerequisites
- Docker and Docker Compose installed

#### Steps
```bash
# 1. Clone or download the project
git clone <repository-url>
cd flaskagora

# 2. Create environment file (optional)
cp .env.example .env
# Edit .env with your Agora credentials if needed

# 3. Build and run with Docker Compose
docker-compose up --build

# 4. Access the application
# - Homepage: http://localhost:5000
# - Direct room: http://localhost:5000/room?room=your-room-name
```

#### Production Deployment with Nginx
```bash
# Run with nginx reverse proxy
docker-compose --profile production up --build
```

### Option 2: Local Development

#### Prerequisites
- Python 3.12+
- pip

#### Steps
```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Run the application
python app.py

# 3. Access the application
# - Homepage: http://localhost:5000
# - Direct room: http://localhost:5000/room?room=your-room-name
```

## Next Steps for Agora Integration

### 1. Get Agora Credentials
1. Sign up at [Agora.io](https://www.agora.io/)
2. Create a new project
3. Get your App ID from the project dashboard

### 2. Include Agora SDK
Uncomment this line in `templates/room.html`:
```html
<script src="https://download.agora.io/sdk/release/AgoraRTC_N-4.19.0.js"></script>
```

### 3. Configure Agora Settings
Update `static/agora-logic.js`:
```javascript
const AGORA_CONFIG = {
    appId: 'your-actual-agora-app-id',
    token: null, // or generate tokens server-side for production
    channel: null, // Will be set to room name
    uid: null // Will be auto-generated
};
```

### 4. Uncomment Agora Functions
In `static/agora-logic.js`, uncomment the TODO sections to enable:
- Client initialization
- Channel joining/leaving
- Local video/audio publishing
- Remote stream subscription
- Camera/microphone controls

### 5. Test the Integration
1. Open two browser windows/tabs
2. Join the same room name
3. Test video/audio functionality

## API Endpoints

- `GET /` - Homepage
- `GET /room?room=<room_name>` - Join consultation room
- `GET /api/token` - Placeholder for token generation (future)

## Development Notes

### Security Considerations for Production
- Implement proper token generation server-side
- Add user authentication
- Use HTTPS for video calls
- Implement room access controls

### Potential Enhancements
- User authentication system
- Room scheduling
- Chat functionality
- Screen sharing
- Recording capabilities
- File sharing during consultations

## Troubleshooting

### Common Issues
1. **Port already in use**: Change the port in `app.py`
2. **Static files not loading**: Check Flask static folder configuration
3. **Agora connection issues**: Verify App ID and network connectivity

### Browser Console
Check browser developer console for JavaScript errors and Agora SDK logs.

## Docker Commands

### Development
```bash
# Build and run
docker-compose up --build

# Run in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild after code changes
docker-compose up --build
```

### Production
```bash
# Run with nginx reverse proxy
docker-compose --profile production up -d

# Scale the application (multiple instances)
docker-compose up --scale flaskagora=3 -d
```

### Environment Variables

You can configure the application using environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `AGORA_APP_ID` | Your Agora.io App ID | Required |
| `AGORA_APP_CERTIFICATE` | Your Agora.io Primary Certificate | Required |
| `TOKEN_EXPIRATION_TIME` | Token expiration in seconds | 3600 |
| `FLASK_ENV` | Flask environment (development/production) | production |
| `HOST` | Host to bind to | 0.0.0.0 |
| `PORT` | Port to bind to | 5000 |

### Multi-User Access

#### Local Network Access
Your application will be accessible to other devices on your network at:
```
http://YOUR_LOCAL_IP:5000
```

#### Internet Access
For internet access, deploy to:
- **Cloud platforms**: AWS, Google Cloud, DigitalOcean
- **Container platforms**: Railway, Render, Fly.io
- **Traditional hosting**: VPS with Docker

#### Quick Internet Access with ngrok
```bash
# Install ngrok, then:
ngrok http 5000
# Share the generated URL: https://abc123.ngrok.io
```

## Deployment Examples

### Deploy to Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

### Deploy to DigitalOcean App Platform
1. Push code to GitHub
2. Connect GitHub repo to DigitalOcean App Platform
3. Set environment variables in the dashboard
4. Deploy automatically

### Deploy to AWS ECS
```bash
# Build and push to ECR
docker build -t it-consultation-platform .
docker tag it-consultation-platform:latest YOUR_ECR_URI
docker push YOUR_ECR_URI
```

## License

This is an MVP/demo application. Modify as needed for your use case.
