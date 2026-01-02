# iNav Configuration Checklist for Ground Station

## ✅ Pre-Configuration Requirements

- [ ] iNav Configurator installed
- [ ] SpeedyBee F405 Wing FC connected via USB
- [ ] Latest iNav 8.0.1 firmware flashed
- [ ] GPS module connected and working
- [ ] ExpressLRS receiver connected (if using wireless)

---

## 🔌 Option 1: USB Direct Connection (MSP)

### Step 1: Enable MSP on USB Port

1. Open **iNav Configurator**
2. Connect FC via USB
3. Click **Connect** in top-right
4. Go to **Ports** tab

### Step 2: Configure USB VCP

Find the row labeled **USB VCP** or **VCP** (Virtual COM Port):

```
Port: USB VCP
MSP: ☑️ ENABLED
Baud Rate: 115200
```

- [x] Enable **MSP** checkbox
- [x] Set **Baud Rate** to **115200**
- [x] Leave other protocols disabled on this port

### Step 3: Save Configuration

- [x] Click **Save and Reboot** button
- [x] Wait for FC to reboot
- [x] Disconnect from iNav Configurator

### Step 4: Test Connection

1. Open ground station in browser
2. Click **USB Direct**
3. Select baud rate: **115200**
4. Click **Connect**
5. Select FC's COM port
6. Verify telemetry appears

**Expected Result**: GPS, battery, altitude, and other data should appear in sidebar

---

## 📡 Option 2: ExpressLRS Wireless (CRSF)

### Step 1: Identify UART Port

First, determine which UART your ELRS receiver is connected to:

Common configurations:
- **SpeedyBee F405 Wing**: Usually UART1 or UART2
- Check your FC's wiring diagram
- RX pin from ELRS goes to TX pin on FC UART

### Step 2: Configure UART for CRSF

1. Open **iNav Configurator**
2. Connect FC via USB
3. Go to **Ports** tab

### Step 3: Enable Serial RX and Telemetry

Find the UART row where your ELRS receiver is connected (e.g., **UART1**):

```
Port: UART1 (or UART2)
Serial RX: ☑️ ENABLED
Telemetry Output: ☑️ ENABLED
Baud Rate: 420000
```

Configuration:
- [x] Enable **Serial RX** checkbox
- [x] Enable **Telemetry Output** checkbox  
- [x] Set **Baud Rate** to **420000**
- [x] Disable MSP on this port (if enabled)

### Step 4: Configure Receiver Settings

1. Go to **Receiver** tab
2. Set the following:

```
Receiver Type: Serial-based receiver
Serial Receiver Provider: CRSF
```

- [x] Set **Receiver Type** to **Serial-based receiver**
- [x] Set **Serial Receiver Provider** to **CRSF**
- [x] Verify **RSSI Channel** is set (usually AUX12)

### Step 5: Enable Telemetry Features

Still in **Receiver** tab:

- [x] Scroll down to **Telemetry** section
- [x] Ensure telemetry is enabled
- [x] Check that GPS, battery, and other sensors are configured

### Step 6: Save and Test

- [x] Click **Save and Reboot**
- [x] Wait for FC to reboot
- [x] Disconnect from iNav Configurator
- [x] Power cycle the FC

### Step 7: Test ELRS Connection

1. Connect ELRS receiver to PC via USB
2. Open ground station
3. Click **ExpressLRS**
4. Select baud rate: **420000**
5. Click **Connect**
6. Select ELRS receiver's COM port
7. Verify telemetry appears

**Expected Result**: GPS, battery, link stats should appear

---

## 🛠️ Additional Configuration (Recommended)

### GPS Configuration

1. Go to **Configuration** tab
2. Find **GPS** section:

```
GPS Protocol: UBLOX
Ground Assistance Type: AUTO
```

- [x] Set **GPS Protocol** to match your GPS module (usually UBLOX)
- [x] Enable **GPS** in the features list
- [x] Set **Ground Assistance Type** to AUTO

### Battery Configuration

1. Go to **Power & Battery** tab
2. Configure:

```
Battery Cells: [Your cell count, e.g., 4S]
Min Cell Voltage: 3.3V
Warning Cell Voltage: 3.5V
Max Cell Voltage: 4.2V
```

