var test = require('tape');
var Tick = require('stupid-tick');
var tick = Tick(); 
var Sprite = require('../sprite');

test('Loading images', function(t){
	t.plan(1);
	t.timeoutAfter(2000);

	var canvas = document.createElement('canvas');
	var images = [
		'http://moves.stupid-studio.com/static/images/sprite/bjarne_01.png',
		// 'http://moves.stupid-studio.com/static/images/sprite/bjarne_02.png',
		// 'http://moves.stupid-studio.com/static/images/sprite/bjarne_03.png',
		// 'http://moves.stupid-studio.com/static/images/sprite/bjarne_04.png',
	];

	var sprite = Sprite({
		tick:tick, 
		canvas: canvas
	});

	sprite
	.load(images)
	.success(function(){
		t.pass('success');
	}).error(function(){
		t.fail('error');
	});
});

test('Is playing', function(t){
	t.plan(2);
	t.timeoutAfter(2000);

	var canvas = document.createElement('canvas');
	var images = [
		'http://moves.stupid-studio.com/static/images/sprite/bjarne_01.png',
		// 'http://moves.stupid-studio.com/static/images/sprite/bjarne_02.png',
		// 'http://moves.stupid-studio.com/static/images/sprite/bjarne_03.png',
		// 'http://moves.stupid-studio.com/static/images/sprite/bjarne_04.png',
	];

	var sprite = Sprite({
		tick:tick, 
		canvas: canvas
	});

	t.false(sprite.isPlaying());

	sprite
	.load(images)
	.success(function(){
		sprite.play();
		t.true(sprite.isPlaying());
	});
});

test('Is looping', function(t){
	t.plan(2);
	var count = 0;
	var canvas = document.createElement('canvas');
	var images = [
		'http://moves.stupid-studio.com/static/images/sprite/bjarne_01.png',
		// 'http://moves.stupid-studio.com/static/images/sprite/bjarne_02.png',
		// 'http://moves.stupid-studio.com/static/images/sprite/bjarne_03.png',
		// 'http://moves.stupid-studio.com/static/images/sprite/bjarne_04.png',
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
		t.pass();
		count++;
		if(count === 2) sprite.pause();	
	});
});

test('Not looping', function(t){
	t.plan(1);
	var count = 0;
	var canvas = document.createElement('canvas');
	var images = [
		'http://moves.stupid-studio.com/static/images/sprite/bjarne_01.png',
		// 'http://moves.stupid-studio.com/static/images/sprite/bjarne_02.png',
		// 'http://moves.stupid-studio.com/static/images/sprite/bjarne_03.png',
		// 'http://moves.stupid-studio.com/static/images/sprite/bjarne_04.png',
	];

	var sprite = Sprite({
		tick:tick, 
		canvas: canvas,
		loop:false
	});

	sprite
	.load(images)
	.success(function(){
		sprite.play();
	});

	sprite.on('ended', function(){
		count++;
	});

	setTimeout(function(){
		t.equal(count, 1);
	}, 2000)
});