const boardScene = document.getElementById("boardScene");
const board = document.getElementById("board");
const pieceTray = document.getElementById("pieceTray");
const message = document.getElementById("message");
const solveButton = document.getElementById("solveButton");
const solverReport = document.getElementById("solverReport");
const stageLabel = document.getElementById("stageLabel");
const stageDescription = document.getElementById("stageDescription");
const currentStageName = document.getElementById("currentStageName");
const prevStageButton = document.getElementById("prevStageButton");
const nextStageButton = document.getElementById("nextStageButton");
const stageMenu = document.getElementById("stageMenu");
const boardSizeSlider = document.getElementById("boardSizeSlider");
const traySizeSlider = document.getElementById("traySizeSlider");
const boardSizeValue = document.getElementById("boardSizeValue");
const traySizeValue = document.getElementById("traySizeValue");
const helpToggle = document.getElementById("helpToggle");
const helpContent = document.getElementById("helpContent");
const rulesToggle = document.getElementById("rulesToggle");
const rulesContent = document.getElementById("rulesContent");
const ruleOverlay = document.getElementById("ruleOverlay");
const ruleDialogEyebrow = document.getElementById("ruleDialogEyebrow");
const ruleDialogTitle = document.getElementById("ruleDialogTitle");
const ruleDialogBody = document.getElementById("ruleDialogBody");
const ruleDialogClose = document.getElementById("ruleDialogClose");
const counterClockwiseKeyLabel = document.getElementById("counterClockwiseKeyLabel");
const clockwiseKeyLabel = document.getElementById("clockwiseKeyLabel");

const cellGap = 4;
const boardPadding = 8;
const clickDragThreshold = 6;
const keyBindingStorageKey = "windowPathKeyBindings";
const reservedBindingKeys = new Set(["escape", "tab", "shift", "control", "alt", "meta", "r"]);
const defaultKeyBindings = {
    counterclockwise: "a",
    clockwise: "d"
};
let trayCellSize = 40;
let boardCellSize = 64;
let keyBindings = { ...defaultKeyBindings };
let pendingKeyBindingAction = null;
let shownRuleIntroductionKeys = new Set();
let solvedStageIds = new Set();
const dirs = ["N", "E", "S", "W"];
const ruleSections = {
    peg: {
        title: "Peg와 구멍",
        items: [
            "peg가 있는 칸은 조각의 구멍 칸으로만 덮을 수 있어요.",
            "구멍은 peg보다 많을 수 있고, peg가 없는 칸에 놓여도 괜찮아요.",
            "peg와 구멍이 맞지 않으면 그 위치에는 조각을 놓을 수 없어요."
        ]
    },
    path: {
        title: "경로",
        items: [
            "S에서 시작한 선이 G까지 하나로 이어져야 해요.",
            "갈림길 없이, 그려진 모든 선이 정답 경로에 쓰여야 해요."
        ]
    },
    turn: {
        title: "좌회전과 우회전",
        items: [
            "구멍에 L이 있으면 그 칸에서 길이 왼쪽으로 꺾여야 해요.",
            "구멍에 R이 있으면 그 칸에서 길이 오른쪽으로 꺾여야 해요.",
            "L/R은 S에서 G로 길을 따라가는 방향을 기준으로 판단해요."
        ]
    },
    color: {
        title: "색 peg",
        items: [
            "색이 있는 peg는 같은 색 조각의 구멍으로만 덮을 수 있어요.",
            "같은 색 조각이 여러 개 있을 수 있으니, 색만 보고 바로 정답이 정해지지는 않아요.",
            "색 peg가 없는 구멍은 지금까지처럼 peg가 없는 칸에도 놓일 수 있어요."
        ]
    },
    magnet: {
        title: "자석",
        items: [
            "N과 S가 적힌 칸은 자석 칸이에요.",
            "N극은 빨간색, S극은 파란색으로 표시돼요.",
            "같은 극끼리 상하좌우로 맞닿으면 안 돼요.",
            "N-S처럼 다른 극끼리 맞닿거나, 자석이 없는 칸과 맞닿는 것은 괜찮아요."
        ]
    },
    field: {
        title: "자기력선",
        items: [
            "퍼즐판 위의 자기력선은 칸과 칸 사이에 걸친 N극에서 S극 방향 화살표예요.",
            "화살표가 시작되는 칸에는 N극이, 화살표가 향하는 바로 옆 칸에는 S극이 있어야 해요.",
            "붙어 있는 모든 N-S 사이에 자기력선이 있어야 하는 것은 아니에요."
        ]
    }
};
const piecePalette = [
    { name: "빨간", color: "#e15f41" },
    { name: "파란", color: "#2f80ed" },
    { name: "초록", color: "#27ae60" },
    { name: "노란", color: "#f2c94c" },
    { name: "보라", color: "#9b51e0" },
    { name: "청록", color: "#00a6a6" },
    { name: "분홍", color: "#eb5757" },
    { name: "남색", color: "#3454d1" }
];

