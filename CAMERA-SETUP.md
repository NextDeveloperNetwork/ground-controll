# Camera Setup Guide - Skydroid Receiver

## 🎥 Skydroid Receiver Integration

Your **Skydroid receiver** (like T12, H12, or similar) can stream video to the ground station!

### Skydroid Receiver Models

Common Skydroid receivers with WiFi/streaming:
- **Skydroid T12** - 5.8GHz receiver with WiFi streaming
- **Skydroid H12** - HDMI receiver with network streaming
- **Skydroid UVC** - USB video capture device

---

## 📡 Setup Options

### Option 1: Skydroid WiFi Streaming (T12/H12)

#### Step 1: Connect to Skydroid WiFi

1. Power on your Skydroid receiver
2. On your PC, connect to Skydroid's WiFi network:
   - **SSID**: Usually `Skydroid_XXXX` or `FPV_XXXX`
   - **Password**: Check your Skydroid manual (often `12345678` or printed on device)

#### Step 2: Find Stream URL

Skydroid receivers typically stream on:
```
http://192.168.169.1:8080/video.mjpg
```

Or try these common URLs:
```
http://192.168.169.1:8080/
http://192.168.1.1:8080/video.mjpg
http://10.0.0.1:8080/video.mjpg
```

#### Step 3: Configure in Ground Station

1. Open ground station
2. Click **Camera** tab
3. In the stream URL field, enter:
   ```
   http://192.168.169.1:8080/video.mjpg
   ```
4. Click **Connect Camera**
5. Video should appear!

#### Step 4: Verify Connection

✅ **Success**: Video feed appears in Camera tab  
❌ **Failed**: Try these troubleshooting steps below

---

### Option 2: Skydroid UVC (USB Video)

If you have a Skydroid UVC receiver:

#### Current Limitation
The ground station currently supports **MJPEG streams only**. For USB video devices, you'll need to:

1. **Use OBS Studio** or similar to convert USB video to MJPEG stream
2. **Use VLC Media Player** to stream

#### Quick VLC Setup:

1. Install VLC Media Player
2. Open VLC → Media → Stream
3. Select your Skydroid UVC device
4. Choose HTTP streaming
5. Set format to MJPEG
6. Start streaming on port 8080
7. Use URL: `http://localhost:8080/video.mjpg`

---

## 🎬 Using the Camera Tab

### Interface Overview

When you open the **Camera** tab, you'll see:

```
┌─────────────────────────────────────┐
│                                     │
│         Camera Feed Area            │
│      (Video appears here)           │
│                                     │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│ Stream URL: [________________]  [Connect Camera] │
└─────────────────────────────────────┘
```

### Step-by-Step Usage

1. **Enter Stream URL**
   - Click in the text field
   - Type or paste your Skydroid stream URL
   - Example: `http://192.168.169.1:8080/video.mjpg`

2. **Click Connect Camera**
   - The placeholder will disappear
   - Video feed will appear
   - May take 2-3 seconds to load

3. **Full Screen** (Optional)
   - Right-click on video
   - Select "Full Screen" or press F11
   - Press ESC to exit

### Supported Formats

✅ **MJPEG** (Motion JPEG)
- Most common for FPV
- Low latency
- Works with Skydroid

❌ **H.264/H.265** (Not yet supported)
❌ **WebRTC** (Planned for future)

---

## 🛩️ Using Flight Instruments

### Accessing Instruments

1. Click the **Instruments** tab in the top navigation
2. You'll see 4 instrument panels:

```
┌──────────────┬──────────────┐
│   Artificial │   Compass    │
│    Horizon   │              │
├──────────────┼──────────────┤
│  Variometer  │   Altitude   │
│              │    Graph     │
└──────────────┴──────────────┘
```

### Instrument Details

#### 1. Artificial Horizon (Top Left)

**What it shows:**
- Aircraft pitch (nose up/down)
- Aircraft roll (banking left/right)
- Sky (blue) vs Ground (brown)
- Pitch ladder (10°, 20°, 30° marks)
- Roll indicator at top

**How to read:**
- **Level flight**: Horizon line is horizontal in center
- **Climbing**: Blue (sky) moves down, brown (ground) moves up
- **Descending**: Brown (ground) moves down, blue (sky) moves up
- **Banking left**: Horizon tilts right, roll indicator points left
- **Banking right**: Horizon tilts left, roll indicator points right

**Yellow aircraft symbol** (center):
- Fixed in center
- Represents your viewpoint
- Horizon moves around it

**Example readings:**
```
Pitch +15°, Roll 0° = Climbing straight
Pitch 0°, Roll +30° = Level turn right
Pitch -10°, Roll -20° = Descending turn left
```

#### 2. Compass (Top Right)

**What it shows:**
- Current heading in degrees (0-359°)
- Cardinal directions (N, NE, E, SE, S, SW, W, NW)
- Rotating compass rose
- Large heading number in center

