let expression = "";
let memory = 0;

function appendToExpression(value) {
    expression += value;
    updateDisplay();
}

function deleteLast() {
    expression = expression.slice(0, -1);
    updateDisplay();
}

function clearExpression() {
    expression = "";
    updateDisplay();
    document.getElementById("tree").innerHTML = "";
}

function updateDisplay() {
    document.getElementById("result-value").innerText = expression || "0";
}

function saveToMemory() {
    const result = parseFloat(document.getElementById("result-value").innerText);
    memory = result;
}

function useMemory() {
    expression += memory;
    updateDisplay();
}

function clearMemory() {
    memory = 0;
}

async function calculate() {
    if (!expression) {
        alert("Por favor, ingresa una expresión.");
        return;
    }

    const response = await fetch("http://127.0.0.1:5000/calculate", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ expression }),
    });

    if (!response.ok) {
        console.error("Error en la solicitud:", response.statusText);
        return;
    }
    const data = await response.json();
    console.log("Respuesta del servidor:", data);
    const treeData = buildD3Tree(data.tree);
    renderTree(treeData);

    const result = eval(expression);
    document.getElementById("result-value").innerText = result;

    const tokensTable = document.getElementById("tokensTable").querySelector("tbody");
    tokensTable.innerHTML = "";
    data.tokens.forEach(token => {
        const row = tokensTable.insertRow();
        row.insertCell(0).innerText = token.type;
        row.insertCell(1).innerText = token.value;
    });

    document.getElementById("numberCount").innerText = data.stats.numbers;
    document.getElementById("operatorCount").innerText = data.stats.operators;
}

function buildD3Tree(node) {
    if (typeof node !== "object" || node === null) {
        return { name: node.toString() };
    }
    return {
        name: node[1],
        children: [
            buildD3Tree(node[0]),
            buildD3Tree(node[2]),
        ],
    };
}

function renderTree(data) {
    document.getElementById("tree").innerHTML = "";

    const width = 800;
    const height = 500;
    const margin = { top: 20, right: 120, bottom: 20, left: 120 };

    const svg = d3.select("#tree").append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    const treeLayout = d3.tree().size([height - margin.top - margin.bottom, width - margin.left - margin.right]);
    const root = d3.hierarchy(data);
    treeLayout(root);

    svg.selectAll(".link")
        .data(root.links())
        .enter().append("path")
        .attr("class", "link")
        .attr("d", d3.linkHorizontal()
            .x(d => d.y)
            .y(d => d.x)
        );

    const node = svg.selectAll(".node")
        .data(root.descendants())
        .enter().append("g")
        .attr("class", "node")
        .attr("transform", d => "translate(" + d.y + "," + d.x + ")");

    node.append("circle").attr("r", 10);
    node.append("text")
        .attr("dy", ".35em")
        .attr("x", d => d.children ? -13 : 13)
        .style("text-anchor", d => d.children ? "end" : "start")
        .text(d => d.data.name);
}