const stages = [
    {
        id: "peg-tutorial",
        shortName: "1-1",
        label: "1-1단계: 기본 peg 튜토리얼",
        description: "모든 조각으로 4x4 판을 빈틈 없이 채우고, peg는 구멍 칸으로 덮어야 해요.",
        kind: "peg",
        ruleIds: ["peg"],
        boardSize: 4,
        pegs: [
            { x: 0, y: 1 },
            { x: 3, y: 1 },
            { x: 2, y: 2 }
        ],
        pieces: [
            {
                id: "red-l",
                name: "빨간 L",
                color: "#e15f41",
                cells: [
                    { x: 0, y: 0 },
                    { x: 1, y: 0, hole: true },
                    { x: 2, y: 0 },
                    { x: 0, y: 1, hole: true }
                ]
            },
            {
                id: "blue-l",
                name: "파란 L",
                color: "#2f80ed",
                cells: [
                    { x: 0, y: 0 },
                    { x: 1, y: 0, hole: true },
                    { x: 0, y: 1 },
                    { x: 0, y: 2 }
                ]
            },
            {
                id: "green-z",
                name: "초록 Z",
                color: "#27ae60",
                cells: [
                    { x: 0, y: 0 },
                    { x: 1, y: 0 },
                    { x: 1, y: 1, hole: true },
                    { x: 2, y: 1 }
                ]
            },
            {
                id: "gold-bar",
                name: "노란 막대",
                color: "#f2c94c",
                cells: [
                    { x: 0, y: 0 },
                    { x: 1, y: 0 },
                    { x: 2, y: 0 },
                    { x: 3, y: 0 }
                ]
            }
        ]
    },
    {
        id: "path-tutorial",
        shortName: "1-2",
        label: "1-2단계: 경로 튜토리얼",
        description: "모양이 다른 조각들로 4x4 판을 채우고, 그려진 선을 모두 S에서 G까지 이어보세요.",
        kind: "path",
        ruleIds: ["peg", "path"],
        boardSize: 4,
        pegs: [],
        endpoints: {
            start: { x: 0, y: 0, dir: "W", label: "S" },
            end: { x: 0, y: 3, dir: "W", label: "G" }
        },
        pieces: [
            {
                id: "red-path-crook",
                name: "빨간 꺾쇠",
                color: "#e15f41",
                cells: [
                    { x: 0, y: 0, paths: ["N", "E"] },
                    { x: 1, y: 0, paths: ["S", "W"] },
                    { x: 2, y: 0 },
                    { x: 0, y: 1 },
                    { x: 0, y: 2 }
                ]
            },
            {
                id: "blue-path-step",
                name: "파란 계단",
                color: "#2f80ed",
                cells: [
                    { x: 0, y: 0, paths: ["E", "W"] },
                    { x: 1, y: 0, paths: ["E", "W"] },
                    { x: 1, y: 1 },
                    { x: 2, y: 1 }
                ]
            },
            {
                id: "green-path-boot",
                name: "초록 부츠",
                color: "#27ae60",
                cells: [
                    { x: 1, y: 0, paths: ["N", "S"] },
                    { x: 1, y: 1, paths: ["N", "S"] },
                    { x: 0, y: 2 },
                    { x: 1, y: 2, paths: ["N", "E"] }
                ]
            },
            {
                id: "gold-path-corner",
                name: "노란 코너",
                color: "#f2c94c",
                cells: [
                    { x: 1, y: 0, paths: ["N", "S"] },
                    { x: 0, y: 1, paths: ["E", "W"] },
                    { x: 1, y: 1, paths: ["N", "W"] }
                ]
            }
        ]
    },
    {
        id: "hybrid-tutorial",
        shortName: "1-3",
        label: "1-3단계: peg + 경로",
        description: "5x5 판을 채우면서 peg는 구멍에 맞추고, 그려진 선은 모두 S에서 G까지 이어야 해요.",
        kind: "hybrid",
        ruleIds: ["peg", "path"],
        boardSize: 5,
        pegs: [
            { x: 1, y: 0 },
            { x: 3, y: 1 },
            { x: 0, y: 3 },
            { x: 4, y: 3 }
        ],
        endpoints: {
            start: { x: 2, y: 0, dir: "N", label: "S" },
            end: { x: 4, y: 2, dir: "E", label: "G" }
        },
        pieces: [
            {
                id: "red-hybrid-crook",
                name: "빨간 긴팔",
                color: "#e15f41",
                cells: [
                    { x: 0, y: 0 },
                    { x: 1, y: 0, hole: true },
                    { x: 2, y: 0, paths: ["N", "S"] },
                    { x: 0, y: 1, paths: ["E", "S"] },
                    { x: 0, y: 2, hole: true, paths: ["N", "S"] }
                ]
            },
            {
                id: "blue-hybrid-block",
                name: "파란 굽은판",
                color: "#2f80ed",
                cells: [
                    { x: 1, y: 0, hole: true },
                    { x: 2, y: 0 },
                    { x: 0, y: 1, paths: ["N", "S"] },
                    { x: 1, y: 1 },
                    { x: 2, y: 1, hole: true }
                ]
            },
            {
                id: "green-hybrid-zig",
                name: "초록 번개",
                color: "#27ae60",
                cells: [
                    { x: 0, y: 0, hole: true, paths: ["E", "W"] },
                    { x: 1, y: 0, paths: ["N", "W"] },
                    { x: 1, y: 1 },
                    { x: 2, y: 1, paths: ["S", "E"] },
                    { x: 2, y: 2, paths: ["W", "N"] }
                ]
            },
            {
                id: "violet-hybrid-hook",
                name: "보라 갈고리",
                color: "#9b51e0",
                cells: [
                    { x: 1, y: 0, hole: true },
                    { x: 0, y: 1, hole: true, paths: ["N", "E"] },
                    { x: 1, y: 1, paths: ["W", "E"] },
                    { x: 0, y: 2 }
                ]
            },
            {
                id: "gold-hybrid-wide",
                name: "노란 받침",
                color: "#f2c94c",
                cells: [
                    { x: 1, y: 0, paths: ["W", "E"] },
                    { x: 3, y: 0, hole: true },
                    { x: 0, y: 1 },
                    { x: 1, y: 1 },
                    { x: 2, y: 1, hole: true },
                    { x: 3, y: 1 }
                ]
            }
        ]
    },
    {
        id: "hybrid-practice",
        shortName: "1-4",
        label: "1-4단계: peg + 경로 연습",
        description: "1-3과 같은 규칙이지만 다른 5x5 판이에요. 구멍과 선을 같이 보면서 맞춰보세요.",
        kind: "hybrid",
        ruleIds: ["peg", "path"],
        boardSize: 5,
        pegs: [
            { x: 1, y: 0 },
            { x: 4, y: 1 },
            { x: 2, y: 3 },
            { x: 0, y: 4 }
        ],
        endpoints: {
            start: { x: 1, y: 0, dir: "N", label: "S" },
            end: { x: 2, y: 4, dir: "S", label: "G" }
        },
        pieces: [
            {
                id: "red-practice-arch",
                name: "빨간 아치",
                color: "#e15f41",
                cells: [
                    { x: 0, y: 0 },
                    { x: 1, y: 0, hole: true, paths: ["N", "E"] },
                    { x: 2, y: 0, paths: ["W", "E"] },
                    { x: 0, y: 1, hole: true },
                    { x: 2, y: 1 }
                ]
            },
            {
                id: "blue-practice-tall",
                name: "파란 기둥",
                color: "#2f80ed",
                cells: [
                    { x: 0, y: 0, paths: ["W", "E"] },
                    { x: 1, y: 0, hole: true, paths: ["W", "S"] },
                    { x: 0, y: 1 },
                    { x: 0, y: 2 }
                ]
            },
            {
                id: "green-practice-cross",
                name: "초록 십자",
                color: "#27ae60",
                cells: [
                    { x: 1, y: 0 },
                    { x: 0, y: 1, hole: true, paths: ["E", "S"] },
                    { x: 1, y: 1, paths: ["E", "W"] },
                    { x: 2, y: 1, paths: ["S", "W"] },
                    { x: 1, y: 2, hole: true }
                ]
            },
            {
                id: "violet-practice-wall",
                name: "보라 벽",
                color: "#9b51e0",
                cells: [
                    { x: 2, y: 0, hole: true, paths: ["N", "S"] },
                    { x: 2, y: 1, paths: ["N", "S"] },
                    { x: 0, y: 2, hole: true, paths: ["E", "N"] },
                    { x: 1, y: 2, paths: ["E", "W"] },
                    { x: 2, y: 2, paths: ["N", "W"] },
                    { x: 2, y: 3 }
                ]
            },
            {
                id: "gold-practice-base",
                name: "노란 받침대",
                color: "#f2c94c",
                cells: [
                    { x: 0, y: 0, paths: ["N", "S"] },
                    { x: 0, y: 1, hole: true, paths: ["N", "E"] },
                    { x: 1, y: 1, paths: ["W", "E"] },
                    { x: 2, y: 1, paths: ["W", "S"] },
                    { x: 3, y: 1, hole: true }
                ]
            }
        ]
    },
    {
        id: "tutorial-finale",
        shortName: "1-X",
        label: "1-X단계: 튜토리얼 종합",
        description: "6x6 판에서 peg, 구멍, 경로 규칙을 모두 사용해요. 스테이지 1의 마지막 연습 퍼즐입니다.",
        kind: "hybrid",
        ruleIds: ["peg", "path"],
        boardSize: 6,
        pegs: [
            { x: 1, y: 0 },
            { x: 4, y: 1 },
            { x: 1, y: 2 },
            { x: 4, y: 2 },
            { x: 3, y: 4 },
            { x: 5, y: 4 },
            { x: 2, y: 5 }
        ],
        endpoints: {
            start: { x: 0, y: 0, dir: "W", label: "S" },
            end: { x: 0, y: 5, dir: "W", label: "G" }
        },
        pieces: [
            {
                id: "final-crown",
                name: "빨간 왕관",
                color: "#e15f41",
                cells: [
                    { x: 0, y: 0, paths: ["W", "E"] },
                    { x: 1, y: 0, hole: true, paths: ["W", "E"] },
                    { x: 2, y: 0, paths: ["W", "E"] },
                    { x: 0, y: 1, hole: true, paths: ["E", "S"] },
                    { x: 2, y: 1, paths: ["E", "W"] },
                    { x: 2, y: 2, hole: true, paths: ["W", "E"] }
                ]
            },
            {
                id: "final-bridge",
                name: "파란 다리",
                color: "#2f80ed",
                cells: [
                    { x: 0, y: 0, paths: ["W", "E"] },
                    { x: 1, y: 0, paths: ["W", "E"] },
                    { x: 2, y: 0, hole: true, paths: ["W", "S"] },
                    { x: 1, y: 1, hole: true, paths: ["E", "W"] },
                    { x: 2, y: 1, paths: ["N", "W"] },
                    { x: 2, y: 2, paths: ["W", "S"] }
                ]
            },
            {
                id: "final-stair",
                name: "초록 계단",
                color: "#27ae60",
                cells: [
                    { x: 1, y: 0, hole: true, paths: ["E", "W"] },
                    { x: 0, y: 1, paths: ["N", "E"] },
                    { x: 1, y: 1, hole: true, paths: ["W", "E"] },
                    { x: 0, y: 2, paths: ["E", "S"] },
                    { x: 0, y: 3, hole: true, paths: ["N", "E"] },
                    { x: 1, y: 3, paths: ["W", "E"] }
                ]
            },
            {
                id: "final-bolt",
                name: "노란 번개",
                color: "#f2c94c",
                cells: [
                    { x: 0, y: 0, paths: ["E", "W"] },
                    { x: 0, y: 1, paths: ["W", "E"] },
                    { x: 1, y: 1, hole: true, paths: ["W", "E"] },
                    { x: 0, y: 2, hole: true, paths: ["E", "W"] }
                ]
            },
            {
                id: "final-lake",
                name: "보라 호수",
                color: "#9b51e0",
                cells: [
                    { x: 0, y: 0, paths: ["E", "W"] },
                    { x: 1, y: 0, paths: ["E", "W"] },
                    { x: 1, y: 1, hole: true, paths: ["W", "E"] },
                    { x: 2, y: 1, hole: true, paths: ["W", "E"] },
                    { x: 3, y: 1, paths: ["W", "E"] }
                ]
            },
            {
                id: "final-hook",
                name: "청록 갈고리",
                color: "#00a6a6",
                cells: [
                    { x: 0, y: 0, paths: ["E", "W"] },
                    { x: 1, y: 0, paths: ["N", "W"] },
                    { x: 1, y: 1, hole: true, paths: ["W", "S"] },
                    { x: 0, y: 2, hole: true, paths: ["E", "W"] },
                    { x: 1, y: 2, paths: ["N", "W"] }
                ]
            },
            {
                id: "final-bar",
                name: "분홍 막대",
                color: "#eb5757",
                cells: [
                    { x: 0, y: 0, paths: ["E", "W"] },
                    { x: 1, y: 0, paths: ["E", "W"] },
                    { x: 2, y: 0, hole: true, paths: ["E", "W"] },
                    { x: 3, y: 0, paths: ["E", "W"] }
                ]
            }
        ]
    },
    {
        id: "turn-tutorial",
        shortName: "2-1",
        label: "2-1단계: 좌회전과 우회전",
        description: "5x5 판에서 L/R 표시가 있는 구멍을 기준으로, 길이 지정된 방향으로 꺾이게 맞춰보세요.",
        kind: "turn",
        ruleIds: ["peg", "path", "turn"],
        boardSize: 5,
        pegs: [
            { x: 1, y: 2 },
            { x: 3, y: 3 },
            { x: 1, y: 4 },
            { x: 3, y: 4 }
        ],
        endpoints: {
            start: { x: 0, y: 0, dir: "W", label: "S" },
            end: { x: 0, y: 4, dir: "W", label: "G" }
        },
        pieces: [
            {
                id: "turn-red-arm",
                name: "빨간 긴 L",
                color: "#e15f41",
                cells: [
                    { x: 0, y: 0, paths: ["W", "E"] },
                    { x: 1, y: 0, paths: ["W", "E"] },
                    { x: 2, y: 0, hole: true, paths: ["W", "E"] },
                    { x: 0, y: 1, hole: true, turn: "L", paths: ["E", "S"] },
                    { x: 0, y: 2, hole: true, turn: "L", paths: ["N", "E"] }
                ]
            },
            {
                id: "turn-blue-corner",
                name: "파란 모서리",
                color: "#2f80ed",
                cells: [
                    { x: 0, y: 0, paths: ["W", "E"] },
                    { x: 1, y: 0, hole: true, turn: "R", paths: ["W", "S"] },
                    { x: 0, y: 1, paths: ["E", "W"] },
                    { x: 1, y: 1, hole: true, turn: "R", paths: ["N", "W"] }
                ]
            },
            {
                id: "turn-green-square",
                name: "초록 네모",
                color: "#27ae60",
                cells: [
                    { x: 0, y: 0, paths: ["E", "W"] },
                    { x: 1, y: 0, paths: ["E", "W"] },
                    { x: 0, y: 1, hole: true, paths: ["W", "E"] },
                    { x: 1, y: 1, paths: ["W", "E"] }
                ]
            },
            {
                id: "turn-violet-bend",
                name: "보라 굽이",
                color: "#9b51e0",
                cells: [
                    { x: 0, y: 0, paths: ["W", "E"] },
                    { x: 1, y: 0, hole: true, turn: "R", paths: ["W", "S"] },
                    { x: 0, y: 1, hole: true, paths: ["E", "W"] },
                    { x: 1, y: 1, hole: true, turn: "R", paths: ["N", "W"] }
                ]
            },
            {
                id: "turn-gold-door",
                name: "노란 작은 L",
                color: "#f2c94c",
                cells: [
                    { x: 0, y: 0, hole: true, turn: "L", paths: ["E", "S"] },
                    { x: 1, y: 0, paths: ["E", "W"] },
                    { x: 0, y: 1, hole: true, turn: "R", paths: ["N", "W"] },
                    { x: 1, y: 1, hole: true }
                ]
            },
            {
                id: "turn-teal-tail",
                name: "청록 꼬리",
                color: "#00a6a6",
                cells: [
                    { x: 0, y: 0, paths: ["E", "W"] },
                    { x: 0, y: 1, hole: true },
                    { x: 1, y: 1, hole: true },
                    { x: 2, y: 1, hole: true }
                ]
            }
        ]
    },
    {
        id: "color-peg-tutorial",
        shortName: "2-2",
        label: "2-2단계: 색 peg",
        description: "5x5 판에서 색 peg는 같은 색 조각의 구멍으로 덮고, L/R 구멍은 지정된 방향으로 꺾어야 해요.",
        kind: "color",
        fixedColors: true,
        ruleIds: ["peg", "path", "turn", "color"],
        boardSize: 5,
        pegs: [
            { x: 0, y: 1, colorKey: "red", color: "#e15f41" },
            { x: 0, y: 2, colorKey: "red", color: "#e15f41" },
            { x: 3, y: 1, colorKey: "blue", color: "#2f80ed" },
            { x: 1, y: 2, colorKey: "yellow", color: "#f2c94c" },
            { x: 4, y: 3, colorKey: "red", color: "#e15f41" },
            { x: 0, y: 4, colorKey: "blue", color: "#2f80ed" },
            { x: 3, y: 4, colorKey: "yellow", color: "#f2c94c" }
        ],
        endpoints: {
            start: { x: 2, y: 0, dir: "N", label: "S" },
            end: { x: 4, y: 2, dir: "E", label: "G" }
        },
        pieces: [
            {
                id: "color-red-long-l",
                name: "빨간 긴 L",
                color: "#e15f41",
                colorKey: "red",
                cells: [
                    { x: 0, y: 0, hole: true, paths: ["E", "S"] },
                    { x: 1, y: 0, paths: ["E", "W"] },
                    { x: 2, y: 0, paths: ["N", "W"] },
                    { x: 0, y: 1, hole: true, paths: ["N", "S"] },
                    { x: 0, y: 2, hole: true, turn: "L", paths: ["N", "E"] }
                ]
            },
            {
                id: "color-blue-corner",
                name: "파란 모서리",
                color: "#2f80ed",
                colorKey: "blue",
                cells: [
                    { x: 0, y: 0 },
                    { x: 1, y: 0, hole: true },
                    { x: 0, y: 1, hole: true, turn: "R", paths: ["W", "S"] },
                    { x: 1, y: 1, hole: true }
                ]
            },
            {
                id: "color-yellow-square",
                name: "노란 네모",
                color: "#f2c94c",
                colorKey: "yellow",
                cells: [
                    { x: 0, y: 0, paths: ["S", "E"] },
                    { x: 1, y: 0, paths: ["W", "E"] },
                    { x: 0, y: 1, hole: true, paths: ["W", "N"] },
                    { x: 1, y: 1, hole: true }
                ]
            },
            {
                id: "color-red-bend",
                name: "빨간 굽이",
                color: "#e15f41",
                colorKey: "red",
                cells: [
                    { x: 0, y: 0, paths: ["N", "E"] },
                    { x: 1, y: 0, paths: ["W", "E"] },
                    { x: 0, y: 1, hole: true },
                    { x: 1, y: 1, hole: true }
                ]
            },
            {
                id: "color-blue-door",
                name: "파란 문",
                color: "#2f80ed",
                colorKey: "blue",
                cells: [
                    { x: 0, y: 0 },
                    { x: 1, y: 0, hole: true },
                    { x: 0, y: 1, hole: true },
                    { x: 1, y: 1 }
                ]
            },
            {
                id: "color-yellow-tail",
                name: "노란 꼬리",
                color: "#f2c94c",
                colorKey: "yellow",
                cells: [
                    { x: 0, y: 0 },
                    { x: 0, y: 1, hole: true },
                    { x: 1, y: 1, hole: true },
                    { x: 2, y: 1, hole: true }
                ]
            }
        ]
    },
    {
        id: "color-peg-hard-start",
        shortName: "2-3",
        label: "2-3단계: 흔들리는 첫 수",
        description: "6x6 판에서 색 peg와 L/R 구멍을 함께 보며 길을 잇는 고난도 퍼즐이에요.",
        kind: "color",
        fixedColors: true,
        ruleIds: ["peg", "path", "turn", "color"],
        boardSize: 6,
        pegs: [
            { x: 4, y: 1, colorKey: "yellow", color: "#f2c94c" },
            { x: 1, y: 2, colorKey: "blue", color: "#2f80ed" },
            { x: 4, y: 3, colorKey: "yellow", color: "#f2c94c" },
            { x: 0, y: 4, colorKey: "red", color: "#e15f41" },
            { x: 3, y: 5, colorKey: "blue", color: "#2f80ed" }
        ],
        endpoints: {
            start: { x: 2, y: 0, dir: "N", label: "S" },
            end: { x: 5, y: 4, dir: "E", label: "G" }
        },
        pieces: [
            {
                id: "hard-small-1",
                name: "빨간 작은 문",
                color: "#e15f41",
                colorKey: "red",
                cells: [
                    { x: 0, y: 0, paths: ["E", "S"] },
                    { x: 0, y: 1, hole: true, paths: ["N", "S"] },
                    { x: 1, y: 1, hole: true, paths: ["E", "N"] },
                    { x: 0, y: 2, paths: ["N", "S"] }
                ]
            },
            {
                id: "hard-small-2",
                name: "파란 짧은 다리",
                color: "#2f80ed",
                colorKey: "blue",
                cells: [
                    { x: 0, y: 0, hole: true, paths: ["S", "W"] },
                    { x: 1, y: 0, paths: ["N", "S"] },
                    { x: 2, y: 0, hole: true, paths: ["S", "E"] },
                    { x: 1, y: 1, paths: ["N", "W"] }
                ]
            },
            {
                id: "hard-small-3",
                name: "노란 꺾인 발",
                color: "#f2c94c",
                colorKey: "yellow",
                cells: [
                    { x: 1, y: 0, hole: true, paths: ["W", "E"] },
                    { x: 2, y: 0, hole: true, paths: ["W", "S"] },
                    { x: 0, y: 1, paths: ["S", "N"] },
                    { x: 1, y: 1, hole: true, turn: "L", paths: ["E", "S"] }
                ]
            },
            {
                id: "hard-small-4",
                name: "빨간 작은 계단",
                color: "#e15f41",
                colorKey: "red",
                cells: [
                    { x: 1, y: 0, paths: ["N", "W"] },
                    { x: 0, y: 1, hole: true, turn: "L", paths: ["N", "E"] },
                    { x: 1, y: 1, paths: ["W", "S"] },
                    { x: 1, y: 2, hole: true, paths: ["N", "W"] }
                ]
            },
            {
                id: "hard-small-5",
                name: "파란 낮은 탑",
                color: "#2f80ed",
                colorKey: "blue",
                cells: [
                    { x: 0, y: 0, hole: true, turn: "R", paths: ["S", "E"] },
                    { x: 1, y: 0, paths: ["W", "S"] },
                    { x: 2, y: 0, hole: true, paths: ["S", "N"] },
                    { x: 1, y: 1, hole: true, paths: ["N", "S"] }
                ]
            },
            {
                id: "hard-small-6",
                name: "빨간 비틀린 길",
                color: "#e15f41",
                colorKey: "red",
                cells: [
                    { x: 0, y: 0, hole: true, paths: ["N", "S"] },
                    { x: 0, y: 1, hole: true, paths: ["N", "S"] },
                    { x: 0, y: 2, hole: true, paths: ["N", "E"] },
                    { x: 1, y: 2, paths: ["W", "N"] }
                ]
            },
            {
                id: "hard-small-7",
                name: "노란 얕은 홈",
                color: "#f2c94c",
                colorKey: "yellow",
                cells: [
                    { x: 0, y: 0, hole: true, paths: ["S", "N"] },
                    { x: 0, y: 1, hole: true, paths: ["S", "N"] },
                    { x: 1, y: 1, paths: ["N", "S"] },
                    { x: 1, y: 2, paths: ["N", "E"] }
                ]
            },
            {
                id: "hard-small-8",
                name: "파란 옆걸음",
                color: "#2f80ed",
                colorKey: "blue",
                cells: [
                    { x: 0, y: 0, paths: ["S", "N"] },
                    { x: 0, y: 1, hole: true, paths: ["S", "N"] },
                    { x: 0, y: 2, hole: true, turn: "L", paths: ["W", "N"] },
                    { x: 1, y: 2, hole: true, paths: ["N", "E"] }
                ]
            },
            {
                id: "hard-small-9",
                name: "노란 마지막 고리",
                color: "#f2c94c",
                colorKey: "yellow",
                cells: [
                    { x: 0, y: 0, hole: true, paths: ["E", "S"] },
                    { x: 0, y: 1, hole: true, paths: ["N", "S"] },
                    { x: 1, y: 1, paths: ["S", "E"] },
                    { x: 1, y: 2, hole: true, paths: ["W", "N"] }
                ]
            }
        ]
    },
    {
        id: "color-peg-rectangle",
        shortName: "2-4",
        label: "2-4단계: 직사각형 판",
        description: "7x5 직사각형 판에서 색 peg와 L/R 구멍을 함께 맞추는 퍼즐이에요.",
        kind: "color",
        fixedColors: true,
        ruleIds: ["peg", "path", "turn", "color"],
        boardWidth: 7,
        boardHeight: 5,
        pegs: [
            { x: 2, y: 1, colorKey: "red", color: "#e15f41" },
            { x: 5, y: 1, colorKey: "blue", color: "#2f80ed" },
            { x: 1, y: 3, colorKey: "red", color: "#e15f41" },
            { x: 4, y: 3, colorKey: "yellow", color: "#f2c94c" },
            { x: 3, y: 4, colorKey: "red", color: "#e15f41" }
        ],
        endpoints: {
            start: { x: 0, y: 2, dir: "W", label: "S" },
            end: { x: 6, y: 2, dir: "E", label: "G" }
        },
        pieces: [
            {
                id: "rect-1",
                name: "빨간 넓은 모서리",
                color: "#e15f41",
                colorKey: "red",
                cells: [
                    { x: 0, y: 0, hole: true, turn: "R", paths: ["S", "E"] },
                    { x: 1, y: 0, hole: true, paths: ["W", "E"] },
                    { x: 2, y: 0, paths: ["W", "E"] },
                    { x: 0, y: 1, paths: ["E", "N"] },
                    { x: 1, y: 1, paths: ["E", "W"] }
                ]
            },
            {
                id: "rect-2",
                name: "파란 흔들린 계단",
                color: "#2f80ed",
                colorKey: "blue",
                cells: [
                    { x: 0, y: 0, hole: true, paths: ["W", "E"] },
                    { x: 1, y: 0, paths: ["W", "E"] },
                    { x: 2, y: 0, hole: true, paths: ["W", "E"] },
                    { x: 1, y: 1, paths: ["E", "W"] },
                    { x: 2, y: 1, hole: true, paths: ["S", "W"] }
                ]
            },
            {
                id: "rect-3",
                name: "노란 꺾인 복도",
                color: "#f2c94c",
                colorKey: "yellow",
                cells: [
                    { x: 2, y: 0, paths: ["W", "S"] },
                    { x: 2, y: 1, hole: true, paths: ["N", "S"] },
                    { x: 0, y: 2, hole: true, paths: ["W", "E"] },
                    { x: 1, y: 2, paths: ["W", "N"] },
                    { x: 2, y: 2, paths: ["N", "E"] }
                ]
            },
            {
                id: "rect-4",
                name: "빨간 작은 발판",
                color: "#e15f41",
                colorKey: "red",
                cells: [
                    { x: 0, y: 0, hole: true, paths: ["E", "W"] },
                    { x: 1, y: 0, paths: ["E", "W"] },
                    { x: 0, y: 1, hole: true, paths: ["W", "E"] },
                    { x: 0, y: 2, hole: true, paths: ["E", "W"] }
                ]
            },
            {
                id: "rect-5",
                name: "파란 낮은 기둥",
                color: "#2f80ed",
                colorKey: "blue",
                cells: [
                    { x: 0, y: 0, paths: ["W", "S"] },
                    { x: 1, y: 0, hole: true, turn: "R", paths: ["S", "E"] },
                    { x: 0, y: 1, paths: ["N", "S"] },
                    { x: 0, y: 2, hole: true, turn: "L", paths: ["N", "E"] }
                ]
            },
            {
                id: "rect-6",
                name: "노란 잠긴 고리",
                color: "#f2c94c",
                colorKey: "yellow",
                cells: [
                    { x: 0, y: 0, hole: true, paths: ["W", "E"] },
                    { x: 0, y: 1, hole: true, paths: ["E", "W"] },
                    { x: 1, y: 1, hole: true, paths: ["E", "W"] },
                    { x: 2, y: 1, paths: ["E", "W"] }
                ]
            },
            {
                id: "rect-7",
                name: "빨간 얕은 홈",
                color: "#e15f41",
                colorKey: "red",
                cells: [
                    { x: 0, y: 0, hole: true, turn: "R", paths: ["E", "N"] },
                    { x: 0, y: 1, hole: true, paths: ["W", "E"] },
                    { x: 1, y: 1, hole: true, paths: ["W", "E"] },
                    { x: 2, y: 1, hole: true, paths: ["W", "E"] }
                ]
            },
            {
                id: "rect-8",
                name: "파란 마지막 문",
                color: "#2f80ed",
                colorKey: "blue",
                cells: [
                    { x: 2, y: 0, paths: ["S", "W"] },
                    { x: 0, y: 1, paths: ["W", "E"] },
                    { x: 1, y: 1, hole: true, paths: ["W", "E"] },
                    { x: 2, y: 1, hole: true, turn: "L", paths: ["W", "N"] }
                ]
            }
        ]
    },
    {
        id: "color-peg-finale",
        shortName: "2-X",
        label: "2-X단계: 색과 회전의 종합",
        description: "8x5 직사각형 판에서 색 peg, 구멍, L/R 회전, S-G 경로를 모두 맞추는 스테이지 2의 마지막 퍼즐이에요.",
        kind: "color",
        fixedColors: true,
        ruleIds: ["peg", "path", "turn", "color"],
        boardWidth: 8,
        boardHeight: 5,
        pegs: [
            { x: 4, y: 2, colorKey: "yellow", color: "#f2c94c" },
            { x: 0, y: 4, colorKey: "red", color: "#e15f41" },
            { x: 7, y: 1, colorKey: "blue", color: "#2f80ed" },
            { x: 5, y: 1, colorKey: "red", color: "#e15f41" },
            { x: 6, y: 3, colorKey: "blue", color: "#2f80ed" }
        ],
        endpoints: {
            start: { x: 0, y: 2, dir: "W", label: "S" },
            end: { x: 7, y: 2, dir: "E", label: "G" }
        },
        pieces: [
            {
                id: "final2-1",
                name: "빨간 첫 굽이",
                color: "#e15f41",
                colorKey: "red",
                cells: [
                    { x: 0, y: 0, hole: true, turn: "R", paths: ["S", "E"] },
                    { x: 0, y: 1, hole: true, paths: ["E", "N"] },
                    { x: 1, y: 1, paths: ["S", "W"] },
                    { x: 0, y: 2, paths: ["W", "S"] }
                ]
            },
            {
                id: "final2-2",
                name: "파란 잠긴 계단",
                color: "#2f80ed",
                colorKey: "blue",
                cells: [
                    { x: 0, y: 0, hole: true, paths: ["W", "E"] },
                    { x: 1, y: 0, hole: true, turn: "R", paths: ["W", "S"] },
                    { x: 1, y: 1, paths: ["N", "S"] },
                    { x: 1, y: 2, paths: ["N", "S"] }
                ]
            },
            {
                id: "final2-3",
                name: "노란 가느다란 문",
                color: "#f2c94c",
                colorKey: "yellow",
                cells: [
                    { x: 0, y: 0, hole: true, turn: "R", paths: ["S", "E"] },
                    { x: 1, y: 0, hole: true, paths: ["W", "E"] },
                    { x: 1, y: 1, paths: ["E", "S"] },
                    { x: 1, y: 2, hole: true, paths: ["N", "S"] }
                ]
            },
            {
                id: "final2-4",
                name: "빨간 헛걸음",
                color: "#e15f41",
                colorKey: "red",
                cells: [
                    { x: 0, y: 0, hole: true, paths: ["W", "E"] },
                    { x: 0, y: 1, hole: true, turn: "L", paths: ["S", "W"] },
                    { x: 1, y: 1, hole: true, paths: ["E", "S"] },
                    { x: 0, y: 2, paths: ["E", "N"] }
                ]
            },
            {
                id: "final2-5",
                name: "파란 낮은 홈",
                color: "#2f80ed",
                colorKey: "blue",
                cells: [
                    { x: 0, y: 0, hole: true, paths: ["W", "E"] },
                    { x: 1, y: 0, hole: true, turn: "R", paths: ["W", "S"] },
                    { x: 1, y: 1, hole: true, paths: ["N", "W"] },
                    { x: 1, y: 2, paths: ["S", "E"] }
                ]
            },
            {
                id: "final2-6",
                name: "노란 비탈길",
                color: "#f2c94c",
                colorKey: "yellow",
                cells: [
                    { x: 0, y: 0, hole: true, paths: ["S", "N"] },
                    { x: 0, y: 1, hole: true, paths: ["S", "N"] },
                    { x: 0, y: 2, paths: ["S", "N"] },
                    { x: 1, y: 2, paths: ["N", "S"] }
                ]
            },
            {
                id: "final2-7",
                name: "빨간 겹친 발판",
                color: "#e15f41",
                colorKey: "red",
                cells: [
                    { x: 1, y: 0, hole: true, paths: ["S", "N"] },
                    { x: 0, y: 1, hole: true, paths: ["N", "S"] },
                    { x: 1, y: 1, paths: ["S", "N"] },
                    { x: 0, y: 2, hole: true, turn: "L", paths: ["N", "E"] }
                ]
            },
            {
                id: "final2-8",
                name: "파란 꺾인 고리",
                color: "#2f80ed",
                colorKey: "blue",
                cells: [
                    { x: 0, y: 0, hole: true, turn: "R", paths: ["N", "W"] },
                    { x: 0, y: 1, hole: true, paths: ["W", "S"] },
                    { x: 1, y: 1, hole: true, paths: ["S", "N"] },
                    { x: 1, y: 2, paths: ["W", "N"] }
                ]
            },
            {
                id: "final2-9",
                name: "노란 긴 복도",
                color: "#f2c94c",
                colorKey: "yellow",
                cells: [
                    { x: 1, y: 0, hole: true, paths: ["N", "S"] },
                    { x: 0, y: 1, hole: true, turn: "L", paths: ["W", "N"] },
                    { x: 1, y: 1, paths: ["N", "E"] },
                    { x: 2, y: 1, paths: ["W", "N"] }
                ]
            },
            {
                id: "final2-10",
                name: "빨간 마지막 틈",
                color: "#e15f41",
                colorKey: "red",
                cells: [
                    { x: 1, y: 0, hole: true, turn: "R", paths: ["S", "E"] },
                    { x: 0, y: 1, hole: true, paths: ["N", "E"] },
                    { x: 1, y: 1, paths: ["W", "N"] },
                    { x: 2, y: 1, paths: ["N", "E"] }
                ]
            }
        ]
    },
    {
        id: "magnet-tutorial",
        shortName: "3-1",
        label: "3-1단계: 자석 튜토리얼",
        description: "peg와 S-G 경로를 맞추면서, N/S 자석 칸도 같은 극끼리 맞닿지 않게 놓아야 해요.",
        kind: "magnet",
        ruleIds: ["peg", "path", "magnet"],
        boardSize: 5,
        pegs: [
            { x: 1, y: 0 },
            { x: 3, y: 1 }
        ],
        endpoints: {
            start: { x: 2, y: 0, dir: "N", label: "S" },
            end: { x: 4, y: 2, dir: "E", label: "G" }
        },
        pieces: [
            {
                id: "magnet-red-crook",
                name: "빨간 자석 긴팔",
                color: "#e15f41",
                cells: [
                    { x: 0, y: 0, magnet: "N" },
                    { x: 1, y: 0, hole: true },
                    { x: 2, y: 0, magnet: "S", paths: ["N", "S"] },
                    { x: 0, y: 1, magnet: "S" },
                    { x: 0, y: 2, hole: true }
                ]
            },
            {
                id: "magnet-blue-block",
                name: "파란 자석 굽은판",
                color: "#2f80ed",
                cells: [
                    { x: 0, y: 0, magnet: "N" },
                    { x: 1, y: 0, hole: true },
                    { x: 0, y: 1, hole: true },
                    { x: 1, y: 1, magnet: "N" },
                    { x: 1, y: 2, magnet: "S", paths: ["W", "E"] }
                ]
            },
            {
                id: "magnet-green-zig",
                name: "초록 자석 번개",
                color: "#27ae60",
                cells: [
                    { x: 0, y: 0, hole: true },
                    { x: 1, y: 0, magnet: "N", paths: ["N", "S"] },
                    { x: 1, y: 1, magnet: "S", paths: ["N", "E"] },
                    { x: 2, y: 1, magnet: "N", paths: ["W", "E"] },
                    { x: 2, y: 2, magnet: "S" }
                ]
            },
            {
                id: "magnet-violet-hook",
                name: "보라 자석 갈고리",
                color: "#9b51e0",
                cells: [
                    { x: 1, y: 0, hole: true },
                    { x: 0, y: 1, hole: true },
                    { x: 1, y: 1, magnet: "N" },
                    { x: 0, y: 2, magnet: "N" }
                ]
            },
            {
                id: "magnet-gold-wide",
                name: "노란 자석 받침",
                color: "#f2c94c",
                cells: [
                    { x: 1, y: 0, magnet: "N" },
                    { x: 3, y: 0, hole: true },
                    { x: 0, y: 1, magnet: "N" },
                    { x: 1, y: 1, magnet: "S" },
                    { x: 2, y: 1, hole: true },
                    { x: 3, y: 1, magnet: "S" }
                ]
            }
        ]
    },
    {
        id: "magnetic-field-lines",
        shortName: "3-2",
        label: "3-2단계: 자기력선",
        description: "6x6 판에서 작은 조각들의 peg, S-G 경로, 자석 극성, 자기력선 방향을 함께 맞춰요.",
        kind: "field",
        ruleIds: ["peg", "path", "magnet", "field"],
        boardSize: 6,
        pegs: [
            { x: 1, y: 0 },
            { x: 5, y: 2 },
            { x: 3, y: 5 }
        ],
        fieldLines: [
            { x: 0, y: 0, dir: "S" },
            { x: 4, y: 0, dir: "E" },
            { x: 3, y: 1, dir: "N" },
            { x: 3, y: 1, dir: "W" },
            { x: 5, y: 1, dir: "W" },
            { x: 4, y: 2, dir: "W" },
            { x: 2, y: 4, dir: "E" },
            { x: 5, y: 5, dir: "N" }
        ],
        endpoints: {
            start: { x: 0, y: 2, dir: "W", label: "S" },
            end: { x: 5, y: 5, dir: "E", label: "G" }
        },
        pieces: [
            {
                id: "field-arch",
                name: "빨간 자력 문",
                color: "#e15f41",
                cells: [
                    { x: 0, y: 0, magnet: "N" },
                    { x: 0, y: 1, magnet: "S" },
                    { x: 1, y: 1, hole: true },
                    { x: 0, y: 2, magnet: "N", paths: ["W", "E"] }
                ]
            },
            {
                id: "field-roof",
                name: "파란 자력 지붕",
                color: "#2f80ed",
                cells: [
                    { x: 0, y: 0, hole: true },
                    { x: 1, y: 0 },
                    { x: 2, y: 0, magnet: "S" },
                    { x: 1, y: 1, magnet: "S" }
                ]
            },
            {
                id: "field-corner",
                name: "초록 자력 꺾임",
                color: "#27ae60",
                cells: [
                    { x: 1, y: 0, magnet: "N" },
                    { x: 2, y: 0, magnet: "S" },
                    { x: 0, y: 1, magnet: "N" },
                    { x: 1, y: 1, magnet: "S" }
                ]
            },
            {
                id: "field-hook",
                name: "노란 자력 갈고리",
                color: "#f2c94c",
                cells: [
                    { x: 1, y: 0, magnet: "N" },
                    { x: 0, y: 1, magnet: "N", paths: ["W", "E"] },
                    { x: 1, y: 1, hole: true, paths: ["W", "S"] },
                    { x: 1, y: 2, paths: ["N", "W"] }
                ]
            },
            {
                id: "field-bridge",
                name: "보라 자력 다리",
                color: "#9b51e0",
                cells: [
                    { x: 0, y: 0, paths: ["W", "E"] },
                    { x: 1, y: 0, magnet: "N", paths: ["W", "E"] },
                    { x: 2, y: 0, magnet: "S", paths: ["W", "E"] },
                    { x: 1, y: 1, hole: true }
                ]
            },
            {
                id: "field-tall",
                name: "청록 자력 세로",
                color: "#00a6a6",
                cells: [
                    { x: 0, y: 0, magnet: "S" },
                    { x: 0, y: 1 },
                    { x: 0, y: 2 },
                    { x: 1, y: 2, magnet: "N" }
                ]
            },
            {
                id: "field-step",
                name: "분홍 자력 계단",
                color: "#eb5757",
                cells: [
                    { x: 0, y: 0, magnet: "N" },
                    { x: 0, y: 1 },
                    { x: 1, y: 1, magnet: "N" },
                    { x: 1, y: 2, magnet: "S" }
                ]
            },
            {
                id: "field-column",
                name: "남색 자력 기둥",
                color: "#3454d1",
                cells: [
                    { x: 0, y: 0, paths: ["E", "S"] },
                    { x: 0, y: 1, magnet: "S", paths: ["N", "S"] },
                    { x: 0, y: 2, hole: true, paths: ["N", "E"] },
                    { x: 1, y: 2, magnet: "S", paths: ["W", "E"] }
                ]
            },
            {
                id: "field-square",
                name: "노란 자력 네모",
                color: "#f2994a",
                cells: [
                    { x: 0, y: 0, magnet: "S", paths: ["E", "W"] },
                    { x: 0, y: 1 },
                    { x: 1, y: 1, magnet: "S" },
                    { x: 1, y: 2, magnet: "N", paths: ["W", "E"] }
                ]
            }
        ]
    }
];

