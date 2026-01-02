# iNav Ground Station for SpeedyBee F405 Wing

A professional, feature-rich ground station for iNav 8.0.1 with support for both direct USB connection (MSP protocol) and ExpressLRS telemetry (CRSF protocol).

![Ground Station](screenshot.png)

## Features

### 🔌 Dual Connection Support
- **USB Direct**: Connect your SpeedyBee F405 Wing FC directly via USB using MSP (MultiWii Serial Protocol)
- **ExpressLRS**: Receive telemetry wirelessly through your ExpressLRS receiver using CRSF protocol

### 📡 Real-Time Telemetry
- GPS position, satellites, and fix status
- Altitude and vertical speed
- Ground speed and heading
- Battery voltage and current
- RSSI and link quality
- Flight modes and arm status
- Distance to home

### 🗺️ Interactive Map
- Real-time aircraft position tracking
- Home position marker
- Flight path visualization
- Multiple map providers (OpenStreetMap, Satellite, Terrain)
- Auto-centering on aircraft

### 🛩️ Flight Instruments
- **Artificial Horizon**: Real-time pitch and roll display
- **Compass**: Heading indicator with cardinal directions
- **Variometer**: Vertical speed indicator
- **Altitude Graph**: Historical altitude tracking

### 📹 Camera Feed
- MJPEG stream support
- WebRTC support (planned)
- Configurable stream URL

### 📊 Data Logging
- CSV export of flight data
- Configurable log intervals
- Auto-record on connection
- Real-time data table view

## Requirements

### Browser
This ground station uses the **Web Serial API**, which is supported in:
- Google Chrome 89+
- Microsoft Edge 89+
- Opera 75+

**Note**: Firefox and Safari do not currently support Web Serial API.

### Hardware
- **Flight Controller**: SpeedyBee F405 Wing (or any iNav 8.0.1 compatible FC)
- **Firmware**: iNav 8.0.1
- **Radio**: EdgeTX transmitter with ExpressLRS (ELRS)
- **Receiver**: ExpressLRS receiver connected to FC

### Connection Options

#### Option 1: USB Direct Connection
1. Connect FC to PC via USB cable
2. Select "USB Direct" in the ground station
3. Choose baud rate (default: 115200)
4. Click "Connect" and select the serial port

#### Option 2: ExpressLRS Receiver
1. Connect ExpressLRS receiver to PC via USB
2. Select "ExpressLRS" in the ground station
3. Choose baud rate (default: 420000 for ELRS)
4. Click "Connect" and select the serial port

## Installation

1. **Clone or download this repository**
   ```bash
   cd c:\Users\donate\Desktop\8.0.1\inav-8.0.1\ground-station
   ```

2. **No build required!** This is a pure HTML/CSS/JavaScript application.

3. **Open in browser**
   - Simply open `index.html` in Chrome, Edge, or Opera
   - Or use a local web server (recommended):
     ```bash
     # Using Python
     python -m http.server 8000
     
     # Using Node.js
     npx http-server
     ```
   - Then navigate to `http://localhost:8000`

## Usage

### First Connection

1. **Open the ground station** in a supported browser
2. **Choose connection type**:
   - USB Direct for wired connection
   - ExpressLRS for wireless telemetry
3. **Click Connect** and select your serial port
4. **Wait for GPS fix** - the map will auto-center once GPS is acquired
5. **Start recording** (optional) to log flight data

### iNav Configuration

#### For USB Direct (MSP)
1. In iNav Configurator, go to **Ports** tab
2. Enable **MSP** on your USB VCP port
3. Set baud rate to **115200** (or your preferred rate)
4. Save and reboot

#### For ExpressLRS (CRSF)
1. In iNav Configurator, go to **Ports** tab
2. Enable **Serial RX** on the UART connected to your ELRS receiver
3. Set protocol to **CRSF**
4. Set baud rate to **420000**
5. Go to **Receiver** tab
6. Set receiver type to **SERIAL**
7. Set protocol to **CRSF**
8. Enable **TELEMETRY** on the same port
9. Save and reboot

### Camera Feed Setup

1. Navigate to the **Camera** tab
2. Enter your camera stream URL:
   - MJPEG example: `http://192.168.1.100:8080/video.mjpg`
   - For FPV cameras with WiFi modules
3. Click "Connect Camera"

### Data Logging

