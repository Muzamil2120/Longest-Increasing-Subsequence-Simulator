// Add event listener for Enter key
document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("arrayInput");
  if (input) {
    input.addEventListener("keypress", function(event) {
      if (event.key === "Enter") {
        event.preventDefault();
        runOptimized();
      }
    });
  }
});

function getInputArray() {
  const input = document.getElementById("arrayInput");
  const output = document.getElementById("output");
  const rawValue = input.value.trim();

  // Reset output state
  output.innerHTML = "Run an algorithm to see the result here...";
  output.classList.remove("error");

  if (!rawValue) {
    showError("Please enter a sequence.");
    return null;
  }

  // Normalize separators: replace commas with spaces, then split by whitespace
  const parts = rawValue.replace(/,/g, ' ').split(/\s+/).filter(p => p !== '');

  // Validation pass
  for (const part of parts) {
    // Check for excessively long NUMBERS (likely missing separators)
    if (/^-?\d+$/.test(part) && part.length > 6) {
       showError(`The number "${part}" is too long. Please ensure there is a separation between every number.`);
       return null;
    }
  }

  // Type detection
  const allNumbers = parts.every(part => !isNaN(Number(part)) && part.trim() !== '');

  let finalArray;
  if (allNumbers) {
    finalArray = parts.map(Number);
  } else {
    finalArray = parts;
  }

  if (finalArray.length === 0) {
    showError("Please enter at least one item.");
    return null;
  }

  return finalArray;
}

function showError(message) {
  const output = document.getElementById("output");
  output.innerHTML = `⚠️ ${message}`;
  output.classList.add("error");
}

function runDP() {
  let arr = getInputArray();
  if (!arr) return;

  let start = performance.now();
  let result = LIS_DP(arr);
  let end = performance.now();
  let timeTaken = (end - start).toFixed(4);

  const output = document.getElementById("output");
  output.innerHTML = `
    <strong>Longest Increasing Subsequence:</strong> ${result}<br>
    <span style="font-size: 0.9em; color: #718096;">Time: ${timeTaken} ms</span>
  `;

  addToHistory("O(n²)", arr, result, timeTaken);
}

function runOptimized() {
  let arr = getInputArray();
  if (!arr) return;

  let start = performance.now();
  let result = LIS_Optimized(arr);
  let end = performance.now();
  let timeTaken = (end - start).toFixed(4);

  const output = document.getElementById("output");
  output.innerHTML = `
    <strong>Longest Increasing Subsequence:</strong> ${result}<br>
    <span style="font-size: 0.9em; color: #718096;">Time: ${timeTaken} ms</span>
  `;

  addToHistory("O(n log n)", arr, result, timeTaken);
}

// --- New Features ---

function generateRandomInput() {
  const size = Math.floor(Math.random() * 15) + 5; // 5 to 20 items
  const arr = [];
  for (let i = 0; i < size; i++) {
    arr.push(Math.floor(Math.random() * 100));
  }
  document.getElementById("arrayInput").value = arr.join(" ");
  // Clear previous output
  document.getElementById("output").innerHTML = "Run an algorithm to see the result here...";
  document.getElementById("output").classList.remove("error");
}

function addToHistory(algo, input, result, time) {
  const list = document.getElementById("historyList");
  const item = document.createElement("li");
  
  // Truncate long inputs for display
  let inputStr = input.join(", ");
  if (inputStr.length > 20) inputStr = inputStr.substring(0, 20) + "...";

  item.innerHTML = `
    <strong>${algo}</strong>: Input [${inputStr}] 
    <br>Result: ${result} <span style="color:#888">(${time}ms)</span>
  `;
  
  // Add to top
  list.insertBefore(item, list.firstChild);
  
  // Keep only last 5
  if (list.children.length > 5) {
    list.removeChild(list.lastChild);
  }
}

function toggleTheory() {
  const content = document.getElementById("theoryContent");
  if (content.classList.contains("hidden")) {
    content.classList.remove("hidden");
  } else {
    content.classList.add("hidden");
  }
}

// --- Performance Comparison Graph ---

