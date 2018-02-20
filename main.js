var AM = new AssetManager();

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


}

Animation.prototype.drawFrame = function (tick, ctx, x, y) {
    var scaleBy = scaleBy || 1;
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
        //ctx.strokeStyle = "Green";
        //ctx.strokeRect(x, y, this.frameWidth * scaleBy, this.frameHeight * scaleBy);
}

Animation.prototype.currentFrame = function () {
    return Math.floor(this.elapsedTime / this.frameDuration);
}

Animation.prototype.isDone = function () {
    return (this.elapsedTime >= this.totalTime);
}

Animation.prototype.currentFrame = function () {
    return Math.floor(this.elapsedTime / this.frameDuration);
}

Animation.prototype.isDone = function () {
    return (this.elapsedTime >= this.totalTime);
}

// no inheritance
function Background(game, spritesheet) {
    this.x = 0;
    this.y = 0;
    this.spritesheet = spritesheet;
    this.game = game;
    this.ctx = game.ctx;
};

Background.prototype.draw = function () {
    this.ctx.drawImage(this.spritesheet,
                   this.x, this.y);
};

Background.prototype.update = function () {
};
function collide(thisUnit, otherUnit) {
    var rect1 = {x: thisUnit.x, y: thisUnit.y, width: thisUnit.width, height: thisUnit.height}
    var rect2 = {x: otherUnit.x, y: otherUnit.y, width: otherUnit.width, height: otherUnit.height}
    if (otherUnit.unitType === "giantRobot") {
        rect2.width = 100;
        rect2.x = otherUnit.x + 80;
    }
    if (otherUnit.standingStance === 0) {
        rect2.height = 10;
        rect2.y = otherUnit.y + 75;
    }
    if (otherUnit.crouch) {
        rect2.height = 30;
        rect2.y = otherUnit.y + 60;
    }
    if (rect1.x < (rect2.x + rect2.width)
    && (rect1.x + rect1.width) > rect2.x
    && rect1.y < (rect2.y + rect2.height)
    && (rect1.height + rect1.y) > rect2.y) {
        if (otherUnit.isBullet) {
        }
        else if (!otherUnit.isBullet){
            if (thisUnit.isBullet) {
                if (otherUnit.enemy && !(thisUnit.unitType === "hero")) {
                    if (otherUnit.unitType === "blueRobot") thisUnit.removeFromWorld = true;

                }
                else {
                    if (otherUnit.unitType !== "blueRobot") {
                        if (!otherUnit.immune) otherUnit.health -= 1;
                    }
                    if (otherUnit.hero && !otherUnit.immune) {
                        otherUnit.hurt = true;
                    }
                    thisUnit.removeFromWorld = true;
                }
            }
            if (thisUnit.hero) {
                if (otherUnit.landMine && !thisUnit.immune) {
                    thisUnit.health -= 4;
                    thisUnit.hurt = true;
                    otherUnit.health = 0;
                }
                else if (otherUnit.enemy && !thisUnit.immune){
                    thisUnit.hurt = true;
                    thisUnit.health -= 1;
                }
                if (thisUnit.x < otherUnit.x) thisUnit.collideForward = true;
                else thisUnit.collideForward = false;
            }
            else if (thisUnit.enemy) {
                if (otherUnit.hero) {
                    if (otherUnit.x < thisUnit.x) otherUnit.collideForward = true;
                    else otherUnit.collideForward = false;
                }
                else if (otherUnit.landMine) {
                    return false;
                }
            }
        }
        return true;
    }
};

