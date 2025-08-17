"use client"

import { useEffect, useState, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"

interface LyricLine {
  time: number
  text: string
  section?: string
}

const lyrics: LyricLine[] = [
  { time: 0, text: "(Instrumental)", section: "intro" },
  { time: 10, text: "Sa bawat tibok ng dibdib ko", section: "verse" },
  { time: 15, text: "Naririnig ang pangalan mo", section: "verse" },
  { time: 20, text: "Parang awit na hindi mawari", section: "verse" },
  { time: 25, text: "Kahit tahimik, dama'y malabo", section: "verse" },
  { time: 30, text: "Hawak kamay na, hindi ka bibitaw", section: "pre-chorus" },
  { time: 35, text: "Walang iwanan, pangako'y totoo", section: "pre-chorus" },
  { time: 40, text: "Ikaw ang ilaw sa dilim ko", section: "chorus" },
  { time: 45, text: "Gabing malamlam ay lumiwanag", section: "chorus" },
  { time: 50, text: "Puso ko'y sayo nang nakaukit", section: "chorus" },
  { time: 55, text: "Walang hanggan ang ating pag-ibig", section: "chorus" },
  { time: 65, text: "Minsan dala'y problema at luha", section: "verse" },
  { time: 70, text: "Ngunit sa'yo ako'y bumabangon pa", section: "verse" },
  { time: 75, text: "Ang yakap mo'y tila himig ng hangin", section: "verse" },
  { time: 80, text: "Na nagpapawi sa pangungulila", section: "verse" },
  { time: 85, text: "Walang bagyo't unos ang pipigil sa'tin", section: "pre-chorus" },
  { time: 90, text: "Basta magkasama, lahat kayang lampasan", section: "pre-chorus" },
  { time: 95, text: "Ikaw ang ilaw sa dilim ko", section: "chorus" },
  { time: 100, text: "Gabing malamlam ay lumiwanag", section: "chorus" },
  { time: 105, text: "Puso ko'y sayo nang nakaukit", section: "chorus" },
  { time: 110, text: "Walang hanggan ang ating pag-ibig", section: "chorus" },
  { time: 120, text: "Mga pangarap natin sabay lalakbayin", section: "bridge" },
  { time: 125, text: "Sa bawat hakbang, pag-ibig ang sandigan", section: "bridge" },
  { time: 130, text: "Ikaw ang ilaw sa dilim ko", section: "chorus" },
  { time: 135, text: "Gabing malamlam ay lumiwanag", section: "chorus" },
  { time: 140, text: "Puso ko'y sayo nang nakaukit", section: "chorus" },
  { time: 145, text: "Walang hanggan ang ating pag-ibig", section: "chorus" },
  { time: 150, text: "Walang hanggan…", section: "outro" },
  { time: 155, text: "Ikaw at ako, hanggang sa wakas", section: "outro" },
  { time: 160, text: "Tunay na pag-ibig, tayo'y iisa", section: "outro" },
]

interface KaraokeDisplayProps {
  currentTime: number
  isPlaying: boolean
}

function useAudioAnalysis(isPlaying: boolean) {
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null)
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null)
  const [tempo, setTempo] = useState(120) // Default BPM
  const [energy, setEnergy] = useState(0)
  const [beatDetected, setBeatDetected] = useState(false)
  const animationRef = useRef<number>()

  useEffect(() => {
    if (!isPlaying) return

    const audio = document.querySelector("audio") as HTMLAudioElement
    if (!audio) return

    try {
      const context = new (window.AudioContext || (window as any).webkitAudioContext)()
      const source = context.createMediaElementSource(audio)
      const analyserNode = context.createAnalyser()

      analyserNode.fftSize = 2048
      source.connect(analyserNode)
      analyserNode.connect(context.destination)

      setAudioContext(context)
      setAnalyser(analyserNode)

      const dataArray = new Uint8Array(analyserNode.frequencyBinCount)
      let lastBeatTime = 0
      let beatHistory: number[] = []

      const analyze = () => {
        if (!analyserNode) return

        analyserNode.getByteFrequencyData(dataArray)

        // Calculate energy in bass frequencies (20-200Hz)
        const bassStart = Math.floor((20 * analyserNode.fftSize) / context.sampleRate)
        const bassEnd = Math.floor((200 * analyserNode.fftSize) / context.sampleRate)
        let bassEnergy = 0

        for (let i = bassStart; i < bassEnd; i++) {
          bassEnergy += dataArray[i]
        }
        bassEnergy = bassEnergy / (bassEnd - bassStart)

        // Beat detection using energy threshold
        const currentTime = Date.now()
        const energyThreshold = 120

        if (bassEnergy > energyThreshold && currentTime - lastBeatTime > 300) {
          setBeatDetected(true)
          beatHistory.push(currentTime)
          lastBeatTime = currentTime

          // Calculate tempo from beat intervals
          if (beatHistory.length > 4) {
            beatHistory = beatHistory.slice(-8) // Keep last 8 beats
            const intervals = []
            for (let i = 1; i < beatHistory.length; i++) {
              intervals.push(beatHistory[i] - beatHistory[i - 1])
            }
            const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length
            const calculatedTempo = Math.round(60000 / avgInterval)

            if (calculatedTempo > 60 && calculatedTempo < 200) {
              setTempo(calculatedTempo)
            }
          }

          setTimeout(() => setBeatDetected(false), 100)
        }

        setEnergy(bassEnergy)
        animationRef.current = requestAnimationFrame(analyze)
      }

      analyze()
    } catch (error) {
      console.log("[v0] Audio analysis not available:", error)
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      if (audioContext) {
        audioContext.close()
      }
    }
  }, [isPlaying])

  return { tempo, energy, beatDetected }
}

