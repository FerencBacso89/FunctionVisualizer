const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");
document.body.appendChild(canvas);

canvas.width = window.innerWidth;
canvas.height = window.innerHeight - 50;

const margin = 50;
const width = canvas.width - 2 * margin;
const height = canvas.height - 2 * margin;

let func = (x) => Math.sin(x);
let xMin = -10;
let xMax = 10;
let yMin = -2;
let yMax = 2;

function drawAxes() {
  ctx.beginPath();
  ctx.moveTo(margin, margin);
  ctx.lineTo(margin, canvas.height - margin);
  ctx.lineTo(canvas.width - margin, canvas.height - margin);
  ctx.stroke();

  for (let x = Math.ceil(xMin); x <= Math.floor(xMax); x++) {
    const px = ((x - xMin) / (xMax - xMin)) * width + margin;
    ctx.fillText(x, px, canvas.height - margin + 20);
  }

  for (let y = Math.ceil(yMin); y <= Math.floor(yMax); y++) {
    const py = height - ((y - yMin) / (yMax - yMin)) * height + margin;
    ctx.fillText(y, margin - 20, py);
  }

  const zeroY = height - ((0 - yMin) / (yMax - yMin)) * height + margin;
  ctx.beginPath();
  ctx.moveTo(margin, zeroY);
  ctx.lineTo(canvas.width - margin, zeroY);
  ctx.strokeStyle = "rgba(0, 0, 0, 0.3)";
  ctx.stroke();
  ctx.strokeStyle = "black";
}

function drawFunction() {
  ctx.beginPath();
  ctx.strokeStyle = "lightgreen";
  ctx.lineWidth = 2;
  let isDrawing = false;
  let prevX, prevY;

  for (let px = 0; px <= width; px++) {
    const x = (px / width) * (xMax - xMin) + xMin;
    let y;
    try {
      y = func(x);
    } catch (e) {
      isDrawing = false;
      continue;
    }
    if (!isFinite(y)) {
      isDrawing = false;
      continue;
    }
    const py = height - ((y - yMin) / (yMax - yMin)) * height;

    if (!isDrawing) {
      ctx.moveTo(px + margin, py + margin);
      isDrawing = true;
    } else {
      ctx.lineTo(px + margin, py + margin);
    }

    if (
      prevY !== undefined &&
      ((prevY < 0 && y >= 0) || (prevY >= 0 && y < 0))
    ) {
      const intersectX = prevX + ((x - prevX) * (0 - prevY)) / (y - prevY);
      const intersectPx =
        ((intersectX - xMin) / (xMax - xMin)) * width + margin;
      ctx.stroke();
      ctx.beginPath();
      ctx.fillStyle = "blue";
      ctx.arc(
        intersectPx,
        height - (-yMin / (yMax - yMin)) * height + margin,
        4,
        0,
        2 * Math.PI
      );
      ctx.fill();
      ctx.beginPath();
      ctx.strokeStyle = "lightgreen";
      ctx.moveTo(intersectPx, py + margin);
    }

    prevX = x;
    prevY = y;
  }
  ctx.stroke();
  ctx.lineWidth = 1;
  ctx.strokeStyle = "black";
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawAxes();
  drawFunction();
}

function updateFunction() {
  const input = document.getElementById("funcInput").value;
  try {
    let processedInput = input
      .replace(/\^/g, "**")
      .replace(/log\(/g, "Math.log(")
      .replace(/ln\(/g, "Math.log(")
      .replace(/log10\(/g, "Math.log10(")
      .replace(/exp\(/g, "Math.exp(")
      .replace(/sin\(/g, "Math.sin(")
      .replace(/cos\(/g, "Math.cos(")
      .replace(/tan\(/g, "Math.tan(")
      .replace(/sqrt\(/g, "Math.sqrt(");

    func = new Function("x", `return ${processedInput};`);

    let yValues = [];
    for (let x = xMin; x <= xMax; x += 0.1) {
      try {
        let y = func(x);
        if (isFinite(y)) {
          yValues.push(y);
        }
      } catch (e) {}
    }
    if (yValues.length > 0) {
      yMin = Math.min(...yValues);
      yMax = Math.max(...yValues);
      let yCenter = (yMin + yMax) / 2;
      let yRange = yMax - yMin;
      yMin = yCenter - yRange / 2 - 0.1 * yRange;
      yMax = yCenter + yRange / 2 + 0.1 * yRange;
    } else {
      yMin = -1;
      yMax = 1;
    }

    draw();
  } catch (error) {
    console.error("Érvénytelen függvény:", error);
  }
}

canvas.addEventListener("mousemove", (event) => {
  const rect = canvas.getBoundingClientRect();
  const x =
    ((event.clientX - rect.left - margin) / width) * (xMax - xMin) + xMin;
  const y = func(x);

  draw();

  ctx.fillStyle = "green";
  ctx.beginPath();
  ctx.arc(
    event.clientX - rect.left,
    canvas.height - margin - ((y - yMin) / (yMax - yMin)) * height,
    5,
    0,
    2 * Math.PI
  );
  ctx.fill();

  ctx.fillStyle = "black";
  ctx.fillText(
    `(${x.toFixed(2)}, ${y.toFixed(2)})`,
    event.clientX - rect.left + 10,
    event.clientY - rect.top - 10
  );
});

canvas.addEventListener("wheel", (event) => {
  event.preventDefault();
  const zoomFactor = event.deltaY > 0 ? 1.1 : 0.9;
  const rect = canvas.getBoundingClientRect();
  const mouseX =
    ((event.clientX - rect.left - margin) / width) * (xMax - xMin) + xMin;
  const mouseY =
    yMax - ((event.clientY - rect.top - margin) / height) * (yMax - yMin);

  xMin = mouseX - (mouseX - xMin) * zoomFactor;
  xMax = mouseX + (xMax - mouseX) * zoomFactor;
  yMin = mouseY - (mouseY - yMin) * zoomFactor;
  yMax = mouseY + (yMax - mouseY) * zoomFactor;

  draw();
});

const inputContainer = document.createElement("div");
inputContainer.style.position = "fixed";
inputContainer.style.bottom = "0";
inputContainer.style.left = "0";
inputContainer.style.width = "100%";
inputContainer.style.padding = "10px";
inputContainer.style.backgroundColor = "#f0f0f0";

const input = document.createElement("input");
input.id = "funcInput";
input.type = "text";
input.value = "sin(x)";
input.style.width = "80%";
inputContainer.appendChild(input);

const button = document.createElement("button");
button.textContent = "Rajzolás";
button.onclick = updateFunction;
button.style.marginLeft = "10px";
inputContainer.appendChild(button);

document.body.appendChild(inputContainer);

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight - 50;
  draw();
});

updateFunction();
