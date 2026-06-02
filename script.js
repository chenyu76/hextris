let globalId = 0;
let getGlobalId = () => globalId++;
const arrayValEqual = (b) =>
    ((a) => a.length === b.length && a.every((val, i) => val === b[i]));
const randomValFromArray = (arr) => arr[Math.floor(Math.random() * arr.length)];

// 向量操作类
class Vector {
  static add(a, b, f = (x, y) => x + y) {
    if (typeof a === 'number' && typeof b === 'number')
      return f(a, b);
    if (typeof a === 'number')
      return b.map(val => f(val, a));
    if (typeof b === 'number')
      return a.map(val => f(val, b));
    return a.map((val, i) => f(val, b[i]));
  }
  static subtract(a, b) { return Vector.add(a, b, (x, y) => x - y); }
  static dot(a, b) { return a.reduce((sum, val, i) => sum + val * b[i], 0); }
  // 向量的模
  static norm(a) {
    return Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  }
  // 标量乘法
  static times(a, b) {
    if (Array.isArray(a))
      return a.map(val => val * b);
    return b.map(val => val * a);
  }
  // 标量除法
  static divide(a, b) { return a.map(val => val / b); }
  // 绝对值后求和
  static absSum(a) { return a.reduce((sum, val) => sum + Math.abs(val), 0); }
}
// 矩阵操作类
class Matrix {
  static add(a, b) {
    return a.map((row, i) => row.map((val, j) => val + b[i][j]));
  }
  static subtract(a, b) {
    return a.map((row, i) => row.map((val, j) => val - b[i][j]));
  }
  static multiply(a, b) {
    return a.map(row => b[0].map((_, j) => row.reduce(
                                     (sum, val, k) => sum + val * b[k][j], 0)));
  }
  static transpose(matrix) {
    return matrix[0].map((_, i) => matrix.map(row => row[i]));
  }
}

let ht = null;

function drawTutorial() {
  const container = document.getElementById("tutorial-diagram");
  const hexSize = 14;
  const sqrt3 = 1.732050808;

  const cubeToPixel = (q, r) => [
    hexSize * (sqrt3 * q + sqrt3 / 2 * r),
    hexSize * (3 / 2 * r),
  ];

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "-85 -90 170 175");

  const drawHex = (q, r, fill, stroke, dash) => {
    const [cx, cy] = cubeToPixel(q, r);
    const points = [];
    for (let i = 0; i < 6; i++) {
      const angle = 2 * Math.PI / 6 * (i + 0.5);
      points.push(`${(cx + hexSize * Math.cos(angle)).toFixed(1)},${(cy + hexSize * Math.sin(angle)).toFixed(1)}`);
    }
    const poly = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    poly.setAttribute("points", points.join(" "));
    poly.setAttribute("fill", fill);
    poly.setAttribute("stroke", stroke);
    poly.setAttribute("stroke-width", "1.5");
    if (dash) poly.setAttribute("stroke-dasharray", dash);
    svg.appendChild(poly);
  };

  const directions = [[1,0,-1],[1,-1,0],[0,-1,1],[-1,0,1],[-1,1,0],[0,1,-1]];
  const dist = p => Math.abs(p[0]) + Math.abs(p[1]) + Math.abs(-p[0]-p[1]);

  // All hexes up to ring 3, generate by expanding from center
  const visited = new Set();
  const frontier = [[0,0,0]];
  visited.add("0,0,0");
  while (frontier.length > 0) {
    const pos = frontier.shift();
    const d = dist(pos);
    if (d > 8) continue;
    for (const dir of directions) {
      const n = [pos[0]+dir[0], pos[1]+dir[1], pos[2]+dir[2]];
      const key = n.join(",");
      if (!visited.has(key) && dist(n) <= 8) {
        visited.add(key);
        frontier.push(n);
      }
    }
  }
  const allPositions = [...visited].map(k => k.split(",").map(Number));

  // Draw each hex with color based on distance
  for (const pos of allPositions) {
    const [q, r] = [pos[0], pos[1]];
    const d = dist(pos);
    let fill, stroke;
    if (d === 0) {
      fill = "#888"; stroke = "#666";
    } else if (d === 2) {
      fill = "#BDBDBD"; stroke = "#999";
    } else if (d === 4) {
      fill = "#FF9800"; stroke = "#E65100";
    } else if (d === 6) {
      fill = "#FFCC80"; stroke = "#FF9800";
      drawHex(q, r, fill, stroke, "3 3");
    } else if (d === 8) {
      fill = "#E0E0E0"; stroke = "#ccc";
      drawHex(q, r, fill, stroke, "3 3");
    }
    if (d <= 6 && !(d === 6)) {
      drawHex(q, r, fill, stroke);
    }
  }

  // Highlight ring at dist=4
  for (const pos of allPositions) {
    if (dist(pos) === 4) {
      const [q, r] = [pos[0], pos[1]];
      const [cx, cy] = cubeToPixel(q, r);
      const ring = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
      const pts = [];
      for (let i = 0; i < 6; i++) {
        const angle = 2 * Math.PI / 6 * (i + 0.5);
        pts.push(`${(cx + (hexSize+3) * Math.cos(angle)).toFixed(1)},${(cy + (hexSize+3) * Math.sin(angle)).toFixed(1)}`);
      }
      ring.setAttribute("points", pts.join(" "));
      ring.setAttribute("fill", "none");
      ring.setAttribute("stroke", "#D84315");
      ring.setAttribute("stroke-width", "2");
      ring.setAttribute("stroke-dasharray", "2 2");
      svg.appendChild(ring);
    }
  }

  // Labels
  const addText = (x, y, text, color, size) => {
    const t = document.createElementNS("http://www.w3.org/2000/svg", "text");
    t.setAttribute("x", x);
    t.setAttribute("y", y);
    t.setAttribute("fill", color);
    t.setAttribute("text-anchor", "middle");
    t.setAttribute("font-size", size);
    t.setAttribute("font-weight", "bold");
    t.textContent = text;
    svg.appendChild(t);
  };

  const [, ringY] = cubeToPixel(0, 4);
  addText(85, ringY - 22, "Complete ring", "#D84315", "7");
  addText(85, ringY - 10, "= eliminated!", "#D84315", "7");

  container.innerHTML = "";
  container.appendChild(svg);

  document.getElementById("tutorial-text").textContent =
    "Fill a complete ring of hexagons to eliminate it! Outer hexes then fall inward — if they complete another ring, chain reactions score big.";
}

