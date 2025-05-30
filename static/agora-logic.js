/**
 * Agora.io Integration Logic for IT Consultation Platform
 *
 * This file contains the structure and commented placeholders for integrating
 * Agora.io RTC SDK for video/audio calls in consultation rooms.
 *
 * To implement Agora functionality:
 * 1. Include the Agora RTC SDK in room.html
 * 2. Replace the placeholder values with your actual Agora App ID and tokens
 * 3. Uncomment and implement the functions below
 * 4. Test with actual Agora credentials
 */

// Agora Configuration - Will be loaded from backend
const AGORA_CONFIG = {
    appId: null,        // Will be fetched from backend
    token: null,        // Will be fetched from backend
    channel: null,      // Will be set to room name
    uid: null          // Will be generated automatically
};

// Global variables for Agora client and tracks
let agoraClient = null;
let localAudioTrack = null;
let localVideoTrack = null;
let remoteUsers = {};

/**
 * Fetch Agora token and configuration from backend
 */
async function fetchAgoraConfig(channelName) {
    try {
        const response = await fetch(`/api/token?channel=${encodeURIComponent(channelName)}&uid=0`);
        const data = await response.json();

        if (data.success) {
            AGORA_CONFIG.appId = data.appId;
            AGORA_CONFIG.token = data.token;
            AGORA_CONFIG.channel = data.channel;
            AGORA_CONFIG.uid = parseInt(data.uid) || null;

            console.log('Agora config loaded:', {
                appId: AGORA_CONFIG.appId,
                channel: AGORA_CONFIG.channel,
                hasToken: !!AGORA_CONFIG.token
            });

            return true;
        } else {
            console.error('Failed to fetch Agora config:', data.error);
            return false;
        }
    } catch (error) {
        console.error('Error fetching Agora config:', error);
        return false;
    }
}

/**
 * Initialize Agora RTC Client
 * Call this function when the room page loads
 */
