// =============================================================================
// ETM RÉVISION - APPLICATION ENGINE
// =============================================================================
// Architecture: Centralized State Machine with dual-phase video playback.
// The single `timeupdate` listener checks State.playbackPhase to decide
// when to pause the video, avoiding redundant listener attachment.
// =============================================================================

// ─── DATA ────────────────────────────────────────────────────────────────────
// Format per question: [qStart, expStart, expEnd, correctAnswerString]
// qStart = timestamp where the question image appears in the video
// expStart = timestamp where the explanation begins
// expEnd = timestamp where the explanation ends
const appData = {
  "serie1": {
    "title": "Série 1",
    "videoFile": "video.mp4",
    "questions": [
      [35, 58, 80, "B"], [95, 126, 154, "A"], [166, 196, 218, "B, C"], [237, 279, 301, "A, D"], [314, 339, 390, "B"],
      [402, 430, 451, "A, C"], [463, 482, 501, "A"], [512, 541, 553, "A, C"], [577, 619, 649, "A, C"], [658, 683, 713, "A, C"],
      [717, 740, 775, "A"], [778, 813, 837, "B, D"], [850, 891, 935, "A, B, C"], [945, 977, 1007, "B, C"], [1018, 1038, 1073, "A"],
      [1088, 1122, 1142, "B"], [1152, 1177, 1208, "A"], [1208, 1233, 1255, "A"], [1256, 1281, 1325, "A"], [1326, 1351, 1393, "A"],
      [1394, 1417, 1440, "A, B, C"], [1451, 1476, 1509, "A, C"], [1510, 1535, 1568, "B"], [1569, 1594, 1628, "A, C"], [1629, 1654, 1699, "A, C"],
      [1700, 1725, 1794, "B, C"], [1795, 1820, 1853, "A"], [1854, 1879, 1917, "B"], [1918, 1943, 1989, "B"], [1990, 2015, 2047, "B, C"],
      [2048, 2073, 2116, "B, D"], [2117, 2160, 2191, "B, C"], [2204, 2229, 2281, "B, D"], [2282, 2307, 2338, "B"], [2339, 2364, 2398, "A, C"],
      [2399, 2424, 2466, "A, C"], [2467, 2492, 2534, "A, C"], [2535, 2560, 2595, "A, C, D"], [2596, 2631, 2678, "B, D"], [2678, 2704, 2724, "A"]
    ]
  },
  "serie2": {
    "title": "Série 2",
    "videoFile": "video2.mp4",
    "questions": [
      [34, 56, 80, "B"], [81, 115, 154, "A, C"], [155, 193, 236, "A, C, D"], [237, 279, 318, "A, C"], [319, 353, 384, "A, B, C"],
      [385, 414, 443, "A"], [444, 478, 525, "A, D"], [526, 551, 595, "A, C"], [596, 621, 670, "A, D"], [671, 692, 746, "A, D"],
      [747, 772, 817, "A, D"], [818, 843, 887, "A, C"], [888, 913, 938, "B"], [939, 964, 1008, "B, C"], [1009, 1034, 1074, "A, C"],
      [1075, 1100, 1137, "A, C, D"], [1138, 1163, 1209, "B"], [1210, 1235, 1267, "A"], [1268, 1293, 1314, "A"], [1315, 1340, 1367, "B"],
      [1368, 1393, 1462, "A, D"], [1463, 1488, 1523, "A, B"], [1524, 1549, 1564, "B"], [1565, 1590, 1624, "C"], [1625, 1650, 1697, "A, D"],
      [1698, 1723, 1755, "B"], [1756, 1781, 1809, "A"], [1810, 1835, 1894, "A, C"], [1895, 1920, 1965, "A, C"], [1966, 1991, 2021, "A"],
      [2022, 2047, 2089, "A, C"], [2090, 2115, 2141, "A"], [2142, 2167, 2201, "A, D"], [2202, 2227, 2268, "B"], [2269, 2294, 2334, "A"],
      [2335, 2360, 2411, "B, D"], [2412, 2437, 2479, "A, C"], [2480, 2505, 2534, "B"], [2535, 2560, 2589, "A, C"], [2590, 2615, 2645, "A"]
    ]
  },
  "serie3": {
    "title": "Série 3",
    "videoFile": "video3.mp4",
    "questions": [
      [34, 67, 97, "A, C"], [98, 134, 157, "A, D"], [158, 192, 249, "A, C"], [250, 294, 310, "B"], [311, 339, 356, "A, C"],
      [357, 390, 433, "A, D"], [434, 465, 510, "A, C"], [511, 534, 561, "A"], [562, 595, 627, "B"], [628, 649, 687, "B"],
      [688, 729, 753, "A, D"], [754, 785, 826, "A, C"], [827, 858, 888, "B"], [889, 919, 954, "A, C"], [955, 992, 1024, "C"],
      [1025, 1053, 1087, "A, C"], [1088, 1113, 1163, "B"], [1164, 1209, 1227, "B, D"], [1228, 1253, 1293, "C"], [1294, 1323, 1337, "B"],
      [1338, 1368, 1407, "A"], [1408, 1442, 1474, "A"], [1475, 1505, 1550, "A, D"], [1551, 1574, 1600, "B"], [1601, 1632, 1654, "A, C"],
      [1655, 1685, 1715, "A, C"], [1716, 1735, 1778, "B"], [1779, 1817, 1847, "A"], [1848, 1885, 1907, "A, C, D"], [1908, 1944, 1973, "B"],
      [1974, 2004, 2026, "B"], [2027, 2047, 2071, "A"], [2072, 2109, 2144, "A, B, C"], [2145, 2176, 2220, "A, B, D"], [2221, 2246, 2279, "B, C"],
      [2280, 2307, 2347, "B"], [2348, 2382, 2413, "B"], [2414, 2447, 2468, "B"], [2469, 2493, 2515, "A"], [2516, 2548, 2578, "A, B, C"]
    ]
  },
  "serie4": {
    "title": "Série 4",
    "videoFile": "video4.mp4",
    "questions": [
      [35, 68, 94, "A"], [95, 127, 151, "B, C, D"], [152, 184, 229, "A, C"], [230, 275, 306, "B, C"], [307, 329, 353, "A"],
      [354, 385, 430, "B, D"], [431, 474, 517, "B, C"], [518, 542, 596, "A"], [597, 636, 660, "A, D"], [661, 698, 712, "A, C"],
      [713, 747, 773, "A, C"], [774, 810, 847, "C"], [848, 885, 906, "A"], [907, 936, 977, "A"], [978, 1030, 1065, "A, C"],
      [1066, 1100, 1136, "A, C"], [1137, 1169, 1201, "A, D"], [1202, 1225, 1252, "B"], [1253, 1285, 1334, "A, C"], [1335, 1365, 1404, "A"],
      [1405, 1425, 1449, "A"], [1450, 1484, 1514, "C"], [1515, 1548, 1565, "A, D"], [1566, 1589, 1611, "B"], [1612, 1644, 1677, "A, C"],
      [1678, 1708, 1745, "A"], [1746, 1770, 1808, "A"], [1809, 1853, 1901, "A, C"], [1902, 1928, 1951, "A"], [1952, 1976, 2005, "A"],
      [2006, 2030, 2084, "B"], [2085, 2126, 2177, "A"], [2178, 2212, 2246, "A, D"], [2247, 2276, 2297, "B, C"], [2298, 2326, 2356, "B"],
      [2357, 2389, 2401, "B"], [2402, 2433, 2472, "A, C"], [2473, 2513, 2537, "A, D"], [2538, 2570, 2610, "A, B, D"], [2611, 2639, 2669, "A, C"]
    ]
  },
  "serie5": {
    "title": "Série 5",
    "videoFile": "video5.mp4",
    "questions": [
      [34, 64, 103, "C"], [104, 144, 186, "A, C"], [187, 208, 253, "A"], [254, 291, 321, "A"], [322, 352, 384, "A, C"],
      [385, 409, 436, "B"], [437, 460, 494, "A"], [495, 518, 551, "B"], [552, 582, 619, "A"], [620, 645, 701, "A, B, D"],
      [702, 731, 755, "A, C"], [756, 783, 825, "A, C"], [826, 866, 901, "A, C"], [902, 926, 959, "C"], [960, 983, 1001, "B"],
      [1002, 1032, 1077, "A"], [1078, 1107, 1131, "A, B, C"], [1132, 1161, 1187, "C"], [1188, 1217, 1242, "A"], [1243, 1265, 1300, "A"],
      [1301, 1328, 1388, "B, C"], [1389, 1425, 1449, "A"], [1450, 1478, 1527, "A, D"], [1528, 1549, 1593, "B, D"], [1594, 1636, 1671, "B, D"],
      [1672, 1701, 1723, "B"], [1724, 1756, 1790, "A, C"], [1791, 1831, 1864, "C"], [1865, 1891, 1929, "A, D"], [1930, 1960, 1995, "B, C"],
      [1996, 2035, 2062, "A, C"], [2063, 2087, 2127, "B"], [2128, 2147, 2176, "A"], [2177, 2206, 2248, "C"], [2249, 2272, 2310, "A, C"],
      [2311, 2344, 2380, "B"], [2381, 2409, 2455, "B"], [2456, 2479, 2514, "A"], [2515, 2541, 2574, "A"], [2575, 2607, 2637, "B, C"]
    ]
  },
  "serie6": {
    "title": "Série 6",
    "videoFile": "video6.mp4",
    "questions": [
      [35, 66, 96, "A, C"], [97, 127, 161, "B, C"], [162, 201, 226, "B, C"], [227, 252, 286, "A"], [287, 317, 348, "A, C"],
      [349, 377, 400, "A"], [401, 436, 489, "A, B, D"], [490, 527, 550, "B, D"], [551, 583, 607, "A, C"], [608, 632, 664, "A"],
      [665, 695, 732, "A, C"], [733, 765, 800, "A, C, D"], [801, 844, 877, "A, C"], [878, 910, 945, "A, C"], [946, 971, 1014, "B"],
      [1015, 1055, 1078, "A, C"], [1079, 1104, 1138, "B"], [1139, 1163, 1176, "A"], [1177, 1210, 1252, "A, C"], [1253, 1277, 1308, "A"],
      [1309, 1346, 1384, "A, D"], [1385, 1421, 1448, "B, D"], [1449, 1483, 1531, "A, C"], [1532, 1574, 1607, "A, C"], [1608, 1641, 1673, "B, C"],
      [1674, 1703, 1738, "B, C"], [1739, 1777, 1821, "A, D"], [1822, 1855, 1877, "A, B, C"], [1878, 1905, 1936, "A"], [1937, 1963, 2015, "C"],
      [2016, 2046, 2073, "A"], [2074, 2109, 2148, "A, C"], [2149, 2176, 2214, "A"], [2215, 2248, 2265, "A"], [2266, 2297, 2331, "A, C"],
      [2332, 2364, 2404, "A, C"], [2405, 2438, 2474, "B"], [2475, 2512, 2557, "A, B, C"], [2558, 2588, 2614, "A, C"], [2615, 2645, 2675, "B, C"]
    ]
  },
  "serie7": {
    "title": "Série 7",
    "videoFile": "video7.mp4",
    "questions": [
      [33, 68, 89, "B, D"], [90, 127, 164, "B, C"], [165, 194, 216, "C"], [217, 247, 270, "B"], [271, 297, 329, "B, C"],
      [330, 356, 382, "C, D"], [383, 406, 468, "B"], [469, 505, 527, "B"], [528, 566, 622, "B, D"], [623, 650, 682, "A, C"],
      [683, 708, 767, "A, C"], [768, 808, 841, "B"], [842, 875, 899, "A, C"], [900, 931, 961, "A, B, D"], [962, 998, 1053, "C"],
      [1054, 1098, 1132, "A, C"], [1133, 1163, 1187, "A"], [1188, 1214, 1224, "B"], [1225, 1250, 1279, "A"], [1280, 1302, 1316, "A"],
      [1317, 1350, 1388, "B, C"], [1389, 1427, 1466, "B, C"], [1467, 1488, 1519, "B"], [1520, 1552, 1588, "A, C"], [1589, 1618, 1659, "B"],
      [1660, 1700, 1746, "A, D"], [1747, 1770, 1805, "B, C"], [1806, 1834, 1862, "A, C"], [1863, 1897, 1924, "B"], [1925, 1952, 1996, "A, C"],
      [1997, 2032, 2074, "A"], [2075, 2099, 2127, "A"], [2128, 2151, 2185, "A"], [2186, 2224, 2249, "A, D"], [2250, 2281, 2321, "A, C"],
      [2322, 2351, 2398, "A"], [2399, 2439, 2473, "A, C"], [2474, 2493, 2527, "B"], [2528, 2551, 2589, "A"], [2590, 2622, 2652, "C"]
    ]
  }
};

