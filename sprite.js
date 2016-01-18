var Iterator = require('stupid-iterator');
var Imagesloader = require('stupid-imagesloader');
var Deferred = require('stupid-deferred'); 

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
	 * @define {boolean} Should sprite loop
	 */
	var loop = opts.loop === undefined ? true : opts.loop;

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
	 * @define {image} Current image
	 */
	var current;

	/**
	 * @define {image} Previous image
	 */
	var prev;

	/**
	 * @define {Iterator} Iterator object
	 */
	var iterator;

	/**
	 * @define {boolean} IsPlaying Boolean
	 */
	var isPlayingBOOL = false;

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
			current = images[0];

			/**
			 * Set frameHeight to images width if not set
			 */
			if(!frameHeight) frameHeight = images[0].width;

			/**
			 * Set canvas height to images height
			 */
			canvas.width = images[0].width;
			canvas.height = frameHeight;

			/**
			 * Resolve deferred when images is loaded
			 */
			def.resolve();
		});

		return def.promise;
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
		prev = false;
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
		 * Move the image up by substracting frameHeight
		 * if the frameOffset is heigher than the current image
		 * set current to next image
		 */
		frameOffset -= frameHeight;
		frameOffset %= current.height;
		if(frameOffset === 0) current = iterator.next(current);

		/**
		 * Check if the images has looped
		 */
		if(!Iterator.nextOrFalse(prev, images) 
		&& !Iterator.prevOrFalse(current, images)
		&& frameOffset === 0){
			/**
			 * If loop is set to false
			 * then pause the sprite
			 */
			if(!loop) pause();
		}

		/**
		 * This is use to check if the 
		 * sprite has looped
		 */
		prev = current;
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
	 * playFrom
	 * @example sprite.playFrom(24)
	 * @param {number} _frame Frame number to stat from
	 */
	function playFrom(_frame){
		/**
		 * Calc frameNumber 
		 */
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

	/*
	* Public
	*/

	self.load = load;
	self.play = play;	
	self.playFrom = playFrom;
	self.pause = pause;
	self.stop = stop;	
	self.reset = reset;	
	self.isPlaying = isPlaying;

	return self;
}

module.exports = Sprite;