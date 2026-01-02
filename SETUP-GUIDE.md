# iNav Ground Station - Complete Setup Guide

## 🎯 What You Have

I've created a **professional ground station** for your SpeedyBee F405 Wing flight controller running iNav 8.0.1. This ground station supports:

### ✅ Dual Connection Methods
1. **USB Direct** - Connect FC directly to PC via USB (MSP protocol)
2. **ExpressLRS** - Wireless telemetry via your ELRS receiver (CRSF protocol)

### ✅ Features Included

#### Real-Time Telemetry Display
- GPS position (latitude/longitude)
- Number of satellites and fix status
- Altitude (meters)
- Ground speed (km/h)
- Battery voltage and current
- RSSI signal strength
- Flight modes
- Distance to home
- Heading/compass

#### Interactive Map
- Live aircraft position with heading indicator
- Home position marker
- Flight path tracking
- Multiple map providers:
  - OpenStreetMap (default)
  - Satellite imagery
  - Terrain maps
- Auto-centering on aircraft

#### Flight Instruments
- **Artificial Horizon** - Real-time pitch and roll visualization
- **Compass** - 360° heading indicator
- **Variometer** - Vertical speed (climb/descent rate)
- **Altitude Graph** - Historical altitude tracking

#### Camera Feed Support
- MJPEG stream support
- Configurable stream URL
- Full-screen video display

#### Data Logging & Export
- Real-time data recording
- Configurable log intervals
- CSV export for analysis
- Auto-record on connection option

## 📁 Files Created

```
ground-station/
├── index.html          # Main application
├── styles.css          # Premium dark theme UI
├── msp.js             # MSP protocol for USB connection
├── crsf.js            # CRSF protocol for ExpressLRS
├── instruments.js     # Flight instruments rendering
├── app.js             # Main application logic
├── README.md          # Full documentation
└── QUICKSTART.md      # Quick start guide
```

## 🚀 How to Use

### Step 1: Open the Ground Station

**Option A: Direct File**
1. Navigate to: `C:\Users\donate\Desktop\8.0.1\inav-8.0.1\ground-station`
2. Double-click `index.html`
3. It will open in your default browser

**Option B: Local Server (Recommended)**
```bash
cd C:\Users\donate\Desktop\8.0.1\inav-8.0.1\ground-station
python -m http.server 8000
```
Then open: http://localhost:8000

### Step 2: Configure iNav (One-Time Setup)

#### For USB Connection (MSP):

1. Open **iNav Configurator**
2. Connect your FC via USB
3. Go to **Ports** tab
4. Find **USB VCP** row
5. Enable **MSP** checkbox
6. Set baud rate: **115200**
7. Click **Save and Reboot**

#### For ExpressLRS (CRSF):

1. Open **iNav Configurator**
2. Connect your FC via USB
3. Go to **Ports** tab
4. Find the UART where your ELRS receiver is connected (usually UART1 or UART2)
5. Set the following:
   - **Serial RX**: ✅ Enabled
   - **Protocol**: CRSF
   - **Baud Rate**: 420000
   - **Telemetry**: ✅ Enabled
6. Click **Save and Reboot**
7. Go to **Receiver** tab
8. Set:
   - **Receiver Type**: Serial
   - **Serial Protocol**: CRSF
9. Click **Save**

### Step 3: Connect to Ground Station

#### USB Connection:
1. In ground station, click **USB Direct** button
2. Select baud rate: **115200**
3. Click **Connect**
4. Browser will show serial port picker
5. Select your FC's COM port (e.g., "USB Serial Device (COM3)")
6. Click **Connect**
7. Wait for telemetry data to appear!

#### ExpressLRS Connection:
1. Connect your ELRS receiver to PC via USB
2. In ground station, click **ExpressLRS** button
3. Select baud rate: **420000**
4. Click **Connect**
5. Select ELRS receiver's COM port
6. Click **Connect**
7. Telemetry should start flowing!

## 🎮 Using the Interface

### Main Tabs

1. **Map Tab** (Default)
   - Shows live GPS position
   - Aircraft marker rotates with heading
   - Green home marker shows takeoff point
   - Blue line shows flight path
   - Info card shows coordinates and distance

2. **Instruments Tab**
   - Artificial Horizon: Shows pitch and roll
   - Compass: Shows heading in degrees
   - Variometer: Shows climb/descent rate
   - Altitude Graph: Historical altitude

3. **Camera Tab**
   - Enter MJPEG stream URL
   - Example: `http://192.168.1.100:8080/video.mjpg`
   - Click "Connect Camera"

4. **Data Tab**
   - Real-time data table
   - Shows last 100 data points
   - Export to CSV button
   - Clear data button

### Recording Flight Data

1. Click **Start Recording** in sidebar
2. Recording indicator appears (red dot)
3. Data is logged at set interval (default: 1 second)
4. Click **Stop Recording** when done
5. Go to **Data** tab
6. Click **Export CSV** to save

### Settings

Click the **⚙️ gear icon** in top-right to access:

- **Map Provider**: Choose map style
- **Distance Unit**: Metric or Imperial
- **Speed Unit**: km/h, mph, or m/s
- **Auto-record**: Start recording on connection
- **Log Interval**: How often to log data (milliseconds)

## 📊 Telemetry Data Explained

### Sidebar Telemetry Panel

| Field | Description | Example |
|-------|-------------|---------|
| GPS | Fix status | "3D Fix" or "No Fix" |
| Satellites | Number of GPS satellites | "12" |
| Altitude | Height above home | "45.2 m" |
| Speed | Ground speed | "25.3 km/h" |
| Distance | Distance from home | "150 m" |
| Battery | Main battery voltage | "12.6 V" |
| Current | Battery current draw | "5.2 A" |
| RSSI | Signal strength | "-85 dBm" |
| Flight Mode | Active flight mode | "ANGLE, GPS HOLD" |
| Heading | Compass direction | "245°" |

