
// GameBoard code below
var gameEngine = new GameEngine();
var time;
var oldTime;
function distance(a, b) {
    var dx = a.x - b.x;
    var dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
}
function Animation(spriteSheet, startX, startY, frameWidth, frameHeight, sheetWidth, frameDuration, frames, loop) {
    this.spriteSheet = spriteSheet;
    this.startX = startX;
    this.startY = startY;
    this.frameWidth = frameWidth;
    this.frameDuration = frameDuration;
    this.frameHeight = frameHeight;
    this.sheetWidth = sheetWidth;
    this.frames = frames;
    this.totalTime = frameDuration * frames;
    this.elapsedTime = 0;
    this.loop = loop;
    this.isDead = false;
}

//Added the 'scale' parameter and also set it so scaleBy is set to it
//if the caller adds the scale size to the end of the function call.
Animation.prototype.drawFrame = function (tick, ctx, x, y, scale) {
    var scaleBy = scale || 1;
    this.elapsedTime += tick;
    if (this.loop) {
        if (this.isDone()) {
            this.elapsedTime = 0;
        }
    } else if (this.isDone()) {
        return;
    }
    var frame = this.currentFrame();
    var xindex = 0;
    var yindex = 0;
    xindex = frame % this.sheetWidth;
    yindex = Math.floor(frame / this.sheetWidth);

    ctx.drawImage(this.spriteSheet,
        xindex * this.frameWidth, yindex * this.frameHeight,  // source from sheet
        this.frameWidth, this.frameHeight,
        x, y,
        this.frameWidth * scaleBy,
        this.frameHeight * scaleBy);
}

Animation.prototype.currentFrame = function () {
    return Math.floor(this.elapsedTime / this.frameDuration);
}

Animation.prototype.isDone = function () {
    return (this.elapsedTime >= this.totalTime);
}
function Circle(game) {
    this.element = 2;
    this.color = 2;
    this.radius = 20;
    this.team = "blue";
    this.hit = 0;
    this.timer = 0;
    this.immune = false;
    this.attacking = true;
    this.visualRadius = 300;
    this.removeElement = 0;
    this.colors = ["Red", "Green", "Blue", "Yellow"];
    Entity.call(this, game, this.radius + Math.random() * (800 - this.radius * 2), this.radius + Math.random() * (800 - this.radius * 2));

    this.velocity = { x: Math.random() * 1000, y: Math.random() * 1000 };
    var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
    if (speed > maxSpeed) {
        var ratio = maxSpeed / speed;
        this.velocity.x *= ratio;
        this.velocity.y *= ratio;
    }
};

Circle.prototype = new Entity();
Circle.prototype.constructor = Circle;

Circle.prototype.turnImmune = function () {
    this.immune = true;
    var that = this;
        setTimeout(function(){
            that.immune = false;
        }, 1000);
}
Circle.prototype.setFire = function () {
    this.element = 0;
    this.color = 0;
    this.team = "red";
};

Circle.prototype.setWater = function () {
    this.element = 2;
    this.color = 2;
    this.team = "blue"
};
Circle.prototype.setGrass = function () {
    this.element = 1;
    this.color = 1;
    this.team = "green";
};
Circle.prototype.setElectric = function () {
    this.element = 3;
    this.color = 3;
    this.team = "yellow";
};

Circle.prototype.collide = function (other) {
    return distance(this, other) < this.radius + other.radius;
};

Circle.prototype.collideLeft = function () {
    return (this.x - this.radius) < 0;
};

Circle.prototype.collideRight = function () {
    return (this.x + this.radius) > 800;
};

Circle.prototype.collideTop = function () {
    return (this.y - this.radius) < 0;
};