// ─── CENTRALIZED STATE ───────────────────────────────────────────────────────
// playbackPhase: 'idle' | 'question' | 'explanation'
// targetEndTime: the timestamp at which the video should pause
const State = {
  currentSeries: null,       // Key like 'serie1'
  currentQuestionIndex: 0,
  score: 0,
  userAnswers: [],           // Array of Sets for each question
  playbackPhase: 'idle',
  targetEndTime: 0,
  totalQuestions: 0
};

// ─── DOM REFERENCES ──────────────────────────────────────────────────────────
const $ = (sel) => document.querySelector(sel);
const homeScreen   = $('#home-screen');
const quizScreen   = $('#quiz-screen');
const scoreScreen  = $('#score-screen');
const seriesGrid   = $('#series-grid');
const quizTitle    = $('#quiz-title');
const progressText = $('#quiz-progress-text');
const progressBar  = $('#progress-bar');
const scoreDisplay = $('#score-display');
const scoreTotal   = $('#score-score-total');
const video        = $('#quiz-video');
const answerBtns   = $('#answer-buttons');
const btnValidate  = $('#btn-validate');
const feedbackArea = $('#feedback-area');
const btnNext      = $('#btn-next');
const btnBack      = $('#btn-back');
const btnHome      = $('#btn-home');

