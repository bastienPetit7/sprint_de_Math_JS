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
const btnGamePage = document.querySelector('.item-footer');
// Score Page
const finalTimeEl = document.querySelector('.final-time');
const baseTimeEl = document.querySelector('.base-time');
const penaltyTimeEl = document.querySelector('.penalty-time');
const playAgainBtn = document.querySelector('.play-again');

// Equations
let equationsArray = [];
let questionAmount = 0;

// Game Page
let firstNumber = 0;
let secondNumber = 0;
let equationObject = {};
const wrongFormat = [];
let playerGuessArray = [];
let bestScoreArray = [];

// Time
let timer;
let timePlayed = 0;
let penaltyTime = 0; 
let finalTime = 0;
let finalTimeDisplay = 0;

// Scroll
let valueY = 0; 

// Input
let inputValue = '';

// Generateur d'entier aléatoir entre 0 et max 
function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

function createEquations() {
    // Configure nbr de right et wrong Equations.
    let nbrRightEquations = getRandomInt(questionAmount);
    let nbrWrongEquations = questionAmount -  nbrRightEquations; 
    console.log('correct equation :', nbrRightEquations);
    console.log('Incorrect equation :', nbrWrongEquations);
    // Create right equations
    for (let i  = 0; i < nbrRightEquations; i++) {
        firstNumber = getRandomInt(9);
        secondNumber = getRandomInt(9); 
        const result = firstNumber * secondNumber; 
        const rightEquation = `${firstNumber} x ${secondNumber} = ${result}`;
        equationObject = { equation : `${rightEquation}`, status: true};
        equationsArray.push(equationObject);
    }
    for (let i = 0; i < nbrWrongEquations; i++) {
        firstNumber = getRandomInt(9);
        secondNumber = getRandomInt(9);
        const result = firstNumber * secondNumber; 
        wrongFormat[0] = `${firstNumber} x ${secondNumber} = ${result + 1}`;
        wrongFormat[1] = `${firstNumber} x ${secondNumber} = ${result - 1}`;
        wrongFormat[2] = `${firstNumber + 1} x ${secondNumber} = ${result}`;
        const wrongEquation = wrongFormat[getRandomInt(3)];
        equationObject = { equation : `${wrongEquation}`, status: false};
        equationsArray.push(equationObject);
    }
    shuffle(equationsArray);
    console.log('Equation Array : ', equationsArray);
}

// Populate Equation To DOM 
function populateEquationToDOM() {
    itemContainer.textContent = '';
    
    // Création d'une div vide  au dessus to make Space 
    const upperSpace = document.createElement('div');
    upperSpace.classList.add('height-240');
    itemContainer.appendChild(upperSpace); 

    // Div item selecteur fixed
    const itemSelecteur = document.createElement('div'); 
    itemSelecteur.classList.add('selected-item');
    itemContainer.appendChild(itemSelecteur); 

    // Populate the equations to the DOM 
    equationsArray.forEach((element) => {
        const equationContainer = document.createElement('div'); 
        equationContainer.classList.add('item'); 
        const equationEl = document.createElement('h1'); 
        equationEl.textContent = element.equation; 
        // Append Element
        equationContainer.appendChild(equationEl); 
        itemContainer.appendChild(equationContainer);
    })

    // Création d'une div vide sous les équation pour permettre le scroll
    const lowerSpace = document.createElement('div'); 
    lowerSpace.classList.add('height-500');
    itemContainer.appendChild(lowerSpace);

     
}

// Populate Best Score to DOM 
function bestScoresToDOM() {
    bestScoreArray.forEach((score, index) => {
        bestScores[index].textContent = `${score.bestScore}s`; 
    })
}

// Local Storage 
function getSavedBestScores() {
    if ( localStorage.getItem('bestScores')){
        bestScoreArray = JSON.parse(localStorage.getItem('bestScores')); 
    } else {
        bestScoreArray = [
            { question : 10, bestScore: finalTimeDisplay },
            { question : 25, bestScore: finalTimeDisplay },
            { question : 50, bestScore: finalTimeDisplay },
            { question : 99, bestScore: finalTimeDisplay },
        ];
        localStorage.setItem('bestScores', JSON.stringify(bestScoreArray));
    }
    bestScoresToDOM(); 
}

