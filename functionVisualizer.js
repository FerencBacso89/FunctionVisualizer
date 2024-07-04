const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
document.body.appendChild(canvas);

canvas.width = 800;
canvas.height = 600;

const margin = 50;
const width = canvas.width - 2 * margin;
const height = canvas.height - 2 * margin;

let func = x => Math.sin(x);
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

  // X tengely számozása
  for (let x = Math.ceil(xMin); x <= Math.floor(xMax); x++) {
    const px = ((x - xMin) / (xMax - xMin)) * width + margin;
    ctx.fillText(x, px, canvas.height - margin + 20);
  }

  // Y tengely számozása
  for (let y = Math.ceil(yMin); y <= Math.floor(yMax); y++) {
    const py = height - ((y - yMin) / (yMax - yMin)) * height + margin;
    ctx.fillText(y, margin - 20, py);
  }
}

function drawFunction() {
  ctx.beginPath();
  for (let px = 0; px < width; px++) {
    const x = (px / width) * (xMax - xMin) + xMin;
    const y = func(x);
    const py = height - ((y - yMin) / (yMax - yMin)) * height;
    if (px === 0) {
      ctx.moveTo(px + margin, py + margin);
    } else {
      ctx.lineTo(px + margin, py + margin);
    }
  }
  ctx.stroke();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawAxes();
  drawFunction();
}

function updateFunction() {
  const input = document.getElementById('funcInput').value;
  try {
    func = new Function('x', `return ${input};`);
    draw();
  } catch (error) {
    console.error('Érvénytelen függvény:', error);
  }
}

canvas.addEventListener('mousemove', event => {
  const rect = canvas.getBoundingClientRect();
  const x =
    ((event.clientX - rect.left - margin) / width) * (xMax - xMin) + xMin;
  const y = func(x);

  draw();

  ctx.fillStyle = 'red';
  ctx.beginPath();
  ctx.arc(
    event.clientX - rect.left,
    canvas.height - margin - ((y - yMin) / (yMax - yMin)) * height,
    5,
    0,
    2 * Math.PI
  );
  ctx.fill();

  ctx.fillStyle = 'black';
  ctx.fillText(
    `(${x.toFixed(2)}, ${y.toFixed(2)})`,
    event.clientX - rect.left + 10,
    event.clientY - rect.top - 10
  );
});

canvas.addEventListener('wheel', event => {
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

const input = document.createElement('input');
input.id = 'funcInput';
input.type = 'text';
input.value = 'Math.sin(x)';
document.body.insertBefore(input, canvas);

const button = document.createElement('button');
button.textContent = 'Rajzolás';
button.onclick = updateFunction;
document.body.insertBefore(button, canvas);

draw();
