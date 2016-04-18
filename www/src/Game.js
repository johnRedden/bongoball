/* jshint browser:true */
// create BasicGame Class
BasicGame = {

};

// create Game function in BasicGame
BasicGame.Game = function (game) {

};

// set Game function prototype
BasicGame.Game.prototype = {

    init: function () {
        // set up input max pointers
        this.input.maxPointers = 2;
        // set up stage disable visibility change
        this.stage.disableVisibilityChange = true;
        // Set up the scaling method used by the ScaleManager
        // Valid values for scaleMode are:
        // * EXACT_FIT
        // * NO_SCALE
        // * SHOW_ALL
        // * RESIZE
        // See http://docs.phaser.io/Phaser.ScaleManager.html for full document
        this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        // If you wish to align your game in the middle of the page then you can
        // set this value to true. It will place a re-calculated margin-left
        // pixel value onto the canvas element which is updated on orientation /
        // resizing events. It doesn't care about any other DOM element that may
        // be on the page, it literally just sets the margin.
        this.scale.pageAlignHorizontally = true;
        this.scale.pageAlignVertically = true;
        // Force the orientation in landscape or portrait.
        // * Set first to true to force landscape. 
        // * Set second to true to force portrait.
        this.scale.forceOrientation(true, false);
        // Sets the callback that will be called when the window resize event
        // occurs, or if set the parent container changes dimensions. Use this 
        // to handle responsive game layout options. Note that the callback will
        // only be called if the ScaleManager.scaleMode is set to RESIZE.
        this.scale.setResizeCallback(this.gameResized, this);
        // Set screen size automatically based on the scaleMode. This is only
        // needed if ScaleMode is not set to RESIZE.
        this.scale.updateLayout(true);
        // Re-calculate scale mode and update screen size. This only applies if
        // ScaleMode is not set to RESIZE.
        this.scale.refresh();
        
        //bongoBall start init
        this.stage.backgroundColor = '#ADD8E6'; //white
        this.world.alpha = 1;
		
		this.physics.startSystem(Phaser.Physics.P2JS);
		this.physics.p2.restitution = 0.9; //this gives bounce
		this.physics.p2.gravity.y = 500;
        
        //Set collision groups http://phaser.io/examples/v2/p2-physics/collision-groups
		this.physics.p2.setImpactEvents(true);
		//  Create our collision groups. 
		this.blueBirdCollisionGroup = this.physics.p2.createCollisionGroup();
        this.boundaryCollisionGroup = this.physics.p2.createCollisionGroup();
        this.bongoBallCollisionGroup = this.physics.p2.createCollisionGroup();
        this.deathRockCollisionGroup = this.physics.p2.createCollisionGroup();
		this.physics.p2.updateBoundsCollisionGroup();
        

    },

    preload: function () {

        this.load.audio('ballHit', ['asset/voice.wav']);
        
        this.load.image('logo', 'asset/BongoLogo.png');
        this.load.image('grabber', 'asset/BongoGrabberTexture.png');
        this.load.image('ball', 'asset/BongoBall.png');
        //this.load.image('blueball', 'asset/BongoBallBlue.png');
        this.load.image('paddle', 'asset/cageBunny.png');
        this.load.image('cloud', 'asset/cloud.png');
        
        this.load.image('cloud', 'asset/cloud.png');
        this.load.spritesheet("deathrock", "asset/image03.png", 64, 64, 1);
        //this.load.spritesheet("deathrock", "asset/rock_death.png", 90, 79, 2);
        this.load.spritesheet("bluebird", "asset/blueButterfly.png", 64, 64, 6);
    },

    create: function () {
        
        this.clouds = this.add.group();
        
        for(var i = 0; i<5; i++){
			var cloud = this.clouds.create(this.rnd.integerInRange(-50,this.world.width),this.rnd.integerInRange(30,200),'cloud');
            cloud.angle=this.rnd.integerInRange(-20,20);
            var rand = this.rnd.realInRange(0.4, 1);
            cloud.scale.setTo(rand,rand);
            cloud.alpha = this.rnd.realInRange(0.6, 1);;
		}
        // Add logo to the center of the stage
        this.logo = this.add.sprite(30,30,'logo');
        //this.logo.anchor.setTo(0.5, 0.5);
        
        this.blueBirds = this.add.group();
        
        for(var i = 0; i<100; i++){
			var bird = this.blueBirds.create(
                this.rnd.integerInRange(-50,this.world.width),
                this.rnd.integerInRange(30,200),
                'bluebird');
            bird.animations.add("fly");
            bird.anchor.setTo(0.5, 0.5);
            bird.animations.play("fly", this.rnd.integerInRange(8,20), true);
            bird.angle=this.rnd.integerInRange(-5,5);
            var rand = this.rnd.realInRange(0.3, 0.7);
            bird.scale.setTo(rand,rand);
		}
        this.physics.p2.enable(this.blueBirds, false);
        
        this.blueBirds.children.forEach(function(bird){
            bird.body.setCircle(18);
            bird.body.mass = 1;
            bird.body.static = true;
            //bird.body.fixedRotation = true;
            bird.body.collideWorldBounds = false;
            bird.body.velocity.x = this.rnd.integerInRange(150,350);
            //bird.body.velocity.y =-20;
            bird.body.setCollisionGroup(this.blueBirdCollisionGroup);
			bird.body.collides([this.bongoBallCollisionGroup],this.birdHit,this);  //collides with others too
        },this);
        
                
        // global vars
        this.leftBoundaryX = this.world.width/4;
        this.rightBoundaryX = this.world.width - this.leftBoundaryX;
        //elastic bands
        this.line1 = this.add.graphics(0,0);
        this.line2 = this.add.graphics(0,0);
        
        //sound stuff
        this.ballHitSnd =  this.add.audio('ballHit');
		//add start marker to rock hit sound
		this.ballHitSnd.addMarker('ballHitStart',0.35,0.5);
        
        this.setBoardLines();
        this.setBoardScores();
        
        // Adds the death rock 
        this.deathRocks = this.add.group();
        
        for(var i = 0; i<1; i++){
			var rock = this.deathRocks.create(this.leftBoundaryX+100,this.world.height+20,'deathrock');
            rock.animations.add("toheaven");
            rock.anchor.setTo(0.5, 0.5);
            rock.animations.play("toheaven", 4, true);
		}
        this.physics.p2.enable(this.deathRocks, false);
        
        this.deathRocks.children.forEach(function(rock){
            rock.body.setCircle(18);
            rock.body.fixedRotation = true;
            rock.body.collideWorldBounds = false;
            rock.body.setCollisionGroup(this.deathRockCollisionGroup);
			rock.body.collides([this.bongoBallCollisionGroup,
                                this.deathRockCollisionGroup,
                                this.boundaryCollisionGroup]);  //collides with others too
            //rock.body.collides(this.boundaryCollisionGroup);
        },this);
        
        // Add two grabbers to the stage
        this.grabber1 = this.add.sprite(50, this.world.centerY,'grabber');
        this.grabber1.anchor.setTo(0.5, 0.5);
        this.physics.p2.enable(this.grabber1, false);
        this.grabber1.body.static = true;  //not affected by gravity
        
        this.grabber2 = this.add.sprite(this.world.width-50,this.world.centerY,'grabber');
        // Set the anchor to the center of the sprite
        this.grabber2.anchor.setTo(0.5, 0.5);
        this.physics.p2.enable(this.grabber2, false);
        this.grabber2.body.static = true;
        
        // Add bongoball to stage  ******************************
        this.bongoball = this.add.sprite(
            this.world.centerX, // 
            this.world.centerY+50,
            'paddle');
        // Set the anchor to the center of the sprite
        this.bongoball.anchor.setTo(0.5, 0.5);
        
        // turn false the collision circle in production
		this.physics.p2.enable(this.bongoball, false); //change to true to see hitcircle
		//this.bongoball.body.setCircle(10);
        this.bongoball.body.fixedRotation = true;
		this.bongoball.body.collideWorldBounds = false;
        this.bongoball.body.mass = 0.5;
		this.bongoball.body.velocity.x = 50;
		this.bongoball.body.velocity.y = 0;
        this.bongoball.body.setCollisionGroup(this.bongoBallCollisionGroup);
        this.bongoball.body.collides([this.deathRockCollisionGroup,
                                     this.blueBirdCollisionGroup],this.ballHit,this);
        
        //this.bongoball.body.onBeginContact.add(this.ballHit, this);        
        //**************************** bongoball stuff
        
        //springs
        var restLength = 50;
        var stiffness = 30;
        var damping = 7;
        
        this.spring1 = this.physics.p2.createSpring(this.bongoball, this.grabber1, restLength, stiffness, damping );
        this.spring2 = this.physics.p2.createSpring(this.bongoball, this.grabber2, restLength, stiffness, damping );
            
        

        //input for game
        this.grabber1.inputEnabled = true;
        this.grabber2.inputEnabled = true;
        
        this.grabber1.events.onInputDown.add(this.onDown,this);
        this.grabber1.events.onInputUp.add(this.onUp,this);
        
        this.grabber2.events.onInputDown.add(this.onDown,this);
        this.grabber2.events.onInputUp.add(this.onUp,this);
        
        this.input.addMoveCallback(this.onMove,this);
        

    },    
    onDown: function(sprite, pointer){
        sprite.ptr = pointer;
    },
    onUp: function(sprite, pointer){
        sprite.ptr = null;
    },
    onMove: function(pointer,x,y){
        // game has a max of two pointers
        if(this.grabber1.ptr === pointer){
            if(pointer.x <= this.leftBoundaryX)
                this.grabber1.body.x = pointer.x;
            this.grabber1.body.y = pointer.y;
        }
        if(this.grabber2.ptr === pointer){
            if(pointer.x>=this.rightBoundaryX)
                this.grabber2.body.x = pointer.x;
            this.grabber2.body.y = pointer.y;
        }
        
    },
    update: function(){
        this.setElastic();
        this.clouds.children.forEach(function(cloud){
            if(cloud.x>this.world.width){
                cloud.x = -10;
                cloud.angle=this.rnd.integerInRange(-20,20);
            }else{
                cloud.x+=0.5;
            }
        },this);
        this.blueBirds.children.forEach(function(bird){
            if(bird.x>this.world.width){
                bird.body.x = -10;
                bird.angle=this.rnd.integerInRange(-5,5);
            }else{
                if(bird.body.y<0){
                    bird.body.y+=2;
                }else if(bird.body.y>this.world.centerY){
                    bird.body.y-=2;
                }else{
                    bird.body.y+=this.rnd.integerInRange(-2,2);
                }
                
                
            }
        },this);
        this.deathRocks.children.forEach(function(rock){
            if(rock.body.y<0){
                rock.body.y = this.world.height-10;
                rock.body.velocity.y = 10; 
                rock.angle=0;
                this.passTxt.setText('Passes: '+ ++this.passes);
                this.seqScore = 0;
                //play pass sound here   
            }else if(rock.body.y>this.world.height+60){
                rock.body.y = this.world.height-10;
                rock.body.velocity.y = 10; 
                rock.angle=0;         
            }else{
                rock.body.velocity.y-=this.rnd.integerInRange(0,25);
                rock.body.velocity.x+=this.rnd.integerInRange(-35,35);
                rock.angle+=this.rnd.integerInRange(-2,2);
            }
            if(rock.body.x<this.leftBoundaryX || rock.body.x>this.rightBoundaryX){
                rock.body.x = this.world.centerX;
            }
            
        },this);
    },
    
    setElastic: function(){
        this.line1.clear();
        this.line1.lineStyle(2, 0xdeb887, 1);
        this.line1.moveTo(this.grabber1.body.x, this.grabber1.body.y);
        this.line1.lineTo(this.bongoball.body.x, this.bongoball.body.y);
        this.line2.clear();
        this.line2.lineStyle(2, 0xdeb887, 1);
        this.line2.moveTo(this.grabber2.body.x, this.grabber2.body.y);
        this.line2.lineTo(this.bongoball.body.x, this.bongoball.body.y);
    },
    setBoardLines: function(){
        var leftline = this.add.graphics(0,0);
        leftline.lineStyle(5, 0xFFD700, 1);
        leftline.moveTo(0, 0);
        leftline.lineTo(0, this.world.height);
        
        this.physics.p2.enable(leftline, false);
        leftline.body.static = true;
        leftline.body.x = this.leftBoundaryX;
        leftline.body.setRectangle(20,this.world.height*2);
 
        var rightline = this.add.graphics(0,0);
        rightline.lineStyle(5, 0xFFD700, 1);
        rightline.moveTo(0, 0);
        rightline.lineTo(0, this.world.height);
        
        this.physics.p2.enable(rightline, false);
        rightline.body.static = true;
        rightline.body.x = this.rightBoundaryX;
        rightline.body.setRectangle(20,this.world.height*2);
        
        leftline.body.setCollisionGroup(this.boundaryCollisionGroup);
        leftline.body.collides([this.deathRockCollisionGroup]);
        rightline.body.setCollisionGroup(this.boundaryCollisionGroup);
        rightline.body.collides([this.deathRockCollisionGroup]);
      
    },
    setBoardScores: function(){
        this.passes = 0;
        this.score = 0;
        this.seqScore = 0;
        this.styleScore = { font: "bold 16px Arial ", fill: "#8B4513", align: "center" };
        
        this.passTxt = this.add.text(this.rightBoundaryX+10, 30, 'Passes: ' + this.passes, this.styleScore);
        this.scoreTxt = this.add.text(this.rightBoundaryX+10, 60, 'Score: ' + this.score, this.styleScore);
        //this.passes.anchor.setTo(.5, .5);
    },
    ballHit: function(sprite){
        this.ballHitSnd.play('ballHitStart',0,this.rnd.realInRange(1,2));//last arg is random volume
        this.seqScore+=5;
        this.score += this.seqScore;
        this.scoreTxt.setText('Score: '+ this.score);
        this.stylePoints = { font: "bold 14px Arial ", fill: "#fff", align: "center" };
        var pointsTxt = this.add.text(this.bongoball.body.x, this.bongoball.y, "+"+this.seqScore, this.stylePoints);
        
        this.game.add.tween(pointsTxt).to({
				y:	100,
				alpha:	0
			}, 1800, Phaser.Easing.Linear.In).start().onComplete.add(function(){
               pointsTxt.destroy();
            }, this);
    },
    birdHit: function(body){
        //console.log(sprite);
        body.angularVelocity = this.rnd.integerInRange(8,20);
        this.game.add.tween(body).to({
                x: this.rnd.integerInRange(0,this.world.width),
				y: 0,
				alpha:	0
			}, 500, Phaser.Easing.Linear.In).start().onComplete.add(function(){
                body.sprite.kill();
                if(this.blueBirds.countDead()===5){
                    this.spawnBirds();
                }
                
            }, this);
        
        
    },
    spawnBirds: function(){
        this.blueBirds.children.forEach(function(bird){
            bird.body.x = this.rnd.integerInRange(-50,this.world.width);
            bird.body.y = this.rnd.integerInRange(30,200);
            bird.body.setCircle(20);
            bird.body.mass = 1;
            bird.body.static = true;
            bird.body.angle = 0;
            bird.body.angularVelocity = 0;
            bird.body.collideWorldBounds = false;
            bird.body.velocity.x = this.rnd.integerInRange(150,350);
            bird.body.setCollisionGroup(this.blueBirdCollisionGroup);
			bird.body.collides([this.bongoBallCollisionGroup],this.birdHit,this);  //collides with others too
            bird.revive();
        },this);
        
    },

    gameResized: function (width, height) {

        // This could be handy if you need to do any extra processing if the 
        // game resizes. A resize could happen if for example swapping 
        // orientation on a device or resizing the browser window. Note that 
        // this callback is only really useful if you use a ScaleMode of RESIZE 
        // and place it inside your main game state.

    }

};