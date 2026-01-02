/* eslint-disable @typescript-eslint/no-explicit-any */
export class USBCamera {
    stream: MediaStream | null = null;
    videoElement: HTMLVideoElement | null = null;
    isConnected: boolean = false;
    statusCallback: ((message: string, connected: boolean) => void) | null = null;

    async autoDetect() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            console.error('getUserMedia not supported');
            this.updateStatus('Not Supported', false);
            return false;
        }

        try {
            this.updateStatus('Searching...', false);
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = devices.filter(device => device.kind === 'videoinput');

            if (videoDevices.length === 0) {
                this.updateStatus('No Camera Found', false);
                return false;
            }

            let targetDevice = null;
            for (const device of videoDevices) {
                const label = device.label.toLowerCase();
                if (label.includes('skydroid') || label.includes('uvc') || label.includes('usb video') || label.includes('capture')) {
                    targetDevice = device;
                    break;
                }
            }

            if (!targetDevice && videoDevices.length > 0) {
                targetDevice = videoDevices[0];
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

    async connectToDevice(deviceId: string) {
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
        } catch (error: any) {
            console.error('Connection error:', error);
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

    async requestPermission() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            stream.getTracks().forEach(track => track.stop());
            const devices = await navigator.mediaDevices.enumerateDevices();
            return devices.filter(device => device.kind === 'videoinput');
        } catch (error) {
            console.error('Permission request failed:', error);
            return [];
        }
    }

    setVideoElement(element: HTMLVideoElement) {
        this.videoElement = element;
    }

    onStatusChange(callback: (message: string, connected: boolean) => void) {
        this.statusCallback = callback;
    }

    updateStatus(message: string, connected: boolean) {
        this.isConnected = connected;
        if (this.statusCallback) {
            this.statusCallback(message, connected);
        }
    }

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
}
