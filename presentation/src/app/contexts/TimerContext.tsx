'use client';

import React, { createContext, useState, useContext, ReactNode, useEffect, Dispatch, SetStateAction } from 'react';

const LOCAL_STORAGE_KEY_ELAPSED_TIME = 'presentation-section-elapsed-time';

interface TimerContextType {
  sectionDuration: number | null;
  setSectionDuration: (duration: number | null) => void;
  currentSectionElapsedTime: number;
  setCurrentSectionElapsedTime: Dispatch<SetStateAction<number>>;
  isSectionTimingActive: boolean;
  setIsSectionTimingActive: (isActive: boolean) => void;
  resetSectionTimer: () => void;
  lastNavigatedSectionId: string | null; // New: To track the last section ID
  setLastNavigatedSectionId: (id: string | null) => void; // New: Setter for last section ID
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export const TimerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [sectionDuration, setSectionDuration] = useState<number | null>(null);
  const [currentSectionElapsedTime, setCurrentSectionElapsedTimeState] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const savedTime = localStorage.getItem(LOCAL_STORAGE_KEY_ELAPSED_TIME);
      return savedTime ? parseInt(savedTime, 10) : 0;
    }
    return 0;
  });
  const [isSectionTimingActive, setIsSectionTimingActive] = useState<boolean>(false);
  const [lastNavigatedSectionId, setLastNavigatedSectionId] = useState<string | null>(null); // New state

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_KEY_ELAPSED_TIME, currentSectionElapsedTime.toString());
    }
  }, [currentSectionElapsedTime]);

  const resetSectionTimer = () => {
    setCurrentSectionElapsedTimeState(0);
  };

  return (
    <TimerContext.Provider
      value={{
        sectionDuration,
        setSectionDuration,
        currentSectionElapsedTime,
        setCurrentSectionElapsedTime: setCurrentSectionElapsedTimeState,
        isSectionTimingActive,
        setIsSectionTimingActive,
        resetSectionTimer,
        lastNavigatedSectionId, // Provide new state
        setLastNavigatedSectionId, // Provide new setter
      }}
    >
      {children}
    </TimerContext.Provider>
  );
};

export const useTimer = (): TimerContextType => {
  const context = useContext(TimerContext);
  if (context === undefined) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
};
