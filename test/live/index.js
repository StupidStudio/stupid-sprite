var Tick = require('stupid-tick');
var Sprite = require('../../sprite');
var fps = 25;
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
		// loop:false
	});

	sprite
	.load(images)
	.success(function(){
		sprite.play();
	});

	sprite.on('ended', function(){
		sprite.reverse();
		// sprite.pause();
		console.log('- - - - - E N D E D - - - - - ');
	});

	sprite.on('update', function(_frame){
		console.log(_frame, sprite.getEndFrame());
	});

	window.sprite = sprite;
}