import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Target, Brain, GraduationCap, Wrench, Settings2, Clock, Coffee, Zap, BarChart3, TrendingUp, Timer, Music, Waves, Bell, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useBackgroundTimer } from '@/hooks/useBackgroundTimer';

interface PomodoroSettings {
  focusTime: number;
  shortBreak: number;
  longBreak: number;
  longBreakInterval: number;
}

interface TimerState {
  phase: 'focus' | 'shortBreak' | 'longBreak';
  sessionCount: number;
}

interface Statistics {
  totalFocusTime: number;
  totalBreakTime: number;
  completedSessions: number;
  mcqReminders: number;
  todayDate: string;
}

const PRESETS: Record<string, PomodoroSettings> = {
  focus: { focusTime: 25, shortBreak: 5, longBreak: 15, longBreakInterval: 4 },
  deepWork: { focusTime: 50, shortBreak: 10, longBreak: 30, longBreakInterval: 3 },
  exam: { focusTime: 45, shortBreak: 15, longBreak: 45, longBreakInterval: 2 },
  custom: { focusTime: 25, shortBreak: 5, longBreak: 15, longBreakInterval: 4 }
};

const SOUND_OPTIONS = [
  { value: 'bell', label: 'Bell', icon: Bell },
  { value: 'chime', label: 'Chime', icon: Music },
  { value: 'gong', label: 'Gong', icon: Waves },
  { value: 'beep', label: 'Beep', icon: Zap },
  { value: 'ding', label: 'Ding', icon: Sparkles },
  { value: 'buzz', label: 'Buzz', icon: Target },
  { value: 'soft-bell', label: 'Soft Bell', icon: Bell },
  { value: 'nature-chime', label: 'Nature Chime', icon: Music },
  { value: 'deep-gong', label: 'Deep Gong', icon: Waves },
  { value: 'gentle-beep', label: 'Gentle Beep', icon: Zap }
];

