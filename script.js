(() => {
  
  const screens = {
    menu: document.getElementById("menu"),
    game: document.getElementById("game"),
    over: document.getElementById("gameover"),
  };

  
  const startBtn = document.getElementById("startBtn");
  const toggles = Array.from(document.querySelectorAll(".segmented .btn.toggle"));

  
  const scoreEl = document.getElementById("score");
  const timeEl = document.getElementById("time");
  const gridEl = document.getElementById("grid");
  const pauseBtn = document.getElementById("pauseBtn");
  const menuBtn = document.getElementById("menuBtn");

  
  const finalScoreEl = document.getElementById("finalScore");
  const restartBtn = document.getElementById("restartBtn");
  const backBtn = document.getElementById("backBtn");

  
  let gridSize = 4;          
  let duration = 30;         
  let score = 0;
  let timeLeft = 0;
  let holes = [];            
  let moleTimer = null;      
  let countdownTimer = null; 
  let moleInterval = 800;    
  let paused = false;
  const difficultyStepMs = 60; 

  let audioCtx = null;
  function initAudio() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  function pop(freq = 520, dur = 0.1, type = "sine", volume = 0.12) {
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const end = audioCtx.currentTime + dur;

    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.value = volume;

   
    gain.gain.setValueAtTime(0, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(volume, audioCtx.currentTime + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, end);

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(end);
    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
    };
  }
  function hitSound() { pop(720, 0.10, "sine", 0.14); }
  function missSound() { pop(360, 0.08, "sine", 0.10); }

  
  function showScreen(name) {
    Object.values(screens).forEach(s => s.classList.remove("active"));
    screens[name].classList.add("active");
  }

 
  function buildGrid() {
    gridEl.innerHTML = "";
    holes = [];

  
    gridEl.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;

    const total = gridSize * gridSize;
    for (let i = 0; i < total; i++) {
      const hole = document.createElement("button");
      hole.className = "hole";
      hole.type = "button";
      hole.setAttribute("aria-label", "Hole");

     
      hole.addEventListener("click", (e) => {
        if (paused) return;
        if (hole.classList.contains("active")) {
          score++;
          scoreEl.textContent = String(score);
          hole.classList.remove("active");
          hitSound();
          spawnFx(e.clientX, e.clientY, "❤️"); 
        } else {
         
          missSound();
          spawnFx(e.clientX, e.clientY, "✨"); 
        }
      });

      gridEl.appendChild(hole);
      holes.push(hole);
    }
  }


  function popRandomMole() {
    if (paused || holes.length === 0) return;

   
    holes.forEach(h => h.classList.remove("active"));

    
    const idx = Math.floor(Math.random() * holes.length);
    const chosen = holes[idx];
    chosen.classList.add("active");

    const upTime = randInt(450, 800);
    setTimeout(() => {
      chosen.classList.remove("active");
    }, upTime);
  }

  function startMoles() {
    clearInterval(moleTimer);
    moleTimer = setInterval(popRandomMole, moleInterval);
  }

 
  function stepDifficulty() {
    if (moleInterval > 300) {
      moleInterval = Math.max(260, moleInterval - difficultyStepMs);
      startMoles(); 
    }
  }

  
  function startGame() {
    initAudio(); 

    score = 0;
    timeLeft = duration;
    moleInterval = gridSize === 3 ? 900 : 800; 
    paused = false;

    scoreEl.textContent = String(score);
    timeEl.textContent = String(timeLeft).padStart(2, "0");

    buildGrid();
    showScreen("game");

    startMoles();
    clearInterval(countdownTimer);

   
    countdownTimer = setInterval(() => {
      if (paused) return;

      timeLeft--;
      timeEl.textContent = String(timeLeft).padStart(2, "0");

      stepDifficulty();

      if (timeLeft <= 0) {
        endGame();
      }
    }, 1000);
  }

 
  function endGame() {
    clearInterval(moleTimer);
    clearInterval(countdownTimer);
    holes.forEach(h => h.classList.remove("active"));
    finalScoreEl.textContent = String(score);
    showScreen("gameover");
  }

  
  function togglePause() {
    paused = !paused;
    pauseBtn.textContent = paused ? "Resume" : "Pause";
    if (!paused) startMoles();
  }

  
  function spawnFx(x, y, symbol = "✨") {
   
    const app = document.getElementById("app");
    const rect = app.getBoundingClientRect();
    const fx = document.createElement("span");
    fx.className = "fx";
    fx.textContent = symbol;

    
    fx.style.left = `${x - rect.left - 8}px`;
    fx.style.top = `${y - rect.top - 18}px`;

    app.appendChild(fx);
    setTimeout(() => fx.remove(), 650);
  }

  
  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  
  toggles.forEach(btn => {
    btn.addEventListener("click", () => {
     
      const parent = btn.parentElement;
      Array.from(parent.querySelectorAll(".btn.toggle")).forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      
      const g = btn.getAttribute("data-grid");
      const t = btn.getAttribute("data-time");
      if (g) gridSize = Number(g);   
      if (t) duration = Number(t);   
    });
  });

 
  startBtn.addEventListener("click", startGame);

  
  pauseBtn.addEventListener("click", togglePause);
  menuBtn.addEventListener("click", () => {
    clearInterval(moleTimer);
    clearInterval(countdownTimer);
    showScreen("menu");
  });

  
  restartBtn.addEventListener("click", startGame);
  backBtn.addEventListener("click", () => showScreen("menu"));
})();
