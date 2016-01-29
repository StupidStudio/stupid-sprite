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

sprite.on('update', function(_frame){
	// On every frame update.
});
```

## Methods

```javascript
sprite.play(Number); // Number is optional
sprite.pause(Number); // Number is optional
sprite.stop(Number); // Number is optional

sprite.isPlaying() // Tells if sprite is playing [Boolean]

sprite.loop(Boolean); // Toogle loop. Boolean is optional.
sprite.getLoop(); // Get loop Boolean.

sprite.reverse(Boolean) // Reverses direction. Boolean is optional.
sprite.getReverse(); // Get reverse Boolean

sprite.getFrame(); // Returns current frame [Number]
sprite.getEndFrame(); // Returns end/last frame [Number]
```