// inheritance
function Hero(game, spritesheet, spritesheet2, spriteSheet3, spriteSheet4, spriteSheet5, spriteSheet6, spriteSheet7, spriteSheet8, spriteSheet9, spriteSheet10
    , spriteSheet11) {
    this.frontRun = new Animation(spritesheet, this.x, this.y, 105, 101, 8, 0.1, 8, true);
    this.backRun = new Animation(spritesheet2, this.x, this.y, 105, 102, 8, 0.1, 8, true);
    this.frontStand = new Animation(spriteSheet3, this.x, this.y, 98, 100, 1, 0.1, 1, true);
    this.backStand = new Animation(spriteSheet4, this.x, this.y, 98, 100, 1, 0.1, 1, true);
    this.frontJump = new Animation(spriteSheet5, this.x, this.y, 105, 107, 1, 2, 1, false);
    this.backJump = new Animation(spriteSheet6, this.x, this.y, 105, 103, 1, 2, 1, false);
    this.backCrawl = new Animation(spriteSheet8, this.x, this.y, 138, 100, 1, 0.1, 1, true);
    this.frontCrawl = new Animation(spriteSheet9, this.x, this.y, 141, 100, 1, 0.1, 1, true);
    this.jumping = false;
    this.speed = 200;
    this.ctx = game.ctx;
    this.ground = 525;
    this.radius = 100;
    this.runFlag = false;
    this.firing = false;
    this.CanShoot = true;
    this.jumpForward = true;
    this.standForward = true;
    Entity.call(this, game, 100, 525);
}

Hero.prototype = new Entity();
Hero.prototype.constructor = Hero;
Hero.prototype.update = function () {

    if (this.game.a) {
        if (!this.jumping) this.jumpForward = false;
        this.standForward = false;
        this.runFlag = true;
    }

    if (this.game.d) {
        if (!this.jumping) this.jumpForward = true;
        this.standForward = true;
        this.runFlag = true;
    }

    if (!this.game.a && !this.game.d) {
        this.runFlag = false;
    }

    if (this.game.shooting) this.firing = true;
    else this.firing = false;

    if (this.game.s) this.crawlForward = true;
    else this.crawlForward = false;

    if (this.game.space) {
        this.jumping = true;
    }


    //Moved these variables outside of the next If/Else Statement
    //to simplify and make code easier to read
    var totalHeight = 200;
    var height = totalHeight * (-4 * (jumpDistance * jumpDistance - jumpDistance));

    if (this.jumping && this.runFlag) {

        if (this.frontJump.isDone() || this.backJump.isDone()) {
            this.frontJump.elapsedTime = 0;
            this.backJump.elapsedTime = 0;
            this.jumping = false;
            this.standForward = this.jumpForward;
        }
        var jumpDistance;
        if (this.frontJump.elapsedTime > 0) jumpDistance = this.frontJump.elapsedTime / this.frontJump.totalTime;
        else jumpDistance = this.backJump.elapsedTime / this.backJump.totalTime;

        if (jumpDistance > 0.5)
            jumpDistance = 1 - jumpDistance;
            var height = totalHeight * (-4 * (jumpDistance * jumpDistance - jumpDistance));

        this.y = this.ground - height;

        if (this.standForward) this.x += (this.game.clockTick * this.speed) / 2;
        else if(this.x >= 40) this.x -= (this.game.clockTick * this.speed) / 2;
    }
    else if (this.jumping) {
        if (this.frontJump.isDone() || this.backJump.isDone()) {
            this.frontJump.elapsedTime = 0;
            this.backJump.elapsedTime = 0;
            this.jumping = false;
            this.standForward = this.jumpForward;
        }
        var jumpDistance;
        if (this.frontJump.elapsedTime > 0) jumpDistance = this.frontJump.elapsedTime / this.frontJump.totalTime;
        else jumpDistance = this.backJump.elapsedTime / this.backJump.totalTime;

        if (jumpDistance > 0.5)
            jumpDistance = 1 - jumpDistance;
            var height = totalHeight * (-4 * (jumpDistance * jumpDistance - jumpDistance));

        this.y = this.ground - height;
    }

    //else if (this.crawlForward) {

    //}

    else if (this.runFlag && this.standForward && !this.crawlForward) {
        this.x += this.game.clockTick * this.speed;
    }

    else if ((this.runFlag && !this.standForward && !this.crawlForward)) {

        if(this.x >= 40) this.x -= this.game.clockTick * this.speed;
    }
    that = this;

    if (this.firing) {
    
        if (this.CanShoot) {
            if (this.standForward) {
                if (this.jumping) {
                    if (this.jumpForward) {
                        this.game.addEntity(new Bullet(this.game, this.x + 100, this.y + 35, this.jumpForward));
                    }
                    else {
                        this.game.addEntity(new Bullet(this.game, this.x , this.y + 35, this.jumpForward));
                    }
                }
                else if (this.crawlForward) {
                    this.game.addEntity(new Bullet(this.game, this.x + 140, this.y + 85, this.standForward));
                   // this.game.addEntity(new BulletFlash(this.game, AM.getAsset("./img/BulletFlash.png"), this.x + 140, this.y + 85, this.standForward));
                }
                else {
                    this.game.addEntity(new Bullet(this.game, this.x + 100, this.y + 35, this.standForward));
                    //this.game.addEntity(new BulletFlash(this.game, AM.getAsset("./img/BulletFlash.png"), this.x + 100, this.y + 35, this.standForward));
                }
            }
            else {
                if (this.jumping) {
                    if (this.jumpForward ) {
                        this.game.addEntity(new Bullet(this.game, this.x + 100, this.y + 35, this.jumpForward));
                    }
                    else {
                        this.game.addEntity(new Bullet(this.game, this.x, this.y + 35, this.jumpForward));
                    }
                }
                else if (this.crawlForward) {
                   this.game.addEntity(new Bullet(this.game, this.x - 10, this.y + 85, this.standForward));
                  // this.game.addEntity(new BulletFlash(this.game, AM.getAsset("./img/BulletFlash.png"), this.x - 40, this.y + 85, this.standForward));
                }
                else {
                   this.game.addEntity(new Bullet(this.game, this.x, this.y + 35, this.standForward));
                  // this.game.addEntity(new BulletFlash(this.game, AM.getAsset("./img/BulletFlash.png"), this.x, this.y + 35, this.standForward));
                }
            }
            this.CanShoot = false;
            setTimeout(function(){

            that.CanShoot = true;

        }, 500);

        }


    }



    Entity.prototype.update.call(this);

}

