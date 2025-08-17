"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Play, Pause, Square, Volume2 } from "lucide-react"
import { KaraokeDisplay } from "@/components/karaoke-display"

export default function KaraokeWebsite() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.8)
  const audioRef = useRef<HTMLAudioElement>(null)

  // Initialize audio on component mount
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    // Set initial properties
    audio.preload = "auto"
    audio.volume = volume
    audio.crossOrigin = "anonymous"
    
    // Force load the audio
    audio.load()
  }, [volume])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleError = (e: Event) => {
      console.log("[v0] Audio error:", e)
    }

    const handleCanPlay = () => {
      console.log("[v0] Audio can play")
      if (audio) {
        audio.volume = volume
        audio.muted = false
      }
    }

    const updateTime = () => setCurrentTime(audio.currentTime)
    const updateDuration = () => setDuration(audio.duration)

    audio.addEventListener("timeupdate", updateTime)
    audio.addEventListener("loadedmetadata", updateDuration)
    audio.addEventListener("ended", () => setIsPlaying(false))
    audio.addEventListener("error", handleError)
    audio.addEventListener("canplay", handleCanPlay)

    return () => {
      audio.removeEventListener("timeupdate", updateTime)
      audio.removeEventListener("loadedmetadata", updateDuration)
      audio.removeEventListener("ended", () => setIsPlaying(false))
      audio.removeEventListener("error", handleError)
      audio.removeEventListener("canplay", handleCanPlay)
    }
  }, [volume])

  const handlePlay = async () => {
    if (audioRef.current) {
      try {
        const audio = audioRef.current
        
        // Ensure audio is ready
        if (audio.readyState < 2) {
          await new Promise((resolve) => {
            audio.addEventListener('canplay', resolve, { once: true })
            audio.load()
          })
        }
        
        audio.muted = false
        audio.volume = volume
        console.log("[v0] Attempting to play audio, volume:", audio.volume, "muted:", audio.muted)

        if (isPlaying) {
          audio.pause()
          console.log("[v0] Audio paused")
          setIsPlaying(false)
        } else {
          // Create user interaction context for autoplay
          const playPromise = audio.play()
          if (playPromise !== undefined) {
            await playPromise
            console.log("[v0] Audio started playing successfully")
            setIsPlaying(true)
          }
        }
      } catch (error) {
        console.log("[v0] Play error:", error)
        
        // Try to enable audio context on user interaction
        try {
          const audio = audioRef.current
          if (audio) {
            audio.load()
            // Small delay then retry
            setTimeout(async () => {
              try {
                await audio.play()
                setIsPlaying(true)
                console.log("[v0] Audio started after reload")
              } catch (retryError) {
                console.log("[v0] Retry failed:", retryError)
                alert("Unable to play audio. Please check if the audio file is accessible and try again.")
              }
            }, 200)
          }
        } catch (finalError) {
          console.log("[v0] Final retry failed:", finalError)
          alert("Audio playback failed. Please refresh the page and try again.")
        }
      }
    }
  }

  const handleStop = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      setIsPlaying(false)
      setCurrentTime(0)
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number.parseFloat(e.target.value)
    setVolume(newVolume)
    if (audioRef.current) {
      audioRef.current.volume = newVolume
      audioRef.current.muted = false
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <main className="container mx-auto px-6 py-12">
        <div className="space-y-12">
          <KaraokeDisplay currentTime={currentTime} isPlaying={isPlaying} />

          <Card className="bg-gradient-to-r from-gray-900 via-black to-gray-900 border-gray-700 shadow-2xl">
            <CardContent className="p-8">
              <div className="flex flex-col items-center space-y-6">
                <div className="flex items-center gap-6">
                  <Button
                    onClick={handlePlay}
                    size="lg"
                    className="bg-gradient-to-r from-white to-gray-200 text-black hover:from-gray-200 hover:to-gray-300 font-bold text-lg px-8 py-4 rounded-full shadow-lg transform hover:scale-105 transition-all duration-200"
                  >
                    {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8" />}
                  </Button>
                  <Button
                    onClick={handleStop}
                    size="lg"
                    className="bg-gradient-to-r from-gray-700 to-gray-600 text-white hover:from-gray-600 hover:to-gray-500 font-bold text-lg px-8 py-4 rounded-full shadow-lg transform hover:scale-105 transition-all duration-200"
                  >
                    <Square className="h-8 w-8" />
                  </Button>
                </div>

                <div className="flex items-center gap-4 w-full max-w-lg">
                  <Volume2 className="h-6 w-6 text-white" />
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <span className="text-white text-sm w-12">{Math.round(volume * 100)}%</span>
                </div>

                <div className="text-2xl text-white font-bold bg-black/50 px-6 py-3 rounded-lg border border-gray-600">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </div>
                <div className="w-full max-w-lg bg-gray-800 rounded-full h-4 shadow-inner border border-gray-600">
                  <div
                    className="bg-gradient-to-r from-white via-gray-200 to-white h-4 rounded-full transition-all duration-300 shadow-lg"
                    style={{
                      width: duration > 0 ? `${(currentTime / duration) * 100}%` : "0%",
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <audio 
        ref={audioRef} 
        preload="auto" 
        crossOrigin="anonymous"
        style={{ display: 'none' }}
      >
        <source
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Ilaw%20ng%20Pag-ibig_2025-08-17T15_00_31-B4C5XM5hKrDMRobCtDL7r3jdg4aOAz.mp3"
          type="audio/mpeg"
        />
        <source 
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Ilaw%20ng%20Pag-ibig_2025-08-17T15_00_31-ebfFSIw9znCnPfnk6FQE6hUtzoZF5o.mp3" 
          type="audio/mpeg" 
        />
        Your browser does not support the audio element.
      </audio>
    </div>
  )
}
