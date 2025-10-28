// -----------------------------
// Improved Graph Plotter
// -----------------------------

let canvas, ctx;
let functions = [''];
const colors = ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F', '#DB4545', '#D2BA4C', '#964325', '#944454', '#13343B'];
let xMin = -10, xMax = 10, yMin = -10, yMax = 10;
let showGrid = true;

// DOM Elements
const graphCanvas = document.getElementById('graphCanvas');
const functionInputs = document.getElementById('functionInputs');
const addFunctionBtn = document.getElementById('addFunction');
const plotGraphBtn = document.getElementById('plotGraph');
const resetGraphBtn = document.getElementById('resetGraph');
const showGridCheckbox = document.getElementById('showGrid');
const xMinInput = document.getElementById('xMin');
const xMaxInput = document.getElementById('xMax');
const yMinInput = document.getElementById('yMin');
const yMaxInput = document.getElementById('yMax');
const graphLegend = document.getElementById('graphLegend');

// Initialize
function initGraphPlotter() {
  canvas = graphCanvas;
  ctx = canvas.getContext('2d');
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  addFunctionBtn.addEventListener('click', addFunctionInput);
  plotGraphBtn.addEventListener('click', plotGraph);
  resetGraphBtn.addEventListener('click', resetGraph);
  showGridCheckbox.addEventListener('change', () => {
    showGrid = showGridCheckbox.checked;
    plotGraph();
  });

  [xMinInput, xMaxInput, yMinInput, yMaxInput].forEach(inp => inp.addEventListener('change', updateRanges));

  setupRemoveButtons();
  drawAxes();
}

// Resize canvas
function resizeCanvas() {
  const container = canvas.parentElement;
  const size = Math.min(container.clientWidth - 32, 800);
  canvas.width = size;
  canvas.height = size;
  if (ctx) plotGraph();
}

// Add new input
function addFunctionInput() {
  if (functions.length >= 5) {
    alert('Maximum 5 functions allowed');
    return;
  }

  const index = functions.length;
  functions.push('');

  const group = document.createElement('div');
  group.className = 'function-input-group';
  group.innerHTML = `
    <input type="text" class="form-control function-input" placeholder="e.g., x^2, sin(x), x^3-2*x" data-index="${index}">
    <div class="color-indicator" style="background-color: ${colors[index % colors.length]};"></div>
    <button class="btn-remove" data-index="${index}">×</button>
  `;

  functionInputs.appendChild(group);
  setupRemoveButtons();
}

// Setup remove buttons
function setupRemoveButtons() {
  document.querySelectorAll('.btn-remove').forEach(btn => {
    btn.onclick = (e) => {
      const index = parseInt(e.target.dataset.index);
      if (functions.length === 1) {
        alert('At least one function input is required');
        return;
      }
      functions.splice(index, 1);
      e.target.closest('.function-input-group').remove();
      updateFunctionIndices();
      plotGraph();
    };
  });
}

// Update indices after removal
function updateFunctionIndices() {
  document.querySelectorAll('.function-input').forEach((input, i) => {
    input.dataset.index = i;
  });
}

// Update graph ranges
function updateRanges() {
  xMin = parseFloat(xMinInput.value);
  xMax = parseFloat(xMaxInput.value);
  yMin = parseFloat(yMinInput.value);
  yMax = parseFloat(yMaxInput.value);
  plotGraph();
}

// Main plot function
function plotGraph() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  if (showGrid) drawGrid();
  drawAxes();

  const inputs = document.querySelectorAll('.function-input');
  functions = Array.from(inputs).map(input => input.value.trim());

  functions.forEach((func, index) => {
    if (func) plotFunction(func, colors[index % colors.length]);
  });

  updateLegend();
}

// Draw grid
function drawGrid() {
  ctx.strokeStyle = 'rgba(255,255,255,0.1)';
  ctx.lineWidth = 1;

  const xStep = niceStep((xMax - xMin) / 10);
  const yStep = niceStep((yMax - yMin) / 10);

  for (let x = Math.ceil(xMin / xStep) * xStep; x <= xMax; x += xStep) {
    const canvasX = mapX(x);
    ctx.beginPath();
    ctx.moveTo(canvasX, 0);
    ctx.lineTo(canvasX, canvas.height);
    ctx.stroke();
  }

  for (let y = Math.ceil(yMin / yStep) * yStep; y <= yMax; y += yStep) {
    const canvasY = mapY(y);
    ctx.beginPath();
    ctx.moveTo(0, canvasY);
    ctx.lineTo(canvas.width, canvasY);
    ctx.stroke();
  }
}

