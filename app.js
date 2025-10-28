// Calculator State
let currentInput = '';
let expression = '';
let history = [];
let isAdvancedMode = false;
let angleMode = 'DEG'; // DEG or RAD

// DOM Elements
const display = document.getElementById('display');
const expressionDisplay = document.getElementById('expression');
const calculatorButtons = document.getElementById('calculatorButtons');
const advancedButtons = document.getElementById('advancedButtons');
const modeToggle = document.getElementById('modeToggle');
const angleButton = document.getElementById('angleMode');
const historyList = document.getElementById('historyList');
const clearHistoryBtn = document.getElementById('clearHistory');
const historyToggle = document.getElementById('historyToggle');
const historyPanel = document.getElementById('historyPanel');
const themeToggle = document.getElementById('themeToggle');
const menuToggle = document.getElementById('menuToggle');
const navMenu = document.getElementById('navMenu');
const shortcutsHelp = document.getElementById('shortcutsHelp');
const closeShortcuts = document.getElementById('closeShortcuts');

// Initialize
function init() {
  updateDisplay();
  setupEventListeners();
  setupNavigation();
  loadTheme();
}

// Setup Event Listeners
function setupEventListeners() {
  // Calculator buttons
  calculatorButtons.addEventListener('click', handleButtonClick);
  
  // Mode toggle
  modeToggle.addEventListener('click', toggleAdvancedMode);
  
  // Angle mode toggle
  angleButton.addEventListener('click', toggleAngleMode);
  
  // History
  clearHistoryBtn.addEventListener('click', clearHistory);
  historyToggle.addEventListener('click', toggleHistoryPanel);
  
  // Theme toggle
  themeToggle.addEventListener('click', toggleTheme);
  
  // Menu toggle
  menuToggle.addEventListener('click', toggleMenu);
  
  // Keyboard support
  document.addEventListener('keydown', handleKeyboard);
  
  // Shortcuts help
  closeShortcuts.addEventListener('click', () => shortcutsHelp.classList.add('hidden'));
}

// Handle Button Clicks
function handleButtonClick(e) {
  if (!e.target.classList.contains('btn')) return;
  
  const value = e.target.dataset.value;
  
  if (!value) return;
  
  if (value === '=') {
    calculate();
  } else if (value === 'AC') {
    clear();
  } else if (value === '⌫') {
    backspace();
  } else {
    appendToExpression(value);
  }
}

// Append to Expression
function appendToExpression(value) {
  if (value === 'pi') {
    expression += Math.PI;
  } else if (value === 'e') {
    expression += Math.E;
  } else {
    expression += value;
  }
  updateDisplay();
}

