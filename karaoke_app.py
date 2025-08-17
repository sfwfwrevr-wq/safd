import tkinter as tk
from tkinter import ttk
import pygame
import threading
import time
import re

class KaraokeApp:
    def __init__(self):
        self.root = tk.Tk()
        self.root.title("Ilaw ng Pag-ibig - Karaoke")
        self.root.geometry("1200x800")
        self.root.configure(bg='#000000')
        self.root.resizable(True, True)
        
        # Initialize pygame mixer for audio
        pygame.mixer.init()
        
        # Song data
        self.audio_file = "audio/Ilaw_ng_Pag-ibig_2025-08-17T15_00_31.mp3"
        self.lyrics = self.load_lyrics()
        self.current_line = 0
        self.is_playing = False
        self.start_time = 0
        
        # Timing for lyrics (in seconds) - estimated based on typical song structure
        self.lyrics_timing = [
            (0, "Intro"),
            (8, "(Instrumental)"),
            (16, ""),
            (20, "Verse 1"),
            (24, "Sa bawat tibok ng dibdib ko"),
            (28, "Naririnig ang pangalan mo"),
            (32, "Parang awit na hindi mawari"),
            (36, "Kahit tahimik, dama'y malabo"),
            (40, ""),
            (42, "Pre-Chorus"),
            (44, "Hawak kamay na, hindi ka bibitaw"),
            (48, "Walang iwanan, pangako'y totoo"),
            (52, ""),
            (54, "Chorus"),
            (56, "Ikaw ang ilaw sa dilim ko"),
            (60, "Gabing malamlam ay lumiwanag"),
            (64, "Puso ko'y sayo nang nakaukit"),
            (68, "Walang hanggan ang ating pag-ibig"),
            (72, ""),
            (76, "Verse 2"),
            (80, "Minsan dala'y problema at luha"),
            (84, "Ngunit sa'yo ako'y bumabangon pa"),
            (88, "Ang yakap mo'y tila himig ng hangin"),
            (92, "Na nagpapawi sa pangungulila"),
            (96, ""),
            (98, "Pre-Chorus"),
            (100, "Walang bagyo't unos ang pipigil sa'tin"),
            (104, "Basta magkasama, lahat kayang lampasan"),
            (108, ""),
            (110, "Chorus"),
            (112, "Ikaw ang ilaw sa dilim ko"),
            (116, "Gabing malamlam ay lumiwanag"),
            (120, "Puso ko'y sayo nang nakaukit"),
            (124, "Walang hanggan ang ating pag-ibig"),
            (128, ""),
            (132, "Bridge"),
            (134, "Mga pangarap natin sabay lalakbayin"),
            (138, "Sa bawat hakbang, pag-ibig ang sandigan"),
            (142, ""),
            (144, "Chorus / Outro"),
            (146, "Ikaw ang ilaw sa dilim ko"),
            (150, "Gabing malamlam ay lumiwanag"),
            (154, "Puso ko'y sayo nang nakaukit"),
            (158, "Walang hanggan ang ating pag-ibig"),
            (162, "(Walang hanggan…)"),
            (166, "Ikaw at ako, hanggang sa wakas"),
            (170, "Tunay na pag-ibig, tayo'y iisa"),
        ]
        
        self.setup_ui()
        
    def load_lyrics(self):
        try:
            with open('lyrics.txt', 'r', encoding='utf-8') as file:
                content = file.read()
                # Split by lines and clean up
                lines = [line.strip() for line in content.split('\n')]
                return [line for line in lines if line]  # Remove empty lines
        except FileNotFoundError:
            return ["Lyrics file not found"]
    
    def setup_ui(self):
        # Main container with gradient effect
        main_frame = tk.Frame(self.root, bg='#000000')
        main_frame.pack(fill='both', expand=True, padx=20, pady=20)
        
        # Title
        title_label = tk.Label(
            main_frame,
            text="🎵 ILAW NG PAG-IBIG 🎵",
            font=('Arial', 28, 'bold'),
            fg='#FFFFFF',
            bg='#000000'
        )
        title_label.pack(pady=(0, 30))
        
        # Lyrics display area with custom styling
        self.lyrics_frame = tk.Frame(main_frame, bg='#000000')
        self.lyrics_frame.pack(fill='both', expand=True)
        
        # Create multiple label lines for smooth scrolling effect
        self.lyric_labels = []
        for i in range(7):  # Show 7 lines at once
            label = tk.Label(
                self.lyrics_frame,
                text="",
                font=('Arial', 24, 'bold'),
                fg='#FFFFFF',
                bg='#000000',
                wraplength=1000,
                justify='center'
            )
            label.pack(pady=8)
            self.lyric_labels.append(label)
        
        # Control buttons frame
        controls_frame = tk.Frame(main_frame, bg='#000000')
        controls_frame.pack(pady=30)
        
        # Play/Pause button with modern styling
        self.play_button = tk.Button(
            controls_frame,
            text="▶ PLAY",
            font=('Arial', 16, 'bold'),
            fg='#000000',
            bg='#FFFFFF',
            activeforeground='#FFFFFF',
            activebackground='#333333',
            relief='flat',
            padx=30,
            pady=10,
            command=self.toggle_play
        )
        self.play_button.pack(side='left', padx=10)
        
        # Stop button
        stop_button = tk.Button(
            controls_frame,
            text="⏹ STOP",
            font=('Arial', 16, 'bold'),
            fg='#000000',
            bg='#FFFFFF',
            activeforeground='#FFFFFF',
            activebackground='#333333',
            relief='flat',
            padx=30,
            pady=10,
            command=self.stop_song
        )
        stop_button.pack(side='left', padx=10)
        
        # Progress bar
        self.progress_var = tk.StringVar()
        self.progress_var.set("00:00 / 00:00")
        progress_label = tk.Label(
            controls_frame,
            textvariable=self.progress_var,
            font=('Arial', 14),
            fg='#FFFFFF',
            bg='#000000'
        )
        progress_label.pack(side='left', padx=20)
        
    def toggle_play(self):
        if not self.is_playing:
            self.play_song()
        else:
            self.pause_song()
    
    def play_song(self):
        try:
            if not pygame.mixer.get_init():
                pygame.mixer.init()
            
            pygame.mixer.music.load(self.audio_file)
            pygame.mixer.music.play()
            
            self.is_playing = True
            self.start_time = time.time()
            self.play_button.config(text="⏸ PAUSE")
            
            # Start lyrics synchronization thread
            threading.Thread(target=self.sync_lyrics, daemon=True).start()
            
        except Exception as e:
            print(f"Error playing audio: {e}")
    
    def pause_song(self):
        pygame.mixer.music.pause()
        self.is_playing = False
        self.play_button.config(text="▶ PLAY")
    
    def stop_song(self):
        pygame.mixer.music.stop()
        self.is_playing = False
        self.current_line = 0
        self.play_button.config(text="▶ PLAY")
        self.clear_lyrics()
    
    def sync_lyrics(self):
        while self.is_playing and pygame.mixer.music.get_busy():
            current_time = time.time() - self.start_time
            
            # Update progress
            minutes = int(current_time // 60)
            seconds = int(current_time % 60)
            self.progress_var.set(f"{minutes:02d}:{seconds:02d} / 03:00")
            
            # Find current lyric line
            current_lyric = ""
            for timing, lyric in self.lyrics_timing:
                if current_time >= timing:
                    current_lyric = lyric
                else:
                    break
            
            # Update display with smooth scrolling effect
            self.update_lyrics_display(current_lyric, current_time)
            
            time.sleep(0.1)
    
    def update_lyrics_display(self, current_lyric, current_time):
        # Find the index of current lyric in timing
        current_index = -1
        for i, (timing, lyric) in enumerate(self.lyrics_timing):
            if current_time >= timing:
                current_index = i
            else:
                break
        
        # Update labels with surrounding lyrics for context
        start_index = max(0, current_index - 3)
        
        for i, label in enumerate(self.lyric_labels):
            lyric_index = start_index + i
            
            if lyric_index < len(self.lyrics_timing):
                _, lyric_text = self.lyrics_timing[lyric_index]
                
                # Highlight current lyric
                if lyric_index == current_index:
                    label.config(
                        text=lyric_text,
                        fg='#FFFFFF',
                        font=('Arial', 26, 'bold'),
                        bg='#333333'  # Subtle highlight
                    )
                else:
                    # Fade effect for other lyrics
                    alpha = max(0.3, 1.0 - abs(lyric_index - current_index) * 0.2)
                    gray_value = int(255 * alpha)
                    color = f"#{gray_value:02x}{gray_value:02x}{gray_value:02x}"
                    
                    label.config(
                        text=lyric_text,
                        fg=color,
                        font=('Arial', 20, 'normal'),
                        bg='#000000'
                    )
            else:
                label.config(text="", bg='#000000')
    
    def clear_lyrics(self):
        for label in self.lyric_labels:
            label.config(text="", bg='#000000')
    
    def run(self):
        # Add some initial styling effects
        self.root.after(100, self.animate_title)
        self.root.mainloop()
    
    def animate_title(self):
        # Simple pulsing effect for title
        title_widget = self.root.winfo_children()[0].winfo_children()[0]
        current_color = title_widget.cget('fg')
        
        if current_color == '#FFFFFF':
            title_widget.config(fg='#CCCCCC')
        else:
            title_widget.config(fg='#FFFFFF')
        
        self.root.after(1000, self.animate_title)

if __name__ == "__main__":
    app = KaraokeApp()
    app.run()
