/**
 * Created by Garrick on 12/13/13.
 */

//-1 = loading, 0 = main menu, 1 = game, 2 = how to play
var activeScreen = -1;
var input = {
    mouseX: 0,
    mouseY: 0,
    mouseDown: false,
    mouseDownX: 0,
    mouseDownY: 0,
    prevMouseDown: false
};
var assets = {
    status: "...",
    data: [],
    src: ["assets/img/logo.png", "assets/img/mainmenu.png", "assets/img/boxer-standing.png", "assets/img/boxer-running0.png",
        "assets/img/boxer-running1.png", "assets/img/boxer-running2.png", "assets/img/boxer-running3.png", "assets/img/boxer-jumping.png",
        "assets/img/shadow.png", "assets/img/concrete.png", "assets/img/street.png", "assets/img/fence.png", "assets/img/bush.png",
        "assets/img/house1.png", "assets/img/house0.png", "assets/img/house2.png", "assets/img/house3.png", "assets/img/house4.png",
        "assets/img/house5.png", "assets/img/house6.png"],
    assetsTotal: -1,
    assetsLoaded: 0
};
var mainMenu = {
    titleY: -150,
    titleDestY: 15
};
var game = {
    levelData: [],
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
    playerJumpStartY: 0,
    playerTimeJumping: 0,
    playerIsRunning: false,
    playerRunningFrame: 0,
    playerX: 50,
    playerY: 365
};