// Score Saved to local storage si meilleur score.. 
function saveScoreToLocalStorage() { 
    const questionAmountValue = Number(questionAmount);
    
    bestScoreArray.forEach((scoreObject) => {
        const scoreNumber = scoreObject.bestScore;
        if ( questionAmountValue == scoreObject.question){   
            if( scoreNumber === 0 || scoreNumber > finalTime){ 
                scoreObject.bestScore = finalTime.toFixed(1); 
            }
        }
    });
    
    localStorage.setItem('bestScores', JSON.stringify(bestScoreArray));
    getSavedBestScores();
}

// Reset le jeux quand le user press le button
function playAgain(){ 
    equationsArray = []; 
    playerGuessArray = [];
    valueY= 0;
    // finalTimeDisplay= 0;
    btnGamePage.addEventListener('click', startChrono);
    splashPage.hidden = false; 
    scorePage.hidden = true; 
    
}

// Show Score Page 
function showScorePage() {
    // Reset le scroll à top 0 { Je ne sais pas pourquoi je dois le mettre specifiquement dans cette fonction et pas dans playAgain function??? }
    itemContainer.scrollTo({top: 0});
    // show score Page
    gamePage.hidden = true; 
    scorePage.hidden = false; 
    // Show Play Again button après 1 seconde
    setTimeout(() => { playAgainBtn.hidden = false }, 1000); 

}

// Populate data for score Page avant de l'afficher
function populateDataScorePage() {
    finalTime = timePlayed + penaltyTime; 
    finalTimeEl.textContent = `${finalTime.toFixed(1)}s`; 
    baseTimeEl.textContent = `Temps : ${timePlayed.toFixed(1)}s`; 
    penaltyTimeEl.textContent = `Penalité : ${penaltyTime}s`;
    saveScoreToLocalStorage();
    showScorePage();
}

// Check Time etc...
function checkTime(){
    console.log(timePlayed); 

    if(playerGuessArray.length == questionAmount){
        clearInterval(timer)
        playerGuessArray.forEach((guess, index) => {
            if( guess !== equationsArray[index].status){
                penaltyTime++; 
            }
        })
        populateDataScorePage();
        console.log('penalty Time : ',penaltyTime);
        console.log('player guess array', playerGuessArray);
    }
}

// Add Time
function addTime(){
    timePlayed += 0.1; 
    checkTime();
}

// Chronometre
function startChrono() {
    timePlayed = 0;
    penaltyTime = 0; 
    finalTime = 0;
    timer = setInterval(addTime, 100); 
    btnGamePage.removeEventListener('click', startChrono);
}

// Select Right or Wrong + Onclick Scrolling
function select(playerGuess) {
    
    valueY += 80; 
    itemContainer.scroll(0, valueY); 
    playerGuessArray.push(playerGuess); 
     
}

// show Game Page
function showGamePage(){
    countdownPage.hidden = true;
    gamePage.hidden = false; 
}

// Set Up and Show le countdown
function showCountdown(){
    splashPage.hidden = true; 
    countdownPage.hidden = false;
    let countdownStart = 3; 
    countdown.textContent = `${countdownStart}`;
    const count = setInterval(() => { 
        countdownStart--;
        countdown.textContent = `${countdownStart}`;
        if( countdownStart === 0){
            countdown.textContent = 'GO!'
        } else if ( countdownStart === -1) {
            clearInterval(count);
            showGamePage();
        }
    },1000);  
}

// Configure Submit datas and Launch the functions
function startNewRound(e){
    e.preventDefault();
    // configurer le nombre de question demandé
    questionAmount = inputValue; 
    console.log('Question Amount:',questionAmount);
    createEquations();
    populateEquationToDOM();
    showCountdown();
    
}

startForm.addEventListener('click', () => {
    radioContainers.forEach((radioEl) => {
        // Remove all class Selected Label 
        radioEl.classList.remove('selected-label'); 
        if ( radioEl.children[1].checked){
            radioEl.classList.add('selected-label');
            // récuperation valeur de l'input = Nbr de question demandé
            inputValue = radioEl.children[1].value; 
        }
    })
})

// Event Listener
startForm.addEventListener('submit', startNewRound);
btnGamePage.addEventListener('click', startChrono);

// On load 
getSavedBestScores(); 