'use client';

/**
 * =========================================================================
 * ACCESSIBILITY CONTEXT & STATE ENGINE (BAHASA INDONESIA - STANDAR WCAG 2.1 AA)
 * =========================================================================
 * Pengelola status aksesibilitas global (Penyimpanan preferensi ke localStorage,
 * sinkronisasi instan kelas tema dan variabel CSS ke DOM, pembaca langsung screen reader,
 * serta integrasi Text-to-Speech Web Speech API).
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

export type ContrastTheme = 'default' | 'high-contrast-dark' | 'yellow-on-black' | 'soft-tint';
export type AccessibleFont = 'system' | 'dyslexic' | 'atkinson';

interface LiveAnnouncement {
  message: string;
  politeness: 'polite' | 'assertive';
  id: number;
}

interface AccessibilityContextType {
  // Tema & Kontras
  theme: ContrastTheme;
  setTheme: (theme: ContrastTheme) => void;
  // Tipografi
  font: AccessibleFont;
  setFont: (font: AccessibleFont) => void;
  fontScale: number;
  setFontScale: (scale: number) => void;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
  resetFontSize: () => void;
  // Spasi Baris & Huruf
  lineHeight: number;
  setLineHeight: (val: number) => void;
  letterSpacing: number;
  setLetterSpacing: (val: number) => void;
  // Bantuan Fokus Kognitif & Visual
  reduceMotion: boolean;
  setReduceMotion: (val: boolean) => void;
  readingRuler: boolean;
  setReadingRuler: (val: boolean) => void;
  // Pembaca Layar Langsung (Screen Reader Live Announcer)
  announcement: LiveAnnouncement | null;
  announce: (message: string, politeness?: 'polite' | 'assertive') => void;
  // Text-To-Speech (Web Speech API)
  isSpeaking: boolean;
  currentSpeakingText: string | null;
  speechRate: number;
  setSpeechRate: (rate: number) => void;
  speak: (text: string) => void;
  stopSpeaking: () => void;
  pauseSpeaking: () => void;
  resumeSpeaking: () => void;
  // Akomodasi Khusus (Waktu Tambahan)
  requiresExtendedTime: boolean;
  setRequiresExtendedTime: (val: boolean) => void;
  extendedTimeMultiplier: number;
  setExtendedTimeMultiplier: (val: number) => void;
  // Reset Pengaturan
  resetAllSettings: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

const STORAGE_KEY = 'accessilearn_a11y_prefs_id_v1';

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ContrastTheme>('default');
  const [font, setFontState] = useState<AccessibleFont>('system');
  const [fontScale, setFontScaleState] = useState<number>(1.0);
  const [lineHeight, setLineHeightState] = useState<number>(1.6);
  const [letterSpacing, setLetterSpacingState] = useState<number>(0.01);
  const [reduceMotion, setReduceMotionState] = useState<boolean>(false);
  const [readingRuler, setReadingRulerState] = useState<boolean>(false);

  // Live announcer
  const [announcement, setAnnouncement] = useState<LiveAnnouncement | null>(null);

  // Text-to-speech
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [currentSpeakingText, setCurrentSpeakingText] = useState<string | null>(null);
  const [speechRate, setSpeechRateState] = useState<number>(1.0);

  // Akomodasi
  const [requiresExtendedTime, setRequiresExtendedTimeState] = useState<boolean>(false);
  const [extendedTimeMultiplier, setExtendedTimeMultiplierState] = useState<number>(1.5);

  const [isMounted, setIsMounted] = useState<boolean>(false);

  // Pengumuman dinamis ke screen reader melalui aria-live
  const announce = useCallback((message: string, politeness: 'polite' | 'assertive' = 'polite') => {
    setAnnouncement({
      message,
      politeness,
      id: Date.now(),
    });
  }, []);

  // Mesin Text-To-Speech menggunakan Web Speech API Bahasa Indonesia
  const speak = useCallback(
    (text: string) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        announce('Fitur Text-to-speech tidak didukung pada browser ini.', 'assertive');
        return;
      }

      window.speechSynthesis.cancel();
      const cleanText = text.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();
      if (!cleanText) return;

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'id-ID';
      utterance.rate = speechRate;
      utterance.pitch = 1.0;

      utterance.onstart = () => {
        setIsSpeaking(true);
        setCurrentSpeakingText(cleanText);
        announce('Membacakan teks materi.', 'polite');
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        setCurrentSpeakingText(null);
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
        setCurrentSpeakingText(null);
      };

      window.speechSynthesis.speak(utterance);
    },
    [speechRate, announce]
  );

  const stopSpeaking = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setCurrentSpeakingText(null);
      announce('Pembacaan suara dihentikan.', 'polite');
    }
  }, [announce]);

  const pauseSpeaking = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.pause();
      setIsSpeaking(false);
    }
  }, []);

  const resumeSpeaking = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.resume();
      setIsSpeaking(true);
    }
  }, []);

  // Membaca preferensi dari localStorage saat pertama kali dimuat
  useEffect(() => {
    setIsMounted(true);
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.theme) setThemeState(parsed.theme);
        if (parsed.font) setFontState(parsed.font);
        if (parsed.fontScale) setFontScaleState(parsed.fontScale);
        if (parsed.lineHeight) setLineHeightState(parsed.lineHeight);
        if (parsed.letterSpacing) setLetterSpacingState(parsed.letterSpacing);
        if (parsed.reduceMotion !== undefined) setReduceMotionState(parsed.reduceMotion);
        if (parsed.readingRuler !== undefined) setReadingRulerState(parsed.readingRuler);
        if (parsed.speechRate) setSpeechRateState(parsed.speechRate);
        if (parsed.requiresExtendedTime !== undefined)
          setRequiresExtendedTimeState(parsed.requiresExtendedTime);
        if (parsed.extendedTimeMultiplier)
          setExtendedTimeMultiplierState(parsed.extendedTimeMultiplier);
      }
    } catch (e) {
      console.warn('Gagal membaca preferensi aksesibilitas dari localStorage', e);
    }
  }, []);

  // Sinkronisasi kelas DOM dan variabel CSS saat preferensi berubah
  useEffect(() => {
    if (!isMounted) return;

    const html = document.documentElement;
    const body = document.body;

    // Terapkan kelas tema
    html.classList.remove('theme-high-contrast-dark', 'theme-yellow-on-black', 'theme-soft-tint');
    if (theme !== 'default') {
      html.classList.add(`theme-${theme}`);
    }

    // Terapkan kelas huruf
    body.classList.remove('font-dyslexic', 'font-atkinson');
    if (font === 'dyslexic') {
      body.classList.add('font-dyslexic');
    } else if (font === 'atkinson') {
      body.classList.add('font-atkinson');
    }

    // Terapkan kelas gerak
    if (reduceMotion) {
      html.classList.add('reduce-motion');
    } else {
      html.classList.remove('reduce-motion');
    }

    // Terapkan variabel CSS
    html.style.setProperty('--content-scale', String(fontScale));
    html.style.setProperty('--line-height-scale', String(lineHeight));
    html.style.setProperty('--letter-spacing-scale', `${letterSpacing}em`);

    // Simpan ke localStorage
    try {
      const stateToSave = {
        theme,
        font,
        fontScale,
        lineHeight,
        letterSpacing,
        reduceMotion,
        readingRuler,
        speechRate,
        requiresExtendedTime,
        extendedTimeMultiplier,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (e) {
      console.warn('Gagal menyimpan preferensi aksesibilitas ke localStorage', e);
    }
  }, [
    theme,
    font,
    fontScale,
    lineHeight,
    letterSpacing,
    reduceMotion,
    readingRuler,
    speechRate,
    requiresExtendedTime,
    extendedTimeMultiplier,
    isMounted,
  ]);

  const setTheme = (newTheme: ContrastTheme) => {
    setThemeState(newTheme);
    const names = {
      default: 'Kontras Standar Modern',
      'high-contrast-dark': 'Kontras Tinggi Mode Gelap',
      'yellow-on-black': 'Kuning di atas Hitam (Khusus Gangguan Penglihatan / Low Vision)',
      'soft-tint': 'Lembut Krem (Mencegah Silau & Disleksia)',
    };
    announce(`Tema diubah ke ${names[newTheme]}`, 'polite');
  };

  const setFont = (newFont: AccessibleFont) => {
    setFontState(newFont);
    const fontNames = {
      system: 'Huruf Standar (Inter)',
      dyslexic: 'Huruf Ramah Disleksia (OpenDyslexic / Lexend)',
      atkinson: 'Huruf Atkinson (Keterbacaan Tinggi)',
    };
    announce(`Gaya huruf diubah ke ${fontNames[newFont]}`, 'polite');
  };

  const setFontScale = (scale: number) => {
    const clamped = Math.max(0.9, Math.min(2.0, Number(scale.toFixed(2))));
    setFontScaleState(clamped);
    announce(`Ukuran teks diatur ke ${Math.round(clamped * 100)} persen`, 'polite');
  };

  const increaseFontSize = () => {
    setFontScaleState((prev) => {
      const next = Math.min(2.0, +(prev + 0.15).toFixed(2));
      announce(`Ukuran teks diperbesar menjadi ${Math.round(next * 100)} persen`, 'polite');
      return next;
    });
  };

  const decreaseFontSize = () => {
    setFontScaleState((prev) => {
      const next = Math.max(0.9, +(prev - 0.15).toFixed(2));
      announce(`Ukuran teks diperkecil menjadi ${Math.round(next * 100)} persen`, 'polite');
      return next;
    });
  };

  const resetFontSize = () => {
    setFontScaleState(1.0);
    announce('Ukuran teks dikembalikan ke ukuran normal 100 persen', 'polite');
  };

  const setLineHeight = (val: number) => {
    setLineHeightState(val);
    announce(`Jarak antar-baris diatur ke ${val}x`, 'polite');
  };

  const setLetterSpacing = (val: number) => {
    setLetterSpacingState(val);
    announce(`Jarak antar-huruf diperbarui`, 'polite');
  };

  const setReduceMotion = (val: boolean) => {
    setReduceMotionState(val);
    announce(val ? 'Pengurangan animasi diaktifkan' : 'Animasi normal diaktifkan kembali', 'polite');
  };

  const setReadingRuler = (val: boolean) => {
    setReadingRulerState(val);
    announce(val ? 'Penggaris fokus membaca diaktifkan' : 'Penggaris fokus membaca dinonaktifkan', 'polite');
  };

  const setSpeechRate = (rate: number) => {
    setSpeechRateState(rate);
    announce(`Kecepatan pembacaan suara diatur ke ${rate}x`, 'polite');
  };

  const setRequiresExtendedTime = (val: boolean) => {
    setRequiresExtendedTimeState(val);
    announce(
      val
        ? `Akomodasi ujian aktif: Waktu tambahan ${extendedTimeMultiplier}x akan diterapkan.`
        : 'Batas waktu ujian standar dipulihkan.',
      'polite'
    );
  };

  const setExtendedTimeMultiplier = (multiplier: number) => {
    setExtendedTimeMultiplierState(multiplier);
    announce(`Pengali waktu tambahan ujian diatur ke ${multiplier}x.`, 'polite');
  };

  const resetAllSettings = () => {
    setThemeState('default');
    setFontState('system');
    setFontScaleState(1.0);
    setLineHeightState(1.6);
    setLetterSpacingState(0.01);
    setReduceMotionState(false);
    setReadingRulerState(false);
    setSpeechRateState(1.0);
    setRequiresExtendedTimeState(false);
    setExtendedTimeMultiplierState(1.5);
    stopSpeaking();
    announce('Semua pengaturan aksesibilitas telah dikembalikan ke standar awal.', 'polite');
  };

  return (
    <AccessibilityContext.Provider
      value={{
        theme,
        setTheme,
        font,
        setFont,
        fontScale,
        setFontScale,
        increaseFontSize,
        decreaseFontSize,
        resetFontSize,
        lineHeight,
        setLineHeight,
        letterSpacing,
        setLetterSpacing,
        reduceMotion,
        setReduceMotion,
        readingRuler,
        setReadingRuler,
        announcement,
        announce,
        isSpeaking,
        currentSpeakingText,
        speechRate,
        setSpeechRate,
        speak,
        stopSpeaking,
        pauseSpeaking,
        resumeSpeaking,
        requiresExtendedTime,
        setRequiresExtendedTime,
        extendedTimeMultiplier,
        setExtendedTimeMultiplier,
        resetAllSettings,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
}
