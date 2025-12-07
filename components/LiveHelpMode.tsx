
import React, { useEffect, useRef, useState } from "react";
import { Mic, PhoneOff, Activity, Volume2, Shield, AlertTriangle } from "lucide-react";
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import GlassCard from "./GlassCard";

interface LiveHelpModeProps {
  onExit: () => void;
}

const LiveHelpMode: React.FC<LiveHelpModeProps> = ({ onExit }) => {
  const [status, setStatus] = useState<"connecting" | "connected" | "error" | "permission_denied">("connecting");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0);
  
  // Audio Context Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  // Playback Refs
  const nextStartTimeRef = useRef<number>(0);
  const scheduledSourcesRef = useRef<AudioBufferSourceNode[]>([]);

  // Session Ref
  const sessionRef = useRef<any>(null);

  useEffect(() => {
    let mounted = true;

    const initializeSession = async () => {
      try {
        // 1. Request Microphone Access FIRST
        // This ensures we have permission before starting the expensive API connection
        const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            sampleRate: 16000,
            channelCount: 1,
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          } 
        });

        if (!mounted) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }
        
        streamRef.current = stream;

        // 2. Initialize Audio Contexts
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        audioContextRef.current = new AudioContextClass({ sampleRate: 24000 });
        inputAudioContextRef.current = new AudioContextClass({ sampleRate: 16000 });

        // 3. Connect to Gemini Live API
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        const sessionPromise = ai.live.connect({
          model: 'gemini-2.5-flash-native-audio-preview-09-2025',
          config: {
            responseModalities: [Modality.AUDIO],
            systemInstruction: {
              parts: [{
                text: "You are CrashDoc AI, a calm and reassuring emergency assistance voice agent. Your goal is to guide the user through post-accident steps. First, ask if anyone is injured. If yes, tell them to call emergency services immediately. If not, guide them to move to safety, check for damage, and use the app to take photos. Keep your responses concise, clear, and empathetic. Speak with a calm, steady pace."
              }]
            },
            speechConfig: {
              voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
            },
          },
          callbacks: {
            onopen: async () => {
              if (!mounted) return;
              setStatus("connected");
              
              // Setup Audio Processing Graph using the already acquired stream
              if (inputAudioContextRef.current && streamRef.current) {
                try {
                  const source = inputAudioContextRef.current.createMediaStreamSource(streamRef.current);
                  const processor = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
                  
                  processor.onaudioprocess = (e) => {
                    const inputData = e.inputBuffer.getChannelData(0);
                    
                    // Visualizer update
                    let sum = 0;
                    for (let i = 0; i < inputData.length; i++) {
                      sum += inputData[i] * inputData[i];
                    }
                    const rms = Math.sqrt(sum / inputData.length);
                    setVolumeLevel(Math.min(rms * 10, 1)); 

                    // Create PCM blob
                    const pcmData = createPcmData(inputData);
                    const base64Data = btoa(
                      String.fromCharCode(...new Uint8Array(pcmData.buffer))
                    );

                    sessionPromise.then(session => {
                      session.sendRealtimeInput({
                        media: {
                          mimeType: "audio/pcm;rate=16000",
                          data: base64Data
                        }
                      });
                    });
                  };

                  source.connect(processor);
                  processor.connect(inputAudioContextRef.current.destination);
                  
                  sourceRef.current = source;
                  processorRef.current = processor;
                } catch (audioErr) {
                  console.error("Audio graph setup error:", audioErr);
                  setStatus("error");
                }
              }
            },
            onmessage: async (msg: LiveServerMessage) => {
              if (!mounted) return;

              // Handle Audio Output
              const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
              if (audioData && audioContextRef.current) {
                setIsSpeaking(true);
                
                const audioBytes = strToUint8Array(atob(audioData));
                const audioBuffer = await decodeAudioData(
                  audioBytes, 
                  audioContextRef.current, 
                  24000
                );

                const source = audioContextRef.current.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(audioContextRef.current.destination);
                
                const currentTime = audioContextRef.current.currentTime;
                const startTime = Math.max(currentTime, nextStartTimeRef.current);
                
                source.start(startTime);
                nextStartTimeRef.current = startTime + audioBuffer.duration;
                
                scheduledSourcesRef.current.push(source);
                
                source.onended = () => {
                  scheduledSourcesRef.current = scheduledSourcesRef.current.filter(s => s !== source);
                  if (scheduledSourcesRef.current.length === 0) {
                    setIsSpeaking(false);
                  }
                };
              }

              // Handle Interruption
              if (msg.serverContent?.interrupted) {
                scheduledSourcesRef.current.forEach(source => source.stop());
                scheduledSourcesRef.current = [];
                nextStartTimeRef.current = 0;
                setIsSpeaking(false);
              }
            },
            onclose: () => {
              if (mounted) console.log("Session closed");
            },
            onerror: (err) => {
              console.error("Live API Error:", err);
              if (mounted) setStatus("error");
            }
          }
        });
        
        sessionRef.current = sessionPromise;

      } catch (err: any) {
        console.error("Initialization Error:", err);
        if (mounted) {
          if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
            setStatus("permission_denied");
          } else {
            setStatus("error");
          }
        }
      }
    };

    initializeSession();

    return () => {
      mounted = false;
      
      // Cleanup Audio
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (processorRef.current) {
        processorRef.current.disconnect();
      }
      if (sourceRef.current) {
        sourceRef.current.disconnect();
      }
      if (inputAudioContextRef.current) {
        inputAudioContextRef.current.close();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      
      // Close Session
      if (sessionRef.current) {
        sessionRef.current.then((session: any) => session.close());
      }
    };
  }, []);

  // -- Helper Functions --

  const createPcmData = (inputData: Float32Array) => {
    const pcmData = new Int16Array(inputData.length);
    for (let i = 0; i < inputData.length; i++) {
      const s = Math.max(-1, Math.min(1, inputData[i]));
      pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }
    return pcmData;
  };

  const strToUint8Array = (str: string) => {
    const buf = new Uint8Array(str.length);
    for (let i = 0; i < str.length; i++) {
      buf[i] = str.charCodeAt(i);
    }
    return buf;
  };

  const decodeAudioData = (
    audioBytes: Uint8Array,
    ctx: AudioContext,
    sampleRate: number
  ): AudioBuffer => {
    const buffer = ctx.createBuffer(1, audioBytes.length / 2, sampleRate);
    const channelData = buffer.getChannelData(0);
    const dataView = new DataView(audioBytes.buffer);
    
    for (let i = 0; i < audioBytes.length / 2; i++) {
      const int16 = dataView.getInt16(i * 2, true); // Little-endian
      channelData[i] = int16 / 32768.0;
    }
    
    return buffer;
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center p-6">
      {/* Background Ambience */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[100px] transition-all duration-1000 ${
          status === 'connected' ? 'bg-blue-600/20' : 'bg-red-600/10'
        } ${isSpeaking ? 'scale-110 opacity-80' : 'scale-100 opacity-50'}`}></div>
      </div>

      <div className="relative z-10 w-full max-w-md flex flex-col items-center justify-between h-[80vh]">
        {/* Header */}
        <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-full border border-white/10 backdrop-blur-md">
          <div className={`w-2 h-2 rounded-full ${status === 'connected' ? 'bg-green-500 animate-pulse' : status === 'error' || status === 'permission_denied' ? 'bg-red-500' : 'bg-yellow-500'}`} />
          <span className="text-sm font-medium text-gray-200">
            {status === 'connected' ? 'Live Assistant Active' : 
             status === 'permission_denied' ? 'Microphone Access Denied' :
             status === 'error' ? 'Connection Error' :
             'Connecting Secure Line...'}
          </span>
        </div>

        {/* Central Visualizer / Status Display */}
        <div className="relative">
          {status === 'permission_denied' ? (
            <div className="flex flex-col items-center justify-center text-center p-6 bg-red-900/20 border border-red-500/30 rounded-2xl max-w-xs">
              <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Microphone Access Required</h3>
              <p className="text-sm text-gray-300">Please enable microphone permissions in your browser settings to use Live Help.</p>
            </div>
          ) : status === 'error' ? (
            <div className="flex flex-col items-center justify-center text-center p-6 bg-red-900/20 border border-red-500/30 rounded-2xl max-w-xs">
              <Activity className="w-12 h-12 text-red-500 mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Connection Failed</h3>
              <p className="text-sm text-gray-300">Unable to establish secure line. Please try again later.</p>
            </div>
          ) : (
            <>
              {/* Outer Rings */}
              <div className={`absolute inset-0 rounded-full border border-white/10 transition-all duration-300 ${isSpeaking ? 'scale-150 opacity-100' : 'scale-100 opacity-20'}`} />
              <div className={`absolute inset-0 rounded-full border border-white/5 transition-all duration-500 delay-75 ${isSpeaking ? 'scale-[1.8] opacity-100' : 'scale-100 opacity-10'}`} />
              
              {/* Core Circle */}
              <div className={`w-48 h-48 rounded-full flex items-center justify-center transition-all duration-200 ${
                isSpeaking 
                  ? 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-[0_0_50px_rgba(59,130,246,0.5)]' 
                  : 'bg-slate-800 border border-white/10'
              }`}>
                {status === 'connected' ? (
                  <div className="flex gap-1 items-center h-12">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className="w-2 bg-white rounded-full transition-all duration-100"
                        style={{
                          height: isSpeaking 
                            ? `${20 + Math.random() * 30}px` // AI Speaking
                            : `${10 + (volumeLevel * 100 * Math.random())}px` // User Speaking
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <Activity className="w-10 h-10 text-gray-500 animate-spin" />
                )}
              </div>
            </>
          )}
        </div>

        {/* Instructions / Captions */}
        <div className="text-center space-y-2">
          {status === 'permission_denied' ? (
             <p className="text-gray-400 text-sm max-w-xs">Return to dashboard or check settings.</p>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-white">
                {status === 'connected' ? (isSpeaking ? "CrashDoc is speaking..." : "Listening...") : ""}
              </h2>
              <p className="text-gray-400 text-sm max-w-xs">
                {status === 'connected' ? "Ask for guidance, safety checks, or help with documentation." : ""}
              </p>
            </>
          )}
        </div>

        {/* Controls */}
        <div className="flex gap-6 items-center">
          <button className="p-4 rounded-full bg-white/10 hover:bg-white/20 transition-colors border border-white/10" disabled={status !== 'connected'}>
            <Volume2 className={`w-6 h-6 text-white ${status !== 'connected' ? 'opacity-50' : ''}`} />
          </button>
          
          <button 
            onClick={onExit}
            className="w-20 h-20 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center shadow-lg shadow-red-500/30 transition-transform active:scale-95"
          >
            <PhoneOff className="w-8 h-8 text-white" />
          </button>

          <button className="p-4 rounded-full bg-white/10 hover:bg-white/20 transition-colors border border-white/10" disabled={status !== 'connected'}>
            <Shield className={`w-6 h-6 text-white ${status !== 'connected' ? 'opacity-50' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default LiveHelpMode;
