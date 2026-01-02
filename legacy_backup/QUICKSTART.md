# Quick Start Guide - iNav Ground Station

## 🚀 Getting Started in 3 Steps

### Step 1: Open the Ground Station
1. Open `index.html` in **Chrome**, **Edge**, or **Opera**
2. Or run a local server:
   ```bash
   python -m http.server 8000
   ```
   Then go to: http://localhost:8000

### Step 2: Configure iNav

#### For USB Connection:
1. Open iNav Configurator
2. Go to **Ports** tab
3. Enable **MSP** on USB VCP
4. Set baud rate: **115200**
5. Save & Reboot

#### For ExpressLRS:
1. Open iNav Configurator
2. Go to **Ports** tab
3. On the UART with your ELRS receiver:
   - Enable **Serial RX**
   - Set protocol: **CRSF**
   - Set baud rate: **420000**
   - Enable **TELEMETRY**
4. Go to **Receiver** tab
5. Set receiver type: **SERIAL**
6. Set protocol: **CRSF**
7. Save & Reboot

### Step 3: Connect!
1. Click **USB Direct** or **ExpressLRS**
2. Select baud rate
3. Click **Connect**
4. Choose your serial port
5. Wait for telemetry! 🎉

## 📍 Important Notes

### GPS Fix
- Takes 30-60 seconds outdoors
- Needs clear view of sky
- Map will auto-center when GPS locks

### Telemetry Rates
- **USB (MSP)**: ~10Hz (100ms interval)
- **ELRS (CRSF)**: Depends on packet rate (usually 4-10Hz)

### Browser Permissions
- You'll need to grant serial port access
- This is saved per-site
- You can revoke in browser settings

## 🎮 Controls

### Tabs
- **Map**: Live GPS tracking and flight path
- **Instruments**: Artificial horizon, compass, variometer
- **Camera**: Video feed (MJPEG streams)
- **Data**: Flight data table and export

### Recording
- Click **Start Recording** to log data
- Auto-record option in Settings
- Export to CSV anytime

### Settings (⚙️)
- Map provider (OSM, Satellite, Terrain)
- Units (metric/imperial)
- Auto-record
- Log interval

## ⚡ Pro Tips

1. **Set home before takeoff**: First GPS fix becomes home position
2. **Use satellite view**: Better for outdoor flying
3. **Record everything**: Enable auto-record in settings
4. **Monitor battery**: Keep eye on voltage/current
5. **Check RSSI**: Especially important for long range

## 🔧 Troubleshooting Quick Fixes

| Problem | Solution |
|---------|----------|
| No serial ports | Click Connect to request access |
| No telemetry | Check baud rate and protocol |
| No GPS | Wait 60s outdoors, check iNav config |
| Map not loading | Check internet connection |
| Camera not working | Verify MJPEG URL |

## 📱 Recommended Setup

### For Best Experience:
1. **Laptop/Desktop** with Chrome
2. **USB connection** for setup/testing
3. **ELRS** for actual flights
4. **External monitor** for better visibility
5. **Backup power** for laptop

### Typical Workflow:
1. Connect via USB
2. Verify all sensors working
3. Get GPS fix
4. Disconnect USB
5. Power on aircraft
6. Connect via ELRS receiver
7. Start recording
8. Fly! 🚁

---

**Need help?** Check the full README.md for detailed documentation!
