import { Mic, MicOff } from 'lucide-react'
import { useEffect } from 'react'
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition'
import styles from './VoiceInput.module.css'

interface VoiceInputProps {
  onTranscript: (text: string) => void
}

export function VoiceInput({ onTranscript }: VoiceInputProps) {
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition()

  useEffect(() => {
    if (!listening && transcript) {
      onTranscript(transcript)
      resetTranscript()
    }
  }, [listening, transcript, onTranscript, resetTranscript])

  if (!browserSupportsSpeechRecognition) {
    return (
      <div className={styles.unsupported}>
        Voice input not supported in this browser
      </div>
    )
  }

  const handleToggle = () => {
    if (listening) {
      SpeechRecognition.stopListening()
    } else {
      resetTranscript()
      SpeechRecognition.startListening({ continuous: false })
    }
  }

  return (
    <button
      type="button"
      className={listening ? styles.buttonActive : styles.button}
      onClick={handleToggle}
      aria-label={listening ? 'Stop voice input' : 'Start voice input'}
    >
      {listening ? <MicOff size={20} /> : <Mic size={20} />}
    </button>
  )
}
