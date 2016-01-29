var tick = require('../tick24').getInstance({fps:24});
var Sprite = require('../../sprite');
var Callctrl = require('stupid-callctrl');

document.addEventListener("DOMContentLoaded", function(event) {
	hamburgerSprite();
	bjarneSprite();
});

function hamburgerSprite(){
	var menu = document.querySelector('.menu');
	var canvas = document.querySelector('.menu-canvas');
	var images = [
		'images/hamburger_01_1_minified.png'
	];
	var sprite = Sprite({
		tick:tick, 
		canvas: canvas,
		loop:false
	});
	

	var toggle = Callctrl.toggle(function(){
		sprite.reverse(false);
		sprite.play();
	}, function(){
		sprite.reverse(true);
		if(sprite.getFrame() === 0) sprite.playFrom(sprite.getEndFrame());
	});

	sprite
	.load(images)
	.success(function(){
		sprite.stop();
	});

	menu.addEventListener('click', function handler(e){
		e.preventDefault();
		toggle.trigger();
	}); 
	
	sprite.on('update', function(_frame, _reversed){
		// console.log(_frame, _reversed);
	});	
}

function bjarneSprite(){
	var canvas = document.querySelector('.bjarne-canvas');
	var images = [
		'images/bjarne_01.png',
		'images/bjarne_02.png',
		'images/bjarne_03.png',
		'images/bjarne_04.png',
	];

	var sprite = Sprite({
		tick:tick, 
		canvas: canvas
	});
	
	sprite
	.load(images)
	.success(function(){
		sprite.play();
	});

	sprite.on('ended', function(){
		console.log("Sprite -> End");
		sprite.reverse();
	});

	sprite.on('update', function(_frame, _reversed){
		console.log(_frame, _reversed, sprite.getEndFrame());
	});
	window.bjarneSprite = sprite;
}