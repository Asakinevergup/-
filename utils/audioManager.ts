// Sound Assets (MP3 for compatibility)
const SOUNDS = {
    // BGM: Vivaldi - The Four Seasons (Spring) - Wikimedia Commons
    bgm: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/d/d3/Vivaldi_Spring_mvt_1_Allegro_-_John_Harrison_violin.ogg/Vivaldi_Spring_mvt_1_Allegro_-_John_Harrison_violin.ogg.mp3',
    
    // SFX - Using reliable MP3 sources
    coin: 'https://www.soundjay.com/misc/sounds/coin-drop-1.mp3', // Buy/Sell/Profit
    paper: 'https://www.soundjay.com/misc/sounds/page-flip-01a.mp3', // Event Card
    gavel: 'https://www.soundjay.com/misc/sounds/hammer-hit-hard-1.mp3', // Gavel Pass (Fallback to heavy hit)
    scribble: 'https://www.soundjay.com/misc/sounds/writing-on-paper-1.mp3', // Loan/Short
    crash: 'https://www.soundjay.com/mechanical/sounds/glass-breaking-1.mp3', // Market Crash
    click: 'https://www.soundjay.com/buttons/sounds/button-17.mp3', // UI Click
    pass: 'https://www.soundjay.com/human/sounds/footstep-2.mp3', // Pass turn (thud)
};

class AudioManager {
    private sounds: Record<string, HTMLAudioElement> = {};
    private bgmAudio: HTMLAudioElement | null = null;
    private isMuted: boolean = false;
    private initialized: boolean = false;

    constructor() {
        // Preload SFX
        Object.entries(SOUNDS).forEach(([key, url]) => {
            if (key !== 'bgm') {
                const audio = new Audio(url);
                audio.volume = 0.5;
                // Add error handling to prevent "element has no supported sources" from breaking the app flow
                audio.onerror = () => console.warn(`Failed to load sound: ${key}`);
                this.sounds[key] = audio;
            }
        });

        // Setup BGM
        this.bgmAudio = new Audio(SOUNDS.bgm);
        this.bgmAudio.loop = true;
        this.bgmAudio.volume = 0.2; // Keep background music subtle
        this.bgmAudio.onerror = () => console.warn("Failed to load BGM");
    }

    // Must be called after a user interaction to satisfy browser autoplay policies
    init() {
        if (this.initialized) return;
        this.initialized = true;
    }

    playBGM() {
        if (this.isMuted || !this.bgmAudio || !this.initialized) return;
        this.bgmAudio.play().catch(e => console.warn("Audio autoplay blocked", e));
    }

    stopBGM() {
        if (this.bgmAudio) {
            this.bgmAudio.pause();
            this.bgmAudio.currentTime = 0;
        }
    }

    playSFX(key: keyof typeof SOUNDS) {
        if (this.isMuted) return;
        
        const sound = this.sounds[key];
        if (sound) {
            sound.currentTime = 0;
            sound.play().catch(() => {});
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.isMuted) {
            this.bgmAudio?.pause();
        } else {
            if (this.initialized) this.bgmAudio?.play().catch(() => {});
        }
        return this.isMuted;
    }

    isAudioMuted() {
        return this.isMuted;
    }
}

export const audioManager = new AudioManager();