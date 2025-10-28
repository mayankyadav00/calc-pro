// Graph Plotter
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

// Initialize Graph Plotter
function initGraphPlotter() {
  canvas = graphCanvas;
  ctx = canvas.getContext('2d');
  
  // Set canvas size
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  
  // Event listeners
  addFunctionBtn.addEventListener('click', addFunctionInput);
  plotGraphBtn.addEventListener('click', plotGraph);
  resetGraphBtn.addEventListener('click', resetGraph);
  showGridCheckbox.addEventListener('change', () => {
    showGrid = showGridCheckbox.checked;
    plotGraph();
  });
  
  // Range inputs
  xMinInput.addEventListener('change', updateRanges);
  xMaxInput.addEventListener('change', updateRanges);
  yMinInput.addEventListener('change', updateRanges);
  yMaxInput.addEventListener('change', updateRanges);
  
  // Setup remove buttons
  setupRemoveButtons();
  
  // Initial plot
  drawAxes();
}

// Resize Canvas
function resizeCanvas() {
  const container = canvas.parentElement;
  const size = Math.min(container.clientWidth - 32, 800);
  canvas.width = size;
  canvas.height = size;
  if (ctx) plotGraph();
}

// Add Function Input
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

// Setup Remove Buttons
function setupRemoveButtons() {
  document.querySelectorAll('.btn-remove').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const index = parseInt(e.target.dataset.index);
      if (functions.length === 1) {
        alert('At least one function input is required');
        return;
      }
      functions.splice(index, 1);
      e.target.closest('.function-input-group').remove();
      updateFunctionIndices();
    });
  });
}

// Update Function Indices
function updateFunctionIndices() {
  const inputs = document.querySelectorAll('.function-input');
  inputs.forEach((input, i) => {
    input.dataset.index = i;
  });
}

// Update Ranges
function updateRanges() {
  xMin = parseFloat(xMinInput.value);
  xMax = parseFloat(xMaxInput.value);
  yMin = parseFloat(yMinInput.value);
  yMax = parseFloat(yMaxInput.value);
  plotGraph();
}

// Plot Graph
function plotGraph() {
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Draw grid and axes
  if (showGrid) drawGrid();
  drawAxes();
  
  // Get function expressions
  const inputs = document.querySelectorAll('.function-input');
  functions = Array.from(inputs).map(input => input.value.trim());
  
  // Plot each function
  functions.forEach((func, index) => {
    if (func) {
      plotFunction(func, colors[index % colors.length]);
    }
  });
  
  // Update legend
  updateLegend();
}

// Draw Grid
function drawGrid() {
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.lineWidth = 1;
  
  const xStep = (xMax - xMin) / 10;
  const yStep = (yMax - yMin) / 10;
  
  // Vertical lines
  for (let x = xMin; x <= xMax; x += xStep) {
    const canvasX = mapX(x);
    ctx.beginPath();
    ctx.moveTo(canvasX, 0);
    ctx.lineTo(canvasX, canvas.height);
    ctx.stroke();
  }
  
  // Horizontal lines
  for (let y = yMin; y <= yMax; y += yStep) {
    const canvasY = mapY(y);
    ctx.beginPath();
    ctx.moveTo(0, canvasY);
    ctx.lineTo(canvas.width, canvasY);
    ctx.stroke();
  }
}

// Draw Axes
function drawAxes() {
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  
  // X-axis
  const yZero = mapY(0);
  if (yZero >= 0 && yZero <= canvas.height) {
    ctx.beginPath();
    ctx.moveTo(0, yZero);
    ctx.lineTo(canvas.width, yZero);
    ctx.stroke();
    
    // X-axis labels
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    const xStep = (xMax - xMin) / 5;
    for (let x = xMin; x <= xMax; x += xStep) {
      const canvasX = mapX(x);
      if (Math.abs(x) > 0.01) {
        ctx.fillText(x.toFixed(1), canvasX, yZero + 20);
      }
    }
  }
  
  // Y-axis
  const xZero = mapX(0);
  if (xZero >= 0 && xZero <= canvas.width) {
    ctx.beginPath();
    ctx.moveTo(xZero, 0);
    ctx.lineTo(xZero, canvas.height);
    ctx.stroke();
    
    // Y-axis labels
    ctx.textAlign = 'right';
    const yStep = (yMax - yMin) / 5;
    for (let y = yMin; y <= yMax; y += yStep) {
      const canvasY = mapY(y);
      if (Math.abs(y) > 0.01) {
        ctx.fillText(y.toFixed(1), xZero - 10, canvasY + 4);
      }
    }
  }
}

// Plot Function
function plotFunction(expression, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  
  let started = false;
  const step = (xMax - xMin) / canvas.width;
  
  for (let x = xMin; x <= xMax; x += step) {
    try {
      const y = evaluateExpression(expression, x);
      
      if (isNaN(y) || !isFinite(y)) continue;
      
      const canvasX = mapX(x);
      const canvasY = mapY(y);
      
      if (canvasY < -100 || canvasY > canvas.height + 100) continue;
      
      if (!started) {
        ctx.moveTo(canvasX, canvasY);
        started = true;
      } else {
        ctx.lineTo(canvasX, canvasY);
      }
    } catch (e) {
      started = false;
    }
  }
  
  ctx.stroke();
}

// Evaluate Expression
function evaluateExpression(expr, x) {
  let evalExpr = expr
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
    .replace(/e(?![a-z])/g, 'Math.E')
    .replace(/x/g, `(${x})`);
  
  return eval(evalExpr);
}

// Map X coordinate
function mapX(x) {
  return ((x - xMin) / (xMax - xMin)) * canvas.width;
}

// Map Y coordinate
function mapY(y) {
  return canvas.height - ((y - yMin) / (yMax - yMin)) * canvas.height;
}

// Update Legend
function updateLegend() {
  graphLegend.innerHTML = '';
  functions.forEach((func, index) => {
    if (func) {
      const item = document.createElement('div');
      item.className = 'legend-item';
      item.innerHTML = `
        <div class="legend-color" style="background-color: ${colors[index % colors.length]};"></div>
        <div class="legend-text">${func}</div>
      `;
      graphLegend.appendChild(item);
    }
  });
}

// Reset Graph
function resetGraph() {
  xMinInput.value = -10;
  xMaxInput.value = 10;
  yMinInput.value = -10;
  yMaxInput.value = 10;
  updateRanges();
  
  // Clear all function inputs except first
  const inputs = document.querySelectorAll('.function-input');
  inputs.forEach((input, i) => {
    if (i === 0) {
      input.value = '';
    } else {
      input.closest('.function-input-group').remove();
    }
  });
  functions = [''];
  
  plotGraph();
}

// Initialize when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initGraphPlotter);
} else {
  initGraphPlotter();
}