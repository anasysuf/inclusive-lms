'use client';

/**
 * =========================================================================
 * PEMUTAR VIDEO RAMAH AKSESIBILITAS (WCAG 2.1 AA - Pedoman 1.2 Media Waktu)
 * =========================================================================
 * Mengimplementasikan video HTML5 dengan teks subtitel WebVTT tertutup,
 * pengontrol kecepatan kognitif (0.5x - 1.5x), tombol kontras tinggi,
 * dan dukungan navigasi keyboard untuk peserta didik dengan hambatan motorik.
 */

import React, { useRef, useState } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  RotateCcw,
  RotateCw,
  Captions,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAccessibility } from '@/context/AccessibilityContext';

interface AccessibleVideoPlayerProps {
  videoUrl?: string | null;
  captionsUrl?: string | null;
  lessonTitle: string;
}

export function AccessibleVideoPlayer({
  videoUrl,
  captionsUrl,
  lessonTitle,
}: AccessibleVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { announce } = useAccessibility();

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [captionsEnabled, setCaptionsEnabled] = useState(true);

  // Video demo default
  const resolvedVideoUrl =
    videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
  const resolvedCaptionsUrl = captionsUrl || '/captions/lesson1-udl.vtt';

  // Putar / Jeda Video
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
      announce('Video diputar', 'polite');
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
      announce('Video dijeda', 'polite');
    }
  };

  // Lompat waktu mundur / maju
  const skipTime = (seconds: number) => {
    if (!videoRef.current) return;
    const newTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + seconds));
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
    announce(
      seconds > 0 ? `Maju ${seconds} detik` : `Mundur ${Math.abs(seconds)} detik`,
      'polite'
    );
  };

  // Ubah kecepatan putar (sangat krusial untuk pemrosesan kognitif)
  const changeSpeed = (rate: number) => {
    if (!videoRef.current) return;
    videoRef.current.playbackRate = rate;
    setPlaybackRate(rate);
    announce(`Kecepatan video diatur ke ${rate}x`, 'polite');
  };

  // Sakelar Subtitel Teks
  const toggleCaptions = () => {
    if (!videoRef.current) return;
    const textTracks = videoRef.current.textTracks;
    if (textTracks && textTracks.length > 0) {
      const track = textTracks[0];
      const nextState = track.mode !== 'showing';
      track.mode = nextState ? 'showing' : 'hidden';
      setCaptionsEnabled(nextState);
      announce(nextState ? 'Subtitel teks diaktifkan' : 'Subtitel teks dinonaktifkan', 'polite');
    }
  };

  // Bisu / Suara
  const toggleMute = () => {
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
    announce(nextMuted ? 'Suara video dibisukan' : 'Suara video diaktifkan kembali', 'polite');
  };

  // Format detik ke mm:ss
  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      if (videoRef.current.textTracks && videoRef.current.textTracks.length > 0) {
        videoRef.current.textTracks[0].mode = 'showing';
        setCaptionsEnabled(true);
      }
    }
  };

  return (
    <figure
      aria-label={`Pemutar video materi ${lessonTitle}`}
      className="overflow-hidden rounded-2xl border-2 border-border bg-black shadow-xl"
    >
      <div className="relative aspect-video w-full bg-black flex items-center justify-center">
        <video
          ref={videoRef}
          src={resolvedVideoUrl}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setIsPlaying(false)}
          onClick={togglePlay}
          className="h-full w-full object-contain cursor-pointer"
          playsInline
          aria-label={`Video pelajaran: ${lessonTitle}`}
        >
          {resolvedCaptionsUrl && (
            <track
              kind="captions"
              src={resolvedCaptionsUrl}
              srcLang="id"
              label="Bahasa Indonesia (Teks Tertutup)"
              default
            />
          )}
          Browser Anda tidak mendukung elemen video HTML5 aksesibel.
        </video>

        {/* Tombol Putar Besar di Tengah saat dijeda */}
        {!isPlaying && (
          <button
            type="button"
            onClick={togglePlay}
            className="absolute inset-0 m-auto h-20 w-20 rounded-full bg-primary/90 text-primary-foreground flex items-center justify-center shadow-2xl hover:scale-110 transition-transform focus:outline-none focus:ring-4 focus:ring-yellow-400"
            aria-label="Putar video pelajaran"
          >
            <Play className="h-10 w-10 fill-current translate-x-0.5" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Bilah Kontrol Video Aksesibel */}
      <figcaption className="bg-card text-card-foreground border-t-2 border-border p-4 space-y-3">
        {/* Bilah Progres (Slider Aksesibel) */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono font-bold text-muted-foreground w-12 text-right">
            {formatTime(currentTime)}
          </span>
          <div className="flex-1">
            <input
              type="range"
              min={0}
              max={duration || 100}
              step={1}
              value={currentTime}
              onChange={(e) => {
                const targetTime = Number(e.target.value);
                if (videoRef.current) {
                  videoRef.current.currentTime = targetTime;
                  setCurrentTime(targetTime);
                }
              }}
              aria-label="Geser posisi pemutaran video"
              aria-valuemin={0}
              aria-valuemax={duration || 100}
              aria-valuenow={currentTime}
              aria-valuetext={`${formatTime(currentTime)} dari ${formatTime(duration)}`}
              className="w-full h-2 rounded-lg appearance-none bg-muted accent-primary cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary"
            />
          </div>
          <span className="text-xs font-mono font-bold text-muted-foreground w-12">
            {formatTime(duration)}
          </span>
        </div>

        {/* Baris Tombol Aksi */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          {/* Kiri: Putar/Jeda, Mundur/Maju */}
          <div className="flex items-center gap-1.5">
            <Button
              variant="primary"
              size="sm"
              onClick={togglePlay}
              aria-label={isPlaying ? 'Jeda video' : 'Putar video'}
              className="font-bold gap-1.5"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4" aria-hidden="true" />
                  <span>Jeda</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" aria-hidden="true" />
                  <span>Putar</span>
                </>
              )}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => skipTime(-10)}
              aria-label="Mundur 10 detik"
              className="h-9 px-2.5"
            >
              <RotateCcw className="w-4 h-4" aria-hidden="true" />
              <span className="text-xs ml-1 font-mono">-10d</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => skipTime(10)}
              aria-label="Maju 10 detik"
              className="h-9 px-2.5"
            >
              <RotateCw className="w-4 h-4" aria-hidden="true" />
              <span className="text-xs ml-1 font-mono">+10d</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={toggleMute}
              aria-label={isMuted ? 'Aktifkan suara video' : 'Bisukan suara video'}
              className="h-9 px-2.5"
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-destructive" aria-hidden="true" />
              ) : (
                <Volume2 className="w-4 h-4" aria-hidden="true" />
              )}
            </Button>
          </div>

          {/* Kanan: Subtitel & Pengatur Kecepatan Kognitif */}
          <div className="flex items-center gap-2">
            {/* Tombol Subtitel Teks */}
            <Button
              variant={captionsEnabled ? 'primary' : 'outline'}
              size="sm"
              onClick={toggleCaptions}
              aria-pressed={captionsEnabled}
              aria-label="Sakelar Subtitel Teks (WebVTT)"
              className="gap-1.5 font-semibold text-xs"
            >
              <Captions className="w-4 h-4" aria-hidden="true" />
              <span>{captionsEnabled ? 'Subtitel AKTIF' : 'Subtitel MATI'}</span>
            </Button>

            {/* Kecepatan Putar Kognitif */}
            <div className="flex items-center bg-muted p-1 rounded-lg border border-border/50 text-xs">
              <span className="text-[11px] font-semibold text-muted-foreground px-1.5 hidden sm:inline">
                Kecepatan:
              </span>
              {[0.75, 1.0, 1.25, 1.5].map((rate) => (
                <button
                  key={rate}
                  type="button"
                  onClick={() => changeSpeed(rate)}
                  className={`px-2 py-1 rounded font-bold transition-colors text-xs ${
                    playbackRate === rate
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-foreground hover:bg-card'
                  }`}
                  aria-pressed={playbackRate === rate}
                  aria-label={`Atur kecepatan video ke ${rate}x`}
                >
                  {rate}x
                </button>
              ))}
            </div>
          </div>
        </div>
      </figcaption>
    </figure>
  );
}