let currentStageIndex = 0;
let pieces = [];
let activePieceId = null;
let ghostCells = [];
let dragging = false;
let dragSourceElement = null;
let dragCaptureElement = null;
let dragPreviewElement = null;
let dragOffset = { x: 0, y: 0 };
let lastPointer = { x: 0, y: 0 };
let pendingDrag = null;

function startGame(stageIndex = currentStageIndex) {
    currentStageIndex = clampStageIndex(stageIndex);
    const stage = getStage();
    board.style.setProperty("--board-width", getBoardWidth(stage));
    board.style.setProperty("--board-height", getBoardHeight(stage));
    pieces = stage.pieces.map(copyPiece);
    if (stage.fixedColors) {
        shuffleInPlace(pieces);
    } else {
        randomizePieceAppearance(pieces);
    }
    randomizePieceOrientations(pieces);
    activePieceId = pieces[0].id;
    ghostCells = [];
    dragging = false;
    cleanupDragPreview();
    stageLabel.textContent = stage.label;
    stageDescription.textContent = stage.description;
    currentStageName.textContent = stage.shortName;
    renderRules();
    setEndpointPadding(stage);
    createBoard();
    drawEndpoints();
    drawTray();
    drawBoard();
    updateStageControls();
    updateSolverReport("아직 검사하지 않았어요.");
    setMessage("조각을 보드 위로 끌어보세요.");
    maybeShowRuleIntroduction();
}

