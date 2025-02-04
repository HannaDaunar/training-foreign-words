"use strict";

const words = [
    { english: "cat", russian: "кот", example: "We used to have a cat ourselves" },
    { english: "water", russian: "вода", example: "I bought a bottle of water at the bar" },
    { english: "summer", russian: "лето", example: "Last summer was the hottest since 1990" },
    { english: "lesson", russian: "урок", example: "Historical lessons must be learned" },
    { english: "table", russian: "стол", example: "Our kitchen table is made of oak" }
]

const studyMode = document.querySelector("#study-mode");
const numberCurrentWord = document.querySelector("#current-word");
const wordsProgress = document.querySelector("#words-progress");

const examMode = document.querySelector("#exam-mode");
const examProgress = document.querySelector("#exam-progress");
const correctPercent = document.querySelector("#correct-percent");
const time = document.querySelector("#time");

const studyCards = document.querySelector(".study-cards");
const flipCard = document.querySelector(".flip-card");
const cardFront = document.querySelector("#card-front");
const titleCardFront = document.querySelector("#card-front h1");
const cardBack = document.querySelector("#card-back");
const titleCardBack = document.querySelector("#card-back h1");
const spanCardBack = document.querySelector("#card-back span");

const examCards = document.querySelector("#exam-cards");

const btnShuffleWords = document.querySelector("#shuffle-words");
const btnNext = document.querySelector("#next");
const btnBack = document.querySelector("#back");
const btnExam = document.querySelector("#exam");
const btnTraining = document.querySelector("#training");

const resultsModal = document.querySelector(".results-modal");
const resultsContent = document.querySelector(".results-content");
const timer = document.querySelector("#timer");
const wordStatsTemplate = document.querySelector("template#word-stats");


function calculateProgress(number, arr, el) {
    const progressPercent = (number / arr.length) * 100;
    return el.value = progressPercent;
}

let count = 1;
calculateProgress(count, words, wordsProgress);

btnNext.addEventListener("click", function() {
    count++;
    ++numberCurrentWord.textContent;
    titleCardFront.textContent = words[count - 1].english;
    flipCard.classList.remove("active");
    btnBack.disabled = false;

    if (count === words.length) {
        btnNext.disabled = true;
    }

    calculateProgress(count, words, wordsProgress);
})

btnBack.addEventListener("click", function() {
    btnNext.disabled = false;
    count--;
    --numberCurrentWord.textContent;
    titleCardFront.textContent = words[count - 1].english;
    flipCard.classList.remove("active");

    if (count === 1) {
        btnBack.disabled = true;
    }

    calculateProgress(count, words, wordsProgress);
})

titleCardFront.textContent = words[count - 1].english;

flipCard.addEventListener("click", function() {

    if (!flipCard.classList.contains("active")) {
        flipCard.classList.add("active");
        titleCardBack.textContent = words[count - 1].russian;
        spanCardBack.textContent = words[count - 1].example;
    } else {
        flipCard.classList.remove("active");
    }
})

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

btnShuffleWords.addEventListener("click", function() {
    shuffleArray(words);
    localStorage.setItem("orderOfWords", JSON.stringify(words));
    titleCardFront.textContent = words[count - 1].english;
    titleCardBack.textContent = words[count - 1].russian;
    spanCardBack.textContent = words[count - 1].example;
})

let seconds = 0;
let minutes = 0;
let timerIdExam = null;

function format(n) {
    if (n < 10) {
        return `0${n}`;
    } else {
        return n;
    }
}

function settingTime() {
    seconds++;
    if (seconds === 60) {
        minutes++;
        seconds = 0;
    }
    time.textContent = `${format(minutes)}:${format(seconds)}`;
}

function renderCards(arr) {
    shuffleArray(arr);
    const fragment = new DocumentFragment();

    arr.forEach((item) => {
        const card = document.createElement("div");
        card.classList.add("card");
        card.textContent = item;
        fragment.append(card);
    })

    examCards.append(fragment);
}

const englishWords = words.map(item => item.english);
const russianWords = words.map(item => item.russian);
const newWords = [...englishWords, ...russianWords];

btnExam.addEventListener("click", function() {
    timerIdExam = setInterval(settingTime, 1000);
    studyCards.classList.add("hidden");
    studyMode.classList.add("hidden");
    examMode.classList.remove("hidden");
    btnTraining.classList.remove("hidden");
    renderCards(newWords);
})

function findIndex(arr1, arr2, element) {
    let index = arr1.indexOf(element);
    if (index !== -1) {
        return index;
    }
    index = arr2.indexOf(element);
    if (index !== -1) {
        return index;
    }
    return null;
}

function exists(arr, el) {
    return arr.some(obj => obj.textContent === el.textContent);
}

function showWordStats() {
    timer.textContent = time.textContent;
    localStorage.setItem("timeOfEsam", timer.textContent);
    resultsModal.classList.remove("hidden");
    makeWordStatsByTemplate();
}

function makeWordStatsByTemplate() {
    const fragment = new DocumentFragment();
    for (let item of englishWords) {
        const wordStat = wordStatsTemplate.content.cloneNode(true);
        wordStat.querySelector(".word span").textContent = item;
        wordStat.querySelector(".attempts span").textContent = wordsStats[item];
        fragment.append(wordStat);
    }
    resultsContent.append(fragment);
}

let pairs = [];
let fadeOutCards = [];
let wordsStats = {};

examCards.addEventListener("click", function(e) {

    if (!exists(pairs, e.target) && !exists(fadeOutCards, e.target) && e.target.classList.contains("card")) {
        pairs.push(e.target);
        pairs[0].classList.add("correct");
    }

    if (pairs.length === 2) {
        const index = findIndex(englishWords, russianWords, pairs[0].textContent);
        const index1 = findIndex(englishWords, russianWords, pairs[1].textContent);
        wordsStats[englishWords[index1]] = (wordsStats[englishWords[index1]] || 0) + 1;

        if (index === index1) {
            pairs[0].classList.add("fade-out");
            pairs[1].classList.add("correct", "fade-out");
            fadeOutCards.push(pairs[0], pairs[1]);
            correctPercent.textContent = `${Math.round(calculateProgress(fadeOutCards.length, newWords, examProgress))}%`;
            pairs = [];

        } else {
            pairs[1].classList.add("wrong");
            setTimeout(() => {
                pairs[0].classList.remove("correct");
                pairs[1].classList.remove("wrong");
                pairs = [];
            }, 500);
        }
    }

    if (fadeOutCards.length === newWords.length) {
        setTimeout(() => {
            clearInterval(timerIdExam);
            showWordStats();
        }, 500)
    }
})

btnTraining.addEventListener("click", function() {
    examCards.innerHTML = "";
    resultsModal.classList.add("hidden");
    resultsContent.innerHTML = "";
    time.textContent = "00:00";
    clearInterval(timerIdExam);
    seconds = 0;
    minutes = 0;
    pairs = [];
    fadeOutCards = [];
    wordsStats = {};
    correctPercent.textContent = `${Math.round(calculateProgress(fadeOutCards.length, newWords, examProgress))}%`;
    studyCards.classList.remove("hidden");
    studyMode.classList.remove("hidden");
    examMode.classList.add("hidden");
    btnTraining.classList.add("hidden");
})