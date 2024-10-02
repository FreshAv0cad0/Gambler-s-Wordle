// Game variables
let correctWords = [];
let spinsLeft = 5;
let dailyGamesPlayed = 0;
let lastPlayedDate = null;
let score = 0;
let selectedWordCount = 1;

// Initialize the game
function initGame() {
    updateSpinsLeft();
    checkDailyLimit();
    document.getElementById('game-board').style.display = 'none';
    document.getElementById('submit-guess').style.display = 'none';
    updateScore();
    createStarryBackground();
    initializeNumberSelector();
}

// Generate random words
function generateRandomWords(count) {
    const words = [
        'apple', 'beach', 'chair', 'dance', 'eagle', 'flame', 'grape', 'house', 'ivory', 'jelly',
        'kite', 'lemon', 'mango', 'night', 'ocean', 'piano', 'quilt', 'river', 'storm', 'tiger',
        'umbrella', 'violin', 'whale', 'xylophone', 'yacht', 'zebra', 'bread', 'cloud', 'dream',
        'earth', 'flute', 'globe', 'heart', 'island', 'juice', 'koala', 'light', 'music', 'novel',
        'olive', 'peach', 'queen', 'radio', 'smile', 'train', 'unity', 'voice', 'water', 'xenon'
    ];
    return words.sort(() => 0.5 - Math.random()).slice(0, count);
}

// Update spins left display
function updateSpinsLeft() {
    document.getElementById('spins-left').textContent = `Spins left today: ${spinsLeft}`;
}

// Update score display
function updateScore() {
    document.getElementById('score').textContent = `Score: ${score}`;
}

// Check daily limit
function checkDailyLimit() {
    const currentDate = new Date().toDateString();
    if (lastPlayedDate !== currentDate) {
        spinsLeft = 5;
        dailyGamesPlayed = 0;
        lastPlayedDate = currentDate;
    }
    updateSpinsLeft();
}

// Handle guess submission
document.getElementById('submit-guess').addEventListener('click', function() {
    if (dailyGamesPlayed >= 5) {
        alert('You have reached the daily limit. Please come back tomorrow!');
        return;
    }

    const guessedWords = getGuessedWords();
    if (guessedWords.length !== correctWords.length) {
        alert('Please enter all words before submitting.');
        return;
    }

    const feedback = checkGuesses(guessedWords);
    displayFeedback(feedback);
    score += calculateScore(feedback);
    updateScore();
    
    showAnswer();

    if (hasDirectHit(feedback) || score >= 21) {
        endGame(score >= 21);
    } else if (guessedWords.length === correctWords.length) {
        endGame(false);
    }
});

// Get guessed words from input fields
function getGuessedWords() {
    const inputs = document.querySelectorAll('.letter-input');
    const words = [];
    let currentWord = '';
    
    inputs.forEach((input, index) => {
        currentWord += input.value.toLowerCase();
        if ((index + 1) % 5 === 0) {
            words.push(currentWord);
            currentWord = '';
        }
    });

    return words;
}

// Check guesses against correct words
function checkGuesses(guessedWords) {
    return guessedWords.map((guessedWord, index) => {
        const correctWord = correctWords[index];
        return guessedWord.split('').map((letter, i) => {
            if (letter === correctWord[i]) return 'green';
            if (correctWord.includes(letter)) return 'yellow';
            return 'grey';
        });
    });
}

// Display feedback
function displayFeedback(feedback) {
    const feedbackElement = document.getElementById('feedback');
    feedbackElement.innerHTML = '';
    
    feedback.forEach((word, wordIndex) => {
        const wordElement = document.createElement('div');
        word.forEach((letterFeedback, letterIndex) => {
            const letterElement = document.createElement('span');
            letterElement.textContent = document.querySelectorAll('.letter-input')[wordIndex * 5 + letterIndex].value;
            letterElement.style.backgroundColor = letterFeedback;
            letterElement.style.color = letterFeedback === 'yellow' ? 'black' : 'white';
            letterElement.style.padding = '5px';
            letterElement.style.margin = '2px';
            letterElement.style.display = 'inline-block';
            letterElement.style.width = '20px';
            letterElement.style.textAlign = 'center';
            wordElement.appendChild(letterElement);
        });
        feedbackElement.appendChild(wordElement);
    });
}

// Show answer after each attempt
function showAnswer() {
    const answerElement = document.getElementById('answer');
    answerElement.textContent = `The correct word(s): ${correctWords.join(', ')}`;
}

// Calculate score
function calculateScore(feedback) {
    let totalScore = 0;
    feedback.forEach(word => {
        word.forEach(letterFeedback => {
            if (letterFeedback === 'green') totalScore += 2;
            else if (letterFeedback === 'yellow') totalScore += 1;
        });
    });
    return totalScore;
}

// Check for direct hit
function hasDirectHit(feedback) {
    return feedback.some(word => word.every(letterFeedback => letterFeedback === 'green'));
}

// End the game
function endGame(isBigWin) {
    document.getElementById('submit-guess').disabled = true;
    showSocialShare();
    updateLeaderboard(score);
    dailyGamesPlayed++;

    if (isBigWin) {
        triggerBigWin();
    }
}

// Show social share buttons
function showSocialShare() {
    document.getElementById('social-share').style.display = 'block';
}

// Update leaderboard
function updateLeaderboard(score) {
    let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
    leaderboard.push({ score: score, date: new Date().toISOString() });
    leaderboard.sort((a, b) => b.score - a.score);
    localStorage.setItem('leaderboard', JSON.stringify(leaderboard.slice(0, 10)));
}