function TypewriterText({
  text,
  isActive,
  tempo,
  energy,
}: {
  text: string
  isActive: boolean
  tempo: number
  energy: number
}) {
  const [displayedText, setDisplayedText] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (!isActive) {
      setDisplayedText(text)
      setCurrentIndex(text.length)
      return
    }

    setDisplayedText("")
    setCurrentIndex(0)

    const baseSpeed = 60000 / (tempo * 4) // Quarter note timing
    const energyMultiplier = Math.max(0.5, Math.min(1.5, energy / 100))
    const adaptiveSpeed = Math.max(20, Math.min(80, baseSpeed * energyMultiplier))

    const startDelay = setTimeout(() => {
      const timer = setInterval(() => {
        setCurrentIndex((prevIndex) => {
          if (prevIndex < text.length) {
            setDisplayedText(text.slice(0, prevIndex + 1))
            return prevIndex + 1
          } else {
            clearInterval(timer)
            return prevIndex
          }
        })
      }, adaptiveSpeed)

      return () => clearInterval(timer)
    }, 150) // Slightly longer delay for better sync

    return () => clearTimeout(startDelay)
  }, [text, isActive, tempo, energy])

  return <span>{displayedText}</span>
}

export function KaraokeDisplay({ currentTime, isPlaying }: KaraokeDisplayProps) {
  const [currentLyricIndex, setCurrentLyricIndex] = useState(0)
  const [visibleLyrics, setVisibleLyrics] = useState<LyricLine[]>([])

  const { tempo, energy, beatDetected } = useAudioAnalysis(isPlaying)

  useEffect(() => {
    const mlOffset = Math.max(0.1, Math.min(0.5, (120 - tempo) / 200)) // Adaptive offset based on tempo
    const adjustedTime = currentTime + mlOffset

    let index = 0
    for (let i = 0; i < lyrics.length; i++) {
      if (adjustedTime >= lyrics[i].time) {
        index = i
      } else {
        break
      }
    }
    setCurrentLyricIndex(index)

    const startIndex = Math.max(0, index - 2)
    const endIndex = Math.min(lyrics.length, index + 3)
    setVisibleLyrics(lyrics.slice(startIndex, endIndex))
  }, [currentTime, tempo])

  return (
    <Card className="bg-gradient-to-br from-black via-gray-900 to-black border-white/10 shadow-2xl min-h-[600px] backdrop-blur-sm">
      <CardContent className="p-16">
        <div className="flex flex-col items-center justify-center min-h-[500px] space-y-8">
          {visibleLyrics.map((lyric, index) => {
            const actualIndex = lyrics.findIndex((l) => l.time === lyric.time)
            const isCurrent = actualIndex === currentLyricIndex
            const isPast = actualIndex < currentLyricIndex
            const isFuture = actualIndex > currentLyricIndex

            return (
              <div
                key={lyric.time}
                className={`
                  text-center transition-all duration-500 px-8 py-4 rounded-2xl font-bold
                  ${
                    isCurrent
                      ? "text-6xl text-white scale-110 shadow-2xl border border-white/20 bg-white/5"
                      : isPast
                        ? "text-2xl text-white/30 opacity-50"
                        : "text-3xl text-white/60 opacity-70"
                  }
                  ${isPlaying && isCurrent && beatDetected ? "animate-pulse" : ""}
                `}
                style={{
                  transform: isCurrent ? `translateY(-15px) scale(${beatDetected ? 1.05 : 1})` : "translateY(0)",
                  textShadow: isCurrent
                    ? `0 0 30px rgba(255, 255, 255, ${energy / 200}), 0 0 60px rgba(255, 255, 255, ${energy / 400})`
                    : "0 2px 4px rgba(0,0,0,0.5)",
                  letterSpacing: isCurrent ? "2px" : "1px",
                  filter: isCurrent ? `brightness(${1 + energy / 300})` : "brightness(1)",
                }}
              >
                {isCurrent && isPlaying ? (
                  <TypewriterText text={lyric.text} isActive={true} tempo={tempo} energy={energy} />
                ) : (
                  lyric.text
                )}
              </div>
            )
          })}

          {!isPlaying && currentTime === 0 && (
            <div className="text-center text-white/80 text-4xl font-bold animate-pulse">Press play to start</div>
          )}

          {isPlaying && (
            <div className="fixed bottom-4 right-4 text-white/50 text-sm bg-black/50 p-2 rounded">
              Tempo: {tempo} BPM | Energy: {Math.round(energy)}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