function createBoard() {
    const stage = getStage();
    board.innerHTML = "";

    for (let y = 0; y < getBoardHeight(stage); y++) {
        for (let x = 0; x < getBoardWidth(stage); x++) {
            const cell = document.createElement("div");
            cell.className = "cell";
            cell.dataset.x = x;
            cell.dataset.y = y;
            board.appendChild(cell);
        }
    }
}

function drawEndpoints() {
    boardScene.querySelectorAll(".endpoint").forEach((endpoint) => endpoint.remove());

    const stage = getStage();

    if (!hasPathRules(stage)) {
        return;
    }

    Object.values(stage.endpoints).forEach((endpoint) => {
        const element = document.createElement("div");
        element.className = `endpoint ${endpoint.label === "S" ? "start" : "end"} dir-${endpoint.dir.toLowerCase()}`;
        element.style.setProperty("--endpoint-row", endpoint.y);
        element.style.setProperty("--endpoint-col", endpoint.x);
        element.textContent = endpoint.label;
        boardScene.appendChild(element);
    });
}

function setEndpointPadding(stage) {
    const paddings = {
        N: "--scene-top-pad",
        E: "--scene-right-pad",
        S: "--scene-bottom-pad",
        W: "--scene-left-pad"
    };

    boardScene.classList.toggle("has-endpoints", hasPathRules(stage));
    Object.values(paddings).forEach((property) => boardScene.style.setProperty(property, "0px"));

    if (!hasPathRules(stage)) {
        return;
    }

    Object.values(stage.endpoints).forEach((endpoint) => {
        boardScene.style.setProperty(paddings[endpoint.dir], "58px");
    });
}

