var test = require('tape');
var Imagesloader = require('../imagesloader');

var img1 = "http://www.google.com/logos/doodles/2015/teachers-day-2015-turkey-4703287659986944.2-hp2x.gif";
var img2 = "http://www.google.com/logos/doodles/2015/argentina-elections-2015-second-round-5641816198086656-hp2x.png";
var img3 = "http://www.google.com/logos/doodles/2015/fathers-day-2015-se-is-no-fi-ee-4876427472142336-hp2x.gif";
var img4 = "http://www.google.com/logos/doodles/2015/childrens-day-2015-south-africa-4835971950444544.2-hp2x.jpg";
var img5 = "http://www.google.com/logos/doodles/2015/german-reunification-day-2015-5400661768273920-hp2x.jpg";


test('All images loaded and notified', function(t){
	t.plan(6);
	var imagesloader = Imagesloader();

	imagesloader
	.load([img1,img2,img3,img4,img5])
	.success(function(images){
		t.pass('success');
	})
	.error(function(msg){
		t.fail();
	})
	.notify(function(msg){
		t.pass('notifed');
	});
});

test('Should notify and throw error (because image doesn\'t exist)', function(t){
	t.plan(5);
	var imagesloader = Imagesloader();

	imagesloader
	.load([img1,img2,img3,img4,'fakeimage.jpg'])
	.success(function(images){
		t.fail();
	})
	.error(function(msg){
		t.pass('error');
	})
	.notify(function(msg){
		t.pass('notifed');
	});
});

test('Images should be in same order after load', function(t){
	t.plan(5);
	var imagesloader = Imagesloader();
	var arr = [img1,img2,img3,img4,img5];
	imagesloader
	.load(arr)
	.success(function(images){
		for (var i = 0; i < images.length; i++) {
			t.equal(images[i].src, arr[i]);
		};
	})
});