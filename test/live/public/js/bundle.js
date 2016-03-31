(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * @fileoverview Simple deferred lib.
 * @author david@stupid-studio.com (David Adalberth Andersen)
 */

/** Import the Event system */
var Event = require('stupid-event');

/**
 * Deferred
 * @constructor
 */
function Deferred(opts){
 	/**
	 * @define {object} Collection of public methods.
	 */
	var self = {};

	/**
	 * @define {object} options for the constructor 
	 */
	var opts = opts || {};

	/**
	 * @define {object} A promise object that will be returned
	 */
	var promise = {};

	/**
	 * @define {object} Event system for controlling events
	 */
	var event = Event();
	
	/**
	 * Promise then method
	 * This is for chaining promis callbacks
	 * @example promiseFunction().then(
	 * function(){ // success }, 
	 * function(){ // rejected }, 
	 * function(){ // notify } 
	 * ).then( ... );
	 * @param {function} sucess Success callback
	 * @param {function} reject Reject callback
	 * @param {function} notify notify callback
	 * @return {object} Returns the promise object
	 */
	function promiseThen(success, reject, notify){
		/**
		 * @define {object} Return a new promise
		 */
		var def = Deferred();

		/**
		 * Resolved promise
		 * @example example
		 * @param {string} A string key for the event system
		 * @param {function} A callback when event is triggered
		 * @return {object} Returns promise object
		 */
		event.on('resolve', function(){ 
			/**
			 * If the success callback returns a promise
			 * then resolve/reject/notify that returned promise
			 */
			var promise = success();
			if(!promise) return;
			promise.success(function(){
				/** handle the returned deferred object */
				def.resolve();
			});
			promise.error(function(){
				def.reject();
			});
			promise.notify(function(){
				def.notify();
			});
		});

		/**
		 * If promise is rejected/notify trigger the callback
		 */
		event.on('reject', function(){ 
			if(reject) reject();
		});

		event.on('notify', function(){ 
			if(notify) notify();
		});

		/**
		 * @return {object} Returns a promise object
		 */
		return def.promise; 
	}

	/**
	 * Promise methods
	 * @example promise.then( //new promise ).then(...)
	 * @example promise.success(...).error(...).notify(...)
	 * @param {function} callback A callback for the promise
	 * @return {object} Return the promise
	 */
	function promiseSuccess(callback){
		event.on('resolve', callback);
		return promise;
	}

	function promiseError(callback){
		event.on('reject', callback);
		return promise;
	}

	function promiseNotified(callback){
		event.on('notify', callback);
		return promise;
	}

	/**
	 * Deferred methods to trigger the promise
	 * @example def.resolve(args)
	 * @example def.reject(args)
	 * @example def.notify(args)
	 */
	function resolve(){
		var args = Array.prototype.slice.call(arguments);
		event.trigger('resolve', args);
	}

	function reject(){
		var args = Array.prototype.slice.call(arguments);
		event.trigger('reject', args);	
	}

	function notify(){
		var args = Array.prototype.slice.call(arguments);
		event.trigger('notify', args);		
	}

	/**
	 * Add the promise methods to the promise object
	 */
	promise.then = promiseThen;
	promise.success = promiseSuccess;
	promise.error = promiseError;
	promise.notify = promiseNotified;

	/**
	 * The promise object
	 * @public {object}
	 */
	self.promise = promise;

	/**
	 * Deferred public methods	
	 * @public {function}
	 */
	self.resolve = resolve;
	self.reject = reject;
	self.notify = notify;

	/**
	 * @return {object} return public methos
	 */
	return self;
}

/** @export */
module.exports = Deferred;
},{"stupid-event":2}],2:[function(require,module,exports){
/**
 * @fileoverview Simple event system.
 * @author david@stupid-studio.com (David Adalberth Andersen)
 */

/**
 * Event
 * @constructor
 */
function Event(opts){
	/**
	 * @define {object} Collection of public methods.
	 */
	var self = {};

	/**
	 * @define {object} options for the constructor 
	 */
	var opts = opts || {};

	/**
	 * @define {object} collection the event names as
	 * an identifyer for later calls
	 */
	var event = {};

	/**
	 * @define {object} collection of precalled events
	 */
	var queue = {};

	/**
	 * On method for collection the event calls
	 * @example event.on('custom-event', function(){ //do something });
	 * @param {string} key A string identifyer
	 * @param {function} call A callback for the identifyer
	 * @config {object} event[key] Set object[key] to array if not set
	 */
	function on(key, call){
		if(!event[key]) event[key] = [];

		/** add event */
		addEvent(key, call);
		
		/** if the event has been triggered before created, then trigger it now */
		if(queue[key]) call.apply(null, queue[key]);
	}

	/**
	 * Add event to events and override if it is the same
	 * @param {string} key A string identifyer
	 * @param {function} call A callback for the identifyer
	 */
	function addEvent(key, call){
		/**
		 * @define {boolean} if the function is the same,
		 * boolean will be set to true
		 */
		var same = false;
		/**
		 * Loop through the events on key
		 * This is for comparing two anonymous
		 */
		for (var i = 0; i < event[key].length; i++) {
			/** If anonymous function is the same set boolean to true */
			if(call.toString() === event[key][i].toString()){
				same = true;
				/** override the current callback */
				event[key][i] = call;
				break;
			}
		};
		/** If the functions isnt the same, push to call stack */
		if(opts.forcePush || !same) event[key].push(call);
	}

	/**
	 * Trigger the event
	 * @example event.trigger(key, params)
	 * @param {string} key The key for event objet
	 */
	function trigger(key){
		var events = event[key];
		/**
		 * @define {array} takes the arguments and removes the first param
		 */
		var args = Array.prototype.slice.call(arguments).slice(1);

		/** If first argument is an array, pass it as argument */
		if(arguments.length === 2 && arguments[1].constructor == Array) args = arguments[1];
		
		if(events){
			/** Trigger the events by the current key */
			for (var i = 0; i < events.length; i++) {
				events[i].apply(null, args);
			};
		}else{
			/**
			 * If the trigger method is call before any key is added
			 * save the key and params for to be called later
			 */
			queue[key] = args;
		}
	}

	/**
	 * Public methods
	 * @public {function}
	 */
	self.on = on;
	self.trigger = trigger;

	/**
	 * @return {object} return public methods
	 */
	return self;
}

/** @export */
module.exports = Event;
},{}],3:[function(require,module,exports){
arguments[4][2][0].apply(exports,arguments)
},{"dup":2}],4:[function(require,module,exports){
var Deferred = require('stupid-deferred')
var Imageloader = require('stupid-imageloader');

/**
 * Image collection loader
 * @constructor
 */
function Imagesloader(opts){
	/**
     * @define {object} Collection of public methods.
     */
    var self = {};

    /**
     * @define {object} Options for the constructor 
     */
    var opts = opts || {};

    /**
	 * @define {object} A image loader object
	 */
	var imageloader = Imageloader();

    /**
     * @define {array} A holder for when an image is loaded
     */
	var imgs = [];

	/**
	 * @define {array} A holder for the image src that should be loaded
	 */
	var srcs = [];

	/**
	 * @define {object} A promise container for promises
	 */
	var def;

	/**
	 * Load a collection of images
	 * @example imageloader.load(['img1.jpg', 'img2.jpg', 'img3.jpg']).success(function(){ // Do something });
	 * @param {array} images A collection of img object or img.src (paths)
	 * @config {object} def Create a promise object
	 * @return {object} Return the promise object
	 */
	function load(images){
		def = Deferred();
		
		/**
		 * Check if the images is img objects or image src
		 * return string of src
		 */
		srcs = convertImagesToSrc(images);

		/**
		 * Loop through src's and load image
		 */
		for (var i = 0; i < srcs.length; i++) {
			imageloader.load(srcs[i])
			.success(function(img){

				/** call imageloaded a pass the img that is loaded */
				imageLoaded(img);
			})
			.error(function(msg){
				def.reject(msg + ' couldn\'t be loaded');
			});
		};
		return def.promise;
	}

	/**
	 * Image loaded checker
	 * @param {img} img The loaded image
	 */
	function imageLoaded(img){

		/** Notify the promise */
		def.notify("notify");

		/** Add the image to the imgs array */
		imgs.push(img);

		/** If the imgs array size is the same as the src's */
		if(imgs.length == srcs.length){

			/** First sort images, to have the same order as src's */
			sortImages();

			/** Resolve the promise with the images */
			def.resolve(imgs);
		}
	}

	/**
	 * Convert img to src
	 * @param {array} imgs A collection og img/img paths
	 * @config {array} src A temporally array for storing img path/src
	 * @return {array} Return an array of img src's
	 */
	function convertImagesToSrc(imgs){
		var src = [];
		for (var i = 0; i < imgs.length; i++) {

			/** If the img is an object (img) get the src  */
			if(typeof imgs[i]  == 'object'){
				src.push(imgs[i].src);
			}
		};

		/** If the src array is null return the original imgs array */
		return src.length ? src : imgs;
	}

	/**
	 * Sort images after the originally order
	 * @config {array} arr A temporally array for sorting images
	 */
	function sortImages(){
		var arr = [];
		/**
		 * Create a double loop
		 * And match the order of the srcs array
		 */
		for (var i = 0; i < srcs.length; i++) {
			for (var j = 0; j < imgs.length; j++) {
				var str = imgs[j].src.toString();
				var reg = new RegExp(srcs[i])
				/** If srcs matches the imgs add it the the new array */
				if(str.match(reg)) arr.push(imgs[j]);
			};
		};

		/** Override imgs array with the new sorted arr */
		imgs = arr;
	}

	/**
	 * Public methods
	 * @public {function}
	 */
	self.load = load;

	/**
	 * @return {object} Public methods
	 */
	return self;
}

/** @export */
module.exports = Imagesloader;
},{"stupid-deferred":5,"stupid-imageloader":7}],5:[function(require,module,exports){
arguments[4][1][0].apply(exports,arguments)
},{"dup":1,"stupid-event":6}],6:[function(require,module,exports){
arguments[4][2][0].apply(exports,arguments)
},{"dup":2}],7:[function(require,module,exports){
var Deferred = require('stupid-deferred');

/**
 * Image loader
 * @constructor
 */
function Imageloader(opts){
	/**
     * @define {object} Collection of public methods.
     */
    var self = {};

    /**
     * @define {object} Options for the constructor 
     */
    var opts = opts || {};

    /**
     * @define {object} Cache for loaded images
     */
	var cache = {};

	/**
	 * Loading image
	 * @example imageload.load(src).success( // Do Something ).error( //Do something );
	 * @param {string} src Source of the image that should be loaded
	 * @config {object} def Deferred object to handle callbacks
	 * @return {object} Returns a promise
	 */
	function load(src){
		var def = Deferred();

		/**
		 * If image if cache returns the loaded image.
		 */
		if(cache[src]){
			/** resolve promise with cache image */
			def.resolve(cache[src], 'cached image');
		}else{
			/**
			 * Create new image
			 * Setup listeners for the image,
			 * and then set source.
			 */
			var img = new Image();
		    img.onload = function() {
		    	/** Cache image */
		        cache[src] = img;
		        /** Resolve promise */
		        def.resolve(img);
		    }
		    img.onerror = function(){
		    	def.reject('ERROR: ' + src);
		    }
		    img.src = src;
		}
		/**
		 * @return {object} Return promise
		 */
	    return def.promise;
	}

	/**
	 * Public methods
	 * @public {function}
	 */
	self.load = load;

	/**
	 * @return {object} Public object
	 */
	return self; 
}

/** @export */
module.exports = Imageloader; 
},{"stupid-deferred":5}],8:[function(require,module,exports){
/**
 * Call controller
 */
var callctrl = {
	/**
	 * Once (call a function once)
	 * @example once.trigger(); once.reset();
	 * @param {function} callback The callback
	 * @config {boolean} bool Boolean to control actions
	 * @return {object} Returns a object to trigger callback
	 */
	once: function once(callback){
		var bool = false;
		return{
			trigger:function(){
				if(bool) return;
				bool = true;
				callback();
			},
			reset:function(){
				bool = false;
			}	
		}
	},

	/**
	 * Shift (callbackA can only be called once, until callbackB has been called)
	 * @example shift.alpha(); shift.beta();
	 * @param {function} callbackA The callback
	 * @param {function} callbackB The callback
	 * @config {boolean} bool Boolean to control actions
	 * @return {object} Returns a object to trigger callbacks
	 */
	shift: function shift(callbackA, callbackB){
		var bool = false;
		var callbackA = callbackA || function(){};
		var callbackB = callbackB || function(){};
		return {
			alpha:function() {
				if(bool) return;
				bool = true;
				callbackA();
			},
			beta:function() {
				if(!bool) return;
				bool = false;
				callbackB();
			}
		}
	},

	/**
	 * Toggle (toggle between callbackA and callbackB)
	 * @example toggle.trigger(); toggle.reset();
	 * @param {function} callbackA The callback
	 * @param {function} callbackB The callback
	 * @config {boolean} bool Boolean to control actions
	 * @return {object} Returns a object to trigger callbacks
	 */
	toggle: function toggle(callbackA, callbackB){
		var bool = true;
		return {
			trigger: function() {
				if(bool){
		 			callbackA();
		 		}else{
		 			callbackB();
		 		}
	 			bool = !bool;
			},
			reset:function(){
				bool = true;	
			}
		}
	}
}

/** @export */
module.exports = callctrl;

},{}],9:[function(require,module,exports){
/**
 * @fileoverview Tick RAF controller
 * @author david@stupid-studio.com (David Adalberth Andersen)
 */

var Callctrl = require('stupid-callctrl');
/**
 * Deferred
 * @constructor
 * @param {object} opts Options for the constructor
 */
function Tick(opts) {
    /**
     * @define {object} Collection of public methods.
     */
    var self = {};

    /**
     * @define {object} options for the constructor 
     */
    var opts = opts || {};

    /**
     * @define {array} Collection of function that should be called on every RAF
     */
    var collection = [];

    /**
     * @define {function} requestAnimationFrame variable
     */
    var raf;

    /**
     * @define {number} Holds the current time every tick
     */
    var now;

    /**
     * @define {number} Holds the last time of every tick
     */
    var then = Date.now();

    /**
     * @define {number} Holds the difference bwteen now and then
     */
    var delta;

    /**
     * @define {number} Frames pr second (defaults to 60fps)
     */
    var fps = opts.fps || 60;

    /**
     * @define {boolean} Should stop when collection is empty
     */
    var autoPlayStop = opts.autoPlayStop || false;

    /**
     * @define {number} Converting fps to miliseconds
     */
    var interval = 1000/fps;

    /**
     * @define {boolean} Control is the loop should run
     */
    var isStopped = false;

    /**
     * @define {object} Create a once callback
     */
    var startOnce = Callctrl.once(function(){
        start();
    });

    /**
     * Renders update function at fps giving above
     * @param {type} varname description
     * @config {number} now Set the current time
     * @config {number} delta Calculates the difference between now and then
     */
    function render() {
        if (isStopped) return;

        now = Date.now();
        delta = now - then;
        /**
         * If the difference between now and then is bigger than fps (miliseconds) draw collection.
         */
        if (delta >= interval) {
            /** calculates new then time */
            then = now - (delta % interval);
            /** run updates */
            update();
        }

        /** Runs requestAnimationFrame for continues loop */
        raf = requestAnimationFrame(render);
    }

    /** Update run all the callbacks stored in collection */
    function update(){
        for (var i = 0; i < collection.length; i++) {
            collection[i]();
        };
    }

    /** Stars the render loop */
    function start(){
        isStopped = false;
        render();
    }

    /** Stops the render loop */
    function stop(){
        isStopped = true;
        if(raf) cancelAnimationFrame(raf);
        startOnce.reset();
    }

    /** Checks if Tick should stop or start if collection is empty */
    function shouldPlayOrPause() {
        if(autoPlayStop){
            if(collection.length){
                start();
            }else{
                stop();
            }
        }else{
            startOnce.trigger();
        }
    }

    /** Adds new callback, but checks if its already added */
    function add(callback) {
        var index = collection.indexOf(callback);
        if (index === -1){
            collection.push(callback);
            shouldPlayOrPause();
        }
    }

    /** Removes callback if its in the collection array */
    function remove(callback) {
        var index = collection.indexOf(callback);
        if (index != -1){
            collection.splice(index, 1);
            shouldPlayOrPause();
        }
    }

    /**
     * Public methos
     * @public {function}
     */
    self.add = add;
    self.remove = remove;
    self.start = start;
    self.stop = stop;

    /**
     * @return {object} Returns public methods
     */
    return self;
}

/** @export */
module.exports = Tick;
},{"stupid-callctrl":8}],10:[function(require,module,exports){
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
	 * @define {boolean} Should sprite loop
	 */
	var isLoopingBOOL = opts.loop === undefined ? true : opts.loop;

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
			/** Find image frames */
			var imageFrames = img.height / frameHeight;
			/** Loop thorugh image frames */
			for (var u = 0; u < imageFrames; u++) {
				timeline.push({
					image: img,
					offset: ((frameHeight * endFrame) % img.height) * -1 // Calculate images offset
				});
				/** Update endFrame count */
				endFrame++;
			};
		};
	}

	/**
	 * Play sprite
	 * @example sprite.play()
	 */
	function play(_frame){
		/** Set frame if set */
		if(_frame) frame = _frame - 1;

		/** set isPlaying to true */
		isPlayingBOOL = true;

		/** Add to tick object */
		tick.add(update);

		/** Trigger event */
		event.trigger('started');
	}

	/**
	 * Pause sprite
	 * @example sprite.pause()
	 */
	function pause(_frame){
		/** Set frame if set */
		if(_frame) frame = _frame;

		/** set isPlaying to false */
		isPlayingBOOL = false;

		/** Remove object from tick */
		tick.remove(update);

		/** Draw */
		clear();
		draw();

		/** Trigger event */
		event.trigger('paused');
	}

	/**
	 * Stop sprite
	 * @example sprite.stop()
	 */
	function stop(_frame){
		/** Pause */
		frame = _frame ? _frame : 0;
		pause(_frame);
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

		event.trigger('update', frame);
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
			if(!isLoopingBOOL) pause();
			event.trigger('ended');
		}
	}

	function forward(){
		frame++;
		frame = frame >= endFrame ? 0 : frame;	
		if(frame === endFrame - 1){
			if(!isLoopingBOOL) pause();
			event.trigger('ended');
		}
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
	 * Get reverse bool
	 * @example sprite.getReverse()
	 * @return {boolean} isReverseBOOL
	 */
	function getReverse(){
		return isReverseBOOL;
	}

	/**
	 * Get loop bool
	 * @example sprite.getLoop()
	 * @return {boolean} isLoopingBOOL
	 */
	function getLoop(){
		return isLoopingBOOL;
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
			isLoopingBOOL = _bool;
		}else{
			isLoopingBOOL = !isLoopingBOOL;
		}
	}

	/**
	 * hasLoaded
	 * @example sprite.hasLoaded()
	 */
	function hasLoaded(){
		return Boolean(images);
	}

	/*
	* Public
	*/

	self.load = load;
	self.play = play;	
	self.pause = pause;
	self.stop = stop;	

	self.reverse = reverse;
	self.getReverse = getReverse;

	self.loop = loop;
	self.getLoop = getLoop;

	self.isPlaying = isPlaying;
	self.getFrame = getFrame;
	self.getEndFrame = getEndFrame;

	self.hasLoaded = hasLoaded;
	
	self.on = event.on;

	return self;
}

