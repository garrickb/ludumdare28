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
    src: ["assets/img/mainmenu.png"],
    assetsTotal: -1,
    assetsLoaded: 0
};
var mainMenu = {
    titleY: -100,
    titleDestY: 100
};

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
        if (input.mouseDown != input.prevMouseDown && input.mouseDown == false) { //On Click
            console.log("click event at " + input.mouseDownX + ", " + input.mouseDownY);
            switch (activeScreen) {
                case 0:
                    if (mainMenu.titleY >= mainMenu.titleDestY) {
                        if (input.mouseDownX < this.canvas.width / 2 + 100 && input.mouseDownX > this.canvas.width / 2 - 100) {
                            if (input.mouseDownY > 200 && input.mouseDownY < 260) {
                                console.log("start button");
                                activeScreen = 1;
                            } else if (input.mouseDownY > 295 && input.mouseDownY < 350) {
                                console.log("how to button")
                                activeScreen = 2;
                            }
                        }
                    }
                    break;
                case 1: //Game Click Events

                    break;
                case 2: //How To Play Events
                    if (input.mouseDownX < 605 && input.mouseDownX > 505) {
                        if (input.mouseDownY > 400 && input.mouseDownY < 440) {
                        activeScreen = 0;
                        console.log("back");
                        }
                    }
                    //roundRect(500,
                    //  400, 100, 40, 20)
                    break;
            }
        }
        input.prevMouseDown = input.mouseDown;

        //Handle Logic
        switch (activeScreen) {
            case -1:
                if (assets.assetsTotal == -1)
                    assets.assetsTotal = assets.src.length;
                if (assets.assetsTotal == assets.assetsLoaded) {
                    activeScreen = 0;
                } else if (assets.data[assets.src[assets.assetsLoaded]] == undefined) { //While the next asset is not loaded
                    var img = new Image();
                    assets.status = "Loading " + assets.src[assets.assetsLoaded] + "...";
                    img.src = assets.src[assets.assetsLoaded];
                    img.onload = function () {
                        assets.data[assets.src[assets.assetsLoaded]] = img;
                        console.log("'" + assets.src[assets.assetsLoaded] + "' loaded");
                        assets.assetsLoaded++;
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

                //Game logic here

                break;
        }
    },

    onrender: function () {
        switch (activeScreen) {
            case -1:
                this.clear('black');
                this.fillStyle('white').font("25pt 'Droid Sans' serif").textBaseline("top")
                    .fillText("Loading Assets", (this.canvas.width / 2) - (this.measureText("Loading Assets").width / 2),
                        180).font("8pt 'Droid Sans' serif").fillText(assets.status, (this.canvas.width / 2) - (this.measureText(assets.status).width / 2),
                        215);
                break;
            case 0:
                //Draw Title
                var title = "You Only Get One"
                this.clear('black');
                this.drawImage(assets.data["assets/img/mainmenu.png"], 0, 0, 640, 480);
                this.fillStyle('white').font("40pt 'Droid Sans' serif").textBaseline("top")
                    .fillText(title, (this.canvas.width / 2) - (this.measureText(title).width / 2), mainMenu.titleY);
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
                break;
            case 1:
                this.clear('black');
                //Draw game here
                break;
            case 2:
                this.clear('black');
                this.drawImage(assets.data["assets/img/mainmenu.png"], 0, 0, 640, 480);
                this.fillStyle('white').font("35pt 'Droid Sans' serif").textBaseline("top")
                    .fillText("HOW TO PLAY", (this.canvas.width / 2) - (this.measureText("HOW TO PLAY").width / 2), 35);
                //Back Button
                this.fillStyle('red').lineWidth(5).strokeStyle('white').beginPath().roundRect(500,
                        400, 100, 40, 20).closePath().stroke().fill().fillStyle('white').font("22pt 'Droid Sans' serif").
                    fillText("Back", 520, 402);
                break;
        }
    },

    onkeydown: function (key) {

    },

    onkeyup: function (key) {

    }

}).appendTo("body");