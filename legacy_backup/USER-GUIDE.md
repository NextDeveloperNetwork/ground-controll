# Ground Station User Guide - Complete Walkthrough

## 📋 Table of Contents

1. [Overview](#overview)
2. [How to Use Each Tab](#how-to-use-each-tab)
3. [Skydroid Camera Setup](#skydroid-camera-setup)
4. [Reading the Instruments](#reading-the-instruments)
5. [Using the Map](#using-the-map)
6. [Quick Reference](#quick-reference)

---

## Overview

Your ground station has **4 main tabs** at the top:

```
┌─────────────────────────────────────────────────────┐
│  [Map] [Instruments] [Camera] [Data]                │
└─────────────────────────────────────────────────────┘
```

Click any tab to switch views. All tabs update in real-time when connected!

---

## Unified Dashboard

Your ground station now features a single, powerful **Unified Dashboard** that puts everything you need in one view:

```
┌───────────────────────────┬───────────────────────────┐
│     FPV Camera Feed       │    Flight Instruments     │
│   (Auto-detects USB)      │  (Horizon, Compass, etc)  │
│   [Overlay Data]          │                           │
├───────────────────────────┼───────────────────────────┤
│        GPS Map            │    Telemetry Metrics      │
│     (Live Tracking)       │    (Detailed Data List)   │
└───────────────────────────┴───────────────────────────┘
```

### 1️⃣ Camera Panel (Top Left)

**Auto-Detection Feature:**
- automatically searches for **Skydroid** or **UVC** cameras when app opens
- Shows "Searching..." status with pulsing dot
- Automatically connects when device is found

**Manual Control:**
- Click **Manual Setup** button if camera isn't found
- Select specific USB device from dropdown
- Or enter Skydroid WiFi stream URL

**Overlay Data:**
- **ALT**: Altitude in meters
- **SPD**: Ground speed in km/h
- **BAT**: Battery voltage

### 2️⃣ Instruments Panel (Top Right)
Compact grid of 4 essential instruments:
- **Horizon**: Pitch & Roll
- **Compass**: Heading
- **Vario**: Vertical Speed
- **Altitude**: History Graph

### 3️⃣ Map Panel (Bottom Left)
- Real-time aircraft tracking
- Flight path history
- Distance and Satellite count in corner overlay
- Coordinates in header

### 4️⃣ Telemetry Panel (Bottom Right)
Detailed scrolling list of all metrics:
- **GPS**: Fix, Sats, Lat/Lon
- **Flight**: Alt, Speed, Heading, Distance
- **Power**: Volts, Amps, RSSI, Flight Mode
- **Export CSV** button built-in

---

## Camera Setup Guide

### Auto-Detect (Easiest)
1. Plug in your **Skydroid Receiver** (USB)
2. Open the Ground Station
3. Camera should appear automatically!

### Manual USB Setup
1. Click **Manual Setup** in camera panel
2. Under "USB Camera", select your device
3. Click **Connect USB Camera**

### WiFi Stream Setup (Wireless)
1. Click **Manual Setup**
2. Under "Network Stream", select a preset URL
   - Default: `http://192.168.169.1:8080/video.mjpg`
3. Click **Connect Stream**

---

## Skydroid Camera Setup

### Skydroid Receiver Models

Your Skydroid receiver likely is one of these:
- **Skydroid T12** - 5.8GHz with WiFi
- **Skydroid H12** - HDMI receiver
- **Skydroid UVC** - USB capture

### Connection Diagram

```
┌─────────────────┐
│  Your Drone     │
│  ┌───────────┐  │
│  │  Camera   │  │
│  └─────┬─────┘  │
│        │ Video  │
│        ▼        │
│  ┌───────────┐  │
│  │    VTX    │  │ 5.8GHz
│  └───────────┘  │ Signal
└─────────────────┘
         │
         │ Wireless
         ▼
┌─────────────────┐
│ Skydroid RX     │
│ (on ground)     │
└────────┬────────┘
         │ WiFi
         ▼
┌─────────────────┐
│   Your PC       │
│ Ground Station  │
└─────────────────┘
```

### Setup Steps

#### 1. Physical Setup
- [ ] VTX on drone powered and transmitting
- [ ] Skydroid receiver powered on
- [ ] Skydroid antenna connected
- [ ] Skydroid tuned to correct frequency

#### 2. WiFi Setup
- [ ] PC WiFi enabled
- [ ] Connected to Skydroid network
- [ ] IP address is 192.168.169.x
- [ ] Can ping 192.168.169.1

#### 3. Stream Setup
- [ ] Tested URL in browser
- [ ] Video appears in browser
- [ ] Copied URL to ground station
- [ ] Clicked Connect Camera
- [ ] Video appears in Camera tab

### Skydroid Settings

Most Skydroid receivers have web interface:

1. Go to: `http://192.168.169.1`
2. Login (check manual for password)
3. Adjust settings:
   - **Resolution**: 720p or 1080p
   - **Bitrate**: Lower for less lag
   - **Frequency**: Match your VTX
   - **WiFi**: Change SSID/password if needed

### Video Quality Tips

**For best quality:**
- Use 5.8GHz band with clear line of sight
- Keep Skydroid close to PC (WiFi range)
- Lower resolution if laggy
- Close other programs using WiFi
- Use external antenna on Skydroid

**Expected latency:**
- Analog VTX to Skydroid: ~30-50ms
- Skydroid WiFi to PC: ~50-200ms
- **Total**: ~100-300ms

⚠️ **Not suitable for racing** - Use for cruising/exploration only!

---

## Reading the Instruments

### Quick Reference Guide

#### Artificial Horizon

```
        ↑ Climbing
    ┌─────────┐
    │ ░░░░░░░ │ ← Blue (Sky)
    │─────────│ ← Horizon Line
    │ ▓▓▓▓▓▓▓ │ ← Brown (Ground)
    └─────────┘
        ↓ Descending
```

**Roll (Banking):**
```
Left Bank:          Right Bank:
    ╱                   ╲
   ╱                     ╲
```

#### Compass

```
        N (0°)
        ↑
W (270°)←   → E (90°)
        ↓
      S (180°)
```

#### Variometer

```
+10 ┤ ▓▓▓ ← Fast Climb
 +5 ┤ ▓▓▓
  0 ┼─────← Level
 -5 ┤ ▓▓▓
-10 ┤ ▓▓▓ ← Fast Descent
```

#### Altitude Graph

```
High ┤     ╱╲
     ┤    ╱  ╲
     ┤   ╱    ╲
Low  ┤──╱      ╲──
     └──────────────→ Time
```

### Practice Reading

Before your first flight, practice reading instruments:

1. **Connect FC via USB** (on ground)
2. **Go to Instruments tab**
3. **Tilt FC forward** → Horizon shows climb
4. **Tilt FC backward** → Horizon shows descent
5. **Roll FC left** → Horizon banks right
6. **Roll FC right** → Horizon banks left
7. **Rotate FC** → Compass changes heading

This helps you understand how instruments respond!

---

## Using the Map

### Map Markers Explained

#### Aircraft Marker (Blue Plane)
- **Position**: Current GPS location
- **Rotation**: Points in direction of travel
- **Updates**: Real-time (when GPS locked)
- **Color**: Blue (easy to spot)

#### Home Marker (Green House)
- **Position**: Takeoff/arming location
- **Set**: Automatically on first GPS fix
- **Purpose**: Return-to-home reference
- **Color**: Green (home = safe)

#### Flight Path (Blue Line)
- **Shows**: Where you've flown
- **Draws**: Automatically as you move
- **Persists**: Until you clear data
- **Use**: Review flight route

### Map Providers

Change in Settings (⚙️):

**OpenStreetMap** (Default)
- Street map style
- Good for urban areas
- Shows roads and buildings
- Free and open source

**Satellite**
- Aerial imagery
- **Best for flying!**
- See actual terrain
- Identify landmarks

**Terrain**
- Topographic map
- Shows elevation
- Good for mountains
- Contour lines

### Map Tips

**Before Flight:**
1. Wait for GPS fix (8+ satellites)
2. Verify home marker is correct
3. Check you're on the map
4. Zoom to appropriate level

**During Flight:**
1. Monitor distance to home
2. Watch flight path
3. Check heading matches map
4. Use landmarks for navigation

**After Flight:**
1. Review flight path
2. Check max distance
3. Export data if needed
4. Clear for next flight

---

## Quick Reference

### Tab Shortcuts

| Tab | Best For | Key Info |
|-----|----------|----------|
| **Map** | Navigation | Position, distance, path |
| **Instruments** | Attitude | Pitch, roll, heading, altitude |
| **Camera** | FPV View | Live video feed |
| **Data** | Analysis | Telemetry logs, export |

### Skydroid Quick Setup

```bash
1. Power on Skydroid
2. Connect PC to Skydroid WiFi
3. Test: http://192.168.169.1:8080/video.mjpg
4. Paste URL in Camera tab
5. Click Connect Camera
```

### Instrument Quick Read

```
Horizon:  Blue up = climbing, brown up = descending
Compass:  Number in center = heading in degrees
Vario:    Green = up, red = down, gray = level
Altitude: Line going up = gaining height
```

### Common URLs

```
Skydroid:  http://192.168.169.1:8080/video.mjpg
Alt URL 1: http://192.168.169.1:8080/
Alt URL 2: http://192.168.1.1:8080/video.mjpg
```

### Telemetry Update Rates

```
USB (MSP):  ~10 Hz (100ms)
ELRS (CRSF): 4-10 Hz (depends on packet rate)
Camera:     15-30 FPS (depends on Skydroid)
```

---

## Troubleshooting

### Camera Issues

**Problem**: No video in Camera tab  
**Solution**:
1. Check Skydroid WiFi connected
2. Test URL in browser first
3. Verify Skydroid powered on
4. Try alternative URLs

**Problem**: Video is laggy  
**Solution**:
1. Move closer to Skydroid
2. Lower resolution in Skydroid settings
3. Close other programs
4. Check WiFi signal strength

### Instrument Issues

**Problem**: Instruments not moving  
**Solution**:
1. Check telemetry is connected
2. Verify FC is sending attitude data
3. Check browser console (F12)
4. Refresh page

**Problem**: Horizon shows wrong angle  
**Solution**:
1. Calibrate accelerometer in iNav
2. Ensure FC is level when powered on
3. Check FC orientation in iNav

### Map Issues

**Problem**: No GPS fix  
**Solution**:
1. Go outdoors (clear sky view)
2. Wait 60+ seconds
3. Check GPS module connected
4. Verify GPS enabled in iNav

**Problem**: Map not loading  
**Solution**:
1. Check internet connection
2. Try different map provider
3. Zoom in/out to load tiles
4. Refresh browser

---

## Best Practices

### Pre-Flight Checklist

- [ ] Ground station open and running
- [ ] Connected (USB or ELRS)
- [ ] GPS fix acquired (8+ satellites)
- [ ] Home position set correctly
- [ ] Battery voltage showing correctly
- [ ] Camera feed working (if using)
- [ ] Recording started (if desired)

### During Flight

- [ ] Monitor battery voltage
- [ ] Check RSSI signal strength
- [ ] Watch distance to home
- [ ] Keep eye on altitude
- [ ] Verify GPS satellite count

### Post-Flight

- [ ] Stop recording
- [ ] Review flight path on map
- [ ] Check max altitude/distance
- [ ] Export data if needed
- [ ] Clear data for next flight

---

**You're all set! Enjoy your ground station! 🚁**

For more details, see:
- **CAMERA-SETUP.md** - Detailed camera guide
- **SETUP-GUIDE.md** - Complete setup instructions
- **INAV-CONFIG.md** - iNav configuration
- **README.md** - Full documentation