Hero.prototype.draw = function () {
  
    if (this.jumping && this.jumpForward) {
        this.frontJump.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
    }
    else if (this.jumping && !this.jumpForward) {
        this.backJump.drawFrame(this.game.clockTick, this.ctx, this.x , this.y);
    }
    else if (this.crawlForward && this.standForward) {
        this.frontCrawl.drawFrame(this.game.clockTick, this.ctx, this.x , this.y);
    }
    else if (this.crawlForward && !this.standForward) {
        this.backCrawl.drawFrame(this.game.clockTick, this.ctx, this.x , this.y);
    }

    else if (this.runFlag && this.standForward) {
        this.frontRun.drawFrame(this.game.clockTick, this.ctx, this.x , this.y);
    }
    else if (this.runFlag && !this.standForward) {
        this.backRun.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
    }
    else if (!this.runFlag && this.standForward) {

        this.frontStand.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
    }
    else if (!this.runFlag && !this.standForward) {
        this.backStand.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
    }

    Entity.prototype.draw.call(this);
}
function EnemySoldier(game, backRunSprite, frontRunSprite, backStandSprite, frontStandSprite
    , frontCrouchSprite, backCrouchSprite,  xCord, yCord, unitSpeed, health, scores) {
    this.enemyBackRun = new Animation(backRunSprite, this.x, this.y, 102, 100, 8, 0.1, 8, true);
    this.enemyFrontRun = new Animation(frontRunSprite, this.x, this.y, 104, 100, 8, 0.1, 8, true);
    this.enemyBackStand = new Animation(backStandSprite, this.x, this.y, 98, 100, 1, 0.1, 1, true);
    this.enemyFrontStand = new Animation(frontStandSprite, this.x, this.y, 98, 100, 1, 0.1, 1, true);
    this.enemyBackCrouch = new Animation(frontCrouchSprite, this.x, this.y, 98, 80, 1, 0.1, 1, true);
    this.enemyFrontCrouch = new Animation(backCrouchSprite, this.x, this.y, 98, 80, 1, 0.1, 1, true);
    this.speed = unitSpeed;
    this.health = health;
    this.ctx = game.ctx;
    this.forward = true;
    this.crouch = false;
    this.unitType = "soldier";
    this.width = 85;
    this.height = 90;
    this.timer = 0;
    this.enemy = true;
    this.enemyShoot = true;
    this.standing = false;
    this.center = xCord;
	this.scores = scores;
    Entity.call(this, game, xCord, yCord);
}

