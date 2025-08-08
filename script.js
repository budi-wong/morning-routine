let totalTime = 20 * 60; // 20 minutes in seconds
let timerElement = document.getElementById("timer");
let messageElement = document.getElementById("message");
let tasks = document.querySelectorAll(".task");
let completedCount = 0;

function updateTimer() {
  let minutes = Math.floor(totalTime / 60);
  let seconds = totalTime % 60;
  timerElement.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  if (totalTime <= 0) {
    clearInterval(timerInterval);
    endGame(false);
  }
  totalTime--;
}

function endGame(win) {
  tasks.forEach(btn => btn.disabled = true);
  if (win) {
    messageElement.textContent = "🏆 Well done! You’re ready for school!";
    messageElement.style.color = "green";
  } else {
    messageElement.textContent = "⏰ Time’s up! Let’s try again tomorrow.";
    messageElement.style.color = "red";
  }
}

tasks.forEach(task => {
  task.addEventListener("click", () => {
    if (!task.classList.contains("completed")) {
      task.classList.add("completed");
      completedCount++;
      if (completedCount === tasks.length) {
        clearInterval(timerInterval);
        endGame(true);
      }
    }
  });
});

let timerInterval = setInterval(updateTimer, 1000);
updateTimer();
