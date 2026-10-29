const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { before, test } = require("node:test");

const source = fs.readFileSync(path.join(__dirname, "..", "game.js"), "utf8");
const core = source.slice(0, source.indexOf('document.addEventListener("keydown"'));
const engine = vm.runInNewContext(`${core}
({
    stages, isPathSolved, isFieldSolved, canSolverPlace, createEmptyBoardCells,
    hasMagnetPlacementConflict, getTurnDirection,
    solve(index) {
        currentStageIndex = index;
        let board = null;
        const original = isPathSolved;
        isPathSolved = (cells) => {
            const valid = original(cells);
            if (valid && (!hasFieldRules(getStage()) || isFieldSolved(cells))) {
                board = cells.map((row) => row.map((cell) => ({ ...cell, paths: [...cell.paths] })));
            }
            return valid;
        };
        try { return { ...countSolutions(), board }; }
        finally { isPathSolved = original; }
    }
})`, { document: { getElementById: () => ({ closest: () => ({}) }) } });
const clone = (value) => JSON.parse(JSON.stringify(value));
let boss, bossIndex, solution;

before(() => {
    for (const [index, stage] of engine.stages.entries()) {
        const result = engine.solve(index);
        assert.equal(result.count, 1, `${stage.shortName} must have exactly one solution`);
        console.log(`${stage.shortName}: unique`);
        if (stage.shortName === "4-X") {
            boss = stage;
            bossIndex = index;
            solution = result.board;
        }
    }
});

test("all 20 levels have one solution using the production solver", () => {
    assert.equal(engine.stages.length, 20);
    assert.ok(solution);
});

test("4-X uses every piece and all paths without prescribing endpoint pairs", () => {
    assert.equal(boss.boardSize, 8);
    assert.equal(boss.pieces.length, 20);
    assert.equal(boss.pieces.flatMap((piece) => piece.cells).length, 64);
    assert.ok(boss.pieces.every((piece) => piece.cells.some((cell) => cell.paths?.length)));
    assert.equal(boss.endpoints.starts.length, 4);
    assert.equal(boss.endpoints.ends.length, 4);
    assert.ok([...boss.endpoints.starts, ...boss.endpoints.ends].every((endpoint) => !endpoint.network));
    assert.equal(solution.flat().filter((cell) => cell.crossing).length, 7);
    assert.ok(engine.isPathSolved(solution));
    assert.ok(engine.isFieldSolved(solution));
    assert.equal(engine.hasMagnetPlacementConflict(boss, solution.flat(), engine.createEmptyBoardCells(boss)), false);
});

test("colored pegs and field arrows both resolve actual ambiguities", () => {
    const pegs = boss.pegs, fieldLines = boss.fieldLines, ruleIds = boss.ruleIds;
    try {
        boss.pegs = [];
        assert.equal(engine.solve(bossIndex).count, 2);
        boss.pegs = pegs;
        boss.ruleIds = ruleIds.filter((id) => id !== "color");
        assert.equal(engine.solve(bossIndex).count, 2);
        boss.ruleIds = ruleIds;
        boss.fieldLines = [];
        assert.equal(engine.solve(bossIndex).count, 2);
    } finally {
        boss.pegs = pegs;
        boss.fieldLines = fieldLines;
        boss.ruleIds = ruleIds;
    }
});

test("L/R is checked in the source-to-goal direction on splitting and merging paths", () => {
    for (const marked of solution.flat().filter((cell) => cell.turn)) {
        const board = clone(solution);
        board[marked.y][marked.x].turn = marked.turn === "L" ? "R" : "L";
        assert.equal(engine.isPathSolved(board), false);
    }
    const board = clone(solution);
    const cell = board[5][2];
    // A turn marker cannot be placed on a straight part of a merge branch.
    cell.turn = "R";
    assert.equal(engine.isPathSolved(board), false);
    cell.turn = "";
    // Test a bend on the other merge branch, before it joins the trunk.
    board[2][3].turn = "L";
    assert.ok(engine.isPathSolved(board));
    board[2][3].turn = "R";
    assert.equal(engine.isPathSolved(board), false);
});

test("wrong path topology and unused line segments cannot pass", () => {
    const groups = boss.pathGroups;
    try {
        boss.pathGroups = [{ starts: 2, ends: 2 }, { starts: 2, ends: 2 }];
        assert.equal(engine.isPathSolved(solution), false);
    } finally {
        boss.pathGroups = groups;
    }
    const board = clone(solution);
    board[1][1].paths = ["N", "S"];
    assert.equal(engine.isPathSolved(board), false);
});

test("field arrows require N to S across two different pieces", () => {
    const line = boss.fieldLines[0];
    const board = clone(solution);
    board[line.y][line.x].magnet = "S";
    assert.equal(engine.isFieldSolved(board), false);
    const samePiece = clone(solution);
    const offsets = { N: [0, -1], E: [1, 0], S: [0, 1], W: [-1, 0] };
    const [dx, dy] = offsets[line.dir];
    samePiece[line.y + dy][line.x + dx].pieceId = samePiece[line.y][line.x].pieceId;
    assert.equal(engine.isFieldSolved(samePiece), false);
});