## 🔧 Troubleshooting

### "Web Serial API not supported"
**Solution**: Use Chrome, Edge, or Opera browser (latest version)

### No serial ports appear
**Solution**: 
- Click "Connect" button to request permission
- Check USB cable is connected
- Try different USB port
- Check Device Manager for COM port

### Connected but no telemetry
**USB Connection**:
- Verify MSP is enabled in iNav Ports tab
- Check baud rate matches (115200)
- Try disconnecting and reconnecting

**ELRS Connection**:
- Verify CRSF protocol is set in iNav
- Check baud rate is 420000
- Ensure telemetry is enabled on UART
- Check receiver is powered and bound

### GPS shows "No Fix"
- Wait 30-60 seconds for GPS to acquire satellites
- Must be outdoors with clear sky view
- Check GPS module is connected in iNav
- Verify GPS is configured in iNav Configuration tab

### Map not loading
- Check internet connection (map tiles require internet)
- Try different map provider in Settings
- Check browser console (F12) for errors

### Instruments not updating
- Check that attitude data is being received
- Verify FC is level for horizon calibration
- Check browser console for JavaScript errors

## 💡 Pro Tips

### Before First Flight
1. Connect via USB to verify all sensors
2. Get GPS fix while on ground
3. Check battery voltage is correct
4. Verify all flight modes work
5. Test RSSI readings

### During Flight
1. Monitor battery voltage constantly
2. Keep eye on RSSI for range
3. Watch altitude for height limits
4. Check GPS satellite count (should be 8+)
5. Record flight for later analysis

### After Flight
1. Export flight data to CSV
2. Review altitude graph
3. Check max distance traveled
4. Analyze battery consumption
5. Save data for flight log

## 🎨 Interface Features

### Premium Dark Theme
- Modern glassmorphism effects
- Blue/purple gradient accents
- Smooth animations and transitions
- High contrast for outdoor visibility

### Responsive Design
- Works on desktop and laptop
- Optimized for 1920x1080 and higher
- Sidebar can be collapsed on smaller screens

### Real-Time Updates
- Telemetry updates at 10Hz (USB) or 4-10Hz (ELRS)
- Instruments animate smoothly
- Map updates in real-time
- No lag or stuttering

## 📡 Protocol Details

### MSP (USB Connection)
- Protocol: MSP v1
- Baud Rate: 115200 (configurable)
- Update Rate: ~10 Hz
- Messages: STATUS, GPS, ATTITUDE, ALTITUDE, ANALOG, BATTERY

### CRSF (ExpressLRS)
- Protocol: CRSF (Crossfire)
- Baud Rate: 420000
- Update Rate: Depends on ELRS packet rate
- Frames: GPS, BATTERY, ATTITUDE, VARIO, LINK_STATS

## 🔐 Browser Permissions

The ground station needs:
- **Serial Port Access**: To communicate with FC/receiver
- **Internet Access**: To load map tiles

Permissions are:
- Requested when you click "Connect"
- Saved per-browser, per-site
- Can be revoked in browser settings
- No data is sent to external servers (except map tiles)

## 📈 Data Export Format

CSV export includes these columns:
```
Timestamp, Latitude, Longitude, Altitude (m), Speed (km/h), Battery (V), RSSI (dBm), Flight Mode
```

Example:
```csv
2026-01-02T13:45:23.000Z,40.712776,-74.005974,45.2,25.3,12.6,-85,ANGLE
```

Import into:
- Microsoft Excel
- Google Sheets
- MATLAB
- Python (pandas)
- Any CSV-compatible software

## 🚁 Recommended Workflow

### Pre-Flight Checklist
- [ ] Open ground station
- [ ] Connect via USB
- [ ] Verify all sensors working
- [ ] Check GPS fix acquired
- [ ] Verify battery voltage
- [ ] Test flight modes
- [ ] Disconnect USB
- [ ] Power on aircraft
- [ ] Connect via ELRS (if using wireless)
- [ ] Start recording
- [ ] Ready to fly!

### Post-Flight
- [ ] Stop recording
- [ ] Export flight data
- [ ] Review max altitude
- [ ] Check battery usage
- [ ] Save flight log
- [ ] Disconnect

## 🎯 Next Steps

1. **Test USB Connection**
   - Connect FC via USB
   - Verify telemetry works
   - Test all tabs and features

2. **Configure ELRS** (if using wireless)
   - Set up CRSF in iNav
   - Test telemetry reception
   - Verify range

3. **Customize Settings**
   - Choose preferred map style
   - Set units (metric/imperial)
   - Configure auto-record
   - Adjust log interval

4. **First Flight**
   - Start with USB connection
   - Get GPS fix on ground
   - Record flight data
   - Review after landing

## 📞 Support Resources

- **iNav Wiki**: https://github.com/iNavFlight/inav/wiki
- **ExpressLRS Docs**: https://www.expresslrs.org/
- **Web Serial API**: https://developer.mozilla.org/en-US/docs/Web/API/Web_Serial_API

---

## ✨ What Makes This Special

This ground station is:
- ✅ **Free and Open Source** - No subscriptions or licenses
- ✅ **No Installation Required** - Just open in browser
- ✅ **Cross-Platform** - Works on Windows, Mac, Linux
- ✅ **Dual Protocol** - MSP and CRSF support
- ✅ **Professional Grade** - Premium UI and features
- ✅ **Fully Offline** - No cloud dependency (except maps)
- ✅ **Customizable** - All code is editable
- ✅ **Lightweight** - No heavy frameworks

**Enjoy your new ground station! Happy flying! 🚁**