function drawBoard() {
    const cells = board.querySelectorAll(".cell");
    const ghostValid = canPlaceGhost();
    const activePiece = getActivePiece();
    const stage = getStage();

    cells.forEach((cell) => {
        const x = Number(cell.dataset.x);
        const y = Number(cell.dataset.y);
        const placedCell = getPlacedCell(x, y);
        const ghostCell = getGhostCell(x, y);
        const peg = getPeg(x, y);
        const fieldLines = getFieldLinesAt(x, y);

        cell.innerHTML = "";
        cell.className = "cell";
        cell.style.removeProperty("--piece-color");

        if (placedCell) {
            cell.classList.add("filled");
            cell.style.setProperty("--piece-color", placedCell.color);
            cell.dataset.pieceId = placedCell.pieceId;
            drawCellDetails(cell, placedCell);
        } else {
            delete cell.dataset.pieceId;
        }

        if (ghostCell && !placedCell && activePiece) {
            cell.classList.add("ghost");
            cell.style.setProperty("--piece-color", activePiece.color);

            if (!ghostValid) {
                cell.classList.add("invalid");
            }

            drawCellDetails(cell, ghostCell);
        }

        if (fieldLines.length > 0) {
            appendFieldLines(cell, fieldLines.map((line) => line.dir));
        }

        if (hasPegRules(stage) && peg) {
            appendPeg(cell, peg);
        }
    });
}

function drawCellDetails(parent, cell) {
    if (cell.paths.length > 0) {
        appendPath(parent, cell.paths);
    }

    if (cell.hole) {
        appendHole(parent);
    }

    if (cell.turn) {
        appendTurnMarker(parent, cell.turn);
    }

    if (cell.magnet && !cell.hole) {
        appendMagnetMarker(parent, cell.magnet);
    }
}

function drawTray() {
    pieceTray.innerHTML = "";

    pieces.forEach((piece) => {
        const pieceElement = document.createElement("div");
        pieceElement.className = "piece";
        pieceElement.dataset.pieceId = piece.id;
        pieceElement.dataset.rotation = piece.rotation;
        pieceElement.role = "button";
        pieceElement.tabIndex = 0;
        pieceElement.ariaLabel = `${piece.name} 드래그`;

        if (piece.placed) {
            pieceElement.classList.add("placed");
        }

        drawPieceCells(pieceElement, piece, trayCellSize);
        pieceElement.addEventListener("pointerdown", (event) => startTrayDrag(event, piece.id));
        pieceElement.addEventListener("contextmenu", preventPuzzleContextMenu);

        pieceTray.appendChild(pieceElement);
    });
}

function drawPieceCells(pieceElement, piece, cellSize) {
    const metrics = getPieceMetrics(piece, cellSize);

    pieceElement.innerHTML = "";
    pieceElement.style.width = `${metrics.width}px`;
    pieceElement.style.height = `${metrics.height}px`;
    pieceElement.style.setProperty("--piece-color", piece.color);
    pieceElement.dataset.rotation = piece.rotation;

    piece.cells.forEach((cell) => {
        const pieceCell = document.createElement("div");
        pieceCell.className = "piece-cell";
        pieceCell.style.left = `${cell.x * metrics.step}px`;
        pieceCell.style.top = `${cell.y * metrics.step}px`;
        pieceCell.style.width = `${metrics.cellSize}px`;
        pieceCell.style.height = `${metrics.cellSize}px`;
        drawCellDetails(pieceCell, cell);
        pieceElement.appendChild(pieceCell);
    });
}

function startTrayDrag(event, pieceId) {
    const piece = getPiece(pieceId);

    if (!piece || piece.placed || !isRotationPointerButton(event)) {
        return;
    }

    event.preventDefault();
    const sourceElement = getPieceElement(pieceId);
    const sourceRect = sourceElement.getBoundingClientRect();

    beginDrag({
        event,
        pieceId,
        sourceType: "tray",
        captureElement: sourceElement,
        sourceElement,
        dragOffset: {
            x: event.clientX - sourceRect.left,
            y: event.clientY - sourceRect.top
        }
    });
}

function startBoardDrag(event) {
    const cellElement = event.target.closest(".cell.filled");

    if (!cellElement || !board.contains(cellElement) || !isRotationPointerButton(event)) {
        return;
    }

    event.preventDefault();
    const x = Number(cellElement.dataset.x);
    const y = Number(cellElement.dataset.y);
    const placedCell = getPlacedCell(x, y);

    if (!placedCell) {
        return;
    }

    const piece = getPiece(placedCell.pieceId);
    const boardCells = piece.boardCells.map(copyCell);
    const origin = getPlacementOrigin(boardCells);
    const boardPoint = getBoardCellClientPosition(origin.x, origin.y);

    beginDrag({
        event,
        pieceId: piece.id,
        sourceType: "board",
        captureElement: board,
        sourceElement: null,
        boardOrigin: origin,
        dragOffset: {
            x: event.clientX - boardPoint.x,
            y: event.clientY - boardPoint.y
        }
    });
}

function beginDrag({ event, pieceId, sourceType, captureElement, sourceElement, boardOrigin, dragOffset: offset }) {
    activePieceId = pieceId;
    lastPointer = { x: event.clientX, y: event.clientY };
    dragCaptureElement = captureElement;
    pendingDrag = {
        pieceId,
        sourceType,
        sourceElement,
        boardOrigin,
        dragOffset: offset,
        button: event.button,
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY
    };

    dragCaptureElement.setPointerCapture(event.pointerId);
    dragCaptureElement.addEventListener("pointermove", moveDrag);
    dragCaptureElement.addEventListener("pointerup", endDrag);
    dragCaptureElement.addEventListener("pointercancel", cancelDrag);
}

function activatePendingDrag(event) {
    if (!pendingDrag) {
        return;
    }

    const piece = getPiece(pendingDrag.pieceId);

    if (!piece) {
        cleanupDragPreview();
        return;
    }

    if (pendingDrag.sourceType === "board") {
        piece.placed = false;
        piece.boardCells = [];
        drawTray();
        drawBoard();
        pendingDrag.sourceElement = getPieceElement(piece.id);
    }

    dragging = true;
    lastPointer = { x: event.clientX, y: event.clientY };
    dragSourceElement = pendingDrag.sourceElement;
    dragOffset = pendingDrag.dragOffset;
    dragSourceElement.classList.add("source-dragging");

    dragPreviewElement = document.createElement("div");
    dragPreviewElement.className = "piece dragging";
    document.body.appendChild(dragPreviewElement);
    drawPieceCells(dragPreviewElement, piece, boardCellSize);
    movePieceElement(dragPreviewElement, event.clientX, event.clientY);
    updateGhost(event.clientX, event.clientY);

    setMessage(hasPegRules(getStage())
        ? "peg가 있는 칸은 조각의 구멍으로만 덮을 수 있어요."
        : "그려진 선들이 모두 하나의 S-G 경로가 되어야 해요.");
}

function moveDrag(event) {
    if (!dragging && pendingDrag) {
        const dx = event.clientX - pendingDrag.startX;
        const dy = event.clientY - pendingDrag.startY;

        if (Math.hypot(dx, dy) < clickDragThreshold) {
            return;
        }

        activatePendingDrag(event);
    }

    if (!dragging || !dragPreviewElement) {
        return;
    }

    lastPointer = { x: event.clientX, y: event.clientY };
    movePieceElement(dragPreviewElement, event.clientX, event.clientY);
    updateGhost(event.clientX, event.clientY);
}

function endDrag() {
    if (pendingDrag && !dragging) {
        rotatePieceFromPointerClick(pendingDrag);
        ghostCells = [];
        cleanupDragPreview();
        drawTray();
        drawBoard();
        return;
    }

    if (!dragging) {
        return;
    }

    const piece = getActivePiece();
    dragging = false;

    if (piece && ghostCells.length > 0 && canPlaceGhost()) {
        piece.placed = true;
        piece.boardCells = ghostCells.map(copyCell);
        handleCompletionState();
    } else {
        setMessage(hasPegRules(getStage())
            ? "그 위치에는 놓을 수 없어요. peg가 막히지 않게 구멍을 맞춰보세요."
            : "그 위치에는 놓을 수 없어요. 보드 밖으로 나가거나 다른 조각과 겹치면 안 돼요.");
    }

    ghostCells = [];
    cleanupDragPreview();
    drawTray();
    drawBoard();
}

function cancelDrag() {
    ghostCells = [];
    dragging = false;
    cleanupDragPreview();
    drawTray();
    drawBoard();
}

function cleanupDragPreview() {
    if (dragSourceElement) {
        dragSourceElement.classList.remove("source-dragging");
    }

    if (dragCaptureElement) {
        dragCaptureElement.removeEventListener("pointermove", moveDrag);
        dragCaptureElement.removeEventListener("pointerup", endDrag);
        dragCaptureElement.removeEventListener("pointercancel", cancelDrag);
    }

    if (dragPreviewElement) {
        dragPreviewElement.remove();
    }

    dragSourceElement = null;
    dragCaptureElement = null;
    dragPreviewElement = null;
    pendingDrag = null;
}

function movePieceElement(pieceElement, clientX, clientY) {
    pieceElement.style.left = `${clientX - dragOffset.x}px`;
    pieceElement.style.top = `${clientY - dragOffset.y}px`;
}

function updateGhost(clientX, clientY) {
    const piece = getActivePiece();

    if (!piece) {
        ghostCells = [];
        drawBoard();
        return;
    }

    const pieceLeft = clientX - dragOffset.x;
    const pieceTop = clientY - dragOffset.y;
    const boardPosition = getBoardCellFromPiecePosition(pieceLeft, pieceTop);

    if (!boardPosition) {
        ghostCells = [];
        drawBoard();
        return;
    }

    ghostCells = piece.cells.map((cell) => ({
        x: boardPosition.x + cell.x,
        y: boardPosition.y + cell.y,
        hole: cell.hole,
        turn: cell.turn,
        magnet: cell.magnet,
        paths: [...cell.paths],
        fields: [...cell.fields]
    }));

    drawBoard();
}

function getBoardCellFromPiecePosition(pieceLeft, pieceTop) {
    const stage = getStage();
    const rect = board.getBoundingClientRect();
    const boardWidth = rect.width - boardPadding * 2;
    const boardHeight = rect.height - boardPadding * 2;
    const stepX = (boardWidth + cellGap) / getBoardWidth(stage);
    const stepY = (boardHeight + cellGap) / getBoardHeight(stage);
    const localX = pieceLeft - rect.left - boardPadding;
    const localY = pieceTop - rect.top - boardPadding;
    const x = Math.round(localX / stepX);
    const y = Math.round(localY / stepY);

    if (x < -1 || x > getBoardWidth(stage) || y < -1 || y > getBoardHeight(stage)) {
        return null;
    }

    return { x, y };
}

function getBoardCellClientPosition(x, y) {
    const stage = getStage();
    const rect = board.getBoundingClientRect();
    const boardWidth = rect.width - boardPadding * 2;
    const boardHeight = rect.height - boardPadding * 2;
    const stepX = (boardWidth + cellGap) / getBoardWidth(stage);
    const stepY = (boardHeight + cellGap) / getBoardHeight(stage);

    return {
        x: rect.left + boardPadding + x * stepX,
        y: rect.top + boardPadding + y * stepY
    };
}

function rotatePiece(clockwise) {
    const piece = getActivePiece();

    if (!piece || piece.placed) {
        setMessage("회전할 조각을 먼저 집어주세요.");
        return;
    }

    rotatePieceData(piece, clockwise);

    const pieceElement = dragging ? dragPreviewElement : getPieceElement(piece.id);
    drawPieceCells(pieceElement, piece, dragging ? boardCellSize : trayCellSize);

    if (dragging) {
        movePieceElement(pieceElement, lastPointer.x, lastPointer.y);
        updateGhost(lastPointer.x, lastPointer.y);
    }

    setMessage(clockwise
        ? `${formatKeyLabel(keyBindings.clockwise)} 키: 시계 방향으로 회전했어요.`
        : `${formatKeyLabel(keyBindings.counterclockwise)} 키: 반시계 방향으로 회전했어요.`);
}

function rotatePieceFromPointerClick(interaction) {
    const piece = getPiece(interaction.pieceId);

    if (!piece) {
        return;
    }

    const clockwise = interaction.button === 2;
    activePieceId = piece.id;

    if (piece.placed || interaction.sourceType === "board") {
        rotatePlacedPiece(piece, clockwise);
        return;
    }

    rotatePieceData(piece, clockwise);
    setMessage(clockwise
        ? "우클릭: 시계 방향으로 회전했어요."
        : "좌클릭: 반시계 방향으로 회전했어요.");
}

