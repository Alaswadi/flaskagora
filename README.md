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

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Run the Application
```bash
python app.py
```

### 3. Access the Application
- Homepage: http://localhost:5000
- Direct room access: http://localhost:5000/room?room=your-room-name

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

## License

This is an MVP/demo application. Modify as needed for your use case.