**How to read:**
- **North (N)**: 0° or 360° - Red colored
- **East (E)**: 90°
- **South (S)**: 180°
- **West (W)**: 270°

**Blue triangle at top**:
- Fixed pointer
- Shows current heading direction

**Example readings:**
```
0° = Flying North
90° = Flying East
180° = Flying South
270° = Flying West
45° = Flying Northeast
```

#### 3. Variometer (Bottom Left)

**What it shows:**
- Vertical speed (climb/descent rate)
- Range: -10 to +10 m/s
- Green bar = climbing
- Red bar = descending
- Gray bar = level flight

**How to read:**
- **Positive values**: Climbing (green)
- **Negative values**: Descending (red)
- **Zero**: Level flight (gray)

**Scale markings:**
```
+10 m/s = Fast climb
+5 m/s = Moderate climb
0 m/s = Level
-5 m/s = Moderate descent
-10 m/s = Fast descent
```

**Example readings:**
```
+2.5 m/s = Gentle climb
-1.0 m/s = Slow descent
0.0 m/s = Maintaining altitude
```

#### 4. Altitude Graph (Bottom Right)

**What it shows:**
- Historical altitude over time
- Blue line = altitude trend
- Shaded area under line
- Current altitude at bottom
- Min/max altitude on Y-axis

**How to read:**
- **Rising line**: Gaining altitude
- **Falling line**: Losing altitude
- **Flat line**: Maintaining altitude
- **Steep changes**: Rapid altitude changes

**Time scale**:
- Shows last 100 data points
- Updates in real-time
- Scrolls left as new data arrives

---

## 🗺️ Using the Map

### Map Interface

The **Map** tab shows:

```
┌─────────────────────────────────────┐
│  ┌──────────────────────────────┐   │
│  │  Lat: 40.712776              │   │
│  │  Lon: -74.005974             │   │
│  │  Distance: 150 m             │   │
│  └──────────────────────────────┘   │
│                                     │
│         🛩️ ← Aircraft               │
│           \                         │
│            \  Flight Path           │
│             \                       │
│              🏠 ← Home              │
│                                     │
└─────────────────────────────────────┘
```

### Map Elements

#### Aircraft Marker (Blue Plane Icon)
- Shows current GPS position
- **Rotates** to match heading
- Updates in real-time
- Follows aircraft movement

#### Home Marker (Green House Icon)
- Shows takeoff/home position
- Set automatically on first GPS fix
- Used for distance calculation
- Return-to-home reference

#### Flight Path (Blue Line)
- Shows where you've flown
- Draws automatically as you fly
- Persists until cleared
- Useful for reviewing flight

#### Info Card (Top Right)
- **Latitude**: Current GPS latitude
- **Longitude**: Current GPS longitude
- **Home Distance**: Distance from home in meters

### Map Controls

**Zoom**:
- Mouse wheel to zoom in/out
- `+` and `-` buttons on map
- Double-click to zoom in

**Pan**:
- Click and drag to move map
- Map auto-centers on aircraft

**Change Map Style**:
1. Click ⚙️ Settings icon
2. Select **Map Provider**:
   - **OpenStreetMap**: Street map (default)
   - **Satellite**: Aerial imagery (best for flying)
   - **Terrain**: Topographic map
3. Click Save

### Map Usage Tips

**Before Flight**:
- Wait for GPS fix (8+ satellites)
- Verify home position is correct
- Check map is centered on aircraft

**During Flight**:
- Watch flight path for navigation
- Monitor distance to home
- Check heading matches intended direction
- Use satellite view for landmarks

**After Flight**:
- Review flight path
- Check max distance traveled
- Export data for analysis

---

## 🎯 Combining Camera + Instruments + Map

### Multi-Tab Workflow

You can switch between tabs during flight:

1. **Map Tab** - For navigation and position
2. **Instruments Tab** - For attitude and altitude
3. **Camera Tab** - For FPV view
4. **Data Tab** - For telemetry review

### Recommended Layouts

#### Option 1: Dual Monitor Setup
- **Monitor 1**: Camera tab (FPV feed)
- **Monitor 2**: Map or Instruments

#### Option 2: Single Monitor
- **Primary view**: Camera (FPV)
- **Quick switch**: Alt+Tab to check map/instruments
- **Picture-in-Picture**: Use browser PIP for camera

#### Option 3: Split Screen
- **Left half**: Ground station (map/instruments)
- **Right half**: Separate camera window

### Browser Picture-in-Picture

To keep camera visible while viewing other tabs:

1. Go to Camera tab
2. Right-click on video feed
3. Select "Picture in Picture"
4. Small video window appears
5. Switch to Map or Instruments tab
6. Camera stays visible in corner!

---

