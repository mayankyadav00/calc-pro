// Equations Solver
let numVariables = 2;

// DOM Elements
const numVariablesSelect = document.getElementById('numVariables');
const equationsInput = document.getElementById('equationsInput');
const solveEquationsBtn = document.getElementById('solveEquations');
const equationsResult = document.getElementById('equationsResult');

// Initialize Equations Solver
function initEquationsSolver() {
  numVariablesSelect.addEventListener('change', generateEquationInputs);
  solveEquationsBtn.addEventListener('click', solveEquations);
  
  // Generate initial inputs
  generateEquationInputs();
}

// Generate Equation Inputs
function generateEquationInputs() {
  numVariables = parseInt(numVariablesSelect.value);
  equationsInput.innerHTML = '';
  
  const variables = ['x', 'y', 'z', 'w', 'v'];
  
  for (let i = 0; i < numVariables; i++) {
    const row = document.createElement('div');
    row.className = 'equation-row';
    
    let html = '';
    for (let j = 0; j < numVariables; j++) {
      if (j > 0) html += '<span>+</span>';
      html += `<input type="number" step="any" placeholder="0" data-eq="${i}" data-var="${j}" class="form-control">`;
      html += `<span>${variables[j]}</span>`;
    }
    html += '<span>=</span>';
    html += `<input type="number" step="any" placeholder="0" data-eq="${i}" data-const="true" class="form-control">`;
    
    row.innerHTML = html;
    equationsInput.appendChild(row);
  }
}

// Solve Equations
function solveEquations() {
  try {
    const coefficients = [];
    const constants = [];
    
    // Gather coefficients and constants
    for (let i = 0; i < numVariables; i++) {
      const row = [];
      for (let j = 0; j < numVariables; j++) {
        const input = document.querySelector(`input[data-eq="${i}"][data-var="${j}"]`);
        row.push(parseFloat(input.value) || 0);
      }
      coefficients.push(row);
      
      const constInput = document.querySelector(`input[data-eq="${i}"][data-const="true"]`);
      constants.push(parseFloat(constInput.value) || 0);
    }
    
    // Solve using Gaussian elimination
    const solution = gaussianElimination(coefficients, constants);
    
    displaySolution(solution);
  } catch (error) {
    equationsResult.innerHTML = `<div class="error">Error: ${error.message}</div>`;
  }
}

// Gaussian Elimination
function gaussianElimination(coefficients, constants) {
  const n = coefficients.length;
  const augmented = coefficients.map((row, i) => [...row, constants[i]]);
  
  // Forward elimination
  for (let i = 0; i < n; i++) {
    // Find pivot
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(augmented[k][i]) > Math.abs(augmented[maxRow][i])) {
        maxRow = k;
      }
    }
    
    // Swap rows
    [augmented[i], augmented[maxRow]] = [augmented[maxRow], augmented[i]];
    
    // Check for singular matrix
    if (Math.abs(augmented[i][i]) < 1e-10) {
      throw new Error('System has no unique solution (singular matrix)');
    }
    
    // Eliminate column
    for (let k = i + 1; k < n; k++) {
      const factor = augmented[k][i] / augmented[i][i];
      for (let j = i; j <= n; j++) {
        augmented[k][j] -= factor * augmented[i][j];
      }
    }
  }
  
  // Back substitution
  const solution = new Array(n);
  for (let i = n - 1; i >= 0; i--) {
    solution[i] = augmented[i][n];
    for (let j = i + 1; j < n; j++) {
      solution[i] -= augmented[i][j] * solution[j];
    }
    solution[i] /= augmented[i][i];
  }
  
  return solution;
}

// Display Solution
function displaySolution(solution) {
  const variables = ['x', 'y', 'z', 'w', 'v'];
  let html = '<h3 style="color: var(--color-accent); margin-bottom: 1rem;">Solution:</h3>';
  
  solution.forEach((value, i) => {
    html += `<div class="solution"><strong>${variables[i]}</strong> = ${value.toFixed(6)}</div>`;
  });
  
  equationsResult.innerHTML = html;
}

// Initialize when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initEquationsSolver);
} else {
  initEquationsSolver();
}