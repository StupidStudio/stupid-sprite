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