/**
 * Flight Instruments Visualization
 * Renders artificial horizon, compass, variometer, and altitude graph
 */

class FlightInstruments {
    constructor() {
        this.horizonCanvas = null;
        this.compassCanvas = null;
        this.varioCanvas = null;
        this.altitudeCanvas = null;

        this.pitch = 0;
        this.roll = 0;
        this.yaw = 0;
        this.verticalSpeed = 0;
        this.altitudeHistory = [];
        this.maxAltitudeHistory = 100;
    }

    /**
     * Initialize all instruments
     */
    init() {
        this.horizonCanvas = document.getElementById('horizonCanvas');
        this.compassCanvas = document.getElementById('compassCanvas');
        this.varioCanvas = document.getElementById('varioCanvas');
        this.altitudeCanvas = document.getElementById('altitudeGraph');

        // Start animation loop
        this.animate();
    }

    /**
     * Update attitude data
     */
    updateAttitude(pitch, roll, yaw) {
        this.pitch = pitch;
        this.roll = roll;
        this.yaw = yaw;
    }

    /**
     * Update vertical speed
     */
    updateVerticalSpeed(vSpeed) {
        this.verticalSpeed = vSpeed;
    }

    /**
     * Update altitude
     */
    updateAltitude(altitude) {
        this.altitudeHistory.push(altitude);
        if (this.altitudeHistory.length > this.maxAltitudeHistory) {
            this.altitudeHistory.shift();
        }
    }

    /**
     * Animation loop
     */
    animate() {
        this.drawHorizon();
        this.drawCompass();
        this.drawVariometer();
        this.drawAltitudeGraph();

        requestAnimationFrame(() => this.animate());
    }

    /**
     * Draw artificial horizon
     */
    drawHorizon() {
        if (!this.horizonCanvas) return;

        const ctx = this.horizonCanvas.getContext('2d');
        const width = this.horizonCanvas.width;
        const height = this.horizonCanvas.height;
        const centerX = width / 2;
        const centerY = height / 2;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Save context
        ctx.save();

        // Move to center and apply roll rotation
        ctx.translate(centerX, centerY);
        ctx.rotate((this.roll * Math.PI) / 180);

        // Calculate pitch offset
        const pitchOffset = (this.pitch * height) / 60;

        // Draw sky
        const skyGradient = ctx.createLinearGradient(0, -height, 0, 0);
        skyGradient.addColorStop(0, '#1e3a8a');
        skyGradient.addColorStop(1, '#3b82f6');
        ctx.fillStyle = skyGradient;
        ctx.fillRect(-width, -height + pitchOffset, width * 2, height);

        // Draw ground
        const groundGradient = ctx.createLinearGradient(0, 0, 0, height);
        groundGradient.addColorStop(0, '#78350f');
        groundGradient.addColorStop(1, '#451a03');
        ctx.fillStyle = groundGradient;
        ctx.fillRect(-width, pitchOffset, width * 2, height);

        // Draw horizon line
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-width, pitchOffset);
        ctx.lineTo(width, pitchOffset);
        ctx.stroke();

        // Draw pitch ladder
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.font = '12px JetBrains Mono';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';

        for (let angle = -90; angle <= 90; angle += 10) {
            if (angle === 0) continue;

            const y = pitchOffset - (angle * height) / 60;
            const lineWidth = angle % 30 === 0 ? 60 : 40;

            ctx.beginPath();
            ctx.moveTo(-lineWidth / 2, y);
            ctx.lineTo(lineWidth / 2, y);
            ctx.stroke();

            if (angle % 30 === 0) {
                ctx.fillText(Math.abs(angle) + '°', -lineWidth / 2 - 25, y + 4);
                ctx.fillText(Math.abs(angle) + '°', lineWidth / 2 + 25, y + 4);
            }
        }

        // Restore context
        ctx.restore();

        // Draw aircraft symbol (fixed in center)
        ctx.strokeStyle = '#fbbf24';
        ctx.fillStyle = '#fbbf24';
        ctx.lineWidth = 3;

        // Center dot
        ctx.beginPath();
        ctx.arc(centerX, centerY, 4, 0, 2 * Math.PI);
        ctx.fill();

        // Wings
        ctx.beginPath();
        ctx.moveTo(centerX - 60, centerY);
        ctx.lineTo(centerX - 15, centerY);
        ctx.moveTo(centerX + 15, centerY);
        ctx.lineTo(centerX + 60, centerY);
        ctx.stroke();

