import subprocess
import sys

def install_dependencies():
    """Install required Python packages"""
    
    packages = [
        'pygame==2.5.2'
    ]
    
    print("🔧 Installing karaoke app dependencies...")
    
    for package in packages:
        try:
            print(f"📦 Installing {package}...")
            subprocess.check_call([sys.executable, '-m', 'pip', 'install', package])
            print(f"✅ Successfully installed {package}")
        except subprocess.CalledProcessError as e:
            print(f"❌ Failed to install {package}: {e}")
            return False
    
    print("🎉 All dependencies installed successfully!")
    print("🚀 You can now run the karaoke app with: python run_karaoke.py")
    return True

if __name__ == "__main__":
    install_dependencies()
