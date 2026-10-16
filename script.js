
document.addEventListener("DOMContentLoaded", () => {
  // Stopwatch elements
  const timerDisplay = document.getElementById("timerDisplay");
  const timerRing = document.getElementById("timerRing");
  const timerState = document.getElementById("timerState");
  const sessionStatus = document.getElementById("sessionStatus");

  const startButton = document.getElementById("startButton");
  const startLabel = document.getElementById("startLabel");
  const pauseButton = document.getElementById("pauseButton");
  const lapButton = document.getElementById("lapButton");
  const resetButton = document.getElementById("resetButton");
  const resetAllButton = document.getElementById("resetAll");
  const clearLapsButton = document.getElementById("clearLapsButton");
  const themeToggle = document.getElementById("themeToggle");

  const lapTableBody = document.getElementById("lapTableBody");
  const lapCountLabel = document.getElementById("lapCountLabel");
  const lapCountBadge = document.getElementById("lapCountBadge");
  const lapSummary = document.getElementById("lapSummary");

  const totalLapsElement = document.getElementById("totalLaps");
  const bestLapElement = document.getElementById("bestLap");
  const averageLapElement = document.getElementById("averageLap");
  const totalTimeElement = document.getElementById("totalTime");

  // Stopwatch state
  let elapsedBeforeStart = 0;
  let startedAt = null;
  let elapsedMilliseconds = 0;
  let animationFrame = null;
  let running = false;
  let laps = [];
  let lastLapTime = 0;

  const EMPTY_LAPS = `
    <tr class="empty-row">
      <td colspan="4">
        <span class="empty-icon">◷</span>
        <strong>No laps yet</strong>
        <span>Start the timer and press Lap to record a split.</span>
      </td>
    </tr>
  `;

  // Format milliseconds as HH:MM:SS.cc (centiseconds)
  function formatTime(milliseconds) {
    const totalCentiseconds = Math.floor(milliseconds / 10);
    const centiseconds = totalCentiseconds % 100;
    const totalSeconds = Math.floor(totalCentiseconds / 100);
    const seconds = totalSeconds % 60;
    const totalMinutes = Math.floor(totalSeconds / 60);
    const minutes = totalMinutes % 60;
    const hours = Math.floor(totalMinutes / 60);

    const pad = (number, digits = 2) =>
      String(number).padStart(digits, "0");

    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}.${pad(centiseconds)}`;
  }

  function updateTimerDisplay() {
    const formatted = formatTime(elapsedMilliseconds);
    const [mainTime, fraction] = formatted.split(".");

    timerDisplay.innerHTML =
      `${mainTime}<span class="milliseconds">.${fraction}</span>`;

    totalTimeElement.textContent = formatted;
  }

  function getCurrentElapsed() {
    if (!running || startedAt === null) {
      return elapsedBeforeStart;
    }

    return elapsedBeforeStart + (performance.now() - startedAt);
  }

  function tick() {
    if (!running) return;

    elapsedMilliseconds = getCurrentElapsed();
    updateTimerDisplay();
    animationFrame = requestAnimationFrame(tick);
  }

  function setStatus(status) {
    timerState.textContent = status;
    sessionStatus.textContent = status;
  }

  function updateControls() {
    startButton.disabled = running;
    pauseButton.disabled = !running;
    lapButton.disabled = !running;
    resetButton.disabled = elapsedMilliseconds === 0 && laps.length === 0;
    clearLapsButton.disabled = laps.length === 0;

    startLabel.textContent = elapsedMilliseconds > 0 ? "Resume" : "Start";
    timerRing.classList.toggle("running", running);

    const stateDot = document.querySelector(".state-dot");
    if (stateDot) {
      stateDot.style.background = running
        ? "#21ae68"
        : elapsedMilliseconds > 0
          ? "#e5a33e"
          : "#a4b4a9";
    }
  }

  function startStopwatch() {
    if (running) return;

    running = true;
    startedAt = performance.now();
    setStatus("Running");
    updateControls();

    cancelAnimationFrame(animationFrame);
    animationFrame = requestAnimationFrame(tick);
  }

  function pauseStopwatch() {
    if (!running) return;

    elapsedBeforeStart = getCurrentElapsed();
    elapsedMilliseconds = elapsedBeforeStart;
    running = false;
    startedAt = null;

    cancelAnimationFrame(animationFrame);
    updateTimerDisplay();
    setStatus("Paused");
    updateControls();
  }

  function resetStopwatch() {
    running = false;
    startedAt = null;
    elapsedBeforeStart = 0;
    elapsedMilliseconds = 0;
    lastLapTime = 0;

    cancelAnimationFrame(animationFrame);
    updateTimerDisplay();
    setStatus("Ready");
    updateControls();
  }

  function recordLap() {
    if (!running) return;

    elapsedMilliseconds = getCurrentElapsed();

    const lapDuration = elapsedMilliseconds - lastLapTime;
    lastLapTime = elapsedMilliseconds;

    laps.unshift({
      number: laps.length + 1,
      duration: lapDuration,
      total: elapsedMilliseconds
    });

    updateTimerDisplay();
    renderLaps();
    updateStatistics();
    updateControls();
  }

  function clearLaps() {
    laps = [];
    lastLapTime = 0;

    renderLaps();
    updateStatistics();
    updateControls();
  }

  function resetAll() {
    resetStopwatch();
    clearLaps();
  }

  function renderLaps() {
    if (laps.length === 0) {
      lapTableBody.innerHTML = EMPTY_LAPS;
      lapSummary.textContent = "Your lap history will appear here.";
    } else {
      lapTableBody.innerHTML = laps.map((lap, index) => {
        // Compare the current lap with the previous recorded lap.
        const previousLap = laps[index + 1];
        let differenceText = "—";
        let differenceClass = "";

        if (previousLap) {
          const difference = lap.duration - previousLap.duration;
          const absoluteDifference = formatTime(Math.abs(difference));

          if (difference < 0) {
            differenceText = `−${absoluteDifference}`;
            differenceClass = "faster";
          } else if (difference > 0) {
            differenceText = `+${absoluteDifference}`;
            differenceClass = "slower";
          } else {
            differenceText = "±00:00:00.00";
          }
        }

        return `
          <tr>
            <td class="lap-number">${lap.number}</td>
            <td class="lap-duration">${formatTime(lap.duration)}</td>
            <td>${formatTime(lap.total)}</td>
            <td class="lap-difference ${differenceClass}">${differenceText}</td>
          </tr>
        `;
      }).join("");

      lapSummary.textContent =
        `${laps.length} lap${laps.length === 1 ? "" : "s"} recorded`;
    }

    lapCountLabel.textContent =
      `${laps.length} lap${laps.length === 1 ? "" : "s"} recorded`;

    lapCountBadge.textContent = `${laps.length} Laps`;
  }

  function updateStatistics() {
    totalLapsElement.textContent = laps.length;

    if (laps.length === 0) {
      bestLapElement.textContent = "—";
      averageLapElement.textContent = "—";
      return;
    }

    const durations = laps.map(lap => lap.duration);
    const bestLap = Math.min(...durations);
    const averageLap =
      durations.reduce((sum, duration) => sum + duration, 0) / durations.length;

    bestLapElement.textContent = formatTime(bestLap);
    averageLapElement.textContent = formatTime(averageLap);
  }

  // Button interactions
  startButton.addEventListener("click", startStopwatch);
  pauseButton.addEventListener("click", pauseStopwatch);
  lapButton.addEventListener("click", recordLap);
  resetButton.addEventListener("click", resetStopwatch);
  resetAllButton.addEventListener("click", resetAll);
  clearLapsButton.addEventListener("click", clearLaps);

  // Keyboard shortcuts. Ignore shortcuts while typing in form controls.
  document.addEventListener("keydown", event => {
    const target = event.target;
    const isTyping =
      target instanceof HTMLElement &&
      (target.isContentEditable ||
        ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));

    if (isTyping || event.ctrlKey || event.metaKey || event.altKey) return;

    if (event.code === "Space") {
      event.preventDefault();

      if (running) {
        pauseStopwatch();
      } else {
        startStopwatch();
      }
    } else if (event.key.toLowerCase() === "l") {
      recordLap();
    } else if (event.key.toLowerCase() === "r") {
      resetStopwatch();
    } else if (event.key === "Escape") {
      clearLaps();
    }
  });

  // Light / dark theme toggle
  themeToggle.addEventListener("click", () => {
    const isDark = document.body.classList.toggle("dark-theme");
    themeToggle.textContent = isDark ? "☀" : "☾";
    themeToggle.setAttribute(
      "aria-label",
      isDark ? "Switch to light theme" : "Switch to dark theme"
    );
  });

  // Keep navigation highlights aligned with visible sections.
  const navLinks = document.querySelectorAll(".nav-link");
  const sections = document.querySelectorAll("#stopwatch, #laps, #statistics");

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(entries => {
      const visibleEntries = entries
        .filter(entry => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

      if (visibleEntries.length > 0) {
        const currentId = visibleEntries[0].target.id;

        navLinks.forEach(link => {
          link.classList.toggle(
            "active",
            link.getAttribute("href") === `#${currentId}`
          );
        });
      }
    }, { threshold: [0.2, 0.5, 0.75] });

    sections.forEach(section => observer.observe(section));
  }

  // Initial state
  updateTimerDisplay();
  renderLaps();
  updateStatistics();
  updateControls();
});
