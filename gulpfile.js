var gulp = 			require('gulp');
var livereload = 	require('gulp-livereload');
var source = 		require('vinyl-source-stream');
var buffer = 		require('vinyl-buffer');
var watchify = 		require('watchify');
var browserify = 	require('browserify');


/**
 * @define {object} paths for building
 */
var settings = {
	build: './dist',
	source: './src'
};

var liveTestSettings = {
	build: './test/live/public',
	source: './test/live'
};
/*
 * Bundler
 * --------------------------------------------------
 */
var bundler = watchify(browserify(liveTestSettings.source + '/index.js'));

/*
 * JS
 * --------------------------------------------------
 */
gulp.task('live-test', function(){
	return bundler.bundle()
	.on('error', function(err){ console.log(err.message); this.emit('end');})
	.pipe(source('bundle.js'))
	.pipe(buffer())
	.pipe(gulp.dest(liveTestSettings.build + '/js'))
	.pipe(livereload());
});

/*
 * Watch
 * --------------------------------------------------
 */
gulp.task('watch', function() {
	livereload.listen();
	gulp.watch(['./*.js', './test/live/*.js'], ['live-test']); 
});

/*
 * Default
 * --------------------------------------------------
 */
gulp.task('dev', ['live-test']);
gulp.task('default', ['watch', 'dev']);