function rotatePlacedPiece(piece, clockwise) {
    const origin = getPlacementOrigin(piece.boardCells);

    rotatePieceData(piece, clockwise);

    const nextBoardCells = piece.cells.map((cell) => ({
        x: origin.x + cell.x,
        y: origin.y + cell.y,
        hole: cell.hole,
        turn: cell.turn,
        magnet: cell.magnet,
        paths: [...cell.paths],
        fields: [...cell.fields]
    }));

    if (canPlaceCellsForPiece(nextBoardCells, piece.id)) {
        piece.boardCells = nextBoardCells;
        if (isPuzzleComplete()) {
            handleCompletionState();
        } else {
            setMessage(clockwise
                ? "우클릭: 놓인 조각을 시계 방향으로 회전했어요."
                : "좌클릭: 놓인 조각을 반시계 방향으로 회전했어요.");
        }
        return;
    }

    rotatePieceData(piece, !clockwise);
    setMessage("그 자리에서는 회전할 수 없어요. 보드 밖으로 나가거나 다른 조각/peg와 부딪혀요.");
}

function randomizePieceOrientations(pieceList) {
    const rotations = pieceList.map(() => Math.floor(Math.random() * 4));

    if (rotations.length > 0 && rotations.every((rotation) => rotation === 0)) {
        rotations[0] = 1;
    }

    pieceList.forEach((piece, index) => {
        for (let count = 0; count < rotations[index]; count++) {
            rotatePieceData(piece, true);
        }
    });
}

function randomizePieceAppearance(pieceList) {
    const swatches = shuffleArray(piecePalette);

    pieceList.forEach((piece, index) => {
        const swatch = swatches[index % swatches.length];
        piece.color = swatch.color;
        piece.name = `${swatch.name} ${piece.shapeName}`;
    });

    shuffleInPlace(pieceList);
}

function shuffleArray(items) {
    return shuffleInPlace([...items]);
}

function shuffleInPlace(items) {
    for (let index = items.length - 1; index > 0; index--) {
        const swapIndex = Math.floor(Math.random() * (index + 1));
        [items[index], items[swapIndex]] = [items[swapIndex], items[index]];
    }

    return items;
}

function rotatePieceData(piece, clockwise) {
    piece.rotation = ((piece.rotation ?? 0) + (clockwise ? 1 : 3)) % 4;
    piece.cells = piece.cells.map((cell) => {
        const rotated = clockwise
            ? { x: -cell.y, y: cell.x }
            : { x: cell.y, y: -cell.x };

        return {
            ...rotated,
            hole: cell.hole,
            turn: cell.turn,
            magnet: cell.magnet,
            paths: rotatePaths(cell.paths, clockwise),
            fields: rotatePaths(cell.fields, clockwise)
        };
    });

    normalizePiece(piece);
}

function resetGame() {
    startGame(currentStageIndex);
    setMessage("R 키: 초기화했어요. 조각을 다시 끌어보세요.");
}

function goToStage(nextIndex) {
    if (!isStageSelectable(nextIndex)) {
        setMessage("아직 열리지 않은 레벨이에요.");
        return;
    }

    startGame(nextIndex);
}

function runSolver() {
    const result = countSolutions();

    if (result.count === 0) {
        updateSolverReport("해답 0개: 풀 수 없는 퍼즐이에요.");
        return;
    }

    if (result.count === 1) {
        updateSolverReport("해답 1개: 좋은 퍼즐 후보예요.");
        return;
    }

    updateSolverReport("해답 2개 이상: 정답이 여러 개예요.");
}

function updateSolverReport(text) {
    solverReport.textContent = text;
}

function setMessage(text, tone = "") {
    message.textContent = text;
    message.classList.toggle("success", tone === "success");
}

function handleCompletionState() {
    const solved = isPuzzleComplete();
    setMessage(getProgressMessage(), solved ? "success" : "");

    if (solved) {
        solvedStageIds.add(getStage().id);
        updateStageControls();
    }
}

function canPlaceGhost() {
    const stage = getStage();
    const piece = getActivePiece();

    if (!piece || ghostCells.length === 0) {
        return false;
    }

    return canPlaceCellsForPiece(ghostCells, piece.id);
}

function canPlaceCellsForPiece(cells, pieceId) {
    const stage = getStage();

    return cells.every((cell) => {
        const insideBoard = isInsideBoard(cell.x, cell.y);

        if (!insideBoard) {
            return false;
        }

        const overlapsPiece = pieces.some((placedPiece) => {
            if (!placedPiece.placed || placedPiece.id === pieceId) {
                return false;
            }

            return placedPiece.boardCells.some((placedCell) => placedCell.x === cell.x && placedCell.y === cell.y);
        });
        const peg = getPeg(cell.x, cell.y);
        const blocksPeg = hasPegRules(stage) && peg && !cell.hole;
        const colorBlocksPeg = hasColorPegRules(stage) && peg?.colorKey && !isPieceColorMatch(pieceId, peg.colorKey);

        return !overlapsPiece && !blocksPeg && !colorBlocksPeg;
    }) && !hasPlacedMagnetConflict(stage, cells, pieceId) && !hasPlacedFieldConflict(stage, cells, pieceId);
}

function hasPlacedMagnetConflict(stage, cells, pieceId) {
    if (!hasMagnetRules(stage)) {
        return false;
    }

    const placementCellsByPosition = new Map(cells.map((cell) => [`${cell.x},${cell.y}`, cell]));

    return cells.some((cell) => {
        if (!cell.magnet) {
            return false;
        }

        return dirs.some((dir) => {
            const neighbor = getNeighbor(cell.x, cell.y, dir);

            if (!isInsideBoard(neighbor.x, neighbor.y)) {
                return false;
            }

            const neighborCell = placementCellsByPosition.get(`${neighbor.x},${neighbor.y}`) ?? getPlacedCell(neighbor.x, neighbor.y);

            if (!neighborCell || neighborCell.pieceId === pieceId) {
                return false;
            }

            return neighborCell.magnet === cell.magnet;
        });
    });
}

function hasPlacedFieldConflict(stage, cells, pieceId) {
    if (!hasFieldRules(stage)) {
        return false;
    }

    const placementCellsByPosition = new Map(cells.map((cell) => [`${cell.x},${cell.y}`, cell]));

    return getFieldLines(stage).some((line) => {
        const sourceCell = getFieldCandidateCell(line.x, line.y, placementCellsByPosition, pieceId);
        const target = getFieldTarget(line);
        const targetCell = getFieldCandidateCell(target.x, target.y, placementCellsByPosition, pieceId);

        if (sourceCell && sourceCell.magnet !== "N") {
            return true;
        }

        return targetCell && targetCell.magnet !== "S";
    });
}

function getFieldCandidateCell(x, y, placementCellsByPosition, pieceId) {
    const placementCell = placementCellsByPosition.get(`${x},${y}`);

    if (placementCell) {
        return placementCell;
    }

    const placedCell = getPlacedCell(x, y);
    return placedCell?.pieceId === pieceId ? null : placedCell;
}

function getProgressMessage() {
    if (!isBoardFullFromPieces()) {
        return "좋아요. 빈칸이 남지 않게 나머지 조각도 놓아보세요.";
    }

    const stage = getStage();
    const boardCells = getBoardCellsFromPieces();
    const solved = (!hasPathRules(stage) || isPathSolved(boardCells)) && (!hasFieldRules(stage) || isFieldSolved(boardCells));

    if (!solved) {
        return hasFieldRules(stage)
            ? "판은 다 찼지만, 길이나 자기력선 방향이 아직 맞지 않아요."
            : "판은 다 찼지만, 아직 S에서 G까지 하나의 길로 이어지지 않았어요.";
    }

    if (stage.kind === "hybrid") {
        return "성공! peg와 구멍이 맞고, 선도 S에서 G까지 이어졌어요.";
    }

    if (stage.kind === "turn") {
        return "성공! L/R 구멍의 회전 방향까지 맞춰서 S에서 G까지 이어졌어요.";
    }

    if (stage.kind === "color") {
        return "성공! 색 peg와 L/R 방향까지 맞춰서 S에서 G까지 이어졌어요.";
    }

    if (stage.kind === "magnet") {
        return "성공! peg와 길을 맞추고, 같은 자석 극도 맞닿지 않게 놓았어요.";
    }

    if (stage.kind === "field") {
        return "성공! peg, 길, 자석 극성, 자기력선 방향이 모두 맞았어요.";
    }

    return hasPathRules(stage)
        ? "성공! 그려진 선들이 모두 S에서 G까지 하나의 경로로 이어졌어요."
        : "성공! 조각들이 4x4 판을 빈틈 없이 채웠어요.";
}

function isPuzzleComplete() {
    if (!isBoardFullFromPieces()) {
        return false;
    }

    const stage = getStage();
    const boardCells = getBoardCellsFromPieces();
    return (!hasPathRules(stage) || isPathSolved(boardCells)) && (!hasFieldRules(stage) || isFieldSolved(boardCells));
}

function isBoardFullFromPieces() {
    const filledCount = pieces.reduce((total, piece) => {
        if (!piece.placed) {
            return total;
        }

        return total + piece.boardCells.length;
    }, 0);

    return filledCount === getBoardCellCount(getStage());
}

function getBoardCellsFromPieces() {
    const stage = getStage();
    const boardCells = createEmptyBoardCells(stage);

    pieces.forEach((piece) => {
        if (!piece.placed) {
            return;
        }

        piece.boardCells.forEach((cell) => {
            boardCells[cell.y][cell.x] = {
                ...copyCell(cell),
                pieceId: piece.id,
                color: piece.color
            };
        });
    });

    return boardCells;
}

function countSolutions() {
    const stage = getStage();
    const boardCells = createEmptyBoardCells(stage);
    const puzzlePieces = stage.pieces.map(copyPiece);
    const variantsByPiece = puzzlePieces.map((piece) => getPlacementVariants(piece));
    const orderedPieces = puzzlePieces
        .map((piece, index) => ({
            piece,
            variants: variantsByPiece[index]
        }))
        .sort((a, b) => a.variants.length - b.variants.length);
    const solutions = [];

    searchSolutions(orderedPieces, boardCells, 0, solutions);

    return {
        count: solutions.length,
        solutions
    };
}

function searchSolutions(orderedPieces, boardCells, pieceIndex, solutions) {
    const stage = getStage();

    if (solutions.length >= 2) {
        return;
    }

    if (pieceIndex === orderedPieces.length) {
        if (isFilled(boardCells) && (!hasPathRules(stage) || isPathSolved(boardCells)) && (!hasFieldRules(stage) || isFieldSolved(boardCells))) {
            solutions.push(true);
        }

        return;
    }

    const { piece, variants } = orderedPieces[pieceIndex];

    for (const variant of variants) {
        for (let y = 0; y < getBoardHeight(stage); y++) {
            for (let x = 0; x < getBoardWidth(stage); x++) {
                const placement = variant.map((cell) => ({
                    x: x + cell.x,
                    y: y + cell.y,
                    hole: cell.hole,
                    turn: cell.turn,
                    magnet: cell.magnet,
                    paths: [...cell.paths],
                    fields: [...cell.fields],
                    pieceId: piece.id,
                    pieceColorKey: piece.colorKey
                }));

                if (!canSolverPlace(placement, boardCells)) {
                    continue;
                }

                placeOnSolverBoard(placement, boardCells);
                searchSolutions(orderedPieces, boardCells, pieceIndex + 1, solutions);
                removeFromSolverBoard(placement, boardCells);

                if (solutions.length >= 2) {
                    return;
                }
            }
        }
    }
}

function getPlacementVariants(piece) {
    const variants = [];
    let cells = piece.cells.map(copyCell);

    for (let i = 0; i < 4; i++) {
        const normalized = normalizeCells(cells);
        const key = getCellsKey(normalized);

        if (!variants.some((variant) => getCellsKey(variant) === key)) {
            variants.push(normalized);
        }

        cells = cells.map((cell) => ({
            x: -cell.y,
            y: cell.x,
            hole: cell.hole,
            turn: cell.turn,
            magnet: cell.magnet,
            paths: rotatePaths(cell.paths, true),
            fields: rotatePaths(cell.fields, true)
        }));
    }

    return variants;
}

function canSolverPlace(cells, boardCells) {
    const stage = getStage();

    return cells.every((cell) => {
        if (!isInsideBoard(cell.x, cell.y)) {
            return false;
        }

        const empty = boardCells[cell.y][cell.x] === null;
        const peg = getPeg(cell.x, cell.y);
        const pegAllowed = !hasPegRules(stage) || !peg || cell.hole;
        const pegColorAllowed = !hasColorPegRules(stage) || !peg?.colorKey || cell.pieceColorKey === peg.colorKey;

        return empty && pegAllowed && pegColorAllowed;
    }) && !hasPathPlacementConflict(stage, cells, boardCells) && !hasMagnetPlacementConflict(stage, cells, boardCells) && !hasFieldPlacementConflict(stage, cells, boardCells);
}

