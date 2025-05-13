'use client';

import React, { useEffect } from 'react';
import { useTimer } from '../contexts/TimerContext';

export default function Timer() {
  const {
    sectionDuration,
    currentSectionElapsedTime,
    setCurrentSectionElapsedTime,
    isSectionTimingActive,
    setIsSectionTimingActive,
    resetSectionTimer,
  } = useTimer();

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    console.log('Timer effect running, isSectionTimingActive:', isSectionTimingActive);
    
    if (isSectionTimingActive && sectionDuration !== null) {
      console.log('Starting timer interval');
      interval = setInterval(() => {
        setCurrentSectionElapsedTime((prevTime: number) => { // Explicitly type prevTime
          // Increment time if it's less than the section's duration
          if (prevTime < sectionDuration) {
            return prevTime + 1;
          }
          // If time has reached or passed duration, stop incrementing.
          // The display logic will handle showing "00:00" or overtime.
          return prevTime; 
        });
      }, 1000);
    } else if (interval) {
      console.log('Clearing timer interval');
      clearInterval(interval);
      interval = null;
    }

    return () => {
      if (interval) {
        console.log('Cleanup: clearing timer interval');
        clearInterval(interval);
      }
    };
  }, [isSectionTimingActive, sectionDuration, setCurrentSectionElapsedTime]);

  const formatTime = (totalSeconds: number): string => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleToggleTimer = () => {
    if (sectionDuration !== null) { // Only allow toggle if a section with duration is active
      console.log('Toggling timer state from', isSectionTimingActive, 'to', !isSectionTimingActive);
      setIsSectionTimingActive(!isSectionTimingActive);
    }
  };

  const handleResetTimer = () => {
    if (sectionDuration !== null) { // Reset only makes sense for a timed section
      resetSectionTimer(); // Resets currentSectionElapsedTime to 0
      // SlideClientComponent will manage setIsSectionTimingActive on navigation/load
      // If user manually resets, they might want it to start again if section is still active.
      // For now, reset just resets time. User can pause/resume.
    }
  };

  let displayTime = "--:--";
  let isOvertime = false;
  const showControls = sectionDuration !== null;

  if (sectionDuration !== null) {
    const remainingTime = sectionDuration - currentSectionElapsedTime;
    if (remainingTime < 0) {
      isOvertime = true;
      displayTime = formatTime(Math.abs(remainingTime));
    } else {
      displayTime = formatTime(remainingTime);
    }
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-80 text-white p-2 rounded-md z-40 flex gap-2 items-center">
      <div className={`font-mono text-lg ${isOvertime ? 'text-red-500' : ''}`}>
        {isOvertime ? "Over: " : ""}
        {displayTime}
      </div>
      {showControls && (
        <>
          <button
            onClick={handleToggleTimer}
            className={`${isSectionTimingActive ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'} text-white px-2 py-1 rounded text-sm`}
          >
            {isSectionTimingActive ? 'Pause Section' : 'Resume Section'}
          </button>
          <button
            onClick={handleResetTimer}
            className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-sm"
          >
            Reset Section
          </button>
        </>
      )}
    </div>
  );
}