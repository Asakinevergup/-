
// Sound Assets (MP3 for compatibility via Wikimedia Commons)
// Used transcoded MP3 versions for better cross-browser compatibility
const SOUNDS = {
    // BGM: Vivaldi - The Four Seasons (Spring)
    bgm: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/d/d3/Vivaldi_Spring_mvt_1_Allegro_-_John_Harrison_violin.ogg/Vivaldi_Spring_mvt_1_Allegro_-_John_Harrison_violin.ogg.mp3',
    
    // SFX
    coin: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/3/34/Coins_dropping_on_hard_surface.ogg/Coins_dropping_on_hard_surface.ogg.mp3', // Coins
    paper: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/8/8e/Turning_a_page.ogg/Turning_a_page.ogg.mp3', // Paper flip
    gavel: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/7/7f/Gavel_3_times.ogg/Gavel_3_times.ogg.mp3', // Gavel
    scribble: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/5/52/Writing_on_paper_with_pen.ogg/Writing_on_paper_with_pen.ogg.mp3', // Writing
    crash: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/8/82/Glass_Break.ogg/Glass_Break.ogg.mp3', // Glass break
    click: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/a/a3/Mouse_click_01.ogg/Mouse_click_01.ogg.mp3', // Click
    pass: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/d/d8/Door_close_01.ogg/Door_close_01.ogg.mp3', // Pass/Door Close
};

class AudioManager {
    private sounds: Record<string, HTMLAudioElement> = {};
    private bgmAudio: HTMLAudioElement | null = null;
    private isMuted: boolean = false;
    private initialized: boolean = false;

    constructor() {
        // Empty constructor: DO NOT load Audio here to prevent network errors blocking page load
    }

    // Must be called after a user interaction to satisfy browser autoplay policies
    init() {
        if (this.initialized) return;

        try {
            // Load SFX
            Object.entries(SOUNDS).forEach(([key, url]) => {
                if (key !== 'bgm') {
                    const audio = new Audio(url);
                    audio.volume = 0.5;
                    audio.crossOrigin = "anonymous";
                    audio.onerror = () => console.warn(`Failed to load sound: ${key}`);
                    this.sounds[key] = audio;
                }
            });

            // Setup BGM
            this.bgmAudio = new Audio(SOUNDS.bgm);
            this.bgmAudio.loop = true;
            this.bgmAudio.volume = 0.2; // Keep background music subtle
            this.bgmAudio.crossOrigin = "anonymous";
            this.bgmAudio.onerror = () => console.warn("Failed to load BGM");

            this.initialized = true;
        } catch (e) {
            console.warn("Audio initialization failed:", e);
        }
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
        if (this.isMuted || !this.initialized) return;
        
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