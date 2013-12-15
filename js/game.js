/**
 * Created by Garrick on 12/13/13.
 */
//Volume Controls
window.onload = function (e) {
    document.getElementById("sfx").onmouseup = function (e) {
        game.sfxVolume = document.getElementById("sfx").value;
    };
    document.getElementById("music").onmouseup = function (e) {
        assets.data["http://gbuck.org/ludumdare/assets/music.mp3"].volume = document.getElementById("music").value;
        game.musicVolume = document.getElementById("music").value;
    };
};

//-1 = loading, 0 = main menu, 1 = game, 2 = how to play, 3 = dead, 4 = level transition
var activeScreen = -1;
var input = {
    spaceDown: false,
    mouseX: 0,
    mouseY: 0,
    mouseDown: false,
    mouseDownX: 0,
    mouseDownY: 0,
    prevMouseDown: false
};
var assets = {
    //Street data, Sidewalk data
    //Height, width, amount to push right side to the left)
    obstacleData: [
        [
            [52, 64, 0],
            [58, 56, 26]
        ],
        [
            [42, 42, 12],
            [58, 40, 15],
            [30, 59, 5]
        ]
    ],
    status: "...",
    data: [],
    src: ["assets/img/logo.png", "assets/img/mainmenu.png", "assets/img/boxer-standing.png", "assets/img/boxer-running0.png",
        "assets/img/boxer-running1.png", "assets/img/boxer-running2.png", "assets/img/boxer-running3.png", "assets/img/boxer-jumping.png",
        "assets/img/shadow.png", "assets/img/concrete.png", "assets/img/street.png", "assets/img/fence.png", "assets/img/bush.png",
        "assets/img/house1.png", "assets/img/house0.png", "assets/img/house2.png", "assets/img/house3.png", "assets/img/house4.png",
        "assets/img/house5.png", "assets/img/house6.png", "assets/img/sidewalk0.png", "assets/img/sidewalk1.png",
        "assets/img/street0.png", "assets/img/street1.png", "assets/img/street2.png", "assets/img/clouds.png", "assets/music.mp3",
        "assets/jump.wav", "assets/yelp.mp3"],
    assetsTotal: -1,
    assetsLoaded: 0
};
var mainMenu = {
    titleY: -150,
    titleDestY: 15
};
var game = {
    sfxVolume: 0.3,
    musicVolume: 0.3,
    deathMessage: "",
    dead: false,
    debug: false,
    levelData: [],
    cloudX: 0,
    houseX: 0,
    bushX: 0,
    houses: [0, 1, 0, 5],
    level: 1,
    levelX: 0,
    timer: 30.0,
    playerDestY: 0,
    playerIsMoving: false,
    playerIsJumping: false,
    playerCurrentLane: 0,
    playerLastLane: 0,
    playerJumpStartY: 0,
    playerTimeJumping: 0,
    playerIsRunning: false,
    playerRunningFrame: 0,
    playerX: 50,
    playerY: 365
};

//Prevent space bar from scrolling down
document.documentElement.addEventListener('keydown', function (e) {
    console.log(e.keyCode + " " + e);
    if (e.keyCode == 83 || e.keyCode == 87 || e.keyCode == 38 || e.keyCode == 40 || e.keyCode == 32)
        e.preventDefault();
}, false);

function loadLevel() {
    var bestLevel;
    var bestCount = 0;
    var numTries = 0;
    var goal = game.level * 35 + 25;
    while (bestCount < goal && numTries <= 200) {
        var levelData = new Array(4);
        for (var i = 0; i < 4; i++)
            levelData[i] = new Array(game.level * 100);
        var array = placeObstacles(levelData, goal);
        var count = 0;
        for (var a = 0; a < array.length; a++)
            for (var b = 0; b < array[0].length; b++)
                if (array[a][b] != undefined)
                    count++;
        if (count > bestCount) {
            bestLevel = levelData;
            bestCount = count;
        }
        numTries++;
    }
    return bestLevel;
}

