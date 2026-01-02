/**
 * Main Ground Station Application
 * Integrates MSP, CRSF, map, instruments, and UI
 */

class GroundStation {
    constructor() {
        this.msp = new MSP();
        this.crsf = new CRSF();
        this.instruments = new FlightInstruments();
        this.usbCamera = new USBCamera();

        this.availablePorts = [];
        this.connectionType = 'usb';
        this.isConnected = false;
        this.isRecording = false;
        this.recordingStartTime = null;
        this.telemetryInterval = null;
        this.recordingInterval = null;
        this.broadcastInterval = null;
        this.socket = null;

        this.map = null;
        this.aircraftMarker = null;
        this.homeMarker = null;
        this.flightPath = null;
        this.pathCoordinates = [];

        this.telemetryData = {
            gps: { fix: 0, numSat: 0, lat: 0, lon: 0, alt: 0, speed: 0, heading: 0 },
            attitude: { roll: 0, pitch: 0, yaw: 0 },
            battery: { voltage: 0, current: 0, capacity: 0 },
            altitude: 0,
            vario: 0,
            rssi: 0,
            flightMode: 'DISARMED',
            armed: false
        };

        this.homePosition = null;
        this.flightData = [];

        this.settings = {
            mapProvider: 'osm',
            distanceUnit: 'metric',
            speedUnit: 'kmh',
            autoRecord: false,
            logInterval: 1000
        };

        this.init();
    }

    /**
     * Initialize application
     */
    init() {
        this.loadSettings();
        this.initUI();
        this.initMap();
        this.instruments.init();
        this.initCamera();
        this.initMirroring();
        this.setupEventListeners();
    }

    /**
     * Initialize UI elements
     */
    initUI() {
        // Update connection status
        this.updateConnectionStatus(false);

        // Auto-close sidebar on small screens
        if (window.innerWidth <= 768) {
            document.body.classList.add('sidebar-closed');
        }

        // Load available ports (if any previously authorized)
        this.loadAvailablePorts();
    }

    /**
     * Initialize camera
     */
    async initCamera() {
        // Set video element
        const videoElement = document.getElementById('cameraFeed');
        this.usbCamera.setVideoElement(videoElement);

        // Set status callback
        this.usbCamera.onStatusChange((message, connected) => {
            const statusEl = document.getElementById('cameraStatus');
            const dot = statusEl.querySelector('.status-dot');
            const text = statusEl.querySelector('span');

            text.textContent = message;
            if (connected) {
                dot.classList.add('active');
                document.getElementById('cameraPlaceholder').classList.add('hidden');
                videoElement.classList.remove('hidden');
            } else {
                dot.classList.remove('active');
            }
        });

        // Auto-detect camera after a short delay
        setTimeout(async () => {
            const connected = await this.usbCamera.autoDetect();
            if (!connected) {
                console.log('No USB camera auto-detected');
            }
        }, 1000);
    }

    /**
     * Initialize map
     */
    initMap() {
        // Default center (will update when GPS fix is acquired)
        this.map = L.map('map').setView([0, 0], 2);

        // Add tile layer
        this.updateMapProvider();

        // Create aircraft marker
        const aircraftIcon = L.divIcon({
            className: 'aircraft-marker',
            html: `<svg width="32" height="32" viewBox="0 0 32 32">
                <path d="M16 2L14 10L8 12L14 14L16 22L18 14L24 12L18 10L16 2Z" 
                      fill="#3b82f6" stroke="#ffffff" stroke-width="2"/>
            </svg>`,
            iconSize: [32, 32],
            iconAnchor: [16, 16]
        });

        this.aircraftMarker = L.marker([0, 0], { icon: aircraftIcon }).addTo(this.map);

        // Create home marker
        const homeIcon = L.divIcon({
            className: 'home-marker',
            html: `<svg width="24" height="24" viewBox="0 0 24 24">
                <path d="M12 2L2 12h3v8h6v-6h2v6h6v-8h3L12 2z" 
                      fill="#10b981" stroke="#ffffff" stroke-width="2"/>
            </svg>`,
            iconSize: [24, 24],
            iconAnchor: [12, 24]
        });

        this.homeMarker = L.marker([0, 0], { icon: homeIcon });

        // Create flight path
        this.flightPath = L.polyline([], {
            color: '#3b82f6',
            weight: 3,
            opacity: 0.7
        }).addTo(this.map);
    }

