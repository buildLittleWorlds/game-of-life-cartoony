import { countPopulation, createBoard, nextGeneration, setCell } from "./life.js";

const COLUMNS = 64;
const ROWS = 40;
const DEFAULT_SPEED = 8;

const canvas = document.querySelector("#life-canvas");
const context = canvas.getContext("2d", { alpha: false });
const playButton = document.querySelector("#play-button");
const playIcon = document.querySelector("#play-icon");
const playLabel = document.querySelector("#play-label");
const stepButton = document.querySelector("#step-button");
const clearButton = document.querySelector("#clear-button");
const speedSlider = document.querySelector("#speed-slider");
const speedOutput = document.querySelector("#speed-output");
const generationCount = document.querySelector("#generation-count");
const populationCount = document.querySelector("#population-count");
const announcement = document.querySelector("#announcement");

let board = createBoard(COLUMNS, ROWS);
let generation = 0;
let speed = DEFAULT_SPEED;
let isRunning = false;
let isDrawing = false;
let drawValue = 1;
let previousDrawIndex = -1;
let cursorX = Math.floor(COLUMNS / 2);
let cursorY = Math.floor(ROWS / 2);
let lastFrameTime = performance.now();
let accumulatedTime = 0;
let cssWidth = 1024;
let cssHeight = 640;
let pixelRatio = 1;
let boardBackground = document.createElement("canvas");

function roundedRectPath(target, x, y, width, height, radius) {
  const safeRadius = Math.min(radius, width / 2, height / 2);
  target.beginPath();
  target.roundRect(x, y, width, height, safeRadius);
}

function drawCell(target, x, y, alive, cellWidth, cellHeight) {
  const gap = Math.max(1, Math.min(cellWidth, cellHeight) * 0.11);
  const left = x * cellWidth + gap;
  const top = y * cellHeight + gap;
  const width = cellWidth - gap * 2;
  const height = cellHeight - gap * 2;
  const radius = Math.min(width, height) * 0.3;

  target.fillStyle = alive ? "#8f203d" : "#d4bc83";
  roundedRectPath(target, left, top + Math.max(1, height * 0.08), width, height, radius);
  target.fill();

  target.fillStyle = alive ? "#eb3155" : "#fff4cf";
  roundedRectPath(target, left, top, width, height * 0.91, radius);
  target.fill();

  target.fillStyle = alive ? "rgba(255,255,255,0.68)" : "rgba(255,255,255,0.62)";
  roundedRectPath(
    target,
    left + width * 0.18,
    top + height * 0.13,
    width * 0.5,
    Math.max(1, height * 0.12),
    height * 0.08,
  );
  target.fill();
}

function rebuildBackground() {
  boardBackground.width = canvas.width;
  boardBackground.height = canvas.height;
  const backgroundContext = boardBackground.getContext("2d", { alpha: false });
  backgroundContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  backgroundContext.fillStyle = "#e5cf9e";
  backgroundContext.fillRect(0, 0, cssWidth, cssHeight);

  const cellWidth = cssWidth / COLUMNS;
  const cellHeight = cssHeight / ROWS;
  for (let y = 0; y < ROWS; y += 1) {
    for (let x = 0; x < COLUMNS; x += 1) {
      drawCell(backgroundContext, x, y, false, cellWidth, cellHeight);
    }
  }
}

function resizeCanvas() {
  const bounds = canvas.getBoundingClientRect();
  cssWidth = bounds.width;
  cssHeight = bounds.height;
  pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(cssWidth * pixelRatio);
  canvas.height = Math.round(cssHeight * pixelRatio);
  rebuildBackground();
  render();
}

function render() {
  context.setTransform(1, 0, 0, 1, 0, 0);
  context.drawImage(boardBackground, 0, 0);
  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

  const cellWidth = cssWidth / COLUMNS;
  const cellHeight = cssHeight / ROWS;
  for (let y = 0; y < ROWS; y += 1) {
    for (let x = 0; x < COLUMNS; x += 1) {
      if (board[y * COLUMNS + x]) drawCell(context, x, y, true, cellWidth, cellHeight);
    }
  }

  if (document.activeElement === canvas) {
    const inset = Math.max(2, Math.min(cellWidth, cellHeight) * 0.08);
    context.strokeStyle = "#315eaa";
    context.lineWidth = Math.max(2, Math.min(cellWidth, cellHeight) * 0.12);
    context.strokeRect(
      cursorX * cellWidth + inset,
      cursorY * cellHeight + inset,
      cellWidth - inset * 2,
      cellHeight - inset * 2,
    );
  }
}

function updateCounters() {
  generationCount.textContent = String(generation);
  populationCount.textContent = String(countPopulation(board));
}

