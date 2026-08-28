import assert from "node:assert/strict";
import test from "node:test";

import {
  countNeighbors,
  countPopulation,
  createBoard,
  getCell,
  nextGeneration,
  setCell,
} from "../src/life.js";

function boardWith(columns, rows, livingCells) {
  const board = createBoard(columns, rows);
  for (const [x, y] of livingCells) setCell(board, columns, rows, x, y, 1);
  return board;
}

function livingCells(board, columns) {
  const cells = [];
  board.forEach((cell, index) => {
    if (cell) cells.push([index % columns, Math.floor(index / columns)]);
  });
  return cells;
}

test("creates an empty board", () => {
  const board = createBoard(4, 3);
  assert.equal(board.length, 12);
  assert.equal(countPopulation(board), 0);
});

test("a dead cell with three neighbors is born", () => {
  const board = boardWith(5, 5, [[1, 2], [2, 1], [3, 2]]);
  assert.equal(getCell(nextGeneration(board, 5, 5), 5, 5, 2, 2), 1);
});

test("a living cell survives with two or three neighbors", () => {
  const withTwo = boardWith(5, 5, [[2, 2], [1, 2], [3, 2]]);
  const withThree = boardWith(5, 5, [[2, 2], [1, 2], [3, 2], [2, 1]]);
  assert.equal(getCell(nextGeneration(withTwo, 5, 5), 5, 5, 2, 2), 1);
  assert.equal(getCell(nextGeneration(withThree, 5, 5), 5, 5, 2, 2), 1);
});

test("underpopulation and overpopulation kill living cells", () => {
  const lonely = boardWith(5, 5, [[2, 2], [1, 2]]);
  const crowded = boardWith(5, 5, [[2, 2], [1, 1], [2, 1], [3, 1], [1, 2]]);
  assert.equal(getCell(nextGeneration(lonely, 5, 5), 5, 5, 2, 2), 0);
  assert.equal(getCell(nextGeneration(crowded, 5, 5), 5, 5, 2, 2), 0);
});

test("a block remains a still life", () => {
  const block = boardWith(6, 6, [[2, 2], [3, 2], [2, 3], [3, 3]]);
  assert.deepEqual(nextGeneration(block, 6, 6), block);
});

test("a blinker oscillates", () => {
  const horizontal = boardWith(5, 5, [[1, 2], [2, 2], [3, 2]]);
  const vertical = nextGeneration(horizontal, 5, 5);
  assert.deepEqual(livingCells(vertical, 5), [[2, 1], [2, 2], [2, 3]]);
  assert.deepEqual(nextGeneration(vertical, 5, 5), horizontal);
});

test("neighbor counting wraps across board edges", () => {
  const board = boardWith(5, 5, [[4, 4], [0, 4], [4, 0]]);
  assert.equal(countNeighbors(board, 5, 5, 0, 0), 3);
  assert.equal(getCell(nextGeneration(board, 5, 5), 5, 5, 0, 0), 1);
});

test("setCell rejects coordinates outside the board", () => {
  const board = createBoard(3, 3);
  assert.equal(setCell(board, 3, 3, -1, 0, 1), false);
  assert.equal(setCell(board, 3, 3, 3, 0, 1), false);
  assert.equal(countPopulation(board), 0);
});