const Index = () => {
  const [timerState, setTimerState] = useState({
    phase: 'focus' as 'focus' | 'shortBreak' | 'longBreak',
    sessionCount: 0
  });

  const [settings, setSettings] = useState<PomodoroSettings>(PRESETS.focus);
  const [currentPreset, setCurrentPreset] = useState('focus');
  const [taskName, setTaskName] = useState('');
  const [mcqMode, setMcqMode] = useState(false);
  const [mcqInterval, setMcqInterval] = useState(300);
  const [buzzerEnabled, setBuzzerEnabled] = useState(true);
  const [soundSettings, setSoundSettings] = useState({
    focus: 'bell',
    shortBreak: 'chime',
    longBreak: 'gong',
    mcq: 'gentle-beep'
  });

  const [statistics, setStatistics] = useState<Statistics>(() => {
    const today = new Date().toDateString();
    const saved = localStorage.getItem('pomodoro-stats');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.todayDate === today) {
        return parsed;
      }
    }
    return {
      totalFocusTime: 0,
      totalBreakTime: 0,
      completedSessions: 0,
      mcqReminders: 0,
      todayDate: today
    };
  });

  const [mcqCountdown, setMcqCountdown] = useState(0);
  const mcqIntervalRef = useRef<NodeJS.Timeout>();
  const { toast } = useToast();

  // Background timer hook
  const { time: currentTime, isActive, startTimer, pauseTimer, resetTimer } = useBackgroundTimer({
    onComplete: handleTimerComplete,
    onTick: (time) => {
      // Update page title with timer
      document.title = `${time.minutes.toString().padStart(2, '0')}:${time.seconds.toString().padStart(2, '0')} - Focus Flow`;
    }
  });

  // Save statistics to localStorage
  useEffect(() => {
    localStorage.setItem('pomodoro-stats', JSON.stringify(statistics));
  }, [statistics]);

  // Service Worker Registration
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js');
    }
  }, []);

  // Real-time MCQ interval update
  useEffect(() => {
    if (mcqIntervalRef.current) {
      clearInterval(mcqIntervalRef.current);
    }
    
    if (mcqMode && isActive && timerState.phase === 'focus') {
      setMcqCountdown(mcqInterval);
      
      mcqIntervalRef.current = setInterval(() => {
        setMcqCountdown(prev => {
          if (prev <= 1) {
            showMcqReminder();
            return mcqInterval;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (mcqIntervalRef.current) {
        clearInterval(mcqIntervalRef.current);
      }
      setMcqCountdown(0);
    }

    return () => {
      if (mcqIntervalRef.current) {
        clearInterval(mcqIntervalRef.current);
      }
    };
  }, [mcqMode, mcqInterval, isActive, timerState.phase]);

  const playSound = (type: 'focus' | 'shortBreak' | 'longBreak' | 'mcq' = 'focus') => {
    if (!buzzerEnabled) return;
    
    const frequencies = {
      bell: [800, 600],
      chime: [600, 800, 1000],
      gong: [200, 300, 400],
      beep: [1000],
      ding: [750, 900],
      buzz: [300, 250],
      'soft-bell': [400, 500],
      'nature-chime': [500, 650, 800],
      'deep-gong': [150, 200],
      'gentle-beep': [600, 700]
    };

    const soundType = soundSettings[type] as keyof typeof frequencies;
    const freqArray = frequencies[soundType] || [800];

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    freqArray.forEach((frequency, index) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = type === 'mcq' ? 'triangle' : 'sine';

      const startTime = audioContext.currentTime + (index * 0.3);
      const duration = 0.5;

      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.15, startTime + 0.1);
      gainNode.gain.linearRampToValueAtTime(0, startTime + duration);

      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    });
  };

  function handleTimerComplete() {
    console.log('Timer completed, phase:', timerState.phase);
    
    if (timerState.phase === 'focus') {
      const newSessionCount = timerState.sessionCount + 1;
      const isLongBreak = newSessionCount % settings.longBreakInterval === 0;
      const nextPhase = isLongBreak ? 'longBreak' : 'shortBreak';
      const nextDuration = isLongBreak ? settings.longBreak : settings.shortBreak;
      
      setTimerState(prev => ({
        ...prev,
        phase: nextPhase,
        sessionCount: newSessionCount
      }));

      // Update statistics
      setStatistics(prev => ({
        ...prev,
        totalFocusTime: prev.totalFocusTime + settings.focusTime,
        completedSessions: prev.completedSessions + 1
      }));

      playSound(nextPhase);
      toast({
        title: "Focus session complete! 🎉",
        description: `Time for a ${isLongBreak ? 'long' : 'short'} break!`,
      });

      // Auto-start next phase
      setTimeout(() => {
        console.log('Auto-starting next phase:', nextPhase, 'for', nextDuration, 'minutes');
        startTimer({ minutes: nextDuration, seconds: 0 });
      }, 1000);
    } else {
      const breakTime = timerState.phase === 'longBreak' ? settings.longBreak : settings.shortBreak;
      
      setTimerState(prev => ({
        ...prev,
        phase: 'focus'
      }));

      // Update statistics
      setStatistics(prev => ({
        ...prev,
        totalBreakTime: prev.totalBreakTime + breakTime
      }));

      playSound('focus');
      toast({
        title: "Break time over! 💪",
        description: "Ready for another focus session?",
      });

      // Don't auto-start focus session, let user start manually
    }
  }

  const showMcqReminder = () => {
    setStatistics(prev => ({
      ...prev,
      mcqReminders: prev.mcqReminders + 1
    }));
    
    playSound('mcq');
    toast({
      title: "MCQ Reminder! 📝",
      description: "Time to review what you've learned!",
    });
  };

  const handleStartTimer = () => {
    console.log('Handle start timer clicked, phase:', timerState.phase);
    const initialTime = timerState.phase === 'focus' 
      ? { minutes: settings.focusTime, seconds: 0 }
      : (timerState.phase === 'shortBreak' 
          ? { minutes: settings.shortBreak, seconds: 0 }
          : { minutes: settings.longBreak, seconds: 0 });
    
    console.log('Starting timer with time:', initialTime);
    startTimer(initialTime);
  };

  const handlePauseTimer = () => {
    console.log('Handle pause timer clicked');
    pauseTimer();
  };

  const handleResetTimer = () => {
    console.log('Handle reset timer clicked');
    const initialTime = { minutes: settings.focusTime, seconds: 0 };
    resetTimer(initialTime);
    setTimerState({
      phase: 'focus',
      sessionCount: 0
    });
  };

  const handlePresetChange = (preset: string) => {
    setCurrentPreset(preset);
    const newSettings = { ...PRESETS[preset] };
    setSettings(newSettings);
    
    // Update timer if not active or if we're changing to custom
    if (!isActive || preset === 'custom') {
      resetTimer({ minutes: newSettings.focusTime, seconds: 0 });
    }
  };

  const handleSettingChange = (key: keyof PomodoroSettings, value: number) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
  };

  const resetStatistics = () => {
    const today = new Date().toDateString();
    const newStats = {
      totalFocusTime: 0,
      totalBreakTime: 0,
      completedSessions: 0,
      mcqReminders: 0,
      todayDate: today
    };
    setStatistics(newStats);
    toast({
      title: "Statistics Reset! 📊",
      description: "All daily statistics have been cleared.",
    });
  };

  const totalSeconds = currentTime.minutes * 60 + currentTime.seconds;
  const maxSeconds = timerState.phase === 'focus' 
    ? settings.focusTime * 60 
    : (timerState.phase === 'shortBreak' ? settings.shortBreak * 60 : settings.longBreak * 60);
  
  const progress = ((maxSeconds - totalSeconds) / maxSeconds) * 100;
  const circumference = 2 * Math.PI * 180;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const formatTime = (minutes: number, seconds: number) => {
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatMcqTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getPhaseColor = () => {
    switch (timerState.phase) {
      case 'focus':
        return 'text-rose-500';
      case 'shortBreak':
        return 'text-green-500';
      case 'longBreak':
        return 'text-blue-500';
      default:
        return 'text-rose-500';
    }
  };

  const getPhaseIcon = () => {
    switch (currentPreset) {
      case 'deepWork':
        return <Brain className="w-6 h-6" />;
      case 'exam':
        return <GraduationCap className="w-6 h-6" />;
      case 'custom':
        return <Wrench className="w-6 h-6" />;
      default:
        return <Target className="w-6 h-6" />;
    }
  };

  const getPhaseBackground = () => {
    switch (timerState.phase) {
      case 'focus':
        return 'phase-focus';
      case 'shortBreak':
        return 'phase-break';
      case 'longBreak':
        return 'phase-long-break';
      default:
        return 'phase-focus';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-4xl md:text-6xl font-bold mb-2 bg-gradient-to-r from-rose-500 to-orange-500 bg-clip-text text-transparent">
            Focus Flow
          </h1>
          <p className="text-slate-400 text-lg">Your zen pomodoro companion</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Timer */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main Timer Card */}
            <Card className={`glass-effect ${getPhaseBackground()} hover-lift animate-fade-in`}>
              <CardContent className="p-8">
                {/* Timer Display */}
                <div className="text-center mb-8">
                  <div className="relative inline-block">
                    <svg 
                      className={`timer-glow w-80 h-80 transform -rotate-90 ${isActive ? 'active' : ''}`}
                      viewBox="0 0 400 400"
                    >
                      <circle
                        cx="200"
                        cy="200"
                        r="180"
                        stroke="hsl(var(--muted))"
                        strokeWidth="8"
                        fill="none"
                      />
                      <circle
                        cx="200"
                        cy="200"
                        r="180"
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        className={`transition-all duration-1000 ${getPhaseColor()}`}
                      />
                    </svg>
                    
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className={`text-6xl md:text-8xl font-mono font-bold mb-2 ${getPhaseColor()}`}>
                        {formatTime(currentTime.minutes, currentTime.seconds)}
                      </div>
                      <div className="flex items-center gap-2 text-slate-400 text-lg capitalize">
                        {getPhaseIcon()}
                        {timerState.phase === 'shortBreak' ? 'Short Break' : 
                         timerState.phase === 'longBreak' ? 'Long Break' : 
                         'Focus Time'}
                      </div>
                      {taskName && (
                        <div className="text-slate-300 text-sm mt-2 max-w-48 truncate">
                          {taskName}
                        </div>
                      )}
                      {mcqMode && mcqCountdown > 0 && timerState.phase === 'focus' && (
                        <div className="text-yellow-400 text-lg mt-3 flex items-center gap-2">
                          <Brain className="w-4 h-4" />
                          Next MCQ: {formatMcqTime(mcqCountdown)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Control Buttons */}
                <div className="flex justify-center gap-4 mb-6">
                  <Button
                    size="lg"
                    onClick={isActive ? handlePauseTimer : handleStartTimer}
                    className="bg-rose-600 hover:bg-rose-700 text-white px-8 py-4 text-lg hover-lift"
                  >
                    {isActive ? (
                      <>
                        <Pause className="w-5 h-5 mr-2" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="w-5 h-5 mr-2" />
                        Start
                      </>
                    )}
                  </Button>
                  
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={handleResetTimer}
                    className="border-slate-600 text-slate-300 hover:bg-slate-800 px-8 py-4 text-lg hover-lift"
                  >
                    <RotateCcw className="w-5 h-5 mr-2" />
                    Reset
                  </Button>
                </div>

                {/* Session Counter */}
                <div className="text-center text-slate-400">
                  <span className="text-sm">Sessions completed: </span>
                  <span className="text-lg font-semibold text-rose-500">{timerState.sessionCount}</span>
                </div>
              </CardContent>
            </Card>

            {/* Presets */}
            <Card className="glass-effect animate-slide-in hover-lift">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Presets
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Object.keys(PRESETS).map((preset) => (
                    <Button
                      key={preset}
                      variant={currentPreset === preset ? "default" : "outline"}
                      onClick={() => handlePresetChange(preset)}
                      className={`capitalize hover-lift ${
                        currentPreset === preset 
                          ? "bg-rose-600 hover:bg-rose-700" 
                          : "border-slate-600 text-slate-300 hover:bg-slate-800"
                      }`}
                    >
                      {preset === 'deepWork' ? 'Deep Work' : preset}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Timer Settings */}
            <Card className="glass-effect animate-slide-in hover-lift">
              <CardContent className="p-6">
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                  <Settings2 className="w-5 h-5" />
                  Timer Settings
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="focus-time" className="text-sm font-medium mb-2 block">
                      Focus Time (min)
                    </Label>
                    <Input
                      id="focus-time"
                      type="number"
                      value={settings.focusTime}
                      onChange={(e) => handleSettingChange('focusTime', Number(e.target.value))}
                      className="bg-slate-800/50 border-slate-600 text-white"
                      min="1"
                      max="120"
                      disabled={currentPreset !== 'custom'}
                    />
                  </div>
                  <div>
                    <Label htmlFor="short-break" className="text-sm font-medium mb-2 block">
                      Short Break (min)
                    </Label>
                    <Input
                      id="short-break"
                      type="number"
                      value={settings.shortBreak}
                      onChange={(e) => handleSettingChange('shortBreak', Number(e.target.value))}
                      className="bg-slate-800/50 border-slate-600 text-white"
                      min="1"
                      max="60"
                      disabled={currentPreset !== 'custom'}
                    />
                  </div>
                  <div>
                    <Label htmlFor="long-break" className="text-sm font-medium mb-2 block">
                      Long Break (min)
                    </Label>
                    <Input
                      id="long-break"
                      type="number"
                      value={settings.longBreak}
                      onChange={(e) => handleSettingChange('longBreak', Number(e.target.value))}
                      className="bg-slate-800/50 border-slate-600 text-white"
                      min="1"
                      max="120"
                      disabled={currentPreset !== 'custom'}
                    />
                  </div>
                  <div>
                    <Label htmlFor="long-break-interval" className="text-sm font-medium mb-2 block">
                      Long Break Interval
                    </Label>
                    <Input
                      id="long-break-interval"
                      type="number"
                      value={settings.longBreakInterval}
                      onChange={(e) => handleSettingChange('longBreakInterval', Number(e.target.value))}
                      className="bg-slate-800/50 border-slate-600 text-white"
                      min="2"
                      max="10"
                      disabled={currentPreset !== 'custom'}
                    />
                  </div>
                </div>
                {currentPreset !== 'custom' && (
                  <p className="text-xs text-slate-500 mt-2">
                    Switch to "Custom" preset to modify these values
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Settings & Statistics */}
          <div className="space-y-6">
            {/* Statistics */}
            <Card className="glass-effect animate-slide-in hover-lift">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-purple-500" />
                    Today's Stats
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetStatistics}
                    className="text-slate-400 hover:text-white text-xs"
                  >
                    Reset
                  </Button>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-slate-800/30 rounded-lg">
                    <span className="text-sm text-slate-300 flex items-center gap-2">
                      <Timer className="w-4 h-4 text-rose-500" />
                      Focus Time
                    </span>
                    <span className="font-semibold text-rose-500">{statistics.totalFocusTime}m</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-800/30 rounded-lg">
                    <span className="text-sm text-slate-300 flex items-center gap-2">
                      <Coffee className="w-4 h-4 text-green-500" />
                      Break Time
                    </span>
                    <span className="font-semibold text-green-500">{statistics.totalBreakTime}m</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-800/30 rounded-lg">
                    <span className="text-sm text-slate-300 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-blue-500" />
                      Sessions
                    </span>
                    <span className="font-semibold text-blue-500">{statistics.completedSessions}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-800/30 rounded-lg">
                    <span className="text-sm text-slate-300 flex items-center gap-2">
                      <Brain className="w-4 h-4 text-yellow-500" />
                      MCQ Reminders
                    </span>
                    <span className="font-semibold text-yellow-500">{statistics.mcqReminders}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Task Name */}
            <Card className="glass-effect animate-slide-in hover-lift">
              <CardContent className="p-6">
                <Label htmlFor="task" className="text-lg font-medium mb-3 block flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Current Task
                </Label>
                <Input
                  id="task"
                  value={taskName}
                  onChange={(e) => setTaskName(e.target.value)}
                  placeholder="What are you working on?"
                  className="bg-slate-800/50 border-slate-600 text-white placeholder-slate-400"
                />
              </CardContent>
            </Card>

            {/* MCQ Mode */}
            <Card className="glass-effect animate-slide-in hover-lift">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Label htmlFor="mcq-mode" className="text-lg font-medium flex items-center gap-2">
                    <Brain className="w-5 h-5" />
                    MCQ Mode
                  </Label>
                  <Switch
                    id="mcq-mode"
                    checked={mcqMode}
                    onCheckedChange={setMcqMode}
                  />
                </div>
                {mcqMode && (
                  <div className="space-y-4 animate-fade-in">
                    <div>
                      <Label htmlFor="mcq-interval" className="text-sm text-slate-400 mb-2 block">
                        MCQ Interval (seconds)
                      </Label>
                      <Input
                        id="mcq-interval"
                        type="number"
                        value={mcqInterval}
                        onChange={(e) => setMcqInterval(Number(e.target.value))}
                        className="bg-slate-800/50 border-slate-600 text-white"
                        min="30"
                        max="1800"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Sound Settings */}
            <Card className="glass-effect animate-slide-in hover-lift">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Label htmlFor="buzzer-enabled" className="text-lg font-medium flex items-center gap-2">
                    {buzzerEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                    Sound Settings
                  </Label>
                  <Switch
                    id="buzzer-enabled"
                    checked={buzzerEnabled}
                    onCheckedChange={setBuzzerEnabled}
                  />
                </div>
                
                {buzzerEnabled && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <Label htmlFor="focus-sound" className="text-sm font-medium mb-2 block flex items-center gap-1">
                          <Zap className="w-4 h-4 text-rose-500" />
                          Focus End Sound
                        </Label>
                        <Select
                          value={soundSettings.focus}
                          onValueChange={(value) => setSoundSettings({...soundSettings, focus: value})}
                        >
                          <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-slate-700">
                            {SOUND_OPTIONS.map((sound) => {
                              const IconComponent = sound.icon;
                              return (
                                <SelectItem key={sound.value} value={sound.value}>
                                  <div className="flex items-center gap-2">
                                    <IconComponent className="w-4 h-4" />
                                    {sound.label}
                                  </div>
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="break-sound" className="text-sm font-medium mb-2 block flex items-center gap-1">
                          <Coffee className="w-4 h-4 text-green-500" />
                          Break End Sound
                        </Label>
                        <Select
                          value={soundSettings.shortBreak}
                          onValueChange={(value) => setSoundSettings({...soundSettings, shortBreak: value, longBreak: value})}
                        >
                          <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-slate-700">
                            {SOUND_OPTIONS.map((sound) => {
                              const IconComponent = sound.icon;
                              return (
                                <SelectItem key={sound.value} value={sound.value}>
                                  <div className="flex items-center gap-2">
                                    <IconComponent className="w-4 h-4" />
                                    {sound.label}
                                  </div>
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="mcq-sound" className="text-sm font-medium mb-2 block flex items-center gap-1">
                          <Brain className="w-4 h-4 text-yellow-500" />
                          MCQ Reminder Sound
                        </Label>
                        <Select
                          value={soundSettings.mcq}
                          onValueChange={(value) => setSoundSettings({...soundSettings, mcq: value})}
                        >
                          <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-slate-700">
                            {SOUND_OPTIONS.map((sound) => {
                              const IconComponent = sound.icon;
                              return (
                                <SelectItem key={sound.value} value={sound.value}>
                                  <div className="flex items-center gap-2">
                                    <IconComponent className="w-4 h-4" />
                                    {sound.label}
                                  </div>
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