function announce(message) {
  announcement.textContent = "";
  window.setTimeout(() => {
    announcement.textContent = message;
  }, 20);
}

function setRunning(nextRunning, shouldAnnounce = true) {
  isRunning = nextRunning;
  accumulatedTime = 0;
  lastFrameTime = performance.now();
  playButton.classList.toggle("is-running", isRunning);
  playButton.setAttribute("aria-pressed", String(isRunning));
  playIcon.textContent = isRunning ? "❚❚" : "▶";
  playLabel.textContent = isRunning ? "Pause" : "Play";
  if (shouldAnnounce) announce(isRunning ? "Simulation playing." : "Simulation paused.");
}

function advanceGeneration() {
  board = nextGeneration(board, COLUMNS, ROWS);
  generation += 1;
  updateCounters();
  render();
}

function animationLoop(time) {
  const elapsed = Math.min(time - lastFrameTime, 250);
  lastFrameTime = time;

  if (isRunning) {
    accumulatedTime += elapsed;
    const stepLength = 1000 / speed;
    let steps = 0;
    while (accumulatedTime >= stepLength && steps < 5) {
      advanceGeneration();
      accumulatedTime -= stepLength;
      steps += 1;
    }
  }

  requestAnimationFrame(animationLoop);
}

function eventToCell(event) {
  const bounds = canvas.getBoundingClientRect();
  const x = Math.floor(((event.clientX - bounds.left) / bounds.width) * COLUMNS);
  const y = Math.floor(((event.clientY - bounds.top) / bounds.height) * ROWS);
  if (x < 0 || x >= COLUMNS || y < 0 || y >= ROWS) return null;
  return { x, y, index: y * COLUMNS + x };
}

function paintCell(cell) {
  if (!cell || cell.index === previousDrawIndex) return;
  setCell(board, COLUMNS, ROWS, cell.x, cell.y, drawValue);
  cursorX = cell.x;
  cursorY = cell.y;
  previousDrawIndex = cell.index;
  updateCounters();
  render();
}

playButton.addEventListener("click", () => setRunning(!isRunning));

stepButton.addEventListener("click", () => {
  if (isRunning) setRunning(false, false);
  advanceGeneration();
  announce(`Advanced to generation ${generation}.`);
});

clearButton.addEventListener("click", () => {
  setRunning(false, false);
  board = createBoard(COLUMNS, ROWS);
  generation = 0;
  updateCounters();
  render();
  announce("Board cleared. Generation zero.");
});

speedSlider.addEventListener("input", () => {
  speed = Number(speedSlider.value);
  speedOutput.value = String(speed);
});

speedSlider.addEventListener("change", () => announce(`Speed set to ${speed} generations per second.`));

canvas.addEventListener("pointerdown", (event) => {
  if (event.button !== 0) return;
  const cell = eventToCell(event);
  if (!cell) return;
  event.preventDefault();
  canvas.focus({ preventScroll: true });
  canvas.setPointerCapture(event.pointerId);
  isDrawing = true;
  previousDrawIndex = -1;
  drawValue = board[cell.index] ? 0 : 1;
  paintCell(cell);
});

canvas.addEventListener("pointermove", (event) => {
  if (!isDrawing) return;
  event.preventDefault();
  paintCell(eventToCell(event));
});

function stopDrawing(event) {
  if (!isDrawing) return;
  isDrawing = false;
  previousDrawIndex = -1;
  if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
}

canvas.addEventListener("pointerup", stopDrawing);
canvas.addEventListener("pointercancel", stopDrawing);

canvas.addEventListener("focus", render);
canvas.addEventListener("blur", render);

canvas.addEventListener("keydown", (event) => {
  const keyMoves = {
    ArrowLeft: [-1, 0],
    ArrowRight: [1, 0],
    ArrowUp: [0, -1],
    ArrowDown: [0, 1],
  };

  if (keyMoves[event.key]) {
    event.preventDefault();
    const [moveX, moveY] = keyMoves[event.key];
    cursorX = (cursorX + moveX + COLUMNS) % COLUMNS;
    cursorY = (cursorY + moveY + ROWS) % ROWS;
    render();
    return;
  }

  if (event.key === "Enter") {
    event.preventDefault();
    const index = cursorY * COLUMNS + cursorX;
    board[index] = board[index] ? 0 : 1;
    updateCounters();
    render();
    announce(`Cell column ${cursorX + 1}, row ${cursorY + 1} is ${board[index] ? "alive" : "dead"}.`);
    return;
  }

  if (event.key === " " || event.code === "Space") {
    event.preventDefault();
    setRunning(!isRunning);
  }
});

const resizeObserver = new ResizeObserver(resizeCanvas);
resizeObserver.observe(canvas);
updateCounters();
resizeCanvas();
requestAnimationFrame(animationLoop);
