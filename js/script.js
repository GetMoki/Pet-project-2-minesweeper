//Сценарій сайту
"use strict";

/*general variable*/
const startButton = document.getElementById("start");
let canvas = document.getElementById('canvas');

let width = 0;
let height = 0;
let size = 24;
let bombCount = 0;

let cells;
let failedBombKey;
let successBombKey;
let revealedKeys;
let flaggedKeys;
let map;
/*--------------------------------------------------------------------------------------------*/
//script for drop list
const dropList = document.querySelector(".header__setlevel");
const dropListArrow = dropList.querySelector(".header__arrow");
const dropListOpen = dropList.querySelector(".header__list");
const dropListOpenLi = dropListOpen.querySelectorAll('li');
//variable for selected level
let selectedLevel = null;
dropListArrow.style.cursor = "pointer";
dropListOpen.style.cursor = "pointer";
dropListArrow.addEventListener("click", function (e) {
  dropListArrow.classList.toggle('_active');
  dropListOpen.classList.toggle('_active');
  for (let i = 0; i < dropListOpenLi.length; i++) {
    dropListOpenLi[i].addEventListener("click", function (e) {
      for (let j = 0; j < dropListOpenLi.length; j++) {
        if (dropListOpenLi[j].classList.contains('_active')) {
          dropListOpenLi[j].classList.remove('_active');
        }
      }
      dropListOpenLi[i].classList.add('_active');
      dropListArrow.innerHTML = dropListOpenLi[i].textContent;
      selectedLevel = dropListOpenLi[i].getAttribute('data-id');
      setTimeout(function () {
        dropListArrow.classList.remove('_active');
        dropListOpen.classList.remove('_active');
      }, 300);
    });
  }
});
/*--------------------------------------------------------------------------------------------*/
//script for select level
function setLevel(level) {
  if (level === 'Easy') {
    width = 9;
    height = 9;
    bombCount = 9;
  }
  if (level === 'Middle') {
    width = 15;
    height = 15;
    bombCount = 50;
  }
  if (level === 'Hard') {
    width = 22;
    height = 22;
    bombCount = 99;
  }
}
/*-----------------stopwatch------------------------------------------------------------------*/
let minutes = 0;
let seconds = 0;
let stopwatchInterval;
const minutesEL = document.getElementById("minutes");
const secondsEL = document.getElementById("seconds");

function clearStopwatch() {
  clearInterval(stopwatchInterval);
  minutes = 0;
  seconds = 0;
  minutesEL.innerText = "0" + minutes;
  secondsEL.innerText = "0" + seconds;
}
function workStopwatch() {
  seconds++;
  if (seconds <= 9) { secondsEL.innerText = "0" + seconds; }
  if (seconds > 9) { secondsEL.innerText = seconds; }
  if (seconds > 59) {
    minutes++;
    minutesEL.innerText = "0" + minutes;
    seconds = 0;
    secondsEL.innerText = "0" + seconds;
  }
  if (minutes <= 9) { minutesEL.innerText = "0" + minutes; }
  if (minutes > 9) { minutesEL.innerText = minutes; }
}
/*--------------------win or lose function----------------------------------------------------*/
const getWinOrLose = function (what) {
  let outputMessage = document.getElementById("message");
  if (what === 'win') {
    outputMessage.textContent = "Ви виграли!";
    outputMessage.classList.remove("_off");
    outputMessage.classList.add("_game-win");
    clearInterval(stopwatchInterval);
  }
  else if (what === 'lose') {
    outputMessage.textContent = "Ви програли!";
    outputMessage.classList.remove("_off");
    outputMessage.classList.add("_game-over");
    clearInterval(stopwatchInterval);
  }
  else if (what === "clear") {
    outputMessage.classList.add("_off");
    outputMessage.classList.remove("_game-win");
    outputMessage.classList.remove("_gameo-over");
  }
}
/*--------------------user manual----------------------------------------------------*/
function showUserManual() {
  const manual = document.getElementById("manual");
  manual.textContent = 'Щоб виграти помітьте всі міни прапорцями!';
}
/*--------------------------------general script for game--------------------------------------*/
function toKey(row, col) {
  return row + '-' + col;
}
function fromKey(key) {
  return key.split('-').map(Number);
}

//creater buttons and ground in game 
function createButtons() {
  //create groud for game
  canvas.style.width = (width * size) + "px";
  canvas.style.height = (height * size) + "px";
  canvas.style.marginTop = 5 + "px";
  canvas.style.marginBottom = 5 + "px";

  //create game buttons
  for (let i = 0; i < width; i++) {
    for (let j = 0; j < height; j++) {
      let cell = document.createElement("button");
      cell.style.float = 'left';
      cell.style.width = size + "px";
      cell.style.height = size + "px";
      cell.oncontextmenu = (e) => {
        if (failedBombKey !== null) {
          return;
        }
        e.preventDefault();
        toggleFlag(key);
        updateButtons();
      }
      cell.onclick = (e) => {
        if (failedBombKey !== null) {
          return;
        }
        if (flaggedKeys.has(key)) {
          return;
        }
        revealCell(key);
        updateButtons();
      }
      canvas.appendChild(cell);
      let key = toKey(i, j);
      cells.set(key, cell);
    }
  }
}

