
// Sound Assets (Using reliable Wikimedia Commons sources)
const SOUNDS = {
    // BGM: Vivaldi - Mandolin Concerto in C Major, RV 425 (Upbeat, market-like atmosphere)
    bgm: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/1/1e/Antonio_Vivaldi_-_Mandolin_Concerto_in_C_Major%2C_RV_425_-_I._Allegro.ogg/Antonio_Vivaldi_-_Mandolin_Concerto_in_C_Major%2C_RV_425_-_I._Allegro.ogg.mp3',
    
    // SFX
    coin: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/3/34/Coins_dropping_on_hard_surface.ogg/Coins_dropping_on_hard_surface.ogg.mp3', 
    paper: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/8/8e/Turning_a_page.ogg/Turning_a_page.ogg.mp3', 
    gavel: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/7/7f/Gavel_3_times.ogg/Gavel_3_times.ogg.mp3', 
    scribble: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/5/52/Writing_on_paper_with_pen.ogg/Writing_on_paper_with_pen.ogg.mp3', 
    crash: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/8/82/Glass_Break.ogg/Glass_Break.ogg.mp3',
    click: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/a/a3/Mouse_click_01.ogg/Mouse_click_01.ogg.mp3',
    pass: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/d/d8/Door_close_01.ogg/Door_close_01.ogg.mp3',
};

type SoundKey = keyof typeof SOUNDS;

class AudioManager {
    private sounds: Partial<Record<string, HTMLAudioElement>> = {};
    private bgmAudio: HTMLAudioElement | null = null;
    private isMuted: boolean = false;
    private initialized: boolean = false;
    private loadedStatus: Record<string, boolean> = {}; // Track which sounds are actually ready

    constructor() {
        // Empty constructor
    }

    // Must be called after a user interaction
    init() {
        if (this.initialized) return;

        try {
            // Load SFX
            Object.entries(SOUNDS).forEach(([key, url]) => {
                if (key !== 'bgm') {
                    const audio = new Audio(url);
                    audio.volume = 0.6;
                    // Removed crossOrigin to prevent CORS errors on simple playback
                    
                    // Only mark as ready when browser says so
                    audio.oncanplaythrough = () => {
                        this.loadedStatus[key] = true;
                    };
                    
                    // Silent error handling
                    audio.onerror = () => {
                        this.loadedStatus[key] = false;
                        // console.warn(`Audio skipped: ${key}`); // Uncomment for debugging
                    };
                    
                    this.sounds[key] = audio;
                }
            });

            // Setup BGM
            this.bgmAudio = new Audio(SOUNDS.bgm);
            this.bgmAudio.loop = true;
            this.bgmAudio.volume = 0.2; // Slightly lower volume for the busy mandolin track
            
            this.bgmAudio.oncanplaythrough = () => {
                this.loadedStatus['bgm'] = true;
            };
            this.bgmAudio.onerror = () => {
                this.loadedStatus['bgm'] = false;
            };

            this.initialized = true;
        } catch (e) {
            // console.warn("Audio initialization failed:", e);
        }
    }

    playBGM() {
        if (this.isMuted || !this.bgmAudio || !this.initialized) return;
        
        // Only try to play if we haven't failed loading
        if (this.loadedStatus['bgm'] !== false) {
             this.bgmAudio.play().catch(() => {
                 // Autoplay blocked or network error - ignore silently
             });
        }
    }

    stopBGM() {
        if (this.bgmAudio) {
            this.bgmAudio.pause();
            this.bgmAudio.currentTime = 0;
        }
    }

    playSFX(key: SoundKey) {
        if (this.isMuted || !this.initialized) return;
        
        // Check if sound is loaded before playing to avoid "supported sources" error
        if (this.loadedStatus[key]) {
            const sound = this.sounds[key];
            if (sound) {
                sound.currentTime = 0;
                sound.play().catch(() => {});
            }
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.isMuted) {
            this.bgmAudio?.pause();
        } else {
            // Only resume if initialized and loaded
            if (this.initialized && this.loadedStatus['bgm']) {
                this.bgmAudio?.play().catch(() => {});
            }
        }
        return this.isMuted;
    }

    isAudioMuted() {
        return this.isMuted;
    }
}

export const audioManager = new AudioManager();
