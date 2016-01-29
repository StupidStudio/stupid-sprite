var Iterator = require('stupid-iterator');
var Imagesloader = require('stupid-imagesloader');
var Deferred = require('stupid-deferred'); 
var Event = require('stupid-event');

/**
 * Sprite
 * @constructor
 */
function Sprite(opts){
 	/**
     * @define {object} Collection of public methods.
     */
    var self = {};

    /**
     * @define {object} Options for the constructor 
     */
    var opts = opts || {};

    /**
     * @define {element} Canvas element
     */
	var canvas = opts.canvas;

	/**
	 * @define {element} Canvas 2d context
	 */
	var ctx = canvas.getContext('2d');

	/**
	 * @define {Tick} Tick object
	 */
	var tick = opts.tick;
	
	/**
	 * @define {Imagesloader} Create a image loader object
	 */
	var imagesLoader = Imagesloader();

	/**
	 * @define {Event} Event system
	 */
	var event = Event();

	/**
	 * @define {boolean} Should sprite loop
	 */
	var loopBOOL = opts.loop === undefined ? true : opts.loop;

	/**
	 * @define {array} Image array
	 */
	var images;

	/**
	 * @define {number} Single image frame height
	 */
	var frameHeight = opts.frameHeight;

	/**
	 * @define {number} Frame offset
	 */
	var frameOffset = 0;

	/**
	 * @define {number} Frame
	 */
	var frame = 0;

	/**
	 * @define {number} Max Frames
	 */

	 var maxFrames = 0;

	/**
	 * @define {image} Current image
	 */
	var current;

	/**
	 * @define {Iterator} Iterator object
	 */
	var iterator;

	/**
	 * @define {boolean} IsPlaying Boolean
	 */
	var isPlayingBOOL = false;

	/**
	 * @define {boolean} Reserve
	 */
	var isReverseBOOL = false;

	/**
	 * Load images
	 * @example sprite.load(array).success(function)
	 * @param {array} _urls An array of url strings 
	 * @config {Deferred} def Create deferred object
	 * @return {Deferred Promise} Return deferred promise
	 */
	function load(_urls){
		var def = Deferred();

		/**
		 * Load images
		 */
		imagesLoader.load(_urls).success(function(_imgs){

			/**
			 * Set _imgs to images 
			 */
			images = _imgs;
			
			/**
			 * Create Iterator object and set current to first image
			 */
			iterator = Iterator.create(images[0], images);
			current = iterator.get();

			/**
			 * Set frameHeight to images width if not set
			 */
			if(!frameHeight) frameHeight = current.width;

			/**
			 * Set canvas height to images height
			 */
			canvas.width = current.width;
			canvas.height = frameHeight;

			/**
			 * Calculate Max Frames
			 */
			calculateMaxFrames(images);

			/**
			 * Resolve deferred when images is loaded
			 */
			def.resolve();
		});

		return def.promise;
	}

	/**
	 * Calculate Max Frames 
	 * by loopen images and frame dimensions by the images height
	 */
	function calculateMaxFrames(){
		for (var i = 0; i < images.length; i++) {
			maxFrames += images[i].height / frameHeight;
		};
	}

	/**
	 * Play sprite
	 * @example sprite.play()
	 */
	function play(){
		/**
		 * Add to tick object
		 * set isPlaying to true
		 */
		tick.add(update);
		isPlayingBOOL = true;
		event.trigger('started');
	}

	/**
	 * Pause sprite
	 * @example sprite.pause()
	 */
	function pause(){
		/**
		 * Remove object from tick
		 * set isPlaying to false
		 */
		tick.remove(update);
		isPlayingBOOL = false;
		event.trigger('paused');
	}

	/**
	 * Reset sprite
	 * @example sprite.reset()
	 */
	function reset(){
		/**
		 * Reset to sprite to reset
		 * Set current to first image
		 */
		current = images[0];
		frame = 0;
	}

	/**
	 * Stop sprite
	 * @example sprite.stop()
	 */
	function stop(){
		pause();
		reset()
		update();
	}

	/**
	 * Update method for the tick
	 */
	function update(){
		clear();
		draw();
		event.trigger('update', frame, isReverseBOOL);
	}

	/**
	 * Clear the canvas before drawing
	 */
	function clear(){
		ctx.clearRect(0, 0, canvas.width, canvas.height);
	}

	/**
	 * Draw the images to the canvas
	 */
	function draw(){
		/**
		 * Draw image with frameOffset
		 */
		ctx.drawImage(current, 0, frameOffset);

		/**
		 * Move image foward or backwards
		 */
		if(!isReverseBOOL){
			forward();	
		}else{
			backward();
		}
	}

	function backward(){
		/**
		 * If frameOffset is 0
		 * set current and frameOffset to prev and current height
		 */
		if(frameOffset === 0){
			current = iterator.prev(current);
			frameOffset = current.height * -1;
		}

		/**
		 * Iterate frameOffset with frameHeight
		 */
		frameOffset += frameHeight;
		
		/**
		 * Iterate on frame
		 */
		if(frame <= 0) frame = maxFrames;
		frame--;

		/**
		 * If current is first and frameOffset 0
		 * trigger ended and if Loop false then pause
		 */
		if(iterator.isFirst() && frameOffset === 0){
			if(!loopBOOL) pause();
			event.trigger('ended');
		} 
	}

	function forward(){
		/**
		 * Iterate frameOffset with frameHeight
		 * if larger the current.height the set to 0
		 */
		frameOffset -= frameHeight;
		frameOffset %= current.height;

		/**
		 * Iterate on frame
		 */
		frame++;
		frame %= maxFrames;

		/**
		 * If frameOffset equals 0
		 * set current to next
		 * and if first in array the trigger ended
		 * and trigger pause if loop false
		 */
		if(frameOffset === 0){
			current = iterator.next(current);
			if(iterator.isFirst()){
				if(!loopBOOL) pause();
				frame = 0;
				event.trigger('ended');
			} 
		}
	}

	/**
	 * playFrom
	 * @example sprite.playFrom(24)
	 * @param {number} _frame Frame number to stat from
	 */
	function playFrom(_frame){
		/**
		 * Calc frame 
		 */
		frame = _frame;
		var frameNumber = _frame * frameHeight;
		var offset = 0;

		/**
		 * Loop through images to find 
		 * next current image to start from
		 */
		for (var i = 0; i < images.length; i++) {
			offset += images[i].height;
			/**
			 * If frameNumber is less than the added images height
			 * the set the current image, and set frameOffset and iterator
			 * to the new current
			 */
			if(frameNumber < offset){
				current = images[i];
				iterator.set(current);
				frameOffset = frameNumber % current.height;
				break;
			}
		};

		/**
		 * Start tick
		 * And set boolean
		 */
		tick.add(update);
		isPlayingBOOL = true;
	}

	/**
	 * Is sprite playing
	 * @example sprite.isPlaying()
	 * @return {boolean} isPlayingBOOL
	 */
	function isPlaying(){
		return isPlayingBOOL;
	}

	/**
	 * Reverse
	 * @example sprite.reverse()
	 */
	function reverse(_bool){
		if(_bool != undefined){
			isReverseBOOL = _bool;
		}else{
			isReverseBOOL = !isReverseBOOL;
		}
	}

	/**
	 * Loop
	 * @example sprite.loop()
	 */
	function loop(_bool){
		if(_bool != undefined){
			loopBOOL = _bool;
		}else{
			loopBOOL = !loopBOOL;
		}
	}

	/*
	* Public
	*/

	self.load = load;
	self.play = play;	
	self.playFrom = playFrom;
	self.pause = pause;
	self.stop = stop;	
	self.reset = reset;	

	self.on = event.on;
	self.reverse = reverse;
	self.loop = loop;

	self.isPlaying = isPlaying;

	return self;
}

module.exports = Sprite;