EnemySoldier.prototype = new Entity();
EnemySoldier.prototype.constructor = EnemySoldier;


EnemySoldier.prototype.reset = function () {
	this.forward = true;
	this.crouch = false;
	this.enemyShoot = true;
	this.standing = false;
}

EnemySoldier.prototype.update = function () {
    var enemyThat = this;
    this.isCollide = false;
    this.collideForward = false;
    if (this.health <= 0) this.isDead = true;
    if (this.isDead) {		
        gameEngine.removeEntity(this);

    }
    for (var i = 0; i < this.game.entities.length; i++) {
        var ent = this.game.entities[i];
        if (ent !== this && collide(this, ent)) {
            this.isCollide = true;

            if (this.x < ent.x) this.collideForward = true;
        }
    }
    if (this.isCollide) {
        if (this.collideForward) this.forward = false;
        else this.forward = true;
    }
    if ((Math.abs(this.x - this.game.entities[2].x) >= 400 )) this.standing = false;
    if (Math.abs(this.x - this.game.entities[2].x) <= 400 ) {
        this.timer += this.game.clockTick;
        if (this.timer >= 10 || this.timer === 0) {
            this.timer = 0;
            if (this.game.entities[2].standingStance === 1) {
                this.crouch = true;
                this.height = 40;
            }
            else if (Math.floor((Math.random() * 2) + 1) === 1) {
                this.crouch = true;
                this.height = 40;
            }
            else {
                this.crouch = false;
                this.height = 100;
            }
        }
        this.standing = true;
        if (this.x - this.game.entities[2].x < 0) this.forward = true;
        else this.forward = false;
        if (this.enemyShoot) {
            if (this.forward) {
                if (this.crouch) {
                    this.game.addEntity(new bulletFlash(this.game, AM.getAsset("./img/bulletFlash.png"),  this.x + 85, this.y + 55))
                    this.game.addEntity(new Bullet(this.game, this.x + 110, this.y + 60
                        , this.forward,this.firingStance, false, false, this.unitType, 300));
                }
                else {
                    this.game.addEntity(new bulletFlash(this.game, AM.getAsset("./img/bulletFlash.png"),  this.x + 85, this.y + 32))
                    this.game.addEntity(new Bullet(this.game, this.x + 110, this.y + 35, this.forward
                        ,this.firingStance, false, false, this.unitType, 300));
                }
            }
            else
                if (this.crouch) {
                    this.game.addEntity(new bulletFlash(this.game, AM.getAsset("./img/bulletFlash.png"),  this.x + 1, this.y + 55))
                    this.game.addEntity(new Bullet(this.game, this.x -15, this.y + 60, this.forward
                        ,this.firingStance, false, false, this.unitType, 300));
                }
                else {
                    this.game.addEntity(new bulletFlash(this.game, AM.getAsset("./img/bulletFlash.png"),  this.x - 1, this.y + 32))
                    this.game.addEntity(new Bullet(this.game, this.x - 15, this.y + 35, this.forward,this.firingStance, false
                        , false, this.unitType, 300));
                }
            this.enemyShoot = false;
            setTimeout(function(){
            enemyThat.enemyShoot = true;
        }, 900);
        }
    }
    else if (this.forward && (this.x - this.center < 100)){
        if (!this.isCollide) this.x += this.game.clockTick * this.speed;
        else {
            if(!this.collideForward) this.x += this.game.clockTick * this.speed;
        }
    }
    else if (((this.x - this.center) >= 100) && this.forward) {
        if (!this.isCollide) this.x -= this.game.clockTick * this.speed;
        else {
            if(this.collideForward) this.x -= this.game.clockTick * this.speed;
        }
        this.forward = false;
    }
    else if (!this.forward && (this.x - this.center > -100)) {
        if (!this.isCollide) this.x -= this.game.clockTick * this.speed;
            else {
                if(!this.collideForward) this.x -= this.game.clockTick * this.speed;
            }
        }
    else if (((this.x - this.center) <= -100) && !this.forward) {
        if (!this.isCollide) this.x += this.game.clockTick * this.speed;
        else {
            if(!this.collideForward) this.x += this.game.clockTick * this.speed;
        }
        this.forward = true;
    }
    Entity.prototype.update.call(this);
}

