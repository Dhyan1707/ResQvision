// ==========================================
// FIRE ALARM & EMERGENCY BROADCAST SYSTEM
// AI FIRE EVACUATION SYSTEM
// ==========================================

class FireAlarmSystem {
    constructor() {
        this.audioCtx = null;
        this.sirenOsc = null;
        this.sirenGain = null;
        this.filter = null;
        this.isPlayingSiren = false;
        this.isAlarmMuted = false;
        this.isAlarmActive = false;
        this.pulseInterval = null;
        this.currentFloor = null;

        // Auto-bind UI buttons when DOM is loaded
        if (typeof document !== 'undefined') {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.bindUI());
            } else {
                this.bindUI();
            }
        }
    }

    initAudio() {
        try {
            if (!this.audioCtx && typeof (window.AudioContext || window.webkitAudioContext) !== 'undefined') {
                const AudioCtx = window.AudioContext || window.webkitAudioContext;
                this.audioCtx = new AudioCtx();
            }
            if (this.audioCtx && this.audioCtx.state === 'suspended') {
                this.audioCtx.resume();
            }
        } catch (e) {
            console.warn('[FireAlarm] AudioContext initialization deferred:', e);
        }
    }

    bindUI() {
        // Toggle button in toolbar
        const btnToggle = document.getElementById('btnAlarmToggle');
        if (btnToggle) {
            btnToggle.addEventListener('click', () => {
                this.initAudio();
                this.toggleMute();
            });
        }

        // Action buttons inside the emergency banner
        const btnEvac = document.getElementById('btnAlarmEvacuateNow');
        if (btnEvac) {
            btnEvac.addEventListener('click', () => {
                if (typeof window.runR1Evacuation === 'function') {
                    window.runR1Evacuation();
                } else {
                    const btn = document.getElementById('btnRunEvacuation');
                    if (btn) btn.click();
                }
            });
        }

        const btnSilence = document.getElementById('btnSilenceAlarm');
        if (btnSilence) {
            btnSilence.addEventListener('click', () => {
                this.silenceAlarm();
            });
        }
    }

    triggerAlarm(floorLevel) {
        this.isAlarmActive = true;
        this.currentFloor = floorLevel;
        this.initAudio();

        const floorName = (floorLevel !== undefined && floorLevel !== null) 
            ? (Number(floorLevel) === 0 ? 'Ground Floor' : `Floor ${floorLevel}`) 
            : 'Building';

        console.log(`🚨 [FireAlarm] Emergency alarm activated! Fire started on ${floorName}.`);

        // 1. Show Emergency Visual Banner
        if (typeof document !== 'undefined') {
            const banner = document.getElementById('alarmBanner');
            const subtitle = document.getElementById('alarmSubtitle');
            if (banner) {
                banner.style.display = 'flex';
            }
            if (subtitle) {
                subtitle.textContent = `Fire started on ${floorName}! Start evacuating!`;
            }

            // 2. Pulse Toolbar Alarm Button
            const btnAlarmToggle = document.getElementById('btnAlarmToggle');
            if (btnAlarmToggle) {
                btnAlarmToggle.classList.add('active-alarming');
            }

            // 3. Update Status Panel
            const routeStatus = document.getElementById('routeStatus');
            if (routeStatus) {
                routeStatus.textContent = '🚨 FIRE ALARM: FIRE STARTED — START EVACUATING!';
            }
            const routeMessage = document.getElementById('routeMessage');
            if (routeMessage) {
                routeMessage.textContent = `Emergency fire alarm triggered on ${floorName}! Start evacuating immediately!`;
            }
        }

        // 4. Play Siren Tone & Spoken Voice Alert (if not muted)
        if (!this.isAlarmMuted) {
            this.startSirenTone();
            this.speakWarning(floorName);
        }

        // 5. Activate 3D Emergency Strobe Beacon in Scene
        if (window.threeDViewer && typeof window.threeDViewer.setAlarmStrobe === 'function') {
            window.threeDViewer.setAlarmStrobe(true);
        }
    }

    startSirenTone() {
        if (this.isPlayingSiren || this.isAlarmMuted) return;
        this.initAudio();
        if (!this.audioCtx) return;

        try {
            const ctx = this.audioCtx;
            this.sirenOsc = ctx.createOscillator();
            this.sirenGain = ctx.createGain();

            // Fire alarm emergency horn sound
            this.sirenOsc.type = 'sawtooth';
            this.sirenOsc.frequency.setValueAtTime(800, ctx.currentTime);

            this.filter = ctx.createBiquadFilter();
            this.filter.type = 'lowpass';
            this.filter.frequency.setValueAtTime(1800, ctx.currentTime);

            this.sirenGain.gain.setValueAtTime(0.09, ctx.currentTime);

            this.sirenOsc.connect(this.filter);
            this.filter.connect(this.sirenGain);
            this.sirenGain.connect(ctx.destination);

            this.sirenOsc.start();
            this.isPlayingSiren = true;

            // Two-tone European/US emergency whoop (820Hz <-> 560Hz)
            let high = true;
            this.pulseInterval = setInterval(() => {
                if (!this.isPlayingSiren || !this.sirenOsc || !this.audioCtx) return;
                try {
                    const nextFreq = high ? 860 : 560;
                    this.sirenOsc.frequency.exponentialRampToValueAtTime(nextFreq, this.audioCtx.currentTime + 0.3);
                    high = !high;
                } catch (e) {}
            }, 420);

        } catch (e) {
            console.warn('[FireAlarm] Audio tone playback warning:', e);
        }
    }

    stopSirenTone() {
        if (this.pulseInterval) {
            clearInterval(this.pulseInterval);
            this.pulseInterval = null;
        }
        if (this.sirenOsc) {
            try {
                this.sirenOsc.stop();
                this.sirenOsc.disconnect();
            } catch (e) {}
            this.sirenOsc = null;
        }
        this.isPlayingSiren = false;
    }

    speakWarning(floorName) {
        if (typeof window.speechSynthesis === 'undefined' || this.isAlarmMuted) return;

        try {
            window.speechSynthesis.cancel(); // Stop any pending utterances

            const alertText = `Attention! Fire started on ${floorName}! Fire started, start evacuating!`;
            const utterance = new SpeechSynthesisUtterance(alertText);
            utterance.rate = 1.05;
            utterance.pitch = 1.1;
            utterance.volume = 1.0;

            // Duck siren volume while voice is speaking so message is loud and clear
            if (this.sirenGain && this.audioCtx) {
                this.sirenGain.gain.setValueAtTime(0.02, this.audioCtx.currentTime);
            }

            utterance.onend = () => {
                // Restore siren volume after voice announcement
                if (this.sirenGain && this.audioCtx && this.isPlayingSiren) {
                    this.sirenGain.gain.setValueAtTime(0.08, this.audioCtx.currentTime);
                }
            };

            window.speechSynthesis.speak(utterance);
        } catch (e) {
            console.warn('[FireAlarm] Speech synthesis warning:', e);
        }
    }

    silenceAlarm() {
        console.log('🔕 [FireAlarm] Alarm silenced.');
        this.stopSirenTone();
        if (typeof window !== 'undefined' && typeof window.speechSynthesis !== 'undefined') {
            window.speechSynthesis.cancel();
        }
        if (typeof document !== 'undefined') {
            const banner = document.getElementById('alarmBanner');
            if (banner) {
                banner.style.display = 'none';
            }
            const btnAlarmToggle = document.getElementById('btnAlarmToggle');
            if (btnAlarmToggle) {
                btnAlarmToggle.classList.remove('active-alarming');
            }
        }
        if (typeof window !== 'undefined' && window.threeDViewer && typeof window.threeDViewer.setAlarmStrobe === 'function') {
            window.threeDViewer.setAlarmStrobe(false);
        }
        this.isAlarmActive = false;
    }

    toggleMute() {
        this.isAlarmMuted = !this.isAlarmMuted;
        if (typeof document !== 'undefined') {
            const toggleState = document.getElementById('alarmToggleState');
            const btnAlarmToggle = document.getElementById('btnAlarmToggle');

            if (this.isAlarmMuted) {
                this.silenceAlarm();
                if (toggleState) toggleState.textContent = 'MUTED';
                if (btnAlarmToggle) btnAlarmToggle.classList.add('muted');
                console.log('🔕 [FireAlarm] Alarm audio muted.');
            } else {
                if (toggleState) toggleState.textContent = 'ON';
                if (btnAlarmToggle) btnAlarmToggle.classList.remove('muted');
                console.log('🔔 [FireAlarm] Alarm audio enabled.');

                // If a fire is currently active, immediately sound the alarm
                if (typeof window !== 'undefined' && window.threeDViewer && window.threeDViewer.activeFires && window.threeDViewer.activeFires.length > 0) {
                    const floorIdx = window.threeDViewer.activeFires[0].floorIndex;
                    this.triggerAlarm(floorIdx);
                }
            }
        }
        return !this.isAlarmMuted;
    }
}

// Global instance
if (typeof window !== 'undefined') {
    window.FireAlarmSystem = FireAlarmSystem;
    window.fireAlarmSystem = new FireAlarmSystem();
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = FireAlarmSystem;
}