        // Wing tips
        ctx.beginPath();
        ctx.moveTo(centerX - 60, centerY);
        ctx.lineTo(centerX - 60, centerY + 15);
        ctx.moveTo(centerX + 60, centerY);
        ctx.lineTo(centerX + 60, centerY + 15);
        ctx.stroke();

        // Draw roll indicator
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        const radius = width / 2 - 20;

        // Roll arc
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, -Math.PI, 0);
        ctx.stroke();

        // Roll markers
        for (let angle = -60; angle <= 60; angle += 30) {
            const rad = (angle * Math.PI) / 180;
            const x1 = centerX + radius * Math.cos(rad - Math.PI / 2);
            const y1 = centerY + radius * Math.sin(rad - Math.PI / 2);
            const x2 = centerX + (radius - 10) * Math.cos(rad - Math.PI / 2);
            const y2 = centerY + (radius - 10) * Math.sin(rad - Math.PI / 2);

            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
        }

        // Roll indicator triangle
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate((this.roll * Math.PI) / 180);
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.moveTo(0, -radius + 5);
        ctx.lineTo(-8, -radius + 15);
        ctx.lineTo(8, -radius + 15);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    /**
     * Draw compass
     */
    drawCompass() {
        if (!this.compassCanvas) return;

        const ctx = this.compassCanvas.getContext('2d');
        const width = this.compassCanvas.width;
        const height = this.compassCanvas.height;
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(width, height) / 2 - 20;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Draw outer circle
        const gradient = ctx.createRadialGradient(centerX, centerY, radius - 20, centerX, centerY, radius);
        gradient.addColorStop(0, '#1e293b');
        gradient.addColorStop(1, '#0f172a');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.fill();

        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Save context
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate((-this.yaw * Math.PI) / 180);

        // Draw compass markings
        ctx.strokeStyle = '#94a3b8';
        ctx.fillStyle = '#f1f5f9';
        ctx.font = 'bold 14px Inter';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];

        for (let i = 0; i < 360; i += 5) {
            const angle = (i * Math.PI) / 180;
            const x1 = (radius - 10) * Math.sin(angle);
            const y1 = -(radius - 10) * Math.cos(angle);

            ctx.lineWidth = i % 45 === 0 ? 3 : i % 15 === 0 ? 2 : 1;
            const length = i % 45 === 0 ? 20 : i % 15 === 0 ? 15 : 10;

            const x2 = (radius - 10 - length) * Math.sin(angle);
            const y2 = -(radius - 10 - length) * Math.cos(angle);

            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();

            // Draw direction labels
            if (i % 45 === 0) {
                const textX = (radius - 35) * Math.sin(angle);
                const textY = -(radius - 35) * Math.cos(angle);
                ctx.fillStyle = i === 0 ? '#ef4444' : '#f1f5f9';
                ctx.fillText(directions[i / 45], textX, textY);
            }
        }

        ctx.restore();

        // Draw heading indicator (fixed)
        ctx.fillStyle = '#3b82f6';
        ctx.beginPath();
        ctx.moveTo(centerX, centerY - radius + 5);
        ctx.lineTo(centerX - 10, centerY - radius + 20);
        ctx.lineTo(centerX + 10, centerY - radius + 20);
        ctx.closePath();
        ctx.fill();

        // Draw heading value
        ctx.fillStyle = '#f1f5f9';
        ctx.font = 'bold 24px JetBrains Mono';
        ctx.textAlign = 'center';
        ctx.fillText(Math.round(this.yaw) + '°', centerX, centerY);
    }

    /**
     * Draw variometer
     */
    drawVariometer() {
        if (!this.varioCanvas) return;

        const ctx = this.varioCanvas.getContext('2d');
        const width = this.varioCanvas.width;
        const height = this.varioCanvas.height;
        const centerX = width / 2;
        const centerY = height / 2;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Draw background
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, '#1e293b');
        gradient.addColorStop(1, '#0f172a');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        // Draw scale
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 2;
        ctx.fillStyle = '#94a3b8';
        ctx.font = '12px JetBrains Mono';
        ctx.textAlign = 'right';

        const scaleHeight = height - 60;
        const scaleTop = 30;
        const maxVSpeed = 10; // m/s

        for (let v = -maxVSpeed; v <= maxVSpeed; v += 2) {
            const y = scaleTop + scaleHeight / 2 - (v / maxVSpeed) * (scaleHeight / 2);

            ctx.beginPath();
            ctx.moveTo(centerX - 30, y);
            ctx.lineTo(centerX + 30, y);
            ctx.stroke();

            ctx.fillText(v.toFixed(0), centerX - 35, y + 4);
            ctx.fillText(v.toFixed(0), centerX + 55, y + 4);
        }

        // Draw center line
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(centerX - 40, centerY);
        ctx.lineTo(centerX + 40, centerY);
        ctx.stroke();

        // Draw vertical speed indicator
        const vSpeedClamped = Math.max(-maxVSpeed, Math.min(maxVSpeed, this.verticalSpeed));
        const indicatorY = scaleTop + scaleHeight / 2 - (vSpeedClamped / maxVSpeed) * (scaleHeight / 2);

        ctx.fillStyle = this.verticalSpeed > 0 ? '#10b981' : this.verticalSpeed < 0 ? '#ef4444' : '#64748b';
        ctx.beginPath();
        ctx.moveTo(centerX - 15, indicatorY);
        ctx.lineTo(centerX + 15, indicatorY);
        ctx.lineTo(centerX + 15, centerY);
        ctx.lineTo(centerX - 15, centerY);
        ctx.closePath();
        ctx.fill();

        // Draw value
        ctx.fillStyle = '#f1f5f9';
        ctx.font = 'bold 18px JetBrains Mono';
        ctx.textAlign = 'center';
        ctx.fillText(this.verticalSpeed.toFixed(1) + ' m/s', centerX, height - 15);
    }

    /**
     * Draw altitude graph
     */
    drawAltitudeGraph() {
        if (!this.altitudeCanvas || this.altitudeHistory.length === 0) return;

        const ctx = this.altitudeCanvas.getContext('2d');
        const width = this.altitudeCanvas.width;
        const height = this.altitudeCanvas.height;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Draw background
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, '#1e293b');
        gradient.addColorStop(1, '#0f172a');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        // Find min/max altitude
        const minAlt = Math.min(...this.altitudeHistory);
        const maxAlt = Math.max(...this.altitudeHistory);
        const altRange = maxAlt - minAlt || 1;

        // Draw grid
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);

        for (let i = 0; i <= 5; i++) {
            const y = (height - 40) * (i / 5) + 20;
            ctx.beginPath();
            ctx.moveTo(40, y);
            ctx.lineTo(width - 20, y);
            ctx.stroke();
        }

        ctx.setLineDash([]);

        // Draw altitude line
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2;
        ctx.beginPath();

        const graphWidth = width - 60;
        const graphHeight = height - 40;

        for (let i = 0; i < this.altitudeHistory.length; i++) {
            const x = 40 + (i / (this.maxAltitudeHistory - 1)) * graphWidth;
            const y = 20 + graphHeight - ((this.altitudeHistory[i] - minAlt) / altRange) * graphHeight;

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }

        ctx.stroke();

        // Draw filled area
        ctx.lineTo(40 + graphWidth, height - 20);
        ctx.lineTo(40, height - 20);
        ctx.closePath();

        const areaGradient = ctx.createLinearGradient(0, 20, 0, height - 20);
        areaGradient.addColorStop(0, 'rgba(59, 130, 246, 0.3)');
        areaGradient.addColorStop(1, 'rgba(59, 130, 246, 0.05)');
        ctx.fillStyle = areaGradient;
        ctx.fill();

        // Draw labels
        ctx.fillStyle = '#94a3b8';
        ctx.font = '11px JetBrains Mono';
        ctx.textAlign = 'right';

        for (let i = 0; i <= 5; i++) {
            const alt = minAlt + (altRange * (5 - i)) / 5;
            const y = (height - 40) * (i / 5) + 20;
            ctx.fillText(alt.toFixed(0) + 'm', 35, y + 4);
        }

        // Draw current altitude
        ctx.fillStyle = '#f1f5f9';
        ctx.font = 'bold 18px JetBrains Mono';
        ctx.textAlign = 'center';
        const currentAlt = this.altitudeHistory[this.altitudeHistory.length - 1];
        ctx.fillText(currentAlt.toFixed(1) + ' m', width / 2, height - 5);
    }
}

// Export for use in main app
window.FlightInstruments = FlightInstruments;
