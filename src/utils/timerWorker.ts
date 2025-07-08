// Timer worker to keep timer running in background
let timerInterval: number | null = null;
let currentTime = { minutes: 25, seconds: 0 };
let isRunning = false;

self.onmessage = (event) => {
  const { type, payload } = event.data;
  
  switch (type) {
    case 'START_TIMER':
      if (!isRunning) {
        isRunning = true;
        currentTime = payload.time;
        startTimer();
      }
      break;
      
    case 'PAUSE_TIMER':
      isRunning = false;
      if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
      }
      break;
      
    case 'RESET_TIMER':
      isRunning = false;
      if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
      }
      currentTime = payload.time;
      postMessage({ type: 'TIMER_TICK', time: currentTime });
      break;
      
    case 'GET_TIME':
      postMessage({ type: 'TIMER_TICK', time: currentTime });
      break;
  }
};

function startTimer() {
  if (timerInterval) return;
  
  timerInterval = setInterval(() => {
    if (!isRunning) return;
    
    if (currentTime.seconds === 0) {
      if (currentTime.minutes === 0) {
        // Timer finished
        isRunning = false;
        clearInterval(timerInterval!);
        timerInterval = null;
        postMessage({ type: 'TIMER_COMPLETE', time: currentTime });
        return;
      }
      currentTime.minutes--;
      currentTime.seconds = 59;
    } else {
      currentTime.seconds--;
    }
    
    postMessage({ type: 'TIMER_TICK', time: currentTime });
  }, 1000) as unknown as number;
}