function placeObstacles(levelData, obstaclesToPlace) {
    if (obstaclesToPlace <= 0)
        return levelData;
    var spacingInRows = 2;
    var maxPerCol = 3;
    var colsTillStart = 10;
    var validSpots = [];
    for (var row = 0; row < 4; row++) {
        for (var col = colsTillStart; col < levelData[0].length; col++) {
            var run = true;
            var colCount = 0;
            for (var cc = 0; cc < 4; cc++) { //Check column for max rows
                if (levelData[row][cc] != undefined)
                    colCount++;
            }
            if (colCount >= maxPerCol)
                continue;
            if (levelData[row][col] == undefined) {
                for (var i = -spacingInRows; i <= spacingInRows && run; i++) {
                    if (i >= 0 || i < game.level * 20) {
                        if (levelData[row][col + i] != undefined)
                            run = false;
                        else if (i >= -2 && i <= 2) { //Check rows above/below
                            var run2 = true, run3 = true;
                            if (row + 1 < 4)
                                if (levelData[row + 1][col + i] != undefined)
                                    run2 = false;
                            if (row - 1 > 0)
                                if (levelData[row][col + i] != undefined)
                                    run3 = false;
                            if (!run2 && !run3)
                                run = false;
                        }
                    }
                }

                if (run)
                    validSpots.push([row, col]);
            }
        }
    }
    if (validSpots != 0) {
        var randomSpot = validSpots[Math.floor(Math.random() * validSpots.length)];
        if (randomSpot[0] == 0 || randomSpot[0] == 3) {
            levelData[randomSpot[0]][randomSpot[1]] = Math.floor(Math.random() * 2);
        } else {
            levelData[randomSpot[0]][randomSpot[1]] = Math.floor(Math.random() * 3);
        }
    }
    return placeObstacles(levelData, obstaclesToPlace - 1);
}

function intersectRect(r1, r2) {
    return !(r2.left > r1.right ||
        r2.right < r1.left ||
        r2.top > r1.bottom ||
        r2.bottom < r1.top);
}

function die() {
    assets.data["http://gbuck.org/ludumdare/assets/yelp.mp3"].volume = game.sfxVolume;
    assets.data["http://gbuck.org/ludumdare/assets/yelp.mp3"].play();
    activeScreen = 3;
    game.playerIsJumping = false;
    game.playerIsMoving = false;
    game.playerIsRunning = false;
}

function reset() {
    game.dead = false;
    game.levelX = 0;
    game.level = 1;
    game.data = loadLevel();
    game.timer = 3.0;
    game.playerDestY = 0;
    game.playerIsMoving = false;
    game.playerIsJumping = false;
    game.playerCurrentLane = 0;
    game.playerLastLane = 0;
    game.playerJumpStartY = 0;
    game.playerTimeJumping = 0;
    game.playerIsRunning = false;
    game.playerRunningFrame = 0;
    game.playerX = 50;
    game.playerY = 365;
    activeScreen = 1;
}