async function initializeAgora(roomName) {
    try {
        console.log('Initializing Agora for room:', roomName);

        // Check browser support first
        updateConnectionStatus('Checking browser compatibility...');
        await checkBrowserSupport();

        // Fetch Agora configuration from backend
        updateConnectionStatus('Loading configuration...');
        const configLoaded = await fetchAgoraConfig(roomName);

        if (!configLoaded) {
            updateConnectionStatus('Failed to load configuration');
            return;
        }

        // Check if Agora SDK is available with retry logic
        let retries = 0;
        const maxRetries = 10;

        while (typeof AgoraRTC === 'undefined' && retries < maxRetries) {
            console.log(`Waiting for Agora SDK... (${retries + 1}/${maxRetries})`);
            updateConnectionStatus(`Loading Agora SDK... (${retries + 1}/${maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, 500));
            retries++;
        }

        if (typeof AgoraRTC === 'undefined') {
            const errorMsg = 'Agora RTC SDK failed to load. Please check your internet connection and refresh the page.';
            console.error(errorMsg);
            updateConnectionStatus('Agora SDK not loaded');
            throw new Error(errorMsg);
        }

        // Log Agora SDK version
        console.log('Agora RTC SDK version:', AgoraRTC.VERSION);
        console.log('Agora RTC SDK build:', AgoraRTC.BUILD);

        // Create Agora client
        agoraClient = AgoraRTC.createClient({
            mode: "rtc",
            codec: "vp8"
        });

        // Set up event listeners
        setupAgoraEventListeners();

        // Update UI
        document.getElementById('channel-name').textContent = AGORA_CONFIG.channel;
        document.getElementById('app-id').textContent = AGORA_CONFIG.appId;
        document.getElementById('agora-info').style.display = 'block';

        updateConnectionStatus('Ready to connect');
        console.log('Agora client initialized successfully');

    } catch (error) {
        console.error('Error initializing Agora:', error);
        updateConnectionStatus('Initialization failed: ' + error.message);

        // Show error in local video container
        const localVideoDiv = document.getElementById('local-video');
        localVideoDiv.innerHTML = `
            <p style="color: #721c24; font-weight: bold;">Initialization Failed</p>
            <p style="color: #721c24;">${error.message}</p>
            <button onclick="location.reload()" style="margin-top: 10px; padding: 5px 10px; background: #007bff; color: white; border: none; border-radius: 3px; cursor: pointer;">Reload Page</button>
        `;
        localVideoDiv.style.backgroundColor = '#f8d7da';
        localVideoDiv.style.padding = '20px';
        localVideoDiv.style.textAlign = 'center';
    }
}

/**
 * Set up Agora event listeners
 */
function setupAgoraEventListeners() {
    // Listen for remote users joining
    agoraClient.on("user-published", async (user, mediaType) => {
        console.log('Remote user published:', user.uid, mediaType);

        // Subscribe to the remote user
        await agoraClient.subscribe(user, mediaType);

        if (mediaType === "video") {
            // Display remote video
            const remoteVideoTrack = user.videoTrack;
            const remotePlayerContainer = createRemoteVideoContainer(user.uid);
            remoteVideoTrack.play(remotePlayerContainer);
        }

        if (mediaType === "audio") {
            // Play remote audio
            const remoteAudioTrack = user.audioTrack;
            remoteAudioTrack.play();
        }

        // Update participant count
        updateParticipantCount();
    });

    // Listen for remote users leaving
    agoraClient.on("user-unpublished", (user, mediaType) => {
        console.log('Remote user unpublished:', user.uid, mediaType);

        if (mediaType === "video") {
            // Remove remote video container
            removeRemoteVideoContainer(user.uid);
        }

        // Update participant count
        updateParticipantCount();
    });

    // Listen for connection state changes
    agoraClient.on("connection-state-change", (curState, revState) => {
        console.log('Connection state changed:', curState, revState);
        updateConnectionStatus(curState);
    });
}

/**
 * Join the Agora channel
 */
async function joinChannel() {
    try {
        console.log('=== STARTING JOIN CHANNEL PROCESS ===');
        console.log('Channel:', AGORA_CONFIG.channel);
        console.log('App ID:', AGORA_CONFIG.appId);
        console.log('Token available:', !!AGORA_CONFIG.token);

        if (!agoraClient) {
            throw new Error('Agora client not initialized');
        }

        // Debug: Check local video element
        const localVideoDiv = document.getElementById('local-video');
        console.log('Local video element:', localVideoDiv);
        console.log('Local video element dimensions:', {
            width: localVideoDiv.offsetWidth,
            height: localVideoDiv.offsetHeight,
            display: getComputedStyle(localVideoDiv).display
        });

        // Join the channel
        console.log('Joining Agora channel...');
        const uid = await agoraClient.join(
            AGORA_CONFIG.appId,
            AGORA_CONFIG.channel,
            AGORA_CONFIG.token,
            AGORA_CONFIG.uid
        );

        console.log('✅ Successfully joined channel with UID:', uid);

        // Create and publish local tracks
        console.log('Creating local tracks...');
        await createAndPublishLocalTracks();

        // Update UI
        updateConnectionStatus('Connected');
        document.getElementById('join-call').textContent = 'Connected';
        document.getElementById('join-call').disabled = true;

        // Update participant count
        updateParticipantCount();

        console.log('=== JOIN CHANNEL PROCESS COMPLETED ===');

    } catch (error) {
        console.error('❌ Error joining channel:', error);
        console.error('Error details:', {
            name: error.name,
            message: error.message,
            code: error.code,
            stack: error.stack
        });
        updateConnectionStatus('Connection failed: ' + error.message);
        document.getElementById('join-call').textContent = 'Join Call';
        document.getElementById('join-call').disabled = false;
    }
}

/**
 * Create and publish local audio/video tracks
 */
async function createAndPublishLocalTracks() {
    try {
        console.log('Creating local tracks...');
        updateConnectionStatus('Requesting camera and microphone access...');

        // Create local tracks with basic settings
        console.log('Creating microphone track...');
        localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();

        console.log('Creating camera track...');
        localVideoTrack = await AgoraRTC.createCameraVideoTrack();

        console.log('Local tracks created successfully');

        // Prepare the local video container
        const localVideoDiv = document.getElementById('local-video');
        console.log('Local video container before clearing:', localVideoDiv.innerHTML);

        // Clear and prepare container
        localVideoDiv.innerHTML = '';
        localVideoDiv.style.backgroundColor = 'transparent';
        localVideoDiv.style.position = 'relative';
        localVideoDiv.style.width = '100%';
        localVideoDiv.style.height = '100%';

        // Play local video with multiple fallback methods
        console.log('Playing local video...');
        let videoPlayed = false;

        try {
            // Method 1: Play directly to the element
            await localVideoTrack.play(localVideoDiv);
            console.log('✅ Local video playing successfully (method 1)');
            videoPlayed = true;
        } catch (playError1) {
            console.warn('Method 1 failed:', playError1);

            try {
                // Method 2: Play using element ID
                await localVideoTrack.play('local-video');
                console.log('✅ Local video playing successfully (method 2)');
                videoPlayed = true;
            } catch (playError2) {
                console.warn('Method 2 failed:', playError2);

                try {
                    // Method 3: Create video element manually
                    const videoElement = document.createElement('video');
                    videoElement.autoplay = true;
                    videoElement.muted = true;
                    videoElement.style.width = '100%';
                    videoElement.style.height = '100%';
                    videoElement.style.objectFit = 'cover';

                    localVideoDiv.appendChild(videoElement);
                    await localVideoTrack.play(videoElement);
                    console.log('✅ Local video playing successfully (method 3)');
                    videoPlayed = true;
                } catch (playError3) {
                    console.error('All video play methods failed:', playError3);
                }
            }
        }

        if (!videoPlayed) {
            // Show error message if video couldn't be played
            localVideoDiv.innerHTML = '<p style="color: red;">Video playback failed. Check console for details.</p>';
            localVideoDiv.style.backgroundColor = '#f8d7da';
        }

        // Publish local tracks
        console.log('Publishing local tracks...');
        await agoraClient.publish([localAudioTrack, localVideoTrack]);

        console.log('Local tracks created and published successfully');
        updateConnectionStatus('Connected - Camera and microphone active');

    } catch (error) {
        console.error('❌ Error creating local tracks:', error);

        let errorMessage = 'Camera access failed';
        if (error.code === 'PERMISSION_DENIED') {
            errorMessage = 'Camera/microphone permission denied. Please allow access and try again.';
        } else if (error.code === 'DEVICE_NOT_FOUND') {
            errorMessage = 'Camera or microphone not found. Please check your devices.';
        } else if (error.code === 'NOT_SUPPORTED') {
            errorMessage = 'Camera/microphone not supported by browser.';
        }

        updateConnectionStatus('Camera access failed');

        // Show error in local video container
        const localVideoDiv = document.getElementById('local-video');
        localVideoDiv.innerHTML = `
            <p style="color: #721c24; font-weight: bold;">${errorMessage}</p>
            <p style="color: #721c24;">Error details: ${error.message}</p>
            <p style="color: #721c24;">Error code: ${error.code || 'Unknown'}</p>
            <button onclick="retryCamera()" style="margin-top: 10px; padding: 5px 10px; background: #007bff; color: white; border: none; border-radius: 3px; cursor: pointer;">Retry Camera Access</button>
        `;
        localVideoDiv.style.backgroundColor = '#f8d7da';
        localVideoDiv.style.padding = '20px';
        localVideoDiv.style.textAlign = 'center';

        // Reset join button
        document.getElementById('join-call').textContent = 'Join Call';
        document.getElementById('join-call').disabled = false;

        // Throw error to be caught by join function
        throw error;
    }
}

/**
 * Leave the Agora channel
 */
async function leaveChannel() {
    try {
        console.log('Leaving channel...');

        // Stop and close local tracks
        if (localAudioTrack) {
            localAudioTrack.stop();
            localAudioTrack.close();
            localAudioTrack = null;
        }

        if (localVideoTrack) {
            localVideoTrack.stop();
            localVideoTrack.close();
            localVideoTrack = null;
        }

        // Leave the channel
        if (agoraClient) {
            await agoraClient.leave();
        }

        // Clear remote users
        remoteUsers = {};

        // Reset UI
        updateConnectionStatus('Disconnected');
        document.getElementById('join-call').textContent = 'Join Call';
        document.getElementById('join-call').disabled = false;

        // Reset local video container
        const localVideoDiv = document.getElementById('local-video');
        localVideoDiv.innerHTML = '<p>Local video stream placeholder</p><p>Camera will appear here</p>';
        localVideoDiv.style.backgroundColor = '#e9ecef';

        // Clear remote videos
        const remoteVideosContainer = document.getElementById('remote-videos');
        remoteVideosContainer.innerHTML = '<div class="video-placeholder remote-placeholder"><p>Waiting for other participants...</p><p>Remote video streams will appear here</p></div>';

        updateParticipantCount();

        console.log('Left channel successfully');

    } catch (error) {
        console.error('Error leaving channel:', error);
    }
}

/**
 * Toggle camera on/off
 */
async function toggleCamera() {
    try {
        if (localVideoTrack) {
            const enabled = localVideoTrack.enabled;
            await localVideoTrack.setEnabled(!enabled);

            const button = document.getElementById('toggle-camera');
            button.textContent = enabled ? '📹 Camera (Off)' : '📹 Camera';
            button.style.backgroundColor = enabled ? '#dc3545' : '#28a745';

            console.log('Camera toggled:', !enabled);
        } else {
            console.log('No local video track available');
        }

    } catch (error) {
        console.error('Error toggling camera:', error);
    }
}

/**
 * Toggle microphone on/off
 */
async function toggleMicrophone() {
    try {
        if (localAudioTrack) {
            const enabled = localAudioTrack.enabled;
            await localAudioTrack.setEnabled(!enabled);

            const button = document.getElementById('toggle-microphone');
            button.textContent = enabled ? '🎤 Microphone (Off)' : '🎤 Microphone';
            button.style.backgroundColor = enabled ? '#dc3545' : '#28a745';

            console.log('Microphone toggled:', !enabled);
        } else {
            console.log('No local audio track available');
        }

    } catch (error) {
        console.error('Error toggling microphone:', error);
    }
}

/**
 * Helper function to update connection status in UI
 */
function updateConnectionStatus(status) {
    const statusElement = document.getElementById('connection-status');
    if (statusElement) {
        statusElement.textContent = status;
    }
}

/**
 * Helper function to update participant count
 */
function updateParticipantCount() {
    const count = Object.keys(remoteUsers).length + (agoraClient && localVideoTrack ? 1 : 0);
    const countElement = document.getElementById('participant-count');
    if (countElement) {
        countElement.textContent = count;
    }
}

/**
 * Create container for remote video
 */
function createRemoteVideoContainer(uid) {
    const remoteVideosContainer = document.getElementById('remote-videos');

    // Remove placeholder if it exists
    const placeholder = remoteVideosContainer.querySelector('.remote-placeholder');
    if (placeholder) {
        placeholder.remove();
    }

    // Create video container
    const videoContainer = document.createElement('div');
    videoContainer.id = `remote-video-${uid}`;
    videoContainer.className = 'remote-video-item';
    videoContainer.style.cssText = `
        background-color: #f8f9fa;
        border: 2px solid #dee2e6;
        border-radius: 8px;
        padding: 10px;
        margin: 5px;
        min-height: 200px;
        position: relative;
    `;

    const playerDiv = document.createElement('div');
    playerDiv.id = `remote-player-${uid}`;
    playerDiv.className = 'remote-video-player';
    playerDiv.style.cssText = `
        width: 100%;
        height: 200px;
        background-color: #000;
        border-radius: 4px;
    `;

    const labelDiv = document.createElement('div');
    labelDiv.textContent = `Participant ${uid}`;
    labelDiv.style.cssText = `
        position: absolute;
        bottom: 5px;
        left: 5px;
        background-color: rgba(0,0,0,0.7);
        color: white;
        padding: 2px 6px;
        border-radius: 3px;
        font-size: 12px;
    `;

    videoContainer.appendChild(playerDiv);
    videoContainer.appendChild(labelDiv);
    remoteVideosContainer.appendChild(videoContainer);

    // Store in remoteUsers
    remoteUsers[uid] = { container: videoContainer };

    console.log('Created remote video container for UID:', uid);
    return `remote-player-${uid}`;
}

/**
 * Remove container for remote video
 */
function removeRemoteVideoContainer(uid) {
    const videoContainer = document.getElementById(`remote-video-${uid}`);
    if (videoContainer) {
        videoContainer.remove();
    }

    // Remove from remoteUsers
    delete remoteUsers[uid];

    // If no remote users, show placeholder
    const remoteVideosContainer = document.getElementById('remote-videos');
    if (Object.keys(remoteUsers).length === 0) {
        remoteVideosContainer.innerHTML = '<div class="video-placeholder remote-placeholder"><p>Waiting for other participants...</p><p>Remote video streams will appear here</p></div>';
    }

    console.log('Removed remote video container for UID:', uid);
}

/**
 * Retry camera access function
 */
async function retryCamera() {
    console.log('Retrying camera access...');

    // Reset local video container
    const localVideoDiv = document.getElementById('local-video');
    localVideoDiv.innerHTML = '<p>Retrying camera access...</p>';
    localVideoDiv.style.backgroundColor = '#fff3cd';

    // Try to create tracks again
    try {
        await createAndPublishLocalTracks();
    } catch (error) {
        console.error('Retry failed:', error);
    }
}

/**
 * Check browser compatibility and permissions
 */
async function checkBrowserSupport() {
    console.log('Checking browser support...');
    console.log('User Agent:', navigator.userAgent);
    console.log('Location:', location.href);
    console.log('Protocol:', location.protocol);
    console.log('Navigator.mediaDevices:', !!navigator.mediaDevices);
    console.log('Navigator.getUserMedia:', !!navigator.getUserMedia);

    // Check for modern mediaDevices API
    const hasModernAPI = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);

    // Check for legacy getUserMedia API
    const hasLegacyAPI = !!(navigator.getUserMedia ||
                           navigator.webkitGetUserMedia ||
                           navigator.mozGetUserMedia ||
                           navigator.msGetUserMedia);

    console.log('Modern API support:', hasModernAPI);
    console.log('Legacy API support:', hasLegacyAPI);

    if (!hasModernAPI && !hasLegacyAPI) {
        const errorMsg = `Browser does not support camera/microphone access.

Current browser: ${navigator.userAgent}
Protocol: ${location.protocol}
Domain: ${location.hostname}

Requirements:
- Use HTTPS (not HTTP) for camera access
- Use a modern browser like Chrome, Firefox, or Safari
- Ensure you're not in a restricted environment

Please try:
1. Use HTTPS instead of HTTP
2. Update your browser
3. Try a different browser (Chrome recommended)`;

        console.error(errorMsg);
        throw new Error(errorMsg);
    }

    if (!hasModernAPI) {
        console.warn('Using legacy getUserMedia API - some features may not work');
    }

    // Check if running on HTTPS or localhost (more permissive for cloud deployments)
    const isSecure = location.protocol === 'https:' ||
                     location.hostname === 'localhost' ||
                     location.hostname === '127.0.0.1' ||
                     location.hostname.includes('.app') ||  // Common cloud domains
                     location.hostname.includes('.dev') ||
                     location.hostname.includes('.io') ||
                     location.hostname.includes('.com');

    if (!isSecure) {
        console.warn('Camera access may be restricted on non-HTTPS sites');
        // For cloud deployments, we'll try anyway but warn the user
    }

    console.log('Security context:', {
        protocol: location.protocol,
        hostname: location.hostname,
        isSecure: isSecure
    });

    // Check available devices
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const hasCamera = devices.some(device => device.kind === 'videoinput');
        const hasMicrophone = devices.some(device => device.kind === 'audioinput');

        console.log('Available devices:', {
            camera: hasCamera,
            microphone: hasMicrophone,
            total: devices.length
        });

        if (!hasCamera) {
            console.warn('No camera device found during enumeration');
            // Don't throw error - device enumeration might be restricted
        }
        if (!hasMicrophone) {
            console.warn('No microphone device found during enumeration');
            // Don't throw error - device enumeration might be restricted
        }

    } catch (error) {
        console.warn('Could not enumerate devices (this is normal on some browsers/deployments):', error);
        // Device enumeration can fail on cloud deployments or due to privacy settings
        // We'll try to access the camera anyway when joining the call
    }
}

/**
 * Test camera access without Agora
 */
async function testCameraAccess() {
    console.log('Testing camera access...');

    let testStream = null;
    try {
        // Request camera and microphone access
        testStream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: { ideal: 640 },
                height: { ideal: 480 }
            },
            audio: true
        });

        console.log('Camera access test successful');

        // Show test video in local container temporarily
        const localVideoDiv = document.getElementById('local-video');
        const videoElement = document.createElement('video');
        videoElement.srcObject = testStream;
        videoElement.autoplay = true;
        videoElement.muted = true;
        videoElement.style.width = '100%';
        videoElement.style.height = '100%';
        videoElement.style.objectFit = 'cover';

        localVideoDiv.innerHTML = '';
        localVideoDiv.appendChild(videoElement);
        localVideoDiv.style.backgroundColor = 'transparent';

        // Stop test stream after 3 seconds
        setTimeout(() => {
            if (testStream) {
                testStream.getTracks().forEach(track => track.stop());
            }
            localVideoDiv.innerHTML = '<p>Camera test completed successfully!</p><p>You can now join the call.</p>';
            localVideoDiv.style.backgroundColor = '#d4edda';
        }, 3000);

        return true;

    } catch (error) {
        console.error('Camera access test failed:', error);

        // Stop any tracks that might have been created
        if (testStream) {
            testStream.getTracks().forEach(track => track.stop());
        }

        // Show error
        const localVideoDiv = document.getElementById('local-video');
        let errorMessage = 'Camera test failed';

        if (error.name === 'NotAllowedError') {
            errorMessage = 'Camera permission denied. Please allow camera access and try again.';
        } else if (error.name === 'NotFoundError') {
            errorMessage = 'No camera found. Please connect a camera and try again.';
        } else if (error.name === 'NotReadableError') {
            errorMessage = 'Camera is being used by another application.';
        }

        localVideoDiv.innerHTML = `
            <p style="color: #721c24; font-weight: bold;">${errorMessage}</p>
            <p style="color: #721c24;">Error: ${error.message}</p>
        `;
        localVideoDiv.style.backgroundColor = '#f8d7da';
        localVideoDiv.style.padding = '20px';
        localVideoDiv.style.textAlign = 'center';

        throw error;
    }
}

/**
 * Diagnostic function to check system status
 */
function runDiagnostics() {
    console.log('=== AGORA DIAGNOSTICS ===');
    console.log('Agora SDK loaded:', typeof AgoraRTC !== 'undefined');
    if (typeof AgoraRTC !== 'undefined') {
        console.log('Agora SDK version:', AgoraRTC.VERSION);
    }
    console.log('Agora client initialized:', !!agoraClient);
    console.log('Local video track:', !!localVideoTrack);
    console.log('Local audio track:', !!localAudioTrack);
    console.log('Configuration:', AGORA_CONFIG);

    const localVideoDiv = document.getElementById('local-video');
    console.log('Local video element:', {
        exists: !!localVideoDiv,
        innerHTML: localVideoDiv?.innerHTML,
        dimensions: localVideoDiv ? {
            width: localVideoDiv.offsetWidth,
            height: localVideoDiv.offsetHeight
        } : null
    });

    console.log('Browser support:', {
        getUserMedia: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
        protocol: location.protocol,
        hostname: location.hostname
    });

    console.log('=== END DIAGNOSTICS ===');
}

// Export functions for use in room.html
window.initializeAgora = initializeAgora;
window.joinChannel = joinChannel;
window.leaveChannel = leaveChannel;
window.toggleCamera = toggleCamera;
window.toggleMicrophone = toggleMicrophone;
window.retryCamera = retryCamera;
window.checkBrowserSupport = checkBrowserSupport;
window.testCameraAccess = testCameraAccess;
window.runDiagnostics = runDiagnostics;
