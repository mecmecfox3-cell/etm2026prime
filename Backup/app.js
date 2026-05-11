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
  serie1: {
    title: "Série 1", videoFile: "video.mp4",
    questions: [
      [35, 60, 94, "B"], [95, 120, 165, "A"], [166, 191, 236, "B, C"], [237, 262, 313, "A, D"], [314, 339, 401, "B"],
      [402, 427, 462, "A, C"], [463, 488, 511, "A"], [512, 537, 576, "A, C"], [577, 602, 657, "A, C"], [658, 683, 716, "A, C"],
      [717, 742, 777, "A"], [778, 803, 849, "B, D"], [850, 875, 944, "A, B, C"], [945, 970, 1017, "B, C"], [1018, 1043, 1087, "A"],
      [1088, 1113, 1151, "B"], [1152, 1177, 1207, "A"], [1208, 1233, 1255, "A"], [1256, 1281, 1325, "A"], [1326, 1351, 1393, "A"],
      [1394, 1419, 1450, "A, B, C"], [1451, 1476, 1509, "A, C"], [1510, 1535, 1568, "B"], [1569, 1594, 1628, "A, C"], [1629, 1654, 1699, "A, C"],
      [1700, 1725, 1794, "B, C"], [1795, 1820, 1853, "A"], [1854, 1879, 1917, "B"], [1918, 1943, 1989, "B"], [1990, 2015, 2047, "B, C"],
      [2048, 2073, 2116, "B, D"], [2117, 2142, 2203, "B, C"], [2204, 2229, 2281, "B, D"], [2282, 2307, 2338, "B"], [2339, 2364, 2398, "A, C"],
      [2399, 2424, 2466, "A, C"], [2467, 2492, 2534, "A, C"], [2535, 2560, 2595, "A, C, D"], [2596, 2621, 2677, "B, D"], [2678, 2703, 2724, "A"]
    ]
  },
  "serie2": {
    "title": "Série 2", "videoFile": "video2.mp4",
    "questions": [
      [34, 59, 80, "B"], [81, 106, 154, "A, C"], [155, 180, 236, "A, C, D"], [237, 262, 318, "A, C"], [319, 344, 384, "A, B, C"],
      [385, 410, 443, "A"], [444, 469, 525, "A, D"], [526, 551, 595, "A, C"], [596, 621, 670, "A, D"], [671, 696, 746, "A, D"],
      [747, 772, 817, "A, D"], [818, 843, 887, "A, C"], [888, 913, 938, "B"], [939, 964, 1008, "B, C"], [1009, 1034, 1074, "A, C"],
      [1075, 1100, 1137, "A, C, D"], [1138, 1163, 1209, "B"], [1210, 1235, 1267, "A"], [1268, 1293, 1314, "A"], [1315, 1340, 1367, "B"],
      [1368, 1393, 1462, "A, D"], [1463, 1488, 1523, "A, B"], [1524, 1549, 1564, "B"], [1565, 1590, 1624, "C"], [1625, 1650, 1697, "A, D"],
      [1698, 1723, 1755, "B"], [1756, 1781, 1809, "A"], [1810, 1835, 1894, "A, C"], [1895, 1920, 1965, "A, C"], [1966, 1991, 2021, "A"],
      [2022, 2047, 2089, "A, C"], [2090, 2115, 2141, "A"], [2142, 2167, 2201, "A, D"], [2202, 2227, 2268, "B"], [2269, 2294, 2334, "A"],
      [2335, 2360, 2411, "B, D"], [2412, 2437, 2479, "A, C"], [2480, 2505, 2534, "B"], [2535, 2560, 2589, "A, C"], [2590, 2615, 2615, "A"]
    ]
  },
  "serie3": {
    "title": "Série 3", "videoFile": "video3.mp4",
    "questions": [
      [34, 59, 97, "A, C"], [98, 123, 157, "A, D"], [158, 183, 249, "A, C"], [250, 275, 310, "B"], [311, 336, 356, "A, C"],
      [357, 382, 433, "A, D"], [434, 459, 510, "A, C"], [511, 536, 561, "A"], [562, 587, 627, "B"], [628, 653, 687, "B"],
      [688, 713, 753, "A, D"], [754, 779, 826, "A, C"], [827, 852, 888, "B"], [889, 914, 954, "A, C"], [955, 980, 1024, "C"],
      [1025, 1050, 1087, "A, C"], [1088, 1113, 1163, "B"], [1164, 1189, 1227, "B, D"], [1228, 1253, 1293, "C"], [1294, 1319, 1337, "B"],
      [1338, 1363, 1407, "A"], [1408, 1433, 1474, "A"], [1475, 1500, 1550, "A, D"], [1551, 1576, 1600, "B"], [1601, 1626, 1654, "A, C"],
      [1655, 1680, 1715, "A, C"], [1716, 1741, 1778, "B"], [1779, 1804, 1847, "A"], [1848, 1873, 1907, "A, C, D"], [1908, 1933, 1973, "B"],
      [1974, 1999, 2026, "B"], [2027, 2052, 2071, "A"], [2072, 2097, 2144, "A, B, C"], [2145, 2170, 2220, "A, B, D"], [2221, 2246, 2279, "B, C"],
      [2280, 2305, 2347, "B"], [2348, 2373, 2413, "B"], [2414, 2439, 2468, "B"], [2469, 2494, 2515, "A"], [2516, 2541, 2548, "A, B, C"]
    ]
  },
  "serie4": {
    "title": "Série 4", "videoFile": "video4.mp4",
    "questions": [
      [35, 60, 94, "A"], [95, 120, 151, "B, C, D"], [152, 177, 229, "A, C"], [230, 255, 306, "B, C"], [307, 332, 353, "A"],
      [354, 379, 430, "B, D"], [431, 456, 517, "B, C"], [518, 543, 596, "A"], [597, 622, 660, "A, D"], [661, 686, 712, "A, C"],
      [713, 738, 773, "A, C"], [774, 799, 847, "C"], [848, 873, 914, "A"], [915, 940, 971, "A"], [972, 997, 1021, "A, C"],
      [1022, 1047, 1088, "A, C"], [1089, 1114, 1141, "A, D"], [1142, 1167, 1205, "B"], [1206, 1231, 1254, "A, C"], [1255, 1280, 1314, "A"],
      [1315, 1340, 1359, "A"], [1360, 1385, 1414, "C"], [1415, 1440, 1461, "A, D"], [1462, 1487, 1527, "B"], [1528, 1553, 1617, "A, C"],
      [1618, 1643, 1685, "A"], [1686, 1711, 1748, "A"], [1749, 1774, 1821, "A, C"], [1822, 1847, 1891, "A"], [1892, 1917, 1955, "A"],
      [1956, 1981, 2024, "B"], [2025, 2050, 2097, "A"], [2098, 2123, 2166, "A, D"], [2167, 2192, 2237, "B, C"], [2238, 2263, 2296, "B"],
      [2297, 2322, 2361, "B"], [2362, 2387, 2432, "A, C"], [2433, 2458, 2507, "A, D"], [2508, 2533, 2580, "A, B, D"], [2581, 2606, 2609, "A, C"]
    ]
  },
  "serie5": {
    "title": "Série 5", "videoFile": "video5.mp4",
    "questions": [
      [34, 59, 88, "C"], [89, 114, 131, "A, C"], [132, 157, 173, "A"], [174, 199, 226, "A"], [227, 252, 276, "A, C"],
      [277, 302, 318, "B"], [319, 344, 359, "A"], [360, 385, 399, "B"], [400, 425, 439, "A"], [440, 465, 501, "A, B, D"],
      [502, 527, 555, "A, C"], [556, 581, 625, "A, C"], [626, 651, 701, "A, C"], [702, 727, 762, "C"], [763, 788, 828, "B"],
      [829, 854, 889, "A"], [890, 915, 971, "A, B, C"], [972, 997, 1043, "C"], [1044, 1069, 1110, "A"], [1111, 1136, 1169, "A"],
      [1170, 1195, 1248, "B, C"], [1249, 1274, 1309, "A"], [1310, 1335, 1387, "A, D"], [1388, 1413, 1453, "B, D"], [1454, 1479, 1531, "B, D"],
      [1532, 1557, 1603, "B"], [1604, 1629, 1685, "A, C"], [1686, 1711, 1784, "C"], [1785, 1810, 1855, "A, D"], [1856, 1881, 1920, "B, C"],
      [1921, 1946, 1980, "A, C"], [1981, 2006, 2050, "B"], [2051, 2076, 2114, "A"], [2115, 2140, 2178, "C"], [2179, 2204, 2245, "A, C"],
      [2246, 2271, 2315, "B"], [2316, 2341, 2390, "B"], [2391, 2416, 2470, "A"], [2471, 2496, 2554, "A"], [2555, 2580, 2570, "B, C"]
    ]
  },
  "serie6": {
    "title": "Série 6", "videoFile": "video6.mp4",
    "questions": [
      [35, 60, 81, "A, C"], [82, 107, 131, "B, C"], [132, 157, 181, "B, C"], [182, 207, 231, "A"], [232, 257, 288, "A, C"],
      [289, 314, 340, "A"], [341, 366, 409, "A, B, D"], [410, 435, 470, "B, D"], [471, 496, 527, "A, C"], [528, 553, 584, "A"],
      [585, 610, 647, "A, C"], [648, 673, 710, "A, C, D"], [711, 736, 787, "A, C"], [788, 813, 865, "A, C"], [866, 891, 934, "B"],
      [935, 960, 1008, "A, C"], [1009, 1034, 1078, "A"], [1079, 1104, 1146, "B"], [1147, 1172, 1212, "B, D"], [1213, 1238, 1268, "A"],
      [1269, 1294, 1344, "A, D"], [1345, 1370, 1408, "B, D"], [1409, 1434, 1471, "A, C"], [1472, 1497, 1547, "A, C"], [1548, 1573, 1633, "B, C"],
      [1634, 1659, 1698, "B, C"], [1699, 1724, 1761, "A, D"], [1762, 1787, 1837, "A, B, C"], [1838, 1863, 1916, "A"], [1917, 1942, 1970, "C"],
      [1971, 1996, 2028, "A"], [2029, 2054, 2088, "A, C"], [2089, 2114, 2158, "A"], [2159, 2184, 2225, "A"], [2226, 2251, 2291, "A, C"],
      [2292, 2317, 2364, "A, C"], [2365, 2390, 2434, "B"], [2435, 2460, 2497, "A, B, C"], [2498, 2523, 2574, "A, C"], [2575, 2600, 2590, "B, C"]
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
    'fa-gauge-high', 'fa-helmet-safety', 'fa-flag-checkered'
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
