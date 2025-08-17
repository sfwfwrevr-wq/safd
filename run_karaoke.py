#!/usr/bin/env python3
"""
Modern Karaoke App Launcher
Run this file to start the karaoke application
"""

import sys
import os

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from karaoke_app import KaraokeApp
    
    print("🎵 Starting Ilaw ng Pag-ibig Karaoke App...")
    print("📁 Make sure the audio file is in the 'audio' folder")
    print("🎤 Enjoy singing along!")
    print("-" * 50)
    
    app = KaraokeApp()
    app.run()
    
except ImportError as e:
    print(f"❌ Missing dependency: {e}")
    print("💡 Install required packages with: pip install pygame")
    
except Exception as e:
    print(f"❌ Error starting app: {e}")
    print("💡 Make sure all files are in the correct location")
