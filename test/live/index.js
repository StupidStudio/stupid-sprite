var tick = require('./tick24').getInstance({fps:24});
var Sprite = require('../../sprite');

document.addEventListener("DOMContentLoaded", function(event) {
	var canvas = document.querySelector('canvas');
	var images = [
		'images/bjarne_01.png',
		'images/bjarne_02.png',
		'images/bjarne_03.png',
		'images/bjarne_04.png',
	];
	var sprite = Sprite({
		tick:tick, 
		canvas: canvas,
		loop:true
	});
	
	window.sprite = sprite;

	sprite.load(images).success(function(){
		sprite.play();
	});

	sprite.on('ended', function(){
		console.log("Sprite -> End");
	})

	
});