drawTutorial();

// Settings sliders — game config

function getGameOptions() {
  return {
    blockCount: parseInt(document.getElementById("settings-blocks").value),
    baseDropInterval: parseInt(document.getElementById("settings-drop-speed").value),
    dropHeight: parseInt(document.getElementById("settings-height").value),
  };
}

function startGame() {
  document.getElementById("start-screen").classList.add("hidden");
  document.getElementById("end-screen").classList.add("hidden");
  const options = getGameOptions();
  ht = new HexTris("grid-container", 10, options);
}

// Settings sliders — game config
document.getElementById("settings-blocks").addEventListener("input", (e) => {
  document.getElementById("settings-blocks-value").textContent = e.target.value;
});
document.getElementById("settings-drop-speed").addEventListener("input", (e) => {
  document.getElementById("settings-speed-value").textContent = e.target.value + "ms";
});
document.getElementById("settings-height").addEventListener("input", (e) => {
  document.getElementById("settings-height-value").textContent = e.target.value;
});

// Start button
document.getElementById("start-btn").addEventListener("click", startGame);

// Restart button
document.getElementById("restart-btn").addEventListener("click", () => {
  const options = getGameOptions();
  if (ht) {
    ht.restart(options);
  } else {
    ht = new HexTris("grid-container", 10, options);
  }
  document.getElementById("end-screen").classList.add("hidden");
});

// Settings navigation
let settingsReturnTo = "start";

function openSettings(from) {
  settingsReturnTo = from;
  if (from === "game" && ht) ht.pause();
  document.getElementById("start-screen").classList.add("hidden");
  document.getElementById("end-screen").classList.add("hidden");
  document.getElementById("settings-screen").classList.remove("hidden");
}

function closeSettings() {
  document.getElementById("settings-screen").classList.add("hidden");
  if (settingsReturnTo === "start") {
    document.getElementById("start-screen").classList.remove("hidden");
  } else if (ht) {
    ht.resume();
  }
}

document.getElementById("start-settings-btn").addEventListener("click", () => openSettings("start"));
document.getElementById("sidebar-settings-btn").addEventListener("click", () => openSettings("game"));
document.getElementById("settings-back").addEventListener("click", closeSettings);

// Settings sliders sync with UI
document.getElementById("settings-zoom").addEventListener("input", (e) => {
  document.getElementById("settings-zoom-value").textContent = parseFloat(e.target.value).toFixed(2);
});
document.getElementById("settings-animation").addEventListener("input", (e) => {
  document.getElementById("settings-anim-value").textContent = parseFloat(e.target.value).toFixed(1) + "s";
});

// Resize handler
function handleResize() {
  if (ht) ht.resetView();
}
function debounce(func, delay = 250) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}
window.addEventListener("resize", debounce(handleResize));
