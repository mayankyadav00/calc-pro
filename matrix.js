// Matrix Calculator
let matrixA = [];
let matrixB = [];

// DOM Elements
const matrixARowsInput = document.getElementById('matrixARows');
const matrixAColsInput = document.getElementById('matrixACols');
const matrixBRowsInput = document.getElementById('matrixBRows');
const matrixBColsInput = document.getElementById('matrixBCols');
const generateMatricesBtn = document.getElementById('generateMatrices');
const matrixAInput = document.getElementById('matrixAInput');
const matrixBInput = document.getElementById('matrixBInput');
const matrixResultDisplay = document.getElementById('matrixResultDisplay');
const matrixOperationBtns = document.querySelectorAll('.matrix-operations .btn--secondary');

// Initialize Matrix Calculator
function initMatrixCalculator() {
  generateMatricesBtn.addEventListener('click', generateMatrixInputs);
  
  matrixOperationBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const operation = btn.dataset.op;
      performMatrixOperation(operation);
    });
  });
  
  // Generate initial matrices
  generateMatrixInputs();
}

// Generate Matrix Inputs
function generateMatrixInputs() {
  const aRows = parseInt(matrixARowsInput.value);
  const aCols = parseInt(matrixAColsInput.value);
  const bRows = parseInt(matrixBRowsInput.value);
  const bCols = parseInt(matrixBColsInput.value);
  
  matrixA = createEmptyMatrix(aRows, aCols);
  matrixB = createEmptyMatrix(bRows, bCols);
  
  renderMatrixInput(matrixA, matrixAInput, 'A');
  renderMatrixInput(matrixB, matrixBInput, 'B');
}

// Create Empty Matrix
function createEmptyMatrix(rows, cols) {
  return Array(rows).fill(0).map(() => Array(cols).fill(0));
}

// Render Matrix Input
function renderMatrixInput(matrix, container, name) {
  container.innerHTML = '';
  container.style.gridTemplateColumns = `repeat(${matrix[0].length}, 60px)`;
  
  matrix.forEach((row, i) => {
    row.forEach((val, j) => {
      const input = document.createElement('input');
      input.type = 'number';
      input.value = val;
      input.dataset.matrix = name;
      input.dataset.row = i;
      input.dataset.col = j;
      input.addEventListener('input', updateMatrixValue);
      container.appendChild(input);
    });
  });
}

// Update Matrix Value
function updateMatrixValue(e) {
  const matrix = e.target.dataset.matrix;
  const row = parseInt(e.target.dataset.row);
  const col = parseInt(e.target.dataset.col);
  const value = parseFloat(e.target.value) || 0;
  
  if (matrix === 'A') {
    matrixA[row][col] = value;
  } else {
    matrixB[row][col] = value;
  }
}

// Perform Matrix Operation
function performMatrixOperation(operation) {
  try {
    let result;
    
    switch(operation) {
      case 'add':
        result = addMatrices(matrixA, matrixB);
        break;
      case 'subtract':
        result = subtractMatrices(matrixA, matrixB);
        break;
      case 'multiply':
        result = multiplyMatrices(matrixA, matrixB);
        break;
      case 'transposeA':
        result = transposeMatrix(matrixA);
        break;
      case 'transposeB':
        result = transposeMatrix(matrixB);
        break;
      case 'determinantA':
        result = calculateDeterminant(matrixA);
        break;
      case 'determinantB':
        result = calculateDeterminant(matrixB);
        break;
      case 'inverseA':
        result = invertMatrix(matrixA);
        break;
      case 'inverseB':
        result = invertMatrix(matrixB);
        break;
    }
    
    displayMatrixResult(result);
  } catch (error) {
    matrixResultDisplay.innerHTML = `<div class="error">Error: ${error.message}</div>`;
  }
}

// Add Matrices
function addMatrices(a, b) {
  if (a.length !== b.length || a[0].length !== b[0].length) {
    throw new Error('Matrices must have same dimensions');
  }
  
  return a.map((row, i) => row.map((val, j) => val + b[i][j]));
}

// Subtract Matrices
function subtractMatrices(a, b) {
  if (a.length !== b.length || a[0].length !== b[0].length) {
    throw new Error('Matrices must have same dimensions');
  }
  
  return a.map((row, i) => row.map((val, j) => val - b[i][j]));
}

// Multiply Matrices
function multiplyMatrices(a, b) {
  if (a[0].length !== b.length) {
    throw new Error('Number of columns in A must equal number of rows in B');
  }
  
  const result = createEmptyMatrix(a.length, b[0].length);
  
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b[0].length; j++) {
      let sum = 0;
      for (let k = 0; k < b.length; k++) {
        sum += a[i][k] * b[k][j];
      }
      result[i][j] = sum;
    }
  }
  
  return result;
}

// Transpose Matrix
function transposeMatrix(matrix) {
  return matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex]));
}

// Calculate Determinant
function calculateDeterminant(matrix) {
  if (matrix.length !== matrix[0].length) {
    throw new Error('Matrix must be square');
  }
  
  const n = matrix.length;
  
  if (n === 1) return matrix[0][0];
  if (n === 2) return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
  
  let det = 0;
  for (let j = 0; j < n; j++) {
    det += Math.pow(-1, j) * matrix[0][j] * calculateDeterminant(getMinor(matrix, 0, j));
  }
  
  return det;
}

// Get Minor Matrix
function getMinor(matrix, row, col) {
  return matrix
    .filter((_, i) => i !== row)
    .map(r => r.filter((_, j) => j !== col));
}

// Invert Matrix
function invertMatrix(matrix) {
  if (matrix.length !== matrix[0].length) {
    throw new Error('Matrix must be square');
  }
  
  const det = calculateDeterminant(matrix);
  if (Math.abs(det) < 1e-10) {
    throw new Error('Matrix is singular (determinant is zero)');
  }
  
  const n = matrix.length;
  const adjugate = createEmptyMatrix(n, n);
  
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const minor = getMinor(matrix, i, j);
      adjugate[j][i] = Math.pow(-1, i + j) * calculateDeterminant(minor);
    }
  }
  
  return adjugate.map(row => row.map(val => val / det));
}

// Display Matrix Result
function displayMatrixResult(result) {
  if (typeof result === 'number') {
    matrixResultDisplay.innerHTML = `<div class="success">${result.toFixed(4)}</div>`;
  } else {
    let html = '<table style="border-collapse: collapse;">';
    result.forEach(row => {
      html += '<tr>';
      row.forEach(val => {
        html += `<td style="padding: 8px; text-align: center; border: 1px solid var(--color-border);">${val.toFixed(2)}</td>`;
      });
      html += '</tr>';
    });
    html += '</table>';
    matrixResultDisplay.innerHTML = html;
  }
}

// Initialize when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMatrixCalculator);
} else {
  initMatrixCalculator();
}