declare module 'react-speech-recognition' {
  export interface SpeechRecognitionOptions {
    continuous?: boolean
    language?: string
  }

  export interface UseSpeechRecognitionReturn {
    transcript: string
    listening: boolean
    resetTranscript: () => void
    browserSupportsSpeechRecognition: boolean
  }

  export function useSpeechRecognition(): UseSpeechRecognitionReturn

  const SpeechRecognition: {
    startListening: (options?: SpeechRecognitionOptions) => Promise<void>
    stopListening: () => Promise<void>
    abortListening: () => Promise<void>
  }

  export default SpeechRecognition
}
