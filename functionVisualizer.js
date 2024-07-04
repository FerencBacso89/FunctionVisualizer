function drawFunction() {
  ctx.beginPath();
  ctx.strokeStyle = "lightgreen";
  ctx.lineWidth = 2;
  let prevY;
  let isDrawing = false;
  for (let px = 0; px < width; px++) {
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
    // X tengely metszéspontjának jelölése
    if (
      prevY !== undefined &&
      ((prevY < 0 && y >= 0) || (prevY >= 0 && y < 0))
    ) {
      ctx.stroke(); // Rajzoljuk ki a vonalat eddig
      ctx.beginPath(); // Új útvonal a pontnak
      ctx.fillStyle = "blue";
      ctx.arc(
        px + margin,
        height - (-yMin / (yMax - yMin)) * height + margin,
        4,
        0,
        2 * Math.PI
      );
      ctx.fill();
      ctx.beginPath(); // Új útvonal a vonal folytatásához
      ctx.moveTo(px + margin, py + margin);
    }
    prevY = y;
  }
  ctx.stroke();
  ctx.lineWidth = 1;
  ctx.strokeStyle = "black";
}

// A többi kód változatlan marad...

// Az updateFunction függvényben frissítsük a yMin és yMax értékeket:
function updateFunction() {
  // ... (korábbi kód változatlan)

  // Függvény középre igazítása és tartomány meghatározása
  let yValues = [];
  for (let x = xMin; x <= xMax; x += 0.1) {
    try {
      let y = func(x);
      if (isFinite(y)) {
        yValues.push(y);
      }
    } catch (e) {
      // Hibás pontok kihagyása
    }
  }
  if (yValues.length > 0) {
    yMin = Math.min(...yValues);
    yMax = Math.max(...yValues);
    let yCenter = (yMin + yMax) / 2;
    let yRange = yMax - yMin;
    yMin = yCenter - yRange / 2 - 0.1 * yRange; // Kis extra margó
    yMax = yCenter + yRange / 2 + 0.1 * yRange; // Kis extra margó
  } else {
    yMin = -1;
    yMax = 1;
  }

  draw();
}
