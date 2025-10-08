"use client"

import { useState, useEffect, useRef, useCallback } from "react"

interface SpeechRecognitionResult {
  isFinal: boolean
  [index: number]: SpeechRecognitionAlternative
}

interface SpeechRecognitionAlternative {
  transcript: string
  confidence: number
}

interface SpeechRecognitionResultList {
  length: number
  item(index: number): SpeechRecognitionResult
  [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number
  results: SpeechRecognitionResultList
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string
  message: string
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
  start(): void
  stop(): void
}

declare global {
  interface Window {
    SpeechRecognition?: {
      new(): SpeechRecognition
    }
    webkitSpeechRecognition?: {
      new(): SpeechRecognition
    }
  }
}

interface UseSpeechRecognitionOptions {
  continuous?: boolean
  interimResults?: boolean
  lang?: string
  onResult?: (transcript: string) => void
  onError?: (error: string) => void
}

interface UseSpeechRecognitionReturn {
  isListening: boolean
  transcript: string
  interimTranscript: string
  startListening: () => void
  stopListening: () => void
  resetTranscript: () => void
  isSupported: boolean
  error: string | null
}

export function useSpeechRecognition(options: UseSpeechRecognitionOptions = {}): UseSpeechRecognitionReturn {
  const { continuous = true, interimResults = true, lang = "fr-FR", onResult, onError } = options

  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [interimTranscript, setInterimTranscript] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isSupported, setIsSupported] = useState(false)

  const recognitionRef = useRef<SpeechRecognition | null>(null)

  useEffect(() => {
    // Check if SpeechRecognition is supported
    if (typeof window !== "undefined") {
      const SpeechRecognitionConstructor = window.SpeechRecognition ?? window.webkitSpeechRecognition
      setIsSupported(!!SpeechRecognitionConstructor)

      if (SpeechRecognitionConstructor) {
        const recognition = new SpeechRecognitionConstructor()
        recognition.continuous = continuous
        recognition.interimResults = interimResults
        recognition.lang = lang

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          let finalTranscript = ""
          let interim = ""

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i]
            const transcriptPart = result[0].transcript

            if (result.isFinal) {
              finalTranscript += transcriptPart + " "
            } else {
              interim += transcriptPart
            }
          }

          if (finalTranscript) {
            setTranscript((prev) => prev + finalTranscript)
            if (onResult) {
              onResult(finalTranscript.trim())
            }
          }

          setInterimTranscript(interim)
        }

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.error("[v0] Speech recognition error:", event.error)
          let errorMessage = "Erreur de reconnaissance vocale"

          switch (event.error) {
            case "no-speech":
              errorMessage = "Aucune parole détectée"
              break
            case "audio-capture":
              errorMessage = "Microphone non disponible"
              break
            case "not-allowed":
              errorMessage = "Permission microphone refusée"
              break
            case "network":
              errorMessage = "Erreur réseau"
              break
          }

          setError(errorMessage)
          setIsListening(false)
          if (onError) {
            onError(errorMessage)
          }
        }

        recognition.onend = () => {
          console.log("[v0] Speech recognition ended")
          setIsListening(false)
        }

        recognitionRef.current = recognition
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [continuous, interimResults, lang, onResult, onError])

  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      setError("Reconnaissance vocale non supportée")
      return
    }

    try {
      setError(null)
      recognitionRef.current.start()
      setIsListening(true)
      console.log("[v0] Speech recognition started")
    } catch (err) {
      console.error("[v0] Error starting recognition:", err)
      setError("Impossible de démarrer l'enregistrement")
    }
  }, [])

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      setIsListening(false)
      console.log("[v0] Speech recognition stopped")
    }
  }, [])

  const resetTranscript = useCallback(() => {
    setTranscript("")
    setInterimTranscript("")
  }, [])

  return {
    isListening,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    resetTranscript,
    isSupported,
    error,
  }
}
