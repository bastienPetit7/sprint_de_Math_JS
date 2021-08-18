// Pages
const gamePage = document.getElementById('game-page');
const scorePage = document.getElementById('score-page');
const splashPage = document.getElementById('splash-page');
const countdownPage = document.getElementById('countdown-page');
// Splash Page
const startForm = document.getElementById('start-form');
const radioContainers = document.querySelectorAll('.radio-container');
const radioInputs = document.querySelectorAll('input');
const bestScores = document.querySelectorAll('.best-score-value');
// Countdown Page
const countdown = document.querySelector('.countdown');
// Game Page
const itemContainer = document.querySelector('.item-container');
// Score Page
const finalTimeEl = document.querySelector('.final-time');
const baseTimeEl = document.querySelector('.base-time');
const penaltyTimeEl = document.querySelector('.penalty-time');
const playAgainBtn = document.querySelector('.play-again');

// Equations
let questionAmount =  0;
let equationsArray = [];
let playerGuessArray = [];
let bestScoreArray = [];

// Game Page
let firstNumber = 0;
let secondNumber = 0;
let equationObject = {};
const wrongFormat = [];

// Time
let timer;
let timePlayed = 0;
let baseTime = 0;
let penaltyTime = 0;
let finalTime = 0;
let finalTimeDisplay = '0.0'; 

// Scroll
let valueY = 0;

// Refresh Splash Page best Scores
function bestScoresToDOM() {
  bestScores.forEach((bestScore, index) => {
    const bestScoreEl = bestScore; 
    bestScoreEl.textContent = `${bestScoreArray[index].bestScore}s`
  })
}

// Check Local storage for Best Scores, set bestScoreArray
function getSavedBestScores() {
  if (localStorage.getItem('bestScores')) {
    bestScoreArray = JSON.parse(localStorage.bestScores);
  } else {
    bestScoreArray = [
      { questions : 10, bestScore : finalTimeDisplay},
      { questions : 25, bestScore : finalTimeDisplay},
      { questions : 50, bestScore : finalTimeDisplay},
      { questions : 99, bestScore : finalTimeDisplay},
    ];
    localStorage.setItem('bestScore', JSON.stringify(bestScoreArray));
  }
  bestScoresToDOM();
} 

// Update Best score Array 
function updateBestScore() {
  bestScoreArray.forEach((score, index) => {
    // Select correct Best Score to update
    if (questionAmount == score.questions) {
      // Return Best Score as number with one decimal
      const savedBestScore = Number(bestScoreArray[index].bestScore); 
      console.log('best Score', savedBestScore);
      // Update if the new final score is less or replacing zero
      if (savedBestScore === 0 || savedBestScore > finalTime) {
        bestScoreArray[index].bestScore = finalTimeDisplay; 
      }
    }
  });
  // Update Splash Page
  bestScoresToDOM(); 
  // save to local storage
  localStorage.setItem('bestScores', JSON.stringify(bestScoreArray));
}


// Reset the Game  
function playAgain(){
  gamePage.addEventListener('click', startTimer);
  scorePage.hidden = true;
  splashPage.hidden = false;
  equationsArray= [];
  playerGuessArray= []; 
  valueY = 0;
  playAgainBtn.hidden = true;
   
}

// Show Score Page 
function showScorePage(){
  // Reset game page's scroll to the top
  itemContainer.scrollTo({ top: 0, behavior: 'instant'});
  // Populate time values to Score Page 
  finalTimeDisplay = finalTime.toFixed(1);
  baseTime = timePlayed.toFixed(1);
  penaltyTime = penaltyTime.toFixed(1);
  baseTimeEl.textContent = `Base Time: ${baseTime}s`;
  penaltyTimeEl.textContent = `Penalty: +${penaltyTime}s`;
  finalTimeEl.textContent = `${finalTimeDisplay}s`;
  updateBestScore();
  // Show Score Page
  gamePage.hidden = true;
  scorePage.hidden = false; 
  // Show PlayAgain button 1s after the page appears
  setTimeout(() => {
    playAgainBtn.hidden = false;
  }, 1000);
}

// Stop Time, Process Results, go to Score Page
function checkTime() {
  console.log(timePlayed);
  if (playerGuessArray.length == questionAmount) {
    clearInterval(timer);
    playerGuessArray.forEach((answer,i) => {
      if (answer !== equationsArray[i].evaluated){
        penaltyTime++;
      } 
    });
    finalTime = penaltyTime + timePlayed; 
    showScorePage();
    console.log('Penalty Time',penaltyTime);
    console.log('time played', timePlayed);
  };
}

// Add a tenth of a second to timePlayed
function addTime(){
  timePlayed += 0.1;
  checkTime();
}

// Start timer when game page is clicked
function startTimer() {
  //Reset times
  timePlayed= 0;
  penaltyTime= 0; 
  finalTime= 0;
  timer = setInterval(addTime, 100);
  gamePage.removeEventListener('click', startTimer);
}

