let playerName;
let startTime;
let elapsedTime = 0;
let heart = 5;

let player = document.getElementById('player');
let playerX = 0;
let playerY = 0;
let playerSpeed = 2;

let worldTimeInterval;
let gameTimeInterval;
let isPaused = false;

let monsters = [];
let traps = [];
const MAX_MONSTERS = 30;
const MAX_TRAPS = 30;
let collidedMonstersCount = 0;
let collidedTrapsCount = 0;

let gameOver = false;

let pauseScreen = document.getElementById('pause_screen');
let resultScreen = document.getElementById('result_screen');
let playAgainButton = document.getElementById('play_again_button');

let selectedMap = 1;


// Select Map
function selectMap(mapNumber) {
    selectedMap = mapNumber;

    if (mapNumber === 1) {
        document.body.style.background = 'url(\'assets/map1.jpg\')'
    } else if (mapNumber === 2) {
        document.body.style.background = 'url(\'assets/map2.png\')'
    } else if (mapNumber === 3) {
        document.body.style.background = 'url(\'assets/map3.png\')'
    }
}



// Start Game
function startGame() {
    playerName = document.getElementById('player_name').value;
    if (playerName === '') {
        alert('Пожалуйста, введите ваше имя перед началом игры');
        return;
    }
    if (playerName.length > 10) {
        alert('Пожалуйста, введите ваше имя меньше 10 символов');
        return;
    }

    heart = 5;

    document.getElementById('heart_counter').innerText = `💖 ${heart}`;
    document.getElementById('player_name_display').innerText = `👨🏻‍💼 ${playerName}`;
    document.querySelector('#login_screen').style.display = 'none';
    document.querySelector('#game_screen').style.display = 'block';

    let finish = document.getElementById('finish');
    finish.style.bottom = '10px';
    finish.style.right = '10px';

    startTime = new Date().getTime();
    worldTimeInterval = setInterval(updateWorldTime, 1000);
    gameTimeInterval = setInterval(updateGameTime, 1000);


    document.addEventListener('keydown', handleKeyPress);
    document.addEventListener('keydown', handlePause);

    setInterval(createMonstersAndTraps, 3000);

    gameOver = false;
}


// Timer function

function worldTime(date) {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
}

function updateWorldTime() {
    const currentTime = new Date();
    document.getElementById('world_time').innerText = `🕓 ${worldTime(currentTime)}`;
}

function gameTime(time) {
    if (!isPaused) {
        const date = new Date(time);
        const minutes = date.getUTCMinutes().toString().padStart(2, '0');
        const seconds = date.getUTCSeconds().toString().padStart(2, '0');
        return `${minutes}:${seconds}`;
    }
}

function updateGameTime() {
    if (!isPaused) {
        const currentTime = new Date();
        elapsedTime = Math.floor((currentTime - startTime) / 1000);
        document.getElementById('game_time').innerText = `⌚️ ${gameTime(elapsedTime * 1000)}`;
    }
}


// Player Move
let keyState = {};

document.addEventListener('keydown', (event) => {
    keyState[event.code] = true;
    handleKeyPress();
});

document.addEventListener('keyup', (event) => {
    keyState[event.code] = false;
    handleKeyPress();
});

function handleKeyPress() {
    if (!isPaused && !gameOver) {
        let deltaX = 0;
        let deltaY = 0;

        if (keyState['ArrowUp'] || keyState['cKeyW'] || keyState['ц'] || keyState['Ц']) {
            deltaY -= playerSpeed;
        }
        if (keyState['ArrowDown'] || keyState['KeyS'] || keyState['ы'] || keyState['Ы']) {
            deltaY += playerSpeed;
        }
        if (keyState['ArrowLeft'] || keyState['KeyA'] || keyState['ф'] || keyState['Ф']) {
            deltaX -= playerSpeed;
        }
        if (keyState['ArrowRight'] || keyState['KeyD'] || keyState['в'] || keyState['В']) {
            deltaX += playerSpeed;
        }

        movePlayer(deltaX, deltaY);
    }
}

function movePlayer(deltaX, deltaY) {
    if (!gameOver) {
        playerX += deltaX;
        playerY += deltaY;

        playerX = Math.min(Math.max(playerX, 0), document.getElementById('game_screen').offsetWidth - player.offsetWidth);
        playerY = Math.min(Math.max(playerY, 0), document.getElementById('game_screen').offsetHeight - player.offsetHeight);

        player.style.left = playerX + 'px';
        player.style.top = playerY + 'px';

        if (checkCollision(player, document.getElementById('finish'))) {
            handleCollisionWithFinish();
        }
    }
}


// Finish
function handleCollisionWithFinish() {
    endGame();
}


