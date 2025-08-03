// Variables del juego
let currentScreen = 'title';
let selectedOperation = '';
let selectedLevel = 1;
let score = 0;
let highscore = localStorage.getItem('mathMagicHighscore') || 0;
let timer = 60;
let timerInterval;
let lives = 3;
let correctAnswers = 0;
let totalQuestions = 0;
let currentAnswer = 0;

// Elementos del DOM
const titleScreen = document.getElementById('title-screen');
const menuScreen = document.getElementById('menu-screen');
const gameScreen = document.getElementById('game-screen');
const resultScreen = document.getElementById('result-screen');
const questionDisplay = document.getElementById('question-display');
const answerOptions = document.getElementById('answer-options');
const scoreDisplay = document.getElementById('score');
const highscoreDisplay = document.getElementById('highscore');
const timerDisplay = document.getElementById('timer');
const livesDisplay = document.getElementById('lives');
const finalScoreDisplay = document.getElementById('final-score');
const finalHighscoreDisplay = document.getElementById('final-highscore');
const correctAnswersDisplay = document.getElementById('correct-answers');
const totalQuestionsDisplay = document.getElementById('total-questions');
const feedbackOverlay = document.getElementById('feedback-overlay');
const feedbackTitle = document.getElementById('feedback-title');
const feedbackMessage = document.getElementById('feedback-message');
const gameScene = document.getElementById('game-scene');
const playerCharacter = document.getElementById('player-character');
const enemyCharacter = document.getElementById('enemy-character');
// Configurar el botón de comenzar batalla
function setupStartButton() {
  const startButton = document.querySelector('.start-game-button');
  if (startButton) {
    startButton.addEventListener('click', startBattle);
  } else {
    console.error('No se encontró el botón de comenzar batalla');
  }
}
// Inicializar el juego
function initGame() {
  highscoreDisplay.textContent = highscore;
  setupEventListeners();
  setupStartButton();
}

// Configurar event listeners
function setupEventListeners() {
  // Botones de operación
  document.querySelectorAll('.operation-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      selectOperation(this.dataset.operation);
    });
  });

  // Niveles
  document.querySelectorAll('.level-option').forEach(level => {
    level.addEventListener('click', function() {
      selectLevel(parseInt(this.dataset.level));
    });
  });
}

// Iniciar el juego
function startGame() {
  titleScreen.style.display = 'none';
  menuScreen.style.display = 'block';
  currentScreen = 'menu';
}

// Volver al inicio
function goHome() {
  menuScreen.style.display = 'none';
  gameScreen.style.display = 'none';
  resultScreen.style.display = 'none';
  titleScreen.style.display = 'block';
  currentScreen = 'title';
  
  // Resetear valores si estaba en juego
  resetGame();
}

// Ir al menú
function goToMenu() {
  resultScreen.style.display = 'none';
  menuScreen.style.display = 'block';
  currentScreen = 'menu';
  resetGame();
}

// Seleccionar operación
function selectOperation(op) {
  selectedOperation = op;
  
  // Actualizar UI para mostrar la operación seleccionada
  document.querySelectorAll('.operation-btn').forEach(btn => {
    btn.classList.remove('selected');
    if (btn.dataset.operation === op) {
      btn.classList.add('selected');
    }
  });
}

// Seleccionar nivel
function selectLevel(level) {
  selectedLevel = level;
  
  // Actualizar UI para mostrar el nivel seleccionado
  document.querySelectorAll('.level-option').forEach(opt => {
    opt.classList.remove('selected');
    if (parseInt(opt.dataset.level) === level) {
      opt.classList.add('selected');
    }
  });
}

// Comenzar la batalla
function startBattle() {
  if (!selectedOperation) {
    showAlert('Por favor selecciona una operación');
    return;
  }
  
  menuScreen.style.display = 'none';
  gameScreen.style.display = 'block';
  currentScreen = 'game';
  
  // Configurar escena según nivel
  setupScene();
  
  // Iniciar valores del juego
  score = 0;
  lives = 3;
  correctAnswers = 0;
  totalQuestions = 0;
  timer = 60;
  
  // Actualizar UI
  scoreDisplay.textContent = score;
  livesDisplay.textContent = lives;
  timerDisplay.textContent = timer;
  
  // Iniciar temporizador
  startTimer();
  
  // Generar primera pregunta
  generateQuestion();
}

// Configurar escena del juego
function setupScene() {
  // Limpiar clases anteriores
  gameScene.className = 'game-background';
  playerCharacter.className = 'wizard-character animated';
  enemyCharacter.className = 'enemy-character animated';
  
  // Añadir clases según nivel
  gameScene.classList.add(`level-${selectedLevel}`);
  
  // Animaciones diferentes según nivel
  if (selectedLevel === 3) {
    playerCharacter.classList.add('power-up');
    enemyCharacter.classList.add('boss');
  }
}

// Iniciar temporizador
function startTimer() {
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    timer--;
    timerDisplay.textContent = timer;
    
    if (timer <= 0) {
      endGame();
    }
  }, 1000);
}