module.exports = Sprite;
},{"stupid-deferred":1,"stupid-event":3,"stupid-imagesloader":4}],11:[function(require,module,exports){
var Tick = require('stupid-tick');
var Sprite = require('../../sprite');
var fps = 6;
var tick = Tick({fps:fps}); 

document.addEventListener("DOMContentLoaded", function(event) {
	
	sprite1();  

});

function sprite1(){
	
	var canvasHTML = document.createElement('canvas');
	document.body.appendChild(canvasHTML);

	var images = [
		'images/test_500_01.png',
		'images/test_500_02.png',
		'images/test_500_03.png',
		'images/test_500_04.png',
		'images/test_500_05.png',
	];

	var sprite = Sprite({
		tick: tick, 
		canvas: canvasHTML,
	});
	
	console.log('hasLoaded', sprite.hasLoaded());

	sprite
	.load(images)
	.success(function(){
		sprite.play();
		console.log('hasLoaded', sprite.hasLoaded()); 
	});

	sprite.on('ended', function(){
		console.log('Ended');
	});

	sprite.on('update', function(_frame){
		console.log('Update', _frame, sprite.getEndFrame(), sprite.getReverse(), sprite.getLoop());
	});

	window.sprite = sprite;
}
},{"../../sprite":10,"stupid-tick":9}]},{},[11]);
