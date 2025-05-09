'use client';

import React, { useState, useEffect } from 'react';

export default function Timer() {
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0);

  useEffect(() => {
    // Attempt to load timer state from localStorage
    if (typeof window !== 'undefined') {
      const savedTime = localStorage.getItem('presentation-timer-time');
      const savedIsRunning = localStorage.getItem('presentation-timer-running');
      
      if (savedTime) {
        setTime(parseInt(savedTime, 10));
      }
      
      if (savedIsRunning === 'true') {
        setIsRunning(true);
      }
    }
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isRunning) {
      interval = setInterval(() => {
        setTime(prevTime => {
          const newTime = prevTime + 1;
          // Save to localStorage
          if (typeof window !== 'undefined') {
            localStorage.setItem('presentation-timer-time', newTime.toString());
          }
          return newTime;
        });
      }, 1000);
    } else if (interval) {
      clearInterval(interval);
    }
    
    // Save running state to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('presentation-timer-running', isRunning.toString());
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTime(0);
    if (typeof window !== 'undefined') {
      localStorage.setItem('presentation-timer-time', '0');
      localStorage.setItem('presentation-timer-running', 'false');
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-80 text-white p-2 rounded-md z-50 flex gap-2 items-center">
      <div className="font-mono text-lg">{formatTime(time)}</div>
      <button 
        onClick={toggleTimer}
        className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-sm"
      >
        {isRunning ? 'Pause' : 'Start'}
      </button>
      <button 
        onClick={resetTimer}
        className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-sm"
      >
        Reset
      </button>
    </div>
  );
}