// Generar pregunta
function generateQuestion() {
  const operators = {
    add: '+',
    subtract: '-',
    multiply: '×',
    divide: '÷',
    mixed: ['+', '-', '×', '÷'][Math.floor(Math.random() * 4)]
  };

  // Determinar rango de números según nivel
  let maxNumber;
  switch(selectedLevel) {
    case 1: maxNumber = 10; break;
    case 2: maxNumber = 50; break;
    case 3: maxNumber = 100; break;
    default: maxNumber = 10;
  }

  let num1 = Math.floor(Math.random() * maxNumber) + 1;
  let num2 = Math.floor(Math.random() * maxNumber) + 1;
  
  // Asegurar división válida
  if (selectedOperation === 'divide' || (selectedOperation === 'mixed' && operators.mixed === '÷')) {
    // Hacer que la división sea exacta para simplificar
    num1 = num1 * num2;
  }

  const operator = selectedOperation === 'mixed' ? operators.mixed : operators[selectedOperation];
  const question = `${num1} ${operator} ${num2}`;
  
  // Calcular respuesta
  let answer;
  switch(operator) {
    case '+': answer = num1 + num2; break;
    case '-': answer = num1 - num2; break;
    case '×': answer = num1 * num2; break;
    case '÷': answer = num1 / num2; break;
  }
  
  currentAnswer = answer;
  totalQuestions++;
  
  // Mostrar pregunta
  questionDisplay.innerHTML = `<span class="number">${num1}</span> <span class="operator">${operator}</span> <span class="number">${num2}</span> <span class="equals">=</span>`;
  
  // Generar opciones de respuesta
  generateAnswerOptions(answer, maxNumber);
}

// Generar opciones de respuesta
function generateAnswerOptions(correctAnswer, maxNumber) {
  answerOptions.innerHTML = '';
  const options = [correctAnswer];
  
  // Generar respuestas incorrectas basadas en el nivel
  while (options.length < 4) {
    let randomAnswer;
    const variation = Math.floor(maxNumber / 10) + 1;
    
    if (Math.random() > 0.5) {
      randomAnswer = correctAnswer + Math.floor(Math.random() * variation) + 1;
    } else {
      randomAnswer = correctAnswer - Math.floor(Math.random() * variation) - 1;
    }
    
    // Asegurar que no sea negativo en niveles bajos
    if (selectedLevel === 1 && randomAnswer < 0) {
      randomAnswer = Math.abs(randomAnswer);
    }
    
    // Evitar duplicados
    if (!options.includes(randomAnswer) && randomAnswer !== 0) {
      options.push(randomAnswer);
    }
  }
  
  // Mezclar opciones
  shuffleArray(options);
  
  // Crear botones de opciones
  options.forEach(option => {
    const button = document.createElement('button');
    button.textContent = option;
    button.addEventListener('click', () => checkAnswer(option));
    answerOptions.appendChild(button);
  });
}

// Verificar respuesta
function checkAnswer(selectedAnswer) {
  const isCorrect = selectedAnswer === currentAnswer;
  
  if (isCorrect) {
    // Respuesta correcta
    score += selectedLevel * 10; // Más puntos en niveles más altos
    correctAnswers++;
    updateScore();
    showFeedback('¡CORRECTO!', `+${selectedLevel * 10} puntos`);
    
    // Animación de acierto
    playerCharacter.classList.add('attack');
    setTimeout(() => playerCharacter.classList.remove('attack'), 500);
  } else {
    // Respuesta incorrecta
    lives--;
    livesDisplay.textContent = lives;
    showFeedback('¡INCORRECTO!', `La respuesta era: ${currentAnswer}`);
    
    // Animación de daño
    playerCharacter.classList.add('damage');
    setTimeout(() => playerCharacter.classList.remove('damage'), 500);
    
    if (lives <= 0) {
      setTimeout(endGame, 1000);
      return;
    }
  }
  
  // Siguiente pregunta después de un breve retraso
  setTimeout(nextQuestion, 1500);
}

// Mostrar feedback
function showFeedback(title, message) {
  feedbackTitle.textContent = title;
  feedbackMessage.textContent = message;
  feedbackOverlay.classList.remove('hidden');
  
  setTimeout(() => {
    feedbackOverlay.classList.add('hidden');
  }, 1300);
}

// Siguiente pregunta
function nextQuestion() {
  if (lives <= 0) return;
  generateQuestion();
}

// Actualizar puntuación
function updateScore() {
  scoreDisplay.textContent = score;
  if (score > highscore) {
    highscore = score;
    highscoreDisplay.textContent = highscore;
    localStorage.setItem('mathMagicHighscore', highscore);
  }
}

// Terminar el juego
function endGame() {
  clearInterval(timerInterval);
  gameScreen.style.display = 'none';
  resultScreen.style.display = 'block';
  currentScreen = 'result';
  
  // Actualizar estadísticas finales
  finalScoreDisplay.textContent = score;
  finalHighscoreDisplay.textContent = highscore;
  correctAnswersDisplay.textContent = correctAnswers;
  totalQuestionsDisplay.textContent = totalQuestions;
}

// Reintentar juego
function retryGame() {
  resultScreen.style.display = 'none';
  startBattle();
}

// Resetear juego
function resetGame() {
  clearInterval(timerInterval);
  score = 0;
  lives = 3;
  timer = 60;
  correctAnswers = 0;
  totalQuestions = 0;
}

// Mezclar array
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Mostrar alerta
function showAlert(message) {
  // Implementación simple de alerta
  const alertBox = document.createElement('div');
  alertBox.className = 'custom-alert';
  alertBox.textContent = message;
  document.body.appendChild(alertBox);
  
  setTimeout(() => {
    alertBox.remove();
  }, 2000);
}

// Inicializar el juego cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', initGame);