// Calculate Result
function calculate() {
  try {
    let expr = expression;
    
    // Replace mathematical functions
    expr = expr.replace(/sin\(/g, angleMode === 'DEG' ? 'Math.sin(toRadians(' : 'Math.sin(');
    expr = expr.replace(/cos\(/g, angleMode === 'DEG' ? 'Math.cos(toRadians(' : 'Math.cos(');
    expr = expr.replace(/tan\(/g, angleMode === 'DEG' ? 'Math.tan(toRadians(' : 'Math.tan(');
    expr = expr.replace(/asin\(/g, angleMode === 'DEG' ? 'toDegrees(Math.asin(' : 'Math.asin(');
    expr = expr.replace(/acos\(/g, angleMode === 'DEG' ? 'toDegrees(Math.acos(' : 'Math.acos(');
    expr = expr.replace(/atan\(/g, angleMode === 'DEG' ? 'toDegrees(Math.atan(' : 'Math.atan(');
    expr = expr.replace(/sqrt\(/g, 'Math.sqrt(');
    expr = expr.replace(/cbrt\(/g, 'Math.cbrt(');
    expr = expr.replace(/log\(/g, 'Math.log10(');
    expr = expr.replace(/ln\(/g, 'Math.log(');
    expr = expr.replace(/exp\(/g, 'Math.exp(');
    expr = expr.replace(/abs\(/g, 'Math.abs(');
    expr = expr.replace(/\^/g, '**');
    
    // Close parentheses for angle conversions
    if (angleMode === 'DEG') {
      const sinCount = (expr.match(/toRadians\(/g) || []).length;
      const asinCount = (expr.match(/toDegrees\(/g) || []).length;
      for (let i = 0; i < sinCount; i++) {
        expr = expr.replace(/toRadians\(([^)]+)\)/, 'toRadians($1)');
      }
    }
    
    // Evaluate expression
    const result = eval(expr);
    
    // Add to history
    addToHistory(expression, result);
    
    // Update display
    currentInput = result.toString();
    expression = result.toString();
    updateDisplay();
  } catch (error) {
    display.textContent = 'Error';
    setTimeout(() => {
      expression = '';
      updateDisplay();
    }, 1500);
  }
}

// Helper functions for angle conversion
function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

function toDegrees(radians) {
  return radians * (180 / Math.PI);
}

// Clear
function clear() {
  expression = '';
  currentInput = '';
  updateDisplay();
}

// Backspace
function backspace() {
  expression = expression.slice(0, -1);
  updateDisplay();
}

// Update Display
function updateDisplay() {
  display.textContent = expression || '0';
  expressionDisplay.textContent = expression;
}

// Add to History
function addToHistory(expr, result) {
  const historyItem = {
    expression: expr,
    result: result,
    timestamp: new Date()
  };
  
  history.unshift(historyItem);
  
  // Keep only last 10
  if (history.length > 10) {
    history = history.slice(0, 10);
  }
  
  renderHistory();
}

// Render History
function renderHistory() {
  if (history.length === 0) {
    historyList.innerHTML = '<p class="history-empty">No calculations yet</p>';
    return;
  }
  
  historyList.innerHTML = '';
  history.forEach((item, index) => {
    const historyItem = document.createElement('div');
    historyItem.className = 'history-item';
    historyItem.innerHTML = `
      <div class="history-expression">${item.expression}</div>
      <div class="history-result">= ${formatResult(item.result)}</div>
    `;
    historyItem.addEventListener('click', () => {
      expression = item.expression;
      updateDisplay();
    });
    historyList.appendChild(historyItem);
  });
}

// Format Result
function formatResult(result) {
  if (typeof result === 'number') {
    if (Math.abs(result) > 1e10 || (Math.abs(result) < 1e-6 && result !== 0)) {
      return result.toExponential(6);
    }
    return Number(result.toFixed(10)).toString();
  }
  return result;
}

// Clear History
function clearHistory() {
  history = [];
  renderHistory();
}

// Toggle Advanced Mode
function toggleAdvancedMode() {
  isAdvancedMode = !isAdvancedMode;
  advancedButtons.classList.toggle('hidden');
  modeToggle.classList.toggle('active');
}

// Toggle Angle Mode
function toggleAngleMode() {
  angleMode = angleMode === 'DEG' ? 'RAD' : 'DEG';
  angleButton.textContent = angleMode;
  angleButton.classList.toggle('active');
}

// Toggle History Panel
function toggleHistoryPanel() {
  historyPanel.classList.toggle('show');
}

// Theme state (in-memory)
let currentTheme = 'dark';

// Toggle Theme
function toggleTheme() {
  currentTheme = currentTheme === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', currentTheme);
}

// Load Theme
function loadTheme() {
  document.documentElement.setAttribute('data-theme', currentTheme);
}

// Toggle Menu
function toggleMenu() {
  navMenu.classList.toggle('active');
}

// Keyboard Support
function handleKeyboard(e) {
  const key = e.key;
  
  if (key >= '0' && key <= '9') {
    appendToExpression(key);
  } else if (key === '.') {
    appendToExpression(key);
  } else if (['+', '-', '*', '/'].includes(key)) {
    appendToExpression(key);
  } else if (key === 'Enter') {
    e.preventDefault();
    calculate();
  } else if (key === 'Escape') {
    clear();
  } else if (key === 'Backspace') {
    backspace();
  } else if (key === '(') {
    appendToExpression('(');
  } else if (key === ')') {
    appendToExpression(')');
  } else if (key === '%') {
    appendToExpression('%');
  } else if (key === '?') {
    shortcutsHelp.classList.toggle('hidden');
  }
}

// Navigation
function setupNavigation() {
  const navLinks = document.querySelectorAll('.nav-link');
  const pages = document.querySelectorAll('.page');
  
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Remove active class from all links and pages
      navLinks.forEach(l => l.classList.remove('active'));
      pages.forEach(p => p.classList.remove('active'));
      
      // Add active class to clicked link
      link.classList.add('active');
      
      // Show corresponding page
      const pageName = link.dataset.page;
      const targetPage = document.getElementById(pageName + 'Page');
      if (targetPage) {
        targetPage.classList.add('active');
      }
      
      // Close mobile menu
      navMenu.classList.remove('active');
    });
  });
}

// Initialize on load
init();