// Draw axes
function drawAxes() {
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;

  const yZero = mapY(0);
  if (yZero >= 0 && yZero <= canvas.height) {
    ctx.beginPath();
    ctx.moveTo(0, yZero);
    ctx.lineTo(canvas.width, yZero);
    ctx.stroke();
    drawLabels('x', yZero, true);
  }

  const xZero = mapX(0);
  if (xZero >= 0 && xZero <= canvas.width) {
    ctx.beginPath();
    ctx.moveTo(xZero, 0);
    ctx.lineTo(xZero, canvas.height);
    ctx.stroke();
    drawLabels('y', xZero, false);
  }
}

// Draw axis labels
function drawLabels(axis, base, isX) {
  ctx.fillStyle = '#ffffff';
  ctx.font = '12px Arial';
  ctx.textAlign = 'center';

  const step = (isX ? (xMax - xMin) : (yMax - yMin)) / 5;
  for (let v = isX ? xMin : yMin; v <= (isX ? xMax : yMax); v += step) {
    const pos = isX ? mapX(v) : mapY(v);
    if (Math.abs(v) < 0.001) continue;

    if (isX) ctx.fillText(v.toFixed(1), pos, base + 16);
    else ctx.fillText(v.toFixed(1), base - 10, pos + 4);
  }
}

// Plot function
function plotFunction(expression, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();

  let started = false;
  const step = (xMax - xMin) / canvas.width;

  for (let x = xMin; x <= xMax; x += step) {
    try {
      const y = evaluateExpression(expression, x);
      if (!isFinite(y)) { started = false; continue; }

      const cx = mapX(x);
      const cy = mapY(y);

      if (!started) {
        ctx.moveTo(cx, cy);
        started = true;
      } else {
        ctx.lineTo(cx, cy);
      }
    } catch {
      started = false;
    }
  }

  ctx.stroke();
}

// Evaluate math expression safely
function evaluateExpression(expr, x) {
  let safeExpr = expr
    .replace(/\^/g, '**')
    .replace(/sin\(/g, 'Math.sin(')
    .replace(/cos\(/g, 'Math.cos(')
    .replace(/tan\(/g, 'Math.tan(')
    .replace(/asin\(/g, 'Math.asin(')
    .replace(/acos\(/g, 'Math.acos(')
    .replace(/atan\(/g, 'Math.atan(')
    .replace(/sqrt\(/g, 'Math.sqrt(')
    .replace(/cbrt\(/g, 'Math.cbrt(')
    .replace(/log\(/g, 'Math.log10(')
    .replace(/ln\(/g, 'Math.log(')
    .replace(/exp\(/g, 'Math.exp(')
    .replace(/abs\(/g, 'Math.abs(')
    .replace(/pi/g, 'Math.PI')
    .replace(/e(?![a-z])/g, 'Math.E');

  safeExpr = implicitMultiplication(safeExpr);
  safeExpr = safeExpr.replace(/x/g, `(${x})`);

  return eval(safeExpr);
}

// Implicit multiplication handling (2x, 3sin(x), etc.)
function implicitMultiplication(expr) {
  return expr
    .replace(/(\d)([a-zA-Z(])/g, '$1*$2')
    .replace(/([a-zA-Z)])(\d)/g, '$1*$2')
    .replace(/([)])([(a-zA-Z0-9])/g, '$1*$2');
}

// Nice grid step rounding
function niceStep(step) {
  const exp = Math.floor(Math.log10(step));
  const frac = step / Math.pow(10, exp);
  let niceFrac;
  if (frac < 1.5) niceFrac = 1;
  else if (frac < 3) niceFrac = 2;
  else if (frac < 7) niceFrac = 5;
  else niceFrac = 10;
  return niceFrac * Math.pow(10, exp);
}

// Coordinate mapping
function mapX(x) { return ((x - xMin) / (xMax - xMin)) * canvas.width; }
function mapY(y) { return canvas.height - ((y - yMin) / (yMax - yMin)) * canvas.height; }

// Legend
function updateLegend() {
  graphLegend.innerHTML = '';
  functions.forEach((func, i) => {
    if (func) {
      const item = document.createElement('div');
      item.className = 'legend-item';
      item.innerHTML = `
        <div class="legend-color" style="background-color: ${colors[i % colors.length]};"></div>
        <div class="legend-text">${func}</div>
      `;
      graphLegend.appendChild(item);
    }
  });
}

// Reset graph
function resetGraph() {
  xMinInput.value = -10;
  xMaxInput.value = 10;
  yMinInput.value = -10;
  yMaxInput.value = 10;
  updateRanges();

  const inputs = document.querySelectorAll('.function-input');
  inputs.forEach((input, i) => {
    if (i === 0) input.value = '';
    else input.closest('.function-input-group').remove();
  });
  functions = [''];
  plotGraph();
}

// Initialize
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initGraphPlotter);
else initGraphPlotter();
