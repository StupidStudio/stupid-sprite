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
	 * @define {number} Frame
	 */
	var frame = 0;

	/**
	 * @define {number} Max Frames
	 */
	var endFrame = 0;

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
	 * @define {object} timeline
	 */
	var timeline = [];	

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
			 * Set frameHeight to images width if not set
			 */
			if(!frameHeight) frameHeight = images[0].width;

			/**
			 * Set canvas height to images height
			 */
			canvas.width = images[0].width;
			canvas.height = frameHeight;

			/**
			 * Draw image
			 */
			ctx.drawImage(images[0], 0, 0);

			/**
			 * Create timeline
			 */
			createTimeline();

			/**
			 * Resolve deferred when images is loaded
			 */
			def.resolve();
		});

		return def.promise;
	}

	/**
	 * Create Timeline
	 * Loop through images and add them to timeline array.
	 * Add the image at key/frame and add offset for that position/frame.
	 * Calculate endframe
	 */
	function createTimeline(){
		for (var i = 0; i < images.length; i++) {
			var img = images[i];
			var imageFrames = img.height / frameHeight;
			for (var u = 0; u < imageFrames; u++) {
				timeline.push({
					image: img,
					offset: ((frameHeight * endFrame) % img.height) * -1
				});
				endFrame++;
			};
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
		isPlayingBOOL = true;
		tick.add(update);
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
		isPlayingBOOL = false;
		tick.remove(update);
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
		frame = -1;
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
		if(!isReverseBOOL){
			forward();	
		}else{
			backward();
		}

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
		var current = timeline[frame];
		ctx.drawImage(current.image, 0, current.offset);
	}

	function backward(){
		frame = frame <= 0 ? endFrame : frame;
		frame--;
		if(frame === 0){
			if(!loopBOOL) pause();
			event.trigger('ended');
		}
	}

	function forward(){
		frame++;
		frame = frame >= endFrame ? 0 : frame;	
		if(frame === endFrame - 1){
			if(!loopBOOL) pause();
			event.trigger('ended');
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
		frame = _frame - 1;

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
	 * Get frame
	 * @example sprite.getFrame()
	 * @return {number} frame
	 */
	function getFrame(){
		return frame;
	}

	/**
	 * Get end frame
	 * @example sprite.getEndFrame()
	 * @return {number} endFrame
	 */
	function getEndFrame(){
		return endFrame - 1;
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

	self.reverse = reverse;
	self.loop = loop;

	self.isPlaying = isPlaying;
	self.getFrame = getFrame;
	self.getEndFrame = getEndFrame;

	self.on = event.on;

	return self;
}

module.exports = Sprite;