function startGame() {
  canvas.style.pointerEvents = '';
  failedBombKey = null;
  revealedKeys = new Set();
  flaggedKeys = new Set();
  map = generateMap(generateBombs());
  if (cells) {
    updateButtons();
  } else {
    cells = new Map();
    createButtons();
  }
}

function updateButtons() {
  let bombSroce = 0;
  for (let i = 0; i < width; i++) {
    for (let j = 0; j < height; j++) {
      let key = toKey(i, j);
      let cell = cells.get(key);

      cell.style.backgroundColor = '';
      cell.style.color = 'black';
      cell.textContent = '';
      cell.disabled = false;

      let value = map.get(key);
      if (failedBombKey !== null && value === 'bomb') {
        cell.disabled = true;
        //imput bomb img in cell
        cell.innerHTML = "<img src='img/game/mine.png'/>";
        //changed color under bomb in cell
        cell.style.backgroundColor = 'red';
        if (key === failedBombKey) {
          cell.style.backgroundColor = 'red';
        }
      } else if (revealedKeys.has(key)) {
        cell.disabled = true;
        if (value === undefined) {
          // empty
        } else if (value === 1) {
          cell.textContent = '1';
          cell.style.color = 'blue';
        } else if (value === 2) {
          cell.textContent = '2';
          cell.style.color = 'green';
        } else if (value === 3) {
          cell.textContent = value;
          cell.style.color = '#C70A80';
        } else if (value === 4) {
          cell.textContent = value;
          cell.style.color = '#FBCB0A';
        } else if (value === 5) {
          cell.textContent = value;
          cell.style.color = '#EE5007';
        } else if (value === 6) {
          cell.textContent = value;
          cell.style.color = 'red';
        } else {
          throw Error('should never happen');
        }
      } else if (flaggedKeys.has(key)) {
        cell.innerHTML = "<img src='img/game/flag.png'/>";
        if (failedBombKey === null && value === 'bomb') {
          bombSroce++;
        }
      }
    }
  }
  if (failedBombKey !== null) {
    canvas.style.pointerEvents = 'none';
    getWinOrLose('lose');
  } else if (bombSroce === bombCount) {
    canvas.style.pointerEvents = 'none';
    getWinOrLose('win');
  }
}
function toggleFlag(key) {
  if (flaggedKeys.has(key)) {
    flaggedKeys.delete(key);
  } else {
    flaggedKeys.add(key);
  }
}

function revealCell(key) {
  if (map.get(key) === 'bomb') {
    failedBombKey = key;
  } else {
    propagateReveal(key, new Set());
  }
}
function propagateReveal(key, visited) {
  revealedKeys.add(key);
  visited.add(key);

  let isEmpty = !map.has(key);
  if (isEmpty) {
    for (let neighborKey of getNeighbors(key)) {
      if (!visited.has(neighborKey)) {
        propagateReveal(neighborKey, visited);
      }
    }
  }
}
function isInBounds([row, col]) {
  if (row < 0 || col < 0) {
    return false;
  }
  if (row >= width || col >= height) {
    return false;
  }
  return true;
}
function getNeighbors(key) {
  let [row, col] = fromKey(key);
  let neighborRowCols = [
    [row - 1, col - 1],
    [row - 1, col],
    [row - 1, col + 1],
    [row, col - 1],
    [row, col + 1],
    [row + 1, col - 1],
    [row + 1, col],
    [row + 1, col + 1],
  ];
  return neighborRowCols
    .filter(isInBounds)
    .map(([r, c]) => toKey(r, c));
}
function generateBombs() {
  //how much bombs 
  let count = bombCount;
  let bombs = [];
  let allKeys = [];
  for (let i = 0; i < width; i++) {
    for (let j = 0; j < height; j++) {
      allKeys.push(toKey(i, j));
    }
  }
  allKeys.sort(() => {
    let coinFlip = Math.random() > 0.5;
    return coinFlip ? 1 : -1;
  })
  return allKeys.slice(0, count);
}
function generateMap(seedBombs) {
  let map = new Map();

  function incrementDanger(neighborKey) {
    if (!map.has(neighborKey)) {
      map.set(neighborKey, 1);
    } else {
      let oldVal = map.get(neighborKey);
      if (oldVal !== 'bomb') {
        map.set(neighborKey, oldVal + 1);
      }
    }
  }
  for (let key of seedBombs) {
    map.set(key, 'bomb');
    for (let neighborKey of getNeighbors(key)) {
      incrementDanger(neighborKey);
    }
  }
  return map;
}
/*--------------------------------------------------------------------------------------------*/
let oldSelectedLevel = null;
//start game after click on button "Start"
startButton.addEventListener('click', function () {
  //clear message about wining or losing a game
  getWinOrLose("clear");
  //call a function for timer
  clearStopwatch();
  //call a function for user manual
  showUserManual()
  //selected level of game and size of ground
  setLevel(selectedLevel);
  console.log("TODO better selected level function. Because you can choose level only once");
  //start and restart game
  startGame();
  oldSelectedLevel = selectedLevel;
  stopwatchInterval = setInterval(workStopwatch, 1000);
})