Circle.prototype.collideBottom = function () {
    return (this.y + this.radius) > 800;
};
Circle.prototype.spawnNewElement = function () {
    var newElement = Math.floor((Math.random() * 4) + 1);
    var circle = new Circle(gameEngine);
    if (newElement === 1) {
        circle.setGrass();
    }
    else if (newElement === 2) {
        circle.setFire();
    }
    else if (newElement === 3) {
        circle.setElectric();
    }
    gameEngine.addEntity(circle);
}

Circle.prototype.update = function () {
    Entity.prototype.update.call(this);
    if (Math.floor(this.game.timer.gameTime) > this.timer) {
        console.log();
        this.timer = Math.floor(this.game.timer.gameTime);
        console.log(this.timer);
        this.radius++;
    }

    if (this.game.addNewElement) {
        this.spawnNewElement();
        this.game.addNewElement = false;
    }
    this.x += this.velocity.x * this.game.clockTick;
    this.y += this.velocity.y * this.game.clockTick;

    if (this.collideLeft() || this.collideRight()) {
        this.velocity.x = -this.velocity.x * friction;
        if (this.collideLeft()) this.x = this.radius;
        if (this.collideRight()) this.x = 800 - this.radius;
        this.x += this.velocity.x * this.game.clockTick;
        this.y += this.velocity.y * this.game.clockTick;
    }

    if (this.collideTop() || this.collideBottom()) {
        this.velocity.y = -this.velocity.y * friction;
        if (this.collideTop()) this.y = this.radius;
        if (this.collideBottom()) this.y = 800 - this.radius;
        this.x += this.velocity.x * this.game.clockTick;
        this.y += this.velocity.y * this.game.clockTick;
    }

    for (var i = 0; i < this.game.entities.length; i++) {
        var ent = this.game.entities[i];
        if (ent !== this && this.collide(ent)) {
            var temp = { x: this.velocity.x, y: this.velocity.y };

            var dist = distance(this, ent);
            var delta = this.radius + ent.radius - dist;
            var difX = (this.x - ent.x)/dist;
            var difY = (this.y - ent.y)/dist;

            this.x += difX * delta / 2;
            this.y += difY * delta / 2;
            
            if (!ent.turrent) {
                ent.x -= difX * delta / 2;
                ent.y -= difY * delta / 2;
            }

            this.velocity.x = ent.velocity.x * friction;
            this.velocity.y = ent.velocity.y * friction;
            if (!ent.turrent) {
                ent.velocity.x = temp.x * friction;
                ent.velocity.y = temp.y * friction;
            }
            this.x += this.velocity.x * this.game.clockTick;
            this.y += this.velocity.y * this.game.clockTick;
            if (!ent.turrent) {
                ent.x += ent.velocity.x * this.game.clockTick;
                ent.y += ent.velocity.y * this.game.clockTick;

            }

            if (!this.immune && !ent.immune) {
                if (this.element === 0 ) {
                    if (ent.element === 1) {
                        var random = Math.floor((Math.random() * 10) + 1);
                        if (random === 1) {
                            this.hit = 0;
                            ent.hit = 0;
                            this.setElectric();
                            ent.setElectric();
                        }
                        else if (random > 3) {
                            if (ent.hit >= 3) {
                                this.radius + ent.radius;
                                ent.removeFromWorld = true;
                            }
                            ent.radius = (ent.radius / 2);
                            ent.hit++;
                            if (ent.radius <= 5)  {
                                ent.removeFromWorld = true;
                            }
                        }
                        else {
                            if (this.hit >= 3) {
                                ent.radius + this.radius;
                                this.removeFromWorld = true;
                            }
                            this.radius = (this.radius / 2);
                            if (this.radius <= 5)  {
                                this.removeFromWorld = true;
                            }
                        }

                    }
                    else if (ent.element === 0) {
                        this.radius += ent.radius;
                        ent.removeFromWorld = true;
                        if (this.radius > 50) {
                            while (this.radius > 10) {
                                circle = new Circle(gameEngine);
                                circle.setFire();
                                circle.radius = 10;
                                circle.x = this.x;
                                circle.y = this.y;
                                circle.velocity = { x: this.velocity.x, y: this.velocity.y };
                                circle.turnImmune();
                                gameEngine.addEntity(circle); 
                                this.radius -= 10;
                            }
                            this.radius = 10;
                            
                        }
                    }
                    else if (ent.element === 3) {
                        ent.radius -= 5;
                        circle = new Circle(gameEngine);
                        circle.setGrass();
                        circle.radius = 5;
                        circle.x = ent.x;
                        circle.y = ent.y;
                        circle.turnImmune();
                        circle.velocity = { x: ent.velocity.x, y: ent.velocity.y };
                        gameEngine.addEntity(circle); 

                        if (ent.radius <= 0) {
                            console.log("delete");
                            ent.removeFromWorld = true;
                        }
                        this.radius -= 5;
                        circle = new Circle(gameEngine);
                        circle.setWater();
                        circle.radius = 5;
                        circle.x = this.x;
                        circle.y = this.y;
                        circle.turnImmune();
                        circle.velocity = { x: this.velocity.x, y: this.velocity.y };
                        gameEngine.addEntity(circle); 

                        if (this.radius <= 0) {
                            console.log("delete");
                            this.removeFromWorld = true;
                        }
                    }
                }             
                else if (this.element === 1) {
                    if (ent.element === 3) {
                        var random = Math.floor((Math.random() * 10) + 1);
                        if (random === 1) {
                            this.hit = 0;
                            ent.hit = 0;
                            this.setWater();
                            ent.setWater();
                        }
                        else if (random > 3) {
                            if (ent.hit >= 3) {
                                this.radius + ent.radius;
                                ent.removeFromWorld = true;
                            }
                            ent.radius = (ent.radius / 2);
                            ent.hit++;
                            if (ent.radius <= 5)  {
                                ent.removeFromWorld = true;
                            }
                        }
                        else {
                            if (this.hit >= 3) {
                                ent.radius + this.radius;
                                this.removeFromWorld = true;
                            }
                            this.radius = (this.radius / 2);
                            if (this.radius <= 5)  {
                                this.removeFromWorld = true;
                            }
                        }
                    }
                    else if (ent.element === 1) {
                        this.radius += ent.radius;
                        ent.removeFromWorld = true;
                        if (this.radius > 50) {
                            while (this.radius > 10) {
                                circle = new Circle(gameEngine);
                                circle.setGrass();
                                circle.radius = 10;
                                circle.x = this.x;
                                circle.y = this.y;
                                circle.velocity = { x: this.velocity.x, y: this.velocity.y };
                                circle.turnImmune();
                                gameEngine.addEntity(circle); 
                                this.radius -= 10;
                            }
                            this.radius = 10;
                            
                        }
                    }
                    else if (ent.element === 2) {
                        ent.radius -= 5;
                        circle = new Circle(gameEngine);
                        circle.setElectric();
                        circle.radius = 5;
                        circle.x = ent.x;
                        circle.y = ent.y;
                        circle.turnImmune();
                        circle.velocity = { x: ent.velocity.x, y: ent.velocity.y };
                        gameEngine.addEntity(circle); 

                        if (ent.radius <= 0) {
                            console.log("delete");
                            ent.removeFromWorld = true;
                        }
                        this.radius -= 5;
                        circle = new Circle(gameEngine);
                        circle.setFire();
                        circle.radius = 5;
                        circle.x = this.x;
                        circle.y = this.y;
                        circle.turnImmune();
                        circle.velocity = { x: this.velocity.x, y: this.velocity.y };
                        gameEngine.addEntity(circle); 

                        if (this.radius <= 0) {
                            console.log("delete");
                            this.removeFromWorld = true;
                        }
                    }
                }                
                else if (this.element === 2) {
                    if (ent.element === 0) {
                        var random = Math.floor((Math.random() * 10) + 1);
                        if (random === 1) {
                            this.hit = 0;
                            ent.hit = 0;
                            this.setGrass();
                            ent.setGrass();
                        }
                        else if (random > 3) {
                            if (ent.hit >= 3) {
                                this.radius + ent.radius;
                                ent.removeFromWorld = true;
                            }
                            ent.radius = (ent.radius / 2);
                            ent.hit++;
                            if (ent.radius <= 5)  {
                                ent.removeFromWorld = true;
                            }
                        }
                        else {
                            if (this.hit >= 3) {
                                ent.radius + this.radius;
                                this.removeFromWorld = true;
                            }
                            this.radius = (this.radius / 2);
                            if (this.radius <= 5)  {
                                this.removeFromWorld = true;
                            }
                        }
                    }
                    else if (ent.element === 2) {
                        this.radius += ent.radius;
                        ent.removeFromWorld = true;
                        if (this.radius > 50) {
                            while (this.radius > 10) {
                                circle = new Circle(gameEngine);
                                circle.setWater();
                                circle.radius = 10;
                                circle.x = this.x;
                                circle.y = this.y;
                                circle.turnImmune();
                                circle.velocity = { x: this.velocity.x, y: this.velocity.y };
                                gameEngine.addEntity(circle); 
                                this.radius -= 10;
                            }
                            this.radius = 10;
                            
                        }
                    }  
                    else if (ent.element === 1) {
                        ent.radius -= 5;
                        circle = new Circle(gameEngine);
                        circle.setFire();
                        circle.radius = 5;
                        circle.x = ent.x;
                        circle.y = ent.y;
                        circle.turnImmune();
                        circle.velocity = { x: ent.velocity.x, y: ent.velocity.y };
                        gameEngine.addEntity(circle); 

                        if (ent.radius <= 0) {
                            console.log("delete");
                            ent.removeFromWorld = true;
                        }
                        this.radius -= 5;
                        circle = new Circle(gameEngine);
                        circle.setElectric();
                        circle.radius = 5;
                        circle.x = this.x;
                        circle.y = this.y;
                        circle.turnImmune();
                        circle.velocity = { x: this.velocity.x, y: this.velocity.y };
                        gameEngine.addEntity(circle); 

                        if (this.radius <= 0) {
                            console.log("delete");
                            this.removeFromWorld = true;
                        }
                    }              
                }
                else if (this.element === 3) {
                    if (ent.element === 2) {
                        var random = Math.floor((Math.random() * 10) + 1);
                        if (random === 1) {
                            this.hit = 0;
                            ent.hit = 0;
                            this.setFire();
                            ent.setFire();
                        }
                        else if (random > 3) {
                            if (ent.hit >= 3) {
                                this.radius + ent.radius;
                                ent.removeFromWorld = true;
                            }
                            ent.radius = (ent.radius / 2);
                            ent.hit++;
                            if (ent.radius <= 5)  {
                                ent.removeFromWorld = true;
                            }
                        }
                        else {
                            if (this.hit >= 3) {
                                ent.radius + this.radius;
                                this.removeFromWorld = true;
                            }
                            this.radius = (this.radius / 2);
                            if (this.radius <= 5)  {
                                this.removeFromWorld = true;
                            }
                        }
                    }
                    else if (ent.element === 3) {
                        this.radius += ent.radius;
                        ent.removeFromWorld = true;
                        if (this.radius > 50) {
                            
                            while (this.radius > 10) {
                                circle = new Circle(gameEngine);
                                circle.setElectric();
                                circle.radius = 10;
                                circle.x = this.x;
                                circle.y = this.y;
                                circle.velocity = { x: this.velocity.x, y: this.velocity.y };
                                circle.turnImmune();
                                gameEngine.addEntity(circle); 
                                this.radius -= 10;
                            }
                            this.radius = 10;
                            
                        }
                    }         
                    else if (ent.element === 0) {
                        ent.radius -= 5;
                        circle = new Circle(gameEngine);
                        circle.setWater();
                        circle.radius = 5;
                        circle.x = ent.x;
                        circle.y = ent.y;
                        circle.turnImmune();
                        circle.velocity = { x: ent.velocity.x, y: ent.velocity.y };
                        gameEngine.addEntity(circle); 

                        if (ent.radius <= 0) {
                            console.log("delete");
                            ent.removeFromWorld = true;
                        }
                        this.radius -= 5;
                        circle = new Circle(gameEngine);
                        circle.setGrass();
                        circle.radius = 5;
                        circle.x = this.x;
                        circle.y = this.y;
                        circle.turnImmune();
                        circle.velocity = { x: this.velocity.x, y: this.velocity.y };
                        gameEngine.addEntity(circle); 

                        if (this.radius <= 0) {
                            console.log("delete");
                            this.removeFromWorld = true;
                        }
                    }            
                }
            
                if (!ent.immune && !this.immune) {
                    ent.turnImmune();
                    this.turnImmune();
                }
            }

        }

        if (ent != this && this.collide({ x: ent.x, y: ent.y, radius: this.visualRadius })) {
            var dist = distance(this, ent);
            this.attacking = true;
            if ((this.element === 0 && ent.element === 1 && !ent.immune) && (dist > this.radius + ent.radius + 10)) {
                this.attacking = true;
                var difX = (ent.x - this.x)/dist;
                var difY = (ent.y - this.y)/dist;
                this.velocity.x += difX * acceleration / (dist*dist);
                this.velocity.y += difY * acceleration / (dist * dist);
                var speed = Math.sqrt(this.velocity.x*this.velocity.x + this.velocity.y*this.velocity.y);
                if (speed > maxSpeed) {
                    var ratio = maxSpeed / speed;
                    this.velocity.x *= ratio;
                    this.velocity.y *= ratio;
                }
            }
            if ((this.element === 1 && ent.element === 3 && !ent.immune) && (dist > this.radius + ent.radius + 10)) {
                this.attacking = true;
                var difX = (ent.x - this.x)/dist;
                var difY = (ent.y - this.y)/dist;
                this.velocity.x += difX * acceleration / (dist*dist);
                this.velocity.y += difY * acceleration / (dist * dist);
                var speed = Math.sqrt(this.velocity.x*this.velocity.x + this.velocity.y*this.velocity.y);
                if (speed > maxSpeed) {
                    var ratio = maxSpeed / speed;
                    this.velocity.x *= ratio;
                    this.velocity.y *= ratio;
                }
            }
            if ((this.element === 2 && ent.element === 0 && !ent.immune) && (dist > this.radius + ent.radius + 10)) {
                this.attacking = true;
                var difX = (ent.x - this.x)/dist;
                var difY = (ent.y - this.y)/dist;
                this.velocity.x += difX * acceleration / (dist*dist);
                this.velocity.y += difY * acceleration / (dist * dist);
                var speed = Math.sqrt(this.velocity.x*this.velocity.x + this.velocity.y*this.velocity.y);
                if (speed > maxSpeed) {
                    var ratio = maxSpeed / speed;
                    this.velocity.x *= ratio;
                    this.velocity.y *= ratio;
                }
            }
            if ((this.element === 3 && ent.element === 2 && !ent.immune) && (dist > this.radius + ent.radius + 10)) {
                this.attacking = true;
                var difX = (ent.x - this.x)/dist;
                var difY = (ent.y - this.y)/dist;
                this.velocity.x += difX * acceleration / (dist*dist);
                this.velocity.y += difY * acceleration / (dist * dist);
                var speed = Math.sqrt(this.velocity.x*this.velocity.x + this.velocity.y*this.velocity.y);
                if (speed > maxSpeed) {
                    var ratio = maxSpeed / speed;
                    this.velocity.x *= ratio;
                    this.velocity.y *= ratio;
                }
            }
            if ((ent.element === 0 && this.element === 1) && (dist > this.radius + ent.radius)) {
                this.attacking = false;
                var difX = (ent.x - this.x) / dist;
                var difY = (ent.y - this.y) / dist;
                this.velocity.x -= difX * acceleration / (dist * dist);
                this.velocity.y -= difY * acceleration / (dist * dist);
                var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
                if (speed > maxSpeed) {
                    var ratio = maxSpeed / speed;
                    this.velocity.x *= ratio;
                    this.velocity.y *= ratio;
                }
            }
            if ((ent.element === 1 && this.element === 3) && (dist > this.radius + ent.radius)) {
                this.attacking = false;
                var difX = (ent.x - this.x) / dist;
                var difY = (ent.y - this.y) / dist;
                this.velocity.x -= difX * acceleration / (dist * dist);
                this.velocity.y -= difY * acceleration / (dist * dist);
                var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
                if (speed > maxSpeed) {
                    var ratio = maxSpeed / speed;
                    this.velocity.x *= ratio;
                    this.velocity.y *= ratio;
                }
            }
            if ((ent.element === 2 && this.element === 0) && (dist > this.radius + ent.radius)) {
                this.attacking = false;
                var difX = (ent.x - this.x) / dist;
                var difY = (ent.y - this.y) / dist;
                this.velocity.x -= difX * acceleration / (dist * dist);
                this.velocity.y -= difY * acceleration / (dist * dist);
                var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
                if (speed > maxSpeed) {
                    var ratio = maxSpeed / speed;
                    this.velocity.x *= ratio;
                    this.velocity.y *= ratio;
                }
            }
            if ((ent.element === 3 && this.element === 2) && (dist > this.radius + ent.radius)) {
                this.attacking = false;
                var difX = (ent.x - this.x) / dist;
                var difY = (ent.y - this.y) / dist;
                this.velocity.x -= difX * acceleration / (dist * dist);
                this.velocity.y -= difY * acceleration / (dist * dist);
                var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
                if (speed > maxSpeed) {
                    var ratio = maxSpeed / speed;
                    this.velocity.x *= ratio;
                    this.velocity.y *= ratio;
                }
            }
            
        }

    }

    
    this.velocity.x -= (1 - friction) * this.game.clockTick * this.velocity.x;
    this.velocity.y -= (1 - friction) * this.game.clockTick * this.velocity.y;
};