const QUESTION_DURATION = 12; // seconds of question reading time
const labels = ['A', 'B', 'C', 'D'];

// =============================================================================
// SINGLE TIMEUPDATE LISTENER (attached once, never duplicated)
// =============================================================================
// This is the core of the video state machine. It checks the current
// playbackPhase and pauses the video when currentTime reaches targetEndTime.
video.addEventListener('timeupdate', () => {
  if (State.playbackPhase === 'idle') return;

  if (video.currentTime >= State.targetEndTime) {
    video.pause();

    if (State.playbackPhase === 'question') {
      // Question reading time is over — enable answer buttons
      State.playbackPhase = 'idle';
      enableAnswerButtons(true);
      btnValidate.disabled = false;
    } else if (State.playbackPhase === 'explanation') {
      // Explanation finished — show "next" button
      State.playbackPhase = 'idle';
      btnNext.classList.remove('hidden');
    }
  }
});

// =============================================================================
// SCREEN NAVIGATION
// =============================================================================
function showScreen(screen) {
  [homeScreen, quizScreen, scoreScreen].forEach(s => {
    s.classList.add('hidden');
    s.classList.remove('flex');
  });
  screen.classList.remove('hidden');
  screen.classList.add('flex');
}

// =============================================================================
// HOME SCREEN RENDERING
// =============================================================================
function renderHome() {
  showScreen(homeScreen);
  seriesGrid.innerHTML = '';

  // Icons for each series card
  const icons = [
    'fa-road', 'fa-traffic-light', 'fa-shield-halved',
    'fa-gauge-high', 'fa-helmet-safety', 'fa-flag-checkered',
    'fa-motorcycle'
  ];

  Object.entries(appData).forEach(([key, serie], i) => {
    const hasQuestions = serie.questions.length > 0;
    const card = document.createElement('button');
    card.className = `series-card relative rounded-2xl p-6 bg-surface-800/60 backdrop-blur text-left group ${!hasQuestions ? 'disabled' : ''}`;
    card.innerHTML = `
      <div class="flex items-start justify-between mb-4">
        <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500/20 to-accent-500/20 flex items-center justify-center">
          <i class="fa-solid ${icons[i]} text-xl text-brand-400 group-hover:text-accent-400 transition-colors"></i>
        </div>
        <span class="text-xs font-medium px-2.5 py-1 rounded-full ${hasQuestions ? 'bg-green-500/10 text-green-400' : 'bg-slate-700/50 text-slate-500'}">
          ${hasQuestions ? serie.questions.length + ' questions' : 'Bientôt'}
        </span>
      </div>
      <h3 class="text-xl font-bold text-white mb-1">${serie.title}</h3>
      <p class="text-sm text-slate-400">${hasQuestions ? 'Prêt à réviser' : 'Contenu à venir'}</p>
      ${hasQuestions ? '<div class="mt-4 flex items-center gap-1 text-brand-400 text-sm font-medium">Commencer <i class="fa-solid fa-arrow-right ml-1 group-hover:translate-x-1 transition-transform"></i></div>' : ''}
    `;
    if (hasQuestions) {
      card.addEventListener('click', () => initQuiz(key));
    }
    seriesGrid.appendChild(card);
  });
}