## 🔧 Skydroid Troubleshooting

### Camera Not Connecting

#### Check 1: WiFi Connection
```bash
# Windows: Check WiFi connection
ipconfig

# Look for:
# Wireless LAN adapter Wi-Fi:
#   IPv4 Address: 192.168.169.xxx
```

✅ **Good**: IP starts with `192.168.169.x`  
❌ **Bad**: Different IP range

**Fix**: Reconnect to Skydroid WiFi

#### Check 2: Ping Skydroid
```bash
# Windows Command Prompt
ping 192.168.169.1

# Should see:
# Reply from 192.168.169.1: bytes=32 time=5ms
```

✅ **Good**: Getting replies  
❌ **Bad**: Request timed out

**Fix**: 
- Check Skydroid is powered on
- Verify WiFi password
- Move closer to receiver

#### Check 3: Test URL in Browser

1. Open Chrome/Edge
2. Go to: `http://192.168.169.1:8080/video.mjpg`
3. Should see video feed

✅ **Good**: Video appears in browser  
❌ **Bad**: Cannot connect or error

**Fix**:
- Try different URLs (see list below)
- Check Skydroid manual for correct URL
- Update Skydroid firmware

### Common Skydroid URLs

Try these in order:

```
http://192.168.169.1:8080/video.mjpg
http://192.168.169.1:8080/
http://192.168.169.1/video.mjpg
http://192.168.1.1:8080/video.mjpg
http://10.0.0.1:8080/video.mjpg
```

### Video Quality Issues

**Laggy/Choppy Video**:
- Move closer to Skydroid receiver
- Reduce WiFi interference
- Close other programs using bandwidth
- Lower video resolution in Skydroid settings

**No Video, Just Gray Screen**:
- Check VTX is powered on
- Verify VTX frequency matches receiver
- Check antenna connections
- Ensure camera is working

**Video Freezes**:
- Refresh browser page
- Disconnect and reconnect camera
- Restart Skydroid receiver
- Check WiFi signal strength

---

## 📱 Advanced: Skydroid App Integration

Some Skydroid models have companion apps:

### Using Skydroid App + Ground Station

1. **Phone/Tablet**: Run Skydroid app for video
2. **PC**: Run ground station for telemetry
3. **Best of both worlds**: FPV on phone, data on PC

### Sharing Skydroid Stream

If Skydroid app is running:

1. Find your PC's IP on Skydroid WiFi
2. Skydroid app may expose stream at:
   ```
   http://[YOUR_PC_IP]:8080/video.mjpg
   ```
3. Use this URL in ground station

---

## 🎥 Alternative Camera Solutions

### If Skydroid Doesn't Work

#### Option 1: Analog to USB Capture Card
1. Get USB video capture device
2. Connect analog video out to capture card
3. Use VLC to stream (see VLC setup above)

#### Option 2: DJI FPV System
- DJI Goggles have HDMI out
- Use HDMI capture card
- Stream via VLC or OBS

#### Option 3: HDZero
- HDZero receivers have USB/HDMI out
- Similar setup to Skydroid

#### Option 4: Separate FPV Monitor
- Use dedicated FPV monitor for video
- Use ground station for telemetry only
- Simplest and most reliable

---

## ✅ Quick Reference

### Skydroid Setup Checklist

- [ ] Skydroid powered on
- [ ] PC connected to Skydroid WiFi
- [ ] IP address is 192.168.169.x
- [ ] Can ping 192.168.169.1
- [ ] Stream URL tested in browser
- [ ] Ground station Camera tab configured
- [ ] Video appears in ground station

### Instrument Reading Checklist

- [ ] Artificial Horizon shows level when FC is level
- [ ] Compass shows correct heading
- [ ] Variometer shows 0 when stationary
- [ ] Altitude graph updates with height changes

### Map Usage Checklist

- [ ] GPS fix acquired (8+ satellites)
- [ ] Aircraft marker appears on map
- [ ] Home marker set at takeoff location
- [ ] Flight path drawing enabled
- [ ] Distance to home updating

---

## 💡 Pro Tips

### Camera Tips
1. **Test before flight**: Verify camera works on ground
2. **Backup FPV**: Always have goggles as backup
3. **Latency**: Ground station adds ~100-500ms latency
4. **Not for racing**: Use for cruising/exploration only

### Instrument Tips
1. **Calibrate**: Ensure FC is level when powered on
2. **Smooth data**: Instruments filter out noise
3. **Practice reading**: Learn to interpret quickly
4. **Cross-reference**: Compare with OSD data

### Map Tips
1. **Satellite view**: Best for outdoor flying
2. **Pre-load**: Load map tiles before flight (zoom in/out)
3. **Offline**: Map tiles cache in browser
4. **Export path**: Save flight path as CSV

---

**Ready to fly with full telemetry and video! 🚁📹**
