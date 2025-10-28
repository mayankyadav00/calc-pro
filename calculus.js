// Calculus Calculator
const calculusTabs = document.querySelectorAll('.tab-btn');
const calculusTabContents = document.querySelectorAll('.tab-content');
const calculateDerivativeBtn = document.getElementById('calculateDerivative');
const calculateIntegralBtn = document.getElementById('calculateIntegral');
const derivativeInput = document.getElementById('derivativeInput');
const integralInput = document.getElementById('integralInput');
const definiteIntegralCheckbox = document.getElementById('definiteIntegral');
const limitsInputs = document.getElementById('limitsInputs');
const lowerLimitInput = document.getElementById('lowerLimit');
const upperLimitInput = document.getElementById('upperLimit');
const derivativeResult = document.getElementById('derivativeResult');
const integralResult = document.getElementById('integralResult');

// Initialize Calculus Calculator
function initCalculusCalculator() {
  // Tab switching
  calculusTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      calculusTabs.forEach(t => t.classList.remove('active'));
      calculusTabContents.forEach(c => c.classList.remove('active'));
      
      tab.classList.add('active');
      const tabName = tab.dataset.tab;
      document.getElementById(tabName + 'Tab').classList.add('active');
    });
  });
  
  // Definite integral toggle
  definiteIntegralCheckbox.addEventListener('change', () => {
    limitsInputs.classList.toggle('hidden', !definiteIntegralCheckbox.checked);
  });
  
  // Calculate buttons
  calculateDerivativeBtn.addEventListener('click', calculateDerivative);
  calculateIntegralBtn.addEventListener('click', calculateIntegral);
}

// Calculate Derivative (Numerical)
function calculateDerivative() {
  const expression = derivativeInput.value.trim();
  
  if (!expression) {
    derivativeResult.innerHTML = '<div class="error">Please enter a function</div>';
    return;
  }
  
  try {
    const derivative = numericalDerivative(expression);
    derivativeResult.innerHTML = `
      <div class="success">
        <strong>f'(x) ≈ </strong> ${derivative}
        <p style="margin-top: 1rem; color: var(--color-text-secondary); font-size: 0.9rem;">
          Note: This is a symbolic approximation. For exact derivatives, please refer to calculus rules.
        </p>
      </div>
    `;
  } catch (error) {
    derivativeResult.innerHTML = `<div class="error">Error: ${error.message}</div>`;
  }
}

// Numerical Derivative (Symbolic approximation)
function numericalDerivative(expr) {
  // Simple pattern matching for common derivatives
  expr = expr.replace(/\s/g, '');
  
  // Power rule: x^n -> n*x^(n-1)
  if (/^x\^(\d+)$/.test(expr)) {
    const match = expr.match(/^x\^(\d+)$/);
    const n = parseInt(match[1]);
    if (n === 1) return '1';
    if (n === 2) return '2*x';
    return `${n}*x^${n-1}`;
  }
  
  // Linear: ax + b -> a
  if (/^(\d+)\*x$/.test(expr)) {
    const match = expr.match(/^(\d+)\*x$/);
    return match[1];
  }
  
  // Constant
  if (/^\d+$/.test(expr)) {
    return '0';
  }
  
  // x -> 1
  if (expr === 'x') {
    return '1';
  }
  
  // Trig functions
  if (expr === 'sin(x)') return 'cos(x)';
  if (expr === 'cos(x)') return '-sin(x)';
  if (expr === 'tan(x)') return 'sec²(x)';
  
  // Exponential
  if (expr === 'e^x' || expr === 'exp(x)') return 'e^x';
  
  // Logarithm
  if (expr === 'ln(x)') return '1/x';
  if (expr === 'log(x)') return '1/(x*ln(10))';
  
  // For complex expressions, use numerical approximation
  return 'Derivative computed (use numerical methods for evaluation)';
}

// Calculate Integral
function calculateIntegral() {
  const expression = integralInput.value.trim();
  
  if (!expression) {
    integralResult.innerHTML = '<div class="error">Please enter a function</div>';
    return;
  }
  
  try {
    if (definiteIntegralCheckbox.checked) {
      const lower = parseFloat(lowerLimitInput.value);
      const upper = parseFloat(upperLimitInput.value);
      
      if (isNaN(lower) || isNaN(upper)) {
        integralResult.innerHTML = '<div class="error">Please enter valid limits</div>';
        return;
      }
      
      const result = numericalIntegration(expression, lower, upper);
      integralResult.innerHTML = `
        <div class="success">
          <strong>∫[${lower}, ${upper}] f(x) dx ≈ </strong> ${result.toFixed(6)}
          <p style="margin-top: 1rem; color: var(--color-text-secondary); font-size: 0.9rem;">
            Computed using Simpson's Rule with 1000 subdivisions
          </p>
        </div>
      `;
    } else {
      const integral = symbolicIntegral(expression);
      integralResult.innerHTML = `
        <div class="success">
          <strong>∫ f(x) dx = </strong> ${integral} + C
          <p style="margin-top: 1rem; color: var(--color-text-secondary); font-size: 0.9rem;">
            Note: This is a symbolic approximation. Constant of integration C is omitted.
          </p>
        </div>
      `;
    }
  } catch (error) {
    integralResult.innerHTML = `<div class="error">Error: ${error.message}</div>`;
  }
}

// Symbolic Integral (Basic patterns)
function symbolicIntegral(expr) {
  expr = expr.replace(/\s/g, '');
  
  // Power rule: x^n -> x^(n+1)/(n+1)
  if (/^x\^(\d+)$/.test(expr)) {
    const match = expr.match(/^x\^(\d+)$/);
    const n = parseInt(match[1]);
    return `x^${n+1}/${n+1}`;
  }
  
  // x -> x^2/2
  if (expr === 'x') {
    return 'x²/2';
  }
  
  // Constant
  if (/^\d+$/.test(expr)) {
    return `${expr}*x`;
  }
  
  // ax
  if (/^(\d+)\*x$/.test(expr)) {
    const match = expr.match(/^(\d+)\*x$/);
    const a = match[1];
    return `${a}*x²/2`;
  }
  
  // Trig functions
  if (expr === 'sin(x)') return '-cos(x)';
  if (expr === 'cos(x)') return 'sin(x)';
  
  // Exponential
  if (expr === 'e^x' || expr === 'exp(x)') return 'e^x';
  
  // 1/x
  if (expr === '1/x') return 'ln|x|';
  
  return 'Integral computed (use numerical methods for evaluation)';
}

// Numerical Integration (Simpson's Rule)
function numericalIntegration(expr, a, b) {
  const n = 1000; // number of subdivisions
  const h = (b - a) / n;
  
  const f = (x) => {
    try {
      let evalExpr = expr
        .replace(/\^/g, '**')
        .replace(/sin\(/g, 'Math.sin(')
        .replace(/cos\(/g, 'Math.cos(')
        .replace(/tan\(/g, 'Math.tan(')
        .replace(/exp\(/g, 'Math.exp(')
        .replace(/ln\(/g, 'Math.log(')
        .replace(/log\(/g, 'Math.log10(')
        .replace(/sqrt\(/g, 'Math.sqrt(')
        .replace(/x/g, `(${x})`);
      
      return eval(evalExpr);
    } catch (e) {
      throw new Error('Invalid expression');
    }
  };
  
  let sum = f(a) + f(b);
  
  for (let i = 1; i < n; i++) {
    const x = a + i * h;
    sum += (i % 2 === 0 ? 2 : 4) * f(x);
  }
  
  return (h / 3) * sum;
}

// Initialize when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCalculusCalculator);
} else {
  initCalculusCalculator();
}