// Scroll, Store user selection in playerGuessArray
function select(guessedTrue){ 
    // Scroll 80 pixels
    valueY += 80;
    itemContainer.scroll(0, valueY);
    // Add player guess to array
    return guessedTrue ? playerGuessArray.push('true') : playerGuessArray.push('false');
}


// Get Random Number up to a max Number 
function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

// Create Correct/Incorrect Random Equations
function createEquations() {
  // Randomly choose how many correct equations there should be
  const correctEquations = getRandomInt(questionAmount);
  console.log('correct equation:', correctEquations);
  // Set amount of wrong equations
  const wrongEquations = questionAmount - correctEquations;
  console.log('wrong equation:', wrongEquations);
  // Loop through, multiply random numbers up to 9, push to array
  for (let i = 0; i < correctEquations; i++) {
    firstNumber = getRandomInt(9);
    secondNumber = getRandomInt(9);
    const equationValue = firstNumber * secondNumber;
    const equation = `${firstNumber} x ${secondNumber} = ${equationValue}`;
    equationObject = { value: equation, evaluated: 'true' };
    equationsArray.push(equationObject);
  }
  // Loop through, mess with the equation results, push to array
  for (let i = 0; i < wrongEquations; i++) {
    firstNumber = getRandomInt(9);
    secondNumber = getRandomInt(9);
    const equationValue = firstNumber * secondNumber;
    wrongFormat[0] = `${firstNumber} x ${secondNumber + 1} = ${equationValue}`;
    wrongFormat[1] = `${firstNumber} x ${secondNumber} = ${equationValue - 1}`;
    wrongFormat[2] = `${firstNumber + 1} x ${secondNumber} = ${equationValue}`;
    const formatChoice = getRandomInt(3);
    const equation = wrongFormat[formatChoice];
    equationObject = { value: equation, evaluated: 'false' };
    equationsArray.push(equationObject);
  }
  shuffle(equationsArray); 
}

// Add Equations to DOM
function equationsToDOM(){
  equationsArray.forEach((equation) => {
    // Item
    const item = document.createElement('div');
    item.classList.add('item');
    // Equation Text
    const equationText = document.createElement('h1');
    equationText.textContent = equation.value;
    //Append
    item.appendChild(equationText);
    itemContainer.appendChild(item);
  });
}

// Dynamically adding correct/incorrect equations
function populateGamePage() {
  // Reset DOM, Set Blank Space Above
  itemContainer.textContent = '';
  // Spacer
  const topSpacer = document.createElement('div');
  topSpacer.classList.add('height-240');
  // Selected Item
  const selectedItem = document.createElement('div');
  selectedItem.classList.add('selected-item');
  // Append
  itemContainer.append(topSpacer, selectedItem);

  // Create Equations, Build Elements in DOM
  createEquations();
  equationsToDOM();

  // Set Blank Space Below
  const bottomSpacer = document.createElement('div');
  bottomSpacer.classList.add('height-500');
  itemContainer.appendChild(bottomSpacer);
}

//Displays Game Page 
function showGamePage() {
  countdownPage.hidden = true;
  gamePage.hidden = false; 
}

// Display 3,2,1 GO!
function countdownStart(){
  countdown.textContent = '3';
  setTimeout(() => {
    countdown.textContent = '2';
  }, 1000);
  setTimeout(() => {
    countdown.textContent = '1';
  }, 2000);
  setTimeout(() => {
    countdown.textContent = 'GO!';
  }, 3000);
   
}

// Navigate from splash to countdown page
function showCountdown() {
  countdownPage.hidden = false;
  splashPage.hidden = true; 
  countdownStart();
  populateGamePage();
  setTimeout(showGamePage, 400);
}


// Get values from selected radio button
function getRadioValue() {
  let radioValue; 
  radioInputs.forEach((radioInput) => {
    if(radioInput.checked){
      radioValue = radioInput.value;
      console.log('radio Value', radioValue);  
    }
  });
  return radioValue;
}

// Form That decides amount of question
function selectQuestionAmount(e) {
  e.preventDefault();
  questionAmount = getRadioValue();
  console.log('question Amount', questionAmount);
  if(questionAmount === undefined){
    alert('Please Select something.')
  } else {
    
    showCountdown();
  }
}

startForm.addEventListener('click', () => {
  radioContainers.forEach((radioEl) => {
    // Remove Selected Label Styling
    radioEl.classList.remove('selected-label'); 
    // Add it back if radio input is checked
    if (radioEl.children[1].checked) {
      radioEl.classList.add('selected-label');
    }
  });
});

// Event Listener 
startForm.addEventListener('submit', selectQuestionAmount);
gamePage.addEventListener('click', startTimer);

// On Load 
getSavedBestScores(); 