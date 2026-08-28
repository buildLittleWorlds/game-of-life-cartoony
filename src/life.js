export function createBoard(columns, rows) {
  validateDimensions(columns, rows);
  return new Uint8Array(columns * rows);
}

export function getCell(board, columns, rows, x, y) {
  validateBoard(board, columns, rows);
  const wrappedX = wrap(x, columns);
  const wrappedY = wrap(y, rows);
  return board[wrappedY * columns + wrappedX];
}

export function setCell(board, columns, rows, x, y, value) {
  validateBoard(board, columns, rows);
  if (x < 0 || x >= columns || y < 0 || y >= rows) return false;
  board[y * columns + x] = value ? 1 : 0;
  return true;
}

export function countNeighbors(board, columns, rows, x, y) {
  let neighbors = 0;
  for (let offsetY = -1; offsetY <= 1; offsetY += 1) {
    for (let offsetX = -1; offsetX <= 1; offsetX += 1) {
      if (offsetX === 0 && offsetY === 0) continue;
      neighbors += getCell(board, columns, rows, x + offsetX, y + offsetY);
    }
  }
  return neighbors;
}

export function nextGeneration(board, columns, rows) {
  validateBoard(board, columns, rows);
  const next = createBoard(columns, rows);

  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < columns; x += 1) {
      const index = y * columns + x;
      const neighbors = countNeighbors(board, columns, rows, x, y);
      const isAlive = board[index] === 1;
      next[index] = neighbors === 3 || (isAlive && neighbors === 2) ? 1 : 0;
    }
  }

  return next;
}

export function countPopulation(board) {
  return board.reduce((total, cell) => total + cell, 0);
}

function wrap(value, size) {
  return ((value % size) + size) % size;
}

function validateDimensions(columns, rows) {
  if (!Number.isInteger(columns) || !Number.isInteger(rows) || columns <= 0 || rows <= 0) {
    throw new RangeError("Board dimensions must be positive integers.");
  }
}

function validateBoard(board, columns, rows) {
  validateDimensions(columns, rows);
  if (!(board instanceof Uint8Array) || board.length !== columns * rows) {
    throw new TypeError("Board must be a Uint8Array matching its dimensions.");
  }
}