cq(640, 480).framework({
    onmousemove: function (x, y) {
        input.mouseX = x;
        input.mouseY = y;
    },

    onmousedown: function (x, y, button) {
        if (button == 0) { //Left Click
            input.mouseDown = true;
        }
    },

    onmouseup: function (x, y, button) {
        if (button == 0) { //Left Click
            input.mouseDownX = x;
            input.mouseDownY = y;
            input.mouseDown = false;
        }
    },

    onstep: function (delta) {
        //Handle Input Events
        //Click Events
        if (input.mouseDown != input.prevMouseDown && input.mouseDown == false) {
            console.log("click event at " + input.mouseDownX + ", " + input.mouseDownY);
            switch (activeScreen) {
                case 0: //Main Menu
                    if (mainMenu.titleY >= mainMenu.titleDestY) {
                        if (input.mouseDownX < this.canvas.width / 2 + 100 && input.mouseDownX > this.canvas.width / 2 - 100) {
                            if (input.mouseDownY > 200 && input.mouseDownY < 260) {
                                //Load first level.
                                game.data = loadLevel();
                                console.log("start button");
                                game.levelX = 0;
                                activeScreen = 1;
                            } else if (input.mouseDownY > 295 && input.mouseDownY < 350) {
                                console.log("how to button");
                                activeScreen = 2;
                            }
                        }
                    } else {
                        mainMenu.titleY = mainMenu.titleDestY;
                    }
                    break;
                case 1: //Game

                    break;
                case 2: //How To Play
                    if (input.mouseDownX < 605 && input.mouseDownX > 505) {
                        if (input.mouseDownY > 400 && input.mouseDownY < 440) {
                            activeScreen = 0;
                            console.log("back");
                        }
                    }
                    break;
            }
        }
        input.prevMouseDown = input.mouseDown;

        //Handle Logic
        if (activeScreen == 0 || activeScreen == 2) {
            game.cloudX += ((delta / 500) + game.level / 100) / 50;
            game.bushX += ((delta / 500) + game.level / 100) / 1.025;
            game.houseX += ((delta / 500) + game.level / 100) / 1.1;
            game.levelX += (delta / 500) + game.level / 100;
        }
        switch (activeScreen) {
            case -1:
                if (assets.assetsTotal == -1)
                    assets.assetsTotal = assets.src.length;
                if (assets.assetsTotal == assets.assetsLoaded) {
                    activeScreen = 0;
                } else if (assets.src[assets.assetsLoaded] != undefined && assets.data[assets.src[assets.assetsLoaded]] == undefined) { //While the next asset is not loaded
                    var fileType = assets.src[assets.assetsLoaded].split(".")[1];
                    switch (fileType) {
                        case "png":
                            var img = new Image();
                            assets.status = "Loading " + assets.src[assets.assetsLoaded] + "...";
                            img.src = assets.src[assets.assetsLoaded];
                            img.onload = function () {
                                if (assets.data[this.src] == undefined) {
                                    assets.data[this.src] = img;
                                    console.log("'" + this.src + "' loaded");
                                    assets.assetsLoaded++;
                                }
                            };
                            break;
                        case "mp3":
                        case "wav":
                            var snd = new Audio(assets.src[assets.assetsLoaded]);
                            assets.status = "Loading " + snd.src + "...";
                            assets.data[snd.src] = snd;
                            console.log("'" + snd.src + "' loaded");
                            assets.assetsLoaded++;
                            snd.volume = game.sfxVolume;
                            if (snd.src == "http://gbuck.org/ludumdare/assets/music.mp3") {
                                snd.autoplay = true;
                                snd.loop = true;
                                snd.volume = game.musicVolume;
                            }
                            break;
                    }
                    if (assets.data[assets.src[assets.assetsLoaded]] == undefined) {
                        console.log("loading '" + assets.src[assets.assetsLoaded] + "'...");
                        return;
                    }
                }
                break;
            case 0:
                if (mainMenu.titleY < mainMenu.titleDestY) {
                    mainMenu.titleY += 0.075 * delta;
                }
                break;
            case 1:
                //Update Player Sprite
                if (game.timer >= 0) {
                    game.timer -= delta / 1000;
                } else {
                    if (!game.playerIsRunning)
                        game.playerIsRunning = true;
                }
                if (game.playerIsJumping) {
                    game.playerTimeJumping += delta / 1000;
                    if (game.playerY <= game.playerJumpStartY) {
                        if (!input.spaceDown && game.playerTimeJumping < 0.4)
                            game.playerTimeJumping = 0.45;
                        game.playerY += Math.cos(game.playerTimeJumping * 2.75) * -3.5;
                    } else {
                        game.playerRunningFrame = 3;
                        game.playerIsJumping = false;
                        game.playerTimeJumping = 0;
                        game.playerY = game.playerJumpStartY;
                    }
                } else if (game.playerIsMoving) {
                    if (Math.abs(game.playerY - game.playerDestY) > 2.5) {
                        if ((game.playerLastLane == 1 || game.playerLastLane == 2) && (game.playerCurrentLane == 1 || game.playerCurrentLane == 2)) {
                            if (game.playerDestY - game.playerY > 0)
                                game.playerY += delta / 6;
                            else
                                game.playerY -= delta / 6;
                        } else {
                            if (game.playerDestY - game.playerY > 0)
                                game.playerY += delta / 12;
                            else
                                game.playerY -= delta / 12;
                        }
                    } else {
                        console.log("finished moving");
                        game.playerIsMoving = false;
                        game.playerY = game.playerDestY;
                    }

                }
                if (game.playerIsRunning) {
                    if (game.levelX < game.data[0].length + 10) {
                        game.cloudX += ((delta / 500) + game.level / 100) / 50;
                        game.bushX += ((delta / 500) + game.level / 100) / 1.025;
                        game.houseX += ((delta / 500) + game.level / 100) / 1.1;
                        game.levelX += (delta / 500) + game.level / 100;
                        if ((game.playerRunningFrame += (delta / 125) + game.level / 100) >= 4) {
                            game.playerRunningFrame = 0;
                        }
                    } else {
                        console.log("We're done with level " + game.level);
                    }
                }
                break;
            case 3:
                if (!game.dead) {
                    if (game.playerY < 700) {
                        if (game.playerTimeJumping < 1.90) {
                            game.playerTimeJumping += delta / 1000;
                        } else {
                            game.playerTimeJumping = 2;
                        }
                        game.playerY += Math.cos(game.playerTimeJumping * 2) * -4;
                    } else {
                        var messages = ["Ruff Luck,", "Just arf-ful,", "You got boned,", "You're barking up the wrong tree,", "Pawlease,", "Bitch pawlease,", "#rekt,", "Rover the line,"];
                        game.deathMessage = messages[Math.round(Math.random() * messages.length)];
                        game.dead = true;
                    }
                } else {
                    //TODO: Update game
                }
                break;
        }
    },

    onrender: function () {
        var ctx = this.canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        ctx.webkitImageSmoothingEnabled = false;
        ctx.mozImageSmoothingEnabled = false;
        if (activeScreen == -1) {
            this.clear('black');
            this.fillStyle('white').font("25pt 'Droid Sans' serif").textBaseline("top")
                .fillText("Loading Assets", (this.canvas.width / 2) - (this.measureText("Loading Assets").width / 2),
                    180).font("8pt 'Droid Sans' serif").fillText(assets.status, (this.canvas.width / 2) - (this.measureText(assets.status).width / 2),
                    215);
        } else {
            //Draw Background
            this.clear('white').fillStyle('#00AA00').fillRect(0, 420, this.canvas.width, this.canvas.height - 420)
                .fillStyle('#454545').fillRect(0, 285, this.canvas.width, 145)
                .fillStyle('#55FFFF').fillRect(0, 0, this.canvas.width, 270);
            for (var c = 0; c < 2; c++)
                this.drawImage(assets.data["http://gbuck.org/ludumdare/assets/img/clouds.png"], (game.cloudX % 1 * -640) + c * 640, 0, 640, 256);
            this.font("10pt 'Droid Sans' serif").fillStyle('black').fillText("X: " + game.levelX, 0, 0);
            //Randomize New Houses
            if (game.houseX > 1 && game.houseX % 4 <= 1) {
                for (var h = 0; h < 3; h++)
                    game.houses[h] = game.houses[h + 1];
                if (Math.random() >= .40)
                    game.houses[3] = Math.round(Math.random() * 6);
                else
                    game.houses[3] = 0;
                game.houseX = game.houseX % 4;
            }
            for (var h = 0; h <= 3; h++)
                this.drawImage(assets.data["http://gbuck.org/ludumdare/assets/img/house" + game.houses[h] + ".png"], (game.houseX % 4 * -64) + h * 256, 15, 256, 256);

            this.fillStyle('00AA00').fillRect(0, 250, this.canvas.width, 35);
            for (var b = 0; b <= 10; b++)
                this.drawImage(assets.data["http://gbuck.org/ludumdare/assets/img/bush.png"], (game.bushX % 1 * -64) + b * 64, 195, 64, 64);

            for (var i = 0; i <= 10; i++)
                this.drawImage(assets.data["http://gbuck.org/ludumdare/assets/img/concrete.png"], (game.levelX % 1 * -64) + i * 64, 375, 64, 64).
                    drawImage(assets.data["http://gbuck.org/ludumdare/assets/img/concrete.png"], (game.levelX % 1 * -64) + i * 64, 247, 64, 64).
                    drawImage(assets.data["http://gbuck.org/ludumdare/assets/img/fence.png"], (game.levelX % 1 * -64) + i * 64, 212, 64, 64).
                    drawImage(assets.data["http://gbuck.org/ludumdare/assets/img/street.png"], (game.levelX % 1 * -64) + i * 64, 311, 64, 64);
            if (activeScreen == 1 || activeScreen == 3) {
                //Draw Obstacles
                for (var row = 3; row >= 0; row--) {
                    var drawY;
                    if (row == 0)
                        drawY = 375;
                    else if (row == 1)
                        drawY = 343;
                    else if (row == 2)
                        drawY = 279;
                    else
                        drawY = 247;
                    for (var col = 0; col < game.data[0].length && game.data[row] != undefined; col++) {
                        if (game.data[row][col] != undefined) {
                            if (row == 0 || row == 3) {
                                this.drawImage(assets.data["http://gbuck.org/ludumdare/assets/img/sidewalk" + game.data[row][col] + ".png"], (game.levelX * -64) + (col * 64), drawY, 64, 64);
                            } else {
                                this.drawImage(assets.data["http://gbuck.org/ludumdare/assets/img/street" + game.data[row][col] + ".png"], (game.levelX * -64) + (col * 64), drawY, 64, 64);
                            }
                        }
                    }
                    //Draw dog in appropriate row
                    if (row == game.playerCurrentLane) {
                        if (!game.playerIsRunning) {
                            if (activeScreen == 3)
                                this.drawImage(assets.data["http://gbuck.org/ludumdare/assets/img/boxer-jumping.png"], game.playerX, game.playerY, 64, 64);
                            else
                                this.drawImage(assets.data["http://gbuck.org/ludumdare/assets/img/boxer-standing.png"], game.playerX, game.playerY, 64, 64);
                        } else if (!game.playerIsJumping) {
                            this.drawImage(assets.data["http://gbuck.org/ludumdare/assets/img/boxer-running" + Math.floor(game.playerRunningFrame) + ".png"], game.playerX, game.playerY, 64, 64);
                        } else {
                            this.drawImage(assets.data["http://gbuck.org/ludumdare/assets/img/boxer-jumping.png"], game.playerX, game.playerY, 64, 64);
                            this.drawImage(assets.data["http://gbuck.org/ludumdare/assets/img/shadow.png"], game.playerX, game.playerJumpStartY, 64, 64);
                        }
                    }
                    if (game.playerIsRunning) {
                        var player = {
                            left: game.playerX + 10,
                            right: game.playerX + 64 - 10,
                            top: game.playerY + 20 - ((game.playerIsJumping) ? 10 : 0),
                            bottom: game.playerY + 64 - 20 - ((game.playerIsJumping) ? 10 : 0)
                        }
                        if (game.debug)
                            this.fillStyle('green').fillRect(player.left, player.top, player.right - player.left, player.bottom - player.top);
                        if (game.playerIsMoving) {
                            //Check prev lane
                            var drawY;
                            if (game.playerLastLane == 0)
                                drawY = 375;
                            else if (game.playerLastLane == 1)
                                drawY = 343;
                            else if (game.playerLastLane == 2)
                                drawY = 279;
                            else
                                drawY = 247;
                            for (var col = Math.floor(game.levelX) - 2; col < Math.floor(game.levelX) + 5; col++) {
                                if (game.data[game.playerLastLane][col] != undefined) {
                                    var width = assets.obstacleData[((game.playerLastLane == 0 || game.playerLastLane == 3) ? 0 : 1)][game.data[game.playerLastLane][col]][1];
                                    var rightMod = assets.obstacleData[((game.playerLastLane == 0 || game.playerLastLane == 3) ? 0 : 1)][game.data[game.playerLastLane][col]][2];
                                    var obstacle = {
                                        left: (game.levelX * -64) + (col * 64) + 64 - width,
                                        right: (game.levelX * -64) + (col * 64) + 64 - rightMod,
                                        top: drawY + 64 - 32,
                                        bottom: drawY + 64 - 16
                                    }
                                    if (intersectRect(player, obstacle))
                                        die();
                                    if (game.debug)
                                        this.fillStyle('rgba(255, 0 , 0, 0.5').fillRect(obstacle.left, obstacle.top, obstacle.right - obstacle.left, obstacle.bottom - obstacle.top);
                                }
                            }
                        }
                        //Check Current Lane
                        var drawY;
                        if (game.playerCurrentLane == 0)
                            drawY = 375;
                        else if (game.playerCurrentLane == 1)
                            drawY = 343;
                        else if (game.playerCurrentLane == 2)
                            drawY = 279;
                        else
                            drawY = 247;
                        for (var col = Math.floor(game.levelX) - 2; col < Math.floor(game.levelX) + 5; col++) {
                            if (game.data[game.playerCurrentLane][col] != undefined) {
                                var height = ((game.playerIsMoving) ? 16 : assets.obstacleData[((game.playerCurrentLane == 0 || game.playerCurrentLane == 3) ? 0 : 1)][game.data[game.playerCurrentLane][col]][0]);
                                var width = assets.obstacleData[((game.playerCurrentLane == 0 || game.playerCurrentLane == 3) ? 0 : 1)][game.data[game.playerCurrentLane][col]][1];
                                var rightMod = assets.obstacleData[((game.playerCurrentLane == 0 || game.playerCurrentLane == 3) ? 0 : 1)][game.data[game.playerCurrentLane][col]][2];
                                var obstacle = {
                                    left: (game.levelX * -64) + (col * 64) + 64 - width,
                                    right: (game.levelX * -64) + (col * 64) + 64 - rightMod,
                                    top: drawY + 64 - height,
                                    bottom: drawY + 64
                                }
                                if (intersectRect(player, obstacle))
                                    die();
                                if (game.debug)
                                    this.fillStyle('rgba(255, 0 , 0, 0.5').fillRect(obstacle.left, obstacle.top, obstacle.right - obstacle.left, obstacle.bottom - obstacle.top);
                            }
                        }
                    }
                }
            }

            //Draw game here

            if (activeScreen == 1) {
                if (game.timer >= 0) {
                    if (game.timer > 3) {
                        this.fillStyle('rgba(0,0,0, 0.85').fillRect(0, 0, this.canvas.width, this.canvas.height).font("20pt 'Droid Sans' serif").fillStyle('white')
                            .wrappedText("Your are a dog living happily with your owner. One day after a nice walk your owner decides that you deserve a treat, so he reaches into the treat box, but there's only one left! You are now on a quest to retrieve more dog treats, since one is clearly not sufficient. Run to the pet store and fetch more treats!", 100, 100, 480)
                            .font("12pt 'Droid Sans' serif").fillStyle('red').fillText("Press space to skip.", this.canvas.width / 2 - this.measureText("Press space to skip.").width / 2, 365);
                    }
                    this.fillStyle('white').lineWidth(5).strokeStyle('black').beginPath().roundRect((this.canvas.width / 2) - 50,
                            25, 100, 50, 20).closePath().stroke().fill().fillStyle('black').font("24pt 'Droid Sans' serif").
                        fillText(Math.floor(game.timer + 1) + "", (this.canvas.width / 2 - (this.measureText(Math.floor(game.timer + 1)).width / 2)), 32);

                }
            } else if (activeScreen != 3) {
                this.fillStyle('rgba(0,0,0, 0.85').fillRect(0, 0, this.canvas.width, this.canvas.height);
            } else {
                //Dead Screen
                //TODO: stuff
                if (game.dead) {
                    this.fillStyle('rgba(0,0,0, 0.85').fillRect(0, 0, this.canvas.width, this.canvas.height).
                        font("35pt 'Droid Sans' serif").fillStyle('white').wrappedText(game.deathMessage + "", 50, 25, 500).font("25pt 'Droid Sans' serif").fillText("You made it " + Math.floor(game.levelX * 2) +
                            " yards.", this.canvas.width / 2 - this.measureText("You made it " + Math.floor(game.levelX * 2) + " yard(s).").width / 2, 200).font("12pt 'Droid Sans' serif")
                        .fillText("Press SPACE to retry!", this.canvas.width / 2 - this.measureText("Pres SPACE to retry!").width / 2, 350);
                }
            }
            if (activeScreen == 0) {
                //Draw Title
                //this.drawImage(assets.data["http://gbuck.org/ludumdare/assets/img/mainmenu.png"], 0, 0, 640, 480);
                this.fillStyle('white').font("40pt 'Droid Sans' serif").textBaseline("top")
                    .drawImage(assets.data["http://gbuck.org/ludumdare/assets/img/logo.png"], (this.canvas.width / 2) - 245, mainMenu.titleY);
                if (mainMenu.titleY >= mainMenu.titleDestY) {
                    //Draw Buttons
                    //Start Button
                    this.fillStyle('gray').lineWidth(5).strokeStyle('white').beginPath().roundRect((this.canvas.width / 2 - 100),
                            210, 200, 50, 20).closePath().stroke().fill().fillStyle('white').font("24pt 'Droid Sans' serif").
                        fillText("START GAME", (this.canvas.width / 2 - (this.measureText("START GAME").width / 2)), 215);
                    //About Button
                    this.fillStyle('gray').lineWidth(5).strokeStyle('white').beginPath().roundRect((this.canvas.width / 2 - 100),
                            300, 200, 50, 20).closePath().stroke().fill().fillStyle('white').font("22pt 'Droid Sans' serif").
                        fillText("HOW TO PLAY", (this.canvas.width / 2 - (this.measureText("HOW TO PLAY").width / 2)), 308);
                }
            } else if (activeScreen == 2) {
                //this.drawImage(assets.data["http://gbuck.org/ludumdare/assets/img/mainmenu.png"], 0, 0, 640, 480);
                this.fillStyle('white').font("35pt 'Droid Sans' serif").textBaseline("top")
                    .fillText("HOW TO PLAY", (this.canvas.width / 2) - (this.measureText("HOW TO PLAY").width / 2), 35);
                //Back Button
                this.fillStyle('red').lineWidth(5).strokeStyle('white').beginPath().roundRect(500,
                        400, 100, 40, 20).closePath().stroke().fill().fillStyle('white').font("22pt 'Droid Sans' serif").
                    fillText("Back", 520, 402);
            }
        }
    },

    onkeydown: function (key) {
        if (activeScreen == 3 && game.dead && key == "space") {
            reset();
            return;
        }
        if (game.playerIsRunning && !game.playerIsJumping && !game.playerIsMoving) {
            if ((key == "space") && activeScreen == 1) {
                game.playerIsJumping = true;
                game.playerJumpStartY = game.playerY;
                console.log("jump");
                input.spaceDown = true;
                assets.data["http://gbuck.org/ludumdare/assets/jump.wav"].volume = game.sfxVolume;
                assets.data["http://gbuck.org/ludumdare/assets/jump.wav"].play();
            } else if ((key == "up" || key == "w") && game.playerCurrentLane < 3) {
                console.log("up");
                game.playerLastLane = game.playerCurrentLane++;
                if (game.playerCurrentLane == 0)
                    game.playerDestY = 365;
                else if (game.playerCurrentLane == 1)
                    game.playerDestY = 333;
                else if (game.playerCurrentLane == 2)
                    game.playerDestY = 269;
                else
                    game.playerDestY = 237;
                game.playerIsMoving = true;
            } else if ((key == "down" || key == "s") && game.playerCurrentLane > 0) {
                console.log("down");
                game.playerLastLane = game.playerCurrentLane--;
                if (game.playerCurrentLane == 0)
                    game.playerDestY = 365;
                else if (game.playerCurrentLane == 1)
                    game.playerDestY = 333;
                else if (game.playerCurrentLane == 2)
                    game.playerDestY = 269;
                else
                    game.playerDestY = 237;
                game.playerIsMoving = true;
            }
        } else if (key == "space" && activeScreen == 1) {
            if (game.timer > 3)
                game.timer = 3;
        }
    },

    onkeyup: function (key) {
        if (key == "space" && activeScreen == 1 && input.spaceDown) {
            input.spaceDown = false;
        }
    }

}).appendTo("body");