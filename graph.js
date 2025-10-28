// ==============================
// Graph Plotter (Chart.js v4 + Zoom + Hover)
// ==============================

let chartInstance = null;
const ctx = document.getElementById("graphCanvas").getContext("2d");

const colors = ["#1FB8CD", "#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"];

// Utility to safely evaluate mathematical expressions
function safeEval(expr, x) {
    try {
        const replaced = expr
            .replace(/\^/g, "**")
            .replace(/sin/g, "Math.sin")
            .replace(/cos/g, "Math.cos")
            .replace(/tan/g, "Math.tan")
            .replace(/log10?/g, "Math.log10")
            .replace(/ln/g, "Math.log")
            .replace(/sqrt/g, "Math.sqrt")
            .replace(/abs/g, "Math.abs")
            .replace(/pi/g, "Math.PI")
            .replace(/\be\b/g, "Math.E");
        const y = eval(replaced);
        return isFinite(y) ? y : NaN;
    } catch {
        return NaN;
    }
}

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

    const step = (xMax - xMin) / 200;
    const xValues = [];
    for (let x = xMin; x <= xMax; x += step) xValues.push(x);

    const datasets = [];

    inputs.forEach((input, index) => {
        const expr = input.value.trim();
        if (!expr) return;
        const color = colors[index % colors.length];
        const yValues = xValues.map(x => safeEval(expr, x));

        datasets.push({
            label: expr,
            data: xValues.map((x, i) => ({ x, y: yValues[i] })),
            borderColor: color,
            borderWidth: 2,
            fill: false,
            showLine: true,
            tension: 0.1,
            pointRadius: 0
        });

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
            interaction: { mode: "nearest", intersect: false },
            scales: {
                x: {
                    type: "linear",
                    grid: { display: showGrid },
                    min: xMin,
                    max: xMax,
                    title: { display: true, text: "X-Axis" },
                    ticks: { color: "var(--text-primary)" },
                    border: { color: "var(--text-secondary)" }
                },
                y: {
                    grid: { display: showGrid },
                    min: yMin,
                    max: yMax,
                    title: { display: true, text: "Y-Axis" },
                    ticks: { color: "var(--text-primary)" },
                    border: { color: "var(--text-secondary)" }
                }
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    enabled: true,
                    callbacks: {
                        label: ctx => `(${ctx.parsed.x.toFixed(2)}, ${ctx.parsed.y.toFixed(2)})`
                    }
                },
                zoom: {
                    pan: { enabled: true, mode: "xy" },
                    zoom: {
                        wheel: { enabled: true },
                        pinch: { enabled: true },
                        mode: "xy"
                    }
                }
            }
        }
    });
}

// ========== Dynamic Inputs ==========
document.getElementById("addFunction").addEventListener("click", () => {
    const container = document.getElementById("functionInputs");
    const index = container.children.length;
    const div = document.createElement("div");
    div.className = "function-input-group";
    div.innerHTML = `
        <input type="text" class="form-control function-input" placeholder="e.g., sin(x)" data-index="${index}">
        <div class="color-indicator" style="background-color:${colors[index % colors.length]}"></div>
        <button class="btn-remove" data-index="${index}">×</button>
    `;
    container.appendChild(div);
});

document.getElementById("functionInputs").addEventListener("click", e => {
    if (e.target.classList.contains("btn-remove")) e.target.parentElement.remove();
});

// ========== Buttons ==========
document.getElementById("plotGraph").addEventListener("click", plotGraph);

document.getElementById("resetGraph").addEventListener("click", () => {
    if (chartInstance) chartInstance.destroy();
    document.getElementById("xMin").value = -10;
    document.getElementById("xMax").value = 10;
    document.getElementById("yMin").value = -10;
    document.getElementById("yMax").value = 10;
    document.getElementById("functionInputs").innerHTML = `
        <div class="function-input-group">
            <input type="text" class="form-control function-input" placeholder="e.g., x^2, sin(x)">
            <div class="color-indicator" style="background-color:#1FB8CD;"></div>
            <button class="btn-remove">×</button>
        </div>`;
    document.getElementById("graphLegend").innerHTML = "";
});

// ========== Save Graph as Image ==========
const saveBtn = document.createElement("button");
saveBtn.textContent = "Save Graph (PNG)";
saveBtn.className = "btn btn--secondary";
saveBtn.style.marginTop = "1rem";
saveBtn.addEventListener("click", () => {
    if (!chartInstance) return alert("No graph plotted yet!");
    const link = document.createElement("a");
    link.download = "graph.png";
    link.href = chartInstance.toBase64Image();
    link.click();
});
document.querySelector(".graph-buttons").appendChild(saveBtn);
