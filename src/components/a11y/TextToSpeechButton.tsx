'use client';

/**
 * =========================================================================
 * TOMBOL BACA SUARA / TEXT-TO-SPEECH (Integrasi Web Speech API)
 * =========================================================================
 * Membantu peserta didik dengan disleksia, hambatan penglihatan, atau
 * gaya belajar auditori untuk mendengarkan teks materi secara langsung.
 */

import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { useAccessibility } from '@/context/AccessibilityContext';
import { Button } from '@/components/ui/button';

interface TextToSpeechButtonProps {
  text: string;
  label?: string;
  size?: 'sm' | 'md' | 'lg' | 'icon';
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  className?: string;
}

export function TextToSpeechButton({
  text,
  label = 'Bacakan Teks',
  size = 'sm',
  variant = 'outline',
  className = '',
}: TextToSpeechButtonProps) {
  const { isSpeaking, currentSpeakingText, speak, stopSpeaking } = useAccessibility();

  const isCurrentTarget = isSpeaking && currentSpeakingText === text.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();

  const handleToggle = () => {
    if (isCurrentTarget) {
      stopSpeaking();
    } else {
      speak(text);
    }
  };

  return (
    <Button
      variant={isCurrentTarget ? 'primary' : variant}
      size={size}
      onClick={handleToggle}
      className={`gap-2 ${className}`}
      aria-label={isCurrentTarget ? 'Hentikan pembacaan teks' : `${label}: ${text.slice(0, 40)}...`}
      aria-pressed={isCurrentTarget}
    >
      {isCurrentTarget ? (
        <>
          <VolumeX className="w-4 h-4 animate-pulse text-current" aria-hidden="true" />
          {size !== 'icon' && <span>Hentikan Suara</span>}
        </>
      ) : (
        <>
          <Volume2 className="w-4 h-4 text-current" aria-hidden="true" />
          {size !== 'icon' && <span>{label}</span>}
        </>
      )}
    </Button>
  );
}