// =============================================================================
// QUIZ INITIALIZATION
// =============================================================================
function initQuiz(seriesId) {
  const serie = appData[seriesId];
  if (!serie || serie.questions.length === 0) return;

  // Reset state
  State.currentSeries = seriesId;
  State.currentQuestionIndex = 0;
  State.score = 0;
  State.userAnswers = [];
  State.playbackPhase = 'idle';
  State.totalQuestions = serie.questions.length;

  // Update UI
  quizTitle.textContent = serie.title;
  scoreDisplay.textContent = '0';
  $('#score-total').textContent = State.totalQuestions;

  // Set video source
  video.src = serie.videoFile;
  video.load();

  showScreen(quizScreen);

  // Wait for video metadata, then start first question
  video.addEventListener('loadedmetadata', () => playQuestionPhase(), { once: true });
}

// =============================================================================
// QUESTION PHASE
// =============================================================================
// Seeks to qStart, plays until qStart + QUESTION_DURATION, then enables input.
function playQuestionPhase() {
  const serie = appData[State.currentSeries];
  const q = serie.questions[State.currentQuestionIndex];
  const [qStart] = q; // destructure qStart

  // Update progress UI
  const idx = State.currentQuestionIndex;
  progressText.textContent = `Question ${idx + 1} / ${State.totalQuestions}`;
  progressBar.style.width = `${((idx + 1) / State.totalQuestions) * 100}%`;

  // Reset controls
  renderAnswerButtons();
  enableAnswerButtons(false);
  btnValidate.disabled = true;
  btnNext.classList.add('hidden');
  feedbackArea.classList.add('hidden');
  State.userAnswers[idx] = new Set();

  // Set up the state machine for question phase
  State.playbackPhase = 'question';
  State.targetEndTime = qStart + QUESTION_DURATION;

  // Seek and play
  video.currentTime = qStart;
  video.play().catch(() => {
    // Autoplay might be blocked — enable buttons anyway
    State.playbackPhase = 'idle';
    enableAnswerButtons(true);
    btnValidate.disabled = false;
  });
}

