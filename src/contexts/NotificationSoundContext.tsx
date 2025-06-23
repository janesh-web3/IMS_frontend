import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

export type SoundType = 'default' | 'message' | 'alert' | 'success' | 'error';

interface SoundSettings {
  enabled: boolean;
  volume: number;
}

type SoundSettingsMap = Record<SoundType, SoundSettings>;

interface NotificationSoundContextType {
  isSoundEnabled: boolean;
  soundSettings: SoundSettingsMap;
  toggleSound: () => void;
  updateSoundSetting: (type: SoundType, setting: Partial<SoundSettings>) => void;
  playNotificationSound: (type?: SoundType) => void;
}

const defaultSoundSettings: SoundSettingsMap = {
  default: { enabled: true, volume: 0.7 },
  message: { enabled: true, volume: 0.7 },
  alert: { enabled: true, volume: 0.8 },
  success: { enabled: true, volume: 0.7 },
  error: { enabled: true, volume: 0.8 },
};

const NotificationSoundContext = createContext<NotificationSoundContextType | undefined>(undefined);

export const useNotificationSound = () => {
  const context = useContext(NotificationSoundContext);
  if (!context) {
    throw new Error('useNotificationSound must be used within a NotificationSoundProvider');
  }
  return context;
};

const SOUND_FILES: Record<SoundType, string> = {
  default: '/notification-sound.mp3',
  message: '/notification-sound.mp3',
  alert: '/notification-sound.mp3',
  success: '/notification-sound.mp3',
  error: '/notification-sound.mp3',
};

export const NotificationSoundProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('notificationSoundEnabled');
      return saved !== null ? JSON.parse(saved) : true;
    }
    return true;
  });

  const [soundSettings, setSoundSettings] = useState<SoundSettingsMap>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('notificationSoundSettings');
      return saved ? JSON.parse(saved) : { ...defaultSoundSettings };
    }
    return { ...defaultSoundSettings };
  });

  // Save settings to localStorage when they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('notificationSoundEnabled', JSON.stringify(isSoundEnabled));
    }
  }, [isSoundEnabled]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('notificationSoundSettings', JSON.stringify(soundSettings));
    }
  }, [soundSettings]);

  const toggleSound = useCallback(() => {
    setIsSoundEnabled(prev => !prev);
  }, []);

  const updateSoundSetting = useCallback((type: SoundType, setting: Partial<SoundSettings>) => {
    setSoundSettings(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        ...setting,
      },
    }));
  }, []);

  const playNotificationSound = useCallback((type: SoundType = 'default') => {
    if (!isSoundEnabled || !soundSettings[type]?.enabled) {
      console.log(`Sound is disabled or ${type} sound is turned off`);
      return;
    }
    
    try {
      const soundFile = SOUND_FILES[type];
      console.log(`Attempting to play sound: ${soundFile}`);
      
      const newAudio = new Audio(soundFile);
      newAudio.volume = soundSettings[type].volume;
      
      // Preload the audio
      newAudio.preload = 'auto';
      
      const playPromise = newAudio.play();
      
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error(`Error playing ${type} sound:`, error);
          console.error('Sound file path:', soundFile);
          console.error('Sound settings:', soundSettings[type]);
        });
      }
    } catch (error) {
      console.error(`Unexpected error in playNotificationSound (${type}):`, error);
    }
  }, [isSoundEnabled, soundSettings]);

  const value = {
    isSoundEnabled,
    soundSettings,
    toggleSound,
    updateSoundSetting,
    playNotificationSound,
  };

  return (
    <NotificationSoundContext.Provider value={value}>
      {children}
    </NotificationSoundContext.Provider>
  );
};
