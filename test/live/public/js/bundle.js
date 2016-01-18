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
},{"stupid-deferred":4,"stupid-imageloader":6}],4:[function(require,module,exports){
arguments[4][1][0].apply(exports,arguments)
},{"dup":1,"stupid-event":5}],5:[function(require,module,exports){
arguments[4][2][0].apply(exports,arguments)
},{"dup":2}],6:[function(require,module,exports){
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
},{"stupid-deferred":4}],7:[function(require,module,exports){
/**
 * Iterator iterates over a collection
 * @example var current = iterator.next(current, collection);
 */
var iterator = {
	/**
	 * Get the next item in a collection
	 * @example var current = iterator.next(current, collection);
	 * @param {object} current The current item (thats in the collection)
	 * @param {array} collection The collection (that hold the current)
	 * @return {object} the new current
	 */
 	next: function(current, collection){
		return collection[ collection.indexOf(current) + 1 ] || collection[ 0 ];
	},

	/**
	 * Get the previous item in a collection
	 * @example var current = iterator.prev(current, collection);
	 * @param {object} current The current item (thats in the collection)
	 * @param {array} collection The collection (that hold the current)
	 * @return {object} the new current
	 */
	prev: function(current, collection){
		return collection[ collection.indexOf(current) - 1 ] || collection[ collection.length - 1 ];
	},

	/**
	 * Get the next item in a collection or return false
	 * @example var current = iterator.nextOrFalse(current, collection);
	 * @param {object} current The current item (thats in the collection)
	 * @param {array} collection The collection (that hold the current)
	 * @return {object | boolean} the new current or false
	 */
	nextOrFalse: function(current, collection){
		return collection[ collection.indexOf(current) + 1 ] || false;
	},

	/**
	 * Get the previous item in a collection or return false
	 * @example var current = iterator.prevOrFalse(current, collection);
	 * @param {object} current The current item (thats in the collection)
	 * @param {array} collection The collection (that hold the current)
	 * @return {object | boolean} the new current or false
	 */
	prevOrFalse: function(current, collection){
		return collection[ collection.indexOf(current) - 1 ] || false;
	},

	/**
	 * Check if item is the first in the collection
	 * @example var current = iterator.isFirst(current, collection);
	 * @param {object} current The current item (thats in the collection)
	 * @param {array} collection The collection (that hold the current)
	 * @return {boolean}
	 */
	isFirst:function(current, collection){
		return Boolean(current === collection[ 0 ]);
	},

	/**
	 * Check if item is the last in the collection
	 * @example var current = iterator.isLast(current, collection);
	 * @param {object} current The current item (thats in the collection)
	 * @param {array} collection The collection (that hold the current)
	 * @return {boolean}
	 */
	isLast: function(current, collection){
		return Boolean(current === collection[ collection.length - 1 ]);
	},

	/**
	 * Add newObject to collection if its not already in it.
	 * @example iterator.add(newObject, collection);
	 * @param {object} newObject 
	 * @param {array} collection The collection
	 * @return {number} Return the location object have in array
	 */
	add: function(newObject, collection){
		var index = collection.indexOf(newObject);
		if (index === -1) collection.push(newObject);
	},

	/**
	 * Removes object from collection if its in it.
	 * @example iterator.remove(object, collection);
	 * @param {object} object 
	 * @param {array} collection The collection
	 * @return {number} Return the location object had in array
	 */
	remove: function(object, collection){
        var index = collection.indexOf(object);
        if (index != -1) collection.splice(index, 1);
	},

	/**
	 * Return an object with prefixed current and collection
	 * @example iterator.create(current, collection);
	 * @param {object} current The current item (thats in the collection)
	 * @param {array} collection The collection (that hold the current)
	 * @return {object} return new object that uses iterator
	 */
	create: function(current, collection){
		return {

			/**
			 * Get next in collection
			 * @return {object} The current object
			 */
			next: function(){
				current = iterator.next(current, collection);
				return current;
			},

			/**
			 * Get previous in collection
			 * @return {object} The current object
			 */
			prev: function(){
				current = iterator.prev(current, collection);
				return current;
			},

			/**
			 * Get previous or false (set current if not false)
			 * @return {object | boolean} The current object or false
			 */
			nextOrFalse: function(){
				var objectOrFalse = iterator.nextOrFalse(current, collection);
				current = objectOrFalse || current;
				return objectOrFalse;
			},

			/**
			 * Get next or false (set current if not false)
			 * @return {object | boolean} The current object or false
			 */
			prevOrFalse: function(){
				var objectOrFalse = iterator.prevOrFalse(current, collection);
				current = objectOrFalse || current;
				return objectOrFalse;
			},

			/**
			 * Is current first item in array
			 * @return {boolean} True / false
			 */
			isFirst: function(){
				return iterator.isFirst(current, collection);
			},

			/**
			 * Is current last item in array
			 * @return {boolean} True / false
			 */
			isLast: function(){
				return iterator.isLast(current, collection);
			},

			/**
			 * Add object to collection
			 * @return {object} The current object
			 */
			add: function(object){
				iterator.add(object, collection);
				return current;
			},

			/**
			 * Remove object from collection
			 * Set current to new object if current if removed
			 * @return {object} The current object
			 */
			remove: function(object){

				/**
				 * If object is current do something
				 */
				if(object === current){

					/**
					 * If current is first, set current to the next item
					 * Else set current to previous item
					 */
					if(iterator.isFirst(current, collection)){
						current = iterator.next(current, collection);	
					}else{
						current = iterator.prev(current, collection);
					}
				}

				/** Return object from collection */
				iterator.remove(object, collection);

				return current;
			},

			/**
			 * Set object to current
			 * @return {object} The current object
			 */
			set: function(object){
				current = object;
				return current;
			},

			/**
			 * Get the current object
			 * @return {object} The current object
			 */
			get: function(){
				return current;
			}
		};
	}
}

/** @export */
module.exports = iterator;
},{}],8:[function(require,module,exports){
/**
 * @fileoverview JS Singleton constructor
 * @author david@stupid-studio.com (David Adalberth Andersen)
 */

 /**
 * Singleton
 * @constructor
 * @param {function} moduleConstructor Passes the moduleConstructor
 */
function Singleton(moduleConstructor){
    /**
     * Returns a self-execution function that returns an object
     * @example var Module = Singleton(ModuleConstructor); var mod = Module.getInstance();
     * @config {object} instance An object that holds the module
     * @return {objcet} An object that returns the module via .getInstance()
     */
    return (function () {
        var instance;
        
        /**
         * Create the new module
         */
        function createInstance(opts) {
            var object = moduleConstructor(opts);
            return object;
        }
        
        /**
         * Return an objcet with .getInstance() that returns the module
         * @param {oject} opts Passes the option for the module
         * @config {object} instance If the instance is empty create new module, else return instance
         * @return {object} returns the module (instance)
         */
        return {
            getInstance: function (opts) {
                if (!instance) instance = createInstance(opts);
                return instance;
            }
        };
    })();
}

/** @export */
module.exports = Singleton;
},{}],9:[function(require,module,exports){
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

},{}],10:[function(require,module,exports){
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
},{"stupid-callctrl":9}],11:[function(require,module,exports){
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
},{"stupid-deferred":1,"stupid-imagesloader":3,"stupid-iterator":7}],12:[function(require,module,exports){
var tick = require('./tick24').getInstance({fps:24});
var Sprite = require('../../sprite');

document.addEventListener("DOMContentLoaded", function(event) {
	var canvas = document.querySelector('canvas');
	var images = [
		'images/david_01.png',
		'images/david_02.png',
		'images/david_03.png',
		'images/david_04.png',
	];
	var sprite = Sprite({
		tick:tick, 
		canvas: canvas,
		loop:true
	});

	sprite.load(images).success(function(){
		sprite.play();
		// setTimeout(function(){
		// 	sprite.pause();
		// }, 500);
		// setTimeout(function(){
		// 	sprite.play();
		// }, 1000);
	});

	
});
},{"../../sprite":11,"./tick24":13}],13:[function(require,module,exports){
var Singleton = require('stupid-singleton');
var Tick = require('stupid-tick');
module.exports = Singleton(Tick); 
},{"stupid-singleton":8,"stupid-tick":10}]},{},[12]);
