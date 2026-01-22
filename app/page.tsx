'use client'

import { useState, useRef } from 'react'

type LogEntry = {
  transcript: string
  category: string
  destination: string
  timestamp: string
}

export default function Home() {
  const [isRecording, setIsRecording] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [log, setLog] = useState<LogEntry[]>([])
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' })
        stream.getTracks().forEach(track => track.stop())
        await processAudio(audioBlob)
      }

      mediaRecorder.start()
      setIsRecording(true)

      timerRef.current = setTimeout(() => {
        stopRecording()
      }, 10000)
    } catch (err) {
      setResult({ error: 'Microphone access denied' })
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }

  const processAudio = async (audioBlob: Blob) => {
    setResult({ processing: true })
    const formData = new FormData()
    formData.append('audio', audioBlob, 'recording.webm')

    try {
      const res = await fetch('/api/process', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      
      if (res.ok) {
        setResult(data)
        setLog(prev => [{
          transcript: data.content.substring(0, 50) + '...',
          category: data.category,
          destination: data.destination,
          timestamp: new Date().toLocaleTimeString()
        }, ...prev].slice(0, 3))
      } else {
        setResult({ error: data.error })
      }
    } catch (err) {
      setResult({ error: 'Failed to process' })
    }
  }

  const handleClick = () => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-6">
      <div className="flex-1 flex flex-col items-center justify-center gap-8 w-full max-w-md">
        <button
          onClick={handleClick}
          className={`w-48 h-48 rounded-full bg-white shadow-2xl flex items-center justify-center text-gray-800 font-semibold text-xl transition-all ${
            isRecording ? 'animate-pulse scale-110' : 'hover:scale-105'
          }`}
        >
          {isRecording ? 'Stop' : 'Record'}
        </button>
        
        {result?.processing && (
          <p className="text-white text-lg">Processing...</p>
        )}
        
        {result?.transcript && (
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 w-full text-white space-y-3">
            <div>
              <p className="text-sm opacity-75">Transcription:</p>
              <p className="font-medium">I heard: "{result.transcript}"</p>
            </div>
            <div>
              <p className="text-sm opacity-75">Reasoning:</p>
              <p className="font-medium">Classification: {result.category}. Confidence: {result.confidence}%.</p>
            </div>
            <div>
              <p className="text-sm opacity-75">Destination:</p>
              <p className="font-medium">Status: Sent to {result.destination}.</p>
            </div>
          </div>
        )}
        
        {result?.error && (
          <p className="text-red-300 text-lg">{result.error}</p>
        )}
      </div>
      
      {log.length > 0 && (
        <div className="w-full max-w-md bg-white/5 backdrop-blur-sm rounded-lg p-4">
          <p className="text-white text-sm opacity-75 mb-2">Recent Activity</p>
          <div className="space-y-2">
            {log.map((entry, i) => (
              <div key={i} className="text-white text-xs opacity-90">
                <span className="font-medium">{entry.timestamp}</span> - {entry.category} → {entry.destination}
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  )
}
