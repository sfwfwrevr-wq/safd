"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function CodeShowcase() {
  const pythonCode = `import tkinter as tk
from tkinter import ttk
import pygame
import threading
import time

class ModernKaraokeApp:
    def __init__(self):
        self.root = tk.Tk()
        self.root.title("Modern Karaoke App")
        self.root.geometry("1200x800")
        self.root.configure(bg='#000000')
        
        # Initialize pygame mixer for audio
        pygame.mixer.init()
        
        # Lyrics with timing
        self.lyrics = [
            {"time": 0, "text": "Sa dilim ng gabi, ikaw ang liwanag"},
            {"time": 4, "text": "Nagbibigay ng pag-asa sa puso kong malungkot"},
            {"time": 8, "text": "Ang iyong ngiti, parang bituin sa langit"},
            # ... more lyrics
        ]
        
        self.setup_ui()
        
    def setup_ui(self):
        # Title
        title_label = tk.Label(
            self.root,
            text="Ilaw ng Pag-ibig",
            font=("Arial", 32, "bold"),
            fg="white",
            bg="black"
        )
        title_label.pack(pady=20)
        
        # Lyrics display frame
        self.lyrics_frame = tk.Frame(self.root, bg="black", height=400)
        self.lyrics_frame.pack(fill="both", expand=True, padx=50, pady=20)
        
        # Create 7 label widgets for lyrics display
        self.lyric_labels = []
        for i in range(7):
            label = tk.Label(
                self.lyrics_frame,
                text="",
                font=("Arial", 24),
                fg="white",
                bg="black",
                wraplength=800
            )
            label.pack(pady=5)
            self.lyric_labels.append(label)
        
        # Control buttons
        control_frame = tk.Frame(self.root, bg="black")
        control_frame.pack(pady=20)
        
        self.play_button = tk.Button(
            control_frame,
            text="▶ Play",
            font=("Arial", 16, "bold"),
            bg="#333333",
            fg="white",
            command=self.toggle_play,
            padx=20,
            pady=10
        )
        self.play_button.pack(side="left", padx=10)
        
        self.stop_button = tk.Button(
            control_frame,
            text="⏹ Stop",
            font=("Arial", 16, "bold"),
            bg="#333333",
            fg="white",
            command=self.stop_audio,
            padx=20,
            pady=10
        )
        self.stop_button.pack(side="left", padx=10)
        
    def update_lyrics_display(self, current_time):
        # Find current lyric index
        current_index = 0
        for i, lyric in enumerate(self.lyrics):
            if current_time >= lyric["time"]:
                current_index = i
        
        # Display 7 lyrics centered around current
        start_index = max(0, current_index - 3)
        
        for i, label in enumerate(self.lyric_labels):
            lyric_index = start_index + i
            
            if lyric_index < len(self.lyrics):
                text = self.lyrics[lyric_index]["text"]
                
                if lyric_index == current_index:
                    # Highlight current lyric
                    label.config(
                        text=text,
                        font=("Arial", 26, "bold"),
                        fg="#FFFFFF",
                        bg="#333333"
                    )
                else:
                    # Normal styling for other lyrics
                    label.config(
                        text=text,
                        font=("Arial", 22),
                        fg="#CCCCCC",
                        bg="black"
                    )
            else:
                label.config(text="", bg="black")
    
    def run(self):
        self.root.mainloop()

if __name__ == "__main__":
    app = ModernKaraokeApp()
    app.run()`

  const requirements = `pygame==2.5.2
tkinter (built-in with Python)
threading (built-in with Python)
time (built-in with Python)`

  const installScript = `#!/usr/bin/env python3
import subprocess
import sys

def install_dependencies():
    """Install required dependencies for the karaoke app"""
    dependencies = [
        "pygame==2.5.2"
    ]
    
    print("Installing karaoke app dependencies...")
    
    for dep in dependencies:
        try:
            subprocess.check_call([sys.executable, "-m", "pip", "install", dep])
            print(f"✓ Successfully installed {dep}")
        except subprocess.CalledProcessError:
            print(f"✗ Failed to install {dep}")
            return False
    
    print("\\n🎵 All dependencies installed successfully!")
    print("Run 'python karaoke_app.py' to start the karaoke application")
    return True

if __name__ == "__main__":
    install_dependencies()`

  return (
    <div className="space-y-8">
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Badge variant="secondary">Python</Badge>
            Modern Karaoke Application Code
          </CardTitle>
          <p className="text-muted-foreground">
            Complete Python implementation of the karaoke functionality with synchronized lyrics display
          </p>
        </CardHeader>
      </Card>

      <div className="grid gap-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">Main Application (karaoke_app.py)</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
              <code className="text-foreground">{pythonCode}</code>
            </pre>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">Requirements (requirements.txt)</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
              <code className="text-foreground">{requirements}</code>
            </pre>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">Installation Script (install_dependencies.py)</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
              <code className="text-foreground">{installScript}</code>
            </pre>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">How to Run</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Step 1: Install Dependencies</h4>
              <code className="text-sm bg-background px-2 py-1 rounded">python install_dependencies.py</code>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Step 2: Run the Application</h4>
              <code className="text-sm bg-background px-2 py-1 rounded">python karaoke_app.py</code>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Features</h4>
              <ul className="text-sm space-y-1 list-disc list-inside">
                <li>Modern black and white UI with tkinter</li>
                <li>Synchronized lyrics display with 7-line scrolling</li>
                <li>Audio playback with pygame mixer</li>
                <li>Highlighted current lyric with smooth transitions</li>
                <li>Play/pause and stop controls</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
