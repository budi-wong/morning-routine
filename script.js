// Magical Alicorn Morning - script.js
const TIME_DEFAULT = 20 * 60; // 20 minutes
let timeLeft = TIME_DEFAULT;
const timerEl = document.getElementById('timer');
const taskBtns = Array.from(document.querySelectorAll('.taskBtn'));
const alicorn = document.getElementById('alicorn');
const checkpoints = Array.from(document.querySelectorAll('#checkpoints .cp'));
const messageEl = document.getElementById('message');
const streakEl = document.getElementById('streakCount');
const muteBtn = document.getElementById('mute');
const resetBtn = document.getElementById('resetDay');

let completed = new Array(taskBtns.length).fill(false);
let audioOn = true;

// Load streak from localStorage
let streak = Number(localStorage.getItem('alicorn_streak') || 0);
streakEl.textContent = streak;

// Helper: format time
function formatTime(s){
  const m = Math.floor(s/60);
  const sec = s%60;
  return `${m}:${sec<10?'0':''}${sec}`;
}

function updateTimerDisplay(){
  timerEl.textContent = formatTime(timeLeft);
  if (timeLeft <= 0){
    clearInterval(timerInterval);
    loseGame();
  }
}

// Play simple tones via WebAudio
const AudioCtx = window.AudioContext || window.webkitAudioContext;
const audioCtx = AudioCtx ? new AudioCtx() : null;
function playTone(freq,dur,vol=0.1){
  if (!audioOn || !audioCtx) return;
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.type = 'sine';
  o.frequency.value = freq;
  g.gain.value = vol;
  o.connect(g); g.connect(audioCtx.destination);
  o.start();
  o.stop(audioCtx.currentTime + dur);
}

// Move alicorn to checkpoint index
function moveAlicornTo(index){
  const cp = checkpoints[index];
  if (!cp) return;
  const transform = cp.getAttribute('transform'); // e.g., translate(x,y)
  // extract numbers
  const nums = transform.match(/translate\(([^)]+)\)/)[1].split(',');
  const x = parseFloat(nums[0]);
  const y = parseFloat(nums[1]) - 40; // lift up a bit
  // apply transform to alicorn group
  alicorn.setAttribute('transform', `translate(${x},${y})`);
  alicorn.classList.add('alicorn-fly');
  // sparkle effect
  spawnSparkles(x+40,y+10);
  playTone(880,0.08,0.06);
}

// simple sparkle using DOM
function spawnSparkles(x,y){
  const wrap = document.querySelector('.game-area');
  const sp = document.createElement('div');
  sp.className = 'sparkle';
  sp.style.left = (x/800*wrap.clientWidth) + 'px';
  sp.style.top = (y/400*wrap.clientHeight) + 'px';
  sp.innerHTML = '✨';
  sp.style.fontSize = '20px';
  document.body.appendChild(sp);
  setTimeout(()=> sp.remove(),700);
}

// Task click handler
taskBtns.forEach(btn => {
  btn.addEventListener('click', ()=>{
    const idx = Number(btn.dataset.index);
    if (completed[idx]) return;
    completed[idx] = true;
    btn.classList.add('done');
    moveAlicornTo(idx);
    // check win
    if (completed.every(Boolean)){
      winGame();
    } else {
      messageEl.textContent = ['Great! Next!','Amazing!','Keep going!'][Math.floor(Math.random()*3)];
    }
  });
});

// Win/Lose handlers
function winGame(){
  clearInterval(timerInterval);
  messageEl.textContent = '🌈 You finished! Alicorn is proud!';
  playTone(1100,0.2,0.12);
  // increment streak and save
  streak += 1;
  localStorage.setItem('alicorn_streak', streak);
  streakEl.textContent = streak;
  // celebration: rainbow burst (simple)
  const wrap = document.querySelector('.game-area');
  const conf = document.createElement('div');
  conf.style.position='absolute'; conf.style.left='0'; conf.style.right='0'; conf.style.top='0'; conf.style.bottom='0';
  conf.style.pointerEvents='none'; conf.innerHTML = '<div style="position:absolute;left:50%;top:30%;transform:translate(-50%,-50%);font-size:48px">🌈✨🎉</div>';
  wrap.appendChild(conf);
  setTimeout(()=> conf.remove(),2200);
}

function loseGame(){
  messageEl.textContent = '⏰ Time is up — we'll try again tomorrow!';
  playTone(220,0.5,0.06);
  // reset completed visuals but keep streak
  taskBtns.forEach((b,i)=> b.disabled = true);
}

// Timer countdown
let timerInterval = setInterval(()=>{
  timeLeft--;
  updateTimerDisplay();
},1000);
updateTimerDisplay();

// Mute toggle
muteBtn.addEventListener('click', ()=>{
  audioOn = !audioOn;
  muteBtn.textContent = audioOn ? '🔊' : '🔇';
  // resume audio context on iOS on first interaction
  if (audioOn && audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
});

// Reset day (for testing)
resetBtn.addEventListener('click', ()=>{
  completed = new Array(taskBtns.length).fill(false);
  taskBtns.forEach(b=> { b.classList.remove('done'); b.disabled = false; });
  timeLeft = TIME_DEFAULT;
  clearInterval(timerInterval);
  timerInterval = setInterval(()=>{
    timeLeft--;
    updateTimerDisplay();
  },1000);
  updateTimerDisplay();
  messageEl.textContent = "New day! Let's go on an adventure!";
});

// On load, ensure alicorn at start
moveAlicornTo(0);