// =============================================================================
// ANSWER BUTTONS
// =============================================================================
function renderAnswerButtons() {
  answerBtns.innerHTML = '';
  labels.forEach(label => {
    const btn = document.createElement('button');
    btn.id = `btn-answer-${label}`;
    btn.className = 'answer-btn rounded-xl py-5 text-lg font-bold text-slate-300 bg-surface-800/80 backdrop-blur';
    btn.textContent = label;
    btn.disabled = true;
    btn.addEventListener('click', () => toggleAnswer(label, btn));
    answerBtns.appendChild(btn);
  });
}

function toggleAnswer(label, btn) {
  const idx = State.currentQuestionIndex;
  const answers = State.userAnswers[idx];
  if (answers.has(label)) {
    answers.delete(label);
    btn.classList.remove('selected');
  } else {
    answers.add(label);
    btn.classList.add('selected');
  }
}

function enableAnswerButtons(enabled) {
  answerBtns.querySelectorAll('button').forEach(b => b.disabled = !enabled);
}

// =============================================================================
// VALIDATION
// =============================================================================
function handleValidation() {
  const serie = appData[State.currentSeries];
  const q = serie.questions[State.currentQuestionIndex];
  const correctStr = q[3]; // e.g. "A, C"
  const correctSet = new Set(correctStr.split(',').map(s => s.trim()));
  const userSet = State.userAnswers[State.currentQuestionIndex] || new Set();

  // Check if user answer matches correct answer
  const isCorrect = correctSet.size === userSet.size && [...correctSet].every(a => userSet.has(a));

  if (isCorrect) State.score++;
  scoreDisplay.textContent = State.score;

  // Disable buttons and show correct/incorrect
  enableAnswerButtons(false);
  btnValidate.disabled = true;

  labels.forEach(label => {
    const btn = $(`#btn-answer-${label}`);
    if (correctSet.has(label)) {
      btn.classList.add('correct');
      btn.innerHTML = `${label} <i class="fa-solid fa-check ml-1 text-green-400"></i>`;
    } else if (userSet.has(label)) {
      btn.classList.add('incorrect');
      btn.innerHTML = `${label} <i class="fa-solid fa-xmark ml-1 text-red-400"></i>`;
    }
  });

  // Show feedback banner
  feedbackArea.classList.remove('hidden');
  if (isCorrect) {
    feedbackArea.className = 'rounded-xl p-4 border border-green-500/30 bg-green-500/10 fade-in';
    feedbackArea.innerHTML = '<div class="flex items-center gap-3"><i class="fa-solid fa-circle-check text-2xl text-green-400"></i><div><p class="font-bold text-green-400">Bonne réponse !</p><p class="text-sm text-slate-400">Regardez l\'explication vidéo.</p></div></div>';
  } else {
    feedbackArea.className = 'rounded-xl p-4 border border-red-500/30 bg-red-500/10 fade-in';
    feedbackArea.innerHTML = `<div class="flex items-center gap-3"><i class="fa-solid fa-circle-xmark text-2xl text-red-400"></i><div><p class="font-bold text-red-400">Mauvaise réponse</p><p class="text-sm text-slate-400">La bonne réponse était : <span class="text-white font-semibold">${correctStr}</span></p></div></div>`;
  }

  // Start explanation phase
  playExplanationPhase();
}

