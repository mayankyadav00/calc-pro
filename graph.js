// ==============================
// Graph Plotter (Chart.js)
// ==============================

let chartInstance = null;
const canvas = document.getElementById("graphCanvas");
const ctx = canvas.getContext("2d");

// Function colors for multiple inputs
const colors = ["#1FB8CD", "#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"];

function plotGraph() {
    const inputs = document.querySelectorAll(".function-input");
    const xMin = parseFloat(document.getElementById("xMin").value);
    const xMax = parseFloat(document.getElementById("xMax").value);
    const yMin = parseFloat(document.getElementById("yMin").value);
    const yMax = parseFloat(document.getElementById("yMax").value);
    const showGrid = document.getElementById("showGrid").checked;
    const legendContainer = document.getElementById("graphLegend");
    legendContainer.innerHTML = "";

    if (isNaN(xMin) || isNaN(xMax) || xMin >= xMax) {
        alert("Please enter valid X range values.");
        return;
    }

    // Generate x values (smooth curve)
    const step = (xMax - xMin) / 200;
    const xValues = [];
    for (let x = xMin; x <= xMax; x += step) {
        xValues.push(x);
    }

    // Evaluate functions safely
    const datasets = [];
    inputs.forEach((input, index) => {
        const expr = input.value.trim();
        if (!expr) return;

        const color = colors[index % colors.length];
        const yValues = xValues.map(x => {
            try {
                // Replace math symbols and functions for eval
                const replaced = expr
                    .replace(/\^/g, "**")
                    .replace(/sin/g, "Math.sin")
                    .replace(/cos/g, "Math.cos")
                    .replace(/tan/g, "Math.tan")
                    .replace(/log/g, "Math.log10")
                    .replace(/ln/g, "Math.log")
                    .replace(/sqrt/g, "Math.sqrt")
                    .replace(/abs/g, "Math.abs")
                    .replace(/pi/g, "Math.PI")
                    .replace(/e/g, "Math.E");

                const y = eval(replaced);
                return isFinite(y) ? y : NaN;
            } catch {
                return NaN;
            }
        });

        datasets.push({
            label: expr,
            data: xValues.map((x, i) => ({ x, y: yValues[i] })),
            borderColor: color,
            borderWidth: 2,
            fill: false,
            tension: 0.1
        });

        // Add legend entry
        const legendItem = document.createElement("div");
        legendItem.className = "legend-item";
        legendItem.innerHTML = `<span class="color-box" style="background:${color}"></span>${expr}`;
        legendContainer.appendChild(legendItem);
    });

    if (chartInstance) chartInstance.destroy();

    chartInstance = new Chart(ctx, {
        type: "line",
        data: { datasets },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    type: "linear",
                    position: "bottom",
                    grid: { display: showGrid },
                    min: xMin,
                    max: xMax,
                    title: { display: true, text: "X Axis" }
                },
                y: {
                    grid: { display: showGrid },
                    min: yMin,
                    max: yMax,
                    title: { display: true, text: "Y Axis" }
                }
            },
            plugins: {
                legend: { display: false },
                tooltip: { mode: "nearest" }
            },
            elements: { point: { radius: 0 } }
        }
    });
}

// Add/Remove function input fields dynamically
document.getElementById("addFunction").addEventListener("click", () => {
    const functionInputs = document.getElementById("functionInputs");
    const index = functionInputs.children.length;
    const div = document.createElement("div");
    div.classList.add("function-input-group");
    div.innerHTML = `
        <input type="text" class="form-control function-input" placeholder="e.g., sin(x)" data-index="${index}">
        <div class="color-indicator" style="background-color: ${colors[index % colors.length]};"></div>
        <button class="btn-remove" data-index="${index}">×</button>
    `;
    functionInputs.appendChild(div);
});

document.getElementById("functionInputs").addEventListener("click", (e) => {
    if (e.target.classList.contains("btn-remove")) {
        e.target.parentElement.remove();
    }
});

// Buttons
document.getElementById("plotGraph").addEventListener("click", plotGraph);

document.getElementById("resetGraph").addEventListener("click", () => {
    document.getElementById("xMin").value = -10;
    document.getElementById("xMax").value = 10;
    document.getElementById("yMin").value = -10;
    document.getElementById("yMax").value = 10;
    document.getElementById("functionInputs").innerHTML = `
        <div class="function-input-group">
            <input type="text" class="form-control function-input" placeholder="e.g., x^2, sin(x), tan(x)">
            <div class="color-indicator" style="background-color: #1FB8CD;"></div>
            <button class="btn-remove">×</button>
        </div>`;
    document.getElementById("graphLegend").innerHTML = "";
    if (chartInstance) chartInstance.destroy();
});