// ESC
function handlePause(event) {
    if (event.key === 'Escape') {
        isPaused = !isPaused;
        if (isPaused) {
            clearInterval(gameTimeInterval);
            pauseScreen.style.display = 'block';
        } else {
            updateGameTime();
            pauseScreen.style.display = 'none';
        }
    }
}


// Monsters and Traps
function createMonstersAndTraps() {
    if (!isPaused && !gameOver) {
        if (monsters.length < MAX_MONSTERS) {
            createMonsters(10);
        }
        if (traps.length < MAX_TRAPS) {
            createTraps(2);
        }
    }
}

function createMonsters(count) {
    for (let i = 0; i < count; i++) {
        if (monsters.length >= MAX_MONSTERS) {
            break;
        }

        let monster = document.createElement('div');
        monster.className = 'monster';
        monster.style.left = Math.floor(Math.random() * document.getElementById('game_screen').offsetWidth) + 'px';
        monster.style.top = Math.floor(Math.random() * document.getElementById('game_screen').offsetHeight) + 'px';
        document.getElementById('game_screen').appendChild(monster);
        monsters.push(monster);

        setInterval(() => moveMonster(monster), 500);
    }
}

function createTraps(count) {
    for (let i = 0; i < count; i++) {
        if (traps.length >= MAX_TRAPS) {
            break; //
        }

        let trap = document.createElement('div');
        trap.className = 'trap';
        trap.style.left = Math.floor(Math.random() * document.getElementById('game_screen').offsetWidth) + 'px';
        trap.style.top = Math.floor(Math.random() * document.getElementById('game_screen').offsetHeight) + 'px';
        document.getElementById('game_screen').appendChild(trap);
        traps.push(trap);
    }
}

function moveMonster(monster) {
    if (!isPaused && !gameOver) {
        let directionX = Math.random() > 0.5 ? 1 : -1;
        let directionY = Math.random() > 0.5 ? 1 : -1;

        monster.style.left = parseInt(monster.style.left) + directionX * 10 + 'px';
        monster.style.top = parseInt(monster.style.top) + directionY * 10 + 'px';

        monster.style.transform = `rotate(${Math.atan2(directionY, directionX) * (180 / Math.PI) + 45}deg)`;

        if (
            parseInt(monster.style.left) < 0 ||
            parseInt(monster.style.top) < 0 ||
            parseInt(monster.style.left) > document.getElementById('game_screen').offsetWidth ||
            parseInt(monster.style.top) > document.getElementById('game_screen').offsetHeight
        ) {
            monster.remove();
            monsters = monsters.filter((m) => m !== monster);
        }

        if (checkCollision(player, monster)) {
            handleCollisionWithMonster();
        }

        traps.forEach((trap) => {
            if (checkCollision(player, trap)) {
                handleCollisionWithTrap(trap);
            }
        });
    }
}



function handleCollisionWithMonster() {
    heart--;
    document.getElementById('heart_counter').innerText = `💖 ${heart}`;

    let collidedMonster = monsters.find((monster) => checkCollision(player, monster));

    if (collidedMonster) {
        collidedMonster.remove();
        monsters = monsters.filter((monster) => monster !== collidedMonster);
        collidedMonstersCount++;
    }

    if (heart === 0) {
        endGame();
    }
}

function handleCollisionWithTrap(trap) {
    heart--;
    document.getElementById('heart_counter').innerText = `💖 ${heart}`;

    trap.remove();
    traps = traps.filter((t) => t !== trap);
    collidedTrapsCount++;

    if (heart === 0) {
        endGame();
    }
}

function checkCollision(element1, element2) {
    let rect1 = element1.getBoundingClientRect();
    let rect2 = element2.getBoundingClientRect();

    return (
        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y
    );
}


// GameOver
function endGame() {
    resultScreen.style.display = 'block';
    clearInterval(gameTimeInterval);

    document.getElementById('result_time').innerText = `Time: ${gameTime(elapsedTime * 1000)}`;
    document.getElementById('result_monsters').innerText = `Monsters: ${collidedMonstersCount}`;
    document.getElementById('result_traps').innerText = `Traps: ${collidedTrapsCount}`;
    document.getElementById('result_hearts').innerText = `Lives left: ${heart}`;

    removeAllMonstersAndTraps();

    playAgainButton.addEventListener('click', restartGame);

    gameOver = true;
}

function removeAllMonstersAndTraps() {
    monsters.forEach((monster) => monster.remove());
    monsters = [];
    traps.forEach((trap) => trap.remove());
    traps = [];
}

function restartGame() {
    resultScreen.style.display = 'none';

    playerName = '';
    startTime = 0;
    elapsedTime = 0;
    heart = 5;
    playerX = 0;
    playerY = 0;
    isPaused = false;

    removeAllMonstersAndTraps();
    document.getElementById('heart_counter').innerText = `💖 ${heart}`;
    startGame();
}