// =============================================================================
// EXPLANATION PHASE
// =============================================================================
// Seeks to expStart, plays until expEnd, then shows "next" button.
function playExplanationPhase() {
  const serie = appData[State.currentSeries];
  const q = serie.questions[State.currentQuestionIndex];
  const [, expStart, expEnd] = q; // destructure expStart, expEnd

  State.playbackPhase = 'explanation';
  State.targetEndTime = expEnd;

  video.currentTime = expStart;
  video.play().catch(() => {
    // If autoplay blocked, show next button anyway
    State.playbackPhase = 'idle';
    btnNext.classList.remove('hidden');
  });
}

// =============================================================================
// NEXT QUESTION / END
// =============================================================================
function nextQuestion() {
  State.currentQuestionIndex++;

  if (State.currentQuestionIndex >= State.totalQuestions) {
    showScoreScreen();
  } else {
    playQuestionPhase();
  }
}

// =============================================================================
// SCORE SCREEN
// =============================================================================
function showScoreScreen() {
  video.pause();
  video.src = '';
  showScreen(scoreScreen);

  const score = State.score;
  const total = State.totalQuestions;
  const pct = score / total;

  // Animate ring
  const ring = $('#score-ring-fill');
  const circumference = 2 * Math.PI * 88; // ~553
  ring.setAttribute('stroke-dasharray', circumference);
  ring.setAttribute('stroke-dashoffset', circumference);
  requestAnimationFrame(() => {
    ring.setAttribute('stroke-dashoffset', circumference * (1 - pct));
  });

  $('#final-score').textContent = `${score} / ${total}`;

  // Dynamic message based on performance
  const msgEl = $('#final-message');
  const subEl = $('#final-sub');
  if (pct >= 0.875) { // 35/40
    msgEl.textContent = '🎉 Excellent !';
    msgEl.className = 'text-xl font-semibold mb-2 text-green-400';
    subEl.textContent = 'Vous êtes prêt pour l\'examen !';
  } else if (pct >= 0.7) {
    msgEl.textContent = '👍 Bon travail !';
    msgEl.className = 'text-xl font-semibold mb-2 text-brand-400';
    subEl.textContent = 'Encore un petit effort et vous y serez.';
  } else if (pct >= 0.5) {
    msgEl.textContent = '📚 Continuez à réviser';
    msgEl.className = 'text-xl font-semibold mb-2 text-accent-400';
    subEl.textContent = 'Revoyez les thèmes où vous avez fait des erreurs.';
  } else {
    msgEl.textContent = '💪 Ne lâchez rien !';
    msgEl.className = 'text-xl font-semibold mb-2 text-red-400';
    subEl.textContent = 'Prenez le temps de revoir chaque question.';
  }
}

// =============================================================================
// EVENT LISTENERS
// =============================================================================
btnValidate.addEventListener('click', handleValidation);
btnNext.addEventListener('click', nextQuestion);
btnBack.addEventListener('click', () => { video.pause(); video.src = ''; renderHome(); });
btnHome.addEventListener('click', renderHome);

// =============================================================================
// BOOT
// =============================================================================
renderHome();
