var Iterator = require('stupid-iterator');
var Imagesloader = require('stupid-imagesloader');
var Deferred = require('stupid-deferred'); 

function Sprite(opts){
 	var self = {};
	var opts = opts || {};
	var canvas = opts.canvas;
	var tick = opts.tick;
	var loop = opts.loop === undefined ? true : opts.loop;
	var ctx = canvas.getContext('2d');
	var imagesLoader = Imagesloader();

	var images;
	var offset = opts.offset;
	var frame = 0;
	var current;
	var prev;
	var iterator;
	var isPlayingBOOL = false;

	/*
	* Private
	*/

	function init(){
		
	}

	function load(_imgsArray){
		var def = Deferred();

		imagesLoader.load(_imgsArray).success(function(_imgs){

			images = _imgs;
			
			iterator = Iterator.create(images[0], images);
			current = images[0];

			canvas.width = images[0].width;
			canvas.height = images[0].width;

			if(!offset) offset = images[0].width;

			def.resolve();
		});

		return def.promise;
	}

	function play(_frame){
		tick.add(update);
		isPlayingBOOL = true;
	}

	function pause(){
		tick.remove(update);
		isPlayingBOOL = false;
	}

	function playFrom(_frame){
		var index = _frame * offset;
		var offset = 0;
		for (var i = 0; i < images.length; i++) {
			offset += images[i].height;
			if(index < offset){
				 current = images[i];
				 frame = index % current.height;
				 break;
			}
		};
		tick.add(update);
		isPlayingBOOL = true;
	}


	function reset(){
		current = images[0];
		prev = false;
		frame = 0;
	}

	function stop(){
		pause();
		reset()
		update();
	}

	function update(){
		clear();
		draw();
	}

	function clear(){
		ctx.clearRect(0, 0, canvas.width, canvas.height);
	}

	function draw(){
		ctx.drawImage(current, 0, frame);

		frame -= offset;
		frame %= current.height;
		if(frame === 0) current = iterator.next(current);

		if(!Iterator.nextOrFalse(prev, images) 
		&& !Iterator.prevOrFalse(current, images)
		&& frame === 0){
			if(!loop) pause();
		}

		prev = current;
	}

	function isPlaying(){
		return isPlayingBOOL;
	}

	/*
	* Public
	*/

	self.load = load;
	self.init = init;
	self.play = play;	
	self.playFrom = playFrom;
	self.pause = pause;
	self.stop = stop;	
	self.reset = reset;	
	self.isPlaying = isPlaying;

	return self;
}

module.exports = Sprite;