    /**
     * Setup event listeners
     */
    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Connection type selector
        document.querySelectorAll('.connection-type-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchConnectionType(e.target.closest('.connection-type-btn').dataset.type);
            });
        });

        // USB connection
        document.getElementById('connectBtn').addEventListener('click', () => {
            this.connectUSB();
        });

        // ELRS connection
        document.getElementById('elrsConnectBtn').addEventListener('click', () => {
            this.connectELRS();
        });

        // Recording
        document.getElementById('recordBtn').addEventListener('click', () => {
            this.toggleRecording();
        });

        // Data export
        document.getElementById('exportDataBtn').addEventListener('click', () => {
            this.exportData();
        });

        // Camera Controls
        document.getElementById('manualCameraBtn').addEventListener('click', () => {
            this.openManualCameraModal();
        });

        document.getElementById('closeManualCameraBtn').addEventListener('click', () => {
            document.getElementById('manualCameraModal').classList.add('hidden');
        });

        document.getElementById('connectUsbCameraBtn').addEventListener('click', () => {
            const deviceId = document.getElementById('cameraDeviceSelect').value;
            this.usbCamera.connectToDevice(deviceId);
            document.getElementById('manualCameraModal').classList.add('hidden');
        });

        // Preset URLs
        document.querySelectorAll('.preset-url').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.getElementById('streamUrlInput').value = e.target.dataset.url;
            });
        });

        document.getElementById('connectStreamBtn').addEventListener('click', () => {
            const url = document.getElementById('streamUrlInput').value;
            this.connectStream(url);
            document.getElementById('manualCameraModal').classList.add('hidden');
        });

        // Settings
        document.getElementById('settingsBtn').addEventListener('click', () => {
            this.openSettings();
        });

        document.getElementById('closeSettingsBtn').addEventListener('click', () => {
            this.closeSettings();
        });

        document.getElementById('cancelSettingsBtn').addEventListener('click', () => {
            this.closeSettings();
        });

        document.getElementById('saveSettingsBtn').addEventListener('click', () => {
            this.saveSettings();
        });

        // Sidebar Toggle
        const sidebarToggle = document.getElementById('sidebarToggle');
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => {
                document.body.classList.toggle('sidebar-closed');
                setTimeout(() => {
                    if (this.map) this.map.invalidateSize();
                }, 300); // Wait for transition
            });
        }

        // Dashboard Panel Controls
        document.querySelectorAll('.maximize-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const panel = e.target.closest('.dashboard-camera, .dashboard-map');
                if (panel) {
                    panel.classList.toggle('maximized');
                    // Force map resize if it's the map panel
                    if (panel.classList.contains('dashboard-map') && this.map) {
                        setTimeout(() => this.map.invalidateSize(), 100);
                    }
                }
            });
        });

        document.querySelectorAll('.collapse-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const panel = e.target.closest('[class*="dashboard-"]');
                if (panel) {
                    panel.classList.toggle('collapsed');
                    // Force map resize as layout changes
                    setTimeout(() => {
                        if (this.map) this.map.invalidateSize();
                    }, 300);
                }
            });
        });
    }

    // ... (connection methods remain same)

    /**
     * Open Manual Camera Modal
     */
    async openManualCameraModal() {
        const modal = document.getElementById('manualCameraModal');
        const select = document.getElementById('cameraDeviceSelect');

        modal.classList.remove('hidden');
        select.innerHTML = '<option>Loading...</option>';

        const devices = await this.usbCamera.requestPermission();

        select.innerHTML = '';
        if (devices.length === 0) {
            select.innerHTML = '<option value="">No USB cameras found</option>';
        } else {
            devices.forEach(device => {
                const option = document.createElement('option');
                option.value = device.deviceId;
                option.text = device.label || `Camera ${select.length + 1}`;
                select.appendChild(option);
            });
        }
    }

    /**
     * Connect to network stream
     */
    connectStream(url) {
        if (!url) return;

        const img = document.getElementById('mjpegFeed');
        const video = document.getElementById('cameraFeed');
        const placeholder = document.getElementById('cameraPlaceholder');
        const statusText = document.querySelector('#cameraStatus span');
        const statusDot = document.querySelector('#cameraStatus .status-dot');

        if (url.includes('mjpeg') || url.endsWith('.mjpg')) {
            video.classList.add('hidden');
            img.classList.remove('hidden');
            img.src = url;
            placeholder.style.display = 'none'; // Use style for flex containers
            placeholder.classList.add('hidden');

            statusText.textContent = 'Network Stream';
            statusDot.classList.add('active');
        } else {
            alert('Please use an MJPEG stream URL');
        }
    }

    /**
     * Switch connection type
     */
    switchConnectionType(type) {
        this.connectionType = type;

        // Update UI
        document.querySelectorAll('.connection-type-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.type === type);
        });

        document.getElementById('usbConfig').classList.toggle('hidden', type !== 'usb');
        document.getElementById('elrsConfig').classList.toggle('hidden', type !== 'elrs');
    }

    /**
     * Load available ports
     */
    async loadAvailablePorts() {
        if (!('serial' in navigator)) return;

        try {
            const ports = await navigator.serial.getPorts();
            this.availablePorts = ports;

            const updateSelect = (id) => {
                const sel = document.getElementById(id);
                if (!sel) return;

                sel.innerHTML = '<option value="">New Device... (Select Port)</option>';
                ports.forEach((port, index) => {
                    const info = port.getInfo();
                    // Create a label with VID/PID if available
                    let label = `USB Device ${index + 1}`;
                    if (info.usbVendorId && info.usbProductId) {
                        label += ` (${info.usbVendorId.toString(16).padStart(4, '0')}:${info.usbProductId.toString(16).padStart(4, '0')})`;
                    }
                    const option = document.createElement('option');
                    option.value = index;
                    option.text = label;
                    sel.appendChild(option);
                });
            };

            updateSelect('portSelect');
            updateSelect('elrsPortSelect');
        } catch (error) {
            console.error('Error loading ports:', error);
        }
    }

    /**
     * Connect via USB (MSP)
     */
    async connectUSB() {
        const btn = document.getElementById('connectBtn');

        if (this.isConnected) {
            // Disconnect
            await this.disconnect();
            return;
        }

        try {
            btn.disabled = true;
            btn.textContent = 'Connecting...';

            const baudRate = parseInt(document.getElementById('baudRate').value);

            // Get selected port
            const portIndex = document.getElementById('portSelect').value;
            const selectedPort = (portIndex !== "" && this.availablePorts) ? this.availablePorts[parseInt(portIndex)] : null;

            await this.msp.connect(baudRate, selectedPort);

            // Put it back in list if it was new (requestPort adds it to authorised list)
            if (!selectedPort) {
                this.loadAvailablePorts();
            }

            // Setup MSP callbacks
            this.setupMSPCallbacks();

            // Start telemetry loop
            this.startTelemetryLoop();

            this.isConnected = true;
            this.updateConnectionStatus(true, 'USB');

            btn.textContent = 'Disconnect';
            btn.classList.remove('btn-primary');
            btn.classList.add('btn-danger');

            // Auto-record if enabled
            if (this.settings.autoRecord) {
                this.startRecording();
            }
        } catch (error) {
            console.error('Connection error:', error);
            alert('Failed to connect: ' + error.message);
            btn.textContent = 'Connect';
        } finally {
            btn.disabled = false;
        }
    }

    /**
     * Connect via ExpressLRS (CRSF)
     */
    async connectELRS() {
        const btn = document.getElementById('elrsConnectBtn');

        if (this.isConnected) {
            await this.disconnect();
            return;
        }

        try {
            btn.disabled = true;
            btn.textContent = 'Connecting...';

            const baudRate = parseInt(document.getElementById('elrsBaudRate').value);

            // Get selected port
            const portIndex = document.getElementById('elrsPortSelect').value;
            const selectedPort = (portIndex !== "" && this.availablePorts) ? this.availablePorts[parseInt(portIndex)] : null;

            await this.crsf.connect(baudRate, selectedPort);

            // Refresh ports if new
            if (!selectedPort) {
                this.loadAvailablePorts();
            }

            // Setup CRSF callbacks
            this.setupCRSFCallbacks();

            this.isConnected = true;
            this.updateConnectionStatus(true, 'ExpressLRS');

            btn.textContent = 'Disconnect';
            btn.classList.remove('btn-primary');
            btn.classList.add('btn-danger');

            if (this.settings.autoRecord) {
                this.startRecording();
            }
        } catch (error) {
            console.error('Connection error:', error);
            alert('Failed to connect: ' + error.message);
            btn.textContent = 'Connect';
        } finally {
            btn.disabled = false;
        }
    }

    /**
     * Disconnect
     */
    async disconnect() {
        if (this.telemetryInterval) {
            clearInterval(this.telemetryInterval);
            this.telemetryInterval = null;
        }

        if (this.isRecording) {
            this.stopRecording();
        }

        if (this.connectionType === 'usb') {
            await this.msp.disconnect();
            const btn = document.getElementById('connectBtn');
            btn.textContent = 'Connect';
            btn.classList.remove('btn-danger');
            btn.classList.add('btn-primary');
        } else {
            await this.crsf.disconnect();
            const btn = document.getElementById('elrsConnectBtn');
            btn.textContent = 'Connect';
            btn.classList.remove('btn-danger');
            btn.classList.add('btn-primary');
        }

        this.isConnected = false;
        this.updateConnectionStatus(false);
    }

    /**
     * Setup MSP callbacks
     */
    setupMSPCallbacks() {
        this.msp.onMessage(this.msp.MSP_RAW_GPS, (payload) => {
            const gps = this.msp.parseGPS(payload);
            this.updateGPS(gps);
        });

        this.msp.onMessage(this.msp.MSP_ATTITUDE, (payload) => {
            const attitude = this.msp.parseAttitude(payload);
            this.updateAttitude(attitude);
        });

        this.msp.onMessage(this.msp.MSP_ALTITUDE, (payload) => {
            const altitude = this.msp.parseAltitude(payload);
            this.updateAltitude(altitude);
        });

        this.msp.onMessage(this.msp.MSP_ANALOG, (payload) => {
            const analog = this.msp.parseAnalog(payload);
            this.updateBattery(analog);
        });

        this.msp.onMessage(this.msp.MSP_STATUS, (payload) => {
            const status = this.msp.parseStatus(payload);
            this.updateStatus(status);
        });

        this.msp.onMessage(this.msp.MSP_BATTERY_STATE, (payload) => {
            const battery = this.msp.parseBatteryState(payload);
            this.updateBatteryState(battery);
        });
    }

    /**
     * Setup CRSF callbacks
     */
    setupCRSFCallbacks() {
        this.crsf.on('gps', (gps) => {
            this.updateGPS(gps);
        });

        this.crsf.on('attitude', (attitude) => {
            this.updateAttitude(attitude);
        });

        this.crsf.on('battery', (battery) => {
            this.updateBattery(battery);
        });

        this.crsf.on('vario', (vario) => {
            this.updateVario(vario);
        });

        this.crsf.on('linkStats', (stats) => {
            this.updateLinkStats(stats);
        });

        this.crsf.on('flightMode', (mode) => {
            this.telemetryData.flightMode = mode;
            this.updateText('flightMode', mode);
            this.updateText('extFlightMode', mode);
        });
    }

    /**
     * Start telemetry request loop (for MSP)
     */
    startTelemetryLoop() {
        if (this.connectionType !== 'usb') return;

        this.telemetryInterval = setInterval(() => {
            this.msp.requestTelemetry();
        }, 100); // Request every 100ms
    }

    /**
     * Update GPS data
     */
    /**
     * Helper to safely update text content
     */
    updateText(id, text) {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    }

    /**
     * Update GPS data
     */
    updateGPS(gps) {
        this.telemetryData.gps = gps;

        const fixText = gps.fix ? `${gps.fix}D Fix` : 'No Fix';
        const satText = gps.numSat || gps.satellites || 0;
        const speedText = (gps.speed || 0).toFixed(1) + ' km/h';
        const latText = gps.lat.toFixed(6);
        const lonText = gps.lon.toFixed(6);

        // Update all potential UI elements safely
        this.updateText('gpsStatus', fixText);
        this.updateText('extGpsStatus', fixText);

        this.updateText('satellites', satText);
        this.updateText('extSatellites', satText);
        this.updateText('mapSats', satText);

        this.updateText('speed', speedText);
        this.updateText('extSpeed', speedText);
        this.updateText('overlaySpeed', (gps.speed || 0).toFixed(0) + ' km/h');

        this.updateText('latitude', latText);
        this.updateText('extLatitude', latText);
        this.updateText('mapLat', latText);

        this.updateText('longitude', lonText);
        this.updateText('extLongitude', lonText);
        this.updateText('mapLon', lonText);

        // Update map if we have a fix
        if (gps.fix && gps.lat !== 0 && gps.lon !== 0) {
            this.updateMapPosition(gps.lat, gps.lon, gps.heading || gps.groundCourse || 0);

            if (!this.homePosition) {
                this.setHomePosition(gps.lat, gps.lon);
            }

            if (this.homePosition) {
                const distance = this.calculateDistance(
                    this.homePosition.lat, this.homePosition.lon,
                    gps.lat, gps.lon
                );

                const distText = distance.toFixed(0) + ' m';
                this.updateText('distance', distText);
                this.updateText('homeDistance', distText); // Legacy
                this.updateText('extDistance', distText);
                this.updateText('mapDistance', distText);
            }
        }
    }

    /**
     * Update attitude data
     */
    updateAttitude(attitude) {
        this.telemetryData.attitude = attitude;

        this.instruments.updateAttitude(attitude.pitch, attitude.roll, attitude.yaw);

        const headingText = Math.round(attitude.yaw) + '°';
        this.updateText('heading', headingText);
        this.updateText('extHeading', headingText);
    }

    /**
     * Update altitude data
     */
    updateAltitude(altitude) {
        const alt = altitude.estimatedAltitude / 100; // cm to m
        this.telemetryData.altitude = alt;

        const altText = alt.toFixed(1) + ' m';
        this.updateText('altitude', altText);
        this.updateText('extAltitude', altText);
        this.updateText('overlayAlt', altText);

        this.instruments.updateAltitude(alt);

        if (altitude.estimatedVario !== undefined) {
            const vario = altitude.estimatedVario / 100; // cm/s to m/s
            this.telemetryData.vario = vario;
            this.instruments.updateVerticalSpeed(vario);
        }
    }

    /**
     * Update battery data
     */
    updateBattery(battery) {
        this.telemetryData.battery = battery;

        const voltage = battery.vbat || battery.voltage || battery.batteryVoltage || 0;
        const current = battery.amperage || battery.current || 0;

        const voltText = voltage.toFixed(1) + ' V';
        const currText = current.toFixed(1) + ' A';

        this.updateText('battery', voltText);
        this.updateText('extBattery', voltText);
        this.updateText('overlayBat', voltText);

        this.updateText('current', currText);
        this.updateText('extCurrent', currText);

        if (battery.rssi !== undefined) {
            this.telemetryData.rssi = battery.rssi;
            const rssiText = battery.rssi + ' dBm';
            this.updateText('rssi', rssiText);
            this.updateText('extRssi', rssiText);
        }
    }

    /**
     * Update battery state
     */
    updateBatteryState(battery) {
        this.telemetryData.battery = { ...this.telemetryData.battery, ...battery };

        const voltText = battery.batteryVoltage.toFixed(1) + ' V';
        const currText = battery.amperage.toFixed(1) + ' A';

        this.updateText('battery', voltText);
        this.updateText('extBattery', voltText);
        this.updateText('overlayBat', voltText);

        this.updateText('current', currText);
        this.updateText('extCurrent', currText);
    }

    /**
     * Update status
     */
    updateStatus(status) {
        this.telemetryData.armed = status.armed;

        let modeText = 'DISARMED';
        if (status.activeModes && status.activeModes.length > 0) {
            modeText = status.activeModes.join(', ');
        } else {
            modeText = status.armed ? 'ARMED' : 'DISARMED';
        }
        this.telemetryData.flightMode = modeText;

        this.updateText('flightMode', modeText);
        this.updateText('extFlightMode', modeText);
    }

    /**
     * Update vario
     */
    updateVario(vario) {
        this.telemetryData.vario = vario.verticalSpeed;
        this.instruments.updateVerticalSpeed(vario.verticalSpeed);
    }

    /**
     * Update link statistics
     */
    updateLinkStats(stats) {
        const rssi = stats.uplinkRSSI1 || stats.downlinkRSSI || 0;
        this.telemetryData.rssi = rssi;
        const rssiText = rssi + ' dBm';
        this.updateText('rssi', rssiText);
        this.updateText('extRssi', rssiText);

        // Link Quality
        const lq = stats.uplinkLinkQuality || 0;
        this.updateText('extLinkQuality', lq + '%');

        // Tx Power (Mapping could be added here, raw value for now)
        const txPower = stats.uplinkTXPower !== undefined ? stats.uplinkTXPower : '--';
        this.updateText('extTxPower', txPower);
    }

    /**
     * Update map position
     */
    updateMapPosition(lat, lon, heading) {
        this.aircraftMarker.setLatLng([lat, lon]);
        this.aircraftMarker.setRotationAngle(heading);

        // Add to flight path
        this.pathCoordinates.push([lat, lon]);
        this.flightPath.setLatLngs(this.pathCoordinates);

        // Center map on aircraft
        this.map.setView([lat, lon], Math.max(this.map.getZoom(), 15));
    }

    /**
     * Set home position
     */
    setHomePosition(lat, lon) {
        this.homePosition = { lat, lon };
        this.homeMarker.setLatLng([lat, lon]);
        this.homeMarker.addTo(this.map);
    }

    /**
     * Calculate distance between two coordinates
     */
    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371e3; // Earth radius in meters
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lon2 - lon1) * Math.PI / 180;

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
    }

    /**
     * Initialize mirroring (Socket.IO)
     */
    initMirroring() {
        if (typeof io === 'undefined') return;

        this.socket = io();

        this.socket.on('connect', () => {
            console.log('Connected to Relay Server');
        });

        this.socket.on('telemetry_update', (data) => {
            if (!this.isConnected) {
                this.applyRemoteData(data);
            }
        });
    }

    /**
     * Start broadcasting telemetry
     */
    startBroadcastLoop() {
        if (this.broadcastInterval) clearInterval(this.broadcastInterval);
        this.broadcastInterval = setInterval(() => {
            if (this.socket && this.isConnected) {
                this.socket.emit('telemetry_data', this.telemetryData);
            }
        }, 100);
    }

    /**
     * Stop broadcasting telemetry
     */
    stopBroadcastLoop() {
        if (this.broadcastInterval) {
            clearInterval(this.broadcastInterval);
            this.broadcastInterval = null;
        }
    }

    /**
     * Apply remote telemetry data
     */
    applyRemoteData(data) {
        if (data.gps) this.updateGPS(data.gps);
        if (data.attitude) this.updateAttitude(data.attitude);
        if (data.altitude !== undefined) this.updateAltitude({ estimatedAltitude: data.altitude * 100 });
        if (data.battery) this.updateBatteryState(data.battery);

        if (data.flightMode) {
            this.updateText('flightMode', data.flightMode);
            this.updateText('extFlightMode', data.flightMode);
        }

        if (data.rssi !== undefined) {
            const rssiText = data.rssi + ' dBm';
            this.updateText('rssi', rssiText);
            this.updateText('extRssi', rssiText);
        }

        // Update connection status indicator to show we are receiving data
        const statusEl = document.getElementById('connectionStatus');
        const indicator = statusEl.querySelector('.status-indicator');
        const text = statusEl.querySelector('span');

        if (text.textContent === 'Disconnected') {
            text.textContent = 'Remote View';
            indicator.classList.remove('disconnected');
            indicator.classList.add('connected');
            // Add a visual cue color for remote? Blue/Green is fine.
        }
    }

    /**
     * Update connection status
     */
    updateConnectionStatus(connected, type = '') {
        // Handle Broadcasting
        if (connected) {
            this.startBroadcastLoop();
        } else {
            this.stopBroadcastLoop();
        }

        const statusEl = document.getElementById('connectionStatus');
        const indicator = statusEl.querySelector('.status-indicator');
        const text = statusEl.querySelector('span');

        if (connected) {
            indicator.classList.remove('disconnected');
            indicator.classList.add('connected');
            text.textContent = `Connected (${type})`;
        } else {
            indicator.classList.remove('connected');
            indicator.classList.add('disconnected');
            text.textContent = 'Disconnected';
        }
    }

    /**
     * Switch tab
     */
    switchTab(tabName) {
        // Update buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });

        // Update panes
        document.querySelectorAll('.tab-pane').forEach(pane => {
            pane.classList.toggle('active', pane.id === tabName + 'Tab');
        });
    }

    /**
     * Toggle recording
     */
    toggleRecording() {
        if (this.isRecording) {
            this.stopRecording();
        } else {
            this.startRecording();
        }
    }

    /**
     * Start recording
     */
    startRecording() {
        this.isRecording = true;
        this.recordingStartTime = Date.now();

        const btn = document.getElementById('recordBtn');
        btn.textContent = 'Stop Recording';
        btn.classList.remove('btn-secondary');
        btn.classList.add('btn-danger');

        document.getElementById('recordingInfo').classList.remove('hidden');

        // Update recording time
        this.recordingInterval = setInterval(() => {
            const elapsed = Date.now() - this.recordingStartTime;
            const hours = Math.floor(elapsed / 3600000);
            const minutes = Math.floor((elapsed % 3600000) / 60000);
            const seconds = Math.floor((elapsed % 60000) / 1000);

            document.getElementById('recordingTime').textContent =
                `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

            // Log data
            this.logData();
        }, this.settings.logInterval);
    }

    /**
     * Stop recording
     */
    stopRecording() {
        this.isRecording = false;

        if (this.recordingInterval) {
            clearInterval(this.recordingInterval);
            this.recordingInterval = null;
        }

        const btn = document.getElementById('recordBtn');
        btn.textContent = 'Start Recording';
        btn.classList.remove('btn-danger');
        btn.classList.add('btn-secondary');

        document.getElementById('recordingInfo').classList.add('hidden');
    }

    /**
     * Log telemetry data
     */
    logData() {
        const dataPoint = {
            timestamp: new Date().toISOString(),
            ...this.telemetryData
        };

        this.flightData.push(dataPoint);
        this.updateDataTable();
    }

    /**
     * Update data table
     */
    updateDataTable() {
        const tbody = document.getElementById('dataTableBody');

        if (this.flightData.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="no-data">No data recorded yet</td></tr>';
            return;
        }

        // Show last 100 entries
        const recentData = this.flightData.slice(-100);

        tbody.innerHTML = recentData.map(data => `
            <tr>
                <td>${new Date(data.timestamp).toLocaleTimeString()}</td>
                <td>${data.gps.lat.toFixed(6)}</td>
                <td>${data.gps.lon.toFixed(6)}</td>
                <td>${data.altitude.toFixed(1)}</td>
                <td>${data.gps.speed.toFixed(1)}</td>
                <td>${data.battery.voltage?.toFixed(1) || '0.0'}</td>
                <td>${data.rssi}</td>
                <td>${data.flightMode}</td>
            </tr>
        `).join('');
    }

    /**
     * Export data to CSV
     */
    exportData() {
        if (this.flightData.length === 0) {
            alert('No data to export');
            return;
        }

        const csv = [
            ['Timestamp', 'Latitude', 'Longitude', 'Altitude (m)', 'Speed (km/h)', 'Battery (V)', 'RSSI (dBm)', 'Flight Mode'],
            ...this.flightData.map(d => [
                d.timestamp,
                d.gps.lat,
                d.gps.lon,
                d.altitude,
                d.gps.speed,
                d.battery.voltage || 0,
                d.rssi,
                d.flightMode
            ])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `flight-data-${new Date().toISOString()}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }

    /**
     * Clear data
     */
    clearData() {
        if (confirm('Are you sure you want to clear all recorded data?')) {
            this.flightData = [];
            this.pathCoordinates = [];
            this.flightPath.setLatLngs([]);
            this.updateDataTable();
        }
    }

    /**
     * Connect camera
     */
    connectCamera() {
        const url = document.getElementById('streamUrl').value;
        if (!url) {
            alert('Please enter a stream URL');
            return;
        }

        // Check if it's MJPEG or WebRTC
        if (url.includes('mjpeg') || url.endsWith('.mjpg')) {
            // MJPEG stream
            const img = document.getElementById('mjpegFeed');
            img.src = url;
            img.classList.remove('hidden');
            document.getElementById('cameraPlaceholder').style.display = 'none';
        } else {
            alert('Currently only MJPEG streams are supported. Enter a URL ending in .mjpg or containing "mjpeg"');
        }
    }

    /**
     * Update map provider
     */
    updateMapProvider() {
        const provider = this.settings.mapProvider;

        // Remove existing layers
        this.map.eachLayer((layer) => {
            if (layer instanceof L.TileLayer) {
                this.map.removeLayer(layer);
            }
        });

        // Add new layer
        let tileLayer;
        switch (provider) {
            case 'satellite':
                tileLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                    attribution: 'Tiles &copy; Esri'
                });
                break;
            case 'terrain':
                tileLayer = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
                    attribution: 'Map data: &copy; OpenStreetMap contributors, SRTM | Map style: &copy; OpenTopoMap'
                });
                break;
            default: // osm
                tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; OpenStreetMap contributors'
                });
        }

        tileLayer.addTo(this.map);
    }

    /**
     * Open settings modal
     */
    openSettings() {
        document.getElementById('settingsModal').classList.remove('hidden');

        // Load current settings
        document.getElementById('mapProvider').value = this.settings.mapProvider;
        document.getElementById('distanceUnit').value = this.settings.distanceUnit;
        document.getElementById('speedUnit').value = this.settings.speedUnit;
        document.getElementById('autoRecord').checked = this.settings.autoRecord;
        document.getElementById('logInterval').value = this.settings.logInterval;
    }

    /**
     * Close settings modal
     */
    closeSettings() {
        document.getElementById('settingsModal').classList.add('hidden');
    }

    /**
     * Save settings
     */
    saveSettings() {
        this.settings.mapProvider = document.getElementById('mapProvider').value;
        this.settings.distanceUnit = document.getElementById('distanceUnit').value;
        this.settings.speedUnit = document.getElementById('speedUnit').value;
        this.settings.autoRecord = document.getElementById('autoRecord').checked;
        this.settings.logInterval = parseInt(document.getElementById('logInterval').value);

        localStorage.setItem('groundStationSettings', JSON.stringify(this.settings));

        this.updateMapProvider();
        this.closeSettings();
    }

    /**
     * Load settings
     */
    loadSettings() {
        const saved = localStorage.getItem('groundStationSettings');
        if (saved) {
            this.settings = { ...this.settings, ...JSON.parse(saved) };
        }
    }
}

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.groundStation = new GroundStation();
});

// Add rotation support to Leaflet markers
L.Marker.include({
    setRotationAngle: function (angle) {
        this._icon.style.transform += ` rotate(${angle}deg)`;
    }
});
