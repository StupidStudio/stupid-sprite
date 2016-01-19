# Stupid Sprite

A simple sprite lib for animating sprites. 

All sprites need to be stacked vertically. (Remember that some devices/browsers dont support large images).

## Create

```javascript
// Import sprite & tick
var Sprite = require('stupid-sprite');
var Tick = require('stupid-tick');

// Create tick
var tick = Tick({fps:24});

// Select canvas & images
var canvas = document.querySelector('canvas');
var images = [
	'image_01.png',
	'image_02.png',
	'image_03.png',
	'image_04.png',
];

// Create sprite
var sprite = Sprite({
	tick:tick, 
	canvas: canvas
});

// Load images
sprite
.load(images)
.success(function(){
	// Play sprite when images is loaded
	sprite.play();
});
	
```

## Options

```javascript
var sprite = Sprite({
	tick:tick, 
	canvas: canvas,
	loop: false // Sprite doesn't loop
});
```

## Events

```javascript
sprite.on('ended', function(){
	// Sprite has looped/ended
});
```

## Methods

```javascript
sprite.play();
sprite.pause();
sprite.stop();

sprite.loop() // Toogle loop
sprite.reverse() // Reverses direction

sprite.isPlaying() // Tells if sprite is playing [boolean]

// Plays from specific frame (image)
sprite.playFrom(_frame);
```