function generateRandomArray(size) {
  const arr = new Array(size);
  for (let i = 0; i < size; i++) {
    arr[i] = Math.floor(Math.random() * 10000);
  }
  return arr;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function formatMs(ms) {
  return `${ms.toFixed(3)} ms`;
}

async function comparePerformance() {
  const sizes = [100, 1000, 10000];
  const dpMaxSize = 2000; // prevent browser freeze

  const compareBtn = document.getElementById("compareBtn");
  const statusEl = document.getElementById("perfStatus");
  const canvas = document.getElementById("perfChart");

  if (!canvas || !statusEl) return;

  if (compareBtn) {
    compareBtn.disabled = true;
    compareBtn.style.opacity = "0.7";
    compareBtn.style.cursor = "not-allowed";
  }

  statusEl.textContent = "Running benchmarks…";

  const dpTimes = [];
  const optTimes = [];
  let skippedDp = false;

  for (const n of sizes) {
    statusEl.textContent = `Benchmarking n = ${n}…`;
    await sleep(0);

    const arr = generateRandomArray(n);

    // Optimized O(n log n)
    let start = performance.now();
    LIS_Optimized(arr);
    let end = performance.now();
    optTimes.push(end - start);

    // DP O(n^2) (skip very large sizes to avoid freezing)
    if (n > dpMaxSize) {
      dpTimes.push(null);
      skippedDp = true;
    } else {
      start = performance.now();
      LIS_DP(arr);
      end = performance.now();
      dpTimes.push(end - start);
    }
  }

  drawPerformanceChart(canvas, sizes, dpTimes, optTimes);

  if (skippedDp) {
    statusEl.textContent = `Done. DP is skipped for n > ${dpMaxSize} to prevent the page from freezing.`;
  } else {
    statusEl.textContent = "Done.";
  }

  if (compareBtn) {
    compareBtn.disabled = false;
    compareBtn.style.opacity = "1";
    compareBtn.style.cursor = "pointer";
  }
}

function drawPerformanceChart(canvas, sizes, dpTimes, optTimes) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;

  // Make canvas crisp on HiDPI displays
  const cssWidth = Math.max(320, Math.floor(rect.width || 520));
  const cssHeight = Math.max(220, Math.floor(rect.height || 260));
  canvas.width = Math.floor(cssWidth * dpr);
  canvas.height = Math.floor(cssHeight * dpr);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(dpr, dpr);

  const width = cssWidth;
  const height = cssHeight;

  ctx.lineJoin = "round";
  ctx.lineCap = "round";

  // Background
  ctx.clearRect(0, 0, width, height);
  const bg = ctx.createLinearGradient(0, 0, 0, height);
  bg.addColorStop(0, "#ffffff");
  bg.addColorStop(1, "#fbfdff");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  // More padding so axis labels don't get clipped at corners
  const padding = { left: 76, right: 32, top: 30, bottom: 58 };
  const plotW = width - padding.left - padding.right;
  const plotH = height - padding.top - padding.bottom;

  const allTimes = [...dpTimes.filter(t => t != null), ...optTimes];
  const maxTime = Math.max(1, ...allTimes);
  const yMax = maxTime * 1.15;

  const xForIndex = (i) => padding.left + (plotW * i) / Math.max(1, sizes.length - 1);
  const yForValue = (v) => padding.top + plotH - (plotH * v) / yMax;

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  const drawClampedText = (text, x, y, minX, maxX) => {
    const w = ctx.measureText(text).width;
    const cx = clamp(x, minX, maxX - w);
    ctx.fillText(text, cx, y);
  };

  // Axes/grid
  ctx.strokeStyle = "#e2e8f0";
  ctx.lineWidth = 1;

  // Grid + Y labels
  const ticks = 5;
  ctx.font = "12px Poppins, sans-serif";
  ctx.fillStyle = "#718096";

  for (let t = 0; t <= ticks; t++) {
    const val = (yMax * t) / ticks;
    const y = yForValue(val);
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(width - padding.right, y);
    ctx.stroke();

    // Clamp Y label so it never clips at top/bottom
    const label = formatMs(val);
    const labelY = clamp(y + 4, 12, height - padding.bottom + 12);
    drawClampedText(label, 8, labelY, 4, padding.left - 8);
  }

  // X labels
  for (let i = 0; i < sizes.length; i++) {
    const x = xForIndex(i);
    const label = String(sizes[i]);
    const labelW = ctx.measureText(label).width;
    // Center under tick but clamp inside canvas
    const desiredX = x - labelW / 2;
    drawClampedText(label, desiredX, height - 22, 4, width - 4);
  }

  // Axis titles
  ctx.fillStyle = "#4a5568";
  ctx.font = "600 12px Poppins, sans-serif";
  drawClampedText("Input Size (n)", padding.left + plotW / 2 - 60, height - 8, 4, width - 4);
  ctx.save();
  ctx.translate(14, padding.top + plotH / 2 + 28);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText("Time (ms)", 0, 0);
  ctx.restore();

  // Lines + subtle filled area
  const drawSeries = (times, strokeColor, fillColor) => {
    const points = [];
    for (let i = 0; i < sizes.length; i++) {
      const v = times[i];
      if (v == null) continue;
      points.push({ x: xForIndex(i), y: yForValue(v), v });
    }
    if (points.length === 0) return;

    // Fill under curve
    ctx.beginPath();
    ctx.moveTo(points[0].x, padding.top + plotH);
    for (const p of points) ctx.lineTo(p.x, p.y);
    ctx.lineTo(points[points.length - 1].x, padding.top + plotH);
    ctx.closePath();
    ctx.fillStyle = fillColor;
    ctx.fill();

    // Stroke
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y);
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Points + value labels
    for (const p of points) {
      ctx.beginPath();
      ctx.fillStyle = strokeColor;
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#718096";
      ctx.font = "11px Poppins, sans-serif";
      const vLabel = p.v.toFixed(2);
      // Place label near point but clamp within canvas bounds
      const desiredX = p.x + 6;
      const desiredY = p.y - 8;
      const clampedY = clamp(desiredY, 14, height - padding.bottom - 6);
      drawClampedText(vLabel, desiredX, clampedY, padding.left + 2, width - padding.right - 2);
    }
  };

  drawSeries(dpTimes, "#e53e3e", "rgba(229, 62, 62, 0.10)");
  drawSeries(optTimes, "#38a169", "rgba(56, 161, 105, 0.10)");

  // Legend
  const legendY = padding.top + 6;
  const legendX = padding.left;
  ctx.font = "12px Poppins, sans-serif";
  ctx.fillStyle = "#2d3748";

  ctx.fillStyle = "#e53e3e";
  ctx.fillRect(legendX, legendY, 10, 10);
  ctx.fillStyle = "#2d3748";
  ctx.fillText("DP O(n²)", legendX + 14, legendY + 10);

  ctx.fillStyle = "#38a169";
  ctx.fillRect(legendX + 95, legendY, 10, 10);
  ctx.fillStyle = "#2d3748";
  ctx.fillText("Optimized O(n log n)", legendX + 109, legendY + 10);
}
