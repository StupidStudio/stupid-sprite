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