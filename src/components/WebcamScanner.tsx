import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Camera, CameraOff, RefreshCw, CheckCircle2, AlertTriangle, ShieldCheck, Sun, Eye, UserCheck } from 'lucide-react';
import { FaceAnalyzer } from '../utils/faceEngine';
import { FaceDetectionFrame } from '../types';

interface WebcamScannerProps {
  onCaptureFace?: (embedding: number[], snapshot: string, frame: FaceDetectionFrame) => void;
  onAuthenticateFace?: (embedding: number[], livenessPassed: boolean) => Promise<void>;
  mode?: 'register' | 'login' | 'verify';
  livenessType?: 'blink' | 'movement' | 'steady';
}

export const WebcamScanner: React.FC<WebcamScannerProps> = ({
  onCaptureFace,
  onAuthenticateFace,
  mode = 'login',
  livenessType = 'blink',
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const [isCameraOn, setIsCameraOn] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [currentFrame, setCurrentFrame] = useState<FaceDetectionFrame | null>(null);
  const [capturedSnapshot, setCapturedSnapshot] = useState<string | null>(null);
  const [capturedEmbedding, setCapturedEmbedding] = useState<number[] | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [authStatusMessage, setAuthStatusMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  const analyzerRef = useRef<FaceAnalyzer>(new FaceAnalyzer());
  const animFrameId = useRef<number | null>(null);

  // Start Camera Stream
  const startCamera = async () => {
    setCameraError(null);
    setAuthStatusMessage(null);
    analyzerRef.current.resetLiveness();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setIsCameraOn(true);
        };
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Camera permission denied. Please allow webcam access in browser settings.');
      } else if (err.name === 'NotFoundError') {
        setCameraError('No webcam device detected on your system.');
      } else {
        setCameraError('Unable to access camera: ' + (err.message || 'Unknown error'));
      }
      setIsCameraOn(false);
    }
  };

  // Stop Camera Stream
  const stopCamera = useCallback(() => {
    if (animFrameId.current) {
      cancelAnimationFrame(animFrameId.current);
      animFrameId.current = null;
    }

    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraOn(false);
  }, []);

  // Frame Processing Loop
  const processFrameLoop = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !overlayCanvasRef.current) return;

    const frame = analyzerRef.current.analyzeFrame(
      videoRef.current,
      canvasRef.current,
      livenessType
    );

    setCurrentFrame(frame);

    // Draw HUD overlays
    const overlayCtx = overlayCanvasRef.current.getContext('2d');
    if (overlayCtx && videoRef.current.videoWidth > 0) {
      overlayCanvasRef.current.width = videoRef.current.videoWidth;
      overlayCanvasRef.current.height = videoRef.current.videoHeight;
      analyzerRef.current.drawOverlay(
        overlayCtx,
        frame,
        overlayCanvasRef.current.width,
        overlayCanvasRef.current.height
      );
    }

    animFrameId.current = requestAnimationFrame(processFrameLoop);
  }, [livenessType]);

  useEffect(() => {
    if (isCameraOn) {
      animFrameId.current = requestAnimationFrame(processFrameLoop);
    }
    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [isCameraOn, processFrameLoop]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // Capture Action
  const handleCapture = () => {
    if (!currentFrame || !currentFrame.faceDetected || !currentFrame.embedding || !currentFrame.snapshot) {
      setAuthStatusMessage({
        text: 'Cannot capture: Position your face clearly in frame first.',
        type: 'error',
      });
      return;
    }

    if (currentFrame.multipleFaces) {
      setAuthStatusMessage({
        text: 'Multiple faces detected! Please ensure only one person is in camera view.',
        type: 'error',
      });
      return;
    }

    setCapturedSnapshot(currentFrame.snapshot);
    setCapturedEmbedding(currentFrame.embedding);

    if (onCaptureFace) {
      onCaptureFace(currentFrame.embedding, currentFrame.snapshot, currentFrame);
    }

    setAuthStatusMessage({
      text: 'Facial landmarks & 128-D vector encoding extracted successfully!',
      type: 'success',
    });
  };

  // Authenticate Action
  const handleAuthenticate = async () => {
    if (!currentFrame || !currentFrame.faceDetected || !currentFrame.embedding) {
      setAuthStatusMessage({
        text: 'No face detected in camera feed.',
        type: 'error',
      });
      return;
    }

    if (currentFrame.multipleFaces) {
      setAuthStatusMessage({
        text: 'Multiple faces detected in frame.',
        type: 'error',
      });
      return;
    }

    if (currentFrame.livenessState.progress < 100) {
      setAuthStatusMessage({
        text: `Liveness check incomplete. ${currentFrame.livenessState.prompt}`,
        type: 'info',
      });
      return;
    }

    setIsProcessing(true);
    setAuthStatusMessage(null);

    try {
      if (onAuthenticateFace) {
        await onAuthenticateFace(currentFrame.embedding, true);
      }
    } catch (err: any) {
      setAuthStatusMessage({
        text: err.message || 'Authentication request failed',
        type: 'error',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center">
      
      {/* Video Viewport Container */}
      <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-slate-950 border-2 border-slate-800 shadow-2xl flex items-center justify-center group">
        
        {/* Hidden Raw Canvas for pixel processing */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Video Element */}
        <video
          ref={videoRef}
          playsInline
          muted
          className={`w-full h-full object-cover transform -scale-x-100 transition-opacity duration-300 ${
            isCameraOn ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Overlay Canvas for futuristic Bounding Box & HUD */}
        <canvas
          ref={overlayCanvasRef}
          className={`absolute inset-0 w-full h-full pointer-events-none transform -scale-x-100 transition-opacity duration-300 ${
            isCameraOn ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Off/Initial Viewport State */}
        {!isCameraOn && !capturedSnapshot && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-slate-900/90 text-slate-300">
            <div className="w-16 h-16 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center mb-4 shadow-lg shadow-blue-500/10">
              <Camera className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Webcam Feed Offline</h3>
            <p className="text-xs text-slate-400 max-w-xs mb-6">
              Click Start Camera to initialize real-time AI face detection and biometric scanning.
            </p>
            <button
              onClick={startCamera}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-lg shadow-blue-600/30 flex items-center gap-2 transition-all hover:scale-105"
            >
              <Camera className="w-4 h-4" />
              Start Camera
            </button>
          </div>
        )}

        {/* Captured Snapshot Mode (for Register preview) */}
        {!isCameraOn && capturedSnapshot && (
          <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center p-4">
            <img
              src={capturedSnapshot}
              alt="Captured Face"
              className="w-44 h-44 rounded-2xl border-2 border-emerald-500 object-cover shadow-2xl mb-3"
            />
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold mb-4 bg-emerald-950/60 border border-emerald-800/60 px-3 py-1 rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Face Capture & Vector Embeddings Ready
            </div>
            <button
              onClick={() => {
                setCapturedSnapshot(null);
                setCapturedEmbedding(null);
                startCamera();
              }}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Retake Photo
            </button>
          </div>
        )}

        {/* Live HUD Warnings & Quality Badges */}
        {isCameraOn && currentFrame && (
          <div className="absolute top-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
            
            {/* Detection Status Badge */}
            <div
              className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 backdrop-blur-md shadow-md ${
                !currentFrame.faceDetected
                  ? 'bg-rose-950/80 text-rose-300 border border-rose-800'
                  : currentFrame.multipleFaces
                  ? 'bg-amber-950/80 text-amber-300 border border-amber-800'
                  : 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
              }`}
            >
              <span className="w-2 h-2 rounded-full animate-ping bg-current" />
              {!currentFrame.faceDetected
                ? 'No Face Detected'
                : currentFrame.multipleFaces
                ? 'Multiple Faces'
                : 'Face Detected'}
            </div>

            {/* Lighting Indicator */}
            <div
              className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 backdrop-blur-md ${
                currentFrame.lightLevel === 'low'
                  ? 'bg-amber-900/80 text-amber-200 border border-amber-700'
                  : currentFrame.lightLevel === 'overexposed'
                  ? 'bg-rose-900/80 text-rose-200 border border-rose-700'
                  : 'bg-slate-900/70 text-slate-300 border border-slate-700'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              {currentFrame.lightLevel === 'low'
                ? 'Low Light'
                : currentFrame.lightLevel === 'overexposed'
                ? 'Overexposed'
                : 'Light Good'}
            </div>
          </div>
        )}

        {/* Bottom Liveness & Distance Prompt Overlay */}
        {isCameraOn && currentFrame && (
          <div className="absolute bottom-3 left-3 right-3 p-3 rounded-xl bg-slate-900/85 border border-slate-800/80 backdrop-blur-md text-white text-xs flex flex-col gap-2 shadow-xl">
            <div className="flex items-center justify-between font-semibold">
              <span className="flex items-center gap-1.5 text-cyan-300">
                <Eye className="w-3.5 h-3.5 text-cyan-400" />
                {currentFrame.livenessState.prompt}
              </span>
              <span className="text-slate-400 font-mono text-[11px]">
                {Math.round(currentFrame.livenessState.progress)}% Verified
              </span>
            </div>

            {/* Liveness Progress Bar */}
            <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  currentFrame.livenessState.progress === 100
                    ? 'bg-emerald-400'
                    : 'bg-gradient-to-r from-blue-500 to-cyan-400'
                }`}
                style={{ width: `${currentFrame.livenessState.progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Camera Permission or Setup Error */}
      {cameraError && (
        <div className="w-full mt-3 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-medium flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{cameraError}</span>
        </div>
      )}

      {/* Authentication / Status Feedback Banner */}
      {authStatusMessage && (
        <div
          className={`w-full mt-3 p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 border transition-all ${
            authStatusMessage.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
              : authStatusMessage.type === 'error'
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
              : 'bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400'
          }`}
        >
          {authStatusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
          ) : authStatusMessage.type === 'error' ? (
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
          ) : (
            <ShieldCheck className="w-4 h-4 shrink-0 text-blue-500" />
          )}
          <span>{authStatusMessage.text}</span>
        </div>
      )}

      {/* Control Buttons */}
      <div className="w-full flex items-center justify-center gap-3 mt-4">
        {!isCameraOn ? (
          <button
            onClick={startCamera}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-2 shadow-md transition-all"
          >
            <Camera className="w-4 h-4" />
            Start Camera
          </button>
        ) : (
          <button
            onClick={stopCamera}
            className="px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center gap-1.5 transition-colors"
          >
            <CameraOff className="w-4 h-4" />
            Close Camera
          </button>
        )}

        {isCameraOn && mode === 'register' && (
          <button
            onClick={handleCapture}
            disabled={!currentFrame?.faceDetected || currentFrame?.multipleFaces}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-xs flex items-center gap-2 shadow-md transition-all"
          >
            <UserCheck className="w-4 h-4" />
            Capture Face Encoding
          </button>
        )}

        {isCameraOn && (mode === 'login' || mode === 'verify') && (
          <button
            onClick={handleAuthenticate}
            disabled={
              isProcessing ||
              !currentFrame?.faceDetected ||
              currentFrame?.multipleFaces ||
              (currentFrame?.livenessState.progress || 0) < 100
            }
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 disabled:opacity-50 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Comparing Vector Embeddings...
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                Authenticate Face
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