EnemySoldier.prototype.draw = function () {
	if (!this.game.running) return;
    if (this.forward) {
        if (this.standing) {
            if (this.crouch) this.enemyBackCrouch.drawFrame(this.game.clockTick, this.ctx
                , this.x - cameraX, this.y + cameraY + 20);
            else this.enemyFrontStand.drawFrame(this.game.clockTick, this.ctx
                , this.x - cameraX, this.y + cameraY);
        }
        else this.enemyFrontRun.drawFrame(this.game.clockTick, this.ctx, this.x - cameraX, this.y + cameraY);
    }
    else {
        if (this.standing) {
            if (this.crouch) this.enemyFrontCrouch.drawFrame(this.game.clockTick, this.ctx
                , this.x - cameraX, this.y + cameraY + 20);
            else this.enemyBackStand.drawFrame(this.game.clockTick, this.ctx, this.x - cameraX, this.y + cameraY);
        }
        else this.enemyBackRun.drawFrame(this.game.clockTick, this.ctx, this.x - cameraX, this.y + cameraY );
    }
    Entity.prototype.draw.call(this);
}
function bulletFlash(game, bulletFlashSprite, xCord, yCord) {
    this.bulletFlashActive = new Animation(bulletFlashSprite, this.x, this.y, 11, 11, 1, 0.1, 1, false);
    this.ctx = game.ctx;
    this.isDead = false;
    this.unitType = "flash";
    Entity.call(this, game, xCord, yCord);
}

bulletFlash.prototype = new Entity();
bulletFlash.prototype.constructor = bulletFlash;

bulletFlash.prototype.reset = function () {
}


bulletFlash.prototype.update = function () {
    enemyThat = this;
    if (this.isDead) this.removeFromWorld = true;
    setTimeout(function(){
        enemyThat.isDead = true;
    }, 500);
    Entity.prototype.update.call(this);
}

bulletFlash.prototype.draw = function () {
	if (!this.game.running) return;
    this.bulletFlashActive.drawFrame(this.game.clockTick, this.ctx, this.x - cameraX, this.y + cameraY);
    Entity.prototype.draw.call(this);
}
function FlyingRobot(game, backRunSprite, frontRunSprite, xCord, yCord, unitSpeed, health, scores) {
    this.flyingRobotBackRun = new Animation(backRunSprite, this.x, this.y, 52, 50, 2, 0.1, 2, true);
    this.flyingRobotFrontRun = new Animation(frontRunSprite, this.x, this.y, 53, 50, 2, 0.1, 2, true);
    this.speed = unitSpeed;
    this.height = 50;
    this.width = 52;
    this.enemy = true;
    this.unitType = "flyingRobot";
    this.ctx = game.ctx;
    this.health = health;
    this.forward = true;
    this.heroInRange = false;
    this.enemyShoot = true;
    this.center = xCord;
	this.scores = scores;
    Entity.call(this, game, xCord, yCord);
}

FlyingRobot.prototype = new Entity();
FlyingRobot.prototype.constructor = FlyingRobot;

FlyingRobot.prototype.reset = function () {
	this.enemy = true;
    this.forward = true;
    this.heroInRange = false;
    this.enemyShoot = true;
}

