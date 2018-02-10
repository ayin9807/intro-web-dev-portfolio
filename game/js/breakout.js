/* 
 * Constants
 */

var FPS = 60;
var BALL_SIZE = 10;
var BALL_SPEED = 3;
var PADDLE_HEIGHT = 10;
var PADDLE_WIDTH = 50;
var PADDLE_SPEED = 5;
var ROW = 4;
var COL = 5;
var PADDING = 10;
var BRICK_HEIGHT = 15;

// keeping track of brick locations to detect collision
// if hit = 0, then not hit yet
// if hit = 1, then already hit
var brick_info = [];
for (var r = 0; r < ROW; r++) {
    brick_info[r] = [];
    for (var c = 0; c < COL; c++) {
        brick_info[r][c] = {x: 0, y: 0, hit: 0};
    }
}

/*
 * Key input manager
 */

class InputManager {
    constructor (canvas) {
        this.canvas = canvas;
        this.leftPressed = false;
        this.rightPressed = false;
    }
    
    keyDownHandler (e) {
        if (e.keyCode == 39) {
            this.rightPressed = true;
        } else if (e.keyCode == 37) {
            this.leftPressed = true;
        }
    }
    
    keyUpHandler(e) {
        if (e.keyCode == 39) {
            this.rightPressed = false;
        } else if (e.keyCode == 37) {
            this.leftPressed = false;
        }
    }
}

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
        ctx.fillStyle = '#A9A9A9';
        ctx.arc(this.x, this.y, this.width/2, 0, Math.PI*2);
        ctx.fill();
        ctx.closePath();
    }
}

class Paddle {
    constructor (x, y, width, height, dx, dy) {
        this.startX = x;
        this.startY = y;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.dx = dx;
        this.dy = dy;  
    }
    
    move (canvas) {
        if (input.rightPressed && this.x < canvas.width - this.width) {
            this.x += this.dx;
        } else if (input.leftPressed && this.x > 0) {
            this.x -= this.dx;
        }
    }
    
    draw (ctx) {
        ctx.fillStyle = 'lightblue';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

class Bricks {
    constructor (rcount, ccount, height, padding, colors) {
        this.rcount = rcount;
        this.ccount = ccount;
        this.height = height;
        this.padding = padding;
        this.colors = colors;
        this.width = (canvas.width - ((this.ccount + 1) * this.padding)) / ccount;
    }
    
    draw (ctx) {
        for (var r = 0; r < this.rcount; r++) {
            for (var c = 0; c < this.ccount; c++) {
                if (brick_info[r][c].hit == 0) {
                    var brick_x = c * (this.width + this.padding) + this.padding;
                    var brick_y = r * (this.height + this.padding) + this.padding;
                    brick_info[r][c].x = brick_x;
                    brick_info[r][c].y = brick_y;
                    ctx.fillStyle = this.colors[r];
                    ctx.fillRect(brick_x, brick_y, this.width, this.height);
                }
            }
        }
    }
}

class Game {
    constructor (canvas) {
        // area where game is played
        this.canvas = canvas;
        // object that handles drawing on canvas
        this.ctx = this.canvas.getContext('2d');
        this.ball = new Ball (this.canvas.width/2, this.canvas.height-30, BALL_SIZE, BALL_SPEED, -BALL_SPEED);
        this.paddle = new Paddle ((canvas.width - PADDLE_WIDTH)/2, canvas.height - PADDLE_HEIGHT, PADDLE_WIDTH, PADDLE_HEIGHT, PADDLE_SPEED, 0);
        var colors = ['plum', 'steelblue', 'lightgreen', 'yellow'];
        this.bricks = new Bricks (ROW, COL, BRICK_HEIGHT, PADDING, colors);
    }
    
    loop () {
        this.update();
        this.draw();
    }
    
    update () {
        this.ball.move(this.canvas);
        this.paddle.move(this.canvas);
        this.checkCollisions(this.canvas);
    }
    
    draw () {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ball.draw(this.ctx); 
        this.paddle.draw(this.ctx);
        this.bricks.draw(this.ctx);
    }
    
    checkCollisions () {
        for (var r = 0; r < this.bricks.rcount; r++) {
            for (var c = 0; c < this.bricks.ccount; c++) {
                var br = brick_info[r][c];
                if (br.hit == 0) {
                    if (this.ball.x + this.ball.dx > br.x && this.ball.x + this.ball.dx < br.x + this.bricks.width && this.ball.y + this.ball.dy > br.y && this.ball.y + this.ball.dy < br.y + this.bricks.height) {
                        this.ball.dy = -this.ball.dy;
                        br.hit = 1;
                    }
                }
            }
        }
        
        if (this.ball.x + this.ball.dx > this.canvas.width - this.ball.width || this.ball.x + this.ball.dx < this.ball.width) {
            this.ball.dx = -this.ball.dx;
        }
        
        if (this.ball.y + this.ball.dy < this.ball.width) {
            this.ball.dy = -this.ball.dy;
        } 
        else if (this.ball.y + this.ball.dy > this.canvas.height - this.ball.width ) {
            if (this.ball.x + this.ball.dx > this.paddle.x && this.ball.x + this.ball.dx < this.paddle.x + this.paddle.width ) {
                this.ball.dy = -this.ball.dy;
            } 
            else {
                alert("Game Over!");
                document.location.reload();
            }
        }
    }
} 

/*
 * Setup classes
 */

var canvas = document.getElementById('canvas');
// var resources = new ResourceManager();
var input = new InputManager(canvas);
var game = new Game(canvas);

/*
 * Setup input responses
 */

document.addEventListener('keydown', event => input.keyDownHandler(event), false);
document.addEventListener('keyup', event => input.keyUpHandler(event), false);

/*
 * Game loop
 */

setInterval (function() {
    game.loop();
}, 1000/FPS);