Circle.prototype.draw = function (ctx) {
    ctx.beginPath();
    ctx.fillStyle = this.colors[this.color];
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.closePath();

};

// the "main" code begins here
var friction = 1;
var acceleration = 1000000;
var maxSpeed = 200;

var ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.queueDownload("./img/960px-Blank_Go_board.png");
ASSET_MANAGER.queueDownload("./img/black.png");
ASSET_MANAGER.queueDownload("./img/white.png");
ASSET_MANAGER.queueDownload("./img/blueGun.png");
ASSET_MANAGER.queueDownload("./img/orangeGun.png");
ASSET_MANAGER.queueDownload("./img/redGun.png");
ASSET_MANAGER.queueDownload("./img/greenGun.png");

ASSET_MANAGER.downloadAll(function () {
    console.log("starting up da sheild");
    var canvas = document.getElementById('gameWorld');
    var ctx = canvas.getContext('2d');
    gameEngine.init(ctx);
    gameEngine.start();
    for (var i = 0; i < 4; i++) {
        circle = new Circle(gameEngine);
        circle.setElectric()
        gameEngine.addEntity(circle);
    }
    for (var i = 0; i < 4; i++) {
        circle = new Circle(gameEngine);
        circle.setFire()
        gameEngine.addEntity(circle);
    }
    for (var i = 0; i < 4; i++) {
        circle = new Circle(gameEngine);
        circle.setGrass()
        gameEngine.addEntity(circle);
    }
    for (var i = 0; i < 4; i++) {
        circle = new Circle(gameEngine);
        gameEngine.addEntity(circle);
    }
    
});
