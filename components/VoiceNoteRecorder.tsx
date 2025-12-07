import React, { useState } from "react";
import GlassCard from "./GlassCard";
import { Mic, Square, Play, Trash2, Check } from "lucide-react";

interface VoiceNoteRecorderProps {
  onRecordingComplete: (audioBlob: Blob, duration: number) => void;
}

const VoiceNoteRecorder: React.FC<VoiceNoteRecorderProps> = ({
  onRecordingComplete,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const [audioURL, setAudioURL] = useState<string>("");
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setAudioURL(url);
        onRecordingComplete(blob, recordingTime);
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setRecordingTime(0);

      const interval = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
      setTimer(interval);

      if (navigator.vibrate) navigator.vibrate(50);
    } catch (err) {
      console.error("Microphone access denied:", err);
      alert("Microphone access is required for voice notes");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      if (timer) clearInterval(timer);
      if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
    }
  };

  const deleteRecording = () => {
    setAudioURL("");
    setRecordingTime(0);
    if (navigator.vibrate) navigator.vibrate(100);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <GlassCard className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-pink-500/20 rounded-lg">
          <Mic className="w-4 h-4 text-pink-400" />
        </div>
        <h3 className="text-gray-400 text-sm uppercase tracking-wider">
          Voice Note
        </h3>
      </div>

      <div className="flex flex-col items-center gap-4">
        {!audioURL ? (
          <>
            <div className="text-4xl font-bold text-white">
              {formatTime(recordingTime)}
            </div>

            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
                isRecording
                  ? "bg-red-500 hover:bg-red-600 animate-pulse"
                  : "bg-gradient-to-br from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
              } shadow-lg`}
            >
              {isRecording ? (
                <Square className="w-8 h-8 text-white" />
              ) : (
                <Mic className="w-8 h-8 text-white" />
              )}
            </button>

            <p className="text-xs text-gray-400">
              {isRecording
                ? "Recording... Tap to stop"
                : "Tap to record accident description"}
            </p>
          </>
        ) : (
          <>
            <div className="flex items-center gap-4 w-full">
              <audio src={audioURL} controls className="flex-1" />
              <button
                onClick={deleteRecording}
                className="p-3 rounded-full bg-red-500/20 hover:bg-red-500/30 transition-colors"
              >
                <Trash2 className="w-5 h-5 text-red-400" />
              </button>
            </div>
            <div className="flex items-center gap-2 text-sm text-green-400">
              <Check className="w-4 h-4" />
              <span>Voice note saved ({formatTime(recordingTime)})</span>
            </div>
          </>
        )}
      </div>
    </GlassCard>
  );
};

export default VoiceNoteRecorder;
