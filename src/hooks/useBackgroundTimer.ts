import { useState, useEffect, useRef, useCallback } from 'react';

interface TimerTime {
  minutes: number;
  seconds: number;
}

interface UseBackgroundTimerProps {
  onComplete: () => void;
  onTick?: (time: TimerTime) => void;
}

export const useBackgroundTimer = ({ onComplete, onTick }: UseBackgroundTimerProps) => {
  const [time, setTime] = useState<TimerTime>({ minutes: 25, seconds: 0 });
  const [isActive, setIsActive] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  // Request wake lock to keep screen active
  const requestWakeLock = useCallback(async () => {
    try {
      if ('wakeLock' in navigator) {
        wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
        console.log('Wake lock acquired');
      }
    } catch (err) {
      console.log('Wake lock failed:', err);
    }
  }, []);

  // Release wake lock
  const releaseWakeLock = useCallback(() => {
    if (wakeLockRef.current) {
      wakeLockRef.current.release();
      wakeLockRef.current = null;
      console.log('Wake lock released');
    }
  }, []);

  // Timer tick function
  const tick = useCallback(() => {
    setTime(prevTime => {
      const newTime = { ...prevTime };
      
      if (newTime.seconds === 0) {
        if (newTime.minutes === 0) {
          // Timer complete
          setIsActive(false);
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          onComplete();
          return newTime;
        }
        newTime.minutes--;
        newTime.seconds = 59;
      } else {
        newTime.seconds--;
      }
      
      onTick?.(newTime);
      return newTime;
    });
  }, [onComplete, onTick]);

  // Start timer
  const startTimer = useCallback((initialTime: TimerTime) => {
    console.log('Starting timer with:', initialTime);
    setTime(initialTime);
    setIsActive(true);
    requestWakeLock();
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    intervalRef.current = setInterval(tick, 1000);
  }, [tick, requestWakeLock]);

  // Pause timer
  const pauseTimer = useCallback(() => {
    console.log('Pausing timer');
    setIsActive(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    releaseWakeLock();
  }, [releaseWakeLock]);

  // Reset timer
  const resetTimer = useCallback((newTime: TimerTime) => {
    console.log('Resetting timer to:', newTime);
    setTime(newTime);
    setIsActive(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    releaseWakeLock();
  }, [releaseWakeLock]);

  // Handle visibility change to maintain timer
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isActive) {
        console.log('Page hidden, timer continues in background');
      } else if (!document.hidden && isActive) {
        console.log('Page visible, timer still running');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isActive]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      releaseWakeLock();
    };
  }, [releaseWakeLock]);

  return {
    time,
    isActive,
    startTimer,
    pauseTimer,
    resetTimer
  };
};