// Initialize number selector
function initializeNumberSelector() {
    const numberOptions = document.querySelectorAll('.number-option');
    numberOptions.forEach(option => {
        option.addEventListener('click', function() {
            numberOptions.forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
            selectedWordCount = parseInt(this.dataset.value);
        });
    });
}

// Handle roulette wheel spin
document.getElementById('spin-wheel').addEventListener('click', function() {
    if (spinsLeft <= 0) {
        alert('No spins left for today. Please come back tomorrow!');
        return;
    }

    if (!selectedWordCount) {
        alert('Please select the number of words you want to guess.');
        return;
    }

    spinsLeft--;
    updateSpinsLeft();
    
    // Animate wheel
    const wheel = document.getElementById('roulette-wheel');
    const rotation = 360 * 5 + Math.random() * 360; // Spin at least 5 times
    wheel.style.transform = `rotate(${rotation}deg)`;
    
    setTimeout(() => {
        correctWords = generateRandomWords(selectedWordCount);
        createGameBoard(selectedWordCount);
        document.getElementById('game-board').style.display = 'flex';
        document.getElementById('submit-guess').style.display = 'inline-block';
        document.getElementById('submit-guess').disabled = false;
        document.getElementById('feedback').innerHTML = '';
        document.getElementById('answer').innerHTML = '';
        document.getElementById('social-share').style.display = 'none';
        score = 0;
        updateScore();
    }, 3000);
});

// Create game board
function createGameBoard(numWords) {
    const gameBoard = document.getElementById('game-board');
    gameBoard.innerHTML = '';
    
    for (let i = 0; i < numWords; i++) {
        const wordRow = document.createElement('div');
        wordRow.className = 'word-row';
        
        for (let j = 0; j < 5; j++) {
            const input = document.createElement('input');
            input.type = 'text';
            input.maxLength = 1;
            input.className = 'letter-input';
            input.setAttribute('aria-label', `Word ${i + 1}, Letter ${j + 1}`);
            input.setAttribute('data-word', i);
            input.setAttribute('data-letter', j);
            wordRow.appendChild(input);
        }
        
        gameBoard.appendChild(wordRow);
    }

    // Add event listeners for improved input handling
    const inputs = document.querySelectorAll('.letter-input');
    inputs.forEach((input, index) => {
        input.addEventListener('input', function(e) {
            if (this.value.length === this.maxLength) {
                const nextInput = inputs[index + 1];
                if (nextInput) nextInput.focus();
            }
        });

        input.addEventListener('keydown', function(e) {
            const currentWord = parseInt(this.getAttribute('data-word'));
            const currentLetter = parseInt(this.getAttribute('data-letter'));

            if (e.key === 'ArrowRight') {
                const nextInput = inputs[index + 1];
                if (nextInput) nextInput.focus();
            } else if (e.key === 'ArrowLeft') {
                const prevInput = inputs[index - 1];
                if (prevInput) prevInput.focus();
            } else if (e.key === 'Backspace' && this.value === '') {
                const prevInput = inputs[index - 1];
                if (prevInput) {
                    prevInput.focus();
                    prevInput.value = '';
                }
            } else if (e.key === 'ArrowUp') {
                const upInput = document.querySelector(`.letter-input[data-word="${currentWord - 1}"][data-letter="${currentLetter}"]`);
                if (upInput) upInput.focus();
            } else if (e.key === 'ArrowDown') {
                const downInput = document.querySelector(`.letter-input[data-word="${currentWord + 1}"][data-letter="${currentLetter}"]`);
                if (downInput) downInput.focus();
            }
        });
    });
}

// Social media sharing (placeholder functions)
document.querySelectorAll('.share-button').forEach(button => {
    button.addEventListener('click', function() {
        const platform = this.dataset.platform;
        shareResult(platform);
    });
});

function shareResult(platform) {
    alert(`Sharing result on ${platform}. Score: ${score}`);
}

// Create starry background
function createStarryBackground() {
    const canvas = document.getElementById('stars');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    function Star(x, y, radius, color) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.dx = Math.random() * 0.5 - 0.25;
        this.dy = Math.random() * 0.5 - 0.25;
    }

    Star.prototype.draw = function() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
    };

    Star.prototype.update = function() {
        this.x += this.dx;
        this.y += this.dy;

        if (this.x < 0 || this.x > canvas.width) this.dx = -this.dx;
        if (this.y < 0 || this.y > canvas.height) this.dy = -this.dy;

        this.draw();
    };

    const stars = [];
    for (let i = 0; i < 100; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const radius = Math.random() * 2;
        const color = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.8)`;
        stars.push(new Star(x, y, radius, color));
    }

    function animate() {
        requestAnimationFrame(animate);
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        stars.forEach(star => star.update());
    }

    animate();
}

// Trigger big win animation
function triggerBigWin() {
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
    });

    const dollarSymbols = ['$', '💲', '💰', '🤑'];
    const animationDuration = 3000;
    const animationEnd = Date.now() + animationDuration;

    function frame() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) return;

        confetti({
            particleCount: 2,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            shapes: dollarSymbols
        });
        confetti({
            particleCount: 2,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            shapes: dollarSymbols
        });

        requestAnimationFrame(frame);
    }

    frame();
}

// Initialize the game
initGame();

// Prevent form submission on enter key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        document.getElementById('submit-guess').click();
    }
});

// Handle window resize for responsive canvas
window.addEventListener('resize', function() {
    createStarryBackground();
});