function hasPathPlacementConflict(stage, cells, boardCells) {
    if (!hasPathRules(stage)) {
        return false;
    }

    return cells.some((cell) => dirs.some((dir) => {
        const hasPath = cell.paths.includes(dir);

        if (isEndpointExit(cell.x, cell.y, dir, "start") || isEndpointExit(cell.x, cell.y, dir, "end")) {
            return !hasPath;
        }

        const neighbor = getNeighbor(cell.x, cell.y, dir);

        if (!isInsideBoard(neighbor.x, neighbor.y)) {
            return hasPath;
        }

        const neighborCell = boardCells[neighbor.y][neighbor.x];

        if (!neighborCell) {
            return false;
        }

        const neighborHasPath = neighborCell.paths.includes(oppositeDir(dir));
        return hasPath !== neighborHasPath;
    }));
}

function hasMagnetPlacementConflict(stage, cells, boardCells) {
    if (!hasMagnetRules(stage)) {
        return false;
    }

    const placementCellsByPosition = new Map(cells.map((cell) => [`${cell.x},${cell.y}`, cell]));

    return cells.some((cell) => {
        if (!cell.magnet) {
            return false;
        }

        return dirs.some((dir) => {
            const neighbor = getNeighbor(cell.x, cell.y, dir);

            if (!isInsideBoard(neighbor.x, neighbor.y)) {
                return false;
            }

            const neighborCell = placementCellsByPosition.get(`${neighbor.x},${neighbor.y}`) ?? boardCells[neighbor.y][neighbor.x];
            return neighborCell?.magnet === cell.magnet;
        });
    });
}

function hasFieldPlacementConflict(stage, cells, boardCells) {
    if (!hasFieldRules(stage)) {
        return false;
    }

    const placementCellsByPosition = new Map(cells.map((cell) => [`${cell.x},${cell.y}`, cell]));

    return getFieldLines(stage).some((line) => {
        const sourceCell = placementCellsByPosition.get(`${line.x},${line.y}`) ?? boardCells[line.y][line.x];
        const target = getFieldTarget(line);
        const targetCell = placementCellsByPosition.get(`${target.x},${target.y}`) ?? boardCells[target.y][target.x];

        if (sourceCell && sourceCell.magnet !== "N") {
            return true;
        }

        return targetCell && targetCell.magnet !== "S";
    });
}

function placeOnSolverBoard(cells, boardCells) {
    cells.forEach((cell) => {
        boardCells[cell.y][cell.x] = { ...copyCell(cell), pieceId: cell.pieceId };
    });
}

function removeFromSolverBoard(cells, boardCells) {
    cells.forEach((cell) => {
        boardCells[cell.y][cell.x] = null;
    });
}

function isFilled(boardCells) {
    return boardCells.every((row) => row.every(Boolean));
}

function isPathSolved(boardCells) {
    const stage = getStage();

    if (!hasPathRules(stage) || !isFilled(boardCells)) {
        return false;
    }

    if (!allPathConnectionsAreValid(boardCells)) {
        return false;
    }

    const startCell = boardCells[stage.endpoints.start.y][stage.endpoints.start.x];

    if (!startCell || !startCell.paths.includes(stage.endpoints.start.dir)) {
        return false;
    }

    const totalPathCells = boardCells.flat().filter((cell) => cell.paths.length > 0).length;
    const visited = new Set();
    let current = { x: stage.endpoints.start.x, y: stage.endpoints.start.y };
    let incomingDir = stage.endpoints.start.dir;

    while (true) {
        const cell = boardCells[current.y][current.x];
        const key = `${current.x},${current.y}`;
        visited.add(key);

        const nextDir = cell.paths.find((dir) => dir !== incomingDir);

        if (!nextDir) {
            return false;
        }

        if (!isTurnConstraintSatisfied(cell, incomingDir, nextDir)) {
            return false;
        }

        if (isEndpointExit(current.x, current.y, nextDir, "end")) {
            return visited.size === totalPathCells;
        }

        const nextPosition = getNeighbor(current.x, current.y, nextDir);

        if (!isInsideBoard(nextPosition.x, nextPosition.y)) {
            return false;
        }

        current = nextPosition;
        incomingDir = oppositeDir(nextDir);

        if (visited.has(`${current.x},${current.y}`)) {
            return false;
        }
    }
}

function isFieldSolved(boardCells) {
    const stage = getStage();

    if (!hasFieldRules(stage) || !isFilled(boardCells)) {
        return false;
    }

    for (const line of getFieldLines(stage)) {
        const sourceCell = boardCells[line.y][line.x];
        const target = getFieldTarget(line);
        const targetCell = boardCells[target.y][target.x];

        if (!sourceCell || sourceCell.magnet !== "N" || !targetCell || targetCell.magnet !== "S") {
            return false;
        }
    }

    return true;
}

function allPathConnectionsAreValid(boardCells) {
    const stage = getStage();

    for (let y = 0; y < getBoardHeight(stage); y++) {
        for (let x = 0; x < getBoardWidth(stage); x++) {
            const cell = boardCells[y][x];

            if (!cell) {
                return false;
            }

            if (cell.paths.length === 0) {
                continue;
            }

            if (cell.paths.length !== 2) {
                return false;
            }

            for (const dir of cell.paths) {
                if (isEndpointExit(x, y, dir, "start") || isEndpointExit(x, y, dir, "end")) {
                    continue;
                }

                const neighbor = getNeighbor(x, y, dir);

                if (!isInsideBoard(neighbor.x, neighbor.y)) {
                    return false;
                }

                const neighborCell = boardCells[neighbor.y][neighbor.x];

                if (!neighborCell || !neighborCell.paths.includes(oppositeDir(dir))) {
                    return false;
                }
            }
        }
    }

    return true;
}

function isTurnConstraintSatisfied(cell, incomingDir, outgoingDir) {
    if (!cell.turn) {
        return true;
    }

    return getTurnDirection(incomingDir, outgoingDir) === cell.turn;
}

function getTurnDirection(incomingDir, outgoingDir) {
    const incomingTravelDir = oppositeDir(incomingDir);
    const incomingIndex = dirs.indexOf(incomingTravelDir);
    const outgoingIndex = dirs.indexOf(outgoingDir);
    const delta = (outgoingIndex - incomingIndex + dirs.length) % dirs.length;

    if (delta === 1) {
        return "R";
    }

    if (delta === 3) {
        return "L";
    }

    return "";
}

function isEndpointExit(x, y, dir, endpointName) {
    const endpoint = getStage().endpoints?.[endpointName];
    return Boolean(endpoint && endpoint.x === x && endpoint.y === y && endpoint.dir === dir);
}

function getPlacedCell(x, y) {
    for (const piece of pieces) {
        if (!piece.placed) {
            continue;
        }

        const cell = piece.boardCells.find((boardCell) => boardCell.x === x && boardCell.y === y);

        if (cell) {
            return {
                ...cell,
                color: piece.color,
                pieceId: piece.id
            };
        }
    }

    return null;
}

function getGhostCell(x, y) {
    return ghostCells.find((cell) => cell.x === x && cell.y === y);
}

function getPeg(x, y) {
    return getStage().pegs.find((peg) => peg.x === x && peg.y === y);
}

function getFieldLines(stage = getStage()) {
    return stage.fieldLines ?? [];
}

function getFieldLinesAt(x, y) {
    return getFieldLines().filter((line) => line.x === x && line.y === y);
}

function getFieldTarget(line) {
    return getNeighbor(line.x, line.y, line.dir);
}

function getPiece(pieceId) {
    return pieces.find((piece) => piece.id === pieceId);
}

function getActivePiece() {
    return getPiece(activePieceId);
}

function getPieceElement(pieceId) {
    return pieceTray.querySelector(`[data-piece-id="${pieceId}"]`);
}

function getPlacementOrigin(boardCells) {
    return {
        x: Math.min(...boardCells.map((cell) => cell.x)),
        y: Math.min(...boardCells.map((cell) => cell.y))
    };
}

function getStage() {
    return stages[currentStageIndex];
}

function getBoardWidth(stage = getStage()) {
    return stage.boardWidth ?? stage.boardSize;
}

function getBoardHeight(stage = getStage()) {
    return stage.boardHeight ?? stage.boardSize;
}

function getBoardCellCount(stage = getStage()) {
    return getBoardWidth(stage) * getBoardHeight(stage);
}

function createEmptyBoardCells(stage = getStage()) {
    return Array.from({ length: getBoardHeight(stage) }, () => Array(getBoardWidth(stage)).fill(null));
}

function hasPegRules(stage) {
    return stage.kind === "peg" || stage.kind === "hybrid" || stage.kind === "turn" || stage.kind === "color" || stage.kind === "magnet" || stage.kind === "field";
}

function hasPathRules(stage) {
    return stage.kind === "path" || stage.kind === "hybrid" || stage.kind === "turn" || stage.kind === "color" || stage.kind === "magnet" || stage.kind === "field";
}

function hasColorPegRules(stage) {
    return stage.kind === "color";
}

function hasMagnetRules(stage) {
    return stage.kind === "magnet" || stage.kind === "field";
}

function hasFieldRules(stage) {
    return stage.kind === "field";
}

function isPieceColorMatch(pieceId, colorKey) {
    return getPiece(pieceId)?.colorKey === colorKey;
}

function updateStageControls() {
    const stage = getStage();
    const isSolved = solvedStageIds.has(stage.id);
    prevStageButton.disabled = !isStageSelectable(currentStageIndex - 1);
    nextStageButton.disabled = !isStageSelectable(currentStageIndex + 1);
    currentStageName.textContent = isSolved ? `${stage.shortName} 완료` : stage.shortName;
    currentStageName.classList.toggle("solved", isSolved);
    currentStageName.setAttribute("aria-expanded", String(!stageMenu.hidden));
    renderStageMenu();
}

function isStageSelectable(stageIndex) {
    return stageIndex >= 0 && stageIndex < stages.length && stages[stageIndex].unlocked !== false;
}

function renderStageMenu() {
    stageMenu.innerHTML = "";

    stages.forEach((stage, stageIndex) => {
        if (!isStageSelectable(stageIndex)) {
            return;
        }

        const button = document.createElement("button");
        button.type = "button";
        button.className = "stage-menu-item";
        button.setAttribute("role", "menuitemradio");
        button.setAttribute("aria-checked", String(stageIndex === currentStageIndex));
        const solved = solvedStageIds.has(stage.id);
        button.classList.toggle("solved", solved);
        button.textContent = solved ? `${stage.shortName} 완료` : stage.shortName;
        button.addEventListener("click", () => {
            closeStageMenu();
            goToStage(stageIndex);
        });
        stageMenu.appendChild(button);
    });
}

function toggleStageMenu() {
    const isOpening = stageMenu.hidden;
    stageMenu.hidden = !isOpening;
    currentStageName.setAttribute("aria-expanded", String(isOpening));

    if (isOpening) {
        renderStageMenu();
    }
}

function closeStageMenu() {
    stageMenu.hidden = true;
    currentStageName.setAttribute("aria-expanded", "false");
}

function renderRules() {
    const stage = getStage();
    const ruleIds = stage.ruleIds ?? getFallbackRuleIds(stage);

    renderRuleSections(rulesContent, ruleIds, `${stage.id}-help`);
}

function renderRuleSections(parent, ruleIds, idPrefix) {
    parent.innerHTML = "";

    ruleIds.forEach((ruleId) => {
        const rule = ruleSections[ruleId];

        if (!rule) {
            return;
        }

        const section = document.createElement("section");
        const headingId = `${idPrefix}-${ruleId}`;
        section.setAttribute("aria-labelledby", headingId);

        const heading = document.createElement("h2");
        heading.id = headingId;
        heading.textContent = rule.title;

        const list = document.createElement("ul");
        list.className = "rule-list";

        rule.items.forEach((item) => {
            const listItem = document.createElement("li");
            listItem.textContent = item;
            list.appendChild(listItem);
        });

        section.append(heading, list);
        parent.appendChild(section);
    });
}

function maybeShowRuleIntroduction() {
    const stage = getStage();
    const introducedRuleIds = getIntroducedRuleIds(currentStageIndex);

    if (introducedRuleIds.length === 0) {
        return;
    }

    const introductionKey = `${stage.id}:${introducedRuleIds.join(",")}`;

    if (shownRuleIntroductionKeys.has(introductionKey)) {
        return;
    }

    shownRuleIntroductionKeys.add(introductionKey);
    showRuleIntroduction(introducedRuleIds);
}

