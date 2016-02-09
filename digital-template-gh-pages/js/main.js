window.onload = function() {
    // You might want to start with a template that uses GameStates:
    //     https://github.com/photonstorm/phaser/tree/master/resources/Project%20Templates/Basic
    
    // You can copy-and-paste the code from any of the examples at http://examples.phaser.io here.
    // You will need to change the fourth parameter to "new Phaser.Game()" from
    // 'phaser-example' to 'game', which is the id of the HTML element where we
    // want the game to go.
    // The assets (and code) can be found at: https://github.com/photonstorm/phaser/tree/master/examples/assets
    // You will need to change the paths you pass to "game.load.image()" or any other
    // loading functions to reflect where you are putting the assets.
    // All loading functions will typically all be found inside "preload()".
    
    "use strict";

var game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update });

function preload() {

    game.load.image('sky', 'assets/sky.png');
    game.load.image('ground', 'assets/platform.png');
    game.load.image('star', 'assets/star.png');
    game.load.spritesheet('dude', 'assets/dude.png', 64, 96);
    game.load.image('bullet', 'assets/ball.png')
    game.load.audio('brerb', 'assets/Untitled2.wav')
    game.load.audio('brr', 'assets/brr.mp3')

}

var player;
var platforms;
var cursors;

var stars;
var score = 0;
var scoreText;

var bullets;
var fireRate = 250;
var nextFire = 0;
var addSize = 0;
var flexus = 0;

var brer;
var br;

function create() {

    //  We're going to be using physics, so enable the Arcade Physics system
    game.physics.startSystem(Phaser.Physics.ARCADE);

    //  A simple background for our game
    game.add.sprite(0, 0, 'sky');

    //  The platforms group contains the ground and the 2 ledges we can jump on
    platforms = game.add.group();

    //  We will enable physics for any object that is created in this group
    platforms.enableBody = true;

    // Here we create the ground.
    var ground = platforms.create(0, game.world.height - 64, 'ground');

    //  Scale it to fit the width of the game (the original sprite is 400x32 in size)
    ground.scale.setTo(2, 2);

    //  This stops it from falling away when you jump on it
    ground.body.immovable = true;

    //  Now let's create two ledges
    var ledge = platforms.create(400, 400, 'ground');
    ledge.body.immovable = true;

    ledge = platforms.create(-150, 170, 'ground');
    ledge.body.immovable = true;

    // The player and its settings
    player = game.add.sprite(128, game.world.height - 190, 'dude');

    //  We need to enable physics on the player
    game.physics.arcade.enable(player);

    player.body.bounce.y = 0.2;
    player.body.gravity.y = 2000;
    player.body.collideWorldBounds = true;

    player.animations.add('left', [0, 1, 2, 3], 20, true);
    player.animations.add('right', [5, 6, 7, 8], 20, true);
    player.animations.add('leftstatic', [3], 20, true);
    player.animations.add('rightstatic', [5], 20, true);
    player.animations.add('flex', [9, 4], 2, true);

    stars = game.add.group();

    stars.enableBody = true;

    //  Here we'll create 12 of them evenly spaced apart
    for (var i = 0; i < 12; i++)
    {
        var star = stars.create(i * 70, 0, 'star');

        //  Let gravity do its thing
        star.body.gravity.y = 3500;

        //  This just gives each star a slightly random bounce value
        star.body.bounce.y = 0.70 + (Math.random()*.3) ;
    }

    //  The score
    scoreText = game.add.text(16, 16, 'gains: 0', { fontSize: '32px', fill: '#000' });

    //  Our controls.
    cursors = game.input.keyboard.createCursorKeys();
    
    //  bullet codes from "Shoot the pointer"
    bullets = game.add.group();
    bullets.enableBody = true;
    bullets.physicsBodyType = Phaser.Physics.ARCADE;
    bullets.body.gravity.y = 2000;

    bullets.createMultiple(50, 'bullet');
    bullets.setAll('checkWorldBounds', true);
    bullets.setAll('outOfBoundsKill', true);
    
    brer = game.add.audio('brerb');
    br = game.add.audio('brr');
    
}

function update() {

    //  Collide the player and the stars with the platforms
    game.physics.arcade.collide(player, platforms);
    game.physics.arcade.collide(stars, platforms);

    //  Checks to see if the player overlaps with any of the stars, if he does call the collectStar function
    game.physics.arcade.overlap(player, stars, collectStar, null, this);

    //  Reset the players velocity (movement)
    player.body.velocity.x = 0;

    if (cursors.left.isDown)
    {
        //  Move to the left
        player.body.velocity.x = -400 - flexus;
        if (player.body.touching.down)
        {
            player.animations.play('left');
        }
        else
        {
            player.animations.play('leftstatic');
        }
    }
    else if (cursors.right.isDown)
    {
        //  Move to the right
        player.body.velocity.x = 400 + flexus;
        if (player.body.touching.down)
        {
            player.animations.play('right');
        }
        else
        {
            player.animations.play('rightstatic');
        }
    }
    else if (cursors.down.isDown && player.body.touching.down)
    {
        player.animations.play('flex');
    }

    else
    {
        //  Stand still
        player.animations.stop();

        player.frame = 4;
    }
    
    //  Allow the player to jump if they are touching the ground.
    if (cursors.up.isDown && player.body.touching.down)
    {
        player.body.velocity.y = -1000 -flexus;
    }
    
    if (game.input.activePointer.isDown)
    {
        fire();
    }
    

}

function collectStar (player, star) {
    
    // Removes the star from the screen
    star.kill();
    player.body.gravity.y += 200;
    //  Add and update the score
    score += 10;
    scoreText.text = 'gains: ' + score;
    addSize += .04;
    player.scale.setTo(1 + addSize, 1 + addSize);

}

function fire() {
    player.animations.play('flex');
    flexus += 5
    if (game.time.now > nextFire && bullets.countDead() > 0)
    {
        addSize += .03
        player.scale.setTo(1 + addSize, 1 + addSize);
        nextFire = game.time.now + fireRate;

        var bullet = bullets.getFirstDead();

        bullet.reset(player.x - 8, player.y - 8);

        game.physics.arcade.moveToPointer(bullet, 300);
    }
}
};