FlyingRobot.prototype.update = function () {
    var enemyThat = this;
    if (this.health <= 0) {
        this.isDead = true;
    }
    if (this.isDead) {
        this.removeFromWorld = true;
    }
    if ((Math.abs(this.game.entities[2].x - this.center) < 130)) this.heroInRange = true;
    else this.heroInRange = false;
    if ((Math.abs(this.x - this.game.entities[2].x) <= 200) && this.heroInRange) {
        if (Math.abs(this.x - (this.game.entities[2].x) - 15) < 5) {
            if (this.enemyShoot) {
                if (this.forward) {
                    this.game.addEntity(new bulletFlash(this.game, AM.getAsset("./img/bulletFlash.png"),  this.x + 25, this.y + 44))
                    this.game.addEntity(new Bullet(this.game, this.x + 30, this.y + 70, this.forward
                        ,this.firingStance,true, false,this.unitType, 300));
                }
                else {
                    this.game.addEntity(new bulletFlash(this.game, AM.getAsset("./img/bulletFlash.png"),  this.x + 15, this.y + 44))
                    this.game.addEntity(new Bullet(this.game, this.x + 20, this.y + 70, this.forward
                        ,this.firingStance,true, false,this.unitType, 300));
                }
                this.enemyShoot = false;
                setTimeout(function(){
                enemyThat.enemyShoot = true;
            }, 900);
            }
        }
        else if (this.x - this.game.entities[2].x > 10) {
            this.x -= this.game.clockTick * this.speed;
            this.forward = false;
        }
        else  {
            this.x += this.game.clockTick * this.speed;
            this.forward = true;
        }

    }
    else if (this.forward && (this.x - this.center < 100)) {
        this.x += this.game.clockTick * this.speed;
    }
    else if (((this.x - this.center) >= 100) && this.forward) {
        this.x -= this.game.clockTick * this.speed;
        this.forward = false;
    }
    else if (!this.forward && (this.x - this.center > -100)) {
        this.x -= this.game.clockTick * this.speed;
    }
    else if (((this.x - this.center) <= -100) && !this.forward) {
        this.x += this.game.clockTick * this.speed;
        this.forward = true;
    }
    Entity.prototype.update.call(this);
}

FlyingRobot.prototype.draw = function () {
	if (!this.game.running) return;
    if (this.forward) this.flyingRobotFrontRun.drawFrame(this.game.clockTick, this.ctx
        , this.x - cameraX, this.y + cameraY);
    else if (!this.forward) this.flyingRobotBackRun.drawFrame(this.game.clockTick, this.ctx
        , this.x - cameraX, this.y + cameraY);
    Entity.prototype.draw.call(this);

}
function Bullet(game, startX, startY, direction, firingStance, standing, unitFlying, unitType, speed) {
    this.isBullet = true;
    this.speed = speed;
    this.ctx = game.ctx;
    this.firingStance = firingStance;
    this.width = 2;
    this.height = 2;
    this.unitType = unitType;
    this.isFlying = unitFlying;
    this.gameGround = 610;
    this.standing = standing;
    this.startX = startX;
    this.forward = direction;
    Entity.call(this, game, startX, startY);
}

Bullet.prototype = new Entity();
Bullet.prototype.constructor = Bullet;

Bullet.prototype.reset = function () {
	//this.isBullet = true;
}


Bullet.prototype.update = function () {
    this.isCollide = false;
    this.collideForward = false
    for (var i = 0; i < this.game.entities.length; i++) {
        var ent = this.game.entities[i];
        if ((ent.unitType !== "flash") && ent !== this && collide(this, ent)) {
            this.isCollide = true;
            if (this.x < ent.x) this.collideForward = true;
        }
    }
    if (this.isCollide) {
        this.isDead;
    }
    if (this.unitType === "flyingRobot") {
        this.y += this.game.clockTick * this.speed;
    }
    if (this.forward) {
        if (this.x >= this.startX + 500 || this.y > this.gameGround) {
            this.removeFromWorld = true;
        }
        else if (!this.standing) this.x += this.game.clockTick * this.speed;
        else if (this.firingStance === 4) this.y -= this.game.clockTick * this.speed;
        else if (this.firingStance === 2) this.x += this.game.clockTick * this.speed;
        else if (this.firingStance === 3) {
            this.x += this.game.clockTick * this.speed;
            this.y -= this.game.clockTick * this.speed;
        }
        else if (this.firingStance === 1) {
            this.x += this.game.clockTick * this.speed;
            this.y += this.game.clockTick * this.speed;
        }
    }
    else {
        if (this.unitType === "giantRobot" && this.y > this.gameGround) this.firingStance = 2;
        if (this.x <= this.startX - 500 ) this.removeFromWorld = true;
        if ( this.y > this.gameGround && this.unitType !== "giantRobot") {
             this.removeFromWorld = true;
        }
        else if (!this.standing) this.x -= this.game.clockTick * this.speed;
        else if (this.firingStance === 4) this.y -= this.game.clockTick * this.speed;
        else if (this.firingStance === 2) this.x -= this.game.clockTick * this.speed;
        else if (this.firingStance === 3 && this.standing) {
            this.x -= this.game.clockTick * this.speed;
            this.y -= this.game.clockTick * this.speed;
        }
        else if (this.firingStance === 1 && this.standing) {
            this.x -= this.game.clockTick * this.speed;
            this.y += this.game.clockTick * this.speed;
        }
    }
    Entity.prototype.update.call(this);
}