- [x] Set correct **Battery Cells** count
- [x] Set **Min Cell Voltage** (3.3V for LiPo)
- [x] Set **Warning Cell Voltage** (3.5V recommended)
- [x] Enable **Battery Voltage** monitoring

### Current Sensor (if available)

```
Current Sensor: Enabled
Scale: [Check your FC specs]
Offset: [Calibrate to 0A when no load]
```

- [x] Enable **Current Sensor** if your FC has one
- [x] Calibrate **Scale** and **Offset**

### OSD Configuration (Optional)

1. Go to **OSD** tab
2. Enable elements you want:

- [x] GPS coordinates
- [x] Satellite count
- [x] Battery voltage
- [x] Current draw
- [x] Altitude
- [x] Speed
- [x] Distance to home
- [x] RSSI

---

## 🔍 Verification Checklist

### USB Connection Verification

- [ ] MSP enabled on USB VCP
- [ ] Baud rate set to 115200
- [ ] Ground station connects successfully
- [ ] GPS data appears (after fix)
- [ ] Battery voltage shows correctly
- [ ] Altitude updates
- [ ] Flight modes display

### ELRS Connection Verification

- [ ] Serial RX enabled on correct UART
- [ ] CRSF protocol selected
- [ ] Baud rate set to 420000
- [ ] Telemetry output enabled
- [ ] Receiver type set to Serial
- [ ] Receiver provider set to CRSF
- [ ] Ground station connects to ELRS receiver
- [ ] Telemetry data flows
- [ ] Link statistics appear
- [ ] RSSI updates

### Sensor Verification

- [ ] GPS shows satellite count
- [ ] GPS acquires 3D fix outdoors
- [ ] Compass/heading updates
- [ ] Altitude changes when moving FC
- [ ] Battery voltage is accurate
- [ ] Current sensor works (if equipped)
- [ ] RSSI shows signal strength

---

## 🚨 Common Issues & Solutions

### Issue: No MSP on USB VCP option

**Solution**: 
- Update to latest iNav Configurator
- Reflash firmware
- Try different USB cable
- Check USB drivers installed

### Issue: CRSF not in receiver provider list

**Solution**:
- Update to iNav 8.0.1 or later
- CRSF support added in iNav 2.0+
- Reflash latest firmware

### Issue: Telemetry not working on ELRS

**Solution**:
- Verify UART TX pin connected to ELRS RX
- Check baud rate is 420000
- Ensure telemetry enabled on port
- Power cycle FC and receiver
- Check ELRS receiver is bound to TX

### Issue: GPS not getting fix

**Solution**:
- Go outdoors with clear sky view
- Wait 60+ seconds for first fix
- Check GPS module is connected
- Verify GPS protocol matches module
- Check GPS is enabled in Configuration

### Issue: Battery voltage shows 0V

**Solution**:
- Check battery is connected
- Verify voltage divider configured
- Calibrate in Power & Battery tab
- Check FC's voltage sense pin

---

## 📋 Quick Reference

### Baud Rates
- **USB (MSP)**: 115200
- **ELRS (CRSF)**: 420000
- **GPS (UBLOX)**: 115200 or 38400

### Protocols
- **USB**: MSP
- **ELRS**: CRSF
- **GPS**: UBLOX or NMEA

### UART Assignment Example
```
USB VCP: MSP (115200)
UART1: CRSF Serial RX + Telemetry (420000)
UART2: GPS (115200)
UART3: SmartAudio/Tramp (48000)
```

---

## ✅ Final Checklist

Before first flight with ground station:

- [ ] iNav configured correctly
- [ ] USB connection tested
- [ ] ELRS connection tested (if using)
- [ ] GPS gets fix outdoors
- [ ] Battery voltage accurate
- [ ] All sensors working
- [ ] Ground station displays all data
- [ ] Recording/export tested
- [ ] Backup configuration saved

---

## 💾 Save Your Configuration

After completing setup:

1. In iNav Configurator, go to **CLI** tab
2. Type: `dump`
3. Copy all output
4. Save to text file: `inav-config-backup.txt`
5. Store safely for future reference

---

**Configuration complete! You're ready to fly with ground station telemetry! 🚁**
