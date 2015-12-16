const gulp = require('gulp');
const browserify = require('browserify');
const watchify = require('watchify');
const notify = require('gulp-notify');
const sourceStream = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const sourcemaps = require('gulp-sourcemaps');
const filter = require('gulp-filter');
const livereload = require('gulp-livereload');
const rename = require('gulp-rename');
const stylus = require('gulp-stylus');
const concat = require('gulp-concat');

function buildScripts(watch = false, dieOnError = false) {
  let bundler = browserify('./index.js', {
    extensions   : [ '.js', '.jsx' ],
    debug        : true,
    cache        : {},
    packageCache : {},
    fullPaths    : true,
    transform    : [ 'babelify' ]
  });

  if (watch) {
    bundler = watchify(bundler);
  }

  function rebundle() {
    const bundle = bundler.bundle();

    if (!dieOnError) {
      bundle.on('error', notify.onError({
        title : 'Browserify Error',
        sound : 'Sosumi'
      }));
    }

    return bundle
      .pipe(sourceStream('./index.js'))
      .pipe(buffer())
      .pipe(sourcemaps.init({ loadMaps : true}))
      .pipe(notify({
        title   : 'Finished compiling Javascript',
        message : '<%= file.relative %>',
      }))
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest('./dist'))
      .pipe(filter([ '*', '!*.map' ]))
      .pipe(livereload());
  }

  bundler.on('update', rebundle);
  rebundle();
}

function buildStyles() {
  gulp.src('./styles/**/*.styl')
    .pipe(sourcemaps.init({ loadMaps : true }))
    .pipe(stylus())
    .on('error', notify.onError({
      title : 'Stylus Error',
      sound : 'Sosumi'
    }))
    .pipe(concat('all-styles.css'))
    .pipe(notify({
      title   : 'Finished compiling CSS',
      message : '<%= file.relative %>',
      wait    : true,
      sound   : 'Glass'
    }))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./.dist'))
    .pipe(filter([ '*', '!*.map' ]))
    .pipe(livereload());
}

gulp.task('scripts', () => buildScripts(false, true));
gulp.task('styles', buildStyles);
gulp.task('watch', function() {
  livereload.listen();
  buildScripts(true, false);
  buildStyles();
  gulp.watch('./styles/**/*.styl', [ 'styles' ]);
});
gulp.task('dist', [ 'scripts', 'styles' ]);
gulp.task('default', [ 'watch' ]);
