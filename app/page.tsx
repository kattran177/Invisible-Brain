'use client'

import { useState, useRef } from 'react'

export default function Home() {
  const [isRecording, setIsRecording] = useState(false)
  const [status, setStatus] = useState('')
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
      setStatus('Recording...')

      timerRef.current = setTimeout(() => {
        stopRecording()
      }, 10000)
    } catch (err) {
      setStatus('Microphone access denied')
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
    setStatus('Processing...')
    const formData = new FormData()
    formData.append('audio', audioBlob, 'recording.webm')

    try {
      const res = await fetch('/api/process', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      
      if (res.ok) {
        setStatus(`✓ Saved as ${data.category}`)
        setTimeout(() => setStatus(''), 3000)
      } else {
        setStatus(`Error: ${data.error}`)
      }
    } catch (err) {
      setStatus('Failed to process')
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
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="flex flex-col items-center gap-8">
        <button
          onClick={handleClick}
          className={`w-48 h-48 rounded-full bg-white shadow-2xl flex items-center justify-center text-gray-800 font-semibold text-xl transition-all ${
            isRecording ? 'animate-pulse scale-110' : 'hover:scale-105'
          }`}
        >
          {isRecording ? 'Stop' : 'Record'}
        </button>
        {status && (
          <p className="text-white text-lg font-medium">{status}</p>
        )}
      </div>
    </main>
  )
}