function getIntroducedRuleIds(stageIndex) {
    const currentRuleIds = stages[stageIndex].ruleIds ?? getFallbackRuleIds(stages[stageIndex]);
    const previousRuleIds = new Set();

    stages.slice(0, stageIndex).forEach((stage) => {
        (stage.ruleIds ?? getFallbackRuleIds(stage)).forEach((ruleId) => previousRuleIds.add(ruleId));
    });

    return currentRuleIds.filter((ruleId) => !previousRuleIds.has(ruleId));
}

function showRuleIntroduction(ruleIds) {
    const stage = getStage();
    const isFirstStage = currentStageIndex === 0;
    ruleDialogEyebrow.textContent = isFirstStage ? "룰 안내" : "새 룰";
    ruleDialogTitle.textContent = isFirstStage
        ? `${stage.shortName}: 룰을 확인해요`
        : `${stage.shortName}: 새 룰이 추가됐어요`;
    renderRuleSections(ruleDialogBody, ruleIds, `${stage.id}-intro`);
    ruleOverlay.hidden = false;
    ruleDialogClose.focus();
}

function closeRuleIntroduction() {
    ruleOverlay.hidden = true;
}

function getFallbackRuleIds(stage) {
    if (stage.kind === "peg") {
        return ["peg"];
    }

    if (stage.kind === "path") {
        return ["path"];
    }

    if (stage.kind === "turn") {
        return ["peg", "path", "turn"];
    }

    if (stage.kind === "color") {
        return ["peg", "path", "turn", "color"];
    }

    if (stage.kind === "magnet") {
        return ["peg", "path", "magnet"];
    }

    if (stage.kind === "field") {
        return ["peg", "path", "magnet", "field"];
    }

    return ["peg", "path"];
}

function initializeSizeControls() {
    boardSizeSlider.value = String(boardCellSize);
    traySizeSlider.value = String(trayCellSize);
    updateBoardCellSize(boardCellSize);
    updateTrayCellSize(trayCellSize);

    boardSizeSlider.addEventListener("input", () => updateBoardCellSize(Number(boardSizeSlider.value)));
    traySizeSlider.addEventListener("input", () => updateTrayCellSize(Number(traySizeSlider.value)));
}

function initializeKeyBindingControls() {
    keyBindings = loadKeyBindings();
    updateKeyBindingLabels();

    document.querySelectorAll("[data-key-action]").forEach((button) => {
        button.addEventListener("click", () => startKeyBinding(button.dataset.keyAction));
    });
}

function loadKeyBindings() {
    try {
        const saved = JSON.parse(localStorage.getItem(keyBindingStorageKey));

        if (isUsableKey(saved?.counterclockwise) && isUsableKey(saved?.clockwise) && saved.counterclockwise !== saved.clockwise) {
            return {
                counterclockwise: saved.counterclockwise,
                clockwise: saved.clockwise
            };
        }
    } catch {
        localStorage.removeItem(keyBindingStorageKey);
    }

    return { ...defaultKeyBindings };
}

function saveKeyBindings() {
    localStorage.setItem(keyBindingStorageKey, JSON.stringify(keyBindings));
}

function startKeyBinding(action) {
    pendingKeyBindingAction = action;
    updateKeyBindingLabels();
    setMessage(`${getKeyBindingActionName(action)} 키를 바꾸려면 새 키를 누르세요. Esc는 취소예요.`);
}

function applyPendingKeyBinding(event) {
    const key = normalizeKey(event.key);

    if (key === "escape") {
        pendingKeyBindingAction = null;
        updateKeyBindingLabels();
        setMessage("키 변경을 취소했어요.");
        return;
    }

    if (!isUsableKey(key)) {
        setMessage("그 키는 회전 키로 쓸 수 없어요. 다른 키를 눌러주세요.");
        return;
    }

    const oppositeAction = pendingKeyBindingAction === "clockwise" ? "counterclockwise" : "clockwise";
    const previousKey = keyBindings[pendingKeyBindingAction];

    if (keyBindings[oppositeAction] === key) {
        keyBindings[oppositeAction] = previousKey;
    }

    keyBindings[pendingKeyBindingAction] = key;
    pendingKeyBindingAction = null;
    saveKeyBindings();
    updateKeyBindingLabels();
    setMessage("회전 키를 바꿨어요.");
}

function updateKeyBindingLabels() {
    counterClockwiseKeyLabel.textContent = formatKeyLabel(keyBindings.counterclockwise);
    clockwiseKeyLabel.textContent = formatKeyLabel(keyBindings.clockwise);

    document.querySelectorAll("[data-key-action]").forEach((button) => {
        const listening = button.dataset.keyAction === pendingKeyBindingAction;
        button.classList.toggle("listening", listening);
        button.setAttribute("aria-pressed", String(listening));
    });
}

function getKeyBindingActionName(action) {
    return action === "clockwise" ? "시계 회전" : "반시계 회전";
}

function normalizeKey(key) {
    return key.length === 1 ? key.toLowerCase() : key.toLowerCase();
}

function isUsableKey(key) {
    return Boolean(key) && !reservedBindingKeys.has(key);
}

function formatKeyLabel(key) {
    const labels = {
        " ": "Space",
        arrowleft: "←",
        arrowright: "→",
        arrowup: "↑",
        arrowdown: "↓"
    };

    return labels[key] ?? (key.length === 1 ? key.toUpperCase() : key);
}

function toggleHelpContent() {
    const isOpening = helpContent.hidden;
    helpContent.hidden = !isOpening;
    helpToggle.setAttribute("aria-expanded", String(isOpening));
}

function toggleRulesContent() {
    const isOpening = rulesContent.hidden;
    rulesContent.hidden = !isOpening;
    rulesToggle.setAttribute("aria-expanded", String(isOpening));
    rulesToggle.textContent = isOpening ? "룰 접기" : "룰 보기";
}

function updateBoardCellSize(nextSize) {
    boardCellSize = nextSize;
    document.documentElement.style.setProperty("--board-cell-size", `${boardCellSize}px`);
    boardSizeValue.textContent = String(boardCellSize);

    if (dragging && dragPreviewElement) {
        drawPieceCells(dragPreviewElement, getActivePiece(), boardCellSize);
        movePieceElement(dragPreviewElement, lastPointer.x, lastPointer.y);
        updateGhost(lastPointer.x, lastPointer.y);
    }
}

function updateTrayCellSize(nextSize) {
    trayCellSize = nextSize;
    traySizeValue.textContent = String(trayCellSize);
    drawTray();
}

function clampStageIndex(stageIndex) {
    return Math.max(0, Math.min(stageIndex, stages.length - 1));
}

function appendHole(parent) {
    const hole = document.createElement("span");
    hole.className = "hole";
    parent.appendChild(hole);
}

function appendTurnMarker(parent, turn) {
    const marker = document.createElement("span");
    marker.className = `turn-marker turn-${turn.toLowerCase()}`;
    marker.textContent = turn;
    parent.appendChild(marker);
}

function appendMagnetMarker(parent, magnet) {
    const marker = document.createElement("span");
    marker.className = `magnet-marker magnet-${magnet.toLowerCase()}`;
    marker.textContent = magnet;
    parent.appendChild(marker);
}

function appendFieldLines(parent, fields) {
    fields.forEach((dir) => {
        const line = document.createElement("span");
        line.className = `field-line ${dir.toLowerCase()}`;
        parent.appendChild(line);
    });
}

function appendPeg(parent, peg = {}) {
    const pegElement = document.createElement("span");
    pegElement.className = "peg";

    if (peg.color) {
        pegElement.classList.add("colored");
        pegElement.style.setProperty("--peg-color", peg.color);
    }

    parent.appendChild(pegElement);
}

function appendPath(parent, paths) {
    paths.forEach((dir) => {
        const segment = document.createElement("span");
        segment.className = `path-segment ${dir.toLowerCase()}`;
        parent.appendChild(segment);
    });
}

function normalizePiece(piece) {
    piece.cells = normalizeCells(piece.cells);
}

function normalizeCells(cells) {
    const minX = Math.min(...cells.map((cell) => cell.x));
    const minY = Math.min(...cells.map((cell) => cell.y));

    return cells
        .map((cell) => ({
            x: cell.x - minX,
            y: cell.y - minY,
            hole: cell.hole,
            turn: cell.turn,
            magnet: cell.magnet,
            paths: [...cell.paths],
            fields: [...cell.fields]
        }))
        .sort((a, b) => a.y - b.y || a.x - b.x);
}

function getPieceMetrics(piece, cellSize) {
    const maxX = Math.max(...piece.cells.map((cell) => cell.x));
    const maxY = Math.max(...piece.cells.map((cell) => cell.y));
    const step = cellSize + cellGap;

    return {
        cellSize,
        step,
        width: (maxX + 1) * cellSize + maxX * cellGap,
        height: (maxY + 1) * cellSize + maxY * cellGap
    };
}

function rotatePaths(paths, clockwise) {
    return paths.map((dir) => {
        const index = dirs.indexOf(dir);
        const nextIndex = clockwise ? index + 1 : index - 1;
        return dirs[(nextIndex + dirs.length) % dirs.length];
    });
}

function getCellsKey(cells) {
    return cells.map((cell) => {
        const pathKey = [...cell.paths].sort().join("");
        const fieldKey = [...cell.fields].sort().join("");
        return `${cell.x},${cell.y},${cell.hole ? 1 : 0},${cell.turn ?? ""},${cell.magnet ?? ""},${pathKey},${fieldKey}`;
    }).join("|");
}

function getNeighbor(x, y, dir) {
    if (dir === "N") {
        return { x, y: y - 1 };
    }

    if (dir === "E") {
        return { x: x + 1, y };
    }

    if (dir === "S") {
        return { x, y: y + 1 };
    }

    return { x: x - 1, y };
}

function oppositeDir(dir) {
    if (dir === "N") {
        return "S";
    }

    if (dir === "E") {
        return "W";
    }

    if (dir === "S") {
        return "N";
    }

    return "E";
}

function isInsideBoard(x, y) {
    const stage = getStage();
    return x >= 0 && x < getBoardWidth(stage) && y >= 0 && y < getBoardHeight(stage);
}

function isRotationPointerButton(event) {
    return event.button === 0 || event.button === 2;
}

function preventPuzzleContextMenu(event) {
    event.preventDefault();
}

function copyPiece(piece) {
    const shapeName = getShapeName(piece.name);

    return {
        id: piece.id,
        name: piece.name,
        shapeName,
        color: piece.color,
        colorKey: piece.colorKey ?? "",
        rotation: 0,
        placed: false,
        boardCells: [],
        cells: piece.cells.map(copyCell)
    };
}

function getShapeName(name) {
    const swatch = piecePalette.find((paletteItem) => name.startsWith(`${paletteItem.name} `));
    return swatch ? name.slice(swatch.name.length + 1) : name;
}

function copyCell(cell) {
    return {
        x: cell.x,
        y: cell.y,
        hole: Boolean(cell.hole),
        turn: cell.turn ?? "",
        magnet: cell.magnet ?? "",
        paths: cell.paths ? [...cell.paths] : [],
        fields: cell.fields ? [...cell.fields] : []
    };
}

document.addEventListener("keydown", (event) => {
    const key = normalizeKey(event.key);

    if (pendingKeyBindingAction) {
        event.preventDefault();
        applyPendingKeyBinding(event);
        return;
    }

    if (key === "escape") {
        if (!ruleOverlay.hidden) {
            event.preventDefault();
            closeRuleIntroduction();
            return;
        }

        if (!stageMenu.hidden) {
            event.preventDefault();
            closeStageMenu();
            return;
        }
    }

    if (key === keyBindings.counterclockwise) {
        event.preventDefault();
        rotatePiece(false);
        return;
    }

    if (key === keyBindings.clockwise) {
        event.preventDefault();
        rotatePiece(true);
        return;
    }

    if (key === "r") {
        event.preventDefault();
        resetGame();
    }
});

board.addEventListener("pointerdown", startBoardDrag);
board.addEventListener("contextmenu", preventPuzzleContextMenu);
pieceTray.addEventListener("contextmenu", preventPuzzleContextMenu);
prevStageButton.addEventListener("click", () => goToStage(currentStageIndex - 1));
nextStageButton.addEventListener("click", () => goToStage(currentStageIndex + 1));
currentStageName.addEventListener("click", toggleStageMenu);
document.addEventListener("pointerdown", (event) => {
    if (!event.target.closest(".level-picker")) {
        closeStageMenu();
    }
});
solveButton.addEventListener("click", runSolver);
helpToggle.addEventListener("click", toggleHelpContent);
rulesToggle.addEventListener("click", toggleRulesContent);
ruleDialogClose.addEventListener("click", closeRuleIntroduction);
ruleOverlay.addEventListener("pointerdown", (event) => {
    if (event.target === ruleOverlay) {
        closeRuleIntroduction();
    }
});

initializeSizeControls();
initializeKeyBindingControls();
startGame();
