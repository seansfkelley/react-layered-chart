import gulp from 'gulp';
import browserify from 'browserify';
import watchify from 'watchify';
import notify from 'gulp-notify';
import sourceStream from 'vinyl-source-stream';
import buffer from 'vinyl-buffer';
import sourcemaps from 'gulp-sourcemaps';
import filter from 'gulp-filter';
import livereload from 'gulp-livereload';
import rename from 'gulp-rename';
import stylus from 'gulp-stylus';
import concat from 'gulp-concat';

function buildScripts(watch = false, dieOnError = false) {
  let bundler = browserify('./lib/index.jsx', {
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
      .pipe(sourceStream('index.js'))
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
      sound   : 'Glass'
    }))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./dist'))
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
