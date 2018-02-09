/* 
 * Constants
 */

var FPS = 60;
var BALL_SIZE = 10;
var BALL_SPEED = 3;

class Ball {
    constructor (x, y, size, dx, dy) {
        this.startX = x;
        this.startY = y;
        this.x = x;
        this.y = y;
        this.width = size;
        this.height = size;
        this.dx = dx;
        this.dy = dy;  
    }
    
    move () {
        this.x += this.dx;
        this.y += this.dy;
    }
    
    draw (ctx) {
        ctx.beginPath();
        ctx.fillStyle = "#A9A9A9";
        ctx.arc(this.x, this.y, this.size/2, 0, Math.PI*2);
        ctx.fill();
        ctx.closePath();
    }
}

class Game {
    constructor (canvas) {
        // area where game is played
        this.canvas = canvas;
        // object that handles drawing on canvas
        this.ctx = this.canvas.getContext('2d');
        this.ball = new Ball (this.canvas.width/2, this.canvas.height-30, 10, 3, -3);
    }
    
    loop () {
        this.draw();
    }
    
    draw () {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ball.draw(this.ctx); 
    }
} 

/*
 * Setup classes
 */

var canvas = document.getElementById("canvas");
// var resources = new ResourceManager();
// var input = new InputManager(canvas);
var game = new Game(canvas);
// var ctx = canvas.getContext("2d");

/*
 * Setup input responses
 */

/*
 * Game loop
 */

/*var x = canvas.width/2;
var y = canvas.height-30;
//var dx = 2;
//var dy = -2;

function draw() {
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, Math.PI*2);
    ctx.fillStyle = "#0095DD";
    ctx.fill();
    ctx.closePath();
}*/

setInterval (function() {
    game.loop();
}, 1000/FPS);