1. Click **Start Recording** to begin logging
2. Data is logged at the interval set in Settings (default: 1 second)
3. View real-time data in the **Data** tab
4. Export to CSV for analysis in Excel, Google Sheets, etc.

## Settings

Access settings by clicking the gear icon in the top-right corner.

### Map Settings
- **Map Provider**: Choose between OpenStreetMap, Satellite, or Terrain

### Units
- **Distance**: Metric (m/km) or Imperial (ft/mi)
- **Speed**: km/h, mph, or m/s

### Data Logging
- **Auto-start recording**: Automatically start recording when connected
- **Log Interval**: How often to log data points (in milliseconds)

## Troubleshooting

### "Web Serial API not supported"
- Make sure you're using Chrome, Edge, or Opera
- Update your browser to the latest version

### No telemetry data
- **USB**: Check that MSP is enabled on the correct port in iNav
- **ELRS**: Verify CRSF is configured correctly and telemetry is enabled
- Check baud rate matches your iNav configuration
- Try disconnecting and reconnecting

### GPS not working
- Wait for GPS fix (can take 30-60 seconds outdoors)
- Check GPS module is connected and configured in iNav
- Ensure you're outdoors with clear sky view

### Map not loading
- Check internet connection (map tiles require internet)
- Try changing map provider in Settings
- Check browser console for errors (F12)

### Camera feed not displaying
- Verify stream URL is correct
- Only MJPEG streams are currently supported
- Check camera is accessible from your PC
- Try opening stream URL directly in browser

## Protocol Details

### MSP (MultiWii Serial Protocol)
The ground station implements MSP v1 for iNav 8.0.1, requesting:
- `MSP_STATUS` - Flight mode and arm status
- `MSP_RAW_GPS` - GPS position and satellites
- `MSP_ATTITUDE` - Roll, pitch, yaw
- `MSP_ALTITUDE` - Altitude and vertical speed
- `MSP_ANALOG` - Battery voltage, current, RSSI
- `MSP_BATTERY_STATE` - Detailed battery information

### CRSF (Crossfire Protocol)
The ground station parses CRSF telemetry frames:
- `CRSF_FRAMETYPE_GPS` - GPS telemetry
- `CRSF_FRAMETYPE_BATTERY_SENSOR` - Battery data
- `CRSF_FRAMETYPE_ATTITUDE` - Attitude data
- `CRSF_FRAMETYPE_VARIO` - Vertical speed
- `CRSF_FRAMETYPE_LINK_STATISTICS` - RSSI and link quality
- `CRSF_FRAMETYPE_FLIGHT_MODE` - Current flight mode

## File Structure

```
ground-station/
├── index.html          # Main HTML structure
├── styles.css          # Premium dark theme styling
├── msp.js             # MSP protocol implementation
├── crsf.js            # CRSF protocol implementation
├── instruments.js     # Flight instruments visualization
├── app.js             # Main application logic
└── README.md          # This file
```

## Advanced Features

### Custom Map Markers
The aircraft and home markers are SVG-based and can be customized in `app.js`:
- Aircraft marker rotates based on heading
- Home marker shows takeoff location
- Flight path shows historical track

### Data Export Format
CSV export includes:
- Timestamp (ISO 8601)
- Latitude/Longitude (decimal degrees)
- Altitude (meters)
- Speed (km/h)
- Battery voltage (V)
- RSSI (dBm)
- Flight mode

## Future Enhancements

- [ ] WebRTC camera support
- [ ] Mission planning and waypoint upload
- [ ] Real-time graphing of telemetry
- [ ] Blackbox log viewer
- [ ] Multi-aircraft support
- [ ] 3D visualization
- [ ] Geofencing and alerts
- [ ] OSD configuration

## Credits

- **iNav**: https://github.com/iNavFlight/inav
- **ExpressLRS**: https://www.expresslrs.org/
- **Leaflet**: https://leafletjs.com/
- **Web Serial API**: https://developer.mozilla.org/en-US/docs/Web/API/Web_Serial_API

## License

MIT License - Feel free to use and modify for your own projects!

## Support

For issues or questions:
1. Check the Troubleshooting section above
2. Review iNav documentation: https://github.com/iNavFlight/inav/wiki
3. Check ExpressLRS documentation: https://www.expresslrs.org/

---

**Happy Flying! 🚁**
#   g r o u n d - c o n t r o l l  
 