/**
 * USB Camera Auto-Detection for Skydroid and UVC Devices
 * Automatically detects and connects to USB video devices
 */

class USBCamera {
    constructor() {
        this.stream = null;
        this.videoElement = null;
        this.isConnected = false;
        this.statusCallback = null;
    }

    /**
     * Auto-detect and connect to USB camera
     */
    async autoDetect() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            console.error('getUserMedia not supported');
            this.updateStatus('Not Supported', false);
            return false;
        }

        try {
            this.updateStatus('Searching...', false);

            // Get list of video input devices
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = devices.filter(device => device.kind === 'videoinput');

            if (videoDevices.length === 0) {
                this.updateStatus('No Camera Found', false);
                return false;
            }

            // Try to find Skydroid or UVC device
            let targetDevice = null;

            // Look for Skydroid specifically
            for (const device of videoDevices) {
                const label = device.label.toLowerCase();
                if (label.includes('skydroid') ||
                    label.includes('uvc') ||
                    label.includes('usb video') ||
                    label.includes('capture')) {
                    targetDevice = device;
                    console.log('Found camera device:', device.label);
                    break;
                }
            }

            // If no specific device found, use first available
            if (!targetDevice && videoDevices.length > 0) {
                targetDevice = videoDevices[0];
                console.log('Using first available camera:', targetDevice.label);
            }

            if (targetDevice) {
                return await this.connectToDevice(targetDevice.deviceId);
            }

            return false;
        } catch (error) {
            console.error('Auto-detect error:', error);
            this.updateStatus('Detection Failed', false);
            return false;
        }
    }

    /**
     * Connect to specific device
     */
    async connectToDevice(deviceId) {
        try {
            const constraints = {
                video: {
                    deviceId: deviceId ? { exact: deviceId } : undefined,
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    frameRate: { ideal: 30 }
                },
                audio: false
            };

            this.stream = await navigator.mediaDevices.getUserMedia(constraints);

            if (this.videoElement) {
                this.videoElement.srcObject = this.stream;
                this.isConnected = true;
                this.updateStatus('Connected', true);
                return true;
            }

            return false;
        } catch (error) {
            console.error('Connection error:', error);

            // Provide helpful error messages
            if (error.name === 'NotAllowedError') {
                this.updateStatus('Permission Denied', false);
            } else if (error.name === 'NotFoundError') {
                this.updateStatus('Camera Not Found', false);
            } else if (error.name === 'NotReadableError') {
                this.updateStatus('Camera In Use', false);
            } else {
                this.updateStatus('Connection Failed', false);
            }

            return false;
        }
    }

    /**
     * Request camera permission and list devices
     */
    async requestPermission() {
        try {
            // Request permission by trying to access camera
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });

            // Stop the stream immediately
            stream.getTracks().forEach(track => track.stop());

            // Now enumerate devices (labels will be available)
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = devices.filter(device => device.kind === 'videoinput');

            return videoDevices;
        } catch (error) {
            console.error('Permission request failed:', error);
            return [];
        }
    }

    /**
     * Set video element
     */
    setVideoElement(element) {
        this.videoElement = element;
    }

    /**
     * Set status callback
     */
    onStatusChange(callback) {
        this.statusCallback = callback;
    }

    /**
     * Update status
     */
    updateStatus(message, connected) {
        this.isConnected = connected;
        if (this.statusCallback) {
            this.statusCallback(message, connected);
        }
    }

    /**
     * Disconnect camera
     */
    disconnect() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }

        if (this.videoElement) {
            this.videoElement.srcObject = null;
        }

        this.isConnected = false;
        this.updateStatus('Disconnected', false);
    }

    /**
     * Get available cameras
     */
    async getAvailableCameras() {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            return devices.filter(device => device.kind === 'videoinput');
        } catch (error) {
            console.error('Error getting cameras:', error);
            return [];
        }
    }
}

// Export for use in main app
window.USBCamera = USBCamera;