function loadLevel() {
    var bestLevel;
    var bestCount = 0;
    var numTries = 0;
    var goal = game.level * 30 + 20;
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
    var maxPerCol = 2;
    var colsTillStart = 10;
    var validSpots = [];
    for (var row = 0; row < 4; row++) {
        for (var col = colsTillStart; col < levelData[0].length; col++) {
            var run = true;
            if (levelData[row][col] == undefined) {
                for (var i = -spacingInRows; i <= spacingInRows && run; i++) {
                    if (i >= 0 || i < game.level * 20) {
                        if (levelData[row][col + i] != undefined)
                            run = false;
                        else if (i >= -2 && i <= 2) { //Check rows above/below
                            if (row + 1 < 4)
                                if (levelData[row + 1][col + i] != undefined)
                                    run = false;
                            if (row - 1 > 0)
                                if (levelData[row][col + i] != undefined)
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
        var randomSpot = validSpots[Math.floor(Math.random() * validSpots.length)]
        levelData[randomSpot[0]][randomSpot[1]] = 1;
    }
    return placeObstacles(levelData, obstaclesToPlace - 1);
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
                                console.log("how to button")
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
                        game.playerY += Math.cos(game.playerTimeJumping * 2.75) * -3.5;
                    } else {
                        game.playerRunningFrame = 3;
                        game.playerIsJumping = false;
                        game.playerTimeJumping = 0;
                        game.playerY = game.playerJumpStartY;
                    }
                } else if (game.playerIsMoving) {
                    if (Math.abs(game.playerY - game.playerDestY) > 2.5) {
                        if (game.playerDestY - game.playerY > 0)
                            game.playerY += delta / 35;
                        else
                            game.playerY -= delta / 35;
                    } else {
                        console.log("finished moving");
                        game.playerIsMoving = false;
                        game.playerY = game.playerDestY;
                    }

                }
                if (game.playerIsRunning) {
                    game.bushX += ((delta / 500) + game.level / 100) / 1.025;
                    game.houseX += ((delta / 500) + game.level / 100) / 1.1;
                    game.levelX += (delta / 500) + game.level / 100;
                    if ((game.playerRunningFrame += (delta / 125) + game.level / 100) >= 4) {
                        game.playerRunningFrame = 0;
                    }
                }
                //Game logic here
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
            this.clear('white');
            this.fillStyle('00AA00').fillRect(0, 420, this.canvas.width, this.canvas.height - 420)
                .fillStyle('454545').fillRect(0, 285, this.canvas.width, 145)
                .fillStyle('55FFFF').fillRect(0, 0, this.canvas.width, 270)
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

            this.fillStyle('00AA00').fillRect(0, 250, this.canvas.width, 35)
            for (var b = 0; b <= 10; b++)
                this.drawImage(assets.data["http://gbuck.org/ludumdare/assets/img/bush.png"], (game.bushX % 1 * -64) + b * 64, 195, 64, 64);

            for (var i = 0; i <= 10; i++)
                this.drawImage(assets.data["http://gbuck.org/ludumdare/assets/img/concrete.png"], (game.levelX % 1 * -64) + i * 64, 375, 64, 64).
                    drawImage(assets.data["http://gbuck.org/ludumdare/assets/img/concrete.png"], (game.levelX % 1 * -64) + i * 64, 247, 64, 64).
                    drawImage(assets.data["http://gbuck.org/ludumdare/assets/img/fence.png"], (game.levelX % 1 * -64) + i * 64, 212, 64, 64).
                    drawImage(assets.data["http://gbuck.org/ludumdare/assets/img/street.png"], (game.levelX % 1 * -64) + i * 64, 311, 64, 64);
            if (activeScreen == 1) {
                if (!game.playerIsRunning) {
                    this.drawImage(assets.data["http://gbuck.org/ludumdare/assets/img/boxer-standing.png"], game.playerX, game.playerY, 64, 64);
                } else if (!game.playerIsJumping) {
                    this.drawImage(assets.data["http://gbuck.org/ludumdare/assets/img/boxer-running" + Math.floor(game.playerRunningFrame) + ".png"], game.playerX, game.playerY, 64, 64);
                } else {
                    this.drawImage(assets.data["http://gbuck.org/ludumdare/assets/img/boxer-jumping.png"], game.playerX, game.playerY, 64, 64);
                    this.drawImage(assets.data["http://gbuck.org/ludumdare/assets/img/shadow.png"], game.playerX, game.playerJumpStartY, 64, 64);
                }
            }

            //Draw game here

            if (activeScreen == 1) {
                if (game.timer >= 0) {
                    if (game.timer > 3) {
                        this.fillStyle('rgba(0,0,0, 0.85').fillRect(0, 0, this.canvas.width, this.canvas.height).font("20pt 'Droid Sans' serif").fillStyle('white')
                            .wrappedText("Your are a dog living happily with your owner. One day after a nice walk your owner decides that you deserve a treat, so he reaches into the treat box, but there's only one left! You are now on a quest to retrieve more dog treats, since one is clearly not sufficient.", 100, 100, 480)
                            .font("12pt 'Droid Sans' serif").fillText("Press space to skip.", this.canvas.width / 2 - this.measureText("Press space to skip.").width / 2, 340);
                    }
                    this.fillStyle('white').lineWidth(5).strokeStyle('black').beginPath().roundRect((this.canvas.width / 2) - 50,
                            25, 100, 50, 20).closePath().stroke().fill().fillStyle('black').font("24pt 'Droid Sans' serif").
                        fillText(Math.floor(game.timer + 1) + "", (this.canvas.width / 2 - (this.measureText(Math.floor(game.timer + 1)).width / 2)), 32);

                }
            } else {
                this.fillStyle('rgba(0,0,0, 0.85').fillRect(0, 0, this.canvas.width, this.canvas.height);
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
        if (game.playerIsRunning && !game.playerIsJumping && !game.playerIsMoving) {
            if (key == "space" && activeScreen == 1) {
                game.playerIsJumping = true;
                game.playerJumpStartY = game.playerY;
                console.log("jump");
            } else if ((key == "up" || key == "w") && game.playerCurrentLane < 3) {
                console.log("up");
                game.playerCurrentLane++;
                if (game.playerCurrentLane == 0)
                    game.playerDestY = 365;
                else if (game.playerCurrentLane == 1)
                    game.playerDestY = 333;
                else if (game.playerCurrentLane == 2)
                    game.playerDestY = 269;
                else
                    game.playerDestY = 237;
                game.playerIsMoving = true;
            } else if ((key == "down" || key == "d") && game.playerCurrentLane > 0) {
                console.log("down");
                game.playerCurrentLane--;
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

    }

}).appendTo("body");