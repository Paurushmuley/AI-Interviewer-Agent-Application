'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Camera, CameraOff, Mic, MicOff, User, AlertCircle } from 'lucide-react';

interface CandidateCamProps {
  candidateName?: string;
  isRecording?: boolean;
}

export const CandidateCam: React.FC<CandidateCamProps> = ({
  candidateName = 'You (Candidate)',
  isRecording = false,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(true);
  const [micActive, setMicActive] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Initialize camera stream
  useEffect(() => {
    let active = true;

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
          audio: true,
        });

        if (!active) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setErrorMsg(null);
      } catch (err: any) {
        console.warn('WebCam access denied or not available:', err);
        setErrorMsg('Camera access unavailable. Using virtual candidate presence.');
      }
    }

    startCamera();

    return () => {
      active = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  const toggleCamera = () => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setCameraActive(videoTrack.enabled);
      }
    }
  };

  const toggleMic = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setMicActive(audioTrack.enabled);
      }
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center w-full h-full min-h-[340px] bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
      {/* Video Feed */}
      {cameraActive && !errorMsg ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover transform -scale-x-100"
        />
      ) : (
        <div className="flex flex-col items-center justify-center text-slate-500 gap-3 my-auto">
          <div className="w-24 h-24 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
            <User className="w-12 h-12 text-slate-400" />
          </div>
          {errorMsg ? (
            <p className="text-xs text-amber-400/90 max-w-xs text-center px-4 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {errorMsg}
            </p>
          ) : (
            <p className="text-xs text-slate-400">Camera preview is off</p>
          )}
        </div>
      )}

      {/* Top Recording / Status Indicator */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-slate-700/60 text-xs font-medium text-slate-200">
        <span
          className={`w-2.5 h-2.5 rounded-full ${
            isRecording ? 'bg-red-500 animate-ping' : 'bg-slate-400'
          }`}
        />
        <span>{isRecording ? 'Live Answering' : 'Candidate Feed'}</span>
      </div>

      {/* Bottom Controls Bar */}
      <div className="absolute bottom-4 inset-x-4 z-10 flex items-center justify-between px-4 py-2 rounded-xl bg-black/70 backdrop-blur-md border border-slate-800">
        <span className="text-xs font-medium text-slate-200 truncate">{candidateName}</span>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleMic}
            type="button"
            className={`p-2 rounded-lg transition-colors ${
              micActive ? 'bg-slate-800 text-slate-200 hover:bg-slate-700' : 'bg-red-500/80 text-white'
            }`}
            title={micActive ? 'Mute microphone' : 'Unmute microphone'}
          >
            {micActive ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
          </button>

          <button
            onClick={toggleCamera}
            type="button"
            className={`p-2 rounded-lg transition-colors ${
              cameraActive ? 'bg-slate-800 text-slate-200 hover:bg-slate-700' : 'bg-red-500/80 text-white'
            }`}
            title={cameraActive ? 'Turn off camera' : 'Turn on camera'}
          >
            {cameraActive ? <Camera className="w-4 h-4" /> : <CameraOff className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};