Bullet.prototype.draw = function () {
	if (!this.game.running) return;
    if (this.unitType === "giantRobot") {
        this.ctx.fillStyle = "Yellow"; //Made it easier to see
        this.ctx.fillStyle = "rgb(0,255,0)";
        this.ctx.beginPath();
        this.ctx.arc(this.x - cameraX,this.y + cameraY ,10,0,8*Math.PI); //this might be wrong
        this.ctx.closePath();
        this.ctx.fill();

    }
    else {
        this.ctx.fillStyle = "Red"; //Made it easier to see
        this.ctx.fillStyle = "rgb(0,255,0)";
        this.ctx.beginPath();
        this.ctx.arc(this.x - cameraX,this.y + cameraY ,4,0,2*Math.PI); //this might be wrong
        this.ctx.closePath();
        this.ctx.fill();
    }
    Entity.prototype.draw.call(this);
}


AM.queueDownload("./img/runningHero.png");
AM.queueDownload("./img/backCrawl.png");
AM.queueDownload("./img/backwardHero.png");
AM.queueDownload("./img/backJump.png");
AM.queueDownload("./img/backwardStand.png");
AM.queueDownload("./img/frontJump.png");
AM.queueDownload("./img/frontStanding.png");
AM.queueDownload("./img/frontCrawl.png");
AM.queueDownload("./img/background.jpg");

AM.downloadAll(function () {
    var canvas = document.getElementById("gameWorld");
    var ctx = canvas.getContext("2d");

    var gameEngine = new GameEngine();
    gameEngine.init(ctx);
    gameEngine.start();

    gameEngine.addEntity(new Background(gameEngine, AM.getAsset("./img/background.jpg")));
    gameEngine.addEntity(new Hero(gameEngine, AM.getAsset("./img/runningHero.png"), AM.getAsset("./img/backwardHero.png"), AM.getAsset("./img/frontStanding.png")
        , AM.getAsset("./img/backwardStand.png"), AM.getAsset("./img/frontJump.png"), AM.getAsset("./img/backJump.png")
        , AM.getAsset("./img/bullet.png"), AM.getAsset("./img/backCrawl.png"), AM.getAsset("./img/frontCrawl.png")
        , AM.getAsset("./img/backCrawl.png")));
    gameEngine.addEntity(new EnemySoldier(gameEngine, AM.getAsset("./img/enemySoldier_Backward.png")
        , AM.getAsset("./img/enemySoldier_Foward.png"), AM.getAsset("./img/enemySoldier_StandingBackward.png")
        , AM.getAsset("./img/enemySoldier_StandingFoward.png"),AM.getAsset("./img/enemySoldier_CrouchFoward.png")
        , AM.getAsset("./img/enemySoldier_CrouchBackward.png"), 600, 524, 200, 3, 1000));

    gameEngine.addEntity(new FlyingRobot(gameEngine, AM.getAsset("./img/flyingRobot_Backward.png")
        , AM.getAsset("./img/flyingRobot_Forward.png"), 400, 100, 60, 2, 500));
    console.log("All Done!");
});